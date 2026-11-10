import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARCERAL_MOUD_REGIMENS,
  CARCERAL_STAGES,
  evaluateCarceralReentryPlan,
  getCarceralReentryState,
  setCarceralReentryState,
  resetCarceralReentryState,
  subscribeCarceralReentryState,
  carceralMoudReentryView,
} from '../public/js/views/carceralMoudReentry.js';

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
  const prevNode = globalThis.Node;

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
    globalThis.Node = prevNode;
  };
}

test('CARCERAL_MOUD_REGIMENS covers all FDA-approved modalities with bridge strategies', () => {
  const keys = Object.keys(CARCERAL_MOUD_REGIMENS);
  assert.deepEqual(keys, ['methadone', 'buprenorphine_sl', 'buprenorphine_depot', 'naltrexone_depot']);

  const meth = CARCERAL_MOUD_REGIMENS.methadone;
  assert.match(meth.verificationMethodEn, /DEA 21 CFR § 1306\.07\(c\)/);

  const depot = CARCERAL_MOUD_REGIMENS.buprenorphine_depot;
  assert.match(depot.bridgeStrategyEn, /OPTIMAL REENTRY REGIMEN/);

  const naltrexone = CARCERAL_MOUD_REGIMENS.naltrexone_depot;
  assert.match(naltrexone.bridgeStrategyEn, /PATIENT-CHOICE ONLY/);
});

test('CARCERAL_STAGES models full continuum from booking to gate release', () => {
  assert.ok(CARCERAL_STAGES.s0_booking);
  assert.ok(CARCERAL_STAGES.s1_verification);
  assert.ok(CARCERAL_STAGES.s2_maintenance);
  assert.ok(CARCERAL_STAGES.s3_reentry_countdown);
  assert.ok(CARCERAL_STAGES.s4_discharge_prep);
  assert.ok(CARCERAL_STAGES.s5_gate_release);

  assert.match(CARCERAL_STAGES.s1_verification.tasksEn[2], /Title II of the ADA/i);
  assert.match(CARCERAL_STAGES.s5_gate_release.tasksEn[0], /Naloxone Kit/i);
});

test('evaluateCarceralReentryPlan scores 4 pillars and raises critical gap alerts', () => {
  // Scenario 1: Fully prepared client (4/4 pillars)
  const evalFull = evaluateCarceralReentryPlan({
    regimenId: 'buprenorphine_sl',
    currentStage: 's4_discharge_prep',
    daysUntilRelease: 10,
    medicaidReactivated: true,
    communityAppointmentConfirmed: true,
    bridgeMedicationSupplied: true,
    naloxoneKitDispensed: true,
  });
  assert.equal(evalFull.readinessScore, 4);
  assert.equal(evalFull.isFullyPrepared, true);
  assert.equal(evalFull.alertsEn.length, 0);
  assert.match(evalFull.sbarEn, /4\/4 Pillars verified/);

  // Scenario 2: High risk client (release in 5 days without bridge meds or appointment)
  const evalRisk = evaluateCarceralReentryPlan({
    regimenId: 'methadone',
    currentStage: 's4_discharge_prep',
    daysUntilRelease: 5,
    medicaidReactivated: false,
    communityAppointmentConfirmed: false,
    bridgeMedicationSupplied: false,
    naloxoneKitDispensed: false,
  });
  assert.equal(evalRisk.readinessScore, 0);
  assert.equal(evalRisk.isFullyPrepared, false);
  assert.ok(evalRisk.alertsEn.some((a) => a.includes('CRITICAL MOUD GAP')));
  assert.ok(evalRisk.alertsEn.some((a) => a.includes('UNCONFIRMED CLINIC HANDOFF')));
  assert.ok(evalRisk.alertsEn.some((a) => a.includes('OVERDOSE PREVENTION KIT MISSING')));

  // Title II ADA legal notice is always present
  assert.match(evalRisk.legalClauseEn, /Title II of the Americans with Disabilities Act/i);
  assert.match(evalRisk.legalClauseEs, /Título II de la Ley ADA/i);
});

test('In-RAM ephemeral state controller updates and triggers subscribers', () => {
  resetCarceralReentryState();
  let called = false;
  const unsubscribe = subscribeCarceralReentryState(() => {
    called = true;
  });

  setCarceralReentryState({ daysUntilRelease: 7, bridgeMedicationSupplied: false });
  const st = getCarceralReentryState();
  assert.equal(st.daysUntilRelease, 7);
  assert.equal(st.bridgeMedicationSupplied, false);
  assert.equal(called, true);

  unsubscribe();
  called = false;
  setCarceralReentryState({ daysUntilRelease: 14 });
  assert.equal(called, false);

  resetCarceralReentryState();
  assert.equal(getCarceralReentryState().daysUntilRelease, 21);
});

test('carceralMoudReentryView mounts accessible DOM tree without innerHTML or style attributes', () => {
  const restoreDom = installMockDom();
  try {
    resetCarceralReentryState();
    const view = carceralMoudReentryView();
    assert.ok(view);
    assert.equal(view.tagName, 'DIV');
    assert.ok(view.classList.contains('carceral-reentry-view'));

    const text = view.textContent;
    assert.match(text, /Carceral Intake & Reentry MOUD/i);
    assert.match(text, /Title II ADA/i);
    assert.match(text, /Post-Release Overdose Spike/i);
    assert.match(text, /4 Safe Reentry Pillars/i);
    assert.match(text, /SBAR/i);
  } finally {
    restoreDom();
  }
});
