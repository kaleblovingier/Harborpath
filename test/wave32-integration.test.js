// test/wave32-integration.test.js
// HarborPath - Wave 32 Architecture & Novel Psychoactive Substances, Kratom, Tianeptine Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 32 Architecture & Novel Substances / Kratom / Tianeptine Integration', () => {
  it('registers novel-substances in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['novel-substances'], 'function');
    const viewFn = await LAZY_LOADERS['novel-substances']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['novel-substances'], 'function');
    const title = ROUTE_TITLES['novel-substances']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads novel-substances via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('novel-substances');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 41);
  });

  it('includes novel-substances in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'novel-substances');
    assert.ok(entry, 'Missing novel-substances in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/novel-substances');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('kratom') || entry.title.includes('tianeptine') || entry.title.includes('Novel substances'));
    assert.ok(entry.description.includes('tianeptine') || entry.description.includes('kratom'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search filter verification
    const resTian = filterCareTools({ query: 'tianeptine' });
    assert.ok(resTian.some((t) => t.id === 'novel-substances'));

    const resKratom = filterCareTools({ query: 'kratom' });
    assert.ok(resKratom.some((t) => t.id === 'novel-substances'));

    const resPhen = filterCareTools({ query: 'phenibut' });
    assert.ok(resPhen.some((t) => t.id === 'novel-substances'));

    const resZaza = filterCareTools({ query: 'zaza' });
    assert.ok(resZaza.some((t) => t.id === 'novel-substances'));
  });

  it('includes /js/views/novelSubstances.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/novelSubstances.js'"),
      'novelSubstances.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.novelSubstances'], 'Missing route.novelSubstances in es.js');
    assert.ok(es['route.novelSubstances'].includes('tianeptina') || es['route.novelSubstances'].includes('kratom'));

    assert.ok(esTools['tools.item.novel-substances.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.novel-substances.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.novel-substances.description'].includes('tianeptina'));

    assert.ok(esWorkspace['workspace.link.novelSubstances'], 'Missing workspace.link.novelSubstances in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, toxicologyTriage.js, hospitalCare.js, polysubstanceCare.js, and medications.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/novel-substances'), 'Missing linkage in workspace.js');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/novel-substances'), 'Missing linkage in toxicologyTriage.js');

    const hospContent = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hospContent.includes('#/novel-substances'), 'Missing linkage in hospitalCare.js');

    const polyContent = fs.readFileSync('public/js/views/polysubstanceCare.js', 'utf8');
    assert.ok(polyContent.includes('#/novel-substances'), 'Missing linkage in polysubstanceCare.js');

    const medsContent = fs.readFileSync('public/js/views/medications.js', 'utf8');
    assert.ok(medsContent.includes('#/novel-substances'), 'Missing linkage in medications.js');
  });
});
