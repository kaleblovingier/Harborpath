// Robustness of the FindTreatment.gov client: timeouts, upstream errors,
// malformed responses, the circuit breaker, and stale-while-error answers.
// Every test uses a fake fetch; nothing here touches the network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTaxonomy } from '../src/taxonomy.js';
import { createCache, createCircuitBreaker, createRateLimiter } from '../src/cache.js';
import {
  MAX_UPSTREAM_BYTES, UpstreamError, readListingPage, searchTreatment,
} from '../src/findtreatment.js';
import { searchTelehealth } from '../src/telehealth.js';
import { readJson } from '../src/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const taxonomy = createTaxonomy(readJson(path.join(here, '..', 'data', 'service-codes.json')));
const sample = readJson(path.join(here, 'fixtures', 'findtreatment-sample.json'));
const query = { lat: 48.75, lng: -122.48, radiusMiles: 25, kind: 'sa', page: 1, codes: ['BU'] };
const ok = (body = sample) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status: 200 });
const noSleep = async () => {};

async function rejectsWith(promise, code) {
  await assert.rejects(promise, (err) => {
    assert.ok(err instanceof UpstreamError, `expected UpstreamError, got ${err?.name}`);
    assert.equal(err.code, code);
    return true;
  });
}

test('a fetch that never settles (and ignores its abort signal) times out instead of hanging', async () => {
  const fetchImpl = () => new Promise(() => {});
  const started = Date.now();
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl, timeoutMs: 60, retries: 0 }), 'timeout');
  assert.ok(Date.now() - started < 1000, 'gave up near the deadline');
});

test('a response body that never finishes also times out', async () => {
  const fetchImpl = async () => ({ ok: true, status: 200, headers: new Headers(), text: () => new Promise(() => {}) });
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl, timeoutMs: 60, retries: 0 }), 'timeout');
});

test('the fetch receives an AbortSignal that fires at the deadline', async () => {
  let signal;
  const fetchImpl = (url, init) => {
    signal = init.signal;
    return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('x', 'AbortError'))));
  };
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl, timeoutMs: 40, retries: 0 }), 'timeout');
  assert.equal(signal.aborted, true);
});

test('network errors and 5xx responses are retried; 4xx and malformed bodies are not', async () => {
  for (const [label, respond, expectCalls, code] of [
    ['network', () => { throw new TypeError('fetch failed'); }, 3, 'network'],
    ['503', () => new Response('busy', { status: 503 }), 3, 'http'],
    ['404', () => new Response('nope', { status: 404 }), 1, 'http'],
    ['429', () => new Response('slow down', { status: 429 }), 1, 'rate-limited'],
    ['html', () => ok('<html>maintenance</html>'), 1, 'malformed'],
  ]) {
    let calls = 0;
    const fetchImpl = async () => { calls++; return respond(); };
    await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl, retries: 2, sleep: noSleep }), code);
    assert.equal(calls, expectCalls, label);
  }
});

test('a transient failure followed by success returns the listing', async () => {
  let calls = 0;
  const fetchImpl = async () => (++calls === 1 ? new Response('', { status: 502 }) : ok());
  const res = await searchTreatment(query, { taxonomy, fetchImpl, retries: 2, sleep: noSleep });
  assert.equal(calls, 2);
  assert.equal(res.results.length, 2);
});

test('error messages never carry the upstream URL, coordinates, or response text', async () => {
  const echo = 'Invalid request: sAddr=48.75,-122.48 limitValue=40234';
  const cases = [
    async () => ok(echo),
    async () => { throw new TypeError(`fetch failed for https://findtreatment.gov/?sAddr=48.75,-122.48`); },
    async () => new Response(echo, { status: 400 }),
  ];
  for (const fetchImpl of cases) {
    await assert.rejects(searchTreatment(query, { taxonomy, fetchImpl, retries: 0 }), (err) => {
      assert.doesNotMatch(err.message, /48\.75|122\.48|sAddr|findtreatment\.gov\/|limitValue/);
      return true;
    });
  }
});

test('malformed JSON shapes are rejected, and bad rows are skipped without failing the page', () => {
  for (const body of [null, 42, 'rows', [], { rows: 'x' }, { rows: {} }, {}, { recordCount: 5 }]) {
    assert.throws(() => readListingPage(body, { taxonomy, page: 1 }), UpstreamError, JSON.stringify(body));
  }
  // An empty result may omit rows.
  assert.deepEqual(readListingPage({ recordCount: 0 }, { taxonomy, page: 1 }).results, []);

  const page = readListingPage({
    page: '1', totalPages: -3, recordCount: 'many',
    rows: [null, 7, 'x', [], sample.rows[0], { name1: 'Odd', services: 'not-an-array' }],
  }, { taxonomy, page: 1 });
  assert.equal(page.results.length, 2);
  assert.equal(page.results[0].name, sample.rows[0].name1);
  assert.equal(page.totalPages, 0, 'negative counts are not trusted');
  assert.equal(page.total, 2, 'a non-numeric recordCount falls back to the row count');
});

test('oversized responses are refused', async () => {
  const declared = async () => new Response('{}', { status: 200, headers: { 'Content-Length': String(MAX_UPSTREAM_BYTES + 1) } });
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl: declared, retries: 0 }), 'too-large');
  const actual = async () => ({ ok: true, status: 200, headers: new Headers(), text: async () => 'x'.repeat(MAX_UPSTREAM_BYTES + 1) });
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl: actual, retries: 0 }), 'too-large');
});

test('a fetch that resolves to something other than a Response is treated as malformed', async () => {
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl: async () => undefined, retries: 0 }), 'malformed');
});

test('circuit breaker opens after repeated outages, fails fast, then lets one probe through', async () => {
  let now = 0;
  const breaker = createCircuitBreaker({ threshold: 2, cooldownMs: 1000, now: () => now });
  let calls = 0;
  let down = true;
  const fetchImpl = async () => {
    calls++;
    if (down) throw new TypeError('fetch failed');
    return ok();
  };
  const opts = { taxonomy, fetchImpl, breaker, retries: 0 };
  await rejectsWith(searchTreatment(query, opts), 'network');
  await rejectsWith(searchTreatment(query, opts), 'network');
  assert.equal(breaker.open, true);
  await rejectsWith(searchTreatment(query, opts), 'circuit-open');
  assert.equal(calls, 2, 'no upstream call while open');
  assert.equal(breaker.retryAfterSeconds(), 1);

  now = 1500;
  down = false;
  const res = await searchTreatment(query, opts);
  assert.equal(res.results.length, 2);
  assert.equal(calls, 3);
  assert.equal(breaker.open, false, 'a successful probe closes it');
});

test('a failed probe reopens the breaker; only one probe runs at a time', () => {
  let now = 0;
  const breaker = createCircuitBreaker({ threshold: 1, cooldownMs: 100, now: () => now });
  breaker.failure();
  assert.equal(breaker.allow(), false);
  now = 200;
  assert.equal(breaker.allow(), true, 'probe');
  assert.equal(breaker.allow(), false, 'second caller waits for the probe');
  breaker.failure();
  assert.equal(breaker.allow(), false, 'reopened');
  now = 400;
  assert.equal(breaker.allow(), true);
  breaker.success();
  assert.equal(breaker.allow(), true);
  assert.equal(breaker.allow(), true);
});

test('upstream rejections of one query (4xx, malformed) do not trip the breaker', async () => {
  const breaker = createCircuitBreaker({ threshold: 1 });
  await rejectsWith(searchTreatment(query, { taxonomy, breaker, retries: 0, fetchImpl: async () => ok('nope') }), 'malformed');
  await rejectsWith(searchTreatment(query, { taxonomy, breaker, retries: 0, fetchImpl: async () => new Response('', { status: 400 }) }), 'http');
  assert.equal(breaker.open, false);
});

test('with the breaker open, a cached copy is served stale immediately', async () => {
  let now = 0;
  const cache = createCache({ ttlMs: 100, staleMs: 1000, now: () => now, sweepEveryMs: 0 });
  const breaker = createCircuitBreaker({ threshold: 1, cooldownMs: 10_000, now: () => now });
  let calls = 0;
  const fetchImpl = async () => { calls++; return ok(); };
  await searchTreatment(query, { taxonomy, fetchImpl, cache, breaker });
  breaker.failure();
  now = 500;
  const res = await searchTreatment(query, { taxonomy, fetchImpl, cache, breaker });
  assert.equal(res.stale, true);
  assert.equal(res.results.length, 2);
  assert.equal(calls, 1, 'did not wait on the upstream');
});

test('a timed-out search falls back to a stale copy, and past the stale window it errors', async () => {
  let now = 0;
  const cache = createCache({ ttlMs: 100, staleMs: 100, now: () => now, sweepEveryMs: 0 });
  let hang = false;
  const fetchImpl = () => (hang ? new Promise(() => {}) : Promise.resolve(ok()));
  await searchTreatment(query, { taxonomy, fetchImpl, cache, timeoutMs: 50, retries: 0 });
  hang = true;
  now = 150;
  const stale = await searchTreatment(query, { taxonomy, fetchImpl, cache, timeoutMs: 50, retries: 0 });
  assert.equal(stale.stale, true);
  now = 250;
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl, cache, timeoutMs: 50, retries: 0 }), 'timeout');
});

test('stale answers are never written back into the cache as fresh', async () => {
  let now = 0;
  const cache = createCache({ ttlMs: 100, staleMs: 100, now: () => now, sweepEveryMs: 0 });
  let down = false;
  const fetchImpl = async () => { if (down) throw new TypeError('down'); return ok(); };
  await searchTreatment(query, { taxonomy, fetchImpl, cache, retries: 0 });
  down = true;
  now = 150;
  assert.equal((await searchTreatment(query, { taxonomy, fetchImpl, cache, retries: 0 })).stale, true);
  now = 210; // past the original entry's drop time
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl, cache, retries: 0 }), 'network');
});

test('the in-flight entry is cleared after a failure, so the next search retries', async () => {
  const inflight = new Map();
  let fail = true;
  const fetchImpl = async () => { if (fail) throw new TypeError('down'); return ok(); };
  await rejectsWith(searchTreatment(query, { taxonomy, fetchImpl, inflight, retries: 0 }), 'network');
  assert.equal(inflight.size, 0);
  fail = false;
  assert.equal((await searchTreatment(query, { taxonomy, fetchImpl, inflight, retries: 0 })).results.length, 2);
});

test('the relaxed fallback failing never breaks a valid empty answer', async () => {
  const fetchImpl = async (url) => (new URL(url).searchParams.get('sCodes')
    ? ok({ page: 1, totalPages: 0, recordCount: 0, rows: [] })
    : new Response('', { status: 500 }));
  const res = await searchTreatment({ ...query, codes: ['BU', 'OTP'] }, { taxonomy, fetchImpl, retries: 0 });
  assert.equal(res.total, 0);
  assert.equal(res.relaxed, undefined);
});

test('telehealth searches share the hardened path: timeouts, validation, and stale fallback', async () => {
  const tq = { state: 'WA', lat: 47.5, lng: -120.5, byDistance: false, kind: 'sa', page: 1, codes: ['TELE'] };
  await rejectsWith(searchTelehealth(tq, { taxonomy, fetchImpl: () => new Promise(() => {}), timeoutMs: 50, retries: 0 }), 'timeout');
  await rejectsWith(searchTelehealth(tq, { taxonomy, fetchImpl: async () => ok('plain text'), retries: 0 }), 'malformed');

  let now = 0;
  const cache = createCache({ ttlMs: 100, staleMs: 100, now: () => now, sweepEveryMs: 0 });
  let down = false;
  const fetchImpl = async () => { if (down) throw new TypeError('down'); return ok(); };
  const fresh = await searchTelehealth(tq, { taxonomy, fetchImpl, cache, retries: 0 });
  assert.equal(fresh.state.code, 'WA');
  assert.ok(fresh.results.every((f) => f.miles === null));
  down = true;
  now = 150;
  const stale = await searchTelehealth(tq, { taxonomy, fetchImpl, cache, retries: 0 });
  assert.equal(stale.stale, true);
  assert.equal(stale.state.code, 'WA');
});

test('rate limiter tracks a bounded number of clients and reports Retry-After', () => {
  let now = 0;
  const limiter = createRateLimiter({ windowMs: 10_000, max: 2, maxKeys: 3, now: () => now });
  for (const k of ['a', 'b', 'c', 'd', 'e', 'f']) limiter.allow(k);
  assert.ok(limiter.size <= 4, 'three clients plus one shared overflow bucket');
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), false);
  now = 2500;
  assert.equal(limiter.retryAfterSeconds(), 8);
  now = 10_000;
  assert.equal(limiter.allow('a'), true, 'new window');
});
