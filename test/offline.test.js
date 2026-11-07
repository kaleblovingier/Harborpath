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
