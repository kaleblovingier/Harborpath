import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

describe('Wave 51 Platform Integration: Urology & Genitourinary Emergencies (#/urology-care)', () => {
  it('registers urology-care in public/js/app.js LAZY_LOADERS, ROUTE_TITLES, and preloadAllLazyViews', () => {
    const appJs = fs.readFileSync(path.join(rootDir, 'public/js/app.js'), 'utf8');
    assert.ok(appJs.includes("'urology-care': () => import('./views/urologyCare.js')"));
    assert.ok(appJs.includes("'urology-care': () => t('route.urologyCare'"));
    assert.ok(appJs.includes("preloadRoute('urology-care')"));
  });

  it('precaches /js/views/urologyCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swJs = fs.readFileSync(path.join(rootDir, 'public/sw.js'), 'utf8');
    assert.ok(swJs.includes("'/js/views/urologyCare.js'"));
  });

  it('registers urology-care in public/js/views/tools.js catalog and search keywords', () => {
    const toolsJs = fs.readFileSync(path.join(rootDir, 'public/js/views/tools.js'), 'utf8');
    assert.ok(toolsJs.includes("['urology-care', 'emergency'"));
    assert.ok(toolsJs.includes("'urology-care': ["));
    assert.ok(toolsJs.includes("'priapism'"));
    assert.ok(toolsJs.includes("'fournier'"));
  });

  it('cross-links #/urology-care in workspace.js, sexualHealth.js, ketamineCare.js, renalCare.js, and woundInfectious.js', () => {
    for (const rel of [
      'public/js/views/workspace.js',
      'public/js/views/sexualHealth.js',
      'public/js/views/ketamineCare.js',
      'public/js/views/renalCare.js',
      'public/js/views/woundInfectious.js'
    ]) {
      const content = fs.readFileSync(path.join(rootDir, rel), 'utf8');
      assert.ok(content.includes('#/urology-care'), `Expected #/urology-care in ${rel}`);
    }
  });

  it('includes Spanish localization for urology-care across es.js, es-tools.js, and es-workspace.js', () => {
    const esJs = fs.readFileSync(path.join(rootDir, 'public/js/locales/es.js'), 'utf8');
    const esTools = fs.readFileSync(path.join(rootDir, 'public/js/locales/es-tools.js'), 'utf8');
    const esWork = fs.readFileSync(path.join(rootDir, 'public/js/locales/es-workspace.js'), 'utf8');

    assert.ok(esJs.includes("'route.urologyCare':"));
    assert.ok(esTools.includes("'tools.item.urology-care.title':"));
    assert.ok(esWork.includes("'workspace.link.urologyCare':"));
  });

  it('enforces zero-storage privacy and zero inline HTML/styles in urologyCare.js', () => {
    const src = fs.readFileSync(path.join(rootDir, 'public/js/views/urologyCare.js'), 'utf8');
    assert.ok(!src.includes('localStorage'));
    assert.ok(!src.includes('sessionStorage'));
    assert.ok(!src.includes('indexedDB'));
    assert.ok(!src.includes('innerHTML'));
    assert.ok(!src.includes('outerHTML'));
  });
});
