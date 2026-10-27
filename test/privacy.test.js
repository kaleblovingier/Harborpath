// Privacy and compliance wording checks (SECURITY_REVIEW findings 6, 7, 8, 14).
// Privacy promises must be exactly true, so absolute claims that the system
// cannot keep ("never saved to disk", "erases everything", "zero-knowledge")
// must not appear in user-facing text in either language.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import es from '../public/js/locales/es.js';
import esPrivacy from '../public/js/locales/es-privacy.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const BANNED = [
  /saved to disk/i,
  /erases? everything/i,
  /zero[- ]knowledge/i,
  /does not record search terms/i,
  /never stored/i,
  /nothing is logged/i,
  /100% private/i,
  /\bse borra todo\b/i,
  /nunca se guarda/i,
  /se guardan? en el disco/i,
  /nada se registra/i,
  /100 % privad/i,
];

// Strings owned by other work streams that still overclaim. They are tracked
// by the todo test below rather than failing the suite; remove entries as
// they are fixed.
const PENDING_KEYS = new Set();
const PENDING_FILES = new Set();

function publicJsFiles() {
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        if (name !== 'locales') walk(full);
      } else if (/\.(js|html)$/.test(name)) out.push(full);
    }
  };
  walk(path.join(root, 'public'));
  return out;
}

/** Every literal t('key', 'English fallback') in public/. */
function englishFallbacks() {
  const out = [];
  const re = /\bt\(\s*'([a-zA-Z0-9_.-]+)'\s*,\s*'((?:[^'\\]|\\.)*)'/g;
  for (const file of publicJsFiles()) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(re)) {
      out.push({ file: path.basename(file), key: m[1], text: m[2] });
    }
  }
  return out;
}

function violations({ pending }) {
  const found = [];
  const check = (where, key, text) => {
    if (BANNED.some((re) => re.test(text)) && PENDING_KEYS.has(key) === pending) {
      found.push(`${where} ${key}: ${text.slice(0, 90)}`);
    }
  };
  for (const { file, key, text } of englishFallbacks()) check(`en (${file})`, key, text);
  for (const [key, text] of Object.entries(es)) check('es', key, text);
  return found;
}

test('no absolute privacy overclaims in English fallbacks or Spanish strings', () => {
  assert.deepEqual(violations({ pending: false }), []);
});

test('no absolute privacy overclaims in untranslated text of files this check owns', () => {
  const found = [];
  for (const file of publicJsFiles()) {
    if (PENDING_FILES.has(path.basename(file))) continue;
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      if (BANNED.some((re) => re.test(line))) found.push(`${path.basename(file)}:${i + 1}`);
    });
  }
  assert.deepEqual(found, []);
});

test('no overclaims remain anywhere, including navigator, plan, and match strings', () => {
  assert.deepEqual(violations({ pending: true }), []);
});

test('privacy page states the real data flows', () => {
  const core = read('public/js/views/core.js');
  const en = Object.fromEntries(englishFallbacks().map(({ key, text }) => [key, text]));
  assert.match(en['privacy.collect.3.body'], /access logs/);
  assert.match(en['privacy.collect.3.body'], /IP address/);
  assert.match(en['privacy.collect.3.body'], /URL query parameters/);
  assert.match(en['privacy.collect.2.body'], /about 1 km/);
  assert.match(en['privacy.safety.1.body'], /cannot erase your browser history/);
  assert.match(en['privacy.safety.1.body'], /clipboard/);
  assert.match(en['privacy.safety.1.body'], /downloaded or printed/);
  assert.match(es['privacy.safety.1.body'], /portapapeles/);
  assert.match(es['privacy.collect.3.body'], /dirección IP/);
  assert.ok(core.includes("'privacy.clipboardNote'"));
  assert.ok(read('public/js/views/plan.js').includes("t('privacy.clipboardNote'"));
});

test('consumer health data privacy notice is present in both languages', () => {
  const core = read('public/js/views/core.js');
  const keys = [
    'privacy.chd.title', 'privacy.chd.intro', 'privacy.chd.collect.title',
    'privacy.chd.stored.lead', 'privacy.chd.stored.body',
    'privacy.chd.server.lead', 'privacy.chd.server.body',
    'privacy.chd.samhsa.lead', 'privacy.chd.samhsa.body',
    'privacy.chd.host.lead', 'privacy.chd.host.body',
    'privacy.chd.device.lead', 'privacy.chd.device.body',
    'privacy.chd.purpose.title', 'privacy.chd.purpose.body',
    'privacy.chd.share.title', 'privacy.chd.share.sell', 'privacy.chd.share.ads', 'privacy.chd.share.only',
    'privacy.chd.rights.title', 'privacy.chd.rights.body',
    'privacy.chd.contact.title', 'privacy.chd.contact.body',
    'privacy.chd.contact.warnLead', 'privacy.chd.contact.warn',
  ];
  for (const key of keys) {
    assert.ok(core.includes(`t('${key}'`), `privacyView should render ${key}`);
    assert.ok(Object.hasOwn(esPrivacy, key), `es-privacy.js should translate ${key}`);
    assert.equal(es[key], esPrivacy[key], `es.js should spread es-privacy.js (${key})`);
  }
  assert.ok(core.includes('https://github.com/kaleblovingier/Harborpath/issues'));

  const en = Object.fromEntries(englishFallbacks().map(({ key, text }) => [key, text]));
  assert.match(en['privacy.chd.intro'], /My Health My Data/);
  assert.match(en['privacy.chd.intro'], /not a claim that HarborPath complies/);
  assert.match(en['privacy.chd.share.sell'], /does not sell/);
  assert.match(en['privacy.chd.samhsa.body'], /IP address .* not forwarded/);
  assert.match(en['privacy.chd.contact.warn'], /Do not post personal or health information/);

  // No invented contact details or compliance claims.
  const notice = keys.map((k) => `${en[k]} ${es[k]}`).join(' ');
  assert.doesNotMatch(notice, /[\w.+-]+@[\w-]+\.[\w.]+/, 'no email addresses');
  assert.doesNotMatch(notice, /\b(is|are) (fully )?compliant\b|\bin compliance with\b|\bHIPAA\b/i);
});

test('the offline shell caches the Spanish privacy strings', () => {
  const sw = read('public/sw.js');
  assert.ok(sw.includes("'/js/locales/es-privacy.js',"));
  assert.match(read('public/js/locales/es.js'), /import esPrivacy from '\.\/es-privacy\.js';/);
});

test('filters in the URL hash are read once and stripped from the address bar', () => {
  const app = read('public/js/app.js');
  assert.match(app, /history\.replaceState\(history\.state, '', `#\/\$\{path\}`\)/);
  // Internal links hand filters over in memory and navigate to the bare route.
  assert.match(app, /const href = `#\/\$\{path\}`;/);
});

test('legacy compliance document carries a no-compliance-claim banner', () => {
  const doc = read('legacy/ARCHITECTURE_AND_COMPLIANCE.md');
  const top = doc.split('\n').slice(0, 12).join('\n');
  assert.match(top, /Not deployed\. No compliance claim\./);
  assert.match(top, /never assessed for compliance/);
  assert.doesNotMatch(doc, /Full compliance/i);
  assert.match(read('legacy/README.md'), /No compliance claim/);
  assert.doesNotMatch(read('legacy/db/schema.sql'), /HIPAA COMPLIANT\)/);
});
