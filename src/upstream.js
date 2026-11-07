// Shared resilience for calls to FindTreatment.gov: retries with backoff inside
// one time budget, a stale copy when the upstream is down, and one upstream
// call for identical concurrent searches. Cache and in-flight keys are upstream
// URLs, which only hold coarsened coordinates.

export class UpstreamError extends Error {
  constructor(message, { retryable }) {
    super(message);
    this.retryable = retryable;
  }
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** One upstream request. Network failures and 5xx responses are retryable. */
export async function fetchUpstreamJson(url, { fetchImpl, timeoutMs }) {
  let res;
  try {
    res = await fetchImpl(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'HarborPath/1.0' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new UpstreamError(err.message, { retryable: err.name !== 'AbortError' });
  }
  if (!res.ok) {
    throw new UpstreamError(`FindTreatment.gov responded with HTTP ${res.status}`, { retryable: res.status >= 500 });
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // The API answers malformed queries with a plain-text message and HTTP 200.
    throw new UpstreamError(`FindTreatment.gov returned a non-JSON response (${text.length} bytes)`, { retryable: false });
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
 * Answer `key` from a fresh `cache` entry, or join an identical search already
 * in `inflight`, or run `load()`. A successful result is cached; if `load()`
 * fails, a recent (stale) copy is returned with `stale: true` instead.
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
