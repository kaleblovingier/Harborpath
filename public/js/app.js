import { api } from './api.js';
import { state, subscribe, wipeAll } from './state.js';
import { homeView, treatmentView, healthView, savedView, crisisView, privacyView, notFoundView } from './views/core.js';
import { harmReductionView, overdoseView, supportView, choosingCareView } from './views/guides.js';

const SITE = 'HarborPath';
const EXIT_URL = 'https://www.weather.gov/';

const ROUTES = {
  '': [homeView, 'Find treatment, harm reduction & health services'],
  treatment: [treatmentView, 'Find treatment'],
  'harm-reduction': [harmReductionView, 'Harm reduction'],
  overdose: [overdoseView, 'Overdose response'],
  health: [healthView, 'Health services'],
  support: [supportView, 'Recovery & family support'],
  'choosing-care': [choosingCareView, 'Choosing quality care'],
  saved: [savedView, 'Saved places'],
  crisis: [crisisView, 'Talk to someone now'],
  privacy: [privacyView, 'Privacy'],
};

const main = document.getElementById('main');
let firstRender = true;

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { path: path.replace(/\/$/, ''), query: new URLSearchParams(qs) };
}

function render() {
  const { path, query } = parseHash();
  const [view, title] = ROUTES[path] ?? [notFoundView, 'Page not found'];
  main.replaceChildren(view({ query }));
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
  const n = state.saved.size;
  savedCount.hidden = n === 0;
  savedCount.textContent = String(n);
  savedCount.setAttribute('aria-label', `${n} saved`);
}
subscribe(updateSavedCount);
updateSavedCount();

// ---------------------------------------------------------------- Footer data dates
api.meta().then((meta) => {
  const el = document.getElementById('data-updated');
  if (!el || !meta.healthCenters?.updated) return;
  const date = new Date(meta.healthCenters.updated);
  if (!Number.isNaN(date.getTime())) {
    el.textContent = `Health center data updated ${date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}. Treatment listings are searched live.`;
  }
}).catch(() => { /* footer note is optional */ });

render();
