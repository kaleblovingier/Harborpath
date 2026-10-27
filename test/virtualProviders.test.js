import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { DATA_LOADERS } from '../src/data.js';
import { createApp } from '../src/app.js';
import { createVirtualProviders, validateProvider, validateRegistry } from '../src/virtualProviders.js';
import { fromVirtualProvider } from '../public/js/match/engine.js';

const silent = { error: () => {} };
const params = (o = {}) => new URLSearchParams(o);

// TEST FIXTURE ONLY: not a real program.
const good = (over = {}) => ({
  id: 'fixture-program',
  name: 'Fixture Program',
  officialUrl: 'https://example.org/',
  enrollUrl: 'https://example.org/start',
  conditions: ['opioid'],
  services: ['moud-buprenorphine'],
  serviceStates: ['WA', 'OR'],
  insurance: { claims: [{ payer: 'medicaid', detail: 'Accepts Medicaid', states: ['WA'], sourceIndex: 0 }], selfPay: null },
  sources: [{ url: 'https://example.org/insurance', title: 'Insurance', accessedAt: '2026-10-27', type: 'official' }],
  verificationStatus: 'provider-reported',
  reviewStatus: 'approved',
  reviewedBy: 'fixture-reviewer',
  reviewedAt: '2026-10-27',
  ...over,
});

test('the shipped registry passes every data-quality rule', () => {
  const registry = DATA_LOADERS.virtualProviders();
  assert.deepEqual(validateRegistry(registry), []);
  for (const p of registry.providers) {
    assert.equal(p.verificationStatus, 'provider-reported', `${p.id} must not claim independent verification`);
    // The registry must convert cleanly for the matching engine.
    const c = fromVirtualProvider(p);
    assert.equal(c.virtualOnly, true);
  }
});

test('records pending human review are never served', () => {
  const registry = DATA_LOADERS.virtualProviders();
  const vp = createVirtualProviders(registry, { logger: silent });
  const pending = registry.providers.filter((p) => p.reviewStatus !== 'approved').length;
  assert.equal(vp.pending, pending);
  assert.equal(vp.search(params()).results.length, registry.providers.length - pending);
});

test('validation rejects unsourced, insecure, or overclaiming records', () => {
  assert.deepEqual(validateProvider(good()), []);
  const cases = {
    'no sources': good({ sources: [] }),
    'third-party only': good({ sources: [{ url: 'https://news.example/x', accessedAt: '2026-10-27', type: 'third-party' }], insurance: { claims: [] } }),
    'http url': good({ officialUrl: 'http://example.org/' }),
    'javascript url': good({ enrollUrl: 'javascript:alert(1)' }),
    'uncited claim': good({ insurance: { claims: [{ payer: 'medicaid', detail: 'x', sourceIndex: 5 }] } }),
    'in-network without a plan': good({ insurance: { claims: [{ payer: 'private', detail: 'In-network with Aetna', sourceIndex: 0 }] } }),
    'uncited price': good({ insurance: { claims: [], selfPay: { available: true, price: '$99', sourceIndex: null } } }),
    'claims verification': good({ verificationStatus: 'verified' }),
    'approved without reviewer': good({ reviewedBy: null }),
    'bad state': good({ serviceStates: ['ZZ'] }),
    'unknown service': good({ services: ['miracle-cure'] }),
  };
  for (const [name, record] of Object.entries(cases)) {
    assert.ok(validateProvider(record).length > 0, `should reject: ${name}`);
  }
  assert.ok(validateRegistry({ providers: [good(), good()] }).some((e) => e.includes('duplicate')));
});

test('state search omits programs not offered there and flags unknown coverage', () => {
  const vp = createVirtualProviders({
    providers: [good(), good({ id: 'unknown-states', name: 'Unknown States', serviceStates: null }), good({ id: 'pending', reviewStatus: 'pending-review' })],
  }, { logger: silent });
  const tx = vp.search(params({ state: 'tx' }));
  assert.equal(tx.state, 'TX');
  assert.deepEqual(tx.results.map((r) => r.id), ['unknown-states']);
  assert.equal(tx.results[0].statesUnknown, true);
  assert.deepEqual(vp.search(params({ state: 'WA' })).results.map((r) => r.id).sort(), ['fixture-program', 'unknown-states']);
  assert.match(tx.disclosure, /no partnership/);
  assert.throws(() => vp.search(params({ state: 'XX' })), /state must be/);
});

test('invalid records are logged once and skipped, never served', () => {
  const logs = [];
  const vp = createVirtualProviders({ providers: [good({ officialUrl: 'ftp://x' })] }, { logger: { error: (m) => logs.push(m) } });
  assert.equal(vp.count, 0);
  assert.equal(logs.length, 1);
});

test('GET /api/virtual-providers responds with a disclosure and validates state', async () => {
  const server = createServer(createApp({ fetchImpl: async () => { throw new Error('no network'); }, logger: silent }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const ok = await fetch(`${base}/api/virtual-providers?state=WA`);
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get('cache-control'), 'no-store');
    const body = await ok.json();
    assert.equal(body.state, 'WA');
    assert.ok(Array.isArray(body.results));
    assert.ok(typeof body.disclosure === 'string');
    const bad = await fetch(`${base}/api/virtual-providers?state=ZZ`);
    assert.equal(bad.status, 400);
  } finally {
    await new Promise((r) => server.close(r));
  }
});
