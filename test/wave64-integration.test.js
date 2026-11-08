import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { TOOL_CATALOG, TOOL_KEYWORDS } from '../public/js/views/tools.js';
import esToolsDict from '../public/js/locales/es-tools.js';
import { es as ES_TRANSLATIONS } from '../public/js/locales/es.js';

const ROOT = path.resolve('.');

test('Wave 64: Tool Catalog contains all 3 newly added clinical tools', () => {
  const toolIds = ['disaster-moud-climate', 'movement-disorders-eps', 'fungal-opportunistic-care'];

  for (const id of toolIds) {
    const entry = TOOL_CATALOG.find((t) => t.id === id);
    assert.ok(entry, `Tool ${id} should exist in TOOL_CATALOG`);
    assert.ok(entry.title, `Tool ${id} should have a title`);
    assert.ok(entry.description, `Tool ${id} should have a description`);
    assert.equal(entry.path, `#/${id}`);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  }
});

test('Wave 64: Tool Keywords include search tokens for all 3 tools', () => {
  assert.ok(TOOL_KEYWORDS['disaster-moud-climate'], 'Keywords exist for disaster-moud-climate');
  assert.ok(TOOL_KEYWORDS['disaster-moud-climate'].some((k) => k.includes('disaster')));
  assert.ok(TOOL_KEYWORDS['disaster-moud-climate'].some((k) => k.includes('wildfire')));

  assert.ok(TOOL_KEYWORDS['movement-disorders-eps'], 'Keywords exist for movement-disorders-eps');
  assert.ok(TOOL_KEYWORDS['movement-disorders-eps'].some((k) => k.includes('dystonia')));
  assert.ok(TOOL_KEYWORDS['movement-disorders-eps'].some((k) => k.includes('choreoathetosis')));

  assert.ok(TOOL_KEYWORDS['fungal-opportunistic-care'], 'Keywords exist for fungal-opportunistic-care');
  assert.ok(TOOL_KEYWORDS['fungal-opportunistic-care'].some((k) => k.includes('blastomycosis')));
  assert.ok(TOOL_KEYWORDS['fungal-opportunistic-care'].some((k) => k.includes('cyp3a4')));
});

test('Wave 64: Spanish localization includes all 3 tools and route translations', () => {
  assert.ok(esToolsDict['tools.item.disaster-moud-climate.title'], 'Spanish dictionary has disaster-moud-climate');
  assert.ok(esToolsDict['tools.item.movement-disorders-eps.title'], 'Spanish dictionary has movement-disorders-eps');
  assert.ok(esToolsDict['tools.item.fungal-opportunistic-care.title'], 'Spanish dictionary has fungal-opportunistic-care');

  assert.ok(ES_TRANSLATIONS['route.disasterMoudClimate'], 'Spanish route.disasterMoudClimate exists');
  assert.ok(ES_TRANSLATIONS['route.movementDisordersEps'], 'Spanish route.movementDisordersEps exists');
  assert.ok(ES_TRANSLATIONS['route.fungalOpportunisticCare'], 'Spanish route.fungalOpportunisticCare exists');
});

test('Wave 64: Service worker ELECTIVE_SHELL registers new view modules', () => {
  const swContent = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf-8');
  assert.ok(swContent.includes('/js/views/disasterMoudClimate.js'));
  assert.ok(swContent.includes('/js/views/movementDisordersEps.js'));
  assert.ok(swContent.includes('/js/views/fungalOpportunisticCare.js'));
});

test('Wave 64: app.js contains route lazy loaders and titles', () => {
  const appContent = fs.readFileSync(path.join(ROOT, 'public/js/app.js'), 'utf-8');
  assert.ok(appContent.includes("'disaster-moud-climate': () => import('./views/disasterMoudClimate.js')"));
  assert.ok(appContent.includes("'movement-disorders-eps': () => import('./views/movementDisordersEps.js')"));
  assert.ok(appContent.includes("'fungal-opportunistic-care': () => import('./views/fungalOpportunisticCare.js')"));
});

test('Wave 64: Backend capabilities disclose new clinical engines', () => {
  const srcApp = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf-8');
  assert.ok(srcApp.includes('disasterResilience'));
  assert.ok(srcApp.includes('movementDisorders'));
  assert.ok(srcApp.includes('opportunisticInfections'));

  const pyMain = fs.readFileSync(path.join(ROOT, 'backend/app/main.py'), 'utf-8');
  assert.ok(pyMain.includes('disaster_resilience'));
  assert.ok(pyMain.includes('movement_disorders'));
  assert.ok(pyMain.includes('opportunistic_infections'));
});
