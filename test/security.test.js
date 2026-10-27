// Regression tests for findings in docs/SECURITY_REVIEW.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../src/cache.js';
import { clientKey, networkKey } from '../src/app.js';

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
  const limiter = createRateLimiter({ windowMs: 1000, max: 2, maxKeys: 3, overflowBuckets: 1, now: () => now });
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

test('H2-1: a flood of new addresses cannot lock out every new visitor', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, maxKeys: 100, overflowBuckets: 1024 });
  for (let i = 0; i < 100; i++) limiter.allow(`flood-${i}`);
  // The attacker now hammers overflow with many more fresh keys...
  for (let i = 0; i < 2000; i++) limiter.allow(`flood-extra-${i}`);
  // ...yet most genuinely new visitors still land in an unexhausted bucket.
  let allowed = 0;
  for (let i = 0; i < 200; i++) if (limiter.allow(`visitor-${i}`)) allowed++;
  assert.ok(allowed > 100, `only ${allowed}/200 new visitors allowed`);
});

test('H2-2: IPv6 clients are keyed by /64, IPv4-mapped addresses by IPv4', () => {
  const a = clientKey(req(null, '2001:db8:1:2::1'), false);
  const b = clientKey(req(null, '2001:0db8:0001:0002:ffff:eeee:dddd:cccc'), false);
  assert.equal(a, '2001:db8:1:2::/64');
  assert.equal(a, b);
  assert.notEqual(a, clientKey(req(null, '2001:db8:1:3::1'), false));
  assert.equal(clientKey(req(null, '::ffff:203.0.113.9'), false), '203.0.113.9');
  assert.equal(networkKey('fe80::1%eth0'), 'fe80:0:0:0::/64');
  assert.equal(networkKey('::1'), '0:0:0:0::/64');
});

test('H2-3: trusted hop count and empty forwarded entries', () => {
  // CDN -> load balancer: the client is two entries from the right.
  assert.equal(clientKey(req('1.1.1.1, 198.51.100.7, 203.0.113.9'), 2), '198.51.100.7');
  // Empty or short headers fall back to the socket address, never ''.
  assert.equal(clientKey(req('x,'), true), '10.0.0.1');
  assert.equal(clientKey(req(' '), true), '10.0.0.1');
  assert.equal(clientKey(req('203.0.113.9'), 2), '10.0.0.1');
});
