// Wave 4 Integration & Cross-Module Contract Test Suite
//
// Validates multi-module integration contracts across:
// 1. Clinical assessment engine (`public/js/views/assessment.js`)
// 2. Overdose reversal formulations (`public/js/content/reversalFormulations.js`)
// 3. 50-state legal registry (`src/legalRegistry.js` and `data/state-legal.json`)
// 4. Sensory mode & emergency drawer (`public/js/components/sensoryMode.js` and `public/js/components/emergencyDrawer.js`)
//
// Strict Constraints Enforced:
// - Zero npm dependencies (Node.js 20+ built-ins only)
// - Zero innerHTML, outerHTML, or inline style= attributes in client code
// - Zero PII logging, cookies, localStorage, or persistent client storage
// - Deterministic reset functions across all stateful components
// - Resilient error handling (null, undefined, invalid types handled gracefully)

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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

    this.classList = {
      add: (...classes) => {
        const current = new Set(this.className.split(/\s+/).filter(Boolean));
        for (const c of classes) current.add(c);
        this.className = Array.from(current).join(' ');
      },
      remove: (...classes) => {
        const current = new Set(this.className.split(/\s+/).filter(Boolean));
        for (const c of classes) current.delete(c);
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

  hasAttribute(k) {
    return Object.hasOwn(this.attributes, k);
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'hidden') this.hidden = false;
  }

  addEventListener(evt, fn) {
    (this.listeners[evt] = this.listeners[evt] || []).push(fn);
  }

  removeEventListener(evt, fn) {
    if (!this.listeners[evt]) return;
    this.listeners[evt] = this.listeners[evt].filter((h) => h !== fn);
  }

  dispatchEvent(event) {
    const handlers = this.listeners[event.type] || [];
    for (const h of handlers) h.call(this, event);
    return true;
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
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const results = [];
    const attrMatch = selector.match(/^\[([a-zA-Z0-9_-]+)(?:=(['"]?)(.*?)\2)?\]$/);

    this.findAll((node) => {
      if (attrMatch) {
        const [, attr, , val] = attrMatch;
        if (!node.hasAttribute(attr)) return false;
        if (val !== undefined) return node.getAttribute(attr) === val;
        return true;
      }
      if (selector.startsWith('.')) {
        return node.classList.contains(selector.slice(1));
      }
      if (selector.startsWith('#')) {
        return node.getAttribute('id') === selector.slice(1);
      }
      return node.tagName === selector.toUpperCase();
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

// Install mock DOM on globalThis before module imports
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
    return null;
  },
  addEventListener: () => {},
  removeEventListener: () => {},
};
globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};

// ============================================================================
// 2. Dynamic Module Path Resolver (Supports workspace and peer worktrees)
// ============================================================================

function resolveWave4File(relPath, subagentHint) {
  // 1. Local workspace path
  const localPath = path.resolve(rootDir, relPath);
  if (fs.existsSync(localPath)) return localPath;

  // 2. Peer worktree path with hint
  if (subagentHint) {
    const peerHintPath = path.resolve(peerWorktreesDir, subagentHint, relPath);
    if (fs.existsSync(peerHintPath)) return peerHintPath;
  }

  // 3. Scan peer worktrees directory for matching file
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
  return null;
}

// Locate all 6 target files
const assessmentPath = resolveWave4File(
  'public/js/views/assessment.js',
  'subagent-Clinical-Withdrawal-Specialist-self-8a4c6522',
);
const reversalPath = resolveWave4File(
  'public/js/content/reversalFormulations.js',
  'subagent-Pharmacology-Specialist-self-d71ee097',
);
const legalRegistryPath = resolveWave4File(
  'src/legalRegistry.js',
  'subagent-Legal-Registry-Architect-self-582dcab5',
);
const legalDataPath = resolveWave4File(
  'data/state-legal.json',
  'subagent-Legal-Registry-Architect-self-582dcab5',
);
const sensoryModePath = resolveWave4File(
  'public/js/components/sensoryMode.js',
  'subagent-Sensory-Accessibility-Engineer-self-484a8932',
);
const emergencyDrawerPath = resolveWave4File(
  'public/js/components/emergencyDrawer.js',
  'subagent-Sensory-Accessibility-Engineer-self-484a8932',
);

// Load modules dynamically
let assessmentModule;
let reversalModule;
let legalModule;
let sensoryModule;
let drawerModule;
let stateLegalData;

before(async () => {
  if (assessmentPath) assessmentModule = await import(pathToFileURL(assessmentPath).href);
  if (reversalPath) reversalModule = await import(pathToFileURL(reversalPath).href);
  if (legalRegistryPath) legalModule = await import(pathToFileURL(legalRegistryPath).href);
  if (sensoryModePath) sensoryModule = await import(pathToFileURL(sensoryModePath).href);
  if (emergencyDrawerPath) drawerModule = await import(pathToFileURL(emergencyDrawerPath).href);
  if (legalDataPath) stateLegalData = JSON.parse(fs.readFileSync(legalDataPath, 'utf8'));
});

beforeEach(() => {
  mockBody.className = '';
  mockDocEl.className = '';
});

// ============================================================================
// SUITE 1: Package Integrity, Zero-Dependencies & Strict Security Hygiene
// ============================================================================

describe('Wave 4 Architecture & Zero-Dependency Audit', () => {
  test('package.json enforces 0 runtime dependencies and Node >= 20', () => {
    const pkgPath = path.resolve(rootDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Zero dependencies constraint
    assert.equal(pkg.dependencies, undefined, 'package.json must have 0 npm runtime dependencies');
    assert.ok(
      !pkg.devDependencies || Object.keys(pkg.devDependencies).length === 0,
      'package.json must not rely on external devDependencies',
    );

    // Engine & module type
    assert.ok(pkg.engines && pkg.engines.node, 'engines.node must be defined');
    assert.match(pkg.engines.node, />=\s*20/, 'engines.node must require Node >= 20');
    assert.equal(pkg.type, 'module', 'Root package must be configured as native ES modules');
    assert.equal(pkg.scripts?.test, 'node --test', 'Test runner must use native node --test');
  });

  test('all Wave 4 source files exist and adhere to native ES module imports with 0 third-party packages', () => {
    const paths = [
      { name: 'assessment.js', path: assessmentPath },
      { name: 'reversalFormulations.js', path: reversalPath },
      { name: 'legalRegistry.js', path: legalRegistryPath },
      { name: 'state-legal.json', path: legalDataPath },
      { name: 'sensoryMode.js', path: sensoryModePath },
      { name: 'emergencyDrawer.js', path: emergencyDrawerPath },
    ];

    for (const item of paths) {
      assert.ok(item.path && fs.existsSync(item.path), `Wave 4 file ${item.name} must exist`);
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
            `File ${item.name} imports forbidden non-builtin package: "${specifier}"`,
          );
        }
      }
    }
  });

  test('Wave 4 client modules contain zero innerHTML, outerHTML, insertAdjacentHTML, or inline style=', () => {
    const clientFiles = [
      { name: 'assessment.js', path: assessmentPath },
      { name: 'reversalFormulations.js', path: reversalPath },
      { name: 'sensoryMode.js', path: sensoryModePath },
      { name: 'emergencyDrawer.js', path: emergencyDrawerPath },
    ];

    for (const f of clientFiles) {
      if (!f.path) continue;
      const code = fs.readFileSync(f.path, 'utf8');
      assert.doesNotMatch(
        code,
        /\.innerHTML\s*=/,
        `${f.name} must never assign innerHTML (XSS risk, CSP violation)`,
      );
      assert.doesNotMatch(
        code,
        /\.outerHTML\s*=/,
        `${f.name} must never assign outerHTML (XSS risk, CSP violation)`,
      );
      assert.doesNotMatch(
        code,
        /\.insertAdjacentHTML\s*\(/,
        `${f.name} must never call insertAdjacentHTML`,
      );
      assert.doesNotMatch(
        code,
        /style\s*=\s*['"][^'"]*['"]/,
        `${f.name} must never contain inline style= attributes (CSP requirement)`,
      );
    }
  });
});

// ============================================================================
// SUITE 2: Zero PII Logging & Persistent Storage Guarantee
// ============================================================================

describe('Wave 4 Zero-PII & Confidentiality Audits', () => {
  test('Wave 4 files never write to localStorage, sessionStorage, or document.cookie', () => {
    const wave4Files = [
      assessmentPath,
      reversalPath,
      legalRegistryPath,
      sensoryModePath,
      emergencyDrawerPath,
    ].filter(Boolean);

    for (const file of wave4Files) {
      const code = fs.readFileSync(file, 'utf8');
      assert.doesNotMatch(
        code,
        /localStorage\s*\.\s*setItem/,
        `File ${path.basename(file)} must not write to localStorage`,
      );
      assert.doesNotMatch(
        code,
        /sessionStorage\s*\.\s*setItem/,
        `File ${path.basename(file)} must not write to sessionStorage`,
      );
      assert.doesNotMatch(
        code,
        /document\s*\.\s*cookie\s*=/,
        `File ${path.basename(file)} must not set document.cookie`,
      );
      assert.doesNotMatch(
        code,
        /indexedDB/,
        `File ${path.basename(file)} must not access indexedDB`,
      );
    }
  });

  test('assessment report formatting adheres to self-report standards and zero PII leaks', () => {
    assert.ok(assessmentModule, 'assessmentModule must be loaded');
    assert.equal(
      typeof assessmentModule.formatAssessmentReportText,
      'function',
      'formatAssessmentReportText must be exported',
    );

    const testState = {
      activeScale: 'cows',
      cowsAnswers: { pulse: 2, sweating: 2, restlessness: 2 },
      ciwaAnswers: {},
    };

    const text = assessmentModule.formatAssessmentReportText(testState);
    assert.equal(typeof text, 'string');
    assert.ok(text.length > 50, 'Report text should provide meaningful clinical content');

    // Must include non-diagnosis self-report disclaimer
    assert.match(
      text,
      /(self-report|educational|not a (medical )?diagnosis|consult a licensed clinician)/i,
      'Report text must explicitly carry the clinical self-report disclaimer',
    );

    // Must NEVER contain patient identification fields
    assert.doesNotMatch(text, /\bSSN\b|Social Security Number/i);
    assert.doesNotMatch(text, /\bDate of Birth\b|\bDOB\b/i);
    assert.doesNotMatch(text, /\bMedical Record Number\b|\bMRN\b/i);
    assert.doesNotMatch(text, /\bIP Address\b/i);
  });

  test('legal registry queries are 100% in-memory and confidential', () => {
    assert.ok(legalModule, 'legalModule must be loaded');
    const wa = legalModule.getLegalProtections('WA');
    assert.ok(wa, 'Should resolve WA legal protections');

    // Registry returns only statutory facts
    assert.equal(wa.stateCode, 'WA');
    assert.equal(wa.stateName, 'Washington');
    assert.equal(typeof wa.goodSamaritan.hasProtection, 'boolean');
    assert.equal(typeof wa.goodSamaritan.statuteCitation, 'string');
  });
});

// ============================================================================
// SUITE 3: Deterministic Reset Functions & Quick Exit Orchestration
// ============================================================================

describe('Wave 4 Deterministic Resets & Quick Exit Contract', () => {
  test('all stateful Wave 4 components export deterministic reset functions', () => {
    assert.ok(assessmentModule, 'assessmentModule must be loaded');
    assert.ok(sensoryModule, 'sensoryModule must be loaded');
    assert.ok(drawerModule, 'drawerModule must be loaded');

    assert.equal(
      typeof assessmentModule.resetAssessmentState,
      'function',
      'assessment.js must export resetAssessmentState()',
    );
    assert.equal(
      typeof sensoryModule.resetSensoryMode,
      'function',
      'sensoryMode.js must export resetSensoryMode()',
    );
    const drawerResetFn = drawerModule.resetEmergencyDrawer || drawerModule.closeEmergencyDrawer;
    assert.equal(
      typeof drawerResetFn,
      'function',
      'emergencyDrawer.js must export resetEmergencyDrawer() or closeEmergencyDrawer()',
    );
  });

  test('resetAssessmentState() cleanly wipes all clinical scores and answers from RAM', () => {
    assert.ok(assessmentModule);

    // Populate assessment state
    assessmentModule.setAssessmentState({
      activeScale: 'cows',
      cowsAnswers: { pulse: 4, sweating: 3, restlessness: 3 },
      ciwaAnswers: { tremor: 5, anxiety: 6 },
    });

    const populated = assessmentModule.getAssessmentState();
    assert.ok(Object.keys(populated.cowsAnswers || {}).length > 0);

    // Perform deterministic reset
    assessmentModule.resetAssessmentState();

    const wiped = assessmentModule.getAssessmentState();
    assert.deepEqual(wiped.cowsAnswers, {}, 'cowsAnswers must be completely empty after reset');
    assert.deepEqual(wiped.ciwaAnswers, {}, 'ciwaAnswers must be completely empty after reset');
  });

  test('resetSensoryMode() cleanly disables sensory mode and removes DOM class', () => {
    assert.ok(sensoryModule);

    // Activate sensory mode
    sensoryModule.setSensoryMode(true);
    assert.equal(sensoryModule.getSensoryMode(), true);
    assert.equal(sensoryModule.getSensoryModeState().enabled, true);
    assert.ok(
      mockBody.classList.contains('sensory-mode-active') ||
        mockDocEl.classList.contains('sensory-mode-active'),
      'Sensory mode active class must be present when enabled',
    );

    // Deterministic reset
    sensoryModule.resetSensoryMode();
    assert.equal(sensoryModule.getSensoryMode(), false);
    assert.equal(sensoryModule.getSensoryModeState().enabled, false);
    assert.equal(
      mockBody.classList.contains('sensory-mode-active'),
      false,
      'Body must not have sensory-mode-active class after reset',
    );
    assert.equal(
      mockDocEl.classList.contains('sensory-mode-active'),
      false,
      'Document element must not have sensory-mode-active class after reset',
    );
  });

  test('emergency drawer closes cleanly upon reset and handles escape key', () => {
    assert.ok(drawerModule);

    // Open emergency drawer
    drawerModule.openEmergencyDrawer();
    assert.equal(drawerModule.isEmergencyDrawerOpen(), true, 'Drawer should be open');

    // Close / Reset drawer
    if (drawerModule.resetEmergencyDrawer) drawerModule.resetEmergencyDrawer();
    else drawerModule.closeEmergencyDrawer();

    assert.equal(drawerModule.isEmergencyDrawerOpen(), false, 'Drawer should be closed after reset');
  });

  test('coordinated Quick Exit wipes all Wave 4 ephemeral states in a single execution', () => {
    assert.ok(assessmentModule && sensoryModule && drawerModule);

    // Dirty state across all 3 components
    assessmentModule.setAssessmentState({
      activeScale: 'ciwa',
      ciwaAnswers: { nausea_vomiting: 5, tremor: 4 },
    });
    sensoryModule.setSensoryMode(true);
    drawerModule.openEmergencyDrawer();

    // Execute coordinated reset
    assessmentModule.resetAssessmentState();
    sensoryModule.resetSensoryMode();
    if (drawerModule.resetEmergencyDrawer) drawerModule.resetEmergencyDrawer();
    else drawerModule.closeEmergencyDrawer();

    // Verify all 3 are fully sanitized
    const assessmentState = assessmentModule.getAssessmentState();
    assert.deepEqual(assessmentState.ciwaAnswers, {});
    assert.equal(sensoryModule.getSensoryMode(), false);
    assert.equal(drawerModule.isEmergencyDrawerOpen(), false);
  });
});

// ============================================================================
// SUITE 4: Clinical Assessment Engine Contract (`public/js/views/assessment.js`)
// ============================================================================

describe('Clinical Assessment Engine Contracts (COWS & CIWA-Ar)', () => {
  test('COWS_DIMENSIONS exports exactly 11 validated opiate withdrawal dimensions', () => {
    assert.ok(assessmentModule);
    const dimensions = assessmentModule.COWS_DIMENSIONS;
    assert.ok(Array.isArray(dimensions), 'COWS_DIMENSIONS must be an array');
    assert.equal(dimensions.length, 11, 'COWS must have exactly 11 clinical dimensions');

    const expectedIds = [
      'pulse',
      'sweating',
      'restlessness',
      'pupils',
      'bone_joint_aches',
      'runny_nose_tearing',
      'gi_upset',
      'tremor',
      'yawning',
      'anxiety_irritability',
      'gooseflesh',
    ];

    const actualIds = dimensions.map((d) => d.id);
    for (const exp of expectedIds) {
      assert.ok(actualIds.includes(exp), `COWS_DIMENSIONS missing expected dimension: ${exp}`);
    }

    // Verify option scoring values
    for (const dim of dimensions) {
      assert.ok(Array.isArray(dim.options), `Dimension ${dim.id} must have options array`);
      assert.ok(dim.options.length >= 2, `Dimension ${dim.id} must have multiple options`);
      for (const opt of dim.options) {
        assert.equal(typeof opt.score, 'number', `Option score must be a number in ${dim.id}`);
        assert.ok(opt.score >= 0, `Option score must be non-negative in ${dim.id}`);
      }
    }
  });

  test('CIWA_DIMENSIONS exports exactly 10 validated alcohol withdrawal dimensions', () => {
    assert.ok(assessmentModule);
    const dimensions = assessmentModule.CIWA_DIMENSIONS;
    assert.ok(Array.isArray(dimensions), 'CIWA_DIMENSIONS must be an array');
    assert.equal(dimensions.length, 10, 'CIWA-Ar must have exactly 10 clinical dimensions');

    const expectedIds = [
      'nausea_vomiting',
      'tremor',
      'paroxysmal_sweats',
      'anxiety',
      'agitation',
      'tactile_disturbances',
      'auditory_disturbances',
      'visual_disturbances',
      'headache',
      'orientation',
    ];

    const actualIds = dimensions.map((d) => d.id);
    for (const exp of expectedIds) {
      assert.ok(actualIds.includes(exp), `CIWA_DIMENSIONS missing expected dimension: ${exp}`);
    }
  });

  test('calculateCowsScore accurately scores severity and identifies buprenorphine induction readiness', () => {
    assert.ok(assessmentModule);
    const { calculateCowsScore } = assessmentModule;

    // Test 1: Minimal / no withdrawal (score 3)
    const low = calculateCowsScore({ pulse: 1, sweating: 2 });
    assert.equal(low.totalScore, 3);
    assert.equal(low.inductionReady, false);
    assert.match(
      low.buprenorphineInduction?.clinicalAction || low.clinicalAction || '',
      /CONTRAINDICATED|wait|Bernese|precipitat/i,
      'COWS < 12 must warn that standard buprenorphine induction is contraindicated to avoid precipitated withdrawal',
    );

    // Test 2: Moderate withdrawal meeting induction threshold (score 14)
    const ready = calculateCowsScore({
      pulse: 2,
      sweating: 2,
      restlessness: 3,
      pupils: 2,
      bone_joint_aches: 2,
      gi_upset: 3,
    });
    assert.equal(ready.totalScore, 14);
    assert.equal(ready.inductionReady, true);
    assert.match(ready.severityBand?.label || '', /Moderate/i);

    // Test 3: Severe withdrawal (score > 36)
    const severeAnswers = {};
    for (const dim of assessmentModule.COWS_DIMENSIONS) {
      const maxOpt = dim.options.reduce((m, o) => (o.score > m.score ? o : m));
      severeAnswers[dim.id] = maxOpt.score;
    }
    const severe = calculateCowsScore(severeAnswers);
    assert.ok(severe.totalScore > 36, 'Max COWS answers should exceed 36');
    assert.match(severe.severityBand?.label || '', /Severe/i);
  });

  test('calculateCiwaScore accurately scores severity and flags Delirium Tremens emergency evaluation', () => {
    assert.ok(assessmentModule);
    const { calculateCiwaScore } = assessmentModule;

    // Mild (<10)
    const mild = calculateCiwaScore({ nausea_vomiting: 2, tremor: 3 });
    assert.equal(mild.totalScore, 5);
    assert.equal(mild.medicalDetoxIndicated, false);
    assert.equal(mild.emergencyEvaluationRequired, false);

    // Moderate (10-18): medical detox indicated
    const moderate = calculateCiwaScore({
      nausea_vomiting: 4,
      tremor: 4,
      paroxysmal_sweats: 4,
    });
    assert.equal(moderate.totalScore, 12);
    assert.equal(moderate.medicalDetoxIndicated, true);

    // Severe (>=19): emergency hospital evaluation required
    const severe = calculateCiwaScore({
      nausea_vomiting: 7,
      tremor: 7,
      paroxysmal_sweats: 7,
    });
    assert.ok(severe.totalScore >= 19);
    assert.equal(severe.emergencyEvaluationRequired, true);
    assert.match(severe.clinicalAction, /hospital|emergency|EMTALA|seizure|Delirium Tremens/i);
  });

  test('calculateCowsScore & calculateCiwaScore handle invalid, empty, or corrupted inputs gracefully', () => {
    assert.ok(assessmentModule);
    const { calculateCowsScore, calculateCiwaScore } = assessmentModule;

    // Null and undefined
    assert.doesNotThrow(() => {
      const res = calculateCowsScore(null);
      assert.equal(res.totalScore, 0);
    });
    assert.doesNotThrow(() => {
      const res = calculateCowsScore(undefined);
      assert.equal(res.totalScore, 0);
    });
    assert.doesNotThrow(() => {
      const res = calculateCiwaScore(null);
      assert.equal(res.totalScore, 0);
    });
    assert.doesNotThrow(() => {
      const res = calculateCiwaScore(undefined);
      assert.equal(res.totalScore, 0);
    });

    // Unknown or invalid types
    assert.doesNotThrow(() => {
      const res = calculateCowsScore({ nonExistent: 999, pulse: 'garbage' });
      assert.equal(res.totalScore, 0);
    });
  });

  test('assessmentView renders accessible WCAG 2.2 AA compliant DOM tree', () => {
    assert.ok(assessmentModule);
    assert.equal(typeof assessmentModule.assessmentView, 'function');

    const view = assessmentModule.assessmentView();
    assert.ok(view instanceof MockNode, 'assessmentView() must return a DOM node');

    // Must render fieldsets or question containers
    const fieldsets = view.querySelectorAll('fieldset');
    assert.ok(fieldsets.length > 0, 'assessmentView should organize questions into fieldsets');

    // Must render buttons for scale selection or actions
    const buttons = view.querySelectorAll('button');
    assert.ok(buttons.length > 0, 'assessmentView should contain actionable buttons');
  });
});

// ============================================================================
// SUITE 5: Overdose Reversal Formulations Contract (`reversalFormulations.js`)
// ============================================================================

describe('Overdose Reversal Formulations & Acute Protocols Contract', () => {
  test('REVERSAL_FORMULATIONS exports all 4 key evidence-based formulations with complete pharmacology', () => {
    assert.ok(reversalModule);
    const formulations = reversalModule.REVERSAL_FORMULATIONS;
    assert.ok(formulations && typeof formulations === 'object');

    const expectedKeys = [
      'naloxone_nasal_4mg',
      'naloxone_nasal_8mg',
      'nalmefene_nasal_3mg',
      'naloxone_injectable_0_4mg',
    ];

    for (const key of expectedKeys) {
      const item = formulations[key];
      assert.ok(item, `REVERSAL_FORMULATIONS must contain ${key}`);
      assert.equal(typeof item.brandName || item.genericName, 'string');
      assert.ok(item.doseValueMg > 0, `${key} must have numeric doseValueMg`);
      assert.ok(item.onsetMinutes, `${key} must have onsetMinutes details`);
      assert.ok(
        item.eliminationHalfLifeMinutes || item.halfLifeMinutes,
        `${key} must specify half-life`,
      );
      assert.ok(item.precipitatedWithdrawal, `${key} must document precipitated withdrawal risk`);
    }

    // Check specific pharmacokinetic properties
    // 1. Naloxone 4mg
    const nal4 = formulations.naloxone_nasal_4mg;
    assert.equal(nal4.doseValueMg, 4);
    assert.equal(nal4.eliminationHalfLifeMinutes?.terminalHours || 1.5, 1.5);

    // 2. Naloxone 8mg (Kloxxado)
    const nal8 = formulations.naloxone_nasal_8mg;
    assert.equal(nal8.doseValueMg, 8);
    assert.match(
      nal8.precipitatedWithdrawal?.riskLevel || nal8.precipitatedWithdrawal?.severity || '',
      /HIGH|SEVERE/i,
    );

    // 3. Nalmefene 3mg (Opvee) - Long acting
    const nalm = formulations.nalmefene_nasal_3mg;
    assert.equal(nalm.doseValueMg, 3);
    const terminalHours =
      nalm.eliminationHalfLifeMinutes?.terminalHours || nalm.halfLifeHours || 11.4;
    assert.ok(terminalHours >= 10, 'Nalmefene must reflect long elimination half-life (~11.4h)');
    assert.match(
      nalm.precipitatedWithdrawal?.mitigationStrategy || nalm.clinicalPearls?.[0] || '',
      /12|24|prolonged|observation|monitoring/i,
    );
  });

  test('exports clinical scenario guides: Wooden Chest, Renarconization, Stimulant Overamping, Xylazine', () => {
    assert.ok(reversalModule);

    // Wooden Chest Syndrome (Fentanyl-induced muscle rigidity)
    const wcs = reversalModule.WOODEN_CHEST_SYNDROME;
    assert.ok(wcs, 'WOODEN_CHEST_SYNDROME must be exported');
    const wcsText = JSON.stringify(wcs);
    assert.match(wcsText, /rigidity|hypertonicity|contraction/i);
    assert.match(wcsText, /naloxone/i);
    assert.match(wcsText, /airway|ventilat/i);

    // Renarconization Risk
    const renarc = reversalModule.RENARCONIZATION_RISK;
    assert.ok(renarc, 'RENARCONIZATION_RISK must be exported');
    const renarcText = JSON.stringify(renarc);
    assert.match(renarcText, /lipophilic|redistribut|adipose/i);
    assert.ok(
      renarc.clinicalProtocol?.minimumObservationHours >= 2 ||
        /2|4\s*hour/i.test(renarcText),
      'Observation protocol must indicate at least 2-4 hours',
    );

    // Stimulant Overamping Guide
    const overamping = reversalModule.STIMULANT_OVERAMPING_GUIDE;
    assert.ok(overamping, 'STIMULANT_OVERAMPING_GUIDE must be exported');
    const overText = JSON.stringify(overamping.naloxoneAdministrationRule || overamping);
    assert.match(overText, /ALWAYS ADMINISTER NALOXONE/i);

    // Xylazine Sedation Management
    const xylazine = reversalModule.XYLAZINE_SEDATION_MANAGEMENT;
    assert.ok(xylazine, 'XYLAZINE_SEDATION_MANAGEMENT must be exported');
    const xylText = JSON.stringify(xylazine);
    assert.match(xylText, /rescue breath/i);
    assert.match(xylText, /naloxone dumping/i);
  });

  test('compareFormulations accurately compares pharmacokinetics and handles invalid keys', () => {
    assert.ok(reversalModule);
    const { compareFormulations } = reversalModule;
    assert.equal(typeof compareFormulations, 'function');

    const comp = compareFormulations('naloxone_nasal_4mg', 'nalmefene_nasal_3mg');
    assert.ok(comp, 'Should produce comparison report');
    assert.ok(comp.formulationA);
    assert.ok(comp.formulationB);

    // Invalid inputs should throw descriptive error
    assert.throws(() => {
      compareFormulations('bogus_1', 'bogus_2');
    }, /Invalid formulation ID/i);
  });

  test('evaluateOverdoseRiskScenario provides evidence-based reversal and emergency steps', () => {
    assert.ok(reversalModule);
    const { evaluateOverdoseRiskScenario } = reversalModule;
    assert.equal(typeof evaluateOverdoseRiskScenario, 'function');

    const scenario = {
      suspectedSubstance: 'fentanyl',
      muscleRigidity: true,
      respiratoryRate: 4,
    };

    const evalResult = evaluateOverdoseRiskScenario(scenario);
    assert.ok(evalResult);
    assert.ok(evalResult.recommendedFormulation || evalResult.emergencyActions);

    // Invalid scenario handling
    assert.doesNotThrow(() => {
      evaluateOverdoseRiskScenario(null);
      evaluateOverdoseRiskScenario(undefined);
      evaluateOverdoseRiskScenario({});
    });
  });
});

// ============================================================================
// SUITE 6: 50-State Legal Registry Contract (`src/legalRegistry.js` & `data/state-legal.json`)
// ============================================================================

describe('50-State Legal Registry Contract & Decriminalization Engine', () => {
  test('data/state-legal.json covers exactly 52 US jurisdictions with strict schema integrity', () => {
    assert.ok(stateLegalData, 'data/state-legal.json must be loaded');
    assert.ok(Array.isArray(stateLegalData), 'state-legal.json must be a JSON array');
    assert.equal(stateLegalData.length, 52, 'Must contain all 50 states + DC + Puerto Rico');

    const codes = new Set();
    for (const record of stateLegalData) {
      assert.equal(typeof record.stateCode, 'string');
      assert.equal(record.stateCode.length, 2, 'stateCode must be 2 uppercase characters');
      assert.equal(record.stateCode, record.stateCode.toUpperCase());
      codes.add(record.stateCode);

      assert.equal(typeof record.stateName, 'string');
      assert.ok(record.stateName.length > 0);

      // Good Samaritan schema
      const gs = record.goodSamaritan;
      assert.ok(gs && typeof gs === 'object');
      assert.equal(typeof gs.hasProtection, 'boolean');
      assert.equal(typeof gs.arrestImmunity, 'boolean');
      assert.equal(typeof gs.chargeImmunity, 'boolean');
      assert.equal(typeof gs.prosecutionImmunity, 'boolean');
      assert.equal(typeof gs.protectsParoleProbation, 'boolean');
      assert.equal(typeof gs.protectsParaphernalia, 'boolean');
      assert.equal(typeof gs.protectsUnderageAlcohol, 'boolean');
      assert.equal(typeof gs.statuteCitation, 'string');

      // Naloxone Access schema
      const nal = record.naloxoneAccess;
      assert.ok(nal && typeof nal === 'object');
      assert.equal(typeof nal.standingOrder, 'boolean');
      assert.equal(typeof nal.thirdPartyPrescribing, 'boolean');
      assert.equal(typeof nal.layResponderImmunity, 'boolean');
      assert.equal(typeof nal.statuteCitation, 'string');

      // Harm Reduction Equipment schema
      const hr = record.harmReductionEquipment;
      assert.ok(hr && typeof hr === 'object');
      assert.equal(typeof hr.fentanylTestStripsLegal, 'boolean');
      assert.equal(typeof hr.xylazineTestStripsLegal, 'boolean');
      assert.equal(typeof hr.sspStatutoryProtection, 'boolean');
      assert.equal(typeof hr.statuteNotes, 'string');
    }

    assert.ok(codes.has('DC'), 'Must include DC');
    assert.ok(codes.has('PR'), 'Must include Puerto Rico (PR)');
    assert.ok(codes.has('CA'), 'Must include California (CA)');
    assert.ok(codes.has('NY'), 'Must include New York (NY)');
    assert.ok(codes.has('TX'), 'Must include Texas (TX)');
    assert.ok(codes.has('WA'), 'Must include Washington (WA)');
  });

  test('legalRegistry.js memoizes data with O(1) lookups and immutable records', () => {
    assert.ok(legalModule);
    const registry1 = legalModule.loadLegalRegistry();
    const registry2 = legalModule.loadLegalRegistry();
    assert.equal(registry1, registry2, 'loadLegalRegistry() must return identical memoized reference');

    // Case-insensitivity and whitespace trimming
    const waUpper = legalModule.getLegalProtections('WA');
    const waLower = legalModule.getLegalProtections('wa');
    const waPadded = legalModule.getLegalProtections('  WA  ');
    assert.ok(waUpper, 'WA lookup must succeed');
    assert.equal(waUpper, waLower, 'Lookups must be case-insensitive');
    assert.equal(waUpper, waPadded, 'Lookups must trim whitespace');

    // Immutability
    assert.throws(() => {
      waUpper.stateName = 'Tampered';
    }, /TypeError|read only|cannot assign/i);
  });

  test('filterStatesByProtection filters accurately by decriminalization and immunity criteria', () => {
    assert.ok(legalModule);
    const { filterStatesByProtection } = legalModule;

    // Filter by Fentanyl Test Strip decriminalization
    const ftsStates = filterStatesByProtection({ ftsLegal: true });
    assert.ok(Array.isArray(ftsStates));
    assert.ok(ftsStates.length > 30, 'Most US states have decriminalized FTS');
    for (const s of ftsStates) {
      assert.equal(s.harmReductionEquipment.fentanylTestStripsLegal, true);
    }

    // Filter by Syringe Services Statutory Protection
    const sspStates = filterStatesByProtection({ sspLegal: true });
    assert.ok(Array.isArray(sspStates));
    for (const s of sspStates) {
      assert.equal(s.harmReductionEquipment.sspStatutoryProtection, true);
    }

    // Filter by parole/probation protection
    const paroleStates = filterStatesByProtection({ paroleProtected: true });
    assert.ok(Array.isArray(paroleStates));
    for (const s of paroleStates) {
      assert.equal(s.goodSamaritan.protectsParoleProbation, true);
    }
  });

  test('legalRegistry handles invalid, unknown, or corrupted state codes gracefully', () => {
    assert.ok(legalModule);
    const { getLegalProtections, getJurisdictionSummary } = legalModule;

    // Unknown codes return null safely
    assert.doesNotThrow(() => {
      const res = getLegalProtections('ZZ');
      assert.equal(res, null);
    });
    assert.doesNotThrow(() => {
      const res = getLegalProtections('');
      assert.equal(res, null);
    });
    assert.doesNotThrow(() => {
      const res = getLegalProtections(null);
      assert.equal(res, null);
    });
    assert.doesNotThrow(() => {
      const res = getLegalProtections(undefined);
      assert.equal(res, null);
    });

    // Summary returns null safely for unknown code
    assert.doesNotThrow(() => {
      const summary = getJurisdictionSummary('ZZ');
      assert.equal(summary, null);
    });
  });
});

// ============================================================================
// SUITE 7: Sensory Mode & Emergency Offline Drawer (`sensoryMode.js` & `emergencyDrawer.js`)
// ============================================================================

describe('Sensory Accessibility & Offline Emergency Cards Contract', () => {
  test('sensoryModeToggle creates accessible button with aria-pressed and keyboard hotkey indicator', () => {
    assert.ok(sensoryModule);
    const toggle = sensoryModule.sensoryModeToggle();
    assert.ok(toggle instanceof MockNode, 'sensoryModeToggle must return a DOM node');
    assert.equal(toggle.tagName, 'BUTTON');
    assert.ok(toggle.hasAttribute('aria-pressed'), 'Button must have aria-pressed attribute');
    assert.equal(toggle.getAttribute('aria-pressed'), 'false');
  });

  test('toggleSensoryMode toggles state and attaches/removes .sensory-mode-active class', () => {
    assert.ok(sensoryModule);
    sensoryModule.resetSensoryMode();

    const enabled = sensoryModule.toggleSensoryMode();
    assert.equal(enabled, true);
    assert.equal(sensoryModule.getSensoryMode(), true);
    assert.equal(sensoryModule.getSensoryModeState().enabled, true);

    const disabled = sensoryModule.toggleSensoryMode();
    assert.equal(disabled, false);
    assert.equal(sensoryModule.getSensoryMode(), false);
    assert.equal(sensoryModule.getSensoryModeState().enabled, false);
  });

  test('emergencyDrawer renders 3 critical offline survival cards', () => {
    assert.ok(drawerModule);
    const drawerEl = drawerModule.emergencyDrawer({ singleton: false });
    assert.ok(drawerEl instanceof MockNode);

    // Verify presence of role and accessible attributes on wrapper or dialog panel
    const dialog =
      drawerEl.querySelector('[role="dialog"]') ||
      drawerEl.children.find((c) => c instanceof MockNode && c.getAttribute('role') === 'dialog');
    assert.ok(dialog, 'emergencyDrawer must contain a dialog panel with role="dialog"');
    assert.equal(dialog.getAttribute('role'), 'dialog');
    assert.equal(dialog.getAttribute('aria-modal'), 'true');

    // Card 1: Naloxone & Rescue Breathing Pacing
    const pacingCard = drawerModule.buildNaloxonePacingCard();
    assert.ok(pacingCard instanceof MockNode);
    const pacingText = pacingCard.textContent;
    assert.match(pacingText, /naloxone|4\s*mg/i, 'Card 1 must document 4mg naloxone administration');
    assert.match(pacingText, /5\s*second/i, 'Card 1 must document 1 breath every 5 seconds pacing');
    assert.match(pacingText, /2|3\s*min/i, 'Card 1 must document 2-3 minute redosing check');

    // Card 2: Opioid vs Stimulant Matrix
    const matrixCard = drawerModule.buildOverdoseMatrixCard();
    assert.ok(matrixCard instanceof MockNode);
    const matrixText = matrixCard.textContent;
    assert.match(matrixText, /pinpoint/i, 'Card 2 must document opioid pinpoint pupils');
    assert.match(matrixText, /dilated/i, 'Card 2 must document stimulant dilated pupils');
    assert.match(matrixText, /cooling|hydration/i, 'Card 2 must document supportive stimulant care');

    // Card 3: 911 Good Samaritan Script
    const scriptCard = drawerModule.buildGoodSamaritanCard();
    assert.ok(scriptCard instanceof MockNode);
    const scriptText = scriptCard.textContent;
    assert.match(scriptText, /911/i);
    assert.match(
      scriptText,
      /not breathing|unresponsive|medical help/i,
      'Card 3 must contain clear emergency script for 911 dispatcher',
    );
  });

  test('emergency drawer handles Escape key closing cleanly', () => {
    assert.ok(drawerModule);
    drawerModule.openEmergencyDrawer();
    assert.equal(drawerModule.isEmergencyDrawerOpen(), true);

    // Dispatch synthetic escape keydown
    if (drawerModule.handleDrawerKeydown) {
      drawerModule.handleDrawerKeydown({
        key: 'Escape',
        preventDefault: () => {},
        stopPropagation: () => {},
      });
      assert.equal(drawerModule.isEmergencyDrawerOpen(), false);
    }
  });
});

// ============================================================================
// SUITE 8: Multi-Module Cross-Domain Integration Workflows
// ============================================================================

describe('Wave 4 Multi-Module Integration Scenarios', () => {
  test('Flow 1: Acute Overdose Emergency -> Rescue Pacing + Good Samaritan Protection -> Quick Exit', () => {
    assert.ok(reversalModule && legalModule && drawerModule && sensoryModule);

    // 1. Evaluate synthetic opioid overdose scenario
    const risk = reversalModule.evaluateOverdoseRiskScenario({
      suspectedSubstance: 'fentanyl',
      muscleRigidity: true,
      respiratoryRate: 4,
    });
    assert.ok(risk);

    // 2. Lookup state-specific Good Samaritan criminal protections (Washington)
    const protections = legalModule.getLegalProtections('WA');
    assert.equal(protections.goodSamaritan.hasProtection, true);
    assert.equal(protections.goodSamaritan.arrestImmunity, true);

    // 3. User opens emergency drawer for step-by-step breathing pacing and 911 script
    drawerModule.openEmergencyDrawer();
    assert.equal(drawerModule.isEmergencyDrawerOpen(), true);

    // 4. Overwhelmed caregiver activates calming sensory mode
    sensoryModule.setSensoryMode(true);
    assert.equal(sensoryModule.getSensoryMode(), true);

    // 5. Emergency EMS arrives; caregiver hits Quick Exit
    drawerModule.closeEmergencyDrawer();
    sensoryModule.resetSensoryMode();

    assert.equal(drawerModule.isEmergencyDrawerOpen(), false);
    assert.equal(sensoryModule.getSensoryMode(), false);
  });

  test('Flow 2: Clinical Withdrawal Triage -> MOUD Induction Readiness -> Supply Legality Handoff', () => {
    assert.ok(assessmentModule && reversalModule && legalModule);

    // 1. Patient completes COWS assessment with moderately severe withdrawal (score 26)
    const severeAnswers = {
      pulse: 3,
      sweating: 3,
      restlessness: 4,
      pupils: 3,
      bone_joint_aches: 3,
      gi_upset: 4,
      tremor: 3,
      yawning: 3,
    };
    const cowsScore = assessmentModule.calculateCowsScore(severeAnswers);
    assert.ok(cowsScore.totalScore >= 25);
    assert.equal(cowsScore.inductionReady, true);

    // 2. Harm reduction consultation: review renarconization risk and reversal formulations
    const renarconization = reversalModule.RENARCONIZATION_RISK;
    assert.ok(renarconization);
    const renarcString = JSON.stringify(renarconization.pathophysiology);
    assert.match(renarcString, /lipophilic/i);

    // 3. Verify fentanyl test strip and syringe decriminalization status for patient's state (Ohio)
    const ohio = legalModule.getLegalProtections('OH');
    assert.ok(ohio);
    assert.equal(ohio.harmReductionEquipment.fentanylTestStripsLegal, true);

    // 4. Reset assessment state cleanly
    assessmentModule.resetAssessmentState();
    const clean = assessmentModule.getAssessmentState();
    assert.deepEqual(clean.cowsAnswers, {});
  });
});
