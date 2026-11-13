import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../public/${path}`, import.meta.url), 'utf8');
const css = read('styles.css');
const light = css.match(/:root\s*\{([^}]+)\}/)?.[1];
const dark = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]+)\}/)?.[1];
const color = (theme, key) => {
  const match = theme?.match(new RegExp(`--${key}:\\s*#([0-9a-f]{6});`, 'i'));
  assert.ok(match, `Missing color token: --${key}`);
  return match[1];
};

function luminance(hex) {
  const rgb = hex.match(/../g).map(pair => {
    const c = Number.parseInt(pair, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

for (const [name, theme] of [['light', light], ['dark', dark]]) {
  test(`Design system: ${name} theme keeps core text and controls legible`, () => {
    const pairs = [
      ['text', 'bg', 4.5], ['muted', 'bg', 4.5], ['text', 'surface', 4.5],
      ['muted', 'surface', 4.5], ['muted', 'surface-2', 4.5], ['accent', 'bg', 4.5],
      ['on-brand', 'brand', 4.5], ['on-brand', 'brand-strong', 4.5],
      ['on-danger', 'danger', 4.5], ['border-strong', 'surface', 3],
      ['focus', 'bg', 3], ['focus', 'surface', 3],
    ];
    for (const [foreground, background, minimum] of pairs) {
      const levels = [foreground, background].map(key => luminance(color(theme, key)));
      const ratio = (Math.max(...levels) + 0.05) / (Math.min(...levels) + 0.05);
      assert.ok(ratio >= minimum, `--${foreground} on --${background}: ${ratio.toFixed(2)} < ${minimum}`);
    }
  });
}

test('Design system: sensory mode keeps its dedicated contrast palette', () => {
  const sensory = css.match(/:root\.sensory-mode-active\s*\{([^}]+)\}/)?.[1];
  assert.equal(color(sensory, 'bg'), '0f172a');
  assert.equal(color(sensory, 'surface'), '1e293b');
  assert.equal(color(sensory, 'focus'), 'facc15');
});

test('Design system: primary controls keep their touch targets and focus ring', () => {
  assert.match(css, /\.btn\s*\{[^}]*min-height:\s*44px;/);
  assert.match(css, /\.tab\s*\{[^}]*min-height:\s*44px;/);
  assert.match(css, /\.input,\s*\.select\s*\{[^}]*min-height:\s*48px;/);
  assert.match(css, /\.quick-exit\s*\{[^}]*min-height:\s*44px;/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px\s+solid\s+var\(--focus(?:,\s*#[\da-f]+)?\);/i);
});

test('Design system: browser chrome and installed app match the page canvas', () => {
  const html = read('index.html');
  for (const [name, theme] of [['light', light], ['dark', dark]]) {
    const meta = html.match(new RegExp(`<meta name="theme-color" content="(#\\w+)" media="\\(prefers-color-scheme: ${name}\\)">`));
    assert.equal(meta?.[1], `#${color(theme, 'bg')}`);
  }
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.theme_color, `#${color(light, 'bg')}`);
  assert.equal(manifest.background_color, `#${color(light, 'bg')}`);
});
