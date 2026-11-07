// test/wave20-integration.test.js
// Integration test suite for Wave 20: Nightlife & Festival Harm Reduction

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Wave 20 Architecture & Nightlife Harm Reduction Integration', () => {
  test('1. Tool Catalog Registration in tools.js', async () => {
    const { TOOL_CATALOG } = await import('../public/js/views/tools.js');
    const entry = TOOL_CATALOG.find(t => t.id === 'nightlife-care');

    assert.ok(entry, 'nightlife-care must be registered in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/nightlife-care');
    assert.strictEqual(entry.category, 'harm');
    assert.ok(entry.title.length > 0);
    assert.ok(entry.description.length > 0);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  });

  test('2. Lazy Loading, Routing & Preload Registration in app.js', async () => {
    const appSource = fs.readFileSync(path.resolve('public/js/app.js'), 'utf8');

    assert.ok(appSource.includes("'nightlife-care': () => import('./views/nightlifeCare.js')"),
      'app.js LAZY_LOADERS must register nightlife-care');

    assert.ok(appSource.includes("'nightlife-care': () => t('route.nightlifeCare'"),
      'app.js ROUTE_TITLES must register nightlife-care');

    assert.ok(appSource.includes("preloadRoute('nightlife-care')"),
      'app.js preloadAllLazyViews must include nightlife-care');
  });

  test('3. Cross-Module Navigation Links', () => {
    const guidesSource = fs.readFileSync(path.resolve('public/js/views/guides.js'), 'utf8');
    assert.ok(guidesSource.includes('#/nightlife-care'), 'guides.js must contain a cross-link to #/nightlife-care');

    const harmSource = fs.readFileSync(path.resolve('public/js/views/harmReduction.js'), 'utf8');
    assert.ok(harmSource.includes('#/nightlife-care'), 'harmReduction.js must contain a cross-link to #/nightlife-care');
  });

  test('4. Service Worker Elective Shell Caching in sw.js', () => {
    const swSource = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');
    assert.ok(swSource.includes("'/js/views/nightlifeCare.js'"),
      'sw.js ELECTIVE_SHELL must include /js/views/nightlifeCare.js');
  });

  test('5. Spanish Localization Completeness', async () => {
    const esSource = fs.readFileSync(path.resolve('public/js/locales/es.js'), 'utf8');
    assert.ok(esSource.includes("'route.nightlifeCare'"), 'es.js must contain route.nightlifeCare translation');

    const esToolsSource = fs.readFileSync(path.resolve('public/js/locales/es-tools.js'), 'utf8');
    assert.ok(esToolsSource.includes("'tools.item.nightlife-care.title'"),
      'es-tools.js must contain tools.item.nightlife-care.title translation');
    assert.ok(esToolsSource.includes("'tools.item.nightlife-care.description'"),
      'es-tools.js must contain tools.item.nightlife-care.description translation');
  });

  test('6. Static Security, CSP & Privacy Compliance', () => {
    const files = [
      'public/js/views/nightlifeCare.js',
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
