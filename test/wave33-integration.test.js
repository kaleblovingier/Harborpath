// test/wave33-integration.test.js
// HarborPath - Wave 33 Architecture & Gabapentinoid Safety, Respiratory Synergy & Deprescribing Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 33 Architecture & Gabapentinoid Safety / Deprescribing Integration', () => {
  it('registers gabapentinoid-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['gabapentinoid-care'], 'function');
    const viewFn = await LAZY_LOADERS['gabapentinoid-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['gabapentinoid-care'], 'function');
    const title = ROUTE_TITLES['gabapentinoid-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads gabapentinoid-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('gabapentinoid-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 42);
  });

  it('includes gabapentinoid-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'gabapentinoid-care');
    assert.ok(entry, 'Missing gabapentinoid-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/gabapentinoid-care');
    assert.strictEqual(entry.category, 'care');
    assert.ok(entry.title.includes('Gabapentinoids') || entry.title.includes('deprescribing'));
    assert.ok(entry.description.includes('synergy') || entry.description.includes('deprescribing'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search filter verification
    const resGaba = filterCareTools({ query: 'gabapentin' });
    assert.ok(resGaba.some((t) => t.id === 'gabapentinoid-care'));

    const resPregab = filterCareTools({ query: 'pregabalin' });
    assert.ok(resPregab.some((t) => t.id === 'gabapentinoid-care'));

    const resLyrica = filterCareTools({ query: 'deprescribing' });
    assert.ok(resLyrica.some((t) => t.id === 'gabapentinoid-care'));
  });

  it('includes /js/views/gabapentinoidCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/gabapentinoidCare.js'"),
      'gabapentinoidCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.gabapentinoidCare'], 'Missing route.gabapentinoidCare in es.js');
    assert.ok(es['route.gabapentinoidCare'].includes('Gabapentinoides'));

    assert.ok(esTools['tools.item.gabapentinoid-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.gabapentinoid-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.gabapentinoid-care.description'].includes('Horowitz-Taylor'));

    assert.ok(esWorkspace['workspace.link.gabapentinoidCare'], 'Missing workspace.link.gabapentinoidCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, chronicPain.js, polysubstanceCare.js, olderAdults.js, and medications.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/gabapentinoid-care'), 'Missing linkage in workspace.js');

    const painContent = fs.readFileSync('public/js/views/chronicPain.js', 'utf8');
    assert.ok(painContent.includes('#/gabapentinoid-care'), 'Missing linkage in chronicPain.js');

    const polyContent = fs.readFileSync('public/js/views/polysubstanceCare.js', 'utf8');
    assert.ok(polyContent.includes('#/gabapentinoid-care'), 'Missing linkage in polysubstanceCare.js');

    const olderContent = fs.readFileSync('public/js/views/olderAdults.js', 'utf8');
    assert.ok(olderContent.includes('#/gabapentinoid-care'), 'Missing linkage in olderAdults.js');

    const medsContent = fs.readFileSync('public/js/views/medications.js', 'utf8');
    assert.ok(medsContent.includes('#/gabapentinoid-care'), 'Missing linkage in medications.js');
  });
});
