import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { LAZY_LOADERS, ROUTE_TITLES, resolveRoute, runQuickExitResets } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import { CARE_WORKSPACE_STAGES } from '../public/js/views/workspace.js';
import { getPediatricState, setPediatricState } from '../public/js/views/pediatricExposures.js';
import { getGeriatricState, setGeriatricState } from '../public/js/views/geriatricCare.js';

test('Wave 55 routes (#/pediatric-exposures and #/geriatric-care) are registered in LAZY_LOADERS and ROUTE_TITLES', async () => {
  assert.equal(typeof LAZY_LOADERS['pediatric-exposures'], 'function');
  assert.equal(typeof LAZY_LOADERS['geriatric-care'], 'function');
  assert.equal(typeof ROUTE_TITLES['pediatric-exposures'], 'function');
  assert.equal(typeof ROUTE_TITLES['geriatric-care'], 'function');

  const pedRoute = resolveRoute('pediatric-exposures', new URLSearchParams());
  assert.ok(pedRoute.title.toLowerCase().includes('pediatric'));

  const gerRoute = resolveRoute('geriatric-care', new URLSearchParams());
  assert.ok(gerRoute.title.toLowerCase().includes('geriatric'));

  const pedViewFn = await LAZY_LOADERS['pediatric-exposures']();
  const gerViewFn = await LAZY_LOADERS['geriatric-care']();
  assert.equal(typeof pedViewFn, 'function');
  assert.equal(typeof gerViewFn, 'function');
});

test('Quick Exit resets both pediatricExposures and geriatricCare states', async () => {
  await LAZY_LOADERS['pediatric-exposures']();
  await LAZY_LOADERS['geriatric-care']();

  setPediatricState({
    selectedSyndrome: 'cannabis_edible_ingestion',
    edibleCannabisIngestion: true,
    clinicalNotes: 'Child ate gummy bear look-alike',
  });
  setGeriatricState({
    selectedSyndromeId: 'anticholinergic_cognitive_burden_acb',
    onAnticholinergics: true,
    clinicalNotes: 'ACB score elevated note',
  });

  runQuickExitResets();

  assert.equal(getPediatricState().selectedSyndrome, 'buprenorphine_methadone_ingestion');
  assert.equal(getPediatricState().edibleCannabisIngestion, false);
  assert.equal(getPediatricState().clinicalNotes, '');

  assert.equal(getGeriatricState().selectedSyndromeId, 'beers_sedative_polypharmacy');
  assert.equal(getGeriatricState().onAnticholinergics, false);
  assert.equal(getGeriatricState().clinicalNotes, '');
});

test('TOOL_CATALOG and CARE_WORKSPACE_STAGES discover pediatric-exposures and geriatric-care', () => {
  const pedTool = TOOL_CATALOG.find((t) => t.id === 'pediatric-exposures');
  const gerTool = TOOL_CATALOG.find((t) => t.id === 'geriatric-care');
  assert.ok(pedTool, 'pediatric-exposures in TOOL_CATALOG');
  assert.ok(gerTool, 'geriatric-care in TOOL_CATALOG');

  const byPoison = filterCareTools({ query: 'pediatric' });
  assert.ok(byPoison.some((t) => t.id === 'pediatric-exposures'));

  const byBeers = filterCareTools({ query: 'beers' });
  assert.ok(byBeers.some((t) => t.id === 'geriatric-care'));

  const stageLinks = CARE_WORKSPACE_STAGES[0].links.map((l) => l.href);
  assert.ok(stageLinks.includes('#/pediatric-exposures'));
  assert.ok(stageLinks.includes('#/geriatric-care'));
});

test('Wave 55 view files enforce zero-storage, zero-inline-markup, and service worker precache rules', () => {
  const pedSrc = fs.readFileSync(path.resolve('public/js/views/pediatricExposures.js'), 'utf8');
  const gerSrc = fs.readFileSync(path.resolve('public/js/views/geriatricCare.js'), 'utf8');

  for (const [name, src] of [['pediatricExposures.js', pedSrc], ['geriatricCare.js', gerSrc]]) {
    assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(src), `${name} must not use browser storage`);
    assert.ok(!/innerHTML|outerHTML/.test(src), `${name} must not use innerHTML/outerHTML`);
  }

  const swSrc = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');
  assert.ok(swSrc.includes("'/js/views/pediatricExposures.js'"));
  assert.ok(swSrc.includes("'/js/views/geriatricCare.js'"));
});

test('Existing views contain reciprocal cross-links to pediatric-exposures and geriatric-care', () => {
  const adolSrc = fs.readFileSync(path.resolve('public/js/views/adolescentCare.js'), 'utf8');
  const periSrc = fs.readFileSync(path.resolve('public/js/views/perinatal.js'), 'utf8');
  const oldSrc = fs.readFileSync(path.resolve('public/js/views/olderAdults.js'), 'utf8');
  const toxSrc = fs.readFileSync(path.resolve('public/js/views/toxicologyTriage.js'), 'utf8');

  assert.ok(adolSrc.includes('#/pediatric-exposures'), 'adolescentCare has pediatric link');
  assert.ok(periSrc.includes('#/pediatric-exposures'), 'perinatal has pediatric link');
  assert.ok(oldSrc.includes('#/geriatric-care'), 'olderAdults has geriatric link');
  assert.ok(toxSrc.includes('#/pediatric-exposures'), 'toxicologyTriage has pediatric link');
  assert.ok(toxSrc.includes('#/geriatric-care'), 'toxicologyTriage has geriatric link');
});
