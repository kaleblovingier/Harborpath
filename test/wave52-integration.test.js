import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

describe('Wave 52 (10-Agent Expansion) Platform Integration: #/ent-care & #/dermatology-care', () => {
  it('registers both ent-care and dermatology-care in public/js/app.js LAZY_LOADERS, ROUTE_TITLES, and preloadAllLazyViews', () => {
    const appJs = fs.readFileSync(path.join(rootDir, 'public/js/app.js'), 'utf8');
    assert.ok(appJs.includes("'ent-care': () => import('./views/entCare.js')"));
    assert.ok(appJs.includes("'dermatology-care': () => import('./views/dermatologyCare.js')"));
    assert.ok(appJs.includes("'ent-care': () => t('route.entCare'"));
    assert.ok(appJs.includes("'dermatology-care': () => t('route.dermatologyCare'"));
    assert.ok(appJs.includes("preloadRoute('ent-care')"));
    assert.ok(appJs.includes("preloadRoute('dermatology-care')"));
  });

  it('precaches /js/views/entCare.js and /js/views/dermatologyCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swJs = fs.readFileSync(path.join(rootDir, 'public/sw.js'), 'utf8');
    assert.ok(swJs.includes("'/js/views/entCare.js'"));
    assert.ok(swJs.includes("'/js/views/dermatologyCare.js'"));
  });

  it('registers ent-care and dermatology-care in public/js/views/tools.js catalog and search keywords', () => {
    const toolsJs = fs.readFileSync(path.join(rootDir, 'public/js/views/tools.js'), 'utf8');
    assert.ok(toolsJs.includes("['ent-care', 'emergency'"));
    assert.ok(toolsJs.includes("['dermatology-care', 'emergency'"));
    assert.ok(toolsJs.includes("'ludwig angina'"));
    assert.ok(toolsJs.includes("'stevens-johnson'"));
  });

  it('cross-links #/ent-care and #/dermatology-care across workspace.js, dentalCare.js, pulmonaryCare.js, adulterantCare.js, and stimulantCare.js', () => {
    const workspaceJs = fs.readFileSync(path.join(rootDir, 'public/js/views/workspace.js'), 'utf8');
    assert.ok(workspaceJs.includes('#/ent-care'));
    assert.ok(workspaceJs.includes('#/dermatology-care'));

    const dentalJs = fs.readFileSync(path.join(rootDir, 'public/js/views/dentalCare.js'), 'utf8');
    assert.ok(dentalJs.includes('#/ent-care'));

    const pulmJs = fs.readFileSync(path.join(rootDir, 'public/js/views/pulmonaryCare.js'), 'utf8');
    assert.ok(pulmJs.includes('#/ent-care'));

    const adultJs = fs.readFileSync(path.join(rootDir, 'public/js/views/adulterantCare.js'), 'utf8');
    assert.ok(adultJs.includes('#/dermatology-care'));

    const stimJs = fs.readFileSync(path.join(rootDir, 'public/js/views/stimulantCare.js'), 'utf8');
    assert.ok(stimJs.includes('#/ent-care'));
    assert.ok(stimJs.includes('#/dermatology-care'));
  });

  it('includes Spanish localization for both ent-care and dermatology-care across es.js, es-tools.js, and es-workspace.js', () => {
    const esJs = fs.readFileSync(path.join(rootDir, 'public/js/locales/es.js'), 'utf8');
    const esTools = fs.readFileSync(path.join(rootDir, 'public/js/locales/es-tools.js'), 'utf8');
    const esWork = fs.readFileSync(path.join(rootDir, 'public/js/locales/es-workspace.js'), 'utf8');

    assert.ok(esJs.includes("'route.entCare':"));
    assert.ok(esJs.includes("'route.dermatologyCare':"));
    assert.ok(esTools.includes("'tools.item.ent-care.title':"));
    assert.ok(esTools.includes("'tools.item.dermatology-care.title':"));
    assert.ok(esWork.includes("'workspace.link.entCare':"));
    assert.ok(esWork.includes("'workspace.link.dermatologyCare':"));
  });

  it('enforces zero-storage privacy and zero inline HTML/styles in entCare.js and dermatologyCare.js', () => {
    for (const rel of ['public/js/views/entCare.js', 'public/js/views/dermatologyCare.js']) {
      const src = fs.readFileSync(path.join(rootDir, rel), 'utf8');
      assert.ok(!src.includes('localStorage'));
      assert.ok(!src.includes('sessionStorage'));
      assert.ok(!src.includes('indexedDB'));
      assert.ok(!src.includes('innerHTML'));
      assert.ok(!src.includes('outerHTML'));
    }
  });
});
