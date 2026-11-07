import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMBOS,
  XYLAZINE_ACTION_STEPS,
  NALOXONE_ACTION_STEPS,
  GOOD_SAMARITAN_STEPS,
  SUPPLY_PATHWAYS,
  getHarmReductionState,
  resetHarmReductionState,
  buildXylazineActionCard,
  buildNaloxoneActionCard,
  harmReductionView,
} from '../public/js/views/harmReduction.js';
import { harmReductionSupplyBanner, treatmentFinder } from '../public/js/components/finder.js';
import { TREATMENT_FILTERS } from '../public/js/codes.js';
import { setLocation, setRadius } from '../public/js/state.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, '..');

// Minimal mock DOM node for Node.js test environment
class MockNode {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.attributes = Object.create(null);
    this.children = [];
    this.parent = null;
    this.listeners = new Map();
    this._textContent = '';
  }

  get id() {
    return this.attributes.id ?? '';
  }

  set id(val) {
    this.attributes.id = val;
  }

  get className() {
    return this.attributes.class ?? '';
  }

  set className(val) {
    this.attributes.class = val;
  }

  get textContent() {
    if (this._textContent) return this._textContent;
    return this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this.children = [];
    this._textContent = String(val);
  }

  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }

  getAttribute(k) {
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
  }

  addEventListener(evt, fn) {
    this.listeners.set(evt, fn);
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string') {
        const textNode = new MockNode('#text');
        textNode._textContent = item;
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
  }

  hasClass(cls) {
    const classes = (this.className || this.attributes.class || '').split(/\s+/).filter(Boolean);
    return classes.includes(cls);
  }

  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(pred, acc);
    }
    return acc;
  }
}

function withMockDom(fn) {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;
  const prevWin = globalThis.window;
  const announcer = new MockNode('div');
  announcer.setAttribute('id', 'announcer');

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement(tag) {
      return new MockNode(tag);
    },
    createElementNS(_ns, tag) {
      return new MockNode(tag);
    },
    createTextNode(text) {
      const n = new MockNode('#text');
      n._textContent = String(text);
      return n;
    },
    getElementById(id) {
      if (id === 'announcer') return announcer;
      return null;
    },
  };
  globalThis.window = {
    print: () => {},
    scrollTo: () => {},
    matchMedia: () => ({ matches: false }),
  };

  const cleanup = () => {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
    globalThis.window = prevWin;
  };

  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      return res.finally(cleanup);
    }
    cleanup();
    return res;
  } catch (err) {
    cleanup();
    throw err;
  }
}

describe('Harm Reduction View (public/js/views/harmReduction.js) Data & Safety Protocols', () => {
  it('exports COMBOS with required high-risk drug interaction pairings and authoritative sources', () => {
    assert.ok(Array.isArray(COMBOS));
    assert.ok(COMBOS.length >= 7);

    const combosText = COMBOS.map((c) => c.combo).join(' ');
    assert.match(combosText, /Opioids \+ benzodiazepines/i);
    assert.match(combosText, /Opioids \+ alcohol/i);
    assert.match(combosText, /Opioids \+ xylazine/i);
    assert.match(combosText, /Opioids \+ gabapentin/i);
    assert.match(combosText, /Stimulants \+ opioids/i);

    for (const c of COMBOS) {
      assert.equal(typeof c.combo, 'string');
      assert.equal(typeof c.why, 'string');
      assert.ok(Array.isArray(c.src) && c.src.length === 2);
      assert.ok(c.src[1].startsWith('https://'), `Expected https URL for combo source: ${c.src[1]}`);
    }
  });

  it('exports XYLAZINE_ACTION_STEPS with clinical and plain-language guidance across 4 critical domains', () => {
    assert.ok(Array.isArray(XYLAZINE_ACTION_STEPS));
    assert.equal(XYLAZINE_ACTION_STEPS.length, 4);

    const expectedIds = [
      'give-naloxone',
      'rescue-breathing',
      'alpha2-withdrawal-rebound',
      'wound-care-protocol',
    ];

    for (let i = 0; i < expectedIds.length; i++) {
      const step = XYLAZINE_ACTION_STEPS[i];
      assert.equal(step.step, i + 1);
      assert.equal(step.id, expectedIds[i]);
      assert.equal(typeof step.title, 'string');
      assert.equal(typeof step.titleEs, 'string');
      assert.equal(typeof step.clinicalDetail, 'string');
      assert.equal(typeof step.plainDetail, 'string');
      assert.equal(typeof step.clinicalDetailEs, 'string');
      assert.equal(typeof step.plainDetailEs, 'string');
    }

    // Verify clinical accuracy: naloxone first, rescue breathing, alpha-2 rebound (clonidine), wound care avoiding peroxide
    assert.match(XYLAZINE_ACTION_STEPS[0].clinicalDetail, /naloxone/i);
    assert.match(XYLAZINE_ACTION_STEPS[1].clinicalDetail, /rescue breath/i);
    assert.match(XYLAZINE_ACTION_STEPS[2].clinicalDetail, /clonidine|tizanidine|lofexidine/i);
    assert.match(XYLAZINE_ACTION_STEPS[3].clinicalDetail, /hydrogen peroxide/i);
  });

  it('exports NALOXONE_ACTION_STEPS with comprehensive 6-step emergency reversal instructions', () => {
    assert.ok(Array.isArray(NALOXONE_ACTION_STEPS));
    assert.equal(NALOXONE_ACTION_STEPS.length, 6);

    const expectedIds = [
      'identify-overdose',
      'give-naloxone',
      'call-911',
      'rescue-breathing',
      'repeat-if-needed',
      'recovery-position',
    ];

    for (let i = 0; i < expectedIds.length; i++) {
      const step = NALOXONE_ACTION_STEPS[i];
      assert.equal(step.step, i + 1);
      assert.equal(step.id, expectedIds[i]);
      assert.equal(typeof step.title, 'string');
      assert.equal(typeof step.titleEs, 'string');
      assert.equal(typeof step.clinicalDetail, 'string');
      assert.equal(typeof step.plainDetail, 'string');
      assert.equal(typeof step.clinicalDetailEs, 'string');
      assert.equal(typeof step.plainDetailEs, 'string');
    }

    // Verify specific emergency procedures
    assert.match(NALOXONE_ACTION_STEPS[0].plainDetail, /blue, purple, or pale gray/i);
    assert.match(NALOXONE_ACTION_STEPS[1].plainDetail, /nozzle into one nostril/i);
    assert.match(NALOXONE_ACTION_STEPS[2].clinicalDetail, /Good Samaritan/i);
    assert.match(NALOXONE_ACTION_STEPS[3].clinicalDetail, /1 slow breath every 5 seconds/i);
    assert.match(NALOXONE_ACTION_STEPS[4].plainDetail, /2 to 3 minutes/i);
    assert.match(NALOXONE_ACTION_STEPS[5].plainDetail, /recovery position/i);
  });

  it('exports GOOD_SAMARITAN_STEPS covering core 911 protections, immunities, and limitations', () => {
    assert.ok(Array.isArray(GOOD_SAMARITAN_STEPS));
    assert.equal(GOOD_SAMARITAN_STEPS.length, 5);

    const stepIds = GOOD_SAMARITAN_STEPS.map((s) => s.id);
    assert.deepEqual(stepIds, [
      'call-immediately',
      'know-protections',
      'naloxone-immunity',
      'know-limitations',
      'responder-interaction',
    ]);

    for (const s of GOOD_SAMARITAN_STEPS) {
      assert.equal(typeof s.title, 'string');
      assert.equal(typeof s.titleEs, 'string');
      assert.equal(typeof s.detail, 'string');
      assert.equal(typeof s.detailEs, 'string');
    }

    assert.match(GOOD_SAMARITAN_STEPS[1].detail, /Over 48 states and Washington D\.C\./i);
    assert.match(GOOD_SAMARITAN_STEPS[2].detail, /All 50 states/i);
    assert.match(GOOD_SAMARITAN_STEPS[3].detail, /NOT protect against outstanding felony arrest warrants/i);
  });

  it('exports SUPPLY_PATHWAYS covering SSPs, vending machines, test strips, NEXT Distro mail, and mobile vans', () => {
    assert.ok(Array.isArray(SUPPLY_PATHWAYS));
    assert.equal(SUPPLY_PATHWAYS.length, 5);

    const ids = SUPPLY_PATHWAYS.map((p) => p.id);
    assert.deepEqual(ids, ['ssp', 'vending', 'strips', 'mail', 'mobile']);

    for (const pathway of SUPPLY_PATHWAYS) {
      assert.equal(typeof pathway.badge, 'string');
      assert.equal(typeof pathway.badgeEs, 'string');
      assert.equal(typeof pathway.title, 'string');
      assert.equal(typeof pathway.titleEs, 'string');
      assert.equal(typeof pathway.desc, 'string');
      assert.equal(typeof pathway.descEs, 'string');
      assert.ok(pathway.link.startsWith('https://'), `Expected https URL: ${pathway.link}`);
      assert.equal(typeof pathway.linkText, 'string');
      assert.equal(typeof pathway.linkTextEs, 'string');
    }

    const ssp = SUPPLY_PATHWAYS.find((p) => p.id === 'ssp');
    assert.match(ssp.link, /nasen\.org/i);

    const mail = SUPPLY_PATHWAYS.find((p) => p.id === 'mail');
    assert.match(mail.link, /nextdistro\.org/i);
  });
});

describe('Harm Reduction State Management & Ephemeral Browser RAM', () => {
  it('manages ephemeral state strictly in browser RAM without touching localStorage or cookies', () => {
    resetHarmReductionState();
    let state = getHarmReductionState();
    assert.equal(state.plainLanguage, false);
    assert.equal(state.supplyFilter, 'all');

    // Verify static code audit of public/js/views/harmReduction.js
    const src = readFileSync(path.join(rootDir, 'public', 'js', 'views', 'harmReduction.js'), 'utf8');
    const codeOnly = src.replace(/\/\/.*$/gm, '');

    assert.doesNotMatch(codeOnly, /\blocalStorage\s*\./, 'harmReduction.js must not touch localStorage');
    assert.doesNotMatch(codeOnly, /\bsessionStorage\s*\./, 'harmReduction.js must not touch sessionStorage');
    assert.doesNotMatch(codeOnly, /\bdocument\.cookie\b/, 'harmReduction.js must not touch document.cookie');
    assert.doesNotMatch(codeOnly, /\bindexedDB\b/, 'harmReduction.js must not touch indexedDB');
    assert.doesNotMatch(codeOnly, /\bfetch\s*\(/, 'harmReduction.js must run with zero network fetch');
  });

  it('resets ephemeral state cleanly via resetHarmReductionState()', () => {
    resetHarmReductionState();
    assert.deepEqual(getHarmReductionState(), { plainLanguage: false, supplyFilter: 'all' });
  });
});

describe('Printable Action Cards & DOM Construction', () => {
  it('builds printable Xylazine Action Card with correct class, id, and steps', () => {
    withMockDom(() => {
      const card = buildXylazineActionCard({ plainLanguage: false });
      assert.ok(card.hasClass('print-handout'));
      assert.ok(card.hasClass('xylazine-action-card'));
      assert.equal(card.getAttribute('id'), 'xylazine-action-card');
      assert.equal(card.getAttribute('aria-labelledby'), 'xylazine-card-title');

      const steps = card.findAll((n) => n.hasClass('step'));
      assert.equal(steps.length, 4);

      // Plain language mode
      const plainCard = buildXylazineActionCard({ plainLanguage: true });
      assert.match(plainCard.textContent, /Street fentanyl is often mixed/);
    });
  });

  it('builds printable Naloxone Action Card with correct class, id, and steps', () => {
    withMockDom(() => {
      const card = buildNaloxoneActionCard({ plainLanguage: false });
      assert.ok(card.hasClass('print-handout'));
      assert.ok(card.hasClass('naloxone-action-card'));
      assert.equal(card.getAttribute('id'), 'naloxone-action-card');
      assert.equal(card.getAttribute('aria-labelledby'), 'naloxone-card-title');

      const steps = card.findAll((n) => n.hasClass('step'));
      assert.equal(steps.length, 6);

      // Plain language mode
      const plainCard = buildNaloxoneActionCard({ plainLanguage: true });
      assert.match(plainCard.textContent, /Naloxone saves lives/);
    });
  });

  it('renders harmReductionView with all sections, TOC navigation, and interactive pathway filter buttons', () => {
    withMockDom(() => {
      resetHarmReductionState();
      const view = harmReductionView();
      assert.ok(view.hasClass('view'));

      // Check all required section IDs exist in view
      const sectionIds = [
        'naloxone-card',
        'supply-pathways',
        'mail-distribution',
        'xylazine-tranq',
        'never-alone',
        'checking',
        'safer-use',
        'mixing',
        'wounds',
        'rights',
        'more',
      ];

      for (const id of sectionIds) {
        const found = view.findAll((n) => n.id === id);
        assert.ok(found.length >= 1, `Expected section #${id} in harmReductionView`);
      }

      // Check Good Samaritan guide card exists
      const goodSamaritanGuide = view.findAll((n) => n.id === 'good-samaritan-guide');
      assert.ok(goodSamaritanGuide.length >= 1);

      // Verify interactive pathway buttons exist
      const pathwayFilterBtns = view.findAll((n) => n.hasClass('pathway-filter-btn'));
      assert.equal(pathwayFilterBtns.length, 6);

      // Click 'ssp' filter and verify state updates
      const sspBtn = view.findAll((n) => n.id === 'filter-pathway-ssp')[0];
      assert.ok(sspBtn);
      sspBtn.listeners.get('click')();
      assert.equal(getHarmReductionState().supplyFilter, 'ssp');

      // Click plain language toggle
      const plainToggle = view.findAll((n) => n.id === 'harm-plain-language-toggle')[0];
      assert.ok(plainToggle);
      plainToggle.listeners.get('click')();
      assert.equal(getHarmReductionState().plainLanguage, true);

      // Reset
      resetHarmReductionState();
      assert.equal(getHarmReductionState().plainLanguage, false);
      assert.equal(getHarmReductionState().supplyFilter, 'all');
    });
  });
});

describe('Harm Reduction Supply Integration in Finder (public/js/components/finder.js)', () => {
  it('exports harmReductionSupplyBanner() with SSPs, 24/7 vending machines, NEXT Distro, and action card links', () => {
    withMockDom(() => {
      const banner = harmReductionSupplyBanner();
      assert.ok(banner.hasClass('harm-reduction-callout'));
      assert.equal(banner.getAttribute('role'), 'region');

      const text = banner.textContent;
      assert.match(text, /Syringe Services Programs \(SSPs\)/i);
      assert.match(text, /Community naloxone vending machines/i);
      assert.match(text, /NEXT Distro/i);
      assert.match(text, /Good Samaritan/i);

      // External link checks
      const nasenLink = banner.findAll((n) => n.getAttribute('href') === 'https://nasen.org/directory/');
      assert.ok(nasenLink.length >= 1, 'Expected NASEN link in banner');
      const nextDistroLink = banner.findAll((n) => n.getAttribute('href') === 'https://nextdistro.org/naloxone');
      assert.ok(nextDistroLink.length >= 1, 'Expected NEXT Distro link in banner');
    });
  });

  it('treatmentFinder dynamically displays harm reduction banner when NOE (naloxone) filter is active', async () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      const u = String(url?.url || url || '');
      if (u.includes('nearby-summary')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ radiusMiles: 25, region: { code: 'WA', name: 'Washington' }, networks: {} }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ results: [], page: 1, totalPages: 0, total: 0 }),
      };
    };

    try {
      await withMockDom(async () => {
        setLocation({ label: 'Seattle, WA', lat: 47.61, lng: -122.33, state: 'WA' });
        setRadius(25);

        try {
          const finderEl = treatmentFinder({
            kind: 'sa',
            filters: TREATMENT_FILTERS,
            initialCodes: ['NOE'],
            noun: 'places',
          });

          const bannerInFinder = finderEl.findAll((n) => n.hasClass('harm-reduction-callout'));
          assert.ok(bannerInFinder.length >= 1, 'Expected harmReductionSupplyBanner inside treatmentFinder when NOE is active');

          await new Promise((r) => setTimeout(r, 30));
        } finally {
          setLocation(null);
        }
      });
    } finally {
      globalThis.fetch = prevFetch;
    }
  });
});
