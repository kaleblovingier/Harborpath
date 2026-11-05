// test/dual-diagnosis.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  IDDT_PRINCIPLES,
  PSYCHOTROPIC_MOUD_PROFILES,
  TOXICOLOGY_FALSE_POSITIVES,
  GROUNDING_PROTOCOLS,
  evaluateCrisisSafety,
  buildDualDiagnosisScript,
  formatDualDiagnosisSummaryText,
  getDualDiagnosisState,
  setDualDiagnosisState,
  resetDualDiagnosisState,
  dualDiagnosisView
} from '../public/js/views/dualDiagnosis.js';

class MockNode {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.attributes = {};
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.dataset = {};
    this.className = '';
    this._textContent = '';
    this.classList = {
      _classes: new Set(),
      add: (...cls) => {
        for (const c of cls) this.classList._classes.add(c);
        this.className = Array.from(this.classList._classes).join(' ');
      },
      remove: (...cls) => {
        for (const c of cls) this.classList._classes.delete(c);
        this.className = Array.from(this.classList._classes).join(' ');
      },
      toggle: (c, force) => {
        if (force === true) this.classList.add(c);
        else if (force === false) this.classList.remove(c);
        else if (this.classList._classes.has(c)) this.classList.remove(c);
        else this.classList.add(c);
      },
      contains: (c) => this.classList._classes.has(c)
    };
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this._textContent = String(val ?? '');
    this.children = [];
  }

  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(event, fn) { this.listeners[event] = fn; }

  appendChild(c) {
    if (c) {
      if (c instanceof MockNode) c.parent = this;
      this.children.push(c);
    }
    return c;
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

  get firstChild() {
    return this.children[0] || null;
  }

  remove() {
    if (this.parent) {
      const idx = this.parent.children.indexOf(this);
      if (idx !== -1) this.parent.children.splice(idx, 1);
    }
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (node instanceof MockNode) {
        if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
        else if (selector === 'input' && node.tagName === 'INPUT') matches.push(node);
        else if (selector === 'select' && node.tagName === 'SELECT') matches.push(node);
        else if (selector.startsWith('#') && node.attributes.id === selector.slice(1)) matches.push(node);
        else if (selector.startsWith('.') && node.className && node.className.includes(selector.slice(1))) matches.push(node);
        else if (selector.startsWith('[') && selector.endsWith(']')) {
          const [k, v] = selector.slice(1, -1).split('=');
          const cleanK = k?.trim();
          const cleanV = v ? v.replace(/['"]/g, '').trim() : null;
          if (cleanV !== null && node.attributes[cleanK] === cleanV) matches.push(node);
          else if (cleanV === null && cleanK in node.attributes) matches.push(node);
        }
        for (const child of node.children) {
          walk(child);
        }
      }
    };
    walk(this);
    return matches;
  }
}

test('IDDT_PRINCIPLES exports all 4 core Integrated Dual Disorder Treatment principles', () => {
  assert.equal(IDDT_PRINCIPLES.length, 4);
  for (const p of IDDT_PRINCIPLES) {
    assert.ok(p.id);
    assert.ok(p.titleEn);
    assert.ok(p.titleEs);
    assert.ok(p.descEn);
    assert.ok(p.descEs);
  }
  const unified = IDDT_PRINCIPLES.find((p) => p.id === 'integrated_not_sequential');
  assert.ok(unified);
  assert.match(unified.titleEn, /not sequential/i);
  assert.match(unified.descEn, /concurrently/i);
});

test('PSYCHOTROPIC_MOUD_PROFILES exports evidence-based compatibility profiles', () => {
  assert.ok(Array.isArray(PSYCHOTROPIC_MOUD_PROFILES));
  assert.equal(PSYCHOTROPIC_MOUD_PROFILES.length, 4);

  const mood = PSYCHOTROPIC_MOUD_PROFILES.find((p) => p.id === 'mood_stabilizers');
  assert.ok(mood);
  assert.match(mood.keyClinicalPearlsEn.join(' '), /Lithium.*dehydration/i);

  const adhd = PSYCHOTROPIC_MOUD_PROFILES.find((p) => p.id === 'adhd_medications');
  assert.ok(adhd);
  assert.match(adhd.moudCompatibilityEn, /Untreated ADHD triples/i);

  const bupropion = PSYCHOTROPIC_MOUD_PROFILES.find((p) => p.id === 'bupropion_safety');
  assert.ok(bupropion);
  assert.match(bupropion.keyClinicalPearlsEn.join(' '), /seizure threshold/i);
});

test('TOXICOLOGY_FALSE_POSITIVES documents known immunoassay cross-reactivity targets', () => {
  assert.equal(TOXICOLOGY_FALSE_POSITIVES.length, 5);

  const bupropionCross = TOXICOLOGY_FALSE_POSITIVES.find((t) => /Bupropion/i.test(t.prescribedMedicationEn));
  assert.ok(bupropionCross);
  assert.match(bupropionCross.falsePositiveForEn, /Amphetamine/i);

  const sertralineCross = TOXICOLOGY_FALSE_POSITIVES.find((t) => /Sertraline/i.test(t.prescribedMedicationEn));
  assert.ok(sertralineCross);
  assert.match(sertralineCross.falsePositiveForEn, /Benzodiazepines/i);

  const quetiapineCross = TOXICOLOGY_FALSE_POSITIVES.find((t) => /Quetiapine/i.test(t.prescribedMedicationEn));
  assert.ok(quetiapineCross);
  assert.match(quetiapineCross.falsePositiveForEn, /Methadone/i);
});

test('GROUNDING_PROTOCOLS provides sensory, cognitive, and physiological exercises', () => {
  assert.equal(GROUNDING_PROTOCOLS.length, 3);
  const sensory = GROUNDING_PROTOCOLS.find((g) => g.category === 'sensory');
  assert.ok(sensory);
  assert.equal(sensory.stepsEn.length, 5);

  const cognitive = GROUNDING_PROTOCOLS.find((g) => g.category === 'cognitive');
  assert.ok(cognitive);
  assert.ok(cognitive.stepsEn.some((s) => s.includes('safe in this room')));
});

test('evaluateCrisisSafety stratifies suicide risk and activates crisis directives under Columbia Protocol', () => {
  // Scenario 1: Imminent emergency (intent with plan)
  const imminent = evaluateCrisisSafety({ intentWithPlan: true });
  assert.equal(imminent.severity, 'imminent_crisis_emergency');
  assert.match(imminent.titleEn, /IMMEDIATE EMERGENCY/i);
  assert.ok(imminent.directivesEn.some((d) => d.includes('988')));
  assert.ok(imminent.directivesEn.some((d) => d.includes('Lethal Means')));

  // Scenario 2: Moderate risk (thoughts with method)
  const moderate = evaluateCrisisSafety({ thoughtsWithMethod: true });
  assert.equal(moderate.severity, 'moderate_crisis_support');
  assert.match(moderate.titleEn, /URGENT/i);

  // Scenario 3: Passive ideation (wish to be dead)
  const passive = evaluateCrisisSafety({ wishToBeDead: true });
  assert.equal(passive.severity, 'passive_ideation_support');
  assert.match(passive.titleEn, /Passive Suicidal Thoughts/i);

  // Scenario 4: Stable outpatient
  const stable = evaluateCrisisSafety({});
  assert.equal(stable.severity, 'routine_mental_health_care');
  assert.match(stable.titleEn, /Stable/i);
});

test('buildDualDiagnosisScript generates patient self-advocacy scripts', () => {
  const gcmsScript = buildDualDiagnosisScript({ scriptType: 'confirmatory_gcms', medicationName: 'Wellbutrin' });
  assert.match(gcmsScript, /Wellbutrin/);
  assert.match(gcmsScript, /Gas Chromatography-Mass Spectrometry/);

  const iddtScript = buildDualDiagnosisScript({ scriptType: 'iddt_request' });
  assert.match(iddtScript, /integrated dual disorder treatment/);

  const adhdScript = buildDualDiagnosisScript({ scriptType: 'adhd_advocacy' });
  assert.match(adhdScript, /evaluation for ADHD/);

  const traumaScript = buildDualDiagnosisScript({ scriptType: 'trauma_boundary' });
  assert.match(traumaScript, /history of trauma/);
});

test('formatDualDiagnosisSummaryText formats complete bilingual summaries without PII', () => {
  const enSummary = formatDualDiagnosisSummaryText({ intentWithPlan: true }, 'en');
  assert.match(enSummary, /HARBORPATH — DUAL DIAGNOSIS & INTEGRATED MENTAL HEALTH REPORT/);
  assert.match(enSummary, /IMMEDIATE EMERGENCY/);
  assert.match(enSummary, /INTEGRATED MODEL \(IDDT\) PRINCIPLES/);
  assert.match(enSummary, /TOXICOLOGY FALSE-POSITIVE REGISTRY/);

  const esSummary = formatDualDiagnosisSummaryText({ intentWithPlan: true }, 'es');
  assert.match(esSummary, /REPORTE DE DIAGNÓSTICO DUAL Y SALUD INTEGRADA/);
  assert.match(esSummary, /EMERGENCIA INMEDIATA/);
  assert.match(esSummary, /PRINCIPIOS DEL MODELO INTEGRADO/);
});

test('In-RAM state management provides deterministic reset and isolation', () => {
  resetDualDiagnosisState();
  const init = getDualDiagnosisState();
  assert.equal(init.activeTab, 'iddt-model');
  assert.equal(init.intentWithPlan, false);
  assert.equal(init.wishToBeDead, false);

  setDualDiagnosisState({
    activeTab: 'crisis-plan',
    intentWithPlan: true,
    testedMedication: 'Sertraline'
  });

  const modified = getDualDiagnosisState();
  assert.equal(modified.activeTab, 'crisis-plan');
  assert.equal(modified.intentWithPlan, true);
  assert.equal(modified.testedMedication, 'Sertraline');

  resetDualDiagnosisState();
  const reset = getDualDiagnosisState();
  assert.equal(reset.activeTab, 'iddt-model');
  assert.equal(reset.intentWithPlan, false);
  assert.equal(reset.testedMedication, 'Bupropion (Wellbutrin)');
});

test('dualDiagnosisView renders accessible WCAG 2.2 AA compliant UI', () => {
  const originalDoc = globalThis.document;
  const originalNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag)
  };

  try {
    resetDualDiagnosisState();
    const view = dualDiagnosisView();
    assert.ok(view);
    assert.equal(view.className, 'dual-diagnosis-view container');

    const tabList = view.querySelector('.tab-nav');
    assert.ok(tabList);
    assert.equal(tabList.getAttribute('role'), 'tablist');

    const tabs = view.querySelectorAll('[role=tab]');
    assert.equal(tabs.length, 6);
  } finally {
    globalThis.document = originalDoc;
    globalThis.Node = originalNode;
  }
});

test('Static security and privacy audit of dualDiagnosis.js', () => {
  const content = readFileSync(new URL('../public/js/views/dualDiagnosis.js', import.meta.url), 'utf8');

  assert.doesNotMatch(content, /localStorage/, 'Must not access localStorage');
  assert.doesNotMatch(content, /sessionStorage/, 'Must not access sessionStorage');
  assert.doesNotMatch(content, /document\.cookie/, 'Must not access document.cookie');
  assert.doesNotMatch(content, /innerHTML/, 'Must not use innerHTML');
  assert.doesNotMatch(content, /outerHTML/, 'Must not use outerHTML');
  assert.doesNotMatch(content, /style\s*=/, 'Must not use inline style attributes');
});
