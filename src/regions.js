// Which state or territory a searched place is in, and that jurisdiction's
// public resources. Everything here is computed from data/ files in memory:
// nothing a visitor searches is stored, logged, or sent anywhere.
//
// State detection
// ---------------
// - ZIP codes: the USPS 3-digit ZIP prefix table below, plus 5-digit ranges for
//   the Pacific island areas that share the 969 prefix. ZIP prefixes are assigned
//   by the U.S. Postal Service (DMM Labeling List L002, "3-Digit ZIP Code Prefix
//   Matrix"; Publication 28, Appendix B for the two-letter codes). On top of the
//   table, data/zip-states.json (built from the Census Bureau's 2020 ZCTA-to-county
//   relationship file) lists the ZIPs whose area lies in a different state than
//   their prefix (06390 Fishers Island is in New York, not Connecticut) and the
//   ZIPs that cross a state line. The build checks that this table agrees with
//   Census for every prefix that has ZIP areas.
// - Coordinates ("use my location", or a city): the nearest ZIP area centroid,
//   with other states reported as `nearby` when the point is close to a line.

import { decodeTable, isTable } from './columns.js';
import { haversineMiles } from './geo.js';

/** [code, name, type, NEXT Distro page slug] for every jurisdiction with resources. */
const REGION_ROWS = [
  ['AL', 'Alabama', 'state', 'alabama'], ['AK', 'Alaska', 'state', 'alaska'],
  ['AZ', 'Arizona', 'state', 'arizona'], ['AR', 'Arkansas', 'state', 'arkansas'],
  ['CA', 'California', 'state', 'california'], ['CO', 'Colorado', 'state', 'colorado'],
  ['CT', 'Connecticut', 'state', 'connecticut'], ['DE', 'Delaware', 'state', 'delaware'],
  ['DC', 'District of Columbia', 'district', 'washingtondc'], ['FL', 'Florida', 'state', 'florida'],
  ['GA', 'Georgia', 'state', 'georgia'], ['HI', 'Hawaii', 'state', 'hawaii'],
  ['ID', 'Idaho', 'state', 'idaho'], ['IL', 'Illinois', 'state', 'illinois'],
  ['IN', 'Indiana', 'state', 'indiana'], ['IA', 'Iowa', 'state', 'iowa'],
  ['KS', 'Kansas', 'state', 'kansas'], ['KY', 'Kentucky', 'state', 'kentucky'],
  ['LA', 'Louisiana', 'state', 'louisiana'], ['ME', 'Maine', 'state', 'maine'],
  ['MD', 'Maryland', 'state', 'maryland'], ['MA', 'Massachusetts', 'state', 'massachusetts'],
  ['MI', 'Michigan', 'state', 'michigan'], ['MN', 'Minnesota', 'state', 'minnesota'],
  ['MS', 'Mississippi', 'state', 'mississippi'], ['MO', 'Missouri', 'state', 'missouri'],
  ['MT', 'Montana', 'state', 'montana'], ['NE', 'Nebraska', 'state', 'nebraska'],
  ['NV', 'Nevada', 'state', 'nevada'], ['NH', 'New Hampshire', 'state', 'newhampshire'],
  ['NJ', 'New Jersey', 'state', 'newjersey'], ['NM', 'New Mexico', 'state', 'newmexico'],
  ['NY', 'New York', 'state', 'newyork'], ['NC', 'North Carolina', 'state', 'northcarolina'],
  ['ND', 'North Dakota', 'state', 'northdakota'], ['OH', 'Ohio', 'state', 'ohio'],
  ['OK', 'Oklahoma', 'state', 'oklahoma'], ['OR', 'Oregon', 'state', 'oregon'],
  ['PA', 'Pennsylvania', 'state', 'pennsylvania'], ['RI', 'Rhode Island', 'state', 'rhodeisland'],
  ['SC', 'South Carolina', 'state', 'southcarolina'], ['SD', 'South Dakota', 'state', 'southdakota'],
  ['TN', 'Tennessee', 'state', 'tennessee'], ['TX', 'Texas', 'state', 'texas'],
  ['UT', 'Utah', 'state', 'utah'], ['VT', 'Vermont', 'state', 'vermont'],
  ['VA', 'Virginia', 'state', 'virginia'], ['WA', 'Washington', 'state', 'washington'],
  ['WV', 'West Virginia', 'state', 'westvirginia'], ['WI', 'Wisconsin', 'state', 'wisconsin'],
  ['WY', 'Wyoming', 'state', 'wyoming'],
  ['PR', 'Puerto Rico', 'territory', 'puertorico'], ['GU', 'Guam', 'territory', null],
  ['VI', 'U.S. Virgin Islands', 'territory', null], ['AS', 'American Samoa', 'territory', null],
  ['MP', 'Northern Mariana Islands', 'territory', null],
  // Sovereign nations in free association with the U.S. They use USPS ZIP codes,
  // and SAMHSA and HRSA list programs there.
  ['FM', 'Federated States of Micronesia', 'freely-associated', null],
  ['MH', 'Marshall Islands', 'freely-associated', null],
  ['PW', 'Palau', 'freely-associated', null],
];

export const REGIONS = REGION_ROWS.map(([code, name, type, nextDistro]) => ({ code, name, type, nextDistro }));
const BY_CODE = new Map(REGIONS.map((r) => [r.code, r]));

/** APO/FPO/DPO "state" codes. Military mail has no home state, so no state resources apply. */
export const MILITARY = {
  AA: 'Armed Forces Americas',
  AE: 'Armed Forces Europe, Middle East, Africa, and Canada',
  AP: 'Armed Forces Pacific',
};

/** Census state FIPS code -> USPS code, for the areas Census publishes ZIP areas for. */
export const FIPS_TO_CODE = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT', '10': 'DE',
  '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA',
  '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
  '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM',
  '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
  '54': 'WV', '55': 'WI', '56': 'WY', '60': 'AS', '66': 'GU', '69': 'MP', '72': 'PR', '78': 'VI',
};

// USPS 3-digit ZIP prefix -> state, as inclusive ranges. Prefixes the USPS has
// not assigned fall inside a state's range or between ranges; either way they
// have no deliverable addresses, so the only effect is on garbage input.
const PREFIX_RANGES = [
  ['005', '005', 'NY'], ['006', '007', 'PR'], ['008', '008', 'VI'], ['009', '009', 'PR'],
  ['010', '027', 'MA'], ['028', '029', 'RI'], ['030', '038', 'NH'], ['039', '049', 'ME'],
  ['050', '054', 'VT'], ['055', '055', 'MA'], ['056', '059', 'VT'], ['060', '069', 'CT'],
  ['070', '089', 'NJ'], ['090', '098', 'AE'], ['100', '149', 'NY'], ['150', '196', 'PA'],
  ['197', '199', 'DE'], ['200', '200', 'DC'], ['201', '201', 'VA'], ['202', '205', 'DC'],
  ['206', '219', 'MD'], ['220', '246', 'VA'], ['247', '268', 'WV'], ['270', '289', 'NC'],
  ['290', '299', 'SC'], ['300', '319', 'GA'], ['320', '339', 'FL'], ['340', '340', 'AA'],
  ['341', '349', 'FL'], ['350', '369', 'AL'], ['370', '385', 'TN'], ['386', '397', 'MS'],
  ['398', '399', 'GA'], ['400', '427', 'KY'], ['430', '459', 'OH'], ['460', '479', 'IN'],
  ['480', '499', 'MI'], ['500', '528', 'IA'], ['530', '549', 'WI'], ['550', '567', 'MN'],
  ['569', '569', 'DC'], ['570', '577', 'SD'], ['580', '588', 'ND'], ['590', '599', 'MT'],
  ['600', '629', 'IL'], ['630', '658', 'MO'], ['660', '679', 'KS'], ['680', '693', 'NE'],
  ['700', '714', 'LA'], ['716', '729', 'AR'], ['730', '732', 'OK'], ['733', '733', 'TX'],
  ['734', '749', 'OK'], ['750', '799', 'TX'], ['800', '816', 'CO'], ['820', '831', 'WY'],
  ['832', '838', 'ID'], ['840', '847', 'UT'], ['850', '865', 'AZ'], ['870', '884', 'NM'],
  ['885', '885', 'TX'], ['889', '898', 'NV'], ['900', '961', 'CA'], ['962', '966', 'AP'],
  ['967', '968', 'HI'], ['969', '969', 'GU'], ['970', '979', 'OR'], ['980', '994', 'WA'],
  ['995', '999', 'AK'],
];

// Inside 967 and 969, USPS assigns 5-digit ranges to other island jurisdictions.
const FIVE_DIGIT_RANGES = [
  ['96799', '96799', 'AS'],
  ['96939', '96940', 'PW'],
  ['96941', '96944', 'FM'],
  ['96950', '96952', 'MP'],
  ['96960', '96960', 'MH'],
  ['96970', '96970', 'MH'],
];

const inRanges = (ranges, key) => ranges.find(([lo, hi]) => key >= lo && key <= hi)?.[2] ?? null;

/** State code for a 3-digit prefix from the USPS table alone (no 5-digit or Census refinements). */
export function prefixState(prefix) {
  return /^\d{3}$/.test(prefix) ? inRanges(PREFIX_RANGES, prefix) : null;
}

/** Public shape of a jurisdiction. */
export function describeRegion(code) {
  const r = BY_CODE.get(code);
  if (r) return { code: r.code, name: r.name, type: r.type };
  if (MILITARY[code]) return { code, name: MILITARY[code], type: 'military' };
  return null;
}

export function isRegionCode(code) {
  return typeof code === 'string' && BY_CODE.has(code);
}

/**
 * Create the region index.
 * zcta: column table or { zip: [lat, lng] }; zipStates: { zip: [primary, ...also] } (data/zip-states.json)
 */
export function createRegions({ zcta, zipStates = {} }) {
  /** { region, nearby } for a ZIP, or null when the ZIP is malformed or unassigned. */
  function forZip(raw) {
    const zip = String(raw ?? '').trim().slice(0, 5);
    if (!/^\d{5}$/.test(zip)) return null;
    const census = zipStates[zip];
    const code = census?.[0] ?? inRanges(FIVE_DIGIT_RANGES, zip) ?? inRanges(PREFIX_RANGES, zip.slice(0, 3));
    const region = code && describeRegion(code);
    if (!region) return null;
    return { region, nearby: (census?.slice(1) ?? []).map(describeRegion).filter(Boolean) };
  }

  // Flat arrays keep the nearest-ZIP scan cache-friendly: about 34,000 entries,
  // most rejected by a bounding-box test before any trigonometry.
  let zips;
  let lats;
  let lngs;
  if (isTable(zcta)) {
    const { columns } = decodeTable(zcta);
    zips = Array.from(columns.zip, (n) => String(n).padStart(5, '0'));
    lats = columns.lat;
    lngs = columns.lng;
  } else {
    zips = Object.keys(zcta);
    lats = new Float64Array(zips.length);
    lngs = new Float64Array(zips.length);
    zips.forEach((zip, i) => { [lats[i], lngs[i]] = zcta[zip]; });
  }

  // Beyond this, a point is not near any U.S. ZIP area (open ocean, another country).
  const MAX_MILES = 150;
  // Another state counts as "nearby" when one of its ZIP area centroids is
  // within 10 miles, or about as close as the nearest one (sparse rural areas).
  // Bristol, VA sees Tennessee; Vancouver, WA sees Oregon; Denver sees nothing.
  const NEARBY_MILES = 10;
  const BORDER_SLACK_MILES = 4;

  function nearestZips(lat, lng) {
    const dLat = MAX_MILES / 69;
    const dLng = Math.min(180, MAX_MILES / (69 * Math.max(0.05, Math.cos((lat * Math.PI) / 180))));
    const found = [];
    for (let i = 0; i < zips.length; i++) {
      if (Math.abs(lats[i] - lat) > dLat) continue;
      let gap = Math.abs(lngs[i] - lng);
      if (gap > 180) gap = 360 - gap; // the Aleutians and Guam sit near the antimeridian
      if (gap > dLng) continue;
      const miles = haversineMiles(lat, lng, lats[i], lngs[i]);
      if (miles <= MAX_MILES) found.push({ zip: zips[i], miles });
    }
    return found.sort((a, b) => a.miles - b.miles);
  }

  /** { region, nearby } for a coordinate, or null when it is far from any U.S. ZIP area. */
  function forPoint(lat, lng) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const near = nearestZips(lat, lng);
    if (!near.length) return null;
    const best = forZip(near[0].zip);
    if (!best) return null;
    const nearby = new Map(best.nearby.map((r) => [r.code, r]));
    const limit = Math.max(NEARBY_MILES, near[0].miles + BORDER_SLACK_MILES);
    for (const z of near) {
      if (z.miles > limit) break;
      const other = forZip(z.zip)?.region;
      if (other && other.code !== best.region.code) nearby.set(other.code, other);
    }
    return { region: best.region, nearby: [...nearby.values()] };
  }

  /**
   * Add `state` (a jurisdiction code) to geocoder results. ZIP results use the
   * typed ZIP, so a PO-box ZIP that borrowed a neighbor's centroid keeps its own
   * state. ZIPs in the Freely Associated States or military mail have no Census
   * centroid at all, so a borrowed centroid would point somewhere else entirely;
   * those results are dropped.
   */
  function annotate(results, query) {
    const zip = String(query ?? '').trim().match(/^(\d{5})(?:-\d{4})?$/)?.[1];
    const out = [];
    for (const r of results) {
      let found = null;
      if (r.kind === 'zip' && zip) {
        found = forZip(zip);
        if (found && (found.region.type === 'military' || found.region.type === 'freely-associated')) continue;
      } else {
        const suffix = String(r.label ?? '').match(/,\s*([A-Z]{2})$/)?.[1];
        found = isRegionCode(suffix) ? { region: describeRegion(suffix), nearby: [] } : forPoint(r.lat, r.lng);
      }
      out.push(found ? { ...r, state: found.region.code } : r);
    }
    return out;
  }

  // A point inside each jurisdiction for searches made without a visitor
  // location (the state page): the ZIP centroid nearest the mean of its ZIPs.
  const anchors = new Map();
  {
    const sums = new Map();
    for (let i = 0; i < zips.length; i++) {
      const code = forZip(zips[i])?.region.code;
      if (!code) continue;
      const lat = lats[i];
      const lng = lngs[i];
      const s = sums.get(code) ?? { lat: 0, lng: 0, n: 0, zips: [] };
      s.lat += lat; s.lng += lng; s.n++; s.zips.push([lat, lng]);
      sums.set(code, s);
    }
    for (const [code, s] of sums) {
      const mLat = s.lat / s.n;
      const mLng = s.lng / s.n;
      let best = s.zips[0];
      let bestD = Infinity;
      for (const p of s.zips) {
        const d = haversineMiles(mLat, mLng, p[0], p[1]);
        if (d < bestD) { bestD = d; best = p; }
      }
      anchors.set(code, { lat: Math.round(best[0] * 100) / 100, lng: Math.round(best[1] * 100) / 100 });
    }
  }

  return { forZip, forPoint, annotate, anchor: (code) => anchors.get(code) ?? null };
}
