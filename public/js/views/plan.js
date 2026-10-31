import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, tocNav, emergencyCallout } from './common.js';
import { t } from '../i18n.js';

/**
 * Evidence-based behavioral health & SUD counseling modalities with SAMHSA directory codes.
 */
export const COUNSELING_MODALITIES = [
  {
    code: 'CBT',
    name: 'Cognitive Behavioral Therapy (CBT)',
    bestFor: 'Alcohol, opioids, stimulants, cannabis, and co-occurring anxiety or depression.',
    whatItLooksLike:
      'Working practically with your counselor to spot high-risk triggers, cravings, and automatic thought patterns (like “all-or-nothing” thinking after a slip), then rehearsing real-world coping and refusal skills.',
    samhsaCode: 'CBT',
  },
  {
    code: 'MI',
    name: 'Motivational Interviewing (MI)',
    bestFor: 'Exploring mixed feelings about change and setting goals on your own terms (abstinence, cutting back, or safer use).',
    whatItLooksLike:
      'Non-judgmental, collaborative conversations that respect your autonomy and readiness for change—never lecturing, scolding, or forcing a label on you.',
    samhsaCode: 'MI',
  },
  {
    code: 'CMI',
    name: 'Contingency Management (CMI)',
    bestFor: 'Stimulant use disorder (methamphetamine and cocaine)—the most effective evidence-based therapy for stimulants—and supporting medication or visit consistency.',
    whatItLooksLike:
      'Receiving tangible, immediate positive reinforcement (such as retail vouchers, gift cards, or prize draws) for meeting recovery or health goals like attending sessions or negative drug screens.',
    samhsaCode: 'CMI',
  },
  {
    code: 'TRC',
    name: 'Trauma-Informed Counseling (TRC) & Seeking Safety',
    bestFor: 'Healing trauma and PTSD alongside substance use without requiring painful detailed trauma retelling before you feel stable.',
    whatItLooksLike:
      'Present-focused coping models (such as Seeking Safety), grounding skills, and emotional regulation where physical and emotional safety come first and you always control what you share.',
    samhsaCode: 'TRC',
  },
  {
    code: 'FT',
    name: 'Community Reinforcement & Family Training (FT / CRAFT)',
    bestFor: 'Families, partners, and loved ones who want to support recovery positively and improve communication.',
    whatItLooksLike:
      'Teaching loved ones how to communicate constructively, reward healthy steps, set safe boundaries, and care for themselves without confrontational “interventions” or shame.',
    samhsaCode: 'FT',
  },
  {
    code: 'TWFA',
    name: '12-Step Facilitation (TWFA) & Secular/Peer Pathways (PEER)',
    bestFor: 'Building free, long-term community connection alongside or after formal treatment.',
    whatItLooksLike:
      'Connecting with peer-led mutual-aid groups that fit your beliefs—including AA, NA, SMART Recovery, Recovery Dharma, LifeRing Secular Recovery, or Medication-Assisted Recovery Anonymous (MARA).',
    samhsaCode: 'PEER',
  },
  {
    code: 'RPP',
    name: 'Relapse Prevention (RPP) & Harm Reduction Counseling',
    bestFor: 'Practical planning for high-risk situations, cravings, tolerance changes, and staying alive.',
    whatItLooksLike:
      'Mapping out early warning signs, practicing urge-surfing, keeping naloxone and test strips on hand, and treating a return to use as a signal to adjust support rather than a reason to discharge you.',
    samhsaCode: 'RPP',
  },
];

/**
 * Evidence-based acute craving & distress regulation skills (MBRP, Seeking Safety, Autonomic Pacing, DBT-SUD).
 */
export const GROUNDING_EXERCISES = [
  {
    id: 'urge_surfing',
    title: 'Urge Surfing (Mindfulness-Based Relapse Prevention)',
    clinicalBasis: 'Mindfulness-Based Relapse Prevention (Marlatt & Bowen)',
    whenToUse: 'When a sudden craving hits and feels like it will keep climbing unless you act on it.',
    steps: [
      'Pause for 60 seconds and remind yourself: an urge is a physical wave in the nervous system, not a command.',
      'Notice where the craving sits in your body right now (tight jaw, hollow stomach, restless hands, racing thoughts) without fighting or judging it.',
      'Picture yourself riding on top of an ocean wave. Most acute cravings crest within 15 to 20 minutes and always fall if you do not feed them.',
      'Use the 3-minute, 5-minute, or 10-minute Urge Surfing timer below to breathe steadily while the wave peaks and softens.',
    ],
  },
  {
    id: 'sensory_54321',
    title: '5-4-3-2-1 Sensory Grounding (Seeking Safety)',
    clinicalBasis: 'Seeking Safety (Najavits) & trauma-informed stabilization',
    whenToUse: 'When trauma reminders, panic, flashbacks, or dissociation pull you out of the present room.',
    steps: [
      '5 things you can SEE: Look around the room and name 5 ordinary objects out loud (for example, “blue mug, window frame, shoelace, lamp, door handle”).',
      '4 things you can FEEL: Notice 4 physical sensations right now (your feet flat on the floor, your back against the chair, cool air on your skin, the fabric of your sleeve).',
      '3 things you can HEAR: Listen for 3 distinct sounds in the environment (hum of a fan, distant traffic, your own breathing).',
      '2 things you can SMELL: Notice 2 scents in the air, or recall 2 favorite calming scents (coffee, rain, soap, pine).',
      '1 steady truth: Say 1 grounded truth about right now (“I am in this room, it is today’s date, and I am surviving this moment”).',
    ],
  },
  {
    id: 'paced_breathing_478',
    title: 'Paced Parasympathetic Breathing (4-7-8 / Extended Exhale)',
    clinicalBasis: 'Vagal brake activation & autonomic nervous system regulation',
    whenToUse: 'When your heart is pounding, your chest feels tight, or anxiety and anger are fueling an urge.',
    steps: [
      'Inhale quietly through your nose for a slow count of 4 seconds.',
      'Rest and hold the breath gently for 7 seconds (or 2 seconds if holding feels uncomfortable—never strain).',
      'Exhale slowly through pursed lips for 8 seconds, making the out-breath roughly twice as long as the in-breath.',
      'Repeat for 4 cycles. Lengthening the exhale signals your vagus nerve to slow your heart rate and lower stress hormones.',
    ],
  },
  {
    id: 'tipp_temperature_paired_relaxation',
    title: 'TIPP Skill: Cool Temperature & Paired Muscle Relaxation (DBT-SUD)',
    clinicalBasis: 'Dialectical Behavior Therapy for Substance Use Disorders (Linehan / Dimeff)',
    whenToUse: 'When distress or craving is at a 9/10 or 10/10 and talking yourself down feels impossible.',
    steps: [
      'Temperature (Mammalian Dive Reflex): Hold a cold wet washcloth (or a zip-top bag of ice water) over your eyes and upper cheeks for 15 to 30 seconds while leaning slightly forward. This rapidly drops heart rate.',
      'Paired Muscle Relaxation: Tense your hands, arms, and shoulders tightly for 5 seconds while inhaling, then let them drop completely limp while exhaling.',
      'As your muscles soften, silently say the word “release” or “safe right now” on the exhale.',
      'Once your body intensity drops from a 9/10 to a 5/10, pick one simple next step (drink water, step outside, or call a safe person).',
    ],
  },
];

/**
 * Step-by-step demystification of the SUDP treatment intake & assessment process.
 */
export const INTAKE_STEPS = [
  {
    step: 1,
    id: 'screening',
    title: 'Screening & immediate safety check',
    summary: 'A brief, welcoming check (often 10–15 minutes by phone or walk-in) to make sure you are physically safe right now.',
    details: [
      'Checks whether you need urgent medical withdrawal support—especially for alcohol, benzodiazepines (Xanax, Klonopin, Valium), or barbiturates, where stopping suddenly can cause dangerous seizures.',
      'Makes sure you have immediate access to naloxone (Narcan) and crisis stabilization if you are in acute distress.',
      'You do not need to have your whole story figured out to call or walk in.',
    ],
    relatedCodes: ['DT', 'WI', 'NOE'],
  },
  {
    step: 2,
    id: 'biopsychosocial',
    title: 'Biopsychosocial assessment with an SUDP or counselor',
    summary: 'A confidential, judgment-free conversation (typically 45–60 minutes) about your whole life—not an interrogation or a pass/fail test.',
    details: [
      'Uses the ASAM (American Society of Addiction Medicine) dimensions to understand your substance use history, physical health, mental health, living environment, and personal strengths.',
      'You can answer at your own pace and decline to detail traumatic events until you feel safe and ready.',
      'Honesty about what and how much you use helps the team keep you comfortable and recommend the right support—not punish you.',
    ],
    relatedCodes: ['OP', 'IOP', 'MHSU'],
  },
  {
    step: 3,
    id: 'medical-visit',
    title: 'Medical & medication visit (MD, NP, PA, or PharmD)',
    summary: 'A health check and conversation about FDA-approved medications for withdrawal relief, craving control, and health care.',
    details: [
      'Discusses medications for opioid use disorder (buprenorphine, methadone, naltrexone) or alcohol use disorder (naltrexone, acamprosate, disulfiram). You can take medication with or without intensive counseling.',
      'A baseline urine or oral swab drug screen may be used clinically to verify what is in your system (such as unexpected fentanyl or xylazine) so medications like buprenorphine can be started safely without precipitated withdrawal.',
      'Offers optional testing and care for HIV, hepatitis C, wound care, and primary health needs.',
    ],
    relatedCodes: ['BU', 'MU', 'NU', 'OTP', 'PMAT'],
  },
  {
    step: 4,
    id: 'treatment-plan',
    title: 'Collaborative treatment plan & level of care',
    summary: 'You and your counselor co-design a care plan around your goals, schedule, job, and family responsibilities.',
    details: [
      'Matches you to the least restrictive level of care that keeps you safe: Outpatient (OP), Intensive Outpatient (IOP), Telehealth (TELE), Partial Hospitalization, or Residential (RES).',
      'Lets you choose counseling modalities that fit you—such as CBT, Motivational Interviewing, Contingency Management, Trauma-Informed Seeking Safety, or Peer Support.',
      'Your treatment plan is a living document: you can ask to adjust your goals, group schedule, or counselor at any time.',
    ],
    relatedCodes: ['OP', 'IOP', 'TELE', 'RES'],
  },
  {
    step: 5,
    id: 'confidentiality-consent',
    title: 'Confidentiality & 42 CFR Part 2 consent rights',
    summary: 'Reviewing your privacy protections and choosing who—if anyone—may receive updates about your care.',
    details: [
      'Substance use disorder treatment records are protected by federal law 42 CFR Part 2 (updated by the 2024/2026 Final Rule, 89 FR 12472), which is stricter than standard HIPAA.',
      'Your records and SUD counseling notes cannot be shared with police, courts, probation, employers, landlords, or family members without your explicit written consent.',
      'You have the right to refuse to sign a release, limit what is shared, or revoke your consent at any time.',
    ],
    relatedCodes: [],
  },
  {
    step: 6,
    id: 'practical-barriers',
    title: 'Overcoming practical barriers (ID, cost, childcare, housing)',
    summary: 'Connecting with a peer navigator or case manager to solve real-world obstacles so you can actually access care.',
    details: [
      'No photo ID or uninsured? Federally Qualified Health Centers (FQHCs), OTPs, and state-funded programs can help you enroll in Medicaid, use a sliding fee scale (SS), or access payment assistance (PA) while helping replace lost ID.',
      'Need a ride, childcare, or safe housing? Ask about transportation assistance (TA), childcare/beds for children (BC), justice-system coordination (CJ), or NARR-certified recovery housing (HH).',
      'Protection from scams: Under federal law (EKRA, 18 U.S.C. § 220), legitimate programs never offer cash, gift cards, free rent, or paid airfare to broker you into a specific facility.',
    ],
    relatedCodes: ['SS', 'PA', 'TA', 'HH', 'CJ'],
  },
];

export const TRIGGER_SUGGESTIONS = [
  'Stress or feeling overwhelmed',
  'Loneliness or isolation',
  'Physical pain or untreated illness',
  'Payday or having extra cash',
  'Certain people, places, or routes',
  'Sleeplessness or exhaustion',
  'Anniversary or trauma reminders',
];

export const COPING_SUGGESTIONS = [
  'Urge surfing for 15 minutes before deciding',
  'Calling a trusted peer, friend, or helpline',
  'Changing my physical location right now',
  'Taking my prescribed MOUD/MAUD medication',
  'Eating a meal and drinking a glass of water',
  'Attending a support meeting (online or in-person)',
  'Doing slow 4-7-8 breathing and grounding',
];

const CALLER_OPENINGS = {
  self: 'Hi, I am calling for myself to ask about starting care',
  loved_one: 'Hi, I am calling to get information for a loved one who is looking at care options',
  clinician: 'Hello, I am a clinician / peer navigator coordinating a warm handoff for a patient',
};

const NEED_DETAILS = {
  moud_bup: {
    phrase: 'for outpatient buprenorphine (Suboxone / Sublocade) or medication treatment',
    questions: [
      'How soon can someone see a prescriber for a same-day or next-day buprenorphine start (in person or by telehealth)?',
      'Does your prescriber offer low-dose / micro-induction (“Bernese method”) protocols if fentanyl is in the supply, so we can avoid precipitated withdrawal?',
      'Can medication be started right away even if counseling or group intake appointments are scheduled for later?',
    ],
  },
  methadone_otp: {
    phrase: 'at your Opioid Treatment Program (OTP) for methadone',
    questions: [
      'What days and hours do you accept walk-in intakes for methadone, and how early should someone arrive?',
      'Can the first dose of methadone be given on the same day as the intake exam?',
      'How does your clinic apply the 2024 SAMHSA OTP rules for early take-home doses and flexible counseling schedules?',
    ],
  },
  detox: {
    phrase: 'for medically supervised withdrawal management (detox)',
    questions: [
      'Do you have an open bed today or a walk-in triage window, and is there 24/7 medical monitoring (especially for alcohol, benzo, or severe opioid/xylazine withdrawal)?',
      'What comfort medications and FDA-approved medications (buprenorphine, methadone, phenobarbital/benzodiazepine tapers) do you use during withdrawal?',
      'Do you start ongoing medication (MOUD/MAUD) and schedule a warm handoff to outpatient care before discharge so tolerance drop does not lead to overdose?',
    ],
  },
  outpatient: {
    phrase: 'for outpatient counseling or Intensive Outpatient (IOP)',
    questions: [
      'How quickly can we schedule a biopsychosocial assessment (ASAM evaluation), and is walk-in or telehealth intake available?',
      'Which evidence-based therapies do your counselors offer (such as CBT, Motivational Interviewing, Contingency Management for stimulants, or Seeking Safety for trauma)?',
      'If someone is taking prescribed buprenorphine, methadone, or naltrexone—or isn’t ready for total abstinence on day one—are they fully welcomed in your groups?',
    ],
  },
  pregnant: {
    phrase: 'for pregnant or postpartum substance use care (priority intake)',
    questions: [
      'Because pregnant patients receive federal and state priority admission, how quickly can we do a same-day or next-day intake?',
      'Do you coordinate prenatal care alongside buprenorphine or methadone stabilization without punitive reporting?',
      'Do you offer family-friendly services like childcare (BC), residential beds for children, or help building a supportive Plan of Safe Care?',
    ],
  },
};

const INSURANCE_DETAILS = {
  medicaid: {
    phrase: 'using Medicaid.',
    questions: [
      'Do you accept my state Medicaid plan (or Medicaid managed care plan) with zero copay for intake and medication?',
      'Can your intake coordinator help arrange Medicaid Non-Emergency Medical Transportation (NEMT) or transit passes (TA) for visits?',
    ],
    rights: [
      'Medicaid covers FDA-approved medications for opioid and alcohol use disorder (buprenorphine, methadone at OTPs, naltrexone, acamprosate) and counseling.',
      'If you do not have your physical Medicaid card with you, the clinic can usually verify active coverage using your name, date of birth, and Social Security number.',
    ],
  },
  uninsured: {
    phrase: 'without insurance right now (looking for sliding-scale or state-funded slots).',
    questions: [
      'Do you have state-funded / SAMHSA Block Grant slots, payment assistance (PA), or a sliding fee scale (SS) for uninsured patients?',
      'What is the exact out-of-pocket cost for the first visit, and can your navigator help me apply for presumptive Medicaid or emergency coverage at intake?',
      'If I am missing a government photo ID or proof of address, what temporary alternatives do you accept so care is not delayed?',
    ],
    rights: [
      'Programs receiving federal Substance Use Prevention, Treatment, and Recovery Services Block Grant funds must give priority admission to pregnant people and people who inject drugs, and cannot turn away priority patients solely for inability to pay.',
      'Federally Qualified Health Centers (FQHCs) must offer a sliding fee scale based on income and cannot deny primary or behavioral health care due to inability to pay.',
    ],
  },
  private: {
    phrase: 'using private / employer health insurance.',
    questions: [
      'Are BOTH the facility and the prescribing clinician in-network with my specific insurance plan?',
      'Will you give me a written estimate of any deductible, copay, or coinsurance before I sign financial forms?',
    ],
    rights: [
      'Under the federal Mental Health Parity and Addiction Equity Act (MHPAEA), most health plans cannot impose stricter prior authorizations, visit limits, or higher copays on SUD care than on medical/surgical care.',
      'Under the No Surprises Act and state consumer laws, be cautious of out-of-network facilities that promise your insurance will “cover 100% of everything” without verifying in-network status in writing.',
    ],
  },
  medicare_va: {
    phrase: 'using Medicare, VA, TRICARE, or IHS coverage.',
    questions: [
      'Are you certified to bill Medicare (including Medicare Part B OTP bundle for methadone/buprenorphine), VA Community Care, TRICARE, or IHS?',
      'Are there any out-of-pocket coinsurance costs, or is the service covered at 100% under my benefit?',
    ],
    rights: [
      'Medicare covers Opioid Treatment Programs (OTPs) with zero Part B deductible for methadone, buprenorphine, naltrexone, and counseling.',
      'Veterans can access SUD care and medications through VA Medical Centers, Vet Centers, or authorized VA Community Care providers regardless of service connection in crisis situations.',
    ],
  },
};

/**
 * Pure helper that builds a tailored, printable/copyable intake phone script
 * based on caller ('self' | 'loved_one' | 'clinician'), need ('moud_bup' | 'methadone_otp' | 'detox' | 'outpatient' | 'pregnant'),
 * and insurance ('medicaid' | 'uninsured' | 'private' | 'medicare_va').
 */
export function buildIntakeCallScript({ caller = 'self', need = 'moud_bup', insurance = 'medicaid' } = {}) {
  const safeCaller = Object.hasOwn(CALLER_OPENINGS, caller) ? caller : 'self';
  const safeNeed = Object.hasOwn(NEED_DETAILS, need) ? need : 'moud_bup';
  const safeInsurance = Object.hasOwn(INSURANCE_DETAILS, insurance) ? insurance : 'medicaid';

  const callerPrefix = CALLER_OPENINGS[safeCaller];
  const needInfo = NEED_DETAILS[safeNeed];
  const insInfo = INSURANCE_DETAILS[safeInsurance];

  const opening = `“${callerPrefix} ${needInfo.phrase}, ${insInfo.phrase} Can you tell me what your intake process looks like today?”`;

  const keyQuestions = [
    ...needInfo.questions,
    ...insInfo.questions,
    'Is your program licensed by the state, and what is your policy if a patient experiences a slip or return to use during care?',
  ];

  const barrierRights = [...insInfo.rights];
  if (safeCaller === 'loved_one') {
    barrierRights.push(
      '42 CFR Part 2 note for families: Even without a signed release from your loved one, staff can answer general questions about their program, medications, and costs, and can listen to safety concerns you share.',
      'Evidence-based tip (CRAFT): Avoid confrontational “interventions.” Offer calm, specific options (such as a ride or sitting together while calling) and keep naloxone at home.',
    );
  } else if (safeCaller === 'clinician') {
    barrierRights.push(
      '42 CFR Part 2 (89 FR 12472) warm handoff note: Have the patient sign a single written consent for Treatment, Payment, and Healthcare Operations (TPO) so you can share ASAM dimensions and last medication dose directly with the receiving team.',
    );
  } else {
    barrierRights.push(
      '42 CFR Part 2 privacy protection: Simply calling to ask questions or completing a screening does not go on a public record, employment check, or law enforcement database.',
    );
  }

  const redFlagReminder =
    'EKRA Anti-Brokering Warning (18 U.S.C. § 220): Hang up if a call center refuses to give the clinic’s exact street address, pressures you to fly out of state today, discourages FDA-approved medications (buprenorphine/methadone), or offers free rent, cash, or paid airfare.';

  const fullText = [
    '============================================================',
    'HARBORPATH CLINIC INTAKE CALL SCRIPT',
    '============================================================',
    '',
    'WHAT TO SAY WHEN THEY PICK UP:',
    opening,
    '',
    'KEY QUESTIONS TO ASK:',
    ...keyQuestions.map((q, i) => `${i + 1}. ${q}`),
    '',
    'YOUR RIGHTS & BARRIER WORKAROUNDS:',
    ...barrierRights.map((r) => `• ${r}`),
    '',
    'RED FLAG REMINDER:',
    redFlagReminder,
    '============================================================',
  ].join('\n');

  return {
    caller: safeCaller,
    need: safeNeed,
    insurance: safeInsurance,
    opening,
    keyQuestions,
    barrierRights,
    redFlagReminder,
    fullText,
  };
}

// ------------------------------------------------------------
// Stanley-Brown Safety Plan State (Strictly ephemeral browser RAM)
// ------------------------------------------------------------

const createDefaultPlanState = () => ({
  goal: '',
  warningSigns: '',          // Step 1: Warning signs (intrapersonal & environmental)
  triggers: '',              // alias for warning signs & triggers
  copingStrategies: '',      // Step 2: Internal coping strategies
  copingSteps: '',           // alias for coping strategies
  socialDistractions: '',    // Step 3: Social distraction contacts & safe environments
  supportNetwork: '',        // Step 4: Family & friend support network
  trustedContacts: '',       // alias for support network
  professionals: '',         // Step 5: Professional & crisis escalation contacts
  professionalContacts: '',  // alias for professionals
  environmentalSafety: '',   // Step 6: Environmental safety & substance locking
  saferEnvironment: '',      // alias for environmental safety
  naloxoneLocation: '',      // Naloxone placement mapping & test strips
  notes: '',                 // Notes, reminders to myself & reasons for living
});

let inMemoryPlanState = createDefaultPlanState();
const planListeners = new Set();

function notifyPlanListeners() {
  for (const fn of planListeners) {
    try {
      fn(inMemoryPlanState);
    } catch {
      // guard subscriber
    }
  }
}

/**
 * Returns a shallow copy of the current in-memory safety plan state.
 * Backed strictly by ephemeral browser RAM (zero storage/queries).
 */
export function getPlanState() {
  return { ...inMemoryPlanState };
}

/**
 * Updates the in-memory safety plan state with the provided patch.
 * Synchronizes Stanley-Brown model fields and legacy aliases in browser RAM.
 */
export function setPlanState(patch = {}) {
  if (patch && typeof patch === 'object') {
    for (const [key, val] of Object.entries(patch)) {
      if (val !== undefined && Object.hasOwn(inMemoryPlanState, key)) {
        inMemoryPlanState[key] = Array.isArray(val) ? val.join('\n• ') : String(val ?? '');
      }
    }

    // Two-way synchronization of Stanley-Brown fields and legacy aliases
    if (patch.warningSigns !== undefined && patch.triggers === undefined) {
      inMemoryPlanState.triggers = inMemoryPlanState.warningSigns;
    } else if (patch.triggers !== undefined && patch.warningSigns === undefined) {
      inMemoryPlanState.warningSigns = inMemoryPlanState.triggers;
    }

    if (patch.copingStrategies !== undefined && patch.copingSteps === undefined) {
      inMemoryPlanState.copingSteps = inMemoryPlanState.copingStrategies;
    } else if (patch.copingSteps !== undefined && patch.copingStrategies === undefined) {
      inMemoryPlanState.copingStrategies = inMemoryPlanState.copingSteps;
    }

    if (patch.supportNetwork !== undefined && patch.trustedContacts === undefined) {
      inMemoryPlanState.trustedContacts = inMemoryPlanState.supportNetwork;
    } else if (patch.trustedContacts !== undefined && patch.supportNetwork === undefined) {
      inMemoryPlanState.supportNetwork = inMemoryPlanState.trustedContacts;
    }

    if (patch.professionals !== undefined && patch.professionalContacts === undefined) {
      inMemoryPlanState.professionalContacts = inMemoryPlanState.professionals;
    } else if (patch.professionalContacts !== undefined && patch.professionals === undefined) {
      inMemoryPlanState.professionals = inMemoryPlanState.professionalContacts;
    }

    if (patch.environmentalSafety !== undefined && patch.saferEnvironment === undefined) {
      inMemoryPlanState.saferEnvironment = inMemoryPlanState.environmentalSafety;
    } else if (patch.saferEnvironment !== undefined && patch.environmentalSafety === undefined) {
      inMemoryPlanState.environmentalSafety = inMemoryPlanState.saferEnvironment;
    }

    notifyPlanListeners();
  }
  return getPlanState();
}

/**
 * Resets the in-memory safety plan state back to empty fields.
 */
export function resetPlanState() {
  inMemoryPlanState = createDefaultPlanState();
  notifyPlanListeners();
  return getPlanState();
}

function normalizeField(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? '').trim()).filter(Boolean).join('\n• ');
  }
  return String(value ?? '').trim();
}

function formatBlock(title, rawValue) {
  if (rawValue === undefined || rawValue === null) {
    return `${title}\n(None listed yet)`;
  }
  const val = normalizeField(rawValue);
  const body = val ? (Array.isArray(rawValue) ? `• ${val}` : val) : '(None listed yet)';
  return `${title}\n${body}`;
}

/**
 * Pure function that formats a user's Stanley-Brown safety & recovery action plan
 * into a clean, readable plain-text document for copying to clipboard or printing.
 */
export function formatSafetyPlanText(plan = inMemoryPlanState) {
  const safePlan = plan && typeof plan === 'object' ? plan : {};

  const goal = safePlan.goal;
  const warningSigns = safePlan.warningSigns || safePlan.triggers;
  const coping = safePlan.copingStrategies || safePlan.copingSteps;
  const social = safePlan.socialDistractions;
  const support = safePlan.supportNetwork || safePlan.trustedContacts;
  const prof = safePlan.professionals || safePlan.professionalContacts;
  const env = safePlan.environmentalSafety || safePlan.saferEnvironment;
  const naloxone = safePlan.naloxoneLocation;
  const notes = safePlan.notes;

  const sections = [
    '============================================================',
    'HARBORPATH PERSONAL SAFETY & RECOVERY ACTION PLAN',
    'Stanley-Brown Evidence-Based Suicide & Overdose Safety Model',
    'Private plan, written in your browser and kept in your control.',
    '============================================================',
    '',
    formatBlock('1. MY GOAL RIGHT NOW', goal),
    '',
    // Step 1: Warning signs & triggers (intrapersonal & environmental)
    formatBlock(
      '2. MY TRIGGERS & HIGH-RISK SITUATIONS',
      safePlan.triggers || warningSigns,
    ),
    '',
    formatBlock(
      '3. EARLY WARNING SIGNS I AM STRUGGLING',
      safePlan.warningSigns || warningSigns,
    ),
    '',
    // Step 2: Internal coping strategies
    formatBlock('4. COPING STEPS THAT WORK FOR ME', coping),
    '',
    // Step 3: Social distraction contacts & safe environments
    formatBlock('5. SOCIAL DISTRACTIONS & SAFE PLACES (PEOPLE & SETTINGS THAT DISTRACT ME)', social),
    '',
    // Step 4: Family & friend support network
    formatBlock('6. TRUSTED PEOPLE & SUPPORTS I CAN REACH OUT TO', support),
    '',
    // Step 5: Professional & crisis escalation contacts
    formatBlock('7. PROFESSIONALS & CRISIS ESCALATION CONTACTS', prof),
    '',
    // Step 6: Environmental safety & substance locking
    formatBlock('8. WAYS TO MAKE MY ENVIRONMENT SAFER', env),
    '',
    // Naloxone placement mapping
    formatBlock('9. WHERE MY NALOXONE (NARCAN) & TEST STRIPS ARE KEPT', naloxone),
    '',
    // Notes & reminders
    formatBlock('10. NOTES & REMINDERS TO MYSELF', notes),
    '',
    '------------------------------------------------------------',
    '24/7 FREE & CONFIDENTIAL CRISIS & OVERDOSE ESCALATION LINES',
    '• 988 Suicide & Crisis Lifeline: Call or text 988 (free, 24/7, English & Spanish)',
    '• SAMHSA National Helpline: 1-800-662-4357 (free, 24/7 treatment & support)',
    '• Never Use Alone (overdose prevention): 877-696-1996 (or 1-800-484-3731, 24/7)',
    '• SafeSpot (overdose prevention & peer safety line): 800-972-0590 (free, 24/7)',
    '• Medical Emergency (if someone won’t wake up or breathe): Call 911 & give naloxone',
    '------------------------------------------------------------',
  ];
  return sections.join('\n');
}

function toggleSuggestionInText(currentText, item) {
  const lines = String(currentText ?? '')
    .split('\n')
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean);
  const idx = lines.findIndex((l) => l.toLowerCase() === item.toLowerCase());
  if (idx >= 0) {
    lines.splice(idx, 1);
  } else {
    lines.push(item);
  }
  return lines.map((l) => `• ${l}`).join('\n');
}

function hasSuggestionInText(currentText, item) {
  const lines = String(currentText ?? '')
    .split('\n')
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim().toLowerCase())
    .filter(Boolean);
  return lines.includes(item.toLowerCase());
}

/**
 * Interactive guided Urge Surfing & Visual Breathing Pacing Timer component.
 * Features 3-minute, 5-minute, and 10-minute visual breathing pacing guides.
 * Cleans up intervals automatically on unmount and respects prefers-reduced-motion.
 */
function urgeSurfingTimer() {
  let totalSeconds = 180;
  let remaining = 180;
  let interval = null;

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const display = h('p', { class: 'timer-display', 'aria-hidden': 'true' }, '3:00');
  const livePrompt = h(
    'p',
    { class: 'timer-live', role: 'status', 'aria-live': 'polite' },
    t('plan.timer.ready', 'Choose 3, 5, or 10 minutes when an urge hits. Most cravings crest and soften like a wave if you ride out the peak.'),
  );

  const pacerCircle = h('span', { class: 'pacer-circle', 'aria-hidden': 'true' });
  const pacerLabel = h('span', { class: 'pacer-label' }, t('plan.timer.pacer.ready', 'Visual breathing pacer (Inhale 4s • Hold 2s • Exhale 8s • Pause 2s)'));
  const pacerGuide = h('div', { class: 'pacer-guide pacer-idle', 'aria-hidden': 'true' }, pacerCircle, pacerLabel);

  function stopTimer() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
    pacerGuide.className = 'pacer-guide pacer-idle';
    pacerLabel.textContent = t('plan.timer.pacer.ready', 'Visual breathing pacer (Inhale 4s • Hold 2s • Exhale 8s • Pause 2s)');
  }

  function updatePacer(elapsed) {
    // 16-second vagal brake cycle: 4s inhale, 2s hold, 8s exhale, 2s pause
    const secInCycle = elapsed % 16;
    if (secInCycle < 4) {
      pacerGuide.className = 'pacer-guide pacer-inhale';
      pacerLabel.textContent = t('plan.timer.pacer.inhale', 'Inhale gently (4s)…');
    } else if (secInCycle < 6) {
      pacerGuide.className = 'pacer-guide pacer-hold';
      pacerLabel.textContent = t('plan.timer.pacer.hold', 'Hold gently (2s)…');
    } else if (secInCycle < 14) {
      pacerGuide.className = 'pacer-guide pacer-exhale';
      pacerLabel.textContent = t('plan.timer.pacer.exhale', 'Exhale slowly (8s)…');
    } else {
      pacerGuide.className = 'pacer-guide pacer-pause';
      pacerLabel.textContent = t('plan.timer.pacer.pause', 'Pause & settle (2s)…');
    }
  }

  function coachingForRemaining(rem, total) {
    const elapsed = total - rem;
    const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rem <= 0) {
      return t(
        'plan.timer.done',
        'Wave surfed. Notice how your body feels now compared to when you started. You made it through these minutes—drink some water or take one safe next step.',
      );
    }
    if (elapsed < 30) {
      return t(
        'plan.timer.phase1',
        'Settle your feet on the floor. Notice where the urge sits in your body without fighting it. Breathe in gently for 4 seconds, out slowly for 6 to 8 seconds.',
      );
    }
    if (elapsed < 90) {
      return reducedMotion
        ? t('plan.timer.phase2.calm', 'Keep a steady, slow exhale. Picture the craving as a wave passing beneath you—you do not have to act on a thought.')
        : t('plan.timer.phase2', 'Inhale slowly (1-2-3-4)… exhale softly (1-2-3-4-5-6). Let your shoulders drop as the wave crests.');
    }
    if (total >= 600 && elapsed < 300) {
      return t(
        'plan.timer.phaseMid',
        'Riding the crest of the wave. Keep your feet grounded and let tension melt from your shoulders and jaw on each long exhale.',
      );
    }
    if (rem > 45) {
      return t(
        'plan.timer.phase3',
        'You are over the halfway mark. Name 3 things you can see in the room right now and keep lengthening your out-breath.',
      );
    }
    return t(
      'plan.timer.phase4',
      'Final stretch—the peak is passing. Unclench your jaw and hands, and take two more slow, deep breaths.',
    );
  }

  function start(seconds) {
    stopTimer();
    totalSeconds = seconds;
    remaining = seconds;
    display.textContent = fmt(remaining);
    livePrompt.textContent = coachingForRemaining(remaining, totalSeconds);
    updatePacer(0);

    interval = setInterval(() => {
      if (root.isConnected === false) {
        stopTimer();
        return;
      }
      remaining -= 1;
      display.textContent = fmt(Math.max(remaining, 0));
      const elapsed = totalSeconds - remaining;
      updatePacer(elapsed);

      // Update aria-live coaching prompt at gentle 15-second boundaries or completion
      if (remaining <= 0) {
        stopTimer();
        display.textContent = '0:00';
        livePrompt.textContent = coachingForRemaining(0, totalSeconds);
      } else if (elapsed % 15 === 0) {
        livePrompt.textContent = coachingForRemaining(remaining, totalSeconds);
      }
    }, 1000);
  }

  const start3Btn = h('button', {
    type: 'button',
    class: 'btn btn-primary btn-small',
    onclick: () => start(180),
  }, icon('clock'), t('plan.timer.start3', 'Start 3-minute urge surf'));

  const start5Btn = h('button', {
    type: 'button',
    class: 'btn btn-secondary btn-small',
    onclick: () => start(300),
  }, icon('clock'), t('plan.timer.start5', 'Start 5-minute urge surf'));

  const start10Btn = h('button', {
    type: 'button',
    class: 'btn btn-secondary btn-small',
    onclick: () => start(600),
  }, icon('clock'), t('plan.timer.start10', 'Start 10-minute urge surf'));

  const resetBtn = h('button', {
    type: 'button',
    class: 'btn btn-ghost btn-small',
    onclick: () => {
      stopTimer();
      remaining = totalSeconds;
      display.textContent = fmt(remaining);
      livePrompt.textContent = t('plan.timer.reset', 'Timer paused and reset. Start again whenever you are ready.');
    },
  }, icon('x'), t('plan.timer.resetBtn', 'Pause / reset'));

  const root = h('div', { class: 'timer', role: 'group', 'aria-label': t('plan.timer.aria', 'Guided urge surfing and breathing timer') },
    display,
    h('div', { class: 'actions' }, start3Btn, start5Btn, start10Btn, resetBtn),
    pacerGuide,
    livePrompt,
  );
  return root;
}

/**
 * Interactive "What to Say When You Call a Clinic" script builder component.
 */
function intakeScriptBuilderCard() {
  const state = {
    caller: 'self',
    need: 'moud_bup',
    insurance: 'medicaid',
  };

  const scriptOutput = h('div', { class: 'intake-script-output' });
  const copyMsg = h('p', { class: 'field-status', role: 'status', 'aria-live': 'polite' });

  function renderScript() {
    clear(scriptOutput);
    const built = buildIntakeCallScript(state);
    scriptOutput.append(
      h('div', { class: 'callout callout-info' },
        h('p', { class: 'callout-title' }, icon('phone'), t('plan.script.sayTitle', 'What to say when they pick up')),
        p(strong(built.opening)),
      ),
      h('h4', null, t('plan.script.questionsHeading', 'Key questions to ask on the call')),
      h('ol', { class: 'checklist' }, built.keyQuestions.map((q) => h('li', null, q))),
      h('h4', null, t('plan.script.rightsHeading', 'Your rights & barrier workarounds for this call')),
      ul(built.barrierRights),
      h('div', { class: 'callout callout-warn' },
        p(icon('alert'), ' ', strong(t('plan.script.redFlagTitle', 'Safety & EKRA reminder: ')), built.redFlagReminder),
      ),
    );
  }

  const callerSelect = h('select', {
    id: 'script-caller',
    class: 'select',
    onchange: (e) => {
      state.caller = e.target.value;
      renderScript();
    },
  },
    h('option', { value: 'self' }, t('plan.script.caller.self', 'Myself')),
    h('option', { value: 'loved_one' }, t('plan.script.caller.lovedOne', 'A family member, partner, or friend')),
    h('option', { value: 'clinician' }, t('plan.script.caller.clinician', 'A patient (peer navigator / clinician warm handoff)')),
  );

  const needSelect = h('select', {
    id: 'script-need',
    class: 'select',
    onchange: (e) => {
      state.need = e.target.value;
      renderScript();
    },
  },
    h('option', { value: 'moud_bup' }, t('plan.script.need.bup', 'Buprenorphine (Suboxone / Sublocade) or outpatient MOUD')),
    h('option', { value: 'methadone_otp' }, t('plan.script.need.otp', 'Methadone clinic (Opioid Treatment Program / OTP)')),
    h('option', { value: 'detox' }, t('plan.script.need.detox', 'Medical detox / withdrawal management')),
    h('option', { value: 'outpatient' }, t('plan.script.need.outpatient', 'Outpatient counseling or Intensive Outpatient (IOP)')),
    h('option', { value: 'pregnant' }, t('plan.script.need.pregnant', 'Pregnant or postpartum care (priority intake)')),
  );

  const insuranceSelect = h('select', {
    id: 'script-insurance',
    class: 'select',
    onchange: (e) => {
      state.insurance = e.target.value;
      renderScript();
    },
  },
    h('option', { value: 'medicaid' }, t('plan.script.ins.medicaid', 'Medicaid / state coverage')),
    h('option', { value: 'uninsured' }, t('plan.script.ins.uninsured', 'Uninsured / sliding scale / no ID')),
    h('option', { value: 'private' }, t('plan.script.ins.private', 'Private / employer insurance')),
    h('option', { value: 'medicare_va' }, t('plan.script.ins.medicareVa', 'Medicare, VA, TRICARE, or IHS')),
  );

  async function handleCopyScript() {
    const built = buildIntakeCallScript(state);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(built.fullText);
        copyMsg.textContent = t('plan.script.copied', 'Copied intake call script to clipboard.');
        announce(copyMsg.textContent);
      } else {
        copyMsg.textContent = t('plan.script.copyUnavailable', 'Clipboard unavailable in this browser. Use Print instead.');
      }
    } catch {
      copyMsg.textContent = t('plan.script.copyError', 'Could not copy automatically. Use Print instead.');
    }
  }

  renderScript();

  return h('div', { class: 'card intake-script-card', id: 'intake' },
    h('h3', null, t('plan.script.heading', 'Interactive “What to Say When You Call a Clinic” Script Builder')),
    fine(t('plan.script.sub', 'Choose who is calling, what kind of care you are asking about, and how you plan to pay to get a word-for-word phone script.')),
    h('div', { class: 'location-row' },
      h('div', null,
        h('label', { class: 'label', for: 'script-caller' }, t('plan.script.callerLabel', 'I am calling for')),
        callerSelect,
      ),
      h('div', null,
        h('label', { class: 'label', for: 'script-need' }, t('plan.script.needLabel', 'Looking for')),
        needSelect,
      ),
      h('div', null,
        h('label', { class: 'label', for: 'script-insurance' }, t('plan.script.insLabel', 'Insurance / payment')),
        insuranceSelect,
      ),
    ),
    scriptOutput,
    h('div', { class: 'actions' },
      h('button', {
        type: 'button',
        class: 'btn btn-primary btn-small',
        onclick: handleCopyScript,
      }, icon('copy'), t('plan.script.copyBtn', 'Copy call script')),
      h('button', {
        type: 'button',
        class: 'btn btn-secondary btn-small',
        onclick: () => window.print(),
      }, icon('printer'), t('plan.script.printBtn', 'Print script')),
    ),
    copyMsg,
  );
}

/**
 * Interactive Stanley-Brown Evidence-Based Suicide & Overdose Safety Planning model view.
 * Zero-knowledge: Backed strictly by ephemeral browser RAM (zero storage/queries).
 */
export function planView({ query } = {}) {
  // If query provides a goal, initialize ephemeral state if currently empty
  const initialGoal = query?.get('goal');
  if (initialGoal && !inMemoryPlanState.goal) {
    setPlanState({ goal: initialGoal });
  }

  const previewBody = h('div', { class: 'safety-plan-preview-body' });
  const copyStatus = h('p', { class: 'field-status', role: 'status', 'aria-live': 'polite' });
  const cfrStatus = h('p', { class: 'field-status', role: 'status', 'aria-live': 'polite' });

  const inputRefs = {};
  const triggerChipButtons = [];
  const copingChipButtons = [];

  function syncChipStates() {
    const currentTriggers = inMemoryPlanState.warningSigns || inMemoryPlanState.triggers;
    for (const { btn, label } of triggerChipButtons) {
      const active = hasSuggestionInText(currentTriggers, label);
      btn.setAttribute('aria-pressed', String(active));
      btn.className = active ? 'preset' : 'btn btn-small btn-ghost';
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    }

    const currentCoping = inMemoryPlanState.copingStrategies || inMemoryPlanState.copingSteps;
    for (const { btn, label } of copingChipButtons) {
      const active = hasSuggestionInText(currentCoping, label);
      btn.setAttribute('aria-pressed', String(active));
      btn.className = active ? 'preset' : 'btn btn-small btn-ghost';
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    }
  }

  function renderPreview() {
    clear(previewBody);
    const plan = inMemoryPlanState;

    const rows = [
      [t('plan.preview.goal', 'My recovery goal & reasons for living'), plan.goal],
      [
        t('plan.preview.warningSigns', 'Step 1: Warning signs & triggers'),
        plan.warningSigns && plan.triggers && plan.warningSigns !== plan.triggers
          ? `${plan.warningSigns}\n• ${plan.triggers}`
          : (plan.warningSigns || plan.triggers),
      ],
      [t('plan.preview.copingStrategies', 'Step 2: Internal coping strategies'), plan.copingStrategies || plan.copingSteps],
      [t('plan.preview.socialDistractions', 'Step 3: Social distraction & safe settings'), plan.socialDistractions],
      [t('plan.preview.supportNetwork', 'Step 4: Family & friend support network'), plan.supportNetwork || plan.trustedContacts],
      [t('plan.preview.professionals', 'Step 5: Professional & crisis escalation contacts'), plan.professionals || plan.professionalContacts],
      [t('plan.preview.environmentalSafety', 'Step 6: Environmental safety & substance locking'), plan.environmentalSafety || plan.saferEnvironment],
      [t('plan.preview.naloxoneLocation', 'Where naloxone & test strips are kept'), plan.naloxoneLocation],
      [t('plan.preview.notes', 'Notes & reminders to myself'), plan.notes],
    ];

    previewBody.append(
      h('dl', { class: 'service-list' },
        rows.map(([label, val]) => [
          h('dt', null, label),
          h('dd', null, String(val ?? '').trim() || t('plan.preview.empty', 'Not filled in yet')),
        ]),
      ),
      h('div', { class: 'callout callout-info' },
        h('p', { class: 'callout-title' }, icon('phone'), t('plan.preview.crisisTitle', '24/7 free & confidential crisis & overdose prevention lines')),
        ul([
          [strong('988 Suicide & Crisis Lifeline: '), 'Call or text ', tel('988', '988'), ' (free, 24/7, English & Spanish).'],
          [strong('SAMHSA National Helpline: '), tel('18006624357', '1-800-662-4357'), ' (free, 24/7 treatment referral & support).'],
          [strong('Never Use Alone: '), tel('8776961996', '877-696-1996'), ' or ', tel('18004843731', '1-800-484-3731'), ' (free, 24/7 confidential overdose prevention).'],
          [strong('SafeSpot: '), tel('8009720590', '800-972-0590'), ' (free, 24/7 overdose prevention & peer safety line).'],
          [strong('Medical Emergency: '), 'Call ', tel('911', '911'), ' immediately if someone won’t wake up or breathe, and administer naloxone.'],
        ]),
      ),
    );
  }

  function handleStateUpdate(newState) {
    for (const [key, ref] of Object.entries(inputRefs)) {
      if (ref && ref.value !== newState[key]) {
        ref.value = newState[key] ?? '';
      }
    }
    syncChipStates();
    renderPreview();
  }

  planListeners.add(handleStateUpdate);

  function createField({ key, id, label, helpText, placeholder, rows = 2, chips = null }) {
    const val = inMemoryPlanState[key] ?? '';
    const control = rows > 1
      ? h('textarea', {
          id,
          class: 'input',
          rows: String(rows),
          placeholder,
          oninput: (e) => {
            setPlanState({ [key]: e.target.value });
          },
        }, val)
      : h('input', {
          id,
          type: 'text',
          class: 'input',
          placeholder,
          value: val,
          oninput: (e) => {
            setPlanState({ [key]: e.target.value });
          },
        });

    inputRefs[key] = control;

    return h('div', { class: 'filter-group' },
      h('label', { class: 'label', for: id }, label),
      helpText && h('p', { class: 'help' }, helpText),
      chips,
      control,
    );
  }

  const triggerChipsBar = h('div', { class: 'presets', role: 'group', 'aria-label': t('plan.triggers.chipsLabel', 'Quick-add common triggers') },
    TRIGGER_SUGGESTIONS.map((label) => {
      const btn = h('button', {
        type: 'button',
        class: 'btn btn-small btn-ghost',
        'aria-pressed': 'false',
        onclick: () => {
          const current = inMemoryPlanState.warningSigns || inMemoryPlanState.triggers;
          const next = toggleSuggestionInText(current, label);
          setPlanState({ warningSigns: next, triggers: next });
          announce(`${hasSuggestionInText(next, label) ? 'Added' : 'Removed'} trigger: ${label}`);
        },
      }, '+ ', label);
      triggerChipButtons.push({ btn, label });
      return btn;
    }),
  );

  const copingChipsBar = h('div', { class: 'presets', role: 'group', 'aria-label': t('plan.coping.chipsLabel', 'Quick-add coping strategies') },
    COPING_SUGGESTIONS.map((label) => {
      const btn = h('button', {
        type: 'button',
        class: 'btn btn-small btn-ghost',
        'aria-pressed': 'false',
        onclick: () => {
          const current = inMemoryPlanState.copingStrategies || inMemoryPlanState.copingSteps;
          const next = toggleSuggestionInText(current, label);
          setPlanState({ copingStrategies: next, copingSteps: next });
          announce(`${hasSuggestionInText(next, label) ? 'Added' : 'Removed'} coping step: ${label}`);
        },
      }, '+ ', label);
      copingChipButtons.push({ btn, label });
      return btn;
    }),
  );

  async function handleCopyPlan() {
    const text = formatSafetyPlanText(inMemoryPlanState);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copyStatus.textContent = t('plan.copied', 'Copied your safety plan to the clipboard.');
        announce(t('plan.copied', 'Copied your safety plan to the clipboard.'));
      } else {
        copyStatus.textContent = t('plan.copyUnavailable', 'Clipboard access is unavailable in this browser. Use Print / Save as PDF instead.');
      }
    } catch {
      copyStatus.textContent = t('plan.copyError', 'Could not copy automatically. Use Print / Save as PDF instead.');
    }
  }

  function handleClearPlan() {
    resetPlanState();
    copyStatus.textContent = t('plan.cleared', 'Cleared your safety plan from browser memory.');
    announce(t('plan.cleared', 'Cleared your safety plan from browser memory.'));
  }

  async function handleCopyCfrHandout() {
    const text = [
      '============================================================',
      '42 CFR PART 2 PATIENT PRIVACY RIGHTS HANDOUT',
      'HHS & SAMHSA Final Rule (89 FR 12472 — Full Compliance 2026)',
      '============================================================',
      '',
      '1. SHIELD AGAINST LAW ENFORCEMENT & COURTS:',
      'Substance use disorder (SUD) treatment records cannot be used to investigate or prosecute you without your written consent or a special high-threshold court order requiring notice and a hearing. A general subpoena or police request is not enough.',
      '',
      '2. SPECIAL PROTECTION FOR COUNSELING NOTES:',
      'SUDP and therapist personal clinical counseling notes are protected separately from general medical records and cannot be shared without separate, specific written consent.',
      '',
      '3. PATIENT CONTROL OVER CONSENT & RIGHT TO REVOKE:',
      'You decide whether to sign a single consent for Treatment, Payment, and Healthcare Operations (TPO) for care coordination, and you have the right to revoke your consent in writing at any time.',
      '',
      '4. PROTECTION AGAINST PATIENT BROKERING (EKRA, 18 U.S.C. § 220):',
      'Federal law makes it a crime for anyone to pay or receive kickbacks, cash, or free airfare for patient referrals.',
      '',
      '5. RIGHT TO BREACH NOTIFICATION & COMPLAINTS:',
      'Programs must notify you of privacy breaches. You have the right to file formal complaints with HHS Office for Civil Rights (OCR) or SAMHSA without retaliation.',
      '============================================================',
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        cfrStatus.textContent = t('plan.rights.handoutCopied', 'Copied 42 CFR Part 2 privacy rights handout to clipboard.');
        announce(cfrStatus.textContent);
      }
    } catch {
      // ignore clipboard error
    }
  }

  syncChipStates();
  renderPreview();

  return h('div', { class: 'view view-prose' },
    pageHeader(
      t('plan.title', 'Safety planning, counseling & what to expect'),
      t(
        'plan.lede',
        'Build a private personal safety and recovery action plan in your browser, ride out a craving with an urge-surfing timer, get a word-for-word clinic call script, and see what really happens at intake.',
      ),
    ),
    emergencyCallout(),
    tocNav([
      ['safety-plan', t('plan.toc.safetyPlan', 'Personal safety & action plan')],
      ['craving-toolkit', t('plan.toc.cravingToolkit', 'Craving & distress toolkit (urge surfing)')],
      ['intake-guide', t('plan.toc.intake', 'What to expect & clinic call script')],
      ['counseling-modalities', t('plan.toc.modalities', 'Counseling & therapy approaches')],
      ['confidentiality-rights', t('plan.toc.rights', 'Your confidentiality rights (42 CFR Part 2)')],
    ]),

    // 1. Stanley-Brown Evidence-Based Suicide & Overdose Safety Plan Builder
    section('safety-plan', t('plan.section.safetyPlan', 'Personal safety & recovery action plan'),
      h('div', { class: 'callout callout-info' },
        h('p', { class: 'callout-title' }, icon('lock'), t('plan.zeroKnowledge.title', 'Stays in this browser tab: HarborPath does not save or send it')),
        p(t(
          'plan.zeroKnowledge.desc',
          'What you type or select below stays in this browser tab’s memory. HarborPath does not send it to a server or save it in cookies or site storage. Copying or printing it is up to you. Quick exit (or pressing Escape twice) clears it from this page, but cannot clear your clipboard or anything you printed.',
        )),
      ),

      h('form', {
        class: 'card',
        onsubmit: (e) => e.preventDefault(),
        'aria-label': t('plan.form.ariaLabel', 'Personal safety and recovery action plan builder'),
      },
        h('h3', null, t('plan.form.heading', 'Build your plan (fill in only what helps you)')),
        fine(t('plan.form.sub', 'Whether your goal today is staying alive, cutting back, starting medication, or preventing a return to use, small concrete steps help in a hard moment.')),

        createField({
          key: 'goal',
          id: 'plan-goal',
          label: t('plan.field.goal', '1. My recovery goal & reasons for living'),
          helpText: t('plan.help.goal', 'Examples: “Not use alone tonight”, “Start buprenorphine this week”, “Make it through the weekend without drinking”.'),
          placeholder: t('plan.placeholder.goal', 'What does staying safer or feeling better look like for you right now?'),
          rows: 1,
        }),

        createField({
          key: 'warningSigns',
          id: 'plan-warning-signs',
          label: t('plan.field.warningSigns', '2. Step 1: Warning signs & triggers (intrapersonal & environmental)'),
          helpText: t('plan.help.warningSigns', 'Notice thoughts, mood changes, physical cravings (intrapersonal) and places, payday, or situations (environmental) that signal an urge is building.'),
          placeholder: t('plan.placeholder.warningSigns', 'Intrapersonal: racing thoughts, feeling numb, restless, cravings. Environmental: payday, certain streets, conflict...'),
          rows: 3,
          chips: triggerChipsBar,
        }),

        createField({
          key: 'copingStrategies',
          id: 'plan-coping-steps',
          label: t('plan.field.copingStrategies', '3. Step 2: Internal coping strategies (things I can do on my own)'),
          helpText: t('plan.help.copingStrategies', 'Things you can do without contacting anyone to ride out an urge or calm your nervous system for 15 minutes.'),
          placeholder: t('plan.placeholder.copingStrategies', 'Urge surfing for 15 minutes, 4-7-8 breathing, taking a cold shower, listening to music, taking prescribed MOUD...'),
          rows: 3,
          chips: copingChipsBar,
        }),

        createField({
          key: 'socialDistractions',
          id: 'plan-social-distractions',
          label: t('plan.field.socialDistractions', '4. Step 3: People and safe social settings that provide distraction'),
          helpText: t('plan.help.socialDistractions', 'People or places that take your mind off things without having to discuss a crisis (coffee shop, library, gym, park, safe friends).'),
          placeholder: t('plan.placeholder.socialDistractions', 'Friends to chat about movies/sports with, public library, coffee shop, gym, walk in the park...'),
          rows: 2,
        }),

        createField({
          key: 'supportNetwork',
          id: 'plan-trusted-contacts',
          label: t('plan.field.supportNetwork', '5. Step 4: Family members or trusted friends I can ask for help'),
          helpText: t('plan.help.supportNetwork', 'People you trust to tell: "I am struggling / having strong cravings / need support staying safe right now."'),
          placeholder: t('plan.placeholder.supportNetwork', 'Trusted family member, peer recovery coach, sponsor, close friend with phone numbers...'),
          rows: 2,
        }),

        createField({
          key: 'professionals',
          id: 'plan-professionals',
          label: t('plan.field.professionals', '6. Step 5: Personal clinician, counselor & crisis escalation contacts'),
          helpText: t('plan.help.professionals', 'Your prescribing doctor, therapist, counselor, clinic intake number, or local mobile crisis team. (Free 24/7 hotlines 988, 911, Never Use Alone, and SafeSpot are pre-populated below).'),
          placeholder: t('plan.placeholder.professionals', 'My therapist, prescriber, clinic number, local crisis team...'),
          rows: 2,
        }),

        createField({
          key: 'environmentalSafety',
          id: 'plan-safer-environment',
          label: t('plan.field.environmentalSafety', '7. Step 6: Making the environment safe & substance locking'),
          helpText: t('plan.help.environmentalSafety', 'Ways to make your space safer: locked medication box, safe storage, separating substances, discarding old pills, removing lethal means.'),
          placeholder: t('plan.placeholder.environmentalSafety', 'Locking my medications in a lockbox, giving extra doses to a trusted person, not using alone, unlocking my door...'),
          rows: 2,
        }),

        createField({
          key: 'naloxoneLocation',
          id: 'plan-naloxone-location',
          label: t('plan.field.naloxoneLocation', '8. Where my naloxone (Narcan) & test strips are kept'),
          helpText: t('plan.help.naloxoneLocation', 'Make sure roommates, family, or visitors know the exact spots where naloxone is kept without having to search.'),
          placeholder: t('plan.placeholder.naloxoneLocation', 'Example: Top drawer by front door and front zippered pocket of my backpack...'),
          rows: 1,
        }),

        createField({
          key: 'notes',
          id: 'plan-notes',
          label: t('plan.field.notes', '9. Notes, reminders to myself & reasons for living'),
          helpText: t('plan.help.notes', 'What helps you remember your resilience and worth when things feel heavy?'),
          placeholder: t('plan.placeholder.notes', 'A slip does not erase my progress. I have survived hard moments before. I deserve safe, respectful care...'),
          rows: 2,
        }),
      ),

      h('div', { class: 'card safety-plan-preview', 'aria-labelledby': 'safety-plan-preview-title' },
        h('h3', { id: 'safety-plan-preview-title' }, t('plan.preview.heading', 'Your printable safety & action plan')),
        fine(t('plan.preview.sub', 'Print this card, save it as a PDF on your device, or copy the plain text to keep with you.')),
        previewBody,
        h('div', { class: 'actions' },
          h('button', {
            type: 'button',
            class: 'btn btn-primary',
            onclick: handleCopyPlan,
          }, icon('copy'), t('plan.btn.copy', 'Copy plan to clipboard')),
          h('button', {
            type: 'button',
            class: 'btn btn-secondary',
            onclick: () => window.print(),
          }, icon('printer'), t('plan.btn.print', 'Print / Save as PDF')),
          h('button', {
            type: 'button',
            class: 'btn btn-ghost',
            onclick: handleClearPlan,
          }, icon('x'), t('plan.btn.clear', 'Clear plan')),
        ),
        fine(t('privacy.clipboardNote', 'Copied text stays on your clipboard after Quick exit.')),
        copyStatus,
      ),
    ),

    // 1b. Interactive Craving & Distress Toolkit (Urge Surfing & Visual Breathing Pacer)
    section('craving-toolkit', t('plan.section.cravingToolkit', 'Craving & distress toolkit (urge surfing & grounding timer)'),
      p(t(
        'plan.cravingToolkit.intro',
        'Having an urge or sudden wave of anxiety right now? Use this 3- or 5-minute guided pacer and evidence-based grounding exercises to help your nervous system ride out the peak safely.',
      )),
      urgeSurfingTimer(),
      h('div', { class: 'results-list' },
        GROUNDING_EXERCISES.map((ex) => h('article', { class: 'card', id: `grounding-${ex.id}` },
          h('h3', null, ex.title),
          fine(strong('Clinical basis: '), ex.clinicalBasis),
          p(strong('When to use it: '), ex.whenToUse),
          ul(ex.steps),
        )),
      ),
    ),

    // 2. What to Expect at Your First Appointment (SUDP Intake Guide + Call Script Builder)
    section('intake-guide', t('plan.section.intake', 'What to expect at your first appointment (SUDP intake guide)'),
      p(t(
        'plan.intake.intro',
        'Calling or walking into a treatment program for the first time can feel intimidating—especially if you have had judgmental healthcare experiences in the past. Knowing what happens step by step puts you in the driver’s seat.',
      )),
      intakeScriptBuilderCard(),
      h('ol', { class: 'steps' },
        INTAKE_STEPS.map((s) => h('li', { class: 'step', id: `intake-step-${s.step}` },
          h('span', { class: 'step-num', 'aria-hidden': 'true' }, String(s.step)),
          h('div', { class: 'step-body' },
            h('h3', null, s.title),
            p(strong(s.summary)),
            ul(s.details),
            s.relatedCodes.length > 0 && h('p', { class: 'actions' },
              h('a', {
                class: 'btn btn-small btn-secondary',
                href: `#/treatment?codes=${s.relatedCodes.join(',')}`,
              }, icon('search'), `Search facilities (${s.relatedCodes.join(', ')})`),
            ),
          ),
        )),
      ),
    ),

    // 3. Counseling & Therapy Approaches Explained
    section('counseling-modalities', t('plan.section.modalities', 'Counseling & therapy approaches explained'),
      p(t(
        'plan.modalities.intro',
        'Quality substance use counseling is never about breaking you down or lecturing you. Licensed Substance Use Disorder Professionals (SUDPs) and clinical counselors use practical, evidence-based therapies tailored to your goals—and counseling works best when paired with FDA-approved medications if you have opioid or alcohol use disorder.',
      )),
      h('div', { class: 'results-list' },
        COUNSELING_MODALITIES.map((m) => h('article', { class: 'card' },
          h('div', { class: 'facility-head' },
            h('h3', { class: 'facility-name' }, m.name),
            h('span', { class: 'chip chip-care' }, m.code),
          ),
          p(strong('Best for: '), m.bestFor),
          p(strong('What it looks like in real life: '), m.whatItLooksLike),
          h('p', { class: 'actions' },
            h('a', {
              class: 'btn btn-small btn-secondary',
              href: `#/treatment?codes=${m.samhsaCode}`,
            }, icon('compass'), `Find ${m.code} programs near me`),
          ),
        )),
      ),
    ),

    // 4. Your Confidentiality Rights (42 CFR Part 2 — 2024/2026 Final Rule) & Printable Handout
    section('confidentiality-rights', t('plan.section.rights', 'Your confidentiality rights (42 CFR Part 2 — 2024/2026 Final Rule)'),
      p(t(
        'plan.rights.intro',
        'Fear that an employer, landlord, police officer, or court will find out you asked for help is one of the biggest barriers to care. Federal law gives substance use disorder (SUD) treatment records special, heightened legal protection beyond regular medical records.',
      )),
      h('article', { class: 'card print-handout', id: 'cfr-part2-handout' },
        h('h3', null, t('plan.rights.handoutTitle', '42 CFR Part 2 Patient Privacy Rights Handout (2024/2026 Final Rule)')),
        fine(t('plan.rights.handoutSub', 'Federal privacy protections for substance use disorder (SUD) treatment records under 42 CFR Part 2 and 89 FR 12472.')),
        h('div', { class: 'callout callout-info' },
          p(strong(t('plan.rights.ruleCitation', 'HHS / SAMHSA Final Rule (89 FR 12472 — Full Compliance 2026): ')),
            t('plan.rights.ruleDesc', 'Heightened federal confidentiality shield protecting your health information, identity, and clinical records.')),
        ),
        h('ul', { class: 'checklist' },
          h('li', null,
            strong(t('plan.rights.shieldTitle', 'Shield against police, courts & criminal prosecution: ')),
            t('plan.rights.shieldDesc', 'Your treatment records cannot be used to investigate or prosecute you without your explicit written consent or a special high-threshold court order requiring notice and a hearing. A police request or general subpoena is not enough.')),
          h('li', null,
            strong(t('plan.rights.notesTitle', 'Special protection for counseling notes: ')),
            t('plan.rights.notesDesc', 'Clinical session notes from your SUDP or therapist are protected separately from general medical records and cannot be shared without a separate, specific written consent from you.')),
          h('li', null,
            strong(t('plan.rights.consentTitle', 'Patient control of consent & right to revoke: ')),
            t('plan.rights.consentDesc', 'You decide whether to sign a single consent for Treatment, Payment, and Healthcare Operations (TPO) for care coordination, and you have the right to revoke your consent in writing at any time.')),
          h('li', null,
            strong(t('plan.rights.brokeringTitle', 'Protection from patient brokering (EKRA, 18 U.S.C. § 220): ')),
            t('plan.rights.brokeringDesc', 'Federal law makes it a crime to pay or accept kickbacks, cash, or free airfare to steer patients into treatment programs.')),
          h('li', null,
            strong(t('plan.rights.complaintTitle', 'Right to breach notification & filing complaints: ')),
            t('plan.rights.complaintDesc', 'Programs must notify you of privacy breaches. You have the right to file formal complaints with HHS Office for Civil Rights (OCR) or SAMHSA without penalty.')),
        ),
        h('div', { class: 'actions' },
          h('button', {
            type: 'button',
            class: 'btn btn-primary btn-small',
            onclick: () => window.print(),
          }, icon('printer'), t('plan.rights.printBtn', 'Print confidentiality handout')),
          h('button', {
            type: 'button',
            class: 'btn btn-secondary btn-small',
            onclick: handleCopyCfrHandout,
          }, icon('copy'), t('plan.rights.copyBtn', 'Copy handout text')),
        ),
        cfrStatus,
      ),
      fine(
        'Learn more from ',
        ext('https://www.hhs.gov/hipaa/for-professionals/regulatory-initiatives/fact-sheet-42-cfr-part-2-final-rule/index.html', 'HHS: 42 CFR Part 2 Final Rule Fact Sheet'),
        ' and ',
        h('a', { href: '#/choosing-care' }, 'Choosing quality care'),
        '.',
      ),
    ),
  );
}
