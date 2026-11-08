import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOXIC_ALCOHOL_PROFILES,
  evaluateToxicAlcoholRisk,
  resetToxicAlcoholState,
  toxicAlcoholView,
} from '../public/js/views/toxicAlcohol.js';

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

test('TOXIC_ALCOHOL_PROFILES catalog integrity', () => {
  const profileKeys = Object.keys(TOXIC_ALCOHOL_PROFILES);
  assert.ok(profileKeys.includes('methanol'), 'contains methanol');
  assert.ok(profileKeys.includes('ethylene_glycol'), 'contains ethylene_glycol');
  assert.ok(profileKeys.includes('isopropanol'), 'contains isopropanol');
  assert.ok(profileKeys.includes('diethylene_glycol'), 'contains diethylene_glycol');

  for (const [key, profile] of Object.entries(TOXIC_ALCOHOL_PROFILES)) {
    assert.equal(profile.id, key, `ID matches key for ${key}`);
    assert.ok(profile.nameEn, `profile ${key} has nameEn`);
    assert.ok(profile.metaboliteEn, `profile ${key} has metaboliteEn`);
    assert.ok(profile.targetOrgansEn, `profile ${key} has targetOrgansEn`);
    assert.ok(profile.antidoteDosingEn, `profile ${key} has antidoteDosingEn`);
    assert.ok(profile.cofactorsEn, `profile ${key} has cofactorsEn`);
    assert.ok(profile.bicarbonateDirectiveEn, `profile ${key} has bicarbonateDirectiveEn`);
    assert.ok(profile.dialysisIndicationsEn, `profile ${key} has dialysisIndicationsEn`);
    assert.ok(Array.isArray(profile.hallmarkSignsEn), `profile ${key} has hallmark signs array`);
  }
});

test('evaluateToxicAlcoholRisk: Osmolal gap and anion gap calculation precision', () => {
  const res = evaluateToxicAlcoholRisk({
    agentId: 'methanol',
    sodium: 140,
    glucose: 90,
    bun: 14,
    ethanol: 0,
    measuredOsm: 320,
    osmMethod: 'freezing_point',
    chloride: 100,
    bicarbonate: 10,
    ph: 7.20,
    hasVisualSymptoms: true,
  });

  // Calc Osm = 2*140 + 90/18 + 14/2.8 + 0 = 280 + 5 + 5 = 290
  assert.equal(res.calculatedOsm, 290);
  // Osm Gap = 320 - 290 = 30
  assert.equal(res.osmolalGap, 30);
  // Anion Gap = 140 - (100 + 10) = 30
  assert.equal(res.anionGap, 30);
  assert.equal(res.isEmergency911, true);
  assert.equal(res.requiresHemodialysis, true);
  assert.ok(res.dialysisReasonsEn.some((r) => r.includes('visual impairment') || r.includes('acidemia')));
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('ION-TRAPPING') || f.includes('ion-trapping') || f.includes('Sodium Bicarbonate')));
  assert.ok(res.sbarEn.includes('[S] SITUATION:'));
  assert.ok(res.sbarEn.includes('Methanol'));
});

test('evaluateToxicAlcoholRisk: Vapor pressure osmometry warning flag', () => {
  const res = evaluateToxicAlcoholRisk({
    agentId: 'methanol',
    osmMethod: 'vapor_pressure',
    measuredOsm: 290,
  });

  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('Vapor pressure osmometry heats the sample')));
  assert.ok(res.emergencyFlagsEs.some((f) => f.includes('DESCENSO CRIOSCÓPICO')));
});

test('evaluateToxicAlcoholRisk: Ethylene glycol thiamine & pyridoxine cofactors', () => {
  const res = evaluateToxicAlcoholRisk({
    agentId: 'ethylene_glycol',
    hasRenalFailure: true,
    ph: 7.24,
  });

  assert.equal(res.agentId, 'ethylene_glycol');
  assert.equal(res.requiresHemodialysis, true);
  assert.ok(res.profile.cofactorsEn.includes('Thiamine 100 mg'));
  assert.ok(res.profile.cofactorsEn.includes('Pyridoxine (Vitamin B6) 50 mg'));
  assert.ok(res.profile.hallmarkSignsEn.some((s) => s.includes('Lactate Gap')));
});

test('evaluateToxicAlcoholRisk: Isopropanol fomepizole contraindication and pseudorenal failure', () => {
  const res = evaluateToxicAlcoholRisk({
    agentId: 'isopropanol',
    measuredOsm: 330,
    chloride: 104,
    bicarbonate: 24, // Normal anion gap
    ph: 7.42,
  });

  assert.equal(res.agentId, 'isopropanol');
  assert.ok(res.antidoteRegimenEn.includes('FOMEPIZOLE CONTRAINDICATED'));
  assert.ok(res.profile.hallmarkSignsEn.some((s) => s.includes('Pseudorenal Failure')));
  assert.equal(res.requiresHemodialysis, false);
});

test('evaluateToxicAlcoholRisk: Hemodialysis dose adjustments', () => {
  const res = evaluateToxicAlcoholRisk({
    agentId: 'methanol',
    hasHemodialysis: true,
  });

  assert.ok(res.antidoteRegimenEn.includes('DIALYSIS DOSE ADJUSTMENT'));
  assert.ok(res.antidoteRegimenEn.includes('10 mg/kg IV q4h'));
});

test('toxicAlcoholView: DOM rendering, interactions and SBAR generation', () => {
  const cleanup = installMockDom();
  try {
    resetToxicAlcoholState();
    const container = toxicAlcoholView();
    assert.ok(container, 'container created');
    assert.equal(container.className, 'toxic-alcohol-view');

    const tabs = container.querySelectorAll('.tab');
    assert.ok(tabs.length >= 4, 'Contains tabs for all 4 alcohol agents');

    // Find tab for Ethylene Glycol
    const egTab = tabs.find((t) => t.textContent.includes('Ethylene Glycol') || t.textContent.includes('Etilenglicol'));
    assert.ok(egTab, 'Ethylene glycol tab present');

    // Click Ethylene Glycol
    egTab.click();

    const sbarBlock = container.querySelector('.toxic-sbar-block');
    assert.ok(sbarBlock, 'SBAR block exists');
    assert.ok(sbarBlock.textContent.includes('Ethylene Glycol') || sbarBlock.textContent.includes('Etilenglicol'));

    resetToxicAlcoholState();
  } finally {
    cleanup();
  }
});
