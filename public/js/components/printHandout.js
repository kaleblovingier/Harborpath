import { registerQuickExitHandler } from '../quickExitRegistry.js';

let sheet = null;

export function resetPrintHandoutState() {
  sheet?.replaceChildren();
  sheet?.remove();
  sheet = null;
  if (typeof document !== 'undefined') document.body?.classList.remove('hp-printing-handout');
}

registerQuickExitHandler(resetPrintHandoutState);

// Isolate one visible summary from the surrounding reference guide. No copies
// are stored, transmitted, or kept in a detached DOM after the dialog closes.
export function printClinicalHandout(element) {
  if (!element || typeof window === 'undefined' || typeof window.print !== 'function') return;
  resetPrintHandoutState();
  sheet = document.createElement('section');
  sheet.className = 'hp-print-sheet print-handout';
  sheet.append(element.cloneNode(true));
  document.body.append(sheet);
  document.body.classList.add('hp-printing-handout');
  try { window.print(); } finally { resetPrintHandoutState(); }
}
