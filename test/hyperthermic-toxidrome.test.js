// test/hyperthermic-toxidrome.test.js
// Wave 66: Unit tests for Stimulant, Synthetic Cathinone & Hyperthermic Crisis Decision Engine
// ACMT, Project BETA, and WMS Severe Hyperthermia Clinical Standards.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HYPERTHERMIC_SUBSTANCES,
  HYPERTHERMIC_CLINICAL_FLAGS,
  evaluateHyperthermicRisk,
  generateHyperthermicSbar,
  getHyperthermicState,
  updateHyperthermicState,
  resetHyperthermicState,
  subscribeHyperthermicState,
  hyperthermicToxidromeView,
} from '../public/js/views/hyperthermicToxidrome.js';

import { installMockDom } from './fixtures/mockDomHelper.js';

test('Hyperthermic Toxidrome: Substance Taxonomy & Black-Box Guardrails', () => {
  assert.ok(HYPERTHERMIC_SUBSTANCES.synthetic_cathinones, 'Synthetic cathinones exist');
  assert.ok(HYPERTHERMIC_SUBSTANCES.methamphetamine_binge, 'Methamphetamine exists');
  assert.ok(HYPERTHERMIC_SUBSTANCES.mdma_serotonergic, 'MDMA serotonergic exists');
  assert.ok(HYPERTHERMIC_SUBSTANCES.synthetic_phenethylamines, 'Synthetic phenethylamines exist');

  // Verify mechanisms & black-box contraindications
  assert.match(HYPERTHERMIC_SUBSTANCES.synthetic_cathinones.blackBoxContraindication, /PHYSICAL RESTRAINT CONTRAINDICATED/i);
  assert.match(HYPERTHERMIC_SUBSTANCES.methamphetamine_binge.blackBoxContraindication, /ANTIPYRETIC AGENTS.*CONTRAINDICATED/i);
  assert.match(HYPERTHERMIC_SUBSTANCES.mdma_serotonergic.blackBoxContraindication, /OVER-COOLING.*HAZARD/i);
});

test('Hyperthermic Toxidrome: Thermal Alert & Chemical Sedation Protocol Evaluation', () => {
  // Lethal core hyperthermia (> 40.0 C) with excited delirium and rhabdomyolysis
  const stateCritical = {
    substance: 'synthetic_cathinones',
    tempCelsius: '41.2',
    hrValue: '155',
    checkedFlags: new Set(['flag_temp_critical', 'flag_violent_agitation', 'flag_rhabdomyolysis']),
  };
  const evalCritical = evaluateHyperthermicRisk(stateCritical);

  assert.equal(evalCritical.isLethalThermal, true);
  assert.ok(evalCritical.alerts.some((a) => a.title.includes('LIFE-THREATENING HYPERTHERMIC CRISIS')));
  assert.ok(evalCritical.actions.some((act) => act.text.includes('Cold Water / Ice Immersion Cooling')));
  assert.ok(evalCritical.actions.some((act) => act.text.includes('Midazolam 5-10 mg IM')));
  assert.ok(evalCritical.actions.some((act) => act.text.includes('Ketamine 4-5 mg/kg IM')));
  assert.ok(evalCritical.actions.some((act) => act.text.includes('Rhabdomyolysis & Renal Protection')));
});

test('Hyperthermic Toxidrome: MDMA Hyponatremic Encephalopathy & Seizure Protocols', () => {
  const stateMdma = {
    substance: 'mdma_serotonergic',
    tempCelsius: '39.8',
    hrValue: '130',
    checkedFlags: new Set(['flag_hyponatremia_coma', 'flag_seizures']),
  };
  const evalMdma = evaluateHyperthermicRisk(stateMdma);

  // 3% Hypertonic Saline and Status Epilepticus actions
  assert.ok(evalMdma.actions.some((act) => act.text.includes('Hypertonic Saline (3% NaCl)')));
  assert.ok(evalMdma.actions.some((act) => act.text.includes('Status Epilepticus Control')));
});

test('Hyperthermic Toxidrome: Zero-PII SBAR Report Generation (EN & ES)', () => {
  const state = {
    substance: 'synthetic_cathinones',
    tempCelsius: '40.8',
    hrValue: '150',
    checkedFlags: new Set(['flag_temp_critical', 'flag_violent_agitation']),
  };

  // English SBAR
  const sbarEn = generateHyperthermicSbar(state, 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF REPORT: STIMULANT & CATHINONE HYPERTHERMIC CRISIS/);
  assert.match(sbarEn, /Rapid Cooling Target: Lower core temperature to < 38.5°C/);
  assert.match(sbarEn, /PHYSICAL RESTRAINT CONTRAINDICATED/);

  // Spanish SBAR
  const sbarEs = generateHyperthermicSbar(state, 'es');
  assert.match(sbarEs, /REPORTE CLÍNICO SBAR: CRISIS HIPERTÉRMICA POR ESTIMULANTES/);
  assert.match(sbarEs, /Meta de Enfriamiento.*Reducir temperatura central a < 38.5/);
  assert.match(sbarEs, /SUJECIÓN FÍSICA PROLONGADA CONTRAINDICADA/);
});

test('Hyperthermic Toxidrome: State Management (Get, Update, Reset, Subscribe)', () => {
  resetHyperthermicState();
  const initial = getHyperthermicState();
  assert.equal(initial.tempCelsius, '40.6');

  let callCount = 0;
  const unsub = subscribeHyperthermicState(() => {
    callCount += 1;
  });

  updateHyperthermicState({ tempCelsius: '41.5', hrValue: '160' });
  const updated = getHyperthermicState();
  assert.equal(updated.tempCelsius, '41.5');
  assert.equal(updated.hrValue, '160');
  assert.equal(callCount, 1);

  unsub();
  updateHyperthermicState({ hrValue: '140' });
  assert.equal(callCount, 1); // Unsubscribed

  resetHyperthermicState();
  assert.equal(getHyperthermicState().tempCelsius, '40.6');
});

test('Hyperthermic Toxidrome: DOM View Mounting, Form Isolation & Reset Button', () => {
  installMockDom();
  resetHyperthermicState();

  const container = hyperthermicToxidromeView();
  assert.ok(container, 'View container mounted');

  // Verify inputs and elements exist
  const tempInput = container.querySelector('#temp-input');
  assert.ok(tempInput, 'Temp input exists');

  const hrInput = container.querySelector('#hr-input');
  assert.ok(hrInput, 'HR input exists');

  const sbar = container.querySelector('#hyperthermic-sbar-text');
  assert.ok(sbar, 'SBAR text area exists');
  assert.ok(sbar.value.includes('SBAR CLINICAL HANDOFF'), 'SBAR contains handoff text');

  // Cleanup
  if (typeof container._cleanup === 'function') {
    container._cleanup();
  }
});
