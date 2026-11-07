// test/wave41-integration.test.js
// HarborPath - Wave 41 Architecture & Endocarditis Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 41 Architecture & Endocarditis Care Integration', () => {
  it('registers endocarditis-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['endocarditis-care'], 'function');
    const viewFn = await LAZY_LOADERS['endocarditis-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['endocarditis-care'], 'function');
    const title = ROUTE_TITLES['endocarditis-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads endocarditis-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('endocarditis-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 50);
  });

  it('includes endocarditis-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'endocarditis-care');
    assert.ok(entry, 'Missing endocarditis-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/endocarditis-care');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('Endocarditis') || entry.title.includes('endocarditis'));
    assert.ok(entry.description.includes('AHA/IDSA') || entry.description.includes('tricuspid'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resEndo = filterCareTools({ query: 'endocarditis' });
    assert.ok(resEndo.some((t) => t.id === 'endocarditis-care'));

    const resValve = filterCareTools({ query: 'valve' });
    assert.ok(resValve.some((t) => t.id === 'endocarditis-care'));

    const resPoet = filterCareTools({ query: 'poet' });
    assert.ok(resPoet.some((t) => t.id === 'endocarditis-care'));

    const resDalb = filterCareTools({ query: 'dalbavancin' });
    assert.ok(resDalb.some((t) => t.id === 'endocarditis-care'));

    const resEmb = filterCareTools({ query: 'emboli' });
    assert.ok(resEmb.some((t) => t.id === 'endocarditis-care'));
  });

  it('includes /js/views/endocarditisCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/endocarditisCare.js'"),
      'Service worker must include endocarditisCare.js in ELECTIVE_SHELL'
    );
  });

  it('cross-links endocarditis care across workspace, woundInfectious, veinCare, hospitalCare, and streetMedicine', () => {
    const ws = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(ws.includes('#/endocarditis-care'), 'workspace.js must link to #/endocarditis-care');

    const wi = fs.readFileSync('public/js/views/woundInfectious.js', 'utf8');
    assert.ok(wi.includes('#/endocarditis-care'), 'woundInfectious.js must link to #/endocarditis-care');

    const vc = fs.readFileSync('public/js/views/veinCare.js', 'utf8');
    assert.ok(vc.includes('#/endocarditis-care'), 'veinCare.js must link to #/endocarditis-care');

    const hc = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hc.includes('#/endocarditis-care'), 'hospitalCare.js must link to #/endocarditis-care');

    const sm = fs.readFileSync('public/js/views/streetMedicine.js', 'utf8');
    assert.ok(sm.includes('#/endocarditis-care'), 'streetMedicine.js must link to #/endocarditis-care');
  });

  it('provides complete Spanish localization for endocarditis care route and UI strings', () => {
    assert.ok(es['route.endocarditisCare'], 'Missing route.endocarditisCare');
    assert.ok(es['ec.header.title'], 'Missing ec.header.title');
    assert.ok(es['ec.check.prStrong'], 'Missing ec.check.prStrong');
    assert.ok(es['ec.check.emboliStrong'], 'Missing ec.check.emboliStrong');
    assert.ok(es['ec.valves.heading'], 'Missing ec.valves.heading');
    assert.ok(es['ec.duke.heading'], 'Missing ec.duke.heading');
    assert.ok(es['ec.surg.heading'], 'Missing ec.surg.heading');
    assert.ok(es['ec.hr.heading'], 'Missing ec.hr.heading');

    assert.ok(esTools['tools.item.endocarditis-care.title'], 'Missing tools.item.endocarditis-care.title');
    assert.ok(esTools['tools.item.endocarditis-care.description'], 'Missing tools.item.endocarditis-care.description');
    assert.ok(esWorkspace['workspace.link.endocarditisCare'], 'Missing workspace.link.endocarditisCare');
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
