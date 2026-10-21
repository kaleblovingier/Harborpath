import { t } from './i18n.js';

// Plain-language labels for SAMHSA FindTreatment.gov service codes.
// Filters are combined with AND by the upstream API, so each option narrows
// the results. Labels are getters so they follow the active language.

export const TREATMENT_FILTERS = [
  {
    id: 'meds',
    get label() { return t('filters.group.meds', 'Medications'); },
    get hint() { return t('filters.group.meds.hint', 'FDA-approved medications are the most effective treatment for opioid use disorder.'); },
    options: [
      { code: 'BU', get label() { return t('filters.BU', 'Buprenorphine'); }, get detail() { return t('filters.BU.detail', 'Suboxone, Sublocade, others'); } },
      { code: 'MU', get label() { return t('filters.MU', 'Methadone'); } },
      { code: 'NU', get label() { return t('filters.NU', 'Naltrexone'); }, get detail() { return t('filters.NU.detail', 'Vivitrol, others'); } },
      { code: 'OTP', get label() { return t('filters.OTP', 'Opioid treatment program (OTP)'); }, get detail() { return t('filters.OTP.detail', 'Federally certified clinic'); } },
      { code: 'PMAT', get label() { return t('filters.PMAT', 'Alcohol use disorder medication'); }, get detail() { return t('filters.PMAT.detail', 'Prescribes on site'); } },
    ],
  },
  {
    id: 'care',
    get label() { return t('filters.group.care', 'Type of care'); },
    options: [
      { code: 'DT', get label() { return t('filters.DT', 'Detox / withdrawal management'); } },
      { code: 'OP', get label() { return t('filters.OP', 'Outpatient'); } },
      { code: 'IOP', get label() { return t('filters.IOP', 'Intensive outpatient'); } },
      { code: 'RES', get label() { return t('filters.RES', 'Residential'); } },
      { code: 'HI', get label() { return t('filters.HI', 'Hospital inpatient'); } },
      { code: 'TELE', get label() { return t('filters.TELE', 'Telehealth'); } },
      { code: 'HH', get label() { return t('filters.HH', 'Recovery housing / sober home'); } },
    ],
  },
  {
    id: 'pay',
    get label() { return t('filters.group.pay', 'Cost & insurance'); },
    options: [
      { code: 'MD', get label() { return t('filters.MD', 'Medicaid'); } },
      { code: 'MC', get label() { return t('filters.MC', 'Medicare'); } },
      { code: 'PI', get label() { return t('filters.PI', 'Private insurance'); } },
      { code: 'SS', get label() { return t('filters.SS', 'Sliding fee scale'); } },
      { code: 'PA', get label() { return t('filters.PA', 'Payment assistance'); } },
      { code: 'NP', get label() { return t('filters.NP', 'Free of charge'); }, get detail() { return t('filters.NP.detail', 'No payment accepted'); } },
      { code: 'ITU', get label() { return t('filters.ITU', 'IHS / Tribal / Urban Indian'); } },
      { code: 'TRICARE', get label() { return t('filters.TRICARE', 'TRICARE (military)'); } },
    ],
  },
  {
    id: 'people',
    get label() { return t('filters.group.people', 'Programs for'); },
    options: [
      { code: 'ADOL', get label() { return t('filters.ADOL', 'Teens'); } },
      { code: 'YA', get label() { return t('filters.YA', 'Young adults'); } },
      { code: 'PW', get label() { return t('filters.PW', 'Pregnant or postpartum people'); } },
      { code: 'WN', get label() { return t('filters.WN', 'Women'); } },
      { code: 'MN', get label() { return t('filters.MN', 'Men'); } },
      { code: 'SEN', get label() { return t('filters.SEN', 'Older adults'); } },
      { code: 'VET', get label() { return t('filters.VET', 'Veterans'); } },
      { code: 'MHSU', get label() { return t('filters.MHSU.sa', 'Co-occurring mental health conditions'); } },
      { code: 'CJ', get label() { return t('filters.CJ', 'People involved with the justice system'); } },
      { code: 'TRMA', get label() { return t('filters.TRMA', 'Trauma survivors'); } },
    ],
  },
  {
    id: 'lang',
    get label() { return t('filters.group.lang', 'Language'); },
    options: [
      { code: 'SP', get label() { return t('filters.SP', 'Spanish'); } },
      { code: 'ASL', get label() { return t('filters.ASL', 'Sign language (ASL)'); } },
      { code: 'NX', get label() { return t('filters.NX', 'American Indian / Alaska Native languages'); } },
    ],
  },
  {
    id: 'extra',
    get label() { return t('filters.group.extra', 'Also offers'); },
    options: [
      { code: 'NOE', get label() { return t('filters.NOE', 'Naloxone & overdose education'); } },
      { code: 'PEER', get label() { return t('filters.PEER', 'Peer support / mentoring'); } },
      { code: 'CMI', get label() { return t('filters.CMI', 'Contingency management'); }, get detail() { return t('filters.CMI.detail', 'Rewards-based treatment, used for stimulants'); } },
      { code: 'HIVT', get label() { return t('filters.HIVT', 'HIV testing'); } },
      { code: 'HCT', get label() { return t('filters.HCT', 'Hepatitis C testing'); } },
      { code: 'TA', get label() { return t('filters.TA', 'Transportation assistance'); } },
    ],
  },
];

export const MENTAL_HEALTH_FILTERS = [
  {
    id: 'care',
    get label() { return t('filters.group.care', 'Type of care'); },
    options: [
      { code: 'OP', get label() { return t('filters.OP', 'Outpatient'); } },
      { code: 'PHP', get label() { return t('filters.PHP', 'Partial hospitalization / day program'); } },
      { code: 'RES', get label() { return t('filters.RES', 'Residential'); } },
      { code: 'HI', get label() { return t('filters.HI', 'Hospital inpatient'); } },
      { code: 'TELE', get label() { return t('filters.TELE', 'Telehealth'); } },
    ],
  },
  {
    id: 'crisis',
    get label() { return t('filters.group.crisis', 'Crisis services'); },
    options: [
      { code: 'WI', get label() { return t('filters.WI', 'Walk-in crisis care'); } },
      { code: 'PEOFF', get label() { return t('filters.PEOFF', 'Mobile crisis team'); } },
      { code: 'PEON', get label() { return t('filters.PEON', 'On-site psychiatric emergency care'); } },
      { code: 'SPS', get label() { return t('filters.SPS', 'Suicide prevention services'); } },
    ],
  },
  {
    id: 'pay',
    get label() { return t('filters.group.pay', 'Cost & insurance'); },
    options: [
      { code: 'MD', get label() { return t('filters.MD', 'Medicaid'); } },
      { code: 'MC', get label() { return t('filters.MC', 'Medicare'); } },
      { code: 'PI', get label() { return t('filters.PI', 'Private insurance'); } },
      { code: 'SS', get label() { return t('filters.SS', 'Sliding fee scale'); } },
      { code: 'PA', get label() { return t('filters.PA', 'Payment assistance'); } },
      { code: 'ITU', get label() { return t('filters.ITU', 'IHS / Tribal / Urban Indian'); } },
      { code: 'TRICARE', get label() { return t('filters.TRICARE', 'TRICARE (military)'); } },
    ],
  },
  {
    id: 'people',
    get label() { return t('filters.group.people', 'Programs for'); },
    options: [
      { code: 'CH_AD', get label() { return t('filters.CH_AD', 'Children & teens'); } },
      { code: 'YAD', get label() { return t('filters.YAD', 'Young adults'); } },
      { code: 'SNR', get label() { return t('filters.SNR', 'Older adults'); } },
      { code: 'VET', get label() { return t('filters.VET', 'Veterans'); } },
      { code: 'MHSU', get label() { return t('filters.MHSU.mh', 'Co-occurring substance use'); } },
      { code: 'PTSD', get label() { return t('filters.PTSD', 'PTSD'); } },
      { code: 'FEP', get label() { return t('filters.FEP', 'First-episode psychosis'); } },
      { code: 'PED', get label() { return t('filters.PED', 'Eating disorders'); } },
    ],
  },
  {
    id: 'lang',
    get label() { return t('filters.group.lang', 'Language'); },
    options: [
      { code: 'SP', get label() { return t('filters.SP', 'Spanish'); } },
      { code: 'ASL', get label() { return t('filters.ASL', 'Sign language (ASL)'); } },
    ],
  },
];

const anyOf = (codes, list) => list.some((c) => codes.has(c));

/** Short, scannable highlights for a facility card. */
export function highlights(facility) {
  const c = new Set(facility.codes);
  const out = [];
  const add = (label, tone) => out.push({ label, tone });

  if (anyOf(c, ['BU', 'BUM', 'DB', 'UB', 'BWN', 'BWON', 'BERI', 'BSDM'])) add(t('badge.bup', 'Buprenorphine'), 'med');
  if (anyOf(c, ['MU', 'MM', 'DM', 'METH'])) add(t('badge.methadone', 'Methadone'), 'med');
  if (anyOf(c, ['NU', 'UN', 'NXN', 'VTRL', 'RPN'])) add(t('badge.naltrexone', 'Naltrexone'), 'med');
  if (c.has('PMAT')) add(t('badge.aud', 'Alcohol use disorder meds'), 'med');
  if (c.has('OTP')) add(t('badge.otp', 'Opioid treatment program'), 'med');

  if (c.has('DT')) add(t('badge.detox', 'Detox'), 'care');
  if (c.has('RES')) add(t('badge.residential', 'Residential'), 'care');
  if (c.has('PHP') || c.has('ODT')) add(t('badge.day', 'Day program'), 'care');
  if (c.has('IOP')) add(t('badge.iop', 'Intensive outpatient'), 'care');
  if (c.has('OP')) add(t('badge.outpatient', 'Outpatient'), 'care');
  if (c.has('HI')) add(t('badge.inpatient', 'Hospital inpatient'), 'care');
  if (c.has('TELE')) add(t('badge.telehealth', 'Telehealth'), 'care');
  if (c.has('HH')) add(t('badge.housing', 'Recovery housing'), 'care');
  if (anyOf(c, ['WI', 'PEOFF', 'PEON', 'CIT'])) add(t('badge.crisis', 'Crisis services'), 'care');

  if (c.has('NP')) add(t('badge.free', 'Free'), 'pay');
  if (c.has('MD')) add(t('badge.medicaid', 'Medicaid'), 'pay');
  if (c.has('MC')) add(t('badge.medicare', 'Medicare'), 'pay');
  if (c.has('PI')) add(t('badge.private', 'Private insurance'), 'pay');
  if (c.has('SS')) add(t('badge.sliding', 'Sliding scale'), 'pay');
  if (c.has('PA')) add(t('badge.payHelp', 'Payment help'), 'pay');

  if (c.has('NOE')) add(t('badge.naloxone', 'Naloxone'), 'extra');
  if (c.has('SP')) add('Español', 'extra');
  if (c.has('ASL')) add(t('badge.asl', 'ASL'), 'extra');
  return out;
}

/**
 * A facility's services with SAMHSA's official names in another language.
 * `names` is { categories: {code: name}, services: {category: {code: name}} }
 * (locales/es-services.js), or null for English.
 *
 * Listings name services in English, and facility.codes holds the code of
 * every listed service. Within a category, the facility's codes (in SAMHSA's
 * order) replace the English items when the counts match; otherwise that
 * category keeps its English items, so nothing is ever dropped or mislabeled.
 */
export function localizeServices(facility, names) {
  if (!names) return facility.services;
  const have = new Set(facility.codes);
  return facility.services.map((s) => {
    const byCode = names.services[s.category];
    const codes = byCode ? Object.keys(byCode).filter((code) => have.has(code)) : [];
    return {
      ...s,
      label: names.categories[s.category] ?? s.label,
      items: codes.length === s.items.length ? codes.map((code) => byCode[code]) : s.items,
    };
  });
}

// Services shown first in the details panel, in this order.
export const DETAIL_ORDER = ['TC', 'SET', 'OM', 'OT', 'AUT', 'DETOX', 'PHR', 'TAP', 'EMS', 'PAY', 'PYAS', 'SG', 'AGE', 'SN', 'SL', 'OL', 'TRSRV', 'RSS', 'SCR', 'ECS', 'MSRV', 'AS', 'LCA', 'FOP', 'FT', 'HOSP', 'ASPT', 'EXCL', 'OTHR'];
export const DETAIL_HIDDEN = new Set(['SMP', 'FVP', 'OMSC', 'SMAT']);
