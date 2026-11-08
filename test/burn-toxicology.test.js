import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ABA_BURN_CRITERIA,
  BURN_EXPOSURE_PROTOCOLS,
  evaluateBurnToxicology,
  resetBurnToxicologyState,
  burnToxicologyView,
} from '../public/js/views/burnToxicology.js';

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
      };
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

test('evaluateBurnToxicology: adult thermal resuscitation calculations', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 20,
    hoursPostInjury: 0,
    patientType: 'adult',
    exposureType: 'thermal',
  });

  // 2 mL * 70 kg * 20% = 2800 mL Total
  assert.equal(result.multiplier, 2);
  assert.equal(result.total24HrFluidMl, 2800);
  assert.equal(result.first8HrFluidMl, 1400);
  assert.equal(result.next16HrFluidMl, 1400);
  // Rate in first 8h: 1400 / 8 = 175 mL/hr
  assert.equal(result.first8HrHourlyRateMl, 175);
  // Rate in next 16h: 1400 / 16 = 88 mL/hr
  assert.equal(result.next16HrHourlyRateMl, 88);
  // Adult urine output target: 70 * 0.5 = 35 mL/hr
  assert.equal(result.targetUrineMlPerHr, 35);
  assert.equal(result.burnCenterTransferRecommended, true);
  assert.equal(result.intubationUrgent, false);
});

test('evaluateBurnToxicology: pediatric resuscitation multiplier & maintenance dextrose', () => {
  const result = evaluateBurnToxicology({
    weightKg: 15,
    tbsaPct: 10,
    hoursPostInjury: 0,
    patientType: 'pediatric',
    exposureType: 'thermal',
  });

  // 3 mL * 15 kg * 10% = 450 mL Total
  assert.equal(result.multiplier, 3);
  assert.equal(result.total24HrFluidMl, 450);
  assert.equal(result.first8HrFluidMl, 225);
  assert.equal(result.next16HrFluidMl, 225);
  // Pediatric urine output target: 15 * 1.0 = 15 mL/hr
  assert.equal(result.targetUrineMlPerHr, 15);
  assert.match(result.formulaNameEn, /D5 1\/2 NS/);
  // Pediatric >= 10% meets burn center referral
  assert.equal(result.burnCenterTransferRecommended, true);
});

test('evaluateBurnToxicology: electrical & rhabdomyolysis consensus', () => {
  const result = evaluateBurnToxicology({
    weightKg: 80,
    tbsaPct: 15,
    hoursPostInjury: 0,
    patientType: 'electrical',
    exposureType: 'thermal',
  });

  // 4 mL * 80 kg * 15% = 4800 mL Total
  assert.equal(result.multiplier, 4);
  assert.equal(result.total24HrFluidMl, 4800);
  // Electrical urine target: 80 * 1.5 = 120 mL/hr
  assert.equal(result.targetUrineMlPerHr, 120);
  assert.match(result.targetUrineTextEn, /75-100 mL\/hr/);
});

test('evaluateBurnToxicology: time elapsed post-injury adjusts first 8h rate', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 20,
    hoursPostInjury: 2, // 2 hours elapsed -> 6 hours remaining in 1st 8h window
    patientType: 'adult',
    exposureType: 'thermal',
  });

  assert.equal(result.first8HrFluidMl, 1400);
  assert.equal(result.remainingFirst8Hr, 6);
  // 1400 / 6 = 233 mL/hr
  assert.equal(result.first8HrHourlyRateMl, 233);
});

test('evaluateBurnToxicology: hydrofluoric acid protocol & antidote', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 5,
    exposureType: 'hydrofluoric',
  });

  assert.equal(result.exposureKey, 'hydrofluoric');
  assert.match(result.exposure.antidoteEn, /Calcium Gluconate/);
  assert.match(result.exposure.antidoteEn, /Prohibit subcutaneous calcium chloride/);
  assert.match(result.exposure.pearlEn, /chelate intracellular calcium and magnesium/);
  assert.equal(result.burnCenterTransferRecommended, true);
  assert.match(result.sbarEn, /Calcium Gluconate/);
});

test('evaluateBurnToxicology: anhydrous ammonia copious irrigation & no acid neutralization', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 10,
    exposureType: 'ammonia',
  });

  assert.match(result.exposure.antidoteEn, /ABSOLUTE CONTRAINDICATION: NEVER attempt chemical neutralization/);
  assert.match(result.exposure.firstAidEn, /MINIMUM of 30 to 60 minutes/);
});

test('evaluateBurnToxicology: red phosphorus submersion & Woods lamp', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 5,
    exposureType: 'phosphorus',
  });

  assert.match(result.exposure.firstAidEn, /submerge affected area in water/);
  assert.match(result.exposure.antidoteEn, /Wood’s lamp/);
});

test('evaluateBurnToxicology: BHO blast flash burns & melted synthetic clothing', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 15,
    exposureType: 'bho',
  });

  assert.match(result.exposure.firstAidEn, /DO NOT forcefully peel melted synthetic clothing/);
  assert.match(result.exposure.firstAidEn, /Screen immediately for blast trauma/);
});

test('evaluateBurnToxicology: CHS compulsive scald burns & topical capsaicin', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 8,
    exposureType: 'chs_scald',
  });

  assert.match(result.exposure.antidoteEn, /Capsaicin cream 0\.025%–0\.075%/);
  assert.match(result.exposure.antidoteEn, /AVOID opioids/);
  assert.match(result.exposure.antidoteEn, /Haloperidol/);
});

test('evaluateBurnToxicology: airway red flags trigger urgent early intubation', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 15,
    inhalationSigns: ['stridor', 'facial_burns'],
  });

  assert.equal(result.intubationUrgent, true);
  assert.equal(result.airwayRedFlagsEn.length, 2);
  assert.match(result.airwayRedFlagsEn[0], /stridor/i);
  assert.match(result.sbarEn, /Immediate intubation indicated/);
});

test('evaluateBurnToxicology: carbon monoxide SpO2 artifact & HBO triggers', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 10,
    coSuspected: true,
    coHbLevel: 28,
  });

  assert.equal(result.hboIndicated, true);
  assert.match(result.toxicGasAlertsEn[0], /PULSE OXIMETRY TRAP/);
  assert.match(result.toxicGasAlertsEn[1], /HYPERBARIC OXYGEN/);
});

test('evaluateBurnToxicology: cyanide poisoning detection & Cyanokit IV protocol', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 10,
    inhalationSigns: ['enclosed_smoke', 'lactic_acidosis'],
  });

  assert.equal(result.cyanideIndicated, true);
  assert.match(result.toxicGasAlertsEn[0], /Cyanokit/);
  assert.match(result.sbarEn, /Cyanokit/);
});

test('evaluateBurnToxicology: fluid creep risk warning on massive burns', () => {
  const result = evaluateBurnToxicology({
    weightKg: 70,
    tbsaPct: 45, // >= 40%
  });

  assert.equal(result.fluidCreepRisk, true);
  assert.equal(result.intubationUrgent, true);
});

test('burnToxicologyView renders interactive DOM and supports reset', () => {
  const cleanup = installMockDom();
  try {
    resetBurnToxicologyState();
    const view = burnToxicologyView();
    assert.ok(view);
    assert.equal(view.tagName, 'DIV');
    assert.ok(view.classList.contains('burn-toxicology-view'));

    const titles = view.querySelectorAll('.burn-card-title');
    assert.ok(titles.length >= 3);

    const sbarBlock = view.querySelector('.burn-sbar-block');
    assert.ok(sbarBlock);
    assert.match(sbarBlock.textContent, /\[S\] SITUATION/);
  } finally {
    cleanup();
  }
});
