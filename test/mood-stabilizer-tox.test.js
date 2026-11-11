// test/mood-stabilizer-tox.test.js
// Wave 67: Unit & DOM Accessibility Tests for Mood-Stabilizer Toxicity Navigator
// Lithium (Acute & Chronic), Valproate Hyperammonemia (VHE / IV L-Carnitine), and Lamotrigine (NaHCO3 & 4-Day Restart Rule).

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  MOOD_STABILIZER_PROFILES,
  MOOD_STABILIZER_RED_FLAGS,
  MOOD_STABILIZER_TABS,
  calculateCarnitineAndDialysis,
  evaluateMoodStabilizerRisk,
  formatMoodStabilizerSbarText,
  getMoodStabilizerToxState,
  updateMoodStabilizerToxState,
  resetMoodStabilizerToxState,
  subscribeMoodStabilizerToxState,
  moodStabilizerToxView,
} from '../public/js/views/moodStabilizerTox.js';
import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import { installMockDom } from './fixtures/mockDomHelper.js';

test('Mood-Stabilizer Profiles & Red Flags: clinical taxonomy and black-box prohibitions', () => {
  assert.ok(MOOD_STABILIZER_PROFILES.lithium_chronic_acute_on_chronic);
  assert.ok(MOOD_STABILIZER_PROFILES.lithium_acute_naive);
  assert.ok(MOOD_STABILIZER_PROFILES.valproate_hyperammonemia_vhe);
  assert.ok(MOOD_STABILIZER_PROFILES.lamotrigine_cardiotox_sjs);

  // Chronic lithium: lower serum toxicity + diuretic/Kayexalate prohibitions + NDI Na+ warning
  const chronicLi = MOOD_STABILIZER_PROFILES.lithium_chronic_acute_on_chronic;
  assert.match(chronicLi.mechanism, /1\.5-2\.5\+ mEq\/L/);
  assert.match(chronicLi.mechanism, /Nephrogenic Diabetes Insipidus/i);
  assert.match(chronicLi.blackBoxContraindication, /NO LOOP\/THIAZIDE DIURETICS/i);
  assert.match(chronicLi.blackBoxContraindication, /KAYEXALATE/i);
  assert.match(chronicLi.contraindicationDetail, /0\.9% NaCl/i);

  // Acute lithium: 12-24h CNS penetration lag, 4h serial levels, WBI
  const acuteLi = MOOD_STABILIZER_PROFILES.lithium_acute_naive;
  assert.match(acuteLi.mechanism, /12-24h CNS penetration/i);
  assert.match(acuteLi.firstLineAntidote, /serial serum lithium levels every 4 hours/i);
  assert.match(acuteLi.firstLineAntidote, /Whole Bowel Irrigation/i);
  assert.match(acuteLi.contraindicationDetail, /Activated charcoal does NOT adsorb/i);

  // Valproate: VHE with normal LFTs, IV L-Carnitine, Carbapenem contraindication
  const vpa = MOOD_STABILIZER_PROFILES.valproate_hyperammonemia_vhe;
  assert.match(vpa.mechanism, /NORMAL LFTs/i);
  assert.match(vpa.firstLineAntidote, /100 mg\/kg.*6 g.*50 mg\/kg.*3 g/i);
  assert.match(vpa.blackBoxContraindication, /CARBAPENEM/i);
  assert.match(vpa.contraindicationDetail, /60-100%.*status epilepticus/i);

  // Lamotrigine: QRS > 100 ms NaHCO3 + 4-Day Miss Restart-From-25mg Rule
  const ltg = MOOD_STABILIZER_PROFILES.lamotrigine_cardiotox_sjs;
  assert.match(ltg.mechanism, /QRS widening > 100 ms/i);
  assert.match(ltg.firstLineAntidote, /8\.4% Sodium Bicarbonate.*1-2 mEq\/kg/i);
  assert.match(ltg.blackBoxContraindication, /4-DAY MISS RESTART-FROM-25mg RULE/i);
  assert.match(ltg.contraindicationDetail, /SJS\/TEN/i);

  assert.equal(MOOD_STABILIZER_RED_FLAGS.length, 6);
  for (const flag of MOOD_STABILIZER_RED_FLAGS) {
    assert.ok(flag.id && flag.label && flag.labelEs);
  }
});

test('calculateCarnitineAndDialysis: L-Carnitine weight dosing and 6g / 3g caps', () => {
  // 45 kg patient: under cap (4500 mg load, 2250 mg q8h)
  const dose45 = calculateCarnitineAndDialysis(45, 'valproate_hyperammonemia_vhe', 0, 500, false, false);
  assert.equal(dose45.carnitineLoadMg, 4500);
  assert.equal(dose45.carnitineLoadGrams, 4.5);
  assert.equal(dose45.carnitineLoadCapped, false);
  assert.equal(dose45.carnitineMaintMgQ8h, 2250);
  assert.equal(dose45.carnitineMaintGramsQ8h, 2.25);
  assert.equal(dose45.carnitineMaintCapped, false);

  // 60 kg boundary: exactly 6000 mg load / 3000 mg maint
  const dose60 = calculateCarnitineAndDialysis(60, 'valproate_hyperammonemia_vhe', 0, 500, false, false);
  assert.equal(dose60.carnitineLoadMg, 6000);
  assert.equal(dose60.carnitineLoadCapped, false);
  assert.equal(dose60.carnitineMaintMgQ8h, 3000);
  assert.equal(dose60.carnitineMaintCapped, false);

  // 95 kg patient: capped at 6000 mg (6 g) load and 3000 mg (3 g) q8h
  const dose95 = calculateCarnitineAndDialysis(95, 'valproate_hyperammonemia_vhe', 0, 500, false, false);
  assert.equal(dose95.carnitineLoadMg, 6000);
  assert.equal(dose95.carnitineLoadCapped, true);
  assert.equal(dose95.carnitineMaintMgQ8h, 3000);
  assert.equal(dose95.carnitineMaintCapped, true);

  // NaHCO3 & 20% ILE calculations for 80 kg
  const dose80 = calculateCarnitineAndDialysis(80, 'lamotrigine_cardiotox_sjs', 0, 0, false, false);
  assert.equal(dose80.nahco3MinMeq, 80);
  assert.equal(dose80.nahco3MaxMeq, 160);
  assert.equal(dose80.ileBolusMl, 120);

  // Invalid weight defaults safely to 70 kg
  const doseInvalid = calculateCarnitineAndDialysis('abc', 'valproate_hyperammonemia_vhe', 0, 0, false, false);
  assert.equal(doseInvalid.weightKg, 70);
  assert.equal(doseInvalid.carnitineLoadMg, 6000);
});

test('calculateCarnitineAndDialysis: EXTRIP hemodialysis criteria for Lithium and Valproate', () => {
  // Lithium > 4.0 WITHOUT AKI and WITHOUT CNS -> consider_hd
  const li42NoAki = calculateCarnitineAndDialysis(70, 'lithium_acute_naive', 4.2, 0, false, false);
  assert.equal(li42NoAki.hdRecommendation, 'consider_hd');

  // Lithium > 4.0 WITH AKI -> recommend_hd
  const li42Aki = calculateCarnitineAndDialysis(70, 'lithium_acute_naive', 4.2, 0, true, false);
  assert.equal(li42Aki.hdRecommendation, 'recommend_hd');

  // Lithium > 5.0 regardless -> recommend_hd
  const li52 = calculateCarnitineAndDialysis(70, 'lithium_acute_naive', 5.2, 0, false, false);
  assert.equal(li52.hdRecommendation, 'recommend_hd');

  // Chronic Lithium at modest 2.0 mEq/L WITH CNS impairment -> recommend_hd
  const chronicLiCns = calculateCarnitineAndDialysis(70, 'lithium_chronic_acute_on_chronic', 2.0, 0, false, true);
  assert.equal(chronicLiCns.hdRecommendation, 'recommend_hd');

  // Chronic Lithium at 1.9 mEq/L WITHOUT CNS or AKI -> saline_rehydration
  const chronicLiMild = calculateCarnitineAndDialysis(70, 'lithium_chronic_acute_on_chronic', 1.9, 0, false, false);
  assert.equal(chronicLiMild.hdRecommendation, 'saline_rehydration');

  // Valproate > 900 mg/L WITH coma/CNS -> recommend_hd
  const vpa950Coma = calculateCarnitineAndDialysis(70, 'valproate_hyperammonemia_vhe', 0, 950, false, true);
  assert.equal(vpa950Coma.hdRecommendation, 'recommend_hd');

  // Valproate > 1300 mg/L -> recommend_hd
  const vpa1350 = calculateCarnitineAndDialysis(70, 'valproate_hyperammonemia_vhe', 0, 1350, false, false);
  assert.equal(vpa1350.hdRecommendation, 'recommend_hd');

  // Valproate > 900 mg/L without coma/AKI -> consider_hd
  const vpa950Stable = calculateCarnitineAndDialysis(70, 'valproate_hyperammonemia_vhe', 0, 950, false, false);
  assert.equal(vpa950Stable.hdRecommendation, 'consider_hd');

  // Valproate 600 mg/L without coma/AKI -> saline_rehydration (antidote L-Carnitine primary)
  const vpa600 = calculateCarnitineAndDialysis(70, 'valproate_hyperammonemia_vhe', 0, 600, false, false);
  assert.equal(vpa600.hdRecommendation, 'saline_rehydration');
});

test('evaluateMoodStabilizerRisk: stratifies all 4 severity tiers and clinical guardrails', () => {
  // 1. Baseline
  resetMoodStabilizerToxState();
  const baseEval = evaluateMoodStabilizerRisk(getMoodStabilizerToxState());
  assert.equal(baseEval.riskTier, 'baseline');

  // 2. Emergency Hemodialysis (Lithium > 4.0 + AKI)
  const liHdEval = evaluateMoodStabilizerRisk({
    agentId: 'lithium_acute_naive',
    weightKg: '80',
    lithiumMeq: '4.4',
    creatinineElevated: true,
    checkedFlags: new Set(),
  });
  assert.equal(liHdEval.riskTier, 'emergency_hemodialysis');
  assert.ok(liHdEval.alerts.some((a) => /HEMODIALYSIS/i.test(a.titleEn)));

  // 3. Emergency Antidote (Valproate VHE with normal LFTs flag)
  const vheEval = evaluateMoodStabilizerRisk({
    agentId: 'valproate_hyperammonemia_vhe',
    weightKg: '75',
    valproateMgL: '320',
    ammoniaUmolL: '140',
    checkedFlags: new Set(['flag_valproate_normal_lft_coma']),
  });
  assert.equal(vheEval.riskTier, 'emergency_antidote');
  assert.equal(vheEval.valproateVheTriggered, true);
  assert.ok(vheEval.alerts.some((a) => /NORMAL LFTs/i.test(a.titleEn)));
  assert.ok(vheEval.actions.some((a) => /6000 mg/.test(a.textEn)));

  // 4. Emergency Antidote (Lamotrigine wide QRS > 100 ms)
  const ltgQrsEval = evaluateMoodStabilizerRisk({
    agentId: 'lamotrigine_cardiotox_sjs',
    weightKg: '70',
    qrsMs: '122',
    checkedFlags: new Set(),
  });
  assert.equal(ltgQrsEval.riskTier, 'emergency_antidote');
  assert.equal(ltgQrsEval.lamotrigineCardiotoxTriggered, true);
  assert.ok(ltgQrsEval.actions.some((a) => /8\.4% NaHCO3.*70-140 mEq/i.test(a.textEn)));

  // 5. Urgent Monitoring (Lamotrigine >= 4-day missed restart rule)
  const ltg4DayEval = evaluateMoodStabilizerRisk({
    agentId: 'lamotrigine_cardiotox_sjs',
    weightKg: '70',
    daysMissedLamotrigine: '4',
    checkedFlags: new Set(),
  });
  assert.equal(ltg4DayEval.riskTier, 'urgent_monitoring');
  assert.equal(ltg4DayEval.lamotrigineRestartHazard, true);
  assert.ok(ltg4DayEval.alerts.some((a) => /RESTART-FROM-25mg/i.test(a.titleEn)));
  assert.ok(ltg4DayEval.alerts.some((a) => /REINICIAR DESDE 25 mg/i.test(a.titleEs)));
});

test('formatMoodStabilizerSbarText: bilingual EN/ES zero-PII SBAR formatting', () => {
  const state = {
    agentId: 'valproate_hyperammonemia_vhe',
    weightKg: '82',
    valproateMgL: '980',
    ammoniaUmolL: '165',
    cnsImpaired: true,
    checkedFlags: new Set(['flag_valproate_normal_lft_coma']),
  };

  const sbarEn = formatMoodStabilizerSbarText(state, 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF REPORT: MOOD-STABILIZER TOXICOLOGY/);
  assert.match(sbarEn, /Zero PII/);
  assert.match(sbarEn, /RECOMMEND_HD/);
  assert.match(sbarEn, /Load 6000 mg \(6 g; 100 mg\/kg, max 6 g\)/);
  assert.match(sbarEn, /CARBAPENEM/);

  const sbarEs = formatMoodStabilizerSbarText(state, 'es');
  assert.match(sbarEs, /REPORTE CLÍNICO SBAR: TOXICIDAD POR ESTABILIZADORES DEL ÁNIMO/);
  assert.match(sbarEs, /Cero PII/);
  assert.match(sbarEs, /RECOMMEND_HD/);
  assert.match(sbarEs, /Carga 6000 mg \(6 g; 100 mg\/kg, máx 6 g\)/);
  assert.match(sbarEs, /CARBAPENÉMICOS/);
});

test('Ephemeral state lifecycle: get, update, subscribe, reset without storage', () => {
  resetMoodStabilizerToxState();
  assert.equal(getMoodStabilizerToxState().agentId, 'lithium_chronic_acute_on_chronic');

  let updates = 0;
  const unsub = subscribeMoodStabilizerToxState(() => {
    updates += 1;
  });

  updateMoodStabilizerToxState({ weightKg: '64', lithiumMeq: '4.6', creatinineElevated: true });
  assert.equal(getMoodStabilizerToxState().weightKg, '64');
  assert.equal(getMoodStabilizerToxState().lithiumMeq, '4.6');
  assert.equal(getMoodStabilizerToxState().creatinineElevated, true);
  assert.equal(updates, 1);

  unsub();
  updateMoodStabilizerToxState({ valproateMgL: '500' });
  assert.equal(updates, 1);

  resetMoodStabilizerToxState();
  assert.equal(getMoodStabilizerToxState().lithiumMeq, '');
  assert.equal(getMoodStabilizerToxState().creatinineElevated, false);
});

test('DOM View: route-return & container mount, WAI-ARIA tabs, focus preservation, wasConnected cleanup & ES mode', async () => {
  const uninstall = installMockDom();
  try {
    resetMoodStabilizerToxState();

    // 1. Route-return call ({ meta })
    const routeRoot = moodStabilizerToxView({ meta: { version: '1.0' } });
    assert.ok(routeRoot, 'View renders when called with { meta } options');
    assert.ok(routeRoot.querySelector('#page-title'), 'Page title heading present');

    // Verify WAI-ARIA tablist and matching tabpanels
    const tablist = routeRoot.querySelector('[role="tablist"]');
    assert.ok(tablist, 'Tablist exists');
    const tabs = routeRoot.querySelectorAll('[role="tab"]');
    assert.equal(tabs.length, MOOD_STABILIZER_TABS.length);
    for (const tab of tabs) {
      assert.equal(tab.getAttribute('type'), 'button', 'Every tab button has type="button"');
      const controls = tab.getAttribute('aria-controls');
      assert.ok(controls, 'Tab has aria-controls');
      const panel = routeRoot.querySelector(`#${controls}`);
      assert.ok(panel, `Tabpanel #${controls} exists in DOM`);
      assert.equal(panel.getAttribute('role'), 'tabpanel');
      assert.equal(panel.getAttribute('aria-labelledby'), tab.getAttribute('id'));
    }

    // Verify all buttons have type="button"
    const buttons = routeRoot.querySelectorAll('button');
    assert.ok(buttons.length > 0);
    for (const btn of buttons) {
      assert.equal(btn.getAttribute('type'), 'button', `Button "${btn.textContent}" must have type="button"`);
    }

    // Verify all inputs, selects, and textareas have label[for] or aria-label
    const labels = routeRoot.querySelectorAll('label');
    const labelFors = new Set(labels.map((l) => l.getAttribute('for')).filter(Boolean));
    for (const field of [
      ...routeRoot.querySelectorAll('input'),
      ...routeRoot.querySelectorAll('select'),
      ...routeRoot.querySelectorAll('textarea'),
    ]) {
      const id = field.getAttribute('id');
      const hasFor = Boolean(id && labelFors.has(id));
      const hasAria = Boolean(field.getAttribute('aria-label'));
      assert.ok(hasFor || hasAria, `Control ${field.tagName}#${id || '(no-id)'} must have <label for> or aria-label`);
    }

    // Verify textarea is mounted without value attribute from h() props, and has live SBAR text
    const sbarEl = routeRoot.querySelector('#mst-sbar-textarea');
    assert.ok(sbarEl);
    assert.equal(sbarEl.hasAttribute('value'), false, 'Textarea must never receive value attribute via h() props');
    assert.match(sbarEl.value, /SBAR CLINICAL HANDOFF REPORT/);

    // Verify persistent inputs keep identity and preserve focus across state updates
    const weightBefore = routeRoot.querySelector('#mst-weight-input');
    globalThis.document.activeElement = weightBefore;
    weightBefore.value = '88';
    updateMoodStabilizerToxState({ weightKg: '88' });
    const weightAfter = routeRoot.querySelector('#mst-weight-input');
    assert.equal(weightAfter, weightBefore, 'Input node must stay mounted across state updates');
    assert.equal(weightAfter.value, '88', 'Focused input value is preserved while typing');
    globalThis.document.activeElement = null;

    // Verify tab switching updates aria-selected & hidden panel visibility
    const sbarTab = routeRoot.querySelector('#mst-tab-sbar');
    sbarTab.click();
    assert.equal(sbarTab.getAttribute('aria-selected'), 'true');
    assert.equal(routeRoot.querySelector('#mst-panel-sbar').hidden, false);
    assert.equal(routeRoot.querySelector('#mst-panel-triage').hidden, true);

    // Verify copyText works on SBAR button
    let copiedPayload = '';
    globalThis.navigator.clipboard.writeText = async (txt) => {
      copiedPayload = txt;
    };
    const copyQuickBtn = routeRoot.querySelector('.mst-copy-quick-btn');
    copyQuickBtn.click();
    await new Promise((r) => setTimeout(r, 10));
    assert.match(copiedPayload, /Weight: 88 kg/);

    // Verify wasConnected unmount cleanup
    routeRoot.isConnected = true;
    updateMoodStabilizerToxState({ lithiumMeq: '3.1' });
    routeRoot.isConnected = false;
    updateMoodStabilizerToxState({ lithiumMeq: '3.2' });
    // After disconnect cleanup, DOM evaluation text won't refresh for future updates
    const beforeDisconnectedUpdate = routeRoot.querySelector('#mst-sbar-textarea').value;
    updateMoodStabilizerToxState({ lithiumMeq: '5.5' });
    assert.equal(routeRoot.querySelector('#mst-sbar-textarea').value, beforeDisconnectedUpdate);

    // 2. Container mount in Spanish mode
    const hostContainer = globalThis.document.createElement('div');
    useDictionary('es', es);
    try {
      resetMoodStabilizerToxState();
      const esRoot = moodStabilizerToxView(hostContainer);
      assert.equal(hostContainer.children[0], esRoot);
      assert.match(hostContainer.textContent, /Navegador de toxicidad por litio, valproato/i);
      assert.match(esRoot.querySelector('#mst-sbar-textarea').value, /REPORTE CLÍNICO SBAR/);
      if (typeof esRoot._cleanup === 'function') esRoot._cleanup();
    } finally {
      useDictionary('en', {});
    }
  } finally {
    uninstall();
  }
});

test('Security & CSP static audit on public/js/views/moodStabilizerTox.js', () => {
  const src = fs.readFileSync(path.resolve('public/js/views/moodStabilizerTox.js'), 'utf8');
  for (const forbidden of [
    /innerHTML/,
    /outerHTML/,
    /localStorage/,
    /sessionStorage/,
    /document\.cookie/,
    /\beval\s*\(/,
    /new\s+Function/,
    /\bfetch\s*\(/,
    /\.style\./,
    /style\s*:/,
  ]) {
    assert.doesNotMatch(src, forbidden, `Forbidden CSP/storage pattern found: ${forbidden}`);
  }
});
