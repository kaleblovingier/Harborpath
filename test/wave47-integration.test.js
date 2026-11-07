// test/wave47-integration.test.js
// HarborPath - Wave 47 Architecture & Gastrointestinal Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 47 Architecture & Gastrointestinal Care Integration', () => {
  it('registers gi-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['gi-care'], 'function');
    const viewFn = await LAZY_LOADERS['gi-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['gi-care'], 'function');
    const title = ROUTE_TITLES['gi-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads gi-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('gi-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 54);
  });

  it('includes gi-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'gi-care');
    assert.ok(entry, 'Missing gi-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/gi-care');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('GI') || entry.title.includes('pancreatitis'));
    assert.ok(entry.description.includes('WATERFALL') || entry.description.includes('pancreatitis'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resPanc = filterCareTools({ query: 'pancreatitis' });
    assert.ok(resPanc.some((t) => t.id === 'gi-care'));

    const resMes = filterCareTools({ query: 'mesenteric' });
    assert.ok(resMes.some((t) => t.id === 'gi-care'));

    const resPamora = filterCareTools({ query: 'pamoras' });
    assert.ok(resPamora.some((t) => t.id === 'gi-care'));

    const resBoer = filterCareTools({ query: 'boerhaave' });
    assert.ok(resBoer.some((t) => t.id === 'gi-care'));

    const resWaterfall = filterCareTools({ query: 'waterfall' });
    assert.ok(resWaterfall.some((t) => t.id === 'gi-care'));
  });

  it('includes /js/views/giCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/giCare.js'"),
      'Service worker must include giCare.js in ELECTIVE_SHELL'
    );
  });

  it('cross-links gastrointestinal care across workspace, postOverdose, stimulantCare, alcoholCare, and hospitalCare', () => {
    const ws = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(ws.includes('#/gi-care'), 'workspace.js must link to #/gi-care');

    const po = fs.readFileSync('public/js/views/postOverdose.js', 'utf8');
    assert.ok(po.includes('#/gi-care'), 'postOverdose.js must link to #/gi-care');

    const sc = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.ok(sc.includes('#/gi-care'), 'stimulantCare.js must link to #/gi-care');

    const ac = fs.readFileSync('public/js/views/alcoholCare.js', 'utf8');
    assert.ok(ac.includes('#/gi-care'), 'alcoholCare.js must link to #/gi-care');

    const hc = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hc.includes('#/gi-care'), 'hospitalCare.js must link to #/gi-care');
  });

  it('provides complete Spanish localization for gastrointestinal care route and UI strings', () => {
    assert.ok(es['route.giCare'], 'Missing route.giCare');
    assert.ok(es['gi.header.title'], 'Missing gi.header.title');
    assert.ok(es['gi.tabs.syndromes'], 'Missing gi.tabs.syndromes');
    assert.ok(es['gi.tabs.evaluator'], 'Missing gi.tabs.evaluator');
    assert.ok(es['gi.tabs.rules'], 'Missing gi.tabs.rules');
    assert.ok(es['gi.tabs.sbar'], 'Missing gi.tabs.sbar');

    assert.ok(esTools['tools.item.gi-care.title'], 'Missing tools.item.gi-care.title');
    assert.ok(esTools['tools.item.gi-care.description'], 'Missing tools.item.gi-care.description');
    assert.ok(esWorkspace['workspace.link.giCare'], 'Missing workspace.link.giCare');
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
