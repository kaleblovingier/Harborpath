import { h, clear, ext, tel, sms, icon, announce } from '../dom.js';
import { prefillMatch } from './match.js';
import { pageHeader, section, p, fine, ul, strong, emergencyCallout } from './common.js';
import { t } from '../i18n.js';

// Valid SAMHSA filter codes for Dimension 6 validation and chip display
const PAYMENT_OPTIONS = [
  { code: '', label: 'Any cost or insurance option' },
  { code: 'MD', label: 'Medicaid' },
  { code: 'MC', label: 'Medicare' },
  { code: 'PI', label: 'Private insurance' },
  { code: 'SS', label: 'Sliding fee scale (income-based)' },
  { code: 'PA', label: 'Payment assistance / charity care' },
  { code: 'NP', label: 'Free of charge (no payment accepted)' },
  { code: 'ITU', label: 'IHS / Tribal / Urban Indian health' },
  { code: 'TRICARE', label: 'TRICARE (military)' },
];

const POPULATION_OPTIONS = [
  { code: '', label: 'No specific population filter' },
  { code: 'VET', label: 'Veterans' },
  { code: 'ADOL', label: 'Teens / adolescents' },
  { code: 'YA', label: 'Young adults' },
  { code: 'SEN', label: 'Older adults / seniors' },
  { code: 'CJ', label: 'People with justice-system involvement' },
  { code: 'WN', label: 'Women-focused programs' },
  { code: 'MN', label: 'Men-focused programs' },
];

const VALID_PAYMENTS = new Set(PAYMENT_OPTIONS.map((o) => o.code).filter(Boolean));
const VALID_POPULATIONS = new Set(POPULATION_OPTIONS.map((o) => o.code).filter(Boolean));

const CODE_META = {
  BU: { label: 'Buprenorphine (Suboxone/Sublocade)', tone: 'med' },
  MU: { label: 'Methadone', tone: 'med' },
  OTP: { label: 'Opioid Treatment Program (OTP)', tone: 'med' },
  NU: { label: 'Naltrexone (Vivitrol)', tone: 'med' },
  PMAT: { label: 'Alcohol Use Disorder Medications', tone: 'med' },
  DT: { label: 'Detox / Withdrawal Management', tone: 'care' },
  HI: { label: 'Hospital Inpatient', tone: 'care' },
  RES: { label: 'Residential Care', tone: 'care' },
  HH: { label: 'Recovery Housing', tone: 'care' },
  IOP: { label: 'Intensive Outpatient (IOP)', tone: 'care' },
  PHP: { label: 'Partial Hospitalization / Day Program', tone: 'care' },
  OP: { label: 'Outpatient Care', tone: 'care' },
  TELE: { label: 'Telehealth', tone: 'care' },
  PW: { label: 'Pregnant / Postpartum Specialty', tone: 'extra' },
  MHSU: { label: 'Co-occurring Mental Health & SUD', tone: 'extra' },
  TRMA: { label: 'Trauma-Informed Care', tone: 'extra' },
  CMI: { label: 'Contingency Management', tone: 'extra' },
  NOE: { label: 'Naloxone & Overdose Education', tone: 'extra' },
  WI: { label: 'Walk-in Crisis Care', tone: 'care' },
  PEOFF: { label: 'Mobile Crisis Team', tone: 'care' },
  MD: { label: 'Medicaid', tone: 'pay' },
  MC: { label: 'Medicare', tone: 'pay' },
  PI: { label: 'Private Insurance', tone: 'pay' },
  SS: { label: 'Sliding Fee Scale', tone: 'pay' },
  PA: { label: 'Payment Assistance', tone: 'pay' },
  NP: { label: 'Free of Charge', tone: 'pay' },
  ITU: { label: 'IHS / Tribal / Urban Indian', tone: 'pay' },
  TRICARE: { label: 'TRICARE', tone: 'pay' },
  VET: { label: 'Veterans', tone: 'extra' },
  ADOL: { label: 'Teens / Adolescents', tone: 'extra' },
  YA: { label: 'Young Adults', tone: 'extra' },
  SEN: { label: 'Older Adults', tone: 'extra' },
  CJ: { label: 'Justice-Involved Support', tone: 'extra' },
  WN: { label: 'Women', tone: 'extra' },
  MN: { label: 'Men', tone: 'extra' },
};

const OPIOID_SYMPTOM_ITEMS = [
  {
    key: 'restlessness',
    label: 'Restlessness or inability to sit still',
    detail: 'Feeling antsy, tossing and turning, or pacing',
  },
  {
    key: 'sweating_chills',
    label: 'Sweating, hot flashes, or chills / shivering',
    detail: 'Drenching sweats or waves of cold chills not from fever',
  },
  {
    key: 'muscle_bone_aches',
    label: 'Diffuse muscle, back, joint, or bone aches',
    detail: 'Deep aching in legs, back, or joints',
  },
  {
    key: 'gi_upset',
    label: 'Stomach cramps, nausea, vomiting, or diarrhea',
    detail: 'GI distress over the last 30–60 minutes',
  },
  {
    key: 'runny_nose_tearing',
    label: 'Runny nose or watery / tearing eyes',
    detail: 'Unexplained by seasonal allergies or a cold',
  },
  {
    key: 'tremor_gooseflesh',
    label: 'Hand tremor / shakiness, goosebumps, or large pupils',
    detail: 'Visible objective physical signs of opioid withdrawal',
  },
  {
    key: 'anxiety_irritability',
    label: 'Anxiety, irritability, or racing heartbeat',
    detail: 'Feeling on edge, panicky, or heart pounding',
  },
  {
    key: 'yawning_insomnia',
    label: 'Frequent yawning or inability to sleep',
    detail: 'Repeated yawning or severe sleeplessness',
  },
];

const ALCOHOL_RISK_ITEMS = [
  {
    key: 'dailyHeavyUse',
    points: 2,
    label: 'Daily heavy alcohol use or daily benzodiazepine / sedative use (for 2+ weeks)',
    detail: 'Regular GABAergic substance dependence',
  },
  {
    key: 'priorSeizuresOrDTs',
    points: 4,
    label: 'Past withdrawal seizure, delirium tremens (DTs), or prior inpatient medical detox',
    detail: 'Strongest clinical predictor of severe, life-threatening withdrawal ("kindling" effect)',
  },
  {
    key: 'tremorSweatingAgitation',
    points: 2,
    label: 'Active hand shakes / tremors, drenching sweats, or severe agitation when cutting back',
    detail: 'Signs of active sympathetic nervous system hyperactivity',
  },
  {
    key: 'autonomicInstability',
    points: 3,
    label: 'Racing heart, high blood pressure, confusion, disorientation, or seeing/hearing things',
    detail: 'Warning signs of impending severe withdrawal or delirium tremens',
  },
  {
    key: 'unableToKeepFluids',
    points: 2,
    label: 'Repeated vomiting or unable to keep fluids and oral medications down',
    detail: 'High risk of dehydration, electrolyte imbalance, and failed oral taper',
  },
  {
    key: 'concurrentIllnessOrOlder',
    points: 1,
    label: 'Co-existing medical illness, pregnancy, liver disease, older age, or combining alcohol + benzos',
    detail: 'Lowers physiological reserve during withdrawal',
  },
];

function normalizeSubstances(raw) {
  if (!raw) return new Set();
  if (raw instanceof Set) return new Set([...raw].map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  if (Array.isArray(raw)) return new Set(raw.map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  if (typeof raw === 'string') {
    return new Set(raw.split(',').map((s) => s.toLowerCase().trim()).filter(Boolean));
  }
  return new Set();
}

/**
 * Pure function evaluating patient-reported opioid withdrawal symptoms
 * (modeled on COWS / SOWS domains).
 *
 * Each symptom key (`restlessness`, `sweating_chills`, `muscle_bone_aches`,
 * `gi_upset`, `runny_nose_tearing`, `tremor_gooseflesh`, `anxiety_irritability`,
 * `yawning_insomnia`) may be scored 0 (none), 1 (mild), 2 (moderate), 4 (severe),
 * or passed as a boolean (`true` = 2, `false` = 0).
 *
 * @param {Record<string, number|boolean>} [symptoms]
 * @returns {{
 *   score: number,
 *   band: 'none_minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe',
 *   navWithdrawalRisk: 'none' | 'mild' | 'moderate' | 'severe',
 *   bupGuidance: string
 * }}
 */
export function scoreOpioidWithdrawal(symptoms = {}) {
  let score = 0;
  for (const { key } of OPIOID_SYMPTOM_ITEMS) {
    const val = symptoms?.[key];
    if (typeof val === 'boolean') {
      if (val) score += 2;
    } else if (typeof val === 'number' && Number.isFinite(val)) {
      const clamped = Math.max(0, Math.min(4, Math.round(val)));
      score += clamped;
    } else if (typeof val === 'string' && val.trim() !== '') {
      const parsed = Number(val);
      if (Number.isFinite(parsed)) {
        score += Math.max(0, Math.min(4, Math.round(parsed)));
      }
    }
  }

  let band = 'none_minimal';
  let navWithdrawalRisk = 'none';
  let bupGuidance = '';

  if (score <= 4) {
    band = 'none_minimal';
    navWithdrawalRisk = 'none';
    bupGuidance = t(
      'nav.calc.opioid.guidance.none',
      'Too early for standard sublingual buprenorphine: With minimal or no objective withdrawal (score 0–4), taking full sublingual doses of buprenorphine right after full-agonist opioids (especially fentanyl or methadone) can trigger precipitated withdrawal. Wait until clear mild-to-moderate objective withdrawal (score >= 8–12), or ask a clinician about low-dose micro-induction (“Bernese method”, see #/medications) or OTP methadone, which do not require waiting for withdrawal.',
    );
  } else if (score <= 12) {
    band = 'mild';
    navWithdrawalRisk = 'mild';
    if (score < 8) {
      bupGuidance = t(
        'nav.calc.opioid.guidance.mild_early',
        'Early mild withdrawal (score 5–7): Standard sublingual buprenorphine usually works best once at least 3 objective signs reach score >= 8–12. If you have been using high-potency lipophilic fentanyl, starting full-dose buprenorphine too early can cause precipitated withdrawal—consider waiting a few more hours until score >= 10–12, or ask about low-dose micro-induction (“Bernese method”, #/medications) or OTP methadone.',
      );
    } else {
      bupGuidance = t(
        'nav.calc.opioid.guidance.mild_ready',
        'Mild-to-moderate withdrawal window (score 8–12): Standard sublingual buprenorphine initiation (starting with a cautious 2–4 mg test dose) is typically safe after heroin or short-acting prescription opioids. Extra caution for fentanyl: because lipophilic fentanyl lingers in fat tissues, waiting for score >= 12–13, using a cautious low-dose micro-induction (“Bernese method”, #/medications), or starting OTP methadone can prevent precipitated withdrawal.',
      );
    }
  } else if (score <= 20) {
    band = 'moderate';
    navWithdrawalRisk = 'moderate';
    bupGuidance = t(
      'nav.calc.opioid.guidance.moderate',
      'Moderate objective withdrawal (score 13–20): Standard sublingual buprenorphine initiation is typically safe and provides rapid relief. If you have experienced precipitated withdrawal from street fentanyl in the past, ask a bridge clinic or Emergency Department clinician about macro-induction, comfort medications (clonidine, ondansetron, hydroxyzine), low-dose micro-induction (“Bernese method”, #/medications), or OTP methadone.',
    );
  } else if (score <= 24) {
    band = 'moderately_severe';
    navWithdrawalRisk = 'severe';
    bupGuidance = t(
      'nav.calc.opioid.guidance.mod_severe',
      'Moderately severe withdrawal (score 21–24): Standard or high-dose sublingual buprenorphine initiation or OTP methadone is appropriate right now. Under the federal DEA 72-Hour Rule (21 CFR § 1306.07(b)), any hospital Emergency Department or bridge clinic can administer buprenorphine or methadone immediately to relieve acute withdrawal; if xylazine (“tranq”) is in the supply, ask for clonidine or tizanidine alongside opioid medication (see #/medications).',
    );
  } else {
    band = 'severe';
    navWithdrawalRisk = 'severe';
    bupGuidance = t(
      'nav.calc.opioid.guidance.severe',
      'Severe acute opioid withdrawal (score >= 25): Seek prompt medical stabilization at an Emergency Department, bridge clinic, or inpatient withdrawal program (ASAM Level 3.7-WM / 4.0). Standard or rapid high-dose buprenorphine initiation or methadone under the DEA 72-Hour Rule (21 CFR § 1306.07(b)), IV fluids for dehydration, and targeted alpha-2 agonist support (if xylazine is involved; see #/medications) can safely relieve symptoms within hours.',
    );
  }

  return {
    score,
    band,
    navWithdrawalRisk,
    bupGuidance,
  };
}

/**
 * Pure function evaluating PAWSS / CIWA-Ar informed alcohol & benzodiazepine
 * withdrawal risk factors.
 *
 * @param {object} [factors]
 * @param {boolean|number} [factors.dailyHeavyUse]
 * @param {boolean|number} [factors.priorSeizuresOrDTs]
 * @param {boolean|number} [factors.tremorSweatingAgitation]
 * @param {boolean|number} [factors.autonomicInstability]
 * @param {boolean|number} [factors.unableToKeepFluids]
 * @param {boolean|number} [factors.concurrentIllnessOrOlder]
 * @returns {{
 *   score: number,
 *   riskLevel: 'low' | 'moderate' | 'high_seizure_dt_risk',
 *   navWithdrawalRisk: 'none' | 'mild' | 'moderate' | 'severe',
 *   guidance: string
 * }}
 */
export function scoreAlcoholSedativeRisk(factors = {}) {
  const isTruthyFactor = (val) => Boolean(val && val !== '0' && val !== 'false');

  const dailyHeavyUse = isTruthyFactor(factors?.dailyHeavyUse);
  const priorSeizuresOrDTs = isTruthyFactor(factors?.priorSeizuresOrDTs);
  const tremorSweatingAgitation = isTruthyFactor(factors?.tremorSweatingAgitation);
  const autonomicInstability = isTruthyFactor(factors?.autonomicInstability);
  const unableToKeepFluids = isTruthyFactor(factors?.unableToKeepFluids);
  const concurrentIllnessOrOlder = isTruthyFactor(factors?.concurrentIllnessOrOlder);

  let score = 0;
  if (dailyHeavyUse) score += 2;
  if (priorSeizuresOrDTs) score += 4;
  if (tremorSweatingAgitation) score += 2;
  if (autonomicInstability) score += 3;
  if (unableToKeepFluids) score += 2;
  if (concurrentIllnessOrOlder) score += 1;

  let riskLevel = 'low';
  let navWithdrawalRisk = 'none';
  let guidance = '';

  if (priorSeizuresOrDTs || autonomicInstability || unableToKeepFluids || score >= 4) {
    riskLevel = 'high_seizure_dt_risk';
    navWithdrawalRisk = 'severe';
    guidance = t(
      'nav.calc.alcohol.guidance.high',
      'High risk for withdrawal seizures or delirium tremens (DTs): Do NOT stop alcohol or benzodiazepines abruptly (“cold turkey”). Prior seizures/DTs, autonomic instability, or inability to keep fluids down requires 24-hour medically managed withdrawal care (ASAM Level 3.7-WM / 4.0, SAMHSA codes DT & HI) or immediate Emergency Department evaluation with IV fluids, thiamine, and GABAergic medication protection.',
    );
  } else if (dailyHeavyUse || tremorSweatingAgitation || score >= 2) {
    riskLevel = 'moderate';
    navWithdrawalRisk = 'moderate';
    guidance = t(
      'nav.calc.alcohol.guidance.moderate',
      'Moderate GABAergic withdrawal risk: Stopping daily alcohol or benzodiazepine use without medical supervision carries seizure risk. Seek medically supervised withdrawal management (code DT) or a same-day physician evaluation for a monitored medication taper; go to an Emergency Department if tremors, sweating, confusion, or vomiting worsen.',
    );
  } else {
    riskLevel = 'low';
    navWithdrawalRisk = score > 0 ? 'mild' : 'none';
    guidance = t(
      'nav.calc.alcohol.guidance.low',
      'Lower acute seizure/DT risk based on reported factors: Outpatient medical care (code OP) and FDA-approved alcohol use disorder medications (naltrexone, acamprosate, disulfiram; code PMAT) are often appropriate. If shakes, drenching sweats, racing heart, or confusion develop at any point, seek immediate medical evaluation.',
    );
  }

  return {
    score,
    riskLevel,
    navWithdrawalRisk,
    guidance,
  };
}

/**
 * Pure function evaluating acute mortality & tolerance-loss risk across
 * high-risk care transitions (post-overdose, post-release from incarceration,
 * post-detox/hospital discharge without MOUD, or stopping naltrexone).
 *
 * @param {object} [params]
 * @param {'none'|'post_overdose'|'post_release'|'post_detox_hospital'|'post_naltrexone'} [params.event]
 * @param {'under_7'|'7_to_28'|'over_28'} [params.daysSince]
 * @param {boolean} [params.onMoud]
 * @param {boolean} [params.hasNaloxone]
 * @returns {{
 *   riskBand: 'baseline' | 'elevated' | 'critical',
 *   headline: string,
 *   physiologicalWhy: string,
 *   actionSteps: string[],
 *   recommendedCodes: string[],
 *   searchHref: string
 * }}
 */
export function evaluateTransitionRisk({
  event = 'none',
  daysSince = 'under_7',
  onMoud = false,
  hasNaloxone = false,
} = {}) {
  const validEvents = new Set(['none', 'post_overdose', 'post_release', 'post_detox_hospital', 'post_naltrexone']);
  const normEvent = validEvents.has(event) ? event : 'none';
  const validDays = new Set(['under_7', '7_to_28', 'over_28']);
  const normDays = validDays.has(daysSince) ? daysSince : 'under_7';
  const isOnMoud = Boolean(onMoud);
  const carriesNaloxone = Boolean(hasNaloxone);

  const recommendedCodes = [];
  const addRecCode = (c) => {
    if (c && !recommendedCodes.includes(c)) recommendedCodes.push(c);
  };

  if (normEvent === 'none') {
    if (!carriesNaloxone) addRecCode('NOE');
    addRecCode('BU');
    addRecCode('OP');
    return {
      riskBand: 'baseline',
      headline: 'Baseline Transition Profile — Keep Naloxone & Overdose Prevention Tools Ready',
      physiologicalWhy:
        'Opioid receptor tolerance remains relatively steady during consistent daily agonist medication (buprenorphine or methadone), but drops rapidly within days of any pause in opioid use, hospitalization, incarceration, or detox.',
      actionSteps: [
        carriesNaloxone
          ? 'Keep your naloxone (Narcan) visible and make sure family or friends know where it is.'
          : 'Get free or over-the-counter naloxone nasal spray (SAMHSA code NOE) to keep at home and on your person.',
        isOnMoud
          ? 'Continue your daily buprenorphine or methadone maintenance—staying on agonist medication is linked to a much lower risk of dying from an overdose.'
          : 'If you use opioids, starting buprenorphine (BU) or methadone (OTP) protects your receptor tolerance and prevents fatal respiratory arrest.',
        'Never use alone: call Never Use Alone (1-800-484-3731) or SafeSpot (1-800-972-0590) if no trusted person is nearby.',
      ],
      recommendedCodes,
      searchHref: `#/treatment?codes=${recommendedCodes.join(',')}`,
    };
  }

  // Active high-risk transition event
  let riskBand = 'critical';
  if (isOnMoud && carriesNaloxone) {
    riskBand = normDays === 'over_28' ? 'baseline' : 'elevated';
  } else if (isOnMoud || normDays === 'over_28') {
    riskBand = normDays === 'under_7' && !isOnMoud ? 'critical' : 'elevated';
  } else {
    riskBand = 'critical';
  }

  let headline = '';
  let physiologicalWhy = '';
  const actionSteps = [];

  if (normEvent === 'post_release') {
    headline =
      riskBand === 'critical'
        ? 'Critical Re-Entry Window: Extremely High Overdose Risk After Release from Jail or Prison'
        : 'Elevated Re-Entry Transition: Maintain Medication Continuity & Overdose Protection';
    physiologicalWhy = isOnMoud
      ? 'Daily buprenorphine or methadone maintains mu-opioid receptor cross-tolerance, and staying on them after release is linked to far fewer overdose deaths. Ensure uninterrupted prescription or OTP bridge dosing so no gap occurs during re-entry.'
      : 'During incarceration, mu-opioid receptors rapidly resensitize and physiological opioid tolerance drops back toward opioid-naive levels. Returning to a previous “normal” dose—especially with street fentanyl—is the #1 cause of fatal overdose in the first 7–14 days after release.';
    addRecCode('CJ');
    addRecCode('BU');
    addRecCode('NOE');
    addRecCode('PEER');
  } else if (normEvent === 'post_overdose') {
    headline =
      riskBand === 'critical'
        ? 'Critical Post-Overdose Window: Highest Immediate Risk of Repeat Overdose'
        : 'Post-Overdose Stabilization: Continue Agonist Protection & Multi-Dose Naloxone';
    physiologicalWhy = isOnMoud
      ? 'Continuing daily buprenorphine or methadone stabilizes opioid receptors after a non-fatal overdose. Still use extreme caution: high-potency fentanyl analogs and xylazine/medetomidine (“tranq”) can cause profound sedation even with tolerance.'
      : 'A recent non-fatal overdose indicates high-potency fentanyl/xylazine exposure or reduced respiratory reserve. After naloxone reversal or an ER visit without maintenance medication, unbound opioid receptors and acute withdrawal cravings drive a spike in fatal repeat overdoses within 48 hours to 7 days.';
    addRecCode('NOE');
    addRecCode('BU');
    addRecCode('PEER');
    addRecCode('TELE');
  } else if (normEvent === 'post_detox_hospital') {
    headline =
      riskBand === 'critical'
        ? 'Critical Post-Detox / Hospital Discharge Alert: Rapid Loss of Opioid Tolerance'
        : 'Post-Discharge Care Continuity: Protect Receptor Tolerance with Ongoing MOUD';
    physiologicalWhy = isOnMoud
      ? 'Staying on daily buprenorphine or methadone after hospital or residential discharge protects your mu-opioid receptor tolerance while you transition to outpatient care.'
      : 'Completing detox, inpatient withdrawal management, or a hospital stay without ongoing buprenorphine or methadone resets your physiological opioid tolerance within 3 to 7 days. Taking even a fraction of your pre-hospital dose can stop breathing within minutes.';
    addRecCode('BU');
    addRecCode('OTP');
    addRecCode('NOE');
    addRecCode('PEER');
  } else if (normEvent === 'post_naltrexone') {
    headline =
      riskBand === 'critical'
        ? 'Critical Post-Naltrexone (Vivitrol) Receptor Supersensitivity Window'
        : 'Post-Naltrexone Transition: Bridge Safely to Agonist Protection & Carry Naloxone';
    physiologicalWhy = isOnMoud
      ? 'Transitioning onto daily buprenorphine or methadone restores steady mu-opioid receptor protection after stopping naltrexone.'
      : 'Extended-release naltrexone (Vivitrol) blocks opioid receptors for 28–35 days (oral naltrexone for 24–72 hours) while completely eliminating opioid tolerance. Attempting to “override” the blockade or using opioids as the shot wears off exposes hypersensitive, unblocked receptors to fatal respiratory depression.';
    addRecCode('BU');
    addRecCode('NOE');
    addRecCode('TELE');
    addRecCode('PEER');
  }

  if (!isOnMoud) {
    actionSteps.push(
      'Start or restart buprenorphine (BU) or methadone (OTP) today: under the federal DEA 72-Hour Rule (21 CFR § 1306.07(b)) and telehealth rules (TELE), emergency rooms and bridge clinics can provide immediate same-day medication.',
    );
  } else {
    actionSteps.push(
      'Prevent any gap in your daily buprenorphine or methadone: if your prescription or clinic transfer is delayed after release or discharge, an Emergency Department can dispense up to 72 hours of bridge medication under 21 CFR § 1306.07(b).',
    );
  }

  if (!carriesNaloxone) {
    actionSteps.push(
      'Get at least 2 doses of naloxone (Narcan) immediately (SAMHSA code NOE): high-potency fentanyl often requires repeat doses every 2–3 minutes.',
    );
  } else {
    actionSteps.push(
      'Keep multiple doses of naloxone within arm’s reach and tell someone you trust before using.',
    );
  }

  actionSteps.push(
    'Never use alone during a transition window: call Never Use Alone (1-800-484-3731) or SafeSpot (1-800-972-0590), and if you do use, test a tiny fraction first (“start low, go slow”).',
  );

  if (normEvent === 'post_release') {
    actionSteps.push(
      'Ask for justice-involved re-entry navigation and peer recovery specialists (SAMHSA codes CJ, PEER) who can help with Medicaid reactivation, ID, housing, and same-day MOUD.',
    );
  }

  return {
    riskBand,
    headline,
    physiologicalWhy,
    actionSteps,
    recommendedCodes,
    searchHref: `#/treatment?codes=${recommendedCodes.join(',')}`,
  };
}

/**
 * Pure function that formats the person's own self-reported answers, and a
 * suggested starting point to discuss, as plain text for clipboard copy.
 * It is not a diagnosis, a clinical assessment, or a level-of-care decision.
 *
 * @param {object} [answers]
 * @param {ReturnType<typeof evaluateAsamCare>} [evaluation]
 * @returns {string}
 */
export function formatAsamHandoffText(answers = {}, evaluation = evaluateAsamCare(answers)) {
  const evalResult = evaluation ?? evaluateAsamCare(answers);
  const substances = [...normalizeSubstances(answers?.substances)];
  const dateStr = new Date().toISOString().slice(0, 10);

  const codeDescriptions = (evalResult.codes ?? []).map((code) => {
    const meta = CODE_META[code];
    return meta ? `${code} (${meta.label})` : code;
  });

  const lines = [
    t('nav.handoff.title', 'HARBORPATH — MY SELF-REPORTED ANSWERS TO SHARE WITH A CLINICIAN'),
    `Date Generated: ${dateStr}`,
    t('nav.disclaimer', 'This is not a diagnosis or a clinical assessment. A licensed clinician will assess you.'),
    t(
      'nav.handoff.about',
      'I filled this out myself. It is a list of my own answers and a suggested starting point to discuss. It is organized by the ASAM Criteria dimensions, but it is not an official ASAM tool and only a licensed clinician can decide my level of care.',
    ),
    'Privacy Note: Generated 100% locally in browser memory. Not stored on any server.',
    '========================================================================',
    '',
    ...(evalResult.crisis
      ? [
          t('nav.handoff.crisis', 'SAFETY FIRST: I reported thoughts of self-harm or feeling unsafe. Call or text 988 now. Call 911 if I am in immediate danger.'),
          '',
        ]
      : []),
    `${t('nav.handoff.starting_point', 'SUGGESTED STARTING POINT TO DISCUSS (not a level-of-care decision)')}: ${evalResult.asamLevel} — ${evalResult.asamTitle}`,
    `${t('nav.handoff.why', 'Why this was suggested')}: ${evalResult.summary}`,
    '',
    'MY SELF-REPORTED ANSWERS:',
    `- Substances Reported: ${substances.length ? substances.join(', ') : 'None specified'}`,
    `- Withdrawal Acuity (Dim 1): ${answers?.withdrawalRisk || 'none'}`,
    `- Biomedical Status (Dim 2): ${answers?.biomedical || 'none'}`,
    `- Emotional / Behavioral / Cognitive (Dim 3): ${answers?.mentalHealth || 'none'}`,
    `- Daily Structure Preference (Dim 4): ${answers?.structureNeeded || 'flexible'}`,
    `- Recovery Environment (Dim 5): ${answers?.environment || 'supportive'}`,
    `- Practical / Access Filters (Dim 6): ${[
      answers?.preferTelehealth ? 'Telehealth (TELE)' : null,
      answers?.payment ? `Payment: ${answers.payment}` : null,
      answers?.population ? `Population: ${answers.population}` : null,
    ].filter(Boolean).join(', ') || 'None specified'}`,
    '',
    'HOW MY ANSWERS MAP TO THE 6 ASAM CRITERIA DIMENSIONS:',
    ...(evalResult.dimensionBreakdown ?? []).map(
      (d) => `- ${d.dimension} (${d.title}): ${d.finding}`,
    ),
    '',
    'SAFETY ALERTS BASED ON MY ANSWERS:',
    ...(evalResult.redFlags?.length
      ? evalResult.redFlags.map((flag) => `! ${flag}`)
      : ['- None flagged based on current selections.']),
    '',
    'GENERAL INFORMATION (NOT MEDICAL ADVICE):',
    ...(evalResult.clinicalNotes?.length
      ? evalResult.clinicalNotes.map((note) => `* ${note}`)
      : ['- Outpatient or harm reduction support may be a place to start.']),
    '',
    'SAMHSA DIRECTORY SEARCH FILTERS USED:',
    `- Focused Filter Codes (<= 8): ${codeDescriptions.join(', ') || 'None'}`,
    `- Broad Core Codes: ${(evalResult.broadCodes ?? []).join(', ') || 'None'}`,
    `- HarborPath Search Route: ${evalResult.searchHref}`,
    '',
    'FEDERAL PATIENT RIGHTS & EMERGENCY BRIDGE CARE:',
    '- EMTALA: Hospital emergency departments must screen and stabilize emergency medical conditions (severe withdrawal, overdose, active labor, systemic infection) regardless of ability to pay.',
    '- DEA 72-Hour Rule (21 CFR 1306.07(b)): Hospital/ED clinicians may administer or dispense up to 72 hours of buprenorphine or methadone for acute opioid withdrawal.',
    '- 42 CFR Part 2 & ADA: Substance use treatment records carry heightened federal confidentiality, and the ADA protects patients on prescribed MOUD from discriminatory denial of health care.',
    '',
    '24/7 CONFIDENTIAL CRISIS & SUPPORT LINES:',
    '- Medical Emergency: Call 911',
    '- Suicide & Crisis Lifeline: Call or text 988 (24/7, free, confidential)',
    '- SAMHSA National Helpline: 1-800-662-4357 (24/7 treatment referral in English & Spanish)',
    '- Never Use Alone Overdose Prevention Line: 1-800-484-3731',
  ];

  return lines.join('\n');
}

/**
 * Pure clinical evaluation engine based on The ASAM Criteria (4th Edition)
 * across all 6 dimensions. Runs 100% in browser/process RAM with zero network I/O.
 *
 * @param {object} answers
 * @param {Iterable<string>|string} [answers.substances] - 'opioids' | 'alcohol' | 'benzos' | 'stimulants' | 'xylazine' | 'other'
 * @param {'none'|'mild'|'moderate'|'severe'} [answers.withdrawalRisk]
 * @param {'none'|'pregnant'|'chronic'|'acute_infection'} [answers.biomedical]
 * @param {'none'|'mild_moderate'|'severe_crisis'|'trauma'} [answers.mentalHealth]
 * @param {'supportive'|'unstable'|'unhoused'} [answers.environment]
 * @param {'flexible'|'structured_day'|'24_hour'} [answers.structureNeeded]
 * @param {string} [answers.payment]
 * @param {string} [answers.population]
 * @param {boolean} [answers.preferTelehealth]
 */
export function evaluateAsamCare(answers = {}) {
  const substances = normalizeSubstances(answers.substances);
  const withdrawalRisk = ['none', 'mild', 'moderate', 'severe'].includes(answers.withdrawalRisk)
    ? answers.withdrawalRisk
    : 'none';
  const biomedical = ['none', 'pregnant', 'chronic', 'acute_infection'].includes(answers.biomedical)
    ? answers.biomedical
    : 'none';
  const mentalHealth = ['none', 'mild_moderate', 'severe_crisis', 'trauma'].includes(answers.mentalHealth)
    ? answers.mentalHealth
    : 'none';
  const environment = ['supportive', 'unstable', 'unhoused'].includes(answers.environment)
    ? answers.environment
    : 'supportive';
  const structureNeeded = ['flexible', 'structured_day', '24_hour'].includes(answers.structureNeeded)
    ? answers.structureNeeded
    : 'flexible';
  const payment = VALID_PAYMENTS.has(answers.payment) ? answers.payment : '';
  const population = VALID_POPULATIONS.has(answers.population) ? answers.population : '';
  const preferTelehealth = Boolean(answers.preferTelehealth);

  const hasOpioids = substances.has('opioids');
  const hasAlcohol = substances.has('alcohol');
  const hasBenzos = substances.has('benzos');
  const hasStimulants = substances.has('stimulants');
  const hasXylazine = substances.has('xylazine');
  const hasGabaergic = hasAlcohol || hasBenzos;

  const gabaSevereOrModerateRisk =
    hasGabaergic && (withdrawalRisk === 'moderate' || withdrawalRisk === 'severe' || Boolean(answers.seizureOrDtHistory));

  const redFlags = [];
  const clinicalNotes = [];
  const rawCodes = [];
  const rawBroadCodes = [];

  const addCode = (code) => {
    if (code && !rawCodes.includes(code)) rawCodes.push(code);
  };
  const addBroadCode = (code) => {
    if (code && !rawBroadCodes.includes(code)) rawBroadCodes.push(code);
  };

  // -------------------------------------------------------------------------
  // Dimension 1: Acute Intoxication and Withdrawal Potential
  // -------------------------------------------------------------------------
  if (gabaSevereOrModerateRisk) {
    redFlags.push(
      t(
        'nav.redflag.gaba_withdrawal',
        'Life-threatening GABAergic withdrawal risk (alcohol or benzodiazepines): Stopping heavy alcohol or benzodiazepine use abruptly can trigger generalized tonic-clonic withdrawal seizures or delirium tremens (DTs), which can be fatal without medical management. Do not stop cold turkey—seek ASAM Level 3.7-WM or 4.0 medically managed withdrawal care or an Emergency Department right away.',
      ),
    );
  } else if (withdrawalRisk === 'severe') {
    redFlags.push(
      t(
        'nav.redflag.severe_withdrawal',
        'High-acuity withdrawal risk: Severe acute withdrawal symptoms or a history of complicated withdrawal warrants 24-hour medically managed withdrawal stabilization (ASAM Level 3.7-WM / 4.0) or immediate hospital / bridge clinic evaluation.',
      ),
    );
  }

  if (hasOpioids) {
    clinicalNotes.push(
      t(
        'nav.note.opioid_moud',
        'Opioid Use Disorder & the DEA 72-Hour Rule (21 CFR § 1306.07(b)): FDA-approved medications—buprenorphine (BU), methadone (MU/OTP), and extended-release naltrexone (NU)—treat opioid use disorder; staying on buprenorphine or methadone is linked to a large drop in overdose deaths (Larochelle et al., Ann Intern Med 2018). Under federal DEA regulation 21 CFR § 1306.07(b), any Emergency Department or hospital clinician can administer or dispense up to 72 hours (3 days) of buprenorphine or methadone to relieve acute opioid withdrawal while connecting you to ongoing care.',
      ),
    );
  }

  if (hasXylazine) {
    clinicalNotes.push(
      t(
        'nav.note.xylazine',
        'Xylazine / Medetomidine (“Tranq”) Adulteration: Xylazine and medetomidine are non-opioid alpha-2 adrenergic sedatives. Withdrawal causes rebound hypertension, rapid heart rate, sweating, and severe anxiety that opioid medications (buprenorphine or methadone) alone do not fully relieve; clinicians often add alpha-2 agonists (such as clonidine, tizanidine, or dexmedetomidine) alongside MOUD. Deep necrotic skin wounds can appear even away from injection sites and require gentle saline cleansing, moist non-adherent dressings, and early medical wound care.',
      ),
    );
    if (withdrawalRisk === 'moderate' || withdrawalRisk === 'severe' || biomedical === 'acute_infection') {
      redFlags.push(
        t(
          'nav.redflag.xylazine_acuity',
          'Xylazine / medetomidine withdrawal & wound alert: Alpha-2 adrenergic rebound can cause severe blood pressure spikes and autonomic instability alongside opioid withdrawal. Seek medically monitored withdrawal care that manages both opioid and alpha-2 withdrawal and evaluates any skin ulcers.',
        ),
      );
    }
  }

  if (hasAlcohol) {
    clinicalNotes.push(
      t(
        'nav.note.alcohol_maud',
        'Medications for Alcohol Use Disorder (MAUD): After acute withdrawal is safely managed, FDA-approved medications including naltrexone (oral or monthly injection), acamprosate, and disulfiram reduce heavy drinking and cravings and can be prescribed in outpatient or primary care settings.',
      ),
    );
  }

  if (hasStimulants) {
    clinicalNotes.push(
      t(
        'nav.note.stimulants',
        'Stimulant Use Disorder (Methamphetamine / Cocaine): Contingency Management (CMI)—which provides tangible rewards for meeting recovery goals—combined with cognitive behavioral therapy and community recovery support has the strongest clinical evidence. Monitor closely for post-acute depression or exhaustion (“crash”) during early stabilization.',
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Dimension 2: Biomedical Conditions and Complications
  // -------------------------------------------------------------------------
  if (biomedical === 'pregnant') {
    redFlags.push(
      t(
        'nav.redflag.pregnant',
        'Pregnancy & Perinatal Care Priority (ACOG / ASAM Guidelines): If you are pregnant and using opioids, clinical guidelines strongly recommend starting or continuing buprenorphine (BU) or methadone (MU/OTP) maintenance rather than abrupt detox. Unsupervised opioid withdrawal during pregnancy can cause fetal distress, placental abruption, preterm labor, and return to use.',
      ),
    );
    clinicalNotes.push(
      t(
        'nav.note.pregnant_capta',
        'Perinatal Rights & CAPTA Plans of Safe Care: Specialized pregnant and postpartum programs (SAMHSA code PW) coordinate prenatal care, non-punitive Plans of Safe Care under federal CAPTA guidelines, breastfeeding support, and rooming-in newborn care (Eat, Sleep, Console) to keep birthing parents and infants together.',
      ),
    );
  }

  if (biomedical === 'acute_infection') {
    redFlags.push(
      t(
        'nav.redflag.acute_infection',
        'Urgent Biomedical Warning (Fever, Severe Wound, or Systemic Infection Risk): Fever, chills, spreading redness, black/necrotic tissue, chest pain, or shortness of breath can signal life-threatening endocarditis, osteomyelitis, sepsis, or deep tissue infection. Seek immediate hospital evaluation (HI) or urgent medical/wound care (#/health). Under EMTALA, hospital emergency rooms must evaluate and stabilize you regardless of insurance or ability to pay.',
      ),
    );
    clinicalNotes.push(
      t(
        'nav.note.acute_infection_care',
        'Integrated Medical & Wound Care: Hospital inpatient programs (HI) and Federally Qualified Health Centers (#/health) can treat infections with IV or oral antibiotics while simultaneously managing withdrawal with buprenorphine or methadone so pain and withdrawal never force you to leave care early.',
      ),
    );
  } else if (biomedical === 'chronic') {
    clinicalNotes.push(
      t(
        'nav.note.chronic_biomedical',
        'Co-existing Biomedical Care: Look for programs offering integrated primary care, infectious disease screening and curative Hepatitis C / HIV treatment (HIVT, HCT), or coordinate with a sliding-fee Community Health Center (#/health).',
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Dimension 3: Emotional, Behavioral, or Cognitive Conditions
  // -------------------------------------------------------------------------
  if (mentalHealth === 'severe_crisis') {
    redFlags.push(
      t(
        'nav.redflag.mental_crisis',
        'Acute Mental Health Crisis Support: If you are experiencing thoughts of self-harm, overwhelming panic, or psychosis, you do not have to carry this alone. Call or text 988 (free, confidential, 24/7) or use walk-in crisis care (WI) and mobile crisis teams (PEOFF). Integrated Dual-Diagnosis care (MHSU) treats mental health and substance use together.',
      ),
    );
  }

  if (mentalHealth === 'mild_moderate' || mentalHealth === 'severe_crisis') {
    clinicalNotes.push(
      t(
        'nav.note.mhsu',
        'Co-occurring Mental Health & Substance Use (MHSU): Evidence shows that depression, anxiety, bipolar disorder, PTSD, and substance use disorders must be treated at the same time by an integrated team—you should never be turned away from mental health care because of substance use, or denied MOUD because of psychiatric medications.',
      ),
    );
  } else if (mentalHealth === 'trauma') {
    clinicalNotes.push(
      t(
        'nav.note.trauma',
        'Trauma-Informed Care (TRMA): Trauma-specific programs prioritize physical and emotional safety, choice, collaboration, and empowerment, avoiding confrontational tactics that can re-traumatize survivors.',
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Dimensions 1–5: Determine ASAM 4th Edition Level of Care
  // -------------------------------------------------------------------------
  let asamLevel = '';
  let asamTitle = '';
  let summary = '';

  const needsLevel4Or37WM =
    gabaSevereOrModerateRisk ||
    withdrawalRisk === 'severe' ||
    (biomedical === 'acute_infection' && (withdrawalRisk === 'moderate' || structureNeeded === '24_hour' || hasXylazine));

  const needsLevel3Residential =
    !needsLevel4Or37WM &&
    (structureNeeded === '24_hour' ||
      environment === 'unhoused' ||
      (environment === 'unstable' &&
        (withdrawalRisk === 'moderate' ||
          mentalHealth === 'severe_crisis' ||
          biomedical === 'pregnant' ||
          biomedical === 'acute_infection')));

  const needsLevel2IOPOrPHP =
    !needsLevel4Or37WM &&
    !needsLevel3Residential &&
    (structureNeeded === 'structured_day' ||
      environment === 'unstable' ||
      withdrawalRisk === 'moderate' ||
      mentalHealth === 'severe_crisis' ||
      (biomedical === 'acute_infection' && withdrawalRisk !== 'none'));

  if (needsLevel4Or37WM) {
    asamLevel = 'ASAM Level 3.7-WM / 4.0';
    asamTitle = t(
      'nav.level.4.title',
      'Medically Managed Inpatient / Withdrawal Management (ASAM Level 3.7-WM / 4.0)',
    );
    summary = t(
      'nav.level.4.summary',
      'Based on your withdrawal profile or acute medical needs, 24-hour medically managed care with on-site physician and nursing monitoring is the safest first step to prevent life-threatening complications, stabilize acute symptoms, and transition directly into ongoing maintenance care.',
    );
    addCode('DT');
    addCode('HI');
    addBroadCode('DT');
  } else if (needsLevel3Residential) {
    asamLevel = 'ASAM Level 3.1 / 3.5 / 3.7';
    asamTitle = t(
      'nav.level.3.title',
      'Clinically or Medically Monitored Residential Care & Recovery Housing (ASAM Level 3.1 / 3.5 / 3.7)',
    );
    summary = t(
      'nav.level.3.summary',
      'A safe, structured 24-hour residential living environment provides vital stability away from environmental triggers or housing insecurity while delivering daily clinical therapy, medication management (MOUD/MAUD), and recovery support.',
    );
    addCode('RES');
    addBroadCode('RES');
    if (environment === 'unhoused' || environment === 'unstable') {
      addCode('HH');
    }
    if (withdrawalRisk === 'moderate') {
      addCode('DT');
    }
  } else if (needsLevel2IOPOrPHP) {
    asamLevel = 'ASAM Level 2.1 / 2.5';
    asamTitle = t(
      'nav.level.2.title',
      'Intensive Outpatient (IOP) or Partial Hospitalization / Day Treatment (ASAM Level 2.1 / 2.5)',
    );
    summary = t(
      'nav.level.2.summary',
      'Structured multi-day outpatient care (9 to 20+ hours per week of clinical group, individual, medical, and psychiatric support) offers strong daily accountability and symptom stabilization while allowing you to sleep at home or in supportive housing.',
    );
    addCode('IOP');
    addBroadCode('IOP');
  } else {
    asamLevel = 'ASAM Level 1.0 / 1.5';
    asamTitle = t(
      'nav.level.1.title',
      'Outpatient Treatment & Medication Management (ASAM Level 1.0 / 1.5)',
    );
    summary = t(
      'nav.level.1.summary',
      'Flexible outpatient care—including office-based or telehealth medication treatment (such as buprenorphine or alcohol use disorder medications), individual counseling, and peer recovery support—lets you access evidence-based care around work, school, or family responsibilities.',
    );
    addCode('OP');
    addBroadCode('OP');
    if (preferTelehealth) {
      addCode('TELE');
    }
  }

  // -------------------------------------------------------------------------
  // High-Signal Clinical Code Selection (Ordered by clinical priority)
  // -------------------------------------------------------------------------
  if (biomedical === 'pregnant') {
    addCode('PW');
    addBroadCode('PW');
    if (hasOpioids) {
      addCode('BU');
      addBroadCode('BU');
    }
  }

  if (biomedical === 'acute_infection') {
    addCode('HI');
  }

  if (hasOpioids) {
    addCode('BU');
    addBroadCode('BU');
  }

  if (hasAlcohol && !hasOpioids) {
    addCode('PMAT');
  }

  if (mentalHealth === 'mild_moderate' || mentalHealth === 'severe_crisis') {
    addCode('MHSU');
  } else if (mentalHealth === 'trauma') {
    addCode('TRMA');
  }

  if (hasStimulants) {
    addCode('CMI');
  }

  if (preferTelehealth) {
    addCode('TELE');
  }

  if (payment) {
    addCode(payment);
  }

  if (population) {
    addCode(population);
  }

  if ((environment === 'unhoused' || environment === 'unstable') && !rawCodes.includes('HH')) {
    clinicalNotes.push(
      t(
        'nav.note.housing',
        'Safe Recovery Environment & Housing (ASAM Dimension 5): Unstable housing or living around active substance use makes recovery much harder. Consider NARR-certified recovery residences (SAMHSA code HH) or calling 211 for local housing navigation alongside treatment.',
      ),
    );
  }

  if (preferTelehealth) {
    clinicalNotes.push(
      t(
        'nav.note.telehealth',
        'Telehealth Access (SAMHSA / DEA Telemedicine Flexibilities): Under federal rules, clinicians can initiate buprenorphine (BU) and provide outpatient counseling via audio-video or audio-only telehealth visits (code TELE) without requiring an in-person exam first.',
      ),
    );
  }

  // Ensure we never exceed 8 codes so SAMHSA's AND-filter returns results
  const codes = rawCodes.slice(0, 8);
  const broadCodes = rawBroadCodes.slice(0, 2);
  if (broadCodes.length === 0 && codes.length > 0) {
    broadCodes.push(codes[0]);
  }

  const searchHref = codes.length ? `#/treatment?codes=${codes.join(',')}` : '#/treatment';
  const broadSearchHref = broadCodes.length ? `#/treatment?codes=${broadCodes.join(',')}` : '#/treatment';

  const dimensionBreakdown = [
    {
      dimension: 'Dimension 1',
      title: t('nav.dim1.short', 'Acute Intoxication & Withdrawal Potential'),
      finding: gabaSevereOrModerateRisk
        ? t('nav.dim1.finding.gaba', 'High-risk alcohol/benzodiazepine withdrawal potential — requires medical withdrawal management (DT/HI).')
        : withdrawalRisk === 'severe'
          ? t('nav.dim1.finding.severe', 'Severe acute withdrawal symptoms — 24-hour medical stabilization recommended.')
          : withdrawalRisk === 'moderate'
            ? t('nav.dim1.finding.moderate', 'Moderate withdrawal symptoms — ambulatory or monitored medication support recommended.')
            : t('nav.dim1.finding.low', 'Low or minimal acute withdrawal risk — safe for outpatient initiation.'),
    },
    {
      dimension: 'Dimension 2',
      title: t('nav.dim2.short', 'Biomedical Conditions'),
      finding:
        biomedical === 'pregnant'
          ? t('nav.dim2.finding.pregnant', 'Perinatal specialty care (PW) with agonist medication maintenance (BU/OTP) prioritized over abrupt detox.')
          : biomedical === 'acute_infection'
            ? t('nav.dim2.finding.infection', 'Acute medical/wound evaluation prioritized (HI / #/health) alongside withdrawal care.')
            : biomedical === 'chronic'
              ? t('nav.dim2.finding.chronic', 'Coordinate ongoing primary care and HIV/HCV screening (#/health).')
              : t('nav.dim2.finding.none', 'No acute biomedical instability reported.'),
    },
    {
      dimension: 'Dimension 3',
      title: t('nav.dim3.short', 'Emotional, Behavioral, or Cognitive Conditions'),
      finding:
        mentalHealth === 'severe_crisis'
          ? t('nav.dim3.finding.crisis', 'Immediate crisis support (988 / walk-in crisis WI) and integrated dual-diagnosis care (MHSU).')
          : mentalHealth === 'mild_moderate'
            ? t('nav.dim3.finding.mhsu', 'Integrated co-occurring mental health and substance use services (MHSU).')
            : mentalHealth === 'trauma'
              ? t('nav.dim3.finding.trauma', 'Trauma-informed clinical care (TRMA).')
              : t('nav.dim3.finding.none', 'Standard behavioral support.'),
    },
    {
      dimension: 'Dimension 4 & 5',
      title: t('nav.dim45.short', 'Substance Use Risks & Recovery Environment'),
      finding: `${asamLevel} (${environment === 'unhoused' ? 'unhoused / recovery housing support' : environment === 'unstable' ? 'unstable environment support' : 'supportive environment'})`,
    },
    {
      dimension: 'Dimension 6',
      title: t('nav.dim6.short', 'Person-Centered & Practical Considerations'),
      finding: [
        preferTelehealth ? 'Telehealth (TELE)' : null,
        payment ? CODE_META[payment]?.label ?? payment : null,
        population ? CODE_META[population]?.label ?? population : null,
      ].filter(Boolean).join(' · ') || t('nav.dim6.finding.default', 'All payment and program types included'),
    },
  ];

  return {
    asamLevel,
    asamTitle,
    summary,
    redFlags,
    clinicalNotes,
    codes,
    broadCodes,
    searchHref,
    broadSearchHref,
    dimensionBreakdown,
    // True when the person reports thoughts of self-harm or feeling unsafe.
    // The view then shows a crisis-first card above the level-of-care result.
    crisis: mentalHealth === 'severe_crisis',
  };
}

/**
 * Turn navigator answers into answers for "Find care that fits", so the
 * person does not have to repeat themselves. Pure, in memory only. Every
 * value stays editable there; nothing here is a clinical decision.
 */
export function matchProfileFromAnswers(answers = {}) {
  const substances = normalizeSubstances(answers.substances);
  const SUBSTANCE = { opioids: 'opioid', xylazine: 'opioid', alcohol: 'alcohol', stimulants: 'stimulant', benzos: 'benzodiazepine' };
  const mapped = [...new Set([...substances].map((s) => SUBSTANCE[s]).filter(Boolean))];
  const COVERAGE = { MD: 'medicaid', MC: 'medicare', PI: 'private', TRICARE: 'military', ITU: 'ihs' };
  const POPULATION = { VET: 'veteran', CJ: 'justice', WN: 'women', MN: 'men' };
  const AGE = { ADOL: 'youth', YA: 'young-adult', SEN: 'senior' };
  const populations = [];
  if (POPULATION[answers.population]) populations.push(POPULATION[answers.population]);
  if (answers.biomedical === 'pregnant') populations.push('pregnant');
  if (answers.mentalHealth === 'trauma') populations.push('trauma');
  if (answers.mentalHealth && answers.mentalHealth !== 'none') populations.push('co-occurring');
  const settings = [];
  if (answers.structureNeeded === '24_hour') settings.push('residential');
  else if (answers.structureNeeded === 'structured_day') settings.push('iop');
  if (answers.withdrawalRisk === 'moderate' || answers.withdrawalRisk === 'severe') settings.push('detox');
  const lowCost = ['SS', 'PA', 'NP'].includes(answers.payment);
  return {
    helpWith: answers.mentalHealth && answers.mentalHealth !== 'none' ? 'both' : 'substance',
    substances: mapped,
    settings,
    coverage: COVERAGE[answers.payment] ?? (lowCost ? 'uninsured' : null),
    needsFinancialHelp: lowCost,
    populations: [...new Set(populations)],
    ageGroup: AGE[answers.population] ?? null,
    modality: answers.preferTelehealth ? 'virtual' : 'either',
  };
}

// ---------------------------------------------------------------------------
// Interactive Care Navigator View
// ---------------------------------------------------------------------------

const SUBSTANCE_CHOICES = [
  {
    id: 'opioids',
    label: 'Opioids (fentanyl, heroin, oxycodone, pressed pills)',
    detail: 'Prioritizes buprenorphine, methadone, or naltrexone & naloxone access',
  },
  {
    id: 'alcohol',
    label: 'Alcohol',
    detail: 'Checks for seizure-safe withdrawal care & FDA-approved alcohol medications',
  },
  {
    id: 'benzos',
    label: 'Benzodiazepines or sedatives (Xanax, Klonopin, Valium, Ativan)',
    detail: 'Requires careful medical tapering to prevent withdrawal seizures',
  },
  {
    id: 'xylazine',
    label: 'Xylazine or medetomidine (“tranq” in dope or pills)',
    detail: 'Adds guidance for alpha-2 adrenergic withdrawal & specialized wound care',
  },
  {
    id: 'stimulants',
    label: 'Stimulants (methamphetamine, cocaine, crack)',
    detail: 'Includes Contingency Management & post-acute mood support',
  },
  {
    id: 'other',
    label: 'Other substances or unsure',
    detail: 'General substance use evaluation & support',
  },
];

const WITHDRAWAL_CHOICES = [
  {
    value: 'none',
    label: 'No withdrawal expected right now',
    detail: 'Not currently physically dependent, or already stable on medication',
  },
  {
    value: 'mild',
    label: 'Mild discomfort (early cravings, restlessness, trouble sleeping, mild anxiety)',
    detail: 'Usually manageable in outpatient or telehealth care',
  },
  {
    value: 'moderate',
    label: 'Moderate withdrawal (sweating, tremors/shakes, nausea, muscle aches, heavy daily use)',
    detail: 'Medical withdrawal support or rapid medication start strongly recommended',
  },
  {
    value: 'severe',
    label: 'Severe withdrawal risk (past withdrawal seizures or DTs, severe vomiting, confusion, or unable to keep fluids down)',
    detail: 'Requires 24-hour medically managed withdrawal care or hospital evaluation',
  },
];

const BIOMEDICAL_CHOICES = [
  {
    value: 'none',
    label: 'No urgent physical health conditions right now',
    detail: 'Standard medical screening',
  },
  {
    value: 'pregnant',
    label: 'Pregnant or recently postpartum',
    detail: 'Prioritizes specialized perinatal care (PW) & safe agonist maintenance (BU/OTP)',
  },
  {
    value: 'chronic',
    label: 'Ongoing medical condition (HIV, Hepatitis C, chronic pain, heart/liver/kidney disease)',
    detail: 'Coordinates primary care & testing alongside treatment',
  },
  {
    value: 'acute_infection',
    label: 'Fever, severe or necrotic skin wound (such as xylazine ulcer), chest pain, or possible serious infection',
    detail: 'Needs immediate medical / hospital evaluation alongside withdrawal relief',
  },
];

const MENTAL_HEALTH_CHOICES = [
  {
    value: 'none',
    label: 'Doing okay emotionally, or looking mainly for substance use care',
    detail: 'Standard counseling and peer support',
  },
  {
    value: 'mild_moderate',
    label: 'Depression, anxiety, bipolar disorder, ADHD, or other ongoing mental health needs',
    detail: 'Adds Co-occurring Mental Health & Substance Use programs (MHSU)',
  },
  {
    value: 'trauma',
    label: 'PTSD or history of trauma, abuse, or violence',
    detail: 'Adds Trauma-Informed Care programs (TRMA) focused on safety & empowerment',
  },
  {
    value: 'severe_crisis',
    label: 'In severe emotional distress, thoughts of self-harm, or feeling unsafe right now',
    detail: 'Highlights immediate 24/7 crisis support (988, walk-in & mobile crisis) + dual-diagnosis care',
  },
];

const ENVIRONMENT_CHOICES = [
  {
    value: 'supportive',
    label: 'Safe, stable place to live with supportive people (or safe living alone)',
    detail: 'Supports outpatient, telehealth, or day treatment',
  },
  {
    value: 'unstable',
    label: 'Living around heavy substance use, conflict, or unsafe conditions',
    detail: 'Considers structured day programs, residential care, or recovery housing',
  },
  {
    value: 'unhoused',
    label: 'Unhoused, staying in a shelter, couch-surfing, or at immediate risk of losing housing',
    detail: 'Prioritizes residential care (RES) and recovery housing (HH)',
  },
];

const STRUCTURE_CHOICES = [
  {
    value: 'flexible',
    label: 'Flexible outpatient visits (1–3 hours/week or medication visits around work/family)',
    detail: 'Maps to ASAM Level 1.0 / 1.5 Outpatient or Telehealth',
  },
  {
    value: 'structured_day',
    label: 'Structured multi-day support (9–20+ hours/week of group & medical care while living at home)',
    detail: 'Maps to ASAM Level 2.1 / 2.5 Intensive Outpatient (IOP) or Partial Hospitalization (PHP)',
  },
  {
    value: '24_hour',
    label: '24-hour live-in care (residential treatment or inpatient medical stabilization)',
    detail: 'Maps to ASAM Level 3.1–3.7 Residential or Level 3.7-WM / 4.0 Inpatient',
  },
];

export function careNavigatorView({ query } = {}) {
  // All clinical self-check state lives strictly in this closure in browser RAM.
  const answers = {
    substances: new Set(),
    withdrawalRisk: 'none',
    biomedical: 'none',
    mentalHealth: 'none',
    environment: 'supportive',
    structureNeeded: 'flexible',
    payment: query?.get('payment') ?? '',
    population: query?.get('population') ?? '',
    preferTelehealth: query?.get('tele') === '1',
  };

  const recommendationContainer = h('div', {
    id: 'asam-recommendation-card',
    'aria-live': 'polite',
  });

  function updateRecommendation(shouldAnnounce = false) {
    const result = evaluateAsamCare(answers);
    clear(recommendationContainer);

    const codeChips = h(
      'ul',
      { class: 'chips', 'aria-label': t('nav.results.codes_label', 'Recommended SAMHSA filter codes') },
      result.codes.map((code) => {
        const meta = CODE_META[code] ?? { label: code, tone: 'care' };
        return h('li', { class: `chip chip-${meta.tone}` }, `${meta.label} (${code})`);
      }),
    );

    const redFlagsBlock = result.redFlags.length
      ? h(
          'div',
          { class: 'callout callout-emergency', role: 'region', 'aria-label': t('nav.results.redflags_aria', 'Important medical safety alerts') },
          h(
            'p',
            { class: 'callout-title' },
            icon('alert'),
            t('nav.results.redflags_title', 'Important clinical safety guidance'),
          ),
          ul(result.redFlags),
          h(
            'p',
            { class: 'actions' },
            tel('911', [icon('phone'), t('nav.cta.call911', 'Call 911 for medical emergencies')], { class: 'btn btn-emergency btn-small' }),
            tel('988', [icon('phone'), t('nav.cta.call988', 'Call or text 988 Crisis Lifeline')], { class: 'btn btn-secondary btn-small' }),
            biomedicalNeedsHealthLink(answers.biomedical) &&
              h('a', { class: 'btn btn-secondary btn-small', href: '#/health' }, icon('heart'), t('nav.cta.find_health', 'Find low-cost medical / wound care')),
          ),
        )
      : null;

    const clinicalNotesBlock = result.clinicalNotes.length
      ? h(
          'div',
          { class: 'callout callout-info' },
          h(
            'p',
            { class: 'callout-title' },
            icon('info'),
            t('nav.results.notes_title', 'General information about your options (not medical advice)'),
          ),
          ul(result.clinicalNotes),
        )
      : null;

    const breakdownList = h(
      'dl',
      { class: 'service-list' },
      result.dimensionBreakdown.flatMap((item) => [
        h('dt', null, `${item.dimension}: ${item.title}`),
        h('dd', null, item.finding),
      ]),
    );

    // Self-harm or feeling unsafe: safety comes before any program search.
    const crisisCard = result.crisis
      ? h(
          'div',
          { class: 'callout callout-emergency', role: 'region', 'aria-labelledby': 'nav-crisis-title' },
          h(
            'p',
            { class: 'callout-title', id: 'nav-crisis-title' },
            icon('alert'),
            t('nav.crisis.title', 'Your safety comes first. You can get help right now.'),
          ),
          p(
            t(
              'nav.crisis.body',
              'You said you are having thoughts of self-harm or feeling unsafe. You do not have to wait for a treatment program. Call or text 988 to talk with a trained crisis counselor now. It is free, confidential, and open 24/7. If you are in immediate danger, call 911.',
            ),
          ),
          h(
            'p',
            { class: 'actions' },
            tel('988', [icon('phone'), t('nav.crisis.call988', 'Call 988 now')], { class: 'btn btn-emergency btn-large' }),
            sms('988', undefined, [icon('message'), t('hotline.988.text', 'Text 988')], { class: 'btn btn-secondary' }),
            tel('911', [icon('phone'), t('nav.crisis.call911', 'Call 911 if you are in immediate danger')], { class: 'btn btn-secondary' }),
          ),
        )
      : null;

    if (crisisCard) recommendationContainer.append(crisisCard);
    recommendationContainer.append(
      h(
        'div',
        { class: 'card' },
        h('p', { class: 'fine' }, t('nav.results.kicker', 'A suggested starting point to discuss, based on your own answers and the ASAM Criteria dimensions')),
        h('h3', { id: 'recommendation-heading' }, `${result.asamLevel} — ${result.asamTitle}`),
        h(
          'div',
          { class: 'callout callout-warn', role: 'note' },
          p(
            strong(t('nav.disclaimer', 'This is not a diagnosis or a clinical assessment. A licensed clinician will assess you.')),
            ' ',
            t('nav.results.disclaimer_body', 'This result only reflects what you told us. Only a licensed clinician can decide which level of care is right for you.'),
          ),
        ),
        p(result.summary),
        redFlagsBlock,
        h('p', { class: 'label' }, t('nav.results.matched_filters', 'Matched SAMHSA treatment filters (max 8 to protect search breadth):')),
        codeChips,
        h(
          'div',
          { class: 'actions' },
          h(
            'button',
            {
              type: 'button',
              class: result.crisis ? 'btn btn-secondary' : 'btn btn-primary btn-large',
              onclick: () => {
                prefillMatch(matchProfileFromAnswers(answers));
                location.replace('#/match');
              },
            },
            icon('compass'),
            t('nav.cta.rank_for_me', 'Rank programs for my answers'),
          ),
          h(
            'a',
            { class: 'btn btn-secondary', href: result.searchHref },
            icon('search'),
            t('nav.cta.search_matching', 'Search matching treatment near me'),
          ),
          h(
            'a',
            { class: 'btn btn-secondary', href: result.broadSearchHref },
            icon('compass'),
            t('nav.cta.search_broad', 'Broaden search ({codes})', { codes: result.broadCodes.join(', ') || 'All' }),
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-ghost',
              onclick: async () => {
                const handoffText = formatAsamHandoffText(answers, result);
                try {
                  await navigator.clipboard.writeText(handoffText);
                  announce(t('nav.announce.copied_handoff', 'Your answers were copied to the clipboard'));
                } catch {
                  announce(t('nav.announce.copy_unavailable', 'Copy is not available in this browser'));
                }
              },
            },
            icon('copy'),
            t('nav.cta.copy_handoff', 'Copy my answers to share with a clinician'),
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-ghost',
              onclick: () => window.print(),
            },
            icon('printer'),
            t('nav.cta.print', 'Print my answers'),
          ),
        ),
        fine(
          t(
            'nav.results.samhsa_hint',
            'Tip: SAMHSA combines filters with AND. If “Search matching treatment near me” shows few results in a rural area, use “Broaden search” to search by your primary level of care first.',
          ),
        ),
        clinicalNotesBlock,
        h(
          'details',
          { class: 'facility-details' },
          h('summary', null, t('nav.results.breakdown_summary', 'See how your answers map to the 6 ASAM Criteria dimensions')),
          breakdownList,
        ),
      ),
    );

    if (shouldAnnounce) {
      announce(
        t('nav.announce.updated', 'Updated recommendation: {level}', {
          level: `${result.asamLevel} ${result.asamTitle}`,
        }),
      );
    }
  }

  function biomedicalNeedsHealthLink(bio) {
    return bio === 'acute_infection' || bio === 'chronic' || bio === 'pregnant';
  }

  // Build interactive form controls
  const substanceCheckboxes = SUBSTANCE_CHOICES.map((choice) => {
    const input = h('input', {
      type: 'checkbox',
      name: 'substances',
      value: choice.id,
      checked: answers.substances.has(choice.id),
      onchange: () => {
        if (input.checked) answers.substances.add(choice.id);
        else answers.substances.delete(choice.id);
        updateRecommendation(true);
      },
    });
    return h(
      'label',
      { class: 'check' },
      input,
      h('span', null, t(`nav.sub.${choice.id}`, choice.label), h('small', null, t(`nav.sub.${choice.id}.detail`, choice.detail))),
    );
  });

  function buildRadioGroup(name, choices, currentKey) {
    return choices.map((choice) => {
      const input = h('input', {
        type: 'radio',
        name,
        value: choice.value,
        checked: answers[currentKey] === choice.value,
        onchange: () => {
          if (input.checked) {
            answers[currentKey] = choice.value;
            updateRecommendation(true);
          }
        },
      });
      return h(
        'label',
        { class: 'check' },
        input,
        h(
          'span',
          null,
          t(`nav.${name}.${choice.value}`, choice.label),
          choice.detail && h('small', null, t(`nav.${name}.${choice.value}.detail`, choice.detail)),
        ),
      );
    });
  }

  const withdrawalRadios = buildRadioGroup('withdrawalRisk', WITHDRAWAL_CHOICES, 'withdrawalRisk');
  const biomedicalRadios = buildRadioGroup('biomedical', BIOMEDICAL_CHOICES, 'biomedical');
  const mentalHealthRadios = buildRadioGroup('mentalHealth', MENTAL_HEALTH_CHOICES, 'mentalHealth');
  const environmentRadios = buildRadioGroup('environment', ENVIRONMENT_CHOICES, 'environment');
  const structureRadios = buildRadioGroup('structureNeeded', STRUCTURE_CHOICES, 'structureNeeded');

  function applyWithdrawalRiskFromCalculator(riskValue, substanceToEnsure) {
    answers.withdrawalRisk = riskValue;
    for (const lbl of withdrawalRadios) {
      const inp = lbl.querySelector('input');
      if (inp) inp.checked = inp.value === riskValue;
    }
    if (substanceToEnsure) {
      answers.substances.add(substanceToEnsure);
      for (const lbl of substanceCheckboxes) {
        const inp = lbl.querySelector('input');
        if (inp && inp.value === substanceToEnsure) inp.checked = true;
      }
    }
    updateRecommendation(true);
  }

  // -------------------------------------------------------------------------
  // Interactive Validated Withdrawal Self-Check Calculators (Collapsible)
  // -------------------------------------------------------------------------
  const opioidSymptomsState = {};
  const opioidResultContainer = h('div', { 'aria-live': 'polite' });

  function renderOpioidCalcResult() {
    const res = scoreOpioidWithdrawal(opioidSymptomsState);
    clear(opioidResultContainer);
    const calloutTone = res.score >= 21 ? 'callout-emergency' : res.score >= 8 ? 'callout-info' : 'callout-warn';
    opioidResultContainer.append(
      h(
        'div',
        { class: `callout ${calloutTone}` },
        h(
          'p',
          { class: 'callout-title' },
          icon('info'),
          t('nav.calc.opioid.score_heading', 'Opioid Withdrawal Score: {score} / 32 ({band})', {
            score: res.score,
            band: res.band.replace(/_/g, ' '),
          }),
        ),
        p(res.bupGuidance),
        h(
          'p',
          { class: 'actions' },
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-secondary btn-small',
              onclick: () => applyWithdrawalRiskFromCalculator(res.navWithdrawalRisk, 'opioids'),
            },
            icon('check'),
            t('nav.calc.apply_btn', 'Apply to my Care Navigator above'),
          ),
          h(
            'a',
            { class: 'btn btn-ghost btn-small', href: '#/medications' },
            t('nav.calc.meds_link', 'Read buprenorphine & micro-induction guide'),
          ),
        ),
      ),
    );
  }

  const opioidSelectControls = OPIOID_SYMPTOM_ITEMS.map((item) => {
    const sel = h(
      'select',
      {
        class: 'select',
        id: `opioid-sym-${item.key}`,
        onchange: (e) => {
          opioidSymptomsState[item.key] = Number(e.target.value);
          renderOpioidCalcResult();
        },
      },
      h('option', { value: '0' }, t('nav.calc.opt.0', '0 — None')),
      h('option', { value: '1' }, t('nav.calc.opt.1', '1 — Mild')),
      h('option', { value: '2' }, t('nav.calc.opt.2', '2 — Moderate')),
      h('option', { value: '4' }, t('nav.calc.opt.4', '4 — Severe')),
    );
    return h(
      'div',
      { class: 'resource' },
      h('label', { class: 'label', for: `opioid-sym-${item.key}` }, t(`nav.calc.opioid.${item.key}`, item.label)),
      h('p', { class: 'help' }, t(`nav.calc.opioid.${item.key}.detail`, item.detail)),
      sel,
    );
  });

  const alcoholFactorsState = {};
  const alcoholResultContainer = h('div', { 'aria-live': 'polite' });

  function renderAlcoholCalcResult() {
    const res = scoreAlcoholSedativeRisk(alcoholFactorsState);
    clear(alcoholResultContainer);
    const calloutTone =
      res.riskLevel === 'high_seizure_dt_risk'
        ? 'callout-emergency'
        : res.riskLevel === 'moderate'
          ? 'callout-warn'
          : 'callout-info';
    alcoholResultContainer.append(
      h(
        'div',
        { class: `callout ${calloutTone}` },
        h(
          'p',
          { class: 'callout-title' },
          icon('alert'),
          t('nav.calc.alcohol.score_heading', 'Alcohol / Sedative Risk Score: {score} ({level})', {
            score: res.score,
            level: res.riskLevel.replace(/_/g, ' '),
          }),
        ),
        p(res.guidance),
        h(
          'p',
          { class: 'actions' },
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-secondary btn-small',
              onclick: () => {
                const sub = answers.substances.has('benzos') ? 'benzos' : 'alcohol';
                applyWithdrawalRiskFromCalculator(res.navWithdrawalRisk, sub);
              },
            },
            icon('check'),
            t('nav.calc.apply_btn', 'Apply to my Care Navigator above'),
          ),
        ),
      ),
    );
  }

  const alcoholFactorCheckboxes = ALCOHOL_RISK_ITEMS.map((item) => {
    const inp = h('input', {
      type: 'checkbox',
      value: item.key,
      onchange: () => {
        alcoholFactorsState[item.key] = inp.checked;
        renderAlcoholCalcResult();
      },
    });
    return h(
      'label',
      { class: 'check' },
      inp,
      h(
        'span',
        null,
        t(`nav.calc.alcohol.${item.key}`, item.label),
        h('small', null, t(`nav.calc.alcohol.${item.key}.detail`, item.detail)),
      ),
    );
  });

  renderOpioidCalcResult();
  renderAlcoholCalcResult();

  const withdrawalCalculatorsDetails = h(
    'details',
    { class: 'card facility-details', id: 'withdrawal-self-check-calculators' },
    h(
      'summary',
      null,
      t('nav.calc.summary', 'Optional: Unsure of your withdrawal risk? Use the Clinical Withdrawal Self-Check'),
    ),
    fine(
      t(
        'nav.calc.privacy_note',
        'Calculated 100% in this tab’s memory. Use either calculator below and tap “Apply to my Care Navigator above” to update Dimension 1B.',
      ),
    ),
    h(
      'fieldset',
      { class: 'filter-group' },
      h('legend', null, t('nav.calc.opioid.legend', 'Opioid Withdrawal Self-Check (SOWS / COWS-Informed) & Buprenorphine Timing')),
      h(
        'p',
        { class: 'help' },
        t(
          'nav.calc.opioid.help',
          'Rate how you feel right now across these 8 physical signs to check your withdrawal severity and when sublingual buprenorphine is safest to start.',
        ),
      ),
      h('div', { class: 'resource-list' }, ...opioidSelectControls),
      opioidResultContainer,
    ),
    h(
      'fieldset',
      { class: 'filter-group' },
      h('legend', null, t('nav.calc.alcohol.legend', 'Alcohol & Benzodiazepine / Sedative Seizure & DT Risk Check (PAWSS / CIWA-Informed)')),
      h(
        'p',
        { class: 'help' },
        t(
          'nav.calc.alcohol.help',
          'Check any factors that apply to estimate the risk of severe GABAergic withdrawal seizures or delirium tremens.',
        ),
      ),
      ...alcoholFactorCheckboxes,
      alcoholResultContainer,
    ),
  );

  const paymentSelect = h(
    'select',
    {
      class: 'select',
      id: 'nav-payment-select',
      onchange: (e) => {
        answers.payment = e.target.value;
        updateRecommendation(true);
      },
    },
    PAYMENT_OPTIONS.map((opt) =>
      h('option', { value: opt.code, selected: answers.payment === opt.code }, t(`nav.pay.${opt.code || 'any'}`, opt.label)),
    ),
  );

  const populationSelect = h(
    'select',
    {
      class: 'select',
      id: 'nav-population-select',
      onchange: (e) => {
        answers.population = e.target.value;
        updateRecommendation(true);
      },
    },
    POPULATION_OPTIONS.map((opt) =>
      h('option', { value: opt.code, selected: answers.population === opt.code }, t(`nav.pop.${opt.code || 'any'}`, opt.label)),
    ),
  );

  const telehealthCheckbox = h('input', {
    type: 'checkbox',
    id: 'nav-telehealth-check',
    checked: answers.preferTelehealth,
    onchange: () => {
      answers.preferTelehealth = telehealthCheckbox.checked;
      updateRecommendation(true);
    },
  });

  const resetBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-ghost btn-small',
      onclick: () => {
        answers.substances.clear();
        answers.withdrawalRisk = 'none';
        answers.biomedical = 'none';
        answers.mentalHealth = 'none';
        answers.environment = 'supportive';
        answers.structureNeeded = 'flexible';
        answers.payment = '';
        answers.population = '';
        answers.preferTelehealth = false;

        for (const lbl of substanceCheckboxes) {
          const inp = lbl.querySelector('input');
          if (inp) inp.checked = false;
        }
        const resetRadios = (labels, defaultVal) => {
          for (const lbl of labels) {
            const inp = lbl.querySelector('input');
            if (inp) inp.checked = inp.value === defaultVal;
          }
        };
        resetRadios(withdrawalRadios, 'none');
        resetRadios(biomedicalRadios, 'none');
        resetRadios(mentalHealthRadios, 'none');
        resetRadios(environmentRadios, 'supportive');
        resetRadios(structureRadios, 'flexible');
        paymentSelect.value = '';
        populationSelect.value = '';
        telehealthCheckbox.checked = false;
        updateRecommendation(true);
      },
    },
    icon('x'),
    t('nav.cta.reset', 'Reset all answers'),
  );

  // Initial render of the recommendation card
  updateRecommendation(false);

  return h(
    'div',
    { class: 'view view-prose' },
    pageHeader(
      t('nav.title', 'Care Navigator: a self-check based on the ASAM Criteria dimensions'),
      t(
        'nav.lede',
        'Not sure whether you need detox, outpatient medication, intensive outpatient, or residential care? Answer as much or as little as you want to match your needs to official SAMHSA treatment filters.',
      ),
    ),

    // Privacy banner: answers are evaluated in the browser
    h(
      'div',
      { class: 'callout callout-info', role: 'note' },
      h(
        'p',
        { class: 'callout-title' },
        icon('lock'),
        t('nav.privacy.title', 'Private self-check: your answers stay in this browser tab'),
      ),
      p(
        t(
          'nav.privacy.body',
          'Your result is worked out in your browser. HarborPath does not send your answers to its server or save them. If you choose to search for programs, only the matching service filters and your rounded location are sent. Closing this tab or pressing Quick exit clears your answers from this page, but not your browser history or anything you copied or printed.',
        ),
      ),
    ),

    emergencyCallout(),

    // 6-Dimension Interactive Questionnaire
    section(
      'self-check',
      t('nav.form.heading', 'Step 1: Tell us what is going on right now'),
      h(
        'form',
        {
          class: 'card',
          onsubmit: (e) => e.preventDefault(),
        },
        h(
          'div',
          { class: 'actions' },
          fine(t('nav.form.instructions', 'Every question is optional. Your care recommendation below updates automatically as you choose.')),
          resetBtn,
        ),

        // Dimension 1A: Substances
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim1a.legend', 'Dimension 1A · Which substances are involved? (Select all that apply)')),
          h('p', { class: 'help' }, t('nav.dim1a.help', 'Different substances carry very different withdrawal risks and medication options.')),
          ...substanceCheckboxes,
        ),

        // Dimension 1B: Withdrawal Risk + Collapsible Validated Calculators
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim1b.legend', 'Dimension 1B · What is your risk of withdrawal if you stop or cut back?')),
          h(
            'p',
            { class: 'help' },
            t('nav.dim1b.help', 'Daily heavy alcohol or benzodiazepine use, or past withdrawal seizures/delirium tremens, requires medical supervision.'),
          ),
          ...withdrawalRadios,
          withdrawalCalculatorsDetails,
        ),

        // Dimension 2: Biomedical Conditions
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim2.legend', 'Dimension 2 · Physical health, pregnancy, or wound care needs')),
          h('p', { class: 'help' }, t('nav.dim2.help', 'Helps match programs with perinatal care, medical monitoring, or wound/infection treatment.')),
          ...biomedicalRadios,
        ),

        // Dimension 3: Emotional / Behavioral / Cognitive
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim3.legend', 'Dimension 3 · Mental health, emotional wellbeing, and trauma')),
          h('p', { class: 'help' }, t('nav.dim3.help', 'Co-occurring mental health and substance use care works best when both are treated together.')),
          ...mentalHealthRadios,
        ),

        // Dimension 4: Structure Needed
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim4.legend', 'Dimension 4 · How much daily structure feels right to stay safe?')),
          h('p', { class: 'help' }, t('nav.dim4.help', 'You can start with flexible outpatient care or choose more intensive daily or live-in support.')),
          ...structureRadios,
        ),

        // Dimension 5: Recovery Environment
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim5.legend', 'Dimension 5 · What is your current living situation and environment like?')),
          h('p', { class: 'help' }, t('nav.dim5.help', 'Identifies when recovery housing or residential stability could help protect your recovery.')),
          ...environmentRadios,
        ),

        // Dimension 6: Person-Centered & Practical Access
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim6.legend', 'Dimension 6 · Insurance, payment, telehealth, and community preferences')),
          h('p', { class: 'help' }, t('nav.dim6.help', 'Optional filters to narrow listings to places that fit your coverage and life.')),
          h(
            'div',
            { class: 'location-row' },
            h(
              'div',
              null,
              h('label', { class: 'label', for: 'nav-payment-select' }, t('nav.dim6.payment_label', 'Cost & insurance')),
              paymentSelect,
            ),
            h(
              'div',
              null,
              h('label', { class: 'label', for: 'nav-population-select' }, t('nav.dim6.population_label', 'Dedicated program for')),
              populationSelect,
            ),
          ),
          h(
            'label',
            { class: 'check' },
            telehealthCheckbox,
            h(
              'span',
              null,
              t('nav.dim6.telehealth', 'Prefer telehealth / phone or video visits (code TELE)'),
              h('small', null, t('nav.dim6.telehealth_detail', 'Buprenorphine and outpatient counseling can often be started by phone or video.')),
            ),
          ),
        ),
      ),
    ),

    // Live Clinical Recommendation Output
    section(
      'recommendation',
      t('nav.results.heading', 'Step 2: A suggested starting point to discuss with a clinician'),
      recommendationContainer,
    ),

    // MD-authored Know Your Rights: Hospital & Emergency Bridge Care
    section(
      'emergency-bridge-rights',
      t('nav.rights.heading', 'Hospital & Emergency Bridge Care (Know Your Rights)'),
      p(
        t(
          'nav.rights.intro',
          'If you are in acute withdrawal, pregnant, or dealing with a serious infection, federal laws protect your right to receive stabilizing medical treatment:',
        ),
      ),
      ul([
        [
          strong(t('nav.rights.emtala.title', 'EMTALA (Emergency Medical Treatment and Labor Act): ')),
          t(
            'nav.rights.emtala.body',
            'Any hospital with an emergency department that accepts Medicare must provide a medical screening exam and stabilizing treatment for emergency medical conditions—including life-threatening alcohol or sedative withdrawal, severe dehydration, overdose, active labor, or serious infections—regardless of your insurance status, citizenship, or ability to pay.',
          ),
        ],
        [
          strong(t('nav.rights.dea72.title', 'The DEA 72-Hour Rule (21 CFR § 1306.07(b)): ')),
          t(
            'nav.rights.dea72.body',
            'Federal law allows physicians and authorized hospital/emergency clinicians to administer or dispense up to 72 hours (3 days) of buprenorphine or methadone to relieve acute opioid withdrawal while arranging ongoing treatment—even if the hospital is not an Opioid Treatment Program (OTP). Under the Medication Access and Training Expansion (MATE) and X-waiver elimination, any practitioner with a standard DEA Schedule III registration can also prescribe buprenorphine for home use.',
          ),
        ],
        [
          strong(t('nav.rights.perinatal.title', 'Perinatal Substance Use & Standard of Care (ACOG / ASAM): ')),
          t(
            'nav.rights.perinatal.body',
            'For pregnant people with opioid use disorder, the American College of Obstetricians and Gynecologists (ACOG) and ASAM recommend agonist pharmacotherapy (buprenorphine or methadone) as the gold standard of care. Abrupt withdrawal carries significant risks to the fetus. Federal CAPTA guidelines call for supportive Plans of Safe Care that connect families with health and recovery services.',
          ),
        ],
        [
          strong(t('nav.rights.privacy.title', '42 CFR Part 2 Confidentiality & Non-Discrimination (ADA): ')),
          t(
            'nav.rights.privacy.body',
            'Federal law (42 CFR Part 2) strictly protects substance use disorder treatment records from being shared with law enforcement, employers, or courts without your written consent or a specialized court order. In addition, the Americans with Disabilities Act (ADA) protects people taking prescribed buprenorphine or methadone from being denied admission to skilled nursing facilities, hospitals, or many recovery programs solely because of their medication.',
          ),
        ],
      ]),
      p(
        h('a', { class: 'btn btn-secondary', href: '#/choosing-care' }, icon('check-circle'), t('nav.rights.choosing_link', 'Questions to ask & red flags for treatment scams')),
        ' ',
        h('a', { class: 'btn btn-secondary', href: '#/harm-reduction' }, icon('shield'), t('nav.rights.harm_link', 'Harm reduction, naloxone & wound care guide')),
      ),
    ),
  );
}

export const navigatorView = careNavigatorView;
export default careNavigatorView;
