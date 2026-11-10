import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { installMockDom } from './fixtures/mockDomHelper.js';

import {
  FUNGAL_PATHOGENS,
  AZOLE_MOUD_INTERACTIONS,
  evaluateFungalInfection,
  getFungalState,
  updateFungalState,
  resetFungalState,
  subscribeFungalState,
  generateFungalSbar,
  fungalOpportunisticCareView,
} from '../public/js/views/fungalOpportunisticCare.js';

test('FUNGAL_PATHOGENS covers verified endemic mycoses and molds with accurate hallmarks', () => {
  assert.ok(FUNGAL_PATHOGENS.blastomycosis);
  assert.ok(FUNGAL_PATHOGENS.coccidioidomycosis);
  assert.ok(FUNGAL_PATHOGENS.histoplasmosis);
  assert.ok(FUNGAL_PATHOGENS.aspergillus);
  assert.ok(FUNGAL_PATHOGENS.mucorales);

  assert.ok(FUNGAL_PATHOGENS.blastomycosis.morphologyEn.includes('Broad-based budding'));
  assert.ok(FUNGAL_PATHOGENS.coccidioidomycosis.morphologyEn.includes('spherules'));
  assert.ok(FUNGAL_PATHOGENS.aspergillus.morphologyEn.includes('45°'));
  assert.ok(FUNGAL_PATHOGENS.mucorales.morphologyEn.includes('90°'));
});

test('AZOLE_MOUD_INTERACTIONS specifies CYP3A4 and QTc multiplicative mechanisms', () => {
  assert.ok(AZOLE_MOUD_INTERACTIONS.methadone_cyp3a4);
  assert.ok(AZOLE_MOUD_INTERACTIONS.qtc_prolongation);
  assert.ok(AZOLE_MOUD_INTERACTIONS.buprenorphine_cyp3a4);

  assert.ok(AZOLE_MOUD_INTERACTIONS.methadone_cyp3a4.clinicalMandateEn.includes('25% TO 50%'));
  assert.ok(AZOLE_MOUD_INTERACTIONS.qtc_prolongation.clinicalMandateEn.includes('ECG'));
});

test('evaluateFungalInfection detects steroid hazard in fungal lesions and surgical emergencies', () => {
  // Scenario 1: Blastomycosis misdiagnosed as Pyoderma Gangrenosum with steroid prescription
  const res1 = evaluateFungalInfection({
    pathogen: 'blastomycosis',
    moudType: 'methadone',
    baselineQtc: 440,
    hasVerrucousPlaques: true,
    hasBlackEschar: false,
    hasSpondylodiscitis: false,
    isImmunocompromised: false,
    steroidsPrescribed: true,
  });

  assert.ok(res1.alerts.some((a) => a.textEn.includes('CRITICAL LETHAL HAZARD')));
  assert.ok(res1.alerts.some((a) => a.textEn.includes('HALT STEROIDS STAT')));
  assert.ok(res1.diagnosticDirectives.some((d) => d.titleEn.includes('Punch Biopsy with Fungal Stains')));
  assert.ok(res1.therapeuticActions.some((a) => a.includes('reduce Methadone dose by 25%–50%')));

  // Scenario 2: Mucormycosis with black necrotic eschar + high baseline QTc
  const res2 = evaluateFungalInfection({
    pathogen: 'mucorales',
    moudType: 'methadone',
    baselineQtc: 495,
    hasVerrucousPlaques: false,
    hasBlackEschar: true,
    hasSpondylodiscitis: false,
    isImmunocompromised: true,
    steroidsPrescribed: false,
  });

  assert.ok(res2.alerts.some((a) => a.textEn.includes('SURGICAL EMERGENCY')));
  assert.ok(res2.alerts.some((a) => a.textEn.includes('High Baseline QTc Interval')));
  assert.ok(res2.therapeuticActions.some((a) => a.includes('Liposomal Amphotericin B')));
  assert.ok(res2.therapeuticActions.some((a) => a.includes('Isavuconazole')));
});

test('In-RAM ephemeral state controller manages updates and clean resets', () => {
  resetFungalState();
  assert.equal(getFungalState().pathogen, 'blastomycosis');

  let notified = false;
  const unsub = subscribeFungalState((st) => {
    if (st.baselineQtc === 510) notified = true;
  });

  updateFungalState({ baselineQtc: 510 });
  assert.equal(getFungalState().baselineQtc, 510);
  assert.ok(notified);

  unsub();
  resetFungalState();
  assert.equal(getFungalState().baselineQtc, 450);
});

test('generateFungalSbar produces bilingual structured handoff notes with zero PII', () => {
  const st = {
    pathogen: 'blastomycosis',
    moudType: 'methadone',
    baselineQtc: 460,
    hasVerrucousPlaques: true,
    hasBlackEschar: false,
    hasSpondylodiscitis: true,
    isImmunocompromised: false,
    steroidsPrescribed: false,
  };

  const sbarEn = generateFungalSbar(st, 'en');
  assert.ok(sbarEn.includes('SBAR CLINICAL HANDOFF'));
  assert.ok(sbarEn.includes('BLASTOMYCOSIS'));
  assert.ok(sbarEn.includes('METHADONE'));
  assert.ok(sbarEn.includes('25%–50%'));

  const sbarEs = generateFungalSbar(st, 'es');
  assert.ok(sbarEs.includes('TRANSFERENCIA CLÍNICA SBAR'));
  assert.ok(sbarEs.includes('BLASTOMICOSIS'));
  assert.ok(sbarEs.includes('25%-50%'));
});

test('fungalOpportunisticCareView mounts accessible DOM tree without innerHTML or style attributes', () => {
  const restoreDom = installMockDom();
  try {
    const view = fungalOpportunisticCareView();
    assert.ok(view);
    assert.equal(view.className, 'fungal-care-view');
  } finally {
    restoreDom();
  }

  const fileContent = fs.readFileSync(path.resolve('public/js/views/fungalOpportunisticCare.js'), 'utf-8');
  assert.equal(fileContent.includes('innerHTML'), false);
  assert.equal(fileContent.includes('outerHTML'), false);
  assert.equal(fileContent.includes('insertAdjacentHTML'), false);
  assert.equal(/setAttribute\s*\(\s*['"]style['"]/i.test(fileContent), false);
});
