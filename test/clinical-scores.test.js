import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COWS_ITEMS, CIWA_ITEMS, scoreCows, scoreCiwaAr, clinicalScoresView, getClinicalScoresState, resetClinicalScoresState } from '../public/js/views/clinicalScores.js';
import { executeGlobalQuickExit } from '../public/js/quickExitRegistry.js';
import { useDictionary } from '../public/js/i18n.js';
import { installMockDom } from './fixtures/mockDomHelper.js';

const zeros = (items) => Object.fromEntries(items.map(({ key }) => [key, 0]));

test('COWS preserves the eleven domains, sparse point values, maximum and severity boundaries', () => {
  assert.equal(COWS_ITEMS.length, 11);
  const base = zeros(COWS_ITEMS);
  assert.equal(scoreCows(base).band, 'minimal');
  assert.equal(scoreCows({ ...base, pulse: 4, sweating: 1 }).band, 'mild');
  assert.equal(scoreCows({ ...base, pulse: 4, sweating: 4, anxiety: 4 }).score, 12);
  assert.equal(scoreCows({ ...base, pulse: 4, sweating: 4, restlessness: 5 }).band, 'moderate');
  const twentyFour = { ...base, pulse: 4, sweating: 4, restlessness: 5, pupils: 5, aches: 4, noseEyes: 2 };
  assert.equal(scoreCows(twentyFour).score, 24);
  assert.equal(scoreCows({ ...twentyFour, yawning: 1 }).band, 'moderately_severe');
  const thirtySix = { ...base, pulse: 4, sweating: 4, restlessness: 5, pupils: 5, aches: 4, noseEyes: 4, gi: 5, tremor: 4, yawning: 1 };
  assert.equal(scoreCows(thirtySix).score, 36);
  assert.equal(scoreCows(thirtySix).band, 'moderately_severe');
  assert.equal(scoreCows({ ...thirtySix, yawning: 2 }).band, 'severe');
  const maximum = Object.fromEntries(COWS_ITEMS.map(({ key, options }) => [key, options.at(-1).value]));
  assert.deepEqual([scoreCows(maximum).score, scoreCows(maximum).maximum], [48, 48]);
  assert.equal(scoreCows({ ...base, restlessness: 2 }).complete, false, 'COWS restlessness has no two-point option');
});

test('CIWA-Ar has ten domains, a 67-point maximum, and ASAM 10/19 symptom thresholds', () => {
  const base = zeros(CIWA_ITEMS);
  assert.equal(CIWA_ITEMS.length, 10);
  assert.equal(scoreCiwaAr(base).band, 'mild');
  assert.equal(scoreCiwaAr({ ...base, nausea: 7, tremor: 2 }).band, 'mild');
  assert.equal(scoreCiwaAr({ ...base, nausea: 7, tremor: 3 }).band, 'moderate');
  assert.equal(scoreCiwaAr({ ...base, nausea: 7, tremor: 7, sweating: 4 }).band, 'moderate');
  assert.equal(scoreCiwaAr({ ...base, nausea: 7, tremor: 7, sweating: 5 }).band, 'severe');
  const maximum = Object.fromEntries(CIWA_ITEMS.map(({ key, options }) => [key, options.at(-1).value]));
  assert.equal(scoreCiwaAr(maximum).score, 67);
  assert.equal(scoreCiwaAr({ ...base, orientation: 5 }).complete, false);
});

test('missing or invalid answers never imply a completed low-risk result', () => {
  for (const invalid of [undefined, '', ' ', NaN, Infinity, -1, true, {}, '<script>']) {
    assert.equal(scoreCows({ ...zeros(COWS_ITEMS), pulse: invalid }).band, 'incomplete');
    assert.equal(scoreCiwaAr({ ...zeros(CIWA_ITEMS), nausea: invalid }).band, 'incomplete');
  }
  assert.equal(scoreCows().complete, false);
  assert.equal(scoreCiwaAr().complete, false);
});

test('life-threatening flags intercept before completion and no score excludes seizure risk', () => {
  assert.equal(scoreCiwaAr({}, { seizureNow: true }).emergency, true);
  assert.equal(scoreCiwaAr({}, { confusionNow: true }).emergency, true);
  assert.equal(scoreCiwaAr({}, { breathingProblem: true }).emergency, true);
  assert.equal(scoreCiwaAr({ orientation: 2 }).emergency, true);
  assert.equal(scoreCiwaAr({ visual: 5 }).emergency, true);
  assert.equal(scoreCiwaAr(zeros(CIWA_ITEMS), { priorSeizureOrDT: true }).urgent, true);
  assert.equal(scoreCiwaAr(zeros(CIWA_ITEMS), { dailySedativeUse: true }).urgent, true);
  assert.equal(scoreCiwaAr(zeros(CIWA_ITEMS)).seizureRiskExcluded, false);
});

test('clinical score controls and detached form values clear synchronously through global Quick Exit', () => {
  const restore = installMockDom();
  useDictionary('en', {});
  resetClinicalScoresState();
  let view;
  try {
    view = clinicalScoresView();
    const pulse = view.querySelector('#cows-pulse');
    pulse.value = '4';
    pulse.dispatchEvent({ type: 'change', target: pulse });
    assert.equal(getClinicalScoresState().cows.pulse, 4);
    const risks = view.querySelectorAll('input');
    risks[0].checked = true;
    risks[0].dispatchEvent({ type: 'change', target: risks[0] });
    assert.match(view.textContent, /Call 911 now/);
    executeGlobalQuickExit();
    assert.deepEqual(getClinicalScoresState(), { cows: {}, ciwa: {}, risks: {} });
    assert.equal(pulse.value, '');
    assert.equal(risks[0].checked, false);
    assert.doesNotMatch(view.textContent, /Call 911 now/);
    for (const link of view.querySelectorAll('a')) assert.doesNotMatch(link.getAttribute('href'), /^#\/treatment\?/);
  } finally { view?._cleanup(); restore(); }
});

test('clinical score form renders Spanish labels and emergency guidance', () => {
  const restore = installMockDom();
  useDictionary('es', {});
  let view;
  try {
    view = clinicalScoresView();
    assert.match(view.textContent, /Autoevaluaciones de abstinencia/);
    assert.match(view.textContent, /convulsiones/);
    assert.match(view.textContent, /Elija una respuesta/);
    assert.doesNotMatch(view.textContent, /Choose a response|Emergency care rights/);
  } finally { view?._cleanup(); useDictionary('en', {}); restore(); }
});
