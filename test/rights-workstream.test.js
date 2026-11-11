import test from 'node:test';
import assert from 'node:assert/strict';
import { installMockDom } from './fixtures/mockDomHelper.js';
import { useDictionary } from '../public/js/i18n.js';
import { planView, getPlanState, setPlanState, resetPlanState, formatSafetyPlanText } from '../public/js/views/plan.js';
import { rightsAndSafetyGuide, resetSafetyPlanState } from '../public/js/views/rightsAndSafetyPlan.js';
import { executeGlobalQuickExit } from '../public/js/quickExitRegistry.js';
import { evaluateFacilityCoverage, buildVerificationScript, setInsuranceState, getInsuranceState } from '../public/js/views/insuranceHelpers.js';
import { insuranceSelectorWidget } from '../public/js/views/insuranceWidget.js';
import { getNavigatorHandoffState, resetNavigatorState } from '../public/js/views/navigatorHandoff.js';

function installDom() {
  const restore = installMockDom();
  const prototype = Object.getPrototypeOf(document.createElement('div'));
  const appendChild = prototype.appendChild;
  prototype.appendChild = function (child) {
    if (child && typeof child.remove !== 'function') child.remove = function () {
      const siblings = this.parentNode?.children;
      const index = siblings?.indexOf(this) ?? -1;
      if (index >= 0) siblings.splice(index, 1);
    };
    return appendChild.call(this, child);
  };
  return restore;
}

test('safety goals ignore URL input; therapy and return-to-use selections reset in RAM and mounted DOM', () => {
  const restore = installDom();
  let view;
  try {
    resetPlanState();
    view = planView({ query: new URLSearchParams('goal=private+URL+goal') });
    assert.equal(getPlanState().goal, '');
    assert.doesNotMatch(view.textContent, /private URL goal/);
    const therapy = view.querySelectorAll('button').find((button) => button.textContent.includes('CBT: practical'));
    therapy.click();
    assert.equal(getPlanState().preferredTherapies, 'CBT');
    assert.equal(therapy.getAttribute('aria-pressed'), 'true');
    const action = view.querySelector('#plan-return-to-use');
    action.value = 'Call my trusted peer and reconnect with my clinic';
    action.dispatchEvent({ type: 'input', target: action });
    setPlanState({ goal: 'Private goal in RAM', naloxoneLocation: 'Private location in RAM' });
    const text = formatSafetyPlanText();
    assert.match(text, /Call my trusted peer/);
    assert.match(text, /CBT/);
    const need = view.querySelector('#script-need');
    need.value = 'pregnant';
    need.dispatchEvent({ type: 'change', target: need });
    assert.match(view.querySelector('.intake-script-output').textContent, /priority admission/);
    executeGlobalQuickExit();
    assert.equal(getPlanState().preferredTherapies, '');
    assert.equal(getPlanState().returnToUseAction, '');
    assert.equal(action.value, '');
    assert.equal(therapy.getAttribute('aria-pressed'), 'false');
    assert.equal(need.value, 'moud_bup');
    assert.equal(view.querySelector('.intake-script-output').textContent, '');
    assert.doesNotMatch(view.textContent, /Private goal in RAM|Private location in RAM/);
    assert.doesNotThrow(resetSafetyPlanState);
  } finally { view?._cleanup(); restore(); }
});

test('counseling program selections use a RAM handoff with no clinical URL query', () => {
  const restore = installDom();
  let view;
  try {
    resetNavigatorState();
    view = planView();
    const link = view.querySelectorAll('a').find((item) => item.textContent.includes('Find CBT programs'));
    assert.equal(link.getAttribute('href'), '#/treatment');
    link.click();
    assert.deepEqual(getNavigatorHandoffState().codes, ['CBT']);
    assert.ok(view.querySelectorAll('a').every((item) => !String(item.getAttribute('href')).startsWith('#/treatment?')));
  } finally { view?._cleanup(); resetNavigatorState(); restore(); }
});

test('rights guide and exported safety plan support Spanish with qualified CAPTA and Part 2 protections', () => {
  const restore = installDom();
  try {
    useDictionary('en', {});
    assert.match(rightsAndSafetyGuide().textContent, /State reporting, investigation and child-welfare rules vary/);
    assert.match(rightsAndSafetyGuide().textContent, /qualifying federally assisted SUD programs/);
    useDictionary('es', {});
    const guide = rightsAndSafetyGuide();
    assert.match(guide.textContent, /Protecciones laborales, familiares y legales/);
    assert.match(guide.textContent, /no garantiza inmunidad/);
    assert.match(guide.textContent, /nivel I–IV/);
    setPlanState({ returnToUseAction: 'Llamar a una persona de confianza', preferredTherapies: 'CBT, CRAFT' });
    const printed = formatSafetyPlanText();
    assert.match(printed, /PLAN PERSONAL DE SEGURIDAD/);
    assert.match(printed, /Llamar a una persona de confianza/);
    assert.match(printed, /ENFOQUES TERAPÉUTICOS/);
    assert.doesNotMatch(guide.textContent, /workplace conduct rules|Clinical session notes/);
  } finally { useDictionary('en', {}); resetPlanState(); restore(); }
});

test('insurance emergency classification is separate from medication entitlement and links public Medicaid data', () => {
  const restore = installDom();
  let widget;
  try {
    const er = evaluateFacilityCoverage({ providerType: 'ER' }, 'uninsured', { emergency: true });
    assert.equal(er.tier, 'EMTALA_PROTECTED');
    assert.match(er.explanation, /does not guarantee a specific medication/);
    assert.notEqual(evaluateFacilityCoverage({ codes: ['DT', 'HI'] }, 'uninsured', { emergency: true }).tier, 'EMTALA_PROTECTED');
    const script = buildVerificationScript('private');
    assert.match(script.emergencyRights, /dispense, not prescribe/);
    assert.match(script.emergencyRights, /cannot be renewed or extended/);
    assert.match(script.parityRights.join(' '), /timelines depend on the plan/);
    widget = insuranceSelectorWidget();
    assert.ok(widget.querySelectorAll('a').some((link) => link.getAttribute('href') === '/data/state-medicaid.json'));
    setInsuranceState({ selectedCoverage: 'private', emergencyFlag: true });
    executeGlobalQuickExit();
    assert.equal(getInsuranceState().selectedCoverage, 'any');
    assert.equal(getInsuranceState().emergencyFlag, false);
  } finally { widget?._cleanupInsuranceWidget(); restore(); }
});
