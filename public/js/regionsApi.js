// Client for HarborPath's state and territory endpoints. Like api.js, every
// request goes to HarborPath's own origin with coordinates rounded to about
// 1 km. Answers are cached in memory for this page view only.
import { ApiError, round2 } from './api.js';

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

const memo = new Map();
function cached(key, load) {
  if (!memo.has(key)) {
    const p = load();
    memo.set(key, p);
    p.catch(() => memo.delete(key)); // let a failed request be retried
  }
  return memo.get(key);
}

export const regionsApi = {
  states: () => cached('states', () => getJson('/api/states')),
  state: (code) => cached(`state:${code}`, () => getJson('/api/state', { code })),
  regionAt: ({ lat, lng }) => {
    const p = { lat: round2(lat), lng: round2(lng) };
    return cached(`region:${p.lat},${p.lng}`, () => getJson('/api/region', p));
  },
  telehealth: ({ state, lat, lng, kind, codes = [], page = 1 }, signal) =>
    getJson('/api/telehealth', {
      state,
      lat: lat === undefined || lat === null ? null : round2(lat),
      lng: lng === undefined || lng === null ? null : round2(lng),
      kind,
      codes: codes.join(','),
      page,
    }, signal),
};

/**
 * The jurisdiction for a location from the shared state: { region, nearby } or null.
 * ZIP and city searches carry their state from the geocoder; "use my location"
 * asks the server, which matches the rounded point to the nearest ZIP area.
 */
export async function regionForLocation(location) {
  if (!location) return null;
  let found = null;
  try {
    found = await regionsApi.regionAt(location);
  } catch {
    found = null;
  }
  if (!location.state) return found?.region ? found : null;
  // The typed ZIP or city decides the state; the point adds neighbors across a line.
  const nearby = (found?.nearby ?? []).filter((r) => r.code !== location.state);
  if (found?.region && found.region.code !== location.state) nearby.unshift(found.region);
  const states = await regionsApi.states().catch(() => null);
  const region = states?.states.find((s) => s.code === location.state) ?? { code: location.state, name: location.state, type: 'state' };
  return { region, nearby };
}
