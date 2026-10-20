// Client state. Location lives in memory only: it is never written to storage
// or the URL. Saved places stay in memory unless the visitor opts in to keeping
// them on this device.

const KEYS = { persist: 'hp:persist', saved: 'hp:saved' };
const listeners = new Set();

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* private mode or blocked */ }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export const state = {
  location: null, // { label, lat, lng }
  radius: 25,
  saved: new Map(),
  persist: safeGet(KEYS.persist) === '1',
};

if (state.persist) {
  try {
    for (const item of JSON.parse(safeGet(KEYS.saved) || '[]')) state.saved.set(item.id, item);
  } catch { /* corrupt entry: start fresh */ }
}

function emit() {
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setLocation(location) {
  state.location = location;
  emit();
}

export function setRadius(radius) {
  state.radius = radius;
  emit();
}

function writeSaved() {
  if (state.persist) safeSet(KEYS.saved, JSON.stringify([...state.saved.values()]));
}

export function isSaved(id) {
  return state.saved.has(id);
}

/** item: { id, kind: 'treatment' | 'health-center', name, ... } */
export function toggleSaved(item) {
  if (state.saved.has(item.id)) state.saved.delete(item.id);
  else state.saved.set(item.id, { ...item, savedAt: Date.now() });
  writeSaved();
  emit();
  return state.saved.has(item.id);
}

export function setPersist(on) {
  state.persist = on;
  if (on) {
    safeSet(KEYS.persist, '1');
    writeSaved();
  } else {
    safeRemove(KEYS.persist);
    safeRemove(KEYS.saved);
  }
  emit();
}

/** Forget everything this site stored, in memory and on the device. */
export function wipeAll() {
  state.location = null;
  state.saved.clear();
  state.persist = false;
  for (const key of Object.values(KEYS)) safeRemove(key);
  try { sessionStorage.clear(); } catch { /* ignore */ }
}
