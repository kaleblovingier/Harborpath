// Reuse the existing registry so older clinical modules and new integrations
// participate in one synchronous reset, even when a reset handler fails.
import { onQuickExit, runQuickExitHandlers } from './state.js';

export const registerQuickExitHandler = onQuickExit;

export function executeGlobalQuickExit() {
  runQuickExitHandlers();
}
