import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

class MockClassList {
  constructor(node) {
    this.node = node;
  }
  _list() {
    return String(this.node.className || '').split(/\s+/).filter(Boolean);
  }
  contains(cls) {
    return this._list().includes(cls);
  }
  add(...classes) {
    const set = new Set(this._list());
    for (const c of classes) set.add(c);
    this.node.className = [...set].join(' ');
    this.node.attributes.class = this.node.className;
  }
}

class MockNode {
  constructor(tag = 'div') {
    this.tagName = String(tag).toUpperCase();
    this.childNodes = [];
    this.parentNode = null;
    this.attributes = {};
    this.listeners = {};
    this.dataset = {};
    this.className = '';
    this.value = '';
    this._text = '';
    this.focused = false;
    this.isConnected = true;
    this.isContentEditable = false;
    this.classList = new MockClassList(this);
  }
  get firstChild() { return this.childNodes[0] ?? null; }
  get children() { return this.childNodes.filter((c) => c.tagName !== '#TEXT'); }
  get textContent() {
    return this.tagName === '#TEXT' ? this._text : this._text + this.childNodes.map((c) => c.textContent).join('');
  }
  set textContent(v) {
    this._text = String(v ?? '');
    this.childNodes = [];
  }
  get id() { return this.attributes.id ?? ''; }
  append(...nodes) {
    for (const n of nodes) {
      if (n === null || n === undefined || n === false) continue;
      const node = typeof n === 'string' ? Object.assign(new MockNode('#text'), { _text: n }) : n;
      node.parentNode = this;
      this.childNodes.push(node);
    }
  }
  appendChild(n) { this.append(n); return n; }
  remove() {
    if (!this.parentNode) return;
    this.parentNode.childNodes = this.parentNode.childNodes.filter((c) => c !== this);
    this.parentNode = null;
  }
  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'value') this.value = val;
  }
  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }
  hasAttribute(k) { return Object.hasOwn(this.attributes, k); }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  removeEventListener(type, fn) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((x) => x !== fn);
  }
  focus() { this.focused = true; }
  *walk() {
    for (const c of this.childNodes) {
      if (c.tagName === '#TEXT') continue;
      yield c;
      yield* c.walk();
    }
  }
  _matches(sel) {
    if (sel.startsWith('#')) return this.id === sel.slice(1);
    if (sel.startsWith('.')) return this.classList.contains(sel.slice(1));
    return this.tagName === sel.toUpperCase();
  }
  querySelector(sel) {
    for (const el of this.walk()) {
      if (el._matches(sel)) return el;
    }
    return null;
  }
  querySelectorAll(sel) {
    return [...this.walk()].filter((el) => el._matches(sel));
  }
}

function installDom() {
  const docListeners = {};
  const announcer = new MockNode('div');
  announcer.setAttribute('id', 'announcer');
  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    createTextNode: (text) => Object.assign(new MockNode('#text'), { _text: String(text) }),
    getElementById: (id) => (id === 'announcer' ? announcer : null),
    documentElement: { lang: 'en' },
    addEventListener: (type, fn) => { (docListeners[type] ??= []).push(fn); },
    removeEventListener: (type, fn) => {
      if (!docListeners[type]) return;
      docListeners[type] = docListeners[type].filter((x) => x !== fn);
    },
    _listeners: docListeners,
    dispatchKeydown(event) {
      for (const fn of [...(docListeners.keydown ?? [])]) fn(event);
    },
  };
  return docListeners;
}

installDom();

const tools = await import('../public/js/views/tools.js');
const { useDictionary } = await import('../public/js/i18n.js');
const es = (await import('../public/js/locales/es.js')).default;
const esTools = (await import('../public/js/locales/es-tools.js')).default;

afterEach(() => {
  useDictionary('en', {});
  tools.resetCareToolsState();
});

test('tools.js preserves all required public exports and contracts', () => {
  for (const name of [
    'TOOL_CATALOG',
    'TOOL_KEYWORDS',
    'CATEGORY_GROUPS',
    'categoryGroupFor',
    'getCareToolsState',
    'resetCareToolsState',
    'setCareToolsQuery',
    'normalizeSearchText',
    'filterCareTools',
    'careToolsView',
  ]) {
    assert.ok(name in tools, `Missing export ${name} in tools.js`);
  }
  assert.ok(Array.isArray(tools.TOOL_CATALOG) && tools.TOOL_CATALOG.length > 0);
  assert.equal(tools.CATEGORY_GROUPS.length, 6);
  assert.equal(tools.categoryGroupFor('clinical-support')?.id, 'health');
});

test('category filter pills use type="button", stay short for 320px viewports, and sync bidirectionally with #care-tools-category', () => {
  installDom();
  const root = tools.careToolsView();
  const select = root.querySelector('#care-tools-category');
  const pills = root.querySelectorAll('.tools-category-pill');

  assert.equal(pills.length, tools.CATEGORY_GROUPS.length + 1, 'All topics + every CATEGORY_GROUP');
  for (const pill of pills) {
    assert.equal(pill.getAttribute('type'), 'button');
    assert.ok(['true', 'false'].includes(pill.getAttribute('aria-pressed')));
    assert.ok(pill.textContent.trim().length > 0 && pill.textContent.trim().length <= 24, `Pill "${pill.textContent}" should stay short`);
  }

  // Initial state: 'all' is pressed
  const allPill = pills.find((p) => p.dataset.category === 'all');
  const emergencyPill = pills.find((p) => p.dataset.category === 'emergency');
  const carePill = pills.find((p) => p.dataset.category === 'care');
  assert.equal(allPill.getAttribute('aria-pressed'), 'true');
  assert.equal(emergencyPill.getAttribute('aria-pressed'), 'false');

  // 1-tap category pill updates select, state, aria-pressed, and rendered cards
  emergencyPill.listeners.click[0]();
  assert.equal(select.value, 'emergency');
  assert.equal(tools.getCareToolsState().category, 'emergency');
  assert.equal(emergencyPill.getAttribute('aria-pressed'), 'true');
  assert.equal(allPill.getAttribute('aria-pressed'), 'false');
  const emergencyCards = root.querySelectorAll('.tool-card');
  assert.equal(emergencyCards.length, tools.filterCareTools({ category: 'emergency' }).length);

  // Changing <select> updates pill aria-pressed bidirectionally
  select.value = 'care';
  select.listeners.change[0]({ target: select });
  assert.equal(tools.getCareToolsState().category, 'care');
  assert.equal(carePill.getAttribute('aria-pressed'), 'true');
  assert.equal(emergencyPill.getAttribute('aria-pressed'), 'false');
  assert.equal(root.querySelectorAll('.tool-card').length, tools.filterCareTools({ category: 'care' }).length);

  // Clicking All topics resets category
  allPill.listeners.click[0]();
  assert.equal(select.value, 'all');
  assert.equal(allPill.getAttribute('aria-pressed'), 'true');
  assert.equal(carePill.getAttribute('aria-pressed'), 'false');
});

test('quick audience pills filter in 1 tap and stay synchronized with the audience select in EN and ES', () => {
  installDom();
  const root = tools.careToolsView();
  const select = root.querySelector('#care-tools-audience');
  const pills = root.querySelectorAll('.tools-audience-pill');

  assert.equal(pills.length, 4, 'Everyone + each of the three supported audiences');
  for (const pill of pills) {
    assert.equal(pill.getAttribute('type'), 'button');
    assert.ok(['true', 'false'].includes(pill.getAttribute('aria-pressed')));
    assert.ok(pill.textContent.trim().length > 0 && pill.textContent.trim().length <= 24,
      `Audience pill "${pill.textContent}" should stay short`);
  }

  const everyone = pills.find((pill) => pill.dataset.audience === 'all');
  const supporter = pills.find((pill) => pill.dataset.audience === 'supporter');
  const careTeam = pills.find((pill) => pill.dataset.audience === 'care-team');
  assert.equal(everyone.getAttribute('aria-pressed'), 'true');

  supporter.listeners.click[0]();
  assert.equal(select.value, 'supporter');
  assert.equal(tools.getCareToolsState().audience, 'supporter');
  assert.equal(supporter.getAttribute('aria-pressed'), 'true');
  assert.equal(everyone.getAttribute('aria-pressed'), 'false');
  assert.equal(root.querySelectorAll('.tool-card').length,
    tools.filterCareTools({ audience: 'supporter' }).length);

  select.value = 'care-team';
  select.listeners.change[0]({ target: select });
  assert.equal(careTeam.getAttribute('aria-pressed'), 'true');
  assert.equal(supporter.getAttribute('aria-pressed'), 'false');
  assert.equal(root.querySelectorAll('.tool-card').length,
    tools.filterCareTools({ audience: 'care-team' }).length);

  everyone.listeners.click[0]();
  assert.equal(select.value, 'all');
  assert.equal(everyone.getAttribute('aria-pressed'), 'true');

  useDictionary('es', es);
  const rootEs = tools.careToolsView();
  const esPills = rootEs.querySelectorAll('.tools-audience-pill');
  for (const pill of esPills) {
    assert.ok(pill.textContent.trim().length > 0 && pill.textContent.trim().length <= 24,
      `Spanish audience pill "${pill.textContent}" stays short for 320px`);
  }
  assert.equal(esPills.find((pill) => pill.dataset.audience === 'care-team').textContent,
    esTools['tools.audiencePill.team']);
  const esSupporter = esPills.find((pill) => pill.dataset.audience === 'supporter');
  esSupporter.listeners.click[0]();
  assert.equal(rootEs.querySelector('#care-tools-audience').value, 'supporter');
  assert.equal(rootEs.querySelectorAll('.tool-card').length,
    tools.filterCareTools({ audience: 'supporter' }).length);
});

test('popular quick-search suggestion chips filter in 1 tap and toggle/clear cleanly in EN and ES', () => {
  installDom();
  const root = tools.careToolsView();
  const search = root.querySelector('#care-tools-search');
  const chips = root.querySelectorAll('.tools-suggestion-chip');

  assert.ok(chips.length >= 6);
  for (const chip of chips) {
    assert.equal(chip.getAttribute('type'), 'button');
    assert.equal(chip.getAttribute('aria-pressed'), 'false');
  }

  const naloxoneChip = chips.find((c) => c.dataset.suggestion === 'naloxone');
  assert.ok(naloxoneChip);
  assert.equal(naloxoneChip.textContent, 'Naloxone');

  // 1-tap populate + filter
  naloxoneChip.listeners.click[0]();
  assert.equal(search.value, 'Naloxone');
  assert.equal(tools.getCareToolsState().query, 'Naloxone');
  assert.equal(naloxoneChip.getAttribute('aria-pressed'), 'true');
  assert.equal(root.querySelectorAll('.tool-card').length, tools.filterCareTools({ query: 'Naloxone' }).length);

  // 2nd tap clears cleanly
  naloxoneChip.listeners.click[0]();
  assert.equal(search.value, '');
  assert.equal(tools.getCareToolsState().query, '');
  assert.equal(naloxoneChip.getAttribute('aria-pressed'), 'false');
  assert.equal(root.querySelectorAll('.tool-card').length, tools.TOOL_CATALOG.length);

  // Manual typing matching a suggestion highlights the chip, and reset clears everything
  search.value = 'pregnancy';
  search.listeners.input[0]({ target: search });
  const pregChip = chips.find((c) => c.dataset.suggestion === 'pregnancy');
  assert.equal(pregChip.getAttribute('aria-pressed'), 'true');
  tools.resetCareToolsState();
  assert.equal(search.value, '');
  assert.equal(pregChip.getAttribute('aria-pressed'), 'false');

  // Spanish localization of suggestion chips and filtering
  useDictionary('es', es);
  const rootEs = tools.careToolsView();
  const esChips = rootEs.querySelectorAll('.tools-suggestion-chip');
  for (const chip of esChips) {
    chip.listeners.click[0]();
    const q = rootEs.querySelector('#care-tools-search').value;
    assert.ok(q.length > 0);
    assert.ok(rootEs.querySelectorAll('.tool-card').length >= 1, `Spanish chip "${q}" should match >= 1 tool`);
    chip.listeners.click[0]();
  }
});

test('every rendered .tool-card displays a localized category badge from categoryGroupFor()', () => {
  installDom();
  const rootEn = tools.careToolsView();
  const enCards = rootEn.querySelectorAll('.tool-card');
  assert.equal(enCards.length, tools.TOOL_CATALOG.length);
  for (const card of enCards) {
    const badge = card.querySelector('.tool-category-badge');
    assert.ok(badge && badge.textContent.trim().length > 0, 'Every tool card has a category badge');
  }

  useDictionary('es', es);
  const rootEs = tools.careToolsView();
  const esCards = rootEs.querySelectorAll('.tool-card');
  const firstBadge = esCards[0].querySelector('.tool-category-badge');
  assert.ok(firstBadge);
  assert.equal(firstBadge.textContent, esTools['tools.pill.care']);
  for (const pill of rootEs.querySelectorAll('.tools-category-pill')) {
    assert.ok(pill.textContent.trim().length <= 24, `Spanish pill "${pill.textContent}" stays short for 320px`);
  }
});

test('pressing / focuses #care-tools-search unless typing in form fields or after view detaches (no listener leak)', () => {
  const docListeners = installDom();
  const root = tools.careToolsView();
  const search = root.querySelector('#care-tools-search');

  assert.equal(docListeners.keydown?.length, 1);

  // Ignored inside INPUT, TEXTAREA, SELECT, contentEditable
  for (const tag of ['INPUT', 'TEXTAREA', 'SELECT']) {
    const target = new MockNode(tag);
    let prevented = false;
    globalThis.document.dispatchKeydown({ key: '/', target, preventDefault() { prevented = true; } });
    assert.equal(prevented, false, `Ignores / inside ${tag}`);
    assert.equal(search.focused, false);
  }
  const editableTarget = new MockNode('div');
  editableTarget.isContentEditable = true;
  let editablePrevented = false;
  globalThis.document.dispatchKeydown({ key: '/', target: editableTarget, preventDefault() { editablePrevented = true; } });
  assert.equal(editablePrevented, false);
  assert.equal(search.focused, false);

  // Ignored when Ctrl/Meta/Alt held
  let modPrevented = false;
  globalThis.document.dispatchKeydown({ key: '/', ctrlKey: true, target: new MockNode('div'), preventDefault() { modPrevented = true; } });
  assert.equal(modPrevented, false);

  // Plain '/' focuses search and prevents default
  let prevented = false;
  globalThis.document.dispatchKeydown({ key: '/', target: new MockNode('body'), preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(search.focused, true);

  // Re-rendering replaces the previous document listener (never leaks)
  const root2 = tools.careToolsView();
  assert.equal(docListeners.keydown?.length, 1);
  const search2 = root2.querySelector('#care-tools-search');

  // Disconnecting root2 cleans up listener on next keydown without focusing
  root2.isConnected = false;
  let afterDetachPrevented = false;
  globalThis.document.dispatchKeydown({ key: '/', target: new MockNode('body'), preventDefault() { afterDetachPrevented = true; } });
  assert.equal(afterDetachPrevented, false);
  assert.equal(search2.focused, false);
  assert.equal(docListeners.keydown?.length, 0);
});

test('tools.js and es-tools.js maintain 100% bilingual parity and security invariants', () => {
  const src = fs.readFileSync(path.join(rootDir, 'public/js/views/tools.js'), 'utf8');
  assert.doesNotMatch(src, /\b(innerHTML|outerHTML|insertAdjacentHTML|localStorage|sessionStorage)\b/);
  assert.doesNotMatch(src, /document\.cookie/);
  assert.doesNotMatch(src, /\sstyle\s*=/);

  for (const m of src.matchAll(/\bt\(\s*['"]([a-zA-Z0-9_.-]+)['"]\s*,/g)) {
    const key = m[1];
    assert.ok(Object.hasOwn(esTools, key), `Missing Spanish translation in es-tools.js: ${key}`);
    assert.ok(esTools[key].trim().length > 0, `Empty Spanish translation for ${key}`);
  }
  for (const key of [
    'tools.audiencePills.heading',
    'tools.audiencePill.team',
    'tools.pill.emergency',
    'tools.pill.care',
    'tools.pill.harmReduction',
    'tools.pill.health',
    'tools.pill.planning',
    'tools.pill.populations',
    'tools.suggestion.naloxone',
    'tools.suggestion.buprenorphine',
    'tools.suggestion.methadone',
    'tools.suggestion.xylazine',
    'tools.suggestion.alcohol',
    'tools.suggestion.pregnancy',
    'tools.suggestion.housing',
  ]) {
    assert.ok(Object.hasOwn(esTools, key), `Missing dynamic Spanish key in es-tools.js: ${key}`);
    assert.ok(Object.hasOwn(es, key), `Missing merged Spanish key in es.js: ${key}`);
  }
});

test('Clear filters button and combined filters keep pills, chips, and results synchronized', () => {
  installDom();
  tools.setCareToolsQuery('Naloxone');
  const root = tools.careToolsView();
  const search = root.querySelector('#care-tools-search');
  const audience = root.querySelector('#care-tools-audience');
  const category = root.querySelector('#care-tools-category');
  const naloxoneChip = root.querySelectorAll('.tools-suggestion-chip').find((c) => c.dataset.suggestion === 'naloxone');
  const emergencyPill = root.querySelectorAll('.tools-category-pill').find((p) => p.dataset.category === 'emergency');
  const allPill = root.querySelectorAll('.tools-category-pill').find((p) => p.dataset.category === 'all');
  const clearBtn = root.querySelectorAll('button').find((b) => b.classList.contains('btn-ghost'));

  assert.equal(naloxoneChip.getAttribute('aria-pressed'), 'true', 'Pre-seeded query activates matching chip');

  emergencyPill.listeners.click[0]();
  audience.value = 'care-team';
  audience.listeners.change[0]({ target: audience });
  assert.equal(root.querySelectorAll('.tool-card').length, tools.filterCareTools({
    query: 'Naloxone',
    audience: 'care-team',
    category: 'emergency',
  }).length);

  clearBtn.listeners.click[0]();
  assert.equal(search.value, '');
  assert.equal(audience.value, 'all');
  assert.equal(category.value, 'all');
  assert.equal(allPill.getAttribute('aria-pressed'), 'true');
  assert.equal(emergencyPill.getAttribute('aria-pressed'), 'false');
  assert.equal(naloxoneChip.getAttribute('aria-pressed'), 'false');
  assert.equal(search.focused, true);
});

test('all assigned clinical views standardize explicit type="button" and copyText() usage', () => {
  const clinicalViews = [
    'pulmonaryCare.js', 'renalCare.js', 'endocarditisCare.js', 'liverCare.js', 'weatherCare.js',
    'ketamineCare.js', 'inhalantCare.js', 'veinCare.js', 'ghbCare.js', 'psychedelicCare.js',
    'gabapentinoidCare.js', 'novelSubstances.js', 'sexualHealth.js', 'needleExposure.js', 'nicotineCare.js',
    'viralHepatitis.js', 'cannabisCare.js', 'dentalCare.js', 'sleepCare.js', 'nightlifeCare.js',
    'polysubstanceCare.js', 'familySupport.js', 'alcoholCare.js', 'chronicPain.js', 'cardiogenicToxinHiet.js',
    'woodenChestRigidity.js', 'hyperthermicToxidrome.js', 'adulterantHeavyMetals.js', 'inhalantToxicology.js',
    'periOverdosePulmonary.js', 'disasterMoudClimate.js', 'movementDisordersEps.js', 'fungalOpportunisticCare.js',
    'toxicologyTriage.js', 'hospitalCare.js', 'obstetricEmergencies.js', 'oncologyPalliative.js',
    'cardiologyCare.js', 'dermatologyCare.js', 'entCare.js', 'urologyCare.js', 'icuPerioperative.js',
    'pediatricExposures.js', 'geriatricCare.js',
  ];

  for (const file of [...clinicalViews, 'workspace.js']) {
    const src = fs.readFileSync(path.join(rootDir, 'public/js/views', file), 'utf8');
    for (const m of src.matchAll(/\bh\(\s*['"]button['"]\s*,\s*/g)) {
      const rest = src.slice(m.index + m[0].length, m.index + m[0].length + 600);
      if (rest.startsWith('{')) {
        let depth = 0;
        let end = 0;
        for (; end < rest.length; end += 1) {
          if (rest[end] === '{') depth += 1;
          else if (rest[end] === '}') {
            depth -= 1;
            if (depth === 0) break;
          }
        }
        const props = rest.slice(0, end + 1);
        assert.match(props, /\btype\s*:/, `${file}: button missing explicit type: 'button'`);
      }
    }
    if (file !== 'workspace.js') {
      assert.doesNotMatch(src, /navigator\.clipboard/, `${file}: should use copyText() instead of navigator.clipboard`);
      assert.match(src, /\bcopyText\(/, `${file}: expected copyText() call`);
    }
  }
});

test('representative updated clinical views call copyText() with graceful fallback when clipboard is unavailable', async () => {
  installDom();
  const prevNav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  let copiedText = null;
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    writable: true,
    value: { clipboard: { writeText: async (text) => { copiedText = text; } } },
  });
  try {
    const { gabapentinoidCareView } = await import('../public/js/views/gabapentinoidCare.js');
    const gabaView = gabapentinoidCareView();
    const gabaCopyEn = gabaView.querySelector('.btn-copy-sbar');
    assert.equal(gabaCopyEn.getAttribute('type'), 'button');
    await gabaCopyEn.listeners.click[0]();
    assert.ok(copiedText && copiedText.includes('GABAPENTINOID'));
    assert.equal(gabaCopyEn.textContent, 'Copied to Clipboard!');

    // Unavailable clipboard gracefully updates button feedback without throwing
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      writable: true,
      value: {},
    });
    const { pulmonaryCareView } = await import('../public/js/views/pulmonaryCare.js');
    const pulmView = pulmonaryCareView();
    const pulmButtons = pulmView.querySelectorAll('button');
    for (const btn of pulmButtons) assert.equal(btn.getAttribute('type'), 'button');
    const pulmCopy = pulmButtons.find((b) => b.textContent.includes('Copy Clinical SBAR'));
    assert.ok(pulmCopy);
    await pulmCopy.listeners.click[0]();
    assert.match(pulmCopy.textContent, /Copy failed/);
  } finally {
    if (prevNav) Object.defineProperty(globalThis, 'navigator', prevNav);
    else delete globalThis.navigator;
  }
});
