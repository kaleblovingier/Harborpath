// test/nightlife-care.test.js
// Unit test suite for Nightlife & Festival Harm Reduction Module (Wave 20)

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

let nightlifeModule;

describe('Nightlife & Festival Harm Reduction Module (Wave 20)', () => {
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

    nightlifeModule = await import('../public/js/views/nightlifeCare.js');
  });

  beforeEach(() => {
    nightlifeModule.resetNightlifeState();
  });

  test('NIGHTLIFE_SUBSTANCES exports 5 detailed substance classes with bilingual properties', () => {
    const { NIGHTLIFE_SUBSTANCES } = nightlifeModule;
    assert.strictEqual(Array.isArray(NIGHTLIFE_SUBSTANCES), true);
    assert.strictEqual(NIGHTLIFE_SUBSTANCES.length, 5);

    const ids = NIGHTLIFE_SUBSTANCES.map(s => s.id);
    assert.ok(ids.includes('ketamine'));
    assert.ok(ids.includes('mdma'));
    assert.ok(ids.includes('ghb'));
    assert.ok(ids.includes('nitrous'));
    assert.ok(ids.includes('2cb'));

    NIGHTLIFE_SUBSTANCES.forEach(sub => {
      assert.ok(sub.nameEn && sub.nameEn.length > 0);
      assert.ok(sub.nameEs && sub.nameEs.length > 0);
      assert.ok(sub.mechanismEn && sub.mechanismEn.length > 0);
      assert.ok(sub.mechanismEs && sub.mechanismEs.length > 0);
      assert.ok(sub.durationEn && sub.durationEn.length > 0);
      assert.ok(Array.isArray(sub.harmReductionEn) && sub.harmReductionEn.length >= 3);
      assert.ok(Array.isArray(sub.harmReductionEs) && sub.harmReductionEs.length >= 3);
    });
  });

  test('REAGENT_STANDARDS exports 4 chemical testing standards with reactions', () => {
    const { REAGENT_STANDARDS } = nightlifeModule;
    assert.strictEqual(Array.isArray(REAGENT_STANDARDS), true);
    assert.strictEqual(REAGENT_STANDARDS.length, 4);

    const marquis = REAGENT_STANDARDS.find(r => r.reagent === 'Marquis');
    assert.ok(marquis);
    assert.ok(marquis.reactions.some(rx => rx.substance.includes('MDMA')));

    const simons = REAGENT_STANDARDS.find(r => r.reagent.includes("Simon's"));
    assert.ok(simons);
    assert.ok(simons.reactions.some(rx => rx.substance === 'MDMA' && rx.colorEn.includes('Blue')));

    const morris = REAGENT_STANDARDS.find(r => r.reagent.includes('Morris'));
    assert.ok(morris);
    assert.ok(morris.reactions.some(rx => rx.substance === 'Ketamine' && rx.colorEn.includes('Purple')));
  });

  test('evaluateNightlifeScenario identifies dilutional hyponatremia risk for MDMA', () => {
    const { evaluateNightlifeScenario } = nightlifeModule;
    const result = evaluateNightlifeScenario({
      selectedSubstances: ['mdma'],
      fluidIntakeLitresPerHour: 0.8
    });

    const hyponatremia = result.issues.find(i => i.id === 'hyponatremia_risk');
    assert.ok(hyponatremia);
    assert.match(hyponatremia.titleEn, /Hyponatremia/i);
    assert.match(hyponatremia.descEn, /SIADH/i);
  });

  test('evaluateNightlifeScenario escalates acute hyponatremia / heatstroke on confusion', () => {
    const { evaluateNightlifeScenario } = nightlifeModule;
    const result = evaluateNightlifeScenario({
      selectedSubstances: ['mdma'],
      hasSevereHeadacheOrConfusion: true
    });

    assert.ok(result.urgentEscalations.some(e => e.actionEn.includes('Acute Hyponatremia')));
  });

  test('evaluateNightlifeScenario identifies GHB + Alcohol critical respiratory collapse', () => {
    const { evaluateNightlifeScenario } = nightlifeModule;
    const result = evaluateNightlifeScenario({
      selectedSubstances: ['ghb'],
      combiningWithAlcohol: true
    });

    assert.ok(result.urgentEscalations.some(e => e.actionEn.includes('CRITICAL WARNING: GHB and alcohol')));
  });

  test('evaluateNightlifeScenario identifies Ketamine ulcerative cystitis and EGCG shield', () => {
    const { evaluateNightlifeScenario } = nightlifeModule;
    const result = evaluateNightlifeScenario({
      selectedSubstances: ['ketamine'],
      hasUrinaryBloodOrPain: true
    });

    const cystitis = result.issues.find(i => i.id === 'k_cystitis');
    assert.ok(cystitis);
    assert.match(cystitis.titleEn, /K-Bladder/i);
    assert.ok(result.actionPearls.some(p => p.tipEn.includes('EGCG')));
  });

  test('evaluateNightlifeScenario flags nitrous B12 spinal cord demyelination', () => {
    const { evaluateNightlifeScenario } = nightlifeModule;
    const result = evaluateNightlifeScenario({
      selectedSubstances: ['nitrous'],
      hasNumbnessOrTingling: true
    });

    assert.ok(result.urgentEscalations.some(e => e.actionEn.includes('Subacute Combined Degeneration')));
  });

  test('In-RAM state management provides deterministic reset and isolation', () => {
    const { getNightlifeState, setNightlifeState, resetNightlifeState } = nightlifeModule;

    setNightlifeState({
      selectedSubstances: ['ketamine', '2cb'],
      activeTab: 'reagents',
      checklistElectrolytes: true
    });

    let current = getNightlifeState();
    assert.strictEqual(current.activeTab, 'reagents');
    assert.strictEqual(current.checklistElectrolytes, true);
    assert.deepStrictEqual(current.selectedSubstances, ['ketamine', '2cb']);

    resetNightlifeState();
    current = getNightlifeState();
    assert.strictEqual(current.activeTab, 'profiles');
    assert.strictEqual(current.checklistElectrolytes, false);
    assert.deepStrictEqual(current.selectedSubstances, ['mdma']);
  });

  test('formatNightlifeSummaryText produces bilingual plain-text summaries without PII', () => {
    const { formatNightlifeSummaryText } = nightlifeModule;

    const enText = formatNightlifeSummaryText({
      selectedSubstances: ['mdma', 'ketamine'],
      fluidIntake: 0.4
    }, 'en');

    assert.match(enText, /HARBORPATH NIGHTLIFE & FESTIVAL HARM REDUCTION/);
    assert.match(enText, /Zero device storage/);
    assert.match(enText, /Never Use Alone/);
    assert.match(enText, /877-696-1997/);

    const esText = formatNightlifeSummaryText({
      selectedSubstances: ['mdma', 'ketamine'],
      fluidIntake: 0.4
    }, 'es');

    assert.match(esText, /EVALUACIÓN DE REDUCCIÓN DE DAÑOS EN FIESTAS Y CLUBES/);
    assert.match(esText, /Cero almacenamiento en disco/);
  });

  test('nightlifeCareView mounts accessible DOM structure with tab switching', () => {
    const { nightlifeCareView } = nightlifeModule;
    const view = nightlifeCareView();

    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.className.includes('nightlife-view'));
    assert.ok(view.children.length >= 3);
  });

  test('Static security and privacy audit of nightlifeCare.js', () => {
    const filePath = path.resolve('public/js/views/nightlifeCare.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
