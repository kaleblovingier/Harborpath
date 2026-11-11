// Regression checks for findings from the accessibility audit (axe-core +
// keyboard walkthrough). These read the source; the browser walkthrough is
// scripts/e2e-match.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function publicJs() {
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.js')) out.push(full);
    }
  };
  walk(path.join(root, 'public/js'));
  return out;
}

test('setAttribute is never passed null (it would write the string "null")', () => {
  const found = [];
  for (const file of publicJs()) {
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (/setAttribute\([^)]*:\s*null\s*\)/.test(line)) found.push(`${path.basename(file)}:${i + 1}`);
    });
  }
  assert.deepEqual(found, []);
});

test('the danger question is a button, so arrow keys cannot open the emergency panel', () => {
  const match = read('public/js/views/match.js');
  assert.ok(!/legend: t\('match\.s1\.safety'/.test(match), 'must not be a radio group');
  assert.match(match, /h\('button', \{ type: 'button', class: 'btn btn-emergency', onclick: \(\) => \{ emergency = true;/);
});

test('match view re-renders restore focus instead of dropping it to <body>', () => {
  const match = read('public/js/views/match.js');
  assert.match(match, /const hadFocus = root\.contains\(document\.activeElement\);/);
  assert.match(match, /rerender\(adding \? 'm-compare' : boxId\)/);
  assert.match(match, /refilter\('m-f-online'\)/);
});

test('scrollable tables can be reached by keyboard', () => {
  for (const file of ['public/js/views/medications.js', 'public/js/views/match.js']) {
    const src = read(file);
    const wraps = src.match(/h\('div', \{ class: 'table-wrap'[^}]*\}/g) ?? [];
    for (const w of wraps) assert.match(w, /tabindex: '0'/, `${file}: ${w}`);
  }
});

test('selects cannot force horizontal scrolling on small phones', () => {
  const css = read('public/styles.css');
  assert.match(css, /\.select \{[^}]*max-width: 100%/);
  assert.match(css, /\.safety-bar a \{[^}]*min-height: 24px/);
});

// ------------------------------------------------------------ Minimal DOM harness for dom.js helpers
class MockElement {
  constructor(tag = 'div') {
    this.tagName = String(tag).toUpperCase();
    this.childNodes = [];
    this.parentNode = null;
    this.attributes = {};
    this.listeners = {};
    this.dataset = {};
    this.className = '';
    this.value = '';
    this.disabled = false;
    this._text = '';
    this.focused = false;
    this._isRoot = false;
  }
  get isConnected() {
    let cur = this;
    while (cur.parentNode) cur = cur.parentNode;
    return cur._isRoot;
  }
  get firstChild() { return this.childNodes[0] ?? null; }
  get id() { return this.attributes.id ?? ''; }
  get textContent() {
    return this.tagName === '#TEXT' ? this._text : this._text + this.childNodes.map((c) => c.textContent).join('');
  }
  set textContent(v) { this._text = String(v ?? ''); this.childNodes = []; }
  append(...nodes) {
    for (const n of nodes) {
      if (n === null || n === undefined || n === false) continue;
      const node = typeof n === 'string' ? Object.assign(new MockElement('#text'), { _text: n }) : n;
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
  }
  getAttribute(k) { return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null; }
  hasAttribute(k) { return Object.hasOwn(this.attributes, k); }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  dispatchEvent(evt) {
    evt.target ??= this;
    let cur = this;
    while (cur) {
      for (const fn of (cur.listeners[evt.type] ?? [])) fn(evt);
      cur = cur.parentNode;
    }
  }
  click() { this.dispatchEvent({ type: 'click', preventDefault() {} }); }
  focus() { this.focused = true; }
  matches(sel) {
    const attr = sel.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if (attr) {
      const val = this.getAttribute(attr[1]);
      return attr[2] !== undefined ? val === attr[2] : val !== null;
    }
    if (sel.startsWith('#')) return this.id === sel.slice(1);
    if (sel.startsWith('.')) return this.className.split(/\s+/).includes(sel.slice(1));
    return this.tagName === sel.toUpperCase();
  }
  closest(sel) {
    let cur = this;
    while (cur) {
      if (cur.matches?.(sel)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }
  *walk() {
    for (const c of this.childNodes) {
      if (c.tagName === '#TEXT') continue;
      yield c;
      yield* c.walk();
    }
  }
  querySelector(sel) {
    for (const el of this.walk()) if (el.matches(sel)) return el;
    return null;
  }
  querySelectorAll(sel) {
    return [...this.walk()].filter((el) => el.matches(sel));
  }
}

const sharedAnnouncer = new MockElement('div');
sharedAnnouncer.setAttribute('id', 'announcer');
sharedAnnouncer.setAttribute('aria-live', 'polite');

async function withMockDom(run) {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;
  const prevNavDesc = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  globalThis.Node = MockElement;
  globalThis.document = {
    createElement: (tag) => new MockElement(tag),
    createElementNS: (_ns, tag) => new MockElement(tag),
    getElementById: (id) => (id === 'announcer' ? sharedAnnouncer : null),
    documentElement: { lang: 'en' },
  };
  sharedAnnouncer.textContent = '';

  try {
    return await run({ announcer: sharedAnnouncer });
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
    if (prevNavDesc) Object.defineProperty(globalThis, 'navigator', prevNavDesc);
    else delete globalThis.navigator;
  }
}

test('copyText() writes to clipboard, announces status, restores trigger label, and handles rejected or missing clipboard', async () => {
  await withMockDom(async ({ announcer }) => {
    const { h, copyText } = await import('../public/js/dom.js');
    const written = [];
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: {
          writeText: async (txt) => { written.push(txt); },
        },
      },
      configurable: true,
    });

    const btn = h('button', { type: 'button' }, 'Copy SBAR Note');
    const ok = await copyText('Clinical Summary', {
      trigger: btn,
      copiedLabel: 'Copied!',
      announceSuccess: 'Summary copied to clipboard.',
      resetMs: 30,
    });
    assert.equal(ok, true);
    assert.deepEqual(written, ['Clinical Summary']);
    assert.equal(btn.textContent, 'Copied!');

    await new Promise((r) => setTimeout(r, 70));
    assert.equal(announcer.textContent, 'Summary copied to clipboard.');
    assert.equal(btn.textContent, 'Copy SBAR Note');

    // Rejected clipboard write triggers failure feedback & announcement without throwing
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: {
          writeText: async () => { throw new Error('Permission denied'); },
        },
      },
      configurable: true,
    });

    const failed = await copyText('Clinical Summary', {
      trigger: btn,
      failedLabel: 'Copy failed',
      announceFailure: 'Clipboard access denied.',
      resetMs: 30,
    });
    assert.equal(failed, false);
    assert.equal(btn.textContent, 'Copy failed');

    await new Promise((r) => setTimeout(r, 70));
    assert.equal(announcer.textContent, 'Clipboard access denied.');
    assert.equal(btn.textContent, 'Copy SBAR Note');

    // Missing navigator.clipboard gracefully falls back
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
    });
    const unavailable = await copyText('Clinical Summary', {
      trigger: btn,
      failedLabel: 'Unavailable',
      announceFailure: 'Clipboard unavailable.',
      resetMs: 25,
    });
    assert.equal(unavailable, false);
    assert.equal(btn.textContent, 'Unavailable');
    await new Promise((r) => setTimeout(r, 70));
    assert.equal(announcer.textContent, 'Clipboard unavailable.');
    assert.equal(btn.textContent, 'Copy SBAR Note');
  });
});

test('wireTablistKeyboard() handles ArrowRight/ArrowLeft/Home/End wrapping and roving tabindex across redraws', async () => {
  await withMockDom(async () => {
    const { h, clear, syncTablists, wireTablistKeyboard } = await import('../public/js/dom.js');
    const container = h('div', { class: 'tab-wrapper' });
    container._isRoot = true;

    const tabIds = ['one', 'two', 'three'];
    let active = 'one';

    const render = () => {
      clear(container);
      const list = h('div', { role: 'tablist', 'aria-label': 'Sections' },
        tabIds.map((id) => h('button', {
          type: 'button',
          role: 'tab',
          id: `tab-${id}`,
          'aria-selected': active === id ? 'true' : 'false',
          'aria-controls': 'shared-panel',
          onclick: () => {
            active = id;
            render();
          },
        }, id)),
      );
      const panel = h('div', {
        id: 'shared-panel',
        role: 'tabpanel',
        'aria-labelledby': `tab-${active}`,
      }, `Content ${active}`);
      container.append(list, panel);
      syncTablists(container);
    };

    render();
    wireTablistKeyboard(container);

    const getTabs = () => container.querySelectorAll('[role="tab"]');
    const pressKey = (tab, key) => {
      let prevented = false;
      tab.dispatchEvent({
        type: 'keydown',
        key,
        preventDefault() { prevented = true; },
      });
      return prevented;
    };

    assert.deepEqual(getTabs().map((t) => t.getAttribute('tabindex')), ['0', '-1', '-1']);

    // ArrowRight: one -> two (restores focus onto newly rendered tab)
    assert.equal(pressKey(getTabs()[0], 'ArrowRight'), true);
    assert.equal(active, 'two');
    assert.deepEqual(getTabs().map((t) => t.getAttribute('tabindex')), ['-1', '0', '-1']);
    assert.equal(getTabs()[1].focused, true);

    // ArrowRight: two -> three -> wraps to one
    pressKey(getTabs()[1], 'ArrowRight');
    assert.equal(active, 'three');
    pressKey(getTabs()[2], 'ArrowRight');
    assert.equal(active, 'one');
    assert.deepEqual(getTabs().map((t) => t.getAttribute('tabindex')), ['0', '-1', '-1']);
    assert.equal(getTabs()[0].focused, true);

    // ArrowLeft: wraps one -> three
    pressKey(getTabs()[0], 'ArrowLeft');
    assert.equal(active, 'three');
    assert.deepEqual(getTabs().map((t) => t.getAttribute('tabindex')), ['-1', '-1', '0']);
    assert.equal(getTabs()[2].focused, true);

    // Home -> one, End -> three
    pressKey(getTabs()[2], 'Home');
    assert.equal(active, 'one');
    assert.equal(getTabs()[0].focused, true);
    pressKey(getTabs()[0], 'End');
    assert.equal(active, 'three');
    assert.deepEqual(getTabs().map((t) => t.getAttribute('tabindex')), ['-1', '-1', '0']);
    assert.equal(getTabs()[2].focused, true);
  });
});

test('all 24 assigned views resolve every tab aria-controls to a rendered tabpanel and specify button types', async () => {
  const prevWin = globalThis.window;
  const prevMatchMedia = globalThis.matchMedia;
  globalThis.window = { matchMedia: () => ({ matches: false }), print: () => {} };
  globalThis.matchMedia = () => ({ matches: false });

  try {
    await withMockDom(async () => {
      const views = [
        ['ocularCare.js', 'ocularCareView', () => []],
        ['orthopedicCare.js', 'orthopedicCareView', () => []],
        ['hematologyCare.js', 'hematologyCareView', () => []],
        ['giCare.js', 'giCareView', () => []],
        ['metabolicCare.js', 'metabolicCareView', () => []],
        ['neurologyCare.js', 'neurologyCareView', () => []],
        ['adhdCare.js', 'adhdCareView', () => []],
        ['benzodiazepineCare.js', 'benzodiazepineCareView', () => []],
        ['dualDiagnosis.js', 'dualDiagnosisView', () => []],
        ['methadoneAccess.js', 'methadoneAccessView', () => []],
        ['adulterantCare.js', 'adulterantCareView', () => []],
        ['olderAdults.js', 'olderAdultsView', (c) => [c]],
        ['workplaceRights.js', 'workplaceRightsView', (c) => [c]],
        ['tribalHealth.js', 'tribalHealthView', (c) => [c]],
        ['lgbtqCare.js', 'lgbtqCareView', (c) => [c]],
        ['woundInfectious.js', 'woundInfectiousView', (c) => [c]],
        ['ruralHealth.js', 'ruralHealthView', (c) => [c]],
        ['disabilityCare.js', 'disabilityCareView', (c) => [c]],
        ['streetMedicine.js', 'streetMedicineView', (c) => [c]],
        ['immigrantHealth.js', 'immigrantHealthView', (c) => [c]],
        ['postOverdose.js', 'postOverdoseView', (c) => [c]],
        ['stimulantCare.js', 'stimulantCareView', (c) => [c]],
        ['core.js', 'healthView', () => [{ query: new URLSearchParams() }]],
      ];

      for (const [file, fn, makeArgs] of views) {
        const mod = await import(`../public/js/views/${file}`);
        const host = new MockElement('div');
        host._isRoot = true;
        const viewEl = mod[fn](...makeArgs(host));
        if (!viewEl.parentNode) host.append(viewEl);

        const byId = new Map();
        for (const el of host.walk()) {
          if (el.id) byId.set(el.id, el);
        }
        const tabs = host.querySelectorAll('[role="tab"]');
        assert.ok(tabs.length >= 2, `${file}: expected tablist tabs`);
        for (const tab of tabs) {
          assert.equal(tab.getAttribute('type'), 'button', `${file}: tab ${tab.id} must have type="button"`);
          const targetId = tab.getAttribute('aria-controls');
          assert.ok(targetId, `${file}: tab ${tab.id} missing aria-controls`);
          const panel = byId.get(targetId);
          assert.ok(panel, `${file}: aria-controls="${targetId}" has no matching element in DOM`);
          assert.equal(panel.getAttribute('role'), 'tabpanel', `${file}: #${targetId} must have role="tabpanel"`);
          if (tab.getAttribute('aria-selected') === 'true') {
            assert.equal(panel.getAttribute('aria-labelledby'), tab.id, `${file}: active tabpanel aria-labelledby mismatch`);
          }
        }
        for (const btn of host.querySelectorAll('button')) {
          assert.equal(btn.getAttribute('type'), 'button', `${file}: button "${btn.textContent}" missing type="button"`);
        }
      }
    });
  } finally {
    globalThis.window = prevWin;
    globalThis.matchMedia = prevMatchMedia;
  }
});
