// test/vein-care.test.js
// HarborPath - Vascular Health, Vein Care, Arterial Puncture Triage & Injection Anatomy Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  INJECTION_ANATOMICAL_ZONES,
  VASCULAR_ACCESS_DIFFERENTIAL,
  VASCULAR_COMPLICATIONS,
  VEIN_PRESERVATION_RULES,
  evaluateVascularRisk,
  buildVeinSbarText,
  getVeinState,
  setVeinState,
  resetVeinState,
  subscribeVeinState,
  veinCareView,
} from '../public/js/views/veinCare.js';

describe('Vascular Health, Vein Care & Arterial Triage Module (Wave 36)', () => {
  it('exports comprehensive anatomical risk stratification zones across green, yellow, and red tiers', () => {
    // Green: Forearm
    const forearm = INJECTION_ANATOMICAL_ZONES.greenForearm;
    assert.ok(forearm, 'Missing greenForearm zone');
    assert.strictEqual(forearm.tier, 'safer');
    assert.ok(forearm.nameEn.includes('Forearm'));
    assert.ok(forearm.clinicalRationaleEn.includes('muscular fascial planes'));
    assert.ok(forearm.keyDirectivesEn.some((d) => d.includes('Release the tourniquet completely BEFORE')));

    // Yellow: Hands
    const hands = INJECTION_ANATOMICAL_ZONES.yellowHands;
    assert.ok(hands, 'Missing yellowHands zone');
    assert.strictEqual(hands.tier, 'caution');
    assert.ok(hands.nameEn.includes('Hands'));
    assert.ok(hands.clinicalRationaleEn.includes('fragile'));
    assert.ok(hands.keyDirectivesEn.some((d) => d.includes('underside of the wrist')));

    // Red: Neck
    const neck = INJECTION_ANATOMICAL_ZONES.redNeck;
    assert.ok(neck, 'Missing redNeck zone');
    assert.strictEqual(neck.tier, 'extreme_danger');
    assert.ok(neck.nameEn.includes('Neck'));
    assert.ok(neck.clinicalRationaleEn.includes('Carotid Artery'));
    assert.ok(neck.clinicalRationaleEn.includes('stroke'));

    // Red: Groin
    const groin = INJECTION_ANATOMICAL_ZONES.redGroin;
    assert.ok(groin, 'Missing redGroin zone');
    assert.strictEqual(groin.tier, 'extreme_danger');
    assert.ok(groin.nameEn.includes('Groin'));
    assert.ok(groin.clinicalRationaleEn.includes('Femoral Artery'));
    assert.ok(groin.clinicalRationaleEn.includes('pseudoaneurysm'));

    // Red: Legs/Feet
    const legs = INJECTION_ANATOMICAL_ZONES.redLegsFeet;
    assert.ok(legs, 'Missing redLegsFeet zone');
    assert.strictEqual(legs.tier, 'extreme_danger');
    assert.ok(legs.nameEn.includes('Legs'));
    assert.ok(legs.clinicalRationaleEn.includes('sluggish'));
    assert.ok(legs.clinicalRationaleEn.includes('stasis ulcers'));
  });

  it('differentiates venous access from critical arterial puncture emergency', () => {
    const venous = VASCULAR_ACCESS_DIFFERENTIAL.venous;
    assert.ok(venous);
    assert.ok(venous.colorEn.includes('Dark crimson red'));
    assert.ok(venous.sensationEn.includes('Painless'));

    const arterial = VASCULAR_ACCESS_DIFFERENTIAL.arterial;
    assert.ok(arterial);
    assert.ok(arterial.colorEn.includes('BRIGHT SCARLET RED'));
    assert.ok(arterial.colorEn.includes('pushes the syringe plunger back out'));
    assert.ok(arterial.sensationEn.includes('EXCRUCIATING, BURNING'));
    assert.ok(arterial.actionEn.includes('DO NOT INJECT'));
    assert.ok(arterial.actionEn.includes('AT LEAST 15 MINUTES'));
    assert.ok(arterial.actionEn.includes('NEVER APPLY A TOURNIQUET'));
  });

  it('classifies major vascular complications: DVT, pseudoaneurysm, compartment syndrome, and cotton fever', () => {
    const dvt = VASCULAR_COMPLICATIONS.dvt;
    assert.ok(dvt);
    assert.strictEqual(dvt.severity, 'emergency_hospital');
    assert.ok(dvt.hazardEn.includes('PULMONARY EMBOLISM'));
    assert.ok(dvt.interventionEn.includes('NEVER massage'));

    const pseudo = VASCULAR_COMPLICATIONS.pseudoaneurysm;
    assert.ok(pseudo);
    assert.strictEqual(pseudo.severity, 'emergency_hospital');
    assert.ok(pseudo.signsEn.includes('PALPABLE PULSATION'));
    assert.ok(pseudo.hazardEn.includes('misdiagnosed as an abscess'));
    assert.ok(pseudo.interventionEn.includes('lancing is strictly prohibited'));

    const cs = VASCULAR_COMPLICATIONS.compartmentSyndrome;
    assert.ok(cs);
    assert.strictEqual(cs.severity, 'emergency_hospital');
    assert.ok(cs.signsEn.includes('The 6 Ps'));
    assert.ok(cs.signsEn.includes('wooden'));
    assert.ok(cs.interventionEn.includes('fasciotomy'));

    const cotton = VASCULAR_COMPLICATIONS.cottonFever;
    assert.ok(cotton);
    assert.strictEqual(cotton.severity, 'supportive_monitoring');
    assert.ok(cotton.nameEn.includes('Pantoea'));
    assert.ok(cotton.signsEn.includes('shaking chills'));
    assert.ok(cotton.interventionEn.includes('persist beyond 24 hours, it is NOT cotton fever'));
  });

  it('specifies the 5 foundational vein preservation and safer injection biomechanical rules', () => {
    assert.strictEqual(VEIN_PRESERVATION_RULES.length, 5);

    // Rule 1: Tourniquet release
    assert.strictEqual(VEIN_PRESERVATION_RULES[0].ruleNum, 1);
    assert.ok(VEIN_PRESERVATION_RULES[0].titleEn.includes('Release the Tourniquet BEFORE Depressing the Plunger'));
    assert.ok(VEIN_PRESERVATION_RULES[0].detailEn.includes('venous back-pressure'));

    // Rule 2: Bevel up
    assert.strictEqual(VEIN_PRESERVATION_RULES[1].ruleNum, 2);
    assert.ok(VEIN_PRESERVATION_RULES[1].titleEn.includes('Bevel Up'));
    assert.ok(VEIN_PRESERVATION_RULES[1].detailEn.includes('15° to 45°'));

    // Rule 3: No booting
    assert.strictEqual(VEIN_PRESERVATION_RULES[2].ruleNum, 3);
    assert.ok(VEIN_PRESERVATION_RULES[2].titleEn.includes('Never "Boot"'));
    assert.ok(VEIN_PRESERVATION_RULES[2].detailEn.includes('platelet activation'));

    // Rule 4: Single use
    assert.strictEqual(VEIN_PRESERVATION_RULES[3].ruleNum, 4);
    assert.ok(VEIN_PRESERVATION_RULES[3].titleEn.includes('Single-Use'));
    assert.ok(VEIN_PRESERVATION_RULES[3].detailEn.includes('fishhook barbs'));

    // Rule 5: 0.22 micron filters
    assert.strictEqual(VEIN_PRESERVATION_RULES[4].ruleNum, 5);
    assert.ok(VEIN_PRESERVATION_RULES[4].titleEn.includes('0.22-Micron Wheel Filters'));
    assert.ok(VEIN_PRESERVATION_RULES[4].detailEn.includes('bacteria, fungal spores, and insoluble pill binders'));
  });

  it('evaluates vascular risk conditions across arterial, surgical, medical, and safe practice tiers', () => {
    // 1. Critical Arterial Puncture
    const arterialEval = evaluateVascularRisk({
      hasBrightRedFrothyBlood: true,
      hasSevereBurningPain: true,
      hasUnilateralLegSwelling: false,
      hasPulsatileMassGroinOrElbow: false,
      hasPainOutOfProportionWoodenMuscle: false,
      hasFeverOver24Hours: false,
      injectingInNeckOrGroin: false,
    });
    assert.strictEqual(arterialEval.tier, 'emergency_arterial');
    assert.strictEqual(arterialEval.isEmergency, true);
    assert.ok(arterialEval.actionEn.includes('DO NOT INJECT'));
    assert.ok(arterialEval.actionEn.includes('AT LEAST 15 MINUTES'));

    // 2. Surgical Pseudoaneurysm
    const pseudoEval = evaluateVascularRisk({
      hasBrightRedFrothyBlood: false,
      hasSevereBurningPain: false,
      hasUnilateralLegSwelling: false,
      hasPulsatileMassGroinOrElbow: true,
      hasPainOutOfProportionWoodenMuscle: false,
      hasFeverOver24Hours: false,
      injectingInNeckOrGroin: false,
    });
    assert.strictEqual(pseudoEval.tier, 'emergency_surgical');
    assert.strictEqual(pseudoEval.isEmergency, true);
    assert.ok(pseudoEval.actionEn.includes('DO NOT DRAIN, CUT, OR LANCE THIS LUMP'));

    // 3. Surgical Compartment Syndrome
    const csEval = evaluateVascularRisk({
      hasBrightRedFrothyBlood: false,
      hasSevereBurningPain: false,
      hasUnilateralLegSwelling: false,
      hasPulsatileMassGroinOrElbow: false,
      hasPainOutOfProportionWoodenMuscle: true,
      hasFeverOver24Hours: false,
      injectingInNeckOrGroin: false,
    });
    assert.strictEqual(csEval.tier, 'emergency_surgical');
    assert.strictEqual(csEval.isEmergency, true);
    assert.ok(csEval.actionEn.includes('Compartment Syndrome'));
    assert.ok(csEval.actionEn.includes('6 hours'));

    // 4. Medical DVT
    const dvtEval = evaluateVascularRisk({
      hasBrightRedFrothyBlood: false,
      hasSevereBurningPain: false,
      hasUnilateralLegSwelling: true,
      hasPulsatileMassGroinOrElbow: false,
      hasPainOutOfProportionWoodenMuscle: false,
      hasFeverOver24Hours: false,
      injectingInNeckOrGroin: false,
    });
    assert.strictEqual(dvtEval.tier, 'emergency_medical');
    assert.strictEqual(dvtEval.isEmergency, true);
    assert.ok(dvtEval.actionEn.includes('DO NOT MASSAGE OR RUB'));

    // 5. Medical Sepsis / Endocarditis (>24h fever)
    const sepsisEval = evaluateVascularRisk({
      hasBrightRedFrothyBlood: false,
      hasSevereBurningPain: false,
      hasUnilateralLegSwelling: false,
      hasPulsatileMassGroinOrElbow: false,
      hasPainOutOfProportionWoodenMuscle: false,
      hasFeverOver24Hours: true,
      injectingInNeckOrGroin: false,
    });
    assert.strictEqual(sepsisEval.tier, 'emergency_medical');
    assert.strictEqual(sepsisEval.isEmergency, true);
    assert.ok(sepsisEval.actionEn.includes('NOT benign cotton fever'));

    // 6. High Hazard Anatomy (Neck / Groin)
    const neckEval = evaluateVascularRisk({
      hasBrightRedFrothyBlood: false,
      hasSevereBurningPain: false,
      hasUnilateralLegSwelling: false,
      hasPulsatileMassGroinOrElbow: false,
      hasPainOutOfProportionWoodenMuscle: false,
      hasFeverOver24Hours: false,
      injectingInNeckOrGroin: true,
    });
    assert.strictEqual(neckEval.tier, 'high_hazard_anatomy');
    assert.strictEqual(neckEval.isEmergency, false);
    assert.ok(neckEval.actionEn.includes('safer alternative routes'));

    // 7. Standard Safe Practice
    const standardEval = evaluateVascularRisk({
      hasBrightRedFrothyBlood: false,
      hasSevereBurningPain: false,
      hasUnilateralLegSwelling: false,
      hasPulsatileMassGroinOrElbow: false,
      hasPainOutOfProportionWoodenMuscle: false,
      hasFeverOver24Hours: false,
      injectingInNeckOrGroin: false,
    });
    assert.strictEqual(standardEval.tier, 'safe_practice');
    assert.strictEqual(standardEval.isEmergency, false);
    assert.ok(standardEval.actionEn.includes('Veins in the forearm'));
  });

  it('builds zero-PII SBAR handoff notes in English and Spanish', () => {
    const mockState = {
      selectedZone: 'greenForearm',
      hasBrightRedFrothyBlood: true,
      hasSevereBurningPain: true,
      hasUnilateralLegSwelling: false,
      hasPulsatileMassGroinOrElbow: false,
      hasPainOutOfProportionWoodenMuscle: false,
      hasFeverOver24Hours: false,
      injectingInNeckOrGroin: false,
    };
    const mockEval = evaluateVascularRisk(mockState);

    const sbarEn = buildVeinSbarText(mockState, mockEval, 'en');
    assert.ok(sbarEn.includes('VASCULAR HEALTH, VEIN CARE & COMPLICATION TRIAGE SBAR NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / VASCULAR RISK FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & VASCULAR MANAGEMENT):'));
    assert.ok(sbarEn.includes('CRITICAL ARTERIAL PUNCTURE HAZARD'));
    assert.ok(sbarEn.includes('Direct continuous manual compression >= 15 min'));

    const sbarEs = buildVeinSbarText(mockState, mockEval, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: EVALUACIÓN VASCULAR'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES VASCULARES):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y MANEJO CLÍNICO):'));
    assert.ok(sbarEs.includes('ALERTA DE PUNCIÓN ARTERIAL'));
    assert.ok(sbarEs.includes('Compresión manual directa ininterrumpida >= 15 min'));
  });

  it('manages ephemeral in-RAM state without storage leakage', () => {
    resetVeinState();
    let state = getVeinState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.viewMode, 'community');
    assert.strictEqual(state.hasBrightRedFrothyBlood, false);

    let notifyCount = 0;
    const unsub = subscribeVeinState((newState) => {
      notifyCount++;
      assert.strictEqual(newState.hasBrightRedFrothyBlood, true);
    });

    setVeinState({ hasBrightRedFrothyBlood: true, activeTab: 'anatomy' });
    assert.strictEqual(notifyCount, 1);
    assert.strictEqual(getVeinState().hasBrightRedFrothyBlood, true);
    assert.strictEqual(getVeinState().activeTab, 'anatomy');

    unsub();
    setVeinState({ activeTab: 'technique' });
    assert.strictEqual(notifyCount, 1, 'Unsubscribed listener must not be called');

    resetVeinState();
    assert.strictEqual(getVeinState().hasBrightRedFrothyBlood, false);
    assert.strictEqual(getVeinState().activeTab, 'triage');
  });

  it('preserves zero-storage and zero inline-HTML privacy invariants in veinCare.js', () => {
    const code = fs.readFileSync('public/js/views/veinCare.js', 'utf8');
    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookies permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
