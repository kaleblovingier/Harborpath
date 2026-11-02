// Wave 7 Multi-Module Integration & Contract Verification Test Suite
//
// Validates multi-module integration contracts across Wave 7:
// 1. Perinatal Substance Use Care Pathways (`public/js/views/perinatal.js`)
// 2. Test Strip Dilution Simulator & Result Visualizer (`public/js/components/testStripCalculator.js`)
// 3. Mutual Aid & Peer Recovery Ecosystem (`public/js/components/mutualAidFinder.js`)
// 4. Border-State Geo Matching (`src/regions.js` and `/api/region`, `/api/nearby-summary`)
//
// Strict Constraints Enforced:
// - Zero npm dependencies (Node 20+ built-ins only: `node:test`, `node:assert/strict`, `node:http`, `node:fs`, `node:path`, `node:url`)
// - Zero innerHTML, outerHTML, or inline style= attributes across all client modules
// - Zero PII logging, cookies, localStorage, sessionStorage, or persistent client storage
// - Deterministic reset functions across all stateful components
// - Resilient error handling (null, undefined, invalid types handled gracefully without unhandled exceptions)

import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, '..');
const peerWorktreesDir = path.resolve(rootDir, '..');

// ============================================================================
// 1. Lightweight Mock DOM Environment for Node.js (Zero Dependencies)
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
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this._textContent = '';
    this.isConnected = true;
    this.parent = null;
    this.classList = new MockClassList(this);
  }

  get id() {
    return this.getAttribute('id') || '';
  }
  set id(val) {
    this.setAttribute('id', val);
  }

  get firstChild() {
    return this.children[0] ?? null;
  }
  get lastChild() {
    return this.children[this.children.length - 1] ?? null;
  }
  get parentNode() {
    return this.parent;
  }
  get parentElement() {
    return this.parent;
  }

  get textContent() {
    if (this.tagName === '#TEXT') return this._textContent;
    return this.children.map((c) => c.textContent).join('');
  }
  set textContent(val) {
    this.children = [];
    this._textContent = '';
    if (val !== null && val !== undefined) {
      const textNode = new MockNode('#text');
      textNode._textContent = String(val);
      textNode.parent = this;
      this.children.push(textNode);
    }
  }

  get innerHTML() {
    return this.textContent;
  }
  set innerHTML(val) {
    this.textContent = val;
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'id') this.attributes.id = val;
    if (k === 'class') this.className = val;
    if (k === 'hidden') this.hidden = true;
    if (k === 'value') this.value = val;
    if (k === 'checked') this.checked = true;
    if (k === 'disabled') this.disabled = true;
  }

  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  hasAttribute(k) {
    return Object.hasOwn(this.attributes, k);
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'hidden') this.hidden = false;
    if (k === 'disabled') this.disabled = false;
  }

  addEventListener(evt, fn) {
    (this.listeners[evt] = this.listeners[evt] || []).push(fn);
  }

  removeEventListener(evt, fn) {
    if (!this.listeners[evt]) return;
    this.listeners[evt] = this.listeners[evt].filter((h) => h !== fn);
  }

  dispatchEvent(event) {
    const type = typeof event === 'string' ? event : event?.type;
    const evtObj = typeof event === 'string' ? { type: event, target: this } : { ...event, target: this };
    const handlers = this.listeners[type] || [];
    for (const h of handlers) h.call(this, evtObj);
    return true;
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  focus() {}
  blur() {}

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        const textNode = new MockNode('#text');
        textNode._textContent = String(item);
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

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const results = [];
    const selectors = selector.split(',').map((s) => s.trim());

    this.findAll((node) => {
      return selectors.some((sel) => {
        const attrMatch = sel.match(/^\[([a-zA-Z0-9_-]+)(?:=(['"]?)(.*?)\2)?\]$/);
        if (attrMatch) {
          const [, attr, , val] = attrMatch;
          if (!node.hasAttribute(attr)) return false;
          if (val !== undefined) return node.getAttribute(attr) === val;
          return true;
        }
        if (sel.startsWith('.')) {
          return node.classList.contains(sel.slice(1));
        }
        if (sel.startsWith('#')) {
          return node.getAttribute('id') === sel.slice(1);
        }
        return node.tagName === sel.toUpperCase();
      });
    }, results);
    return results;
  }

  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(pred, acc);
    }
    return acc;
  }
}

// Global DOM stubbing for Node.js execution
const mockBody = new MockNode('body');
const mockDocEl = new MockNode('html');
const mockAnnouncer = new MockNode('div');
mockAnnouncer.setAttribute('id', 'announcer');
mockBody.append(mockAnnouncer);

globalThis.Node = MockNode;
globalThis.document = {
  body: mockBody,
  documentElement: mockDocEl,
  createElement: (t) => new MockNode(t),
  createElementNS: (_ns, t) => new MockNode(t),
  getElementById: (id) => {
    if (id === 'app' || id === 'main') return new MockNode('div');
    if (id === 'announcer') return mockAnnouncer;
    return mockBody.querySelector(`#${id}`);
  },
  querySelector: (sel) => mockBody.querySelector(sel),
  querySelectorAll: (sel) => mockBody.querySelectorAll(sel),
  addEventListener: () => {},
  removeEventListener: () => {},
};

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: (q) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }),
  location: { hash: '' },
  dispatchEvent: () => true,
};

try {
  if (globalThis.navigator) {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: async () => {} },
      configurable: true,
      writable: true,
    });
  } else {
    globalThis.navigator = { clipboard: { writeText: async () => {} } };
  }
} catch (_) {}

// ============================================================================
// 2. Dynamic Wave 7 File Resolver (Workspace & Peer Worktrees Support)
// ============================================================================

function resolveWave7File(relPath, subagentHint) {
  // 1. Peer worktree path with hint (where Wave 7 subagent wrote changes)
  if (subagentHint && fs.existsSync(peerWorktreesDir)) {
    try {
      const peers = fs.readdirSync(peerWorktreesDir);
      for (const peer of peers) {
        if (peer.includes(subagentHint)) {
          const cand = path.resolve(peerWorktreesDir, peer, relPath);
          if (fs.existsSync(cand)) return cand;
        }
      }
    } catch (_) {}
  }

  // 2. Scan peer worktrees directory for matching file
  if (fs.existsSync(peerWorktreesDir)) {
    try {
      const peers = fs.readdirSync(peerWorktreesDir);
      for (const peer of peers) {
        if (peer.startsWith('subagent-')) {
          const cand = path.resolve(peerWorktreesDir, peer, relPath);
          if (fs.existsSync(cand)) return cand;
        }
      }
    } catch (_) {}
  }

  // 3. Local workspace path
  const localPath = path.resolve(rootDir, relPath);
  if (fs.existsSync(localPath)) return localPath;

  return null;
}

// Target Wave 7 files resolution
const perinatalPath = resolveWave7File(
  'public/js/views/perinatal.js',
  'Perinatal'
);
const testStripPath = resolveWave7File(
  'public/js/components/testStripCalculator.js',
  'Harm-Reduction'
);
const mutualAidPath = resolveWave7File(
  'public/js/components/mutualAidFinder.js',
  'Recovery-Ally'
);
const regionsPath = resolveWave7File(
  'src/regions.js',
  'Border-State'
);
const appPath = resolveWave7File(
  'src/app.js',
  'Border-State'
);

// Dynamic module handles
let perinatalModule;
let testStripModule;
let mutualAidModule;
let regionsModule;
let appModule;

// In-process HTTP test server
let server;
let baseUrl;

before(async () => {
  if (perinatalPath) perinatalModule = await import(pathToFileURL(perinatalPath).href);
  if (testStripPath) testStripModule = await import(pathToFileURL(testStripPath).href);
  if (mutualAidPath) mutualAidModule = await import(pathToFileURL(mutualAidPath).href);
  if (regionsPath) regionsModule = await import(pathToFileURL(regionsPath).href);

  if (appPath) {
    appModule = await import(pathToFileURL(appPath).href);
    const handler = appModule.createApp({
      fetchImpl: async () => new Response(JSON.stringify({}), { status: 200 }),
      logger: { error() {}, warn() {}, info() {} },
    });
    server = createServer(handler);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  }
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

beforeEach(() => {
  mockBody.className = '';
  mockDocEl.className = '';
  mockBody.children = [mockAnnouncer];
});

// ============================================================================
// SUITE 1: Package Integrity, Zero-Dependencies & Strict Security Hygiene
// ============================================================================

describe('Wave 7 Architecture & Zero-Dependency Audit', () => {
  test('package.json strictly enforces 0 npm runtime dependencies and Node >= 20', () => {
    const pkgPath = path.resolve(rootDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Zero npm dependencies constraint
    assert.equal(pkg.dependencies, undefined, 'package.json must have 0 npm runtime dependencies');
    assert.ok(
      !pkg.devDependencies || Object.keys(pkg.devDependencies).length === 0,
      'package.json must not rely on external devDependencies'
    );

    // Node engine & ES module configuration
    assert.ok(pkg.engines && pkg.engines.node, 'engines.node must be defined');
    assert.match(pkg.engines.node, />=\s*20/, 'engines.node must require Node >= 20');
    assert.equal(pkg.type, 'module', 'Root package must be configured as native ES modules');
    assert.equal(pkg.scripts?.test, 'node --test', 'Test runner must use native node --test');
  });

  test('all Wave 7 target files exist and adhere to native ES module imports with 0 third-party packages', () => {
    const paths = [
      { name: 'perinatal.js', path: perinatalPath },
      { name: 'testStripCalculator.js', path: testStripPath },
      { name: 'mutualAidFinder.js', path: mutualAidPath },
      { name: 'regions.js', path: regionsPath },
      { name: 'app.js', path: appPath },
    ];

    for (const item of paths) {
      assert.ok(item.path && fs.existsSync(item.path), `Wave 7 file ${item.name} must exist on disk`);
      if (item.name.endsWith('.js')) {
        const code = fs.readFileSync(item.path, 'utf8');

        // Verify import specifiers: must only import relative paths or node: built-ins
        const importRegex = /import\s+[^'"]*?['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
          const specifier = match[1];
          const isAllowed =
            specifier.startsWith('./') ||
            specifier.startsWith('../') ||
            specifier.startsWith('/') ||
            specifier.startsWith('node:');
          assert.ok(
            isAllowed,
            `File ${item.name} imports forbidden non-builtin package: "${specifier}"`
          );
        }
      }
    }
  });

  test('Wave 7 client modules contain zero innerHTML, outerHTML, insertAdjacentHTML, or inline style=', () => {
    const clientFiles = [
      { name: 'perinatal.js', path: perinatalPath },
      { name: 'testStripCalculator.js', path: testStripPath },
      { name: 'mutualAidFinder.js', path: mutualAidPath },
    ];

    for (const f of clientFiles) {
      if (!f.path) continue;
      const code = fs.readFileSync(f.path, 'utf8');
      assert.doesNotMatch(
        code,
        /\.innerHTML\s*=/,
        `${f.name} must never assign innerHTML (XSS risk, CSP violation)`
      );
      assert.doesNotMatch(
        code,
        /\.outerHTML\s*=/,
        `${f.name} must never assign outerHTML (XSS risk, CSP violation)`
      );
      assert.doesNotMatch(
        code,
        /\.insertAdjacentHTML\s*\(/,
        `${f.name} must never call insertAdjacentHTML`
      );
      assert.doesNotMatch(
        code,
        /style\s*=\s*['"][^'"]*['"]/,
        `${f.name} must never contain inline style= attributes (CSP requirement)`
      );
    }
  });
});

// ============================================================================
// SUITE 2: Zero PII Logging & Persistent Storage Guarantee
// ============================================================================

describe('Wave 7 Zero-PII & Ephemeral In-RAM Confidentiality', () => {
  test('Wave 7 files never write to localStorage, sessionStorage, document.cookie, or indexedDB', () => {
    const wave7Files = [
      perinatalPath,
      testStripPath,
      mutualAidPath,
      regionsPath,
      appPath,
    ].filter(Boolean);

    for (const file of wave7Files) {
      const code = fs.readFileSync(file, 'utf8');
      assert.doesNotMatch(
        code,
        /localStorage\s*\.\s*setItem/,
        `File ${path.basename(file)} must not write to localStorage`
      );
      assert.doesNotMatch(
        code,
        /sessionStorage\s*\.\s*setItem/,
        `File ${path.basename(file)} must not write to sessionStorage`
      );
      assert.doesNotMatch(
        code,
        /document\s*\.\s*cookie\s*=/,
        `File ${path.basename(file)} must not set document.cookie`
      );
      assert.doesNotMatch(
        code,
        /indexedDB/,
        `File ${path.basename(file)} must not access indexedDB`
      );
    }
  });

  test('formatPerinatalSummaryText carries clinical educational disclaimer and zero patient identifiers', () => {
    assert.ok(perinatalModule, 'perinatalModule must be loaded');
    assert.equal(
      typeof perinatalModule.formatPerinatalSummaryText,
      'function',
      'formatPerinatalSummaryText must be exported'
    );

    const testState = {
      lang: 'en',
      checklist: {
        moud_maintenance: true,
        esc_consult: true,
        safe_care_plan: true,
      },
      activeTab: 'guidelines',
    };

    const text = perinatalModule.formatPerinatalSummaryText(testState);
    assert.equal(typeof text, 'string');
    assert.ok(text.length > 50, 'Report text should provide meaningful clinical guidance');

    // Must carry educational self-advocacy disclaimer
    assert.match(
      text,
      /(educational|informational|not a (medical )?diagnosis|consult a licensed clinician|clinical guidance|harborpath)/i,
      'Perinatal report text must carry explicit educational disclaimer'
    );

    // Must NEVER contain patient identification fields
    assert.doesNotMatch(text, /\bSSN\b|Social Security Number/i);
    assert.doesNotMatch(text, /\bDate of Birth\b|\bDOB\b/i);
    assert.doesNotMatch(text, /\bMedical Record Number\b|\bMRN\b/i);
    assert.doesNotMatch(text, /\bIP Address\b/i);
  });

  test('Backend request handler enforces coarsened zero-PII queries without logging visitor coordinates or IP', () => {
    assert.ok(appPath, 'src/app.js must exist');
    const code = fs.readFileSync(appPath, 'utf8');

    assert.doesNotMatch(
      code,
      /console\.log\(.*(req\.headers\['x-forwarded-for'\]|socket\.remoteAddress|user-agent)/i,
      'app.js must never log raw visitor IP or User-Agent'
    );
  });
});

// ============================================================================
// SUITE 3: Deterministic Reset Functions & Ephemeral RAM State
// ============================================================================

describe('Wave 7 Deterministic Resets & Quick Exit Contracts', () => {
  test('all stateful Wave 7 components export deterministic reset functions', () => {
    assert.ok(perinatalModule, 'perinatalModule must be loaded');
    assert.ok(testStripModule, 'testStripModule must be loaded');
    assert.ok(mutualAidModule, 'mutualAidModule must be loaded');

    assert.equal(
      typeof perinatalModule.resetPerinatalState,
      'function',
      'perinatal.js must export resetPerinatalState()'
    );
    assert.equal(
      typeof testStripModule.resetTestStripState,
      'function',
      'testStripCalculator.js must export resetTestStripState()'
    );
    assert.equal(
      typeof mutualAidModule.resetMutualAidState,
      'function',
      'mutualAidFinder.js must export resetMutualAidState()'
    );
  });

  test('resetPerinatalState() idempotently restores clean initial ephemeral RAM state', () => {
    assert.ok(perinatalModule);
    perinatalModule.setPerinatalState({
      lang: 'es',
      activeTab: 'esc',
      trimester: 'third',
      checklist: { item1: true, item2: true },
    });

    const populated = perinatalModule.getPerinatalState();
    assert.equal(populated.activeTab, 'esc');
    assert.equal(populated.trimester, 'third');

    // First reset
    perinatalModule.resetPerinatalState();
    const clean1 = perinatalModule.getPerinatalState();
    assert.equal(clean1.activeTab, 'guidelines');
    assert.equal(clean1.trimester, 'all');
    assert.deepEqual(clean1.checklist, {});

    // Idempotent second reset
    perinatalModule.resetPerinatalState();
    const clean2 = perinatalModule.getPerinatalState();
    assert.deepEqual(clean1, clean2);
  });

  test('resetTestStripState() idempotently restores clean initial state and cancels running timers', () => {
    assert.ok(testStripModule);
    testStripModule.setSelectedSubstance('opioids');
    testStripModule.setSampleAmount(50);
    testStripModule.setSelectedInterpretation('positive');
    testStripModule.startDipTimer();

    const dirty = testStripModule.getTestStripState();
    assert.equal(dirty.substance, 'opioids');
    assert.equal(dirty.amountMg, 50);
    assert.equal(dirty.selectedInterpretation, 'positive');

    testStripModule.resetTestStripState();
    const clean1 = testStripModule.getTestStripState();
    assert.equal(clean1.substance, 'stimulants');
    assert.equal(clean1.amountMg, 10);
    assert.equal(clean1.selectedInterpretation, null);
    assert.equal(clean1.dipTimer.active, false);
    assert.equal(clean1.incubationTimer.active, false);

    testStripModule.resetTestStripState();
    const clean2 = testStripModule.getTestStripState();
    assert.deepEqual(clean1, clean2);
  });

  test('resetMutualAidState() idempotently restores clean default filters and directory view', () => {
    assert.ok(mutualAidModule);
    const initial = mutualAidModule.getMutualAidState();
    assert.equal(initial.philosophy, 'all');
    assert.equal(initial.format, 'all');
    assert.equal(initial.moudAffirmingOnly, false);
    assert.equal(initial.viewMode, 'directory');

    // Dirty state
    initial.philosophy = 'secular';
    initial.moudAffirmingOnly = true;
    initial.viewMode = 'matrix';

    mutualAidModule.resetMutualAidState();
    const clean1 = mutualAidModule.getMutualAidState();
    assert.equal(clean1.philosophy, 'all');
    assert.equal(clean1.moudAffirmingOnly, false);
    assert.equal(clean1.viewMode, 'directory');

    mutualAidModule.resetMutualAidState();
    const clean2 = mutualAidModule.getMutualAidState();
    assert.deepEqual(clean1, clean2);
  });

  test('coordinated multi-module Quick Exit sweeps all Wave 7 ephemeral states simultaneously', () => {
    assert.ok(perinatalModule && testStripModule && mutualAidModule);

    // 1. Dirty state across all 3 modules
    perinatalModule.setPerinatalState({ activeTab: 'capta', checklist: { test: true } });
    testStripModule.setSelectedSubstance('pills');
    testStripModule.setSelectedInterpretation('positive');

    // 2. Coordinated sweep
    perinatalModule.resetPerinatalState();
    testStripModule.resetTestStripState();
    mutualAidModule.resetMutualAidState();

    // 3. Verify all modules returned to pure defaults
    const periClean = perinatalModule.getPerinatalState();
    const stripClean = testStripModule.getTestStripState();
    const aidClean = mutualAidModule.getMutualAidState();

    assert.equal(periClean.activeTab, 'guidelines');
    assert.deepEqual(periClean.checklist, {});
    assert.equal(stripClean.substance, 'stimulants');
    assert.equal(stripClean.selectedInterpretation, null);
    assert.equal(aidClean.philosophy, 'all');
    assert.equal(aidClean.viewMode, 'directory');
  });
});

// ============================================================================
// SUITE 4: Perinatal Substance Use Care Pathways Contract (perinatal.js)
// ============================================================================

describe('Perinatal Substance Use Care Pathways Contract (public/js/views/perinatal.js)', () => {
  test('exports core clinical guidelines, ESC pillars, and legal advocacy checklists', () => {
    assert.ok(perinatalModule.PERINATAL_GUIDELINES, 'PERINATAL_GUIDELINES must be exported');
    assert.ok(perinatalModule.ESC_MODEL_PILLARS, 'ESC_MODEL_PILLARS must be exported');
    assert.ok(perinatalModule.CAPTA_RIGHTS_CHECKLIST, 'CAPTA_RIGHTS_CHECKLIST must be exported');
    assert.ok(perinatalModule.PRENATAL_CHECKLIST_ITEMS, 'PRENATAL_CHECKLIST_ITEMS must be exported');
    assert.ok(perinatalModule.OBGYN_VISIT_QUESTIONS, 'OBGYN_VISIT_QUESTIONS must be exported');

    assert.ok(Array.isArray(perinatalModule.PERINATAL_GUIDELINES));
    assert.ok(Array.isArray(perinatalModule.ESC_MODEL_PILLARS));
    assert.ok(Array.isArray(perinatalModule.CAPTA_RIGHTS_CHECKLIST));
    assert.ok(perinatalModule.PERINATAL_GUIDELINES.length >= 5);
    assert.ok(perinatalModule.ESC_MODEL_PILLARS.length >= 3);
  });

  test('ACOG & SMFM MOUD maintenance: detoxification/withdrawal is strictly contraindicated', () => {
    const guidelines = perinatalModule.PERINATAL_GUIDELINES;
    const moud = guidelines.find((g) => g.id === 'moud_standard_of_care') || guidelines.moud_standard_of_care;
    assert.ok(moud, 'moud_standard_of_care guideline must be present');

    const moudText = `${moud.summary.en} ${JSON.stringify(moud.keyPoints)}`;
    assert.match(moudText, /methadone|buprenorphine/i);
    assert.match(moudText, /standard of care/i);
    assert.match(moudText, /detox|withdrawal/i);
    assert.match(moudText, /contraindicated/i);
  });

  test('Labor & Delivery pain management: multimodal analgesia and mixed agonist-antagonist contraindication', () => {
    const guidelines = perinatalModule.PERINATAL_GUIDELINES;
    const pain = guidelines.find((g) => g.id === 'labor_delivery_pain') || guidelines.labor_delivery_pain;
    assert.ok(pain, 'labor_delivery_pain guideline must be present');

    const painText = `${pain.summary.en} ${JSON.stringify(pain.keyPoints)}`;
    assert.match(painText, /multimodal/i);
    assert.match(painText, /epidural|neuraxial/i);
    assert.match(painText, /butorphanol|Stadol|nalbuphine|Nubain/i);
    assert.match(painText, /precipitate.*withdrawal/i);
  });

  test('Eat, Sleep, Console (ESC) model functional assessment & non-pharmacological bundle', () => {
    const pillars = perinatalModule.ESC_MODEL_PILLARS;
    const eat = pillars.find((p) => p.id === 'eat') || pillars.eat;
    const sleep = pillars.find((p) => p.id === 'sleep') || pillars.sleep;
    const consolePillar = pillars.find((p) => p.id === 'console') || pillars.console;

    assert.ok(eat, 'Eat pillar must be present');
    assert.ok(sleep, 'Sleep pillar must be present');
    assert.ok(consolePillar, 'Console pillar must be present');

    assert.match(`${eat.title.en} ${eat.benchmark.en}`, /feed|10.*15.*min|mL/i);
    assert.match(`${sleep.title.en} ${sleep.benchmark.en}`, /sleep|1 hour|hour/i);
    assert.match(`${consolePillar.title.en} ${consolePillar.benchmark.en}`, /console|10 min/i);
  });

  test('CAPTA Plans of Safe Care: Non-punitive healthcare support vs child welfare reports', () => {
    const checklist = perinatalModule.CAPTA_RIGHTS_CHECKLIST;
    const posc = checklist.find((c) => c.id === 'posc_vs_cps') || checklist.posc_vs_cps;
    assert.ok(posc, 'posc_vs_cps item must be present');

    const fullPoscText = JSON.stringify(posc);
    assert.match(fullPoscText, /Plan of Safe Care|POSC/i);
    assert.match(fullPoscText, /supportive|not.*child abuse/i);
  });

  test('perinatalView renders accessible DOM tree with headings, guidelines, and controls', () => {
    const el = perinatalModule.perinatalView();
    assert.ok(el instanceof MockNode, 'perinatalView must return a MockNode DOM element');
    assert.ok(el.classList.contains('view-perinatal'));

    const h1 = el.querySelector('h1');
    assert.ok(h1, 'perinatalView must contain an accessible h1');
    assert.match(h1.textContent, /perinatal|embarazo/i);

    const sections = el.querySelectorAll('section');
    assert.ok(sections.length >= 4, 'Must render guidelines, ESC, CAPTA, and checklist sections');
  });
});

// ============================================================================
// SUITE 5: Test Strip Dilution Simulator & Result Visualizer Contract
// ============================================================================

describe('Test Strip Dilution Simulator Contract (public/js/components/testStripCalculator.js)', () => {
  test('exports dilution protocols, result decoders, and procedural timer methods', () => {
    assert.ok(testStripModule.DILUTION_PROTOCOLS, 'DILUTION_PROTOCOLS must be exported');
    assert.ok(testStripModule.TEST_STRIP_INTERPRETATIONS, 'TEST_STRIP_INTERPRETATIONS must be exported');
    assert.equal(typeof testStripModule.calculateDilutionRatio, 'function');
    assert.equal(typeof testStripModule.testStripCalculator, 'function');
    assert.equal(typeof testStripModule.startDipTimer, 'function');
    assert.equal(typeof testStripModule.startIncubationTimer, 'function');
  });

  test('DILUTION_PROTOCOLS defines stimulant cross-reactivity and opioid dilution math', () => {
    const protocols = testStripModule.DILUTION_PROTOCOLS;
    assert.ok(protocols.stimulants, 'stimulants protocol must exist');
    assert.ok(protocols.opioids, 'opioids protocol must exist');

    // Stimulants: 5 mL (1 tsp) per 10 mg scraping, 120 mL (1/2 cup) per 100 mg dose
    assert.equal(protocols.stimulants.standardRatioPer10mgMl, 5.0);
    assert.equal(protocols.stimulants.fullDoseRatioPer100mgMl, 120.0);
    assert.match(protocols.stimulants.crossReactivityWarning, /cross-reactivity|false-positive/i);

    // Opioids: standard 2.5 mL (1/2 tsp) per 10 mg
    assert.equal(protocols.opioids.standardRatioPer10mgMl, 2.5);
  });

  test('calculateDilutionRatio calculates correct water volumes across substance scenarios', () => {
    // 10 mg stimulant scraping -> 5 mL
    const stim10 = testStripModule.calculateDilutionRatio({ substance: 'stimulants', amountMg: 10 });
    assert.equal(stim10.waterMl, 5.0);
    assert.equal(stim10.substance, 'stimulants');
    assert.equal(stim10.crossReactivityWarning, true);

    // 100 mg stimulant dose -> 120 mL (1/2 cup)
    const stim100 = testStripModule.calculateDilutionRatio({ substance: 'methamphetamine', amountMg: 100 });
    assert.equal(stim100.waterMl, 120.0);

    // 10 mg opioid powder -> 2.5 mL
    const op10 = testStripModule.calculateDilutionRatio({ substance: 'fentanyl', amountMg: 10 });
    assert.equal(op10.waterMl, 2.5);
    assert.equal(op10.substance, 'opioids');

    // Pressed counterfeit pills -> requires crushing
    const pill = testStripModule.calculateDilutionRatio({ substance: 'pressed pills', amountMg: 10 });
    assert.equal(pill.substance, 'pills');
    assert.match(pill.warningText, /crush.*powder/i);
  });

  test('TEST_STRIP_INTERPRETATIONS accurately decodes 1 Line (Positive), 2 Lines (Negative), and Invalid', () => {
    const interp = testStripModule.TEST_STRIP_INTERPRETATIONS;
    assert.ok(interp.positive, 'positive interpretation must exist');
    assert.ok(interp.negative, 'negative interpretation must exist');
    assert.ok(interp.invalid, 'invalid interpretation must exist');

    // 1 Line = Positive (Control line only)
    assert.equal(interp.positive.lines, 1);
    assert.equal(interp.positive.hasControlLine, true);
    assert.equal(interp.positive.hasTestLine, false);
    assert.match(interp.positive.summary, /POSITIVE for fentanyl or xylazine.*fatal overdose/i);

    // 2 Lines = Negative (Control + Test lines) with "Chocolate chip cookie effect" warning
    assert.equal(interp.negative.lines, 2);
    assert.equal(interp.negative.hasControlLine, true);
    assert.equal(interp.negative.hasTestLine, true);
    const negCaveats = JSON.stringify(interp.negative.actionSteps);
    assert.match(negCaveats, /chocolate chip cookie effect/i);
    assert.match(negCaveats, /nitazene|synthetic analogue/i);

    // Invalid = 0 Lines or Test line only
    assert.equal(interp.invalid.lines, 0);
    assert.match(interp.invalid.summary, /INVALID.*fresh strip/i);
  });

  test('procedural timers: 15s immersion dip timer and 2-to-5 minute incubation timer transitions', () => {
    testStripModule.resetTestStripState();

    // Dip timer (15s)
    testStripModule.startDipTimer();
    assert.equal(testStripModule.getTestStripState().dipTimer.active, true);
    testStripModule.tickDipTimer(15);
    assert.equal(testStripModule.getTestStripState().dipTimer.active, false);
    assert.equal(testStripModule.getTestStripState().dipTimer.completed, true);
    assert.equal(testStripModule.getTestStripState().dipTimer.remainingSeconds, 0);

    // Incubation timer (120s - 300s)
    testStripModule.setIncubationTarget(120);
    testStripModule.startIncubationTimer();
    assert.equal(testStripModule.getTestStripState().incubationTimer.active, true);
    testStripModule.tickIncubationTimer(120);
    assert.equal(testStripModule.getTestStripState().incubationTimer.active, false);
    assert.equal(testStripModule.getTestStripState().incubationTimer.completed, true);
    assert.equal(testStripModule.getTestStripState().incubationTimer.remainingSeconds, 0);
  });

  test('testStripCalculator DOM component mounts with accessible form controls and timer controls', () => {
    const el = testStripModule.testStripCalculator();
    assert.ok(el instanceof MockNode);
    assert.ok(el.classList.contains('test-strip-calculator'));

    const buttons = el.querySelectorAll('button');
    assert.ok(buttons.length >= 4, 'Must have substance/timer/interpretation action buttons');

    // No inline styles
    assert.equal(el.getAttribute('style'), null);
  });
});

// ============================================================================
// SUITE 6: Mutual Aid & Peer Recovery Ecosystem Contract (mutualAidFinder.js)
// ============================================================================

describe('Mutual Aid & Peer Recovery Ecosystem Contract (public/js/components/mutualAidFinder.js)', () => {
  test('exports 4-philosophy taxonomy, program catalog, and filtering engine', () => {
    assert.ok(mutualAidModule.MUTUAL_AID_PHILOSOPHIES, 'MUTUAL_AID_PHILOSOPHIES must be exported');
    assert.ok(mutualAidModule.MUTUAL_AID_PROGRAMS, 'MUTUAL_AID_PROGRAMS must be exported');
    assert.equal(typeof mutualAidModule.filterMutualAidPrograms, 'function');
    assert.equal(typeof mutualAidModule.mutualAidFinder, 'function');
  });

  test('MUTUAL_AID_PHILOSOPHIES defines secular, mindfulness, MOUD-affirming, and 12-step stances', () => {
    const phils = mutualAidModule.MUTUAL_AID_PHILOSOPHIES;
    assert.ok(Array.isArray(phils));
    const ids = phils.map((p) => p.id);

    assert.ok(ids.includes('secular'), 'Must include secular philosophy (SMART, LifeRing)');
    assert.ok(ids.includes('mindfulness'), 'Must include mindfulness philosophy (Recovery Dharma, Refuge Recovery)');
    assert.ok(ids.includes('moud_affirming'), 'Must include moud_affirming philosophy (MARA, DRA, SMART)');
    assert.ok(ids.includes('twelve_step'), 'Must include twelve_step philosophy (AA, NA, CA)');
  });

  test('MUTUAL_AID_PROGRAMS distinguishes MOUD-affirming programs with strict clinical accuracy', () => {
    const progs = mutualAidModule.MUTUAL_AID_PROGRAMS;
    assert.ok(Array.isArray(progs));
    assert.ok(progs.length >= 8);

    const mara = progs.find((p) => p.id === 'mara');
    const smart = progs.find((p) => p.id === 'smart-recovery');
    const aa = progs.find((p) => p.id === 'alcoholics-anonymous');

    assert.ok(mara, 'MARA must exist');
    assert.ok(smart, 'SMART Recovery must exist');
    assert.ok(aa, 'AA must exist');

    // MARA and SMART are explicitly MOUD-affirming
    assert.equal(mara.isMoudAffirming, true);
    assert.equal(smart.isMoudAffirming, true);

    // Traditional 12-step does not have blanket universal MOUD affirmation
    assert.equal(aa.isMoudAffirming, false);
  });

  test('filterMutualAidPrograms filters by philosophy, format, and moudAffirmingOnly', () => {
    // Philosophy filter: secular
    const secular = mutualAidModule.filterMutualAidPrograms({ philosophy: 'secular' });
    assert.ok(secular.length > 0);
    assert.ok(secular.every((p) => p.philosophy === 'secular' || (p.philosophies && p.philosophies.includes('secular'))));

    // MOUD-affirming only filter
    const moudAffirming = mutualAidModule.filterMutualAidPrograms({ moudAffirmingOnly: true });
    assert.ok(moudAffirming.length > 0);
    assert.ok(moudAffirming.every((p) => p.isMoudAffirming === true));

    // Format filter: online_247
    const online = mutualAidModule.filterMutualAidPrograms({ format: 'online_247' });
    assert.ok(online.length > 0);
    assert.ok(online.every((p) => p.hasOnline247 === true));

    // Combined filter: secular + moudAffirmingOnly
    const combined = mutualAidModule.filterMutualAidPrograms({
      philosophy: 'secular',
      moudAffirmingOnly: true,
    });
    assert.ok(combined.length > 0);
    assert.ok(combined.every((p) => p.isMoudAffirming === true));
  });

  test('mutualAidFinder component mounts accessible directory view and comparison matrix', () => {
    const el = mutualAidModule.mutualAidFinder();
    assert.ok(el instanceof MockNode);
    assert.ok(el.classList.contains('mutual-aid-finder'));

    const searchSelects = el.querySelectorAll('select');
    assert.ok(searchSelects.length >= 1, 'Must render philosophy or format select control');

    const cards = el.querySelectorAll('.mutual-aid-card');
    assert.ok(cards.length >= 4, 'Must render program cards');
  });
});

// ============================================================================
// SUITE 7: Border-State Geo Matching Contract (src/regions.js & API)
// ============================================================================

describe('Border-State Geo Matching Contract (src/regions.js & HTTP API)', () => {
  test('getBorderingStates returns correct adjacent state codes for boundary states', () => {
    assert.ok(regionsModule, 'regionsModule must be loaded');
    assert.equal(typeof regionsModule.getBorderingStates, 'function');

    // Washington (WA) -> ID, OR
    const waBorders = regionsModule.getBorderingStates('WA');
    assert.ok(waBorders.includes('ID'), 'WA borders ID');
    assert.ok(waBorders.includes('OR'), 'WA borders OR');

    // District of Columbia (DC) -> MD, VA
    const dcBorders = regionsModule.getBorderingStates('DC');
    assert.ok(dcBorders.includes('MD'), 'DC borders MD');
    assert.ok(dcBorders.includes('VA'), 'DC borders VA');

    // Missouri (MO) -> 8 bordering states (IA, IL, KY, TN, AR, OK, KS, NE)
    const moBorders = regionsModule.getBorderingStates('MO');
    assert.equal(moBorders.length, 8);
    assert.ok(moBorders.includes('KS'));
    assert.ok(moBorders.includes('IL'));
    assert.ok(moBorders.includes('IA'));
  });

  test('getBorderingStates returns empty array [] for island jurisdictions and invalid codes', () => {
    // Non-contiguous / Island territories
    assert.deepEqual(regionsModule.getBorderingStates('HI'), []);
    assert.deepEqual(regionsModule.getBorderingStates('PR'), []);
    assert.deepEqual(regionsModule.getBorderingStates('GU'), []);
    assert.deepEqual(regionsModule.getBorderingStates('VI'), []);
    assert.deepEqual(regionsModule.getBorderingStates('AS'), []);
    assert.deepEqual(regionsModule.getBorderingStates('MP'), []);

    // Case-insensitivity & whitespace handling
    assert.ok(regionsModule.getBorderingStates('  wa  ').includes('OR'));
    assert.ok(regionsModule.getBorderingStates('dc').includes('VA'));

    // Defensive handling: invalid codes return []
    assert.deepEqual(regionsModule.getBorderingStates('ZZ'), []);
    assert.deepEqual(regionsModule.getBorderingStates(''), []);
    assert.deepEqual(regionsModule.getBorderingStates(null), []);
    assert.deepEqual(regionsModule.getBorderingStates(undefined), []);
  });

  test('GET /api/region?zip=98101 attaches borderingStates array with { code, name }', async () => {
    if (!baseUrl) return;
    const res = await fetch(`${baseUrl}/api/region?zip=98101`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.region.code, 'WA');
    assert.ok(Array.isArray(body.borderingStates), 'borderingStates must be an array');
    assert.ok(body.borderingStates.length >= 2, 'WA must have at least 2 bordering states');

    const codes = body.borderingStates.map((b) => b.code);
    assert.ok(codes.includes('ID'), 'Must include Idaho');
    assert.ok(codes.includes('OR'), 'Must include Oregon');

    for (const border of body.borderingStates) {
      assert.equal(typeof border.code, 'string');
      assert.equal(typeof border.name, 'string');
      assert.ok(border.name.length > 2);
    }
  });

  test('GET /api/region for island ZIP returns empty borderingStates []', async () => {
    if (!baseUrl) return;
    // Honolulu, HI
    const res = await fetch(`${baseUrl}/api/region?zip=96815`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.region.code, 'HI');
    assert.deepEqual(body.borderingStates, []);
  });

  test('GET /api/nearby-summary attaches borderingStates alongside networks and agency', async () => {
    if (!baseUrl) return;
    const res = await fetch(`${baseUrl}/api/nearby-summary?lat=47.6062&lng=-122.3321&radius=25`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.region.code, 'WA');
    assert.ok(Array.isArray(body.borderingStates));
    assert.ok(body.borderingStates.some((b) => b.code === 'OR'));
    assert.ok(body.agency);
    assert.ok(body.medicaid);
  });
});

// ============================================================================
// SUITE 8: Multi-Module Integration Scenarios, Data Flows & Defensive Edge Cases
// ============================================================================

describe('Wave 7 Multi-Module Integration Scenarios & Defensive Edge Cases', () => {
  test('Cross-Module Integration: Perinatal patient navigates to drug checking & mutual aid', () => {
    // 1. Patient reviews perinatal guidelines
    const perinatalGuidelines = perinatalModule.PERINATAL_GUIDELINES;
    assert.ok(perinatalGuidelines.length > 0);

    // 2. Patient tests harm reduction drug sample using testStripCalculator
    const dilution = testStripModule.calculateDilutionRatio({ substance: 'opioids', amountMg: 10 });
    assert.equal(dilution.waterMl, 2.5);

    // 3. Negative result decoder confirms "chocolate chip cookie effect" warning
    const negative = testStripModule.TEST_STRIP_INTERPRETATIONS.negative;
    assert.ok(negative.actionSteps.some((c) => /cookie effect/i.test(c)));

    // 4. Patient seeks MOUD-affirming peer support ecosystem
    const moudMutualAid = mutualAidModule.filterMutualAidPrograms({ moudAffirmingOnly: true });
    assert.ok(moudMutualAid.length >= 3);
    assert.ok(moudMutualAid.some((p) => p.id === 'mara'));
    assert.ok(moudMutualAid.some((p) => p.id === 'smart-recovery'));
  });

  test('Defensive Resilience: Null, undefined, empty objects, and invalid types handled safely', () => {
    // perinatalModule
    assert.doesNotThrow(() => perinatalModule.setPerinatalState(null));
    assert.doesNotThrow(() => perinatalModule.setPerinatalState(undefined));
    assert.doesNotThrow(() => perinatalModule.setPerinatalState({}));
    assert.doesNotThrow(() => perinatalModule.setPerinatalState('invalid-type'));
    assert.doesNotThrow(() => perinatalModule.formatPerinatalSummaryText());
    assert.doesNotThrow(() => perinatalModule.formatPerinatalSummaryText({}));
    assert.doesNotThrow(() => perinatalModule.perinatalView());
    assert.doesNotThrow(() => perinatalModule.perinatalView({}));

    // testStripModule
    assert.doesNotThrow(() => testStripModule.calculateDilutionRatio());
    assert.doesNotThrow(() => testStripModule.calculateDilutionRatio({ substance: null, amountMg: -100 }));
    assert.doesNotThrow(() => testStripModule.setSelectedSubstance(null));
    assert.doesNotThrow(() => testStripModule.setSampleAmount(null));
    assert.doesNotThrow(() => testStripModule.setSelectedInterpretation(null));
    assert.doesNotThrow(() => testStripModule.formatTime(null));
    assert.doesNotThrow(() => testStripModule.testStripCalculator());
    assert.doesNotThrow(() => testStripModule.testStripCalculator({}));

    // mutualAidModule
    assert.doesNotThrow(() => mutualAidModule.filterMutualAidPrograms());
    assert.doesNotThrow(() => mutualAidModule.filterMutualAidPrograms({ philosophy: 'NON_EXISTENT' }));
    assert.doesNotThrow(() => mutualAidModule.mutualAidFinder());
    assert.doesNotThrow(() => mutualAidModule.mutualAidFinder({}));

    // regionsModule
    assert.deepEqual(regionsModule.getBorderingStates(null), []);
    assert.deepEqual(regionsModule.getBorderingStates(12345), []);
    assert.deepEqual(regionsModule.getBorderingStates({}), []);
  });

  test('Defensive Resilience: Malformed API query parameters return valid responses without crashing server', async () => {
    if (!baseUrl) return;

    // Bad ZIP on /api/region -> 200 with region: null, borderingStates: []
    const res1 = await fetch(`${baseUrl}/api/region?zip=INVALID_ZIP`);
    assert.equal(res1.status, 200);
    const body1 = await res1.json();
    assert.equal(body1.region, null);
    assert.deepEqual(body1.borderingStates, []);

    // Empty query on /api/region -> returns 400 with clean validation error
    const res2 = await fetch(`${baseUrl}/api/region`);
    assert.equal(res2.status, 400);
    const body2 = await res2.json();
    assert.match(body2.error, /location is required|lat and lng/i);

    // Nearby summary with invalid coordinates returns 400 Bad Request safely
    const res3 = await fetch(`${baseUrl}/api/nearby-summary?lat=NaN&lng=undefined`);
    assert.equal(res3.status, 400);
  });
});
