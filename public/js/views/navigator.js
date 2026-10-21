import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, emergencyCallout } from './common.js';
import { t } from '../i18n.js';

// Valid SAMHSA filter codes for Dimension 6 validation and chip display
const PAYMENT_OPTIONS = [
  { code: '', label: 'Any cost or insurance option' },
  { code: 'MD', label: 'Medicaid' },
  { code: 'MC', label: 'Medicare' },
  { code: 'PI', label: 'Private insurance' },
  { code: 'SS', label: 'Sliding fee scale (income-based)' },
  { code: 'PA', label: 'Payment assistance / charity care' },
  { code: 'NP', label: 'Free of charge (no payment accepted)' },
  { code: 'ITU', label: 'IHS / Tribal / Urban Indian health' },
  { code: 'TRICARE', label: 'TRICARE (military)' },
];

const POPULATION_OPTIONS = [
  { code: '', label: 'No specific population filter' },
  { code: 'VET', label: 'Veterans' },
  { code: 'ADOL', label: 'Teens / adolescents' },
  { code: 'YA', label: 'Young adults' },
  { code: 'SEN', label: 'Older adults / seniors' },
  { code: 'CJ', label: 'People with justice-system involvement' },
  { code: 'WN', label: 'Women-focused programs' },
  { code: 'MN', label: 'Men-focused programs' },
];

const VALID_PAYMENTS = new Set(PAYMENT_OPTIONS.map((o) => o.code).filter(Boolean));
const VALID_POPULATIONS = new Set(POPULATION_OPTIONS.map((o) => o.code).filter(Boolean));

const CODE_META = {
  BU: { label: 'Buprenorphine (Suboxone/Sublocade)', tone: 'med' },
  MU: { label: 'Methadone', tone: 'med' },
  OTP: { label: 'Opioid Treatment Program (OTP)', tone: 'med' },
  NU: { label: 'Naltrexone (Vivitrol)', tone: 'med' },
  PMAT: { label: 'Alcohol Use Disorder Medications', tone: 'med' },
  DT: { label: 'Detox / Withdrawal Management', tone: 'care' },
  HI: { label: 'Hospital Inpatient', tone: 'care' },
  RES: { label: 'Residential Care', tone: 'care' },
  HH: { label: 'Recovery Housing', tone: 'care' },
  IOP: { label: 'Intensive Outpatient (IOP)', tone: 'care' },
  PHP: { label: 'Partial Hospitalization / Day Program', tone: 'care' },
  OP: { label: 'Outpatient Care', tone: 'care' },
  TELE: { label: 'Telehealth', tone: 'care' },
  PW: { label: 'Pregnant / Postpartum Specialty', tone: 'extra' },
  MHSU: { label: 'Co-occurring Mental Health & SUD', tone: 'extra' },
  TRMA: { label: 'Trauma-Informed Care', tone: 'extra' },
  CMI: { label: 'Contingency Management', tone: 'extra' },
  NOE: { label: 'Naloxone & Overdose Education', tone: 'extra' },
  WI: { label: 'Walk-in Crisis Care', tone: 'care' },
  PEOFF: { label: 'Mobile Crisis Team', tone: 'care' },
  MD: { label: 'Medicaid', tone: 'pay' },
  MC: { label: 'Medicare', tone: 'pay' },
  PI: { label: 'Private Insurance', tone: 'pay' },
  SS: { label: 'Sliding Fee Scale', tone: 'pay' },
  PA: { label: 'Payment Assistance', tone: 'pay' },
  NP: { label: 'Free of Charge', tone: 'pay' },
  ITU: { label: 'IHS / Tribal / Urban Indian', tone: 'pay' },
  TRICARE: { label: 'TRICARE', tone: 'pay' },
  VET: { label: 'Veterans', tone: 'extra' },
  ADOL: { label: 'Teens / Adolescents', tone: 'extra' },
  YA: { label: 'Young Adults', tone: 'extra' },
  SEN: { label: 'Older Adults', tone: 'extra' },
  CJ: { label: 'Justice-Involved Support', tone: 'extra' },
  WN: { label: 'Women', tone: 'extra' },
  MN: { label: 'Men', tone: 'extra' },
};

function normalizeSubstances(raw) {
  if (!raw) return new Set();
  if (raw instanceof Set) return new Set([...raw].map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  if (Array.isArray(raw)) return new Set(raw.map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  if (typeof raw === 'string') {
    return new Set(raw.split(',').map((s) => s.toLowerCase().trim()).filter(Boolean));
  }
  return new Set();
}

/**
 * Pure clinical evaluation engine based on The ASAM Criteria (4th Edition)
 * across all 6 dimensions. Runs 100% in browser/process RAM with zero network I/O.
 *
 * @param {object} answers
 * @param {Iterable<string>|string} [answers.substances] - 'opioids' | 'alcohol' | 'benzos' | 'stimulants' | 'xylazine' | 'other'
 * @param {'none'|'mild'|'moderate'|'severe'} [answers.withdrawalRisk]
 * @param {'none'|'pregnant'|'chronic'|'acute_infection'} [answers.biomedical]
 * @param {'none'|'mild_moderate'|'severe_crisis'|'trauma'} [answers.mentalHealth]
 * @param {'supportive'|'unstable'|'unhoused'} [answers.environment]
 * @param {'flexible'|'structured_day'|'24_hour'} [answers.structureNeeded]
 * @param {string} [answers.payment]
 * @param {string} [answers.population]
 * @param {boolean} [answers.preferTelehealth]
 */
export function evaluateAsamCare(answers = {}) {
  const substances = normalizeSubstances(answers.substances);
  const withdrawalRisk = ['none', 'mild', 'moderate', 'severe'].includes(answers.withdrawalRisk)
    ? answers.withdrawalRisk
    : 'none';
  const biomedical = ['none', 'pregnant', 'chronic', 'acute_infection'].includes(answers.biomedical)
    ? answers.biomedical
    : 'none';
  const mentalHealth = ['none', 'mild_moderate', 'severe_crisis', 'trauma'].includes(answers.mentalHealth)
    ? answers.mentalHealth
    : 'none';
  const environment = ['supportive', 'unstable', 'unhoused'].includes(answers.environment)
    ? answers.environment
    : 'supportive';
  const structureNeeded = ['flexible', 'structured_day', '24_hour'].includes(answers.structureNeeded)
    ? answers.structureNeeded
    : 'flexible';
  const payment = VALID_PAYMENTS.has(answers.payment) ? answers.payment : '';
  const population = VALID_POPULATIONS.has(answers.population) ? answers.population : '';
  const preferTelehealth = Boolean(answers.preferTelehealth);

  const hasOpioids = substances.has('opioids');
  const hasAlcohol = substances.has('alcohol');
  const hasBenzos = substances.has('benzos');
  const hasStimulants = substances.has('stimulants');
  const hasXylazine = substances.has('xylazine');
  const hasGabaergic = hasAlcohol || hasBenzos;

  const gabaSevereOrModerateRisk =
    hasGabaergic && (withdrawalRisk === 'moderate' || withdrawalRisk === 'severe' || Boolean(answers.seizureOrDtHistory));

  const redFlags = [];
  const clinicalNotes = [];
  const rawCodes = [];
  const rawBroadCodes = [];

  const addCode = (code) => {
    if (code && !rawCodes.includes(code)) rawCodes.push(code);
  };
  const addBroadCode = (code) => {
    if (code && !rawBroadCodes.includes(code)) rawBroadCodes.push(code);
  };

  // -------------------------------------------------------------------------
  // Dimension 1: Acute Intoxication and Withdrawal Potential
  // -------------------------------------------------------------------------
  if (gabaSevereOrModerateRisk) {
    redFlags.push(
      t(
        'nav.redflag.gaba_withdrawal',
        'Life-threatening GABAergic withdrawal risk (alcohol or benzodiazepines): Stopping heavy alcohol or benzodiazepine use abruptly can trigger generalized tonic-clonic withdrawal seizures or delirium tremens (DTs), which can be fatal without medical management. Do not stop cold turkey—seek ASAM Level 3.7-WM or 4.0 medically managed withdrawal care or an Emergency Department right away.',
      ),
    );
  } else if (withdrawalRisk === 'severe') {
    redFlags.push(
      t(
        'nav.redflag.severe_withdrawal',
        'High-acuity withdrawal risk: Severe acute withdrawal symptoms or a history of complicated withdrawal warrants 24-hour medically managed withdrawal stabilization (ASAM Level 3.7-WM / 4.0) or immediate hospital / bridge clinic evaluation.',
      ),
    );
  }

  if (hasOpioids) {
    clinicalNotes.push(
      t(
        'nav.note.opioid_moud',
        'Opioid Use Disorder & the DEA 72-Hour Rule (21 CFR § 1306.07(b)): FDA-approved medications—buprenorphine (BU), methadone (MU/OTP), and extended-release naltrexone (NU)—cut fatal overdose risk by more than half. Under federal DEA regulation 21 CFR § 1306.07(b), any Emergency Department or hospital clinician can administer or dispense up to 72 hours (3 days) of buprenorphine or methadone to relieve acute opioid withdrawal while connecting you to ongoing care.',
      ),
    );
  }

  if (hasXylazine) {
    clinicalNotes.push(
      t(
        'nav.note.xylazine',
        'Xylazine / Medetomidine (“Tranq”) Adulteration: Xylazine and medetomidine are non-opioid alpha-2 adrenergic sedatives. Withdrawal causes rebound hypertension, rapid heart rate, sweating, and severe anxiety that opioid medications (buprenorphine or methadone) alone do not fully relieve; clinicians often add alpha-2 agonists (such as clonidine, tizanidine, or dexmedetomidine) alongside MOUD. Deep necrotic skin wounds can appear even away from injection sites and require gentle saline cleansing, moist non-adherent dressings, and early medical wound care.',
      ),
    );
    if (withdrawalRisk === 'moderate' || withdrawalRisk === 'severe' || biomedical === 'acute_infection') {
      redFlags.push(
        t(
          'nav.redflag.xylazine_acuity',
          'Xylazine / medetomidine withdrawal & wound alert: Alpha-2 adrenergic rebound can cause severe blood pressure spikes and autonomic instability alongside opioid withdrawal. Seek medically monitored withdrawal care that manages both opioid and alpha-2 withdrawal and evaluates any skin ulcers.',
        ),
      );
    }
  }

  if (hasAlcohol) {
    clinicalNotes.push(
      t(
        'nav.note.alcohol_maud',
        'Medications for Alcohol Use Disorder (MAUD): After acute withdrawal is safely managed, FDA-approved medications including naltrexone (oral or monthly injection), acamprosate, and disulfiram reduce heavy drinking and cravings and can be prescribed in outpatient or primary care settings.',
      ),
    );
  }

  if (hasStimulants) {
    clinicalNotes.push(
      t(
        'nav.note.stimulants',
        'Stimulant Use Disorder (Methamphetamine / Cocaine): Contingency Management (CMI)—which provides tangible rewards for meeting recovery goals—combined with cognitive behavioral therapy and community recovery support has the strongest clinical evidence. Monitor closely for post-acute depression or exhaustion (“crash”) during early stabilization.',
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Dimension 2: Biomedical Conditions and Complications
  // -------------------------------------------------------------------------
  if (biomedical === 'pregnant') {
    redFlags.push(
      t(
        'nav.redflag.pregnant',
        'Pregnancy & Perinatal Care Priority (ACOG / ASAM Guidelines): If you are pregnant and using opioids, clinical guidelines strongly recommend starting or continuing buprenorphine (BU) or methadone (MU/OTP) maintenance rather than abrupt detox. Unsupervised opioid withdrawal during pregnancy can cause fetal distress, placental abruption, preterm labor, and return to use.',
      ),
    );
    clinicalNotes.push(
      t(
        'nav.note.pregnant_capta',
        'Perinatal Rights & CAPTA Plans of Safe Care: Specialized pregnant and postpartum programs (SAMHSA code PW) coordinate prenatal care, non-punitive Plans of Safe Care under federal CAPTA guidelines, breastfeeding support, and rooming-in newborn care (Eat, Sleep, Console) to keep birthing parents and infants together.',
      ),
    );
  }

  if (biomedical === 'acute_infection') {
    redFlags.push(
      t(
        'nav.redflag.acute_infection',
        'Urgent Biomedical Warning (Fever, Severe Wound, or Systemic Infection Risk): Fever, chills, spreading redness, black/necrotic tissue, chest pain, or shortness of breath can signal life-threatening endocarditis, osteomyelitis, sepsis, or deep tissue infection. Seek immediate hospital evaluation (HI) or urgent medical/wound care (#/health). Under EMTALA, hospital emergency rooms must evaluate and stabilize you regardless of insurance or ability to pay.',
      ),
    );
    clinicalNotes.push(
      t(
        'nav.note.acute_infection_care',
        'Integrated Medical & Wound Care: Hospital inpatient programs (HI) and Federally Qualified Health Centers (#/health) can treat infections with IV or oral antibiotics while simultaneously managing withdrawal with buprenorphine or methadone so pain and withdrawal never force you to leave care early.',
      ),
    );
  } else if (biomedical === 'chronic') {
    clinicalNotes.push(
      t(
        'nav.note.chronic_biomedical',
        'Co-existing Biomedical Care: Look for programs offering integrated primary care, infectious disease screening and curative Hepatitis C / HIV treatment (HIVT, HCT), or coordinate with a sliding-fee Community Health Center (#/health).',
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Dimension 3: Emotional, Behavioral, or Cognitive Conditions
  // -------------------------------------------------------------------------
  if (mentalHealth === 'severe_crisis') {
    redFlags.push(
      t(
        'nav.redflag.mental_crisis',
        'Acute Mental Health Crisis Support: If you are experiencing thoughts of self-harm, overwhelming panic, or psychosis, you do not have to carry this alone. Call or text 988 (free, confidential, 24/7) or use walk-in crisis care (WI) and mobile crisis teams (PEOFF). Integrated Dual-Diagnosis care (MHSU) treats mental health and substance use together.',
      ),
    );
  }

  if (mentalHealth === 'mild_moderate' || mentalHealth === 'severe_crisis') {
    clinicalNotes.push(
      t(
        'nav.note.mhsu',
        'Co-occurring Mental Health & Substance Use (MHSU): Evidence shows that depression, anxiety, bipolar disorder, PTSD, and substance use disorders must be treated at the same time by an integrated team—you should never be turned away from mental health care because of substance use, or denied MOUD because of psychiatric medications.',
      ),
    );
  } else if (mentalHealth === 'trauma') {
    clinicalNotes.push(
      t(
        'nav.note.trauma',
        'Trauma-Informed Care (TRMA): Trauma-specific programs prioritize physical and emotional safety, choice, collaboration, and empowerment, avoiding confrontational tactics that can re-traumatize survivors.',
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Dimensions 1–5: Determine ASAM 4th Edition Level of Care
  // -------------------------------------------------------------------------
  let asamLevel = '';
  let asamTitle = '';
  let summary = '';

  const needsLevel4Or37WM =
    gabaSevereOrModerateRisk ||
    withdrawalRisk === 'severe' ||
    (biomedical === 'acute_infection' && (withdrawalRisk === 'moderate' || structureNeeded === '24_hour' || hasXylazine));

  const needsLevel3Residential =
    !needsLevel4Or37WM &&
    (structureNeeded === '24_hour' ||
      environment === 'unhoused' ||
      (environment === 'unstable' &&
        (withdrawalRisk === 'moderate' ||
          mentalHealth === 'severe_crisis' ||
          biomedical === 'pregnant' ||
          biomedical === 'acute_infection')));

  const needsLevel2IOPOrPHP =
    !needsLevel4Or37WM &&
    !needsLevel3Residential &&
    (structureNeeded === 'structured_day' ||
      environment === 'unstable' ||
      withdrawalRisk === 'moderate' ||
      mentalHealth === 'severe_crisis' ||
      (biomedical === 'acute_infection' && withdrawalRisk !== 'none'));

  if (needsLevel4Or37WM) {
    asamLevel = 'ASAM Level 3.7-WM / 4.0';
    asamTitle = t(
      'nav.level.4.title',
      'Medically Managed Inpatient / Withdrawal Management (ASAM Level 3.7-WM / 4.0)',
    );
    summary = t(
      'nav.level.4.summary',
      'Based on your withdrawal profile or acute medical needs, 24-hour medically managed care with on-site physician and nursing monitoring is the safest first step to prevent life-threatening complications, stabilize acute symptoms, and transition directly into ongoing maintenance care.',
    );
    addCode('DT');
    addCode('HI');
    addBroadCode('DT');
  } else if (needsLevel3Residential) {
    asamLevel = 'ASAM Level 3.1 / 3.5 / 3.7';
    asamTitle = t(
      'nav.level.3.title',
      'Clinically or Medically Monitored Residential Care & Recovery Housing (ASAM Level 3.1 / 3.5 / 3.7)',
    );
    summary = t(
      'nav.level.3.summary',
      'A safe, structured 24-hour residential living environment provides vital stability away from environmental triggers or housing insecurity while delivering daily clinical therapy, medication management (MOUD/MAUD), and recovery support.',
    );
    addCode('RES');
    addBroadCode('RES');
    if (environment === 'unhoused' || environment === 'unstable') {
      addCode('HH');
    }
    if (withdrawalRisk === 'moderate') {
      addCode('DT');
    }
  } else if (needsLevel2IOPOrPHP) {
    asamLevel = 'ASAM Level 2.1 / 2.5';
    asamTitle = t(
      'nav.level.2.title',
      'Intensive Outpatient (IOP) or Partial Hospitalization / Day Treatment (ASAM Level 2.1 / 2.5)',
    );
    summary = t(
      'nav.level.2.summary',
      'Structured multi-day outpatient care (9 to 20+ hours per week of clinical group, individual, medical, and psychiatric support) offers strong daily accountability and symptom stabilization while allowing you to sleep at home or in supportive housing.',
    );
    addCode('IOP');
    addBroadCode('IOP');
  } else {
    asamLevel = 'ASAM Level 1.0 / 1.5';
    asamTitle = t(
      'nav.level.1.title',
      'Outpatient Treatment & Medication Management (ASAM Level 1.0 / 1.5)',
    );
    summary = t(
      'nav.level.1.summary',
      'Flexible outpatient care—including office-based or telehealth medication treatment (such as buprenorphine or alcohol use disorder medications), individual counseling, and peer recovery support—lets you access evidence-based care around work, school, or family responsibilities.',
    );
    addCode('OP');
    addBroadCode('OP');
    if (preferTelehealth) {
      addCode('TELE');
    }
  }

  // -------------------------------------------------------------------------
  // High-Signal Clinical Code Selection (Ordered by clinical priority)
  // -------------------------------------------------------------------------
  if (biomedical === 'pregnant') {
    addCode('PW');
    addBroadCode('PW');
    if (hasOpioids) {
      addCode('BU');
      addBroadCode('BU');
    }
  }

  if (biomedical === 'acute_infection') {
    addCode('HI');
  }

  if (hasOpioids) {
    addCode('BU');
    addBroadCode('BU');
    // For severe withdrawal or 24-hour structure where methadone OTP may also be sought,
    // keep BU in core codes so AND-filtering stays broad enough to return matches,
    // and note OTP / MU in clinical notes.
  }

  if (hasAlcohol && !hasOpioids) {
    addCode('PMAT');
  }

  if (mentalHealth === 'mild_moderate' || mentalHealth === 'severe_crisis') {
    addCode('MHSU');
  } else if (mentalHealth === 'trauma') {
    addCode('TRMA');
  }

  if (hasStimulants) {
    addCode('CMI');
  }

  if (preferTelehealth) {
    addCode('TELE');
  }

  if (payment) {
    addCode(payment);
  }

  if (population) {
    addCode(population);
  }

  if ((environment === 'unhoused' || environment === 'unstable') && !rawCodes.includes('HH')) {
    clinicalNotes.push(
      t(
        'nav.note.housing',
        'Safe Recovery Environment & Housing (ASAM Dimension 5): Unstable housing or living around active substance use makes recovery much harder. Consider NARR-certified recovery residences (SAMHSA code HH) or calling 211 for local housing navigation alongside treatment.',
      ),
    );
  }

  if (preferTelehealth) {
    clinicalNotes.push(
      t(
        'nav.note.telehealth',
        'Telehealth Access (SAMHSA / DEA Telemedicine Flexibilities): Under federal rules, clinicians can initiate buprenorphine (BU) and provide outpatient counseling via audio-video or audio-only telehealth visits (code TELE) without requiring an in-person exam first.',
      ),
    );
  }

  // Ensure we never exceed 8 codes so SAMHSA's AND-filter returns results
  const codes = rawCodes.slice(0, 8);
  const broadCodes = rawBroadCodes.slice(0, 2);
  if (broadCodes.length === 0 && codes.length > 0) {
    broadCodes.push(codes[0]);
  }

  const searchHref = codes.length ? `#/treatment?codes=${codes.join(',')}` : '#/treatment';
  const broadSearchHref = broadCodes.length ? `#/treatment?codes=${broadCodes.join(',')}` : '#/treatment';

  const dimensionBreakdown = [
    {
      dimension: 'Dimension 1',
      title: t('nav.dim1.short', 'Acute Intoxication & Withdrawal Potential'),
      finding: gabaSevereOrModerateRisk
        ? t('nav.dim1.finding.gaba', 'High-risk alcohol/benzodiazepine withdrawal potential — requires medical withdrawal management (DT/HI).')
        : withdrawalRisk === 'severe'
          ? t('nav.dim1.finding.severe', 'Severe acute withdrawal symptoms — 24-hour medical stabilization recommended.')
          : withdrawalRisk === 'moderate'
            ? t('nav.dim1.finding.moderate', 'Moderate withdrawal symptoms — ambulatory or monitored medication support recommended.')
            : t('nav.dim1.finding.low', 'Low or minimal acute withdrawal risk — safe for outpatient initiation.'),
    },
    {
      dimension: 'Dimension 2',
      title: t('nav.dim2.short', 'Biomedical Conditions'),
      finding:
        biomedical === 'pregnant'
          ? t('nav.dim2.finding.pregnant', 'Perinatal specialty care (PW) with agonist medication maintenance (BU/OTP) prioritized over abrupt detox.')
          : biomedical === 'acute_infection'
            ? t('nav.dim2.finding.infection', 'Acute medical/wound evaluation prioritized (HI / #/health) alongside withdrawal care.')
            : biomedical === 'chronic'
              ? t('nav.dim2.finding.chronic', 'Coordinate ongoing primary care and HIV/HCV screening (#/health).')
              : t('nav.dim2.finding.none', 'No acute biomedical instability reported.'),
    },
    {
      dimension: 'Dimension 3',
      title: t('nav.dim3.short', 'Emotional, Behavioral, or Cognitive Conditions'),
      finding:
        mentalHealth === 'severe_crisis'
          ? t('nav.dim3.finding.crisis', 'Immediate crisis support (988 / walk-in crisis WI) and integrated dual-diagnosis care (MHSU).')
          : mentalHealth === 'mild_moderate'
            ? t('nav.dim3.finding.mhsu', 'Integrated co-occurring mental health and substance use services (MHSU).')
            : mentalHealth === 'trauma'
              ? t('nav.dim3.finding.trauma', 'Trauma-informed clinical care (TRMA).')
              : t('nav.dim3.finding.none', 'Standard behavioral support.'),
    },
    {
      dimension: 'Dimension 4 & 5',
      title: t('nav.dim45.short', 'Substance Use Risks & Recovery Environment'),
      finding: `${asamLevel} (${environment === 'unhoused' ? 'unhoused / recovery housing support' : environment === 'unstable' ? 'unstable environment support' : 'supportive environment'})`,
    },
    {
      dimension: 'Dimension 6',
      title: t('nav.dim6.short', 'Person-Centered & Practical Considerations'),
      finding: [
        preferTelehealth ? 'Telehealth (TELE)' : null,
        payment ? CODE_META[payment]?.label ?? payment : null,
        population ? CODE_META[population]?.label ?? population : null,
      ].filter(Boolean).join(' · ') || t('nav.dim6.finding.default', 'All payment and program types included'),
    },
  ];

  return {
    asamLevel,
    asamTitle,
    summary,
    redFlags,
    clinicalNotes,
    codes,
    broadCodes,
    searchHref,
    broadSearchHref,
    dimensionBreakdown,
  };
}

// ---------------------------------------------------------------------------
// Interactive Care Navigator View
// ---------------------------------------------------------------------------

const SUBSTANCE_CHOICES = [
  {
    id: 'opioids',
    label: 'Opioids (fentanyl, heroin, oxycodone, pressed pills)',
    detail: 'Prioritizes buprenorphine, methadone, or naltrexone & naloxone access',
  },
  {
    id: 'alcohol',
    label: 'Alcohol',
    detail: 'Checks for seizure-safe withdrawal care & FDA-approved alcohol medications',
  },
  {
    id: 'benzos',
    label: 'Benzodiazepines or sedatives (Xanax, Klonopin, Valium, Ativan)',
    detail: 'Requires careful medical tapering to prevent withdrawal seizures',
  },
  {
    id: 'xylazine',
    label: 'Xylazine or medetomidine (“tranq” in dope or pills)',
    detail: 'Adds guidance for alpha-2 adrenergic withdrawal & specialized wound care',
  },
  {
    id: 'stimulants',
    label: 'Stimulants (methamphetamine, cocaine, crack)',
    detail: 'Includes Contingency Management & post-acute mood support',
  },
  {
    id: 'other',
    label: 'Other substances or unsure',
    detail: 'General substance use evaluation & support',
  },
];

const WITHDRAWAL_CHOICES = [
  {
    value: 'none',
    label: 'No withdrawal expected right now',
    detail: 'Not currently physically dependent, or already stable on medication',
  },
  {
    value: 'mild',
    label: 'Mild discomfort (early cravings, restlessness, trouble sleeping, mild anxiety)',
    detail: 'Usually manageable in outpatient or telehealth care',
  },
  {
    value: 'moderate',
    label: 'Moderate withdrawal (sweating, tremors/shakes, nausea, muscle aches, heavy daily use)',
    detail: 'Medical withdrawal support or rapid medication start strongly recommended',
  },
  {
    value: 'severe',
    label: 'Severe withdrawal risk (past withdrawal seizures or DTs, severe vomiting, confusion, or unable to keep fluids down)',
    detail: 'Requires 24-hour medically managed withdrawal care or hospital evaluation',
  },
];

const BIOMEDICAL_CHOICES = [
  {
    value: 'none',
    label: 'No urgent physical health conditions right now',
    detail: 'Standard medical screening',
  },
  {
    value: 'pregnant',
    label: 'Pregnant or recently postpartum',
    detail: 'Prioritizes specialized perinatal care (PW) & safe agonist maintenance (BU/OTP)',
  },
  {
    value: 'chronic',
    label: 'Ongoing medical condition (HIV, Hepatitis C, chronic pain, heart/liver/kidney disease)',
    detail: 'Coordinates primary care & testing alongside treatment',
  },
  {
    value: 'acute_infection',
    label: 'Fever, severe or necrotic skin wound (such as xylazine ulcer), chest pain, or possible serious infection',
    detail: 'Needs immediate medical / hospital evaluation alongside withdrawal relief',
  },
];

const MENTAL_HEALTH_CHOICES = [
  {
    value: 'none',
    label: 'Doing okay emotionally, or looking mainly for substance use care',
    detail: 'Standard counseling and peer support',
  },
  {
    value: 'mild_moderate',
    label: 'Depression, anxiety, bipolar disorder, ADHD, or other ongoing mental health needs',
    detail: 'Adds Co-occurring Mental Health & Substance Use programs (MHSU)',
  },
  {
    value: 'trauma',
    label: 'PTSD or history of trauma, abuse, or violence',
    detail: 'Adds Trauma-Informed Care programs (TRMA) focused on safety & empowerment',
  },
  {
    value: 'severe_crisis',
    label: 'In severe emotional distress, thoughts of self-harm, or feeling unsafe right now',
    detail: 'Highlights immediate 24/7 crisis support (988, walk-in & mobile crisis) + dual-diagnosis care',
  },
];

const ENVIRONMENT_CHOICES = [
  {
    value: 'supportive',
    label: 'Safe, stable place to live with supportive people (or safe living alone)',
    detail: 'Supports outpatient, telehealth, or day treatment',
  },
  {
    value: 'unstable',
    label: 'Living around heavy substance use, conflict, or unsafe conditions',
    detail: 'Considers structured day programs, residential care, or recovery housing',
  },
  {
    value: 'unhoused',
    label: 'Unhoused, staying in a shelter, couch-surfing, or at immediate risk of losing housing',
    detail: 'Prioritizes residential care (RES) and recovery housing (HH)',
  },
];

const STRUCTURE_CHOICES = [
  {
    value: 'flexible',
    label: 'Flexible outpatient visits (1–3 hours/week or medication visits around work/family)',
    detail: 'Maps to ASAM Level 1.0 / 1.5 Outpatient or Telehealth',
  },
  {
    value: 'structured_day',
    label: 'Structured multi-day support (9–20+ hours/week of group & medical care while living at home)',
    detail: 'Maps to ASAM Level 2.1 / 2.5 Intensive Outpatient (IOP) or Partial Hospitalization (PHP)',
  },
  {
    value: '24_hour',
    label: '24-hour live-in care (residential treatment or inpatient medical stabilization)',
    detail: 'Maps to ASAM Level 3.1–3.7 Residential or Level 3.7-WM / 4.0 Inpatient',
  },
];

export function careNavigatorView({ query } = {}) {
  // All clinical self-check state lives strictly in this closure in browser RAM.
  const answers = {
    substances: new Set(),
    withdrawalRisk: 'none',
    biomedical: 'none',
    mentalHealth: 'none',
    environment: 'supportive',
    structureNeeded: 'flexible',
    payment: query?.get('payment') ?? '',
    population: query?.get('population') ?? '',
    preferTelehealth: query?.get('tele') === '1',
  };

  const recommendationContainer = h('div', {
    id: 'asam-recommendation-card',
    'aria-live': 'polite',
  });

  function updateRecommendation(shouldAnnounce = false) {
    const result = evaluateAsamCare(answers);
    clear(recommendationContainer);

    const codeChips = h(
      'ul',
      { class: 'chips', 'aria-label': t('nav.results.codes_label', 'Recommended SAMHSA filter codes') },
      result.codes.map((code) => {
        const meta = CODE_META[code] ?? { label: code, tone: 'care' };
        return h('li', { class: `chip chip-${meta.tone}` }, `${meta.label} (${code})`);
      }),
    );

    const redFlagsBlock = result.redFlags.length
      ? h(
          'div',
          { class: 'callout callout-emergency', role: 'region', 'aria-label': t('nav.results.redflags_aria', 'Important medical safety alerts') },
          h(
            'p',
            { class: 'callout-title' },
            icon('alert'),
            t('nav.results.redflags_title', 'Important clinical safety guidance'),
          ),
          ul(result.redFlags),
          h(
            'p',
            { class: 'actions' },
            tel('911', [icon('phone'), t('nav.cta.call911', 'Call 911 for medical emergencies')], { class: 'btn btn-emergency btn-small' }),
            tel('988', [icon('phone'), t('nav.cta.call988', 'Call or text 988 Crisis Lifeline')], { class: 'btn btn-secondary btn-small' }),
            biomedicalNeedsHealthLink(answers.biomedical) &&
              h('a', { class: 'btn btn-secondary btn-small', href: '#/health' }, icon('heart'), t('nav.cta.find_health', 'Find low-cost medical / wound care')),
          ),
        )
      : null;

    const clinicalNotesBlock = result.clinicalNotes.length
      ? h(
          'div',
          { class: 'callout callout-info' },
          h(
            'p',
            { class: 'callout-title' },
            icon('info'),
            t('nav.results.notes_title', 'Physician notes for your care pathway'),
          ),
          ul(result.clinicalNotes),
        )
      : null;

    const breakdownList = h(
      'dl',
      { class: 'service-list' },
      result.dimensionBreakdown.flatMap((item) => [
        h('dt', null, `${item.dimension}: ${item.title}`),
        h('dd', null, item.finding),
      ]),
    );

    recommendationContainer.append(
      h(
        'div',
        { class: 'card' },
        h('p', { class: 'fine' }, t('nav.results.kicker', 'ASAM Criteria (4th Edition) Clinical Care Pathway')),
        h('h3', { id: 'recommendation-heading' }, `${result.asamLevel} — ${result.asamTitle}`),
        p(result.summary),
        redFlagsBlock,
        h('p', { class: 'label' }, t('nav.results.matched_filters', 'Matched SAMHSA treatment filters (max 8 to protect search breadth):')),
        codeChips,
        h(
          'div',
          { class: 'actions' },
          h(
            'a',
            { class: 'btn btn-primary btn-large', href: result.searchHref },
            icon('search'),
            t('nav.cta.search_matching', 'Search matching treatment near me'),
          ),
          h(
            'a',
            { class: 'btn btn-secondary', href: result.broadSearchHref },
            icon('compass'),
            t('nav.cta.search_broad', 'Broaden search ({codes})', { codes: result.broadCodes.join(', ') || 'All' }),
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-ghost',
              onclick: () => window.print(),
            },
            icon('printer'),
            t('nav.cta.print', 'Print clinical summary'),
          ),
        ),
        fine(
          t(
            'nav.results.samhsa_hint',
            'Tip: SAMHSA combines filters with AND. If “Search matching treatment near me” shows few results in a rural area, use “Broaden search” to search by your primary level of care first.',
          ),
        ),
        clinicalNotesBlock,
        h(
          'details',
          { class: 'facility-details' },
          h('summary', null, t('nav.results.breakdown_summary', 'View 6-Dimension ASAM clinical summary (for you or your clinician)')),
          breakdownList,
        ),
      ),
    );

    if (shouldAnnounce) {
      announce(
        t('nav.announce.updated', 'Updated recommendation: {level}', {
          level: `${result.asamLevel} ${result.asamTitle}`,
        }),
      );
    }
  }

  function biomedicalNeedsHealthLink(bio) {
    return bio === 'acute_infection' || bio === 'chronic' || bio === 'pregnant';
  }

  // Build interactive form controls
  const substanceCheckboxes = SUBSTANCE_CHOICES.map((choice) => {
    const input = h('input', {
      type: 'checkbox',
      name: 'substances',
      value: choice.id,
      checked: answers.substances.has(choice.id),
      onchange: () => {
        if (input.checked) answers.substances.add(choice.id);
        else answers.substances.delete(choice.id);
        updateRecommendation(true);
      },
    });
    return h(
      'label',
      { class: 'check' },
      input,
      h('span', null, t(`nav.sub.${choice.id}`, choice.label), h('small', null, t(`nav.sub.${choice.id}.detail`, choice.detail))),
    );
  });

  function buildRadioGroup(name, choices, currentKey) {
    return choices.map((choice) => {
      const input = h('input', {
        type: 'radio',
        name,
        value: choice.value,
        checked: answers[currentKey] === choice.value,
        onchange: () => {
          if (input.checked) {
            answers[currentKey] = choice.value;
            updateRecommendation(true);
          }
        },
      });
      return h(
        'label',
        { class: 'check' },
        input,
        h(
          'span',
          null,
          t(`nav.${name}.${choice.value}`, choice.label),
          choice.detail && h('small', null, t(`nav.${name}.${choice.value}.detail`, choice.detail)),
        ),
      );
    });
  }

  const withdrawalRadios = buildRadioGroup('withdrawalRisk', WITHDRAWAL_CHOICES, 'withdrawalRisk');
  const biomedicalRadios = buildRadioGroup('biomedical', BIOMEDICAL_CHOICES, 'biomedical');
  const mentalHealthRadios = buildRadioGroup('mentalHealth', MENTAL_HEALTH_CHOICES, 'mentalHealth');
  const environmentRadios = buildRadioGroup('environment', ENVIRONMENT_CHOICES, 'environment');
  const structureRadios = buildRadioGroup('structureNeeded', STRUCTURE_CHOICES, 'structureNeeded');

  const paymentSelect = h(
    'select',
    {
      class: 'select',
      id: 'nav-payment-select',
      onchange: (e) => {
        answers.payment = e.target.value;
        updateRecommendation(true);
      },
    },
    PAYMENT_OPTIONS.map((opt) =>
      h('option', { value: opt.code, selected: answers.payment === opt.code }, t(`nav.pay.${opt.code || 'any'}`, opt.label)),
    ),
  );

  const populationSelect = h(
    'select',
    {
      class: 'select',
      id: 'nav-population-select',
      onchange: (e) => {
        answers.population = e.target.value;
        updateRecommendation(true);
      },
    },
    POPULATION_OPTIONS.map((opt) =>
      h('option', { value: opt.code, selected: answers.population === opt.code }, t(`nav.pop.${opt.code || 'any'}`, opt.label)),
    ),
  );

  const telehealthCheckbox = h('input', {
    type: 'checkbox',
    id: 'nav-telehealth-check',
    checked: answers.preferTelehealth,
    onchange: () => {
      answers.preferTelehealth = telehealthCheckbox.checked;
      updateRecommendation(true);
    },
  });

  const resetBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-ghost btn-small',
      onclick: () => {
        answers.substances.clear();
        answers.withdrawalRisk = 'none';
        answers.biomedical = 'none';
        answers.mentalHealth = 'none';
        answers.environment = 'supportive';
        answers.structureNeeded = 'flexible';
        answers.payment = '';
        answers.population = '';
        answers.preferTelehealth = false;

        for (const lbl of substanceCheckboxes) {
          const inp = lbl.querySelector('input');
          if (inp) inp.checked = false;
        }
        const resetRadios = (labels, defaultVal) => {
          for (const lbl of labels) {
            const inp = lbl.querySelector('input');
            if (inp) inp.checked = inp.value === defaultVal;
          }
        };
        resetRadios(withdrawalRadios, 'none');
        resetRadios(biomedicalRadios, 'none');
        resetRadios(mentalHealthRadios, 'none');
        resetRadios(environmentRadios, 'supportive');
        resetRadios(structureRadios, 'flexible');
        paymentSelect.value = '';
        populationSelect.value = '';
        telehealthCheckbox.checked = false;
        updateRecommendation(true);
      },
    },
    icon('x'),
    t('nav.cta.reset', 'Reset all answers'),
  );

  // Initial render of the recommendation card
  updateRecommendation(false);

  return h(
    'div',
    { class: 'view view-prose' },
    pageHeader(
      t('nav.title', 'Clinical Care Navigator (ASAM 4th Edition Self-Check)'),
      t(
        'nav.lede',
        'Not sure whether you need detox, outpatient medication, intensive outpatient, or residential care? Answer as much or as little as you want to match your needs to official SAMHSA treatment filters.',
      ),
    ),

    // Zero-knowledge privacy banner
    h(
      'div',
      { class: 'callout callout-info', role: 'note' },
      h(
        'p',
        { class: 'callout-title' },
        icon('lock'),
        t('nav.privacy.title', '100% private, zero-knowledge clinical self-check'),
      ),
      p(
        t(
          'nav.privacy.body',
          'Answers stay in this tab’s memory only and are never sent to a server, saved to disk, or shared with anyone. Closing this tab or pressing Quick Exit erases everything immediately.',
        ),
      ),
    ),

    emergencyCallout(),

    // 6-Dimension Interactive Questionnaire
    section(
      'self-check',
      t('nav.form.heading', 'Step 1: Tell us what is going on right now'),
      h(
        'form',
        {
          class: 'card',
          onsubmit: (e) => e.preventDefault(),
        },
        h(
          'div',
          { class: 'actions' },
          fine(t('nav.form.instructions', 'Every question is optional. Your care recommendation below updates automatically as you choose.')),
          resetBtn,
        ),

        // Dimension 1A: Substances
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim1a.legend', 'Dimension 1A · Which substances are involved? (Select all that apply)')),
          h('p', { class: 'help' }, t('nav.dim1a.help', 'Different substances carry very different withdrawal risks and medication options.')),
          ...substanceCheckboxes,
        ),

        // Dimension 1B: Withdrawal Risk
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim1b.legend', 'Dimension 1B · What is your risk of withdrawal if you stop or cut back?')),
          h(
            'p',
            { class: 'help' },
            t('nav.dim1b.help', 'Daily heavy alcohol or benzodiazepine use, or past withdrawal seizures/delirium tremens, requires medical supervision.'),
          ),
          ...withdrawalRadios,
        ),

        // Dimension 2: Biomedical Conditions
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim2.legend', 'Dimension 2 · Physical health, pregnancy, or wound care needs')),
          h('p', { class: 'help' }, t('nav.dim2.help', 'Helps match programs with perinatal care, medical monitoring, or wound/infection treatment.')),
          ...biomedicalRadios,
        ),

        // Dimension 3: Emotional / Behavioral / Cognitive
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim3.legend', 'Dimension 3 · Mental health, emotional wellbeing, and trauma')),
          h('p', { class: 'help' }, t('nav.dim3.help', 'Co-occurring mental health and substance use care works best when both are treated together.')),
          ...mentalHealthRadios,
        ),

        // Dimension 4: Structure Needed
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim4.legend', 'Dimension 4 · How much daily structure feels right to stay safe?')),
          h('p', { class: 'help' }, t('nav.dim4.help', 'You can start with flexible outpatient care or choose more intensive daily or live-in support.')),
          ...structureRadios,
        ),

        // Dimension 5: Recovery Environment
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim5.legend', 'Dimension 5 · What is your current living situation and environment like?')),
          h('p', { class: 'help' }, t('nav.dim5.help', 'Identifies when recovery housing or residential stability could help protect your recovery.')),
          ...environmentRadios,
        ),

        // Dimension 6: Person-Centered & Practical Access
        h(
          'fieldset',
          { class: 'filter-group' },
          h('legend', null, t('nav.dim6.legend', 'Dimension 6 · Insurance, payment, telehealth, and community preferences')),
          h('p', { class: 'help' }, t('nav.dim6.help', 'Optional filters to narrow listings to places that fit your coverage and life.')),
          h(
            'div',
            { class: 'location-row' },
            h(
              'div',
              null,
              h('label', { class: 'label', for: 'nav-payment-select' }, t('nav.dim6.payment_label', 'Cost & insurance')),
              paymentSelect,
            ),
            h(
              'div',
              null,
              h('label', { class: 'label', for: 'nav-population-select' }, t('nav.dim6.population_label', 'Dedicated program for')),
              populationSelect,
            ),
          ),
          h(
            'label',
            { class: 'check' },
            telehealthCheckbox,
            h(
              'span',
              null,
              t('nav.dim6.telehealth', 'Prefer telehealth / phone or video visits (code TELE)'),
              h('small', null, t('nav.dim6.telehealth_detail', 'Buprenorphine and outpatient counseling can often be started by phone or video.')),
            ),
          ),
        ),
      ),
    ),

    // Live Clinical Recommendation Output
    section(
      'recommendation',
      t('nav.results.heading', 'Step 2: Your Personalized Clinical Care Pathway'),
      recommendationContainer,
    ),

    // MD-authored Know Your Rights: Hospital & Emergency Bridge Care
    section(
      'emergency-bridge-rights',
      t('nav.rights.heading', 'Hospital & Emergency Bridge Care (Know Your Rights)'),
      p(
        t(
          'nav.rights.intro',
          'If you are in acute withdrawal, pregnant, or dealing with a serious infection, federal laws protect your right to receive stabilizing medical treatment:',
        ),
      ),
      ul([
        [
          strong(t('nav.rights.emtala.title', 'EMTALA (Emergency Medical Treatment and Labor Act): ')),
          t(
            'nav.rights.emtala.body',
            'Any hospital with an emergency department that accepts Medicare must provide a medical screening exam and stabilizing treatment for emergency medical conditions—including life-threatening alcohol or sedative withdrawal, severe dehydration, overdose, active labor, or serious infections—regardless of your insurance status, citizenship, or ability to pay.',
          ),
        ],
        [
          strong(t('nav.rights.dea72.title', 'The DEA 72-Hour Rule (21 CFR § 1306.07(b)): ')),
          t(
            'nav.rights.dea72.body',
            'Federal law allows physicians and authorized hospital/emergency clinicians to administer or dispense up to 72 hours (3 days) of buprenorphine or methadone to relieve acute opioid withdrawal while arranging ongoing treatment—even if the hospital is not an Opioid Treatment Program (OTP). Under the Medication Access and Training Expansion (MATE) and X-waiver elimination, any practitioner with a standard DEA Schedule III registration can also prescribe buprenorphine for home use.',
          ),
        ],
        [
          strong(t('nav.rights.perinatal.title', 'Perinatal Substance Use & Standard of Care (ACOG / ASAM): ')),
          t(
            'nav.rights.perinatal.body',
            'For pregnant people with opioid use disorder, the American College of Obstetricians and Gynecologists (ACOG) and ASAM recommend agonist pharmacotherapy (buprenorphine or methadone) as the gold standard of care. Abrupt withdrawal carries significant risks to the fetus. Federal CAPTA guidelines call for supportive Plans of Safe Care that connect families with health and recovery services.',
          ),
        ],
        [
          strong(t('nav.rights.privacy.title', '42 CFR Part 2 Confidentiality & Non-Discrimination (ADA): ')),
          t(
            'nav.rights.privacy.body',
            'Federal law (42 CFR Part 2) strictly protects substance use disorder treatment records from being shared with law enforcement, employers, or courts without your written consent or a specialized court order. In addition, the Americans with Disabilities Act (ADA) protects people taking prescribed buprenorphine or methadone from being denied admission to skilled nursing facilities, hospitals, or many recovery programs solely because of their medication.',
          ),
        ],
      ]),
      p(
        h('a', { class: 'btn btn-secondary', href: '#/choosing-care' }, icon('check-circle'), t('nav.rights.choosing_link', 'Questions to ask & red flags for treatment scams')),
        ' ',
        h('a', { class: 'btn btn-secondary', href: '#/harm-reduction' }, icon('shield'), t('nav.rights.harm_link', 'Harm reduction, naloxone & wound care guide')),
      ),
    ),
  );
}

export const navigatorView = careNavigatorView;
export default careNavigatorView;
