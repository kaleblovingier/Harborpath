/**
 * Wave 12 Architecture, Clinical Systems & Multi-Module Integration Suite (test/wave12-integration.test.js)
 *
 * Verifies end-to-end coherence across all Wave 12 additions:
 * 1. Immigrant, Migrant & Language Access Health Rights (public/js/views/immigrantHealth.js)
 * 2. Post-Overdose Response & Community Paramedicine (public/js/views/postOverdose.js)
 * 3. Stimulant Care, Overamping Differential & CMI (public/js/views/stimulantCare.js)
 * 4. Medical Respite & Recuperative Care Specialist (public/js/components/medicalRespiteFinder.js)
 * 5. Application Shell Routing, Lazy Loading & Quick Exit Integration (public/js/app.js)
 * 6. Bilingual Parity (es.js) & Service Worker Elective Precache (sw.js)
 * 7. Static Security, CSP Parity & Ephemeral In-RAM Privacy Compliance
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 1. Immigrant Health Rights
import {
  IMMIGRANT_HEALTH_RIGHTS,
  evaluateImmigrantHealthRights,
  getImmigrantState,
  setImmigrantState,
  resetImmigrantState,
  formatImmigrantSummaryText,
  immigrantHealthView,
} from '../public/js/views/immigrantHealth.js';

// 2. Post-Overdose Response
import {
  POST_OVERDOSE_STANDARDS,
  evaluatePostOverdoseCare,
  getPostOverdoseState,
  setPostOverdoseState,
  resetPostOverdoseState,
  formatPostOverdoseSummaryText,
  postOverdoseView,
} from '../public/js/views/postOverdose.js';

// 3. Stimulant Care
import {
  STIMULANT_CARE_STANDARDS,
  evaluateStimulantHarmRisk,
  getStimulantCareState,
  setStimulantCareState,
  resetStimulantCareState,
  formatStimulantSummaryText,
  stimulantCareView,
} from '../public/js/views/stimulantCare.js';

// 4. Medical Respite
import {
  MEDICAL_RESPITE_STANDARDS,
  evaluateMedicalRespiteReferral,
  getRespiteFinderState,
  setRespiteFinderState,
  resetRespiteFinderState,
  medicalRespiteFinderComponent,
} from '../public/js/components/medicalRespiteFinder.js';

// 5. App Shell & Routing
import {
  LAZY_LOADERS,
  ROUTE_TITLES,
  preloadAllLazyViews,
  runQuickExitResets,
} from '../public/js/app.js';

import esTranslations from '../public/js/locales/es.js';

class MockNode {
  constructor(tagName) {
    this.tagName = tagName ? tagName.toUpperCase() : '#TEXT';
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.dataset = {};
    this._textContent = '';
    this.parent = null;
    this.checked = false;
    this.value = '';
    this.id = '';
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this._textContent = String(val ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }

  getAttribute(k) {
    return this.attributes[k] ?? null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
  }

  addEventListener(event, fn) {
    this.listeners[event] = fn;
  }

  dispatchEvent(event, data = {}) {
    const fn = this.listeners[event];
    if (typeof fn === 'function') fn({ target: this, ...data });
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        const textNode = new MockNode('#text');
        textNode._textContent = String(item);
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx !== -1) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (node instanceof MockNode) {
        if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
        else if (selector === 'a' && node.tagName === 'A') matches.push(node);
        else if (selector === 'select' && node.tagName === 'SELECT') matches.push(node);
        else if (selector.startsWith('#') && node.attributes.id === selector.slice(1)) matches.push(node);
        else if (selector.startsWith('.') && node.className && node.className.split(/\s+/).includes(selector.slice(1))) matches.push(node);
        for (const child of node.children) {
          if (child instanceof MockNode) walk(child);
        }
      }
    };
    walk(this);
    return matches;
  }
}

if (!globalThis.Node) {
  globalThis.Node = MockNode;
}

if (!globalThis.document) {
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
    createTextNode: (text) => {
      const node = new MockNode('#text');
      node._textContent = String(text);
      return node;
    },
    createDocumentFragment: () => new MockNode('fragment'),
    body: new MockNode('body'),
  };
}

describe('Wave 12 Architecture, Clinical Systems & Multi-Module Integration Suite', () => {
  beforeEach(() => {
    resetImmigrantState();
    resetPostOverdoseState();
    resetStimulantCareState();
    resetRespiteFinderState();
  });

  test('1. App Shell Route Registry & Preloader Parity for Wave 12 Modules', async () => {
    // 1. Verify lazy loader registrations
    assert.ok(LAZY_LOADERS['immigrant-health'], 'immigrant-health view loader must be registered in LAZY_LOADERS');
    assert.ok(LAZY_LOADERS['post-overdose'], 'post-overdose view loader must be registered in LAZY_LOADERS');
    assert.ok(LAZY_LOADERS['stimulant-care'], 'stimulant-care view loader must be registered in LAZY_LOADERS');

    // 2. Verify lazy loading functions resolve valid views
    const loadedImmigrant = await LAZY_LOADERS['immigrant-health']();
    assert.equal(typeof loadedImmigrant, 'function', 'immigrant-health loader must resolve a function');

    const loadedPostOverdose = await LAZY_LOADERS['post-overdose']();
    assert.equal(typeof loadedPostOverdose, 'function', 'post-overdose loader must resolve a function');

    const loadedStimulant = await LAZY_LOADERS['stimulant-care']();
    assert.equal(typeof loadedStimulant, 'function', 'stimulant-care loader must resolve a function');

    // 3. Verify route titles in English and Spanish parity
    assert.ok(ROUTE_TITLES['immigrant-health'], 'ROUTE_TITLES must have immigrant-health');
    assert.ok(ROUTE_TITLES['post-overdose'], 'ROUTE_TITLES must have post-overdose');
    assert.ok(ROUTE_TITLES['stimulant-care'], 'ROUTE_TITLES must have stimulant-care');

    assert.equal(typeof ROUTE_TITLES['immigrant-health'](), 'string');
    assert.equal(typeof ROUTE_TITLES['post-overdose'](), 'string');
    assert.equal(typeof ROUTE_TITLES['stimulant-care'](), 'string');

    assert.ok(esTranslations['route.immigrantHealth'], 'Spanish route title for immigrantHealth must be defined');
    assert.ok(esTranslations['route.postOverdose'], 'Spanish route title for postOverdose must be defined');
    assert.ok(esTranslations['route.stimulantCare'], 'Spanish route title for stimulantCare must be defined');

    // 4. Verify preloadAllLazyViews resolves cleanly
    await preloadAllLazyViews();
  });

  test('2. Quick Exit (Esc x2) Deterministic State Wipe Across All 4 Wave 12 Modules', async () => {
    // Mutate state in all 4 modules
    setImmigrantState({
      activeTab: 'decision-aid',
      emergencyCondition: true,
      immigrationConcern: 'public_charge',
    });
    setPostOverdoseState({
      activeTab: 'triage',
      hoursSinceEvent: 'over_72',
      hasMoudBridge: true,
    });
    setStimulantCareState({
      activeTab: 'assessment',
      primaryStimulant: 'cocaine_crack',
      hyperthermiaSymptoms: true,
    });
    setRespiteFinderState({
      homelessStatus: 'unhoused_shelter',
      postAcuteNeed: 'iv_antibiotics',
    });

    // Verify mutations took effect
    assert.equal(getImmigrantState().activeTab, 'decision-aid');
    assert.equal(getImmigrantState().emergencyCondition, true);
    assert.equal(getPostOverdoseState().activeTab, 'triage');
    assert.equal(getStimulantCareState().primaryStimulant, 'cocaine_crack');
    assert.equal(getRespiteFinderState().homelessStatus, 'unhoused_shelter');

    // Execute runQuickExitResets
    runQuickExitResets();

    // Allow dynamic import promises to settle
    await new Promise((r) => setTimeout(r, 60));

    // Verify all 4 states reset to pristine defaults
    const immigrantAfter = getImmigrantState();
    assert.equal(immigrantAfter.activeTab, 'overview');
    assert.equal(immigrantAfter.emergencyCondition, false);

    const postOverdoseAfter = getPostOverdoseState();
    assert.equal(postOverdoseAfter.activeTab, 'overview');
    assert.equal(postOverdoseAfter.hoursSinceEvent, 'under_6');
    assert.equal(postOverdoseAfter.hasMoudBridge, false);

    const stimulantAfter = getStimulantCareState();
    assert.equal(stimulantAfter.activeTab, 'overview');
    assert.equal(stimulantAfter.primaryStimulant, 'methamphetamine');
    assert.equal(stimulantAfter.hyperthermiaSymptoms, false);

    const respiteAfter = getRespiteFinderState();
    assert.equal(respiteAfter.homelessStatus, 'unhoused_street');
    assert.equal(respiteAfter.postAcuteNeed, 'wound_care');
  });

  test('3. Cross-Module Clinical & Legal Integration Scenario: Unhoused Immigrant Post-Overdose', () => {
    // Immigrant rights evaluation
    const immEval = evaluateImmigrantHealthRights({
      emergencyCondition: true,
      englishProficiency: 'interpreter_needed',
      immigrationConcern: 'ice_safety',
    });
    assert.ok(immEval.urgentDirectives.length > 0);
    assert.ok(immEval.citations.includes('42 U.S.C. § 1395dd'));

    // Post-overdose evaluation
    const podEval = evaluatePostOverdoseCare({
      hoursSinceEvent: 'under_2',
      symptoms: ['precipitated_withdrawal'],
      supportPresent: false,
      hasMoudBridge: false,
    });
    assert.equal(podEval.riskLevel, 'HIGH');
    assert.ok(podEval.harmReductionDirectives.some((d) => d.titleEn.includes('Do NOT Use Street Drugs')));

    // Medical respite placement evaluation
    const respiteEval = evaluateMedicalRespiteReferral({
      homelessStatus: 'unhoused_street',
      adlIndependence: 'independent',
      moudPrescribed: true,
      postAcuteNeed: 'wound_care',
    });
    assert.equal(respiteEval.eligible, true);
    assert.ok(respiteEval.actionRecommendations.length > 0);
  });

  test('4. Static Security, CSP & Ephemeral In-RAM Privacy Compliance Audit', () => {
    const files = [
      'public/js/views/immigrantHealth.js',
      'public/js/views/postOverdose.js',
      'public/js/views/stimulantCare.js',
      'public/js/components/medicalRespiteFinder.js',
    ];

    files.forEach((file) => {
      const src = readFileSync(file, 'utf8');
      assert.doesNotMatch(src, /localStorage|sessionStorage|document\.cookie/i, `No device storage in ${file}`);
      assert.doesNotMatch(src, /innerHTML|outerHTML/i, `No innerHTML in ${file}`);
      assert.doesNotMatch(src, /style\s*=/i, `No inline styles in ${file}`);
      assert.doesNotMatch(
        src,
        /saved to disk|erases everything|zero-knowledge|does not record search terms|never stored|nothing is logged|100% private/i,
        `No banned privacy claims in ${file}`
      );
    });

    const swSrc = readFileSync('public/sw.js', 'utf8');
    assert.ok(swSrc.includes('/js/views/immigrantHealth.js'), 'immigrantHealth in SW elective shell');
    assert.ok(swSrc.includes('/js/views/postOverdose.js'), 'postOverdose in SW elective shell');
    assert.ok(swSrc.includes('/js/views/stimulantCare.js'), 'stimulantCare in SW elective shell');
    assert.ok(swSrc.includes('/js/components/medicalRespiteFinder.js'), 'medicalRespiteFinder in SW elective shell');
  });
});
