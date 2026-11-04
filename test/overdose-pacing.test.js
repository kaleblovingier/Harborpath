import test from 'node:test';
import assert from 'node:assert/strict';
import { useDictionary } from '../public/js/i18n.js';
import esClinical from '../public/js/locales/es-clinical.js';
useDictionary('en', {});

import {
  RESCUE_PACING_STEPS,
  overdosePacer,
  getOverdosePacerState,
  startRescueBreathingTimer,
  stopRescueBreathingTimer,
  tickRescueBreathing,
  startReDoseTimer,
  stopReDoseTimer,
  tickReDoseTimer,
  recordFirstDose,
  recordSecondDose,
  recordSpontaneousBreathingResumed,
  setOverdosePacerStep,
  nextPacerStep,
  prevPacerStep,
  resetOverdosePacer,
  setReducedMotion,
  toggleReducedMotion,
  subscribeOverdosePacer,
  formatTime,
} from '../public/js/components/overdosePacing.js';

import {
  WOODEN_CHEST_SYNDROME,
  RENARCONIZATION_RISK,
  XYLAZINE_SEDATION_MANAGEMENT,
} from '../public/js/content/reversalFormulations.js';

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
      if (selector.includes('[aria-current=') && selector.includes(']')) {
        const match = selector.match(/\[aria-current=["']?([^"'\]]+)["']?\]/);
        if (match && node.getAttribute('aria-current') === match[1]) return true;
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

// -----------------------------------------------------------------------------
// Test Suites
// -----------------------------------------------------------------------------

test('RESCUE_PACING_STEPS schema and evidence-based clinical protocols', async (t) => {
  await t.test('defines exactly 5 progressive rescue steps in proper sequential order', () => {
    assert.equal(Array.isArray(RESCUE_PACING_STEPS), true);
    assert.equal(RESCUE_PACING_STEPS.length, 5);

    const stepNumbers = RESCUE_PACING_STEPS.map((s) => s.step);
    assert.deepEqual(stepNumbers, [1, 2, 3, 4, 5]);

    const stepIds = RESCUE_PACING_STEPS.map((s) => s.id);
    assert.deepEqual(stepIds, [
      'responsiveness',
      'first_dose',
      'rescue_breathing',
      'redosing_clock',
      'recovery_position',
    ]);
  });

  await t.test('Step 1 checks response and breathing without painful stimulation', () => {
    const s1 = RESCUE_PACING_STEPS[0];
    assert.equal(s1.step, 1);
    assert.match(s1.headline, /breathing normally/i);
    assert.ok(s1.instructions.some((i) => /tap their shoulders/i.test(i)));
    assert.doesNotMatch(s1.instructions.join(' '), /grind|physical pain|sternal rub/i);
    assert.ok(s1.instructions.some((i) => i.includes('911')));
    assert.match(s1.clinicalNote, /suspected opioid overdose/i);
    assert.match(s1.clinicalNote, /does not replace.*CPR/i);
  });

  await t.test('Step 2 incorporates 4mg nasal spray and 0.4mg IM injection formulations', () => {
    const s2 = RESCUE_PACING_STEPS[1];
    assert.equal(s2.step, 2);
    assert.match(s2.headline, /4mg nasal spray/i);
    assert.ok(s2.formulations.nasal);
    assert.equal(s2.formulations.nasal.dose, '4 mg in 0.1 mL');
    assert.ok(s2.formulations.injectable);
    assert.equal(s2.formulations.injectable.dose, '0.4 mg / 1 mL');
    assert.match(s2.timingNote, /2 to 3 minutes/i);
  });

  await t.test('Step 3 specifies 1 breath every 5 seconds (12 breaths/minute) and incorporates Wooden Chest Syndrome', () => {
    const s3 = RESCUE_PACING_STEPS[2];
    assert.equal(s3.step, 3);
    assert.equal(s3.rhythmSeconds, 5);
    assert.equal(s3.targetBreathsPerMin, 12);
    assert.match(s3.headline, /1 breath every 5 seconds/i);

    // Clinical Callout: Fentanyl Wooden Chest Syndrome
    assert.equal(s3.clinicalCallout.type, 'wooden_chest_syndrome');
    assert.equal(s3.clinicalCallout.title, WOODEN_CHEST_SYNDROME.title);
    assert.match(s3.clinicalCallout.warning, /Wooden Chest Syndrome/i);
    assert.match(s3.clinicalCallout.warning, /cannot diagnose/i);
    assert.match(s3.clinicalCallout.action, /new nasal spray every 2–3 minutes/i);
    assert.match(s3.clinicalCallout.action, /product label/i);
    assert.doesNotMatch(s3.clinicalCallout.action, /60.*90 seconds|neuromuscular blockade|requiring.*intubation/i);
    assert.ok(s3.instructions.some((i) => /911.*CPR instructions/i.test(i)));
  });

  await t.test('Step 4 specifies 2-minute and 3-minute marks and incorporates Xylazine Sedation Caution', () => {
    const s4 = RESCUE_PACING_STEPS[3];
    assert.equal(s4.step, 4);
    assert.equal(s4.evaluationPoints.length, 2);
    assert.equal(s4.evaluationPoints[0].seconds, 120);
    assert.equal(s4.evaluationPoints[1].seconds, 180);

    // Clinical Callout: Xylazine Sedation Management
    assert.equal(s4.clinicalCallout.type, 'xylazine_sedation');
    assert.equal(s4.clinicalCallout.title, XYLAZINE_SEDATION_MANAGEMENT.title);
    assert.match(s4.clinicalCallout.warning, /still give naloxone.*suspected opioid overdose/i);
    assert.match(s4.clinicalCallout.clinicalGoal, /normal breathing, not full wakefulness/i);
    assert.match(s4.clinicalCallout.action, /recovery position/i);
    for (const point of s4.evaluationPoints) {
      assert.match(point.instruction, /breathing.*slow, shallow, or absent/i);
      assert.match(point.instruction, /new nasal spray/i);
      assert.doesNotMatch(point.instruction, /still unresponsive or/i);
    }
  });

  await t.test('Step 5 specifies Left Lateral Recumbent position and incorporates Renarconization Risk', () => {
    const s5 = RESCUE_PACING_STEPS[4];
    assert.equal(s5.step, 5);
    assert.match(s5.headline, /Left lateral recumbent/i);
    assert.match(s5.headline, /prevent aspiration/i);
    assert.ok(s5.instructions.some((i) => i.includes('LEFT side')));
    assert.ok(s5.instructions.some((i) => i.includes('90-degree angle')));

    // Clinical Callout: Renarconization Risk
    assert.equal(s5.clinicalCallout.type, 'renarconization_risk');
    assert.equal(s5.clinicalCallout.title, RENARCONIZATION_RISK.title);
    assert.match(s5.clinicalCallout.warning, /Renarconization Risk/i);
    assert.match(s5.clinicalCallout.warning, /half-life of 30 to 90 minutes/i);
    assert.match(s5.clinicalCallout.action, /stay with the person until emergency help takes over/i);
    assert.doesNotMatch(s5.clinicalCallout.action, /never allow.*leave/i);
  });
});

test('In-RAM ephemeral state and clean deterministic resets', async (t) => {
  await t.test('getOverdosePacerState returns clean initial state', () => {
    resetOverdosePacer();
    const st = getOverdosePacerState();
    assert.equal(st.currentStep, 1);
    assert.equal(st.isBreathingActive, false);
    assert.equal(st.breathCount, 0);
    assert.equal(st.breathPhase, 'ready');
    assert.equal(st.breathCycleSeconds, 5);
    assert.equal(st.currentBreathSecond, 0);
    assert.equal(st.firstDoseAdministered, false);
    assert.equal(st.reDoseTimerActive, false);
    assert.equal(st.reDoseElapsedSeconds, 0);
    assert.equal(st.reDoseRemainingSeconds, 180);
    assert.equal(st.twoMinuteAlertTriggered, false);
    assert.equal(st.threeMinuteAlertTriggered, false);
    assert.equal(st.secondDoseAdministered, false);
    assert.equal(st.spontaneousBreathingResumed, false);
    assert.equal(st.completed, false);
  });

  await t.test('getOverdosePacerState returns an immutable copy', () => {
    resetOverdosePacer();
    const st1 = getOverdosePacerState();
    st1.currentStep = 999;
    st1.breathCount = 500;

    const st2 = getOverdosePacerState();
    assert.equal(st2.currentStep, 1);
    assert.equal(st2.breathCount, 0);
  });

  await t.test('resetOverdosePacer deterministically halts timers and restores clean initial values', () => {
    resetOverdosePacer();
    setOverdosePacerStep(3);
    startRescueBreathingTimer();
    tickRescueBreathing(10);
    recordFirstDose();
    tickReDoseTimer(60);

    const mid = getOverdosePacerState();
    assert.equal(mid.isBreathingActive, true);
    assert.ok(mid.breathCount >= 2);
    assert.equal(mid.reDoseTimerActive, true);
    assert.equal(mid.reDoseElapsedSeconds, 60);

    const resetState = resetOverdosePacer();
    assert.equal(resetState.currentStep, 1);
    assert.equal(resetState.isBreathingActive, false);
    assert.equal(resetState.breathCount, 0);
    assert.equal(resetState.reDoseTimerActive, false);
    assert.equal(resetState.reDoseElapsedSeconds, 0);
    assert.equal(resetState.reDoseRemainingSeconds, 180);
  });
});

test('Step progression and dose administration navigation', async (t) => {
  await t.test('setOverdosePacerStep navigates between steps and enforces 1-5 boundary', () => {
    resetOverdosePacer();
    assert.equal(getOverdosePacerState().currentStep, 1);

    setOverdosePacerStep(2);
    assert.equal(getOverdosePacerState().currentStep, 2);

    setOverdosePacerStep(5);
    assert.equal(getOverdosePacerState().currentStep, 5);

    // Out of bounds checks
    setOverdosePacerStep(10);
    assert.equal(getOverdosePacerState().currentStep, 5);

    setOverdosePacerStep(0);
    assert.equal(getOverdosePacerState().currentStep, 1);

    setOverdosePacerStep(-5);
    assert.equal(getOverdosePacerState().currentStep, 1);
  });

  await t.test('nextPacerStep and prevPacerStep advance and retreat safely', () => {
    resetOverdosePacer();
    assert.equal(getOverdosePacerState().currentStep, 1);

    nextPacerStep();
    assert.equal(getOverdosePacerState().currentStep, 2);

    nextPacerStep();
    assert.equal(getOverdosePacerState().currentStep, 3);

    prevPacerStep();
    assert.equal(getOverdosePacerState().currentStep, 2);

    prevPacerStep();
    assert.equal(getOverdosePacerState().currentStep, 1);

    prevPacerStep(); // At bottom, stays at 1
    assert.equal(getOverdosePacerState().currentStep, 1);
  });

  await t.test('recordFirstDose records administration, alternated nostril, and starts re-dose clock', () => {
    resetOverdosePacer();
    recordFirstDose({ route: 'nasal_4mg', nostril: 'right' });
    const st = getOverdosePacerState();

    assert.equal(st.firstDoseAdministered, true);
    assert.ok(st.firstDoseTimestamp > 0);
    assert.equal(st.firstDoseNostril, 'right');
    assert.equal(st.secondDoseNostril, 'left');
    assert.equal(st.reDoseTimerActive, true);
    stopReDoseTimer();
  });

  await t.test('recordSecondDose records administration in opposite nostril', () => {
    resetOverdosePacer();
    recordFirstDose({ nostril: 'right' });
    recordSecondDose({ nostril: 'left' });
    const st = getOverdosePacerState();

    assert.equal(st.secondDoseAdministered, true);
    assert.ok(st.secondDoseTimestamp > 0);
    assert.equal(st.secondDoseNostril, 'left');
    stopReDoseTimer();
  });

  await t.test('recording the second dose restarts the label interval from that dose', () => {
    resetOverdosePacer();
    recordFirstDose({ nostril: 'right' });
    tickReDoseTimer(120);
    assert.equal(getOverdosePacerState().twoMinuteAlertTriggered, true);

    recordSecondDose({ nostril: 'left' });
    const restarted = getOverdosePacerState();
    assert.equal(restarted.reDoseElapsedSeconds, 0);
    assert.equal(restarted.reDoseRemainingSeconds, 180);
    assert.equal(restarted.twoMinuteAlertTriggered, false);
    assert.equal(restarted.threeMinuteAlertTriggered, false);
    assert.equal(restarted.evaluationAlert, null);

    // A dose at the two-minute mark must not produce another prompt only
    // one minute later from the previous dose's clock.
    tickReDoseTimer(60);
    assert.equal(getOverdosePacerState().evaluationAlert, null);
    tickReDoseTimer(60);
    assert.equal(getOverdosePacerState().evaluationAlert, '2min_evaluate');
    stopReDoseTimer();
  });

  await t.test('normal breathing moves to recovery and stops dose prompts and breathing cues', () => {
    resetOverdosePacer();
    setOverdosePacerStep(3);
    startRescueBreathingTimer();
    recordFirstDose();
    tickReDoseTimer(119);
    recordSpontaneousBreathingResumed();
    const st = getOverdosePacerState();

    assert.equal(st.spontaneousBreathingResumed, true);
    assert.equal(st.currentStep, 5);
    assert.equal(st.isBreathingActive, false);
    assert.equal(st.reDoseTimerActive, false);

    // A queued callback after recovery must not tell a sleepy person’s helper
    // to give another dose merely because the previous clock reached a mark.
    const alerts = [];
    tickReDoseTimer(180, { onAlert: (alert) => alerts.push(alert) });
    assert.deepEqual(alerts, []);
    assert.equal(getOverdosePacerState().reDoseElapsedSeconds, 119);
    assert.equal(getOverdosePacerState().evaluationAlert, null);
  });
});

test('Rescue breathing metronome rhythm and cadence (1 breath every 5s / 12 bpm)', async (t) => {
  await t.test('starts metronome, delivers immediate initial breath, and paces through 5s cycle', () => {
    resetOverdosePacer();
    let breathCountEmitted = 0;

    startRescueBreathingTimer({
      onBreath: (count) => {
        breathCountEmitted = count;
      },
    });

    const init = getOverdosePacerState();
    assert.equal(init.isBreathingActive, true);
    assert.equal(init.breathCount, 1);
    assert.equal(init.breathPhase, 'inhale');
    assert.equal(init.currentBreathSecond, 1);
    assert.equal(breathCountEmitted, 1);

    // Tick 1 second (second 2 of 5: pause phase)
    tickRescueBreathing(1);
    const s2 = getOverdosePacerState();
    assert.equal(s2.currentBreathSecond, 2);
    assert.equal(s2.breathPhase, 'pause');
    assert.equal(s2.breathCount, 1);

    // Tick 3 more seconds (seconds 3, 4, 5: pause phase)
    tickRescueBreathing(3);
    const s5 = getOverdosePacerState();
    assert.equal(s5.currentBreathSecond, 5);
    assert.equal(s5.breathPhase, 'pause');
    assert.equal(s5.breathCount, 1);

    // Tick 1 more second: completes 5-second cycle, enters second 1 (inhale), increments breath count
    tickRescueBreathing(1);
    const s6 = getOverdosePacerState();
    assert.equal(s6.currentBreathSecond, 1);
    assert.equal(s6.breathPhase, 'inhale');
    assert.equal(s6.breathCount, 2);
    assert.equal(breathCountEmitted, 2);

    stopRescueBreathingTimer();
  });

  await t.test('delivers exactly 12 breaths per minute (60 seconds = 12 full 5-second cycles)', () => {
    resetOverdosePacer();
    startRescueBreathingTimer(); // Breath 1 triggered initially
    assert.equal(getOverdosePacerState().breathCount, 1);

    // 60 seconds of ticks corresponds to 12 cycles of 5s each
    tickRescueBreathing(60);
    const st = getOverdosePacerState();
    assert.equal(st.breathCount, 13); // Initial 1 + 12 additional full cycles

    stopRescueBreathingTimer();
  });

  await t.test('stopRescueBreathingTimer pauses the timer and preserves delivered breath count', () => {
    resetOverdosePacer();
    startRescueBreathingTimer();
    tickRescueBreathing(15); // 3 full cycles = 4 total breaths
    assert.equal(getOverdosePacerState().breathCount, 4);

    stopRescueBreathingTimer();
    const stopped = getOverdosePacerState();
    assert.equal(stopped.isBreathingActive, false);
    assert.equal(stopped.breathPhase, 'ready');
    assert.equal(stopped.breathCount, 4);
  });
});

test('2-to-3 minute Naloxone re-dosing evaluation clock and countdown calculations', async (t) => {
  await t.test('formatTime helper outputs correct MM:SS representation', () => {
    assert.equal(formatTime(180), '3:00');
    assert.equal(formatTime(125), '2:05');
    assert.equal(formatTime(120), '2:00');
    assert.equal(formatTime(60), '1:00');
    assert.equal(formatTime(9), '0:09');
    assert.equal(formatTime(0), '0:00');
    assert.equal(formatTime(-10), '0:00');
  });

  await t.test('counts down from 180s (3:00) and triggers 2-minute and 3-minute alerts', () => {
    resetOverdosePacer();
    let lastAlert = null;

    startReDoseTimer({
      onAlert: (alertType) => {
        lastAlert = alertType;
      },
    });

    const init = getOverdosePacerState();
    assert.equal(init.reDoseElapsedSeconds, 0);
    assert.equal(init.reDoseRemainingSeconds, 180);
    assert.equal(init.twoMinuteAlertTriggered, false);
    assert.equal(init.threeMinuteAlertTriggered, false);

    // Tick 60 seconds (1 minute elapsed)
    tickReDoseTimer(60);
    const m1 = getOverdosePacerState();
    assert.equal(m1.reDoseElapsedSeconds, 60);
    assert.equal(m1.reDoseRemainingSeconds, 120);
    assert.equal(m1.twoMinuteAlertTriggered, false);
    assert.equal(lastAlert, null);

    // Tick 60 more seconds (total 120 seconds = 2 minutes elapsed)
    tickReDoseTimer(60);
    const m2 = getOverdosePacerState();
    assert.equal(m2.reDoseElapsedSeconds, 120);
    assert.equal(m2.reDoseRemainingSeconds, 60);
    assert.equal(m2.twoMinuteAlertTriggered, true);
    assert.equal(m2.evaluationAlert, '2min_evaluate');
    assert.equal(lastAlert, '2min_evaluate');

    // Tick 60 more seconds (total 180 seconds = 3 minutes elapsed)
    tickReDoseTimer(60);
    const m3 = getOverdosePacerState();
    assert.equal(m3.reDoseElapsedSeconds, 180);
    assert.equal(m3.reDoseRemainingSeconds, 0);
    assert.equal(m3.threeMinuteAlertTriggered, true);
    assert.equal(m3.evaluationAlert, '3min_redose_prompt');
    assert.equal(lastAlert, '3min_redose_prompt');

    // Ticking further clamps remaining at 0
    tickReDoseTimer(10);
    const mPast = getOverdosePacerState();
    assert.equal(mPast.reDoseElapsedSeconds, 190);
    assert.equal(mPast.reDoseRemainingSeconds, 0);

    stopReDoseTimer();
  });
});

test('Reduced-motion support and sensory mode adaptability', async (t) => {
  await t.test('setReducedMotion and toggleReducedMotion mutate state and notify subscribers', () => {
    resetOverdosePacer();
    assert.equal(getOverdosePacerState().reducedMotion, false);

    setReducedMotion(true);
    assert.equal(getOverdosePacerState().reducedMotion, true);

    toggleReducedMotion();
    assert.equal(getOverdosePacerState().reducedMotion, false);
  });

  await t.test('subscribeOverdosePacer delivers real-time updates and unregisters cleanly', () => {
    resetOverdosePacer();
    const history = [];
    const unsub = subscribeOverdosePacer((st) => history.push(st.currentStep));

    setOverdosePacerStep(2);
    setOverdosePacerStep(3);
    unsub();
    setOverdosePacerStep(4);

    assert.deepEqual(history, [2, 3]);
  });
});

test('DOM Component: overdosePacer accessible rendering and step progression', () => {
  withMockDom(({ body }) => {
    resetOverdosePacer();
    let completedState = null;
    let resetInvoked = false;

    const pacerRoot = overdosePacer({
      onComplete: (st) => {
        completedState = st;
      },
      onReset: () => {
        resetInvoked = true;
      },
    });

    body.append(pacerRoot);

    // Root container accessibility
    assert.equal(pacerRoot.tagName, 'DIV');
    assert.equal(pacerRoot.getAttribute('role'), 'region');
    assert.equal(pacerRoot.getAttribute('data-step'), '1');
    assert.match(pacerRoot.getAttribute('aria-label'), /Rescue Pacing Assistant/i);

    // Stepper navigation tabs
    const tabs = pacerRoot.querySelectorAll('.pacer-step-tab');
    assert.equal(tabs.length, 5);

    // Step 1 initial view
    const title = pacerRoot.querySelector('.pacer-step-title');
    assert.match(title.textContent, /Check Response & Breathing/i);

    // Call 911 button is present in Step 1
    const callBtn = pacerRoot.querySelector('.btn-emergency');
    assert.ok(callBtn);
    assert.equal(callBtn.getAttribute('href'), 'tel:911');

    // Click advance button to move to Step 2
    const advanceBtn = pacerRoot.querySelectorAll('button').find((b) =>
      b.textContent.includes('Proceed to Naloxone')
    );
    assert.ok(advanceBtn);
    advanceBtn.click();

    // Verify progression to Step 2
    assert.equal(getOverdosePacerState().currentStep, 2);
    assert.equal(pacerRoot.getAttribute('data-step'), '2');

    // Step 2 shows 1st dose confirmation button
    const dose1Btn = pacerRoot.querySelectorAll('button').find((b) =>
      b.textContent.includes('Administer 1st Dose')
    );
    assert.ok(dose1Btn);
    dose1Btn.click();

    // Recording a dose starts its clock, but never starts rescue breathing
    // automatically before the helper can read the dispatcher/CPR instruction.
    const stStep3 = getOverdosePacerState();
    assert.equal(stStep3.currentStep, 3);
    assert.equal(stStep3.firstDoseAdministered, true);
    assert.equal(stStep3.isBreathingActive, false);
    assert.equal(stStep3.reDoseTimerActive, true);
    assert.match(pacerRoot.textContent, /911 dispatcher’s CPR instructions/i);
    const metronomeStart = pacerRoot.querySelectorAll('button').find((b) => b.textContent.includes('Start Metronome'));
    assert.ok(metronomeStart);
    metronomeStart.click();
    assert.equal(getOverdosePacerState().isBreathingActive, true);

    // Step 3 metronome has role="timer" and aria-live="polite"
    const metronomeBox = pacerRoot.querySelector('.pacer-metronome-box');
    assert.ok(metronomeBox);
    assert.equal(metronomeBox.getAttribute('role'), 'timer');
    assert.equal(metronomeBox.getAttribute('aria-live'), 'polite');

    // Step 3 contains Wooden Chest Syndrome warning
    const woodenChestAlert = pacerRoot.querySelector('.alert-wooden-chest');
    assert.ok(woodenChestAlert);
    assert.match(woodenChestAlert.textContent, /Wooden Chest/i);

    // Navigate to Step 4 (Re-dosing clock)
    setOverdosePacerStep(4);
    assert.equal(pacerRoot.getAttribute('data-step'), '4');

    // Step 4 clock has role="timer" and aria-live="assertive"
    const clockBox = pacerRoot.querySelector('.pacer-clock-box');
    assert.ok(clockBox);
    assert.equal(clockBox.getAttribute('role'), 'timer');
    assert.equal(clockBox.getAttribute('aria-live'), 'assertive');

    // Step 4 contains Xylazine sedation caution callout
    const xylazineAlert = pacerRoot.querySelector('.alert-xylazine');
    assert.ok(xylazineAlert);
    assert.match(xylazineAlert.textContent, /Xylazine/i);
    assert.match(xylazineAlert.textContent, /normal breathing, not full wakefulness/i);

    // Simulate clicking "Normal Breathing Resumed" -> proceeds to Step 5
    const breathingResumedBtn = pacerRoot.querySelectorAll('button').find((b) =>
      b.textContent.includes('Normal Breathing Resumed')
    );
    assert.ok(breathingResumedBtn);
    breathingResumedBtn.click();

    // Verify Step 5 (Recovery Position)
    assert.equal(getOverdosePacerState().currentStep, 5);
    assert.equal(pacerRoot.getAttribute('data-step'), '5');

    // Step 5 contains Renarconization risk callout
    const renarconAlert = pacerRoot.querySelector('.alert-renarconization');
    assert.ok(renarconAlert);
    assert.match(renarconAlert.textContent, /Renarconization/i);

    // Step 5 completion button triggers onComplete callback
    const completeBtn = pacerRoot.querySelectorAll('button').find((b) =>
      b.textContent.includes('Complete Rescue Protocol')
    );
    assert.ok(completeBtn);
    completeBtn.click();
    assert.ok(completedState);
    assert.equal(completedState.completed, true);

    // Reset button triggers onReset and restores state
    const resetBtn = pacerRoot.querySelector('.pacer-reset-btn');
    assert.ok(resetBtn);
    resetBtn.click();
    assert.equal(resetInvoked, true);
    assert.equal(getOverdosePacerState().currentStep, 1);
  });
});

test('English and Spanish emergency views and live alerts use breathing-based redosing', () => {
  for (const [lang, dictionary] of [['en', {}], ['es', esClinical]]) {
    useDictionary(lang, dictionary);
    try {
      withMockDom(({ body }) => {
        resetOverdosePacer();
        const root = overdosePacer();
        body.append(root);
        setOverdosePacerStep(3);
        const step3 = root.textContent;
        assert.match(step3, lang === 'en' ? /cannot diagnose/i : /no puede diagnosticar/i);
        assert.match(step3, lang === 'en' ? /911 dispatcher’s CPR instructions/i : /RCP del operador del 911/i);
        assert.doesNotMatch(step3, /60.?90|60 a 90|requiring rapid sequence|requiere intubación/i);

        recordFirstDose();
        setOverdosePacerStep(4);
        tickReDoseTimer(120);
        const doseAtTwoMinutes = root.querySelector('.pacer-alert-container').textContent;
        assert.match(doseAtTwoMinutes, lang === 'en' ? /breathing.*slow, shallow, or absent/i : /respiración.*lenta, superficial o ausente/i);
        assert.match(doseAtTwoMinutes, lang === 'en' ? /new nasal spray/i : /aerosol nasal nuevo/i);
        tickReDoseTimer(60);
        const doseAtThreeMinutes = root.querySelector('.pacer-alert-container').textContent;
        assert.match(doseAtThreeMinutes, lang === 'en' ? /normal breathing can return before/i : /respiración normal puede volver antes/i);
        assert.doesNotMatch(doseAtThreeMinutes, /still unresponsive or|sigue sin responder o/i);
        assert.match(root.querySelector('.alert-xylazine').textContent, lang === 'en' ? /not full wakefulness/i : /no despertar por completo/i);

        const recordDose = root.querySelector('.pacer-second-dose-box').querySelector('button');
        assert.ok(recordDose);
        recordDose.click();
        assert.equal(root.querySelector('.timer-display').textContent, '3:00');
        assert.match(root.querySelector('.pacer-second-dose-box').textContent, lang === 'en' ? /second dose recorded/i : /segunda dosis registrada/i);
        assert.equal(root.querySelector('.pacer-second-dose-box').querySelector('button'), null);
      });
    } finally {
      resetOverdosePacer();
      useDictionary('en', {});
    }
  }
});
