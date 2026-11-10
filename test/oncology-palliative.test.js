import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ONCOLOGY_SYNDROME_PROFILES,
  ONCOLOGY_HARM_REDUCTION_RULES,
  getOncologyState,
  setOncologyState,
  resetOncologyState,
  subscribeOncologyState,
  evaluateOncologyRisk,
  formatOncologySbarText,
  oncologyPalliativeView,
} from '../public/js/views/oncologyPalliative.js';
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

test('ONCOLOGY_SYNDROME_PROFILES & ONCOLOGY_HARM_REDUCTION_RULES contain complete bilingual clinical guidance', () => {
  const keys = Object.keys(ONCOLOGY_SYNDROME_PROFILES);
  assert.equal(keys.length, 6);
  assert.deepEqual(keys, [
    'cancer_pain_on_moud',
    'sickle_cell_voc_analgesia',
    'opioid_induced_neurotoxicity',
    'cipn_mucositis_coanalgesics',
    'oncologic_emergencies_mimics',
    'palliative_harm_reduction_eol',
  ]);

  for (const s of Object.values(ONCOLOGY_SYNDROME_PROFILES)) {
    assert.ok(s.titleEn && s.titleEs, `Missing title for ${s.id}`);
    assert.ok(s.pathophysiologyEn && s.pathophysiologyEs, `Missing pathophysiology for ${s.id}`);
    assert.ok(s.diagnosticsEn.length >= 2, `Expected >=2 diagnosticsEn for ${s.id}`);
    assert.ok(s.managementEn.length >= 2, `Expected >=2 managementEn for ${s.id}`);
    assert.ok(s.harmReductionEn && s.harmReductionEs, `Missing harmReduction for ${s.id}`);
  }

  assert.equal(ONCOLOGY_HARM_REDUCTION_RULES.length, 5);
  for (const r of ONCOLOGY_HARM_REDUCTION_RULES) {
    assert.ok(r.id && r.titleEn && r.titleEs && r.bodyEn && r.bodyEs);
  }
});

test('Oncology state management is 100% ephemeral in-memory and resets cleanly', () => {
  resetOncologyState();
  const initial = getOncologyState();
  assert.equal(initial.selectedSyndrome, 'cancer_pain_on_moud');
  assert.equal(initial.activeCancerPainOnBuprenorphineOrMethadone, false);
  assert.equal(initial.clinicalNotes, '');

  let notified = 0;
  const unsub = subscribeOncologyState(() => { notified += 1; });

  setOncologyState({
    selectedSyndrome: 'sickle_cell_voc_acute_chest',
    sickleCellVocPainOrChestInfiltrateHypoxia: true,
    activeCancerPainOnBuprenorphineOrMethadone: true,
    clinicalNotes: 'HbSS sickle cell vaso-occlusive crisis + SpO2 90%',
  });

  assert.equal(notified, 1);
  const updated = getOncologyState();
  assert.equal(updated.selectedSyndrome, 'sickle_cell_voc_acute_chest');
  assert.equal(updated.sickleCellVocPainOrChestInfiltrateHypoxia, true);
  assert.equal(updated.activeCancerPainOnBuprenorphineOrMethadone, true);

  resetOncologyState();
  const wiped = getOncologyState();
  assert.equal(wiped.selectedSyndrome, 'cancer_pain_on_moud');
  assert.equal(wiped.sickleCellVocPainOrChestInfiltrateHypoxia, false);
  assert.equal(wiped.clinicalNotes, '');
  unsub();
});

test('evaluateOncologyRisk & formatOncologySbarText generate accurate emergency alerts and bilingual SBAR', () => {
  resetOncologyState();
  setOncologyState({
    selectedSyndrome: 'hypercalcemia_spinal_cord_compression',
    cancerLethargyConstipationOrSupineBackWeakness: true,
    activeCancerPainOnBuprenorphineOrMethadone: true,
    clinicalNotes: 'Metastatic NSCLC, T8 back pain, Corrected Ca 14.8 mg/dL, Methadone 30 mg TID',
  });

  const riskEn = evaluateOncologyRisk(getOncologyState(), 'en');
  assert.equal(riskEn.urgency, 'EMERGENCY');
  assert.equal(riskEn.redFlags.length, 2);
  assert.match(riskEn.redFlags[0], /Dexamethasone/i);

  const sbarEn = formatOncologySbarText(getOncologyState(), 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF/);
  assert.match(sbarEn, /Methadone 30 mg TID/);
  assert.match(sbarEn, /Dexamethasone/i);

  const sbarEs = formatOncologySbarText(getOncologyState(), 'es');
  assert.match(sbarEs, /ENTREGA CLÍNICA SBAR/);
  assert.match(sbarEs, /Dexametasona/i);
});

test('oncologyPalliativeView renders interactive syndrome selector, flags, SBAR generator, and Spanish localization', async () => {
  installMockDom();
  resetOncologyState();
  await setLanguage('en');

  const root = oncologyPalliativeView();
  assert.ok(root.textContent.includes('Oncology, Palliative Care, Sickle Cell'));
  assert.ok(root.textContent.includes('SBAR CLINICAL HANDOFF'));

  const syndromeBtn = root.querySelector('[data-syndrome-id="sickle_cell_voc_analgesia"]');
  assert.ok(syndromeBtn, 'Expected sickle cell syndrome button');
  syndromeBtn.click();
  assert.equal(getOncologyState().selectedSyndrome, 'sickle_cell_voc_analgesia');
  assert.ok(root.textContent.includes('30 minutes'));

  const flagCheckbox = root.querySelector('[data-flag-key="escalatingMorphineHydromorphoneMyoclonusAllodynia"]');
  assert.ok(flagCheckbox, 'Expected neurotoxicity flag checkbox');
  flagCheckbox.checked = true;
  flagCheckbox.dispatchEvent({ type: 'change' });
  assert.equal(getOncologyState().escalatingMorphineHydromorphoneMyoclonusAllodynia, true);
  assert.ok(root.textContent.includes('OPIOID-INDUCED NEUROTOXICITY'));

  await setLanguage('es');
  const rootEs = oncologyPalliativeView();
  assert.ok(rootEs.textContent.includes('ENTREGA CLÍNICA SBAR'));
  await setLanguage('en');
});
