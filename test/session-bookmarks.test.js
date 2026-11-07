import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  formatBookmarkText,
  formatBookmarkListText,
  renderBookmarkCard,
  createBookmarkButton,
  categorizeBookmarks,
  filterBookmarksByCategory,
  resetBookmarksViewState,
  getBookmarksViewState,
  setBookmarksViewState,
  onBookmarksViewStateChange,
  getBookmarkCategory,
  formatAddress,
  directionsUrl,
  renderBookmarksOrganizer,
  CLINICAL_DISCLAIMER,
} from '../public/js/components/sessionBookmarks.js';

import { state, toggleSaved, isSaved, wipeAll } from '../public/js/state.js';
import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import { runQuickExitResets } from '../public/js/app.js';

// ---------------------------------------------------------------- Lightweight DOM Mock
class MockClassList {
  constructor(node) {
    this.node = node;
  }
  _getClasses() {
    return (this.node.className || '').split(/\s+/).filter(Boolean);
  }
  add(...tokens) {
    const classes = new Set(this._getClasses());
    for (const t of tokens) classes.add(t);
    this.node.className = [...classes].join(' ');
  }
  remove(...tokens) {
    const removeSet = new Set(tokens);
    const classes = this._getClasses().filter((c) => !removeSet.has(c));
    this.node.className = classes.join(' ');
  }
  contains(token) {
    return this._getClasses().includes(token);
  }
}

class MockNode {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.className = '';
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.value = '';
    this.id = '';
    this._textContent = '';
    this.classList = new MockClassList(this);
    this.parent = null;
    this.isConnected = true;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'id') this.id = val;
  }

  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    if (k === 'id') return this.id || this.attributes.id || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  hasAttribute(k) {
    if (k === 'class') return Boolean(this.className || this.attributes.class);
    if (k === 'id') return Boolean(this.id || this.attributes.id);
    return Object.hasOwn(this.attributes, k);
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'class') this.className = '';
    if (k === 'id') this.id = '';
  }

  addEventListener(evt, fn) {
    this.listeners[evt] = fn;
  }

  removeEventListener(evt) {
    delete this.listeners[evt];
  }

  dispatchEvent(evt, data = {}) {
    const name = typeof evt === 'string' ? evt : evt?.type;
    const fn = this.listeners[name];
    if (typeof fn === 'function') {
      fn({ target: this, currentTarget: this, stopPropagation: () => {}, preventDefault: () => {}, ...data });
    }
  }

  click() {
    this.dispatchEvent('click');
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        const textNode = new MockNode('#text');
        textNode._textContent = String(item);
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx !== -1) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      if (!node || !(node instanceof MockNode)) return;
      if (matchesSimple(node, selector)) results.push(node);
      for (const child of node.children) {
        if (child instanceof MockNode) walk(child);
      }
    };
    for (const child of this.children) {
      if (child instanceof MockNode) walk(child);
    }
    return results;
  }
}

function matchesSimple(node, selector) {
  if (!selector) return false;
  selector = selector.trim();

  // ID selector #foo
  if (selector.startsWith('#')) {
    return node.id === selector.slice(1);
  }
  // Class selector .foo or .foo.bar
  if (selector.startsWith('.')) {
    const classes = selector.split('.').filter(Boolean);
    return classes.every((cls) => node.classList.contains(cls));
  }
  // Compound tag[attr op "val"] or [attr op "val"]
  const attrMatch = selector.match(/^([a-zA-Z0-9_-]+)?\[([a-zA-Z0-9_-]+)(?:([*^$]?=)["']?([^"']*)["']?)?\]$/);
  if (attrMatch) {
    const [, tag, attr, op, val] = attrMatch;
    if (tag && node.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    if (val === undefined) return node.hasAttribute(attr);
    const attrVal = node.getAttribute(attr);
    if (attrVal === null) return false;
    if (op === '*=') return attrVal.includes(val);
    if (op === '^=') return attrVal.startsWith(val);
    if (op === '$=') return attrVal.endsWith(val);
    return attrVal === val;
  }
  // Compound tag.class
  const tagClassMatch = selector.match(/^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_.-]+)$/);
  if (tagClassMatch) {
    const [, tag, classesStr] = tagClassMatch;
    if (node.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    const classes = classesStr.split('.').filter(Boolean);
    return classes.every((cls) => node.classList.contains(cls));
  }
  // Tag selector
  if (/^[A-Za-z0-9-]+$/.test(selector)) {
    return node.tagName.toLowerCase() === selector.toLowerCase();
  }
  return false;
}

let lastCopiedText = null;
let lastPrinted = false;

function setupMockEnvironment() {
  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: (id) => null,
  };
  try {
    if (globalThis.navigator) {
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        value: {
          writeText: async (text) => {
            lastCopiedText = text;
          },
        },
        configurable: true,
        writable: true,
      });
    } else {
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        clipboard: {
          writeText: async (text) => {
            lastCopiedText = text;
          },
        },
      };
    }
  } catch (_) {}
  globalThis.window = {
    print: () => {
      lastPrinted = true;
    },
  };
}

// ---------------------------------------------------------------- Fixtures
const SAMPLE_TREATMENT = {
  id: 'samhsa-101',
  kind: 'treatment',
  name: 'Hope Valley Recovery Center',
  subname: 'Adult Outpatient & MAT Clinic',
  address: {
    street: '123 Healing Way',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
  },
  phone: '206-555-0100',
  intake: '206-555-0101',
  hotline: '206-555-0199',
  website: 'https://hopevalleyrecovery.example.org',
};

const SAMPLE_HEALTH_CENTER = {
  id: 'hrsa-202',
  kind: 'health-center',
  name: 'Community Health Clinic South',
  org: 'Harbor Community Health Care Inc',
  street: '456 Wellness Blvd',
  city: 'Portland',
  state: 'OR',
  zip: '97201',
  phone: '503-555-0200',
  website: 'https://communityhealth.example.org',
  slidingFee: true,
  chc: true,
};

const SAMPLE_PROVIDER = {
  id: 'va-303',
  kind: 'provider',
  providerType: 'va',
  name: 'Puget Sound VA Medical Center',
  alias: 'American Lake VA',
  address: {
    street1: '9600 Veterans Drive SW',
    city: 'Tacoma',
    state: 'WA',
    zip: '98493',
  },
  phone: '253-582-8440',
  website: 'https://www.va.gov/puget-sound-health-care/',
};

const SAMPLE_MUTUAL_AID = {
  id: 'smart-recovery-404',
  kind: 'mutual-aid',
  name: 'SMART Recovery',
  acronym: 'SMART',
  philosophy: 'Secular / Cognitive-Behavioral',
  description: 'Evidence-based 4-point program using CBT and REBT principles.',
  keyTools: 'Urge Log, ABC Model, Cost-Benefit Analysis',
  isMoudAffirming: true,
  moudStatus: 'explicitly_affirming',
  websiteUrl: 'https://meetings.smartrecovery.org/',
};

const SAMPLE_HOTLINE = {
  id: '988-lifeline',
  kind: 'hotline',
  name: '988 Suicide & Crisis Lifeline',
  desc: 'Call, text, or chat 24/7 for mental health, emotional, or substance use crisis.',
  call: { number: '988', label: 'Call 988' },
  text: { number: '988', body: 'AYUDA', label: 'Text 988' },
  web: 'https://chat.988lifeline.org/',
  spanish: true,
};

const SAMPLE_GUIDE = {
  id: 'guide-moud-start',
  kind: 'guide',
  title: 'Starting Buprenorphine: What to Expect',
  category: 'Medication Education',
  summary: 'Clinical steps for starting buprenorphine smoothly without precipitated withdrawal.',
  url: '#/medications',
};

// ---------------------------------------------------------------- Tests
test('Architecture & Zero-Dependency Audit', () => {
  const componentPath = path.resolve('public/js/components/sessionBookmarks.js');
  const code = fs.readFileSync(componentPath, 'utf8');

  // Strict DOM security rules: ZERO innerHTML, outerHTML, insertAdjacentHTML, or style=
  assert.doesNotMatch(code, /\.innerHTML\b/, 'Forbidden .innerHTML found in sessionBookmarks.js');
  assert.doesNotMatch(code, /\.outerHTML\b/, 'Forbidden .outerHTML found in sessionBookmarks.js');
  assert.doesNotMatch(code, /\.insertAdjacentHTML\b/, 'Forbidden .insertAdjacentHTML found in sessionBookmarks.js');
  assert.doesNotMatch(code, /style\s*=/, 'Forbidden inline style= attribute found in sessionBookmarks.js');

  // Zero PII & Zero direct persistent storage leakage
  assert.doesNotMatch(code, /\blocalStorage\b/, 'sessionBookmarks must not access localStorage directly');
  assert.doesNotMatch(code, /\bsessionStorage\b/, 'sessionBookmarks must not access sessionStorage directly');
  assert.doesNotMatch(code, /\bdocument\.cookie\b/, 'sessionBookmarks must not access cookies directly');

  // Zero third-party / npm dependencies
  assert.doesNotMatch(code, /from\s+['"][^./]/, 'sessionBookmarks must only use relative ES module imports');
});

test('Clinical Educational Disclaimer constant is standard and complete', () => {
  assert.equal(
    CLINICAL_DISCLAIMER,
    'HarborPath Resource Summary — Not medical advice. In an emergency dial 911 or 988.',
  );
});

test('formatBookmarkText formats all 6 resource types with educational disclaimer', () => {
  // 1. Treatment Facility
  const tText = formatBookmarkText(SAMPLE_TREATMENT);
  assert.match(tText, /Hope Valley Recovery Center \(Adult Outpatient & MAT Clinic\)/);
  assert.match(tText, /123 Healing Way, Seattle, WA 98101/);
  assert.match(tText, /Phone: 206-555-0100/);
  assert.match(tText, /Intake: 206-555-0101/);
  assert.match(tText, /24\/7 line 206-555-0199/);
  assert.match(tText, /https:\/\/hopevalleyrecovery\.example\.org/);
  assert.match(tText, /Source: SAMHSA FindTreatment\.gov/);
  assert.match(tText, new RegExp(CLINICAL_DISCLAIMER));

  // 2. Health Center
  const hcText = formatBookmarkText(SAMPLE_HEALTH_CENTER);
  assert.match(hcText, /Community Health Clinic South/);
  assert.match(hcText, /Operated by Harbor Community Health Care Inc/);
  assert.match(hcText, /456 Wellness Blvd, Portland, OR 97201/);
  assert.match(hcText, /Phone: 503-555-0200/);
  assert.match(hcText, /Source: HRSA Health Center Program\. Sliding fee scale available\./);
  assert.match(hcText, new RegExp(CLINICAL_DISCLAIMER));

  // 3. Provider (VA)
  const pText = formatBookmarkText(SAMPLE_PROVIDER);
  assert.match(pText, /Puget Sound VA Medical Center/);
  assert.match(pText, /American Lake VA/);
  assert.match(pText, /9600 Veterans Drive SW, Tacoma, WA 98493/);
  assert.match(pText, /Source: U\.S\. Department of Veterans Affairs \(VA\.gov\)\./);
  assert.match(pText, new RegExp(CLINICAL_DISCLAIMER));

  // 4. Mutual Aid
  const maText = formatBookmarkText(SAMPLE_MUTUAL_AID);
  assert.match(maText, /SMART Recovery \(SMART\)/);
  assert.match(maText, /Philosophy \/ Pathway: Secular \/ Cognitive-Behavioral/);
  assert.match(maText, /Key Tools: Urge Log, ABC Model/);
  assert.match(maText, /MOUD-Affirming: Prescribed medications affirmed and supported\./);
  assert.match(maText, /Meetings & Info: https:\/\/meetings\.smartrecovery\.org\//);
  assert.match(maText, new RegExp(CLINICAL_DISCLAIMER));

  // 5. Crisis Hotline
  const hText = formatBookmarkText(SAMPLE_HOTLINE);
  assert.match(hText, /988 Suicide & Crisis Lifeline/);
  assert.match(hText, /Call: Call 988 \(988\)/);
  assert.match(hText, /Text: Text 988/);
  assert.match(hText, /Online Chat \/ Web: https:\/\/chat\.988lifeline\.org\//);
  assert.match(hText, /Spanish support available\./);
  assert.match(hText, new RegExp(CLINICAL_DISCLAIMER));

  // 6. Clinical Guide
  const gText = formatBookmarkText(SAMPLE_GUIDE);
  assert.match(gText, /Starting Buprenorphine: What to Expect/);
  assert.match(gText, /Topic: Medication Education/);
  assert.match(gText, /Summary: Clinical steps for starting buprenorphine smoothly/);
  assert.match(gText, /Resource Link: #\/medications/);
  assert.match(gText, new RegExp(CLINICAL_DISCLAIMER));

  // Test disclaimer suppression option
  const rawNoDisclaimer = formatBookmarkText(SAMPLE_TREATMENT, { includeDisclaimer: false });
  assert.doesNotMatch(rawNoDisclaimer, new RegExp(CLINICAL_DISCLAIMER));
});

test('formatBookmarkListText formats multiple items with unified disclaimer header', () => {
  const items = [SAMPLE_TREATMENT, SAMPLE_MUTUAL_AID, SAMPLE_HOTLINE];
  const listText = formatBookmarkListText(items);

  assert.ok(listText.startsWith(CLINICAL_DISCLAIMER), 'Unified disclaimer must head the summary text');
  assert.match(listText, /Hope Valley Recovery Center/);
  assert.match(listText, /SMART Recovery/);
  assert.match(listText, /988 Suicide & Crisis Lifeline/);
  assert.match(listText, /---/, 'Items should be separated by dividers');
  assert.equal(listText.split(CLINICAL_DISCLAIMER).length, 2, 'Disclaimer appears once at the top of the list');
});

test('categorizeBookmarks groups resources into all, clinical, mutual-aid, crisis-hotline, and guide', () => {
  const allItems = [
    SAMPLE_TREATMENT,
    SAMPLE_HEALTH_CENTER,
    SAMPLE_PROVIDER,
    SAMPLE_MUTUAL_AID,
    SAMPLE_HOTLINE,
    SAMPLE_GUIDE,
  ];

  const grouped = categorizeBookmarks(allItems);

  assert.equal(grouped.all.length, 6);
  assert.equal(grouped.clinical.length, 3);
  assert.equal(grouped['mutual-aid'].length, 1);
  assert.equal(grouped['crisis-hotline'].length, 1);
  assert.equal(grouped.guide.length, 1);

  assert.ok(grouped.clinical.includes(SAMPLE_TREATMENT));
  assert.ok(grouped.clinical.includes(SAMPLE_HEALTH_CENTER));
  assert.ok(grouped.clinical.includes(SAMPLE_PROVIDER));
  assert.ok(grouped['mutual-aid'].includes(SAMPLE_MUTUAL_AID));
  assert.ok(grouped['crisis-hotline'].includes(SAMPLE_HOTLINE));
  assert.ok(grouped.guide.includes(SAMPLE_GUIDE));
});

test('filterBookmarksByCategory performs pure, deterministic filtering', () => {
  const items = [SAMPLE_TREATMENT, SAMPLE_HEALTH_CENTER, SAMPLE_MUTUAL_AID, SAMPLE_HOTLINE, SAMPLE_GUIDE];

  // All
  const all = filterBookmarksByCategory(items, 'all');
  assert.equal(all.length, 5);
  assert.notEqual(all, items, 'Returns shallow copy for purity');

  // Clinical
  const clinical = filterBookmarksByCategory(items, 'clinical');
  assert.equal(clinical.length, 2);
  assert.ok(clinical.every((i) => getBookmarkCategory(i) === 'clinical'));
  assert.ok(clinical.every((i) => ['treatment', 'health-center', 'provider'].includes(i.kind)));

  // Mutual Aid
  const ma = filterBookmarksByCategory(items, 'mutual-aid');
  assert.equal(ma.length, 1);
  assert.equal(ma[0].id, SAMPLE_MUTUAL_AID.id);

  // Crisis Hotline
  const crisis = filterBookmarksByCategory(items, 'crisis-hotline');
  assert.equal(crisis.length, 1);
  assert.equal(crisis[0].id, SAMPLE_HOTLINE.id);

  // Guide
  const guides = filterBookmarksByCategory(items, 'guide');
  assert.equal(guides.length, 1);
  assert.equal(guides[0].id, SAMPLE_GUIDE.id);

  // Edge cases: null / undefined / empty
  assert.deepEqual(filterBookmarksByCategory(null, 'clinical'), []);
  assert.deepEqual(filterBookmarksByCategory([], 'all'), []);
});

test('createBookmarkButton renders accessible toggle button with reactive state updates', () => {
  setupMockEnvironment();
  wipeAll();

  assert.equal(isSaved(SAMPLE_TREATMENT.id), false);

  const btn = createBookmarkButton(SAMPLE_TREATMENT);
  assert.equal(btn.tagName, 'BUTTON');
  assert.equal(btn.getAttribute('aria-pressed'), 'false');
  assert.match(btn.getAttribute('aria-label'), /Save Hope Valley Recovery Center/);
  assert.match(btn.textContent, /Save/);

  // Click to save
  btn.click();
  assert.equal(isSaved(SAMPLE_TREATMENT.id), true);
  assert.equal(btn.getAttribute('aria-pressed'), 'true');
  assert.match(btn.getAttribute('aria-label'), /Remove Hope Valley Recovery Center from saved list/);
  assert.match(btn.textContent, /Saved/);

  // Click again to un-save
  btn.click();
  assert.equal(isSaved(SAMPLE_TREATMENT.id), false);
  assert.equal(btn.getAttribute('aria-pressed'), 'false');
  assert.match(btn.textContent, /Save/);

  // Test reactive synchronization from external state change
  toggleSaved(SAMPLE_TREATMENT);
  // Reactive subscriber should have updated btn
  assert.equal(btn.getAttribute('aria-pressed'), 'true');
  assert.match(btn.textContent, /Saved/);

  // External state toggle again removes it and notifies subscriber
  toggleSaved(SAMPLE_TREATMENT);
  assert.equal(btn.getAttribute('aria-pressed'), 'false');
  assert.match(btn.textContent, /Save/);

  if (typeof btn.cleanup === 'function') btn.cleanup();
});

test('renderBookmarkCard constructs accessible WCAG 2.2 AA card with remove and copy actions', async () => {
  setupMockEnvironment();
  wipeAll();
  toggleSaved(SAMPLE_TREATMENT);

  let removedItem = null;
  const card = renderBookmarkCard(SAMPLE_TREATMENT, {
    headingLevel: 3,
    onRemove: (item) => {
      removedItem = item;
    },
  });

  assert.equal(card.tagName, 'ARTICLE');
  assert.equal(card.classList.contains('bookmark-card'), true);
  assert.equal(card.getAttribute('aria-labelledby'), `bm-${SAMPLE_TREATMENT.id}`);

  // Heading
  const h3 = card.querySelector('h3');
  assert.ok(h3, 'Must render h3 heading when headingLevel: 3 is requested');
  assert.equal(h3.id, `bm-${SAMPLE_TREATMENT.id}`);
  assert.equal(h3.textContent, SAMPLE_TREATMENT.name);

  // Subname & Address
  assert.match(card.textContent, /Adult Outpatient & MAT Clinic/);
  assert.match(card.textContent, /123 Healing Way, Seattle, WA 98101/);

  // Action links
  const callBtn = card.querySelector('a.btn-primary');
  assert.ok(callBtn, 'Call button should be rendered');
  assert.equal(callBtn.getAttribute('href'), 'tel:2065550100');

  const intakeBtn = card.querySelector('a.btn-secondary');
  assert.ok(intakeBtn, 'Intake call button should be rendered');
  assert.equal(intakeBtn.getAttribute('href'), 'tel:2065550101');

  const webLink = card.querySelector('a[href="https://hopevalleyrecovery.example.org"]');
  assert.ok(webLink, 'Website link should be present');
  assert.equal(webLink.getAttribute('target'), '_blank');
  assert.equal(webLink.getAttribute('rel'), 'noopener noreferrer');

  const directionsLink = card.querySelector('a[href*="maps"]');
  assert.ok(directionsLink, 'Directions map link should be present');

  // Copy button
  const copyBtn = card.querySelector('button[aria-label*="Copy"]');
  assert.ok(copyBtn, 'Copy button should be present');
  await copyBtn.click();
  assert.ok(lastCopiedText, 'Clipboard copy was invoked');
  assert.match(lastCopiedText, /Hope Valley Recovery Center/);
  assert.match(lastCopiedText, new RegExp(CLINICAL_DISCLAIMER), 'Copied text includes clinical disclaimer');

  // Remove button
  const removeBtn = card.querySelector('.bookmark-remove-btn');
  assert.ok(removeBtn, 'Remove button must exist');
  assert.equal(removeBtn.getAttribute('aria-label'), 'Remove Hope Valley Recovery Center from saved list');

  removeBtn.click();
  assert.equal(isSaved(SAMPLE_TREATMENT.id), false, 'Item must be removed from state.saved');
  assert.equal(removedItem, SAMPLE_TREATMENT, 'onRemove callback was executed with item');
});

test('renderBookmarkCard adapts to mutual aid, hotline, and guide resources properly', () => {
  setupMockEnvironment();

  // Mutual Aid Card
  const maCard = renderBookmarkCard(SAMPLE_MUTUAL_AID);
  assert.match(maCard.textContent, /SMART Recovery/);
  assert.match(maCard.textContent, /MOUD-Affirming/);
  const maWeb = maCard.querySelector('a[href="https://meetings.smartrecovery.org/"]');
  assert.ok(maWeb, 'Website link for mutual aid exists');

  // Hotline Card
  const hCard = renderBookmarkCard(SAMPLE_HOTLINE);
  assert.match(hCard.textContent, /988 Suicide & Crisis Lifeline/);
  assert.match(hCard.textContent, /24\/7 Free & Confidential/);
  assert.match(hCard.textContent, /Spanish Available/);
  const hCall = hCard.querySelector('a[href="tel:988"]');
  assert.ok(hCall, 'Phone link to 988 exists');
  const hSms = hCard.querySelector('a[href*="sms:988"]');
  assert.ok(hSms, 'SMS link to 988 exists');

  // Guide Card
  const gCard = renderBookmarkCard(SAMPLE_GUIDE);
  assert.match(gCard.textContent, /Starting Buprenorphine: What to Expect/);
  assert.match(gCard.textContent, /Clinical Guide/);
  assert.match(gCard.textContent, /Medication Education/);
});

test('resetBookmarksViewState deterministically resets view state to default', () => {
  // Alter view state
  setBookmarksViewState({ category: 'mutual-aid', searchQuery: 'SMART' });
  let stateSnapshot = getBookmarksViewState();
  assert.equal(stateSnapshot.category, 'mutual-aid');
  assert.equal(stateSnapshot.searchQuery, 'SMART');

  let changeNotified = false;
  const unsub = onBookmarksViewStateChange((s) => {
    changeNotified = true;
  });

  // Reset
  const resetResult = resetBookmarksViewState();
  assert.equal(resetResult.category, 'all');
  assert.equal(resetResult.searchQuery, '');
  assert.equal(changeNotified, true);

  stateSnapshot = getBookmarksViewState();
  assert.equal(stateSnapshot.category, 'all');
  assert.equal(stateSnapshot.searchQuery, '');

  unsub();
});

test('renderBookmarksOrganizer mounts category tabs, disclaimer, and manages live bookmarks list', async () => {
  setupMockEnvironment();
  wipeAll();
  resetBookmarksViewState();

  // Populate multiple bookmarks
  toggleSaved(SAMPLE_TREATMENT);
  toggleSaved(SAMPLE_MUTUAL_AID);
  toggleSaved(SAMPLE_HOTLINE);
  toggleSaved(SAMPLE_GUIDE);

  const organizer = renderBookmarksOrganizer();
  assert.equal(organizer.classList.contains('bookmark-organizer'), true);

  // Check clinical disclaimer callout
  const disclaimerCallout = organizer.querySelector('.bookmark-disclaimer');
  assert.ok(disclaimerCallout, 'Clinical disclaimer callout banner must be present');
  assert.match(disclaimerCallout.textContent, new RegExp(CLINICAL_DISCLAIMER));

  // Check category tabs
  const tabButtons = organizer.querySelectorAll('.bookmark-tab-btn');
  assert.equal(tabButtons.length, 5, 'Should have 5 tabs: All, Clinical, Mutual Aid, Crisis Lines, Guides');
  assert.match(tabButtons[0].textContent, /All \(4\)/);
  assert.match(tabButtons[1].textContent, /Clinical \(1\)/);
  assert.match(tabButtons[2].textContent, /Mutual Aid \(1\)/);
  assert.match(tabButtons[3].textContent, /Crisis Lines \(1\)/);
  assert.match(tabButtons[4].textContent, /Guides \(1\)/);

  // Cards rendered initially (all 4)
  let cards = organizer.querySelectorAll('.bookmark-card');
  assert.equal(cards.length, 4);

  // Switch tab to 'Clinical'
  tabButtons[1].click();
  assert.equal(getBookmarksViewState().category, 'clinical');
  cards = organizer.querySelectorAll('.bookmark-card');
  assert.equal(cards.length, 1);
  assert.match(cards[0].textContent, /Hope Valley Recovery Center/);

  // Switch tab to 'Mutual Aid'
  tabButtons[2].click();
  assert.equal(getBookmarksViewState().category, 'mutual-aid');
  cards = organizer.querySelectorAll('.bookmark-card');
  assert.equal(cards.length, 1);
  assert.match(cards[0].textContent, /SMART Recovery/);

  // Test Print list button
  lastPrinted = false;
  const printBtn = organizer.querySelector('.btn-secondary');
  assert.ok(printBtn);
  assert.match(printBtn.textContent, /Print list/);
  printBtn.click();
  assert.equal(lastPrinted, true, 'Print action was triggered');

  // Test Copy all button
  lastCopiedText = null;
  const copyAllBtn = organizer.querySelectorAll('.btn-ghost').find((b) => b.textContent.includes('Copy all'));
  assert.ok(copyAllBtn);
  await copyAllBtn.click();
  assert.ok(lastCopiedText, 'Copy all was triggered');
  assert.match(lastCopiedText, new RegExp(CLINICAL_DISCLAIMER), 'Copy all includes clinical disclaimer');
  assert.match(lastCopiedText, /SMART Recovery/);

  // Test Clear list button
  const clearListBtn = organizer.querySelectorAll('.btn-ghost').find((b) => b.textContent.includes('Clear list'));
  assert.ok(clearListBtn);
  clearListBtn.click();
  assert.equal(state.saved.size, 0, 'Bookmarks cleared');

  // Empty state should be visible
  assert.match(organizer.textContent, /Nothing saved yet/);

  if (typeof organizer.cleanup === 'function') organizer.cleanup();
});

test('bilingual rendering: Spanish locale switches button text, badges, and announcements', () => {
  setupMockEnvironment();
  wipeAll();

  useDictionary('es', es);
  try {
    const btn = createBookmarkButton(SAMPLE_TREATMENT);
    assert.match(btn.textContent, /Guardar/);
    assert.equal(btn.getAttribute('aria-pressed'), 'false');

    btn.click();
    assert.match(btn.textContent, /Guardado/);
    assert.equal(btn.getAttribute('aria-pressed'), 'true');
    assert.match(btn.getAttribute('aria-label'), /Quitar .* de la lista de guardados/);

    const card = renderBookmarkCard(SAMPLE_HEALTH_CENTER);
    assert.match(card.textContent, /Escala móvil de tarifas/);
    const removeBtn = card.querySelector('.bookmark-remove-btn');
    assert.ok(removeBtn);
    assert.match(removeBtn.textContent, /Quitar/);

    if (typeof btn.cleanup === 'function') btn.cleanup();
  } finally {
    useDictionary('en', {});
  }
});

test('createBookmarkButton validates input and rejects missing id', () => {
  setupMockEnvironment();
  assert.throws(() => createBookmarkButton(null), /createBookmarkButton requires an item with a valid id/);
  assert.throws(() => createBookmarkButton({}), /createBookmarkButton requires an item with a valid id/);
  assert.throws(() => createBookmarkButton({ id: null }), /createBookmarkButton requires an item with a valid id/);
});

test('formatAddress and directionsUrl handle edge cases (strings, objects, nulls)', () => {
  // formatAddress
  assert.equal(formatAddress(null), '');
  assert.equal(formatAddress(''), '');
  assert.equal(formatAddress(' 100 Main St, Seattle, WA '), '100 Main St, Seattle, WA');
  assert.equal(
    formatAddress({ street: '123 Pine St', city: 'Seattle', state: 'WA', zip: '98101' }),
    '123 Pine St, Seattle, WA 98101',
  );
  assert.equal(
    formatAddress({ street1: '789 Elm', street2: 'Suite 4', city: 'Denver', state: 'CO', zip: '80202' }),
    '789 Elm, Suite 4, Denver, CO 80202',
  );

  // directionsUrl
  assert.equal(directionsUrl(null), null);
  assert.equal(directionsUrl(''), null);
  const url = directionsUrl('123 Pine St, Seattle, WA');
  assert.ok(url.includes('123%20Pine%20St%2C%20Seattle%2C%20WA'));
  assert.ok(url.includes('maps'));
});

test('quick exit resets session bookmarks view state via runQuickExitResets', async () => {
  setBookmarksViewState({ category: 'crisis-hotline', searchQuery: '988' });
  assert.equal(getBookmarksViewState().category, 'crisis-hotline');

  runQuickExitResets();

  // Allow dynamic import to settle
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.equal(getBookmarksViewState().category, 'all');
  assert.equal(getBookmarksViewState().searchQuery, '');
});

