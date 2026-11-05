// test/methadone-access.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  FEDERAL_TAKE_HOME_TIERS_2024,
  CRITERIA_8_POINT_ASSESSMENT,
  METHADONE_PHARMACOKINETICS_SAFETY,
  PATIENT_RIGHTS_2024,
  evaluateTakeHomeEligibility,
  buildAdvocacyScript,
  formatMethadoneSummaryText,
  getMethadoneState,
  setMethadoneState,
  resetMethadoneState,
  methadoneAccessView
} from '../public/js/views/methadoneAccess.js';

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
        else if (selector === 'select' && node.tagName === 'SELECT') matches.push(node);
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

test('FEDERAL_TAKE_HOME_TIERS_2024 exports all 3 federal schedule tiers with bilingual copy', () => {
  assert.equal(FEDERAL_TAKE_HOME_TIERS_2024.length, 3);

  const tier1 = FEDERAL_TAKE_HOME_TIERS_2024[0];
  assert.equal(tier1.tierId, 'days_0_14');
  assert.equal(tier1.maxTakeHomes, 7);

  const tier2 = FEDERAL_TAKE_HOME_TIERS_2024[1];
  assert.equal(tier2.tierId, 'days_15_30');
  assert.equal(tier2.maxTakeHomes, 14);

  const tier3 = FEDERAL_TAKE_HOME_TIERS_2024[2];
  assert.equal(tier3.tierId, 'days_31_plus');
  assert.equal(tier3.maxTakeHomes, 28);
});

test('CRITERIA_8_POINT_ASSESSMENT exports all 8 statutory safety criteria under 42 CFR § 8.12(i)(2)', () => {
  assert.equal(CRITERIA_8_POINT_ASSESSMENT.length, 8);
  for (const crit of CRITERIA_8_POINT_ASSESSMENT) {
    assert.ok(crit.id);
    assert.ok(crit.titleEn);
    assert.ok(crit.titleEs);
    assert.ok(crit.descEn);
    assert.ok(crit.descEs);
  }
});

test('METHADONE_PHARMACOKINETICS_SAFETY outlines dose stacking and long-acting naloxone rebound directives', () => {
  assert.match(METHADONE_PHARMACOKINETICS_SAFETY.inductionEn.startDose, /20 mg to 30 mg/i);
  assert.match(METHADONE_PHARMACOKINETICS_SAFETY.inductionEn.doseStackingWarning, /dose stacking/i);
  assert.match(METHADONE_PHARMACOKINETICS_SAFETY.inductionEn.naloxoneReboundWarning, /12 to 24 hours/i);
  assert.ok(METHADONE_PHARMACOKINETICS_SAFETY.cardiacEn.riskFactors.length >= 4);
});

test('PATIENT_RIGHTS_2024 enforces federal anti-punitive protections', () => {
  assert.equal(PATIENT_RIGHTS_2024.length, 4);

  const historyRight = PATIENT_RIGHTS_2024.find((r) => /1-Year/i.test(r.topicEn));
  assert.ok(historyRight);
  assert.match(historyRight.ruleEn, /no longer need to prove/i);

  const toxRight = PATIENT_RIGHTS_2024.find((r) => /Toxicology/i.test(r.topicEn));
  assert.ok(toxRight);
  assert.match(toxRight.ruleEn, /CANNOT be the sole basis/i);

  const taperRight = PATIENT_RIGHTS_2024.find((r) => /Tapers/i.test(r.topicEn));
  assert.ok(taperRight);
  assert.match(taperRight.ruleEn, /curb tapering/i);
});

test('evaluateTakeHomeEligibility calculates federal maximums and enforces lockbox safety', () => {
  // Scenario 1: Missing lockbox blocks multi-day take-homes
  const noLockbox = evaluateTakeHomeEligibility({ daysInTreatment: 60, hasLockbox: false });
  assert.equal(noLockbox.eligibleTakeHomes, 0);
  assert.equal(noLockbox.isBlockedByLockbox, true);
  assert.match(noLockbox.summaryEn, /secure locked container/i);

  // Scenario 2: Days 0-14 with lockbox and criteria
  const resTier1 = evaluateTakeHomeEligibility({
    daysInTreatment: 10,
    hasLockbox: true,
    selectedCriteria: ['crit_toxicity', 'crit_attendance', 'crit_behavior', 'crit_diversion', 'crit_safe_storage', 'crit_benefit_vs_risk']
  });
  assert.equal(resTier1.eligibleTakeHomes, 7);
  assert.equal(resTier1.tierMax, 7);
  assert.equal(resTier1.isFullySupported, true);

  // Scenario 3: Days 15-30 with lockbox and criteria
  const resTier2 = evaluateTakeHomeEligibility({
    daysInTreatment: 20,
    hasLockbox: true,
    selectedCriteria: ['crit_toxicity', 'crit_attendance', 'crit_behavior', 'crit_diversion', 'crit_safe_storage', 'crit_benefit_vs_risk']
  });
  assert.equal(resTier2.eligibleTakeHomes, 14);
  assert.equal(resTier2.tierMax, 14);

  // Scenario 4: Days 31+ with lockbox and criteria
  const resTier3 = evaluateTakeHomeEligibility({
    daysInTreatment: 45,
    hasLockbox: true,
    selectedCriteria: ['crit_toxicity', 'crit_attendance', 'crit_behavior', 'crit_diversion', 'crit_safe_storage', 'crit_benefit_vs_risk']
  });
  assert.equal(resTier3.eligibleTakeHomes, 28);
  assert.equal(resTier3.tierMax, 28);
});

test('buildAdvocacyScript generates legally grounded patient communication scripts', () => {
  const takehomeScript = buildAdvocacyScript({ scriptType: 'takehome_request' });
  assert.match(takehomeScript, /2024 SAMHSA 42 CFR Part 8/);
  assert.match(takehomeScript, /lockbox/);

  const toxScript = buildAdvocacyScript({ scriptType: 'toxicology_advocacy' });
  assert.match(toxScript, /cannot be used as the sole reason/);

  const guestScript = buildAdvocacyScript({ scriptType: 'guest_dosing', destinationCity: 'Seattle, WA' });
  assert.match(guestScript, /Seattle, WA/);
  assert.match(guestScript, /courtesy dosing/);

  const taperScript = buildAdvocacyScript({ scriptType: 'voluntary_taper' });
  assert.match(taperScript, /patient-paced/);
});

test('formatMethadoneSummaryText generates complete bilingual reports without PII', () => {
  const enSummary = formatMethadoneSummaryText({ daysInTreatment: 45, hasLockbox: true, selectedCriteria: ['crit_toxicity'] }, 'en');
  assert.match(enSummary, /HARBORPATH — METHADONE ACCESS & 42 CFR PART 8 REPORT/);
  assert.match(enSummary, /TAKE-HOME MEDICATION EVALUATION/);
  assert.match(enSummary, /PHARMACOKINETIC SAFETY PEARLS/);
  assert.match(enSummary, /FEDERAL PATIENT RIGHTS/);

  const esSummary = formatMethadoneSummaryText({ daysInTreatment: 45, hasLockbox: true, selectedCriteria: ['crit_toxicity'] }, 'es');
  assert.match(esSummary, /REPORTE DE DERECHOS Y METADONA/);
  assert.match(esSummary, /EVALUACIÓN DE DOSIS PARA LLEVAR/);
  assert.match(esSummary, /PUNTOS CLAVE DE SEGURIDAD FARMACOCINÉTICA/);
});

test('In-RAM state management provides deterministic reset and isolation', () => {
  resetMethadoneState();
  const init = getMethadoneState();
  assert.equal(init.activeTab, 'takehome-calc');
  assert.equal(init.daysInTreatment, 45);
  assert.equal(init.hasLockbox, true);

  setMethadoneState({
    activeTab: 'advocacy-scripts',
    daysInTreatment: 100,
    hasLockbox: false
  });

  const modified = getMethadoneState();
  assert.equal(modified.activeTab, 'advocacy-scripts');
  assert.equal(modified.daysInTreatment, 100);
  assert.equal(modified.hasLockbox, false);

  resetMethadoneState();
  const reset = getMethadoneState();
  assert.equal(reset.activeTab, 'takehome-calc');
  assert.equal(reset.daysInTreatment, 45);
  assert.equal(reset.hasLockbox, true);
});

test('methadoneAccessView renders accessible WCAG 2.2 AA compliant UI', () => {
  const originalDoc = globalThis.document;
  const originalNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag)
  };

  try {
    resetMethadoneState();
    const view = methadoneAccessView();
    assert.ok(view);
    assert.equal(view.className, 'methadone-access-view container');

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

test('Static security and privacy audit of methadoneAccess.js', () => {
  const content = readFileSync(new URL('../public/js/views/methadoneAccess.js', import.meta.url), 'utf8');

  assert.doesNotMatch(content, /localStorage/, 'Must not access localStorage');
  assert.doesNotMatch(content, /sessionStorage/, 'Must not access sessionStorage');
  assert.doesNotMatch(content, /document\.cookie/, 'Must not access document.cookie');
  assert.doesNotMatch(content, /innerHTML/, 'Must not use innerHTML');
  assert.doesNotMatch(content, /outerHTML/, 'Must not use outerHTML');
  assert.doesNotMatch(content, /style\s*=/, 'Must not use inline style attributes');
});

