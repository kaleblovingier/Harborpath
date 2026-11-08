import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { LAZY_LOADERS, ROUTE_TITLES, resolveRoute, runQuickExitResets } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import { CARE_WORKSPACE_STAGES } from '../public/js/views/workspace.js';
import { getCardiologyState, setCardiologyState } from '../public/js/views/cardiologyCare.js';
import { getOncologyState, setOncologyState } from '../public/js/views/oncologyPalliative.js';

test('Wave 53 routes (#/cardiology-care and #/oncology-palliative) are registered in LAZY_LOADERS and ROUTE_TITLES', async () => {
  assert.equal(typeof LAZY_LOADERS['cardiology-care'], 'function');
  assert.equal(typeof LAZY_LOADERS['oncology-palliative'], 'function');
  assert.equal(typeof ROUTE_TITLES['cardiology-care'], 'function');
  assert.equal(typeof ROUTE_TITLES['oncology-palliative'], 'function');

  const cardRoute = resolveRoute('cardiology-care', new URLSearchParams());
  assert.ok(cardRoute.title.toLowerCase().includes('cardiology'));

  const oncRoute = resolveRoute('oncology-palliative', new URLSearchParams());
  assert.ok(oncRoute.title.toLowerCase().includes('oncology'));

  const cardViewFn = await LAZY_LOADERS['cardiology-care']();
  const oncViewFn = await LAZY_LOADERS['oncology-palliative']();
  assert.equal(typeof cardViewFn, 'function');
  assert.equal(typeof oncViewFn, 'function');
});

test('Quick Exit wipes both cardiologyCare and oncologyPalliative states', async () => {
  await LAZY_LOADERS['cardiology-care']();
  await LAZY_LOADERS['oncology-palliative']();

  setCardiologyState({
    selectedSyndrome: 'stimulant_aortic_dissection',
    tearingBackPainPulseDeficitDissection: true,
    clinicalNotes: 'Crack cocaine chest pain',
  });
  setOncologyState({
    selectedSyndrome: 'sickle_cell_voc_acute_chest',
    sickleCellVocPainOrChestInfiltrateHypoxia: true,
    clinicalNotes: 'Sickle cell ACS',
  });

  runQuickExitResets();

  assert.equal(getCardiologyState().selectedSyndrome, 'stimulant_acs_vasospasm');
  assert.equal(getCardiologyState().tearingBackPainPulseDeficitDissection, false);
  assert.equal(getCardiologyState().clinicalNotes, '');

  assert.equal(getOncologyState().selectedSyndrome, 'cancer_pain_on_moud');
  assert.equal(getOncologyState().sickleCellVocPainOrChestInfiltrateHypoxia, false);
  assert.equal(getOncologyState().clinicalNotes, '');
});

test('TOOL_CATALOG and CARE_WORKSPACE_STAGES discover cardiology-care and oncology-palliative', () => {
  const cardTool = TOOL_CATALOG.find((t) => t.id === 'cardiology-care');
  const oncTool = TOOL_CATALOG.find((t) => t.id === 'oncology-palliative');
  assert.ok(cardTool, 'cardiology-care in TOOL_CATALOG');
  assert.ok(oncTool, 'oncology-palliative in TOOL_CATALOG');

  const byTorsades = filterCareTools({ query: 'torsades' });
  assert.ok(byTorsades.some((t) => t.id === 'cardiology-care'));

  const bySickle = filterCareTools({ query: 'sickle cell' });
  assert.ok(bySickle.some((t) => t.id === 'oncology-palliative'));

  const stageLinks = CARE_WORKSPACE_STAGES[0].links.map((l) => l.href);
  assert.ok(stageLinks.includes('#/cardiology-care'));
  assert.ok(stageLinks.includes('#/oncology-palliative'));
});

test('Wave 53 view files enforce zero-storage, zero-inline-markup, and service worker precache rules', () => {
  const cardSrc = fs.readFileSync(path.resolve('public/js/views/cardiologyCare.js'), 'utf8');
  const oncSrc = fs.readFileSync(path.resolve('public/js/views/oncologyPalliative.js'), 'utf8');

  for (const [name, src] of [['cardiologyCare.js', cardSrc], ['oncologyPalliative.js', oncSrc]]) {
    assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(src), `${name} must not use browser storage`);
    assert.ok(!/innerHTML|outerHTML/.test(src), `${name} must not use innerHTML/outerHTML`);
  }

  const swSrc = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');
  assert.ok(swSrc.includes("'/js/views/cardiologyCare.js'"));
  assert.ok(swSrc.includes("'/js/views/oncologyPalliative.js'"));
});
