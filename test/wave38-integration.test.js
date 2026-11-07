// test/wave38-integration.test.js
// HarborPath - Wave 38 Architecture & Ketamine Uropathy Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 38 Architecture & Ketamine Care Integration', () => {
  it('registers ketamine-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['ketamine-care'], 'function');
    const viewFn = await LAZY_LOADERS['ketamine-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['ketamine-care'], 'function');
    const title = ROUTE_TITLES['ketamine-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads ketamine-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('ketamine-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 47);
  });

  it('includes ketamine-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'ketamine-care');
    assert.ok(entry, 'Missing ketamine-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/ketamine-care');
    assert.strictEqual(entry.category, 'harm-reduction');
    assert.ok(entry.title.includes('Ketamine') || entry.title.includes('uropathy'));
    assert.ok(entry.description.includes('Uropathy') || entry.description.includes('K-Bladder'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resKet = filterCareTools({ query: 'ketamine' });
    assert.ok(resKet.some((t) => t.id === 'ketamine-care'));

    const resUro = filterCareTools({ query: 'uropathy' });
    assert.ok(resUro.some((t) => t.id === 'ketamine-care'));

    const resBladder = filterCareTools({ query: 'bladder' });
    assert.ok(resBladder.some((t) => t.id === 'ketamine-care'));

    const resCramps = filterCareTools({ query: 'cramps' });
    assert.ok(resCramps.some((t) => t.id === 'ketamine-care'));
  });

  it('includes /js/views/ketamineCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/ketamineCare.js'"),
      'ketamineCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.ketamineCare'], 'Missing route.ketamineCare in es.js');
    assert.ok(es['route.ketamineCare'].includes('ketamina') || es['route.ketamineCare'].includes('Ketamina'));

    assert.ok(esTools['tools.item.ketamine-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.ketamine-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.ketamine-care.description'].includes('uropatía') || esTools['tools.item.ketamine-care.description'].includes('vejiga'));

    assert.ok(esWorkspace['workspace.link.ketamineCare'], 'Missing workspace.link.ketamineCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, nightlifeCare.js, toxicologyTriage.js, hospitalCare.js, and chronicPain.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/ketamine-care'), 'Missing linkage in workspace.js');

    const nightContent = fs.readFileSync('public/js/views/nightlifeCare.js', 'utf8');
    assert.ok(nightContent.includes('#/ketamine-care'), 'Missing linkage in nightlifeCare.js');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/ketamine-care'), 'Missing linkage in toxicologyTriage.js');

    const hospContent = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hospContent.includes('#/ketamine-care'), 'Missing linkage in hospitalCare.js');

    const painContent = fs.readFileSync('public/js/views/chronicPain.js', 'utf8');
    assert.ok(painContent.includes('#/ketamine-care'), 'Missing linkage in chronicPain.js');
  });

  it('strictly preserves the 14-link primary navigation invariant in public/index.html', () => {
    const html = fs.readFileSync('public/index.html', 'utf8');
    const navMatch = html.match(/<nav[^>]*id="site-nav"[^>]*>([\s\S]*?)<\/nav>/i);
    assert.ok(navMatch, 'site-nav element must be present in public/index.html');
    const links = navMatch[1].match(/<a\s+[^>]*href="#\/[^"]*"[^>]*>/gi) || [];
    assert.strictEqual(
      links.length,
      14,
      `Primary site-nav must contain exactly 14 links to prevent navigation clutter; found ${links.length}`
    );
  });
});
