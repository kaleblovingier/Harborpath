import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { installMockDom } from './fixtures/mockDomHelper.js';

import {
  DISASTER_MOUD_FLEXIBILITIES,
  AQI_LEVELS,
  RESPIRATORY_PROTECTION,
  POST_DISASTER_PATHOGENS,
  evaluateDisasterPlan,
  getDisasterState,
  updateDisasterState,
  resetDisasterState,
  subscribeDisasterState,
  generateDisasterSbar,
  disasterMoudClimateView,
} from '../public/js/views/disasterMoudClimate.js';

test('DISASTER_MOUD_FLEXIBILITIES exports valid 42 CFR Part 8 statutory tiers', () => {
  assert.ok(DISASTER_MOUD_FLEXIBILITIES.stable_takehome);
  assert.equal(DISASTER_MOUD_FLEXIBILITIES.stable_takehome.statuteEn, 'SAMHSA 42 CFR § 8.12(i)(1) / § 8.11(h)');
  assert.ok(DISASTER_MOUD_FLEXIBILITIES.stable_takehome.titleEn.includes('28 Days'));
  assert.ok(DISASTER_MOUD_FLEXIBILITIES.acute_takehome.titleEn.includes('14 Days'));
  assert.ok(DISASTER_MOUD_FLEXIBILITIES.guest_dosing);
  assert.ok(DISASTER_MOUD_FLEXIBILITIES.mobile_units);
});

test('AQI_LEVELS and RESPIRATORY_PROTECTION define verified environmental standards', () => {
  assert.ok(AQI_LEVELS.hazardous);
  assert.equal(AQI_LEVELS.hazardous.range, '301–500');
  assert.ok(RESPIRATORY_PROTECTION.n95.isRecommended);
  assert.ok(RESPIRATORY_PROTECTION.wet_cloth.isHazardous);
  assert.ok(POST_DISASTER_PATHOGENS.leptospirosis);
  assert.ok(POST_DISASTER_PATHOGENS.tetanus);
  assert.ok(POST_DISASTER_PATHOGENS.trench_foot);
});

test('evaluateDisasterPlan accurately authorizes take-homes and evaluates environmental risks', () => {
  // Scenario 1: Stable patient on methadone with high wildfire smoke and floodwater
  const res1 = evaluateDisasterPlan({
    patientStatus: 'stable',
    currentMedication: 'methadone',
    aqiLevel: 'very_unhealthy',
    floodExposure: true,
    dirtyPunctureWound: false,
    prolongedWetFeet: false,
    hasN95Mask: false,
    hasLockbox: true,
  });

  assert.equal(res1.takeHomeDays, 28);
  assert.ok(res1.alerts.some((a) => a.textEn.includes('PM2.5')));
  assert.ok(res1.alerts.some((a) => a.textEn.includes('Leptospirosis')));
  assert.ok(res1.actions.some((a) => a.titleEn.includes('NIOSH N95')));
  assert.ok(res1.requiredSupplies.includes('Doxycycline 100 mg / 200 mg'));

  // Scenario 2: Acute phase patient without lockbox + dirty puncture wound
  const res2 = evaluateDisasterPlan({
    patientStatus: 'acute',
    currentMedication: 'buprenorphine_sl',
    aqiLevel: 'moderate',
    floodExposure: false,
    dirtyPunctureWound: true,
    prolongedWetFeet: true,
    hasN95Mask: true,
    hasLockbox: false,
  });

  assert.equal(res2.takeHomeDays, 14);
  assert.ok(res2.alerts.some((a) => a.textEn.includes('Safe Storage Alert')));
  assert.ok(res2.alerts.some((a) => a.textEn.includes('tetanus hazard')));
  assert.ok(res2.actions.some((a) => a.titleEn.includes('Tetanus Booster + TIG')));
  assert.ok(res2.actions.some((a) => a.titleEn.includes('Trench Foot')));
});

test('Ephemeral in-RAM state controller handles updates, subscribers, and clean reset', () => {
  resetDisasterState();
  assert.equal(getDisasterState().patientStatus, 'stable');

  let notified = false;
  const unsub = subscribeDisasterState((st) => {
    if (st.aqiLevel === 'hazardous') notified = true;
  });

  updateDisasterState({ aqiLevel: 'hazardous' });
  assert.equal(getDisasterState().aqiLevel, 'hazardous');
  assert.ok(notified);

  unsub();
  resetDisasterState();
  assert.equal(getDisasterState().aqiLevel, 'moderate');
});

test('generateDisasterSbar produces bilingual structured handoff notes with zero PII', () => {
  const st = {
    patientStatus: 'stable',
    currentMedication: 'methadone',
    aqiLevel: 'unhealthy',
    floodExposure: true,
    dirtyPunctureWound: true,
    prolongedWetFeet: false,
    hasN95Mask: true,
    hasLockbox: true,
  };

  const sbarEn = generateDisasterSbar(st, 'en');
  assert.ok(sbarEn.includes('SBAR CLINICAL HANDOFF'));
  assert.ok(sbarEn.includes('METHADONE'));
  assert.ok(sbarEn.includes('28 days'));
  assert.ok(sbarEn.includes('Doxycycline'));
  assert.ok(sbarEn.includes('Tdap'));

  const sbarEs = generateDisasterSbar(st, 'es');
  assert.ok(sbarEs.includes('TRANSFERENCIA CLÍNICA SBAR'));
  assert.ok(sbarEs.includes('METADONA'));
  assert.ok(sbarEs.includes('28 días'));
});

test('disasterMoudClimateView mounts accessible DOM tree without innerHTML or style attributes', () => {
  const restoreDom = installMockDom();
  try {
    const view = disasterMoudClimateView();
    assert.ok(view);
    assert.equal(view.className, 'disaster-moud-view');
  } finally {
    restoreDom();
  }

  const fileContent = fs.readFileSync(path.resolve('public/js/views/disasterMoudClimate.js'), 'utf-8');
  assert.equal(fileContent.includes('innerHTML'), false);
  assert.equal(fileContent.includes('outerHTML'), false);
  assert.equal(fileContent.includes('insertAdjacentHTML'), false);
  assert.equal(/setAttribute\s*\(\s*['"]style['"]/i.test(fileContent), false);
});
