// Real-browser sweep of every client route on a 320 px phone screen (the WCAG
// reflow width), in English and Spanish. It catches what the Node tests cannot
// see: a view that throws or never renders, "[object Object]", undefined or NaN
// on the page, sideways scrolling, form controls with no accessible name, and
// text fields that lose focus or their text while someone types.
// Uses the recorded SAMHSA fixture instead of the live API, so it runs offline.
// Needs Playwright with Chromium installed (not a project dependency):
//   node scripts/sweep-routes.mjs [route ...]     every route when none is named
// Prints one line per finding and exits 1 when there are any.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createApp } from '../src/app.js';
import { SYNC_VIEWS, LAZY_LOADERS } from '../public/js/app.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const WIDTH = 320;

const sample = readFileSync(new URL('../test/fixtures/findtreatment-sample.json', import.meta.url), 'utf8');
const server = createServer(createApp({
  fetchImpl: async () => new Response(sample, { status: 200 }),
  logger: { error: () => {} },
  // One client opens every route within a minute; the default limit would answer 429.
  rateLimit: { windowMs: 60_000, max: 1_000_000 },
}));
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const routes = process.argv.length > 2
  ? process.argv.slice(2)
  : [...new Set([...Object.keys(SYNC_VIEWS), ...Object.keys(LAZY_LOADERS)])];

// Runs inside the page before the app starts.
function installHelpers() {
  const shown = (el) => {
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : el.className ? `.${String(el.className).split(' ')[0]}` : '');
  const controls = () => [...document.querySelectorAll('#main :is(input:not([type=hidden]), select, textarea)')].filter(shown);
  const typable = () => controls().filter((el) => !el.disabled && !el.readOnly
    && el.matches('input:not([type]), input[type=text], input[type=number], input[type=tel], input[type=email], textarea'));
  window.sweep = {
    inspect() {
      const main = document.querySelector('#main');
      const text = main.textContent;
      const page = document.documentElement;
      const widest = [...main.querySelectorAll('*')].find((el) => el.getBoundingClientRect().right > page.clientWidth + 1);
      return {
        failed: Boolean(main.querySelector('.view-load-failed')),
        h1: main.querySelectorAll('h1').length,
        junk: [['[object Object]', /\[object Object\]/], ['undefined', /\bundefined\b/], ['NaN', /\bNaN\b/]]
          .filter(([, pattern]) => pattern.test(text)).map(([word]) => word),
        overflow: page.scrollWidth - page.clientWidth,
        widest: widest ? name(widest) : '',
        unlabeled: controls()
          .filter((el) => !(el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.title))
          .map(name),
        typable: typable().length,
      };
    },
    markForTyping(index) {
      const el = typable()[index];
      el?.setAttribute('data-typing', '');
      return el ? name(el) : null;
    },
    afterTyping() {
      const el = document.activeElement;
      document.querySelector('[data-typing]')?.removeAttribute('data-typing');
      return el?.matches('input, textarea') ? el.value : null;
    },
  };
}

const findings = [];
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));

for (const lang of ['en', 'es']) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 800 }, isMobile: true, hasTouch: true, locale: 'en-US' });
  await page.addInitScript(installHelpers);
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  // Failed requests are reported with their path below, not as the console's bare "Failed to load resource".
  page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) errors.push(msg.text().split('\n')[0]); });
  page.on('response', (res) => { if (res.status() >= 400) errors.push(`${res.status()} ${new URL(res.url()).pathname}`); });
  // Telemetry beacons are fire-and-forget; a headless profile can refuse their upload.
  page.on('requestfailed', (req) => { if (!req.url().includes('/api/telemetry/')) errors.push(`${req.failure()?.errorText} ${new URL(req.url()).pathname}`); });
  const report = (route, message) => findings.push(`[${lang}] #/${route}: ${message}`);

  for (const route of routes) {
    errors.length = 0;
    // Mark what is on screen now, so "rendered" means the new route replaced it.
    await page.evaluate(() => document.querySelector('#main')?.firstElementChild?.setAttribute('data-stale', ''));
    await page.goto(`${base}/${lang === 'es' ? '?lang=es' : ''}#/${route}`);
    const rendered = await page.waitForFunction(() => {
      const main = document.querySelector('#main');
      // Before the first render, main holds only the <noscript> fallback.
      return main?.querySelector(':scope > :not(noscript)') && !main.querySelector('[data-stale], .view-loading');
    }, null, { timeout: 8000 }).then(() => true, () => false);
    if (!rendered) {
      report(route, `did not render${errors.length ? ` (${errors[0]})` : ''}`);
      continue;
    }

    const seen = await page.evaluate(() => window.sweep.inspect());
    if (seen.failed) report(route, 'shows the "This page didn’t load" fallback');
    if (seen.h1 !== 1) report(route, `${seen.h1} h1 headings (expected 1)`);
    if (seen.junk.length) report(route, `shows ${seen.junk.join(', ')} as text`);
    if (seen.overflow > 0) report(route, `scrolls sideways by ${seen.overflow}px (first too-wide element: ${seen.widest})`);
    if (seen.unlabeled.length) report(route, `${seen.unlabeled.length} form control(s) with no label: ${[...new Set(seen.unlabeled)].join(', ')}`);

    // Same DOM in both languages, so type once.
    for (let i = 0; lang === 'en' && i < seen.typable; i += 1) {
      const field = await page.evaluate((index) => window.sweep.markForTyping(index), i);
      if (!field) break;
      await page.focus('[data-typing]');
      await page.keyboard.type('12');
      const value = await page.evaluate(() => window.sweep.afterTyping());
      if (value === null) report(route, `typing in ${field} loses focus (the field is rebuilt on each keystroke)`);
      else if (!value.includes('12')) report(route, `typing "12" in ${field} left "${value}"`);
    }
    if (errors.length) report(route, `error: ${[...new Set(errors)].slice(0, 2).join(' | ')}`);
  }
  await page.close();
}

await browser.close();
for (const line of findings) console.log(line);
console.log(`${routes.length} routes x 2 languages at ${WIDTH}px: ${findings.length} findings`);
process.exit(findings.length ? 1 : 0);
