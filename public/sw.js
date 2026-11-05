// Opt-in offline service worker for HarborPath.
// Only registered when the visitor explicitly enables "Save for offline use".
// Never caches /api/ responses (which describe a location), and immediately
// deletes all caches and unregisters itself when Quick Exit sends { type: 'wipe' }.

const CACHE_PREFIX = 'harborpath-offline';
const CACHE_NAME = `${CACHE_PREFIX}-v4`;

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
];

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
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => Promise.allSettled(ELECTIVE_SHELL.map((url) => cache.add(url))))
      .catch(() => {}),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'wipe') {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(
          keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => caches.delete(k)),
        ))
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

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return (await caches.match('/index.html')) || (await caches.match('/'));
        }
        throw new Error('Offline');
      }),
  );
});

