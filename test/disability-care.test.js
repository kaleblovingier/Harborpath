/**
 * Unit & Integration Tests: Disability, Neurodiversity & Accessible SUD Care Specialist (test/disability-care.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  DISABILITY_CARE_STATUTES,
  SENSORY_ACCOMMODATION_STANDARDS,
  evaluateDisabilityCarePlan,
  getDisabilityState,
  setDisabilityState,
  resetDisabilityState,
  formatDisabilitySummaryText,
  disabilityCareView,
} from '../public/js/views/disabilityCare.js';

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

describe('Disability, Neurodiversity & Accessible SUD Care Module (public/js/views/disabilityCare.js)', () => {
  beforeEach(() => {
    resetDisabilityState();
  });

  test('Module Exports & Statutory Framework Integrity', () => {
    assert.ok(Array.isArray(DISABILITY_CARE_STATUTES), 'DISABILITY_CARE_STATUTES must be an array');
    assert.equal(DISABILITY_CARE_STATUTES.length, 3);

    const comm = DISABILITY_CARE_STATUTES.find((s) => s.id === 'ada_effective_communication');
    assert.ok(comm, 'Must include effective communication mandate');
    assert.match(comm.citation, /28 C\.F\.R\. § 35\.160/);

    const sa = DISABILITY_CARE_STATUTES.find((s) => s.id === 'ada_service_animals');
    assert.ok(sa, 'Must include service animals statute');
    assert.match(sa.citation, /28 C\.F\.R\. § 35\.136/);

    assert.ok(Array.isArray(SENSORY_ACCOMMODATION_STANDARDS));
    assert.equal(SENSORY_ACCOMMODATION_STANDARDS.length, 3);
  });

  test('evaluateDisabilityCarePlan: Enforces Service Dog Legal Rights & Auxiliary Communication', () => {
    const plan = evaluateDisabilityCarePlan({
      disabilityTypes: ['deaf_hard_of_hearing'],
      hasServiceAnimal: true,
      seekingResidential: true,
      currentPainStatus: 'none',
      needsAuxiliaryCommunication: true,
    });

    assert.ok(plan.rightsAlerts.some((a) => a.title.en.includes('Service Dog')));
    assert.match(plan.rightsAlerts.find((a) => a.title.en.includes('Service Dog')).detail.en, /28 C\.F\.R\. § 35\.136/);

    assert.ok(plan.rightsAlerts.some((a) => a.title.en.includes('Auxiliary Aids')));
    assert.match(plan.rightsAlerts.find((a) => a.title.en.includes('Auxiliary Aids')).detail.en, /ASL interpreter/);
  });

  test('evaluateDisabilityCarePlan: Identifies Involuntary Opioid Tapering & Sensory Accommodations', () => {
    const plan = evaluateDisabilityCarePlan({
      disabilityTypes: ['autism_sensory', 'adhd_executive', 'chronic_pain'],
      hasServiceAnimal: false,
      seekingResidential: false,
      currentPainStatus: 'prescribed_opioids',
      needsAuxiliaryCommunication: false,
    });

    assert.ok(plan.accommodations.length >= 3, 'Must attach sensory and executive function accommodations');
    assert.ok(plan.chronicPainAdvice.some((c) => c.title.en.includes('Involuntary Rapid Tapering')));
    assert.match(plan.chronicPainAdvice[0].detail.en, /CDC 2022/);
    assert.ok(plan.rightsAlerts.some((a) => a.title.en.includes('Coordinated ADHD Pharmacotherapy')));
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getDisabilityState();
    assert.ok(initial.disabilityTypes.includes('autism_sensory'));
    assert.equal(initial.activeTab, 'decision_aid');

    setDisabilityState({
      disabilityTypes: ['deaf_hard_of_hearing'],
      hasServiceAnimal: true,
      activeTab: 'service_animals',
    });

    const modified = getDisabilityState();
    assert.ok(modified.disabilityTypes.includes('deaf_hard_of_hearing'));
    assert.equal(modified.hasServiceAnimal, true);
    assert.equal(modified.activeTab, 'service_animals');

    resetDisabilityState();
    const afterReset = getDisabilityState();
    assert.ok(afterReset.disabilityTypes.includes('mobility_physical'));
    assert.equal(afterReset.hasServiceAnimal, false);
    assert.equal(afterReset.activeTab, 'decision_aid');
  });

  test('formatDisabilitySummaryText: Generates comprehensive bilingual plain-text summaries', () => {
    const plan = evaluateDisabilityCarePlan({
      disabilityTypes: ['mobility_physical', 'autism_sensory'],
      hasServiceAnimal: true,
      seekingResidential: true,
      currentPainStatus: 'prescribed_opioids',
      needsAuxiliaryCommunication: true,
    });

    const enText = formatDisabilitySummaryText(plan, 'en');
    assert.match(enText, /ACCESSIBLE CARE, NEURODIVERSITY & CHRONIC PAIN PLAN/);
    assert.match(enText, /LEGAL RIGHTS ALERTS/);
    assert.match(enText, /CHRONIC PAIN GUIDANCE/);
    assert.match(enText, /DOJ ADA Information Line: 1-800-514-0301/);

    const esText = formatDisabilitySummaryText(plan, 'es');
    assert.match(esText, /PLAN DE ACCESIBILIDAD, NEURODIVERSIDAD Y DOLOR CRÓNICO/);
    assert.match(esText, /ALERTAS DE DERECHOS LEGALES/);
    assert.match(esText, /ORIENTACIÓN SOBRE DOLOR CRÓNICO/);
    assert.match(esText, /Línea de Información ADA del Departamento de Justicia: 1-800-514-0301/);
  });

  test('disabilityCareView: Mounts accessible DOM structure across tabs', () => {
    const container = new MockNode('div');
    const view = disabilityCareView(container);
    assert.ok(container.children.length > 0, 'Container should receive elements');

    const tabButtons = container.querySelectorAll('button[role="tab"]');
    assert.equal(tabButtons.length, 4, 'Must render 4 navigation tabs');

    // Switch to service_animals tab
    const saTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'service_animals');
    assert.ok(saTab, 'Should find service_animals tab button');
    saTab.dispatchEvent('click');
    assert.equal(getDisabilityState().activeTab, 'service_animals');

    // Switch to neurodiversity tab
    const neuroTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'neurodiversity');
    assert.ok(neuroTab, 'Should find neurodiversity tab button');
    neuroTab.dispatchEvent('click');
    assert.equal(getDisabilityState().activeTab, 'neurodiversity');

    // Switch to ada_rights tab
    const adaTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'ada_rights');
    assert.ok(adaTab, 'Should find ada_rights tab button');
    adaTab.dispatchEvent('click');
    assert.equal(getDisabilityState().activeTab, 'ada_rights');
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'disabilityCare.js');
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

