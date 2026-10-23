import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALL_POPULATION_RECOMMENDERS,
  CARE_ROUTE_IDS,
  MAX_ROUTE_CODES,
  REENTRY_TRANSITION_INPUT,
  buildCareRoutes,
  buildTreatmentHref,
  detectCareRoutes,
} from '../public/js/views/populationHelpers.js';
import { evaluateTransitionRisk, getPopulationCareRoutes } from '../public/js/views/navigator.js';
import { TREATMENT_FILTERS } from '../public/js/codes.js';

const taxonomy = JSON.parse(readFileSync(new URL('../data/service-codes.json', import.meta.url), 'utf8'));
// Codes valid for a substance use ('sa') search, which is what #/treatment runs.
const SA_CODES = new Set(taxonomy.categories.flatMap((c) => c.services.filter((s) => s.sa).map((s) => s.code)));
const FINDER_CODES = new Set(TREATMENT_FILTERS.flatMap((g) => g.options.map((o) => o.code)));

/** Parse a link the way the finder does (app.js parseHash + core.js treatmentView). */
function parseFinderHref(href) {
  assert.match(href, /^#\/treatment(\?codes=[A-Z0-9_,]+)?$/, `Unexpected link shape: ${href}`);
  const [path, qs = ''] = href.slice(1).split('?');
  const query = new URLSearchParams(qs);
  assert.equal(path, '/treatment');
  assert.deepEqual([...query.keys()].filter((k) => k !== 'codes'), [], `Link carries more than codes: ${href}`);
  return (query.get('codes') ?? '').split(',').filter(Boolean);
}

function assertValidLink(href, label) {
  const codes = parseFinderHref(href);
  assert.ok(codes.length >= 1, `${label}: link has no codes`);
  assert.ok(codes.length <= MAX_ROUTE_CODES, `${label}: more than ${MAX_ROUTE_CODES} codes`);
  assert.equal(new Set(codes).size, codes.length, `${label}: duplicate codes`);
  for (const code of codes) {
    assert.ok(SA_CODES.has(code), `${label}: ${code} is not a SAMHSA substance use service code`);
    assert.ok(FINDER_CODES.has(code), `${label}: ${code} is not a filter shown in the treatment finder`);
  }
  return codes;
}

// Every combination of answers that can trigger a route, plus no-route cases.
const SCENARIOS = [];
for (const biomedical of ['none', 'pregnant', 'acute_infection']) {
  for (const population of ['', 'ADOL', 'YA', 'CJ', 'VET']) {
    for (const substances of [[], ['opioids'], ['alcohol'], ['xylazine', 'opioids'], ['benzos', 'xylazine']]) {
      for (const withdrawalRisk of ['none', 'moderate', 'severe']) {
        for (const mentalHealth of ['none', 'mild_moderate']) {
          SCENARIOS.push({ biomedical, population, substances, withdrawalRisk, mentalHealth, preferTelehealth: population === 'YA' });
        }
      }
    }
  }
}

describe('buildTreatmentHref()', () => {
  it('builds code-only finder links, deduplicated and capped at 8', () => {
    assert.equal(buildTreatmentHref([]), '#/treatment');
    assert.equal(buildTreatmentHref(['PW', 'bu', 'PW']), '#/treatment?codes=PW,BU');
    assert.equal(buildTreatmentHref(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']).split(',').length, 8);
    assert.equal(buildTreatmentHref(['PW&age=17', 'BU']), '#/treatment?codes=BU', 'Rejects anything that is not a bare code');
  });
});

describe('detectCareRoutes()', () => {
  it('returns no routes for empty answers', () => {
    assert.deepEqual(detectCareRoutes(), []);
    assert.deepEqual(detectCareRoutes({ population: 'VET', substances: ['opioids'] }), []);
  });

  it('detects each Phase 1 population from navigator answers', () => {
    assert.deepEqual(detectCareRoutes({ biomedical: 'pregnant' }), ['pregnancy']);
    assert.deepEqual(detectCareRoutes({ population: 'ADOL' }), ['youth']);
    assert.deepEqual(detectCareRoutes({ population: 'YA' }), ['youth']);
    assert.deepEqual(detectCareRoutes({ population: 'CJ' }), ['reentry']);
    assert.deepEqual(detectCareRoutes({ substances: new Set(['xylazine']) }), ['xylazine']);
    assert.deepEqual(detectCareRoutes({ substances: 'opioids,xylazine' }), ['xylazine']);
  });

  it('returns several routes in a stable order when more than one applies', () => {
    assert.deepEqual(
      detectCareRoutes({ biomedical: 'pregnant', population: 'ADOL', substances: ['xylazine'] }),
      ['pregnancy', 'youth', 'xylazine'],
    );
    for (const id of detectCareRoutes({ biomedical: 'pregnant', population: 'CJ', substances: ['xylazine'] })) {
      assert.ok(CARE_ROUTE_IDS.includes(id));
    }
  });
});

describe('buildCareRoutes() — route content', () => {
  it('pregnancy: PW first, MOUD continuation for opioids, never detox (DT) or tapering advice', () => {
    const [route] = buildCareRoutes({ biomedical: 'pregnant', substances: ['opioids'], withdrawalRisk: 'moderate' });
    assert.equal(route.id, 'pregnancy');
    assert.deepEqual(route.links[0].codes, ['PW']);
    assert.ok(route.links.some((l) => l.codes.includes('BU')));
    assert.ok(route.links.some((l) => l.codes.includes('OTP')));
    assert.ok(route.why.some((w) => /keep taking it/i.test(w) && /ACOG/.test(w)));
    const all = [route.fits, ...route.why].join(' ');
    assert.doesNotMatch(all, /\btaper\b|\bwean\b/i, 'Must never suggest tapering MOUD in pregnancy');
    for (const l of route.links) assert.ok(!l.codes.includes('DT'), 'Pregnancy route must not send people to detox');
  });

  it('pregnancy: postpartum overdose risk and naloxone are always mentioned', () => {
    const [route] = buildCareRoutes({ biomedical: 'pregnant' });
    assert.ok(route.why.some((w) => /after (birth|delivery)/i.test(w) && /naloxone/i.test(w)));
  });

  it('pregnancy with alcohol/sedatives warns against stopping suddenly and adds hospital care when risk is high', () => {
    const [route] = buildCareRoutes({ biomedical: 'pregnant', substances: ['alcohol'], withdrawalRisk: 'moderate' });
    assert.ok(route.why.some((w) => /suddenly/i.test(w)));
    assert.ok(route.links.some((l) => l.codes.join() === 'PW,HI'));
  });

  it('youth: uses ADOL for teens and YA for young adults, adds MOUD and co-occurring links when relevant', () => {
    const [teen] = buildCareRoutes({ population: 'ADOL', substances: ['opioids'], mentalHealth: 'mild_moderate' });
    assert.equal(teen.id, 'youth');
    assert.deepEqual(teen.links[0].codes, ['ADOL']);
    assert.ok(teen.links.some((l) => l.codes.join() === 'ADOL,BU'));
    assert.ok(teen.links.some((l) => l.codes.join() === 'ADOL,MHSU'));
    assert.ok(teen.why.some((w) => /state law/i.test(w)));

    const [ya] = buildCareRoutes({ population: 'YA', preferTelehealth: true });
    assert.deepEqual(ya.links[0].codes, ['YA']);
    assert.ok(ya.links.some((l) => l.codes.join() === 'YA,TELE'));
    assert.ok(ya.links.every((l) => !l.codes.includes('ADOL')));
  });

  it('reentry: built on evaluateTransitionRisk(post_release), with overdose risk, MOUD continuity, and naloxone', () => {
    const transition = evaluateTransitionRisk(REENTRY_TRANSITION_INPUT);
    assert.equal(transition.riskBand, 'critical');
    const [route] = buildCareRoutes({ population: 'CJ' }, { transition });
    assert.equal(route.id, 'reentry');
    assert.ok(route.why.some((w) => /overdose/i.test(w) && /release/i.test(w)));
    assert.ok(route.why.some((w) => /keep taking it/i.test(w)));
    assert.ok(route.why.some((w) => /naloxone/i.test(w)));
    const linkCodes = new Set(route.links.flatMap((l) => l.codes));
    for (const code of ['CJ', 'BU', 'OTP', 'NOE']) assert.ok(linkCodes.has(code), `Expected ${code} in reentry links`);
    for (const code of linkCodes) {
      assert.ok(code === 'OTP' || transition.recommendedCodes.includes(code), `${code} should come from the transition engine`);
    }
  });

  it('xylazine: naloxone still given, wound care, and urgent hospital link when withdrawal or infection is present', () => {
    const [calm] = buildCareRoutes({ substances: ['xylazine'] });
    assert.equal(calm.id, 'xylazine');
    assert.equal(calm.urgent, false);
    assert.ok(calm.why.some((w) => /naloxone/i.test(w) && /911/.test(w)));
    assert.ok(calm.why.some((w) => /wound/i.test(w)));
    assert.ok(!calm.links.some((l) => l.codes.includes('HI')));

    for (const answers of [
      { substances: ['xylazine'], withdrawalRisk: 'moderate' },
      { substances: ['xylazine'], biomedical: 'acute_infection' },
    ]) {
      const [urgent] = buildCareRoutes(answers);
      assert.equal(urgent.urgent, true);
      assert.deepEqual(urgent.links[0].codes, ['HI']);
      assert.match(urgent.why[0], /emergency department/i);
    }
  });

  it('every route has a title, fit, reasons, sources, and at least one search link', () => {
    const routes = buildCareRoutes(
      { biomedical: 'pregnant', population: 'CJ', substances: ['xylazine', 'opioids'] },
      { transition: evaluateTransitionRisk(REENTRY_TRANSITION_INPUT) },
    );
    assert.deepEqual(routes.map((r) => r.id), ['pregnancy', 'reentry', 'xylazine']);
    for (const r of routes) {
      assert.ok(r.title && r.fits && r.sources);
      assert.ok(r.why.length >= 2);
      assert.ok(r.links.length >= 1);
      for (const x of r.extraLinks) assert.match(x.href, /^#\/[a-z-]+$/);
    }
  });

  it('adds no medication doses or schedules', () => {
    const text = SCENARIOS.flatMap((a) => getPopulationCareRoutes(a))
      .flatMap((r) => [r.title, r.fits, ...r.why, ...r.links.map((l) => l.label)])
      .join(' ');
    assert.doesNotMatch(text, /\b\d+(\.\d+)?\s*(mg|mcg|µg|ml|milligram)/i);
    assert.doesNotMatch(text, /\b(once|twice|three times) (a|per) day\b|\bevery \d+ hours?\b/i);
  });
});

describe('getPopulationCareRoutes() (navigator integration)', () => {
  it('ignores populations the navigator does not offer and returns nothing for baseline answers', () => {
    assert.deepEqual(getPopulationCareRoutes(), []);
    assert.deepEqual(getPopulationCareRoutes({ population: 'CJ&x=1' }), []);
  });

  it('every generated link, across all answer combinations, uses only real finder codes', () => {
    let checked = 0;
    for (const answers of SCENARIOS) {
      for (const route of getPopulationCareRoutes(answers)) {
        for (const l of route.links) {
          const codes = assertValidLink(l.href, `${route.id}/${l.label}`);
          assert.deepEqual(codes, l.codes);
          checked += 1;
        }
      }
    }
    assert.ok(checked > 500, `Expected many links to be checked, got ${checked}`);
  });

  it('links never carry answers: only the codes the person would pick in the finder', () => {
    const routes = getPopulationCareRoutes({ biomedical: 'pregnant', population: 'ADOL', substances: ['xylazine'], withdrawalRisk: 'severe' });
    for (const r of routes) {
      for (const l of r.links) {
        assert.doesNotMatch(l.href, /pregnan|severe|xylazine|age|adol=|population|biomedical/i);
      }
    }
  });
});

describe('ALL_POPULATION_RECOMMENDERS (Phase 1 helpers)', () => {
  it('every recommender returns real codes and a matching code-only link', () => {
    for (const [name, fn] of Object.entries(ALL_POPULATION_RECOMMENDERS)) {
      const rec = fn();
      const codes = assertValidLink(rec.searchHref, name);
      assert.deepEqual(codes, rec.codes, `${name}: searchHref must match codes`);
      assert.equal(rec.searchHref, buildTreatmentHref(rec.codes));
      assert.ok(rec.guidance.length > 20);
    }
  });

  it('pregnancy preset does not include detox (DT)', () => {
    assert.ok(!ALL_POPULATION_RECOMMENDERS.pregnancy().codes.includes('DT'));
  });
});
