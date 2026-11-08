// test/adulterant-heavy-metals.test.js
// Wave 65: Unit tests for Illicit Drug Adulterants, Heavy Metals & Novel High-Potency Alpha-2 Agonist Triage

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  ADULTERANT_TYPES,
  ADULTERANT_CLINICAL_FLAGS,
  evaluateAdulterantRisk,
  generateAdulterantSbar,
  getAdulterantState,
  updateAdulterantState,
  resetAdulterantState,
  adulterantHeavyMetalsView,
} from '../public/js/views/adulterantHeavyMetals.js';

import { installMockDom } from './fixtures/mockDomHelper.js';

test('Adulterants & Heavy Metals: Taxonomy & Selectivity Profile', () => {
  assert.ok(ADULTERANT_TYPES.medetomidine, 'Medetomidine exists');
  assert.ok(ADULTERANT_TYPES.brodifacoum, 'Brodifacoum exists');
  assert.ok(ADULTERANT_TYPES.lead, 'Lead exists');

  assert.match(ADULTERANT_TYPES.medetomidine.selectivity, /1,620:1/i);
  assert.match(ADULTERANT_TYPES.medetomidine.blackBoxContraindication, /ATIPAMEZOLE/i);

  assert.match(ADULTERANT_TYPES.brodifacoum.selectivity, /20-60\+ days/i);
  assert.match(ADULTERANT_TYPES.brodifacoum.blackBoxContraindication, /RAPID IV BOLUS/i);

  assert.match(ADULTERANT_TYPES.lead.clinicalSyndrome, /basophilic stippling/i);
  assert.match(ADULTERANT_TYPES.lead.blackBoxContraindication, /EDTA BEFORE BAL/i);
});

test('Adulterants & Heavy Metals: Black-Box Contraindication Gatekeeping (Atipamezole, Rapid Vit K, EDTA sequencing)', () => {
  // 1. Atipamezole human prohibition
  const medState = {
    adulterantType: 'medetomidine',
    checkedFlags: ['atipamezoleConsidered', 'profoundBradycardia'],
    atipamezolePlanned: true,
  };
  const medEval = evaluateAdulterantRisk(medState);
  assert.equal(medEval.priority, 'critical-fatal');
  assert.ok(medEval.alerts.some((a) => a.title.includes('ATIPAMEZOLE PROHIBITED')));
  assert.ok(medEval.actions.some((act) => act.text.includes('CANCEL all atipamezole')));

  // 2. Rapid IV Vitamin K push warning
  const kState = {
    adulterantType: 'brodifacoum',
    checkedFlags: ['rapidVitKBolus', 'unmeasurableInr'],
    rapidVitKPlanned: true,
  };
  const kEval = evaluateAdulterantRisk(kState);
  assert.equal(kEval.priority, 'critical-fatal');
  assert.ok(kEval.alerts.some((a) => a.title.includes('RAPID IV VITAMIN K')));
  assert.ok(kEval.actions.some((act) => act.text.includes('STOP rapid IV push')));

  // 3. Calcium Disodium EDTA before BAL prohibition
  const leadState = {
    adulterantType: 'lead',
    checkedFlags: ['edtaAloneOrdered', 'leadEncephalopathy'],
    edtaAlonePlanned: true,
  };
  const leadEval = evaluateAdulterantRisk(leadState);
  assert.equal(leadEval.priority, 'critical-fatal');
  assert.ok(leadEval.alerts.some((a) => a.title.includes('NEVER ADMINISTER EDTA BEFORE BAL')));
  assert.ok(leadEval.actions.some((act) => act.text.includes('HOLD Calcium Disodium EDTA')));
});

test('Adulterants & Heavy Metals: SBAR Note Generation in English & Spanish', () => {
  const sampleState = {
    adulterantType: 'medetomidine',
    checkedFlags: ['profoundBradycardia', 'hypothermiaCore'],
    heartRate: '32',
  };

  const sbarEn = generateAdulterantSbar(sampleState, 'en');
  assert.ok(sbarEn.includes('[S] SITUATION:'));
  assert.ok(sbarEn.includes('[B] BACKGROUND:'));
  assert.ok(sbarEn.includes('[A] CLINICAL TOXICOLOGY ASSESSMENT & BLACK-BOX CONTRAINDICATIONS:'));
  assert.ok(sbarEn.includes('[R] RECOMMENDED RESUSCITATION & MANAGEMENT DIRECTIVES:'));
  assert.ok(sbarEn.includes('Atropine 1 mg IV'));

  const sbarEs = generateAdulterantSbar(sampleState, 'es');
  assert.ok(sbarEs.includes('[S] SITUACIÓN:'));
  assert.ok(sbarEs.includes('[B] ANTECEDENTES:'));
  assert.ok(sbarEs.includes('[A] EVALUACIÓN TOXICOLÓGICA Y CONTRAINDICACIONES:'));
  assert.ok(sbarEs.includes('[R] DIRECTIVAS TERAPÉUTICAS Y PLAN DE MANEJO:'));
  assert.ok(sbarEs.includes('Atropina'));
});

test('Adulterants & Heavy Metals: In-RAM State Management & Reset', () => {
  resetAdulterantState();
  const init = getAdulterantState();
  assert.equal(init.adulterantType, 'medetomidine');
  assert.equal(init.checkedFlags.size, 0);

  updateAdulterantState({
    adulterantType: 'brodifacoum',
    checkedFlags: new Set(['unmeasurableInr']),
    inrValue: '12.0',
  });

  const updated = getAdulterantState();
  assert.equal(updated.adulterantType, 'brodifacoum');
  assert.ok(updated.checkedFlags.has('unmeasurableInr'));
  assert.equal(updated.inrValue, '12.0');

  resetAdulterantState();
  const resetState = getAdulterantState();
  assert.equal(resetState.adulterantType, 'medetomidine');
  assert.equal(resetState.checkedFlags.size, 0);
  assert.equal(resetState.inrValue, '');
});

test('Adulterants & Heavy Metals: Static Security, Privacy & Invariant Verification', () => {
  const filePath = path.resolve('public/js/views/adulterantHeavyMetals.js');
  const content = fs.readFileSync(filePath, 'utf-8');

  assert.ok(!content.includes('localStorage'), 'Must not write to localStorage');
  assert.ok(!content.includes('sessionStorage'), 'Must not write to sessionStorage');
  assert.ok(!content.includes('document.cookie'), 'Must not write to document.cookie');
  assert.ok(!content.includes('innerHTML'), 'Must not use innerHTML');
  assert.ok(!content.includes('outerHTML'), 'Must not use outerHTML');
  assert.ok(!content.includes('style='), 'Must not use inline style= attributes');
});

test('Adulterants & Heavy Metals: DOM View Rendering and Mount', () => {
  const restoreDom = installMockDom();
  try {
    resetAdulterantState();
    const view = adulterantHeavyMetalsView();
    assert.ok(view, 'View mounts successfully');
    assert.equal(view.className, 'adulterant-view specialized-clinical-view');
    const sbar = view.querySelector('.nsti-sbar-textarea');
    assert.ok(sbar && (sbar.value.length > 50 || sbar.textContent.length > 50), 'SBAR textarea is populated with handoff content');
    const hrInput = view.querySelector('#hr-input');
    assert.ok(hrInput, 'Heart rate input is mounted in DOM');

    if (typeof view._cleanup === 'function') {
      view._cleanup();
    }
  } finally {
    restoreDom();
  }
});
