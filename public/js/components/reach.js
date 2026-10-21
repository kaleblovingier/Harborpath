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

/**
 * Statewide telehealth programs from SAMHSA's directory, loaded on demand.
 * With a location in the same state, results are nearest first; otherwise A to Z.
 */
export function telehealthList({ region, kind = 'sa', codes = [], autoload = false, headingLevel = 3 }) {
  const status = h('p', { class: 'results-status', role: 'status' });
  const list = h('div', { class: 'results-list' });
  const more = h('div', { class: 'results-more' });
  let page = 0;
  let totalPages = 0;
  let loading = false;

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
      list.append(...data.results.map((f) => treatmentCard(f, { headingLevel })));
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

  const root = h('div', { class: 'telehealth-list' }, status, list, more);
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
