// Opt-in offline service worker for HarborPath.
// Only registered when the visitor explicitly enables "Save for offline use".
// Never caches /api/ responses (which describe a location), and immediately
// deletes all caches and unregisters itself when Quick Exit sends { type: 'wipe' }.

const CACHE_PREFIX = 'harborpath-offline';
const CACHE_NAME = `${CACHE_PREFIX}-v1`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
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
  '/js/components/providers.js',
  '/js/components/reach.js',
  '/js/components/stateResources.js',
  '/js/content/hotlines.js',
  '/js/views/common.js',
  '/js/views/core.js',
  '/js/views/guides.js',
  '/js/views/medications.js',
  '/js/views/navigator.js',
  '/js/views/plan.js',
  '/js/views/match.js',
  '/js/match/engine.js',
  '/js/locales/es.js',
  '/js/locales/es-match.js',
  '/js/locales/es-services.js',
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
      .then(() => self.clients.claim()),
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

