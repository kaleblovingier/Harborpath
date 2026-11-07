// test/wave13-integration.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import {
  CARE_WORKSPACE_STAGES,
  getCareWorkspaceState,
  setCareWorkspaceTask,
  resetCareWorkspaceState,
  formatCareWorkspaceSummary
} from '../public/js/views/workspace.js';
import {
  getPainState,
  setPainState,
  resetPainState
} from '../public/js/views/chronicPain.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

test('Wave 13: Application Shell & Routing Orchestration', async () => {
  // Verify route registration
  assert.ok(typeof LAZY_LOADERS['chronic-pain'] === 'function', 'chronic-pain route must be registered in LAZY_LOADERS');
  assert.ok(typeof ROUTE_TITLES['chronic-pain'] === 'function', 'chronic-pain route title must be registered in ROUTE_TITLES');

  // Verify route titles in EN and ES
  const enTitle = ROUTE_TITLES['chronic-pain']();
  assert.match(enTitle, /Chronic pain & sedative deprescribing/);
  assert.equal(es['route.chronicPain'], 'Dolor crónico y reducción gradual de sedantes');

  // Preload route without errors
  const viewFn = await preloadRoute('chronic-pain');
  assert.ok(typeof viewFn === 'function', 'Preloading chronic-pain must resolve to view function');

  // Test deterministic state reset
  setPainState({ currentSedative: 'alprazolam', sedativeDoseMg: '2', activeTab: 'sedative' });
  assert.equal(getPainState().currentSedative, 'alprazolam');
  resetPainState();
  assert.equal(getPainState().currentSedative, '');
  assert.equal(getPainState().activeTab, 'pain');
});

test('Wave 13: Care Tools Catalog Integration', () => {
  const painTool = TOOL_CATALOG.find((tool) => tool.id === 'chronic-pain');
  assert.ok(painTool, 'chronic-pain must exist in TOOL_CATALOG');
  assert.equal(painTool.category, 'care');
  assert.deepEqual(painTool.audiences, ['individual', 'supporter', 'care-team']);
  assert.equal(painTool.path, '#/chronic-pain');

  // Search filtering in tools catalog
  const filteredPain = filterCareTools({ query: 'sedative' });
  assert.ok(filteredPain.some((tool) => tool.id === 'chronic-pain'));

  const filteredAshton = filterCareTools({ query: 'Ashton' });
  assert.ok(filteredAshton.some((tool) => tool.id === 'chronic-pain'));

  // Spanish translation keys exist
  assert.ok(esTools['tools.item.chronic-pain.title']);
  assert.ok(esTools['tools.item.chronic-pain.description']);
});

test('Wave 13: Care Team Workspace Stage 4 & Documentation Integration', () => {
  assert.equal(CARE_WORKSPACE_STAGES.length, 4, 'Must have 4 stages in care workspace');

  const stage4 = CARE_WORKSPACE_STAGES.find((s) => s.id === 'postvisit');
  assert.ok(stage4, 'Stage 4 postvisit must exist');
  assert.equal(stage4.tasks.length, 4, 'Stage 4 must have 4 tasks');

  // Ensure unique task IDs
  const allTaskIds = CARE_WORKSPACE_STAGES.flatMap((s) => s.tasks.map((t) => t.id));
  const uniqueTaskIds = new Set(allTaskIds);
  assert.equal(allTaskIds.length, uniqueTaskIds.size, 'All task IDs across workspace stages must be unique');

  // Verify Stage 4 links include chronic-pain
  const hasPainLink = stage4.links.some((l) => l.href === '#/chronic-pain');
  assert.ok(hasPainLink, 'Stage 4 must link to #/chronic-pain');

  // Test checking a Stage 4 task and formatting summary
  resetCareWorkspaceState();
  setCareWorkspaceTask('documentation', true);
  setCareWorkspaceTask('harmreduction', true);
  const state = getCareWorkspaceState();
  assert.ok(state.checked.includes('documentation'));
  assert.ok(state.checked.includes('harmreduction'));

  const summary = formatCareWorkspaceSummary(state);
  assert.match(summary, /\[x\] Checked: Document checklist actions/);
  assert.match(summary, /\[x\] Checked: Confirm take-home naloxone/);
  assert.match(summary, /\[ \] Not checked — needs review: Verify transportation logistics/);

  // Spanish workspace translation keys
  assert.ok(esWorkspace['workspace.postvisit.title']);
  assert.ok(esWorkspace['workspace.postvisit.description']);
  assert.ok(esWorkspace['workspace.task.documentation']);
  assert.ok(esWorkspace['workspace.task.harmreduction']);
  assert.ok(esWorkspace['workspace.task.transportation']);
  assert.ok(esWorkspace['workspace.task.crisissupport']);

  resetCareWorkspaceState();
});

test('Wave 13: Service Worker Manifest & Elective Cache Verification', () => {
  const swContent = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(swContent, /'\/js\/views\/chronicPain\.js'/);
  assert.ok(existsSync(new URL('../public/js/views/chronicPain.js', import.meta.url)));
});

test('Wave 13: Static Security & Privacy Compliance Audit', () => {
  const filesToCheck = [
    '../public/js/views/chronicPain.js',
    '../public/js/views/workspace.js',
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
