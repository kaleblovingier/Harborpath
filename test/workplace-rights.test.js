/**
 * Unit & Integration Tests: Workplace Rights, FMLA & Professional Licensure (test/workplace-rights.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  FMLA_REGULATORY_RULES,
  ADA_PROTECTION_STANDARDS,
  PROFESSIONAL_LICENSURE_FRAMEWORKS,
  evaluateWorkplaceRights,
  getWorkplaceState,
  setWorkplaceState,
  resetWorkplaceState,
  formatWorkplaceSummaryText,
  workplaceRightsView,
} from '../public/js/views/workplaceRights.js';

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

describe('Workplace Rights, FMLA & Professional Licensure Module (public/js/views/workplaceRights.js)', () => {
  beforeEach(() => {
    resetWorkplaceState();
  });

  test('Module Exports & Statutory Framework Integrity', () => {
    assert.ok(Array.isArray(FMLA_REGULATORY_RULES), 'FMLA_REGULATORY_RULES is an array');
    assert.strictEqual(FMLA_REGULATORY_RULES.length, 3);
    assert.ok(FMLA_REGULATORY_RULES.some((r) => r.id === 'fmla_treatment_coverage'));
    assert.ok(FMLA_REGULATORY_RULES.some((r) => r.id === 'fmla_anti_retaliation'));

    assert.ok(Array.isArray(ADA_PROTECTION_STANDARDS), 'ADA_PROTECTION_STANDARDS is an array');
    assert.strictEqual(ADA_PROTECTION_STANDARDS.length, 3);
    assert.ok(ADA_PROTECTION_STANDARDS.some((s) => s.id === 'ada_in_recovery_safe_harbor'));
    assert.ok(ADA_PROTECTION_STANDARDS.some((s) => s.id === 'ada_prescribed_moud'));

    assert.ok(Array.isArray(PROFESSIONAL_LICENSURE_FRAMEWORKS), 'PROFESSIONAL_LICENSURE_FRAMEWORKS is an array');
    assert.strictEqual(PROFESSIONAL_LICENSURE_FRAMEWORKS.length, 3);
    assert.ok(PROFESSIONAL_LICENSURE_FRAMEWORKS.some((f) => f.profession === 'nursing'));
    assert.ok(PROFESSIONAL_LICENSURE_FRAMEWORKS.some((f) => f.profession === 'commercial_transport'));
  });

  test('evaluateWorkplaceRights: Correctly calculates FMLA eligibility', () => {
    // 1. Fully qualified case
    const qual = evaluateWorkplaceRights({
      employerSize: '50_plus',
      tenureMonths: 18,
      hoursWorkedLast12Months: 1500,
      treatmentStage: 'planning_treatment',
      prescribedMoud: true,
      jobCategory: 'general_office_service',
    });

    assert.strictEqual(qual.fmla.isQualified, true);
    assert.strictEqual(qual.fmla.status, 'qualified');
    assert.strictEqual(qual.fmla.barriers.length, 0);
    assert.ok(qual.nextSteps.some((s) => s.title.en.includes('Request FMLA Leave Forms')));

    // 2. Disqualified by employer size (<50 employees)
    const smallEmp = evaluateWorkplaceRights({
      employerSize: 'under_50',
      tenureMonths: 24,
      hoursWorkedLast12Months: 1800,
    });
    assert.strictEqual(smallEmp.fmla.isQualified, false);
    assert.strictEqual(smallEmp.fmla.status, 'employer_exempt');
    assert.ok(smallEmp.fmla.barriers.some((b) => b.en.includes('fewer than 50 employees')));

    // 3. Disqualified by tenure (<12 months)
    const shortTenure = evaluateWorkplaceRights({
      employerSize: '50_plus',
      tenureMonths: 6,
      hoursWorkedLast12Months: 1400,
    });
    assert.strictEqual(shortTenure.fmla.isQualified, false);
    assert.strictEqual(shortTenure.fmla.status, 'tenure_insufficient');

    // 4. Disqualified by hours (<1,250 hours)
    const lowHours = evaluateWorkplaceRights({
      employerSize: '50_plus',
      tenureMonths: 20,
      hoursWorkedLast12Months: 800,
    });
    assert.strictEqual(lowHours.fmla.isQualified, false);
    assert.strictEqual(lowHours.fmla.status, 'hours_insufficient');
  });

  test('evaluateWorkplaceRights: Applies ADA In-Recovery Safe Harbor & Prescribed MOUD rules', () => {
    const plan = evaluateWorkplaceRights({
      employerSize: 'under_50',
      tenureMonths: 8,
      hoursWorkedLast12Months: 600,
      treatmentStage: 'in_recovery_moud',
      prescribedMoud: true,
      jobCategory: 'healthcare_licensed',
    });

    assert.strictEqual(plan.ada.tier, 'protected_in_recovery');
    assert.strictEqual(plan.ada.hasMoudProtection, true);
    assert.ok(plan.ada.notes.some((n) => n.en.includes('42 U.S.C. § 12114(b)')));
    assert.ok(plan.ada.notes.some((n) => n.en.includes('DOJ Civil Rights')));
    assert.ok(plan.nextSteps.some((s) => s.title.en.includes('Medical Review Officer')));
    assert.ok(plan.licensureFramework !== null);
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getWorkplaceState();
    assert.strictEqual(initial.employerSize, '50_plus');
    assert.strictEqual(initial.tenureMonths, 14);

    setWorkplaceState({ employerSize: 'public_agency', tenureMonths: 36 });
    const updated = getWorkplaceState();
    assert.strictEqual(updated.employerSize, 'public_agency');
    assert.strictEqual(updated.tenureMonths, 36);

    resetWorkplaceState();
    const afterReset = getWorkplaceState();
    assert.strictEqual(afterReset.employerSize, '50_plus');
    assert.strictEqual(afterReset.tenureMonths, 14);
  });

  test('formatWorkplaceSummaryText: Produces bilingual text with HR disclosure guidelines', () => {
    const plan = evaluateWorkplaceRights({
      employerSize: '50_plus',
      tenureMonths: 16,
      hoursWorkedLast12Months: 1400,
      treatmentStage: 'planning_treatment',
      prescribedMoud: true,
      jobCategory: 'dot_safety_sensitive',
    });

    const enText = formatWorkplaceSummaryText(plan, 'en');
    assert.ok(enText.includes('WORKPLACE RIGHTS, FMLA & ADA EVALUATION'));
    assert.ok(enText.includes('QUALIFIED'));
    assert.ok(enText.includes('HUMAN RESOURCES DISCLOSURE GUIDELINES'));
    assert.ok(enText.includes('29 CFR § 825.500(g)'));

    const esText = formatWorkplaceSummaryText(plan, 'es');
    assert.ok(esText.includes('EVALUACIÓN DE DERECHOS LABORALES, FMLA Y ADA'));
    assert.ok(esText.includes('ELEGIBLE'));
    assert.ok(esText.includes('GUÍA DE COMUNICACIÓN CON RECURSOS HUMANOS'));
  });

  test('workplaceRightsView: Mounts accessible DOM structure across tabs', () => {
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };

    const container = new MockNode('DIV');
    container.id = 'app';

    // 1. Initial evaluator tab
    const root = workplaceRightsView(container);
    assert.ok(root instanceof MockNode);
    assert.ok(container.querySelector('.workplace-rights-view'));
    assert.ok(container.querySelector('.assessment-card'));
    assert.ok(container.querySelector('#wr-employer-select'));

    // 2. FMLA regulations tab
    setWorkplaceState({ activeTab: 'fmla_rules' });
    workplaceRightsView(container);
    assert.ok(container.querySelector('.fmla-card'));
    assert.strictEqual(container.querySelectorAll('.regulatory-section').length, 3);

    // 3. ADA rights tab
    setWorkplaceState({ activeTab: 'ada_rights' });
    workplaceRightsView(container);
    assert.ok(container.querySelector('.ada-card'));
    assert.strictEqual(container.querySelectorAll('.regulatory-section').length, 3);

    // 4. Licensure tab
    setWorkplaceState({ activeTab: 'licensure' });
    workplaceRightsView(container);
    assert.ok(container.querySelector('.licensure-card'));
    assert.strictEqual(container.querySelectorAll('.regulatory-section').length, 3);
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'workplaceRights.js');
    const source = readFileSync(filePath, 'utf8');

    // 1. Zero localStorage or sessionStorage
    assert.ok(!/\blocalStorage\b/.test(source), 'workplaceRights.js must NOT contain localStorage');
    assert.ok(!/\bsessionStorage\b/.test(source), 'workplaceRights.js must NOT contain sessionStorage');
    assert.ok(!/\bdocument\.cookie\b/.test(source), 'workplaceRights.js must NOT contain document.cookie');

    // 2. Zero innerHTML, outerHTML, or inline style=
    assert.ok(!/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(source), 'workplaceRights.js must NOT contain innerHTML/outerHTML');
    assert.ok(!/\bstyle\s*=/.test(source), 'workplaceRights.js must NOT contain inline style= attributes');

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
      assert.ok(!pattern.test(source), `workplaceRights.js must NOT contain banned phrase matching ${pattern}`);
    });
  });
});

