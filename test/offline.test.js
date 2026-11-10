import test from 'node:test';
import assert from 'node:assert/strict';

let sequence = 0;
async function withOffline(fn, { existing = false } = {}) {
  const names = ['navigator', 'caches', 'isSecureContext'];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const worker = Object.assign(new EventTarget(), { state: 'activated', postMessage() {} });
  const registration = { active: worker, unregister: async () => true };
  const sw = Object.assign(new EventTarget(), {
    controller: existing ? worker : null,
    getRegistration: async () => existing ? registration : undefined,
    getRegistrations: async () => [registration],
    register: async () => registration,
  });
  const values = { navigator: { serviceWorker: sw }, caches: { keys: async () => ['harborpath-offline-v4'], delete: async () => true }, isSecureContext: true };
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, value: values[name] });
  try {
    const offline = await import(`../public/js/offline.js?case=${++sequence}`);
    await fn({ offline, worker, sw });
  } finally {
    for (const name of names) {
      const descriptor = previous.get(name);
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

test('saving offline waits for page control before reporting success', () => withOffline(async ({ offline, sw, worker }) => {
  let ready = false;
  const saving = offline.saveOffline().then(() => { ready = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ready, false, 'an activated worker alone cannot yet serve this page offline');
  sw.controller = worker;
  sw.dispatchEvent(new Event('controllerchange'));
  await saving;
  assert.equal(ready, true);
}));

test('saved status recognizes a new opt-in after the initial registration lookup', () => withOffline(async ({ offline, sw, worker }) => {
  assert.equal(await offline.isOfflineSaved(), false);
  const saving = offline.saveOffline();
  sw.controller = worker;
  sw.dispatchEvent(new Event('controllerchange'));
  await saving;
  assert.equal(await offline.isOfflineSaved(), true);
  await offline.wipeOfflineCopy();
  assert.equal(await offline.isOfflineSaved(), false);
}));

test('an existing controlling worker does not wait for another controller event', () => withOffline(async ({ offline }) => {
  await offline.saveOffline();
  assert.equal(await offline.isOfflineSaved(), true);
}, { existing: true }));

// ---------------------------------------------------------------- Offline and low-bandwidth resilience
// - every module the app can load (static or dynamic import) exists and is in
//   one of the service worker's precache lists, and everything app.js loads up
//   front is in the critical APP_SHELL, so opt-in offline mode is complete;
// - the overdose steps and support lines render with no network at all, and a
//   page whose module fails to download still shows them;
// - the service worker saves a complete copy, cleans up old copies, never
//   stores /api/ responses, explains offline searches, and Quick exit removes
//   everything and unregisters.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const swSource = readFileSync(path.join(publicDir, 'sw.js'), 'utf8');
const shellList = (name) => [...swSource.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`))[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
const appShell = shellList('APP_SHELL');
const electiveShell = shellList('ELECTIVE_SHELL');

/**
 * Modules reachable from app.js. `modules` holds every one; `upFront` only
 * those reached through static imports (downloaded before the first page).
 */
function moduleGraph() {
  const modules = new Set();
  const upFront = new Set();
  const lazy = new Set();
  const visit = (urlPath, viaDynamic, parentUpFront) => {
    const isUpFront = parentUpFront && !viaDynamic;
    if (viaDynamic) lazy.add(urlPath);
    const seen = modules.has(urlPath) && (!isUpFront || upFront.has(urlPath));
    if (seen) return;
    const file = path.join(publicDir, urlPath);
    assert.ok(existsSync(file), `Imported module is missing: ${urlPath}`);
    modules.add(urlPath);
    if (isUpFront) upFront.add(urlPath);
    const src = readFileSync(file, 'utf8');
    const resolve = (spec) => path.posix.join(path.posix.dirname(urlPath), spec);
    for (const m of src.matchAll(/^\s*(?:import|export)\s[^'"`;]*?from\s+['"]([^'"]+)['"]/gm)) visit(resolve(m[1]), false, isUpFront);
    for (const m of src.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm)) visit(resolve(m[1]), false, isUpFront);
    for (const m of src.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) visit(resolve(m[1]), true, isUpFront);
    assert.doesNotMatch(src, /import\(\s*`/, `${urlPath} builds an import() path at run time; list it explicitly`);
  };
  visit('/js/app.js', false, true);
  return { modules, upFront, lazy };
}

test('every module the app can load is precached; everything loaded up front is in the critical tier', () => {
  const { modules, upFront } = moduleGraph();
  assert.ok(modules.size > 50, `walked ${modules.size} modules`);
  const listed = new Set([...appShell, ...electiveShell]);
  const missing = [...modules].filter((m) => !listed.has(m));
  assert.deepEqual(missing, [], `Add to APP_SHELL or ELECTIVE_SHELL in public/sw.js: ${missing.join(', ')}`);
  const notCritical = [...upFront].filter((m) => !appShell.includes(m));
  assert.deepEqual(notCritical, [], `Loaded before the first page, so add to APP_SHELL: ${notCritical.join(', ')}`);
  for (const required of ['/', '/index.html', '/styles.css', '/icons.svg', '/manifest.webmanifest', '/js/locales/es.js']) {
    assert.ok(appShell.includes(required), `APP_SHELL includes ${required}`);
  }
  assert.equal(new Set(appShell).size, appShell.length, 'APP_SHELL has no duplicates');
  assert.equal(new Set(electiveShell).size, electiveShell.length, 'ELECTIVE_SHELL has no duplicates');
  assert.deepEqual(electiveShell.filter((p) => appShell.includes(p)), [], 'no file is in both tiers');
  assert.ok(![...appShell, ...electiveShell].some((p) => p.startsWith('/api/')), 'the precache lists never name /api/');
});

test('heavy views load on demand; the overdose steps, crisis lines and Emergency drawer load with the app', () => {
  const { lazy, upFront } = moduleGraph();
  for (const view of ['/js/views/navigator.js', '/js/views/medications.js', '/js/views/plan.js']) {
    assert.ok(lazy.has(view), `${view} is loaded with import() when its route is visited`);
    assert.ok(!upFront.has(view), `${view} is not part of the first download`);
  }
  for (const mod of ['/js/views/core.js', '/js/components/overdose.js', '/js/components/emergencyDrawer.js', '/js/content/hotlines.js', '/js/views/common.js']) {
    assert.ok(upFront.has(mod), `${mod} is part of the first download`);
  }
  const app = readFileSync(path.join(publicDir, 'js/app.js'), 'utf8');
  assert.match(app, /^import \{[^}]*crisisView[^}]*\} from '\.\/views\/core\.js';$/m);
  assert.match(app, /^import \{ overdoseGuide \} from '\.\/components\/overdose\.js';$/m);
  assert.doesNotMatch(app, /import\('\.\/components\/emergencyDrawer\.js'\)/, 'the Emergency button never waits for a download');
});

// ---------------------------------------------------------------- Rendering with no network
class MockNode {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.attributes = {};
    this.children = [];
    this.dataset = {};
    this.className = '';
    this.style = {};
    this.listeners = {};
    this._text = '';
    const node = this;
    this.classList = {
      add: (...c) => { node.className = [...new Set([...node.className.split(' ').filter(Boolean), ...c])].join(' '); },
      remove: (...c) => { node.className = node.className.split(' ').filter((x) => x && !c.includes(x)).join(' '); },
      toggle: (c, force) => { const on = force ?? !node.className.split(' ').includes(c); (on ? node.classList.add : node.classList.remove)(c); return on; },
      contains: (c) => node.className.split(' ').includes(c),
    };
  }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this._text = String(v ?? ''); this.children = []; }
  get firstChild() { return this.children[0] ?? null; }
  get childNodes() { return this.children; }
  get isConnected() { return false; }
  setAttribute(k, v) { this.attributes[k] = String(v); if (k === 'id') this.id = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  hasAttribute(k) { return Object.hasOwn(this.attributes, k); }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  removeEventListener() {}
  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      const node = item instanceof MockNode ? item : Object.assign(new MockNode('#text'), { _text: String(item) });
      node.parent = this;
      this.children.push(node);
    }
  }
  appendChild(node) { this.append(node); return node; }
  replaceChildren(...items) { this.children = []; this.append(...items); }
  remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  closest() { return null; }
  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const c of this.children) c.findAll(pred, acc);
    return acc;
  }
}

async function withMockDom(fn) {
  const saved = { document: globalThis.document, Node: globalThis.Node, fetch: globalThis.fetch };
  const requests = [];
  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    createTextNode: (text) => Object.assign(new MockNode('#text'), { _text: String(text) }),
    createDocumentFragment: () => new MockNode('#fragment'),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    documentElement: new MockNode('html'),
  };
  globalThis.fetch = async (url) => { requests.push(String(url)); throw new TypeError('offline'); };
  try {
    await fn();
    // Give any stray async work a chance to run, then confirm nothing was fetched.
    await new Promise((r) => setTimeout(r, 20));
    assert.deepEqual(requests, [], 'no network requests while rendering emergency content');
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete globalThis[k];
      else globalThis[k] = v;
    }
  }
}

const hrefsIn = (root) => root.findAll((n) => n.tagName === 'A').map((a) => a.attributes.href);

test('overdose steps, 911, 988, and the SAMHSA helpline render without any network request', () => withMockDom(async () => {
  const { overdoseView } = await import('../public/js/views/guides.js');
  const { crisisView } = await import('../public/js/views/core.js');

  const od = overdoseView();
  const odText = od.textContent;
  assert.match(odText, /naloxone/i);
  assert.match(odText, /recovery position/i);
  assert.ok(hrefsIn(od).includes('tel:911'), 'overdose page links tel:911');

  const crisis = crisisView();
  const hrefs = hrefsIn(crisis);
  assert.ok(hrefs.includes('tel:911'), 'crisis page links tel:911');
  assert.ok(hrefs.includes('tel:988'), 'crisis page links tel:988');
  assert.ok(hrefs.includes('tel:18006624357'), 'crisis page links the SAMHSA helpline');
  assert.match(crisis.textContent, /1-800-662-4357/);
}));

test('a page whose module cannot download shows the emergency help and Try again, not "Page not found"', async () => {
  // Load app.js before the mock document exists, so its page wiring stays off.
  const { viewLoadFailed } = await import('../public/js/app.js');
  await withMockDom(() => viewLoadFailedChecks(viewLoadFailed));
});

function viewLoadFailedChecks(viewLoadFailed) {
  let retried = 0;
  const view = viewLoadFailed('Clinical care navigator (ASAM)', () => { retried += 1; });
  const hrefs = hrefsIn(view);
  for (const href of ['tel:911', 'tel:988', 'tel:18006624357', '#/overdose']) assert.ok(hrefs.includes(href), `links ${href}`);
  assert.match(view.textContent, /Clinical care navigator/);
  assert.match(view.textContent, /didn’t load/);
  const [button] = view.findAll((n) => n.tagName === 'BUTTON');
  assert.equal(button.textContent, 'Try again');
  const [click] = button.listeners.click;
  click({ preventDefault() {} });
  assert.equal(retried, 1, 'Try again retries the download in place (a reload with no signal would lose this page)');

  // On the overdose route the fallback is the step-by-step guide itself.
  const steps = viewLoadFailed('Overdose response', () => {}, { overdoseSteps: true });
  assert.match(steps.textContent, /naloxone/i);
  assert.match(steps.textContent, /recovery position/i);
  for (const href of ['tel:911', 'tel:988', 'tel:18006624357']) assert.ok(hrefsIn(steps).includes(href), `overdose fallback links ${href}`);

  const app = readFileSync(path.join(publicDir, 'js/app.js'), 'utf8');
  const render = app.slice(app.indexOf('async function render('), app.indexOf('// ---------------------------------------------------------------- Quick exit'));
  assert.match(render, /catch\(\(\) => \{ failed = true; return null; \}\)/);
  assert.match(render, /else if \(failed\) buildView = \(\) => viewLoadFailed\(resolved\.title, \(\) => render\(\), \{ overdoseSteps: resolved\.lazyPath === 'overdose' \}\);/);
  // The fallback goes through the same replaceChildren + focus path as any view.
  assert.match(render, /main\.replaceChildren\(buildView\(\)\);[\s\S]*routeFocusTarget\(main\)\?\.focus\(\{ preventScroll: true \}\)/);
}

// ---------------------------------------------------------------- Service worker
const ORIGIN = 'https://harborpath.test';

function makeWorker({ network }) {
  const stores = new Map(); // cacheName -> Map(path+search -> Response)
  const handlers = {};
  const keyOf = (req) => { const u = new URL(typeof req === 'string' ? req : req.url, ORIGIN); return u.pathname + u.search; };
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        put: async (req, res) => { store.set(keyOf(req), res); },
        add: async (req) => { const res = await fetchImpl(req); store.set(keyOf(req), res); },
        addAll: async (reqs) => { for (const req of reqs) await caches.open(name).then((c) => c.add(req)); },
        match: async (req) => store.get(keyOf(req))?.clone(),
        delete: async (req) => store.delete(keyOf(req)),
      };
    },
    async has(name) { return stores.has(name); },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
    async match(req) {
      for (const n of stores.keys()) {
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
  const fetchImpl = async (req, init) => {
    const r = typeof req === 'string' ? new FakeRequest(req, init) : req;
    fetchLog.push({ path: new URL(r.url).pathname, cache: r.cache });
    return network(r);
  };
  const context = vm.createContext({
    self, caches, fetch: fetchImpl, Request: FakeRequest, Response, Headers, URL, setTimeout, clearTimeout,
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
  const fetchEvent = (pathname, { mode = 'cors', headers } = {}) => dispatch('fetch', { request: new FakeRequest(pathname, { mode, headers }) });
  return { stores, registration, dispatch, fetchEvent, fetchLog, cacheName: vm.runInContext('CACHE_NAME', context) };
}

const okNetwork = (r) => new Response(`body of ${new URL(r.url).pathname}`, { status: 200 });
const offlineNetwork = () => Promise.reject(new TypeError('Failed to fetch'));

test('service worker: install saves the full shell, bypassing the HTTP cache; activate removes old copies', async () => {
  const sw = makeWorker({ network: okNetwork });
  assert.match(sw.cacheName, /^harborpath-offline-[0-9a-f]{12}$/);
  sw.stores.set('harborpath-offline-v2', new Map([['/index.html', new Response('old')]]));
  sw.stores.set('harborpath-offline-0123456789ab', new Map([['/index.html', new Response('old')]]));
  sw.stores.set('unrelated-cache', new Map());

  await sw.dispatch('install');
  const saved = sw.stores.get(sw.cacheName);
  for (const p of appShell) assert.ok(saved.has(p), `saved ${p}`);
  for (const p of appShell) {
    assert.ok(sw.fetchLog.some((f) => f.path === (p === '/' ? '/' : p) && f.cache === 'reload'), `${p} fetched with cache: 'reload'`);
  }

  await sw.dispatch('activate');
  assert.deepEqual([...sw.stores.keys()].sort(), [sw.cacheName, 'unrelated-cache'].sort());
  for (const p of electiveShell) assert.ok(saved.has(p), `elective ${p} warmed after activation`);
});

test('service worker: install fails as a whole if any critical file fails', async () => {
  const sw = makeWorker({ network: (r) => (r.url.endsWith('/js/components/overdose.js') ? new Response('', { status: 503 }) : okNetwork(r)) });
  await assert.rejects(sw.dispatch('install'));
  assert.ok(!sw.stores.has(sw.cacheName), 'no partial copy is kept');
});

test('service worker: a Quick exit during install leaves no copy and fails the install', async () => {
  let sw;
  let wipeSent = false;
  sw = makeWorker({
    network: async (r) => {
      if (!wipeSent) {
        wipeSent = true;
        await sw.dispatch('message', { data: { type: 'wipe' } });
      }
      return okNetwork(r);
    },
  });
  await assert.rejects(sw.dispatch('install'));
  assert.ok(![...sw.stores.keys()].some((k) => k.startsWith('harborpath-offline')), 'no offline cache');
  assert.ok(sw.registration.unregistered);
});

test('service worker: offline, pages and modules come from the saved copy', async () => {
  let online = true;
  const sw = makeWorker({ network: (r) => (online ? okNetwork(r) : offlineNetwork()) });
  await sw.dispatch('install');
  await sw.dispatch('activate');
  online = false;

  const page = await sw.fetchEvent('/?lang=es', { mode: 'navigate' });
  assert.equal(await page.text(), 'body of /index.html');
  for (const p of ['/js/views/navigator.js', '/js/views/medications.js', '/js/views/plan.js', '/js/views/populationHelpers.js', '/js/components/overdose.js', '/js/content/hotlines.js']) {
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
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  const body = await res.json();
  assert.equal(body.offline, true);
  assert.match(body.error, /offline/i);
  assert.match(body.error, /1-800-662-4357/);
  assert.match(body.error, /988/);
  assert.match(body.error, /911/);
  assert.match(body.fallbackUrl, /^https:\/\/findtreatment\.gov\//);

  // The page's own requests name the interface language...
  const viaHeader = await (await sw.fetchEvent('/api/treatment?lat=1&lng=1', { headers: { 'Accept-Language': 'es' } })).json();
  assert.match(viaHeader.error, /sin conexión/);
  assert.match(viaHeader.error, /1-800-662-4357/);
  assert.equal(viaHeader.fallbackUrl, 'https://findtreatment.gov/es');
  // ...and so does the page's message to the worker.
  await sw.dispatch('message', { data: { type: 'lang', lang: 'es' } });
  const viaMessage = await (await sw.fetchEvent('/api/treatment?lat=1&lng=1')).json();
  assert.match(viaMessage.error, /sin conexión/);
  await sw.dispatch('message', { data: { type: 'lang', lang: 'xx' } });
  assert.match((await (await sw.fetchEvent('/api/states', { headers: { 'Accept-Language': 'en' } })).json()).error, /offline/);
  for (const store of sw.stores.values()) {
    for (const key of store.keys()) assert.ok(!key.startsWith('/api/'), `never cached ${key}`);
  }
});

test('the page sends the interface language with its own API requests', () => {
  for (const file of ['js/api.js', 'js/regionsApi.js']) {
    const src = readFileSync(path.join(publicDir, file), 'utf8');
    assert.match(src, /headers: jsonHeaders\(\)/, `${file} uses jsonHeaders()`);
  }
  assert.match(readFileSync(path.join(publicDir, 'js/api.js'), 'utf8'), /'Accept-Language': getLang\(\)/);
});

test('service worker: Quick exit deletes every HarborPath cache, unregisters, and nothing is re-saved', async () => {
  const sw = makeWorker({ network: okNetwork });
  await sw.dispatch('install');
  await sw.dispatch('activate');
  sw.stores.set('harborpath-offline-v0', new Map());

  await sw.dispatch('message', { data: { type: 'wipe' } });
  assert.ok(sw.registration.unregistered, 'worker unregistered');
  assert.ok(![...sw.stores.keys()].some((k) => k.startsWith('harborpath-offline')), 'all offline caches deleted');

  // A page load or a search that races the wipe must not bring the copy back.
  for (const url of ['/', '/api/treatment?lat=1&lng=1']) {
    const res = await sw.dispatch('fetch', { request: { url: `${ORIGIN}${url}`, mode: 'navigate', method: 'GET', headers: new Headers() } });
    assert.equal(res, undefined, `a wiped worker no longer handles ${url}`);
  }
  assert.ok(![...sw.stores.keys()].some((k) => k.startsWith('harborpath-offline')), 'still no offline cache');
});

test('service worker: without a saved copy, page loads never create one', async () => {
  const sw = makeWorker({ network: okNetwork });
  // For example, the page deleted the copy: loads answer from the network and re-save nothing.
  await sw.fetchEvent('/', { mode: 'navigate' });
  await sw.fetchEvent('/js/app.js');
  assert.ok(!sw.stores.has(sw.cacheName));
});

test('manifest stays installable and same-origin', () => {
  const manifest = JSON.parse(readFileSync(path.join(publicDir, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.id, '/');
  for (const icon of manifest.icons) assert.match(icon.src, /^\/[^/]/, 'icons are same-origin');
});
