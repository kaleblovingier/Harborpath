// test/wave15-integration.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import {
  getFamilyState,
  setFamilyState,
  resetFamilyState
} from '../public/js/views/familySupport.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';

test('Wave 15: Application Shell & Routing Orchestration', async () => {
  // Verify route registration
  assert.ok(typeof LAZY_LOADERS['family-support'] === 'function', 'family-support route must be registered in LAZY_LOADERS');
  assert.ok(typeof ROUTE_TITLES['family-support'] === 'function', 'family-support route title must be registered in ROUTE_TITLES');

  // Verify route titles in EN and ES
  const enTitle = ROUTE_TITLES['family-support']();
  assert.match(enTitle, /Family support & CRAFT guide/);
  assert.equal(es['route.familySupport'], 'Apoyo familiar y guía CRAFT');

  // Preload route without errors
  const viewFn = await preloadRoute('family-support');
  assert.ok(typeof viewFn === 'function', 'Preloading family-support must resolve to view function');

  // Test deterministic state reset
  setFamilyState({
    activeTab: 'script-builder',
    hasViolence: true,
    hasThreats: true,
    hasWeapons: true,
    understandingStatement: 'Custom statement',
    feelingStatement: 'Custom feeling',
    specificRequest: 'Custom request',
    offerOfSupport: 'Custom support'
  });
  assert.equal(getFamilyState().hasViolence, true);
  assert.equal(getFamilyState().activeTab, 'script-builder');

  resetFamilyState();
  const resetState = getFamilyState();
  assert.equal(resetState.activeTab, 'communication');
  assert.equal(resetState.hasViolence, false);
  assert.equal(resetState.hasThreats, false);
  assert.equal(resetState.hasWeapons, false);
  assert.match(resetState.understandingStatement, /under immense pressure/);
});

test('Wave 15: Care Tools Catalog & Search Filtering Integration', () => {
  const familyTool = TOOL_CATALOG.find((tool) => tool.id === 'family-support');
  assert.ok(familyTool, 'family-support must exist in TOOL_CATALOG');
  assert.equal(familyTool.category, 'planning');
  assert.deepEqual(familyTool.audiences, ['supporter', 'care-team']);
  assert.equal(familyTool.path, '#/family-support');

  // Search filtering in care tools catalog
  const filteredCraft = filterCareTools({ query: 'CRAFT' });
  assert.ok(filteredCraft.some((tool) => tool.id === 'family-support'), 'Must match CRAFT');

  const filteredFamily = filterCareTools({ query: 'family' });
  assert.ok(filteredFamily.some((tool) => tool.id === 'family-support'), 'Must match family');

  const filteredCommunication = filterCareTools({ query: 'communication' });
  assert.ok(filteredCommunication.some((tool) => tool.id === 'family-support'), 'Must match communication');

  // Supporter audience filter
  const supporterTools = filterCareTools({ audience: 'supporter' });
  assert.ok(supporterTools.some((tool) => tool.id === 'family-support'), 'Must appear under supporter audience');

  // Spanish translation keys exist
  assert.ok(esTools['tools.item.family-support.title']);
  assert.ok(esTools['tools.item.family-support.description']);
});

test('Wave 15: Guides Navigation Integration', () => {
  const guidesContent = readFileSync(new URL('../public/js/views/guides.js', import.meta.url), 'utf8');
  assert.match(guidesContent, /#\/family-support/, 'guides.js must provide direct navigation link to #/family-support');
});

test('Wave 15: Service Worker Manifest & Elective Cache Verification', () => {
  const swContent = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(swContent, /'\/js\/views\/familySupport\.js'/, 'sw.js ELECTIVE_SHELL must cache familySupport.js');
  assert.ok(existsSync(new URL('../public/js/views/familySupport.js', import.meta.url)));
});

test('Wave 15: Static Security & Privacy Compliance Audit', () => {
  const filesToCheck = [
    '../public/js/views/familySupport.js',
    '../public/js/views/tools.js'
  ];

  for (const file of filesToCheck) {
    const content = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(content, /localStorage/, `${file} must not access localStorage`);
    assert.doesNotMatch(content, /sessionStorage/, `${file} must not access sessionStorage`);
    assert.doesNotMatch(content, /document\.cookie/, `${file} must not access document.cookie`);
    assert.doesNotMatch(content, /innerHTML/, `${file} must not use innerHTML`);
    assert.doesNotMatch(content, /outerHTML/, `${file} must not use outerHTML`);
    assert.doesNotMatch(content, /style\s*=/, `${file} must not use inline style attributes`);
  }
});
