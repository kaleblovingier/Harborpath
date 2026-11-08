/**
 * Privacy-First Client Telemetry & Analytics Dispatcher (public/js/telemetry.js)
 *
 * Sends privacy-safe aggregate interaction beacons to the HarborPath server:
 * - Strictly respects Do Not Track (DNT) / Global Privacy Control (GPC).
 * - Zero PII: Transmits only coarsened route IDs, emergency hotline IDs, language, and platform.
 * - Completely shut down when Quick Exit is invoked.
 * - Fire-and-forget delivery via navigator.sendBeacon or fetch with keepalive.
 */

import { getLang } from './i18n.js';
import { onQuickExit } from './state.js';

let telemetryDisabled = false;

// Instantly cease all telemetry if Quick Exit is triggered
onQuickExit(() => {
  telemetryDisabled = true;
});

/** Detect if client has active Do Not Track (DNT) or Global Privacy Control (GPC). */
export function isDntActive() {
  if (typeof navigator === 'undefined') return false;
  return (
    navigator.doNotTrack === '1' ||
    navigator.doNotTrack === 'yes' ||
    (typeof window !== 'undefined' && window.doNotTrack === '1') ||
    navigator.globalPrivacyControl === true
  );
}

/** Detect client device modality without collecting hardware identifiers. */
export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'desktop';
  if (navigator.standalone === true) return 'ios_pwa';
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return 'android_pwa';
  }
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')) {
    return 'mobile_web';
  }
  return 'desktop';
}

/** Safe fire-and-forget POST to telemetry endpoint. */
function sendBeacon(payload) {
  if (telemetryDisabled || isDntActive()) return;

  try {
    const data = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([data], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/telemetry/event', blob);
      if (sent) return;
    }
    if (typeof fetch === 'function') {
      fetch('/api/telemetry/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {
        // Silently drop errors: analytics must never disrupt user experience
      });
    }
  } catch {
    // Fail-safe silent catch
  }
}

/**
 * Record a route impression.
 * @param {string} routePath - The normalized route (e.g. 'overdose', 'tools', 'match')
 */
export function trackPageView(routePath) {
  sendBeacon({
    type: 'pageview',
    path: String(routePath || 'home').replace(/^#\/?/, '').split('?')[0] || 'home',
    lang: getLang(),
    platform: detectPlatform(),
  });
}

/**
 * Record an emergency hotline button click.
 * @param {string} hotlineId - Identifier (e.g. '988_suicide_crisis', '911_emergency', 'never_use_alone')
 */
export function trackHotlineClick(hotlineId) {
  sendBeacon({
    type: 'hotline',
    label: String(hotlineId || 'emergency'),
    lang: getLang(),
    platform: detectPlatform(),
  });
}

/**
 * Record a clinical decision tool interaction.
 * @param {string} toolId - Tool identifier (e.g. 'asam_assessment', 'overdose_pacer')
 */
export function trackToolInteraction(toolId) {
  sendBeacon({
    type: 'tool',
    label: String(toolId || 'tool'),
    lang: getLang(),
    platform: detectPlatform(),
  });
}

export function disableTelemetry() {
  telemetryDisabled = true;
}
