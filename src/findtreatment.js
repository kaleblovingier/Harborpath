// Client for SAMHSA's FindTreatment.gov listing API, the federal directory of
// state-licensed substance use and mental health treatment facilities.
// Docs: FindTreatment.gov API Documentation v1.12 (BHSIS, Aug 2026).
import {
  ACCREDITATION_CODES,
  InputError,
  KINDS,
  PAYMENT_CODES,
  RADII_MILES,
  createTreatmentSearchSchema,
} from './schema.js';
import { cachedUpstream, fetchWithRetry, wait } from './upstream.js';
import { clean, normalizeWebsite, stableId, toFiniteNumber } from './util.js';

export { ACCREDITATION_CODES, InputError, KINDS, PAYMENT_CODES, RADII_MILES };
export const UPSTREAM_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';
export const PAGE_SIZE = 25;
const METERS_PER_MILE = 1609.344;

const PAYMENT_CODE_SET = new Set(PAYMENT_CODES);
const ACCREDITATION_CODE_SET = new Set(ACCREDITATION_CODES);

/** Validate and normalize raw query-string params into a search request. */
export function parseTreatmentQuery(params, taxonomy) {
  return createTreatmentSearchSchema(taxonomy).parse(params);
}

export function buildUpstreamUrl({ lat, lng, radiusMiles, kind, page, codes }) {
  const qs = new URLSearchParams({
    sAddr: `${lat},${lng}`,
    limitType: '2',
    limitValue: String(Math.round(radiusMiles * METERS_PER_MILE)),
    sType: kind,
    pageSize: String(PAGE_SIZE),
    page: String(page),
    sort: '0',
  });
  if (codes.length) qs.set('sCodes', codes.join(','));
  return `${UPSTREAM_URL}?${qs}`;
}

/** Turn one upstream row into the shape the HarborPath client renders. */
export function normalizeFacility(row, taxonomy) {
  const codes = new Set(Array.isArray(row?.codes) ? row.codes : []);
  const services = [];
  for (const svc of Array.isArray(row?.services) ? row.services : []) {
    const category = clean(svc.f2);
    const items = String(svc.f3 ?? '')
      .split(';')
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (!category || !items.length) continue;
    for (const item of items) {
      const code = taxonomy?.codeFor(category, item);
      if (code) codes.add(code);
    }
    services.push({
      category,
      label: taxonomy?.categoryName(category) ?? clean(svc.f1)?.replace(/\s*\(e\.g\.[^)]*\)/, '') ?? category,
      items,
    });
  }

  const address = {
    street1: clean(row?.street1),
    street2: clean(row?.street2),
    city: clean(row?.city),
    state: clean(row?.state),
    zip: clean(row?.zip),
  };
  const phone = clean(row?.phone);
  const sortedCodes = [...codes].sort();
  const paymentCodes = sortedCodes.filter((c) => PAYMENT_CODE_SET.has(c));
  const accreditationCodes = sortedCodes.filter((c) => ACCREDITATION_CODE_SET.has(c));

  return {
    id: stableId(row?.name1, address.street1, address.zip, phone),
    name: clean(row?.name1) ?? 'Unnamed facility',
    subname: clean(row?.name2),
    address,
    phone,
    intake: clean(row?.intake1),
    hotline: clean(row?.hotline1),
    website: normalizeWebsite(row?.website),
    lat: toFiniteNumber(row?.latitude),
    lng: toFiniteNumber(row?.longitude),
    miles: toFiniteNumber(row?.miles),
    facilityType: clean(row?.type_facility),
    codes: sortedCodes,
    paymentCodes,
    accreditationCodes,
    services,
  };
}

/**
 * Search FindTreatment.gov. With a `cache`, results are reused and, if the
 * upstream fails, a recent (stale) copy is returned with `stale: true`. With
 * an `inflight` Map, identical concurrent searches share one upstream call.
 * Cache and in-flight keys are upstream URLs, which only hold coarsened
 * coordinates.
 */
export async function searchTreatment(query, {
  taxonomy, fetchImpl = fetch, cache, inflight, timeoutMs = 15000, retries = 2, backoffMs = 250, sleep = wait,
}) {
  const url = buildUpstreamUrl(query);
  return cachedUpstream(url, {
    cache,
    inflight,
    load: async () => {
      const body = await fetchWithRetry(url, { fetchImpl, timeoutMs, retries, backoffMs, sleep });
      const rows = Array.isArray(body.rows) ? body.rows : [];
      const result = {
        page: toFiniteNumber(body.page) ?? query.page,
        totalPages: toFiniteNumber(body.totalPages) ?? 0,
        total: toFiniteNumber(body.recordCount) ?? rows.length,
        pageSize: PAGE_SIZE,
        results: rows.map((r) => normalizeFacility(r, taxonomy)),
      };
      if (result.total === 0 && query.page === 1 && query.codes.length >= 2) {
        try {
          const broad = await searchTreatment(
            { ...query, codes: [] },
            { taxonomy, fetchImpl, cache, inflight, timeoutMs, retries, backoffMs, sleep },
          );
          const nearMatches = broad.results
            .map((f) => ({ ...f, matchedCodes: query.codes.filter((c) => f.codes.includes(c)) }))
            .filter((f) => f.matchedCodes.length > 0)
            .sort((a, b) => b.matchedCodes.length - a.matchedCodes.length || (a.miles ?? Infinity) - (b.miles ?? Infinity))
            .slice(0, 5);
          if (nearMatches.length > 0 || broad.total > 0) {
            result.relaxed = {
              requestedCodes: query.codes,
              totalUnfiltered: broad.total,
              results: nearMatches,
            };
          }
        } catch {
          // A fallback failure never breaks the primary response.
        }
      }
      return result;
    },
  });
}
