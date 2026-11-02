// Boots the real app handler and fetches every file the offline service
// worker precaches (APP_SHELL in public/sw.js) plus index.html. If any of them
// is missing, the server falls back to index.html with a 404, and
// `cache.addAll()` in the service worker would reject, so a missing shell file
// breaks offline mode as well as the page itself.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function shellList(name, required = true) {
  const src = readFileSync(path.join(root, 'public', 'sw.js'), 'utf8');
  const block = src.match(new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
  if (required) assert.ok(block, `public/sw.js must declare const ${name} = [ ... ]`);
  return block ? [...block[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]) : [];
}
// Critical tier: precached at install.
const appShell = () => shellList('APP_SHELL');
// Elective tier: warmed in the background after activation.
const electiveShell = () => shellList('ELECTIVE_SHELL', false);

// Walk the browser import graph. `dynamic` controls whether import() edges count.
function importGraph(entries, { dynamic = true } = {}) {
  const jsRoot = path.join(root, 'public');
  const seen = new Set(entries);
  const queue = [...entries];
  const re = dynamic
    ? /(?:\bfrom\s*|\bimport\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g
    : /\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]/g;
  while (queue.length) {
    const url = queue.shift();
    const file = path.join(jsRoot, url);
    if (!existsSync(file)) continue; // missing files are reported by client-modules.test.js
    for (const m of readFileSync(file, 'utf8').matchAll(re)) {
      const next = path.posix.normalize(path.posix.join(path.posix.dirname(url), m[1]));
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

let server;
let base;
before(async () => {
  const handler = createApp({
    // Static files only; any upstream call would be a bug in this test.
    fetchImpl: async () => { throw new Error('no network in smoke test'); },
    rateLimit: { windowMs: 60_000, max: 1000 },
    logger: { error() {} },
  });
  server = createServer(handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((r) => server.close(r)));

test('APP_SHELL lists the core files', () => {
  const shell = appShell();
  assert.ok(shell.length >= 10, `APP_SHELL looks truncated (${shell.length} entries)`);
  for (const must of ['/', '/index.html', '/js/app.js', '/styles.css']) {
    assert.ok(shell.includes(must), `APP_SHELL should include ${must}`);
  }
});

test('every APP_SHELL file and index.html is served with 200 and a real body', async () => {
  const urls = [...new Set(['/index.html', ...appShell(), ...electiveShell()])];
  const failures = [];
  for (const url of urls) {
    const res = await fetch(`${base}${url}`);
    const body = await res.text();
    if (res.status !== 200) {
      failures.push(`${url}: HTTP ${res.status}`);
      continue;
    }
    if (body.trim().length < 50) failures.push(`${url}: body only ${body.length} bytes`);
    if (/^\s*\$\(/.test(body)) failures.push(`${url}: body is an unexpanded shell substitution`);
    if (url.endsWith('.js')) {
      const type = res.headers.get('content-type') || '';
      if (!/javascript/.test(type)) failures.push(`${url}: content-type ${type}, browsers refuse non-JS module MIME types`);
      if (/^\s*<!doctype html/i.test(body)) failures.push(`${url}: served HTML instead of JavaScript`);
    }
  }
  assert.deepEqual(failures, [], `app shell problems:\n  ${failures.join('\n  ')}`);
});

test('every module reachable from app.js is precached in one of the offline tiers', () => {
  // A module missing from both tiers still works online but breaks offline
  // mode, because the cached copy of its importer cannot load it.
  const cached = new Set([...appShell(), ...electiveShell()]);
  const uncached = [...importGraph(['/js/app.js'])].filter((u) => !cached.has(u));
  assert.deepEqual(uncached, [], `modules reachable from app.js but missing from APP_SHELL/ELECTIVE_SHELL in public/sw.js:\n  ${uncached.join('\n  ')}`);
});

test('critical tier is self-contained: static imports of critical modules are also critical', () => {
  // If a critical file statically imported an elective one, an emergency page
  // could fail offline before the background warm-up finished.
  const critical = new Set(appShell());
  const entries = appShell().filter((u) => u.endsWith('.js'));
  const missing = [...importGraph(entries, { dynamic: false })].filter((u) => !critical.has(u));
  assert.deepEqual(missing, [], `critical modules statically import non-critical files:\n  ${missing.join('\n  ')}`);
});

test('emergency content is in the critical tier, never elective-only', () => {
  const critical = new Set(appShell());
  for (const must of [
    '/js/views/guides.js',
    '/js/views/core.js',
    '/js/components/overdose.js',
    '/js/components/overdosePacing.js',
    '/js/content/reversalFormulations.js',
    '/js/content/hotlines.js',
    '/js/components/emergencyDrawer.js',
    '/js/locales/es.js',
  ]) {
    assert.ok(critical.has(must), `${must} must be precached in the critical APP_SHELL tier`);
  }
  const overlap = electiveShell().filter((u) => critical.has(u));
  assert.deepEqual(overlap, [], `files listed in both tiers: ${overlap.join(', ')}`);
});
