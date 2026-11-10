// test/wave37-integration.test.js
// HarborPath - Wave 37 Architecture & Inhalant, Solvent & Nitrous Oxide Safety Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 37 Architecture & Inhalant Care Integration', () => {
  it('registers inhalant-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['inhalant-care'], 'function');
    const viewFn = await LAZY_LOADERS['inhalant-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['inhalant-care'], 'function');
    const title = ROUTE_TITLES['inhalant-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads inhalant-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('inhalant-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 46);
  });

  it('includes inhalant-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'inhalant-care');
    assert.ok(entry, 'Missing inhalant-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/inhalant-care');
    assert.strictEqual(entry.category, 'harm-reduction');
    assert.ok(entry.title.includes('Inhalants') || entry.title.includes('nitrous'));
    assert.ok(entry.description.includes('nitrous') || entry.description.includes('B12'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resInhalant = filterCareTools({ query: 'inhalant' });
    assert.ok(resInhalant.some((t) => t.id === 'inhalant-care'));

    const resNitrous = filterCareTools({ query: 'nitrous' });
    assert.ok(resNitrous.some((t) => t.id === 'inhalant-care'));

    const resB12 = filterCareTools({ query: 'B12' });
    assert.ok(resB12.some((t) => t.id === 'inhalant-care'));
  });

  it('includes /js/views/inhalantCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/inhalantCare.js'"),
      'inhalantCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.inhalantCare'], 'Missing route.inhalantCare in es.js');
    assert.ok(es['route.inhalantCare'].includes('Inhalantes') || es['route.inhalantCare'].includes('inhalantes'));

    assert.ok(esTools['tools.item.inhalant-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.inhalant-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.inhalant-care.description'].includes('B12') || esTools['tools.item.inhalant-care.description'].includes('nitroso'));

    assert.ok(esWorkspace['workspace.link.inhalantCare'], 'Missing workspace.link.inhalantCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, nightlifeCare.js, sexualHealth.js, toxicologyTriage.js, and adolescentCare.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/inhalant-care'), 'Missing linkage in workspace.js');

    const nightContent = fs.readFileSync('public/js/views/nightlifeCare.js', 'utf8');
    assert.ok(nightContent.includes('#/inhalant-care'), 'Missing linkage in nightlifeCare.js');

    const sexContent = fs.readFileSync('public/js/views/sexualHealth.js', 'utf8');
    assert.ok(sexContent.includes('#/inhalant-care'), 'Missing linkage in sexualHealth.js');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/inhalant-care'), 'Missing linkage in toxicologyTriage.js');

    const adolContent = fs.readFileSync('public/js/views/adolescentCare.js', 'utf8');
    assert.ok(adolContent.includes('#/inhalant-care'), 'Missing linkage in adolescentCare.js');
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
