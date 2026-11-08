import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const stylesPath = path.join(rootDir, 'public', 'styles.css');
const htmlPath = path.join(rootDir, 'public', 'index.html');
const manifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');

test('Design System: Clinical Calm & Dignified Access Tokens (:root)', () => {
  const css = fs.readFileSync(stylesPath, 'utf8');

  // 1. Slate / Navy Neutral Foundations
  assert.match(css, /--bg:\s*#f8fafc;/, 'Light mode canvas is calm slate-50');
  assert.match(css, /--surface:\s*#ffffff;/, 'Light mode card surface is pure white');
  assert.match(css, /--surface-2:\s*#f1f5f9;/, 'Light mode secondary surface is slate-100');
  assert.match(css, /--text:\s*#0f172a;/, 'Light mode text is high-contrast slate-900');
  assert.match(css, /--muted:\s*#475569;/, 'Light mode muted text is WCAG AA compliant slate-600');
  assert.match(css, /--border:\s*#cbd5e1;/, 'Light mode border is crisp slate-300');
  assert.match(css, /--border-strong:\s*#64748b;/, 'Form outlines meet 3:1 contrast against surface (WCAG 1.4.11)');

  // 2. Restorative Ocean Teal Brand Accents
  assert.match(css, /--brand:\s*#0d9488;/, 'Primary brand color is grounding restorative ocean teal');
  assert.match(css, /--brand-strong:\s*#0f766e;/, 'Brand strong is deep rich teal');
  assert.match(css, /--brand-soft:\s*#f0fdfa;/, 'Brand soft is tranquil airy teal tint');
  assert.match(css, /--on-brand:\s*#ffffff;/, 'Text on brand meets WCAG AAA contrast');

  // 3. Accessible Status Alert Tokens
  assert.match(css, /--danger:\s*#dc2626;/, 'Danger status meets 4.5:1 contrast');
  assert.match(css, /--warn:\s*#b45309;/, 'Warning status meets 4.5:1 contrast against white');
  assert.match(css, /--ok:\s*#15803d;/, 'Success status meets 4.5:1 contrast');
  assert.match(css, /--info:\s*#0284c7;/, 'Information status meets 4.5:1 contrast');

  // 4. 8pt Spatial Scale Tokens
  assert.match(css, /--space-1:\s*4px;/);
  assert.match(css, /--space-2:\s*8px;/);
  assert.match(css, /--space-3:\s*12px;/);
  assert.match(css, /--space-4:\s*16px;/);
  assert.match(css, /--space-6:\s*24px;/);
  assert.match(css, /--space-8:\s*32px;/);

  // 5. Radius and Layered Elevation Shadows
  assert.match(css, /--radius:\s*12px;/);
  assert.match(css, /--radius-full:\s*9999px;/);
  assert.match(css, /--shadow-xs:\s*0 1px 2px/);
  assert.match(css, /--shadow:\s*0 4px 6px/);
  assert.match(css, /--shadow-md:\s*0 10px 15px/);
});

test('Design System: Dark Mode Midnight Slate Palette', () => {
  const css = fs.readFileSync(stylesPath, 'utf8');
  const darkBlockMatch = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(darkBlockMatch, 'Dark mode block must be present');
  const darkCss = darkBlockMatch[1];

  assert.match(darkCss, /--bg:\s*#090e17;/, 'Dark mode canvas is deep midnight slate');
  assert.match(darkCss, /--surface:\s*#0f172a;/, 'Dark mode surface is slate-900');
  assert.match(darkCss, /--surface-2:\s*#1e293b;/, 'Dark mode secondary surface is slate-800');
  assert.match(darkCss, /--text:\s*#f8fafc;/, 'Dark mode text is slate-50');
  assert.match(darkCss, /--muted:\s*#94a3b8;/, 'Dark mode muted copy is accessible slate-400');
  assert.match(darkCss, /--brand:\s*#2dd4bf;/, 'Dark mode brand is calming luminescent teal');
  assert.match(darkCss, /--brand-strong:\s*#5eead4;/);
});

test('Design System: Sensory Calming Mode Tokens', () => {
  const css = fs.readFileSync(stylesPath, 'utf8');
  assert.match(css, /body\.sensory-mode-active,\s*:root\.sensory-mode-active\s*\{[^}]*--bg:\s*#0f172a;/);
  assert.match(css, /body\.sensory-mode-active,\s*:root\.sensory-mode-active\s*\{[^}]*--surface:\s*#1e293b;/);
  assert.match(css, /body\.sensory-mode-active,\s*:root\.sensory-mode-active\s*\{[^}]*--focus:\s*#facc15;/);
});

test('Design System: Typography and Interaction Ergonomics', () => {
  const css = fs.readFileSync(stylesPath, 'utf8');

  // Text antialiasing and legibility
  assert.match(css, /-webkit-font-smoothing:\s*antialiased;/);
  assert.match(css, /text-rendering:\s*optimizeLegibility;/);
  assert.match(css, /font:\s*400 1rem\/1\.6 var\(--font\);/);

  // Heading scale
  assert.match(css, /h1\s*\{[^}]*font-size:\s*clamp\(1\.85rem/);
  assert.match(css, /h2\s*\{[^}]*font-size:\s*clamp\(1\.35rem/);

  // Button touch target minimums
  assert.match(css, /\.btn\s*\{[^}]*min-height:\s*44px;/);
  assert.match(css, /\.tab\s*\{[^}]*min-height:\s*44px;/);
  assert.match(css, /\.input,\s*\.select\s*\{[^}]*min-height:\s*48px;/);
  assert.match(css, /\.quick-exit\s*\{[^}]*min-height:\s*44px;/);

  // Focus visible ring
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px\s+solid\s+var\(--focus,\s*#0b5cab\);/);
});

test('Design System: Manifest & HTML Meta Parity', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /<meta name="theme-color" content="#0d9488" media="\(prefers-color-scheme: light\)">/);
  assert.match(html, /<meta name="theme-color" content="#090e17" media="\(prefers-color-scheme: dark\)">/);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.theme_color, '#0d9488');
  assert.equal(manifest.background_color, '#f8fafc');
});
