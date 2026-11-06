// test/wave42-integration.test.js
// HarborPath - Wave 42 Architecture & Renal Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 42 Architecture & Renal Care Integration', () => {
  it('registers renal-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['renal-care'], 'function');
    const viewFn = await LAZY_LOADERS['renal-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['renal-care'], 'function');
    const title = ROUTE_TITLES['renal-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads renal-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('renal-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 50);
  });

  it('includes renal-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'renal-care');
    assert.ok(entry, 'Missing renal-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/renal-care');
    assert.strictEqual(entry.category, 'clinical-support');
    assert.ok(entry.title.includes('Renal') || entry.title.includes('renal'));
    assert.ok(entry.description.includes('KDIGO') || entry.description.includes('rhabdomyolysis'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resRenal = filterCareTools({ query: 'renal' });
    assert.ok(resRenal.some((t) => t.id === 'renal-care'));

    const resRhabdo = filterCareTools({ query: 'rhabdomyolysis' });
    assert.ok(resRhabdo.some((t) => t.id === 'renal-care'));

    const resKdigo = filterCareTools({ query: 'kdigo' });
    assert.ok(resKdigo.some((t) => t.id === 'renal-care'));

    const resK = filterCareTools({ query: 'hyperkalemia' });
    assert.ok(resK.some((t) => t.id === 'renal-care'));

    const resHd = filterCareTools({ query: 'dialysis' });
    assert.ok(resHd.some((t) => t.id === 'renal-care'));
  });

  it('includes /js/views/renalCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/renalCare.js'"),
      'Service worker must include renalCare.js in ELECTIVE_SHELL'
    );
  });

  it('cross-links renal care across workspace, stimulantCare, postOverdose, hospitalCare, streetMedicine, and liverCare', () => {
    const ws = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(ws.includes('#/renal-care'), 'workspace.js must link to #/renal-care');

    const sc = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.ok(sc.includes('#/renal-care'), 'stimulantCare.js must link to #/renal-care');

    const po = fs.readFileSync('public/js/views/postOverdose.js', 'utf8');
    assert.ok(po.includes('#/renal-care'), 'postOverdose.js must link to #/renal-care');

    const hc = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hc.includes('#/renal-care'), 'hospitalCare.js must link to #/renal-care');

    const sm = fs.readFileSync('public/js/views/streetMedicine.js', 'utf8');
    assert.ok(sm.includes('#/renal-care'), 'streetMedicine.js must link to #/renal-care');

    const lc = fs.readFileSync('public/js/views/liverCare.js', 'utf8');
    assert.ok(lc.includes('#/renal-care'), 'liverCare.js must link to #/renal-care');
  });

  it('provides complete Spanish localization for renal care route and UI strings', () => {
    assert.ok(es['route.renalCare'], 'Missing route.renalCare');
    assert.ok(es['rc.header.title'], 'Missing rc.header.title');
    assert.ok(es['rc.check.kStrong'], 'Missing rc.check.kStrong');
    assert.ok(es['rc.check.csStrong'], 'Missing rc.check.csStrong');
    assert.ok(es['rc.rhabdo.heading'], 'Missing rc.rhabdo.heading');
    assert.ok(es['rc.cs.heading'], 'Missing rc.cs.heading');
    assert.ok(es['rc.kdigo.heading'], 'Missing rc.kdigo.heading');
    assert.ok(es['rc.moud.heading'], 'Missing rc.moud.heading');
    assert.ok(es['rc.hr.heading'], 'Missing rc.hr.heading');

    assert.ok(esTools['tools.item.renal-care.title'], 'Missing tools.item.renal-care.title');
    assert.ok(esTools['tools.item.renal-care.description'], 'Missing tools.item.renal-care.description');
    assert.ok(esWorkspace['workspace.link.renalCare'], 'Missing workspace.link.renalCare');
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
