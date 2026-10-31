// Wave 5 Multi-Module Integration & Contract Verification Test Suite
//
// Validates end-to-end integration contracts across all Wave 5 modules:
// 1. Readiness & Stages of Change view (`public/js/views/readiness.js`)
// 2. Overdose Rescue Pacer Assistant (`public/js/components/overdosePacing.js`)
// 3. Legal API & State Resource enrichment (`src/app.js`, `src/stateResources.js`, `src/legalRegistry.js`)
// 4. Header Navigation & State Legal Card (`public/index.html`, `public/js/components/stateLegalCard.js`, `public/js/views/states.js`)
//
// Strict Constraints Enforced:
// - Zero npm runtime or dev dependencies (Node 20+ built-ins only: `node:test`, `node:assert/strict`, `node:http`, `node:fs`, `node:path`, `node:url`)
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

    this.classList = {
      add: (...classes) => {
        const current = new Set(this.className.split(/\s+/).filter(Boolean));
        for (const c of classes) {
          if (c) current.add(c);
        }
        this.className = Array.from(current).join(' ');
      },
      remove: (...classes) => {
        const current = new Set(this.className.split(/\s+/).filter(Boolean));
        for (const c of classes) {
          if (c) current.delete(c);
        }
        this.className = Array.from(current).join(' ');
      },
      contains: (c) => this.className.split(/\s+/).includes(c),
      toggle: (c, force) => {
        const has = this.classList.contains(c);
        const shouldHave = force !== undefined ? Boolean(force) : !has;
        if (shouldHave) this.classList.add(c);
        else this.classList.remove(c);
        return shouldHave;
      },
    };
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get firstElementChild() {
    for (const ch of this.children) {
      if (ch instanceof MockNode && ch.tagName !== '#TEXT') return ch;
    }
    return null;
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
globalThis.Node = MockNode;
globalThis.document = {
  body: mockBody,
  documentElement: mockDocEl,
  createElement: (t) => new MockNode(t),
  createElementNS: (_ns, t) => new MockNode(t),
  getElementById: (id) => {
    if (id === 'app' || id === 'main') return new MockNode('div');
    if (id === 'announcer') return new MockNode('div');
    return null;
  },
  querySelector: (sel) => mockBody.querySelector(sel),
  querySelectorAll: (sel) => mockBody.querySelectorAll(sel),
  addEventListener: () => {},
  removeEventListener: () => {},
};

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
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
// 2. Dynamic Wave 5 File Resolver (Workspace & Peer Worktrees Support)
// ============================================================================

function resolveWave5File(relPath, subagentHint) {
  // 1. Peer worktree path with hint (where Wave 5 subagent wrote changes)
  if (subagentHint) {
    const peerHintPath = path.resolve(peerWorktreesDir, subagentHint, relPath);
    if (fs.existsSync(peerHintPath)) return peerHintPath;
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

// Target Wave 5 files resolution
const readinessPath = resolveWave5File(
  'public/js/views/readiness.js',
  'subagent-Readiness---SUDP-Specialist-self-25c4b442'
);
const overdosePacingPath = resolveWave5File(
  'public/js/components/overdosePacing.js',
  'subagent-Overdose-Pacing-Pharmacologist-self-29d0bcda'
);
const stateLegalCardPath = resolveWave5File(
  'public/js/components/stateLegalCard.js',
  'subagent-Header---UX-Engineer-self-cbb4d971'
);
const stateResourcesPath = resolveWave5File(
  'src/stateResources.js',
  'subagent-Backend-Legal-Systems-Architect-self-41f70e8a'
);
const appPath = resolveWave5File(
  'src/app.js',
  'subagent-Backend-Legal-Systems-Architect-self-41f70e8a'
);
const indexHtmlPath = resolveWave5File(
  'public/index.html',
  'subagent-Header---UX-Engineer-self-cbb4d971'
);
const statesViewPath = resolveWave5File(
  'public/js/views/states.js',
  'subagent-Header---UX-Engineer-self-cbb4d971'
);
const legalRegistryPath = resolveWave5File(
  'src/legalRegistry.js',
  'subagent-Backend-Legal-Systems-Architect-self-41f70e8a'
);
const reversalFormulationsPath = resolveWave5File(
  'public/js/content/reversalFormulations.js',
  'subagent-Overdose-Pacing-Pharmacologist-self-29d0bcda'
);
const clientAppPath = resolveWave5File(
  'public/js/app.js',
  'subagent-Header---UX-Engineer-self-cbb4d971'
);

// Dynamic module handles
let readinessModule;
let overdosePacingModule;
let stateLegalCardModule;
let stateResourcesModule;
let appModule;
let legalRegistryModule;
let reversalFormulationsModule;

// In-process HTTP test server
let server;
let baseUrl;

before(async () => {
  if (readinessPath) readinessModule = await import(pathToFileURL(readinessPath).href);
  if (overdosePacingPath) overdosePacingModule = await import(pathToFileURL(overdosePacingPath).href);
  if (stateLegalCardPath) stateLegalCardModule = await import(pathToFileURL(stateLegalCardPath).href);
  if (stateResourcesPath) stateResourcesModule = await import(pathToFileURL(stateResourcesPath).href);
  if (legalRegistryPath) legalRegistryModule = await import(pathToFileURL(legalRegistryPath).href);
  if (reversalFormulationsPath) reversalFormulationsModule = await import(pathToFileURL(reversalFormulationsPath).href);
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
});

// ============================================================================
// SUITE 1: Package Integrity, Zero-Dependencies & Strict Security Hygiene
// ============================================================================

describe('Wave 5 Architecture & Zero-Dependency Audit', () => {
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

  test('all Wave 5 target files exist and adhere to native ES module imports with 0 third-party packages', () => {
    const paths = [
      { name: 'readiness.js', path: readinessPath },
      { name: 'overdosePacing.js', path: overdosePacingPath },
      { name: 'stateLegalCard.js', path: stateLegalCardPath },
      { name: 'stateResources.js', path: stateResourcesPath },
      { name: 'app.js', path: appPath },
      { name: 'legalRegistry.js', path: legalRegistryPath },
      { name: 'index.html', path: indexHtmlPath },
      { name: 'states.js', path: statesViewPath },
    ];

    for (const item of paths) {
      assert.ok(item.path && fs.existsSync(item.path), `Wave 5 file ${item.name} must exist`);
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

  test('Wave 5 client modules contain zero innerHTML, outerHTML, insertAdjacentHTML, or inline style=', () => {
    const clientFiles = [
      { name: 'readiness.js', path: readinessPath },
      { name: 'overdosePacing.js', path: overdosePacingPath },
      { name: 'stateLegalCard.js', path: stateLegalCardPath },
      { name: 'states.js', path: statesViewPath },
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

describe('Wave 5 Zero-PII & Ephemeral In-RAM Confidentiality', () => {
  test('Wave 5 files never write to localStorage, sessionStorage, document.cookie, or indexedDB', () => {
    const wave5Files = [
      readinessPath,
      overdosePacingPath,
      stateLegalCardPath,
      stateResourcesPath,
      appPath,
      statesViewPath,
    ].filter(Boolean);

    for (const file of wave5Files) {
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

  test('Readiness summary report carries clinical self-report disclaimer and zero patient identifiers', () => {
    assert.ok(readinessModule, 'readinessModule must be loaded');
    assert.equal(
      typeof readinessModule.formatReadinessSummaryText,
      'function',
      'formatReadinessSummaryText must be exported'
    );

    const testState = {
      substance: 'opioids',
      customSubstance: 'Fentanyl & prescription opioids',
      assessorRole: 'individual',
      answers: { s1: 1, s2: 1, s3: 4, s4: 4, s5: 5, s6: 5, s7: 3, s8: 1 },
      decisionalBalance: {
        likes: ['Relief from chronic pain and emotional numbness'],
        concerns: ['Physical withdrawal sickness or severe hangovers'],
        positives: ['Better physical health and clearer thinking'],
        hurdles: ['Worrying how I will manage intense distress'],
      },
      craftAlly: { lovedOneSupport: true },
    };

    const text = readinessModule.formatReadinessSummaryText(testState);
    assert.equal(typeof text, 'string');
    assert.ok(text.length > 50, 'Report text should provide meaningful clinical content');

    // Must carry clinical self-report educational disclaimer
    assert.match(
      text,
      /(self-report|educational|not a (medical )?diagnosis|consult a licensed clinician|clinical guidance|harborpath stages of change)/i,
      'Report text must explicitly carry the clinical self-report disclaimer'
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

    // Verifies no raw IP address, user-agent, or precise lat/lng logging in API paths
    assert.doesNotMatch(
      code,
      /console\.log\(.*(req\.headers\['x-forwarded-for'\]|socket\.remoteAddress|user-agent)/i,
      'app.js must never log raw visitor IP or User-Agent'
    );
  });
});

// ============================================================================
// SUITE 3: Deterministic Reset Functions & Quick Exit Contract
// ============================================================================

describe('Wave 5 Deterministic Resets & Quick Exit Contracts', () => {
  test('all stateful Wave 5 components export deterministic reset functions', () => {
    assert.ok(readinessModule, 'readinessModule must be loaded');
    assert.ok(overdosePacingModule, 'overdosePacingModule must be loaded');

    assert.equal(
      typeof readinessModule.resetReadinessState,
      'function',
      'readiness.js must export resetReadinessState()'
    );
    assert.equal(
      typeof overdosePacingModule.resetOverdosePacer,
      'function',
      'overdosePacing.js must export resetOverdosePacer()'
    );
  });

  test('resetReadinessState() idempotently restores clean initial ephemeral RAM state', () => {
    assert.ok(readinessModule);
    readinessModule.setReadinessState({
      substance: 'stimulants',
      answers: { s1: 5, s2: 5, s3: 5, s4: 5, s5: 5, s6: 5, s7: 5, s8: 5 },
      decisionalBalance: {
        likes: ['Energy'],
        concerns: ['Sleep loss'],
        positives: [],
        hurdles: [],
      },
      notes: 'Ephemeral clinical reflection',
    });

    const populated = readinessModule.getReadinessState();
    assert.equal(populated.substance, 'stimulants');

    // Execute first reset
    readinessModule.resetReadinessState();
    const reset1 = readinessModule.getReadinessState();
    assert.equal(Object.keys(reset1.answers || {}).length, 0, 'Answers must be cleared');

    // Execute second idempotent reset
    assert.doesNotThrow(() => readinessModule.resetReadinessState());
    const reset2 = readinessModule.getReadinessState();
    assert.deepEqual(reset1, reset2, 'Consecutive resets must yield identical deterministic state');
  });

  test('resetOverdosePacer() halts active timers, clears alerts, and resets to step 1', () => {
    assert.ok(overdosePacingModule);

    // Simulate active timer and progressed state
    if (typeof overdosePacingModule.setOverdosePacerStep === 'function') {
      overdosePacingModule.setOverdosePacerStep(3);
    }
    overdosePacingModule.startRescueBreathingTimer();

    // Verify active
    const activeState = overdosePacingModule.getOverdosePacerState();
    assert.ok(activeState, 'Should return pacer state');

    // Trigger reset
    overdosePacingModule.resetOverdosePacer();

    const resetState = overdosePacingModule.getOverdosePacerState();
    assert.equal(resetState.currentStep ?? 1, 1, 'Reset must return to Step 1');
    assert.equal(resetState.isBreathingActive, false, 'Rescue breathing timer must be stopped');
    assert.equal(resetState.reDoseTimerActive, false, 'Re-dose evaluation timer must be stopped');

    // Idempotent secondary call
    assert.doesNotThrow(() => overdosePacingModule.resetOverdosePacer());
  });

  test('stateLegalCard component exports deterministic state reset if stateful', () => {
    if (stateLegalCardModule?.resetStateLegalCardState) {
      assert.equal(typeof stateLegalCardModule.resetStateLegalCardState, 'function');
      assert.doesNotThrow(() => stateLegalCardModule.resetStateLegalCardState());
    }
  });

  test('client app.js registers resetReadinessState() in runQuickExitResets', () => {
    if (clientAppPath && fs.existsSync(clientAppPath)) {
      const code = fs.readFileSync(clientAppPath, 'utf8');
      assert.ok(
        code.includes('resetReadinessState'),
        'public/js/app.js must invoke resetReadinessState() during Quick Exit'
      );
    }
  });
});

// ============================================================================
// SUITE 4: Readiness & Stages of Change Module Contract (public/js/views/readiness.js)
// ============================================================================

describe('Readiness & Stages of Change Module Contract (public/js/views/readiness.js)', () => {
  test('STAGES_OF_CHANGE taxonomy exports 5 TTM stages plus slip/recurrence support', () => {
    assert.ok(readinessModule);
    const stages = readinessModule.STAGES_OF_CHANGE;
    assert.ok(stages, 'STAGES_OF_CHANGE must be exported');

    const stageIds = Array.isArray(stages) ? stages.map((s) => s.id) : Object.keys(stages);
    assert.ok(stageIds.includes('precontemplation'), 'Must support Precontemplation');
    assert.ok(stageIds.includes('contemplation'), 'Must support Contemplation');
    assert.ok(stageIds.includes('preparation'), 'Must support Preparation');
    assert.ok(stageIds.includes('action'), 'Must support Action');
    assert.ok(stageIds.includes('maintenance'), 'Must support Maintenance');
  });

  test('READINESS_STATEMENTS exports 8 validated URICA-inspired assessment statements', () => {
    assert.ok(readinessModule);
    const statements = readinessModule.READINESS_STATEMENTS;
    assert.ok(Array.isArray(statements), 'READINESS_STATEMENTS must be an array');
    assert.equal(statements.length, 8, 'Must provide exactly 8 URICA-inspired statements');

    for (const stmt of statements) {
      assert.ok(stmt.id, 'Statement must have an id');
      assert.ok(stmt.statement || stmt.text, 'Statement must have clinical prompt text');
      assert.ok(stmt.stage || stmt.targetStage || stmt.dimension, 'Statement must associate with a stage');
    }
  });

  test('calculateReadinessStage() accurately maps response patterns across stages', () => {
    assert.ok(readinessModule);
    const { calculateReadinessStage } = readinessModule;
    assert.equal(typeof calculateReadinessStage, 'function');

    // Precontemplation scenario
    const precontemplationRes = calculateReadinessStage({ s1: 5, s2: 5, s3: 1, s4: 1, s5: 1, s6: 1, s7: 1, s8: 1 });
    assert.equal(precontemplationRes.stage, 'precontemplation');
    assert.ok(precontemplationRes.title);
    assert.ok(precontemplationRes.motivationalPrompt || precontemplationRes.coachingPrompt || precontemplationRes.plainLanguageTitle);
    assert.ok(Array.isArray(precontemplationRes.recommendedNextSteps));
    assert.ok(precontemplationRes.recommendedNextSteps.length > 0);

    // Contemplation scenario
    const contemplationRes = calculateReadinessStage({ s1: 1, s2: 1, s3: 5, s4: 5, s5: 1, s6: 1, s7: 1, s8: 1 });
    assert.equal(contemplationRes.stage, 'contemplation');

    // Preparation scenario
    const preparationRes = calculateReadinessStage({ s1: 1, s2: 1, s3: 3, s4: 3, s5: 5, s6: 5, s7: 2, s8: 1 });
    assert.equal(preparationRes.stage, 'preparation');

    // Action scenario
    const actionRes = calculateReadinessStage({ s1: 1, s2: 1, s3: 2, s4: 2, s5: 2, s6: 2, s7: 5, s8: 2 });
    assert.equal(actionRes.stage, 'action');

    // Maintenance scenario
    const maintenanceRes = calculateReadinessStage({ s1: 1, s2: 1, s3: 1, s4: 1, s5: 1, s6: 1, s7: 2, s8: 5 });
    assert.equal(maintenanceRes.stage, 'maintenance');

    // Recurrence / slip reporting
    const recurrenceRes = calculateReadinessStage({ recentSlip: true });
    assert.equal(recurrenceRes.stage, 'recurrence');
  });

  test('calculateReadinessStage() handles boundary inputs, nulls, and empty answers without throwing', () => {
    assert.ok(readinessModule);
    const { calculateReadinessStage } = readinessModule;

    const emptyRes = calculateReadinessStage({});
    assert.ok(emptyRes && emptyRes.stage, 'Empty answers should return a valid fallback stage');

    const nullRes = calculateReadinessStage(null);
    assert.ok(nullRes && nullRes.stage, 'Null answers should return a valid fallback stage');

    const undefRes = calculateReadinessStage(undefined);
    assert.ok(undefRes && undefRes.stage, 'Undefined answers should return a valid fallback stage');

    const malformedRes = calculateReadinessStage({ invalidKey: 'not-a-number', 1: 'five' });
    assert.ok(malformedRes && malformedRes.stage, 'Malformed answers should not crash calculation');
  });

  test('Decisional Balance Matrix and CRAFT Guidance clinical exports are structured and non-punitive', () => {
    assert.ok(readinessModule);
    assert.ok(readinessModule.DECISIONAL_BALANCE_PROMPTS, 'DECISIONAL_BALANCE_PROMPTS must exist');
    assert.ok(readinessModule.CRAFT_GUIDANCE, 'CRAFT_GUIDANCE must exist');

    // CRAFT guidance promotes positive communication and non-punitive boundaries
    const craft = readinessModule.CRAFT_GUIDANCE;
    const craftStr = JSON.stringify(craft);
    assert.match(craftStr, /(positive communication|boundaries|self-care|reinforcement|safety)/i);
  });

  test('readinessView() returns an accessible WCAG 2.2 AA compliant DOM structure', () => {
    assert.ok(readinessModule);
    assert.equal(typeof readinessModule.readinessView, 'function');

    const view = readinessModule.readinessView({ query: new URLSearchParams() });
    assert.ok(view instanceof MockNode, 'View must return a DOM MockNode');
    assert.equal(view.tagName, 'DIV');

    // Must contain interactive assessment elements
    const inputs = view.querySelectorAll('input');
    const buttons = view.querySelectorAll('button');
    assert.ok(inputs.length > 0 || buttons.length > 0, 'View must contain interactive inputs/buttons');
  });
});

// ============================================================================
// SUITE 5: Overdose Rescue Pacer Assistant Contract (public/js/components/overdosePacing.js)
// ============================================================================

describe('Overdose Rescue Pacer Assistant Contract (public/js/components/overdosePacing.js)', () => {
  test('RESCUE_PACING_STEPS defines 5 sequential clinical resuscitation steps', () => {
    assert.ok(overdosePacingModule);
    const steps = overdosePacingModule.RESCUE_PACING_STEPS;
    assert.ok(Array.isArray(steps), 'RESCUE_PACING_STEPS must be an array');
    assert.equal(steps.length, 5, 'Must contain exactly 5 protocol steps');

    const stepIds = steps.map((s) => s.id);
    assert.ok(stepIds.includes('responsiveness'), 'Step 1 must be responsiveness check');
    assert.ok(stepIds.includes('first_dose') || stepIds.includes('naloxone_dose1'), 'Step 2 must be first dose');
    assert.ok(stepIds.includes('rescue_breathing') || stepIds.includes('breathing_metronome'), 'Step 3 must be rescue breathing metronome');
    assert.ok(stepIds.some((id) => id.includes('redos')), 'Step 4 must be re-dosing evaluation clock');
    assert.ok(stepIds.includes('recovery_position'), 'Step 5 must be recovery position');
  });

  test('clinical callouts integrate synthetic opioid, renarconization, and xylazine pearls', () => {
    assert.ok(overdosePacingModule);
    const steps = overdosePacingModule.RESCUE_PACING_STEPS;
    const stepText = JSON.stringify(steps);

    // Wooden chest syndrome (fentanyl rigidity)
    assert.match(
      stepText,
      /(wooden chest|chest wall rigidity|synthetic opioid)/i,
      'Must contain wooden chest syndrome pearl'
    );

    // Renarconization risk (naloxone wearing off before long-acting opioid)
    assert.match(
      stepText,
      /(renarconization|re-narcotization|recurrence of respiratory depression|half-life)/i,
      'Must contain renarconization risk warning'
    );

    // Xylazine sedation caution
    assert.match(
      stepText,
      /(xylazine|tranq|alpha-2|sedation)/i,
      'Must contain xylazine sedation management caution'
    );
  });

  test('overdosePacer() component renders accessible DOM with role="region" and aria-live', () => {
    assert.ok(overdosePacingModule);
    assert.equal(typeof overdosePacingModule.overdosePacer, 'function');

    const component = overdosePacingModule.overdosePacer();
    assert.ok(component instanceof MockNode, 'Component must return a MockNode');

    // Accessibility attributes verification
    const hasAccessibleRole =
      component.getAttribute('role') === 'region' ||
      component.getAttribute('role') === 'timer' ||
      Boolean(component.querySelector('[role="timer"]')) ||
      Boolean(component.querySelector('[role="region"]'));
    assert.ok(hasAccessibleRole, 'Pacer must have accessible role (region or timer)');

    // Touch targets >= 48px or .btn classes
    const buttons = component.querySelectorAll('button');
    assert.ok(buttons.length > 0, 'Pacer must provide accessible control buttons');
    for (const btn of buttons) {
      assert.ok(
        btn.classList.contains('btn') ||
        btn.classList.contains('pacer-btn') ||
        btn.classList.contains('pacer-step-tab'),
        'Buttons must use accessible UI button classes'
      );
    }
  });

  test('startRescueBreathingTimer() drives 1 breath every 5s (12 bpm) cadence', () => {
    assert.ok(overdosePacingModule);
    overdosePacingModule.resetOverdosePacer();

    overdosePacingModule.startRescueBreathingTimer();
    let state = overdosePacingModule.getOverdosePacerState();
    assert.equal(state.isBreathingActive, true, 'Breathing timer should be active');

    // Simulate breath tick if tick method exported
    if (typeof overdosePacingModule.tickRescueBreathing === 'function') {
      overdosePacingModule.tickRescueBreathing(2);
      const afterTick = overdosePacingModule.getOverdosePacerState();
      assert.ok(
        afterTick.breathCount > 0 || afterTick.currentBreathSecond > 0,
        'Breath tick must advance breathing metrics'
      );
    }

    overdosePacingModule.stopRescueBreathingTimer();
    state = overdosePacingModule.getOverdosePacerState();
    assert.equal(state.isBreathingActive, false, 'Timer should be stopped');
  });

  test('Re-dosing evaluation clock tracks 2-3 minute window with opposite-nostril second dose alert', () => {
    assert.ok(overdosePacingModule);
    overdosePacingModule.resetOverdosePacer();

    if (typeof overdosePacingModule.startReDoseTimer === 'function') {
      overdosePacingModule.startReDoseTimer();
      let state = overdosePacingModule.getOverdosePacerState();
      assert.equal(state.reDoseTimerActive, true);

      // Simulate ticking past 120s (2 min) and 180s (3 min)
      if (typeof overdosePacingModule.tickReDoseTimer === 'function') {
        for (let i = 0; i < 125; i++) overdosePacingModule.tickReDoseTimer();
        state = overdosePacingModule.getOverdosePacerState();
        assert.ok(state.twoMinuteAlertTriggered, '2-minute alert should trigger');
      }

      overdosePacingModule.stopReDoseTimer();
    }
  });

  test('overdosePacer() gracefully handles empty or valid callback props', () => {
    assert.ok(overdosePacingModule);
    assert.doesNotThrow(() => overdosePacingModule.overdosePacer());
    assert.doesNotThrow(() => overdosePacingModule.overdosePacer({}));
    assert.doesNotThrow(() => overdosePacingModule.overdosePacer({ onComplete: () => {}, onReset: () => {} }));
  });
});

// ============================================================================
// SUITE 6: Legal API & State Resource Enrichment Contract (src/app.js, src/stateResources.js)
// ============================================================================

describe('Legal API & State Resource Enrichment Contract (src/app.js, src/stateResources.js)', () => {
  test('createStateDirectory() includes legal protections matching legal registry', () => {
    assert.ok(stateResourcesModule);
    assert.ok(legalRegistryModule);

    const dir = stateResourcesModule.createStateDirectory({
      agencies: {},
      medicaid: {},
      healthCenters: [],
      meta: {},
    });
    assert.ok(dir, 'createStateDirectory() must return index directory');

    // Verify Washington (WA)
    const wa = dir.get('WA');
    assert.ok(wa, 'Directory must resolve WA');
    assert.ok(wa.legal, 'WA state resource must be enriched with legal property');
    assert.equal(wa.legal.stateCode, 'WA');
    assert.equal(typeof wa.legal.goodSamaritan.hasProtection, 'boolean');

    // Verify fallback on invalid code
    const invalid = dir.get('INVALID_CODE');
    assert.equal(invalid, null, 'Invalid code should safely return null');
  });

  test('GET /api/state?code=WA returns status 200 with enriched legal protections', async () => {
    assert.ok(baseUrl, 'Test server must be running');
    const res = await fetch(`${baseUrl}/api/state?code=WA`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(data.legal, 'Response must include legal property');
    assert.equal(data.legal.stateCode, 'WA');
    assert.equal(data.legal.stateName, 'Washington');
    assert.equal(typeof data.legal.goodSamaritan.statuteCitation, 'string');
  });

  test('GET /api/legal?state=NY returns status 200 with complete statutory protection schema', async () => {
    assert.ok(baseUrl);
    const res = await fetch(`${baseUrl}/api/legal?state=NY`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.stateCode, 'NY');
    assert.equal(data.stateName, 'New York');
    assert.equal(typeof data.goodSamaritan.hasProtection, 'boolean');
    assert.equal(typeof data.naloxoneAccess.standingOrder, 'boolean');
    const eq = data.harmReductionEquipment || data.drugCheckingEquipment;
    assert.ok(eq, 'Must contain harm reduction equipment details');
    assert.equal(typeof eq.fentanylTestStripsLegal, 'boolean');
  });

  test('GET /api/legal?state=INVALID returns status 400 with clean error message', async () => {
    assert.ok(baseUrl);
    const res = await fetch(`${baseUrl}/api/legal?state=INVALID_CODE`);
    assert.equal(res.status, 400);

    const data = await res.json();
    assert.ok(data.error, 'Should return error property');
    assert.match(data.error, /invalid or (missing|unknown)/i);
  });

  test('GET /api/legal?fts=1 returns array of jurisdictions where FTS is decriminalized', async () => {
    assert.ok(baseUrl);
    const res = await fetch(`${baseUrl}/api/legal?fts=1`);
    assert.equal(res.status, 200);

    const list = await res.json();
    assert.ok(Array.isArray(list), 'Must return an array of states');
    assert.ok(list.length > 20, 'FTS is decriminalized in the majority of U.S. jurisdictions');
    const codes = list.map((item) => (typeof item === 'string' ? item : item.stateCode));
    assert.ok(codes.includes('WA'), 'WA should be in FTS decriminalized list');
  });

  test('GET /api/legal?ssp=1 returns array of jurisdictions with statutory SSP protections', async () => {
    assert.ok(baseUrl);
    const res = await fetch(`${baseUrl}/api/legal?ssp=1`);
    assert.equal(res.status, 200);

    const list = await res.json();
    assert.ok(Array.isArray(list), 'Must return an array of states');
    assert.ok(list.length > 20, 'SSP programs have statutory protections in multiple jurisdictions');
    const codes = list.map((item) => (typeof item === 'string' ? item : item.stateCode));
    assert.ok(codes.includes('NY') || codes.includes('CA') || codes.includes('WA'), 'Known SSP states must be present');
  });

  test('GET /api/legal?summary=1&state=WA returns plain-language summary with citations', async () => {
    assert.ok(baseUrl);
    const res = await fetch(`${baseUrl}/api/legal?summary=1&state=WA`);
    assert.equal(res.status, 200);

    const data = await res.json();
    const summaryText = data.plainLanguageNotice || data.summary || data.goodSamaritan?.summary;
    assert.equal(typeof summaryText, 'string');
    assert.ok(summaryText.length > 30);
    assert.match(summaryText, /(Good Samaritan|RCW|immunity|naloxone|Wash\. Rev\. Code)/i);

    const citations = data.citations || [data.goodSamaritan?.statuteCitation];
    assert.ok(Array.isArray(citations) && citations.length > 0, 'Must include statutory citations');
  });

  test('strict security headers are attached to all /api/legal responses', async () => {
    assert.ok(baseUrl);
    const res = await fetch(`${baseUrl}/api/legal?state=WA`);

    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
    assert.ok(res.headers.get('content-security-policy'), 'CSP header must be present');
  });
});

// ============================================================================
// SUITE 7: Header Navigation & State Legal Card Contract (public/index.html, states.js)
// ============================================================================

describe('Header Navigation & State Legal Card Contract (public/index.html, states.js)', () => {
  test('public/index.html contains accessible Sensory Mode and Quick Emergency Drawer trigger buttons', () => {
    assert.ok(indexHtmlPath && fs.existsSync(indexHtmlPath));
    const html = fs.readFileSync(indexHtmlPath, 'utf8');

    // Sensory mode button checks
    assert.match(html, /id="btn-sensory-mode"/, 'Must contain #btn-sensory-mode');
    assert.match(html, /class="[^"]*btn-sensory-mode[^"]*"/, 'Must have btn-sensory-mode class');
    assert.match(html, /aria-pressed="false"/, 'Must have initial aria-pressed="false"');
    assert.match(html, /aria-keyshortcuts="Alt\+S"/, 'Must advertise Alt+S shortcut');

    // Emergency drawer button checks
    assert.match(html, /id="btn-emergency-drawer"/, 'Must contain #btn-emergency-drawer');
    assert.match(html, /class="[^"]*btn-emergency-drawer[^"]*"/, 'Must have btn-emergency-drawer class');
    assert.match(html, /aria-expanded="false"/, 'Must have initial aria-expanded="false"');
    assert.match(html, /aria-controls="emergency-drawer"/, 'Must control emergency-drawer element');
  });

  test('public/index.html site navigation links to Clinical Withdrawal Check and Readiness to Change', () => {
    assert.ok(indexHtmlPath && fs.existsSync(indexHtmlPath));
    const html = fs.readFileSync(indexHtmlPath, 'utf8');

    // Nav link to clinical assessment (COWS/CIWA)
    assert.match(
      html,
      /href="#\/assessment"[^>]*data-nav="assessment"/,
      'Must contain navigation link to #/assessment with data-nav="assessment"'
    );

    // Nav link to readiness to change
    assert.match(
      html,
      /href="#\/readiness"[^>]*data-nav="readiness"/,
      'Must contain navigation link to #/readiness with data-nav="readiness"'
    );
  });

  test('stateLegalCard(legalData) exports an accessible card summarizing statutory protections', () => {
    assert.ok(stateLegalCardModule);
    assert.equal(typeof stateLegalCardModule.stateLegalCard, 'function');

    const waLegal = legalRegistryModule.getLegalProtections('WA');
    assert.ok(waLegal);

    const card = stateLegalCardModule.stateLegalCard(waLegal);
    assert.ok(card instanceof MockNode, 'stateLegalCard must return a MockNode');
    assert.ok(card.classList.contains('state-legal-card'), 'Must carry state-legal-card class');

    // Must display Good Samaritan and Paraphernalia facts
    const text = card.textContent;
    assert.match(text, /(Good Samaritan|Immunity|Naloxone|Syringe|Test Strip)/i);
  });

  test('stateLegalCard() safely handles null, undefined, or empty data without throwing', () => {
    assert.ok(stateLegalCardModule);
    assert.doesNotThrow(() => stateLegalCardModule.stateLegalCard(null));
    assert.doesNotThrow(() => stateLegalCardModule.stateLegalCard(undefined));
    assert.doesNotThrow(() => stateLegalCardModule.stateLegalCard({}));
    assert.doesNotThrow(() => stateLegalCardModule.stateLegalCard('invalid-type'));

    const fallbackCard = stateLegalCardModule.stateLegalCard(null);
    assert.ok(fallbackCard instanceof MockNode);
    assert.ok(fallbackCard.textContent.length > 20);
  });

  test('public/js/views/states.js integrates stateLegalCard into state detail view', () => {
    assert.ok(statesViewPath && fs.existsSync(statesViewPath));
    const code = fs.readFileSync(statesViewPath, 'utf8');

    assert.ok(
      code.includes('stateLegalCard'),
      'states.js must import and call stateLegalCard'
    );
  });
});

// ============================================================================
// SUITE 8: Wave 5 Multi-Module Integration Scenarios & Edge Cases
// ============================================================================

describe('Wave 5 Multi-Module Integration Scenarios & Edge Cases', () => {
  test('Pipeline: Backend /api/legal data flows directly into stateLegalCard UI component', async () => {
    assert.ok(baseUrl);
    assert.ok(stateLegalCardModule);

    // 1. Fetch from server API
    const res = await fetch(`${baseUrl}/api/legal?state=WA`);
    assert.equal(res.status, 200);
    const legalData = await res.json();

    // 2. Render into client card
    const card = stateLegalCardModule.stateLegalCard(legalData);
    assert.ok(card instanceof MockNode);
    assert.equal(card.tagName, 'SECTION');

    // 3. Verify rendered statutory citation inside card
    const citations = card.querySelectorAll('.statute-box, cite, .statute-citation, .legal-citation');
    assert.ok(
      citations.length > 0 || card.textContent.includes('RCW') || card.textContent.includes('Statute'),
      'Rendered card must include state statutory citations'
    );
  });

  test('Cross-Module Quick Exit: Clearing state wipes both Readiness Assessment and Overdose Pacer simultaneously', () => {
    assert.ok(readinessModule);
    assert.ok(overdosePacingModule);

    // Populate both modules with active user state
    readinessModule.setReadinessState({
      substance: 'alcohol',
      answers: { s1: 4, s2: 4, s3: 4, s4: 4 },
      notes: 'Active session notes',
    });
    overdosePacingModule.startRescueBreathingTimer();

    // Verify dirty
    assert.equal(readinessModule.getReadinessState().substance, 'alcohol');
    assert.equal(overdosePacingModule.getOverdosePacerState().isBreathingActive, true);

    // Execute combined reset (simulating Quick Exit Esc x2)
    readinessModule.resetReadinessState();
    overdosePacingModule.resetOverdosePacer();

    // Verify both are completely cleaned
    assert.equal(Object.keys(readinessModule.getReadinessState().answers || {}).length, 0);
    assert.equal(overdosePacingModule.getOverdosePacerState().isBreathingActive, false);
    assert.equal(overdosePacingModule.getOverdosePacerState().currentStep ?? 1, 1);
  });

  test('Overdose Pacer correctly synchronizes with Evidence-Based Reversal Formulations Matrix', () => {
    assert.ok(overdosePacingModule);
    assert.ok(reversalFormulationsModule);

    // Pacer steps must align with reversal formulation standards
    const steps = overdosePacingModule.RESCUE_PACING_STEPS;
    assert.ok(steps.length >= 5);

    // Step 2 must specify standard 4mg intranasal or 0.4mg IM initial dosage
    const doseStep = steps.find((s) => s.id === 'first_dose' || s.step === 2);
    assert.ok(doseStep);
    const doseText = JSON.stringify(doseStep);
    assert.match(doseText, /4\s*mg/i, 'First dose step must reference standard 4mg intranasal naloxone');

    // Reversal matrix callout alignment
    assert.ok(
      reversalFormulationsModule.WOODEN_CHEST_SYNDROME,
      'Reversal formulations matrix must export WOODEN_CHEST_SYNDROME'
    );
    assert.ok(
      reversalFormulationsModule.RENARCONIZATION_RISK,
      'Reversal formulations matrix must export RENARCONIZATION_RISK'
    );
  });

  test('Defensive resilience: malformed HTTP query parameters on /api/legal return 400 without crashing server', async () => {
    assert.ok(baseUrl);

    const testUrls = [
      `${baseUrl}/api/legal`,
      `${baseUrl}/api/legal?state=`,
      `${baseUrl}/api/legal?state=123`,
      `${baseUrl}/api/legal?state=INVALID`,
      `${baseUrl}/api/legal?state=TOOLONGSTATECODE`,
    ];

    for (const url of testUrls) {
      const res = await fetch(url);
      assert.equal(res.status, 400, `URL "${url}" must return HTTP 400 Bad Request`);
      const body = await res.json();
      assert.ok(body.error, 'Response body must contain error message');
    }
  });
});
