/**
 * Deterministic, side-effect-free rescue timer state. Seconds are supplied by
 * the caller, allowing delayed browser callbacks to catch up without storing
 * patient information or relying on the system wall clock.
 *
 * The first breathing check is at 120 seconds; the existing 180-second upper
 * label reminder remains separate. FDA NARCAN instructions: repeat every
 * 2–3 minutes when indicated, while seeking emergency care.
 * https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/208411Orig1s002lbl.pdf
 * Adult rescue-breath cadence (when trained / directed by 911): CDC xylazine
 * guidance, https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html
 */
export const NALOXONE_REDOSE_SECONDS = 120;
export const RESCUE_BREATH_SECONDS = 5;
export const NALOXONE_LABEL_REMINDER_SECONDS = 180;

export function createOverdoseResilienceState() {
  return {
    isBreathingActive: false,
    breathCount: 0,
    breathPhase: 'ready',
    breathCycleSeconds: RESCUE_BREATH_SECONDS,
    currentBreathSecond: 0,
    reDoseTimerActive: false,
    reDoseElapsedSeconds: 0,
    naloxoneRemainingSeconds: NALOXONE_REDOSE_SECONDS,
    reDoseRemainingSeconds: NALOXONE_LABEL_REMINDER_SECONDS,
    twoMinuteAlertTriggered: false,
    threeMinuteAlertTriggered: false,
    evaluationAlert: null,
    spontaneousBreathingResumed: false,
  };
}

/** Each transition returns a fresh state; no timers, storage or DOM access. */
export function transitionOverdoseResilience(state, event = {}) {
  const next = { ...state };
  const rawSeconds = Number(event.seconds ?? 1);
  const seconds = Number.isFinite(rawSeconds) ? Math.max(0, Math.floor(rawSeconds)) : 0;
  switch (event.type) {
    case 'START_BREATHING':
      if (next.spontaneousBreathingResumed) break;
      next.isBreathingActive = true;
      if (next.currentBreathSecond === 0) {
        next.currentBreathSecond = 1;
        next.breathPhase = 'inhale';
        next.breathCount += 1;
      }
      break;
    case 'BREATH_TICK': {
      if (!next.isBreathingActive || next.spontaneousBreathingResumed || !seconds) break;
      const elapsed = next.currentBreathSecond - 1 + seconds;
      next.breathCount += Math.floor(elapsed / RESCUE_BREATH_SECONDS);
      next.currentBreathSecond = (elapsed % RESCUE_BREATH_SECONDS) + 1;
      next.breathPhase = next.currentBreathSecond === 1 ? 'inhale' : 'pause';
      break;
    }
    case 'STOP_BREATHING':
      next.isBreathingActive = false;
      next.breathPhase = 'ready';
      break;
    case 'RESET_DOSE_CLOCK':
      next.reDoseElapsedSeconds = 0;
      next.naloxoneRemainingSeconds = NALOXONE_REDOSE_SECONDS;
      next.reDoseRemainingSeconds = NALOXONE_LABEL_REMINDER_SECONDS;
      next.twoMinuteAlertTriggered = false;
      next.threeMinuteAlertTriggered = false;
      next.evaluationAlert = null;
      next.spontaneousBreathingResumed = false;
      break;
    case 'START_DOSE_CLOCK':
      if (!next.spontaneousBreathingResumed) next.reDoseTimerActive = true;
      break;
    case 'DOSE_TICK':
      if (!next.reDoseTimerActive || next.spontaneousBreathingResumed || !seconds) break;
      next.reDoseElapsedSeconds += seconds;
      next.naloxoneRemainingSeconds = Math.max(0, NALOXONE_REDOSE_SECONDS - next.reDoseElapsedSeconds);
      next.reDoseRemainingSeconds = Math.max(0, NALOXONE_LABEL_REMINDER_SECONDS - next.reDoseElapsedSeconds);
      if (next.reDoseElapsedSeconds >= NALOXONE_REDOSE_SECONDS) {
        next.twoMinuteAlertTriggered = true;
        next.evaluationAlert = '2min_evaluate';
      }
      if (next.reDoseElapsedSeconds >= NALOXONE_LABEL_REMINDER_SECONDS) {
        next.threeMinuteAlertTriggered = true;
        next.evaluationAlert = '3min_redose_prompt';
      }
      break;
    case 'STOP_DOSE_CLOCK':
      next.reDoseTimerActive = false;
      break;
    case 'RECOVER':
      next.spontaneousBreathingResumed = true;
      next.isBreathingActive = false;
      next.breathPhase = 'ready';
      next.reDoseTimerActive = false;
      next.currentStep = 5;
      break;
  }
  return next;
}
