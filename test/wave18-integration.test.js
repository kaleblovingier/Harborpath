// test/wave18-integration.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import { installMockDom } from './fixtures/mockDomHelper.js';
import {
  getDualDiagnosisState,
  setDualDiagnosisState,
  resetDualDiagnosisState
} from '../public/js/views/dualDiagnosis.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';

test('Wave 18: Application Shell & Routing Orchestration', async () => {
  // Verify route registration
  assert.ok(typeof LAZY_LOADERS['dual-diagnosis'] === 'function', 'dual-diagnosis route must be registered in LAZY_LOADERS');
  assert.ok(typeof ROUTE_TITLES['dual-diagnosis'] === 'function', 'dual-diagnosis route title must be registered in ROUTE_TITLES');

  // Verify route titles in EN and ES
  const enTitle = ROUTE_TITLES['dual-diagnosis']();
  assert.match(enTitle, /Dual diagnosis & integrated mental health/);
  assert.equal(es['route.dualDiagnosis'], 'Diagnóstico dual y salud mental integrada');

  // Preload route without errors
  const viewFn = await preloadRoute('dual-diagnosis');
  assert.ok(typeof viewFn === 'function', 'Preloading dual-diagnosis must resolve to view function');

  // Test deterministic state reset
  setDualDiagnosisState({
    activeTab: 'crisis-plan',
    intentWithPlan: true,
    wishToBeDead: true,
    testedMedication: 'Venlafaxine'
  });
  assert.equal(getDualDiagnosisState().intentWithPlan, true);
  assert.equal(getDualDiagnosisState().testedMedication, 'Venlafaxine');

  resetDualDiagnosisState();
  const resetState = getDualDiagnosisState();
  assert.equal(resetState.activeTab, 'iddt-model');
  assert.equal(resetState.intentWithPlan, false);
  assert.equal(resetState.wishToBeDead, false);
  assert.equal(resetState.testedMedication, 'Bupropion (Wellbutrin)');
});

test('Wave 18: Care Tools Catalog & Search Filtering Integration', () => {
  const dualTool = TOOL_CATALOG.find((tool) => tool.id === 'dual-diagnosis');
  assert.ok(dualTool, 'dual-diagnosis must exist in TOOL_CATALOG');
  assert.equal(dualTool.category, 'care');
  assert.deepEqual(dualTool.audiences, ['individual', 'supporter', 'care-team']);
  assert.equal(dualTool.path, '#/dual-diagnosis');

  // Search filtering in care tools catalog
  const filteredDual = filterCareTools({ query: 'dual diagnosis' });
  assert.ok(filteredDual.some((tool) => tool.id === 'dual-diagnosis'), 'Must match dual diagnosis');

  const filteredMental = filterCareTools({ query: 'mental health' });
  assert.ok(filteredMental.some((tool) => tool.id === 'dual-diagnosis'), 'Must match mental health');

  const filteredIddt = filterCareTools({ query: 'IDDT' });
  assert.ok(filteredIddt.some((tool) => tool.id === 'dual-diagnosis'), 'Must match IDDT');

  // Audiences filter
  const individualTools = filterCareTools({ audience: 'individual' });
  assert.ok(individualTools.some((tool) => tool.id === 'dual-diagnosis'));

  const teamTools = filterCareTools({ audience: 'care-team' });
  assert.ok(teamTools.some((tool) => tool.id === 'dual-diagnosis'));

  // Spanish translation keys exist
  assert.ok(esTools['tools.item.dual-diagnosis.title']);
  assert.ok(esTools['tools.item.dual-diagnosis.description']);
});

test('Wave 18: Recovery and family support links directly to the dual diagnosis guide', async () => {
  const supportView = await preloadRoute('support');
  const restore = installMockDom();
  try {
    assert.ok(supportView().querySelectorAll('a').some(link => link.getAttribute('href') === '#/dual-diagnosis'));
  } finally { restore(); }
});

test('Wave 18: Service Worker Manifest & Elective Cache Verification', () => {
  const swContent = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(swContent, /'\/js\/views\/dualDiagnosis\.js'/, 'sw.js ELECTIVE_SHELL must cache dualDiagnosis.js');
  assert.ok(existsSync(new URL('../public/js/views/dualDiagnosis.js', import.meta.url)));
});

test('Wave 18: Static Security & Privacy Compliance Audit', () => {
  const filesToCheck = [
    '../public/js/views/dualDiagnosis.js',
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
