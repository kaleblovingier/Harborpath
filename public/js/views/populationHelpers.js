/**
 * Population helpers for the Care Navigator.
 * Thin wrappers around evaluatePregnancyCare / evaluateYouthCare /
 * evaluateReentryCare / evaluateXylazineCare in navigator.js.
 * Each search link uses at most 2 SAMHSA codes (FindTreatment ANDs them).
 * No doses, no DOM, no network, no storage.
 */
import {
  evaluatePregnancyCare,
  evaluateYouthCare,
  evaluateReentryCare,
  evaluateXylazineCare,
} from './navigator.js';

function linksFrom(result) {
  return {
    codes: result.recommendedCodes,
    searchHref: result.searchHref,
    searchLinks: result.searchLinks,
    guidance: result.headline,
    urgency: result.urgency,
    emergency: result.emergency,
    emergencyStep: result.emergencyStep,
    actionSteps: result.actionSteps,
  };
}

/** @param {Parameters<typeof evaluatePregnancyCare>[0]} [input] */
export function recommendForPregnancy(input = { stage: 'pregnant', substances: ['opioids'] }) {
  return linksFrom(evaluatePregnancyCare(input));
}

/** @param {Parameters<typeof evaluateYouthCare>[0]} [input] */
export function recommendForYouth(input = { age: 16, substances: ['opioids'] }) {
  return linksFrom(evaluateYouthCare(input));
}

/** @param {Parameters<typeof evaluateReentryCare>[0]} [input] */
export function recommendForJusticeInvolved(input = {}) {
  return linksFrom(evaluateReentryCare(input));
}

/**
 * Older adults (SEN). Prefer outpatient + co-occurring care.
 * Medicare/Medicaid are payment filters, not SAMHSA service codes here.
 */
export function recommendForOlderAdults() {
  return {
    codes: ['SEN', 'MHSU'],
    searchHref: '#/treatment?codes=SEN,MHSU',
    searchLinks: [
      { label: 'Programs for older adults with mental health support', codes: ['SEN', 'MHSU'], href: '#/treatment?codes=SEN,MHSU' },
      { label: 'Outpatient care for older adults', codes: ['SEN', 'OP'], href: '#/treatment?codes=SEN,OP' },
    ],
    guidance:
      'Older adults: ask about other health conditions, falls, and how new medicine fits with what you already take. Bring a full medicine list to the first visit.',
  };
}

/** Stimulant use: contingency management has the strongest evidence. No FDA-approved agonist yet. */
export function recommendForStimulants() {
  return {
    codes: ['CMI'],
    searchHref: '#/treatment?codes=CMI',
    searchLinks: [
      { label: 'Contingency management', codes: ['CMI'], href: '#/treatment?codes=CMI' },
      { label: 'Outpatient care', codes: ['OP'], href: '#/treatment?codes=OP' },
    ],
    guidance:
      'For meth or cocaine, contingency management (small rewards for negative tests) has the strongest evidence. There’s no FDA-approved medicine yet. Ask about same-day outpatient starts.',
  };
}

/** @param {Parameters<typeof evaluateXylazineCare>[0]} [input] */
export function recommendForXylazine(input = { inSupply: 'maybe' }) {
  return linksFrom(evaluateXylazineCare(input));
}

/** Co-occurring mental health and substance use. */
export function recommendForCoOccurring() {
  return {
    codes: ['MHSU'],
    searchHref: '#/treatment?codes=MHSU',
    searchLinks: [
      { label: 'Programs for substance use and mental health together', codes: ['MHSU'], href: '#/treatment?codes=MHSU' },
      { label: 'Trauma-informed care', codes: ['TRMA'], href: '#/treatment?codes=TRMA' },
    ],
    guidance:
      'Programs that treat mental health and substance use together work better than treating only one. Ask if they keep your mental health medicine going while you start substance use care.',
  };
}

export const ALL_POPULATION_RECOMMENDERS = {
  pregnancy: recommendForPregnancy,
  youth: recommendForYouth,
  justice: recommendForJusticeInvolved,
  older: recommendForOlderAdults,
  stimulants: recommendForStimulants,
  xylazine: recommendForXylazine,
  coOccurring: recommendForCoOccurring,
};
