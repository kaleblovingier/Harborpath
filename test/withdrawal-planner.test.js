import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BERNESE_REFERENCE, getWithdrawalPlannerState, setWithdrawalPlannerState, resetWithdrawalPlannerState, withdrawalPlannerView } from '../public/js/views/withdrawalPlanner.js';
import { getNavigatorHandoffState, normalizeNavigatorCodes, resetNavigatorState } from '../public/js/views/navigatorHandoff.js';
import { executeGlobalQuickExit } from '../public/js/quickExitRegistry.js';
import { formatAsamHandoffText } from '../public/js/views/navigator.js';
import { useDictionary } from '../public/js/i18n.js';
import { installMockDom } from './fixtures/mockDomHelper.js';

test('six-day reference preserves published per-dose frequencies and totals', () => {
  assert.deepEqual(BERNESE_REFERENCE.map(({ day, doseMg, dosesPerDay, dailyMg }) => [day, doseMg, dosesPerDay, dailyMg]), [
    [1, 0.5, 1, 0.5], [2, 0.5, 2, 1], [3, 1, 2, 2], [4, 2, 2, 4], [5, 4, 2, 8], [6, 8, 2, 16],
  ]);
  assert.equal(Object.isFrozen(BERNESE_REFERENCE), true);
});

test('planner state bounds days, rejects invalid flags and returns defensive snapshots', () => {
  resetWithdrawalPlannerState();
  setWithdrawalPlannerState({ day: 6, pregnancy: true });
  setWithdrawalPlannerState({ day: 7, pregnancy: 'false', unknown: 'secret' });
  assert.equal(getWithdrawalPlannerState().day, 6);
  assert.equal(getWithdrawalPlannerState().pregnancy, true);
  assert.equal(getWithdrawalPlannerState().unknown, undefined);
  const snapshot = getWithdrawalPlannerState();
  snapshot.day = 2;
  assert.equal(getWithdrawalPlannerState().day, 6);
  resetWithdrawalPlannerState();
});

test('pregnancy reference warning, RAM handoff and global exit clear selected days and inputs', () => {
  const restore = installMockDom();
  useDictionary('en', {});
  resetWithdrawalPlannerState();
  resetNavigatorState();
  let view;
  try {
    view = withdrawalPlannerView();
    const day = view.querySelector('#berne-day');
    day.value = '6';
    day.dispatchEvent({ type: 'change', target: day });
    const pregnancy = view.querySelector('input');
    pregnancy.checked = true;
    pregnancy.dispatchEvent({ type: 'change', target: pregnancy });
    assert.match(view.querySelector('.withdrawal-planner-summary').textContent, /not a pregnancy protocol/);
    const finder = view.querySelector('[data-navigator-handoff]');
    assert.equal(finder.getAttribute('href'), '#/treatment');
    finder.click();
    assert.deepEqual(getNavigatorHandoffState().codes, ['PW', 'BU', 'OTP']);
    executeGlobalQuickExit();
    assert.equal(getWithdrawalPlannerState().day, 1);
    assert.equal(day.value, '1');
    assert.equal(pregnancy.checked, false);
    assert.equal(getNavigatorHandoffState(), null);
    assert.match(view.textContent, /not prescribe|not a guarantee/);
  } finally { view?._cleanup(); restore(); }
});

test('Spanish planner and copied ASAM summary have no clinical query links', () => {
  const restore = installMockDom();
  useDictionary('es', {});
  let view;
  try {
    view = withdrawalPlannerView();
    assert.match(view.textContent, /Referencia de abstinencia/);
    assert.match(view.textContent, /regla DEA de 72 horas/);
    assert.match(view.textContent, /No es consejo médico ni receta/);
    assert.doesNotMatch(view.textContent, /Your discussion checklist|Clear selections/);
    for (const link of view.querySelectorAll('a')) assert.doesNotMatch(link.getAttribute('href'), /^#\/treatment\?/);
  } finally { view?._cleanup(); useDictionary('en', {}); restore(); }
  assert.doesNotMatch(formatAsamHandoffText({ biomedical: 'pregnant', substances: ['opioids'] }), /#\/treatment\?/);
  assert.deepEqual(normalizeNavigatorCodes(['PW', 'BUP', 'METH', 'YAD', 'CJ']), ['PW', 'BU', 'OTP', 'YA', 'CJ']);
});
