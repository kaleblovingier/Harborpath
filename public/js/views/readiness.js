import { h, clear, ext, tel, icon, announce, copyText } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, emergencyCallout } from './common.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetReadinessState);

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
    get name() { return t('readiness.stage.precontemplation.name', 'Precontemplation'); },
    get title() { return t('readiness.stage.precontemplation.title', 'Precontemplation (Not Ready / Exploring)'); },
    get plainLanguageTitle() { return t('readiness.stage.precontemplation.plainTitle', 'Not thinking about changing right now'); },
    get tagline() { return t('readiness.stage.precontemplation.tagline', 'Not currently considering a change in substance use'); },
    get description() { return t('readiness.stage.precontemplation.desc', 'You feel content with how things are right now, or you feel exhausted by other people telling you what to do. You may not view drug or alcohol use as a problem, or past attempts may have left you feeling that change is too difficult or discouraging.'); },
    get clinicalGoal() { return t('readiness.stage.precontemplation.goal', 'Empathy, harm reduction, overdose prevention, and establishing an open, non-judgmental alliance without pressure.'); },
    get motivationalCoachingPrompt() { return t('readiness.stage.precontemplation.prompt', 'What is most important to you in your life right now? What keeps you safe? You are the expert on your own life, and no one can force you to change anything.'); },
    get coachingPrompt() { return this.motivationalCoachingPrompt; },
    get recommendedNextSteps() {
      return [
        t('readiness.stage.precontemplation.step1', 'Keep harm reduction supplies nearby (fentanyl and xylazine test strips, sterile supplies).'),
        t('readiness.stage.precontemplation.step2', 'Obtain and carry naloxone (Narcan) — let friends know where it is in case of an emergency.'),
        t('readiness.stage.precontemplation.step3', 'Never use alone: Call the Never Use Alone line (800-484-3731) or use the Brave App.'),
        t('readiness.stage.precontemplation.step4', 'Connect with a peer support specialist who has lived experience with zero pressure to stop.'),
        t('readiness.stage.precontemplation.step5', 'Access low-barrier medical care (hepatitis C and HIV testing, wound care, basic wellness).'),
      ];
    },
  },
  {
    id: 'contemplation',
    get name() { return t('readiness.stage.contemplation.name', 'Contemplation'); },
    get title() { return t('readiness.stage.contemplation.title', 'Contemplation (Ambivalent / Weighing Options)'); },
    get plainLanguageTitle() { return t('readiness.stage.contemplation.plainTitle', 'Thinking about change, but weighing pros and cons'); },
    get tagline() { return t('readiness.stage.contemplation.tagline', 'Torn between the benefits of use and the costs or risks'); },
    get description() { return t('readiness.stage.contemplation.desc', 'You are aware that substance use has downsides, expenses, or risks, but you also experience genuine benefits, emotional relief, or social connection from using. You are weighing whether making a change is worth the discomfort and effort.'); },
    get clinicalGoal() { return t('readiness.stage.contemplation.goal', 'Explore ambivalence, conduct decisional balance, examine core values, and build hope without forcing commitment.'); },
    get motivationalCoachingPrompt() { return t('readiness.stage.contemplation.prompt', 'What are the good things about using, and what are the less good things? If you woke up tomorrow and things were 10% better or easier, what would be different?'); },
    get coachingPrompt() { return this.motivationalCoachingPrompt; },
    get recommendedNextSteps() {
      return [
        t('readiness.stage.contemplation.step1', 'Use the interactive Decisional Balance matrix below to clearly map pros and cons.'),
        t('readiness.stage.contemplation.step2', 'Learn about medications for addiction treatment (MOUD/MAUD) that reduce cravings without requiring immediate abstinence.'),
        t('readiness.stage.contemplation.step3', 'Talk confidentially with a non-judgmental addiction counselor or peer navigator.'),
        t('readiness.stage.contemplation.step4', 'Try small, low-risk harm reduction experiments (e.g. tracking amounts, taking pacing breaks).'),
        t('readiness.stage.contemplation.step5', 'Read stories of how people with similar experiences resolved their ambivalence.'),
      ];
    },
  },
  {
    id: 'preparation',
    get name() { return t('readiness.stage.preparation.name', 'Preparation'); },
    get title() { return t('readiness.stage.preparation.title', 'Preparation (Planning / Getting Ready)'); },
    get plainLanguageTitle() { return t('readiness.stage.preparation.plainTitle', 'Ready to take steps soon and planning how'); },
    get tagline() { return t('readiness.stage.preparation.tagline', 'Decided to make changes and preparing concrete steps'); },
    get description() { return t('readiness.stage.preparation.desc', 'You have decided that making a change is important to you and are ready to take action in the immediate future (typically within the next 30 days). You are gathering information, exploring options, and setting up support systems.'); },
    get clinicalGoal() { return t('readiness.stage.preparation.goal', 'Co-design an individualized change plan, identify personal triggers, choose treatment modalities, and prepare support systems.'); },
    get motivationalCoachingPrompt() { return t('readiness.stage.preparation.prompt', 'What is one small, concrete step you feel ready to try this week? What resources or people would make that step easier?'); },
    get coachingPrompt() { return this.motivationalCoachingPrompt; },
    get recommendedNextSteps() {
      return [
        t('readiness.stage.preparation.step1', 'Schedule a medical evaluation for FDA-approved medications (buprenorfina, methadone, naltrexone, acamprosate).'),
        t('readiness.stage.preparation.step2', 'Complete a personalized safety and coping plan for cravings and stressful moments.'),
        t('readiness.stage.preparation.step3', 'Identify 1–2 trusted people (friends, family, mentors) who support your goals without judgment.'),
        t('readiness.stage.preparation.step4', 'Look into treatment formats that fit your schedule: outpatient clinic, intensive outpatient (IOP), telehealth, or residential.'),
        t('readiness.stage.preparation.step5', 'Prepare your living space by removing triggers and setting boundaries with people who use.'),
      ];
    },
  },
  {
    id: 'action',
    get name() { return t('readiness.stage.action.name', 'Action'); },
    get title() { return t('readiness.stage.action.title', 'Action (Actively Changing)'); },
    get plainLanguageTitle() { return t('readiness.stage.action.plainTitle', 'Actively making changes right now'); },
    get tagline() { return t('readiness.stage.action.tagline', 'Putting time and energy into changing behavior and routines'); },
    get description() { return t('readiness.stage.action.desc', 'You are actively implementing changes in your substance use patterns, routines, or environment (within the past 6 months). You are learning new coping habits, managing cravings, and navigating daily life with different tools.'); },
    get clinicalGoal() { return t('readiness.stage.action.goal', 'Reinforce self-efficacy, manage acute cravings and withdrawal, modify environments, and build relapse prevention skills.'); },
    get motivationalCoachingPrompt() { return t('readiness.stage.action.prompt', 'What strategies have worked best for you so far? When a strong craving hits, what is your go-to move to ride it out?'); },
    get coachingPrompt() { return this.motivationalCoachingPrompt; },
    get recommendedNextSteps() {
      return [
        t('readiness.stage.action.step1', 'Maintain consistent adherence to prescribed medications (MOUD/MAUD).'),
        t('readiness.stage.action.step2', 'Engage with mutual aid groups (SMART Recovery, 12-Step, LifeRing, Harm Reduction Works).'),
        t('readiness.stage.action.step3', 'Practice urge surfing: observe cravings as waves that peak at 15–20 minutes and naturally subside.'),
        t('readiness.stage.action.step4', 'Develop alternative dopamine sources: movement, creative arts, nature, good nutrition, and restful sleep.'),
        t('readiness.stage.action.step5', 'Keep in regular contact with your counselor, therapist, or peer specialist.'),
      ];
    },
  },
  {
    id: 'maintenance',
    get name() { return t('readiness.stage.maintenance.name', 'Maintenance'); },
    get title() { return t('readiness.stage.maintenance.title', 'Maintenance (Sustaining Recovery / Growth)'); },
    get plainLanguageTitle() { return t('readiness.stage.maintenance.plainTitle', 'Sustaining changes long-term and preventing slips'); },
    get tagline() { return t('readiness.stage.maintenance.tagline', 'Maintaining positive changes for 6 months or longer'); },
    get description() { return t('readiness.stage.maintenance.desc', 'You have maintained your desired changes for 6 months or longer. Your focus has expanded from avoiding return to use to building a fulfilling, balanced, and sustainable life with deeper relationships and personal growth.'); },
    get clinicalGoal() { return t('readiness.stage.maintenance.goal', 'Consolidate recovery identity, maintain lifestyle balance, monitor subtle warning signs, and foster ongoing personal fulfillment.'); },
    get motivationalCoachingPrompt() { return t('readiness.stage.maintenance.prompt', 'How has your life expanded since you made these changes? What daily rituals keep you grounded when life gets stressful?'); },
    get coachingPrompt() { return this.motivationalCoachingPrompt; },
    get recommendedNextSteps() {
      return [
        t('readiness.stage.maintenance.step1', 'Continue regular healthcare and medication check-ins without abrupt discontinuation.'),
        t('readiness.stage.maintenance.step2', 'Stay connected to your community or mutual aid network, perhaps exploring mentorship or service.'),
        t('readiness.stage.maintenance.step3', 'Periodically refresh your early warning sign checklist (isolation, sleep changes, resentment, exhaustion).'),
        t('readiness.stage.maintenance.step4', 'Celebrate your milestones, resilience, and personal growth with people who love you.'),
        t('readiness.stage.maintenance.step5', 'Invest in long-term goals: education, career, relationships, creative pursuits, and physical health.'),
      ];
    },
  },
  {
    id: 'recurrence',
    get name() { return t('readiness.stage.recurrence.name', 'Recurrence / Slip Support'); },
    get title() { return t('readiness.stage.recurrence.title', 'Recurrence / Slip Support (Learning & Re-engaging)'); },
    get plainLanguageTitle() { return t('readiness.stage.recurrence.plainTitle', 'Had a slip or return to use — restarting with compassion'); },
    get tagline() { return t('readiness.stage.recurrence.tagline', 'A return to use is a clinical event and learning opportunity, not a failure'); },
    get description() { return t('readiness.stage.recurrence.desc', 'A lapse, slip, or return to use is a clinical event and a very common part of managing chronic health conditions. It does not erase your past progress, hard work, or recovery time. It provides crucial clues about unmet needs, new stressors, or gaps in support.'); },
    get clinicalGoal() { return t('readiness.stage.recurrence.goal', 'Immediate harm reduction and overdose prevention (addressing lowered tolerance), shame reduction, rapid re-entry into care, and trigger analysis.'); },
    get motivationalCoachingPrompt() { return t('readiness.stage.recurrence.prompt', 'You deserve safety, care, and compassion right now. What were you feeling right before the slip, and what can this experience teach us about what you need?'); },
    get coachingPrompt() { return this.motivationalCoachingPrompt; },
    get recommendedNextSteps() {
      return [
        t('readiness.stage.recurrence.step1', 'CRITICAL OVERDOSE WARNING: Lowered tolerance dramatically increases fatal overdose risk. Take much smaller test amounts and never use alone.'),
        t('readiness.stage.recurrence.step2', 'Ensure you have fresh naloxone (Narcan) immediately on hand. Have someone with you or call Never Use Alone (800-484-3731).'),
        t('readiness.stage.recurrence.step3', 'Reach out immediately to your prescriber, counselor, or trusted supporter — do not isolate or hide.'),
        t('readiness.stage.recurrence.step4', 'Practice self-compassion: Remind yourself that every single day of change in your past still counts and lives in your brain.'),
        t('readiness.stage.recurrence.step5', 'Conduct a gentle review of the event: What was the trigger? What was the unmet need? How can your safety plan adjust?'),
      ];
    },
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
  { score: 1, get label() { return t('readiness.likert.1', 'Strongly disagree'); }, get shortLabel() { return t('readiness.likert.1.short', 'Strongly disagree'); } },
  { score: 2, get label() { return t('readiness.likert.2', 'Disagree'); }, get shortLabel() { return t('readiness.likert.2.short', 'Disagree'); } },
  { score: 3, get label() { return t('readiness.likert.3', 'Neutral / Undecided'); }, get shortLabel() { return t('readiness.likert.3.short', 'Neutral'); } },
  { score: 4, get label() { return t('readiness.likert.4', 'Agree'); }, get shortLabel() { return t('readiness.likert.4.short', 'Agree'); } },
  { score: 5, get label() { return t('readiness.likert.5', 'Strongly agree'); }, get shortLabel() { return t('readiness.likert.5.short', 'Strongly agree'); } },
];

/**
 * Validated URICA-inspired 8 statements evaluating readiness to make
 * a change regarding alcohol, opioids, stimulants, or other substances.
 */
const STATEMENTS_LIST = [
  {
    id: 's1',
    stage: 'precontemplation',
    get category() { return t('readiness.statement.s1.category', 'Precontemplation'); },
    get statement() { return t('readiness.statement.s1.text', 'As far as I am concerned, my alcohol or drug use is not really a problem that needs changing.'); },
    get prompt() { return t('readiness.statement.prompt', 'How much does this describe you right now?'); },
    options: LIKERT_OPTIONS,
  },
  {
    id: 's2',
    stage: 'precontemplation',
    get category() { return t('readiness.statement.s2.category', 'Precontemplation'); },
    get statement() { return t('readiness.statement.s2.text', 'Other people worry about my drug or alcohol use, but I think they exaggerate or make too big a deal out of it.'); },
    get prompt() { return t('readiness.statement.prompt', 'How much does this describe you right now?'); },
    options: LIKERT_OPTIONS,
  },
  {
    id: 's3',
    stage: 'contemplation',
    get category() { return t('readiness.statement.s3.category', 'Contemplation'); },
    get statement() { return t('readiness.statement.s3.text', 'I have been thinking that my substance use might be causing some difficulties, and I wonder if I should make a change.'); },
    get prompt() { return t('readiness.statement.prompt', 'How much does this describe you right now?'); },
    options: LIKERT_OPTIONS,
  },
  {
    id: 's4',
    stage: 'contemplation',
    get category() { return t('readiness.statement.s4.category', 'Contemplation'); },
    get statement() { return t('readiness.statement.s4.text', 'Part of me relies on or enjoys using, but another part of me worries about the health, relationship, or financial consequences.'); },
    get prompt() { return t('readiness.statement.prompt', 'How much does this describe you right now?'); },
    options: LIKERT_OPTIONS,
  },
  {
    id: 's5',
    stage: 'preparation',
    get category() { return t('readiness.statement.s5.category', 'Preparation'); },
    get statement() { return t('readiness.statement.s5.text', 'I have decided that I want to change how I use substances, and I am preparing to take concrete steps in the next 30 days.'); },
    get prompt() { return t('readiness.statement.prompt', 'How much does this describe you right now?'); },
    options: LIKERT_OPTIONS,
  },
  {
    id: 's6',
    stage: 'preparation',
    get category() { return t('readiness.statement.s6.category', 'Preparation'); },
    get statement() { return t('readiness.statement.s6.text', 'I am actively looking into treatment options, harm reduction strategies, or support networks to help me make changes.'); },
    get prompt() { return t('readiness.statement.prompt', 'How much does this describe you right now?'); },
    options: LIKERT_OPTIONS,
  },
  {
    id: 's7',
    stage: 'action',
    get category() { return t('readiness.statement.s7.category', 'Action'); },
    get statement() { return t('readiness.statement.s7.text', 'I am actively putting time and effort into cutting down, stopping, or changing my routines right now.'); },
    get prompt() { return t('readiness.statement.prompt', 'How much does this describe you right now?'); },
    options: LIKERT_OPTIONS,
  },
  {
    id: 's8',
    stage: 'maintenance',
    get category() { return t('readiness.statement.s8.category', 'Maintenance'); },
    get statement() { return t('readiness.statement.s8.text', 'I have already made positive changes in my substance use and my primary focus is keeping them going and preventing a slip.'); },
    get prompt() { return t('readiness.statement.prompt', 'How much does this describe you right now?'); },
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
    get title() { return t('readiness.db.likes.title', 'What I like about using'); },
    get subtitle() { return t('readiness.db.likes.sub', 'Benefits, relief, and reasons to continue using as you do now'); },
    get examples() {
      return [
        t('readiness.db.likes.ex1', 'Relief from anxiety, stress, or intense emotional pain'),
        t('readiness.db.likes.ex2', 'Helps manage physical pain, fatigue, or chronic discomfort'),
        t('readiness.db.likes.ex3', 'Social connection and feeling bonded with friends who use'),
        t('readiness.db.likes.ex4', 'Numbing painful memories, grief, or traumatic experiences'),
        t('readiness.db.likes.ex5', 'Helps me unwind, relax, or sleep at night'),
        t('readiness.db.likes.ex6', 'Gives an immediate boost of energy, confidence, or focus'),
      ];
    },
  },
  concerns: {
    id: 'concerns',
    get title() { return t('readiness.db.concerns.title', 'What is difficult or worrying'); },
    get subtitle() { return t('readiness.db.concerns.sub', 'Costs, downsides, health risks, and stress caused by continuing'); },
    get examples() {
      return [
        t('readiness.db.concerns.ex1', 'Financial costs draining savings or creating debt'),
        t('readiness.db.concerns.ex2', 'Conflict, tension, or broken trust with partner, children, or family'),
        t('readiness.db.concerns.ex3', 'Fear of accidental overdose, poisoning, or dangerous cuts (fentanyl, xylazine)'),
        t('readiness.db.concerns.ex4', 'Physical withdrawal sickness, severe hangovers, or feeling trapped'),
        t('readiness.db.concerns.ex5', 'Struggling at work, school, or missing important life goals'),
        t('readiness.db.concerns.ex6', 'Feeling like the substance has taken over my daily choices'),
      ];
    },
  },
  positives: {
    id: 'positives',
    get title() { return t('readiness.db.positives.title', 'What would be better if things changed'); },
    get subtitle() { return t('readiness.db.positives.sub', 'Hopes, personal values, and benefits of making a change'); },
    get examples() {
      return [
        t('readiness.db.positives.ex1', 'Better physical energy, clearer thinking, and overall health'),
        t('readiness.db.positives.ex2', 'Saving money for things that truly matter to me and my family'),
        t('readiness.db.positives.ex3', 'Rebuilding trust, honesty, and emotional connection with loved ones'),
        t('readiness.db.positives.ex4', 'Freedom from the daily panic of cravings and withdrawal sickness'),
        t('readiness.db.positives.ex5', 'Clearer thinking, emotional stability, and true peace of mind'),
        t('readiness.db.positives.ex6', 'Lower risk of legal problems, medical emergencies, or hospital visits'),
      ];
    },
  },
  hurdles: {
    id: 'hurdles',
    get title() { return t('readiness.db.hurdles.title', 'What feels hard about changing'); },
    get subtitle() { return t('readiness.db.hurdles.sub', 'Fears, barriers, losses, and challenges of making a change'); },
    get examples() {
      return [
        t('readiness.db.hurdles.ex1', 'Wondering how I will survive intense stress or anxiety without substances'),
        t('readiness.db.hurdles.ex2', 'Fear of physical withdrawal symptoms or feeling terribly sick'),
        t('readiness.db.hurdles.ex3', 'Losing friends or feeling isolated from social circles that use'),
        t('readiness.db.hurdles.ex4', 'Fear that I will try and not succeed (fear of failing)'),
        t('readiness.db.hurdles.ex5', 'Cravings feeling so overpowering that I cannot resist them'),
        t('readiness.db.hurdles.ex6', 'Having to feel difficult emotions or memories I have been avoiding'),
      ];
    },
  },
};

// ============================================================================
// CRAFT Guidance Taxonomy (Community Reinforcement and Family Training)
// ============================================================================

export const CRAFT_GUIDANCE = {
  get title() { return t('readiness.craft.title', 'CRAFT: Guidance for Families, Loved Ones & Allies'); },
  get subtitle() { return t('readiness.craft.sub', 'Community Reinforcement and Family Training — Evidence-based strategies for concerned significant others'); },
  get strategies() {
    return [
      {
        id: 'positive_communication',
        get title() { return t('readiness.craft.pos_comm.title', 'Positive Communication Strategies'); },
        get summary() { return t('readiness.craft.pos_comm.summary', 'Replace accusations and lecturing with clear, positive, and loving "I" statements.'); },
        get practices() {
          return [
            t('readiness.craft.pos_comm.p1', 'Use "I" statements to share feelings instead of blame (e.g. "I love you and feel worried when I see you hurting" instead of "You are reckless and ruining our lives").'),
            t('readiness.craft.pos_comm.p2', 'Time your conversations carefully: Never attempt serious discussions when your loved one is high, drunk, or in acute withdrawal. Wait for sober, calm moments.'),
            t('readiness.craft.pos_comm.p3', 'Keep statements brief and focused on one specific topic rather than bringing up months of past arguments.'),
            t('readiness.craft.pos_comm.p4', 'Actively praise and reinforce sober moments: Notice when they take a healthy step, share a kind conversation, or engage in a sober hobby.'),
          ];
        },
      },
      {
        id: 'non_punitive_boundaries',
        get title() { return t('readiness.craft.non_punitive.title', 'Non-Punitive Boundaries & Natural Consequences'); },
        get summary() { return t('readiness.craft.non_punitive.summary', 'Step back from shielding without hostility or punishment, allowing natural consequences to occur.'); },
        get practices() {
          return [
            t('readiness.craft.non_punitive.p1', 'Stop enabling or shielding: Do not call in sick for them, pay off debts or legal fines, or clean up messes caused by use.'),
            t('readiness.craft.non_punitive.p2', 'Set clear, consistent limits with love: "I care about you too much to give cash, but I will gladly drive you to a doctor, buy groceries, or sit with you."'),
            t('readiness.craft.non_punitive.p3', 'Disengage calmly when using starts: Do not argue or plead while substances are active. Calmly state: "I love you, but I cannot be around substance use right now. I am going for a walk."'),
            t('readiness.craft.non_punitive.p4', 'Never make empty threats: Only state consequences you are prepared and willing to follow through on.'),
          ];
        },
      },
      {
        id: 'self_care_allies',
        get title() { return t('readiness.craft.self_care.title', 'Self-Care & Safety for Supporters'); },
        get summary() { return t('readiness.craft.self_care.summary', 'Reclaim your own mental health and safety regardless of your loved one’s choices.'); },
        get practices() {
          return [
            t('readiness.craft.self_care.p1', 'Remember that your life has independent value: Your joy, sleep, and well-being cannot depend completely on someone else’s sobriety.'),
            t('readiness.craft.self_care.p2', 'Reconnect with your own life: Re-engage with friends, hobbies, exercise, and personal therapy.'),
            t('readiness.craft.self_care.p3', 'Join family support groups: Al-Anon, Nar-Anon, SMART Recovery for Friends & Family, or local CRAFT groups.'),
            t('readiness.craft.self_care.p4', 'Safety first: If violence, weapons, or physical threats occur, prioritize immediate safety, call 911 or the Domestic Violence Helpline (800-799-7233).'),
          ];
        },
      },
    ];
  },
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
  const isEs = getLang() === 'es';
  const answers = {
    ...(safeState.answers || {}),
    substance: safeState.substance || 'general',
    recentSlip: Boolean(safeState.recentSlip),
  };
  if (safeState.selfIdentifiedStage) {
    answers.stage = safeState.selfIdentifiedStage;
  }
  const result = calculateReadinessStage(answers);

  if (isEs) {
    const roleMap = {
      individual: 'Autorreflexión personal',
      loved_one: 'Perspectiva de familiar / aliado',
      counselor: 'Consejería / Profesional de salud',
    };
    const subMap = {
      alcohol: 'Alcohol (Cerveza, vino, licor)',
      opioids: 'Opioides (Fentanilo, heroína, pastillas)',
      stimulants: 'Estimulantes (Metanfetamina, cocaína)',
      cannabis: 'Cannabis / Marihuana',
      general: 'Múltiples u otras sustancias',
    };
    const substanceLabel = subMap[safeState.substance] || safeState.substance || 'General';

    const lines = [
      '============================================================',
      'HARBORPATH: RESUMEN DE PREPARACIÓN Y ETAPAS DEL CAMBIO',
      'Modelo Transteórico (Inspirado en URICA) y Reducción de Daños',
      '============================================================',
      '',
      `Fecha y hora de evaluación: ${safeState.timestamp ? new Date(safeState.timestamp).toISOString() : new Date().toISOString()}`,
      `Rol del participante: ${roleMap[safeState.assessorRole] || safeState.assessorRole || 'Autorreflexión'}`,
      `Sustancia explorada: ${substanceLabel}${safeState.customSubstance ? ` (${safeState.customSubstance})` : ''}`,
      '',
      '------------------------------------------------------------',
      '1. ETAPA ACTUAL DEL CAMBIO Y PERSPECTIVA DE MOTIVACIÓN',
      '------------------------------------------------------------',
      `Etapa identificada: ${result.title.toUpperCase()}`,
      `Lenguaje claro: ${result.plainLanguageTitle}`,
      `Descripción general: ${result.description}`,
      '',
      'Pregunta de reflexión motivacional:',
      `"${result.motivationalCoachingPrompt}"`,
      '',
      `Puntuación compuesta de preparación URICA: ${result.readinessScore}`,
      'Perfil de subescalas (Escala 1 a 5):',
      `  - Precontemplación (No listo/a): ${result.subscaleScores.precontemplation} / 5.0`,
      `  - Contemplación (Ambivalencia):   ${result.subscaleScores.contemplation} / 5.0`,
      `  - Preparación (Planificando):     ${result.subscaleScores.preparation} / 5.0`,
      `  - Acción (Haciendo cambios):      ${result.subscaleScores.action} / 5.0`,
      `  - Mantenimiento (Sosteniendo):    ${result.subscaleScores.maintenance} / 5.0`,
      '',
      'Próximos pasos recomendados:',
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
        '2. BALANCE DECISIONAL (MATRIZ DE PROS Y CONTRAS)',
        '------------------------------------------------------------',
        'Lo que me gusta de consumir (Beneficios / Alivio):',
        ...(db.likes && db.likes.length > 0 ? db.likes.map((item) => `  * ${item}`) : ['  (Ninguno seleccionado)']),
        ...(db.customLikes ? [`  * Notas: ${db.customLikes}`] : []),
        '',
        'Lo que es difícil o preocupante (Costos y riesgos):',
        ...(db.concerns && db.concerns.length > 0 ? db.concerns.map((item) => `  * ${item}`) : ['  (Ninguno seleccionado)']),
        ...(db.customConcerns ? [`  * Notas: ${db.customConcerns}`] : []),
        '',
        'Lo que mejoraría si las cosas cambiaran (Valores y esperanzas):',
        ...(db.positives && db.positives.length > 0 ? db.positives.map((item) => `  * ${item}`) : ['  (Ninguno seleccionado)']),
        ...(db.customPositives ? [`  * Notas: ${db.customPositives}`] : []),
        '',
        'Lo que se siente difícil de cambiar (Obstáculos y miedos):',
        ...(db.hurdles && db.hurdles.length > 0 ? db.hurdles.map((item) => `  * ${item}`) : ['  (Ninguno seleccionado)']),
        ...(db.customHurdles ? [`  * Notas: ${db.customHurdles}`] : []),
        '',
      );
    }

    if (safeState.notes || safeState.craftNotes) {
      lines.push(
        '------------------------------------------------------------',
        '3. NOTAS PERSONALES Y REFLEXIONES DEL ALIADO/A',
        '------------------------------------------------------------',
      );
      if (safeState.notes) {
        lines.push(`Notas del participante:\n${safeState.notes}\n`);
      }
      if (safeState.craftNotes) {
        lines.push(`Reflexión CRAFT del aliado/a:\n${safeState.craftNotes}\n`);
      }
    }

    lines.push(
      '------------------------------------------------------------',
      '4. AVISO CLÍNICO Y ÉTICO (SOLO AUTORREPORTE)',
      '------------------------------------------------------------',
      'La exploración de preparación de HarborPath es una herramienta educativa y de autorreflexión',
      'guiada basada en el Modelo Transteórico del Cambio validado (Prochaska y DiClemente) y principios CRAFT.',
      'NO constituye un diagnóstico psiquiátrico formal, ubicación clínica de ASAM ni prescripción médica.',
      'El trastorno por consumo de sustancias es una condición médica tratable. Las decisiones de tratamiento son voluntarias.',
      '',
      '------------------------------------------------------------',
      '5. LÍNEAS DE CRISIS Y APOYO CONFIDENCIAL 24/7 INMEDIATO',
      '------------------------------------------------------------',
      '* Línea de Prevención del Suicidio y Crisis 988: Llame o envíe texto al 988 (inglés y español, 24/7)',
      '* Línea Nacional de Ayuda de SAMHSA: 1-800-662-4357 (Derivación a tratamiento gratuita y confidencial)',
      '* Never Use Alone: 1-800-484-3731 (Línea de prevención de sobredosis operada por pares mientras consume)',
      '* The Trevor Project (Crisis LGBTQ+): 1-866-488-7386 o envíe texto START al 678-678',
      '* Línea de Ayuda contra la Violencia Doméstica: 1-800-799-7233 (Apoyo 24/7 y plan de seguridad)',
      '============================================================',
    );

    return lines.join('\n');
  }

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
    t('readiness.header.title', 'Readiness & Stages of Change'),
    t('readiness.header.lede', 'Explore where you are with alcohol, opioids, stimulants, or other substances without judgment or pressure. Weigh pros and cons, discover your stage of change, and find next steps that fit your personal goals.'),
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
      t('readiness.privacy.title', '100% Ephemeral In-RAM Privacy Guarantee'),
    ),
    h(
      'p',
      null,
      t('readiness.privacy.body', 'Your answers, pros/cons entries, and notes exist only in your browser’s temporary RAM. Nothing is saved to cookies, local storage, or server databases. Clicking "Clear Assessment" or "Quick Exit" instantly wipes all data.'),
    ),
  );
  root.append(privacyCallout);

  // 3. Settings & Scope: Substance & Perspective
  const settingsCard = h('div', { class: 'card no-print' });
  const settingsTitle = h('h2', { class: 'card-title' }, t('readiness.settings.title', '1. What are you exploring today?'));
  settingsCard.append(settingsTitle);

  const substanceGrid = h('div', { class: 'choice-grid' });
  const SUBSTANCE_CHOICES = [
    { id: 'alcohol', label: t('readiness.substance.alcohol', 'Alcohol (Beer, wine, liquor)') },
    { id: 'opioids', label: t('readiness.substance.opioids', 'Opioids (Fentanyl, heroin, oxycodone, pills)') },
    { id: 'stimulants', label: t('readiness.substance.stimulants', 'Stimulants (Methamphetamine, cocaine, crack)') },
    { id: 'cannabis', label: t('readiness.substance.cannabis', 'Cannabis / Marijuana') },
    { id: 'general', label: t('readiness.substance.general', 'Multiple or Other Substances') },
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
  const roleLabel = h('label', { for: 'readiness-role-select', class: 'choice-label' }, t('readiness.role.label', 'Who is filling this out?'));
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
    h('option', { value: 'individual', selected: inMemoryReadinessState.assessorRole === 'individual' }, t('readiness.role.individual', 'Exploring for myself (Self-Reflection)')),
    h('option', { value: 'loved_one', selected: inMemoryReadinessState.assessorRole === 'loved_one' }, t('readiness.role.loved_one', 'A family member, partner, or friend (Ally Perspective)')),
    h('option', { value: 'counselor', selected: inMemoryReadinessState.assessorRole === 'counselor' }, t('readiness.role.counselor', 'A counselor, healthcare provider, or peer specialist')),
  );
  roleGroup.append(roleLabel, roleSelect);
  settingsCard.append(roleGroup);
  root.append(settingsCard);

  // 4. Live Clinical Summary Card (Print-Handout Ready)
  const summaryCard = h('div', { class: 'card纠asam-summary-card print-handout', 'aria-live': 'polite', id: 'readiness-summary' });
  summaryCard.className = 'card asam-summary-card print-handout';
  const summaryHeader = h('h2', { class: 'card-title' }, t('readiness.summary.title', 'Live Readiness & Stage Summary'));
  const chipsWrap = h('div', { class: 'chips' });
  const stageBadge = h('span', { class: 'chip chip-primary badge-severity' }, t('readiness.summary.calculating', 'Calculating...'));
  const scoreBadge = h('span', { class: 'chip' }, t('readiness.summary.scoreBadge', 'Readiness Score: {score}', { score: '--' }));
  chipsWrap.append(stageBadge, scoreBadge);

  const stageDesc = h('p', { class: 'lede' }, '');
  const coachingCallout = h('div', { class: 'callout callout-info' });
  const coachingTitle = h('p', { class: 'callout-title' }, icon('message'), t('readiness.summary.coachingTitle', 'Motivational Coaching Insight'));
  const coachingText = h('p', null, '');
  coachingCallout.append(coachingTitle, coachingText);

  const nextStepsHeading = h('h3', null, t('readiness.summary.nextStepsHeading', 'Recommended Next Steps'));
  const nextStepsList = h('ul', { class: 'list' });

  // Recurrence / Slip Quick Action Callout
  const slipBox = h(
    'div',
    { class: 'callout callout-emergency no-print' },
    h('p', { class: 'callout-title' }, icon('alert'), t('readiness.slip.title', 'Had a slip or return to use?')),
    h('p', null, t('readiness.slip.body', 'A return to use is common and provides valuable learning. Lowered tolerance dramatically increases overdose risk — please stay safe.')),
    h(
      'button',
      {
        type: 'button',
        class: 'btn btn-secondary',
        onclick: (e) => {
          const isCurrentlySlip = inMemoryReadinessState.recentSlip;
          setReadinessState({ recentSlip: !isCurrentlySlip, timestamp: Date.now() });
          updateLiveSummary();
          announce(!isCurrentlySlip ? t('readiness.slip.announceActive', 'Recurrence mode activated') : t('readiness.slip.announceStandard', 'Standard readiness mode activated'));
          e.target.textContent = inMemoryReadinessState.recentSlip ? t('readiness.slip.btnExit', 'Exit Recurrence Mode') : t('readiness.slip.btnView', 'View Recurrence & Overdose Safety Guidance');
        },
      },
      inMemoryReadinessState.recentSlip ? t('readiness.slip.btnExit', 'Exit Recurrence Mode') : t('readiness.slip.btnView', 'View Recurrence & Overdose Safety Guidance'),
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
    scoreBadge.textContent = t('readiness.summary.scoreBadge', 'Readiness Score: {score}', { score: result.readinessScore });
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
    t('readiness.questions.heading', '2. Readiness Assessment (URICA-Inspired)'),
    p(
      t('readiness.questions.desc', 'Read each statement below and choose how much you agree with it right now. There are no right or wrong answers.'),
    ),
  );

  const questionElements = [];

  for (let i = 0; i < READINESS_STATEMENTS.length; i++) {
    const stmt = READINESS_STATEMENTS[i];
    const fieldset = h('fieldset', { class: 'choice-group dimension-item' });
    const legend = h(
      'legend',
      null,
      h('span', { class: 'choice-label' }, t('readiness.questions.statementLegend', 'Statement {n}: {text}', { n: i + 1, text: stmt.statement })),
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
          announce(t('readiness.questions.announceSelected', 'Selected {label} for statement {n}', { label: opt.label, n: i + 1 }));
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
    t('readiness.db.heading', '3. Decisional Balance Tool (Pros & Cons Matrix)'),
    p(
      t('readiness.db.desc', 'Ambivalence is normal. Weighing what you like about using against what is difficult or worrying helps clarify your genuine personal priorities.'),
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
    const textLabel = h('label', { for: `db-custom-${quad.key}`, class: 'choice-desc' }, t('readiness.db.customThoughts', 'Add your own thoughts for "{title}":', { title: quad.data.title }));
    const textarea = h('textarea', {
      id: `db-custom-${quad.key}`,
      class: 'input',
      rows: 2,
      placeholder: t('readiness.db.notesPlaceholder', 'Type personal notes here (held in RAM only)...'),
      oninput: (e) => {
        setReadinessState({
          decisionalBalance: { [customKey]: e.target.value },
          timestamp: Date.now(),
        });
      },
    }, inMemoryReadinessState.decisionalBalance[customKey] || '');
    card.append(textLabel, textarea);
    dbGrid.append(card);
  }
  dbSection.append(dbGrid);
  root.append(dbSection);

  // 7. CRAFT Guidance for Families & Allies
  const craftSection = section(
    'readiness-craft',
    t('readiness.craft.heading', '4. Guidance for Families & Loved Ones (CRAFT Principles)'),
    p(
      t('readiness.craft.desc', 'If you love someone navigating drug or alcohol use, Community Reinforcement and Family Training (CRAFT) offers science-backed ways to support them while protecting your own well-being.'),
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
  const craftNotesLabel = h('label', { for: 'craft-ally-notes', class: 'choice-label' }, t('readiness.craft.allyNotesLabel', 'Ally & Supporter Reflection Notes:'));
  const craftNotesTextarea = h('textarea', {
    id: 'craft-ally-notes',
    class: 'input',
    rows: 3,
    placeholder: t('readiness.craft.allyNotesPlaceholder', 'Record boundaries you wish to set or positive moments you noticed (held in RAM only)...'),
    oninput: (e) => {
      setReadinessState({ craftNotes: e.target.value, timestamp: Date.now() });
    },
  }, inMemoryReadinessState.craftNotes || '');
  craftNotesField.append(craftNotesLabel, craftNotesTextarea);
  craftSection.append(craftNotesField);
  root.append(craftSection);

  // 8. General Notes Section
  const notesField = h('div', { class: 'field no-print' });
  const notesLabel = h('label', { for: 'readiness-personal-notes', class: 'choice-label' }, t('readiness.notes.label', 'General Personal Notes & Goals (Held in RAM only):'));
  const notesTextarea = h('textarea', {
    id: 'readiness-personal-notes',
    class: 'input',
    rows: 3,
    placeholder: t('readiness.notes.placeholder', 'Write any personal insights, questions for your doctor, or goals here...'),
    oninput: (e) => {
      setReadinessState({ notes: e.target.value, timestamp: Date.now() });
    },
  }, inMemoryReadinessState.notes || '');
  notesField.append(notesLabel, notesTextarea);
  root.append(notesField);

  // 9. Actions Bar (Print, Copy, Reset & Navigation)
  const actionsBar = h('div', { class: 'actions assessment-actions no-print' });

  const copyBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-primary',
      onclick: async () => {
        const text = formatReadinessSummaryText();
        await copyText(text, {
          trigger: copyBtn,
          copiedLabel: t('readiness.actions.copied', '✓ Report Copied!'),
          announceSuccess: t('readiness.actions.announceCopied', 'Readiness summary report copied to clipboard'),
        });
      },
    },
    icon('clipboard'),
    t('readiness.actions.copyBtn', ' Copy Readiness Summary'),
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
    t('readiness.actions.printBtn', ' Print Handout'),
  );

  const resetBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-ghost',
      onclick: () => {
        resetReadinessState();
        announce(t('readiness.actions.announceReset', 'All readiness answers and notes have been cleared from memory'));
      },
    },
    icon('x'),
    t('readiness.actions.resetBtn', ' Clear All Answers (RAM Wipe)'),
  );

  const navTreatmentBtn = h(
    'a',
    { class: 'btn btn-secondary', href: '#/treatment' },
    icon('search'),
    t('readiness.actions.findTreatment', ' Find Treatment Options'),
  );

  const navHarmReductionBtn = h(
    'a',
    { class: 'btn btn-secondary', href: '#/harm-reduction' },
    icon('heart'),
    t('readiness.actions.harmReduction', ' Harm Reduction & Supplies'),
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
