/**
 * Unit & Integration Tests: Indigenous & Tribal Health Specialist (test/tribal-health.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  TRIBAL_HEALTH_STATUTES,
  IHS_PRC_PRIORITY_LEVELS,
  PRC_NOTIFICATION_TIMELINES,
  CULTURALLY_GROUNDED_PRACTICES,
  evaluateTribalHealthPlan,
  getTribalHealthState,
  setTribalHealthState,
  resetTribalHealthState,
  formatTribalHealthSummaryText,
  tribalHealthView,
} from '../public/js/views/tribalHealth.js';

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

describe('Indigenous & Tribal Health Module (public/js/views/tribalHealth.js)', () => {
  beforeEach(() => {
    resetTribalHealthState();
  });

  test('Module Exports & Statutory Framework Integrity', () => {
    assert.ok(Array.isArray(TRIBAL_HEALTH_STATUTES), 'TRIBAL_HEALTH_STATUTES is an array');
    assert.ok(TRIBAL_HEALTH_STATUTES.length >= 3);
    assert.ok(TRIBAL_HEALTH_STATUTES.some((s) => s.id === 'ihcia_framework'));
    assert.ok(TRIBAL_HEALTH_STATUTES.some((s) => s.id === 'medicaid_cost_sharing_exemption'));
    assert.ok(TRIBAL_HEALTH_STATUTES.some((s) => s.id === 'icwa_protections'));

    assert.ok(Array.isArray(IHS_PRC_PRIORITY_LEVELS));
    assert.strictEqual(IHS_PRC_PRIORITY_LEVELS.length, 4);

    assert.strictEqual(PRC_NOTIFICATION_TIMELINES.standardWindow.hours, 72);
    assert.strictEqual(PRC_NOTIFICATION_TIMELINES.elderAndDisabledWindow.days, 30);

    assert.ok(Array.isArray(CULTURALLY_GROUNDED_PRACTICES));
    assert.ok(CULTURALLY_GROUNDED_PRACTICES.length >= 4);
    assert.ok(CULTURALLY_GROUNDED_PRACTICES.some((c) => c.id === 'moud_harmony'));
  });

  test('evaluateTribalHealthPlan: Validates Medicaid § 1916(j) $0 cost sharing and UIHO pathway', () => {
    const plan = evaluateTribalHealthPlan({
      affiliation: 'urban_indian_off_reservation',
      locationType: 'urban_city',
      facilityAccess: 'urban_indian_health_center',
      medicaidStatus: 'active',
      emergencyVisitPast72h: false,
    });

    assert.strictEqual(plan.isEligibleAIAN, true);
    assert.strictEqual(plan.costSharingProtection.isExempt, true);
    assert.ok(plan.costSharingProtection.summary.en.includes('$0 copays'));
    assert.ok(plan.facilityRecommendations.some((r) => r.type === 'urban_health'));
  });

  test('evaluateTribalHealthPlan: Detects emergency PRC 72-hour notice vs elder 30-day notice', () => {
    // 1. Standard emergency visit
    const stdPlan = evaluateTribalHealthPlan({
      affiliation: 'federally_recognized_tribe',
      emergencyVisitPast72h: true,
      isElderOrDisabled: false,
    });
    assert.ok(stdPlan.prcAdvice !== null);
    assert.ok(stdPlan.prcAdvice.title.en.includes('72 hours'));

    // 2. Elder emergency visit
    const elderPlan = evaluateTribalHealthPlan({
      affiliation: 'federally_recognized_tribe',
      emergencyVisitPast72h: true,
      isElderOrDisabled: true,
    });
    assert.ok(elderPlan.prcAdvice !== null);
    assert.ok(elderPlan.prcAdvice.title.en.includes('30 days'));
  });

  test('evaluateTribalHealthPlan: Incorporates ICWA active efforts when children involved', () => {
    const plan = evaluateTribalHealthPlan({
      affiliation: 'federally_recognized_tribe',
      hasFamilyChildren: true,
    });

    assert.ok(plan.icwaAdvice !== null);
    assert.ok(plan.icwaAdvice.title.en.includes('ICWA'));
    assert.ok(plan.icwaAdvice.detail.en.includes('active efforts'));
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getTribalHealthState();
    assert.strictEqual(initial.affiliation, 'federally_recognized_tribe');

    setTribalHealthState({ affiliation: 'urban_indian_off_reservation', locationType: 'urban_city' });
    const updated = getTribalHealthState();
    assert.strictEqual(updated.affiliation, 'urban_indian_off_reservation');
    assert.strictEqual(updated.locationType, 'urban_city');

    resetTribalHealthState();
    const after = getTribalHealthState();
    assert.strictEqual(after.affiliation, 'federally_recognized_tribe');
    assert.strictEqual(after.locationType, 'reservation_trust_land');
  });

  test('formatTribalHealthSummaryText: Produces bilingual text with StrongHearts helpline', () => {
    const plan = evaluateTribalHealthPlan({
      affiliation: 'federally_recognized_tribe',
      emergencyVisitPast72h: true,
      isElderOrDisabled: false,
      hasFamilyChildren: true,
    });

    const enText = formatTribalHealthSummaryText(plan, 'en');
    assert.ok(enText.includes('INDIGENOUS & TRIBAL HEALTH CARE PLAN'));
    assert.ok(enText.includes('1-844-762-8483'));
    assert.ok(enText.includes('PURCHASED/REFERRED CARE (PRC)'));
    assert.ok(enText.includes('ICWA'));

    const esText = formatTribalHealthSummaryText(plan, 'es');
    assert.ok(esText.includes('PLAN DE SALUD INDÍGENA Y TRIBAL'));
    assert.ok(esText.includes('1-844-762-8483'));
    assert.ok(esText.includes('PURCHASING/REFERRED CARE') || esText.includes('PRC'));
  });

  test('tribalHealthView: Mounts accessible DOM structure across tabs', () => {
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };

    const container = new MockNode('DIV');
    container.id = 'app';

    // 1. Initial decision aid tab
    const root = tribalHealthView(container);
    assert.ok(root instanceof MockNode);
    assert.ok(container.querySelector('.tribal-health-view'));
    assert.ok(container.querySelector('.assessment-card'));
    assert.ok(container.querySelector('#th-affil-select'));

    // 2. PRC rules tab
    setTribalHealthState({ activeTab: 'prc_rules' });
    tribalHealthView(container);
    assert.ok(container.querySelector('.prc-card'));
    assert.strictEqual(container.querySelectorAll('.prc-level-section').length, 4);

    // 3. Statutes tab
    setTribalHealthState({ activeTab: 'statutes' });
    tribalHealthView(container);
    assert.ok(container.querySelector('.statutes-card'));
    assert.strictEqual(container.querySelectorAll('.statute-section').length, 3);

    // 4. Cultural practices tab
    setTribalHealthState({ activeTab: 'cultural' });
    tribalHealthView(container);
    assert.ok(container.querySelector('.cultural-card'));
    assert.strictEqual(container.querySelectorAll('.cultural-item-card').length, 5);
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'tribalHealth.js');
    const source = readFileSync(filePath, 'utf8');

    // 1. Zero localStorage or sessionStorage
    assert.ok(!/\blocalStorage\b/.test(source), 'tribalHealth.js must NOT contain localStorage');
    assert.ok(!/\bsessionStorage\b/.test(source), 'tribalHealth.js must NOT contain sessionStorage');
    assert.ok(!/\bdocument\.cookie\b/.test(source), 'tribalHealth.js must NOT contain document.cookie');

    // 2. Zero innerHTML, outerHTML, or inline style=
    assert.ok(!/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(source), 'tribalHealth.js must NOT contain innerHTML/outerHTML');
    assert.ok(!/\bstyle\s*=/.test(source), 'tribalHealth.js must NOT contain inline style= attributes');

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
      assert.ok(!pattern.test(source), `tribalHealth.js must NOT contain banned phrase matching ${pattern}`);
    });
  });
});

