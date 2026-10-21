// Offline geocoding from Census Gazetteer centroids. Nothing a visitor types is
// ever sent to a third-party geocoder.
import { decodeTable, isTable } from './columns.js';
import { createGrid } from './grid.js';

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
  GU: 'Guam', VI: 'Virgin Islands', AS: 'American Samoa', MP: 'Northern Mariana Islands',
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

const fullNormalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bsaint\b/g, 'st')
    .replace(/\bfort\b/g, 'ft')
    .replace(/\bmount\b/g, 'mt')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// About 97% of place names are plain ASCII words ("Bellingham", "Kansas
// City"), for which fullNormalize is just toLowerCase(). Skipping the Unicode
// and regex passes for them makes indexing about 3 times faster.
const PLAIN_WORDS = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const ABBREVIATED = /\b(?:saint|fort|mount)\b/i;
export const normalizeName = (s) => (PLAIN_WORDS.test(s) && !ABBREVIATED.test(s) ? s.toLowerCase() : fullNormalize(s));

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

// data/places.json and data/zcta.json are column tables (see columns.js).
// Older row shapes are still accepted, so small hand-made fixtures work too.
function decodePlaceSource(places) {
  if (isTable(places)) {
    const { count, columns } = decodeTable(places);
    return { count, ...columns };
  }
  // [[name, state, lat, lng, landAreaSqMi], ...]
  return {
    count: places.length,
    name: places.map((p) => p[0]),
    state: places.map((p) => p[1]),
    lat: Float64Array.from(places, (p) => p[2]),
    lng: Float64Array.from(places, (p) => p[3]),
    area: Float64Array.from(places, (p) => p[4]),
  };
}

function readPlaces(places, extra) {
  const base = decodePlaceSource(places);
  if (!extra) return base;
  const more = decodePlaceSource(extra);
  if (!more.count) return base;
  const concatF64 = (a, b) => {
    const out = new Float64Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  };
  return {
    count: base.count + more.count,
    name: base.name.concat(more.name),
    state: base.state.concat(more.state),
    lat: concatF64(base.lat, more.lat),
    lng: concatF64(base.lng, more.lng),
    area: concatF64(base.area, more.area),
  };
}

function readZcta(zcta) {
  if (isTable(zcta)) {
    const { count, columns } = decodeTable(zcta);
    return { count, ...columns };
  }
  // { "98225": [lat, lng], ... }
  const zips = Object.keys(zcta).sort();
  return {
    count: zips.length,
    zip: Float64Array.from(zips, Number),
    lat: Float64Array.from(zips, (z) => zcta[z][0]),
    lng: Float64Array.from(zips, (z) => zcta[z][1]),
  };
}

/** Index of the first element >= value in a sorted numeric array. */
function lowerBound(sorted, value) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Typeahead index over normalized names: every word start, bucketed by its
// first two characters, so a query only checks names that share its first two
// characters at a word start. Stored flat (a counting sort): bucket b holds
// [placeIndex, offset] pairs in entries[2 * start[b] .. 2 * start[b + 1]).
// Normalized keys are ASCII; anything else would share bucket 127.
const bucketOf = (s, j) => Math.min(s.charCodeAt(j), 127) * 128 + Math.min(s.charCodeAt(j + 1), 127);

function buildNameIndex(keys) {
  const place = [];
  const offset = [];
  const bucket = [];
  const start = new Int32Array(128 * 128 + 1);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    // Jump from word start to word start (j = -1 when there are no more). A
    // suffix needs 2+ characters to match a query, which is 2+ characters.
    for (let j = 0; j >= 0 && j < k.length - 1; ) {
      const b = bucketOf(k, j);
      place.push(i);
      offset.push(j);
      bucket.push(b);
      start[b + 1]++;
      const space = k.indexOf(' ', j);
      j = space < 0 ? -1 : space + 1;
    }
  }
  for (let b = 1; b < start.length; b++) start[b] += start[b - 1];
  const entries = new Int32Array(place.length * 2);
  const fill = start.slice(0, -1);
  for (let e = 0; e < place.length; e++) {
    const at = fill[bucket[e]]++ * 2;
    entries[at] = place[e];
    entries[at + 1] = offset[e];
  }
  return { start, entries };
}

export function createGeocoder({ zcta: zctaData, places: placeData, islandPlaces: islandData }) {
  const places = readPlaces(placeData, islandData);
  const zcta = readZcta(zctaData);
  // Built on first use: a ZIP lookup needs only the grid, a city query only
  // the name index.
  const once = (build) => { let value; return () => (value ??= build()); };
  const nameIndex = once(() => {
    const keys = places.name.map(normalizeName);
    return { keys, ...buildNameIndex(keys) };
  });
  const placeGrid = once(() => createGrid(places.lat, places.lng, 0.5));

  // Without boundaries, approximate each place as a circle of its land area.
  // Among places that likely contain the point, the smallest (most specific)
  // wins; otherwise the place whose edge is closest. Plain centroid distance
  // would label midtown Manhattan as Hoboken, since NYC's centroid is miles away.
  // Ties go to the earlier place in the file, as a full scan in order would.
  function nearestPlace(lat, lng) {
    let containing = -1;
    let closest = -1;
    let closestGap = Infinity;
    placeGrid().forEachCandidate(lat - 0.6, lat + 0.6, lng - 0.8, lng + 0.8, (i) => {
      const pLat = places.lat[i];
      const pLng = places.lng[i];
      if (Math.abs(pLat - lat) > 0.6 || Math.abs(pLng - lng) > 0.8) return;
      const area = places.area[i];
      const gap = haversineMiles(lat, lng, pLat, pLng) - Math.sqrt(area / Math.PI);
      if (gap <= 0 && (containing < 0 || area < places.area[containing] || (area === places.area[containing] && i < containing))) {
        containing = i;
      }
      if (gap < closestGap || (gap === closestGap && i < closest)) {
        closestGap = gap;
        closest = i;
      }
    });
    return containing >= 0 ? containing : closest;
  }

  // PO-box-only ZIPs (e.g. 85001) have no Census centroid. Fall back to the
  // numerically closest ZIP with the same 3-digit prefix, which is nearby
  // (the lower ZIP on a tie).
  function findZip(zip) {
    const n = Number(zip);
    const at = lowerBound(zcta.zip, n);
    if (zcta.zip[at] === n) return at;
    const base = n - (n % 100);
    let best = -1;
    for (let i = lowerBound(zcta.zip, base); i < zcta.count && zcta.zip[i] < base + 100; i++) {
      if (best < 0 || Math.abs(zcta.zip[i] - n) < Math.abs(zcta.zip[best] - n)) best = i;
    }
    return best;
  }

  // Rank: exact name 3, prefix 2 ("bell" -> Bellingham), a later word 1
  // ("honolulu" -> Urban Honolulu). Returns the best `limit` place indexes.
  function matchPlaces(key, state, limit) {
    const { keys, start, entries } = nameIndex();
    const ranks = new Map();
    const consider = (i, rank) => {
      if (rank > (ranks.get(i) ?? 0)) ranks.set(i, rank);
    };
    if (key.length >= 2) {
      const b = bucketOf(key, 0);
      for (let e = start[b] * 2; e < start[b + 1] * 2; e += 2) {
        const i = entries[e];
        const j = entries[e + 1];
        if (state && places.state[i] !== state) continue;
        if (!keys[i].startsWith(key, j)) continue;
        consider(i, j > 0 ? 1 : keys[i].length === key.length ? 3 : 2);
      }
    } else {
      // A one-character key is rare ("a."); scan everything.
      for (let i = 0; i < places.count; i++) {
        if (state && places.state[i] !== state) continue;
        const k = keys[i];
        const rank = k === key ? 3 : k.startsWith(key) ? 2 : k.includes(` ${key}`) ? 1 : 0;
        if (rank) consider(i, rank);
      }
    }
    // Higher rank first; ties go to the larger place, then the earlier one in
    // the file. Short queries ("sa") match thousands, so instead of sorting
    // them all, keep a sorted list of the best `limit`.
    const order = ([a, ra], [b, rb]) => rb - ra || places.area[b] - places.area[a] || a - b;
    const top = [];
    if (!(limit > 0)) return top;
    for (const match of ranks) {
      if (top.length >= limit && order(match, top[top.length - 1]) > 0) continue;
      let at = top.length;
      while (at > 0 && order(match, top[at - 1]) < 0) at--;
      top.splice(at, 0, match);
      if (top.length > limit) top.pop();
    }
    return top.map(([i]) => i);
  }

  return {
    lookup(rawQuery, limit = 8) {
      const q = String(rawQuery ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
      if (q.length < 2) return [];

      const zip = q.match(/^(\d{5})(?:-\d{4})?$/);
      if (zip) {
        const at = findZip(zip[1]);
        if (at < 0) return [];
        const lat = zcta.lat[at];
        const lng = zcta.lng[at];
        const near = nearestPlace(lat, lng);
        return [{
          label: near >= 0 ? `${zip[1]} · ${places.name[near]}, ${places.state[near]}` : `ZIP ${zip[1]}`,
          lat, lng, kind: 'zip',
        }];
      }
      if (/^\d+$/.test(q)) return [];

      const { city, state } = parsePlaceQuery(q);
      const key = normalizeName(city);
      if (!key) return [];

      return matchPlaces(key, state, limit).map((i) => ({
        label: `${places.name[i]}, ${places.state[i]}`, lat: places.lat[i], lng: places.lng[i], kind: 'place',
      }));
    },
  };
}
