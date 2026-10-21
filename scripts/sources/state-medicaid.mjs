// CMS state Medicaid contacts -> data/state-medicaid.json
//
// Medicaid.gov's "Where Can People Get Help With Medicaid & CHIP?" page lists,
// for every state, DC, and territory, the state Medicaid agency, its
// eligibility and enrollment pages, and member phone numbers. It is a U.S.
// government work; robots.txt allows /about-us/. The table is parsed here
// once per build so HarborPath can show each state's own agency and number.
//
// Shape: { "WA": { agency, url, eligibilityUrl, applyUrl, contactsUrl, phones: [{ label, number }], anchor } }
import { download } from '../lib/fetch.mjs';
import { normalizeWebsite } from '../../src/util.js';
import { REGIONS } from '../../src/regions.js';
import { formatPhone } from './state-agencies.mjs';

export const url = 'https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip';

const ENTITIES = { amp: '&', nbsp: ' ', quot: '"', apos: "'", '#39': "'", lt: '<', gt: '>' };
const decode = (s) => s.replace(/&(#?\w+);/g, (m, e) => ENTITIES[e] ?? (e.startsWith('#') ? String.fromCodePoint(Number(e.slice(1))) : m));
const plain = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/[☎★]/g, ' ').replace(/\s+/g, ' ').trim();

// CMS writes some names differently from REGIONS ("US Virgin Islands").
const byName = new Map(REGIONS.map((r) => [r.name.toLowerCase().replace(/[^a-z]/g, ''), r.code]));
byName.set('usvirginislands', 'VI');

/**
 * "☎ Member Help Line: 1-800-362-8312" -> { label: 'Member Help Line', number: '(800) 362-8312', ext: null }.
 * Lines for providers are skipped, and so are local 7-digit numbers (Guam lists
 * its offices that way), which cannot be dialed from elsewhere as written.
 */
export function parsePhoneItem(textValue) {
  const found = textValue.match(/(?:\+?1[\s.-]*)?\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/);
  const number = found && formatPhone(found[0]);
  if (!number) return null;
  const label = textValue.slice(0, found.index)
    .replace(/\b(call|at)\s*$/i, '')
    .replace(/[\s:,.;-]+$/, '')
    .trim();
  if (/provider/i.test(label)) return null;
  const rest = textValue.slice(found.index + found[0].length);
  const ext = rest.match(/^\s*(?:ext\.?|x)\s*(\d{1,6})/i)?.[1] ?? null;
  // "602-417-4000 (Inside Maricopa County)": keep the qualifier with the label.
  const note = rest.match(/^\s*\(([^)]{2,60})\)/)?.[1]?.trim();
  const fullLabel = [label, note && `(${note})`].filter(Boolean).join(' ');
  return { label: fullLabel || null, number, ext };
}

/** Parse one state's cell: <h3 id=..>Name</h3> [<h4>★ <a>Agency</a></h4>] <ul><li>...</li></ul> */
export function parseStateCell(html) {
  const head = html.match(/<h3[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h3>/);
  if (!head) return null;
  const code = byName.get(plain(head[2]).toLowerCase().replace(/[^a-z]/g, ''));
  if (!code) return null;

  const agencyLink = html.match(/<h4[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
  const entry = {
    agency: agencyLink ? plain(agencyLink[2]) : null,
    url: agencyLink ? normalizeWebsite(decode(agencyLink[1])) : null,
    eligibilityUrl: null,
    applyUrl: null,
    contactsUrl: null,
    phones: [],
    anchor: head[1],
  };
  let homeUrl = null;
  for (const li of html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) {
    const item = li[1];
    if (item.includes('☎')) {
      const phone = parsePhoneItem(plain(item));
      if (phone && entry.phones.length < 3 && !entry.phones.some((p) => p.number === phone.number)) entry.phones.push(phone);
      continue;
    }
    const link = item.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!link || /^(tel|mailto):/i.test(link[1].trim())) continue;
    const href = normalizeWebsite(decode(link[1]));
    const label = plain(link[2]).toLowerCase();
    if (/eligib/.test(label)) entry.eligibilityUrl ??= href;
    else if (/enroll/.test(label)) entry.applyUrl ??= href;
    else if (/contact/.test(label)) entry.contactsUrl ??= href;
    else if (/home/.test(label)) homeUrl ??= href;
  }
  entry.url ??= homeUrl ?? entry.contactsUrl;
  return { code, entry };
}

export default {
  id: 'stateMedicaid',
  file: 'state-medicaid.json',
  async build() {
    const { buf } = await download(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HarborPath data builder)' } });
    const html = buf.toString('utf8');
    const start = html.indexOf('STATE MEDICAID LINKS');
    if (start < 0) throw new Error(`${url}: state table not found; the page layout may have changed`);
    const table = html.slice(start, html.indexOf('</table>', start));
    const data = {};
    for (const cell of table.split(/<td[^>]*>/).slice(1)) {
      const parsed = parseStateCell(cell);
      if (parsed) data[parsed.code] = parsed.entry;
    }
    const missing = REGIONS.filter((r) => r.type !== 'freely-associated' && !data[r.code]).map((r) => r.code);
    if (missing.length) throw new Error(`${url}: no Medicaid entry for ${missing.join(', ')}`);
    return {
      data: Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b))),
      meta: { url, count: Object.keys(data).length, fetchedAt: new Date().toISOString().slice(0, 10) },
    };
  },
};
