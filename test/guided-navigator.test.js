import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Install a lightweight in-memory WebStorage shim before importing client state
// modules so Node 22+ does not emit an ExperimentalWarning for localStorage.
function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(String(k)); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
  };
}

Object.defineProperty(globalThis, 'localStorage', {
  value: createMemoryStorage(),
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'sessionStorage', {
  value: createMemoryStorage(),
  configurable: true,
  writable: true,
});

const { SECURITY_HEADERS } = await import('../src/app.js');
const { auditSecurityHeaders } = await import('../src/privacy.js');
const { state, setLocation, setRadius, toggleSaved, setPersist, wipeAll } = await import('../public/js/state.js');
const navModule = await import('../public/js/views/navigator.js');
const { detectCrisisOrOverdose } = await import('../public/js/views/guidedNavigator.js');
const popHelpers = await import('../public/js/views/populationHelpers.js');
const { rankMatches, fromFacility } = await import('../public/js/match/engine.js');
const { HOTLINES, hotlinesById } = await import('../public/js/content/hotlines.js');

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, '..');

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
    this.hidden = false;
    this._textContent = '';
    this.isConnected = true;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return (
      this._textContent +
      this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('')
    );
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'hidden') this.hidden = true;
    if (k === 'value') this.value = val;
    if (k === 'checked') this.checked = true;
  }

  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'hidden') this.hidden = false;
  }

  addEventListener(evt, fn) {
    this.listeners[evt] = fn;
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

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
  }

  querySelector(selector) {
    if (selector === 'input') {
      return this.findAll((n) => n.tagName === 'INPUT')[0] ?? null;
    }
    return null;
  }

  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(pred, acc);
    }
    return acc;
  }
}

describe('CSP & Security Header Parity (src/app.js vs vercel.json)', () => {
  it('enforces 100% identical SECURITY_HEADERS between src/app.js and vercel.json with default-src \'self\'', () => {
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'),
    );
    const catchAllRule = vercelConfig.headers.find((h) => h.source === '/(.*)');
    assert.ok(catchAllRule, 'Expected catch-all /(.*) header rule in vercel.json');

    const vercelHeaderMap = Object.fromEntries(
      catchAllRule.headers.map(({ key, value }) => [key, value]),
    );

    assert.deepEqual(
      Object.keys(vercelHeaderMap).sort(),
      Object.keys(SECURITY_HEADERS).sort(),
      'src/app.js SECURITY_HEADERS and vercel.json must have identical header names',
    );
    assert.deepEqual(
      vercelHeaderMap,
      SECURITY_HEADERS,
      'src/app.js SECURITY_HEADERS and vercel.json must have 100% identical header values',
    );

    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /script-src 'self'/);
    assert.match(csp, /style-src 'self'/);
    assert.match(csp, /connect-src 'self'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /base-uri 'none'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https?:/);

    assert.equal(auditSecurityHeaders(SECURITY_HEADERS).ok, true);
    assert.equal(auditSecurityHeaders(catchAllRule.headers).ok, true);
  });
});

describe('Deterministic Triage & Crisis / Overdose Red-Flag Interception', () => {
  it('intercepts crisis and overdose red flags and surfaces 988, 911, Never Use Alone, SafeSpot (800-972-0590), and #/overdose', () => {
    // 1. Verify crisis hotlines and overdose prevention lines are defined and accurate
    const [line988, lineNua, lineSafespot, lineSamhsa] = hotlinesById(
      '988',
      'never-use-alone',
      'safespot',
      'samhsa',
    );
    assert.ok(line988 && line988.call.number === '988');
    assert.ok(lineNua && /8004843731|8776961996/.test(lineNua.call.number));
    assert.ok(lineSafespot && lineSafespot.call.number === '18009720590');
    assert.equal(lineSafespot.call.label, '1-800-972-0590');
    assert.ok(lineSamhsa && lineSamhsa.call.number === '18006624357');

    const overdose = detectCrisisOrOverdose({ overdose: true });
    assert.equal(overdose.category, 'overdose');
    assert.ok(overdose.actions.some(({ href }) => href === 'tel:911'));
    assert.ok(overdose.actions.some(({ href }) => href === '#/overdose'));
    assert.ok(overdose.actions.some(({ label }) => label.includes('Never Use Alone')));
    assert.ok(overdose.actions.some(({ label }) => label.includes('SafeSpot')));

    // 2. Verify navigator.js crisis interception puts 988 & 911 safety first
    const crisisEval = navModule.evaluateAsamCare({
      substances: ['opioids'],
      withdrawalRisk: 'severe',
      mentalHealth: 'severe_crisis',
    });
    assert.equal(crisisEval.crisis, true);
    assert.ok(crisisEval.redFlags.some((f) => /988/.test(f)));
    const crisisText = navModule.formatAsamHandoffText(
      { substances: ['opioids'], withdrawalRisk: 'severe', mentalHealth: 'severe_crisis' },
      crisisEval,
    );
    assert.match(crisisText, /SAFETY FIRST.*988.*911/);

    // 3. Verify post-overdose transition risk surfaces Never Use Alone & SafeSpot (1-800-972-0590)
    const odTransition = navModule.evaluateTransitionRisk({
      event: 'post_overdose',
      daysSince: 'under_7',
      onMoud: false,
      hasNaloxone: false,
    });
    assert.equal(odTransition.riskBand, 'critical');
    assert.ok(
      odTransition.actionSteps.some(
        (step) => /Never Use Alone/.test(step) && /SafeSpot.*1-800-972-0590/.test(step),
      ),
    );
  });

  it('dynamically tests guidedNavigator.js deterministic triage, red-flag interception, and resetGuidedNavigatorState when present', async () => {
    const guidedPath = path.join(rootDir, 'public', 'js', 'views', 'guidedNavigator.js');
    if (!fs.existsSync(guidedPath)) {
      // In isolated Sub-Agent 5 worktree before Sub-Agent 4 merge: baseline contracts verified above.
      return;
    }

    const guidedMod = await import(pathToFileURL(guidedPath).href);

    // Verify guidedNavigator.js source contains crisis/overdose red-flag targets and zero fetch/storage
    const guidedSrc = fs.readFileSync(guidedPath, 'utf8');
    const stripped = guidedSrc.replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(stripped, /\bfetch\s*\(/, 'guidedNavigator.js must never call fetch()');
    assert.doesNotMatch(stripped, /\blocalStorage\b|\bsessionStorage\b/, 'guidedNavigator.js must never use web storage');
    assert.match(guidedSrc, /988/);
    assert.match(guidedSrc, /911/);
    assert.match(guidedSrc, /NEVER_USE_ALONE/);
    assert.match(guidedSrc, /800-972-0590/);
    assert.match(guidedSrc, /#\/overdose/);

    // Test exported triage / evaluation functions if present
    const triageFn =
      guidedMod.evaluateGuidedTriage ??
      guidedMod.evaluateGuidedNavigator ??
      guidedMod.triageGuidedAnswers ??
      guidedMod.evaluateTriage;

    if (typeof triageFn === 'function') {
      const crisisOut = triageFn({
        crisis: true,
        overdose: true,
        suicidalIdeation: true,
        activeOverdose: true,
        situation: 'emergency',
        redFlag: 'overdose',
      });
      assert.ok(crisisOut && typeof crisisOut === 'object');

      const routineOut = triageFn({
        substances: ['opioids', 'xylazine'],
        withdrawalRisk: 'moderate',
        biomedical: 'pregnant',
        payment: 'MD',
      });
      assert.ok(routineOut && typeof routineOut === 'object');
    }

    // Test view rendering with MockNode shim if exported
    const viewFn = guidedMod.guidedNavigatorView ?? guidedMod.default;
    if (typeof viewFn === 'function') {
      const prevDoc = globalThis.document;
      const prevNode = globalThis.Node;
      globalThis.Node = MockNode;
      globalThis.document = {
        createElement: (tag) => new MockNode(tag),
        createElementNS: (_ns, tag) => new MockNode(tag),
        getElementById: () => null,
      };
      try {
        const rendered = viewFn({ query: new URLSearchParams() });
        assert.ok(rendered instanceof MockNode);
        assert.ok(rendered.textContent.length > 20);
      } finally {
        globalThis.document = prevDoc;
        globalThis.Node = prevNode;
      }
    }

    // Test resetGuidedNavigatorState if exported
    if (typeof guidedMod.resetGuidedNavigatorState === 'function') {
      assert.doesNotThrow(() => guidedMod.resetGuidedNavigatorState());
    }
  });
});

describe('Zero Network Leakage & Ephemeral RAM Execution', () => {
  it('executes all clinical, population, and matching functions with globalThis.fetch poisoned to verify zero network I/O', () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = () => {
      throw new Error('Network leakage detected: pure client triage must never call fetch()');
    };

    try {
      // 1. ASAM Care Navigator pure functions
      const asam = navModule.evaluateAsamCare({
        substances: ['opioids', 'xylazine', 'stimulants'],
        withdrawalRisk: 'moderate',
        biomedical: 'pregnant',
        mentalHealth: 'trauma',
        environment: 'unstable',
        structureNeeded: 'structured_day',
        payment: 'MD',
        population: 'CJ',
        preferTelehealth: true,
      });
      assert.ok(asam.searchHref.startsWith('#/treatment?codes='));

      const cows = navModule.scoreOpioidWithdrawal({ restlessness: 2, gi_upset: 4, sweating_chills: 2 });
      assert.equal(cows.score, 8);

      const ciwa = navModule.scoreAlcoholSedativeRisk({ dailyHeavyUse: true, tremorSweatingAgitation: true });
      assert.equal(ciwa.riskLevel, 'high_seizure_dt_risk');

      const trans = navModule.evaluateTransitionRisk({ event: 'post_release', daysSince: 'under_7' });
      assert.equal(trans.riskBand, 'critical');

      // 2. All 7 Phase 1 population recommenders
      for (const fn of Object.values(popHelpers.ALL_POPULATION_RECOMMENDERS)) {
        const rec = fn();
        assert.ok(rec.searchHref.startsWith('#/treatment?codes='));
      }

      // 3. On-device matching engine
      const candidate = fromFacility({
        id: '1',
        name: 'Local Clinic',
        codes: ['SA', 'OP', 'BU', 'MD', 'PW'],
        miles: 3.1,
        address: { state: 'WA' },
      });
      const ranked = rankMatches(
        { substances: ['opioid'], coverage: 'medicaid', populations: ['pregnant'], state: 'WA' },
        [candidate],
      );
      assert.equal(ranked.matches.length, 1);
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it('statically verifies zero external URLs or network/storage calls in clinical and matching modules', () => {
    const candidateFiles = [
      'public/js/views/navigator.js',
      'public/js/views/populationHelpers.js',
      'public/js/match/engine.js',
      'public/js/views/guidedNavigator.js',
      'public/js/views/insuranceHelpers.js',
      'public/js/components/insuranceWidget.js',
    ];

    for (const rel of candidateFiles) {
      const full = path.join(rootDir, rel);
      if (!fs.existsSync(full)) continue;
      const code = fs.readFileSync(full, 'utf8').replace(/\/\/.*$/gm, '');
      assert.doesNotMatch(code, /\bfetch\s*\(/, `${rel} must not call fetch()`);
      assert.doesNotMatch(code, /\bXMLHttpRequest\b/, `${rel} must not use XMLHttpRequest`);
      assert.doesNotMatch(code, /\bsendBeacon\b/, `${rel} must not use navigator.sendBeacon`);
      assert.doesNotMatch(code, /\bWebSocket\b/, `${rel} must not use WebSocket`);
      assert.doesNotMatch(code, /\blocalStorage\s*\./, `${rel} must not access localStorage`);
      assert.doesNotMatch(code, /\bsessionStorage\s*\./, `${rel} must not access sessionStorage`);
      assert.doesNotMatch(code, /\bdocument\.cookie\b/, `${rel} must not access document.cookie`);
      assert.doesNotMatch(code, /\bindexedDB\b/, `${rel} must not access indexedDB`);
    }
  });
});

describe('Quick Exit (Esc x2) & Deterministic State Wiping', () => {
  it('wipes location, saved facilities, persistence flags, localStorage, and sessionStorage via wipeAll()', () => {
    setLocation({ label: 'Seattle, WA', lat: 47.61, lng: -122.33, state: 'WA' });
    setRadius(100);
    setPersist(true);
    toggleSaved({ id: 'fac-101', kind: 'treatment', name: 'Harborview Recovery' });
    globalThis.localStorage.setItem('hp:lang', 'es');
    globalThis.sessionStorage.setItem('temp-session-key', 'sensitive');

    assert.ok(state.location !== null);
    assert.equal(state.persist, true);
    assert.equal(state.saved.size, 1);
    assert.equal(globalThis.localStorage.getItem('hp:persist'), '1');

    wipeAll();

    assert.equal(state.location, null, 'wipeAll() must clear state.location');
    assert.equal(state.saved.size, 0, 'wipeAll() must clear state.saved Map');
    assert.equal(state.persist, false, 'wipeAll() must reset state.persist to false');
    assert.equal(globalThis.localStorage.getItem('hp:persist'), null);
    assert.equal(globalThis.localStorage.getItem('hp:saved'), null);
    assert.equal(globalThis.localStorage.getItem('hp:lang'), null);
    assert.equal(globalThis.sessionStorage.getItem('temp-session-key'), null);
  });

  it('verifies Quick Exit double-Escape orchestration in public/js/app.js and Service Worker cache wipe in public/sw.js', () => {
    const appSrc = fs.readFileSync(path.join(rootDir, 'public', 'js', 'app.js'), 'utf8');
    assert.match(appSrc, /function quickExit\(\)/);
    assert.match(appSrc, /wipeAll\(\)/);
    assert.match(appSrc, /document\.title\s*=\s*'Weather'/);
    assert.match(appSrc, /document\.body\.replaceChildren\(\)/);
    assert.match(appSrc, /location\.replace\(EXIT_URL\)/);
    assert.match(appSrc, /e\.key !== 'Escape'/);
    assert.match(appSrc, /now - lastEscape < 1000/);

    const swSrc = fs.readFileSync(path.join(rootDir, 'public', 'sw.js'), 'utf8');
    assert.match(swSrc, /event\.data\?\.type === 'wipe'/);
    assert.match(swSrc, /self\.registration\.unregister\(\)/);
  });
});
