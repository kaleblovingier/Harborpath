import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  recommendForPregnancy,
  recommendForYouth,
  recommendForJusticeInvolved,
  recommendForXylazine,
  recommendForStimulants,
  recommendForOlderAdults,
  recommendForCoOccurring,
} from '../public/js/views/populationHelpers.js';
import { SEARCH_SYNONYMS, PAYMENT_LABELS } from '../public/js/clinical/searchSynonyms.js';
import { readFileSync } from 'node:fs';

const codesSrc = readFileSync(new URL('../public/js/codes.js', import.meta.url), 'utf8');
const VALID = new Set([...codesSrc.matchAll(/code: '([A-Z_]+)'/g)].map((m) => m[1]));

test('helpers use at most 2 codes per link and no doses', () => {
  for (const f of [
    recommendForPregnancy,
    recommendForYouth,
    recommendForJusticeInvolved,
    recommendForXylazine,
    recommendForStimulants,
    recommendForOlderAdults,
    recommendForCoOccurring,
  ]) {
    const r = f();
    for (const l of r.searchLinks) {
      assert.ok(l.codes.length <= 2, l.href);
      for (const c of l.codes) assert.ok(VALID.has(c), c);
    }
    assert.doesNotMatch(JSON.stringify(r), /\d+\s?mg\b|clonidine|tizanidine/i);
  }
});

test('pregnancy helper prefers PW+BU, not a multi-code AND link', () => {
  const r = recommendForPregnancy({ stage: 'pregnant', substances: ['opioids'] });
  assert.equal(r.searchHref, '#/treatment?codes=PW,BU');
});

test('synonyms map brands and Spanish terms to filter keys', () => {
  assert.equal(SEARCH_SYNONYMS.suboxone, 'bup');
  assert.equal(SEARCH_SYNONYMS.vivitrol, 'naltrexoneXR');
  assert.equal(SEARCH_SYNONYMS.embarazada, 'pregnantPostpartum');
  assert.equal(SEARCH_SYNONYMS.adolescente, 'youth');
  assert.equal(SEARCH_SYNONYMS.metadona, 'methadone');
  assert.equal(SEARCH_SYNONYMS['escala variable'], 'pay.sliding');
  assert.ok(PAYMENT_LABELS['pay.medicaid'].en);
});
