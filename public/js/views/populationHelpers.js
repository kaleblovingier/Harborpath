/**
 * Population-specific helpers for HarborPath Clinical Care Navigator.
 * Pure functions that return recommended SAMHSA service codes and
 * pre-built treatment search links. All client-side; no PHI transmitted.
 * Supports expanding usefulness to more individuals (pregnancy, youth,
 * justice-involved, older adults, stimulants, xylazine, co-occurring MH).
 */

export function recommendForPregnancy() {
  return {
    codes: ['PW', 'HI', 'DT', 'MD', 'SS'],
    searchHref: '#/treatment?codes=PW,HI,DT,MD,SS',
    guidance: 'Pregnancy/postpartum: Prioritize specialty programs (PW), hospital inpatient if needed (HI), withdrawal management (DT), and Medicaid/sliding scale. Follow ACOG standards.',
  };
}

export function recommendForYouth() {
  return {
    codes: ['ADOL', 'YA', 'IOP', 'RES', 'TELE'],
    searchHref: '#/treatment?codes=ADOL,YA,IOP,RES,TELE',
    guidance: 'Adolescents/young adults: Age-specific residential, IOP, or telehealth options. Confirm consent and family involvement policies.',
  };
}

export function recommendForJusticeInvolved() {
  return {
    codes: ['CJ', 'OTP', 'BU', 'OP', 'NOE'],
    searchHref: '#/treatment?codes=CJ,OTP,BU,OP,NOE',
    guidance: 'Justice-involved/reentry: High overdose risk post-release. Prioritize MOUD (OTP/BU), outpatient, and naloxone education (NOE).',
  };
}

export function recommendForOlderAdults() {
  return {
    codes: ['SEN', 'OP', 'MD', 'MHSU'],
    searchHref: '#/treatment?codes=SEN,OP,MD,MHSU',
    guidance: 'Older adults: Medical comorbidity-aware outpatient care, Medicare/Medicaid, and co-occurring mental health support.',
  };
}

export function recommendForStimulants() {
  return {
    codes: ['CMI', 'OP', 'TELE', 'MHSU'],
    searchHref: '#/treatment?codes=CMI,OP,TELE,MHSU',
    guidance: 'Stimulant use: Contingency management (CMI), outpatient, and telehealth. No agonist medication currently approved.',
  };
}

export function recommendForXylazine() {
  return {
    codes: ['BU', 'OTP', 'DT', 'NOE'],
    searchHref: '#/treatment?codes=BU,OTP,DT,NOE',
    guidance: 'Xylazine/medetomidine: Address alpha-2 rebound with clonidine/tizanidine alongside MOUD. Include naloxone and wound care education.',
  };
}

export function recommendForCoOccurring() {
  return {
    codes: ['MHSU', 'TRMA', 'IOP', 'OP'],
    searchHref: '#/treatment?codes=MHSU,TRMA,IOP,OP',
    guidance: 'Co-occurring serious mental illness: Integrated dual-diagnosis programs, trauma-informed care, and appropriate level of intensity.',
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
