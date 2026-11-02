/**
 * Unit & Integration Tests: Recovery Capital Index (BARC-10) Component (test/recovery-capital.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  SAMHSA_RECOVERY_DIMENSIONS,
  BARC10_ITEMS,
  RECOVERY_CAPITAL_TIERS,
  calculateRecoveryCapitalScore,
  generateRecoveryCapitalPlan,
  getRecoveryCapitalState,
  setRecoveryCapitalState,
  resetRecoveryCapitalState,
  formatRecoveryCapitalSummaryText,
  recoveryCapitalComponent,
} from '../public/js/components/recoveryCapital.js';

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

describe('Recovery Capital Index (BARC-10) Component (public/js/components/recoveryCapital.js)', () => {
  beforeEach(() => {
    resetRecoveryCapitalState();
  });

  test('Module Exports & BARC-10 Psychometric Taxonomy', () => {
    assert.ok(BARC10_ITEMS && Array.isArray(BARC10_ITEMS));
    assert.strictEqual(BARC10_ITEMS.length, 10, 'BARC-10 contains exactly 10 validated items');

    BARC10_ITEMS.forEach((it) => {
      assert.ok(it.id && typeof it.id === 'string');
      assert.ok(it.prompt.en && it.prompt.es, 'Bilingual prompts');
      assert.ok(SAMHSA_RECOVERY_DIMENSIONS[it.dimension], `Dimension ${it.dimension} exists in SAMHSA dimensions`);
      assert.ok(it.strengthTip.en && it.strengthTip.es);
      assert.ok(it.growthAdvice.en && it.growthAdvice.es);
    });

    assert.ok(RECOVERY_CAPITAL_TIERS.high_capital.minScore === 47, 'Validated 47+ cutoff for high stability');
  });

  test('calculateRecoveryCapitalScore: High capital score (>=47) achieves validated stability tier', () => {
    const perfectResponses = {};
    BARC10_ITEMS.forEach((it) => {
      perfectResponses[it.id] = 5; // 5 * 10 = 50 >= 47
    });

    const res = calculateRecoveryCapitalScore(perfectResponses);
    assert.strictEqual(res.totalScore, 50);
    assert.strictEqual(res.tierKey, 'high_capital');
    assert.strictEqual(res.strengths.length, 10);
    assert.strictEqual(res.growthAreas.length, 0);
  });

  test('calculateRecoveryCapitalScore: Low capital score (<35) identifies growth areas & generates plan', () => {
    const lowResponses = {};
    BARC10_ITEMS.forEach((it) => {
      lowResponses[it.id] = 2; // 2 * 10 = 20 < 35
    });

    const res = calculateRecoveryCapitalScore(lowResponses);
    assert.strictEqual(res.totalScore, 20);
    assert.strictEqual(res.tierKey, 'growth_needed');
    assert.strictEqual(res.growthAreas.length, 10);

    const plan = generateRecoveryCapitalPlan(res, 'en');
    assert.ok(plan.actionSteps.length >= 3, 'Generates action steps for low-scoring dimensions');
    assert.ok(plan.actionSteps.some((s) => s.dimension === 'health'));
    assert.ok(plan.actionSteps.some((s) => s.dimension === 'home'));
    assert.ok(plan.actionSteps.some((s) => s.dimension === 'community'));
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const init = getRecoveryCapitalState();
    assert.strictEqual(init.responses.values_clarity, 4);

    setRecoveryCapitalState({ responses: { values_clarity: 6 }, activeTab: 'action_plan' });
    const updated = getRecoveryCapitalState();
    assert.strictEqual(updated.responses.values_clarity, 6);
    assert.strictEqual(updated.activeTab, 'action_plan');

    resetRecoveryCapitalState();
    const after = getRecoveryCapitalState();
    assert.strictEqual(after.responses.values_clarity, 4);
    assert.strictEqual(after.activeTab, 'assessment');
  });

  test('formatRecoveryCapitalSummaryText: Generates bilingual reports', () => {
    const scoreRes = calculateRecoveryCapitalScore({
      values_clarity: 6,
      life_satisfaction: 5,
      safe_living_space: 2,
    });
    const plan = generateRecoveryCapitalPlan(scoreRes, 'en');

    const enText = formatRecoveryCapitalSummaryText(plan, 'en');
    assert.ok(enText.includes('RECOVERY CAPITAL INDEX'));
    assert.ok(enText.includes('SAMHSA RECOVERY DIMENSIONS'));
    assert.ok(enText.includes('TOP RECOVERY ASSETS'));

    const esText = formatRecoveryCapitalSummaryText(plan, 'es');
    assert.ok(esText.includes('ÍNDICE DE CAPITAL DE RECUPERACIÓN'));
    assert.ok(esText.includes('PUNTUACIONES POR DIMENSIÓN SAMHSA'));
  });

  test('recoveryCapitalComponent: Mounts accessible DOM structure across tabs', () => {
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };

    const container = new MockNode('DIV');
    container.id = 'app';

    // 1. Initial render (assessment tab)
    const root = recoveryCapitalComponent(container);
    assert.ok(root instanceof MockNode);
    assert.ok(container.querySelector('.recovery-capital-container'));
    assert.ok(container.querySelector('.barc-card'));
    assert.strictEqual(container.querySelectorAll('.barc-item-row').length, 10);

    // 2. Dimensions tab
    setRecoveryCapitalState({ activeTab: 'dimensions' });
    recoveryCapitalComponent(container);
    assert.ok(container.querySelector('.dimensions-card'));
    assert.strictEqual(container.querySelectorAll('.dimension-box').length, 4);

    // 3. Action plan tab
    setRecoveryCapitalState({ activeTab: 'action_plan' });
    recoveryCapitalComponent(container);
    assert.ok(container.querySelector('.plan-card'));
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'components', 'recoveryCapital.js');
    const source = readFileSync(filePath, 'utf8');

    // 1. Zero localStorage or sessionStorage
    assert.ok(!/\blocalStorage\b/.test(source), 'recoveryCapital.js must NOT contain localStorage');
    assert.ok(!/\bsessionStorage\b/.test(source), 'recoveryCapital.js must NOT contain sessionStorage');
    assert.ok(!/\bdocument\.cookie\b/.test(source), 'recoveryCapital.js must NOT contain document.cookie');

    // 2. Zero innerHTML, outerHTML, or inline style=
    assert.ok(!/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(source), 'recoveryCapital.js must NOT contain innerHTML/outerHTML');
    assert.ok(!/\bstyle\s*=/.test(source), 'recoveryCapital.js must NOT contain inline style= attributes');

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
      assert.ok(!pattern.test(source), `recoveryCapital.js must NOT contain banned phrase matching ${pattern}`);
    });
  });
});

