// Guards the browser module graph under public/js.
//
// The client app is plain native ES modules with no build step, so a single
// missing file or misspelled named import stops the whole app from loading in
// the browser, while every server-side test still passes. These checks parse
// imports and exports with regexes (no dependencies) and fail fast when the
// graph is broken.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const jsRoot = path.join(root, 'public', 'js');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.m?js$/.test(name)) out.push(full);
  }
  return out;
}

// Remove block and line comments so commented-out imports are ignored.
// Deliberately simple: it does not understand strings, but `//` inside an
// import specifier would be unusual for a relative path.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

function parseBindings(clause) {
  // clause is the text between `import` and `from`.
  const names = [];
  let rest = clause.trim();
  const brace = rest.match(/\{([\s\S]*)\}/);
  if (brace) {
    for (const part of brace[1].split(',')) {
      const item = part.trim();
      if (!item) continue;
      const name = item.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
      names.push(name);
    }
    rest = rest.replace(brace[0], '');
  }
  if (/\*\s+as\s+\w+/.test(rest)) {
    names.push('*');
    rest = rest.replace(/\*\s+as\s+[\w$]+/, '');
  }
  const def = rest.replace(/,/g, ' ').trim();
  if (/^[\w$]+$/.test(def)) names.push('default');
  return names;
}

function parseImports(src) {
  const code = stripComments(src);
  const imports = [];
  // import X, { a, b as c } from './x.js'   /   import * as ns from './x.js'
  for (const m of code.matchAll(/^\s*import\s+([^'"`;]*?)\s+from\s*['"]([^'"]+)['"]/gm)) {
    imports.push({ kind: 'static', specifier: m[2], names: parseBindings(m[1]) });
  }
  // import './side-effect.js'
  for (const m of code.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) {
    imports.push({ kind: 'static', specifier: m[1], names: [] });
  }
  // export { a, b as c } from './x.js'   /   export * from './x.js'
  for (const m of code.matchAll(/^\s*export\s+(\*(?:\s+as\s+[\w$]+)?|\{[^}]*\})\s*from\s*['"]([^'"]+)['"]/gm)) {
    const names = m[1].startsWith('{')
      ? m[1].slice(1, -1).split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
      : [];
    imports.push({ kind: 'reexport', specifier: m[2], names });
  }
  // import('./x.js') with a literal path
  for (const m of code.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    imports.push({ kind: 'dynamic', specifier: m[1], names: [] });
  }
  return imports;
}

function parseExports(src) {
  const code = stripComments(src);
  const names = new Set();
  for (const m of code.matchAll(/^\s*export\s+(?:async\s+)?function\s*\*?\s*([\w$]+)/gm)) names.add(m[1]);
  for (const m of code.matchAll(/^\s*export\s+class\s+([\w$]+)/gm)) names.add(m[1]);
  for (const m of code.matchAll(/^\s*export\s+(?:const|let|var)\s+([\s\S]*?)(?:=|;|$)/gm)) {
    const decl = m[1].trim();
    if (decl.startsWith('{') || decl.startsWith('[')) {
      // export const { a, b: c } = obj;
      for (const part of decl.replace(/^[{[]|[}\]]$/g, '').split(',')) {
        const local = part.split(':').pop().split('=')[0].trim();
        if (local) names.add(local);
      }
    } else {
      names.add(decl.split(/[\s,]/)[0]);
    }
  }
  // export { a, b as c };  (the exported name is the alias when present)
  for (const m of code.matchAll(/^\s*export\s*\{([^}]*)\}/gm)) {
    for (const part of m[1].split(',')) {
      const item = part.trim();
      if (!item) continue;
      const pieces = item.split(/\s+as\s+/);
      names.add((pieces[1] ?? pieces[0]).trim());
    }
  }
  if (/^\s*export\s+default\b/m.test(code)) names.add('default');
  return names;
}

const files = walk(jsRoot);
const rel = (f) => path.relative(root, f);

function resolveRelative(fromFile, specifier) {
  return path.resolve(path.dirname(fromFile), specifier);
}

test('public/js contains client modules to check', () => {
  assert.ok(files.length >= 10, `expected at least 10 modules under public/js, found ${files.length}`);
  assert.ok(files.some((f) => f.endsWith(path.join('public', 'js', 'app.js'))), 'public/js/app.js must exist');
});

test('parser sanity: recognizes the import and export shapes used in public/js', () => {
  const imps = parseImports([
    "import { a, b as c } from './one.js';",
    "import D, { e } from '../two.js';",
    "import * as ns from './three.js';",
    "import './side.js';",
    "export { f } from './four.js';",
    "// import { nope } from './commented.js';",
    "const m = await import('./five.js');",
  ].join('\n'));
  assert.deepEqual(imps.map((i) => i.specifier).sort(), ['../two.js', './five.js', './four.js', './one.js', './side.js', './three.js']);
  assert.deepEqual(imps.find((i) => i.specifier === './one.js').names, ['a', 'b']);
  assert.deepEqual(imps.find((i) => i.specifier === '../two.js').names.sort(), ['default', 'e']);
  assert.deepEqual(imps.find((i) => i.specifier === './three.js').names, ['*']);

  const exps = parseExports([
    'export function f1() {}',
    'export async function f2() {}',
    'export const c1 = 1;',
    'export let l1;',
    'export class K {}',
    'const x = 1, y = 2;',
    'export { x, y as z };',
    'export default f1;',
  ].join('\n'));
  for (const n of ['f1', 'f2', 'c1', 'l1', 'K', 'x', 'z', 'default']) assert.ok(exps.has(n), `missing ${n}`);
  assert.ok(!exps.has('y'), 'renamed export should expose the alias, not the local');
});

test('every relative import in public/js points to a file that exists', () => {
  const missing = [];
  for (const file of files) {
    for (const imp of parseImports(readFileSync(file, 'utf8'))) {
      if (!imp.specifier.startsWith('.')) continue;
      const target = resolveRelative(file, imp.specifier);
      if (!existsSync(target) || !statSync(target).isFile()) {
        missing.push(`${rel(file)} -> ${imp.specifier} (${imp.kind})`);
      }
    }
  }
  assert.deepEqual(missing, [], `broken client imports:\n  ${missing.join('\n  ')}`);
});

test('every client import uses a relative or root path the browser can load', () => {
  // Bare specifiers ("lodash") need an import map or bundler, neither of
  // which HarborPath has, so they would fail in the browser.
  const bare = [];
  for (const file of files) {
    for (const imp of parseImports(readFileSync(file, 'utf8'))) {
      if (!/^(\.\.?\/|\/)/.test(imp.specifier)) bare.push(`${rel(file)} -> ${imp.specifier}`);
      else if (!/\.m?js$/.test(imp.specifier)) bare.push(`${rel(file)} -> ${imp.specifier} (no .js extension)`);
    }
  }
  assert.deepEqual(bare, [], `unresolvable client imports:\n  ${bare.join('\n  ')}`);
});

test('every named import in public/js exists as an export of its target module', () => {
  const exportCache = new Map();
  const exportsOf = (target) => {
    if (!exportCache.has(target)) exportCache.set(target, parseExports(readFileSync(target, 'utf8')));
    return exportCache.get(target);
  };
  const problems = [];
  for (const file of files) {
    for (const imp of parseImports(readFileSync(file, 'utf8'))) {
      if (!imp.specifier.startsWith('.') || imp.names.length === 0) continue;
      const target = resolveRelative(file, imp.specifier);
      if (!existsSync(target)) continue; // reported by the existence test
      const available = exportsOf(target);
      for (const name of imp.names) {
        if (name === '*') continue;
        if (!available.has(name)) {
          problems.push(`${rel(file)} imports "${name}" from ${imp.specifier}, which does not export it`);
        }
      }
    }
  }
  assert.deepEqual(problems, [], `missing exports:\n  ${problems.join('\n  ')}`);
});

test('index.html loads public/js/app.js as the module entry point', () => {
  const html = readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
  const srcs = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.includes('/js/app.js'), `expected <script type="module" src="/js/app.js">, found ${JSON.stringify(srcs)}`);
  for (const src of srcs) {
    assert.ok(existsSync(path.join(root, 'public', src)), `index.html references missing script ${src}`);
  }
});
