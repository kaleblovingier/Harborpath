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
  let res;
  try {
    res = await fetch(`${path}?${qs}`, { signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('You appear to be offline. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error || `Request failed (${res.status})`, { status: res.status, fallbackUrl: body.fallbackUrl });
  return body;
}

export const round2 = (n) => Math.round(n * 100) / 100;

export const api = {
  geocode: (q, signal) => getJson('/api/geocode', { q }, signal),
  meta: () => getJson('/api/meta'),
  treatment: ({ lat, lng, radius, kind, codes, page }, signal) =>
    getJson('/api/treatment', { lat: round2(lat), lng: round2(lng), radius, kind, codes: codes.join(','), page }, signal),
  healthCenters: ({ lat, lng, radius }, signal) =>
    getJson('/api/health-centers', { lat: round2(lat), lng: round2(lng), radius }, signal),
};
