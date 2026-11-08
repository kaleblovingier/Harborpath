import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { TOOL_CATALOG, TOOL_KEYWORDS } from '../public/js/views/tools.js';
import esToolsDict from '../public/js/locales/es-tools.js';
import { es as ES_TRANSLATIONS } from '../public/js/locales/es.js';

const ROOT = path.resolve('.');

test('Wave 63: Tool Catalog contains all 3 newly added clinical tools', () => {
  const toolIds = ['nsti-wound-staging', 'pediatric-ingestion-decon', 'carceral-moud-reentry'];

  for (const id of toolIds) {
    const entry = TOOL_CATALOG.find((t) => t.id === id);
    assert.ok(entry, `Tool ${id} should exist in TOOL_CATALOG`);
    assert.ok(entry.title, `Tool ${id} should have a title`);
    assert.ok(entry.description, `Tool ${id} should have a description`);
    assert.equal(entry.path, `#/${id}`);
    assert.ok(Array.isArray(entry.audiences) && entry.audiences.length > 0);
  }
});

test('Wave 63: Tool Keywords include search tokens for all 3 tools', () => {
  assert.ok(TOOL_KEYWORDS['nsti-wound-staging'], 'Keywords exist for nsti-wound-staging');
  assert.ok(TOOL_KEYWORDS['nsti-wound-staging'].some((k) => k.includes('lrinec')));
  assert.ok(TOOL_KEYWORDS['nsti-wound-staging'].some((k) => k.includes('necrotizing')));

  assert.ok(TOOL_KEYWORDS['pediatric-ingestion-decon'], 'Keywords exist for pediatric-ingestion-decon');
  assert.ok(TOOL_KEYWORDS['pediatric-ingestion-decon'].some((k) => k.includes('one pill can kill')));
  assert.ok(TOOL_KEYWORDS['pediatric-ingestion-decon'].some((k) => k.includes('charcoal')));

  assert.ok(TOOL_KEYWORDS['carceral-moud-reentry'], 'Keywords exist for carceral-moud-reentry');
  assert.ok(TOOL_KEYWORDS['carceral-moud-reentry'].some((k) => k.includes('carceral')));
  assert.ok(TOOL_KEYWORDS['carceral-moud-reentry'].some((k) => k.includes('reentry')));
});

test('Wave 63: Spanish localization includes all 3 tools and route translations', () => {
  assert.ok(esToolsDict['tools.item.nsti-wound-staging.title'], 'Spanish dictionary has nsti-wound-staging');
  assert.ok(esToolsDict['tools.item.pediatric-ingestion-decon.title'], 'Spanish dictionary has pediatric-ingestion-decon');
  assert.ok(esToolsDict['tools.item.carceral-moud-reentry.title'], 'Spanish dictionary has carceral-moud-reentry');

  assert.ok(ES_TRANSLATIONS['route.nstiWoundStaging'], 'Spanish route.nstiWoundStaging exists');
  assert.ok(ES_TRANSLATIONS['route.pediatricIngestionDecon'], 'Spanish route.pediatricIngestionDecon exists');
  assert.ok(ES_TRANSLATIONS['route.carceralMoudReentry'], 'Spanish route.carceralMoudReentry exists');
});

test('Wave 63: Service worker ELECTIVE_SHELL registers new view modules', () => {
  const swContent = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf-8');
  assert.ok(swContent.includes('/js/views/nstiWoundStaging.js'));
  assert.ok(swContent.includes('/js/views/pediatricIngestionDecon.js'));
  assert.ok(swContent.includes('/js/views/carceralMoudReentry.js'));
});

test('Wave 63: app.js contains route lazy loaders and titles', () => {
  const appContent = fs.readFileSync(path.join(ROOT, 'public/js/app.js'), 'utf-8');
  assert.ok(appContent.includes("'nsti-wound-staging': () => import('./views/nstiWoundStaging.js')"));
  assert.ok(appContent.includes("'pediatric-ingestion-decon': () => import('./views/pediatricIngestionDecon.js')"));
  assert.ok(appContent.includes("'carceral-moud-reentry': () => import('./views/carceralMoudReentry.js')"));
  assert.ok(appContent.includes("'nsti-wound-staging': () => t('route.nstiWoundStaging'"));
  assert.ok(appContent.includes("'pediatric-ingestion-decon': () => t('route.pediatricIngestionDecon'"));
  assert.ok(appContent.includes("'carceral-moud-reentry': () => t('route.carceralMoudReentry'"));
});

test('Wave 63: Backend capabilities disclose new clinical engines', () => {
  const pyContent = fs.readFileSync(path.join(ROOT, 'backend/app/main.py'), 'utf-8');
  assert.ok(pyContent.includes('NSTI/LRINEC wound staging'));
  assert.ok(pyContent.includes('One Pill Can Kill decontamination engine'));
  assert.ok(pyContent.includes('DOJ Title II ADA carceral MOUD continuity'));

  const srcAppContent = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf-8');
  assert.ok(srcAppContent.includes('NSTI/LRINEC wound staging'));
  assert.ok(srcAppContent.includes('One Pill Can Kill decontamination engine'));
  assert.ok(srcAppContent.includes('DOJ Title II ADA carceral MOUD continuity'));
});
