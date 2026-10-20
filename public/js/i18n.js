// Translation contract for all UI text.
//
//   t('area.thing', 'English text')                -> translated string, or the English fallback
//   t('results.count', 'Showing {n} places', { n }) -> with {placeholders} filled in
//
// Keys are dotted and grouped by area (home.*, treatment.*, harm.*, ...). The
// English fallback lives at the call site so the UI always renders even when a
// key has no translation yet. Locale dictionaries map key -> string.
//
// NOTE: this is the initial stub (English only). Language loading, switching,
// and persistence are implemented on top of this same API.

let dict = {};
let lang = 'en';

export function t(key, fallback, vars) {
  let s = Object.hasOwn(dict, key) ? dict[key] : fallback;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (Object.hasOwn(vars, k) ? String(vars[k]) : m));
  return s;
}

export function getLang() {
  return lang;
}

/** Replace the active dictionary. Used by the locale loader and in tests. */
export function useDictionary(code, entries) {
  lang = code;
  dict = entries ?? {};
}
