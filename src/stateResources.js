// Per-jurisdiction resources: the state's substance use agency (SAMHSA), its
// Medicaid agency (CMS), and links to authoritative per-state harm reduction
// and law pages. Every URL pattern here is checked for every jurisdiction by
// scripts/verify-links.mjs; links are only offered where the target exists.
import { decodeColumn, isTable } from './columns.js';
import { REGIONS, describeRegion, isRegionCode } from './regions.js';

export const LINKS = {
  // NEXT Distro (nonprofit): per-state naloxone, test strip, and syringe access pages.
  nextDistro: (slug) => `https://nextdistro.org/${slug}`,
  // End Overdose (nonprofit): Good Samaritan, naloxone, and paraphernalia law
  // summaries with statutes, 50 states and DC, on one page with a state picker.
  endOverdose: 'https://endoverdose.net/toolkit/',
  // LawAtlas (Temple University Center for Public Health Law Research): legal
  // dataset of Good Samaritan overdose laws, 50 states and DC, through June 1, 2021.
  lawAtlas: 'https://lawatlas.org/datasets/good-samaritan-overdose-prevention-laws',
  // United Way 211: find the local 211 by ZIP code.
  local211: 'https://211.org/about-us/your-local-211',
  medicaidHelp: 'https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip',
  stateAgencies: 'https://findtreatment.gov/state-agencies',
  militaryOneSource: 'https://www.militaryonesource.mil/',
};

// Jurisdictions the national law trackers and 211 cover: the 50 states and DC.
const STATES_AND_DC = new Set(REGIONS.filter((r) => r.type === 'state' || r.type === 'district').map((r) => r.code));
// FindTreatment.gov has listings (and so telehealth search) everywhere except
// the Freely Associated States.
const HAS_LISTINGS = new Set(REGIONS.filter((r) => r.type !== 'freely-associated').map((r) => r.code));

export function createStateDirectory({ agencies = {}, medicaid = {}, healthCenters = [], meta = {} }) {
  const centerCounts = new Map();
  if (isTable(healthCenters)) {
    for (const state of decodeColumn(healthCenters.columns.state)) {
      centerCounts.set(state, (centerCounts.get(state) ?? 0) + 1);
    }
  } else {
    for (const s of healthCenters) centerCounts.set(s.state, (centerCounts.get(s.state) ?? 0) + 1);
  }

  const sources = {
    agencies: {
      name: 'SAMHSA FindTreatment.gov state agency list',
      url: LINKS.stateAgencies,
      updated: meta.sources?.stateAgencies?.lastModified ?? null,
    },
    medicaid: {
      name: 'Medicaid.gov: Where can people get help with Medicaid & CHIP?',
      url: LINKS.medicaidHelp,
      updated: meta.sources?.stateMedicaid?.fetchedAt ?? null,
    },
  };

  function list() {
    return REGIONS.map((r) => ({ code: r.code, name: r.name, type: r.type }));
  }

  function get(rawCode) {
    const code = String(rawCode ?? '').trim().toUpperCase();
    if (!isRegionCode(code)) return null;
    const region = REGIONS.find((r) => r.code === code);
    const agency = agencies[code] ?? {};
    const md = medicaid[code];
    const lawCovered = STATES_AND_DC.has(code);
    return {
      region: describeRegion(code),
      agency: agency.sa ?? null,
      mentalHealthAgency: agency.mh ?? null,
      medicaid: md
        ? {
          agency: md.agency,
          url: md.url,
          eligibilityUrl: md.eligibilityUrl,
          applyUrl: md.applyUrl,
          phones: md.phones,
          sourceUrl: `${LINKS.medicaidHelp}#${md.anchor}`,
        }
        : null,
      links: {
        nextDistro: region.nextDistro ? LINKS.nextDistro(region.nextDistro) : null,
        endOverdose: lawCovered ? LINKS.endOverdose : null,
        lawAtlas: lawCovered ? LINKS.lawAtlas : null,
        local211: lawCovered ? LINKS.local211 : null,
      },
      healthCenters: centerCounts.get(code) ?? 0,
      telehealth: HAS_LISTINGS.has(code),
      sources,
    };
  }

  return { list, get, sources };
}
