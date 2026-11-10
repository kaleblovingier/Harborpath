// test/wave49-integration.test.js
// Multi-Module Integration & Architectural Verification Suite for Wave 49 (#/orthopedic-care)

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

describe('Wave 49 Platform Integration Suite (Spine, Musculoskeletal & Orthopedic Infections Navigator)', () => {
  it('1. public/js/app.js registers orthopedic-care in LAZY_LOADERS, ROUTE_TITLES, and preloadAllLazyViews()', () => {
    const appSrc = readText('public/js/app.js');
    assert.match(appSrc, /'orthopedic-care':\s*\(\)\s*=>\s*import\('\.\/views\/orthopedicCare\.js'\)/);
    assert.match(appSrc, /routeResets\.set\('orthopedic-care',\s*m\.resetOrthopedicState\)/);
    assert.match(appSrc, /'orthopedic-care':\s*\(\)\s*=>\s*t\('route\.orthopedicCare'/);
    assert.match(appSrc, /preloadRoute\('orthopedic-care'\)/);
  });

  it('2. Primary navigation bar in public/index.html preserves the strict 14-route invariant', () => {
    const indexHtml = readText('public/index.html');
    const navMatch = indexHtml.match(/<nav id="site-nav"[\s\S]*?<\/nav>/);
    assert.ok(navMatch, 'site-nav should exist in public/index.html');
    const links = [...navMatch[0].matchAll(/<a\s+href="#\/[^"]+"/g)];
    assert.equal(links.length, 14, 'Primary site-nav must maintain exactly 14 top-level routes');
  });

  it('3. public/sw.js includes /js/views/orthopedicCare.js in ELECTIVE_SHELL', () => {
    const swSrc = readText('public/sw.js');
    assert.match(swSrc, /'\/js\/views\/orthopedicCare\.js'/);
  });

  it('4. public/js/views/tools.js includes orthopedic-care in TOOL_CATALOG and TOOL_KEYWORDS', () => {
    const toolsSrc = readText('public/js/views/tools.js');
    assert.match(toolsSrc, /\['orthopedic-care',\s*'emergency'/);
    assert.match(toolsSrc, /'orthopedic-care':\s*\[/);
  });

  it('5. Cross-module clinical links connect workspace, woundInfectious, veinCare, chronicPain, and endocarditisCare to #/orthopedic-care', () => {
    assert.match(readText('public/js/views/workspace.js'), /#\/orthopedic-care/);
    assert.match(readText('public/js/views/woundInfectious.js'), /#\/orthopedic-care/);
    assert.match(readText('public/js/views/veinCare.js'), /#\/orthopedic-care/);
    assert.match(readText('public/js/views/chronicPain.js'), /#\/orthopedic-care/);
    assert.match(readText('public/js/views/endocarditisCare.js'), /#\/orthopedic-care/);
  });

  it('6. Spanish localization dictionaries include orthopedic-care translations', () => {
    assert.match(readText('public/js/locales/es.js'), /'route\.orthopedicCare':/);
    assert.match(readText('public/js/locales/es-tools.js'), /'tools\.item\.orthopedic-care\.title':/);
    assert.match(readText('public/js/locales/es-workspace.js'), /'workspace\.link\.orthopedicCare':/);
  });

  it('7. public/styles.css and docs/IMPROVEMENTS.md document Wave 49 (#/orthopedic-care)', () => {
    assert.match(readText('public/styles.css'), /\.orthopedic-care-view\s*\{/);
    assert.match(readText('docs/IMPROVEMENTS.md'), /Wave 49: Spine, Musculoskeletal & Orthopedic Infections Navigator/);
  });
});
