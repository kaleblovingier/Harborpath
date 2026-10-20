// Small in-memory TTL cache with LRU eviction. Keys are upstream URLs built
// from coarsened coordinates, so entries never hold a precise location.
export function createCache({ ttlMs = 60 * 60 * 1000, maxEntries = 500, now = Date.now } = {}) {
  const store = new Map();
  return {
    get(key) {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (hit.expires <= now()) {
        store.delete(key);
        return undefined;
      }
      store.delete(key);
      store.set(key, hit); // refresh LRU position
      return hit.value;
    },
    set(key, value) {
      store.delete(key);
      store.set(key, { value, expires: now() + ttlMs });
      while (store.size > maxEntries) store.delete(store.keys().next().value);
    },
    get size() {
      return store.size;
    },
  };
}

// Fixed-window request limiter. Keys live only in memory for one window and
// are never written to logs.
export function createRateLimiter({ windowMs = 60 * 1000, max = 60, now = Date.now } = {}) {
  let windowStart = now();
  let counts = new Map();
  return {
    allow(key) {
      if (now() - windowStart >= windowMs) {
        windowStart = now();
        counts = new Map();
      }
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      return n <= max;
    },
  };
}
