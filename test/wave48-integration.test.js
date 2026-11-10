// test/wave48-integration.test.js
// Multi-Module Integration & Architectural Verification Suite for Wave 48 (#/hematology-care)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
}

describe('Wave 48 Platform Integration Suite (Hematology, Coagulopathy & Toxic Hemolysis Navigator)', () => {
  it('1. public/js/app.js registers hematology-care in LAZY_LOADERS, ROUTE_TITLES, and preloadAllLazyViews()', () => {
    const appSrc = readText('public/js/app.js');
    assert.match(appSrc, /'hematology-care':\s*\(\)\s*=>\s*import\('\.\/views\/hematologyCare\.js'\)/);
    assert.match(appSrc, /routeResets\.set\('hematology-care',\s*m\.resetHematologyState\)/);
    assert.match(appSrc, /'hematology-care':\s*\(\)\s*=>\s*t\('route\.hematologyCare'/);
    assert.match(appSrc, /preloadRoute\('hematology-care'\)/);
  });

  it('2. Primary navigation bar in public/index.html preserves the strict 14-route invariant', () => {
    const indexHtml = readText('public/index.html');
    const navMatch = indexHtml.match(/<nav id="site-nav"[\s\S]*?<\/nav>/);
    assert.ok(navMatch, 'site-nav should exist in public/index.html');
    const links = [...navMatch[0].matchAll(/<a\s+href="#\/[^"]+"/g)];
    assert.equal(links.length, 14, 'Primary site-nav must maintain exactly 14 top-level routes');
  });

  it('3. public/sw.js includes /js/views/hematologyCare.js in ELECTIVE_SHELL', () => {
    const swSrc = readText('public/sw.js');
    assert.match(swSrc, /'\/js\/views\/hematologyCare\.js'/);
  });

  it('4. public/js/views/tools.js includes hematology-care in TOOL_CATALOG and TOOL_KEYWORDS', () => {
    const toolsSrc = readText('public/js/views/tools.js');
    assert.match(toolsSrc, /\['hematology-care',\s*'emergency'/);
    assert.match(toolsSrc, /'hematology-care':\s*\[/);
  });

  it('5. Cross-module clinical links connect workspace, liverCare, inhalantCare, stimulantCare, and adulterantCare to #/hematology-care', () => {
    assert.match(readText('public/js/views/workspace.js'), /#\/hematology-care/);
    assert.match(readText('public/js/views/liverCare.js'), /#\/hematology-care/);
    assert.match(readText('public/js/views/inhalantCare.js'), /#\/hematology-care/);
    assert.match(readText('public/js/views/stimulantCare.js'), /#\/hematology-care/);
    assert.match(readText('public/js/views/adulterantCare.js'), /#\/hematology-care/);
  });

  it('6. Spanish localization dictionaries include hematology-care translations', () => {
    assert.match(readText('public/js/locales/es.js'), /'route\.hematologyCare':/);
    assert.match(readText('public/js/locales/es-tools.js'), /'tools\.item\.hematology-care\.title':/);
    assert.match(readText('public/js/locales/es-workspace.js'), /'workspace\.link\.hematologyCare':/);
  });

  it('7. public/styles.css and docs/IMPROVEMENTS.md document Wave 48 (#/hematology-care)', () => {
    assert.match(readText('public/styles.css'), /\.hematology-care-view\s*\{/);
    assert.match(readText('docs/IMPROVEMENTS.md'), /Wave 48: Hematology, Coagulopathy, Levamisole Vasculitis & Toxic Hemolysis Navigator/);
  });
});
