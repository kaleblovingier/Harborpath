// Opt-in offline service worker for HarborPath.
// Only registered when the visitor explicitly enables "Save for offline use".
// Never caches /api/ responses (which describe a location), and immediately
// deletes all caches and unregisters itself when Quick Exit sends { type: 'wipe' }.
//
// Updates: bump VERSION whenever this file or the APP_SHELL list changes. The
// browser checks /sw.js for changes on every page load (it is registered with
// updateViaCache: 'none'). A changed file installs a fresh, complete copy of
// the app under a new cache name, takes over, and deletes the old cache.
//
// The saved copy is only ever written as a complete set (on install, and by
// refreshShell at most once per REFRESH_MS while online), never file by file,
// so it can never hold a mix of old and new modules after a deploy.

const CACHE_PREFIX = 'harborpath-offline';
const VERSION = 2;
const CACHE_NAME = `${CACHE_PREFIX}-v${VERSION}`;

// How long to wait for the network before answering from the saved copy. On
// one bar of signal a request can hang far longer than this.
const NETWORK_TIMEOUT_MS = { navigate: 3500, asset: 6000 };
const REFRESH_MS = 60 * 60 * 1000;
const REFRESH_KEY = '/__harborpath-refreshed';

// Every file the app can load, including views that app.js imports only when
// their route is visited. test/app.test.js checks each is served, and
// test/offline.test.js checks every module app.js can reach is listed.
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
  '/js/views/populationHelpers.js',
  '/js/locales/es.js',
  '/js/locales/es-services.js',
];

// Shown by the search pages when a live search cannot reach the network.
// Synthesized here; no /api/ response is ever stored.
const OFFLINE_API_MESSAGE = {
  en: 'You’re offline, so live search can’t run right now. For help finding treatment, call the free SAMHSA National Helpline at 1-800-662-4357 (24/7). In a crisis, call or text 988. In an emergency, call 911.',
  es: 'Está sin conexión, así que la búsqueda en vivo no puede funcionar ahora. Para encontrar tratamiento, llame gratis a la Línea Nacional de Ayuda de SAMHSA al 1-800-662-4357 (24/7). En una crisis, llame o envíe un mensaje de texto al 988. En una emergencia, llame al 911.',
};

// Set by Quick exit. After that, nothing is written to any cache again.
let wiped = false;
// The interface language, sent by the page (public/js/offline.js). Held in
// memory only.
let lang = null;

/** Fetch every shell file. Rejects unless all of them succeed. */
function fetchShell(mode) {
  return Promise.all(APP_SHELL.map(async (path) => {
    const response = await fetch(new Request(path, { cache: mode }));
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return [path, response];
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    // 'reload' skips the HTTP cache, so a new version never saves stale files.
    const entries = await fetchShell('reload');
    if (wiped) return;
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(entries.map(([path, response]) => cache.put(path, response)));
    await cache.put(REFRESH_KEY, new Response(String(Date.now())));
    await self.skipWaiting();
  })());
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

async function wipe() {
  wiped = true;
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => caches.delete(k)));
  await self.registration.unregister();
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'wipe') event.waitUntil(wipe());
  else if (event.data?.type === 'lang' && Object.hasOwn(OFFLINE_API_MESSAGE, event.data.lang)) lang = event.data.lang;
});

/**
 * Re-save the whole shell together, at most every REFRESH_MS. Never creates
 * the cache: if Quick exit (or the page) deleted it, it stays deleted.
 */
async function refreshShell() {
  if (wiped || !(await caches.has(CACHE_NAME))) return;
  const cache = await caches.open(CACHE_NAME);
  const last = Number(await (await cache.match(REFRESH_KEY))?.text());
  if (last && Date.now() - last < REFRESH_MS) return;
  await cache.put(REFRESH_KEY, new Response(String(Date.now())));
  try {
    // 'no-cache' revalidates with ETags, so unchanged files cost a 304.
    const entries = await fetchShell('no-cache');
    if (wiped) return;
    await Promise.all(entries.map(([path, response]) => cache.put(path, response)));
  } catch {
    // Partial or failed: keep the previous complete copy and retry next load.
    if (!wiped) await cache.delete(REFRESH_KEY).catch(() => {});
  }
}

async function fromCache(request) {
  if (request.mode === 'navigate') {
    // Every page of the app (including ?lang=es) is index.html plus a hash route.
    return (await caches.match('/index.html', { cacheName: CACHE_NAME }))
      || caches.match('/', { cacheName: CACHE_NAME });
  }
  const url = new URL(request.url);
  return caches.match(url.pathname, { cacheName: CACHE_NAME });
}

async function networkFirst(event) {
  const { request } = event;
  const navigate = request.mode === 'navigate';
  const network = fetch(request).then((response) => {
    if (navigate && response.ok) event.waitUntil(refreshShell().catch(() => {}));
    return response;
  });
  network.catch(() => {});

  let timer;
  const slow = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS[navigate ? 'navigate' : 'asset']);
  });
  try {
    // Answer from the network unless it is slower than the timeout and a
    // saved copy exists.
    const winner = await Promise.race([network, slow]);
    if (winner) return winner;
    return (await fromCache(request)) || await network;
  } catch {
    const cached = await fromCache(request);
    if (cached) return cached;
    throw new Error('Offline');
  } finally {
    clearTimeout(timer);
  }
}

/** Pass live searches through untouched; explain, rather than fail, offline. */
async function apiPassThrough(request) {
  try {
    return await fetch(request);
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    const useLang = lang ?? (/^es\b/i.test(request.headers.get('Accept-Language') ?? '') ? 'es' : 'en');
    return new Response(JSON.stringify({
      error: OFFLINE_API_MESSAGE[useLang],
      offline: true,
      fallbackUrl: useLang === 'es' ? 'https://findtreatment.gov/es' : 'https://findtreatment.gov/',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || wiped) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === '/sw.js') return;
  // Never store API responses: they describe a location.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiPassThrough(request));
    return;
  }
  event.respondWith(networkFirst(event));
});
