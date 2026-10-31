import { api } from './api.js';
import { state, subscribe, wipeAll } from './state.js';
import { initI18n, onLanguageChange, t, formatDate } from './i18n.js';
import {
  homeView,
  treatmentView,
  healthView,
  statesView,
  stateDetailView,
  savedView,
  crisisView,
  privacyView,
  notFoundView,
} from './views/core.js';

const SITE = 'HarborPath';
const EXIT_URL = 'https://www.weather.gov/';

// Core routes are synchronously available at startup for zero-latency first paint.
export const SYNC_VIEWS = {
  '': homeView,
  treatment: treatmentView,
  health: healthView,
  states: statesView,
  saved: savedView,
  crisis: crisisView,
  privacy: privacyView,
};

// Heavy clinical, matching, and educational views are dynamically imported on
// demand, cached in memory, and preloaded during browser idle time or link hover/focus.
export const viewCache = new Map();
const pendingLoads = new Map();

function loadGuidesModule() {
  return import('./views/guides.js').then((m) => {
    viewCache.set('harm-reduction', m.harmReductionView);
    viewCache.set('overdose', m.overdoseView);
    viewCache.set('support', m.supportView);
    viewCache.set('choosing-care', m.choosingCareView);
    return m;
  });
}

export const LAZY_LOADERS = {
  match: () => import('./views/match.js').then((m) => {
    viewCache.set('match', m.matchView);
    return m.matchView;
  }),
  navigator: () => import('./views/navigator.js').then((m) => {
    viewCache.set('navigator', m.careNavigatorView);
    return m.careNavigatorView;
  }),
  medications: () => import('./views/medications.js').then((m) => {
    viewCache.set('medications', m.medicationsView);
    return m.medicationsView;
  }),
  plan: () => import('./views/plan.js').then((m) => {
    viewCache.set('plan', m.planView);
    return m.planView;
  }),
  'harm-reduction': () => loadGuidesModule().then((m) => m.harmReductionView),
  overdose: () => loadGuidesModule().then((m) => m.overdoseView),
  support: () => loadGuidesModule().then((m) => m.supportView),
  'choosing-care': () => loadGuidesModule().then((m) => m.choosingCareView),
};

const ROUTE_TITLES = {
  '': () => t('route.home', 'Find treatment, harm reduction & health services'),
  match: () => t('route.match', 'Find care that fits'),
  treatment: () => t('route.treatment', 'Find treatment'),
  navigator: () => t('route.navigator', 'Clinical care navigator (ASAM)'),
  medications: () => t('route.medications', 'Medications & interactions'),
  'harm-reduction': () => t('route.harm', 'Harm reduction'),
  overdose: () => t('route.overdose', 'Overdose response'),
  health: () => t('route.health', 'Health services'),
  plan: () => t('route.plan', 'Safety plan & first visit'),
  support: () => t('route.support', 'Recovery & family support'),
  'choosing-care': () => t('route.choosing', 'Choosing quality care'),
  states: () => t('route.states', 'Resources by state and territory'),
  saved: () => t('route.saved', 'Saved places'),
  crisis: () => t('route.crisis', 'Talk to someone now'),
  privacy: () => t('route.privacy', 'Privacy'),
};

export function preloadRoute(path) {
  if (SYNC_VIEWS[path]) return Promise.resolve(SYNC_VIEWS[path]);
  if (viewCache.has(path)) return Promise.resolve(viewCache.get(path));
  const loader = LAZY_LOADERS[path];
  if (!loader) return Promise.resolve(null);
  if (!pendingLoads.has(path)) {
    const p = loader().finally(() => pendingLoads.delete(path));
    pendingLoads.set(path, p);
  }
  return pendingLoads.get(path);
}

export function preloadAllLazyViews() {
  return Promise.all([
    preloadRoute('match'),
    preloadRoute('navigator'),
    preloadRoute('medications'),
    preloadRoute('plan'),
    preloadRoute('harm-reduction'),
  ]);
}

function splitHref(hash) {
  const raw = String(hash).replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { path: path.replace(/\/$/, ''), query: new URLSearchParams(qs) };
}

// Filters such as `?codes=PW,OTP` or `?tab=mental` can reveal health details,
// so they are kept out of the address bar, back history, and session restore.
// Internal links hand their filters over in memory (see the click handler).
// When a URL with filters is opened directly or set by code, the filters are
// read once and the visible URL is immediately replaced with the bare route.
// `carried` keeps them in memory so a re-render of the same route (for
// example, after a language change) does not lose them.
let carried = null;

function parseHash(hashStr) {
  if (typeof hashStr === 'string') return splitHref(hashStr);
  const currentHash = typeof location !== 'undefined' ? location.hash : '';
  const { path, query } = splitHref(currentHash);
  if ([...query.keys()].length) {
    carried = { path, query };
    if (typeof history !== 'undefined' && typeof history.replaceState === 'function') {
      history.replaceState(history.state, '', `#/${path}`);
    }
    return { path, query };
  }
  if (carried && carried.path === path) return { path, query: carried.query };
  carried = null;
  return { path, query };
}

export function resolveRoute(path, query) {
  if (Object.hasOwn(ROUTE_TITLES, path)) {
    const title = ROUTE_TITLES[path]();
    const syncView = SYNC_VIEWS[path] ?? viewCache.get(path) ?? null;
    if (syncView) {
      return { view: () => syncView({ query }), lazyPath: null, title };
    }
    return { view: null, lazyPath: path, title };
  }
  if (path.startsWith('state/')) {
    const code = path.slice(6);
    if (/^[A-Za-z]{2}$/.test(code)) {
      return {
        view: () => stateDetailView({ code: code.toUpperCase(), query }),
        lazyPath: null,
        title: t('route.stateDetail', 'State resources ({code})', { code: code.toUpperCase() }),
      };
    }
  }
  return {
    view: () => notFoundView({ query }),
    lazyPath: null,
    title: t('route.notFound', 'Page not found'),
  };
}

let firstRender = true;
let lastMeta = null;
let renderSeq = 0;

const hasDom = typeof document !== 'undefined';
const main = hasDom ? document.getElementById('main') : null;
const toggle = hasDom ? document.querySelector('.nav-toggle') : null;
const nav = hasDom ? document.getElementById('site-nav') : null;
const savedCount = hasDom ? document.getElementById('saved-count') : null;

function closeMenu() {
  toggle?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
}

async function render() {
  if (!main) return;
  const token = ++renderSeq;
  const isInitial = firstRender;
  firstRender = false;

  const { path, query } = parseHash();
  const resolved = resolveRoute(path, query);
  document.title = path ? `${resolved.title} · ${SITE}` : `${SITE}: ${resolved.title}`;

  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === path) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  closeMenu();

  let buildView = resolved.view;
  if (!buildView && resolved.lazyPath) {
    const loadedView = await preloadRoute(resolved.lazyPath);
    if (token !== renderSeq) return;
    buildView = loadedView ? () => loadedView({ query }) : () => notFoundView({ query });
  }

  main.replaceChildren(buildView());
  if (!isInitial) {
    window.scrollTo(0, 0);
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }
}

// ---------------------------------------------------------------- Quick exit
function quickExit() {
  wipeAll();
  if (!hasDom) return;
  document.title = 'Weather';
  document.body.replaceChildren();
  location.replace(EXIT_URL);
}

// ---------------------------------------------------------------- Saved count
function updateSavedCount() {
  if (!savedCount) return;
  const n = state.saved.size;
  savedCount.hidden = n === 0;
  savedCount.textContent = String(n);
  savedCount.setAttribute('aria-label', t('app.savedCount', '{n} saved', { n }));
}

// ---------------------------------------------------------------- Footer data dates
function renderFooterMeta() {
  if (!hasDom) return;
  const el = document.getElementById('data-updated');
  if (!el || !lastMeta?.healthCenters?.updated) return;
  const date = new Date(lastMeta.healthCenters.updated);
  if (!Number.isNaN(date.getTime())) {
    const formatted = formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' });
    el.textContent = t(
      'app.footer.dataUpdated',
      'Health center data updated {date}. Treatment listings are searched live.',
      { date: formatted },
    );
  }
}

if (hasDom) {
  // Internal navigation replaces the current history entry instead of adding
  // one, so HarborPath occupies a single slot in the back history. After a
  // quick exit, pressing Back skips past this site.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#/"], a[href="#"]');
    if (!a) return;
    e.preventDefault();
    const { path, query } = splitHref(a.getAttribute('href') === '#' ? '#/' : a.getAttribute('href'));
    // Explicit navigation replaces any filters carried from an earlier link.
    carried = [...query.keys()].length ? { path, query } : null;
    const href = `#/${path}`;
    if (href === location.hash || (href === '#/' && !location.hash)) render();
    else location.replace(href);
  });

  // Preload lazy route modules on pointerenter or keyboard focus so navigation is instant.
  const handleLinkPreload = (e) => {
    const a = e.target?.closest?.('a[href^="#/"]');
    if (!a) return;
    const { path } = splitHref(a.getAttribute('href') || '');
    if (LAZY_LOADERS[path]) preloadRoute(path).catch(() => {});
  };
  document.addEventListener('pointerenter', handleLinkPreload, { capture: true, passive: true });
  document.addEventListener('focusin', handleLinkPreload, { passive: true });

  window.addEventListener('hashchange', render);

  document.getElementById('quick-exit')?.addEventListener('click', quickExit);

  let lastEscape = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const now = Date.now();
    if (now - lastEscape < 1000) quickExit();
    lastEscape = now;
  });

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });

  subscribe(updateSavedCount);
  updateSavedCount();

  api.meta().then((meta) => {
    lastMeta = meta;
    renderFooterMeta();
  }).catch(() => { /* footer note is optional */ });

  onLanguageChange(() => {
    updateSavedCount();
    renderFooterMeta();
    render();
  });

  const scheduleIdle = typeof requestIdleCallback === 'function'
    ? (cb) => requestIdleCallback(cb, { timeout: 1000 })
    : (cb) => setTimeout(cb, 150);

  initI18n().finally(() => {
    updateSavedCount();
    renderFooterMeta();
    render();
    scheduleIdle(() => {
      preloadAllLazyViews().catch(() => {});
    });
  });
}
