import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runBuildCheck } from '../scripts/build-check.mjs';
import { createCache } from '../src/cache.js';
import {
  SYNC_VIEWS,
  LAZY_LOADERS,
  viewCache,
  preloadRoute,
  preloadAllLazyViews,
  resolveRoute,
} from '../public/js/app.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const appJsPath = path.join(here, '..', 'public', 'js', 'app.js');

describe('Production Build & Static Verification Pipeline (scripts/build-check.mjs)', () => {
  it('succeeds with ok: true, validates all 13 data files, and enforces < 250 KB gzipped app shell budget', async () => {
    const res = await runBuildCheck({ silent: true });
    assert.equal(res.ok, true, `Build check failed: ${JSON.stringify(res.checks.filter((c) => !c.ok))}`);
    assert.equal(res.dataFilesCount, 13);
    assert.ok(res.assetCount >= 28, `Expected >= 28 app shell assets, got ${res.assetCount}`);
    assert.ok(res.totalBytes > 100_000, 'Expected raw bundle size > 100 KB');
    assert.ok(res.totalGzipBytes > 20_000, 'Expected gzipped bundle size > 20 KB');
    assert.ok(
      res.totalGzipBytes < 250 * 1024,
      `Expected app shell gzipped weight < 250 KB, got ${(res.totalGzipBytes / 1024).toFixed(1)} KB`,
    );

    const checkNames = new Set(res.checks.map((c) => c.name));
    for (const required of [
      'data:meta.json',
      'data:service-codes.json',
      'data:zcta.json',
      'data:places.json',
      'data:health-centers.json',
      'data:va-facilities.json',
      'data:ihs-facilities.json',
      'data:er-hospitals.json',
      'data:rural-health-clinics.json',
      'app-shell:assets',
      'modules:syntax-and-imports',
      'security:no-innerHTML',
      'security:no-inline-style',
      'security:vercel-headers',
    ]) {
      assert.ok(checkNames.has(required), `Expected build check "${required}" to be executed`);
    }
  });
});

describe('In-Memory TTL/LRU Cache Telemetry & Deterministic Pruning (src/cache.js)', () => {
  it('tracks hits, misses, and staleHits accurately across lifecycle transitions', () => {
    let now = 1000;
    const cache = createCache({ ttlMs: 100, staleMs: 100, maxEntries: 10, now: () => now, sweepEveryMs: 0 });

    assert.deepEqual(cache.stats(), {
      hits: 0,
      misses: 0,
      staleHits: 0,
      size: 0,
      maxEntries: 10,
    });

    // Miss on empty cache
    assert.equal(cache.get('k1'), undefined);
    assert.equal(cache.stats().misses, 1);

    // Fresh hit
    cache.set('k1', { ok: true });
    assert.deepEqual(cache.get('k1'), { ok: true });
    assert.equal(cache.stats().hits, 1);
    assert.equal(cache.stats().misses, 1);

    // Advance into stale window (1000 + 150 = 1150): get() misses, getStale() records staleHit
    now = 1150;
    assert.equal(cache.get('k1'), undefined);
    assert.equal(cache.stats().misses, 2);
    assert.deepEqual(cache.getStale('k1'), { ok: true });
    assert.equal(cache.stats().staleHits, 1);

    // Advance past dropAt (1000 + 250 = 1250): both get() and getStale() miss and delete entry
    now = 1250;
    assert.equal(cache.getStale('k1'), undefined);
    assert.equal(cache.stats().misses, 3);
    assert.equal(cache.size, 0);

    // clear() resets entries and counters
    cache.set('k2', 'val');
    cache.clear();
    assert.deepEqual(cache.stats(), {
      hits: 0,
      misses: 0,
      staleHits: 0,
      size: 0,
      maxEntries: 10,
    });
  });

  it('evicts least-recently-used entries when maxEntries is exceeded and prunes expired entries deterministically', () => {
    let now = 5000;
    const cache = createCache({ ttlMs: 50, staleMs: 50, maxEntries: 3, now: () => now, sweepEveryMs: 0 });

    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    assert.equal(cache.size, 3);

    // Touch 'a' so 'b' becomes the oldest LRU entry
    assert.equal(cache.get('a'), 1);

    // Adding 'd' should evict 'b'
    cache.set('d', 4);
    assert.equal(cache.size, 3);
    assert.equal(cache.get('b'), undefined);
    assert.equal(cache.get('a'), 1);
    assert.equal(cache.get('c'), 3);
    assert.equal(cache.get('d'), 4);

    // Advance past dropAt (5000 + 50 + 50 = 5100) for a, c, d and run prune()
    now = 5150;
    const evicted = cache.prune();
    assert.equal(evicted, 3);
    assert.equal(cache.size, 0);

    cache.set('e', 5);
    assert.equal(cache.prune(), 0);
    assert.equal(cache.get('e'), 5);
  });
});

describe('Route-Level Lazy Loading & Idle Preloading (public/js/app.js)', () => {
  it('uses dynamic import() for clinical & guide views while keeping core.js synchronous', () => {
    const src = readFileSync(appJsPath, 'utf8');

    // Verify no static top-level imports of heavy views
    assert.doesNotMatch(src, /^import\s+.*from\s+['"]\.\/views\/(navigator|medications|plan|guides)\.js['"]/m);

    // Verify dynamic import() expressions exist for all 4 heavy view modules
    assert.match(src, /import\(\s*['"]\.\/views\/navigator\.js['"]\s*\)/);
    assert.match(src, /import\(\s*['"]\.\/views\/medications\.js['"]\s*\)/);
    assert.match(src, /import\(\s*['"]\.\/views\/plan\.js['"]\s*\)/);
    assert.match(src, /import\(\s*['"]\.\/views\/guides\.js['"]\s*\)/);

    // Core routes are synchronously available
    for (const coreRoute of ['', 'treatment', 'health', 'states', 'saved', 'crisis', 'privacy']) {
      assert.equal(typeof SYNC_VIEWS[coreRoute], 'function', `Expected SYNC_VIEWS['${coreRoute}'] to be synchronous`);
      const resolved = resolveRoute(coreRoute, new URLSearchParams());
      assert.equal(typeof resolved.view, 'function');
      assert.equal(resolved.lazyPath, null);
    }
  });

  it('dynamically preloads and caches lazy views in viewCache on demand and via preloadAllLazyViews()', async () => {
    viewCache.clear();

    // Before preload, lazy route resolves with lazyPath and view: null
    const beforeNav = resolveRoute('navigator', new URLSearchParams());
    assert.equal(beforeNav.view, null);
    assert.equal(beforeNav.lazyPath, 'navigator');

    // Preload single route
    const navFn = await preloadRoute('navigator');
    assert.equal(typeof navFn, 'function');
    assert.equal(viewCache.get('navigator'), navFn);

    // After preload, resolveRoute returns synchronous cached builder
    const afterNav = resolveRoute('navigator', new URLSearchParams());
    assert.equal(typeof afterNav.view, 'function');
    assert.equal(afterNav.lazyPath, null);

    // Preload all remaining lazy views
    await preloadAllLazyViews();
    for (const lazyKey of Object.keys(LAZY_LOADERS)) {
      assert.equal(typeof viewCache.get(lazyKey), 'function', `Expected '${lazyKey}' to be cached in viewCache`);
    }
  });
});
