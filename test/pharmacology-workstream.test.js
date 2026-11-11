import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDrugInteractions, getRegimenAgentLabel, INTERACTIONS } from '../public/js/views/pharmacologyEngine.js';
import { medicationsView, getMedicationsState, resetPharmacologyState } from '../public/js/views/medications.js';
import { executeGlobalQuickExit } from '../public/js/quickExitRegistry.js';
import { installMockDom } from './fixtures/mockDomHelper.js';

test('sedative combinations without opioids flag respiratory and withdrawal danger', () => {
  for (const pair of [['alcohol', 'xanax'], ['gabapentin', 'alcohol'], ['xylazine', 'valium']]) {
    const result = evaluateDrugInteractions(pair);
    assert.equal(result.riskLevel, 'high');
    assert.ok(result.alerts.some((a) => a.id === 'non-opioid-depressant-combination'));
    assert.ok(result.actionSteps.some((s) => /911/.test(s)));
    assert.equal(result.validatedRiskScore, false);
  }
});

test('benzodiazepine co-use preserves MOUD and naltrexone warnings', () => {
  for (const moud of ['buprenorphine', 'methadone']) {
    const result = evaluateDrugInteractions([moud, 'benzodiazepines']);
    assert.ok(result.actionSteps.some((s) => /do not withhold/i.test(s)));
  }
  assert.match(INTERACTIONS.find((a) => a.id === 'opioids-alcohol').action, /Naltrexone must NOT/);
  assert.match(INTERACTIONS.find((a) => a.id === 'naltrexone-opioids').action, /cannot guarantee safety/);
});

test('Spanish evaluation retains identical safety rules and localizes clinical output', () => {
  const selected = ['Vivitrol', 'methadone', 'alcohol', 'gabapentin'];
  const en = evaluateDrugInteractions(selected);
  const es = evaluateDrugInteractions(selected, { lang: 'es' });
  assert.equal(es.riskLevel, en.riskLevel);
  assert.deepEqual(es.alerts.map((a) => a.id), en.alerts.map((a) => a.id));
  assert.match(es.actionSteps.join(' '), /911/);
  assert.match(es.matchedInteractions.find((a) => a.id === 'naltrexone-opioids').action, /Ningún calendario/);
  assert.equal(getRegimenAgentLabel('methadone', 'es'), 'Metadona');
});

test('interaction chips update only RAM and Quick Exit clears mounted selections', () => {
  const restore = installMockDom();
  try {
    const root = medicationsView();
    const buttons = root.querySelectorAll('button');
    const choose = (id) => buttons.find((b) => b.dataset.agentId === id).click();
    choose('alcohol');
    choose('benzos_sedatives');
    assert.deepEqual(getMedicationsState().selectedRegimen, ['alcohol', 'benzos_sedatives']);
    assert.match(root.querySelector('#regimen-safety-output').textContent, /Combined Sedatives/);
    executeGlobalQuickExit();
    assert.deepEqual(getMedicationsState().selectedRegimen, []);
    for (const button of buttons.filter((b) => b.dataset.agentId)) assert.equal(button.getAttribute('aria-pressed'), 'false');
    assert.doesNotMatch(root.querySelector('#regimen-safety-output').textContent, /Combined Sedatives/);
    resetPharmacologyState();
  } finally { restore(); }
});
