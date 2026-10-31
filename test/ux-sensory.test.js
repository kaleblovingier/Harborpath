import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getSensoryModeState,
  getSensoryMode,
  setSensoryMode,
  toggleSensoryMode,
  resetSensoryMode,
  subscribeSensoryMode,
  handleSensoryKeydown,
  sensoryModeToggle,
} from '../public/js/components/sensoryMode.js';

import {
  isEmergencyDrawerOpen,
  openEmergencyDrawer,
  closeEmergencyDrawer,
  resetEmergencyDrawer,
  emergencyDrawer,
  emergencyDrawerButton,
  buildNaloxonePacingCard,
  buildOverdoseMatrixCard,
  buildGoodSamaritanCard,
  handleDrawerKeydown,
} from '../public/js/components/emergencyDrawer.js';

import { runQuickExitResets } from '../public/js/app.js';
import { state, setLocation } from '../public/js/state.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const componentsDir = path.join(here, '..', 'public', 'js', 'components');

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

  toggle(token, force) {
    const list = this._getClasses();
    const idx = list.indexOf(token);
    const exists = idx !== -1;
    const shouldAdd = force !== undefined ? Boolean(force) : !exists;
    if (shouldAdd && !exists) {
      list.push(token);
    } else if (!shouldAdd && exists) {
      list.splice(idx, 1);
    }
    this._setClasses(list);
    return shouldAdd;
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
    this.checked = false;
    this.disabled = false;
    this._hidden = false;
    this._textContent = '';
    this.isConnected = true;
    this.classList = new MockClassList(this);
    this.id = '';
  }

  get hidden() {
    return this._hidden || Object.hasOwn(this.attributes, 'hidden');
  }

  set hidden(v) {
    this._hidden = Boolean(v);
    if (this._hidden) this.attributes.hidden = '';
    else delete this.attributes.hidden;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'id') this.id = val;
    if (k === 'hidden') this._hidden = true;
    if (k === 'value') this.value = val;
    if (k === 'checked') this.checked = true;
    if (k === 'disabled') this.disabled = true;
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
    if (k === 'hidden') this._hidden = false;
    if (k === 'disabled') this.disabled = false;
  }

  addEventListener(evt, fn) {
    this.listeners[evt] = fn;
  }

  removeEventListener(evt) {
    delete this.listeners[evt];
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

  hasClass(cls) {
    return this.classList.contains(cls);
  }

  contains(node) {
    if (!node) return false;
    if (node === this) return true;
    for (const ch of this.children) {
      if (ch instanceof MockNode && ch.contains(node)) return true;
    }
    return false;
  }

  focus() {
    if (globalThis.document) {
      globalThis.document.activeElement = this;
    }
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
    const isId = selector.startsWith('#');
    const isClass = selector.startsWith('.');
    const isTag = /^[a-zA-Z0-9_-]+$/.test(selector);

    this.findAll((node) => {
      if (node === this) return false;
      if (isId && node.id === selector.slice(1)) return true;
      if (isClass && node.hasClass(selector.slice(1))) return true;
      if (isTag && node.tagName === selector.toUpperCase()) return true;
      if (selector.includes('button') && node.tagName === 'BUTTON') return true;
      if (selector.includes('[href]') && node.hasAttribute('href')) return true;
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
  announcer.setAttribute('aria-live', 'polite');
  body.append(announcer);

  const windowListeners = {};

  const doc = {
    body,
    documentElement: docElement,
    activeElement: body,
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: (id) => {
      if (id === 'announcer') return announcer;
      return body.querySelector(`#${id}`);
    },
    addEventListener: (evt, fn) => {
      windowListeners[evt] = fn;
    },
    removeEventListener: (evt) => {
      delete windowListeners[evt];
    },
  };

  const win = {
    addEventListener: (evt, fn) => {
      windowListeners[evt] = fn;
    },
    removeEventListener: (evt) => {
      delete windowListeners[evt];
    },
    _listeners: windowListeners,
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
    const res = fn({ body, docElement, announcer, win });
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

// ---------------------------------------------------------------- Tests: Sensory Mode

test('sensoryMode: pure state management functions (ephemeral in-RAM state)', () => {
  resetSensoryMode();
  assert.equal(getSensoryMode(), false);
  assert.deepEqual(getSensoryModeState(), { enabled: false, active: false });

  // Enable sensory mode
  const enabledRes = setSensoryMode(true);
  assert.equal(enabledRes, true);
  assert.equal(getSensoryMode(), true);
  assert.deepEqual(getSensoryModeState(), { enabled: true, active: true });

  // Toggle sensory mode
  const toggledOff = toggleSensoryMode();
  assert.equal(toggledOff, false);
  assert.equal(getSensoryMode(), false);

  const toggledOn = toggleSensoryMode();
  assert.equal(toggledOn, true);
  assert.equal(getSensoryMode(), true);

  // Reset sensory mode
  const resetRes = resetSensoryMode();
  assert.equal(resetRes, false);
  assert.equal(getSensoryMode(), false);
  assert.deepEqual(getSensoryModeState(), { enabled: false, active: false });
});

test('sensoryMode: subscriber notifications when mode changes', () => {
  resetSensoryMode();
  const log = [];
  const unsubscribe = subscribeSensoryMode((val) => log.push(val));

  setSensoryMode(true);
  toggleSensoryMode();
  resetSensoryMode();

  unsubscribe();
  setSensoryMode(true); // Should not record after unsubscribe

  assert.deepEqual(log, [true, false, false]);
  resetSensoryMode();
});

test('sensoryMode: adds and removes .sensory-mode-active class on document.body and root', () => {
  withMockDom(({ body, docElement }) => {
    resetSensoryMode();
    assert.equal(body.hasClass('sensory-mode-active'), false);
    assert.equal(docElement.hasClass('sensory-mode-active'), false);

    setSensoryMode(true);
    assert.equal(body.hasClass('sensory-mode-active'), true);
    assert.equal(docElement.hasClass('sensory-mode-active'), true);

    toggleSensoryMode();
    assert.equal(body.hasClass('sensory-mode-active'), false);
    assert.equal(docElement.hasClass('sensory-mode-active'), false);

    setSensoryMode(true);
    assert.equal(body.hasClass('sensory-mode-active'), true);

    resetSensoryMode();
    assert.equal(body.hasClass('sensory-mode-active'), false);
    assert.equal(docElement.hasClass('sensory-mode-active'), false);
  });
});

test('sensoryMode: sensoryModeToggle component renders accessible button with aria-pressed, tooltip, and hotkey', () => {
  withMockDom(() => {
    resetSensoryMode();
    const btn = sensoryModeToggle();

    assert.equal(btn.tagName, 'BUTTON');
    assert.equal(btn.getAttribute('type'), 'button');
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    assert.equal(btn.getAttribute('aria-keyshortcuts'), 'Alt+S');
    assert.equal(btn.getAttribute('aria-describedby'), 'sensory-mode-toggle-tooltip');
    assert.match(btn.getAttribute('title'), /Alt\+S/);

    const tooltip = btn.findAll((n) => n.id === 'sensory-mode-toggle-tooltip')[0];
    assert.ok(tooltip, 'Tooltip span should exist');
    assert.equal(tooltip.getAttribute('role'), 'tooltip');
    assert.match(tooltip.textContent, /Alt\+S/);

    const kbd = btn.findAll((n) => n.hasClass('sensory-hotkey-badge'))[0];
    assert.ok(kbd, 'KBD badge should exist');
    assert.equal(kbd.textContent, 'Alt+S');

    // Click to toggle on
    btn.listeners.click();
    assert.equal(getSensoryMode(), true);
    assert.equal(btn.getAttribute('aria-pressed'), 'true');
    assert.equal(btn.hasClass('active'), true);

    // External reset updates button reactively
    resetSensoryMode();
    assert.equal(getSensoryMode(), false);
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    assert.equal(btn.hasClass('active'), false);

    btn._unsubscribeSensory?.();
  });
});

test('sensoryMode: keyboard hotkey Alt+S triggers toggle', () => {
  resetSensoryMode();
  let prevented = false;
  const preventDefault = () => { prevented = true; };

  // Lowercase 's'
  handleSensoryKeydown({ altKey: true, ctrlKey: false, metaKey: false, key: 's', preventDefault });
  assert.equal(prevented, true);
  assert.equal(getSensoryMode(), true);

  // Uppercase 'S'
  prevented = false;
  handleSensoryKeydown({ altKey: true, ctrlKey: false, metaKey: false, key: 'S', preventDefault });
  assert.equal(prevented, true);
  assert.equal(getSensoryMode(), false);

  // Non-hotkey keypresses should be ignored
  prevented = false;
  handleSensoryKeydown({ altKey: false, ctrlKey: false, metaKey: false, key: 's', preventDefault });
  assert.equal(prevented, false);
  assert.equal(getSensoryMode(), false);

  handleSensoryKeydown({ altKey: true, ctrlKey: true, metaKey: false, key: 's', preventDefault });
  assert.equal(prevented, false);
  assert.equal(getSensoryMode(), false);

  resetSensoryMode();
});

// ---------------------------------------------------------------- Tests: Emergency Drawer

test('emergencyDrawer: state management functions open, close, and reset', () => {
  closeEmergencyDrawer();
  assert.equal(isEmergencyDrawerOpen(), false);

  openEmergencyDrawer();
  assert.equal(isEmergencyDrawerOpen(), true);

  closeEmergencyDrawer();
  assert.equal(isEmergencyDrawerOpen(), false);

  openEmergencyDrawer();
  assert.equal(isEmergencyDrawerOpen(), true);

  resetEmergencyDrawer();
  assert.equal(isEmergencyDrawerOpen(), false);
});

test('emergencyDrawer: builds DOM structure with accessibility landmarks, dialog role, and backdrop', () => {
  withMockDom(({ body }) => {
    closeEmergencyDrawer();
    const wrapper = emergencyDrawer({ singleton: false });

    assert.equal(wrapper.id, 'emergency-drawer-wrapper');
    assert.equal(wrapper.hidden, true);

    const backdrop = wrapper.findAll((n) => n.hasClass('emergency-drawer-backdrop'))[0];
    assert.ok(backdrop, 'Backdrop element should exist');
    assert.equal(backdrop.getAttribute('aria-hidden'), 'true');

    const drawer = wrapper.findAll((n) => n.id === 'emergency-drawer')[0];
    assert.ok(drawer, 'Drawer dialog element should exist');
    assert.equal(drawer.getAttribute('role'), 'dialog');
    assert.equal(drawer.getAttribute('aria-modal'), 'true');
    assert.equal(drawer.getAttribute('aria-labelledby'), 'emergency-drawer-title');
    assert.equal(drawer.getAttribute('aria-describedby'), 'emergency-drawer-desc');

    const title = drawer.findAll((n) => n.id === 'emergency-drawer-title')[0];
    assert.ok(title);
    assert.match(title.textContent, /Emergency Survival Guide/i);

    const closeBtn = drawer.findAll((n) => n.hasClass('emergency-drawer-close'))[0];
    assert.ok(closeBtn);
    assert.equal(closeBtn.getAttribute('type'), 'button');
    assert.ok(closeBtn.getAttribute('aria-label'));

    // Clicking close button calls closeEmergencyDrawer
    openEmergencyDrawer();
    assert.equal(isEmergencyDrawerOpen(), true);
    closeBtn.listeners.click();
    assert.equal(isEmergencyDrawerOpen(), false);

    // Clicking backdrop calls closeEmergencyDrawer
    openEmergencyDrawer();
    assert.equal(isEmergencyDrawerOpen(), true);
    backdrop.listeners.click();
    assert.equal(isEmergencyDrawerOpen(), false);
  });
});

test('emergencyDrawer: Card 1 - Naloxone & Rescue Breathing Pacing contains 4 critical steps and rhythm guide', () => {
  withMockDom(() => {
    const card = buildNaloxonePacingCard();
    assert.ok(card.hasClass('emergency-drawer-card'));
    assert.ok(card.hasClass('naloxone-pacing-card'));
    assert.ok(card.hasClass('print-handout'));

    const text = card.textContent;
    // Step 1: Check responsiveness
    assert.match(text, /Check responsiveness/i);
    assert.match(text, /rub.*sternum/i);

    // Step 2: Spray 4mg naloxone in 1 nostril
    assert.match(text, /Spray 4mg naloxone in 1 nostril/i);

    // Step 3: Rescue breathing 1 breath every 5 seconds
    assert.match(text, /Rescue breathing 1 breath every 5 seconds/i);

    // Step 4: Repeat in 2-3 min if no response
    assert.match(text, /Repeat in 2-3 min if no response/i);

    // Pacer pulse guide with role=timer
    const pacerGuide = card.findAll((n) => n.hasClass('pacer-pulse-guide'))[0];
    assert.ok(pacerGuide);
    assert.equal(pacerGuide.getAttribute('role'), 'timer');
    assert.equal(pacerGuide.getAttribute('aria-live'), 'polite');
    assert.match(pacerGuide.textContent, /1 breath every 5 seconds/i);
  });
});

test('emergencyDrawer: Card 2 - Opioid vs. Stimulant Overdose Matrix displays comparison table', () => {
  withMockDom(() => {
    const card = buildOverdoseMatrixCard();
    assert.ok(card.hasClass('emergency-drawer-card'));
    assert.ok(card.hasClass('overdose-matrix-card'));
    assert.ok(card.hasClass('print-handout'));

    const table = card.findAll((n) => n.tagName === 'TABLE')[0];
    assert.ok(table, 'Comparison table must exist');
    assert.equal(table.getAttribute('role'), 'table');

    const text = card.textContent;
    // Pupils
    assert.match(text, /Pinpoint pupils/i);
    assert.match(text, /Dilated pupils/i);

    // Breathing
    assert.match(text, /Slow\/no breathing/i);
    assert.match(text, /Rapid breathing/i);

    // Skin & Lips
    assert.match(text, /Pale\/blue lips/i);
    assert.match(text, /Hot\/sweaty skin/i);

    // Actions
    assert.match(text, /Naloxone works for opioids/i);
    assert.match(text, /Supportive cooling\/hydration for stimulants/i);

    // Cross-contamination rule
    assert.match(text, /fentanyl/i);
    assert.match(text, /ALWAYS give naloxone/i);
  });
});

test('emergencyDrawer: Card 3 - 911 Good Samaritan Script provides exact phrasing and location support', () => {
  withMockDom(() => {
    try {
      setLocation({ label: 'Seattle City Hall, 600 4th Ave' });
      const card = buildGoodSamaritanCard();
      assert.ok(card.hasClass('emergency-drawer-card'));
      assert.ok(card.hasClass('good-samaritan-card'));
      assert.ok(card.hasClass('print-handout'));

      const text = card.textContent;
      // Script quote
      assert.match(text, /I am at Seattle City Hall, 600 4th Ave/);
      assert.match(text, /A person is unresponsive and not breathing/);
      assert.match(text, /Medical help is needed immediately/);

      // Good Samaritan legal protection disclosure
      assert.match(text, /Good Samaritan/i);
      assert.match(text, /protection/i);

      // Call 911 action button
      const call911 = card.findAll((n) => n.getAttribute('href') === 'tel:911')[0];
      assert.ok(call911, 'Call 911 tel link must exist');
      assert.equal(call911.getAttribute('aria-label'), 'Call 911 immediately');
    } finally {
      setLocation(null);
    }
  });
});

test('emergencyDrawer: emergencyDrawerButton trigger component manages aria-expanded and toggles drawer', () => {
  withMockDom(() => {
    closeEmergencyDrawer();
    const btn = emergencyDrawerButton();

    assert.equal(btn.tagName, 'BUTTON');
    assert.equal(btn.getAttribute('type'), 'button');
    assert.equal(btn.getAttribute('aria-haspopup'), 'dialog');
    assert.equal(btn.getAttribute('aria-controls'), 'emergency-drawer');
    assert.equal(btn.getAttribute('aria-expanded'), 'false');

    // Click to open
    btn.listeners.click();
    assert.equal(isEmergencyDrawerOpen(), true);
    assert.equal(btn.getAttribute('aria-expanded'), 'true');

    // Click to close
    btn.listeners.click();
    assert.equal(isEmergencyDrawerOpen(), false);
    assert.equal(btn.getAttribute('aria-expanded'), 'false');

    btn._unsubscribeTrigger?.();
  });
});

test('emergencyDrawer: keyboard trap and Escape-key handling', () => {
  withMockDom(({ body }) => {
    const triggerBtn = new MockNode('button');
    triggerBtn.setAttribute('id', 'test-trigger');
    body.append(triggerBtn);
    triggerBtn.focus();

    openEmergencyDrawer(triggerBtn);
    assert.equal(isEmergencyDrawerOpen(), true);

    let prevented = false;
    let stopped = false;
    const preventDefault = () => { prevented = true; };
    const stopPropagation = () => { stopped = true; };

    // Escape closes drawer and restores focus
    handleDrawerKeydown({ key: 'Escape', preventDefault, stopPropagation });
    assert.equal(prevented, true);
    assert.equal(stopped, true);
    assert.equal(isEmergencyDrawerOpen(), false);
    assert.equal(globalThis.document.activeElement, triggerBtn);
  });
});

test('quickExit: runQuickExitResets resets sensory mode and closes emergency drawer', async () => {
  withMockDom(async () => {
    setSensoryMode(true);
    openEmergencyDrawer();
    assert.equal(getSensoryMode(), true);
    assert.equal(isEmergencyDrawerOpen(), true);

    runQuickExitResets();

    // Give dynamic imports microtask time to settle
    await new Promise((r) => setTimeout(r, 20));

    assert.equal(getSensoryMode(), false);
    assert.equal(isEmergencyDrawerOpen(), false);
  });
});

test('security & WCAG: zero innerHTML, outerHTML, or inline style= across sensory & emergency modules', () => {
  const targetFiles = [
    path.join(componentsDir, 'sensoryMode.js'),
    path.join(componentsDir, 'emergencyDrawer.js'),
  ];

  for (const file of targetFiles) {
    const src = fs.readFileSync(file, 'utf8');
    const base = path.basename(file);

    assert.equal(
      /\b(?:innerHTML|outerHTML|insertAdjacentHTML)\b/.test(src),
      false,
      `${base} contains forbidden innerHTML/outerHTML sink`
    );

    assert.equal(
      /\sstyle\s*=\s*['"]/i.test(src),
      false,
      `${base} contains forbidden inline style= attribute`
    );
  }
});
