// test/wave24-integration.test.js
// Integration test suite for Wave 24: Viral Hepatitis (HCV/HBV), DAA Regimens, FIB-4 & HIV PrEP/PEP

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Wave 24 Architecture & Viral Hepatitis Integration', () => {
  test('1. Tool Catalog Registration in tools.js', async () => {
    const { TOOL_CATALOG } = await import('../public/js/views/tools.js');
    const entry = TOOL_CATALOG.find(t => t.id === 'viral-hepatitis');

    assert.ok(entry, 'viral-hepatitis must be registered in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/viral-hepatitis');
    assert.strictEqual(entry.category, 'health');
    assert.ok(entry.title.length > 0);
    assert.ok(entry.description.length > 0);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  });

  test('2. Lazy Loading, Routing & Preload Registration in app.js', async () => {
    const appSource = fs.readFileSync(path.resolve('public/js/app.js'), 'utf8');

    assert.ok(appSource.includes("'viral-hepatitis': () => import('./views/viralHepatitis.js')"),
      'app.js LAZY_LOADERS must register viral-hepatitis');

    assert.ok(appSource.includes("'viral-hepatitis': () => t('route.viralHepatitis'"),
      'app.js ROUTE_TITLES must register viral-hepatitis');

    assert.ok(appSource.includes("preloadRoute('viral-hepatitis')"),
      'app.js preloadAllLazyViews must include viral-hepatitis');
  });

  test('3. Cross-Module Navigation Links', () => {
    const guidesSource = fs.readFileSync(path.resolve('public/js/views/guides.js'), 'utf8');
    assert.ok(guidesSource.includes('#/viral-hepatitis'), 'guides.js must contain a cross-link to #/viral-hepatitis');

    const woundSource = fs.readFileSync(path.resolve('public/js/views/woundInfectious.js'), 'utf8');
    assert.ok(woundSource.includes('#/viral-hepatitis'), 'woundInfectious.js must contain a cross-link to #/viral-hepatitis');

    const harmRedSource = fs.readFileSync(path.resolve('public/js/views/harmReduction.js'), 'utf8');
    assert.ok(harmRedSource.includes('#/viral-hepatitis'), 'harmReduction.js must contain a cross-link to #/viral-hepatitis');
  });

  test('4. Service Worker Elective Shell Caching in sw.js', () => {
    const swSource = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');
    assert.ok(swSource.includes("'/js/views/viralHepatitis.js'"),
      'sw.js ELECTIVE_SHELL must include /js/views/viralHepatitis.js');
  });

  test('5. Spanish Localization Completeness', async () => {
    const esSource = fs.readFileSync(path.resolve('public/js/locales/es.js'), 'utf8');
    assert.ok(esSource.includes("'route.viralHepatitis'"), 'es.js must contain route.viralHepatitis translation');

    const esToolsSource = fs.readFileSync(path.resolve('public/js/locales/es-tools.js'), 'utf8');
    assert.ok(esToolsSource.includes("'tools.item.viral-hepatitis.title'"),
      'es-tools.js must contain tools.item.viral-hepatitis.title translation');
    assert.ok(esToolsSource.includes("'tools.item.viral-hepatitis.description'"),
      'es-tools.js must contain tools.item.viral-hepatitis.description translation');
  });

  test('6. Static Security, CSP & Privacy Compliance', () => {
    const files = [
      'public/js/views/viralHepatitis.js',
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

