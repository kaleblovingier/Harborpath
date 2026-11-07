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
  // Production limits: 120 per minute, 10,000 tracked clients.
  const limiter = createRateLimiter({ windowMs: 60_000, max: 120, maxKeys: 10_000, overflowBuckets: 1024 });
  for (let i = 0; i < 10_000; i++) limiter.allow(`flood-${i}`);
  // 20,000 more fresh addresses spread over 1024 buckets average ~20 each,
  // far below the limit; one shared bucket would have locked everyone out.
  for (let i = 0; i < 20_000; i++) limiter.allow(`flood-extra-${i}`);
  let allowed = 0;
  for (let i = 0; i < 500; i++) if (limiter.allow(`visitor-${i}`)) allowed++;
  assert.equal(allowed, 500);

  const single = createRateLimiter({ windowMs: 60_000, max: 120, maxKeys: 10_000, overflowBuckets: 1 });
  for (let i = 0; i < 10_200; i++) single.allow(`flood-${i}`);
  assert.equal(single.allow('visitor'), false, 'the old single bucket was exhaustible');
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

test('h() only sets navigating/loading attributes to safe URLs', async () => {
  const previous = { document: globalThis.document, Node: globalThis.Node };
  class FakeNode {}
  class FakeElement extends FakeNode {
    constructor(tag) { super(); this.tagName = tag; this.attributes = {}; this.dataset = {}; this.children = []; }
    setAttribute(name, value) { this.attributes[name] = value; }
    addEventListener() {}
    append(child) { this.children.push(child); }
  }
  globalThis.Node = FakeNode;
  globalThis.document = { createElement: (tag) => new FakeElement(tag) };
  try {
    const { h, tel, sms } = await import('../public/js/dom.js');
    const href = (value) => h('a', { href: value }).attributes.href;
    // Kept: web, phone, SMS, email, in-app routes, and same-site paths.
    for (const ok of [
      'https://findtreatment.gov/', 'http://example.org/a?b=1', 'tel:988', 'tel:+18006624357',
      'sms:988?&body=hello', 'mailto:help@example.org', '#/treatment?codes=BU', '#', '#main', '/icons.svg#phone',
    ]) {
      assert.equal(href(ok), ok, `${ok} is kept`);
    }
    assert.equal(href('  https://findtreatment.gov/  '), 'https://findtreatment.gov/', 'surrounding space trimmed');
    // Dropped: script, data, and anything that leaves the site without a scheme.
    for (const bad of [
      'javascript:alert(1)', ' JavaScript:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox', '//evil.example/', '/\\evil.example/', 'file:///etc/passwd', 'blob:https://x/1', 'relative/path', '',
    ]) {
      assert.equal(href(bad), undefined, `${JSON.stringify(bad)} is dropped`);
    }
    assert.equal(h('img', { src: 'javascript:alert(1)', alt: '' }).attributes.src, undefined);
    assert.equal(h('img', { src: '/favicon.svg', alt: '' }).attributes.src, '/favicon.svg');
    assert.equal(h('form', { action: 'javascript:alert(1)' }).attributes.action, undefined);
    assert.equal(h('button', { formaction: 'data:x' }).attributes.formaction, undefined);
    assert.equal(h('a', { HREF: 'javascript:alert(1)' }).attributes.HREF, undefined, 'attribute names are case-insensitive');
    // Other attributes are untouched.
    assert.equal(h('a', { href: '#/x', title: 'javascript: is just text here' }).attributes.title, 'javascript: is just text here');
    // tel() and sms() links still work through h().
    assert.equal(tel('1-800-662-4357').attributes.href, 'tel:18006624357');
    assert.equal(sms('988', 'Hi').attributes.href, 'sms:988?&body=Hi');
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  }
});
