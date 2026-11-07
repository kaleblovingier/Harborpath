// test/ketamine-care.test.js
// HarborPath - Ketamine Harm Reduction, Dissociative Care & Uropathy Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  KETAMINE_PHARMACOLOGY_PROFILES,
  KETAMINE_UROPATHY_STAGES,
  KETAMINE_CLINICAL_DIFFERENTIALS,
  KETAMINE_HARM_REDUCTION_RULES,
  evaluateKetamineRisk,
  buildKetamineSbarText,
  getKetamineState,
  setKetamineState,
  resetKetamineState,
  subscribeKetamineState,
  ketamineCareView,
} from '../public/js/views/ketamineCare.js';

describe('Ketamine Harm Reduction & Uropathy Module (Wave 38)', () => {
  it('exports accurate pharmacology, cytotoxicity, and biliary spasm profiles', () => {
    // 1. Dissociative NMDA & Norketamine
    const nmda = KETAMINE_PHARMACOLOGY_PROFILES.dissociativeAction;
    assert.ok(nmda, 'Missing dissociativeAction profile');
    assert.ok(nmda.pharmacologyEn.includes('NMDA'));
    assert.ok(nmda.pharmacologyEn.includes('Norketamine'));
    assert.ok(nmda.clinicalSignificanceEn.includes('concentrate in the urinary bladder'));

    // 2. Urothelial Cytotoxicity
    const uro = KETAMINE_PHARMACOLOGY_PROFILES.urologicalCytotoxicity;
    assert.ok(uro, 'Missing urologicalCytotoxicity profile');
    assert.ok(uro.pharmacologyEn.includes('apoptosis'));
    assert.ok(uro.clinicalSignificanceEn.includes('glycosaminoglycan (GAG) layer'));
    assert.ok(uro.clinicalSignificanceEn.includes('transmural fibrosis'));

    // 3. Biliary Spasm (K-Cramps)
    const biliary = KETAMINE_PHARMACOLOGY_PROFILES.biliarySphincterSpasm;
    assert.ok(biliary, 'Missing biliarySphincterSpasm profile');
    assert.ok(biliary.pharmacologyEn.includes('Sphincter of Oddi'));
    assert.ok(biliary.clinicalSignificanceEn.includes('K-cramps'));
    assert.ok(biliary.clinicalSignificanceEn.includes('PARADOXICALLY WORSEN'));
  });

  it('classifies Ketamine-Induced Uropathy (KIU) across 4 clinical stages', () => {
    assert.strictEqual(KETAMINE_UROPATHY_STAGES.length, 4);

    // Stage 1: Irritative
    const stg1 = KETAMINE_UROPATHY_STAGES.find((s) => s.stageNum === 1);
    assert.ok(stg1);
    assert.strictEqual(stg1.severity, 'mild_caution');
    assert.ok(stg1.symptomsEn.some((s) => s.includes('15–20 times/day')));
    assert.ok(stg1.pathologyEn.includes('Fully reversible'));

    // Stage 2: Ulcerative
    const stg2 = KETAMINE_UROPATHY_STAGES.find((s) => s.stageNum === 2);
    assert.ok(stg2);
    assert.strictEqual(stg2.severity, 'moderate_warning');
    assert.ok(stg2.symptomsEn.some((s) => s.includes('razor blades')));
    assert.ok(stg2.symptomsEn.some((s) => s.includes('hematuria')));

    // Stage 3: Fibrotic Contracted Bladder
    const stg3 = KETAMINE_UROPATHY_STAGES.find((s) => s.stageNum === 3);
    assert.ok(stg3);
    assert.strictEqual(stg3.severity, 'severe_danger');
    assert.ok(stg3.symptomsEn.some((s) => s.includes('below 50–100 mL')));
    assert.ok(stg3.pathologyEn.includes('dense, non-compliant scar tissue'));

    // Stage 4: Obstructive Hydronephrosis
    const stg4 = KETAMINE_UROPATHY_STAGES.find((s) => s.stageNum === 4);
    assert.ok(stg4);
    assert.strictEqual(stg4.severity, 'critical_emergency');
    assert.ok(stg4.symptomsEn.some((s) => s.includes('flank/back pain')));
    assert.ok(stg4.pathologyEn.includes('nephrostomy tubes or ureteral stents'));
  });

  it('provides comprehensive clinical differentials for KIU vs UTI, K-Cramps, Post-Renal AKI, and Drowning', () => {
    // UTI Misdirection
    const uti = KETAMINE_CLINICAL_DIFFERENTIALS.kiuVsBacterialUti;
    assert.ok(uti);
    assert.strictEqual(uti.severity, 'high_priority');
    assert.ok(uti.mechanismEn.includes('sterile chemical inflammation'));
    assert.ok(uti.actionEn.includes('quantitative urine culture (will be sterile)'));

    // K-Cramps
    const cramps = KETAMINE_CLINICAL_DIFFERENTIALS.kCrampsBiliary;
    assert.ok(cramps);
    assert.strictEqual(cramps.severity, 'high_priority');
    assert.ok(cramps.mechanismEn.includes('Sphincter of Oddi'));
    assert.ok(cramps.actionEn.includes('Hyoscine butylbromide'));
    assert.ok(cramps.actionEn.includes('Avoid prescribing opioids'));

    // Post-Renal AKI
    const aki = KETAMINE_CLINICAL_DIFFERENTIALS.postRenalAki;
    assert.ok(aki);
    assert.strictEqual(aki.severity, 'critical_emergency');
    assert.ok(aki.actionEn.includes('nephrostomy tubes or double-J ureteral stents'));

    // K-Hole Trauma & Drowning
    const trauma = KETAMINE_CLINICAL_DIFFERENTIALS.kHoleTrauma;
    assert.ok(trauma);
    assert.strictEqual(trauma.severity, 'critical_emergency');
    assert.ok(trauma.actionEn.includes('bathtub, hot tub, swimming pool'));
  });

  it('specifies the 5 foundational harm reduction and bladder preservation directives', () => {
    assert.strictEqual(KETAMINE_HARM_REDUCTION_RULES.length, 5);

    // Rule 1: Cessation
    assert.strictEqual(KETAMINE_HARM_REDUCTION_RULES[0].ruleNum, 1);
    assert.ok(KETAMINE_HARM_REDUCTION_RULES[0].titleEn.includes('Complete & Permanent Cessation'));

    // Rule 2: EGCG
    assert.strictEqual(KETAMINE_HARM_REDUCTION_RULES[1].ruleNum, 2);
    assert.ok(KETAMINE_HARM_REDUCTION_RULES[1].titleEn.includes('EGCG (Green Tea Extract)'));
    assert.ok(KETAMINE_HARM_REDUCTION_RULES[1].detailEn.includes('400–800 mg'));

    // Rule 3: Hydration & Spitting
    assert.strictEqual(KETAMINE_HARM_REDUCTION_RULES[2].ruleNum, 3);
    assert.ok(KETAMINE_HARM_REDUCTION_RULES[2].titleEn.includes('Spitting the Post-Nasal Drip'));
    assert.ok(KETAMINE_HARM_REDUCTION_RULES[2].detailEn.includes('2 to 3 liters of water'));

    // Rule 4: Zero Water / Bathtubs
    assert.strictEqual(KETAMINE_HARM_REDUCTION_RULES[3].ruleNum, 4);
    assert.ok(KETAMINE_HARM_REDUCTION_RULES[3].titleEn.includes('NEVER Use Ketamine in Bathtubs'));

    // Rule 5: Red Flags
    assert.strictEqual(KETAMINE_HARM_REDUCTION_RULES[4].ruleNum, 5);
    assert.ok(KETAMINE_HARM_REDUCTION_RULES[4].titleEn.includes('Urological Red Flags'));
  });

  it('evaluates acute ketamine presentations across drowning, hydronephrosis, hematuria, K-cramps, and early uropathy', () => {
    // 1. Critical Drowning Hazard
    const drownEval = evaluateKetamineRisk({
      usingInBathtubOrNearWater: true,
      hasFlankPainDecreasedUrine: false,
      hasGrossHematuriaMucosalSloughing: false,
      hasSevereEpigastricKCramps: false,
      repeatedAntibioticsNegativeCultures: false,
      hasSevereUrinaryFrequency: false,
    });
    assert.strictEqual(drownEval.tier, 'emergency_drowning_hazard');
    assert.strictEqual(drownEval.isEmergency, true);
    assert.ok(drownEval.actionEn.includes('GET OUT OF THE WATER IMMEDIATELY'));

    // 2. Critical Hydronephrosis / AKI
    const hydroEval = evaluateKetamineRisk({
      usingInBathtubOrNearWater: false,
      hasFlankPainDecreasedUrine: true,
      hasGrossHematuriaMucosalSloughing: false,
      hasSevereEpigastricKCramps: false,
      repeatedAntibioticsNegativeCultures: false,
      hasSevereUrinaryFrequency: false,
    });
    assert.strictEqual(hydroEval.tier, 'emergency_hydronephrosis_renal');
    assert.strictEqual(hydroEval.isEmergency, true);
    assert.ok(hydroEval.actionEn.includes('Flank pain'));
    assert.ok(hydroEval.actionEn.includes('nephrostomy decompression'));

    // 3. Severe Ulcerative Hematuria
    const ulcerEval = evaluateKetamineRisk({
      usingInBathtubOrNearWater: false,
      hasFlankPainDecreasedUrine: false,
      hasGrossHematuriaMucosalSloughing: true,
      hasSevereEpigastricKCramps: false,
      repeatedAntibioticsNegativeCultures: false,
      hasSevereUrinaryFrequency: false,
    });
    assert.strictEqual(ulcerEval.tier, 'emergency_ulcerative_hematuria');
    assert.strictEqual(ulcerEval.isEmergency, true);
    assert.ok(ulcerEval.actionEn.includes('blood clots'));

    // 4. Acute K-Cramps
    const crampEval = evaluateKetamineRisk({
      usingInBathtubOrNearWater: false,
      hasFlankPainDecreasedUrine: false,
      hasGrossHematuriaMucosalSloughing: false,
      hasSevereEpigastricKCramps: true,
      repeatedAntibioticsNegativeCultures: false,
      hasSevereUrinaryFrequency: false,
    });
    assert.strictEqual(crampEval.tier, 'urgent_k_cramps');
    assert.strictEqual(crampEval.isEmergency, false);
    assert.ok(crampEval.actionEn.includes('Hyoscine butylbromide'));
    assert.ok(crampEval.actionEn.includes('DO NOT TAKE OPIOIDS'));

    // 5. Misdiagnosed UTI
    const utiEval = evaluateKetamineRisk({
      usingInBathtubOrNearWater: false,
      hasFlankPainDecreasedUrine: false,
      hasGrossHematuriaMucosalSloughing: false,
      hasSevereEpigastricKCramps: false,
      repeatedAntibioticsNegativeCultures: true,
      hasSevereUrinaryFrequency: false,
    });
    assert.strictEqual(utiEval.tier, 'urgent_kiu_misdiagnosis');
    assert.strictEqual(utiEval.isEmergency, false);
    assert.ok(utiEval.actionEn.includes('STOP REPEATED ANTIBIOTICS'));

    // 6. Early Irritative Uropathy
    const earlyEval = evaluateKetamineRisk({
      usingInBathtubOrNearWater: false,
      hasFlankPainDecreasedUrine: false,
      hasGrossHematuriaMucosalSloughing: false,
      hasSevereEpigastricKCramps: false,
      repeatedAntibioticsNegativeCultures: false,
      hasSevereUrinaryFrequency: true,
    });
    assert.strictEqual(earlyEval.tier, 'early_uropathy_irritative');
    assert.strictEqual(earlyEval.isEmergency, false);
    assert.ok(earlyEval.actionEn.includes('EGCG green tea extract'));

    // 7. Standard Harm Reduction
    const standardEval = evaluateKetamineRisk({
      usingInBathtubOrNearWater: false,
      hasFlankPainDecreasedUrine: false,
      hasGrossHematuriaMucosalSloughing: false,
      hasSevereEpigastricKCramps: false,
      repeatedAntibioticsNegativeCultures: false,
      hasSevereUrinaryFrequency: false,
    });
    assert.strictEqual(standardEval.tier, 'standard_ketamine_harm_reduction');
    assert.strictEqual(standardEval.isEmergency, false);
    assert.ok(standardEval.actionEn.includes('No acute emergency flags detected'));
  });

  it('generates structured zero-PII SBAR clinical handoff notes in English and Spanish', () => {
    const mockState = {
      usingInBathtubOrNearWater: false,
      hasFlankPainDecreasedUrine: true,
      hasGrossHematuriaMucosalSloughing: true,
      hasSevereEpigastricKCramps: false,
      repeatedAntibioticsNegativeCultures: true,
      hasSevereUrinaryFrequency: true,
    };
    const mockEval = evaluateKetamineRisk(mockState);

    const sbarEn = buildKetamineSbarText(mockState, mockEval, 'en');
    assert.ok(sbarEn.includes('KETAMINE CARE, UROPATHY ("K-BLADDER") & BILIARY COLIC SBAR NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / UROLOGICAL & CLINICAL FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & UROLOGY MANAGEMENT):'));
    assert.ok(sbarEn.includes('STAGE 4 KIU / HYDRONEPHROSIS ALERT'));
    assert.ok(sbarEn.includes('stat renal ultrasound to rule out bilateral obstructive hydronephrosis'));

    const sbarEs = buildKetamineSbarText(mockState, mockEval, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: EVALUACIÓN DE KETAMINA, UROPATÍA'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES UROLÓGICOS Y CLÍNICOS):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y MANEJO UROLÓGICO):'));
    assert.ok(sbarEs.includes('ALERTA DE HIDRONEFROSIS / UROPATÍA ESTADIO 4'));
    assert.ok(sbarEs.includes('ecografía renal urgente para descartar hidronefrosis'));
  });

  it('manages ephemeral in-RAM state without storage leakage', () => {
    resetKetamineState();
    let state = getKetamineState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.viewMode, 'community');
    assert.strictEqual(state.hasFlankPainDecreasedUrine, false);

    let notifyCount = 0;
    const unsub = subscribeKetamineState((newState) => {
      notifyCount++;
      assert.strictEqual(newState.hasFlankPainDecreasedUrine, true);
    });

    setKetamineState({ hasFlankPainDecreasedUrine: true, activeTab: 'uropathy' });
    assert.strictEqual(notifyCount, 1);
    assert.strictEqual(getKetamineState().hasFlankPainDecreasedUrine, true);
    assert.strictEqual(getKetamineState().activeTab, 'uropathy');

    unsub();
    setKetamineState({ activeTab: 'harmReduction' });
    assert.strictEqual(notifyCount, 1, 'Unsubscribed listener must not be called');

    resetKetamineState();
    assert.strictEqual(getKetamineState().hasFlankPainDecreasedUrine, false);
    assert.strictEqual(getKetamineState().activeTab, 'triage');
  });

  it('preserves zero-storage and zero inline-HTML privacy invariants in ketamineCare.js', () => {
    const code = fs.readFileSync('public/js/views/ketamineCare.js', 'utf8');
    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookies permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
