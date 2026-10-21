// Coordinates for address-only datasets (CMS publishes street addresses but no
// coordinates). Addresses are geocoded at build time with the U.S. Census
// Bureau's public batch geocoder; anything it can't place falls back to the
// Census ZIP (ZCTA) centroid and is flagged approximate so the UI can say so.
// Only facility addresses are sent: never anything a visitor typed.
import { readGazetteer, round } from '../lib/fetch.mjs';
import { parseCsv } from '../lib/csv.mjs';
import { haversineMiles } from '../../src/geo.js';

export const CENSUS_BATCH_URL = 'https://geocoding.geo.census.gov/geocoder/locations/addressbatch';

const year = process.env.GAZETTEER_YEAR || '2025';
export const ZCTA_URL = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${year}_Gazetteer/${year}_Gaz_zcta_national.zip`;

/** Parse the batch geocoder's headerless CSV into Map(id -> { lat, lng, state, zip }). Only "Match" rows. */
export function parseGeocoderResponse(text) {
  const rows = parseCsv(`id,input,match,exact,matched,coords,tiger,side\n${text}`);
  const out = new Map();
  for (const r of rows) {
    if (r.match !== 'Match') continue;
    const [lng, lat] = r.coords.split(',').map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const parts = r.matched.split(',').map((s) => s.trim());
    out.set(r.id, { lat, lng, city: parts.at(-3) ?? null, state: parts.at(-2) ?? null, zip: parts.at(-1) ?? null });
  }
  return out;
}

const csvField = (v) => `"${String(v ?? '').replace(/"/g, '').replace(/\s+/g, ' ').trim()}"`;

const NUMBER_WORDS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6, SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10 };

/**
 * Strip what street-range geocoders can't use: PO boxes, parentheticals, and a
 * leading number written as a word ("Two St Vincent Circle"). Exported for tests.
 */
export function cleanStreet(street) {
  let s = String(street ?? '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\bP\.?\s*O\.?\s*BOX\s*\d+\s*[-,;]?/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;-]+|[\s,;-]+$/g, '');
  s = s.replace(/^([A-Za-z]+)\b/, (w) => NUMBER_WORDS[w.toUpperCase()] ?? w);
  return s;
}

async function geocodeChunk(chunk, { fetchImpl, retries, log, label }) {
  const csv = chunk.map((r) => [r.id, cleanStreet(r.street), r.city, r.state, r.zip].map(csvField).join(',')).join('\n');
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const form = new FormData();
      form.set('benchmark', 'Public_AR_Current');
      form.set('addressFile', new Blob([csv], { type: 'text/csv' }), 'addresses.csv');
      const res = await fetchImpl(CENSUS_BATCH_URL, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parseGeocoderResponse(await res.text());
    } catch (err) {
      if (attempt === retries) log(`  geocoder ${label} failed (${err.message}); using ZIP centroids for it`);
      else await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return new Map();
}

/**
 * Geocode rows [{ id, street, city, state, zip }] in chunks, then retry the
 * misses once in smaller chunks (the batch service occasionally drops matches
 * under load). Failed chunks are logged and skipped, so a geocoder outage
 * degrades accuracy to ZIP centroids instead of breaking the build.
 */
export async function geocodeAddresses(rows, { fetchImpl = fetch, chunkSize = 1000, retries = 2, log = console.log } = {}) {
  const found = new Map();
  for (const [pass, size] of [[1, chunkSize], [2, Math.max(1, Math.floor(chunkSize / 4))]]) {
    const todo = pass === 1 ? rows : rows.filter((r) => !found.has(String(r.id)));
    for (let i = 0; i < todo.length; i += size) {
      const hits = await geocodeChunk(todo.slice(i, i + size), { fetchImpl, retries, log, label: `pass ${pass} chunk ${i / size + 1}` });
      for (const [id, hit] of hits) found.set(id, hit);
    }
  }
  return found;
}

/** Map(zip -> [lat, lng]) from the Census ZCTA Gazetteer (downloaded directly, independent of data/zcta.json). */
export async function loadZipCentroids(url = ZCTA_URL) {
  const out = new Map();
  for (const r of await readGazetteer(url)) {
    const lat = Number(r.INTPTLAT);
    const lng = Number(r.INTPTLONG);
    if (r.GEOID && Number.isFinite(lat) && Number.isFinite(lng)) out.set(r.GEOID, [lat, lng]);
  }
  return out;
}

// PO-box-only ZIPs have no ZCTA. The numerically closest ZIP with the same
// 3-digit prefix is nearby (same approach as the server's geocoder).
function nearbyZipCentroid(zip, zips) {
  let best = null;
  let bestGap = Infinity;
  for (const [k, v] of zips) {
    if (!k.startsWith(zip.slice(0, 3))) continue;
    const gap = Math.abs(Number(k) - Number(zip));
    if (gap < bestGap) { bestGap = gap; best = v; }
  }
  return best;
}

const sameText = (a, b) => String(a ?? '').toUpperCase().replace(/[^A-Z]/g, '') === String(b ?? '').toUpperCase().replace(/[^A-Z]/g, '');

/**
 * Choose coordinates for one row: the geocoded point when it is plausible
 * (same state, and either the same ZIP, the same city, or within maxMiles of
 * the ZIP centroid), otherwise the ZIP centroid with approx: true. Returns
 * null when neither is available.
 */
export function placeRow(row, geocoded, zips, { maxMiles = 40 } = {}) {
  const zip = String(row.zip ?? '').slice(0, 5);
  const centroid = zips.get(zip) ?? (/^\d{5}$/.test(zip) ? nearbyZipCentroid(zip, zips) : null);
  const hit = geocoded.get(String(row.id));
  if (hit && (!hit.state || hit.state === row.state)) {
    const plausible = hit.zip === zip
      || sameText(hit.city, row.city)
      || !centroid
      || haversineMiles(hit.lat, hit.lng, centroid[0], centroid[1]) <= maxMiles;
    if (plausible) return { lat: round(hit.lat, 5), lng: round(hit.lng, 5), approx: false };
  }
  if (centroid) return { lat: round(centroid[0], 4), lng: round(centroid[1], 4), approx: true };
  return null;
}

/** Geocode, then place every row. Returns { placed: Map(id -> coords), stats }. */
export async function locateRows(rows, { fetchImpl, log = console.log, zips } = {}) {
  const zipCentroids = zips ?? (await loadZipCentroids());
  const geocoded = await geocodeAddresses(rows, { fetchImpl, log });
  const placed = new Map();
  const stats = { geocoded: 0, approximate: 0, unplaced: 0 };
  for (const row of rows) {
    const where = placeRow(row, geocoded, zipCentroids);
    if (!where) { stats.unplaced++; continue; }
    if (where.approx) stats.approximate++;
    else stats.geocoded++;
    placed.set(String(row.id), where);
  }
  log(`  located ${placed.size}/${rows.length}: ${stats.geocoded} by address, ${stats.approximate} by ZIP centroid, ${stats.unplaced} dropped`);
  return { placed, stats };
}
