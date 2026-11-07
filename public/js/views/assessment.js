import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, emergencyCallout } from './common.js';
import { t } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetAssessmentState);

// ============================================================================
// Clinical Constants & Validated Dimension Taxonomies
// ============================================================================

/**
 * Validated Clinical Opiate Withdrawal Scale (COWS) dimensions.
 * Standard 11-item observer-rated clinical instrument for quantifying opioid withdrawal severity.
 * Maximum score: 48.
 * Validated Severity bands:
 * - 0–4: Minimal / No withdrawal
 * - 5–12: Mild withdrawal
 * - 13–24: Moderate withdrawal
 * - 25–36: Moderately severe withdrawal
 * - >36: Severe withdrawal
 * Clinical Action Threshold: COWS >= 12–13 required for standard buprenorphine induction.
 */
export const COWS_DIMENSIONS = [
  {
    id: 'pulse',
    label: 'Resting pulse rate',
    prompt: 'Measured after patient is sitting or lying down for one minute.',
    maxScore: 4,
    options: [
      { score: 0, label: 'Pulse rate 80 or below' },
      { score: 1, label: 'Pulse rate 81–100' },
      { score: 2, label: 'Pulse rate 101–120' },
      { score: 4, label: 'Pulse rate greater than 120' },
    ],
  },
  {
    id: 'sweating',
    label: 'Sweating',
    prompt: 'Over past 1/2 hour not accounted for by room temperature or patient activity.',
    maxScore: 4,
    options: [
      { score: 0, label: 'No report of chills or flushing' },
      { score: 1, label: 'Subjective report of chills or flushing' },
      { score: 2, label: 'Flushed or observable moistness on face' },
      { score: 3, label: 'Beads of sweat on brow or face' },
      { score: 4, label: 'Sweat streaming off face' },
    ],
  },
  {
    id: 'restlessness',
    label: 'Restlessness',
    prompt: 'Observation during assessment.',
    maxScore: 5,
    options: [
      { score: 0, label: 'Able to sit still' },
      { score: 1, label: 'Reports difficulty sitting still, but is able to do so' },
      { score: 3, label: 'Frequent shifting or extraneous movements of legs/arms' },
      { score: 5, label: 'Unable to sit still for more than a few seconds' },
    ],
  },
  {
    id: 'pupils',
    label: 'Pupil size',
    prompt: 'Assessed in room light relative to baseline.',
    maxScore: 5,
    options: [
      { score: 0, label: 'Pupils pinned or normal size for room light' },
      { score: 1, label: 'Pupils possibly larger than normal for room light' },
      { score: 2, label: 'Pupils moderately dilated' },
      { score: 5, label: 'Pupils so dilated that only the rim of the iris is visible' },
    ],
  },
  {
    id: 'bone_joint_aches',
    label: 'Bone or joint aches',
    prompt: 'If patient was having pain previously, only the additional pain attributed to withdrawal is scored.',
    maxScore: 4,
    options: [
      { score: 0, label: 'Not present' },
      { score: 1, label: 'Mild diffuse discomfort' },
      { score: 2, label: 'Patient reports severe diffuse aching of joints/muscles' },
      { score: 4, label: 'Patient is rubbing joints or muscles and unable to sit still due to discomfort' },
    ],
  },
  {
    id: 'runny_nose_tearing',
    label: 'Runny nose or tearing',
    prompt: 'Not accounted for by cold symptoms or allergies.',
    maxScore: 4,
    options: [
      { score: 0, label: 'Not present' },
      { score: 1, label: 'Nasal stuffiness or unusually moist eyes' },
      { score: 2, label: 'Nose running or tearing' },
      { score: 4, label: 'Nose constantly running or tears streaming down cheeks' },
    ],
  },
  {
    id: 'gi_upset',
    label: 'GI upset',
    prompt: 'Over last 1/2 hour.',
    maxScore: 5,
    options: [
      { score: 0, label: 'No GI symptoms' },
      { score: 1, label: 'Stomach cramps' },
      { score: 2, label: 'Nausea or loose stool' },
      { score: 3, label: 'Multiple episodes of diarrhea or vomiting' },
      { score: 5, label: 'Vomiting or diarrhea' },
    ],
  },
  {
    id: 'tremor',
    label: 'Tremor',
    prompt: 'Observation of outstretched hands.',
    maxScore: 4,
    options: [
      { score: 0, label: 'No tremor' },
      { score: 1, label: 'Tremor can be felt, but not observed' },
      { score: 2, label: 'Slight tremor observable' },
      { score: 4, label: 'Gross tremor or muscle twitching' },
    ],
  },
  {
    id: 'yawning',
    label: 'Yawning',
    prompt: 'Observation during assessment.',
    maxScore: 4,
    options: [
      { score: 0, label: 'No yawning' },
      { score: 1, label: 'Yawned once or twice during assessment' },
      { score: 2, label: 'Yawned three or more times during assessment' },
      { score: 4, label: 'Yawning several times/minute' },
    ],
  },
  {
    id: 'anxiety_irritability',
    label: 'Anxiety or irritability',
    prompt: 'Patient self-report and clinical observation.',
    maxScore: 4,
    options: [
      { score: 0, label: 'None' },
      { score: 1, label: 'Patient reports increasing irritability or anxiousness' },
      { score: 2, label: 'Patient obviously irritable or anxious' },
      { score: 4, label: 'Patient so irritable or anxious that participation in assessment is difficult' },
    ],
  },
  {
    id: 'gooseflesh',
    label: 'Gooseflesh skin',
    prompt: 'Piloerection on skin of arms or chest.',
    maxScore: 5,
    options: [
      { score: 0, label: 'Skin is smooth' },
      { score: 3, label: 'Piloerection of skin can be felt or hairs standing up on arms' },
      { score: 5, label: 'Prominent piloerection or gooseflesh' },
    ],
  },
];

export const COWS_SEVERITY_BANDS = [
  { id: 'none_minimal', min: 0, max: 4, label: 'Minimal / No withdrawal (0–4)', severity: 'minimal' },
  { id: 'mild', min: 5, max: 12, label: 'Mild withdrawal (5–12)', severity: 'mild' },
  { id: 'moderate', min: 13, max: 24, label: 'Moderate withdrawal (13–24)', severity: 'moderate' },
  { id: 'moderately_severe', min: 25, max: 36, label: 'Moderately severe withdrawal (25–36)', severity: 'moderately_severe' },
  { id: 'severe', min: 37, max: 48, label: 'Severe withdrawal (>36)', severity: 'severe' },
];

/**
 * Validated Clinical Institute Withdrawal Assessment for Alcohol, Revised (CIWA-Ar).
 * Standard 10-item clinician-rated instrument for quantifying alcohol withdrawal severity.
 * Maximum score: 67 (9 items scored 0–7; 1 item scored 0–4).
 * Validated Severity bands:
 * - <10: Mild withdrawal
 * - 10–18: Moderate withdrawal (medical detoxification indicated)
 * - >=19: Severe withdrawal (high risk of Delirium Tremens, seizures, aspiration; EMTALA emergency hospital evaluation)
 */
export const CIWA_DIMENSIONS = [
  {
    id: 'nausea_vomiting',
    label: 'Nausea and vomiting',
    prompt: 'Ask: "Do you feel sick to your stomach? Have you vomited?"',
    maxScore: 7,
    options: [
      { score: 0, label: 'No nausea and no vomiting' },
      { score: 1, label: 'Mild nausea with no vomiting' },
      { score: 2, label: 'Mild to moderate nausea' },
      { score: 3, label: 'Moderate nausea, dry heaves feeling' },
      { score: 4, label: 'Intermittent nausea with dry heaves' },
      { score: 5, label: 'Persistent nausea with dry heaves' },
      { score: 6, label: 'Severe continuous nausea with retching' },
      { score: 7, label: 'Constant nausea, frequent dry heaves and vomiting' },
    ],
  },
  {
    id: 'tremor',
    label: 'Tremor',
    prompt: 'Observation of arms extended and fingers spread apart.',
    maxScore: 7,
    options: [
      { score: 0, label: 'No tremor' },
      { score: 1, label: 'Not visible, but can be felt fingertip to fingertip' },
      { score: 2, label: 'Barely visible fine tremor' },
      { score: 3, label: 'Slight visible tremor' },
      { score: 4, label: 'Moderate tremor with arms extended' },
      { score: 5, label: 'Marked tremor with arms extended' },
      { score: 6, label: 'Severe tremor' },
      { score: 7, label: 'Severe tremor even with arms not extended' },
    ],
  },
  {
    id: 'paroxysmal_sweats',
    label: 'Paroxysmal sweats',
    prompt: 'Observation of palms, forehead, and clothing.',
    maxScore: 7,
    options: [
      { score: 0, label: 'No sweat visible' },
      { score: 1, label: 'Barely perceptible sweating, palms moist' },
      { score: 2, label: 'Mild sweating on palms and face' },
      { score: 3, label: 'Noticeable sweating on forehead' },
      { score: 4, label: 'Beads of sweat obvious on forehead' },
      { score: 5, label: 'Heavy perspiration on forehead and neck' },
      { score: 6, label: 'Profuse sweating soaking through shirt' },
      { score: 7, label: 'Drenching sweats' },
    ],
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    prompt: 'Ask: "Do you feel nervous or anxious?"',
    maxScore: 7,
    options: [
      { score: 0, label: 'No anxiety, at ease' },
      { score: 1, label: 'Mildly anxious' },
      { score: 2, label: 'Mild to moderate anxiety' },
      { score: 3, label: 'Moderately anxious' },
      { score: 4, label: 'Moderately anxious, or guarded, so anxiety is inferred' },
      { score: 5, label: 'Apprehensive, severe anxiety' },
      { score: 6, label: 'Marked fear or terror' },
      { score: 7, label: 'Acute panic state as seen in severe delirium or acute psychotic reaction' },
    ],
  },
  {
    id: 'agitation',
    label: 'Agitation',
    prompt: 'Observation of motor activity and restlessness.',
    maxScore: 7,
    options: [
      { score: 0, label: 'Normal activity' },
      { score: 1, label: 'Somewhat more than normal activity' },
      { score: 2, label: 'Mildly fidgety' },
      { score: 3, label: 'Noticeably restless' },
      { score: 4, label: 'Moderately fidgety and restless' },
      { score: 5, label: 'Pacing or moving frequently' },
      { score: 6, label: 'Markedly agitated and unable to remain still' },
      { score: 7, label: 'Paces back and forth during most of the interview, or constantly thrashes about' },
    ],
  },
  {
    id: 'tactile_disturbances',
    label: 'Tactile disturbances',
    prompt: 'Ask: "Have you any itching, pins and needles sensation, burning, numbness, or do you feel bugs crawling on or under your skin?"',
    maxScore: 7,
    options: [
      { score: 0, label: 'None' },
      { score: 1, label: 'Very mild itching, pins and needles, numbness or burning' },
      { score: 2, label: 'Mild itching, pins and needles, numbness or burning' },
      { score: 3, label: 'Moderate itching, pins and needles, numbness or burning' },
      { score: 4, label: 'Moderately severe hallucinations (tactile sensations present without external cause)' },
      { score: 5, label: 'Severe hallucinations' },
      { score: 6, label: 'Extremely severe hallucinations' },
      { score: 7, label: 'Continuous hallucinations' },
    ],
  },
  {
    id: 'auditory_disturbances',
    label: 'Auditory disturbances',
    prompt: 'Ask: "Are you more aware of sounds around you? Are they harsh? Do they frighten you? Are you hearing anything disturbing or that you know isn\'t there?"',
    maxScore: 7,
    options: [
      { score: 0, label: 'Not present' },
      { score: 1, label: 'Very mild harshness or ability to frighten' },
      { score: 2, label: 'Mild harshness or ability to frighten' },
      { score: 3, label: 'Moderate harshness or ability to frighten' },
      { score: 4, label: 'Moderately severe hallucinations (hearing sounds or voices not present)' },
      { score: 5, label: 'Severe hallucinations' },
      { score: 6, label: 'Extremely severe hallucinations' },
      { score: 7, label: 'Continuous hallucinations' },
    ],
  },
  {
    id: 'visual_disturbances',
    label: 'Visual disturbances',
    prompt: 'Ask: "Does the light appear too bright? Does it hurt your eyes? Are you seeing anything disturbing or that you know isn\'t there?"',
    maxScore: 7,
    options: [
      { score: 0, label: 'Not present' },
      { score: 1, label: 'Very mild sensitivity' },
      { score: 2, label: 'Mild sensitivity' },
      { score: 3, label: 'Moderate sensitivity' },
      { score: 4, label: 'Moderately severe hallucinations (seeing shapes, shadows, or figures not present)' },
      { score: 5, label: 'Severe hallucinations' },
      { score: 6, label: 'Extremely severe hallucinations' },
      { score: 7, label: 'Continuous hallucinations' },
    ],
  },
  {
    id: 'headache',
    label: 'Headache / fullness in head',
    prompt: 'Ask: "Does your head feel different? Does it feel like there is a band around your head?" (Do not rate for dizziness or lightheadedness).',
    maxScore: 7,
    options: [
      { score: 0, label: 'Not present' },
      { score: 1, label: 'Very mild' },
      { score: 2, label: 'Mild' },
      { score: 3, label: 'Moderate' },
      { score: 4, label: 'Moderately severe' },
      { score: 5, label: 'Severe' },
      { score: 6, label: 'Very severe' },
      { score: 7, label: 'Extremely severe' },
    ],
  },
  {
    id: 'orientation',
    label: 'Orientation and clouding of sensorium',
    prompt: 'Ask: "What day is this? Where are you? Who am I?"',
    maxScore: 4,
    options: [
      { score: 0, label: 'Oriented and can do serial additions' },
      { score: 1, label: 'Cannot do serial additions or is uncertain about date' },
      { score: 2, label: 'Disoriented for date by no more than 2 calendar days' },
      { score: 3, label: 'Disoriented for date by more than 2 calendar days' },
      { score: 4, label: 'Disoriented for place and/or person' },
    ],
  },
];

export const CIWA_SEVERITY_BANDS = [
  { id: 'mild', min: 0, max: 9, label: 'Mild alcohol withdrawal (<10)', severity: 'mild' },
  { id: 'moderate', min: 10, max: 18, label: 'Moderate alcohol withdrawal (10–18)', severity: 'moderate' },
  { id: 'severe', min: 19, max: 67, label: 'Severe alcohol withdrawal (>=19)', severity: 'severe' },
];

// ============================================================================
// Clinical Scoring Calculators
// ============================================================================

/**
 * Calculates validated COWS score and clinical buprenorphine induction readiness.
 *
 * Clinical Rule:
 * Standard buprenorphine induction requires COWS >= 12–13 to avoid precipitated withdrawal.
 * COWS < 12 suggests waiting for symptoms to intensify or utilizing a low-dose Bernese micro-induction schedule.
 *
 * @param {Object} answers - Map of dimension IDs to numeric scores.
 * @returns {Object} Comprehensive scoring object with severity band and induction action.
 */
export function calculateCowsScore(answers = {}) {
  const safeAnswers = answers && typeof answers === 'object' ? answers : {};
  let totalScore = 0;
  let answeredCount = 0;
  const dimensionScores = {};

  for (const dim of COWS_DIMENSIONS) {
    const rawVal = safeAnswers[dim.id];
    const scoreVal = rawVal !== undefined && rawVal !== null ? Number(rawVal) : null;
    const isValid = scoreVal !== null && !Number.isNaN(scoreVal);
    const score = isValid ? Math.max(0, Math.min(dim.maxScore, scoreVal)) : 0;

    if (isValid) {
      answeredCount++;
      totalScore += score;
    }
    const matchedOpt = dim.options.find((o) => o.score === score) || { score, label: `${score} pts` };
    dimensionScores[dim.id] = {
      score,
      answered: isValid,
      label: matchedOpt.label,
      maxScore: dim.maxScore,
    };
  }

  // Severity bands: Mild (5-12), Moderate (13-24), Moderately Severe (25-36), Severe (>36).
  let severityBand = COWS_SEVERITY_BANDS[0]; // minimal (0-4)
  if (totalScore >= 37) {
    severityBand = COWS_SEVERITY_BANDS[4]; // severe (>36)
  } else if (totalScore >= 25) {
    severityBand = COWS_SEVERITY_BANDS[3]; // moderately_severe (25-36)
  } else if (totalScore >= 13) {
    severityBand = COWS_SEVERITY_BANDS[2]; // moderate (13-24)
  } else if (totalScore >= 5) {
    severityBand = COWS_SEVERITY_BANDS[1]; // mild (5-12)
  }

  // Buprenorphine induction readiness
  // Clinical threshold: COWS >= 12-13 required for standard induction to prevent precipitated withdrawal; <12 suggests waiting or Bernese micro-induction
  const inductionReady = totalScore >= 12;
  const standardInductionThresholdMet = totalScore >= 13;

  const buprenorphineInduction = {
    ready: inductionReady,
    status: inductionReady ? 'ready' : 'wait_or_micro_induction',
    score: totalScore,
    threshold: '12–13 (commonly used clinical threshold under prescriber guidance)',
    headline: inductionReady
      ? 'Ready for Standard Buprenorphine Induction (COWS >= 12–13 under Prescriber Guidance)'
      : 'Wait or Prescriber-Directed Micro-Induction (COWS < 12) — Precipitated Withdrawal Warning',
    clinicalAction: inductionReady
      ? 'Standard buprenorphine induction is clinically indicated: Commonly used clinical thresholds under prescriber guidance (COWS >= 12–13) suggest sufficient mu-opioid receptor clearance to initiate buprenorphine with lower risk of precipitated withdrawal. WARNING — PRESCRIBER DIRECTED: All dosing recommendations and treatment plans must be directed by a licensed prescriber. Under prescriber direction, standard induction typically begins with an observed test dose (e.g., 2–4 mg sublingual) followed by clinical reassessment at 60–120 minutes before titration up to 8–16 mg as needed.'
      : 'Standard buprenorphine induction is CONTRAINDICATED at this time: Commonly used clinical thresholds under prescriber guidance require COWS >= 12–13 before standard buprenorphine induction to avoid precipitating acute, sudden withdrawal distress. WARNING — PRESCRIBER DIRECTED: Any medication adjustment or induction strategy must be directed by a licensed prescriber. Prescriber-directed clinical options include: (1) Waiting 2–4 hours for withdrawal symptoms to reach the prescriber-guided threshold; or (2) Prescriber-directed low-dose micro-induction (such as the Bernese method, starting at microgram doses like 0.2–0.5 mg buprenorphine while continuing full agonists under medical supervision). Physician-prescribed non-opioid comfort medications (clonidine, ondansetron, loperamide, NSAIDs) can relieve distress while waiting.',
    precipitatedWithdrawalRisk: inductionReady ? 'LOW' : 'HIGH',
  };

  const redFlags = [];
  if (dimensionScores.pulse?.score >= 4) {
    redFlags.push('Severe tachycardia (resting pulse > 120 bpm): Monitor cardiovascular stability and hydration.');
  }
  if (dimensionScores.gi_upset?.score >= 5) {
    redFlags.push('Severe gastrointestinal distress (vomiting/diarrhea): Monitor fluid balance and electrolyte depletion.');
  }
  if (totalScore >= 25) {
    redFlags.push('Moderately severe or severe opioid withdrawal: Patient in marked distress; urgent clinical evaluation and supportive induction care indicated.');
  }

  return {
    scale: 'cows',
    totalScore,
    maxScore: 48,
    answeredCount,
    totalDimensions: COWS_DIMENSIONS.length,
    isComplete: answeredCount === COWS_DIMENSIONS.length,
    severityBand,
    inductionReady,
    standardInductionThresholdMet,
    buprenorphineInduction,
    dimensionScores,
    redFlags,
  };
}

/**
 * Calculates validated CIWA-Ar score and alcohol withdrawal triage pathway.
 *
 * Clinical Rule:
 * - Mild (<10): Outpatient supportive care, low complication risk.
 * - Moderate (10–18): Medical detoxification indicated; benzodiazepine protocol recommended.
 * - Severe (>=19): High risk of Delirium Tremens, seizures, aspiration; EMTALA emergency hospital evaluation required.
 *
 * @param {Object} answers - Map of dimension IDs to numeric scores.
 * @returns {Object} Comprehensive scoring object with severity band and emergency flags.
 */
export function calculateCiwaScore(answers = {}) {
  const safeAnswers = answers && typeof answers === 'object' ? answers : {};
  let totalScore = 0;
  let answeredCount = 0;
  const dimensionScores = {};

  for (const dim of CIWA_DIMENSIONS) {
    const rawVal = safeAnswers[dim.id];
    const scoreVal = rawVal !== undefined && rawVal !== null ? Number(rawVal) : null;
    const isValid = scoreVal !== null && !Number.isNaN(scoreVal);
    const score = isValid ? Math.max(0, Math.min(dim.maxScore, scoreVal)) : 0;

    if (isValid) {
      answeredCount++;
      totalScore += score;
    }
    const matchedOpt = dim.options.find((o) => o.score === score) || { score, label: `${score} pts` };
    dimensionScores[dim.id] = {
      score,
      answered: isValid,
      label: matchedOpt.label,
      maxScore: dim.maxScore,
    };
  }

  // Severity bands: Mild (<10), Moderate (10-18, medical detox indicated), Severe (>=19, high risk of Delirium Tremens, seizures, aspiration; EMTALA emergency hospital evaluation).
  let severityBand = CIWA_SEVERITY_BANDS[0]; // mild (<10)
  if (totalScore >= 19) {
    severityBand = CIWA_SEVERITY_BANDS[2]; // severe (>=19)
  } else if (totalScore >= 10) {
    severityBand = CIWA_SEVERITY_BANDS[1]; // moderate (10-18)
  }

  const medicalDetoxIndicated = totalScore >= 10;
  const isSevereScore = totalScore >= 19;

  // Hallucination, disorientation, and seizure risk checks
  const hasHallucinations = Boolean(
    (dimensionScores.tactile_disturbances?.score >= 4) ||
    (dimensionScores.auditory_disturbances?.score >= 4) ||
    (dimensionScores.visual_disturbances?.score >= 4)
  );
  const hasDisorientation = Boolean(dimensionScores.orientation?.score >= 2);
  const hasSeizureRisk = Boolean(safeAnswers.seizureRisk || safeAnswers.seizureHistory || isSevereScore);

  const emergencyEvaluationRequired = isSevereScore || hasHallucinations || hasDisorientation || hasSeizureRisk;

  const redFlags = [];
  if (isSevereScore) {
    redFlags.push('CRITICAL EMERGENCY: Severe alcohol withdrawal score (>= 19). High risk of Delirium Tremens (DTs), generalized tonic-clonic seizures, hyperthermia, aspiration, and cardiovascular collapse. Immediate EMTALA emergency hospital evaluation required.');
  }
  if (hasHallucinations) {
    redFlags.push('PERCEPTUAL DISTURBANCE / HALLUCINATIONS: Tactile, auditory, or visual hallucinations indicate imminent or active Delirium Tremens. Immediate emergency medical evaluation required regardless of total score.');
  }
  if (hasDisorientation) {
    redFlags.push('SENSORIUM CLOUDING / DISORIENTATION: Significant disorientation indicates acute encephalopathy or delirium. Urgent medical stabilization required.');
  }
  if (safeAnswers.seizureRisk || safeAnswers.seizureHistory) {
    redFlags.push('SEIZURE RISK: Personal history or active risk of alcohol withdrawal seizures indicates dangerous instability. Immediate emergency hospital evaluation required.');
  }

  let clinicalAction = '';
  if (emergencyEvaluationRequired) {
    clinicalAction = 'CALL 911 IMMEDIATELY / EMERGENCY HOSPITAL EVALUATION REQUIRED (EMTALA 42 U.S.C. § 1395dd). The person is experiencing severe alcohol withdrawal or critical complication risks (score >= 19, hallucinations, disorientation, or seizure risk) and is at imminent risk of Delirium Tremens, generalized seizures, aspiration, and death. Call 911 or go to the nearest Emergency Department immediately. Under EMTALA, emergency departments are required to provide medical stabilization regardless of insurance or ability to pay. Inpatient hospital admission, continuous telemetry, and physician-directed benzodiazepine therapy are indicated.';
  } else if (totalScore >= 10) {
    clinicalAction = 'MEDICAL DETOXIFICATION INDICATED. Moderate alcohol withdrawal (CIWA-Ar 10–18). Self-check indicates need for professional medical detoxification. Pharmacotherapy with benzodiazepines (symptom-triggered or scheduled protocol, e.g., lorazepam or diazepam under prescriber direction) is clinically indicated to prevent progression to withdrawal seizures or Delirium Tremens. Parenteral or high-dose oral thiamine (200–500 mg daily) should be started immediately prior to glucose. Admission to a medically monitored withdrawal management facility (ASAM Level 3.2-WM or 3.7-WM) is recommended.';
  } else {
    clinicalAction = 'MILD WITHDRAWAL — OUTPATIENT SUPPORTIVE CARE. Mild withdrawal (<10). Medical detox is typically not required unless there is a past personal history of alcohol withdrawal seizures or Delirium Tremens. Self-check indicates supportive outpatient care: oral hydration with electrolytes, thiamine supplementation (100–500 mg daily), multivitamins with folate, and quiet environment. Re-assess with CIWA-Ar every 2–4 hours; if score climbs to 10+, escalate to medical detox.';
  }

  return {
    scale: 'ciwa',
    totalScore,
    maxScore: 67,
    answeredCount,
    totalDimensions: CIWA_DIMENSIONS.length,
    isComplete: answeredCount === CIWA_DIMENSIONS.length,
    severityBand,
    medicalDetoxIndicated,
    emergencyEvaluationRequired,
    clinicalAction,
    deliriumTremensRisk: isSevereScore || hasHallucinations ? 'HIGH' : (totalScore >= 10 ? 'MODERATE' : 'LOW'),
    seizureRisk: hasSeizureRisk ? 'HIGH' : (totalScore >= 10 ? 'MODERATE' : 'LOW'),
    hasHallucinations,
    hasDisorientation,
    hasSeizureRisk,
    dimensionScores,
    redFlags,
  };
}

// ============================================================================
// Ephemeral in-RAM State Management (Zero storage, Zero cookies, Zero URLs)
// ============================================================================

const createDefaultAssessmentState = () => ({
  activeScale: 'cows', // 'cows' | 'ciwa'
  cowsAnswers: {},
  ciwaAnswers: {},
  clinicalNotes: '',
  assessorRole: 'patient', // 'patient' | 'clinician' | 'peer_navigator'
  timestamp: null,
});

let inMemoryAssessmentState = createDefaultAssessmentState();
const assessmentListeners = new Set();
let activeAssessmentReset = null;

function notifyAssessmentListeners() {
  for (const fn of assessmentListeners) {
    try {
      fn(inMemoryAssessmentState);
    } catch {
      // guard subscriber errors
    }
  }
}

/**
 * Returns a deep copy of the active in-memory assessment state.
 * Guaranteed 100% ephemeral in browser RAM.
 *
 * @returns {Object}
 */
export function getAssessmentState() {
  return JSON.parse(JSON.stringify(inMemoryAssessmentState));
}

/**
 * Updates the in-memory assessment state with a partial patch.
 * Kept in ephemeral memory only; never saved to storage, cookies, or history/URL.
 *
 * @param {Object} patch
 * @returns {Object}
 */
export function setAssessmentState(patch = {}) {
  if (patch && typeof patch === 'object') {
    if (patch.activeScale === 'cows' || patch.activeScale === 'ciwa') {
      inMemoryAssessmentState.activeScale = patch.activeScale;
    }
    if (patch.cowsAnswers && typeof patch.cowsAnswers === 'object') {
      inMemoryAssessmentState.cowsAnswers = {
        ...inMemoryAssessmentState.cowsAnswers,
        ...patch.cowsAnswers,
      };
    }
    if (patch.ciwaAnswers && typeof patch.ciwaAnswers === 'object') {
      inMemoryAssessmentState.ciwaAnswers = {
        ...inMemoryAssessmentState.ciwaAnswers,
        ...patch.ciwaAnswers,
      };
    }
    if (typeof patch.clinicalNotes === 'string') {
      inMemoryAssessmentState.clinicalNotes = patch.clinicalNotes;
    }
    if (typeof patch.assessorRole === 'string') {
      inMemoryAssessmentState.assessorRole = patch.assessorRole;
    }
    if (patch.timestamp !== undefined) {
      inMemoryAssessmentState.timestamp = patch.timestamp;
    }
    notifyAssessmentListeners();
  }
  return getAssessmentState();
}

/**
 * Wipes all assessment state completely from browser RAM.
 * Integrated with Quick Exit and local reset actions.
 *
 * @returns {Object} Clean default state
 */
export function resetAssessmentState() {
  inMemoryAssessmentState = createDefaultAssessmentState();
  if (typeof activeAssessmentReset === 'function') {
    try {
      activeAssessmentReset();
    } catch {
      // guard unmount
    }
  }
  notifyAssessmentListeners();
  return getAssessmentState();
}

// ============================================================================
// Printable & Copyable Assessment Report Formatter
// ============================================================================

/**
 * Generates an evidence-based clinical withdrawal assessment report in plain text,
 * suitable for printing or secure clipboard transfer.
 *
 * @param {Object} [state] Optional state override (defaults to current in-RAM state).
 * @returns {string} Plain-text report
 */
export function formatAssessmentReportText(state = inMemoryAssessmentState) {
  const safeState = state || inMemoryAssessmentState;
  const cowsResult = calculateCowsScore(safeState.cowsAnswers || {});
  const ciwaResult = calculateCiwaScore(safeState.ciwaAnswers || {});
  const isCowsActive = safeState.activeScale !== 'ciwa';

  const lines = [
    '============================================================',
    'HARBORPATH CLINICAL WITHDRAWAL ASSESSMENT REPORT',
    'Validated COWS (Opioid) & CIWA-Ar (Alcohol) Clinical Scales',
    '============================================================',
    '',
    `Assessment Date / Time: ${safeState.timestamp ? new Date(safeState.timestamp).toISOString() : new Date().toISOString()}`,
    `Assessor Perspective: ${safeState.assessorRole || 'patient'} self-report / clinical triage`,
    '',
    'CLINICAL & REGULATORY NOTICE:',
    '• Informational Self-Check Tool: This is an informational self-check screening tool based on standard validated clinical scales.',
    '• This document is NOT a formal medical diagnosis or prescription. A licensed clinician must assess you.',
    '• Prescriber Guidance Required: Score thresholds (e.g. COWS >= 12–13) are commonly used clinical thresholds under prescriber guidance. All buprenorphine induction decisions, test doses, and micro-induction schedules must be directed by a licensed prescriber.',
    '• Emergency Warning: If experiencing severe alcohol withdrawal (CIWA-Ar >= 19), hallucinations, disorientation, seizures, chest pain, or difficulty breathing, call 911 or visit the nearest Emergency Department immediately (protected under EMTALA, 42 U.S.C. § 1395dd).',
    '• In-RAM Privacy: Answers are evaluated in temporary browser memory only and are not written to device storage or sent over the internet.',
    '',
  ];

  if (isCowsActive || Object.keys(safeState.cowsAnswers || {}).length > 0) {
    lines.push(
      '------------------------------------------------------------',
      'CLINICAL OPIATE WITHDRAWAL SCALE (COWS)',
      '------------------------------------------------------------',
      `Total Score: ${cowsResult.totalScore} / 48`,
      `Severity Band: ${cowsResult.severityBand.label}`,
      `Buprenorphine Induction Readiness: ${cowsResult.buprenorphineInduction.headline}`,
      `Precipitated Withdrawal Risk: ${cowsResult.buprenorphineInduction.precipitatedWithdrawalRisk}`,
      '',
      'CLINICAL ACTION & PROTOCOL GUIDANCE:',
      cowsResult.buprenorphineInduction.clinicalAction,
      '',
    );

    if (cowsResult.redFlags.length > 0) {
      lines.push('CLINICAL ALERTS / RED FLAGS:');
      for (const rf of cowsResult.redFlags) lines.push(`• ${rf}`);
      lines.push('');
    }

    lines.push(`DIMENSION BREAKDOWN (${cowsResult.answeredCount}/${cowsResult.totalDimensions} dimensions answered):`);
    for (const dim of COWS_DIMENSIONS) {
      const d = cowsResult.dimensionScores[dim.id];
      const answerStatus = d.answered ? `${d.score} pts (${d.label})` : 'Not answered (0 pts scored)';
      lines.push(`• ${dim.label}: ${answerStatus} [Max: ${dim.maxScore}]`);
    }
    lines.push('');
  }

  if (!isCowsActive || Object.keys(safeState.ciwaAnswers || {}).length > 0) {
    lines.push(
      '------------------------------------------------------------',
      'CLINICAL INSTITUTE WITHDRAWAL ASSESSMENT FOR ALCOHOL (CIWA-Ar)',
      '------------------------------------------------------------',
      `Total Score: ${ciwaResult.totalScore} / 67`,
      `Severity Band: ${ciwaResult.severityBand.label}`,
      `Medical Detoxification Indicated: ${ciwaResult.medicalDetoxIndicated ? 'YES' : 'NO (Outpatient supportive care)'}`,
      `Emergency Hospital Evaluation Required: ${ciwaResult.emergencyEvaluationRequired ? 'YES (CRITICAL EMTALA RISK)' : 'NO'}`,
      `Delirium Tremens Risk: ${ciwaResult.deliriumTremensRisk}`,
      `Seizure Risk: ${ciwaResult.seizureRisk}`,
      '',
      'CLINICAL ACTION & PROTOCOL GUIDANCE:',
      ciwaResult.clinicalAction,
      '',
    );

    if (ciwaResult.redFlags.length > 0) {
      lines.push('CRITICAL EMERGENCY ALERTS:');
      for (const rf of ciwaResult.redFlags) lines.push(`• ${rf}`);
      lines.push('');
    }

    lines.push(`DIMENSION BREAKDOWN (${ciwaResult.answeredCount}/${ciwaResult.totalDimensions} dimensions answered):`);
    for (const dim of CIWA_DIMENSIONS) {
      const d = ciwaResult.dimensionScores[dim.id];
      const answerStatus = d.answered ? `${d.score} pts (${d.label})` : 'Not answered (0 pts scored)';
      lines.push(`• ${dim.label}: ${answerStatus} [Max: ${dim.maxScore}]`);
    }
    lines.push('');
  }

  if (safeState.clinicalNotes && safeState.clinicalNotes.trim()) {
    lines.push(
      '------------------------------------------------------------',
      'CLINICAL NOTES & VITAL SIGNS (EPHEMERAL RAM):',
      '------------------------------------------------------------',
      safeState.clinicalNotes.trim(),
      '',
    );
  }

  lines.push(
    '============================================================',
    '24/7 IMMEDIATE CRISIS & OVERDOSE RESOURCES:',
    '• 988 Suicide & Crisis Lifeline: Call or text 988 (free, confidential, 24/7)',
    '• SAMHSA National Helpline: 1-800-662-4357 (treatment locator & referral, 24/7)',
    '• Never Use Alone: 1-877-696-1996 (overdose prevention call while using)',
    '• Overdose Emergency: If person is unresponsive, administer Naloxone (Narcan) and call 911.',
    '',
    'PATIENT RIGHTS & LEGAL PROTECTIONS:',
    '• EMTALA (42 U.S.C. § 1395dd): Emergency departments must provide screening and stabilizing care regardless of insurance or ability to pay.',
    '• 42 CFR Part 2 (89 FR 12472): Substance use disorder records are protected from disclosure without explicit written consent.',
    '• EKRA (18 U.S.C. § 220): Federal law strictly prohibits patient brokering and referral kickbacks.',
    '============================================================',
  );

  return lines.join('\n');
}

// ============================================================================
// Interactive DOM View Builder (Safe DOM nodes via h(), Accessible, WCAG 2.2 AA)
// ============================================================================

/**
 * Builds the interactive clinical withdrawal assessment view.
 * 100% ephemeral in-RAM state, WCAG 2.2 AA compliant radio controls, high-contrast badges,
 * and print-ready stylesheet integration.
 *
 * @param {Object} [options]
 * @param {URLSearchParams} [options.query]
 * @returns {HTMLElement}
 */
export function assessmentView({ query } = {}) {
  // Read initial scale hint if provided in memory query; never write back to URL
  const initialScale = query?.get('scale') === 'ciwa' ? 'ciwa' : inMemoryAssessmentState.activeScale || 'cows';
  inMemoryAssessmentState.activeScale = initialScale;

  const root = h('div', { class: 'wrap view view-prose view-assessment' });

  // 1. Header
  const header = pageHeader(
    t('assessment.title', 'Clinical Withdrawal Assessment (COWS & CIWA-Ar)'),
    t(
      'assessment.lede',
      'Evidence-based clinical withdrawal self-check tool for opioids (COWS) and alcohol (CIWA-Ar). Evaluates buprenorphine induction readiness under commonly used prescriber guidance, medical detox thresholds, and emergency hospital evaluation needs with 100% ephemeral in-RAM privacy.',
    ),
  );
  root.append(header);

  // 2. Ephemeral In-RAM Privacy Guarantee Callout
  const privacyCallout = h(
    'div',
    { class: 'callout callout-info' },
    h(
      'p',
      { class: 'callout-title' },
      icon('shield'),
      t('assessment.privacy.title', '100% Ephemeral In-RAM Privacy Guarantee'),
    ),
    p(
      t(
        'assessment.privacy.body',
        'Clinical answers, scores, and notes exist strictly in your device’s temporary browser RAM and are not written to device storage or URL queries. They are wiped upon clicking Quick Exit, clicking Reset, or closing this tab.',
      ),
    ),
  );
  root.append(privacyCallout);

  // 2b. Clinical Self-Check Disclaimer Callout
  const disclaimerCallout = h(
    'div',
    { class: 'callout callout-warn' },
    h(
      'p',
      { class: 'callout-title' },
      icon('alert'),
      'Clinical Self-Check Disclaimer — Not a Medical Diagnosis',
    ),
    p(
      'This assessment is an informational self-check screening tool based on validated clinical scales, NOT a clinical diagnosis or medical prescription. COWS thresholds (>= 12–13) reflect commonly used clinical thresholds under prescriber guidance, and all dosing regimens (test doses, micro-inductions, comfort medications) must be directed by a licensed prescriber. Any severe alcohol withdrawal score (CIWA-Ar >= 19), hallucinations, confusion, or seizure risk requires immediate emergency medical evaluation (Call 911 / EMTALA emergency hospital evaluation).',
    ),
  );
  root.append(disclaimerCallout);

  // 3. Scale Selector Tabs (COWS vs CIWA-Ar)
  const tabList = h('div', { class: 'tabs', role: 'tablist', 'aria-label': t('assessment.tabs.label', 'Withdrawal assessment scale') });
  const cowsTab = h(
    'button',
    {
      type: 'button',
      class: `tab-btn link-btn ${inMemoryAssessmentState.activeScale === 'cows' ? 'active' : ''}`,
      role: 'tab',
      'aria-selected': inMemoryAssessmentState.activeScale === 'cows' ? 'true' : 'false',
      'aria-controls': 'cows-panel',
      id: 'tab-cows',
    },
    'Clinical Opiate Withdrawal Scale (COWS)',
  );
  const ciwaTab = h(
    'button',
    {
      type: 'button',
      class: `tab-btn link-btn ${inMemoryAssessmentState.activeScale === 'ciwa' ? 'active' : ''}`,
      role: 'tab',
      'aria-selected': inMemoryAssessmentState.activeScale === 'ciwa' ? 'true' : 'false',
      'aria-controls': 'ciwa-panel',
      id: 'tab-ciwa',
    },
    'Alcohol Withdrawal Scale (CIWA-Ar)',
  );
  tabList.append(cowsTab, ciwaTab);
  root.append(tabList);

  // 4. Live Clinical Score Summary Card (Printable & High Contrast)
  const scoreCard = h('div', { class: 'card asam-summary-card print-handout', 'aria-live': 'polite', id: 'assessment-summary' });
  const scoreHeader = h('h2', { class: 'card-title' }, 'Live Clinical Assessment Summary');
  const scoreBadgeWrap = h('div', { class: 'chips', style: undefined });
  const scoreBadge = h('span', { class: 'chip chip-primary badge-score' }, 'Calculating...');
  const severityBadge = h('span', { class: 'chip badge-severity' }, 'Mild');
  const inductionBadge = h('span', { class: 'chip badge-action' }, '');
  scoreBadgeWrap.append(scoreBadge, severityBadge, inductionBadge);

  const actionBox = h('div', { class: 'callout callout-info' });
  const redFlagsContainer = h('div', { class: 'callout callout-emergency', hidden: true });

  scoreCard.append(scoreHeader, scoreBadgeWrap, actionBox, redFlagsContainer);
  root.append(scoreCard);

  // 5. Questionnaire Panels
  const cowsPanel = h('div', { id: 'cows-panel', role: 'tabpanel', 'aria-labelledby': 'tab-cows' });
  const ciwaPanel = h('div', { id: 'ciwa-panel', role: 'tabpanel', 'aria-labelledby': 'tab-ciwa', hidden: inMemoryAssessmentState.activeScale !== 'ciwa' });

  if (inMemoryAssessmentState.activeScale === 'ciwa') {
    cowsPanel.hidden = true;
  }

  // Radio button registry to support clean Quick Exit / Reset wipes
  const registeredRadios = [];

  // Helper to build a dimension question fieldset
  function renderDimensionFieldset(dim, scalePrefix, currentAnswers, onAnswer) {
    const fs = h('fieldset', { class: 'choice-group dimension-item' });
    const legend = h(
      'legend',
      null,
      h('span', { class: 'choice-label' }, `${dim.label} `),
      h('span', { class: 'choice-desc' }, `(Max: ${dim.maxScore} pt${dim.maxScore === 1 ? '' : 's'})`),
    );
    fs.append(legend);

    if (dim.prompt) {
      fs.append(h('p', { class: 'help' }, dim.prompt));
    }

    const grid = h('div', { class: 'choice-grid' });
    for (const opt of dim.options) {
      const radioId = `${scalePrefix}-${dim.id}-${opt.score}`;
      const radio = h('input', {
        type: 'radio',
        name: `${scalePrefix}-${dim.id}`,
        id: radioId,
        value: String(opt.score),
      });

      if (currentAnswers[dim.id] === opt.score) {
        radio.checked = true;
      }

      registeredRadios.push(radio);

      radio.addEventListener('change', () => {
        if (radio.checked) {
          onAnswer(dim.id, opt.score);
        }
      });

      const labelEl = h(
        'label',
        { class: 'choice', for: radioId },
        radio,
        h(
          'span',
          { class: 'choice-text' },
          h('span', { class: 'choice-label' }, `${opt.score} pt${opt.score === 1 ? '' : 's'}: ${opt.label}`),
        ),
      );
      grid.append(labelEl);
    }

    fs.append(grid);
    return fs;
  }

  // Build COWS Questionnaire
  const cowsHeader = h('h3', null, 'COWS 11 Clinical Dimensions (Opioid Withdrawal Self-Check)');
  cowsPanel.append(cowsHeader);
  for (const dim of COWS_DIMENSIONS) {
    const fs = renderDimensionFieldset(dim, 'cows', inMemoryAssessmentState.cowsAnswers, (id, score) => {
      inMemoryAssessmentState.cowsAnswers[id] = score;
      inMemoryAssessmentState.timestamp = Date.now();
      updateLiveSummary();
    });
    cowsPanel.append(fs);
  }

  // Build CIWA Questionnaire
  const ciwaHeader = h('h3', null, 'CIWA-Ar 10 Clinical Dimensions (Alcohol Withdrawal Self-Check — Not a Clinical Diagnosis)');
  ciwaPanel.append(ciwaHeader);
  for (const dim of CIWA_DIMENSIONS) {
    const fs = renderDimensionFieldset(dim, 'ciwa', inMemoryAssessmentState.ciwaAnswers, (id, score) => {
      inMemoryAssessmentState.ciwaAnswers[id] = score;
      inMemoryAssessmentState.timestamp = Date.now();
      updateLiveSummary();
    });
    ciwaPanel.append(fs);
  }

  root.append(cowsPanel, ciwaPanel);

  // 6. Optional Clinical & Vital Signs Notes (in-RAM only)
  const notesField = h('div', { class: 'field' });
  const notesLabel = h('label', { for: 'assessment-notes', class: 'choice-label' }, 'Clinical Notes & Vital Signs (held in RAM only):');
  const notesInput = h('textarea', {
    id: 'assessment-notes',
    class: 'input',
    rows: '3',
    placeholder: 'Enter optional clinical observations, blood pressure, oxygen saturation, or personal notes (cleared on exit)...',
  });
  notesInput.value = inMemoryAssessmentState.clinicalNotes || '';
  notesInput.addEventListener('input', () => {
    inMemoryAssessmentState.clinicalNotes = notesInput.value;
  });
  notesField.append(notesLabel, notesInput);
  root.append(notesField);

  // 7. Interactive Action Bar (Copy, Print, Reset, Detox Matching)
  const actionsBar = h('div', { class: 'actions assessment-actions no-print' });
  const copyBtn = h('button', { type: 'button', class: 'btn btn-primary' }, icon('clipboard'), ' Copy Assessment Report');
  const printBtn = h('button', { type: 'button', class: 'btn btn-secondary' }, icon('printer'), ' Print Assessment');
  const resetBtn = h('button', { type: 'button', class: 'btn btn-ghost' }, icon('x'), ' Clear Assessment (RAM Wipe)');
  const findDetoxBtn = h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=DT' }, icon('search'), ' Find Medical Detox Centers');

  actionsBar.append(copyBtn, printBtn, resetBtn, findDetoxBtn);
  root.append(actionsBar);

  // 8. Educational & Clinical Guidance Section (MD & SUDP Clinical Pearls)
  const clinicalEdu = section(
    'clinical-protocols',
    'Clinical Protocols: Buprenorphine Induction & Alcohol Withdrawal Safety',
    h('h3', null, '1. COWS & Buprenorphine Induction: Preventing Precipitated Withdrawal'),
    p(
      'Buprenorphine is a partial mu-opioid agonist with an extraordinarily high receptor binding affinity (higher than full agonists such as fentanyl, heroin, oxycodone, and methadone). If buprenorphine is administered while full agonists still occupy mu-opioid receptors, it rapidly displaces them without activating receptors to the same degree, precipitating sudden, agonizing withdrawal distress.',
    ),
    ul([
      'Standard Induction Rule: Wait until the patient exhibits clear objective signs of withdrawal with a validated COWS score of >= 12–13 before administering the first sublingual test dose (typically 2–4 mg).',
      'COWS < 12 Management: Do not give standard buprenorphine. Comfort medications (clonidine 0.1–0.2 mg every 6 hours, ondansetron 4–8 mg, loperamide, ibuprofen) can relieve subjective misery while awaiting receptor clearance.',
      'Low-Dose Bernese Micro-Induction: When high-potency synthetic opioids (fentanyl) are present in the supply, lipid storage prolongs clearance. Bernese micro-dosing introduces microgram doses of buprenorphine (e.g. 0.2–0.5 mg daily) while full agonists continue, gradually saturating receptors over 7–10 days without triggering withdrawal.',
      'CA Bridge High-Dose Protocol & Inpatient Pain: For acute hospital and ED inductions (8-16 mg initial dose) and acute surgical pain management on MOUD, see the Hospital Addiction & Patient Rights Guide (#/hospital-care).',
    ]),
    h('h3', null, '2. CIWA-Ar & Alcohol Withdrawal: Preventing Seizures & Delirium Tremens'),
    p(
      'Chronic alcohol consumption down-regulates inhibitory GABA-A receptors and up-regulates excitatory NMDA glutamate receptors. Abrupt cessation unmasks overwhelming central nervous system excitation, leading to malignant autonomic hyperactivity, delirium, and generalized seizures. Unlike opioid withdrawal, alcohol withdrawal can be fatal.',
    ),
    ul([
      'Mild Withdrawal (CIWA-Ar < 10): Outpatient supportive care with electrolyte hydration and high-dose thiamine (100–500 mg daily) to prevent Wernicke-Korsakoff syndrome.',
      'Moderate Withdrawal (CIWA-Ar 10–18): Medical detoxification indicated. Symptom-triggered benzodiazepine protocols (e.g. oral lorazepam 1–2 mg or diazepam 10–20 mg) restore GABAergic tone and prevent clinical deterioration.',
      'Severe Withdrawal (CIWA-Ar >= 19) or Hallucinations: Critical medical emergency. High risk of Delirium Tremens (DTs), grand mal seizures, and cardiac collapse. Immediate EMTALA-protected emergency hospital evaluation is mandatory.',
    ]),
    h('h3', null, '3. Federal Legal Protections: EMTALA & 42 CFR Part 2'),
    ul([
      'EMTALA (42 U.S.C. § 1395dd): Every Medicare-participating hospital emergency department must provide an emergency medical screening examination and stabilizing detox treatment regardless of insurance, inability to pay, or citizenship status.',
      '42 CFR Part 2 (89 FR 12472): Federal confidentiality laws protect substance use disorder records. Seeking help or completing an assessment does not create a public record or report to law enforcement.',
      'EKRA (18 U.S.C. § 220): Federal anti-brokering laws protect patients from unscrupulous recovery operators who pay kickbacks or provide deceptive admissions.',
    ]),
  );
  root.append(clinicalEdu);

  // Helper to re-render score cards and badges
  function updateLiveSummary() {
    clear(scoreBadgeWrap);
    clear(actionBox);
    clear(redFlagsContainer);

    const isCows = inMemoryAssessmentState.activeScale === 'cows';

    if (isCows) {
      const cows = calculateCowsScore(inMemoryAssessmentState.cowsAnswers);
      scoreBadge.textContent = `COWS Score: ${cows.totalScore} / 48`;
      scoreBadge.className = 'chip chip-primary badge-score';

      severityBadge.textContent = cows.severityBand.label;
      if (cows.totalScore >= 25) {
        severityBadge.className = 'chip chip-emergency badge-severity';
      } else if (cows.totalScore >= 13) {
        severityBadge.className = 'chip chip-warn badge-severity';
      } else {
        severityBadge.className = 'chip chip-secondary badge-severity';
      }

      inductionBadge.textContent = cows.buprenorphineInduction.ready
        ? 'Induction Ready (COWS >= 12)'
        : 'Wait / Micro-Induction (COWS < 12)';
      inductionBadge.className = cows.buprenorphineInduction.ready
        ? 'chip chip-ok badge-action'
        : 'chip chip-warn badge-action';

      scoreBadgeWrap.append(scoreBadge, severityBadge, inductionBadge);

      actionBox.className = cows.buprenorphineInduction.ready ? 'callout callout-info' : 'callout callout-warn';
      actionBox.append(
        h('p', { class: 'callout-title' }, icon(cows.buprenorphineInduction.ready ? 'check' : 'alert'), cows.buprenorphineInduction.headline),
        p(cows.buprenorphineInduction.clinicalAction),
      );

      if (cows.redFlags.length > 0) {
        redFlagsContainer.hidden = false;
        redFlagsContainer.append(
          h('p', { class: 'callout-title' }, icon('alert'), 'Clinical Alerts / Red Flags'),
          ul(cows.redFlags),
        );
      } else {
        redFlagsContainer.hidden = true;
      }

      announce(`COWS updated: Score ${cows.totalScore} of 48. ${cows.severityBand.label}. ${cows.buprenorphineInduction.headline}`);
    } else {
      const ciwa = calculateCiwaScore(inMemoryAssessmentState.ciwaAnswers);
      scoreBadge.textContent = `CIWA-Ar Score: ${ciwa.totalScore} / 67`;
      scoreBadge.className = 'chip chip-primary badge-score';

      severityBadge.textContent = ciwa.severityBand.label;
      if (ciwa.totalScore >= 19) {
        severityBadge.className = 'chip chip-emergency badge-severity';
      } else if (ciwa.totalScore >= 10) {
        severityBadge.className = 'chip chip-warn badge-severity';
      } else {
        severityBadge.className = 'chip chip-secondary badge-severity';
      }

      inductionBadge.textContent = ciwa.medicalDetoxIndicated
        ? (ciwa.totalScore >= 19 ? 'Hospital Emergency (EMTALA)' : 'Medical Detox Indicated')
        : 'Supportive Outpatient Care';
      inductionBadge.className = ciwa.totalScore >= 19
        ? 'chip chip-emergency badge-action'
        : (ciwa.medicalDetoxIndicated ? 'chip chip-warn badge-action' : 'chip chip-ok badge-action');

      scoreBadgeWrap.append(scoreBadge, severityBadge, inductionBadge);

      actionBox.className = ciwa.totalScore >= 19 ? 'callout callout-emergency' : (ciwa.medicalDetoxIndicated ? 'callout callout-warn' : 'callout callout-info');
      actionBox.append(
        h(
          'p',
          { class: 'callout-title' },
          icon(ciwa.totalScore >= 19 ? 'alert' : 'info'),
          ciwa.totalScore >= 19
            ? 'Severe Alcohol Withdrawal — Emergency Evaluation Required'
            : (ciwa.medicalDetoxIndicated ? 'Moderate Withdrawal — Medical Detox Indicated' : 'Mild Withdrawal — Outpatient Monitoring'),
        ),
        p(ciwa.clinicalAction),
      );

      if (ciwa.redFlags.length > 0) {
        redFlagsContainer.hidden = false;
        redFlagsContainer.append(
          h('p', { class: 'callout-title' }, icon('alert'), 'Critical Alcohol Withdrawal Red Flags'),
          ul(ciwa.redFlags),
        );
      } else {
        redFlagsContainer.hidden = true;
      }

      announce(`CIWA-Ar updated: Score ${ciwa.totalScore} of 67. ${ciwa.severityBand.label}. ${ciwa.clinicalAction}`);
    }
  }

  // Event handler for Tab switching
  function switchScale(targetScale) {
    if (inMemoryAssessmentState.activeScale === targetScale) return;
    inMemoryAssessmentState.activeScale = targetScale;

    const isCows = targetScale === 'cows';
    cowsTab.classList.toggle('active', isCows);
    cowsTab.setAttribute('aria-selected', isCows ? 'true' : 'false');
    ciwaTab.classList.toggle('active', !isCows);
    ciwaTab.setAttribute('aria-selected', !isCows ? 'true' : 'false');

    cowsPanel.hidden = !isCows;
    ciwaPanel.hidden = isCows;

    updateLiveSummary();
  }

  cowsTab.addEventListener('click', () => switchScale('cows'));
  ciwaTab.addEventListener('click', () => switchScale('ciwa'));

  // Action Bar event listeners
  copyBtn.addEventListener('click', async () => {
    const reportText = formatAssessmentReportText(inMemoryAssessmentState);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reportText);
        copyBtn.textContent = ' Copied to clipboard!';
        setTimeout(() => {
          copyBtn.textContent = ' Copy Assessment Report';
        }, 2000);
        announce(t('assessment.copied', 'Assessment report copied to clipboard.'));
      }
    } catch {
      announce(t('assessment.copy_failed', 'Could not copy report to clipboard.'));
    }
  });

  printBtn.addEventListener('click', () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  });

  resetBtn.addEventListener('click', () => {
    resetAssessmentState();
    announce(t('assessment.cleared', 'Assessment state cleared cleanly from memory.'));
  });

  // Register clean unmount and Quick Exit reset callback
  activeAssessmentReset = () => {
    for (const r of registeredRadios) {
      r.checked = false;
    }
    if (notesInput) {
      notesInput.value = '';
    }
    updateLiveSummary();
  };

  // Initial render of summary card
  updateLiveSummary();

  return root;
}
