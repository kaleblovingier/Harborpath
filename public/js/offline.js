// Opt-in offline copy. A service worker (/sw.js) keeps the app on this device
// so the overdose steps and support lines open without signal. It is never
// registered unless the visitor asks, because a saved copy on a shared device
// would show that someone visited. Quick exit removes it (see wipeOfflineCopy).
//
// The worker stores only the app's own files, never /api/ responses, so no
// location or search is ever kept.

// When the visitor is offline and tries a live search, the worker answers
// /api/ requests with a short "you're offline, call these numbers" message in
// the interface language (it never stores the requests or the answers).
//
// Updates: the browser re-checks /sw.js on each page load. A new deploy that
// bumps VERSION in /sw.js saves a complete new copy and deletes the old one.

import { getLang, onLanguageChange } from './i18n.js';

// Must match CACHE_PREFIX in /sw.js.
export const CACHE_PREFIX = 'harborpath-offline';

const sw = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined;
let registration = null;

export const offlineSupported = () => Boolean(sw && globalThis.caches && globalThis.isSecureContext);

function tellLanguage() {
  try { sw?.controller?.postMessage({ type: 'lang', lang: getLang() }); } catch { /* ignore */ }
}

// Remember an existing registration, so quick exit can reach its worker
// synchronously even when this page is not controlled by it.
const known = offlineSupported()
  ? sw.getRegistration('/').then((r) => {
    registration = r ?? null;
    if (registration) {
      // Look for a new version now as well, so a long-open tab still updates.
      registration.update?.().catch(() => {});
      tellLanguage();
      onLanguageChange(tellLanguage);
      sw.addEventListener('controllerchange', tellLanguage);
    }
    return registration;
  }).catch(() => null)
  : Promise.resolve(null);

/** True when an offline copy is saved on this device. */
export async function isOfflineSaved() {
  const reg = await known;
  if (!reg?.active) return false;
  return (await caches.keys()).some((k) => k.startsWith(CACHE_PREFIX));
}

/** Register the worker and wait until it has saved the app. */
export async function saveOffline() {
  registration = await sw.register('/sw.js', { scope: '/', updateViaCache: 'none' });
  const worker = registration.installing || registration.waiting || registration.active;
  if (!worker) throw new Error('Service worker did not start');
  onLanguageChange(tellLanguage);
  sw.addEventListener('controllerchange', tellLanguage, { once: true });
  if (worker.state === 'activated') return;
  await new Promise((resolve, reject) => {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') resolve();
      // A failed install (for example, the connection dropped) is discarded.
      if (worker.state === 'redundant') reject(new Error('Saving for offline use failed'));
    });
  });
}

/**
 * Delete the offline copy and unregister the worker. The message to the worker
 * is sent synchronously and the worker finishes the job on its own, so this
 * works even when the page is replaced right after (quick exit). The page also
 * cleans up directly, in case no worker is running.
 */
export function wipeOfflineCopy() {
  if (!offlineSupported()) return Promise.resolve();
  const workers = new Set([sw.controller, registration?.active, registration?.waiting, registration?.installing]);
  for (const worker of workers) {
    try { worker?.postMessage({ type: 'wipe' }); } catch { /* ignore */ }
  }
  registration = null;
  return Promise.allSettled([
    sw.getRegistrations().then((regs) => Promise.all(regs.map((r) => r.unregister()))),
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => caches.delete(k)))),
  ]);
}
