// Census Gazetteer ZCTA (ZIP) centroids -> data/zcta.json
import { readGazetteer, round } from '../lib/fetch.mjs';

const year = process.env.GAZETTEER_YEAR || '2025';
const url = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${year}_Gazetteer/${year}_Gaz_zcta_national.zip`;

export default {
  id: 'zcta',
  file: 'zcta.json',
  async build() {
    const rows = await readGazetteer(url);
    const out = {};
    for (const r of rows) {
      const lat = Number(r.INTPTLAT);
      const lng = Number(r.INTPTLONG);
      if (r.GEOID && Number.isFinite(lat) && Number.isFinite(lng)) out[r.GEOID] = [round(lat), round(lng)];
    }
    return { data: out, meta: { url, count: Object.keys(out).length } };
  },
};
