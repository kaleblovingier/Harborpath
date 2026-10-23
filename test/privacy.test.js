// Server-side privacy and input-validation guarantees, endpoint by endpoint.
// Each test locks in one promise from docs/ARCHITECTURE.md. No live network:
// the FindTreatment.gov client gets a fake fetch.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clientKey, createApp, trustProxyFromEnv } from '../src/app.js';
import { createCircuitBreaker } from '../src/cache.js';
import { readJson } from '../src/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = readJson(path.join(here, 'fixtures', 'findtreatment-sample.json'));

// Every endpoint that accepts coordinates, with the other params it needs.
const COORD_ENDPOINTS = {
  '/api/region': '',
  '/api/treatment': 'radius=25',
  '/api/telehealth': 'state=WA',
  '/api/health-centers': 'radius=25',
  '/api/providers': 'type=va&radius=50',
  '/api/nearby-summary': 'radius=50',
};
// Precise inputs, and the 0.01-degree values they must be reduced to.
const PRECISE = { lat: '48.751934', lng: '-122.478712' };
const COARSE = { lat: '48.75', lng: '-122.48' };
const PRECISE_FRAGMENTS = /751934|478712|48\.7519|122\.4787/;

function startApp(options = {}) {
  const upstreamUrls = [];
  const logs = [];
  const capture = (...args) => logs.push(args.map(String).join(' '));
  const logger = { error: capture, warn: capture, info: capture, log: capture };
  let mode = 'ok';
  const fetchImpl = async (url) => {
    upstreamUrls.push(url);
    if (mode === 'down') throw new TypeError(`connect ECONNREFUSED for ${url}`);
    if (mode === 'echo') return new Response(`Invalid request ${url}`, { status: 200 });
    if (mode === 'hang') return new Promise(() => {});
    return new Response(JSON.stringify(sample), { status: 200 });
  };
  const handler = createApp({ fetchImpl, logger, rateLimit: { windowMs: 60_000, max: 10_000 }, ...options });
  const server = createServer(handler);
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
    base: `http://127.0.0.1:${server.address().port}`,
    upstreamUrls,
    logs,
    setMode: (m) => { mode = m; },
    close: () => new Promise((r) => server.close(r)),
  })));
}

let app;
before(async () => { app = await startApp({ upstream: { retries: 0, timeoutMs: 200 } }); });
after(() => app.close());

const get = (p) => fetch(`${app.base}${p}`);

test('every coordinate endpoint answers a precise location exactly as it answers the ~1 km rounded one', async () => {
  for (const [route, extra] of Object.entries(COORD_ENDPOINTS)) {
    const precise = await get(`${route}?${extra}&lat=${PRECISE.lat}&lng=${PRECISE.lng}`);
    const coarse = await get(`${route}?${extra}&lat=${COARSE.lat}&lng=${COARSE.lng}`);
    assert.equal(precise.status, 200, route);
    const a = await precise.text();
    assert.equal(a, await coarse.text(), `${route}: precise input must not change the answer`);
    assert.doesNotMatch(a, PRECISE_FRAGMENTS, `${route}: precise coordinates never echoed`);
  }
});

test('only coarsened coordinates ever reach FindTreatment.gov', async () => {
  app.upstreamUrls.length = 0;
  await get(`/api/treatment?lat=40.712776&lng=-74.005974&radius=10`);
  await get(`/api/telehealth?state=NY&lat=40.712776&lng=-74.005974`);
  assert.equal(app.upstreamUrls.length, 2);
  for (const u of app.upstreamUrls) {
    assert.equal(new URL(u).searchParams.get('sAddr'), '40.71,-74.01');
    assert.doesNotMatch(u, /712776|005974/);
  }
});

test('responses are never cacheable by shared caches and carry the security headers', async () => {
  for (const route of ['/api/meta', '/api/freshness', '/api/geocode?q=98225', '/api/nope', '/api/treatment?lat=x']) {
    const res = await get(route);
    assert.equal(res.headers.get('cache-control'), 'no-store', route);
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer', route);
    assert.match(res.headers.get('content-security-policy'), /default-src 'self'/, route);
  }
});

test('nothing location- or query-derived reaches the logs, even when the upstream echoes the query back', async () => {
  app.logs.length = 0;
  const marker = 'Zz9Marker';
  for (const mode of ['down', 'echo', 'hang']) {
    app.setMode(mode);
    // Distinct coordinates per mode so no cached copy answers.
    const lat = { down: '41.234567', echo: '42.345678', hang: '43.456789' }[mode];
    const t = await get(`/api/treatment?lat=${lat}&lng=-73.987654&radius=10&kind=sa`);
    assert.ok([502, 503].includes(t.status), `${mode}: ${t.status}`);
    const body = await t.text();
    assert.doesNotMatch(body, /\d+\.\d{3,}|sAddr|ECONNREFUSED/, `${mode}: error body is fixed text`);
    await get(`/api/telehealth?state=OR&lat=${lat}&lng=-120.987654`);
  }
  app.setMode('ok');
  await get(`/api/geocode?q=${marker}`);
  await get(`/api/region?zip=${marker}`);
  await get(`/api/state?code=${marker}`);
  assert.ok(app.logs.length >= 6, 'failures were logged');
  for (const line of app.logs) {
    assert.doesNotMatch(line, /\d+\.\d{2,}/, `no coordinates in: ${line}`);
    assert.doesNotMatch(line, /lat=|lng=|sAddr|findtreatment\.gov\/|\?|Zz9Marker|ECONNREFUSED/, `no query data in: ${line}`);
    assert.match(line, /^\[api\] \/api\/[a-z-]+ /, `route-only format: ${line}`);
  }
});

test('an unavailable upstream gives a clear 502 with phone alternatives, then a fast 503 once the breaker opens', async () => {
  const local = await startApp({ upstream: { retries: 0, breaker: createCircuitBreaker({ threshold: 2, cooldownMs: 30_000 }) } });
  try {
    local.setMode('down');
    for (let i = 0; i < 2; i++) {
      const res = await fetch(`${local.base}/api/treatment?lat=4${i}.5&lng=-100&radius=25`);
      assert.equal(res.status, 502);
      const body = await res.json();
      assert.equal(body.reason, 'network');
      assert.equal(body.fallbackUrl, 'https://findtreatment.gov/');
      assert.equal(body.helpline, '1-800-662-4357');
      assert.ok(body.alternatives.some((a) => a.phone === '988'));
      assert.ok(body.alternatives.every((a) => a.name && a.phone && a.tel));
    }
    const callsBefore = local.upstreamUrls.length;
    const started = Date.now();
    const res = await fetch(`${local.base}/api/treatment?lat=44.5&lng=-100&radius=25`);
    assert.equal(res.status, 503);
    assert.ok(Date.now() - started < 500, 'fails fast');
    assert.equal(local.upstreamUrls.length, callsBefore, 'no upstream call while the breaker is open');
    const retryAfter = Number(res.headers.get('retry-after'));
    assert.ok(retryAfter > 0 && retryAfter <= 30);
    const body = await res.json();
    assert.equal(body.reason, 'circuit-open');
    assert.equal(body.helpline, '1-800-662-4357');
    assert.equal(body.retryAfterSeconds, retryAfter);
  } finally {
    await local.close();
  }
});

test('a hanging upstream never hangs the API', async () => {
  const local = await startApp({ upstream: { retries: 0, timeoutMs: 100 } });
  try {
    local.setMode('hang');
    const started = Date.now();
    const res = await fetch(`${local.base}/api/treatment?lat=45.5&lng=-100&radius=25`);
    assert.equal(res.status, 502);
    assert.equal((await res.json()).reason, 'timeout');
    assert.ok(Date.now() - started < 2000);
  } finally {
    await local.close();
  }
});

test('malformed and out-of-range params get a 400 that never reflects the raw input', async () => {
  const evil = 'EVIL%3Cscript%3Ealert(1)%3C%2Fscript%3E';
  const evilText = /EVIL|<script|alert\(1\)/;
  const cases = [
    // Coordinates: missing, blank, non-numeric, hex, exponent, Infinity, out of range.
    ...Object.entries(COORD_ENDPOINTS).flatMap(([route, extra]) => [
      `${route}?${extra}&lat=${evil}&lng=-122`,
      `${route}?${extra}&lat=48&lng=${evil}`,
      `${route}?${extra}&lat=0x30&lng=-122`,
      `${route}?${extra}&lat=4.8e1&lng=-122`,
      `${route}?${extra}&lat=Infinity&lng=-122`,
      `${route}?${extra}&lat=91&lng=-122`,
      `${route}?${extra}&lat=48&lng=-180.5`,
      `${route}?${extra}&lat=&lng=-122`,
      ...(route === '/api/region' || route === '/api/telehealth' ? [] : [`${route}?${extra}`]),
    ]),
    // Radius: not an allowed value, or not a plain integer.
    ...['/api/treatment', '/api/health-centers', '/api/nearby-summary', '/api/providers?type=va&x=1'].flatMap((r) => {
      const sep = r.includes('?') ? '&' : '?';
      return [`${r}${sep}lat=48&lng=-122&radius=${evil}`, `${r}${sep}lat=48&lng=-122&radius=13`,
        `${r}${sep}lat=48&lng=-122&radius=25.0`, `${r}${sep}lat=48&lng=-122&radius=0x19`, `${r}${sep}lat=48&lng=-122&radius=-25`];
    }),
    // Treatment and telehealth specifics.
    `/api/treatment?lat=48&lng=-122&kind=${evil}`,
    `/api/treatment?lat=48&lng=-122&page=${evil}`,
    '/api/treatment?lat=48&lng=-122&page=0',
    '/api/treatment?lat=48&lng=-122&page=41',
    '/api/treatment?lat=48&lng=-122&page=1.5',
    `/api/treatment?lat=48&lng=-122&codes=${evil}`,
    `/api/treatment?lat=48&lng=-122&codes=BU,${evil}`,
    `/api/treatment?lat=48&lng=-122&codes=${'BU,'.repeat(60)}`,
    `/api/telehealth?state=${evil}`,
    '/api/telehealth?state=FM',
    `/api/telehealth?state=WA&kind=${evil}`,
    `/api/telehealth?state=WA&codes=${evil}`,
    `/api/telehealth?state=WA&page=${evil}`,
    // Providers.
    `/api/providers?lat=48&lng=-122&type=${evil}`,
    `/api/providers?lat=48&lng=-122&type=va&filter=${evil}`,
    // Lookups.
    `/api/region?zip=${evil}`,
    '/api/region?zip=1234',
    `/api/state?code=${evil}`,
    '/api/geocode',
    '/api/geocode?q=',
    `/api/geocode?q=${'a'.repeat(500)}${evil}`,
  ];
  for (const c of cases) {
    const res = await get(c);
    assert.equal(res.status, 400, c);
    const body = await res.json();
    assert.equal(typeof body.error, 'string', c);
    assert.ok(body.error.length > 0 && body.error.length < 200, c);
    assert.doesNotMatch(body.error, evilText, `${c} reflected input`);
    assert.doesNotMatch(body.error, /0x|4\.8e1|Infinity|1234|aaaa/, `${c} reflected input`);
  }
});

test('valid edge values are still accepted', async () => {
  for (const c of [
    '/api/health-centers?lat=48.75&lng=-122.48',             // default radius
    '/api/health-centers?lat=%2B48.75&lng=-122.48&radius=5', // explicit + sign
    '/api/health-centers?lat=.5&lng=-122.48&radius=250',
    '/api/treatment?lat=48.75&lng=-122.48&radius=200&kind=MH&page=40&codes=BU,%20MD',
    '/api/region?zip=98225-1234',
    '/api/state?code=wa',
    '/api/telehealth?state=wa',
    '/api/geocode?q=Bellingham,%20WA',
  ]) {
    const res = await get(c);
    assert.equal(res.status, 200, c);
  }
});

test('unknown state code is a 404 with a fixed message', async () => {
  const res = await get('/api/state?code=ZZ');
  assert.equal(res.status, 404);
  assert.doesNotMatch((await res.json()).error, /ZZ/);
});

test('TRUST_PROXY: rate limit keys on the proxy-appended address, so forged X-Forwarded-For entries cannot dodge it', async () => {
  const local = await startApp({ trustProxy: 1, rateLimit: { windowMs: 60_000, max: 3 } });
  try {
    const statuses = [];
    for (let i = 0; i < 5; i++) {
      // A client sends a different fake address each time; the trusted proxy appends the real one.
      const res = await fetch(`${local.base}/api/health`, { headers: { 'X-Forwarded-For': `10.0.0.${i}, 203.0.113.7` } });
      statuses.push(res.status);
    }
    assert.deepEqual(statuses, [200, 200, 200, 429, 429]);
    const other = await fetch(`${local.base}/api/health`, { headers: { 'X-Forwarded-For': '198.51.100.9' } });
    assert.equal(other.status, 200, 'a different real client has its own budget');
    const limited = await fetch(`${local.base}/api/health`, { headers: { 'X-Forwarded-For': '203.0.113.7' } });
    assert.ok(Number(limited.headers.get('retry-after')) > 0, '429 carries Retry-After');
  } finally {
    await local.close();
  }
});

test('without TRUST_PROXY, X-Forwarded-For is ignored entirely', async () => {
  const local = await startApp({ trustProxy: 0, rateLimit: { windowMs: 60_000, max: 2 } });
  try {
    const statuses = [];
    for (let i = 0; i < 3; i++) {
      statuses.push((await fetch(`${local.base}/api/health`, { headers: { 'X-Forwarded-For': `10.0.0.${i}` } })).status);
    }
    assert.deepEqual(statuses, [200, 200, 429]);
  } finally {
    await local.close();
  }
});

test('clientKey picks the right hop and trustProxyFromEnv parses the environment', () => {
  const req = (xff) => ({ headers: { 'x-forwarded-for': xff }, socket: { remoteAddress: '127.0.0.1' } });
  assert.equal(clientKey(req('1.1.1.1, 2.2.2.2, 3.3.3.3'), 1), '3.3.3.3');
  assert.equal(clientKey(req('1.1.1.1, 2.2.2.2, 3.3.3.3'), 2), '2.2.2.2');
  assert.equal(clientKey(req('1.1.1.1'), 3), '1.1.1.1', 'fewer entries than hops uses the leftmost');
  assert.equal(clientKey(req('1.1.1.1'), true), '1.1.1.1');
  assert.equal(clientKey(req('1.1.1.1'), 0), '127.0.0.1');
  assert.equal(clientKey(req(undefined), 1), '127.0.0.1');
  assert.equal(clientKey(req(['1.1.1.1', '2.2.2.2']), 1), '2.2.2.2');
  assert.equal(trustProxyFromEnv({}), 0);
  assert.equal(trustProxyFromEnv({ TRUST_PROXY: '1' }), 1);
  assert.equal(trustProxyFromEnv({ TRUST_PROXY: '2' }), 2);
  assert.equal(trustProxyFromEnv({ TRUST_PROXY: 'true' }), 1);
  assert.equal(trustProxyFromEnv({ TRUST_PROXY: 'yes please' }), 0);
  assert.equal(trustProxyFromEnv({ VERCEL: '1' }), 1);
});

test('/api/freshness reports directory and per-dataset dates from data/meta.json', async () => {
  const meta = readJson(path.join(here, '..', 'data', 'meta.json'));
  const res = await get('/api/freshness');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.directoryUpdated, new Date(meta.builtAt).toISOString());
  assert.ok(Number.isInteger(body.directoryAgeDays) && body.directoryAgeDays >= 0);
  assert.equal(body.treatment.live, true);
  assert.equal(body.treatment.maxCacheMinutes, 60, 'matches the one-hour promise on the privacy page');
  assert.deepEqual(Object.keys(body.datasets).sort(), Object.keys(meta.sources).sort());
  const hc = body.datasets.healthCenters;
  assert.equal(hc.count, meta.sources.healthCenters.count);
  assert.equal(hc.sourceUpdated, new Date(meta.sources.healthCenters.lastModified).toISOString());
  assert.equal(hc.builtAt, new Date(meta.sources.healthCenters.builtAt).toISOString());
  for (const [key, d] of Object.entries(body.datasets)) {
    for (const f of ['sourceUpdated', 'builtAt']) {
      assert.ok(d[f] === null || !Number.isNaN(Date.parse(d[f])), `${key}.${f}`);
    }
    assert.ok(!('url' in d) && !('urls' in d), 'build-time download URLs are not exposed');
  }

  const legacy = await (await get('/api/meta')).json();
  assert.equal(legacy.directoryUpdated, body.directoryUpdated, '/api/meta carries the headline date too');
  assert.equal(legacy.healthCenters.updated, meta.sources.healthCenters.lastModified, 'existing client field unchanged');
});
