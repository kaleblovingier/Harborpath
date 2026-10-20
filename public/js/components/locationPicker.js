import { h, clear, icon, announce, debounce } from '../dom.js';
import { api, round2 } from '../api.js';
import { state, setLocation, setRadius, subscribe } from '../state.js';

let uid = 0;
const RADII = [5, 10, 25, 50, 100];

/**
 * ZIP / city search with suggestions, "use my location", and a distance menu.
 * Calls onChange() whenever the shared location or radius changes.
 */
export function locationPicker({ onChange, compact = false } = {}) {
  const id = `loc-${++uid}`;
  let suggestions = [];
  let active = -1;
  let controller;

  const input = h('input', {
    id: `${id}-input`,
    class: 'input',
    type: 'text',
    inputmode: 'search',
    autocomplete: 'off',
    autocapitalize: 'words',
    spellcheck: 'false',
    placeholder: 'ZIP code or city, state',
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': `${id}-list`,
    'aria-describedby': `${id}-help`,
  });
  const list = h('ul', { id: `${id}-list`, class: 'suggestions', role: 'listbox', hidden: true, 'aria-label': 'Matching places' });
  const status = h('p', { class: 'field-status', 'aria-live': 'polite' });
  const radiusSelect = h('select', { id: `${id}-radius`, class: 'select' },
    RADII.map((r) => h('option', { value: r, selected: r === state.radius }, `Within ${r} miles`)));

  const current = h('p', { class: 'current-location' });

  function renderCurrent() {
    clear(current);
    if (state.location) {
      current.append(icon('pin'), h('span', null, 'Searching near ', h('strong', null, state.location.label)));
    }
  }

  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function renderList() {
    clear(list);
    if (!suggestions.length) return close();
    suggestions.forEach((s, i) => {
      list.append(h('li', {
        id: `${id}-opt-${i}`,
        role: 'option',
        class: 'suggestion',
        'aria-selected': String(i === active),
        onmousedown: (e) => { e.preventDefault(); choose(s); },
      }, icon(s.kind === 'zip' ? 'hash' : 'pin'), s.label));
    });
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (active >= 0) input.setAttribute('aria-activedescendant', `${id}-opt-${active}`);
    else input.removeAttribute('aria-activedescendant');
  }

  function choose(s) {
    input.value = s.label;
    suggestions = [];
    close();
    status.textContent = '';
    setLocation({ label: s.label, lat: s.lat, lng: s.lng });
    renderCurrent();
    announce(`Location set to ${s.label}`);
    onChange?.();
  }

  async function fetchSuggestions(q) {
    controller?.abort();
    controller = new AbortController();
    try {
      const { results } = await api.geocode(q, controller.signal);
      suggestions = results;
      active = -1;
      renderList();
      return results;
    } catch (err) {
      if (err.name !== 'AbortError') status.textContent = err.message;
      return [];
    }
  }

  const lookup = debounce((q) => {
    if (q.trim().length >= 2) fetchSuggestions(q);
    else { suggestions = []; close(); }
  }, 180);

  input.addEventListener('input', () => {
    status.textContent = '';
    lookup(input.value);
  });
  input.addEventListener('blur', () => setTimeout(close, 100));
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      active = (active + 1) % suggestions.length;
      renderList();
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      active = (active - 1 + suggestions.length) % suggestions.length;
      renderList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && suggestions[active]) return choose(suggestions[active]);
      const q = input.value.trim();
      if (q.length < 2) { status.textContent = 'Enter a 5-digit ZIP code or a city and state.'; return; }
      const results = suggestions.length ? suggestions : await fetchSuggestions(q);
      if (results.length) choose(results[0]);
      else status.textContent = `We couldn't find "${q}". Try a 5-digit ZIP code, or a city and state like "Dayton, OH".`;
    } else if (e.key === 'Escape' && !list.hidden) {
      // Closing the list must not count toward the Esc-Esc quick exit.
      e.stopPropagation();
      close();
    }
  });

  const geoButton = h('button', {
    type: 'button',
    class: 'btn btn-ghost',
    onclick: () => {
      if (!('geolocation' in navigator)) {
        status.textContent = 'Your browser does not support location sharing. Enter a ZIP code instead.';
        return;
      }
      status.textContent = 'Finding your area…';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Round on the device before it is used anywhere (about 1 km).
          const lat = round2(pos.coords.latitude);
          const lng = round2(pos.coords.longitude);
          input.value = '';
          choose({ label: 'your current area', lat, lng });
        },
        () => { status.textContent = 'Location is off or was declined. Enter a ZIP code or city instead.'; },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
      );
    },
  }, icon('locate'), 'Use my location');

  radiusSelect.addEventListener('change', () => {
    setRadius(Number(radiusSelect.value));
    if (state.location) onChange?.();
  });

  renderCurrent();
  if (state.location && state.location.label !== 'your current area') input.value = state.location.label;

  const root = h('div', { class: `location-picker${compact ? ' compact' : ''}` },
    h('label', { class: 'label', for: input.id }, 'Where should we look?'),
    h('div', { class: 'location-row' },
      h('div', { class: 'combo' }, icon('search'), input, list),
      h('label', { class: 'visually-hidden', for: radiusSelect.id }, 'Distance'),
      radiusSelect,
    ),
    h('div', { class: 'location-meta' },
      geoButton,
      h('p', { id: `${id}-help`, class: 'help' }, 'Your exact location is never stored. Searches use an area rounded to about 1 km.'),
    ),
    status,
    current,
  );

  // Reflect radius changes made elsewhere (e.g. "Search within 100 miles").
  const unsubscribe = subscribe(() => {
    if (!root.isConnected) return unsubscribe();
    radiusSelect.value = String(state.radius);
  });
  return root;
}
