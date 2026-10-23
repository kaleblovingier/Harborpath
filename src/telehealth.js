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
 * stale-while-revalidate answers from the cache when the upstream is down.
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
