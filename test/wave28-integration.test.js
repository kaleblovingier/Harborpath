// test/wave28-integration.test.js
// HarborPath - Wave 28 Architecture & Toxicology Triage Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import zlib from 'node:zlib';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 28 Architecture & Toxicology Triage Integration', () => {
  it('registers toxicology-triage in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['toxicology-triage'], 'function');
    const viewFn = await LAZY_LOADERS['toxicology-triage']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['toxicology-triage'], 'function');
    const title = ROUTE_TITLES['toxicology-triage']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads toxicology-triage via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('toxicology-triage');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 37);
  });

  it('includes toxicology-triage in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'toxicology-triage');
    assert.ok(entry, 'Missing toxicology-triage in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/toxicology-triage');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('toxicology') || entry.title.includes('Toxicology'));
    assert.ok(entry.description.includes('BETA') || entry.description.includes('differential'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Filter tests
    const resTox = filterCareTools({ query: 'toxicology' });
    assert.ok(resTox.some((t) => t.id === 'toxicology-triage'));

    const resBeta = filterCareTools({ query: 'BETA' });
    assert.ok(resBeta.some((t) => t.id === 'toxicology-triage'));

    const resSbar = filterCareTools({ query: 'SBAR' });
    assert.ok(resSbar.some((t) => t.id === 'toxicology-triage'));
  });

  it('includes /js/views/toxicologyTriage.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/toxicologyTriage.js'"),
      'toxicologyTriage.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.toxicologyTriage'], 'Missing route.toxicologyTriage in es.js');
    assert.ok(es['route.toxicologyTriage'].includes('Triage'));

    assert.ok(esTools['tools.item.toxicology-triage.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.toxicology-triage.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.toxicology-triage.description'].includes('BETA'));

    assert.ok(esWorkspace['workspace.link.toxicologyTriage'], 'Missing workspace.link.toxicologyTriage in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, guides.js, stimulantCare.js, and polysubstanceCare.js', () => {
    const workspaceContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(workspaceContent.includes('#/toxicology-triage'), 'workspace.js must link to #/toxicology-triage');

    const guidesContent = fs.readFileSync('public/js/views/guides.js', 'utf8');
    assert.ok(guidesContent.includes('#/toxicology-triage'), 'guides.js must link to #/toxicology-triage');

    const stimulantContent = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.ok(stimulantContent.includes('#/toxicology-triage'), 'stimulantCare.js must link to #/toxicology-triage');

    const polyContent = fs.readFileSync('public/js/views/polysubstanceCare.js', 'utf8');
    assert.ok(polyContent.includes('#/toxicology-triage'), 'polysubstanceCare.js must link to #/toxicology-triage');
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
