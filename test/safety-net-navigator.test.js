/**
 * Unit & Integration Tests: Safety-Net Navigator & Telehealth Access Component (test/safety-net-navigator.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  FEDERAL_SAFETY_NET_PROGRAMS,
  FPL_2026_GUIDELINES,
  getFplThreshold,
  SLIDING_FEE_TIERS,
  evaluateSafetyNetEligibility,
  getSafetyNetState,
  setSafetyNetState,
  resetSafetyNetState,
  formatSafetyNetSummaryText,
  safetyNetNavigatorComponent,
} from '../public/js/components/safetyNetNavigator.js';

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

describe('Safety-Net Navigator & Telehealth Access Component (public/js/components/safetyNetNavigator.js)', () => {
  beforeEach(() => {
    resetSafetyNetState();
  });

  test('Module Exports & Statutory Safety-Net Framework Integrity', () => {
    assert.ok(Array.isArray(FEDERAL_SAFETY_NET_PROGRAMS), 'FEDERAL_SAFETY_NET_PROGRAMS must be an array');
    assert.equal(FEDERAL_SAFETY_NET_PROGRAMS.length, 4);

    const fqhc = FEDERAL_SAFETY_NET_PROGRAMS.find((p) => p.id === 'fqhc_section_330');
    assert.ok(fqhc, 'Must include FQHC § 330');
    assert.match(fqhc.citation, /42 U.S.C\. § 254b/);

    const emtala = FEDERAL_SAFETY_NET_PROGRAMS.find((p) => p.id === 'emtala_emergency_rights');
    assert.ok(emtala, 'Must include EMTALA');
    assert.match(emtala.citation, /42 U.S.C\. § 1395dd/);

    const teleMoud = FEDERAL_SAFETY_NET_PROGRAMS.find((p) => p.id === 'telehealth_moud_flexibility');
    assert.ok(teleMoud, 'Must include Tele-MOUD');

    // FPL Calculation checks
    assert.equal(getFplThreshold(1, 'US'), 15650);
    assert.equal(getFplThreshold(2, 'US'), 15650 + 5380);
    assert.equal(getFplThreshold(1, 'AK'), 19570);
    assert.equal(getFplThreshold(1, 'HI'), 18010);

    // Sliding Fee Tiers
    assert.ok(Array.isArray(SLIDING_FEE_TIERS));
    assert.equal(SLIDING_FEE_TIERS.length, 5);
    const nominal = SLIDING_FEE_TIERS.find((t) => t.id === 'nominal_tier');
    assert.ok(nominal.zeroIncomeAffidavit);
  });

  test('evaluateSafetyNetEligibility: Accurately classifies 0% FPL and triggers Zero-Income Affidavit', () => {
    const plan = evaluateSafetyNetEligibility({
      householdSize: 1,
      annualIncome: 0,
      stateCode: 'US',
      insuranceStatus: 'uninsured',
      seekingConfidentiality: false,
    });

    assert.equal(plan.fplPercentage, 0);
    assert.equal(plan.matchedTier.id, 'nominal_tier');
    assert.ok(plan.documentationChecklist.some((d) => d.item.en.includes('Zero-Income Self-Attestation')));
    assert.ok(plan.statutoryGuidance.some((g) => g.title.en.includes('Presumptive Medicaid Expansion')));
  });

  test('evaluateSafetyNetEligibility: Calculates graduated sliding fee tier and Title X confidentiality', () => {
    // Household of 2 at $25,000 in contiguous US (Threshold: 15650 + 5380 = 21030) -> 25000 / 21030 = ~119%
    const plan = evaluateSafetyNetEligibility({
      householdSize: 2,
      annualIncome: 25000,
      stateCode: 'US',
      seekingConfidentiality: true,
      interestedInTelehealth: true,
    });

    assert.equal(plan.fplPercentage, 119);
    assert.equal(plan.matchedTier.id, 'tier_a');
    assert.ok(plan.statutoryGuidance.some((g) => g.title.en.includes('Title X Confidential Rating')));
    assert.ok(plan.statutoryGuidance.some((g) => g.title.en.includes('Tele-MOUD Access')));
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getSafetyNetState();
    assert.equal(initial.householdSize, 1);
    assert.equal(initial.activeTab, 'calculator');

    setSafetyNetState({
      householdSize: 3,
      annualIncome: 20000,
      activeTab: 'checklist',
    });

    const modified = getSafetyNetState();
    assert.equal(modified.householdSize, 3);
    assert.equal(modified.annualIncome, 20000);
    assert.equal(modified.activeTab, 'checklist');

    resetSafetyNetState();
    const afterReset = getSafetyNetState();
    assert.equal(afterReset.householdSize, 1);
    assert.equal(afterReset.annualIncome, 12000);
    assert.equal(afterReset.activeTab, 'calculator');
  });

  test('formatSafetyNetSummaryText: Generates comprehensive bilingual plain-text summaries', () => {
    const plan = evaluateSafetyNetEligibility({
      householdSize: 1,
      annualIncome: 12000,
      stateCode: 'US',
      seekingConfidentiality: true,
      interestedInTelehealth: true,
    });

    const enText = formatSafetyNetSummaryText(plan, 'en');
    assert.match(enText, /SAFETY-NET NAVIGATOR & FQHC ACCESS PLAN/);
    assert.match(enText, /Nominal Fee Tier/);
    assert.match(enText, /SAFETY-NET APPOINTMENT DOCUMENTATION CHECKLIST/);
    assert.match(enText, /SAMHSA National Helpline: 1-800-662-4357/);

    const esText = formatSafetyNetSummaryText(plan, 'es');
    assert.match(esText, /PLAN DE ACCESO A RED DE SEGURIDAD Y FQHC/);
    assert.match(esText, /Nivel de Tarifa Nominal/);
    assert.match(esText, /LISTA DE DOCUMENTOS PARA LLEVAR A LA CLÍNICA/);
    assert.match(esText, /Línea Nacional SAMHSA: 1-800-662-4357/);
  });

  test('safetyNetNavigatorComponent: Mounts accessible DOM structure across tabs', () => {
    const container = new MockNode('div');
    const comp = safetyNetNavigatorComponent(container);
    assert.ok(container.children.length > 0, 'Container should receive elements');

    const tabButtons = container.querySelectorAll('button[role="tab"]');
    assert.equal(tabButtons.length, 4, 'Must render 4 navigation tabs');

    // Switch to checklist tab
    const checklistTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'checklist');
    assert.ok(checklistTab, 'Should find checklist tab button');
    checklistTab.dispatchEvent('click');
    assert.equal(getSafetyNetState().activeTab, 'checklist');

    // Switch to programs tab
    const programsTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'programs');
    assert.ok(programsTab, 'Should find programs tab button');
    programsTab.dispatchEvent('click');
    assert.equal(getSafetyNetState().activeTab, 'programs');

    // Switch to rights tab
    const rightsTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'rights');
    assert.ok(rightsTab, 'Should find rights tab button');
    rightsTab.dispatchEvent('click');
    assert.equal(getSafetyNetState().activeTab, 'rights');
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'components', 'safetyNetNavigator.js');
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

