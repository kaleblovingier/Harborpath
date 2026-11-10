import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MOUD_REGIMEN_OPTIONS,
  generateMoudDirective,
  getMoudDirectiveState,
  setMoudDirectiveState,
  resetMoudDirectiveState,
  subscribeMoudDirectiveState,
  moudDirectiveView,
} from '../public/js/views/moudDirective.js';

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

test('MOUD_REGIMEN_OPTIONS covers all 4 gold-standard medications with clinical guardrails', () => {
  const ids = MOUD_REGIMEN_OPTIONS.map((r) => r.id);
  assert.deepEqual(ids, ['methadone', 'buprenorphine', 'buprenorphine_xr', 'naltrexone_xr']);

  const methadone = MOUD_REGIMEN_OPTIONS.find((r) => r.id === 'methadone');
  assert.ok(methadone.contraindicationsEn.some((c) => c.includes('Nalbuphine')));
  assert.ok(methadone.contraindicationsEn.some((c) => c.includes('Buprenorphine')));
  assert.match(methadone.npoRuleEn, /50% of the oral dose/);

  const bupe = MOUD_REGIMEN_OPTIONS.find((r) => r.id === 'buprenorphine');
  assert.match(bupe.npoRuleEn, /mucosal.*without.*swallowing/i);
});

test('generateMoudDirective creates structured, verifiable, zero-PII payload', () => {
  const directive = generateMoudDirective({
    regimenId: 'methadone',
    dailyDose: '120 mg PO Daily',
    anonymousId: 'ANON-PASS-7712',
    clientInitials: 'T.K.',
    birthYear: 1992,
    otpClinic: 'Community Compassion Clinic',
    emergencyPhone: '1-800-555-4321',
    deaRegistration: 'DEA-***9921',
  });

  assert.equal(directive.anonymousId, 'ANON-PASS-7712');
  assert.equal(directive.clientInitials, 'T.K.');
  assert.equal(directive.birthYear, 1992);
  assert.equal(directive.dailyDose, '120 mg PO Daily');

  // Verify JSON schema
  const payload = directive.payload;
  assert.equal(payload.directiveType, 'EMERGENCY_MOUD_DIRECTIVE_AND_TREATMENT_RIGHTS');
  assert.equal(payload.subject.anonymousClientRef, 'ANON-PASS-7712');
  assert.equal(payload.treatingFacility.facilityName, 'Community Compassion Clinic');

  // Verify ADA Title II & DEA clauses
  assert.match(payload.legalAndRegulatoryClauses.adaTitleIiNotice, /Title II of the Americans with Disabilities Act/i);
  assert.match(payload.legalAndRegulatoryClauses.samhsaRuleRef, /DEA 21 CFR § 1306\.07\(c\)/);
  assert.match(payload.legalAndRegulatoryClauses.cfr42Part2Notice, /42 CFR Part 2/);

  // Verify clinical SBAR
  assert.match(directive.sbarEn, /\[S\] SITUATION/);
  assert.match(directive.sbarEn, /Community Compassion Clinic/);
  assert.match(directive.sbarEs, /\[S\] SITUACIÓN/);
  assert.match(directive.sbarEs, /1-800-555-4321/);
});

test('Ephemeral state controller tracks user selections and notifies subscribers', () => {
  resetMoudDirectiveState();
  let changeCount = 0;
  const unsubscribe = subscribeMoudDirectiveState(() => {
    changeCount += 1;
  });

  setMoudDirectiveState({ regimenId: 'buprenorphine', dailyDose: '24 mg SL Daily' });
  const st = getMoudDirectiveState();
  assert.equal(st.regimenId, 'buprenorphine');
  assert.equal(st.dailyDose, '24 mg SL Daily');
  assert.equal(changeCount, 1);

  unsubscribe();
  setMoudDirectiveState({ regimenId: 'methadone' });
  assert.equal(changeCount, 1);

  resetMoudDirectiveState();
  assert.equal(getMoudDirectiveState().regimenId, 'methadone');
});

test('moudDirectiveView renders DOM with wallet card and quick actions', () => {
  const restoreDom = installMockDom();
  try {
    resetMoudDirectiveState();
    const view = moudDirectiveView();
    assert.ok(view);
    assert.equal(view.tagName, 'DIV');
    assert.ok(view.classList.contains('moud-directive-view'));

    const text = view.textContent;
    assert.match(text, /Offline Emergency MOUD Directive/i);
    assert.match(text, /Verifiable Treatment Rights Pass/i);
    assert.match(text, /Wallet Card/i);
    assert.match(text, /Title II ADA/i);
    assert.match(text, /DEA 21 CFR § 1306\.07\(c\)/i);
  } finally {
    restoreDom();
  }
});
