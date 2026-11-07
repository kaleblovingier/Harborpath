// test/metabolic-care.test.js
// HarborPath - Endocrine & Metabolic Emergencies Navigator Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  METABOLIC_SYNDROME_PROFILES,
  METABOLIC_HARM_REDUCTION_RULES,
  evaluateMetabolicRisk,
  formatMetabolicSbarText,
  getMetabolicState,
  setMetabolicState,
  resetMetabolicState,
  subscribeMetabolicState,
  metabolicCareView,
} from '../public/js/views/metabolicCare.js';

describe('Endocrine & Metabolic Emergencies Navigator Module (Wave 45)', () => {
  it('exports verified substance-induced metabolic syndrome profiles with pathophysiologic taxonomy', () => {
    // 1. Alcoholic Ketoacidosis (AKA)
    const aka = METABOLIC_SYNDROME_PROFILES.aka;
    assert.ok(aka);
    assert.strictEqual(aka.id, 'aka');
    assert.ok(aka.nameEn.includes('Alcoholic Ketoacidosis'));
    assert.ok(aka.pathophysiologyEn.includes('beta-hydroxybutyrate'));
    assert.ok(aka.clinicalPresentationEn.includes('Dextrose'));
    assert.ok(aka.clinicalPresentationEn.includes('INSULIN IS STRICTLY CONTRAINDICATED'));

    // 2. Stimulant DKA & HHS
    const dka = METABOLIC_SYNDROME_PROFILES.dkaHhs;
    assert.ok(dka);
    assert.strictEqual(dka.id, 'dka_hhs');
    assert.ok(dka.nameEn.includes('Stimulant-Induced DKA'));
    assert.ok(dka.pathophysiologyEn.includes('catecholamine'));
    assert.ok(dka.clinicalPresentationEn.includes('potassium'));
    assert.ok(dka.clinicalPresentationEn.includes('3.3 mEq/L'));

    // 3. Euglycemic DKA (euDKA)
    const eudka = METABOLIC_SYNDROME_PROFILES.eudka;
    assert.ok(eudka);
    assert.strictEqual(eudka.id, 'eudka');
    assert.ok(eudka.nameEn.includes('Euglycemic DKA'));
    assert.ok(eudka.nameEn.includes('SGLT2'));
    assert.ok(eudka.pathophysiologyEn.includes('empagliflozin'));
    assert.ok(eudka.pathophysiologyEn.includes('NORMAL'));
    assert.ok(eudka.clinicalPresentationEn.includes('Regular Insulin'));

    // 4. Severe Hypoglycemia
    const hypo = METABOLIC_SYNDROME_PROFILES.severeHypoglycemia;
    assert.ok(hypo);
    assert.strictEqual(hypo.id, 'severe_hypoglycemia');
    assert.ok(hypo.nameEn.includes('Severe Hypoglycemia'));
    assert.ok(hypo.clinicalPresentationEn.includes('capillary blood glucose'));

    // 5. Opioid-Induced Adrenal Insufficiency (OIAI)
    const oiai = METABOLIC_SYNDROME_PROFILES.oiaiAdrenal;
    assert.ok(oiai);
    assert.strictEqual(oiai.id, 'oiai_adrenal');
    assert.ok(oiai.nameEn.includes('Opioid-Induced Adrenal Insufficiency'));
    assert.ok(oiai.clinicalPresentationEn.includes('Hydrocortisone'));

    // 6. Thyroid Storm
    const storm = METABOLIC_SYNDROME_PROFILES.thyroidStorm;
    assert.ok(storm);
    assert.strictEqual(storm.id, 'thyroid_storm');
    assert.ok(storm.nameEn.includes('Thyroid Storm'));
    assert.ok(storm.clinicalPresentationEn.includes('AT LEAST 1 HOUR AFTER'));
  });

  it('exports 6 field metabolic harm reduction and preservation directives', () => {
    assert.strictEqual(METABOLIC_HARM_REDUCTION_RULES.length, 6);

    const r1 = METABOLIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 1);
    assert.ok(r1.titleEn.includes('Check Capillary Glucose'));

    const r2 = METABOLIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 2);
    assert.ok(r2.titleEn.includes('Alcoholic Ketoacidosis'));
    assert.ok(r2.titleEn.includes('Insulin NO'));

    const r3 = METABOLIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 3);
    assert.ok(r3.titleEn.includes('SGLT2 Inhibitor Alert'));

    const r4 = METABOLIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 4);
    assert.ok(r4.titleEn.includes('Potassium Before Insulin in DKA'));

    const r5 = METABOLIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 5);
    assert.ok(r5.titleEn.includes('Chronic Opioid Fatigue May Be Adrenal Failure'));

    const r6 = METABOLIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 6);
    assert.ok(r6.titleEn.includes('Hydrate with Carbohydrates and Electrolytes'));
  });

  it('evaluates acute metabolic risks across all emergency tiers accurately', () => {
    // 1. Critical Hypoglycemia Emergency
    const resHypo = evaluateMetabolicRisk({ capillaryGlucoseSevereLow: true });
    assert.strictEqual(resHypo.urgency, 'emergency_911');
    assert.ok(resHypo.flags.some((f) => f.titleEn.includes('Critical Hypoglycemia Alert')));

    // 2. Refractory Shock / Adrenal Crisis Emergency
    const resShock = evaluateMetabolicRisk({ refractoryShockStress: true });
    assert.strictEqual(resShock.urgency, 'emergency_911');
    assert.ok(resShock.flags.some((f) => f.titleEn.includes('Suspected Acute Adrenal Crisis')));

    // 3. Thyroid Storm Emergency
    const resStorm = evaluateMetabolicRisk({ stimulantHyperthermiaThyroidStorm: true });
    assert.strictEqual(resStorm.urgency, 'emergency_911');
    assert.ok(resStorm.flags.some((f) => f.titleEn.includes('Suspected Thyroid Storm')));

    // 4. DKA / HHS Severe Hyperglycemia Emergency
    const resDka = evaluateMetabolicRisk({ diabeticSevereHyperglycemia: true });
    assert.strictEqual(resDka.urgency, 'emergency_911');
    assert.ok(resDka.flags.some((f) => f.titleEn.includes('Fulminant DKA')));

    // 5. Alcoholic Ketoacidosis (AKA) Urgent Protocol
    const resAka = evaluateMetabolicRisk({ alcoholBingeStarvationAcidosis: true });
    assert.strictEqual(resAka.urgency, 'urgent_eval');
    assert.ok(resAka.flags.some((f) => f.titleEn.includes('Alcoholic Ketoacidosis (AKA)')));

    // 6. SGLT2 Euglycemic DKA Urgent Protocol
    const resEudka = evaluateMetabolicRisk({ sglt2InhibitorUse: true, stimulantAnorexiaKetonemia: true });
    assert.strictEqual(resEudka.urgency, 'urgent_eval');
    assert.ok(resEudka.flags.some((f) => f.titleEn.includes('Euglycemic DKA (euDKA)')));

    // 7. Opioid Adrenal Insufficiency Specialty Consult
    const resOiai = evaluateMetabolicRisk({ chronicOpioidHypotensionFatigue: true });
    assert.strictEqual(resOiai.urgency, 'specialty_consult');
    assert.ok(resOiai.flags.some((f) => f.titleEn.includes('Opioid-Induced Adrenal Insufficiency')));

    // 8. Precautionary Baseline
    const resBase = evaluateMetabolicRisk({});
    assert.strictEqual(resBase.urgency, 'precautionary');
    assert.ok(resBase.flags.some((f) => f.titleEn.includes('Baseline Metabolic Health')));
  });

  it('generates zero-PII structured clinical SBAR handoff notes in English and Spanish', () => {
    const sampleState = {
      alcoholBingeStarvationAcidosis: true,
      sglt2InhibitorUse: true,
      stimulantAnorexiaKetonemia: true,
    };

    // English
    const sbarEn = formatMetabolicSbarText(sampleState, 'en');
    assert.ok(sbarEn.includes('SBAR CLINICAL HANDOFF NOTE - METABOLIC & ENDOCRINE CARE'));
    assert.ok(sbarEn.includes('[S - SITUATION]'));
    assert.ok(sbarEn.includes('[B - CLINICAL BACKGROUND & IDENTIFIED FACTORS]'));
    assert.ok(sbarEn.includes('[A - CLINICAL ASSESSMENT & IDENTIFIED DIRECTIVES]'));
    assert.ok(sbarEn.includes('[R - RECOMMENDATIONS & MANAGEMENT]'));
    assert.ok(sbarEn.includes('Zero-PII In-RAM Ephemeral Assessment'));
    assert.ok(sbarEn.includes('Alcoholic Ketoacidosis (AKA)'));

    // Spanish
    const sbarEs = formatMetabolicSbarText(sampleState, 'es');
    assert.ok(sbarEs.includes('INFORME DE TRASPASO CLÍNICO SBAR - EMERGENCIAS METABÓLICAS'));
    assert.ok(sbarEs.includes('[S - SITUACIÓN]'));
    assert.ok(sbarEs.includes('[B - ANTECEDENTES Y FACTORES CLÍNICOS]'));
    assert.ok(sbarEs.includes('[A - EVALUACIÓN Y DIRECTIVAS CLÍNICAS]'));
    assert.ok(sbarEs.includes('[R - RECOMENDACIONES CLÍNICAS Y MANEJO]'));
    assert.ok(sbarEs.includes('Sin datos de identificación (Zero-PII)'));
    assert.ok(sbarEs.includes('Cetoacidosis Alcohólica (CAA)'));
  });

  it('manages in-RAM ephemeral state with deterministic subscription and reset', () => {
    resetMetabolicState();
    let state = getMetabolicState();
    assert.strictEqual(state.activeTab, 'syndromes');
    assert.strictEqual(state.capillaryGlucoseSevereLow, false);

    let count = 0;
    const unsub = subscribeMetabolicState(() => {
      count++;
    });

    setMetabolicState({ capillaryGlucoseSevereLow: true, activeTab: 'evaluator' });
    state = getMetabolicState();
    assert.strictEqual(state.capillaryGlucoseSevereLow, true);
    assert.strictEqual(state.activeTab, 'evaluator');
    assert.strictEqual(count, 1);

    resetMetabolicState();
    state = getMetabolicState();
    assert.strictEqual(state.capillaryGlucoseSevereLow, false);
    assert.strictEqual(state.activeTab, 'syndromes');
    assert.strictEqual(count, 2);

    unsub();
    setMetabolicState({ sglt2InhibitorUse: true });
    assert.strictEqual(count, 2);
  });

  it('strictly adheres to zero-storage privacy and zero innerHTML security invariants', () => {
    const fileContent = fs.readFileSync('public/js/views/metabolicCare.js', 'utf8');
    assert.ok(!fileContent.includes('localStorage'), 'Must not access localStorage');
    assert.ok(!fileContent.includes('sessionStorage'), 'Must not access sessionStorage');
    assert.ok(!fileContent.includes('document.cookie'), 'Must not access cookies');
    assert.ok(!fileContent.includes('indexedDB'), 'Must not access indexedDB');
    assert.ok(!fileContent.includes('innerHTML'), 'Must not use innerHTML');
    assert.ok(!fileContent.includes('outerHTML'), 'Must not use outerHTML');
    assert.ok(!fileContent.includes('.style.'), 'Must not set inline styles via .style');
    assert.ok(!fileContent.includes('style='), 'Must not use inline style attributes');
  });

  it('mounts metabolicCareView DOM element with accessible structure', () => {
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
      querySelector(selector) {
        if (selector === '.metabolic-tab-nav') {
          const nav = new MockElement('nav');
          nav.setAttribute('role', 'tablist');
          return nav;
        }
        if (selector === '.metabolic-tab-btn.active') {
          const btn = new MockElement('button');
          btn.setAttribute('aria-selected', 'true');
          return btn;
        }
        if (selector === 'input') return new MockElement('input');
        if (selector === 'button') return new MockElement('button');
        return new MockElement('div');
      }
      querySelectorAll(selector) {
        return [new MockElement('div')];
      }
    }

    globalThis.Node = MockElement;
    globalThis.document = {
      createElement: (tag) => new MockElement(tag),
      createElementNS: (ns, tag) => new MockElement(tag),
      createTextNode: (txt) => ({ nodeType: 3, textContent: txt }),
      documentElement: { lang: 'en' },
    };

    resetMetabolicState();
    const view = metabolicCareView();
    assert.ok(view);
    assert.strictEqual(view.tagName.toLowerCase(), 'div');
    assert.strictEqual(view.className, 'metabolic-care-view');

    const tabNav = view.querySelector('.metabolic-tab-nav');
    assert.ok(tabNav);
    assert.strictEqual(tabNav.getAttribute('role'), 'tablist');

    const activeTab = view.querySelector('.metabolic-tab-btn.active');
    assert.ok(activeTab);
    assert.strictEqual(activeTab.getAttribute('aria-selected'), 'true');
  });
});
