import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  detectLanguage,
  t,
  tp,
  useDictionary,
  getLang,
  getLocale,
  getServiceNames,
  isLocalizedUrl,
  isPlainLanguage,
  setPlainLanguage,
  onLanguageChange,
} from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import esServices from '../public/js/locales/es-services.js';

test('detectLanguage() follows priority: query -> stored -> navigator.languages -> en', () => {
  // Default when nothing is provided
  assert.equal(detectLanguage(), 'en');
  assert.equal(detectLanguage({ query: null, stored: null, languages: [] }), 'en');

  // Browser languages fallback
  assert.equal(detectLanguage({ languages: ['fr-FR', 'es-MX', 'en-US'] }), 'es');
  assert.equal(detectLanguage({ languages: ['de-DE', 'pt-BR'] }), 'en');

  // Stored preference overrides browser languages
  assert.equal(detectLanguage({ stored: 'es', languages: ['en-US'] }), 'es');
  assert.equal(detectLanguage({ stored: 'en', languages: ['es-ES'] }), 'en');
  assert.equal(detectLanguage({ stored: 'invalid', languages: ['es-US'] }), 'es');

  // Query parameter (?lang=...) overrides stored and browser languages
  assert.equal(detectLanguage({ query: 'es', stored: 'en', languages: ['en-US'] }), 'es');
  assert.equal(detectLanguage({ query: 'es-PR', stored: 'en', languages: ['en-US'] }), 'es');
  assert.equal(detectLanguage({ query: 'en-US', stored: 'es', languages: ['es-MX'] }), 'en');
  assert.equal(detectLanguage({ query: 'fr', stored: 'es', languages: ['en-US'] }), 'es');
});

test('t() variable interpolation and English fallback', () => {
  useDictionary('en', {});
  assert.equal(getLang(), 'en');
  assert.equal(getLocale(), 'en-US');

  // Fallback to English string when dictionary is empty or key is missing
  assert.equal(t('home.hero.title', 'Find care and stay safer, on your terms.'), 'Find care and stay safer, on your terms.');
  assert.equal(
    t('regions.safetyNet.title', 'Safety-net care within {miles} miles', { miles: 25 }),
    'Safety-net care within 25 miles',
  );
  // Unmatched placeholder remains intact
  assert.equal(t('missing.key', 'Hello {name} and {other}', { name: 'World' }), 'Hello World and {other}');

  // Switch to Spanish dictionary
  useDictionary('es', es, { services: esServices });
  assert.equal(getLang(), 'es');
  assert.equal(getLocale(), 'es-US');
  assert.equal(getServiceNames(), esServices);

  assert.equal(
    t('regions.safetyNet.title', 'Safety-net care within {miles} miles', { miles: 25 }),
    'Atención de la red de seguridad dentro de 25 millas',
  );
  assert.equal(
    t('regions.safetyNet.nearest', 'Nearest: {name} ({miles} mi)', { name: 'Clínica Esperanza', miles: 1.4 }),
    'Más cercano: Clínica Esperanza (1.4 mi)',
  );
  // Still falls back to English for unknown keys
  assert.equal(t('nonexistent.test.key', 'Fallback {x}', { x: 42 }), 'Fallback 42');

  useDictionary('en', {});
});

test('tp() plural rules in English and Spanish', () => {
  useDictionary('en', {});
  assert.equal(
    tp('providers.resultsCount', 1, {
      one: '{n} location within {miles} miles of {label}, nearest first.',
      other: '{n} locations within {miles} miles of {label}, nearest first.',
    }, { miles: 25, label: 'Seattle, WA' }),
    '1 location within 25 miles of Seattle, WA, nearest first.',
  );
  assert.equal(
    tp('providers.resultsCount', 12, {
      one: '{n} location within {miles} miles of {label}, nearest first.',
      other: '{n} locations within {miles} miles of {label}, nearest first.',
    }, { miles: 25, label: 'Seattle, WA' }),
    '12 locations within 25 miles of Seattle, WA, nearest first.',
  );

  useDictionary('es', es);
  assert.equal(
    tp('providers.resultsCount', 1, {
      one: '{n} location within {miles} miles of {label}, nearest first.',
      other: '{n} locations within {miles} miles of {label}, nearest first.',
    }, { miles: 25, label: 'Seattle, WA' }),
    '1 ubicación dentro de 25 millas de Seattle, WA, la más cercana primero.',
  );
  assert.equal(
    tp('providers.resultsCount', 5, {
      one: '{n} location within {miles} miles of {label}, nearest first.',
      other: '{n} locations within {miles} miles of {label}, nearest first.',
    }, { miles: 25, label: 'Seattle, WA' }),
    '5 ubicaciones dentro de 25 millas de Seattle, WA, las más cercanas primero.',
  );

  useDictionary('en', {});
});

test('isLocalizedUrl() marks all links localized in English and only url.* links in Spanish', () => {
  useDictionary('en', {});
  assert.equal(isLocalizedUrl('https://findtreatment.gov/'), true);
  assert.equal(isLocalizedUrl('https://www.cdc.gov/overdose-prevention/'), true);

  useDictionary('es', es);
  assert.equal(isLocalizedUrl(es['url.findtreatment']), true);
  assert.equal(isLocalizedUrl(es['url.hotline.988']), true);
  assert.equal(isLocalizedUrl('https://www.cdc.gov/overdose-prevention/'), false);

  useDictionary('en', {});
});

test('public/js/locales/es.js and es-services.js have valid keys, non-empty strings, and cover all UI keys in public/', () => {
  const entries = Object.entries(es);
  assert.ok(entries.length >= 250, `Expected at least 250 Spanish UI keys, got ${entries.length}`);

  for (const [key, val] of entries) {
    assert.match(key, /^[a-zA-Z0-9_.-]+$/, `Invalid key format: ${key}`);
    assert.equal(typeof val, 'string', `Value for ${key} must be a string`);
    assert.ok(val.trim().length > 0, `Translation for ${key} must not be empty`);
  }

  // Verify required Wave 2 key namespaces exist
  for (const requiredKey of [
    'regions.safetyNet.title',
    'regions.safetyNet.healthCenters',
    'regions.safetyNet.er',
    'regions.safetyNet.va',
    'regions.safetyNet.ihsRhc',
    'regions.safetyNet.nearest',
    'regions.safetyNet.noneWithin',
    'offline.label',
    'offline.hint',
    'offline.saving',
    'offline.saved',
    'offline.removed',
    'offline.failed',
    'home.hero.title',
    'treatment.title',
    'health.title',
    'meds.regimen.title',
    'plan.script.heading',
    'nav.calc.summary',
  ]) {
    assert.ok(Object.hasOwn(es, requiredKey), `Missing required Spanish key: ${requiredKey}`);
  }

  // Verify es-services.js integrity
  assert.ok(esServices && typeof esServices === 'object');
  assert.ok(esServices.categories && typeof esServices.categories === 'object');
  assert.ok(esServices.services && typeof esServices.services === 'object');
  const catEntries = Object.entries(esServices.categories);
  const serviceGroups = Object.entries(esServices.services);
  assert.ok(catEntries.length >= 15, 'Expected at least 15 Spanish SAMHSA categories');
  assert.ok(serviceGroups.length >= 15, 'Expected at least 15 Spanish SAMHSA service groups');
  let totalServiceCodes = 0;
  for (const [k, v] of catEntries) {
    assert.ok(k.trim().length > 0);
    assert.equal(typeof v, 'string');
    assert.ok(v.trim().length > 0, `Empty category translation for ${k}`);
  }
  for (const [groupKey, groupMap] of serviceGroups) {
    assert.ok(groupKey.trim().length > 0);
    for (const [code, label] of Object.entries(groupMap)) {
      totalServiceCodes += 1;
      assert.ok(code.trim().length > 0);
      assert.equal(typeof label, 'string');
      assert.ok(label.trim().length > 0, `Empty service translation for ${groupKey}.${code}`);
    }
  }
  assert.ok(totalServiceCodes >= 100, `Expected at least 100 Spanish SAMHSA service codes, got ${totalServiceCodes}`);

  // Scan public/ for literal t('key', ...) / tp('key', ...) / data-i18n="key" and verify es.js covers them
  const publicDir = new URL('../public', import.meta.url);
  const files = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        if (name !== 'locales') walk(full);
      } else if (/\.(js|html)$/.test(name)) {
        files.push(full);
      }
    }
  };
  walk(path.resolve(publicDir.pathname.replace(/^\/([A-Za-z]:)/, '$1')));

  const missingKeys = [];
  for (const file of files) {
    if (path.basename(file) === 'i18n.js') continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*['"]([a-zA-Z0-9_.-]+)['"]\s*,/g)) {
      const key = m[1];
      if (!Object.hasOwn(es, key)) missingKeys.push(`${path.basename(file)}: ${key}`);
    }
    for (const m of src.matchAll(/\btp\(\s*['"]([a-zA-Z0-9_.-]+)['"]\s*,/g)) {
      const key = m[1];
      if (!Object.hasOwn(es, `${key}.one`) || !Object.hasOwn(es, `${key}.other`)) {
        missingKeys.push(`${path.basename(file)}: ${key}.one/.other`);
      }
    }
    for (const m of src.matchAll(/data-i18n(?:-[a-z-]+)?="([a-zA-Z0-9_.-]+)"/g)) {
      const key = m[1];
      if (!Object.hasOwn(es, key)) missingKeys.push(`${path.basename(file)}: ${key}`);
    }
  }
  assert.deepEqual(missingKeys, [], `Missing Spanish translations for keys in public/: ${missingKeys.join(', ')}`);
});

// ---------------------------------------------------------------- Plain-language mode
test('plain-language mode is off by default and t() returns standard text', () => {
  useDictionary('en', {});
  assert.equal(isPlainLanguage(), false);
  assert.equal(t('demo.key', { text: 'Standard words.', plain: 'Simple words.' }), 'Standard words.');
  // A plain string fallback behaves exactly as before.
  assert.equal(t('demo.key', 'Standard words.'), 'Standard words.');
});

test('plain-language mode prefers the plain variant in English and in the dictionary', () => {
  useDictionary('en', {});
  setPlainLanguage(true, { notify: false });
  try {
    assert.equal(isPlainLanguage(), true);
    // English: the call site's plain text.
    assert.equal(t('demo.key', { text: 'Standard words.', plain: 'Simple words.' }), 'Simple words.');
    // Keys without a plain variant are unchanged.
    assert.equal(t('demo.key', { text: 'Only standard.' }), 'Only standard.');
    assert.equal(t('demo.key', 'Only standard.'), 'Only standard.');
    // Placeholders work in plain text too.
    assert.equal(t('demo.vars', { text: 'Within {n} miles', plain: 'Up to {n} miles away' }, { n: 5 }), 'Up to 5 miles away');

    // Dictionary: key.plain wins over key.
    useDictionary('es', { 'demo.key': 'Palabras normales.', 'demo.key.plain': 'Palabras simples.', 'demo.only': 'Solo normal.' });
    assert.equal(t('demo.key', { text: 'Standard words.', plain: 'Simple words.' }), 'Palabras simples.');
    // A translated key without a .plain version keeps its translation and
    // never falls back to English plain text.
    assert.equal(t('demo.only', { text: 'Standard words.', plain: 'Simple words.' }), 'Solo normal.');
    // A key missing from a non-English dictionary falls back to standard English, not English plain.
    assert.equal(t('demo.missing', { text: 'Standard words.', plain: 'Simple words.' }), 'Standard words.');

    // Real Spanish dictionary.
    useDictionary('es', es);
    assert.equal(t('home.hero.title', { text: 'x', plain: 'y' }), es['home.hero.title.plain']);
  } finally {
    setPlainLanguage(false, { notify: false });
    useDictionary('en', {});
  }
  // Turning it off restores standard text.
  assert.equal(t('demo.key', { text: 'Standard words.', plain: 'Simple words.' }), 'Standard words.');
  useDictionary('es', es);
  assert.equal(t('home.hero.title', { text: 'x', plain: 'y' }), es['home.hero.title']);
  useDictionary('en', {});
});

test('setPlainLanguage() notifies listeners only on change and writes nothing to storage', () => {
  const writes = [];
  const fakeStorage = { setItem: (k, v) => writes.push([k, v]), getItem: () => null, removeItem: () => {} };
  const hadLocal = Object.hasOwn(globalThis, 'localStorage');
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage, configurable: true, writable: true });
  let calls = 0;
  const off = onLanguageChange(() => { calls += 1; });
  try {
    setPlainLanguage(true);
    setPlainLanguage(true);
    assert.equal(calls, 1);
    setPlainLanguage(false);
    assert.equal(calls, 2);
    assert.deepEqual(writes, [], 'plain-language mode must stay in memory only');
  } finally {
    off();
    setPlainLanguage(false, { notify: false });
    if (hadLocal) Object.defineProperty(globalThis, 'localStorage', { value: previous, configurable: true, writable: true });
    else delete globalThis.localStorage;
  }
});

test('every plain-language call site has a Spanish .plain translation and keeps phone numbers', () => {
  const root = path.resolve(new URL('../public/js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  const files = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) { if (name !== 'locales') walk(full); } else if (name.endsWith('.js')) files.push(full);
    }
  };
  walk(root);
  const missing = [];
  let found = 0;
  const phone = /\b(?:911|988|1-\d{3}-\d{3}-\d{4})\b/g;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9_.-]+)'\s*,\s*\{\s*text:\s*('(?:[^'\\]|\\.)*')\s*,\s*plain:\s*('(?:[^'\\]|\\.)*')/g)) {
      found += 1;
      const [, key, text, plainText] = m;
      if (!Object.hasOwn(es, `${key}.plain`)) missing.push(`${path.basename(file)}: ${key}.plain`);
      // Simplifying must never drop or change an emergency number.
      assert.deepEqual(plainText.match(phone) ?? [], text.match(phone) ?? [], `Phone numbers differ in plain text for ${key}`);
      if (Object.hasOwn(es, key) && Object.hasOwn(es, `${key}.plain`)) {
        assert.deepEqual(es[`${key}.plain`].match(phone) ?? [], es[key].match(phone) ?? [], `Phone numbers differ in Spanish plain text for ${key}`);
      }
    }
  }
  assert.ok(found >= 30, `Expected at least 30 plain-language strings, found ${found}`);
  assert.deepEqual(missing, [], `Missing Spanish plain-language versions: ${missing.join(', ')}`);
  // Every Spanish .plain key belongs to a translated standard key.
  for (const key of Object.keys(es).filter((k) => k.endsWith('.plain'))) {
    assert.ok(Object.hasOwn(es, key.slice(0, -'.plain'.length)), `${key} has no standard translation`);
  }
});
