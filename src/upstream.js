// Shared resilience for calls to FindTreatment.gov: a hard deadline on every
// request, retries with backoff inside one time budget, a circuit breaker, a
// stale copy when the upstream is down, and one upstream call for identical
// concurrent searches. Cache and in-flight keys are upstream URLs, which only
// hold coarsened coordinates.

const UPSTREAM_MESSAGES = {
  timeout: () => 'FindTreatment.gov did not respond in time',
  network: () => 'FindTreatment.gov could not be reached',
  http: (status) => `FindTreatment.gov responded with HTTP ${Number(status) || 0}`,
  'rate-limited': () => 'FindTreatment.gov is rate limiting requests',
  malformed: () => 'FindTreatment.gov returned a non-JSON or malformed response',
  'too-large': () => 'FindTreatment.gov returned an unexpectedly large response',
  'circuit-open': () => 'FindTreatment.gov is temporarily marked unavailable',
};

/**
 * Any failure talking to FindTreatment.gov. `code` is one of: 'timeout',
 * 'network', 'http', 'rate-limited', 'malformed', 'too-large', 'circuit-open'.
 *
 * Messages are fixed strings plus, at most, an HTTP status number. They never
 * include the upstream URL (which holds coordinates), the response body
 * (which may echo the query), or the underlying fetch error text.
 */
export class UpstreamError extends Error {
  constructor(code, { retryable = false, status = null } = {}) {
    super(UPSTREAM_MESSAGES[code] ? UPSTREAM_MESSAGES[code](status) : 'FindTreatment.gov request failed');
    this.name = 'UpstreamError';
    this.code = code;
    this.retryable = retryable;
    this.status = status;
  }
}

// 25 listings are about 100 KB. Anything far past that is not a listing page.
export const MAX_UPSTREAM_BYTES = 4 * 1024 * 1024;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One upstream request, bounded by a hard deadline. The timer both aborts the
 * fetch and rejects on its own, so even a fetch implementation that ignores
 * its AbortSignal (or a body that never finishes) cannot hang the request.
 * Network failures and 5xx responses are retryable.
 */
export async function fetchUpstreamJson(url, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new UpstreamError('timeout'));
      controller.abort();
    }, timeoutMs);
  });
  const attempt = (async () => {
    let res;
    try {
      res = await fetchImpl(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'HarborPath/1.0' },
        signal: controller.signal,
      });
    } catch (err) {
      const timedOut = controller.signal.aborted || err?.name === 'AbortError' || err?.name === 'TimeoutError';
      throw new UpstreamError(timedOut ? 'timeout' : 'network', { retryable: !timedOut });
    }
    if (!res || typeof res.text !== 'function') throw new UpstreamError('malformed');
    if (res.status === 429) throw new UpstreamError('rate-limited', { status: 429 });
    if (!res.ok) throw new UpstreamError('http', { retryable: res.status >= 500, status: res.status });
    const declared = Number(res.headers?.get?.('content-length'));
    if (Number.isFinite(declared) && declared > MAX_UPSTREAM_BYTES) throw new UpstreamError('too-large');
    let text;
    try {
      text = await res.text();
    } catch {
      const timedOut = controller.signal.aborted;
      throw new UpstreamError(timedOut ? 'timeout' : 'network', { retryable: !timedOut });
    }
    if (text.length > MAX_UPSTREAM_BYTES) throw new UpstreamError('too-large');
    try {
      return JSON.parse(text);
    } catch {
      // The API answers malformed queries with a plain-text message and HTTP 200.
      throw new UpstreamError('malformed');
    }
  })();
  try {
    return await Promise.race([attempt, deadline]);
  } finally {
    clearTimeout(timer);
    attempt.catch(() => {}); // the loser of the race must not become an unhandled rejection
  }
}

/**
 * Retry network errors and 5xx responses with exponential backoff and jitter,
 * all within one overall time budget, so a slow upstream is never waited on
 * longer than timeoutMs in total.
 */
export async function fetchWithRetry(url, { fetchImpl, timeoutMs, retries, backoffMs, sleep = wait }) {
  const deadline = Date.now() + timeoutMs;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchUpstreamJson(url, { fetchImpl, timeoutMs: Math.max(1, deadline - Date.now()) });
    } catch (err) {
      const delay = backoffMs * 2 ** attempt * (0.75 + Math.random() / 2);
      // Only retry when a later attempt still has a fair amount of time left.
      if (!err.retryable || attempt >= retries || Date.now() + delay + 1000 > deadline) throw err;
      await sleep(delay);
    }
  }
}

/**
 * fetchWithRetry() behind an optional circuit breaker (cache.js
 * createCircuitBreaker). While the breaker is open this fails fast with
 * 'circuit-open'. Only outages (timeouts, network errors, 5xx, 429) count
 * toward opening it: a reachable upstream that rejects one query (4xx,
 * malformed, too large) is not an outage.
 */
export async function fetchGuarded(url, { breaker, ...options }) {
  if (breaker && !breaker.allow()) throw new UpstreamError('circuit-open');
  try {
    const body = await fetchWithRetry(url, options);
    breaker?.success();
    return body;
  } catch (err) {
    const reachable = err?.code === 'malformed' || err?.code === 'too-large' || (err?.code === 'http' && err.status < 500);
    if (reachable) breaker?.success();
    else breaker?.failure();
    throw err;
  }
}

/**
 * Answer `key` from a fresh `cache` entry, or join an identical search already
 * in `inflight`, or run `load()`. A successful result is cached; if `load()`
 * fails, a recent (stale) copy is returned with `stale: true` instead. A stale
 * answer is never written back into the cache as fresh.
 */
export function cachedUpstream(key, { cache, inflight, load }) {
  const cached = cache?.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = inflight?.get(key);
  if (pending) return pending;

  const work = (async () => {
    try {
      const result = await load();
      cache?.set(key, result);
      return result;
    } catch (err) {
      const stale = cache?.getStale?.(key);
      if (stale) return { ...stale, stale: true };
      throw err;
    } finally {
      inflight?.delete(key);
    }
  })();
  inflight?.set(key, work);
  return work;
}
