// test/wave67-integration.test.js
// Wave 67: Platform Integration Suite (Salicylate/NSAID Tox, Mood Stabilizer Tox, Antimuscarinic Delirium,
// CSS Elective Bundle Split, WAI-ARIA Tablist & Clipboard Accessibility, and #/tools UX Upgrade)

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { TOOL_CATALOG, TOOL_KEYWORDS } from '../public/js/views/tools.js';
import esToolsDict from '../public/js/locales/es-tools.js';
import { es as ES_TRANSLATIONS } from '../public/js/locales/es.js';

const ROOT = path.resolve('.');

test('Wave 67: Tool Catalog contains all 3 newly added clinical tools', () => {
  const toolIds = ['salicylate-nsaid-tox', 'mood-stabilizer-tox', 'antimuscarinic-toxidrome'];

  for (const id of toolIds) {
    const entry = TOOL_CATALOG.find((tool) => tool.id === id);
    assert.ok(entry, `Tool ${id} should exist in TOOL_CATALOG`);
    assert.ok(entry.title, `Tool ${id} should have a title`);
    assert.ok(entry.description, `Tool ${id} should have a description`);
    assert.equal(entry.path, `#/${id}`);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  }
});

test('Wave 67: Tool Keywords include search tokens for all 3 tools in English & Spanish', () => {
  assert.ok(TOOL_KEYWORDS['salicylate-nsaid-tox'].some((k) => k.includes('aspirin')));
  assert.ok(TOOL_KEYWORDS['salicylate-nsaid-tox'].some((k) => k.includes('urine alkalinization')));
  assert.ok(TOOL_KEYWORDS['salicylate-nsaid-tox'].some((k) => k.includes('alcalinización urinaria')));

  assert.ok(TOOL_KEYWORDS['mood-stabilizer-tox'].some((k) => k.includes('lithium')));
  assert.ok(TOOL_KEYWORDS['mood-stabilizer-tox'].some((k) => k.includes('hyperammonemia')));
  assert.ok(TOOL_KEYWORDS['mood-stabilizer-tox'].some((k) => k.includes('lamotrigine')));
  assert.ok(TOOL_KEYWORDS['mood-stabilizer-tox'].some((k) => k.includes('litio')));

  assert.ok(TOOL_KEYWORDS['antimuscarinic-toxidrome'].some((k) => k.includes('diphenhydramine')));
  assert.ok(TOOL_KEYWORDS['antimuscarinic-toxidrome'].some((k) => k.includes('physostigmine')));
  assert.ok(TOOL_KEYWORDS['antimuscarinic-toxidrome'].some((k) => k.includes('difenhidramina')));
});

test('Wave 67: Spanish localization includes all 3 tools and route translations', () => {
  assert.ok(esToolsDict['tools.item.salicylate-nsaid-tox.title']);
  assert.ok(esToolsDict['tools.item.mood-stabilizer-tox.title']);
  assert.ok(esToolsDict['tools.item.antimuscarinic-toxidrome.title']);

  assert.ok(ES_TRANSLATIONS['route.salicylateNsaidTox']);
  assert.ok(ES_TRANSLATIONS['route.moodStabilizerTox']);
  assert.ok(ES_TRANSLATIONS['route.antimuscarinicToxidrome']);
  assert.ok(ES_TRANSLATIONS['common.copiedBtn']);
  assert.ok(ES_TRANSLATIONS['dual.scriptCopied']);
  assert.ok(ES_TRANSLATIONS['methadone.scriptCopied']);
});

test('Wave 67: Service worker ELECTIVE_SHELL registers elective CSS and Wave 67 view modules', () => {
  const swContent = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf-8');
  assert.ok(swContent.includes("'/css/elective.css'"));
  assert.ok(swContent.includes("'/js/views/salicylateTox.js'"));
  assert.ok(swContent.includes("'/js/views/moodStabilizerTox.js'"));
  assert.ok(swContent.includes("'/js/views/antimuscarinicTox.js'"));
  assert.ok(fs.existsSync(path.join(ROOT, 'public/css/elective.css')));
});

test('Wave 67: app.js wires lazy routes, Quick Exit resets, elective CSS loader, and tablist keyboard delegation', () => {
  const appContent = fs.readFileSync(path.join(ROOT, 'public/js/app.js'), 'utf-8');
  assert.ok(appContent.includes("'salicylate-nsaid-tox': () => import('./views/salicylateTox.js')"));
  assert.ok(appContent.includes("'mood-stabilizer-tox': () => import('./views/moodStabilizerTox.js')"));
  assert.ok(appContent.includes("'antimuscarinic-toxidrome': () => import('./views/antimuscarinicTox.js')"));
  assert.ok(appContent.includes("routeResets.set('salicylate-nsaid-tox', m.resetSalicylateToxState)"));
  assert.ok(appContent.includes("routeResets.set('mood-stabilizer-tox', m.resetMoodStabilizerToxState)"));
  assert.ok(appContent.includes("routeResets.set('antimuscarinic-toxidrome', m.resetAntimuscarinicToxState)"));
  assert.ok(appContent.includes("preloadRoute('salicylate-nsaid-tox')"));
  assert.ok(appContent.includes("preloadRoute('mood-stabilizer-tox')"));
  assert.ok(appContent.includes("preloadRoute('antimuscarinic-toxidrome')"));
  assert.ok(appContent.includes('/css/elective.css'));
  assert.ok(appContent.includes('wireTablistKeyboard(main)'));
  assert.ok(appContent.includes('syncTablists(main)'));
});

test('Wave 67: Node and Python backends disclose all 3 new clinical engines', () => {
  const srcApp = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf-8');
  assert.ok(srcApp.includes('salicylateNsaidTox'));
  assert.ok(srcApp.includes('moodStabilizerTox'));
  assert.ok(srcApp.includes('antimuscarinicToxidrome'));

  const pyMain = fs.readFileSync(path.join(ROOT, 'backend/app/main.py'), 'utf-8');
  assert.ok(pyMain.includes('salicylate_nsaid_tox'));
  assert.ok(pyMain.includes('mood_stabilizer_tox'));
  assert.ok(pyMain.includes('antimuscarinic_toxidrome'));
});
