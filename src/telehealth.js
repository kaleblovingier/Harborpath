// Statewide telehealth search. A program that offers telehealth can usually
// see anyone in the state it is licensed in, so for rural visitors the useful
// question is not "what is within 25 miles" but "which programs in my state
// offer telehealth". FindTreatment.gov answers that with its stateCode filter
// (API docs v1.12: "stateCode=xx ... in combination with limitType=2 to search
// for facilities in a state within a given radius distance"); the value must be
// quoted ('WA'), or the API rejects the request.
import { readLatLng } from './geo.js';
import { InputError, KINDS, PAGE_SIZE, UPSTREAM_URL, normalizeFacility } from './findtreatment.js';
import { describeRegion } from './regions.js';
import { toFiniteNumber } from './util.js';

export const TELEHEALTH_CODE = 'TELE';
// 5,000 miles reaches every corner of any state or territory from any point in it.
const STATEWIDE_METERS = 8_046_720;
const MAX_EXTRA_CODES = 7;
const MAX_PAGE = 40;

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
  if (params.get('lat') || params.get('lng')) {
    point = readLatLng(params);
    if (!point) throw new InputError('A valid location is required.');
  }
  const anchor = point ?? anchorFor(code);
  if (!anchor) throw new InputError('No search point for that state');

  const kind = (params.get('kind') ?? 'sa').toLowerCase();
  if (!KINDS.includes(kind)) throw new InputError('kind must be "sa" or "mh"');

  const page = Number(params.get('page') ?? 1);
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) throw new InputError('page is out of range');

  const extra = [...new Set((params.get('codes') ?? '').split(',').map((c) => c.trim()).filter(Boolean))]
    .filter((c) => c !== TELEHEALTH_CODE);
  if (extra.length > MAX_EXTRA_CODES) throw new InputError(`At most ${MAX_EXTRA_CODES} filters with telehealth`);
  for (const c of extra) {
    if (!taxonomy.hasService(c)) throw new InputError(`Unknown service code: ${c}`);
  }

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

export async function searchTelehealth(query, { taxonomy, fetchImpl = fetch, cache, timeoutMs = 15000 }) {
  const url = buildTelehealthUrl(query);
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
    throw new Error(`FindTreatment.gov returned a non-JSON response (${text.length} bytes)`);
  }
  const rows = Array.isArray(body.rows) ? body.rows : [];
  const results = rows
    .map((r) => normalizeFacility(r, taxonomy))
    // Distances from a point the visitor did not choose would mislead.
    .map((f) => (query.byDistance ? f : { ...f, miles: null }));
  const result = {
    page: toFiniteNumber(body.page) ?? query.page,
    totalPages: toFiniteNumber(body.totalPages) ?? 0,
    total: toFiniteNumber(body.recordCount) ?? rows.length,
    pageSize: PAGE_SIZE,
    state: describeRegion(query.state),
    byDistance: query.byDistance,
    results,
  };
  cache?.set(url, result);
  return result;
}
