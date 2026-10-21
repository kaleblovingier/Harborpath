import { h, clear, ext, tel, sms, icon, announce } from '../dom.js';
import { api } from '../api.js';
import { state, setRadius } from '../state.js';
import { locationPicker, RADII } from './locationPicker.js';
import { providerCard, providerText } from './facilityCard.js';
import { radiusFor, nextRadius } from './reach.js';
import { statePanel } from './stateResources.js';
import { t, tp, formatNumber, formatDate } from '../i18n.js';

export { providerCard, providerText };

const PAGE_SIZE = 20;
const MAX_RADIUS = RADII.at(-1);

export const PROVIDER_NETWORKS = [
  {
    id: 'va',
    get label() { return t('providers.tab.va', 'VA & Vet Centers'); },
    get fullTitle() { return t('providers.va.title', 'VA Health Care & Vet Centers'); },
    get desc() {
      return t('providers.va.desc',
        'VA Medical Centers, outpatient clinics, residential rehab (RRTP), and community Vet Centers. Vet Centers offer free, confidential counseling with no VA health care enrollment required, regardless of discharge character.');
    },
    filters: [
      { id: '', get label() { return t('providers.va.filter.all', 'All VA & Vet Centers'); } },
      { id: 'health', get label() { return t('providers.va.filter.health', 'VA medical centers & clinics'); } },
      { id: 'vetcenter', get label() { return t('providers.va.filter.vetcenter', 'Vet Centers'); } },
    ],
  },
  {
    id: 'ihs',
    get label() { return t('providers.tab.ihs', 'IHS & Tribal Health'); },
    get fullTitle() { return t('providers.ihs.title', 'Indian Health Service & Tribal Programs'); },
    get desc() {
      return t('providers.ihs.desc',
        'Indian Health Service (IHS), Tribal (638), and Urban Indian Health Programs (UIHP), including Youth Regional Treatment Centers and behavioral health clinics.');
    },
    filters: [
      { id: '', get label() { return t('providers.ihs.filter.all', 'All IHS, Tribal & Urban sites'); } },
      { id: 'bh', get label() { return t('providers.ihs.filter.bh', 'Behavioral health & Youth RTCs'); } },
      { id: 'sud', get label() { return t('providers.ihs.filter.sud', 'Substance use programs'); } },
    ],
  },
  {
    id: 'rhc',
    get label() { return t('providers.tab.rhc', 'Rural Health Clinics'); },
    get fullTitle() { return t('providers.rhc.title', 'CMS-Certified Rural Health Clinics'); },
    get desc() {
      return t('providers.rhc.desc',
        'Federally certified Rural Health Clinics (RHCs) providing primary care, Medicare and Medicaid access, and outpatient medication options in rural and underserved communities.');
    },
    filters: [],
  },
  {
    id: 'er',
    get label() { return t('providers.tab.er', 'Emergency Hospitals'); },
    get fullTitle() { return t('providers.er.title', 'Emergency Response Hospitals'); },
    get desc() {
      return t('providers.er.desc',
        'CMS-verified hospitals with 24/7 emergency departments, Critical Access Hospitals, and Rural Emergency Hospitals for medical stabilization, severe withdrawal, and emergency buprenorphine or methadone bridge dosing.');
    },
    filters: [],
  },
];

function skeletonList() {
  return Array.from({ length: 3 }, () => h('div', { class: 'card skeleton', 'aria-hidden': 'true' },
    h('div', { class: 'sk sk-title' }),
    h('div', { class: 'sk sk-line' }),
    h('div', { class: 'sk sk-line short' }),
  ));
}

function networkCallout(kind) {
  if (kind === 'va') {
    return h('div', { class: 'callout callout-info provider-callout' },
      h('p', { class: 'callout-title' }, icon('shield'), t('providers.va.calloutTitle', 'Veterans Crisis Line & confidential care')),
      h('p', null, t('providers.va.calloutBody',
        'Veterans, service members, National Guard and Reserve members, and their loved ones can connect 24/7 with the Veterans Crisis Line—even if you are not enrolled in VA health care.')),
      h('p', { class: 'actions' },
        tel('988', [icon('phone'), t('hotline.vcl.call', 'Dial 988, then press 1')], { class: 'btn btn-small btn-primary' }),
        sms('838255', undefined, [icon('message'), t('hotline.vcl.text', 'Text 838255')], { class: 'btn btn-small btn-secondary' }),
        ext('https://www.va.gov/find-locations/', t('providers.va.officialLink', 'VA.gov location finder')),
      ),
    );
  }
  if (kind === 'er') {
    return h('div', { class: 'callout callout-warn provider-callout' },
      h('p', { class: 'callout-title' }, icon('alert'), t('providers.er.calloutTitle', 'Your rights in an emergency department (EMTALA & DEA 72-Hour Rule)')),
      h('p', null, t('providers.er.calloutBody',
        'Under federal law (EMTALA), Medicare-participating hospitals with emergency departments must provide a medical screening exam and stabilizing care for emergency conditions—including overdose and life-threatening alcohol or sedative withdrawal—regardless of insurance or ability to pay. Under the DEA 72-Hour Rule (21 CFR § 1306.07(b)), emergency clinicians can also administer up to 72 hours of buprenorphine or methadone to relieve acute opioid withdrawal while connecting you to ongoing care.')),
    );
  }
  if (kind === 'ihs') {
    return h('div', { class: 'callout callout-info provider-callout' },
      h('p', { class: 'callout-title' }, icon('compass'), t('providers.ihs.calloutTitle', 'IHS, Tribal & Urban Indian Health (I/T/U)')),
      h('p', null, t('providers.ihs.calloutBody',
        'Call ahead to confirm eligibility, walk-in hours, and behavioral health or Youth Regional Treatment Center (YRTC) referral steps.')),
    );
  }
  return null;
}

export function providerFinder({ initialKind = 'va', initialType, initialFilter = '' } = {}) {
  const startKind = PROVIDER_NETWORKS.some((n) => n.id === (initialType || initialKind))
    ? (initialType || initialKind)
    : 'va';

  let activeKind = startKind;
  let activeFilter = initialFilter || '';
  let allResults = [];
  let shownCount = 0;
  let controller;

  const netLead = h('div', { class: 'provider-network-lead' });
  const subfilterWrap = h('div', { class: 'provider-subfilters' });
  const statusEl = h('p', { class: 'results-status', role: 'status', 'aria-live': 'polite' });
  const listEl = h('div', { class: 'results-list' });
  const moreEl = h('div', { class: 'results-more' });
  const sourceEl = h('p', { class: 'source-note' });

  const tabButtons = PROVIDER_NETWORKS.map((net) => h('button', {
    type: 'button',
    role: 'tab',
    id: `provider-tab-${net.id}`,
    class: 'tab',
    'aria-controls': 'provider-panel',
    dataset: { kind: net.id },
    onclick: () => selectNetwork(net.id),
    onkeydown: (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const idx = PROVIDER_NETWORKS.findIndex((n) => n.id === net.id);
      let nextIdx = idx;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % PROVIDER_NETWORKS.length;
      else if (e.key === 'ArrowLeft') nextIdx = (idx + PROVIDER_NETWORKS.length - 1) % PROVIDER_NETWORKS.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = PROVIDER_NETWORKS.length - 1;
      const target = PROVIDER_NETWORKS[nextIdx];
      selectNetwork(target.id);
      tabButtons[nextIdx]?.focus();
    },
  }, net.label));

  const panel = h('div', {
    id: 'provider-panel',
    class: 'tab-panel provider-panel',
    role: 'tabpanel',
  },
    netLead,
    subfilterWrap,
    statusEl,
    listEl,
    moreEl,
    sourceEl,
  );

  function currentNet() {
    return PROVIDER_NETWORKS.find((n) => n.id === activeKind) ?? PROVIDER_NETWORKS[0];
  }

  function renderHeaderAndFilters() {
    const net = currentNet();
    for (const btn of tabButtons) {
      const selected = btn.dataset.kind === activeKind;
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    }
    panel.setAttribute('aria-labelledby', `provider-tab-${activeKind}`);

    clear(netLead).append(
      h('p', { class: 'provider-desc' }, net.desc),
      networkCallout(activeKind),
    );

    clear(subfilterWrap);
    if (net.filters.length > 0) {
      subfilterWrap.append(
        h('div', { class: 'presets', role: 'group', 'aria-label': t('providers.subfilterLabel', 'Filter {network}', { network: net.label }) },
          net.filters.map((f) => {
            const on = f.id === activeFilter;
            return h('button', {
              type: 'button',
              class: 'preset',
              'aria-pressed': String(on),
              'aria-current': on ? 'true' : null,
              onclick: () => {
                if (activeFilter === f.id) return;
                activeFilter = f.id;
                renderHeaderAndFilters();
                runSearch();
              },
            }, f.label);
          }),
        ),
      );
    }
  }

  function selectNetwork(kind) {
    if (activeKind === kind) return;
    activeKind = kind;
    activeFilter = '';
    renderHeaderAndFilters();
    runSearch();
  }

  function widen(r) {
    setRadius(r);
    runSearch();
  }

  function renderSlice() {
    const nextSlice = allResults.slice(shownCount, shownCount + PAGE_SIZE);
    listEl.append(...nextSlice.map((item) => providerCard(item)));
    shownCount += nextSlice.length;
    clear(moreEl);
    if (shownCount < allResults.length) {
      moreEl.append(
        h('button', {
          type: 'button',
          class: 'btn btn-secondary',
          onclick: renderSlice,
        }, t('providers.showMore', 'Show more ({remaining} remaining)', { remaining: formatNumber(allResults.length - shownCount) })),
      );
    }
  }

  function renderReachBox(mode, count) {
    const box = h('div', { class: 'callout callout-info reach' });
    const lead = h('p', null);
    box.append(h('p', { class: 'callout-title' }, icon('compass'), t('reach.title', 'More ways to reach care from here')), lead);

    if (mode === 'low') {
      const wider = nextRadius(state.radius);
      lead.append(
        t('reach.lowCount', 'Only {n} found within {miles} miles.', { n: count, miles: state.radius }),
        ' ',
        wider ? h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: () => widen(wider) },
          t('reach.widenTo', 'Search within {n} miles', { n: wider })) : null,
      );
      return box;
    }

    if (state.radius >= MAX_RADIUS) {
      lead.append(t('reach.noneAtMax', 'Nothing within {miles} miles, the widest search.', { miles: state.radius }));
      return box;
    }

    lead.textContent = t('reach.checking', 'Checking farther away…');
    const loc = state.location;
    api.providers({ lat: loc.lat, lng: loc.lng, radius: MAX_RADIUS, kind: activeKind, type: activeKind, filter: activeFilter || undefined })
      .then((data) => {
        if (!box.isConnected) return;
        const nearest = data.results?.[0];
        clear(lead);
        if (!nearest) {
          lead.append(t('reach.noneWithin', 'No listings within {miles} miles either.', { miles: MAX_RADIUS }));
          return;
        }
        const r = radiusFor(nearest.miles, state.radius);
        const place = [nearest.city, nearest.state].filter(Boolean).join(', ');
        const fmtMiles = nearest.miles < 10 ? nearest.miles.toFixed(1) : String(Math.round(nearest.miles));
        lead.append(
          t('reach.nearest', 'The nearest listing is {miles} miles away, in {place}.', { miles: fmtMiles, place }),
          ' ',
          r ? h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: () => widen(r) },
            t('reach.widenTo', 'Search within {n} miles', { n: r })) : null,
        );
      })
      .catch(() => { if (box.isConnected) clear(lead); });

    return box;
  }

  async function runSearch() {
    clear(moreEl);
    clear(sourceEl);
    const loc = state.location;
    if (!loc) {
      statusEl.textContent = '';
      clear(listEl).append(
        h('div', { class: 'empty' },
          icon('pin'),
          h('p', null, t('finder.enterLocation', 'Enter a ZIP code or city above, or use your current location, to search nearby.')),
        ),
      );
      return;
    }

    controller?.abort();
    controller = new AbortController();
    const net = currentNet();
    statusEl.textContent = t('finder.searching', 'Searching near {label}…', { label: loc.label });
    clear(listEl).append(...skeletonList());

    try {
      const data = await api.providers({
        lat: loc.lat,
        lng: loc.lng,
        radius: state.radius,
        kind: activeKind,
        type: activeKind,
        filter: activeFilter || undefined,
      }, controller.signal);

      allResults = data.results ?? [];
      shownCount = 0;
      clear(listEl);

      if (data.source && data.sourceUrl) {
        const updatedDate = data.updated ? new Date(data.updated) : null;
        const validDate = updatedDate && !Number.isNaN(updatedDate.getTime())
          ? formatDate(updatedDate, { year: 'numeric', month: 'long', day: 'numeric' })
          : data.updated;
        sourceEl.append(
          t('providers.sourcePrefix', 'Data from '),
          ext(data.sourceUrl, data.source),
          validDate ? t('providers.sourceUpdated', ' (updated {date}). Call ahead to confirm services and hours.', { date: validDate }) : '.',
        );
      }

      if (!allResults.length) {
        const msg = t('providers.noResults', 'No {network} locations found within {miles} miles of {label}.', {
          network: net.fullTitle,
          miles: formatNumber(state.radius),
          label: loc.label,
        });
        statusEl.textContent = msg;
        announce(msg);
        listEl.append(
          h('div', { class: 'empty' },
            icon('search'),
            h('p', null, msg),
            activeFilter && h('div', { class: 'empty-actions' },
              h('button', {
                type: 'button',
                class: 'btn btn-secondary btn-small',
                onclick: () => {
                  activeFilter = '';
                  renderHeaderAndFilters();
                  runSearch();
                },
              }, t('providers.clearSubfilter', 'Show all {network}', { network: net.label }))),
            renderReachBox('empty', 0),
          ),
        );
        return;
      }

      const countMsg = tp('providers.resultsCount', allResults.length, {
        one: '{n} location within {miles} miles of {label}, nearest first.',
        other: '{n} locations within {miles} miles of {label}, nearest first.',
      }, { miles: formatNumber(state.radius), label: loc.label });

      statusEl.textContent = countMsg;
      announce(countMsg);
      renderSlice();

      if (allResults.length > 0 && allResults.length <= 3) {
        moreEl.append(renderReachBox('low', allResults.length));
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      statusEl.textContent = '';
      clear(listEl).append(
        h('div', { class: 'callout callout-warn', role: 'alert' },
          h('p', { class: 'callout-title' }, icon('alert'), t('finder.errorTitle', 'Search could not be completed')),
          h('p', null, err.message),
          h('p', { class: 'actions' },
            h('button', { type: 'button', class: 'btn btn-small btn-primary', onclick: runSearch }, t('reach.retry', 'Try again')),
            err.fallbackUrl && ext(err.fallbackUrl, t('finder.fallbackLink', 'Search directly on the official federal site')),
          ),
        ),
      );
    }
  }

  renderHeaderAndFilters();
  runSearch();

  return h('div', { class: 'finder provider-finder' },
    h('div', { class: 'card finder-search' },
      locationPicker({ onChange: runSearch }),
    ),
    h('div', {
      class: 'tabs provider-tabs',
      role: 'tablist',
      'aria-label': t('providers.tablistLabel', 'Federal & emergency care networks'),
    }, tabButtons),
    panel,
    statePanel(),
  );
}
