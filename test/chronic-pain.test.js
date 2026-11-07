// test/chronic-pain.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CHRONIC_PAIN_STANDARDS,
  BENZODIAZEPINE_STANDARDS,
  BENZODIAZEPINE_EQUIVALENTS,
  calculateDiazepamEquivalent,
  evaluateSedativeDiscontinuationRisk,
  generateAshtonTaperSchedule,
  evaluatePainCarePathway,
  formatPainSummaryText,
  getPainState,
  setPainState,
  resetPainState,
  chronicPainView
} from '../public/js/views/chronicPain.js';

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

test('CHRONIC_PAIN_STANDARDS and BENZODIAZEPINE_STANDARDS export bilingual clinical frameworks', () => {
  assert.ok(CHRONIC_PAIN_STANDARDS.CDC_2022_GUIDELINE.titleEn);
  assert.ok(CHRONIC_PAIN_STANDARDS.CDC_2022_GUIDELINE.titleEs);
  assert.match(CHRONIC_PAIN_STANDARDS.CDC_2022_GUIDELINE.summaryEn, /rapid, forced, or involuntary opioid tapers/i);

  assert.ok(CHRONIC_PAIN_STANDARDS.BUPRENORPHINE_ANALGESIA.titleEn);
  assert.match(CHRONIC_PAIN_STANDARDS.BUPRENORPHINE_ANALGESIA.summaryEn, /analgesic duration of action lasts only 6 to 8 hours/i);
  assert.match(CHRONIC_PAIN_STANDARDS.BUPRENORPHINE_ANALGESIA.summaryEn, /split dosing/i);

  assert.ok(BENZODIAZEPINE_STANDARDS.ASHTON_TAPER_PROTOCOL.titleEn);
  assert.match(BENZODIAZEPINE_STANDARDS.ASHTON_TAPER_PROTOCOL.summaryEn, /grand mal seizures or status epilepticus/i);
  assert.match(BENZODIAZEPINE_STANDARDS.ASHTON_TAPER_PROTOCOL.recommendationsEn[3], /Flumazenil is strictly contraindicated/i);
});

test('calculateDiazepamEquivalent accurately converts standard oral benzodiazepines', () => {
  // 1 mg alprazolam = 20 mg diazepam
  assert.equal(calculateDiazepamEquivalent('alprazolam', 1), 20);
  assert.equal(calculateDiazepamEquivalent('alprazolam', 0.5), 10);

  // 1 mg clonazepam = 20 mg diazepam
  assert.equal(calculateDiazepamEquivalent('clonazepam', 2), 40);

  // 1 mg lorazepam = 10 mg diazepam
  assert.equal(calculateDiazepamEquivalent('lorazepam', 2), 20);

  // 30 mg temazepam = 15 mg diazepam
  assert.equal(calculateDiazepamEquivalent('temazepam', 30), 15);

  // 25 mg chlordiazepoxide = 10 mg diazepam
  assert.equal(calculateDiazepamEquivalent('chlordiazepoxide', 25), 10);

  // 10 mg diazepam = 10 mg diazepam
  assert.equal(calculateDiazepamEquivalent('diazepam', 10), 10);

  // Edge cases: null, undefined, invalid, zero, negative
  assert.equal(calculateDiazepamEquivalent('unknown_drug', 10), 0);
  assert.equal(calculateDiazepamEquivalent('alprazolam', 0), 0);
  assert.equal(calculateDiazepamEquivalent('alprazolam', -5), 0);
  assert.equal(calculateDiazepamEquivalent(null, 10), 0);
});

test('evaluateSedativeDiscontinuationRisk escalates acute abrupt cessation to emergency 911', () => {
  // Abrupt cessation of high dose (2 mg alprazolam = 40 mg diazepam eq) for 12 weeks
  const emergency = evaluateSedativeDiscontinuationRisk({
    currentDrug: 'alprazolam',
    dailyDoseMg: 2,
    durationWeeks: 12,
    isAbrupt: true
  });

  assert.equal(emergency.severity, 'emergency_911');
  assert.equal(emergency.requiresHospital, true);
  assert.match(emergency.titleEn, /Status Epilepticus & Fatal Seizures/i);
  assert.match(emergency.textEn, /EMTALA/);
});

test('evaluateSedativeDiscontinuationRisk identifies supervised medical detox and outpatient taper candidates', () => {
  // Long term moderate dose not abrupt -> Supervised medical taper
  const supervised = evaluateSedativeDiscontinuationRisk({
    currentDrug: 'lorazepam',
    dailyDoseMg: 3, // 30 mg diazepam eq
    durationWeeks: 16,
    isAbrupt: false
  });
  assert.equal(supervised.severity, 'high_clinical_monitoring');
  assert.equal(supervised.protocol, 'supervised_ashton_taper');

  // Moderate dose outpatient taper
  const outpatient = evaluateSedativeDiscontinuationRisk({
    currentDrug: 'temazepam',
    dailyDoseMg: 30, // 15 mg diazepam eq
    durationWeeks: 6,
    isAbrupt: false
  });
  assert.equal(outpatient.severity, 'moderate_gradual_taper');
  assert.equal(outpatient.protocol, 'outpatient_gradual_taper');

  // Short term low dose
  const mild = evaluateSedativeDiscontinuationRisk({
    currentDrug: 'lorazepam',
    dailyDoseMg: 0.5,
    durationWeeks: 2,
    isAbrupt: false
  });
  assert.equal(mild.severity, 'low_risk_mild_taper');
  assert.equal(mild.protocol, 'brief_taper');
});

test('generateAshtonTaperSchedule calculates stepwise decrement milestones ending at 0', () => {
  const schedule = generateAshtonTaperSchedule({ diazepamEquivalentMg: 20, targetWeeks: 16 });
  assert.ok(Array.isArray(schedule));
  assert.ok(schedule.length >= 4);

  // First stage should be baseline
  assert.equal(schedule[0].dailyDoseMg, 20);
  assert.equal(schedule[0].percentOfOriginal, 100);

  // Final stage should reach 0 mg
  const last = schedule[schedule.length - 1];
  assert.equal(last.dailyDoseMg, 0);
  assert.match(last.clinicalMilestone, /Completion of taper/i);

  // Monotonically non-increasing
  for (let i = 1; i < schedule.length; i++) {
    assert.ok(schedule[i].dailyDoseMg <= schedule[i - 1].dailyDoseMg);
  }

  // Handles 0 or invalid input
  assert.deepEqual(generateAshtonTaperSchedule({ diazepamEquivalentMg: 0 }), []);
  assert.deepEqual(generateAshtonTaperSchedule({ diazepamEquivalentMg: -10 }), []);
});

test('evaluatePainCarePathway detects FDA Black Box co-sedation, high MME, and concurrent SUD', () => {
  // Scenario 1: Opioid + Benzodiazepine co-prescribing
  const coSedation = evaluatePainCarePathway({
    hasPain: true,
    currentOpioid: 'Oxycodone',
    dailyMME: 40,
    hasConcurrentSUD: false,
    hasBenzodiazepine: true
  });
  const blackBox = coSedation.findings.find((f) => f.type === 'fda_black_box_warning');
  assert.ok(blackBox);
  assert.match(blackBox.textEn, /additive respiratory depression/i);
  assert.ok(coSedation.actionItems.some((item) => item.includes('naloxone')));

  // Scenario 2: High MME (>=90 MME)
  const highMME = evaluatePainCarePathway({
    hasPain: true,
    currentOpioid: 'Morphine',
    dailyMME: 120,
    hasConcurrentSUD: false,
    hasBenzodiazepine: false
  });
  const mmeFinding = highMME.findings.find((f) => f.type === 'high_mme_taper_protection');
  assert.ok(mmeFinding);
  assert.match(mmeFinding.titleEn, /Anti-Abrupt Taper Protection/i);

  // Scenario 3: Pain + Concurrent OUD -> Buprenorphine split dosing
  const painOUD = evaluatePainCarePathway({
    hasPain: true,
    currentOpioid: 'Illicit Fentanyl',
    dailyMME: 0,
    hasConcurrentSUD: true,
    hasBenzodiazepine: false
  });
  const bupeBenefit = painOUD.findings.find((f) => f.type === 'buprenorphine_dual_benefit');
  assert.ok(bupeBenefit);
  assert.match(bupeBenefit.textEn, /split the daily dose/i);
  assert.match(bupeBenefit.textEn, /Bernese/i);
});

test('formatPainSummaryText formats complete bilingual plain-text summaries', () => {
  const mockState = {
    currentSedative: 'alprazolam',
    sedativeDoseMg: '1',
    sedativeDurationWeeks: '16',
    sedativeIsAbrupt: false,
    hasPain: true,
    painType: 'neuropathic',
    currentOpioid: 'Buprenorphine',
    dailyMME: '30',
    hasConcurrentSUD: true
  };

  const enSummary = formatPainSummaryText(mockState, 'en');
  assert.match(enSummary, /HARBORPATH: CHRONIC PAIN & SEDATIVE DEPRESCRIBING CONSULTATION/);
  assert.match(enSummary, /Current drug: alprazolam/);
  assert.match(enSummary, /Diazepam equivalent: ~20 mg\/day/);
  assert.match(enSummary, /Buprenorphine: The Gold Standard/);
  assert.match(enSummary, /Disclaimer: This tool is educational/);

  const esSummary = formatPainSummaryText(mockState, 'es');
  assert.match(esSummary, /HARBORPATH: CONSULTA DE DOLOR CRÓNICO Y REDUCCIÓN DE SEDANTES/);
  assert.match(esSummary, /Fármaco actual: alprazolam/);
  assert.match(esSummary, /Equivalente diazepam: ~20 mg\/day/);
  assert.match(esSummary, /Buprenorfina: Estándar de Oro/);
  assert.match(esSummary, /Aviso legal: Esta guía es educativa/);
});

test('In-RAM state management provides deterministic reset and isolation', () => {
  resetPainState();
  const initial = getPainState();
  assert.equal(initial.currentSedative, '');
  assert.equal(initial.activeTab, 'pain');

  setPainState({ currentSedative: 'clonazepam', sedativeDoseMg: '2', activeTab: 'sedative' });
  const updated = getPainState();
  assert.equal(updated.currentSedative, 'clonazepam');
  assert.equal(updated.sedativeDoseMg, '2');
  assert.equal(updated.activeTab, 'sedative');

  resetPainState();
  const cleared = getPainState();
  assert.equal(cleared.currentSedative, '');
  assert.equal(cleared.sedativeDoseMg, '');
  assert.equal(cleared.activeTab, 'pain');
});

test('chronicPainView creates accessible DOM elements with zero security violations', () => {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
  };

  try {
    resetPainState();
    const view = chronicPainView();
    assert.ok(view);
    assert.equal(view.className, 'view chronic-pain-view');

    // Verify tab navigation
    const tabList = view.querySelector('.tab-nav');
    assert.ok(tabList);
    assert.equal(tabList.getAttribute('role'), 'tablist');

    // Verify tabs
    const tabs = view.querySelectorAll('[role=tab]');
    assert.equal(tabs.length, 3);

    // Verify panels
    const panels = view.querySelectorAll('[role=tabpanel]');
    assert.equal(panels.length, 3);
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
  }
});

test('Static security and privacy audit of chronicPain.js', () => {
  const content = readFileSync(new URL('../public/js/views/chronicPain.js', import.meta.url), 'utf8');

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
