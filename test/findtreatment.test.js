import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTaxonomy } from '../src/taxonomy.js';
import { createCache } from '../src/cache.js';
import {
  InputError, buildUpstreamUrl, normalizeFacility, parseTreatmentQuery, searchTreatment,
} from '../src/findtreatment.js';
import { normalizeWebsite, readJson } from '../src/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const taxonomy = createTaxonomy(readJson(path.join(here, '..', 'data', 'service-codes.json')));
const sample = readJson(path.join(here, 'fixtures', 'findtreatment-sample.json'));
const q = (s) => new URLSearchParams(s);

test('parseTreatmentQuery coarsens coordinates and sorts codes', () => {
  const parsed = parseTreatmentQuery(q('lat=48.751934&lng=-122.478712&radius=25&codes=MD,BU&kind=SA'), taxonomy);
  assert.deepEqual(parsed, { lat: 48.75, lng: -122.48, radiusMiles: 25, kind: 'sa', page: 1, codes: ['BU', 'MD'] });
});

test('parseTreatmentQuery rejects bad input', () => {
  const bad = [
    'lng=-122&radius=25',
    'lat=200&lng=-122',
    'lat=48&lng=-122&radius=7',
    'lat=48&lng=-122&kind=xx',
    'lat=48&lng=-122&page=0',
    'lat=48&lng=-122&codes=NOTACODE',
    'lat=48&lng=-122&codes=BU,MU,NU,MD,MC,PI,SS,PA,TELE',
  ];
  for (const s of bad) assert.throws(() => parseTreatmentQuery(q(s), taxonomy), InputError, s);
});

test('buildUpstreamUrl uses lat,lng order and meters', () => {
  const url = new URL(buildUpstreamUrl({ lat: 48.75, lng: -122.48, radiusMiles: 10, kind: 'sa', page: 2, codes: ['BU', 'MD'] }));
  assert.equal(url.origin + url.pathname, 'https://findtreatment.gov/locator/exportsAsJson/v2');
  assert.equal(url.searchParams.get('sAddr'), '48.75,-122.48');
  assert.equal(url.searchParams.get('limitType'), '2');
  assert.equal(url.searchParams.get('limitValue'), '16093');
  assert.equal(url.searchParams.get('sCodes'), 'BU,MD');
  assert.equal(url.searchParams.get('page'), '2');
});

test('normalizeFacility maps every listed service back to a code', () => {
  for (const row of sample.rows) {
    const f = normalizeFacility(row, taxonomy);
    assert.equal(f.name, row.name1);
    assert.ok(f.codes.includes('BU'), 'sample was filtered on buprenorphine');
    const items = f.services.flatMap((s) => s.items.map((i) => [s.category, i]));
    const unmapped = items.filter(([cat, i]) => !taxonomy.codeFor(cat, i));
    assert.deepEqual(unmapped, []);
    assert.match(f.id, /^[0-9a-f]{16}$/);
  }
});

test('normalizeFacility only allows http(s) websites', () => {
  const base = { name1: 'X', services: [] };
  assert.equal(normalizeFacility({ ...base, website: 'www.example.org' }, taxonomy).website, 'https://www.example.org/');
  assert.equal(normalizeFacility({ ...base, website: 'javascript:alert(1)' }, taxonomy).website, null);
  assert.equal(normalizeFacility({ ...base, website: 'not a url' }, taxonomy).website, null);
  assert.equal(normalizeWebsite('localhost'), null);
});

test('searchTreatment caches by upstream URL', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return new Response(JSON.stringify(sample), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const cache = createCache();
  const query = { lat: 48.75, lng: -122.48, radiusMiles: 25, kind: 'sa', page: 1, codes: ['BU'] };
  const a = await searchTreatment(query, { taxonomy, fetchImpl, cache });
  const b = await searchTreatment(query, { taxonomy, fetchImpl, cache });
  assert.equal(calls, 1);
  assert.equal(a.total, sample.recordCount);
  assert.equal(a.results.length, 2);
  assert.equal(a, b);
});

test('searchTreatment surfaces the plain-text error the API returns for bad queries', async () => {
  const fetchImpl = async () => new Response('Invalid request. Please verify the parameters.', { status: 200 });
  await assert.rejects(
    searchTreatment({ lat: 1, lng: 1, radiusMiles: 5, kind: 'sa', page: 1, codes: [] }, { taxonomy, fetchImpl }),
    /non-JSON/,
  );
});

test('cache entries expire and serve stale within staleMs', () => {
  let now = 0;
  const cache = createCache({ ttlMs: 100, staleMs: 100, now: () => now, sweepEveryMs: 0 });
  cache.set('k', 1);
  assert.equal(cache.get('k'), 1);
  now = 150;
  assert.equal(cache.get('k'), undefined);
  assert.equal(cache.getStale('k'), 1);
  now = 250;
  assert.equal(cache.getStale('k'), undefined);
});

test('searchTreatment deduplicates concurrent identical requests and falls back to stale cache on outage', async () => {
  let now = 0;
  let calls = 0;
  let fail = false;
  const fetchImpl = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 10));
    if (fail) throw new Error('upstream down');
    return new Response(JSON.stringify(sample), { status: 200 });
  };
  const cache = createCache({ ttlMs: 100, staleMs: 100, now: () => now, sweepEveryMs: 0 });
  const inflight = new Map();
  const query = { lat: 48.75, lng: -122.48, radiusMiles: 25, kind: 'sa', page: 1, codes: ['BU'] };
  const [r1, r2] = await Promise.all([
    searchTreatment(query, { taxonomy, fetchImpl, cache, inflight, retries: 0 }),
    searchTreatment(query, { taxonomy, fetchImpl, cache, inflight, retries: 0 }),
  ]);
  assert.equal(calls, 1);
  assert.equal(r1, r2);

  now = 150;
  fail = true;
  const staleRes = await searchTreatment(query, { taxonomy, fetchImpl, cache, inflight, retries: 0 });
  assert.equal(staleRes.stale, true);
  assert.equal(staleRes.results.length, 2);
});
