// Spanish coverage for safety-critical paths. Renders the overdose route, the
// harm reduction and support guides, and the guided navigator crisis intercept
// with the Spanish dictionary loaded, and asserts that key safety instructions
// appear in Spanish and the English "Call 911" labels do not leak through.
// Also guards against language-detection shortcuts that silently stay English.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { useDictionary, getLang, setPlainLanguage } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import esSafety from '../public/js/locales/es-safety.js';
import { overdoseView, harmReductionView, supportView } from '../public/js/views/guides.js';
import {
  detectCrisisOrOverdose,
  guidedNavigatorView,
  setGuidedNavigatorState,
  resetGuidedNavigatorState,
} from '../public/js/views/guidedNavigator.js';
import { resetOverdosePacer } from '../public/js/components/overdosePacing.js';
import { adhdCareView } from '../public/js/views/adhdCare.js';
import { benzodiazepineCareView } from '../public/js/views/benzodiazepineCare.js';
import { getAdolescentState, adolescentCareView, resetAdolescentState } from '../public/js/views/adolescentCare.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, '..');

// ============================================================================
// Lightweight mock DOM (same shape as test/overdose-route.test.js)
// ============================================================================

class MockClassList {
  constructor(node) {
    this.node = node;
  }
  _getClasses() {
    return (this.node.className || '').split(/\s+/).filter(Boolean);
  }
  _setClasses(classes) {
    this.node.className = classes.join(' ');
  }
  add(...tokens) {
    const list = this._getClasses();
    for (const t of tokens) {
      if (t && !list.includes(t)) list.push(t);
    }
    this._setClasses(list);
  }
  remove(...tokens) {
    const list = this._getClasses().filter((c) => !tokens.includes(c));
    this._setClasses(list);
  }
  contains(token) {
    return this._getClasses().includes(token);
  }
  toggle(token, force) {
    const exists = this.contains(token);
    const shouldAdd = force !== undefined ? Boolean(force) : !exists;
    if (shouldAdd) this.add(token);
    else this.remove(token);
    return shouldAdd;
  }
}

class MockNode {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.className = '';
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.value = '';
    this.id = '';
    this.tabIndex = 0;
    this.disabled = false;
    this.checked = false;
    this._textContent = '';
    this.classList = new MockClassList(this);
    this.parent = null;
  }

  get parentNode() {
    return this.parent;
  }

  get parentElement() {
    return this.parent;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get isConnected() {
    return true;
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'id') this.id = val;
  }

  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    if (k === 'id') return this.id || this.attributes.id || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  hasAttribute(k) {
    if (k === 'class') return Boolean(this.className || this.attributes.class);
    if (k === 'id') return Boolean(this.id || this.attributes.id);
    return Object.hasOwn(this.attributes, k);
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'class') this.className = '';
    if (k === 'id') this.id = '';
  }

  addEventListener(evt, fn) {
    this.listeners[evt] = fn;
  }

  removeEventListener(evt) {
    delete this.listeners[evt];
  }

  dispatchEvent(evt) {
    const name = typeof evt === 'string' ? evt : evt?.type;
    const fn = this.listeners[name];
    if (typeof fn === 'function') {
      fn({ target: this, currentTarget: this, ...evt });
    }
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string') {
        const textNode = new MockNode('#text');
        textNode._textContent = item;
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  appendChild(child) {
    this.append(child);
    return child;
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
  }

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(pred, acc);
    }
    return acc;
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results[0] ?? null;
  }

  querySelectorAll(selector) {
    const list = [];

    this.findAll((node) => {
      if (node === this) return false;
      if (selector.startsWith('#') && node.id === selector.slice(1)) return true;
      if (selector.startsWith('.') && node.classList.contains(selector.slice(1))) return true;
      if (/^[a-zA-Z0-9_-]+$/.test(selector) && node.tagName === selector.toUpperCase()) return true;
      if (selector.includes('#')) {
        const [tag, id] = selector.split('#');
        if ((!tag || node.tagName === tag.toUpperCase()) && node.id === id) return true;
      }
      if (selector.includes('.')) {
        const [tag, cls] = selector.split('.');
        if ((!tag || node.tagName === tag.toUpperCase()) && node.classList.contains(cls)) return true;
      }
      if (selector.includes('[role=') && selector.includes(']')) {
        const match = selector.match(/\[role=["']?([^"'\]]+)["']?\]/);
        if (match && node.getAttribute('role') === match[1]) return true;
      }
      if (selector.includes('[aria-labelledby=') && selector.includes(']')) {
        const match = selector.match(/\[aria-labelledby=["']?([^"'\]]+)["']?\]/);
        if (match && node.getAttribute('aria-labelledby') === match[1]) return true;
      }
      return false;
    }, list);

    return list;
  }
}

function withMockDom(fn) {
  const prevDoc = globalThis.document;
  const prevWin = globalThis.window;
  const prevNode = globalThis.Node;

  const body = new MockNode('body');
  const docElement = new MockNode('html');
  const announcer = new MockNode('div');
  announcer.setAttribute('id', 'announcer');
  body.append(announcer);

  const doc = {
    body,
    documentElement: docElement,
    activeElement: body,
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: (id) => (id === 'announcer' ? announcer : body.querySelector(`#${id}`)),
  };

  const win = {
    matchMedia: (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  };

  globalThis.Node = MockNode;
  globalThis.document = doc;
  globalThis.window = win;

  const restore = () => {
    globalThis.document = prevDoc;
    globalThis.window = prevWin;
    globalThis.Node = prevNode;
  };

  try {
    const res = fn({ body, announcer, win });
    if (res && typeof res.then === 'function') {
      return res.finally(restore);
    }
    restore();
    return res;
  } catch (err) {
    restore();
    throw err;
  }
}

function inSpanish(fn) {
  useDictionary('es', es);
  try {
    return fn();
  } finally {
    useDictionary('en', {});
  }
}

/** Visible text plus aria-labels, so labels on icon buttons are checked too. */
function allText(node) {
  const labels = node.findAll((n) => n.getAttribute?.('aria-label')).map((n) => n.getAttribute('aria-label'));
  return `${node.textContent}\n${labels.join('\n')}`;
}

function telLinks(node, number) {
  return node.findAll((n) => n.tagName === 'A' && n.getAttribute('href') === `tel:${number}`);
}

// ============================================================================
// 1. Overdose route (#/overdose)
// ============================================================================

test('overdose route renders in Spanish: Call 911 buttons, naloxone, rescue breathing, recovery position', () => {
  withMockDom(() => {
    resetOverdosePacer();
    const view = inSpanish(() => overdoseView());
    const text = allText(view);

    assert.match(text, /Respuesta a sobredosis/);
    assert.match(text, /Llame al 911/);
    assert.match(text, /Administre naloxona/);
    assert.match(text, /respiración de rescate/);
    assert.match(text, /posición de recuperación/);
    assert.match(text, /Revise si hay señales de sobredosis/);
    assert.match(text, /Iniciar temporizador de 2 minutos/);
    assert.match(text, /Opioides \(fentanilo, heroína, pastillas\)/);
    assert.match(text, /Temporizador interactivo de rescate \(opcional\)/);

    // No English safety labels leak through in Spanish mode.
    assert.doesNotMatch(text, /Call 911/);
    assert.doesNotMatch(text, /Give naloxone/);
    assert.doesNotMatch(text, /Check for overdose signs/);
    assert.doesNotMatch(text, /recovery position/);

    // Every 911 button keeps the same number and now reads in Spanish.
    const buttons = telLinks(view, '911');
    assert.ok(buttons.length >= 2, 'header and step 911 buttons must render');
    for (const b of buttons) assert.match(b.textContent, /911/);
    assert.ok(buttons.some((b) => /Llame al 911/.test(b.textContent)));
  });
});

test('overdose route stimulant tab switches to Spanish steps', () => {
  withMockDom(() => {
    resetOverdosePacer();
    useDictionary('es', es);
    try {
      const view = overdoseView();
      const stimTab = view.querySelector('#od-tab-stimulant');
      assert.ok(stimTab, 'stimulant tab must render');
      assert.match(stimTab.textContent, /Estimulantes/);
      stimTab.click();
      const panel = view.querySelector('#od-panel');
      assert.match(panel.textContent, /Refresque a la persona/);
      assert.match(panel.textContent, /Llame al 911/);
      assert.doesNotMatch(panel.textContent, /Call 911|Cool them down/);
    } finally {
      useDictionary('en', {});
    }
  });
});

test('overdose route still renders English when no dictionary is loaded', () => {
  withMockDom(() => {
    resetOverdosePacer();
    useDictionary('en', {});
    const text = allText(overdoseView());
    assert.match(text, /Call 911/);
    assert.match(text, /Give naloxone/);
    assert.doesNotMatch(text, /Llame al 911/);
  });
});

test('every od.*, hr.* and support.* key has a non-empty Spanish string spread into locales/es.js', () => {
  for (const [key, value] of Object.entries(esSafety)) {
    assert.match(key, /^(od|hr|support)\./, `${key} must live in the od/hr/support namespaces`);
    assert.equal(typeof value, 'string');
    assert.ok(value.trim().length > 0, `${key} must not be empty`);
    assert.equal(es[key], value, `${key} must be spread into locales/es.js`);
  }
  // Use usted, plain wording, and the agreed terminology.
  assert.equal(esSafety['od.opioid.call.title'], 'Llame al 911');
  assert.match(esSafety['od.opioid.naloxone.title'], /naloxona/);
  assert.match(esSafety['od.opioid.breathing.body1'], /respiración de rescate/);
  assert.match(esSafety['od.opioid.recovery.title'], /posición de recuperación/);
});

// ============================================================================
// 2. Harm reduction (#/harm-reduction) and support (#/support)
// ============================================================================

test('harm reduction route renders in Spanish and keeps numbers and cross-links', () => {
  withMockDom(() => {
    const view = inSpanish(() => harmReductionView());
    const text = allText(view);
    assert.match(text, /Reducción de daños/);
    assert.match(text, /Consiga naloxona \(Narcan\)/);
    assert.match(text, /No consuma a solas/);
    assert.match(text, /Cómo usar una tira reactiva para fentanilo/);
    assert.match(text, /Opioides \+ benzodiacepinas/);
    assert.match(text, /Conozca sus derechos/);
    assert.doesNotMatch(text, /Get naloxone|Don’t use alone|Know your rights/);

    assert.equal(telLinks(view, '18002221222').length, 1, 'Poison Help number must stay the same');
    const hrefs = view.findAll((n) => n.tagName === 'A').map((a) => a.getAttribute('href'));
    for (const route of ['#/overdose', '#/plan', '#/medications', '#/adulterant-care', '#/toxicology-triage']) {
      assert.ok(hrefs.includes(route), `harm reduction must still link to ${route}`);
    }
  });
});

test('support route renders in Spanish', () => {
  withMockDom(() => {
    const view = inSpanish(() => supportView());
    const text = allText(view);
    assert.match(text, /Apoyo para la recuperación y la familia/);
    assert.match(text, /Vivienda de recuperación/);
    assert.match(text, /Para familiares y amistades/);
    assert.match(text, /Las palabras importan/);
    assert.doesNotMatch(text, /Recovery housing|For family & friends|Words matter/);
  });
});

// ============================================================================
// 3. Guided navigator crisis intercept
// ============================================================================

const MUST_INTERCEPT_ES = [
  'me quiero matar',
  'Me quiero matar',
  'ME VOY A MATAR',
  'quiero matarme',
  'pienso en matarme todos los días',
  'Matarme es la única salida',
  'no quiero vivir',
  'Ya no quiero vivir más.',
  'no quiero seguir viviendo',
  'me voy a suicidar',
  'Me voy a suicidar esta noche',
  'quiero suicidarme',
  'suicidarme',
  'quiero quitarme la vida',
  'me quiero quitar la vida',
  'No vale la pena vivir',
  'quíero matarme',
];

const MUST_NOT_INTERCEPT_ES = [
  'No quiero vivir en un centro residencial',
  'No quiero vivir con mi papá',
  'Mi jefe va a matarme si llego tarde',
  'Quiero dejar de tomar alcohol',
  'Me quiero mudar a otra ciudad',
  'Quiero vivir mejor',
  'Necesito tratamiento con metadona',
];

test('detectCrisisOrOverdose intercepts Spanish suicidal statements (accent and case insensitive)', () => {
  for (const phrase of MUST_INTERCEPT_ES) {
    const res = detectCrisisOrOverdose(phrase);
    assert.equal(res.intercepted, true, `"${phrase}" must intercept`);
    assert.equal(res.category, 'crisis', `"${phrase}" must route to crisis support`);
  }
});

test('detectCrisisOrOverdose does not intercept ordinary Spanish phrases', () => {
  for (const phrase of MUST_NOT_INTERCEPT_ES) {
    const res = detectCrisisOrOverdose(phrase);
    assert.equal(res.intercepted, false, `"${phrase}" must not intercept (got ${res.category})`);
  }
});

test('crisis and overdose intercept action labels are Spanish in Spanish mode', () => {
  inSpanish(() => {
    const crisis = detectCrisisOrOverdose('me quiero matar');
    const crisisLabels = crisis.actions.map((a) => a.label).join('\n');
    assert.match(crisisLabels, /Llame o envíe un mensaje de texto al 988/);
    assert.match(crisisLabels, /Llame al 911/);
    assert.doesNotMatch(crisisLabels, /Call 911|Call or Text 988/);
    assert.ok(crisis.actions.some((a) => a.href === 'tel:988'));
    assert.ok(crisis.actions.some((a) => a.href === 'tel:911'));

    const od = detectCrisisOrOverdose('mi amigo tiene una sobredosis y no respira');
    assert.equal(od.category, 'overdose');
    const odLabels = od.actions.map((a) => a.label).join('\n');
    assert.match(odLabels, /Llame al 911 de inmediato/);
    assert.doesNotMatch(odLabels, /Call 911 Immediately/);
  });
  // English stays English.
  useDictionary('en', {});
  const en = detectCrisisOrOverdose('I want to kill myself');
  assert.equal(en.actions[0].label, 'Call or Text 988 Suicide & Crisis Lifeline');
});

test('guided navigator renders the crisis intercept in Spanish', () => {
  withMockDom(() => {
    resetGuidedNavigatorState();
    useDictionary('es', es);
    try {
      setGuidedNavigatorState({ freeText: 'ya no quiero vivir, me quiero matar' });
      const view = guidedNavigatorView();
      const alert = view.querySelector('.callout-emergency');
      assert.ok(alert, 'crisis intercept callout must render');
      const text = allText(alert);
      assert.match(text, /Apoyo inmediato de crisis 24\/7/);
      assert.match(text, /Llame o envíe un mensaje de texto al 988/);
      assert.match(text, /Llame al 911/);
      assert.doesNotMatch(text, /Call 911|Call or Text 988/);
      assert.ok(telLinks(alert, '988').length >= 1);
    } finally {
      useDictionary('en', {});
      resetGuidedNavigatorState();
    }
  });
});

// ============================================================================
// 4. Language detection: views must ask i18n.js, not sniff
// ============================================================================

test('views detect Spanish with getLang()', () => {
  withMockDom(() => {
    useDictionary('es', es);
    try {
      assert.equal(getLang(), 'es');
      assert.match(adhdCareView().textContent, /Inicio/);
      assert.match(benzodiazepineCareView().textContent, /Inicio/);
      resetAdolescentState();
      assert.equal(getAdolescentState().lang, 'es', 'adolescent state starts in the site language');
      adolescentCareView();
      assert.equal(getAdolescentState().lang, 'es');
    } finally {
      useDictionary('en', {});
      resetAdolescentState();
    }
  });
});

test('no view sniffs the language: no t("lang"), no "inglés" string search, no documentElement.lang reads', () => {
  const jsDir = path.join(rootDir, 'public', 'js');
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'locales') walk(full);
      } else if (entry.name.endsWith('.js')) files.push(full);
    }
  };
  walk(jsDir);
  assert.ok(files.length > 20);

  const rules = [
    [/\bt\(\s*['"`]lang['"`]\s*\)/, 't("lang") has no translation and always returns undefined; use getLang()'],
    [/\.includes\(\s*['"`](?:ingl[eé]s|espa[nñ]ol|spanish|english)['"`]\s*\)/i, 'do not detect the language by searching translated text; use getLang()'],
    [/documentElement\.lang\b(?!\s*=[^=])/, 'do not read document.documentElement.lang; use getLang()'],
    [/documentElement\.getAttribute\(\s*['"`]lang['"`]\s*\)/, 'do not read the lang attribute; use getLang()'],
    [/\bnavigator\.languages?\b/, 'only i18n.js reads navigator.language(s)'],
  ];
  const offenders = [];
  for (const file of files) {
    if (path.basename(file) === 'i18n.js') continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const [re, why] of rules) {
      if (re.test(src)) offenders.push(`${path.relative(rootDir, file)}: ${why}`);
    }
  }
  assert.deepEqual(offenders, []);
});

// ---------------------------------------------------------------- Plain-language mode
test('plain-language overdose steps keep the 911 button and switch wording in English and Spanish', () => {
  withMockDom(() => {
    resetOverdosePacer();
    setPlainLanguage(true, { notify: false });
    try {
      useDictionary('en', {});
      const en = allText(overdoseView());
      assert.match(en, /Check if it is an overdose/);
      assert.match(en, /Step 1: /);
      assert.match(en, /Call 911/);

      useDictionary('es', es);
      const view = overdoseView();
      const text = allText(view);
      assert.match(text, /Revise si es una sobredosis/);
      assert.match(text, /Paso 1: /);
      assert.match(text, /Llame al 911/);
      assert.doesNotMatch(text, /Check if it is an overdose|Call 911/);
      assert.ok(telLinks(view, '911').length >= 1);
    } finally {
      setPlainLanguage(false, { notify: false });
      useDictionary('en', {});
    }
  });
});
