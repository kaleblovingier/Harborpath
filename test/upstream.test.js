import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { createCache } from '../src/cache.js';
import { createTaxonomy } from '../src/taxonomy.js';
import { searchTelehealth } from '../src/telehealth.js';
import { searchTreatment } from '../src/findtreatment.js';
import { cachedUpstream, fetchWithRetry } from '../src/upstream.js';
import { readJson } from '../src/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = readJson(path.join(here, 'fixtures', 'findtreatment-sample.json'));
const taxonomy = createTaxonomy(readJson(path.join(here, '..', 'data', 'service-codes.json')));
const teleQuery = { state: 'WA', lat: 47.61, lng: -122.33, byDistance: false, kind: 'sa', page: 1, codes: ['BU', 'TELE'] };

test('telehealth answers from a stale copy when FindTreatment.gov fails', async () => {
  let now = 0;
  let fail = false;
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    if (fail) throw new Error('connect ECONNREFUSED');
    return new Response(JSON.stringify(sample), { status: 200 });
  };
  const cache = createCache({ ttlMs: 100, staleMs: 100, now: () => now, sweepEveryMs: 0 });
  const fresh = await searchTelehealth(teleQuery, { taxonomy, fetchImpl, cache, retries: 0 });
  assert.equal(fresh.stale, undefined);
  assert.equal(fresh.results.length, sample.rows.length);
  assert.ok(fresh.results.every((f) => f.miles === null), 'no distances from a point the visitor did not choose');

  now = 150; // past ttl, inside the stale window
  fail = true;
  const stale = await searchTelehealth(teleQuery, { taxonomy, fetchImpl, cache, retries: 0 });
  assert.equal(stale.stale, true);
  assert.deepEqual(stale.results, fresh.results);
  assert.equal(calls, 2);

  now = 250; // past the stale window: the outage surfaces
  await assert.rejects(searchTelehealth(teleQuery, { taxonomy, fetchImpl, cache, retries: 0 }), /ECONNREFUSED/);
});

test('telehealth retries a 5xx answer within its time budget', async () => {
  const statuses = [503, 200];
  const fetchImpl = async () => {
    const status = statuses.shift();
    return new Response(status === 200 ? JSON.stringify(sample) : 'busy', { status });
  };
  const slept = [];
  const res = await searchTelehealth(teleQuery, { taxonomy, fetchImpl, retries: 2, backoffMs: 5, sleep: async (ms) => { slept.push(ms); } });
  assert.equal(res.results.length, sample.rows.length);
  assert.equal(slept.length, 1, 'one backoff before the successful retry');
});

test('concurrent identical telehealth searches share one upstream call', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return new Response(JSON.stringify(sample), { status: 200 });
  };
  const cache = createCache({ sweepEveryMs: 0 });
  const inflight = new Map();
  const options = { taxonomy, fetchImpl, cache, inflight, retries: 0 };
  const [a, b, c] = await Promise.all([
    searchTelehealth(teleQuery, options),
    searchTelehealth(teleQuery, options),
    searchTelehealth(teleQuery, options),
  ]);
  assert.equal(calls, 1);
  assert.equal(a, b);
  assert.equal(b, c);
  assert.equal(inflight.size, 0, 'finished searches leave the in-flight map');
});

test('a non-JSON upstream answer is not retried and leaves nothing in flight', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return new Response('Invalid query', { status: 200 }); };
  const inflight = new Map();
  await assert.rejects(
    searchTelehealth(teleQuery, { taxonomy, fetchImpl, inflight, retries: 3, sleep: async () => {} }),
    /non-JSON response \(13 bytes\)/,
  );
  assert.equal(calls, 1);
  assert.equal(inflight.size, 0);
});

test('/api/telehealth turns a non-JSON or failed upstream into a clean 502 without echoing it', async () => {
  let mode = 'text';
  const logged = [];
  const fetchImpl = async () => {
    if (mode === 'down') throw new Error('connect ECONNREFUSED');
    return new Response('<html>Service Unavailable: lat=47.6062</html>', { status: 200 });
  };
  const server = createServer(createApp({ fetchImpl, logger: { error: (m) => logged.push(m) }, upstream: { retries: 0 } }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const next of ['text', 'down']) {
      mode = next;
      const res = await fetch(`${base}/api/telehealth?state=VT&codes=BU`);
      assert.equal(res.status, 502, `${next}: 502`);
      assert.match(res.headers.get('content-type'), /application\/json/);
      const body = await res.json();
      assert.equal(body.error, 'The national treatment directory is not responding right now.');
      assert.equal(body.helpline, '1-800-662-4357');
      assert.doesNotMatch(JSON.stringify(body), /Service Unavailable|ECONNREFUSED|47\.6/, 'upstream text is not echoed');
    }
    assert.ok(logged.every((line) => !line.includes('?')), 'logs carry the route, never the query string');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('/api/telehealth serves a stale copy and logs it when the upstream drops', async () => {
  let down = false;
  const logged = [];
  const fetchImpl = async () => {
    if (down) throw new Error('connect ECONNREFUSED');
    return new Response(JSON.stringify(sample), { status: 200 });
  };
  // The app's cache is fresh for 30 minutes; expire it by moving the clock.
  const realNow = Date.now;
  let offset = 0;
  Date.now = () => realNow() + offset;
  const server = createServer(createApp({ fetchImpl, logger: { error: (m) => logged.push(m) }, upstream: { retries: 0 } }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const first = await (await fetch(`${base}/api/telehealth?state=OR&codes=BU`)).json();
    assert.equal(first.stale, undefined);
    offset = 45 * 60 * 1000;
    down = true;
    const res = await fetch(`${base}/api/telehealth?state=OR&codes=BU`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.stale, true);
    assert.equal(body.results.length, first.results.length);
    assert.ok(logged.some((line) => line === '[api] /api/telehealth upstream failed; answered from cache'));
  } finally {
    Date.now = realNow;
    await new Promise((resolve) => server.close(resolve));
  }
});

test('findtreatment keeps its behaviour on the shared helper', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return new Response(JSON.stringify(sample), { status: 200 });
  };
  const inflight = new Map();
  const cache = createCache({ sweepEveryMs: 0 });
  const query = { lat: 48.75, lng: -122.48, radiusMiles: 25, kind: 'sa', page: 1, codes: ['BU'] };
  const [a, b] = await Promise.all([
    searchTreatment(query, { taxonomy, fetchImpl, cache, inflight, retries: 0 }),
    searchTreatment(query, { taxonomy, fetchImpl, cache, inflight, retries: 0 }),
  ]);
  assert.equal(calls, 1);
  assert.equal(a, b);
  assert.equal(await searchTreatment(query, { taxonomy, fetchImpl, cache, inflight, retries: 0 }), a, 'fresh cache hit');
  assert.equal(calls, 1);
});

test('cachedUpstream and fetchWithRetry building blocks', async () => {
  // No cache or in-flight map: just runs load().
  assert.equal(await cachedUpstream('k', { load: async () => 7 }), 7);
  // 4xx answers are not retried.
  let calls = 0;
  await assert.rejects(
    fetchWithRetry('https://example.invalid/', {
      fetchImpl: async () => { calls++; return new Response('nope', { status: 404 }); },
      timeoutMs: 5000, retries: 3, backoffMs: 1, sleep: async () => {},
    }),
    /HTTP 404/,
  );
  assert.equal(calls, 1);
});
