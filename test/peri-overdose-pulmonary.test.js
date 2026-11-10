// test/peri-overdose-pulmonary.test.js
// Wave 65: Unit tests for Peri-Overdose Pulmonary Syndromes & Non-Cardiogenic Pulmonary Edema Navigator

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  PULMONARY_SYNDROMES,
  PULMONARY_CLINICAL_FLAGS,
  evaluatePulmonaryRisk,
  generatePulmonarySbar,
  getPulmonaryState,
  updatePulmonaryState,
  resetPulmonaryState,
  periOverdosePulmonaryView,
} from '../public/js/views/periOverdosePulmonary.js';

import { installMockDom } from './fixtures/mockDomHelper.js';

test('Peri-Overdose Pulmonary: Syndrome Taxonomy & Biochemical Rules', () => {
  assert.ok(PULMONARY_SYNDROMES.ncpe, 'NCPE exists');
  assert.ok(PULMONARY_SYNDROMES.aspiration, 'Aspiration exists');
  assert.ok(PULMONARY_SYNDROMES.crackLung, 'Crack Lung exists');

  assert.match(PULMONARY_SYNDROMES.ncpe.pathophysiology, /sympathetic storm/i);
  assert.match(PULMONARY_SYNDROMES.ncpe.blackBoxContraindication, /LOOP DIURETICS/i);

  assert.match(PULMONARY_SYNDROMES.aspiration.pathophysiology, /sterile chemical burn/i);
  assert.match(PULMONARY_SYNDROMES.aspiration.blackBoxContraindication, /PROPHYLACTIC ANTIBIOTICS/i);

  assert.match(PULMONARY_SYNDROMES.crackLung.name, /Diffuse Alveolar Hemorrhage/i);
  assert.match(PULMONARY_SYNDROMES.crackLung.blackBoxContraindication, /BETA-ADRENERGIC BLOCKERS/i);
});

test('Peri-Overdose Pulmonary: Resuscitation Contraindications (Diuretics in NCPE, Antibiotics in Chemical Pneumonitis, Beta-Blockers in Crack Lung)', () => {
  // 1. Loop diuretics prohibition in NCPE
  const ncpeState = {
    syndrome: 'ncpe',
    checkedFlags: ['pinkFrothySputum', 'furosemideOrdered'],
    diureticPlanned: true,
  };
  const ncpeEval = evaluatePulmonaryRisk(ncpeState);
  assert.equal(ncpeEval.priority, 'critical-fatal');
  assert.ok(ncpeEval.alerts.some((a) => a.title.includes('LOOP DIURETICS PROHIBITED')));
  assert.ok(ncpeEval.actions.some((act) => act.text.includes('CANCEL IV furosemide')));

  // 2. Prophylactic antibiotics prohibition in acute aspiration (0-48h)
  const aspState = {
    syndrome: 'aspiration',
    checkedFlags: ['aspirationObserved', 'under48Hours', 'prophylacticAbxPlanned'],
    prophylacticAbxGiven: true,
  };
  const aspEval = evaluatePulmonaryRisk(aspState);
  assert.equal(aspEval.priority, 'critical-fatal');
  assert.ok(aspEval.alerts.some((a) => a.title.includes('PROPHYLACTIC ANTIBIOTICS PROHIBITED')));
  assert.ok(aspEval.actions.some((act) => act.text.includes('WITHHOLD all prophylactic antibiotics')));

  // 3. Beta-blockers prohibition in acute cocaine / Crack Lung
  const clState = {
    syndrome: 'crackLung',
    checkedFlags: ['hemoptysisMelanoptysis', 'betaBlockerPlanned'],
    betaBlockerConsidered: true,
  };
  const clEval = evaluatePulmonaryRisk(clState);
  assert.equal(clEval.priority, 'critical-fatal');
  assert.ok(clEval.alerts.some((a) => a.title.includes('UNOPPOSED ALPHA-ADRENERGIC CRISIS')));
  assert.ok(clEval.actions.some((act) => act.text.includes('Benzodiazepines')));
});

test('Peri-Overdose Pulmonary: SBAR Note Generation in English & Spanish', () => {
  const sampleState = {
    syndrome: 'ncpe',
    checkedFlags: ['pinkFrothySputum', 'refractoryHypoxia'],
    spo2Value: '82',
  };

  const sbarEn = generatePulmonarySbar(sampleState, 'en');
  assert.ok(sbarEn.includes('[S] SITUATION:'));
  assert.ok(sbarEn.includes('[B] BACKGROUND:'));
  assert.ok(sbarEn.includes('[A] PULMONARY ASSESSMENT & BLACK-BOX CONTRAINDICATIONS:'));
  assert.ok(sbarEn.includes('[R] RECOMMENDED VENTILATORY & MANAGEMENT DIRECTIVES:'));
  assert.ok(sbarEn.includes('PEEP 8-12 cmH2O'));

  const sbarEs = generatePulmonarySbar(sampleState, 'es');
  assert.ok(sbarEs.includes('[S] SITUACIÓN:'));
  assert.ok(sbarEs.includes('[B] ANTECEDENTES:'));
  assert.ok(sbarEs.includes('[A] EVALUACIÓN RESPIRATORIA Y CONTRAINDICACIONES CRÍTICAS:'));
  assert.ok(sbarEs.includes('[R] DIRECTIVAS VENTILATORIAS Y PLAN DE MANEJO:'));
  assert.ok(sbarEs.includes('PEEP 8-12 cmH2O'));
});

test('Peri-Overdose Pulmonary: In-RAM State Management & Reset', () => {
  resetPulmonaryState();
  const init = getPulmonaryState();
  assert.equal(init.syndrome, 'ncpe');
  assert.equal(init.checkedFlags.size, 0);

  updatePulmonaryState({
    syndrome: 'crackLung',
    checkedFlags: new Set(['hemoptysisMelanoptysis']),
    spo2Value: '89',
  });

  const updated = getPulmonaryState();
  assert.equal(updated.syndrome, 'crackLung');
  assert.ok(updated.checkedFlags.has('hemoptysisMelanoptysis'));
  assert.equal(updated.spo2Value, '89');

  resetPulmonaryState();
  const resetState = getPulmonaryState();
  assert.equal(resetState.syndrome, 'ncpe');
  assert.equal(resetState.checkedFlags.size, 0);
  assert.equal(resetState.spo2Value, '');
});

test('Peri-Overdose Pulmonary: Static Security, Privacy & Invariant Verification', () => {
  const filePath = path.resolve('public/js/views/periOverdosePulmonary.js');
  const content = fs.readFileSync(filePath, 'utf-8');

  assert.ok(!content.includes('localStorage'), 'Must not write to localStorage');
  assert.ok(!content.includes('sessionStorage'), 'Must not write to sessionStorage');
  assert.ok(!content.includes('document.cookie'), 'Must not write to document.cookie');
  assert.ok(!content.includes('innerHTML'), 'Must not use innerHTML');
  assert.ok(!content.includes('outerHTML'), 'Must not use outerHTML');
  assert.ok(!content.includes('style='), 'Must not use inline style= attributes');
});

test('Peri-Overdose Pulmonary: DOM View Rendering and Mount', () => {
  const restoreDom = installMockDom();
  try {
    resetPulmonaryState();
    const view = periOverdosePulmonaryView();
    assert.ok(view, 'View renders successfully');
    assert.equal(view.className, 'pulmonary-view specialized-clinical-view');
    const sbar = view.querySelector('.nsti-sbar-textarea');
    assert.ok(sbar && (sbar.value.length > 50 || sbar.textContent.length > 50), 'SBAR textarea is populated with handoff content');
    const spo2Input = view.querySelector('#spo2-input');
    assert.ok(spo2Input, 'SpO2 input is mounted in DOM');

    if (typeof view._cleanup === 'function') {
      view._cleanup();
    }
  } finally {
    restoreDom();
  }
});
