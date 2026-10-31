import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, statSync } from 'node:fs';
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
import { createApp, SECURITY_HEADERS } from '../src/app.js';
import { readJson } from '../src/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(here, '..');
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
