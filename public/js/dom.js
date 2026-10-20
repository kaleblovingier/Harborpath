// Tiny DOM builder. Every string becomes a text node, so data from the API can
// never be interpreted as markup.

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class') el.className = value;
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key === 'style') throw new Error('Inline styles are blocked by CSP; use a class');
      else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (value === true) el.setAttribute(key, '');
      else el.setAttribute(key, String(value));
    }
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

export function clear(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
}

/** External link: new tab, no referrer, marked for screen readers. */
export function ext(href, ...children) {
  return h('a', { href, target: '_blank', rel: 'noopener noreferrer', class: 'ext' },
    ...children, h('span', { class: 'visually-hidden' }, ' (opens in a new tab)'));
}

export function digits(phone) {
  return String(phone ?? '').replace(/[^\d+]/g, '');
}

/** Phone link. `display` defaults to the number itself. */
export function tel(number, display, props = {}) {
  return h('a', { href: `tel:${digits(number)}`, class: 'tel', ...props }, display ?? number);
}

/** SMS link. "?&body=" is the form that pre-fills the message on both iOS and Android. */
export function sms(number, body, display, props = {}) {
  const href = body ? `sms:${digits(number)}?&body=${encodeURIComponent(body)}` : `sms:${digits(number)}`;
  return h('a', { href, class: 'tel', ...props }, display ?? number);
}

export function icon(name, label) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', label ? 'false' : 'true');
  if (label) svg.setAttribute('aria-label', label);
  const use = document.createElementNS(svgNS, 'use');
  use.setAttribute('href', `/icons.svg#${name}`);
  svg.append(use);
  return svg;
}

let announcer;
/** Politely announce a status message to screen readers. */
export function announce(message) {
  announcer ??= document.getElementById('announcer');
  if (!announcer) return;
  announcer.textContent = '';
  setTimeout(() => { announcer.textContent = message; }, 50);
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
