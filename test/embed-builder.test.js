import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WIDGET_VARIANTS,
  PARTNERSHIP_STANDARDS,
  generateIframeSnippet,
  generateBadgeSnippet,
  getEmbedState,
  setEmbedState,
  resetEmbedBuilderState,
  subscribeEmbedState,
  embedBuilderView,
} from '../public/js/views/embedBuilder.js';

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

  try {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: async () => {} },
      configurable: true,
      writable: true,
    });
  } catch {}

  return () => {
    globalThis.document = prevDoc;
  };
}

test('WIDGET_VARIANTS contains 4 configured public health formats', () => {
  assert.equal(WIDGET_VARIANTS.length, 4);
  const ids = WIDGET_VARIANTS.map((v) => v.id);
  assert.deepEqual(ids, ['quick-search', 'naloxone-badge', 'crisis-banner', 'verified-point']);
});

test('PARTNERSHIP_STANDARDS guarantees zero telemetry and sandbox isolation', () => {
  assert.ok(PARTNERSHIP_STANDARDS.length >= 3);
  assert.match(PARTNERSHIP_STANDARDS[0].desc, /HIPAA and 42 CFR Part 2 compliant/);
  assert.match(PARTNERSHIP_STANDARDS[1].desc, /sandbox="allow-scripts allow-forms allow-popups allow-same-origin"/);
});

test('generateIframeSnippet constructs compliant sandbox iframe', () => {
  const snippet = generateIframeSnippet({
    widgetType: 'quick-search',
    theme: 'auto',
    accent: 'teal',
    widthPreset: 'responsive',
  });

  assert.match(snippet, /^<iframe src="https:\/\/harborpath-platform\.vercel\.app\/#\/match\?embed=1&theme=auto&accent=teal"/);
  assert.match(snippet, /width="100%"/);
  assert.match(snippet, /height="480"/);
  assert.match(snippet, /sandbox="allow-scripts allow-forms allow-popups allow-same-origin"/);
  assert.match(snippet, /loading="lazy"/);
  assert.doesNotMatch(snippet, /style=/);
});

test('generateIframeSnippet supports fixed width presets', () => {
  const snippet360 = generateIframeSnippet({
    widgetType: 'naloxone-badge',
    theme: 'dark',
    accent: 'ocean',
    widthPreset: 'fixed-360',
  });
  assert.match(snippet360, /width="360"/);
  assert.match(snippet360, /height="180"/);

  const snippet480 = generateIframeSnippet({
    widgetType: 'crisis-banner',
    theme: 'light',
    accent: 'teal',
    widthPreset: 'fixed-480',
  });
  assert.match(snippet480, /width="480"/);
  assert.match(snippet480, /height="140"/);
});

test('generateBadgeSnippet creates accessible SVG partner seal link', () => {
  const badge = generateBadgeSnippet();
  assert.match(badge, /class="harborpath-partner-seal"/);
  assert.match(badge, /target="_blank"/);
  assert.match(badge, /rel="noopener noreferrer"/);
  assert.match(badge, /<svg width="20" height="20"/);
  assert.match(badge, /HarborPath Verified Partner · Confidential Care Finder/);
});

test('embed state management, update, and reset', () => {
  resetEmbedBuilderState();
  assert.equal(getEmbedState().widgetType, 'quick-search');

  let callCount = 0;
  const unsubscribe = subscribeEmbedState(() => {
    callCount += 1;
  });

  setEmbedState({ widgetType: 'naloxone-badge', theme: 'dark' });
  assert.equal(getEmbedState().widgetType, 'naloxone-badge');
  assert.equal(getEmbedState().theme, 'dark');
  assert.equal(callCount, 1);

  resetEmbedBuilderState();
  assert.equal(getEmbedState().widgetType, 'quick-search');
  assert.equal(getEmbedState().theme, 'auto');
  unsubscribe();
});

test('embedBuilderView renders DOM with configuration and preview', () => {
  const cleanup = installMockDom();
  try {
    resetEmbedBuilderState();
    const view = embedBuilderView();
    assert.ok(view);
    assert.ok(view.classList.contains('embed-builder-view'));

    const tabs = view.querySelectorAll('.tab');
    assert.ok(tabs.length >= 4);

    const codeBoxes = view.querySelectorAll('.embed-code-box');
    assert.ok(codeBoxes.length >= 2);
  } finally {
    cleanup();
  }
});
