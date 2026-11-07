// test/wave29-integration.test.js
// HarborPath - Wave 29 Architecture & Hospital Addiction Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import zlib from 'node:zlib';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 29 Architecture & Hospital Addiction Care Integration', () => {
  it('registers hospital-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['hospital-care'], 'function');
    const viewFn = await LAZY_LOADERS['hospital-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['hospital-care'], 'function');
    const title = ROUTE_TITLES['hospital-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads hospital-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('hospital-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 38);
  });

  it('includes hospital-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'hospital-care');
    assert.ok(entry, 'Missing hospital-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/hospital-care');
    assert.strictEqual(entry.category, 'care');
    assert.ok(entry.title.includes('Hospital') || entry.title.includes('hospital'));
    assert.ok(entry.description.includes('Bridge') || entry.description.includes('AMA'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Filter tests
    const resHosp = filterCareTools({ query: 'hospital' });
    assert.ok(resHosp.some((t) => t.id === 'hospital-care'));

    const resBridge = filterCareTools({ query: 'Bridge' });
    assert.ok(resBridge.some((t) => t.id === 'hospital-care'));

    const resAma = filterCareTools({ query: 'AMA' });
    assert.ok(resAma.some((t) => t.id === 'hospital-care'));
  });

  it('includes /js/views/hospitalCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/hospitalCare.js'"),
      'hospitalCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.hospitalCare'], 'Missing route.hospitalCare in es.js');
    assert.ok(es['route.hospitalCare'].includes('hospitalaria'));

    assert.ok(esTools['tools.item.hospital-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.hospital-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.hospital-care.description'].includes('Bridge'));

    assert.ok(esWorkspace['workspace.link.hospitalCare'], 'Missing workspace.link.hospitalCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, medications.js, assessment.js, woundInfectious.js, and toxicologyTriage.js', () => {
    const workspaceContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(workspaceContent.includes('#/hospital-care'), 'workspace.js must link to #/hospital-care');

    const medsContent = fs.readFileSync('public/js/views/medications.js', 'utf8');
    assert.ok(medsContent.includes('#/hospital-care'), 'medications.js must link to #/hospital-care');

    const assessmentContent = fs.readFileSync('public/js/views/assessment.js', 'utf8');
    assert.ok(assessmentContent.includes('#/hospital-care'), 'assessment.js must link to #/hospital-care');

    const woundContent = fs.readFileSync('public/js/views/woundInfectious.js', 'utf8');
    assert.ok(woundContent.includes('#/hospital-care'), 'woundInfectious.js must link to #/hospital-care');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/hospital-care'), 'toxicologyTriage.js must link to #/hospital-care');
  });

  it('preserves the 14-route site navigation invariant in index.html', () => {
    const html = fs.readFileSync('public/index.html', 'utf8');
    const navMatch = html.match(/<nav id="site-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(navMatch, 'site-nav element must exist');
    const links = navMatch[1].match(/<a\s+[^>]*href="#\/[^"]*"[^>]*>/g) || [];
    assert.strictEqual(
      links.length,
      14,
      `Primary site navigation must remain strictly at 14 links to preserve UX invariants; found ${links.length}`
    );
  });

  it('Critical App Shell Gzip Budget: Shell bundle weight remains strictly < 350 KB gzip', () => {
    const coreFiles = [
      'public/index.html',
      'public/styles.css',
      'public/js/app.js',
      'public/js/dom.js',
      'public/js/i18n.js',
      'public/js/api.js',
      'public/sw.js'
    ];

    const combinedBuffer = Buffer.concat(coreFiles.map((f) => fs.readFileSync(f)));
    const gzipped = zlib.gzipSync(combinedBuffer);
    const gzippedKb = gzipped.length / 1024;

    assert.ok(
      gzippedKb < 350,
      `Critical app shell must remain under 350 KB gzip budget; current is ${gzippedKb.toFixed(2)} KB`
    );
  });
});
