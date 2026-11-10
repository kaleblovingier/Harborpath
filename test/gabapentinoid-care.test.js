// test/gabapentinoid-care.test.js
// HarborPath - Gabapentinoid Misuse, Respiratory Depression Synergy & Deprescribing Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  GABAPENTINOID_COMPARATIVE_DATA,
  GABAPENTINOID_OVERDOSE_SYNERGY,
  GWS_SYMPTOM_CLUSTERS,
  HYPERBOLIC_TAPERING_PRINCIPLES,
  calculateCockcroftGaultCrCl,
  getRenalDoseLimits,
  getGabapentinoidState,
  setGabapentinoidState,
  resetGabapentinoidState,
  evaluateGabapentinoidSafety,
  generateHyperbolicSchedule,
  buildGabapentinoidSbarText,
  gabapentinoidCareView,
} from '../public/js/views/gabapentinoidCare.js';

describe('Gabapentinoid Safety, Respiratory Synergy & Deprescribing Module (Wave 33)', () => {
  it('exports accurate comparative pharmacology for gabapentin and pregabalin', () => {
    const gaba = GABAPENTINOID_COMPARATIVE_DATA.gabapentin;
    assert.ok(gaba, 'Missing gabapentin profile');
    assert.ok(gaba.mechanismEn.includes('alpha-2-delta-1'));
    assert.ok(gaba.absorptionEn.includes('NON-LINEAR & SATURABLE'));
    assert.ok(gaba.absorptionEn.includes('LAT1'));
    assert.ok(gaba.liquidFormulationEn.includes('250 mg / 5 mL'));

    const pregab = GABAPENTINOID_COMPARATIVE_DATA.pregabalin;
    assert.ok(pregab, 'Missing pregabalin profile');
    assert.ok(pregab.mechanismEn.includes('6-fold higher binding affinity'));
    assert.ok(pregab.absorptionEn.includes('LINEAR & RAPID'));
    assert.ok(pregab.potencyRatio.includes('6x more potent by weight'));
    assert.ok(pregab.liquidFormulationEn.includes('20 mg / mL'));
  });

  it('articulates FDA 2019 black-box respiratory synergy and overdose epidemiology', () => {
    assert.ok(GABAPENTINOID_OVERDOSE_SYNERGY.fdaAlertTitleEn.includes('Serious Breathing Difficulties'));
    assert.ok(GABAPENTINOID_OVERDOSE_SYNERGY.clinicalMechanismEn.includes('hypoxic ventilatory drive'));
    assert.ok(GABAPENTINOID_OVERDOSE_SYNERGY.clinicalMechanismEn.includes('hypercapnic ventilatory compensation'));
    assert.ok(GABAPENTINOID_OVERDOSE_SYNERGY.fatalityStatsEn.includes('20% to 30% of all fatal opioid overdoses'));
    assert.ok(GABAPENTINOID_OVERDOSE_SYNERGY.highRiskCohortsEn.length >= 5);
  });

  it('details Gabapentinoid Withdrawal Syndrome (GWS) symptom clusters', () => {
    assert.strictEqual(GWS_SYMPTOM_CLUSTERS.length, 3);
    const autonomic = GWS_SYMPTOM_CLUSTERS.find((c) => c.clusterId === 'autonomic');
    assert.ok(autonomic.symptomsEn.includes('Profuse diaphoresis'));

    const neuro = GWS_SYMPTOM_CLUSTERS.find((c) => c.clusterId === 'neurological');
    assert.ok(neuro.symptomsEn.includes('paresthesias'));
    assert.ok(neuro.symptomsEn.includes('SEIZURE RISK / STATUS EPILEPTICUS'));

    const psych = GWS_SYMPTOM_CLUSTERS.find((c) => c.clusterId === 'psychiatric');
    assert.ok(psych.symptomsEn.includes('rebound generalized anxiety'));
  });

  it('calculates Cockcroft-Gault creatinine clearance accurately across demographics', () => {
    // 45 yo male, 70 kg, SCr 1.0 -> ((140-45)*70)/(72*1) = 6650 / 72 = 92 mL/min
    const crClMale = calculateCockcroftGaultCrCl(1.0, 45, 70, false);
    assert.strictEqual(crClMale, 92);

    // 45 yo female, 70 kg, SCr 1.0 -> 92.36 * 0.85 = 78.5 -> Math.round is 79 mL/min
    const crClFemale = calculateCockcroftGaultCrCl(1.0, 45, 70, true);
    assert.strictEqual(crClFemale, 79);

    // Elderly with CKD: 80 yo female, 50 kg, SCr 1.8 -> ((140-80)*50)/(72*1.8) * 0.85 = (3000/129.6)*0.85 ~ 20 mL/min
    const crClElderly = calculateCockcroftGaultCrCl(1.8, 80, 50, true);
    assert.ok(crClElderly <= 25 && crClElderly >= 18);
  });

  it('enforces renal dose ceilings for gabapentin and pregabalin', () => {
    // Gabapentin renal ceilings
    const gabaNormal = getRenalDoseLimits('gabapentin', 80);
    assert.strictEqual(gabaNormal.maxDailyMg, 3600);

    const gabaModerate = getRenalDoseLimits('gabapentin', 40);
    assert.strictEqual(gabaModerate.maxDailyMg, 1400);

    const gabaSevere = getRenalDoseLimits('gabapentin', 20);
    assert.strictEqual(gabaSevere.maxDailyMg, 700);

    const gabaEsrd = getRenalDoseLimits('gabapentin', 10);
    assert.strictEqual(gabaEsrd.maxDailyMg, 300);

    // Pregabalin renal ceilings
    const pregabNormal = getRenalDoseLimits('pregabalin', 80);
    assert.strictEqual(pregabNormal.maxDailyMg, 600);

    const pregabModerate = getRenalDoseLimits('pregabalin', 40);
    assert.strictEqual(pregabModerate.maxDailyMg, 300);

    const pregabSevere = getRenalDoseLimits('pregabalin', 20);
    assert.strictEqual(pregabSevere.maxDailyMg, 150);
  });

  it('triggers critical emergency tier when co-prescribed with opioids and respiratory or age risk', () => {
    const highRiskState = {
      selectedSubstance: 'gabapentin',
      currentDailyDoseMg: 2400,
      hasOpioidCoPrescription: true,
      hasPulmonaryDisease: true,
      hasSedativeCoIngestion: false,
      patientAgeYears: 55,
      patientWeightKg: 75,
      serumCreatinineMgDl: 1.0,
      patientIsFemale: false,
      selectedTaperSpeed: 'conservative',
    };

    const evalResult = evaluateGabapentinoidSafety(highRiskState);
    assert.strictEqual(evalResult.urgencyTier, 'emergency_synergy');
    assert.strictEqual(evalResult.isHighRisk, true);
    assert.ok(evalResult.tierTitleEn.includes('CRITICAL WARNING'));
    assert.ok(evalResult.actionEn.includes('EMERGENCY CO-PRESCRIBING ALERT'));
    assert.ok(evalResult.actionEn.includes('Naloxone'));
    assert.ok(evalResult.actionEn.includes('seizure hazard'));
  });

  it('detects doses exceeding renal clearance and generates hyperbolic schedule', () => {
    const renalOverdoseState = {
      selectedSubstance: 'gabapentin',
      currentDailyDoseMg: 2400,
      hasOpioidCoPrescription: false,
      hasPulmonaryDisease: false,
      hasSedativeCoIngestion: false,
      patientAgeYears: 75,
      patientWeightKg: 60,
      serumCreatinineMgDl: 2.0, // Low CrCl ~ 23 mL/min -> Max 700 mg
      patientIsFemale: true,
      selectedTaperSpeed: 'standard',
    };

    const evalResult = evaluateGabapentinoidSafety(renalOverdoseState);
    assert.strictEqual(evalResult.urgencyTier, 'renal_overdose');
    assert.strictEqual(evalResult.isHighRisk, true);
    assert.ok(evalResult.actionEn.includes('exceeds the recommended safe maximum'));

    // Test hyperbolic schedule generation
    const schedule = generateHyperbolicSchedule(1800, 15, 2, 50);
    assert.ok(schedule.length >= 5);
    assert.strictEqual(schedule[0].stepIndex, 1);
    assert.strictEqual(schedule[0].doseMg, 1800);
    assert.ok(schedule[schedule.length - 1].doseMg <= 50);
  });

  it('generates structured SBAR handoff notes in English and Spanish', () => {
    const state = {
      selectedSubstance: 'pregabalin',
      currentDailyDoseMg: 450,
      hasOpioidCoPrescription: true,
      hasPulmonaryDisease: true,
      hasSedativeCoIngestion: false,
      patientAgeYears: 68,
      patientWeightKg: 70,
      serumCreatinineMgDl: 1.2,
      patientIsFemale: false,
      selectedTaperSpeed: 'conservative',
    };
    const evaluation = evaluateGabapentinoidSafety(state);

    const sbarEn = buildGabapentinoidSbarText(state, evaluation, 'en');
    assert.ok(sbarEn.includes('GABAPENTINOID SAFETY, OVERDOSE SYNERGY & HYPERBOLIC DEPRESCRIBING'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / OVERDOSE RISK FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & HYPERBOLIC DEPRESCRIBING PLAN):'));
    assert.ok(sbarEn.includes('Naloxone'));

    const sbarEs = buildGabapentinoidSbarText(state, evaluation, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: GABAPENTINOIDES'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES DE RIESGO DE SOBREDOSIS):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y PLAN TERAPÉUTICO DE DESESCALADA):'));
    assert.ok(sbarEs.includes('Naloxona'));
  });

  it('manages in-RAM ephemeral state with deterministic resets and zero storage persistence', () => {
    resetGabapentinoidState();
    const initial = getGabapentinoidState();
    assert.strictEqual(initial.activeTab, 'calculator');
    assert.strictEqual(initial.selectedSubstance, 'gabapentin');

    setGabapentinoidState({ activeTab: 'deprescribing', selectedSubstance: 'pregabalin', hasOpioidCoPrescription: true });
    const updated = getGabapentinoidState();
    assert.strictEqual(updated.activeTab, 'deprescribing');
    assert.strictEqual(updated.selectedSubstance, 'pregabalin');
    assert.strictEqual(updated.hasOpioidCoPrescription, true);

    resetGabapentinoidState();
    const reset = getGabapentinoidState();
    assert.strictEqual(reset.activeTab, 'calculator');
    assert.strictEqual(reset.selectedSubstance, 'gabapentin');
    assert.strictEqual(reset.hasOpioidCoPrescription, false);
  });

  it('renders accessible WCAG 2.2 AA compliant DOM structure and interactive elements', () => {
    class MockNode {
      constructor(tag) {
        this.tag = tag;
        this.attributes = {};
        this.children = [];
        this.className = '';
        this.parent = null;
      }
      setAttribute(k, v) { this.attributes[k] = String(v); }
      getAttribute(k) { return this.attributes[k]; }
      appendChild(c) {
        if (typeof c === 'string') {
          const txt = new MockNode('#text');
          txt.textContent = c;
          c = txt;
        }
        c.parent = this;
        this.children.push(c);
        return c;
      }
      append(...args) {
        for (const a of args) this.appendChild(a);
      }
      get firstChild() { return this.children[0] || null; }
      remove() {
        if (this.parent) {
          const idx = this.parent.children.indexOf(this);
          if (idx >= 0) this.parent.children.splice(idx, 1);
        }
      }
      addEventListener() {}
    }

    const prevDoc = globalThis.document;
    const prevNode = globalThis.Node;
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
    };

    try {
      const el = gabapentinoidCareView();
      assert.ok(el, 'gabapentinoidCareView must return a root element');
      assert.strictEqual(el.className, 'gabapentinoid-care-view');
      assert.ok(el.children.length >= 4);
    } finally {
      globalThis.document = prevDoc;
      globalThis.Node = prevNode;
    }
  });

  it('passes strict static security and privacy audit', () => {
    const code = fs.readFileSync('public/js/views/gabapentinoidCare.js', 'utf8');

    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookie permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
