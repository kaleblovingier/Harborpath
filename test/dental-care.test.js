// test/dental-care.test.js
// Unit test suite for Dental, Oral Health & Endocarditis Prevention Module (Wave 22)

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
    this.textContent = '';
    this.checked = false;
    this.rows = 0;
  }
  appendChild(child) {
    if (child) this.children.push(child);
    return child;
  }
  append(...children) {
    for (const c of children) {
      if (c) this.children.push(c);
    }
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'class') this.className = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] || null;
  }
  addEventListener() {}
  removeEventListener() {}
}

let dentalModule;

describe('Dental, Oral Health & Endocarditis Prevention Module (Wave 22)', () => {
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

    dentalModule = await import('../public/js/views/dentalCare.js');
  });

  beforeEach(() => {
    dentalModule.resetDentalState();
  });

  test('FDA_BUPRENORPHINE_DENTAL_GUIDELINES exports 6 structured steps including the 1-hour brushing rule', () => {
    const { FDA_BUPRENORPHINE_DENTAL_GUIDELINES } = dentalModule;
    assert.ok(FDA_BUPRENORPHINE_DENTAL_GUIDELINES.titleEn);
    assert.ok(FDA_BUPRENORPHINE_DENTAL_GUIDELINES.titleEs);
    assert.strictEqual(FDA_BUPRENORPHINE_DENTAL_GUIDELINES.steps.length, 6);

    const step4 = FDA_BUPRENORPHINE_DENTAL_GUIDELINES.steps.find(s => s.step === 4);
    assert.ok(step4);
    assert.match(step4.titleEn, /Wait at least 1 HOUR Before Brushing/i);
    assert.match(step4.descEn, /sandpaper/i);

    const step6 = FDA_BUPRENORPHINE_DENTAL_GUIDELINES.steps.find(s => s.step === 6);
    assert.ok(step6);
    assert.match(step6.titleEn, /Sublocade \/ Brixadi/i);
    assert.match(step6.descEn, /subcutaneous/i);
  });

  test('STIMULANT_ORAL_PROTOCOLS exports xerostomia and bruxism interventions', () => {
    const { STIMULANT_ORAL_PROTOCOLS } = dentalModule;
    assert.strictEqual(Array.isArray(STIMULANT_ORAL_PROTOCOLS), true);
    assert.strictEqual(STIMULANT_ORAL_PROTOCOLS.length, 2);

    const xero = STIMULANT_ORAL_PROTOCOLS.find(p => p.id === 'xerostomia');
    assert.ok(xero);
    assert.ok(xero.interventionsEn.some(i => i.includes('xylitol')));
    assert.ok(xero.interventionsEn.some(i => i.includes('Biotene')));

    const brux = STIMULANT_ORAL_PROTOCOLS.find(p => p.id === 'bruxism');
    assert.ok(brux);
    assert.ok(brux.interventionsEn.some(i => i.includes('Magnesium Glycinate')));
  });

  test('ENDOCARDITIS_ORAL_RED_FLAGS exports Ludwig\'s Angina and heart valve infection alerts', () => {
    const { ENDOCARDITIS_ORAL_RED_FLAGS } = dentalModule;
    assert.strictEqual(Array.isArray(ENDOCARDITIS_ORAL_RED_FLAGS), true);
    assert.strictEqual(ENDOCARDITIS_ORAL_RED_FLAGS.length, 3);

    const ludwigs = ENDOCARDITIS_ORAL_RED_FLAGS.find(f => f.id === 'ludwigs_angina');
    assert.ok(ludwigs);
    assert.match(ludwigs.actionEn, /CALL 911 IMMEDIATELY/i);

    const endo = ENDOCARDITIS_ORAL_RED_FLAGS.find(f => f.id === 'infective_endocarditis');
    assert.ok(endo);
    assert.match(endo.actionEn, /EMERGENCY HOSPITAL CARE/i);
  });

  test('evaluateOralHealthRisk escalates Ludwig\'s Angina on swallowing difficulty and tooth abscess', () => {
    const { evaluateOralHealthRisk } = dentalModule;
    const result = evaluateOralHealthRisk({
      hasDifficultySwallowingOrBreathing: true,
      hasToothAbscessOrSwelling: true
    });

    const ludwigs = result.urgentAlerts.find(a => a.id === 'ludwigs_angina');
    assert.ok(ludwigs);
    assert.match(ludwigs.titleEn, /Ludwig's Angina/i);
  });

  test('evaluateOralHealthRisk flags Infective Endocarditis on tooth abscess and fever', () => {
    const { evaluateOralHealthRisk } = dentalModule;
    const result = evaluateOralHealthRisk({
      hasFeverOrNightSweats: true,
      hasToothAbscessOrSwelling: true
    });

    const endo = result.urgentAlerts.find(a => a.id === 'endocarditis_suspicion');
    assert.ok(endo);
    assert.match(endo.titleEn, /Infective Endocarditis/i);
  });

  test('evaluateOralHealthRisk flags critical enamel error when brushing immediately after buprenorphine', () => {
    const { evaluateOralHealthRisk } = dentalModule;
    const result = evaluateOralHealthRisk({
      takingBuprenorphine: true,
      buprenorphineForm: 'sublingual_film',
      brushesImmediatelyAfterBup: true
    });

    const brushError = result.enamelAlerts.find(e => e.id === 'brushing_too_soon');
    assert.ok(brushError);
    assert.match(brushError.descEn, /WAIT AT LEAST 1 HOUR/i);
  });

  test('evaluateOralHealthRisk identifies stimulant xerostomia risk', () => {
    const { evaluateOralHealthRisk } = dentalModule;
    const result = evaluateOralHealthRisk({
      usesStimulants: true,
      hasSevereDryMouth: true
    });

    const xero = result.enamelAlerts.find(e => e.id === 'stimulant_xerostomia');
    assert.ok(xero);
    assert.match(xero.descEn, /xylitol/i);
  });

  test('In-RAM state management provides deterministic reset and isolation', () => {
    const { getDentalState, setDentalState, resetDentalState } = dentalModule;

    setDentalState({
      takingBuprenorphine: false,
      usesStimulants: true,
      activeTab: 'stimulants-heart',
      checklistFluoride: true
    });

    let current = getDentalState();
    assert.strictEqual(current.takingBuprenorphine, false);
    assert.strictEqual(current.usesStimulants, true);
    assert.strictEqual(current.activeTab, 'stimulants-heart');
    assert.strictEqual(current.checklistFluoride, true);

    resetDentalState();
    current = getDentalState();
    assert.strictEqual(current.takingBuprenorphine, true);
    assert.strictEqual(current.usesStimulants, false);
    assert.strictEqual(current.activeTab, 'assessment');
    assert.strictEqual(current.checklistFluoride, false);
  });

  test('formatDentalSummaryText generates comprehensive bilingual reports without PII', () => {
    const { formatDentalSummaryText } = dentalModule;

    const enText = formatDentalSummaryText({
      takingBuprenorphine: true,
      buprenorphineForm: 'sublingual_film',
      brushesImmediatelyAfterBup: true,
      usesStimulants: true,
      hasSevereDryMouth: true,
      hasToothAbscessOrSwelling: false,
      hasFeverOrNightSweats: false,
      hasDifficultySwallowingOrBreathing: false
    }, 'en');

    assert.match(enText, /HARBORPATH DENTAL, BUPRENORPHINE & ENDOCARDITIS SAFETY REPORT/);
    assert.match(enText, /Zero device storage/);
    assert.match(enText, /FQHC Community Dental Clinics/);
    assert.match(enText, /800-ASK-HRSA/);

    const esText = formatDentalSummaryText({
      takingBuprenorphine: true,
      buprenorphineForm: 'sublingual_film',
      brushesImmediatelyAfterBup: true,
      usesStimulants: true,
      hasSevereDryMouth: true,
      hasToothAbscessOrSwelling: false,
      hasFeverOrNightSweats: false,
      hasDifficultySwallowingOrBreathing: false
    }, 'es');

    assert.match(esText, /EVALUACIÓN DE SALUD DENTAL, BUPRENORFINA Y ENDOCARDITIS/);
    assert.match(esText, /Cero almacenamiento en disco/);
  });

  test('dentalCareView mounts accessible DOM structure with tab switching', () => {
    const { dentalCareView } = dentalModule;
    const view = dentalCareView();

    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.className.includes('dental-care-view'));
    assert.ok(view.children.length >= 3);
  });

  test('Static security and privacy audit of dentalCare.js', () => {
    const filePath = path.resolve('public/js/views/dentalCare.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
