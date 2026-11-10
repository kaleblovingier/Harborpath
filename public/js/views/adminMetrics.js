/**
 * HarborPath Operator Analytics & Metrics Dashboard (public/js/views/adminMetrics.js)
 *
 * Private, zero-PII administrative view accessible exclusively to the platform operator:
 * - Access-controlled via Operator Secret Key (in-RAM session only).
 * - Real-time metrics on aggregate traffic, route impressions, and hotline activations.
 * - Pure DOM construction with zero string injection and zero external analytics/charting CDNs.
 * - Conforms to HarborPath strict CSP ('default-src self').
 */

import { h, clear, announce, icon } from '../dom.js';
import { pageHeader, fine, p, strong } from './common.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Ephemeral in-memory operator state
let currentAdminKey = '';
let metricsData = null;
let autoRefreshTimer = null;
let lastFetchError = '';
let isAutoRefreshActive = false;

onQuickExit(resetAdminMetricsState);

export function resetAdminMetricsState() {
  currentAdminKey = '';
  metricsData = null;
  lastFetchError = '';
  isAutoRefreshActive = false;
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

export function getAdminState() {
  return {
    isAuthenticated: Boolean(currentAdminKey),
    hasData: Boolean(metricsData),
    isAutoRefreshActive,
  };
}

/** Fetch latest metrics from the server using the stored admin key. */
async function fetchMetrics(key) {
  try {
    const res = await fetch(`/api/admin/metrics?key=${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
    });

    if (res.status === 401) {
      lastFetchError = 'Invalid operator access key. Please verify your credentials.';
      currentAdminKey = '';
      metricsData = null;
      return null;
    }

    if (!res.ok) {
      lastFetchError = `Server returned status ${res.status}`;
      return null;
    }

    const data = await res.json();
    metricsData = data;
    lastFetchError = '';
    return data;
  } catch (err) {
    lastFetchError = 'Network error fetching analytics telemetry.';
    return null;
  }
}

/** Render the Access Key authentication prompt. */
function renderAuthGate(container, onAuthSuccess) {
  clear(container);

  const wrapper = h('div', { class: 'auth-gate-card' });
  const iconWrap = h('div', { class: 'auth-icon-wrap', 'aria-hidden': 'true' }, icon('lock'));
  const heading = h('h2', { class: 'auth-title' }, 'Operator Analytics Authentication');
  const desc = p(
    'Private operator dashboard for HarborPath. Access is restricted to the platform administrator. ' +
    'Enter your administrative key to view aggregate, zero-PII visitor telemetry.'
  );

  const form = h('form', { class: 'auth-form' });
  const label = h('label', { for: 'admin-passkey-input', class: 'auth-label' }, 'Operator Secret Key');
  const input = h('input', {
    type: 'password',
    id: 'admin-passkey-input',
    class: 'auth-input',
    placeholder: 'Enter administrative key…',
    autocomplete: 'current-password',
    required: 'true',
  });

  const submitBtn = h('button', { type: 'submit', class: 'button button-primary auth-submit' }, 'Access Dashboard');
  const errorBox = h('div', { class: 'auth-error', role: 'alert', 'aria-live': 'assertive' });

  if (lastFetchError) {
    errorBox.textContent = lastFetchError;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const candidate = input.value.trim();
    if (!candidate) return;

    submitBtn.setAttribute('disabled', 'true');
    submitBtn.textContent = 'Verifying…';
    clear(errorBox);

    const data = await fetchMetrics(candidate);
    submitBtn.removeAttribute('disabled');
    submitBtn.textContent = 'Access Dashboard';

    if (data && data.authorized) {
      currentAdminKey = candidate;
      onAuthSuccess();
    } else {
      errorBox.textContent = lastFetchError || 'Authentication failed. Please check the access key.';
      input.focus();
    }
  });

  form.append(label, input, submitBtn, errorBox);
  wrapper.append(iconWrap, heading, desc, form);
  container.append(wrapper);
}

/** Create a metric KPI stat card. */
function createKpiCard(title, value, subtitle, iconName) {
  const card = h('div', { class: 'kpi-card' });
  const header = h('div', { class: 'kpi-card-header' });
  const titleEl = h('span', { class: 'kpi-card-title' }, title);
  const iconEl = h('span', { class: 'kpi-card-icon', 'aria-hidden': 'true' }, icon(iconName || 'activity'));
  header.append(titleEl, iconEl);

  const valueEl = h('div', { class: 'kpi-card-value' }, String(value));
  const subEl = h('div', { class: 'kpi-card-subtitle' }, subtitle);

  card.append(header, valueEl, subEl);
  return card;
}

/** Create an SVG sparkline/timeline bar visualization without external charting libraries. */
function renderTimelineSvg(timeline = []) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 720 180');
  svg.setAttribute('class', 'metrics-svg-chart');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '24-hour traffic timeline chart');

  const maxViews = Math.max(...timeline.map((t) => t.views || 0), 10);
  const chartHeight = 120;
  const barWidth = 22;
  const gap = 8;
  const startX = 20;
  const baseY = 140;

  // Render baseline axis
  const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axis.setAttribute('x1', '10');
  axis.setAttribute('y1', String(baseY));
  axis.setAttribute('x2', '710');
  axis.setAttribute('y2', String(baseY));
  axis.setAttribute('stroke', '#cbd5e1');
  axis.setAttribute('stroke-width', '1');
  svg.appendChild(axis);

  timeline.forEach((item, idx) => {
    const x = startX + idx * (barWidth + gap);
    const height = Math.max(4, Math.round(((item.views || 0) / maxViews) * chartHeight));
    const y = baseY - height;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(barWidth));
    rect.setAttribute('height', String(height));
    rect.setAttribute('rx', '3');
    rect.setAttribute('fill', '#0b4f5c');
    rect.setAttribute('class', 'chart-bar');

    // Title tooltip
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${item.hour.slice(11, 16)} UTC: ${item.views || 0} views, ${item.hotlines || 0} hotlines`;
    rect.appendChild(title);
    svg.appendChild(rect);

    // X-axis label
    if (idx % 3 === 0) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x + barWidth / 2));
      text.setAttribute('y', String(baseY + 18));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', '#64748b');
      text.textContent = item.hour ? item.hour.slice(11, 16) : '';
      svg.appendChild(text);
    }
  });

  return svg;
}

/** Download analytics data as a JSON file. */
function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `harborpath-metrics-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download analytics summary as CSV. */
function downloadCsv(data) {
  let csv = 'Category,Identifier,Count\n';
  (data.topRoutes || []).forEach((r) => {
    csv += `Route,"${r.path}",${r.count}\n`;
  });
  (data.hotlines || []).forEach((h) => {
    csv += `Hotline,"${h.id}",${h.count}\n`;
  });
  (data.tools || []).forEach((t) => {
    csv += `Tool,"${t.id}",${t.count}\n`;
  });
  csv += `Language,English,${data.languages?.en || 0}\n`;
  csv += `Language,Spanish,${data.languages?.es || 0}\n`;
  Object.entries(data.platforms || {}).forEach(([plat, count]) => {
    csv += `Platform,"${plat}",${count}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `harborpath-summary-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Render the full authenticated dashboard. */
function renderDashboard(container) {
  clear(container);

  if (!metricsData) return;

  const { summary, trafficTimeline, topRoutes, hotlines, tools, languages, platforms, recentEvents } = metricsData;

  // Header & Controls Toolbar
  const toolbar = h('div', { class: 'admin-toolbar' });
  const liveBadge = h('span', { class: 'status-pill status-live' }, '● Live Telemetry (Zero-PII Mode)');
  const updatedText = h('span', { class: 'toolbar-timestamp' }, `Updated: ${new Date(summary.lastUpdated).toLocaleTimeString()}`);

  const actionsWrap = h('div', { class: 'toolbar-actions' });
  const refreshBtn = h('button', { type: 'button', class: 'button button-secondary' }, 'Refresh');
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.setAttribute('disabled', 'true');
    await fetchMetrics(currentAdminKey);
    refreshBtn.removeAttribute('disabled');
    renderDashboard(container);
  });

  const lockBtn = h('button', { type: 'button', class: 'button button-ghost' }, 'Lock Dashboard');
  lockBtn.addEventListener('click', () => {
    resetAdminMetricsState();
    renderAuthGate(container, () => renderDashboard(container));
  });

  actionsWrap.append(refreshBtn, lockBtn);
  toolbar.append(liveBadge, updatedText, actionsWrap);
  container.append(toolbar);

  // 1. KPI Cards Grid
  const kpiGrid = h('div', { class: 'kpi-grid' });
  kpiGrid.append(
    createKpiCard('Total Impressions', summary.totalPageViews, 'Aggregate route views', 'eye'),
    createKpiCard('Crisis Interventions', summary.totalHotlineClicks, '988 / 911 / Hotline clicks', 'alert-triangle'),
    createKpiCard('Clinical Tools Run', summary.totalToolInteractions, 'ASAM & harm reduction tools', 'tool'),
    createKpiCard('Bilingual Split', `${languages.es || 0} ES / ${languages.en || 0} EN`, 'Spanish vs English sessions', 'globe')
  );
  container.append(kpiGrid);

  // 2. Traffic Activity Chart (24 Hours)
  const chartSection = h('section', { class: 'admin-section' });
  chartSection.append(
    h('h2', { class: 'admin-section-title' }, '24-Hour Traffic Activity Timeline'),
    fine('Hourly breakdown of visitor impressions and emergency hotline actions.'),
    renderTimelineSvg(trafficTimeline)
  );
  container.append(chartSection);

  // 3. Grid: Top Routes & Emergency Hotlines
  const twoCol = h('div', { class: 'admin-two-col' });

  // Left Col: Route Popularity
  const routesCard = h('div', { class: 'admin-card' });
  routesCard.append(h('h3', { class: 'admin-card-title' }, 'Most Visited Care Navigators & Pages'));
  const routesList = h('ul', { class: 'metrics-list' });

  const maxRouteCount = Math.max(...(topRoutes.map((r) => r.count)), 1);
  if (topRoutes.length === 0) {
    routesList.append(h('li', { class: 'metrics-empty' }, 'No route views recorded yet.'));
  } else {
    topRoutes.forEach((route) => {
      const item = h('li', { class: 'metrics-list-item' });
      const label = h('span', { class: 'metrics-item-label' }, `#/${route.path}`);
      const count = h('span', { class: 'metrics-item-count' }, String(route.count));
      const barWrap = h('div', { class: 'metrics-bar-track' });
      const bar = h('div', { class: 'metrics-bar-fill' });
      const pct = Math.round((route.count / maxRouteCount) * 100);
      bar.style.width = `${pct}%`;
      bar.className = 'metrics-bar-fill';
      barWrap.append(bar);

      item.append(label, count, barWrap);
      routesList.append(item);
    });
  }
  routesCard.append(routesList);

  // Right Col: Emergency Hotlines
  const hotlinesCard = h('div', { class: 'admin-card' });
  hotlinesCard.append(h('h3', { class: 'admin-card-title' }, 'Emergency Lifeline Activations'));
  const hotlinesList = h('ul', { class: 'metrics-list' });

  if (hotlines.length === 0) {
    hotlinesList.append(h('li', { class: 'metrics-empty' }, 'No hotline clicks recorded yet.'));
  } else {
    hotlines.forEach((hotline) => {
      const item = h('li', { class: 'metrics-list-item' });
      const label = h('span', { class: 'metrics-item-label' }, hotline.id.replace(/_/g, ' ').toUpperCase());
      const count = h('span', { class: 'metrics-item-count' }, String(hotline.count));
      item.append(label, count);
      hotlinesList.append(item);
    });
  }
  hotlinesCard.append(hotlinesList);

  twoCol.append(routesCard, hotlinesCard);
  container.append(twoCol);

  // 4. Modality & Platforms
  const platformSection = h('section', { class: 'admin-section' });
  platformSection.append(h('h2', { class: 'admin-section-title' }, 'Visitor Modality & Device Breakdown'));
  const platformGrid = h('div', { class: 'platform-grid' });

  Object.entries(platforms).forEach(([platform, count]) => {
    const pCard = h('div', { class: 'platform-card' });
    const pName = h('span', { class: 'platform-name' }, platform.replace(/_/g, ' ').toUpperCase());
    const pCount = h('span', { class: 'platform-count' }, String(count));
    pCard.append(pName, pCount);
    platformGrid.append(pCard);
  });
  platformSection.append(platformGrid);
  container.append(platformSection);

  // 5. Recent Anonymized Events Stream
  const eventsSection = h('section', { class: 'admin-section' });
  eventsSection.append(h('h2', { class: 'admin-section-title' }, 'Recent Anonymized Event Stream'));
  const eventsList = h('ul', { class: 'events-stream' });

  if (!recentEvents || recentEvents.length === 0) {
    eventsList.append(h('li', { class: 'metrics-empty' }, 'No recent events.'));
  } else {
    recentEvents.forEach((ev) => {
      const li = h('li', { class: 'event-item' });
      const time = h('span', { class: 'event-time' }, new Date(ev.timestamp).toLocaleTimeString());
      const typeBadge = h('span', { class: `event-badge badge-${ev.type}` }, ev.type);
      const detail = h('span', { class: 'event-detail' }, `${ev.label} (${ev.lang.toUpperCase()} / ${ev.platform})`);
      li.append(time, typeBadge, detail);
      eventsList.append(li);
    });
  }
  eventsSection.append(eventsList);
  container.append(eventsSection);

  // 6. Data Export & Maintenance Actions
  const exportSection = h('div', { class: 'admin-export-bar' });
  const jsonBtn = h('button', { type: 'button', class: 'button button-secondary' }, 'Export JSON');
  jsonBtn.addEventListener('click', () => downloadJson(metricsData));

  const csvBtn = h('button', { type: 'button', class: 'button button-secondary' }, 'Export CSV');
  csvBtn.addEventListener('click', () => downloadCsv(metricsData));

  const resetBtn = h('button', { type: 'button', class: 'button button-danger' }, 'Reset Metrics');
  resetBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all aggregate telemetry counters to zero?')) {
      await fetch(`/api/admin/metrics/reset?key=${encodeURIComponent(currentAdminKey)}`, { method: 'POST' });
      await fetchMetrics(currentAdminKey);
      renderDashboard(container);
    }
  });

  exportSection.append(jsonBtn, csvBtn, resetBtn);
  container.append(exportSection);
}

/** Root view entry point mounted by HarborPath router. */
export function adminMetricsView({ query } = {}) {
  const container = h('div', { class: 'admin-metrics-view' });

  container.append(
    pageHeader({
      title: 'Operator Analytics & Platform Telemetry',
      lead: 'Private, zero-PII aggregate metrics for the platform owner. Monitor real-time care navigator engagement, emergency lifeline interactions, and system reach.',
    })
  );

  const mainPanel = h('div', { class: 'admin-main-panel' });
  container.append(mainPanel);

  // If key passed in query (?key=...), attempt auto-login
  const queryKey = query?.get?.('key');
  if (queryKey && !currentAdminKey) {
    currentAdminKey = queryKey;
  }

  if (currentAdminKey) {
    fetchMetrics(currentAdminKey).then((data) => {
      if (data && data.authorized) {
        renderDashboard(mainPanel);
      } else {
        renderAuthGate(mainPanel, () => renderDashboard(mainPanel));
      }
    });
  } else {
    renderAuthGate(mainPanel, () => renderDashboard(mainPanel));
  }

  return container;
}
