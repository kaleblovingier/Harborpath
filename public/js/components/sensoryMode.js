import { h, announce } from '../dom.js';
import { t } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetSensoryMode);

let sensoryModeEnabled = false;
const listeners = new Set();
let hotkeyBound = false;

function updateClassList(el, className, active) {
  if (!el) return;
  if (el.classList && typeof el.classList.toggle === 'function') {
    el.classList.toggle(className, active);
  } else {
    const raw = (el.className || (typeof el.getAttribute === 'function' ? el.getAttribute('class') : '') || '');
    const classes = raw.split(/\s+/).filter(Boolean);
    const idx = classes.indexOf(className);
    if (active && idx === -1) {
      classes.push(className);
      const val = classes.join(' ');
      el.className = val;
      if (typeof el.setAttribute === 'function') el.setAttribute('class', val);
    } else if (!active && idx !== -1) {
      classes.splice(idx, 1);
      const val = classes.join(' ');
      el.className = val;
      if (typeof el.setAttribute === 'function') el.setAttribute('class', val);
    }
  }
}

function applySensoryClass(enabled) {
  if (typeof document === 'undefined') return;
  if (document.body) {
    updateClassList(document.body, 'sensory-mode-active', enabled);
  }
  if (document.documentElement) {
    updateClassList(document.documentElement, 'sensory-mode-active', enabled);
  }
}

export function getSensoryModeState() {
  return {
    enabled: sensoryModeEnabled,
    active: sensoryModeEnabled,
  };
}

export function getSensoryMode() {
  return sensoryModeEnabled;
}

export function setSensoryMode(enabled) {
  sensoryModeEnabled = Boolean(enabled);
  applySensoryClass(sensoryModeEnabled);
  for (const fn of listeners) {
    try {
      fn(sensoryModeEnabled);
    } catch {
      /* subscriber safety */
    }
  }
  return sensoryModeEnabled;
}

export function toggleSensoryMode() {
  const next = !sensoryModeEnabled;
  setSensoryMode(next);
  const msg = next
    ? t('sensory.enabled', 'Calm sensory mode enabled. Motion and contrast softened.')
    : t('sensory.disabled', 'Calm sensory mode disabled.');
  try {
    announce(msg);
  } catch {
    /* announcer optional */
  }
  return next;
}

export function resetSensoryMode() {
  return setSensoryMode(false);
}

export function subscribeSensoryMode(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function handleSensoryKeydown(e) {
  if (!e) return;
  if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    toggleSensoryMode();
  }
}

export function initSensoryHotkeys() {
  if (hotkeyBound || typeof window === 'undefined') return;
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('keydown', handleSensoryKeydown);
    hotkeyBound = true;
  }
}

export function removeSensoryHotkeys() {
  if (!hotkeyBound || typeof window === 'undefined') return;
  if (typeof window.removeEventListener === 'function') {
    window.removeEventListener('keydown', handleSensoryKeydown);
    hotkeyBound = false;
  }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  initSensoryHotkeys();
}

export function sensoryModeToggle(options = {}) {
  initSensoryHotkeys();
  const id = options.id || 'sensory-mode-toggle';
  const labelText = options.label || t('sensory.toggleLabel', 'Calm Mode');
  const activeLabel = options.activeLabel || t('sensory.toggleActive', 'Calm Mode Active');
  const tooltipText = t(
    'sensory.tooltip',
    'Calming sensory mode for withdrawal, sensory overload, migraine, or anxiety. Alt+S'
  );

  const textSpan = h('span', { class: 'sensory-toggle-text' }, sensoryModeEnabled ? activeLabel : labelText);
  const kbdSpan = h('kbd', { class: 'sensory-hotkey-badge' }, 'Alt+S');
  const tooltip = h(
    'span',
    {
      id: `${id}-tooltip`,
      class: 'sensory-tooltip',
      role: 'tooltip',
    },
    tooltipText
  );

  const button = h(
    'button',
    {
      type: 'button',
      id,
      class: options.class ? `btn sensory-mode-toggle ${options.class}` : 'btn sensory-mode-toggle',
      'aria-pressed': sensoryModeEnabled ? 'true' : 'false',
      'aria-keyshortcuts': 'Alt+S',
      'aria-describedby': `${id}-tooltip`,
      title: `${labelText} (Alt+S)`,
      onclick: () => toggleSensoryMode(),
    },
    textSpan,
    kbdSpan,
    tooltip
  );

  if (sensoryModeEnabled) {
    updateClassList(button, 'active', true);
  }

  const unsubscribe = subscribeSensoryMode((active) => {
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    updateClassList(button, 'active', active);
    textSpan.textContent = active ? activeLabel : labelText;
    button.setAttribute('title', `${active ? activeLabel : labelText} (Alt+S)`);
  });

  button._unsubscribeSensory = unsubscribe;
  return button;
}
