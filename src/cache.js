// Small in-memory TTL cache with LRU eviction. Keys are upstream URLs built
// from coarsened coordinates, so entries never hold a precise location.
//
// An entry is fresh for ttlMs. For staleMs after that, get() no longer returns
// it but getStale() does, so a search can still be answered while the
// upstream is down. After ttlMs + staleMs the entry is gone: a sweep removes
// it even if nobody asks for it again, so nothing is kept longer than that.
export function createCache({ ttlMs = 60 * 60 * 1000, staleMs = 0, maxEntries = 500, now = Date.now, sweepEveryMs = 60 * 1000 } = {}) {
  const store = new Map();
  let lastSweep = now();

  function sweep() {
    const t = now();
    lastSweep = t;
    for (const [key, hit] of store) if (hit.dropAt <= t) store.delete(key);
  }
  function maybeSweep() {
    if (now() - lastSweep >= sweepEveryMs) sweep();
  }
  // Also sweep on a timer, so an idle server does not hold old searches.
  // unref() keeps the timer from holding the process open.
  if (sweepEveryMs > 0) setInterval(sweep, sweepEveryMs).unref?.();

  function read(key, field) {
    maybeSweep();
    const hit = store.get(key);
    if (!hit) return undefined;
    const t = now();
    if (hit.dropAt <= t) {
      store.delete(key);
      return undefined;
    }
    if (hit[field] <= t) return undefined;
    store.delete(key);
    store.set(key, hit); // refresh LRU position
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
    get size() {
      return store.size;
    },
  };
}

// Fixed-window request limiter. Keys live only in memory for one window and
// are never written to logs.
//
// At most maxKeys distinct clients are tracked per window. Past that, new
// clients share one bucket, so a flood of distinct addresses cannot grow
// memory without bound (and cannot reset anyone else's count either).
export function createRateLimiter({ windowMs = 60 * 1000, max = 60, maxKeys = 50_000, now = Date.now } = {}) {
  let windowStart = now();
  let counts = new Map();
  const OVERFLOW = '\u0000overflow';
  return {
    allow(key) {
      if (now() - windowStart >= windowMs) {
        windowStart = now();
        counts = new Map();
      }
      const k = counts.has(key) || counts.size < maxKeys ? key : OVERFLOW;
      const n = (counts.get(k) ?? 0) + 1;
      counts.set(k, n);
      return n <= max;
    },
    /** Whole seconds until the current window ends (for Retry-After). */
    retryAfterSeconds() {
      return Math.max(1, Math.ceil((windowStart + windowMs - now()) / 1000));
    },
    get size() {
      return counts.size;
    },
  };
}

// Circuit breaker for the upstream API. After `threshold` consecutive
// failures it opens for `cooldownMs`: requests then fail fast (and are served
// from the stale cache when possible) instead of each waiting out the full
// upstream timeout. After the cooldown one probe request is let through; its
// success closes the breaker, its failure reopens it.
export function createCircuitBreaker({ threshold = 3, cooldownMs = 30 * 1000, now = Date.now } = {}) {
  let failures = 0;
  let openUntil = 0;
  let probing = false;
  return {
    /** True when a request may go upstream. */
    allow() {
      if (failures < threshold) return true;
      if (now() < openUntil || probing) return false;
      probing = true; // half-open: exactly one probe
      return true;
    },
    success() {
      failures = 0;
      openUntil = 0;
      probing = false;
    },
    failure() {
      failures++;
      probing = false;
      if (failures >= threshold) openUntil = now() + cooldownMs;
    },
    /** Whole seconds until a probe will be allowed (0 when closed). */
    retryAfterSeconds() {
      return failures >= threshold ? Math.max(1, Math.ceil((openUntil - now()) / 1000)) : 0;
    },
    get open() {
      return failures >= threshold && (now() < openUntil || probing);
    },
  };
}
