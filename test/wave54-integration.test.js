import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { LAZY_LOADERS, ROUTE_TITLES, resolveRoute, runQuickExitResets } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import { CARE_WORKSPACE_STAGES } from '../public/js/views/workspace.js';
import { getObstetricState, setObstetricState } from '../public/js/views/obstetricEmergencies.js';
import { getIcuState, setIcuState } from '../public/js/views/icuPerioperative.js';

test('Wave 54 routes (#/obstetric-emergencies and #/icu-perioperative) are registered in LAZY_LOADERS and ROUTE_TITLES', async () => {
  assert.equal(typeof LAZY_LOADERS['obstetric-emergencies'], 'function');
  assert.equal(typeof LAZY_LOADERS['icu-perioperative'], 'function');
  assert.equal(typeof ROUTE_TITLES['obstetric-emergencies'], 'function');
  assert.equal(typeof ROUTE_TITLES['icu-perioperative'], 'function');

  const obRoute = resolveRoute('obstetric-emergencies', new URLSearchParams());
  assert.ok(obRoute.title.toLowerCase().includes('obstetric'));

  const icuRoute = resolveRoute('icu-perioperative', new URLSearchParams());
  assert.ok(icuRoute.title.toLowerCase().includes('critical care'));

  const obViewFn = await LAZY_LOADERS['obstetric-emergencies']();
  const icuViewFn = await LAZY_LOADERS['icu-perioperative']();
  assert.equal(typeof obViewFn, 'function');
  assert.equal(typeof icuViewFn, 'function');
});

test('Quick Exit wipes both obstetricEmergencies and icuPerioperative states', async () => {
  await LAZY_LOADERS['obstetric-emergencies']();
  await LAZY_LOADERS['icu-perioperative']();

  setObstetricState({
    selectedSyndrome: 'nows_eat_sleep_console',
    newbornOpioidExposureNowsEscCare: true,
    clinicalNotes: 'ESC rooming-in',
  });
  setIcuState({
    selectedSyndrome: 'icu_analgosedation_fentanyl_xylazine',
    ventilatedFentanylXylazineAgitationDyssynchrony: true,
    clinicalNotes: 'Dexmedetomidine drip',
  });

  runQuickExitResets();

  assert.equal(getObstetricState().selectedSyndrome, 'stimulant_preeclampsia_abruption');
  assert.equal(getObstetricState().newbornOpioidExposureNowsEscCare, false);
  assert.equal(getObstetricState().clinicalNotes, '');

  assert.equal(getIcuState().selectedSyndrome, 'rsi_induction_neuromuscular_blockade');
  assert.equal(getIcuState().ventilatedFentanylXylazineAgitationDyssynchrony, false);
  assert.equal(getIcuState().clinicalNotes, '');
});

test('TOOL_CATALOG and CARE_WORKSPACE_STAGES discover obstetric-emergencies and icu-perioperative', () => {
  const obTool = TOOL_CATALOG.find((t) => t.id === 'obstetric-emergencies');
  const icuTool = TOOL_CATALOG.find((t) => t.id === 'icu-perioperative');
  assert.ok(obTool, 'obstetric-emergencies in TOOL_CATALOG');
  assert.ok(icuTool, 'icu-perioperative in TOOL_CATALOG');

  const byPreeclampsia = filterCareTools({ query: 'preeclampsia' });
  assert.ok(byPreeclampsia.some((t) => t.id === 'obstetric-emergencies'));

  const bySuccinylcholine = filterCareTools({ query: 'succinylcholine' });
  assert.ok(bySuccinylcholine.some((t) => t.id === 'icu-perioperative'));

  const stageLinks = CARE_WORKSPACE_STAGES[0].links.map((l) => l.href);
  assert.ok(stageLinks.includes('#/obstetric-emergencies'));
  assert.ok(stageLinks.includes('#/icu-perioperative'));
});

test('Wave 54 view files enforce zero-storage, zero-inline-markup, and service worker precache rules', () => {
  const obSrc = fs.readFileSync(path.resolve('public/js/views/obstetricEmergencies.js'), 'utf8');
  const icuSrc = fs.readFileSync(path.resolve('public/js/views/icuPerioperative.js'), 'utf8');

  for (const [name, src] of [['obstetricEmergencies.js', obSrc], ['icuPerioperative.js', icuSrc]]) {
    assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(src), `${name} must not use browser storage`);
    assert.ok(!/innerHTML|outerHTML/.test(src), `${name} must not use innerHTML/outerHTML`);
  }

  const swSrc = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');
  assert.ok(swSrc.includes("'/js/views/obstetricEmergencies.js'"));
  assert.ok(swSrc.includes("'/js/views/icuPerioperative.js'"));
});
