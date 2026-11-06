// test/renal-care.test.js
// HarborPath - Renal Health, Rhabdomyolysis, AKI & MOUD in Dialysis Navigator Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  RHABDOMYOLYSIS_STANDARDS,
  COMPARTMENT_SYNDROME_STANDARDS,
  KDIGO_AKI_STAGES,
  RENAL_MOUD_PHARMACOKINETICS,
  RENAL_HARM_REDUCTION_RULES,
  evaluateRenalRisk,
  buildRenalSbarText,
  getRenalState,
  setRenalState,
  resetRenalState,
  subscribeRenalState,
  renalCareView,
} from '../public/js/views/renalCare.js';

describe('Renal Health, Rhabdomyolysis & MOUD Dialysis Navigator Module (Wave 42)', () => {
  it('exports verified rhabdomyolysis pathophysiology, ATN mechanisms, and hyperkalemia protocols', () => {
    assert.ok(RHABDOMYOLYSIS_STANDARDS.pathophysiologyEn.includes('down time'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.pathophysiologyEn.includes('opioid overdose'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.nephrotoxicityEn.includes('myoglobin'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.nephrotoxicityEn.includes('Acute Tubular Necrosis'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.triadEn.includes('cola-colored'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.triadEn.includes('pseudoperoxidase'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.ckCutoffsEn.includes('5,000 U/L'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.hyperkalemiaEmergencyEn.includes('Calcium Gluconate'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.hyperkalemiaEmergencyEn.includes('Insulin'));
    assert.ok(RHABDOMYOLYSIS_STANDARDS.fluidProtocolEn.includes('200–300 mL/hour'));
  });

  it('exports compartment syndrome standards, the 6 Ps, and fasciotomy delta pressure threshold', () => {
    assert.ok(Array.isArray(COMPARTMENT_SYNDROME_STANDARDS.sixPsEn));
    assert.strictEqual(COMPARTMENT_SYNDROME_STANDARDS.sixPsEn.length, 6);

    const passive = COMPARTMENT_SYNDROME_STANDARDS.sixPsEn.find((p) => p.includes('Passive Stretch'));
    assert.ok(passive, 'Missing passive stretch');
    assert.ok(passive.includes('EARLIEST & MOST SENSITIVE'));

    assert.ok(COMPARTMENT_SYNDROME_STANDARDS.fasciotomyThresholdEn.includes('Delta Pressure'));
    assert.ok(COMPARTMENT_SYNDROME_STANDARDS.fasciotomyThresholdEn.includes('<= 30 mmHg'));
  });

  it('classifies Acute Kidney Injury across KDIGO Stages 1–3', () => {
    assert.strictEqual(KDIGO_AKI_STAGES.length, 3);

    // Stage 1
    const s1 = KDIGO_AKI_STAGES.find((s) => s.stage === 1);
    assert.ok(s1);
    assert.ok(s1.creatinineEn.includes('1.5–1.9 times'));
    assert.ok(s1.managementEn.includes('NSAIDs'));

    // Stage 2
    const s2 = KDIGO_AKI_STAGES.find((s) => s.stage === 2);
    assert.ok(s2);
    assert.ok(s2.creatinineEn.includes('2.0–2.9 times'));

    // Stage 3
    const s3 = KDIGO_AKI_STAGES.find((s) => s.stage === 3);
    assert.ok(s3);
    assert.ok(s3.creatinineEn.includes('>= 3.0 times'));
    assert.ok(s3.creatinineEn.includes('4.0 mg/dL'));
    assert.ok(s3.managementEn.includes('AEIOU'));
  });

  it('exports MOUD pharmacokinetics in renal disease and dialysis with opioid contraindications', () => {
    // 1. Buprenorphine
    const bup = RENAL_MOUD_PHARMACOKINETICS.buprenorphine;
    assert.ok(bup);
    assert.ok(bup.pharmacokineticsEn.includes('70–80%'));
    assert.ok(bup.pharmacokineticsEn.includes('NOT dialyzable'));
    assert.ok(bup.clinicalDirectivesEn.includes('No dosage adjustment is required'));

    // 2. Methadone
    const meth = RENAL_MOUD_PHARMACOKINETICS.methadone;
    assert.ok(meth);
    assert.ok(meth.pharmacokineticsEn.includes('NOT dialyzable'));
    assert.ok(meth.clinicalDirectivesEn.includes('QTc prolongation'));

    // 3. Opioid Toxicity Warnings
    const warn = RENAL_MOUD_PHARMACOKINETICS.opioidToxicityWarnings;
    assert.ok(warn.morphineEn.includes('M6G'));
    assert.ok(warn.morphineEn.includes('M3G'));
    assert.ok(warn.morphineEn.includes('respiratory depression'));
    assert.ok(warn.meperidineEn.includes('normeperidine'));
    assert.ok(warn.meperidineEn.includes('STRICTLY CONTRAINDICATED'));
    assert.ok(warn.nsaidsNephrotoxicityEn.includes('afferent glomerular arterioles'));
  });

  it('exports 6 field harm reduction rules for renal preservation', () => {
    assert.strictEqual(RENAL_HARM_REDUCTION_RULES.length, 6);

    const r1 = RENAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 1);
    assert.ok(r1.titleEn.includes('Cola-Colored Urine'));

    const r2 = RENAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 2);
    assert.ok(r2.titleEn.includes('Aggressive Hydration'));

    const r3 = RENAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 3);
    assert.ok(r3.titleEn.includes('Hyperkalemia ECG Changes'));

    const r4 = RENAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 4);
    assert.ok(r4.titleEn.includes('Passive Stretch is the Earliest Flag'));

    const r5 = RENAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 5);
    assert.ok(r5.titleEn.includes('Buprenorphine is Safe in Kidney Failure'));

    const r6 = RENAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 6);
    assert.ok(r6.titleEn.includes('Strict NSAID Prohibition'));
  });

  it('evaluates renal risk scenarios accurately across all clinical tiers', () => {
    // 1. Hyperkalemic Cardiac Emergency
    const resK = evaluateRenalRisk({
      hasHyperkalemiaEcgChanges: true,
      hasTenseCompartmentPassivePain: false,
      hasColaColoredUrineDownTime: false,
      hasSevereOliguriaAnuria: false,
      isTakingNsaidsOrMorphine: false,
      isHemodialysisPatient: false,
    });
    assert.strictEqual(resK.tier, 'emergency_hyperkalemic_cardiac');
    assert.strictEqual(resK.isEmergency, true);
    assert.ok(resK.actionEn.includes('Calcium Gluconate'));

    // 2. Compartment Syndrome Emergency
    const resCs = evaluateRenalRisk({
      hasHyperkalemiaEcgChanges: false,
      hasTenseCompartmentPassivePain: true,
      hasColaColoredUrineDownTime: false,
      hasSevereOliguriaAnuria: false,
      isTakingNsaidsOrMorphine: false,
      isHemodialysisPatient: false,
    });
    assert.strictEqual(resCs.tier, 'emergency_compartment_syndrome');
    assert.strictEqual(resCs.isEmergency, true);
    assert.ok(resCs.actionEn.includes('fasciotomy'));

    // 3. Acute Rhabdomyolysis AKI
    const resRhabdo = evaluateRenalRisk({
      hasHyperkalemiaEcgChanges: false,
      hasTenseCompartmentPassivePain: false,
      hasColaColoredUrineDownTime: true,
      hasSevereOliguriaAnuria: false,
      isTakingNsaidsOrMorphine: false,
      isHemodialysisPatient: false,
    });
    assert.strictEqual(resRhabdo.tier, 'urgent_rhabdomyolysis_aki');
    assert.strictEqual(resRhabdo.isEmergency, true);
    assert.ok(resRhabdo.actionEn.includes('cola-colored'));

    // 4. Severe Oliguria / Anuria
    const resAnuria = evaluateRenalRisk({
      hasHyperkalemiaEcgChanges: false,
      hasTenseCompartmentPassivePain: false,
      hasColaColoredUrineDownTime: false,
      hasSevereOliguriaAnuria: true,
      isTakingNsaidsOrMorphine: false,
      isHemodialysisPatient: false,
    });
    assert.strictEqual(resAnuria.tier, 'urgent_oliguria_kdigo3');
    assert.strictEqual(resAnuria.isEmergency, true);
    assert.ok(resAnuria.actionEn.includes('AEIOU'));

    // 5. Contraindicated NSAIDs / Morphine
    const resContra = evaluateRenalRisk({
      hasHyperkalemiaEcgChanges: false,
      hasTenseCompartmentPassivePain: false,
      hasColaColoredUrineDownTime: false,
      hasSevereOliguriaAnuria: false,
      isTakingNsaidsOrMorphine: true,
      isHemodialysisPatient: false,
    });
    assert.strictEqual(resContra.tier, 'caution_nephrotoxic_contraindication');
    assert.strictEqual(resContra.isEmergency, false);
    assert.ok(resContra.actionEn.includes('NSAIDs'));

    // 6. Hemodialysis Patient MOUD
    const resHd = evaluateRenalRisk({
      hasHyperkalemiaEcgChanges: false,
      hasTenseCompartmentPassivePain: false,
      hasColaColoredUrineDownTime: false,
      hasSevereOliguriaAnuria: false,
      isTakingNsaidsOrMorphine: false,
      isHemodialysisPatient: true,
    });
    assert.strictEqual(resHd.tier, 'dialysis_moud_guidance');
    assert.strictEqual(resHd.isEmergency, false);
    assert.ok(resHd.actionEn.includes('Buprenorphine'));

    // 7. Standard Prevention
    const resStd = evaluateRenalRisk({
      hasHyperkalemiaEcgChanges: false,
      hasTenseCompartmentPassivePain: false,
      hasColaColoredUrineDownTime: false,
      hasSevereOliguriaAnuria: false,
      isTakingNsaidsOrMorphine: false,
      isHemodialysisPatient: false,
    });
    assert.strictEqual(resStd.tier, 'standard_renal_prevention');
    assert.strictEqual(resStd.isEmergency, false);
    assert.ok(resStd.actionEn.includes('hydration'));
  });

  it('generates zero-PII SBAR clinical handoff note in English and Spanish', () => {
    const state = {
      hasHyperkalemiaEcgChanges: true,
      hasTenseCompartmentPassivePain: false,
      hasColaColoredUrineDownTime: true,
      hasSevereOliguriaAnuria: true,
      isTakingNsaidsOrMorphine: true,
      isHemodialysisPatient: false,
    };
    const evalResult = evaluateRenalRisk(state);

    // English SBAR
    const sbarEn = buildRenalSbarText(state, evalResult, 'en');
    assert.ok(sbarEn.includes('RENAL HEALTH, RHABDOMYOLYSIS & MOUD CLINICAL SBAR HANDOFF NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / RENAL & PHARMACOLOGIC RISK FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & NEPHROLOGY MANAGEMENT):'));
    assert.ok(sbarEn.includes('YES (CRITICAL CARDIAC ARREST RISK)'));
    assert.ok(sbarEn.includes('IV Calcium Gluconate'));
    assert.ok(!sbarEn.includes('patient name'));

    // Spanish SBAR
    const sbarEs = buildRenalSbarText(state, evalResult, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: EVALUACIÓN RENAL Y RABDOMIÓLISIS (CERO PII)'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES DE RIESGO RENALES Y FARMACOLÓGICOS):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y GESTIÓN NEFROLÓGICA):'));
    assert.ok(sbarEs.includes('SÍ (EMERGENCIA CARDÍACA: RIESGO DE PARADA)'));
    assert.ok(sbarEs.includes('Gluconato cálcico IV'));
    assert.ok(!sbarEs.includes('nombre del paciente'));
  });

  it('handles in-RAM state management, subscriptions, and state reset correctly', () => {
    resetRenalState();
    let state = getRenalState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.viewMode, 'community');
    assert.strictEqual(state.hasColaColoredUrineDownTime, false);

    let notifyCount = 0;
    const unsub = subscribeRenalState((s) => {
      notifyCount++;
      assert.ok(s);
    });

    setRenalState({ activeTab: 'rhabdo', hasColaColoredUrineDownTime: true });
    state = getRenalState();
    assert.strictEqual(state.activeTab, 'rhabdo');
    assert.strictEqual(state.hasColaColoredUrineDownTime, true);
    assert.strictEqual(notifyCount, 1);

    resetRenalState();
    state = getRenalState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.hasColaColoredUrineDownTime, false);
    assert.strictEqual(notifyCount, 2);

    unsub();
    setRenalState({ activeTab: 'kdigo' });
    assert.strictEqual(notifyCount, 2);
    resetRenalState();
  });

  it('renders renalCareView DOM structure without errors', () => {
    class MockElement {
      constructor(tag) {
        this.tagName = (tag || 'DIV').toUpperCase();
        this.children = [];
        this.attributes = {};
        this.eventListeners = {};
        this.classList = {
          classes: new Set(),
          add: (...cls) => cls.forEach((c) => this.classList.classes.add(c)),
          contains: (c) => this.classList.classes.has(c),
        };
        this.className = '';
      }
      setAttribute(k, v) { this.attributes[k] = v; }
      getAttribute(k) { return this.attributes[k]; }
      hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k); }
      appendChild(child) {
        if (child) this.children.push(child);
        return child;
      }
      append(...children) {
        children.forEach((c) => this.appendChild(c));
      }
      addEventListener(event, fn) {
        this.eventListeners[event] = this.eventListeners[event] || [];
        this.eventListeners[event].push(fn);
      }
      click() {
        if (this.onclick) this.onclick({ preventDefault: () => {} });
      }
    }

    globalThis.Node = MockElement;
    globalThis.document = {
      createElement: (tag) => new MockElement(tag),
      createElementNS: (ns, tag) => new MockElement(tag),
      createTextNode: (txt) => ({ nodeType: 3, textContent: txt }),
    };

    resetRenalState();
    const el = renalCareView();
    assert.ok(el);
    assert.strictEqual(el.tagName, 'DIV');
    assert.strictEqual(el.className, 'renal-care-view');

    // Test tab switches
    setRenalState({ activeTab: 'rhabdo' });
    assert.strictEqual(getRenalState().activeTab, 'rhabdo');

    setRenalState({ activeTab: 'compartment' });
    assert.strictEqual(getRenalState().activeTab, 'compartment');

    setRenalState({ activeTab: 'kdigo' });
    assert.strictEqual(getRenalState().activeTab, 'kdigo');

    setRenalState({ activeTab: 'moud' });
    assert.strictEqual(getRenalState().activeTab, 'moud');

    setRenalState({ activeTab: 'harmReduction' });
    assert.strictEqual(getRenalState().activeTab, 'harmReduction');

    resetRenalState();
  });

  it('strictly adheres to zero-storage privacy and zero innerHTML security invariants', () => {
    const fileContent = fs.readFileSync('public/js/views/renalCare.js', 'utf8');
    assert.ok(!fileContent.includes('localStorage'), 'Must not access localStorage');
    assert.ok(!fileContent.includes('sessionStorage'), 'Must not access sessionStorage');
    assert.ok(!fileContent.includes('document.cookie'), 'Must not access cookies');
    assert.ok(!fileContent.includes('innerHTML'), 'Must not use innerHTML');
    assert.ok(!fileContent.includes('outerHTML'), 'Must not use outerHTML');
  });
});
