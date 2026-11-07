// test/overdose-loss.test.js
// After an overdose death (#/overdose-loss): rendering in English and Spanish,
// careful crisis messaging, verified sources and numbers, and registration.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import { HOTLINES } from '../public/js/content/hotlines.js';
import {
  LOSS_SOURCES,
  FIRST_STEPS,
  HELPING_A_FRIEND,
  TCF_PHONE,
  overdoseLossView,
} from '../public/js/views/overdoseLoss.js';
import { LAZY_LOADERS, ROUTE_TITLES } from '../public/js/app.js';
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
  assert.ok(FIRST_STEPS.length >= 3);
  assert.match(FIRST_STEPS[0].lead.en, /911/);
  for (const s of FIRST_STEPS) assert.ok(s.lead.es && s.body.es);
  for (const item of HELPING_A_FRIEND) { assert.ok(item.en && item.es); assert.notEqual(item.en, item.es); }
  for (const s of LOSS_SOURCES) { assert.match(s.href, /^https:\/\//); assert.ok(s.name.en && s.name.es); }
});

test('renders in English with a single h1 and crisis support at the top', () => {
  useDictionary('en', {});
  const view = withDom(() => overdoseLossView());
  const h1s = byTag(view, 'h1');
  assert.equal(h1s.length, 1);
  assert.equal(h1s[0].textContent, 'After an overdose death');

  const firstSection = view.children.findIndex((c) => c.tagName === 'SECTION');
  const top = view.children.slice(0, firstSection);
  const topText = top.map((n) => n.textContent).join(' ');
  const topLinks = top.flatMap((n) => byTag(n, 'a')).map((a) => a.getAttribute('href'));
  // 988 message is stated plainly and before any other content.
  assert.match(topText, /thoughts of ending your life/);
  assert.match(topText, /Call or text 988/);
  assert.ok(topLinks.includes('tel:988'));
  assert.ok(topLinks.includes('tel:911'));
  const ctl = HOTLINES.crisis.find((l) => l.id === 'crisis-text-line');
  assert.ok(topLinks.some((l) => l.startsWith(`sms:${ctl.text.number}`)));
});

test('cites official sources and verified support organizations', () => {
  useDictionary('en', {});
  const view = withDom(() => overdoseLossView());
  const links = hrefs(view);
  for (const s of LOSS_SOURCES) assert.ok(links.includes(s.href), `missing source ${s.href}`);
  assert.ok(links.some((l) => l.startsWith('https://www.cdc.gov/')));
  assert.ok(links.some((l) => l.startsWith('https://library.samhsa.gov/')));
  assert.ok(links.includes('https://apps.deadiversion.usdoj.gov/pubdispsearch'));
  assert.ok(links.includes('https://grasphelp.org/community/meetings/'));
  assert.ok(links.some((l) => l.startsWith('https://www.compassionatefriends.org/')));
  // The only phone number typed into this view is The Compassionate Friends' national office.
  assert.ok(links.includes(`tel:${TCF_PHONE.number}`));
  // Other numbers come from hotlines.js.
  for (const id of ['never-use-alone', 'safespot', 'samhsa']) {
    const line = HOTLINES.substanceUse.find((l) => l.id === id);
    assert.ok(links.includes(`tel:${line.call.number}`), `missing ${id}`);
  }
  for (const route of ['#/overdose', '#/harm-reduction', '#/support', '#/family-support']) {
    assert.ok(links.includes(route), `missing link to ${route}`);
  }
  assert.ok(byTag(view, 'button').some((b) => /Print/.test(b.textContent)));
});

test('makes no state-specific timing claims', () => {
  useDictionary('en', {});
  const text = withDom(() => overdoseLossView()).textContent;
  assert.match(text, /differ by state and county/);
  assert.doesNotMatch(text, /\b\d+\s*(business\s+)?days?\b/i);
});

test('renders in Spanish with formal usted copy', () => {
  useDictionary('es', es);
  try {
    const view = withDom(() => overdoseLossView());
    const h1s = byTag(view, 'h1');
    assert.equal(h1s.length, 1);
    assert.equal(h1s[0].textContent, 'Después de una muerte por sobredosis');
    const text = view.textContent;
    assert.match(text, /Hablar con los niños/);
    assert.match(text, /Llame o envíe un mensaje de texto al 988/);
    assert.match(text, /médico forense/);
    assert.doesNotMatch(text, /After an overdose death/);
    assert.doesNotMatch(text, /(^|\s)tú(\s|$)|\bpuedes\b|\btienes\b/);
  } finally {
    useDictionary('en', {});
  }
});

test('route, title, catalog, service worker, and Spanish keys are registered', async () => {
  const view = await LAZY_LOADERS['overdose-loss']();
  assert.equal(view, overdoseLossView);
  assert.equal(ROUTE_TITLES['overdose-loss'](), 'After an overdose death');

  const entry = TOOL_CATALOG.find((t) => t.id === 'overdose-loss');
  assert.ok(entry);
  assert.equal(entry.path, '#/overdose-loss');
  assert.ok(filterCareTools({ query: 'grief' }).some((t) => t.id === 'overdose-loss'));
  assert.ok(filterCareTools({ query: 'death certificates' }).some((t) => t.id === 'overdose-loss'));

  const sw = readFileSync('public/sw.js', 'utf8');
  const elective = sw.match(/const ELECTIVE_SHELL = \[([\s\S]*?)\];/)[1];
  assert.ok(elective.includes("'/js/views/overdoseLoss.js'"));

  for (const key of ['route.overdoseLoss', 'tools.item.overdose-loss.title', 'tools.item.overdose-loss.description']) {
    assert.ok(es[key], `missing Spanish key ${key}`);
  }
});

test('static privacy and security audit', () => {
  const src = readFileSync(new URL('../public/js/views/overdoseLoss.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(src, /innerHTML|outerHTML/);
  assert.doesNotMatch(src, /style\s*[=:]/);
  assert.doesNotMatch(src, /fetch\s*\(|XMLHttpRequest|sendBeacon/);
  assert.match(src, /from '\.\.\/content\/hotlines\.js'/);
});
