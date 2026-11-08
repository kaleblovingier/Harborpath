import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompress, constants as zlibConstants, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { createCache, createCircuitBreaker, createRateLimiter } from './cache.js';
import { createGeocoder, readLatLng } from './geo.js';
import { createHealthCenterIndex } from './healthCenters.js';
import { createProviderSearch } from './providers.js';
import { createRegions, describeRegion, getBorderingStates } from './regions.js';
import { createStateDirectory } from './stateResources.js';
import { filterStatesByProtection, getJurisdictionSummary, getLegalProtections, LEGAL_DISCLAIMER } from './legalRegistry.js';
import { createTaxonomy } from './taxonomy.js';
import { parseTelehealthQuery, searchTelehealth } from './telehealth.js';
import { createVirtualProviders } from './virtualProviders.js';
import { InputError, UpstreamError, parseRadius, parseTreatmentQuery, searchTreatment } from './findtreatment.js';
import { DATA_LOADERS, PUBLIC_DIR } from './data.js';
import { createPrivacyLogger, sanitizeSearchParams } from './privacy.js';
import { createAnalyticsStore } from './analytics.js';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

// The geocoder reads at most 80 characters; anything far longer is not a place.
const MAX_GEOCODE_QUERY = 200;

// No third-party origins at all: no CDNs, fonts, analytics, or maps. Visiting a
// substance-use site is itself sensitive health information.
export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; " +
    "font-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Hosts with a CDN (e.g. Vercel) may serve public/ themselves and leave it out
// of the server bundle, so a missing directory is not an error.
//
// Only the bytes are read at startup (that fixes the set of servable paths).
// ETags and compressed copies are made the first time a file is requested.
function loadStatic(publicDir) {
  const files = new Map();
  if (!existsSync(publicDir)) return files;
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      const body = readFileSync(full);
      const type = MIME[path.extname(name).toLowerCase()] ?? 'application/octet-stream';
      const urlPath = '/' + path.relative(publicDir, full).split(path.sep).join('/');
      files.set(urlPath, new StaticFile(body, type));
    }
  };
  walk(publicDir);
  return files;
}

class StaticFile {
  constructor(body, type) {
    this.body = body;
    this.type = type;
    this.compressible = body.length > 1024 && /text|json|svg|javascript|manifest/.test(type);
    this.br = undefined; // undefined: not started; null: in progress
  }

  get etag() {
    return (this._etag ??= `"${createHash('sha1').update(this.body).digest('base64url').slice(0, 20)}"`);
  }

  get gz() {
    return this.compressible ? (this._gz ??= gzipSync(this.body, { level: 9 })) : null;
  }

  /**
   * The best encoding this client accepts. Brotli (about 15% smaller than
   * gzip here) is compressed at maximum quality on the thread pool, so the
   * first requests get gzip while it is prepared.
   */
  encode(accepted) {
    if (!this.compressible) return { body: this.body };
    if (accepted.has('br')) {
      if (this.br) return { body: this.br, encoding: 'br' };
      if (this.br === undefined) {
        this.br = null;
        brotliCompress(this.body, {
          params: {
            [zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY,
            [zlibConstants.BROTLI_PARAM_SIZE_HINT]: this.body.length,
          },
        }, (err, out) => { this.br = err ? undefined : out; });
      }
    }
    if (accepted.has('gzip')) return { body: this.gz, encoding: 'gzip' };
    return { body: this.body };
  }
}

/** Content codings the client accepts, ignoring any marked q=0. */
function acceptedEncodings(header) {
  const out = new Set();
  for (const part of String(header ?? '').toLowerCase().split(',')) {
    const [name, ...params] = part.split(';').map((s) => s.trim());
    if (name && !params.some((p) => /^q=0(\.0*)?$/.test(p))) out.add(name);
  }
  return out;
}

/**
 * The rate-limit key for a request.
 *
 * The leftmost X-Forwarded-For entries are whatever the client sent, so keying
 * on them lets anyone dodge the limit with a fake header. Each trusted proxy
 * appends the address it saw, so with `trustProxy` hops the client is the
 * entry that many places from the right (Vercel replaces the header with one
 * entry; one load balancer is 1 hop; a CDN in front of it makes 2).
 */
export function clientKey(req, trustProxy) {
  const hops = trustProxy === true ? 1 : Number.isInteger(trustProxy) && trustProxy > 0 ? trustProxy : 0;
  let addr = null;
  if (hops) {
    const raw = req.headers['x-forwarded-for'];
    const fwd = Array.isArray(raw) ? raw.join(',') : raw;
    if (typeof fwd === 'string') {
      const parts = fwd.split(',').map((s) => s.trim());
      addr = parts.length >= hops ? parts[parts.length - hops] || null : null;
    }
  }
  // The cap bounds the memory one forged entry can take in the limiter.
  return networkKey(addr ?? req.socket?.remoteAddress ?? 'unknown').slice(0, 64);
}

/**
 * IPv4 addresses key as themselves. IPv6 keys by /64: one subscriber usually
 * holds a whole /64, so keying on full addresses would hand each client 2^64
 * fresh keys.
 */
export function networkKey(addr) {
  let s = String(addr).trim().toLowerCase().replace(/%.*$/, '');
  const mapped = s.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return mapped[1];
  if (!s.includes(':')) return s;
  const halves = s.split('::');
  if (halves.length > 2) return s;
  const groups = (part) => (part ? part.split(':').flatMap((g) => (g.includes('.') ? ['0', '0'] : [g])) : []);
  const head = groups(halves[0]);
  const tail = halves.length === 2 ? groups(halves[1]) : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (fill < 0 || (halves.length === 1 && head.length !== 8)) return s;
  if (![...head, ...tail].every((g) => /^[0-9a-f]{1,4}$/.test(g))) return s;
  const full = [...head, ...Array(fill).fill('0'), ...tail];
  return `${full.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}

/**
 * How many proxies to trust, from the environment: TRUST_PROXY is the number
 * of proxies that append to X-Forwarded-For (1 to 99), or one on Vercel
 * (which always sets X-Forwarded-For). 0 means use the socket address and
 * ignore X-Forwarded-For entirely.
 */
export function trustProxyFromEnv(env = {}) {
  const v = String(env.TRUST_PROXY ?? '').trim();
  if (/^\d{1,2}$/.test(v) && Number(v) > 0) return Number(v);
  if (v === 'true') return 1;
  return env.VERCEL ? 1 : 0;
}

// Shown whenever the national directory cannot answer, so a visitor always has
// a way to reach help. Numbers only, never anything from the request.
export const UPSTREAM_FALLBACK = Object.freeze({
  fallbackUrl: 'https://findtreatment.gov/',
  helpline: '1-800-662-4357',
  alternatives: Object.freeze([
    Object.freeze({ name: 'SAMHSA National Helpline', phone: '1-800-662-4357', tel: '+18006624357', hours: '24/7, English and Spanish' }),
    Object.freeze({ name: '988 Suicide & Crisis Lifeline', phone: '988', tel: '988', hours: '24/7, call or text' }),
    Object.freeze({ name: 'Never Use Alone', phone: '1-800-484-3731', tel: '+18004843731', hours: '24/7' }),
  ]),
});

// ISO 8601, or null for a missing or unparseable date.
function isoDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Freshness of every bundled dataset, from data/meta.json. `sourceUpdated` is
 * when the publisher last changed the data (HTTP Last-Modified or the
 * dataset's own modified date); `builtAt` is when HarborPath last downloaded
 * it. Treatment listings are not bundled: they are searched live.
 */
export function buildFreshness(meta, { now = Date.now(), cacheMinutes = 60 } = {}) {
  const ageDays = (iso) => (iso ? Math.max(0, Math.floor((now - Date.parse(iso)) / 86_400_000)) : null);
  const datasets = {};
  for (const [key, src] of Object.entries(meta?.sources ?? {})) {
    if (!src || typeof src !== 'object') continue;
    const sourceUpdated = isoDate(src.lastModified) ?? isoDate(src.modified) ?? isoDate(src.fetchedAt);
    const builtAt = isoDate(src.builtAt);
    datasets[key] = {
      count: Number.isFinite(src.count) ? src.count : null,
      sourceUpdated,
      sourceAgeDays: ageDays(sourceUpdated),
      builtAt,
      updateCadence: typeof src.updateCadence === 'string' ? src.updateCadence : null,
    };
  }
  const directoryUpdated = isoDate(meta?.builtAt);
  return {
    directoryUpdated,
    directoryAgeDays: ageDays(directoryUpdated),
    datasets,
    treatment: {
      live: true,
      source: 'SAMHSA FindTreatment.gov',
      maxCacheMinutes: cacheMinutes,
    },
  };
}

export function createApp({
  fetchImpl = fetch,
  trustProxy = false,
  rateLimit = { windowMs: 60_000, max: 120 },
  logger = console,
  upstream = {},
  analytics = null,
} = {}) {
  const taxonomy = createTaxonomy(DATA_LOADERS.serviceCodes());
  const meta = DATA_LOADERS.meta();
  // The ZIP/place, region, state, health center, and provider tables are
  // parsed and indexed on first use, so a cold start that only serves
  // treatment searches or /api/meta skips them.
  const once = (build) => { let value; return () => (value ??= build()); };
  const zctaData = once(DATA_LOADERS.zcta);
  const healthCentersData = once(DATA_LOADERS.healthCenters);
  // The national place file stops at Puerto Rico; island-places adds Guam, the
  // U.S. Virgin Islands, American Samoa, and the Northern Mariana Islands.
  const geocoder = once(() => createGeocoder({
    zcta: zctaData(),
    places: DATA_LOADERS.places(),
    islandPlaces: DATA_LOADERS.islandPlaces(),
  }));
  const regions = once(() => createRegions({ zcta: zctaData(), zipStates: DATA_LOADERS.zipStates() }));
  const stateDirectory = once(() => createStateDirectory({
    agencies: DATA_LOADERS.stateAgencies(),
    medicaid: DATA_LOADERS.stateMedicaid(),
    healthCenters: healthCentersData(),
    meta,
  }));
  const healthCenters = once(() => createHealthCenterIndex(healthCentersData()));
  const providers = once(() => createProviderSearch({
    vaFacilities: DATA_LOADERS.vaFacilities(),
    ihsFacilities: DATA_LOADERS.ihsFacilities(),
    erHospitals: DATA_LOADERS.erHospitals(),
    ruralHealthClinics: DATA_LOADERS.ruralHealthClinics(),
    meta,
  }));
  const virtualProviders = once(() => createVirtualProviders(DATA_LOADERS.virtualProviders(), { logger }));
  const staticFiles = loadStatic(fileURLToPath(PUBLIC_DIR));
  // Fresh for 30 minutes, then kept 30 more only to answer if FindTreatment.gov
  // is down: never more than the hour the privacy page promises.
  const CACHE_FRESH_MS = 30 * 60 * 1000;
  const CACHE_STALE_MS = 30 * 60 * 1000;
  const treatmentCache = createCache({ ttlMs: CACHE_FRESH_MS, staleMs: CACHE_STALE_MS, maxEntries: 1000 });
  const inflight = new Map();
  const limiter = createRateLimiter(rateLimit);
  const safeLogger = createPrivacyLogger(logger);
  // Shared by treatment and telehealth searches: both call the same upstream.
  const breaker = upstream.breaker ?? createCircuitBreaker();
  const upstreamOptions = { fetchImpl, cache: treatmentCache, inflight, ...upstream, breaker };
  const analyticsStore = analytics ?? createAnalyticsStore({ adminKey: process.env.HARBORPATH_ADMIN_KEY });

  const srcMeta = (key) => ({
    count: meta.sources?.[key]?.count ?? null,
    updated: meta.sources?.[key]?.lastModified ?? meta.sources?.[key]?.fetchedAt ?? meta.sources?.[key]?.modified ?? null,
  });
  const publicMeta = {
    dataBuiltAt: meta.builtAt,
    healthCenters: srcMeta('healthCenters'),
    vaFacilities: srcMeta('vaFacilities'),
    ihsFacilities: srcMeta('ihsFacilities'),
    erHospitals: srcMeta('erHospitals'),
    ruralHealthClinics: srcMeta('ruralHealthClinics'),
    stateAgencies: srcMeta('stateAgencies'),
    stateMedicaid: srcMeta('stateMedicaid'),
    treatmentSource: 'SAMHSA FindTreatment.gov (live)',
    directoryUpdated: isoDate(meta.builtAt),
  };
  const freshness = () => buildFreshness(meta, { cacheMinutes: (CACHE_FRESH_MS + CACHE_STALE_MS) / 60_000 });

  function send(req, res, status, body, headers = {}) {
    const acceptsGzip = acceptedEncodings(req.headers['accept-encoding']).has('gzip');
    let payload = body;
    const out = { ...SECURITY_HEADERS, ...headers };
    if (acceptsGzip && payload.length > 1024 && /text|json|javascript|svg/.test(out['Content-Type'] ?? '')) {
      payload = gzipSync(payload);
      out['Content-Encoding'] = 'gzip';
    }
    out['Content-Length'] = payload.length;
    out.Vary = 'Accept-Encoding';
    res.writeHead(status, out);
    res.end(req.method === 'HEAD' ? undefined : payload);
  }

  function json(req, res, status, value, headers = {}) {
    send(req, res, status, Buffer.from(JSON.stringify(value)), {
      'Content-Type': MIME['.json'],
      // Responses describe a visitor's area; never let a shared cache keep them.
      'Cache-Control': 'no-store',
      ...headers,
    });
  }

  function serveStatic(req, res, pathname) {
    let file = staticFiles.get(pathname === '/' ? '/index.html' : pathname);
    const status = file ? 200 : 404;
    if (!file) file = staticFiles.get('/index.html');
    if (!file) {
      // No public/ directory in this deployment (a CDN serves it).
      res.writeHead(404, SECURITY_HEADERS);
      return res.end();
    }
    if (status === 200 && req.headers['if-none-match'] === file.etag) {
      res.writeHead(304, { ...SECURITY_HEADERS, ETag: file.etag });
      return res.end();
    }
    const { body, encoding } = file.encode(acceptedEncodings(req.headers['accept-encoding']));
    res.writeHead(status, {
      ...SECURITY_HEADERS,
      'Content-Type': file.type,
      'Content-Length': body.length,
      // No build step means no content-hashed file names, so every load
      // revalidates. A 304 costs one small round trip; mixing old and new
      // modules after a deploy would break the page.
      'Cache-Control': 'no-cache',
      ...(status === 200 ? { ETag: file.etag } : {}),
      Vary: 'Accept-Encoding',
      ...(encoding ? { 'Content-Encoding': encoding } : {}),
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  }

  function readLocation(params) {
    const loc = readLatLng(params);
    if (!loc) throw new InputError('A valid location is required.');
    return loc;
  }

  function readJsonBody(req, maxBytes = 2048) {
    return new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
        if (raw.length > maxBytes) {
          req.destroy();
          reject(new InputError('Payload exceeds maximum allowed size.'));
        }
      });
      req.on('end', () => {
        if (!raw.trim()) return resolve({});
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new InputError('Invalid JSON body.'));
        }
      });
      req.on('error', reject);
    });
  }

  async function handleApi(req, res, url) {
    // Liveness checks (container health probes) must never be rate limited.
    if (url.pathname === '/api/health') return json(req, res, 200, { ok: true });
    if (!limiter.allow(clientKey(req, trustProxy))) {
      return json(req, res, 429, { error: 'Too many searches in a short time. Please wait a minute and try again.' }, {
        'Retry-After': String(limiter.retryAfterSeconds()),
      });
    }
    const { cleanParams: params } = sanitizeSearchParams(url.pathname, url.searchParams);
    try {
      switch (url.pathname) {
        case '/api/meta':
          return json(req, res, 200, publicMeta);
        case '/api/freshness':
          return json(req, res, 200, freshness());
        case '/api/telemetry/event': {
          if (req.method !== 'POST') {
            res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'POST' });
            return res.end();
          }
          const eventData = await readJsonBody(req);
          analyticsStore.recordEvent(eventData);
          return json(req, res, 200, { ok: true });
        }
        case '/api/admin/metrics': {
          const authHeader = req.headers['authorization'];
          const bearerKey = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
          const key = bearerKey || params.get('key');
          const metrics = analyticsStore.getMetrics(key);
          if (!metrics.authorized) {
            return json(req, res, 401, { error: 'Unauthorized: Invalid operator access key' });
          }
          return json(req, res, 200, metrics);
        }
        case '/api/admin/metrics/reset': {
          if (req.method !== 'POST') {
            res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'POST' });
            return res.end();
          }
          const authHeader = req.headers['authorization'];
          const bearerKey = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
          const key = bearerKey || params.get('key');
          const result = analyticsStore.resetMetrics(key);
          if (!result.ok) {
            return json(req, res, 401, { error: 'Unauthorized: Invalid operator access key' });
          }
          return json(req, res, 200, result);
        }
        case '/api/geocode': {
          const q = params.get('q');
          if (q === null || !q.trim()) throw new InputError('Enter a ZIP code or a city and state.');
          if (q.length > MAX_GEOCODE_QUERY) throw new InputError('That search is too long. Enter a ZIP code or a city and state.');
          return json(req, res, 200, { results: regions().annotate(geocoder().lookup(q), q) });
        }
        case '/api/region': {
          // A ZIP, or coordinates (coarsened by readLocation). Never logged.
          let found;
          // forZip() answers anything that is not a ZIP with null, and the
          // response never repeats what was sent.
          if (params.get('zip')) {
            found = regions().forZip(params.get('zip'));
          } else {
            const { lat, lng } = readLocation(params);
            found = regions().forPoint(lat, lng);
          }
          const borderingStates = found?.borderingStates ?? (found?.region ? getBorderingStates(found.region.code).map((c) => {
            const r = describeRegion(c);
            return { code: c, name: r?.name ?? c };
          }) : []);
          return json(req, res, 200, { region: found?.region ?? null, nearby: found?.nearby ?? [], borderingStates });
        }
        case '/api/states':
          return json(req, res, 200, { states: stateDirectory().list(), sources: stateDirectory().sources });
        case '/api/state': {
          const code = String(params.get('code') ?? '').trim();
          if (!/^[A-Za-z]{2}$/.test(code)) throw new InputError('code must be a two-letter state or territory code');
          const resources = stateDirectory().get(code);
          if (!resources) return json(req, res, 404, { error: 'Unknown state or territory' });
          return json(req, res, 200, resources);
        }
        case '/api/legal': {
          const isFts = params.get('fts') === '1' || params.get('fts') === 'true';
          const isSsp = params.get('ssp') === '1' || params.get('ssp') === 'true';
          const isSummary = params.get('summary') === '1' || params.get('summary') === 'true';

          if (isSummary) {
            const rawState = params.get('state');
            const summary = rawState ? getJurisdictionSummary(rawState) : null;
            if (!summary) {
              return json(req, res, 400, { error: 'Invalid or missing state code' });
            }
            return json(req, res, 200, {
              ...summary,
              disclaimer: LEGAL_DISCLAIMER,
              reviewStatus: summary.reviewStatus,
            });
          }

          if (isFts || isSsp) {
            const filters = {};
            if (isFts) filters.ftsLegal = true;
            if (isSsp) filters.sspLegal = true;
            const records = filterStatesByProtection(filters).map((record) => ({
              ...record,
              disclaimer: LEGAL_DISCLAIMER,
              reviewStatus: record.reviewStatus,
            }));
            return json(req, res, 200, records);
          }

          if (params.has('state')) {
            const rawState = params.get('state');
            const protections = rawState ? getLegalProtections(rawState) : null;
            if (!protections) {
              return json(req, res, 400, { error: 'Invalid or missing state code' });
            }
            return json(req, res, 200, {
              ...protections,
              disclaimer: LEGAL_DISCLAIMER,
              reviewStatus: protections.reviewStatus,
            });
          }

          return json(req, res, 400, { error: 'Invalid or missing state code' });
        }
        case '/api/telehealth': {
          const query = parseTelehealthQuery(params, { taxonomy, anchorFor: regions().anchor });
          const result = await searchTelehealth(query, { taxonomy, ...upstreamOptions });
          // Route only: never the query string, which holds a location.
          if (result.stale) safeLogger.error(`[api] ${url.pathname} upstream failed; answered from cache`);
          return json(req, res, 200, { ...result, source: 'SAMHSA FindTreatment.gov' });
        }
        case '/api/treatment': {
          const query = parseTreatmentQuery(params, taxonomy);
          const result = await searchTreatment(query, { taxonomy, ...upstreamOptions });
          // Route only: never the query string, which holds a location.
          if (result.stale) safeLogger.error(`[api] ${url.pathname} upstream failed; answered from cache`);
          return json(req, res, 200, { ...result, source: 'SAMHSA FindTreatment.gov' });
        }
        case '/api/health-centers': {
          const { lat, lng } = readLocation(params);
          const radiusMiles = parseRadius(params);
          return json(req, res, 200, {
            ...healthCenters().search({ lat, lng, radiusMiles }),
            source: 'HRSA Health Center Program',
            updated: publicMeta.healthCenters.updated,
          });
        }
        case '/api/virtual-providers':
          return json(req, res, 200, virtualProviders().search(params));
        case '/api/providers':
          return json(req, res, 200, providers().search(params, readLocation(params)));
        case '/api/nearby-summary': {
          const { lat, lng } = readLocation(params);
          const radiusMiles = parseRadius(params);
          const hc = healthCenters().search({ lat, lng, radiusMiles });
          const prov = providers().summary({ lat, lng, radiusMiles });
          const reg = regions().forPoint(lat, lng);
          const stateInfo = reg?.region ? stateDirectory().get(reg.region.code) : null;
          const borderingStates = reg?.borderingStates ?? (reg?.region ? getBorderingStates(reg.region.code).map((c) => {
            const r = describeRegion(c);
            return { code: c, name: r?.name ?? c };
          }) : []);
          return json(req, res, 200, {
            radiusMiles,
            region: reg?.region ?? null,
            nearbyRegions: reg?.nearby ?? [],
            borderingStates,
            agency: stateInfo?.agency ?? null,
            medicaid: stateInfo?.medicaid ?? null,
            networks: {
              healthCenters: { count: hc.total, nearest: hc.results[0] ?? null },
              va: prov.va,
              ihs: prov.ihs,
              rhc: prov.rhc,
              er: prov.er,
            },
          });
        }
        default:
          return json(req, res, 404, { error: 'Not found' });
      }
    } catch (err) {
      if (err instanceof InputError) return json(req, res, 400, { error: err.message });
      // Log the route and a fixed failure code only: never the query string
      // (which holds a location), the upstream URL, or a raw error message.
      if (err instanceof UpstreamError) {
        safeLogger.error(`[api] ${url.pathname} upstream failed: ${err.code}${err.status ? ` ${err.status}` : ''}`);
        const retryAfter = breaker.retryAfterSeconds();
        const unavailable = err.code === 'circuit-open';
        return json(req, res, unavailable ? 503 : 502, {
          error: 'The national treatment directory is not responding right now.',
          reason: err.code,
          ...UPSTREAM_FALLBACK,
          ...(unavailable ? { retryAfterSeconds: retryAfter } : {}),
        }, unavailable ? { 'Retry-After': String(retryAfter) } : {});
      }
      safeLogger.error(`[api] ${url.pathname} failed: internal ${String(err?.name ?? 'Error').replace(/[^\w]/g, '').slice(0, 40)}`);
      return json(req, res, 500, {
        error: 'Something went wrong on our side. Please try again.',
        reason: 'internal',
        ...UPSTREAM_FALLBACK,
      });
    }
  }

  return async function handler(req, res) {
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch {
      res.writeHead(400, SECURITY_HEADERS);
      return res.end();
    }
    const isPostAllowed = req.method === 'POST' && (url.pathname === '/api/telemetry/event' || url.pathname === '/api/admin/metrics/reset');
    if (req.method !== 'GET' && req.method !== 'HEAD' && !isPostAllowed) {
      res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
      return res.end();
    }
    try {
      if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
      return serveStatic(req, res, url.pathname);
    } catch (err) {
      // Last resort: never let one request crash the process.
      safeLogger.error(`[http] ${url.pathname} failed: ${err?.message}`);
      if (!res.headersSent) res.writeHead(500, SECURITY_HEADERS);
      res.end();
    }
  };
}
