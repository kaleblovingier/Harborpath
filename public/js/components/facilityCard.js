import { h, tel, icon, announce, digits } from '../dom.js';
import { highlights, localizeServices, DETAIL_ORDER, DETAIL_HIDDEN, TREATMENT_FILTERS, MENTAL_HEALTH_FILTERS } from '../codes.js';
import { isSaved, toggleSaved } from '../state.js';
import { t, formatNumber, getServiceNames } from '../i18n.js';

const isApple = typeof navigator !== 'undefined' && /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);

function resolveFilterLabel(code, labelFor) {
  if (labelFor instanceof Map && labelFor.has(code)) return labelFor.get(code);
  if (labelFor && typeof labelFor === 'object' && !(labelFor instanceof Map) && code in labelFor) return labelFor[code];
  for (const group of [...TREATMENT_FILTERS, ...MENTAL_HEALTH_FILTERS]) {
    const found = group.options.find((o) => o.code === code);
    if (found) return found.label;
  }
  return code;
}

export function formatAddress(a) {
  if (!a) return '';
  const line1 = [a.street1 ?? a.street, a.street2, a.building].filter(Boolean).join(', ');
  const line2 = [a.city, [a.state, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return [line1, line2].filter(Boolean).join(', ');
}

export function directionsUrl(address) {
  const q = encodeURIComponent(address);
  return isApple ? `https://maps.apple.com/?daddr=${q}` : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

export function saveButton(item) {
  const btn = h('button', { type: 'button', class: 'btn btn-small btn-ghost save-btn' });
  const render = () => {
    const saved = isSaved(item.id);
    btn.replaceChildren(icon(saved ? 'bookmark-fill' : 'bookmark'), saved ? t('card.saved', 'Saved') : t('card.save', 'Save'));
    btn.setAttribute('aria-pressed', String(saved));
    btn.setAttribute('aria-label', saved
      ? t('card.removeLabel', 'Remove {name} from saved list', { name: item.name })
      : t('card.saveLabel', 'Save {name}', { name: item.name }));
  };
  btn.addEventListener('click', () => {
    const nowSaved = toggleSaved(item);
    render();
    announce(nowSaved
      ? t('card.savedAnnounce', '{name} saved', { name: item.name })
      : t('card.removedAnnounce', '{name} removed from saved list', { name: item.name }));
  });
  render();
  return btn;
}

export function copyButton(text, name) {
  return h('button', {
    type: 'button',
    class: 'btn btn-small btn-ghost',
    'aria-label': t('card.copyLabel', 'Copy details for {name}', { name }),
    onclick: async (e) => {
      const btn = e.currentTarget;
      try {
        await navigator.clipboard.writeText(text);
        btn.replaceChildren(icon('check'), t('card.copied', 'Copied'));
        announce(t('card.copiedAnnounce', 'Details for {name} copied', { name }));
        setTimeout(() => btn.replaceChildren(icon('copy'), t('card.copy', 'Copy')), 2000);
      } catch {
        announce(t('common.copyUnavailable', 'Copy is not available in this browser'));
      }
    },
  }, icon('copy'), t('card.copy', 'Copy'));
}

export function distance(miles) {
  if (miles === null || miles === undefined) return null;
  return h('p', { class: 'distance' }, miles < 0.1
    ? t('card.distanceUnder', 'Under 0.1 mi')
    : t('card.distance', '{miles} mi', { miles: formatNumber(miles, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }));
}

export function treatmentText(f) {
  if (f?.kind === 'provider') return providerText(f);
  return [
    f.name + (f.subname ? ` (${f.subname})` : ''),
    formatAddress(f.address),
    f.phone && t('card.text.phone', 'Phone: {phone}', { phone: f.phone }),
    f.intake && f.intake !== f.phone && t('card.text.intake', 'Intake: {phone}', { phone: f.intake }),
    f.website,
    t('card.text.sourceSamhsa', 'Source: SAMHSA FindTreatment.gov. Call ahead to confirm services.'),
  ].filter(Boolean).join('\n');
}

export function treatmentCard(f, { headingLevel = 3, requestedCodes, labelFor } = {}) {
  if (f?.kind === 'provider') return providerCard(f, { headingLevel });
  const address = formatAddress(f.address);
  const chips = highlights(f);
  const services = localizeServices(f, getServiceNames())
    .filter((s) => !DETAIL_HIDDEN.has(s.category))
    .sort((a, b) => {
      const ai = DETAIL_ORDER.indexOf(a.category);
      const bi = DETAIL_ORDER.indexOf(b.category);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });

  const hasNearMatch = (Array.isArray(f.matchedCodes) && f.matchedCodes.length > 0)
    || (Array.isArray(requestedCodes) && requestedCodes.length > 0);
  const facilityCodes = new Set(f.codes ?? []);
  const matchedList = Array.isArray(f.matchedCodes)
    ? f.matchedCodes
    : (Array.isArray(requestedCodes) ? requestedCodes.filter((c) => facilityCodes.has(c)) : []);
  const matchedSet = new Set(matchedList);
  const reqCodes = Array.isArray(requestedCodes) && requestedCodes.length > 0
    ? requestedCodes
    : matchedList;

  const nearMatchBanner = hasNearMatch && reqCodes.length > 0 && h('div', {
    class: 'near-match-banner',
    role: 'region',
    'aria-label': t('card.nearMatchLabel', 'Selected filter match summary'),
  },
    h('p', { class: 'near-match-count' },
      t('card.matchedCount', 'Matches {matched} of {total} selected filters', {
        matched: matchedSet.size,
        total: reqCodes.length,
      }),
    ),
    h('ul', { class: 'chips near-match-chips' },
      reqCodes.map((code) => {
        const label = resolveFilterLabel(code, labelFor);
        const isMatch = matchedSet.has(code);
        return h('li', {
          class: `chip ${isMatch ? 'badge-matched' : 'badge-unmatched'}`,
          'aria-label': isMatch
            ? t('card.filterMatched', 'Matched filter: {label}', { label })
            : t('card.filterUnmatched', 'Not listed: {label}', { label }),
        },
          icon(isMatch ? 'check' : 'x'),
          label,
        );
      }),
    ),
  );

  return h('article', { class: 'card facility', 'aria-labelledby': `f-${f.id}` },
    h('div', { class: 'facility-head' },
      h('div', null,
        h(`h${headingLevel}`, { id: `f-${f.id}`, class: 'facility-name' }, f.name),
        f.subname && h('p', { class: 'subname' }, f.subname),
      ),
      distance(f.miles),
    ),
    nearMatchBanner,
    address && h('p', { class: 'address' }, icon('pin'), address),
    chips.length > 0 && h('ul', { class: 'chips', 'aria-label': t('card.highlights', 'Highlights') },
      chips.map((c) => h('li', { class: `chip chip-${c.tone}` }, c.label))),
    h('div', { class: 'actions' },
      f.phone && tel(f.phone, [icon('phone'), t('card.call', 'Call {phone}', { phone: f.phone })], {
        class: 'btn btn-small btn-primary',
        'aria-label': t('card.callLabel', 'Call {name} at {phone}', { name: f.name, phone: f.phone }),
      }),
      f.intake && digits(f.intake) !== digits(f.phone) && tel(f.intake, [icon('phone'), t('card.intake', 'Intake {phone}', { phone: f.intake })], {
        class: 'btn btn-small btn-secondary',
        'aria-label': t('card.intakeLabel', 'Call intake for {name} at {phone}', { name: f.name, phone: f.intake }),
      }),
      f.hotline && digits(f.hotline) !== digits(f.phone) && tel(f.hotline, [icon('phone'), t('card.hotline', '24/7 line {phone}', { phone: f.hotline })], {
        class: 'btn btn-small btn-secondary',
        'aria-label': t('card.hotlineLabel', 'Call 24/7 line for {name} at {phone}', { name: f.name, phone: f.hotline }),
      }),
      f.website && h('a', {
        class: 'btn btn-small btn-ghost',
        href: f.website,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${t('common.website', 'Website')}${t('common.websiteFor', ' for {name} (opens in a new tab)', { name: f.name })}`,
      },
        icon('globe'), t('common.website', 'Website'), h('span', { class: 'visually-hidden' }, t('common.websiteFor', ' for {name} (opens in a new tab)', { name: f.name }))),
      address && h('a', {
        class: 'btn btn-small btn-ghost',
        href: directionsUrl(address),
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': t('card.directionsLabel', 'Directions to {name} (opens a map in a new tab)', { name: f.name }),
      },
        icon('directions'), t('card.directions', 'Directions'), h('span', { class: 'visually-hidden' }, t('card.directionsNewTab', ' (opens a map in a new tab)'))),
      saveButton({ ...f, kind: 'treatment' }),
      copyButton(treatmentText(f), f.name),
    ),
    services.length > 0 && h('details', { class: 'facility-details' },
      h('summary', {
        'aria-label': t('card.allServicesLabel', 'All listed services for {name}', { name: f.name }),
      }, t('card.allServices', 'All listed services')),
      h('dl', { class: 'service-list' },
        services.map((s) => [h('dt', null, s.label), h('dd', null, s.items.join(' · '))])),
      h('p', { class: 'fine' }, t('card.servicesNote', 'Listed by the facility in SAMHSA’s national directory. Call to confirm availability, cost, and wait times.')),
    ),
  );
}

export function healthCenterText(c) {
  return [
    c.name,
    c.org && c.org !== c.name ? t('card.text.operatedBy', 'Operated by {org}', { org: c.org }) : null,
    `${c.street}, ${c.city}, ${c.state} ${c.zip}`,
    c.phone && t('card.text.phone', 'Phone: {phone}', { phone: c.phone }),
    c.website,
    t('card.text.sourceHrsa', 'Source: HRSA Health Center Program. Sliding fee scale available.'),
  ].filter(Boolean).join('\n');
}

const SMALL_WORDS = new Set(['of', 'and', 'the', 'for', 'at', 'in', 'on', 'de']);
const UPPER_WORDS = new Set(['INC', 'INC.', 'LLC', 'CHC', 'FQHC', 'HIV', 'PC', 'PLLC', 'II', 'III', 'VA', 'IHS', 'RHC', 'ER', 'EMS', 'AMC', 'CBOC']);

// HRSA and CMS publish organization names in all caps; make them readable.
export function tidyName(s) {
  if (!s || s !== s.toUpperCase()) return s;
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
    h('ul', { class: 'chips', 'aria-label': t('card.highlights', 'Highlights') },
      h('li', { class: 'chip chip-pay' }, t('hc.sliding', 'Sliding fee scale')),
      c.lookAlike ? h('li', { class: 'chip chip-care' }, t('hc.lookAlike', 'FQHC look-alike')) : h('li', { class: 'chip chip-care' }, t('hc.chc', 'Community health center')),
      c.mobile && h('li', { class: 'chip chip-extra' }, t('hc.mobile', 'Mobile clinic')),
      c.seasonal && h('li', { class: 'chip chip-extra' }, t('hc.seasonal', 'Seasonal')),
      c.hours && h('li', { class: 'chip chip-neutral' }, t('hc.hours', '{hours} hrs/week', { hours: formatNumber(Math.round(c.hours)) })),
    ),
    h('div', { class: 'actions' },
      c.phone && tel(c.phone.replace(/\s*x.*$/i, ''), [icon('phone'), t('card.call', 'Call {phone}', { phone: c.phone })], {
        class: 'btn btn-small btn-primary',
        'aria-label': t('card.callLabel', 'Call {name} at {phone}', { name: c.name, phone: c.phone }),
      }),
      c.website && h('a', {
        class: 'btn btn-small btn-ghost',
        href: c.website,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${t('common.website', 'Website')}${t('common.websiteFor', ' for {name} (opens in a new tab)', { name: c.name })}`,
      },
        icon('globe'), t('common.website', 'Website'), h('span', { class: 'visually-hidden' }, t('common.websiteFor', ' for {name} (opens in a new tab)', { name: c.name }))),
      h('a', {
        class: 'btn btn-small btn-ghost',
        href: directionsUrl(address),
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': t('card.directionsLabel', 'Directions to {name} (opens a map in a new tab)', { name: c.name }),
      },
        icon('directions'), t('card.directions', 'Directions'), h('span', { class: 'visually-hidden' }, t('card.directionsNewTab', ' (opens a map in a new tab)'))),
      saveButton({ ...c, kind: 'health-center' }),
      copyButton(healthCenterText(c), c.name),
    ),
  );
}

function providerChips(p) {
  const net = p.providerType || p.type;
  const chips = [];
  const add = (label, tone = 'care') => chips.push({ label, tone });

  if (net === 'va') {
    const vaMap = {
      vamc: t('providers.va.vamc', 'VA Medical Center'),
      hcc: t('providers.va.hcc', 'VA Health Care Center'),
      mscboc: t('providers.va.mscboc', 'Multi-specialty VA clinic'),
      pccboc: t('providers.va.pccboc', 'Primary care VA clinic'),
      oos: t('providers.va.oos', 'VA outpatient services'),
      rrtp: t('providers.va.rrtp', 'VA residential rehab (RRTP)'),
      vc: t('providers.va.vc', 'Vet Center'),
      mvc: t('providers.va.mvc', 'Mobile Vet Center'),
    };
    add(vaMap[p.category] ?? t('providers.va.clinic', 'VA health facility'), 'care');
    add(t('providers.va.badge', 'Veterans & eligible family'), 'pay');
  } else if (net === 'ihs') {
    const opMap = {
      I: t('providers.ihs.op.I', 'Indian Health Service (IHS)'),
      T: t('providers.ihs.op.T', 'Tribal health program'),
      U: t('providers.ihs.op.U', 'Urban Indian health program'),
    };
    add(opMap[p.operator] ?? t('providers.ihs.badge', 'IHS / Tribal / Urban Indian'), 'pay');
    const catMap = {
      hospital: t('providers.ihs.cat.hospital', 'IHS / Tribal hospital'),
      center: t('providers.ihs.cat.center', 'Health center'),
      station: t('providers.ihs.cat.station', 'Health station'),
      village: t('providers.ihs.cat.village', 'Alaska village clinic'),
      behavioral: t('providers.ihs.cat.behavioral', 'Behavioral health & treatment'),
      dental: t('providers.ihs.cat.dental', 'Dental clinic'),
    };
    if (catMap[p.category]) add(catMap[p.category], 'care');
    const flags = new Set(p.flags ?? []);
    if (flags.has('sud')) add(t('providers.ihs.flag.sud', 'Substance use care'), 'med');
    if (flags.has('bh') && p.category !== 'behavioral') add(t('providers.ihs.flag.bh', 'Behavioral health'), 'care');
    if (flags.has('er')) add(t('providers.ihs.flag.er', 'Emergency care'), 'extra');
    if (flags.has('urgent')) add(t('providers.ihs.flag.urgent', 'Urgent care'), 'extra');
    if (flags.has('pharmacy')) add(t('providers.ihs.flag.pharmacy', 'Pharmacy'), 'med');
  } else if (net === 'rhc') {
    add(t('providers.rhc.badge', 'CMS Rural Health Clinic'), 'care');
    add(t('providers.rhc.pay', 'Medicare & Medicaid certified'), 'pay');
  } else if (net === 'er') {
    const erMap = {
      acute: t('providers.er.acute', 'Acute care hospital'),
      cah: t('providers.er.cah', 'Critical access hospital'),
      reh: t('providers.er.reh', 'Rural emergency hospital'),
      psych: t('providers.er.psych', 'Psychiatric hospital'),
      children: t('providers.er.children', 'Children’s hospital'),
      va: t('providers.er.va', 'VA hospital with emergency room'),
      ltc: t('providers.er.ltc', 'Long-term care hospital'),
    };
    add(erMap[p.category] ?? t('providers.er.badge', 'Emergency services hospital'), 'care');
    add(t('providers.er.247', 'Emergency department'), 'extra');
  }
  return chips;
}

export function providerText(p) {
  const address = formatAddress(p.address ?? p);
  const web = p.website || p.detailsUrl;
  const sourceMap = {
    va: t('providers.text.sourceVa', 'Source: U.S. Department of Veterans Affairs (VA.gov).'),
    ihs: t('providers.text.sourceIhs', 'Source: Indian Health Service (IHS.gov).'),
    rhc: t('providers.text.sourceRhc', 'Source: CMS Rural Health Clinic directory.'),
    er: t('providers.text.sourceEr', 'Source: CMS Hospital General Information.'),
  };
  const net = p.providerType || p.type;
  return [
    p.name,
    p.alias || (p.org && p.org !== p.name ? tidyName(p.org) : null),
    address,
    p.phone && t('card.text.phone', 'Phone: {phone}', { phone: p.phone }),
    web,
    sourceMap[net] ?? t('providers.text.sourceDefault', 'Source: Federal health provider directory.'),
  ].filter(Boolean).join('\n');
}

export function providerCard(p, { headingLevel = 3 } = {}) {
  const safeId = String(p.id).replace(/[^a-zA-Z0-9_-]/g, '-');
  const address = formatAddress(p.address ?? p);
  const sub = p.alias || (p.org && p.org.toLowerCase() !== p.name.toLowerCase() ? tidyName(p.org) : null) || p.subname;
  const web = p.website || p.detailsUrl;
  const chips = providerChips(p);
  const hasDetails = Boolean(p.servicesText || p.hours || p.serviceType);

  const savedPayload = {
    ...p,
    kind: 'provider',
    providerType: p.providerType || p.type,
    address: p.address ?? {
      street1: p.street,
      street2: p.street2 || p.building,
      city: p.city,
      state: p.state,
      zip: p.zip,
    },
    website: web,
    codes: p.codes ?? [],
    services: p.services ?? [],
  };

  return h('article', { class: 'card facility provider-card', 'aria-labelledby': `pr-${safeId}` },
    h('div', { class: 'facility-head' },
      h('div', null,
        h(`h${headingLevel}`, { id: `pr-${safeId}`, class: 'facility-name' }, tidyName(p.name)),
        sub && h('p', { class: 'subname' }, sub),
      ),
      distance(p.miles),
    ),
    address && h('p', { class: 'address' },
      icon('pin'),
      h('span', null,
        address,
        p.approx ? [' ', h('span', { class: 'fine' }, t('providers.approx', '(approximate area)'))] : null,
      ),
    ),
    chips.length > 0 && h('ul', { class: 'chips', 'aria-label': t('card.highlights', 'Highlights') },
      chips.map((c) => h('li', { class: `chip chip-${c.tone}` }, c.label))),
    h('div', { class: 'actions' },
      p.phone && tel(p.phone.replace(/\s*x.*$/i, ''), [icon('phone'), t('card.call', 'Call {phone}', { phone: p.phone })], {
        class: 'btn btn-small btn-primary',
        'aria-label': t('card.callLabel', 'Call {name} at {phone}', { name: tidyName(p.name), phone: p.phone }),
      }),
      web && h('a', {
        class: 'btn btn-small btn-ghost',
        href: web,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${p.detailsUrl && !p.website ? t('providers.detailsLink', 'Facility details') : t('common.website', 'Website')}${t('common.websiteFor', ' for {name} (opens in a new tab)', { name: tidyName(p.name) })}`,
      },
        icon('globe'),
        p.detailsUrl && !p.website ? t('providers.detailsLink', 'Facility details') : t('common.website', 'Website'),
        h('span', { class: 'visually-hidden' }, t('common.websiteFor', ' for {name} (opens in a new tab)', { name: p.name }))),
      address && h('a', {
        class: 'btn btn-small btn-ghost',
        href: directionsUrl(address),
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': t('card.directionsLabel', 'Directions to {name} (opens a map in a new tab)', { name: tidyName(p.name) }),
      },
        icon('directions'), t('card.directions', 'Directions'), h('span', { class: 'visually-hidden' }, t('card.directionsNewTab', ' (opens a map in a new tab)'))),
      saveButton(savedPayload),
      copyButton(providerText(p), p.name),
    ),
    hasDetails && h('details', { class: 'facility-details' },
      h('summary', {
        'aria-label': t('providers.moreInfoLabel', 'Program details & hours for {name}', { name: tidyName(p.name) }),
      }, t('providers.moreInfo', 'Program details & hours')),
      h('dl', { class: 'service-list' },
        p.serviceType && [h('dt', null, t('providers.field.type', 'Facility type')), h('dd', null, p.serviceType)],
        p.hours && [h('dt', null, t('providers.field.hours', 'Hours')), h('dd', null, p.hours)],
        p.servicesText && [h('dt', null, t('providers.field.services', 'Services')), h('dd', null, p.servicesText)],
      ),
    ),
  );
}
