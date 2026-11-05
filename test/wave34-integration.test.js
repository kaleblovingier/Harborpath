// test/wave34-integration.test.js
// HarborPath - Wave 34 Architecture & Psychedelic Harm Reduction, 5-HT2A De-Escalation & HPPD Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 34 Architecture & Psychedelic Care / 5-HT2A Integration', () => {
  it('registers psychedelic-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['psychedelic-care'], 'function');
    const viewFn = await LAZY_LOADERS['psychedelic-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['psychedelic-care'], 'function');
    const title = ROUTE_TITLES['psychedelic-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads psychedelic-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('psychedelic-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 43);
  });

  it('includes psychedelic-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'psychedelic-care');
    assert.ok(entry, 'Missing psychedelic-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/psychedelic-care');
    assert.strictEqual(entry.category, 'care');
    assert.ok(entry.title.includes('Psychedelic') || entry.title.includes('5-HT2A'));
    assert.ok(entry.description.includes('Fireside') || entry.description.includes('Lithium'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search filter verification
    const resPsilo = filterCareTools({ query: 'psychedelic' });
    assert.ok(resPsilo.some((t) => t.id === 'psychedelic-care'));

    const resHppd = filterCareTools({ query: 'hppd' });
    assert.ok(resHppd.some((t) => t.id === 'psychedelic-care'));

    const resLith = filterCareTools({ query: 'lithium' });
    assert.ok(resLith.some((t) => t.id === 'psychedelic-care'));
  });

  it('includes /js/views/psychedelicCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/psychedelicCare.js'"),
      'psychedelicCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.psychedelicCare'], 'Missing route.psychedelicCare in es.js');
    assert.ok(es['route.psychedelicCare'].includes('psicodélicos'));

    assert.ok(esTools['tools.item.psychedelic-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.psychedelic-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.psychedelic-care.description'].includes('Fireside'));

    assert.ok(esWorkspace['workspace.link.psychedelicCare'], 'Missing workspace.link.psychedelicCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, toxicologyTriage.js, nightlifeCare.js, medications.js, and dualDiagnosis.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/psychedelic-care'), 'Missing linkage in workspace.js');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/psychedelic-care'), 'Missing linkage in toxicologyTriage.js');

    const nightContent = fs.readFileSync('public/js/views/nightlifeCare.js', 'utf8');
    assert.ok(nightContent.includes('#/psychedelic-care'), 'Missing linkage in nightlifeCare.js');

    const medsContent = fs.readFileSync('public/js/views/medications.js', 'utf8');
    assert.ok(medsContent.includes('#/psychedelic-care'), 'Missing linkage in medications.js');

    const dualContent = fs.readFileSync('public/js/views/dualDiagnosis.js', 'utf8');
    assert.ok(dualContent.includes('#/psychedelic-care'), 'Missing linkage in dualDiagnosis.js');
  });
});
