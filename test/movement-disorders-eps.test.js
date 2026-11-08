import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { installMockDom } from './fixtures/mockDomHelper.js';

import {
  MOVEMENT_PHENOTYPES,
  HALOPERIDOL_PROHIBITION,
  evaluateMovementDisorder,
  getMovementState,
  updateMovementState,
  resetMovementState,
  subscribeMovementState,
  generateMovementSbar,
  movementDisordersEpsView,
} from '../public/js/views/movementDisordersEps.js';

test('MOVEMENT_PHENOTYPES covers verified motor syndromes and HALOPERIDOL_PROHIBITION integrity', () => {
  assert.ok(MOVEMENT_PHENOTYPES.choreoathetosis);
  assert.ok(MOVEMENT_PHENOTYPES.acute_dystonia);
  assert.ok(MOVEMENT_PHENOTYPES.akathisia);
  assert.ok(MOVEMENT_PHENOTYPES.parkinsonism);
  assert.ok(MOVEMENT_PHENOTYPES.nms);
  assert.ok(MOVEMENT_PHENOTYPES.hyperpyrexia_hunter);

  assert.equal(HALOPERIDOL_PROHIBITION.mechanisms.length, 4);
  assert.ok(HALOPERIDOL_PROHIBITION.mechanisms.some((m) => m.titleEn.includes('Seizure Threshold')));
  assert.ok(HALOPERIDOL_PROHIBITION.mechanisms.some((m) => m.titleEn.includes('Hyperthermia')));
});

test('evaluateMovementDisorder detects laryngeal airway emergency and triggers stat anticholinergic', () => {
  const res = evaluateMovementDisorder({
    phenotype: 'acute_dystonia',
    coreTemp: 37.0,
    hasStridor: true,
    hasClonus: false,
    hasLeadPipeRigidity: false,
    recentAntipsychotic: true,
    recentMethamphetamine: false,
    ckLevel: 120,
  });

  assert.ok(res.alerts.some((a) => a.textEn.includes('AIRWAY EMERGENCY')));
  assert.ok(res.urgentDirectives.some((d) => d.priority === 'stat' && d.titleEn.includes('Diphenhydramine 50 mg IV')));
  assert.ok(res.medicationsToAdminister.some((m) => m.includes('Diphenhydramine 50 mg IV')));
});

test('evaluateMovementDisorder manages hyperthermia, NMS, clonus and rhabdomyolysis', () => {
  // Scenario 1: Severe NMS with lead-pipe rigidity and fever
  const resNms = evaluateMovementDisorder({
    phenotype: 'nms',
    coreTemp: 40.2,
    hasStridor: false,
    hasClonus: false,
    hasLeadPipeRigidity: true,
    recentAntipsychotic: true,
    recentMethamphetamine: false,
    ckLevel: 8500,
  });

  assert.ok(resNms.alerts.some((a) => a.textEn.includes('NEUROLEPTIC MALIGNANT SYNDROME')));
  assert.ok(resNms.alerts.some((a) => a.textEn.includes('CRITICAL HYPERTHERMIA')));
  assert.ok(resNms.alerts.some((a) => a.textEn.includes('Rhabdomyolysis Alert')));
  assert.ok(resNms.urgentDirectives.some((d) => d.titleEn.includes('NMS ICU Protocol')));
  assert.ok(resNms.medicationsToAdminister.some((m) => m.includes('Bromocriptine')));
  assert.ok(resNms.medicationsToAdminister.some((m) => m.includes('Dantrolene')));

  // Scenario 2: Hunter serotonin toxicity positive (clonus present)
  const resHunter = evaluateMovementDisorder({
    phenotype: 'hyperpyrexia_hunter',
    coreTemp: 38.5,
    hasStridor: false,
    hasClonus: true,
    hasLeadPipeRigidity: false,
    recentAntipsychotic: false,
    recentMethamphetamine: true,
    ckLevel: 300,
  });

  assert.ok(resHunter.alerts.some((a) => a.textEn.includes('HUNTER CRITERIA POSITIVE')));
  assert.ok(resHunter.medicationsToAdminister.some((m) => m.includes('Cyproheptadine')));
});

test('In-RAM ephemeral state controller updates and resets cleanly', () => {
  resetMovementState();
  assert.equal(getMovementState().phenotype, 'choreoathetosis');

  let updated = false;
  const unsub = subscribeMovementState((st) => {
    if (st.coreTemp === 39.5) updated = true;
  });

  updateMovementState({ coreTemp: 39.5 });
  assert.equal(getMovementState().coreTemp, 39.5);
  assert.ok(updated);

  unsub();
  resetMovementState();
  assert.equal(getMovementState().coreTemp, 37.2);
});

test('generateMovementSbar produces structured bilingual handoff notes with zero PII', () => {
  const st = {
    phenotype: 'choreoathetosis',
    coreTemp: 37.4,
    hasStridor: false,
    hasClonus: false,
    hasLeadPipeRigidity: false,
    recentAntipsychotic: false,
    recentMethamphetamine: true,
    ckLevel: 400,
  };

  const sbarEn = generateMovementSbar(st, 'en');
  assert.ok(sbarEn.includes('SBAR CLINICAL HANDOFF'));
  assert.ok(sbarEn.includes('CHOREOATHETOSIS'));
  assert.ok(sbarEn.includes('PROHIBITION: DO NOT ADMINISTER HALOPERIDOL'));

  const sbarEs = generateMovementSbar(st, 'es');
  assert.ok(sbarEs.includes('TRANSFERENCIA CLÍNICA SBAR'));
  assert.ok(sbarEs.includes('COREOATETOSIS'));
  assert.ok(sbarEs.includes('NO ADMINISTRAR HALOPERIDOL'));
});

test('movementDisordersEpsView mounts accessible DOM tree without innerHTML or style attributes', () => {
  const restoreDom = installMockDom();
  try {
    const view = movementDisordersEpsView();
    assert.ok(view);
    assert.equal(view.className, 'movement-disorders-view');
  } finally {
    restoreDom();
  }

  const fileContent = fs.readFileSync(path.resolve('public/js/views/movementDisordersEps.js'), 'utf-8');
  assert.equal(fileContent.includes('innerHTML'), false);
  assert.equal(fileContent.includes('outerHTML'), false);
  assert.equal(fileContent.includes('insertAdjacentHTML'), false);
  assert.equal(/setAttribute\s*\(\s*['"]style['"]/i.test(fileContent), false);
});
