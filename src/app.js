import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompress, constants as zlibConstants, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { createCache, createRateLimiter } from './cache.js';
import { createGeocoder, readLatLng } from './geo.js';
import { createHealthCenterIndex } from './healthCenters.js';
import { createProviderSearch } from './providers.js';
import { createRegions } from './regions.js';
import { createStateDirectory } from './stateResources.js';
import { createTaxonomy } from './taxonomy.js';
import { parseTelehealthQuery, searchTelehealth } from './telehealth.js';
import { InputError, RADII_MILES, parseTreatmentQuery, searchTreatment } from './findtreatment.js';
import { DATA_LOADERS, PUBLIC_DIR } from './data.js';

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

function clientKey(req, trustProxy) {
  if (trustProxy) {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
}

export function createApp({
  fetchImpl = fetch,
  trustProxy = false,
  rateLimit = { windowMs: 60_000, max: 120 },
  logger = console,
  upstream = {},
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
  const staticFiles = loadStatic(fileURLToPath(PUBLIC_DIR));
  // Fresh for 30 minutes, then kept 30 more only to answer if FindTreatment.gov
  // is down: never more than the hour the privacy page promises.
  const treatmentCache = createCache({ ttlMs: 30 * 60 * 1000, staleMs: 30 * 60 * 1000, maxEntries: 1000 });
  const inflight = new Map();
  const limiter = createRateLimiter(rateLimit);

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
  };

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

  function json(req, res, status, value) {
    send(req, res, status, Buffer.from(JSON.stringify(value)), {
      'Content-Type': MIME['.json'],
      // Responses describe a visitor's area; never let a shared cache keep them.
      'Cache-Control': 'no-store',
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

  async function handleApi(req, res, url) {
    if (!limiter.allow(clientKey(req, trustProxy))) {
      return json(req, res, 429, { error: 'Too many searches in a short time. Please wait a minute and try again.' });
    }
    const params = url.searchParams;
    try {
      switch (url.pathname) {
        case '/api/health':
          return json(req, res, 200, { ok: true });
        case '/api/meta':
          return json(req, res, 200, publicMeta);
        case '/api/geocode':
          return json(req, res, 200, { results: regions().annotate(geocoder().lookup(params.get('q')), params.get('q')) });
        case '/api/region': {
          // A ZIP, or coordinates (coarsened by readLocation). Never logged.
          let found;
          if (params.get('zip')) {
            found = regions().forZip(params.get('zip'));
          } else {
            const { lat, lng } = readLocation(params);
            found = regions().forPoint(lat, lng);
          }
          return json(req, res, 200, { region: found?.region ?? null, nearby: found?.nearby ?? [] });
        }
        case '/api/states':
          return json(req, res, 200, { states: stateDirectory().list(), sources: stateDirectory().sources });
        case '/api/state': {
          const resources = stateDirectory().get(params.get('code'));
          if (!resources) return json(req, res, 404, { error: 'Unknown state or territory' });
          return json(req, res, 200, resources);
        }
        case '/api/telehealth': {
          const query = parseTelehealthQuery(params, { taxonomy, anchorFor: regions().anchor });
          const result = await searchTelehealth(query, { taxonomy, fetchImpl, cache: treatmentCache });
          return json(req, res, 200, { ...result, source: 'SAMHSA FindTreatment.gov' });
        }
        case '/api/treatment': {
          const query = parseTreatmentQuery(params, taxonomy);
          const result = await searchTreatment(query, { taxonomy, fetchImpl, cache: treatmentCache, inflight, ...upstream });
          // Route only: never the query string, which holds a location.
          if (result.stale) logger.error(`[api] ${url.pathname} upstream failed; answered from cache`);
          return json(req, res, 200, { ...result, source: 'SAMHSA FindTreatment.gov' });
        }
        case '/api/health-centers': {
          const { lat, lng } = readLocation(params);
          const radiusMiles = Number(params.get('radius') ?? 25);
          if (!RADII_MILES.includes(radiusMiles)) throw new InputError(`radius must be one of ${RADII_MILES.join(', ')}`);
          return json(req, res, 200, {
            ...healthCenters().search({ lat, lng, radiusMiles }),
            source: 'HRSA Health Center Program',
            updated: publicMeta.healthCenters.updated,
          });
        }
        case '/api/providers':
          return json(req, res, 200, providers().search(params, readLocation(params)));
        default:
          return json(req, res, 404, { error: 'Not found' });
      }
    } catch (err) {
      if (err instanceof InputError) return json(req, res, 400, { error: err.message });
      // Log the route and failure only: never the query string, which holds a location.
      logger.error(`[api] ${url.pathname} failed: ${err.message}`);
      return json(req, res, 502, {
        error: 'The national treatment directory is not responding right now.',
        fallbackUrl: 'https://findtreatment.gov/',
        helpline: '1-800-662-4357',
      });
    }
  }

  return async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
      return res.end();
    }
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch {
      res.writeHead(400, SECURITY_HEADERS);
      return res.end();
    }
    if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
    return serveStatic(req, res, url.pathname);
  };
}
