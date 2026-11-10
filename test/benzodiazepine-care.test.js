// test/benzodiazepine-care.test.js
// HarborPath - Wave 26 Benzodiazepine Deprescribing, Ashton Taper & BIND Navigator Tests

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

let benzoModule;

describe('Benzodiazepine Deprescribing, Ashton Taper & BIND Care Module (Wave 26)', () => {
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

    benzoModule = await import('../public/js/views/benzodiazepineCare.js');
  });

  beforeEach(() => {
    if (benzoModule && benzoModule.resetBenzodiazepineState) {
      benzoModule.resetBenzodiazepineState();
    }
  });

  test('BENZODIAZEPINE_CATALOG exports comprehensive pharmacokinetic profiles for 12+ agents', () => {
    const { BENZODIAZEPINE_CATALOG } = benzoModule;
    const keys = Object.keys(BENZODIAZEPINE_CATALOG);
    assert.ok(keys.length >= 12, `Expected at least 12 agents, got ${keys.length}`);

    const expectedKeys = [
      'alprazolam', 'clonazepam', 'lorazepam', 'diazepam',
      'temazepam', 'chlordiazepoxide', 'oxazepam', 'clorazepate',
      'triazolam', 'zolpidem', 'eszopiclone', 'zaleplon'
    ];

    expectedKeys.forEach((k) => {
      assert.ok(BENZODIAZEPINE_CATALOG[k], `Missing catalog entry for ${k}`);
      const entry = BENZODIAZEPINE_CATALOG[k];
      assert.ok(entry.nameEn && entry.nameEs);
      assert.strictEqual(typeof entry.dmeRatio, 'number');
      assert.ok(entry.dmeRatio > 0);
      assert.ok(entry.halfLifeHours && entry.halfLifeHoursEs);
      assert.ok(entry.onset && entry.onsetEs);
      assert.ok(entry.classEn && entry.classEs);
      assert.ok(entry.interdoseRiskEn && entry.interdoseRiskEs);
      assert.ok(entry.crossoverRecEn && entry.crossoverRecEs);
    });
  });

  test('ASHTON_TAPER_RULES exports all 4 core deprescribing principles with bilingual descriptions', () => {
    const { ASHTON_TAPER_RULES } = benzoModule;
    assert.strictEqual(ASHTON_TAPER_RULES.length, 4);
    const ruleIds = ASHTON_TAPER_RULES.map((r) => r.ruleId);
    assert.deepStrictEqual(ruleIds, ['patient_control', 'crossover_principle', 'micro_tapering', 'no_rapid_detox']);
    ASHTON_TAPER_RULES.forEach((r) => {
      assert.ok(r.titleEn && r.titleEs);
      assert.ok(r.descEn && r.descEs);
    });
  });

  test('FLUMAZENIL_CONTRAINDICATION_ALERT mandates strict contraindication in chronic dependency', () => {
    const { FLUMAZENIL_CONTRAINDICATION_ALERT } = benzoModule;
    assert.ok(FLUMAZENIL_CONTRAINDICATION_ALERT.titleEn.includes('BLACK BOX WARNING'));
    assert.ok(FLUMAZENIL_CONTRAINDICATION_ALERT.titleEs.includes('RECUADRO NEGRO'));
    assert.ok(FLUMAZENIL_CONTRAINDICATION_ALERT.warningEn.includes('STATUS EPILEPTICUS'));
    assert.ok(FLUMAZENIL_CONTRAINDICATION_ALERT.warningEn.includes('NALOXONE'));
    assert.ok(FLUMAZENIL_CONTRAINDICATION_ALERT.warningEs.includes('ESTADO EPILÉPTICO'));
  });

  test('BIND_SYMPTOMS_CATALOG categorizes validated neuro-symptoms across 4 clusters', () => {
    const { BIND_SYMPTOMS_CATALOG } = benzoModule;
    assert.strictEqual(BIND_SYMPTOMS_CATALOG.length, 4);
    const clusterIds = BIND_SYMPTOMS_CATALOG.map((c) => c.clusterId);
    assert.deepStrictEqual(clusterIds, ['sensory', 'autonomic', 'cognitive', 'psychological']);

    let totalSymptoms = 0;
    BIND_SYMPTOMS_CATALOG.forEach((c) => {
      assert.ok(c.titleEn && c.titleEs);
      assert.ok(Array.isArray(c.items) && c.items.length >= 3);
      totalSymptoms += c.items.length;
      c.items.forEach((item) => {
        assert.ok(item.id && item.nameEn && item.nameEs);
      });
    });
    assert.ok(totalSymptoms >= 14, `Expected at least 14 BIND symptoms, found ${totalSymptoms}`);
  });

  test('COMFORT_MEDICATIONS_MATRIX provides evidence-based non-controlled adjuncts and warns on fluoroquinolones', () => {
    const { COMFORT_MEDICATIONS_MATRIX } = benzoModule;
    assert.ok(COMFORT_MEDICATIONS_MATRIX.length >= 5);
    const ids = COMFORT_MEDICATIONS_MATRIX.map((m) => m.id);
    assert.ok(ids.includes('propranolol'));
    assert.ok(ids.includes('hydroxyzine'));
    assert.ok(ids.includes('melatonin'));
    assert.ok(ids.includes('trazodone'));
    assert.ok(ids.includes('fluoroquinolones_warning'));

    const fq = COMFORT_MEDICATIONS_MATRIX.find((m) => m.id === 'fluoroquinolones_warning');
    assert.ok(fq.indicationEn.includes('CONTRAINDICATED'));
    assert.ok(fq.indicationEn.includes('GABA-A'));
  });

  test('calculateDiazepamEquivalent accurately computes DME across high- and low-potency agents', () => {
    const { calculateDiazepamEquivalent } = benzoModule;
    // Alprazolam 2 mg -> 40 mg diazepam
    assert.strictEqual(calculateDiazepamEquivalent('alprazolam', 2), 40);
    // Clonazepam 0.5 mg -> 10 mg diazepam
    assert.strictEqual(calculateDiazepamEquivalent('clonazepam', 0.5), 10);
    // Lorazepam 3 mg -> 30 mg diazepam
    assert.strictEqual(calculateDiazepamEquivalent('lorazepam', 3), 30);
    // Diazepam 15 mg -> 15 mg diazepam
    assert.strictEqual(calculateDiazepamEquivalent('diazepam', 15), 15);
    // Zolpidem 10 mg -> 5 mg diazepam
    assert.strictEqual(calculateDiazepamEquivalent('zolpidem', 10), 5);
    // Chlordiazepoxide 50 mg -> 20 mg diazepam
    assert.strictEqual(calculateDiazepamEquivalent('chlordiazepoxide', 50), 20);
    // Zero or negative dose yields 0
    assert.strictEqual(calculateDiazepamEquivalent('alprazolam', 0), 0);
    assert.strictEqual(calculateDiazepamEquivalent('alprazolam', -5), 0);
    // Unknown drug defaults gracefully
    assert.strictEqual(calculateDiazepamEquivalent('unknown_pill', 10), 10);
  });

  test('generateAshtonCrossoverPlan formats multi-stage substitutions for non-diazepam agents', () => {
    const { generateAshtonCrossoverPlan } = benzoModule;
    const planAlprazolam = generateAshtonCrossoverPlan({ drugId: 'alprazolam', dailyDoseMg: 2 });
    assert.strictEqual(planAlprazolam.needed, true);
    assert.strictEqual(planAlprazolam.dme, 40);
    assert.strictEqual(planAlprazolam.stages.length, 4);
    assert.ok(planAlprazolam.stages[0].titleEn.includes('Evening / Bedtime'));
    assert.ok(planAlprazolam.stages[1].titleEn.includes('Morning'));
    assert.ok(planAlprazolam.stages[2].titleEn.includes('Midday'));
    assert.ok(planAlprazolam.stages[3].titleEn.includes('Stabilization'));

    // If patient is already taking diazepam
    const planDiazepam = generateAshtonCrossoverPlan({ drugId: 'diazepam', dailyDoseMg: 20 });
    assert.strictEqual(planDiazepam.needed, false);
    assert.strictEqual(planDiazepam.stages.length, 0);
    assert.ok(planDiazepam.messageEn.includes('already taking Diazepam'));
  });

  test('generateDetailedAshtonReductionSchedule produces conservative 5-10% cuts down to 0 mg', () => {
    const { generateDetailedAshtonReductionSchedule } = benzoModule;
    const schedule = generateDetailedAshtonReductionSchedule({ diazepamEquivalentMg: 30, stepIntervalWeeks: 2 });
    assert.ok(schedule.length > 10, `Expected > 10 reduction steps, got ${schedule.length}`);

    // Verify first step
    const step1 = schedule[0];
    assert.strictEqual(step1.stepNumber, 1);
    assert.strictEqual(step1.startWeek, 1);
    assert.strictEqual(step1.endWeek, 2);
    assert.strictEqual(step1.startingDoseMg, 30);
    assert.strictEqual(step1.targetDoseMg, 28);
    assert.strictEqual(step1.reductionMg, 2);

    // Verify final step reaches 0 mg
    const finalStep = schedule[schedule.length - 1];
    assert.strictEqual(finalStep.targetDoseMg, 0);
    assert.strictEqual(finalStep.percentReduction, 100);
    assert.ok(finalStep.practicalDosingEn.includes('Zero medication'));
    assert.ok(finalStep.practicalDosingEs.includes('Cero medicación'));

    // Verify micro-tapering rule near 5 mg down to 0 mg
    const lowDoseSteps = schedule.filter((s) => s.startingDoseMg <= 5 && s.targetDoseMg > 0);
    lowDoseSteps.forEach((s) => {
      assert.ok(s.reductionMg <= 1.0, `Expected low-dose cut <= 1.0 mg, got ${s.reductionMg}`);
    });
  });

  test('evaluateBenzoTaperRisk accurately stratifies acute seizure emergencies and co-ingestion risks', () => {
    const { evaluateBenzoTaperRisk } = benzoModule;
    // 1. Acute abrupt stop emergency
    const emg = evaluateBenzoTaperRisk({
      drugId: 'alprazolam',
      dailyDoseMg: 4,
      durationWeeks: 24,
      abruptStop: true
    });
    assert.strictEqual(emg.riskLevel, 'emergency_seizure_risk');
    assert.ok(emg.alerts.some((a) => a.severity === 'critical' && a.titleEn.includes('Seizure Danger')));

    // 2. High-dose dependency without abrupt stop
    const highDose = evaluateBenzoTaperRisk({
      drugId: 'clonazepam',
      dailyDoseMg: 3, // 60 mg DME
      durationWeeks: 52,
      abruptStop: false
    });
    assert.strictEqual(highDose.riskLevel, 'high_risk_inpatient');
    assert.ok(highDose.alerts.some((a) => a.severity === 'high'));

    // 3. Polysubstance Opioid co-use
    const opioidCoUse = evaluateBenzoTaperRisk({
      drugId: 'lorazepam',
      dailyDoseMg: 1,
      durationWeeks: 8,
      polysubstanceOpioid: true
    });
    assert.ok(opioidCoUse.alerts.some((a) => a.titleEn.includes('FDA Boxed Warning: Concurrent Opioid')));

    // 4. Polysubstance Alcohol co-use
    const alcoholCoUse = evaluateBenzoTaperRisk({
      drugId: 'diazepam',
      dailyDoseMg: 10,
      durationWeeks: 8,
      polysubstanceAlcohol: true
    });
    assert.ok(alcoholCoUse.alerts.some((a) => a.titleEn.includes('Alcohol + Benzodiazepines')));

    // 5. Flumazenil contraindication is universally attached
    assert.ok(emg.alerts.some((a) => a.severity === 'critical_black_box'));
  });

  test('formatBenzoClinicianProposalText produces comprehensive bilingual proposals with zero PII', () => {
    const { formatBenzoClinicianProposalText } = benzoModule;
    const mockState = {
      selectedDrug: 'alprazolam',
      dailyDoseMg: 2,
      durationWeeks: 24,
      polysubstanceOpioid: true
    };

    const textEn = formatBenzoClinicianProposalText(mockState, false);
    assert.ok(textEn.includes('HARBORPATH - CLINICAL BENZODIAZEPINE DEPRESCRIBING PROPOSAL'));
    assert.ok(textEn.includes('Alprazolam (Xanax)'));
    assert.ok(textEn.includes('40 mg Diazepam'));
    assert.ok(textEn.includes('FLUMAZENIL'));
    assert.ok(textEn.includes('Naloxone'));
    assert.ok(!textEn.includes('undefined'));
    assert.ok(!textEn.includes('null'));

    const textEs = formatBenzoClinicianProposalText(mockState, true);
    assert.ok(textEs.includes('HARBORPATH - PROPUESTA DE DESESCALADA GRADUAL DE BENZODIAZEPINAS'));
    assert.ok(textEs.includes('Alprazolam (Xanax)'));
    assert.ok(textEs.includes('40 mg de Diazepam'));
    assert.ok(textEs.includes('FLUMAZENIL'));
    assert.ok(textEs.includes('Naloxona'));
    assert.ok(!textEs.includes('undefined'));
  });

  test('In-RAM state management maintains, updates, and deterministically resets without storage leakage', () => {
    const { getBenzodiazepineState, setBenzodiazepineState, resetBenzodiazepineState } = benzoModule;
    resetBenzodiazepineState();
    const initial = getBenzodiazepineState();
    assert.strictEqual(initial.selectedDrug, 'alprazolam');
    assert.strictEqual(initial.dailyDoseMg, 2.0);
    assert.strictEqual(initial.currentTab, 'calculator');
    assert.deepStrictEqual(initial.bindChecklist, []);

    setBenzodiazepineState({
      selectedDrug: 'lorazepam',
      dailyDoseMg: 3.0,
      currentTab: 'bind',
      bindChecklist: ['tinnitus', 'hyperacusis']
    });

    const updated = getBenzodiazepineState();
    assert.strictEqual(updated.selectedDrug, 'lorazepam');
    assert.strictEqual(updated.dailyDoseMg, 3.0);
    assert.strictEqual(updated.currentTab, 'bind');
    assert.deepStrictEqual(updated.bindChecklist, ['tinnitus', 'hyperacusis']);

    resetBenzodiazepineState();
    const resetState = getBenzodiazepineState();
    assert.strictEqual(resetState.selectedDrug, 'alprazolam');
    assert.strictEqual(resetState.dailyDoseMg, 2.0);
    assert.deepStrictEqual(resetState.bindChecklist, []);
  });

  test('benzodiazepineCareView mounts semantic, accessible DOM structure across tabs', () => {
    const { benzodiazepineCareView, resetBenzodiazepineState } = benzoModule;
    resetBenzodiazepineState();
    const el = benzodiazepineCareView();
    assert.ok(el);
    assert.strictEqual(el.tagName, 'DIV');
    assert.ok(el.classList.contains('benzo-care-view'));

    // Check Breadcrumb & Heading
    const h1 = el.querySelector('h1');
    assert.ok(h1);
    assert.ok(h1.textContent.toLowerCase().includes('benzo'));

    // Check Tab buttons
    const tabBtns = el.querySelectorAll('.sub-nav-tab-btn');
    assert.strictEqual(tabBtns.length, 4);

    // Check Calculator Form Elements
    assert.ok(el.querySelector('#benzo-drug-select'));
    assert.ok(el.querySelector('#benzo-dose-input'));
    assert.ok(el.querySelector('#benzo-duration-input'));
    assert.ok(el.querySelector('#chk-abrupt'));
    assert.ok(el.querySelector('.data-table'));
    assert.ok(el.querySelector('.proposal-preview-box'));

    resetBenzodiazepineState();
  });

  test('Static audit: zero localStorage, sessionStorage, cookie, innerHTML, or style= writes', () => {
    const filePath = path.resolve('public/js/views/benzodiazepineCare.js');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
