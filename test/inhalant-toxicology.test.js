// test/inhalant-toxicology.test.js
// Wave 65: Unit tests for Inhalant, Volatile Hydrocarbon & Nitrous Oxide Neuropathy Navigator

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  INHALANT_SUBSTANCES,
  INHALANT_CLINICAL_FLAGS,
  evaluateInhalantRisk,
  generateInhalantSbar,
  getInhalantState,
  updateInhalantState,
  resetInhalantState,
  inhalantToxicologyView,
} from '../public/js/views/inhalantToxicology.js';

import { installMockDom } from './fixtures/mockDomHelper.js';

test('Inhalant Toxicology: Substance Taxonomy & Biochemical Rules', () => {
  assert.ok(INHALANT_SUBSTANCES.n2o, 'N2O substance exists');
  assert.ok(INHALANT_SUBSTANCES.difluoroethane, 'Difluoroethane substance exists');
  assert.ok(INHALANT_SUBSTANCES.toluene, 'Toluene substance exists');

  // Verify mechanism & pitfall definitions
  assert.match(INHALANT_SUBSTANCES.n2o.mechanism, /oxidation of cobalt/i);
  assert.match(INHALANT_SUBSTANCES.n2o.fatalPitfall, /FOLIC ACID/i);

  assert.match(INHALANT_SUBSTANCES.difluoroethane.mechanism, /sensitizing the myocardium/i);
  assert.match(INHALANT_SUBSTANCES.difluoroethane.fatalPitfall, /EPINEPHRINE/i);

  assert.match(INHALANT_SUBSTANCES.toluene.mechanism, /Type 1 distal RTA/i);
  assert.match(INHALANT_SUBSTANCES.toluene.fatalPitfall, /SODIUM BICARBONATE/i);
});

test('Inhalant Toxicology: Fatal Contraindication Gatekeeping (Folate, Epinephrine, Bicarbonate)', () => {
  // 1. Folate trap violation in N2O
  const folateState = {
    substance: 'n2o',
    checkedFlags: ['folatePrescribed', 'sensoryAtaxia'],
    folicAcidGiven: true,
  };
  const folateEval = evaluateInhalantRisk(folateState);
  assert.equal(folateEval.priority, 'critical-fatal');
  assert.ok(folateEval.alerts.some((a) => a.title.includes('FOLIC ACID')));
  assert.ok(folateEval.actions.some((act) => act.text.includes('CANCEL all folic acid')));

  // 2. Epinephrine violation in hydrocarbon sudden sniffing death
  const ssdState = {
    substance: 'difluoroethane',
    checkedFlags: ['ventricularDysrhythmia', 'epinephrineConsidered'],
  };
  const ssdEval = evaluateInhalantRisk(ssdState);
  assert.equal(ssdEval.priority, 'critical-fatal');
  assert.ok(ssdEval.alerts.some((a) => a.title.includes('EPINEPHRINE CONTRAINDICATED')));
  assert.ok(ssdEval.actions.some((act) => act.text.includes('Esmolol')));

  // 3. Sodium bicarbonate before potassium in toluene dRTA
  const rtaState = {
    substance: 'toluene',
    serumPotassium: '1.9',
    checkedFlags: ['bicarbonateFirst', 'quadriparesis'],
    bicarbonatePlanned: true,
  };
  const rtaEval = evaluateInhalantRisk(rtaState);
  assert.equal(rtaEval.priority, 'critical-fatal');
  assert.ok(rtaEval.alerts.some((a) => a.title.includes('POTASSIUM BEFORE BICARBONATE')));
  assert.ok(rtaEval.actions.some((act) => act.text.includes('STOP sodium bicarbonate')));
});

test('Inhalant Toxicology: SBAR Note Generation in English & Spanish', () => {
  const sampleState = {
    substance: 'n2o',
    checkedFlags: ['sensoryAtaxia', 'invertedLhermitte', 'vteRisk'],
    serumPotassium: '4.2',
  };

  const sbarEn = generateInhalantSbar(sampleState, 'en');
  assert.ok(sbarEn.includes('[S] SITUATION:'));
  assert.ok(sbarEn.includes('[B] BACKGROUND:'));
  assert.ok(sbarEn.includes('[A] TOXICOLOGICAL ASSESSMENT & BLACK-BOX CONTRAINDICATIONS:'));
  assert.ok(sbarEn.includes('[R] DIRECTIVES & FIRST-LINE INTERVENTIONS:'));
  assert.ok(sbarEn.includes('Hydroxocobalamin 1,000 mcg IM'));

  const sbarEs = generateInhalantSbar(sampleState, 'es');
  assert.ok(sbarEs.includes('[S] SITUACIÓN:'));
  assert.ok(sbarEs.includes('[B] ANTECEDENTES:'));
  assert.ok(sbarEs.includes('[A] EVALUACIÓN TOXICOLÓGICA Y CONTRAINDICACIONES:'));
  assert.ok(sbarEs.includes('[R] RECOMENDACIONES CLÍNICAS Y PLAN DE ACCIÓN:'));
  assert.ok(sbarEs.includes('Hidroxocobalamina'));
});

test('Inhalant Toxicology: In-RAM State Management & Reset', () => {
  resetInhalantState();
  const init = getInhalantState();
  assert.equal(init.substance, 'n2o');
  assert.equal(init.checkedFlags.size, 0);

  updateInhalantState({
    substance: 'toluene',
    checkedFlags: new Set(['quadriparesis']),
    serumPotassium: '2.1',
  });

  const updated = getInhalantState();
  assert.equal(updated.substance, 'toluene');
  assert.ok(updated.checkedFlags.has('quadriparesis'));
  assert.equal(updated.serumPotassium, '2.1');

  resetInhalantState();
  const resetState = getInhalantState();
  assert.equal(resetState.substance, 'n2o');
  assert.equal(resetState.checkedFlags.size, 0);
  assert.equal(resetState.serumPotassium, '');
});

test('Inhalant Toxicology: Static Security, Privacy & Invariant Verification', () => {
  const filePath = path.resolve('public/js/views/inhalantToxicology.js');
  const content = fs.readFileSync(filePath, 'utf-8');

  assert.ok(!content.includes('localStorage'), 'Must not write to localStorage');
  assert.ok(!content.includes('sessionStorage'), 'Must not write to sessionStorage');
  assert.ok(!content.includes('document.cookie'), 'Must not write to document.cookie');
  assert.ok(!content.includes('innerHTML'), 'Must not use innerHTML');
  assert.ok(!content.includes('outerHTML'), 'Must not use outerHTML');
  assert.ok(!content.includes('style='), 'Must not use inline style= attributes');
});

test('Inhalant Toxicology: DOM View Rendering and Mount', () => {
  const restoreDom = installMockDom();
  try {
    resetInhalantState();
    const view = inhalantToxicologyView();
    assert.ok(view, 'View renders successfully');
    assert.equal(view.className, 'inhalant-view specialized-clinical-view');
    const sbar = view.querySelector('.nsti-sbar-textarea');
    assert.ok(sbar && (sbar.value.length > 50 || sbar.textContent.length > 50), 'SBAR textarea is populated with handoff content');
    const potInput = view.querySelector('#potassium-input');
    assert.ok(potInput, 'Potassium input is mounted in DOM');

    if (typeof view._cleanup === 'function') {
      view._cleanup();
    }
  } finally {
    restoreDom();
  }
});
