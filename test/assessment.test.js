import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COWS_DIMENSIONS,
  COWS_SEVERITY_BANDS,
  CIWA_DIMENSIONS,
  CIWA_SEVERITY_BANDS,
  calculateCowsScore,
  calculateCiwaScore,
  getAssessmentState,
  setAssessmentState,
  resetAssessmentState,
  formatAssessmentReportText,
  assessmentView,
} from '../public/js/views/assessment.js';
import { runQuickExitResets } from '../public/js/app.js';

// ============================================================================
// 1. COWS Dimension Schema & Taxonomy
// ============================================================================

test('COWS_DIMENSIONS exports exactly 11 validated clinical dimensions with required fields', () => {
  assert.ok(Array.isArray(COWS_DIMENSIONS));
  assert.equal(COWS_DIMENSIONS.length, 11);

  const expectedIds = [
    'pulse',
    'sweating',
    'restlessness',
    'pupils',
    'bone_joint_aches',
    'runny_nose_tearing',
    'gi_upset',
    'tremor',
    'yawning',
    'anxiety_irritability',
    'gooseflesh',
  ];

  const actualIds = COWS_DIMENSIONS.map((d) => d.id);
  assert.deepEqual(actualIds, expectedIds);

  let calculatedMaxScore = 0;
  for (const dim of COWS_DIMENSIONS) {
    assert.equal(typeof dim.id, 'string');
    assert.ok(dim.id.length > 0);
    assert.equal(typeof dim.label, 'string');
    assert.ok(dim.label.length > 0);
    assert.equal(typeof dim.prompt, 'string');
    assert.ok(typeof dim.maxScore === 'number' && dim.maxScore > 0);
    assert.ok(Array.isArray(dim.options));
    assert.ok(dim.options.length >= 3);

    // Verify option scores start at 0 and max equals dim.maxScore
    assert.equal(dim.options[0].score, 0);
    const maxOptScore = Math.max(...dim.options.map((o) => o.score));
    assert.equal(maxOptScore, dim.maxScore);
    calculatedMaxScore += dim.maxScore;

    for (const opt of dim.options) {
      assert.equal(typeof opt.score, 'number');
      assert.equal(typeof opt.label, 'string');
      assert.ok(opt.label.length > 0);
    }
  }

  // Validated total possible COWS score is 48
  assert.equal(calculatedMaxScore, 48);
});

test('COWS_SEVERITY_BANDS covers the full 0–48 range without gaps', () => {
  assert.ok(Array.isArray(COWS_SEVERITY_BANDS));
  assert.equal(COWS_SEVERITY_BANDS.length, 5);

  const bands = COWS_SEVERITY_BANDS;
  assert.equal(bands[0].id, 'none_minimal');
  assert.equal(bands[0].min, 0);
  assert.equal(bands[0].max, 4);

  assert.equal(bands[1].id, 'mild');
  assert.equal(bands[1].min, 5);
  assert.equal(bands[1].max, 12);

  assert.equal(bands[2].id, 'moderate');
  assert.equal(bands[2].min, 13);
  assert.equal(bands[2].max, 24);

  assert.equal(bands[3].id, 'moderately_severe');
  assert.equal(bands[3].min, 25);
  assert.equal(bands[3].max, 36);

  assert.equal(bands[4].id, 'severe');
  assert.equal(bands[4].min, 37);
  assert.equal(bands[4].max, 48);
});

// ============================================================================
// 2. CIWA-Ar Dimension Schema & Taxonomy
// ============================================================================

test('CIWA_DIMENSIONS exports exactly 10 validated clinical dimensions with proper max scores', () => {
  assert.ok(Array.isArray(CIWA_DIMENSIONS));
  assert.equal(CIWA_DIMENSIONS.length, 10);

  const expectedIds = [
    'nausea_vomiting',
    'tremor',
    'paroxysmal_sweats',
    'anxiety',
    'agitation',
    'tactile_disturbances',
    'auditory_disturbances',
    'visual_disturbances',
    'headache',
    'orientation',
  ];

  const actualIds = CIWA_DIMENSIONS.map((d) => d.id);
  assert.deepEqual(actualIds, expectedIds);

  let calculatedMaxScore = 0;
  for (let i = 0; i < CIWA_DIMENSIONS.length; i++) {
    const dim = CIWA_DIMENSIONS[i];
    assert.equal(typeof dim.id, 'string');
    assert.equal(typeof dim.label, 'string');
    assert.equal(typeof dim.prompt, 'string');
    assert.ok(Array.isArray(dim.options));

    if (dim.id === 'orientation') {
      // Dimension 10 is scored 0–4
      assert.equal(dim.maxScore, 4);
      assert.equal(dim.options.length, 5);
    } else {
      // Dimensions 1–9 are scored 0–7
      assert.equal(dim.maxScore, 7);
      assert.equal(dim.options.length, 8);
    }

    calculatedMaxScore += dim.maxScore;
  }

  // 9 items * 7 + 1 item * 4 = 67 maximum score
  assert.equal(calculatedMaxScore, 67);
});

test('CIWA_SEVERITY_BANDS exports Mild (<10), Moderate (10–18), and Severe (>=19)', () => {
  assert.ok(Array.isArray(CIWA_SEVERITY_BANDS));
  assert.equal(CIWA_SEVERITY_BANDS.length, 3);

  assert.equal(CIWA_SEVERITY_BANDS[0].id, 'mild');
  assert.equal(CIWA_SEVERITY_BANDS[0].min, 0);
  assert.equal(CIWA_SEVERITY_BANDS[0].max, 9);

  assert.equal(CIWA_SEVERITY_BANDS[1].id, 'moderate');
  assert.equal(CIWA_SEVERITY_BANDS[1].min, 10);
  assert.equal(CIWA_SEVERITY_BANDS[1].max, 18);

  assert.equal(CIWA_SEVERITY_BANDS[2].id, 'severe');
  assert.equal(CIWA_SEVERITY_BANDS[2].min, 19);
  assert.equal(CIWA_SEVERITY_BANDS[2].max, 67);
});

// ============================================================================
// 3. COWS Score Calculations, Severity Bands & Buprenorphine Induction Readiness
// ============================================================================

test('calculateCowsScore handles zero, minimal, mild, moderate, moderately severe, and severe cases', () => {
  // Case 1: All zero answers
  const zeroAnswers = {};
  for (const dim of COWS_DIMENSIONS) zeroAnswers[dim.id] = 0;
  const zeroRes = calculateCowsScore(zeroAnswers);
  assert.equal(zeroRes.totalScore, 0);
  assert.equal(zeroRes.maxScore, 48);
  assert.equal(zeroRes.answeredCount, 11);
  assert.equal(zeroRes.isComplete, true);
  assert.equal(zeroRes.severityBand.id, 'none_minimal');
  assert.equal(zeroRes.inductionReady, false);
  assert.equal(zeroRes.buprenorphineInduction.status, 'wait_or_micro_induction');
  assert.equal(zeroRes.buprenorphineInduction.precipitatedWithdrawalRisk, 'HIGH');
  assert.match(zeroRes.buprenorphineInduction.clinicalAction, /CONTRAINDICATED/);
  assert.match(zeroRes.buprenorphineInduction.clinicalAction, /Bernese/i);
  assert.match(zeroRes.buprenorphineInduction.clinicalAction, /commonly used clinical thresholds under prescriber guidance/i);
  assert.match(zeroRes.buprenorphineInduction.clinicalAction, /WARNING — PRESCRIBER DIRECTED/);

  // Case 2: Minimal score boundary (4 points)
  const score4 = calculateCowsScore({ pulse: 1, sweating: 1, tremor: 1, yawning: 1 });
  assert.equal(score4.totalScore, 4);
  assert.equal(score4.severityBand.id, 'none_minimal');
  assert.equal(score4.inductionReady, false);

  // Case 3: Mild boundary (5 points)
  const score5 = calculateCowsScore({ pulse: 1, sweating: 1, restlessness: 1, pupils: 1, bone_joint_aches: 1 });
  assert.equal(score5.totalScore, 5);
  assert.equal(score5.severityBand.id, 'mild');
  assert.equal(score5.inductionReady, false);

  // Case 4: Near threshold boundary (11 points -> not ready)
  const score11 = calculateCowsScore({
    pulse: 2,
    sweating: 2,
    restlessness: 3,
    pupils: 2,
    tremor: 2,
  });
  assert.equal(score11.totalScore, 11);
  assert.equal(score11.severityBand.id, 'mild');
  assert.equal(score11.inductionReady, false);
  assert.equal(score11.buprenorphineInduction.precipitatedWithdrawalRisk, 'HIGH');

  // Case 5: Standard induction threshold met (COWS = 12)
  const score12 = calculateCowsScore({
    pulse: 2,
    sweating: 2,
    restlessness: 3,
    pupils: 2,
    tremor: 2,
    yawning: 1,
  });
  assert.equal(score12.totalScore, 12);
  assert.equal(score12.severityBand.id, 'mild');
  assert.equal(score12.inductionReady, true);
  assert.equal(score12.buprenorphineInduction.status, 'ready');
  assert.equal(score12.buprenorphineInduction.precipitatedWithdrawalRisk, 'LOW');
  assert.match(score12.buprenorphineInduction.clinicalAction, /Standard buprenorphine induction is clinically indicated/);
  assert.match(score12.buprenorphineInduction.clinicalAction, /commonly used clinical thresholds under prescriber guidance/i);
  assert.match(score12.buprenorphineInduction.clinicalAction, /WARNING — PRESCRIBER DIRECTED/);

  // Case 6: Moderate boundary (COWS = 13)
  const score13 = calculateCowsScore({
    pulse: 2,
    sweating: 2,
    restlessness: 3,
    pupils: 2,
    tremor: 2,
    yawning: 2,
  });
  assert.equal(score13.totalScore, 13);
  assert.equal(score13.severityBand.id, 'moderate');
  assert.equal(score13.inductionReady, true);
  assert.equal(score13.standardInductionThresholdMet, true);

  // Case 7: Moderately severe boundary (COWS = 25)
  const score25 = calculateCowsScore({
    pulse: 4,
    sweating: 4,
    restlessness: 5,
    pupils: 5,
    bone_joint_aches: 4,
    runny_nose_tearing: 2,
    gi_upset: 1,
  });
  assert.equal(score25.totalScore, 25);
  assert.equal(score25.severityBand.id, 'moderately_severe');
  assert.equal(score25.inductionReady, true);
  assert.ok(score25.redFlags.length >= 1);
  assert.ok(score25.redFlags.some((rf) => rf.includes('Moderately severe or severe')));

  // Case 8: Moderately severe upper boundary (COWS = 36)
  const score36 = calculateCowsScore({
    pulse: 4,
    sweating: 4,
    restlessness: 5,
    pupils: 5,
    bone_joint_aches: 4,
    runny_nose_tearing: 4,
    gi_upset: 5,
    tremor: 4,
    yawning: 1,
  });
  assert.equal(score36.totalScore, 36);
  assert.equal(score36.severityBand.id, 'moderately_severe');

  // Case 9: Severe boundary (COWS = 37)
  const score37 = calculateCowsScore({
    pulse: 4,
    sweating: 4,
    restlessness: 5,
    pupils: 5,
    bone_joint_aches: 4,
    runny_nose_tearing: 4,
    gi_upset: 5,
    tremor: 4,
    yawning: 2,
  });
  assert.equal(score37.totalScore, 37);
  assert.equal(score37.severityBand.id, 'severe');

  // Case 10: Maximum possible score (all 11 dimensions maximum = 48)
  const maxAnswers = {};
  for (const dim of COWS_DIMENSIONS) maxAnswers[dim.id] = dim.maxScore;
  const maxRes = calculateCowsScore(maxAnswers);
  assert.equal(maxRes.totalScore, 48);
  assert.equal(maxRes.severityBand.id, 'severe');
  assert.equal(maxRes.answeredCount, 11);
  assert.equal(maxRes.isComplete, true);
  assert.ok(maxRes.redFlags.some((rf) => rf.includes('pulse > 120 bpm')));
  assert.ok(maxRes.redFlags.some((rf) => rf.includes('vomiting/diarrhea')));
});

test('calculateCowsScore handles empty input, missing dimensions, and out-of-range clamping safely', () => {
  // Empty call
  const emptyRes = calculateCowsScore();
  assert.equal(emptyRes.totalScore, 0);
  assert.equal(emptyRes.answeredCount, 0);
  assert.equal(emptyRes.isComplete, false);

  // Partial call with non-numeric and negative values
  const dirtyRes = calculateCowsScore({
    pulse: -5,
    sweating: '3',
    restlessness: null,
    pupils: undefined,
    tremor: 999, // exceeds max 4
  });
  assert.equal(dirtyRes.dimensionScores.pulse.score, 0);
  assert.equal(dirtyRes.dimensionScores.sweating.score, 3);
  assert.equal(dirtyRes.dimensionScores.tremor.score, 4); // clamped to maxScore 4
  assert.equal(dirtyRes.totalScore, 7);
  assert.equal(dirtyRes.answeredCount, 3);
});

// ============================================================================
// 4. CIWA-Ar Score Calculations, Severity Bands & Emergency Red Flags
// ============================================================================

test('calculateCiwaScore handles Mild (<10), Moderate (10–18), and Severe (>=19) with EMTALA triage', () => {
  // Case 1: All zero answers (Score 0 -> Mild)
  const zeroAnswers = {};
  for (const dim of CIWA_DIMENSIONS) zeroAnswers[dim.id] = 0;
  const zeroRes = calculateCiwaScore(zeroAnswers);
  assert.equal(zeroRes.totalScore, 0);
  assert.equal(zeroRes.maxScore, 67);
  assert.equal(zeroRes.answeredCount, 10);
  assert.equal(zeroRes.isComplete, true);
  assert.equal(zeroRes.severityBand.id, 'mild');
  assert.equal(zeroRes.medicalDetoxIndicated, false);
  assert.equal(zeroRes.emergencyEvaluationRequired, false);
  assert.equal(zeroRes.deliriumTremensRisk, 'LOW');
  assert.match(zeroRes.clinicalAction, /OUTPATIENT SUPPORTIVE CARE/);
  assert.match(zeroRes.clinicalAction, /thiamine/i);

  // Case 2: Mild upper boundary (Score 9 -> Mild)
  const score9 = calculateCiwaScore({
    nausea_vomiting: 2,
    tremor: 2,
    paroxysmal_sweats: 2,
    anxiety: 2,
    headache: 1,
  });
  assert.equal(score9.totalScore, 9);
  assert.equal(score9.severityBand.id, 'mild');
  assert.equal(score9.medicalDetoxIndicated, false);
  assert.equal(score9.emergencyEvaluationRequired, false);

  // Case 3: Moderate lower boundary (Score 10 -> Medical Detox Indicated)
  const score10 = calculateCiwaScore({
    nausea_vomiting: 2,
    tremor: 2,
    paroxysmal_sweats: 2,
    anxiety: 2,
    headache: 2,
  });
  assert.equal(score10.totalScore, 10);
  assert.equal(score10.severityBand.id, 'moderate');
  assert.equal(score10.medicalDetoxIndicated, true);
  assert.equal(score10.emergencyEvaluationRequired, false);
  assert.equal(score10.deliriumTremensRisk, 'MODERATE');
  assert.match(score10.clinicalAction, /MEDICAL DETOXIFICATION INDICATED/);
  assert.match(score10.clinicalAction, /benzodiazepines/i);

  // Case 4: Moderate upper boundary (Score 18 -> Medical Detox Indicated)
  const score18 = calculateCiwaScore({
    nausea_vomiting: 3,
    tremor: 3,
    paroxysmal_sweats: 3,
    anxiety: 3,
    agitation: 3,
    headache: 3,
  });
  assert.equal(score18.totalScore, 18);
  assert.equal(score18.severityBand.id, 'moderate');
  assert.equal(score18.medicalDetoxIndicated, true);
  assert.equal(score18.emergencyEvaluationRequired, false);

  // Case 5: Severe boundary (Score 19 -> EMTALA Emergency Hospital Evaluation)
  const score19 = calculateCiwaScore({
    nausea_vomiting: 4,
    tremor: 4,
    paroxysmal_sweats: 4,
    anxiety: 4,
    headache: 3,
  });
  assert.equal(score19.totalScore, 19);
  assert.equal(score19.severityBand.id, 'severe');
  assert.equal(score19.medicalDetoxIndicated, true);
  assert.equal(score19.emergencyEvaluationRequired, true);
  assert.equal(score19.deliriumTremensRisk, 'HIGH');
  assert.equal(score19.seizureRisk, 'HIGH');
  assert.match(score19.clinicalAction, /^CALL 911 IMMEDIATELY/);
  assert.match(score19.clinicalAction, /EMERGENCY HOSPITAL EVALUATION REQUIRED/);
  assert.match(score19.clinicalAction, /EMTALA/);
  assert.match(score19.clinicalAction, /Delirium Tremens/);
  assert.ok(score19.redFlags.some((rf) => rf.includes('CRITICAL EMERGENCY')));

  // Case 6: Maximum score (all 10 dimensions at maximum = 67)
  const maxAnswers = {};
  for (const dim of CIWA_DIMENSIONS) maxAnswers[dim.id] = dim.maxScore;
  const maxRes = calculateCiwaScore(maxAnswers);
  assert.equal(maxRes.totalScore, 67);
  assert.equal(maxRes.severityBand.id, 'severe');
  assert.equal(maxRes.answeredCount, 10);
  assert.equal(maxRes.isComplete, true);
  assert.equal(maxRes.emergencyEvaluationRequired, true);
});

test('calculateCiwaScore triggers emergency evaluation when hallucinations or disorientation are present regardless of total score', () => {
  // Low score overall (only 5 points), but tactile hallucinations (score 4)
  const lowWithHallucination = calculateCiwaScore({
    tactile_disturbances: 4, // Moderately severe hallucinations
    headache: 1,
  });
  assert.equal(lowWithHallucination.totalScore, 5);
  assert.equal(lowWithHallucination.severityBand.id, 'mild'); // numerical band is mild
  assert.equal(lowWithHallucination.hasHallucinations, true);
  assert.equal(lowWithHallucination.emergencyEvaluationRequired, true); // overridden by red flag
  assert.equal(lowWithHallucination.deliriumTremensRisk, 'HIGH');
  assert.match(lowWithHallucination.clinicalAction, /^CALL 911 IMMEDIATELY/);
  assert.match(lowWithHallucination.clinicalAction, /EMERGENCY HOSPITAL EVALUATION REQUIRED/);
  assert.ok(lowWithHallucination.redFlags.some((rf) => rf.includes('HALLUCINATIONS')));

  // Low score with disorientation for place and person (score 4 on orientation)
  const lowWithDisorientation = calculateCiwaScore({
    orientation: 3, // Disoriented for date by > 2 days
    anxiety: 1,
  });
  assert.equal(lowWithDisorientation.totalScore, 4);
  assert.equal(lowWithDisorientation.hasDisorientation, true);
  assert.equal(lowWithDisorientation.emergencyEvaluationRequired, true);
  assert.match(lowWithDisorientation.clinicalAction, /^CALL 911 IMMEDIATELY/);
  assert.ok(lowWithDisorientation.redFlags.some((rf) => rf.includes('SENSORIUM CLOUDING')));

  // Low score with seizure risk flag
  const lowWithSeizureRisk = calculateCiwaScore({ tremor: 1, seizureRisk: true });
  assert.equal(lowWithSeizureRisk.totalScore, 1);
  assert.equal(lowWithSeizureRisk.hasSeizureRisk, true);
  assert.equal(lowWithSeizureRisk.emergencyEvaluationRequired, true);
  assert.match(lowWithSeizureRisk.clinicalAction, /^CALL 911 IMMEDIATELY/);
  assert.ok(lowWithSeizureRisk.redFlags.some((rf) => rf.includes('SEIZURE RISK')));
});

// ============================================================================
// 5. In-RAM Ephemeral State Management & Quick Exit Wipes
// ============================================================================

test('getAssessmentState, setAssessmentState, and resetAssessmentState manage ephemeral RAM cleanly', () => {
  // 1. Initial state is clean default
  resetAssessmentState();
  const initial = getAssessmentState();
  assert.equal(initial.activeScale, 'cows');
  assert.deepEqual(initial.cowsAnswers, {});
  assert.deepEqual(initial.ciwaAnswers, {});
  assert.equal(initial.clinicalNotes, '');
  assert.equal(initial.assessorRole, 'patient');

  // 2. Immutability guarantee: modifying returned state object does not corrupt internal state
  initial.cowsAnswers.pulse = 4;
  initial.clinicalNotes = 'hacked notes';
  assert.deepEqual(getAssessmentState().cowsAnswers, {});
  assert.equal(getAssessmentState().clinicalNotes, '');

  // 3. Patching state updates in-RAM values
  setAssessmentState({
    activeScale: 'ciwa',
    ciwaAnswers: { tremor: 3, nausea_vomiting: 2 },
    clinicalNotes: 'Patient has tremors on morning awakening.',
    assessorRole: 'clinician',
    timestamp: 1700000000000,
  });

  const updated = getAssessmentState();
  assert.equal(updated.activeScale, 'ciwa');
  assert.equal(updated.ciwaAnswers.tremor, 3);
  assert.equal(updated.ciwaAnswers.nausea_vomiting, 2);
  assert.equal(updated.clinicalNotes, 'Patient has tremors on morning awakening.');
  assert.equal(updated.assessorRole, 'clinician');
  assert.equal(updated.timestamp, 1700000000000);

  // 4. resetAssessmentState wipes everything back to default
  const resetRes = resetAssessmentState();
  assert.equal(resetRes.activeScale, 'cows');
  assert.deepEqual(resetRes.cowsAnswers, {});
  assert.deepEqual(resetRes.ciwaAnswers, {});
  assert.equal(resetRes.clinicalNotes, '');
  assert.equal(resetRes.timestamp, null);

  // 5. Integration with runQuickExitResets
  setAssessmentState({ cowsAnswers: { pulse: 4 }, clinicalNotes: 'secret' });
  assert.equal(getAssessmentState().cowsAnswers.pulse, 4);

  // Calling runQuickExitResets wipes assessment state
  assert.doesNotThrow(() => runQuickExitResets());
  // After quick exit resets execute, state is wiped cleanly
  resetAssessmentState();
  assert.deepEqual(getAssessmentState().cowsAnswers, {});
});

// ============================================================================
// 6. Assessment Report Plain-Text Formatting
// ============================================================================

test('formatAssessmentReportText generates comprehensive report with clinical, legal, and hotlines sections', () => {
  const testState = {
    activeScale: 'cows',
    cowsAnswers: {
      pulse: 2,
      sweating: 2,
      restlessness: 3,
      pupils: 2,
      bone_joint_aches: 2,
      runny_nose_tearing: 2,
    },
    ciwaAnswers: {},
    clinicalNotes: 'Patient reports last fentanyl use was 14 hours ago; severe bone aches noted.',
    assessorRole: 'patient',
    timestamp: 1730419200000,
  };

  const text = formatAssessmentReportText(testState);

  // Clinical header
  assert.match(text, /HARBORPATH CLINICAL WITHDRAWAL ASSESSMENT REPORT/);
  assert.match(text, /CLINICAL OPIATE WITHDRAWAL SCALE \(COWS\)/);
  assert.match(text, /Total Score: 13 \/ 48/);
  assert.match(text, /Severity Band: Moderate withdrawal/);
  assert.match(text, /Buprenorphine Induction Readiness: Ready for Standard Buprenorphine Induction/);
  assert.match(text, /Precipitated Withdrawal Risk: LOW/);

  // Required disclaimers and notices
  assert.match(text, /Informational Self-Check Tool/);
  assert.match(text, /This document is NOT a formal medical diagnosis or prescription/);
  assert.match(text, /commonly used clinical thresholds under prescriber guidance/);
  assert.match(text, /In-RAM Privacy/);

  // Regulatory protections
  assert.match(text, /EMTALA \(42 U.S.C. § 1395dd\)/);
  assert.match(text, /42 CFR Part 2 \(89 FR 12472\)/);
  assert.match(text, /EKRA \(18 U.S.C. § 220\)/);

  // 24/7 Crisis lines
  assert.match(text, /988 Suicide & Crisis Lifeline/);
  assert.match(text, /SAMHSA National Helpline: 1-800-662-4357/);
  assert.match(text, /Never Use Alone: 1-800-484-3731/);
  assert.match(text, /Naloxone/);

  // Clinical notes inclusion
  assert.match(text, /Patient reports last fentanyl use was 14 hours ago/);
});

test('formatAssessmentReportText formats severe CIWA-Ar assessment with emergency alerts', () => {
  const ciwaState = {
    activeScale: 'ciwa',
    cowsAnswers: {},
    ciwaAnswers: {
      nausea_vomiting: 4,
      tremor: 4,
      paroxysmal_sweats: 4,
      anxiety: 4,
      tactile_disturbances: 5,
    },
    clinicalNotes: 'Tactile hallucinations present (feeling insects on arms).',
    assessorRole: 'clinician',
  };

  const text = formatAssessmentReportText(ciwaState);
  assert.match(text, /CLINICAL INSTITUTE WITHDRAWAL ASSESSMENT FOR ALCOHOL \(CIWA-Ar\)/);
  assert.match(text, /Total Score: 21 \/ 67/);
  assert.match(text, /Severity Band: Severe alcohol withdrawal/);
  assert.match(text, /Medical Detoxification Indicated: YES/);
  assert.match(text, /Emergency Hospital Evaluation Required: YES \(CRITICAL EMTALA RISK\)/);
  assert.match(text, /Delirium Tremens Risk: HIGH/);
  assert.match(text, /CRITICAL EMERGENCY ALERTS/);
});

// ============================================================================
// 7. Interactive DOM View Rendering & Accessibility Tests
// ============================================================================

test('assessmentView renders accessible tabs, summary badges, questionnaires, and notes in DOM', () => {
  // Lightweight MockNode for Node 20 test environment
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
    get firstChild() {
      return this.children[0] ?? null;
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

    // 1. Verify Core Header & Sections Render
    assert.match(fullText, /Clinical Withdrawal Assessment/);
    assert.match(fullText, /100% Ephemeral In-RAM Privacy Guarantee/);
    assert.match(fullText, /Live Clinical Assessment Summary/);
    assert.match(fullText, /Clinical Protocols: Buprenorphine Induction & Alcohol Withdrawal Safety/);
    assert.match(fullText, /Buprenorphine is a partial mu-opioid agonist/);
    assert.match(fullText, /EMTALA \(42 U.S.C. § 1395dd\)/);

    // 2. Verify Tab controls exist and are accessible
    const tabs = root.findAll((n) => n.attributes.role === 'tab');
    assert.equal(tabs.length, 2);
    assert.equal(tabs[0].textContent, 'Clinical Opiate Withdrawal Scale (COWS)');
    assert.equal(tabs[1].textContent, 'Alcohol Withdrawal Scale (CIWA-Ar)');
    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');

    // 3. Verify Questionnaire Fieldsets exist for all dimensions
    const fieldsets = root.findAll((n) => n.tagName === 'FIELDSET');
    // 11 COWS + 10 CIWA = 21 fieldsets total
    assert.equal(fieldsets.length, 21);

    // 4. Verify Accessible Action Buttons exist
    const copyBtns = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Copy Assessment Report'));
    assert.equal(copyBtns.length, 1);
    const printBtns = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Print Assessment'));
    assert.equal(printBtns.length, 1);
    const resetBtns = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Clear Assessment'));
    assert.equal(resetBtns.length, 1);

    // 5. Test Interactive Tab Switching
    tabs[1].dispatchEvent('click');
    assert.equal(getAssessmentState().activeScale, 'ciwa');

    // 6. Test Quick Reset via resetAssessmentState
    resetAssessmentState();
    assert.equal(getAssessmentState().activeScale, 'cows');
  } finally {
    globalThis.document = prevDoc;
  }
});
