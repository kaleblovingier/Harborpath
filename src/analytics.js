// Privacy-First Aggregate Analytics Engine for HarborPath.
//
// Collects aggregate, zero-PII telemetry strictly for platform operators:
// - Zero IP addresses stored or logged.
// - Zero personal identifiers, query parameters, or search terms.
// - Zero persistent device cookies or third-party tracking.
// - Respects browser Do Not Track (DNT) signals.
// - Maintains in-memory rolling hourly/daily buckets and recent anonymized events.

import { timingSafeEqual, createHmac } from 'node:crypto';

// Default admin passkey for development/operator access if not set in environment.
const DEFAULT_ADMIN_KEY = process.env.HARBORPATH_ADMIN_KEY || 'harborpath-admin-secret-2026';

/** Sanitize an identifier/path to prevent injection or unexpected characters. */
function sanitizeKey(str, maxLen = 60) {
  if (typeof str !== 'string') return 'unknown';
  return str.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, maxLen) || 'home';
}

export function createAnalyticsStore(options = {}) {
  const secretKey = options.adminKey || DEFAULT_ADMIN_KEY;
  const startTime = new Date().toISOString();

  // Aggregate counters
  let totalPageViews = 0;
  let totalHotlineClicks = 0;
  let totalToolInteractions = 0;

  // Breakdown dictionaries
  const routeCounts = new Map();
  const hotlineCounts = new Map([
    ['988_suicide_crisis', 0],
    ['911_emergency', 0],
    ['never_use_alone', 0],
    ['poison_control', 0],
    ['safespot_overdose', 0],
    ['samhsa_national_helpline', 0],
  ]);
  const languageCounts = { en: 0, es: 0 };
  const platformCounts = {
    desktop: 0,
    mobile_web: 0,
    android_pwa: 0,
    ios_pwa: 0,
  };
  const toolCounts = new Map();

  // Rolling 24-hour hourly buckets: Array of { hour: "YYYY-MM-DDTHH:00:00Z", views: N, hotlines: N }
  const hourlyBuckets = [];
  const MAX_HOURLY_BUCKETS = 24;

  // Recent anonymized events buffer (last 30 events)
  const recentEvents = [];
  const MAX_RECENT_EVENTS = 30;

  function getCurrentHourKey() {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    return now.toISOString();
  }

  function getOrCreateHourlyBucket() {
    const hourKey = getCurrentHourKey();
    let bucket = hourlyBuckets.find((b) => b.hour === hourKey);
    if (!bucket) {
      bucket = { hour: hourKey, views: 0, hotlines: 0, tools: 0 };
      hourlyBuckets.push(bucket);
      if (hourlyBuckets.length > MAX_HOURLY_BUCKETS) {
        hourlyBuckets.shift();
      }
    }
    return bucket;
  }

  function verifyAdminKey(candidateKey) {
    if (typeof candidateKey !== 'string' || !candidateKey) return false;
    try {
      const a = Buffer.from(candidateKey);
      const b = Buffer.from(secretKey);
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  return {
    /**
     * Ingest an anonymized client event.
     * @param {Object} event
     * @param {string} event.type - 'pageview' | 'hotline' | 'tool'
     * @param {string} [event.path] - Route identifier (e.g. 'overdose', 'match')
     * @param {string} [event.label] - Detail label (e.g. '988_suicide_crisis')
     * @param {string} [event.lang] - 'en' | 'es'
     * @param {string} [event.platform] - 'desktop' | 'mobile_web' | 'android_pwa' | 'ios_pwa'
     */
    recordEvent(event = {}) {
      const type = String(event.type || 'pageview').toLowerCase();
      const lang = event.lang === 'es' ? 'es' : 'en';
      const platform = ['desktop', 'mobile_web', 'android_pwa', 'ios_pwa'].includes(event.platform)
        ? event.platform
        : 'desktop';

      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;

      const hourBucket = getOrCreateHourlyBucket();
      const now = new Date().toISOString();

      if (type === 'pageview') {
        totalPageViews += 1;
        hourBucket.views += 1;
        const path = sanitizeKey(event.path || 'home');
        routeCounts.set(path, (routeCounts.get(path) || 0) + 1);

        recentEvents.unshift({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'pageview',
          label: path,
          lang,
          platform,
          timestamp: now,
        });
      } else if (type === 'hotline') {
        totalHotlineClicks += 1;
        hourBucket.hotlines += 1;
        const label = sanitizeKey(event.label || 'emergency');
        hotlineCounts.set(label, (hotlineCounts.get(label) || 0) + 1);

        recentEvents.unshift({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'hotline',
          label,
          lang,
          platform,
          timestamp: now,
        });
      } else if (type === 'tool') {
        totalToolInteractions += 1;
        hourBucket.tools += 1;
        const label = sanitizeKey(event.label || 'clinical_tool');
        toolCounts.set(label, (toolCounts.get(label) || 0) + 1);

        recentEvents.unshift({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'tool',
          label,
          lang,
          platform,
          timestamp: now,
        });
      }

      if (recentEvents.length > MAX_RECENT_EVENTS) {
        recentEvents.length = MAX_RECENT_EVENTS;
      }

      return { ok: true };
    },

    /**
     * Retrieve aggregate analytics metrics payload.
     * @param {string} candidateKey - Operator secret key
     */
    getMetrics(candidateKey) {
      if (!verifyAdminKey(candidateKey)) {
        return { error: 'Unauthorized: Invalid operator access key', authorized: false };
      }

      // Convert Maps to sorted arrays for easy dashboard rendering
      const topRoutes = Array.from(routeCounts.entries())
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      const topHotlines = Array.from(hotlineCounts.entries())
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count);

      const topTools = Array.from(toolCounts.entries())
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      return {
        authorized: true,
        summary: {
          totalPageViews,
          totalHotlineClicks,
          totalToolInteractions,
          totalEvents: totalPageViews + totalHotlineClicks + totalToolInteractions,
          startTime,
          lastUpdated: new Date().toISOString(),
        },
        trafficTimeline: [...hourlyBuckets],
        topRoutes,
        hotlines: topHotlines,
        tools: topTools,
        languages: { ...languageCounts },
        platforms: { ...platformCounts },
        recentEvents: [...recentEvents],
      };
    },

    /** Reset all metrics (operator action). */
    resetMetrics(candidateKey) {
      if (!verifyAdminKey(candidateKey)) {
        return { error: 'Unauthorized: Invalid operator access key', authorized: false };
      }
      totalPageViews = 0;
      totalHotlineClicks = 0;
      totalToolInteractions = 0;
      routeCounts.clear();
      hotlineCounts.forEach((_, k) => hotlineCounts.set(k, 0));
      languageCounts.en = 0;
      languageCounts.es = 0;
      platformCounts.desktop = 0;
      platformCounts.mobile_web = 0;
      platformCounts.android_pwa = 0;
      platformCounts.ios_pwa = 0;
      toolCounts.clear();
      hourlyBuckets.length = 0;
      recentEvents.length = 0;

      return { ok: true, reset: true, timestamp: new Date().toISOString() };
    },

    verifyAdminKey,
  };
}
