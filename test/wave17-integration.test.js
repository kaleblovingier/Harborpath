// test/wave17-integration.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import {
  getMethadoneState,
  setMethadoneState,
  resetMethadoneState
} from '../public/js/views/methadoneAccess.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';

test('Wave 17: Application Shell & Routing Orchestration', async () => {
  // Verify route registration
  assert.ok(typeof LAZY_LOADERS['methadone-access'] === 'function', 'methadone-access route must be registered in LAZY_LOADERS');
  assert.ok(typeof ROUTE_TITLES['methadone-access'] === 'function', 'methadone-access route title must be registered in ROUTE_TITLES');

  // Verify route titles in EN and ES
  const enTitle = ROUTE_TITLES['methadone-access']();
  assert.match(enTitle, /Methadone clinic access & 2024 Part 8 rules/);
  assert.equal(es['route.methadoneAccess'], 'Acceso a clínicas de metadona y reglas Parte 8 de 2024');

  // Preload route without errors
  const viewFn = await preloadRoute('methadone-access');
  assert.ok(typeof viewFn === 'function', 'Preloading methadone-access must resolve to view function');

  // Test deterministic state reset
  setMethadoneState({
    activeTab: 'advocacy-scripts',
    daysInTreatment: 180,
    hasLockbox: false,
    selectedScriptType: 'toxicology_advocacy'
  });
  assert.equal(getMethadoneState().daysInTreatment, 180);
  assert.equal(getMethadoneState().hasLockbox, false);

  resetMethadoneState();
  const resetState = getMethadoneState();
  assert.equal(resetState.activeTab, 'takehome-calc');
  assert.equal(resetState.daysInTreatment, 45);
  assert.equal(resetState.hasLockbox, true);
  assert.equal(resetState.selectedScriptType, 'takehome_request');
});

test('Wave 17: Care Tools Catalog & Search Filtering Integration', () => {
  const methadoneTool = TOOL_CATALOG.find((tool) => tool.id === 'methadone-access');
  assert.ok(methadoneTool, 'methadone-access must exist in TOOL_CATALOG');
  assert.equal(methadoneTool.category, 'care');
  assert.deepEqual(methadoneTool.audiences, ['individual', 'supporter', 'care-team']);
  assert.equal(methadoneTool.path, '#/methadone-access');

  // Search filtering in care tools catalog
  const filteredMethadone = filterCareTools({ query: 'methadone' });
  assert.ok(filteredMethadone.some((tool) => tool.id === 'methadone-access'), 'Must match methadone');

  const filteredTakeHome = filterCareTools({ query: 'take-home' });
  assert.ok(filteredTakeHome.some((tool) => tool.id === 'methadone-access'), 'Must match take-home');

  const filteredPart8 = filterCareTools({ query: 'Part 8' });
  assert.ok(filteredPart8.some((tool) => tool.id === 'methadone-access'), 'Must match Part 8');

  // Audiences filter
  const individualTools = filterCareTools({ audience: 'individual' });
  assert.ok(individualTools.some((tool) => tool.id === 'methadone-access'));

  const teamTools = filterCareTools({ audience: 'care-team' });
  assert.ok(teamTools.some((tool) => tool.id === 'methadone-access'));

  // Spanish translation keys exist
  assert.ok(esTools['tools.item.methadone-access.title']);
  assert.ok(esTools['tools.item.methadone-access.description']);
});

test('Wave 17: Medications Guide Cross-Module Navigation Links', () => {
  const medsContent = readFileSync(new URL('../public/js/views/medications.js', import.meta.url), 'utf8');
  assert.match(medsContent, /#\/methadone-access/, 'medications.js must provide direct navigation link to #/methadone-access');
});

test('Wave 17: Service Worker Manifest & Elective Cache Verification', () => {
  const swContent = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(swContent, /'\/js\/views\/methadoneAccess\.js'/, 'sw.js ELECTIVE_SHELL must cache methadoneAccess.js');
  assert.ok(existsSync(new URL('../public/js/views/methadoneAccess.js', import.meta.url)));
});

test('Wave 17: Static Security & Privacy Compliance Audit', () => {
  const filesToCheck = [
    '../public/js/views/methadoneAccess.js',
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

