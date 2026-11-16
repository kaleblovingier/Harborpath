// CI-only Chromium smoke and axe-core scan; no third-party traffic or real user data.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createApp } from '../src/app.js';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const server = createServer(createApp({ logger: { error() {} } }));
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const base = 'http://127.0.0.1:' + server.address().port;
const routes = [
  '/', '/#/treatment', '/#/match', '/#/overdose', '/#/plan',
  '/#/tools', '/#/workspace', '/#/navigator', '/#/guided',
  '/#/medications', '/#/harm-reduction', '/#/support', '/#/choosing-care',
  '/#/antimuscarinic-toxidrome',
];
const translatedControlRoutes = [
  '/#/treatment', '/#/guided', '/#/choosing-care', '/#/antimuscarinic-toxidrome',
];
const treatmentFixture = {
  page: 1, totalPages: 1, total: 1,
  results: [{
    id: 'qa-facility', name: 'Example Provider',
    address: { street: '100 Example Street', city: 'Bellingham', state: 'WA', zip: '98225' },
    phone: '360-555-0101', intake: '360-555-0102', hotline: '360-555-0103',
    miles: 2, services: [], codes: [],
  }],
};
// Remaining contrast baselines captured 2026-11-10 from both viewports.
const knownViolations = {
  '/': { 'color-contrast': 33 },
  '/#/treatment': { 'color-contrast': 24 },
  '/#/match': { 'color-contrast': 6 },
  '/#/overdose': { 'color-contrast': 13 },
  '/#/plan': { 'color-contrast': 23 },
};
const errors = [];
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const viewports = [{ width: 390, height: 844 }, { width: 1280, height: 800 }];
  const scenarios = viewports.flatMap((viewport) => [
    { viewport, language: 'en', pages: routes },
    { viewport, language: 'es', pages: translatedControlRoutes },
  ]);
  for (const { viewport, language, pages } of scenarios) {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width === 390 });
    const page = await context.newPage();
    // HarborPath intentionally blocks inline JS via CSP. Serve axe from a
    // same-origin intercepted QA URL instead of weakening the policy.
    await page.route('**/__qa__/axe.min.js', (route) => route.fulfill({
      status: 200,
      contentType: 'text/javascript',
      body: axeSource,
    }));
    await page.route(/\/api\/treatment\?/, (route) => route.fulfill({ json: treatmentFixture }));
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    for (const route of pages) {
      // A fresh document prevents hash navigation from testing the prior route's
      // heading while the next route loads its view and stylesheet.
      const url = new URL(route, base);
      url.searchParams.set('qa', route);
      url.searchParams.set('lang', language);
      const response = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.locator('#page-title').waitFor({ state: 'visible', timeout: 12000 });
      const heading = (await page.locator('#page-title').innerText()).trim();
      if (response?.status() !== 200 || !heading) {
        errors.push(route + ': missing visible heading or HTTP 200');
      }
      const scenario = route + ' ' + viewport.width + 'px (' + language + ')';
      if (await page.locator('html').getAttribute('lang') !== language) {
        errors.push(scenario + ': expected page language was not applied');
      }
      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflows) errors.push(scenario + ': horizontal page overflow');
      await page.addScriptTag({ url: base + '/__qa__/axe.min.js' });
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          affected: v.nodes.length,
          nodes: v.nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
        }));
      });
      const serious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      for (const item of serious) {
        const allowed = knownViolations[route]?.[item.id] ?? 0;
        if (item.affected > allowed) {
          errors.push(scenario + ': axe ' + item.id +
            ' (' + item.impact + ', ' + item.affected + ' nodes; baseline ' + allowed + ')');
          console.error(JSON.stringify({ scenario, rule: item.id, nodes: item.nodes }));
        } else {
          console.warn('BASELINE (remediation needed) ' + scenario + ': ' + item.id + ' ' + item.affected + ' nodes');
        }
      }
      console.log(JSON.stringify({
        route, width: viewport.width, language, heading,
        violations: violations.map(({ id, impact, affected }) => ({ id, impact, affected })),
      }));
      if (route === '/#/treatment') {
        await page.locator('.finder [role="combobox"]').fill('98225');
        await page.locator('.suggestions [role="option"]').first().click();
        const facility = page.getByRole('article', { name: 'Example Provider' });
        await facility.waitFor();
        if (await facility.locator('a[href^="tel:"]').count() !== 3) {
          errors.push(scenario + ': expected all three provider contact actions');
        }
        // Scan again after saving so the updated visible label and accessible name
        // are checked together with the contact actions on a populated result.
        await facility.locator('.save-btn').click();
        const resultViolations = await page.evaluate(async () => {
          const result = await window.axe.run(document, {
            runOnly: ['label-content-name-mismatch', 'target-size'],
          });
          return result.violations.map((item) => item.id + ': ' + item.nodes.length);
        });
        for (const violation of resultViolations) errors.push(scenario + ' populated results: ' + violation);
      }
    }
    for (const err of pageErrors) errors.push(viewport.width + 'px (' + language + ') JavaScript error: ' + err);
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
for (const err of errors) console.error('::error::' + err);
console.log('HarborPath browser quality: ' + (errors.length ? errors.length + ' failures' : 'pass'));
if (errors.length) process.exitCode = 1;
