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
const routes = ['/', '/#/treatment', '/#/match', '/#/overdose', '/#/plan'];
const errors = [];
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    // HarborPath intentionally blocks inline JS via CSP. Serve axe from a
    // same-origin intercepted QA URL instead of weakening the policy.
    await page.route('**/__qa__/axe.min.js', (route) => route.fulfill({
      status: 200,
      contentType: 'text/javascript',
      body: axeSource,
    }));
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.locator('#page-title').waitFor({ state: 'visible', timeout: 12000 });
      const heading = (await page.locator('#page-title').innerText()).trim();
      if (response?.status() !== 200 || !heading) errors.push(route + ': missing visible heading or HTTP 200');
      await page.addScriptTag({ url: base + '/__qa__/axe.min.js' });
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          affected: v.nodes.length,
        }));
      });
      const serious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      for (const item of serious) errors.push(route + ' ' + viewport.width + 'px: axe ' + item.id + ' (' + item.impact + ')');
      console.log(JSON.stringify({ route, width: viewport.width, heading, violations }));
    }
    for (const err of pageErrors) errors.push(viewport.width + 'px JavaScript error: ' + err);
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
for (const err of errors) console.error('::error::' + err);
console.log('HarborPath browser quality: ' + (errors.length ? errors.length + ' failures' : 'pass'));
if (errors.length) process.exitCode = 1;
