// Plain-language labels for SAMHSA FindTreatment.gov service codes.
// Filters are combined with AND by the upstream API, so each option narrows
// the results.

export const TREATMENT_FILTERS = [
  {
    id: 'meds',
    label: 'Medications',
    hint: 'FDA-approved medications are the most effective treatment for opioid use disorder.',
    options: [
      { code: 'BU', label: 'Buprenorphine', detail: 'Suboxone, Sublocade, others' },
      { code: 'MU', label: 'Methadone' },
      { code: 'NU', label: 'Naltrexone', detail: 'Vivitrol, others' },
      { code: 'OTP', label: 'Opioid treatment program (OTP)', detail: 'Federally certified clinic' },
      { code: 'PMAT', label: 'Alcohol use disorder medication', detail: 'Prescribes on site' },
    ],
  },
  {
    id: 'care',
    label: 'Type of care',
    options: [
      { code: 'DT', label: 'Detox / withdrawal management' },
      { code: 'OP', label: 'Outpatient' },
      { code: 'IOP', label: 'Intensive outpatient' },
      { code: 'RES', label: 'Residential' },
      { code: 'HI', label: 'Hospital inpatient' },
      { code: 'TELE', label: 'Telehealth' },
      { code: 'HH', label: 'Recovery housing / sober home' },
    ],
  },
  {
    id: 'pay',
    label: 'Cost & insurance',
    options: [
      { code: 'MD', label: 'Medicaid' },
      { code: 'MC', label: 'Medicare' },
      { code: 'PI', label: 'Private insurance' },
      { code: 'SS', label: 'Sliding fee scale' },
      { code: 'PA', label: 'Payment assistance' },
      { code: 'NP', label: 'Free of charge', detail: 'No payment accepted' },
      { code: 'ITU', label: 'IHS / Tribal / Urban Indian' },
      { code: 'TRICARE', label: 'TRICARE (military)' },
    ],
  },
  {
    id: 'people',
    label: 'Programs for',
    options: [
      { code: 'ADOL', label: 'Teens' },
      { code: 'YA', label: 'Young adults' },
      { code: 'PW', label: 'Pregnant or postpartum people' },
      { code: 'WN', label: 'Women' },
      { code: 'MN', label: 'Men' },
      { code: 'SEN', label: 'Older adults' },
      { code: 'VET', label: 'Veterans' },
      { code: 'MHSU', label: 'Co-occurring mental health conditions' },
      { code: 'CJ', label: 'People involved with the justice system' },
      { code: 'TRMA', label: 'Trauma survivors' },
    ],
  },
  {
    id: 'lang',
    label: 'Language',
    options: [
      { code: 'SP', label: 'Spanish' },
      { code: 'ASL', label: 'Sign language (ASL)' },
      { code: 'NX', label: 'American Indian / Alaska Native languages' },
    ],
  },
  {
    id: 'extra',
    label: 'Also offers',
    options: [
      { code: 'NOE', label: 'Naloxone & overdose education' },
      { code: 'PEER', label: 'Peer support / mentoring' },
      { code: 'CMI', label: 'Contingency management', detail: 'Rewards-based treatment, used for stimulants' },
      { code: 'HIVT', label: 'HIV testing' },
      { code: 'HCT', label: 'Hepatitis C testing' },
      { code: 'TA', label: 'Transportation assistance' },
    ],
  },
];

export const MENTAL_HEALTH_FILTERS = [
  {
    id: 'care',
    label: 'Type of care',
    options: [
      { code: 'OP', label: 'Outpatient' },
      { code: 'PHP', label: 'Partial hospitalization / day program' },
      { code: 'RES', label: 'Residential' },
      { code: 'HI', label: 'Hospital inpatient' },
      { code: 'TELE', label: 'Telehealth' },
    ],
  },
  {
    id: 'crisis',
    label: 'Crisis services',
    options: [
      { code: 'WI', label: 'Walk-in crisis care' },
      { code: 'PEOFF', label: 'Mobile crisis team' },
      { code: 'PEON', label: 'On-site psychiatric emergency care' },
      { code: 'SPS', label: 'Suicide prevention services' },
    ],
  },
  {
    id: 'pay',
    label: 'Cost & insurance',
    options: [
      { code: 'MD', label: 'Medicaid' },
      { code: 'MC', label: 'Medicare' },
      { code: 'PI', label: 'Private insurance' },
      { code: 'SS', label: 'Sliding fee scale' },
      { code: 'PA', label: 'Payment assistance' },
      { code: 'ITU', label: 'IHS / Tribal / Urban Indian' },
      { code: 'TRICARE', label: 'TRICARE (military)' },
    ],
  },
  {
    id: 'people',
    label: 'Programs for',
    options: [
      { code: 'CH_AD', label: 'Children & teens' },
      { code: 'YAD', label: 'Young adults' },
      { code: 'SNR', label: 'Older adults' },
      { code: 'VET', label: 'Veterans' },
      { code: 'MHSU', label: 'Co-occurring substance use' },
      { code: 'PTSD', label: 'PTSD' },
      { code: 'FEP', label: 'First-episode psychosis' },
      { code: 'PED', label: 'Eating disorders' },
    ],
  },
  {
    id: 'lang',
    label: 'Language',
    options: [
      { code: 'SP', label: 'Spanish' },
      { code: 'ASL', label: 'Sign language (ASL)' },
    ],
  },
];

const anyOf = (codes, list) => list.some((c) => codes.has(c));

/** Short, scannable highlights for a facility card. */
export function highlights(facility) {
  const c = new Set(facility.codes);
  const out = [];
  const add = (label, tone) => out.push({ label, tone });

  if (anyOf(c, ['BU', 'BUM', 'DB', 'UB', 'BWN', 'BWON', 'BERI', 'BSDM'])) add('Buprenorphine', 'med');
  if (anyOf(c, ['MU', 'MM', 'DM', 'METH'])) add('Methadone', 'med');
  if (anyOf(c, ['NU', 'UN', 'NXN', 'VTRL', 'RPN'])) add('Naltrexone', 'med');
  if (c.has('PMAT')) add('Alcohol use disorder meds', 'med');
  if (c.has('OTP')) add('Opioid treatment program', 'med');

  if (c.has('DT')) add('Detox', 'care');
  if (c.has('RES')) add('Residential', 'care');
  if (c.has('PHP') || c.has('ODT')) add('Day program', 'care');
  if (c.has('IOP')) add('Intensive outpatient', 'care');
  if (c.has('OP')) add('Outpatient', 'care');
  if (c.has('HI')) add('Hospital inpatient', 'care');
  if (c.has('TELE')) add('Telehealth', 'care');
  if (c.has('HH')) add('Recovery housing', 'care');
  if (anyOf(c, ['WI', 'PEOFF', 'PEON', 'CIT'])) add('Crisis services', 'care');

  if (c.has('NP')) add('Free', 'pay');
  if (c.has('MD')) add('Medicaid', 'pay');
  if (c.has('MC')) add('Medicare', 'pay');
  if (c.has('PI')) add('Private insurance', 'pay');
  if (c.has('SS')) add('Sliding scale', 'pay');
  if (c.has('PA')) add('Payment help', 'pay');

  if (c.has('NOE')) add('Naloxone', 'extra');
  if (c.has('SP')) add('Español', 'extra');
  if (c.has('ASL')) add('ASL', 'extra');
  return out;
}

// Services shown first in the details panel, in this order.
export const DETAIL_ORDER = ['TC', 'SET', 'OM', 'OT', 'AUT', 'DETOX', 'PHR', 'TAP', 'EMS', 'PAY', 'PYAS', 'SG', 'AGE', 'SN', 'SL', 'OL', 'TRSRV', 'RSS', 'SCR', 'ECS', 'MSRV', 'AS', 'LCA', 'FOP', 'FT', 'HOSP', 'ASPT', 'EXCL', 'OTHR'];
export const DETAIL_HIDDEN = new Set(['SMP', 'FVP', 'OMSC', 'SMAT']);
