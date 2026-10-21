// Medicare-certified Rural Health Clinics -> data/rural-health-clinics.json
//
// Source: CMS "Rural Health Clinic Enrollments" (quarterly), read through the
// keyless CMS Data API. It lists practice addresses and phone numbers but no
// coordinates, so addresses are geocoded at build time like the ER hospitals.
import { download } from '../lib/fetch.mjs';
import { clean } from '../../src/util.js';
import { locateRows } from './_geocode.mjs';
import { attachCoordinates } from './er-hospitals.mjs';
import { tidyCaps, formatPhone, zip5 } from './_text.mjs';

export const SLUG = '/provider-characteristics/hospitals-and-other-facilities/rural-health-clinic-enrollments';
export const SLUG_URL = `https://data.cms.gov/data-api/v1/slug?path=${encodeURIComponent(SLUG)}`;
export const LANDING_URL = `https://data.cms.gov${SLUG}`;
const PAGE = 5000;

/** Compact rows (before coordinates) from CMS enrollment records. Exported for tests. */
export function selectRuralHealthClinics(records) {
  const out = [];
  const seen = new Set();
  for (const r of records) {
    if (!/RURAL HEALTH CLINIC/i.test(r['PROVIDER TYPE TEXT'] ?? '')) continue;
    const ccn = clean(r.CCN);
    const enrollment = clean(r['ENROLLMENT ID']);
    const id = ccn ?? enrollment;
    const org = clean(r['ORGANIZATION NAME']);
    const dba = clean(r['DOING BUSINESS AS NAME']);
    const street = clean(r['ADDRESS LINE 1']);
    const zip = zip5(r['ZIP CODE']);
    if (!id || !(dba || org) || !street || !zip) continue;
    // One clinic can hold several enrollments (one per NPI); keep the first.
    const key = ccn ?? `${street}|${zip}`.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const name = tidyCaps(dba ?? org);
    const row = {
      i: id,
      n: name,
      a: tidyCaps(street),
      c: tidyCaps(clean(r.CITY)),
      s: clean(r.STATE),
      z: zip,
    };
    const street2 = clean(r['ADDRESS LINE 2']);
    if (street2) row.a2 = tidyCaps(street2);
    if (org && dba && org.toUpperCase() !== dba.toUpperCase()) row.o = tidyCaps(org);
    const phone = formatPhone(r['TELEPHONE NUMBER']);
    if (phone) row.p = phone;
    row._geo = { id, street, city: clean(r.CITY), state: row.s, zip };
    out.push(row);
  }
  return out;
}

async function getJson(url) {
  const { buf, lastModified } = await download(url);
  return { body: JSON.parse(buf.toString('utf8')), lastModified };
}

export default {
  id: 'ruralHealthClinics',
  file: 'rural-health-clinics.json',
  async build() {
    // The slug resolves the dataset series to its current quarterly version.
    const { body: slug } = await getJson(SLUG_URL);
    const seriesId = slug.data?.uuid;
    const current = slug.data?.current_dataset ?? {};
    if (!seriesId) throw new Error('Rural Health Clinic Enrollments: CMS slug lookup returned no dataset id');
    const apiUrl = `https://data.cms.gov/data-api/v1/dataset/${seriesId}/data`;
    const records = [];
    let lastModified = null;
    for (let offset = 0; ; offset += PAGE) {
      const { body, lastModified: lm } = await getJson(`${apiUrl}?size=${PAGE}&offset=${offset}`);
      lastModified ??= lm;
      records.push(...body);
      if (body.length < PAGE) break;
    }
    const selected = selectRuralHealthClinics(records);
    const { placed, stats } = await locateRows(selected.map((r) => r._geo));
    const data = attachCoordinates(selected, placed);
    return {
      data,
      meta: {
        url: apiUrl,
        landingPage: LANDING_URL,
        publisher: 'Centers for Medicare & Medicaid Services (CMS)',
        license: 'U.S. federal government work (17 U.S.C. 105), public domain',
        updateCadence: 'Quarterly',
        version: current.version ?? null,
        modified: current.last_modified_date ?? null,
        sourceCount: records.length,
        count: data.length,
        geocoding: { method: 'U.S. Census Bureau batch geocoder, ZIP centroid fallback', ...stats },
        lastModified: current.last_modified_date ? new Date(`${current.last_modified_date}T00:00:00Z`).toUTCString() : lastModified,
      },
    };
  },
};
