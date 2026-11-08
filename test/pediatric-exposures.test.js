import test from 'node:test';
import assert from 'node:assert/strict';

import {
  POISON_CONTROL_NUMBER,
  PEDIATRIC_SYNDROME_PROFILES,
  PEDIATRIC_HARM_REDUCTION_RULES,
  getPediatricState,
  setPediatricState,
  resetPediatricState,
  subscribePediatricState,
  evaluatePediatricRisk,
  formatPediatricSbarText,
  pediatricExposuresView,
} from '../public/js/views/pediatricExposures.js';
import { setLanguage } from '../public/js/i18n.js';

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
        toggle: (c, force) => {
          const has = this.classList.contains(c);
          const next = force !== undefined ? Boolean(force) : !has;
          if (next) this.classList.add(c);
          else this.classList.remove(c);
          return next;
        },
      };
    }

    setAttribute(k, v) {
      const val = String(v);
      this.attributes[k] = val;
      if (k === 'id') this.id = val;
      if (k === 'class') this.className = val;
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
        this.dataset[camel] = val;
      }
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

  globalThis.Node = MockElement;
  globalThis.document = {
    documentElement: new MockElement('HTML'),
    createElement: (tag) => new MockElement(tag),
    createTextNode: (text) => ({ nodeType: 3, textContent: String(text) }),
    getElementById: () => null,
    querySelectorAll: () => [],
  };
}

test('POISON_CONTROL_NUMBER is 1-800-222-1222', () => {
  assert.equal(POISON_CONTROL_NUMBER, '1-800-222-1222');
});

test('PEDIATRIC_SYNDROME_PROFILES contains all 6 required clinical modules with bilingual parity', () => {
  const expectedKeys = [
    'buprenorphine_methadone_ingestion',
    'illicit_opioid_fentanyl_exposure',
    'cannabis_edible_ingestion',
    'nicotine_eliquid_pouch_ingestion',
    'clonidine_alpha2_xylazine_exposure',
    'safe_storage_plan_of_safe_care',
  ];
  const keys = Object.keys(PEDIATRIC_SYNDROME_PROFILES);
  assert.equal(keys.length, 6);
  for (const k of expectedKeys) {
    assert.ok(PEDIATRIC_SYNDROME_PROFILES[k], `Missing profile: ${k}`);
    const item = PEDIATRIC_SYNDROME_PROFILES[k];
    assert.ok(item.titleEn && item.titleEs, `${k} has bilingual titles`);
    assert.ok(item.summaryEn && item.summaryEs, `${k} has bilingual summaries`);
    assert.ok(item.pathophysiologyEn && item.pathophysiologyEs, `${k} has bilingual pathophysiology`);
    assert.ok(item.diagnosticsEn.length > 0 && item.diagnosticsEs.length > 0, `${k} has diagnostics`);
    assert.ok(item.managementEn.length > 0 && item.managementEs.length > 0, `${k} has management`);
    assert.ok(item.harmReductionEn.length > 0 && item.harmReductionEs.length > 0, `${k} has harm reduction`);
  }
});

test('PEDIATRIC_HARM_REDUCTION_RULES covers essential child safety rules', () => {
  assert.ok(PEDIATRIC_HARM_REDUCTION_RULES.length >= 6);
  for (const r of PEDIATRIC_HARM_REDUCTION_RULES) {
    assert.ok(r.id && r.titleEn && r.titleEs && r.bodyEn && r.bodyEs);
  }
});

test('Pediatric in-RAM state getters, setters, reset, and subscription work ephemerally', () => {
  resetPediatricState();
  const initial = getPediatricState();
  assert.equal(initial.selectedSyndrome, 'buprenorphine_methadone_ingestion');
  assert.equal(initial.childNotBreathingOrUnresponsive, false);
  assert.equal(initial.clinicalNotes, '');

  let fired = 0;
  const unsub = subscribePediatricState(() => {
    fired += 1;
  });

  setPediatricState({ childNotBreathingOrUnresponsive: true, clinicalNotes: '2yo, 11kg' });
  assert.equal(getPediatricState().childNotBreathingOrUnresponsive, true);
  assert.equal(getPediatricState().clinicalNotes, '2yo, 11kg');
  assert.ok(fired >= 1);

  unsub();
  resetPediatricState();
  assert.equal(getPediatricState().childNotBreathingOrUnresponsive, false);
  assert.equal(getPediatricState().clinicalNotes, '');
});

test('evaluatePediatricRisk evaluates emergencies and flags correctly', () => {
  const safeState = {
    selectedSyndrome: 'safe_storage_plan_of_safe_care',
    childNotBreathingOrUnresponsive: false,
    moudOrMethadoneIngestionWellAppearing: false,
    counterfeitPillOrPowderAccess: false,
    edibleCannabisIngestion: false,
    nicotineLiquidOrPouchIngestion: false,
  };
  const safeEval = evaluatePediatricRisk(safeState, 'en');
  assert.equal(safeEval.urgency, 'ROUTINE');
  assert.equal(safeEval.redFlags.length, 0);

  const emergencyState = {
    ...safeState,
    childNotBreathingOrUnresponsive: true,
  };
  const emergEval = evaluatePediatricRisk(emergencyState, 'en');
  assert.equal(emergEval.urgency, 'EMERGENCY');
  assert.ok(emergEval.redFlags.length > 0);
});

test('formatPediatricSbarText formats clean Zero-PII text with Poison Control phone number', () => {
  const state = {
    selectedSyndrome: 'buprenorphine_methadone_ingestion',
    childNotBreathingOrUnresponsive: false,
    moudOrMethadoneIngestionWellAppearing: true,
    clinicalNotes: 'RAM only test note',
  };
  const sbar = formatPediatricSbarText(state, 'en');
  assert.ok(sbar.includes('1-800-222-1222'));
  assert.ok(sbar.includes('RAM only test note'));
  assert.ok(sbar.includes('PEDIATRIC ACCIDENTAL EXPOSURE'));
});

test('pediatricExposuresView renders top-level h1 and interactive components', async () => {
  installMockDom();
  await setLanguage('en');
  resetPediatricState();

  const view = pediatricExposuresView();
  assert.ok(view, 'View renders');
  const h1 = view.querySelector('h1');
  assert.ok(h1, 'View has an h1 header');
  assert.ok(h1.textContent.includes('Pediatric Accidental Exposures'));

  // Switch to Spanish
  await setLanguage('es');
  const viewEs = pediatricExposuresView();
  const h1Es = viewEs.querySelector('h1');
  assert.ok(h1Es.textContent.includes('Exposiciones Pediátricas Accidentales'));
  await setLanguage('en');
});
