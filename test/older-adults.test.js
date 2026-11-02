/**
 * Unit & Integration Tests: Older Adults & Medicare SUD Specialist (test/older-adults.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  MEDICARE_SUD_RULES,
  BEERS_CRITERIA_INTERACTIONS,
  GERIATRIC_PHARMACOKINETIC_RULES,
  OLDER_ADULT_SCREENING_STANDARDS,
  evaluateOlderAdultCare,
  getOlderAdultState,
  setOlderAdultState,
  resetOlderAdultsState,
  formatOlderAdultSummaryText,
  olderAdultsView,
} from '../public/js/views/olderAdults.js';

class MockNode {
  constructor(tagName) {
    this.tagName = tagName ? tagName.toUpperCase() : '#TEXT';
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.dataset = {};
    this._textContent = '';
    this.parent = null;
    this.checked = false;
    this.value = '';
    this.id = '';
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this._textContent = String(val ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }

  getAttribute(k) {
    return this.attributes[k] ?? null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
  }

  addEventListener(event, fn) {
    this.listeners[event] = fn;
  }

  dispatchEvent(event, data = {}) {
    const fn = this.listeners[event];
    if (typeof fn === 'function') fn({ target: this, ...data });
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

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx !== -1) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (node instanceof MockNode) {
        if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
        else if (selector === 'a' && node.tagName === 'A') matches.push(node);
        else if (selector === 'select' && node.tagName === 'SELECT') matches.push(node);
        else if (selector === 'input' && node.tagName === 'INPUT') matches.push(node);
        else if (selector.startsWith('#') && node.attributes.id === selector.slice(1)) matches.push(node);
        else if (selector.startsWith('.') && node.className && node.className.split(/\s+/).includes(selector.slice(1))) matches.push(node);
        for (const child of node.children) {
          if (child instanceof MockNode) walk(child);
        }
      }
    };
    walk(this);
    return matches;
  }
}

describe('Older Adults & Medicare SUD Module (public/js/views/olderAdults.js)', () => {
  beforeEach(() => {
    resetOlderAdultsState();
  });

  test('Module Exports & Statutory Framework Integrity', () => {
    assert.ok(Array.isArray(MEDICARE_SUD_RULES), 'MEDICARE_SUD_RULES must be an array');
    assert.ok(MEDICARE_SUD_RULES.length >= 4, 'Contains Part B OTP, OBOT, Part D, and Part C network adequacy');
    assert.ok(MEDICARE_SUD_RULES.some((r) => r.benefitId === 'part_b_otp'));
    assert.ok(MEDICARE_SUD_RULES.some((r) => r.benefitId === 'medicare_advantage_adequacy'));

    assert.ok(Array.isArray(BEERS_CRITERIA_INTERACTIONS), 'BEERS_CRITERIA_INTERACTIONS must be an array');
    assert.ok(BEERS_CRITERIA_INTERACTIONS.length >= 5, 'Contains at least 5 critical Beers interactions');
    assert.ok(BEERS_CRITERIA_INTERACTIONS.some((b) => b.id === 'opioid_benzodiazepine'));
    assert.ok(BEERS_CRITERIA_INTERACTIONS.some((b) => b.id === 'opioid_gabapentinoid'));
    assert.ok(BEERS_CRITERIA_INTERACTIONS.some((b) => b.id === 'sedative_hypnotics_z_drugs'));

    assert.ok(GERIATRIC_PHARMACOKINETIC_RULES.renalClearance.en);
    assert.ok(GERIATRIC_PHARMACOKINETIC_RULES.buprenorphineAdvantage.en);
    assert.ok(OLDER_ADULT_SCREENING_STANDARDS.auditCCutoff.en.includes('>= 3'));
  });

  test('evaluateOlderAdultCare: Validates Medicare Part B OTP coverage & zero coinsurance', () => {
    const plan = evaluateOlderAdultCare({
      age: 70,
      medicarePlan: 'part_b_original',
      substances: ['opioids'],
      currentMedications: [],
    });

    assert.strictEqual(plan.inputs.isGeriatric, true);
    assert.ok(plan.medicareSummary.otpCoverage.includes('$0 copay'));
    assert.ok(plan.clinicalRecommendations.some((c) => c.title.en.includes('Buprenorphine as Preferred Geriatric MOUD')));
  });

  test('evaluateOlderAdultCare: Detects critical Beers Criteria interactions', () => {
    const plan = evaluateOlderAdultCare({
      age: 74,
      medicarePlan: 'medicare_advantage',
      substances: ['opioids'],
      currentMedications: ['benzodiazepine', 'gabapentinoid', 'z_drugs'],
      fallHistory: true,
    });

    assert.strictEqual(plan.identifiedBeers.length, 3);
    assert.ok(plan.identifiedBeers.some((b) => b.id === 'opioid_benzodiazepine' && b.severity === 'critical'));
    assert.ok(plan.identifiedBeers.some((b) => b.id === 'opioid_gabapentinoid'));
    assert.ok(plan.identifiedBeers.some((b) => b.id === 'sedative_hypnotics_z_drugs'));

    // Network notice for Medicare Advantage specifies 42 CFR 422.116
    assert.ok(plan.medicareSummary.networkNotice.includes('42 C.F.R. § 422.116'));
  });

  test('evaluateOlderAdultCare: Detects methadone QTc prolongation risk with cardiac meds', () => {
    const plan = evaluateOlderAdultCare({
      age: 69,
      medicarePlan: 'part_b_original',
      substances: ['opioids'],
      currentMedications: ['cardiac_antiarrhythmic'],
    });

    assert.ok(plan.identifiedBeers.some((b) => b.id === 'methadone_qtc_prolongation'));
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getOlderAdultState();
    assert.strictEqual(initial.age, 68);

    setOlderAdultState({ age: 82, medicarePlan: 'dual_eligible' });
    const updated = getOlderAdultState();
    assert.strictEqual(updated.age, 82);
    assert.strictEqual(updated.medicarePlan, 'dual_eligible');

    resetOlderAdultsState();
    const afterReset = getOlderAdultState();
    assert.strictEqual(afterReset.age, 68);
    assert.strictEqual(afterReset.medicarePlan, 'part_b_original');
  });

  test('formatOlderAdultSummaryText: Generates bilingual reports with provider checklist', () => {
    const plan = evaluateOlderAdultCare({
      age: 72,
      medicarePlan: 'part_b_original',
      substances: ['alcohol'],
      currentMedications: ['anticholinergic'],
    });

    const enText = formatOlderAdultSummaryText(plan, 'en');
    assert.ok(enText.includes('OLDER ADULTS & MEDICARE SUD CLINICAL CARE PLAN'));
    assert.ok(enText.includes('72 years'));
    assert.ok(enText.includes('MEDICARE COVERAGE'));
    assert.ok(enText.includes('PROVIDER DISCUSSION CHECKLIST'));

    const esText = formatOlderAdultSummaryText(plan, 'es');
    assert.ok(esText.includes('PLAN CLÍNICO DE ADULTOS MAYORES'));
    assert.ok(esText.includes('72 años'));
    assert.ok(esText.includes('PREGUNTAS PARA SU EQUIPO MÉDICO'));
  });

  test('olderAdultsView: Mounts accessible DOM structure across tabs', () => {
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };

    const container = new MockNode('DIV');
    container.id = 'app';

    // 1. Initial render (decision_aid tab)
    const root = olderAdultsView(container);
    assert.ok(root instanceof MockNode);
    assert.ok(container.querySelector('.older-adults-view'));
    assert.ok(container.querySelector('.assessment-card'));
    assert.ok(container.querySelector('#oa-age-input'));

    // 2. Medicare tab
    setOlderAdultState({ activeTab: 'medicare' });
    olderAdultsView(container);
    assert.ok(container.querySelector('.medicare-card'));
    assert.strictEqual(container.querySelectorAll('.medicare-rule-section').length, 4);

    // 3. Beers tab
    setOlderAdultState({ activeTab: 'beers' });
    olderAdultsView(container);
    assert.ok(container.querySelector('.beers-criteria-card'));
    assert.strictEqual(container.querySelectorAll('.beers-detail-section').length, 5);

    // 4. Pharmacokinetics tab
    setOlderAdultState({ activeTab: 'pharmacokinetics' });
    olderAdultsView(container);
    assert.ok(container.querySelector('.pk-card'));
    assert.strictEqual(container.querySelectorAll('.pk-item-card').length, 4);
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'olderAdults.js');
    const source = readFileSync(filePath, 'utf8');

    // 1. Zero localStorage or sessionStorage
    assert.ok(!/\blocalStorage\b/.test(source), 'olderAdults.js must NOT contain localStorage');
    assert.ok(!/\bsessionStorage\b/.test(source), 'olderAdults.js must NOT contain sessionStorage');
    assert.ok(!/\bdocument\.cookie\b/.test(source), 'olderAdults.js must NOT contain document.cookie');

    // 2. Zero innerHTML, outerHTML, or inline style=
    assert.ok(!/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(source), 'olderAdults.js must NOT contain innerHTML/outerHTML');
    assert.ok(!/\bstyle\s*=/.test(source), 'olderAdults.js must NOT contain inline style= attributes');

    // 3. Zero banned privacy phrases
    const BANNED = [
      /saved to disk/i,
      /erases? everything/i,
      /zero[- ]knowledge/i,
      /does not record search terms/i,
      /never stored/i,
      /nothing is logged/i,
      /100% private/i,
      /\bse borra todo\b/i,
      /\bnunca se guarda\b/i,
      /\bse guardan? en el disco\b/i,
      /\bnada se registra\b/i,
      /\b100\s*%\s*privad/i,
    ];

    BANNED.forEach((pattern) => {
      assert.ok(!pattern.test(source), `olderAdults.js must NOT contain banned phrase matching ${pattern}`);
    });
  });
});
