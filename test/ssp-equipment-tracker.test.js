/**
 * Unit & Integration Tests: Syringe Services Program (SSP) & Equipment Tracker (test/ssp-equipment-tracker.test.js)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  SSP_EQUIPMENT_SPECIFICATIONS,
  calculateSspEquipmentNeeds,
  getSspTrackerState,
  setSspTrackerState,
  resetSspTrackerState,
  formatSspEquipmentSummaryText,
  sspEquipmentTrackerComponent,
} from '../public/js/components/sspEquipmentTracker.js';

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

describe('Syringe Services Program (SSP) & Equipment Tracker Component (public/js/components/sspEquipmentTracker.js)', () => {
  beforeEach(() => {
    resetSspTrackerState();
  });

  test('Module Exports & Equipment Scientific Standards Integrity', () => {
    assert.ok(Array.isArray(SSP_EQUIPMENT_SPECIFICATIONS), 'SSP_EQUIPMENT_SPECIFICATIONS must be an array');
    assert.equal(SSP_EQUIPMENT_SPECIFICATIONS.length, 5);

    const syringe = SSP_EQUIPMENT_SPECIFICATIONS.find((s) => s.category === 'syringes');
    assert.ok(syringe);
    assert.match(syringe.title.en, /Low Dead-Space/);

    const acid = SSP_EQUIPMENT_SPECIFICATIONS.find((s) => s.category === 'ascorbic_acid');
    assert.ok(acid);
    assert.match(acid.title.en, /NEVER Lemon Juice or Vinegar/);

    const alcohol = SSP_EQUIPMENT_SPECIFICATIONS.find((s) => s.category === 'alcohol_pads');
    assert.ok(alcohol);
    assert.match(alcohol.title.en, /BEFORE Puncture ONLY/);
  });

  test('calculateSspEquipmentNeeds: Correctly computes injection supplies buffer and ascorbic acid for black tar', () => {
    const plan = calculateSspEquipmentNeeds({
      routeOfUse: 'injection',
      dailyUseFrequency: 4,
      suppliesDurationDays: 7,
      substanceType: 'tar_or_crack',
    });

    assert.equal(plan.totalEvents, 28);
    assert.equal(plan.recommendedSyringes, Math.ceil(28 * 1.35));
    assert.ok(plan.sterileWaterVials > 28);
    assert.ok(plan.supplyList.some((s) => s.item.en.includes('Ascorbic Acid')));
    assert.ok(plan.supplyList.some((s) => s.item.en.includes('Sharps Container')));
    assert.ok(plan.supplyList.some((s) => s.item.en.includes('Naloxone Rescue Kits')));
  });

  test('calculateSspEquipmentNeeds: Configures safer smoking/inhalation kit supplies without acid', () => {
    const plan = calculateSspEquipmentNeeds({
      routeOfUse: 'inhalation_smoking',
      dailyUseFrequency: 5,
      suppliesDurationDays: 14,
      substanceType: 'methamphetamine',
    });

    assert.equal(plan.recommendedSyringes, 0);
    assert.ok(plan.supplyList.some((s) => s.item.en.includes('Pyrex Glass')));
    assert.ok(plan.supplyList.some((s) => s.item.en.includes('Brass Screens')));
    assert.ok(plan.supplyList.some((s) => s.item.en.includes('Lip Balm')));
    assert.ok(!plan.supplyList.some((s) => s.item.en.includes('Ascorbic Acid')));
  });

  test('In-RAM State Management & Deterministic Reset', () => {
    const initial = getSspTrackerState();
    assert.equal(initial.dailyUseFrequency, 3);
    assert.equal(initial.activeTab, 'calculator');

    setSspTrackerState({
      dailyUseFrequency: 6,
      suppliesDurationDays: 14,
      activeTab: 'vein_safety',
    });

    const modified = getSspTrackerState();
    assert.equal(modified.dailyUseFrequency, 6);
    assert.equal(modified.suppliesDurationDays, 14);
    assert.equal(modified.activeTab, 'vein_safety');

    resetSspTrackerState();
    const afterReset = getSspTrackerState();
    assert.equal(afterReset.dailyUseFrequency, 3);
    assert.equal(afterReset.suppliesDurationDays, 7);
    assert.equal(afterReset.activeTab, 'calculator');
  });

  test('formatSspEquipmentSummaryText: Generates comprehensive bilingual plain-text summaries', () => {
    const plan = calculateSspEquipmentNeeds({
      routeOfUse: 'multiple',
      dailyUseFrequency: 4,
      suppliesDurationDays: 7,
      substanceType: 'tar_or_crack',
    });

    const enText = formatSspEquipmentSummaryText(plan, 'en');
    assert.match(enText, /HARM REDUCTION EQUIPMENT & SYRINGE PROGRAM PLAN/);
    assert.match(enText, /RECOMMENDED SUPPLIES TO REQUEST/);
    assert.match(enText, /CRITICAL CLINICAL DIRECTIVE ON ALCOHOL SWABS/);
    assert.match(enText, /Never Use Alone: 1-800-484-3731/);

    const esText = formatSspEquipmentSummaryText(plan, 'es');
    assert.match(esText, /CALCULADORA DE INSUMOS DE REDUCCIÓN DE DAÑOS Y PROGRAMAS SSP/);
    assert.match(esText, /LISTA DE INSUMOS RECOMENDADOS PARA RETIRAR/);
    assert.match(esText, /REGLA CLÍNICA DE ORO PARA TOALLITAS DE ALCOHOL/);
    assert.match(esText, /Never Use Alone: 1-800-484-3731/);
  });

  test('sspEquipmentTrackerComponent: Mounts accessible DOM structure across tabs', () => {
    const container = new MockNode('div');
    const comp = sspEquipmentTrackerComponent(container);
    assert.ok(container.children.length > 0, 'Container should receive elements');

    const tabButtons = container.querySelectorAll('button[role="tab"]');
    assert.equal(tabButtons.length, 4, 'Must render 4 navigation tabs');

    // Switch to equipment_guide tab
    const guideTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'equipment_guide');
    assert.ok(guideTab, 'Should find equipment_guide tab button');
    guideTab.dispatchEvent('click');
    assert.equal(getSspTrackerState().activeTab, 'equipment_guide');

    // Switch to vein_safety tab
    const veinTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'vein_safety');
    assert.ok(veinTab, 'Should find vein_safety tab button');
    veinTab.dispatchEvent('click');
    assert.equal(getSspTrackerState().activeTab, 'vein_safety');

    // Switch to sharps_disposal tab
    const sharpsTab = tabButtons.find((btn) => btn.getAttribute('data-tab') === 'sharps_disposal');
    assert.ok(sharpsTab, 'Should find sharps_disposal tab button');
    sharpsTab.dispatchEvent('click');
    assert.equal(getSspTrackerState().activeTab, 'sharps_disposal');
  });

  test('Static Security & Privacy Compliance Audit', () => {
    const filePath = join(process.cwd(), 'public', 'js', 'components', 'sspEquipmentTracker.js');
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

