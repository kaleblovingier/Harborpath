import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DILUTION_PROTOCOLS,
  TEST_STRIP_INTERPRETATIONS,
  calculateDilutionRatio,
  getTestStripState,
  resetTestStripState,
  subscribeTestStripState,
  setSelectedSubstance,
  setSampleAmount,
  setSelectedInterpretation,
  startDipTimer,
  tickDipTimer,
  stopDipTimer,
  resetDipTimer,
  startIncubationTimer,
  tickIncubationTimer,
  stopIncubationTimer,
  resetIncubationTimer,
  setIncubationTarget,
  formatTime,
  testStripCalculator,
} from '../public/js/components/testStripCalculator.js';

import {
  harmReductionView,
  resetHarmReductionState,
  getHarmReductionState,
} from '../public/js/views/harmReduction.js';

// Minimal in-memory Mock DOM for Node 20+ test runner
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
    this._textContent = '';
    this.classList = new MockClassList(this);
    this.parent = null;
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

  setAttribute(k, v) {
    if (k === 'style') {
      throw new Error('Inline styles are blocked by CSP; use a class');
    }
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

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
    this.parent = null;
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
    const isId = selector.startsWith('#');
    const isClass = selector.startsWith('.');
    const isTag = /^[a-zA-Z0-9_-]+$/.test(selector);

    this.findAll((node) => {
      if (node === this) return false;
      if (isId && node.id === selector.slice(1)) return true;
      if (isClass && node.classList.contains(selector.slice(1))) return true;
      if (isTag && node.tagName === selector.toUpperCase()) return true;
      if (selector.includes('[role=') && selector.includes(']')) {
        const match = selector.match(/\[role=["']?([^"'\]]+)["']?\]/);
        if (match && node.getAttribute('role') === match[1]) return true;
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
  const announcer = new MockNode('div');
  announcer.setAttribute('id', 'announcer');
  body.append(announcer);

  const doc = {
    body,
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    createTextNode: (text) => {
      const n = new MockNode('#text');
      n._textContent = String(text);
      return n;
    },
    getElementById: (id) => (id === 'announcer' ? announcer : body.querySelector(`#${id}`)),
  };

  const win = {
    print: () => {},
    scrollTo: () => {},
    matchMedia: () => ({ matches: false }),
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

describe('Test Strip Simulator & Calculator (public/js/components/testStripCalculator.js)', () => {

  describe('1. Substance-Specific Dilution Protocols & Calculations', () => {
    it('exports complete DILUTION_PROTOCOLS across all 4 clinical substance categories', () => {
      assert.ok(DILUTION_PROTOCOLS.stimulants, 'stimulants protocol exists');
      assert.ok(DILUTION_PROTOCOLS.opioids, 'opioids protocol exists');
      assert.ok(DILUTION_PROTOCOLS.pills, 'pills protocol exists');
      assert.ok(DILUTION_PROTOCOLS.residue, 'residue protocol exists');

      // Stimulants protocol specifications
      const stim = DILUTION_PROTOCOLS.stimulants;
      assert.strictEqual(stim.crossReactivityRisk, true);
      assert.strictEqual(stim.standardRatioPer10mgMl, 5.0);
      assert.strictEqual(stim.standardWaterMeasure, '1 full teaspoon (5 mL)');
      assert.strictEqual(stim.fullDoseRatioPer100mgMl, 120.0);
      assert.strictEqual(stim.fullDoseWaterMeasure, '1/2 cup (120 mL)');
      assert.match(stim.crossReactivityWarning, /false-positive.*cross-reactivity/i);

      // Opioids protocol specifications
      const op = DILUTION_PROTOCOLS.opioids;
      assert.strictEqual(op.crossReactivityRisk, false);
      assert.strictEqual(op.standardRatioPer10mgMl, 2.5);
      assert.strictEqual(op.standardWaterMeasure, '1/2 teaspoon (2.5 mL)');

      // Counterfeit pills protocol specifications
      const pill = DILUTION_PROTOCOLS.pills;
      assert.match(pill.crushWarning, /crush thoroughly/i);
      assert.match(pill.crushWarning, /chocolate chip cookie/i);

      // Residue protocol specifications
      const res = DILUTION_PROTOCOLS.residue;
      assert.match(res.standardWaterMeasure, /a few drops to 1\/2 teaspoon/i);
    });

    it('calculates stimulant dilution: 1 full tsp (5 mL) per 10 mg scraping, and 1/2 cup (120 mL) for 100 mg full dose', () => {
      // 10 mg standard residue
      const ratio10 = calculateDilutionRatio({ substance: 'stimulants', amountMg: 10 });
      assert.strictEqual(ratio10.substance, 'stimulants');
      assert.strictEqual(ratio10.waterMl, 5.0);
      assert.strictEqual(ratio10.waterMeasure, '1 full teaspoon (5 mL)');
      assert.strictEqual(ratio10.crossReactivityWarning, true);
      assert.match(ratio10.warningText, /cross-reactivity/i);

      // 100 mg full baggie/dose
      const ratio100 = calculateDilutionRatio({ substance: 'stimulants', amountMg: 100 });
      assert.strictEqual(ratio100.waterMl, 120.0);
      assert.strictEqual(ratio100.waterMeasure, '1/2 cup (120 mL)');
      assert.strictEqual(ratio100.crossReactivityWarning, true);

      // Alias recognition: methamphetamine, MDMA, speed
      const ratioMeth = calculateDilutionRatio({ substance: 'methamphetamine', amountMg: 10 });
      assert.strictEqual(ratioMeth.substance, 'stimulants');
      assert.strictEqual(ratioMeth.waterMl, 5.0);

      const ratioMDMA = calculateDilutionRatio({ substance: 'mdma', amountMg: 100 });
      assert.strictEqual(ratioMDMA.substance, 'stimulants');
      assert.strictEqual(ratioMDMA.waterMl, 120.0);
    });

    it('calculates opioid dilution: standard 1/2 teaspoon (2.5 mL) per 10 mg powder', () => {
      const ratio = calculateDilutionRatio({ substance: 'opioids', amountMg: 10 });
      assert.strictEqual(ratio.substance, 'opioids');
      assert.strictEqual(ratio.waterMl, 2.5);
      assert.strictEqual(ratio.waterMeasure, '1/2 teaspoon (2.5 mL)');
      assert.strictEqual(ratio.crossReactivityWarning, false);

      // Aliases: fentanyl, heroin, powder
      const ratioFent = calculateDilutionRatio({ substance: 'fentanyl', amountMg: 10 });
      assert.strictEqual(ratioFent.substance, 'opioids');
      assert.strictEqual(ratioFent.waterMl, 2.5);

      const ratioPowder = calculateDilutionRatio({ substance: 'powder', amountMg: 20 });
      assert.strictEqual(ratioPowder.waterMl, 5.0);
    });

    it('calculates counterfeit pill dilution with mandatory crushing warning', () => {
      const ratio = calculateDilutionRatio({ substance: 'pressed pills', amountMg: 10 });
      assert.strictEqual(ratio.substance, 'pills');
      assert.strictEqual(ratio.waterMl, 2.5);
      assert.strictEqual(ratio.waterMeasure, '1/2 teaspoon (2.5 mL)');
      assert.match(ratio.warningText, /crush thoroughly/i);
      assert.match(ratio.warningText, /chocolate chip cookie effect/i);
    });

    it('calculates empty baggies / cookers dilution with swirl instructions', () => {
      const ratio = calculateDilutionRatio({ substance: 'baggies' });
      assert.strictEqual(ratio.substance, 'residue');
      assert.match(ratio.waterMeasure, /a few drops to 1\/2 teaspoon/i);
      const instructionsText = ratio.instructions.join(' ');
      assert.match(instructionsText, /swirl/i);
    });

    it('gracefully handles missing, empty, or negative arguments with safe defaults', () => {
      const defRatio = calculateDilutionRatio();
      assert.strictEqual(defRatio.substance, 'opioids');
      assert.strictEqual(defRatio.amountMg, 10);
      assert.strictEqual(defRatio.waterMl, 2.5);

      const negRatio = calculateDilutionRatio({ substance: 'unknown', amountMg: -50 });
      assert.strictEqual(negRatio.amountMg, 10);
      assert.strictEqual(negRatio.waterMl, 2.5);
    });
  });

  describe('2. Interactive Procedural Timers & State Transitions', () => {
    it('manages 15-second immersion dip timer countdown and completion states', () => {
      resetDipTimer();
      const initial = getTestStripState().dipTimer;
      assert.strictEqual(initial.remainingSeconds, 15);
      assert.strictEqual(initial.elapsedSeconds, 0);
      assert.strictEqual(initial.active, false);
      assert.strictEqual(initial.completed, false);

      // Start timer
      startDipTimer();
      assert.strictEqual(getTestStripState().dipTimer.active, true);

      // Tick 5 seconds
      tickDipTimer(5);
      const mid = getTestStripState().dipTimer;
      assert.strictEqual(mid.elapsedSeconds, 5);
      assert.strictEqual(mid.remainingSeconds, 10);
      assert.strictEqual(mid.active, true);
      assert.strictEqual(mid.completed, false);

      // Tick remaining 10 seconds (total 15s)
      tickDipTimer(10);
      const done = getTestStripState().dipTimer;
      assert.strictEqual(done.elapsedSeconds, 15);
      assert.strictEqual(done.remainingSeconds, 0);
      assert.strictEqual(done.active, false);
      assert.strictEqual(done.completed, true);

      // Reset dip timer
      resetDipTimer();
      const resetState = getTestStripState().dipTimer;
      assert.strictEqual(resetState.remainingSeconds, 15);
      assert.strictEqual(resetState.elapsedSeconds, 0);
      assert.strictEqual(resetState.completed, false);
    });

    it('pauses and resumes dip timer with stopDipTimer()', () => {
      resetDipTimer();
      startDipTimer();
      tickDipTimer(3);
      assert.strictEqual(getTestStripState().dipTimer.remainingSeconds, 12);

      stopDipTimer();
      assert.strictEqual(getTestStripState().dipTimer.active, false);
      assert.strictEqual(getTestStripState().dipTimer.remainingSeconds, 12);
    });

    it('manages 2-to-5 minute flat incubation timer with 2-min resultsReady mark and target completion', () => {
      resetIncubationTimer();
      const initial = getTestStripState().incubationTimer;
      assert.strictEqual(initial.targetSeconds, 120);
      assert.strictEqual(initial.remainingSeconds, 120);
      assert.strictEqual(initial.elapsedSeconds, 0);
      assert.strictEqual(initial.resultsReady, false);
      assert.strictEqual(initial.completed, false);

      startIncubationTimer();
      assert.strictEqual(getTestStripState().incubationTimer.active, true);

      // Tick 60 seconds (1 minute elapsed)
      tickIncubationTimer(60);
      const at1Min = getTestStripState().incubationTimer;
      assert.strictEqual(at1Min.elapsedSeconds, 60);
      assert.strictEqual(at1Min.remainingSeconds, 60);
      assert.strictEqual(at1Min.resultsReady, false);

      // Tick another 60 seconds (2 minutes / 120s reached)
      tickIncubationTimer(60);
      const at2Min = getTestStripState().incubationTimer;
      assert.strictEqual(at2Min.elapsedSeconds, 120);
      assert.strictEqual(at2Min.remainingSeconds, 0);
      assert.strictEqual(at2Min.resultsReady, true, 'Results are valid to read after 2 minutes');
      assert.strictEqual(at2Min.completed, true);
    });

    it('supports 5-minute (300s) extended incubation target window', () => {
      resetIncubationTimer();
      setIncubationTarget(300);
      assert.strictEqual(getTestStripState().incubationTimer.targetSeconds, 300);
      assert.strictEqual(getTestStripState().incubationTimer.remainingSeconds, 300);

      startIncubationTimer();
      tickIncubationTimer(120);
      assert.strictEqual(getTestStripState().incubationTimer.resultsReady, true);
      assert.strictEqual(getTestStripState().incubationTimer.completed, false);
      assert.strictEqual(getTestStripState().incubationTimer.remainingSeconds, 180);

      tickIncubationTimer(180);
      assert.strictEqual(getTestStripState().incubationTimer.completed, true);
      assert.strictEqual(getTestStripState().incubationTimer.active, false);
    });

    it('formats time accurately with formatTime helper', () => {
      assert.strictEqual(formatTime(0), '0:00');
      assert.strictEqual(formatTime(15), '0:15');
      assert.strictEqual(formatTime(65), '1:05');
      assert.strictEqual(formatTime(120), '2:00');
      assert.strictEqual(formatTime(300), '5:00');
    });
  });

  describe('3. Visual Result Interpretation Decoder', () => {
    it('defines accurate clinical interpretations for POSITIVE, NEGATIVE, and INVALID results', () => {
      // 1 Line (Control line only) -> POSITIVE
      const pos = TEST_STRIP_INTERPRETATIONS.positive;
      assert.strictEqual(pos.lines, 1);
      assert.strictEqual(pos.result, 'POSITIVE');
      assert.strictEqual(pos.hasControlLine, true);
      assert.strictEqual(pos.hasTestLine, false);
      assert.strictEqual(pos.badgeClass, 'chip-emergency');
      assert.strictEqual(pos.alertClass, 'callout-emergency');
      const posText = pos.actionSteps.join(' ');
      assert.match(posText, /do not use alone/i);
      assert.match(posText, /naloxone/i);
      assert.match(posText, /smaller test dose/i);
      assert.match(posText, /fatal overdose/i);

      // 2 Lines (Control + Test lines, even faint) -> NEGATIVE
      const neg = TEST_STRIP_INTERPRETATIONS.negative;
      assert.strictEqual(neg.lines, 2);
      assert.strictEqual(neg.result, 'NEGATIVE');
      assert.strictEqual(neg.hasControlLine, true);
      assert.strictEqual(neg.hasTestLine, true);
      assert.strictEqual(neg.badgeClass, 'chip-ok');
      assert.strictEqual(neg.alertClass, 'callout-info');
      const negText = neg.actionSteps.join(' ');
      assert.match(negText, /chocolate chip cookie effect/i);
      assert.match(negText, /nitazenes/i);
      assert.match(negText, /does not guarantee 100% safety/i);

      // 0 Lines or Test line only -> INVALID
      const inv = TEST_STRIP_INTERPRETATIONS.invalid;
      assert.strictEqual(inv.lines, 0);
      assert.strictEqual(inv.result, 'INVALID');
      assert.strictEqual(inv.hasControlLine, false);
      assert.strictEqual(inv.badgeClass, 'chip-warn');
      assert.strictEqual(inv.alertClass, 'callout-warn');
      const invText = inv.actionSteps.join(' ');
      assert.match(invText, /retest/i);
      assert.match(invText, /fresh test strip/i);
    });

    it('updates in-RAM interpretation state with setSelectedInterpretation', () => {
      setSelectedInterpretation('positive');
      assert.strictEqual(getTestStripState().selectedInterpretation, 'positive');

      setSelectedInterpretation('negative');
      assert.strictEqual(getTestStripState().selectedInterpretation, 'negative');

      setSelectedInterpretation('invalid');
      assert.strictEqual(getTestStripState().selectedInterpretation, 'invalid');

      // Aliases
      setSelectedInterpretation('1');
      assert.strictEqual(getTestStripState().selectedInterpretation, 'positive');

      setSelectedInterpretation('2');
      assert.strictEqual(getTestStripState().selectedInterpretation, 'negative');

      setSelectedInterpretation('0');
      assert.strictEqual(getTestStripState().selectedInterpretation, 'invalid');
    });
  });

  describe('4. 100% Ephemeral In-RAM State & Wipes', () => {
    it('manages state strictly in RAM without writing to localStorage, sessionStorage, or URL', () => {
      let storageWritten = false;
      const fakeStorage = {
        setItem: () => { storageWritten = true; },
        getItem: () => null,
      };
      const origStorage = globalThis.localStorage;
      globalThis.localStorage = fakeStorage;

      try {
        setSelectedSubstance('stimulants');
        setSampleAmount(100);
        setSelectedInterpretation('positive');
        startDipTimer();
        tickDipTimer(5);
        startIncubationTimer();
        tickIncubationTimer(60);

        assert.strictEqual(storageWritten, false, 'Never touches localStorage');
      } finally {
        globalThis.localStorage = origStorage;
      }
    });

    it('resetTestStripState cleanly resets all values, stops intervals, and triggers registered callback', () => {
      withMockDom(() => {
        let resetCalled = false;
        testStripCalculator({ onReset: () => { resetCalled = true; } });

        setSelectedSubstance('pills');
        setSampleAmount(100);
        setSelectedInterpretation('negative');
        startDipTimer();
        tickDipTimer(8);
        startIncubationTimer();
        tickIncubationTimer(50);

        resetTestStripState();

        const st = getTestStripState();
        assert.strictEqual(st.substance, 'stimulants');
        assert.strictEqual(st.amountMg, 10);
        assert.strictEqual(st.selectedInterpretation, null);
        assert.strictEqual(st.dipTimer.active, false);
        assert.strictEqual(st.dipTimer.remainingSeconds, 15);
        assert.strictEqual(st.incubationTimer.active, false);
        assert.strictEqual(st.incubationTimer.elapsedSeconds, 0);
        assert.strictEqual(resetCalled, true);
      });
    });

    it('resetHarmReductionState() wires into resetTestStripState()', () => {
      setSelectedSubstance('residue');
      setSelectedInterpretation('positive');
      assert.strictEqual(getTestStripState().selectedInterpretation, 'positive');

      resetHarmReductionState();

      assert.strictEqual(getTestStripState().selectedInterpretation, null);
      assert.strictEqual(getTestStripState().substance, 'stimulants');
      assert.strictEqual(getHarmReductionState().plainLanguage, false);
    });

    it('notifies subscribers on state mutations', () => {
      let notifyCount = 0;
      const unsub = subscribeTestStripState((snap) => {
        if (snap) notifyCount += 1;
      });

      setSelectedSubstance('opioids');
      setSampleAmount(20);
      setSelectedInterpretation('positive');

      assert.ok(notifyCount >= 3);
      unsub();
    });
  });

  describe('5. DOM Structure, Interactive Controls & CSP Compliance', () => {
    it('builds testStripCalculator DOM element with all required interactive sections', () => {
      withMockDom(() => {
        const comp = testStripCalculator();
        assert.ok(comp instanceof MockNode);
        assert.strictEqual(comp.id, 'test-strip-calculator');
        assert.strictEqual(comp.getAttribute('role'), 'region');

        // Check for Dilution Section
        const stimBtn = comp.querySelector('#strip-substance-stimulants');
        const opioidBtn = comp.querySelector('#strip-substance-opioids');
        const pillsBtn = comp.querySelector('#strip-substance-pills');
        const residueBtn = comp.querySelector('#strip-substance-residue');
        assert.ok(stimBtn, 'Stimulants tab button exists');
        assert.ok(opioidBtn, 'Opioids tab button exists');
        assert.ok(pillsBtn, 'Pills tab button exists');
        assert.ok(residueBtn, 'Residue tab button exists');

        // Check for Procedural Timers
        const dipTimerDisplay = comp.querySelector('#strip-dip-timer-display');
        const incTimerDisplay = comp.querySelector('#strip-incubation-timer-display');
        assert.ok(dipTimerDisplay, 'Dip timer box exists');
        assert.ok(incTimerDisplay, 'Incubation timer box exists');
        assert.ok(comp.querySelector('#btn-start-dip-timer'), 'Start dip timer button exists');
        assert.ok(comp.querySelector('#btn-start-inc-timer'), 'Start inc timer button exists');

        // Check for Visual Interpretation Decoder
        const posInterpBtn = comp.querySelector('#strip-interp-positive');
        const negInterpBtn = comp.querySelector('#strip-interp-negative');
        const invInterpBtn = comp.querySelector('#strip-interp-invalid');
        assert.ok(posInterpBtn, 'Positive interpretation button exists');
        assert.ok(negInterpBtn, 'Negative interpretation button exists');
        assert.ok(invInterpBtn, 'Invalid interpretation button exists');
        assert.ok(comp.querySelector('#test-strip-visual-diagram'), 'Visual diagram element exists');

        // Reset Button
        assert.ok(comp.querySelector('#btn-reset-test-strip-state'), 'Reset button exists');
      });
    });

    it('interactively updates dilution ratio card and warnings upon selecting substances and amounts', () => {
      withMockDom(() => {
        const comp = testStripCalculator();

        // Click Stimulants
        const stimBtn = comp.querySelector('#strip-substance-stimulants');
        stimBtn.click();
        assert.strictEqual(getTestStripState().substance, 'stimulants');
        assert.ok(comp.querySelector('.stimulant-cross-reactivity-warning'), 'Displays cross reactivity warning for stimulants');

        // Click 100 mg amount
        const amt100Btn = comp.querySelector('#strip-amount-100mg');
        amt100Btn.click();
        assert.strictEqual(getTestStripState().amountMg, 100);
        assert.match(comp.textContent, /1\/2 cup \(120 mL\)/i);

        // Click Pills
        const pillsBtn = comp.querySelector('#strip-substance-pills');
        pillsBtn.click();
        assert.strictEqual(getTestStripState().substance, 'pills');
        assert.ok(comp.querySelector('.pill-crush-warning'), 'Displays pill crush warning for counterfeit pills');
      });
    });

    it('interactively decodes test strip results and renders specific clinical caveats', () => {
      withMockDom(() => {
        const comp = testStripCalculator();

        // 1. Click POSITIVE
        const posBtn = comp.querySelector('#strip-interp-positive');
        posBtn.click();
        assert.strictEqual(getTestStripState().selectedInterpretation, 'positive');
        assert.ok(comp.querySelector('.strip-line-control'), 'Control line shown on strip');
        const zoneT = comp.querySelector('.strip-zone-t');
        assert.ok(zoneT && zoneT.querySelector('.strip-line-absent'), 'Test line absent on positive strip');
        const posCard = comp.querySelector('#test-strip-result-card');
        assert.ok(posCard.classList.contains('callout-emergency'));
        assert.match(posCard.textContent, /Never Use Alone/i);
        assert.match(posCard.textContent, /Naloxone/i);

        // 2. Click NEGATIVE
        const negBtn = comp.querySelector('#strip-interp-negative');
        negBtn.click();
        assert.strictEqual(getTestStripState().selectedInterpretation, 'negative');
        assert.ok(comp.querySelector('.strip-line-control'), 'Control line shown');
        assert.ok(comp.querySelector('.strip-line-test'), 'Test line shown');
        const negCard = comp.querySelector('#test-strip-result-card');
        assert.ok(negCard.classList.contains('callout-info'));
        assert.match(negCard.textContent, /Chocolate chip cookie effect/i);
        assert.match(negCard.textContent, /nitazenes/i);

        // 3. Click INVALID
        const invBtn = comp.querySelector('#strip-interp-invalid');
        invBtn.click();
        assert.strictEqual(getTestStripState().selectedInterpretation, 'invalid');
        const invCard = comp.querySelector('#test-strip-result-card');
        assert.ok(invCard.classList.contains('callout-warn'));
        assert.match(invCard.textContent, /retest/i);
      });
    });

    it('has ZERO inline style attributes anywhere in DOM (CSP compliance)', () => {
      withMockDom(() => {
        const comp = testStripCalculator();

        // Traverse all elements in component
        const allNodes = comp.findAll(() => true);
        for (const n of allNodes) {
          assert.strictEqual(n.getAttribute('style'), null, `Node <${n.tagName}> must not contain inline style`);
          assert.strictEqual(n.hasAttribute('style'), false, `Node <${n.tagName}> hasAttribute('style') must be false`);
        }
      });
    });

    it('is mounted inside section#checking in harmReductionView()', () => {
      withMockDom(() => {
        const view = harmReductionView();
        assert.ok(view instanceof MockNode);

        const checkingSection = view.querySelector('#checking');
        assert.ok(checkingSection, 'section#checking exists in harmReductionView');

        const mountedCalc = checkingSection.querySelector('#test-strip-calculator');
        assert.ok(mountedCalc, 'testStripCalculator is mounted inside section#checking');
      });
    });
  });
});
