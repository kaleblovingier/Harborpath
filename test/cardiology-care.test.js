import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARDIOLOGY_SYNDROME_PROFILES,
  CARDIOLOGY_HARM_REDUCTION_RULES,
  getCardiologyState,
  setCardiologyState,
  resetCardiologyState,
  subscribeCardiologyState,
  evaluateCardiologyRisk,
  formatCardiologySbarText,
  cardiologyCareView,
} from '../public/js/views/cardiologyCare.js';
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

test('CARDIOLOGY_SYNDROME_PROFILES & CARDIOLOGY_HARM_REDUCTION_RULES contain complete bilingual clinical guidance', () => {
  const keys = Object.keys(CARDIOLOGY_SYNDROME_PROFILES);
  assert.equal(keys.length, 6);
  assert.deepEqual(keys, [
    'stimulant_acs_vasospasm',
    'sodium_channel_wide_qrs',
    'qtc_torsades_de_pointes',
    'stimulant_aortic_dissection',
    'takotsubo_withdrawal_cardiomyopathy',
    'methamphetamine_cardiomyopathy_pah',
  ]);

  for (const s of Object.values(CARDIOLOGY_SYNDROME_PROFILES)) {
    assert.ok(s.titleEn && s.titleEs, `Missing title for ${s.id}`);
    assert.ok(s.pathophysiologyEn && s.pathophysiologyEs, `Missing pathophysiology for ${s.id}`);
    assert.ok(s.diagnosticsEn.length >= 2, `Expected >=2 diagnosticsEn for ${s.id}`);
    assert.ok(s.managementEn.length >= 2, `Expected >=2 managementEn for ${s.id}`);
    assert.ok(s.harmReductionEn && s.harmReductionEs, `Missing harmReduction for ${s.id}`);
  }

  assert.equal(CARDIOLOGY_HARM_REDUCTION_RULES.length, 5);
  for (const r of CARDIOLOGY_HARM_REDUCTION_RULES) {
    assert.ok(r.id && r.titleEn && r.titleEs && r.bodyEn && r.bodyEs);
  }
});

test('Cardiology state management is 100% ephemeral in-memory and resets cleanly', () => {
  resetCardiologyState();
  const initial = getCardiologyState();
  assert.equal(initial.selectedSyndrome, 'stimulant_acs_vasospasm');
  assert.equal(initial.stimulantChestPainHypertensionAgitation, false);
  assert.equal(initial.clinicalNotes, '');

  let notified = 0;
  const unsub = subscribeCardiologyState(() => { notified += 1; });

  setCardiologyState({
    selectedSyndrome: 'sodium_channel_qrs_blockade',
    wideQrsOver100msCocaineTcaLoperamide: true,
    qtcOver500msSyncopeMethadoneLoperamide: true,
    clinicalNotes: 'BP 168/104, HR 128, QRS 134 ms, R wave in aVR 4 mm',
  });

  assert.equal(notified, 1);
  const updated = getCardiologyState();
  assert.equal(updated.selectedSyndrome, 'sodium_channel_qrs_blockade');
  assert.equal(updated.wideQrsOver100msCocaineTcaLoperamide, true);
  assert.equal(updated.qtcOver500msSyncopeMethadoneLoperamide, true);

  resetCardiologyState();
  const wiped = getCardiologyState();
  assert.equal(wiped.selectedSyndrome, 'stimulant_acs_vasospasm');
  assert.equal(wiped.wideQrsOver100msCocaineTcaLoperamide, false);
  assert.equal(wiped.clinicalNotes, '');
  unsub();
});

test('evaluateCardiologyRisk & formatCardiologySbarText generate accurate emergency alerts and bilingual SBAR', () => {
  resetCardiologyState();
  setCardiologyState({
    selectedSyndrome: 'qtc_torsades_methadone_loperamide',
    qtcOver500msSyncopeMethadoneLoperamide: true,
    wideQrsOver100msCocaineTcaLoperamide: true,
    clinicalNotes: 'QTc 548 ms, K+ 3.3 mEq/L, Mg 1.5 mg/dL, Methadone 110 mg daily',
  });

  const riskEn = evaluateCardiologyRisk(getCardiologyState(), 'en');
  assert.equal(riskEn.urgency, 'EMERGENCY');
  assert.equal(riskEn.redFlags.length, 2);
  assert.match(riskEn.redFlags[1], /Magnesium Sulfate/i);

  const sbarEn = formatCardiologySbarText(getCardiologyState(), 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF/);
  assert.match(sbarEn, /Torsades de Pointes/i);
  assert.match(sbarEn, /Methadone 110 mg daily/);
  assert.match(sbarEn, /Magnesium Sulfate/i);

  const sbarEs = formatCardiologySbarText(getCardiologyState(), 'es');
  assert.match(sbarEs, /ENTREGA CLÍNICA SBAR/);
  assert.match(sbarEs, /Sulfato de Magnesio/i);
});

test('cardiologyCareView renders interactive syndrome selector, flags, SBAR generator, and Spanish localization', async () => {
  installMockDom();
  resetCardiologyState();
  await setLanguage('en');

  const root = cardiologyCareView();
  assert.ok(root.textContent.includes('Cardiovascular Emergencies'));
  assert.ok(root.textContent.includes('SBAR CLINICAL HANDOFF'));

  const syndromeBtn = root.querySelector('[data-syndrome-id="stimulant_aortic_dissection"]');
  assert.ok(syndromeBtn, 'Expected aortic dissection syndrome button');
  syndromeBtn.click();
  assert.equal(getCardiologyState().selectedSyndrome, 'stimulant_aortic_dissection');
  assert.ok(root.textContent.includes('Anti-Impulse'));

  const flagCheckbox = root.querySelector('[data-flag-key="wideQrsOver100msCocaineTcaLoperamide"]');
  assert.ok(flagCheckbox, 'Expected wide QRS flag checkbox');
  flagCheckbox.checked = true;
  flagCheckbox.dispatchEvent({ type: 'change' });
  assert.equal(getCardiologyState().wideQrsOver100msCocaineTcaLoperamide, true);
  assert.ok(root.textContent.includes('SODIUM-CHANNEL BLOCKADE ALERT'));

  await setLanguage('es');
  const rootEs = cardiologyCareView();
  assert.ok(rootEs.textContent.includes('ENTREGA CLÍNICA SBAR'));
  await setLanguage('en');
});
