import { h, tel, icon, announce, digits } from '../dom.js';
import { highlights, DETAIL_ORDER, DETAIL_HIDDEN } from '../codes.js';
import { isSaved, toggleSaved } from '../state.js';

const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);

export function formatAddress(a) {
  const line1 = [a.street1, a.street2].filter(Boolean).join(', ');
  const line2 = [a.city, [a.state, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return [line1, line2].filter(Boolean).join(', ');
}

function directionsUrl(address) {
  const q = encodeURIComponent(address);
  return isApple ? `https://maps.apple.com/?daddr=${q}` : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

function saveButton(item) {
  const btn = h('button', { type: 'button', class: 'btn btn-small btn-ghost save-btn' });
  const render = () => {
    const saved = isSaved(item.id);
    btn.replaceChildren(icon(saved ? 'bookmark-fill' : 'bookmark'), saved ? 'Saved' : 'Save');
    btn.setAttribute('aria-pressed', String(saved));
    btn.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${item.name}${saved ? ' from saved list' : ''}`);
  };
  btn.addEventListener('click', () => {
    const nowSaved = toggleSaved(item);
    render();
    announce(nowSaved ? `${item.name} saved` : `${item.name} removed from saved list`);
  });
  render();
  return btn;
}

function copyButton(text, name) {
  return h('button', {
    type: 'button',
    class: 'btn btn-small btn-ghost',
    onclick: async (e) => {
      const btn = e.currentTarget;
      try {
        await navigator.clipboard.writeText(text);
        btn.replaceChildren(icon('check'), 'Copied');
        announce(`Details for ${name} copied`);
        setTimeout(() => btn.replaceChildren(icon('copy'), 'Copy'), 2000);
      } catch {
        announce('Copy is not available in this browser');
      }
    },
  }, icon('copy'), 'Copy');
}

function distance(miles) {
  if (miles === null || miles === undefined) return null;
  return h('p', { class: 'distance' }, miles < 0.1 ? 'Under 0.1 mi' : `${miles.toFixed(1)} mi`);
}

export function treatmentText(f) {
  return [
    f.name + (f.subname ? ` (${f.subname})` : ''),
    formatAddress(f.address),
    f.phone && `Phone: ${f.phone}`,
    f.intake && f.intake !== f.phone && `Intake: ${f.intake}`,
    f.website,
    'Source: SAMHSA FindTreatment.gov. Call ahead to confirm services.',
  ].filter(Boolean).join('\n');
}

export function treatmentCard(f, { headingLevel = 3 } = {}) {
  const address = formatAddress(f.address);
  const chips = highlights(f);
  const services = [...f.services]
    .filter((s) => !DETAIL_HIDDEN.has(s.category))
    .sort((a, b) => {
      const ai = DETAIL_ORDER.indexOf(a.category);
      const bi = DETAIL_ORDER.indexOf(b.category);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });

  return h('article', { class: 'card facility', 'aria-labelledby': `f-${f.id}` },
    h('div', { class: 'facility-head' },
      h('div', null,
        h(`h${headingLevel}`, { id: `f-${f.id}`, class: 'facility-name' }, f.name),
        f.subname && h('p', { class: 'subname' }, f.subname),
      ),
      distance(f.miles),
    ),
    address && h('p', { class: 'address' }, icon('pin'), address),
    chips.length > 0 && h('ul', { class: 'chips', 'aria-label': 'Highlights' },
      chips.map((c) => h('li', { class: `chip chip-${c.tone}` }, c.label))),
    h('div', { class: 'actions' },
      f.phone && tel(f.phone, [icon('phone'), `Call ${f.phone}`], { class: 'btn btn-small btn-primary' }),
      f.intake && digits(f.intake) !== digits(f.phone) && tel(f.intake, [icon('phone'), `Intake ${f.intake}`], { class: 'btn btn-small btn-secondary' }),
      f.hotline && digits(f.hotline) !== digits(f.phone) && tel(f.hotline, [icon('phone'), `24/7 line ${f.hotline}`], { class: 'btn btn-small btn-secondary' }),
      f.website && h('a', { class: 'btn btn-small btn-ghost', href: f.website, target: '_blank', rel: 'noopener noreferrer' },
        icon('globe'), 'Website', h('span', { class: 'visually-hidden' }, ` for ${f.name} (opens in a new tab)`)),
      address && h('a', { class: 'btn btn-small btn-ghost', href: directionsUrl(address), target: '_blank', rel: 'noopener noreferrer' },
        icon('directions'), 'Directions', h('span', { class: 'visually-hidden' }, ' (opens a map in a new tab)')),
      saveButton({ ...f, kind: 'treatment' }),
      copyButton(treatmentText(f), f.name),
    ),
    services.length > 0 && h('details', { class: 'facility-details' },
      h('summary', null, 'All listed services'),
      h('dl', { class: 'service-list' },
        services.map((s) => [h('dt', null, s.label), h('dd', null, s.items.join(' · '))])),
      h('p', { class: 'fine' }, 'Listed by the facility in SAMHSA’s national directory. Call to confirm availability, cost, and wait times.'),
    ),
  );
}

export function healthCenterText(c) {
  return [
    c.name,
    c.org && c.org !== c.name ? `Operated by ${c.org}` : null,
    `${c.street}, ${c.city}, ${c.state} ${c.zip}`,
    c.phone && `Phone: ${c.phone}`,
    c.website,
    'Source: HRSA Health Center Program. Sliding fee scale available.',
  ].filter(Boolean).join('\n');
}

const SMALL_WORDS = new Set(['of', 'and', 'the', 'for', 'at', 'in', 'on', 'de']);
const UPPER_WORDS = new Set(['INC', 'INC.', 'LLC', 'CHC', 'FQHC', 'HIV', 'PC', 'PLLC', 'II', 'III']);

// HRSA publishes organization names in all caps; make them readable.
function tidyName(s) {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().split(' ').map((w, i) => {
    if (UPPER_WORDS.has(w.toUpperCase())) return w.toUpperCase();
    if (i > 0 && SMALL_WORDS.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

export function healthCenterCard(c, { headingLevel = 3 } = {}) {
  const address = `${c.street}, ${c.city}, ${c.state} ${c.zip}`;
  const org = c.org ? tidyName(c.org) : null;
  return h('article', { class: 'card facility', 'aria-labelledby': `hc-${c.id}` },
    h('div', { class: 'facility-head' },
      h('div', null,
        h(`h${headingLevel}`, { id: `hc-${c.id}`, class: 'facility-name' }, c.name),
        org && org.toLowerCase() !== c.name.toLowerCase() && h('p', { class: 'subname' }, org),
      ),
      distance(c.miles),
    ),
    h('p', { class: 'address' }, icon('pin'), address),
    h('ul', { class: 'chips', 'aria-label': 'Highlights' },
      h('li', { class: 'chip chip-pay' }, 'Sliding fee scale'),
      c.lookAlike ? h('li', { class: 'chip chip-care' }, 'FQHC look-alike') : h('li', { class: 'chip chip-care' }, 'Community health center'),
      c.mobile && h('li', { class: 'chip chip-extra' }, 'Mobile clinic'),
      c.seasonal && h('li', { class: 'chip chip-extra' }, 'Seasonal'),
      c.hours && h('li', { class: 'chip chip-neutral' }, `${Math.round(c.hours)} hrs/week`),
    ),
    h('div', { class: 'actions' },
      c.phone && tel(c.phone.replace(/\s*x.*$/i, ''), [icon('phone'), `Call ${c.phone}`], { class: 'btn btn-small btn-primary' }),
      c.website && h('a', { class: 'btn btn-small btn-ghost', href: c.website, target: '_blank', rel: 'noopener noreferrer' },
        icon('globe'), 'Website', h('span', { class: 'visually-hidden' }, ` for ${c.name} (opens in a new tab)`)),
      h('a', { class: 'btn btn-small btn-ghost', href: directionsUrl(address), target: '_blank', rel: 'noopener noreferrer' },
        icon('directions'), 'Directions', h('span', { class: 'visually-hidden' }, ' (opens a map in a new tab)')),
      saveButton({ ...c, kind: 'health-center' }),
      copyButton(healthCenterText(c), c.name),
    ),
  );
}
