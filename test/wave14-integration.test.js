// test/wave14-integration.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import {
  getAlcoholState,
  setAlcoholState,
  resetAlcoholState
} from '../public/js/views/alcoholCare.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';

test('Wave 14: Application Shell & Routing Orchestration', async () => {
  // Verify route registration
  assert.ok(typeof LAZY_LOADERS['alcohol-care'] === 'function', 'alcohol-care route must be registered in LAZY_LOADERS');
  assert.ok(typeof ROUTE_TITLES['alcohol-care'] === 'function', 'alcohol-care route title must be registered in ROUTE_TITLES');

  // Verify route titles in EN and ES
  const enTitle = ROUTE_TITLES['alcohol-care']();
  assert.match(enTitle, /Alcohol care, withdrawal & MAUD/);
  assert.equal(es['route.alcoholCare'], 'Atención de alcohol, abstinencia y MAUD');

  // Preload route without errors
  const viewFn = await preloadRoute('alcohol-care');
  assert.ok(typeof viewFn === 'function', 'Preloading alcohol-care must resolve to view function');

  // Test deterministic state reset
  setAlcoholState({ pawssItems: ['p1_alcohol_recent'], hasLiverDisease: true, activeTab: 'maud' });
  assert.equal(getAlcoholState().hasLiverDisease, true);
  resetAlcoholState();
  assert.equal(getAlcoholState().hasLiverDisease, false);
  assert.equal(getAlcoholState().activeTab, 'pawss');
});

test('Wave 14: Care Tools Catalog Integration', () => {
  const alcoholTool = TOOL_CATALOG.find((tool) => tool.id === 'alcohol-care');
  assert.ok(alcoholTool, 'alcohol-care must exist in TOOL_CATALOG');
  assert.equal(alcoholTool.category, 'care');
  assert.deepEqual(alcoholTool.audiences, ['individual', 'supporter', 'care-team']);
  assert.equal(alcoholTool.path, '#/alcohol-care');

  // Search filtering in tools catalog
  const filteredAlcohol = filterCareTools({ query: 'alcohol' });
  assert.ok(filteredAlcohol.some((tool) => tool.id === 'alcohol-care'));

  const filteredPawss = filterCareTools({ query: 'PAWSS' });
  assert.ok(filteredPawss.some((tool) => tool.id === 'alcohol-care'));

  const filteredMaud = filterCareTools({ query: 'MAUD' });
  assert.ok(filteredMaud.some((tool) => tool.id === 'alcohol-care'));

  // Spanish translation keys exist
  assert.ok(esTools['tools.item.alcohol-care.title']);
  assert.ok(esTools['tools.item.alcohol-care.description']);
});

test('Wave 14: Service Worker Manifest & Elective Cache Verification', () => {
  const swContent = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(swContent, /'\/js\/views\/alcoholCare\.js'/);
  assert.ok(existsSync(new URL('../public/js/views/alcoholCare.js', import.meta.url)));
});

test('Wave 14: Static Security & Privacy Compliance Audit', () => {
  const filesToCheck = [
    '../public/js/views/alcoholCare.js',
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

