import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as popHelpers from '../public/js/views/populationHelpers.js';
import * as navModule from '../public/js/views/navigator.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, '..');
const serviceCodesRaw = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'data', 'service-codes.json'), 'utf8'),
);

// Build the set of all official SAMHSA service codes from data/service-codes.json
const VALID_SAMHSA_CODES = new Set(
  serviceCodesRaw.categories.flatMap((cat) =>
    (cat.services ?? []).map((svc) => svc.code),
  ),
);

const {
  recommendForPregnancy,
  recommendForYouth,
  recommendForJusticeInvolved,
  recommendForOlderAdults,
  recommendForStimulants,
  recommendForXylazine,
  recommendForCoOccurring,
  ALL_POPULATION_RECOMMENDERS,
} = popHelpers;

const {
  evaluateAsamCare,
  scoreOpioidWithdrawal,
  scoreAlcoholSedativeRisk,
  evaluateTransitionRisk,
  formatAsamHandoffText,
  careNavigatorView,
} = navModule;

class MockNode {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.className = '';
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this._textContent = '';
    this.isConnected = true;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return (
      this._textContent +
      this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('')
    );
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'hidden') this.hidden = true;
    if (k === 'value') this.value = val;
    if (k === 'checked') this.checked = true;
  }

  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'hidden') this.hidden = false;
  }

  addEventListener(evt, fn) {
    this.listeners[evt] = fn;
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string') {
        const textNode = new MockNode('#text');
        textNode._textContent = item;
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
  }

  querySelector(selector) {
    if (selector === 'input') {
      return this.findAll((n) => n.tagName === 'INPUT')[0] ?? null;
    }
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      return this.findAll((n) => n.attributes.id === id)[0] ?? null;
    }
    return null;
  }

  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(pred, acc);
    }
    return acc;
  }
}

describe('populationHelpers.js — Phase 1 Population Recommender Contracts', () => {
  it('exports all 7 population recommenders and ALL_POPULATION_RECOMMENDERS map', () => {
    const expectedFns = [
      ['pregnancy', recommendForPregnancy],
      ['youth', recommendForYouth],
      ['justice', recommendForJusticeInvolved],
      ['older', recommendForOlderAdults],
      ['stimulants', recommendForStimulants],
      ['xylazine', recommendForXylazine],
      ['coOccurring', recommendForCoOccurring],
    ];

    assert.ok(ALL_POPULATION_RECOMMENDERS && typeof ALL_POPULATION_RECOMMENDERS === 'object');
    for (const [key, fn] of expectedFns) {
      assert.equal(typeof fn, 'function', `Expected ${key} recommender function to be exported`);
      assert.equal(
        ALL_POPULATION_RECOMMENDERS[key],
        fn,
        `Expected ALL_POPULATION_RECOMMENDERS.${key} to reference ${fn.name}`,
      );
    }
  });

  it('verifies every population recommender returns valid SAMHSA service codes, non-empty guidance, and valid #/treatment searchHref', () => {
    for (const [key, recommender] of Object.entries(ALL_POPULATION_RECOMMENDERS)) {
      const result = recommender();
      assert.ok(result && typeof result === 'object', `${key} must return an object`);
      assert.ok(
        Array.isArray(result.codes) && result.codes.length >= 3 && result.codes.length <= 8,
        `${key} must return between 3 and 8 SAMHSA codes`,
      );
      assert.equal(
        new Set(result.codes).size,
        result.codes.length,
        `${key} codes must not contain duplicates`,
      );

      for (const code of result.codes) {
        assert.ok(
          VALID_SAMHSA_CODES.has(code),
          `${key} returned "${code}", which is not in data/service-codes.json`,
        );
      }

      assert.equal(typeof result.guidance, 'string', `${key} guidance must be a string`);
      assert.ok(result.guidance.trim().length > 20, `${key} guidance must be descriptive`);
      assert.equal(
        result.searchHref,
        `#/treatment?codes=${result.codes.join(',')}`,
        `${key} searchHref must match its recommended codes`,
      );
    }
  });

  it('enforces clinical pathway specifics across all 7 population helpers', () => {
    const preg = recommendForPregnancy();
    for (const c of ['PW', 'HI', 'DT', 'MD']) assert.ok(preg.codes.includes(c));
    assert.match(preg.guidance, /ACOG|Pregnancy|postpartum/i);

    const youth = recommendForYouth();
    for (const c of ['ADOL', 'YA', 'IOP', 'RES', 'TELE']) assert.ok(youth.codes.includes(c));
    assert.match(youth.guidance, /Adolescents|young adults|consent/i);

    const justice = recommendForJusticeInvolved();
    for (const c of ['CJ', 'OTP', 'BU', 'OP', 'NOE']) assert.ok(justice.codes.includes(c));
    assert.match(justice.guidance, /overdose|post-release|MOUD|NOE/i);

    const older = recommendForOlderAdults();
    for (const c of ['SEN', 'OP', 'MD', 'MHSU']) assert.ok(older.codes.includes(c));
    assert.match(older.guidance, /Older adults|comorbidity|Medicare|Medicaid/i);

    const stim = recommendForStimulants();
    for (const c of ['CMI', 'OP', 'TELE', 'MHSU']) assert.ok(stim.codes.includes(c));
    assert.match(stim.guidance, /Contingency management|CMI/i);

    const xyl = recommendForXylazine();
    for (const c of ['BU', 'OTP', 'DT', 'NOE']) assert.ok(xyl.codes.includes(c));
    assert.match(xyl.guidance, /alpha-2|clonidine|tizanidine|wound/i);

    const co = recommendForCoOccurring();
    for (const c of ['MHSU', 'TRMA', 'IOP', 'OP']) assert.ok(co.codes.includes(c));
    assert.match(co.guidance, /Co-occurring|dual-diagnosis|trauma/i);
  });

  it('evaluates evaluatePopulationPathways when exported after Sub-Agent 1 merge', () => {
    if (typeof popHelpers.evaluatePopulationPathways !== 'function') return;

    const out = popHelpers.evaluatePopulationPathways({
      pregnancy: true,
      xylazine: true,
      justice: true,
      youth: true,
    });
    assert.ok(out && typeof out === 'object');
    if (Array.isArray(out.codes)) {
      for (const c of out.codes) {
        assert.ok(VALID_SAMHSA_CODES.has(c), `Expected valid SAMHSA code ${c}`);
      }
    }
    if (Array.isArray(out.pathways)) {
      assert.ok(out.pathways.length >= 1);
    }
  });
});

describe('navigator.js — 4 Priority Clinical Pathways & ASAM Integration', () => {
  it('Pathway 1 (Pregnancy / Postpartum): follows ACOG standards -> PW, BU, HI/DT when severe, MD', () => {
    const mildPerinatal = evaluateAsamCare({
      substances: ['opioids'],
      withdrawalRisk: 'mild',
      biomedical: 'pregnant',
      payment: 'MD',
    });
    assert.ok(mildPerinatal.codes.includes('PW'), 'Must include PW');
    assert.ok(mildPerinatal.codes.includes('BU'), 'Must include BU');
    assert.ok(mildPerinatal.codes.includes('MD'), 'Must include MD');
    assert.ok(!mildPerinatal.codes.includes('DT'), 'Mild opioid withdrawal in pregnancy avoids abrupt detox');
    assert.ok(
      mildPerinatal.redFlags.some((r) => /ACOG|ASAM|buprenorphine|methadone|fetal/i.test(r)),
      'Must warn against abrupt opioid detox in pregnancy per ACOG/ASAM',
    );

    const highAcuityPerinatal = evaluateAsamCare({
      substances: ['opioids', 'alcohol'],
      withdrawalRisk: 'severe',
      biomedical: 'pregnant',
      payment: 'MD',
    });
    assert.equal(highAcuityPerinatal.asamLevel, 'ASAM Level 3.7-WM / 4.0');
    for (const c of ['DT', 'HI', 'PW', 'BU', 'MD']) {
      assert.ok(highAcuityPerinatal.codes.includes(c), `Expected ${c} in high-acuity perinatal care`);
    }

    for (const c of highAcuityPerinatal.codes) {
      assert.ok(VALID_SAMHSA_CODES.has(c), `Invalid SAMHSA code ${c}`);
    }
  });

  it('Pathway 2 (Youth / Adolescents): routes ADOL and YA populations with age-appropriate settings', () => {
    const adolIop = evaluateAsamCare({
      substances: ['opioids', 'stimulants'],
      withdrawalRisk: 'mild',
      structureNeeded: 'structured_day',
      population: 'ADOL',
      preferTelehealth: true,
    });
    assert.equal(adolIop.asamLevel, 'ASAM Level 2.1 / 2.5');
    for (const c of ['IOP', 'BU', 'CMI', 'TELE', 'ADOL']) {
      assert.ok(adolIop.codes.includes(c), `Expected ${c} for adolescent IOP pathway`);
    }

    const yaRes = evaluateAsamCare({
      substances: ['alcohol'],
      withdrawalRisk: 'none',
      environment: 'unhoused',
      structureNeeded: '24_hour',
      population: 'YA',
    });
    assert.equal(yaRes.asamLevel, 'ASAM Level 3.1 / 3.5 / 3.7');
    for (const c of ['RES', 'HH', 'PMAT', 'YA']) {
      assert.ok(yaRes.codes.includes(c), `Expected ${c} for young adult residential pathway`);
    }
  });

  it('Pathway 3 (Justice Reentry): flags post-release opioid tolerance loss, CJ code, MOUD, and naloxone', () => {
    const transition = evaluateTransitionRisk({
      event: 'post_release',
      daysSince: 'under_7',
      onMoud: false,
      hasNaloxone: false,
    });
    assert.equal(transition.riskBand, 'critical');
    for (const c of ['CJ', 'BU', 'NOE', 'PEER']) {
      assert.ok(transition.recommendedCodes.includes(c), `Expected ${c} in post-release transition`);
      assert.ok(VALID_SAMHSA_CODES.has(c), `Expected ${c} to be a valid SAMHSA code`);
    }
    assert.match(transition.physiologicalWhy, /tolerance|incarceration|fentanyl/i);
    assert.ok(transition.actionSteps.some((s) => /1306\.07\(b\)|72-Hour Rule/i.test(s)));
    assert.ok(transition.actionSteps.some((s) => /Never Use Alone|SafeSpot/i.test(s)));
    assert.ok(transition.actionSteps.some((s) => /CJ|PEER|Medicaid/i.test(s)));
    assert.equal(transition.searchHref, `#/treatment?codes=${transition.recommendedCodes.join(',')}`);

    // Compare with protected post-release profile (on MOUD + carries naloxone + >28 days)
    const protectedTransition = evaluateTransitionRisk({
      event: 'post_release',
      daysSince: 'over_28',
      onMoud: true,
      hasNaloxone: true,
    });
    assert.equal(protectedTransition.riskBand, 'baseline');

    // Also verify post_overdose, post_detox_hospital, post_naltrexone, and baseline 'none'
    for (const evt of ['post_overdose', 'post_detox_hospital', 'post_naltrexone']) {
      const res = evaluateTransitionRisk({ event: evt, daysSince: 'under_7', onMoud: false, hasNaloxone: false });
      assert.equal(res.riskBand, 'critical', `Expected critical riskBand for ${evt}`);
      assert.ok(res.recommendedCodes.includes('BU'));
      assert.ok(res.recommendedCodes.includes('NOE'));
    }
    const base = evaluateTransitionRisk({ event: 'none', onMoud: false, hasNaloxone: false });
    assert.equal(base.riskBand, 'baseline');
    assert.ok(base.recommendedCodes.includes('NOE'));

    // ASAM Care Navigator with CJ population
    const cjAsam = evaluateAsamCare({
      substances: ['opioids'],
      withdrawalRisk: 'moderate',
      population: 'CJ',
      payment: 'MD',
    });
    assert.ok(cjAsam.codes.includes('CJ'));
    assert.ok(cjAsam.codes.includes('BU'));
    assert.ok(cjAsam.codes.includes('MD'));
  });

  it('Pathway 4 (Xylazine / Medetomidine exposure): addresses alpha-2 adrenergic rebound and necrotic wound care', () => {
    const xylAsam = evaluateAsamCare({
      substances: ['opioids', 'xylazine'],
      withdrawalRisk: 'moderate',
      biomedical: 'acute_infection',
    });
    assert.equal(xylAsam.asamLevel, 'ASAM Level 3.7-WM / 4.0');
    assert.ok(xylAsam.codes.includes('DT'));
    assert.ok(xylAsam.codes.includes('HI'));
    assert.ok(xylAsam.codes.includes('BU'));
    assert.ok(
      xylAsam.redFlags.some((r) => /Xylazine|medetomidine|alpha-2/i.test(r)),
      'Expected xylazine/medetomidine alpha-2 rebound red flag',
    );
    assert.ok(
      xylAsam.redFlags.some((r) => /EMTALA|endocarditis|sepsis|wound/i.test(r)),
      'Expected acute infection / EMTALA red flag',
    );
    assert.ok(
      xylAsam.clinicalNotes.some((n) => /clonidine|tizanidine|dexmedetomidine/i.test(n) && /saline|wound/i.test(n)),
      'Expected clinical note on alpha-2 agonists and wound care',
    );

    const severeOpioidCalc = scoreOpioidWithdrawal({
      restlessness: 4,
      sweating_chills: 4,
      muscle_bone_aches: 4,
      gi_upset: 4,
      runny_nose_tearing: 4,
      tremor_gooseflesh: 2,
    });
    assert.equal(severeOpioidCalc.score, 22);
    assert.equal(severeOpioidCalc.navWithdrawalRisk, 'severe');
    assert.match(severeOpioidCalc.bupGuidance, /xylazine|clonidine|tizanidine/i);
    assert.match(severeOpioidCalc.bupGuidance, /1306\.07\(b\)/);

    const alcCalc = scoreAlcoholSedativeRisk({
      dailyHeavyUse: true,
      priorSeizuresOrDTs: true,
      autonomicInstability: true,
    });
    assert.equal(alcCalc.riskLevel, 'high_seizure_dt_risk');
    assert.equal(alcCalc.navWithdrawalRisk, 'severe');
  });

  it('executes careNavigatorView, formatAsamHandoffText, and optional state helpers in Node without DOM crashes or shell artifacts', () => {
    // 1. Verify no unexpanded shell substitutions in navigator.js or populationHelpers.js
    for (const rel of ['public/js/views/navigator.js', 'public/js/views/populationHelpers.js']) {
      const src = fs.readFileSync(path.join(rootDir, rel), 'utf8');
      assert.ok(src.length > 500, `${rel} must not be truncated`);
      assert.doesNotMatch(src.slice(0, 200), /^\s*\$\(\s*(cat|echo|printf)|^\s*<<-?\s*['"]?EOF/);
    }

    // 2. Render careNavigatorView with MockNode DOM shim
    const prevDoc = globalThis.document;
    const prevNode = globalThis.Node;
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };

    try {
      const view = careNavigatorView({
        query: new URLSearchParams('payment=MD&population=CJ&tele=1'),
      });
      assert.ok(view instanceof MockNode);
      const text = view.textContent;
      assert.match(text, /Care Navigator/i);
      assert.match(text, /ASAM Level 1\.0 \/ 1\.5/);
      assert.match(text, /EMTALA/);
      assert.match(text, /21 CFR § 1306\.07\(b\)/);
      assert.match(text, /42 CFR Part 2/);

      // Trigger reset button click inside rendered view
      const resetBtns = view.findAll(
        (n) => n.tagName === 'BUTTON' && /Reset all answers/i.test(n.textContent),
      );
      assert.ok(resetBtns.length >= 1, 'Expected Reset all answers button');
      assert.doesNotThrow(() => resetBtns[0].listeners.click?.());

      // Test formatAsamHandoffText
      const handoff = formatAsamHandoffText({
        substances: ['opioids', 'xylazine'],
        withdrawalRisk: 'moderate',
        biomedical: 'pregnant',
        payment: 'MD',
        population: 'CJ',
      });
      assert.match(handoff, /This is not a diagnosis or a clinical assessment/);
      assert.match(handoff, /PW \(Pregnant \/ Postpartum Specialty\)/);
      assert.match(handoff, /CJ \(Justice-Involved Support\)/);

      // Test getNavigatorHandoffState / resetNavigatorState if exported after Sub-Agent 1 merge
      if (typeof navModule.resetNavigatorState === 'function') {
        assert.doesNotThrow(() => navModule.resetNavigatorState());
      }
      if (typeof navModule.getNavigatorHandoffState === 'function') {
        const stateSnapshot = navModule.getNavigatorHandoffState();
        assert.ok(stateSnapshot === null || typeof stateSnapshot === 'object');
      }
    } finally {
      globalThis.document = prevDoc;
      globalThis.Node = prevNode;
    }
  });
});
