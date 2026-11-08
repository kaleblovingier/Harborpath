import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OBSTETRIC_SYNDROME_PROFILES,
  OBSTETRIC_HARM_REDUCTION_RULES,
  getObstetricState,
  setObstetricState,
  resetObstetricState,
  subscribeObstetricState,
  evaluateObstetricRisk,
  formatObstetricSbarText,
  obstetricEmergenciesView,
} from '../public/js/views/obstetricEmergencies.js';
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

test('OBSTETRIC_SYNDROME_PROFILES & OBSTETRIC_HARM_REDUCTION_RULES contain complete bilingual clinical guidance', () => {
  const keys = Object.keys(OBSTETRIC_SYNDROME_PROFILES);
  assert.equal(keys.length, 6);
  assert.deepEqual(keys, [
    'stimulant_preeclampsia_abruption',
    'trimester_moud_pk_split_dosing',
    'intrapartum_cesarean_pain_on_moud',
    'postpartum_hemorrhage_uterotonics',
    'nows_eat_sleep_console',
    'fourth_trimester_overdose_cyp_deinduction',
  ]);

  for (const s of Object.values(OBSTETRIC_SYNDROME_PROFILES)) {
    assert.ok(s.titleEn && s.titleEs, `Missing title for ${s.id}`);
    assert.ok(s.pathophysiologyEn && s.pathophysiologyEs, `Missing pathophysiology for ${s.id}`);
    assert.ok(s.diagnosticsEn.length >= 2, `Expected >=2 diagnosticsEn for ${s.id}`);
    assert.ok(s.managementEn.length >= 2, `Expected >=2 managementEn for ${s.id}`);
    assert.ok(s.harmReductionEn && s.harmReductionEs, `Missing harmReduction for ${s.id}`);
  }

  assert.equal(OBSTETRIC_HARM_REDUCTION_RULES.length, 5);
  for (const r of OBSTETRIC_HARM_REDUCTION_RULES) {
    assert.ok(r.id && r.titleEn && r.titleEs && r.bodyEn && r.bodyEs);
  }
});

test('Obstetric state management is 100% ephemeral in-memory and resets cleanly', () => {
  resetObstetricState();
  const initial = getObstetricState();
  assert.equal(initial.selectedSyndrome, 'stimulant_preeclampsia_abruption');
  assert.equal(initial.severePregnancyHtnOrAbruptionPain, false);
  assert.equal(initial.clinicalNotes, '');

  let notified = 0;
  const unsub = subscribeObstetricState(() => { notified += 1; });

  setObstetricState({
    selectedSyndrome: 'intrapartum_cesarean_pain_on_moud',
    laborOrCesareanOnBuprenorphineMethadone: true,
    postpartumHemorrhageWithHtnOrStimulants: true,
    clinicalNotes: '38 wks EGA, Buprenorphine 8 mg SL TID, scheduled Cesarean',
  });

  assert.equal(notified, 1);
  const updated = getObstetricState();
  assert.equal(updated.selectedSyndrome, 'intrapartum_cesarean_pain_on_moud');
  assert.equal(updated.laborOrCesareanOnBuprenorphineMethadone, true);
  assert.equal(updated.postpartumHemorrhageWithHtnOrStimulants, true);

  resetObstetricState();
  const wiped = getObstetricState();
  assert.equal(wiped.selectedSyndrome, 'stimulant_preeclampsia_abruption');
  assert.equal(wiped.laborOrCesareanOnBuprenorphineMethadone, false);
  assert.equal(wiped.clinicalNotes, '');
  unsub();
});

test('evaluateObstetricRisk & formatObstetricSbarText generate accurate emergency alerts and bilingual SBAR', () => {
  resetObstetricState();
  setObstetricState({
    selectedSyndrome: 'postpartum_hemorrhage_uterotonics',
    postpartumHemorrhageWithHtnOrStimulants: true,
    laborOrCesareanOnBuprenorphineMethadone: true,
    clinicalNotes: 'QBL 1,350 mL, BP 164/108, Methadone 55 mg PO BID, Fibrinogen 185 mg/dL',
  });

  const riskEn = evaluateObstetricRisk(getObstetricState(), 'en');
  assert.equal(riskEn.urgency, 'EMERGENCY');
  assert.equal(riskEn.redFlags.length, 2);
  assert.match(riskEn.redFlags[0], /Methylergonovine/i);

  const sbarEn = formatObstetricSbarText(getObstetricState(), 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF/);
  assert.match(sbarEn, /Methadone 55 mg PO BID/);
  assert.match(sbarEn, /Tranexamic Acid/i);

  const sbarEs = formatObstetricSbarText(getObstetricState(), 'es');
  assert.match(sbarEs, /ENTREGA CLÍNICA SBAR/);
  assert.match(sbarEs, /Metilergonovina/i);
});

test('obstetricEmergenciesView renders interactive syndrome selector, flags, SBAR generator, and Spanish localization', async () => {
  installMockDom();
  resetObstetricState();
  await setLanguage('en');

  const root = obstetricEmergenciesView();
  assert.ok(root.textContent.includes('Maternal-Fetal & Obstetric Emergencies'));
  assert.ok(root.textContent.includes('SBAR CLINICAL HANDOFF'));

  const syndromeBtn = root.querySelector('[data-syndrome-id="nows_eat_sleep_console"]');
  assert.ok(syndromeBtn, 'Expected ESC syndrome button');
  syndromeBtn.click();
  assert.equal(getObstetricState().selectedSyndrome, 'nows_eat_sleep_console');
  assert.ok(root.textContent.includes('Eat, Sleep, Console'));

  const flagCheckbox = root.querySelector('[data-flag-key="laborOrCesareanOnBuprenorphineMethadone"]');
  assert.ok(flagCheckbox, 'Expected labor/Cesarean flag checkbox');
  flagCheckbox.checked = true;
  flagCheckbox.dispatchEvent({ type: 'change' });
  assert.equal(getObstetricState().laborOrCesareanOnBuprenorphineMethadone, true);
  assert.ok(root.textContent.includes('STRICTLY PROHIBIT Nalbuphine'));

  await setLanguage('es');
  const rootEs = obstetricEmergenciesView();
  assert.ok(rootEs.textContent.includes('ENTREGA CLÍNICA SBAR'));
  await setLanguage('en');
});
