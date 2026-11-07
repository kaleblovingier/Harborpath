// test/wave44-integration.test.js
// HarborPath - Wave 44 Architecture & Neurology Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 44 Architecture & Neurology Care Integration', () => {
  it('registers neurology-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['neurology-care'], 'function');
    const viewFn = await LAZY_LOADERS['neurology-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['neurology-care'], 'function');
    const title = ROUTE_TITLES['neurology-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads neurology-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('neurology-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 52);
  });

  it('includes neurology-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'neurology-care');
    assert.ok(entry, 'Missing neurology-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/neurology-care');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('Neurological') || entry.title.includes('neurological'));
    assert.ok(entry.description.includes('AAN') || entry.description.includes('HIE') || entry.description.includes('Wernicke'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resNeuro = filterCareTools({ query: 'neurological' });
    assert.ok(resNeuro.some((t) => t.id === 'neurology-care'));

    const resBrain = filterCareTools({ query: 'brain' });
    assert.ok(resBrain.some((t) => t.id === 'neurology-care'));

    const resPres = filterCareTools({ query: 'pres' });
    assert.ok(resPres.some((t) => t.id === 'neurology-care'));

    const resWernicke = filterCareTools({ query: 'wernicke' });
    assert.ok(resWernicke.some((t) => t.id === 'neurology-care'));

    const resThiamine = filterCareTools({ query: 'thiamine' });
    assert.ok(resThiamine.some((t) => t.id === 'neurology-care'));
  });

  it('includes /js/views/neurologyCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/neurologyCare.js'"),
      'Service worker must include neurologyCare.js in ELECTIVE_SHELL'
    );
  });

  it('cross-links neurology care across workspace, postOverdose, stimulantCare, alcoholCare, and pulmonaryCare', () => {
    const ws = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(ws.includes('#/neurology-care'), 'workspace.js must link to #/neurology-care');

    const po = fs.readFileSync('public/js/views/postOverdose.js', 'utf8');
    assert.ok(po.includes('#/neurology-care'), 'postOverdose.js must link to #/neurology-care');

    const sc = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.ok(sc.includes('#/neurology-care'), 'stimulantCare.js must link to #/neurology-care');

    const ac = fs.readFileSync('public/js/views/alcoholCare.js', 'utf8');
    assert.ok(ac.includes('#/neurology-care'), 'alcoholCare.js must link to #/neurology-care');

    const pc = fs.readFileSync('public/js/views/pulmonaryCare.js', 'utf8');
    assert.ok(pc.includes('#/neurology-care'), 'pulmonaryCare.js must link to #/neurology-care');
  });

  it('provides complete Spanish localization for neurology care route and UI strings', () => {
    assert.ok(es['route.neurologyCare'], 'Missing route.neurologyCare');
    assert.ok(es['nc.header.title'], 'Missing nc.header.title');
    assert.ok(es['nc.tabs.syndromes'], 'Missing nc.tabs.syndromes');
    assert.ok(es['nc.tabs.evaluator'], 'Missing nc.tabs.evaluator');
    assert.ok(es['nc.tabs.wernicke'], 'Missing nc.tabs.wernicke');
    assert.ok(es['nc.tabs.directives'], 'Missing nc.tabs.directives');
    assert.ok(es['nc.tabs.sbar'], 'Missing nc.tabs.sbar');

    assert.ok(esTools['tools.item.neurology-care.title'], 'Missing tools.item.neurology-care.title');
    assert.ok(esTools['tools.item.neurology-care.description'], 'Missing tools.item.neurology-care.description');
    assert.ok(esWorkspace['workspace.link.neurologyCare'], 'Missing workspace.link.neurologyCare');
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

