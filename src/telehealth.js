// Statewide telehealth search. A program that offers telehealth can usually
// see anyone in the state it is licensed in, so for rural visitors the useful
// question is not "what is within 25 miles" but "which programs in my state
// offer telehealth". FindTreatment.gov answers that with its stateCode filter
// (API docs v1.12: "stateCode=xx ... in combination with limitType=2 to search
// for facilities in a state within a given radius distance"); the value must be
// quoted ('WA'), or the API rejects the request.
import { readLatLng } from './geo.js';
import {
  InputError, PAGE_SIZE, UPSTREAM_URL, fetchListingPage, parseCodes, parseKind, parsePage,
} from './findtreatment.js';
import { describeRegion } from './regions.js';

export const TELEHEALTH_CODE = 'TELE';
// 5,000 miles reaches every corner of any state or territory from any point in it.
const STATEWIDE_METERS = 8_046_720;
const MAX_EXTRA_CODES = 7;

/**
 * Validate a telehealth query. `state` is required; lat/lng are optional, and
 * without them results are sorted by name from a point inside the state, with
 * no distances. anchorFor(code) gives that point.
 */
export function parseTelehealthQuery(params, { taxonomy, anchorFor }) {
  const code = String(params.get('state') ?? '').trim().toUpperCase();
  const region = describeRegion(code);
  if (!region || region.type === 'military' || region.type === 'freely-associated') {
    throw new InputError('state must be a U.S. state, DC, or territory code');
  }

  let point = null;
  if (params.has('lat') || params.has('lng')) {
    point = readLatLng(params);
    if (!point) throw new InputError('A valid location is required.');
  }
  const anchor = point ?? anchorFor(code);
  if (!anchor) throw new InputError('No search point for that state');

  const kind = parseKind(params);
  const page = parsePage(params);
  const extra = parseCodes(params, taxonomy, { max: MAX_EXTRA_CODES, ignore: TELEHEALTH_CODE });

  return {
    state: code,
    lat: anchor.lat,
    lng: anchor.lng,
    byDistance: Boolean(point),
    kind,
    page,
    codes: [...extra, TELEHEALTH_CODE].sort(),
  };
}

export function buildTelehealthUrl({ state, lat, lng, byDistance, kind, page, codes }) {
  const qs = new URLSearchParams({
    sAddr: `${lat},${lng}`,
    limitType: '2',
    limitValue: String(STATEWIDE_METERS),
    stateCode: `'${state}'`,
    sType: kind,
    sCodes: codes.join(','),
    pageSize: String(PAGE_SIZE),
    page: String(page),
    sort: byDistance ? '0' : '2', // 2 = by name
  });
  return `${UPSTREAM_URL}?${qs}`;
}

/**
 * Statewide telehealth search. Shares the treatment search's hardened
 * upstream path (fetchListingPage): a hard timeout, retries for transient
 * failures, response validation, the circuit breaker, in-flight sharing, and
 * a stale copy from the cache when the upstream is down.
 */
export async function searchTelehealth(query, { taxonomy, ...options }) {
  return fetchListingPage(buildTelehealthUrl(query), {
    ...options,
    taxonomy,
    page: query.page,
    finish: (page) => ({
      ...page,
      state: describeRegion(query.state),
      byDistance: query.byDistance,
      // Distances from a point the visitor did not choose would mislead.
      results: query.byDistance ? page.results : page.results.map((f) => ({ ...f, miles: null })),
    }),
  });
}

/**
 * Federal tele-prescribing flexibilities and regulatory authorities under DEA telemedicine flexibilities
 * and the 2024 SAMHSA 42 CFR Part 8 Final Rule (89 FR 12472).
 */
export const TELEHEALTH_FLEXIBILITIES = {
  buprenorphine: {
    medication: 'Buprenorphine',
    inPersonExamRequired: false,
    audioOnlyPermitted: true,
    audioVisualPermitted: true,
    xWaiverRequired: false,
    otpRequired: false,
    authority: 'DEA / SAMHSA Telemedicine Flexibilities & 2024 42 CFR Part 8 (89 FR 12472)',
    summary: 'Clinicians can initiate and maintain buprenorphine via two-way audio-video or audio-only telephone visits without a prior in-person examination. The DEA X-waiver was permanently eliminated.',
  },
  methadone: {
    medication: 'Methadone',
    inPersonExamRequired: false,
    audioOnlyPermitted: false,
    audioVisualPermitted: true,
    xWaiverRequired: false,
    otpRequired: true,
    takeHomeFlexibilities: {
      days1To14: 7,
      days15To30: 14,
      days31Plus: 28,
    },
    authority: '2024 SAMHSA 42 CFR Part 8 Final Rule (89 FR 12472)',
    summary: 'OTPs can initiate methadone following an audio-visual telehealth evaluation by an authorized healthcare professional. Audio-only initiation is NOT permitted for methadone. Take-home flexibilities allow stable patients to avoid daily in-person clinic visits.',
  },
  counseling: {
    medication: null,
    inPersonExamRequired: false,
    audioOnlyPermitted: true,
    audioVisualPermitted: true,
    authority: 'SAMHSA / CMS Outpatient Telehealth Standards',
    summary: 'Individual and group SUD counseling can be delivered via audio-video or telephone when video is unavailable.',
  },
};

/**
 * Evaluates telehealth appointment eligibility, required video vs audio-only fallback logic,
 * and cross-state licensure boundaries.
 */
export function evaluateTelehealthEligibility({
  patientState = '',
  medication = 'buprenorphine',
  hasBroadbandVideo = true,
  providerState = null,
} = {}) {
  const normState = String(patientState || '').trim().toUpperCase();
  const flex = TELEHEALTH_FLEXIBILITIES[medication] ?? null;

  if (!flex) {
    return {
      eligible: false,
      reason: `Unknown medication or service: ${medication}`,
      modality: 'none',
      audioOnlyFallbackAllowed: false,
    };
  }

  const isCrossState = Boolean(providerState && normState && providerState.toUpperCase() !== normState);

  let modality = 'audio-visual';
  const audioOnlyFallbackAllowed = flex.audioOnlyPermitted;

  if (!hasBroadbandVideo) {
    if (flex.audioOnlyPermitted) {
      modality = 'audio-only';
    } else {
      return {
        eligible: false,
        medication: flex.medication,
        modality: 'none',
        audioOnlyFallbackAllowed: false,
        reason: `${flex.medication} requires audio-visual telehealth under federal law; audio-only phone appointments are not permitted for initiation.`,
        authority: flex.authority,
        isCrossState,
      };
    }
  }

  return {
    eligible: true,
    medication: flex.medication,
    modality,
    audioOnlyFallbackAllowed,
    inPersonExamRequired: flex.inPersonExamRequired,
    isCrossState,
    authority: flex.authority,
    summary: flex.summary,
  };
}

/**
 * Validates whether a provider's licensed service states match a patient's state jurisdiction.
 */
export function matchesCrossStateLicensure(providerServiceStates, patientState) {
  if (!patientState) return { matched: false, status: 'invalid', note: 'Patient state is required.' };
  const pState = String(patientState).trim().toUpperCase();

  // If provider has not specified states (null/undefined), state coverage is unknown and must be confirmed
  if (providerServiceStates === null || providerServiceStates === undefined) {
    return {
      matched: true,
      status: 'unknown-verify',
      note: 'Program has not published a specific state license list; verify directly with the clinic.',
    };
  }

  if (!Array.isArray(providerServiceStates)) {
    return { matched: false, status: 'invalid', note: 'Invalid provider states configuration.' };
  }

  const upperStates = providerServiceStates.map((s) => String(s).trim().toUpperCase());
  const matched = upperStates.includes(pState);
  return {
    matched,
    status: matched ? 'licensed' : 'out-of-state',
    note: matched
      ? `Program is licensed to provide telehealth care in ${pState}.`
      : `Program is only licensed in [${upperStates.join(', ')}], not in ${pState}.`,
  };
}
