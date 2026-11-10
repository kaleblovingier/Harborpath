// test/cardiogenic-toxin-hiet.test.js
// Wave 66: Unit tests for Cardiogenic Toxin HIET Decision Engine
// ACMT, AACT, and EAPCCT Clinical Consensus Standards.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARDIOGENIC_SUBSTANCES,
  CARDIOGENIC_CLINICAL_FLAGS,
  calculateHietDosing,
  evaluateCardiogenicRisk,
  generateCardiogenicSbar,
  getCardiogenicState,
  updateCardiogenicState,
  resetCardiogenicState,
  subscribeCardiogenicState,
  cardiogenicToxinHietView,
} from '../public/js/views/cardiogenicToxinHiet.js';

import { installMockDom } from './fixtures/mockDomHelper.js';

test('Cardiogenic Toxin: Substance Taxonomy & Clinical Guardrails', () => {
  assert.ok(CARDIOGENIC_SUBSTANCES.ccb_dihydropyridine, 'Dihydropyridine CCB exists');
  assert.ok(CARDIOGENIC_SUBSTANCES.ccb_non_dihydropyridine, 'Non-dihydropyridine CCB exists');
  assert.ok(CARDIOGENIC_SUBSTANCES.beta_blocker_lipophilic, 'Lipophilic BB exists');
  assert.ok(CARDIOGENIC_SUBSTANCES.beta_blocker_hydrophilic, 'Hydrophilic BB exists');

  // Verify mechanisms & black-box contraindications
  assert.match(CARDIOGENIC_SUBSTANCES.ccb_dihydropyridine.blackBoxContraindication, /PHENYLEPHRINE/i);
  assert.match(CARDIOGENIC_SUBSTANCES.ccb_non_dihydropyridine.blackBoxContraindication, /PREMATURE DISCONTINUATION/i);
  assert.match(CARDIOGENIC_SUBSTANCES.beta_blocker_lipophilic.blackBoxContraindication, /HIGH-DOSE EPINEPHRINE/i);
});

test('Cardiogenic Toxin: HIET Dosing Calculations (Weight-based & Glucose Titration)', () => {
  // 70 kg patient with glucose < 200 mg/dL (needs dextrose bolus)
  const dosing70 = calculateHietDosing(70, 150);
  assert.equal(dosing70.insulinBolusUnits, 70); // 1 U/kg
  assert.equal(dosing70.initialInfusionUnitsPerHr, 70); // 1 U/kg/hr
  assert.equal(dosing70.maxInfusionUnitsPerHr, 700); // 10 U/kg/hr
  assert.equal(dosing70.needsDextroseBolus, true);
  assert.equal(dosing70.dextroseBolusMlD50, 35); // 0.5 mL/kg D50W

  // 100 kg patient with glucose > 200 mg/dL (no dextrose bolus needed initially)
  const dosing100 = calculateHietDosing(100, 240);
  assert.equal(dosing100.insulinBolusUnits, 100);
  assert.equal(dosing100.initialInfusionUnitsPerHr, 100);
  assert.equal(dosing100.maxInfusionUnitsPerHr, 1000);
  assert.equal(dosing100.needsDextroseBolus, false);
});

test('Cardiogenic Toxin: Shock & Permissive Hypokalemia Triage Logic', () => {
  // 1. Shock triggered by low SBP & bradycardia
  const shockState = {
    substance: 'ccb_non_dihydropyridine',
    weightKg: '80',
    sbpValue: '75',
    hrValue: '38',
    glucoseValue: '280',
    potassiumValue: '3.1',
    checkedFlags: new Set(['flag_av_block']),
  };
  const evalShock = evaluateCardiogenicRisk(shockState);
  assert.equal(evalShock.inShock, true);
  assert.ok(evalShock.alerts.some((a) => a.title.includes('CRITICAL CARDIOGENIC SHOCK')));

  // Permissive hypokalemia (3.1 mEq/L) should NOT trigger severe hypokalemia alert (< 2.8)
  assert.equal(evalShock.alerts.some((a) => a.title.includes('SEVERE HYPOKALEMIA')), false);

  // 2. Severe hypokalemia (< 2.8 mEq/L) triggers safety alert
  const severeHypoKState = {
    ...shockState,
    potassiumValue: '2.4',
  };
  const evalHypoK = evaluateCardiogenicRisk(severeHypoKState);
  assert.ok(evalHypoK.alerts.some((a) => a.title.includes('SEVERE HYPOKALEMIA (< 2.8 mEq/L)')));
  assert.ok(evalHypoK.alerts.some((a) => a.body.includes('KCl replacement')));
});

test('Cardiogenic Toxin: Zero-PII SBAR Report Generation (EN & ES)', () => {
  const state = {
    substance: 'ccb_non_dihydropyridine',
    weightKg: '75',
    sbpValue: '70',
    hrValue: '40',
    glucoseValue: '310',
    potassiumValue: '3.0',
    checkedFlags: new Set(['flag_av_block']),
  };

  // English SBAR
  const sbarEn = generateCardiogenicSbar(state, 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF REPORT: CARDIOGENIC TOXIN/);
  assert.match(sbarEn, /Regular Insulin STAT Loading Bolus: 75 Units IV/);
  assert.match(sbarEn, /PREMATURE DISCONTINUATION/);

  // Spanish SBAR
  const sbarEs = generateCardiogenicSbar(state, 'es');
  assert.match(sbarEs, /REPORTE CLÍNICO SBAR: TOXICOLOGÍA CARDIOVASCULAR/);
  assert.match(sbarEs, /Bolo de Carga de Insulina Regular: 75 Unidades IV/);
  assert.match(sbarEs, /SUSPENSIÓN PREMATURA/);
});

test('Cardiogenic Toxin: State Management (Get, Update, Reset, Subscribe)', () => {
  resetCardiogenicState();
  const initial = getCardiogenicState();
  assert.equal(initial.weightKg, '70');

  let callCount = 0;
  const unsub = subscribeCardiogenicState(() => {
    callCount += 1;
  });

  updateCardiogenicState({ weightKg: '85', sbpValue: '82' });
  const updated = getCardiogenicState();
  assert.equal(updated.weightKg, '85');
  assert.equal(updated.sbpValue, '82');
  assert.equal(callCount, 1);

  unsub();
  updateCardiogenicState({ hrValue: '42' });
  assert.equal(callCount, 1); // Unsubscribed

  resetCardiogenicState();
  assert.equal(getCardiogenicState().weightKg, '70');
});

test('Cardiogenic Toxin: DOM View Mounting, Form Isolation & Reset Button', () => {
  installMockDom();
  resetCardiogenicState();

  const container = cardiogenicToxinHietView();
  assert.ok(container, 'View container mounted');

  // Verify inputs and subcontainers exist
  const weightInput = container.querySelector('#weight-input');
  assert.ok(weightInput, 'Weight input exists');

  const sbar = container.querySelector('#cardiogenic-sbar-text');
  assert.ok(sbar, 'SBAR text area exists');
  assert.ok(sbar.value.includes('SBAR CLINICAL HANDOFF'), 'SBAR contains handoff text');

  // Cleanup
  if (typeof container._cleanup === 'function') {
    container._cleanup();
  }
});
