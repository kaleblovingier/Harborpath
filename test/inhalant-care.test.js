// test/inhalant-care.test.js
// HarborPath - Inhalants, Solvents & Nitrous Oxide Safety Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  INHALANT_COMPOUND_PROFILES,
  INHALANT_CLINICAL_DIFFERENTIALS,
  INHALANT_HARM_REDUCTION_RULES,
  evaluateInhalantRisk,
  buildInhalantSbarText,
  getInhalantState,
  setInhalantState,
  resetInhalantState,
  subscribeInhalantState,
  inhalantCareView,
} from '../public/js/views/inhalantCare.js';

describe('Inhalants, Solvents & Nitrous Oxide Module (Wave 37)', () => {
  it('exports accurate pharmacology, kinetics, and diagnostic traps for N₂O, hydrocarbons, and alkyl nitrites', () => {
    // 1. Nitrous Oxide
    const n2o = INHALANT_COMPOUND_PROFILES.nitrousOxide;
    assert.ok(n2o, 'Missing nitrousOxide profile');
    assert.ok(n2o.pharmacologyEn.includes('Co+ to inactive Co3+'));
    assert.ok(n2o.pharmacologyEn.includes('Methionine Synthase'));
    assert.ok(n2o.acuteHazardsEn.includes('Subacute Combined Degeneration'));
    assert.ok(n2o.diagnosticParadoxEn.includes('CRITICAL LAB TRAP'));
    assert.ok(n2o.diagnosticParadoxEn.includes('Methylmalonic Acid (MMA)'));
    assert.ok(n2o.antidoteEn.includes('Hydroxocobalamin (1,000 mcg IM'));

    // 2. Volatile Hydrocarbons
    const hydro = INHALANT_COMPOUND_PROFILES.volatileHydrocarbons;
    assert.ok(hydro, 'Missing volatileHydrocarbons profile');
    assert.ok(hydro.pharmacologyEn.includes('catecholamines'));
    assert.ok(hydro.acuteHazardsEn.includes('SUDDEN SNIFFING DEATH SYNDROME'));
    assert.ok(hydro.acuteHazardsEn.includes('Distal Renal Tubular Acidosis'));
    assert.ok(hydro.diagnosticParadoxEn.includes('Epinephrine and isoproterenol are RELATIVELY CONTRAINDICATED'));

    // 3. Alkyl Nitrites (Poppers)
    const nitrites = INHALANT_COMPOUND_PROFILES.alkylNitrites;
    assert.ok(nitrites, 'Missing alkylNitrites profile');
    assert.ok(nitrites.pharmacologyEn.includes('Methemoglobin'));
    assert.ok(nitrites.acuteHazardsEn.includes('chocolate brown'));
    assert.ok(nitrites.acuteHazardsEn.includes('POPPER MACULOPATHY'));
    assert.ok(nitrites.acuteHazardsEn.includes('LETHAL PDE-5 SYNERGY'));
    assert.ok(nitrites.diagnosticParadoxEn.includes('plateau of approximately 85%'));
    assert.ok(nitrites.antidoteEn.includes('Methylene Blue (1 to 2 mg/kg IV'));
    assert.ok(nitrites.antidoteEn.includes('G6PD'));
  });

  it('classifies life-threatening clinical differentials: SCD, SSDS, MetHb, Distal RTA, and PDE-5 Shock', () => {
    // SCD
    const scd = INHALANT_CLINICAL_DIFFERENTIALS.scd;
    assert.ok(scd);
    assert.strictEqual(scd.severity, 'urgent_neurology');
    assert.ok(scd.classicTriadEn.includes('glove-and-stocking'));
    assert.ok(scd.classicTriadEn.includes('Lhermitte’s sign'));
    assert.ok(scd.actionEn.includes('Hydroxocobalamin 1,000 mcg IM'));

    // SSDS
    const ssds = INHALANT_CLINICAL_DIFFERENTIALS.ssds;
    assert.ok(ssds);
    assert.strictEqual(ssds.severity, 'emergency_911');
    assert.ok(ssds.classicTriadEn.includes('Ventricular Fibrillation'));
    assert.ok(ssds.actionEn.includes('NEVER chase, yell at, startle'));

    // Methemoglobinemia
    const metHb = INHALANT_CLINICAL_DIFFERENTIALS.methemoglobinemia;
    assert.ok(metHb);
    assert.strictEqual(metHb.severity, 'emergency_hospital');
    assert.ok(metHb.classicTriadEn.includes('dark chocolate brown'));
    assert.ok(metHb.actionEn.includes('Methylene Blue 1–2 mg/kg IV'));

    // Toluene Distal RTA
    const rta = INHALANT_CLINICAL_DIFFERENTIALS.distalRta;
    assert.ok(rta);
    assert.strictEqual(rta.severity, 'emergency_hospital');
    assert.ok(rta.classicTriadEn.includes('flaccid quadriparesis'));
    assert.ok(rta.classicTriadEn.includes('K⁺ often < 2.0 mEq/L'));

    // Popper Maculopathy
    const macula = INHALANT_CLINICAL_DIFFERENTIALS.popperMaculopathy;
    assert.ok(macula);
    assert.strictEqual(macula.severity, 'urgent_ophthalmology');
    assert.ok(macula.classicTriadEn.includes('scotoma'));
    assert.ok(macula.underlyingPathologyEn.includes('photoreceptor'));

    // PDE-5 Synergy Shock
    const pde5 = INHALANT_CLINICAL_DIFFERENTIALS.pde5Synergy;
    assert.ok(pde5);
    assert.strictEqual(pde5.severity, 'emergency_911');
    assert.ok(pde5.underlyingPathologyEn.includes('cGMP'));
    assert.ok(pde5.actionEn.includes('Trendelenburg'));
  });

  it('articulates evidence-based harm reduction directives: balloons, zero masks, zero PDE-5, and IM B12', () => {
    assert.strictEqual(INHALANT_HARM_REDUCTION_RULES.length, 5);

    // Rule 1: Balloons
    assert.strictEqual(INHALANT_HARM_REDUCTION_RULES[0].ruleNum, 1);
    assert.ok(INHALANT_HARM_REDUCTION_RULES[0].titleEn.includes('ALWAYS Use Balloons for Nitrous Oxide'));
    assert.ok(INHALANT_HARM_REDUCTION_RULES[0].detailEn.includes('-40°C to -60°C'));

    // Rule 2: Zero masks or bags
    assert.strictEqual(INHALANT_HARM_REDUCTION_RULES[1].ruleNum, 2);
    assert.ok(INHALANT_HARM_REDUCTION_RULES[1].titleEn.includes('NEVER Use Masks, Bags, or Straps'));
    assert.ok(INHALANT_HARM_REDUCTION_RULES[1].detailEn.includes('anoxic brain injury'));

    // Rule 3: Zero PDE-5 combination
    assert.strictEqual(INHALANT_HARM_REDUCTION_RULES[2].ruleNum, 3);
    assert.ok(INHALANT_HARM_REDUCTION_RULES[2].titleEn.includes('NEVER Combine Poppers (Alkyl Nitrites) with Erectile Dysfunction Drugs'));

    // Rule 4: Never chase or startle
    assert.strictEqual(INHALANT_HARM_REDUCTION_RULES[3].ruleNum, 4);
    assert.ok(INHALANT_HARM_REDUCTION_RULES[3].titleEn.includes('NEVER Chase, Startle, or Physically Restrain'));

    // Rule 5: High-Dose IM B12
    assert.strictEqual(INHALANT_HARM_REDUCTION_RULES[4].ruleNum, 5);
    assert.ok(INHALANT_HARM_REDUCTION_RULES[4].titleEn.includes('B12 Replacement Protocol'));
    assert.ok(INHALANT_HARM_REDUCTION_RULES[4].detailEn.includes('Hydroxocobalamin (1,000 mcg IM)'));
  });

  it('evaluates inhalant clinical scenarios across shock, asphyxiation, methemoglobinemia, SSDS, RTA, and SCD', () => {
    // 1. Critical PDE-5 Shock
    const pde5Eval = evaluateInhalantRisk({
      coIngestedPde5Inhibitor: true,
      usingMaskOrBagOverHead: false,
      hasCyanosisChocolateBlood: false,
      hasPalpitationsChestPainAgitation: false,
      hasSevereWeaknessParalysis: false,
      hasNumbnessTinglingAtaxia: false,
      hasCentralVisionLossScotoma: false,
    });
    assert.strictEqual(pde5Eval.tier, 'emergency_pde5_shock');
    assert.strictEqual(pde5Eval.isEmergency, true);
    assert.ok(pde5Eval.actionEn.includes('Viagra, Cialis, or Levitra'));

    // 2. Critical Suffocation
    const suffocationEval = evaluateInhalantRisk({
      coIngestedPde5Inhibitor: false,
      usingMaskOrBagOverHead: true,
      hasCyanosisChocolateBlood: false,
      hasPalpitationsChestPainAgitation: false,
      hasSevereWeaknessParalysis: false,
      hasNumbnessTinglingAtaxia: false,
      hasCentralVisionLossScotoma: false,
    });
    assert.strictEqual(suffocationEval.tier, 'high_hazard_asphyxiation');
    assert.strictEqual(suffocationEval.isEmergency, true);
    assert.ok(suffocationEval.actionEn.includes('REMOVE BAG OR MASK IMMEDIATELY'));

    // 3. Critical Methemoglobinemia
    const metHbEval = evaluateInhalantRisk({
      coIngestedPde5Inhibitor: false,
      usingMaskOrBagOverHead: false,
      hasCyanosisChocolateBlood: true,
      hasPalpitationsChestPainAgitation: false,
      hasSevereWeaknessParalysis: false,
      hasNumbnessTinglingAtaxia: false,
      hasCentralVisionLossScotoma: false,
    });
    assert.strictEqual(metHbEval.tier, 'emergency_methemoglobinemia');
    assert.strictEqual(metHbEval.isEmergency, true);
    assert.ok(metHbEval.actionEn.includes('Methylene Blue'));

    // 4. Critical Cardiac Sensitization / SSDS
    const ssdsEval = evaluateInhalantRisk({
      coIngestedPde5Inhibitor: false,
      usingMaskOrBagOverHead: false,
      hasCyanosisChocolateBlood: false,
      hasPalpitationsChestPainAgitation: true,
      hasSevereWeaknessParalysis: false,
      hasNumbnessTinglingAtaxia: false,
      hasCentralVisionLossScotoma: false,
    });
    assert.strictEqual(ssdsEval.tier, 'emergency_ssds_cardiac');
    assert.strictEqual(ssdsEval.isEmergency, true);
    assert.ok(ssdsEval.actionEn.includes('DO NOT SCARE, CHASE'));

    // 5. Critical Toluene Hypokalemia & Quadriparesis
    const rtaEval = evaluateInhalantRisk({
      coIngestedPde5Inhibitor: false,
      usingMaskOrBagOverHead: false,
      hasCyanosisChocolateBlood: false,
      hasPalpitationsChestPainAgitation: false,
      hasSevereWeaknessParalysis: true,
      hasNumbnessTinglingAtaxia: false,
      hasCentralVisionLossScotoma: false,
    });
    assert.strictEqual(rtaEval.tier, 'emergency_hypokalemic_paralysis');
    assert.strictEqual(rtaEval.isEmergency, true);
    assert.ok(rtaEval.actionEn.includes('Toluene Distal Renal Tubular Acidosis'));

    // 6. Neurological SCD from N2O
    const scdEval = evaluateInhalantRisk({
      coIngestedPde5Inhibitor: false,
      usingMaskOrBagOverHead: false,
      hasCyanosisChocolateBlood: false,
      hasPalpitationsChestPainAgitation: false,
      hasSevereWeaknessParalysis: false,
      hasNumbnessTinglingAtaxia: true,
      hasCentralVisionLossScotoma: false,
    });
    assert.strictEqual(scdEval.tier, 'emergency_scd_neurologic');
    assert.strictEqual(scdEval.isEmergency, true);
    assert.ok(scdEval.actionEn.includes('STOP NITROUS OXIDE IMMEDIATELY'));
    assert.ok(scdEval.actionEn.includes('Methylmalonic Acid (MMA)'));

    // 7. Popper Maculopathy
    const maculaEval = evaluateInhalantRisk({
      coIngestedPde5Inhibitor: false,
      usingMaskOrBagOverHead: false,
      hasCyanosisChocolateBlood: false,
      hasPalpitationsChestPainAgitation: false,
      hasSevereWeaknessParalysis: false,
      hasNumbnessTinglingAtaxia: false,
      hasCentralVisionLossScotoma: true,
    });
    assert.strictEqual(maculaEval.tier, 'urgent_popper_maculopathy');
    assert.strictEqual(maculaEval.isEmergency, false);
    assert.ok(maculaEval.actionEn.includes('STOP USING POPPERS IMMEDIATELY'));

    // 8. Standard Inhalant Guidance
    const standardEval = evaluateInhalantRisk({
      coIngestedPde5Inhibitor: false,
      usingMaskOrBagOverHead: false,
      hasCyanosisChocolateBlood: false,
      hasPalpitationsChestPainAgitation: false,
      hasSevereWeaknessParalysis: false,
      hasNumbnessTinglingAtaxia: false,
      hasCentralVisionLossScotoma: false,
    });
    assert.strictEqual(standardEval.tier, 'standard_inhalant_guidance');
    assert.strictEqual(standardEval.isEmergency, false);
    assert.ok(standardEval.actionEn.includes('Always dispense N₂O into balloons'));
  });

  it('generates zero-PII SBAR clinical handoff notes in English and Spanish', () => {
    const mockState = {
      selectedSubstance: 'nitrousOxide',
      coIngestedPde5Inhibitor: false,
      usingMaskOrBagOverHead: false,
      hasCyanosisChocolateBlood: false,
      hasPalpitationsChestPainAgitation: false,
      hasSevereWeaknessParalysis: false,
      hasNumbnessTinglingAtaxia: true,
      hasCentralVisionLossScotoma: false,
    };
    const mockEval = evaluateInhalantRisk(mockState);

    const sbarEn = buildInhalantSbarText(mockState, mockEval, 'en');
    assert.ok(sbarEn.includes('INHALANT, SOLVENT & NITROUS OXIDE CLINICAL SBAR HANDOFF NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / TOXICOLOGICAL RISK FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & TOXICOLOGY MANAGEMENT):'));
    assert.ok(sbarEn.includes('YES (EVALUATE SCD / B12)'));
    assert.ok(sbarEn.includes('IM Hydroxocobalamin 1,000 mcg'));

    const sbarEs = buildInhalantSbarText(mockState, mockEval, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: EVALUACIÓN DE INHALANTES, N₂O Y TOXICOLOGÍA'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES TOXICOLÓGICOS):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y MANEJO TOXICOLÓGICO):'));
    assert.ok(sbarEs.includes('SÍ (EVALUAR DCS / B12)'));
    assert.ok(sbarEs.includes('Hidroxocobalamina 1.000 mcg IM'));
  });

  it('manages ephemeral in-RAM state without storage leakage', () => {
    resetInhalantState();
    let state = getInhalantState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.viewMode, 'community');
    assert.strictEqual(state.hasNumbnessTinglingAtaxia, false);

    let notifyCount = 0;
    const unsub = subscribeInhalantState((newState) => {
      notifyCount++;
      assert.strictEqual(newState.hasNumbnessTinglingAtaxia, true);
    });

    setInhalantState({ hasNumbnessTinglingAtaxia: true, activeTab: 'substances' });
    assert.strictEqual(notifyCount, 1);
    assert.strictEqual(getInhalantState().hasNumbnessTinglingAtaxia, true);
    assert.strictEqual(getInhalantState().activeTab, 'substances');

    unsub();
    setInhalantState({ activeTab: 'harmReduction' });
    assert.strictEqual(notifyCount, 1, 'Unsubscribed listener must not fire');

    resetInhalantState();
    assert.strictEqual(getInhalantState().hasNumbnessTinglingAtaxia, false);
    assert.strictEqual(getInhalantState().activeTab, 'triage');
  });

  it('preserves zero-storage and zero inline-HTML privacy invariants in inhalantCare.js', () => {
    const code = fs.readFileSync('public/js/views/inhalantCare.js', 'utf8');
    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookies permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
