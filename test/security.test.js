// Regression tests for findings in docs/SECURITY_REVIEW.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../src/cache.js';
import { clientKey } from '../src/app.js';

const req = (xff, remote = '10.0.0.1') => ({ headers: xff ? { 'x-forwarded-for': xff } : {}, socket: { remoteAddress: remote } });

test('H-1: a spoofed X-Forwarded-For cannot change the rate-limit key', () => {
  // A client prepends fake addresses; the proxy appends the address it saw.
  assert.equal(clientKey(req('1.1.1.1, 203.0.113.9'), true), '203.0.113.9');
  assert.equal(clientKey(req('9.9.9.9, 8.8.8.8, 203.0.113.9'), true), '203.0.113.9');
  assert.equal(clientKey(req('203.0.113.9'), true), '203.0.113.9');
  // Without TRUST_PROXY the header is ignored entirely.
  assert.equal(clientKey(req('1.1.1.1'), false), '10.0.0.1');
});

test('H-1: rotating fake addresses still hits the limit', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
  const results = [];
  for (let i = 0; i < 6; i++) results.push(limiter.allow(clientKey(req(`${i}.0.0.1, 203.0.113.9`), true)));
  assert.deepEqual(results, [true, true, true, false, false, false]);
});

test('L-9: the limiter caps distinct keys per window', () => {
  let now = 0;
  const limiter = createRateLimiter({ windowMs: 1000, max: 2, maxKeys: 3, now: () => now });
  assert.ok(limiter.allow('a') && limiter.allow('b') && limiter.allow('c'));
  // New clients past the cap share one overflow bucket.
  assert.equal(limiter.allow('d'), true);
  assert.equal(limiter.allow('e'), true);
  assert.equal(limiter.allow('f'), false);
  // Known clients keep their own counts.
  assert.equal(limiter.allow('a'), true);
  now = 1000;
  assert.equal(limiter.allow('f'), true, 'a new window resets everything');
});
