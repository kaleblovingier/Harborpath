// test/nicotine-care.test.js
// Unit test suite for Tobacco, Nicotine, Vaping & Smoking Cessation Module (Wave 25)

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
    this.value = '';
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
  closest() {
    return null;
  }
}

let nicotineModule;

describe('Tobacco, Nicotine, Vaping & Smoking Cessation Module (Wave 25)', () => {
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

    nicotineModule = await import('../public/js/views/nicotineCare.js');
  });

  beforeEach(() => {
    if (nicotineModule && nicotineModule.resetNicotineState) {
      nicotineModule.resetNicotineState();
    }
  });

  test('RECOVERY_TOBACCO_MANDATE exports concurrent cessation benefits, mortality facts, and Medicaid mandate', () => {
    const { RECOVERY_TOBACCO_MANDATE } = nicotineModule;
    assert.ok(RECOVERY_TOBACCO_MANDATE);
    assert.match(RECOVERY_TOBACCO_MANDATE.mandateEn, /INCREASES long-term abstinence.*25%/i);
    assert.strictEqual(RECOVERY_TOBACCO_MANDATE.coreFacts.length, 3);

    const medFact = RECOVERY_TOBACCO_MANDATE.coreFacts.find(f => f.topicEn.includes('Medicaid'));
    assert.ok(medFact);
    assert.match(medFact.detailEn, /\$0 copay/);
  });

  test('FAGERSTROM_QUESTIONS exports all 6 validated questions with scoring points', () => {
    const { FAGERSTROM_QUESTIONS } = nicotineModule;
    assert.ok(Array.isArray(FAGERSTROM_QUESTIONS));
    assert.strictEqual(FAGERSTROM_QUESTIONS.length, 6);

    const q1 = FAGERSTROM_QUESTIONS.find(q => q.id === 'time_to_first');
    assert.ok(q1);
    assert.strictEqual(q1.options.length, 4);
    assert.strictEqual(q1.options[0].points, 3);
  });

  test('COMBINATION_NRT_STANDARDS details basal patch steps, acute relievers, and chew-and-park technique', () => {
    const { COMBINATION_NRT_STANDARDS } = nicotineModule;
    assert.ok(COMBINATION_NRT_STANDARDS);
    assert.match(COMBINATION_NRT_STANDARDS.overviewEn, /DOUBLES cessation success/i);
    assert.strictEqual(COMBINATION_NRT_STANDARDS.controllerPatch.length, 3);

    const gum = COMBINATION_NRT_STANDARDS.relieverOral.find(r => r.product.includes('Gum'));
    assert.ok(gum);
    assert.match(gum.usageEn, /Chew and Park/i);
    assert.match(gum.usageEn, /hiccups/i);
  });

  test('NON_NICOTINE_PHARMACOTHERAPY details varenicline EAGLES safety and bupropion seizure contraindications', () => {
    const { NON_NICOTINE_PHARMACOTHERAPY } = nicotineModule;
    assert.ok(Array.isArray(NON_NICOTINE_PHARMACOTHERAPY));
    assert.strictEqual(NON_NICOTINE_PHARMACOTHERAPY.length, 2);

    const varenicline = NON_NICOTINE_PHARMACOTHERAPY.find(d => d.drugId === 'varenicline');
    assert.ok(varenicline);
    assert.match(varenicline.safetyEn, /EAGLES/i);
    assert.match(varenicline.titrationEn, /Reduce to Quit/i);

    const bupropion = NON_NICOTINE_PHARMACOTHERAPY.find(d => d.drugId === 'bupropion');
    assert.ok(bupropion);
    assert.match(bupropion.safetyEn, /seizure/i);
  });

  test('VAPING_HARM_REDUCTION exports 5-stage down-titration ladder and modern pouch care', () => {
    const { VAPING_HARM_REDUCTION } = nicotineModule;
    assert.ok(VAPING_HARM_REDUCTION);
    assert.match(VAPING_HARM_REDUCTION.nicotineSaltsEn, /benzoic acid/i);
    assert.strictEqual(VAPING_HARM_REDUCTION.taperingLadderEn.length, 5);
    assert.match(VAPING_HARM_REDUCTION.pouchesEn, /recession/i);
  });

  test('THE_FOUR_DS_PROTOCOL contains Delay, Deep breathing, Drink water, and Distract', () => {
    const { THE_FOUR_DS_PROTOCOL } = nicotineModule;
    assert.ok(Array.isArray(THE_FOUR_DS_PROTOCOL));
    assert.strictEqual(THE_FOUR_DS_PROTOCOL.length, 4);

    const ids = THE_FOUR_DS_PROTOCOL.map(d => d.dId);
    assert.ok(ids.includes('delay'));
    assert.ok(ids.includes('deep_breath'));
    assert.ok(ids.includes('drink_water'));
    assert.ok(ids.includes('distract'));
  });

  test('calculateFagerstromScore accurately calculates points and dependence categories', () => {
    const { calculateFagerstromScore } = nicotineModule;

    // Very high dependence (Score: 3 + 1 + 1 + 3 + 1 + 0 = 9)
    const veryHigh = calculateFagerstromScore({
      time_to_first: 3,
      forbidden_places: 1,
      hate_to_give_up: 1,
      cigs_per_day: 3,
      morning_cluster: 1,
      smoke_when_ill: 0
    });
    assert.strictEqual(veryHigh.score, 9);
    assert.strictEqual(veryHigh.level, 'very_high');
    assert.match(veryHigh.recommendationEn, /Combination NRT.*21 mg.*4 mg/i);

    // High dependence (Score: 2 + 1 + 1 + 1 + 1 + 0 = 6)
    const high = calculateFagerstromScore({
      time_to_first: 2,
      forbidden_places: 1,
      hate_to_give_up: 1,
      cigs_per_day: 1,
      morning_cluster: 1,
      smoke_when_ill: 0
    });
    assert.strictEqual(high.score, 6);
    assert.strictEqual(high.level, 'high');

    // Moderate dependence (Score: 2 + 0 + 1 + 1 + 1 + 0 = 5)
    const mod = calculateFagerstromScore({
      time_to_first: 2,
      forbidden_places: 0,
      hate_to_give_up: 1,
      cigs_per_day: 1,
      morning_cluster: 1,
      smoke_when_ill: 0
    });
    assert.strictEqual(mod.score, 5);
    assert.strictEqual(mod.level, 'moderate');

    // Low dependence (Score: 0 + 0 + 0 + 1 + 0 + 0 = 1)
    const low = calculateFagerstromScore({
      time_to_first: 0,
      forbidden_places: 0,
      hate_to_give_up: 0,
      cigs_per_day: 1,
      morning_cluster: 0,
      smoke_when_ill: 0
    });
    assert.strictEqual(low.score, 1);
    assert.strictEqual(low.level, 'low');
  });

  test('In-RAM state management provides deterministic reset and isolation', () => {
    const { getNicotineState, setNicotineState, resetNicotineState } = nicotineModule;

    setNicotineState({
      currentTab: 'medications',
      productType: 'vapes',
      fagerstromAnswers: { time_to_first: 3 }
    });

    let state = getNicotineState();
    assert.strictEqual(state.currentTab, 'medications');
    assert.strictEqual(state.productType, 'vapes');
    assert.strictEqual(state.fagerstromAnswers.time_to_first, 3);

    resetNicotineState();
    state = getNicotineState();
    assert.strictEqual(state.currentTab, 'fagerstrom');
    assert.strictEqual(state.productType, 'cigarettes');
    assert.strictEqual(state.fagerstromAnswers.time_to_first, 2);
  });

  test('formatNicotineSummaryText produces clean bilingual summaries without PII', () => {
    const { formatNicotineSummaryText } = nicotineModule;

    const enText = formatNicotineSummaryText({
      fagerstromAnswers: { time_to_first: 3, forbidden_places: 1, hate_to_give_up: 1, cigs_per_day: 2, morning_cluster: 1, smoke_when_ill: 1 },
      productType: 'cigarettes',
      selectedStrategy: 'combo_nrt'
    }, 'en');

    assert.match(enText, /HARBORPATH: TOBACCO & NICOTINE CESSATION/);
    assert.match(enText, /Zero device storage/);
    assert.match(enText, /FAGERSTRÖM DEPENDENCE ASSESSMENT/);
    assert.match(enText, /Combination NRT/);
    assert.match(enText, /1-800-QUIT-NOW/);

    const esText = formatNicotineSummaryText({
      fagerstromAnswers: { time_to_first: 3, forbidden_places: 1, hate_to_give_up: 1, cigs_per_day: 2, morning_cluster: 1, smoke_when_ill: 1 },
      productType: 'cigarettes',
      selectedStrategy: 'combo_nrt'
    }, 'es');

    assert.match(esText, /HARBORPATH: RESUMEN DE CESACIÓN TABÁQUICA/);
    assert.match(esText, /100% en memoria RAM/);
    assert.match(esText, /1-855-DÉJALO-YA/);
  });

  test('nicotineCareView mounts accessible DOM structure with tab navigation', () => {
    const { nicotineCareView } = nicotineModule;
    const view = nicotineCareView();

    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.className.includes('nicotine-care-view'));
    assert.ok(view.children.length >= 1);
  });

  test('Static security and privacy audit of nicotineCare.js', () => {
    const filePath = path.resolve('public/js/views/nicotineCare.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
