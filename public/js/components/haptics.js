/**
 * HarborPath Mobile Haptics & Tactile Feedback (public/js/components/haptics.js)
 *
 * Provides tactile vibration feedback for emergency overdose response,
 * rescue breathing intervals (every 5 seconds), and CPR pacing.
 *
 * Invariant:
 * - Safe for all browsers and headless testing (gracefully degrades to no-op).
 * - Zero external dependencies.
 * - Zero storage, zero tracking.
 */

/** Check if Web Vibration API is supported in current context. */
export function isHapticsSupported() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** Trigger a single haptic pulse of specified duration in milliseconds. */
export function hapticPulse(durationMs = 40) {
  if (!isHapticsSupported()) return false;
  try {
    return navigator.vibrate(Math.max(10, Math.min(durationMs, 500)));
  } catch {
    return false;
  }
}

/** Trigger a custom vibration pattern (e.g. [vibrate, pause, vibrate]). */
export function hapticPattern(pattern = [40, 60, 40]) {
  if (!isHapticsSupported() || !Array.isArray(pattern)) return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

/** Stop any ongoing vibration sequence immediately. */
export function hapticCancel() {
  if (!isHapticsSupported()) return false;
  try {
    return navigator.vibrate(0);
  } catch {
    return false;
  }
}

/**
 * Tactile heartbeat cue for rescue breathing and CPR pacing.
 * Emits a distinct double-pulse to assist rescuers in high-stress situations.
 */
export function hapticOverdoseBeat() {
  return hapticPattern([50, 70, 50]);
}
