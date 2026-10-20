// Offline geocoding from Census Gazetteer centroids. Nothing a visitor types is
// ever sent to a third-party geocoder.

export const STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', PR: 'Puerto Rico',
};

const STATE_BY_NAME = new Map(Object.entries(STATES).map(([abbr, name]) => [name.toLowerCase(), abbr]));
const EARTH_RADIUS_MILES = 3958.8;

export function haversineMiles(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

// Two decimals is roughly 1 km: precise enough to rank nearby services, coarse
// enough that an exact home address never leaves the server.
export function coarsen(n, decimals = 2) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function isValidLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

/** Read lat/lng from query params, coarsened. Missing or blank values are invalid (not 0). */
export function readLatLng(params) {
  const rawLat = params.get('lat');
  const rawLng = params.get('lng');
  if (!rawLat?.trim() || !rawLng?.trim()) return null;
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  return isValidLatLng(lat, lng) ? { lat: coarsen(lat), lng: coarsen(lng) } : null;
}

const normalizeName = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\bsaint\b/g, 'st')
    .replace(/\bfort\b/g, 'ft')
    .replace(/\bmount\b/g, 'mt')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Split "Portland, OR" / "Portland Oregon" / "portland" into { city, state }. */
export function parsePlaceQuery(q) {
  const text = q.replace(/\s+/g, ' ').trim();
  const comma = text.match(/^(.+?),\s*([A-Za-z .]+)$/);
  if (comma) {
    const state = resolveState(comma[2]);
    if (state) return { city: comma[1], state };
  }
  // Try a trailing state abbreviation or full state name without a comma.
  const words = text.split(' ');
  for (let take = Math.min(3, words.length - 1); take >= 1; take--) {
    const state = resolveState(words.slice(-take).join(' '));
    if (state) return { city: words.slice(0, -take).join(' '), state };
  }
  return { city: text, state: null };
}

function resolveState(s) {
  const v = s.replace(/\./g, '').trim();
  if (/^[A-Za-z]{2}$/.test(v) && STATES[v.toUpperCase()]) return v.toUpperCase();
  return STATE_BY_NAME.get(v.toLowerCase()) ?? null;
}

export function createGeocoder({ zcta, places }) {
  const indexed = places.map(([name, state, lat, lng, area]) => ({
    name, state, lat, lng, area, key: normalizeName(name),
  }));

  // Without boundaries, approximate each place as a circle of its land area.
  // Among places that likely contain the point, the smallest (most specific)
  // wins; otherwise the place whose edge is closest. Plain centroid distance
  // would label midtown Manhattan as Hoboken, since NYC's centroid is miles away.
  function nearestPlace(lat, lng) {
    let containing = null;
    let closest = null;
    let closestGap = Infinity;
    for (const p of indexed) {
      if (Math.abs(p.lat - lat) > 0.6 || Math.abs(p.lng - lng) > 0.8) continue;
      const gap = haversineMiles(lat, lng, p.lat, p.lng) - Math.sqrt(p.area / Math.PI);
      if (gap <= 0 && (!containing || p.area < containing.area)) containing = p;
      if (gap < closestGap) { closestGap = gap; closest = p; }
    }
    return containing ?? closest;
  }

  // PO-box-only ZIPs (e.g. 85001) have no Census centroid. Fall back to the
  // numerically closest ZIP with the same 3-digit prefix, which is nearby.
  const zipKeys = Object.keys(zcta).sort();
  function nearbyZip(zip) {
    const prefix = zip.slice(0, 3);
    let best = null;
    for (const k of zipKeys) {
      if (!k.startsWith(prefix)) continue;
      if (!best || Math.abs(Number(k) - Number(zip)) < Math.abs(Number(best) - Number(zip))) best = k;
    }
    return best;
  }

  return {
    lookup(rawQuery, limit = 8) {
      const q = String(rawQuery ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
      if (q.length < 2) return [];

      const zip = q.match(/^(\d{5})(?:-\d{4})?$/);
      if (zip) {
        const key = zcta[zip[1]] ? zip[1] : nearbyZip(zip[1]);
        if (!key) return [];
        const [lat, lng] = zcta[key];
        const near = nearestPlace(lat, lng);
        return [{
          label: near ? `${zip[1]} · ${near.name}, ${near.state}` : `ZIP ${zip[1]}`,
          lat, lng, kind: 'zip',
        }];
      }
      if (/^\d+$/.test(q)) return [];

      const { city, state } = parsePlaceQuery(q);
      const key = normalizeName(city);
      if (!key) return [];

      // Rank: exact name, then prefix ("bell" -> Bellingham), then a later
      // word ("honolulu" -> Urban Honolulu); ties go to the larger place.
      const matches = [];
      for (const p of indexed) {
        if (state && p.state !== state) continue;
        const rank = p.key === key ? 3 : p.key.startsWith(key) ? 2 : p.key.includes(` ${key}`) ? 1 : 0;
        if (rank) matches.push({ p, rank });
      }
      matches.sort((a, b) => b.rank - a.rank || b.p.area - a.p.area);
      return matches.slice(0, limit).map(({ p }) => ({
        label: `${p.name}, ${p.state}`, lat: p.lat, lng: p.lng, kind: 'place',
      }));
    },
  };
}
