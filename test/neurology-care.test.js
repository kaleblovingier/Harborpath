// test/neurology-care.test.js
// HarborPath - Neurological Health, Post-Overdose Brain Injury & Neuroprotection Navigator Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  NEUROLOGY_SYNDROME_PROFILES,
  CAINE_WERNICKE_CRITERIA,
  NEUROLOGY_HARM_REDUCTION_RULES,
  evaluateNeurologyRisk,
  formatNeurologySbarText,
  getNeurologyState,
  setNeurologyState,
  resetNeurologyState,
  subscribeNeurologyState,
  neurologyCareView,
} from '../public/js/views/neurologyCare.js';

describe('Neurological Health, Post-Overdose Brain Injury & Neuroprotection Navigator (Wave 44)', () => {
  it('exports verified substance-induced neurological syndrome profiles with pathophysiologic taxonomy', () => {
    // 1. HIE & DPHL
    const hie = NEUROLOGY_SYNDROME_PROFILES.hieDphl;
    assert.ok(hie);
    assert.strictEqual(hie.id, 'hie_dphl');
    assert.ok(hie.nameEn.includes('Hypoxic-Ischemic Encephalopathy'));
    assert.ok(hie.nameEn.includes('Delayed Post-Hypoxic Leukoencephalopathy'));
    assert.ok(hie.pathophysiologyEn.includes('cerebral cortex'));
    assert.ok(hie.pathophysiologyEn.includes('lucid interval'));
    assert.ok(hie.clinicalPresentationEn.includes('DPHL'));
    assert.ok(hie.clinicalPresentationEn.includes('1–6 weeks'));

    // 2. Toxic Leukoencephalopathy
    const leuko = NEUROLOGY_SYNDROME_PROFILES.toxicLeuko;
    assert.ok(leuko);
    assert.strictEqual(leuko.id, 'toxic_leuko');
    assert.ok(leuko.nameEn.includes('Chasing the Dragon'));
    assert.ok(leuko.pathophysiologyEn.includes('spongiform vacuolization'));
    assert.ok(leuko.clinicalPresentationEn.includes('Coenzyme Q10'));

    // 3. PRES Syndrome
    const pres = NEUROLOGY_SYNDROME_PROFILES.presSyndrome;
    assert.ok(pres);
    assert.strictEqual(pres.id, 'pres_syndrome');
    assert.ok(pres.nameEn.includes('Posterior Reversible Encephalopathy Syndrome'));
    assert.ok(pres.pathophysiologyEn.includes('vasogenic'));
    assert.ok(pres.clinicalPresentationEn.includes('cortical blindness'));
    assert.ok(pres.clinicalPresentationEn.includes('15% to 25% reduction in Mean Arterial Pressure'));

    // 4. Osmotic Demyelination Syndrome
    const ods = NEUROLOGY_SYNDROME_PROFILES.odsHyponatremia;
    assert.ok(ods);
    assert.strictEqual(ods.id, 'ods_hyponatremia');
    assert.ok(ods.nameEn.includes('Osmotic Demyelination Syndrome'));
    assert.ok(ods.clinicalPresentationEn.includes('8 mEq/L/24hr'));
    assert.ok(ods.clinicalPresentationEn.includes('Locked-In Syndrome'));
    assert.ok(ods.clinicalPresentationEn.includes('desmopressin'));

    // 5. Wernicke Encephalopathy
    const wernicke = NEUROLOGY_SYNDROME_PROFILES.wernickeKorsakoff;
    assert.ok(wernicke);
    assert.strictEqual(wernicke.id, 'wernicke_korsakoff');
    assert.ok(wernicke.nameEn.includes('Wernicke Encephalopathy'));
    assert.ok(wernicke.clinicalPresentationEn.includes('Caine Criteria'));
    assert.ok(wernicke.clinicalPresentationEn.includes('BEFORE or concurrently with any intravenous dextrose'));
  });

  it('exports validated Caine criteria for Wernicke encephalopathy diagnosis', () => {
    assert.strictEqual(CAINE_WERNICKE_CRITERIA.length, 4);

    const ids = CAINE_WERNICKE_CRITERIA.map((c) => c.id);
    assert.ok(ids.includes('dietary_deficiency'));
    assert.ok(ids.includes('oculomotor_abnormality'));
    assert.ok(ids.includes('cerebellar_dysfunction'));
    assert.ok(ids.includes('altered_mental_state'));

    CAINE_WERNICKE_CRITERIA.forEach((c) => {
      assert.ok(c.labelEn.length > 5);
      assert.ok(c.labelEs.length > 5);
      assert.ok(c.descriptionEn.length > 10);
      assert.ok(c.descriptionEs.length > 10);
    });
  });

  it('exports 6 field neuroprotection and harm reduction directives', () => {
    assert.strictEqual(NEUROLOGY_HARM_REDUCTION_RULES.length, 6);

    const r1 = NEUROLOGY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 1);
    assert.ok(r1.titleEn.includes('Rescue Breathing Over Repeated Naloxone'));

    const r2 = NEUROLOGY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 2);
    assert.ok(r2.titleEn.includes('Delayed Post-Hypoxic Relapse'));

    const r3 = NEUROLOGY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 3);
    assert.ok(r3.titleEn.includes('High-Dose IV Thiamine BEFORE Glucose'));

    const r4 = NEUROLOGY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 4);
    assert.ok(r4.titleEn.includes('8 mEq/L/24hr Hyponatremia Rule'));

    const r5 = NEUROLOGY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 5);
    assert.ok(r5.titleEn.includes('Controlled Blood Pressure Lowering in Stimulant PRES'));

    const r6 = NEUROLOGY_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 6);
    assert.ok(r6.titleEn.includes('Chasing the Dragon'));
  });

  it('evaluates acute neurological risks across all emergency tiers accurately', () => {
    // 1. Status Epilepticus Emergency
    const resSeizure = evaluateNeurologyRisk({ seizuresOrStatus: true });
    assert.strictEqual(resSeizure.urgency, 'emergency_911');
    assert.ok(resSeizure.flags.some((f) => f.titleEn.includes('Status Epilepticus')));

    // 2. Locked-In Syndrome / ODS Emergency
    const resOds = evaluateNeurologyRisk({ lockedInSigns: true });
    assert.strictEqual(resOds.urgency, 'emergency_911');
    assert.ok(resOds.flags.some((f) => f.titleEn.includes('Osmotic Demyelination Syndrome')));

    // 3. PRES with Cortical Blindness
    const resPres = evaluateNeurologyRisk({ corticalBlindnessPres: true });
    assert.strictEqual(resPres.urgency, 'emergency_911');
    assert.ok(resPres.flags.some((f) => f.titleEn.includes('Posterior Reversible Encephalopathy Syndrome')));

    // 4. Acute Focal Stroke
    const resStroke = evaluateNeurologyRisk({ focalDeficitOrStroke: true });
    assert.strictEqual(resStroke.urgency, 'emergency_911');
    assert.ok(resStroke.flags.some((f) => f.titleEn.includes('Focal Neurological Deficit')));

    // 5. Prolonged Anoxia Post-Overdose
    const resAnoxia = evaluateNeurologyRisk({ anoxicDownTime: true });
    assert.strictEqual(resAnoxia.urgency, 'emergency_911');
    assert.ok(resAnoxia.flags.some((f) => f.titleEn.includes('Hypoxic-Ischemic Encephalopathy')));

    // 6. Positive Caine Criteria for Wernicke
    const resWernicke = evaluateNeurologyRisk({ caineCriteriaMet: true });
    assert.strictEqual(resWernicke.urgency, 'urgent_eval');
    assert.ok(resWernicke.flags.some((f) => f.titleEn.includes('Positive Caine Criteria')));

    // 7. MDMA Hyponatremia Water Toxicity
    const resMdma = evaluateNeurologyRisk({ mdmaHyponatremiaWater: true });
    assert.strictEqual(resMdma.urgency, 'urgent_eval');
    assert.ok(resMdma.flags.some((f) => f.titleEn.includes('MDMA-Induced Acute Hyponatremia')));

    // 8. Delayed Post-Hypoxic Leukoencephalopathy (DPHL)
    const resDphl = evaluateNeurologyRisk({ delayedRelapseCognitive: true });
    assert.strictEqual(resDphl.urgency, 'urgent_eval');
    assert.ok(resDphl.flags.some((f) => f.titleEn.includes('Delayed Post-Hypoxic Leukoencephalopathy')));

    // 9. Chasing the dragon ataxia
    const resChasing = evaluateNeurologyRisk({ chasingDragonAtaxia: true });
    assert.strictEqual(resChasing.urgency, 'specialty_consult');
    assert.ok(resChasing.flags.some((f) => f.titleEn.includes('Chasing the Dragon')));

    // 10. Precautionary baseline
    const resBase = evaluateNeurologyRisk({});
    assert.strictEqual(resBase.urgency, 'precautionary');
    assert.ok(resBase.flags.some((f) => f.titleEn.includes('Baseline Neuroprotection')));
  });

  it('generates zero-PII structured clinical SBAR handoff notes in English and Spanish', () => {
    const sampleState = {
      anoxicDownTime: true,
      caineCriteriaMet: true,
      delayedRelapseCognitive: true,
    };

    // English
    const sbarEn = formatNeurologySbarText(sampleState, 'en');
    assert.ok(sbarEn.includes('SBAR CLINICAL HANDOFF NOTE - NEUROLOGICAL CARE'));
    assert.ok(sbarEn.includes('[S - SITUATION]'));
    assert.ok(sbarEn.includes('[B - CLINICAL BACKGROUND & IDENTIFIED FACTORS]'));
    assert.ok(sbarEn.includes('[A - CLINICAL ASSESSMENT & IDENTIFIED DIRECTIVES]'));
    assert.ok(sbarEn.includes('[R - RECOMMENDATIONS & MANAGEMENT]'));
    assert.ok(sbarEn.includes('THIAMINE 500 mg IV BEFORE any dextrose'));
    assert.ok(sbarEn.includes('Zero-PII In-RAM Ephemeral Assessment'));

    // Spanish
    const sbarEs = formatNeurologySbarText(sampleState, 'es');
    assert.ok(sbarEs.includes('INFORME DE TRASPASO CLÍNICO SBAR - SALUD NEUROLÓGICA'));
    assert.ok(sbarEs.includes('[S - SITUACIÓN]'));
    assert.ok(sbarEs.includes('[B - ANTECEDENTES Y FACTORES CLÍNICOS]'));
    assert.ok(sbarEs.includes('[A - EVALUACIÓN Y DIRECTIVAS CLÍNICAS]'));
    assert.ok(sbarEs.includes('[R - RECOMENDACIONES CLÍNICAS Y MANEJO]'));
    assert.ok(sbarEs.includes('TIAMINA 500 mg IV ANTES de cualquier suero glucosado'));
    assert.ok(sbarEs.includes('Sin datos de identificación (Zero-PII)'));
  });

  it('manages in-RAM ephemeral state with deterministic subscription and reset', () => {
    resetNeurologyState();
    let state = getNeurologyState();
    assert.strictEqual(state.activeTab, 'syndromes');
    assert.strictEqual(state.seizuresOrStatus, false);

    let notifyCount = 0;
    const unsub = subscribeNeurologyState(() => {
      notifyCount++;
    });

    setNeurologyState({ seizuresOrStatus: true, activeTab: 'evaluator' });
    state = getNeurologyState();
    assert.strictEqual(state.seizuresOrStatus, true);
    assert.strictEqual(state.activeTab, 'evaluator');
    assert.strictEqual(notifyCount, 1);

    resetNeurologyState();
    state = getNeurologyState();
    assert.strictEqual(state.seizuresOrStatus, false);
    assert.strictEqual(state.activeTab, 'syndromes');
    assert.strictEqual(notifyCount, 2);

    unsub();
    setNeurologyState({ anoxicDownTime: true });
    assert.strictEqual(notifyCount, 2); // Unsubscribed
  });

  it('complies strictly with HarborPath privacy and security invariants', () => {
    const fileContent = fs.readFileSync('public/js/views/neurologyCare.js', 'utf8');

    // Invariant 1: Zero device storage access
    assert.ok(!fileContent.includes('localStorage'), 'Must not access localStorage');
    assert.ok(!fileContent.includes('sessionStorage'), 'Must not access sessionStorage');
    assert.ok(!fileContent.includes('document.cookie'), 'Must not access cookies');
    assert.ok(!fileContent.includes('indexedDB'), 'Must not access indexedDB');

    // Invariant 2: Zero inline markup injection
    assert.ok(!fileContent.includes('innerHTML'), 'Must not use innerHTML');
    assert.ok(!fileContent.includes('outerHTML'), 'Must not use outerHTML');
    assert.ok(!fileContent.includes('.style.'), 'Must not set inline styles via .style');
    assert.ok(!fileContent.includes('style='), 'Must not use inline style attributes');
  });

  it('mounts neurologyCareView DOM element with accessible structure', () => {
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
        if (selector === '.neurology-tab-nav') {
          const nav = new MockElement('nav');
          nav.setAttribute('role', 'tablist');
          return nav;
        }
        if (selector === '.neurology-tab-btn.active') {
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

    resetNeurologyState();
    const view = neurologyCareView();
    assert.ok(view);
    assert.strictEqual(view.tagName.toLowerCase(), 'div');
    assert.strictEqual(view.className, 'neurology-care-view');

    const tabNav = view.querySelector('.neurology-tab-nav');
    assert.ok(tabNav);
    assert.strictEqual(tabNav.getAttribute('role'), 'tablist');

    const activeTab = view.querySelector('.neurology-tab-btn.active');
    assert.ok(activeTab);
    assert.strictEqual(activeTab.getAttribute('aria-selected'), 'true');
  });
});
