// Help for searches that find little or nothing nearby, which is common in
// rural areas and on the islands: how far the nearest listing is, a one-tap
// wider search, telehealth programs anywhere in the state, and the state's own
// treatment agency.
import { h, clear, tel, icon, announce } from '../dom.js';
import { t } from '../i18n.js';
import { api } from '../api.js';
import { state } from '../state.js';
import { regionsApi, regionForLocation } from '../regionsApi.js';
import { RADII } from './locationPicker.js';
import { treatmentCard } from './facilityCard.js';
import { stateHref } from './stateResources.js';

const MAX_RADIUS = RADII.at(-1);

/** The smallest distance option that reaches `miles`, or null if none does or it is no wider. */
export function radiusFor(miles, current) {
  if (miles === null || miles === undefined) return null;
  const r = RADII.find((x) => x >= miles);
  return r && r > current ? r : null;
}

export const nextRadius = (current) => RADII.find((x) => x > current) ?? null;

const fmtMiles = (m) => (m < 10 ? m.toFixed(1) : String(Math.round(m)));
const placeOf = (f) => [f.address?.city ?? f.city, f.address?.state ?? f.state].filter(Boolean).join(', ');

function widenButton(radius, onWiden) {
  return h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: () => onWiden(radius) },
    t('reach.widenTo', 'Search within {n} miles', { n: radius }));
}

const BUP_CODES = ['BU', 'UB', 'BUM', 'BWN', 'BWON', 'BERI', 'BSDM'];

export function isBupTele(c) {
  if (!c) return false;
  if (c.kind === 'virtual' || (Array.isArray(c.services) && Array.isArray(c.conditions))) {
    const svcs = c.record?.services ?? c.record?.record?.services ?? c.services ?? [];
    const tele = c.telehealth !== undefined ? c.telehealth : true;
    return Boolean(tele && svcs.includes('moud-buprenorphine'));
  }
  const rawCodes = c.codes ?? c.record?.codes ?? [];
  const codes = rawCodes instanceof Set ? rawCodes : new Set(rawCodes);
  const hasTele = c.telehealth || codes.has('TELE');
  const hasBup = BUP_CODES.some((code) => codes.has(code));
  return Boolean(hasTele && hasBup);
}

export function isAudioPhone(c) {
  if (!c) return false;
  const isVirt = c.kind === 'virtual' || (Array.isArray(c.services) && Array.isArray(c.conditions));
  if (isVirt) {
    const phone = c.record?.phone ?? c.record?.record?.phone ?? c.phone;
    const enroll = c.record?.enrollmentProcess ?? c.record?.record?.enrollmentProcess ?? c.enrollmentProcess ?? '';
    return Boolean(phone || /phone/i.test(enroll));
  }
  const rawCodes = c.codes ?? c.record?.codes ?? [];
  const codes = rawCodes instanceof Set ? rawCodes : new Set(rawCodes);
  const hasTele = c.telehealth || codes.has('TELE');
  const phone = c.record?.intake ?? c.record?.phone ?? c.intake ?? c.phone;
  return Boolean(hasTele && phone);
}

export function isLowBarrier(c) {
  if (!c) return false;
  const isVirt = c.kind === 'virtual' || (Array.isArray(c.services) && Array.isArray(c.conditions));
  if (isVirt) {
    const proc = c.record?.enrollmentProcess ?? c.record?.record?.enrollmentProcess ?? c.enrollmentProcess ?? '';
    return /same[- ]day|phone|within|instant|minutes/i.test(proc);
  }
  const rawCodes = c.codes ?? c.record?.codes ?? [];
  const codes = rawCodes instanceof Set ? rawCodes : new Set(rawCodes);
  const intake = c.record?.intake ?? c.intake;
  return Boolean(intake) || codes.has('WI') || codes.has('ISC') || codes.has('BIA') || codes.has('BU') || codes.has('UB');
}

let reachUid = 0;

/**
 * Statewide telehealth programs from SAMHSA's directory, loaded on demand.
 * With a location in the same state, results are nearest first; otherwise A to Z.
 * Features in-RAM zero-PII filters for DEA/SAMHSA buprenorphine tele-prescribing,
 * audio-only phone appointments for broadband-insecure rural/tribal areas,
 * and low-barrier intake criteria.
 */
export function telehealthList({ region, kind = 'sa', codes = [], autoload = false, headingLevel = 3 }) {
  const uid = ++reachUid;
  const status = h('p', { class: 'results-status', role: 'status' });
  const list = h('div', {
    id: `r-list-${uid}`,
    class: 'results-list telehealth-results-list',
    tabindex: '0',
    role: 'region',
    'aria-label': t('reach.listAria', 'Telehealth treatment programs in {state}', { state: region.name }),
  });
  const more = h('div', { class: 'results-more' });
  let page = 0;
  let totalPages = 0;
  let loading = false;
  const allResults = [];
  const activeFilters = { bupOnly: false, audioOnly: false, lowBarrierOnly: false };

  function renderList(focusId) {
    clear(list);
    const filtered = allResults.filter((f) => {
      if (activeFilters.bupOnly && !isBupTele(f)) return false;
      if (activeFilters.audioOnly && !isAudioPhone(f)) return false;
      if (activeFilters.lowBarrierOnly && !isLowBarrier(f)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const ma = Number.isFinite(a.miles) ? a.miles : Infinity;
      const mb = Number.isFinite(b.miles) ? b.miles : Infinity;
      return (ma - mb) || String(a.name).localeCompare(String(b.name));
    });

    if (!filtered.length && allResults.length > 0) {
      list.append(h('div', { class: 'callout callout-info' },
        h('p', null, t('reach.noFilterMatches', 'No loaded telehealth programs match the active filter criteria. Uncheck filters to show all programs.'))));
    } else {
      for (const f of filtered) {
        const card = treatmentCard(f, { headingLevel });
        const badges = [];
        if (isBupTele(f)) {
          badges.push(h('li', { class: 'chip chip-care badge-bup-tele' }, t('reach.chipBupTele', 'DEA/SAMHSA tele-prescribing')));
        }
        if (isAudioPhone(f)) {
          badges.push(h('li', { class: 'chip chip-extra badge-audio' }, t('reach.chipAudio', 'Audio-only phone')));
        }
        if (isLowBarrier(f)) {
          badges.push(h('li', { class: 'chip chip-care badge-lowbarrier' }, t('reach.chipLowBarrier', 'Low-barrier intake')));
        }
        if (badges.length > 0) {
          const badgeWrap = h('ul', { class: 'chips telehealth-chips', 'aria-label': t('reach.flexibilitiesLabel', 'Telehealth flexibilities') }, ...badges);
          const actions = card.querySelector('.actions');
          if (actions) card.insertBefore(badgeWrap, actions);
          else card.append(badgeWrap);
        }
        list.append(card);
      }
    }

    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) el.focus();
    }
  }

  function toggleFilter(key, val, focusId) {
    activeFilters[key] = val;
    renderList(focusId);
    const count = list.querySelectorAll('article.facility').length;
    announce(t('reach.filterCount', 'Showing {n} of {total} telehealth programs in {state}.', {
      n: count,
      total: allResults.length,
      state: region.name,
    }));
  }

  function makeToggle(id, label, key) {
    const input = h('input', { type: 'checkbox', id });
    input.checked = activeFilters[key];
    input.addEventListener('change', () => toggleFilter(key, input.checked, id));
    return h('label', { class: 'check' }, input, label);
  }

  const bupId = `r-f-bup-${uid}`;
  const phoneId = `r-f-phone-${uid}`;
  const lowBarrierId = `r-f-lowbarrier-${uid}`;

  const filterBar = h('div', {
    class: 'match-filters telehealth-filters',
    role: 'group',
    'aria-label': t('reach.filterAria', 'Filter telehealth programs'),
  },
    makeToggle(bupId, t('reach.filterBup', 'DEA/SAMHSA buprenorphine tele-prescribing'), 'bupOnly'),
    makeToggle(phoneId, t('reach.filterPhone', 'Audio-only phone appointments (rural & tribal broadband)'), 'audioOnly'),
    makeToggle(lowBarrierId, t('reach.filterLowBarrier', 'Low-barrier intake (rapid start / phone intake)'), 'lowBarrierOnly'),
  );

  const eduCallout = h('div', { class: 'callout callout-info telehealth-guide' },
    h('p', { class: 'callout-title' }, icon('phone'), t('reach.telehealthEduTitle', 'DEA/SAMHSA Tele-prescribing & Low-Barrier Telehealth')),
    h('p', null, t('reach.telehealthEduBody', 'Under federal DEA rules as of late 2026, buprenorphine for opioid use disorder can be started by telehealth without an in-person visit. Temporary DEA/HHS telemedicine flexibilities run through Dec. 31, 2026. Separately, a permanent DEA rule (21 CFR § 1306.51, in effect since the end of 2025) allows starting it by video or audio-only phone visit for an initial supply of up to 6 months after a state prescription-monitoring (PDMP) check; after that, continued prescribing needs an in-person exam or another permitted form of telemedicine, such as a video visit. State rules and individual prescribers may be stricter, and federal rules may change after 2026. Audio-only phone visits provide critical access in broadband-insecure rural and tribal areas. Under SAMHSA guidelines, counseling cannot be an arbitrary barrier to starting life-saving medication.')),
  );

  async function load() {
    if (loading) return;
    loading = true;
    clear(more).append(h('p', { class: 'help' }, t('reach.loading', 'Loading…')));
    if (!page) status.textContent = t('reach.searchingState', 'Searching programs in {state}…', { state: region.name });
    try {
      const loc = state.location;
      const here = loc && (loc.state === region.code || (await regionForLocation(loc))?.region.code === region.code);
      const data = await regionsApi.telehealth({
        state: region.code,
        lat: here ? loc.lat : null,
        lng: here ? loc.lng : null,
        kind,
        codes,
        page: page + 1,
      });
      page = data.page;
      totalPages = data.totalPages;
      clear(more);
      if (!data.total) {
        status.textContent = t('reach.telehealthNone', 'No programs in {state} list telehealth in SAMHSA’s directory.', { state: region.name });
        return;
      }
      status.textContent = data.byDistance
        ? t('reach.telehealthCountNear', '{n} programs in {state} offer telehealth. Nearest first.', { n: data.total, state: region.name })
        : t('reach.telehealthCountAll', '{n} programs in {state} offer telehealth, A to Z.', { n: data.total, state: region.name });
      if (page === 1) announce(status.textContent);

      const existingIds = new Set(allResults.map((x) => x.id));
      for (const item of data.results) {
        if (!existingIds.has(item.id)) {
          allResults.push(item);
          existingIds.add(item.id);
        }
      }

      renderList();

      if (page < totalPages) {
        more.append(h('button', { type: 'button', class: 'btn btn-secondary', onclick: load }, t('reach.showMore', 'Show more telehealth programs')));
      }
    } catch (err) {
      clear(more).append(h('p', { class: 'callout callout-warn', role: 'alert' }, err.message, ' ',
        h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: load }, t('reach.retry', 'Try again'))));
      if (!page) status.textContent = '';
    } finally {
      loading = false;
    }
  }

  const root = h('div', { class: 'telehealth-list' }, eduCallout, filterBar, status, list, more);
  if (autoload) load();
  else {
    more.append(h('button', { type: 'button', class: 'btn btn-secondary', onclick: load },
      icon('phone'), t('reach.showTelehealth', 'Show telehealth programs in {state}', { state: region.name })));
  }
  return root;
}

/** Telehealth and state-agency pointers, shared by every reach box. */
async function regionHelp(box, { kind, codes }) {
  const found = await regionForLocation(state.location).catch(() => null);
  if (!found) return;
  const data = await regionsApi.state(found.region.code).catch(() => null);
  if (!data || !box.isConnected) return;
  const name = data.region.name;
  if (data.telehealth) {
    const slot = h('div');
    box.append(
      h('p', null, h('strong', null, t('reach.telehealthTitle', 'Telehealth: ')),
        t('reach.telehealthText', 'Programs in {state} that offer video or phone visits may be able to see you without a long drive.', { state: name })),
      slot,
    );
    slot.append(h('button', {
      type: 'button',
      class: 'btn btn-small btn-secondary',
      onclick: () => clear(slot).append(telehealthList({ region: data.region, kind, codes, autoload: true })),
    }, icon('phone'), t('reach.showTelehealth', 'Show telehealth programs in {state}', { state: name })));
  }
  if (data.agency) {
    box.append(h('p', null,
      t('reach.agencyText', '{agency} can help you find state-funded care: ', { agency: data.agency.name }),
      data.agency.phone && tel(data.agency.phone), data.agency.phone && ' · ',
      h('a', { href: stateHref(data.region.code) }, t('regions.allResources', 'All {state} resources', { state: name })), '.'));
  }
}

/**
 * Treatment finder help. mode 'empty': nothing within the radius; 'low': a
 * handful of results. onWiden(radius) re-runs the search wider.
 */
export function treatmentReach({ mode, kind = 'sa', codes = [], count = 0, onWiden }) {
  const box = h('div', { class: 'callout callout-info reach' });
  const lead = h('p', null);
  box.append(
    h('p', { class: 'callout-title' }, icon('compass'), t('reach.title', 'More ways to reach care from here')),
    lead,
  );

  if (mode === 'low') {
    const wider = nextRadius(state.radius);
    lead.append(t('reach.lowCount', 'Only {n} found within {miles} miles.', { n: count, miles: state.radius }), ' ',
      wider ? widenButton(wider, onWiden) : null);
  } else if (state.radius >= MAX_RADIUS) {
    lead.append(t('reach.noneAtMax', 'Nothing within {miles} miles, the widest search.', { miles: state.radius }));
  } else {
    // Look as far as HarborPath can, once, to say where the nearest listing is.
    lead.textContent = t('reach.checking', 'Checking farther away…');
    const loc = state.location;
    api.treatment({ lat: loc.lat, lng: loc.lng, radius: MAX_RADIUS, kind, codes, page: 1 })
      .then((data) => {
        if (!box.isConnected) return;
        const nearest = data.results.find((f) => Number.isFinite(f.miles));
        clear(lead);
        if (!nearest) {
          lead.append(t('reach.noneWithin', 'No listings within {miles} miles either.', { miles: MAX_RADIUS }));
          return;
        }
        const r = radiusFor(nearest.miles, state.radius);
        lead.append(
          t('reach.nearest', 'The nearest listing is {miles} miles away, in {place}.', { miles: fmtMiles(nearest.miles), place: placeOf(nearest) }),
          ' ', r ? widenButton(r, onWiden) : null);
      })
      .catch(() => { if (box.isConnected) clear(lead); });
  }

  if (mode === 'empty' && kind === 'sa') {
    box.append(h('p', null,
      t('reach.tryMental', 'Many mental health programs also treat substance use. '),
      h('a', { href: '#/health?tab=mental' }, t('reach.tryMentalLink', 'Search mental health care')), '.'));
  }
  regionHelp(box, { kind, codes });
  return box;
}

/** Health center finder help: mode 'empty' (no site in range) or 'low' (a handful). */
export function healthCenterReach({ mode = 'empty', count = 0, onWiden }) {
  const box = h('div', { class: 'callout callout-info reach' });
  const lead = h('p', null);
  box.append(h('p', { class: 'callout-title' }, icon('compass'), t('reach.title', 'More ways to reach care from here')), lead);
  if (mode === 'low') {
    const wider = nextRadius(state.radius);
    lead.append(t('reach.lowCount', 'Only {n} found within {miles} miles.', { n: count, miles: state.radius }), ' ',
      wider ? widenButton(wider, onWiden) : null);
  } else if (state.radius >= MAX_RADIUS) {
    lead.append(t('reach.noneAtMax', 'Nothing within {miles} miles, the widest search.', { miles: state.radius }));
  } else {
    lead.textContent = t('reach.checking', 'Checking farther away…');
    const loc = state.location;
    api.healthCenters({ lat: loc.lat, lng: loc.lng, radius: MAX_RADIUS })
      .then((data) => {
        if (!box.isConnected) return;
        const nearest = data.results[0];
        clear(lead);
        if (!nearest) {
          lead.append(t('reach.noCentersWithin', 'No health center sites within {miles} miles either.', { miles: MAX_RADIUS }));
          return;
        }
        const r = radiusFor(nearest.miles, state.radius);
        lead.append(
          t('reach.nearestCenter', 'The nearest health center site is {miles} miles away, in {place}.', { miles: fmtMiles(nearest.miles), place: placeOf(nearest) }),
          ' ', r ? widenButton(r, onWiden) : null);
      })
      .catch(() => { if (box.isConnected) clear(lead); });
  }
  regionHelp(box, { kind: 'sa', codes: [] });
  return box;
}
