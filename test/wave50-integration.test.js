// test/wave50-integration.test.js
// Multi-Module Integration & Architectural Verification Suite for Wave 50 (#/ocular-care)

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

describe('Wave 50 Platform Integration Suite (Ophthalmology, Vision Loss & Ocular Toxicology Navigator)', () => {
  it('1. public/js/app.js registers ocular-care in LAZY_LOADERS, ROUTE_TITLES, and preloadAllLazyViews()', () => {
    const appSrc = readText('public/js/app.js');
    assert.match(appSrc, /'ocular-care':\s*\(\)\s*=>\s*import\('\.\/views\/ocularCare\.js'\)/);
    assert.match(appSrc, /routeResets\.set\('ocular-care',\s*m\.resetOcularState\)/);
    assert.match(appSrc, /'ocular-care':\s*\(\)\s*=>\s*t\('route\.ocularCare'/);
    assert.match(appSrc, /preloadRoute\('ocular-care'\)/);
  });

  it('2. Primary navigation bar in public/index.html preserves the strict 14-route invariant', () => {
    const indexHtml = readText('public/index.html');
    const navMatch = indexHtml.match(/<nav id="site-nav"[\s\S]*?<\/nav>/);
    assert.ok(navMatch, 'site-nav should exist in public/index.html');
    const links = [...navMatch[0].matchAll(/<a\s+href="#\/[^"]+"/g)];
    assert.equal(links.length, 14, 'Primary site-nav must maintain exactly 14 top-level routes');
  });

  it('3. public/sw.js includes /js/views/ocularCare.js in ELECTIVE_SHELL', () => {
    const swSrc = readText('public/sw.js');
    assert.match(swSrc, /'\/js\/views\/ocularCare\.js'/);
  });

  it('4. public/js/views/tools.js includes ocular-care in TOOL_CATALOG and TOOL_KEYWORDS', () => {
    const toolsSrc = readText('public/js/views/tools.js');
    assert.match(toolsSrc, /\['ocular-care',\s*'emergency'/);
    assert.match(toolsSrc, /'ocular-care':\s*\[/);
  });

  it('5. Cross-module clinical links connect workspace, alcoholCare, inhalantCare, endocarditisCare, and neurologyCare to #/ocular-care', () => {
    assert.match(readText('public/js/views/workspace.js'), /#\/ocular-care/);
    assert.match(readText('public/js/views/alcoholCare.js'), /#\/ocular-care/);
    assert.match(readText('public/js/views/inhalantCare.js'), /#\/ocular-care/);
    assert.match(readText('public/js/views/endocarditisCare.js'), /#\/ocular-care/);
    assert.match(readText('public/js/views/neurologyCare.js'), /#\/ocular-care/);
  });

  it('6. Spanish localization dictionaries include ocular-care translations', () => {
    assert.match(readText('public/js/locales/es.js'), /'route\.ocularCare':/);
    assert.match(readText('public/js/locales/es-tools.js'), /'tools\.item\.ocular-care\.title':/);
    assert.match(readText('public/js/locales/es-workspace.js'), /'workspace\.link\.ocularCare':/);
  });

  it('7. public/styles.css and docs/IMPROVEMENTS.md document Wave 50 (#/ocular-care)', () => {
    assert.match(readText('public/styles.css'), /\.ocular-care-view\s*\{/);
    assert.match(readText('docs/IMPROVEMENTS.md'), /Wave 50: Ophthalmology, Vision Loss & Ocular Toxicology Navigator/);
  });
});
