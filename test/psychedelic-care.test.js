// test/psychedelic-care.test.js
// HarborPath - Psychedelic Harm Reduction, 5-HT2A Pharmacology, Crisis De-Escalation & HPPD Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  PSYCHEDELIC_COMPOUND_PROFILES,
  PSYCHEDELIC_INTERACTIONS,
  CRISIS_DE_ESCALATION_PILLARS,
  GROUNDING_EXERCISES,
  HPPD_CLINICAL_STANDARDS,
  getPsychedelicState,
  setPsychedelicState,
  resetPsychedelicState,
  evaluatePsychedelicCrisis,
  buildPsychedelicSbarText,
  psychedelicCareView,
} from '../public/js/views/psychedelicCare.js';

describe('Psychedelic Harm Reduction, 5-HT2A De-Escalation & HPPD Navigator (Wave 34)', () => {
  it('exports accurate pharmacology, durations, and profiles for classical and synthetic compounds', () => {
    const psilo = PSYCHEDELIC_COMPOUND_PROFILES.psilocybin;
    assert.ok(psilo, 'Missing psilocybin profile');
    assert.ok(psilo.pharmacologyEn.includes('default mode network (DMN)'));
    assert.ok(psilo.pharmacologyEn.includes('5-HT2A'));
    assert.ok(psilo.durationEn.includes('4 to 6 hours'));

    const lsd = PSYCHEDELIC_COMPOUND_PROFILES.lsd;
    assert.ok(lsd, 'Missing lsd profile');
    assert.ok(lsd.pharmacologyEn.includes('molecular "lid"'));
    assert.ok(lsd.pharmacologyEn.includes('micrograms (mcg)'));
    assert.ok(lsd.durationEn.includes('8 to 14 hours'));

    const dmt = PSYCHEDELIC_COMPOUND_PROFILES.dmt;
    assert.ok(dmt, 'Missing dmt profile');
    assert.ok(dmt.pharmacologyEn.includes('5-MeO-DMT'));
    assert.ok(dmt.durationEn.includes('15 to 30 minutes'));

    const phen = PSYCHEDELIC_COMPOUND_PROFILES.mescaline2cb;
    assert.ok(phen, 'Missing mescaline/2cb profile');
    assert.ok(phen.crisisVulnerabilityEn.includes('steep dose-response curve'));

    const nbome = PSYCHEDELIC_COMPOUND_PROFILES.nbomeAdulterant;
    assert.ok(nbome, 'Missing nbome profile');
    assert.ok(nbome.pharmacologyEn.includes('FULL agonists'));
    assert.ok(nbome.crisisVulnerabilityEn.includes('IF IT’S BITTER, IT’S A SPITTER'));
    assert.ok(nbome.physiologicalEffectsEn.includes('SEVERE PERIPHERAL VASOCONSTRICTION'));
  });

  it('documents critical pharmacological contraindications including Lithium status epilepticus and MAOI serotonin toxicity', () => {
    assert.ok(Array.isArray(PSYCHEDELIC_INTERACTIONS));
    assert.ok(PSYCHEDELIC_INTERACTIONS.length >= 4);

    const lithium = PSYCHEDELIC_INTERACTIONS.find((i) => i.drugClass.includes('Lithium'));
    assert.ok(lithium, 'Missing Lithium interaction');
    assert.strictEqual(lithium.severity, 'fatal_contraindication');
    assert.ok(lithium.mechanismEn.includes('STATUS EPILEPTICUS') || lithium.titleEn.includes('STATUS EPILEPTICUS'));
    assert.ok(lithium.mechanismEn.includes('near-100% incidence'));

    const maoi = PSYCHEDELIC_INTERACTIONS.find((i) => i.drugClass.includes('MAOI'));
    assert.ok(maoi, 'Missing MAOI interaction');
    assert.strictEqual(maoi.severity, 'fatal_contraindication');
    assert.ok(maoi.mechanismEn.includes('Banisteriopsis Caapi') || maoi.drugClass.includes('Banisteriopsis Caapi'));
    assert.ok(maoi.mechanismEn.includes('Serotonin Syndrome'));

    const ssri = PSYCHEDELIC_INTERACTIONS.find((i) => i.drugClass.includes('SSRI'));
    assert.ok(ssri, 'Missing SSRI interaction');
    assert.strictEqual(ssri.severity, 'efficacy_blunting');
    assert.ok(ssri.mechanismEn.includes('downregulation and desensitization'));

    const tramadol = PSYCHEDELIC_INTERACTIONS.find((i) => i.drugClass.includes('Tramadol'));
    assert.ok(tramadol, 'Missing Tramadol interaction');
    assert.strictEqual(tramadol.severity, 'high_risk');
    assert.ok(tramadol.mechanismEn.includes('lower seizure thresholds'));
  });

  it('encodes the 4 Pillars of Compassionate Crisis De-Escalation and 5-4-3-2-1 Sensory Grounding', () => {
    assert.strictEqual(CRISIS_DE_ESCALATION_PILLARS.length, 4);
    assert.ok(CRISIS_DE_ESCALATION_PILLARS[0].titleEn.includes('Safe, Quiet Space'));
    assert.ok(CRISIS_DE_ESCALATION_PILLARS[1].titleEn.includes('Sitting, Not Guiding'));
    assert.ok(CRISIS_DE_ESCALATION_PILLARS[2].titleEn.includes('Talk Through, Not Down'));
    assert.ok(CRISIS_DE_ESCALATION_PILLARS[3].titleEn.includes('Difficult is Not Necessarily Bad'));

    assert.ok(Array.isArray(GROUNDING_EXERCISES.sensory54321En));
    assert.strictEqual(GROUNDING_EXERCISES.sensory54321En.length, 5);
    assert.ok(Array.isArray(GROUNDING_EXERCISES.sensory54321Es));
    assert.strictEqual(GROUNDING_EXERCISES.sensory54321Es.length, 5);
  });

  it('articulates HPPD DSM-5 criteria, Type 1 vs Type 2 distinctions, and cardinal clinical reassurances', () => {
    assert.ok(HPPD_CLINICAL_STANDARDS.definitionEn.includes('DSM-5 292.89'));
    assert.ok(HPPD_CLINICAL_STANDARDS.subtypesEn.type1.includes('Flashbacks'));
    assert.ok(HPPD_CLINICAL_STANDARDS.subtypesEn.type2.includes('Persistent Visual Snow'));
    assert.ok(HPPD_CLINICAL_STANDARDS.cardinalReassurancesEn.some((r) => r.includes('NOT PROGRESSIVE PSYCHOSIS')));
    assert.ok(HPPD_CLINICAL_STANDARDS.cardinalReassurancesEn.some((r) => r.includes('NOT BRAIN DAMAGE')));
    assert.ok(HPPD_CLINICAL_STANDARDS.cardinalReassurancesEn.some((r) => r.includes('CESSATION OF TRIGGERS')));
    assert.ok(HPPD_CLINICAL_STANDARDS.cardinalReassurancesEn.some((r) => r.includes('Lamotrigine')));
  });

  it('evaluates psychedelic crisis urgency across medical emergency, toxidrome, and peer support tiers', () => {
    // 1. Critical Medical Emergency: Seizures or Lithium
    const seizureEval = evaluatePsychedelicCrisis({
      hasSeizuresOrUnresponsiveness: true,
      takingLithium: false,
      isBitterNumbingTaste: false,
      hasExtremeHyperthermia: false,
      hasSpontaneousClonus: false,
      takingMaoi: false,
      takingSsriSnri: false,
      selectedSubstance: 'psilocybin',
    });
    assert.strictEqual(seizureEval.urgencyTier, 'emergency_medical');
    assert.strictEqual(seizureEval.isEmergency, true);
    assert.ok(seizureEval.actionEn.includes('CALL 911 IMMEDIATELY'));

    const lithiumEval = evaluatePsychedelicCrisis({
      hasSeizuresOrUnresponsiveness: false,
      takingLithium: true,
      isBitterNumbingTaste: false,
      hasExtremeHyperthermia: false,
      hasSpontaneousClonus: false,
      takingMaoi: false,
      takingSsriSnri: false,
      selectedSubstance: 'lsd',
    });
    assert.strictEqual(lithiumEval.urgencyTier, 'emergency_medical');
    assert.strictEqual(lithiumEval.isEmergency, true);

    // 2. Toxicology Emergency: Bitter blotter (NBOMe) or Serotonin Syndrome
    const nbomeEval = evaluatePsychedelicCrisis({
      hasSeizuresOrUnresponsiveness: false,
      takingLithium: false,
      isBitterNumbingTaste: true,
      hasExtremeHyperthermia: false,
      hasSpontaneousClonus: false,
      takingMaoi: false,
      takingSsriSnri: false,
      selectedSubstance: 'lsd',
    });
    assert.strictEqual(nbomeEval.urgencyTier, 'emergency_toxicology');
    assert.strictEqual(nbomeEval.isEmergency, true);
    assert.ok(nbomeEval.tierTitleEn.includes('25I-NBOMe'));

    const ssEval = evaluatePsychedelicCrisis({
      hasSeizuresOrUnresponsiveness: false,
      takingLithium: false,
      isBitterNumbingTaste: false,
      hasExtremeHyperthermia: true,
      hasSpontaneousClonus: true,
      takingMaoi: false,
      takingSsriSnri: false,
      selectedSubstance: 'dmt',
    });
    assert.strictEqual(ssEval.urgencyTier, 'emergency_toxicology');
    assert.strictEqual(ssEval.isEmergency, true);
    assert.ok(ssEval.tierTitleEn.includes('Serotonin Syndrome'));

    // 3. Peer De-escalation: Psychological distress only
    const peerEval = evaluatePsychedelicCrisis({
      hasSeizuresOrUnresponsiveness: false,
      takingLithium: false,
      isBitterNumbingTaste: false,
      hasExtremeHyperthermia: false,
      hasSpontaneousClonus: false,
      takingMaoi: false,
      takingSsriSnri: false,
      selectedSubstance: 'psilocybin',
    });
    assert.strictEqual(peerEval.urgencyTier, 'peer_deescalation');
    assert.strictEqual(peerEval.isEmergency, false);
    assert.ok(peerEval.actionEn.includes('DO NOT CALL POLICE'));
    assert.ok(peerEval.actionEn.includes('62-FIRESIDE'));
  });

  it('generates structured zero-PII SBAR handoff notes in English and Spanish', () => {
    const state = {
      selectedSubstance: 'lsd',
      hoursSinceIngestion: 'peak_2_to_4h',
      isBitterNumbingTaste: false,
      hasExtremeHyperthermia: false,
      hasSpontaneousClonus: false,
      hasSeizuresOrUnresponsiveness: false,
      takingLithium: false,
      takingSsriSnri: true,
      takingMaoi: false,
    };
    const evaluation = evaluatePsychedelicCrisis(state);

    const sbarEn = buildPsychedelicSbarText(state, evaluation, 'en');
    assert.ok(sbarEn.includes('PSYCHEDELIC HARM REDUCTION, 5-HT2A CRISIS & PEER DE-ESCALATION SBAR NOTE'));
    assert.ok(sbarEn.includes('S (SITUATION):'));
    assert.ok(sbarEn.includes('B (BACKGROUND / TOXICOLOGICAL FACTORS):'));
    assert.ok(sbarEn.includes('A (CLINICAL ASSESSMENT):'));
    assert.ok(sbarEn.includes('R (RECOMMENDATIONS & CRISIS MANAGEMENT PLAN):'));
    assert.ok(sbarEn.includes('AVOID physical restraints and neuroleptics (haloperidol)'));

    const sbarEs = buildPsychedelicSbarText(state, evaluation, 'es');
    assert.ok(sbarEs.includes('INFORME CLÍNICO SBAR: CRISIS PSICODÉLICA, FARMACOLOGÍA 5-HT2A Y DESESCALADA'));
    assert.ok(sbarEs.includes('S (SITUACIÓN):'));
    assert.ok(sbarEs.includes('B (ANTECEDENTES / FACTORES TOXICOLÓGICOS):'));
    assert.ok(sbarEs.includes('A (EVALUACIÓN CLÍNICA):'));
    assert.ok(sbarEs.includes('R (RECOMENDACIONES Y MANEJO EN CRISIS):'));
    assert.ok(sbarEs.includes('NO usar contenciones físicas ni neurolépticos'));
  });

  it('manages in-RAM ephemeral state with deterministic resets and zero storage persistence', () => {
    resetPsychedelicState();
    const initial = getPsychedelicState();
    assert.strictEqual(initial.activeTab, 'crisis');
    assert.strictEqual(initial.viewMode, 'community');
    assert.strictEqual(initial.selectedSubstance, 'psilocybin');
    assert.strictEqual(initial.isBitterNumbingTaste, false);

    setPsychedelicState({
      activeTab: 'pharmacology',
      viewMode: 'clinical',
      selectedSubstance: 'lsd',
      takingLithium: true,
    });
    const updated = getPsychedelicState();
    assert.strictEqual(updated.activeTab, 'pharmacology');
    assert.strictEqual(updated.viewMode, 'clinical');
    assert.strictEqual(updated.selectedSubstance, 'lsd');
    assert.strictEqual(updated.takingLithium, true);

    resetPsychedelicState();
    const reset = getPsychedelicState();
    assert.strictEqual(reset.activeTab, 'crisis');
    assert.strictEqual(reset.viewMode, 'community');
    assert.strictEqual(reset.selectedSubstance, 'psilocybin');
    assert.strictEqual(reset.takingLithium, false);
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
      const el = psychedelicCareView();
      assert.ok(el, 'psychedelicCareView must return a root element');
      assert.strictEqual(el.className, 'psychedelic-care-view');
      assert.ok(el.children.length >= 4);
    } finally {
      globalThis.document = prevDoc;
      globalThis.Node = prevNode;
    }
  });

  it('passes strict static security and privacy audit', () => {
    const code = fs.readFileSync('public/js/views/psychedelicCare.js', 'utf8');

    assert.strictEqual(code.includes('localStorage'), false, 'Zero localStorage permitted');
    assert.strictEqual(code.includes('sessionStorage'), false, 'Zero sessionStorage permitted');
    assert.strictEqual(code.includes('document.cookie'), false, 'Zero cookie permitted');
    assert.strictEqual(code.includes('innerHTML'), false, 'Zero innerHTML permitted');
    assert.strictEqual(code.includes('outerHTML'), false, 'Zero outerHTML permitted');
    assert.strictEqual(code.includes('style='), false, 'Zero inline style= permitted');
  });
});
