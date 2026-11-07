// test/polysubstance-care.test.js
// Unit test suite for Polysubstance Care & Synergy Navigator (Wave 19)

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Minimal Mock DOM Node
class MockNode {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.className = '';
    this.textContent = '';
    this.checked = false;
    this.rows = 0;
  }
  appendChild(child) {
    if (child) this.children.push(child);
    return child;
  }
  append(...children) {
    for (const c of children) {
      if (c) this.children.push(c);
    }
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'class') this.className = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] || null;
  }
  addEventListener() {}
  removeEventListener() {}
}

let polysubstanceModule;

describe('Polysubstance Care & Synergy Navigator (Wave 19)', () => {
  before(async () => {
    // Setup mock DOM globals
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      createTextNode: (txt) => {
        const n = new MockNode('#text');
        n.textContent = txt;
        return n;
      },
      documentElement: { lang: 'en' }
    };
    globalThis.Node = MockNode;

    polysubstanceModule = await import('../public/js/views/polysubstanceCare.js');
  });

  beforeEach(() => {
    polysubstanceModule.resetPolysubstanceState();
  });

  test('SUBSTANCE_CLASSES exports 8 comprehensive classes with bilingual descriptions', () => {
    const { SUBSTANCE_CLASSES } = polysubstanceModule;
    assert.strictEqual(Array.isArray(SUBSTANCE_CLASSES), true);
    assert.strictEqual(SUBSTANCE_CLASSES.length, 8);

    const ids = SUBSTANCE_CLASSES.map(s => s.id);
    assert.ok(ids.includes('opioids'));
    assert.ok(ids.includes('benzodiazepines'));
    assert.ok(ids.includes('alcohol'));
    assert.ok(ids.includes('gabapentinoids'));
    assert.ok(ids.includes('stimulants'));
    assert.ok(ids.includes('dissociatives'));
    assert.ok(ids.includes('alpha2_agonists'));
    assert.ok(ids.includes('serotonergics'));

    SUBSTANCE_CLASSES.forEach(s => {
      assert.ok(s.nameEn && s.nameEn.length > 0);
      assert.ok(s.nameEs && s.nameEs.length > 0);
      assert.ok(s.mechanismEn && s.mechanismEn.length > 0);
      assert.ok(s.mechanismEs && s.mechanismEs.length > 0);
      assert.ok(s.halfLifeEn && s.halfLifeEn.length > 0);
    });
  });

  test('HUNTER_SEROTONIN_CRITERIA exports 5 evidence-based diagnostic rules', () => {
    const { HUNTER_SEROTONIN_CRITERIA } = polysubstanceModule;
    assert.ok(HUNTER_SEROTONIN_CRITERIA.titleEn);
    assert.ok(HUNTER_SEROTONIN_CRITERIA.titleEs);
    assert.strictEqual(HUNTER_SEROTONIN_CRITERIA.rules.length, 5);

    const spontaneousClonus = HUNTER_SEROTONIN_CRITERIA.rules.find(r => r.ruleEn.includes('Spontaneous clonus'));
    assert.ok(spontaneousClonus);
    assert.match(spontaneousClonus.diagnosticWeightEn, /definitive/i);

    const hyperthermiaRule = HUNTER_SEROTONIN_CRITERIA.rules.find(r => r.ruleEn.includes('temperature > 38°C'));
    assert.ok(hyperthermiaRule);
    assert.match(hyperthermiaRule.diagnosticWeightEn, /life-threatening/i);
  });

  test('AIRWAY_RESUSCITATION_STANDARDS exports 5 structured steps with sedation limits', () => {
    const { AIRWAY_RESUSCITATION_STANDARDS } = polysubstanceModule;
    assert.ok(AIRWAY_RESUSCITATION_STANDARDS.titleEn);
    assert.strictEqual(AIRWAY_RESUSCITATION_STANDARDS.steps.length, 5);

    const sedationPlateau = AIRWAY_RESUSCITATION_STANDARDS.steps.find(s => s.step === 5);
    assert.ok(sedationPlateau);
    assert.match(sedationPlateau.actionEn, /Recovery Position/i);
    assert.match(sedationPlateau.actionEn, /DO NOT keep pumping naloxone/i);
  });

  test('evaluatePolysubstanceRisk handles empty and single substance cases', () => {
    const { evaluatePolysubstanceRisk } = polysubstanceModule;

    const empty = evaluatePolysubstanceRisk([]);
    assert.strictEqual(empty.severity, 'none');
    assert.match(empty.tierTitleEn, /no substances selected/i);

    const single = evaluatePolysubstanceRisk(['opioids']);
    assert.strictEqual(single.severity, 'single');
    assert.match(single.tierTitleEn, /single substance profile/i);
  });

  test('evaluatePolysubstanceRisk stratifies Opioid + Benzodiazepine as critical respiratory arrest', () => {
    const { evaluatePolysubstanceRisk } = polysubstanceModule;
    const result = evaluatePolysubstanceRisk(['opioids', 'benzodiazepines']);

    assert.strictEqual(result.severity, 'critical');
    assert.strictEqual(result.badgeClass, 'badge-danger');
    assert.match(result.tierTitleEn, /CRITICAL: Synergistic Depressant/i);

    const hasHypoxicRisk = result.primaryRisks.some(r => r.titleEn.includes('Respiratory Drive Collapse'));
    assert.ok(hasHypoxicRisk);

    const hasRescueBreathing = result.emergencyActions.some(a => a.actionEn.includes('rescue breathing'));
    assert.ok(hasRescueBreathing);
  });

  test('evaluatePolysubstanceRisk identifies Speedball/Goofball masking effect', () => {
    const { evaluatePolysubstanceRisk } = polysubstanceModule;
    const result = evaluatePolysubstanceRisk(['opioids', 'stimulants']);

    assert.ok(['severe', 'critical'].includes(result.severity));
    const hasMasking = result.primaryRisks.some(r => r.titleEn.includes('Mismatch & Sudden Crash'));
    assert.ok(hasMasking);
    assert.ok(result.harmReductionPoints.some(p => p.tipEn.includes('outlasts the stimulant')));
  });

  test('evaluatePolysubstanceRisk identifies Serotonin Toxicity with Hunter Criteria', () => {
    const { evaluatePolysubstanceRisk } = polysubstanceModule;
    const result = evaluatePolysubstanceRisk(['serotonergics', 'stimulants']);

    assert.strictEqual(result.severity, 'severe');
    assert.match(result.tierTitleEn, /Serotonin Toxicity/i);
    assert.ok(result.primaryRisks.some(r => r.titleEn.includes('Hunter Criteria')));
    assert.ok(result.emergencyActions.some(a => a.actionEn.includes('cooling')));
  });

  test('evaluatePolysubstanceRisk identifies Naloxone-Resistant non-opioid depressant coma', () => {
    const { evaluatePolysubstanceRisk } = polysubstanceModule;
    const result = evaluatePolysubstanceRisk(['benzodiazepines', 'alcohol', 'gabapentinoids']);

    assert.strictEqual(result.severity, 'severe');
    assert.match(result.tierTitleEn, /Non-Opioid Multi-GABAergic/i);
    assert.ok(result.primaryRisks.some(r => r.titleEn.includes('Naloxone-Resistant')));
  });

  test('In-RAM state management provides deterministic reset and isolation', () => {
    const { getPolysubstanceState, setPolysubstanceState, resetPolysubstanceState } = polysubstanceModule;

    setPolysubstanceState({
      selectedSubstances: ['stimulants', 'serotonergics'],
      activeTab: 'serotonin',
      staggerPlanChecked: true
    });

    let current = getPolysubstanceState();
    assert.strictEqual(current.activeTab, 'serotonin');
    assert.strictEqual(current.staggerPlanChecked, true);
    assert.deepStrictEqual(current.selectedSubstances, ['stimulants', 'serotonergics']);

    resetPolysubstanceState();
    current = getPolysubstanceState();
    assert.strictEqual(current.activeTab, 'checker');
    assert.strictEqual(current.staggerPlanChecked, false);
    assert.deepStrictEqual(current.selectedSubstances, ['opioids', 'benzodiazepines']);
  });

  test('formatPolysubstanceSummaryText formats bilingual summary without PII', () => {
    const { formatPolysubstanceSummaryText } = polysubstanceModule;

    const enText = formatPolysubstanceSummaryText({
      selectedSubstances: ['opioids', 'benzodiazepines', 'alcohol'],
      activeTab: 'checker'
    }, 'en');

    assert.match(enText, /HARBORPATH POLYSUBSTANCE INTERACTION/);
    assert.match(enText, /Zero device storage/);
    assert.match(enText, /Never Use Alone/);
    assert.match(enText, /Never Use Alone[^\n]*1-800-484-3731/); // hotlines.js primary (877-696-1997 was a wrong number)

    const esText = formatPolysubstanceSummaryText({
      selectedSubstances: ['opioids', 'benzodiazepines', 'alcohol'],
      activeTab: 'checker'
    }, 'es');

    assert.match(esText, /EVALUACIÓN DE INTERACCIÓN DE POLISUSTANCIAS/);
    assert.match(esText, /Cero datos en disco/);
  });

  test('polysubstanceCareView mounts accessible DOM structure', () => {
    const { polysubstanceCareView } = polysubstanceModule;
    const view = polysubstanceCareView();

    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.className.includes('polysubstance-view'));
    assert.ok(view.children.length >= 3);
  });

  test('Static security and privacy audit of polysubstanceCare.js', () => {
    const filePath = path.resolve('public/js/views/polysubstanceCare.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
