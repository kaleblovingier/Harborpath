import { api } from './api.js';
import { state, subscribe, wipeAll } from './state.js';
import { initI18n, onLanguageChange, t, formatDate } from './i18n.js';
import { homeView, treatmentView, healthView, statesView, stateDetailView, savedView, crisisView, privacyView, notFoundView } from './views/core.js';
import { harmReductionView, overdoseView, supportView, choosingCareView } from './views/guides.js';
import { h } from './dom.js';
import { pageHeader, emergencyCallout } from './views/common.js';

const SITE = 'HarborPath';
const EXIT_URL = 'https://www.weather.gov/';

// Large views load only when their route is visited, so the overdose steps and
// support lines arrive in a much smaller first download. Keep these paths in
// public/sw.js APP_SHELL (test/offline.test.js checks).
const lazy = (load, name) => (props) => load().then((m) => m[name](props));
const careNavigatorView = lazy(() => import('./views/navigator.js'), 'careNavigatorView');
const medicationsView = lazy(() => import('./views/medications.js'), 'medicationsView');
const planView = lazy(() => import('./views/plan.js'), 'planView');

const ROUTES = {
  '': [homeView, () => t('route.home', 'Find treatment, harm reduction & health services')],
  treatment: [treatmentView, () => t('route.treatment', 'Find treatment')],
  navigator: [careNavigatorView, () => t('route.navigator', 'Clinical care navigator (ASAM)')],
  medications: [medicationsView, () => t('route.medications', 'Medications & interactions')],
  'harm-reduction': [harmReductionView, () => t('route.harm', 'Harm reduction')],
  overdose: [overdoseView, () => t('route.overdose', 'Overdose response')],
  health: [healthView, () => t('route.health', 'Health services')],
  plan: [planView, () => t('route.plan', 'Safety plan & first visit')],
  support: [supportView, () => t('route.support', 'Recovery & family support')],
  'choosing-care': [choosingCareView, () => t('route.choosing', 'Choosing quality care')],
  states: [statesView, () => t('route.states', 'Resources by state and territory')],
  saved: [savedView, () => t('route.saved', 'Saved places')],
  crisis: [crisisView, () => t('route.crisis', 'Talk to someone now')],
  privacy: [privacyView, () => t('route.privacy', 'Privacy')],
};

const main = document.getElementById('main');
let firstRender = true;
let lastMeta = null;

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { path: path.replace(/\/$/, ''), query: new URLSearchParams(qs) };
}

function resolveRoute(path, query) {
  if (ROUTES[path]) {
    const [view, getTitle] = ROUTES[path];
    return [() => view({ query }), getTitle()];
  }
  if (path.startsWith('state/')) {
    const code = path.slice(6);
    if (/^[A-Za-z]{2}$/.test(code)) {
      return [
        () => stateDetailView({ code: code.toUpperCase(), query }),
        t('route.stateDetail', 'State resources ({code})', { code: code.toUpperCase() }),
      ];
    }
  }
  return [() => notFoundView({ query }), t('route.notFound', 'Page not found')];
}

let renderId = 0;
function render() {
  const { path, query } = parseHash();
  const [buildView, title] = resolveRoute(path, query);
  const id = ++renderId;
  const view = buildView();
  if (view instanceof Promise) {
    main.replaceChildren(h('div', { class: 'view', 'aria-busy': 'true' }, pageHeader(title)));
    view.then((el) => {
      if (id !== renderId) return;
      const hadFocus = document.activeElement?.id === 'page-title';
      main.replaceChildren(el);
      if (hadFocus) document.getElementById('page-title')?.focus({ preventScroll: true });
    }, () => {
      // The view could not download (no signal, or a new version was deployed).
      if (id !== renderId) return;
      main.replaceChildren(h('div', { class: 'view' }, pageHeader(title), emergencyCallout(),
        h('p', null, h('button', { type: 'button', class: 'btn btn-primary', onclick: () => location.reload() },
          t('reach.retry', 'Try again')))));
    });
  } else {
    main.replaceChildren(view);
  }
  document.title = path ? `${title} · ${SITE}` : `${SITE}: ${title}`;

  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === path) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  closeMenu();
  if (!firstRender) {
    window.scrollTo(0, 0);
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }
  firstRender = false;
}

// Internal navigation replaces the current history entry instead of adding
// one, so HarborPath occupies a single slot in the back history. After a
// quick exit, pressing Back skips past this site.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href^="#/"], a[href="#"]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute('href') === '#' ? '#/' : a.getAttribute('href');
  if (href === location.hash || (href === '#/' && !location.hash)) render();
  else location.replace(href);
});
window.addEventListener('hashchange', render);

// ---------------------------------------------------------------- Quick exit
function quickExit() {
  wipeAll();
  document.title = 'Weather';
  document.body.replaceChildren();
  location.replace(EXIT_URL);
}

document.getElementById('quick-exit')?.addEventListener('click', quickExit);

let lastEscape = 0;
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const now = Date.now();
  if (now - lastEscape < 1000) quickExit();
  lastEscape = now;
});

// ---------------------------------------------------------------- Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
function closeMenu() {
  toggle?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});

// ---------------------------------------------------------------- Saved count
const savedCount = document.getElementById('saved-count');
function updateSavedCount() {
  if (!savedCount) return;
  const n = state.saved.size;
  savedCount.hidden = n === 0;
  savedCount.textContent = String(n);
  savedCount.setAttribute('aria-label', t('app.savedCount', '{n} saved', { n }));
}
subscribe(updateSavedCount);
updateSavedCount();

// ---------------------------------------------------------------- Footer data dates
function renderFooterMeta() {
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

api.meta().then((meta) => {
  lastMeta = meta;
  renderFooterMeta();
}).catch(() => { /* footer note is optional */ });

// ---------------------------------------------------------------- Initialize i18n & render
onLanguageChange(() => {
  updateSavedCount();
  renderFooterMeta();
  render();
});

initI18n().finally(() => {
  updateSavedCount();
  renderFooterMeta();
  render();
});
