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
import { evaluateAsamCare, evaluateTransitionRisk, getPopulationCareRoutes } from '../public/js/views/navigator.js';
import { TREATMENT_FILTERS } from '../public/js/codes.js';
import { getNavigatorHandoffState, resetNavigatorState } from '../public/js/views/navigatorHandoff.js';

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

describe('buildCareRoutes() — answer-specific additions to the pathway cards', () => {
  it('pregnancy: PW first, buprenorphine/methadone searches for opioids, never detox (DT) or tapering advice', () => {
    const [route] = buildCareRoutes({ biomedical: 'pregnant', substances: ['opioids'], withdrawalRisk: 'moderate' });
    assert.equal(route.id, 'pregnancy');
    assert.equal(route.pathwayId, 'pregnancy');
    assert.deepEqual(route.links[0].codes, ['PW']);
    assert.ok(route.links.some((l) => l.codes.join() === 'PW,BU'));
    assert.ok(route.links.some((l) => l.codes.join() === 'OTP'));
    assert.doesNotMatch(route.notes.join(' '), /\btaper\b|\bwean\b/i, 'Must never suggest tapering MOUD in pregnancy');
    for (const l of route.links) assert.ok(!l.codes.includes('DT'), 'Pregnancy route links must not send people to detox');
  });

  it('pregnancy: postpartum overdose risk and naloxone are always mentioned', () => {
    const [route] = buildCareRoutes({ biomedical: 'pregnant' });
    assert.ok(route.notes.some((w) => /after (birth|delivery)/i.test(w) && /naloxone/i.test(w)));
  });

  it('pregnancy with alcohol/sedatives warns against stopping suddenly and adds hospital care when risk is high', () => {
    const [route] = buildCareRoutes({ biomedical: 'pregnant', substances: ['alcohol'], withdrawalRisk: 'moderate' });
    assert.ok(route.notes.some((w) => /suddenly/i.test(w)));
    assert.ok(route.links.some((l) => l.codes.join() === 'PW,HI'));
  });

  it('youth: uses ADOL for teens and YA for young adults, adds MOUD, co-occurring, and telehealth searches when relevant', () => {
    const [teen] = buildCareRoutes({ population: 'ADOL', substances: ['opioids'], mentalHealth: 'mild_moderate' });
    assert.equal(teen.id, 'youth');
    assert.equal(teen.pathwayId, 'youth');
    assert.deepEqual(teen.links[0].codes, ['ADOL']);
    assert.ok(teen.links.some((l) => l.codes.join() === 'ADOL,BU'));
    assert.ok(teen.links.some((l) => l.codes.join() === 'ADOL,MHSU'));

    const [ya] = buildCareRoutes({ population: 'YA', preferTelehealth: true });
    assert.deepEqual(ya.links[0].codes, ['YA']);
    assert.ok(ya.links.some((l) => l.codes.join() === 'YA,TELE'));
    assert.ok(ya.links.every((l) => !l.codes.includes('ADOL')));
  });

  it('reentry: adds to the justice card, with codes from evaluateTransitionRisk(post_release) and a do-not-use-alone note', () => {
    const transition = evaluateTransitionRisk(REENTRY_TRANSITION_INPUT);
    assert.equal(transition.riskBand, 'critical');
    const [route] = buildCareRoutes({ population: 'CJ' }, { transition });
    assert.equal(route.id, 'reentry');
    assert.equal(route.pathwayId, 'justice');
    assert.equal(route.neverUseAlone, true);
    assert.ok(route.notes.some((w) => /naloxone/i.test(w) && /alone/i.test(w)));
    const linkCodes = new Set(route.links.flatMap((l) => l.codes));
    for (const code of ['CJ', 'BU', 'OTP', 'NOE']) assert.ok(linkCodes.has(code), `Expected ${code} in reentry links`);
    for (const code of linkCodes) {
      assert.ok(code === 'OTP' || transition.recommendedCodes.includes(code), `${code} should come from the transition engine`);
    }
  });

  it('xylazine: urgent emergency-department note and hospital search only when withdrawal or infection is present', () => {
    const [calm] = buildCareRoutes({ substances: ['xylazine'] });
    assert.equal(calm.id, 'xylazine');
    assert.equal(calm.urgent, false);
    assert.ok(calm.notes.some((w) => /tranq/i.test(w)));
    assert.ok(!calm.notes.some((w) => /emergency department/i.test(w)));
    assert.ok(!calm.links.some((l) => l.codes.includes('HI')));

    for (const answers of [
      { substances: ['xylazine'], withdrawalRisk: 'moderate' },
      { substances: ['xylazine'], biomedical: 'acute_infection' },
    ]) {
      const [urgent] = buildCareRoutes(answers);
      assert.equal(urgent.urgent, true);
      assert.deepEqual(urgent.links[0].codes, ['HI']);
      assert.match(urgent.notes[0], /emergency department/i);
    }
  });

  it('every route names its pathway card, has sources and at least one search link', () => {
    const routes = buildCareRoutes(
      { biomedical: 'pregnant', population: 'CJ', substances: ['xylazine', 'opioids'] },
      { transition: evaluateTransitionRisk(REENTRY_TRANSITION_INPUT) },
    );
    assert.deepEqual(routes.map((r) => r.id), ['pregnancy', 'reentry', 'xylazine']);
    for (const r of routes) {
      assert.ok(ALL_POPULATION_RECOMMENDERS[r.pathwayId], `${r.id}: unknown pathway ${r.pathwayId}`);
      assert.ok(r.sources);
      assert.ok(Array.isArray(r.notes));
      assert.ok(r.links.length >= 1);
      for (const x of r.extraLinks) assert.match(x.href, /^#\/[a-z-]+$/);
    }
  });

  it('adds no medication doses or schedules', () => {
    const text = SCENARIOS.flatMap((a) => getPopulationCareRoutes(a))
      .flatMap((r) => [...r.notes, ...r.links.map((l) => l.label)])
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

  it('every route lands in a pathway card that evaluateAsamCare() shows for the same answers', () => {
    for (const answers of SCENARIOS) {
      const shown = new Set(evaluateAsamCare(answers).populationPathways.map((pw) => pw.id));
      for (const route of getPopulationCareRoutes(answers)) {
        assert.ok(shown.has(route.pathwayId), `${route.id} has no ${route.pathwayId} card for ${JSON.stringify(answers)}`);
      }
    }
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
});

describe('careNavigatorView() renders the additions inside the matching pathway card', () => {
  class Node {
    constructor(tag) {
      this.tagName = String(tag).toUpperCase();
      this.attributes = {};
      this.children = [];
      this.dataset = {};
      this.className = '';
      this.text = '';
      this.parent = null;
      this.listeners = {};
    }
    get textContent() { return this.text + this.children.map((c) => c.textContent).join(''); }
    set textContent(v) { this.text = String(v ?? ''); this.children = []; }
    get firstChild() { return this.children[0] ?? null; }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] ?? null; }
    removeAttribute(k) { delete this.attributes[k]; }
    addEventListener(type, listener) { this.listeners[type] = listener; }
    append(...items) {
      for (const item of items) {
        const node = item instanceof Node ? item : Object.assign(new Node('#text'), { text: String(item) });
        node.parent = this;
        this.children.push(node);
      }
    }
    remove() {
      if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent = null;
    }
    walk(fn) { fn(this); for (const c of this.children) c.walk(fn); }
  }

  it('re-entry: justice card holds the CJ,BU search, the Never Use Alone line, and the SAMHSA helpline', async () => {
    const prev = { document: globalThis.document, Node: globalThis.Node };
    globalThis.Node = Node;
    globalThis.document = {
      createElement: (tag) => new Node(tag),
      createElementNS: (_ns, tag) => new Node(tag),
      getElementById: () => null,
    };
    try {
      const { careNavigatorView } = await import('../public/js/views/navigator.js');
      const { NEVER_USE_ALONE } = await import('../public/js/content/hotlines.js');
      const root = careNavigatorView({ query: new URLSearchParams('population=CJ') });
      let card = null;
      const hrefs = [];
      root.walk((n) => {
        if (n.attributes['data-population-pathway'] === 'justice') card = n;
        if (n.attributes.href) hrefs.push(n.attributes.href);
      });
      assert.ok(card, 'justice pathway card is rendered');
      let addition = null;
      card.walk((n) => { if (n.dataset.route === 'reentry') addition = n; });
      assert.ok(addition, 'reentry addition sits inside the justice card');
      const cardHrefs = [];
      let reentrySearch = null;
      addition.walk((n) => {
        if (n.attributes.href) cardHrefs.push(n.attributes.href);
        if (n.attributes.href === '#/treatment' && n.textContent.includes('(CJ, BU)')) reentrySearch = n;
      });
      assert.ok(reentrySearch, 'CJ/BU search is rendered with a bare treatment route');
      resetNavigatorState();
      reentrySearch.listeners.click();
      assert.deepEqual(getNavigatorHandoffState().codes, ['CJ', 'BU'], 'clinical service choices transfer through RAM');
      assert.ok(cardHrefs.includes(`tel:${NEVER_USE_ALONE.number}`));
      assert.ok(hrefs.includes('tel:18006624357'), 'SAMHSA helpline is shown');
      assert.ok(hrefs.includes('tel:988'));
      assert.ok(hrefs.includes('tel:911'));
      for (const href of hrefs.filter((x) => x.startsWith('#/treatment'))) {
        assert.equal(href, '#/treatment', `clinical selections must never enter rendered URLs: ${href}`);
      }
    } finally {
      globalThis.document = prev.document;
      globalThis.Node = prev.Node;
    }
  });
});
