/**
 * Unit & Integration Tests: Homelessness & Street Medicine Harm Reduction (test/street-medicine.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  STREET_MEDICINE_STATUTES,
  ENVIRONMENTAL_EXPOSURE_RISKS,
  evaluateStreetMedicinePlan,
  getStreetMedicineState,
  setStreetMedicineState,
  resetStreetMedicineState,
  formatStreetMedicineSummaryText,
  streetMedicineView,
} from '../public/js/views/streetMedicine.js';

// Minimal DOM mock for headless testing
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
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        if (node.className && node.className.split(/\s+/).includes(cls)) {
          matches.push(node);
        }
      } else if (selector.startsWith('#')) {
        const id = selector.slice(1);
        if (node.id === id) matches.push(node);
      } else if (selector.includes('[')) {
        const attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/);
        if (attrMatch) {
          const [, attr, val] = attrMatch;
          if (val !== undefined) {
            if (node.getAttribute(attr) === val) matches.push(node);
          } else if (node.getAttribute(attr) !== null) {
            matches.push(node);
          }
        }
      } else if (node.tagName.toLowerCase() === selector.toLowerCase()) {
        matches.push(node);
      }
      for (const child of node.children) {
        if (child instanceof MockNode) walk(child);
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
    createElement(tag) {
      return new MockNode(tag);
    },
    createElementNS(_ns, tag) {
      return new MockNode(tag);
    },
    getElementById() {
      return null;
    },
    createTextNode(text) {
      const node = new MockNode('#text');
      node._textContent = String(text);
      return node;
    },
    createDocumentFragment() {
      return new MockNode('fragment');
    },
    body: new MockNode('body'),
  };
}

describe('Homelessness & Street Medicine Harm Reduction Module (public/js/views/streetMedicine.js)', () => {
  beforeEach(() => {
    resetStreetMedicineState();
  });

  test('Module Exports & Statutory Framework Integrity', () => {
    assert.ok(Array.isArray(STREET_MEDICINE_STATUTES), 'STREET_MEDICINE_STATUTES must be an array');
    assert.equal(STREET_MEDICINE_STATUTES.length, 3);

    const hud = STREET_MEDICINE_STATUTES.find((s) => s.id === 'hud_equal_access');
    assert.ok(hud, 'Must include HUD equal access statute');
    assert.match(hud.citation, /42 U\.S\.C\. § 3604/);

    const sweep = STREET_MEDICINE_STATUTES.find((s) => s.id === 'medication_property_rights');
    assert.ok(sweep, 'Must include sweep property rights statute');
    assert.match(sweep.citation, /Amend\. IV/);

    assert.ok(ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter, 'Must include winter exposure risks');
    assert.ok(ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat, 'Must include heat exposure risks');
  });

  test('evaluateStreetMedicinePlan: Freezing Weather Hypothermia Alert & Sweep Protection', () => {
    const plan = evaluateStreetMedicinePlan({
      livingSituation: 'unsheltered_encampment',
      hasSecureMedStorage: false,
      experiencingExtremeWeather: 'freezing_winter',
      moudInterest: 'buprenorphine_street',
      facingSweepOrDisplacement: true,
      needsVitalDocs: true,
    });

    assert.ok(plan.alerts.length >= 1);
    assert.match(plan.alerts[0].detail.en, /vasodilation/i);
    assert.ok(plan.storageSolutions.some((s) => s.title.en.includes('Lockbox')));
    assert.ok(plan.rightsGuidance.some((r) => r.title.en.includes('Encampment Sweep')));
    assert.ok(plan.rightsGuidance.some((r) => r.title.en.includes('Shelter MOUD')));
  });

  test('evaluateStreetMedicinePlan: Extreme Heat Hyperthermia & Dehydration Alert', () => {
    const heatPlan = evaluateStreetMedicinePlan({
      livingSituation: 'unsheltered_encampment',
      hasSecureMedStorage: true,
      experiencingExtremeWeather: 'extreme_heat',
      moudInterest: 'methadone_clinic',
      facingSweepOrDisplacement: false,
      needsVitalDocs: false,
    });

    assert.ok(heatPlan.alerts.some((a) => a.title.en.includes('Heat')));
    assert.match(heatPlan.alerts[0].detail.en, /rhabdomyolysis/i);
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getStreetMedicineState();
    assert.equal(initial.livingSituation, 'unsheltered_encampment');
    assert.equal(initial.activeTab, 'decision_aid');

    setStreetMedicineState({
      livingSituation: 'vehicle_car',
      experiencingExtremeWeather: 'extreme_heat',
      activeTab: 'weather_safety',
    });

    const modified = getStreetMedicineState();
    assert.equal(modified.livingSituation, 'vehicle_car');
    assert.equal(modified.experiencingExtremeWeather, 'extreme_heat');
    assert.equal(modified.activeTab, 'weather_safety');

    resetStreetMedicineState();
    const afterReset = getStreetMedicineState();
    assert.equal(afterReset.livingSituation, 'unsheltered_encampment');
    assert.equal(afterReset.experiencingExtremeWeather, 'freezing_winter');
    assert.equal(afterReset.activeTab, 'decision_aid');
  });

  test('formatStreetMedicineSummaryText: Generates comprehensive bilingual plain-text summaries', () => {
    const plan = evaluateStreetMedicinePlan({
      livingSituation: 'unsheltered_encampment',
      hasSecureMedStorage: false,
      experiencingExtremeWeather: 'freezing_winter',
      moudInterest: 'buprenorphine_street',
      facingSweepOrDisplacement: true,
      needsVitalDocs: true,
    });

    const enText = formatStreetMedicineSummaryText(plan, 'en');
    assert.match(enText, /STREET MEDICINE & UNHOUSED CARE ACCESS PLAN/);
    assert.match(enText, /WEATHER & EXPOSURE RISK ALERTS/);
    assert.match(enText, /LEGAL RIGHTS IN SHELTERS & ENCAMPMENT SWEEPS/);
    assert.match(enText, /Never Use Alone: 1-800-484-3731/);

    const esText = formatStreetMedicineSummaryText(plan, 'es');
    assert.match(esText, /PLAN DE MEDICINA CALLEJERA Y DERECHOS PARA PERSONAS SIN HOGAR/);
    assert.match(esText, /ALERTAS DE CLIMA Y RIESGO DE EXPOSICIÓN/);
    assert.match(esText, /ORIENTACIÓN LEGAL Y DERECHOS EN REFUGIOS Y DESALOJOS/);
    assert.match(esText, /Never Use Alone: 1-800-484-3731/);
  });

  test('streetMedicineView: Mounts accessible DOM structure across tabs', () => {
    const container = new MockNode('div');
    const view = streetMedicineView(container);
    assert.ok(container.children.length > 0, 'Container should receive elements');

    const tabButtons = container.querySelectorAll('button[role="tab"]');
    assert.equal(tabButtons.length, 4, 'Must render 4 navigation tabs');

    // Switch to street_moud tab
    const moudTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'street_moud');
    assert.ok(moudTab, 'Should find street_moud tab button');
    moudTab.dispatchEvent('click');
    assert.equal(getStreetMedicineState().activeTab, 'street_moud');

    // Switch to shelter_rights tab
    const shelterTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'shelter_rights');
    assert.ok(shelterTab, 'Should find shelter_rights tab button');
    shelterTab.dispatchEvent('click');
    assert.equal(getStreetMedicineState().activeTab, 'shelter_rights');

    // Switch to weather_safety tab
    const weatherTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'weather_safety');
    assert.ok(weatherTab, 'Should find weather_safety tab button');
    weatherTab.dispatchEvent('click');
    assert.equal(getStreetMedicineState().activeTab, 'weather_safety');
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'streetMedicine.js');
    const source = readFileSync(filePath, 'utf8');

    // Strict zero-storage / zero-tracking check
    assert.doesNotMatch(source, /\b(localStorage|sessionStorage|indexedDB)\b/, 'Must not touch device storage');
    assert.doesNotMatch(source, /\bdocument\.cookie\b/, 'Must not access cookies');
    assert.doesNotMatch(source, /\bfetch\s*\(/, 'Must run 100% ephemeral in browser RAM without network fetch');

    // DOM safety invariants
    assert.doesNotMatch(source, /\b(innerHTML|outerHTML|insertAdjacentHTML)\b/, 'Must use safe DOM construction via h()');
    assert.doesNotMatch(source, /\bstyle\s*=/, 'Must not use inline style attributes');

    // Privacy overclaim regex audit
    const BANNED_PATTERNS = [
      /saved to disk/i,
      /erases? everything/i,
      /zero[- ]knowledge/i,
      /does not record search terms/i,
      /never stored/i,
      /nothing is logged/i,
      /100% private/i,
      /\bse borra todo\b/i,
      /nunca se guarda/i,
      /se guardan? en el disco/i,
      /nada se registra/i,
      /100 % privad/i,
    ];

    for (const pat of BANNED_PATTERNS) {
      assert.doesNotMatch(source, pat, `Source must not contain banned privacy overclaim: ${pat}`);
    }
  });
});

