// test/endocarditis-care.test.js
// HarborPath - Infective Endocarditis (IE), Valve Destruction, Septic Emboli & POET Protocol Navigator Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  ENDOCARDITIS_VALVE_PROFILES,
  DUKE_CRITERIA_STANDARDS,
  SURGICAL_INDICATIONS_CONSENSUS,
  ANTIMICROBIAL_STRATEGIES,
  ENDOCARDITIS_HARM_REDUCTION_RULES,
  evaluateEndocarditisRisk,
  buildEndocarditisSbarText,
  getEndocarditisState,
  setEndocarditisState,
  resetEndocarditisState,
  subscribeEndocarditisState,
  endocarditisCareView,
} from '../public/js/views/endocarditisCare.js';

describe('Infective Endocarditis & Cardiac Valve Navigator Module (Wave 41)', () => {
  it('exports accurate anatomical & clinical divergence for right-sided vs left-sided endocarditis', () => {
    // 1. Right-Sided (Tricuspid)
    const tri = ENDOCARDITIS_VALVE_PROFILES.rightSidedTricuspid;
    assert.ok(tri, 'Missing right-sided tricuspid profile');
    assert.strictEqual(tri.id, 'right_sided_tricuspid');
    assert.ok(tri.pathophysiologyEn.includes('micro-abrasions'));
    assert.ok(tri.pathophysiologyEn.includes('Staphylococcus aureus'));
    assert.ok(tri.clinicalPresentationEn.includes('Septic Pulmonary Emboli'));
    assert.ok(tri.clinicalPresentationEn.includes('pleuritic chest pain'));
    assert.ok(tri.clinicalPresentationEn.includes('hemoptysis'));
    assert.ok(tri.clinicalPresentationEn.includes('cavitary nodules'));

    // 2. Left-Sided (Aortic/Mitral)
    const lft = ENDOCARDITIS_VALVE_PROFILES.leftSidedAorticMitral;
    assert.ok(lft, 'Missing left-sided aortic/mitral profile');
    assert.strictEqual(lft.id, 'left_sided_aortic_mitral');
    assert.ok(lft.pathophysiologyEn.includes('Perivalvular Ring Abscess'));
    assert.ok(lft.clinicalPresentationEn.includes('Janeway lesions'));
    assert.ok(lft.clinicalPresentationEn.includes('Osler nodes'));
    assert.ok(lft.clinicalPresentationEn.includes('Roth spots'));
    assert.ok(lft.clinicalPresentationEn.includes('PR interval prolongation'));
    assert.ok(lft.clinicalPresentationEn.includes('complete heart block'));
  });

  it('exports verified 2023 Duke-ISCVID criteria and cardinal blood culture rules', () => {
    assert.ok(DUKE_CRITERIA_STANDARDS.bloodCultureRuleEn.includes('3 sets of blood cultures'));
    assert.ok(DUKE_CRITERIA_STANDARDS.bloodCultureRuleEn.includes('30–60 minutes'));
    assert.ok(DUKE_CRITERIA_STANDARDS.bloodCultureRuleEn.includes('BEFORE starting antimicrobial therapy'));
    assert.ok(DUKE_CRITERIA_STANDARDS.bloodCultureRuleEn.includes('culture-negative endocarditis in > 50%'));

    assert.ok(DUKE_CRITERIA_STANDARDS.echoGuidanceEn.includes('Transthoracic Echocardiogram (TTE)'));
    assert.ok(DUKE_CRITERIA_STANDARDS.echoGuidanceEn.includes('Transesophageal Echocardiogram (TEE)'));
    assert.ok(DUKE_CRITERIA_STANDARDS.echoGuidanceEn.includes('> 90–95%'));

    assert.ok(Array.isArray(DUKE_CRITERIA_STANDARDS.majorCriteriaEn));
    assert.strictEqual(DUKE_CRITERIA_STANDARDS.majorCriteriaEn.length, 2);
    assert.ok(Array.isArray(DUKE_CRITERIA_STANDARDS.minorCriteriaEn));
    assert.strictEqual(DUKE_CRITERIA_STANDARDS.minorCriteriaEn.length, 5);
  });

  it('exports cardiothoracic surgical indications and AHA/ACC ethical harm reduction consensus', () => {
    assert.ok(Array.isArray(SURGICAL_INDICATIONS_CONSENSUS.indicationsEn));
    assert.ok(SURGICAL_INDICATIONS_CONSENSUS.indicationsEn.length >= 4);

    const heartFailure = SURGICAL_INDICATIONS_CONSENSUS.indicationsEn.find((i) => i.includes('Hemodynamic Collapse'));
    assert.ok(heartFailure);

    const rootAbscess = SURGICAL_INDICATIONS_CONSENSUS.indicationsEn.find((i) => i.includes('Aortic ring abscess'));
    assert.ok(rootAbscess);

    // Ethical Directive
    assert.ok(SURGICAL_INDICATIONS_CONSENSUS.ethicalDirectiveEn.includes('solely on the basis of a patient’s current or past injection drug use'));
    assert.ok(SURGICAL_INDICATIONS_CONSENSUS.ethicalDirectiveEn.includes('medically and ethically unjustifiable'));
    assert.ok(SURGICAL_INDICATIONS_CONSENSUS.ethicalDirectiveEn.includes('MOUD (buprenorphine or methadone)'));
  });

  it('exports antimicrobial strategies including IV traditional, POET oral step-down, and Dalbavancin', () => {
    assert.ok(ANTIMICROBIAL_STRATEGIES.ivTraditionalEn.includes('4–6 Weeks'));
    assert.ok(ANTIMICROBIAL_STRATEGIES.ivTraditionalEn.includes('PICC line'));

    assert.ok(ANTIMICROBIAL_STRATEGIES.poetOralStepDownEn.includes('POET TRIAL ORAL STEP-DOWN'));
    assert.ok(ANTIMICROBIAL_STRATEGIES.poetOralStepDownEn.includes('afebrile for >= 7 days'));
    assert.ok(ANTIMICROBIAL_STRATEGIES.poetOralStepDownEn.includes('non-inferior'));

    assert.ok(ANTIMICROBIAL_STRATEGIES.dalbavancinStrategyEn.includes('DALBAVANCIN'));
    assert.ok(ANTIMICROBIAL_STRATEGIES.dalbavancinStrategyEn.includes('1,500 mg IV infusion'));
  });

  it('exports 6 field harm reduction rules for heart valve preservation', () => {
    assert.strictEqual(ENDOCARDITIS_HARM_REDUCTION_RULES.length, 6);

    const r1 = ENDOCARDITIS_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 1);
    assert.ok(r1.titleEn.includes('Three Blood Culture Sets BEFORE Antibiotics'));

    const r2 = ENDOCARDITIS_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 2);
    assert.ok(r2.titleEn.includes('Septic Pulmonary Emboli Cough Triad'));

    const r3 = ENDOCARDITIS_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 3);
    assert.ok(r3.titleEn.includes('Never Lick Needles'));

    const r4 = ENDOCARDITIS_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 4);
    assert.ok(r4.titleEn.includes('0.22-Micron Wheel Filters'));

    const r5 = ENDOCARDITIS_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 5);
    assert.ok(r5.titleEn.includes('PR Interval Lengthening'));

    const r6 = ENDOCARDITIS_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 6);
    assert.ok(r6.titleEn.includes('Right to Valve Surgery'));
  });

  it('evaluates endocarditis risk scenarios accurately across all clinical tiers', () => {
    // 1. Surgical Emergency: PR prolongation / Heart Block
    const resSurg = evaluateEndocarditisRisk({
      hasPrProlongationHeartBlock: true,
      hasPleuriticChestPainHemoptysis: false,
      hasNewMurmurOrHeartFailure: false,
      hasJanewayOslerRothSpots: false,
      hasPersistentFeverBacteremia: false,
      hasLargeVegetationOver10mm: false,
      isAtRiskOfLeavingAmaNoPicc: false,
    });
    assert.strictEqual(resSurg.tier, 'emergency_cardiothoracic_surgical');
    assert.strictEqual(resSurg.isEmergency, true);
    assert.ok(resSurg.actionEn.includes('CARDIOTHORACIC SURGICAL CONSULT REQUIRED'));
    assert.ok(resSurg.actionEn.includes('aortic root abscess'));

    // 2. Septic Pulmonary Emboli (Tricuspid IE)
    const resEmb = evaluateEndocarditisRisk({
      hasPrProlongationHeartBlock: false,
      hasPleuriticChestPainHemoptysis: true,
      hasNewMurmurOrHeartFailure: false,
      hasJanewayOslerRothSpots: false,
      hasPersistentFeverBacteremia: false,
      hasLargeVegetationOver10mm: false,
      isAtRiskOfLeavingAmaNoPicc: false,
    });
    assert.strictEqual(resEmb.tier, 'emergency_septic_pulmonary_emboli');
    assert.strictEqual(resEmb.isEmergency, true);
    assert.ok(resEmb.actionEn.includes('Tricuspid Valve'));
    assert.ok(resEmb.actionEn.includes('Septic Pulmonary Emboli'));
    assert.ok(resEmb.actionEn.includes('3 sets of blood cultures'));

    // 3. Left-Sided Systemic Emboli (Janeway/Osler)
    const resJan = evaluateEndocarditisRisk({
      hasPrProlongationHeartBlock: false,
      hasPleuriticChestPainHemoptysis: false,
      hasNewMurmurOrHeartFailure: false,
      hasJanewayOslerRothSpots: true,
      hasPersistentFeverBacteremia: false,
      hasLargeVegetationOver10mm: false,
      isAtRiskOfLeavingAmaNoPicc: false,
    });
    assert.strictEqual(resJan.tier, 'urgent_left_sided_embolic');
    assert.strictEqual(resJan.isEmergency, true);
    assert.ok(resJan.actionEn.includes('Janeway lesions'));
    assert.ok(resJan.actionEn.includes('Osler nodes'));

    // 4. Persistent Bacteremia / Large Vegetation
    const resBact = evaluateEndocarditisRisk({
      hasPrProlongationHeartBlock: false,
      hasPleuriticChestPainHemoptysis: false,
      hasNewMurmurOrHeartFailure: false,
      hasJanewayOslerRothSpots: false,
      hasPersistentFeverBacteremia: true,
      hasLargeVegetationOver10mm: false,
      isAtRiskOfLeavingAmaNoPicc: false,
    });
    assert.strictEqual(resBact.tier, 'urgent_persistent_bacteremia');
    assert.strictEqual(resBact.isEmergency, true);
    assert.ok(resBact.actionEn.includes('Persistent bacteremia'));

    // 5. POET Protocol / Dalbavancin for AMA / PICC-infeasible
    const resPoet = evaluateEndocarditisRisk({
      hasPrProlongationHeartBlock: false,
      hasPleuriticChestPainHemoptysis: false,
      hasNewMurmurOrHeartFailure: false,
      hasJanewayOslerRothSpots: false,
      hasPersistentFeverBacteremia: false,
      hasLargeVegetationOver10mm: false,
      isAtRiskOfLeavingAmaNoPicc: true,
    });
    assert.strictEqual(resPoet.tier, 'harm_reduction_poet_dalbavancin');
    assert.strictEqual(resPoet.isEmergency, false);
    assert.ok(resPoet.actionEn.includes('POET trial'));
    assert.ok(resPoet.actionEn.includes('Dalbavancin'));

    // 6. Standard Prevention
    const resStd = evaluateEndocarditisRisk({
      hasPrProlongationHeartBlock: false,
      hasPleuriticChestPainHemoptysis: false,
      hasNewMurmurOrHeartFailure: false,
      hasJanewayOslerRothSpots: false,
      hasPersistentFeverBacteremia: false,
      hasLargeVegetationOver10mm: false,
      isAtRiskOfLeavingAmaNoPicc: false,
    });
    assert.strictEqual(resStd.tier, 'standard_endocarditis_prevention');
    assert.strictEqual(resStd.isEmergency, false);
    assert.ok(resStd.actionEn.includes('0.22-micron wheel filters'));
  });

  it('generates zero-PII SBAR clinical handoff note in English and Spanish', () => {
    const state = {
      hasPrProlongationHeartBlock: true,
      hasPleuriticChestPainHemoptysis: true,
      hasJanewayOslerRothSpots: false,
      hasNewMurmurOrHeartFailure: false,
      hasPersistentFeverBacteremia: true,
      hasLargeVegetationOver10mm: true,
      isAtRiskOfLeavingAmaNoPicc: false,
    };
    const evalResult = evaluateEndocarditisRisk(state);

    // English SBAR
    const sbarEn = buildEndocarditisSbarText(state, evalResult, 'en');
    assert.ok(sbarEn.includes('INFECTIVE ENDOCARDITIS & CARDIAC VALVE CLINICAL SBAR HANDOFF NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / CARDIOVASCULAR & INJECTION RISK FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & CARDIOTHORACIC MANAGEMENT):'));
    assert.ok(sbarEn.includes('YES (EMERGENT SURGICAL RED FLAG - AORTIC ROOT EXTENSION)'));
    assert.ok(sbarEn.includes('Obtain at least 3 sets of blood cultures'));
    assert.ok(sbarEn.includes('Transesophageal Echocardiogram (TEE)'));
    assert.ok(!sbarEn.includes('patient name'));

    // Spanish SBAR
    const sbarEs = buildEndocarditisSbarText(state, evalResult, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: EVALUACIÓN DE ENDOCARDITIS INFECCIOSA (CERO PII)'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES DE RIESGO CARDIOVASCULARES Y DE INYECCIÓN):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y GESTIÓN CARDIOTORÁCICA):'));
    assert.ok(sbarEs.includes('SÍ (URGENCIA QUIRÚRGICA - EXTENSIÓN PERIVALVULAR)'));
    assert.ok(sbarEs.includes('Extraer al menos 3 juegos de hemocultivos'));
    assert.ok(!sbarEs.includes('nombre del paciente'));
  });

  it('handles in-RAM state management, subscriptions, and state reset correctly', () => {
    resetEndocarditisState();
    let state = getEndocarditisState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.viewMode, 'community');
    assert.strictEqual(state.hasPrProlongationHeartBlock, false);

    let notifyCount = 0;
    const unsub = subscribeEndocarditisState((s) => {
      notifyCount++;
      assert.ok(s);
    });

    setEndocarditisState({ activeTab: 'valves', hasPleuriticChestPainHemoptysis: true });
    state = getEndocarditisState();
    assert.strictEqual(state.activeTab, 'valves');
    assert.strictEqual(state.hasPleuriticChestPainHemoptysis, true);
    assert.strictEqual(notifyCount, 1);

    resetEndocarditisState();
    state = getEndocarditisState();
    assert.strictEqual(state.activeTab, 'triage');
    assert.strictEqual(state.hasPleuriticChestPainHemoptysis, false);
    assert.strictEqual(notifyCount, 2);

    unsub();
    setEndocarditisState({ activeTab: 'duke' });
    assert.strictEqual(notifyCount, 2);
    resetEndocarditisState();
  });

  it('renders endocarditisCareView DOM structure without errors', () => {
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

    resetEndocarditisState();
    const el = endocarditisCareView();
    assert.ok(el);
    assert.strictEqual(el.tagName, 'DIV');
    assert.strictEqual(el.className, 'endocarditis-care-view');

    // Test tab switching
    setEndocarditisState({ activeTab: 'valves' });
    assert.strictEqual(getEndocarditisState().activeTab, 'valves');

    setEndocarditisState({ activeTab: 'duke' });
    assert.strictEqual(getEndocarditisState().activeTab, 'duke');

    setEndocarditisState({ activeTab: 'surgery' });
    assert.strictEqual(getEndocarditisState().activeTab, 'surgery');

    setEndocarditisState({ activeTab: 'harmReduction' });
    assert.strictEqual(getEndocarditisState().activeTab, 'harmReduction');

    resetEndocarditisState();
  });

  it('strictly adheres to zero-storage privacy and zero innerHTML security invariants', () => {
    const fileContent = fs.readFileSync('public/js/views/endocarditisCare.js', 'utf8');
    assert.ok(!fileContent.includes('localStorage'), 'Must not access localStorage');
    assert.ok(!fileContent.includes('sessionStorage'), 'Must not access sessionStorage');
    assert.ok(!fileContent.includes('document.cookie'), 'Must not access cookies');
    assert.ok(!fileContent.includes('innerHTML'), 'Must not use innerHTML');
    assert.ok(!fileContent.includes('outerHTML'), 'Must not use outerHTML');
  });
});
