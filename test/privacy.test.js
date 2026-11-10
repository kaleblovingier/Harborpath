import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import fs, { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ROUTE_PARAM_ALLOWLIST,
  FORBIDDEN_PII_PARAM_NAMES,
  sanitizeSearchParams,
  redactSensitiveText,
  createPrivacyLogger,
  auditSecurityHeaders,
} from '../src/privacy.js';
import { clientKey, createApp, SECURITY_HEADERS, trustProxyFromEnv } from '../src/app.js';
import { createCircuitBreaker } from '../src/cache.js';
import { readJson } from '../src/util.js';
import es from '../public/js/locales/es.js';
import esPrivacy from '../public/js/locales/es-privacy.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(here, '..');
const root = rootDir;
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const sample = readJson(path.join(here, 'fixtures', 'findtreatment-sample.json'));

describe('ROUTE_PARAM_ALLOWLIST & sanitizeSearchParams()', () => {
  test('ROUTE_PARAM_ALLOWLIST defines strict parameter allowlists for all 11 API routes', () => {
    const expectedRoutes = [
      '/api/health',
      '/api/meta',
      '/api/geocode',
      '/api/region',
      '/api/states',
      '/api/state',
      '/api/telehealth',
      '/api/treatment',
      '/api/health-centers',
      '/api/providers',
      '/api/nearby-summary',
    ];
    for (const route of expectedRoutes) {
      assert.ok(Object.hasOwn(ROUTE_PARAM_ALLOWLIST, route), `Missing allowlist for ${route}`);
      assert.ok(Array.isArray(ROUTE_PARAM_ALLOWLIST[route]));
    }
    assert.deepEqual(ROUTE_PARAM_ALLOWLIST['/api/health'], []);
    assert.deepEqual(ROUTE_PARAM_ALLOWLIST['/api/meta'], []);
    assert.deepEqual(ROUTE_PARAM_ALLOWLIST['/api/geocode'], ['q']);
    assert.deepEqual(ROUTE_PARAM_ALLOWLIST['/api/region'], ['zip', 'lat', 'lng']);
    assert.deepEqual(ROUTE_PARAM_ALLOWLIST['/api/states'], []);
    assert.deepEqual(ROUTE_PARAM_ALLOWLIST['/api/state'], ['code']);
    assert.deepEqual(ROUTE_PARAM_ALLOWLIST['/api/treatment'], ['lat', 'lng', 'radius', 'kind', 'codes', 'page']);
  });

  test('a payer (insurance) parameter never reaches the treatment search', () => {
    const { cleanParams, strippedParams } = sanitizeSearchParams(
      '/api/treatment',
      new URLSearchParams({ lat: '47.61', lng: '-122.33', codes: 'BU', payer: 'Apple Health' }),
    );
    assert.equal(cleanParams.has('payer'), false);
    assert.deepEqual(strippedParams, ['payer']);
  });

  test('strips utm_*, fbclid, ssn, email, name, dob, mrn and retains only allowlisted route params', () => {
    const raw = new URLSearchParams({
      lat: '48.751934',
      lng: '-122.478712',
      radius: '25',
      codes: 'BU,OTP',
      ssn: '123-45-6789',
      email: 'patient@example.com',
      name: 'Jane Doe',
      dob: '1990-01-01',
      mrn: 'MRN-998877',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring',
      fbclid: 'IwAR123456',
      gclid: 'EAIaIQobChMI',
      unexpected_param: 'foo',
    });

    const { cleanParams, strippedParams, hadForbiddenPii } = sanitizeSearchParams('/api/treatment', raw);

    assert.equal(hadForbiddenPii, true);
    assert.equal(cleanParams.get('lat'), '48.751934');
    assert.equal(cleanParams.get('lng'), '-122.478712');
    assert.equal(cleanParams.get('radius'), '25');
    assert.equal(cleanParams.get('codes'), 'BU,OTP');

    for (const forbidden of ['ssn', 'email', 'name', 'dob', 'mrn', 'utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'unexpected_param']) {
      assert.equal(cleanParams.has(forbidden), false, `${forbidden} must be stripped`);
      assert.ok(strippedParams.includes(forbidden), `${forbidden} must be recorded in strippedParams`);
    }
  });

  test('scrubs accidental SSN, email, and phone patterns from free-text query parameter q', () => {
    const withSsn = sanitizeSearchParams('/api/geocode', 'q=Seattle%2C+WA+123-45-6789');
    assert.equal(withSsn.hadForbiddenPii, true);
    assert.equal(withSsn.cleanParams.get('q'), 'Seattle, WA');
    assert.doesNotMatch(withSsn.cleanParams.get('q'), /123-45-6789/);

    const withEmail = sanitizeSearchParams('/api/geocode', 'q=98225+patient.name%40example.org');
    assert.equal(withEmail.hadForbiddenPii, true);
    assert.equal(withEmail.cleanParams.get('q'), '98225');
    assert.doesNotMatch(withEmail.cleanParams.get('q'), /example\.org/);

    const withPhone = sanitizeSearchParams('/api/geocode', 'q=Portland+OR+(206)+555-0199');
    assert.equal(withPhone.hadForbiddenPii, true);
    assert.equal(withPhone.cleanParams.get('q'), 'Portland OR');
    assert.doesNotMatch(withPhone.cleanParams.get('q'), /555-0199/);

    // Valid ZIP+4 must not be mistaken for an SSN or phone number
    const validZipPlus4 = sanitizeSearchParams('/api/geocode', 'q=98225-1234');
    assert.equal(validZipPlus4.hadForbiddenPii, false);
    assert.equal(validZipPlus4.cleanParams.get('q'), '98225-1234');
  });

  test('FORBIDDEN_PII_PARAM_NAMES includes all sensitive clinical and ad-tracker keys', () => {
    const required = [
      'ssn', 'social_security', 'dob', 'birth', 'name', 'first_name', 'last_name',
      'fullname', 'email', 'phone', 'address', 'street', 'mrn', 'patient_id',
      'member_id', 'policy_number', 'utm_source', 'utm_medium', 'utm_campaign',
      'utm_term', 'utm_content', 'fbclid', 'gclid', 'msclkid', '_ga',
    ];
    for (const key of required) {
      assert.ok(FORBIDDEN_PII_PARAM_NAMES.has(key), `Expected FORBIDDEN_PII_PARAM_NAMES to contain ${key}`);
    }
  });
});

describe('redactSensitiveText() & createPrivacyLogger()', () => {
  test('redacts SSNs, emails, phone numbers, query strings, and >2-decimal GPS coordinates', () => {
    const raw =
      'Request /api/treatment?lat=48.751934&lng=-122.478712 for user jane.doe@example.com ' +
      'SSN 123-45-6789 phone (206) 555-0199 at coords 48.751934, -122.478712 (coarsened 48.75, -122.48)';
    const out = redactSensitiveText(raw);

    assert.doesNotMatch(out, /123-45-6789/, 'SSN must be redacted');
    assert.doesNotMatch(out, /jane\.doe@example\.com/, 'email must be redacted');
    assert.doesNotMatch(out, /555-0199/, 'phone must be redacted');
    assert.doesNotMatch(out, /\?lat=/, 'query string must be redacted');
    assert.doesNotMatch(out, /48\.751934|-122\.478712/, 'high-precision coordinates must be redacted');
    assert.match(out, /48\.75, -122\.48/, 'coarsened 2-decimal coordinates remain intact');
    assert.match(out, /\[REDACTED\]/);
  });

  test('createPrivacyLogger wraps error, warn, info, and log and sanitizes strings, Errors, and objects', () => {
    const sink = { error: [], warn: [], info: [], log: [] };
    const rawLogger = {
      error: (...a) => sink.error.push(a.join(' ')),
      warn: (...a) => sink.warn.push(a.join(' ')),
      info: (...a) => sink.info.push(a.join(' ')),
      log: (...a) => sink.log.push(a.join(' ')),
    };
    const safe = createPrivacyLogger(rawLogger);

    safe.error(new Error('Upstream failed for /api/treatment?lat=47.60621&lng=-122.33207'));
    safe.warn('Contact patient@clinic.org or 1-800-555-0144');
    safe.info({ ssn: '123-45-6789', lat: 48.751934 });
    safe.log('Plain message without PII');

    assert.equal(sink.error.length, 1);
    assert.doesNotMatch(sink.error[0], /47\.60621|-122\.33207|\?lat=/);
    assert.match(sink.error[0], /\[REDACTED\]/);

    assert.equal(sink.warn.length, 1);
    assert.doesNotMatch(sink.warn[0], /patient@clinic\.org|555-0144/);

    assert.equal(sink.info.length, 1);
    assert.doesNotMatch(sink.info[0], /123-45-6789|48\.751934/);

    assert.equal(sink.log[0], 'Plain message without PII');
  });
});

describe('auditSecurityHeaders()', () => {
  test('SECURITY_HEADERS in src/app.js and vercel.json pass 100% of privacy header checks', () => {
    const appAudit = auditSecurityHeaders(SECURITY_HEADERS);
    assert.equal(appAudit.ok, true);
    assert.deepEqual(appAudit.missing, []);
    assert.deepEqual(appAudit.violations, []);

    const vercelCfg = readJson(path.join(rootDir, 'vercel.json'));
    const rule = vercelCfg.headers.find((r) => r.source === '/(.*)');
    const vercelAudit = auditSecurityHeaders(rule.headers);
    assert.equal(vercelAudit.ok, true);
    assert.deepEqual(vercelAudit.missing, []);
    assert.deepEqual(vercelAudit.violations, []);
  });

  test('detects missing headers and weakened security policy directives', () => {
    const weakened = {
      'Content-Security-Policy': "default-src 'self' https://cdn.example.com; script-src 'unsafe-inline'",
      'Referrer-Policy': 'origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
    };
    const res = auditSecurityHeaders(weakened);
    assert.equal(res.ok, false);
    assert.ok(res.missing.includes('Cross-Origin-Opener-Policy'));
    assert.ok(res.missing.includes('Cross-Origin-Resource-Policy'));
    assert.ok(res.missing.includes('Permissions-Policy'));
    assert.ok(res.violations.some((v) => v.includes("frame-ancestors 'none'")));
    assert.ok(res.violations.some((v) => v.includes("object-src 'none'")));
    assert.ok(res.violations.some((v) => v.includes('external http(s)')));
    assert.ok(res.violations.some((v) => v.includes('unsafe-inline')));
    assert.ok(res.violations.some((v) => v.includes('Referrer-Policy')));
    assert.ok(res.violations.some((v) => v.includes('X-Frame-Options')));
  });
});

describe('End-to-end HTTP privacy & confidentiality checks on createApp()', () => {
  const upstreamCalls = [];
  const logged = [];
  let failWithLeakyError = false;

  async function fakeFetch(url) {
    upstreamCalls.push(url);
    if (failWithLeakyError) {
      throw new Error(`Upstream failed at ${url} for SSN 123-45-6789 and coords 48.751934,-122.478712`);
    }
    return new Response(JSON.stringify(sample), { status: 200 });
  }

  let server;
  let base;
  before(async () => {
    const handler = createApp({
      fetchImpl: fakeFetch,
      rateLimit: { windowMs: 60_000, max: 200 },
      logger: { error: (m) => logged.push(m) },
    });
    server = createServer(handler);
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(() => new Promise((r) => server.close(r)));

  test('API endpoints return Cache-Control: no-store, set zero cookies, coarsen coordinates to 0.01°, and strip PII/tracking params', async () => {
    const endpoints = [
      '/api/treatment?lat=48.751934&lng=-122.478712&radius=25&codes=BU&utm_source=fb&fbclid=xyz&ssn=123-45-6789&name=John+Doe',
      '/api/geocode?q=98225+123-45-6789&utm_campaign=test&email=john@example.com',
      '/api/region?lat=48.751934&lng=-122.478712&dob=1985-05-10&mrn=991122',
      '/api/nearby-summary?lat=48.751934&lng=-122.478712&radius=25&utm_medium=social&phone=206-555-0199',
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${base}${ep}`);
      assert.equal(res.status, 200, `Expected 200 OK for ${ep}`);
      assert.equal(res.headers.get('cache-control'), 'no-store', `Expected no-store on ${ep}`);
      assert.equal(res.headers.get('set-cookie'), null, `Expected zero cookies on ${ep}`);
      const headerAudit = auditSecurityHeaders(res.headers);
      assert.equal(headerAudit.ok, true, `Expected strict security headers on ${ep}`);
    }

    assert.ok(upstreamCalls.length >= 1);
    const lastUpstream = upstreamCalls.at(-1);
    const parsedUpstream = new URL(lastUpstream);
    assert.equal(parsedUpstream.searchParams.get('sAddr'), '48.75,-122.48');
    assert.doesNotMatch(lastUpstream, /751934|478712|123-45-6789|John|utm_|fbclid/);
  });

  test('upstream error logs never leak query strings, high-precision coordinates, or PII', async () => {
    failWithLeakyError = true;
    try {
      const res = await fetch(`${base}/api/treatment?lat=41.878113&lng=-87.629799&radius=10&ssn=123-45-6789`);
      assert.equal(res.status, 502);
      assert.ok(logged.length > 0);
      for (const entry of logged) {
        assert.doesNotMatch(entry, /123-45-6789/, 'SSN must be redacted from logs');
        assert.doesNotMatch(entry, /48\.751934|-122\.478712|41\.878113|-87\.629799/, 'precise coords must be redacted from logs');
        assert.doesNotMatch(entry, /sAddr=/, 'upstream query string must be redacted from logs');
      }
    } finally {
      failWithLeakyError = false;
    }
  });
});

describe('Static source audit of public/js/ for client-side storage & zero-knowledge clinical tools', () => {
  function listJsFiles(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) out.push(...listJsFiles(full));
      else if (name.endsWith('.js')) out.push(full);
    }
    return out;
  }

  test('localStorage is only accessed in public/js/state.js and public/js/i18n.js and wiped in wipeAll()', () => {
    const publicJsDir = path.join(rootDir, 'public', 'js');
    const files = listJsFiles(publicJsDir);
    const localStorageUsers = [];

    for (const file of files) {
      const rel = path.relative(rootDir, file).split(path.sep).join('/');
      const code = readFileSync(file, 'utf8').replace(/\/\/.*$/gm, '');
      if (/\blocalStorage\b/.test(code)) {
        localStorageUsers.push(rel);
      }
    }

    assert.deepEqual(
      localStorageUsers.sort(),
      ['public/js/i18n.js', 'public/js/state.js'],
      'Only state.js and i18n.js may touch localStorage',
    );

    const stateCode = readFileSync(path.join(publicJsDir, 'state.js'), 'utf8');
    assert.match(stateCode, /export function wipeAll\(\)/);
    assert.match(stateCode, /sessionStorage\.clear\(\)/);
    assert.match(stateCode, /wipeOfflineCopy\(\)/);
  });

  test('clinical views (navigator.js, medications.js, plan.js) never touch storage, cookies, or network fetch', () => {
    const clinicalFiles = [
      'public/js/views/navigator.js',
      'public/js/views/medications.js',
      'public/js/views/plan.js',
    ];

    for (const rel of clinicalFiles) {
      const full = path.join(rootDir, rel);
      const raw = readFileSync(full, 'utf8');
      // Strip single-line comments and string literals that explain privacy to the user
      const codeOnly = raw.replace(/\/\/.*$/gm, '');
      assert.doesNotMatch(codeOnly, /\blocalStorage\s*\./, `${rel} must not call localStorage`);
      assert.doesNotMatch(codeOnly, /\bsessionStorage\s*\./, `${rel} must not call sessionStorage`);
      assert.doesNotMatch(codeOnly, /\bdocument\.cookie\b/, `${rel} must not touch document.cookie`);
      assert.doesNotMatch(codeOnly, /\bindexedDB\b/, `${rel} must not touch indexedDB`);
      assert.doesNotMatch(codeOnly, /\bfetch\s*\(/, `${rel} must run 100% in browser RAM with zero network fetch`);
    }
  });
});

// Privacy and compliance wording checks (SECURITY_REVIEW findings 6, 7, 8, 14).
// Privacy promises must be exactly true, so absolute claims that the system
// cannot keep ("never saved to disk", "erases everything", "zero-knowledge")
// must not appear in user-facing text in either language.

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

// Server-side privacy and input-validation guarantees, endpoint by endpoint.
// Each test locks in one promise from docs/ARCHITECTURE.md. No live network:
// the FindTreatment.gov client gets a fake fetch.
describe('Endpoint privacy and input-validation guarantees', () => {
  // Every endpoint that accepts coordinates, with the other params it needs.
  const COORD_ENDPOINTS = {
    '/api/region': '',
    '/api/treatment': 'radius=25',
    '/api/telehealth': 'state=WA',
    '/api/health-centers': 'radius=25',
    '/api/providers': 'type=va&radius=50',
    '/api/nearby-summary': 'radius=50',
  };
  // Precise inputs, and the 0.01-degree values they must be reduced to.
  const PRECISE = { lat: '48.751934', lng: '-122.478712' };
  const COARSE = { lat: '48.75', lng: '-122.48' };
  const PRECISE_FRAGMENTS = /751934|478712|48\.7519|122\.4787/;

  function startApp(options = {}) {
    const upstreamUrls = [];
    const logs = [];
    const capture = (...args) => logs.push(args.map(String).join(' '));
    const logger = { error: capture, warn: capture, info: capture, log: capture };
    let mode = 'ok';
    const fetchImpl = async (url) => {
      upstreamUrls.push(url);
      if (mode === 'down') throw new TypeError(`connect ECONNREFUSED for ${url}`);
      if (mode === 'echo') return new Response(`Invalid request ${url}`, { status: 200 });
      if (mode === 'hang') return new Promise(() => {});
      return new Response(JSON.stringify(sample), { status: 200 });
    };
    const handler = createApp({ fetchImpl, logger, rateLimit: { windowMs: 60_000, max: 10_000 }, ...options });
    const server = createServer(handler);
    return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
      base: `http://127.0.0.1:${server.address().port}`,
      upstreamUrls,
      logs,
      setMode: (m) => { mode = m; },
      close: () => new Promise((r) => server.close(r)),
    })));
  }

  let app;
  before(async () => { app = await startApp({ upstream: { retries: 0, timeoutMs: 200 } }); });
  after(() => app.close());

  const get = (p) => fetch(`${app.base}${p}`);

  test('every coordinate endpoint answers a precise location exactly as it answers the ~1 km rounded one', async () => {
    for (const [route, extra] of Object.entries(COORD_ENDPOINTS)) {
      const precise = await get(`${route}?${extra}&lat=${PRECISE.lat}&lng=${PRECISE.lng}`);
      const coarse = await get(`${route}?${extra}&lat=${COARSE.lat}&lng=${COARSE.lng}`);
      assert.equal(precise.status, 200, route);
      const a = await precise.text();
      assert.equal(a, await coarse.text(), `${route}: precise input must not change the answer`);
      assert.doesNotMatch(a, PRECISE_FRAGMENTS, `${route}: precise coordinates never echoed`);
    }
  });

  test('only coarsened coordinates ever reach FindTreatment.gov', async () => {
    app.upstreamUrls.length = 0;
    await get(`/api/treatment?lat=40.712776&lng=-74.005974&radius=10`);
    await get(`/api/telehealth?state=NY&lat=40.712776&lng=-74.005974`);
    assert.equal(app.upstreamUrls.length, 2);
    for (const u of app.upstreamUrls) {
      assert.equal(new URL(u).searchParams.get('sAddr'), '40.71,-74.01');
      assert.doesNotMatch(u, /712776|005974/);
    }
  });

  test('responses are never cacheable by shared caches and carry the security headers', async () => {
    for (const route of ['/api/meta', '/api/freshness', '/api/geocode?q=98225', '/api/nope', '/api/treatment?lat=x']) {
      const res = await get(route);
      assert.equal(res.headers.get('cache-control'), 'no-store', route);
      assert.equal(res.headers.get('referrer-policy'), 'no-referrer', route);
      assert.match(res.headers.get('content-security-policy'), /default-src 'self'/, route);
    }
  });

  test('nothing location- or query-derived reaches the logs, even when the upstream echoes the query back', async () => {
    app.logs.length = 0;
    const marker = 'Zz9Marker';
    for (const mode of ['down', 'echo', 'hang']) {
      app.setMode(mode);
      // Distinct coordinates per mode so no cached copy answers.
      const lat = { down: '41.234567', echo: '42.345678', hang: '43.456789' }[mode];
      const t = await get(`/api/treatment?lat=${lat}&lng=-73.987654&radius=10&kind=sa`);
      assert.ok([502, 503].includes(t.status), `${mode}: ${t.status}`);
      const body = await t.text();
      assert.doesNotMatch(body, /\d+\.\d{3,}|sAddr|ECONNREFUSED/, `${mode}: error body is fixed text`);
      await get(`/api/telehealth?state=OR&lat=${lat}&lng=-120.987654`);
    }
    app.setMode('ok');
    await get(`/api/geocode?q=${marker}`);
    await get(`/api/region?zip=${marker}`);
    await get(`/api/state?code=${marker}`);
    assert.ok(app.logs.length >= 6, 'failures were logged');
    for (const line of app.logs) {
      assert.doesNotMatch(line, /\d+\.\d{2,}/, `no coordinates in: ${line}`);
      assert.doesNotMatch(line, /lat=|lng=|sAddr|findtreatment\.gov\/|\?|Zz9Marker|ECONNREFUSED/, `no query data in: ${line}`);
      assert.match(line, /^\[api\] \/api\/[a-z-]+ /, `route-only format: ${line}`);
    }
  });

  test('an unavailable upstream gives a clear 502 with phone alternatives, then a fast 503 once the breaker opens', async () => {
    const local = await startApp({ upstream: { retries: 0, breaker: createCircuitBreaker({ threshold: 2, cooldownMs: 30_000 }) } });
    try {
      local.setMode('down');
      for (let i = 0; i < 2; i++) {
        const res = await fetch(`${local.base}/api/treatment?lat=4${i}.5&lng=-100&radius=25`);
        assert.equal(res.status, 502);
        const body = await res.json();
        assert.equal(body.reason, 'network');
        assert.equal(body.fallbackUrl, 'https://findtreatment.gov/');
        assert.equal(body.helpline, '1-800-662-4357');
        assert.ok(body.alternatives.some((a) => a.phone === '988'));
        assert.ok(body.alternatives.every((a) => a.name && a.phone && a.tel));
      }
      const callsBefore = local.upstreamUrls.length;
      const started = Date.now();
      const res = await fetch(`${local.base}/api/treatment?lat=44.5&lng=-100&radius=25`);
      assert.equal(res.status, 503);
      assert.ok(Date.now() - started < 500, 'fails fast');
      assert.equal(local.upstreamUrls.length, callsBefore, 'no upstream call while the breaker is open');
      const retryAfter = Number(res.headers.get('retry-after'));
      assert.ok(retryAfter > 0 && retryAfter <= 30);
      const body = await res.json();
      assert.equal(body.reason, 'circuit-open');
      assert.equal(body.helpline, '1-800-662-4357');
      assert.equal(body.retryAfterSeconds, retryAfter);
    } finally {
      await local.close();
    }
  });

  test('a hanging upstream never hangs the API', async () => {
    const local = await startApp({ upstream: { retries: 0, timeoutMs: 100 } });
    try {
      local.setMode('hang');
      const started = Date.now();
      const res = await fetch(`${local.base}/api/treatment?lat=45.5&lng=-100&radius=25`);
      assert.equal(res.status, 502);
      assert.equal((await res.json()).reason, 'timeout');
      assert.ok(Date.now() - started < 2000);
    } finally {
      await local.close();
    }
  });

  test('malformed and out-of-range params get a 400 that never reflects the raw input', async () => {
    const evil = 'EVIL%3Cscript%3Ealert(1)%3C%2Fscript%3E';
    const evilText = /EVIL|<script|alert\(1\)/;
    const cases = [
      // Coordinates: missing, blank, non-numeric, hex, exponent, Infinity, out of range.
      ...Object.entries(COORD_ENDPOINTS).flatMap(([route, extra]) => [
        `${route}?${extra}&lat=${evil}&lng=-122`,
        `${route}?${extra}&lat=48&lng=${evil}`,
        `${route}?${extra}&lat=0x30&lng=-122`,
        `${route}?${extra}&lat=4.8e1&lng=-122`,
        `${route}?${extra}&lat=Infinity&lng=-122`,
        `${route}?${extra}&lat=91&lng=-122`,
        `${route}?${extra}&lat=48&lng=-180.5`,
        `${route}?${extra}&lat=&lng=-122`,
        ...(route === '/api/region' || route === '/api/telehealth' ? [] : [`${route}?${extra}`]),
      ]),
      // Radius: not an allowed value, or not a plain integer.
      ...['/api/treatment', '/api/health-centers', '/api/nearby-summary', '/api/providers?type=va&x=1'].flatMap((r) => {
        const sep = r.includes('?') ? '&' : '?';
        return [`${r}${sep}lat=48&lng=-122&radius=${evil}`, `${r}${sep}lat=48&lng=-122&radius=13`,
          `${r}${sep}lat=48&lng=-122&radius=25.0`, `${r}${sep}lat=48&lng=-122&radius=0x19`, `${r}${sep}lat=48&lng=-122&radius=-25`];
      }),
      // Treatment and telehealth specifics.
      `/api/treatment?lat=48&lng=-122&kind=${evil}`,
      `/api/treatment?lat=48&lng=-122&page=${evil}`,
      '/api/treatment?lat=48&lng=-122&page=0',
      '/api/treatment?lat=48&lng=-122&page=41',
      '/api/treatment?lat=48&lng=-122&page=1.5',
      `/api/treatment?lat=48&lng=-122&codes=${evil}`,
      `/api/treatment?lat=48&lng=-122&codes=BU,${evil}`,
      `/api/treatment?lat=48&lng=-122&codes=${'BU,'.repeat(60)}`,
      `/api/telehealth?state=${evil}`,
      '/api/telehealth?state=FM',
      `/api/telehealth?state=WA&kind=${evil}`,
      `/api/telehealth?state=WA&codes=${evil}`,
      `/api/telehealth?state=WA&page=${evil}`,
      // Providers.
      `/api/providers?lat=48&lng=-122&type=${evil}`,
      `/api/providers?lat=48&lng=-122&type=va&filter=${evil}`,
      // Lookups.
      `/api/state?code=${evil}`,
      '/api/geocode',
      '/api/geocode?q=',
      `/api/geocode?q=${'a'.repeat(500)}${evil}`,
    ];
    for (const c of cases) {
      const res = await get(c);
      assert.equal(res.status, 400, c);
      const body = await res.json();
      assert.equal(typeof body.error, 'string', c);
      assert.ok(body.error.length > 0 && body.error.length < 200, c);
      assert.doesNotMatch(body.error, evilText, `${c} reflected input`);
      assert.doesNotMatch(body.error, /0x|4\.8e1|Infinity|1234|aaaa/, `${c} reflected input`);
    }
  });

  test('a ZIP that is not a ZIP finds no region and is never echoed back', async () => {
    // main answers these with 200 and region: null (test/wave7-integration.test.js).
    const evil = 'EVIL%3Cscript%3Ealert(1)%3C%2Fscript%3E';
    for (const zip of [evil, '1234', 'INVALID_ZIP']) {
      const res = await get(`/api/region?zip=${zip}`);
      assert.equal(res.status, 200, zip);
      const text = await res.text();
      assert.equal(JSON.parse(text).region, null, zip);
      assert.doesNotMatch(text, /EVIL|<script|alert\(1\)|1234|INVALID/, zip);
    }
  });

  test('valid edge values are still accepted', async () => {
    for (const c of [
      '/api/health-centers?lat=48.75&lng=-122.48',             // default radius
      '/api/health-centers?lat=%2B48.75&lng=-122.48&radius=5', // explicit + sign
      '/api/health-centers?lat=.5&lng=-122.48&radius=250',
      '/api/treatment?lat=48.75&lng=-122.48&radius=200&kind=MH&page=40&codes=BU,%20MD',
      '/api/region?zip=98225-1234',
      '/api/state?code=wa',
      '/api/telehealth?state=wa',
      '/api/geocode?q=Bellingham,%20WA',
    ]) {
      const res = await get(c);
      assert.equal(res.status, 200, c);
    }
  });

  test('unknown state code is a 404 with a fixed message', async () => {
    const res = await get('/api/state?code=ZZ');
    assert.equal(res.status, 404);
    assert.doesNotMatch((await res.json()).error, /ZZ/);
  });

  test('TRUST_PROXY: rate limit keys on the proxy-appended address, so forged X-Forwarded-For entries cannot dodge it', async () => {
    const local = await startApp({ trustProxy: 1, rateLimit: { windowMs: 60_000, max: 3 } });
    try {
      const statuses = [];
      for (let i = 0; i < 5; i++) {
        // A client sends a different fake address each time; the trusted proxy appends the real one.
        const res = await fetch(`${local.base}/api/meta`, { headers: { 'X-Forwarded-For': `10.0.0.${i}, 203.0.113.7` } });
        statuses.push(res.status);
      }
      assert.deepEqual(statuses, [200, 200, 200, 429, 429]);
      const other = await fetch(`${local.base}/api/meta`, { headers: { 'X-Forwarded-For': '198.51.100.9' } });
      assert.equal(other.status, 200, 'a different real client has its own budget');
      const limited = await fetch(`${local.base}/api/meta`, { headers: { 'X-Forwarded-For': '203.0.113.7' } });
      assert.ok(Number(limited.headers.get('retry-after')) > 0, '429 carries Retry-After');
    } finally {
      await local.close();
    }
  });

  // /api/health is never rate limited (liveness probes), so these use /api/meta.
  test('without TRUST_PROXY, X-Forwarded-For is ignored entirely', async () => {
    const local = await startApp({ trustProxy: 0, rateLimit: { windowMs: 60_000, max: 2 } });
    try {
      const statuses = [];
      for (let i = 0; i < 3; i++) {
        statuses.push((await fetch(`${local.base}/api/meta`, { headers: { 'X-Forwarded-For': `10.0.0.${i}` } })).status);
      }
      assert.deepEqual(statuses, [200, 200, 429]);
    } finally {
      await local.close();
    }
  });

  test('clientKey picks the right hop and trustProxyFromEnv parses the environment', () => {
    const req = (xff) => ({ headers: { 'x-forwarded-for': xff }, socket: { remoteAddress: '127.0.0.1' } });
    assert.equal(clientKey(req('1.1.1.1, 2.2.2.2, 3.3.3.3'), 1), '3.3.3.3');
    assert.equal(clientKey(req('1.1.1.1, 2.2.2.2, 3.3.3.3'), 2), '2.2.2.2');
    assert.equal(clientKey(req('1.1.1.1'), 3), '127.0.0.1', 'fewer entries than hops: the header is not trusted, use the socket');
    assert.equal(clientKey(req('1.1.1.1'), true), '1.1.1.1');
    assert.equal(clientKey(req('1.1.1.1'), 0), '127.0.0.1');
    assert.equal(clientKey(req(undefined), 1), '127.0.0.1');
    assert.equal(clientKey(req(['1.1.1.1', '2.2.2.2']), 1), '2.2.2.2');
    assert.equal(trustProxyFromEnv({}), 0);
    assert.equal(trustProxyFromEnv({ TRUST_PROXY: '1' }), 1);
    assert.equal(trustProxyFromEnv({ TRUST_PROXY: '2' }), 2);
    assert.equal(trustProxyFromEnv({ TRUST_PROXY: 'true' }), 1);
    assert.equal(trustProxyFromEnv({ TRUST_PROXY: 'yes please' }), 0);
    assert.equal(trustProxyFromEnv({ VERCEL: '1' }), 1);
  });

  test('/api/freshness reports directory and per-dataset dates from data/meta.json', async () => {
    const meta = readJson(path.join(here, '..', 'data', 'meta.json'));
    const res = await get('/api/freshness');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.directoryUpdated, new Date(meta.builtAt).toISOString());
    assert.ok(Number.isInteger(body.directoryAgeDays) && body.directoryAgeDays >= 0);
    assert.equal(body.treatment.live, true);
    assert.equal(body.treatment.maxCacheMinutes, 60, 'matches the one-hour promise on the privacy page');
    assert.deepEqual(Object.keys(body.datasets).sort(), Object.keys(meta.sources).sort());
    const hc = body.datasets.healthCenters;
    assert.equal(hc.count, meta.sources.healthCenters.count);
    assert.equal(hc.sourceUpdated, new Date(meta.sources.healthCenters.lastModified).toISOString());
    assert.equal(hc.builtAt, new Date(meta.sources.healthCenters.builtAt).toISOString());
    for (const [key, d] of Object.entries(body.datasets)) {
      for (const f of ['sourceUpdated', 'builtAt']) {
        assert.ok(d[f] === null || !Number.isNaN(Date.parse(d[f])), `${key}.${f}`);
      }
      assert.ok(!('url' in d) && !('urls' in d), 'build-time download URLs are not exposed');
    }

    const legacy = await (await get('/api/meta')).json();
    assert.equal(legacy.directoryUpdated, body.directoryUpdated, '/api/meta carries the headline date too');
    assert.equal(legacy.healthCenters.updated, meta.sources.healthCenters.lastModified, 'existing client field unchanged');
  });
});
