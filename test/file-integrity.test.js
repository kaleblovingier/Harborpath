// Catches files that were written by a broken shell command instead of real
// content, e.g. a file whose entire body is the literal text
// `$(cat /tmp/navigator_updated.js)`. That exact failure once replaced
// public/js/views/navigator.js and took the whole client app down.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const DIRS = ['public', 'src', 'test', 'scripts'];
const TEXT_EXT = /\.(m?js|cjs|json|html|css|svg|webmanifest|md|txt|ya?ml)$/i;

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// Prefer git's list of tracked files; fall back to walking the directories
// when git is unavailable (e.g. a source tarball or container build).
function trackedFiles() {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--', ...DIRS], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const list = out.split('\0').filter(Boolean).map((f) => path.join(root, f));
    if (list.length) return list.filter((f) => existsSync(f));
  } catch {
    // fall through
  }
  return DIRS.flatMap((d) => walk(path.join(root, d)));
}

const files = trackedFiles().filter((f) => TEXT_EXT.test(f));
const rel = (f) => path.relative(root, f).split(path.sep).join('/');

// Patterns that mean a shell substitution or heredoc was written literally.
const UNEXPANDED = [
  /^\s*\$\(\s*(cat|echo|printf|sed|awk|head|tail|curl|base64)\b/,
  /^\s*`\s*(cat|echo|printf)\s/,
  /^\s*\$\{?[A-Z_][A-Z0-9_]*\}?\s*$/, // whole file is just "$VAR" or "${VAR}"
  /^\s*<<-?\s*['"]?EOF['"]?/,
];

test('integrity check found the tracked text files', () => {
  assert.ok(files.length >= 20, `expected at least 20 tracked text files, found ${files.length}`);
});

test('no tracked text file starts with an unexpanded shell substitution', () => {
  const bad = [];
  for (const file of files) {
    const head = readFileSync(file, 'utf8').slice(0, 200);
    if (UNEXPANDED.some((re) => re.test(head))) bad.push(`${rel(file)}: ${JSON.stringify(head.split('\n')[0].slice(0, 80))}`);
  }
  assert.deepEqual(bad, [], `files contain literal shell substitutions instead of content:\n  ${bad.join('\n  ')}`);
});

test('no tracked text file is empty', () => {
  const empty = files.filter((f) => statSync(f).size === 0).map(rel);
  assert.deepEqual(empty, [], `empty files:\n  ${empty.join('\n  ')}`);
});

test('no .js module that other modules import is suspiciously tiny (< 50 bytes)', () => {
  const jsFiles = files.filter((f) => /\.m?js$/.test(f));
  const imported = new Set();
  const importRe = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.{1,2}\/[^'"]+)['"]/g;
  for (const file of jsFiles) {
    for (const m of readFileSync(file, 'utf8').matchAll(importRe)) {
      imported.add(path.resolve(path.dirname(file), m[1]));
    }
  }
  // index.html's entry module counts as imported too.
  const html = path.join(root, 'public', 'index.html');
  if (existsSync(html)) {
    for (const m of readFileSync(html, 'utf8').matchAll(/<script[^>]*src="(\/[^"]+\.js)"/g)) {
      imported.add(path.join(root, 'public', m[1]));
    }
  }
  const tiny = [...imported]
    .filter((f) => existsSync(f) && statSync(f).size < 50)
    .map((f) => `${rel(f)} (${statSync(f).size} bytes)`);
  assert.deepEqual(tiny, [], `imported modules too small to be real code:\n  ${tiny.join('\n  ')}`);
});

test('every .js and .json file under public/ and src/ parses', async () => {
  const problems = [];
  for (const file of files) {
    const r = rel(file);
    if (!/^(public|src)\//.test(r)) continue;
    if (r.endsWith('.json') || r.endsWith('.webmanifest')) {
      try { JSON.parse(readFileSync(file, 'utf8')); } catch (err) { problems.push(`${r}: ${err.message}`); }
    }
  }
  // JS syntax: `node --check` handles ES modules when given the file path
  // inside a "type": "module" package.
  const jsFiles = files.filter((f) => /^(public|src)\/.*\.m?js$/.test(rel(f)));
  for (const file of jsFiles) {
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (err) {
      problems.push(`${rel(file)}: ${String(err.stderr || err.message).split('\n').find((l) => /Error/.test(l)) || 'syntax error'}`);
    }
  }
  assert.deepEqual(problems, [], `files that do not parse:\n  ${problems.join('\n  ')}`);
});
