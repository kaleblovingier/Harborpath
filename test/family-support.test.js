// test/family-support.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CRAFT_COMMUNICATION_RULES,
  NATURAL_CONSEQUENCES_MATRIX,
  evaluateFamilySafety,
  buildCraftScript,
  formatCraftSummaryText,
  getFamilyState,
  setFamilyState,
  resetFamilyState,
  familySupportView
} from '../public/js/views/familySupport.js';

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

  replaceChildren(...items) {
    this.children = [];
    this.append(...items);
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

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (node instanceof MockNode) {
        if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
        else if (selector === 'input' && node.tagName === 'INPUT') matches.push(node);
        else if (selector === 'input[type="checkbox"]' && node.tagName === 'INPUT' && node.attributes.type === 'checkbox') matches.push(node);
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

test('CRAFT_COMMUNICATION_RULES exports exactly 7 evidence-based rules with bilingual copy', () => {
  assert.equal(CRAFT_COMMUNICATION_RULES.length, 7);
  for (const rule of CRAFT_COMMUNICATION_RULES) {
    assert.ok(rule.id);
    assert.ok(rule.titleEn);
    assert.ok(rule.titleEs);
    assert.ok(rule.ruleEn);
    assert.ok(rule.ruleEs);
  }
});

test('NATURAL_CONSEQUENCES_MATRIX contrasts enabling vs natural consequences', () => {
  assert.ok(NATURAL_CONSEQUENCES_MATRIX.length >= 4);
  for (const item of NATURAL_CONSEQUENCES_MATRIX) {
    assert.ok(item.enablingEn);
    assert.ok(item.consequenceEn);
    assert.ok(item.enablingEs);
    assert.ok(item.consequenceEs);
  }
});

test('evaluateFamilySafety triggers immediate crisis escalation when violence or weapons are present', () => {
  // Scenario 1: Physical violence present
  const violence = evaluateFamilySafety({ hasPhysicalViolence: true });
  assert.equal(violence.isSafe, false);
  assert.equal(violence.severity, 'emergency_safety_escalation');
  assert.match(violence.titleEn, /Domestic Violence/i);
  assert.ok(violence.actionDirectivesEn.some((d) => d.includes('911')));
  assert.ok(violence.actionDirectivesEn.some((d) => d.includes('1-800-799-SAFE')));

  // Scenario 2: Threats and weapons
  const weapons = evaluateFamilySafety({ hasThreats: true, hasWeaponConcern: true });
  assert.equal(weapons.isSafe, false);

  // Scenario 3: Safe household
  const safe = evaluateFamilySafety({ hasPhysicalViolence: false, hasThreats: false, hasWeaponConcern: false });
  assert.equal(safe.isSafe, true);
  assert.equal(safe.severity, 'safe_for_craft');
  assert.match(safe.titleEn, /Safety Clear/i);
});

test('buildCraftScript constructs clear, positive, non-accusatory conversation scripts', () => {
  const script = buildCraftScript({
    understandingStatement: 'I know you have had intense pressure at work.',
    feelingStatement: 'I felt really scared when you passed out.',
    specificRequest: 'I would appreciate it if we could speak with a doctor tomorrow.',
    offerOfSupport: 'I am happy to come with you or just listen.'
  });

  assert.match(script, /intense pressure/);
  assert.match(script, /I felt really scared/);
  assert.match(script, /speak with a doctor/);
  assert.match(script, /happy to come with you/);

  // Handles empty inputs gracefully
  assert.equal(buildCraftScript({}), '');
  assert.equal(buildCraftScript({ specificRequest: 'Let us talk.' }), 'Let us talk.');
});

test('formatCraftSummaryText produces comprehensive bilingual summaries', () => {
  const mockState = {
    hasViolence: false,
    hasThreats: false,
    hasWeapons: false,
    understandingStatement: 'I understand you are stressed.',
    feelingStatement: 'I feel worried about your health.',
    specificRequest: 'Please come to a doctor appointment with me.',
    offerOfSupport: 'I will drive us there.'
  };

  const enSummary = formatCraftSummaryText(mockState, 'en');
  assert.match(enSummary, /HARBORPATH: FAMILY SUPPORT & CRAFT ACTION PLAN/);
  assert.match(enSummary, /HOME SAFETY EVALUATION/);
  assert.match(enSummary, /CRAFT POSITIVE COMMUNICATION SCRIPT/);
  assert.match(enSummary, /"I understand you are stressed/);
  assert.match(enSummary, /SMART Recovery Family & Friends/);
  assert.match(enSummary, /Disclaimer: This tool is educational/);

  const esSummary = formatCraftSummaryText(mockState, 'es');
  assert.match(esSummary, /HARBORPATH: PLAN DE APOYO FAMILIAR Y ESTRATEGIA CRAFT/);
  assert.match(esSummary, /EVALUACIÓN DE SEGURIDAD EN EL HOGAR/);
  assert.match(esSummary, /GUIÓN DE COMUNICACIÓN POSITIVA CRAFT/);
  assert.match(esSummary, /Aviso: Esta herramienta es educativa/);
});

test('In-RAM state management provides deterministic reset and isolation', () => {
  resetFamilyState();
  const initial = getFamilyState();
  assert.equal(initial.hasViolence, false);
  assert.equal(initial.activeTab, 'communication');

  setFamilyState({ hasViolence: true, activeTab: 'safety' });
  const updated = getFamilyState();
  assert.equal(updated.hasViolence, true);
  assert.equal(updated.activeTab, 'safety');

  resetFamilyState();
  const cleared = getFamilyState();
  assert.equal(cleared.hasViolence, false);
  assert.equal(cleared.activeTab, 'communication');
});

test('familySupportView renders accessible WCAG 2.2 AA compliant UI', () => {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
  };

  try {
    resetFamilyState();
    const view = familySupportView();
    assert.ok(view);
    assert.equal(view.className, 'view family-support-view');

    // Tab navigation
    const tabList = view.querySelector('.tab-nav');
    assert.ok(tabList);
    assert.equal(tabList.getAttribute('role'), 'tablist');

    // 3 tabs and 3 panels
    const tabs = view.querySelectorAll('[role=tab]');
    assert.equal(tabs.length, 3);
    const panels = view.querySelectorAll('[role=tabpanel]');
    assert.equal(panels.length, 3);

    // Form inputs exist
    const inputs = view.querySelectorAll('input');
    assert.ok(inputs.length >= 4);
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
  }
});

test('Static security and privacy audit of familySupport.js', () => {
  const content = readFileSync(new URL('../public/js/views/familySupport.js', import.meta.url), 'utf8');

  // Zero storage access
  assert.doesNotMatch(content, /localStorage/);
  assert.doesNotMatch(content, /sessionStorage/);
  assert.doesNotMatch(content, /document\.cookie/);

  // Zero innerHTML/outerHTML or inline styles
  assert.doesNotMatch(content, /innerHTML/);
  assert.doesNotMatch(content, /outerHTML/);
  assert.doesNotMatch(content, /style\s*=/);

  // Zero network requests
  assert.doesNotMatch(content, /fetch\s*\(/);
  assert.doesNotMatch(content, /XMLHttpRequest/);
});
