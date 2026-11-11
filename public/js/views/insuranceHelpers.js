// Ephemeral in-RAM Insurance, Parity (MHPAEA), EKRA Anti-Brokering & Safety-Net
// Compatibility Engine.
//
// Coverage selections stay in browser memory only: they are not written to
// localStorage, sessionStorage, cookies, or the URL address bar, and are
// cleared immediately by resetInsuranceState() on Quick exit (Esc x2).

import { t } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetInsuranceState);

export const INSURANCE_TIERS = {
  EMTALA_PROTECTED: {
    id: 'EMTALA_PROTECTED',
    rank: 1,
    tone: 'warn',
    get label() {
      return t('ins.tier.emtala', 'EMTALA Emergency & DEA 72-Hour Protected');
    },
  },
  CONFIRMED_MATCH: {
    id: 'CONFIRMED_MATCH',
    rank: 2,
    tone: 'pay',
    get label() {
      return t('ins.tier.confirmed', 'Accepted Coverage / Safety-Net Match');
    },
  },
  VERIFY_NETWORK: {
    id: 'VERIFY_NETWORK',
    rank: 3,
    tone: 'care',
    get label() {
      return t('ins.tier.verify', 'Private Insurance Listed — Verify Network & Parity');
    },
  },
  SAFETY_NET_FALLBACK: {
    id: 'SAFETY_NET_FALLBACK',
    rank: 4,
    tone: 'extra',
    get label() {
      return t('ins.tier.fallback', 'Sliding Fee Scale / Payment Assistance Available');
    },
  },
  UNVERIFIED_OR_MISMATCH: {
    id: 'UNVERIFIED_OR_MISMATCH',
    rank: 5,
    tone: 'neutral',
    get label() {
      return t('ins.tier.unverified', 'Coverage Not Listed — Call to Confirm');
    },
  },
};

export const COVERAGE_OPTIONS = [
  {
    id: 'any',
    value: 'any',
    codes: [],
    providerTypes: [],
    get label() {
      return t('ins.cov.any', 'All coverage types');
    },
    get summary() {
      return t(
        'ins.cov.any.summary',
        'Showing all state-licensed and federal safety-net providers. Pick a coverage option to highlight matching programs in your browser’s memory.',
      );
    },
  },
  {
    id: 'medicaid',
    value: 'medicaid',
    codes: ['MD'],
    providerTypes: ['rhc'],
    get label() {
      return t('ins.cov.medicaid', 'Medicaid');
    },
    get summary() {
      return t(
        'ins.cov.medicaid.summary',
        'Highlights programs that accept Medicaid (SAMHSA code MD) and CMS-certified Rural Health Clinics. State Medicaid plans cover FDA-approved medications (buprenorphine, methadone, naltrexone) and substance use counseling.',
      );
    },
  },
  {
    id: 'medicare',
    value: 'medicare',
    codes: ['MC'],
    providerTypes: ['rhc'],
    get label() {
      return t('ins.cov.medicare', 'Medicare');
    },
    get summary() {
      return t(
        'ins.cov.medicare.summary',
        'Highlights programs that accept Medicare (SAMHSA code MC) and CMS Rural Health Clinics, including Medicare Part B/D coverage for Opioid Treatment Programs (OTPs) and office-based buprenorphine.',
      );
    },
  },
  {
    id: 'private',
    value: 'private',
    codes: ['PI'],
    providerTypes: [],
    get label() {
      return t('ins.cov.private', 'Private insurance');
    },
    get summary() {
      return t(
        'ins.cov.private.summary',
        'Flags programs listing private insurance (code PI) as “Verify Network & Parity.” Federal directories only record whether any private plan is accepted—always verify in-network status for your specific plan and know your MHPAEA parity rights.',
      );
    },
  },
  {
    id: 'tricare_va',
    value: 'tricare_va',
    codes: ['TRICARE', 'MI'],
    providerTypes: ['va'],
    get label() {
      return t('ins.cov.tricare_va', 'TRICARE / VA');
    },
    get summary() {
      return t(
        'ins.cov.tricare_va.summary',
        'Highlights VA Medical Centers, VA outpatient clinics, confidential Vet Centers, and community programs accepting TRICARE or military insurance (codes TRICARE, MI).',
      );
    },
  },
  {
    id: 'ihs_tribal',
    value: 'ihs_tribal',
    codes: ['ITU'],
    providerTypes: ['ihs'],
    get label() {
      return t('ins.cov.ihs_tribal', 'IHS / Tribal');
    },
    get summary() {
      return t(
        'ins.cov.ihs_tribal.summary',
        'Highlights Indian Health Service (IHS), Tribal (638), and Urban Indian health programs and treatment facilities accepting ITU funds (code ITU).',
      );
    },
  },
  {
    id: 'uninsured',
    value: 'uninsured',
    codes: ['SS', 'SF', 'PA', 'NP', 'SAMF'],
    providerTypes: ['hrsa', 'health-center'],
    get label() {
      return t('ins.cov.uninsured', 'Uninsured / Sliding scale');
    },
    get summary() {
      return t(
        'ins.cov.uninsured.summary',
        'Highlights HRSA Health Centers (which serve everyone regardless of insurance or ID on an income-based sliding scale) and treatment programs offering sliding fee scales (SS), payment assistance (PA), free care (NP), or SAMHSA block grant funding (SAMF).',
      );
    },
  },
];

const COVERAGE_ALIASES = {
  any: 'any',
  all: 'any',
  medicaid: 'medicaid',
  md: 'medicaid',
  medicare: 'medicare',
  mc: 'medicare',
  private: 'private',
  pi: 'private',
  commercial: 'private',
  tricare_va: 'tricare_va',
  tricare: 'tricare_va',
  mi: 'tricare_va',
  va: 'tricare_va',
  military: 'tricare_va',
  ihs_tribal: 'ihs_tribal',
  ihs: 'ihs_tribal',
  itu: 'ihs_tribal',
  tribal: 'ihs_tribal',
  uninsured: 'uninsured',
  ss: 'uninsured',
  sf: 'uninsured',
  pa: 'uninsured',
  np: 'uninsured',
  samf: 'uninsured',
  hrsa: 'uninsured',
  sliding: 'uninsured',
};

export function normalizeCoverageSelection(selection) {
  const key = String(selection ?? 'any').trim().toLowerCase();
  return Object.hasOwn(COVERAGE_ALIASES, key) ? COVERAGE_ALIASES[key] : 'any';
}

export function getCoverageOption(selection) {
  const norm = normalizeCoverageSelection(selection);
  return COVERAGE_OPTIONS.find((o) => o.id === norm) ?? COVERAGE_OPTIONS[0];
}

// ---------------------------------------------------------------- Ephemeral in-RAM state
const DEFAULT_INSURANCE_STATE = Object.freeze({
  selectedCoverage: 'any',
  emergencyFlag: false,
  stateCode: null,
});

const ramState = {
  selectedCoverage: DEFAULT_INSURANCE_STATE.selectedCoverage,
  emergencyFlag: DEFAULT_INSURANCE_STATE.emergencyFlag,
  stateCode: DEFAULT_INSURANCE_STATE.stateCode,
};

const listeners = new Set();

function emitInsuranceState() {
  const snapshot = getInsuranceState();
  for (const fn of listeners) {
    fn(snapshot);
  }
}

export function getInsuranceState() {
  return {
    selectedCoverage: ramState.selectedCoverage,
    emergencyFlag: ramState.emergencyFlag,
    stateCode: ramState.stateCode,
  };
}

export function setInsuranceState(patch = {}) {
  if (!patch || typeof patch !== 'object') return getInsuranceState();

  if (patch.selectedCoverage !== undefined || patch.coverage !== undefined) {
    ramState.selectedCoverage = normalizeCoverageSelection(patch.selectedCoverage ?? patch.coverage);
  }
  if (patch.emergencyFlag !== undefined || patch.emergency !== undefined) {
    ramState.emergencyFlag = Boolean(patch.emergencyFlag ?? patch.emergency);
  }
  if (patch.stateCode !== undefined || patch.state !== undefined) {
    const rawState = patch.stateCode ?? patch.state;
    const clean = rawState ? String(rawState).trim().toUpperCase() : '';
    ramState.stateCode = /^[A-Z]{2}$/.test(clean) ? clean : null;
  }

  emitInsuranceState();
  return getInsuranceState();
}

export function subscribeInsuranceState(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetInsuranceState() {
  ramState.selectedCoverage = DEFAULT_INSURANCE_STATE.selectedCoverage;
  ramState.emergencyFlag = DEFAULT_INSURANCE_STATE.emergencyFlag;
  ramState.stateCode = DEFAULT_INSURANCE_STATE.stateCode;
  emitInsuranceState();
  return getInsuranceState();
}

// ---------------------------------------------------------------- Verification Script Builder
export function buildVerificationScript(coverageSelection = 'private', facility = null) {
  const norm = normalizeCoverageSelection(coverageSelection);
  const option = getCoverageOption(norm);
  const facilityName = facility?.name ? String(facility.name).trim() : null;

  const title = facilityName
    ? t(
      'ins.script.titleFor',
      'Insurance, MHPAEA Parity & Anti-Brokering Verification Checklist for {name}',
      { name: facilityName },
    )
    : t(
      'ins.script.title',
      'Insurance, MHPAEA Parity & Anti-Brokering Verification Checklist',
    );

  const insurerQuestions = [
    t(
      'ins.script.insurer.q1',
      'Is this specific facility (ask admissions for their 10-digit Organizational NPI and Tax ID) contracted IN-NETWORK with my exact plan, or would claims be processed out-of-network?',
    ),
    t(
      'ins.script.insurer.q2',
      'Does my plan require prior authorization for this level of care (Outpatient, Intensive Outpatient/IOP, Residential, or Medical Detox) or for FDA-approved medications (buprenorphine, Sublocade, methadone, or naltrexone)?',
    ),
    t(
      'ins.script.insurer.q3',
      'What are my exact in-network copay, coinsurance, remaining deductible, and out-of-pocket maximum for substance use disorder treatment?',
    ),
    t(
      'ins.script.insurer.q4',
      'If there is no in-network program with an open bed or timely appointment within a reasonable distance, how do I request an In-Network Exception / Single-Case Agreement (SCA)?',
    ),
  ];

  const admissionsQuestions = [
    t(
      'ins.script.adm.q1',
      'What is the licensed legal name, physical street address, state license number, and billing NPI / Tax ID of the facility where I will actually receive care?',
    ),
    t(
      'ins.script.adm.q2',
      'Do you have a signed, in-network contract with my specific insurance plan (not just “we accept or bill all private insurance out-of-network”)? Will you give me a written good-faith cost estimate before admission?',
    ),
    t(
      'ins.script.adm.q3',
      'Do you offer and continue FDA-approved medications for opioid and alcohol use disorder (buprenorphine, methadone, naltrexone) on site without pressuring patients to taper off?',
    ),
    t(
      'ins.script.adm.q4',
      'If my insurer authorizes only a few days at a time (concurrent review), how does your clinical team handle peer-to-peer medical necessity reviews, and will you protect me from surprise balance billing?',
    ),
  ];

  if (norm === 'medicaid') {
    admissionsQuestions.push(
      t(
        'ins.script.adm.medicaid',
        'Are you enrolled with my specific state Medicaid Managed Care Organization (MCO), and are there any co-payments or prior authorization steps for starting medication today?',
      ),
    );
  } else if (norm === 'medicare') {
    admissionsQuestions.push(
      t(
        'ins.script.adm.medicare',
        'Are you certified to bill Medicare Part B/D (including the Medicare Opioid Treatment Program bundle for methadone or buprenorphine)?',
      ),
    );
  } else if (norm === 'uninsured') {
    admissionsQuestions.push(
      t(
        'ins.script.adm.uninsured',
        'Can I apply for your income-based sliding fee scale (SS), state block-grant funding (SAMF), or charity payment assistance (PA) today, even if I do not have tax returns or a photo ID with me?',
      ),
    );
  }

  const parityRights = [
    t(
      'ins.script.parity.1',
      'Equal Financial Rules (MHPAEA): Under the federal Mental Health Parity and Addiction Equity Act (MHPAEA), most employer, marketplace, and Medicaid managed care plans cannot charge higher copays, deductibles, or coinsurance for substance use disorder and mental health care than for comparable medical or surgical care.',
    ),
    t(
      'ins.script.parity.2',
      'Protection Against Unfair Prior Authorization & “Fail-First” Rules: Under MHPAEA, insurers cannot impose stricter prior authorization, “fail-first” (step-therapy) requirements, or arbitrary visit/day limits on addiction treatment or medications (MOUD) than they apply to medical conditions.',
    ),
    t(
      'ins.script.parity.3',
      'Right to Written Criteria & Urgent Appeal: If an insurer denies or cuts short a recommended ASAM level of care, you have the legal right to demand their written medical necessity criteria free of charge and file an expedited (72-hour) internal and external parity appeal.',
    ),
  ];

  const ekraRedFlags = [
    t(
      'ins.script.ekra.1',
      'Federal Anti-Kickback Law (EKRA, 18 U.S.C. § 220): Paying or receiving kickbacks to refer patients to recovery homes, treatment facilities, or clinical laboratories is a federal felony under the Eliminating Kickbacks in Recovery Act (18 U.S.C. § 220).',
    ),
    t(
      'ins.script.ekra.2',
      'Illegal Inducements: Never trust any marketer, call center, or sober home that offers free airfare, paid travel, cash, gift cards, free rent, or routinely waived out-of-network deductibles to get you to enroll.',
    ),
    t(
      'ins.script.ekra.3',
      '“We Take All Insurance” Bait-and-Switch: Beware of lead-generation helplines that claim your private plan “covers 100% of everything” without verifying an in-network contract—this is a common out-of-network patient-brokering trap.',
    ),
    t(
      'ins.script.ekra.4',
      'Hidden Identity or High-Pressure Sales: Hang up if a recruiter pressures you to travel immediately, asks mostly about your insurance policy number instead of your medical needs, or refuses to give the facility’s exact name, street address, and NPI.',
    ),
  ];

  const emergencyRights = t(
    'ins.script.emergency',
    'Emergency & Acute Withdrawal Rights: Under EMTALA (42 U.S.C. § 1395dd), hospital emergency rooms must screen and stabilize emergency medical conditions (including life-threatening alcohol/sedative withdrawal or overdose) regardless of insurance or ability to pay. Under the DEA 72-Hour Rule (21 CFR § 1306.07(b)), hospital and emergency practitioners may administer or dispense up to 72 hours of buprenorphine or methadone to relieve acute opioid withdrawal.',
  );

  const questions = [...insurerQuestions, ...admissionsQuestions];

  const lines = [
    title.toUpperCase(),
    `${t('ins.script.selectedLabel', 'Selected Coverage Profile')}: ${option.label}`,
    facilityName ? `${t('ins.script.facilityLabel', 'Facility')}: ${facilityName}` : null,
    '',
    t('ins.script.sec.insurer', '1. QUESTIONS TO ASK YOUR INSURANCE PLAN (CALL THE NUMBER ON THE BACK OF YOUR CARD)'),
    ...insurerQuestions.map((q, i) => `   ${i + 1}. ${q}`),
    '',
    t('ins.script.sec.admissions', '2. QUESTIONS TO ASK THE FACILITY ADMISSIONS & BILLING OFFICE'),
    ...admissionsQuestions.map((q, i) => `   ${i + 1}. ${q}`),
    '',
    t('ins.script.sec.parity', '3. YOUR FEDERAL INSURANCE PARITY RIGHTS (MHPAEA)'),
    ...parityRights.map((r) => `   • ${r}`),
    '',
    t('ins.script.sec.ekra', '4. ANTI-PATIENT-BROKERING & SCAM RED FLAGS (EKRA, 18 U.S.C. § 220)'),
    ...ekraRedFlags.map((f) => `   • ${f}`),
    '',
    t('ins.script.sec.emergency', '5. EMERGENCY SCREENING & ACUTE WITHDRAWAL RIGHTS (EMTALA & DEA 72-HOUR RULE)'),
    `   • ${emergencyRights}`,
  ].filter((line) => line !== null);

  const fullText = lines.join('\n');

  return {
    coverageSelection: norm,
    coverageLabel: option.label,
    facilityName,
    title,
    insurerQuestions,
    admissionsQuestions,
    questions,
    parityRights,
    ekraRedFlags,
    redFlags: ekraRedFlags,
    emergencyRights,
    fullText,
    text: fullText,
    toString() {
      return fullText;
    },
  };
}

// ---------------------------------------------------------------- Facility Coverage Evaluator
const SAFETY_NET_CODES = ['SS', 'SF', 'PA', 'NP', 'SAMF'];
const ALL_PAYMENT_CODES = ['MD', 'MC', 'PI', 'MI', 'TRICARE', 'ITU', 'PA', 'SF', 'SS', 'NP', 'SAMF', 'SI'];

export function evaluateFacilityCoverage(facility, coverageSelection = 'any', { emergency = false } = {}) {
  const f = facility && typeof facility === 'object' ? facility : {};
  const rawCodes = Array.isArray(f.codes) ? f.codes : [];
  const codeSet = new Set(rawCodes.map((c) => String(c).trim().toUpperCase()));

  const net = String(f.providerType || f.type || '').trim().toLowerCase();
  const kind = String(f.kind || '').trim().toLowerCase();

  const isEr = net === 'er';
  const isVa = net === 'va';
  const isIhs = net === 'ihs';
  const isRhc = net === 'rhc';
  const isHealthCenter = kind === 'health-center' || net === 'hrsa' || net === 'fqhc' || net === 'health-center';

  const norm = normalizeCoverageSelection(coverageSelection);
  const safetyNetCodes = SAFETY_NET_CODES.filter((c) => codeSet.has(c));
  const hasSafetyNet = safetyNetCodes.length > 0 || isHealthCenter;

  // 1. EMTALA Emergency & DEA 72-Hour Rule Protected
  // A detox or inpatient service code alone does not establish an emergency
  // department. Never promise EMTALA protections at a standalone program.
  // https://www.cms.gov/Priorities/your-patient-rights/emergency-room-rights
  if (isEr || f.hasEmergencyDepartment === true) {
    const matchedCodes = ['HI', 'DT'].filter((c) => codeSet.has(c));
    const explanation = t(
      'ins.eval.emtala',
      'Protected by EMTALA (42 U.S.C. § 1395dd), which requires hospital emergency departments to provide a medical screening exam and stabilizing care for acute withdrawal or medical emergencies regardless of insurance or ability to pay, and the DEA 72-Hour Rule (21 CFR § 1306.07(b)), which allows immediate administration of buprenorphine or methadone for acute opioid withdrawal.',
    );
    return {
      ...INSURANCE_TIERS.EMTALA_PROTECTED,
      id: INSURANCE_TIERS.EMTALA_PROTECTED.id,
      tier: INSURANCE_TIERS.EMTALA_PROTECTED.id,
      label: INSURANCE_TIERS.EMTALA_PROTECTED.label,
      coverageSelection: norm,
      emergency: Boolean(emergency),
      matchedCodes,
      safetyNetCodes,
      explanation,
      detail: explanation,
      summary: explanation,
      rights: [
        t(
          'ins.eval.emtala.right1',
          'EMTALA (42 U.S.C. § 1395dd): Emergency screening and stabilization required regardless of insurance status or ability to pay.',
        ),
        t(
          'ins.eval.emtala.right2',
          'DEA 72-Hour Rule (21 CFR § 1306.07(b)): Hospital/ER practitioners may administer up to 72 hours of buprenorphine or methadone for acute opioid withdrawal.',
        ),
      ],
      warnings: [],
      verificationScript: buildVerificationScript(norm, f),
    };
  }

  // 2. Private insurance selected -> VERIFY_NETWORK when PI is listed
  if (norm === 'private') {
    if (codeSet.has('PI')) {
      const script = buildVerificationScript('private', f);
      const explanation = t(
        'ins.eval.verifyPrivate',
        'Lists Private Insurance (SAMHSA code PI). Because federal directories do not track individual plan networks, verify that this facility’s NPI is contracted in-network with your plan. Under the Mental Health Parity and Addiction Equity Act (MHPAEA), your plan cannot impose stricter copays or prior authorization rules on addiction care than on medical care. Watch for EKRA (18 U.S.C. § 220) patient-brokering red flags.',
      );
      return {
        ...INSURANCE_TIERS.VERIFY_NETWORK,
        id: INSURANCE_TIERS.VERIFY_NETWORK.id,
        tier: INSURANCE_TIERS.VERIFY_NETWORK.id,
        label: INSURANCE_TIERS.VERIFY_NETWORK.label,
        coverageSelection: norm,
        emergency: Boolean(emergency),
        matchedCodes: ['PI'],
        safetyNetCodes,
        explanation,
        detail: explanation,
        summary: explanation,
        rights: script.parityRights,
        warnings: script.ekraRedFlags,
        verificationScript: script,
      };
    }
    if (hasSafetyNet) {
      const explanation = t(
        'ins.eval.fallbackFromPrivate',
        'Private insurance (PI) is not listed, but this provider offers a sliding fee scale, payment assistance, or HRSA safety-net care.',
      );
      return {
        ...INSURANCE_TIERS.SAFETY_NET_FALLBACK,
        id: INSURANCE_TIERS.SAFETY_NET_FALLBACK.id,
        tier: INSURANCE_TIERS.SAFETY_NET_FALLBACK.id,
        label: INSURANCE_TIERS.SAFETY_NET_FALLBACK.label,
        coverageSelection: norm,
        emergency: Boolean(emergency),
        matchedCodes: [],
        safetyNetCodes,
        explanation,
        detail: explanation,
        summary: explanation,
        rights: [],
        warnings: [],
        verificationScript: buildVerificationScript(norm, f),
      };
    }
    const explanation = t(
      'ins.eval.unverifiedPrivate',
      'Private insurance (PI) is not listed in the directory for this facility. Call admissions to confirm accepted plans and out-of-pocket costs.',
    );
    return {
      ...INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH,
      id: INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH.id,
      tier: INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH.id,
      label: INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH.label,
      coverageSelection: norm,
      emergency: Boolean(emergency),
      matchedCodes: [],
      safetyNetCodes: [],
      explanation,
      detail: explanation,
      summary: explanation,
      rights: [],
      warnings: [],
      verificationScript: buildVerificationScript(norm, f),
    };
  }

  // 3. Direct coverage matches for Medicaid, Medicare, TRICARE/VA, IHS/Tribal, Uninsured
  if (norm === 'medicaid' && (codeSet.has('MD') || isRhc)) {
    const matchedCodes = codeSet.has('MD') ? ['MD'] : ['RHC'];
    const explanation = t(
      'ins.eval.matchMedicaid',
      'Matches Medicaid coverage (SAMHSA code MD or CMS-certified Rural Health Clinic). Call to confirm they accept your specific state Medicaid Managed Care plan.',
    );
    return {
      ...INSURANCE_TIERS.CONFIRMED_MATCH,
      id: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      tier: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      label: INSURANCE_TIERS.CONFIRMED_MATCH.label,
      coverageSelection: norm,
      emergency: Boolean(emergency),
      matchedCodes,
      safetyNetCodes,
      explanation,
      detail: explanation,
      summary: explanation,
      rights: [],
      warnings: [],
      verificationScript: buildVerificationScript(norm, f),
    };
  }

  if (norm === 'medicare' && (codeSet.has('MC') || isRhc)) {
    const matchedCodes = codeSet.has('MC') ? ['MC'] : ['RHC'];
    const explanation = t(
      'ins.eval.matchMedicare',
      'Matches Medicare coverage (SAMHSA code MC or CMS-certified Rural Health Clinic). Call to confirm Medicare Part B/D billing for your service.',
    );
    return {
      ...INSURANCE_TIERS.CONFIRMED_MATCH,
      id: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      tier: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      label: INSURANCE_TIERS.CONFIRMED_MATCH.label,
      coverageSelection: norm,
      emergency: Boolean(emergency),
      matchedCodes,
      safetyNetCodes,
      explanation,
      detail: explanation,
      summary: explanation,
      rights: [],
      warnings: [],
      verificationScript: buildVerificationScript(norm, f),
    };
  }

  if (norm === 'tricare_va' && (codeSet.has('TRICARE') || codeSet.has('MI') || isVa)) {
    const matchedCodes = ['TRICARE', 'MI'].filter((c) => codeSet.has(c));
    if (isVa && !matchedCodes.length) matchedCodes.push('VA');
    const explanation = t(
      'ins.eval.matchTricareVa',
      'Matches veteran or military coverage (VA health facility, Vet Center, or SAMHSA TRICARE / military insurance code).',
    );
    return {
      ...INSURANCE_TIERS.CONFIRMED_MATCH,
      id: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      tier: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      label: INSURANCE_TIERS.CONFIRMED_MATCH.label,
      coverageSelection: norm,
      emergency: Boolean(emergency),
      matchedCodes,
      safetyNetCodes,
      explanation,
      detail: explanation,
      summary: explanation,
      rights: [],
      warnings: [],
      verificationScript: buildVerificationScript(norm, f),
    };
  }

  if (norm === 'ihs_tribal' && (codeSet.has('ITU') || isIhs)) {
    const matchedCodes = codeSet.has('ITU') ? ['ITU'] : ['IHS'];
    const explanation = t(
      'ins.eval.matchIhs',
      'Matches Indian Health Service (IHS), Tribal (638), or Urban Indian health coverage (SAMHSA code ITU or IHS facility).',
    );
    return {
      ...INSURANCE_TIERS.CONFIRMED_MATCH,
      id: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      tier: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      label: INSURANCE_TIERS.CONFIRMED_MATCH.label,
      coverageSelection: norm,
      emergency: Boolean(emergency),
      matchedCodes,
      safetyNetCodes,
      explanation,
      detail: explanation,
      summary: explanation,
      rights: [],
      warnings: [],
      verificationScript: buildVerificationScript(norm, f),
    };
  }

  if (norm === 'uninsured' && hasSafetyNet) {
    const matchedCodes = [...safetyNetCodes];
    if (isHealthCenter && !matchedCodes.length) matchedCodes.push('HRSA');
    const explanation = t(
      'ins.eval.matchUninsured',
      'Matches safety-net & uninsured care options: offers an income-based sliding fee scale (SS), payment assistance (PA), free care (NP), SAMHSA block grant funding (SAMF), or HRSA Health Center care.',
    );
    return {
      ...INSURANCE_TIERS.CONFIRMED_MATCH,
      id: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      tier: INSURANCE_TIERS.CONFIRMED_MATCH.id,
      label: INSURANCE_TIERS.CONFIRMED_MATCH.label,
      coverageSelection: norm,
      emergency: Boolean(emergency),
      matchedCodes,
      safetyNetCodes,
      explanation,
      detail: explanation,
      summary: explanation,
      rights: [],
      warnings: [],
      verificationScript: buildVerificationScript(norm, f),
    };
  }

  // Handle 'any' coverage selection
  if (norm === 'any') {
    const listedPay = ALL_PAYMENT_CODES.filter((c) => codeSet.has(c));
    if (
      codeSet.has('MD')
      || codeSet.has('MC')
      || codeSet.has('TRICARE')
      || codeSet.has('MI')
      || codeSet.has('ITU')
      || codeSet.has('SI')
      || isVa
      || isIhs
      || isRhc
      || isHealthCenter
    ) {
      const explanation = t(
        'ins.eval.anyConfirmed',
        'Accepts public insurance (Medicaid, Medicare, TRICARE/VA, or IHS/Tribal) or operates as a federal safety-net provider.',
      );
      return {
        ...INSURANCE_TIERS.CONFIRMED_MATCH,
        id: INSURANCE_TIERS.CONFIRMED_MATCH.id,
        tier: INSURANCE_TIERS.CONFIRMED_MATCH.id,
        label: INSURANCE_TIERS.CONFIRMED_MATCH.label,
        coverageSelection: norm,
        emergency: Boolean(emergency),
        matchedCodes: listedPay,
        safetyNetCodes,
        explanation,
        detail: explanation,
        summary: explanation,
        rights: [],
        warnings: [],
        verificationScript: buildVerificationScript('private', f),
      };
    }
    if (codeSet.has('PI')) {
      const script = buildVerificationScript('private', f);
      const explanation = t(
        'ins.eval.verifyPrivate',
        'Lists Private Insurance (SAMHSA code PI). Because federal directories do not track individual plan networks, verify that this facility’s NPI is contracted in-network with your plan. Under the Mental Health Parity and Addiction Equity Act (MHPAEA), your plan cannot impose stricter copays or prior authorization rules on addiction care than on medical care. Watch for EKRA (18 U.S.C. § 220) patient-brokering red flags.',
      );
      return {
        ...INSURANCE_TIERS.VERIFY_NETWORK,
        id: INSURANCE_TIERS.VERIFY_NETWORK.id,
        tier: INSURANCE_TIERS.VERIFY_NETWORK.id,
        label: INSURANCE_TIERS.VERIFY_NETWORK.label,
        coverageSelection: norm,
        emergency: Boolean(emergency),
        matchedCodes: ['PI'],
        safetyNetCodes,
        explanation,
        detail: explanation,
        summary: explanation,
        rights: script.parityRights,
        warnings: script.ekraRedFlags,
        verificationScript: script,
      };
    }
    if (hasSafetyNet) {
      const explanation = t(
        'ins.eval.anyFallback',
        'Offers a sliding fee scale (SS), payment assistance (PA), or free care (NP) for uninsured or underinsured visitors.',
      );
      return {
        ...INSURANCE_TIERS.SAFETY_NET_FALLBACK,
        id: INSURANCE_TIERS.SAFETY_NET_FALLBACK.id,
        tier: INSURANCE_TIERS.SAFETY_NET_FALLBACK.id,
        label: INSURANCE_TIERS.SAFETY_NET_FALLBACK.label,
        coverageSelection: norm,
        emergency: Boolean(emergency),
        matchedCodes: safetyNetCodes,
        safetyNetCodes,
        explanation,
        detail: explanation,
        summary: explanation,
        rights: [],
        warnings: [],
        verificationScript: buildVerificationScript('uninsured', f),
      };
    }
  }

  // 4. Safety-net fallback when primary coverage is not listed
  if (hasSafetyNet) {
    const explanation = t(
      'ins.eval.fallbackGeneric',
      'Your selected coverage is not listed, but this facility offers a sliding fee scale (SS), payment assistance (PA), free care (NP), or HRSA safety-net services.',
    );
    return {
      ...INSURANCE_TIERS.SAFETY_NET_FALLBACK,
      id: INSURANCE_TIERS.SAFETY_NET_FALLBACK.id,
      tier: INSURANCE_TIERS.SAFETY_NET_FALLBACK.id,
      label: INSURANCE_TIERS.SAFETY_NET_FALLBACK.label,
      coverageSelection: norm,
      emergency: Boolean(emergency),
      matchedCodes: [],
      safetyNetCodes,
      explanation,
      detail: explanation,
      summary: explanation,
      rights: [],
      warnings: [],
      verificationScript: buildVerificationScript(norm, f),
    };
  }

  // 5. Otherwise unverified or mismatch
  const explanation = t(
    'ins.eval.unverifiedGeneric',
    'Selected coverage is not listed in the directory for this location. Call admissions to confirm accepted insurance and payment options.',
  );
  return {
    ...INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH,
    id: INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH.id,
    tier: INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH.id,
    label: INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH.label,
    coverageSelection: norm,
    emergency: Boolean(emergency),
    matchedCodes: [],
    safetyNetCodes: [],
    explanation,
    summary: explanation,
    rights: [],
    warnings: [],
    verificationScript: buildVerificationScript(norm, f),
  };
}

// ---------------------------------------------------------------- Facility Ranking by Coverage Tier & Distance
export function rankFacilitiesByCoverage(facilities = [], coverageSelection = 'any', options = {}) {
  if (!Array.isArray(facilities)) return [];
  const norm = normalizeCoverageSelection(coverageSelection);
  const emergency = Boolean(options?.emergency);

  const annotated = facilities.map((facility, idx) => {
    const coverageMatch = evaluateFacilityCoverage(facility, norm, { ...options, emergency });
    return {
      item: facility && typeof facility === 'object' ? { ...facility, coverageMatch } : facility,
      rank: coverageMatch.rank,
      miles: typeof facility?.miles === 'number' && !Number.isNaN(facility.miles) ? facility.miles : Number.POSITIVE_INFINITY,
      idx,
    };
  });

  if (norm === 'any' && !emergency) {
    return annotated.map((entry) => entry.item);
  }

  annotated.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.miles !== b.miles) return a.miles - b.miles;
    return a.idx - b.idx;
  });

  return annotated.map((entry) => entry.item);
}

/** Compatibility name for the treatment view; keeps ranking pure and in RAM. */
export function rankFacilitiesByInsurance(facilities = [], coverageSelection = 'any', options = {}) {
  return rankFacilitiesByCoverage(facilities, coverageSelection, options);
}
