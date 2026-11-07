// test/sleep-care.test.js
// Unit test suite for Sleep Restoration & Insomnia in Recovery Module (Wave 21)

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

let sleepModule;

describe('Sleep Restoration & Insomnia in Recovery Module (Wave 21)', () => {
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

    sleepModule = await import('../public/js/views/sleepCare.js');
  });

  beforeEach(() => {
    sleepModule.resetSleepState();
  });

  test('WITHDRAWAL_SLEEP_ARCHITECTURES exports 5 substance categories with bilingual PAWS timelines', () => {
    const { WITHDRAWAL_SLEEP_ARCHITECTURES } = sleepModule;
    assert.strictEqual(Array.isArray(WITHDRAWAL_SLEEP_ARCHITECTURES), true);
    assert.strictEqual(WITHDRAWAL_SLEEP_ARCHITECTURES.length, 5);

    const ids = WITHDRAWAL_SLEEP_ARCHITECTURES.map(a => a.id);
    assert.ok(ids.includes('opioids'));
    assert.ok(ids.includes('alcohol'));
    assert.ok(ids.includes('stimulants'));
    assert.ok(ids.includes('benzos'));
    assert.ok(ids.includes('cannabis'));

    WITHDRAWAL_SLEEP_ARCHITECTURES.forEach(arch => {
      assert.ok(arch.nameEn && arch.nameEn.length > 0);
      assert.ok(arch.nameEs && arch.nameEs.length > 0);
      assert.ok(arch.acutePhaseEn && arch.acutePhaseEn.length > 0);
      assert.ok(arch.pawsPhaseEn && arch.pawsPhaseEn.length > 0);
      assert.ok(arch.clinicalPearlEn && arch.clinicalPearlEn.length > 0);
    });
  });

  test('NON_CONTROLLED_SLEEP_MEDICATIONS exports 6 evidence-based non-addictive options', () => {
    const { NON_CONTROLLED_SLEEP_MEDICATIONS } = sleepModule;
    assert.strictEqual(Array.isArray(NON_CONTROLLED_SLEEP_MEDICATIONS), true);
    assert.strictEqual(NON_CONTROLLED_SLEEP_MEDICATIONS.length, 6);

    const trazodone = NON_CONTROLLED_SLEEP_MEDICATIONS.find(m => m.id === 'trazodone');
    assert.ok(trazodone);
    assert.match(trazodone.mechanismEn, /5-HT2A/);

    const mirtazapine = NON_CONTROLLED_SLEEP_MEDICATIONS.find(m => m.id === 'mirtazapine');
    assert.ok(mirtazapine);
    assert.match(mirtazapine.advantagesEn, /Paradoxical dosing effect/);

    const prazosin = NON_CONTROLLED_SLEEP_MEDICATIONS.find(m => m.id === 'prazosin');
    assert.ok(prazosin);
    assert.match(prazosin.advantagesEn, /trauma-related nightmares/);

    const doxepin = NON_CONTROLLED_SLEEP_MEDICATIONS.find(m => m.id === 'doxepin_low_dose');
    assert.ok(doxepin);
    assert.match(doxepin.doseEn, /3 - 6 mg/);
  });

  test('CONTRAINDICATED_SEDATIVES_WARNING explains fatal synergy with MOUD', () => {
    const { CONTRAINDICATED_SEDATIVES_WARNING } = sleepModule;
    assert.ok(CONTRAINDICATED_SEDATIVES_WARNING.titleEn);
    assert.ok(CONTRAINDICATED_SEDATIVES_WARNING.titleEs);
    assert.match(CONTRAINDICATED_SEDATIVES_WARNING.summaryEn, /respiratory arrest/);
    assert.match(CONTRAINDICATED_SEDATIVES_WARNING.summaryEn, /MOUD/);
  });

  test('CBTI_PROTOCOLS exports 4 evidence-based behavioral techniques', () => {
    const { CBTI_PROTOCOLS } = sleepModule;
    assert.strictEqual(Array.isArray(CBTI_PROTOCOLS), true);
    assert.strictEqual(CBTI_PROTOCOLS.length, 4);

    const stimulusControl = CBTI_PROTOCOLS.find(p => p.id === 'stimulus_control');
    assert.ok(stimulusControl);
    assert.ok(stimulusControl.rulesEn.some(r => r.includes('20-Minute Rule')));

    const usingDreams = CBTI_PROTOCOLS.find(p => p.id === 'using_dreams');
    assert.ok(usingDreams);
    assert.ok(usingDreams.rulesEn.some(r => r.includes('REM Rebound')));
  });

  test('evaluateSleepProfile calculates Sleep Efficiency and triggers sleep restriction', () => {
    const { evaluateSleepProfile } = sleepModule;
    const result = evaluateSleepProfile({
      timeInBedHours: 8.0,
      totalSleepHours: 5.0,
      sleepLatencyMinutes: 45
    });

    assert.strictEqual(result.efficiency, 63);
    assert.strictEqual(result.efficiencyBadgeClass, 'badge-danger');
    assert.match(result.efficiencyTierEn, /Poor Sleep Efficiency/);

    const hasRestriction = result.primaryRecommendations.some(r => r.titleEn.includes('Sleep Restriction Window'));
    assert.ok(hasRestriction);

    const has20Min = result.primaryRecommendations.some(r => r.titleEn.includes('20-Minute Stimulus Control'));
    assert.ok(has20Min);
  });

  test('evaluateSleepProfile matches prazosin for trauma nightmares and low-dose doxepin for 2AM awakenings', () => {
    const { evaluateSleepProfile } = sleepModule;
    const result = evaluateSleepProfile({
      hasTraumaNightmares: true,
      hasAwakeningsAt2AM: true
    });

    const prazosinRec = result.suggestedMedications.find(m => m.medId === 'prazosin');
    assert.ok(prazosinRec);

    const doxepinRec = result.suggestedMedications.find(m => m.medId === 'doxepin_low_dose');
    assert.ok(doxepinRec);
  });

  test('In-RAM state management provides deterministic reset and isolation', () => {
    const { getSleepState, setSleepState, resetSleepState } = sleepModule;

    setSleepState({
      substanceId: 'alcohol',
      timeInBedHours: 9.0,
      totalSleepHours: 4.0,
      activeTab: 'cbti',
      checklistWakeTime: true
    });

    let current = getSleepState();
    assert.strictEqual(current.substanceId, 'alcohol');
    assert.strictEqual(current.activeTab, 'cbti');
    assert.strictEqual(current.checklistWakeTime, true);

    resetSleepState();
    current = getSleepState();
    assert.strictEqual(current.substanceId, 'opioids');
    assert.strictEqual(current.activeTab, 'calculator');
    assert.strictEqual(current.checklistWakeTime, false);
  });

  test('formatSleepSummaryText produces comprehensive bilingual summaries without PII', () => {
    const { formatSleepSummaryText } = sleepModule;

    const enText = formatSleepSummaryText({
      substanceId: 'opioids',
      timeInBedHours: 8.0,
      totalSleepHours: 5.5,
      sleepLatencyMinutes: 45,
      hasRestlessLegs: false,
      hasTraumaNightmares: true,
      hasAwakeningsAt2AM: true
    }, 'en');

    assert.match(enText, /HARBORPATH SLEEP RESTORATION/);
    assert.match(enText, /Zero device storage/);
    assert.match(enText, /Calculated Sleep Efficiency: 69%/);
    assert.match(enText, /Suicide & Crisis Lifeline: 988/);

    const esText = formatSleepSummaryText({
      substanceId: 'opioids',
      timeInBedHours: 8.0,
      totalSleepHours: 5.5,
      sleepLatencyMinutes: 45,
      hasRestlessLegs: false,
      hasTraumaNightmares: true,
      hasAwakeningsAt2AM: true
    }, 'es');

    assert.match(esText, /EVALUACIÓN Y PLAN DE RESTAURACIÓN DEL SUEÑO/);
    assert.match(esText, /Cero almacenamiento en disco/);
  });

  test('sleepCareView mounts accessible DOM structure with tab switching', () => {
    const { sleepCareView } = sleepModule;
    const view = sleepCareView();

    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.className.includes('sleep-care-view'));
    assert.ok(view.children.length >= 3);
  });

  test('Static security and privacy audit of sleepCare.js', () => {
    const filePath = path.resolve('public/js/views/sleepCare.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
