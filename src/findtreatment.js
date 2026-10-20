// Client for SAMHSA's FindTreatment.gov listing API, the federal directory of
// state-licensed substance use and mental health treatment facilities.
// Docs: FindTreatment.gov API Documentation v1.12 (BHSIS, Aug 2026).
import { readLatLng } from './geo.js';
import { clean, normalizeWebsite, stableId, toFiniteNumber } from './util.js';

export const UPSTREAM_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';
export const PAGE_SIZE = 25;
export const RADII_MILES = [5, 10, 25, 50, 100];
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

export async function searchTreatment(query, { taxonomy, fetchImpl = fetch, cache, timeoutMs = 15000 }) {
  const url = buildUpstreamUrl(query);
  const cached = cache?.get(url);
  if (cached) return cached;

  const res = await fetchImpl(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'HarborPath/1.0' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`FindTreatment.gov responded with HTTP ${res.status}`);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    // The API answers malformed queries with a plain-text message and HTTP 200.
    throw new Error(`FindTreatment.gov returned a non-JSON response: ${text.slice(0, 80)}`);
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  const result = {
    page: toFiniteNumber(body.page) ?? query.page,
    totalPages: toFiniteNumber(body.totalPages) ?? 0,
    total: toFiniteNumber(body.recordCount) ?? rows.length,
    pageSize: PAGE_SIZE,
    results: rows.map((r) => normalizeFacility(r, taxonomy)),
  };
  cache?.set(url, result);
  return result;
}
