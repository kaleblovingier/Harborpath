// test/wave26-integration.test.js
// HarborPath - Wave 26 Architecture & Benzodiazepine Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';

describe('Wave 26 Architecture & Benzodiazepine Care Integration', () => {
  it('registers benzodiazepine-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['benzodiazepine-care'], 'function');
    const viewFn = await LAZY_LOADERS['benzodiazepine-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['benzodiazepine-care'], 'function');
    const title = ROUTE_TITLES['benzodiazepine-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads benzodiazepine-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('benzodiazepine-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 35);
  });

  it('includes benzodiazepine-care in TOOL_CATALOG with complete schema', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'benzodiazepine-care');
    assert.ok(entry, 'Missing benzodiazepine-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/benzodiazepine-care');
    assert.strictEqual(entry.category, 'care');
    assert.ok(entry.title.includes('Benzodiazepines'));
    assert.ok(entry.description.includes('Ashton'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);
  });

  it('includes /js/views/benzodiazepineCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/benzodiazepineCare.js'"),
      'benzodiazepineCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js and es-tools.js', () => {
    assert.ok(es['route.benzodiazepineCare'], 'Missing route.benzodiazepineCare in es.js');
    assert.ok(es['route.benzodiazepineCare'].includes('benzodiazepinas'));

    assert.ok(esTools['tools.item.benzodiazepine-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.benzodiazepine-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.benzodiazepine-care.description'].includes('Ashton'));
  });

  it('integrates cross-module linkages in chronicPain, guides, harmReduction, and medications', () => {
    const chronicPain = fs.readFileSync('public/js/views/chronicPain.js', 'utf8');
    assert.ok(chronicPain.includes('#/benzodiazepine-care'));

    const guides = fs.readFileSync('public/js/views/guides.js', 'utf8');
    assert.ok(guides.includes('#/benzodiazepine-care'));

    const harmReduction = fs.readFileSync('public/js/views/harmReduction.js', 'utf8');
    assert.ok(harmReduction.includes('#/benzodiazepine-care'));

    const medications = fs.readFileSync('public/js/views/medications.js', 'utf8');
    assert.ok(medications.includes('#/benzodiazepine-care'));
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
