import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ICU_SYNDROME_PROFILES,
  ICU_HARM_REDUCTION_RULES,
  getIcuState,
  setIcuState,
  resetIcuState,
  subscribeIcuState,
  evaluateIcuRisk,
  formatIcuSbarText,
  icuPerioperativeView,
} from '../public/js/views/icuPerioperative.js';
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

test('ICU_SYNDROME_PROFILES & ICU_HARM_REDUCTION_RULES contain complete bilingual clinical guidance', () => {
  const keys = Object.keys(ICU_SYNDROME_PROFILES);
  assert.equal(keys.length, 6);
  assert.deepEqual(keys, [
    'rsi_induction_neuromuscular_blockade',
    'icu_analgosedation_fentanyl_xylazine',
    'propofol_infusion_syndrome_propylene_glycol',
    'perioperative_buprenorphine_methadone_xr_naltrexone',
    'extubation_bridge_phenobarbital_dexmedetomidine',
    'hyperthermic_icu_crises_mhs_nms_serotonin',
  ]);

  for (const s of Object.values(ICU_SYNDROME_PROFILES)) {
    assert.ok(s.titleEn && s.titleEs, `Missing title for ${s.id}`);
    assert.ok(s.pathophysiologyEn && s.pathophysiologyEs, `Missing pathophysiology for ${s.id}`);
    assert.ok(s.diagnosticsEn.length >= 2, `Expected >=2 diagnosticsEn for ${s.id}`);
    assert.ok(s.managementEn.length >= 2, `Expected >=2 managementEn for ${s.id}`);
    assert.ok(s.harmReductionEn && s.harmReductionEs, `Missing harmReduction for ${s.id}`);
  }

  assert.equal(ICU_HARM_REDUCTION_RULES.length, 5);
  for (const r of ICU_HARM_REDUCTION_RULES) {
    assert.ok(r.id && r.titleEn && r.titleEs && r.bodyEn && r.bodyEs);
  }
});

test('ICU state management is 100% ephemeral in-memory and resets cleanly', () => {
  resetIcuState();
  const initial = getIcuState();
  assert.equal(initial.selectedSyndrome, 'rsi_induction_neuromuscular_blockade');
  assert.equal(initial.rsiWithOverdoseDownTimeRhabdoOrAcidosis, false);
  assert.equal(initial.clinicalNotes, '');

  let notified = 0;
  const unsub = subscribeIcuState(() => { notified += 1; });

  setIcuState({
    selectedSyndrome: 'icu_analgosedation_fentanyl_xylazine',
    ventilatedFentanylXylazineAgitationDyssynchrony: true,
    rsiWithOverdoseDownTimeRhabdoOrAcidosis: true,
    clinicalNotes: 'K+ 5.7 mEq/L, CK 24,000 U/L, RASS +3 on fentanyl drip',
  });

  assert.equal(notified, 1);
  const updated = getIcuState();
  assert.equal(updated.selectedSyndrome, 'icu_analgosedation_fentanyl_xylazine');
  assert.equal(updated.ventilatedFentanylXylazineAgitationDyssynchrony, true);
  assert.equal(updated.rsiWithOverdoseDownTimeRhabdoOrAcidosis, true);

  resetIcuState();
  const wiped = getIcuState();
  assert.equal(wiped.selectedSyndrome, 'rsi_induction_neuromuscular_blockade');
  assert.equal(wiped.ventilatedFentanylXylazineAgitationDyssynchrony, false);
  assert.equal(wiped.clinicalNotes, '');
  unsub();
});

test('evaluateIcuRisk & formatIcuSbarText generate accurate emergency alerts and bilingual SBAR', () => {
  resetIcuState();
  setIcuState({
    selectedSyndrome: 'propofol_infusion_syndrome_propylene_glycol',
    highDosePropofolOrLorazepamDripAcidosis: true,
    coreTempOver40ClonusOrLeadPipeRigidity: true,
    clinicalNotes: 'Propofol 85 mcg/kg/min x 56h, TG 720 mg/dL, CK 19,200 U/L, Lactate 6.8 mmol/L',
  });

  const riskEn = evaluateIcuRisk(getIcuState(), 'en');
  assert.equal(riskEn.urgency, 'EMERGENCY');
  assert.equal(riskEn.redFlags.length, 2);
  assert.match(riskEn.redFlags[1], /Stop Propofol immediately/i);

  const sbarEn = formatIcuSbarText(getIcuState(), 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF/);
  assert.match(sbarEn, /Propofol 85 mcg\/kg\/min/);
  assert.match(sbarEn, /Propylene Glycol/i);

  const sbarEs = formatIcuSbarText(getIcuState(), 'es');
  assert.match(sbarEs, /ENTREGA CLÍNICA SBAR/);
  assert.match(sbarEs, /Propilenglicol/i);
});

test('icuPerioperativeView renders interactive syndrome selector, flags, SBAR generator, and Spanish localization', async () => {
  installMockDom();
  resetIcuState();
  await setLanguage('en');

  const root = icuPerioperativeView();
  assert.ok(root.textContent.includes('Critical Care (ICU), Safe Intubation (RSI)'));
  assert.ok(root.textContent.includes('SBAR CLINICAL HANDOFF'));

  const syndromeBtn = root.querySelector('[data-syndrome-id="perioperative_buprenorphine_methadone_xr_naltrexone"]');
  assert.ok(syndromeBtn, 'Expected perioperative syndrome button');
  syndromeBtn.click();
  assert.equal(getIcuState().selectedSyndrome, 'perioperative_buprenorphine_methadone_xr_naltrexone');
  assert.ok(root.textContent.includes('Vivitrol'));

  const flagCheckbox = root.querySelector('[data-flag-key="rsiWithOverdoseDownTimeRhabdoOrAcidosis"]');
  assert.ok(flagCheckbox, 'Expected RSI rhabdo flag checkbox');
  flagCheckbox.checked = true;
  flagCheckbox.dispatchEvent({ type: 'change' });
  assert.equal(getIcuState().rsiWithOverdoseDownTimeRhabdoOrAcidosis, true);
  assert.ok(root.textContent.includes('STRICTLY PROHIBIT Succinylcholine'));

  await setLanguage('es');
  const rootEs = icuPerioperativeView();
  assert.ok(rootEs.textContent.includes('ENTREGA CLÍNICA SBAR'));
  await setLanguage('en');
});
