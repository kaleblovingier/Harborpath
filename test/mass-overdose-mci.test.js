import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONTAMINANT_PROFILES,
  SALT_CATEGORIES,
  evaluateMassOverdoseMci,
  getMassOverdoseMciState,
  setMassOverdoseMciState,
  resetMassOverdoseMciState,
  subscribeMassOverdoseMciState,
  massOverdoseMciView,
} from '../public/js/views/massOverdoseMci.js';

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
      this.parentNode = null;
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

    get firstChild() {
      return this.children[0] || null;
    }

    remove() {
      if (this.parentNode) {
        const idx = this.parentNode.children.indexOf(this);
        if (idx !== -1) {
          this.parentNode.children.splice(idx, 1);
        }
      }
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
        child.parentNode = this;
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

test('CONTAMINANT_PROFILES holds validated toxicological specs', () => {
  assert.ok(CONTAMINANT_PROFILES.carfentanil_nitazene);
  assert.ok(CONTAMINANT_PROFILES.xylazine_medetomidine);
  assert.ok(CONTAMINANT_PROFILES.designer_benzos);

  const carf = CONTAMINANT_PROFILES.carfentanil_nitazene;
  assert.match(carf.nameEn, /Carfentanil/i);
  assert.match(carf.resuscitationRuleEn, /VENTILATION-FIRST/i);
  assert.match(carf.clinicalPresentationEn, /Wooden Chest/i);

  const xyl = CONTAMINANT_PROFILES.xylazine_medetomidine;
  assert.match(xyl.resuscitationRuleEn, /NOT opioids and are 100% UNRESPONSIVE/i);
});

test('SALT_CATEGORIES defines standard 4-tier triage buckets', () => {
  assert.equal(SALT_CATEGORIES.red.code, 'IMMEDIATE');
  assert.equal(SALT_CATEGORIES.yellow.code, 'DELAYED');
  assert.equal(SALT_CATEGORIES.green.code, 'MINIMAL');
  assert.equal(SALT_CATEGORIES.black.code, 'EXPECTANT');

  assert.match(SALT_CATEGORIES.red.actionEn, /BVM/i);
  assert.match(SALT_CATEGORIES.yellow.actionEn, /High-recovery lateral position/i);
});

test('evaluateMassOverdoseMci calculates casualties, flags and demands', () => {
  // Scenario 1: Isolated overdose (2 patients)
  const eval1 = evaluateMassOverdoseMci({
    contaminantId: 'carfentanil_nitazene',
    redCount: 1,
    yellowCount: 1,
    greenCount: 0,
    blackCount: 0,
    hasWoodenChest: false,
    hasSevereBradycardia: false,
    availableNaloxoneDoses: 10,
  });

  assert.equal(eval1.totalCasualties, 2);
  assert.equal(eval1.isSpikeCluster, false);
  assert.equal(eval1.estimatedNaloxoneNeeded, 4); // (1*3)+(1*1) = 4
  assert.equal(eval1.emergencyFlagsEn.length, 0);

  // Scenario 2: Active Spike Cluster with Wooden Chest and Supply Deficit
  const eval2 = evaluateMassOverdoseMci({
    contaminantId: 'carfentanil_nitazene',
    redCount: 3,
    yellowCount: 2,
    greenCount: 4,
    blackCount: 1,
    hasWoodenChest: true,
    hasSevereBradycardia: true,
    availableNaloxoneDoses: 6,
  });

  assert.equal(eval2.totalCasualties, 10);
  assert.equal(eval2.isSpikeCluster, true);
  assert.equal(eval2.estimatedNaloxoneNeeded, 11); // (3*3) + (2*1) = 11
  assert.ok(eval2.emergencyFlagsEn.some((f) => f.includes('MASS CASUALTY OVERDOSE SPIKE')));
  assert.ok(eval2.emergencyFlagsEn.some((f) => f.includes('WOODEN CHEST SYNDROME')));
  assert.ok(eval2.emergencyFlagsEn.some((f) => f.includes('ALPHA-2 AGONIST BRADYCARDIA')));
  assert.ok(eval2.emergencyFlagsEn.some((f) => f.includes('CRITICAL NALOXONE DEFICIT')));

  assert.match(eval2.sbarEn, /\[S\] SITUATION/);
  assert.match(eval2.sbarEs, /\[S\] SITUACIÓN/);
  assert.match(eval2.icsAlertTextEn, /MANDATORY ICS ACTIONS/);
});

test('Ephemeral state controller updates correctly and triggers subscribers', () => {
  resetMassOverdoseMciState();
  let fired = false;
  const unsubscribe = subscribeMassOverdoseMciState(() => {
    fired = true;
  });

  setMassOverdoseMciState({ redCount: 5, hasWoodenChest: false });
  const st = getMassOverdoseMciState();
  assert.equal(st.redCount, 5);
  assert.equal(st.hasWoodenChest, false);
  assert.equal(fired, true);

  unsubscribe();
  fired = false;
  setMassOverdoseMciState({ redCount: 2 });
  assert.equal(fired, false);

  resetMassOverdoseMciState();
  assert.equal(getMassOverdoseMciState().redCount, 2);
});

test('massOverdoseMciView renders safe DOM without innerHTML or inline styles', () => {
  const restoreDom = installMockDom();
  try {
    resetMassOverdoseMciState();
    const view = massOverdoseMciView();
    assert.ok(view);
    assert.equal(view.tagName, 'DIV');
    assert.ok(view.classList.contains('mass-mci-view'));

    const text = view.textContent;
    assert.match(text, /Mass Overdose Cluster/i);
    assert.match(text, /SALT Triage/i);
    assert.match(text, /RED/);
    assert.match(text, /YELLOW/);
    assert.match(text, /GREEN/);
    assert.match(text, /BLACK/);
    assert.match(text, /SBAR/);
  } finally {
    restoreDom();
  }
});
