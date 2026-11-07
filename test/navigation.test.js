// Navigation, findability, and accessibility checks: the skip link, focus and
// announcements on route changes, the Escape key, the topic finder, and the
// home and not-found page topic search.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// app.js wires browser listeners only when a document exists, so load it
// first, then install the minimal DOM the views need.
const app = await import('../public/js/app.js');

// ------------------------------------------------------------ Minimal DOM
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
  }
  get firstChild() { return this.childNodes[0] ?? null; }
  get children() { return this.childNodes.filter((c) => c.tagName !== '#TEXT'); }
  get textContent() {
    return this.tagName === '#TEXT' ? this._text : this._text + this.childNodes.map((c) => c.textContent).join('');
  }
  set textContent(v) { this._text = String(v); this.childNodes = []; }
  get hidden() { return Object.hasOwn(this.attributes, 'hidden'); }
  set hidden(v) { if (v) this.attributes.hidden = ''; else delete this.attributes.hidden; }
  get id() { return this.attributes.id ?? ''; }
  append(...nodes) {
    for (const n of nodes) {
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
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null; }
  hasAttribute(k) { return Object.hasOwn(this.attributes, k); }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  removeEventListener() {}
  focus() { this.focused = true; }
  *walk() {
    for (const c of this.childNodes) {
      if (c.tagName === '#TEXT') continue;
      yield c;
      yield* c.walk();
    }
  }
  querySelector(sel) {
    for (const el of this.walk()) {
      if (sel.startsWith('#') ? el.id === sel.slice(1) : el.tagName === sel.toUpperCase()) return el;
    }
    return null;
  }
  querySelectorAll(sel) {
    return [...this.walk()].filter((el) => el.tagName === sel.toUpperCase());
  }
}

globalThis.Node = MockNode;
globalThis.document = {
  createElement: (tag) => new MockNode(tag),
  createElementNS: (_ns, tag) => new MockNode(tag),
  createTextNode: (text) => Object.assign(new MockNode('#text'), { _text: String(text) }),
  getElementById: () => null,
  documentElement: { lang: 'en' },
};
globalThis.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

const tools = await import('../public/js/views/tools.js');
const core = await import('../public/js/views/core.js');
const { useDictionary } = await import('../public/js/i18n.js');
const es = (await import('../public/js/locales/es.js')).default;

// ------------------------------------------------------------ 1. Skip link
test('only "#/…" and "#" hashes are routes; "#main" is an in-page anchor', () => {
  for (const hash of ['', '#', '#/', '#/tools', '#/state/OH', '#/match?start=virtual']) {
    assert.equal(app.isRouteHash(hash), true, hash);
  }
  for (const hash of ['#main', '#help-for', '#page-title']) {
    assert.equal(app.isRouteHash(hash), false, hash);
  }
});

test('the skip link targets main, and same-page anchors are intercepted without a hash change', () => {
  const html = read('public/index.html');
  assert.match(html, /<a class="skip-link" href="#main"/);
  assert.match(html, /<main id="main"[^>]*tabindex="-1"/);
  const src = read('public/js/app.js');
  assert.match(src, /closest\?\.\('a\[href\^="#"\]:not\(\[href\^="#\/"\]\):not\(\[href="#"\]\)'\)/);
  const block = src.slice(src.indexOf("document.addEventListener('click'"), src.indexOf('// Preload lazy route modules'));
  const anchorBranch = block.slice(block.indexOf('if (anchor)'), block.indexOf("const a = e.target.closest('a[href^=\"#/\"]"));
  assert.match(anchorBranch, /e\.preventDefault\(\)/);
  assert.match(anchorBranch, /focusInPageTarget\(/);
  assert.doesNotMatch(anchorBranch, /location\.(replace|assign|hash)/, 'must not change the hash or history');
  // render() ignores non-route hashes instead of showing the not-found page.
  assert.match(src, /hashchange', \(\) => render\(\{ hashChange: true \}\)/);
  assert.match(src, /if \(!routeHash && hashChange && !firstRender\) \{\s*focusInPageTarget/);
});

test('focusInPageTarget focuses the anchor target and makes it focusable', () => {
  const target = new MockNode('main');
  target.attributes.id = 'main';
  const doc = { getElementById: (id) => (id === 'main' ? target : null) };
  assert.equal(app.focusInPageTarget('main', doc), true);
  assert.equal(target.getAttribute('tabindex'), '-1');
  assert.equal(target.focused, true);
  assert.equal(app.focusInPageTarget('missing', doc), false);
  // An existing tabindex is left alone; links are natively focusable.
  const link = new MockNode('a');
  app.makeFocusable(link);
  assert.equal(link.hasAttribute('tabindex'), false);
  const region = new MockNode('section');
  region.setAttribute('tabindex', '0');
  app.makeFocusable(region);
  assert.equal(region.getAttribute('tabindex'), '0');
});

// ------------------------------------------------------------ 2. Focus and announce
function view(...headings) {
  const main = new MockNode('main');
  const wrap = new MockNode('div');
  main.append(wrap);
  for (const [tag, id] of headings) {
    const el = new MockNode(tag);
    if (id) el.setAttribute('id', id);
    wrap.append(el);
  }
  return main;
}

test('route focus falls back from #page-title to h1, then h2, then main', () => {
  let main = view(['h2'], ['h1', 'page-title']);
  assert.equal(app.routeFocusTarget(main).id, 'page-title');

  main = view(['h2'], ['h1']);
  const h1 = app.routeFocusTarget(main);
  assert.equal(h1.tagName, 'H1');
  assert.equal(h1.getAttribute('tabindex'), '-1');

  main = view(['p'], ['h2']);
  const h2 = app.routeFocusTarget(main);
  assert.equal(h2.tagName, 'H2');
  assert.equal(h2.getAttribute('tabindex'), '-1');

  main = view(['p']);
  assert.equal(app.routeFocusTarget(main), main);
  assert.equal(main.getAttribute('tabindex'), '-1');
  assert.equal(app.routeFocusTarget(null), null);
});

test('render() focuses the fallback target and announces the page title', () => {
  const src = read('public/js/app.js');
  const body = src.slice(src.indexOf('async function render('), src.indexOf('// ---------------------------------------------------------------- Quick exit'));
  assert.match(body, /routeFocusTarget\(main\)\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(body, /announce\(resolved\.title\)/);
  assert.match(src, /import \{[^}]*\bannounce\b[^}]*\} from '\.\/dom\.js';/);
  assert.match(read('public/index.html'), /<div id="announcer" class="visually-hidden" aria-live="polite"><\/div>/);
});

test('every routed view renders a top-level h1', () => {
  const src = read('public/js/app.js');
  const loaders = src.slice(src.indexOf('export const LAZY_LOADERS'), src.indexOf('export const ROUTE_TITLES'));
  const files = new Set([...loaders.matchAll(/import\('\.\/views\/([A-Za-z]+\.js)'\)/g)].map((m) => m[1]));
  files.add('guides.js');
  files.add('core.js');
  assert.ok(files.size > 40, `found ${files.size} view modules`);
  const missing = [...files].filter((f) => !/pageHeader\(|h\('h1'/.test(read(`public/js/views/${f}`)));
  assert.deepEqual(missing, []);
});

test('dental, nightlife, polysubstance, and sleep views have a bilingual h1', () => {
  for (const [file, en, esTitle] of [
    ['dentalCare.js', 'Dental, Oral Health, Buprenorphine Safety', 'Guía de Salud Dental'],
    ['nightlifeCare.js', 'Nightlife, Club Drugs', 'Guía Clínica de Reducción de Daños en Ocio Nocturno'],
    ['polysubstanceCare.js', 'Polysubstance Overdose Synergy', 'Navegador de Sinergia de Polisustancias'],
    ['sleepCare.js', 'Sleep Restoration & Insomnia', 'Navegador de Restauración del Sueño'],
  ]) {
    const src = read(`public/js/views/${file}`);
    const line = src.split('\n').find((l) => l.includes("h('h1'"));
    assert.ok(line, `${file} has an h1`);
    assert.ok(line.includes(en) && line.includes(esTitle), `${file} h1 is bilingual`);
  }
});

// ------------------------------------------------------------ 3. Escape and scrolling
test('Escape that closes the More tools menu does not count toward quick exit', () => {
  const src = read('public/js/app.js');
  const handler = src.slice(src.indexOf('let lastEscape = 0;'), src.indexOf('toggle?.addEventListener'));
  const branch = handler.slice(handler.indexOf('if (more) {'), handler.indexOf('const now = Date.now();'));
  assert.match(branch, /more\.open = false;/);
  assert.match(branch, /lastEscape = 0;/);
  assert.match(branch, /return;/);
});

test('focused fields scroll clear of the sticky safety bar', () => {
  const css = read('public/styles.css');
  assert.match(css, /html \{[^}]*scroll-padding-top: \d+px/);
  assert.match(css, /\.safety-bar \{\s*position: sticky;/);
});

// ------------------------------------------------------------ 6. Print
test('print hides tab navigation in both stylesheets', () => {
  const css = read('public/styles.css');
  const printBlock = css.slice(css.indexOf('@media print {'));
  assert.match(printBlock.slice(0, 600), /\.tabs, \.tab-nav,/);
  assert.match(read('public/css/print.css'), /\.tabs,\s*\.tab-nav,/);
});

// ------------------------------------------------------------ 4. Topic finder
test('every catalog category is reachable from the category dropdown', () => {
  const groupIds = tools.CATEGORY_GROUPS.map((g) => g.id);
  assert.equal(new Set(groupIds).size, groupIds.length);
  for (const tool of tools.TOOL_CATALOG) {
    assert.ok(tools.categoryGroupFor(tool.category), `${tool.id}: category "${tool.category}" has no dropdown option`);
  }
  const reachable = new Set(tools.CATEGORY_GROUPS.flatMap((g) => tools.filterCareTools({ category: g.id }).map((x) => x.id)));
  assert.deepEqual(tools.TOOL_CATALOG.filter((x) => !reachable.has(x.id)).map((x) => x.id), []);
  // The dropdown is built from the groups, each with a Spanish label.
  assert.match(read('public/js/views/tools.js'), /CATEGORY_GROUPS\.map\(\(group\) => h\('option', \{ value: group\.id \}, t\(group\.key, group\.label\)\)\)/);
  for (const group of tools.CATEGORY_GROUPS) assert.ok(Object.hasOwn(es, group.key), `missing Spanish label ${group.key}`);
  // Older raw categories still filter as before.
  assert.ok(tools.filterCareTools({ category: 'clinical-support' }).every((x) => x.category === 'clinical-support'));
});

const ORPHANS = ['perinatal', 'veterans', 'adolescent', 'reentry', 'older-adults', 'workplace-rights', 'tribal-health',
  'lgbtq-care', 'wound-care', 'rural-health', 'disability-care', 'street-medicine', 'immigrant-health', 'post-overdose',
  'stimulant-care', 'alcohol-care', 'family-support'];

const SEARCHES = {
  pregnant: 'perinatal',
  fentanyl: 'overdose',
  narcan: 'overdose',
  xanax: 'benzodiazepine-care',
  teen: 'adolescent',
  homeless: 'street-medicine',
  jail: 'reentry',
  detox: 'alcohol-care',
  weed: 'cannabis-care',
  drinking: 'alcohol-care',
  embarazada: 'perinatal',
  fentanilo: 'adulterant-care',
};

test('everyday, slang, brand-name, and Spanish searches find a relevant topic', () => {
  for (const [query, expected] of Object.entries(SEARCHES)) {
    const ids = tools.filterCareTools({ query }).map((x) => x.id);
    assert.ok(ids.includes(expected), `"${query}" should find ${expected}; got ${ids.join(', ') || 'nothing'}`);
  }
});

test('search ignores case and accents and tolerates plurals', () => {
  for (const query of ['EMBARAZADA', 'Fentanilo', 'carcel', 'cárcel', 'Teens', 'XANAX']) {
    assert.ok(tools.filterCareTools({ query }).length > 0, query);
  }
  assert.ok(tools.filterCareTools({ query: 'cárcel' }).some((x) => x.id === 'reentry'));
  assert.ok(tools.filterCareTools({ query: 'Embarazo' }).some((x) => x.id === 'perinatal'));
});

test('keywords also work while the interface is in Spanish', () => {
  useDictionary('es', es);
  try {
    for (const [query, expected] of Object.entries(SEARCHES)) {
      assert.ok(tools.filterCareTools({ query }).some((x) => x.id === expected), query);
    }
  } finally {
    useDictionary('en', {});
  }
});

test('catalog topics carry English and Spanish keywords', () => {
  for (const tool of tools.TOOL_CATALOG) assert.ok(Array.isArray(tool.keywords), `${tool.id} keywords`);
  for (const id of [...ORPHANS, ...Object.values(SEARCHES)]) {
    assert.ok(tools.TOOL_CATALOG.find((x) => x.id === id)?.keywords.length >= 4, `${id} keywords`);
  }
  const unknown = Object.keys(tools.TOOL_KEYWORDS).filter((id) => !tools.TOOL_CATALOG.some((x) => x.id === id));
  assert.deepEqual(unknown, [], 'keywords for topics that are not in the catalog');
});

// ------------------------------------------------------------ 5. Home and not-found
test('population and situation guides are linked from the home page', () => {
  const links = [...core.HELP_FOR_PEOPLE, ...core.HELP_FOR_CONCERNS];
  const routes = links.map(([route]) => route);
  for (const route of ORPHANS) assert.ok(routes.includes(route), `home page should link #/${route}`);
  for (const [route, key] of links) {
    assert.ok(Object.hasOwn(app.ROUTE_TITLES, route), `#/${route} is a real route`);
    assert.ok(Object.hasOwn(app.LAZY_LOADERS, route) || Object.hasOwn(app.SYNC_VIEWS, route), `#/${route} has a view`);
    assert.ok(Object.hasOwn(es, key), `missing Spanish label ${key}`);
  }
  const src = read('public/js/views/core.js');
  assert.match(src, /h\('a', \{ class: 'path-sublink', href: '#\/family-support' \}/);
  assert.ok(Object.hasOwn(es, 'home.start.supporter.craft'));
});

async function typeInto(input, value) {
  input.value = value;
  await Promise.all((input.listeners.input ?? []).map((fn) => fn({ target: input })));
}

test('topic search shows matching links with a labelled input and a live result count', async () => {
  const box = core.topicSearch({ idPrefix: 'test-topic', title: 'Find a topic' });
  const input = box.querySelector('#test-topic-input');
  const label = box.querySelectorAll('label')[0];
  assert.equal(label.getAttribute('for'), 'test-topic-input');
  assert.equal(input.getAttribute('type'), 'search');
  assert.equal(input.getAttribute('aria-describedby'), 'test-topic-hint');
  assert.equal(input.getAttribute('aria-controls'), 'test-topic-results');
  const status = [...box.walk()].find((el) => el.getAttribute('role') === 'status');
  assert.equal(status.getAttribute('aria-live'), 'polite');
  const results = box.querySelector('#test-topic-results');
  assert.equal(results.hidden, true);

  await typeInto(input, 'pregnant');
  const hrefs = results.querySelectorAll('a').map((a) => a.getAttribute('href'));
  assert.ok(hrefs.includes('#/perinatal'), hrefs.join(', '));
  assert.equal(results.hidden, false);
  assert.match(status.textContent, /^\d+ matching topics?$/);

  await typeInto(input, 'zzzzqqq');
  assert.equal(results.hidden, true);
  assert.match(status.textContent, /No topics match/);

  await typeInto(input, '');
  assert.equal(results.hidden, true);
  assert.equal(status.textContent, '');

  // Broad searches are capped, with a button to see the rest in the directory.
  await typeInto(input, 'care');
  assert.equal(results.querySelectorAll('li').length, core.TOPIC_SEARCH_LIMIT);
  assert.ok([...box.walk()].some((el) => el.tagName === 'BUTTON' && /See all \d+ matching topics/.test(el.textContent)));
});

test('home and not-found pages include the topic search; search terms stay in memory', () => {
  const src = read('public/js/views/core.js');
  assert.match(src, /topicSearch\(\{ idPrefix: 'home-topic'/);
  const notFound = src.slice(src.indexOf('export function notFoundView'));
  assert.match(notFound, /topicSearch\(\{ idPrefix: 'notfound-topic'/);
  const component = src.slice(src.indexOf('// ---------------------------------------------------------------- Topic search'), src.indexOf('// ---------------------------------------------------------------- Home'));
  assert.doesNotMatch(component, /localStorage|sessionStorage|indexedDB|history\.|fetch\(|api\./);
  assert.doesNotMatch(component, /location\.(hash|search)|#\/tools\?/);
  for (const key of ['topicSearch.label', 'topicSearch.hint', 'topicSearch.count.one', 'topicSearch.count.other', 'topicSearch.none',
    'topicSearch.seeAll', 'topicSearch.homeTitle', 'topicSearch.notFoundTitle', 'topicSearch.unavailable']) {
    assert.ok(Object.hasOwn(es, key), `missing Spanish ${key}`);
  }
});

test('"See all" hands the search to the directory in memory, and quick exit clears it', () => {
  tools.setCareToolsQuery('pregnant');
  assert.equal(tools.getCareToolsState().query, 'pregnant');
  tools.resetCareToolsState();
  assert.equal(tools.getCareToolsState().query, '');
});
