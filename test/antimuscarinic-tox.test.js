// test/antimuscarinic-tox.test.js
// Wave 67: Comprehensive Unit, Clinical Algorithm, Accessibility, Focus Preservation & Security Tests
// for Antimuscarinic, Diphenhydramine Street-Cut & Psychotropic Delirium Navigator

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  ANTIMUSCARINIC_PROFILES,
  ANTIMUSCARINIC_RED_FLAGS,
  TOXIDROME_DIFFERENTIAL_ROWS,
  calculateBicarbonateAndReversal,
  evaluateAntimuscarinicRisk,
  formatAntimuscarinicSbarText,
  getAntimuscarinicToxState,
  updateAntimuscarinicToxState,
  resetAntimuscarinicToxState,
  subscribeAntimuscarinicToxState,
  antimuscarinicToxView,
} from '../public/js/views/antimuscarinicTox.js';

import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import { installMockDom } from './fixtures/mockDomHelper.js';

test('Antimuscarinic Tox: Profiles, Red Flags & Differential Constants', () => {
  const profileIds = Object.keys(ANTIMUSCARINIC_PROFILES);
  assert.deepEqual(profileIds, [
    'diphenhydramine_fentanyl_cut',
    'plant_alkaloid_scopolamine_datura',
    'tca_doxepin_cyclobenzaprine',
    'antipsychotic_antihistamine_polysubstance',
  ]);

  assert.equal(ANTIMUSCARINIC_PROFILES.tca_doxepin_cyclobenzaprine.physostigmineStrictlyForbidden, true);
  assert.equal(ANTIMUSCARINIC_PROFILES.plant_alkaloid_scopolamine_datura.isPureAnticholinergic, true);
  assert.equal(ANTIMUSCARINIC_PROFILES.diphenhydramine_fentanyl_cut.opioidCoingestionRisk, true);
  assert.equal(ANTIMUSCARINIC_PROFILES.antipsychotic_antihistamine_polysubstance.qtcRisk, true);

  assert.equal(ANTIMUSCARINIC_RED_FLAGS.length, 6);
  assert.ok(ANTIMUSCARINIC_RED_FLAGS.some((f) => f.id === 'flag_qrs_wide_avr'));
  assert.ok(ANTIMUSCARINIC_RED_FLAGS.some((f) => f.id === 'flag_qtc_500'));
  assert.ok(ANTIMUSCARINIC_RED_FLAGS.some((f) => f.id === 'flag_seizure_hyperthermia'));
  assert.ok(ANTIMUSCARINIC_RED_FLAGS.some((f) => f.id === 'flag_delirium_bladder_retention'));
  assert.ok(ANTIMUSCARINIC_RED_FLAGS.some((f) => f.id === 'flag_tca_suspected'));
  assert.ok(ANTIMUSCARINIC_RED_FLAGS.some((f) => f.id === 'flag_fentanyl_apnea'));

  assert.ok(TOXIDROME_DIFFERENTIAL_ROWS.length >= 5);
  assert.ok(TOXIDROME_DIFFERENTIAL_ROWS.some((r) => /DRY/i.test(r.anticholinergicEn) && /DIAPHORETIC/i.test(r.sympathomimeticEn)));
  assert.ok(TOXIDROME_DIFFERENTIAL_ROWS.some((r) => /NO BOWEL SOUNDS/i.test(r.anticholinergicEn)));
});

test('Antimuscarinic Tox: Sodium Bicarbonate Calculation & Antiarrhythmic Guardrails', () => {
  // 1. Wide QRS (>= 100 ms) at 70 kg triggers 70-140 mEq NaHCO3 & blocks physostigmine
  const wide70 = calculateBicarbonateAndReversal(70, 114, false, true);
  assert.equal(wide70.bicarbonateIndicated, true);
  assert.equal(wide70.bicarbonateMinMeq, 70);
  assert.equal(wide70.bicarbonateMaxMeq, 140);
  assert.equal(wide70.qrsRiskTier, 'wide_seizure_and_na_block');
  assert.match(wide70.bicarbonateTargetEn, /QRS < 100 ms.*pH 7\.45-7\.55/);
  assert.match(wide70.antiarrhythmicRuleEn, /AVOID Class Ia\/Ic/i);
  assert.match(wide70.antiarrhythmicRuleEn, /Lidocaine/i);
  assert.equal(wide70.physostigmineEligible, false);
  assert.equal(wide70.physostigmineBlocked, true);
  assert.equal(wide70.blockReason, 'fatal_tca_or_wide_qrs');

  // 2. Extreme QRS (>= 160 ms) at 85 kg -> critical ventricular arrhythmia tier
  const wide168 = calculateBicarbonateAndReversal(85, 168, true, false);
  assert.equal(wide168.bicarbonateIndicated, true);
  assert.equal(wide168.bicarbonateMinMeq, 85);
  assert.equal(wide168.bicarbonateMaxMeq, 170);
  assert.equal(wide168.qrsRiskTier, 'critical_ventricular_arrhythmia');

  // 3. Narrow QRS (< 100 ms) keeps bicarbonate on standby
  const narrow = calculateBicarbonateAndReversal(75, 88, false, true);
  assert.equal(narrow.bicarbonateIndicated, false);
  assert.equal(narrow.qrsRiskTier, 'narrow');
  assert.equal(narrow.bicarbonateMinMeq, 75);
  assert.equal(narrow.bicarbonateMaxMeq, 150);
});

test('Antimuscarinic Tox: Strict Cholinergic Reversal Eligibility Gate (Physostigmine / Rivastigmine)', () => {
  // Case A: Narrow QRS (< 100 ms) + TCA suspected -> STRICTLY BLOCKED (Black-Box Fatal Asystole)
  const tcaNarrow = calculateBicarbonateAndReversal(70, 88, true, true);
  assert.equal(tcaNarrow.physostigmineEligible, false);
  assert.equal(tcaNarrow.physostigmineBlocked, true);
  assert.equal(tcaNarrow.blockReason, 'fatal_tca_or_wide_qrs');
  assert.match(tcaNarrow.blackBoxWarningEn, /FATAL ASYSTOLE/i);
  assert.match(tcaNarrow.rivastigmineGuidanceEn, /BLOCKED/i);

  // Case B: Wide QRS (>= 100 ms) + non-TCA -> STRICTLY BLOCKED
  const wideNonTca = calculateBicarbonateAndReversal(70, 100, false, true);
  assert.equal(wideNonTca.physostigmineEligible, false);
  assert.equal(wideNonTca.physostigmineBlocked, true);
  assert.equal(wideNonTca.blockReason, 'fatal_tca_or_wide_qrs');

  // Case C: Narrow QRS (< 100 ms) + NOT TCA + NOT confirmed isolated pure -> HELD
  const unconfirmed = calculateBicarbonateAndReversal(70, 88, false, false);
  assert.equal(unconfirmed.physostigmineEligible, false);
  assert.equal(unconfirmed.physostigmineBlocked, true);
  assert.equal(unconfirmed.blockReason, 'unconfirmed_or_polysubstance');

  // Case D: Narrow QRS (< 100 ms) + NO TCA + Confirmed isolated pure -> ELIGIBLE
  const eligible = calculateBicarbonateAndReversal(70, 88, false, true);
  assert.equal(eligible.physostigmineEligible, true);
  assert.equal(eligible.physostigmineBlocked, false);
  assert.equal(eligible.blockReason, null);
  assert.match(eligible.physostigmineDoseEn, /0\.5-2 mg.*5 minutes/i);
  assert.match(eligible.monitoringRequirementsEn, /telemetry/i);
  assert.match(eligible.monitoringRequirementsEn, /Atropine/i);
  assert.match(eligible.rivastigmineGuidanceEn, /Rivastigmine 3-6 mg PO/i);
  assert.match(eligible.rivastigmineGuidanceEn, /transdermal/i);
});

test('Antimuscarinic Tox: Risk Evaluation Severities, Opioid Hybrid Dual-Rescue & Bedside Rules', () => {
  // 1. Baseline quiet state
  const baseEval = evaluateAntimuscarinicRisk({
    profileId: 'plant_alkaloid_scopolamine_datura',
    weightKg: '70',
    qrsMs: '88',
    qtcMs: '430',
    tempC: '37.4',
    respRate: '16',
    tcaSuspected: false,
    isolatedPureAnticholinergic: true,
    opioidApneaPresent: false,
    agitationPresent: false,
    urinaryRetentionSuspected: false,
    checkedFlags: new Set(),
  });
  assert.equal(baseEval.severity, 'baseline');
  assert.equal(baseEval.bicarbonateAndReversal.physostigmineEligible, true);

  // 2. Urgent delirium + bladder scan rule
  const bladderEval = evaluateAntimuscarinicRisk({
    profileId: 'plant_alkaloid_scopolamine_datura',
    weightKg: '70',
    qrsMs: '90',
    qtcMs: '440',
    tempC: '38.4',
    respRate: '16',
    tcaSuspected: false,
    isolatedPureAnticholinergic: true,
    agitationPresent: true,
    urinaryRetentionSuspected: true,
    checkedFlags: new Set(['flag_delirium_bladder_retention']),
  });
  assert.equal(bladderEval.severity, 'urgent_delirium_bladder_rule');
  assert.equal(bladderEval.bladderRuleTriggered, true);
  assert.match(bladderEval.bladderDecompressionRule.summaryEn, /Foley/i);
  assert.match(bladderEval.bladderDecompressionRule.summaryEn, /resolves severe agitation/i);
  assert.match(bladderEval.antipsychoticProhibitionRule.summaryEn, /AVOID haloperidol, chlorpromazine/i);

  // 3. Emergency opioid hybrid (fentanyl street-cut respiratory arrest -> Naloxone first)
  const opioidEval = evaluateAntimuscarinicRisk({
    profileId: 'diphenhydramine_fentanyl_cut',
    weightKg: '70',
    qrsMs: '92',
    qtcMs: '450',
    tempC: '37.8',
    respRate: '6',
    opioidApneaPresent: true,
    checkedFlags: new Set(['flag_fentanyl_apnea']),
  });
  assert.equal(opioidEval.severity, 'emergency_opioid_hybrid');
  assert.equal(opioidEval.opioidRescueNeeded, true);
  assert.equal(opioidEval.bicarbonateAndReversal.physostigmineEligible, false);
  assert.ok(opioidEval.alerts.some((a) => /NALOXONE UNMASKING/i.test(a.titleEn)));
  assert.ok(opioidEval.actions[0].textEn.includes('Naloxone'));

  // 4. Dual emergency: Diphenhydramine + Fentanyl cut with BOTH RR=6 AND QRS=124 ms
  const dualCardioEval = evaluateAntimuscarinicRisk({
    profileId: 'diphenhydramine_fentanyl_cut',
    weightKg: '80',
    qrsMs: '124',
    qtcMs: '510',
    tempC: '39.8',
    respRate: '6',
    opioidApneaPresent: true,
    checkedFlags: new Set(['flag_qrs_wide_avr', 'flag_fentanyl_apnea', 'flag_qtc_500']),
  });
  assert.equal(dualCardioEval.severity, 'emergency_cardiotox_bicarb');
  assert.equal(dualCardioEval.opioidRescueNeeded, true);
  assert.equal(dualCardioEval.qtcEmergency, true);
  assert.equal(dualCardioEval.hyperthermiaSeizureRisk, true);
  assert.equal(dualCardioEval.bicarbonateAndReversal.bicarbonateIndicated, true);
  assert.equal(dualCardioEval.bicarbonateAndReversal.bicarbonateMinMeq, 80);
  assert.equal(dualCardioEval.bicarbonateAndReversal.bicarbonateMaxMeq, 160);
  assert.equal(dualCardioEval.bicarbonateAndReversal.physostigmineEligible, false);

  // 5. TCA profile always enforces TCA suspicion and blocks physostigmine even at QRS 90 ms
  const tcaProfileEval = evaluateAntimuscarinicRisk({
    profileId: 'tca_doxepin_cyclobenzaprine',
    weightKg: '70',
    qrsMs: '90',
    tcaSuspected: false,
    isolatedPureAnticholinergic: true,
  });
  assert.equal(tcaProfileEval.severity, 'emergency_cardiotox_bicarb');
  assert.equal(tcaProfileEval.effectiveTcaSuspected, true);
  assert.equal(tcaProfileEval.bicarbonateAndReversal.physostigmineEligible, false);
  assert.equal(tcaProfileEval.bicarbonateAndReversal.blockReason, 'fatal_tca_or_wide_qrs');

  // 6. Antipsychotic + antihistamine QTc >= 500 ms -> MgSO4 & norepinephrine / avoid epinephrine
  const antipsychoticEval = evaluateAntimuscarinicRisk({
    profileId: 'antipsychotic_antihistamine_polysubstance',
    weightKg: '70',
    qrsMs: '94',
    qtcMs: '535',
  });
  assert.equal(antipsychoticEval.severity, 'emergency_cardiotox_bicarb');
  assert.equal(antipsychoticEval.qtcEmergency, true);
  assert.ok(antipsychoticEval.actions.some((a) => /Magnesium Sulfate 2 g IV/i.test(a.textEn)));
  assert.ok(antipsychoticEval.actions.some((a) => /Norepinephrine.*AVOID Epinephrine/i.test(a.textEn)));
});

test('Antimuscarinic Tox: Bilingual EN & ES Zero-PII SBAR Generation', () => {
  const sampleState = {
    profileId: 'diphenhydramine_fentanyl_cut',
    weightKg: '75',
    qrsMs: '116',
    qtcMs: '485',
    tempC: '39.6',
    respRate: '8',
    tcaSuspected: false,
    isolatedPureAnticholinergic: false,
    opioidApneaPresent: true,
    agitationPresent: true,
    urinaryRetentionSuspected: true,
    checkedFlags: new Set(['flag_qrs_wide_avr', 'flag_fentanyl_apnea']),
  };

  const sbarEn = formatAntimuscarinicSbarText(sampleState, 'en');
  assert.match(sbarEn, /ZERO-PII SBAR HANDOFF/);
  assert.match(sbarEn, /75-150 mEq IV push/);
  assert.match(sbarEn, /BLACK-BOX ABSOLUTE BLOCK/);
  assert.match(sbarEn, /Bladder Scan \+ Foley Rule/);
  assert.match(sbarEn, /Antipsychotic Prohibition Rule/);

  const sbarEs = formatAntimuscarinicSbarText(sampleState, 'es');
  assert.match(sbarEs, /ENTREGA CLÍNICA SBAR: TOXICOLOGÍA ANTIMUSCARÍNICA/);
  assert.match(sbarEs, /CERO PII/);
  assert.match(sbarEs, /75-150 mEq IV directo/);
  assert.match(sbarEs, /BLOQUEO ABSOLUTO DE CAJA NEGRA/);
  assert.match(sbarEs, /Regla Vesical/);
  assert.match(sbarEs, /Prohibición de Antipsicóticos/);
});

test('Antimuscarinic Tox: Ephemeral In-RAM State Management & Subscription Lifecycle', () => {
  resetAntimuscarinicToxState();
  const initial = getAntimuscarinicToxState();
  assert.equal(initial.profileId, 'diphenhydramine_fentanyl_cut');
  assert.equal(initial.weightKg, '70');
  assert.equal(initial.checkedFlags.size, 0);

  let notifyCount = 0;
  const unsub = subscribeAntimuscarinicToxState(() => {
    notifyCount += 1;
  });

  updateAntimuscarinicToxState({
    profileId: 'plant_alkaloid_scopolamine_datura',
    weightKg: '64',
    checkedFlags: ['flag_delirium_bladder_retention'],
  });

  const updated = getAntimuscarinicToxState();
  assert.equal(updated.profileId, 'plant_alkaloid_scopolamine_datura');
  assert.equal(updated.weightKg, '64');
  assert.ok(updated.checkedFlags instanceof Set);
  assert.ok(updated.checkedFlags.has('flag_delirium_bladder_retention'));
  assert.equal(notifyCount, 1);

  unsub();
  updateAntimuscarinicToxState({ qrsMs: '108' });
  assert.equal(notifyCount, 1);

  resetAntimuscarinicToxState();
  assert.equal(getAntimuscarinicToxState().weightKg, '70');
  assert.equal(getAntimuscarinicToxState().checkedFlags.size, 0);
});

test('Antimuscarinic Tox: DOM Mounting (Both Signatures), WAI-ARIA Tabs, Focus Preservation, Copy & Unmount Cleanup', async () => {
  const restoreDom = installMockDom();
  let clipboardCopied = '';
  try {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: {
        writeText: async (text) => {
          clipboardCopied = text;
        },
      },
      configurable: true,
      writable: true,
    });

    resetAntimuscarinicToxState();

    // 1. Options object calling signature (app.js route style)
    const routeEl = antimuscarinicToxView({ meta: { title: 'Test' } });
    assert.ok(routeEl, 'Renders element when called with options object');
    assert.ok(routeEl.className.includes('antimuscarinic-tox-view'));

    // Verify WAI-ARIA role="tablist" & paired role="tabpanel"
    const tablist = routeEl.querySelector('[role="tablist"]');
    assert.ok(tablist, 'Tablist rendered');
    const tabs = tablist.querySelectorAll('[role="tab"]');
    assert.equal(tabs.length, 3);
    for (const tab of tabs) {
      assert.equal(tab.getAttribute('type'), 'button', 'Tab button has type="button"');
      const controlsId = tab.getAttribute('aria-controls');
      assert.ok(controlsId, 'Tab has aria-controls');
      const panel = routeEl.querySelector(`#${controlsId}`);
      assert.ok(panel, `Matching tabpanel #${controlsId} exists in DOM`);
      assert.equal(panel.getAttribute('role'), 'tabpanel');
      assert.equal(panel.getAttribute('aria-labelledby'), tab.getAttribute('id'));
    }

    // Verify all buttons have type="button"
    const buttons = routeEl.querySelectorAll('button');
    assert.ok(buttons.length >= 5);
    for (const btn of buttons) {
      assert.equal(btn.getAttribute('type'), 'button');
    }

    // Verify every input/select/textarea has a <label for> or aria-label
    for (const ctrl of [
      ...routeEl.querySelectorAll('input'),
      ...routeEl.querySelectorAll('select'),
      ...routeEl.querySelectorAll('textarea'),
    ]) {
      const id = ctrl.getAttribute('id');
      const hasAria = Boolean(ctrl.getAttribute('aria-label'));
      const hasLabel = id ? routeEl.querySelectorAll('label').some((lbl) => lbl.getAttribute('for') === id) : false;
      assert.ok(hasAria || hasLabel, `Control ${ctrl.tagName}#${id || 'anon'} has accessible label`);
    }

    // Verify focus preservation: controls stay the SAME object instances across state updates
    const weightInputBefore = routeEl.querySelector('#antimuscarinic-weight-input');
    const qrsInputBefore = routeEl.querySelector('#antimuscarinic-qrs-input');
    const sbarBefore = routeEl.querySelector('#antimuscarinic-sbar-text');
    assert.ok(weightInputBefore && qrsInputBefore && sbarBefore);

    // Simulate activeElement being qrsInput during typing
    globalThis.document.activeElement = qrsInputBefore;
    qrsInputBefore.value = '118';
    qrsInputBefore.dispatchEvent({ type: 'input', target: qrsInputBefore });

    const weightInputAfter = routeEl.querySelector('#antimuscarinic-weight-input');
    const qrsInputAfter = routeEl.querySelector('#antimuscarinic-qrs-input');
    const sbarAfter = routeEl.querySelector('#antimuscarinic-sbar-text');
    assert.strictEqual(weightInputAfter, weightInputBefore, 'Weight input remains mounted once');
    assert.strictEqual(qrsInputAfter, qrsInputBefore, 'QRS input remains mounted once (never loses focus)');
    assert.strictEqual(sbarAfter, sbarBefore, 'SBAR textarea remains mounted once');
    assert.match(sbarAfter.value, /70-140 mEq IV push/);
    globalThis.document.activeElement = null;

    // Test tab switching updates aria-selected and hidden attributes
    const diffTabBtn = routeEl.querySelector('#antimuscarinic-tab-differential');
    diffTabBtn.click();
    assert.equal(diffTabBtn.getAttribute('aria-selected'), 'true');
    assert.equal(routeEl.querySelector('#antimuscarinic-panel-differential').hidden, false);
    assert.equal(routeEl.querySelector('#antimuscarinic-panel-navigator').hidden, true);

    // Test Copy SBAR button uses copyText() -> navigator.clipboard.writeText
    const copyBtn = routeEl.querySelector('#antimuscarinic-copy-sbar-btn');
    copyBtn.click();
    await new Promise((r) => setTimeout(r, 10));
    assert.match(clipboardCopied, /ZERO-PII SBAR HANDOFF/);

    // Verify wasConnected unmount cleanup unsubscribes listener
    routeEl.isConnected = true;
    updateAntimuscarinicToxState({ weightKg: '82' });
    assert.match(sbarAfter.value, /82-164 mEq IV push/);

    routeEl.isConnected = false;
    updateAntimuscarinicToxState({ weightKg: '95' });
    // After unmount cleanup triggered, sbarAfter should NOT have updated to 95-190
    assert.doesNotMatch(sbarAfter.value, /95-190 mEq IV push/);

    // 2. Container element calling signature (DOM mount test style)
    resetAntimuscarinicToxState();
    const mountBox = globalThis.document.createElement('div');
    const mountedResult = antimuscarinicToxView(mountBox);
    assert.strictEqual(mountedResult, mountBox, 'Returns mounted container element when passed Element');
    assert.ok(mountBox.querySelector('.antimuscarinic-tox-view'), 'View mounted inside container');
    if (typeof mountBox._cleanup === 'function') mountBox._cleanup();

    // 3. Bilingual Spanish DOM rendering
    useDictionary('es', es);
    try {
      const esView = antimuscarinicToxView({});
      assert.match(esView.textContent, /Navegador de Toxicidad Antimuscarínica/);
      assert.match(esView.textContent, /Diferencial a la Cabecera: Anticolinérgico SECO vs Simpaticomimético DIAFORÉTICO/);
      assert.match(esView.querySelector('#antimuscarinic-sbar-text').value, /ENTREGA CLÍNICA SBAR/);
      if (typeof esView._cleanup === 'function') esView._cleanup();
    } finally {
      useDictionary('en', {});
    }
  } finally {
    restoreDom();
  }
});

test('Antimuscarinic Tox: Static Security, CSP & Privacy Invariants', () => {
  const src = fs.readFileSync(path.resolve('public/js/views/antimuscarinicTox.js'), 'utf-8');

  assert.ok(!src.includes('localStorage'), 'Zero localStorage');
  assert.ok(!src.includes('sessionStorage'), 'Zero sessionStorage');
  assert.ok(!src.includes('document.cookie'), 'Zero cookies');
  assert.ok(!/\bfetch\s*\(/.test(src), 'Zero external fetch');
  assert.ok(!/\beval\s*\(/.test(src), 'Zero eval');
  assert.ok(!/\b(?:innerHTML|outerHTML|insertAdjacentHTML)\b/.test(src), 'Zero raw HTML sinks');
  assert.ok(!/\sstyle\s*=\s*['"]/i.test(src), 'Zero inline style= attributes');
  assert.ok(!/h\(\s*['"]textarea['"]\s*,\s*\{[^}]*\bvalue\s*:/s.test(src), 'Never pass value: inside h("textarea", props)');
});
