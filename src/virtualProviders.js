// Registry of virtual (telehealth) treatment programs: data/virtual-providers.json.
//
// Every record is provider-reported: facts come from each program's own public
// pages, with the URL and date they were read. HarborPath has no partnership,
// referral agreement, or API integration with any of them. validateRegistry()
// is the data-quality gate: the server refuses records that break the rules
// instead of showing them, and test/virtualProviders.test.js runs it in CI.
import { describeRegion } from './regions.js';
import { InputError } from './findtreatment.js';

const CONDITIONS = new Set(['opioid', 'alcohol', 'stimulant', 'cannabis', 'kratom', 'tobacco', 'benzodiazepine', 'mental-health', 'gambling', 'other']);
const SERVICES = new Set([
  'counseling', 'group-therapy', 'psychiatry', 'moud-buprenorphine', 'moud-naltrexone', 'aud-medication',
  'contingency-management', 'peer-support', 'recovery-coaching', 'app-support', 'drug-testing',
]);
const PAYERS = new Set(['medicaid', 'medicare', 'private', 'tricare', 'self-pay']);
const STATE_RE = /^[A-Z]{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isHttps = (u) => {
  try { return new URL(u).protocol === 'https:'; } catch { return false; }
};

/** Problems with one record, as readable strings. Empty means valid. */
export function validateProvider(p) {
  const errors = [];
  const where = p?.id ?? '(no id)';
  const err = (m) => errors.push(`${where}: ${m}`);
  if (!p || typeof p !== 'object') return ['record is not an object'];
  if (!/^[a-z0-9-]+$/.test(p.id ?? '')) err('id must be kebab-case');
  if (!p.name) err('name is required');
  if (!isHttps(p.officialUrl)) err('officialUrl must be https');
  if (p.enrollUrl !== null && p.enrollUrl !== undefined && !isHttps(p.enrollUrl)) err('enrollUrl must be https');
  if (p.verificationStatus !== 'provider-reported') err('verificationStatus must be "provider-reported"');
  if (!['pending-review', 'approved'].includes(p.reviewStatus)) err('reviewStatus must be pending-review or approved');
  if (p.reviewStatus === 'approved' && !(p.reviewedBy && DATE_RE.test(p.reviewedAt ?? ''))) {
    err('approved records need reviewedBy and reviewedAt (YYYY-MM-DD)');
  }
  const sources = Array.isArray(p.sources) ? p.sources : [];
  if (!sources.length) err('at least one source is required');
  sources.forEach((s, i) => {
    if (!isHttps(s?.url)) err(`sources[${i}].url must be https`);
    if (!DATE_RE.test(s?.accessedAt ?? '')) err(`sources[${i}].accessedAt must be YYYY-MM-DD`);
    if (!['official', 'third-party'].includes(s?.type)) err(`sources[${i}].type must be official or third-party`);
  });
  if (!sources.some((s) => s?.type === 'official')) err('at least one official source is required');
  for (const c of p.conditions ?? []) if (!CONDITIONS.has(c)) err(`unknown condition ${c}`);
  for (const s of p.services ?? []) if (!SERVICES.has(s)) err(`unknown service ${s}`);
  if (p.serviceStates !== null && p.serviceStates !== undefined) {
    if (!Array.isArray(p.serviceStates)) err('serviceStates must be an array or null');
    else for (const s of p.serviceStates) if (!STATE_RE.test(s) || !describeRegion(s)) err(`bad state ${s}`);
  }
  const claims = p.insurance?.claims ?? [];
  claims.forEach((c, i) => {
    if (!PAYERS.has(c?.payer)) err(`insurance.claims[${i}].payer is not recognized`);
    if (!Number.isInteger(c?.sourceIndex) || !sources[c.sourceIndex]) err(`insurance.claims[${i}] must cite a source`);
    if (c?.states && !c.states.every((s) => STATE_RE.test(s))) err(`insurance.claims[${i}].states is invalid`);
    if (/in[- ]network/i.test(c?.detail ?? '') && !c?.plan) err(`insurance.claims[${i}] says in-network without naming a plan`);
  });
  const self = p.insurance?.selfPay;
  if (self?.price && !(Number.isInteger(self.sourceIndex) && sources[self.sourceIndex])) err('selfPay.price must cite a source');
  return errors;
}

export function validateRegistry(registry) {
  const providers = Array.isArray(registry?.providers) ? registry.providers : [];
  const errors = providers.flatMap(validateProvider);
  const ids = providers.map((p) => p.id);
  for (const id of new Set(ids)) if (ids.filter((x) => x === id).length > 1) errors.push(`${id}: duplicate id`);
  return errors;
}

/**
 * Only valid, human-approved records are served. Invalid ones are reported
 * once at startup; records still pending review are held back silently.
 */
export function createVirtualProviders(registry, { logger = console } = {}) {
  const valid = [];
  let pending = 0;
  for (const p of registry?.providers ?? []) {
    const errors = validateProvider(p);
    if (errors.length) logger.error(`[virtual-providers] skipped ${errors.join('; ')}`);
    else if (p.reviewStatus !== 'approved') pending++;
    else valid.push(Object.freeze({ ...p }));
  }
  valid.sort((a, b) => a.name.localeCompare(b.name));

  return {
    count: valid.length,
    pending,
    generatedAt: registry?.generatedAt ?? null,
    /**
     * Programs for a state. Programs that list states and leave this one out
     * are omitted; programs with unknown state coverage are included and
     * flagged so the visitor knows to check.
     */
    search(params) {
      const raw = String(params.get('state') ?? '').trim().toUpperCase();
      let state = null;
      if (raw) {
        const region = describeRegion(raw);
        if (!region || region.type === 'military' || region.type === 'freely-associated') {
          throw new InputError('state must be a U.S. state, DC, or territory code');
        }
        state = raw;
      }
      const results = valid
        .filter((p) => !state || !p.serviceStates || p.serviceStates.includes(state))
        .map((p) => ({ ...p, statesUnknown: !p.serviceStates }));
      return {
        state,
        generatedAt: this.generatedAt,
        pendingReview: pending,
        disclosure: 'Information reported by each program on its own website. HarborPath has no partnership with these programs and receives no payment. Confirm availability, eligibility, and cost directly with the program.',
        results,
      };
    },
  };
}
