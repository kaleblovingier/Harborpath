import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LAZY_LOADERS, ROUTE_TITLES } from '../public/js/app.js';
import { TOOL_KEYWORDS } from '../public/js/views/tools.js';
import esTools from '../public/js/locales/es-tools.js';
import es from '../public/js/locales/es.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Wave 61 router registration: LAZY_LOADERS and ROUTE_TITLES', () => {
  const routes = ['encampment-medicine', 'street-trauma', 'fhir-export'];
  for (const r of routes) {
    assert.ok(typeof LAZY_LOADERS[r] === 'function', `LAZY_LOADERS has function for ${r}`);
    assert.ok(typeof ROUTE_TITLES[r] === 'function', `ROUTE_TITLES has function for ${r}`);
    const title = ROUTE_TITLES[r]();
    assert.ok(title && typeof title === 'string' && title.length > 5, `ROUTE_TITLES[${r}] returns valid title: ${title}`);
  }
});

test('Wave 61 tools catalog and search keywords', () => {
  const routes = ['encampment-medicine', 'street-trauma', 'fhir-export'];
  for (const r of routes) {
    assert.ok(TOOL_KEYWORDS[r], `TOOL_KEYWORDS has entry for ${r}`);
    assert.ok(Array.isArray(TOOL_KEYWORDS[r]), `TOOL_KEYWORDS[${r}] is an array`);
    assert.ok(TOOL_KEYWORDS[r].length >= 5, `TOOL_KEYWORDS[${r}] has comprehensive keyword coverage`);
  }

  assert.ok(TOOL_KEYWORDS['encampment-medicine'].includes('zoonosis'));
  assert.ok(TOOL_KEYWORDS['street-trauma'].includes('tourniquet'));
  assert.ok(TOOL_KEYWORDS['fhir-export'].includes('fhir'));
});

test('Wave 61 Spanish locale coverage', () => {
  // es-tools translations
  assert.ok(esTools['tools.item.encampment-medicine.title'], 'esTools has encampment title');
  assert.ok(esTools['tools.item.encampment-medicine.description'], 'esTools has encampment desc');
  assert.ok(esTools['tools.item.street-trauma.title'], 'esTools has street-trauma title');
  assert.ok(esTools['tools.item.street-trauma.description'], 'esTools has street-trauma desc');
  assert.ok(esTools['tools.item.fhir-export.title'], 'esTools has fhir-export title');
  assert.ok(esTools['tools.item.fhir-export.description'], 'esTools has fhir-export desc');

  // es route titles
  assert.ok(es['route.encampmentMedicine'], 'es has route.encampmentMedicine');
  assert.ok(es['route.streetTrauma'], 'es has route.streetTrauma');
  assert.ok(es['route.fhirExport'], 'es has route.fhirExport');
});

test('Wave 61 Service Worker ELECTIVE_SHELL registration', () => {
  const swContent = readFileSync(path.join(rootDir, 'public', 'sw.js'), 'utf8');
  assert.ok(swContent.includes("'/js/views/encampmentMedicine.js'"), 'sw.js includes encampmentMedicine.js');
  assert.ok(swContent.includes("'/js/views/streetTrauma.js'"), 'sw.js includes streetTrauma.js');
  assert.ok(swContent.includes("'/js/views/fhirExport.js'"), 'sw.js includes fhirExport.js');
});

test('Wave 61 Backend directory capabilities disclosure', () => {
  const appContent = readFileSync(path.join(rootDir, 'src', 'app.js'), 'utf8');
  assert.ok(appContent.includes('capabilities:'), 'src/app.js discloses capabilities');
  assert.ok(appContent.includes('interoperability:'), 'src/app.js includes interoperability');
  assert.ok(appContent.includes('fieldMedicine:'), 'src/app.js includes fieldMedicine');
});
