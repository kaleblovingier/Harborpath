// test/wave19-integration.test.js
// Integration test suite for Wave 19: Polysubstance Care & Synergy Navigator

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Wave 19 Architecture & Polysubstance Care Integration', () => {
  test('1. Tool Catalog Registration in tools.js', async () => {
    const { TOOL_CATALOG } = await import('../public/js/views/tools.js');
    const entry = TOOL_CATALOG.find(t => t.id === 'polysubstance-care');

    assert.ok(entry, 'polysubstance-care must be registered in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/polysubstance-care');
    assert.strictEqual(entry.category, 'harm');
    assert.ok(entry.title.length > 0);
    assert.ok(entry.description.length > 0);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  });

  test('2. Lazy Loading, Routing & Preload Registration in app.js', async () => {
    const appSource = fs.readFileSync(path.resolve('public/js/app.js'), 'utf8');

    assert.ok(appSource.includes("'polysubstance-care': () => import('./views/polysubstanceCare.js')"),
      'app.js LAZY_LOADERS must register polysubstance-care');

    assert.ok(appSource.includes("'polysubstance-care': () => t('route.polysubstanceCare'"),
      'app.js ROUTE_TITLES must register polysubstance-care');

    assert.ok(appSource.includes("preloadRoute('polysubstance-care')"),
      'app.js preloadAllLazyViews must include polysubstance-care');
  });

  test('3. Cross-Module Navigation Links', () => {
    const guidesSource = fs.readFileSync(path.resolve('public/js/views/guides.js'), 'utf8');
    assert.ok(guidesSource.includes('#/polysubstance-care'), 'guides.js must contain a cross-link to #/polysubstance-care');

    const harmSource = fs.readFileSync(path.resolve('public/js/views/harmReduction.js'), 'utf8');
    assert.ok(harmSource.includes('#/polysubstance-care'), 'harmReduction.js must contain a cross-link to #/polysubstance-care');
  });

  test('4. Service Worker Elective Shell Caching in sw.js', () => {
    const swSource = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');
    assert.ok(swSource.includes("'/js/views/polysubstanceCare.js'"),
      'sw.js ELECTIVE_SHELL must include /js/views/polysubstanceCare.js');
  });

  test('5. Spanish Localization Completeness', async () => {
    const esSource = fs.readFileSync(path.resolve('public/js/locales/es.js'), 'utf8');
    assert.ok(esSource.includes("'route.polysubstanceCare'"), 'es.js must contain route.polysubstanceCare translation');

    const esToolsSource = fs.readFileSync(path.resolve('public/js/locales/es-tools.js'), 'utf8');
    assert.ok(esToolsSource.includes("'tools.item.polysubstance-care.title'"),
      'es-tools.js must contain tools.item.polysubstance-care.title translation');
    assert.ok(esToolsSource.includes("'tools.item.polysubstance-care.description'"),
      'es-tools.js must contain tools.item.polysubstance-care.description translation');
  });

  test('6. Static Security, CSP & Privacy Compliance', () => {
    const files = [
      'public/js/views/polysubstanceCare.js',
      'public/styles.css'
    ];

    files.forEach(f => {
      const content = fs.readFileSync(path.resolve(f), 'utf8');
      assert.strictEqual(content.includes('localStorage'), false, `${f} must not access localStorage`);
      assert.strictEqual(content.includes('sessionStorage'), false, `${f} must not access sessionStorage`);
      assert.strictEqual(content.includes('document.cookie'), false, `${f} must not access document.cookie`);
      assert.strictEqual(content.includes('innerHTML'), false, `${f} must not use innerHTML`);
      assert.strictEqual(content.includes('outerHTML'), false, `${f} must not use outerHTML`);
    });
  });
});
