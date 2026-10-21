// Translation contract for all UI text.
//
//   t('area.thing', 'English text')                -> translated string, or the English fallback
//   t('results.count', 'Showing {n} places', { n }) -> with {placeholders} filled in
//
// Keys are dotted and grouped by area (home.*, treatment.*, harm.*, ...). The
// English fallback lives at the call site so the UI always renders even when a
// key has no translation yet. Locale dictionaries map key -> string.
//
// Runtime (everything below t() is built on the same contract):
// - English needs no dictionary. Other languages load on demand with a dynamic
//   import, so English visitors never download them.
// - The starting language comes from ?lang=, then the visitor's saved choice
//   (localStorage "hp:lang"), then navigator.languages, then English.
// - Only an explicit choice in the language switch is saved. Quick exit erases
//   it with everything else (state.js wipeAll).
// - Static text in index.html carries data-i18n="key" (text) or
//   data-i18n-<attr>="key" (aria-label, content, href); its English is the HTML.
// - Plurals: tp('key', n, { one: '…', other: '…' }) reads key.one / key.other
//   (and key.many when a language has it), chosen with Intl.PluralRules.
// - test/i18n.test.js scans public/ for keys and fails when one is missing from
//   locales/es.js, so new English text is flagged until it is translated.

export const STORAGE_KEY = 'hp:lang';

export const LANGUAGES = {
  en: { name: 'English', locale: 'en-US' },
  es: { name: 'Español', locale: 'es-US' },
};

const loaders = {
  es: async () => {
    const [ui, services] = await Promise.all([import('./locales/es.js'), import('./locales/es-services.js')]);
    return { entries: ui.default, services: services.default };
  },
};

let dict = {};
let lang = 'en';
let serviceNames = null;
let localizedUrls = new Set();
const listeners = new Set();

export function t(key, fallback, vars) {
  let s = Object.hasOwn(dict, key) ? dict[key] : fallback;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (Object.hasOwn(vars, k) ? String(vars[k]) : m));
  return s;
}

export function getLang() {
  return lang;
}

/** BCP 47 locale for Intl formatting, e.g. "es-US". */
export function getLocale() {
  return LANGUAGES[lang]?.locale ?? 'en-US';
}

/** Replace the active dictionary. Used by the locale loader and in tests. */
export function useDictionary(code, entries, { services = null } = {}) {
  lang = code;
  dict = entries ?? {};
  serviceNames = services;
  // Translated links (url.* keys) point at official pages in this language.
  localizedUrls = new Set(Object.keys(dict).filter((k) => k.startsWith('url.')).map((k) => dict[k]));
}

/**
 * Plural-aware t(). `forms` holds the English fallbacks ({ one, other }); the
 * dictionary holds `${key}.one`, `${key}.other`, and optionally `${key}.many`.
 * {n} is filled in with the count, formatted for the active locale.
 */
export function tp(key, count, forms, vars) {
  const category = new Intl.PluralRules(getLocale()).select(count);
  const k = Object.hasOwn(dict, `${key}.${category}`) ? `${key}.${category}` : `${key}.other`;
  return t(k, forms[category] ?? forms.other, { n: formatNumber(count), ...vars });
}

export function formatNumber(n, options) {
  return new Intl.NumberFormat(getLocale(), options).format(n);
}

export function formatDate(date, options) {
  return date.toLocaleDateString(getLocale(), options);
}

/** SAMHSA's official names for service codes in the active language, or null for English. */
export function getServiceNames() {
  return serviceNames;
}

/**
 * Whether an outbound link leads to a page in the active language. English
 * pages are the default; in another language only translated url.* values are.
 */
export function isLocalizedUrl(href) {
  return lang === 'en' || localizedUrls.has(href);
}

/** Pick the starting language. Pure, so it can be tested without a browser. */
export function detectLanguage({ query = null, stored = null, languages = [] } = {}) {
  const supported = (code) => (code && Object.hasOwn(LANGUAGES, code) ? code : null);
  const primary = (tag) => String(tag ?? '').toLowerCase().split('-')[0];
  return supported(primary(query))
    ?? supported(stored)
    ?? languages.map(primary).find((code) => supported(code))
    ?? 'en';
}

export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function readStored() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function store(code) {
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* private mode or blocked */ }
}

// ---------------------------------------------------------------- Static HTML
const STATIC_ATTRS = ['aria-label', 'content', 'href'];
const originals = new Map(); // element -> { text, attrs: { name: [key, english] } }

function captureStatic(root) {
  const selector = ['[data-i18n]', ...STATIC_ATTRS.map((a) => `[data-i18n-${a}]`)].join(',');
  for (const el of root.querySelectorAll(selector)) {
    if (originals.has(el)) continue;
    const attrs = {};
    for (const a of STATIC_ATTRS) {
      const key = el.getAttribute(`data-i18n-${a}`);
      if (key) attrs[a] = [key, el.getAttribute(a) ?? ''];
    }
    originals.set(el, { key: el.dataset.i18n, text: el.dataset.i18n ? el.textContent : null, attrs });
  }
}

function applyStatic() {
  for (const [el, o] of originals) {
    if (o.key) el.textContent = t(o.key, o.text);
    for (const [a, [key, english]] of Object.entries(o.attrs)) el.setAttribute(a, t(key, english));
  }
}

// ---------------------------------------------------------------- Switch
function updateSwitch() {
  for (const link of document.querySelectorAll('[data-lang-switch] a[hreflang]')) {
    if (link.hreflang === lang) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}

/** Switch the interface language. `remember` saves an explicit choice. */
export async function setLanguage(code, { remember = false } = {}) {
  const next = Object.hasOwn(LANGUAGES, code) ? code : 'en';
  if (next === 'en') useDictionary('en', {});
  else {
    const { entries, services } = await loaders[next]();
    useDictionary(next, entries, { services });
  }
  if (remember) {
    store(next);
    // A ?lang= link would otherwise override the saved choice on reload.
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.delete('lang');
      history.replaceState(history.state, '', url);
    }
  }
  document.documentElement.lang = next;
  applyStatic();
  updateSwitch();
  for (const fn of listeners) fn(next);
}

/**
 * Detect and load the starting language, translate the static page, and wire
 * the header switch. Resolves once the page is ready to render.
 */
export async function initI18n() {
  captureStatic(document);
  for (const link of document.querySelectorAll('[data-lang-switch] a[hreflang]')) {
    link.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (link.hreflang !== lang) setLanguage(link.hreflang, { remember: true });
    });
  }
  const code = detectLanguage({
    query: new URLSearchParams(location.search).get('lang'),
    stored: readStored(),
    languages: navigator.languages ?? [navigator.language],
  });
  try {
    if (code !== 'en') await setLanguage(code);
  } catch {
    // The dictionary failed to load (offline?). English still works.
    useDictionary('en', {});
  }
  document.documentElement.lang = lang;
  applyStatic();
  updateSwitch();
}
