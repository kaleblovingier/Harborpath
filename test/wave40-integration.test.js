// test/wave40-integration.test.js
// HarborPath - Wave 40 Architecture & Liver Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 40 Architecture & Liver Care Integration', () => {
  it('registers liver-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['liver-care'], 'function');
    const viewFn = await LAZY_LOADERS['liver-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['liver-care'], 'function');
    const title = ROUTE_TITLES['liver-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads liver-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('liver-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 49);
  });

  it('includes liver-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'liver-care');
    assert.ok(entry, 'Missing liver-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/liver-care');
    assert.strictEqual(entry.category, 'clinical-support');
    assert.ok(entry.title.includes('Liver') || entry.title.includes('APAP'));
    assert.ok(entry.description.includes('AASLD') || entry.description.includes('Rumack-Matthew'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resLiv = filterCareTools({ query: 'liver' });
    assert.ok(resLiv.some((t) => t.id === 'liver-care'));

    const resApap = filterCareTools({ query: 'apap' });
    assert.ok(resApap.some((t) => t.id === 'liver-care'));

    const resCir = filterCareTools({ query: 'cirrhosis' });
    assert.ok(resCir.some((t) => t.id === 'liver-care'));

    const resNom = filterCareTools({ query: 'nomogram' });
    assert.ok(resNom.some((t) => t.id === 'liver-care'));
  });

  it('includes /js/views/liverCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/liverCare.js'"),
      'liverCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.liverCare'], 'Missing route.liverCare in es.js');
    assert.ok(es['route.liverCare'].includes('hepática') || es['route.liverCare'].includes('paracetamol'));

    assert.ok(esTools['tools.item.liver-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.liver-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.liver-care.description'].includes('paracetamol') || esTools['tools.item.liver-care.description'].includes('Child-Pugh'));

    assert.ok(esWorkspace['workspace.link.liverCare'], 'Missing workspace.link.liverCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, viralHepatitis.js, alcoholCare.js, medications.js, and toxicologyTriage.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/liver-care'), 'Missing linkage in workspace.js');

    const hepContent = fs.readFileSync('public/js/views/viralHepatitis.js', 'utf8');
    assert.ok(hepContent.includes('#/liver-care'), 'Missing linkage in viralHepatitis.js');

    const alcContent = fs.readFileSync('public/js/views/alcoholCare.js', 'utf8');
    assert.ok(alcContent.includes('#/liver-care'), 'Missing linkage in alcoholCare.js');

    const medContent = fs.readFileSync('public/js/views/medications.js', 'utf8');
    assert.ok(medContent.includes('#/liver-care'), 'Missing linkage in medications.js');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/liver-care'), 'Missing linkage in toxicologyTriage.js');
  });

  it('maintains the 14-link primary navigation invariant in public/index.html', () => {
    const html = fs.readFileSync('public/index.html', 'utf8');
    const navMatch = html.match(/<nav[^>]*id="site-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(navMatch, 'Could not locate #site-nav in public/index.html');
    const links = navMatch[1].match(/<a\s+[^>]*href="[^"]*"[^>]*>/g) || [];
    assert.strictEqual(
      links.length,
      14,
      `Primary site-nav must remain strictly at 14 links, but found ${links.length}`
    );
  });
});
