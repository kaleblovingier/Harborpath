// test/novel-substances.test.js
// HarborPath - Novel Psychoactive Substances, Kratom, Tianeptine & Emerging OTC Misuse Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  NOVEL_SUBSTANCE_PROFILES,
  PRODUCT_SAFETY_ALERTS,
  BACLOFEN_SUBSTITUTION_RULES,
  getNovelState,
  setNovelState,
  resetNovelState,
  evaluateNovelSubstanceRisk,
  buildNovelSubstancesSbarText,
  novelSubstancesView,
} from '../public/js/views/novelSubstances.js';

describe('Novel Substances, Kratom, Tianeptine & Emerging OTC Misuse Module (Wave 32)', () => {
  it('exports accurate pharmacology and toxicology profiles for novel substances', () => {
    // Tianeptine profile
    const tian = NOVEL_SUBSTANCE_PROFILES.tianeptine;
    assert.ok(tian, 'Missing tianeptine profile');
    assert.ok(tian.pharmacologyEn.includes('mu-opioid receptor agonist'));
    assert.ok(tian.cardiotoxicityEn.includes('QTc PROLONGATION'));
    assert.ok(tian.cardiotoxicityEn.includes('torsades de pointes'));
    assert.ok(tian.udsStatusEn.includes('100% NEGATIVE on standard hospital'));
    assert.ok(tian.clinicalTreatmentEn.includes('Buprenorphine induction'));

    // Kratom / 7-OH profile
    const kratom = NOVEL_SUBSTANCE_PROFILES.kratom;
    assert.ok(kratom, 'Missing kratom profile');
    assert.ok(kratom.pharmacologyEn.includes('7-hydroxymitragynine (7-OH)'));
    assert.ok(kratom.pharmacologyEn.includes('13-fold higher potency than morphine'));
    assert.ok(kratom.udsStatusEn.includes('NEGATIVE on routine immunoassay'));
    assert.ok(kratom.clinicalTreatmentEn.includes('ASAM guidelines'));

    // Phenibut profile
    const phenibut = NOVEL_SUBSTANCE_PROFILES.phenibut;
    assert.ok(phenibut, 'Missing phenibut profile');
    assert.ok(phenibut.pharmacologyEn.includes('GABAB receptors'));
    assert.ok(phenibut.withdrawalEn.includes('LIFE-THREATENING WITHDRAWAL'));
    assert.ok(phenibut.withdrawalEn.includes('delirium tremens or GHB'));
    assert.ok(phenibut.clinicalTreatmentEn.includes('Baclofen substitution taper'));

    // Loperamide megadose profile
    const lop = NOVEL_SUBSTANCE_PROFILES.loperamide;
    assert.ok(lop, 'Missing loperamide profile');
    assert.ok(lop.name.includes('Poor Man’s Methadone'));
    assert.ok(lop.pharmacologyEn.includes('P-glycoprotein'));
    assert.ok(lop.cardiotoxicityEn.includes('hERG potassium channels'));
    assert.ok(lop.cardiotoxicityEn.includes('Torsades de Pointes'));
    assert.ok(lop.clinicalTreatmentEn.includes('Magnesium Sulfate'));

    // DXM / DPH profile
    const dxm = NOVEL_SUBSTANCE_PROFILES.dxmDph;
    assert.ok(dxm, 'Missing dxm profile');
    assert.ok(dxm.udsStatusEn.includes('FALSE POSITIVES for PCP'));
    assert.ok(dxm.cardiotoxicityEn.includes('Serotonin Syndrome'));
  });

  it('exports gas station and convenience store brand safety alerts with ZaZa Silver dual-dependence warning', () => {
    assert.ok(PRODUCT_SAFETY_ALERTS.length >= 4);

    const zazaSilver = PRODUCT_SAFETY_ALERTS.find((p) => p.productName.includes('ZaZa Silver'));
    assert.ok(zazaSilver, 'Missing ZaZa Silver alert');
    assert.strictEqual(zazaSilver.hazardLevel, 'extreme');
    assert.ok(zazaSilver.activeIngredientsEn.includes('Tianeptine PLUS Phenibut'));
    assert.ok(zazaSilver.clinicalWarningEn.includes('DEADLY COMBINATION'));
    assert.ok(zazaSilver.clinicalWarningEn.includes('SIMULTANEOUS severe opioid withdrawal and life-threatening GABAergic delirium'));

    const ohTablets = PRODUCT_SAFETY_ALERTS.find((p) => p.productName.includes('7-OH Tablets'));
    assert.ok(ohTablets, 'Missing 7-OH tablets alert');
    assert.strictEqual(ohTablets.hazardLevel, 'high');
  });

  it('provides structured baclofen substitution protocol for phenibut withdrawal', () => {
    assert.ok(BACLOFEN_SUBSTITUTION_RULES.conversionRatioEn.includes('10 mg of oral Baclofen'));
    assert.ok(BACLOFEN_SUBSTITUTION_RULES.conversionRatioEn.includes('1,000 mg (1 gram) of oral Phenibut'));
    assert.ok(BACLOFEN_SUBSTITUTION_RULES.conversionRatioEs.includes('10 mg de Baclofeno oral'));
    assert.ok(BACLOFEN_SUBSTITUTION_RULES.principlesEn.length >= 4);
    assert.ok(BACLOFEN_SUBSTITUTION_RULES.principlesEn[0].includes('three times daily'));
  });

  it('triggers critical cardiac emergency tier for tianeptine or loperamide with palpitations or syncope', () => {
    const state = {
      selectedSubstance: 'tianeptine',
      dailyDoseLevel: 'very_high',
      hasZaZaSilver: false,
      hasCardiacSymptoms: true,
      hasHallucinations: false,
      timeSinceLastDoseHours: 'under_6',
    };

    const evalResult = evaluateNovelSubstanceRisk(state);
    assert.strictEqual(evalResult.urgencyTier, 'emergency_cardiac');
    assert.strictEqual(evalResult.isEmergency, true);
    assert.ok(evalResult.tierTitleEn.includes('CRITICAL EMERGENCY'));
    assert.ok(evalResult.actionEn.includes('Call 911'));
    assert.ok(evalResult.actionEn.includes('ventricular arrhythmias'));
    assert.ok(evalResult.treatmentStrategyEn.includes('IV magnesium'));
  });

  it('triggers emergency delirium and dual-withdrawal tier for ZaZa Silver co-ingestion', () => {
    const state = {
      selectedSubstance: 'tianeptine',
      dailyDoseLevel: 'high',
      hasZaZaSilver: true,
      hasCardiacSymptoms: false,
      hasHallucinations: false,
      timeSinceLastDoseHours: '6_to_12',
    };

    const evalResult = evaluateNovelSubstanceRisk(state);
    assert.strictEqual(evalResult.urgencyTier, 'emergency_delirium');
    assert.strictEqual(evalResult.isEmergency, true);
    assert.ok(evalResult.tierTitleEn.includes('COMPLEX DUAL WITHDRAWAL'));
    assert.ok(evalResult.actionEn.includes('ZaZa Silver contains BOTH'));
    assert.ok(evalResult.treatmentStrategyEn.includes('Buprenorphine'));
    assert.ok(evalResult.treatmentStrategyEn.includes('Baclofen'));
  });

  it('evaluates standard substance pathways when without active life-threatening emergencies', () => {
    const kratomState = {
      selectedSubstance: 'kratom',
      dailyDoseLevel: 'high',
      hasZaZaSilver: false,
      hasCardiacSymptoms: false,
      hasHallucinations: false,
      timeSinceLastDoseHours: '12_to_24',
    };
    const kratomEval = evaluateNovelSubstanceRisk(kratomState);
    assert.strictEqual(kratomEval.isEmergency, false);
    assert.ok(kratomEval.tierTitleEn.includes('MOUD Care Pathway'));
    assert.ok(kratomEval.actionEn.includes('Buprenorphine induction'));

    const phenibutState = {
      selectedSubstance: 'phenibut',
      dailyDoseLevel: 'moderate',
      hasZaZaSilver: false,
      hasCardiacSymptoms: false,
      hasHallucinations: false,
      timeSinceLastDoseHours: '6_to_12',
    };
    const phenibutEval = evaluateNovelSubstanceRisk(phenibutState);
    assert.strictEqual(phenibutEval.isEmergency, false);
    assert.ok(phenibutEval.tierTitleEn.includes('Structured Baclofen Substitution'));
    assert.ok(phenibutEval.actionEn.includes('10 mg baclofen per 1,000 mg phenibut'));
  });

  it('generates structured, zero-PII SBAR clinical handoffs in English and Spanish', () => {
    const state = {
      selectedSubstance: 'tianeptine',
      dailyDoseLevel: 'very_high',
      hasZaZaSilver: true,
      hasCardiacSymptoms: true,
      hasHallucinations: false,
      timeSinceLastDoseHours: 'under_6',
    };
    const evaluation = evaluateNovelSubstanceRisk(state);

    const sbarEn = buildNovelSubstancesSbarText(state, evaluation, 'en');
    assert.ok(sbarEn.includes('NOVEL SUBSTANCES, KRATOM, TIANEPTINE & OTC MISUSE SBAR HANDOFF NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / CONSUMPTION DETAILS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & THERAPEUTIC PLAN):'));
    assert.ok(sbarEn.includes('Routine UDS will be FALSELY NEGATIVE'));

    const sbarEs = buildNovelSubstancesSbarText(state, evaluation, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: SUSTANCIAS NOVEDOSAS, KRATOM, TIANEPTINA Y OTC'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / DETALLES DE CONSUMO):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y PLAN TERAPÉUTICO):'));
    assert.ok(sbarEs.includes('el toxicológico estándar será NEGATIVO'));
  });

  it('manages in-RAM ephemeral state with deterministic resets and zero storage persistence', () => {
    resetNovelState();
    const initial = getNovelState();
    assert.strictEqual(initial.activeTab, 'calculator');
    assert.strictEqual(initial.selectedSubstance, 'tianeptine');

    setNovelState({ activeTab: 'products', selectedSubstance: 'phenibut', hasZaZaSilver: true });
    const updated = getNovelState();
    assert.strictEqual(updated.activeTab, 'products');
    assert.strictEqual(updated.selectedSubstance, 'phenibut');
    assert.strictEqual(updated.hasZaZaSilver, true);

    resetNovelState();
    const reset = getNovelState();
    assert.strictEqual(reset.activeTab, 'calculator');
    assert.strictEqual(reset.selectedSubstance, 'tianeptine');
    assert.strictEqual(reset.hasZaZaSilver, false);
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
      const el = novelSubstancesView();
      assert.ok(el, 'novelSubstancesView must return a root element');
      assert.strictEqual(el.className, 'novel-substances-view');
      assert.ok(el.children.length >= 4);
    } finally {
      globalThis.document = prevDoc;
      globalThis.Node = prevNode;
    }
  });

  it('passes strict static security and privacy audit', () => {
    const code = fs.readFileSync('public/js/views/novelSubstances.js', 'utf8');

    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookie permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
