import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ENCAMPMENT_INFECTION_PROFILES,
  ENCAMPMENT_PROFILES,
  evaluateEncampmentRisk,
  resetEncampmentMedicineState,
  encampmentMedicineView,
} from '../public/js/views/encampmentMedicine.js';

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

test('ENCAMPMENT_INFECTION_PROFILES catalog integrity', () => {
  const profileKeys = Object.keys(ENCAMPMENT_INFECTION_PROFILES);
  assert.ok(profileKeys.includes('trench_fever'), 'contains trench_fever');
  assert.ok(profileKeys.includes('murine_typhus'), 'contains murine_typhus');
  assert.ok(profileKeys.includes('leptospirosis'), 'contains leptospirosis');
  assert.ok(profileKeys.includes('crusted_scabies'), 'contains crusted_scabies');
  assert.ok(profileKeys.includes('animal_bites_rabies'), 'contains animal_bites_rabies');
  assert.equal(ENCAMPMENT_PROFILES, ENCAMPMENT_INFECTION_PROFILES, 'alias matches');

  for (const [key, profile] of Object.entries(ENCAMPMENT_INFECTION_PROFILES)) {
    assert.equal(profile.id, key, `ID matches key for ${key}`);
    assert.ok(profile.nameEn, `profile ${key} has nameEn`);
    assert.ok(profile.nameEs, `profile ${key} has nameEs`);
    assert.ok(profile.vectorEn, `profile ${key} has vectorEn`);
    assert.ok(profile.vectorEs, `profile ${key} has vectorEs`);
    assert.ok(profile.antimicrobialRegimenEn, `profile ${key} has regimenEn`);
    assert.ok(profile.antimicrobialRegimenEs, `profile ${key} has regimenEs`);
    assert.ok(profile.clinicalPearlEn, `profile ${key} has pearlEn`);
    assert.ok(Array.isArray(profile.hallmarkSignsEn), `profile ${key} has hallmark signs array`);
  }
});

test('evaluateEncampmentRisk: Bartonella trench fever endocarditis profile', () => {
  const res = evaluateEncampmentRisk({
    conditionId: 'trench_fever',
    checkedSigns: [0, 3], // 5-day fever and culture-negative endocarditis
    hasSepsis: true,
  });

  assert.equal(res.conditionId, 'trench_fever');
  assert.equal(res.checkedSignsCount, 2);
  assert.equal(res.isEmergency911, true);
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('SEPSIS ALERT')));
  assert.ok(res.profile.hallmarkSignsEn.some((s) => s.includes('endocarditis')));
  assert.ok(res.profile.antimicrobialRegimenEn.includes('Doxycycline 100 mg PO BID'));
  assert.ok(res.profile.antimicrobialRegimenEn.includes('Gentamicin 3 mg/kg IV'));
  assert.ok(res.sbarEn.includes('[S] SITUATION:'));
  assert.ok(res.sbarEn.includes('Bartonella quintana'));
});

test('evaluateEncampmentRisk: Murine typhus golden rule', () => {
  const res = evaluateEncampmentRisk({
    conditionId: 'murine_typhus',
    checkedSigns: [0, 1],
  });

  assert.equal(res.conditionId, 'murine_typhus');
  assert.ok(res.profile.antimicrobialRegimenEn.includes('NEVER delay antibiotic therapy awaiting acute serology'));
  assert.ok(res.profile.antimicrobialRegimenEn.includes('Doxycycline 100 mg'));
});

test('evaluateEncampmentRisk: Leptospirosis Weil disease warning', () => {
  const res = evaluateEncampmentRisk({
    conditionId: 'leptospirosis',
    checkedSigns: [0, 2], // pathognomonic conjunctival suffusion and Weil's disease
    hasJaundice: true,
    hasRenalFailure: true,
  });

  assert.equal(res.conditionId, 'leptospirosis');
  assert.equal(res.isEmergency911, true);
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('WEIL’S DISEASE HEPATORENAL THREAT')));
  assert.ok(res.profile.hallmarkSignsEn.some((s) => s.includes('conjunctival suffusion without purulence')));
  assert.ok(res.profile.antimicrobialRegimenEn.includes('JARISCH-HERXHEIMER REACTION'));
});

test('evaluateEncampmentRisk: Crusted scabies CDC dual therapy', () => {
  const res = evaluateEncampmentRisk({
    conditionId: 'crusted_scabies',
    checkedSigns: [0, 2],
  });

  assert.equal(res.conditionId, 'crusted_scabies');
  assert.ok(res.profile.antimicrobialRegimenEn.includes('Oral Ivermectin 200 mcg/kg'));
  assert.ok(res.profile.antimicrobialRegimenEn.includes('Topical Permethrin 5%'));
});

test('evaluateEncampmentRisk: Animal bite rabies & tetanus PEP', () => {
  const res = evaluateEncampmentRisk({
    conditionId: 'animal_bites_rabies',
    checkedSigns: [0, 2], // Category III exposure and bat exposure
    batContact: true,
    animalUnlocatable: true,
  });

  assert.equal(res.conditionId, 'animal_bites_rabies');
  assert.equal(res.isEmergency911, true);
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('HIGH-RISK RABIES TRANSMISSION')));
  assert.ok(res.profile.antimicrobialRegimenEn.includes('AT LEAST 15 MINUTES'));
  assert.ok(res.profile.antimicrobialRegimenEn.includes('Rabies Immune Globulin - RIG'));
  assert.ok(res.profile.antimicrobialRegimenEn.includes('Amoxicillin-clavulanate'));
});

test('encampmentMedicineView: DOM rendering, interactions and SBAR generation', () => {
  const cleanup = installMockDom();
  try {
    resetEncampmentMedicineState();
    const container = encampmentMedicineView();
    assert.ok(container, 'container created');
    assert.equal(container.className, 'encampment-medicine-view');

    const tabs = container.querySelectorAll('.tab');
    assert.ok(tabs.length >= 5, 'Contains tabs for all 5 conditions');

    // Find tab for Leptospirosis (3rd profile)
    const leptoTab = tabs.find((t) => t.textContent.includes('Leptospirosis'));
    assert.ok(leptoTab, 'Leptospirosis tab present');

    // Simulate clicking Leptospirosis tab
    leptoTab.click();

    // Check updated content in SBAR block
    const sbarBlock = container.querySelector('.encampment-sbar-block');
    assert.ok(sbarBlock, 'SBAR block exists');
    assert.ok(sbarBlock.textContent.includes('Leptospira'), 'SBAR updated for Leptospira');

    // Reset state
    resetEncampmentMedicineState();
  } finally {
    cleanup();
  }
});
