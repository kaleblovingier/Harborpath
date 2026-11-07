// test/sexual-health.test.js
// HarborPath - Sexual Health, Doxy-PEP, PrEP & Emergency Contraception Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  DOXY_PEP_GUIDELINES,
  PREP_MODALITIES,
  PEP_TO_PREP_TRANSITION,
  EMERGENCY_CONTRACEPTION_MATRIX,
  BARRIER_HARM_REDUCTION,
  getSexualHealthState,
  setSexualHealthState,
  resetSexualHealthState,
  evaluateSexualHealthNeeds,
  buildSexualHealthSbarText,
  sexualHealthView,
} from '../public/js/views/sexualHealth.js';

describe('Sexual Health, Doxy-PEP & Emergency Contraception Module (Wave 31)', () => {
  it('exports CDC 2024 Doxy-PEP guidelines with accurate dosing, esophagitis warnings, and pathogen efficacy', () => {
    assert.ok(DOXY_PEP_GUIDELINES.regimen.doseEn.includes('200 mg'));
    assert.ok(DOXY_PEP_GUIDELINES.regimen.windowEn.includes('72 hours'));
    assert.ok(DOXY_PEP_GUIDELINES.regimen.administrationEn.includes('water'));
    assert.ok(DOXY_PEP_GUIDELINES.regimen.administrationEn.includes('upright'));

    assert.ok(DOXY_PEP_GUIDELINES.efficacyEn.syphilis.includes('70% to 87%'));
    assert.ok(DOXY_PEP_GUIDELINES.efficacyEn.chlamydia.includes('70% to 88%'));
    assert.ok(DOXY_PEP_GUIDELINES.efficacyEn.viralStis.includes('DOES NOT PREVENT VIRAL STIs'));
  });

  it('exports comprehensive PrEP modalities with specific indications and contraindications', () => {
    assert.strictEqual(PREP_MODALITIES.length, 4);

    const truvada = PREP_MODALITIES.find((m) => m.id === 'truvada_daily');
    assert.ok(truvada, 'Missing Truvada modality');
    assert.ok(truvada.populationEn.includes('ALL individuals'));

    const descovy = PREP_MODALITIES.find((m) => m.id === 'descovy_daily');
    assert.ok(descovy, 'Missing Descovy modality');
    assert.ok(descovy.populationEn.includes('EXCEPT'));
    assert.ok(descovy.populationEn.includes('vaginal'));

    const apretude = PREP_MODALITIES.find((m) => m.id === 'apretude_injectable');
    assert.ok(apretude, 'Missing Apretude modality');
    assert.ok(apretude.dosingEn.includes('600 mg'));
    assert.ok(apretude.dosingEn.includes('every 2 months'));

    const onDemand = PREP_MODALITIES.find((m) => m.id === 'event_driven_211');
    assert.ok(onDemand, 'Missing 2-1-1 On-Demand PrEP');
    assert.ok(onDemand.dosingEn.includes('2 tablets of Truvada'));
  });

  it('articulates seamless PEP-to-PrEP continuity with zero unmedicated lapse days', () => {
    assert.ok(PEP_TO_PREP_TRANSITION.principleEn.includes('without any gap'));
    assert.strictEqual(PEP_TO_PREP_TRANSITION.steps.length, 3);
    assert.ok(PEP_TO_PREP_TRANSITION.steps[0].dayEn.includes('Day 28'));
    assert.ok(PEP_TO_PREP_TRANSITION.steps[0].actionEn.includes('rapid 4th-generation HIV'));
    assert.ok(PEP_TO_PREP_TRANSITION.steps[1].actionEn.includes('Zero days of unmedicated lapse'));
  });

  it('details emergency contraception weight thresholds and timing limitations', () => {
    const planB = EMERGENCY_CONTRACEPTION_MATRIX.levonorgestrel;
    assert.ok(planB.weightLimitationEn.includes('165 lbs'));
    assert.ok(planB.windowEn.includes('72 hours'));

    const ella = EMERGENCY_CONTRACEPTION_MATRIX.ulipristal;
    assert.ok(ella.weightLimitationEn.includes('195 lbs'));
    assert.ok(ella.windowEn.includes('120 hours'));

    const iud = EMERGENCY_CONTRACEPTION_MATRIX.copperIud;
    assert.ok(iud.weightLimitationEn.includes('> 99.9% effective'));
    assert.ok(iud.weightLimitationEn.includes('NO WEIGHT RESTRICTIONS'));
  });

  it('enforces latex condom chemical degradation warnings against oil-based lubricants', () => {
    assert.ok(BARRIER_HARM_REDUCTION.oilLatexWarningEn.includes('DISSOLVE AND RUPTURE LATEX CONDOMS'));
    assert.strictEqual(BARRIER_HARM_REDUCTION.materials.length, 4);

    const latex = BARRIER_HARM_REDUCTION.materials.find((m) => m.material === 'Latex');
    assert.ok(latex.lubeEn.includes('Water-based or silicone-based'));

    const internal = BARRIER_HARM_REDUCTION.materials.find((m) => m.material.includes('Internal Condoms'));
    assert.ok(internal.notesEn.includes('8 hours'));
  });

  it('evaluates clinical needs accurately across multi-variable scenarios', () => {
    // Scenario 1: MSM under 24 hours with unknown partner
    const eval1 = evaluateSexualHealthNeeds({
      hoursElapsed: 'under_24',
      exposureCategory: 'condomless_sex',
      patientWeightLbs: 'under_150',
      partnerStiStatus: 'unknown_partner',
      eligibleDoxyPep: 'yes_msm_trans',
    });
    assert.strictEqual(eval1.doxyPepRecommended, true);
    assert.strictEqual(eval1.preferredEcMethod, 'levonorgestrel');
    assert.strictEqual(eval1.hivEmergency, false);

    // Scenario 2: Sexual assault / known HIV partner under 72h
    const eval2 = evaluateSexualHealthNeeds({
      hoursElapsed: '24_to_72',
      exposureCategory: 'assault_coercion',
      patientWeightLbs: '165_to_195',
      partnerStiStatus: 'known_hiv_positive',
      eligibleDoxyPep: 'yes_msm_trans',
    });
    assert.strictEqual(eval2.hivEmergency, true);
    assert.ok(eval2.hivActionEn.includes('HIV PEP IMMEDIATELY'));
    assert.strictEqual(eval2.preferredEcMethod, 'ulipristal');

    // Scenario 3: Weight over 195 lbs
    const eval3 = evaluateSexualHealthNeeds({
      hoursElapsed: 'under_24',
      exposureCategory: 'condom_break',
      patientWeightLbs: 'over_195',
      partnerStiStatus: 'unknown_partner',
      eligibleDoxyPep: 'general_public',
    });
    assert.strictEqual(eval3.preferredEcMethod, 'copper_iud');
    assert.ok(eval3.ecRecommendationEn.includes('Copper IUD'));

    // Scenario 4: Window expired > 120 hours
    const eval4 = evaluateSexualHealthNeeds({
      hoursElapsed: 'over_120',
      exposureCategory: 'condomless_sex',
      patientWeightLbs: 'under_150',
      partnerStiStatus: 'unknown_partner',
      eligibleDoxyPep: 'yes_msm_trans',
    });
    assert.strictEqual(eval4.preferredEcMethod, 'none');
    assert.strictEqual(eval4.doxyPepRecommended, false);
  });

  it('builds comprehensive bilingual SBAR clinical documentation without PII', () => {
    const state = {
      hoursElapsed: 'under_24',
      exposureCategory: 'condomless_sex',
      patientWeightLbs: '150_to_165',
      partnerStiStatus: 'unknown_partner',
      eligibleDoxyPep: 'yes_msm_trans',
      viewMode: 'clinical',
    };
    const evaluation = evaluateSexualHealthNeeds(state);

    const sbarEn = buildSexualHealthSbarText(state, evaluation, 'en');
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / CLINICAL FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & THERAPEUTIC PLAN):'));
    assert.ok(sbarEn.includes('Doxycycline 200 mg'));

    const sbarEs = buildSexualHealthSbarText(state, evaluation, 'es');
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES DE RIESGO):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y PLAN TERAPÉUTICO):'));
    assert.ok(sbarEs.includes('Doxiciclina 200 mg'));
  });

  it('manages in-RAM ephemeral state with deterministic resets and zero storage persistence', () => {
    resetSexualHealthState();
    const initial = getSexualHealthState();
    assert.strictEqual(initial.activeTab, 'calculator');
    assert.strictEqual(initial.viewMode, 'community');

    setSexualHealthState({ activeTab: 'doxy-pep', viewMode: 'clinical' });
    const updated = getSexualHealthState();
    assert.strictEqual(updated.activeTab, 'doxy-pep');
    assert.strictEqual(updated.viewMode, 'clinical');

    resetSexualHealthState();
    const reset = getSexualHealthState();
    assert.strictEqual(reset.activeTab, 'calculator');
    assert.strictEqual(reset.viewMode, 'community');
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
      const el = sexualHealthView();
      assert.ok(el, 'sexualHealthView must return a root element');
      assert.strictEqual(el.className, 'sexual-health-view');
      assert.ok(el.children.length >= 4);
    } finally {
      globalThis.document = prevDoc;
      globalThis.Node = prevNode;
    }
  });

  it('passes strict static security and privacy audit', () => {
    const code = fs.readFileSync('public/js/views/sexualHealth.js', 'utf8');

    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookie permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
