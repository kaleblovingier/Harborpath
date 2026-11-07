// Regression tests for clinical-safety fixes (security review findings 2–5).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateAsamCare, formatAsamHandoffText } from '../public/js/views/navigator.js';
import es from '../public/js/locales/es.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const DISCLAIMER = 'This is not a diagnosis or a clinical assessment. A licensed clinician will assess you.';

describe('Finding 2: navigator output is self-report, not a clinical document', () => {
  const answers = {
    substances: ['opioids'],
    withdrawalRisk: 'moderate',
    mentalHealth: 'mild_moderate',
    environment: 'unstable',
  };
  const text = formatAsamHandoffText(answers, evaluateAsamCare(answers));

  it('the copied text carries the not-a-diagnosis disclaimer near the top', () => {
    assert.ok(text.includes(DISCLAIMER));
    assert.ok(text.indexOf(DISCLAIMER) < text.indexOf('SUGGESTED STARTING POINT'));
    assert.match(text, /SELF-REPORTED ANSWERS/);
    assert.match(text, /not an official ASAM tool/);
  });

  it('the copied text no longer reads like a clinician-authored note', () => {
    for (const phrase of [
      /PHYSICIAN/i,
      /CLINICAL CARE SUMMARY/i,
      /PROVIDER HANDOFF/i,
      /RECOMMENDED LEVEL OF CARE/i,
      /Clinical Rationale/i,
      /4TH EDITION/i,
    ]) {
      assert.doesNotMatch(text, phrase);
    }
  });

  it('the on-screen result renders the same disclaimer and drops "physician" labels', () => {
    const src = read('public/js/views/navigator.js');
    const disclaimerCalls = src.match(/t\('nav\.disclaimer', '([^']+)'\)/g) ?? [];
    assert.ok(disclaimerCalls.length >= 2, 'disclaimer is used on screen and in the copied text');
    assert.ok(disclaimerCalls.every((c) => c.includes(DISCLAIMER)));
    assert.doesNotMatch(src, /Physician notes|PHYSICIAN CLINICAL NOTES|Clinical handoff note/);
    assert.ok(es['nav.disclaimer'], 'Spanish disclaimer exists');
  });
});

describe('Finding 3: no unsourced effect-size percentages in the navigator', () => {
  it('has no percentage claims other than the "100%" privacy wording', () => {
    const src = read('public/js/views/navigator.js');
    const pct = (src.match(/\d+(?:\s*[–-]\s*\d+)?\s*%/g) ?? []).filter((m) => m !== '100%');
    assert.deepEqual(pct, []);
  });
});

describe('Finding 4: micro-induction table is introduced by a prescriber-only warning', () => {
  it('places a callout-warn above the dosing table', () => {
    const src = read('public/js/views/medications.js');
    const warn = src.indexOf("t('meds.bernese.warn.title'");
    const table = src.indexOf('BERNESE_EXAMPLE_SCHEDULE.map');
    assert.ok(warn > 0 && table > 0 && warn < table, 'warning must come before the table');
    assert.match(src.slice(src.lastIndexOf('callout callout-warn', warn), warn), /callout callout-warn/);
    assert.ok(src.lastIndexOf('callout callout-warn', warn) > src.lastIndexOf("h('div', { class: 'table-wrap' }", warn));
    assert.ok(es['meds.bernese.warn.title'] && es['meds.bernese.warn.body']);
  });
});

describe('Finding 5: self-harm answers put crisis support first', () => {
  it('flags crisis only for the self-harm / feeling-unsafe answer', () => {
    assert.equal(evaluateAsamCare({ mentalHealth: 'severe_crisis' }).crisis, true);
    for (const mentalHealth of ['none', 'mild_moderate', 'trauma', undefined]) {
      assert.equal(evaluateAsamCare({ mentalHealth }).crisis, false, String(mentalHealth));
    }
  });

  it('the copied text leads with 988 and 911 before the suggested starting point', () => {
    const answers = { mentalHealth: 'severe_crisis', substances: ['opioids'] };
    const text = formatAsamHandoffText(answers, evaluateAsamCare(answers));
    const crisis = text.indexOf('SAFETY FIRST');
    assert.ok(crisis > 0);
    assert.ok(crisis < text.indexOf('SUGGESTED STARTING POINT'));
    assert.match(text.slice(crisis, text.indexOf('\n', crisis)), /988.*911/);

    const calm = formatAsamHandoffText({ mentalHealth: 'none' });
    assert.ok(!calm.includes('SAFETY FIRST'));
  });

  it('the view renders the crisis card before the level-of-care heading', () => {
    const src = read('public/js/views/navigator.js');
    const card = src.indexOf('if (crisisCard) recommendationContainer.append(crisisCard);');
    const heading = src.indexOf("h('h3', { id: 'recommendation-heading' }");
    assert.ok(card > 0 && heading > card);
    assert.ok(es['nav.crisis.title'] && es['nav.crisis.body']);
  });
});
