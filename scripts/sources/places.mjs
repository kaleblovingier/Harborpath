// Census Gazetteer places (cities, towns, CDPs) -> data/places.json
// A column table (src/columns.js) sorted by name, then state:
// name, state, lat, lng, area (land area in square miles).
import { readGazetteer, round } from '../lib/fetch.mjs';
import { encodeTable } from '../../src/columns.js';

const year = process.env.GAZETTEER_YEAR || '2025';
const url = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${year}_Gazetteer/${year}_Gaz_place_national.zip`;

const PLACE_SUFFIX = new RegExp(
  '\\s+(city and borough|consolidated government|metropolitan government|metro government|' +
    'unified government|urban county|municipality|borough|city|town|township|village|CDP|' +
    'comunidad|zona urbana|corporation)$',
  'i',
);

// "Indianapolis city (balance)" -> ["Indianapolis"]
// "San Buenaventura (Ventura) city" -> ["San Buenaventura", "Ventura"]
export function cleanPlaceNames(name) {
  const base = name.replace(/\s+\(balance\)$/i, '').replace(PLACE_SUFFIX, '').trim();
  const alias = base.match(/^(.+?)\s+\(([^)]+)\)$/);
  return alias ? [alias[1].trim(), alias[2].trim()] : [base];
}

/** rows: [[name, state, lat, lng, area], ...], already sorted. */
export function encodePlaces(rows) {
  return encodeTable(rows.map(([name, state, lat, lng, area]) => ({ name, state, lat, lng, area })), {
    name: 'plain',
    state: 'dict',
    lat: { decimals: 4 },
    lng: { decimals: 4 },
    area: { decimals: 1 },
  });
}

export default {
  id: 'places',
  file: 'places.json',
  async build() {
    const rows = await readGazetteer(url);
    const byKey = new Map();
    for (const r of rows) {
      const lat = Number(r.INTPTLAT);
      const lng = Number(r.INTPTLONG);
      const area = Number(r.ALAND_SQMI) || 0;
      if (!r.USPS || !r.NAME || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      for (const name of cleanPlaceNames(r.NAME)) {
        const key = `${name.toLowerCase()}|${r.USPS}`;
        const prev = byKey.get(key);
        // Keep the larger of same-named places in one state (e.g. a city and a CDP).
        if (!prev || area > prev[4]) byKey.set(key, [name, r.USPS, round(lat), round(lng), round(area, 1)]);
      }
    }
    const sorted = [...byKey.values()].sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
    const data = encodePlaces(sorted);
    return { data, meta: { url, count: data.count } };
  },
};
