// test/ghb-care.test.js
// HarborPath - GHB, GBL, 1,4-BDO Harm Reduction, Coma Triage & Severe Withdrawal Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  GHB_COMPOUND_PROFILES,
  GWS_WITHDRAWAL_STAGES,
  GHB_CLINICAL_PROTOCOLS,
  GHB_HARM_REDUCTION_RULES,
  evaluateGhbEvent,
  buildGhbSbarText,
  getGhbState,
  setGhbState,
  resetGhbState,
  ghbCareView,
} from '../public/js/views/ghbCare.js';

describe('GHB, GBL & 1,4-BDO Harm Reduction, Coma Triage & Severe Withdrawal Module (Wave 35)', () => {
  it('exports accurate pharmacology, kinetics, and taste profiles for GHB, GBL, and 1,4-BDO', () => {
    const ghb = GHB_COMPOUND_PROFILES.ghb;
    assert.ok(ghb, 'Missing ghb profile');
    assert.ok(ghb.pharmacologyEn.includes('GABA-B'));
    assert.ok(ghb.pharmacologyEn.includes('steep'));
    assert.ok(ghb.tasteVisualEn.includes('salty'));

    const gbl = GHB_COMPOUND_PROFILES.gbl;
    assert.ok(gbl, 'Missing gbl profile');
    assert.ok(gbl.pharmacologyEn.includes('lactonase'));
    assert.ok(gbl.pharmacologyEn.includes('2x higher potency'));
    assert.ok(gbl.tasteVisualEn.includes('acrid') || gbl.tasteVisualEn.includes('bitter'));

    const bdo = GHB_COMPOUND_PROFILES.bdo;
    assert.ok(bdo, 'Missing bdo profile');
    assert.ok(bdo.pharmacologyEn.includes('alcohol dehydrogenase'));
    assert.ok(bdo.pharmacologyEn.includes('METABOLIC TRAP'));
  });

  it('articulates GHB Withdrawal Syndrome (GWS) clinical staging across 3 tiers', () => {
    assert.strictEqual(GWS_WITHDRAWAL_STAGES.length, 3);

    const mild = GWS_WITHDRAWAL_STAGES.find((s) => s.stageId === 'mild');
    assert.ok(mild);
    assert.ok(mild.symptomsEn.some((sym) => sym.includes('rapidly')));
    assert.ok(mild.symptomsEn.some((sym) => sym.includes('tremor')));

    const mod = GWS_WITHDRAWAL_STAGES.find((s) => s.stageId === 'moderate');
    assert.ok(mod);
    assert.ok(mod.symptomsEn.some((sym) => sym.includes('autonomic surge') || sym.includes('tachycardia')));

    const severe = GWS_WITHDRAWAL_STAGES.find((s) => s.stageId === 'severe');
    assert.ok(severe);
    assert.ok(severe.symptomsEn.some((sym) => sym.includes('paranoid delirium')));
    assert.ok(severe.symptomsEn.some((sym) => sym.includes('Status epilepticus')));
  });

  it('specifies evidence-based BAP pharmacotherapy protocols and black-box cold turkey warnings', () => {
    assert.ok(GHB_CLINICAL_PROTOCOLS.baclofenProtocolEn.title.includes('Baclofen'));
    assert.ok(GHB_CLINICAL_PROTOCOLS.baclofenProtocolEn.dosing.includes('10 mg PO'));
    assert.ok(GHB_CLINICAL_PROTOCOLS.baclofenProtocolEn.rationale.includes('GABA-B'));

    assert.ok(GHB_CLINICAL_PROTOCOLS.diazepamProtocolEn.title.includes('Diazepam'));
    assert.ok(GHB_CLINICAL_PROTOCOLS.diazepamProtocolEn.dosing.includes('10 to 20 mg'));

    assert.ok(GHB_CLINICAL_PROTOCOLS.coldTurkeyAlertEn.includes('NEVER stop GHB/GBL/BDO "cold turkey"'));
  });

  it('details community harm reduction rules including syringe dosing, timers, and food dye', () => {
    assert.strictEqual(GHB_HARM_REDUCTION_RULES.length, 4);
    assert.ok(GHB_HARM_REDUCTION_RULES[0].ruleEn.includes('0.1 mL ORAL SYRINGE'));
    assert.ok(GHB_HARM_REDUCTION_RULES[1].ruleEn.includes('MANDATORY DOSING TIMERS'));
    assert.ok(GHB_HARM_REDUCTION_RULES[2].ruleEn.includes('FOOD COLORING DYE'));
    assert.ok(GHB_HARM_REDUCTION_RULES[3].ruleEn.includes('NO ALCOHOL'));
  });

  it('evaluates acute GHB presentations across coma, severe withdrawal, and stable harm reduction', () => {
    // 1. Critical Coma: Unresponsive + slow breathing (< 8/min)
    const comaEval = evaluateGhbEvent({
      hoursSinceLastDose: 1,
      isDosingRoundTheClock: false,
      isUnresponsive: true,
      respiratoryRateUnder8: true,
      isSnoringOrGurgling: false,
      vomitedWhileUnconscious: false,
      combinedWithAlcoholOrSedatives: false,
      hasSevereTremorsOrHallucinations: false,
    });
    assert.strictEqual(comaEval.tier, 'emergency_coma');
    assert.strictEqual(comaEval.isEmergency, true);
    assert.ok(comaEval.actionEn.includes('CALL 911 IMMEDIATELY'));
    assert.ok(comaEval.actionEn.includes('LATERAL RECOVERY POSITION'));

    // 2. Severe Withdrawal: Round-the-clock dosing + tremors/hallucinations
    const withdrawalEval = evaluateGhbEvent({
      hoursSinceLastDose: 4,
      isDosingRoundTheClock: true,
      isUnresponsive: false,
      respiratoryRateUnder8: false,
      isSnoringOrGurgling: false,
      vomitedWhileUnconscious: false,
      combinedWithAlcoholOrSedatives: false,
      hasSevereTremorsOrHallucinations: true,
    });
    assert.strictEqual(withdrawalEval.tier, 'emergency_withdrawal');
    assert.strictEqual(withdrawalEval.isEmergency, true);
    assert.ok(withdrawalEval.actionEn.includes('EMERGENCY MEDICAL ADMISSION REQUIRED'));
    assert.ok(withdrawalEval.hospitalInterventionEn.includes('Baclofen'));

    // 3. Simple G-Out: Deep sleep without airway obstruction or alcohol
    const goutEval = evaluateGhbEvent({
      hoursSinceLastDose: 1,
      isDosingRoundTheClock: false,
      isUnresponsive: true,
      respiratoryRateUnder8: false,
      isSnoringOrGurgling: false,
      vomitedWhileUnconscious: false,
      combinedWithAlcoholOrSedatives: false,
      hasSevereTremorsOrHallucinations: false,
    });
    assert.strictEqual(goutEval.tier, 'monitoring_g_out');
    assert.strictEqual(goutEval.isEmergency, false);
    assert.ok(goutEval.actionEn.includes('NEVER LEAVE THEM ALONE'));

    // 4. Stable Harm Reduction
    const stableEval = evaluateGhbEvent({
      hoursSinceLastDose: 2,
      isDosingRoundTheClock: false,
      isUnresponsive: false,
      respiratoryRateUnder8: false,
      isSnoringOrGurgling: false,
      vomitedWhileUnconscious: false,
      combinedWithAlcoholOrSedatives: false,
      hasSevereTremorsOrHallucinations: false,
    });
    assert.strictEqual(stableEval.tier, 'stable_guidance');
    assert.strictEqual(stableEval.isEmergency, false);
    assert.ok(stableEval.actionEn.includes('syringe measurement'));
  });

  it('generates structured zero-PII SBAR clinical handoff notes in English and Spanish', () => {
    const state = {
      selectedSubstance: 'gbl',
      hoursSinceLastDose: 5,
      isDosingRoundTheClock: true,
      isUnresponsive: false,
      respiratoryRateUnder8: false,
      isSnoringOrGurgling: false,
      vomitedWhileUnconscious: false,
      combinedWithAlcoholOrSedatives: false,
      hasSevereTremorsOrHallucinations: true,
    };
    const evaluation = evaluateGhbEvent(state);

    const sbarEn = buildGhbSbarText(state, evaluation, 'en');
    assert.ok(sbarEn.includes('GHB, GBL & 1,4-BDO CLINICAL SBAR: COMA TRIAGE & SEVERE WITHDRAWAL NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / TOXICOLOGICAL FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & EMERGENCY MANAGEMENT):'));
    assert.ok(sbarEn.includes('Baclofen'));

    const sbarEs = buildGhbSbarText(state, evaluation, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: GHB / GBL / 1,4-BDO'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES TOXICOLÓGICOS):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES CLÍNICAS Y MANEJO EN URGENCIAS):'));
    assert.ok(sbarEs.includes('baclofeno'));
  });

  it('manages in-RAM ephemeral state with deterministic resets and zero storage persistence', () => {
    resetGhbState();
    const initial = getGhbState();
    assert.strictEqual(initial.activeTab, 'triage');
    assert.strictEqual(initial.selectedSubstance, 'ghb');
    assert.strictEqual(initial.isUnresponsive, false);

    setGhbState({
      activeTab: 'withdrawal',
      selectedSubstance: 'bdo',
      isDosingRoundTheClock: true,
    });
    const updated = getGhbState();
    assert.strictEqual(updated.activeTab, 'withdrawal');
    assert.strictEqual(updated.selectedSubstance, 'bdo');
    assert.strictEqual(updated.isDosingRoundTheClock, true);

    resetGhbState();
    const reset = getGhbState();
    assert.strictEqual(reset.activeTab, 'triage');
    assert.strictEqual(reset.selectedSubstance, 'ghb');
    assert.strictEqual(reset.isDosingRoundTheClock, false);
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
      const el = ghbCareView();
      assert.ok(el, 'ghbCareView must return a root element');
      assert.strictEqual(el.className, 'ghb-care-view');
      assert.ok(el.children.length >= 3);
    } finally {
      globalThis.document = prevDoc;
      globalThis.Node = prevNode;
    }
  });

  it('passes strict static security and privacy audit', () => {
    const code = fs.readFileSync('public/js/views/ghbCare.js', 'utf8');

    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookie permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
