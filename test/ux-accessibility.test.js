import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  treatmentCard,
  healthCenterCard,
  providerCard,
  saveButton,
  copyButton,
} from '../public/js/components/facilityCard.js';
import {
  skeleton,
  treatmentFinder,
  healthCenterFinder,
} from '../public/js/components/finder.js';
import { TREATMENT_FILTERS } from '../public/js/codes.js';
import { setLocation, setRadius } from '../public/js/state.js';
import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, '..', 'public');

function walkFiles(dir, extRegex = /\.(js|html|css|svg)$/) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, extRegex));
    } else if (extRegex.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

class MockNode {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.className = '';
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this._textContent = '';
    this.isConnected = true;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'hidden') this.hidden = true;
    if (k === 'value') this.value = val;
    if (k === 'checked') this.checked = true;
  }

  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'hidden') this.hidden = false;
  }

  addEventListener(evt, fn) {
    this.listeners[evt] = fn;
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string') {
        const textNode = new MockNode('#text');
        textNode._textContent = item;
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
  }

  hasClass(cls) {
    const classes = (this.className || this.attributes.class || '').split(/\s+/).filter(Boolean);
    return classes.includes(cls);
  }

  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(pred, acc);
    }
    return acc;
  }
}

function withMockDom(fn) {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;
  const prevWin = globalThis.window;
  const announcer = new MockNode('div');
  announcer.setAttribute('id', 'announcer');
  announcer.setAttribute('aria-live', 'polite');

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: (id) => (id === 'announcer' ? announcer : null),
  };
  globalThis.window = {
    matchMedia: () => ({ matches: true }),
  };

  const restore = () => {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
    globalThis.window = prevWin;
  };

  try {
    const res = fn({ announcer });
    if (res && typeof res.then === 'function') {
      return res.finally(restore);
    }
    restore();
    return res;
  } catch (err) {
    restore();
    throw err;
  }
}

test('zero innerHTML, outerHTML, insertAdjacentHTML, or inline style= attributes across all files in public/', () => {
  const files = walkFiles(publicDir, /\.(js|html|svg)$/);
  assert.ok(files.length >= 20, `Expected at least 20 files in public/, found ${files.length}`);

  const violations = [];
  for (const file of files) {
    const rel = path.relative(publicDir, file);
    const src = fs.readFileSync(file, 'utf8');

    if (/\b(?:innerHTML|outerHTML|insertAdjacentHTML)\b/.test(src)) {
      violations.push(`${rel}: contains forbidden HTML sink (innerHTML/outerHTML/insertAdjacentHTML)`);
    }
    if (/\sstyle\s*=\s*['"]/i.test(src)) {
      violations.push(`${rel}: contains forbidden inline style= attribute`);
    }
  }

  assert.deepEqual(violations, [], `CSP/DOM safety violations found: ${violations.join('; ')}`);
});

test('public/index.html and component modules include WCAG 2.1 AA landmarks and live regions', () => {
  const indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
  const finderSrc = fs.readFileSync(path.join(publicDir, 'js', 'components', 'finder.js'), 'utf8');
  const providersSrc = fs.readFileSync(path.join(publicDir, 'js', 'components', 'providers.js'), 'utf8');

  // Landmarks and keyboard navigation in index.html
  assert.match(indexHtml, /class="skip-link"\s+href="#main"/);
  assert.match(indexHtml, /<main\s+id="main"[^>]*tabindex="-1"/);
  assert.match(indexHtml, /id="announcer"[^>]*aria-live="polite"/);
  assert.match(indexHtml, /role="region"\s+aria-label="Emergency help"/);
  assert.match(indexHtml, /<nav[^>]*aria-label="Main"/);
  assert.match(indexHtml, /<nav[^>]*aria-label="Footer"/);

  // Status, alert, and aria-busy attributes in component modules
  assert.match(finderSrc, /role:\s*'status'/);
  assert.match(finderSrc, /role:\s*'alert'/);
  assert.match(finderSrc, /'aria-busy'/);
  assert.match(finderSrc, /setAttribute\('aria-busy',\s*'true'\)/);
  assert.match(finderSrc, /setAttribute\('aria-busy',\s*'false'\)/);
  assert.match(providersSrc, /role:\s*'tablist'/);
  assert.match(providersSrc, /role:\s*'tabpanel'/);
});

test('public/styles.css defines :focus-visible, prefers-reduced-motion, high-contrast badge classes, and .relaxed-matches styles', () => {
  const css = fs.readFileSync(path.join(publicDir, 'styles.css'), 'utf8');

  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px\s+solid\s+var\(--focus,\s*#0b5cab\)/s);
  assert.match(css, /:focus-visible\s*\{[^}]*outline-offset:\s*2px/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.relaxed-matches\b/);
  assert.match(css, /\.relaxed-header\b/);
  assert.match(css, /\.near-match-banner\b/);
  assert.match(css, /\.badge-matched\b/);
  assert.match(css, /\.badge-unmatched\b/);
  assert.match(css, /\.sk-badges\b/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
});

test('skeleton() renders accessible zero-CLS placeholder cards with .sk-badges / .sk-badgeRow', () => {
  withMockDom(() => {
    const cards = skeleton(3);
    assert.equal(cards.length, 3);
    for (const card of cards) {
      assert.ok(card.hasClass('card') && card.hasClass('skeleton'));
      assert.equal(card.getAttribute('aria-hidden'), 'true');
      const badgeRows = card.findAll((n) => n.hasClass('sk-badges') && n.hasClass('sk-badgeRow'));
      assert.equal(badgeRows.length, 1);
      const pills = badgeRows[0].findAll((n) => n.hasClass('sk-pill'));
      assert.equal(pills.length, 3);
    }
  });
});

test('facilityCard.js renders near-match banner with .badge-matched and .badge-unmatched pills and explicit aria-label / aria-pressed attributes', () => {
  withMockDom(() => {
    const sampleFacility = {
      id: 'fac-101',
      name: 'Harbor Recovery Clinic',
      subname: 'Outpatient Behavioral Health',
      miles: 2.4,
      address: { street1: '123 Pine St', city: 'Seattle', state: 'WA', zip: '98101' },
      phone: '206-555-0100',
      intake: '206-555-0199',
      hotline: '206-555-0911',
      website: 'https://example.org/clinic',
      codes: ['BU', 'TELE', 'MD'],
      matchedCodes: ['BU', 'TELE'],
      services: [
        { category: 'OM', label: 'Opioid Medications', items: ['Buprenorphine'] },
      ],
    };

    const card = treatmentCard(sampleFacility, {
      requestedCodes: ['BU', 'OTP', 'TELE'],
    });

    // Near-match banner
    const banners = card.findAll((n) => n.hasClass('near-match-banner'));
    assert.equal(banners.length, 1);
    assert.equal(banners[0].getAttribute('role'), 'region');
    assert.ok(banners[0].getAttribute('aria-label'));
    assert.match(banners[0].textContent, /Matches 2 of 3 selected filters/);

    const matchedBadges = banners[0].findAll((n) => n.hasClass('badge-matched'));
    const unmatchedBadges = banners[0].findAll((n) => n.hasClass('badge-unmatched'));
    assert.equal(matchedBadges.length, 2);
    assert.equal(unmatchedBadges.length, 1);
    assert.match(matchedBadges[0].getAttribute('aria-label'), /Matched filter: Buprenorphine/);
    assert.match(matchedBadges[1].getAttribute('aria-label'), /Matched filter: Telehealth/);
    assert.match(unmatchedBadges[0].getAttribute('aria-label'), /Not listed: Opioid treatment program/);

    // Interactive elements have explicit aria-label or aria-pressed
    const saveBtns = card.findAll((n) => n.hasClass('save-btn'));
    assert.equal(saveBtns.length, 1);
    assert.equal(saveBtns[0].getAttribute('aria-pressed'), 'false');
    assert.match(saveBtns[0].getAttribute('aria-label'), /Save Harbor Recovery Clinic/);

    // Clicking save toggles aria-pressed and aria-label
    saveBtns[0].listeners.click();
    assert.equal(saveBtns[0].getAttribute('aria-pressed'), 'true');
    assert.match(saveBtns[0].getAttribute('aria-label'), /Remove Harbor Recovery Clinic/);
    saveBtns[0].listeners.click();
    assert.equal(saveBtns[0].getAttribute('aria-pressed'), 'false');

    // Phone, website, directions, copy, and details summary all have explicit aria-labels
    const interactive = card.findAll((n) => ['A', 'BUTTON', 'SUMMARY'].includes(n.tagName));
    assert.ok(interactive.length >= 6);
    for (const el of interactive) {
      assert.ok(
        el.getAttribute('aria-label'),
        `Expected ${el.tagName} (${el.textContent}) in treatmentCard to have an explicit aria-label`,
      );
    }

    // Verify healthCenterCard and providerCard interactive elements also have aria-labels
    const hcCard = healthCenterCard({
      id: 'hc-1',
      name: 'Downtown Community Health',
      org: 'SEATTLE HEALTH SYSTEM',
      street: '400 Broad St',
      city: 'Seattle',
      state: 'WA',
      zip: '98109',
      phone: '206-555-0200',
      website: 'https://example.org/hc',
      miles: 1.2,
    });
    for (const el of hcCard.findAll((n) => ['A', 'BUTTON'].includes(n.tagName))) {
      assert.ok(el.getAttribute('aria-label'), `Expected ${el.tagName} in healthCenterCard to have aria-label`);
    }

    const prCard = providerCard({
      id: 'va-1',
      providerType: 'va',
      category: 'vamc',
      name: 'PUGET SOUND VA MEDICAL CENTER',
      street: '1660 S Columbian Way',
      city: 'Seattle',
      state: 'WA',
      zip: '98108',
      phone: '206-762-1010',
      website: 'https://www.va.gov/puget-sound-health-care/',
      hours: '24/7',
      miles: 3.5,
    });
    for (const el of prCard.findAll((n) => ['A', 'BUTTON', 'SUMMARY'].includes(n.tagName))) {
      assert.ok(el.getAttribute('aria-label'), `Expected ${el.tagName} in providerCard to have aria-label`);
    }

    // Verify Spanish translation of near-match banner
    useDictionary('es', es);
    try {
      const esCard = treatmentCard(sampleFacility, { requestedCodes: ['BU', 'OTP', 'TELE'] });
      assert.match(esCard.textContent, /Coincide con 2 de 3 filtros seleccionados/);
    } finally {
      useDictionary('en', {});
    }
  });
});

test('treatmentFinder and healthCenterFinder toggle aria-busy and render relaxed near-match fallback when 0 exact results exist', async () => {
  await withMockDom(async () => {
    const prevFetch = globalThis.fetch;
    let resolveTreatment;
    const treatmentPromise = new Promise((resolve) => { resolveTreatment = resolve; });

    globalThis.fetch = async (url) => {
      const u = String(url);
      if (u.startsWith('/api/treatment')) {
        const body = await treatmentPromise;
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.startsWith('/api/health-centers')) {
        return new Response(JSON.stringify({ total: 0, results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.startsWith('/api/region')) {
        return new Response(JSON.stringify({ region: { code: 'WA', name: 'Washington' }, nearby: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.startsWith('/api/state')) {
        return new Response(JSON.stringify({ region: { code: 'WA', name: 'Washington' }, agency: null, medicaid: null, telehealth: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.startsWith('/api/nearby-summary')) {
        return new Response(JSON.stringify({ radiusMiles: 25, region: { code: 'WA', name: 'Washington' }, networks: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    try {
      setLocation({ label: 'Seattle, WA', lat: 47.61, lng: -122.33, state: 'WA' });
      setRadius(25);

      const finderEl = treatmentFinder({
        kind: 'sa',
        filters: TREATMENT_FILTERS,
        initialCodes: ['BU', 'OTP', 'TELE'],
        noun: 'treatment facilities',
      });

      const resultsRegion = finderEl.findAll((n) => n.hasClass('results'))[0];
      assert.ok(resultsRegion);
      // While the search request is in flight, aria-busy is 'true' and skeletons are shown
      assert.equal(resultsRegion.getAttribute('aria-busy'), 'true');
      assert.ok(finderEl.findAll((n) => n.hasClass('skeleton')).length >= 3);

      // Verify filter regions have accessible labels
      const detailsRegion = finderEl.findAll((n) => n.hasClass('filters'))[0];
      assert.equal(detailsRegion.getAttribute('aria-label'), 'Search filters');
      const activeChipsRegion = finderEl.findAll((n) => n.hasClass('active-filters'))[0];
      assert.equal(activeChipsRegion.getAttribute('role'), 'region');
      assert.equal(activeChipsRegion.getAttribute('aria-label'), 'Active search filters');

      // Resolve treatment API with 0 exact results and 1 relaxed near-match
      resolveTreatment({
        page: 1,
        totalPages: 0,
        total: 0,
        results: [],
        relaxed: {
          requestedCodes: ['BU', 'OTP', 'TELE'],
          totalUnfiltered: 5,
          results: [
            {
              id: 'near-1',
              name: 'SoundView Recovery Center',
              miles: 3.1,
              address: { street1: '500 Olive Way', city: 'Seattle', state: 'WA', zip: '98101' },
              phone: '206-555-0300',
              codes: ['BU', 'TELE'],
              matchedCodes: ['BU', 'TELE'],
              services: [],
            },
          ],
        },
      });

      await new Promise((r) => setTimeout(r, 20));

      assert.equal(resultsRegion.getAttribute('aria-busy'), 'false');

      const relaxedSections = finderEl.findAll((n) => n.hasClass('relaxed-matches'));
      assert.equal(relaxedSections.length, 1);
      assert.equal(relaxedSections[0].getAttribute('role'), 'region');
      assert.match(relaxedSections[0].textContent, /No exact match for all 3 filters/);
      assert.match(relaxedSections[0].textContent, /SoundView Recovery Center/);
      assert.match(relaxedSections[0].textContent, /Matches 2 of 3 selected filters/);

      // Also verify healthCenterFinder toggles aria-busy to false when resolved
      const hcEl = healthCenterFinder();
      await new Promise((r) => setTimeout(r, 20));
      const hcResults = hcEl.findAll((n) => n.hasClass('results'))[0];
      assert.equal(hcResults.getAttribute('aria-busy'), 'false');
    } finally {
      globalThis.fetch = prevFetch;
      setLocation(null);
    }
  });
});
