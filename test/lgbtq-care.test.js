/**
 * Unit & Integration Tests: LGBTQ+ & Gender-Affirming SUD Specialist (test/lgbtq-care.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  LGBTQ_CARE_STANDARDS,
  HRT_MOUD_SAFETY_INTERACTIONS,
  CHEMSEX_HARM_REDUCTION_PROTOCOLS,
  evaluateLgbtqCarePathway,
  getLgbtqState,
  setLgbtqState,
  resetLgbtqState,
  formatLgbtqSummaryText,
  lgbtqCareView,
} from '../public/js/views/lgbtqCare.js';

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

describe('LGBTQ+ & Gender-Affirming SUD Module (public/js/views/lgbtqCare.js)', () => {
  beforeEach(() => {
    resetLgbtqState();
  });

  test('Module Exports & Clinical Standards Framework Integrity', () => {
    assert.ok(Array.isArray(LGBTQ_CARE_STANDARDS));
    assert.strictEqual(LGBTQ_CARE_STANDARDS.length, 3);
    assert.ok(LGBTQ_CARE_STANDARDS.some((s) => s.id === 'hrt_moud_continuity'));
    assert.ok(LGBTQ_CARE_STANDARDS.some((s) => s.id === 'trans_facility_rights'));

    assert.ok(Array.isArray(HRT_MOUD_SAFETY_INTERACTIONS));
    assert.strictEqual(HRT_MOUD_SAFETY_INTERACTIONS.length, 4);

    assert.ok(Array.isArray(CHEMSEX_HARM_REDUCTION_PROTOCOLS));
    assert.strictEqual(CHEMSEX_HARM_REDUCTION_PROTOCOLS.length, 3);
    assert.ok(CHEMSEX_HARM_REDUCTION_PROTOCOLS.some((p) => p.substanceId === 'ghb_gbl'));
    assert.ok(CHEMSEX_HARM_REDUCTION_PROTOCOLS.some((p) => p.substanceId === 'poppers_nitrites'));
  });

  test('evaluateLgbtqCarePathway: Identifies critical Poppers + PDE5 inhibitor interaction', () => {
    const plan = evaluateLgbtqCarePathway({
      genderIdentity: 'cisgender_gay_bi',
      takingHrt: false,
      chemsexSubstances: ['poppers'],
      usingPde5Inhibitors: true,
    });

    assert.ok(plan.alerts.length >= 1);
    assert.strictEqual(plan.alerts[0].priority, 'critical');
    assert.ok(plan.alerts[0].title.en.includes('Viagra/Cialis'));
    assert.ok(plan.alerts[0].text.en.includes('irreversible vasodilation'));
  });

  test('evaluateLgbtqCarePathway: Validates HRT continuity and buprenorphine compatibility', () => {
    const plan = evaluateLgbtqCarePathway({
      genderIdentity: 'transgender_woman',
      takingHrt: true,
      moudInterest: 'buprenorphine',
      chemsexSubstances: ['methamphetamine'],
      needsPrepPep: true,
      seekingResidential: true,
    });

    assert.ok(plan.hrtAdvice !== null);
    assert.strictEqual(plan.hrtAdvice.status, 'fully_compatible');
    assert.ok(plan.hrtAdvice.detail.en.includes('WPATH SOC 8'));
    assert.ok(plan.residentialAdvice !== null);
    assert.ok(plan.residentialAdvice.title.en.includes('ACA § 1557'));
    assert.ok(plan.biomedicalAdvice.length >= 2);
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getLgbtqState();
    assert.strictEqual(initial.genderIdentity, 'transgender_woman');
    assert.strictEqual(initial.takingHrt, true);

    setLgbtqState({ genderIdentity: 'non_binary', takingHrt: false });
    const updated = getLgbtqState();
    assert.strictEqual(updated.genderIdentity, 'non_binary');
    assert.strictEqual(updated.takingHrt, false);

    resetLgbtqState();
    const after = getLgbtqState();
    assert.strictEqual(after.genderIdentity, 'transgender_woman');
    assert.strictEqual(after.takingHrt, true);
  });

  test('formatLgbtqSummaryText: Generates bilingual reports with Trevor Project and Trans Lifeline', () => {
    const plan = evaluateLgbtqCarePathway({
      genderIdentity: 'transgender_man',
      takingHrt: true,
      chemsexSubstances: ['ghb_gbl'],
      usingPde5Inhibitors: false,
      needsPrepPep: true,
    });

    const enText = formatLgbtqSummaryText(plan, 'en');
    assert.ok(enText.includes('LGBTQ+ & GENDER-AFFIRMING CLINICAL CARE PLAN'));
    assert.ok(enText.includes('1-866-488-7386'));
    assert.ok(enText.includes('1-877-565-8860'));
    assert.ok(enText.includes('WPATH'));

    const esText = formatLgbtqSummaryText(plan, 'es');
    assert.ok(esText.includes('PLAN CLÍNICO Y DE REDUCCIÓN DE DAÑOS LGBTQ+'));
    assert.ok(esText.includes('1-866-488-7386'));
    assert.ok(esText.includes('1-877-565-8860'));
  });

  test('lgbtqCareView: Mounts accessible DOM structure across tabs', () => {
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };

    const container = new MockNode('DIV');
    container.id = 'app';

    // 1. Initial decision aid tab
    const root = lgbtqCareView(container);
    assert.ok(root instanceof MockNode);
    assert.ok(container.querySelector('.lgbtq-care-view'));
    assert.ok(container.querySelector('.assessment-card'));
    assert.ok(container.querySelector('#lg-gid-select'));

    // 2. Standards tab
    setLgbtqState({ activeTab: 'standards' });
    lgbtqCareView(container);
    assert.ok(container.querySelector('.standards-card'));
    assert.strictEqual(container.querySelectorAll('.standard-section').length, 3);

    // 3. Chemsex tab
    setLgbtqState({ activeTab: 'chemsex' });
    lgbtqCareView(container);
    assert.ok(container.querySelector('.chemsex-card'));
    assert.strictEqual(container.querySelectorAll('.protocol-section').length, 3);

    // 4. HRT & MOUD matrix tab
    setLgbtqState({ activeTab: 'hrt_moud' });
    lgbtqCareView(container);
    assert.ok(container.querySelector('.hrt-card'));
    assert.strictEqual(container.querySelectorAll('.hrt-interaction-card').length, 4);
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'lgbtqCare.js');
    const source = readFileSync(filePath, 'utf8');

    // 1. Zero localStorage or sessionStorage
    assert.ok(!/\blocalStorage\b/.test(source), 'lgbtqCare.js must NOT contain localStorage');
    assert.ok(!/\bsessionStorage\b/.test(source), 'lgbtqCare.js must NOT contain sessionStorage');
    assert.ok(!/\bdocument\.cookie\b/.test(source), 'lgbtqCare.js must NOT contain document.cookie');

    // 2. Zero innerHTML, outerHTML, or inline style=
    assert.ok(!/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(source), 'lgbtqCare.js must NOT contain innerHTML/outerHTML');
    assert.ok(!/\bstyle\s*=/.test(source), 'lgbtqCare.js must NOT contain inline style= attributes');

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
      assert.ok(!pattern.test(source), `lgbtqCare.js must NOT contain banned phrase matching ${pattern}`);
    });
  });
});
