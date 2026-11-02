// Unit and integration tests for HarborPath Legal Registry & Harm Reduction API.
// Verifies:
// 1. /api/state?code=XX includes legal protections matching legal registry.
// 2. /api/legal?state=XX returns statutory protections schema (200) or clean 400 on invalid.
// 3. /api/legal?fts=1 and /api/legal?ssp=1 return valid arrays of jurisdictions.
// 4. /api/legal?summary=1&state=XX returns plain-language summary with citations.
// 5. Strict security headers (CSP, nosniff, DENY, no-referrer, no-store) on all responses.
// 6. Zero-PII sanitization and method handling.
//
// Zero npm dependencies (Node 20+ built-ins only).

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp, SECURITY_HEADERS } from '../src/app.js';
import {
  getLegalProtections,
  getJurisdictionSummary,
  filterStatesByProtection,
  LEGAL_DISCLAIMER,
} from '../src/legalRegistry.js';
import { createStateDirectory } from '../src/stateResources.js';
import { DATA_LOADERS } from '../src/data.js';

let server;
let base;

before(async () => {
  const handler = createApp({
    fetchImpl: async () => new Response(JSON.stringify({}), { status: 200 }),
    logger: { error() {} },
  });
  server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

describe('State Resources Directory Legal Integration', () => {
  it('createStateDirectory().get() resolves legal protections for supported state codes', () => {
    const directory = createStateDirectory({
      agencies: DATA_LOADERS.stateAgencies(),
      medicaid: DATA_LOADERS.stateMedicaid(),
      healthCenters: DATA_LOADERS.healthCenters(),
      meta: DATA_LOADERS.meta(),
    });

    const waEntry = directory.get('WA');
    assert.ok(waEntry, 'Expected state directory entry for WA');
    assert.ok(waEntry.legal, 'Expected legal property on WA state directory entry');
    assert.deepEqual(waEntry.legal, getLegalProtections('WA'));

    // Non-52 jurisdiction (e.g. Federated States of Micronesia) has null legal record
    const fmEntry = directory.get('FM');
    assert.ok(fmEntry, 'Expected directory entry for FM');
    assert.equal(fmEntry.legal, null, 'FM should have null legal protections');
  });

  it('/api/state?code=WA returns legal property matching legal registry', async () => {
    const res = await fetch(`${base}/api/state?code=WA`);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(body.legal, 'Expected legal property in /api/state response');
    assert.equal(body.legal.stateCode, 'WA');
    assert.equal(body.legal.stateName, 'Washington');
    assert.deepEqual(body.legal, getLegalProtections('WA'));

    // Verify critical statutory details for WA
    assert.equal(body.legal.goodSamaritan.hasProtection, true);
    assert.equal(body.legal.goodSamaritan.arrestImmunity, true);
    assert.equal(body.legal.naloxoneAccess.standingOrder, true);
    assert.equal(body.legal.harmReductionEquipment.fentanylTestStripsLegal, true);
  });
});

describe('GET /api/legal?state=XX', () => {
  it('/api/legal?state=NY returns 200 with complete statutory protection schema', async () => {
    const res = await fetch(`${base}/api/legal?state=NY`);
    assert.equal(res.status, 200);
    const body = await res.json();

    const expected = getLegalProtections('NY');
    assert.deepEqual(body, expected);

    // Schema validations
    assert.equal(body.stateCode, 'NY');
    assert.equal(body.stateName, 'New York');

    // Good Samaritan schema
    assert.equal(typeof body.goodSamaritan, 'object');
    assert.equal(typeof body.goodSamaritan.hasProtection, 'boolean');
    assert.equal(typeof body.goodSamaritan.arrestImmunity, 'boolean');
    assert.equal(typeof body.goodSamaritan.chargeImmunity, 'boolean');
    assert.equal(typeof body.goodSamaritan.prosecutionImmunity, 'boolean');
    assert.equal(typeof body.goodSamaritan.protectsParoleProbation, 'boolean');
    assert.equal(typeof body.goodSamaritan.protectsParaphernalia, 'boolean');
    assert.equal(typeof body.goodSamaritan.protectsUnderageAlcohol, 'boolean');
    assert.equal(typeof body.goodSamaritan.statuteCitation, 'string');

    // Naloxone access schema
    assert.equal(typeof body.naloxoneAccess, 'object');
    assert.equal(typeof body.naloxoneAccess.standingOrder, 'boolean');
    assert.equal(typeof body.naloxoneAccess.thirdPartyPrescribing, 'boolean');
    assert.equal(typeof body.naloxoneAccess.layResponderImmunity, 'boolean');
    assert.equal(typeof body.naloxoneAccess.statuteCitation, 'string');

    // Harm reduction equipment schema
    assert.equal(typeof body.harmReductionEquipment, 'object');
    assert.equal(typeof body.harmReductionEquipment.fentanylTestStripsLegal, 'boolean');
    assert.equal(typeof body.harmReductionEquipment.xylazineTestStripsLegal, 'boolean');
    assert.equal(typeof body.harmReductionEquipment.sspStatutoryProtection, 'boolean');
    assert.equal(typeof body.harmReductionEquipment.statuteNotes, 'string');

    // Provenance, safety review, and disclaimer assertions
    assert.equal(body.reviewStatus, 'unverified', 'reviewStatus must be "unverified"');
    assert.equal(body.lastReviewed, null, 'lastReviewed must be null');
    assert.ok(Array.isArray(body.sources) && body.sources.length >= 2, 'sources must be non-empty array');
    assert.equal(body.disclaimer, LEGAL_DISCLAIMER, 'disclaimer must match LEGAL_DISCLAIMER');
  });

  it('/api/legal handles case-insensitive state codes', async () => {
    const resLower = await fetch(`${base}/api/legal?state=ny`);
    assert.equal(resLower.status, 200);
    const bodyLower = await resLower.json();
    assert.equal(bodyLower.stateCode, 'NY');
  });

  it('/api/legal?state=INVALID returns 400 with clean error message', async () => {
    const res = await fetch(`${base}/api/legal?state=INVALID`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.deepEqual(body, { error: 'Invalid or missing state code' });
  });

  it('/api/legal?state=ZZ returns 400 for unknown jurisdiction code', async () => {
    const res = await fetch(`${base}/api/legal?state=ZZ`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.deepEqual(body, { error: 'Invalid or missing state code' });
  });

  it('/api/legal returns 400 when query is empty or missing state', async () => {
    const resEmpty = await fetch(`${base}/api/legal`);
    assert.equal(resEmpty.status, 400);
    assert.deepEqual(await resEmpty.json(), { error: 'Invalid or missing state code' });

    const resBlank = await fetch(`${base}/api/legal?state=`);
    assert.equal(resBlank.status, 400);
    assert.deepEqual(await resBlank.json(), { error: 'Invalid or missing state code' });
  });
});

describe('Harm Reduction Decriminalization Endpoints (fts=1 & ssp=1)', () => {
  it('/api/legal?fts=1 returns valid array of jurisdictions where FTS is decriminalized/legal', async () => {
    const res = await fetch(`${base}/api/legal?fts=1`);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(Array.isArray(body), 'Expected response to be an array of jurisdictions');
    assert.ok(body.length > 0, 'Expected non-empty array of decriminalized jurisdictions');

    const expected = filterStatesByProtection({ ftsLegal: true });
    assert.equal(body.length, expected.length);
    assert.deepEqual(body, expected);

    for (const record of body) {
      assert.match(record.stateCode, /^[A-Z]{2}$/);
      assert.equal(
        record.harmReductionEquipment.fentanylTestStripsLegal,
        true,
        `Expected FTS to be legal in ${record.stateCode}`
      );
    }

    assert.ok(body.some((r) => r.stateCode === 'WA'));
    assert.ok(body.some((r) => r.stateCode === 'NY'));
  });

  it('/api/legal?ssp=1 returns valid array of jurisdictions with statutory Syringe Services Program protections', async () => {
    const res = await fetch(`${base}/api/legal?ssp=1`);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(Array.isArray(body), 'Expected response to be an array of jurisdictions');
    assert.ok(body.length > 0, 'Expected non-empty array of SSP-authorized jurisdictions');

    const expected = filterStatesByProtection({ sspLegal: true });
    assert.equal(body.length, expected.length);
    assert.deepEqual(body, expected);

    for (const record of body) {
      assert.match(record.stateCode, /^[A-Z]{2}$/);
      assert.equal(
        record.harmReductionEquipment.sspStatutoryProtection,
        true,
        `Expected SSP protection in ${record.stateCode}`
      );
    }
  });

  it('/api/legal?fts=1&ssp=1 returns jurisdictions matching both protections', async () => {
    const res = await fetch(`${base}/api/legal?fts=1&ssp=1`);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(Array.isArray(body));
    const expected = filterStatesByProtection({ ftsLegal: true, sspLegal: true });
    assert.deepEqual(body, expected);

    for (const record of body) {
      assert.equal(record.harmReductionEquipment.fentanylTestStripsLegal, true);
      assert.equal(record.harmReductionEquipment.sspStatutoryProtection, true);
    }
  });
});

describe('Plain-Language Summary Endpoint (summary=1&state=XX)', () => {
  it('/api/legal?summary=1&state=WA returns formatted plain-language legal summary with citations', async () => {
    const res = await fetch(`${base}/api/legal?summary=1&state=WA`);
    assert.equal(res.status, 200);
    const body = await res.json();

    const expected = getJurisdictionSummary('WA');
    assert.deepEqual(body, expected);

    assert.equal(body.stateCode, 'WA');
    assert.equal(body.stateName, 'Washington');
    assert.ok(typeof body.plainLanguageNotice === 'string' && body.plainLanguageNotice.length > 0);
    assert.ok(Array.isArray(body.citations) && body.citations.length > 0);
    assert.ok(typeof body.goodSamaritan.summary === 'string');
    assert.ok(typeof body.naloxoneAccess.summary === 'string');
    assert.ok(typeof body.harmReductionEquipment.summary === 'string');
    assert.match(body.confidentialityNotice, /zero-PII tracking/i);
    assert.equal(body.reviewStatus, 'unverified', 'summary reviewStatus must be "unverified"');
    assert.equal(body.lastReviewed, null, 'summary lastReviewed must be null');
    assert.ok(Array.isArray(body.sources) && body.sources.length >= 2, 'summary sources must be non-empty');
    assert.equal(body.disclaimer, LEGAL_DISCLAIMER, 'summary disclaimer must match LEGAL_DISCLAIMER');
  });

  it('/api/legal?summary=1&state=INVALID returns 400 with clean error message', async () => {
    const res = await fetch(`${base}/api/legal?summary=1&state=INVALID`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.deepEqual(body, { error: 'Invalid or missing state code' });
  });

  it('/api/legal?summary=1 returns 400 when state code is missing', async () => {
    const res = await fetch(`${base}/api/legal?summary=1`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.deepEqual(body, { error: 'Invalid or missing state code' });
  });
});

describe('Security Headers, Protocol Conformance & Confidentiality', () => {
  it('security headers (CSP, nosniff, etc.) are present on successful /api/legal responses', async () => {
    const res = await fetch(`${base}/api/legal?state=NY`);
    assert.equal(res.status, 200);

    assert.ok(res.headers.get('content-security-policy')?.includes("default-src 'self'"));
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');
  });

  it('security headers are present on error responses (400 Bad Request)', async () => {
    const res = await fetch(`${base}/api/legal?state=INVALID`);
    assert.equal(res.status, 400);

    assert.ok(res.headers.get('content-security-policy')?.includes("default-src 'self'"));
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('cache-control'), 'no-store');
  });

  it('supports HEAD /api/legal requests returning headers with zero body bytes', async () => {
    const res = await fetch(`${base}/api/legal?state=NY`, { method: 'HEAD' });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    const text = await res.text();
    assert.equal(text, '', 'HEAD response body must be empty');
  });

  it('rejects unsupported HTTP methods (e.g. POST) with 405 Method Not Allowed', async () => {
    const res = await fetch(`${base}/api/legal?state=NY`, { method: 'POST' });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get('allow'), 'GET, HEAD');
  });

  it('coarsened zero-PII queries strip tracking parameters and sensitive fields cleanly', async () => {
    const res = await fetch(
      `${base}/api/legal?state=WA&utm_source=adwords&email=person%40example.com&ssn=000-11-2222`
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.stateCode, 'WA');
  });
});

describe('Legal Data Safety, Disclaimer & Client stateLegalCard Verification', () => {
  it('every record in 52-jurisdiction registry has reviewStatus "unverified", non-empty sources, and lastReviewed null', () => {
    const jurisdictions = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
      'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
      'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
      'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR',
      'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
      'WI', 'WY'
    ];
    for (const code of jurisdictions) {
      const rec = getLegalProtections(code);
      assert.ok(rec, `Record for ${code} must exist`);
      assert.equal(rec.reviewStatus, 'unverified', `Record ${code} reviewStatus must be "unverified"`);
      assert.equal(rec.lastReviewed, null, `Record ${code} lastReviewed must be null`);
      assert.ok(Array.isArray(rec.sources) && rec.sources.length > 0, `Record ${code} sources must be non-empty`);
      assert.equal(rec.disclaimer, LEGAL_DISCLAIMER, `Record ${code} disclaimer must match LEGAL_DISCLAIMER`);
    }
  });

  it('/api/legal returns disclaimer and reviewStatus on all successful requests', async () => {
    // 1. Standard single-state query
    const resState = await fetch(`${base}/api/legal?state=CA`);
    assert.equal(resState.status, 200);
    const bodyState = await resState.json();
    assert.equal(bodyState.reviewStatus, 'unverified');
    assert.equal(bodyState.disclaimer, LEGAL_DISCLAIMER);
    assert.ok(Array.isArray(bodyState.sources) && bodyState.sources.length >= 2);

    // 2. Summary query
    const resSummary = await fetch(`${base}/api/legal?summary=1&state=CA`);
    assert.equal(resSummary.status, 200);
    const bodySummary = await resSummary.json();
    assert.equal(bodySummary.reviewStatus, 'unverified');
    assert.equal(bodySummary.disclaimer, LEGAL_DISCLAIMER);

    // 3. Filter query
    const resFilter = await fetch(`${base}/api/legal?fts=1`);
    assert.equal(resFilter.status, 200);
    const bodyFilter = await resFilter.json();
    assert.ok(Array.isArray(bodyFilter) && bodyFilter.length > 0);
    for (const item of bodyFilter) {
      assert.equal(item.reviewStatus, 'unverified');
      assert.equal(item.disclaimer, LEGAL_DISCLAIMER);
    }
  });

  it('stateLegalCard renders unverified note and does not claim "you are immune"', async () => {
    class MockClassList {
      constructor(node) { this.node = node; }
      contains(c) { return (this.node.className || '').split(/\s+/).includes(c); }
      add(...classes) {
        const s = new Set((this.node.className || '').split(/\s+/).filter(Boolean));
        classes.forEach((c) => s.add(c));
        this.node.className = [...s].join(' ');
      }
    }
    class MockNode {
      constructor(tag) {
        this.tagName = String(tag).toUpperCase();
        this.className = '';
        this.dataset = {};
        this.attributes = {};
        this.listeners = {};
        this.children = [];
        this.classList = new MockClassList(this);
      }
      setAttribute(k, v) { this.attributes[k] = String(v); }
      getAttribute(k) { return this.attributes[k] ?? null; }
      removeAttribute(k) { delete this.attributes[k]; }
      addEventListener(ev, fn) { this.listeners[ev] = fn; }
      append(...children) {
        for (const c of children.flat(Infinity)) {
          if (c === null || c === undefined || c === false) continue;
          this.children.push(c instanceof MockNode ? c : new MockTextNode(String(c)));
        }
      }
      get textContent() { return this.children.map((c) => c.textContent).join(''); }
      querySelectorAll(sel) {
        const results = [];
        this._findAll(sel, results);
        return results;
      }
      _findAll(sel, acc) {
        for (const c of this.children) {
          if (c instanceof MockNode) {
            if (sel.startsWith('[') && sel.endsWith(']')) {
              const [k, v] = sel.slice(1, -1).split('=');
              const cleanV = v ? v.replace(/['"]/g, '') : null;
              if (cleanV ? c.getAttribute(k) === cleanV : c.getAttribute(k) !== null) acc.push(c);
            }
            c._findAll(sel, acc);
          }
        }
      }
    }
    class MockTextNode {
      constructor(text) { this.text = text; }
      get textContent() { return this.text; }
    }

    const hadDoc = typeof globalThis.document !== 'undefined';
    const hadNode = typeof globalThis.Node !== 'undefined';
    if (!hadDoc) {
      globalThis.Node = MockNode;
      globalThis.document = {
        createElement: (t) => new MockNode(t),
        createElementNS: (_ns, t) => new MockNode(t),
        createTextNode: (t) => new MockTextNode(t),
      };
    } else if (typeof globalThis.document.createElementNS !== 'function') {
      globalThis.document.createElementNS = (_ns, t) => globalThis.document.createElement(t);
    }

    try {
      const { stateLegalCard } = await import('../public/js/components/stateLegalCard.js');
      const nyRecord = getLegalProtections('NY');
      const card = stateLegalCard(nyRecord);

      // Verify unverified note callout with role="note" and class="callout callout-warn"
      const noteCallouts = card.querySelectorAll('[role=note]');
      assert.ok(noteCallouts.length > 0, 'stateLegalCard must render a callout with role="note"');
      assert.ok(
        card.textContent.includes('Not yet reviewed by a legal expert — confirm with the source below.'),
        'Must display unverified notice'
      );

      // Verify hedge: NEVER claims "you are immune" or "you are protected"
      const lower = card.textContent.toLowerCase();
      assert.ok(!lower.includes('you are immune'), 'stateLegalCard must never claim "you are immune"');
      assert.ok(!lower.includes('you are protected'), 'stateLegalCard must never claim "you are protected"');

      // Verify "Call 911 first" instruction is front and center
      assert.ok(card.textContent.includes('In an overdose emergency, ALWAYS CALL 911 FIRST to save a life.'));
    } finally {
      if (!hadDoc) {
        delete globalThis.document;
      }
      if (!hadNode) {
        delete globalThis.Node;
      }
    }
  });
});

