// Hospitals with emergency services -> data/er-hospitals.json
//
// Source: CMS Provider Data Catalog "Hospital General Information" (every
// Medicare-registered hospital, with an Emergency Services yes/no field).
// CMS publishes no coordinates, so addresses are geocoded at build time (see
// _geocode.mjs); rows placed only by ZIP centroid carry x: 1.
import { download } from '../lib/fetch.mjs';
import { parseCsv } from '../lib/csv.mjs';
import { clean } from '../../src/util.js';
import { locateRows } from './_geocode.mjs';
import { tidyCaps, formatPhone, zip5 } from './_text.mjs';

export const DATASET_ID = 'xubh-q36u';
export const METASTORE_URL = `https://data.cms.gov/provider-data/api/1/metastore/schemas/dataset/items/${DATASET_ID}?show-reference-ids=false`;
export const LANDING_URL = `https://data.cms.gov/provider-data/dataset/${DATASET_ID}`;

export const CATEGORY = {
  'Acute Care Hospitals': 'acute',
  'Critical Access Hospitals': 'cah',
  'Rural Emergency Hospital': 'reh',
  Psychiatric: 'psych',
  Childrens: 'children',
  'Acute Care - Veterans Administration': 'va',
  'Long-term': 'ltc',
};
// Military hospitals are on bases and serve TRICARE beneficiaries.
const EXCLUDED_TYPES = new Set(['Acute Care - Department of Defense']);

// A hospital that converts to a critical access or rural emergency hospital
// gets a new CCN, and CMS can list the old and new CCN side by side. Keep the
// newer designation.
const CONVERSION_RANK = { reh: 2, cah: 1 };

/** Hospitals with Emergency Services = Yes, before coordinates are added. Exported for tests. */
export function selectErHospitals(rows) {
  const byPlace = new Map();
  for (const r of rows) {
    if (clean(r['Emergency Services']) !== 'Yes') continue;
    const type = clean(r['Hospital Type']);
    if (!type || EXCLUDED_TYPES.has(type) || clean(r['Hospital Ownership']) === 'Department of Defense') continue;
    const id = clean(r['Facility ID']);
    const name = clean(r['Facility Name']);
    const street = clean(r.Address);
    const zip = zip5(r['ZIP Code']);
    if (!id || !name || !street || !zip) continue;
    const key = `${name}|${street}|${zip}`.toUpperCase();
    const category = CATEGORY[type] ?? 'acute';
    const prev = byPlace.get(key);
    if (prev && (CONVERSION_RANK[prev.k] ?? 0) >= (CONVERSION_RANK[category] ?? 0)) continue;
    const row = {
      i: id,
      n: tidyCaps(name),
      k: category,
      a: tidyCaps(street),
      c: tidyCaps(clean(r['City/Town'])),
      s: clean(r.State),
      z: zip,
    };
    const phone = formatPhone(r['Telephone Number']);
    if (phone) row.p = phone;
    // Raw values for the geocoder; dropped before writing.
    row._geo = { id, street, city: clean(r['City/Town']), state: row.s, zip };
    byPlace.set(key, row);
  }
  return [...byPlace.values()];
}

/** Attach coordinates from locateRows() output; drop rows that could not be placed. */
export function attachCoordinates(rows, placed) {
  const out = [];
  for (const { _geo, ...row } of rows) {
    const where = placed.get(String(_geo?.id ?? row.i));
    if (!where) continue;
    row.lat = where.lat;
    row.lng = where.lng;
    if (where.approx) row.x = 1;
    out.push(row);
  }
  return out.sort((a, b) => a.i.localeCompare(b.i));
}

export default {
  id: 'erHospitals',
  file: 'er-hospitals.json',
  async build() {
    const { buf: metaBuf } = await download(METASTORE_URL);
    const dataset = JSON.parse(metaBuf.toString('utf8'));
    const url = dataset.distribution?.find((d) => /csv/i.test(d.data?.mediaType ?? d.mediaType ?? ''))?.data?.downloadURL
      ?? dataset.distribution?.[0]?.data?.downloadURL;
    if (!url) throw new Error('Hospital General Information: no CSV distribution in the CMS metastore');
    const { buf, lastModified } = await download(url);
    const all = parseCsv(buf.toString('utf8'));
    const selected = selectErHospitals(all);
    const { placed, stats } = await locateRows(selected.map((r) => r._geo));
    const data = attachCoordinates(selected, placed);
    return {
      data,
      meta: {
        url,
        landingPage: LANDING_URL,
        publisher: 'Centers for Medicare & Medicaid Services (CMS)',
        license: 'U.S. federal government work (17 U.S.C. 105), public domain',
        updateCadence: 'Quarterly (Care Compare refresh)',
        modified: dataset.modified ?? null,
        sourceCount: all.length,
        count: data.length,
        geocoding: { method: 'U.S. Census Bureau batch geocoder, ZIP centroid fallback', ...stats },
        lastModified,
      },
    };
  },
};
