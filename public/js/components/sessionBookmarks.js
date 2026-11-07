// Session Bookmarks & Resource Organizer Component
// Zero-knowledge in-RAM resource manager with 0 npm dependencies and 0 PII leakage.
// WCAG 2.2 AA accessible DOM construction using text nodes, attributes, and CSS classes (no direct markup injection or inline styles).

import { state, toggleSaved, isSaved, subscribe, onQuickExit } from '../state.js';
import { t, getLang } from '../i18n.js';
import { h, icon, clear, ext, tel, sms, announce, safeHref, digits } from '../dom.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetBookmarksViewState);

/**
 * Standard clinical & patient advocacy educational disclaimer.
 * Must be present in all printed handouts, clipboard exports, and bookmark summaries.
 */
export const CLINICAL_DISCLAIMER = 'HarborPath Resource Summary — Not medical advice. In an emergency dial 911 or 988.';

const isApple = typeof navigator !== 'undefined' && /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);

/**
 * Safely resolves Apple or Google maps URL for physical directions.
 */
export function directionsUrl(address) {
  if (!address) return null;
  const q = encodeURIComponent(address);
  return isApple ? `https://maps.apple.com/?daddr=${q}` : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

/**
 * Formats an address object or string into a clean multi-part address.
 */
export function formatAddress(a) {
  if (!a) return '';
  if (typeof a === 'string') return a.trim();
  const line1 = [a.street1 ?? a.street, a.street2, a.building].filter(Boolean).join(', ');
  const line2 = [a.city, [a.state, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return [line1, line2].filter(Boolean).join(', ');
}

/**
 * Resolves localized text property ({ en, es } or string).
 */
function resolveText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const lang = typeof getLang === 'function' ? getLang() : 'en';
    return val[lang] || val.en || Object.values(val)[0] || '';
  }
  return String(val);
}

/**
 * Determines category bucket for any saved item:
 * - 'clinical': treatment, health-center, provider
 * - 'mutual-aid': peer recovery, 12-step, secular, harm-reduction groups
 * - 'crisis-hotline': 988, text lines, warm lines, overdose lines
 * - 'guide': clinical topics, harm reduction guides, toolkits
 */
export function getBookmarkCategory(item) {
  if (!item) return 'clinical';
  const kind = String(item.kind || item.type || '').toLowerCase();
  if (kind === 'mutual-aid' || kind === 'mutualaid' || item.philosophies || item.moudStatus) {
    return 'mutual-aid';
  }
  if (kind === 'hotline' || kind === 'crisis-hotline' || kind === 'crisis') {
    return 'crisis-hotline';
  }
  if (kind === 'guide' || kind === 'article' || kind === 'topic' || kind === 'education') {
    return 'guide';
  }
  if (
    kind === 'health-center' ||
    kind === 'healthcenter' ||
    kind === 'treatment' ||
    kind === 'provider' ||
    kind === 'facility' ||
    item.providerType
  ) {
    return 'clinical';
  }
  return 'clinical';
}

/**
 * Generates clean, formatted plaintext summary for clipboard and print.
 * Supports: treatment, health-center, provider, mutual-aid, hotline, and guide.
 * Includes clinical disclaimer by default.
 */
export function formatBookmarkText(item, { includeDisclaimer = true } = {}) {
  if (!item) return includeDisclaimer ? CLINICAL_DISCLAIMER : '';

  const cat = getBookmarkCategory(item);
  const kind = String(item.kind || item.type || cat).toLowerCase();
  let lines = [];

  if (kind === 'health-center' || kind === 'healthcenter') {
    const org = item.org && item.org.toLowerCase() !== (item.name || '').toLowerCase() ? item.org : null;
    const addr = formatAddress(item.address ?? { street: item.street, city: item.city, state: item.state, zip: item.zip });
    lines = [
      item.name,
      org ? t('card.text.operatedBy', 'Operated by {org}', { org }) : null,
      addr || null,
      item.phone ? t('card.text.phone', 'Phone: {phone}', { phone: item.phone }) : null,
      item.website || item.url || null,
      t('card.text.sourceHrsa', 'Source: HRSA Health Center Program. Sliding fee scale available.'),
    ];
  } else if (kind === 'provider') {
    const sub = item.alias || (item.org && item.org.toLowerCase() !== (item.name || '').toLowerCase() ? item.org : null) || item.subname;
    const addr = formatAddress(item.address ?? item);
    const web = item.website || item.detailsUrl || item.url;
    const net = item.providerType || item.type;
    const sourceMap = {
      va: 'Source: U.S. Department of Veterans Affairs (VA.gov).',
      ihs: 'Source: Indian Health Service (IHS.gov).',
      rhc: 'Source: CMS Rural Health Clinic directory.',
      er: 'Source: CMS Hospital General Information.',
    };
    const source = sourceMap[net] || 'Source: Federal health provider directory.';
    lines = [
      item.name,
      sub || null,
      addr || null,
      item.phone ? t('card.text.phone', 'Phone: {phone}', { phone: item.phone }) : null,
      web || null,
      source,
    ];
  } else if (cat === 'mutual-aid') {
    const name = item.name + (item.acronym ? ` (${item.acronym})` : '');
    const phil = resolveText(item.philosophyName) || (Array.isArray(item.philosophies) ? item.philosophies.join(', ') : item.philosophy) || null;
    const desc = resolveText(item.description) || resolveText(item.desc) || null;
    const tools = resolveText(item.keyTools) || null;
    const moud = item.isMoudAffirming || item.moudStatus ? 'MOUD-Affirming: Prescribed medications affirmed and supported.' : null;
    const web = item.websiteUrl || item.website || item.url;
    lines = [
      name,
      phil ? `Philosophy / Pathway: ${phil}` : null,
      desc,
      tools ? `Key Tools: ${tools}` : null,
      moud,
      item.phone ? t('card.text.phone', 'Phone: {phone}', { phone: item.phone }) : null,
      web ? `Meetings & Info: ${web}` : null,
      'Source: HarborPath Mutual Aid & Peer Recovery Directory.',
    ];
  } else if (cat === 'crisis-hotline') {
    const name = item.name || item.title;
    const desc = resolveText(item.desc) || resolveText(item.description);
    const callStr = typeof item.call === 'object'
      ? `${item.call.label || item.call.number}${item.call.number && item.call.label !== item.call.number ? ` (${item.call.number})` : ''}`
      : (item.call || (item.phone ? `Phone: ${item.phone}` : null));
    const textStr = typeof item.text === 'object'
      ? (item.text.label || `Text ${item.text.number}${item.text.body ? ` (${item.text.body})` : ''}`)
      : (item.text ? `Text: ${item.text}` : null);
    const web = typeof item.web === 'string' ? item.web : (item.website || item.url);
    lines = [
      name,
      desc || null,
      callStr ? `Call: ${callStr}` : null,
      textStr ? `Text: ${textStr}` : null,
      web ? `Online Chat / Web: ${web}` : null,
      item.spanish ? 'Spanish support available.' : null,
      'Source: 24/7 Confidential Crisis & Health Helpline.',
    ];
  } else if (cat === 'guide') {
    const title = item.title || item.name;
    const topic = item.category || item.topic || item.section;
    const desc = resolveText(item.summary) || resolveText(item.keyTakeaway) || resolveText(item.desc) || resolveText(item.description);
    const link = item.url || item.href || item.link;
    lines = [
      title,
      topic ? `Topic: ${topic}` : null,
      desc ? `Summary: ${desc}` : null,
      link ? `Resource Link: ${link}` : null,
      'Source: HarborPath Clinical & Educational Guide.',
    ];
  } else {
    // Standard treatment facility default
    const addr = formatAddress(item.address);
    lines = [
      item.name + (item.subname ? ` (${item.subname})` : ''),
      addr || null,
      item.phone ? t('card.text.phone', 'Phone: {phone}', { phone: item.phone }) : null,
      item.intake && item.intake !== item.phone ? t('card.text.intake', 'Intake: {phone}', { phone: item.intake }) : null,
      item.hotline && item.hotline !== item.phone ? t('card.hotline', '24/7 line {phone}', { phone: item.hotline }) : null,
      item.website || item.url || null,
      t('card.text.sourceSamhsa', 'Source: SAMHSA FindTreatment.gov. Call ahead to confirm services.'),
    ];
  }

  const textBody = lines.filter(Boolean).join('\n');
  if (includeDisclaimer) {
    return `${textBody}\n\n${CLINICAL_DISCLAIMER}`;
  }
  return textBody;
}

/**
 * Formats an array of saved items into a single unified plaintext document with
 * the clinical disclaimer placed clearly at the top.
 */
export function formatBookmarkListText(items) {
  const list = Array.isArray(items) ? items : (items ? [...items] : []);
  if (!list.length) return '';
  const itemBlocks = list.map((item) => formatBookmarkText(item, { includeDisclaimer: false })).join('\n\n---\n\n');
  return `${CLINICAL_DISCLAIMER}\n\n${itemBlocks}`;
}

/**
 * Groups items into 5 standard categories:
 * - all: complete list
 * - clinical: treatment, health-center, provider
 * - mutual-aid: peer support programs & fellowships
 * - crisis-hotline: 24/7 crisis and emotional support lines
 * - guide: clinical topic guides, harm reduction guides
 */
export function categorizeBookmarks(items) {
  const list = Array.isArray(items) ? items : (items ? [...items] : []);
  const groups = {
    all: list,
    clinical: [],
    'mutual-aid': [],
    'crisis-hotline': [],
    guide: [],
  };

  for (const item of list) {
    const cat = getBookmarkCategory(item);
    if (groups[cat]) {
      groups[cat].push(item);
    } else {
      groups.clinical.push(item);
    }
  }

  return groups;
}

/**
 * Pure filtering function for bookmarks.
 */
export function filterBookmarksByCategory(items, category = 'all') {
  const list = Array.isArray(items) ? items : (items ? [...items] : []);
  if (!category || category === 'all') return [...list];
  return list.filter((item) => getBookmarkCategory(item) === category);
}

// ---------------------------------------------------------------- View State
const INITIAL_VIEW_STATE = {
  category: 'all',
  searchQuery: '',
};

let currentViewState = { ...INITIAL_VIEW_STATE };
const viewStateListeners = new Set();

export function getBookmarksViewState() {
  return { ...currentViewState };
}

export function setBookmarksViewState(partial) {
  currentViewState = { ...currentViewState, ...partial };
  for (const fn of viewStateListeners) {
    try { fn(currentViewState); } catch { /* ignore */ }
  }
  return { ...currentViewState };
}

/**
 * Deterministic reset of UI state.
 */
export function resetBookmarksViewState() {
  currentViewState = { ...INITIAL_VIEW_STATE };
  for (const fn of viewStateListeners) {
    try { fn(currentViewState); } catch { /* ignore */ }
  }
  return { ...currentViewState };
}

export function onBookmarksViewStateChange(fn) {
  viewStateListeners.add(fn);
  return () => viewStateListeners.delete(fn);
}

// ---------------------------------------------------------------- Reusable Bookmark Button
/**
 * Builds a reusable toggle button ("Save" / "Saved" with bookmark icon,
 * aria-pressed, and live reactive state updates synced with state.js / subscribe).
 */
export function createBookmarkButton(item, { onToggle } = {}) {
  if (!item || item.id === undefined || item.id === null) {
    throw new Error('createBookmarkButton requires an item with a valid id');
  }

  const btn = h('button', {
    type: 'button',
    class: 'btn btn-small btn-ghost save-btn bookmark-toggle-btn',
  });

  const render = () => {
    const saved = isSaved(item.id);
    const itemName = item.name || item.title || t('bookmarks.item', 'Resource');
    btn.replaceChildren(
      icon(saved ? 'bookmark-fill' : 'bookmark'),
      ' ',
      saved ? t('card.saved', 'Saved') : t('card.save', 'Save'),
    );
    btn.setAttribute('aria-pressed', String(saved));
    btn.setAttribute(
      'aria-label',
      saved
        ? t('card.removeLabel', 'Remove {name} from saved list', { name: itemName })
        : t('card.saveLabel', 'Save {name}', { name: itemName }),
    );
    if (saved) {
      btn.classList.add('is-saved');
    } else {
      btn.classList.remove('is-saved');
    }
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nowSaved = toggleSaved(item);
    const itemName = item.name || item.title || t('bookmarks.item', 'Resource');
    render();
    announce(
      nowSaved
        ? t('card.savedAnnounce', '{name} saved', { name: itemName })
        : t('card.removedAnnounce', '{name} removed from saved list', { name: itemName }),
    );
    if (typeof onToggle === 'function') {
      onToggle(nowSaved, item);
    }
  });

  const unsubscribe = subscribe(() => {
    render();
  });
  btn.cleanup = unsubscribe;

  render();
  return btn;
}

// ---------------------------------------------------------------- Bookmark Card
/**
 * Builds accessible DOM card for any saved item type with title, tags/badges,
 * contact info, external link if any, and an accessible "Remove" button (aria-label).
 */
export function renderBookmarkCard(item, { onRemove, headingLevel = 2 } = {}) {
  if (!item) return h('div', { class: 'card card-empty' });

  const safeId = String(item.id || 'item').replace(/[^a-zA-Z0-9_-]/g, '-');
  const cat = getBookmarkCategory(item);
  const kind = String(item.kind || item.type || cat).toLowerCase();
  const itemName = item.name || item.title || t('bookmarks.item', 'Resource');
  const address = formatAddress(item.address ?? (item.street ? { street: item.street, city: item.city, state: item.state, zip: item.zip } : null));
  const subname = item.subname || (item.org && item.org.toLowerCase() !== itemName.toLowerCase() ? item.org : null) || item.alias || item.category || item.topic;
  const web = item.website || item.websiteUrl || item.detailsUrl || item.web || item.url || item.href;
  const phone = item.phone || (typeof item.call === 'object' ? item.call.number : item.call);
  const intake = item.intake;
  const hotline = item.hotline;
  const textInfo = typeof item.text === 'object' ? item.text : (item.text ? { number: item.text } : null);

  // Chips & Badges
  const chips = [];
  const addChip = (label, tone = 'care') => chips.push({ label, tone });

  if (cat === 'clinical') {
    if (item.kind === 'health-center' || item.kind === 'healthcenter') {
      addChip(t('hc.sliding', 'Sliding fee scale'), 'pay');
      addChip(item.lookAlike ? t('hc.lookAlike', 'FQHC look-alike') : t('hc.chc', 'Community health center'), 'care');
    } else if (item.kind === 'provider' || item.providerType) {
      const net = (item.providerType || item.type || '').toUpperCase();
      addChip(net ? `${net} Provider` : 'Provider', 'care');
    } else {
      addChip(t('treatment.badge', 'Treatment Facility'), 'care');
    }
  } else if (cat === 'mutual-aid') {
    const phil = resolveText(item.philosophyName) || item.philosophy;
    if (phil) addChip(String(phil), 'care');
    if (item.isMoudAffirming || item.moudStatus) addChip('MOUD-Affirming', 'pay');
  } else if (cat === 'crisis-hotline') {
    addChip('24/7 Free & Confidential', 'extra');
    if (item.spanish) addChip('Spanish Available', 'care');
  } else if (cat === 'guide') {
    addChip('Clinical Guide', 'neutral');
    if (item.category || item.topic) addChip(item.category || item.topic, 'care');
  }

  // Heading & Subtitle
  const headingEl = h(`h${headingLevel}`, { id: `bm-${safeId}`, class: 'facility-name bookmark-title' }, itemName);
  const headEl = h(
    'div',
    { class: 'facility-head' },
    h('div', null, headingEl, subname ? h('p', { class: 'subname' }, subname) : null),
  );

  // Address
  const addressEl = address
    ? h('p', { class: 'address' }, icon('pin'), ' ', address)
    : null;

  // Highlights List
  const chipsEl = chips.length > 0
    ? h(
        'ul',
        { class: 'chips', 'aria-label': t('card.highlights', 'Highlights') },
        chips.map((c) => h('li', { class: `chip chip-${c.tone}` }, c.label)),
      )
    : null;

  // Actions Container
  const actionsEl = h('div', { class: 'actions bookmark-actions' });

  // Call Button
  if (phone) {
    actionsEl.append(
      tel(phone, [icon('phone'), ' ', t('card.call', 'Call {phone}', { phone })], {
        class: 'btn btn-small btn-primary',
        'aria-label': t('card.callLabel', 'Call {name} at {phone}', { name: itemName, phone }),
      }),
    );
  }

  // Intake Call
  if (intake && digits(intake) !== digits(phone)) {
    actionsEl.append(
      tel(intake, [icon('phone'), ' ', t('card.intake', 'Intake {phone}', { phone: intake })], {
        class: 'btn btn-small btn-secondary',
        'aria-label': t('card.intakeLabel', 'Call intake for {name} at {phone}', { name: itemName, phone: intake }),
      }),
    );
  }

  // Hotline Call
  if (hotline && digits(hotline) !== digits(phone)) {
    actionsEl.append(
      tel(hotline, [icon('phone'), ' ', t('card.hotline', '24/7 line {phone}', { phone: hotline })], {
        class: 'btn btn-small btn-secondary',
        'aria-label': t('card.hotlineLabel', 'Call 24/7 line for {name} at {phone}', { name: itemName, phone: hotline }),
      }),
    );
  }

  // SMS Text
  if (textInfo && textInfo.number) {
    actionsEl.append(
      sms(textInfo.number, textInfo.body, [icon('message'), ' ', textInfo.label || `Text ${textInfo.number}`], {
        class: 'btn btn-small btn-secondary',
        'aria-label': `Text ${itemName} at ${textInfo.number}`,
      }),
    );
  }

  // External Website
  const validWeb = safeHref(web);
  if (validWeb) {
    actionsEl.append(
      h(
        'a',
        {
          class: 'btn btn-small btn-ghost',
          href: validWeb,
          target: '_blank',
          rel: 'noopener noreferrer',
          'aria-label': `${t('common.website', 'Website')}${t('common.websiteFor', ' for {name} (opens in a new tab)', { name: itemName })}`,
        },
        icon('globe'),
        ' ',
        t('common.website', 'Website'),
        h('span', { class: 'visually-hidden' }, t('common.websiteFor', ' for {name} (opens in a new tab)', { name: itemName })),
      ),
    );
  }

  // Directions
  if (address) {
    actionsEl.append(
      h(
        'a',
        {
          class: 'btn btn-small btn-ghost',
          href: directionsUrl(address),
          target: '_blank',
          rel: 'noopener noreferrer',
          'aria-label': t('card.directionsLabel', 'Directions to {name} (opens a map in a new tab)', { name: itemName }),
        },
        icon('directions'),
        ' ',
        t('card.directions', 'Directions'),
        h('span', { class: 'visually-hidden' }, t('card.directionsNewTab', ' (opens a map in a new tab)')),
      ),
    );
  }

  // Copy Details
  actionsEl.append(
    h(
      'button',
      {
        type: 'button',
        class: 'btn btn-small btn-ghost',
        'aria-label': t('card.copyLabel', 'Copy details for {name}', { name: itemName }),
        onclick: async (e) => {
          const btn = e.currentTarget;
          try {
            await navigator.clipboard.writeText(formatBookmarkText(item));
            btn.replaceChildren(icon('check'), ' ', t('card.copied', 'Copied'));
            announce(t('card.copiedAnnounce', 'Details for {name} copied', { name: itemName }));
            setTimeout(() => {
              btn.replaceChildren(icon('copy'), ' ', t('card.copy', 'Copy'));
            }, 2000);
          } catch {
            announce(t('common.copyUnavailable', 'Copy is not available in this browser'));
          }
        },
      },
      icon('copy'),
      ' ',
      t('card.copy', 'Copy'),
    ),
  );

  // Accessible Remove Button
  actionsEl.append(
    h(
      'button',
      {
        type: 'button',
        class: 'btn btn-small btn-ghost bookmark-remove-btn',
        'aria-label': t('card.removeLabel', 'Remove {name} from saved list', { name: itemName }),
        onclick: () => {
          toggleSaved(item);
          announce(t('card.removedAnnounce', '{name} removed from saved list', { name: itemName }));
          if (typeof onRemove === 'function') {
            onRemove(item);
          }
        },
      },
      icon('x'),
      ' ',
      t('bookmarks.remove', 'Remove'),
    ),
  );

  return h(
    'article',
    {
      class: 'card bookmark-card',
      'aria-labelledby': `bm-${safeId}`,
      dataset: { category: cat, kind },
    },
    headEl,
    addressEl,
    chipsEl,
    actionsEl,
  );
}

// ---------------------------------------------------------------- Full Interactive Organizer
/**
 * Builds the complete interactive Resource Organizer with category tabs,
 * real-time state synchronization, printable handout view, and quick copying.
 */
export function renderBookmarksOrganizer({ headingLevel = 2 } = {}) {
  const container = h('div', { class: 'bookmark-organizer', role: 'region', 'aria-label': t('bookmarks.title', 'Saved resources') });
  const tabsBar = h('div', { class: 'tabs bookmark-tabs', role: 'tablist', 'aria-label': 'Resource categories' });
  const toolsBar = h('div', { class: 'saved-tools bookmark-tools' });
  const listEl = h('div', { class: 'results-list bookmark-list', id: 'bookmark-results-list', 'aria-live': 'polite' });
  const disclaimerNotice = h(
    'div',
    { class: 'callout callout-disclaimer bookmark-disclaimer', role: 'note' },
    h('p', null, icon('alert'), ' ', CLINICAL_DISCLAIMER),
  );

  const CATEGORY_DEFS = [
    { id: 'all', label: t('bookmarks.all', 'All') },
    { id: 'clinical', label: t('bookmarks.clinical', 'Clinical') },
    { id: 'mutual-aid', label: t('bookmarks.mutualAid', 'Mutual Aid') },
    { id: 'crisis-hotline', label: t('bookmarks.crisisHotline', 'Crisis Lines') },
    { id: 'guide', label: t('bookmarks.guide', 'Guides') },
  ];

  function render() {
    clear(tabsBar);
    clear(toolsBar);
    clear(listEl);

    const allItems = [...state.saved.values()].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    const categorized = categorizeBookmarks(allItems);

    // Empty state when zero bookmarks overall
    if (!allItems.length) {
      listEl.append(
        h(
          'div',
          { class: 'empty' },
          icon('bookmark'),
          h('p', null, t('saved.empty', 'Nothing saved yet. Tap “Save” on any listing to keep it here while you compare.')),
        ),
      );
      return;
    }

    // Build Category Tabs
    for (const catDef of CATEGORY_DEFS) {
      const count = (categorized[catDef.id] || []).length;
      const isSelected = currentViewState.category === catDef.id;
      const tabBtn = h(
        'button',
        {
          type: 'button',
          class: `tab-btn bookmark-tab-btn ${isSelected ? 'is-active' : ''}`,
          role: 'tab',
          'aria-selected': String(isSelected),
          'aria-controls': 'bookmark-results-list',
          onclick: () => {
            setBookmarksViewState({ category: catDef.id });
            announce(`${catDef.label}: ${count} saved`);
            render();
          },
        },
        `${catDef.label} (${count})`,
      );
      tabsBar.append(tabBtn);
    }

    const currentItems = filterBookmarksByCategory(allItems, currentViewState.category);

    // Action tools
    toolsBar.append(
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-secondary',
          onclick: () => window.print(),
        },
        icon('printer'),
        ' ',
        t('saved.print', 'Print list'),
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-ghost',
          onclick: async () => {
            const summaryText = formatBookmarkListText(currentItems);
            try {
              await navigator.clipboard.writeText(summaryText);
              announce(t('saved.copied', 'Saved list copied'));
            } catch {
              announce(t('common.copyUnavailable', 'Copy is not available in this browser'));
            }
          },
        },
        icon('copy'),
        ' ',
        t('saved.copyAll', 'Copy all'),
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-ghost',
          onclick: () => {
            for (const item of allItems) {
              toggleSaved(item);
            }
            announce(t('saved.cleared', 'Saved list cleared'));
            render();
          },
        },
        icon('x'),
        ' ',
        t('saved.clear', 'Clear list'),
      ),
    );

    // Render Cards or Category Empty notice
    if (!currentItems.length) {
      listEl.append(
        h(
          'div',
          { class: 'empty' },
          h('p', null, t('bookmarks.emptyCategory', 'No saved resources in this category.')),
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small btn-secondary',
              onclick: () => {
                setBookmarksViewState({ category: 'all' });
                render();
              },
            },
            t('bookmarks.showAll', 'Show all resources'),
          ),
        ),
      );
    } else {
      for (const item of currentItems) {
        listEl.append(
          renderBookmarkCard(item, {
            headingLevel,
            onRemove: () => render(),
          }),
        );
      }
    }
  }

  // Subscribe to live state updates
  const unsubscribe = subscribe(() => {
    if (!container.isConnected && typeof container.isConnected === 'boolean' && container.isConnected === false) {
      return unsubscribe();
    }
    render();
  });
  container.cleanup = unsubscribe;

  render();

  container.append(disclaimerNotice, tabsBar, toolsBar, listEl);
  return container;
}
