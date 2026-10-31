import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rankMatches, scoreCandidate, assessCoverage, normalizeProfile, fromFacility, fromVirtualProvider, searchPlan,
} from '../public/js/match/engine.js';

// TEST FIXTURES ONLY. These are invented listings shaped like normalized
// FindTreatment.gov rows; they are never shipped as data or shown to users.
const NOW = Date.parse('2026-10-27T00:00:00Z');
const fac = (id, codes, extra = {}) => fromFacility({
  id, name: `Fixture ${id}`, codes, miles: extra.miles ?? 5, address: { state: extra.state ?? 'WA' }, ...extra,
}, { via: extra.via ?? 'local' });

const virtual = (over = {}) => fromVirtualProvider({
  id: 'fixture-virtual',
  name: 'Fixture Virtual Program',
  conditions: ['opioid', 'alcohol', 'stimulant'],
  services: ['counseling', 'moud-buprenorphine', 'contingency-management'],
  serviceStates: ['WA', 'OR'],
  insurance: { claims: [{ payer: 'medicaid', detail: 'Accepts Medicaid', states: ['WA'] }], selfPay: null },
  languages: ['en'],
  sources: [{ url: 'https://example.invalid', accessedAt: '2026-10-27', type: 'official' }],
  ...over,
});

test('WA Medicaid stimulant scenario: telehealth, limited transport, evening hours', () => {
  const profile = {
    helpWith: 'substance', substances: ['stimulant'], settings: ['outpatient'], coverage: 'medicaid',
    modality: 'virtual', timing: 'evening', barriers: ['transportation'], state: 'WA', maxMiles: 25,
  };
  const good = fac('cm-tele-md', ['SA', 'OP', 'CMI', 'TELE', 'MD', 'SS'], { miles: 12 });
  const noMedicaid = fac('cm-tele-pi', ['SA', 'OP', 'CMI', 'TELE', 'PI', 'CASH'], { miles: 3 });
  const inPersonOnly = fac('in-person', ['SA', 'OP', 'MD'], { miles: 2 });
  const out = rankMatches(profile, [noMedicaid, inPersonOnly, good, virtual()], { now: NOW });

  const ids = out.matches.map((m) => m.id);
  assert.ok(ids.indexOf('ft:cm-tele-md') < ids.indexOf('ft:cm-tele-pi'), 'listed Medicaid outranks unlisted');
  assert.ok(ids.indexOf('ft:cm-tele-md') < ids.indexOf('ft:in-person'), 'telehealth outranks in-person-only');

  const top = out.matches.find((m) => m.id === 'ft:cm-tele-md');
  assert.equal(top.coverage.tier, 'provider-reported', 'SAMHSA payment codes are never "confirmed"');
  assert.ok(top.verify.some((v) => v.code === 'verify.hours'), 'hours are unknown and must be verified');
  assert.ok(top.verify.some((v) => v.code === 'verify.plan'), 'specific Medicaid plan must be verified');
  assert.ok(top.reasons.some((r) => r.code === 'clinical.substance' && r.params.substance === 'stimulant'));

  const v = out.matches.find((m) => m.id === 'vp:fixture-virtual');
  assert.equal(v.coverage.tier, 'provider-reported');
});

test('never invents results: no candidates gives no matches', () => {
  const out = rankMatches({ coverage: 'medicaid', substances: ['opioid'] }, []);
  assert.deepEqual(out.matches, []);
  assert.deepEqual(out.excluded, []);
});

test('payment or sponsorship fields cannot change a score', () => {
  const profile = { substances: ['opioid'], coverage: 'private' };
  const base = fac('a', ['SA', 'BU', 'PI', 'OP']);
  const paid = fac('a', ['SA', 'BU', 'PI', 'OP']);
  Object.assign(paid, { sponsored: true, paidPlacement: true, bid: 1e6, priority: 99 });
  paid.record = { ...paid.record, sponsored: true, featured: true };
  assert.equal(scoreCandidate(profile, paid, { now: NOW }).score, scoreCandidate(profile, base, { now: NOW }).score);
});

test('"confirmed" tier requires an explicit, sourced verification', () => {
  const profile = normalizeProfile({ coverage: 'medicaid', state: 'WA' });
  assert.equal(assessCoverage(profile, fac('x', ['MD'])).tier, 'provider-reported');
  const verified = fac('y', ['MD'], { networkVerifications: [{ payer: 'medicaid', source: 'WA HCA directory', verifiedAt: '2026-10-01' }] });
  assert.equal(assessCoverage(profile, verified).tier, 'confirmed');
  const unsourced = fac('z', ['MD'], { networkVerifications: [{ payer: 'medicaid' }] });
  assert.equal(assessCoverage(profile, unsourced).tier, 'provider-reported');
});

test('coverage tiers: unknown vs not-listed vs possible', () => {
  const med = normalizeProfile({ coverage: 'medicaid' });
  assert.equal(assessCoverage(med, fac('none', ['SA', 'OP'])).tier, 'unknown');
  assert.equal(assessCoverage(med, fac('pi', ['SA', 'PI'])).tier, 'not-listed');
  assert.equal(assessCoverage(med, fac('ss', ['SA', 'PI', 'SS'])).tier, 'possible');
  assert.equal(assessCoverage(med, fac('si', ['SA', 'SI'])).tier, 'possible');
});

test('Medicaid is state-specific: an out-of-state facility is only "possible"', () => {
  const profile = normalizeProfile({ coverage: 'medicaid', state: 'WA' });
  const inState = assessCoverage(profile, fac('wa', ['SA', 'MD'], { state: 'WA' }));
  const across = assessCoverage(profile, fac('or', ['SA', 'MD'], { state: 'OR' }));
  assert.equal(inState.tier, 'provider-reported');
  assert.equal(across.tier, 'possible');
  assert.deepEqual(across.reasons[0], { code: 'coverage.medicaidOtherState', params: { state: 'OR' } });
  // Private insurance is not limited this way.
  assert.equal(assessCoverage(normalizeProfile({ coverage: 'private', state: 'WA' }), fac('or-pi', ['PI'], { state: 'OR' })).tier, 'provider-reported');
});

test('facility grant funding alone is not an affordability promise', () => {
  const profile = normalizeProfile({ coverage: 'uninsured' });
  const grant = assessCoverage(profile, fac('grant', ['SA', 'SAMHSA']));
  assert.equal(grant.tier, 'possible');
  assert.ok(grant.verify.some((v) => v.code === 'verify.price'));
  assert.equal(assessCoverage(profile, fac('sliding', ['SA', 'SS'])).tier, 'provider-reported');
});

test('uninsured: free and sliding-scale programs rank above cash-only', () => {
  const profile = { coverage: 'uninsured', needsFinancialHelp: true, substances: ['alcohol'] };
  const out = rankMatches(profile, [
    fac('cash', ['SA', 'PMAT', 'CASH'], { miles: 1 }),
    fac('free', ['SA', 'PMAT', 'NP', 'SAMHSA'], { miles: 9 }),
    fac('sliding', ['SA', 'PMAT', 'SS'], { miles: 6 }),
  ], { now: NOW });
  assert.equal(out.matches.at(-1).id, 'ft:cash');
  const free = out.matches.find((m) => m.id === 'ft:free');
  assert.ok(free.coverage.affordability.includes('free'));
  const cash = out.matches.find((m) => m.id === 'ft:cash');
  assert.ok(cash.verify.some((v) => v.code === 'verify.price'));
});

test('opioid use: facilities stating they do not treat OUD are excluded with a reason', () => {
  const out = rankMatches({ substances: ['opioid'], medications: ['buprenorphine'] }, [
    fac('noop', ['SA', 'NOOP', 'OP']),
    fac('bup', ['SA', 'BU', 'OP']),
    fac('dui', ['SA', 'DUIO']),
  ], { now: NOW });
  assert.deepEqual(out.matches.map((m) => m.id), ['ft:bup']);
  assert.deepEqual(out.excluded.map((e) => e.reason.code).sort(), ['exclude.doesNotTreat', 'exclude.duiOnly']);
});

test('requested medication or setting that is not listed is reported as missing, not hidden', () => {
  const out = rankMatches({ substances: ['opioid'], medications: ['methadone'], settings: ['residential'] }, [
    fac('op-bup', ['SA', 'BU', 'OP']),
  ], { now: NOW });
  assert.equal(out.matches.length, 1);
  const codes = out.matches[0].missing.map((m) => m.code);
  assert.deepEqual(codes.sort(), ['missing.medication', 'missing.setting']);
});

test('co-occurring mental health needs favor integrated programs', () => {
  const out = rankMatches({ helpWith: 'both', substances: ['alcohol'], populations: ['co-occurring'] }, [
    fac('sa-only', ['SA', 'OP', 'PMAT'], { miles: 1 }),
    fac('integrated', ['SA', 'MH', 'MHSU', 'OP', 'PMAT'], { miles: 8 }),
  ], { now: NOW });
  assert.equal(out.matches[0].id, 'ft:integrated');
  assert.ok(out.matches[1].verify.some((v) => v.code === 'verify.mentalHealth'));
});

test('in-person preference: distance dominates and virtual-only programs are excluded', () => {
  const out = rankMatches({ modality: 'in-person', state: 'WA', maxMiles: 25 }, [
    fac('far', ['SA', 'OP'], { miles: 22 }),
    fac('near', ['SA', 'OP'], { miles: 2 }),
    virtual(),
  ], { now: NOW });
  assert.deepEqual(out.matches.map((m) => m.id), ['ft:near', 'ft:far']);
  assert.equal(out.excluded[0].reason.code, 'exclude.virtualOnly');
});

test('virtual programs respect state availability; physical location is not service area', () => {
  const out = rankMatches({ modality: 'virtual', state: 'TX' }, [virtual()], { now: NOW });
  assert.equal(out.matches.length, 0);
  assert.deepEqual(out.excluded[0].reason, { code: 'exclude.notInState', params: { state: 'TX' } });

  const unknownStates = rankMatches({ modality: 'virtual', state: 'TX' }, [virtual({ serviceStates: null })], { now: NOW });
  assert.equal(unknownStates.matches.length, 1);
  assert.ok(unknownStates.matches[0].verify.some((v) => v.code === 'verify.stateAvailability'));

  const tele = rankMatches({ modality: 'virtual', state: 'TX' }, [fac('wa-tele', ['SA', 'TELE'], { via: 'telehealth', state: 'WA' })], { now: NOW });
  assert.equal(tele.excluded[0].reason.code, 'exclude.notInState');
});

test('demographic preferences never exclude anyone', () => {
  const candidates = [
    fac('adult-only', ['SA', 'OP', 'ADLT']),
    fac('men', ['SA', 'OP', 'MN']),
    fac('english', ['SA', 'OP']),
  ];
  const profile = {
    ageGroup: 'youth', language: 'es', populations: ['women', 'lgbtq', 'veteran', 'pregnant', 'faith-based'],
  };
  const out = rankMatches(profile, candidates, { now: NOW });
  assert.equal(out.matches.length, 3);
  assert.equal(out.excluded.length, 0);
  const adult = out.matches.find((m) => m.id === 'ft:adult-only');
  assert.ok(adult.verify.some((v) => v.code === 'verify.age'));
  // No federal field for LGBTQ+-affirming care: asked about, never assumed.
  assert.ok(adult.verify.some((v) => v.code === 'verify.population' && v.params.population === 'lgbtq'));
});

test('matching preferences add points and an explanation', () => {
  const profile = { language: 'es', populations: ['veteran'] };
  const plain = scoreCandidate(profile, fac('p', ['SA', 'OP']), { now: NOW });
  const fit = scoreCandidate(profile, fac('f', ['SA', 'OP', 'SP', 'VET']), { now: NOW });
  assert.ok(fit.score > plain.score);
  assert.ok(fit.reasons.some((r) => r.code === 'pref.language'));
  assert.ok(fit.reasons.some((r) => r.code === 'pref.population'));
});

test('stale or undated registry records are flagged for verification', () => {
  const old = virtual({ sources: [{ url: 'https://example.invalid', accessedAt: '2024-01-01', type: 'official' }] });
  const m = scoreCandidate({ modality: 'virtual', state: 'WA' }, old, { now: NOW });
  assert.equal(m.stale, true);
  assert.ok(m.verify.some((v) => v.code === 'verify.stale'));
  const fresh = scoreCandidate({ modality: 'virtual', state: 'WA' }, virtual(), { now: NOW });
  assert.equal(fresh.stale, false);
  const undated = scoreCandidate({ modality: 'virtual', state: 'WA' }, virtual({ sources: [] }), { now: NOW });
  assert.equal(undated.stale, true);
});

test('incomplete listings stay visible but ask for verification', () => {
  const m = scoreCandidate({ coverage: 'private' }, fac('sparse', ['SA']), { now: NOW });
  assert.equal(m.coverage.tier, 'unknown');
  assert.ok(m.verify.some((v) => v.code === 'verify.sparse'));
  assert.ok(m.verify.some((v) => v.code === 'verify.noPaymentInfo'));
});

test('duplicates from local and statewide searches merge, keeping the distance', () => {
  const local = fac('dup', ['SA', 'TELE'], { miles: 4 });
  const statewide = fac('dup', ['SA', 'TELE'], { miles: null, via: 'telehealth' });
  const out = rankMatches({ state: 'WA' }, [statewide, local], { now: NOW });
  assert.equal(out.matches.length, 1);
  assert.equal(out.matches[0].candidate.miles, 4);
});

test('profile normalization drops unknown values and keeps sensitive data out of the search plan', () => {
  const p = normalizeProfile({ coverage: 'gold-plan', substances: ['opioid', 'xyz'], state: 'wa', language: 'en' });
  assert.equal(p.coverage, 'unsure');
  assert.deepEqual(p.substances, ['opioid']);
  assert.equal(p.state, null);
  assert.equal(p.language, null);

  const plan = searchPlan({ coverage: 'medicaid', substances: ['opioid'], populations: ['pregnant'], modality: 'either', state: 'WA', maxMiles: 30 });
  const serialized = JSON.stringify(plan);
  for (const secret of ['medicaid', 'opioid', 'pregnant']) assert.ok(!serialized.includes(secret));
  assert.equal(plan.radius, 50);
  assert.equal(plan.telehealth, true);
  assert.equal(searchPlan({ modality: 'in-person' }).telehealth, false);
});

test('ranking is deterministic: ties break by distance, then name', () => {
  const out = rankMatches({}, [fac('b', ['SA'], { miles: 3 }), fac('a', ['SA'], { miles: 3 }), fac('c', ['SA'], { miles: 1 })], { now: NOW });
  assert.deepEqual(out.matches.map((m) => m.id), ['ft:c', 'ft:a', 'ft:b']);
});

test('hostile profile and registry values never throw', () => {
  const p = normalizeProfile({ substances: ['toString', 'constructor', '__proto__'], language: 'toString', populations: ['hasOwnProperty'], settings: 'x' });
  assert.deepEqual([p.substances, p.language, p.populations, p.settings], [[], null, [], []]);
  const odd = fromVirtualProvider({ id: 'x', name: 7, services: 'x', languages: ['constructor'], conditions: null, sources: [{}], insurance: { claims: 'no' } });
  assert.doesNotThrow(() => rankMatches({ modality: 'virtual' }, [odd, fac('a', ['SA'])], { now: NOW }));
});
