import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REVERSAL_FORMULATIONS,
  WOODEN_CHEST_SYNDROME,
  RENARCONIZATION_RISK,
  STIMULANT_OVERAMPING_GUIDE,
  XYLAZINE_SEDATION_MANAGEMENT,
  compareFormulations,
  evaluateOverdoseRiskScenario,
} from '../public/js/content/reversalFormulations.js';
import {
  COWS_DIMENSIONS,
  COWS_SEVERITY_BANDS,
  CIWA_DIMENSIONS,
  CIWA_SEVERITY_BANDS,
  calculateCowsScore,
  calculateCiwaScore,
  formatAssessmentReportText,
  assessmentView,
  resetAssessmentState,
} from '../public/js/views/assessment.js';

// ============================================================================
// SUITE 1: Lay-Facing Text Pharmacology & No Raw Laboratory Claims ($K_i / nM)
// ============================================================================

test('lay-facing scenario guides do not contain raw $K_i or nM laboratory claims or uncited pricing', () => {
  const guides = [
    WOODEN_CHEST_SYNDROME,
    RENARCONIZATION_RISK,
    STIMULANT_OVERAMPING_GUIDE,
    XYLAZINE_SEDATION_MANAGEMENT,
  ];

  // Helper to collect all string values recursively
  function collectStrings(obj, acc = []) {
    if (!obj) return acc;
    if (typeof obj === 'string') {
      acc.push(obj);
    } else if (Array.isArray(obj)) {
      for (const item of obj) collectStrings(item, acc);
    } else if (typeof obj === 'object') {
      for (const val of Object.values(obj)) collectStrings(val, acc);
    }
    return acc;
  }

  for (const guide of guides) {
    const allStrings = collectStrings(guide);
    for (const str of allStrings) {
      assert.doesNotMatch(
        str,
        /\bKi\b|\bnM\b|\$K_?i/i,
        `Lay-facing scenario guide "${guide.id}" must not contain raw Ki/nM laboratory claims: "${str}"`
      );
      assert.doesNotMatch(
        str,
        /\$\d+.*vial/i,
        `Lay-facing scenario guide "${guide.id}" must not contain uncited pricing claims: "${str}"`
      );
    }
  }
});

test('reversal formulation lay-facing fields (clinicalPearls, targetIndications, precipitatedWithdrawal, receptorSelectivity) contain no raw Ki / nM laboratory claims', () => {
  for (const [id, form] of Object.entries(REVERSAL_FORMULATIONS)) {
    // Check clinicalPearls
    for (const pearl of form.clinicalPearls) {
      assert.doesNotMatch(
        pearl,
        /\bKi\b|\bnM\b|\$K_?i/i,
        `clinicalPearl in ${id} must not contain raw Ki / nM claims: "${pearl}"`
      );
      assert.doesNotMatch(
        pearl,
        /\$2[–-]\$5|\$\d+.*vial/i,
        `clinicalPearl in ${id} must not contain uncited pricing: "${pearl}"`
      );
    }

    // Check targetIndications
    for (const ind of form.targetIndications) {
      assert.doesNotMatch(
        ind,
        /\bKi\b|\bnM\b|\$K_?i/i,
        `targetIndication in ${id} must not contain raw Ki / nM claims: "${ind}"`
      );
    }

    // Check precipitatedWithdrawal strings
    const pwStrings = [
      form.precipitatedWithdrawal.severity,
      form.precipitatedWithdrawal.durationHours,
      form.precipitatedWithdrawal.mitigationStrategy,
      ...(form.precipitatedWithdrawal.clinicalFeatures || []),
    ];
    for (const str of pwStrings) {
      assert.doesNotMatch(
        str,
        /\bKi\b|\bnM\b|\$K_?i/i,
        `precipitatedWithdrawal in ${id} must not contain raw Ki / nM claims: "${str}"`
      );
    }

    // Check receptorSelectivity string
    assert.doesNotMatch(
      form.receptorPharmacology.receptorSelectivity,
      /\bKi\b|\bnM\b|\$K_?i/i,
      `receptorSelectivity in ${id} must not contain raw Ki / nM claims: "${form.receptorPharmacology.receptorSelectivity}"`
    );
  }
});

test('compareFormulations summaries and clinical recommendations contain no raw Ki or nM text', () => {
  const comparisons = [
    compareFormulations('naloxone_nasal_4mg', 'nalmefene_nasal_3mg'),
    compareFormulations('naloxone_nasal_4mg', 'naloxone_nasal_8mg'),
    compareFormulations('naloxone_nasal_4mg', 'naloxone_injectable_0_4mg'),
    compareFormulations('nalmefene_nasal_3mg', 'naloxone_nasal_8mg'),
  ];

  for (const cmp of comparisons) {
    assert.doesNotMatch(
      cmp.receptorAffinityComparison.summary,
      /\bKi\b|\bnM\b|\$K_?i/i,
      `Receptor affinity comparison summary must not contain raw Ki / nM: "${cmp.receptorAffinityComparison.summary}"`
    );
    assert.doesNotMatch(
      cmp.clinicalRecommendation,
      /\bKi\b|\bnM\b|\$K_?i/i,
      `Clinical recommendation must not contain raw Ki / nM: "${cmp.clinicalRecommendation}"`
    );
  }
});

test('evaluateOverdoseRiskScenario returns contain no raw Ki or nM text', () => {
  const scenarios = ['wooden_chest', 'xylazine_sedation', 'renarconization', 'stimulant_overamping', {}];
  for (const s of scenarios) {
    const res = evaluateOverdoseRiskScenario(s);
    assert.doesNotMatch(res.primaryAction, /\bKi\b|\bnM\b|\$K_?i/i);
    assert.doesNotMatch(res.naloxoneGuidance, /\bKi\b|\bnM\b|\$K_?i/i);
    assert.doesNotMatch(res.airwayGuidance, /\bKi\b|\bnM\b|\$K_?i/i);
    for (const w of res.warnings || []) {
      assert.doesNotMatch(w, /\bKi\b|\bnM\b|\$K_?i/i);
    }
  }
});

// ============================================================================
// SUITE 2: Authoritative Sources on Every Reversal Formulation
// ============================================================================

test('every formulation record has non-empty sources array with valid HTTPS URLs', () => {
  for (const [id, form] of Object.entries(REVERSAL_FORMULATIONS)) {
    assert.ok(Array.isArray(form.sources), `${id} must have a sources array`);
    assert.ok(form.sources.length >= 3, `${id} must have at least 3 authoritative sources`);

    for (const src of form.sources) {
      assert.equal(typeof src.organization, 'string', `${id} source must have an organization`);
      assert.ok(src.organization.length > 0);
      assert.equal(typeof src.title, 'string', `${id} source must have a title`);
      assert.ok(src.title.length > 0);
      assert.equal(typeof src.year, 'number', `${id} source must have a numeric year`);
      assert.ok(src.year >= 2015 && src.year <= 2026, `${id} source year must be reasonable`);
      assert.equal(typeof src.url, 'string', `${id} source must have a URL`);
      assert.ok(src.url.startsWith('https://'), `${id} source URL must be HTTPS: ${src.url}`);
    }
  }
});

test('every formulation record cites DailyMed / FDA label, SAMHSA TIP 63, and ASAM National Practice Guideline', () => {
  for (const [id, form] of Object.entries(REVERSAL_FORMULATIONS)) {
    const orgs = form.sources.map((s) => s.organization);
    const titles = form.sources.map((s) => s.title);
    const urls = form.sources.map((s) => s.url);

    // 1. DailyMed / FDA Label
    const hasDailymedOrFda = form.sources.some(
      (s) =>
        s.url.includes('dailymed.nlm.nih.gov') ||
        s.url.includes('fda.gov') ||
        /DailyMed|FDA/i.test(s.organization)
    );
    assert.ok(hasDailymedOrFda, `${id} must cite DailyMed or FDA label`);

    // 2. SAMHSA (TIP 63 or Toolkit)
    const hasSamhsa = form.sources.some(
      (s) => /SAMHSA/i.test(s.organization) && /TIP 63|Toolkit/i.test(s.title)
    );
    assert.ok(hasSamhsa, `${id} must cite SAMHSA (TIP 63 or Overdose Toolkit)`);

    // 3. ASAM National Practice Guideline
    const hasAsam = form.sources.some(
      (s) => /ASAM/i.test(s.organization) && /National Practice Guideline/i.test(s.title)
    );
    assert.ok(hasAsam, `${id} must cite ASAM National Practice Guideline`);
  }
});

// ============================================================================
// SUITE 3: Emergency Order Sequence in Lay Scenario Guides
// ============================================================================

test('lay scenario guides lead with: Call 911 immediately, give naloxone, rescue breathing (1 breath every 5s), left recovery position, stay with them', () => {
  const guides = [
    { name: 'WOODEN_CHEST_SYNDROME', guide: WOODEN_CHEST_SYNDROME },
    { name: 'RENARCONIZATION_RISK', guide: RENARCONIZATION_RISK },
    { name: 'STIMULANT_OVERAMPING_GUIDE', guide: STIMULANT_OVERAMPING_GUIDE },
    { name: 'XYLAZINE_SEDATION_MANAGEMENT', guide: XYLAZINE_SEDATION_MANAGEMENT },
  ];

  for (const { name, guide } of guides) {
    assert.ok(Array.isArray(guide.emergencyGuidance), `${name} must export emergencyGuidance array`);
    const eg = guide.emergencyGuidance;
    assert.ok(eg.length >= 5, `${name} emergencyGuidance must have at least 5 steps`);

    // Step 1: Call 911 immediately
    assert.match(eg[0], /Call 911 immediately/i, `${name} Step 1 must lead with Call 911 immediately`);

    // Step 2: Give naloxone
    assert.match(eg[1], /Give naloxone|naloxone/i, `${name} Step 2 must instruct to give naloxone`);

    // Step 3: Rescue breathing (1 breath every 5s)
    assert.match(eg[2], /Rescue breathing.*1 breath every 5s/i, `${name} Step 3 must instruct rescue breathing (1 breath every 5s)`);

    // Step 4: Left recovery position
    assert.match(eg[3], /Left recovery position|recovery position/i, `${name} Step 4 must instruct left recovery position`);

    // Step 5: Stay with them
    assert.match(eg[4], /Stay with them/i, `${name} Step 5 must instruct stay with them`);
  }
});

test('evaluateOverdoseRiskScenario returns primaryAction leading with 911, naloxone, rescue breathing, recovery position, stay with them', () => {
  const scenarios = ['wooden_chest', 'xylazine_sedation', 'renarconization', 'stimulant_overamping', {}];
  for (const s of scenarios) {
    const res = evaluateOverdoseRiskScenario(s);
    assert.match(
      res.primaryAction,
      /^Call 911 immediately.*give naloxone.*rescue breathing.*(left )?recovery position.*stay with them/i,
      `Scenario "${res.scenarioId}" primaryAction must lead with emergency chain`
    );
  }
});

test('xylazine sedation guidance clarifies naloxone if breathing is shallow/absent, but focuses on rescue breathing/airway if breathing spontaneously (>10-12 bpm)', () => {
  const guide = XYLAZINE_SEDATION_MANAGEMENT;
  const guidanceText = guide.emergencyGuidance.join(' ');
  const p1 = guide.coreClinicalPriorities.priority1_rescueBreathing;
  const p2 = guide.coreClinicalPriorities.priority2_avoidNaloxoneDumping;

  // Naloxone still given if breathing is shallow or absent
  assert.match(guidanceText, /naloxone should still be administered if breathing is shallow or absent/i);
  assert.match(p2.rationale.join(' '), /naloxone should still be administered if breathing is shallow or absent/i);

  // If breathing spontaneously (>10-12 bpm), focus on airway/rescue breathing rather than repeat naloxone dumping
  assert.match(guidanceText, /breathing spontaneously.*focus on rescue breathing and airway monitoring.*rather than repeat naloxone dumping/i);
  assert.match(p2.rationale.join(' '), /breathing spontaneously.*focus on rescue breathing and airway monitoring rather than repeat naloxone dumping/i);

  // evaluateOverdoseRiskScenario for xylazine also incorporates this clarity
  const evalXyl = evaluateOverdoseRiskScenario('xylazine');
  assert.match(evalXyl.primaryAction, /breathing is shallow or absent/i);
  assert.match(evalXyl.primaryAction, /breathing spontaneously.*(>10[–-]12 bpm|>10[–-]12 breaths\/min).*focus on rescue breathing/i);
  assert.match(evalXyl.primaryAction, /rather than repeat naloxone dumping/i);
});

test('clinician-only instructions (neuromuscular blockade, RSI, IV infusions) are clearly labeled as EMS / Hospital ED procedures', () => {
  // Wooden chest
  assert.match(
    WOODEN_CHEST_SYNDROME.immediateClinicalResponse.emsRole,
    /Emergency Medical Services \(EMS\) \/ Hospital ED Procedure/i
  );
  assert.match(
    WOODEN_CHEST_SYNDROME.emergencyGuidance.join(' '),
    /Emergency Medical Services \(EMS\) \/ Hospital ED Procedure/i
  );

  // Stimulant overamping
  const physInterventions = STIMULANT_OVERAMPING_GUIDE.classification.physicalOveramping.interventions.join(' ');
  assert.match(physInterventions, /Emergency Medical Services \(EMS\) \/ Hospital ED Procedure/i);

  // Renarconization
  const renarcRecurrence = RENARCONIZATION_RISK.clinicalProtocol.managementOfRecurrence.join(' ');
  assert.match(renarcRecurrence, /Emergency Medical Services \(EMS\) \/ Hospital ED Procedure/i);
});

// ============================================================================
// SUITE 4: COWS Buprenorphine Induction Readiness (Prescriber-Directed Guidance)
// ============================================================================

test('COWS buprenorphine induction readiness frames thresholds as commonly used clinical thresholds under prescriber guidance', () => {
  // Score 14: Ready
  const ready = calculateCowsScore({
    pulse: 2,
    sweating: 2,
    restlessness: 3,
    pupils: 2,
    bone_joint_aches: 2,
    runny_nose_tearing: 3,
  });
  assert.equal(ready.totalScore, 14);
  assert.equal(ready.inductionReady, true);
  assert.match(ready.buprenorphineInduction.clinicalAction, /commonly used clinical thresholds under prescriber guidance/i);
  assert.match(ready.buprenorphineInduction.clinicalAction, /WARNING — PRESCRIBER DIRECTED/);
  assert.match(ready.buprenorphineInduction.clinicalAction, /licensed prescriber/i);

  // Score 3: Wait / Micro-induction
  const wait = calculateCowsScore({ pulse: 1, sweating: 2 });
  assert.equal(wait.totalScore, 3);
  assert.equal(wait.inductionReady, false);
  assert.match(wait.buprenorphineInduction.clinicalAction, /commonly used clinical thresholds under prescriber guidance/i);
  assert.match(wait.buprenorphineInduction.clinicalAction, /WARNING — PRESCRIBER DIRECTED/);
  assert.match(wait.buprenorphineInduction.clinicalAction, /licensed prescriber/i);
  assert.match(wait.buprenorphineInduction.clinicalAction, /Bernese/i);
});

// ============================================================================
// SUITE 5: CIWA-Ar Alcohol Withdrawal Self-Check & EMTALA Emergency Triage
// ============================================================================

test('severe CIWA scores (>=19) lead with CALL 911 IMMEDIATELY / emergency hospital evaluation under EMTALA', () => {
  const severe = calculateCiwaScore({
    nausea_vomiting: 4,
    tremor: 4,
    paroxysmal_sweats: 4,
    anxiety: 4,
    headache: 3,
  });
  assert.equal(severe.totalScore, 19);
  assert.equal(severe.emergencyEvaluationRequired, true);
  assert.match(severe.clinicalAction, /^CALL 911 IMMEDIATELY \/ EMERGENCY HOSPITAL EVALUATION REQUIRED/i);
  assert.match(severe.clinicalAction, /EMTALA 42 U\.S\.C\. § 1395dd/);
  assert.match(severe.clinicalAction, /Emergency Department/i);
  assert.match(severe.clinicalAction, /Delirium Tremens/i);
});

test('presence of hallucinations, disorientation, or seizure risk leads with CALL 911 IMMEDIATELY regardless of total score', () => {
  // Hallucinations present with low overall score
  const halluc = calculateCiwaScore({ tactile_disturbances: 4 });
  assert.equal(halluc.emergencyEvaluationRequired, true);
  assert.match(halluc.clinicalAction, /^CALL 911 IMMEDIATELY \/ EMERGENCY HOSPITAL EVALUATION REQUIRED/i);
  assert.match(halluc.clinicalAction, /EMTALA/);

  // Disorientation present with low overall score
  const disor = calculateCiwaScore({ orientation: 3 });
  assert.equal(disor.emergencyEvaluationRequired, true);
  assert.match(disor.clinicalAction, /^CALL 911 IMMEDIATELY \/ EMERGENCY HOSPITAL EVALUATION REQUIRED/i);
  assert.match(disor.clinicalAction, /EMTALA/);

  // Seizure risk flag present with low overall score
  const seizure = calculateCiwaScore({ tremor: 2, seizureRisk: true });
  assert.equal(seizure.emergencyEvaluationRequired, true);
  assert.equal(seizure.hasSeizureRisk, true);
  assert.match(seizure.clinicalAction, /^CALL 911 IMMEDIATELY \/ EMERGENCY HOSPITAL EVALUATION REQUIRED/i);
  assert.match(seizure.clinicalAction, /EMTALA/);
});

// ============================================================================
// SUITE 6: Self-Report / Self-Check Disclaimer on Assessment Outputs
// ============================================================================

test('self-report and self-check disclaimer is present on assessment report output', () => {
  const report = formatAssessmentReportText({
    activeScale: 'cows',
    cowsAnswers: { pulse: 2, sweating: 2 },
    ciwaAnswers: {},
  });

  assert.match(report, /Informational Self-Check Tool/i);
  assert.match(report, /NOT a formal medical diagnosis or prescription/i);
  assert.match(report, /licensed clinician must assess you/i);
  assert.match(report, /commonly used clinical thresholds under prescriber guidance/i);
  assert.match(report, /EMTALA \(42 U\.S\.C\. § 1395dd\)/);
  assert.match(report, /In-RAM Privacy/i);
});

test('assessmentView renders self-check disclaimer callout and prescriber guidance warnings', () => {
  // Lightweight MockNode for test environment
  class MockNode {
    constructor(tag) {
      this.tagName = tag ? tag.toUpperCase() : 'DIV';
      this.className = '';
      this.dataset = {};
      this.attributes = {};
      this.listeners = {};
      this.children = [];
      this.value = '';
      this.checked = false;
      this.hidden = false;
      this._textContent = '';
      this.classList = {
        _classes: new Set(),
        add: (...cls) => cls.forEach((c) => this.classList._classes.add(c)),
        remove: (...cls) => cls.forEach((c) => this.classList._classes.delete(c)),
        toggle: (c, force) => {
          if (force !== undefined) {
            if (force) this.classList._classes.add(c);
            else this.classList._classes.delete(c);
          } else {
            if (this.classList._classes.has(c)) this.classList._classes.delete(c);
            else this.classList._classes.add(c);
          }
        },
        contains: (c) => this.classList._classes.has(c),
      };
    }
    get textContent() {
      if (this.children.length === 0) return this._textContent;
      return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
    }
    set textContent(v) {
      this._textContent = String(v ?? '');
      this.children = [];
    }
    setAttribute(k, v) {
      this.attributes[k] = String(v);
    }
    getAttribute(k) {
      return this.attributes[k] ?? null;
    }
    removeAttribute(k) {
      delete this.attributes[k];
    }
    addEventListener(evt, fn) {
      this.listeners[evt] = fn;
    }
    dispatchEvent(evt) {
      const fn = this.listeners[evt];
      if (typeof fn === 'function') fn();
    }
    append(...items) {
      for (const item of items) {
        if (typeof item === 'string') {
          const textNode = new MockNode('#text');
          textNode._textContent = item;
          textNode.parent = this;
          this.children.push(textNode);
        } else if (item) {
          item.parent = this;
          this.children.push(item);
        }
      }
    }
    remove() {
      if (!this.parent) return;
      const idx = this.parent.children.indexOf(this);
      if (idx >= 0) this.parent.children.splice(idx, 1);
    }
    findAll(pred, acc = []) {
      if (pred(this)) acc.push(this);
      for (const ch of this.children) {
        if (ch instanceof MockNode) ch.findAll(pred, acc);
      }
      return acc;
    }
  }

  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;
  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };

  try {
    resetAssessmentState();
    const root = assessmentView();
    const fullText = root.textContent;

    // Must include self-check disclaimer and not a medical diagnosis
    assert.match(fullText, /Clinical Self-Check Disclaimer — Not a Medical Diagnosis/i);
    assert.match(fullText, /informational self-check screening tool/i);
    assert.match(fullText, /NOT a clinical diagnosis or medical prescription/i);
    assert.match(fullText, /commonly used clinical thresholds under prescriber guidance/i);
    assert.match(fullText, /licensed prescriber/i);
    assert.match(fullText, /EMTALA/);
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
  }
});
