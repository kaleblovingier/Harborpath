import test from 'node:test';
import assert from 'node:assert/strict';
import { installMockDom } from './fixtures/mockDomHelper.js';
import { evaluateDrugInteractions } from '../public/js/views/pharmacologyEngine.js';
import { medicationsView, getMedicationsState, resetMedicationsState } from '../public/js/views/medications.js';
import { createOverdoseResilienceState, transitionOverdoseResilience } from '../public/js/views/overdoseResilience.js';
import { overdoseView } from '../public/js/views/overdose.js';
import {
  recordFirstDose, recordSecondDose, setOverdosePacerStep,
  tickReDoseTimer, startRescueBreathingTimer, tickRescueBreathing,
  recordSpontaneousBreathingResumed, getOverdosePacerState, resetOverdosePacer,
} from '../public/js/components/overdosePacing.js';
import { runQuickExitHandlers } from '../public/js/state.js';

test('medication combination chips evaluate the shared engine immediately and quick exit clears the rendered selection', () => {
  const restore = installMockDom();
  try {
    const root = medicationsView();
    const output = root.querySelector('#regimen-safety-output');
    const chips = root.querySelector('#regimen-safety-checker').querySelectorAll('button');
    const choose = (id) => chips.find((chip) => chip.dataset.agentId === id).click();
    choose('opioids_fentanyl');
    choose('buprenorphine');
    assert.match(output.textContent, /Precipitated Opioid Withdrawal Risk/i);
    assert.equal(evaluateDrugInteractions(['fentanyl', 'buprenorphine']).riskLevel, 'high');
    choose('opioids_fentanyl');
    choose('buprenorphine');
    choose('methadone');
    choose('benzos_sedatives');
    assert.match(output.textContent, /respiratory depression/i);
    choose('xylazine_medetomidine');
    assert.match(output.textContent, /naloxone.*not.*reverse|will not reverse/i);
    assert.equal(getMedicationsState().selectedRegimen.length, 3);
    runQuickExitHandlers();
    assert.deepEqual(getMedicationsState().selectedRegimen, []);
    assert.match(output.textContent, /Select 2 or more/i);
    assert.ok(chips.filter((chip) => chip.dataset.agentId).every((chip) => chip.getAttribute('aria-pressed') === 'false'));
  } finally {
    resetMedicationsState();
    restore();
  }
});

test('deterministic rescue state catches up delayed callbacks, restarts each dose, and ignores paused or recovered ticks', () => {
  const initial = createOverdoseResilienceState();
  let state = transitionOverdoseResilience(initial, { type: 'START_DOSE_CLOCK' });
  state = transitionOverdoseResilience(state, { type: 'DOSE_TICK', seconds: 119 });
  assert.equal(state.naloxoneRemainingSeconds, 1);
  assert.equal(state.twoMinuteAlertTriggered, false);
  state = transitionOverdoseResilience(state, { type: 'DOSE_TICK', seconds: 1 });
  assert.equal(state.naloxoneRemainingSeconds, 0);
  assert.equal(state.evaluationAlert, '2min_evaluate');
  state = transitionOverdoseResilience(state, { type: 'RESET_DOSE_CLOCK' });
  assert.equal(state.naloxoneRemainingSeconds, 120);
  state = transitionOverdoseResilience(state, { type: 'START_BREATHING' });
  state = transitionOverdoseResilience(state, { type: 'BREATH_TICK', seconds: 60 });
  assert.equal(state.breathCount, 13);
  assert.equal(state.currentBreathSecond, 1);
  assert.equal(initial.breathCount, 0, 'transitions never mutate earlier state');
  state = transitionOverdoseResilience(state, { type: 'RECOVER' });
  assert.deepEqual(transitionOverdoseResilience(state, { type: 'DOSE_TICK', seconds: 300 }), state);
  assert.deepEqual(transitionOverdoseResilience(state, { type: 'BREATH_TICK', seconds: 300 }), state);
});

test('overdose route binds a true 2-minute countdown and 5-second cadence without replacing emergency instructions', () => {
  const restore = installMockDom();
  try {
    resetOverdosePacer();
    const root = overdoseView();
    assert.match(root.textContent, /Call 911/);
    recordFirstDose();
    setOverdosePacerStep(4);
    const countdown = () => root.querySelector('.pacer-naloxone-countdown');
    assert.equal(countdown().textContent, '2:00');
    tickReDoseTimer(119);
    assert.equal(countdown().textContent, '0:01');
    tickReDoseTimer(1);
    assert.equal(countdown().textContent, '0:00');
    assert.match(root.querySelector('.pacer-alert-container').textContent, /breathing.*slow, shallow, or absent/i);
    recordSecondDose();
    assert.equal(countdown().textContent, '2:00');
    setOverdosePacerStep(3);
    startRescueBreathingTimer();
    tickRescueBreathing(5);
    assert.equal(root.querySelector('.pacer-breath-count-value').textContent, '2');
    recordSpontaneousBreathingResumed();
    const recovered = getOverdosePacerState();
    tickReDoseTimer(180);
    tickRescueBreathing(10);
    assert.equal(getOverdosePacerState().breathCount, recovered.breathCount);
    assert.equal(getOverdosePacerState().reDoseElapsedSeconds, recovered.reDoseElapsedSeconds);
    runQuickExitHandlers();
    assert.equal(getOverdosePacerState().naloxoneRemainingSeconds, 120);
    assert.equal(getOverdosePacerState().isBreathingActive, false);
    assert.equal(getOverdosePacerState().reDoseTimerActive, false);
  } finally {
    resetOverdosePacer();
    restore();
  }
});

test('live timers recover elapsed time from throttled callbacks and quick exit makes queued ticks inert', () => {
  const restore = installMockDom();
  const originalPerformance = Object.getOwnPropertyDescriptor(globalThis, 'performance');
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  let now = 0;
  const callbacks = [];
  Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => now } });
  globalThis.setInterval = (callback) => { callbacks.push(callback); return callbacks.length; };
  globalThis.clearInterval = () => {};
  try {
    resetOverdosePacer();
    let cues = 0;
    recordFirstDose();
    startRescueBreathingTimer({ onBreath: () => { cues += 1; } });
    now = 120_000;
    callbacks[0]();
    callbacks[1]();
    assert.equal(getOverdosePacerState().naloxoneRemainingSeconds, 0);
    assert.equal(getOverdosePacerState().evaluationAlert, '2min_evaluate');
    assert.equal(getOverdosePacerState().breathCount, 25);
    assert.equal(cues, 2, 'one current cue follows the initial cue, without replaying 24 missed cues');
    runQuickExitHandlers();
    now = 240_000;
    callbacks.forEach((callback) => callback());
    assert.equal(getOverdosePacerState().reDoseElapsedSeconds, 0);
    assert.equal(getOverdosePacerState().breathCount, 0);
    assert.equal(cues, 2);
  } finally {
    resetOverdosePacer();
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    if (originalPerformance) Object.defineProperty(globalThis, 'performance', originalPerformance);
    else delete globalThis.performance;
    restore();
  }
});
