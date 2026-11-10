// test/wave66-integration.test.js
// Wave 66: Platform Integration Suite (Cardiogenic Toxin HIET, Wooden Chest Rigidity, Hyperthermic Toxidrome)

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { TOOL_CATALOG, TOOL_KEYWORDS } from '../public/js/views/tools.js';
import esToolsDict from '../public/js/locales/es-tools.js';
import { es as ES_TRANSLATIONS } from '../public/js/locales/es.js';

const ROOT = path.resolve('.');

test('Wave 66: Tool Catalog contains all 3 newly added clinical tools', () => {
  const toolIds = ['cardiogenic-toxin-hiet', 'wooden-chest-rigidity', 'hyperthermic-toxidrome'];

  for (const id of toolIds) {
    const entry = TOOL_CATALOG.find((t) => t.id === id);
    assert.ok(entry, `Tool ${id} should exist in TOOL_CATALOG`);
    assert.ok(entry.title, `Tool ${id} should have a title`);
    assert.ok(entry.description, `Tool ${id} should have a description`);
    assert.equal(entry.path, `#/${id}`);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  }
});

test('Wave 66: Tool Keywords include search tokens for all 3 tools in English & Spanish', () => {
  assert.ok(TOOL_KEYWORDS['cardiogenic-toxin-hiet'], 'Keywords exist for cardiogenic-toxin-hiet');
  assert.ok(TOOL_KEYWORDS['cardiogenic-toxin-hiet'].some((k) => k.includes('hiet')));
  assert.ok(TOOL_KEYWORDS['cardiogenic-toxin-hiet'].some((k) => k.includes('insulin')));
  assert.ok(TOOL_KEYWORDS['cardiogenic-toxin-hiet'].some((k) => k.includes('bloqueador de canales de calcio')));

  assert.ok(TOOL_KEYWORDS['wooden-chest-rigidity'], 'Keywords exist for wooden-chest-rigidity');
  assert.ok(TOOL_KEYWORDS['wooden-chest-rigidity'].some((k) => k.includes('wooden chest')));
  assert.ok(TOOL_KEYWORDS['wooden-chest-rigidity'].some((k) => k.includes('rocuronium')));
  assert.ok(TOOL_KEYWORDS['wooden-chest-rigidity'].some((k) => k.includes('tórax de madera')));

  assert.ok(TOOL_KEYWORDS['hyperthermic-toxidrome'], 'Keywords exist for hyperthermic-toxidrome');
  assert.ok(TOOL_KEYWORDS['hyperthermic-toxidrome'].some((k) => k.includes('bath salts')));
  assert.ok(TOOL_KEYWORDS['hyperthermic-toxidrome'].some((k) => k.includes('flakka')));
  assert.ok(TOOL_KEYWORDS['hyperthermic-toxidrome'].some((k) => k.includes('hipertermia')));
});

test('Wave 66: Spanish localization includes all 3 tools and route translations', () => {
  assert.ok(esToolsDict['tools.item.cardiogenic-toxin-hiet.title'], 'Spanish dictionary has cardiogenic-toxin-hiet');
  assert.ok(esToolsDict['tools.item.wooden-chest-rigidity.title'], 'Spanish dictionary has wooden-chest-rigidity');
  assert.ok(esToolsDict['tools.item.hyperthermic-toxidrome.title'], 'Spanish dictionary has hyperthermic-toxidrome');

  assert.ok(ES_TRANSLATIONS['route.cardiogenicToxinHiet'], 'Spanish route.cardiogenicToxinHiet exists');
  assert.ok(ES_TRANSLATIONS['route.woodenChestRigidity'], 'Spanish route.woodenChestRigidity exists');
  assert.ok(ES_TRANSLATIONS['route.hyperthermicToxidrome'], 'Spanish route.hyperthermicToxidrome exists');
});

test('Wave 66: Service worker ELECTIVE_SHELL registers new view modules', () => {
  const swContent = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf-8');
  assert.ok(swContent.includes('/js/views/cardiogenicToxinHiet.js'));
  assert.ok(swContent.includes('/js/views/woodenChestRigidity.js'));
  assert.ok(swContent.includes('/js/views/hyperthermicToxidrome.js'));
});

test('Wave 66: app.js contains route lazy loaders, preloads, and titles', () => {
  const appContent = fs.readFileSync(path.join(ROOT, 'public/js/app.js'), 'utf-8');
  assert.ok(appContent.includes("'cardiogenic-toxin-hiet': () => import('./views/cardiogenicToxinHiet.js')"));
  assert.ok(appContent.includes("'wooden-chest-rigidity': () => import('./views/woodenChestRigidity.js')"));
  assert.ok(appContent.includes("'hyperthermic-toxidrome': () => import('./views/hyperthermicToxidrome.js')"));
  assert.ok(appContent.includes("preloadRoute('cardiogenic-toxin-hiet')"));
  assert.ok(appContent.includes("preloadRoute('wooden-chest-rigidity')"));
  assert.ok(appContent.includes("preloadRoute('hyperthermic-toxidrome')"));
});

test('Wave 66: Backend capabilities disclose new clinical engines', () => {
  const srcApp = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf-8');
  assert.ok(srcApp.includes('cardiogenicToxinHiet'));
  assert.ok(srcApp.includes('woodenChestRigidity'));
  assert.ok(srcApp.includes('hyperthermicToxidrome'));

  const pyMain = fs.readFileSync(path.join(ROOT, 'backend/app/main.py'), 'utf-8');
  assert.ok(pyMain.includes('cardiogenic_toxin_hiet'));
  assert.ok(pyMain.includes('wooden_chest_rigidity'));
  assert.ok(pyMain.includes('hyperthermic_toxidrome'));
});
