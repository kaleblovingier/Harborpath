// test/wave22-integration.test.js
// Integration test suite for Wave 22: Dental, Oral Health & Endocarditis Prevention

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Wave 22 Architecture & Dental Care Integration', () => {
  test('1. Tool Catalog Registration in tools.js', async () => {
    const { TOOL_CATALOG } = await import('../public/js/views/tools.js');
    const entry = TOOL_CATALOG.find(t => t.id === 'dental-care');

    assert.ok(entry, 'dental-care must be registered in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/dental-care');
    assert.strictEqual(entry.category, 'health');
    assert.ok(entry.title.length > 0);
    assert.ok(entry.description.length > 0);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  });

  test('2. Lazy Loading, Routing & Preload Registration in app.js', async () => {
    const appSource = fs.readFileSync(path.resolve('public/js/app.js'), 'utf8');

    assert.ok(appSource.includes("'dental-care': () => import('./views/dentalCare.js')"),
      'app.js LAZY_LOADERS must register dental-care');

    assert.ok(appSource.includes("'dental-care': () => t('route.dentalCare'"),
      'app.js ROUTE_TITLES must register dental-care');

    assert.ok(appSource.includes("preloadRoute('dental-care')"),
      'app.js preloadAllLazyViews must include dental-care');
  });

  test('3. Cross-Module Navigation Links', () => {
    const guidesSource = fs.readFileSync(path.resolve('public/js/views/guides.js'), 'utf8');
    assert.ok(guidesSource.includes('#/dental-care'), 'guides.js must contain a cross-link to #/dental-care');

    const medsSource = fs.readFileSync(path.resolve('public/js/views/medications.js'), 'utf8');
    assert.ok(medsSource.includes('#/dental-care'), 'medications.js must contain a cross-link to #/dental-care');
  });

  test('4. Service Worker Elective Shell Caching in sw.js', () => {
    const swSource = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');
    assert.ok(swSource.includes("'/js/views/dentalCare.js'"),
      'sw.js ELECTIVE_SHELL must include /js/views/dentalCare.js');
  });

  test('5. Spanish Localization Completeness', async () => {
    const esSource = fs.readFileSync(path.resolve('public/js/locales/es.js'), 'utf8');
    assert.ok(esSource.includes("'route.dentalCare'"), 'es.js must contain route.dentalCare translation');

    const esToolsSource = fs.readFileSync(path.resolve('public/js/locales/es-tools.js'), 'utf8');
    assert.ok(esToolsSource.includes("'tools.item.dental-care.title'"),
      'es-tools.js must contain tools.item.dental-care.title translation');
    assert.ok(esToolsSource.includes("'tools.item.dental-care.description'"),
      'es-tools.js must contain tools.item.dental-care.description translation');
  });

  test('6. Static Security, CSP & Privacy Compliance', () => {
    const files = [
      'public/js/views/dentalCare.js',
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
