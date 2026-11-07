// test/alcohol-care.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PAWSS_ITEMS,
  MAUD_STANDARDS,
  WERNICKE_PREVENTION,
  calculatePawssScore,
  evaluatePawssRisk,
  evaluateMaudCompatibility,
  formatAlcoholSummaryText,
  getAlcoholState,
  setAlcoholState,
  resetAlcoholState,
  alcoholCareView
} from '../public/js/views/alcoholCare.js';

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

test('PAWSS_ITEMS exports exactly 10 validated clinical risk factors across Parts A, B, and C', () => {
  assert.equal(PAWSS_ITEMS.length, 10);
  const parts = new Set(PAWSS_ITEMS.map((item) => item.part));
  assert.ok(parts.has('A'));
  assert.ok(parts.has('B'));
  assert.ok(parts.has('C'));

  for (const item of PAWSS_ITEMS) {
    assert.ok(item.id);
    assert.ok(item.textEn);
    assert.ok(item.textEs);
    assert.equal(item.points, 1);
  }
});

test('MAUD_STANDARDS and WERNICKE_PREVENTION export evidence-based pharmacotherapies and protocols', () => {
  assert.ok(MAUD_STANDARDS.NALTREXONE);
  assert.match(MAUD_STANDARDS.NALTREXONE.mechanismEn, /mu-opioid/i);
  assert.match(MAUD_STANDARDS.NALTREXONE.tsmProtocolEn, /Sinclair Method/i);

  assert.ok(MAUD_STANDARDS.ACAMPROSATE);
  assert.match(MAUD_STANDARDS.ACAMPROSATE.mechanismEn, /NMDA glutamate/i);
  assert.match(MAUD_STANDARDS.ACAMPROSATE.advantagesEn[0], /100% excreted unchanged by kidneys/i);

  assert.ok(MAUD_STANDARDS.DISULFIRAM);
  assert.match(MAUD_STANDARDS.DISULFIRAM.mechanismEn, /acetaldehyde/i);

  assert.ok(WERNICKE_PREVENTION.emergencyDirectivesEn);
  assert.match(WERNICKE_PREVENTION.emergencyDirectivesEn[0], /thiamine.*BEFORE.*glucose/i);
});

test('calculatePawssScore counts valid selected risk criteria accurately', () => {
  assert.equal(calculatePawssScore([]), 0);
  assert.equal(calculatePawssScore(['p1_alcohol_recent', 'p2_prior_withdrawal', 'p3_prior_seizure']), 3);
  assert.equal(calculatePawssScore(['p1_alcohol_recent', 'p2_prior_withdrawal', 'p3_prior_seizure', 'p4_prior_dt']), 4);
  assert.equal(calculatePawssScore(['invalid_id', 'unknown']), 0);
  assert.equal(calculatePawssScore(null), 0);
});

test('evaluatePawssRisk stratifies high risk (>=4) for Delirium Tremens under EMTALA', () => {
  // Score 4 -> High risk of DTs, hospital ED / inpatient detox required
  const highRisk = evaluatePawssRisk(4);
  assert.equal(highRisk.isHighRisk, true);
  assert.equal(highRisk.severity, 'high_complicated_withdrawal');
  assert.equal(highRisk.disposition, 'inpatient_medical_detox');
  assert.match(highRisk.textEn, /EMTALA/);
  assert.match(highRisk.titleEn, /High Risk for Complicated Withdrawal/);

  // Score 2 -> Lower acute risk
  const lowRisk = evaluatePawssRisk(2);
  assert.equal(lowRisk.isHighRisk, false);
  assert.equal(lowRisk.severity, 'low_to_moderate_risk');
  assert.equal(lowRisk.disposition, 'outpatient_with_monitoring');
});

test('evaluateMaudCompatibility detects absolute contraindications and organ clearance advantages', () => {
  // Scenario 1: Active opioid use -> Naltrexone is strictly contraindicated
  const opioidUser = evaluateMaudCompatibility({ opioidUse: true });
  const naltrexoneContra = opioidUser.contraindications.find((c) => c.drug === 'naltrexone');
  assert.ok(naltrexoneContra);
  assert.match(naltrexoneContra.titleEn, /ABSOLUTE CONTRAINDICATION/);
  assert.match(naltrexoneContra.textEn, /precipitates?.*withdrawal/i);

  // Scenario 2: Liver disease -> Acamprosate preferred (100% renal), Disulfiram cautioned
  const liverPatient = evaluateMaudCompatibility({ liverDisease: true });
  const acamprosateRec = liverPatient.recommendations.find((r) => r.drug === 'acamprosate');
  assert.ok(acamprosateRec);
  assert.equal(acamprosateRec.preferred, true);
  assert.match(acamprosateRec.textEn, /hepatic metabolism/i);

  const disulfiramContra = liverPatient.contraindications.find((c) => c.drug === 'disulfiram');
  assert.ok(disulfiramContra);

  // Scenario 3: Renal disease -> Acamprosate cautioned/contraindicated
  const renalPatient = evaluateMaudCompatibility({ kidneyDisease: true });
  const acamprosateKidneyContra = renalPatient.contraindications.find((c) => c.drug === 'acamprosate');
  assert.ok(acamprosateKidneyContra);
  assert.match(acamprosateKidneyContra.textEn, /accumulates in renal failure/i);

  // Scenario 4: Harm reduction / moderation goal -> Sinclair Method (TSM) naltrexone
  const harmReduction = evaluateMaudCompatibility({ treatmentGoal: 'harm_reduction' });
  const tsmRec = harmReduction.recommendations.find((r) => r.drug === 'tsm_naltrexone');
  assert.ok(tsmRec);
  assert.match(tsmRec.titleEn, /The Sinclair Method/i);
});

test('formatAlcoholSummaryText formats comprehensive bilingual summaries', () => {
  const mockState = {
    pawssItems: ['p1_alcohol_recent', 'p2_prior_withdrawal', 'p3_prior_seizure', 'p4_prior_dt'],
    hasLiverDisease: true,
    hasKidneyDisease: false,
    hasOpioidUse: false,
    treatmentGoal: 'abstinence'
  };

  const enSummary = formatAlcoholSummaryText(mockState, 'en');
  assert.match(enSummary, /HARBORPATH: ALCOHOL CARE & PHARMACOTHERAPY CONSULTATION/);
  assert.match(enSummary, /PAWSS Score: 4 \/ 10/);
  assert.match(enSummary, /WERNICKE-KORSAKOFF SYNDROME PREVENTION/);
  assert.match(enSummary, /Preferred First-Line: Acamprosate in Liver Disease/);
  assert.match(enSummary, /Disclaimer: This tool is educational/);

  const esSummary = formatAlcoholSummaryText(mockState, 'es');
  assert.match(esSummary, /HARBORPATH: CONSULTA DE ATENCIÓN DE ALCOHOL Y FARMACOTERAPIA/);
  assert.match(esSummary, /Puntuación PAWSS: 4 \/ 10/);
  assert.match(esSummary, /PREVENCIÓN DE SÍNDROME DE WERNICKE-KORSAKOFF/);
  assert.match(esSummary, /Primera Línea Preferida: Acamprosato en Enfermedad Hepática/);
  assert.match(esSummary, /Aviso: Esta herramienta es educativa/);
});

test('In-RAM state management provides deterministic reset and isolation', () => {
  resetAlcoholState();
  const initial = getAlcoholState();
  assert.deepEqual(initial.pawssItems, []);
  assert.equal(initial.treatmentGoal, 'abstinence');
  assert.equal(initial.activeTab, 'pawss');

  setAlcoholState({ pawssItems: ['p1_alcohol_recent', 'p7_autonomic_hyper'], hasLiverDisease: true, activeTab: 'maud' });
  const updated = getAlcoholState();
  assert.deepEqual(updated.pawssItems, ['p1_alcohol_recent', 'p7_autonomic_hyper']);
  assert.equal(updated.hasLiverDisease, true);
  assert.equal(updated.activeTab, 'maud');

  resetAlcoholState();
  const cleared = getAlcoholState();
  assert.deepEqual(cleared.pawssItems, []);
  assert.equal(cleared.hasLiverDisease, false);
  assert.equal(cleared.activeTab, 'pawss');
});

test('alcoholCareView renders accessible WCAG 2.2 AA compliant UI', () => {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
  };

  try {
    resetAlcoholState();
    const view = alcoholCareView();
    assert.ok(view);
    assert.equal(view.className, 'view alcohol-care-view');

    // Tab navigation
    const tabList = view.querySelector('.tab-nav');
    assert.ok(tabList);
    assert.equal(tabList.getAttribute('role'), 'tablist');

    // 3 tabs and 3 panels
    const tabs = view.querySelectorAll('[role=tab]');
    assert.equal(tabs.length, 3);
    const panels = view.querySelectorAll('[role=tabpanel]');
    assert.equal(panels.length, 3);

    // PAWSS Checkboxes
    const checkboxes = view.querySelectorAll('input[type="checkbox"]');
    assert.ok(checkboxes.length >= 10);
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
  }
});

test('Static security and privacy audit of alcoholCare.js', () => {
  const content = readFileSync(new URL('../public/js/views/alcoholCare.js', import.meta.url), 'utf8');

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
