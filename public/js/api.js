// All network calls go to HarborPath's own origin. The server forwards
// treatment searches to SAMHSA with coordinates rounded to about 1 km.

export class ApiError extends Error {
  constructor(message, { status, fallbackUrl } = {}) {
    super(message);
    this.status = status;
    this.fallbackUrl = fallbackUrl;
  }
}

async function getJson(path, params, signal) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== null && v !== undefined && v !== '') qs.set(k, String(v));
  }
  const query = qs.toString();
  const url = query ? `${path}?${query}` : path;
  let res;
  try {
    res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('You appear to be offline. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error || `Request failed (${res.status})`, { status: res.status, fallbackUrl: body.fallbackUrl });
  return body;
}

export const round2 = (n) => Math.round(n * 100) / 100;
export const round = round2;

export const api = {
  geocode: (q, signal) => getJson('/api/geocode', { q }, signal),
  meta: (signal) => getJson('/api/meta', null, signal),
  treatment: ({ lat, lng, radius, kind, codes = [], page }, signal) =>
    getJson('/api/treatment', {
      lat: round2(lat),
      lng: round2(lng),
      radius,
      kind,
      codes: Array.isArray(codes) ? codes.join(',') : codes,
      page,
    }, signal),
  healthCenters: ({ lat, lng, radius }, signal) =>
    getJson('/api/health-centers', { lat: round2(lat), lng: round2(lng), radius }, signal),
  nearbySummary: ({ lat, lng, radius } = {}, signal) =>
    getJson('/api/nearby-summary', { lat: round2(lat), lng: round2(lng), radius }, signal),
  providers: ({ lat, lng, radius, kind, type, filter }, signal) =>
    getJson('/api/providers', {
      lat: round2(lat),
      lng: round2(lng),
      radius,
      type: type ?? kind,
      kind: kind ?? type,
      filter,
    }, signal),
  region: ({ zip, lat, lng } = {}, signal) =>
    getJson('/api/region', {
      zip,
      lat: lat === undefined || lat === null ? null : round2(lat),
      lng: lng === undefined || lng === null ? null : round2(lng),
    }, signal),
  states: (signal) => getJson('/api/states', null, signal),
  state: (code, signal) =>
    getJson('/api/state', { code: typeof code === 'object' && code !== null ? code.code : code }, signal),
  virtualProviders: ({ state } = {}, signal) => getJson('/api/virtual-providers', { state }, signal),
  telehealth: ({ state, lat, lng, kind, codes = [], page = 1 } = {}, signal) =>
    getJson('/api/telehealth', {
      state,
      lat: lat === undefined || lat === null ? null : round2(lat),
      lng: lng === undefined || lng === null ? null : round2(lng),
      kind,
      codes: Array.isArray(codes) ? codes.join(',') : codes,
      page,
    }, signal),
};
