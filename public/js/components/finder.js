import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { api } from '../api.js';
import { state, setRadius } from '../state.js';
import { locationPicker } from './locationPicker.js';
import { treatmentCard, healthCenterCard } from './facilityCard.js';
import { treatmentReach, healthCenterReach } from './reach.js';
import { statePanel } from './stateResources.js';
import { t, tp, formatNumber } from '../i18n.js';

const MAX_FILTERS = 8;

function fallbackHelp() {
  return h('div', { class: 'callout callout-info' },
    h('p', null, h('strong', null, t('finder.preferTalk', 'Prefer to talk to someone? ')),
      t('finder.helplineNote', 'The free, confidential SAMHSA National Helpline (24/7, English and Spanish) can help you find local treatment: '),
      tel('18006624357', '1-800-662-4357'), '.'),
  );
}

function errorBox(err, onRetry) {
  return h('div', { class: 'callout callout-warn', role: 'alert' },
    h('p', null, h('strong', null, t('finder.unavailable', 'Search is unavailable right now. ')), err.message),
    h('p', null,
      h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: onRetry }, t('reach.retry', 'Try again')), ' ',
      ext(err.fallbackUrl || t('url.findtreatment', 'https://findtreatment.gov/'), t('finder.searchDirect', 'Search FindTreatment.gov directly')),
      t('finder.orCall', ' or call '),
      tel('18006624357', '1-800-662-4357'), '.'),
  );
}

export function skeleton(n = 3) {
  return Array.from({ length: n }, () => h('div', { class: 'card skeleton', 'aria-hidden': 'true' },
    h('div', { class: 'sk sk-title' }),
    h('div', { class: 'sk sk-line' }),
    h('div', { class: 'sk-badges sk-badgeRow' },
      h('span', { class: 'sk sk-pill' }),
      h('span', { class: 'sk sk-pill' }),
      h('span', { class: 'sk sk-pill' }),
    ),
    h('div', { class: 'sk sk-line short' }),
  ));
}

/**
 * Search SAMHSA's directory. kind: 'sa' (substance use) or 'mh' (mental health).
 */
export function treatmentFinder({ kind = 'sa', filters, initialCodes = [], noun = 'places' }) {
  const selected = new Set(initialCodes);
  let page = 1;
  let results = [];
  let relaxed = null;
  let totalPages = 0;
  let total = 0;
  let controller;

  const statusLine = h('p', { class: 'results-status', role: 'status' });
  const list = h('div', { class: 'results-list' });
  const more = h('div', { class: 'results-more' });
  const activeChips = h('div', {
    class: 'active-filters',
    role: 'region',
    'aria-label': t('finder.activeFiltersRegion', 'Active search filters'),
  });
  const filterCount = h('span', { class: 'count' });
  const limitNote = h('p', { class: 'help', hidden: true },
    t('finder.maxFilters', 'You can combine up to {n} filters.', { n: MAX_FILTERS }));

  const checkboxes = [];
  const groups = filters.map((g) => h('fieldset', { class: 'filter-group' },
    h('legend', null, g.label),
    g.hint && h('p', { class: 'help' }, g.hint),
    g.options.map((o) => {
      const box = h('input', { type: 'checkbox', value: o.code, checked: selected.has(o.code) });
      checkboxes.push(box);
      box.addEventListener('change', () => {
        if (box.checked) selected.add(o.code);
        else selected.delete(o.code);
        syncFilters();
        search();
      });
      return h('label', { class: 'check' }, box, h('span', null, o.label, o.detail && h('small', null, o.detail)));
    }),
  ));

  const labelFor = new Map(filters.flatMap((g) => g.options.map((o) => [o.code, o.label])));

  function syncFilters() {
    const full = selected.size >= MAX_FILTERS;
    for (const box of checkboxes) {
      box.checked = selected.has(box.value);
      box.disabled = full && !box.checked;
    }
    limitNote.hidden = !full;
    filterCount.textContent = selected.size ? String(selected.size) : '';
    clear(activeChips);
    if (selected.size) {
      activeChips.append(
        ...[...selected].map((code) => h('button', {
          type: 'button',
          class: 'chip chip-removable',
          'aria-label': t('finder.removeFilter', 'Remove filter: {label}', { label: labelFor.get(code) ?? code }),
          onclick: () => { selected.delete(code); syncFilters(); search(); },
        }, labelFor.get(code) ?? code, icon('x'))),
        h('button', {
          type: 'button',
          class: 'link-btn',
          onclick: () => { selected.clear(); syncFilters(); search(); },
        }, t('finder.clearAll', 'Clear all')),
      );
    }
  }

  function widen(newRadius) {
    setRadius(newRadius);
    search();
  }

  function renderResults() {
    clear(list);
    clear(more);
    if (!state.location) {
      statusLine.textContent = '';
      list.append(h('div', { class: 'empty' },
        icon('search'),
        h('p', null, t('finder.enterLocation', 'Enter a ZIP code or city to see {noun} near you.', { noun }))));
      return;
    }
    if (!results.length) {
      statusLine.textContent = t('finder.noneFound', 'No {noun} found within {miles} miles of {label}.', {
        noun, miles: state.radius, label: state.location.label,
      });
      if (relaxed?.results?.length > 0) {
        const reqCodes = Array.isArray(relaxed.requestedCodes) && relaxed.requestedCodes.length
          ? relaxed.requestedCodes
          : [...selected];
        list.append(
          h('section', {
            class: 'relaxed-matches',
            role: 'region',
            'aria-label': t('finder.relaxedRegion', 'Closest partial matches'),
          },
            h('div', { class: 'callout callout-info relaxed-header' },
              h('p', { class: 'callout-title' },
                icon('info'),
                t('finder.relaxedHeading', 'No exact match for all {n} filters — showing closest partial matches', { n: reqCodes.length }),
              ),
              h('p', null,
                t('finder.relaxedBody', 'No facility within {miles} miles listed all {n} selected filters at once. These nearby facilities match the most filters you picked—call ahead to confirm additional services.', {
                  miles: state.radius,
                  n: reqCodes.length,
                }),
              ),
            ),
            h('div', { class: 'results-list relaxed-list' },
              ...relaxed.results.map((f) => treatmentCard(f, { requestedCodes: reqCodes, labelFor })),
            ),
          ),
        );
      }
      list.append(h('div', { class: 'empty' },
        h('p', null, selected.size
          ? t('finder.noneFiltered', 'No listings match every filter you picked. Try removing a filter or searching a wider area.')
          : t('finder.tryWider', 'Try searching a wider area.')),
        h('p', { class: 'empty-actions' },
          state.radius < 100 && h('button', {
            type: 'button',
            class: 'btn btn-small btn-secondary',
            onclick: () => widen(100),
          }, t('reach.widenTo', 'Search within {n} miles', { n: 100 })),
          selected.size > 0 && h('button', {
            type: 'button',
            class: 'btn btn-small btn-ghost',
            onclick: () => { selected.clear(); syncFilters(); search(); },
          }, t('finder.clearFilters', 'Clear filters')),
        ),
        treatmentReach({ mode: 'empty', kind, codes: [...selected], count: 0, onWiden: widen }),
        fallbackHelp()));
      return;
    }
    statusLine.textContent = t('finder.showingCount',
      'Showing {shown} of {total} {noun} within {miles} miles of {label}, nearest first.',
      { shown: formatNumber(results.length), total: formatNumber(total), noun, miles: state.radius, label: state.location.label });
    list.append(...results.map((f) => treatmentCard(f)));
    if (page < totalPages) {
      more.append(h('button', { type: 'button', class: 'btn btn-secondary', onclick: loadMore },
        t('finder.showMore', 'Show more results')));
    }
    if (total > 0 && total <= 3) {
      more.append(treatmentReach({ mode: 'low', kind, codes: [...selected], count: total, onWiden: widen }));
    }
  }

  const resultsContainer = h('div', { class: 'results', 'aria-busy': 'false' },
    activeChips,
    statusLine,
    list,
    more,
    h('p', { class: 'source-note' },
      t('finder.sourceSamhsa1', 'Listings come live from '),
      ext(t('url.findtreatment', 'https://findtreatment.gov/'), 'SAMHSA FindTreatment.gov'),
      t('finder.sourceSamhsa2', ', the federal directory of state-licensed facilities. HarborPath never accepts payment for placement or referrals.')),
  );

  async function run(nextPage) {
    if (!state.location) {
      resultsContainer.setAttribute('aria-busy', 'false');
      return renderResults();
    }
    controller?.abort();
    controller = new AbortController();
    resultsContainer.setAttribute('aria-busy', 'true');
    if (nextPage === 1) {
      relaxed = null;
      clear(list).append(...skeleton());
      clear(more);
      statusLine.textContent = t('finder.searchingShort', 'Searching…');
    } else {
      clear(more).append(h('p', { class: 'help' }, t('finder.loadingMore', 'Loading more…')));
    }
    try {
      const data = await api.treatment({
        lat: state.location.lat, lng: state.location.lng, radius: state.radius,
        kind, codes: [...selected], page: nextPage,
      }, controller.signal);
      page = data.page;
      totalPages = data.totalPages;
      total = data.total;
      results = nextPage === 1 ? data.results : results.concat(data.results);
      relaxed = nextPage === 1 ? (data.relaxed ?? null) : null;
      resultsContainer.setAttribute('aria-busy', 'false');
      renderResults();
      if (nextPage === 1) announce(statusLine.textContent);
    } catch (err) {
      if (err.name === 'AbortError') return;
      resultsContainer.setAttribute('aria-busy', 'false');
      clear(more);
      statusLine.textContent = '';
      if (nextPage === 1) clear(list).append(errorBox(err, () => run(1)));
      else more.append(errorBox(err, () => run(nextPage)));
    }
  }

  const search = () => run(1);
  const loadMore = () => run(page + 1);

  const wide = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(min-width: 960px)').matches
    : false;
  syncFilters();

  const el = h('div', { class: 'finder' },
    h('div', { class: 'card finder-search' }, locationPicker({ onChange: search })),
    h('div', { class: 'finder-body' },
      // Collapsed on phones so results stay above the fold; active filters show as chips.
      h('details', {
        class: 'filters',
        open: wide,
        'aria-label': t('finder.filtersRegion', 'Search filters'),
      },
        h('summary', null, icon('sliders'), t('finder.filters', 'Filters '), filterCount),
        h('div', { class: 'filters-inner' }, limitNote, groups),
      ),
      resultsContainer,
    ),
    statePanel(),
  );

  if (state.location) search();
  else renderResults();
  return el;
}

export function healthCenterFinder() {
  let controller;
  const statusLine = h('p', { class: 'results-status', role: 'status' });
  const list = h('div', { class: 'results-list' });
  const resultsContainer = h('div', { class: 'results', 'aria-busy': 'false' },
    statusLine,
    list,
    h('p', { class: 'source-note' },
      t('finder.sourceHrsa1', 'Sites from the '),
      ext('https://data.hrsa.gov/', 'HRSA Health Center Program'),
      t('finder.sourceHrsa2', ' dataset. Health centers serve everyone, insured or not, and offer fees based on income. Call to confirm hours and services.')),
  );

  function widen(newRadius) {
    setRadius(newRadius);
    search();
  }

  async function search() {
    clear(list);
    if (!state.location) {
      resultsContainer.setAttribute('aria-busy', 'false');
      statusLine.textContent = '';
      list.append(h('div', { class: 'empty' }, icon('search'),
        h('p', null, t('finder.enterLocationCenters', 'Enter a ZIP code or city to see health centers near you.'))));
      return;
    }
    controller?.abort();
    controller = new AbortController();
    resultsContainer.setAttribute('aria-busy', 'true');
    list.append(...skeleton(2));
    statusLine.textContent = t('finder.searchingShort', 'Searching…');
    try {
      const data = await api.healthCenters({ lat: state.location.lat, lng: state.location.lng, radius: state.radius }, controller.signal);
      resultsContainer.setAttribute('aria-busy', 'false');
      clear(list);
      if (!data.results.length) {
        statusLine.textContent = t('finder.noCenters', 'No health center sites within {miles} miles of {label}.', {
          miles: state.radius, label: state.location.label,
        });
        list.append(h('div', { class: 'empty' },
          h('p', null, t('finder.tryWiderCenters', 'Try a wider area, or search HRSA’s own finder.')),
          state.radius < 100 && h('button', {
            type: 'button',
            class: 'btn btn-small btn-secondary',
            onclick: () => widen(100),
          }, t('reach.widenTo', 'Search within {n} miles', { n: 100 })),
          healthCenterReach({ mode: 'empty', count: 0, onWiden: widen })));
        return;
      }
      statusLine.textContent = tp('finder.centersCount', data.total, {
        one: 'Showing {shown} of {n} health center site within {miles} miles of {label}, nearest first.',
        other: 'Showing {shown} of {n} health center sites within {miles} miles of {label}, nearest first.',
      }, { shown: formatNumber(data.results.length), miles: state.radius, label: state.location.label });
      announce(statusLine.textContent);
      list.append(...data.results.map((c) => healthCenterCard(c)));
      if (data.total > 0 && data.total <= 3) {
        list.append(healthCenterReach({ mode: 'low', count: data.total, onWiden: widen }));
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      resultsContainer.setAttribute('aria-busy', 'false');
      statusLine.textContent = '';
      clear(list).append(h('div', { class: 'callout callout-warn', role: 'alert' },
        h('p', null, err.message, ' ', ext('https://findahealthcenter.hrsa.gov/', t('finder.useHrsa', 'Use HRSA’s Find a Health Center')), '.')));
    }
  }

  const el = h('div', { class: 'finder finder-simple' },
    h('div', { class: 'card finder-search' }, locationPicker({ onChange: search })),
    resultsContainer,
    statePanel(),
  );
  search();
  return el;
}
