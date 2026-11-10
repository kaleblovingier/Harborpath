// test/wave35-integration.test.js
// HarborPath - Wave 35 Architecture & GHB/GBL Harm Reduction, Coma Triage & Withdrawal Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 35 Architecture & GHB/GBL Care Integration', () => {
  it('registers ghb-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['ghb-care'], 'function');
    const viewFn = await LAZY_LOADERS['ghb-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['ghb-care'], 'function');
    const title = ROUTE_TITLES['ghb-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads ghb-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('ghb-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 44);
  });

  it('includes ghb-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'ghb-care');
    assert.ok(entry, 'Missing ghb-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/ghb-care');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('GHB') || entry.title.includes('GBL'));
    assert.ok(entry.description.includes('coma') || entry.description.includes('Baclofen'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search filter verification
    const resGhb = filterCareTools({ query: 'ghb' });
    assert.ok(resGhb.some((t) => t.id === 'ghb-care'));

    const resGbl = filterCareTools({ query: 'gbl' });
    assert.ok(resGbl.some((t) => t.id === 'ghb-care'));

    const resGout = filterCareTools({ query: 'coma' });
    assert.ok(resGout.some((t) => t.id === 'ghb-care'));
  });

  it('includes /js/views/ghbCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/ghbCare.js'"),
      'ghbCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.ghbCare'], 'Missing route.ghbCare in es.js');
    assert.ok(es['route.ghbCare'].includes('GHB/GBL'));

    assert.ok(esTools['tools.item.ghb-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.ghb-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.ghb-care.description'].includes('G-out'));

    assert.ok(esWorkspace['workspace.link.ghbCare'], 'Missing workspace.link.ghbCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, nightlifeCare.js, lgbtqCare.js, toxicologyTriage.js, and polysubstanceCare.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/ghb-care'), 'Missing linkage in workspace.js');

    const nightContent = fs.readFileSync('public/js/views/nightlifeCare.js', 'utf8');
    assert.ok(nightContent.includes('#/ghb-care'), 'Missing linkage in nightlifeCare.js');

    const lgbtqContent = fs.readFileSync('public/js/views/lgbtqCare.js', 'utf8');
    assert.ok(lgbtqContent.includes('#/ghb-care'), 'Missing linkage in lgbtqCare.js');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/ghb-care'), 'Missing linkage in toxicologyTriage.js');

    const polyContent = fs.readFileSync('public/js/views/polysubstanceCare.js', 'utf8');
    assert.ok(polyContent.includes('#/ghb-care'), 'Missing linkage in polysubstanceCare.js');
  });
});
