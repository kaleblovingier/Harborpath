import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGeocoder, parsePlaceQuery, haversineMiles, coarsen } from '../src/geo.js';
import { createHealthCenterIndex } from '../src/healthCenters.js';
import { readJson } from '../src/util.js';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const geocoder = createGeocoder({
  zcta: readJson(path.join(dataDir, 'zcta.json')),
  places: readJson(path.join(dataDir, 'places.json')),
});

test('ZIP codes resolve to a centroid labeled with the nearest place', () => {
  const [hit] = geocoder.lookup('98225');
  assert.equal(hit.kind, 'zip');
  assert.match(hit.label, /^98225 · Bellingham, WA$/);
  assert.ok(Math.abs(hit.lat - 48.75) < 0.1 && Math.abs(hit.lng + 122.5) < 0.1);
  assert.deepEqual(geocoder.lookup('98225-1234')[0].label, hit.label);
});

test('ZIPs inside large cities are labeled with that city, not a small neighbor', () => {
  assert.match(geocoder.lookup('10001')[0].label, /New York, NY$/);
  assert.match(geocoder.lookup('60601')[0].label, /Chicago, IL$/);
  assert.match(geocoder.lookup('90012')[0].label, /Los Angeles, CA$/);
  assert.match(geocoder.lookup('07030')[0].label, /Hoboken, NJ$/);
});

test('PO-box-only ZIPs fall back to a nearby ZIP with the same prefix', () => {
  const [hit] = geocoder.lookup('85001');
  assert.match(hit.label, /^85001 · Phoenix, AZ$/);
});

test('names with accents and later-word matches are found', () => {
  assert.ok(geocoder.lookup('Catano, PR').some((r) => r.label === 'Cataño, PR'));
  assert.ok(geocoder.lookup('Honolulu').some((r) => r.label === 'Urban Honolulu, HI'));
});

test('unknown ZIPs and bare numbers return nothing', () => {
  assert.deepEqual(geocoder.lookup('00000'), []);
  assert.deepEqual(geocoder.lookup('123'), []);
});

test('city queries accept "City, ST", "City State", and partial names', () => {
  assert.equal(geocoder.lookup('Portland, OR')[0].label, 'Portland, OR');
  assert.equal(geocoder.lookup('portland oregon')[0].label, 'Portland, OR');
  assert.equal(geocoder.lookup('Dayton OH')[0].label, 'Dayton, OH');
  // Bigger places rank first when no state is given.
  assert.equal(geocoder.lookup('Phoenix')[0].label, 'Phoenix, AZ');
  assert.ok(geocoder.lookup('Bellin').some((r) => r.label === 'Bellingham, WA'));
});

test('saint/fort/mount abbreviations and consolidated cities match', () => {
  assert.equal(geocoder.lookup('saint louis, mo')[0].label, 'St. Louis, MO');
  assert.equal(geocoder.lookup('fort worth')[0].label, 'Fort Worth, TX');
  assert.equal(geocoder.lookup('Indianapolis')[0].label, 'Indianapolis, IN');
  assert.equal(geocoder.lookup('Ventura, CA')[0].label, 'Ventura, CA');
  assert.equal(geocoder.lookup('Nashville, TN')[0].label, 'Nashville-Davidson, TN');
});

test('parsePlaceQuery separates the state', () => {
  assert.deepEqual(parsePlaceQuery('Kansas City, MO'), { city: 'Kansas City', state: 'MO' });
  assert.deepEqual(parsePlaceQuery('Carson City Nevada'), { city: 'Carson City', state: 'NV' });
  assert.deepEqual(parsePlaceQuery('Washington DC'), { city: 'Washington', state: 'DC' });
  assert.deepEqual(parsePlaceQuery('Nevada'), { city: 'Nevada', state: null });
});

test('coarsen rounds to about 1 km and haversine is sane', () => {
  assert.equal(coarsen(48.751934), 48.75);
  assert.equal(coarsen(-122.478712), -122.48);
  // Seattle to Portland is roughly 145 miles.
  const d = haversineMiles(47.6062, -122.3321, 45.5152, -122.6784);
  assert.ok(d > 140 && d < 150, `got ${d}`);
});

test('health center search filters by radius and sorts by distance', () => {
  const sites = [
    { id: 'a', name: 'Far', lat: 48.0, lng: -122.48 },
    { id: 'b', name: 'Near', lat: 48.76, lng: -122.48 },
    { id: 'c', name: 'Mid', lat: 48.9, lng: -122.48 },
  ];
  const idx = createHealthCenterIndex(sites);
  const { total, results } = idx.search({ lat: 48.75, lng: -122.48, radiusMiles: 25 });
  assert.equal(total, 2);
  assert.deepEqual(results.map((r) => r.name), ['Near', 'Mid']);
  assert.equal(typeof results[0].miles, 'number');
});
