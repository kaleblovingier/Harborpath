// Opt-in offline service worker for HarborPath.
// Only registered when the visitor explicitly enables "Save for offline use".
// Never caches /api/ responses (which describe a location), and immediately
// deletes all caches and unregisters itself when Quick Exit sends { type: 'wipe' }.
// After a wipe it never answers from or writes to an offline copy again.

const CACHE_PREFIX = 'harborpath-offline';
// Content hash of every APP_SHELL and ELECTIVE_SHELL file. A deploy that changes
// any of them changes this name, so the new copy is saved as a whole beside the
// old one and swapped in at activation. Kept current by `npm run stamp:sw`
// (scripts/build-check.mjs fails while it is stale).
const BUILD = '6859bdd2c07d';
const CACHE_NAME = `${CACHE_PREFIX}-${BUILD}`;
// Shell requests wait this long for the network before a saved copy is used,
// so overdose steps open promptly on a weak or captive connection.
const NETWORK_TIMEOUT_MS = 3000;

// Critical tier: precached at install; install fails if any is missing.
// Holds the app shell plus everything needed in an emergency while offline:
// overdose response (static guide + optional rescue timer), crisis lines,
// harm reduction guides, emergency drawer, state resources, and Spanish UI.
// Budget: < 350 KB gzipped (enforced by scripts/build-check.mjs).
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/css/print.css',
  '/icons.svg',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/js/app.js',
  '/js/api.js',
  '/js/codes.js',
  '/js/dom.js',
  '/js/i18n.js',
  '/js/offline.js',
  '/js/regionsApi.js',
  '/js/state.js',
  '/js/components/facilityCard.js',
  '/js/components/finder.js',
  '/js/components/locationPicker.js',
  '/js/components/overdose.js',
  '/js/components/overdosePacing.js',
  '/js/components/providers.js',
  '/js/components/reach.js',
  '/js/components/stateResources.js',
  '/js/components/sensoryMode.js',
  '/js/components/emergencyDrawer.js',
  '/js/components/stateLegalCard.js',
  '/js/components/mutualAidFinder.js',
  '/js/components/sessionBookmarks.js',
  '/js/content/hotlines.js',
  '/js/content/reversalFormulations.js',
  '/js/views/common.js',
  '/js/views/core.js',
  '/js/views/treatment.js',
  '/js/views/guides.js',
  '/js/views/choosingCare.js',
  '/js/views/states.js',
  '/js/views/health.js',
  '/js/views/insuranceHelpers.js',
  '/js/views/insuranceWidget.js',
  '/js/locales/es.js',
  '/js/locales/es-match.js',
  '/js/locales/es-clinical.js',
  '/js/locales/es-privacy.js',
  '/js/locales/es-services.js',
  '/js/locales/es-tools.js',
  '/js/locales/es-workspace.js',
  '/js/locales/es-evidence.js',
  '/js/locales/es-safety.js',
  '/js/locales/es-recovery.js',
];

// Elective tier: heavier, non-emergency clinical tools. Warmed in the
// background after activation so they never delay or break install, and
// cached on first online visit by the fetch handler below.
const ELECTIVE_SHELL = [
  '/js/views/tools.js',
  '/js/views/workspace.js',
  '/js/components/sourceContext.js',
  '/js/views/medications.js',
  '/js/views/navigator.js',
  '/js/views/guidedNavigator.js',
  '/js/views/harmReduction.js',
  '/js/views/populationHelpers.js',
  '/js/views/plan.js',
  '/js/views/assessment.js',
  '/js/views/readiness.js',
  '/js/views/match.js',
  '/js/match/engine.js',
  '/js/views/perinatal.js',
  '/js/components/testStripCalculator.js',
  '/js/views/veterans.js',
  '/js/views/adolescentCare.js',
  '/js/components/clinicalDifferential.js',
  '/js/views/reentry.js',
  '/js/views/olderAdults.js',
  '/js/views/workplaceRights.js',
  '/js/components/recoveryCapital.js',
  '/js/views/tribalHealth.js',
  '/js/views/lgbtqCare.js',
  '/js/views/woundInfectious.js',
  '/js/components/safetyNetNavigator.js',
  '/js/views/ruralHealth.js',
  '/js/views/disabilityCare.js',
  '/js/views/streetMedicine.js',
  '/js/components/sspEquipmentTracker.js',
  '/js/views/immigrantHealth.js',
  '/js/views/postOverdose.js',
  '/js/views/stimulantCare.js',
  '/js/components/medicalRespiteFinder.js',
  '/js/views/chronicPain.js',
  '/js/views/alcoholCare.js',
  '/js/views/familySupport.js',
  '/js/views/adulterantCare.js',
  '/js/views/methadoneAccess.js',
  '/js/views/dualDiagnosis.js',
  '/js/views/polysubstanceCare.js',
  '/js/views/nightlifeCare.js',
  '/js/views/sleepCare.js',
  '/js/views/dentalCare.js',
  '/js/views/cannabisCare.js',
  '/js/views/viralHepatitis.js',
  '/js/views/nicotineCare.js',
  '/js/views/benzodiazepineCare.js',
  '/js/views/adhdCare.js',
  '/js/views/toxicologyTriage.js',
  '/js/views/hospitalCare.js',
  '/js/views/needleExposure.js',
  '/js/views/sexualHealth.js',
  '/js/views/novelSubstances.js',
  '/js/views/gabapentinoidCare.js',
  '/js/views/psychedelicCare.js',
  '/js/views/ghbCare.js',
  '/js/views/veinCare.js',
  '/js/views/inhalantCare.js',
  '/js/views/ketamineCare.js',
  '/js/views/weatherCare.js',
  '/js/views/liverCare.js',
  '/js/views/endocarditisCare.js',
  '/js/views/renalCare.js',
  '/js/views/pulmonaryCare.js',
  '/js/views/neurologyCare.js',
  '/js/views/metabolicCare.js',
  '/js/views/recoverySupport.js',
  '/js/views/overdoseLoss.js',
];

const SHELL_PATHS = new Set(APP_SHELL);

// Set by Quick Exit. A worker that keeps running after the wipe (other open
// tabs, a request already in flight) must not save anything again.
let wiped = false;

function deleteOwnCaches() {
  return caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => caches.delete(k)),
  ));
}

// Save a response only into a copy that still exists: the install step creates
// it, and a wipe (by this worker or by the page) deletes it. A write that races
// a wipe is undone, because caches.open() would otherwise re-create the copy.
async function store(request, response) {
  if (wiped || !(await caches.has(CACHE_NAME))) return;
  const cache = await caches.open(CACHE_NAME);
  if (!wiped) await cache.put(request, response);
  if (wiped) await deleteOwnCaches();
}

async function warmElective() {
  if (wiped) return;
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(ELECTIVE_SHELL.map((url) => (wiped ? null : cache.add(url))));
  if (wiped) await deleteOwnCaches();
}

async function fromCache(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  if (request.mode === 'navigate') {
    return (await caches.match('/index.html')) || (await caches.match('/'));
  }
  return undefined;
}

const TIMED_OUT = Symbol('timed out');
const FAILED = Symbol('failed');

// App shell and page loads: use the network if it answers within
// NETWORK_TIMEOUT_MS, otherwise the saved copy. Without a saved copy, keep
// waiting for the network as a normal page would.
async function shellResponse(request, network) {
  let timer;
  const timeout = new Promise((resolve) => { timer = setTimeout(resolve, NETWORK_TIMEOUT_MS, TIMED_OUT); });
  const first = await Promise.race([network.catch(() => FAILED), timeout]);
  clearTimeout(timer);
  if (first !== TIMED_OUT && first !== FAILED) return first;
  const cached = await fromCache(request);
  if (cached) return cached;
  if (first === FAILED) throw new Error('Offline');
  return network;
}

// Everything else: the network first, the saved copy if the network fails.
async function networkFirst(request, network) {
  try {
    return await network;
  } catch {
    const cached = await fromCache(request);
    if (cached) return cached;
    throw new Error('Offline');
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim())
      // Best effort: a failed elective fetch must never affect the critical tier.
      .then(warmElective)
      .catch(() => {}),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'wipe') {
    wiped = true;
    event.waitUntil(
      deleteOwnCaches()
        .then(() => self.registration.unregister()),
    );
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never store API responses: they describe a location.
  if (url.pathname.startsWith('/api/')) return;
  // After Quick Exit, requests go straight to the network and nothing is kept.
  if (wiped) return;

  const network = fetch(request);
  // Clone before the page reads the body; the copy is saved in the background,
  // even when the saved copy already answered after a timeout.
  const copy = network.then((response) => (response && response.ok ? response.clone() : null));
  event.waitUntil(copy.then((response) => response && store(request, response)).catch(() => {}));

  const shell = request.mode === 'navigate' || SHELL_PATHS.has(url.pathname);
  event.respondWith(shell ? shellResponse(request, network) : networkFirst(request, network));
});
