/**
 * Evidence-Based Overdose Rescue Pacing Assistant
 *
 * Real-time clinical decision support and interactive rescue pacing tool for opioid
 * overdose emergencies. Guides responders through responsiveness check, naloxone
 * administration, metronomic rescue breathing pacing (1 breath every 5s / 12 breaths/min),
 * real-time 2-to-3 minute re-dosing countdown evaluation, and recovery position placement.
 *
 * Clinical sources:
 * - SAMHSA Overdose Prevention and Response Toolkit (2023)
 * - American Heart Association (AHA) CPR & ECC Opioid Emergency Guidelines
 * - CDC Overdose Prevention Guidelines & Xylazine Guidance (2024)
 * - American College of Medical Toxicology (ACMT) Toxicologic Guidance
 */

import { h, announce, icon, tel, clear } from '../dom.js';
import {
  WOODEN_CHEST_SYNDROME,
  RENARCONIZATION_RISK,
  XYLAZINE_SEDATION_MANAGEMENT,
  REVERSAL_FORMULATIONS,
} from '../content/reversalFormulations.js';

/**
 * Five-Step Rescue Protocol Schema and Clinical Content
 */
export const RESCUE_PACING_STEPS = [
  {
    step: 1,
    id: 'responsiveness',
    title: 'Sternal Rub & Responsiveness Check',
    subtitle: 'Evaluate responsiveness and respiratory status',
    badge: 'Step 1 of 5',
    headline: 'No response to shouting or firm rub on breastbone',
    instructions: [
      'Shout loudly into both ears: "Can you hear me? Wake up!"',
      'Make a firm fist and grind your knuckles hard up and down their breastbone (sternum) for 5 to 10 seconds.',
      'Check for cardinal signs of opioid overdose: unresponsive to physical pain, slow or stopped breathing, gurgling or choking sounds ("death rattle"), pinpoint pupils, limp muscles, or blue, purple, or gray lips and nail beds.',
      'Call 911 immediately. Put your phone on speakerphone and place it beside you so dispatchers can coach you while your hands remain free.',
    ],
    actionPrompt: 'If the person does not respond or is breathing abnormally, immediately administer naloxone.',
    clinicalNote: 'Naloxone causes zero harm if opioids are absent. If you are unsure whether opioids were taken, always administer naloxone immediately.',
  },
  {
    step: 2,
    id: 'first_dose',
    title: 'First Naloxone Administration',
    subtitle: 'Administer initial reversal dose immediately',
    badge: 'Step 2 of 5',
    headline: '4mg nasal spray in 1 nostril, or 0.4mg IM injection',
    formulations: {
      nasal: {
        dose: '4 mg in 0.1 mL',
        route: 'Intranasal (IN)',
        device: 'Single-dose needle-free spray (Narcan / OTC generic)',
        instructions: [
          'Peel open the blister package and remove the single-dose device.',
          'Hold the device with your thumb on the bottom plunger and your index and middle fingers on the nozzle collar. Do NOT test-spray or prime.',
          'Tilt the person’s head gently backward to open the nasal passage.',
          'Insert the nozzle tip fully into ONE nostril until your fingers touch the base of their nose.',
          'Press the plunger firmly with your thumb until it clicks to deliver the entire 4mg dose.',
        ],
      },
      injectable: {
        dose: '0.4 mg / 1 mL',
        route: 'Intramuscular (IM)',
        device: 'Vial with syringe or auto-injector',
        instructions: [
          'Draw 1 mL (0.4 mg) of solution into the syringe.',
          'Inject at a 90-degree angle into the muscle of the outer thigh or upper arm (can inject straight through clothing if necessary).',
          'Push plunger down completely and withdraw the needle carefully.',
        ],
      },
    },
    timingNote: 'Naloxone takes 2 to 3 minutes to absorb across the nasal mucosa and displace opioids from mu-opioid receptors. Start the 2-to-3 minute evaluation clock immediately upon dose administration.',
  },
  {
    step: 3,
    id: 'rescue_breathing',
    title: 'Rescue Breathing Metronome',
    subtitle: 'Rhythmic visual pacing at 1 breath every 5 seconds',
    badge: 'Step 3 of 5',
    headline: '1 breath every 5 seconds (12 breaths/minute)',
    rhythmSeconds: 5,
    targetBreathsPerMin: 12,
    instructions: [
      'Position airway: Tilt head back gently and lift chin (head-tilt / chin-lift maneuver) to prevent tongue from blocking the throat.',
      'Pinch the person’s nose shut firmly with your thumb and forefinger.',
      'Make an airtight seal with your mouth completely covering theirs.',
      'Deliver 1 slow, steady breath over 1 second. Watch the chest rise visibly.',
      'Release the seal and allow 4 seconds for passive exhalation.',
      'Follow the metronome pacing: Deliver exactly 1 breath every 5 seconds (12 breaths per minute). Continue until spontaneous breathing resumes or EMS arrives.',
    ],
    clinicalCallout: {
      type: 'wooden_chest_syndrome',
      title: WOODEN_CHEST_SYNDROME.title,
      mechanism: WOODEN_CHEST_SYNDROME.pathophysiology.mechanism,
      glotticClosure: WOODEN_CHEST_SYNDROME.pathophysiology.glotticInvolvement,
      warning: 'CRITICAL ALERT: Fentanyl "Wooden Chest Syndrome" (Thoracic Rigidity & Laryngospasm). If the chest wall feels rigid and board-like, or positive-pressure breaths cannot be delivered despite an airtight seal, synthetic fentanyl has induced acute thoracic muscle rigidity and vocal cord closure.',
      action: 'Do NOT struggle or delay with rescue breathing alone. Immediately administer a repeat dose of naloxone (within 60–90 seconds) to displace high central receptor occupancy, and explicitly notify 911 ALS that the patient has wooden chest syndrome requiring rapid sequence endotracheal intubation (RSI) and neuromuscular blockade.',
      reference: 'ACMT / AHA Opioid Emergency Guidelines',
    },
  },
  {
    step: 4,
    id: 'redosing_clock',
    title: '2-to-3 Minute Re-Dosing Evaluation Clock',
    subtitle: 'Real-time countdown tracking time since first dose',
    badge: 'Step 4 of 5',
    headline: 'Evaluate breathing at 2 min & 3 min; re-dose in opposite nostril if unresponsive',
    evaluationPoints: [
      {
        minute: 2,
        seconds: 120,
        label: '2-Minute Evaluation Mark',
        instruction: 'Check breathing effort now. Has the person resumed spontaneous, normal breathing (at least 10–12 breaths per minute with good chest rise)?',
      },
      {
        minute: 3,
        seconds: 180,
        label: '3-Minute Re-Dosing Threshold',
        instruction: 'If the person is still unresponsive or breathing remains slow/shallow (<10 breaths/min), administer a SECOND DOSE of naloxone immediately in the OPPOSITE nostril, and continue rescue breathing.',
      },
    ],
    clinicalCallout: {
      type: 'xylazine_sedation',
      title: XYLAZINE_SEDATION_MANAGEMENT.title,
      warning: 'CRITICAL WARNING: DO NOT DUMP REPEATED NALOXONE FOR XYLAZINE SEDATION. Xylazine ("tranq") is an alpha-2 adrenergic agonist, NOT an opioid. Naloxone has zero affinity for alpha-2 receptors and CANNOT wake someone from xylazine sedation.',
      clinicalGoal: 'The clinical endpoint of naloxone is restoring adequate spontaneous respiration (>=10–12 breaths/minute)—NOT waking the person up into full alertness or withdrawal. If the person has resumed normal spontaneous breathing but remains sedated, STOP giving naloxone. Giving repeated unnecessary doses ("naloxone dumping") will NOT wake them up; it precipitates explosive acute opioid withdrawal, intractable vomiting, and fatal pulmonary aspiration in a sedated patient.',
      action: 'Keep the patient warm with blankets (xylazine causes severe hypothermia), monitor respirations continuously, and roll them into the recovery position once breathing normally.',
      reference: 'CDC / ACMT Xylazine Guidelines',
    },
  },
  {
    step: 5,
    id: 'recovery_position',
    title: 'Recovery Position & Post-Reversal Observation',
    subtitle: 'Left lateral recumbent positioning and observation protocol',
    badge: 'Step 5 of 5',
    headline: 'Left lateral recumbent position to maintain patent airway and prevent aspiration',
    instructions: [
      'Roll the person onto their LEFT side (Left Lateral Recumbent Position).',
      'Bend their top knee forward at a 90-degree angle to prop the body and prevent them from rolling onto their stomach.',
      'Place their top hand under their cheek to keep the neck extended and maintain an open airway.',
      'Tilt their face and mouth slightly downward toward the floor so any vomit, saliva, or fluids drain freely without obstructing the trachea.',
      'Continuously monitor breathing rate and chest rise every 1 to 2 minutes until paramedics arrive.',
    ],
    clinicalCallout: {
      type: 'renarconization_risk',
      title: RENARCONIZATION_RISK.title,
      mechanism: RENARCONIZATION_RISK.pathophysiology.mechanism,
      reboundWindow: '30–90 minutes (up to 2–4+ hours for synthetic fentanyl analogues or methadone)',
      warning: 'CRITICAL ALERT: Renarconization Risk (Secondary Opioid Resurgence). Naloxone has a short elimination half-life of 30 to 90 minutes. Lipophilic synthetic fentanyl and high-potency analogues store in body fat and slowly redistribute back into circulation for hours. As naloxone clears, secondary opioid overdose and fatal respiratory depression can recur.',
      action: 'Observe the patient continuously for a MINIMUM of 2 to 4 hours post-reversal. Never allow them to leave unaccompanied. Strongly warn the person that taking additional opioids to relieve withdrawal symptoms will cause rapid, fatal overdose once naloxone wears off.',
      reference: 'SAMHSA / ACEP Post-Reversal Observation Guidelines',
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
    currentStep: 1,
    isBreathingActive: false,
    breathCount: 0,
    breathPhase: 'ready', // 'ready' | 'inhale' | 'pause'
    breathCycleSeconds: 5,
    currentBreathSecond: 0, // 0..5

    firstDoseAdministered: false,
    firstDoseTimestamp: null,
    firstDoseRoute: 'nasal_4mg', // 'nasal_4mg' | 'im_0_4mg'
    firstDoseNostril: 'right', // 'right' | 'left'

    reDoseTimerActive: false,
    reDoseElapsedSeconds: 0,
    reDoseRemainingSeconds: 180, // Total 180s (3:00)
    twoMinuteAlertTriggered: false,
    threeMinuteAlertTriggered: false,
    evaluationAlert: null, // null | '2min_evaluate' | '3min_redose_prompt'

    secondDoseAdministered: false,
    secondDoseTimestamp: null,
    secondDoseRoute: 'nasal_4mg',
    secondDoseNostril: 'left',

    spontaneousBreathingResumed: false,
    reducedMotion: prefersReduced,
    completed: false,
  };
}

let pacerState = getInitialPacerState();
let breathingIntervalId = null;
let reDoseIntervalId = null;
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
  pacerState.isBreathingActive = true;
  if (pacerState.currentBreathSecond === 0) {
    pacerState.currentBreathSecond = 1;
    pacerState.breathPhase = 'inhale';
    pacerState.breathCount += 1;
    try { navigator?.vibrate?.([150]); } catch {}
    try { announce('Rescue breathing started: Inhale 1 breath now.'); } catch {}
    if (typeof onBreath === 'function') onBreath(pacerState.breathCount);
  }
  notifySubscribers();

  breathingIntervalId = setInterval(() => {
    tickRescueBreathingStep(options);
  }, 1000);

  return getOverdosePacerState();
}

/**
 * Deterministically ticks the rescue breathing metronome (useful for tests or stepping).
 */
export function tickRescueBreathing(stepCount = 1, options = {}) {
  const steps = Math.max(1, Math.floor(Number(stepCount) || 1));
  for (let i = 0; i < steps; i++) {
    tickRescueBreathingStep(options);
  }
  return getOverdosePacerState();
}

function tickRescueBreathingStep(options = {}) {
  const merged = { ...activeBreathingOptions, ...options };
  const { onTick, onBreath } = merged;
  pacerState.currentBreathSecond = (pacerState.currentBreathSecond % 5) + 1;
  if (pacerState.currentBreathSecond === 1) {
    pacerState.breathCount += 1;
    pacerState.breathPhase = 'inhale';
    try { navigator?.vibrate?.([150]); } catch {}
    try { announce(`Breath ${pacerState.breathCount}: Deliver 1 breath now.`); } catch {}
    if (typeof onBreath === 'function') onBreath(pacerState.breathCount);
  } else {
    pacerState.breathPhase = 'pause';
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
  pacerState.isBreathingActive = false;
  pacerState.breathPhase = 'ready';
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
  pacerState.reDoseTimerActive = true;
  if (!pacerState.firstDoseTimestamp) {
    pacerState.firstDoseTimestamp = Date.now();
  }
  notifySubscribers();

  reDoseIntervalId = setInterval(() => {
    tickReDoseTimerStep(options);
  }, 1000);

  return getOverdosePacerState();
}

/**
 * Deterministically ticks the re-dose countdown clock.
 */
export function tickReDoseTimer(seconds = 1, options = {}) {
  const s = Math.max(1, Math.floor(Number(seconds) || 1));
  for (let i = 0; i < s; i++) {
    tickReDoseTimerStep(options);
  }
  return getOverdosePacerState();
}

function tickReDoseTimerStep(options = {}) {
  const merged = { ...activeReDoseOptions, ...options };
  const { onTick, onAlert } = merged;
  pacerState.reDoseElapsedSeconds += 1;
  pacerState.reDoseRemainingSeconds = Math.max(0, 180 - pacerState.reDoseElapsedSeconds);

  // 2-Minute Mark Evaluation (120 seconds)
  if (pacerState.reDoseElapsedSeconds >= 120 && !pacerState.twoMinuteAlertTriggered) {
    pacerState.twoMinuteAlertTriggered = true;
    pacerState.evaluationAlert = '2min_evaluate';
    try {
      announce('Two minutes elapsed since first dose. Evaluate breathing now: Has spontaneous normal breathing resumed?');
    } catch {}
    try { navigator?.vibrate?.([200, 100, 200]); } catch {}
    if (typeof onAlert === 'function') onAlert('2min_evaluate', getOverdosePacerState());
  }

  // 3-Minute Re-Dosing Threshold (180 seconds)
  if (pacerState.reDoseElapsedSeconds >= 180 && !pacerState.threeMinuteAlertTriggered) {
    pacerState.threeMinuteAlertTriggered = true;
    pacerState.evaluationAlert = '3min_redose_prompt';
    try {
      announce('Three minutes reached. If still unresponsive or shallow breathing, administer second naloxone dose in opposite nostril now.');
    } catch {}
    try { navigator?.vibrate?.([300, 150, 300, 150, 300]); } catch {}
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
  pacerState.reDoseTimerActive = false;
  notifySubscribers();
  return getOverdosePacerState();
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
  notifySubscribers();
  return getOverdosePacerState();
}

/**
 * Records that spontaneous breathing has resumed and navigates to Recovery Position (Step 5).
 */
export function recordSpontaneousBreathingResumed() {
  pacerState.spontaneousBreathingResumed = true;
  pacerState.currentStep = 5;
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
    'aria-label': 'Overdose Rescue Pacing Assistant',
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
    'aria-label': 'Rescue pacing steps',
  });

  // Main step view container
  const stepContainer = h('div', {
    class: 'pacer-step-container',
  });

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
          phaseLabel.textContent = 'BREATHE NOW: Deliver 1 full breath over 1 second';
        } else if (stateSnapshot.isBreathingActive) {
          phaseLabel.textContent = `Wait (Second ${stateSnapshot.currentBreathSecond} of 5) — chest falls passively`;
        } else {
          phaseLabel.textContent = 'Metronome Paused — Press "Start Metronome" below';
        }
      }
      if (breathCounter) {
        breathCounter.textContent = String(stateSnapshot.breathCount);
      }
      if (secondCounter) {
        secondCounter.textContent = stateSnapshot.isBreathingActive
          ? `Second ${stateSnapshot.currentBreathSecond} of 5`
          : 'Ready (5-second cadence)';
      }
    }

    // Step 4 reactive clock updates
    if (stateSnapshot.currentStep === 4) {
      const display = stepContainer.querySelector('.timer-display');
      const elapsed = stepContainer.querySelector('.pacer-elapsed-display');
      const alertArea = stepContainer.querySelector('.pacer-alert-container');

      if (display) {
        display.textContent = formatTime(stateSnapshot.reDoseRemainingSeconds);
      }
      if (elapsed) {
        elapsed.textContent = `Elapsed since 1st dose: ${formatTime(stateSnapshot.reDoseElapsedSeconds)}`;
      }
      if (alertArea) {
        clear(alertArea);
        if (stateSnapshot.threeMinuteAlertTriggered) {
          alertArea.append(
            h('div', { class: 'callout callout-danger', role: 'alert' },
              h('strong', null, '3-Minute Mark Reached: '),
              'If the person is still unresponsive or breathing shallowly, administer SECOND DOSE in OPPOSITE nostril immediately!'
            )
          );
        } else if (stateSnapshot.twoMinuteAlertTriggered) {
          alertArea.append(
            h('div', { class: 'callout callout-warn', role: 'alert' },
              h('strong', null, '2-Minute Evaluation Mark: '),
              'Evaluate breathing effort now. Has spontaneous normal breathing (>10–12 breaths/min) resumed?'
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
      h('h2', { class: 'pacer-main-heading' }, 'Overdose Rescue Pacing Assistant')
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
      }, pacerState.reducedMotion ? 'Enable Pulsing Motion' : 'Reduced Motion Mode'),
      h('button', {
        type: 'button',
        class: 'btn btn-ghost pacer-btn pacer-reset-btn',
        onclick: () => {
          resetOverdosePacer();
          renderAll();
        },
      }, 'Reset Assistant')
    )
  );

  root.append(liveAnnouncer, header, navContainer, stepContainer);
  renderAll();
  return root;
}

/**
 * Step 1: Sternal Rub & Responsiveness Check
 */
function buildStep1Responsiveness(stepDef) {
  const card = h('article', { class: 'pacer-step-card step-responsiveness' },
    h('div', { class: 'pacer-step-heading-group' },
      h('span', { class: 'badge badge-danger' }, stepDef.badge),
      h('h3', { class: 'pacer-step-title' }, stepDef.title),
      h('p', { class: 'pacer-step-headline' }, stepDef.headline)
    ),
    h('div', { class: 'callout callout-warn' },
      h('p', null, h('strong', null, 'First action: '), 'Shout loudly and rub their breastbone firmly with your knuckles. Look for signs of critical overdose:')
    ),
    h('ul', { class: 'pacer-instruction-list' },
      ...stepDef.instructions.map((item) => h('li', null, item))
    ),
    h('div', { class: 'pacer-emergency-call-row' },
      tel('911', [icon('phone'), 'Call 911 Immediately'], { class: 'btn btn-emergency pacer-btn' }),
      h('p', { class: 'pacer-note' }, 'Keep 911 on speakerphone while delivering care.')
    ),
    h('div', { class: 'pacer-step-actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-primary pacer-btn',
        onclick: () => setOverdosePacerStep(2),
      }, icon('chevron-right'), 'Victim Unresponsive — Proceed to Naloxone (Step 2)')
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
      h('h4', null, 'Route 1: 4mg Nasal Spray (Narcan / OTC Generic) — Recommended'),
      h('ul', { class: 'pacer-instruction-list' },
        ...stepDef.formulations.nasal.instructions.map((ins) => h('li', null, ins))
      )
    ),
    h('div', { class: 'pacer-nostril-selector-box' },
      h('label', { class: 'pacer-label-bold', id: 'nostril-select-label' }, 'Selected Nostril for 1st Dose:'),
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
        }, 'Right Nostril (Standard)'),
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
        }, 'Left Nostril')
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
          startRescueBreathingTimer();
        },
      }, icon('check'), 'Administer 1st Dose & Start Timers (Proceed to Step 3)')
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
      'aria-label': 'Rescue breathing rhythm: 1 breath every 5 seconds',
    },
      h('div', {
        class: `pacer-guide pacer-${pacerState.breathPhase}`,
      },
        h('div', { class: 'pacer-circle', 'aria-hidden': 'true' }),
        h('div', { class: 'pacer-phase-label' },
          pacerState.breathPhase === 'inhale'
            ? 'BREATHE NOW: Deliver 1 full breath over 1 second'
            : (pacerState.isBreathingActive
              ? `Wait (Second ${pacerState.currentBreathSecond} of 5) — chest falls passively`
              : 'Metronome Paused — Press "Start Metronome" below')
        )
      ),
      h('div', { class: 'pacer-metronome-stats' },
        h('div', { class: 'pacer-stat-item' },
          h('span', { class: 'pacer-stat-label' }, 'Breaths Delivered: '),
          h('strong', { class: 'pacer-breath-count-value' }, String(pacerState.breathCount))
        ),
        h('div', { class: 'pacer-stat-item' },
          h('span', { class: 'pacer-stat-label' }, 'Pacing Cadence: '),
          h('span', { class: 'pacer-second-counter' },
            pacerState.isBreathingActive
              ? `Second ${pacerState.currentBreathSecond} of 5`
              : '1 breath every 5 seconds (12 / min)'
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
        }, pacerState.isBreathingActive ? 'Pause Metronome' : 'Start Metronome'),
        h('button', {
          type: 'button',
          class: 'btn btn-outline pacer-btn',
          onclick: () => {
            pacerState.breathCount = 0;
            pacerState.currentBreathSecond = 0;
            pacerState.breathPhase = 'ready';
            notifySubscribers();
          },
        }, 'Reset Breath Count')
      )
    ),
    // Clinical Callout: Fentanyl Wooden Chest Syndrome
    h('aside', { class: 'callout callout-warn alert-wooden-chest' },
      h('h4', { class: 'pacer-callout-title' }, icon('alert'), ' ', callout.title),
      h('p', { class: 'pacer-callout-warning' }, h('strong', null, 'Warning: '), callout.warning),
      h('p', { class: 'pacer-callout-action' }, h('strong', null, 'Immediate Action: '), callout.action),
      h('p', { class: 'pacer-callout-ref' }, 'Reference: ', callout.reference)
    ),
    h('div', { class: 'pacer-step-actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-secondary pacer-btn',
        onclick: () => setOverdosePacerStep(4),
      }, 'Check 2-to-3 Min Re-Dosing Clock (Step 4)'),
      h('button', {
        type: 'button',
        class: 'btn btn-success pacer-btn',
        onclick: () => recordSpontaneousBreathingResumed(),
      }, icon('check'), 'Victim Resumed Normal Breathing -> Step 5')
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
      'aria-label': 'Naloxone re-dosing countdown timer',
    },
      h('div', { class: 'pacer-clock-digits-group' },
        h('span', { class: 'pacer-clock-label' }, 'Countdown to Re-Dosing Evaluation:'),
        h('p', { class: 'timer-display' }, formatTime(pacerState.reDoseRemainingSeconds)),
        h('p', { class: 'pacer-elapsed-display' },
          `Elapsed since 1st dose: ${formatTime(pacerState.reDoseElapsedSeconds)}`
        )
      ),
      h('div', { class: 'pacer-alert-container' },
        pacerState.threeMinuteAlertTriggered
          ? h('div', { class: 'callout callout-danger', role: 'alert' },
              h('strong', null, '3-Minute Mark Reached: '),
              'If the person is still unresponsive or breathing shallowly, administer SECOND DOSE in OPPOSITE nostril immediately!'
            )
          : (pacerState.twoMinuteAlertTriggered
              ? h('div', { class: 'callout callout-warn', role: 'alert' },
                  h('strong', null, '2-Minute Evaluation Mark: '),
                  'Evaluate breathing effort now. Has spontaneous normal breathing (>10–12 breaths/min) resumed?'
                )
              : h('p', { class: 'timer-live' },
                  'Waiting for mucosal absorption. Continue 1 rescue breath every 5 seconds.'
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
        }, pacerState.reDoseTimerActive ? 'Pause Clock' : 'Start / Resume Clock'),
        h('button', {
          type: 'button',
          class: 'btn btn-outline pacer-btn',
          onclick: () => {
            pacerState.reDoseElapsedSeconds = 0;
            pacerState.reDoseRemainingSeconds = 180;
            pacerState.twoMinuteAlertTriggered = false;
            pacerState.threeMinuteAlertTriggered = false;
            pacerState.evaluationAlert = null;
            notifySubscribers();
          },
        }, 'Reset Clock to 3:00')
      )
    ),
    // Second Dose Action Box
    h('div', { class: 'pacer-second-dose-box' },
      h('h4', null, 'Second Dose Administration (Opposite Nostril)'),
      pacerState.secondDoseAdministered
        ? h('div', { class: 'callout callout-success' },
            h('p', null, icon('check'), ` Second dose administered in ${pacerState.secondDoseNostril.toUpperCase()} nostril. Continue rescue breaths until normal breathing resumes.`)
          )
        : h('button', {
            type: 'button',
            class: 'btn btn-emergency pacer-btn',
            onclick: () => recordSecondDose({ nostril: pacerState.secondDoseNostril }),
          }, icon('alert'), `Administer Second 4mg Dose in OPPOSITE Nostril (${pacerState.secondDoseNostril.toUpperCase()} Nostril)`)
    ),
    // Clinical Callout: Xylazine Sedation Caution
    h('aside', { class: 'callout callout-danger alert-xylazine' },
      h('h4', { class: 'pacer-callout-title' }, icon('alert'), ' ', callout.title),
      h('p', { class: 'pacer-callout-warning' }, h('strong', null, 'Caution: '), callout.warning),
      h('p', { class: 'pacer-callout-goal' }, h('strong', null, 'Clinical Endpoint: '), callout.clinicalGoal),
      h('p', { class: 'pacer-callout-action' }, h('strong', null, 'Action: '), callout.action),
      h('p', { class: 'pacer-callout-ref' }, 'Reference: ', callout.reference)
    ),
    h('div', { class: 'pacer-step-actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-success pacer-btn',
        onclick: () => recordSpontaneousBreathingResumed(),
      }, icon('check'), 'Normal Breathing Resumed -> Proceed to Recovery Position (Step 5)'),
      h('button', {
        type: 'button',
        class: 'btn btn-secondary pacer-btn',
        onclick: () => setOverdosePacerStep(3),
      }, 'Return to Rescue Breathing Metronome')
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
      h('p', null, h('strong', null, 'Airway Patentcy & Aspiration Prevention: '), 'Once normal breathing resumes, place the person into the left lateral recumbent position to prevent the tongue from sliding back and prevent pulmonary aspiration of emesis.')
    ),
    h('ol', { class: 'pacer-instruction-list pacer-recovery-steps' },
      ...stepDef.instructions.map((item) => h('li', null, item))
    ),
    // Clinical Callout: Renarconization Risk Warning
    h('aside', { class: 'callout callout-danger alert-renarconization' },
      h('h4', { class: 'pacer-callout-title' }, icon('alert'), ' ', callout.title),
      h('p', { class: 'pacer-callout-warning' }, h('strong', null, 'Warning: '), callout.warning),
      h('p', { class: 'pacer-callout-window' }, h('strong', null, 'Rebound Window: '), callout.reboundWindow),
      h('p', { class: 'pacer-callout-action' }, h('strong', null, 'Monitoring Mandate: '), callout.action),
      h('p', { class: 'pacer-callout-ref' }, 'Reference: ', callout.reference)
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
      }, icon('check'), 'Complete Rescue Protocol'),
      h('button', {
        type: 'button',
        class: 'btn btn-ghost pacer-btn',
        onclick: () => resetOverdosePacer(),
      }, 'Reset Assistant')
    )
  );
  return card;
}
