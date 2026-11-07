import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { sourceContext } from '../public/js/components/sourceContext.js';
import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import esEvidence from '../public/js/locales/es-evidence.js';

// Minimal DOM surface used by the existing DOM builder; no browser dependency.
class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
  }

  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  get textContent() {
    return this.children.map((child) => child instanceof Element ? child.textContent : String(child)).join('');
  }
}

function elements(root, tag) {
  const found = root.tagName === tag.toUpperCase() ? [root] : [];
  for (const child of root.children) {
    if (child instanceof Element) found.push(...elements(child, tag));
  }
  return found;
}

let originalGlobals;
beforeEach(() => {
  originalGlobals = Object.fromEntries(['Node', 'document', 'fetch', 'localStorage', 'sessionStorage']
    .map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  globalThis.Node = Element;
  globalThis.document = { createElement: (tag) => new Element(tag) };
  useDictionary('en', {});
});

afterEach(() => {
  useDictionary('en', {});
  for (const [name, descriptor] of Object.entries(originalGlobals)) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
});

test('source context shows the supplied snapshot date without claiming verification', () => {
  const panel = sourceContext({ meta: { dataBuiltAt: '2026-10-21T00:21:17.460Z' } });
  const [time] = elements(panel, 'time');
  assert.equal(time.getAttribute('datetime'), '2026-10-21T00:21:17.460Z');
  assert.equal(time.textContent, 'October 21, 2026');
  assert.match(panel.textContent, /file build date, not confirmation/);
  assert.match(panel.textContent, /legal summaries are unverified/);
  assert.match(panel.textContent, /awaiting review are excluded from results/);
  assert.match(panel.textContent, /temporary cached response/);
  assert.match(panel.textContent, /do not update automatically during a search/);
});

test('missing or invalid metadata leaves a usable offline explanation and source links', () => {
  const cases = [undefined, null, {}, { dataBuiltAt: null }, { dataBuiltAt: 0 },
    { dataBuiltAt: 'not-a-date' }, { dataBuiltAt: '2026-02-30' },
    { dataBuiltAt: '2026-13-01T00:00:00Z' }];
  for (const meta of cases) {
    const panel = sourceContext({ meta });
    assert.equal(elements(panel, 'time').length, 0);
    assert.match(panel.textContent, /Date unavailable on this device/);
    assert.match(panel.textContent, /Offline guidance depends on what you previously enabled/);
    assert.match(panel.textContent, /need an internet connection/);
    assert.equal(elements(panel, 'a').length, 7);
    assert.doesNotMatch(panel.textContent, /Invalid Date|undefined|NaN/);
  }
  assert.doesNotThrow(() => sourceContext());
});

test('disclosure and official outbound links preserve native keyboard access and no-referrer behavior', () => {
  const panel = sourceContext();
  assert.equal(panel.tagName, 'DETAILS');
  assert.equal(panel.children[0].tagName, 'SUMMARY');
  assert.equal(panel.children[0].textContent, 'Sources and verification');
  assert.equal(panel.getAttribute('open'), null);
  const links = elements(panel, 'a');
  const hosts = links.map((link) => new URL(link.getAttribute('href')).hostname);
  assert.deepEqual(hosts, ['findtreatment.gov', 'data.hrsa.gov', 'www.va.gov', 'www.ihs.gov',
    'data.cms.gov', 'www.census.gov', 'www.medicaid.gov']);
  for (const link of links) {
    assert.equal(link.getAttribute('target'), '_blank');
    assert.equal(link.getAttribute('rel'), 'noopener noreferrer');
    assert.match(link.textContent, /opens in a new tab/);
  }
});

test('Spanish renders dates, review limits, offline guidance and sources in Spanish', () => {
  useDictionary('es', { ...es, ...esEvidence });
  const panel = sourceContext({ meta: { dataBuiltAt: '2026-10-21T00:21:17.460Z' } });
  assert.equal(panel.children[0].textContent, 'Fuentes y verificación');
  assert.match(elements(panel, 'time')[0].textContent, /21.*octubre.*2026/);
  assert.match(panel.textContent, /resúmenes legales estatales no están verificados/);
  assert.match(panel.textContent, /esperan revisión se excluyen de los resultados/);
  assert.match(panel.textContent, /orientación sin conexión/);
  assert.match(panel.textContent, /Consulte las fuentes oficiales/);
  const unavailable = sourceContext();
  assert.match(unavailable.textContent, /Fecha no disponible en este dispositivo/);
  assert.doesNotMatch(panel.textContent, /Sources and verification|Verification limits|opens in a new tab/);
});

test('source context works when network and persistent storage are unavailable', () => {
  globalThis.fetch = () => { throw new Error('Network must not be used'); };
  for (const name of ['localStorage', 'sessionStorage']) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      get() { throw new Error('Persistent storage must not be used'); },
    });
  }
  Object.defineProperty(globalThis.document, 'cookie', {
    get() { throw new Error('Cookies must not be read'); },
    set() { throw new Error('Cookies must not be written'); },
  });
  assert.doesNotThrow(() => sourceContext());
  assert.doesNotThrow(() => sourceContext({ meta: { dataBuiltAt: '2026-10-21' } }));
});
