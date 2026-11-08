import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// ----------------------------------------------------------------------------
// Lightweight Zero-Dependency DOM Shim for Node.js test environment
// ----------------------------------------------------------------------------
class MockClassList {
  constructor(node) {
    this.node = node;
  }
  _getClasses() {
    const raw = this.node.className || (this.node.getAttribute('class') || '');
    return raw.split(/\s+/).filter(Boolean);
  }
  contains(cls) {
    return this._getClasses().includes(cls);
  }
  add(...classes) {
    const list = this._getClasses();
    for (const c of classes) {
      if (!list.includes(c)) list.push(c);
    }
    const val = list.join(' ');
    this.node.className = val;
    this.node.setAttribute('class', val);
  }
  remove(...classes) {
    const list = this._getClasses().filter((c) => !classes.includes(c));
    const val = list.join(' ');
    this.node.className = val;
    this.node.setAttribute('class', val);
  }
  toggle(cls, force) {
    const has = this.contains(cls);
    const shouldAdd = force !== undefined ? Boolean(force) : !has;
    if (shouldAdd) this.add(cls);
    else this.remove(cls);
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
    this.checked = false;
    this.disabled = false;
    this._hidden = false;
    this._textContent = '';
    this.isConnected = true;
    this.classList = new MockClassList(this);
    this.id = '';
  }

  get hidden() {
    return this._hidden || Object.hasOwn(this.attributes, 'hidden');
  }

  set hidden(v) {
    this._hidden = Boolean(v);
    if (this._hidden) this.attributes.hidden = '';
    else delete this.attributes.hidden;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'id') this.id = val;
    if (k === 'hidden') this._hidden = true;
    if (k === 'value') this.value = val;
    if (k === 'checked') this.checked = true;
    if (k === 'disabled') this.disabled = true;
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
    if (k === 'hidden') this._hidden = false;
    if (k === 'disabled') this.disabled = false;
  }

  addEventListener(evt, fn) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(fn);
  }

  removeEventListener(evt, fn) {
    if (!this.listeners[evt]) return;
    this.listeners[evt] = this.listeners[evt].filter((f) => f !== fn);
  }

  dispatchEvent(evt) {
    const fns = this.listeners[evt.type] || [];
    for (const fn of fns) fn(evt);
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

  hasClass(cls) {
    return this.classList.contains(cls);
  }

  contains(node) {
    if (!node) return false;
    if (node === this) return true;
    for (const ch of this.children) {
      if (ch instanceof MockNode && ch.contains(node)) return true;
    }
    return false;
  }

  focus() {
    if (globalThis.document) {
      globalThis.document.activeElement = this;
    }
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
    const isId = selector.startsWith('#');
    const isClass = selector.startsWith('.');
    const isTag = /^[a-zA-Z0-9_-]+$/.test(selector);

    this.findAll((node) => {
      if (node === this) return false;
      if (isId && node.id === selector.slice(1)) return true;
      if (isClass && node.hasClass(selector.slice(1))) return true;
      if (isTag && node.tagName === selector.toUpperCase()) return true;
      if (selector.includes('button') && node.tagName === 'BUTTON') return true;
      if (selector.includes('[href]') && node.hasAttribute('href')) return true;
      if (selector.includes('[data-nav]') && node.hasAttribute('data-nav')) return true;
      return false;
    }, list);

    return list;
  }
}

// Global DOM setup
const mockBody = new MockNode('body');
const mockDocEl = new MockNode('html');
const mockAnnouncer = new MockNode('div');
mockAnnouncer.id = 'announcer';
mockAnnouncer.setAttribute('aria-live', 'polite');
mockBody.append(mockAnnouncer);

const windowListeners = {};
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { languages: ['en-US'], language: 'en-US' },
});

after(() => {
  if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  else delete globalThis.navigator;
});

globalThis.Node = MockNode;
globalThis.document = {
  body: mockBody,
  documentElement: mockDocEl,
  activeElement: mockBody,
  title: 'HarborPath',
  createElement: (tag) => new MockNode(tag),
  createElementNS: (_ns, tag) => new MockNode(tag),
  getElementById: (id) => {
    if (id === 'announcer') return mockAnnouncer;
    return mockBody.querySelector(`#${id}`);
  },
  querySelector: (sel) => mockBody.querySelector(sel),
  querySelectorAll: (sel) => mockBody.querySelectorAll(sel),
  addEventListener: (evt, fn) => {
    if (!windowListeners[evt]) windowListeners[evt] = [];
    windowListeners[evt].push(fn);
  },
  removeEventListener: (evt, fn) => {
    if (!windowListeners[evt]) return;
    windowListeners[evt] = windowListeners[evt].filter((f) => f !== fn);
  },
};

globalThis.window = {
  scrollTo: () => {},
  print: () => {},
  addEventListener: (evt, fn) => {
    if (!windowListeners[evt]) windowListeners[evt] = [];
    windowListeners[evt].push(fn);
  },
  removeEventListener: (evt, fn) => {
    if (!windowListeners[evt]) return;
    windowListeners[evt] = windowListeners[evt].filter((f) => f !== fn);
  },
  dispatchEvent: (evt) => {
    const fns = windowListeners[evt.type] || [];
    for (const fn of fns) fn(evt);
  },
};

globalThis.location = {
  hash: '',
  href: 'http://localhost/',
  search: '',
  replace: () => {},
};

globalThis.history = {
  state: null,
  replaceState: () => {},
};

// Mock Legal Data
const MOCK_LEGAL_DATA_WA = {
  stateCode: 'WA',
  stateName: 'Washington',
  goodSamaritan: {
    hasProtection: true,
    arrestImmunity: true,
    chargeImmunity: true,
    prosecutionImmunity: true,
    protectsParoleProbation: true,
    protectsParaphernalia: true,
    protectsUnderageAlcohol: false,
    statuteCitation: 'RCW 69.50.315',
  },
  naloxoneAccess: {
    standingOrder: true,
    thirdPartyPrescribing: true,
    layResponderImmunity: true,
    statuteCitation: 'RCW 69.41.095',
  },
  harmReductionEquipment: {
    fentanylTestStripsLegal: true,
    xylazineTestStripsLegal: true,
    sspStatutoryProtection: true,
    statuteNotes: 'Drug testing equipment decriminalized under RCW 69.50.102; syringe exchange explicitly authorized.',
  },
};

const MOCK_LEGAL_DATA_LIMITED = {
  stateCode: 'XX',
  stateName: 'Example State',
  goodSamaritan: {
    hasProtection: false,
    arrestImmunity: false,
    chargeImmunity: false,
    prosecutionImmunity: false,
    protectsParoleProbation: false,
    protectsParaphernalia: false,
    protectsUnderageAlcohol: false,
    statuteCitation: '',
  },
  naloxoneAccess: {
    standingOrder: false,
    thirdPartyPrescribing: false,
    layResponderImmunity: false,
    statuteCitation: '',
  },
  harmReductionEquipment: {
    fentanylTestStripsLegal: false,
    xylazineTestStripsLegal: false,
    sspStatutoryProtection: false,
    statuteNotes: 'Syringe services and drug checking supplies restricted under state law.',
  },
};

// ----------------------------------------------------------------------------
// SUITE 1: HTML Landmark & Navigation Integrity (public/index.html)
// ----------------------------------------------------------------------------
describe('Suite 1: HTML Header Buttons & Navigation Links (public/index.html)', () => {
  const indexHtmlPath = resolve(rootDir, 'public/index.html');
  const indexHtml = readFileSync(indexHtmlPath, 'utf8');

  test('header contains accessible Sensory Mode button with eye icon and keyboard shortcut', () => {
    assert.match(indexHtml, /<button\s+id="btn-sensory-mode"/, 'Must have #btn-sensory-mode button');
    assert.match(indexHtml, /class="btn-sensory-mode"/, 'Must have class="btn-sensory-mode"');
    assert.match(indexHtml, /type="button"/, 'Must specify type="button"');
    assert.match(indexHtml, /aria-pressed="false"/, 'Must initialize with aria-pressed="false"');
    assert.match(indexHtml, /aria-keyshortcuts="Alt\+S"/, 'Must declare aria-keyshortcuts="Alt+S"');
    assert.match(indexHtml, /title="Low-stimulation sensory mode \(Alt\+S\)"/, 'Must provide descriptive title');
    assert.match(indexHtml, /data-i18n-title="app\.sensoryMode"/, 'Must provide data-i18n-title');
    assert.match(indexHtml, /<use\s+href="\/icons\.svg#eye"><\/use>/, 'Must reference #eye icon');
    assert.match(indexHtml, /<span\s+class="sr-only"\s+data-i18n="app\.sensoryModeLabel">Sensory Mode<\/span>/, 'Must provide translated sr-only text');
  });

  test('header contains accessible Quick Emergency Drawer button with alert icon', () => {
    assert.match(indexHtml, /<button\s+id="btn-emergency-drawer"/, 'Must have #btn-emergency-drawer button');
    assert.match(indexHtml, /class="btn-emergency-drawer"/, 'Must have class="btn-emergency-drawer"');
    assert.match(indexHtml, /type="button"/, 'Must specify type="button"');
    assert.match(indexHtml, /aria-expanded="false"/, 'Must initialize with aria-expanded="false"');
    assert.match(indexHtml, /aria-controls="emergency-drawer"/, 'Must link to aria-controls="emergency-drawer"');
    assert.match(indexHtml, /id="btn-emergency-drawer"[^>]*aria-haspopup="dialog"/, 'Must announce that the emergency control opens a dialog');
    assert.match(indexHtml, /title="Emergency survival cards"/, 'Must provide descriptive emergency title');
    assert.match(indexHtml, /data-i18n-title="app\.emergencyCards"/, 'Must provide data-i18n-title');
    assert.match(indexHtml, /<use\s+href="\/icons\.svg#alert"><\/use>/, 'Must reference #alert icon');
    assert.match(indexHtml, /<span\s+data-i18n="app\.emergency">Emergency<\/span>/, 'Must render emergency label');
  });

  test('site navigation includes Clinical Withdrawal Self-Check link', () => {
    assert.match(
      indexHtml,
      /<a\s+href="#\/assessment"\s+data-nav="assessment"\s+data-i18n="app\.nav\.assessment">Withdrawal check \(COWS\/CIWA\)<\/a>/,
      'Must contain withdrawal check link with href="#/assessment", data-nav="assessment", and data-i18n="app.nav.assessment"'
    );
  });

  test('site navigation includes Readiness & Stages of Change link', () => {
    assert.match(
      indexHtml,
      /<a\s+href="#\/readiness"\s+data-nav="readiness"\s+data-i18n="app\.nav\.readiness">Readiness to change<\/a>/,
      'Must contain readiness link with href="#/readiness", data-nav="readiness", and data-i18n="app.nav.readiness"'
    );
  });

  test('landmark structure is complete and accessible', () => {
    assert.match(indexHtml, /<header\s+class="site-header">/, 'Header landmark present');
    assert.match(indexHtml, /<nav\s+id="site-nav"\s+class="site-nav"\s+aria-label="Main"/, 'Nav landmark with label');
    assert.match(indexHtml, /<main\s+id="main"\s+class="wrap"\s+tabindex="-1">/, 'Main landmark present');
    assert.match(indexHtml, /<footer\s+class="site-footer">/, 'Footer landmark present');
    assert.match(indexHtml, /<a\s+class="skip-link"\s+href="#main"/, 'Skip link present');
  });

  test('care tools and care team workspace are discoverable in the main navigation', () => {
    const mainNav = indexHtml.match(/<nav id="site-nav"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(mainNav);
    assert.match(mainNav, /href="#\/tools"\s+data-nav="tools"\s+data-i18n="app\.nav\.tools">Care tools<\/a>/);
    assert.match(mainNav, /href="#\/workspace"\s+data-nav="workspace"\s+data-i18n="app\.nav\.workspace">For care teams<\/a>/);
  });

  test('secondary navigation uses a translated native disclosure without hiding primary care routes', () => {
    const mainNav = indexHtml.match(/<nav id="site-nav"[\s\S]*?<\/nav>/)?.[0];
    const disclosure = mainNav?.match(/<details class="nav-more-menu">[\s\S]*?<\/details>/)?.[0];
    assert.ok(disclosure, 'Secondary routes should use a native, initially closed details control');
    assert.match(disclosure, /<summary data-i18n="app\.nav\.more">More tools<\/summary>/);
    assert.doesNotMatch(disclosure, /role="menu(?:item)?"/, 'Keep native link and disclosure keyboard semantics');
    const primary = mainNav.replace(disclosure, '');
    for (const route of ['match', 'treatment', 'health', 'tools', 'plan', 'workspace', 'saved']) {
      assert.ok(primary.includes(`data-nav="${route}"`), `Primary ${route} link must remain visible outside the disclosure`);
    }
    for (const route of ['navigator', 'assessment', 'readiness', 'medications', 'harm-reduction', 'support', 'choosing-care']) {
      assert.ok(disclosure.includes(`data-nav="${route}"`), `Secondary ${route} link must remain reachable in More tools`);
    }
    const routes = [...mainNav.matchAll(/data-nav="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(routes.length, 14);
    assert.equal(new Set(routes).size, routes.length, 'Do not duplicate routes between primary and secondary lists');
  });
});

// ----------------------------------------------------------------------------
// SUITE 2: Sensory Mode & Emergency Drawer Components
// ----------------------------------------------------------------------------
describe('Suite 2: Sensory Mode & Emergency Drawer Components', async () => {
  const sensoryMod = await import('../public/js/components/sensoryMode.js');
  const emergencyMod = await import('../public/js/components/emergencyDrawer.js');

  test('sensoryMode: toggleSensoryMode updates state, notifies subscribers, and resets cleanly', () => {
    sensoryMod.resetSensoryMode();
    assert.equal(sensoryMod.getSensoryMode(), false);

    let notifiedValue = null;
    const unsubscribe = sensoryMod.subscribeSensoryMode((val) => {
      notifiedValue = val;
    });

    const active = sensoryMod.toggleSensoryMode();
    assert.equal(active, true);
    assert.equal(sensoryMod.getSensoryMode(), true);
    assert.equal(notifiedValue, true);

    const inactive = sensoryMod.toggleSensoryMode();
    assert.equal(inactive, false);
    assert.equal(sensoryMod.getSensoryMode(), false);
    assert.equal(notifiedValue, false);

    sensoryMod.setSensoryMode(true);
    assert.equal(sensoryMod.getSensoryMode(), true);
    sensoryMod.resetSensoryMode();
    assert.equal(sensoryMod.getSensoryMode(), false);

    unsubscribe();
  });

  test('sensoryMode: Alt+S keydown triggers sensory toggle', () => {
    sensoryMod.resetSensoryMode();
    assert.equal(sensoryMod.getSensoryMode(), false);

    let prevented = false;
    sensoryMod.handleSensoryKeydown({
      altKey: true,
      ctrlKey: false,
      metaKey: false,
      key: 's',
      code: 'KeyS',
      preventDefault: () => { prevented = true; },
    });

    assert.equal(prevented, true);
    assert.equal(sensoryMod.getSensoryMode(), true);

    sensoryMod.resetSensoryMode();
    assert.equal(sensoryMod.getSensoryMode(), false);
  });

  test('emergencyDrawer: open, close, and reset methods operate correctly', () => {
    emergencyMod.closeEmergencyDrawer();
    assert.equal(emergencyMod.isEmergencyDrawerOpen(), false);

    const triggerBtn = new MockNode('button');
    triggerBtn.setAttribute('id', 'btn-emergency-drawer');
    triggerBtn.setAttribute('aria-expanded', 'false');

    emergencyMod.openEmergencyDrawer(triggerBtn);
    assert.equal(emergencyMod.isEmergencyDrawerOpen(), true);

    emergencyMod.closeEmergencyDrawer();
    assert.equal(emergencyMod.isEmergencyDrawerOpen(), false);

    // Test singleton drawer DOM structure
    const drawerWrapper = emergencyMod.emergencyDrawer();
    assert.ok(drawerWrapper instanceof MockNode);
    assert.equal(drawerWrapper.id, 'emergency-drawer-wrapper');

    const dialogPanel = drawerWrapper.children.find(
      (c) => c instanceof MockNode && c.getAttribute('role') === 'dialog'
    );
    assert.ok(dialogPanel, 'Must contain role="dialog" panel');
    assert.equal(dialogPanel.getAttribute('aria-modal'), 'true');
    assert.equal(dialogPanel.getAttribute('aria-labelledby'), 'emergency-drawer-title');
    assert.equal(dialogPanel.getAttribute('aria-describedby'), 'emergency-drawer-desc');
  });
});

// ----------------------------------------------------------------------------
// SUITE 3: State Legal Card Component (stateLegalCard.js)
// ----------------------------------------------------------------------------
describe('Suite 3: State Legal Card Component (public/js/components/stateLegalCard.js)', async () => {
  const { stateLegalCard, getStateLegalCardState, resetStateLegalCardState } =
    await import('../public/js/components/stateLegalCard.js');

  test('exports stateLegalCard, getStateLegalCardState, and resetStateLegalCardState', () => {
    assert.equal(typeof stateLegalCard, 'function');
    assert.equal(typeof getStateLegalCardState, 'function');
    assert.equal(typeof resetStateLegalCardState, 'function');
  });

  test('renders high-contrast card with Good Samaritan immunities and citations (WA)', () => {
    resetStateLegalCardState();
    const card = stateLegalCard(MOCK_LEGAL_DATA_WA);

    assert.ok(card instanceof MockNode, 'Must return a MockNode instance');
    assert.equal(card.tagName, 'SECTION');
    assert.ok(card.hasClass('state-legal-card'));
    assert.ok(card.hasClass('print-handout'));
    assert.equal(card.getAttribute('role'), 'region');

    const text = card.textContent;
    assert.ok(text.includes('Washington'));
    assert.ok(text.includes('Good Samaritan Law Active'));
    assert.ok(text.includes('RCW 69.50.315'), 'Must include Good Samaritan statute citation');
    assert.ok(text.includes('Arrest immunity: Protected'), 'Must display arrest immunity');
    assert.ok(text.includes('Prosecution immunity: Protected'), 'Must display prosecution immunity');
    assert.ok(text.includes('Paraphernalia protection: Drug checking'), 'Must display paraphernalia protection');
    assert.ok(text.includes('Parole / Probation: Shields against revocation'), 'Must display probation/parole shield');
  });

  test('renders Naloxone access laws and lay responder immunities', () => {
    const card = stateLegalCard(MOCK_LEGAL_DATA_WA);
    const text = card.textContent;

    assert.ok(text.includes('Naloxone Access & Lay Responder Immunity'));
    assert.ok(text.includes('Statewide standing order'));
    assert.ok(text.includes('Third-party prescribing authorized'));
    assert.ok(text.includes('Lay responder civil & criminal immunity'));
    assert.ok(text.includes('RCW 69.41.095'), 'Must include Naloxone access statute citation');
  });

  test('renders Harm Reduction Equipment decriminalization and SSP status', () => {
    const card = stateLegalCard(MOCK_LEGAL_DATA_WA);
    const text = card.textContent;

    assert.ok(text.includes('Harm Reduction Equipment & Decriminalization'));
    assert.ok(text.includes('Fentanyl test strips: Decriminalized'));
    assert.ok(text.includes('Xylazine test strips: Decriminalized'));
    assert.ok(text.includes('Syringe services programs (SSP): Explicit statutory authorization'));
    assert.ok(text.includes('RCW 69.50.102'), 'Must include statutory notes citation');
  });

  test('renders expandable details accordion with 911 EMS interaction guidance', () => {
    resetStateLegalCardState();
    const card = stateLegalCard(MOCK_LEGAL_DATA_WA, { id: 'test-legal-card' });

    const toggleBtn = card.querySelector('#test-legal-card-toggle');
    assert.ok(toggleBtn, 'Must render toggle button');
    assert.equal(toggleBtn.getAttribute('aria-expanded'), 'false');
    assert.equal(toggleBtn.getAttribute('aria-controls'), 'test-legal-card-details');

    const detailsPanel = card.querySelector('#test-legal-card-details');
    assert.ok(detailsPanel, 'Must render details panel');
    assert.equal(detailsPanel.hidden, true);
    assert.equal(detailsPanel.getAttribute('role'), 'region');

    // Simulate click to expand
    toggleBtn.dispatchEvent({ type: 'click' });
    assert.equal(toggleBtn.getAttribute('aria-expanded'), 'true');
    assert.equal(detailsPanel.hidden, false);

    const panelText = detailsPanel.textContent;
    assert.ok(panelText.includes('911 Medical Emergency Rights & EMS Interaction Script'));
    assert.ok(panelText.includes('Call 911 immediately'));
    assert.ok(panelText.includes('Paramedics are healthcare clinicians, not police'));

    // Reset via resetStateLegalCardState()
    resetStateLegalCardState();
    assert.equal(toggleBtn.getAttribute('aria-expanded'), 'false');
    assert.equal(detailsPanel.hidden, true);
  });

  test('handles missing or null legalData gracefully with accessible fallback card', () => {
    const fallbackNull = stateLegalCard(null);
    assert.ok(fallbackNull instanceof MockNode);
    assert.equal(fallbackNull.tagName, 'SECTION');
    assert.ok(fallbackNull.textContent.includes('Good Samaritan & Harm Reduction Legal Protections'));
    assert.ok(fallbackNull.textContent.includes('50 U.S. states'));

    const fallbackEmpty = stateLegalCard({});
    assert.ok(fallbackEmpty instanceof MockNode);
  });

  test('renders limited protection status accurately for states without protections', () => {
    const card = stateLegalCard(MOCK_LEGAL_DATA_LIMITED);
    const text = card.textContent;

    assert.ok(text.includes('Limited Immunity'));
    assert.ok(text.includes('Arrest immunity: Not explicitly shielded'));
    assert.ok(text.includes('Prosecution immunity: Not explicitly shielded'));
    assert.ok(text.includes('Paraphernalia not explicitly shielded'));
  });
});

// ----------------------------------------------------------------------------
// SUITE 4: States View Integration (public/js/views/states.js)
// ----------------------------------------------------------------------------
describe('Suite 4: States View Integration (public/js/views/states.js)', async () => {
  const { stateDetailView, resetStatesState } = await import('../public/js/views/states.js');
  const { regionsApi } = await import('../public/js/regionsApi.js');

  test('stateDetailView creates view container and attaches legalCard on API resolve', async () => {
    // Mock regionsApi.state
    const origState = regionsApi.state;
    regionsApi.state = async (code) => ({
      region: { code, name: 'Washington', type: 'state' },
      legal: MOCK_LEGAL_DATA_WA,
      telehealth: true,
      healthCenters: 42,
      medicaid: null,
      links: {},
      sources: {},
    });

    const view = stateDetailView({ code: 'WA' });
    assert.ok(view instanceof MockNode);

    // Allow promise tick
    await new Promise((r) => setTimeout(r, 20));

    const legalCard = view.querySelector('.state-legal-card');
    assert.ok(legalCard, 'stateDetailView must render stateLegalCard');
    assert.ok(legalCard.textContent.includes('RCW 69.50.315'));

    regionsApi.state = origState;
  });

  test('resetStatesState resets legal card state cleanly', async () => {
    const { getStateLegalCardState } = await import('../public/js/components/stateLegalCard.js');
    resetStatesState();
    assert.equal(getStateLegalCardState().expanded, false);
  });
});

// ----------------------------------------------------------------------------
// SUITE 5: Application Routing, Lazy Loading & Quick Exit (public/js/app.js)
// ----------------------------------------------------------------------------
describe('Suite 5: Application Routing & Quick Exit Contract (public/js/app.js)', async () => {
  const appMod = await import('../public/js/app.js');

  test('LAZY_LOADERS registers readiness route', async () => {
    assert.ok(Object.hasOwn(appMod.LAZY_LOADERS, 'readiness'), 'LAZY_LOADERS must include readiness');
    assert.equal(typeof appMod.LAZY_LOADERS.readiness, 'function');
  });

  test('resolveRoute resolves readiness route with title and lazyPath', () => {
    const res = appMod.resolveRoute('readiness', new URLSearchParams());
    assert.ok(res.lazyPath === 'readiness' || typeof res.view === 'function', 'Route must resolve either as lazyPath or cached view');
    assert.ok(res.title.includes('Readiness') || res.title.includes('change'));
  });

  test('resolveRoute resolves assessment route with title and lazyPath', () => {
    const res = appMod.resolveRoute('assessment', new URLSearchParams());
    assert.ok(res.lazyPath === 'assessment' || typeof res.view === 'function', 'Route must resolve either as lazyPath or cached view');
    assert.ok(res.title.includes('assessment') || res.title.includes('Withdrawal'));
  });

  test('runQuickExitResets wipes all modules and resets header emergency buttons', async () => {
    const sensoryMod = await import('../public/js/components/sensoryMode.js');
    const emergencyMod = await import('../public/js/components/emergencyDrawer.js');
    const legalMod = await import('../public/js/components/stateLegalCard.js');

    // Simulate active states
    sensoryMod.setSensoryMode(true);
    assert.equal(sensoryMod.getSensoryMode(), true);

    const emergencyBtn = new MockNode('button');
    emergencyBtn.id = 'btn-emergency-drawer';
    emergencyBtn.setAttribute('aria-expanded', 'true');
    mockBody.append(emergencyBtn);

    // Run Quick Exit Resets
    appMod.runQuickExitResets();

    // Allow promise ticks for dynamic imports
    await new Promise((r) => setTimeout(r, 30));

    assert.equal(sensoryMod.getSensoryMode(), false, 'Sensory mode must be disabled after quick exit');
    assert.equal(emergencyMod.isEmergencyDrawerOpen(), false, 'Emergency drawer must be closed after quick exit');
    assert.equal(legalMod.getStateLegalCardState().expanded, false, 'Legal card expanded state must be reset');
    assert.equal(emergencyBtn.getAttribute('aria-expanded'), 'false', 'btn-emergency-drawer aria-expanded must reset to false');

    emergencyBtn.remove();
  });
});

// ----------------------------------------------------------------------------
// SUITE 6: Security, WCAG 2.2 AA & Zero-Dependency Audit
// ----------------------------------------------------------------------------
describe('Suite 6: Security, WCAG 2.2 AA & Zero-Dependency Audit', () => {
  const targetFiles = [
    'public/index.html',
    'public/js/components/stateLegalCard.js',
    'public/js/views/states.js',
    'public/js/app.js',
  ];

  test('zero npm/third-party dependencies in package.json', () => {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));
    assert.deepEqual(pkg.dependencies || {}, {}, 'Must have 0 runtime npm dependencies');
  });

  test('zero innerHTML, outerHTML, or inline style= across target files', () => {
    for (const relPath of targetFiles) {
      const src = readFileSync(resolve(rootDir, relPath), 'utf8');
      assert.ok(!src.includes('innerHTML'), `${relPath} must not contain innerHTML`);
      assert.ok(!src.includes('outerHTML'), `${relPath} must not contain outerHTML`);
      assert.ok(!src.includes('insertAdjacentHTML'), `${relPath} must not contain insertAdjacentHTML`);
      if (!relPath.endsWith('.html')) {
        assert.ok(!/style\s*=\s*['"]/.test(src), `${relPath} must not contain inline style= attributes`);
      }
    }
  });

  test('WCAG 2.2 AA accessibility attributes: aria-pressed, aria-expanded, aria-controls present', () => {
    const indexHtml = readFileSync(resolve(rootDir, 'public/index.html'), 'utf8');
    const legalCardSrc = readFileSync(resolve(rootDir, 'public/js/components/stateLegalCard.js'), 'utf8');

    assert.ok(indexHtml.includes('aria-pressed="false"'), 'index.html has aria-pressed');
    assert.ok(indexHtml.includes('aria-expanded="false"'), 'index.html has aria-expanded');
    assert.ok(indexHtml.includes('aria-controls="emergency-drawer"'), 'index.html has aria-controls');

    assert.ok(legalCardSrc.includes('aria-expanded'), 'stateLegalCard has aria-expanded');
    assert.ok(legalCardSrc.includes('aria-controls'), 'stateLegalCard has aria-controls');
    assert.ok(legalCardSrc.includes('role: \'region\'') || legalCardSrc.includes('"role", "region"'), 'stateLegalCard defines accessible region landmark');
  });

  test('nav-more dropdown positioning prevents off-screen clipping on wrapped lines', () => {
    const css = readFileSync(resolve(rootDir, 'public/styles.css'), 'utf8');
    assert.match(css, /\.site-nav \.nav-more-links\s*\{[^}]*left:\s*0/, 'nav-more-links defaults to left: 0 to avoid off-screen negative clipping');
    assert.match(css, /\.site-nav \.nav-more-links\.align-right\s*\{[^}]*right:\s*0/, 'nav-more-links.align-right supports right: 0 when adjacent to right viewport');
  });
});
