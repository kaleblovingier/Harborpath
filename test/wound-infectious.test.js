/**
 * Unit & Integration Tests: Wound Care & Infectious Disease Harm Reduction Specialist (test/wound-infectious.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  WOUND_CARE_PROTOCOLS,
  INFECTION_RED_FLAGS,
  HEPATITIS_DAA_STANDARDS,
  VEIN_CARE_PRINCIPLES,
  evaluateWoundInfectiousRisk,
  getWoundState,
  setWoundState,
  resetWoundState,
  formatWoundSummaryText,
  woundInfectiousView,
} from '../public/js/views/woundInfectious.js';

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

describe('Wound Care & Infectious Disease Harm Reduction Module (public/js/views/woundInfectious.js)', () => {
  beforeEach(() => {
    resetWoundState();
  });

  test('Module Exports & Clinical Standards Framework Integrity', () => {
    assert.ok(Array.isArray(WOUND_CARE_PROTOCOLS), 'WOUND_CARE_PROTOCOLS must be an array');
    assert.equal(WOUND_CARE_PROTOCOLS.length, 4, 'Must have 4 primary wound care protocol steps');

    // Verify non-cytotoxic step
    const avoidCytotoxicStep = WOUND_CARE_PROTOCOLS.find((s) => s.stepId === 'avoid_cytotoxics');
    assert.ok(avoidCytotoxicStep, 'Must include avoid_cytotoxics step');
    assert.match(avoidCytotoxicStep.summary.en, /hydrogen peroxide/i);
    assert.match(avoidCytotoxicStep.summary.en, /cytotoxic/i);
    assert.match(avoidCytotoxicStep.summary.es, /citotóxicas/i);

    // Verify Infection Red Flags
    assert.ok(Array.isArray(INFECTION_RED_FLAGS), 'INFECTION_RED_FLAGS must be an array');
    const necrotizing = INFECTION_RED_FLAGS.find((f) => f.conditionId === 'necrotizing_fasciitis');
    assert.ok(necrotizing, 'Must include necrotizing fasciitis');
    assert.equal(necrotizing.severity, 'emergency_911');
    assert.ok(necrotizing.hallmarkSigns.en.some((s) => s.includes('crepitus')));

    const endocarditis = INFECTION_RED_FLAGS.find((f) => f.conditionId === 'infective_endocarditis');
    assert.ok(endocarditis, 'Must include infective endocarditis');
    assert.ok(endocarditis.hallmarkSigns.en.some((s) => s.includes('Janeway')));
    assert.ok(endocarditis.hallmarkSigns.en.some((s) => s.includes('Osler')));

    // Verify Hepatitis DAA Standards
    assert.ok(HEPATITIS_DAA_STANDARDS.universalAccess, 'Must define universal access standard');
    assert.match(HEPATITIS_DAA_STANDARDS.universalAccess.en, /AASLD/);
    assert.match(HEPATITIS_DAA_STANDARDS.universalAccess.en, /NEVER an acceptable medical reason/);
    assert.match(HEPATITIS_DAA_STANDARDS.cureRate.en, /95%/);

    // Verify Vein Care Principles
    assert.ok(Array.isArray(VEIN_CARE_PRINCIPLES), 'VEIN_CARE_PRINCIPLES must be an array');
    assert.ok(VEIN_CARE_PRINCIPLES.some((p) => p.topic.en.includes('Tourniquet')), 'Must include tourniquet release principle');
    assert.ok(VEIN_CARE_PRINCIPLES.some((p) => p.topic.en.includes('Cotton')), 'Must include cotton fever prevention principle');
  });

  test('evaluateWoundInfectiousRisk: Escalates Necrotizing Fasciitis to emergency_911', () => {
    const risk = evaluateWoundInfectiousRisk({
      woundPresent: true,
      woundAppearance: 'crepitus_severe_pain_bullae',
      systemicSymptoms: [],
      injectionPractices: [],
      hepatitisCStatus: 'cured',
    });

    assert.equal(risk.emergencyStatus, 'emergency_911');
    assert.ok(risk.emergencyReasons.some((r) => r.condition === 'necrotizing_fasciitis'));
    assert.match(risk.emergencyReasons[0].detail.en, /crepitus/i);
    assert.match(risk.emergencyReasons[0].detail.es, /crepitación/i);
  });

  test('evaluateWoundInfectiousRisk: Detects Systemic Sepsis (Fever + Tachycardia/Confusion)', () => {
    const sepsisRisk = evaluateWoundInfectiousRisk({
      woundPresent: true,
      woundAppearance: 'necrotic_slough',
      systemicSymptoms: ['fever_chills', 'tachycardia'],
      injectionPractices: [],
      hepatitisCStatus: 'negative',
    });

    assert.equal(sepsisRisk.emergencyStatus, 'emergency_911');
    assert.ok(sepsisRisk.emergencyReasons.some((r) => r.condition === 'systemic_sepsis'));
    assert.match(sepsisRisk.emergencyReasons[0].detail.en, /bloodstream/i);
    assert.match(sepsisRisk.emergencyReasons[0].detail.en, /EMTALA/);
  });

  test('evaluateWoundInfectiousRisk: Identifies Infective Endocarditis risks (Fever + Night Sweats/Chest Pain)', () => {
    const endocarditisRisk = evaluateWoundInfectiousRisk({
      woundPresent: true,
      woundAppearance: 'clean_granulating',
      systemicSymptoms: ['fever_chills', 'night_sweats'],
      injectionPractices: ['reusing_syringes'],
      hepatitisCStatus: 'unknown',
    });

    assert.equal(endocarditisRisk.emergencyStatus, 'urgent_medical');
    assert.ok(endocarditisRisk.endocarditisAlert, 'Must produce endocarditis alert');
    assert.match(endocarditisRisk.endocarditisAlert.detail.en, /echocardiogram/i);
    assert.ok(endocarditisRisk.hcvAdvice, 'Must provide HCV guidance when status is unknown');
    assert.match(endocarditisRisk.hcvAdvice.detail.en, />95% cure rate/);
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getWoundState();
    assert.equal(initial.woundAppearance, 'necrotic_slough');
    assert.equal(initial.activeTab, 'decision_aid');

    setWoundState({
      woundAppearance: 'crepitus_severe_pain_bullae',
      systemicSymptoms: ['fever_chills', 'confusion_delirium'],
      activeTab: 'red_flags',
    });

    const modified = getWoundState();
    assert.equal(modified.woundAppearance, 'crepitus_severe_pain_bullae');
    assert.equal(modified.activeTab, 'red_flags');
    assert.ok(modified.systemicSymptoms.includes('confusion_delirium'));

    resetWoundState();
    const afterReset = getWoundState();
    assert.equal(afterReset.woundAppearance, 'necrotic_slough');
    assert.equal(afterReset.activeTab, 'decision_aid');
    assert.deepEqual(afterReset.systemicSymptoms, ['fever_chills']);
  });

  test('formatWoundSummaryText: Generates comprehensive bilingual plain-text summaries', () => {
    const plan = evaluateWoundInfectiousRisk({
      woundPresent: true,
      woundAppearance: 'crepitus_severe_pain_bullae',
      systemicSymptoms: ['fever_chills', 'night_sweats'],
      injectionPractices: ['reusing_cottons'],
      hepatitisCStatus: 'positive_untreated',
    });

    const enText = formatWoundSummaryText(plan, 'en');
    assert.match(enText, /WOUND CARE & INFECTIOUS DISEASE CLINICAL PLAN/);
    assert.match(enText, /EMERGENCY_911/);
    assert.match(enText, /CRITICAL EMERGENCY RED FLAGS/);
    assert.match(enText, /INFECTIVE ENDOCARDITIS EVALUATION ALERT/);
    assert.match(enText, /RECOMMENDED MOIST WOUND CARE PROTOCOL/);
    assert.match(enText, /HEPATITIS C DAA CURATIVE TREATMENT/);
    assert.match(enText, /PROVIDER DISCUSSION CHECKLIST/);

    const esText = formatWoundSummaryText(plan, 'es');
    assert.match(esText, /PLAN DE CUIDADO DE HERIDAS E INFECCIONES/);
    assert.match(esText, /ALERTAS CRÍTICAS DE EMERGENCIA/);
    assert.match(esText, /ALERTA DE ENDOCARDITIS INFECCIOSA/);
    assert.match(esText, /PROTOCOLO DE CICATRIZACIÓN HÚMEDA/);
    assert.match(esText, /ORIENTACIÓN SOBRE HEPATITIS C/);
  });

  test('woundInfectiousView: Mounts accessible DOM structure across tabs', () => {
    const container = new MockNode('div');
    const view = woundInfectiousView(container);
    assert.ok(container.children.length > 0, 'Container should receive view elements');

    const tabButtons = container.querySelectorAll('button[role="tab"]');
    assert.equal(tabButtons.length, 4, 'Must render 4 navigation tabs');

    // Switch to wound_protocols tab
    const protocolsTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'wound_protocols');
    assert.ok(protocolsTab, 'Should find wound_protocols tab button');
    protocolsTab.dispatchEvent('click');

    const state = getWoundState();
    assert.equal(state.activeTab, 'wound_protocols');

    // Switch to red_flags tab
    const redFlagsTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'red_flags');
    assert.ok(redFlagsTab, 'Should find red_flags tab button');
    redFlagsTab.dispatchEvent('click');
    assert.equal(getWoundState().activeTab, 'red_flags');

    // Switch to vein_care tab
    const veinTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'vein_care');
    assert.ok(veinTab, 'Should find vein_care tab button');
    veinTab.dispatchEvent('click');
    assert.equal(getWoundState().activeTab, 'vein_care');
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'woundInfectious.js');
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
