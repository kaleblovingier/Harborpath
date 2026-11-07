// test/cannabis-care.test.js
// Unit test suite for Cannabinoid Hyperemesis Syndrome (CHS) & Concentrates Care Module (Wave 23)

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
    this.value = '';
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
  closest() {
    return null;
  }
}

let cannabisModule;

describe('Cannabinoid Hyperemesis Syndrome (CHS) & Concentrates Care Module (Wave 23)', () => {
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

    cannabisModule = await import('../public/js/views/cannabisCare.js');
  });

  beforeEach(() => {
    if (cannabisModule && cannabisModule.resetCannabisState) {
      cannabisModule.resetCannabisState();
    }
  });

  test('CHS_DIAGNOSTIC_FRAMEWORK exports Rome IV criteria and 3 clinical phases with bilingual text', () => {
    const { CHS_DIAGNOSTIC_FRAMEWORK } = cannabisModule;
    assert.ok(CHS_DIAGNOSTIC_FRAMEWORK);
    assert.match(CHS_DIAGNOSTIC_FRAMEWORK.titleEn, /Rome IV/i);
    assert.strictEqual(CHS_DIAGNOSTIC_FRAMEWORK.romeIvCriteria.length, 4);

    const scaldSeeking = CHS_DIAGNOSTIC_FRAMEWORK.romeIvCriteria.find(c => c.id === 'scald_seeking');
    assert.ok(scaldSeeking);
    assert.match(scaldSeeking.detailEn, /TRPV1/i);

    assert.strictEqual(CHS_DIAGNOSTIC_FRAMEWORK.phases.length, 3);
    const prodromal = CHS_DIAGNOSTIC_FRAMEWORK.phases.find(p => p.phaseId === 'prodromal');
    assert.ok(prodromal);
    assert.match(prodromal.symptomsEn, /morning nausea/i);
  });

  test('CHS_ACUTE_TREATMENT_GUIDELINES details antiemetic paradox, capsaicin, haloperidol, and hydration', () => {
    const { CHS_ACUTE_TREATMENT_GUIDELINES } = cannabisModule;
    assert.ok(CHS_ACUTE_TREATMENT_GUIDELINES);
    assert.match(CHS_ACUTE_TREATMENT_GUIDELINES.antiemeticFailureNoticeEn, /Ondansetron|Zofran/i);
    assert.strictEqual(CHS_ACUTE_TREATMENT_GUIDELINES.firstLineTherapies.length, 3);

    const capsaicin = CHS_ACUTE_TREATMENT_GUIDELINES.firstLineTherapies.find(t => t.nameEn.includes('Capsaicin'));
    assert.ok(capsaicin);
    assert.match(capsaicin.mechanismEn, /TRPV1/i);
    assert.match(capsaicin.safetyEn, /gloves|mucous membranes/i);

    const haloperidol = CHS_ACUTE_TREATMENT_GUIDELINES.firstLineTherapies.find(t => t.nameEn.includes('Haloperidol'));
    assert.ok(haloperidol);
    assert.match(haloperidol.mechanismEn, /dopamine/i);
  });

  test('CHS_EMERGENCY_RED_FLAGS contains all 5 life-threatening red flags', () => {
    const { CHS_EMERGENCY_RED_FLAGS } = cannabisModule;
    assert.ok(Array.isArray(CHS_EMERGENCY_RED_FLAGS));
    assert.strictEqual(CHS_EMERGENCY_RED_FLAGS.length, 5);

    const ids = CHS_EMERGENCY_RED_FLAGS.map(f => f.flagId);
    assert.ok(ids.includes('aki'));
    assert.ok(ids.includes('hypokalemia_arrhythmia'));
    assert.ok(ids.includes('mallory_weiss'));
    assert.ok(ids.includes('scald_burns'));
    assert.ok(ids.includes('synthetic_cannabinoids'));
  });

  test('CANNABINOID_WITHDRAWAL_AND_RECOVERY exports 90-day CB1 timeline and supportive non-controlled meds', () => {
    const { CANNABINOID_WITHDRAWAL_AND_RECOVERY } = cannabisModule;
    assert.ok(CANNABINOID_WITHDRAWAL_AND_RECOVERY);
    assert.strictEqual(CANNABINOID_WITHDRAWAL_AND_RECOVERY.timeline.length, 4);

    const step4 = CANNABINOID_WITHDRAWAL_AND_RECOVERY.timeline[3];
    assert.match(step4.periodEn, /Weeks 6 to 12/i);
    assert.match(step4.descriptionEn, /CB1/i);

    assert.ok(CANNABINOID_WITHDRAWAL_AND_RECOVERY.supportiveMedications.length >= 3);
    const nac = CANNABINOID_WITHDRAWAL_AND_RECOVERY.supportiveMedications.find(m => m.nameEn.includes('N-Acetylcysteine'));
    assert.ok(nac);
    assert.match(nac.roleEn, /glutamate/i);
  });

  test('evaluateChsRisk correctly scores and stratifies high risk CHS vs prodromal vs low risk', () => {
    const { evaluateChsRisk } = cannabisModule;

    // High risk triad
    const highResult = evaluateChsRisk({
      heavyUse: true,
      cannabisDuration: 'more_than_year',
      cyclicVomiting: true,
      hotShowers: true,
      morningNausea: true,
      ondansetronFailed: true
    });
    assert.strictEqual(highResult.riskLevel, 'high_chs');
    assert.ok(highResult.score >= 8);
    assert.match(highResult.categoryEn, /High Clinical Probability/i);

    // Prodromal
    const prodromalResult = evaluateChsRisk({
      heavyUse: true,
      cannabisDuration: 'more_than_year',
      morningNausea: true,
      cyclicVomiting: false,
      hotShowers: false
    });
    assert.strictEqual(prodromalResult.riskLevel, 'prodromal_or_probable');
    assert.ok(prodromalResult.score >= 5 && prodromalResult.score < 8);

    // Low risk
    const lowResult = evaluateChsRisk({
      heavyUse: false,
      cannabisDuration: 'sporadic',
      cyclicVomiting: false,
      hotShowers: false
    });
    assert.strictEqual(lowResult.riskLevel, 'low');
    assert.ok(lowResult.score < 5);
  });

  test('evaluateChsEmergencyRedFlags detects emergency severities and requires 911 activation', () => {
    const { evaluateChsEmergencyRedFlags } = cannabisModule;

    const res = evaluateChsEmergencyRedFlags(['aki', 'mallory_weiss']);
    assert.strictEqual(res.hasEmergency, true);
    assert.strictEqual(res.requires911, true);
    assert.strictEqual(res.flags.length, 2);

    const safeRes = evaluateChsEmergencyRedFlags(['scald_burns']);
    assert.strictEqual(safeRes.hasEmergency, false);
    assert.strictEqual(safeRes.hasUrgent, true);
    assert.strictEqual(safeRes.requires911, false);
  });

  test('In-RAM state management provides deterministic reset and isolation', () => {
    const { getCannabisState, setCannabisState, resetCannabisState } = cannabisModule;

    setCannabisState({
      currentTab: 'acute',
      cyclicVomiting: true,
      hotShowers: true,
      heavyUse: true
    });

    let current = getCannabisState();
    assert.strictEqual(current.currentTab, 'acute');
    assert.strictEqual(current.cyclicVomiting, true);

    resetCannabisState();
    current = getCannabisState();
    assert.strictEqual(current.currentTab, 'screener');
    assert.strictEqual(current.cyclicVomiting, false);
    assert.strictEqual(current.hotShowers, false);
  });

  test('formatCannabisSummaryText generates clean bilingual summaries without PII', () => {
    const { formatCannabisSummaryText } = cannabisModule;

    const enSummary = formatCannabisSummaryText({
      heavyUse: true,
      cannabisDuration: 'more_than_year',
      cyclicVomiting: true,
      hotShowers: true,
      morningNausea: true,
      ondansetronFailed: true,
      selectedRedFlags: ['aki'],
      concentrateType: 'dabs_wax'
    }, 'en');

    assert.match(enSummary, /HARBORPATH: CANNABINOID HYPEREMESIS SYNDROME/);
    assert.match(enSummary, /Zero device persistence/);
    assert.match(enSummary, /High Clinical Probability/);
    assert.match(enSummary, /Topical capsaicin/);
    assert.match(enSummary, /Haloperidol/);
    assert.match(enSummary, /AKI/);

    const esSummary = formatCannabisSummaryText({
      heavyUse: true,
      cannabisDuration: 'more_than_year',
      cyclicVomiting: true,
      hotShowers: true,
      morningNausea: true,
      ondansetronFailed: true,
      selectedRedFlags: ['aki'],
      concentrateType: 'dabs_wax'
    }, 'es');

    assert.match(esSummary, /HARBORPATH: RESUMEN CLÍNICO DE HIPERÉMESIS CANNABINOIDE/);
    assert.match(esSummary, /100% en memoria RAM/);
    assert.match(esSummary, /Alta Probabilidad Clínica/);
  });

  test('cannabisCareView mounts accessible DOM structure with tab navigation', () => {
    const { cannabisCareView } = cannabisModule;
    const view = cannabisCareView();

    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.className.includes('cannabis-care-view'));
    assert.ok(view.children.length >= 1);
  });

  test('Static security and privacy audit of cannabisCare.js', () => {
    const filePath = path.resolve('public/js/views/cannabisCare.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});

