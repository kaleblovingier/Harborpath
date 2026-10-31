import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, emergencyCallout } from './common.js';

// ============================================================================
// Stages of Change Taxonomy (Transtheoretical Model - Prochaska & DiClemente)
// ============================================================================

/**
 * Validated Stages of Change taxonomy covering the 5 canonical stages
 * of the Transtheoretical Model (TTM), plus slip/recurrence support.
 *
 * Can be iterated as an array or accessed as a dictionary by stage ID.
 */
const STAGES_LIST = [
  {
    id: 'precontemplation',
    name: 'Precontemplation',
    title: 'Precontemplation (Not Ready / Exploring)',
    plainLanguageTitle: 'Not thinking about changing right now',
    tagline: 'Not currently considering a change in substance use',
    description: 'You feel content with how things are right now, or you feel exhausted by other people telling you what to do. You may not view drug or alcohol use as a problem, or past attempts may have left you feeling that change is too difficult or discouraging.',
    clinicalGoal: 'Empathy, harm reduction, overdose prevention, and establishing an open, non-judgmental alliance without pressure.',
    motivationalCoachingPrompt: 'What is most important to you in your life right now? What keeps you safe? You are the expert on your own life, and no one can force you to change anything.',
    coachingPrompt: 'What is most important to you in your life right now? What keeps you safe? You are the expert on your own life, and no one can force you to change anything.',
    recommendedNextSteps: [
      'Keep harm reduction supplies nearby (fentanyl and xylazine test strips, sterile supplies).',
      'Obtain and carry naloxone (Narcan) — let friends know where it is in case of an emergency.',
      'Never use alone: Call the Never Use Alone line (800-484-3731) or use the Brave App.',
      'Connect with a peer support specialist who has lived experience with zero pressure to stop.',
      'Access low-barrier medical care (hepatitis C and HIV testing, wound care, basic wellness).',
    ],
  },
  {
    id: 'contemplation',
    name: 'Contemplation',
    title: 'Contemplation (Ambivalent / Weighing Options)',
    plainLanguageTitle: 'Thinking about change, but weighing pros and cons',
    tagline: 'Torn between the benefits of use and the costs or risks',
    description: 'You are aware that substance use has downsides, expenses, or risks, but you also experience genuine benefits, emotional relief, or social connection from using. You are weighing whether making a change is worth the discomfort and effort.',
    clinicalGoal: 'Explore ambivalence, conduct decisional balance, examine core values, and build hope without forcing commitment.',
    motivationalCoachingPrompt: 'What are the good things about using, and what are the less good things? If you woke up tomorrow and things were 10% better or easier, what would be different?',
    coachingPrompt: 'What are the good things about using, and what are the less good things? If you woke up tomorrow and things were 10% better or easier, what would be different?',
    recommendedNextSteps: [
      'Use the interactive Decisional Balance matrix below to clearly map pros and cons.',
      'Learn about medications for addiction treatment (MOUD/MAUD) that reduce cravings without requiring immediate abstinence.',
      'Talk confidentially with a non-judgmental addiction counselor or peer navigator.',
      'Try small, low-risk harm reduction experiments (e.g. tracking amounts, taking pacing breaks).',
      'Read stories of how people with similar experiences resolved their ambivalence.',
    ],
  },
  {
    id: 'preparation',
    name: 'Preparation',
    title: 'Preparation (Planning / Getting Ready)',
    plainLanguageTitle: 'Ready to take steps soon and planning how',
    tagline: 'Decided to make changes and preparing concrete steps',
    description: 'You have decided that making a change is important to you and are ready to take action in the immediate future (typically within the next 30 days). You are gathering information, exploring options, and setting up support systems.',
    clinicalGoal: 'Co-design an individualized change plan, identify personal triggers, choose treatment modalities, and prepare support systems.',
    motivationalCoachingPrompt: 'What is one small, concrete step you feel ready to try this week? What resources or people would make that step easier?',
    coachingPrompt: 'What is one small, concrete step you feel ready to try this week? What resources or people would make that step easier?',
    recommendedNextSteps: [
      'Schedule a medical evaluation for FDA-approved medications (buprenorphine, methadone, naltrexone, acamprosate).',
      'Complete a personalized safety and coping plan for cravings and stressful moments.',
      'Identify 1–2 trusted people (friends, family, mentors) who support your goals without judgment.',
      'Look into treatment formats that fit your schedule: outpatient clinic, intensive outpatient (IOP), telehealth, or residential.',
      'Prepare your living space by removing triggers and setting boundaries with people who use.',
    ],
  },
  {
    id: 'action',
    name: 'Action',
    title: 'Action (Actively Changing)',
    plainLanguageTitle: 'Actively making changes right now',
    tagline: 'Putting time and energy into changing behavior and routines',
    description: 'You are actively implementing changes in your substance use patterns, routines, or environment (within the past 6 months). You are learning new coping habits, managing cravings, and navigating daily life with different tools.',
    clinicalGoal: 'Reinforce self-efficacy, manage acute cravings and withdrawal, modify environments, and build relapse prevention skills.',
    motivationalCoachingPrompt: 'What strategies have worked best for you so far? When a strong craving hits, what is your go-to move to ride it out?',
    coachingPrompt: 'What strategies have worked best for you so far? When a strong craving hits, what is your go-to move to ride it out?',
    recommendedNextSteps: [
      'Maintain consistent adherence to prescribed medications (MOUD/MAUD).',
      'Engage with mutual aid groups (SMART Recovery, 12-Step, LifeRing, Harm Reduction Works).',
      'Practice urge surfing: observe cravings as waves that peak at 15–20 minutes and naturally subside.',
      'Develop alternative dopamine sources: movement, creative arts, nature, good nutrition, and restful sleep.',
      'Keep in regular contact with your counselor, therapist, or peer specialist.',
    ],
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    title: 'Maintenance (Sustaining Recovery / Growth)',
    plainLanguageTitle: 'Sustaining changes long-term and preventing slips',
    tagline: 'Maintaining positive changes for 6 months or longer',
    description: 'You have maintained your desired changes for 6 months or longer. Your focus has expanded from avoiding return to use to building a fulfilling, balanced, and sustainable life with deeper relationships and personal growth.',
    clinicalGoal: 'Consolidate recovery identity, maintain lifestyle balance, monitor subtle warning signs, and foster ongoing personal fulfillment.',
    motivationalCoachingPrompt: 'How has your life expanded since you made these changes? What daily rituals keep you grounded when life gets stressful?',
    coachingPrompt: 'How has your life expanded since you made these changes? What daily rituals keep you grounded when life gets stressful?',
    recommendedNextSteps: [
      'Continue regular healthcare and medication check-ins without abrupt discontinuation.',
      'Stay connected to your community or mutual aid network, perhaps exploring mentorship or service.',
      'Periodically refresh your early warning sign checklist (isolation, sleep changes, resentment, exhaustion).',
      'Celebrate your milestones, resilience, and personal growth with people who love you.',
      'Invest in long-term goals: education, career, relationships, creative pursuits, and physical health.',
    ],
  },
  {
    id: 'recurrence',
    name: 'Recurrence / Slip Support',
    title: 'Recurrence / Slip Support (Learning & Re-engaging)',
    plainLanguageTitle: 'Had a slip or return to use — restarting with compassion',
    tagline: 'A return to use is a clinical event and learning opportunity, not a failure',
    description: 'A lapse, slip, or return to use is a clinical event and a very common part of managing chronic health conditions. It does not erase your past progress, hard work, or recovery time. It provides crucial clues about unmet needs, new stressors, or gaps in support.',
    clinicalGoal: 'Immediate harm reduction and overdose prevention (addressing lowered tolerance), shame reduction, rapid re-entry into care, and trigger analysis.',
    motivationalCoachingPrompt: 'You deserve safety, care, and compassion right now. What were you feeling right before the slip, and what can this experience teach us about what you need?',
    coachingPrompt: 'You deserve safety, care, and compassion right now. What were you feeling right before the slip, and what can this experience teach us about what you need?',
    recommendedNextSteps: [
      'CRITICAL OVERDOSE WARNING: Lowered tolerance dramatically increases fatal overdose risk. Take much smaller test amounts and never use alone.',
      'Ensure you have fresh naloxone (Narcan) immediately on hand. Have someone with you or call Never Use Alone (800-484-3731).',
      'Reach out immediately to your prescriber, counselor, or trusted supporter — do not isolate or hide.',
      'Practice self-compassion: Remind yourself that every single day of change in your past still counts and lives in your brain.',
      'Conduct a gentle review of the event: What was the trigger? What was the unmet need? How can your safety plan adjust?',
    ],
  },
];

export const STAGES_OF_CHANGE = [...STAGES_LIST];
for (const stage of STAGES_LIST) {
  STAGES_OF_CHANGE[stage.id] = stage;
}

// ============================================================================
// Validated URICA-Inspired 8-Item Likert Scale Assessment
// ============================================================================

export const LIKERT_OPTIONS = [
  { score: 1, label: 'Strongly disagree', shortLabel: 'Strongly disagree' },
  { score: 2, label: 'Disagree', shortLabel: 'Disagree' },
  { score: 3, label: 'Neutral / Undecided', shortLabel: 'Neutral' },
  { score: 4, label: 'Agree', shortLabel: 'Agree' },
  { score: 5, label: 'Strongly agree', shortLabel: 'Strongly agree' },
];

/**
 * Validated URICA-inspired 8 statements evaluating readiness to make
 * a change regarding alcohol, opioids, stimulants, or other substances.
 */
const STATEMENTS_LIST = [
  {
    id: 's1',
    stage: 'precontemplation',
    category: 'Precontemplation',
    statement: 'As far as I am concerned, my alcohol or drug use is not really a problem that needs changing.',
    prompt: 'How much does this describe you right now?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 's2',
    stage: 'precontemplation',
    category: 'Precontemplation',
    statement: 'Other people worry about my drug or alcohol use, but I think they exaggerate or make too big a deal out of it.',
    prompt: 'How much does this describe you right now?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 's3',
    stage: 'contemplation',
    category: 'Contemplation',
    statement: 'I have been thinking that my substance use might be causing some difficulties, and I wonder if I should make a change.',
    prompt: 'How much does this describe you right now?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 's4',
    stage: 'contemplation',
    category: 'Contemplation',
    statement: 'Part of me relies on or enjoys using, but another part of me worries about the health, relationship, or financial consequences.',
    prompt: 'How much does this describe you right now?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 's5',
    stage: 'preparation',
    category: 'Preparation',
    statement: 'I have decided that I want to change how I use substances, and I am preparing to take concrete steps in the next 30 days.',
    prompt: 'How much does this describe you right now?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 's6',
    stage: 'preparation',
    category: 'Preparation',
    statement: 'I am actively looking into treatment options, harm reduction strategies, or support networks to help me make changes.',
    prompt: 'How much does this describe you right now?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 's7',
    stage: 'action',
    category: 'Action',
    statement: 'I am actively putting time and effort into cutting down, stopping, or changing my routines right now.',
    prompt: 'How much does this describe you right now?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 's8',
    stage: 'maintenance',
    category: 'Maintenance',
    statement: 'I have already made positive changes in my substance use and my primary focus is keeping them going and preventing a slip.',
    prompt: 'How much does this describe you right now?',
    options: LIKERT_OPTIONS,
  },
];

export const READINESS_STATEMENTS = [...STATEMENTS_LIST];
for (const stmt of STATEMENTS_LIST) {
  READINESS_STATEMENTS[stmt.id] = stmt;
}

// ============================================================================
// Decisional Balance Matrix Taxonomy (Pros & Cons of Using vs Changing)
// ============================================================================

export const DECISIONAL_BALANCE_PROMPTS = {
  likes: {
    id: 'likes',
    title: 'What I like about using',
    subtitle: 'Benefits, relief, and reasons to continue using as you do now',
    examples: [
      'Relief from anxiety, stress, or intense emotional pain',
      'Helps manage physical pain, fatigue, or chronic discomfort',
      'Social connection and feeling bonded with friends who use',
      'Numbing painful memories, grief, or traumatic experiences',
      'Helps me unwind, relax, or sleep at night',
      'Gives an immediate boost of energy, confidence, or focus',
    ],
  },
  concerns: {
    id: 'concerns',
    title: 'What is difficult or worrying',
    subtitle: 'Costs, downsides, health risks, and stress caused by continuing',
    examples: [
      'Financial costs draining savings or creating debt',
      'Conflict, tension, or broken trust with partner, children, or family',
      'Fear of accidental overdose, poisoning, or dangerous cuts (fentanyl, xylazine)',
      'Physical withdrawal sickness, severe hangovers, or feeling trapped',
      'Struggling at work, school, or missing important life goals',
      'Feeling like the substance has taken over my daily choices',
    ],
  },
  positives: {
    id: 'positives',
    title: 'What would be better if things changed',
    subtitle: 'Hopes, personal values, and benefits of making a change',
    examples: [
      'Better physical energy, clearer thinking, and overall health',
      'Saving money for things that truly matter to me and my family',
      'Rebuilding trust, honesty, and emotional connection with loved ones',
      'Freedom from the daily panic of cravings and withdrawal sickness',
      'Clearer thinking, emotional stability, and true peace of mind',
      'Lower risk of legal problems, medical emergencies, or hospital visits',
    ],
  },
  hurdles: {
    id: 'hurdles',
    title: 'What feels hard about changing',
    subtitle: 'Fears, barriers, losses, and challenges of making a change',
    examples: [
      'Wondering how I will survive intense stress or anxiety without substances',
      'Fear of physical withdrawal symptoms or feeling terribly sick',
      'Losing friends or feeling isolated from social circles that use',
      'Fear that I will try and not succeed (fear of failing)',
      'Cravings feeling so overpowering that I cannot resist them',
      'Having to feel difficult emotions or memories I have been avoiding',
    ],
  },
};

// ============================================================================
// CRAFT Guidance Taxonomy (Community Reinforcement and Family Training)
// ============================================================================

export const CRAFT_GUIDANCE = {
  title: 'CRAFT: Guidance for Families, Loved Ones & Allies',
  subtitle: 'Community Reinforcement and Family Training — Evidence-based strategies for concerned significant others',
  strategies: [
    {
      id: 'positive_communication',
      title: 'Positive Communication Strategies',
      summary: 'Replace accusations and lecturing with clear, positive, and loving "I" statements.',
      practices: [
        'Use "I" statements to share feelings instead of blame (e.g. "I love you and feel worried when I see you hurting" instead of "You are reckless and ruining our lives").',
        'Time your conversations carefully: Never attempt serious discussions when your loved one is high, drunk, or in acute withdrawal. Wait for sober, calm moments.',
        'Keep statements brief and focused on one specific topic rather than bringing up months of past arguments.',
        'Actively praise and reinforce sober moments: Notice when they take a healthy step, share a kind conversation, or engage in a sober hobby.',
      ],
    },
    {
      id: 'non_punitive_boundaries',
      title: 'Non-Punitive Boundaries & Natural Consequences',
      summary: 'Step back from shielding without hostility or punishment, allowing natural consequences to occur.',
      practices: [
        'Stop enabling or shielding: Do not call in sick for them, pay off debts or legal fines, or clean up messes caused by use.',
        'Set clear, consistent limits with love: "I care about you too much to give cash, but I will gladly drive you to a doctor, buy groceries, or sit with you."',
        'Disengage calmly when using starts: Do not argue or plead while substances are active. Calmly state: "I love you, but I cannot be around substance use right now. I am going for a walk."',
        'Never make empty threats: Only state consequences you are prepared and willing to follow through on.',
      ],
    },
    {
      id: 'self_care_allies',
      title: 'Self-Care & Safety for Supporters',
      summary: 'Reclaim your own mental health and safety regardless of your loved one’s choices.',
      practices: [
        'Remember that your life has independent value: Your joy, sleep, and well-being cannot depend completely on someone else’s sobriety.',
        'Reconnect with your own life: Re-engage with friends, hobbies, exercise, and personal therapy.',
        'Join family support groups: Al-Anon, Nar-Anon, SMART Recovery for Friends & Family, or local CRAFT groups.',
        'Safety first: If violence, weapons, or physical threats occur, prioritize immediate safety, call 911 or the Domestic Violence Helpline (800-799-7233).',
      ],
    },
  ],
};

// ============================================================================
// Stage Calculation Engine
// ============================================================================

/**
 * Calculates the Transtheoretical Model (TTM) Readiness Stage from statement answers.
 *
 * Scoring Formula:
 * - Subscales:
 *   - Precontemplation (PC): Mean of s1, s2
 *   - Contemplation (C): Mean of s3, s4
 *   - Preparation (PR): Mean of s5, s6
 *   - Action (A): Score of s7
 *   - Maintenance (M): Score of s8
 * - URICA Readiness Composite Score: (C + A + M) - PC
 *
 * Stage Assignment Rules:
 * - If answers indicate recurrence/slip (hadSlip, recentSlip, or stage === 'recurrence'), returns 'recurrence'.
 * - If stage override is passed in answers, returns that stage.
 * - Otherwise assigns stage by clinical profile:
 *   - High Maintenance (>= 4 and dominant) -> 'maintenance'
 *   - High Action (>= 4 and dominant) -> 'action'
 *   - High Preparation (>= 3.5 and dominant) -> 'preparation'
 *   - Elevated Contemplation (>= 3.0 and >= PC) -> 'contemplation'
 *   - High Precontemplation (>= 3.0) -> 'precontemplation'
 *   - Defaults gracefully based on highest subscale score.
 *
 * @param {Object|Array} answers - Map of statement ID ('s1'..'s8') to 1–5 score, or array.
 * @returns {Object} Comprehensive stage assessment result.
 */
export function calculateReadinessStage(answers = {}) {
  let safeAnswers = {};
  if (answers && typeof answers === 'object') {
    if (answers.answers && typeof answers.answers === 'object') {
      safeAnswers = { ...answers.answers, ...answers };
    } else {
      safeAnswers = answers;
    }
  }
  let answeredCount = 0;
  const dimensionScores = {};

  for (let i = 0; i < READINESS_STATEMENTS.length; i++) {
    const stmt = READINESS_STATEMENTS[i];
    let raw = safeAnswers[stmt.id];
    if (raw === undefined && Array.isArray(safeAnswers)) {
      raw = safeAnswers[i];
    }
    const scoreVal = raw !== undefined && raw !== null ? Number(raw) : null;
    const isValid = scoreVal !== null && !Number.isNaN(scoreVal);
    const score = isValid ? Math.max(1, Math.min(5, scoreVal)) : 0;

    if (isValid) {
      answeredCount++;
    }
    const opt = stmt.options.find((o) => o.score === score) || { score, label: `${score} pts` };
    dimensionScores[stmt.id] = {
      score,
      answered: isValid,
      label: opt.label,
      stage: stmt.stage,
    };
  }

  // Calculate Subscale Scores (1–5 scale, 0 if unrated)
  const calcMean = (keys) => {
    const rated = keys.map((k) => dimensionScores[k]?.score || 0).filter((s) => s > 0);
    if (rated.length === 0) return 0;
    const sum = rated.reduce((a, b) => a + b, 0);
    return Number((sum / rated.length).toFixed(2));
  };

  const pcScore = calcMean(['s1', 's2']);
  const contScore = calcMean(['s3', 's4']);
  const prepScore = calcMean(['s5', 's6']);
  const actionScore = dimensionScores.s7?.score || 0;
  const maintScore = dimensionScores.s8?.score || 0;

  // URICA composite readiness score: (Contemplation + Action + Maintenance) - Precontemplation
  // Baseline range: roughly -4 to +14
  const cVal = contScore || 1;
  const aVal = actionScore || 1;
  const mVal = maintScore || 1;
  const pcVal = pcScore || 1;
  const readinessScore = Number(((cVal + aVal + mVal) - pcVal).toFixed(2));

  // Stage Determination
  let stageKey = 'precontemplation';

  if (safeAnswers.recentSlip === true || safeAnswers.hadSlip === true || safeAnswers.recurrence === true || safeAnswers.stage === 'recurrence') {
    stageKey = 'recurrence';
  } else if (safeAnswers.stage && STAGES_OF_CHANGE[safeAnswers.stage]) {
    stageKey = safeAnswers.stage;
  } else if (answeredCount === 0) {
    // Unstarted assessment defaults to contemplation
    stageKey = 'contemplation';
  } else if (maintScore >= 4 && maintScore > actionScore && maintScore > prepScore && maintScore > contScore) {
    stageKey = 'maintenance';
  } else if (actionScore >= 4 && actionScore >= prepScore && actionScore >= contScore) {
    stageKey = 'action';
  } else if (prepScore >= 3.5 && prepScore >= contScore && prepScore > pcScore) {
    stageKey = 'preparation';
  } else if (contScore >= 3.0 && contScore >= pcScore) {
    stageKey = 'contemplation';
  } else if (pcScore >= 3.0) {
    stageKey = 'precontemplation';
  } else {
    // Fallback: pick the highest subscale score
    const scores = [
      { key: 'maintenance', val: maintScore },
      { key: 'action', val: actionScore },
      { key: 'preparation', val: prepScore },
      { key: 'contemplation', val: contScore },
      { key: 'precontemplation', val: pcScore },
    ];
    scores.sort((a, b) => b.val - a.val);
    stageKey = scores[0].val > 0 ? scores[0].key : 'contemplation';
  }

  const stageDef = STAGES_OF_CHANGE[stageKey] || STAGES_OF_CHANGE.precontemplation;

  return {
    stage: stageDef.id,
    title: stageDef.title,
    plainLanguageTitle: stageDef.plainLanguageTitle,
    tagline: stageDef.tagline,
    description: stageDef.description,
    plainLanguageDescription: stageDef.description,
    motivationalCoachingPrompt: stageDef.motivationalCoachingPrompt,
    coachingPrompt: stageDef.motivationalCoachingPrompt,
    clinicalGoal: stageDef.clinicalGoal,
    recommendedNextSteps: [...stageDef.recommendedNextSteps],
    readinessScore,
    subscaleScores: {
      precontemplation: pcScore,
      contemplation: contScore,
      preparation: prepScore,
      action: actionScore,
      maintenance: maintScore,
    },
    dimensionScores,
    answeredCount,
    totalStatements: READINESS_STATEMENTS.length,
    isComplete: answeredCount === READINESS_STATEMENTS.length,
    substance: safeAnswers.substance || 'general',
  };
}

// ============================================================================
// Ephemeral in-RAM State Management (Zero storage, Zero cookies, Zero URLs)
// ============================================================================

const createDefaultReadinessState = () => ({
  substance: 'general', // 'alcohol' | 'opioids' | 'stimulants' | 'cannabis' | 'general' | 'other'
  customSubstance: '',
  answers: {},
  decisionalBalance: {
    likes: [],
    concerns: [],
    positives: [],
    hurdles: [],
    customLikes: '',
    customConcerns: '',
    customPositives: '',
    customHurdles: '',
  },
  recentSlip: false,
  selfIdentifiedStage: null,
  craftNotes: '',
  notes: '',
  assessorRole: 'individual', // 'individual' | 'loved_one' | 'counselor' | 'peer'
  timestamp: null,
});

let inMemoryReadinessState = createDefaultReadinessState();
const readinessListeners = new Set();
let activeReadinessReset = null;

export function registerReadinessResetHook(fn) {
  activeReadinessReset = fn;
}

export function subscribeReadinessState(fn) {
  readinessListeners.add(fn);
  return () => readinessListeners.delete(fn);
}

function notifyReadinessListeners() {
  for (const fn of readinessListeners) {
    try {
      fn(inMemoryReadinessState);
    } catch {
      // guard listener error
    }
  }
}

/**
 * Returns a deep copy of the active in-memory readiness state.
 * Guaranteed 100% ephemeral in browser RAM.
 *
 * @returns {Object}
 */
export function getReadinessState() {
  return JSON.parse(JSON.stringify(inMemoryReadinessState));
}

/**
 * Updates the in-memory readiness state with a partial patch.
 * Kept strictly in RAM; never saved to storage, cookies, or URL parameters.
 *
 * @param {Object} patch
 * @returns {Object}
 */
export function setReadinessState(patch = {}) {
  if (patch && typeof patch === 'object') {
    if (typeof patch.substance === 'string') {
      inMemoryReadinessState.substance = patch.substance;
    }
    if (typeof patch.customSubstance === 'string') {
      inMemoryReadinessState.customSubstance = patch.customSubstance;
    }
    if (patch.answers && typeof patch.answers === 'object') {
      inMemoryReadinessState.answers = {
        ...inMemoryReadinessState.answers,
        ...patch.answers,
      };
    }
    if (patch.decisionalBalance && typeof patch.decisionalBalance === 'object') {
      inMemoryReadinessState.decisionalBalance = {
        ...inMemoryReadinessState.decisionalBalance,
        ...patch.decisionalBalance,
      };
    }
    if (typeof patch.recentSlip === 'boolean') {
      inMemoryReadinessState.recentSlip = patch.recentSlip;
    }
    if (patch.selfIdentifiedStage !== undefined) {
      inMemoryReadinessState.selfIdentifiedStage = patch.selfIdentifiedStage;
    }
    if (typeof patch.craftNotes === 'string') {
      inMemoryReadinessState.craftNotes = patch.craftNotes;
    }
    if (typeof patch.notes === 'string') {
      inMemoryReadinessState.notes = patch.notes;
    }
    if (typeof patch.assessorRole === 'string') {
      inMemoryReadinessState.assessorRole = patch.assessorRole;
    }
    if (patch.timestamp !== undefined) {
      inMemoryReadinessState.timestamp = patch.timestamp;
    }
    notifyReadinessListeners();
  }
  return getReadinessState();
}

/**
 * Wipes all readiness state completely from browser RAM.
 * Integrated with Quick Exit and local reset actions.
 *
 * @returns {Object} Clean default state
 */
export function resetReadinessState() {
  inMemoryReadinessState = createDefaultReadinessState();
  if (typeof activeReadinessReset === 'function') {
    try {
      activeReadinessReset();
    } catch {
      // guard unmount
    }
  }
  notifyReadinessListeners();
  return getReadinessState();
}

// ============================================================================
// Printable & Copyable Plain-Text Summary Formatter
// ============================================================================

/**
 * Generates an evidence-based plain-text summary of readiness exploration,
 * suitable for printing or secure clipboard transfer.
 *
 * @param {Object} [state] Optional state override (defaults to current in-RAM state).
 * @returns {string} Plain-text report
 */
export function formatReadinessSummaryText(state = inMemoryReadinessState) {
  const safeState = state || inMemoryReadinessState;
  const answers = {
    ...(safeState.answers || {}),
    substance: safeState.substance || 'general',
    recentSlip: Boolean(safeState.recentSlip),
  };
  if (safeState.selfIdentifiedStage) {
    answers.stage = safeState.selfIdentifiedStage;
  }
  const result = calculateReadinessStage(answers);

  const lines = [
    '============================================================',
    'HARBORPATH STAGES OF CHANGE & READINESS EXPLORATION SUMMARY',
    'Transtheoretical Model (URICA-Inspired) & Harm Reduction Support',
    '============================================================',
    '',
    `Assessment Date / Time: ${safeState.timestamp ? new Date(safeState.timestamp).toISOString() : new Date().toISOString()}`,
    `Participant Role: ${safeState.assessorRole || 'individual'} (Self-Reflection)`,
    `Explored Substance: ${safeState.substance || 'general'}${safeState.customSubstance ? ` (${safeState.customSubstance})` : ''}`,
    '',
    '------------------------------------------------------------',
    '1. CURRENT STAGE OF CHANGE & COACHING INSIGHT',
    '------------------------------------------------------------',
    `Identified Stage: ${result.title.toUpperCase()}`,
    `Plain Language: ${result.plainLanguageTitle}`,
    `Overview: ${result.description}`,
    '',
    `Motivational Coaching Prompt:`,
    `"${result.motivationalCoachingPrompt}"`,
    '',
    `URICA Readiness Composite Score: ${result.readinessScore}`,
    'Subscale Profile (1-5 Scale):',
    `  - Precontemplation (Not Ready): ${result.subscaleScores.precontemplation} / 5.0`,
    `  - Contemplation (Ambivalence):  ${result.subscaleScores.contemplation} / 5.0`,
    `  - Preparation (Planning):      ${result.subscaleScores.preparation} / 5.0`,
    `  - Action (Making Changes):     ${result.subscaleScores.action} / 5.0`,
    `  - Maintenance (Sustaining):    ${result.subscaleScores.maintenance} / 5.0`,
    '',
    'Recommended Next Steps:',
    ...result.recommendedNextSteps.map((step, idx) => `  ${idx + 1}. ${step}`),
    '',
  ];

  // Decisional Balance Section
  const db = safeState.decisionalBalance || {};
  const hasLikes = (db.likes && db.likes.length > 0) || db.customLikes;
  const hasConcerns = (db.concerns && db.concerns.length > 0) || db.customConcerns;
  const hasPositives = (db.positives && db.positives.length > 0) || db.customPositives;
  const hasHurdles = (db.hurdles && db.hurdles.length > 0) || db.customHurdles;

  if (hasLikes || hasConcerns || hasPositives || hasHurdles) {
    lines.push(
      '------------------------------------------------------------',
      '2. DECISIONAL BALANCE MATRIX (PROS & CONS)',
      '------------------------------------------------------------',
      'What I Like About Using (Benefits / Relief):',
      ...(db.likes && db.likes.length > 0 ? db.likes.map((item) => `  * ${item}`) : ['  (None selected)']),
      ...(db.customLikes ? [`  * Notes: ${db.customLikes}`] : []),
      '',
      'What Is Difficult or Worrying (Costs & Risks):',
      ...(db.concerns && db.concerns.length > 0 ? db.concerns.map((item) => `  * ${item}`) : ['  (None selected)']),
      ...(db.customConcerns ? [`  * Notes: ${db.customConcerns}`] : []),
      '',
      'What Would Be Better If Things Changed (Values & Hopes):',
      ...(db.positives && db.positives.length > 0 ? db.positives.map((item) => `  * ${item}`) : ['  (None selected)']),
      ...(db.customPositives ? [`  * Notes: ${db.customPositives}`] : []),
      '',
      'What Feels Hard About Changing (Obstacles & Fears):',
      ...(db.hurdles && db.hurdles.length > 0 ? db.hurdles.map((item) => `  * ${item}`) : ['  (None selected)']),
      ...(db.customHurdles ? [`  * Notes: ${db.customHurdles}`] : []),
      '',
    );
  }

  // Personal / Supporter Notes
  if (safeState.notes || safeState.craftNotes) {
    lines.push(
      '------------------------------------------------------------',
      '3. PERSONAL NOTES & ALLY REFLECTIONS',
      '------------------------------------------------------------',
    );
    if (safeState.notes) {
      lines.push(`Participant Notes:\n${safeState.notes}\n`);
    }
    if (safeState.craftNotes) {
      lines.push(`CRAFT Ally Reflection:\n${safeState.craftNotes}\n`);
    }
  }

  // Clinical & Ethical Boundaries
  lines.push(
    '------------------------------------------------------------',
    '4. CLINICAL & ETHICAL NOTICE (SELF-REPORT ONLY)',
    '------------------------------------------------------------',
    'HarborPath Readiness Exploration is an educational, self-guided reflection',
    'tool based on the validated Transtheoretical Model of Change (Prochaska &',
    'DiClemente) and CRAFT principles. It is NOT a formal psychiatric diagnosis,',
    'clinical ASAM placement, or medical prescription. Substance use disorder',
    'is a treatable medical condition. Treatment choices are voluntary.',
    '',
    '------------------------------------------------------------',
    '5. IMMEDIATE 24/7 CONFIDENTIAL SUPPORT & CRISIS RESOURCES',
    '------------------------------------------------------------',
    '* 988 Suicide & Crisis Lifeline: Call or text 988 (English & Spanish, 24/7)',
    '* SAMHSA National Helpline: 1-800-662-4357 (Free, confidential treatment referral)',
    '* Never Use Alone: 1-800-484-3731 (Peer-run overdose prevention line while using)',
    '* The Trevor Project (LGBTQ+ Crisis): 1-866-488-7386 or text START to 678-678',
    '* Domestic Violence Helpline: 1-800-799-7233 (24/7 support & safety planning)',
    '============================================================',
  );

  return lines.join('\n');
}

// ============================================================================
// Interactive DOM View Implementation
// ============================================================================

/**
 * Builds the complete Stages of Change & Readiness Exploration view.
 * Fully ephemeral in RAM, WCAG 2.2 AA compliant, zero inline styles.
 *
 * @param {Object} [props]
 * @param {URLSearchParams} [props.query]
 * @returns {HTMLElement}
 */
export function readinessView({ query } = {}) {
  // If query specifies initial substance or stage, apply to ephemeral state
  if (query) {
    const qSubstance = query.get('substance');
    if (qSubstance) inMemoryReadinessState.substance = qSubstance;
    const qStage = query.get('stage');
    if (qStage && STAGES_OF_CHANGE[qStage]) inMemoryReadinessState.selfIdentifiedStage = qStage;
  }

  const root = h('div', { class: 'wrap view view-prose view-readiness' });

  // 1. Page Header
  const header = pageHeader(
    'Readiness & Stages of Change',
    'Explore where you are with alcohol, opioids, stimulants, or other substances without judgment or pressure. Weigh pros and cons, discover your stage of change, and find next steps that fit your personal goals.',
  );
  root.append(header);

  // 2. Privacy & Ephemeral In-RAM Banner
  const privacyCallout = h(
    'div',
    { class: 'callout callout-info' },
    h(
      'p',
      { class: 'callout-title' },
      icon('shield'),
      '100% Ephemeral In-RAM Privacy Guarantee',
    ),
    h(
      'p',
      null,
      'Your answers, pros/cons entries, and notes exist only in your browser’s temporary RAM. Nothing is saved to cookies, local storage, or server databases. Clicking "Clear Assessment" or "Quick Exit" instantly wipes all data.',
    ),
  );
  root.append(privacyCallout);

  // 3. Settings & Scope: Substance & Perspective
  const settingsCard = h('div', { class: 'card no-print' });
  const settingsTitle = h('h2', { class: 'card-title' }, '1. What are you exploring today?');
  settingsCard.append(settingsTitle);

  const substanceGrid = h('div', { class: 'choice-grid' });
  const SUBSTANCE_CHOICES = [
    { id: 'alcohol', label: 'Alcohol (Beer, wine, liquor)' },
    { id: 'opioids', label: 'Opioids (Fentanyl, heroin, oxycodone, pills)' },
    { id: 'stimulants', label: 'Stimulants (Methamphetamine, cocaine, crack)' },
    { id: 'cannabis', label: 'Cannabis / Marijuana' },
    { id: 'general', label: 'Multiple or Other Substances' },
  ];

  for (const sub of SUBSTANCE_CHOICES) {
    const radioId = `substance-opt-${sub.id}`;
    const radio = h('input', {
      type: 'radio',
      name: 'substance_choice',
      id: radioId,
      value: sub.id,
      checked: inMemoryReadinessState.substance === sub.id,
      onchange: () => {
        setReadinessState({ substance: sub.id, timestamp: Date.now() });
        updateLiveSummary();
      },
    });
    const label = h(
      'label',
      { class: 'choice', for: radioId },
      radio,
      h('div', { class: 'choice-text' }, h('span', { class: 'choice-label' }, sub.label)),
    );
    substanceGrid.append(label);
  }
  settingsCard.append(substanceGrid);

  // Perspective Choice (Individual vs Family/Ally vs Clinician)
  const roleGroup = h('div', { class: 'field' });
  const roleLabel = h('label', { for: 'readiness-role-select', class: 'choice-label' }, 'Who is filling this out?');
  const roleSelect = h(
    'select',
    {
      id: 'readiness-role-select',
      class: 'input',
      onchange: (e) => {
        setReadinessState({ assessorRole: e.target.value, timestamp: Date.now() });
        updateLiveSummary();
      },
    },
    h('option', { value: 'individual', selected: inMemoryReadinessState.assessorRole === 'individual' }, 'Exploring for myself (Self-Reflection)'),
    h('option', { value: 'loved_one', selected: inMemoryReadinessState.assessorRole === 'loved_one' }, 'A family member, partner, or friend (Ally Perspective)'),
    h('option', { value: 'counselor', selected: inMemoryReadinessState.assessorRole === 'counselor' }, 'A counselor, healthcare provider, or peer specialist'),
  );
  roleGroup.append(roleLabel, roleSelect);
  settingsCard.append(roleGroup);
  root.append(settingsCard);

  // 4. Live Clinical Summary Card (Print-Handout Ready)
  const summaryCard = h('div', { class: 'card asam-summary-card print-handout', 'aria-live': 'polite', id: 'readiness-summary' });
  const summaryHeader = h('h2', { class: 'card-title' }, 'Live Readiness & Stage Summary');
  const chipsWrap = h('div', { class: 'chips' });
  const stageBadge = h('span', { class: 'chip chip-primary badge-severity' }, 'Calculating...');
  const scoreBadge = h('span', { class: 'chip' }, 'Readiness Score: --');
  chipsWrap.append(stageBadge, scoreBadge);

  const stageDesc = h('p', { class: 'lede' }, '');
  const coachingCallout = h('div', { class: 'callout callout-info' });
  const coachingTitle = h('p', { class: 'callout-title' }, icon('message'), 'Motivational Coaching Insight');
  const coachingText = h('p', null, '');
  coachingCallout.append(coachingTitle, coachingText);

  const nextStepsHeading = h('h3', null, 'Recommended Next Steps');
  const nextStepsList = h('ul', { class: 'list' });

  // Recurrence / Slip Quick Action Callout
  const slipBox = h(
    'div',
    { class: 'callout callout-emergency no-print' },
    h('p', { class: 'callout-title' }, icon('alert'), 'Had a slip or return to use?'),
    h('p', null, 'A return to use is common and provides valuable learning. Lowered tolerance dramatically increases overdose risk — please stay safe.'),
    h(
      'button',
      {
        type: 'button',
        class: 'btn btn-secondary',
        onclick: () => {
          const isCurrentlySlip = inMemoryReadinessState.recentSlip;
          setReadinessState({ recentSlip: !isCurrentlySlip, timestamp: Date.now() });
          updateLiveSummary();
          announce(!isCurrentlySlip ? 'Recurrence mode activated' : 'Standard readiness mode activated');
        },
      },
      inMemoryReadinessState.recentSlip ? 'Exit Recurrence Mode' : 'View Recurrence & Overdose Safety Guidance',
    ),
  );

  summaryCard.append(summaryHeader, chipsWrap, stageDesc, coachingCallout, nextStepsHeading, nextStepsList, slipBox);
  root.append(summaryCard);

  // Update Function for Live Summary
  function updateLiveSummary() {
    const answers = {
      ...(inMemoryReadinessState.answers || {}),
      substance: inMemoryReadinessState.substance || 'general',
      recentSlip: Boolean(inMemoryReadinessState.recentSlip),
    };
    if (inMemoryReadinessState.selfIdentifiedStage) {
      answers.stage = inMemoryReadinessState.selfIdentifiedStage;
    }
    const result = calculateReadinessStage(answers);

    stageBadge.textContent = result.plainLanguageTitle;
    scoreBadge.textContent = `Readiness Score: ${result.readinessScore}`;
    stageDesc.textContent = result.description;
    coachingText.textContent = `"${result.motivationalCoachingPrompt}"`;

    clear(nextStepsList);
    for (const step of result.recommendedNextSteps) {
      nextStepsList.append(h('li', null, step));
    }
  }

  // 5. Validated URICA-Inspired 8 Statements Questionnaire
  const questionsSection = section(
    'readiness-questions',
    '2. Readiness Assessment (URICA-Inspired)',
    p(
      'Read each statement below and choose how much you agree with it right now. There are no right or wrong answers.',
    ),
  );

  const questionElements = [];

  for (let i = 0; i < READINESS_STATEMENTS.length; i++) {
    const stmt = READINESS_STATEMENTS[i];
    const fieldset = h('fieldset', { class: 'choice-group dimension-item' });
    const legend = h(
      'legend',
      null,
      h('span', { class: 'choice-label' }, `Statement ${i + 1}: ${stmt.statement}`),
    );
    fieldset.append(legend);

    const helpP = h('p', { class: 'help' }, stmt.prompt);
    fieldset.append(helpP);

    const optionsGrid = h('div', { class: 'choice-grid' });
    const inputs = [];

    for (const opt of stmt.options) {
      const radioId = `urica-${stmt.id}-opt-${opt.score}`;
      const isChecked = inMemoryReadinessState.answers[stmt.id] === opt.score;
      const radio = h('input', {
        type: 'radio',
        name: `urica_${stmt.id}`,
        id: radioId,
        value: opt.score,
        checked: isChecked,
        onchange: () => {
          const patchAnswers = { [stmt.id]: opt.score };
          setReadinessState({
            answers: patchAnswers,
            timestamp: Date.now(),
          });
          updateLiveSummary();
          announce(`Selected ${opt.label} for statement ${i + 1}`);
        },
      });
      inputs.push({ radio, score: opt.score });

      const label = h(
        'label',
        { class: 'choice', for: radioId },
        radio,
        h(
          'div',
          { class: 'choice-text' },
          h('span', { class: 'choice-label' }, `${opt.score} - ${opt.shortLabel}`),
        ),
      );
      optionsGrid.append(label);
    }

    fieldset.append(optionsGrid);
    questionsSection.append(fieldset);
    questionElements.push({ stmtId: stmt.id, inputs });
  }
  root.append(questionsSection);

  // 6. Decisional Balance Tool (Pros / Cons Matrix)
  const dbSection = section(
    'readiness-decisional-balance',
    '3. Decisional Balance Tool (Pros & Cons Matrix)',
    p(
      'Ambivalence is normal. Weighing what you like about using against what is difficult or worrying helps clarify your genuine personal priorities.',
    ),
  );

  const dbGrid = h('div', { class: 'hotline-grid' });
  const dbCheckboxes = [];

  const quadrants = [
    { key: 'likes', data: DECISIONAL_BALANCE_PROMPTS.likes },
    { key: 'concerns', data: DECISIONAL_BALANCE_PROMPTS.concerns },
    { key: 'positives', data: DECISIONAL_BALANCE_PROMPTS.positives },
    { key: 'hurdles', data: DECISIONAL_BALANCE_PROMPTS.hurdles },
  ];

  for (const quad of quadrants) {
    const card = h('div', { class: 'card' });
    card.append(h('h3', { class: 'card-title' }, quad.data.title));
    card.append(h('p', { class: 'help' }, quad.data.subtitle));

    const checkList = h('div', { class: 'field' });
    const currentList = inMemoryReadinessState.decisionalBalance[quad.key] || [];

    for (let j = 0; j < quad.data.examples.length; j++) {
      const exampleText = quad.data.examples[j];
      const checkId = `db-${quad.key}-${j}`;
      const isChecked = currentList.includes(exampleText);

      const checkbox = h('input', {
        type: 'checkbox',
        id: checkId,
        value: exampleText,
        checked: isChecked,
        onchange: (e) => {
          const active = inMemoryReadinessState.decisionalBalance[quad.key] || [];
          let updated;
          if (e.target.checked) {
            updated = Array.from(new Set([...active, exampleText]));
          } else {
            updated = active.filter((item) => item !== exampleText);
          }
          setReadinessState({
            decisionalBalance: { [quad.key]: updated },
            timestamp: Date.now(),
          });
          updateLiveSummary();
        },
      });
      dbCheckboxes.push({ key: quad.key, text: exampleText, checkbox });

      const checkLabel = h(
        'label',
        { class: 'choice', for: checkId },
        checkbox,
        h('div', { class: 'choice-text' }, h('span', { class: 'choice-label' }, exampleText)),
      );
      checkList.append(checkLabel);
    }
    card.append(checkList);

    // Custom notes textarea for this quadrant
    const customKey = `custom${quad.key.charAt(0).toUpperCase() + quad.key.slice(1)}`;
    const textLabel = h('label', { for: `db-custom-${quad.key}`, class: 'choice-desc' }, `Add your own thoughts for "${quad.data.title}":`);
    const textarea = h('textarea', {
      id: `db-custom-${quad.key}`,
      class: 'input',
      rows: 2,
      placeholder: 'Type personal notes here (held in RAM only)...',
      value: inMemoryReadinessState.decisionalBalance[customKey] || '',
      oninput: (e) => {
        setReadinessState({
          decisionalBalance: { [customKey]: e.target.value },
          timestamp: Date.now(),
        });
      },
    });
    card.append(textLabel, textarea);
    dbGrid.append(card);
  }
  dbSection.append(dbGrid);
  root.append(dbSection);

  // 7. CRAFT Guidance for Families & Allies
  const craftSection = section(
    'readiness-craft',
    '4. Guidance for Families & Loved Ones (CRAFT Principles)',
    p(
      'If you love someone navigating drug or alcohol use, Community Reinforcement and Family Training (CRAFT) offers science-backed ways to support them while protecting your own well-being.',
    ),
  );

  const craftGrid = h('div', { class: 'hotline-grid' });
  for (const strat of CRAFT_GUIDANCE.strategies) {
    const card = h('div', { class: 'card' });
    card.append(h('h3', { class: 'card-title' }, strat.title));
    card.append(h('p', { class: 'lede' }, strat.summary));

    const practiceList = h('ul', { class: 'list' });
    for (const pText of strat.practices) {
      practiceList.append(h('li', null, pText));
    }
    card.append(practiceList);
    craftGrid.append(card);
  }
  craftSection.append(craftGrid);

  // Supporter Notes Field
  const craftNotesField = h('div', { class: 'field' });
  const craftNotesLabel = h('label', { for: 'craft-ally-notes', class: 'choice-label' }, 'Ally & Supporter Reflection Notes:');
  const craftNotesTextarea = h('textarea', {
    id: 'craft-ally-notes',
    class: 'input',
    rows: 3,
    placeholder: 'Record boundaries you wish to set or positive moments you noticed (held in RAM only)...',
    value: inMemoryReadinessState.craftNotes || '',
    oninput: (e) => {
      setReadinessState({ craftNotes: e.target.value, timestamp: Date.now() });
    },
  });
  craftNotesField.append(craftNotesLabel, craftNotesTextarea);
  craftSection.append(craftNotesField);
  root.append(craftSection);

  // 8. General Notes Section
  const notesField = h('div', { class: 'field no-print' });
  const notesLabel = h('label', { for: 'readiness-personal-notes', class: 'choice-label' }, 'General Personal Notes & Goals (Held in RAM only):');
  const notesTextarea = h('textarea', {
    id: 'readiness-personal-notes',
    class: 'input',
    rows: 3,
    placeholder: 'Write any personal insights, questions for your doctor, or goals here...',
    value: inMemoryReadinessState.notes || '',
    oninput: (e) => {
      setReadinessState({ notes: e.target.value, timestamp: Date.now() });
    },
  });
  notesField.append(notesLabel, notesTextarea);
  root.append(notesField);

  // 9. Actions Bar (Print, Copy, Reset & Navigation)
  const actionsBar = h('div', { class: 'actions assessment-actions no-print' });

  const copyBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-primary',
      onclick: () => {
        const text = formatReadinessSummaryText();
        if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(text).catch(() => {});
        }
        announce('Readiness summary report copied to clipboard');
        copyBtn.textContent = '✓ Report Copied!';
        setTimeout(() => {
          clear(copyBtn);
          copyBtn.append(icon('clipboard'), ' Copy Readiness Summary');
        }, 3000);
      },
    },
    icon('clipboard'),
    ' Copy Readiness Summary',
  );

  const printBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-secondary',
      onclick: () => {
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
          window.print();
        }
      },
    },
    icon('printer'),
    ' Print Handout',
  );

  const resetBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-ghost',
      onclick: () => {
        resetReadinessState();
        announce('All readiness answers and notes have been cleared from memory');
      },
    },
    icon('x'),
    ' Clear All Answers (RAM Wipe)',
  );

  const navTreatmentBtn = h(
    'a',
    { class: 'btn btn-secondary', href: '#/treatment' },
    icon('search'),
    ' Find Treatment Options',
  );

  const navHarmReductionBtn = h(
    'a',
    { class: 'btn btn-secondary', href: '#/harm-reduction' },
    icon('heart'),
    ' Harm Reduction & Supplies',
  );

  actionsBar.append(copyBtn, printBtn, resetBtn, navTreatmentBtn, navHarmReductionBtn);
  root.append(actionsBar);

  // 10. Emergency Callout
  root.append(emergencyCallout());

  // Register DOM reset hook for clean in-RAM wipes
  registerReadinessResetHook(() => {
    // Uncheck question radios
    for (const q of questionElements) {
      for (const opt of q.inputs) {
        opt.radio.checked = false;
      }
    }
    // Uncheck decisional balance checkboxes
    for (const cb of dbCheckboxes) {
      cb.checkbox.checked = false;
    }
    // Clear textareas
    notesTextarea.value = '';
    craftNotesTextarea.value = '';
    const customTextareas = root.querySelectorAll('textarea');
    for (const ta of customTextareas) {
      ta.value = '';
    }
    // Reset role select
    roleSelect.value = 'individual';
    // Update live summary
    updateLiveSummary();
  });

  // Initial Summary Render
  updateLiveSummary();

  return root;
}
