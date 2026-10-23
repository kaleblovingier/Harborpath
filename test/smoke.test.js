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

function appShell() {
  const src = readFileSync(path.join(root, 'public', 'sw.js'), 'utf8');
  const block = src.match(/const\s+APP_SHELL\s*=\s*\[([\s\S]*?)\]/);
  assert.ok(block, 'public/sw.js must declare const APP_SHELL = [ ... ]');
  return [...block[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
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
  const urls = [...new Set(['/index.html', ...appShell()])];
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

test('every module reachable from app.js is precached in APP_SHELL', () => {
  // A module missing from APP_SHELL still works online but breaks offline
  // mode, because the cached copy of its importer cannot load it.
  const shell = new Set(appShell());
  const jsRoot = path.join(root, 'public');
  const imported = new Set(['/js/app.js']);
  const queue = ['/js/app.js'];
  // Walk the browser import graph from the entry point.
  while (queue.length) {
    const url = queue.shift();
    const file = path.join(jsRoot, url);
    if (!existsSync(file)) continue; // missing files are reported by client-modules.test.js
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const next = path.posix.normalize(path.posix.join(path.posix.dirname(url), m[1]));
      if (!imported.has(next)) {
        imported.add(next);
        queue.push(next);
      }
    }
  }
  const uncached = [...imported].filter((u) => !shell.has(u));
  assert.deepEqual(uncached, [], `modules reachable from app.js but missing from APP_SHELL in public/sw.js:\n  ${uncached.join('\n  ')}`);
});
