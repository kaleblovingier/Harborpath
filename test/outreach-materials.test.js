import test from 'node:test';
import assert from 'node:assert/strict';

import {
  POCKET_CARDS,
  getOutreachState,
  setOutreachState,
  resetOutreachState,
  subscribeOutreachState,
  outreachMaterialsView,
} from '../public/js/views/outreachMaterials.js';

function installMockDom() {
  class MockElement {
    constructor(tagName) {
      this.tagName = String(tagName || 'DIV').toUpperCase();
      this.attributes = {};
      this.children = [];
      this.listeners = {};
      this.style = {};
      this.dataset = {};
      this._textContent = '';
      this.className = '';
      this.id = '';
      this.checked = false;
      this.disabled = false;
      this.value = '';
      this.hidden = false;
      this.classList = {
        add: (...classes) => {
          const set = new Set(this.className.split(/\s+/).filter(Boolean));
          classes.forEach((c) => set.add(c));
          this.className = Array.from(set).join(' ');
        },
        remove: (...classes) => {
          const set = new Set(this.className.split(/\s+/).filter(Boolean));
          classes.forEach((c) => set.delete(c));
          this.className = Array.from(set).join(' ');
        },
        contains: (c) => this.className.split(/\s+/).filter(Boolean).includes(c),
      };
    }

    setAttribute(k, v) {
      const val = String(v);
      this.attributes[k] = val;
      if (k === 'id') this.id = val;
      if (k === 'class') this.className = val;
    }

    getAttribute(k) {
      if (k === 'id') return this.id || this.attributes.id || null;
      if (k === 'class') return this.className || this.attributes.class || null;
      return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
    }

    hasAttribute(k) {
      return Object.hasOwn(this.attributes, k);
    }

    removeAttribute(k) {
      delete this.attributes[k];
    }

    appendChild(child) {
      if (child !== null && child !== undefined) {
        this.children.push(child);
      }
      return child;
    }

    append(...items) {
      for (const item of items) {
        if (typeof item === 'string') {
          this.appendChild({ nodeType: 3, textContent: item });
        } else if (item) {
          this.appendChild(item);
        }
      }
    }

    replaceChildren(...items) {
      this.children = [];
      this.append(...items);
    }

    addEventListener(type, fn) {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push(fn);
    }

    dispatchEvent(evt) {
      const list = this.listeners[evt.type] || [];
      for (const fn of list) fn(evt);
    }

    click() {
      this.dispatchEvent({ type: 'click', target: this, preventDefault() {} });
    }

    get textContent() {
      const childText = this.children.map((c) => c.textContent || '').join('');
      return `${this._textContent}${childText}`;
    }

    set textContent(v) {
      this._textContent = String(v ?? '');
      this.children = [];
    }

    querySelectorAll(selector) {
      const results = [];
      const check = (node) => {
        if (!node || !node.tagName) return;
        let match = false;
        if (selector.startsWith('#')) {
          match = node.id === selector.slice(1);
        } else if (selector.startsWith('.')) {
          const cls = selector.slice(1);
          match = (node.className || '').split(/\s+/).includes(cls);
        } else if (selector.startsWith('[') && selector.endsWith(']')) {
          const inner = selector.slice(1, -1);
          const [attr, rawVal] = inner.split('=');
          if (rawVal !== undefined) {
            const expected = rawVal.replace(/^["']|["']$/g, '');
            match = node.getAttribute(attr) === expected;
          } else {
            match = node.hasAttribute(attr);
          }
        } else {
          match = node.tagName.toLowerCase() === selector.toLowerCase();
        }
        if (match) results.push(node);
        for (const child of node.children || []) check(child);
      };
      for (const child of this.children || []) check(child);
      return results;
    }

    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    }
  }

  const prevDoc = globalThis.document;
  const prevWin = globalThis.window;

  globalThis.Node = MockElement;
  globalThis.document = {
    createElement(tag) {
      return new MockElement(tag);
    },
    createElementNS(ns, tag) {
      return new MockElement(tag);
    },
    createTextNode(text) {
      return { nodeType: 3, textContent: String(text) };
    },
    getElementById(id) {
      return null;
    },
  };

  globalThis.window = {
    print: () => {},
  };

  return () => {
    globalThis.document = prevDoc;
    globalThis.window = prevWin;
  };
}

test('POCKET_CARDS contains 4 high-priority clinical street cards', () => {
  assert.equal(POCKET_CARDS.length, 4);
  const ids = POCKET_CARDS.map((c) => c.id);
  assert.deepEqual(ids, ['naloxone-steps', 'test-strips', 'good-samaritan', 'hospital-rights']);
});

test('POCKET_CARDS naloxone protocol covers 5 critical emergency steps', () => {
  const naloxoneCard = POCKET_CARDS.find((c) => c.id === 'naloxone-steps');
  assert.ok(naloxoneCard);
  assert.equal(naloxoneCard.steps.length, 5);
  assert.match(naloxoneCard.steps[0].title, /Responsiveness/i);
  assert.match(naloxoneCard.steps[1].title, /Call 911/i);
  assert.match(naloxoneCard.steps[2].title, /Naloxone/i);
  assert.match(naloxoneCard.steps[3].title, /Breathing/i);
  assert.match(naloxoneCard.steps[4].title, /Recovery/i);
});

test('POCKET_CARDS test strip protocol specifies 10:1 dilution rule', () => {
  const stripCard = POCKET_CARDS.find((c) => c.id === 'test-strips');
  assert.ok(stripCard);
  assert.match(stripCard.steps[1].title, /10:1 Water Rule/i);
  assert.match(stripCard.steps[1].desc, /FALSE POSITIVES if undiluted/i);
  assert.match(stripCard.steps[3].desc, /1 LINE = POSITIVE/i);
  assert.match(stripCard.steps[3].desc, /2 LINES = NEGATIVE/i);
});

test('POCKET_CARDS Good Samaritan card provides script and legal protections', () => {
  const gsCard = POCKET_CARDS.find((c) => c.id === 'good-samaritan');
  assert.ok(gsCard);
  assert.match(gsCard.steps[0].desc, /In 48 states and D\.C\./i);
  assert.match(gsCard.steps[1].desc, /unconscious and having trouble breathing/i);
  assert.match(gsCard.steps[2].desc, /Do not run away/i);
});

test('POCKET_CARDS hospital MOUD card asserts ADA and acute pain layering rights', () => {
  const moudCard = POCKET_CARDS.find((c) => c.id === 'hospital-rights');
  assert.ok(moudCard);
  assert.match(moudCard.steps[0].desc, /Americans with Disabilities Act/i);
  assert.match(moudCard.steps[1].desc, /Involuntary acute withdrawal/i);
  assert.match(moudCard.steps[2].desc, /continuing MOUD while layering standard short-acting opioids/i);
});

test('outreach state management, subscribe, and reset', () => {
  resetOutreachState();
  assert.equal(getOutreachState().activeCardId, 'naloxone-steps');
  assert.equal(getOutreachState().printAll, false);

  let notified = false;
  const unsubscribe = subscribeOutreachState(() => {
    notified = true;
  });

  setOutreachState({ activeCardId: 'test-strips', printAll: true });
  assert.equal(getOutreachState().activeCardId, 'test-strips');
  assert.equal(getOutreachState().printAll, true);
  assert.equal(notified, true);

  resetOutreachState();
  assert.equal(getOutreachState().activeCardId, 'naloxone-steps');
  assert.equal(getOutreachState().printAll, false);
  unsubscribe();
});

test('outreachMaterialsView renders cards, tabs, and print controls', () => {
  const cleanup = installMockDom();
  try {
    resetOutreachState();
    const view = outreachMaterialsView();
    assert.ok(view);
    assert.ok(view.classList.contains('outreach-materials-view'));

    const printableCards = view.querySelectorAll('.printable-pocket-card');
    assert.ok(printableCards.length >= 1);

    const tabs = view.querySelectorAll('.tab');
    assert.ok(tabs.length >= 4);

    const callout = view.querySelector('.outreach-hotlines-callout');
    assert.ok(callout);
  } finally {
    cleanup();
  }
});
