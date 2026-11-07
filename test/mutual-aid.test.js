import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { useDictionary } from '../public/js/i18n.js';

useDictionary('en', {});

import {
  MUTUAL_AID_PHILOSOPHIES,
  MUTUAL_AID_PROGRAMS,
  filterMutualAidPrograms,
  getMutualAidState,
  resetMutualAidState,
  mutualAidFinder,
} from '../public/js/components/mutualAidFinder.js';

import { supportView } from '../public/js/views/guides.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const finderFilePath = path.resolve(here, '../public/js/components/mutualAidFinder.js');

// ============================================================================
// Lightweight Mock DOM for Node 20+ built-in test runner
// ============================================================================

class MockClassList {
  constructor(node) {
    this.node = node;
  }
  _getClasses() {
    return (this.node.className || '').split(/\s+/).filter(Boolean);
  }
  _setClasses(classes) {
    this.node.className = classes.join(' ');
  }
  add(...tokens) {
    const list = this._getClasses();
    for (const t of tokens) {
      if (t && !list.includes(t)) list.push(t);
    }
    this._setClasses(list);
  }
  remove(...tokens) {
    const list = this._getClasses().filter((c) => !tokens.includes(c));
    this._setClasses(list);
  }
  contains(token) {
    return this._getClasses().includes(token);
  }
  toggle(token, force) {
    const exists = this.contains(token);
    const shouldAdd = force !== undefined ? Boolean(force) : !exists;
    if (shouldAdd) this.add(token);
    else this.remove(token);
    return shouldAdd;
  }
}

function splitSelectorParts(selector) {
  const parts = [];
  let current = '';
  let inBracket = false;
  let inQuotes = false;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === '"' || ch === "'") inQuotes = !inQuotes;
    else if (ch === '[') inBracket = true;
    else if (ch === ']') inBracket = false;

    if (/\s/.test(ch) && !inBracket && !inQuotes) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
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
    this.checked = false;
    this.id = '';
    this._textContent = '';
    this.classList = new MockClassList(this);
    this.parent = null;
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
      fn({ target: this, currentTarget: this, preventDefault: () => {}, ...data });
    }
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

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx !== -1) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  _queryDirect(selector) {
    const results = [];
    const walk = (node) => {
      if (!node || !(node instanceof MockNode)) return;
      if (matchesSelector(node, selector)) results.push(node);
      for (const child of node.children) {
        if (child instanceof MockNode) walk(child);
      }
    };
    for (const child of this.children) {
      if (child instanceof MockNode) walk(child);
    }
    return results;
  }

  querySelectorAll(selector) {
    const parts = splitSelectorParts(selector);
    if (parts.length > 1) {
      let currentNodes = [this];
      for (const part of parts) {
        const nextNodes = [];
        for (const n of currentNodes) {
          nextNodes.push(...n._queryDirect(part));
        }
        currentNodes = nextNodes;
      }
      return currentNodes;
    }
    return this._queryDirect(selector);
  }
}

function matchesSelector(node, selector) {
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
  // Compound tag[attr="val"] or [attr="val"] or tag[attr]
  const tagAttrMatch = selector.match(/^([a-zA-Z0-9_-]+)?\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]$/);
  if (tagAttrMatch) {
    const [, tag, attr, val] = tagAttrMatch;
    if (tag && node.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    if (val !== undefined) return node.getAttribute(attr) === val;
    return node.hasAttribute(attr);
  }
  // Compound tag.class
  const tagClassMatch = selector.match(/^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_.-]+)$/);
  if (tagClassMatch) {
    const [, tag, classesStr] = tagClassMatch;
    if (node.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    const classes = classesStr.split('.').filter(Boolean);
    return classes.every((cls) => node.classList.contains(cls));
  }
  // Tag selector e.g. TABLE, ARTICLE, BUTTON
  if (/^[A-Za-z0-9-]+$/.test(selector)) {
    return node.tagName.toLowerCase() === selector.toLowerCase();
  }
  return false;
}

function setupMockDOM() {
  const root = new MockNode('div');
  const announcer = new MockNode('div');
  announcer.id = 'announcer';
  root.append(announcer);

  const mockDoc = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: (id) => (id === 'announcer' ? announcer : root.querySelector(`#${id}`)),
    body: root,
  };

  globalThis.document = mockDoc;
  globalThis.Node = MockNode;
  return { mockDoc, root, announcer };
}

// ============================================================================
// 1. Taxonomy & Philosophies Schema Integrity Tests
// ============================================================================

test('MUTUAL_AID_PHILOSOPHIES exports comprehensive 4-philosophy taxonomy + family allies', () => {
  assert.ok(Array.isArray(MUTUAL_AID_PHILOSOPHIES), 'MUTUAL_AID_PHILOSOPHIES must be an array');
  assert.ok(MUTUAL_AID_PHILOSOPHIES.length >= 5, 'Must contain at least 5 philosophy categories');

  const expectedIds = ['secular', 'mindfulness', 'moud_affirming', 'twelve_step', 'family_allies'];
  const actualIds = MUTUAL_AID_PHILOSOPHIES.map((p) => p.id);

  for (const id of expectedIds) {
    assert.ok(actualIds.includes(id), `Missing required philosophy ID: ${id}`);
    const phil = MUTUAL_AID_PHILOSOPHIES[id];
    assert.ok(phil, `Must be accessible as dictionary property: MUTUAL_AID_PHILOSOPHIES.${id}`);
    assert.equal(phil.id, id);

    // Validate bilingual name
    assert.ok(phil.name && typeof phil.name === 'object', `${id} name must be an object`);
    assert.ok(phil.name.en && phil.name.en.length > 0, `${id} name.en must not be empty`);
    assert.ok(phil.name.es && phil.name.es.length > 0, `${id} name.es must not be empty`);

    // Validate tagLine
    assert.ok(phil.tagLine && typeof phil.tagLine === 'object', `${id} tagLine must be an object`);
    assert.ok(phil.tagLine.en && phil.tagLine.en.length > 0, `${id} tagLine.en must not be empty`);
    assert.ok(phil.tagLine.es && phil.tagLine.es.length > 0, `${id} tagLine.es must not be empty`);

    // Validate description
    assert.ok(phil.description && typeof phil.description === 'object', `${id} description must be an object`);
    assert.ok(phil.description.en && phil.description.en.length > 0, `${id} description.en must not be empty`);
    assert.ok(phil.description.es && phil.description.es.length > 0, `${id} description.es must not be empty`);

    // Validate keyPrinciples
    assert.ok(phil.keyPrinciples && typeof phil.keyPrinciples === 'object', `${id} keyPrinciples must be an object`);
    assert.ok(phil.keyPrinciples.en && phil.keyPrinciples.en.length > 0, `${id} keyPrinciples.en must not be empty`);
    assert.ok(phil.keyPrinciples.es && phil.keyPrinciples.es.length > 0, `${id} keyPrinciples.es must not be empty`);
  }
});

// ============================================================================
// 2. Program Catalog & Clinical Dimensions Tests
// ============================================================================

test('MUTUAL_AID_PROGRAMS exports 12 structured programs with complete clinical fields', () => {
  assert.ok(Array.isArray(MUTUAL_AID_PROGRAMS), 'MUTUAL_AID_PROGRAMS must be an array');
  assert.equal(MUTUAL_AID_PROGRAMS.length, 12, 'Must contain exactly 12 comprehensive mutual aid programs');

  const requiredProgramIds = [
    'smart-recovery',
    'lifering',
    'recovery-dharma',
    'refuge-recovery',
    'mara',
    'dra',
    'alcoholics-anonymous',
    'narcotics-anonymous',
    'cocaine-anonymous',
    'al-anon',
    'nar-anon',
    'smart-family',
  ];

  const actualIds = MUTUAL_AID_PROGRAMS.map((p) => p.id);
  assert.deepEqual(actualIds, requiredProgramIds);

  for (const prog of MUTUAL_AID_PROGRAMS) {
    assert.ok(prog.id && typeof prog.id === 'string', 'Program must have string id');
    assert.ok(prog.name && typeof prog.name === 'string', `${prog.id} must have string name`);
    assert.ok(prog.acronym && typeof prog.acronym === 'string', `${prog.id} must have acronym`);
    assert.ok(Array.isArray(prog.philosophies) && prog.philosophies.length > 0, `${prog.id} must have philosophies array`);
    assert.equal(typeof prog.isMoudAffirming, 'boolean', `${prog.id} isMoudAffirming must be boolean`);
    assert.ok(['explicitly_affirming', 'affirming', 'group_dependent'].includes(prog.moudStatus), `${prog.id} valid moudStatus`);
    assert.equal(typeof prog.hasOnline247, 'boolean', `${prog.id} hasOnline247 must be boolean`);
    assert.equal(typeof prog.hasLocalFinder, 'boolean', `${prog.id} hasLocalFinder must be boolean`);
    assert.match(prog.websiteUrl, /^https:\/\//, `${prog.id} websiteUrl must be https protocol`);

    // Check all clinical bilingual fields
    for (const field of ['description', 'keyTools', 'spiritualityApproach', 'recoveryApproach', 'moudAcceptance', 'meetingStructure']) {
      assert.ok(prog[field] && typeof prog[field] === 'object', `${prog.id}.${field} must be object`);
      assert.ok(prog[field].en && prog[field].en.length > 0, `${prog.id}.${field}.en must not be empty`);
      assert.ok(prog[field].es && prog[field].es.length > 0, `${prog.id}.${field}.es must not be empty`);
    }
  }
});

test('MOUD-Affirming flags and harm reduction taxonomy integrity', () => {
  // MARA (Medication-Assisted Recovery Anonymous) must be explicitly affirming and MOUD-centric
  const mara = MUTUAL_AID_PROGRAMS.find((p) => p.id === 'mara');
  assert.ok(mara);
  assert.equal(mara.isMoudAffirming, true);
  assert.equal(mara.moudStatus, 'explicitly_affirming');
  assert.ok(mara.philosophies.includes('moud_affirming'));
  assert.match(mara.moudAcceptance.en, /MOUD-Centric|methadone|buprenorphine/i);

  // DRA (Dual Recovery Anonymous) must affirm psychiatric & addiction medications
  const dra = MUTUAL_AID_PROGRAMS.find((p) => p.id === 'dra');
  assert.ok(dra);
  assert.equal(dra.isMoudAffirming, true);
  assert.ok(dra.philosophies.includes('moud_affirming'));
  assert.ok(dra.philosophies.includes('twelve_step'));

  // Secular programs (SMART, LifeRing) must be MOUD-affirming
  const smart = MUTUAL_AID_PROGRAMS.find((p) => p.id === 'smart-recovery');
  assert.ok(smart);
  assert.equal(smart.isMoudAffirming, true);
  assert.ok(smart.philosophies.includes('secular'));
  assert.match(smart.keyTools.en, /4-Point Program|CBT|REBT|ABC/i);

  const lifering = MUTUAL_AID_PROGRAMS.find((p) => p.id === 'lifering');
  assert.ok(lifering);
  assert.equal(lifering.isMoudAffirming, true);
  assert.match(lifering.keyTools.en, /3-S|Sobriety, Secularity/i);

  // Mindfulness programs (Recovery Dharma, Refuge Recovery) must be MOUD-affirming
  const rd = MUTUAL_AID_PROGRAMS.find((p) => p.id === 'recovery-dharma');
  assert.ok(rd);
  assert.equal(rd.isMoudAffirming, true);
  assert.equal(rd.hasOnline247, true);
  assert.match(rd.keyTools.en, /Four Noble Truths|Eightfold Path|Sangha/i);

  // Traditional 12-step fellowships (AA, NA, CA) are group-dependent with potential stigma risk
  for (const id of ['alcoholics-anonymous', 'narcotics-anonymous', 'cocaine-anonymous']) {
    const prog = MUTUAL_AID_PROGRAMS.find((p) => p.id === id);
    assert.ok(prog);
    assert.equal(prog.isMoudAffirming, false, `${id} should not be marked universally MOUD-affirming`);
    assert.equal(prog.moudStatus, 'group_dependent');
    assert.match(prog.moudAcceptance.en, /stigma|group|bulletin|tradition/i);
  }
});

// ============================================================================
// 3. Program Filtering Logic Tests
// ============================================================================

test('filterMutualAidPrograms filters by philosophy correctly', () => {
  // All philosophies
  const allProgs = filterMutualAidPrograms({ philosophy: 'all' });
  assert.equal(allProgs.length, 12);

  // Secular
  const secularProgs = filterMutualAidPrograms({ philosophy: 'secular' });
  assert.equal(secularProgs.length, 3);
  assert.deepEqual(secularProgs.map((p) => p.id).sort(), ['lifering', 'smart-family', 'smart-recovery']);

  // Mindfulness
  const mindfulnessProgs = filterMutualAidPrograms({ philosophy: 'mindfulness' });
  assert.equal(mindfulnessProgs.length, 2);
  assert.deepEqual(mindfulnessProgs.map((p) => p.id).sort(), ['recovery-dharma', 'refuge-recovery']);

  // MOUD-Affirming philosophy
  const moudProgs = filterMutualAidPrograms({ philosophy: 'moud_affirming' });
  assert.equal(moudProgs.length, 2);
  assert.deepEqual(moudProgs.map((p) => p.id).sort(), ['dra', 'mara']);

  // 12-Step
  const twelveStepProgs = filterMutualAidPrograms({ philosophy: 'twelve_step' });
  assert.equal(twelveStepProgs.length, 6);
  assert.deepEqual(twelveStepProgs.map((p) => p.id).sort(), [
    'al-anon',
    'alcoholics-anonymous',
    'cocaine-anonymous',
    'dra',
    'nar-anon',
    'narcotics-anonymous',
  ]);

  // Family Allies
  const familyProgs = filterMutualAidPrograms({ philosophy: 'family_allies' });
  assert.equal(familyProgs.length, 3);
  assert.deepEqual(familyProgs.map((p) => p.id).sort(), ['al-anon', 'nar-anon', 'smart-family']);
});

test('filterMutualAidPrograms filters by meeting format correctly', () => {
  // 24/7 Online drop-in
  const online247 = filterMutualAidPrograms({ format: 'online_247' });
  assert.ok(online247.length >= 3);
  const ids247 = online247.map((p) => p.id);
  assert.ok(ids247.includes('recovery-dharma'));
  assert.ok(ids247.includes('alcoholics-anonymous'));
  assert.ok(ids247.includes('narcotics-anonymous'));

  for (const prog of online247) {
    assert.equal(prog.hasOnline247, true);
  }

  // Local finder
  const localFinder = filterMutualAidPrograms({ format: 'local_finder' });
  assert.equal(localFinder.length, 12, 'All 12 programs maintain directories for local meetings');
});

test('filterMutualAidPrograms filters by moudAffirmingOnly correctly', () => {
  const moudOnly = filterMutualAidPrograms({ moudAffirmingOnly: true });
  assert.equal(moudOnly.length, 9, 'Should exclude the 3 traditional fellowships that risk medication stigma');

  for (const prog of moudOnly) {
    assert.equal(prog.isMoudAffirming, true);
  }

  const excludedIds = ['alcoholics-anonymous', 'narcotics-anonymous', 'cocaine-anonymous'];
  for (const id of excludedIds) {
    assert.ok(!moudOnly.some((p) => p.id === id), `Must exclude ${id}`);
  }
});

test('filterMutualAidPrograms handles combined filters and edge cases safely', () => {
  // 12-step + MOUD-affirming
  const moud12Step = filterMutualAidPrograms({ philosophy: 'twelve_step', moudAffirmingOnly: true });
  assert.equal(moud12Step.length, 3);
  assert.deepEqual(moud12Step.map((p) => p.id).sort(), ['al-anon', 'dra', 'nar-anon']);

  // Mindfulness + 24/7 online
  const mindOnline = filterMutualAidPrograms({ philosophy: 'mindfulness', format: 'online_247' });
  assert.equal(mindOnline.length, 1);
  assert.equal(mindOnline[0].id, 'recovery-dharma');

  // Unknown or empty filters
  assert.equal(filterMutualAidPrograms({ philosophy: 'unknown_philosophy' }).length, 0);
  assert.equal(filterMutualAidPrograms(null).length, 12);
  assert.equal(filterMutualAidPrograms(undefined).length, 12);
  assert.equal(filterMutualAidPrograms({}).length, 12);
});

// ============================================================================
// 4. In-RAM Ephemeral State & Zero Storage Leak Tests
// ============================================================================

test('getMutualAidState and resetMutualAidState maintain 100% ephemeral in-RAM state', () => {
  resetMutualAidState();
  const initialState = getMutualAidState();
  assert.deepEqual(initialState, {
    philosophy: 'all',
    format: 'all',
    moudAffirmingOnly: false,
    viewMode: 'directory',
  });

  // Verify resets work deterministically
  resetMutualAidState();
  const resetState = getMutualAidState();
  assert.equal(resetState.philosophy, 'all');
  assert.equal(resetState.format, 'all');
  assert.equal(resetState.moudAffirmingOnly, false);
  assert.equal(resetState.viewMode, 'directory');
});

test('mutualAidFinder.js enforces zero persistent storage (no localStorage/sessionStorage/cookies)', () => {
  const code = readFileSync(finderFilePath, 'utf8');
  assert.doesNotMatch(code, /\blocalStorage\b/);
  assert.doesNotMatch(code, /\bsessionStorage\b/);
  assert.doesNotMatch(code, /\bdocument\.cookie\b/);
  assert.doesNotMatch(code, /\bindexedDB\b/);
});

test('mutualAidFinder.js enforces strict DOM security (zero innerHTML, outerHTML, or inline style=)', () => {
  const code = readFileSync(finderFilePath, 'utf8');
  assert.doesNotMatch(code, /\.innerHTML\b/);
  assert.doesNotMatch(code, /\.outerHTML\b/);
  assert.doesNotMatch(code, /style\s*=/);
  assert.doesNotMatch(code, /style:\s*['"`]/);
});

// ============================================================================
// 5. DOM Rendering, WCAG 2.2 AA & Print Layout Tests
// ============================================================================

test('mutualAidFinder component renders accessible WCAG 2.2 AA and print-ready DOM structure', () => {
  setupMockDOM();
  resetMutualAidState();

  const component = mutualAidFinder();
  assert.ok(component instanceof MockNode);
  assert.equal(component.tagName, 'SECTION');
  assert.equal(component.getAttribute('role'), 'region');
  assert.ok(component.classList.contains('mutual-aid-finder'));
  assert.ok(component.classList.contains('print-handout'));
  assert.ok(component.hasAttribute('aria-labelledby'));

  const text = component.textContent;
  assert.match(text, /Mutual Aid & Peer Support Directory/);

  // Check filter controls
  const philSelect = component.querySelector('select[aria-label="Filter by recovery philosophy"]');
  assert.ok(philSelect, 'Recovery philosophy select must exist');
  assert.equal(philSelect.value, 'all');

  const formatSelect = component.querySelector('select[aria-label="Filter by meeting format"]');
  assert.ok(formatSelect, 'Meeting format select must exist');

  const moudCheckbox = component.querySelector('input[type="checkbox"]');
  assert.ok(moudCheckbox, 'MOUD affirming checkbox must exist');
  assert.equal(moudCheckbox.checked, false);

  const resetBtn = component.querySelector('#mutual-aid-finder-reset-btn');
  assert.ok(resetBtn, 'Reset button must exist');

  // Check view tabs
  const tabDir = component.querySelector('#mutual-aid-finder-tab-dir');
  const tabMatrix = component.querySelector('#mutual-aid-finder-tab-matrix');
  assert.ok(tabDir && tabMatrix, 'Directory and Matrix view tabs must exist');
  assert.equal(tabDir.getAttribute('role'), 'tab');
  assert.equal(tabMatrix.getAttribute('role'), 'tab');
  assert.equal(tabDir.getAttribute('aria-selected'), 'true');
  assert.equal(tabMatrix.getAttribute('aria-selected'), 'false');

  // Check live status announcement
  const statusEl = component.querySelector('.active-filters');
  assert.ok(statusEl);
  assert.equal(statusEl.getAttribute('role'), 'status');
  assert.equal(statusEl.getAttribute('aria-live'), 'polite');
  assert.match(statusEl.textContent, /Showing 12 of 12 peer recovery programs/);

  // Check initial directory cards
  const cards = component.querySelectorAll('.mutual-aid-card');
  assert.equal(cards.length, 12, 'Initial directory view should render 12 program cards');

  // Verify MOUD-affirming and group-dependent chips exist
  assert.ok(component.querySelector('.chip.chip-ok'), 'MOUD-affirming chip should be present');
  assert.ok(component.querySelector('.chip.chip-warn'), 'Group-dependent chip should be present');
});

test('mutualAidFinder handles interactive events, filtering, and tab switching', () => {
  setupMockDOM();
  resetMutualAidState();

  let onResetCalled = false;
  const component = mutualAidFinder({
    onReset: () => {
      onResetCalled = true;
    },
  });

  // 1. Filter by secular philosophy
  const philSelect = component.querySelector('select[aria-label="Filter by recovery philosophy"]');
  philSelect.value = 'secular';
  philSelect.dispatchEvent('change', { target: { value: 'secular' } });

  let cards = component.querySelectorAll('.mutual-aid-card');
  assert.equal(cards.length, 3, 'Should show 3 secular program cards');
  assert.equal(getMutualAidState().philosophy, 'secular');

  // 2. Toggle MOUD-affirming filter
  const moudCheckbox = component.querySelector('input[type="checkbox"]');
  moudCheckbox.checked = true;
  moudCheckbox.dispatchEvent('change', { target: { checked: true } });

  cards = component.querySelectorAll('.mutual-aid-card');
  assert.equal(cards.length, 3, 'All 3 secular programs are MOUD-affirming');

  // 3. Switch to Matrix view
  const tabMatrix = component.querySelector('#mutual-aid-finder-tab-matrix');
  tabMatrix.dispatchEvent('click');

  assert.equal(getMutualAidState().viewMode, 'matrix');
  const table = component.querySelector('table');
  assert.ok(table, 'Matrix table should be rendered');
  assert.equal(table.getAttribute('role'), 'table');

  const headers = component.querySelectorAll('th[scope="col"]');
  assert.equal(headers.length, 5, 'Matrix should have 5 column headers');

  const rows = component.querySelectorAll('tbody tr');
  assert.equal(rows.length, 3, 'Matrix should display 3 filtered program rows');

  // 4. Click Reset button
  const resetBtn = component.querySelector('#mutual-aid-finder-reset-btn');
  resetBtn.dispatchEvent('click');

  assert.equal(onResetCalled, true);
  assert.equal(getMutualAidState().philosophy, 'all');
  assert.equal(getMutualAidState().moudAffirmingOnly, false);
});

// ============================================================================
// 6. Bilingual en/es Rendering Tests
// ============================================================================

test('mutualAidFinder renders bilingual en and es content accurately', () => {
  setupMockDOM();
  resetMutualAidState();

  // 1. English
  useDictionary('en', {});
  const enComponent = mutualAidFinder({ id: 'ma-en' });
  assert.match(enComponent.textContent, /Mutual Aid & Peer Support Directory/);
  assert.match(enComponent.textContent, /Recovery looks different for everyone/);
  assert.match(enComponent.textContent, /MOUD-Affirming Only/);

  // 2. Spanish
  useDictionary('es', {});
  resetMutualAidState();
  const esComponent = mutualAidFinder({ id: 'ma-es' });
  assert.match(esComponent.textContent, /Directorio de Grupos de Apoyo Mutuo y Pares/);
  assert.match(esComponent.textContent, /La recuperación es única para cada persona/);
  assert.match(esComponent.textContent, /Solo afirmativo de MOUD/);

  // Reset back to English
  useDictionary('en', {});
  resetMutualAidState();
});

// ============================================================================
// 7. Guides Support View Integration Tests
// ============================================================================

test('supportView mounts mutualAidFinder under peer section', () => {
  setupMockDOM();
  resetMutualAidState();

  const view = supportView();
  assert.ok(view instanceof MockNode);

  // Check mutualAidFinder is inside supportView
  const finderEl = view.querySelector('#mutual-aid-finder');
  assert.ok(finderEl, 'mutualAidFinder component must be mounted inside supportView');
  assert.match(view.textContent, /Mutual Aid & Peer Support Directory/);

  // Check peer section exists and contains both mutualAidFinder and existing resources
  const peerSection = view.querySelector('#peer');
  assert.ok(peerSection, '#peer section must exist in supportView');
  assert.ok(peerSection.querySelector('.mutual-aid-finder'), 'mutual-aid-finder must be inside #peer');
  assert.match(peerSection.textContent, /SMART Recovery/);
  assert.match(peerSection.textContent, /Faces & Voices of Recovery/);
});
