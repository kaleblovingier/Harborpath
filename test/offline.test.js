// Offline and low-bandwidth resilience:
// - every module the app can load (static or dynamic import) exists and is in
//   the service worker's APP_SHELL, so opt-in offline mode is complete;
// - the overdose steps and support lines render with no network at all;
// - the service worker versions its cache, cleans up old versions, never
//   stores /api/ responses, explains offline searches, and Quick exit removes
//   everything and unregisters.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const swSource = readFileSync(path.join(publicDir, 'sw.js'), 'utf8');
const appShell = [...swSource.match(/const APP_SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

/** All modules reachable from app.js. Returns { modules: Set<'/js/..'>, lazy: Set }. */
function moduleGraph() {
  const modules = new Set();
  const lazy = new Set();
  const visit = (urlPath, viaDynamic) => {
    if (viaDynamic) lazy.add(urlPath);
    if (modules.has(urlPath)) return;
    const file = path.join(publicDir, urlPath);
    assert.ok(existsSync(file), `Imported module is missing: ${urlPath}`);
    modules.add(urlPath);
    const src = readFileSync(file, 'utf8');
    const resolve = (spec) => path.posix.join(path.posix.dirname(urlPath), spec);
    for (const m of src.matchAll(/^\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]/gm)) visit(resolve(m[1]), false);
    for (const m of src.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm)) visit(resolve(m[1]), false);
    for (const m of src.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) visit(resolve(m[1]), true);
  };
  visit('/js/app.js', false);
  return { modules, lazy };
}

test('every module the app can load exists and is listed in APP_SHELL', () => {
  const { modules } = moduleGraph();
  const missing = [...modules].filter((m) => !appShell.includes(m));
  assert.deepEqual(missing, [], `Add to APP_SHELL in public/sw.js: ${missing.join(', ')}`);
  for (const required of ['/', '/index.html', '/styles.css', '/icons.svg', '/manifest.webmanifest']) {
    assert.ok(appShell.includes(required), `APP_SHELL includes ${required}`);
  }
  assert.equal(new Set(appShell).size, appShell.length, 'APP_SHELL has no duplicates');
  assert.ok(!appShell.some((p) => p.startsWith('/api/')), 'APP_SHELL never lists /api/');
});

test('heavy views load on demand; the overdose and crisis views stay in the first load', () => {
  const { lazy } = moduleGraph();
  for (const view of ['/js/views/navigator.js', '/js/views/medications.js', '/js/views/plan.js']) {
    assert.ok(lazy.has(view), `${view} is loaded with import() when its route is visited`);
  }
  const app = readFileSync(path.join(publicDir, 'js/app.js'), 'utf8');
  assert.match(app, /^import \{[^}]*overdoseView[^}]*\} from '\.\/views\/guides\.js';$/m);
  assert.match(app, /^import \{[^}]*crisisView[^}]*\} from '\.\/views\/core\.js';$/m);
});

// ---------------------------------------------------------------- Rendering with no network
class MockNode {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.attributes = {};
    this.children = [];
    this.dataset = {};
    this.className = '';
    this._text = '';
  }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this._text = String(v ?? ''); this.children = []; }
  get firstChild() { return this.children[0] ?? null; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener() {}
  append(...items) {
    for (const item of items) {
      const node = item instanceof MockNode ? item : Object.assign(new MockNode('#text'), { _text: String(item) });
      node.parent = this;
      this.children.push(node);
    }
  }
  remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); }
  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const c of this.children) c.findAll(pred, acc);
    return acc;
  }
}

test('overdose steps, 911, 988, and the SAMHSA helpline render without any network request', async () => {
  const saved = { document: globalThis.document, Node: globalThis.Node, fetch: globalThis.fetch };
  const requests = [];
  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };
  globalThis.fetch = async (url) => { requests.push(String(url)); throw new TypeError('offline'); };
  try {
    const { overdoseView } = await import('../public/js/views/guides.js');
    const { crisisView } = await import('../public/js/views/core.js');

    const od = overdoseView();
    const odText = od.textContent;
    assert.match(odText, /Check for overdose signs/);
    assert.match(odText, /Give naloxone/);
    assert.match(odText, /recovery position/);
    assert.match(odText, /Start 2-minute timer/);
    const telHrefs = (root) => root.findAll((n) => n.tagName === 'A').map((a) => a.attributes.href);
    assert.ok(telHrefs(od).includes('tel:911'), 'overdose page links tel:911');

    const crisis = crisisView();
    const hrefs = telHrefs(crisis);
    assert.ok(hrefs.includes('tel:911'), 'crisis page links tel:911');
    assert.ok(hrefs.includes('tel:988'), 'crisis page links tel:988');
    assert.ok(hrefs.includes('tel:18006624357'), 'crisis page links the SAMHSA helpline');
    assert.match(crisis.textContent, /1-800-662-4357/);

    // Give any stray async work a chance to run, then confirm nothing was fetched.
    await new Promise((r) => setTimeout(r, 20));
    assert.deepEqual(requests, [], 'no network requests while rendering emergency content');
  } finally {
    Object.assign(globalThis, saved);
  }
});

// ---------------------------------------------------------------- Service worker
const ORIGIN = 'https://harborpath.test';

function makeWorker({ network }) {
  const stores = new Map(); // cacheName -> Map(path -> Response)
  const handlers = {};
  const keyOf = (req) => new URL(typeof req === 'string' ? req : req.url, ORIGIN).pathname;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        put: async (req, res) => { store.set(keyOf(req), res); },
        match: async (req) => store.get(keyOf(req))?.clone(),
        delete: async (req) => store.delete(keyOf(req)),
      };
    },
    async has(name) { return stores.has(name); },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
    async match(req, { cacheName } = {}) {
      const names = cacheName ? [cacheName] : [...stores.keys()];
      for (const n of names) {
        const hit = stores.get(n)?.get(keyOf(req));
        if (hit) return hit.clone();
      }
      return undefined;
    },
  };
  class FakeRequest {
    constructor(input, init = {}) {
      this.url = new URL(typeof input === 'string' ? input : input.url, ORIGIN).href;
      this.mode = init.mode ?? 'cors';
      this.method = init.method ?? 'GET';
      this.cache = init.cache ?? 'default';
      this.headers = new Headers(init.headers);
    }
  }
  const registration = { unregistered: false, unregister: async () => { registration.unregistered = true; return true; } };
  const self = {
    location: new URL(`${ORIGIN}/sw.js`),
    registration,
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (type, fn) => { handlers[type] = fn; },
  };
  const fetchLog = [];
  const fetchImpl = async (req) => {
    const r = typeof req === 'string' ? new FakeRequest(req) : req;
    fetchLog.push(new URL(r.url).pathname);
    return network(r);
  };
  const context = vm.createContext({
    self, caches, fetch: fetchImpl, Request: FakeRequest, Response, Headers, URL, JSON, Promise, Date, Number, String, Object, Error,
    setTimeout, clearTimeout,
  });
  vm.runInContext(swSource, context, { filename: 'sw.js' });

  async function dispatch(type, extra = {}) {
    const pending = [];
    let responded;
    const event = { ...extra, waitUntil: (p) => pending.push(p), respondWith: (p) => { responded = p; } };
    handlers[type](event);
    const response = responded ? await responded : undefined;
    await Promise.all(pending);
    return response;
  }
  const fetchEvent = (pathname, mode = 'cors') => dispatch('fetch', { request: new FakeRequest(pathname, { mode }) });
  return { stores, registration, dispatch, fetchEvent, fetchLog, cacheName: context.CACHE_NAME ?? vm.runInContext('CACHE_NAME', context) };
}

const okNetwork = (r) => new Response(`body of ${new URL(r.url).pathname}`, { status: 200 });
const offlineNetwork = () => Promise.reject(new TypeError('Failed to fetch'));

test('service worker: install saves the full shell under a versioned cache; activate removes old versions', async () => {
  const sw = makeWorker({ network: okNetwork });
  assert.match(sw.cacheName, /^harborpath-offline-v\d+$/);
  sw.stores.set('harborpath-offline-v1', new Map([['/index.html', new Response('old')]]));
  sw.stores.set('unrelated-cache', new Map());

  await sw.dispatch('install');
  const saved = sw.stores.get(sw.cacheName);
  for (const p of appShell) assert.ok(saved.has(p), `saved ${p}`);

  await sw.dispatch('activate');
  assert.deepEqual([...sw.stores.keys()].sort(), [sw.cacheName, 'unrelated-cache'].sort());
});

test('service worker: install fails as a whole if any shell file fails', async () => {
  const sw = makeWorker({ network: (r) => (r.url.endsWith('/js/views/plan.js') ? new Response('', { status: 503 }) : okNetwork(r)) });
  await assert.rejects(sw.dispatch('install'));
  assert.ok(!sw.stores.has(sw.cacheName), 'no partial copy is kept');
});

test('service worker: offline, pages and modules come from the saved copy', async () => {
  let online = true;
  const sw = makeWorker({ network: (r) => (online ? okNetwork(r) : offlineNetwork()) });
  await sw.dispatch('install');
  await sw.dispatch('activate');
  online = false;

  const page = await sw.fetchEvent('/?lang=es', 'navigate');
  assert.equal(await page.text(), 'body of /index.html');
  for (const p of ['/js/views/navigator.js', '/js/views/medications.js', '/js/views/plan.js', '/js/components/overdose.js', '/js/content/hotlines.js']) {
    const res = await sw.fetchEvent(p);
    assert.equal(await res.text(), `body of ${p}`);
  }
});

test('service worker: /api/ responses are never stored, and offline searches get phone alternatives', async () => {
  let online = true;
  const sw = makeWorker({
    network: (r) => {
      if (!online) return offlineNetwork();
      if (new URL(r.url).pathname.startsWith('/api/')) return new Response('{"results":[{"name":"Clinic near you"}]}', { status: 200 });
      return okNetwork(r);
    },
  });
  await sw.dispatch('install');
  await sw.dispatch('activate');

  const live = await sw.fetchEvent('/api/treatment?lat=40.71&lng=-74.01&radius=25');
  assert.match(await live.text(), /Clinic near you/);
  for (const store of sw.stores.values()) {
    for (const key of store.keys()) assert.ok(!key.startsWith('/api/'), `never cached ${key}`);
  }

  online = false;
  const res = await sw.fetchEvent('/api/geocode?q=98225');
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.offline, true);
  assert.match(body.error, /offline/i);
  assert.match(body.error, /1-800-662-4357/);
  assert.match(body.error, /988/);
  assert.match(body.error, /911/);
  assert.match(body.fallbackUrl, /^https:\/\/findtreatment\.gov\//);

  await sw.dispatch('message', { data: { type: 'lang', lang: 'es' } });
  const es = await (await sw.fetchEvent('/api/treatment?lat=1&lng=1')).json();
  assert.match(es.error, /sin conexión/);
  assert.match(es.error, /1-800-662-4357/);
});

test('service worker: Quick exit deletes every HarborPath cache, unregisters, and nothing is re-saved', async () => {
  const sw = makeWorker({ network: okNetwork });
  await sw.dispatch('install');
  await sw.dispatch('activate');
  sw.stores.set('harborpath-offline-v0', new Map());

  await sw.dispatch('message', { data: { type: 'wipe' } });
  assert.ok(sw.registration.unregistered, 'worker unregistered');
  assert.ok(![...sw.stores.keys()].some((k) => k.startsWith('harborpath-offline')), 'all offline caches deleted');

  // A page load that races the wipe must not bring the copy back.
  const res = await sw.dispatch('fetch', { request: { url: `${ORIGIN}/`, mode: 'navigate', method: 'GET', headers: new Headers() } });
  assert.equal(res, undefined, 'a wiped worker no longer handles requests');
  assert.ok(![...sw.stores.keys()].some((k) => k.startsWith('harborpath-offline')), 'still no offline cache');
});

test('service worker: an online page load refreshes the whole shell together, never recreating a deleted cache', async () => {
  const sw = makeWorker({ network: okNetwork });
  // Without a saved copy (for example, the page deleted it), loads re-save nothing.
  await sw.fetchEvent('/', 'navigate');
  assert.ok(!sw.stores.has(sw.cacheName));
  // Module requests are answered from the network but never saved one by one.
  await sw.dispatch('install');
  sw.stores.get(sw.cacheName).delete('/js/app.js');
  await sw.fetchEvent('/js/app.js');
  assert.ok(!sw.stores.get(sw.cacheName).has('/js/app.js'), 'single files are not saved individually');
});

test('manifest stays installable and same-origin', () => {
  const manifest = JSON.parse(readFileSync(path.join(publicDir, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  for (const icon of manifest.icons) assert.match(icon.src, /^\/[^/]/, 'icons are same-origin');
});
