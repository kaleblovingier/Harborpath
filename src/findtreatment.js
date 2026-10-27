// Client for SAMHSA's FindTreatment.gov listing API, the federal directory of
// state-licensed substance use and mental health treatment facilities.
// Docs: FindTreatment.gov API Documentation v1.12 (BHSIS, Aug 2026).
import { readLatLng } from './geo.js';
import { clean, normalizeWebsite, stableId, toFiniteNumber } from './util.js';

export const UPSTREAM_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';
export const PAGE_SIZE = 25;
// 200 and 250 serve rural areas; FindTreatment.gov accepts any distance in meters
// (checked live in October 2026 from Jordan, MT: 7 listings within 100 miles,
// 52 within 200, 81 within 250).
export const RADII_MILES = [5, 10, 25, 50, 100, 200, 250];
export const KINDS = ['sa', 'mh'];
const METERS_PER_MILE = 1609.344;
const MAX_CODES = 8;
const MAX_PAGE = 40;

export class InputError extends Error {}

/** Validate and normalize raw query-string params into a search request. */
export function parseTreatmentQuery(params, taxonomy) {
  const loc = readLatLng(params);
  if (!loc) throw new InputError('A valid location is required.');

  const radiusMiles = Number(params.get('radius') ?? 25);
  if (!RADII_MILES.includes(radiusMiles)) throw new InputError(`radius must be one of ${RADII_MILES.join(', ')}`);

  const kind = (params.get('kind') ?? 'sa').toLowerCase();
  if (!KINDS.includes(kind)) throw new InputError('kind must be "sa" or "mh"');

  const page = Number(params.get('page') ?? 1);
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) throw new InputError('page is out of range');

  const codes = [...new Set((params.get('codes') ?? '').split(',').map((c) => c.trim()).filter(Boolean))];
  if (codes.length > MAX_CODES) throw new InputError(`At most ${MAX_CODES} filters at once`);
  for (const c of codes) {
    if (!taxonomy.hasService(c)) throw new InputError(`Unknown service code: ${c}`);
  }

  return { ...loc, radiusMiles, kind, page, codes: codes.sort() };
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
  const codes = new Set();
  const services = [];
  for (const svc of Array.isArray(row.services) ? row.services : []) {
    const category = clean(svc.f2);
    const items = String(svc.f3 ?? '')
      .split(';')
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (!category || !items.length) continue;
    for (const item of items) {
      const code = taxonomy.codeFor(category, item);
      if (code) codes.add(code);
    }
    services.push({
      category,
      label: taxonomy.categoryName(category) ?? clean(svc.f1)?.replace(/\s*\(e\.g\.[^)]*\)/, '') ?? category,
      items,
    });
  }

  const address = {
    street1: clean(row.street1),
    street2: clean(row.street2),
    city: clean(row.city),
    state: clean(row.state),
    zip: clean(row.zip),
  };
  const phone = clean(row.phone);

  return {
    id: stableId(row.name1, address.street1, address.zip, phone),
    name: clean(row.name1) ?? 'Unnamed facility',
    subname: clean(row.name2),
    address,
    phone,
    intake: clean(row.intake1),
    hotline: clean(row.hotline1),
    website: normalizeWebsite(row.website),
    lat: toFiniteNumber(row.latitude),
    lng: toFiniteNumber(row.longitude),
    miles: toFiniteNumber(row.miles),
    facilityType: clean(row.type_facility),
    codes: [...codes].sort(),
    services,
  };
}

class UpstreamError extends Error {
  constructor(message, { retryable }) {
    super(message);
    this.retryable = retryable;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** One upstream request. Network failures and 5xx responses are retryable. */
async function fetchListing(url, { fetchImpl, timeoutMs }) {
  let res;
  try {
    res = await fetchImpl(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'HarborPath/1.0' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new UpstreamError(err.message, { retryable: err.name !== 'AbortError' });
  }
  if (!res.ok) {
    throw new UpstreamError(`FindTreatment.gov responded with HTTP ${res.status}`, { retryable: res.status >= 500 });
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // The API answers malformed queries with a plain-text message and HTTP 200.
    throw new UpstreamError(`FindTreatment.gov returned a non-JSON response (${text.length} bytes)`, { retryable: false });
  }
}

/**
 * Retry network errors and 5xx responses with exponential backoff and jitter,
 * all within one overall time budget, so a slow upstream is never waited on
 * longer than timeoutMs in total.
 */
async function fetchWithRetry(url, { fetchImpl, timeoutMs, retries, backoffMs, sleep }) {
  const deadline = Date.now() + timeoutMs;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchListing(url, { fetchImpl, timeoutMs: Math.max(1, deadline - Date.now()) });
    } catch (err) {
      const delay = backoffMs * 2 ** attempt * (0.75 + Math.random() / 2);
      // Only retry when a later attempt still has a fair amount of time left.
      if (!err.retryable || attempt >= retries || Date.now() + delay + 1000 > deadline) throw err;
      await sleep(delay);
    }
  }
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
  const cached = cache?.get(url);
  if (cached) return cached;
  const pending = inflight?.get(url);
  if (pending) return pending;

  const work = (async () => {
    try {
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
      cache?.set(url, result);
      return result;
    } catch (err) {
      const stale = cache?.getStale?.(url);
      if (stale) return { ...stale, stale: true };
      throw err;
    } finally {
      inflight?.delete(url);
    }
  })();
  inflight?.set(url, work);
  return work;
}
