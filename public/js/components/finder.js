import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { api } from '../api.js';
import { state, setRadius } from '../state.js';
import { locationPicker } from './locationPicker.js';
import { treatmentCard, healthCenterCard } from './facilityCard.js';

const MAX_FILTERS = 8;

function fallbackHelp() {
  return h('div', { class: 'callout callout-info' },
    h('p', null, h('strong', null, 'Prefer to talk to someone? '),
      'The free, confidential SAMHSA National Helpline (24/7, English and Spanish) can help you find local treatment: ',
      tel('18006624357', '1-800-662-4357'), '.'),
  );
}

function errorBox(err, onRetry) {
  return h('div', { class: 'callout callout-warn', role: 'alert' },
    h('p', null, h('strong', null, 'Search is unavailable right now. '), err.message),
    h('p', null,
      h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: onRetry }, 'Try again'), ' ',
      ext(err.fallbackUrl || 'https://findtreatment.gov/', 'Search FindTreatment.gov directly'), ' or call ',
      tel('18006624357', '1-800-662-4357'), '.'),
  );
}

function skeleton(n = 3) {
  return Array.from({ length: n }, () => h('div', { class: 'card skeleton', 'aria-hidden': 'true' },
    h('div', { class: 'sk sk-title' }), h('div', { class: 'sk sk-line' }), h('div', { class: 'sk sk-line short' })));
}

/**
 * Search SAMHSA's directory. kind: 'sa' (substance use) or 'mh' (mental health).
 */
export function treatmentFinder({ kind = 'sa', filters, initialCodes = [], noun = 'places' }) {
  const selected = new Set(initialCodes);
  let page = 1;
  let results = [];
  let totalPages = 0;
  let total = 0;
  let controller;

  const statusLine = h('p', { class: 'results-status', role: 'status' });
  const list = h('div', { class: 'results-list' });
  const more = h('div', { class: 'results-more' });
  const activeChips = h('div', { class: 'active-filters' });
  const filterCount = h('span', { class: 'count' });
  const limitNote = h('p', { class: 'help', hidden: true }, `You can combine up to ${MAX_FILTERS} filters.`);

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
          'aria-label': `Remove filter: ${labelFor.get(code) ?? code}`,
          onclick: () => { selected.delete(code); syncFilters(); search(); },
        }, labelFor.get(code) ?? code, icon('x'))),
        h('button', { type: 'button', class: 'link-btn', onclick: () => { selected.clear(); syncFilters(); search(); } }, 'Clear all'),
      );
    }
  }

  function renderResults() {
    clear(list);
    clear(more);
    if (!state.location) {
      statusLine.textContent = '';
      list.append(h('div', { class: 'empty' },
        icon('search'),
        h('p', null, `Enter a ZIP code or city to see ${noun} near you.`)));
      return;
    }
    if (!results.length) {
      statusLine.textContent = `No ${noun} found within ${state.radius} miles of ${state.location.label}.`;
      list.append(h('div', { class: 'empty' },
        h('p', null, selected.size
          ? 'No listings match every filter you picked. Try removing a filter or searching a wider area.'
          : 'Try searching a wider area.'),
        h('p', { class: 'empty-actions' },
          state.radius < 100 && h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: () => { setRadius(100); search(); } }, 'Search within 100 miles'),
          selected.size > 0 && h('button', { type: 'button', class: 'btn btn-small btn-ghost', onclick: () => { selected.clear(); syncFilters(); search(); } }, 'Clear filters'),
        ),
        fallbackHelp()));
      return;
    }
    statusLine.textContent = `Showing ${results.length} of ${total} ${noun} within ${state.radius} miles of ${state.location.label}, nearest first.`;
    list.append(...results.map((f) => treatmentCard(f)));
    if (page < totalPages) {
      more.append(h('button', { type: 'button', class: 'btn btn-secondary', onclick: loadMore }, 'Show more results'));
    }
  }

  async function run(nextPage) {
    if (!state.location) return renderResults();
    controller?.abort();
    controller = new AbortController();
    if (nextPage === 1) {
      clear(list).append(...skeleton());
      clear(more);
      statusLine.textContent = 'Searching…';
    } else {
      clear(more).append(h('p', { class: 'help' }, 'Loading more…'));
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
      renderResults();
      if (nextPage === 1) announce(statusLine.textContent);
    } catch (err) {
      if (err.name === 'AbortError') return;
      clear(more);
      statusLine.textContent = '';
      if (nextPage === 1) clear(list).append(errorBox(err, () => run(1)));
      else more.append(errorBox(err, () => run(nextPage)));
    }
  }

  const search = () => run(1);
  const loadMore = () => run(page + 1);

  const wide = window.matchMedia('(min-width: 960px)').matches;
  syncFilters();

  const el = h('div', { class: 'finder' },
    h('div', { class: 'card finder-search' }, locationPicker({ onChange: search })),
    h('div', { class: 'finder-body' },
      // Collapsed on phones so results stay above the fold; active filters show as chips.
      h('details', { class: 'filters', open: wide },
        h('summary', null, icon('sliders'), 'Filters ', filterCount),
        h('div', { class: 'filters-inner' }, limitNote, groups),
      ),
      h('div', { class: 'results', 'aria-busy': 'false' },
        activeChips,
        statusLine,
        list,
        more,
        h('p', { class: 'source-note' },
          'Listings come live from ', ext('https://findtreatment.gov/', 'SAMHSA FindTreatment.gov'),
          ', the federal directory of state-licensed facilities. HarborPath never accepts payment for placement or referrals.'),
      ),
    ),
  );

  if (state.location) search();
  else renderResults();
  return el;
}

export function healthCenterFinder() {
  let controller;
  const statusLine = h('p', { class: 'results-status', role: 'status' });
  const list = h('div', { class: 'results-list' });

  async function search() {
    clear(list);
    if (!state.location) {
      statusLine.textContent = '';
      list.append(h('div', { class: 'empty' }, icon('search'), h('p', null, 'Enter a ZIP code or city to see health centers near you.')));
      return;
    }
    controller?.abort();
    controller = new AbortController();
    list.append(...skeleton(2));
    statusLine.textContent = 'Searching…';
    try {
      const data = await api.healthCenters({ lat: state.location.lat, lng: state.location.lng, radius: state.radius }, controller.signal);
      clear(list);
      if (!data.results.length) {
        statusLine.textContent = `No health center sites within ${state.radius} miles of ${state.location.label}.`;
        list.append(h('div', { class: 'empty' },
          h('p', null, 'Try a wider area, or search HRSA’s own finder.'),
          state.radius < 100 && h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: () => { setRadius(100); search(); } }, 'Search within 100 miles')));
        return;
      }
      statusLine.textContent = `Showing ${data.results.length} of ${data.total} health center sites within ${state.radius} miles of ${state.location.label}, nearest first.`;
      announce(statusLine.textContent);
      list.append(...data.results.map((c) => healthCenterCard(c)));
    } catch (err) {
      if (err.name === 'AbortError') return;
      statusLine.textContent = '';
      clear(list).append(h('div', { class: 'callout callout-warn', role: 'alert' },
        h('p', null, err.message, ' ', ext('https://findahealthcenter.hrsa.gov/', 'Use HRSA’s Find a Health Center'), '.')));
    }
  }

  const el = h('div', { class: 'finder finder-simple' },
    h('div', { class: 'card finder-search' }, locationPicker({ onChange: search })),
    h('div', { class: 'results' },
      statusLine,
      list,
      h('p', { class: 'source-note' },
        'Sites from the ', ext('https://data.hrsa.gov/', 'HRSA Health Center Program'),
        ' dataset. Health centers serve everyone, insured or not, and offer fees based on income. Call to confirm hours and services.'),
    ),
  );
  search();
  return el;
}
