import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { TOOL_CATALOG, TOOL_KEYWORDS } from '../public/js/views/tools.js';
import esToolsDict from '../public/js/locales/es-tools.js';
import { es as ES_TRANSLATIONS } from '../public/js/locales/es.js';

const ROOT = path.resolve('.');

test('Wave 62: Tool Catalog contains all 3 newly added clinical tools', () => {
  const toolIds = ['toxic-alcohol', 'mass-overdose-mci', 'moud-directive'];

  for (const id of toolIds) {
    const entry = TOOL_CATALOG.find((t) => t.id === id);
    assert.ok(entry, `Tool ${id} should exist in TOOL_CATALOG`);
    assert.ok(entry.title, `Tool ${id} should have a title`);
    assert.ok(entry.description, `Tool ${id} should have a description`);
    assert.equal(entry.path, `#/${id}`);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  }
});

test('Wave 62: Tool Keywords include search tokens for all 3 tools', () => {
  assert.ok(TOOL_KEYWORDS['toxic-alcohol'], 'Keywords exist for toxic-alcohol');
  assert.ok(TOOL_KEYWORDS['toxic-alcohol'].some((k) => k.includes('fomepizole')));
  assert.ok(TOOL_KEYWORDS['toxic-alcohol'].some((k) => k.includes('methanol')));

  assert.ok(TOOL_KEYWORDS['mass-overdose-mci'], 'Keywords exist for mass-overdose-mci');
  assert.ok(TOOL_KEYWORDS['mass-overdose-mci'].some((k) => k.includes('salt')));
  assert.ok(TOOL_KEYWORDS['mass-overdose-mci'].some((k) => k.includes('wooden chest')));

  assert.ok(TOOL_KEYWORDS['moud-directive'], 'Keywords exist for moud-directive');
  assert.ok(TOOL_KEYWORDS['moud-directive'].some((k) => k.includes('methadone')));
  assert.ok(TOOL_KEYWORDS['moud-directive'].some((k) => k.includes('rights')));
});

test('Wave 62: Spanish localization includes all 3 tools and route translations', () => {
  assert.ok(esToolsDict['tools.item.toxic-alcohol.title'], 'Spanish dictionary has toxic-alcohol');
  assert.ok(esToolsDict['tools.item.mass-overdose-mci.title'], 'Spanish dictionary has mass-overdose-mci');
  assert.ok(esToolsDict['tools.item.moud-directive.title'], 'Spanish dictionary has moud-directive');

  assert.ok(ES_TRANSLATIONS['route.toxicAlcohol'], 'Spanish route.toxicAlcohol exists');
  assert.ok(ES_TRANSLATIONS['route.massOverdoseMci'], 'Spanish route.massOverdoseMci exists');
  assert.ok(ES_TRANSLATIONS['route.moudDirective'], 'Spanish route.moudDirective exists');
});

test('Wave 62: Service worker ELECTIVE_SHELL registers new view modules', () => {
  const swContent = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf-8');
  assert.ok(swContent.includes('/js/views/toxicAlcohol.js'));
  assert.ok(swContent.includes('/js/views/massOverdoseMci.js'));
  assert.ok(swContent.includes('/js/views/moudDirective.js'));
});

test('Wave 62: app.js contains route lazy loaders and titles', () => {
  const appContent = fs.readFileSync(path.join(ROOT, 'public/js/app.js'), 'utf-8');
  assert.ok(appContent.includes("'toxic-alcohol': () => import('./views/toxicAlcohol.js')"));
  assert.ok(appContent.includes("'mass-overdose-mci': () => import('./views/massOverdoseMci.js')"));
  assert.ok(appContent.includes("'moud-directive': () => import('./views/moudDirective.js')"));
  assert.ok(appContent.includes("'toxic-alcohol': () => t('route.toxicAlcohol'"));
  assert.ok(appContent.includes("'mass-overdose-mci': () => t('route.massOverdoseMci'"));
  assert.ok(appContent.includes("'moud-directive': () => t('route.moudDirective'"));
});

test('Wave 62: Backend capabilities disclose new clinical engines', () => {
  const pyContent = fs.readFileSync(path.join(ROOT, 'backend/app/main.py'), 'utf-8');
  assert.ok(pyContent.includes('toxic alcohol'));
  assert.ok(pyContent.includes('SALT mass overdose'));
  assert.ok(pyContent.includes('offline verifiable MOUD rights directives'));

  const srcAppContent = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf-8');
  assert.ok(srcAppContent.includes('toxic alcohol'));
  assert.ok(srcAppContent.includes('SALT mass overdose'));
  assert.ok(srcAppContent.includes('offline verifiable MOUD rights directives'));
});
