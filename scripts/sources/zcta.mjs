// Census Gazetteer ZCTA (ZIP) centroids -> data/zcta.json
// A column table (src/columns.js) sorted by ZIP: zip, lat, lng. Neighboring
// ZIPs are close together, so every column is stored as small deltas.
import { readGazetteer, round } from '../lib/fetch.mjs';
import { encodeTable } from '../../src/columns.js';

const year = process.env.GAZETTEER_YEAR || '2025';
const url = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${year}_Gazetteer/${year}_Gaz_zcta_national.zip`;

/** rows: [{ zip: '98225', lat, lng }] with coordinates rounded to 4 decimals. */
export function encodeZcta(rows) {
  const sorted = [...rows].sort((a, b) => a.zip.localeCompare(b.zip));
  return encodeTable(sorted.map((r) => ({ ...r, zip: Number(r.zip) })), {
    zip: { decimals: 0, delta: true },
    lat: { decimals: 4, delta: true },
    lng: { decimals: 4, delta: true },
  });
}

export default {
  id: 'zcta',
  file: 'zcta.json',
  async build() {
    const rows = await readGazetteer(url);
    const byZip = new Map();
    for (const r of rows) {
      const lat = Number(r.INTPTLAT);
      const lng = Number(r.INTPTLONG);
      if (/^\d{5}$/.test(r.GEOID) && Number.isFinite(lat) && Number.isFinite(lng)) {
        byZip.set(r.GEOID, { zip: r.GEOID, lat: round(lat), lng: round(lng) });
      }
    }
    const data = encodeZcta([...byZip.values()]);
    return { data, meta: { url, count: data.count } };
  },
};
