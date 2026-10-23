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

// Messages are fixed text: they never repeat what the visitor sent, so a
// response (or a screenshot of one) cannot carry a location or search back.
export class InputError extends Error {}

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

/** Validate and normalize raw query-string params into a search request. */
export function parseTreatmentQuery(params, taxonomy) {
  const loc = readLatLng(params);
  if (!loc) throw new InputError('A valid location is required.');
  const radiusMiles = parseRadius(params);
  const kind = parseKind(params);
  const page = parsePage(params);
  const codes = parseCodes(params, taxonomy);
  return { ...loc, radiusMiles, kind, page, codes };
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

/**
 * Any failure talking to FindTreatment.gov. `code` is one of: 'timeout',
 * 'network', 'http', 'rate-limited', 'malformed', 'too-large', 'circuit-open'.
 *
 * Messages are fixed strings plus, at most, an HTTP status number. They never
 * include the upstream URL (which holds coordinates), the response body
 * (which may echo the query), or the underlying fetch error text.
 */
export class UpstreamError extends Error {
  constructor(code, { retryable = false, status = null } = {}) {
    super(UPSTREAM_MESSAGES[code] ? UPSTREAM_MESSAGES[code](status) : 'FindTreatment.gov request failed');
    this.name = 'UpstreamError';
    this.code = code;
    this.retryable = retryable;
    this.status = status;
  }
}

const UPSTREAM_MESSAGES = {
  timeout: () => 'FindTreatment.gov did not respond in time',
  network: () => 'FindTreatment.gov could not be reached',
  http: (status) => `FindTreatment.gov responded with HTTP ${Number(status) || 0}`,
  'rate-limited': () => 'FindTreatment.gov is rate limiting requests',
  malformed: () => 'FindTreatment.gov returned a non-JSON or malformed response',
  'too-large': () => 'FindTreatment.gov returned an unexpectedly large response',
  'circuit-open': () => 'FindTreatment.gov is temporarily marked unavailable',
};

// 25 listings are about 100 KB. Anything far past that is not a listing page.
export const MAX_UPSTREAM_BYTES = 4 * 1024 * 1024;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One upstream request, bounded by a hard deadline. The timer both aborts the
 * fetch and rejects on its own, so even a fetch implementation that ignores
 * its AbortSignal (or a body that never finishes) cannot hang the request.
 */
async function fetchListing(url, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new UpstreamError('timeout'));
      controller.abort();
    }, timeoutMs);
  });
  const attempt = (async () => {
    let res;
    try {
      res = await fetchImpl(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'HarborPath/1.0' },
        signal: controller.signal,
      });
    } catch (err) {
      const timedOut = controller.signal.aborted || err?.name === 'AbortError' || err?.name === 'TimeoutError';
      throw new UpstreamError(timedOut ? 'timeout' : 'network', { retryable: !timedOut });
    }
    if (!res || typeof res.text !== 'function') throw new UpstreamError('malformed');
    if (res.status === 429) throw new UpstreamError('rate-limited', { status: 429 });
    if (!res.ok) throw new UpstreamError('http', { retryable: res.status >= 500, status: res.status });
    const declared = Number(res.headers?.get?.('content-length'));
    if (Number.isFinite(declared) && declared > MAX_UPSTREAM_BYTES) throw new UpstreamError('too-large');
    let text;
    try {
      text = await res.text();
    } catch {
      const timedOut = controller.signal.aborted;
      throw new UpstreamError(timedOut ? 'timeout' : 'network', { retryable: !timedOut });
    }
    if (text.length > MAX_UPSTREAM_BYTES) throw new UpstreamError('too-large');
    try {
      return JSON.parse(text);
    } catch {
      // The API answers malformed queries with a plain-text message and HTTP 200.
      throw new UpstreamError('malformed');
    }
  })();
  try {
    return await Promise.race([attempt, deadline]);
  } finally {
    clearTimeout(timer);
    attempt.catch(() => {}); // the loser of the race must not become an unhandled rejection
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
 * Fetch and validate one listing page, sharing the cache, in-flight map, and
 * circuit breaker. `finish(result)` may add to a fresh result before it is
 * cached.
 *
 * - A fresh cache hit returns at once.
 * - Identical concurrent requests share one upstream call (`inflight`).
 * - When the upstream fails (or the breaker is open), a copy within the
 *   cache's stale window is returned with `stale: true`; with none, an
 *   UpstreamError is thrown.
 */
export async function fetchListingPage(url, {
  taxonomy, page, fetchImpl = fetch, cache, inflight, breaker,
  timeoutMs = 15000, retries = 2, backoffMs = 250, sleep = wait, finish = (r) => r,
}) {
  const cached = cache?.get(url);
  if (cached) return cached;
  const pending = inflight?.get(url);
  if (pending) return pending;

  const work = (async () => {
    try {
      if (breaker && !breaker.allow()) throw new UpstreamError('circuit-open');
      let body;
      try {
        body = await fetchWithRetry(url, { fetchImpl, timeoutMs, retries, backoffMs, sleep });
        breaker?.success();
      } catch (err) {
        // A reachable upstream that rejects one query is not an outage.
        const reachable = err.code === 'malformed' || err.code === 'too-large' || (err.code === 'http' && err.status < 500);
        if (reachable) breaker?.success();
        else breaker?.failure();
        throw err;
      }
      const result = await finish(readListingPage(body, { taxonomy, page }));
      cache?.set(url, result);
      return result;
    } catch (err) {
      const stale = cache?.getStale?.(url);
      if (stale) return { ...stale, stale: true };
      throw err instanceof UpstreamError ? err : new UpstreamError('malformed');
    } finally {
      inflight?.delete(url);
    }
  })();
  inflight?.set(url, work);
  return work;
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
