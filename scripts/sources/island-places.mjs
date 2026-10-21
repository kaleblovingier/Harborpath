// Census place and island names for the U.S. island areas -> data/island-places.json
// Rows: [name, state, lat, lng, landAreaSqMi], the same shape as places.json.
//
// The national Census Gazetteer place file covers the 50 states, DC, and Puerto
// Rico only, so a search for "Hagåtña" or "St. Croix" found nothing. This adds:
//   - every Census place (villages, towns, CDPs) in American Samoa, Guam, the
//     Northern Mariana Islands, and the U.S. Virgin Islands, from the TIGER/Line
//     2025 place shapefiles (internal points from the .dbf attribute table), and
//   - the county-equivalents people use as place names (St. Thomas, St. Croix,
//     St. John, Saipan, Tinian, Rota, Guam, Manu'a), from Census TIGERweb.
// Both are U.S. Census Bureau products in the public domain.
import { download, round } from '../lib/fetch.mjs';
import { readZipEntries } from '../lib/unzip.mjs';
import { readDbf } from '../lib/dbf.mjs';
import { FIPS_TO_CODE } from '../../src/regions.js';

const year = process.env.TIGER_YEAR || '2025';
const ISLAND_FIPS = ['60', '66', '69', '78'];
const placeUrl = (fips) => `https://www2.census.gov/geo/tiger/TIGER${year}/PLACE/tl_${year}_${fips}_place.zip`;
const countyUrl =
  'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query' +
  `?where=${encodeURIComponent(`STATE IN (${ISLAND_FIPS.map((f) => `'${f}'`).join(',')})`)}` +
  '&outFields=STATE,BASENAME,INTPTLAT,INTPTLON,AREALAND&returnGeometry=false&f=json';

// American Samoa's "Eastern District" and "Western District" are not names
// anyone searches for, and Rose Island is an uninhabited atoll.
const SKIP_COUNTIES = new Set(['Eastern', 'Western', 'Rose Island']);
const SQ_M_PER_SQ_MI = 2589988.11;

export default {
  id: 'islandPlaces',
  file: 'island-places.json',
  async build() {
    const byKey = new Map();
    const add = (name, state, lat, lng, areaSqM) => {
      if (!name || !state || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const row = [name, state, round(lat), round(lng), round((Number(areaSqM) || 0) / SQ_M_PER_SQ_MI, 1)];
      const key = `${name.toLowerCase()}|${state}`;
      if (!byKey.has(key) || row[4] > byKey.get(key)[4]) byKey.set(key, row);
    };

    let places = 0;
    for (const fips of ISLAND_FIPS) {
      const { buf } = await download(placeUrl(fips));
      const dbf = readZipEntries(buf).find((e) => e.name.endsWith('.dbf'));
      for (const r of readDbf(dbf.read())) {
        add(r.NAME, FIPS_TO_CODE[r.STATEFP], Number(r.INTPTLAT), Number(r.INTPTLON), r.ALAND);
        places++;
      }
    }

    const { buf } = await download(countyUrl);
    const counties = JSON.parse(buf.toString('utf8')).features ?? [];
    if (!counties.length) throw new Error('TIGERweb returned no island-area counties');
    for (const { attributes: a } of counties) {
      if (SKIP_COUNTIES.has(a.BASENAME)) continue;
      add(a.BASENAME, FIPS_TO_CODE[a.STATE], Number(a.INTPTLAT), Number(a.INTPTLON), a.AREALAND);
    }

    const data = [...byKey.values()].sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
    return {
      data,
      meta: { urls: [...ISLAND_FIPS.map(placeUrl), countyUrl], places, counties: counties.length, count: data.length },
    };
  },
};
