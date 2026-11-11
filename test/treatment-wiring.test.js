import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installMockDom } from './fixtures/mockDomHelper.js';

const storageWrites = [];
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: () => null, setItem: (...args) => storageWrites.push(args), removeItem: () => {},
} });
const { evaluateFacilityCoverage, rankFacilitiesByInsurance, getInsuranceState, resetInsuranceState } = await import('../public/js/views/insuranceHelpers.js');
const { renderFacilityInsuranceBadgeHTML } = await import('../public/js/views/insuranceWidget.js');
const { buildTerritoryAndRuralFallback, searchWithEquityFallback } = await import('../public/js/views/territoryEquity.js');
const { treatmentView } = await import('../public/js/views/treatment.js');
const { providerFinder } = await import('../public/js/components/providers.js');
const { api } = await import('../public/js/api.js');
const { state } = await import('../public/js/state.js');

function installDom() {
  const restore = installMockDom();
  // The shared shim represents text nodes as plain objects. Give those nodes
  // the native remove() behavior used when the live selector refreshes.
  const prototype = Object.getPrototypeOf(document.createElement('div'));
  const appendChild = prototype.appendChild;
  prototype.appendChild = function (child) {
    if (child && typeof child.remove !== 'function') child.remove = function () {
      const siblings = this.parentNode?.children;
      const index = siblings?.indexOf(this) ?? -1;
      if (index >= 0) siblings.splice(index, 1);
    };
    return appendChild.call(this, child);
  };
  return restore;
}

test('coverage badges expose all five tiers and never infer an ED from detox codes', () => {
  const restore = installDom();
  try {
    const cases = [
      [{ providerType: 'er' }, 'uninsured', 'EMTALA_PROTECTED'],
      [{ codes: ['MD'] }, 'medicaid', 'CONFIRMED_MATCH'],
      [{ codes: ['PI'] }, 'private', 'VERIFY_NETWORK'],
      [{ codes: ['SS'] }, 'medicaid', 'SAFETY_NET_FALLBACK'],
      [{ codes: [] }, 'medicaid', 'UNVERIFIED_OR_MISMATCH'],
    ];
    for (const [facility, coverageSelection, tier] of cases) {
      const options = { coverageSelection, emergency: true };
      assert.equal(evaluateFacilityCoverage(facility, coverageSelection, options).id, tier);
      assert.equal(renderFacilityInsuranceBadgeHTML(facility, options).dataset.tier, tier);
    }
    assert.notEqual(evaluateFacilityCoverage({ codes: ['DT', 'HI'] }, 'uninsured', { emergency: true }).id, 'EMTALA_PROTECTED');
    const input = Object.freeze([
      Object.freeze({ id: 'mismatch', codes: ['PI'], miles: 1 }),
      Object.freeze({ id: 'far', codes: ['MD'], miles: 12 }),
      Object.freeze({ id: 'near', codes: ['MD'], miles: 2 }),
      Object.freeze({ id: 'safety', codes: ['SS'], miles: 4 }),
    ]);
    assert.deepEqual(rankFacilitiesByInsurance(input, 'medicaid').map((f) => f.id), ['near', 'far', 'safety', 'mismatch']);
    assert.ok(input.every((f) => !Object.hasOwn(f, 'coverageMatch')));
  } finally { restore(); }
});

test('treatment handoff and coverage chips re-rank cards in RAM without another search', async () => {
  const restore = installDom();
  const previous = { treatment: api.treatment, summary: api.nearbySummary, fetch: globalThis.fetch, window: globalThis.window };
  const searches = [];
  let view;
  try {
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ states: [], links: {}, region: { code: 'WA', name: 'Washington' } }) });
    api.nearbySummary = async () => null;
    api.treatment = async (args) => {
      searches.push(args);
      return { page: 1, totalPages: 1, total: 4, results: [
        { id: 'pi', name: 'Private Only', codes: ['PI'], miles: 1, services: [] },
        { id: 'md', name: 'Medicaid Program', codes: ['MD'], miles: 5, services: [] },
        { id: 'ss', name: 'Sliding Fee Program', codes: ['SS'], miles: 3, services: [] },
        { id: 'none', name: 'Unverified Program', codes: [], miles: 7, services: [] },
      ] };
    };
    state.location = { lat: 47.61, lng: -122.33, label: 'Local area', state: 'WA' };
    state.radius = 25;
    resetInsuranceState();
    view = treatmentView({ query: new URLSearchParams('codes=OTP'), handoff: { codes: ['PW', 'BU'] } });
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(searches[0].codes, ['PW', 'BU']);
    assert.equal(view.querySelectorAll('.facility')[0].querySelector('.facility-name').textContent, 'Private Only');
    const medicaid = view.querySelectorAll('button').find((button) => button.dataset.coverage === 'medicaid');
    medicaid.click();
    assert.equal(getInsuranceState().selectedCoverage, 'medicaid');
    assert.equal(view.querySelectorAll('.facility')[0].querySelector('.facility-name').textContent, 'Medicaid Program');
    assert.equal(searches.length, 1);
    for (const card of view.querySelectorAll('.facility')) {
      const details = card.querySelector('.admissions-questions');
      assert.match(details.textContent, /Questions to Ask Admissions/);
      assert.match(details.textContent, /MHPAEA/);
      assert.match(details.textContent, /18 U\.S\.C\. § 220/);
    }
    assert.equal(storageWrites.length, 0);
    assert.ok(view.querySelectorAll('a').every((link) => !/coverage=|insurance=|lat=|lng=/.test(link.getAttribute('href') ?? '')));
    // Even an explicitly opted-in directory bookmark must exclude the lens.
    state.persist = true;
    view.querySelector('.save-btn').click();
    const bookmark = JSON.parse(storageWrites.at(-1)[1])[0];
    assert.equal(Object.hasOwn(bookmark, 'coverageMatch'), false);
    assert.equal(Object.hasOwn(bookmark, 'matchedCodes'), false);
  } finally {
    view?._cleanup();
    state.location = null; state.radius = 25; state.persist = false; state.saved.clear(); storageWrites.length = 0; resetInsuranceState();
    api.treatment = previous.treatment; api.nearbySummary = previous.summary;
    globalThis.fetch = previous.fetch; globalThis.window = previous.window;
    restore();
  }
});

test('provider search expands a sparse area and renders HRSA / IHS safety-net cards', async () => {
  const restore = installDom();
  const previous = { providers: api.providers, healthCenters: api.healthCenters, summary: api.nearbySummary, fetch: globalThis.fetch };
  const requests = [];
  let finder;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ states: [], links: {}, region: { code: 'MT', name: 'Montana' } }) });
    api.nearbySummary = async () => null;
    api.providers = async ({ type, radius }) => {
      requests.push([type, radius]);
      return { total: type === 'va' && radius === 25 ? 0 : 1, results: type === 'va' && radius === 25 ? [] : [{ id: type, name: `${type.toUpperCase()} care`, providerType: type }] };
    };
    api.healthCenters = async ({ radius }) => {
      requests.push(['hrsa', radius]);
      return { total: 1, results: [{ id: 'hc', name: 'HRSA community care', street: '', city: '', state: 'MT', zip: '' }] };
    };
    state.location = { lat: 47, lng: -109, label: 'Rural area', state: 'MT' };
    state.radius = 25;
    finder = providerFinder({ initialKind: 'va' });
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(requests, [['va', 25], ['va', 250], ['hrsa', 250], ['ihs', 250]]);
    assert.equal(state.radius, 250);
    assert.match(finder.querySelector('.provider-equity-slot').textContent, /HRSA community care/);
    assert.match(finder.querySelector('.provider-equity-slot').textContent, /IHS care/);
    assert.match(finder.querySelector('.provider-equity-slot').textContent, /eligibility requirements/);
  } finally {
    finder?._cleanupFinder(); state.location = null; state.radius = 25;
    api.providers = previous.providers; api.healthCenters = previous.healthCenters; api.nearbySummary = previous.summary; globalThis.fetch = previous.fetch;
    restore();
  }
});

test('all island territories widen immediately; sparse searches widen once and fetch federal safety nets', async () => {
  for (const territory of ['PR', 'GU', 'VI', 'AS', 'MP']) {
    const policy = buildTerritoryAndRuralFallback({ location: { state: territory }, radius: 10 });
    assert.equal(policy.radius, 250);
    assert.deepEqual(policy.networks, ['hrsa', 'va', 'ihs']);
  }
  assert.equal(buildTerritoryAndRuralFallback({ location: { state: 'WA' }, radius: 25, resultCount: 4 }).active, false);
  const radii = [];
  const networks = [];
  const result = await searchWithEquityFallback({
    location: { state: 'MT', lat: 47, lng: -109 }, radius: 25,
    search: async (radius) => { radii.push(radius); return { total: radius === 25 ? 1 : 5, results: [] }; },
    api: {
      healthCenters: async ({ radius }) => { networks.push(['hrsa', radius]); return { results: [{ id: 'hc' }] }; },
      providers: async ({ type, radius }) => { networks.push([type, radius]); if (type === 'ihs') throw new Error('Unavailable'); return { results: [{ id: 'va' }] }; },
    },
  });
  assert.deepEqual(radii, [25, 250]);
  assert.deepEqual(networks, [['hrsa', 250], ['va', 250], ['ihs', 250]]);
  assert.deepEqual(result.safetyNetResults.map((f) => f.kind), ['health-center', 'provider']);
  assert.deepEqual(result.unavailableNetworks, ['ihs']);
  assert.equal(result.data.total, 5);
  assert.ok(!JSON.stringify(result.fallback).includes('lat'));
});

test('cancelled equity searches cannot fetch or render stale safety-net data', async () => {
  const controller = new AbortController();
  await assert.rejects(searchWithEquityFallback({
    location: { state: 'PR' }, radius: 25, signal: controller.signal,
    search: async () => { controller.abort(); return { total: 1 }; },
    api: { healthCenters: () => assert.fail('cancelled'), providers: () => assert.fail('cancelled') },
  }), { name: 'AbortError' });
});
