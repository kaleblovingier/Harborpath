// test/recovery-support.test.js
// Life after treatment (#/recovery-support): rendering in English and Spanish,
// official sources, hotline reuse, the in-memory checklist, and registration.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import { HOTLINES } from '../public/js/content/hotlines.js';
import {
  RECOVERY_SOURCES,
  NARR_LEVELS,
  HOUSING_QUESTIONS,
  HOUSING_RED_FLAGS,
  RETURN_TO_USE_PLAN,
  CHECKLIST_ITEMS,
  getRecoverySupportState,
  setRecoveryChecklistItem,
  resetRecoverySupportState,
  recoverySupportView,
} from '../public/js/views/recoverySupport.js';
import { LAZY_LOADERS, ROUTE_TITLES, runQuickExitResets } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';

class MockNode {
  constructor(tag = 'div') {
    this.tagName = String(tag).toUpperCase();
    this.attributes = {};
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.className = '';
    this._text = '';
  }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this._text = String(v ?? ''); this.children = []; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  append(...items) {
    for (const item of items) {
      if (item instanceof MockNode) this.children.push(item);
      else { const n = new MockNode('#text'); n._text = String(item); this.children.push(n); }
    }
  }
  all(pred, out = []) {
    for (const c of this.children) { if (pred(c)) out.push(c); c.all(pred, out); }
    return out;
  }
}

function withDom(fn) {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;
  globalThis.Node = MockNode;
  globalThis.document = { createElement: (t) => new MockNode(t), createElementNS: (_ns, t) => new MockNode(t) };
  try { return fn(); } finally { globalThis.document = prevDoc; globalThis.Node = prevNode; }
}

const byTag = (root, tag) => root.all((n) => n.tagName === tag.toUpperCase());
const hrefs = (root) => byTag(root, 'a').map((a) => a.getAttribute('href'));

test('content tables are complete and bilingual', () => {
  assert.equal(NARR_LEVELS.length, 4);
  assert.deepEqual(NARR_LEVELS.map((l) => l.level), ['I', 'II', 'III', 'IV']);
  for (const group of [HOUSING_QUESTIONS, HOUSING_RED_FLAGS, CHECKLIST_ITEMS]) {
    for (const item of group) { assert.ok(item.en); assert.ok(item.es); assert.notEqual(item.en, item.es); }
  }
  for (const lvl of NARR_LEVELS) { assert.ok(lvl.name.es && lvl.desc.es); }
  for (const step of RETURN_TO_USE_PLAN) { assert.ok(step.lead.es && step.body.es); }
  assert.ok(RETURN_TO_USE_PLAN.some((s) => /tolerance/i.test(s.lead.en + s.body.en)));
  assert.ok(HOUSING_QUESTIONS.some((q) => /buprenorphine or methadone/.test(q.en)));
});

test('renders in English with a single h1, crisis lines first, and official sources', () => {
  useDictionary('en', {});
  resetRecoverySupportState();
  const view = withDom(() => recoverySupportView());
  const h1s = byTag(view, 'h1');
  assert.equal(h1s.length, 1);
  assert.equal(h1s[0].textContent, 'Life after treatment');

  const links = hrefs(view);
  // Crisis lines come from hotlines.js and appear before the first section.
  const firstSection = view.children.findIndex((c) => c.tagName === 'SECTION');
  const top = { children: view.children.slice(0, firstSection) };
  const topTel = MockNode.prototype.all.call(top, (n) => n.tagName === 'A').map((a) => a.getAttribute('href'));
  assert.ok(topTel.includes('tel:911'));
  assert.ok(topTel.includes('tel:988'));
  const samhsa = HOTLINES.substanceUse.find((l) => l.id === 'samhsa');
  assert.ok(topTel.includes(`tel:${samhsa.call.number}`));

  const nua = HOTLINES.substanceUse.find((l) => l.id === 'never-use-alone');
  const safespot = HOTLINES.substanceUse.find((l) => l.id === 'safespot');
  assert.ok(links.includes(`tel:${nua.call.number}`));
  assert.ok(links.includes(`tel:${safespot.call.number}`));

  for (const s of RECOVERY_SOURCES) assert.ok(links.includes(s.href), `missing source ${s.href}`);
  assert.ok(links.some((l) => l.startsWith('https://library.samhsa.gov/')));
  assert.ok(links.includes('https://www.ada.gov/resources/opioid-use-disorder'));
  assert.ok(links.includes('https://www.dol.gov/agencies/eta/RRW-hub'));

  // Links to existing guides instead of duplicating them.
  for (const route of ['#/choosing-care', '#/support', '#/overdose', '#/harm-reduction', '#/workplace-rights', '#/medications']) {
    assert.ok(links.includes(route), `missing link to ${route}`);
  }
  // External links open safely in a new tab.
  for (const a of byTag(view, 'a').filter((x) => /^https:/.test(x.getAttribute('href')))) {
    assert.equal(a.getAttribute('rel'), 'noopener noreferrer');
  }
  // Print support.
  assert.ok(byTag(view, 'button').some((b) => /Print/.test(b.textContent)));
});

test('renders in Spanish with formal usted copy', () => {
  useDictionary('es', es);
  try {
    const view = withDom(() => recoverySupportView());
    const h1s = byTag(view, 'h1');
    assert.equal(h1s.length, 1);
    assert.equal(h1s[0].textContent, 'La vida después del tratamiento');
    const text = view.textContent;
    assert.match(text, /Vivienda de recuperación/);
    assert.match(text, /Si vuelve a consumir/);
    assert.match(text, /Mis próximos pasos/);
    assert.doesNotMatch(text, /Life after treatment/);
    assert.doesNotMatch(text, /(^|\s)tú(\s|$)|\bpuedes\b|\btienes\b/);
  } finally {
    useDictionary('en', {});
  }
});

test('private checklist stays in memory and resets', () => {
  useDictionary('en', {});
  resetRecoverySupportState();
  const view = withDom(() => recoverySupportView());
  const boxes = byTag(view, 'input').filter((i) => i.getAttribute('type') === 'checkbox');
  assert.equal(boxes.length, CHECKLIST_ITEMS.length);
  const status = view.all((n) => n.getAttribute('role') === 'status')[0];
  assert.match(status.textContent, /0 of 8 done/);

  withDom(() => boxes[0].listeners.change({ target: { checked: true } }));
  assert.deepEqual(getRecoverySupportState().checked, [CHECKLIST_ITEMS[0].id]);
  assert.match(status.textContent, /1 of 8 done/);

  setRecoveryChecklistItem('not-a-real-item', true);
  assert.equal(getRecoverySupportState().checked.length, 1);

  resetRecoverySupportState();
  assert.deepEqual(getRecoverySupportState().checked, []);
});

test('Quick Exit clears the checklist once the route has loaded', async () => {
  await LAZY_LOADERS['recovery-support']();
  setRecoveryChecklistItem('naloxone', true);
  assert.doesNotThrow(() => runQuickExitResets());
  assert.deepEqual(getRecoverySupportState().checked, []);
});

test('route, title, catalog, service worker, and Spanish keys are registered', async () => {
  const view = await LAZY_LOADERS['recovery-support']();
  assert.equal(view, recoverySupportView);
  assert.equal(ROUTE_TITLES['recovery-support'](), 'Life after treatment: recovery housing & support');

  const entry = TOOL_CATALOG.find((t) => t.id === 'recovery-support');
  assert.ok(entry);
  assert.equal(entry.path, '#/recovery-support');
  assert.ok(filterCareTools({ query: 'recovery housing' }).some((t) => t.id === 'recovery-support'));
  assert.ok(filterCareTools({ query: 'workplace' }).some((t) => t.id === 'recovery-support'));

  const sw = readFileSync('public/sw.js', 'utf8');
  const elective = sw.match(/const ELECTIVE_SHELL = \[([\s\S]*?)\];/)[1];
  assert.ok(elective.includes("'/js/views/recoverySupport.js'"));
  const shell = sw.match(/const APP_SHELL = \[([\s\S]*?)\];/)[1];
  assert.ok(shell.includes("'/js/locales/es-recovery.js'"));

  for (const key of ['route.recoverySupport', 'tools.item.recovery-support.title', 'tools.item.recovery-support.description']) {
    assert.ok(es[key], `missing Spanish key ${key}`);
  }
});

test('static privacy and security audit', () => {
  const src = readFileSync(new URL('../public/js/views/recoverySupport.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(src, /innerHTML|outerHTML/);
  assert.doesNotMatch(src, /style\s*[=:]/);
  assert.doesNotMatch(src, /fetch\s*\(|XMLHttpRequest|sendBeacon/);
  // Phone numbers come from hotlines.js, never typed into the view.
  assert.match(src, /from '\.\.\/content\/hotlines\.js'/);
  assert.doesNotMatch(src, /\b1-?8\d\d-?\d{3}-?\d{4}\b/);
});
