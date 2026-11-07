// test/wave31-integration.test.js
// HarborPath - Wave 31 Architecture & Sexual Health, Doxy-PEP & PrEP Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 31 Architecture & Sexual Health / Doxy-PEP Integration', () => {
  it('registers sexual-health in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['sexual-health'], 'function');
    const viewFn = await LAZY_LOADERS['sexual-health']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['sexual-health'], 'function');
    const title = ROUTE_TITLES['sexual-health']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads sexual-health via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('sexual-health');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 40);
  });

  it('includes sexual-health in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'sexual-health');
    assert.ok(entry, 'Missing sexual-health in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/sexual-health');
    assert.strictEqual(entry.category, 'harm-reduction');
    assert.ok(entry.title.includes('Doxy') || entry.title.includes('sexual'));
    assert.ok(entry.description.includes('Doxy-PEP') || entry.description.includes('contraception'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Filter tests
    const resDoxy = filterCareTools({ query: 'doxy' });
    assert.ok(resDoxy.some((t) => t.id === 'sexual-health'));

    const resPrep = filterCareTools({ query: 'prep' });
    assert.ok(resPrep.some((t) => t.id === 'sexual-health'));

    const resEc = filterCareTools({ query: 'contraception' });
    assert.ok(resEc.some((t) => t.id === 'sexual-health'));

    const resSexual = filterCareTools({ query: 'sexual' });
    assert.ok(resSexual.some((t) => t.id === 'sexual-health'));
  });

  it('includes /js/views/sexualHealth.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/sexualHealth.js'"),
      'sexualHealth.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.sexualHealth'], 'Missing route.sexualHealth in es.js');
    assert.ok(es['route.sexualHealth'].includes('Doxy-PEP'));

    assert.ok(esTools['tools.item.sexual-health.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.sexual-health.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.sexual-health.description'].includes('Doxy-PEP'));

    assert.ok(esWorkspace['workspace.link.sexualHealth'], 'Missing workspace.link.sexualHealth in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, perinatal.js, lgbtqCare.js, and needleExposure.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/sexual-health'), 'Missing linkage in workspace.js');

    const periContent = fs.readFileSync('public/js/views/perinatal.js', 'utf8');
    assert.ok(periContent.includes('#/sexual-health'), 'Missing linkage in perinatal.js');

    const lgbtqContent = fs.readFileSync('public/js/views/lgbtqCare.js', 'utf8');
    assert.ok(lgbtqContent.includes('#/sexual-health'), 'Missing linkage in lgbtqCare.js');

    const needleContent = fs.readFileSync('public/js/views/needleExposure.js', 'utf8');
    assert.ok(needleContent.includes('#/sexual-health'), 'Missing linkage in needleExposure.js');
  });
});
