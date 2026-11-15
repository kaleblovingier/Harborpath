import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Zero npm dependencies constraint check
const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, '..');

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
    this.tabIndex = 0;
    this.disabled = false;
    this.checked = false;
    this._textContent = '';
    this.classList = new MockClassList(this);
    this.parent = null;
  }

  get parentNode() {
    return this.parent;
  }

  get parentElement() {
    return this.parent;
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

  get isConnected() {
    return true;
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

  dispatchEvent(evt) {
    const name = typeof evt === 'string' ? evt : evt?.type;
    const fn = this.listeners[name];
    if (typeof fn === 'function') {
      fn({ target: this, currentTarget: this, ...evt });
    }
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string') {
        const textNode = new MockNode('#text');
        textNode._textContent = item;
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
    if (idx >= 0) this.parent.children.splice(idx, 1);
  }

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(pred, acc);
    }
    return acc;
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results[0] ?? null;
  }

  querySelectorAll(selector) {
    const list = [];

    this.findAll((node) => {
      if (node === this) return false;
      if (selector.startsWith('#') && node.id === selector.slice(1)) return true;
      if (selector.startsWith('.') && node.classList.contains(selector.slice(1))) return true;
      if (/^[a-zA-Z0-9_-]+$/.test(selector) && node.tagName === selector.toUpperCase()) return true;
      if (selector.includes('#')) {
        const [tag, id] = selector.split('#');
        if ((!tag || node.tagName === tag.toUpperCase()) && node.id === id) return true;
      }
      if (selector.includes('.')) {
        const [tag, cls] = selector.split('.');
        if ((!tag || node.tagName === tag.toUpperCase()) && node.classList.contains(cls)) return true;
      }
      if (selector.includes('[role=') && selector.includes(']')) {
        const match = selector.match(/\[role=["']?([^"'\]]+)["']?\]/);
        if (match && node.getAttribute('role') === match[1]) return true;
      }
      if (selector.includes('[aria-labelledby=') && selector.includes(']')) {
        const match = selector.match(/\[aria-labelledby=["']?([^"'\]]+)["']?\]/);
        if (match && node.getAttribute('aria-labelledby') === match[1]) return true;
      }
      return false;
    }, list);

    return list;
  }
}

function withMockDom(fn) {
  const prevDoc = globalThis.document;
  const prevWin = globalThis.window;
  const prevNode = globalThis.Node;

  const body = new MockNode('body');
  const docElement = new MockNode('html');
  const announcer = new MockNode('div');
  announcer.setAttribute('id', 'announcer');
  body.append(announcer);

  const doc = {
    body,
    documentElement: docElement,
    activeElement: body,
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: (id) => (id === 'announcer' ? announcer : body.querySelector(`#${id}`)),
  };

  const win = {
    matchMedia: (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  };

  globalThis.Node = MockNode;
  globalThis.document = doc;
  globalThis.window = win;

  const restore = () => {
    globalThis.document = prevDoc;
    globalThis.window = prevWin;
    globalThis.Node = prevNode;
  };

  try {
    const res = fn({ body, announcer, win });
    if (res && typeof res.then === 'function') {
      return res.finally(restore);
    }
    restore();
    return res;
  } catch (err) {
    restore();
    throw err;
  }
}

// ============================================================================
// Imports under test
// ============================================================================

import { overdoseView } from '../public/js/views/guides.js';
import { runQuickExitResets } from '../public/js/app.js';
import {
  getOverdosePacerState,
  startRescueBreathingTimer,
  startReDoseTimer,
  recordFirstDose,
  resetOverdosePacer,
} from '../public/js/components/overdosePacing.js';

// ============================================================================
// Test Suite: Overdose Route Integration & Quick Exit Contracts
// ============================================================================

test('overdoseView() mounts both the static guide and the interactive pacer, with static guide appearing first in DOM', () => {
  withMockDom(() => {
    resetOverdosePacer();
    const view = overdoseView();

    assert.ok(view, 'overdoseView() must return a DOM root element');
    assert.ok(view.classList.contains('view-overdose'), 'Root element should have class view-overdose');

    // 1. Static guide presence
    const staticGuide = view.querySelector('.overdose');
    assert.ok(staticGuide, 'Static overdose guide (.overdose) must be present in overdoseView');

    // Verify key contents of the static guide (tabs, emergency response steps)
    const staticTabs = staticGuide.querySelector('.tabs');
    assert.ok(staticTabs, 'Static guide must render tablist for opioid vs stimulant');
    const staticPanel = staticGuide.querySelector('#od-panel');
    assert.ok(staticPanel, 'Static guide must render #od-panel');

    // 2. Interactive pacer presence
    const pacerRoot = view.querySelector('.overdose-pacer');
    assert.ok(pacerRoot, 'Interactive overdose pacer (.overdose-pacer) must be present in overdoseView');
    assert.equal(pacerRoot.getAttribute('role'), 'region');
    assert.equal(pacerRoot.getAttribute('aria-label'), 'Overdose Rescue Pacing Assistant');

    // 3. Accessible section wrapper: "Interactive rescue timer (optional)"
    const pacerSection = view.querySelector('section#rescue-timer');
    assert.ok(pacerSection, 'Pacer must be mounted inside an accessible section with id rescue-timer');
    assert.ok(pacerSection.classList.contains('section'), 'Pacer section must have class "section"');
    assert.equal(
      pacerSection.getAttribute('aria-labelledby'),
      'rescue-timer-title',
      'Pacer section must be labelled by its heading'
    );

    const sectionHeading = pacerSection.querySelector('#rescue-timer-title');
    assert.ok(sectionHeading, 'Section heading #rescue-timer-title must exist');
    assert.equal(sectionHeading.tagName, 'H2', 'Section heading must be an <h2>');
    assert.equal(
      sectionHeading.textContent.trim(),
      'Interactive rescue timer (optional)',
      'Heading text must exactly match "Interactive rescue timer (optional)"'
    );

    // Verify pacer is a descendant of the section
    assert.ok(
      pacerSection.querySelector('.overdose-pacer'),
      'The interactive pacer must be housed inside the accessible section'
    );

    // 4. Critical emergency safety verification:
    // Static guide MUST appear before the interactive pacer in the DOM child order
    const children = view.children;
    const staticGuideIndex = children.indexOf(staticGuide);
    const pacerSectionIndex = children.indexOf(pacerSection);

    assert.ok(staticGuideIndex >= 0, 'Static guide must be a direct child of view-overdose');
    assert.ok(pacerSectionIndex >= 0, 'Pacer section must be a direct child of view-overdose');
    assert.ok(
      staticGuideIndex < pacerSectionIndex,
      `Static guide (index ${staticGuideIndex}) MUST appear BEFORE the interactive pacer section (index ${pacerSectionIndex}) in the DOM tree for emergency accessibility`
    );

    // Header with 911 button is at index 0, followed by static guide
    const header = view.querySelector('header.page-header');
    assert.ok(header, 'Page header must be present');
    const headerIndex = children.indexOf(header);
    assert.ok(headerIndex < staticGuideIndex, 'Header with 911 button must appear first');
  });
});

test('overdose pacer registers its full timer reset and app.js imports nothing on exit', () => {
  const appSource = fs.readFileSync(path.join(rootDir, 'public', 'js', 'app.js'), 'utf8');
  const pacerSource = fs.readFileSync(path.join(rootDir, 'public', 'js', 'components', 'overdosePacing.js'), 'utf8');

  const fnMatch = appSource.match(/export function runQuickExitResets\(\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(fnMatch, 'runQuickExitResets() function must be exported from app.js');
  assert.ok(fnMatch[1].includes('executeGlobalQuickExit()'), 'runQuickExitResets runs the registered module resets');
  // Importing a module on the way out would fetch it, and an offline worker
  // would save it again right after the wipe.
  assert.doesNotMatch(fnMatch[1], /import\(/, 'runQuickExitResets must not import modules');

  assert.match(pacerSource, /import \{ registerQuickExitHandler \} from '\.\.\/quickExitRegistry\.js';/);
  assert.match(pacerSource, /^registerQuickExitHandler\(resetOverdoseTimerState\);/m);
});

test('calling runQuickExitResets() halts active pacer timers and restores clean state', async () => {
  await withMockDom(async () => {
    // 1. Test rescue breathing timer halts on quick exit
    resetOverdosePacer();
    startRescueBreathingTimer();
    let state = getOverdosePacerState();
    assert.equal(state.isBreathingActive, true, 'Rescue breathing timer should be active');

    runQuickExitResets();
    // Allow dynamic import in runQuickExitResets to resolve
    await new Promise((r) => setTimeout(r, 50));

    state = getOverdosePacerState();
    assert.equal(state.isBreathingActive, false, 'Rescue breathing timer must be halted after quick exit');
    assert.equal(state.currentStep, 1, 'Pacer step must reset to 1 after quick exit');

    // 2. Test re-dose countdown timer halts on quick exit
    resetOverdosePacer();
    startReDoseTimer();
    state = getOverdosePacerState();
    assert.equal(state.reDoseTimerActive, true, 'Re-dose timer should be active');

    runQuickExitResets();
    await new Promise((r) => setTimeout(r, 50));

    state = getOverdosePacerState();
    assert.equal(state.reDoseTimerActive, false, 'Re-dose timer must be halted after quick exit');

    // 3. Test comprehensive active rescue scenario: first dose recorded, breathing active, step 3
    resetOverdosePacer();
    recordFirstDose({ route: 'nasal_4mg', nostril: 'right' });
    startRescueBreathingTimer();
    state = getOverdosePacerState();
    assert.equal(state.firstDoseAdministered, true);
    assert.equal(state.reDoseTimerActive, true);
    assert.equal(state.isBreathingActive, true);

    runQuickExitResets();
    await new Promise((r) => setTimeout(r, 50));

    state = getOverdosePacerState();
    assert.equal(state.isBreathingActive, false, 'Breathing must be inactive');
    assert.equal(state.reDoseTimerActive, false, 'Re-dose timer must be inactive');
    assert.equal(state.firstDoseAdministered, false, 'First dose status must be reset');
    assert.equal(state.currentStep, 1, 'Current step must be restored to 1');
    assert.equal(state.breathCount, 0, 'Breath count must be reset to 0');
  });
});

test('idempotency: multiple rapid calls to runQuickExitResets() do not throw and remain reset', async () => {
  await withMockDom(async () => {
    resetOverdosePacer();
    startRescueBreathingTimer();
    startReDoseTimer();

    assert.doesNotThrow(() => {
      runQuickExitResets();
      runQuickExitResets();
      runQuickExitResets();
    });

    await new Promise((r) => setTimeout(r, 50));
    const state = getOverdosePacerState();
    assert.equal(state.isBreathingActive, false);
    assert.equal(state.reDoseTimerActive, false);
  });
});

test('strict constraints: zero innerHTML, outerHTML, or inline style= across guides.js and app.js', () => {
  const targetFiles = [
    path.join(rootDir, 'public', 'js', 'views', 'guides.js'),
    path.join(rootDir, 'public', 'js', 'app.js'),
  ];

  for (const file of targetFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(
      content,
      /innerHTML/i,
      `File ${path.basename(file)} must not use innerHTML`
    );
    assert.doesNotMatch(
      content,
      /outerHTML/i,
      `File ${path.basename(file)} must not use outerHTML`
    );
    assert.doesNotMatch(
      content,
      /style\s*=\s*['"]/i,
      `File ${path.basename(file)} must not use inline style= attributes`
    );
  }
});
