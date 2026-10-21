import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { DATA_LOADERS } from '../src/data.js';
import { InputError } from '../src/findtreatment.js';
import { createGeocoder } from '../src/geo.js';
import { createRegions, REGIONS, describeRegion } from '../src/regions.js';
import { createStateDirectory } from '../src/stateResources.js';
import { createTaxonomy } from '../src/taxonomy.js';
import { buildTelehealthUrl, parseTelehealthQuery, searchTelehealth } from '../src/telehealth.js';
import { readJson } from '../src/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = readJson(path.join(here, 'fixtures', 'findtreatment-sample.json'));

const zcta = DATA_LOADERS.zcta();
const zipStates = DATA_LOADERS.zipStates();
const regions = createRegions({ zcta, zipStates });
const geocoder = createGeocoder({
  zcta,
  places: DATA_LOADERS.places(),
  islandPlaces: DATA_LOADERS.islandPlaces(),
});
const stateDirectory = createStateDirectory({
  agencies: DATA_LOADERS.stateAgencies(),
  medicaid: DATA_LOADERS.stateMedicaid(),
  healthCenters: DATA_LOADERS.healthCenters(),
  meta: DATA_LOADERS.meta(),
});
const taxonomy = createTaxonomy(DATA_LOADERS.serviceCodes());
const q = (s) => new URLSearchParams(s);

test('forZip resolves states, territories, freely-associated states, military mail, and Census exceptions', () => {
  assert.equal(regions.forZip('98225').region.code, 'WA');
  assert.equal(regions.forZip('00901').region.code, 'PR');
  assert.equal(regions.forZip('00802').region.code, 'VI');
  assert.equal(regions.forZip('96799').region.code, 'AS');
  assert.equal(regions.forZip('96910').region.code, 'GU');
  assert.equal(regions.forZip('96950').region.code, 'MP');
  assert.equal(regions.forZip('96941').region.code, 'FM');
  assert.equal(regions.forZip('96960').region.code, 'MH');
  assert.equal(regions.forZip('96940').region.code, 'PW');
  assert.equal(regions.forZip('09012').region.type, 'military');
  // Fishers Island, NY has a 063 (CT) prefix.
  assert.equal(regions.forZip('06390').region.code, 'NY');
  assert.equal(regions.forZip('00000'), null);
});

test('forPoint identifies the jurisdiction and nearby border states', () => {
  // Vancouver, WA sits across the Columbia River from Oregon.
  const vancouver = regions.forPoint(45.63, -122.67);
  assert.equal(vancouver.region.code, 'WA');
  assert.ok(vancouver.nearby.some((r) => r.code === 'OR'));

  // Guam (east of the antimeridian)
  const guam = regions.forPoint(13.48, 144.75);
  assert.equal(guam.region.code, 'GU');

  // Open ocean far from any US ZIP
  assert.equal(regions.forPoint(0, -160), null);
});

test('annotate attaches state codes to geocoder hits and drops military/FAS borrowed centroids', () => {
  const bellingham = regions.annotate(geocoder.lookup('98225'), '98225');
  assert.equal(bellingham[0].state, 'WA');

  const hagatna = regions.annotate(geocoder.lookup('Hagatna'), 'Hagatna');
  assert.equal(hagatna[0].state, 'GU');

  // 96941 (Federated States of Micronesia) has no Census ZCTA centroid; a borrowed
  // 969xx centroid in Guam must not be returned as if it were in FM.
  const fas = regions.annotate(geocoder.lookup('96941'), '96941');
  assert.deepEqual(fas, []);
});

test('every state, DC, and territory has an anchor point and state directory entry', () => {
  const listed = stateDirectory.list();
  assert.equal(listed.length, REGIONS.length);
  for (const r of REGIONS) {
    const entry = stateDirectory.get(r.code);
    assert.ok(entry, `entry for ${r.code}`);
    assert.ok(entry.agency, `agency for ${r.code}`);
    if (r.type !== 'freely-associated') {
      assert.ok(regions.anchor(r.code), `anchor for ${r.code}`);
      assert.ok(entry.medicaid, `medicaid for ${r.code}`);
      assert.ok(entry.healthCenters > 0, `healthCenters count for ${r.code}`);
      assert.equal(entry.telehealth, true);
    } else {
      assert.equal(entry.telehealth, false);
    }
  }
  assert.equal(stateDirectory.get('ZZ'), null);
});

test('telehealth queries validate state, quote stateCode, and omit distances without visitor coordinates', async () => {
  const withoutPoint = parseTelehealthQuery(q('state=wa&codes=BU'), { taxonomy, anchorFor: regions.anchor });
  assert.equal(withoutPoint.byDistance, false);
  assert.deepEqual(withoutPoint.codes, ['BU', 'TELE']);
  const url = new URL(buildTelehealthUrl(withoutPoint));
  assert.equal(url.searchParams.get('stateCode'), "'WA'");
  assert.equal(url.searchParams.get('sort'), '2');

  const res = await searchTelehealth(withoutPoint, {
    taxonomy,
    fetchImpl: async () => new Response(JSON.stringify(sample), { status: 200 }),
  });
  assert.equal(res.state.code, 'WA');
  assert.ok(res.results.every((f) => f.miles === null));

  assert.throws(() => parseTelehealthQuery(q('state=FM'), { taxonomy, anchorFor: regions.anchor }), InputError);
  assert.throws(() => parseTelehealthQuery(q('state=AE'), { taxonomy, anchorFor: regions.anchor }), InputError);
  assert.equal(describeRegion('AE').type, 'military');
});

let server;
let base;
before(async () => {
  const handler = createApp({
    fetchImpl: async () => new Response(JSON.stringify(sample), { status: 200 }),
    logger: { error() {} },
  });
  server = createServer(handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((r) => server.close(r)));

test('HTTP endpoints /api/region, /api/states, /api/state, and /api/telehealth respond as expected', async () => {
  const regRes = await fetch(`${base}/api/region?zip=06390`);
  assert.equal(regRes.status, 200);
  assert.equal((await regRes.json()).region.code, 'NY');

  const statesRes = await fetch(`${base}/api/states`);
  assert.equal(statesRes.status, 200);
  const statesBody = await statesRes.json();
  assert.equal(statesBody.states.length, 59);

  const waRes = await fetch(`${base}/api/state?code=WA`);
  assert.equal(waRes.status, 200);
  const waBody = await waRes.json();
  assert.equal(waBody.region.code, 'WA');
  assert.ok(waBody.healthCenters > 0);

  const unknownState = await fetch(`${base}/api/state?code=XX`);
  assert.equal(unknownState.status, 404);

  const teleRes = await fetch(`${base}/api/telehealth?state=WA&codes=BU`);
  assert.equal(teleRes.status, 200);
  const teleBody = await teleRes.json();
  assert.equal(teleBody.state.code, 'WA');
  assert.equal(teleBody.results.length, 2);
});
