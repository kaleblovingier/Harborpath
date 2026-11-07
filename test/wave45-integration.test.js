// test/wave45-integration.test.js
// HarborPath - Wave 45 Architecture & Metabolic Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 45 Architecture & Metabolic Care Integration', () => {
  it('registers metabolic-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['metabolic-care'], 'function');
    const viewFn = await LAZY_LOADERS['metabolic-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['metabolic-care'], 'function');
    const title = ROUTE_TITLES['metabolic-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads metabolic-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('metabolic-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 53);
  });

  it('includes metabolic-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'metabolic-care');
    assert.ok(entry, 'Missing metabolic-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/metabolic-care');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('Metabolic') || entry.title.includes('metabolic'));
    assert.ok(entry.description.includes('ADA') || entry.description.includes('ketoacidosis'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resMet = filterCareTools({ query: 'metabolic' });
    assert.ok(resMet.some((t) => t.id === 'metabolic-care'));

    const resKeto = filterCareTools({ query: 'ketoacidosis' });
    assert.ok(resKeto.some((t) => t.id === 'metabolic-care'));

    const resAdrenal = filterCareTools({ query: 'adrenal' });
    assert.ok(resAdrenal.some((t) => t.id === 'metabolic-care'));

    const resHypo = filterCareTools({ query: 'hypoglycemia' });
    assert.ok(resHypo.some((t) => t.id === 'metabolic-care'));

    const resSglt2 = filterCareTools({ query: 'sglt2' });
    assert.ok(resSglt2.some((t) => t.id === 'metabolic-care'));
  });

  it('includes /js/views/metabolicCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/metabolicCare.js'"),
      'Service worker must include metabolicCare.js in ELECTIVE_SHELL'
    );
  });

  it('cross-links metabolic care across workspace, postOverdose, stimulantCare, alcoholCare, and hospitalCare', () => {
    const ws = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(ws.includes('#/metabolic-care'), 'workspace.js must link to #/metabolic-care');

    const po = fs.readFileSync('public/js/views/postOverdose.js', 'utf8');
    assert.ok(po.includes('#/metabolic-care'), 'postOverdose.js must link to #/metabolic-care');

    const sc = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.ok(sc.includes('#/metabolic-care'), 'stimulantCare.js must link to #/metabolic-care');

    const ac = fs.readFileSync('public/js/views/alcoholCare.js', 'utf8');
    assert.ok(ac.includes('#/metabolic-care'), 'alcoholCare.js must link to #/metabolic-care');

    const hc = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hc.includes('#/metabolic-care'), 'hospitalCare.js must link to #/metabolic-care');
  });

  it('provides complete Spanish localization for metabolic care route and UI strings', () => {
    assert.ok(es['route.metabolicCare'], 'Missing route.metabolicCare');
    assert.ok(es['mc.header.title'], 'Missing mc.header.title');
    assert.ok(es['mc.tabs.syndromes'], 'Missing mc.tabs.syndromes');
    assert.ok(es['mc.tabs.evaluator'], 'Missing mc.tabs.evaluator');
    assert.ok(es['mc.tabs.rules'], 'Missing mc.tabs.rules');
    assert.ok(es['mc.tabs.sbar'], 'Missing mc.tabs.sbar');

    assert.ok(esTools['tools.item.metabolic-care.title'], 'Missing tools.item.metabolic-care.title');
    assert.ok(esTools['tools.item.metabolic-care.description'], 'Missing tools.item.metabolic-care.description');
    assert.ok(esWorkspace['workspace.link.metabolicCare'], 'Missing workspace.link.metabolicCare');
  });

  it('maintains the strict 14-route navigation invariant on #site-nav in public/index.html', () => {
    const indexHtml = fs.readFileSync('public/index.html', 'utf8');
    const navMatch = indexHtml.match(/<nav[^>]*id=["']site-nav["'][^>]*>([\s\S]*?)<\/nav>/i);
    assert.ok(navMatch, 'Must find site-nav');
    const links = [...navMatch[1].matchAll(/<a\b/gi)];
    assert.strictEqual(
      links.length,
      14,
      `site-nav must have exactly 14 primary navigation links (found ${links.length})`
    );
  });
});

