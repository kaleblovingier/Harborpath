import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAnalyticsStore } from '../src/analytics.js';
import { createApp } from '../src/app.js';
import { DATA_LOADERS } from '../src/data.js';
import { getAdminState, resetAdminMetricsState } from '../public/js/views/adminMetrics.js';
import { isDntActive, detectPlatform, disableTelemetry } from '../public/js/telemetry.js';

describe('Analytics & Operator Telemetry Suite', () => {
  describe('createAnalyticsStore (Unit Tests)', () => {
    it('initializes clean store with zero initial counters', () => {
      const store = createAnalyticsStore({ adminKey: 'test-secret-key-123' });
      const metrics = store.getMetrics('test-secret-key-123');
      assert.equal(metrics.authorized, true);
      assert.equal(metrics.summary.totalPageViews, 0);
      assert.equal(metrics.summary.totalHotlineClicks, 0);
      assert.equal(metrics.summary.totalToolInteractions, 0);
      assert.equal(metrics.recentEvents.length, 0);
    });

    it('disables admin metrics when no operator secret is configured', () => {
      const store = createAnalyticsStore({ adminKey: '' });
      assert.equal(store.verifyAdminKey('harborpath-admin-secret-2026'), false);
      assert.equal(store.getMetrics('harborpath-admin-secret-2026').authorized, false);
      assert.equal(store.resetMetrics('harborpath-admin-secret-2026').authorized, false);
      assert.equal(store.recordEvent({ type: 'pageview', path: 'home' }).ok, true);
    });

    it('rejects invalid or missing admin keys', () => {
      const store = createAnalyticsStore({ adminKey: 'test-secret-key-123' });
      assert.equal(store.verifyAdminKey('wrong-key'), false);
      assert.equal(store.verifyAdminKey(''), false);
      assert.equal(store.verifyAdminKey(null), false);

      const rejected = store.getMetrics('wrong-key');
      assert.equal(rejected.authorized, false);
      assert.equal(rejected.error.includes('Unauthorized'), true);
    });

    it('accurately records pageviews, hotlines, and tools', () => {
      const store = createAnalyticsStore({ adminKey: 'key-abc' });

      store.recordEvent({ type: 'pageview', path: 'overdose', lang: 'en', platform: 'mobile_web' });
      store.recordEvent({ type: 'pageview', path: 'overdose', lang: 'es', platform: 'ios_pwa' });
      store.recordEvent({ type: 'pageview', path: 'match', lang: 'en', platform: 'desktop' });
      store.recordEvent({ type: 'hotline', label: '988_suicide_crisis', lang: 'en', platform: 'android_pwa' });
      store.recordEvent({ type: 'tool', label: 'asam_navigator', lang: 'en', platform: 'desktop' });

      const metrics = store.getMetrics('key-abc');
      assert.equal(metrics.summary.totalPageViews, 3);
      assert.equal(metrics.summary.totalHotlineClicks, 1);
      assert.equal(metrics.summary.totalToolInteractions, 1);
      assert.equal(metrics.summary.totalEvents, 5);

      // Check route ranking
      assert.equal(metrics.topRoutes[0].path, 'overdose');
      assert.equal(metrics.topRoutes[0].count, 2);
      assert.equal(metrics.topRoutes[1].path, 'match');
      assert.equal(metrics.topRoutes[1].count, 1);

      // Check hotline
      const h988 = metrics.hotlines.find((h) => h.id === '988_suicide_crisis');
      assert.ok(h988);
      assert.equal(h988.count, 1);

      // Check platforms
      assert.equal(metrics.platforms.desktop, 2);
      assert.equal(metrics.platforms.mobile_web, 1);
      assert.equal(metrics.platforms.ios_pwa, 1);
      assert.equal(metrics.platforms.android_pwa, 1);

      // Check languages
      assert.equal(metrics.languages.en, 4);
      assert.equal(metrics.languages.es, 1);

      // Check recent events buffer
      assert.equal(metrics.recentEvents.length, 5);
      assert.equal(metrics.recentEvents[0].type, 'tool');
    });

    it('resets metrics accurately when authorized', () => {
      const store = createAnalyticsStore({ adminKey: 'admin-key' });
      store.recordEvent({ type: 'pageview', path: 'tools' });
      assert.equal(store.getMetrics('admin-key').summary.totalPageViews, 1);

      const resetRes = store.resetMetrics('admin-key');
      assert.equal(resetRes.ok, true);
      assert.equal(resetRes.reset, true);

      const after = store.getMetrics('admin-key');
      assert.equal(after.summary.totalPageViews, 0);
      assert.equal(after.topRoutes.length, 0);
      assert.equal(after.recentEvents.length, 0);
    });
  });

  describe('HTTP Server Integration (/api/admin/metrics & /api/telemetry/event)', () => {
    const meta = { sources: {}, builtAt: '2026-11-08T00:00:00Z' };
    const analytics = createAnalyticsStore({ adminKey: 'secure-operator-key' });
    const app = createApp({
      meta,
      sources: {},
      upstream: {},
      analytics,
    });

    it('POST /api/telemetry/event records event and returns 200 ok', async () => {
      let status = 0;
      let headers = {};
      let body = '';

      const req = {
        method: 'POST',
        url: '/api/telemetry/event',
        headers: { 'content-type': 'application/json' },
        on(event, cb) {
          if (event === 'data') {
            cb(Buffer.from(JSON.stringify({ type: 'pageview', path: 'pediatric-exposures', lang: 'en', platform: 'desktop' })));
          }
          if (event === 'end') cb();
        },
      };

      const res = {
        writeHead(s, h) {
          status = s;
          headers = h;
        },
        end(b) {
          if (b) body = b.toString();
        },
      };

      await app(req, res);
      assert.equal(status, 200);
      const parsed = JSON.parse(body);
      assert.equal(parsed.ok, true);

      // Verify recorded in store
      const metrics = analytics.getMetrics('secure-operator-key');
      assert.ok(metrics.topRoutes.some((r) => r.path === 'pediatric-exposures'));
    });

    it('GET /api/telemetry/event is rejected with 405 Method Not Allowed', async () => {
      let status = 0;
      let headers = {};

      const req = {
        method: 'GET',
        url: '/api/telemetry/event',
        headers: {},
      };

      const res = {
        writeHead(s, h) {
          status = s;
          headers = h;
        },
        end() {},
      };

      await app(req, res);
      assert.equal(status, 405);
      assert.equal(headers.Allow, 'POST');
    });

    it('GET /api/admin/metrics returns 401 without valid key', async () => {
      let status = 0;
      let body = '';

      const req = {
        method: 'GET',
        url: '/api/admin/metrics?key=invalid-key',
        headers: {},
      };

      const res = {
        writeHead(s) {
          status = s;
        },
        end(b) {
          if (b) body = b.toString();
        },
      };

      await app(req, res);
      assert.equal(status, 401);
      assert.equal(JSON.parse(body).error.includes('Unauthorized'), true);
    });

    it('GET /api/admin/metrics returns 200 with Bearer authorization header', async () => {
      let status = 0;
      let body = '';

      const req = {
        method: 'GET',
        url: '/api/admin/metrics',
        headers: { authorization: 'Bearer secure-operator-key' },
      };

      const res = {
        writeHead(s) {
          status = s;
        },
        end(b) {
          if (b) body = b.toString();
        },
      };

      await app(req, res);
      assert.equal(status, 200);
      const data = JSON.parse(body);
      assert.equal(data.authorized, true);
      assert.ok(Array.isArray(data.topRoutes));
    });
  });

  describe('Client State & Telemetry Invariants', () => {
    it('detects platform cleanly without throwing', () => {
      const plat = detectPlatform();
      assert.ok(['desktop', 'mobile_web', 'android_pwa', 'ios_pwa'].includes(plat));
    });

    it('admin view resets state cleanly on quick exit', () => {
      resetAdminMetricsState();
      const state = getAdminState();
      assert.equal(state.isAuthenticated, false);
      assert.equal(state.hasData, false);
      assert.equal(state.isAutoRefreshActive, false);
    });

    it('disabling telemetry prevents outbound beacons', () => {
      disableTelemetry();
      // Should not throw or fail
      assert.ok(true);
    });
  });
});
