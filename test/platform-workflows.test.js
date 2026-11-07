import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import {
  LAZY_LOADERS, preloadRoute, resolveRoute, ROUTE_TITLES, runQuickExitResets, shouldPreloadOnIntent, showViewLoading,
} from '../public/js/app.js';
import { onQuickExit } from '../public/js/state.js';
import { readdirSync } from 'node:fs';
import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readPublic = (url) => readFileSync(path.join(root, 'public', url), 'utf8');

afterEach(() => useDictionary('en', {}));

test('care discovery and care-team routes load through the app and have localized titles', async () => {
  const tools = await import('../public/js/views/tools.js');
  const workspace = await import('../public/js/views/workspace.js');
  for (const [route, expectedView] of [
    ['tools', tools.careToolsView],
    ['workspace', workspace.careWorkspaceView],
  ]) {
    assert.equal(await preloadRoute(route), expectedView, `${route} resolves the intended view`);
    const englishTitle = ROUTE_TITLES[route]();
    const resolved = resolveRoute(route, new URLSearchParams());
    assert.equal(resolved.lazyPath, null, `${route} is ready after preloading`);
    assert.equal(typeof resolved.view, 'function');
    useDictionary('es', es);
    assert.notEqual(ROUTE_TITLES[route](), englishTitle, `${route} has a Spanish page title`);
    useDictionary('en', {});
  }
});

test('each care-tool destination resolves to a real route with Spanish catalog text', async () => {
  const { TOOL_CATALOG } = await import('../public/js/views/tools.js');
  assert.ok(TOOL_CATALOG.length > 0);
  for (const tool of TOOL_CATALOG) {
    const route = tool.path.replace(/^#?\//, '').split('?')[0];
    assert.ok(Object.hasOwn(ROUTE_TITLES, route), `${tool.id} leads to a known route: ${tool.path}`);
    for (const key of [tool.titleKey, tool.descriptionKey]) {
      assert.equal(typeof es[key], 'string', `${tool.id} has Spanish catalog text for ${key}`);
      assert.ok(es[key].trim(), `${key} is not empty`);
    }
  }
});

test('tool discovery filters by translated labels without mutating the catalog or using a server', async () => {
  const { TOOL_CATALOG, filterCareTools } = await import('../public/js/views/tools.js');
  const snapshot = JSON.stringify(TOOL_CATALOG);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Tool filtering must remain on this device'); };
  try {
    const target = TOOL_CATALOG[0];
    assert.ok(filterCareTools({ query: target.title.toUpperCase() }).some((tool) => tool.id === target.id));
    useDictionary('es', es);
    assert.ok(es[target.titleKey], `${target.titleKey} has a Spanish translation`);
    assert.ok(filterCareTools({ query: es[target.titleKey] }).some((tool) => tool.id === target.id));
    assert.deepEqual(filterCareTools({ query: 'no-such-tool-7fa203' }), []);
    assert.equal(JSON.stringify(TOOL_CATALOG), snapshot, 'filtering preserves all source records');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('audience and topic filters keep clinician-only tools discoverable in the appropriate workflow', async () => {
  const { filterCareTools } = await import('../public/js/views/tools.js');
  const forMe = filterCareTools({ audience: 'individual' }).map((tool) => tool.id);
  const careTeam = filterCareTools({ audience: 'care-team', category: 'planning' }).map((tool) => tool.id);
  assert.ok(forMe.includes('guided'), 'people seeking care can find the plain-language starting point');
  assert.ok(!forMe.includes('assessment'), 'the individual filter does not present clinician-only screening');
  assert.ok(careTeam.includes('workspace'), 'care teams can find the handoff checklist');
  assert.ok(!careTeam.includes('assessment'), 'the planning topic excludes assessment tools');
  useDictionary('es', es);
  assert.ok(filterCareTools({ query: 'atencion', category: 'care' }).some((tool) => tool.id === 'match'),
    'Spanish search works when an accent is omitted');
});

test('Quick Exit clears a loaded care-team checklist without persisting it or making requests', async () => {
  await preloadRoute('workspace');
  const {
    CARE_WORKSPACE_STAGES,
    getCareWorkspaceState,
    setCareWorkspaceTask,
    resetCareWorkspaceState,
  } = await import('../public/js/views/workspace.js');
  const firstTask = CARE_WORKSPACE_STAGES.flatMap((stage) => stage.tasks)[0];
  assert.ok(firstTask?.id, 'the checklist exposes a task to exercise');
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  const originalSessionStorage = globalThis.sessionStorage;
  let writes = 0;
  globalThis.fetch = () => { throw new Error('Checklist state must remain on this device'); };
  globalThis.localStorage = { getItem: () => null, removeItem() {}, setItem() { writes++; } };
  globalThis.sessionStorage = { clear() {}, setItem() { writes++; } };
  try {
    resetCareWorkspaceState();
    setCareWorkspaceTask(firstTask.id, true);
    assert.ok(getCareWorkspaceState().checked.includes(firstTask.id));
    runQuickExitResets();
    assert.deepEqual(getCareWorkspaceState().checked, [], 'new workflow state clears before navigation can replace the document');
    // Let the pre-existing asynchronous legacy reset handlers settle as well.
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(getCareWorkspaceState().checked, []);
    assert.equal(writes, 0, 'the checklist never opts a visitor into browser storage');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalStorage;
    if (originalSessionStorage === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = originalSessionStorage;
    resetCareWorkspaceState();
  }
});

// Exercise the actual worker lifecycle with deterministic local file responses.
// This catches an asset omitted from the offline tiers without contacting a
// public service or depending on a browser/third-party test package.
// `timers` replaces setTimeout/clearTimeout inside the worker, so the network
// timeout can be driven without waiting in real time.
function offlineWorker({ timers = { setTimeout, clearTimeout } } = {}) {
  const origin = 'https://harborpath.test';
  const listeners = new Map();
  const stores = new Map([['unrelated-cache', new Map()]]);
  const key = (request) => new URL(typeof request === 'string' ? request : request.url, origin).href;
  let network = 'online';
  let unregistered = false;
  let networkCalls = 0;
  const hanging = [];

  async function fetchAsset(request) {
    networkCalls++;
    if (network === 'offline') throw new Error('No signal');
    const pathname = new URL(key(request)).pathname;
    const response = () => new Response(readPublic(pathname === '/' ? '/index.html' : pathname));
    if (network === 'hang') return new Promise((resolve) => hanging.push(() => resolve(response())));
    return response();
  }

  const caches = {
    async keys() { return [...stores.keys()]; },
    async has(name) { return stores.has(name); },
    async delete(name) { return stores.delete(name); },
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        async add(url) { entries.set(key(url), await fetchAsset(url)); },
        async addAll(urls) {
          for (const url of urls) entries.set(key(url), await fetchAsset(url));
        },
        async put(request, response) { entries.set(key(request), response.clone()); },
      };
    },
    async match(request) {
      for (const entries of stores.values()) {
        const response = entries.get(key(request));
        if (response) return response.clone();
      }
      return undefined;
    },
  };

  vm.runInNewContext(readPublic('/sw.js'), {
    URL,
    caches,
    fetch: fetchAsset,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    self: {
      location: { origin },
      addEventListener: (name, listener) => listeners.set(name, listener),
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
      registration: { unregister: async () => { unregistered = true; } },
    },
  }, { filename: 'public/sw.js' });

  async function lifecycle(name, extra = {}) {
    const pending = [];
    listeners.get(name)({ ...extra, waitUntil: (promise) => pending.push(promise) });
    await Promise.all(pending);
  }

  const background = [];
  async function dispatchFetch(url, options = {}) {
    let response;
    listeners.get('fetch')({
      request: new Request(new URL(url, origin), options),
      respondWith: (promise) => { response = promise; },
      waitUntil: (promise) => background.push(promise),
    });
    return response;
  }

  return {
    lifecycle,
    dispatchFetch,
    // Wait for background cache updates started by fetches.
    settle: () => Promise.all(background.splice(0)),
    goOffline: () => { network = 'offline'; },
    stall: () => { network = 'hang'; },
    // Let every stalled request answer.
    release: () => { for (const answer of hanging.splice(0)) answer(); },
    cacheKeys: () => caches.keys(),
    deleteCache: (name) => caches.delete(name),
    cached: (url) => caches.match(url),
    forget: (url) => { for (const entries of stores.values()) entries.delete(key(url)); },
    networkCalls: () => networkCalls,
    isUnregistered: () => unregistered,
  };
}

test('offline activation makes the new workflows and Spanish content available without caching APIs', async () => {
  const worker = offlineWorker();
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  worker.goOffline();
  for (const url of [
    '/js/views/tools.js',
    '/js/views/workspace.js',
    '/js/components/sourceContext.js',
    '/js/locales/es.js',
    '/js/locales/es-workspace.js',
    '/js/locales/es-evidence.js',
  ]) {
    const response = await worker.dispatchFetch(url);
    assert.ok(response, `${url} is available with no signal`);
    assert.equal(await response.text(), readPublic(url), `${url} serves the exact cached module`);
  }

  const callsBeforeApi = worker.networkCalls();
  const apiUrl = '/api/nearby-summary?lat=47.61&lng=-122.33&radius=25';
  assert.equal(await worker.dispatchFetch(apiUrl), undefined, 'API calls bypass the worker entirely');
  assert.equal(await worker.cached(apiUrl), undefined, 'location-based API results never enter the cache');
  assert.equal(worker.networkCalls(), callsBeforeApi);
  assert.equal(await worker.dispatchFetch('/js/views/tools.js', { method: 'POST' }), undefined);
  assert.equal(await worker.dispatchFetch('https://outside.test/asset.js'), undefined);
});

test('offline Quick Exit removes the new workflow copies and leaves unrelated caches intact', async () => {
  const worker = offlineWorker();
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  assert.ok(await worker.cached('/js/views/workspace.js'));
  await worker.lifecycle('message', { data: { type: 'wipe' } });
  assert.deepEqual(await worker.cacheKeys(), ['unrelated-cache']);
  assert.equal(await worker.cached('/js/views/workspace.js'), undefined);
  assert.equal(await worker.cached('/js/locales/es-workspace.js'), undefined);
  assert.equal(worker.isUnregistered(), true);
});

test('after a Quick Exit wipe the worker passes requests through and never saves again', async () => {
  const worker = offlineWorker();
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  await worker.lifecycle('message', { data: { type: 'wipe' } });
  assert.deepEqual(await worker.cacheKeys(), ['unrelated-cache']);

  // Quick Exit used to re-import modules right after the wipe; through a still
  // controlling worker that re-created the offline copy.
  for (const url of ['/js/views/plan.js', '/js/app.js', '/', '/js/locales/es.js']) {
    assert.equal(await worker.dispatchFetch(url), undefined, `${url} goes straight to the network`);
  }
  await worker.settle();
  assert.deepEqual(await worker.cacheKeys(), ['unrelated-cache'], 'no offline copy is re-created');
  assert.equal(await worker.cached('/js/views/plan.js'), undefined);
});

test('a page-side wipe also stops later responses from being saved', async () => {
  const worker = offlineWorker();
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  const own = (await worker.cacheKeys()).filter((k) => k.startsWith('harborpath-offline'));
  assert.equal(own.length, 1, 'one versioned offline copy');
  assert.match(own[0], /^harborpath-offline-[0-9a-f]{12}$/);
  // wipeOfflineCopy() deletes the caches from the page as well, in case the
  // worker never receives its message. A request still in flight must not
  // bring the copy back.
  await worker.deleteCache(own[0]);
  const response = await worker.dispatchFetch('/js/views/plan.js');
  assert.ok(await response);
  await worker.settle();
  assert.deepEqual(await worker.cacheKeys(), ['unrelated-cache']);
});

test('the shell answers from the saved copy when the network stalls past the timeout', async () => {
  const pending = [];
  const timers = {
    setTimeout: (fn, ms, ...args) => { pending.push({ fn, ms, args }); return pending.length; },
    clearTimeout: () => {},
  };
  const worker = offlineWorker({ timers });
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  worker.stall();
  for (const url of ['/js/components/overdose.js', '/']) {
    pending.length = 0;
    // dispatchFetch resolves to the respondWith() answer, so do not await it
    // until the network timeout the worker armed has fired.
    const answer = worker.dispatchFetch(url);
    await new Promise((resolve) => setImmediate(resolve));
    const timer = pending.find((entry) => entry.ms === 3000);
    assert.ok(timer, `${url} arms a 3 second network timeout`);
    timer.fn(...timer.args);
    const answered = await answer;
    assert.equal(await answered.text(), readPublic(url === '/' ? '/index.html' : url), `${url} is served from the saved copy`);
  }

  // The stalled network answer still refreshes the saved copy in the background.
  worker.forget('/js/components/overdose.js');
  worker.release();
  await worker.settle();
  assert.ok(await worker.cached('/js/components/overdose.js'), 'late network response updates the cache');
});

test('a slow shell request with nothing saved keeps waiting for the network', async () => {
  const pending = [];
  const timers = {
    setTimeout: (fn, ms, ...args) => { pending.push({ fn, ms, args }); return pending.length; },
    clearTimeout: () => {},
  };
  const worker = offlineWorker({ timers });
  await worker.lifecycle('install');
  worker.forget('/js/app.js');
  worker.stall();
  const answer = worker.dispatchFetch('/js/app.js');
  await new Promise((resolve) => setImmediate(resolve));
  const timer = pending.find((entry) => entry.ms === 3000);
  timer.fn(...timer.args);
  let settled = false;
  answer.then(() => { settled = true; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(settled, false, 'nothing saved, so the worker waits instead of failing');
  worker.release();
  assert.equal(await (await answer).text(), readPublic('/js/app.js'));
});

test('elective modules stay network-first and fall back to the saved copy offline', async () => {
  const worker = offlineWorker();
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  worker.goOffline();
  const response = await worker.dispatchFetch('/js/views/plan.js');
  assert.equal(await response.text(), readPublic('/js/views/plan.js'));
  await worker.settle();
});

// ------------------------------------------------------------ Quick Exit registry

test('Quick Exit runs the resets of loaded modules, isolates failures, and imports nothing', () => {
  const calls = [];
  const offA = onQuickExit(() => calls.push('a'));
  const offBroken = onQuickExit(() => { throw new Error('broken reset'); });
  const offB = onQuickExit(() => calls.push('b'));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Quick Exit must not make requests'); };
  try {
    assert.doesNotThrow(() => runQuickExitResets());
    assert.deepEqual(calls, ['a', 'b'], 'a failing reset does not stop the others');
  } finally {
    globalThis.fetch = originalFetch;
    offA(); offBroken(); offB();
  }
  const app = readPublic('/js/app.js');
  const body = app.match(/export function runQuickExitResets\(\)\s*\{([\s\S]*?)\n\}/)[1];
  assert.doesNotMatch(body, /import\(/, 'no module is fetched (and re-saved offline) on the way out');
});

test('every module with a reset registers it for Quick Exit (lazy loader or onQuickExit)', () => {
  const app = readPublic('/js/app.js');
  const viaLoader = new Set([...app.matchAll(/import\('\.\/([^']+)'\)\.then\(\(m\) => \{[^}]*?routeResets\.set\(/g)].map((m) => m[1]));
  const missing = [];
  const walk = (dir) => {
    for (const entry of readdirSync(path.join(root, 'public', 'js', dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(rel);
      else if (rel.endsWith('.js')) {
        const src = readPublic(`/js/${rel}`);
        if (!/^export function reset\w*\(/m.test(src)) continue;
        if (viaLoader.has(rel) || /^onQuickExit\(\w+\);/m.test(src)) continue;
        missing.push(rel);
      }
    }
  };
  walk('');
  assert.deepEqual(missing, [], 'modules whose in-memory state Quick Exit would leave behind');
});

// ------------------------------------------------------------ Lazy view loading

test('lazy views are not all downloaded on page load', () => {
  const app = readPublic('/js/app.js');
  const startup = app.slice(app.indexOf('initI18n().finally('));
  assert.doesNotMatch(startup, /preloadAllLazyViews\(/, 'no eager preload after first paint');
  assert.doesNotMatch(app, /requestIdleCallback/, 'no idle-time bulk download');
  assert.match(app, /if \(LAZY_LOADERS\[path\] && shouldPreloadOnIntent\(\)\) preloadRoute\(path\)/,
    'hover/focus intent preloading remains, behind the data-saver check');
  // The opt-in offline copy does not depend on the page preloading: every lazy
  // view module is in one of the worker's precache lists.
  const sw = readPublic('/sw.js');
  for (const [route, loader] of Object.entries(LAZY_LOADERS)) {
    const specifier = loader.toString().match(/import\('\.\/([^']+)'\)/)?.[1] ?? 'views/guides.js';
    assert.ok(sw.includes(`'/js/${specifier}'`), `${route} (${specifier}) is precached by the offline worker`);
  }
});

test('intent preloading is skipped on Save-Data and 2G connections', () => {
  assert.equal(shouldPreloadOnIntent(undefined), true, 'no Network Information API: preload');
  assert.equal(shouldPreloadOnIntent({ effectiveType: '4g', saveData: false }), true);
  assert.equal(shouldPreloadOnIntent({ effectiveType: '3g' }), true);
  assert.equal(shouldPreloadOnIntent({ effectiveType: '4g', saveData: true }), false);
  assert.equal(shouldPreloadOnIntent({ effectiveType: '2g' }), false);
  assert.equal(shouldPreloadOnIntent({ effectiveType: 'slow-2g' }), false);
});

test('a loading lazy view marks main busy with a localized status', () => {
  const previous = globalThis.document;
  const element = (tag) => ({
    tagName: tag.toUpperCase(), attributes: {}, children: [], className: '', textContent: '',
    setAttribute(name, value) { this.attributes[name] = String(value); },
    removeAttribute(name) { delete this.attributes[name]; },
    replaceChildren(...nodes) { this.children = nodes; },
  });
  globalThis.document = { createElement: element };
  try {
    const main = element('main');
    main.children = ['previous view'];
    const status = showViewLoading(main);
    assert.equal(main.attributes['aria-busy'], 'true');
    assert.deepEqual(main.children, [status]);
    assert.equal(status.attributes.role, 'status');
    assert.equal(status.textContent, 'Loading…');
    useDictionary('es', es);
    assert.equal(showViewLoading(element('main')).textContent, es['app.loadingView']);
    assert.equal(es['app.loadingView'], 'Cargando…');
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
  const app = readPublic('/js/app.js');
  assert.match(app, /showViewLoading\(main\);\s*const loadedView = await preloadRoute/);
  assert.match(app, /if \(token !== renderSeq\) return;\s*main\.removeAttribute\('aria-busy'\);/);
});

// ------------------------------------------------------------ Offline cache version

test('the offline cache name carries the current content hash of every shell file', async () => {
  const { computeShellHash, readSwBuild } = await import('../scripts/build-check.mjs');
  const sw = readPublic('/sw.js');
  assert.match(sw, /const CACHE_NAME = `\$\{CACHE_PREFIX\}-\$\{BUILD\}`;/);
  assert.equal(readSwBuild(sw), computeShellHash(sw), 'public/sw.js BUILD is stale: run `npm run stamp:sw`');
  // Any change to a saved file changes the hash.
  const duplicated = sw.replace(/(const ELECTIVE_SHELL = \[[\s\S]*?)\];/, "$1  '/js/dom.js',\n];");
  assert.notEqual(duplicated, sw);
  assert.equal(computeShellHash(duplicated), computeShellHash(sw), 'a file listed twice counts once');
  const fewer = sw.replace(/(const ELECTIVE_SHELL = \[\n)\s*'[^']+',\n/, '$1');
  assert.notEqual(fewer, sw);
  assert.notEqual(computeShellHash(fewer), computeShellHash(sw), 'the file list is part of the hash');
});
