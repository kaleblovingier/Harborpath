// test/viral-hepatitis.test.js
// Unit test suite for Viral Hepatitis (HCV/HBV), DAA Regimens, FIB-4 & HIV PrEP/PEP Module (Wave 24)

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

let viralModule;

describe('Viral Hepatitis (HCV/HBV), DAA Regimens, FIB-4 & HIV PrEP/PEP Module (Wave 24)', () => {
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

    viralModule = await import('../public/js/views/viralHepatitis.js');
  });

  beforeEach(() => {
    if (viralModule && viralModule.resetViralState) {
      viralModule.resetViralState();
    }
  });

  test('AASLD_HCV_GUIDELINES exports anti-discrimination mandate and 4-step diagnostic cascade', () => {
    const { AASLD_HCV_GUIDELINES } = viralModule;
    assert.ok(AASLD_HCV_GUIDELINES);
    assert.match(AASLD_HCV_GUIDELINES.mandateEn, /NEVER A REASON TO WITHHOLD/i);
    assert.match(AASLD_HCV_GUIDELINES.mandateEn, />95–98%/i);
    assert.strictEqual(AASLD_HCV_GUIDELINES.diagnosticCascade.length, 4);

    const step3 = AASLD_HCV_GUIDELINES.diagnosticCascade.find(s => s.step === 3);
    assert.ok(step3);
    assert.match(step3.detailEn, /HBsAg/i);
    assert.match(step3.detailEn, /reactivation/i);
  });

  test('HCV_DAA_REGIMENS details Mavyret and Epclusa pan-genotypic regimens with MOUD safety', () => {
    const { HCV_DAA_REGIMENS } = viralModule;
    assert.ok(Array.isArray(HCV_DAA_REGIMENS));
    assert.strictEqual(HCV_DAA_REGIMENS.length, 2);

    const mavyret = HCV_DAA_REGIMENS.find(r => r.regimenId === 'mavyret');
    assert.ok(mavyret);
    assert.match(mavyret.durationEn, /8 Weeks/i);
    assert.match(mavyret.dosingEn, /WITH FOOD/i);
    assert.strictEqual(mavyret.moudSafe, true);

    const epclusa = HCV_DAA_REGIMENS.find(r => r.regimenId === 'epclusa');
    assert.ok(epclusa);
    assert.match(epclusa.durationEn, /12 Weeks/i);
    assert.match(epclusa.highlightsEn, /Proton-pump inhibitors|omeprazole/i);
    assert.strictEqual(epclusa.moudSafe, true);
  });

  test('FIB4_INTERPRETATION_STANDARDS exports formula, thresholds, and clinical meanings', () => {
    const { FIB4_INTERPRETATION_STANDARDS } = viralModule;
    assert.ok(FIB4_INTERPRETATION_STANDARDS);
    assert.match(FIB4_INTERPRETATION_STANDARDS.formulaEn, /AST/);
    assert.match(FIB4_INTERPRETATION_STANDARDS.formulaEn, /ALT/);
    assert.match(FIB4_INTERPRETATION_STANDARDS.formulaEn, /Platelet/);
    assert.strictEqual(FIB4_INTERPRETATION_STANDARDS.thresholds.length, 3);

    const high = FIB4_INTERPRETATION_STANDARDS.thresholds.find(t => t.level === 'high');
    assert.ok(high);
    assert.match(high.meaningEn, /Hepatocellular Carcinoma/i);
  });

  test('HIV_PREP_PEP_STANDARDS exports PrEP, 72-hour PEP emergency window, and equipment survival facts', () => {
    const { HIV_PREP_PEP_STANDARDS } = viralModule;
    assert.ok(HIV_PREP_PEP_STANDARDS);
    assert.match(HIV_PREP_PEP_STANDARDS.pepSummaryEn, /72 hours/i);
    assert.match(HIV_PREP_PEP_STANDARDS.pepSummaryEn, /28-day/i);
    assert.strictEqual(HIV_PREP_PEP_STANDARDS.reinfectionPoints.length, 3);

    const equip = HIV_PREP_PEP_STANDARDS.reinfectionPoints.find(p => p.topicEn.includes('Equipment'));
    assert.ok(equip);
    assert.match(equip.descEn, /3 to 6 weeks/i);
  });

  test('VIRAL_HEPATITIS_RED_FLAGS contains decompensated cirrhosis, HBV reactivation, and HIV PEP window', () => {
    const { VIRAL_HEPATITIS_RED_FLAGS } = viralModule;
    assert.ok(Array.isArray(VIRAL_HEPATITIS_RED_FLAGS));
    assert.strictEqual(VIRAL_HEPATITIS_RED_FLAGS.length, 3);

    const ids = VIRAL_HEPATITIS_RED_FLAGS.map(f => f.flagId);
    assert.ok(ids.includes('decompensated_cirrhosis'));
    assert.ok(ids.includes('hbv_reactivation'));
    assert.ok(ids.includes('hiv_pep_window'));
  });

  test('calculateFib4Score calculates deterministic scores and risk strata', () => {
    const { calculateFib4Score } = viralModule;

    // Standard low score (Age 40, AST 30, ALT 40, Platelets 250)
    // Score: (40 * 30) / (250 * sqrt(40)) = 1200 / (250 * 6.3245) = 1200 / 1581.1 = 0.76
    const low = calculateFib4Score(40, 30, 40, 250);
    assert.ok(low);
    assert.strictEqual(low.score, 0.76);
    assert.strictEqual(low.level, 'low');

    // High score indicating advanced fibrosis (Age 55, AST 120, ALT 60, Platelets 110)
    // Score: (55 * 120) / (110 * sqrt(60)) = 6600 / (110 * 7.7459) = 6600 / 852.05 = 7.75
    const high = calculateFib4Score(55, 120, 60, 110);
    assert.ok(high);
    assert.strictEqual(high.level, 'high');
    assert.ok(high.score > 3.25);

    // Indeterminate score (Age 50, AST 65, ALT 55, Platelets 180)
    // Score: (50 * 65) / (180 * sqrt(55)) = 3250 / (180 * 7.416) = 3250 / 1334.9 = 2.43
    const indet = calculateFib4Score(50, 65, 55, 180);
    assert.ok(indet);
    assert.strictEqual(indet.level, 'indeterminate');
    assert.strictEqual(indet.score, 2.43);

    // Handles age > 65 cutoff
    const elderlyLow = calculateFib4Score(70, 35, 45, 240);
    assert.strictEqual(elderlyLow.lowCutoff, 2.0);

    // Invalid inputs return null
    assert.strictEqual(calculateFib4Score(0, 30, 40, 200), null);
    assert.strictEqual(calculateFib4Score(40, 30, 0, 200), null);
  });

  test('evaluateViralHepRisks provides correct clinical steps across patient scenarios', () => {
    const { evaluateViralHepRisks } = viralModule;

    // Active RNA positive
    const rnaRes = evaluateViralHepRisks({ hcvRnaPositive: true });
    assert.strictEqual(rnaRes.nextStepId, 'initiate_daa');
    assert.match(rnaRes.recommendationEn, /Mavyret.*Epclusa/i);

    // Antibody positive without RNA
    const abRes = evaluateViralHepRisks({ hcvAbPositive: true, testedHcvRna: false });
    assert.strictEqual(abRes.nextStepId, 'reflex_rna');
    assert.match(abRes.recommendationEn, /PCR/i);

    // Known cirrhosis
    const cirrRes = evaluateViralHepRisks({ hasCirrhosis: true });
    assert.strictEqual(cirrRes.nextStepId, 'specialist_referral');
    assert.match(cirrRes.recommendationEn, /Hepatology/i);

    // Past injection without testing
    const injRes = evaluateViralHepRisks({ everInjected: true, testedHcvAb: false });
    assert.strictEqual(injRes.nextStepId, 'screen_ab');
  });

  test('evaluateViralEmergencyFlags detects emergencies accurately', () => {
    const { evaluateViralEmergencyFlags } = viralModule;

    const res = evaluateViralEmergencyFlags(['decompensated_cirrhosis']);
    assert.strictEqual(res.hasEmergency, true);
    assert.strictEqual(res.requiresImmediateCare, true);
    assert.strictEqual(res.flags.length, 1);

    const pepRes = evaluateViralEmergencyFlags(['hiv_pep_window']);
    assert.strictEqual(pepRes.hasEmergency, false);
    assert.strictEqual(pepRes.hasUrgent, true);
    assert.strictEqual(pepRes.requiresImmediateCare, true);
  });

  test('In-RAM state management provides deterministic reset and isolation', () => {
    const { getViralState, setViralState, resetViralState } = viralModule;

    setViralState({
      currentTab: 'fib4',
      age: '55',
      ast: '90',
      testedHcvRna: true
    });

    let state = getViralState();
    assert.strictEqual(state.currentTab, 'fib4');
    assert.strictEqual(state.age, '55');
    assert.strictEqual(state.ast, '90');

    resetViralState();
    state = getViralState();
    assert.strictEqual(state.currentTab, 'guidelines');
    assert.strictEqual(state.age, '42');
  });

  test('formatViralSummaryText outputs clean bilingual reports without PII', () => {
    const { formatViralSummaryText } = viralModule;

    const enText = formatViralSummaryText({
      age: '45',
      ast: '50',
      alt: '55',
      platelets: '220',
      hcvRnaPositive: true,
      selectedRedFlags: ['decompensated_cirrhosis']
    }, 'en');

    assert.match(enText, /HARBORPATH: VIRAL HEPATITIS/);
    assert.match(enText, /Zero device storage/);
    assert.match(enText, /FIB-4 Score/);
    assert.match(enText, /initiate_daa/);
    assert.match(enText, /Decompensated Cirrhosis/);

    const esText = formatViralSummaryText({
      age: '45',
      ast: '50',
      alt: '55',
      platelets: '220',
      hcvRnaPositive: true,
      selectedRedFlags: ['decompensated_cirrhosis']
    }, 'es');

    assert.match(esText, /HARBORPATH: RESUMEN CLÍNICO DE HEPATITIS VIRAL/);
    assert.match(esText, /100% en memoria RAM/);
    assert.match(esText, /Cirrosis Descompensada/);
  });

  test('viralHepatitisView mounts accessible DOM structure with tab navigation', () => {
    const { viralHepatitisView } = viralModule;
    const view = viralHepatitisView();

    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.className.includes('viral-hepatitis-view'));
    assert.ok(view.children.length >= 1);
  });

  test('Static security and privacy audit of viralHepatitis.js', () => {
    const filePath = path.resolve('public/js/views/viralHepatitis.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
