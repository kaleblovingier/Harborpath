// Small in-memory TTL cache with LRU eviction and hit/miss/stale telemetry.
// Keys are upstream URLs built from coarsened coordinates, so entries never
// hold a precise location.
//
// An entry is fresh for ttlMs. For staleMs after that, get() no longer returns
// it but getStale() does, so a search can still be answered while the
// upstream is down. After ttlMs + staleMs the entry is gone: a sweep removes
// it even if nobody asks for it again, so nothing is kept longer than that.
export function createCache({ ttlMs = 60 * 60 * 1000, staleMs = 0, maxEntries = 500, now = Date.now, sweepEveryMs = 60 * 1000 } = {}) {
  const store = new Map();
  let lastSweep = now();
  let hits = 0;
  let misses = 0;
  let staleHits = 0;

  function prune() {
    const t = now();
    lastSweep = t;
    let evicted = 0;
    for (const [key, hit] of store) {
      if (hit.dropAt <= t) {
        store.delete(key);
        evicted++;
      }
    }
    return evicted;
  }

  function maybeSweep() {
    if (sweepEveryMs > 0 && now() - lastSweep >= sweepEveryMs) prune();
  }
  // Also sweep on a timer, so an idle server does not hold old searches.
  // unref() keeps the timer from holding the process open.
  if (sweepEveryMs > 0) setInterval(prune, sweepEveryMs).unref?.();

  function read(key, field) {
    maybeSweep();
    const hit = store.get(key);
    if (!hit) {
      misses++;
      return undefined;
    }
    const t = now();
    if (hit.dropAt <= t) {
      store.delete(key);
      misses++;
      return undefined;
    }
    if (hit[field] <= t) {
      misses++;
      return undefined;
    }
    store.delete(key);
    store.set(key, hit); // refresh LRU position
    if (field === 'dropAt') staleHits++;
    else hits++;
    return hit.value;
  }

  return {
    /** The value if still fresh. */
    get: (key) => read(key, 'expires'),
    /** The value if fresh or within the stale window. */
    getStale: (key) => read(key, 'dropAt'),
    set(key, value) {
      maybeSweep();
      store.delete(key);
      const t = now();
      store.set(key, { value, expires: t + ttlMs, dropAt: t + ttlMs + staleMs });
      while (store.size > maxEntries) store.delete(store.keys().next().value);
    },
    /** Deterministically remove all expired entries past dropAt. */
    prune,
    /** Remove all entries and reset telemetry counters. */
    clear() {
      store.clear();
      hits = 0;
      misses = 0;
      staleHits = 0;
    },
    /** Telemetry snapshot for cache hit/miss/stale ratios and capacity. */
    stats() {
      return {
        hits,
        misses,
        staleHits,
        size: store.size,
        maxEntries,
      };
    },
    get size() {
      return store.size;
    },
  };
}

// Fixed-window request limiter. Keys live only in memory for one window and
// are never written to logs. Past maxKeys distinct clients in one window, new
// clients are hashed into a fixed set of overflow buckets: memory stays
// bounded, and a flood of addresses cannot lock out every new visitor at once
// (one shared bucket could). The hash is salted per process so an attacker
// cannot aim at a particular bucket.
import { randomBytes } from 'node:crypto';

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function createRateLimiter({
  windowMs = 60 * 1000, max = 60, maxKeys = 10_000, overflowBuckets = 1024, now = Date.now,
} = {}) {
  const salt = randomBytes(8).toString('hex');
  let windowStart = now();
  let counts = new Map();
  return {
    allow(rawKey) {
      if (now() - windowStart >= windowMs) {
        windowStart = now();
        counts = new Map();
      }
      const key = counts.has(rawKey) || counts.size < maxKeys
        ? rawKey
        : `\u0000overflow:${fnv1a(salt + rawKey) % overflowBuckets}`;
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      return n <= max;
    },
  };
}
