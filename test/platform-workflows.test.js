import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { preloadRoute, resolveRoute, ROUTE_TITLES, runQuickExitResets } from '../public/js/app.js';
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
function offlineWorker() {
  const origin = 'https://harborpath.test';
  const listeners = new Map();
  const stores = new Map([['unrelated-cache', new Map()]]);
  const key = (request) => new URL(typeof request === 'string' ? request : request.url, origin).href;
  let online = true;
  let unregistered = false;
  let networkCalls = 0;

  async function fetchAsset(request) {
    networkCalls++;
    if (!online) throw new Error('No signal');
    const pathname = new URL(key(request)).pathname;
    return new Response(readPublic(pathname === '/' ? '/index.html' : pathname));
  }

  const caches = {
    async keys() { return [...stores.keys()]; },
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

  async function dispatchFetch(url, options = {}) {
    let response;
    listeners.get('fetch')({
      request: new Request(new URL(url, origin), options),
      respondWith: (promise) => { response = promise; },
    });
    return response;
  }

  return {
    lifecycle,
    dispatchFetch,
    goOffline: () => { online = false; },
    cacheKeys: () => caches.keys(),
    cached: (url) => caches.match(url),
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
