// Headless-browser walkthrough of the "Find care that fits" flow at phone width.
// Uses the recorded SAMHSA fixture instead of the live API, so it runs offline.
// Needs Playwright with Chromium installed (not a project dependency):
//   node scripts/e2e-match.mjs [screenshot-dir]
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const repo = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const { createApp } = await import(`${repo}/src/app.js`);
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2] ?? '.';
const sample = readFileSync(`${repo}/test/fixtures/findtreatment-sample.json`, 'utf8');
const upstream = [];
const server = createServer(createApp({ fetchImpl: async (url) => { upstream.push(url); return new Response(sample, { status: 200 }); }, logger: { error: () => {} } }));
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const requests = [];
page.on('request', (r) => requests.push(r.url()));

await page.goto(base + '/');
await page.waitForSelector('#page-title');
console.log('H1:', await page.textContent('#page-title'));
console.log('CTAs:', (await page.$$eval('.hero-actions button', (b) => b.map((x) => x.textContent.trim()))).join(' | '));
await page.screenshot({ path: `${out}/1-home.png`, fullPage: false });

await page.click('.hero-actions button:has-text("Find treatment")');
await page.waitForSelector('.wizard');
// Emergency branch
await page.click('text=Yes: a possible overdose');
await page.waitForSelector('#m-emergency');
console.log('Emergency panel focused:', await page.evaluate(() => document.activeElement?.id));
await page.screenshot({ path: `${out}/2-emergency.png` });
await page.getByRole('button', { name: /Everyone is safe/ }).click();
await page.waitForSelector('.wizard');
await page.check('text=Alcohol or drug use');
await page.check('text=opioids (including fentanyl');
await page.click('button:has-text("Next")');
await page.check('text=outpatient care >> nth=0');
await page.check('text=buprenorphine (Suboxone)');
await page.click('button:has-text("Next")');
// Location step: type a ZIP
const input = page.locator('input[role=combobox]');
await input.fill('98101');
await page.waitForSelector('.suggestion');
await page.locator('.suggestion').first().dispatchEvent('mousedown');
await page.check('text=Either is fine');
await page.screenshot({ path: `${out}/3-location.png`, fullPage: true });
await page.click('button:has-text("Next")');
await page.check('text=Medicaid');
await page.click('button:has-text("Next")');
await page.check('text=evening');
await page.check('text=Getting there');
await page.click('button:has-text("See my matches")');
await page.waitForSelector('.match-card, .empty', { timeout: 15000 });
const status = await page.textContent('.results-status');
console.log('Status:', status);
const cards = await page.$$eval('.match-card', (cs) => cs.slice(0, 3).map((c) => ({
  name: c.querySelector('.facility-name')?.textContent,
  tier: c.querySelector('.tier')?.textContent,
  why: [...c.querySelectorAll('.why:not(.why-verify):not(.why-missing) li')].map((l) => l.textContent),
  verify: c.querySelector('.why-verify summary')?.textContent,
})));
console.log(JSON.stringify(cards, null, 1));
await page.screenshot({ path: `${out}/4-results.png`, fullPage: false });
await page.locator('.match-card').first().screenshot({ path: `${out}/4b-card.png` });
// Compare two
const boxes = page.locator('.compare-check input');
await boxes.nth(0).check();
await page.locator('.compare-check input').nth(1).check();
await page.waitForSelector('.compare table');
console.log('Compare cols:', await page.$$eval('.compare thead th', (t) => t.length));
await page.locator('.compare').screenshot({ path: `${out}/5-compare.png` });
console.log('Plan items:', await page.$$eval('.action-plan .checklist > li', (l) => l.length));
const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
console.log('No horizontal scroll:', scrollW <= 375, scrollW);
// Privacy: nothing sensitive in URLs sent to our server or upstream
const leaks = [...requests, ...upstream].filter((u) => /medicaid|opioid|evening|transport|buprenorphine/i.test(u));
console.log('Sensitive values in any request URL:', leaks);
console.log('Location hash:', await page.evaluate(() => location.hash));
console.log('localStorage keys:', await page.evaluate(() => Object.keys(localStorage)));
console.log('API calls:', requests.filter((u) => u.includes('/api/')).map((u) => u.replace(base, '')));
// Regression: change answers, then see matches again at the same location.
await page.getByRole('button', { name: 'Change answers' }).click();
await page.waitForSelector('.wizard');
await page.getByRole('button', { name: 'See my matches' }).click();
await page.waitForSelector('.match-card, .empty', { timeout: 15000 });
console.log('Reload after changing answers:', await page.textContent('.results-status'));
// Spanish
await page.goto(base + '/?lang=es#/match');
await page.waitForSelector('.wizard');
console.log('ES title:', await page.textContent('.wizard h2'));
console.log('Errors:', errors);
await browser.close();
server.close();
