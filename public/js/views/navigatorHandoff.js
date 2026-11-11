// Clinical handoffs live only in this module's RAM. The router imports this
// small module without loading the assessment view or its clinical engines.
let currentNavigatorState = null;
const resetCallbacks = new Set();

const CODE_ALIASES = Object.freeze({ BUP: 'BU', METH: 'OTP', YAD: 'YA' });

export function normalizeNavigatorCodes(codes = []) {
  if (!Array.isArray(codes) && !(codes instanceof Set)) return [];
  const clean = [];
  for (const raw of codes) {
    const value = String(raw ?? '').trim().toUpperCase();
    const code = CODE_ALIASES[value] ?? value;
    if (/^[A-Z0-9_]+$/.test(code) && !clean.includes(code)) clean.push(code);
  }
  return clean.slice(0, 8);
}

export function getNavigatorHandoffState() {
  return currentNavigatorState ? structuredClone(currentNavigatorState) : null;
}

export function setNavigatorHandoffState(next) {
  if (!next || typeof next !== 'object') {
    currentNavigatorState = null;
    return null;
  }
  const recommendation = next.recommendation ?? null;
  currentNavigatorState = structuredClone({
    ...next,
    codes: normalizeNavigatorCodes(next.codes ?? recommendation?.codes),
    broadCodes: normalizeNavigatorCodes(next.broadCodes ?? recommendation?.broadCodes),
    populationPathways: next.populationPathways ?? recommendation?.populationPathways ?? [],
    updatedAt: Number.isFinite(next.updatedAt) ? next.updatedAt : Date.now(),
  });
  return getNavigatorHandoffState();
}

export function onNavigatorReset(callback) {
  if (typeof callback === 'function') resetCallbacks.add(callback);
  return () => resetCallbacks.delete(callback);
}

export function resetNavigatorState() {
  currentNavigatorState = null;
  for (const callback of [...resetCallbacks]) {
    try { callback(); } catch { /* Clear every mounted assessment. */ }
  }
  currentNavigatorState = null;
}
