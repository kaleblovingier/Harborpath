import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { createCache, createRateLimiter } from './cache.js';
import { createGeocoder, readLatLng } from './geo.js';
import { createHealthCenterIndex } from './healthCenters.js';
import { createTaxonomy } from './taxonomy.js';
import { InputError, RADII_MILES, parseTreatmentQuery, searchTreatment } from './findtreatment.js';
import { loadData, PUBLIC_DIR } from './data.js';

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
function loadStatic(publicDir) {
  const files = new Map();
  if (!existsSync(publicDir)) return files;
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      const body = readFileSync(full);
      const ext = path.extname(name).toLowerCase();
      const type = MIME[ext] ?? 'application/octet-stream';
      const compressible = /text|json|svg|javascript|manifest/.test(type);
      const urlPath = '/' + path.relative(publicDir, full).split(path.sep).join('/');
      files.set(urlPath, {
        body,
        gz: compressible && body.length > 1024 ? gzipSync(body) : null,
        type,
        etag: `"${createHash('sha1').update(body).digest('base64url').slice(0, 20)}"`,
      });
    }
  };
  walk(publicDir);
  return files;
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
} = {}) {
  const data = loadData();
  const taxonomy = createTaxonomy(data.serviceCodes);
  const geocoder = createGeocoder({ zcta: data.zcta, places: data.places });
  const healthCenters = createHealthCenterIndex(data.healthCenters);
  const meta = data.meta;
  const staticFiles = loadStatic(fileURLToPath(PUBLIC_DIR));
  const treatmentCache = createCache({ ttlMs: 60 * 60 * 1000, maxEntries: 1000 });
  const limiter = createRateLimiter(rateLimit);

  const publicMeta = {
    dataBuiltAt: meta.builtAt,
    healthCenters: { count: healthCenters.count, updated: meta.sources?.healthCenters?.lastModified ?? null },
    treatmentSource: 'SAMHSA FindTreatment.gov (live)',
  };

  function send(req, res, status, body, headers = {}) {
    const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
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
    const file = staticFiles.get(pathname === '/' ? '/index.html' : pathname);
    if (!file) {
      const notFound = staticFiles.get('/index.html');
      return send(req, res, 404, notFound.body, { 'Content-Type': notFound.type, 'Cache-Control': 'no-cache' });
    }
    if (req.headers['if-none-match'] === file.etag) {
      res.writeHead(304, { ...SECURITY_HEADERS, ETag: file.etag });
      return res.end();
    }
    const useGz = file.gz && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
    const body = useGz ? file.gz : file.body;
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': file.type,
      'Content-Length': body.length,
      'Cache-Control': 'no-cache',
      ETag: file.etag,
      Vary: 'Accept-Encoding',
      ...(useGz ? { 'Content-Encoding': 'gzip' } : {}),
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
          return json(req, res, 200, { results: geocoder.lookup(params.get('q')) });
        case '/api/treatment': {
          const query = parseTreatmentQuery(params, taxonomy);
          const result = await searchTreatment(query, { taxonomy, fetchImpl, cache: treatmentCache });
          return json(req, res, 200, { ...result, source: 'SAMHSA FindTreatment.gov' });
        }
        case '/api/health-centers': {
          const { lat, lng } = readLocation(params);
          const radiusMiles = Number(params.get('radius') ?? 25);
          if (!RADII_MILES.includes(radiusMiles)) throw new InputError(`radius must be one of ${RADII_MILES.join(', ')}`);
          return json(req, res, 200, {
            ...healthCenters.search({ lat, lng, radiusMiles }),
            source: 'HRSA Health Center Program',
            updated: publicMeta.healthCenters.updated,
          });
        }
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
