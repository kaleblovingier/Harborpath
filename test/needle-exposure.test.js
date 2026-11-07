// test/needle-exposure.test.js
// HarborPath - Needle Stick, Sharps Injury & Bloodborne Pathogen PEP Protocol Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  TRANSMISSION_PROBABILITIES,
  DECONTAMINATION_PROTOCOL,
  PEP_CLINICAL_REGIMENS,
  HEPATITIS_B_PEP_ALGORITHM,
  TETANUS_POST_EXPOSURE,
  OSHA_WORKER_RIGHTS,
  COMMUNITY_SHARPS_SAFETY,
  getExposureState,
  setExposureState,
  resetExposureState,
  evaluateExposureRisk,
  buildExposureSbarText,
  needleExposureView,
} from '../public/js/views/needleExposure.js';

describe('Needle Stick, Sharps Injury & PEP Protocol Module (Wave 30)', () => {
  it('exports accurate CDC / USPHS transmission probability benchmarks', () => {
    assert.ok(TRANSMISSION_PROBABILITIES.hiv.percutaneous.includes('0.23%'));
    assert.ok(TRANSMISSION_PROBABILITIES.hiv.mucousSplash.includes('0.09%'));
    assert.ok(TRANSMISSION_PROBABILITIES.hiv.environmentalSurvivalEn.includes('Zero confirmed cases'));

    assert.ok(TRANSMISSION_PROBABILITIES.hcv.percutaneous.includes('1.8%'));
    assert.ok(TRANSMISSION_PROBABILITIES.hcv.environmentalSurvivalEn.includes('direct-acting antivirals'));

    assert.ok(TRANSMISSION_PROBABILITIES.hbv.percutaneousVaccinatedResponder.includes('0%'));
    assert.ok(TRANSMISSION_PROBABILITIES.hbv.environmentalSurvivalEn.includes('7 days'));
  });

  it('mandates mechanical washing and enforces strict contraindications against milking or caustic chemicals', () => {
    assert.strictEqual(DECONTAMINATION_PROTOCOL.skinPuncture.length, 2);
    assert.ok(DECONTAMINATION_PROTOCOL.skinPuncture[0].actionEn.includes('soap and running water'));

    assert.strictEqual(DECONTAMINATION_PROTOCOL.mucousMembrane.length, 2);
    assert.ok(DECONTAMINATION_PROTOCOL.mucousMembrane[0].actionEn.includes('15 full minutes'));

    assert.strictEqual(DECONTAMINATION_PROTOCOL.contraindicatedActions.length, 3);
    const milking = DECONTAMINATION_PROTOCOL.contraindicatedActions.find((c) => c.practiceEn.includes('MILK'));
    assert.ok(milking, 'Missing wound milking contraindication');
    assert.ok(milking.dangerEn.includes('capillaries'));

    const caustic = DECONTAMINATION_PROTOCOL.contraindicatedActions.find((c) => c.practiceEn.includes('CAUSTIC'));
    assert.ok(caustic, 'Missing caustic chemical contraindication');
    assert.ok(caustic.dangerEn.includes('tissue necrosis'));
  });

  it('exports CDC/USPHS preferred Biktarvy and alternative Tivicay+Truvada 28-day PEP regimens', () => {
    assert.ok(PEP_CLINICAL_REGIMENS.timingWindow.limitEn.includes('72 hours'));
    assert.ok(PEP_CLINICAL_REGIMENS.timingWindow.durationEn.includes('28 full days'));

    assert.ok(PEP_CLINICAL_REGIMENS.preferredRegimen.name.includes('Biktarvy'));
    assert.ok(PEP_CLINICAL_REGIMENS.preferredRegimen.doseEn.includes('once daily'));
    assert.ok(PEP_CLINICAL_REGIMENS.preferredRegimen.advantagesEn.includes('tenofovir alafenamide'));

    assert.ok(PEP_CLINICAL_REGIMENS.alternativeRegimen.name.includes('Tivicay'));
    assert.ok(PEP_CLINICAL_REGIMENS.alternativeRegimen.doseEn.includes('Truvada'));

    assert.ok(PEP_CLINICAL_REGIMENS.starterPackPrincipleEn.includes('starter pack'));
  });

  it('stratifies Hepatitis B post-exposure prophylaxis across vaccinated, non-responder, and unvaccinated states', () => {
    assert.strictEqual(HEPATITIS_B_PEP_ALGORITHM.length, 4);

    const responder = HEPATITIS_B_PEP_ALGORITHM.find((r) => r.workerStatusEn.includes('Responder'));
    assert.ok(responder.hBsAgPositiveSourceEn.includes('No treatment needed'));

    const nonResponder = HEPATITIS_B_PEP_ALGORITHM.find((r) => r.workerStatusEn.includes('Non-Responder'));
    assert.ok(nonResponder.hBsAgPositiveSourceEn.includes('HBIG'));

    const unvaccinated = HEPATITIS_B_PEP_ALGORITHM.find((r) => r.workerStatusEn.includes('Unvaccinated'));
    assert.ok(unvaccinated.hBsAgPositiveSourceEn.includes('HBIG'));
    assert.ok(unvaccinated.hBsAgPositiveSourceEn.includes('vaccine series'));
  });

  it('articulates OSHA 29 CFR § 1910.1030 100% employer-paid medical evaluation and non-retaliation rights', () => {
    assert.strictEqual(OSHA_WORKER_RIGHTS.rights.length, 4);

    const paidRight = OSHA_WORKER_RIGHTS.rights.find((r) => r.rightEn.includes('100% Employer-Paid'));
    assert.ok(paidRight, 'Missing 100% employer paid right');
    assert.ok(paidRight.detailEn.includes('NO COST to the employee'));

    const retaliation = OSHA_WORKER_RIGHTS.rights.find((r) => r.rightEn.includes('Non-Retaliation'));
    assert.ok(retaliation, 'Missing non-retaliation protection');
    assert.ok(retaliation.detailEn.includes('illegal for an employer'));
  });

  it('debunks community syringe HIV panic and outlines rigid container safe pickup protocol', () => {
    assert.ok(COMMUNITY_SHARPS_SAFETY.mythDebunkingEn.includes('ZERO cases of HIV transmission'));
    assert.ok(COMMUNITY_SHARPS_SAFETY.mythDebunkingEn.includes('Sunlight'));

    assert.strictEqual(COMMUNITY_SHARPS_SAFETY.safePickupSteps.length, 5);
    assert.ok(COMMUNITY_SHARPS_SAFETY.safePickupSteps[0].ruleEn.includes('Never touch'));
    assert.ok(COMMUNITY_SHARPS_SAFETY.safePickupSteps[1].ruleEn.includes('Do not recap'));
    assert.ok(COMMUNITY_SHARPS_SAFETY.safePickupSteps[2].ruleEn.includes('rigid, heavy-duty container'));
  });

  it('evaluates exposure risk correctly across clinical scenarios', () => {
    // 1. High risk percutaneous puncture < 2 hours
    const evalHigh = evaluateExposureRisk({
      exposureType: 'percutaneous_deep',
      deviceType: 'hollow_bore_blood',
      timeElapsed: 'under_2h',
      sourceStatus: 'unknown_high_risk',
      workerHbvStatus: 'vaccinated_responder',
      tetanusYears: 'under_5',
      viewMode: 'occupational',
    });
    assert.strictEqual(evalHigh.urgencyTier, 'emergency_immediate');
    assert.strictEqual(evalHigh.pepRecommended, true);
    assert.strictEqual(evalHigh.isEmergency, true);
    assert.ok(evalHigh.hbvActionEn.includes('Fully protected'));

    // 2. Intact skin contact
    const evalIntact = evaluateExposureRisk({
      exposureType: 'intact_skin',
      deviceType: 'splash_fluid',
      timeElapsed: 'under_2h',
      sourceStatus: 'known_hiv_positive',
      workerHbvStatus: 'vaccinated_responder',
      tetanusYears: 'under_5',
      viewMode: 'occupational',
    });
    assert.strictEqual(evalIntact.urgencyTier, 'no_risk');
    assert.strictEqual(evalIntact.pepRecommended, false);
    assert.strictEqual(evalIntact.isEmergency, false);

    // 3. Expired 72-hour window
    const evalExpired = evaluateExposureRisk({
      exposureType: 'percutaneous_deep',
      deviceType: 'hollow_bore_blood',
      timeElapsed: 'over_72h',
      sourceStatus: 'known_hiv_positive',
      workerHbvStatus: 'unvaccinated',
      tetanusYears: 'over_10',
      viewMode: 'occupational',
    });
    assert.strictEqual(evalExpired.urgencyTier, 'window_expired');
    assert.strictEqual(evalExpired.pepRecommended, false);
    assert.ok(evalExpired.pepReasonEn.includes('72 hours have elapsed'));
    assert.ok(evalExpired.tetanusActionEn.includes('Tdap booster'));

    // 4. Source confirmed negative
    const evalSourceNeg = evaluateExposureRisk({
      exposureType: 'percutaneous_deep',
      deviceType: 'hollow_bore_blood',
      timeElapsed: 'under_2h',
      sourceStatus: 'known_negative',
      workerHbvStatus: 'vaccinated_responder',
      tetanusYears: 'under_5',
      viewMode: 'occupational',
    });
    assert.strictEqual(evalSourceNeg.urgencyTier, 'source_negative');
    assert.strictEqual(evalSourceNeg.pepRecommended, false);
  });

  it('builds comprehensive bilingual SBAR clinical documentation without PII', () => {
    const state = {
      exposureType: 'percutaneous_deep',
      deviceType: 'hollow_bore_blood',
      timeElapsed: 'under_2h',
      sourceStatus: 'unknown_high_risk',
      workerHbvStatus: 'vaccinated_responder',
      tetanusYears: 'under_5',
      viewMode: 'occupational',
    };
    const evaluation = evaluateExposureRisk(state);

    const sbarEn = buildExposureSbarText(state, evaluation, 'en');
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / INCIDENT DETAILS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & ACTION PLAN):'));
    assert.ok(sbarEn.includes('OSHA 1910.1030'));
    assert.ok(sbarEn.includes('Biktarvy'));

    const sbarEs = buildExposureSbarText(state, evaluation, 'es');
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / DETALLES DEL DISPOSITIVO):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y PLAN DE ACCIÓN):'));
    assert.ok(sbarEs.includes('Norma OSHA 1910.1030'));
  });

  it('manages in-RAM ephemeral state with deterministic resets and zero storage persistence', () => {
    resetExposureState();
    const initial = getExposureState();
    assert.strictEqual(initial.activeTab, 'calculator');
    assert.strictEqual(initial.viewMode, 'occupational');

    setExposureState({ activeTab: 'pep-regimens', viewMode: 'community' });
    const updated = getExposureState();
    assert.strictEqual(updated.activeTab, 'pep-regimens');
    assert.strictEqual(updated.viewMode, 'community');

    resetExposureState();
    const reset = getExposureState();
    assert.strictEqual(reset.activeTab, 'calculator');
    assert.strictEqual(reset.viewMode, 'occupational');
  });

  it('renders accessible WCAG 2.2 AA compliant DOM structure and interactive elements', () => {
    // Setup Mock DOM environment
    class MockNode {
      constructor(tag) {
        this.tag = tag;
        this.attributes = {};
        this.children = [];
        this.textContent = '';
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
      const el = needleExposureView();
      assert.ok(el, 'needleExposureView must return a root element');
      assert.strictEqual(el.className, 'needle-exposure-view');
      assert.ok(el.children.length >= 4);
    } finally {
      globalThis.document = prevDoc;
      globalThis.Node = prevNode;
    }
  });

  it('passes strict static security and privacy audit', () => {
    const code = fs.readFileSync('public/js/views/needleExposure.js', 'utf8');

    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookie permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
