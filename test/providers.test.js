import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp } from '../src/app.js';
import { DATA_LOADERS } from '../src/data.js';
import { InputError } from '../src/findtreatment.js';
import { createProviderSearch, expandRow, PROVIDER_TYPES } from '../src/providers.js';
import { parseVaFeatures } from '../scripts/sources/va-facilities.mjs';
import { parseIhsFeatures } from '../scripts/sources/ihs-facilities.mjs';
import { selectErHospitals, attachCoordinates } from '../scripts/sources/er-hospitals.mjs';
import { selectRuralHealthClinics } from '../scripts/sources/rural-health-clinics.mjs';
import { cleanStreet, parseGeocoderResponse, placeRow } from '../scripts/sources/_geocode.mjs';
import { tidyCaps, formatPhone, zip5 } from '../scripts/sources/_text.mjs';

const providerData = {
  vaFacilities: DATA_LOADERS.vaFacilities(),
  ihsFacilities: DATA_LOADERS.ihsFacilities(),
  erHospitals: DATA_LOADERS.erHospitals(),
  ruralHealthClinics: DATA_LOADERS.ruralHealthClinics(),
  meta: DATA_LOADERS.meta(),
};
const providers = createProviderSearch(providerData);
const q = (s) => new URLSearchParams(s);

test('all four provider datasets are loaded and non-empty', () => {
  assert.deepEqual(PROVIDER_TYPES.sort(), ['er', 'ihs', 'rhc', 'va']);
  assert.ok(providers.counts.va > 1000, `va count: ${providers.counts.va}`);
  assert.ok(providers.counts.ihs > 500, `ihs count: ${providers.counts.ihs}`);
  assert.ok(providers.counts.er > 3000, `er count: ${providers.counts.er}`);
  assert.ok(providers.counts.rhc > 4000, `rhc count: ${providers.counts.rhc}`);
});

test('VA search supports health and vetcenter filters and omits raw lat/lng', () => {
  const all = providers.search(q('type=va&radius=50'), { lat: 47.61, lng: -122.33 });
  assert.equal(all.type, 'va');
  assert.ok(all.total > 0);
  assert.ok(all.results.every((r) => r.lat === undefined && r.lng === undefined));
  assert.ok(all.results.every((r) => r.detailsUrl.startsWith('https://www.va.gov/find-locations/facility/')));

  const vc = providers.search(q('type=va&radius=50&filter=vetcenter'), { lat: 47.61, lng: -122.33 });
  assert.ok(vc.total > 0);
  assert.ok(vc.results.every((r) => r.category === 'vc' || r.category === 'mvc'));
  assert.ok(vc.results.every((r) => r.detailsUrl.includes('/vc_')));

  const health = providers.search(q('type=va&radius=50&filter=health'), { lat: 47.61, lng: -122.33 });
  assert.ok(health.total > 0);
  assert.ok(health.results.every((r) => r.category !== 'vc' && r.category !== 'mvc'));
});

test('IHS search supports bh and sud filters', () => {
  // Gallup / Window Rock area (Navajo Nation)
  const all = providers.search(q('type=ihs&radius=100'), { lat: 35.53, lng: -108.74 });
  assert.equal(all.type, 'ihs');
  assert.ok(all.total > 0);
  const bh = providers.search(q('type=ihs&radius=100&filter=bh'), { lat: 35.53, lng: -108.74 });
  assert.ok(bh.results.every((r) => r.flags.includes('bh')));
  const sud = providers.search(q('type=ihs&radius=100&filter=sud'), { lat: 35.53, lng: -108.74 });
  assert.ok(sud.results.every((r) => r.flags.includes('sud')));
});

test('ER hospital and Rural Health Clinic searches sort by distance', () => {
  const er = providers.search(q('type=er&radius=25'), { lat: 48.75, lng: -122.48 });
  assert.ok(er.total > 0);
  assert.ok(er.results.every((r, i, a) => i === 0 || a[i - 1].miles <= r.miles));
  assert.ok(er.results[0].detailsUrl.startsWith('https://www.medicare.gov/care-compare/details/hospital/'));

  const rhc = providers.search(q('type=rhc&radius=100'), { lat: 47.05, lng: -109.43 });
  assert.ok(rhc.total > 0);
  assert.ok(rhc.results.every((r) => r.category === 'rhc' && r.miles <= 100));
});

test('provider search rejects invalid type, radius, or filter with InputError', () => {
  assert.throws(() => providers.search(q('type=bogus'), { lat: 48, lng: -122 }), InputError);
  assert.throws(() => providers.search(q('type=va&radius=13'), { lat: 48, lng: -122 }), InputError);
  assert.throws(() => providers.search(q('type=va&filter=bogus'), { lat: 48, lng: -122 }), InputError);
  assert.throws(() => providers.search(q('type=er&filter=bh'), { lat: 48, lng: -122 }), InputError);
  assert.throws(() => providers.summary({ lat: 48, lng: -122, radiusMiles: 13 }), InputError);
});

test('providers.summary returns counts and nearest facility across all four federal networks', () => {
  const sum = providers.summary({ lat: 48.75, lng: -122.48, radiusMiles: 50 });
  assert.deepEqual(Object.keys(sum).sort(), ['er', 'ihs', 'rhc', 'va']);
  for (const key of ['va', 'ihs', 'rhc', 'er']) {
    assert.equal(typeof sum[key].count, 'number');
    assert.ok(sum[key].count > 0, `expected ${key} count > 0`);
    assert.ok(sum[key].nearest, `expected nearest for ${key}`);
    assert.equal(sum[key].nearest.type, key);
    assert.ok(sum[key].nearest.miles <= 50);
    assert.equal(sum[key].nearest.lat, undefined);
    assert.equal(sum[key].nearest.lng, undefined);
  }
});

test('provider builder helpers clean and filter raw source records', () => {
  assert.equal(tidyCaps('ST. MARY MEDICAL CENTER OF WALLA WALLA'), 'St. Mary Medical Center of Walla Walla');
  assert.equal(formatPhone('18006624357'), '(800) 662-4357');
  assert.equal(zip5('601'), null);
  assert.equal(zip5('6390'), '06390');
  assert.equal(cleanStreet('TWO ST VINCENT CIRCLE (BLDG B) P.O. BOX 12'), '2 ST VINCENT CIRCLE');

  const va = parseVaFeatures([
    { STA_NO: '663', STA_NAME: 'Seattle VA Medical Center', S_ABBR: 'VAMC', S_ADD2: '1660 S Columbian Way', S_CITY: 'Seattle', S_STATE: 'WA', S_ZIP: '98108', LAT: 47.561, LON: -122.308 },
    { STA_NO: '999', STA_NAME: 'Excluded CLC', S_ABBR: 'CLC', S_STATE: 'WA', LAT: 47.5, LON: -122.3 },
  ]);
  assert.equal(va.length, 1);
  assert.equal(expandRow('va', va[0]).category, 'vamc');

  const ihs = parseIhsFeatures([
    { attributes: { GlobalID: '1', STATUS: 'Active', ITU_CODE: 'T', FACILITY_NAME: 'Lummi Tribal Health Center', FHC_Facility_Type: 'Health Center', PHYSICAL_STREET: '2592 Kwina Rd', CITY: 'Bellingham', STATE: 'WA', ZIP: '98226', BH_FLAG: '1', SUD: '1' }, geometry: { x: -122.65, y: 48.79 } },
    { attributes: { GlobalID: '2', STATUS: 'Active', ITU_CODE: 'T', FACILITY_NAME: 'Tribal Boarding School Clinic', SERVICE_TYPE: 'Boarding School Clinic', STATE: 'WA' }, geometry: { x: -122, y: 48 } },
  ]);
  assert.equal(ihs.length, 1);
  assert.deepEqual(ihs[0].f, ['bh', 'sud']);

  const erSelected = selectErHospitals([
    { 'Facility ID': '500001', 'Facility Name': 'PEACEHEALTH ST JOSEPH', Address: '2901 SQUALICUM PKWY', 'City/Town': 'BELLINGHAM', State: 'WA', 'ZIP Code': '98225', 'Hospital Type': 'Acute Care Hospitals', 'Emergency Services': 'Yes', 'Telephone Number': '3607345400' },
    { 'Facility ID': '500002', 'Facility Name': 'NO ER HOSPITAL', Address: '1 MAIN', 'City/Town': 'X', State: 'WA', 'ZIP Code': '98225', 'Hospital Type': 'Acute Care Hospitals', 'Emergency Services': 'No' },
  ]);
  assert.equal(erSelected.length, 1);
  const placed = attachCoordinates(erSelected, new Map([['500001', { lat: 48.77, lng: -122.48, approx: false }]]));
  assert.equal(placed.length, 1);
  assert.equal(placed[0].x, undefined);

  const rhcSelected = selectRuralHealthClinics([
    { 'PROVIDER TYPE TEXT': 'Rural Health Clinic', CCN: '503999', 'DOING BUSINESS AS NAME': 'FORKS FAMILY CLINIC', 'ADDRESS LINE 1': '100 A ST', CITY: 'FORKS', STATE: 'WA', 'ZIP CODE': '98331' },
  ]);
  assert.equal(rhcSelected.length, 1);
  assert.equal(rhcSelected[0].n, 'Forks Family Clinic');

  const geoMap = parseGeocoderResponse('"1","100 A St, Forks, WA, 98331","Match","Exact","100 A ST, FORKS, WA, 98331","-124.385,47.950","123","L"');
  const where = placeRow({ id: '1', city: 'Forks', state: 'WA', zip: '98331' }, geoMap, new Map([['98331', [47.95, -124.38]]]));
  assert.deepEqual(where, { lat: 47.95, lng: -124.385, approx: false });
});

let server;
let base;
before(async () => {
  server = createServer(createApp({ logger: { error() {} } }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((r) => server.close(r)));

test('GET /api/providers serves results and returns 400 on invalid parameters', async () => {
  const res = await fetch(`${base}/api/providers?type=er&lat=48.75&lng=-122.48&radius=25`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.type, 'er');
  assert.ok(body.total > 0);
  assert.ok(body.results.length > 0);

  const bad = await fetch(`${base}/api/providers?type=unknown&lat=48.75&lng=-122.48`);
  assert.equal(bad.status, 400);
});
