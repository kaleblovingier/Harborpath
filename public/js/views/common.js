import { h, ext, tel, sms, icon, langNote } from '../dom.js';
import { t, getLang } from '../i18n.js';

export function pageHeader(title, lede, ...extra) {
  return h('header', { class: 'page-header' },
    h('h1', { id: 'page-title', tabindex: '-1' }, title),
    lede && h('p', { class: 'lede' }, lede),
    ...extra,
  );
}

export function section(id, title, ...children) {
  return h('section', { class: 'section', id, 'aria-labelledby': `${id}-title` },
    h('h2', { id: `${id}-title` }, title),
    ...children,
  );
}

export const p = (...children) => h('p', null, ...children);
export const fine = (...children) => h('p', { class: 'fine' }, ...children);
export const ul = (items, cls) => h('ul', { class: cls ?? 'list' }, items.map((i) => h('li', null, i)));
export const strong = (t) => h('strong', null, t);

/** In-page navigation for long guides. Uses buttons so the hash route is untouched. */
export function tocNav(items) {
  return h('nav', { class: 'toc', 'aria-label': t('common.toc', 'On this page') },
    h('p', { class: 'toc-title' }, t('common.toc', 'On this page')),
    h('ul', null, items.map(([id, label]) => h('li', null,
      h('button', {
        type: 'button',
        class: 'link-btn',
        onclick: () => {
          const target = document.getElementById(id);
          target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
          target?.querySelector('h2')?.setAttribute('tabindex', '-1');
          target?.querySelector('h2')?.focus({ preventScroll: true });
        },
      }, label)))),
  );
}

/** items: [{ name, href, desc }] */
export function resourceList(items) {
  return h('ul', { class: 'resource-list' }, items.map((r) => h('li', { class: 'resource' },
    h('p', { class: 'resource-name' }, ext(r.href, r.name)),
    r.desc && h('p', { class: 'resource-desc' }, r.desc),
  )));
}

export function hotlineCard(line) {
  // Outside English, lines that confirmed service in the visitor's language say so.
  const inLanguage = getLang() === 'es' && line.spanish;
  return h('li', { class: 'card hotline' },
    h('h3', null, line.name),
    inLanguage && h('p', { class: 'chips' }, h('span', { class: 'chip chip-extra' }, t('hotline.inSpanish', 'Spanish available'))),
    h('p', null, line.desc),
    h('div', { class: 'actions' },
      line.call && tel(line.call.number, [icon('phone'), line.call.label], { class: 'btn btn-small btn-primary' }),
      line.text && sms(line.text.number, line.text.body, [icon('message'), line.text.label], { class: 'btn btn-small btn-secondary' }),
      line.web && h('a', { class: 'btn btn-small btn-ghost', href: line.web, target: '_blank', rel: 'noopener noreferrer', hreflang: langNote(line.web) ? 'en' : null },
        icon('globe'), line.webLabel ?? t('common.website', 'Website'), langNote(line.web),
        h('span', { class: 'visually-hidden' }, t('common.websiteFor', ' for {name} (opens in a new tab)', { name: line.name }))),
    ),
  );
}

export function hotlineGrid(lines) {
  return h('ul', { class: 'hotline-grid' }, lines.map(hotlineCard));
}

/** Prominent link card used on the home page and hubs. */
export function pathCard({ href, title, desc, iconName, tone = 'default' }) {
  return h('a', { class: `path-card tone-${tone}`, href },
    h('span', { class: 'path-icon' }, icon(iconName)),
    h('span', { class: 'path-text' },
      h('span', { class: 'path-title' }, title),
      h('span', { class: 'path-desc' }, desc)),
    icon('chevron'),
  );
}

export function emergencyCallout() {
  return h('div', { class: 'callout callout-emergency' },
    h('p', { class: 'callout-title' }, icon('alert'), t('common.emergency.title', 'Someone not breathing or won’t wake up?')),
    h('p', null, t('common.emergency.body', 'Call 911, give naloxone if you have it, and follow the step-by-step guide.')),
    h('p', { class: 'actions' },
      tel('911', [icon('phone'), t('common.call911', 'Call 911')], { class: 'btn btn-emergency' }),
      h('a', { class: 'btn btn-secondary', href: '#/overdose' }, t('common.emergency.steps', 'Overdose response steps')),
    ),
  );
}
