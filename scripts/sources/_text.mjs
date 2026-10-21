// Text cleanup shared by the provider builders. CMS publishes names and
// addresses in all caps; this makes them readable without changing meaning.

// Words that stay upper case: common health-system acronyms, directions,
// business suffixes, and roman numerals.
const KEEP_UPPER = new Set([
  'VA', 'US', 'USA', 'PO', 'NE', 'NW', 'SE', 'SW', 'LLC', 'LLP', 'PC', 'PLLC', 'INC', 'II', 'III', 'IV',
  'UAB', 'UC', 'UCI', 'UCLA', 'UCSD', 'UCSF', 'USC', 'UNC', 'UNM', 'UNMC', 'UPMC', 'UVA', 'UW', 'UT', 'UK', 'OU',
  'KU', 'LSU', 'OHSU', 'MUSC', 'NYU', 'HCA', 'SSM', 'OSF', 'CHI', 'CHS', 'AMC', 'CMC', 'RMC', 'HCC',
  'CHRISTUS', 'ECU', 'LDS', 'MD', 'ER', 'ICU', 'FQHC', 'RHC', 'CAH', 'HIV', 'AIDS', 'IHS', 'ASC', 'ACMC',
  'JFK', 'MLK', 'NEA', 'OSU', 'WVU', 'VCU', 'UPH', 'TMC', 'BJC', 'AHN', 'HSHS', 'SCL', 'MSB', 'UNC',
]);
const SMALL = new Set(['of', 'and', 'the', 'for', 'at', 'in', 'on', 'de', 'la', 'del', 'by', 'to']);
// Short vowel-less words are usually initialisms (HH, BJC), except these
// street and title abbreviations.
const ABBREVIATIONS = new Set([
  'ST', 'DR', 'RD', 'CT', 'LN', 'PL', 'SQ', 'MT', 'FT', 'JR', 'SR', 'HWY', 'STE', 'CTR', 'BLD', 'FWY', 'TWP', 'PKY',
  'CRT', 'TRL', 'BX', 'NR', 'MS', 'MR', 'MRS', 'DBA', 'BLVD', 'PKWY', 'SPGS', 'HLTH', 'MGMT', 'BLDG',
]);

function capWord(w, i) {
  if (!w) return w;
  const upper = w.toUpperCase();
  const bare = upper.replace(/[^A-Z0-9]/g, '');
  if (KEEP_UPPER.has(bare)) return upper;
  if (/^\d+(ST|ND|RD|TH)$/.test(bare)) return w.toLowerCase(); // 1ST -> 1st
  if (/^[A-Z]$/.test(bare)) return upper; // initials and single-letter directions
  if (/^[B-DF-HJ-NP-TV-XZ]{2,3}$/.test(bare) && !ABBREVIATIONS.has(bare)) return upper;
  const lower = w.toLowerCase();
  if (i > 0 && SMALL.has(lower)) return lower;
  // Capitalize after apostrophes of one-letter prefixes (O'Fallon) and hyphens (Winston-Salem).
  return lower
    .replace(/(^|[-/(])([a-z])/g, (m, p, c) => p + c.toUpperCase())
    .replace(/^([a-z])'([a-z])/, (m, a, b) => `${a.toUpperCase()}'${b.toUpperCase()}`);
}

/** Title-case an ALL CAPS string. Mixed-case input is returned unchanged. */
export function tidyCaps(s) {
  if (!s) return s;
  const text = String(s).replace(/\s+/g, ' ').trim();
  if (text !== text.toUpperCase()) return text;
  return text.split(' ').map(capWord).join(' ');
}

/** "7015233271" or "(701) 523-3271" -> "(701) 523-3271"; anything else is kept as given. */
export function formatPhone(raw) {
  const v = String(raw ?? '').trim();
  if (!v) return null;
  const d = v.replace(/\D/g, '');
  const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  if (ten.length === 10) return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
  return v;
}

/** First five digits of a ZIP or ZIP+4, restoring a leading zero that a spreadsheet dropped. */
export function zip5(z) {
  let d = String(z ?? '').replace(/\D/g, '');
  if (d.length === 4 || d.length === 8) d = `0${d}`;
  return d.length >= 5 ? d.slice(0, 5) : null;
}
