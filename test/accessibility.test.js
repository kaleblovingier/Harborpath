// Regression checks for findings from the accessibility audit (axe-core +
// keyboard walkthrough). These read the source; the browser walkthrough is
// scripts/e2e-match.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function publicJs() {
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.js')) out.push(full);
    }
  };
  walk(path.join(root, 'public/js'));
  return out;
}

test('setAttribute is never passed null (it would write the string "null")', () => {
  const found = [];
  for (const file of publicJs()) {
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (/setAttribute\([^)]*:\s*null\s*\)/.test(line)) found.push(`${path.basename(file)}:${i + 1}`);
    });
  }
  assert.deepEqual(found, []);
});

test('the danger question is a button, so arrow keys cannot open the emergency panel', () => {
  const match = read('public/js/views/match.js');
  assert.ok(!/legend: t\('match\.s1\.safety'/.test(match), 'must not be a radio group');
  assert.match(match, /h\('button', \{ type: 'button', class: 'btn btn-emergency', onclick: \(\) => \{ emergency = true;/);
});

test('match view re-renders restore focus instead of dropping it to <body>', () => {
  const match = read('public/js/views/match.js');
  assert.match(match, /const hadFocus = root\.contains\(document\.activeElement\);/);
  assert.match(match, /rerender\(adding \? 'm-compare' : boxId\)/);
  assert.match(match, /refilter\('m-f-online'\)/);
});

test('scrollable tables can be reached by keyboard', () => {
  for (const file of ['public/js/views/medications.js', 'public/js/views/match.js']) {
    const src = read(file);
    const wraps = src.match(/h\('div', \{ class: 'table-wrap'[^}]*\}/g) ?? [];
    for (const w of wraps) assert.match(w, /tabindex: '0'/, `${file}: ${w}`);
  }
});

test('selects cannot force horizontal scrolling on small phones', () => {
  const css = read('public/styles.css');
  assert.match(css, /\.select \{[^}]*max-width: 100%/);
  assert.match(css, /\.safety-bar a \{[^}]*min-height: 24px/);
});
