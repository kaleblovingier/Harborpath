// test/adulterant-care.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ADULTERANT_PROFILES,
  WOUND_CARE_PRINCIPLES,
  XYLAZINE_WITHDRAWAL_PROTOCOL,
  TEST_STRIP_STANDARDS,
  evaluateAdulterantRisk,
  formatAdulterantSummaryText,
  getAdulterantState,
  setAdulterantState,
  resetAdulterantState,
  adulterantCareView
} from '../public/js/views/adulterantCare.js';

class MockNode {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.attributes = {};
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.dataset = {};
    this.className = '';
    this._textContent = '';
    this.classList = {
      _classes: new Set(),
      add: (...cls) => {
        for (const c of cls) this.classList._classes.add(c);
        this.className = Array.from(this.classList._classes).join(' ');
      },
      remove: (...cls) => {
        for (const c of cls) this.classList._classes.delete(c);
        this.className = Array.from(this.classList._classes).join(' ');
      },
      toggle: (c, force) => {
        if (force === true) this.classList.add(c);
        else if (force === false) this.classList.remove(c);
        else if (this.classList._classes.has(c)) this.classList.remove(c);
        else this.classList.add(c);
      },
      contains: (c) => this.classList._classes.has(c)
    };
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this._textContent = String(val ?? '');
    this.children = [];
  }

  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(event, fn) { this.listeners[event] = fn; }

  appendChild(c) {
    if (c) {
      if (c instanceof MockNode) c.parent = this;
      this.children.push(c);
    }
    return c;
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        const textNode = new MockNode('#text');
        textNode._textContent = String(item);
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  get firstChild() {
    return this.children[0] || null;
  }

  remove() {
    if (this.parent) {
      const idx = this.parent.children.indexOf(this);
      if (idx !== -1) this.parent.children.splice(idx, 1);
    }
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (node instanceof MockNode) {
        if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
        else if (selector === 'input' && node.tagName === 'INPUT') matches.push(node);
        else if (selector.startsWith('#') && node.attributes.id === selector.slice(1)) matches.push(node);
        else if (selector.startsWith('.') && node.className && node.className.includes(selector.slice(1))) matches.push(node);
        else if (selector.startsWith('[') && selector.endsWith(']')) {
          const [k, v] = selector.slice(1, -1).split('=');
          const cleanK = k?.trim();
          const cleanV = v ? v.replace(/['"]/g, '').trim() : null;
          if (cleanV !== null && node.attributes[cleanK] === cleanV) matches.push(node);
          else if (cleanV === null && cleanK in node.attributes) matches.push(node);
        }
        for (const child of node.children) {
          walk(child);
        }
      }
    };
    walk(this);
    return matches;
  }
}

test('ADULTERANT_PROFILES exports evidence-based pharmacological and clinical profiles', () => {
  assert.ok(Array.isArray(ADULTERANT_PROFILES));
  assert.equal(ADULTERANT_PROFILES.length, 3);

  const xylazine = ADULTERANT_PROFILES.find((p) => p.id === 'xylazine');
  assert.ok(xylazine);
  assert.equal(xylazine.naloxoneReversible, false);
  assert.match(xylazine.classEn, /alpha-2 adrenergic receptor agonist/i);
  assert.ok(xylazine.keyClinicalPearlsEn.length >= 3);
  assert.ok(xylazine.keyClinicalPearlsEs.length >= 3);

  const nitazenes = ADULTERANT_PROFILES.find((p) => p.id === 'nitazenes');
  assert.ok(nitazenes);
  assert.equal(nitazenes.naloxoneReversible, true);
  assert.match(nitazenes.mechanismEn, /potency 10x to 40x that of fentanyl/i);
  assert.match(nitazenes.keyClinicalPearlsEn.join(' '), /wooden chest|rigid chest/i);

  const medetomidine = ADULTERANT_PROFILES.find((p) => p.id === 'medetomidine');
  assert.ok(medetomidine);
  assert.equal(medetomidine.naloxoneReversible, false);
  assert.match(medetomidine.mechanismEn, /bradycardia/i);
});

test('WOUND_CARE_PRINCIPLES enforces non-judgmental wound management and strict harm reduction warnings', () => {
  assert.ok(Array.isArray(WOUND_CARE_PRINCIPLES));
  assert.equal(WOUND_CARE_PRINCIPLES.length, 4);

  const cleansing = WOUND_CARE_PRINCIPLES.find((r) => r.category === 'cleansing');
  assert.ok(cleansing);
  assert.match(cleansing.doNotDoEn, /NEVER use hydrogen peroxide, rubbing alcohol/i);

  const moisture = WOUND_CARE_PRINCIPLES.find((r) => r.category === 'moisture');
  assert.ok(moisture);
  assert.match(moisture.instructionsEn, /petroleum jelly|Vaseline/i);

  const dressing = WOUND_CARE_PRINCIPLES.find((r) => r.category === 'dressing');
  assert.ok(dressing);
  assert.match(dressing.doNotDoEn, /Never debride or cut away/i);

  const monitoring = WOUND_CARE_PRINCIPLES.find((r) => r.category === 'monitoring');
  assert.ok(monitoring);
  assert.match(monitoring.instructionsEn, /ballpoint pen/i);
});

test('XYLAZINE_WITHDRAWAL_PROTOCOL outlines adrenergic storm and alpha-2 pharmacotherapy', () => {
  assert.match(XYLAZINE_WITHDRAWAL_PROTOCOL.onsetEn, /8 to 24 hours/i);
  assert.ok(XYLAZINE_WITHDRAWAL_PROTOCOL.symptomsEn.some((s) => /autonomic rebound/i.test(s)));
  assert.ok(XYLAZINE_WITHDRAWAL_PROTOCOL.pharmacotherapyEn.some((p) => /Clonidine/i.test(p)));
  assert.ok(XYLAZINE_WITHDRAWAL_PROTOCOL.pharmacotherapyEn.some((p) => /Tizanidine/i.test(p)));
  assert.ok(XYLAZINE_WITHDRAWAL_PROTOCOL.pharmacotherapyEn.some((p) => /Concurrent MOUD/i.test(p)));
});

test('TEST_STRIP_STANDARDS provides drug checking dilution specifications', () => {
  assert.ok(Array.isArray(TEST_STRIP_STANDARDS));
  assert.equal(TEST_STRIP_STANDARDS.length, 3);

  const stim = TEST_STRIP_STANDARDS.find((s) => s.substanceId === 'stimulants_meth_cocaine');
  assert.ok(stim);
  assert.match(stim.waterRatioEn, /1 full cup/i);
  assert.equal(stim.dipTimeSeconds, 15);
});

test('evaluateAdulterantRisk stratifies acute emergencies, alpha-2 sedation, sepsis, and withdrawal', () => {
  // Case 1: Opioid overdose / respiratory arrest
  const res1 = evaluateAdulterantRisk({ breathingAbsentOrSlow: true });
  assert.equal(res1.severity, 'emergency_911_overdose');
  assert.match(res1.urgencyEn, /CRITICAL EMERGENCY/i);
  assert.ok(res1.actionStepsEn.some((s) => /naloxone/i.test(s)));

  // Case 2: Sepsis / spreading wound
  const res2 = evaluateAdulterantRisk({ woundSpreadingOrFever: true });
  assert.equal(res2.severity, 'urgent_medical_sepsis');
  assert.match(res2.urgencyEn, /URGENT/i);
  assert.ok(res2.actionStepsEn.some((s) => /EMTALA/i.test(s)));

  // Case 3: Alpha-2 prolonged sedation with adequate respirations
  const res3 = evaluateAdulterantRisk({ deepSedationWithBreathing: true });
  assert.equal(res3.severity, 'alpha2_prolonged_sedation');
  assert.ok(res3.actionStepsEn.some((s) => /DO NOT administer extra naloxone/i.test(s)));
  assert.ok(res3.actionStepsEn.some((s) => /RECOVERY POSITION/i.test(s)));

  // Case 4: Xylazine autonomic rebound
  const res4 = evaluateAdulterantRisk({ autonomicStormWithdrawal: true });
  assert.equal(res4.severity, 'xylazine_autonomic_withdrawal');
  assert.ok(res4.actionStepsEn.some((s) => /Clonidine/i.test(s)));

  // Case 5: Routine harm reduction
  const res5 = evaluateAdulterantRisk({});
  assert.equal(res5.severity, 'routine_harm_reduction');
  assert.ok(res5.actionStepsEn.some((s) => /Never use alone/i.test(s)));
});

test('In-RAM state management provides deterministic reset and isolation', () => {
  resetAdulterantState();
  const init = getAdulterantState();
  assert.equal(init.activeTab, 'profiles');
  assert.equal(init.breathingAbsentOrSlow, false);
  assert.equal(init.deepSedationWithBreathing, false);

  setAdulterantState({
    activeTab: 'sedation-triage',
    breathingAbsentOrSlow: true,
    cyanosisLipsFingers: true
  });

  const modified = getAdulterantState();
  assert.equal(modified.activeTab, 'sedation-triage');
  assert.equal(modified.breathingAbsentOrSlow, true);
  assert.equal(modified.cyanosisLipsFingers, true);

  resetAdulterantState();
  const reset = getAdulterantState();
  assert.equal(reset.activeTab, 'profiles');
  assert.equal(reset.breathingAbsentOrSlow, false);
  assert.equal(reset.cyanosisLipsFingers, false);
});

test('formatAdulterantSummaryText outputs bilingual summaries without PII', () => {
  const enSummary = formatAdulterantSummaryText({ breathingAbsentOrSlow: true }, 'en');
  assert.match(enSummary, /HARBORPATH — CLINICAL ADULTERANT & XYLAZINE CARE REPORT/);
  assert.match(enSummary, /CRITICAL EMERGENCY/);
  assert.match(enSummary, /ESSENTIAL WOUND CARE PRINCIPLES/);
  assert.match(enSummary, /XYLAZINE WITHDRAWAL PROTOCOL/);

  const esSummary = formatAdulterantSummaryText({ deepSedationWithBreathing: true }, 'es');
  assert.match(esSummary, /REPORTE CLÍNICO DE ADULTERANTES Y XILACINA/);
  assert.match(esSummary, /Sedación Alfa-2/);
  assert.match(esSummary, /PRINCIPIOS ESENCIALES DE CUIDADO DE HERIDAS/);
  assert.match(esSummary, /PROTOCOLO DE ABSTINENCIA DE XILACINA/);
});

test('adulterantCareView renders accessible WCAG 2.2 AA compliant UI', () => {
  const originalDoc = globalThis.document;
  const originalNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag)
  };

  try {
    resetAdulterantState();
    const view = adulterantCareView();
    assert.ok(view);
    assert.equal(view.className, 'adulterant-care-view container');

    const tabList = view.querySelector('.tab-nav');
    assert.ok(tabList);
    assert.equal(tabList.getAttribute('role'), 'tablist');

    const tabs = view.querySelectorAll('[role=tab]');
    assert.equal(tabs.length, 5);
  } finally {
    globalThis.document = originalDoc;
    globalThis.Node = originalNode;
  }
});

test('Static security and privacy audit of adulterantCare.js', () => {
  const content = readFileSync(new URL('../public/js/views/adulterantCare.js', import.meta.url), 'utf8');

  assert.doesNotMatch(content, /localStorage/, 'Must not access localStorage');
  assert.doesNotMatch(content, /sessionStorage/, 'Must not access sessionStorage');
  assert.doesNotMatch(content, /document\.cookie/, 'Must not access document.cookie');
  assert.doesNotMatch(content, /innerHTML/, 'Must not use innerHTML');
  assert.doesNotMatch(content, /outerHTML/, 'Must not use outerHTML');
  assert.doesNotMatch(content, /style\s*=/, 'Must not use inline style attributes');
});
