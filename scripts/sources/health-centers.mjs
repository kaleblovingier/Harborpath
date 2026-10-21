// HRSA health center service delivery sites -> data/health-centers.json
// A column table (src/columns.js) in HRSA's file order. Organization names,
// websites, cities, and states repeat across sites, so they are stored once in
// a dictionary.
import { download, round } from '../lib/fetch.mjs';
import { parseCsv } from '../lib/csv.mjs';
import { normalizeWebsite } from '../../src/util.js';
import { encodeTable } from '../../src/columns.js';

const url = 'https://data.hrsa.gov/DataDownload/DD_Files/Health_Center_Service_Delivery_and_LookAlike_Sites.csv';

// Sites that only serve a closed population (students, residents, people in
// custody) or whose location must stay confidential (DV shelters) are skipped.
const EXCLUDED_SETTINGS = new Set([
  'School',
  'Correctional Facility',
  'Transitional Care in Carceral Setting',
  'Domestic Violence',
  'Nursing Home',
]);

// Field order is the key order of each site object the API returns.
export const SITE_COLUMNS = {
  id: 'plain',
  name: 'plain',
  org: 'dict',
  street: 'plain',
  city: 'dict',
  state: 'dict',
  zip: 'plain',
  phone: 'plain',
  website: 'dict',
  hours: 'plain',
  mobile: 'bits',
  seasonal: 'bits',
  lookAlike: 'bits',
  lat: { decimals: 5 },
  lng: { decimals: 5 },
};

export function encodeSites(sites) {
  return encodeTable(sites, SITE_COLUMNS);
}

export default {
  id: 'healthCenters',
  file: 'health-centers.json',
  async build() {
    const { buf, lastModified } = await download(url);
    const rows = parseCsv(buf.toString('utf8'));
    const sites = [];
    for (const r of rows) {
      if (r['Site Status Description'] !== 'Active') continue;
      if (r['Health Center Type Description'] === 'Administrative') continue;
      if (EXCLUDED_SETTINGS.has(r['Health Center Service Delivery Site Location Setting Description'])) continue;
      const lat = Number(r['Geocoding Artifact Address Primary Y Coordinate']);
      const lng = Number(r['Geocoding Artifact Address Primary X Coordinate']);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
      const locType = r['Health Center Location Type Description'];
      sites.push({
        id: r['BPHC Assigned Number'] || `${r['Health Center Number']}-${sites.length}`,
        name: r['Site Name'],
        org: r['Health Center Name'],
        street: r['Site Address'],
        city: r['Site City'],
        state: r['Site State Abbreviation'],
        zip: (r['Site Postal Code'] || '').slice(0, 5),
        phone: r['Site Telephone Number'] || null,
        website: normalizeWebsite(r['Site Web Address']),
        hours: Number(r['Operating Hours per Week']) || null,
        mobile: locType === 'Mobile Van',
        seasonal: locType === 'Seasonal' || r['Health Center Operating Calendar'] === 'Seasonal',
        lookAlike: /look-?alike/i.test(r['Health Center Type']),
        lat: round(lat, 5),
        lng: round(lng, 5),
      });
    }
    return { data: encodeSites(sites), meta: { url, count: sites.length, lastModified } };
  },
};
