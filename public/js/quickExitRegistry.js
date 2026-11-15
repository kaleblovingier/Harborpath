// Reuse the existing registry so older clinical modules and new integrations
// participate in one synchronous reset, even when a reset handler fails.
import { onQuickExit, runQuickExitHandlers } from './state.js';

// Loaded modules register their named reset here. Do not eagerly import clinical
// views: Quick Exit must work offline and never initiate a request on the way out.
const registered = new Map();
export const CLINICAL_RESET_NAMES = Object.freeze([
  'resetNavigatorState', 'resetInsuranceState', 'resetGuidedNavigatorState',
  'resetWithdrawalPlannerState', 'resetClinicalScoresState',
  'resetPharmacologyState', 'resetSafetyPlanState', 'resetOverdoseTimerState',
]);

export function registerQuickExitHandler(reset) {
  if (typeof reset !== 'function') throw new TypeError('Quick Exit reset must be a function');
  registered.set(reset.name, reset);
  const unregister = onQuickExit(reset);
  return () => {
    if (registered.get(reset.name) === reset) registered.delete(reset.name);
    unregister?.();
  };
}

export function getRegisteredQuickExitHandlers() {
  return [...registered.keys()];
}

export function executeGlobalQuickExit() {
  runQuickExitHandlers();
}
