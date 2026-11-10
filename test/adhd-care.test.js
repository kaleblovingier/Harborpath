// test/adhd-care.test.js
// HarborPath - Wave 27 ADHD, Neurodiversity & Stimulant Pharmacotherapy Navigator Tests

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Minimal Mock DOM Node
class MockNode {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.className = '';
    this._textContent = '';
    this.checked = false;
    this.value = '';
    this.rows = 0;
    this.classList = {
      contains: (cls) => this.className.split(/\s+/).includes(cls),
      add: (cls) => {
        const set = new Set(this.className.split(/\s+/).filter(Boolean));
        set.add(cls);
        this.className = Array.from(set).join(' ');
      },
      remove: (cls) => {
        const set = new Set(this.className.split(/\s+/).filter(Boolean));
        set.delete(cls);
        this.className = Array.from(set).join(' ');
      }
    };
  }
  get textContent() {
    let txt = this._textContent || '';
    for (const c of this.children) {
      if (typeof c === 'string') txt += c;
      else if (c && c.textContent) txt += c.textContent;
    }
    return txt;
  }
  set textContent(v) {
    this._textContent = String(v ?? '');
  }
  appendChild(child) {
    if (child) this.children.push(child);
    return child;
  }
  append(...children) {
    for (const c of children) {
      if (c !== null && c !== undefined && c !== false) this.children.push(c);
    }
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'class') this.className = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] || null;
  }
  querySelector(sel) {
    if (!sel) return null;
    if (sel.startsWith('#')) {
      const id = sel.slice(1);
      if (this.attributes.id === id) return this;
      for (const c of this.children) {
        if (c.querySelector) {
          const res = c.querySelector(sel);
          if (res) return res;
        }
      }
    }
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      if (this.classList.contains(cls)) return this;
      for (const c of this.children) {
        if (c.querySelector) {
          const res = c.querySelector(sel);
          if (res) return res;
        }
      }
    }
    if (this.tagName === sel.toUpperCase()) return this;
    for (const c of this.children) {
      if (c.querySelector) {
        const res = c.querySelector(sel);
        if (res) return res;
      }
    }
    return null;
  }
  querySelectorAll(sel) {
    const results = [];
    const check = (node) => {
      if (sel.startsWith('.')) {
        const cls = sel.slice(1);
        if (node.classList && node.classList.contains(cls)) results.push(node);
      } else if (node.tagName === sel.toUpperCase()) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(check);
      }
    };
    check(this);
    return results;
  }
  addEventListener() {}
  removeEventListener() {}
  closest() {
    return null;
  }
}

let adhdModule;

describe('ADHD, Neurodiversity & Co-Occurring Substance Use Module (Wave 27)', () => {
  before(async () => {
    // Setup mock DOM globals
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      createTextNode: (txt) => {
        const n = new MockNode('#text');
        n.textContent = txt;
        return n;
      },
      documentElement: { lang: 'en' }
    };
    globalThis.Node = MockNode;

    adhdModule = await import('../public/js/views/adhdCare.js');
  });

  beforeEach(() => {
    if (adhdModule && adhdModule.resetAdhdState) {
      adhdModule.resetAdhdState();
    }
  });

  test('ADHD_SUD_CONSENSUS exports evidence-based consensus, core facts, and MOUD compatibility', () => {
    const { ADHD_SUD_CONSENSUS } = adhdModule;
    assert.ok(ADHD_SUD_CONSENSUS);
    assert.match(ADHD_SUD_CONSENSUS.mandateEn, /25% to 30%.*REDUCES substance relapse by 30% to 50%/i);
    assert.strictEqual(ADHD_SUD_CONSENSUS.coreFacts.length, 3);

    const moudFact = ADHD_SUD_CONSENSUS.coreFacts.find((f) => f.topicEn.includes('MOUD'));
    assert.ok(moudFact);
    assert.match(moudFact.detailEn, /buprenorphine, methadone, and naltrexone/i);
  });

  test('ASRS_QUESTIONS exports all 6 validated questions with scoring threshold bars', () => {
    const { ASRS_QUESTIONS } = adhdModule;
    assert.strictEqual(ASRS_QUESTIONS.length, 6);

    ASRS_QUESTIONS.forEach((q) => {
      assert.ok(q.id && q.promptEn && q.promptEs);
      assert.strictEqual(typeof q.sigThreshold, 'number');
      assert.strictEqual(q.options.length, 5);
    });

    // Check that Q1-Q3 threshold is 2 (Sometimes) and Q4-Q6 threshold is 3 (Often)
    assert.strictEqual(ASRS_QUESTIONS[0].sigThreshold, 2);
    assert.strictEqual(ASRS_QUESTIONS[1].sigThreshold, 2);
    assert.strictEqual(ASRS_QUESTIONS[2].sigThreshold, 2);
    assert.strictEqual(ASRS_QUESTIONS[3].sigThreshold, 3);
    assert.strictEqual(ASRS_QUESTIONS[4].sigThreshold, 3);
    assert.strictEqual(ASRS_QUESTIONS[5].sigThreshold, 3);
  });

  test('ADHD_MEDICATION_TIERS categorizes non-stimulants, prodrugs, and IR warnings', () => {
    const { ADHD_MEDICATION_TIERS } = adhdModule;
    assert.ok(ADHD_MEDICATION_TIERS.tier1 && ADHD_MEDICATION_TIERS.tier2 && ADHD_MEDICATION_TIERS.tier3);

    const t1Meds = ADHD_MEDICATION_TIERS.tier1.medications.map((m) => m.nameEn);
    assert.ok(t1Meds.some((n) => n.includes('Atomoxetine')));
    assert.ok(t1Meds.some((n) => n.includes('Viloxazine')));
    assert.ok(t1Meds.some((n) => n.includes('Guanfacine')));
    assert.ok(t1Meds.some((n) => n.includes('Bupropion')));

    const t2Meds = ADHD_MEDICATION_TIERS.tier2.medications.map((m) => m.nameEn);
    assert.ok(t2Meds.some((n) => n.includes('Lisdexamfetamine')));
    assert.ok(t2Meds.some((n) => n.includes('Concerta')));
  });

  test('COUNTERFEIT_PILL_STANDARDS details DEA alerts, pressed pill FTS dilution, and naloxone access', () => {
    const { COUNTERFEIT_PILL_STANDARDS } = adhdModule;
    assert.ok(COUNTERFEIT_PILL_STANDARDS.alertEn.includes('7 out of 10'));
    assert.ok(COUNTERFEIT_PILL_STANDARDS.alertEn.includes('Adderall'));
    assert.strictEqual(COUNTERFEIT_PILL_STANDARDS.testingRules.length, 4);

    const dilutionRule = COUNTERFEIT_PILL_STANDARDS.testingRules.find((r) => r.stepEn.includes('Dilution'));
    assert.ok(dilutionRule);
    assert.match(dilutionRule.descEn, /1 teaspoon \(5 mL\)/);
  });

  test('EXECUTIVE_FUNCTION_TOOLKIT provides actionable neurodivergent recovery strategies', () => {
    const { EXECUTIVE_FUNCTION_TOOLKIT } = adhdModule;
    assert.strictEqual(EXECUTIVE_FUNCTION_TOOLKIT.length, 4);
    const ids = EXECUTIVE_FUNCTION_TOOLKIT.map((t) => t.strategyId);
    assert.deepStrictEqual(ids, ['time_blindness', 'body_doubling', 'task_chunking', 'sensory_decompression']);
  });

  test('calculateAsrsScore accurately identifies high probability (>= 4) vs non-consistent profiles', () => {
    const { calculateAsrsScore } = adhdModule;

    // High probability (5 significant items)
    const resHigh = calculateAsrsScore({
      q1: 2, // sig (>=2)
      q2: 3, // sig (>=2)
      q3: 2, // sig (>=2)
      q4: 3, // sig (>=3)
      q5: 4, // sig (>=3)
      q6: 1  // not sig (<3)
    });
    assert.strictEqual(resHigh.significantCount, 5);
    assert.strictEqual(resHigh.isConsistent, true);
    assert.strictEqual(resHigh.tier, 'high_probability');
    assert.match(resHigh.titleEn, /High Probability.*5\/6/);

    // Moderate/Sub-threshold (2 significant items)
    const resMod = calculateAsrsScore({
      q1: 2, // sig (>=2)
      q2: 2, // sig (>=2)
      q3: 1, // not sig
      q4: 2, // not sig (<3)
      q5: 1, // not sig
      q6: 0  // not sig
    });
    assert.strictEqual(resMod.significantCount, 2);
    assert.strictEqual(resMod.isConsistent, false);
    assert.strictEqual(resMod.tier, 'moderate_symptoms');

    // Low probability (0 items)
    const resLow = calculateAsrsScore({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 });
    assert.strictEqual(resLow.significantCount, 0);
    assert.strictEqual(resLow.isConsistent, false);
    assert.strictEqual(resLow.tier, 'low_probability');
  });

  test('evaluateAdhdCarePathway handles counterfeit risk, cardiac precautions, and MOUD co-prescribing', () => {
    const { evaluateAdhdCarePathway } = adhdModule;

    // 1. Counterfeit pill risk triggers critical alert
    const evalFake = evaluateAdhdCarePathway({
      asrsAnswers: { q1: 3, q2: 3, q3: 3, q4: 3 },
      counterfeitPillRisk: true
    });
    assert.ok(evalFake.alerts.some((a) => a.severity === 'critical' && a.titleEn.includes('Counterfeit')));

    // 2. Cardiac history triggers high alert
    const evalCard = evaluateAdhdCarePathway({
      asrsAnswers: { q1: 3, q2: 3, q3: 3, q4: 3 },
      cardiacHistory: true
    });
    assert.ok(evalCard.alerts.some((a) => a.severity === 'high' && a.titleEn.includes('Cardiovascular')));

    // 3. MOUD co-prescribing compatibility note
    const evalMoud = evaluateAdhdCarePathway({
      asrsAnswers: { q1: 3, q2: 3, q3: 3, q4: 3 },
      prescribedMoud: true
    });
    assert.ok(evalMoud.alerts.some((a) => a.severity === 'info' && a.titleEn.includes('MOUD')));
  });

  test('formatAdhdClinicianProposalText generates complete bilingual reports with zero PII', () => {
    const { formatAdhdClinicianProposalText } = adhdModule;
    const mockState = {
      asrsAnswers: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 2, q6: 2 },
      sudHistory: 'remission',
      prescribedMoud: true,
      cardiacHistory: false,
      counterfeitPillRisk: true
    };

    const textEn = formatAdhdClinicianProposalText(mockState, false);
    assert.ok(textEn.includes('HARBORPATH - CLINICAL ADHD & RECOVERY ASSESSMENT PROPOSAL'));
    assert.ok(textEn.includes('WHO ASRS v1.1'));
    assert.ok(textEn.includes('Tier 1 Non-Controlled Non-Stimulants'));
    assert.ok(!textEn.includes('undefined'));
    assert.ok(!textEn.includes('null'));

    const textEs = formatAdhdClinicianProposalText(mockState, true);
    assert.ok(textEs.includes('HARBORPATH - PROPUESTA DE EVALUACIÓN CLÍNICA DE TDAH Y RECUPERACIÓN'));
    assert.ok(textEs.includes('ASRS v1.1'));
    assert.ok(textEs.includes('Nivel 1 No Estimulantes'));
    assert.ok(!textEs.includes('undefined'));
  });

  test('In-RAM state management updates and deterministically resets without storage leakage', () => {
    const { getAdhdState, setAdhdState, resetAdhdState } = adhdModule;
    resetAdhdState();
    const initial = getAdhdState();
    assert.strictEqual(initial.sudHistory, 'remission');
    assert.strictEqual(initial.currentTab, 'screener');
    assert.strictEqual(initial.asrsAnswers.q1, 3);

    setAdhdState({
      sudHistory: 'active',
      currentTab: 'medications',
      asrsAnswers: { q1: 4, q2: 4 }
    });

    const updated = getAdhdState();
    assert.strictEqual(updated.sudHistory, 'active');
    assert.strictEqual(updated.currentTab, 'medications');
    assert.strictEqual(updated.asrsAnswers.q1, 4);

    resetAdhdState();
    const reset = getAdhdState();
    assert.strictEqual(reset.sudHistory, 'remission');
    assert.strictEqual(reset.asrsAnswers.q1, 3);
  });

  test('adhdCareView mounts semantic, accessible DOM structure across tabs', () => {
    const { adhdCareView, resetAdhdState } = adhdModule;
    resetAdhdState();
    const el = adhdCareView();
    assert.ok(el);
    assert.strictEqual(el.tagName, 'DIV');
    assert.ok(el.classList.contains('adhd-care-view'));

    // Check heading
    const h1 = el.querySelector('h1');
    assert.ok(h1);
    assert.ok(h1.textContent.toLowerCase().includes('adhd') || h1.textContent.toLowerCase().includes('tdah'));

    // Check tab buttons
    const tabBtns = el.querySelectorAll('.sub-nav-tab-btn');
    assert.strictEqual(tabBtns.length, 4);

    // Check form questions and proposal box
    assert.ok(el.querySelector('.asrs-questions-list'));
    assert.ok(el.querySelector('.proposal-preview-box'));

    resetAdhdState();
  });

  test('Static audit: zero localStorage, sessionStorage, cookie, innerHTML, or style= writes', () => {
    const filePath = path.resolve('public/js/views/adhdCare.js');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
