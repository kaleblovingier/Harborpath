// Client for SAMHSA's FindTreatment.gov listing API, the federal directory of
// state-licensed substance use and mental health treatment facilities.
// Docs: FindTreatment.gov API Documentation v1.12 (BHSIS, Aug 2026).
import { readLatLng } from './geo.js';
import {
  ACCREDITATION_CODES,
  InputError,
  KINDS,
  MAX_CODES,
  MAX_PAGE,
  PAYMENT_CODES,
  RADII_MILES,
  createTreatmentSearchSchema,
} from './schema.js';
import {
  MAX_UPSTREAM_BYTES, UpstreamError, cachedUpstream, fetchGuarded, wait,
} from './upstream.js';
import { clean, normalizeWebsite, stableId, toFiniteNumber } from './util.js';

export {
  ACCREDITATION_CODES, InputError, KINDS, MAX_UPSTREAM_BYTES, PAYMENT_CODES, RADII_MILES, UpstreamError,
};
export const UPSTREAM_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';
export const PAGE_SIZE = 25;
const METERS_PER_MILE = 1609.344;

const PAYMENT_CODE_SET = new Set(PAYMENT_CODES);
const ACCREDITATION_CODE_SET = new Set(ACCREDITATION_CODES);

// Input error messages are fixed text: they never repeat what the visitor
// sent, so a response (or a screenshot of one) cannot carry a location or
// search back.

// Longest `codes` value worth reading: 8 codes of up to 8 characters plus commas.
const MAX_CODES_PARAM = 120;

/**
 * The radius in miles (default 25). Accepts only the exact allowed values,
 * written as plain integers ("25", not "25.0", "0x19", or "2.5e1").
 */
export function parseRadius(params, fallback = 25) {
  const raw = params.get('radius');
  if (raw === null) return fallback;
  const n = /^\d{1,3}$/.test(raw.trim()) ? Number(raw.trim()) : NaN;
  if (!RADII_MILES.includes(n)) throw new InputError(`radius must be one of ${RADII_MILES.join(', ')}`);
  return n;
}

/** Page number 1..MAX_PAGE (default 1), written as a plain integer. */
export function parsePage(params) {
  const raw = params.get('page');
  if (raw === null) return 1;
  const n = /^\d{1,3}$/.test(raw.trim()) ? Number(raw.trim()) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > MAX_PAGE) throw new InputError('page is out of range');
  return n;
}

/** 'sa' (default) or 'mh'. */
export function parseKind(params) {
  const kind = (params.get('kind') ?? 'sa').trim().toLowerCase();
  if (!KINDS.includes(kind)) throw new InputError('kind must be "sa" or "mh"');
  return kind;
}

/**
 * Comma-separated SAMHSA service codes, deduplicated and checked against the
 * taxonomy. `ignore` drops one code (telehealth adds TELE itself).
 */
export function parseCodes(params, taxonomy, { max = MAX_CODES, ignore = null } = {}) {
  const raw = params.get('codes') ?? '';
  if (raw.length > MAX_CODES_PARAM) throw new InputError(`At most ${max} filters at once`);
  const codes = [...new Set(raw.split(',').map((c) => c.trim()).filter(Boolean))].filter((c) => c !== ignore);
  if (codes.length > max) throw new InputError(`At most ${max} filters at once`);
  if (codes.some((c) => !taxonomy.hasService(c))) throw new InputError('Unknown service code in filters');
  return codes.sort();
}

/**
 * Validate and normalize raw query-string params into a search request.
 *
 * Query strings are read strictly first (plain decimal degrees, integer
 * radius and page, a bounded `codes` value), and only those values are handed
 * to the shared schema, so a repeated parameter cannot slip a looser value
 * past the strict reader. Plain objects go to the schema as they are.
 */
export function parseTreatmentQuery(params, taxonomy) {
  const schema = createTreatmentSearchSchema(taxonomy);
  if (!(params instanceof URLSearchParams)) return schema.parse(params);
  const loc = readLatLng(params);
  if (!loc) throw new InputError('A valid location is required.');
  const strict = {
    ...loc,
    radiusMiles: parseRadius(params),
    kind: parseKind(params),
    page: parsePage(params),
    codes: taxonomy ? parseCodes(params, taxonomy) : params.get('codes') ?? '',
  };
  for (const key of ['accreditation', 'levelOfCare']) {
    if (params.has(key)) strict[key] = params.get(key);
  }
  return schema.parse(strict);
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

// An integer >= 0, or null.
const count = (v) => {
  const n = toFiniteNumber(v);
  return n === null || n < 0 ? null : Math.floor(n);
};

/**
 * Check that a parsed body looks like a listing page and turn it into the
 * public result shape. Rows that are not objects are dropped, and a row that
 * cannot be normalized is skipped rather than failing the whole page.
 */
export function readListingPage(body, { taxonomy, page }) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new UpstreamError('malformed');
  let rows = body.rows;
  if (rows === undefined || rows === null) {
    // An empty answer may leave rows out; anything else without rows is not a listing.
    if (count(body.recordCount) !== 0) throw new UpstreamError('malformed');
    rows = [];
  }
  if (!Array.isArray(rows)) throw new UpstreamError('malformed');
  const results = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
    try {
      results.push(normalizeFacility(row, taxonomy));
    } catch {
      // One bad listing never hides the others.
    }
  }
  return {
    page: count(body.page) ?? page,
    totalPages: count(body.totalPages) ?? 0,
    total: count(body.recordCount) ?? results.length,
    pageSize: PAGE_SIZE,
    results,
  };
}

/**
 * Fetch and validate one listing page through the shared upstream path
 * (upstream.js): a hard deadline, retries for transient failures, the
 * circuit breaker, in-flight sharing, and a stale copy from the cache when
 * the upstream is down. `finish(result)` may add to a fresh result before it
 * is cached.
 */
export function fetchListingPage(url, {
  taxonomy, page, fetchImpl = fetch, cache, inflight, breaker,
  timeoutMs = 15000, retries = 2, backoffMs = 250, sleep = wait, finish = (r) => r,
}) {
  return cachedUpstream(url, {
    cache,
    inflight,
    load: async () => {
      const body = await fetchGuarded(url, { breaker, fetchImpl, timeoutMs, retries, backoffMs, sleep });
      return finish(readListingPage(body, { taxonomy, page }));
    },
  });
}

/**
 * Search FindTreatment.gov. With a `cache`, results are reused and, if the
 * upstream fails, a recent (stale) copy is returned with `stale: true`. With
 * an `inflight` Map, identical concurrent searches share one upstream call.
 * With a `breaker` (cache.js createCircuitBreaker), a run of failures makes
 * later searches fail fast instead of each waiting out the timeout.
 * Cache and in-flight keys are upstream URLs, which only hold coarsened
 * coordinates.
 */
export async function searchTreatment(query, options) {
  return fetchListingPage(buildUpstreamUrl(query), {
    ...options,
    page: query.page,
    async finish(result) {
      if (result.total === 0 && query.page === 1 && query.codes.length >= 2) {
        try {
          const broad = await searchTreatment({ ...query, codes: [] }, options);
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
