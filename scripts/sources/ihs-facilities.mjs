// IHS, Tribal, and Urban Indian health facilities -> data/ihs-facilities.json
//
// Source: the IHS Office of Public Health's public "ITU Health Facilities"
// layer, the data behind ihs.gov/findhealthcare. IHS updates it quarterly and
// asks users to cite the IHS Office of Public Health. Staff contact fields
// (POC name and email) are never requested.
import { layerInfo, queryAllFeatures, editDate } from './_arcgis.mjs';
import { round } from '../lib/fetch.mjs';
import { clean, normalizeWebsite, stableId } from '../../src/util.js';
import { zip5 } from './_text.mjs';

export const LAYER_URL =
  'https://services2.arcgis.com/VFLAJVozK0rtzQmT/arcgis/rest/services/ITU_Health_Facilities_View/FeatureServer/0';
export const ITEM_URL = 'https://www.arcgis.com/home/item.html?id=39054333f05b4c05837cba3f4340ecbf';

const FIELDS = [
  'GlobalID', 'FACILITY_NAME', 'FACILITY_ALIAS', 'PHYSICAL_STREET', 'CITY', 'STATE', 'ZIP', 'PHONE', 'HOURS',
  'BH_FLAG', 'SUD', 'ER_FLAG', 'URG_FLAG', 'DENTAL_FLAG', 'PHARM_FLAG', 'SERVICE_TYPE', 'SERVICES', 'ITU_CODE',
  'STATUS', 'LATITUDE', 'LONGITUDE', 'WEBSITE_URL', 'FHC_Facility_Type',
];

export const CATEGORY = {
  Hospital: 'hospital',
  'Health Center': 'center',
  'Health Station': 'station',
  'Alaska Village Clinic': 'village',
  'Behavioral Health': 'behavioral',
  'Dental Clinic': 'dental',
  'Health Location': 'location',
  Other: 'other',
};

// Closed-population, residential-only, or non-clinical sites: offices,
// schools, long-term care, staff housing, and similar.
const EXCLUDED_SERVICE_TYPES = new Set([
  'Tribal Health Administration',
  'Tribal Health Support Services',
  'School-Based Health Services',
  'Boarding School Clinic',
  'Long Term Care',
  'Assisted Living',
  'Residential Assisted Living Facility',
  'Early Childhood Development',
  'Child & Family Developmental Services',
  'Clinical Staff Housing',
  'Fire & EMS Services',
  'Purchased/Referred Care',
]);
const EXCLUDED_NAMES =
  /\b(school|academy|head ?start|elementary|high school|junior high|college|polytechnic|learning center|child care|detention|jail|correctional|administrative|administration)\b/i;

// I = IHS-operated, T = Tribal, U = Urban Indian organization. N ("Non-IHS")
// rows are outside hospitals and clinics IHS tracks; they aren't ITU programs.
const OPERATORS = new Set(['I', 'T', 'U']);

const flag = (v) => String(v ?? '').trim() === '1';

/** Compact rows from raw layer features. Exported for tests. */
export function parseIhsFeatures(features) {
  const rows = [];
  for (const { attributes: r, geometry: g } of features) {
    if (clean(r.STATUS) !== 'Active') continue;
    const operator = clean(r.ITU_CODE);
    if (!OPERATORS.has(operator)) continue;
    const serviceType = clean(r.SERVICE_TYPE);
    if (serviceType && EXCLUDED_SERVICE_TYPES.has(serviceType)) continue;
    const name = clean(r.FACILITY_NAME);
    if (!name || EXCLUDED_NAMES.test(name)) continue;
    // The map geometry is what IHS's own finder plots; LATITUDE/LONGITUDE are a fallback.
    const lat = Number(g?.y ?? r.LATITUDE);
    const lng = Number(g?.x ?? r.LONGITUDE);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
    const flags = [
      flag(r.BH_FLAG) && 'bh',
      flag(r.SUD) && 'sud',
      flag(r.ER_FLAG) && 'er',
      flag(r.URG_FLAG) && 'urgent',
      flag(r.DENTAL_FLAG) && 'dental',
      flag(r.PHARM_FLAG) && 'pharmacy',
    ].filter(Boolean);
    const alias = clean(r.FACILITY_ALIAS);
    const row = {
      i: stableId(r.GlobalID ?? `${name}|${r.PHYSICAL_STREET}`),
      n: name,
      k: CATEGORY[clean(r.FHC_Facility_Type)] ?? 'other',
      o: operator,
      a: clean(r.PHYSICAL_STREET),
      c: clean(r.CITY),
      s: clean(r.STATE),
      z: zip5(r.ZIP),
      lat: round(lat, 5),
      lng: round(lng, 5),
    };
    if (alias && alias.toLowerCase() !== name.toLowerCase()) row.al = alias;
    if (serviceType) row.st = serviceType;
    if (clean(r.PHONE)) row.p = clean(r.PHONE);
    const website = normalizeWebsite(r.WEBSITE_URL);
    if (website) row.w = website;
    if (clean(r.HOURS)) row.h = clean(r.HOURS);
    if (clean(r.SERVICES)) row.sv = clean(r.SERVICES);
    if (flags.length) row.f = flags;
    rows.push(row);
  }
  rows.sort((a, b) => a.s.localeCompare(b.s) || a.n.localeCompare(b.n));
  return rows;
}

export default {
  id: 'ihsFacilities',
  file: 'ihs-facilities.json',
  async build() {
    const info = await layerInfo(LAYER_URL);
    const features = await queryAllFeatures(LAYER_URL, {
      outFields: FIELDS,
      returnGeometry: true,
      orderBy: info.objectIdField ?? 'OBJECTID',
      pageSize: 1000,
    });
    const data = parseIhsFeatures(features);
    return {
      data,
      meta: {
        url: LAYER_URL,
        landingPage: ITEM_URL,
        publisher: 'Indian Health Service, Office of Public Health',
        license: 'U.S. federal government work (17 U.S.C. 105), public domain; IHS asks users to cite the IHS Office of Public Health',
        updateCadence: 'Quarterly',
        sourceCount: features.length,
        count: data.length,
        lastModified: editDate(info),
      },
    };
  },
};
