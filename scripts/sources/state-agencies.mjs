// SAMHSA single state agencies -> data/state-agencies.json
//
// FindTreatment.gov publishes the agency that oversees substance use treatment
// (the "single state agency", SSA) and the state mental health agency for every
// state, DC, the territories, and the Freely Associated States. It is the list
// behind https://findtreatment.gov/state-agencies. Each record carries its own
// agencyUpdatedDt, kept here so the UI can say how current it is.
//
// Shape: { "WA": { sa: Agency, mh: Agency | null } } where mh is null when the
// same agency handles both. Agency: { name, phone, url, helpUrl, address, updated }
//
// Only the fields FindTreatment.gov itself displays are kept. The feed also has
// a `hotline` field that the site does not show; several of its values are
// office lines rather than help lines, so HarborPath leaves it out too.
import { download } from '../lib/fetch.mjs';
import { normalizeWebsite } from '../../src/util.js';
import { describeRegion } from '../../src/regions.js';

const url = 'https://findtreatment.gov/locator/stateAgencyList.json';

/** "(360)-725-1500" -> "(360) 725-1500"; anything that is not a 10-digit number -> null. */
export function formatPhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : null;
}

const text = (v) => (typeof v === 'string' && v.trim() ? v.replace(/\s+/g, ' ').trim() : null);

function agency(a) {
  if (!a || !text(a.agencyName)) return null;
  const site = normalizeWebsite(a.url);
  const help = normalizeWebsite(a.crisisUrl);
  return {
    id: a.agencyId,
    name: text(a.agencyName),
    phone: formatPhone(a.phoneNum),
    url: site,
    helpUrl: help && help !== site ? help : null,
    address: {
      line1: text(a.addressLine1),
      line2: text(a.addressLine2),
      city: text(a.addressCity),
      state: text(a.addressState),
      zip: text(a.zip),
    },
    updated: text(a.agencyUpdatedDt)?.slice(0, 10) ?? null,
  };
}

export default {
  id: 'stateAgencies',
  file: 'state-agencies.json',
  async build() {
    const { buf, lastModified } = await download(url);
    const list = JSON.parse(buf.toString('utf8')).stateAgenciesInfo;
    const data = {};
    const unknown = [];
    for (const entry of list) {
      const sa = agency(entry.substanceAbuseAgency);
      const mh = agency(entry.mentalHealthAgency);
      const code = entry.substanceAbuseAgency?.agencyState ?? entry.mentalHealthAgency?.agencyState;
      if (!describeRegion(code)) { unknown.push(`${entry.stateName} (${code})`); continue; }
      // The feed often lists one agency twice under different IDs.
      const sameAgency = sa && mh && (sa.id === mh.id || (sa.name === mh.name && sa.url?.toLowerCase() === mh.url?.toLowerCase()));
      data[code] = { sa: sa ?? mh, mh: sameAgency || !sa ? null : mh };
      for (const a of [data[code].sa, data[code].mh]) if (a) delete a.id;
    }
    if (unknown.length) throw new Error(`Unrecognized jurisdictions in ${url}: ${unknown.join(', ')}`);
    if (Object.keys(data).length < 56) throw new Error(`Expected at least 56 jurisdictions, got ${Object.keys(data).length}`);

    const dates = Object.values(data).map((d) => d.sa?.updated).filter(Boolean).sort();
    return {
      data: Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b))),
      meta: { url, lastModified, count: Object.keys(data).length, oldestRecord: dates[0], newestRecord: dates.at(-1) },
    };
  },
};
