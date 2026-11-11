/**
 * Evidence-Based Overdose Rescue Pacing Assistant
 *
 * Real-time clinical decision support and interactive rescue pacing tool for opioid
 * overdose emergencies. Guides responders through responsiveness check, naloxone
 * administration, metronomic rescue breathing pacing (1 breath every 5s / 12 breaths/min),
 * real-time 2-to-3 minute re-dosing countdown evaluation, and recovery position placement.
 *
 * Clinical sources:
 * - SAMHSA Overdose Prevention and Response Toolkit (updated May 2026), pp. 7–10:
 *   https://library.samhsa.gov/sites/default/files/overdose-prevention-response-kit-pep23-03-00-001.pdf
 * - FDA-approved NARCAN labeling, dosage and administration / instructions for use:
 *   https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/208411Orig1s002lbl.pdf
 * - AHA Opioid-Associated Emergency for Lay Responders Algorithm:
 *   https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2024-Algorithms/Algorithm-Opioid-Lay-Responder-200615.pdf
 * Normal breathing, rather than wakefulness alone, guides the response. This
 * optional timer never replaces dispatcher instructions, CPR, or the product label.
 */

import { h, announce, icon, tel, clear } from '../dom.js';
import {
  WOODEN_CHEST_SYNDROME,
  RENARCONIZATION_RISK,
  XYLAZINE_SEDATION_MANAGEMENT,
  REVERSAL_FORMULATIONS,
} from '../content/reversalFormulations.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';
import { hapticOverdoseBeat, hapticPattern, hapticPulse } from './haptics.js';
import { createOverdoseResilienceState, transitionOverdoseResilience } from '../views/overdoseResilience.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetOverdosePacer);

/**
 * Five-Step Rescue Protocol Schema and Clinical Content
 */
export const RESCUE_PACING_STEPS = [
  {
    step: 1,
    id: 'responsiveness',
    get title() { return t('pacer.step1.title', 'Check Response & Breathing'); },
    get subtitle() { return t('pacer.step1.subtitle', 'Evaluate responsiveness and respiratory status'); },
    get badge() { return t('pacer.step1.badge', 'Step 1 of 5'); },
    get headline() { return t('pacer.step1.headline', 'Try to wake the person and check whether they are breathing normally'); },
    get instructions() {
      return [
        t('pacer.step1.ins1', 'Call their name and ask, "Can you hear me?"'),
        t('pacer.step1.ins2', 'Tap their shoulders and shout to check for a response.'),
        t('pacer.step1.ins3', 'Look for slow, shallow, or stopped breathing, gasping, gurgling, or snoring sounds, and blue or gray lips or nail beds. Gasping is not normal breathing.'),
        t('pacer.step1.ins4', 'Call 911 immediately. Put your phone on speakerphone and place it beside you so dispatchers can coach you while your hands remain free.'),
      ];
    },
    get actionPrompt() { return t('pacer.step1.actionPrompt', 'If the person does not respond or is breathing abnormally, immediately administer naloxone.'); },
    get clinicalNote() { return t('pacer.step1.clinicalNote', 'Give naloxone for a suspected opioid overdose, even if you are unsure what the person took. It does not replace emergency medical care or CPR.'); },
  },
  {
    step: 2,
    id: 'first_dose',
    get title() { return t('pacer.step2.title', 'First Naloxone Administration'); },
    get subtitle() { return t('pacer.step2.subtitle', 'Administer initial reversal dose immediately'); },
    get badge() { return t('pacer.step2.badge', 'Step 2 of 5'); },
    get headline() { return t('pacer.step2.headline', '4mg nasal spray in 1 nostril, or 0.4mg IM injection'); },
    get formulations() {
      return {
        nasal: {
          dose: '4 mg in 0.1 mL',
          get route() { return t('pacer.step2.nasal.route', 'Intranasal (IN)'); },
          get device() { return t('pacer.step2.nasal.device', 'Single-dose needle-free spray (Narcan / OTC generic)'); },
          get instructions() {
            return [
              t('pacer.step2.nasal.ins1', 'Peel open the blister package and remove the single-dose device.'),
              t('pacer.step2.nasal.ins2', 'Hold the device with your thumb on the bottom plunger and your index and middle fingers on the nozzle collar. Do NOT test-spray or prime.'),
              t('pacer.step2.nasal.ins3', 'Tilt the person’s head gently backward to open the nasal passage.'),
              t('pacer.step2.nasal.ins4', 'Insert the nozzle tip fully into ONE nostril until your fingers touch the base of their nose.'),
              t('pacer.step2.nasal.ins5', 'Press the plunger firmly with your thumb until it clicks to deliver the entire 4mg dose.'),
            ];
          },
        },
        injectable: {
          dose: '0.4 mg / 1 mL',
          get route() { return t('pacer.step2.im.route', 'Intramuscular (IM)'); },
          get device() { return t('pacer.step2.im.device', 'Vial with syringe or auto-injector'); },
          get instructions() {
            return [
              t('pacer.step2.im.ins1', 'Draw 1 mL (0.4 mg) of solution into the syringe.'),
              t('pacer.step2.im.ins2', 'Inject at a 90-degree angle into the muscle of the outer thigh or upper arm (can inject straight through clothing if necessary).'),
              t('pacer.step2.im.ins3', 'Push plunger down completely and withdraw the needle carefully.'),
            ];
          },
        },
      };
    },
    get timingNote() { return t('pacer.step2.timingNote', 'Follow the instructions on your naloxone product. For this nasal spray, repeat with a new device every 2 to 3 minutes if breathing is still slow, shallow, or absent, or becomes abnormal again. Support breathing as directed by 911 while waiting.'); },
  },
  {
    step: 3,
    id: 'rescue_breathing',
    get title() { return t('pacer.step3.title', 'Rescue Breathing Metronome'); },
    get subtitle() { return t('pacer.step3.subtitle', 'Use breathing support as trained or directed by 911'); },
    get badge() { return t('pacer.step3.badge', 'Step 3 of 5'); },
    get headline() { return t('pacer.step3.headline', '1 breath every 5 seconds (12 breaths/minute)'); },
    rhythmSeconds: 5,
    targetBreathsPerMin: 12,
    get instructions() {
      return [
        t('pacer.step3.dispatcher', 'If the person is unresponsive and not breathing normally, follow the 911 dispatcher’s CPR instructions. Use an AED if available. This optional breathing timer does not guide chest compressions; never delay CPR or emergency help to use it.'),
        t('pacer.step3.ins1', 'Position airway: Tilt head back gently and lift chin (head-tilt / chin-lift maneuver) to prevent tongue from blocking the throat.'),
        t('pacer.step3.ins2', 'Pinch the person’s nose shut firmly with your thumb and forefinger.'),
        t('pacer.step3.ins3', 'Make an airtight seal with your mouth completely covering theirs.'),
        t('pacer.step3.ins4', 'Deliver 1 slow, steady breath over 1 second. Watch the chest rise visibly.'),
        t('pacer.step3.ins5', 'Release the seal and allow 4 seconds for passive exhalation.'),
        t('pacer.step3.ins6', 'Follow the metronome pacing: Deliver exactly 1 breath every 5 seconds (12 breaths per minute). Continue until spontaneous breathing resumes or EMS arrives.'),
      ];
    },
    get clinicalCallout() {
      return {
        type: 'wooden_chest_syndrome',
        get title() { return t('pacer.woodenchest.title', WOODEN_CHEST_SYNDROME.title); },
        mechanism: WOODEN_CHEST_SYNDROME.pathophysiology.mechanism,
        glotticClosure: WOODEN_CHEST_SYNDROME.pathophysiology.glotticInvolvement,
        get warning() { return t('pacer.woodenchest.warning', 'If the chest feels stiff or rescue breaths are not going in, tell the 911 dispatcher immediately. These signs can have different causes; this tool cannot diagnose fentanyl-related chest rigidity ("wooden chest syndrome").'); },
        get action() { return t('pacer.woodenchest.action', 'Keep 911 on speaker and follow their instructions for CPR and breathing support. Give naloxone for a suspected opioid overdose. If breathing remains slow, shallow, or absent, repeat a dose using a new nasal spray every 2–3 minutes as the product label directs. Report what you see rather than trying to diagnose the cause.'); },
        get reference() { return t('pacer.woodenchest.ref', 'FDA NARCAN instructions; SAMHSA overdose response toolkit; AHA lay responder algorithm'); },
      };
    },
  },
  {
    step: 4,
    id: 'redosing_clock',
    get title() { return t('pacer.step4.title', '2-to-3 Minute Re-Dosing Evaluation Clock'); },
    get subtitle() { return t('pacer.step4.subtitle', 'Countdown since the most recent recorded dose'); },
    get badge() { return t('pacer.step4.badge', 'Step 4 of 5'); },
    get headline() { return t('pacer.step4.headline', 'Check breathing; repeat nasal naloxone every 2–3 minutes if breathing is abnormal'); },
    get evaluationPoints() {
      return [
        {
          minute: 2,
          seconds: 120,
          get label() { return t('pacer.step4.eval2min.label', '2-Minute Evaluation Mark'); },
          get instruction() { return t('pacer.step4.eval2min.ins', 'Check breathing now. If it is still slow, shallow, or absent, give another dose with a new nasal spray in the other nostril, following the product’s 2–3 minute instructions. Keep following 911 guidance for breathing support or CPR.'); },
        },
        {
          minute: 3,
          seconds: 180,
          get label() { return t('pacer.step4.eval3min.label', '3-Minute Re-Dosing Threshold'); },
          get instruction() { return t('pacer.step4.eval3min.ins', 'If breathing is still slow, shallow, or absent, give another dose with a new nasal spray in the other nostril. Repeat every 2–3 minutes as the label directs until normal breathing returns or emergency help takes over. Do not give extra doses solely to wake someone who is breathing normally.'); },
        },
      ];
    },
    get clinicalCallout() {
      return {
        type: 'xylazine_sedation',
        get title() { return t('pacer.xylazine.title', XYLAZINE_SEDATION_MANAGEMENT.title); },
        get warning() { return t('pacer.xylazine.warning', 'Naloxone does not reverse xylazine itself. Still give naloxone for a suspected opioid overdose because opioids may also be present.'); },
        get clinicalGoal() { return t('pacer.xylazine.clinicalGoal', 'The goal is normal breathing, not full wakefulness. A person may remain sleepy after breathing improves. Do not give extra naloxone solely to wake them if they are breathing normally. If breathing slows or stops again, give another dose as the label directs and follow 911 instructions.'); },
        get action() { return t('pacer.xylazine.action', 'Once breathing normally, gently roll the person onto their side in the recovery position. Stay with them and keep checking breathing until emergency help takes over.'); },
        get reference() { return t('pacer.xylazine.ref', 'SAMHSA overdose prevention and response toolkit'); },
      };
    },
  },
  {
    step: 5,
    id: 'recovery_position',
    get title() { return t('pacer.step5.title', 'Recovery Position & Post-Reversal Observation'); },
    get subtitle() { return t('pacer.step5.subtitle', 'Left lateral recumbent positioning and observation protocol'); },
    get badge() { return t('pacer.step5.badge', 'Step 5 of 5'); },
    get headline() { return t('pacer.step5.headline', 'Left lateral recumbent position to maintain patent airway and prevent aspiration'); },
    get instructions() {
      return [
        t('pacer.step5.ins1', 'Roll the person onto their LEFT side (Left Lateral Recumbent Position).'),
        t('pacer.step5.ins2', 'Bend their top knee forward at a 90-degree angle to prop the body and prevent them from rolling onto their stomach.'),
        t('pacer.step5.ins3', 'Place their top hand under their cheek to keep the neck extended and maintain an open airway.'),
        t('pacer.step5.ins4', 'Tilt their face and mouth slightly downward toward the floor so any vomit, saliva, or fluids drain freely without obstructing the trachea.'),
        t('pacer.step5.ins5', 'Continuously monitor breathing rate and chest rise every 1 to 2 minutes until paramedics arrive.'),
      ];
    },
    get clinicalCallout() {
      return {
        type: 'renarconization_risk',
        get title() { return t('pacer.renarconization.title', RENARCONIZATION_RISK.title); },
        mechanism: RENARCONIZATION_RISK.pathophysiology.mechanism,
        get reboundWindow() { return t('pacer.renarconization.window', '30–90 minutes (up to 2–4+ hours for synthetic fentanyl analogues or methadone)'); },
        get warning() { return t('pacer.renarconization.warning', 'CRITICAL ALERT: Renarconization Risk (Secondary Opioid Resurgence). Naloxone has a short elimination half-life of 30 to 90 minutes. Lipophilic synthetic fentanyl and high-potency analogues store in body fat and slowly redistribute back into circulation for hours. As naloxone clears, secondary opioid overdose and fatal respiratory depression can recur.'); },
        get action() { return t('pacer.renarconization.action', 'Stay with the person until emergency help takes over, even if they wake up. Encourage emergency medical assessment because breathing problems can return. If breathing becomes slow, shallow, or absent again, follow 911 instructions and repeat naloxone as the product label directs.'); },
        get reference() { return t('pacer.renarconization.ref', 'SAMHSA / ACEP Post-Reversal Observation Guidelines'); },
      };
    },
  },
];

/**
 * Ephemeral In-RAM State Management
 */
function getInitialPacerState() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    Boolean(window.matchMedia('(prefers-reduced-motion: reduce)')?.matches);

  return {
    ...createOverdoseResilienceState(),
    currentStep: 1,

    firstDoseAdministered: false,
    firstDoseTimestamp: null,
    firstDoseRoute: 'nasal_4mg', // 'nasal_4mg' | 'im_0_4mg'
    firstDoseNostril: 'right', // 'right' | 'left'


    secondDoseAdministered: false,
    secondDoseTimestamp: null,
    secondDoseRoute: 'nasal_4mg',
    secondDoseNostril: 'left',

    reducedMotion: prefersReduced,
    completed: false,
  };
}

let pacerState = getInitialPacerState();
let breathingIntervalId = null;
let reDoseIntervalId = null;
let lastBreathingTick = 0;
let lastReDoseTick = 0;
const timerNow = () => globalThis.performance?.now?.() ?? Date.now();
let activeBreathingOptions = {};
let activeReDoseOptions = {};
const subscribers = new Set();
let registeredOnComplete = null;
let registeredOnReset = null;

/**
 * Returns an immutable snapshot copy of current pacer state.
 */
export function getOverdosePacerState() {
  return JSON.parse(JSON.stringify(pacerState));
}

/**
 * Formats seconds into MM:SS display format.
 */
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Subscribes to pacer state mutations.
 */
export function subscribeOverdosePacer(listener) {
  if (typeof listener === 'function') {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }
  return () => {};
}

function notifySubscribers() {
  const snapshot = getOverdosePacerState();
  for (const listener of subscribers) {
    try {
      listener(snapshot);
    } catch {
      /* subscriber safety */
    }
  }
}

/**
 * Changes active rescue pacing step (1 through 5).
 */
export function setOverdosePacerStep(stepNumber) {
  const step = Math.max(1, Math.min(5, Math.floor(Number(stepNumber) || 1)));
  pacerState.currentStep = step;
  notifySubscribers();
  return getOverdosePacerState();
}

export function nextPacerStep() {
  return setOverdosePacerStep(pacerState.currentStep + 1);
}

export function prevPacerStep() {
  return setOverdosePacerStep(pacerState.currentStep - 1);
}

/**
 * Toggles or sets reduced-motion mode.
 */
export function setReducedMotion(enabled) {
  pacerState.reducedMotion = Boolean(enabled);
  notifySubscribers();
  return getOverdosePacerState();
}

export function toggleReducedMotion() {
  return setReducedMotion(!pacerState.reducedMotion);
}

/**
 * Starts rescue breathing metronome (1 breath every 5 seconds).
 */
export function startRescueBreathingTimer(options = {}) {
  activeBreathingOptions = { ...options };
  const { onTick, onBreath } = activeBreathingOptions;
  if (breathingIntervalId) {
    clearInterval(breathingIntervalId);
    breathingIntervalId = null;
  }
  const previousBreaths = pacerState.breathCount;
  pacerState = transitionOverdoseResilience(pacerState, { type: 'START_BREATHING' });
  if (pacerState.breathCount > previousBreaths) {
    hapticOverdoseBeat();
    try { announce(t('pacer.announce.breathingStarted', 'Rescue breathing started: Inhale 1 breath now.')); } catch {}
    if (typeof onBreath === 'function') onBreath(pacerState.breathCount);
  }
  notifySubscribers();

  if (!pacerState.isBreathingActive) return getOverdosePacerState();
  lastBreathingTick = timerNow();
  breathingIntervalId = setInterval(() => {
    const seconds = Math.floor((timerNow() - lastBreathingTick) / 1000);
    if (seconds < 1) return;
    lastBreathingTick += seconds * 1000;
    tickRescueBreathingStep(options, seconds);
  }, 1000);

  return getOverdosePacerState();
}

/**
 * Deterministically ticks the rescue breathing metronome (useful for tests or stepping).
 */
export function tickRescueBreathing(stepCount = 1, options = {}) {
  const steps = Math.max(1, Math.floor(Number(stepCount) || 1));
  tickRescueBreathingStep(options, steps);
  return getOverdosePacerState();
}

function tickRescueBreathingStep(options = {}, seconds = 1) {
  if (!pacerState.isBreathingActive || pacerState.spontaneousBreathingResumed) return;
  const merged = { ...activeBreathingOptions, ...options };
  const { onTick, onBreath } = merged;
  const previousBreaths = pacerState.breathCount;
  pacerState = transitionOverdoseResilience(pacerState, { type: 'BREATH_TICK', seconds });
  // A delayed callback updates the display once; never replay missed cues.
  if (pacerState.breathPhase === 'inhale' && pacerState.breathCount > previousBreaths) {
    hapticOverdoseBeat();
    try { announce(t('pacer.announce.breathDelivered', 'Breath {n}: Deliver 1 breath now.', { n: pacerState.breathCount })); } catch {}
    if (typeof onBreath === 'function') onBreath(pacerState.breathCount);
  }
  if (typeof onTick === 'function') onTick(getOverdosePacerState());
  notifySubscribers();
}

/**
 * Stops or pauses rescue breathing metronome.
 */
export function stopRescueBreathingTimer() {
  if (breathingIntervalId) {
    clearInterval(breathingIntervalId);
    breathingIntervalId = null;
  }
  pacerState = transitionOverdoseResilience(pacerState, { type: 'STOP_BREATHING' });
  notifySubscribers();
  return getOverdosePacerState();
}

/**
 * Starts 2-to-3 minute re-dosing evaluation clock.
 */
export function startReDoseTimer(options = {}) {
  activeReDoseOptions = { ...options };
  const { onTick, onAlert } = activeReDoseOptions;
  if (reDoseIntervalId) {
    clearInterval(reDoseIntervalId);
    reDoseIntervalId = null;
  }
  pacerState = transitionOverdoseResilience(pacerState, { type: 'START_DOSE_CLOCK' });
  if (!pacerState.firstDoseTimestamp) {
    pacerState.firstDoseTimestamp = Date.now();
  }
  notifySubscribers();

  if (!pacerState.reDoseTimerActive) return getOverdosePacerState();
  lastReDoseTick = timerNow();
  reDoseIntervalId = setInterval(() => {
    const seconds = Math.floor((timerNow() - lastReDoseTick) / 1000);
    if (seconds < 1) return;
    lastReDoseTick += seconds * 1000;
    tickReDoseTimerStep(options, seconds);
  }, 1000);

  return getOverdosePacerState();
}

/**
 * Deterministically ticks the re-dose countdown clock.
 */
export function tickReDoseTimer(seconds = 1, options = {}) {
  const s = Math.max(1, Math.floor(Number(seconds) || 1));
  tickReDoseTimerStep(options, s);
  return getOverdosePacerState();
}

function tickReDoseTimerStep(options = {}, seconds = 1) {
  // Recovery ends dose prompts even if a queued timer callback runs afterward.
  if (!pacerState.reDoseTimerActive || pacerState.spontaneousBreathingResumed) return;
  const merged = { ...activeReDoseOptions, ...options };
  const { onTick, onAlert } = merged;
  const hadTwoMinuteAlert = pacerState.twoMinuteAlertTriggered;
  const hadThreeMinuteAlert = pacerState.threeMinuteAlertTriggered;
  pacerState = transitionOverdoseResilience(pacerState, { type: 'DOSE_TICK', seconds });

  // 2-Minute Mark Evaluation (120 seconds)
  if (pacerState.twoMinuteAlertTriggered && !hadTwoMinuteAlert && !pacerState.threeMinuteAlertTriggered) {
    try {
      announce(t('pacer.announce.alert2min', 'Two minutes elapsed. If breathing is still slow, shallow, or absent, give another naloxone dose with a new nasal spray in the other nostril, following the product label. Continue 911-directed breathing support or CPR.'));
    } catch {}
    hapticPattern([200, 100, 200]);
    if (typeof onAlert === 'function') onAlert('2min_evaluate', getOverdosePacerState());
  }

  // 3-Minute Re-Dosing Threshold (180 seconds)
  if (pacerState.threeMinuteAlertTriggered && !hadThreeMinuteAlert) {
    try {
      announce(t('pacer.announce.alert3min', 'Three minutes reached. If breathing is still slow, shallow, or absent, give another dose with a new nasal spray in the other nostril, following the product label. If breathing is normal, stay with the person and keep watching their breathing.'));
    } catch {}
    hapticPattern([300, 150, 300, 150, 300]);
    if (typeof onAlert === 'function') onAlert('3min_redose_prompt', getOverdosePacerState());
  }

  if (typeof onTick === 'function') onTick(getOverdosePacerState());
  notifySubscribers();
}

/**
 * Stops or pauses re-dose evaluation clock.
 */
export function stopReDoseTimer() {
  if (reDoseIntervalId) {
    clearInterval(reDoseIntervalId);
    reDoseIntervalId = null;
  }
  pacerState = transitionOverdoseResilience(pacerState, { type: 'STOP_DOSE_CLOCK' });
  notifySubscribers();
  return getOverdosePacerState();
}

function resetDoseClock() {
  pacerState = transitionOverdoseResilience(pacerState, { type: 'RESET_DOSE_CLOCK' });
}

/**
 * Records administration of first naloxone dose and starts evaluation clock.
 */
export function recordFirstDose(options = {}) {
  const route = options.route || 'nasal_4mg';
  const nostril = options.nostril || 'right';
  pacerState.firstDoseAdministered = true;
  pacerState.firstDoseTimestamp = Date.now();
  pacerState.firstDoseRoute = route;
  pacerState.firstDoseNostril = nostril;
  pacerState.secondDoseNostril = nostril === 'right' ? 'left' : 'right';
  pacerState.spontaneousBreathingResumed = false;
  resetDoseClock();
  startReDoseTimer();
  notifySubscribers();
  return getOverdosePacerState();
}

/**
 * Records administration of second naloxone dose in opposite nostril.
 */
export function recordSecondDose(options = {}) {
  const route = options.route || pacerState.firstDoseRoute || 'nasal_4mg';
  const nostril = options.nostril || pacerState.secondDoseNostril || 'left';
  pacerState.secondDoseAdministered = true;
  pacerState.secondDoseTimestamp = Date.now();
  pacerState.secondDoseRoute = route;
  pacerState.secondDoseNostril = nostril;
  resetDoseClock();
  startReDoseTimer();
  notifySubscribers();
  return getOverdosePacerState();
}

/**
 * Records that spontaneous breathing has resumed and navigates to Recovery Position (Step 5).
 */
export function recordSpontaneousBreathingResumed() {
  pacerState = transitionOverdoseResilience(pacerState, { type: 'RECOVER' });
  stopRescueBreathingTimer();
  stopReDoseTimer();
  notifySubscribers();
  return getOverdosePacerState();
}

/**
 * Deterministically resets all state, timers, and registered callbacks.
 */
export function resetOverdosePacer() {
  if (breathingIntervalId) {
    clearInterval(breathingIntervalId);
    breathingIntervalId = null;
  }
  if (reDoseIntervalId) {
    clearInterval(reDoseIntervalId);
    reDoseIntervalId = null;
  }
  activeBreathingOptions = {};
  activeReDoseOptions = {};
  pacerState = getInitialPacerState();
  notifySubscribers();
  if (typeof registeredOnReset === 'function') {
    try { registeredOnReset(); } catch {}
  }
  return getOverdosePacerState();
}

/**
 * DOM Component: Interactive Overdose Rescue Pacing Assistant
 */
export function overdosePacer(props = {}) {
  const { onComplete, onReset } = props;
  registeredOnComplete = onComplete || null;
  registeredOnReset = onReset || null;

  const root = h('div', {
    class: 'overdose-pacer',
    'data-step': String(pacerState.currentStep),
    role: 'region',
    'aria-label': t('pacer.aria.label', 'Overdose Rescue Pacing Assistant'),
  });

  // Screen reader announcer region
  const liveAnnouncer = h('div', {
    class: 'visually-hidden pacer-live-announcer',
    role: 'status',
    'aria-live': 'assertive',
    'aria-atomic': 'true',
  });

  // Navigation header with step indicators
  const navContainer = h('nav', {
    class: 'pacer-stepper',
    'aria-label': t('pacer.stepper.aria', 'Rescue pacing steps'),
  });

  // Main step view container
  const stepContainer = h('div', {
    class: 'pacer-step-container',
  });
  let renderedSecondDose = pacerState.secondDoseAdministered;

  function renderStepper() {
    clear(navContainer);
    for (const stepDef of RESCUE_PACING_STEPS) {
      const isCurrent = stepDef.step === pacerState.currentStep;
      const isCompleted = stepDef.step < pacerState.currentStep || (stepDef.step === 5 && pacerState.completed);

      const tabClass = [
        'pacer-step-tab',
        isCurrent ? 'active' : '',
        isCompleted ? 'completed' : '',
      ].filter(Boolean).join(' ');

      const tabBtn = h('button', {
        type: 'button',
        class: tabClass,
        'aria-current': isCurrent ? 'step' : null,
        onclick: () => setOverdosePacerStep(stepDef.step),
      },
        h('span', { class: 'pacer-step-badge', 'aria-hidden': 'true' }, String(stepDef.step)),
        h('span', { class: 'pacer-step-title-text' }, stepDef.title)
      );
      navContainer.append(tabBtn);
    }
  }

  function renderStepContent() {
    clear(stepContainer);
    const stepDef = RESCUE_PACING_STEPS.find((s) => s.step === pacerState.currentStep) || RESCUE_PACING_STEPS[0];
    root.setAttribute('data-step', String(stepDef.step));

    switch (stepDef.step) {
      case 1:
        stepContainer.append(buildStep1Responsiveness(stepDef));
        break;
      case 2:
        stepContainer.append(buildStep2FirstDose(stepDef));
        break;
      case 3:
        stepContainer.append(buildStep3RescueBreathing(stepDef));
        break;
      case 4:
        stepContainer.append(buildStep4RedosingClock(stepDef));
        break;
      case 5:
        stepContainer.append(buildStep5RecoveryPosition(stepDef));
        break;
    }
  }

  function renderAll() {
    renderedSecondDose = pacerState.secondDoseAdministered;
    renderStepper();
    renderStepContent();
  }

  // Subscribe DOM updates to in-RAM state
  const unsubscribe = subscribeOverdosePacer((stateSnapshot) => {
    // If step changed, re-render
    const currentAttr = root.getAttribute('data-step');
    if (currentAttr !== String(stateSnapshot.currentStep)) {
      renderAll();
      return;
    }
    if (renderedSecondDose !== stateSnapshot.secondDoseAdministered) {
      renderedSecondDose = stateSnapshot.secondDoseAdministered;
      renderStepContent();
      return;
    }

    // Step 3 reactive timer updates
    if (stateSnapshot.currentStep === 3) {
      const pulseGuide = stepContainer.querySelector('.pacer-guide');
      const phaseLabel = stepContainer.querySelector('.pacer-phase-label');
      const breathCounter = stepContainer.querySelector('.pacer-breath-count-value');
      const secondCounter = stepContainer.querySelector('.pacer-second-counter');

      if (pulseGuide) {
        pulseGuide.classList.remove('pacer-inhale', 'pacer-pause', 'pacer-ready');
        pulseGuide.classList.add(`pacer-${stateSnapshot.breathPhase}`);
      }
      if (phaseLabel) {
        if (stateSnapshot.breathPhase === 'inhale') {
          phaseLabel.textContent = t('pacer.step3.phaseInhale', 'BREATHE NOW: Deliver 1 full breath over 1 second');
        } else if (stateSnapshot.isBreathingActive) {
          phaseLabel.textContent = t('pacer.step3.phaseWait', 'Wait (Second {sec} of 5) — chest falls passively', { sec: stateSnapshot.currentBreathSecond });
        } else {
          phaseLabel.textContent = t('pacer.step3.phasePaused', 'Metronome Paused — Press "Start Metronome" below');
        }
      }
      if (breathCounter) {
        breathCounter.textContent = String(stateSnapshot.breathCount);
      }
      if (secondCounter) {
        secondCounter.textContent = stateSnapshot.isBreathingActive
          ? t('pacer.step3.cadenceActive', 'Second {sec} of 5', { sec: stateSnapshot.currentBreathSecond })
          : t('pacer.step3.cadenceReady', '1 breath every 5 seconds (12 / min)');
      }
    }

    // Step 4 reactive clock updates
    if (stateSnapshot.currentStep === 4) {
      const display = stepContainer.querySelector('.timer-display');
      const twoMinuteCountdown = stepContainer.querySelector('.pacer-naloxone-countdown');
      const elapsed = stepContainer.querySelector('.pacer-elapsed-display');
      const alertArea = stepContainer.querySelector('.pacer-alert-container');

      if (display) {
        display.textContent = formatTime(stateSnapshot.reDoseRemainingSeconds);
      }
      if (twoMinuteCountdown) {
        twoMinuteCountdown.textContent = formatTime(stateSnapshot.naloxoneRemainingSeconds);
      }
      if (elapsed) {
        elapsed.textContent = t('pacer.step4.elapsed', 'Elapsed since most recent dose: {time}', { time: formatTime(stateSnapshot.reDoseElapsedSeconds) });
      }
      if (alertArea) {
        clear(alertArea);
        if (stateSnapshot.threeMinuteAlertTriggered) {
          alertArea.append(
            h('div', { class: 'callout callout-danger', role: 'alert' },
              h('strong', null, t('pacer.step4.alert3minHeading', '3-Minute Mark Reached: ')),
              t('pacer.step4.alert3min', 'If breathing is still slow, shallow, or absent, give another dose with a new nasal spray in the other nostril, following the product label. Normal breathing can return before the person wakes up.')
            )
          );
        } else if (stateSnapshot.twoMinuteAlertTriggered) {
          alertArea.append(
            h('div', { class: 'callout callout-warn', role: 'alert' },
              h('strong', null, t('pacer.step4.alert2minHeading', '2-Minute Evaluation Mark: ')),
              t('pacer.step4.alert2min', 'If breathing is still slow, shallow, or absent, give another dose with a new nasal spray in the other nostril, following the product’s 2–3 minute instructions. Continue breathing support or CPR as directed by 911.')
            )
          );
        }
      }
    }
  });

  // Top header with emergency callout and accessibility toggles
  const header = h('header', { class: 'pacer-header' },
    h('div', { class: 'pacer-header-title-group' },
      icon('activity'),
      h('h2', { class: 'pacer-main-heading' }, t('pacer.title', 'Overdose Rescue Pacing Assistant'))
    ),
    h('div', { class: 'pacer-header-controls' },
      h('button', {
        type: 'button',
        class: 'btn btn-ghost pacer-btn pacer-motion-toggle',
        'aria-pressed': String(pacerState.reducedMotion),
        onclick: () => {
          toggleReducedMotion();
          renderAll();
        },
      }, pacerState.reducedMotion ? t('pacer.motion.enable', 'Enable Pulsing Motion') : t('pacer.motion.reduced', 'Reduced Motion Mode')),
      h('button', {
        type: 'button',
        class: 'btn btn-ghost pacer-btn pacer-reset-btn',
        onclick: () => {
          resetOverdosePacer();
          renderAll();
        },
      }, t('pacer.reset', 'Reset Assistant'))
    )
  );

  root.append(liveAnnouncer, header, navContainer, stepContainer);
  renderAll();
  return root;
}

/**
 * Step 1: Response and breathing check
 */
function buildStep1Responsiveness(stepDef) {
  const card = h('article', { class: 'pacer-step-card step-responsiveness' },
    h('div', { class: 'pacer-step-heading-group' },
      h('span', { class: 'badge badge-danger' }, stepDef.badge),
      h('h3', { class: 'pacer-step-title' }, stepDef.title),
      h('p', { class: 'pacer-step-headline' }, stepDef.headline)
    ),
    h('div', { class: 'callout callout-warn' },
      h('p', null, h('strong', null, t('pacer.label.action', 'First action: ')), t('pacer.step1.callout', 'Call their name, tap their shoulders, and check for normal breathing. Call 911 for a suspected overdose.'))
    ),
    h('ul', { class: 'pacer-instruction-list' },
      ...stepDef.instructions.map((item) => h('li', null, item))
    ),
    h('div', { class: 'pacer-emergency-call-row' },
      tel('911', [icon('phone'), t('pacer.call911', 'Call 911 Immediately')], { class: 'btn btn-emergency pacer-btn' }),
      h('p', { class: 'pacer-note' }, t('pacer.step1.speakerNote', 'Keep 911 on speakerphone while delivering care.'))
    ),
    h('div', { class: 'pacer-step-actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-primary pacer-btn',
        onclick: () => setOverdosePacerStep(2),
      }, icon('chevron-right'), t('pacer.step1.advance', 'Person Unresponsive — Proceed to Naloxone (Step 2)'))
    ),
    h('div', { class: 'callout callout-info' },
      h('p', null, icon('info'), ' ', stepDef.clinicalNote)
    )
  );
  return card;
}

/**
 * Step 2: First Naloxone Administration
 */
function buildStep2FirstDose(stepDef) {
  const card = h('article', { class: 'pacer-step-card step-first-dose' },
    h('div', { class: 'pacer-step-heading-group' },
      h('span', { class: 'badge badge-primary' }, stepDef.badge),
      h('h3', { class: 'pacer-step-title' }, stepDef.title),
      h('p', { class: 'pacer-step-headline' }, stepDef.headline)
    ),
    h('div', { class: 'pacer-formulation-box' },
      h('h4', null, t('pacer.step2.route1', 'Route 1: 4mg Nasal Spray (Narcan / OTC Generic) — Recommended')),
      h('ul', { class: 'pacer-instruction-list' },
        ...stepDef.formulations.nasal.instructions.map((ins) => h('li', null, ins))
      )
    ),
    h('div', { class: 'pacer-nostril-selector-box' },
      h('label', { class: 'pacer-label-bold', id: 'nostril-select-label' }, t('pacer.step2.nostrilLabel', 'Selected Nostril for 1st Dose:')),
      h('div', { class: 'pacer-button-group', role: 'radiogroup', 'aria-labelledby': 'nostril-select-label' },
        h('button', {
          type: 'button',
          role: 'radio',
          'aria-checked': String(pacerState.firstDoseNostril === 'right'),
          class: `btn pacer-btn ${pacerState.firstDoseNostril === 'right' ? 'btn-primary' : 'btn-outline'}`,
          onclick: (e) => {
            pacerState.firstDoseNostril = 'right';
            pacerState.secondDoseNostril = 'left';
            card.querySelectorAll('[role="radio"]').forEach((b) => {
              b.setAttribute('aria-checked', String(b === e.currentTarget));
              b.className = `btn pacer-btn ${b === e.currentTarget ? 'btn-primary' : 'btn-outline'}`;
            });
          },
        }, t('pacer.step2.nostrilRight', 'Right Nostril (Standard)')),
        h('button', {
          type: 'button',
          role: 'radio',
          'aria-checked': String(pacerState.firstDoseNostril === 'left'),
          class: `btn pacer-btn ${pacerState.firstDoseNostril === 'left' ? 'btn-primary' : 'btn-outline'}`,
          onclick: (e) => {
            pacerState.firstDoseNostril = 'left';
            pacerState.secondDoseNostril = 'right';
            card.querySelectorAll('[role="radio"]').forEach((b) => {
              b.setAttribute('aria-checked', String(b === e.currentTarget));
              b.className = `btn pacer-btn ${b === e.currentTarget ? 'btn-primary' : 'btn-outline'}`;
            });
          },
        }, t('pacer.step2.nostrilLeft', 'Left Nostril'))
      )
    ),
    h('div', { class: 'callout callout-info' },
      h('p', null, icon('info'), ' ', stepDef.timingNote)
    ),
    h('div', { class: 'pacer-step-actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-emergency pacer-btn',
        onclick: () => {
          recordFirstDose({
            route: pacerState.firstDoseRoute,
            nostril: pacerState.firstDoseNostril,
          });
          setOverdosePacerStep(3);
        },
      }, icon('check'), t('pacer.step2.advance', 'Administer 1st Dose & Check Breathing (Proceed to Step 3)'))
    )
  );
  return card;
}

/**
 * Step 3: Rescue Breathing Metronome
 */
function buildStep3RescueBreathing(stepDef) {
  const callout = stepDef.clinicalCallout;

  const card = h('article', { class: 'pacer-step-card step-rescue-breathing' },
    h('div', { class: 'pacer-step-heading-group' },
      h('span', { class: 'badge badge-primary' }, stepDef.badge),
      h('h3', { class: 'pacer-step-title' }, stepDef.title),
      h('p', { class: 'pacer-step-headline' }, stepDef.headline)
    ),
    h('ul', { class: 'pacer-instruction-list' },
      ...stepDef.instructions.map((item) => h('li', null, item))
    ),
    // Interactive Metronome Widget
    h('div', {
      class: `pacer-metronome-box ${pacerState.reducedMotion ? 'pacer-reduced-motion' : ''}`,
      role: 'timer',
      'aria-live': 'polite',
      'aria-label': t('pacer.step3.metronomeAria', 'Rescue breathing rhythm: 1 breath every 5 seconds'),
    },
      h('div', {
        class: `pacer-guide pacer-${pacerState.breathPhase}`,
      },
        h('div', { class: 'pacer-circle', 'aria-hidden': 'true' }),
        h('div', { class: 'pacer-phase-label' },
          pacerState.breathPhase === 'inhale'
            ? t('pacer.step3.phaseInhale', 'BREATHE NOW: Deliver 1 full breath over 1 second')
            : (pacerState.isBreathingActive
              ? t('pacer.step3.phaseWait', 'Wait (Second {sec} of 5) — chest falls passively', { sec: pacerState.currentBreathSecond })
              : t('pacer.step3.phasePaused', 'Metronome Paused — Press "Start Metronome" below'))
        )
      ),
      h('div', { class: 'pacer-metronome-stats' },
        h('div', { class: 'pacer-stat-item' },
          h('span', { class: 'pacer-stat-label' }, t('pacer.step3.statBreaths', 'Breaths Delivered: ')),
          h('strong', { class: 'pacer-breath-count-value' }, String(pacerState.breathCount))
        ),
        h('div', { class: 'pacer-stat-item' },
          h('span', { class: 'pacer-stat-label' }, t('pacer.step3.statCadence', 'Pacing Cadence: ')),
          h('span', { class: 'pacer-second-counter' },
            pacerState.isBreathingActive
              ? t('pacer.step3.cadenceActive', 'Second {sec} of 5', { sec: pacerState.currentBreathSecond })
              : t('pacer.step3.cadenceReady', '1 breath every 5 seconds (12 / min)')
          )
        )
      ),
      h('div', { class: 'pacer-metronome-controls' },
        h('button', {
          type: 'button',
          class: `btn pacer-btn ${pacerState.isBreathingActive ? 'btn-secondary' : 'btn-primary'}`,
          onclick: () => {
            if (pacerState.isBreathingActive) {
              stopRescueBreathingTimer();
            } else {
              startRescueBreathingTimer();
            }
          },
        }, pacerState.isBreathingActive ? t('pacer.step3.btnPause', 'Pause Metronome') : t('pacer.step3.btnStart', 'Start Metronome')),
        h('button', {
          type: 'button',
          class: 'btn btn-outline pacer-btn',
          onclick: () => {
            pacerState.breathCount = 0;
            pacerState.currentBreathSecond = 0;
            pacerState.breathPhase = 'ready';
            notifySubscribers();
          },
        }, t('pacer.step3.btnReset', 'Reset Breath Count'))
      )
    ),
    // Clinical Callout: Fentanyl Wooden Chest Syndrome
    h('aside', { class: 'callout callout-warn alert-wooden-chest' },
      h('h4', { class: 'pacer-callout-title' }, icon('alert'), ' ', callout.title),
      h('p', { class: 'pacer-callout-warning' }, h('strong', null, t('pacer.label.warning', 'Warning: ')), callout.warning),
      h('p', { class: 'pacer-callout-action' }, h('strong', null, t('pacer.label.action', 'Immediate Action: ')), callout.action),
      h('p', { class: 'pacer-callout-ref' }, t('pacer.label.reference', 'Reference: '), callout.reference)
    ),
    h('div', { class: 'pacer-step-actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-secondary pacer-btn',
        onclick: () => setOverdosePacerStep(4),
      }, t('pacer.step3.advance', 'Check 2-to-3 Min Re-Dosing Clock (Step 4)')),
      h('button', {
        type: 'button',
        class: 'btn btn-success pacer-btn',
        onclick: () => recordSpontaneousBreathingResumed(),
      }, icon('check'), t('pacer.step3.resumed', 'Normal Breathing Resumed -> Step 5'))
    )
  );
  return card;
}

/**
 * Step 4: 2-to-3 Minute Re-Dosing Evaluation Clock
 */
function buildStep4RedosingClock(stepDef) {
  const callout = stepDef.clinicalCallout;

  const card = h('article', { class: 'pacer-step-card step-redosing-clock' },
    h('div', { class: 'pacer-step-heading-group' },
      h('span', { class: 'badge badge-primary' }, stepDef.badge),
      h('h3', { class: 'pacer-step-title' }, stepDef.title),
      h('p', { class: 'pacer-step-headline' }, stepDef.headline)
    ),
    // Re-Dosing Timer Box
    h('div', {
      class: 'timer pacer-clock-box',
      role: 'timer',
      'aria-live': 'assertive',
      'aria-label': t('pacer.step4.timerAria', 'Naloxone re-dosing countdown timer'),
    },
      h('div', { class: 'pacer-clock-digits-group' },
        h('span', { class: 'pacer-clock-label' }, getLang() === 'es' ? 'Revisar la respiración a los 2 minutos:' : '2-minute breathing check / re-dose evaluation:'),
        h('h3', { class: 'pacer-naloxone-countdown' }, formatTime(pacerState.naloxoneRemainingSeconds)),
        h('span', { class: 'pacer-clock-label' }, getLang() === 'es' ? 'Recordatorio del límite de 3 minutos de la etiqueta:' : '3-minute product-label reminder:'),
        h('p', { class: 'timer-display' }, formatTime(pacerState.reDoseRemainingSeconds)),
        h('p', { class: 'pacer-elapsed-display' },
          t('pacer.step4.elapsed', 'Elapsed since most recent dose: {time}', { time: formatTime(pacerState.reDoseElapsedSeconds) })
        )
      ),
      h('div', { class: 'pacer-alert-container' },
        pacerState.threeMinuteAlertTriggered
          ? h('div', { class: 'callout callout-danger', role: 'alert' },
              h('strong', null, t('pacer.step4.alert3minHeading', '3-Minute Mark Reached: ')),
              t('pacer.step4.alert3min', 'If breathing is still slow, shallow, or absent, give another dose with a new nasal spray in the other nostril, following the product label. Normal breathing can return before the person wakes up.')
            )
          : (pacerState.twoMinuteAlertTriggered
              ? h('div', { class: 'callout callout-warn', role: 'alert' },
                  h('strong', null, t('pacer.step4.alert2minHeading', '2-Minute Evaluation Mark: ')),
                  t('pacer.step4.alert2min', 'If breathing is still slow, shallow, or absent, give another dose with a new nasal spray in the other nostril, following the product’s 2–3 minute instructions. Continue breathing support or CPR as directed by 911.')
                )
              : h('p', { class: 'timer-live' },
                  t('pacer.step4.alertWait', 'Continue breathing support or CPR as directed by 911. Check breathing while waiting for the next dose evaluation.')
                ))
      ),
      h('div', { class: 'pacer-clock-controls' },
        h('button', {
          type: 'button',
          class: `btn pacer-btn ${pacerState.reDoseTimerActive ? 'btn-secondary' : 'btn-primary'}`,
          onclick: () => {
            if (pacerState.reDoseTimerActive) {
              stopReDoseTimer();
            } else {
              startReDoseTimer();
            }
          },
        }, pacerState.reDoseTimerActive ? t('pacer.step4.btnPause', 'Pause Clock') : t('pacer.step4.btnResume', 'Start / Resume Clock')),
        h('button', {
          type: 'button',
          class: 'btn btn-outline pacer-btn',
          onclick: () => {
            resetDoseClock();
            notifySubscribers();
          },
        }, t('pacer.step4.btnReset', 'Reset Clock to 3:00'))
      )
    ),
    // Second Dose Action Box
    h('div', { class: 'pacer-second-dose-box' },
      h('h4', null, t('pacer.step4.secondDoseTitle', 'Second Dose Administration (Opposite Nostril)')),
      pacerState.secondDoseAdministered
        ? h('div', { class: 'callout callout-success' },
            h('p', null, icon('check'), ' ', t('pacer.step4.secondDoseDone', 'Second dose recorded in {nostril} nostril. Keep checking breathing and follow 911 instructions. If breathing stays abnormal, repeat every 2–3 minutes as the label directs; reset the clock after each dose.', { nostril: (pacerState.secondDoseNostril === 'right' ? t('pacer.nostril.right', 'RIGHT') : t('pacer.nostril.left', 'LEFT')) }))
          )
        : h('button', {
            type: 'button',
            class: 'btn btn-emergency pacer-btn',
            onclick: () => recordSecondDose({ nostril: pacerState.secondDoseNostril }),
          }, icon('alert'), t('pacer.step4.secondDoseBtn', 'Administer Second 4mg Dose in OPPOSITE Nostril ({nostril} Nostril)', { nostril: (pacerState.secondDoseNostril === 'right' ? t('pacer.nostril.right', 'RIGHT') : t('pacer.nostril.left', 'LEFT')) }))
    ),
    // Clinical Callout: Xylazine Sedation Caution
    h('aside', { class: 'callout callout-danger alert-xylazine' },
      h('h4', { class: 'pacer-callout-title' }, icon('alert'), ' ', callout.title),
      h('p', { class: 'pacer-callout-warning' }, h('strong', null, t('pacer.label.caution', 'Caution: ')), callout.warning),
      h('p', { class: 'pacer-callout-goal' }, h('strong', null, t('pacer.label.endpoint', 'Clinical Endpoint: ')), callout.clinicalGoal),
      h('p', { class: 'pacer-callout-action' }, h('strong', null, t('pacer.label.action', 'Action: ')), callout.action),
      h('p', { class: 'pacer-callout-ref' }, t('pacer.label.reference', 'Reference: '), callout.reference)
    ),
    h('div', { class: 'pacer-step-actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-success pacer-btn',
        onclick: () => recordSpontaneousBreathingResumed(),
      }, icon('check'), t('pacer.step4.normalBreathing', 'Normal Breathing Resumed -> Proceed to Recovery Position (Step 5)')),
      h('button', {
        type: 'button',
        class: 'btn btn-secondary pacer-btn',
        onclick: () => setOverdosePacerStep(3),
      }, t('pacer.step4.returnBreathing', 'Return to Rescue Breathing Metronome'))
    )
  );
  return card;
}

/**
 * Step 5: Recovery Position & Post-Reversal Observation
 */
function buildStep5RecoveryPosition(stepDef) {
  const callout = stepDef.clinicalCallout;

  const card = h('article', { class: 'pacer-step-card step-recovery-position' },
    h('div', { class: 'pacer-step-heading-group' },
      h('span', { class: 'badge badge-success' }, stepDef.badge),
      h('h3', { class: 'pacer-step-title' }, stepDef.title),
      h('p', { class: 'pacer-step-headline' }, stepDef.headline)
    ),
    h('div', { class: 'callout callout-info' },
      h('p', null, h('strong', null, t('pacer.step5.airwayHeading', 'Airway Patentcy & Aspiration Prevention: ')), t('pacer.step5.airway', 'Once normal breathing resumes, place the person into the left lateral recumbent position to prevent the tongue from sliding back and prevent pulmonary aspiration of emesis.'))
    ),
    h('ol', { class: 'pacer-instruction-list pacer-recovery-steps' },
      ...stepDef.instructions.map((item) => h('li', null, item))
    ),
    // Clinical Callout: Renarconization Risk Warning
    h('aside', { class: 'callout callout-danger alert-renarconization' },
      h('h4', { class: 'pacer-callout-title' }, icon('alert'), ' ', callout.title),
      h('p', { class: 'pacer-callout-warning' }, h('strong', null, t('pacer.label.warning', 'Warning: ')), callout.warning),
      h('p', { class: 'pacer-callout-window' }, h('strong', null, t('pacer.label.reboundWindow', 'Rebound Window: ')), callout.reboundWindow),
      h('p', { class: 'pacer-callout-action' }, h('strong', null, t('pacer.label.mandate', 'Monitoring Mandate: ')), callout.action),
      h('p', { class: 'pacer-callout-ref' }, t('pacer.label.reference', 'Reference: '), callout.reference)
    ),
    h('div', { class: 'pacer-step-actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-primary pacer-btn',
        onclick: () => {
          pacerState.completed = true;
          notifySubscribers();
          if (typeof registeredOnComplete === 'function') {
            registeredOnComplete(getOverdosePacerState());
          }
        },
      }, icon('check'), t('pacer.step5.complete', 'Complete Rescue Protocol')),
      h('button', {
        type: 'button',
        class: 'btn btn-ghost pacer-btn',
        onclick: () => resetOverdosePacer(),
      }, t('pacer.step5.reset', 'Reset Assistant'))
    )
  );
  return card;
}
