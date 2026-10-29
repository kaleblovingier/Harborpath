import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePregnancyCare,
  evaluateYouthCare,
  evaluateReentryCare,
  evaluateXylazineCare,
} from '../public/js/views/navigator.js';
import { readFileSync } from 'node:fs';

const codesSrc = readFileSync(new URL('../public/js/codes.js', import.meta.url), 'utf8');
const VALID = new Set([...codesSrc.matchAll(/code: '([A-Z_]+)'/g)].map((m) => m[1]));

const fns = [
  () => evaluatePregnancyCare({ stage: 'pregnant', substances: ['opioids', 'alcohol', 'stimulants', 'nicotine'] }),
  () => evaluatePregnancyCare({ stage: 'postpartum', monthsPostpartum: 8, substances: ['opioids'] }),
  () => evaluateYouthCare({ age: 15, substances: ['opioids', 'stimulants', 'nicotine'] }),
  () => evaluateYouthCare({ age: 22, substances: ['opioids'] }),
  () => evaluateReentryCare({ status: 'pre_release', needsHousing: true }),
  () => evaluateXylazineCare({ wound: { present: true }, severeWithdrawal: true }),
];

test('all population routes return valid codes and at most 2 codes per link', () => {
  for (const f of fns) {
    const r = f();
    assert.ok(r.searchHref.startsWith('#/treatment'));
    assert.equal(r.searchHref, r.searchLinks[0].href);
    for (const l of r.searchLinks) {
      assert.ok(l.codes.length <= 2, l.href);
      for (const c of l.codes) assert.ok(VALID.has(c), `unknown code ${c}`);
    }
    const text = r.actionSteps.join(' ');
    assert.doesNotMatch(text, /\d+\s?mg\b/i, 'no doses');
  }
});

test('pregnancy: opioids route to PW+BU, never detox advice', () => {
  const r = evaluatePregnancyCare({ stage: 'pregnant', substances: ['opioids'] });
  assert.equal(r.searchHref, '#/treatment?codes=PW,BU');
  assert.ok(r.recommendedCodes.includes('OTP'));
  assert.match(r.actionSteps.join(' '), /Detox or stopping suddenly raises the risk/);
  assert.equal(r.urgency, 'same_day');
});

test('pregnancy: bleeding sends to labor and delivery; seizure is 911', () => {
  assert.equal(evaluatePregnancyCare({ stage: 'pregnant', warningSigns: { bleeding: true } }).emergency, 'labor_and_delivery_now');
  assert.equal(evaluatePregnancyCare({ warningSigns: { seizure: true } }).urgency, 'call911');
  assert.equal(evaluatePregnancyCare({ warningSigns: { suicidal: true } }).urgency, 'call988');
});

test('pregnancy: alcohol withdrawal is same day with DT/HI', () => {
  const r = evaluatePregnancyCare({ stage: 'pregnant', substances: ['alcohol'] });
  assert.equal(r.urgency, 'same_day');
  assert.ok(r.recommendedCodes.includes('DT') && r.recommendedCodes.includes('HI'));
});

test('youth: age bands map to ADOL / YAD / CH_AD, teens get call-to-ask', () => {
  const teen = evaluateYouthCare({ age: 15, substances: ['opioids'] });
  assert.equal(teen.searchHref, '#/treatment?codes=ADOL,BU');
  assert.match(teen.actionSteps.join(' '), /Call to ask/);
  assert.match(teen.actionSteps.join(' '), /differ by state/);
  assert.doesNotMatch(teen.actionSteps.join(' '), /age (of )?consent is \d+/i);
  assert.equal(evaluateYouthCare({ age: 22, substances: ['opioids'] }).searchHref, '#/treatment?codes=YAD,BU');
  assert.equal(evaluateYouthCare({ age: 10 }).searchHref, '#/treatment?codes=CH_AD');
  assert.equal(evaluateYouthCare({ age: 16, suicidal: true }).urgency, 'call988');
});

test('reentry: first week off medicine is same day; CJ+BU first; naloxone link when missing', () => {
  const r = evaluateReentryCare({ daysSinceRelease: 'under_7', medication: 'none' });
  assert.equal(r.urgency, 'same_day');
  assert.equal(r.searchHref, '#/treatment?codes=CJ,BU');
  assert.ok(r.recommendedCodes.includes('NOE'));
  assert.ok(!evaluateReentryCare({ hasNaloxone: true }).recommendedCodes.includes('NOE'));
  assert.match(r.actionSteps.join(' '), /ADA/);
});

test('xylazine: hard to wake is 911 with naloxone; bad wounds same day', () => {
  const r = evaluateXylazineCare({ veryHardToWake: true });
  assert.equal(r.urgency, 'call911');
  assert.match(r.actionSteps.join(' '), /naloxone still matters/);
  assert.match(r.actionSteps.join(' '), /doesn’t reverse tranq/);
  assert.equal(evaluateXylazineCare({ wound: { blackOrDeadTissue: true } }).urgency, 'same_day');
  assert.equal(evaluateXylazineCare({ severeWithdrawal: true }).searchHref, '#/treatment?codes=HI');
});

test('population routes are pure: same input, same output, input untouched', () => {
  const input = { stage: 'pregnant', substances: ['opioids'], warningSigns: {} };
  const copy = JSON.stringify(input);
  assert.deepEqual(evaluatePregnancyCare(input), evaluatePregnancyCare(input));
  assert.equal(JSON.stringify(input), copy);
});

test('emergency step is explicit and always first', () => {
  const cases = [
    evaluatePregnancyCare({ stage: 'pregnant', substances: ['opioids'], warningSigns: { bleeding: true, suicidal: true } }),
    evaluatePregnancyCare({ warningSigns: { suicidal: true } }),
    evaluateYouthCare({ age: 15, suicidal: true, substances: ['opioids'] }),
    evaluateXylazineCare({ veryHardToWake: true, wound: { blackOrDeadTissue: true } }),
    evaluateXylazineCare({ severeWithdrawal: true }),
  ];
  for (const r of cases) {
    assert.ok(r.emergency);
    assert.equal(r.emergencyStep, r.actionSteps[0]);
  }
  assert.equal(cases[0].emergency, 'labor_and_delivery_now');
  assert.match(cases[1].emergencyStep, /988/);
  assert.equal(evaluateReentryCare({}).emergencyStep, null);
});

