import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GERIATRIC_SYNDROME_PROFILES,
  GERIATRIC_HARM_REDUCTION_RULES,
  getGeriatricState,
  setGeriatricState,
  resetGeriatricState,
  subscribeGeriatricState,
  evaluateGeriatricRisk,
  formatGeriatricSbarText,
  geriatricCareView,
} from '../public/js/views/geriatricCare.js';
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

test('GERIATRIC_SYNDROME_PROFILES contains all 6 required clinical modules with bilingual parity', () => {
  const expectedKeys = [
    'beers_sedative_polypharmacy',
    'anticholinergic_cognitive_burden_acb',
    'geriatric_moud_pharmacokinetics',
    'orthostatic_hypotension_fall_fracture',
    'severe_oic_fecal_impaction',
    'cognitive_impairment_caregiver_moud',
  ];
  const keys = Object.keys(GERIATRIC_SYNDROME_PROFILES);
  assert.equal(keys.length, 6);
  for (const k of expectedKeys) {
    assert.ok(GERIATRIC_SYNDROME_PROFILES[k], `Missing profile: ${k}`);
    const item = GERIATRIC_SYNDROME_PROFILES[k];
    assert.ok(item.titleEn && item.titleEs, `${k} has bilingual titles`);
    assert.ok(item.summaryEn && item.summaryEs, `${k} has bilingual summaries`);
    assert.ok(item.pathophysiologyEn && item.pathophysiologyEs, `${k} has bilingual pathophysiology`);
    assert.ok(item.diagnosticsEn.length > 0 && item.diagnosticsEs.length > 0, `${k} has diagnostics`);
    assert.ok(item.managementEn.length > 0 && item.managementEs.length > 0, `${k} has management`);
    assert.ok(item.harmReductionEn.length > 0 && item.harmReductionEs.length > 0, `${k} has harm reduction`);
  }
});

test('GERIATRIC_HARM_REDUCTION_RULES covers essential geriatric safety rules', () => {
  assert.ok(GERIATRIC_HARM_REDUCTION_RULES.length >= 6);
  for (const r of GERIATRIC_HARM_REDUCTION_RULES) {
    assert.ok(r.id && r.ruleEn && r.ruleEs);
  }
});

test('Geriatric in-RAM state getters, setters, reset, and subscription work ephemerally', () => {
  resetGeriatricState();
  const initial = getGeriatricState();
  assert.equal(initial.selectedSyndromeId, 'beers_sedative_polypharmacy');
  assert.equal(initial.onBenzos, false);
  assert.equal(initial.clinicalNotes, '');

  let fired = 0;
  const unsub = subscribeGeriatricState(() => {
    fired += 1;
  });

  setGeriatricState({ onBenzos: true, clinicalNotes: 'Age 79, eGFR 42' });
  assert.equal(getGeriatricState().onBenzos, true);
  assert.equal(getGeriatricState().clinicalNotes, 'Age 79, eGFR 42');
  assert.ok(fired >= 1);

  unsub();
  resetGeriatricState();
  assert.equal(getGeriatricState().onBenzos, false);
  assert.equal(getGeriatricState().clinicalNotes, '');
});

test('evaluateGeriatricRisk flags AGS Beers polypharmacy and ACB burden accurately', () => {
  const safeState = {
    selectedSyndromeId: 'beers_sedative_polypharmacy',
    ageTier: '65-74',
    onBenzos: false,
    onZDrugs: false,
    onAnticholinergics: false,
    onOpioidsMOUD: false,
    highFallRisk: false,
    renalImpairment: false,
    historyDelirium: false,
    cognitiveImpairment: false,
    severeConstipation: false,
  };
  const evalSafe = evaluateGeriatricRisk(safeState);
  assert.equal(evalSafe.tier, 'STANDARD');
  assert.equal(evalSafe.beersAlerts.length, 0);

  const polyState = {
    ...safeState,
    ageTier: '75plus',
    onOpioidsMOUD: true,
    onBenzos: true,
    onAnticholinergics: true,
    highFallRisk: true,
  };
  const evalPoly = evaluateGeriatricRisk(polyState);
  assert.equal(evalPoly.tier, 'HIGH');
  assert.ok(evalPoly.beersAlerts.length > 0);
  assert.equal(evalPoly.acbScore, 3);
  assert.ok(evalPoly.riskScore >= 4);
});

test('formatGeriatricSbarText formats clean Zero-PII text with Beers alerts and recommendations', () => {
  const state = {
    selectedSyndromeId: 'beers_sedative_polypharmacy',
    ageTier: '75plus',
    onBenzos: true,
    onZDrugs: false,
    onAnticholinergics: true,
    onOpioidsMOUD: true,
    highFallRisk: true,
    renalImpairment: true,
    historyDelirium: false,
    cognitiveImpairment: true,
    severeConstipation: true,
    clinicalNotes: 'Test geriatric RAM note',
  };
  const sbar = formatGeriatricSbarText(state);
  assert.ok(sbar.includes('BEERS CRITERIA SBAR'));
  assert.ok(sbar.includes('Age 75+'));
  assert.ok(sbar.includes('BEERS ALERT:'));
  assert.ok(sbar.includes('ACB ~3'));
  assert.ok(sbar.includes('Test geriatric RAM note'));
});

test('geriatricCareView renders top-level h1 and interactive components in bilingual modes', async () => {
  installMockDom();
  await setLanguage('en');
  resetGeriatricState();

  const view = geriatricCareView();
  assert.ok(view, 'View renders');
  const h1 = view.querySelector('h1');
  assert.ok(h1, 'View has an h1 header');
  assert.ok(h1.textContent.includes('Geriatric Addiction Medicine'));

  // Switch to Spanish
  await setLanguage('es');
  const viewEs = geriatricCareView();
  const h1Es = viewEs.querySelector('h1');
  assert.ok(h1Es.textContent.includes('Medicina de Adicciones en Geriatría'));
  await setLanguage('en');
});
