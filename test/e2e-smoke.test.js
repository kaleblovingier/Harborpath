import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, SECURITY_HEADERS } from '../src/app.js';
import { createTaxonomy } from '../src/taxonomy.js';
import { normalizeFacility } from '../src/findtreatment.js';
import { readJson } from '../src/util.js';
import {
  evaluateAsamCare,
  scoreOpioidWithdrawal,
  scoreAlcoholSedativeRisk,
  evaluateTransitionRisk,
  formatAsamHandoffText,
} from '../public/js/views/navigator.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const serviceCodesData = readJson(path.join(here, '..', 'data', 'service-codes.json'));
const taxonomy = createTaxonomy(serviceCodesData);
const realisticFixture = readJson(path.join(here, 'fixtures', 'facilities-realistic.fixture.json'));

// Pre-index each fixture row with its normalized SAMHSA service codes so the
// mock upstream faithfully simulates FindTreatment.gov's sCodes AND-filtering.
const indexedFixtureRows = realisticFixture.rows.map((row) => ({
  row,
  normalized: normalizeFacility(row, taxonomy),
}));

const upstreamRequests = [];
let injectMaliciousWebsiteRow = false;

async function mockUpstreamFetch(url) {
  upstreamRequests.push(url);
  const parsedUrl = new URL(url);
  const sCodesParam = parsedUrl.searchParams.get('sCodes') ?? '';
  const requestedCodes = sCodesParam
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  let matchedRows = indexedFixtureRows
    .filter(({ normalized }) => requestedCodes.every((code) => normalized.codes.includes(code)))
    .map(({ row }) => row);

  if (injectMaliciousWebsiteRow && requestedCodes.includes('XSS_PROBE')) {
    matchedRows = [];
  } else if (injectMaliciousWebsiteRow && requestedCodes.length === 0) {
    matchedRows = [
      ...matchedRows,
      {
        _irow: 99,
        name1: 'Untrusted Website Injection Facility',
        name2: 'Security Probe Clinic',
        street1: '999 Test Ave',
        street2: '',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        phone: '206-555-0199',
        intake1: null,
        hotline1: null,
        website: 'javascript:alert(document.cookie)',
        latitude: '47.6101',
        longitude: '-122.3344',
        miles: 0.9,
        type_facility: 'SA',
        services: [
          { f1: 'Type of Care', f2: 'TC', f3: 'Substance use treatment' },
          { f1: 'Service Setting', f2: 'SET', f3: 'Outpatient' },
        ],
      },
      {
        _irow: 100,
        name1: 'Data URI Injection Facility',
        name2: null,
        street1: '998 Test Ave',
        street2: '',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        phone: '206-555-0198',
        intake1: null,
        hotline1: null,
        website: 'data:text/html,<script>alert(1)</script>',
        latitude: '47.6102',
        longitude: '-122.3345',
        miles: 1.0,
        type_facility: 'SA',
        services: [
          { f1: 'Type of Care', f2: 'TC', f3: 'Substance use treatment' },
          { f1: 'Service Setting', f2: 'SET', f3: 'Outpatient' },
        ],
      },
    ];
  }

  return new Response(
    JSON.stringify({
      page: 1,
      totalPages: matchedRows.length > 0 ? 1 : 0,
      recordCount: matchedRows.length,
      rows: matchedRows,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

describe('End-to-End Integration Smoke Tests (HarborPath User Flows)', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = createApp({
      fetchImpl: mockUpstreamFetch,
      rateLimit: { windowMs: 60_000, max: 500 },
      logger: { error() {} },
    });
    server = createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  describe('Flow 1: Geocode Location + Insurance Provider Filtering', () => {
    it('geocodes "Seattle, WA" and "98101" locally, resolves WA region & nearby summary, and filters treatment by payer codes', async () => {
      const callsBeforeGeocode = upstreamRequests.length;

      // Step 1a: Geocode by city/state ("Seattle, WA")
      const cityGeoRes = await fetch(`${baseUrl}/api/geocode?q=${encodeURIComponent('Seattle, WA')}`);
      assert.equal(cityGeoRes.status, 200);
      assert.equal(cityGeoRes.headers.get('cache-control'), 'no-store');
      const cityGeoBody = await cityGeoRes.json();
      assert.ok(cityGeoBody.results.length > 0, 'Expected geocode results for Seattle, WA');
      const seattleHit = cityGeoBody.results[0];
      assert.match(seattleHit.label, /Seattle, WA/);
      assert.equal(seattleHit.state, 'WA');
      assert.ok(Math.abs(seattleHit.lat - 47.6) < 0.2);
      assert.ok(Math.abs(seattleHit.lng - -122.33) < 0.2);

      // Step 1b: Geocode by ZIP code ("98101")
      const zipGeoRes = await fetch(`${baseUrl}/api/geocode?q=98101`);
      assert.equal(zipGeoRes.status, 200);
      const zipGeoBody = await zipGeoRes.json();
      assert.ok(zipGeoBody.results.length > 0, 'Expected geocode results for 98101');
      assert.equal(zipGeoBody.results[0].kind, 'zip');
      assert.match(zipGeoBody.results[0].label, /98101.*Seattle, WA/);
      assert.equal(zipGeoBody.results[0].state, 'WA');
      assert.equal(upstreamRequests.length, callsBeforeGeocode, 'Geocoding must never make external requests');

      const { lat, lng } = seattleHit;

      // Step 2: Query /api/region and /api/nearby-summary for resolved coordinates
      const regionRes = await fetch(`${baseUrl}/api/region?lat=${lat}&lng=${lng}`);
      assert.equal(regionRes.status, 200);
      const regionBody = await regionRes.json();
      assert.equal(regionBody.region.code, 'WA');
      assert.equal(regionBody.region.name, 'Washington');

      const summaryRes = await fetch(`${baseUrl}/api/nearby-summary?lat=${lat}&lng=${lng}&radius=25`);
      assert.equal(summaryRes.status, 200);
      const summaryBody = await summaryRes.json();
      assert.equal(summaryBody.region.code, 'WA');
      assert.ok(summaryBody.agency?.name, 'State behavioral health agency included');
      assert.ok(summaryBody.medicaid?.agency, 'State Medicaid agency included');
      assert.ok(summaryBody.networks.healthCenters.count > 0);
      assert.ok(summaryBody.networks.va.count > 0);
      assert.ok(summaryBody.networks.er.count > 0);

      // Step 3: Filter /api/treatment across distinct insurance / payment assistance codes
      const payerExpectations = [
        { code: 'MD', label: 'Medicaid', expectedCount: 5 },
        { code: 'MC', label: 'Medicare', expectedCount: 3 },
        { code: 'PI', label: 'Private health insurance', expectedCount: 3 },
        { code: 'TRICARE', label: 'TRICARE military insurance', expectedCount: 2 },
        { code: 'SS', label: 'Sliding fee scale', expectedCount: 3 },
        { code: 'PA', label: 'Payment assistance', expectedCount: 3 },
        { code: 'ITU', label: 'IHS / Tribal / Urban Indian funds', expectedCount: 1 },
      ];

      for (const { code, label, expectedCount } of payerExpectations) {
        const res = await fetch(`${baseUrl}/api/treatment?lat=${lat}&lng=${lng}&radius=25&codes=${code}`);
        assert.equal(res.status, 200, `Expected 200 OK for payer code ${code} (${label})`);
        const body = await res.json();
        assert.equal(body.source, 'SAMHSA FindTreatment.gov');
        assert.equal(
          body.results.length,
          expectedCount,
          `Expected ${expectedCount} facilities for payer code ${code} (${label}), got ${body.results.length}`,
        );
        for (const facility of body.results) {
          assert.ok(
            facility.codes.includes(code),
            `Facility "${facility.name}" should carry requested payer code ${code}`,
          );
          assert.equal(facility.address.state, 'WA');
          assert.ok(facility.phone, `Facility "${facility.name}" must include phone`);
        }
      }
    });
  });

  describe('Flow 2: Facility Type & Clinical Service Filtering + Relaxed Fallback', () => {
    it('filters accurately by clinical service & setting codes and updates matched facility sets', async () => {
      const lat = 47.61;
      const lng = -122.33;

      const clinicalQueries = [
        {
          codes: 'OTP,MU',
          expectedNames: ['Harborview Comprehensive Opioid Treatment Program'],
        },
        {
          codes: 'HI,DT',
          expectedNames: ['Cascade Medical Center Inpatient Detox & Stabilization'],
        },
        {
          codes: 'RES,TRMA,HH',
          expectedNames: ['Rainier Dual-Diagnosis Residential & Trauma Recovery'],
        },
        {
          codes: 'TELE,BU',
          expectedNames: ['Puget Sound Telehealth & Outpatient Recovery Clinic'],
        },
        {
          codes: 'ADOL,CMI,FCO',
          expectedNames: ['Salish Youth & Family Behavioral Health Center'],
        },
        {
          codes: 'BU,MHSU',
          expectedNames: [
            'Harborview Comprehensive Opioid Treatment Program',
            'Cascade Medical Center Inpatient Detox & Stabilization',
            'Rainier Dual-Diagnosis Residential & Trauma Recovery',
            'Puget Sound Telehealth & Outpatient Recovery Clinic',
          ],
        },
      ];

      for (const { codes, expectedNames } of clinicalQueries) {
        const res = await fetch(`${baseUrl}/api/treatment?lat=${lat}&lng=${lng}&radius=25&codes=${codes}`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.deepEqual(
          body.results.map((f) => f.name),
          expectedNames,
          `Mismatch for clinical filter codes=${codes}`,
        );
        const reqCodeList = codes.split(',');
        for (const f of body.results) {
          for (const c of reqCodeList) {
            assert.ok(f.codes.includes(c), `Expected ${f.name} to include code ${c}`);
          }
        }
      }
    });

    it('automatically returns relaxed near-matches ranked by matchedCodes count and distance when multi-code search returns 0 exact hits', async () => {
      // No single facility is simultaneously an OTP (Harborview), a Telehealth provider (Puget Sound),
      // serving Pregnant/Postpartum women (Harborview), and serving Veterans (Puget Sound & Cascade).
      const res = await fetch(
        `${baseUrl}/api/treatment?lat=47.61&lng=-122.33&radius=25&codes=OTP,TELE,PW,VET`,
      );
      assert.equal(res.status, 200);
      const body = await res.json();

      assert.equal(body.total, 0, 'Exact AND-match count should be 0');
      assert.equal(body.results.length, 0);
      assert.ok(body.relaxed, 'Expected relaxed near-match fallback payload');
      assert.deepEqual(body.relaxed.requestedCodes, ['OTP', 'PW', 'TELE', 'VET']);
      assert.equal(body.relaxed.totalUnfiltered, 5);
      assert.equal(body.relaxed.results.length, 3, '3 facilities share at least 1 of the 4 requested codes');

      // Both Puget Sound Telehealth (0.5 mi: TELE, VET) and Harborview OTP (0.8 mi: OTP, PW) match 2 codes;
      // Puget Sound Telehealth must rank #1 because 0.5 miles < 0.8 miles.
      assert.equal(body.relaxed.results[0].name, 'Puget Sound Telehealth & Outpatient Recovery Clinic');
      assert.deepEqual(body.relaxed.results[0].matchedCodes, ['TELE', 'VET']);

      assert.equal(body.relaxed.results[1].name, 'Harborview Comprehensive Opioid Treatment Program');
      assert.deepEqual(body.relaxed.results[1].matchedCodes, ['OTP', 'PW']);

      // Cascade Medical Center (1.4 mi: VET) matches 1 code and ranks #3.
      assert.equal(body.relaxed.results[2].name, 'Cascade Medical Center Inpatient Detox & Stabilization');
      assert.deepEqual(body.relaxed.results[2].matchedCodes, ['VET']);
    });
  });

  describe('Flow 3: Facility Details, External Resource Links & Multi-Network Federal Providers', () => {
    it('validates normalized facility fields, deterministic IDs, complete service taxonomy mapping, and XSS-safe websites', async () => {
      injectMaliciousWebsiteRow = true;
      try {
        // Use a distinct radius (50) so we bypass the 25-mile unfiltered cache entry
        const res = await fetch(`${baseUrl}/api/treatment?lat=47.61&lng=-122.33&radius=50`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.results.length, 7);

        const realFacilities = body.results.slice(0, 5);
        for (const fac of realFacilities) {
          assert.match(fac.id, /^[0-9a-f]{16}$/, `Deterministic 16-hex-char ID required for ${fac.name}`);
          assert.ok(fac.name.length > 0);
          assert.ok(fac.address.street1);
          assert.equal(fac.address.city, 'Seattle');
          assert.equal(fac.address.state, 'WA');
          assert.match(fac.address.zip, /^981\d{2}$/);
          assert.match(fac.phone, /^206-/);
          assert.ok(fac.website?.startsWith('https://'), `Expected https website for ${fac.name}`);
          assert.equal(typeof fac.lat, 'number');
          assert.equal(typeof fac.lng, 'number');
          assert.equal(typeof fac.miles, 'number');
          assert.ok(fac.services.length >= 10, `Expected rich service categories on ${fac.name}`);

          // Verify every single service item maps cleanly in data/service-codes.json
          for (const group of fac.services) {
            assert.ok(group.category);
            assert.ok(group.label);
            for (const item of group.items) {
              const mapped = taxonomy.codeFor(group.category, item);
              assert.ok(mapped, `Service item "${item}" in category "${group.category}" must map to a valid code`);
              assert.ok(fac.codes.includes(mapped));
            }
          }
        }

        // Verify injected javascript: and data: websites are stripped to null
        const jsInjected = body.results.find((f) => f.name === 'Untrusted Website Injection Facility');
        const dataInjected = body.results.find((f) => f.name === 'Data URI Injection Facility');
        assert.ok(jsInjected, 'Found javascript: probe facility');
        assert.equal(jsInjected.website, null, 'javascript: URI must be sanitized to null');
        assert.ok(dataInjected, 'Found data: probe facility');
        assert.equal(dataInjected.website, null, 'data: URI must be sanitized to null');
      } finally {
        injectMaliciousWebsiteRow = false;
      }
    });

    it('serves multi-network federal safety-net providers (VA, IHS, RHC, ER), HRSA Health Centers, Telehealth, and State Directories', async () => {
      // 1. All 4 federal provider networks via /api/providers
      const networkConfigs = [
        { type: 'va', lat: 47.61, lng: -122.33, radius: 50, expectedUrlPrefix: 'https://www.va.gov/find-locations/facility/' },
        { type: 'ihs', lat: 47.61, lng: -122.33, radius: 50, expectedUrlPrefix: null },
        { type: 'rhc', lat: 47.61, lng: -122.33, radius: 100, expectedUrlPrefix: null },
        { type: 'er', lat: 47.61, lng: -122.33, radius: 25, expectedUrlPrefix: 'https://www.medicare.gov/care-compare/details/hospital/' },
      ];

      for (const { type, lat, lng, radius, expectedUrlPrefix } of networkConfigs) {
        const res = await fetch(`${baseUrl}/api/providers?type=${type}&lat=${lat}&lng=${lng}&radius=${radius}`);
        assert.equal(res.status, 200, `Expected 200 OK for /api/providers?type=${type}`);
        const body = await res.json();
        assert.equal(body.type, type);
        assert.ok(body.total > 0, `Expected at least 1 ${type} provider within ${radius} miles`);
        assert.ok(body.results.length > 0);
        assert.ok(body.source, `Expected authoritative source metadata for ${type}`);
        for (const item of body.results) {
          assert.equal(item.type, type);
          assert.ok(item.name);
          assert.ok(item.miles <= radius);
          assert.equal(item.lat, undefined, 'Raw provider latitude is omitted from response payload');
          assert.equal(item.lng, undefined, 'Raw provider longitude is omitted from response payload');
          if (expectedUrlPrefix) {
            assert.ok(item.detailsUrl?.startsWith(expectedUrlPrefix));
          }
        }
      }

      // 2. HRSA Federally Qualified Health Centers (/api/health-centers)
      const hcRes = await fetch(`${baseUrl}/api/health-centers?lat=47.61&lng=-122.33&radius=25`);
      assert.equal(hcRes.status, 200);
      const hcBody = await hcRes.json();
      assert.equal(hcBody.source, 'HRSA Health Center Program');
      assert.ok(hcBody.total > 0);
      assert.ok(hcBody.results[0].name);
      assert.ok(hcBody.results[0].miles <= 25);

      // 3. State Agency & Medicaid Directory (/api/states and /api/state?code=WA)
      const statesRes = await fetch(`${baseUrl}/api/states`);
      assert.equal(statesRes.status, 200);
      const statesBody = await statesRes.json();
      assert.ok(statesBody.states.length >= 56);

      const waRes = await fetch(`${baseUrl}/api/state?code=WA`);
      assert.equal(waRes.status, 200);
      const waBody = await waRes.json();
      assert.equal(waBody.region.code, 'WA');
      assert.equal(waBody.region.name, 'Washington');
      assert.ok(waBody.agency?.name);
      assert.ok(waBody.medicaid?.agency);
      assert.ok(waBody.healthCenters > 0);
      assert.equal(waBody.telehealth, true);

      // 4. Statewide Telehealth search (/api/telehealth)
      const teleRes = await fetch(`${baseUrl}/api/telehealth?state=WA&codes=BU`);
      assert.equal(teleRes.status, 200);
      const teleBody = await teleRes.json();
      assert.equal(teleBody.state.code, 'WA');
      assert.equal(teleBody.source, 'SAMHSA FindTreatment.gov');
      assert.ok(teleBody.results.some((f) => f.name === 'Puget Sound Telehealth & Outpatient Recovery Clinic'));

      // 5. Dataset freshness & health check (/api/meta and /api/health)
      const metaRes = await fetch(`${baseUrl}/api/meta`);
      assert.equal(metaRes.status, 200);
      for (const [hdr, val] of Object.entries(SECURITY_HEADERS)) {
        assert.equal(metaRes.headers.get(hdr.toLowerCase()), val);
      }
      const metaBody = await metaRes.json();
      assert.ok(metaBody.dataBuiltAt);
      assert.ok(metaBody.healthCenters.count > 1000);
    });
  });

  describe('Flow 4: Clinical Navigator -> Treatment Directory Handoff', () => {
    it('evaluates patient scenarios with ASAM 4th Edition engine and executes live /api/treatment queries with the recommended codes', async () => {
      // Scenario A: Patient with moderate opioid withdrawal (computed via scoreOpioidWithdrawal),
      // Medicaid coverage (MD), and Telehealth preference (TELE).
      const withdrawalCalc = scoreOpioidWithdrawal({
        restlessness: 2,
        sweating_chills: 2,
        muscle_bone_aches: 2,
        gi_upset: 2,
        anxiety_irritability: 2,
      });
      assert.equal(withdrawalCalc.score, 10);
      assert.equal(withdrawalCalc.band, 'mild');
      assert.equal(withdrawalCalc.navWithdrawalRisk, 'mild');

      const scenarioA = {
        substances: ['opioids'],
        withdrawalRisk: withdrawalCalc.navWithdrawalRisk,
        biomedical: 'none',
        mentalHealth: 'none',
        environment: 'supportive',
        structureNeeded: 'flexible',
        preferTelehealth: true,
        payment: 'MD',
      };
      const evalA = evaluateAsamCare(scenarioA);
      assert.equal(evalA.asamLevel, 'ASAM Level 1.0 / 1.5');
      assert.ok(evalA.codes.length <= 8, 'Navigator codes strictly capped at <= 8');
      assert.deepEqual(evalA.codes, ['OP', 'TELE', 'BU', 'MD']);

      const handoffNoteA = formatAsamHandoffText(scenarioA, evalA);
      assert.match(handoffNoteA, /ASAM Level 1\.0 \/ 1\.5/);
      assert.match(handoffNoteA, /#/);

      // Execute live /api/treatment handoff using evalA.codes
      const resA = await fetch(
        `${baseUrl}/api/treatment?lat=47.61&lng=-122.33&radius=25&codes=${evalA.codes.join(',')}`,
      );
      assert.equal(resA.status, 200);
      const bodyA = await resA.json();
      assert.equal(bodyA.results.length, 1);
      assert.equal(bodyA.results[0].name, 'Puget Sound Telehealth & Outpatient Recovery Clinic');

      // Scenario B: Pregnant patient using opioids with Medicaid coverage -> Perinatal MOUD priority
      const evalB = evaluateAsamCare({
        substances: ['opioids'],
        withdrawalRisk: 'mild',
        biomedical: 'pregnant',
        payment: 'MD',
      });
      assert.equal(evalB.asamLevel, 'ASAM Level 1.0 / 1.5');
      assert.deepEqual(evalB.codes, ['OP', 'PW', 'BU', 'MD']);
      assert.ok(evalB.redFlags.some((f) => /Pregnan/i.test(f)));

      const resB = await fetch(
        `${baseUrl}/api/treatment?lat=47.61&lng=-122.33&radius=25&codes=${evalB.codes.join(',')}`,
      );
      assert.equal(resB.status, 200);
      const bodyB = await resB.json();
      assert.equal(bodyB.results.length, 1);
      assert.equal(bodyB.results[0].name, 'Harborview Comprehensive Opioid Treatment Program');

      // Scenario C: High-risk GABAergic (alcohol/benzo) withdrawal (computed via scoreAlcoholSedativeRisk)
      // + co-occurring mental health + Medicare -> ASAM Level 3.7-WM / 4.0 Inpatient Detox
      const gabaCalc = scoreAlcoholSedativeRisk({
        dailyHeavyUse: true,
        priorSeizuresOrDTs: true,
        tremorSweatingAgitation: true,
      });
      assert.equal(gabaCalc.riskLevel, 'high_seizure_dt_risk');
      assert.equal(gabaCalc.navWithdrawalRisk, 'severe');

      const evalC = evaluateAsamCare({
        substances: ['alcohol', 'benzos'],
        withdrawalRisk: gabaCalc.navWithdrawalRisk,
        mentalHealth: 'mild_moderate',
        payment: 'MC',
      });
      assert.equal(evalC.asamLevel, 'ASAM Level 3.7-WM / 4.0');
      assert.deepEqual(evalC.codes, ['DT', 'HI', 'PMAT', 'MHSU', 'MC']);

      const resC = await fetch(
        `${baseUrl}/api/treatment?lat=47.61&lng=-122.33&radius=25&codes=${evalC.codes.join(',')}`,
      );
      assert.equal(resC.status, 200);
      const bodyC = await resC.json();
      assert.equal(bodyC.results.length, 1);
      assert.equal(bodyC.results[0].name, 'Cascade Medical Center Inpatient Detox & Stabilization');

      // Scenario D: Unhoused patient with trauma history and opioid use needing 24-hour structure + Sliding Fee
      const evalD = evaluateAsamCare({
        substances: ['opioids'],
        withdrawalRisk: 'mild',
        mentalHealth: 'trauma',
        environment: 'unhoused',
        structureNeeded: '24_hour',
        payment: 'SS',
      });
      assert.equal(evalD.asamLevel, 'ASAM Level 3.1 / 3.5 / 3.7');
      assert.deepEqual(evalD.codes, ['RES', 'HH', 'BU', 'TRMA', 'SS']);

      const resD = await fetch(
        `${baseUrl}/api/treatment?lat=47.61&lng=-122.33&radius=25&codes=${evalD.codes.join(',')}`,
      );
      assert.equal(resD.status, 200);
      const bodyD = await resD.json();
      assert.equal(bodyD.results.length, 1);
      assert.equal(bodyD.results[0].name, 'Rainier Dual-Diagnosis Residential & Trauma Recovery');

      // Scenario E: Post-detox hospital discharge transition risk -> directory handoff
      const transition = evaluateTransitionRisk({
        event: 'post_detox_hospital',
        daysSince: 'under_7',
        onMoud: false,
        hasNaloxone: false,
      });
      assert.equal(transition.riskBand, 'critical');
      assert.deepEqual(transition.recommendedCodes, ['BU', 'OTP', 'NOE', 'PEER']);

      const resE = await fetch(
        `${baseUrl}/api/treatment?lat=47.61&lng=-122.33&radius=25&codes=${transition.recommendedCodes.join(',')}`,
      );
      assert.equal(resE.status, 200);
      const bodyE = await resE.json();
      assert.equal(bodyE.results.length, 1);
      assert.equal(bodyE.results[0].name, 'Harborview Comprehensive Opioid Treatment Program');
    });
  });
});
