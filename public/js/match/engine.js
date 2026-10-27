// HarborPath shared matching engine.
//
// Pure functions, no DOM, no network, no storage. It runs in the visitor's
// browser so needs-assessment answers (insurance, substances, pregnancy,
// language, ...) never leave the device; Node tests import it directly.
//
// Contract (docs/SPEC.md):
//   rankMatches(profile, candidates, { now }) -> { matches, excluded }
// Each match explains itself with reason codes ({ code, params }) that the UI
// translates, so the engine stays language-neutral and testable.
//
// Ground rules the tests enforce:
// - Scores read only whitelisted clinical, coverage, access, and preference
//   fields. Nothing like `sponsored` or `paid` can ever influence a score.
// - Coverage is never upgraded beyond its evidence. SAMHSA payment codes are
//   provider-reported; "confirmed" needs an explicit, sourced verification.
// - Demographic preferences only add points or a "to verify" note. They never
//   exclude anyone. Exclusions are limited to a facility's own statement that
//   it does not serve a need, or a virtual program not offered in the state.

// ---------------------------------------------------------------- Taxonomy
// SAMHSA FindTreatment.gov service codes (data/service-codes.json).
export const PAY_CODES = new Set([
  'CLF', 'CMHG', 'CSBG', 'FG', 'FSA', 'ITU', 'MC', 'MD', 'TRICARE', 'NP', 'OSF', 'PI',
  'PCF', 'SCJJ', 'SEF', 'CASH', 'SI', 'SMHA', 'SWFS', 'VAF', 'SAMHSA', 'PA', 'SS',
]);
const PUBLIC_FUNDING = ['SAMHSA', 'FSA', 'SMHA', 'OSF', 'CLF', 'CMHG', 'FG'];

export const SETTING_CODES = {
  detox: ['DT', 'HID', 'OD', 'RD', 'ADTX', 'BDTX', 'CDTX', 'MDTX', 'ODTX'],
  residential: ['RES', 'RL', 'RS'],
  inpatient: ['HI', 'HIT', 'HID'],
  php: ['PHP', 'ODT'],
  iop: ['IOP'],
  outpatient: ['OP', 'ORT'],
  medication: ['BU', 'MU', 'NU', 'OTP', 'UB', 'UN', 'BUM', 'MM', 'PMAT', 'ACM', 'DSF', 'VTRL', 'NXN', 'BWN', 'BWON', 'BERI'],
  counseling: ['ICO', 'GCO', 'IPT', 'SACA', 'CBT', 'MI'],
  psychiatry: ['MH', 'IDD', 'CMHA'],
  'recovery-support': ['PEER', 'RC', 'SHG', 'HS'],
};

export const SUBSTANCE_RULES = {
  opioid: { excludeIf: ['NOOP'], support: ['BU', 'MU', 'NU', 'OTP', 'UB', 'UN', 'BUM', 'MM', 'ODTX', 'MOA'] },
  alcohol: { excludeIf: ['NAUT'], support: ['PMAT', 'ACM', 'DSF', 'VTRL', 'NXN', 'ADTX', 'ACMA'] },
  stimulant: { excludeIf: [], support: ['CMI', 'MXM', 'CRV', 'CDTX', 'MDTX'] },
  benzodiazepine: { excludeIf: [], support: ['BDTX'] },
  cannabis: { excludeIf: [], support: [] },
  other: { excludeIf: [], support: [] },
};

export const MEDICATION_CODES = {
  buprenorphine: ['BU', 'UB', 'BUM', 'BWN', 'BWON', 'BERI', 'BSDM'],
  methadone: ['MU', 'MM', 'OTP', 'METH'],
  naltrexone: ['NU', 'UN', 'VTRL', 'NXN', 'RPN'],
  'alcohol-medication': ['PMAT', 'ACM', 'DSF', 'VTRL', 'NXN'],
};

// Optional, skippable preferences. Each maps to codes that add points; none
// can remove a result. `null` means the federal directory has no field for it.
export const POPULATION_CODES = {
  veteran: ['VET', 'VAF', 'VAMC'],
  pregnant: ['PW'],
  women: ['WN'],
  men: ['MN'],
  'co-occurring': ['MHSU', 'COSMI', 'IDD'],
  trauma: ['TRMA', 'PTSD', 'SEXA', 'DV'],
  justice: ['CJ'],
  hiv: ['HIV', 'EIS_HIV'],
  pain: ['COPSU', 'PAIN'],
  lgbtq: null,
  'faith-based': null,
  secular: null,
};

export const AGE_CODES = { youth: 'CH_AD', 'young-adult': 'YAD', adult: 'ADLT', senior: 'SNR' };
export const AGE_PROGRAM_CODES = { youth: ['ADOL'], 'young-adult': ['YA'], senior: ['SEN'] };

export const LANGUAGE_CODES = {
  es: ['SP'], asl: ['ASL'], ar: ['F4'], zh: ['F17'], ht: ['F19'], fa: ['F25'], fr: ['F28'], de: ['F30'],
  el: ['F31'], he: ['F35'], hi: ['F36'], hmn: ['F37'], it: ['F42'], ja: ['F43'], ko: ['F47'],
  pl: ['F66'], pt: ['F67'], ru: ['F70'], tl: ['F81'], vi: ['F92'], native: ['NX', 'N24', 'N40'],
};

export const COVERAGE_TYPES = ['private', 'medicaid', 'medicare', 'military', 'va', 'ihs', 'uninsured', 'unsure'];
export const COVERAGE_TIERS = ['confirmed', 'provider-reported', 'possible', 'not-listed', 'unknown'];

const COVERAGE_PAYER = { private: 'PI', medicaid: 'MD', medicare: 'MC', military: 'TRICARE', va: 'VAF', ihs: 'ITU' };
const CLAIM_PAYER = { private: 'private', medicaid: 'medicaid', medicare: 'medicare', military: 'tricare' };

export const WEIGHTS = Object.freeze({ clinical: 40, coverage: 25, access: 20, preferences: 15 });
export const STALE_AFTER_DAYS = 365;

// ---------------------------------------------------------------- Helpers
const hasAny = (codes, list) => list.some((c) => codes.has(c));
const matching = (codes, list) => list.filter((c) => codes.has(c));
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const reason = (code, params) => (params ? { code, params } : { code });

/** Defaults for every profile field, so callers can pass partial answers. */
export function normalizeProfile(raw = {}) {
  const arr = (v) => (Array.isArray(v) ? [...new Set(v.filter(Boolean))] : []);
  const pick = (v, allowed) => (allowed.includes(v) ? v : null);
  return {
    helpWith: pick(raw.helpWith, ['substance', 'mental-health', 'both']) ?? 'substance',
    substances: arr(raw.substances).filter((s) => Object.hasOwn(SUBSTANCE_RULES, s)),
    settings: arr(raw.settings).filter((s) => Object.hasOwn(SETTING_CODES, s)),
    medications: arr(raw.medications).filter((m) => Object.hasOwn(MEDICATION_CODES, m)),
    modality: pick(raw.modality, ['in-person', 'virtual', 'either']) ?? 'either',
    coverage: pick(raw.coverage, COVERAGE_TYPES) ?? 'unsure',
    needsFinancialHelp: Boolean(raw.needsFinancialHelp),
    timing: pick(raw.timing, ['daytime', 'evening', 'weekend']),
    ageGroup: pick(raw.ageGroup, Object.keys(AGE_CODES)),
    language: raw.language !== 'en' && Object.hasOwn(LANGUAGE_CODES, raw.language ?? '') ? raw.language : null,
    populations: arr(raw.populations).filter((p) => Object.hasOwn(POPULATION_CODES, p)),
    barriers: arr(raw.barriers).filter((b) => ['transportation', 'childcare', 'housing'].includes(b)),
    state: typeof raw.state === 'string' && /^[A-Z]{2}$/.test(raw.state) ? raw.state : null,
    maxMiles: Number.isFinite(raw.maxMiles) && raw.maxMiles > 0 ? raw.maxMiles : 25,
  };
}

// ---------------------------------------------------------------- Candidates
/**
 * A FindTreatment.gov listing (src/findtreatment.js normalizeFacility) as a
 * candidate. `via` is 'local' (radius search) or 'telehealth' (statewide).
 */
export function fromFacility(f, { via = 'local', state = null } = {}) {
  const codes = new Set(f.codes ?? []);
  return {
    id: `ft:${f.id}`,
    kind: 'facility',
    name: f.name,
    subname: f.subname ?? null,
    codes,
    miles: Number.isFinite(f.miles) ? f.miles : null,
    telehealth: codes.has('TELE'),
    virtualOnly: false,
    // A licensed facility's telehealth reaches people in its own state.
    serviceStates: f.address?.state ? [f.address.state] : state ? [state] : null,
    insuranceClaims: null,
    networkVerifications: Array.isArray(f.networkVerifications) ? f.networkVerifications : [],
    via,
    source: { name: 'SAMHSA FindTreatment.gov', type: 'federal-directory', verifiedAt: null, live: true },
    record: f,
  };
}

const SERVICE_TO_CODES = {
  counseling: ['ICO', 'SACA', 'IPT'],
  'group-therapy': ['GCO', 'GT'],
  psychiatry: ['MH', 'IDD'],
  'moud-buprenorphine': ['BU', 'UB'],
  'moud-naltrexone': ['NU', 'UN'],
  'aud-medication': ['PMAT'],
  'contingency-management': ['CMI'],
  'peer-support': ['PEER'],
  'recovery-coaching': ['RC'],
  'drug-testing': ['DAUT'],
};

/** A virtual-provider registry record (data/virtual-providers.json). */
export function fromVirtualProvider(p) {
  const list = (v) => (Array.isArray(v) ? v : []);
  const lookup = (table, key) => (Object.hasOwn(table, key) ? table[key] : []);
  const codes = new Set(['TELE', 'OP']);
  for (const s of list(p.services)) for (const c of lookup(SERVICE_TO_CODES, s)) codes.add(c);
  if (list(p.conditions).includes('mental-health')) codes.add('MH');
  for (const lang of list(p.languages)) for (const c of lookup(LANGUAGE_CODES, lang)) codes.add(c);
  const dates = list(p.sources).map((s) => s?.accessedAt).filter((d) => typeof d === 'string').sort();
  return {
    id: `vp:${p.id}`,
    kind: 'virtual',
    name: String(p.name ?? ''),
    subname: null,
    codes,
    conditions: list(p.conditions),
    miles: null,
    telehealth: true,
    virtualOnly: true,
    serviceStates: Array.isArray(p.serviceStates) ? p.serviceStates : null,
    insuranceClaims: list(p.insurance?.claims),
    selfPay: p.insurance?.selfPay ?? null,
    networkVerifications: Array.isArray(p.networkVerifications) ? p.networkVerifications : [],
    ageMin: Number.isFinite(p.ageMin) ? p.ageMin : null,
    via: 'virtual',
    source: { name: p.name, type: 'provider-reported', verifiedAt: dates.at(-1) ?? null, live: false },
    record: p,
  };
}

// ---------------------------------------------------------------- Coverage
/**
 * How well a candidate fits the visitor's coverage, with the evidence tier.
 * Returns { tier, score (0..1), payerCodes, affordability, reasons, verify }.
 */
export function assessCoverage(profile, c) {
  const reasons = [];
  const verify = [];
  const affordability = [];
  const codes = c.codes;
  const cov = profile.coverage;

  if (codes.has('NP')) affordability.push('free');
  if (codes.has('SS')) affordability.push('sliding-scale');
  if (codes.has('PA')) affordability.push('payment-assistance');
  if (hasAny(codes, PUBLIC_FUNDING)) affordability.push('public-funding');
  if (c.selfPay?.available && c.selfPay?.price) affordability.push('published-self-pay');

  const confirmed = c.networkVerifications.find((v) => v?.payer === cov && v?.source && v?.verifiedAt
    && (!v.state || !profile.state || v.state === profile.state));
  if (confirmed) {
    reasons.push(reason('coverage.confirmed', { source: confirmed.source, date: confirmed.verifiedAt }));
    return { tier: 'confirmed', score: 1, payerCodes: [], affordability, reasons, verify };
  }

  let tier;
  let score;
  if (c.kind === 'virtual') {
    ({ tier, score } = virtualCoverage(profile, c, reasons, verify));
  } else {
    const payerCodes = [...codes].filter((x) => PAY_CODES.has(x));
    const hasInfo = payerCodes.length > 0;
    const payer = COVERAGE_PAYER[cov];
    const alternatives = affordability.filter((a) => a !== 'published-self-pay');
    // Free care, a sliding fee, or payment assistance are offers to the
    // person. Grant funding to the facility is not a promise of lower cost.
    const personalOffers = alternatives.filter((a) => a !== 'public-funding');
    // Medicaid is run by each state: "accepts Medicaid" at a facility in
    // another state means that state's program, not the visitor's.
    const facilityState = c.record?.address?.state ?? null;
    const otherState = Boolean(profile.state && facilityState && facilityState !== profile.state);
    if (cov === 'uninsured' || (cov === 'unsure' && profile.needsFinancialHelp)) {
      if (personalOffers.length) {
        tier = 'provider-reported'; score = codes.has('NP') ? 1 : 0.9;
        reasons.push(reason('coverage.affordable', { options: alternatives }));
      } else if (alternatives.length) {
        tier = 'possible'; score = 0.6;
        reasons.push(reason('coverage.affordable', { options: alternatives }));
        verify.push(reason('verify.price'));
      } else if (codes.has('CASH')) {
        tier = 'possible'; score = 0.4;
        reasons.push(reason('coverage.selfPayOnly'));
        verify.push(reason('verify.price'));
      } else {
        tier = hasInfo ? 'not-listed' : 'unknown'; score = hasInfo ? 0.15 : 0.35;
      }
    } else if (cov === 'unsure') {
      tier = 'unknown'; score = hasInfo ? 0.6 : 0.4;
      if (hasInfo) reasons.push(reason('coverage.listedPayments', { codes: payerCodes }));
      verify.push(reason('verify.coverageUnsure'));
    } else if (payer && codes.has(payer) && cov === 'medicaid' && otherState) {
      tier = 'possible'; score = 0.45;
      reasons.push(reason('coverage.medicaidOtherState', { state: facilityState }));
    } else if (payer && codes.has(payer)) {
      tier = 'provider-reported'; score = 0.85;
      reasons.push(reason('coverage.reported', { coverage: cov }));
    } else if (cov === 'medicaid' && codes.has('SI')) {
      tier = 'possible'; score = 0.6;
      reasons.push(reason('coverage.statePlan'));
    } else if (alternatives.length) {
      tier = 'possible'; score = 0.5;
      reasons.push(reason('coverage.alternatives', { coverage: cov, options: alternatives }));
    } else if (hasInfo) {
      tier = 'not-listed'; score = 0.15;
    } else {
      tier = 'unknown'; score = 0.35;
    }
    if (tier === 'unknown' && !hasInfo) verify.push(reason('verify.noPaymentInfo'));
  }

  if (profile.needsFinancialHelp && affordability.length && cov !== 'uninsured') score = Math.min(1, score + 0.1);
  // Even a listed payer is not a promise about a specific plan or cost.
  if (['private', 'medicaid', 'medicare', 'military'].includes(cov) && tier !== 'not-listed') {
    verify.push(reason('verify.plan', { coverage: cov }));
  }
  return { tier, score, payerCodes: [...codes].filter((x) => PAY_CODES.has(x)), affordability, reasons, verify };
}

function virtualCoverage(profile, c, reasons, verify) {
  const want = CLAIM_PAYER[profile.coverage];
  const claims = (c.insuranceClaims ?? []).filter((cl) => !cl.states || !profile.state || cl.states.includes(profile.state));
  if (want) {
    const hit = claims.find((cl) => cl.payer === want);
    if (hit) {
      reasons.push(reason('coverage.reportedByProvider', { coverage: profile.coverage, detail: hit.detail ?? null }));
      return { tier: 'provider-reported', score: 0.8 };
    }
    if (c.selfPay?.available) {
      reasons.push(reason('coverage.selfPayAvailable', { price: c.selfPay.price ?? null }));
      if (!c.selfPay.price) verify.push(reason('verify.price'));
      return { tier: 'possible', score: 0.4 };
    }
    return { tier: claims.length ? 'not-listed' : 'unknown', score: claims.length ? 0.15 : 0.35 };
  }
  if (profile.coverage === 'uninsured') {
    if (c.selfPay?.available) {
      reasons.push(reason('coverage.selfPayAvailable', { price: c.selfPay.price ?? null }));
      if (!c.selfPay.price) verify.push(reason('verify.price'));
      return { tier: 'possible', score: c.selfPay.price ? 0.5 : 0.4 };
    }
    return { tier: 'unknown', score: 0.25 };
  }
  verify.push(reason('verify.coverageUnsure'));
  return { tier: 'unknown', score: claims.length ? 0.6 : 0.4 };
}

// ---------------------------------------------------------------- Scoring
/** Hard exclusions: only a provider's own statement, or state availability. */
export function exclusionFor(profile, c) {
  for (const s of profile.substances) {
    const hit = matching(c.codes, SUBSTANCE_RULES[s].excludeIf);
    if (hit.length) return reason('exclude.doesNotTreat', { substance: s });
  }
  if (c.codes.has('DUIO')) return reason('exclude.duiOnly');
  if (c.codes.has('OUDO') && profile.substances.length && !profile.substances.includes('opioid')) {
    return reason('exclude.opioidOnly');
  }
  if (c.codes.has('AUDO') && profile.substances.length && !profile.substances.includes('alcohol')) {
    return reason('exclude.alcoholOnly');
  }
  if (c.virtualOnly) {
    if (profile.modality === 'in-person') return reason('exclude.virtualOnly');
    if (profile.state && Array.isArray(c.serviceStates) && !c.serviceStates.includes(profile.state)) {
      return reason('exclude.notInState', { state: profile.state });
    }
  }
  if (c.via === 'telehealth' && profile.state && Array.isArray(c.serviceStates) && c.serviceStates.length
    && !c.serviceStates.includes(profile.state)) {
    return reason('exclude.notInState', { state: profile.state });
  }
  return null;
}

function scoreClinical(profile, c, out) {
  const parts = [];
  const codes = c.codes;
  if (profile.helpWith !== 'substance') {
    const mh = hasAny(codes, ['MH', 'MHSU', 'COSMI', 'IDD']);
    parts.push(mh ? 1 : 0.3);
    if (mh) out.reasons.push(reason('clinical.mentalHealth'));
    else out.verify.push(reason('verify.mentalHealth'));
  }
  for (const s of profile.substances) {
    const support = matching(codes, SUBSTANCE_RULES[s].support);
    if (c.kind === 'virtual' && (c.conditions ?? []).includes(s)) {
      parts.push(1);
      out.reasons.push(reason('clinical.substance', { substance: s, codes: support }));
    } else if (support.length) {
      parts.push(1);
      out.reasons.push(reason('clinical.substance', { substance: s, codes: support }));
    } else {
      parts.push(0.5);
      out.verify.push(reason('verify.substance', { substance: s }));
    }
  }
  for (const setting of profile.settings) {
    const hit = matching(codes, SETTING_CODES[setting]);
    parts.push(hit.length ? 1 : 0);
    if (hit.length) out.reasons.push(reason('clinical.setting', { setting }));
    else out.missing.push(reason('missing.setting', { setting }));
  }
  for (const med of profile.medications) {
    const hit = matching(codes, MEDICATION_CODES[med]);
    parts.push(hit.length ? 1 : 0);
    if (hit.length) out.reasons.push(reason('clinical.medication', { medication: med }));
    else out.missing.push(reason('missing.medication', { medication: med }));
  }
  if (!parts.length) return 0.7; // Nothing specific asked: a listed program is a reasonable start.
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

function scoreAccess(profile, c, out) {
  const wantsVirtual = profile.modality !== 'in-person';
  const offersVirtual = c.telehealth;
  let score;
  if (c.virtualOnly) {
    score = profile.modality === 'virtual' ? 1 : 0.8;
    out.reasons.push(reason(c.serviceStates ? 'access.virtualInState' : 'access.virtual', { state: profile.state }));
    if (!c.serviceStates) out.verify.push(reason('verify.stateAvailability'));
  } else if (c.via === 'telehealth') {
    score = profile.modality === 'in-person' ? 0.3 : 0.9;
    out.reasons.push(reason('access.statewideTelehealth', { state: profile.state }));
  } else {
    const miles = c.miles;
    const distanceScore = miles === null ? 0.5 : clamp01(1 - miles / Math.max(profile.maxMiles, 1));
    if (profile.modality === 'virtual') {
      score = offersVirtual ? 0.85 + 0.15 * distanceScore : 0.25 * distanceScore;
      if (offersVirtual) out.reasons.push(reason('access.telehealth'));
      else out.missing.push(reason('missing.telehealth'));
    } else {
      score = distanceScore;
      if (miles !== null) out.reasons.push(reason('access.distance', { miles }));
      if (offersVirtual && wantsVirtual) {
        score = Math.max(score, 0.75);
        out.reasons.push(reason('access.telehealth'));
      }
    }
  }
  if (profile.barriers.includes('transportation')) {
    if (c.codes.has('TA')) { score = Math.min(1, score + 0.15); out.reasons.push(reason('access.transportation')); }
    else if (offersVirtual) score = Math.min(1, score + 0.1);
  }
  if (profile.barriers.includes('childcare') && hasAny(c.codes, ['CCC', 'BEDS'])) {
    score = Math.min(1, score + 0.1);
    out.reasons.push(reason('access.childcare'));
  }
  if (profile.barriers.includes('housing') && hasAny(c.codes, ['HS', 'SH', 'HH'])) {
    score = Math.min(1, score + 0.1);
    out.reasons.push(reason('access.housing'));
  }
  // No federal source publishes hours or waitlists; never guess them.
  if (profile.timing) out.verify.push(reason('verify.hours', { timing: profile.timing }));
  out.verify.push(reason('verify.intake'));
  return score;
}

function scorePreferences(profile, c, out) {
  const parts = [];
  if (profile.language) {
    const hit = matching(c.codes, LANGUAGE_CODES[profile.language]);
    parts.push(hit.length ? 1 : 0.3);
    if (hit.length) out.reasons.push(reason('pref.language', { language: profile.language }));
    else out.verify.push(reason('verify.language', { language: profile.language }));
  }
  if (profile.ageGroup) {
    const accepted = [...c.codes].filter((x) => Object.values(AGE_CODES).includes(x));
    const program = matching(c.codes, AGE_PROGRAM_CODES[profile.ageGroup] ?? []);
    if (program.length) { parts.push(1); out.reasons.push(reason('pref.ageProgram', { ageGroup: profile.ageGroup })); }
    else if (accepted.includes(AGE_CODES[profile.ageGroup])) parts.push(0.8);
    else if (accepted.length) { parts.push(0.2); out.verify.push(reason('verify.age', { ageGroup: profile.ageGroup })); }
    else parts.push(0.5);
    if (profile.ageGroup === 'youth' && c.ageMin !== null && c.ageMin >= 18) {
      out.verify.push(reason('verify.age', { ageGroup: profile.ageGroup }));
    }
  }
  for (const pop of profile.populations) {
    const list = POPULATION_CODES[pop];
    if (!list) {
      out.verify.push(reason('verify.population', { population: pop }));
      continue;
    }
    const hit = matching(c.codes, list);
    parts.push(hit.length ? 1 : 0.4);
    if (hit.length) out.reasons.push(reason('pref.population', { population: pop }));
  }
  if (!parts.length) return 0.7;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

function freshness(c, now) {
  if (c.source.live) return { stale: false, ageDays: null };
  if (!c.source.verifiedAt) return { stale: true, ageDays: null };
  const ageDays = Math.floor((now - Date.parse(c.source.verifiedAt)) / 86_400_000);
  return { stale: !(ageDays <= STALE_AFTER_DAYS), ageDays };
}

/** Score one candidate. Returns null when it is excluded (see exclusionFor). */
export function scoreCandidate(rawProfile, c, { now = Date.now() } = {}) {
  const profile = rawProfile.__normalized ? rawProfile : normalizeProfile(rawProfile);
  const out = { reasons: [], verify: [], missing: [] };
  const clinical = scoreClinical(profile, c, out);
  const coverage = assessCoverage(profile, c);
  out.reasons.push(...coverage.reasons);
  out.verify.push(...coverage.verify);
  const access = scoreAccess(profile, c, out);
  const preferences = scorePreferences(profile, c, out);

  const components = { clinical, coverage: coverage.score, access, preferences };
  const total = Object.entries(WEIGHTS).reduce((sum, [k, w]) => sum + w * components[k], 0);
  const fresh = freshness(c, now);
  if (fresh.stale) out.verify.push(reason('verify.stale', { date: c.source.verifiedAt }));
  if (c.codes.size < 5 && c.kind === 'facility') out.verify.push(reason('verify.sparse'));

  return {
    id: c.id,
    candidate: c,
    score: Math.round(total),
    components,
    coverage: { tier: coverage.tier, affordability: coverage.affordability, payerCodes: coverage.payerCodes },
    reasons: dedupe(out.reasons),
    missing: dedupe(out.missing),
    verify: dedupe(out.verify),
    stale: fresh.stale,
  };
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((r) => {
    const key = r.code + JSON.stringify(r.params ?? {});
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Rank candidates for a profile. Duplicates (the same facility from the local
 * and statewide searches) are merged, keeping the one with a distance.
 */
export function rankMatches(rawProfile, candidates, { now = Date.now() } = {}) {
  const profile = { ...normalizeProfile(rawProfile), __normalized: true };
  const byId = new Map();
  for (const c of candidates) {
    const prev = byId.get(c.id);
    if (!prev || (prev.miles === null && c.miles !== null)) byId.set(c.id, c);
  }
  const matches = [];
  const excluded = [];
  for (const c of byId.values()) {
    const why = exclusionFor(profile, c);
    if (why) { excluded.push({ id: c.id, name: c.name, reason: why }); continue; }
    matches.push(scoreCandidate(profile, c, { now }));
  }
  matches.sort((a, b) => b.score - a.score
    || (a.candidate.miles ?? Infinity) - (b.candidate.miles ?? Infinity)
    || String(a.candidate.name).localeCompare(String(b.candidate.name)));
  return { profile, matches, excluded };
}

// ---------------------------------------------------------------- Search plan
/**
 * Which HarborPath API calls to make for a profile. Only the coarse location,
 * radius, kind, and state ever reach the server: never insurance, substances,
 * or demographics. Ranking happens on the device.
 */
export function searchPlan(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const kind = profile.helpWith === 'mental-health' ? 'mh' : 'sa';
  const radius = [5, 10, 25, 50, 100, 200, 250].find((r) => r >= profile.maxMiles) ?? 250;
  return {
    kind,
    radius,
    // Local listings stay useful even for virtual care: many offer telehealth.
    local: true,
    localPages: 2,
    telehealth: profile.modality !== 'in-person' && Boolean(profile.state),
    virtualProviders: profile.modality !== 'in-person' && profile.helpWith !== 'mental-health',
  };
}
