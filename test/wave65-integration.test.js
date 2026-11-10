// test/wave65-integration.test.js
// Wave 65: Platform Integration Suite (Inhalant Toxicology, Adulterant Heavy Metals, Peri-Overdose Pulmonary)

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { TOOL_CATALOG, TOOL_KEYWORDS } from '../public/js/views/tools.js';
import esToolsDict from '../public/js/locales/es-tools.js';
import { es as ES_TRANSLATIONS } from '../public/js/locales/es.js';

const ROOT = path.resolve('.');

test('Wave 65: Tool Catalog contains all 3 newly added clinical tools', () => {
  const toolIds = ['inhalant-toxicology', 'adulterant-heavy-metals', 'peri-overdose-pulmonary'];

  for (const id of toolIds) {
    const entry = TOOL_CATALOG.find((t) => t.id === id);
    assert.ok(entry, `Tool ${id} should exist in TOOL_CATALOG`);
    assert.ok(entry.title, `Tool ${id} should have a title`);
    assert.ok(entry.description, `Tool ${id} should have a description`);
    assert.equal(entry.path, `#/${id}`);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  }
});

test('Wave 65: Tool Keywords include search tokens for all 3 tools in English & Spanish', () => {
  assert.ok(TOOL_KEYWORDS['inhalant-toxicology'], 'Keywords exist for inhalant-toxicology');
  assert.ok(TOOL_KEYWORDS['inhalant-toxicology'].some((k) => k.includes('whippets')));
  assert.ok(TOOL_KEYWORDS['inhalant-toxicology'].some((k) => k.includes('galaxy gas')));
  assert.ok(TOOL_KEYWORDS['inhalant-toxicology'].some((k) => k.includes('inhalante')));

  assert.ok(TOOL_KEYWORDS['adulterant-heavy-metals'], 'Keywords exist for adulterant-heavy-metals');
  assert.ok(TOOL_KEYWORDS['adulterant-heavy-metals'].some((k) => k.includes('medetomidine')));
  assert.ok(TOOL_KEYWORDS['adulterant-heavy-metals'].some((k) => k.includes('brodifacoum')));
  assert.ok(TOOL_KEYWORDS['adulterant-heavy-metals'].some((k) => k.includes('adulterante')));

  assert.ok(TOOL_KEYWORDS['peri-overdose-pulmonary'], 'Keywords exist for peri-overdose-pulmonary');
  assert.ok(TOOL_KEYWORDS['peri-overdose-pulmonary'].some((k) => k.includes('ncpe')));
  assert.ok(TOOL_KEYWORDS['peri-overdose-pulmonary'].some((k) => k.includes('furosemide')));
  assert.ok(TOOL_KEYWORDS['peri-overdose-pulmonary'].some((k) => k.includes('pulmón de crack')));
});

test('Wave 65: Spanish localization includes all 3 tools and route translations', () => {
  assert.ok(esToolsDict['tools.item.inhalant-toxicology.title'], 'Spanish dictionary has inhalant-toxicology');
  assert.ok(esToolsDict['tools.item.adulterant-heavy-metals.title'], 'Spanish dictionary has adulterant-heavy-metals');
  assert.ok(esToolsDict['tools.item.peri-overdose-pulmonary.title'], 'Spanish dictionary has peri-overdose-pulmonary');

  assert.ok(ES_TRANSLATIONS['route.inhalantToxicology'], 'Spanish route.inhalantToxicology exists');
  assert.ok(ES_TRANSLATIONS['route.adulterantHeavyMetals'], 'Spanish route.adulterantHeavyMetals exists');
  assert.ok(ES_TRANSLATIONS['route.periOverdosePulmonary'], 'Spanish route.periOverdosePulmonary exists');
});

test('Wave 65: Service worker ELECTIVE_SHELL registers new view modules', () => {
  const swContent = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf-8');
  assert.ok(swContent.includes('/js/views/inhalantToxicology.js'));
  assert.ok(swContent.includes('/js/views/adulterantHeavyMetals.js'));
  assert.ok(swContent.includes('/js/views/periOverdosePulmonary.js'));
});

test('Wave 65: app.js contains route lazy loaders, preloads, and titles', () => {
  const appContent = fs.readFileSync(path.join(ROOT, 'public/js/app.js'), 'utf-8');
  assert.ok(appContent.includes("'inhalant-toxicology': () => import('./views/inhalantToxicology.js')"));
  assert.ok(appContent.includes("'adulterant-heavy-metals': () => import('./views/adulterantHeavyMetals.js')"));
  assert.ok(appContent.includes("'peri-overdose-pulmonary': () => import('./views/periOverdosePulmonary.js')"));
  assert.ok(appContent.includes("preloadRoute('inhalant-toxicology')"));
  assert.ok(appContent.includes("preloadRoute('adulterant-heavy-metals')"));
  assert.ok(appContent.includes("preloadRoute('peri-overdose-pulmonary')"));
});

test('Wave 65: Backend capabilities disclose new clinical engines', () => {
  const srcApp = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf-8');
  assert.ok(srcApp.includes('inhalantToxicology'));
  assert.ok(srcApp.includes('adulterantHeavyMetals'));
  assert.ok(srcApp.includes('periOverdosePulmonary'));

  const pyMain = fs.readFileSync(path.join(ROOT, 'backend/app/main.py'), 'utf-8');
  assert.ok(pyMain.includes('inhalant_toxicology'));
  assert.ok(pyMain.includes('adulterant_heavy_metals'));
  assert.ok(pyMain.includes('peri_overdose_pulmonary'));
});
