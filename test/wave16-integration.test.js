// test/wave16-integration.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import {
  getAdulterantState,
  setAdulterantState,
  resetAdulterantState
} from '../public/js/views/adulterantCare.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';

test('Wave 16: Application Shell & Routing Orchestration', async () => {
  // Verify route registration
  assert.ok(typeof LAZY_LOADERS['adulterant-care'] === 'function', 'adulterant-care route must be registered in LAZY_LOADERS');
  assert.ok(typeof ROUTE_TITLES['adulterant-care'] === 'function', 'adulterant-care route title must be registered in ROUTE_TITLES');

  // Verify route titles in EN and ES
  const enTitle = ROUTE_TITLES['adulterant-care']();
  assert.match(enTitle, /Emerging adulterants, xylazine & wound care/);
  assert.equal(es['route.adulterantCare'], 'Adulterantes emergentes, xilacina y heridas por tranq');

  // Preload route without errors
  const viewFn = await preloadRoute('adulterant-care');
  assert.ok(typeof viewFn === 'function', 'Preloading adulterant-care must resolve to view function');

  // Test deterministic state reset
  setAdulterantState({
    activeTab: 'sedation-triage',
    breathingAbsentOrSlow: true,
    cyanosisLipsFingers: true,
    deepSedationWithBreathing: true
  });
  assert.equal(getAdulterantState().breathingAbsentOrSlow, true);
  assert.equal(getAdulterantState().activeTab, 'sedation-triage');

  resetAdulterantState();
  const resetState = getAdulterantState();
  assert.equal(resetState.activeTab, 'profiles');
  assert.equal(resetState.breathingAbsentOrSlow, false);
  assert.equal(resetState.cyanosisLipsFingers, false);
  assert.equal(resetState.deepSedationWithBreathing, false);
});

test('Wave 16: Care Tools Catalog & Search Filtering Integration', () => {
  const adulterantTool = TOOL_CATALOG.find((tool) => tool.id === 'adulterant-care');
  assert.ok(adulterantTool, 'adulterant-care must exist in TOOL_CATALOG');
  assert.equal(adulterantTool.category, 'care');
  assert.deepEqual(adulterantTool.audiences, ['individual', 'supporter', 'care-team']);
  assert.equal(adulterantTool.path, '#/adulterant-care');

  // Search filtering in care tools catalog
  const filteredXylazine = filterCareTools({ query: 'xylazine' });
  assert.ok(filteredXylazine.some((tool) => tool.id === 'adulterant-care'), 'Must match xylazine');

  const filteredTranq = filterCareTools({ query: 'tranq' });
  assert.ok(filteredTranq.some((tool) => tool.id === 'adulterant-care'), 'Must match tranq');

  const filteredNitazenes = filterCareTools({ query: 'nitazenes' });
  assert.ok(filteredNitazenes.some((tool) => tool.id === 'adulterant-care'), 'Must match nitazenes');

  // Audiences filter
  const individualTools = filterCareTools({ audience: 'individual' });
  assert.ok(individualTools.some((tool) => tool.id === 'adulterant-care'));

  const careTeamTools = filterCareTools({ audience: 'care-team' });
  assert.ok(careTeamTools.some((tool) => tool.id === 'adulterant-care'));

  // Spanish translation keys exist
  assert.ok(esTools['tools.item.adulterant-care.title']);
  assert.ok(esTools['tools.item.adulterant-care.description']);
});

test('Wave 16: Cross-Module Navigation Links (guides.js & harmReduction.js)', () => {
  const guidesContent = readFileSync(new URL('../public/js/views/guides.js', import.meta.url), 'utf8');
  assert.match(guidesContent, /#\/adulterant-care/, 'guides.js must provide direct navigation link to #/adulterant-care');

  const harmContent = readFileSync(new URL('../public/js/views/harmReduction.js', import.meta.url), 'utf8');
  assert.match(harmContent, /#\/adulterant-care/, 'harmReduction.js must provide direct link to #/adulterant-care');
});

test('Wave 16: Service Worker Manifest & Elective Cache Verification', () => {
  const swContent = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(swContent, /'\/js\/views\/adulterantCare\.js'/, 'sw.js ELECTIVE_SHELL must cache adulterantCare.js');
  assert.ok(existsSync(new URL('../public/js/views/adulterantCare.js', import.meta.url)));
});

test('Wave 16: Static Security & Privacy Compliance Audit', () => {
  const filesToCheck = [
    '../public/js/views/adulterantCare.js',
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

