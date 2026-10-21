// VA health care sites and Vet Centers -> data/va-facilities.json
//
// Source: the Veterans Health Administration's public "VHA Medical Facilities"
// layer, a monthly view of VA's Site Tracking (VAST) database that VHA
// describes as "the only authorized dataset released for use in AGOL by the
// VHA for public use". It has addresses and coordinates but no phone numbers,
// so the UI links each site to its VA.gov page for phone and hours.
import { layerInfo, queryAllFeatures, editDate } from './_arcgis.mjs';
import { round } from '../lib/fetch.mjs';
import { clean } from '../../src/util.js';
import { STATES } from '../../src/geo.js';
import { zip5 } from './_text.mjs';

export const LAYER_URL =
  'https://services1.arcgis.com/smmmD7AGkh7eJR2a/arcgis/rest/services/Veterans_Health_Administration_(VHA)_Facilities/FeatureServer/0';
export const ITEM_URL = 'https://www.arcgis.com/home/item.html?id=c6821e66523a46f5b32893641b9bd0dd';

// VAST site classifications. Community Living Centers (VA nursing homes) admit
// residents only, so they are left out like nursing homes in the HRSA data.
export const CATEGORY = {
  VAMC: 'vamc', // VA medical center
  HCC: 'hcc', // health care center
  MSCBOC: 'mscboc', // multi-specialty community-based outpatient clinic
  PCCBOC: 'pccboc', // primary care community-based outpatient clinic
  OOS: 'oos', // other outpatient services site
  DRRTP: 'rrtp', // domiciliary residential rehabilitation treatment program
  VTCR: 'vc', // Vet Center
  MVCTR: 'mvc', // Mobile Vet Center
  MCS: 'clinic',
};
const EXCLUDED = new Set(['CLC']);
const TERRITORIES = new Set(['GU', 'VI', 'AS', 'MP']);

/** Compact rows from raw VAST attributes. Exported for tests. */
export function parseVaFeatures(attributes) {
  const rows = [];
  for (const r of attributes) {
    const abbr = clean(r.S_ABBR);
    if (!abbr || EXCLUDED.has(abbr)) continue;
    const state = clean(r.S_STATE);
    if (!state || !(STATES[state] || TERRITORIES.has(state))) continue; // e.g. the Manila clinic
    const lat = Number(r.LAT);
    const lng = Number(r.LON);
    const id = clean(r.STA_NO);
    const name = clean(r.STA_NAME);
    if (!id || !name || !Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
    // S_ADD2 is the street; S_ADD1 is a building or plaza name, often just the site name again.
    const street = clean(r.S_ADD2) ?? clean(r.S_ADD1);
    const building = clean(r.S_ADD2) ? clean(r.S_ADD1) : null;
    const row = {
      i: id,
      n: name,
      k: CATEGORY[abbr] ?? 'other',
      a: street,
      c: clean(r.S_CITY),
      s: state,
      z: zip5(r.S_ZIP),
      lat: round(lat, 5),
      lng: round(lng, 5),
    };
    if (building && building !== 'null' && building.toLowerCase() !== name.toLowerCase() && !/vet center$/i.test(building)) row.b = building;
    rows.push(row);
  }
  rows.sort((a, b) => a.i.localeCompare(b.i));
  return rows;
}

export default {
  id: 'vaFacilities',
  file: 'va-facilities.json',
  async build() {
    const info = await layerInfo(LAYER_URL);
    const features = await queryAllFeatures(LAYER_URL, {
      outFields: ['STA_NO', 'STA_NAME', 'S_ADD1', 'S_ADD2', 'S_CITY', 'S_STATE', 'S_ZIP', 'S_ABBR', 'LAT', 'LON', 'MONTHYEAR'],
      orderBy: info.objectIdField ?? 'OBJECTID',
      pageSize: 2000,
    });
    const attributes = features.map((f) => f.attributes);
    const data = parseVaFeatures(attributes);
    const snapshot = attributes.find((a) => a.MONTHYEAR)?.MONTHYEAR ?? null;
    return {
      data,
      meta: {
        url: LAYER_URL,
        landingPage: ITEM_URL,
        publisher: 'U.S. Department of Veterans Affairs, Veterans Health Administration (VAST)',
        license: 'U.S. federal government work (17 U.S.C. 105), public domain; released by VHA for public use',
        updateCadence: 'Monthly snapshot per VHA (check MONTHYEAR)',
        snapshot,
        count: data.length,
        lastModified: editDate(info),
      },
    };
  },
};
