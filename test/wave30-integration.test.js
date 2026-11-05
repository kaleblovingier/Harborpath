// test/wave30-integration.test.js
// HarborPath - Wave 30 Architecture & Needle Stick / Bloodborne Pathogen PEP Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 30 Architecture & Needle Stick / PEP Integration', () => {
  it('registers needle-exposure in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['needle-exposure'], 'function');
    const viewFn = await LAZY_LOADERS['needle-exposure']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['needle-exposure'], 'function');
    const title = ROUTE_TITLES['needle-exposure']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads needle-exposure via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('needle-exposure');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 39);
  });

  it('includes needle-exposure in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'needle-exposure');
    assert.ok(entry, 'Missing needle-exposure in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/needle-exposure');
    assert.strictEqual(entry.category, 'harm-reduction');
    assert.ok(entry.title.includes('Needle') || entry.title.includes('needle'));
    assert.ok(entry.description.includes('PEP') || entry.description.includes('OSHA'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Filter tests
    const resNeedle = filterCareTools({ query: 'needle' });
    assert.ok(resNeedle.some((t) => t.id === 'needle-exposure'));

    const resPep = filterCareTools({ query: 'pep' });
    assert.ok(resPep.some((t) => t.id === 'needle-exposure'));

    const resOsha = filterCareTools({ query: 'osha' });
    assert.ok(resOsha.some((t) => t.id === 'needle-exposure'));

    const resSharps = filterCareTools({ query: 'sharps' });
    assert.ok(resSharps.some((t) => t.id === 'needle-exposure'));
  });

  it('includes /js/views/needleExposure.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/needleExposure.js'"),
      'needleExposure.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.needleExposure'], 'Missing route.needleExposure in es.js');
    assert.ok(es['route.needleExposure'].includes('pinchazos'));

    assert.ok(esTools['tools.item.needle-exposure.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.needle-exposure.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.needle-exposure.description'].includes('PEP'));

    assert.ok(esWorkspace['workspace.link.needleExposure'], 'Missing workspace.link.needleExposure in es-workspace.js');
  });

  it('integrates cross-module linkages in woundInfectious.js, viralHepatitis.js, hospitalCare.js, workplaceRights.js, and workspace.js', () => {
    const woundContent = fs.readFileSync('public/js/views/woundInfectious.js', 'utf8');
    assert.ok(woundContent.includes('#/needle-exposure'), 'Missing linkage in woundInfectious.js');

    const viralContent = fs.readFileSync('public/js/views/viralHepatitis.js', 'utf8');
    assert.ok(viralContent.includes('#/needle-exposure'), 'Missing linkage in viralHepatitis.js');

    const hospContent = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hospContent.includes('#/needle-exposure'), 'Missing linkage in hospitalCare.js');

    const workContent = fs.readFileSync('public/js/views/workplaceRights.js', 'utf8');
    assert.ok(workContent.includes('#/needle-exposure'), 'Missing linkage in workplaceRights.js');

    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/needle-exposure'), 'Missing linkage in workspace.js');
  });
});
