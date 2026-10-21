import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, SECURITY_HEADERS } from '../src/app.js';
import { readJson } from '../src/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = readJson(path.join(here, 'fixtures', 'findtreatment-sample.json'));

const upstreamCalls = [];
let upstreamMode = 'ok';
const logged = [];

async function fakeFetch(url) {
  upstreamCalls.push(url);
  if (upstreamMode === 'down') throw new Error('connect ECONNREFUSED');
  return new Response(JSON.stringify(sample), { status: 200 });
}

let server;
let base;
before(async () => {
  const handler = createApp({
    fetchImpl: fakeFetch,
    rateLimit: { windowMs: 60_000, max: 40 },
    logger: { error: (m) => logged.push(m) },
  });
  server = createServer(handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((r) => server.close(r)));

test('index is served with a strict, third-party-free security policy', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  const csp = res.headers.get('content-security-policy');
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self';/);
  assert.doesNotMatch(csp, /https?:/, 'no external origins allowed');
  assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  const html = await res.text();
  assert.match(html, /Quick exit/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/, 'no third-party scripts');
  assert.doesNotMatch(html, /<link[^>]+href="https?:/, 'no third-party stylesheets or fonts');
});

test('vercel.json applies the same security headers to CDN-served files', () => {
  const cfg = readJson(path.join(here, '..', 'vercel.json'));
  const rule = cfg.headers.find((r) => r.source === '/(.*)');
  assert.deepEqual(Object.fromEntries(rule.headers.map((x) => [x.key, x.value])), SECURITY_HEADERS);
});

test('static assets are gzip-compressed and cacheable by ETag', async () => {
  const res = await fetch(`${base}/styles.css`, { headers: { 'Accept-Encoding': 'gzip' } });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/css/);
  const etag = res.headers.get('etag');
  const again = await fetch(`${base}/styles.css`, { headers: { 'If-None-Match': etag } });
  assert.equal(again.status, 304);
});

test('service worker APP_SHELL assets all exist and are served 200 OK', async () => {
  const swText = readFileSync(path.join(here, '..', 'public', 'sw.js'), 'utf8');
  const match = swText.match(/const APP_SHELL = \[([\s\S]*?)\];/);
  assert.ok(match, 'APP_SHELL list found in public/sw.js');
  const urls = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.ok(urls.length >= 20, 'APP_SHELL contains all core static files');
  for (const urlPath of urls) {
    const res = await fetch(`${base}${urlPath}`);
    assert.equal(res.status, 200, `Expected 200 OK for ${urlPath}`);
  }
});

test('path traversal cannot escape public/', async () => {
  const res = await fetch(`${base}/..%2fpackage.json`);
  assert.equal(res.status, 404);
  assert.doesNotMatch(await res.text(), /"scripts"/);
});

test('geocode answers locally', async () => {
  const res = await fetch(`${base}/api/geocode?q=98225`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  const { results } = await res.json();
  assert.match(results[0].label, /Bellingham, WA/);
  assert.equal(upstreamCalls.length, 0, 'geocoding never calls out');
});

test('treatment search forwards only coarsened coordinates upstream', async () => {
  const res = await fetch(`${base}/api/treatment?lat=48.751934&lng=-122.478712&radius=25&codes=BU`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.results.length, 2);
  assert.equal(body.source, 'SAMHSA FindTreatment.gov');
  const sent = new URL(upstreamCalls.at(-1));
  assert.equal(sent.searchParams.get('sAddr'), '48.75,-122.48');
  assert.ok(!upstreamCalls.at(-1).includes('751934'), 'precise coordinates never leave the server');
});

test('invalid treatment queries get a 400 with a readable message', async () => {
  const res = await fetch(`${base}/api/treatment?lat=48&lng=-122&codes=BOGUS`);
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Unknown service code/);
});

test('upstream failure returns 502 with fallbacks and logs no location', async () => {
  upstreamMode = 'down';
  try {
    const res = await fetch(`${base}/api/treatment?lat=40.71&lng=-74.01&radius=10`);
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.equal(body.fallbackUrl, 'https://findtreatment.gov/');
    assert.equal(body.helpline, '1-800-662-4357');
    assert.ok(logged.length > 0);
    for (const line of logged) assert.doesNotMatch(line, /40\.71|74\.01|lat=|lng=/);
  } finally {
    upstreamMode = 'ok';
  }
});

test('health center search runs against the HRSA dataset', async () => {
  const res = await fetch(`${base}/api/health-centers?lat=48.75&lng=-122.48&radius=25`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.total > 0);
  assert.ok(body.results.every((r, i, a) => i === 0 || a[i - 1].miles <= r.miles), 'sorted by distance');
  assert.ok(body.results.every((r) => r.miles <= 25));
});

test('non-GET methods are rejected', async () => {
  const res = await fetch(`${base}/api/geocode?q=x`, { method: 'POST' });
  assert.equal(res.status, 405);
});

test('rate limiting kicks in', async () => {
  let last;
  for (let i = 0; i < 45; i++) last = await fetch(`${base}/api/health`);
  assert.equal(last.status, 429);
});
