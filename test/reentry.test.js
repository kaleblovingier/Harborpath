/**
 * Unit & Integration Tests: Incarceration Reentry & Criminal Legal Health (test/reentry.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  REENTRY_MEDICAID_WAIVERS,
  REENTRY_POST_RELEASE_TIMELINE,
  REENTRY_SUPERVISION_PROTECTIONS,
  getReentryWaiver,
  evaluateReentryPlan,
  getReentryState,
  setReentryState,
  resetReentryState,
  formatReentrySummaryText,
  reentryView,
} from '../public/js/views/reentry.js';

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

describe('Incarceration Reentry & Criminal Legal Health Module (public/js/views/reentry.js)', () => {
  beforeEach(() => {
    resetReentryState();
  });

  test('Module Exports & Statutory Framework Integrity', () => {
    assert.ok(Array.isArray(REENTRY_MEDICAID_WAIVERS), 'REENTRY_MEDICAID_WAIVERS is an array');
    assert.ok(REENTRY_MEDICAID_WAIVERS.length >= 8, 'At least 8 states with 1115 reentry waivers documented');

    // Verify statutory schema of each waiver entry
    REENTRY_MEDICAID_WAIVERS.forEach((w) => {
      assert.ok(w.state && w.state.length === 2, `State code valid for ${w.state}`);
      assert.ok(w.name.en && w.name.es, `Bilingual name present for ${w.state}`);
      assert.ok(w.coverageWindowDays >= 30, `Coverage window at least 30 days for approved state ${w.state}`);
      assert.ok(Array.isArray(w.keyServices.en) && w.keyServices.en.length > 0, `English services present for ${w.state}`);
      assert.ok(Array.isArray(w.keyServices.es) && w.keyServices.es.length > 0, `Spanish services present for ${w.state}`);
      assert.ok(w.suspensionPolicy.en && w.suspensionPolicy.es, `Bilingual suspension policy present for ${w.state}`);
    });

    // Verify timeline stages
    assert.ok(Array.isArray(REENTRY_POST_RELEASE_TIMELINE), 'REENTRY_POST_RELEASE_TIMELINE is an array');
    assert.strictEqual(REENTRY_POST_RELEASE_TIMELINE.length, 4, '4 chronological stages documented');
    assert.ok(REENTRY_POST_RELEASE_TIMELINE.some((s) => s.stageId === 'immediate_gate'));
    assert.ok(REENTRY_POST_RELEASE_TIMELINE.some((s) => s.stageId === 'acute_window'));

    // Verify supervision protections
    assert.ok(Array.isArray(REENTRY_SUPERVISION_PROTECTIONS), 'REENTRY_SUPERVISION_PROTECTIONS is an array');
    assert.ok(REENTRY_SUPERVISION_PROTECTIONS.some((p) => p.topicId === 'ada_moud_protection'));
    assert.ok(REENTRY_SUPERVISION_PROTECTIONS.some((p) => p.topicId === 'confidentiality_42cfr'));
  });

  test('getReentryWaiver: Resolves approved waivers and graceful standard fallback', () => {
    const ca = getReentryWaiver('CA');
    assert.strictEqual(ca.status, 'approved');
    assert.strictEqual(ca.coverageWindowDays, 90);

    const wa = getReentryWaiver('wa'); // case insensitive
    assert.strictEqual(wa.status, 'approved');
    assert.strictEqual(wa.coverageWindowDays, 90);

    const tx = getReentryWaiver('TX');
    assert.strictEqual(tx.status, 'standard_rules');
    assert.strictEqual(tx.coverageWindowDays, 0);
    assert.ok(tx.name.en.includes('Texas') || tx.name.en.includes('TX'));

    const empty = getReentryWaiver(null);
    assert.strictEqual(empty, null);
  });

  test('evaluateReentryPlan: Evaluates peak overdose risk for recent release (<14 days)', () => {
    const plan = evaluateReentryPlan({
      stateCode: 'CA',
      releaseWindow: 'released_within_14_days',
      currentMoud: 'none_interested',
      housingStatus: 'unhoused_shelter',
      supervisionStatus: 'probation',
      hasMedicaid: 'suspended',
    });

    assert.strictEqual(plan.riskTier, 'critical');
    assert.strictEqual(plan.isWaiverActive, true);
    assert.strictEqual(plan.waiver.state, 'CA');

    // Risk factors include tolerance drop
    assert.ok(plan.riskFactors.some((rf) => rf.en.includes('129x') || rf.en.includes('loss of tolerance')));

    // Checklist includes take-home naloxone, FQHC intake, suspended medicaid reactivation, and supervision ADA letter
    assert.ok(plan.checklist.some((c) => c.category === 'harm_reduction' && c.priority === 'immediate'));
    assert.ok(plan.checklist.some((c) => c.category === 'benefits'));
    assert.ok(plan.checklist.some((c) => c.category === 'legal_supervision'));
  });

  test('evaluateReentryPlan: Handles MOUD bridge for active buprenorphine patient', () => {
    const plan = evaluateReentryPlan({
      stateCode: 'WA',
      releaseWindow: 'within_30_days',
      currentMoud: 'buprenorphine',
      housingStatus: 'stable',
      supervisionStatus: 'none',
      hasMedicaid: 'active',
    });

    assert.ok(plan.checklist.some((c) => c.category === 'health_moud' && c.title.en.includes('30-Day Medication Bridge')));
    // Since supervision is none, no supervision checklist items should be generated
    assert.ok(!plan.checklist.some((c) => c.category === 'legal_supervision'));
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getReentryState();
    assert.strictEqual(initial.stateCode, 'CA');

    setReentryState({ stateCode: 'IL', releaseWindow: 'released_within_14_days' });
    const updated = getReentryState();
    assert.strictEqual(updated.stateCode, 'IL');
    assert.strictEqual(updated.releaseWindow, 'released_within_14_days');

    resetReentryState();
    const afterReset = getReentryState();
    assert.strictEqual(afterReset.stateCode, 'CA');
    assert.strictEqual(afterReset.releaseWindow, 'within_30_days');
  });

  test('formatReentrySummaryText: Bilingual report generation with emergency hotlines', () => {
    const plan = evaluateReentryPlan({
      stateCode: 'MA',
      releaseWindow: 'within_90_days',
      currentMoud: 'methadone',
      housingStatus: 'transitional_reentry',
      supervisionStatus: 'parole',
      hasMedicaid: 'suspended',
    });

    const enText = formatReentrySummaryText(plan, 'en');
    assert.ok(enText.includes('INCARCERATION REENTRY CLINICAL & LEGAL CARE PLAN'));
    assert.ok(enText.includes('Massachusetts'));
    assert.ok(enText.includes('1-800-484-3731'));
    assert.ok(enText.includes('DOJ ADA Title II'));

    const esText = formatReentrySummaryText(plan, 'es');
    assert.ok(esText.includes('GUÍA CLÍNICA Y LEGAL DE REINGRESO PENITENCIARIO'));
    assert.ok(esText.includes('Massachusetts'));
    assert.ok(esText.includes('1-800-484-3731'));
    assert.ok(esText.includes('42 CFR Parte 2'));
  });

  test('reentryView: Renders accessible DOM structure across tabs', () => {
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };

    const container = new MockNode('DIV');
    container.id = 'app';

    // Initial render defaults to assessment tab
    const root = reentryView(container);
    assert.ok(root instanceof MockNode);
    assert.ok(container.querySelector('.reentry-view'));
    assert.ok(container.querySelector('.assessment-card'));
    assert.ok(container.querySelector('#reentry-state-select'));

    // Switch to timeline tab
    setReentryState({ activeTab: 'timeline' });
    reentryView(container);
    assert.ok(container.querySelector('.timeline-card'));
    assert.strictEqual(container.querySelectorAll('.timeline-step').length, 4);

    // Switch to rights tab
    setReentryState({ activeTab: 'rights' });
    reentryView(container);
    assert.ok(container.querySelector('.rights-card'));
    assert.strictEqual(container.querySelectorAll('.protection-section').length, 3);

    // Switch to waivers tab
    setReentryState({ activeTab: 'waivers' });
    reentryView(container);
    assert.ok(container.querySelector('.waiver-card'));
    assert.ok(container.querySelectorAll('.waiver-item-card').length >= 8);
  });

  test('Static Security & Compliance Audit: Zero device storage, zero direct markup injection', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'views', 'reentry.js');
    const source = readFileSync(filePath, 'utf8');

    // 1. Zero localStorage or sessionStorage
    assert.ok(!/\blocalStorage\b/.test(source), 'reentry.js must NOT contain localStorage');
    assert.ok(!/\bsessionStorage\b/.test(source), 'reentry.js must NOT contain sessionStorage');
    assert.ok(!/\bdocument\.cookie\b/.test(source), 'reentry.js must NOT contain document.cookie');

    // 2. Zero innerHTML, outerHTML, or inline style=
    assert.ok(!/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(source), 'reentry.js must NOT contain innerHTML/outerHTML');
    assert.ok(!/\bstyle\s*=/.test(source), 'reentry.js must NOT contain inline style= attributes');

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
      assert.ok(!pattern.test(source), `reentry.js must NOT contain banned phrase matching ${pattern}`);
    });
  });
});
