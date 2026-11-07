// "Resources in <State>": the searched place's state or territory agency,
// Medicaid program, and per-state harm reduction and law links. The state is
// worked out from the location in memory; it is never added to the URL. Links
// to a state page (#/state/WA) only change the URL when someone follows them.
import { h, clear, ext, tel, icon, digits, safeHref } from '../dom.js';
import { api } from '../api.js';
import { t, getLang, formatNumber } from '../i18n.js';
import { state, subscribe } from '../state.js';
import { regionsApi, regionForLocation } from '../regionsApi.js';

export const stateHref = (code) => `#/state/${code}`;

export function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(getLang(), { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** Phone link that keeps an extension as a dialing pause ("tel:3407740930,4104"). */
export function phoneLink(number, ext, props = {}) {
  const shown = ext ? t('regions.phoneExt', '{number} ext. {ext}', { number, ext }) : number;
  if (!ext) return tel(number, shown, props);
  return h('a', { href: `tel:${digits(number)},${ext}`, class: 'tel', ...props }, shown);
}

const joinDot = (parts) => parts.filter(Boolean).flatMap((p, i) => (i ? [' · ', p] : [p]));

function agencyLine(agency) {
  return joinDot([
    agency.phone && tel(agency.phone),
    agency.url && ext(agency.url, t('regions.website', 'Website')),
  ]);
}

function medicaidLine(md) {
  const phone = md.phones?.[0];
  return joinDot([
    md.applyUrl && ext(md.applyUrl, t('regions.medicaidApply', 'Apply or renew')),
    !md.applyUrl && md.url && ext(md.url, t('regions.website', 'Website')),
    phone && phoneLink(phone.number, phone.ext),
  ]);
}

function nearbyLinks(nearby) {
  if (!nearby?.length) return null;
  return h('p', { class: 'help' },
    t('regions.alsoNear', 'Close to a state line? Also see: '),
    joinDot(nearby.map((r) => h('a', { href: stateHref(r.code) }, r.name))));
}

function renderSafetyNet(summary, miles) {
  const networks = summary?.networks ?? summary;
  if (!networks || typeof networks !== 'object') return null;
  const hc = networks.healthCenters;
  const er = networks.er;
  const va = networks.va;
  const ihs = networks.ihs;
  const rhc = networks.rhc;
  if (!hc && !er && !va && !ihs && !rhc) return null;

  const ihsCount = ihs?.count ?? 0;
  const rhcCount = rhc?.count ?? 0;
  const ihsRhcCount = ihsCount + rhcCount;
  let ihsRhcNearest = null;
  if (ihs?.nearest && rhc?.nearest) {
    ihsRhcNearest = (ihs.nearest.miles ?? Infinity) <= (rhc.nearest.miles ?? Infinity) ? ihs.nearest : rhc.nearest;
  } else {
    ihsRhcNearest = ihs?.nearest ?? rhc?.nearest ?? null;
  }
  const ihsRhcNetwork = ihsCount > 0 && (!rhc?.nearest || (ihs?.nearest?.miles ?? Infinity) <= (rhc?.nearest?.miles ?? Infinity))
    ? 'ihs'
    : (rhcCount > 0 ? 'rhc' : 'ihs');

  const cards = [
    {
      label: t('regions.safetyNet.healthCenters', 'Sliding-fee health centers'),
      href: '#/health?tab=clinics',
      count: hc?.count ?? 0,
      nearest: hc?.nearest ?? null,
    },
    {
      label: t('regions.safetyNet.er', '24/7 Emergency hospitals'),
      href: '#/health?tab=federal&network=er',
      count: er?.count ?? 0,
      nearest: er?.nearest ?? null,
    },
    {
      label: t('regions.safetyNet.va', 'VA & Vet Centers'),
      href: '#/health?tab=federal&network=va',
      count: va?.count ?? 0,
      nearest: va?.nearest ?? null,
    },
    {
      label: t('regions.safetyNet.ihsRhc', 'IHS / Tribal & Rural Health Clinics'),
      href: `#/health?tab=federal&network=${ihsRhcNetwork}`,
      count: ihsRhcCount,
      nearest: ihsRhcNearest,
    },
  ];

  return h('div', { class: 'safety-net-block' },
    h('h3', { class: 'safety-net-heading' },
      t('regions.safetyNet.title', 'Safety-net care within {miles} miles', { miles })),
    h('ul', { class: 'safety-net-grid' },
      cards.map((c) => h('li', { class: 'safety-net-item' },
        h('div', { class: 'safety-net-top' },
          h('a', { class: 'safety-net-link', href: c.href }, c.label),
          h('span', { class: 'badge' }, formatNumber(c.count)),
        ),
        h('p', { class: 'safety-net-meta' },
          c.nearest
            ? t('regions.safetyNet.nearest', 'Nearest: {name} ({miles} mi)', {
                name: c.nearest.name,
                miles: c.nearest.miles,
              })
            : t('regions.safetyNet.noneWithin', 'None within {miles} mi', { miles }),
        ),
      )),
    ),
  );
}

/** The compact panel for finder pages. Re-renders when the searched location changes. */
export function statePanel() {
  const body = h('div', { 'aria-live': 'polite' });
  // Labelled by its heading once a state loads; until then the heading does not exist.
  const root = h('section', { class: 'section state-panel' }, body);
  let shownFor = null;
  let request = 0;

  function browseLine() {
    return h('p', { class: 'fine' },
      t('regions.browsePrompt', 'Looking for state programs, Medicaid, or naloxone by mail? '),
      h('a', { href: '#/states' }, t('regions.browseLink', 'Browse resources by state or territory')), '.');
  }

  async function render() {
    const loc = state.location;
    const radius = state.radius || 25;
    const key = loc ? `${loc.lat},${loc.lng},${loc.state ?? ''},${radius},${getLang()}` : '';
    if (key === shownFor) return;
    shownFor = key;
    const mine = ++request;
    if (!loc) {
      clear(body).append(browseLine());
      return;
    }
    let found = null;
    let data = null;
    let summary = null;
    try {
      const [regionRes, summaryRes] = await Promise.all([
        (async () => {
          const f = await regionForLocation(loc);
          const d = f ? await regionsApi.state(f.region.code) : null;
          return { found: f, data: d };
        })(),
        api.nearbySummary({ lat: loc.lat, lng: loc.lng, radius }).catch(() => null),
      ]);
      found = regionRes.found;
      data = regionRes.data;
      summary = summaryRes;
    } catch {
      data = null;
    }
    if (mine !== request) return; // a newer location won
    if (!found || !data) {
      clear(body).append(browseLine());
      return;
    }
    const { region } = data;
    const items = [];
    if (data.agency) {
      items.push(h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, t('regions.agencyHeading', 'State substance use agency')),
        h('p', { class: 'resource-desc' }, data.agency.name, h('br'), agencyLine(data.agency))));
    }
    if (data.medicaid && (data.medicaid.applyUrl || data.medicaid.url || data.medicaid.phones?.length)) {
      items.push(h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, t('regions.medicaidHeading', 'Medicaid')),
        h('p', { class: 'resource-desc' },
          data.medicaid.agency && [data.medicaid.agency, h('br')],
          medicaidLine(data.medicaid))));
    }
    if (data.links.nextDistro) {
      items.push(h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, t('regions.naloxoneHeading', 'Naloxone and harm reduction supplies')),
        h('p', { class: 'resource-desc' },
          ext(data.links.nextDistro, t('regions.nextDistroLink', 'NEXT Distro: {state}', { state: region.name })),
          t('regions.nextDistroShort', ': local programs, and supplies by mail where available.'))));
    }
    body.parentElement?.setAttribute('aria-labelledby', 'state-panel-title');
    clear(body).append(
      h('h2', { id: 'state-panel-title' }, t('regions.panelTitle', 'Resources in {state}', { state: region.name })),
      renderSafetyNet(summary, radius),
      items.length ? h('ul', { class: 'resource-list' }, items) : null,
      h('p', { class: 'actions' },
        h('a', { class: 'btn btn-small btn-secondary', href: stateHref(region.code) },
          t('regions.allResources', 'All {state} resources', { state: region.name }), icon('chevron'))),
      nearbyLinks(found.nearby),
    );
  }

  const unsubscribe = subscribe(() => {
    if (!root.isConnected) return unsubscribe();
    render();
  });
  render();
  return root;
}

/** Address block for an agency. */
function address(a) {
  const lines = [a.line1, a.line2, [a.city, [a.state, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')].filter(Boolean);
  return lines.length ? h('p', { class: 'fine' }, lines.flatMap((l, i) => (i ? [h('br'), l] : [l]))) : null;
}

function agencyCard(agency, title) {
  return h('div', { class: 'card' },
    h('h3', null, title),
    h('p', null, h('strong', null, agency.name)),
    h('div', { class: 'actions' },
      agency.phone && tel(agency.phone, [icon('phone'), t('regions.callNumber', 'Call {number}', { number: agency.phone })], { class: 'btn btn-small btn-primary' }),
      safeHref(agency.url) && h('a', { class: 'btn btn-small btn-ghost', href: safeHref(agency.url), target: '_blank', rel: 'noopener noreferrer' },
        icon('globe'), t('regions.website', 'Website'), h('span', { class: 'visually-hidden' }, t('regions.newTab', ' (opens in a new tab)'))),
      safeHref(agency.helpUrl) && h('a', { class: 'btn btn-small btn-ghost', href: safeHref(agency.helpUrl), target: '_blank', rel: 'noopener noreferrer' },
        icon('info'), t('regions.findHelpPage', 'Find help page'), h('span', { class: 'visually-hidden' }, t('regions.newTab', ' (opens in a new tab)'))),
    ),
    address(agency.address),
    agency.updated && h('p', { class: 'fine' },
      t('regions.agencyUpdated', 'Record last updated by SAMHSA on {date}.', { date: formatDate(agency.updated) ?? agency.updated })),
  );
}

/** Full resource sections for a state page. `data` is the /api/state response. */
export function stateSections(data, { telehealth } = {}) {
  const { region } = data;
  const name = region.name;
  const sections = [];
  const sec = (id, title, ...children) => h('section', { class: 'section', id, 'aria-labelledby': `${id}-title` },
    h('h2', { id: `${id}-title` }, title), ...children);

  if (data.agency) {
    sections.push(sec('agency', t('regions.agencySection', 'State treatment agency'),
      h('p', null, t('regions.agencyIntro',
        'This agency oversees and funds substance use treatment in {state}. It can tell you about state-funded programs, licensing, and help paying for care.', { state: name })),
      agencyCard(data.agency, t('regions.agencyHeading', 'State substance use agency')),
      data.mentalHealthAgency && agencyCard(data.mentalHealthAgency, t('regions.mhAgencyHeading', 'State mental health agency')),
      h('p', { class: 'source-note' },
        t('regions.agencySource', 'From the state agency list on '), ext(data.sources.agencies.url, 'FindTreatment.gov'), '.'),
    ));
  }

  const md = data.medicaid;
  if (md) {
    sections.push(sec('medicaid', t('regions.medicaidSection', 'Medicaid'),
      h('p', null, t('regions.medicaidIntro',
        'Medicaid covers substance use and mental health treatment, including medications for opioid use disorder. Eligibility rules differ by state and territory.')),
      h('div', { class: 'card' },
        h('h3', null, md.agency ?? t('regions.medicaidIn', 'Medicaid in {state}', { state: name })),
        md.phones?.length > 0 && h('ul', { class: 'list' }, md.phones.map((p) => h('li', null,
          p.label && `${p.label}: `, phoneLink(p.number, p.ext)))),
        h('div', { class: 'actions' },
          safeHref(md.applyUrl) && h('a', { class: 'btn btn-small btn-primary', href: safeHref(md.applyUrl), target: '_blank', rel: 'noopener noreferrer' },
            t('regions.medicaidApply', 'Apply or renew'), h('span', { class: 'visually-hidden' }, t('regions.newTab', ' (opens in a new tab)'))),
          safeHref(md.eligibilityUrl) && md.eligibilityUrl !== md.applyUrl && h('a', { class: 'btn btn-small btn-secondary', href: safeHref(md.eligibilityUrl), target: '_blank', rel: 'noopener noreferrer' },
            t('regions.medicaidEligibility', 'Who qualifies'), h('span', { class: 'visually-hidden' }, t('regions.newTab', ' (opens in a new tab)'))),
          safeHref(md.url) && md.url !== md.applyUrl && h('a', { class: 'btn btn-small btn-ghost', href: safeHref(md.url), target: '_blank', rel: 'noopener noreferrer' },
            icon('globe'), t('regions.website', 'Website'), h('span', { class: 'visually-hidden' }, t('regions.newTab', ' (opens in a new tab)'))),
        ),
      ),
      h('p', { class: 'source-note' },
        t('regions.medicaidSource', 'Contacts from '), ext(md.sourceUrl, 'Medicaid.gov'),
        t('regions.medicaidSourceMore', ', which also lists more phone numbers and offices.')),
    ));
  }

  if (data.telehealth && telehealth) {
    sections.push(sec('telehealth', t('regions.telehealthSection', 'Telehealth treatment in {state}', { state: name }),
      h('p', null, t('regions.telehealthIntro',
        'Programs licensed in {state} that list telehealth in SAMHSA’s directory. Telehealth can mean fewer long drives. Call to ask whether they can see you where you live.', { state: name })),
      telehealth,
    ));
  }

  const links = data.links;
  sections.push(sec('harm-reduction-links', t('regions.harmSection', 'Naloxone and harm reduction'),
    h('ul', { class: 'resource-list' },
      links.nextDistro && h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, ext(links.nextDistro, t('regions.nextDistroLink', 'NEXT Distro: {state}', { state: name }))),
        h('p', { class: 'resource-desc' }, t('regions.nextDistroDesc',
          'Local harm reduction programs in {state}, and how to get naloxone, test strips, and other supplies by mail if you can’t get them nearby.', { state: name }))),
      h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, h('a', { href: '#/treatment?codes=NOE' }, t('regions.naloxoneNearby', 'Find naloxone and overdose education near you'))),
        h('p', { class: 'resource-desc' }, t('regions.naloxoneNearbyDesc', 'Treatment programs in SAMHSA’s directory that hand out naloxone.'))),
      h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, h('a', { href: '#/harm-reduction' }, t('regions.harmGuide', 'Harm reduction guide'))),
        h('p', { class: 'resource-desc' }, t('regions.harmGuideDesc', 'Naloxone, test strips, safer use, and wound care.'))),
    ),
  ));

  sections.push(sec('laws', t('regions.lawsSection', 'Overdose Good Samaritan and naloxone laws'),
    links.endOverdose || links.lawAtlas
      ? [
        h('p', null, t('regions.lawsIntro',
          'What the law protects when you call 911 for an overdose differs by state. These trackers summarize each state’s law and cite the statutes; choose {state} on their pages.', { state: name })),
        h('ul', { class: 'resource-list' },
          links.endOverdose && h('li', { class: 'resource' },
            h('p', { class: 'resource-name' }, ext(links.endOverdose, t('regions.endOverdose', 'End Overdose: state laws and policies'))),
            h('p', { class: 'resource-desc' }, t('regions.endOverdoseDesc',
              'Plain-language summaries of Good Samaritan, naloxone, and drug paraphernalia laws for all 50 states and DC, with sources.'))),
          links.lawAtlas && h('li', { class: 'resource' },
            h('p', { class: 'resource-name' }, ext(links.lawAtlas, t('regions.lawAtlas', 'LawAtlas: Good Samaritan overdose prevention laws'))),
            h('p', { class: 'resource-desc' }, t('regions.lawAtlasDesc',
              'A legal research dataset from Temple University. It is current through June 1, 2021, so check newer changes with End Overdose.'))),
        ),
      ]
      : h('p', null, t('regions.lawsNotCovered',
        'National law trackers cover the 50 states and DC only. For the law in {state}, ask the agency above.', { state: name })),
  ));

  sections.push(sec('more-help', t('regions.moreSection', 'More help in {state}', { state: name }),
    h('ul', { class: 'resource-list' },
      data.healthCenters > 0 && h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, h('a', { href: '#/health' }, t('regions.healthCenters', 'Low-cost health centers'))),
        h('p', { class: 'resource-desc' }, t('regions.healthCentersDesc',
          '{n} HRSA-funded health center sites in {state} offer care on a sliding fee scale, insured or not.', { n: data.healthCenters, state: name }))),
      links.local211 && h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, ext(links.local211, t('regions.local211', 'Your local 211'))),
        h('p', { class: 'resource-desc' }, t('regions.local211Desc', 'Dial 2-1-1 for help with housing, food, utilities, and transportation, or find your local 211 by ZIP code.'))),
      h('li', { class: 'resource' },
        h('p', { class: 'resource-name' }, h('a', { href: '#/crisis' }, t('regions.supportLines', 'National support lines'))),
        h('p', { class: 'resource-desc' }, t('regions.supportLinesDesc', '988, the SAMHSA National Helpline, and other free, confidential lines.'))),
    ),
  ));

  return sections;
}
