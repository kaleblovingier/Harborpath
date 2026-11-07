/**
 * Unit & Integration Tests: Rural & Frontier Health Specialist (test/rural-health.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  RURAL_HEALTH_STATUTES,
  NEMT_SCHEDULING_RULES,
  MAIL_HARM_REDUCTION_STANDARDS,
  evaluateRuralCarePlan,
  getRuralHealthState,
  setRuralHealthState,
  resetRuralHealthState,
  formatRuralHealthSummaryText,
  ruralHealthView,
} from '../public/js/views/ruralHealth.js';

// Minimal DOM mock for headless testing
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
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        if (node.className && node.className.split(/\s+/).includes(cls)) {
          matches.push(node);
        }
      } else if (selector.startsWith('#')) {
        const id = selector.slice(1);
        if (node.id === id) matches.push(node);
      } else if (selector.includes('[')) {
        const attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/);
        if (attrMatch) {
          const [, attr, val] = attrMatch;
          if (val !== undefined) {
            if (node.getAttribute(attr) === val) matches.push(node);
          } else if (node.getAttribute(attr) !== null) {
            matches.push(node);
          }
        }
      } else if (node.tagName.toLowerCase() === selector.toLowerCase()) {
        matches.push(node);
      }
      for (const child of node.children) {
        if (child instanceof MockNode) walk(child);
      }
    };
    walk(this);
    return matches;
  }
}

if (!globalThis.Node) {
  globalThis.Node = MockNode;
}

if (!globalThis.document) {
  globalThis.document = {
    createElement(tag) {
      return new MockNode(tag);
    },
    createElementNS(_ns, tag) {
      return new MockNode(tag);
    },
    getElementById() {
      return null;
    },
    createTextNode(text) {
      const node = new MockNode('#text');
      node._textContent = String(text);
      return node;
    },
    createDocumentFragment() {
      return new MockNode('fragment');
    },
    body: new MockNode('body'),
  };
}

describe('Rural & Frontier Health Module (public/js/views/ruralHealth.js)', () => {
  beforeEach(() => {
    resetRuralHealthState();
  });

  test('Module Exports & Statutory Framework Integrity', () => {
    assert.ok(Array.isArray(RURAL_HEALTH_STATUTES), 'RURAL_HEALTH_STATUTES must be an array');
    assert.equal(RURAL_HEALTH_STATUTES.length, 3);

    const rhc = RURAL_HEALTH_STATUTES.find((s) => s.id === 'rhc_statute');
    assert.ok(rhc, 'Must include RHC statute');
    assert.match(rhc.citation, /42 U.S.C\. § 1395x\(aa\)/);

    const nemt = RURAL_HEALTH_STATUTES.find((s) => s.id === 'nemt_statute');
    assert.ok(nemt, 'Must include NEMT statute');
    assert.match(nemt.citation, /42 C\.F\.R\. § 431\.53/);

    assert.equal(NEMT_SCHEDULING_RULES.standardAdvanceHours, 48);
    assert.ok(NEMT_SCHEDULING_RULES.coveredDestinations.length >= 4);

    assert.ok(Array.isArray(MAIL_HARM_REDUCTION_STANDARDS));
    assert.ok(MAIL_HARM_REDUCTION_STANDARDS.some((s) => s.service.includes('NEXT Distro')));
    assert.ok(MAIL_HARM_REDUCTION_STANDARDS.some((s) => s.service.includes('Never Use Alone')));
  });

  test('evaluateRuralCarePlan: Triggers Medicaid NEMT when vehicle unavailable or distance >= 30 miles', () => {
    const plan = evaluateRuralCarePlan({
      countyType: 'rural',
      distanceToClinicMiles: 35,
      hasPersonalVehicle: false,
      medicaidEnrolled: true,
      interestedInTeleMoud: true,
    });

    assert.equal(plan.transitHurdle, true);
    assert.ok(plan.transportationSolutions.length > 0);
    assert.match(plan.transportationSolutions[0].title.en, /Medicaid NEMT/);
    assert.match(plan.transportationSolutions[0].detail.en, /42 C\.F\.R\. § 431\.53/);
  });

  test('evaluateRuralCarePlan: Identifies Frontier Isolation & Farmworker Clinical Alerts', () => {
    const plan = evaluateRuralCarePlan({
      countyType: 'frontier',
      distanceToClinicMiles: 65,
      hasPersonalVehicle: true,
      medicaidEnrolled: false,
      isAgriculturalWorker: true,
      interestedInTeleMoud: true,
      needsMailOrderHarmReduction: true,
    });

    assert.equal(plan.isFrontier, true);
    assert.ok(plan.alerts.some((a) => a.type === 'telehealth_priority'));
    assert.ok(plan.alerts.some((a) => a.type === 'farmworker_safety'));
    assert.match(plan.alerts.find((a) => a.type === 'farmworker_safety').detail.en, /heat stroke/i);

    assert.ok(plan.harmReductionPlan.some((h) => h.title.en.includes('NEXT Distro')));
    assert.ok(plan.harmReductionPlan.some((h) => h.title.en.includes('Never Use Alone')));
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getRuralHealthState();
    assert.equal(initial.countyType, 'rural');
    assert.equal(initial.activeTab, 'decision_aid');

    setRuralHealthState({
      countyType: 'frontier',
      distanceToClinicMiles: 75,
      activeTab: 'nemt_transit',
    });

    const modified = getRuralHealthState();
    assert.equal(modified.countyType, 'frontier');
    assert.equal(modified.distanceToClinicMiles, 75);
    assert.equal(modified.activeTab, 'nemt_transit');

    resetRuralHealthState();
    const afterReset = getRuralHealthState();
    assert.equal(afterReset.countyType, 'rural');
    assert.equal(afterReset.distanceToClinicMiles, 25);
    assert.equal(afterReset.activeTab, 'decision_aid');
  });

  test('formatRuralHealthSummaryText: Generates comprehensive bilingual plain-text summaries', () => {
    const plan = evaluateRuralCarePlan({
      countyType: 'frontier',
      distanceToClinicMiles: 50,
      hasPersonalVehicle: false,
      medicaidEnrolled: true,
      isAgriculturalWorker: true,
      interestedInTeleMoud: true,
    });

    const enText = formatRuralHealthSummaryText(plan, 'en');
    assert.match(enText, /RURAL & FRONTIER HEALTH CARE ACCESS PLAN/);
    assert.match(enText, /FRONTIER/);
    assert.match(enText, /CARE & SAFETY ALERTS/);
    assert.match(enText, /RECOMMENDED TRANSPORTATION SOLUTIONS/);
    assert.match(enText, /Never Use Alone: 1-800-484-3731/);

    const esText = formatRuralHealthSummaryText(plan, 'es');
    assert.match(esText, /PLAN DE SALUD RURAL Y ACCESO A TRANSPORTE/);
    assert.match(esText, /FRONTIER/);
    assert.match(esText, /ALERTAS DE ATENCIÓN Y SEGURIDAD/);
    assert.match(esText, /SOLUCIONES DE TRANSPORTE RECOMENDADAS/);
    assert.match(esText, /Never Use Alone: 1-800-484-3731/);
  });

  test('ruralHealthView: Mounts accessible DOM structure across tabs', () => {
    const container = new MockNode('div');
    const view = ruralHealthView(container);
    assert.ok(container.children.length > 0, 'Container should receive elements');

    const tabButtons = container.querySelectorAll('button[role="tab"]');
    assert.equal(tabButtons.length, 4, 'Must render 4 navigation tabs');

    // Switch to nemt_transit tab
    const nemtTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'nemt_transit');
    assert.ok(nemtTab, 'Should find nemt_transit tab button');
    nemtTab.dispatchEvent('click');
    assert.equal(getRuralHealthState().activeTab, 'nemt_transit');

    // Switch to mail_harm_reduction tab
    const mailTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'mail_harm_reduction');
    assert.ok(mailTab, 'Should find mail_harm_reduction tab button');
    mailTab.dispatchEvent('click');
    assert.equal(getRuralHealthState().activeTab, 'mail_harm_reduction');

    // Switch to rhc_standards tab
    const rhcTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'rhc_standards');
    assert.ok(rhcTab, 'Should find rhc_standards tab button');
    rhcTab.dispatchEvent('click');
    assert.equal(getRuralHealthState().activeTab, 'rhc_standards');
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'ruralHealth.js');
    const source = readFileSync(filePath, 'utf8');

    // Strict zero-storage / zero-tracking check
    assert.doesNotMatch(source, /\b(localStorage|sessionStorage|indexedDB)\b/, 'Must not touch device storage');
    assert.doesNotMatch(source, /\bdocument\.cookie\b/, 'Must not access cookies');
    assert.doesNotMatch(source, /\bfetch\s*\(/, 'Must run 100% ephemeral in browser RAM without network fetch');

    // DOM safety invariants
    assert.doesNotMatch(source, /\b(innerHTML|outerHTML|insertAdjacentHTML)\b/, 'Must use safe DOM construction via h()');
    assert.doesNotMatch(source, /\bstyle\s*=/, 'Must not use inline style attributes');

    // Privacy overclaim regex audit
    const BANNED_PATTERNS = [
      /saved to disk/i,
      /erases? everything/i,
      /zero[- ]knowledge/i,
      /does not record search terms/i,
      /never stored/i,
      /nothing is logged/i,
      /100% private/i,
      /\bse borra todo\b/i,
      /nunca se guarda/i,
      /se guardan? en el disco/i,
      /nada se registra/i,
      /100 % privad/i,
    ];

    for (const pat of BANNED_PATTERNS) {
      assert.doesNotMatch(source, pat, `Source must not contain banned privacy overclaim: ${pat}`);
    }
  });
});

