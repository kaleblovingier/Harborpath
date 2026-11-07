// test/wave27-integration.test.js
// HarborPath - Wave 27 Architecture & ADHD Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';

describe('Wave 27 Architecture & ADHD Care Integration', () => {
  it('registers adhd-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['adhd-care'], 'function');
    const viewFn = await LAZY_LOADERS['adhd-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['adhd-care'], 'function');
    const title = ROUTE_TITLES['adhd-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads adhd-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('adhd-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 36);
  });

  it('includes adhd-care in TOOL_CATALOG with complete schema', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'adhd-care');
    assert.ok(entry, 'Missing adhd-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/adhd-care');
    assert.strictEqual(entry.category, 'care');
    assert.ok(entry.title.includes('ADHD'));
    assert.ok(entry.description.includes('ASRS'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);
  });

  it('includes /js/views/adhdCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/adhdCare.js'"),
      'adhdCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js and es-tools.js', () => {
    assert.ok(es['route.adhdCare'], 'Missing route.adhdCare in es.js');
    assert.ok(es['route.adhdCare'].includes('TDAH'));

    assert.ok(esTools['tools.item.adhd-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.adhd-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.adhd-care.description'].includes('ASRS'));
  });

  it('integrates cross-module linkages in guides, harmReduction, medications, and stimulantCare', () => {
    const guides = fs.readFileSync('public/js/views/guides.js', 'utf8');
    assert.ok(guides.includes('#/adhd-care'));

    const harmReduction = fs.readFileSync('public/js/views/harmReduction.js', 'utf8');
    assert.ok(harmReduction.includes('#/adhd-care'));

    const medications = fs.readFileSync('public/js/views/medications.js', 'utf8');
    assert.ok(medications.includes('#/adhd-care'));

    const stimulantCare = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.ok(stimulantCare.includes('#/adhd-care'));
  });

  it('preserves the 14-route site navigation invariant in index.html', () => {
    const html = fs.readFileSync('public/index.html', 'utf8');
    const navMatch = html.match(/<nav id="site-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(navMatch, 'site-nav element must exist');
    const links = navMatch[1].match(/<a\s+[^>]*href="#\/[^"]*"[^>]*>/g) || [];
    assert.strictEqual(
      links.length,
      14,
      `site-nav must maintain exactly 14 primary navigation links, found ${links.length}`
    );
  });
});
