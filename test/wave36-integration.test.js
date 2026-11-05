// test/wave36-integration.test.js
// HarborPath - Wave 36 Architecture & Vein Care, Vascular Health & Injection Anatomy Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 36 Architecture & Vein Care Integration', () => {
  it('registers vein-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['vein-care'], 'function');
    const viewFn = await LAZY_LOADERS['vein-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['vein-care'], 'function');
    const title = ROUTE_TITLES['vein-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads vein-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('vein-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 45);
  });

  it('includes vein-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'vein-care');
    assert.ok(entry, 'Missing vein-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/vein-care');
    assert.strictEqual(entry.category, 'harm-reduction');
    assert.ok(entry.title.includes('Vein') || entry.title.includes('Vascular'));
    assert.ok(entry.description.includes('arterial') || entry.description.includes('DVT'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search filter verification
    const resVein = filterCareTools({ query: 'vein' });
    assert.ok(resVein.some((t) => t.id === 'vein-care'));

    const resArterial = filterCareTools({ query: 'arterial' });
    assert.ok(resArterial.some((t) => t.id === 'vein-care'));

    const resDvt = filterCareTools({ query: 'dvt' });
    assert.ok(resDvt.some((t) => t.id === 'vein-care'));
  });

  it('includes /js/views/veinCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/veinCare.js'"),
      'veinCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.veinCare'], 'Missing route.veinCare in es.js');
    assert.ok(es['route.veinCare'].includes('Venas') || es['route.veinCare'].includes('venas'));

    assert.ok(esTools['tools.item.vein-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.vein-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.vein-care.description'].includes('arterial') || esTools['tools.item.vein-care.description'].includes('TVP'));

    assert.ok(esWorkspace['workspace.link.veinCare'], 'Missing workspace.link.veinCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, woundInfectious.js, needleExposure.js, hospitalCare.js, and toxicologyTriage.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/vein-care'), 'Missing linkage in workspace.js');

    const woundContent = fs.readFileSync('public/js/views/woundInfectious.js', 'utf8');
    assert.ok(woundContent.includes('#/vein-care'), 'Missing linkage in woundInfectious.js');

    const needleContent = fs.readFileSync('public/js/views/needleExposure.js', 'utf8');
    assert.ok(needleContent.includes('#/vein-care'), 'Missing linkage in needleExposure.js');

    const hospContent = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hospContent.includes('#/vein-care'), 'Missing linkage in hospitalCare.js');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/vein-care'), 'Missing linkage in toxicologyTriage.js');
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
