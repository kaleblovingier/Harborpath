// test/wooden-chest-rigidity.test.js
// Wave 66: Unit tests for Synthetic Opioid Wooden Chest Rigidity Airway Protocol
// ASA, ACEP, and SAMHSA Emergency Overdose Guidelines.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WOODEN_CHEST_EXPOSURES,
  WOODEN_CHEST_CLINICAL_FLAGS,
  evaluateWoodenChestRisk,
  generateWoodenChestSbar,
  getWoodenChestState,
  updateWoodenChestState,
  resetWoodenChestState,
  subscribeWoodenChestState,
  woodenChestRigidityView,
} from '../public/js/views/woodenChestRigidity.js';

import { installMockDom } from './fixtures/mockDomHelper.js';

test('Wooden Chest: Exposure Taxonomy & Black-Box Guardrails', () => {
  assert.ok(WOODEN_CHEST_EXPOSURES.fentanyl_rapid_iv, 'Rapid IV exposure exists');
  assert.ok(WOODEN_CHEST_EXPOSURES.synthetic_analog_carfentanil, 'Carfentanil analog exists');
  assert.ok(WOODEN_CHEST_EXPOSURES.fentanyl_inhalation, 'Inhaled fentanyl exists');

  // Verify mechanisms & black-box warnings
  assert.match(WOODEN_CHEST_EXPOSURES.fentanyl_rapid_iv.blackBoxWarning, /SUCCINYLCHOLINE/i);
  assert.match(WOODEN_CHEST_EXPOSURES.synthetic_analog_carfentanil.blackBoxWarning, /FORCED BVM VENTILATION/i);
});

test('Wooden Chest: RSI Dosing & Airway Protocol Evaluation', () => {
  // 75 kg patient
  const state75 = {
    exposure: 'fentanyl_rapid_iv',
    weightKg: '75',
    spo2Value: '68',
    checkedFlags: new Set(['flag_bvm_impossible', 'flag_vocal_adduction', 'flag_critical_hypoxia']),
  };
  const eval75 = evaluateWoodenChestRisk(state75);

  assert.equal(eval75.bvmImpossible, true);
  assert.equal(eval75.criticalHypoxia, true);
  assert.equal(eval75.rocuroniumDoseMg, 90); // 75 * 1.2 = 90 mg
  assert.equal(eval75.vecuroniumDoseMg, 7.5); // 75 * 0.1 = 7.5 mg
  assert.equal(eval75.etomidateDoseMg, 23); // 75 * 0.3 = 22.5 -> 23 mg
  assert.equal(eval75.ketamineDoseMg, 113); // 75 * 1.5 = 112.5 -> 113 mg

  // Critical alerts & stat actions
  assert.ok(eval75.alerts.some((a) => a.title.includes('LIFE-THREATENING WOODEN CHEST')));
  assert.ok(eval75.actions.some((act) => act.text.includes('Rocuronium 90 mg')));
  assert.ok(eval75.actions.some((act) => act.text.includes('STAT High-Dose Naloxone')));
});

test('Wooden Chest: Zero-PII SBAR Report Generation (EN & ES)', () => {
  const state = {
    exposure: 'fentanyl_rapid_iv',
    weightKg: '80',
    spo2Value: '65',
    checkedFlags: new Set(['flag_bvm_impossible', 'flag_vocal_adduction']),
  };

  // English SBAR
  const sbarEn = generateWoodenChestSbar(state, 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF REPORT: FENTANYL WOODEN CHEST RIGIDITY/);
  assert.match(sbarEn, /Rocuronium.*96 mg IV/);
  assert.match(sbarEn, /SUCCINYLCHOLINE/);

  // Spanish SBAR
  const sbarEs = generateWoodenChestSbar(state, 'es');
  assert.match(sbarEs, /REPORTE CLÍNICO SBAR: RIGIDEZ TORÁCICA/);
  assert.match(sbarEs, /Rocuronio.*96 mg IV/);
  assert.match(sbarEs, /SUCCINILCOLINA/);
});

test('Wooden Chest: State Management (Get, Update, Reset, Subscribe)', () => {
  resetWoodenChestState();
  const initial = getWoodenChestState();
  assert.equal(initial.weightKg, '75');

  let callCount = 0;
  const unsub = subscribeWoodenChestState(() => {
    callCount += 1;
  });

  updateWoodenChestState({ weightKg: '90', spo2Value: '72' });
  const updated = getWoodenChestState();
  assert.equal(updated.weightKg, '90');
  assert.equal(updated.spo2Value, '72');
  assert.equal(callCount, 1);

  unsub();
  updateWoodenChestState({ spo2Value: '80' });
  assert.equal(callCount, 1); // Unsubscribed

  resetWoodenChestState();
  assert.equal(getWoodenChestState().weightKg, '75');
});

test('Wooden Chest: DOM View Mounting, Form Isolation & Reset Button', () => {
  installMockDom();
  resetWoodenChestState();

  const container = woodenChestRigidityView();
  assert.ok(container, 'View container mounted');

  // Verify inputs and elements exist
  const weightInput = container.querySelector('#weight-input');
  assert.ok(weightInput, 'Weight input exists');

  const spo2Input = container.querySelector('#spo2-input');
  assert.ok(spo2Input, 'SpO2 input exists');

  const sbar = container.querySelector('#woodenchest-sbar-text');
  assert.ok(sbar, 'SBAR text area exists');
  assert.ok(sbar.value.includes('SBAR CLINICAL HANDOFF'), 'SBAR contains handoff text');

  // Cleanup
  if (typeof container._cleanup === 'function') {
    container._cleanup();
  }
});
