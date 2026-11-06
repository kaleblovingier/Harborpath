// test/wave43-integration.test.js
// HarborPath - Wave 43 Architecture & Pulmonary Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 43 Architecture & Pulmonary Care Integration', () => {
  it('registers pulmonary-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['pulmonary-care'], 'function');
    const viewFn = await LAZY_LOADERS['pulmonary-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['pulmonary-care'], 'function');
    const title = ROUTE_TITLES['pulmonary-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads pulmonary-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('pulmonary-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 51);
  });

  it('includes pulmonary-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'pulmonary-care');
    assert.ok(entry, 'Missing pulmonary-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/pulmonary-care');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('Pulmonary') || entry.title.includes('pulmonary'));
    assert.ok(entry.description.includes('ATS/ERS') || entry.description.includes('NCPE'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resPulm = filterCareTools({ query: 'pulmonary' });
    assert.ok(resPulm.some((t) => t.id === 'pulmonary-care'));

    const resCrack = filterCareTools({ query: 'crack' });
    assert.ok(resCrack.some((t) => t.id === 'pulmonary-care'));

    const resNcpe = filterCareTools({ query: 'ncpe' });
    assert.ok(resNcpe.some((t) => t.id === 'pulmonary-care'));

    const resInhal = filterCareTools({ query: 'inhalation' });
    assert.ok(resInhal.some((t) => t.id === 'pulmonary-care'));

    const resEdema = filterCareTools({ query: 'edema' });
    assert.ok(resEdema.some((t) => t.id === 'pulmonary-care'));
  });

  it('includes /js/views/pulmonaryCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/pulmonaryCare.js'"),
      'Service worker must include pulmonaryCare.js in ELECTIVE_SHELL'
    );
  });

  it('cross-links pulmonary care across workspace, stimulantCare, postOverdose, endocarditisCare, streetMedicine, and hospitalCare', () => {
    const ws = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(ws.includes('#/pulmonary-care'), 'workspace.js must link to #/pulmonary-care');

    const sc = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.ok(sc.includes('#/pulmonary-care'), 'stimulantCare.js must link to #/pulmonary-care');

    const po = fs.readFileSync('public/js/views/postOverdose.js', 'utf8');
    assert.ok(po.includes('#/pulmonary-care'), 'postOverdose.js must link to #/pulmonary-care');

    const ec = fs.readFileSync('public/js/views/endocarditisCare.js', 'utf8');
    assert.ok(ec.includes('#/pulmonary-care'), 'endocarditisCare.js must link to #/pulmonary-care');

    const sm = fs.readFileSync('public/js/views/streetMedicine.js', 'utf8');
    assert.ok(sm.includes('#/pulmonary-care'), 'streetMedicine.js must link to #/pulmonary-care');

    const hc = fs.readFileSync('public/js/views/hospitalCare.js', 'utf8');
    assert.ok(hc.includes('#/pulmonary-care'), 'hospitalCare.js must link to #/pulmonary-care');
  });

  it('provides complete Spanish localization for pulmonary care route and UI strings', () => {
    assert.ok(es['route.pulmonaryCare'], 'Missing route.pulmonaryCare');
    assert.ok(es['pc.header.title'], 'Missing pc.header.title');
    assert.ok(es['pc.check.ncpeStrong'], 'Missing pc.check.ncpeStrong');
    assert.ok(es['pc.check.crackStrong'], 'Missing pc.check.crackStrong');
    assert.ok(es['pc.syn.heading'], 'Missing pc.syn.heading');
    assert.ok(es['pc.od.heading'], 'Missing pc.od.heading');
    assert.ok(es['pc.inhal.heading'], 'Missing pc.inhal.heading');
    assert.ok(es['pc.hr.heading'], 'Missing pc.hr.heading');

    assert.ok(esTools['tools.item.pulmonary-care.title'], 'Missing tools.item.pulmonary-care.title');
    assert.ok(esTools['tools.item.pulmonary-care.description'], 'Missing tools.item.pulmonary-care.description');
    assert.ok(esWorkspace['workspace.link.pulmonaryCare'], 'Missing workspace.link.pulmonaryCare');
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
