// test/pulmonary-care.test.js
// HarborPath - Pulmonary Health, Post-Overdose Lung Injury & Inhalation Safety Navigator Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  PULMONARY_SYNDROME_PROFILES,
  PULMONARY_HARM_REDUCTION_RULES,
  evaluatePulmonaryRisk,
  buildPulmonarySbarText,
  getPulmonaryState,
  setPulmonaryState,
  resetPulmonaryState,
  subscribePulmonaryState,
  pulmonaryCareView,
} from '../public/js/views/pulmonaryCare.js';

describe('Pulmonary Health, Lung Injury & Inhalation Safety Navigator Module (Wave 43)', () => {
  it('exports verified substance-induced pulmonary syndrome profiles with pathophysiologic taxonomy', () => {
    // 1. NCPE / NPPE
    const ncpe = PULMONARY_SYNDROME_PROFILES.ncpe;
    assert.ok(ncpe);
    assert.strictEqual(ncpe.id, 'ncpe');
    assert.ok(ncpe.nameEn.includes('Negative Pressure Pulmonary Edema'));
    assert.ok(ncpe.pathophysiologyEn.includes('negative intrathoracic pressure'));
    assert.ok(ncpe.pathophysiologyEn.includes('laryngospasm'));
    assert.ok(ncpe.clinicalPresentationEn.includes('pink frothy sputum'));
    assert.ok(ncpe.clinicalPresentationEn.includes('CPAP/BiPAP'));

    // 2. Crack Lung
    const crack = PULMONARY_SYNDROME_PROFILES.crackLung;
    assert.ok(crack);
    assert.strictEqual(crack.id, 'crack_lung');
    assert.ok(crack.nameEn.includes('Diffuse Alveolar Hemorrhage'));
    assert.ok(crack.pathophysiologyEn.includes('alveolar hemorrhage'));
    assert.ok(crack.clinicalPresentationEn.includes('hemoptysis'));
    assert.ok(crack.clinicalPresentationEn.includes('corticosteroids'));

    // 3. Aspiration
    const asp = PULMONARY_SYNDROME_PROFILES.aspiration;
    assert.ok(asp);
    assert.strictEqual(asp.id, 'aspiration');
    assert.ok(asp.nameEn.includes('Mendelson Syndrome'));
    assert.ok(asp.pathophysiologyEn.includes('chemical burn'));
    assert.ok(asp.clinicalPresentationEn.includes('STRICTLY CONTRAINDICATED during the first 48 hours'));

    // 4. Talcosis
    const talc = PULMONARY_SYNDROME_PROFILES.talcosis;
    assert.ok(talc);
    assert.strictEqual(talc.id, 'talcosis');
    assert.ok(talc.clinicalPresentationEn.includes('0.22-micron wheel filters'));

    // 5. Bronchospasm
    const bronch = PULMONARY_SYNDROME_PROFILES.bronchospasm;
    assert.ok(bronch);
    assert.strictEqual(bronch.id, 'bronchospasm');
    assert.ok(bronch.clinicalPresentationEn.includes('albuterol'));
  });

  it('exports 6 field harm reduction rules for pulmonary preservation', () => {
    assert.strictEqual(PULMONARY_HARM_REDUCTION_RULES.length, 6);

    const r1 = PULMONARY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 1);
    assert.ok(r1.titleEn.includes('Pink Frothy Sputum Post-Naloxone'));

    const r2 = PULMONARY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 2);
    assert.ok(r2.titleEn.includes('Aspiration Pneumonitis is Chemical'));

    const r3 = PULMONARY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 3);
    assert.ok(r3.titleEn.includes('Crack Lung'));

    const r4 = PULMONARY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 4);
    assert.ok(r4.titleEn.includes('Pyrex Glass Stems'));

    const r5 = PULMONARY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 5);
    assert.ok(r5.titleEn.includes('0.22-Micron Wheel Filters'));

    const r6 = PULMONARY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 6);
    assert.ok(r6.titleEn.includes('Inhaled Bronchodilators'));
  });

  it('evaluates pulmonary risk scenarios accurately across all clinical emergency tiers', () => {
    // 1. Emergency NCPE
    const resNcpe = evaluatePulmonaryRisk({
      hasPinkFrothySputumHypoxemia: true,
      hasCrackLungHemoptysisFever: false,
      hasWitnessedGastricAspiration: false,
      hasSevereWheezingBronchospasm: false,
      isInjectingCrushedPillsDyspnea: false,
      needsSaferSmokingGuidance: false,
    });
    assert.strictEqual(resNcpe.tier, 'emergency_ncpe_pulmonary_edema');
    assert.strictEqual(resNcpe.isEmergency, true);
    assert.ok(resNcpe.actionEn.includes('CPAP'));
    assert.ok(resNcpe.actionEn.includes('DO NOT administer additional naloxone'));

    // 2. Emergency Crack Lung
    const resCrack = evaluatePulmonaryRisk({
      hasPinkFrothySputumHypoxemia: false,
      hasCrackLungHemoptysisFever: true,
      hasWitnessedGastricAspiration: false,
      hasSevereWheezingBronchospasm: false,
      isInjectingCrushedPillsDyspnea: false,
      needsSaferSmokingGuidance: false,
    });
    assert.strictEqual(resCrack.tier, 'emergency_crack_lung_dah');
    assert.strictEqual(resCrack.isEmergency, true);
    assert.ok(resCrack.actionEn.includes('corticosteroids'));

    // 3. Acute Severe Bronchospasm
    const resBronch = evaluatePulmonaryRisk({
      hasPinkFrothySputumHypoxemia: false,
      hasCrackLungHemoptysisFever: false,
      hasWitnessedGastricAspiration: false,
      hasSevereWheezingBronchospasm: true,
      isInjectingCrushedPillsDyspnea: false,
      needsSaferSmokingGuidance: false,
    });
    assert.strictEqual(resBronch.tier, 'emergency_acute_severe_bronchospasm');
    assert.strictEqual(resBronch.isEmergency, true);
    assert.ok(resBronch.actionEn.includes('Albuterol'));

    // 4. Chemical Aspiration Pneumonitis
    const resAsp = evaluatePulmonaryRisk({
      hasPinkFrothySputumHypoxemia: false,
      hasCrackLungHemoptysisFever: false,
      hasWitnessedGastricAspiration: true,
      hasSevereWheezingBronchospasm: false,
      isInjectingCrushedPillsDyspnea: false,
      needsSaferSmokingGuidance: false,
    });
    assert.strictEqual(resAsp.tier, 'urgent_aspiration_chemical_pneumonitis');
    assert.strictEqual(resAsp.isEmergency, false);
    assert.ok(resAsp.actionEn.includes('48-HOUR ANTIBIOTIC WITHHOLDING RULE'));

    // 5. Foreign Body Talcosis
    const resTalc = evaluatePulmonaryRisk({
      hasPinkFrothySputumHypoxemia: false,
      hasCrackLungHemoptysisFever: false,
      hasWitnessedGastricAspiration: false,
      hasSevereWheezingBronchospasm: false,
      isInjectingCrushedPillsDyspnea: true,
      needsSaferSmokingGuidance: false,
    });
    assert.strictEqual(resTalc.tier, 'urgent_talc_granulomatosis');
    assert.strictEqual(resTalc.isEmergency, false);
    assert.ok(resTalc.actionEn.includes('0.22-micron wheel filters'));

    // 6. Safer Inhalation Guidance
    const resSafe = evaluatePulmonaryRisk({
      hasPinkFrothySputumHypoxemia: false,
      hasCrackLungHemoptysisFever: false,
      hasWitnessedGastricAspiration: false,
      hasSevereWheezingBronchospasm: false,
      isInjectingCrushedPillsDyspnea: false,
      needsSaferSmokingGuidance: true,
    });
    assert.strictEqual(resSafe.tier, 'harm_reduction_safer_inhalation');
    assert.strictEqual(resSafe.isEmergency, false);
    assert.ok(resSafe.actionEn.includes('Pyrex Borosilicate Glass Stems'));

    // 7. Standard Prevention
    const resStd = evaluatePulmonaryRisk({
      hasPinkFrothySputumHypoxemia: false,
      hasCrackLungHemoptysisFever: false,
      hasWitnessedGastricAspiration: false,
      hasSevereWheezingBronchospasm: false,
      isInjectingCrushedPillsDyspnea: false,
      needsSaferSmokingGuidance: false,
    });
    assert.strictEqual(resStd.tier, 'standard_pulmonary_prevention');
    assert.strictEqual(resStd.isEmergency, false);
    assert.ok(resStd.actionEn.includes('recovery position'));
  });

  it('generates zero-PII SBAR clinical handoff note in English and Spanish', () => {
    const state = {
      hasPinkFrothySputumHypoxemia: true,
      hasCrackLungHemoptysisFever: true,
      hasWitnessedGastricAspiration: true,
      hasSevereWheezingBronchospasm: false,
      isInjectingCrushedPillsDyspnea: false,
      needsSaferSmokingGuidance: false,
    };
    const evalResult = evaluatePulmonaryRisk(state);

    // English SBAR
    const sbarEn = buildPulmonarySbarText(state, evalResult, 'en');
    assert.ok(sbarEn.includes('PULMONARY HEALTH & SUBSTANCE LUNG INJURY CLINICAL SBAR HANDOFF NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / RESPIRATORY & SUBSTANCE RISK FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & PULMONOLOGY MANAGEMENT):'));
    assert.ok(sbarEn.includes('YES (NON-CARDIOGENIC PULMONARY EDEMA / NPPE)'));
    assert.ok(sbarEn.includes('Apply CPAP/PEEP + O2 stat'));
    assert.ok(!sbarEn.includes('patient name'));

    // Spanish SBAR
    const sbarEs = buildPulmonarySbarText(state, evalResult, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: EVALUACIÓN PULMONAR Y RESPIRATORIA (CERO PII)'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES DE RIESGO RESPIRATORIOS Y DE CONSUMO):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y GESTIÓN NEUMOLÓGICA):'));
    assert.ok(sbarEs.includes('SÍ (EDEMA PULMONAR NO CARDIOGÉNICO - EPPN)'));
    assert.ok(sbarEs.includes('Soporte con CPAP/PEEP y oxígeno'));
    assert.ok(!sbarEs.includes('nombre del paciente'));
  });

  it('handles in-RAM state management, subscriptions, and state reset correctly', () => {
    resetPulmonaryState();
    let state = getPulmonaryState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.viewMode, 'community');
    assert.strictEqual(state.hasPinkFrothySputumHypoxemia, false);

    let notifyCount = 0;
    const unsub = subscribePulmonaryState((s) => {
      notifyCount++;
      assert.ok(s);
    });

    setPulmonaryState({ activeTab: 'syndromes', hasPinkFrothySputumHypoxemia: true });
    state = getPulmonaryState();
    assert.strictEqual(state.activeTab, 'syndromes');
    assert.strictEqual(state.hasPinkFrothySputumHypoxemia, true);
    assert.strictEqual(notifyCount, 1);

    resetPulmonaryState();
    state = getPulmonaryState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.hasPinkFrothySputumHypoxemia, false);
    assert.strictEqual(notifyCount, 2);

    unsub();
    setPulmonaryState({ activeTab: 'overdose' });
    assert.strictEqual(notifyCount, 2);
    resetPulmonaryState();
  });

  it('renders pulmonaryCareView DOM structure without errors', () => {
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

    resetPulmonaryState();
    const el = pulmonaryCareView();
    assert.ok(el);
    assert.strictEqual(el.tagName, 'DIV');
    assert.strictEqual(el.className, 'pulmonary-care-view');

    // Test tab switches
    setPulmonaryState({ activeTab: 'syndromes' });
    assert.strictEqual(getPulmonaryState().activeTab, 'syndromes');

    setPulmonaryState({ activeTab: 'overdose' });
    assert.strictEqual(getPulmonaryState().activeTab, 'overdose');

    setPulmonaryState({ activeTab: 'saferInhalation' });
    assert.strictEqual(getPulmonaryState().activeTab, 'saferInhalation');

    setPulmonaryState({ activeTab: 'harmReduction' });
    assert.strictEqual(getPulmonaryState().activeTab, 'harmReduction');

    resetPulmonaryState();
  });

  it('strictly adheres to zero-storage privacy and zero innerHTML security invariants', () => {
    const fileContent = fs.readFileSync('public/js/views/pulmonaryCare.js', 'utf8');
    assert.ok(!fileContent.includes('localStorage'), 'Must not access localStorage');
    assert.ok(!fileContent.includes('sessionStorage'), 'Must not access sessionStorage');
    assert.ok(!fileContent.includes('document.cookie'), 'Must not access cookies');
    assert.ok(!fileContent.includes('innerHTML'), 'Must not use innerHTML');
    assert.ok(!fileContent.includes('outerHTML'), 'Must not use outerHTML');
  });
});
