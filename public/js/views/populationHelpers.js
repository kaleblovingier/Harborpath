/**
 * Population-specific helpers for HarborPath Clinical Care Navigator.
 * Pure functions that return recommended SAMHSA service codes, clinical
 * action steps, safety-net health network links, and treatment search routes.
 * All client-side in ephemeral browser memory; no PHI transmitted.
 */

import { t } from '../i18n.js';

function normalizeSubstancesInput(raw) {
  if (!raw) return new Set();
  if (raw instanceof Set) {
    return new Set([...raw].map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  }
  if (Array.isArray(raw)) {
    return new Set(raw.map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  }
  if (typeof raw === 'string') {
    return new Set(raw.split(',').map((s) => s.toLowerCase().trim()).filter(Boolean));
  }
  return new Set();
}

export function recommendForPregnancy() {
  return {
    id: 'pregnancy',
    title: t('pop.pregnancy.title', 'Pregnancy & Postpartum Perinatal Care (ACOG / ASAM)'),
    codes: ['PW', 'HI', 'DT', 'MD', 'SS'],
    searchHref: '#/treatment?codes=PW,HI,DT,MD,SS',
    healthNetwork: 'clinics',
    guidance: t(
      'pop.pregnancy.guidance',
      'Pregnancy/postpartum: Prioritize specialty programs (PW), hospital inpatient if needed (HI), withdrawal management (DT), and Medicaid/sliding scale. Follow ACOG standards.',
    ),
    clinicalActions: [
      t(
        'pop.pregnancy.action1',
        'Start or continue agonist medication (buprenorphine BU or methadone MU/OTP) per ACOG and ASAM standards rather than abrupt detox, which carries high risk of fetal distress and preterm labor.',
      ),
      t(
        'pop.pregnancy.action2',
        'Request a supportive, non-punitive Plan of Safe Care under federal CAPTA guidelines and rooming-in newborn care (Eat, Sleep, Console) to keep birthing parent and infant together.',
      ),
      t(
        'pop.pregnancy.action3',
        'Under federal EMTALA law, hospital emergency departments and labor units must screen and stabilize active labor or acute withdrawal regardless of insurance or ability to pay.',
      ),
    ],
  };
}

export function recommendForYouth() {
  return {
    id: 'youth',
    title: t('pop.youth.title', 'Adolescents & Young Adults (Youth-Specific Care)'),
    codes: ['ADOL', 'YA', 'IOP', 'RES', 'TELE'],
    searchHref: '#/treatment?codes=ADOL,YA,IOP,RES,TELE',
    healthNetwork: 'clinics',
    guidance: t(
      'pop.youth.guidance',
      'Adolescents/young adults: Age-specific residential, IOP, or telehealth options. Confirm consent and family involvement policies.',
    ),
    clinicalActions: [
      t(
        'pop.youth.action1',
        'Prioritize age-separated adolescent (ADOL) or young adult (YA) outpatient, IOP, or residential programs so youth are supported alongside peers rather than in adult-only units.',
      ),
      t(
        'pop.youth.action2',
        'Confirm state minor-consent confidentiality rules, 42 CFR Part 2 privacy protections, school continuity, and evidence-based family systems support.',
      ),
      t(
        'pop.youth.action3',
        'Per AAP and ASAM guidance, adolescents and young adults with opioid use disorder should be offered buprenorphine (BU) and naloxone overdose education (NOE).',
      ),
    ],
  };
}

export function recommendForJusticeInvolved() {
  return {
    id: 'justice',
    title: t('pop.justice.title', 'Justice-Involved & Post-Release Reentry Care'),
    codes: ['CJ', 'OTP', 'BU', 'OP', 'NOE'],
    searchHref: '#/treatment?codes=CJ,OTP,BU,OP,NOE',
    healthNetwork: 'clinics',
    guidance: t(
      'pop.justice.guidance',
      'Justice-involved/reentry: High overdose risk post-release. Prioritize MOUD (OTP/BU), outpatient, and naloxone education (NOE).',
    ),
    clinicalActions: [
      t(
        'pop.justice.action1',
        'Carry multi-dose naloxone (NOE) immediately upon release: physiological opioid tolerance drops sharply during incarceration, making the first 7 to 14 days post-release a critical overdose risk window.',
      ),
      t(
        'pop.justice.action2',
        'Prevent any gap in daily buprenorphine (BU) or methadone (OTP); if clinic transfer is delayed after release, an emergency department can dispense up to 72 hours of bridge medication under 21 CFR § 1306.07(b).',
      ),
      t(
        'pop.justice.action3',
        'Connect with justice-involved reentry navigators (CJ) for Medicaid reactivation, CMS Section 1115 Reentry Waiver pre-release coverage continuity, ID, and recovery housing.',
      ),
    ],
  };
}

export function recommendForOlderAdults() {
  return {
    id: 'older',
    title: t('pop.older.title', 'Older Adults & Seniors (Age-Friendly Care)'),
    codes: ['SEN', 'OP', 'MD', 'MHSU'],
    searchHref: '#/treatment?codes=SEN,OP,MD,MHSU',
    healthNetwork: 'clinics',
    guidance: t(
      'pop.older.guidance',
      'Older adults: Medical comorbidity-aware outpatient care, Medicare/Medicaid, and co-occurring mental health support.',
    ),
    clinicalActions: [
      t(
        'pop.older.action1',
        'Choose senior-focused programs (SEN) that coordinate closely with primary care for cardiovascular, hepatic, renal, and mobility needs.',
      ),
      t(
        'pop.older.action2',
        'Review prescribed sedatives, pain medications, and alcohol interactions with a clinician to reduce fall risk, confusion, and respiratory depression.',
      ),
      t(
        'pop.older.action3',
        'Verify Medicare (MC) and Medicaid (MD) benefits, including Medicare coverage for Opioid Treatment Program (OTP) methadone and office-based buprenorphine.',
      ),
    ],
  };
}

export function recommendForStimulants() {
  return {
    id: 'stimulants',
    title: t('pop.stimulants.title', 'Stimulant Use Care (Methamphetamine & Cocaine)'),
    codes: ['CMI', 'OP', 'TELE', 'MHSU'],
    searchHref: '#/treatment?codes=CMI,OP,TELE,MHSU',
    healthNetwork: 'clinics',
    guidance: t(
      'pop.stimulants.guidance',
      'Stimulant use: Contingency management (CMI), outpatient, and telehealth. No agonist medication currently approved.',
    ),
    clinicalActions: [
      t(
        'pop.stimulants.action1',
        'Seek programs offering Contingency Management (CMI) and cognitive behavioral support, which have the strongest clinical evidence for stimulant recovery.',
      ),
      t(
        'pop.stimulants.action2',
        'Address post-acute stimulant depression, exhaustion (“crash”), insomnia, and nutrition with integrated mental health and primary care (MHSU).',
      ),
      t(
        'pop.stimulants.action3',
        'Carry naloxone (NOE) and fentanyl test strips, because street stimulants and pressed pills frequently contain hidden fentanyl.',
      ),
    ],
  };
}

export function recommendForXylazine() {
  return {
    id: 'xylazine',
    title: t('pop.xylazine.title', 'Xylazine & Medetomidine (“Tranq”) Withdrawal & Wound Care'),
    codes: ['BU', 'OTP', 'DT', 'NOE'],
    searchHref: '#/treatment?codes=BU,OTP,DT,NOE',
    healthNetwork: 'er',
    guidance: t(
      'pop.xylazine.guidance',
      'Xylazine/medetomidine: Address alpha-2 rebound with clonidine/tizanidine alongside MOUD. Include naloxone and wound care education.',
    ),
    clinicalActions: [
      t(
        'pop.xylazine.action1',
        'Treat both opioid and alpha-2 adrenergic withdrawal: ask clinicians about clonidine, tizanidine, or dexmedetomidine alongside buprenorphine (BU) or methadone (OTP) to manage rebound blood pressure spikes and anxiety.',
      ),
      t(
        'pop.xylazine.action2',
        'Always administer naloxone (NOE) for suspected overdose to reverse the opioid component, and provide rescue breathing since xylazine sedation does not respond to naloxone.',
      ),
      t(
        'pop.xylazine.action3',
        'Clean xylazine skin wounds gently with sterile saline or clean water and cover with moist non-stick dressings (avoid peroxide or alcohol); seek prompt medical wound care (#/health) for fever or spreading redness.',
      ),
    ],
  };
}

export function recommendForCoOccurring() {
  return {
    id: 'coOccurring',
    title: t('pop.coOccurring.title', 'Co-Occurring Mental Health & Trauma-Informed Care'),
    codes: ['MHSU', 'TRMA', 'IOP', 'OP'],
    searchHref: '#/treatment?codes=MHSU,TRMA,IOP,OP',
    healthNetwork: 'clinics',
    guidance: t(
      'pop.coOccurring.guidance',
      'Co-occurring serious mental illness: Integrated dual-diagnosis programs, trauma-informed care, and appropriate level of intensity.',
    ),
    clinicalActions: [
      t(
        'pop.coOccurring.action1',
        'Choose integrated Dual-Diagnosis programs (MHSU) that treat mental health conditions and substance use together rather than requiring abstinence before psychiatric care.',
      ),
      t(
        'pop.coOccurring.action2',
        'Look for trauma-informed programs (TRMA) that emphasize physical and emotional safety, choice, and non-confrontational care.',
      ),
      t(
        'pop.coOccurring.action3',
        'Continue both psychiatric medications and MOUD (buprenorphine or methadone) without interruption, and use 988 or walk-in crisis care (WI) whenever emotional distress escalates.',
      ),
    ],
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

const KEY_ALIASES = {
  pregnancy: 'pregnancy',
  pregnant: 'pregnancy',
  pw: 'pregnancy',
  youth: 'youth',
  adol: 'youth',
  ya: 'youth',
  adolescent: 'youth',
  justice: 'justice',
  justiceinvolved: 'justice',
  reentry: 'justice',
  cj: 'justice',
  older: 'older',
  olderadults: 'older',
  sen: 'older',
  seniors: 'older',
  stimulants: 'stimulants',
  stimulant: 'stimulants',
  cmi: 'stimulants',
  xylazine: 'xylazine',
  medetomidine: 'xylazine',
  tranq: 'xylazine',
  cooccurring: 'coOccurring',
  mhsu: 'coOccurring',
  trauma: 'coOccurring',
  trma: 'coOccurring',
};

/**
 * Evaluates active priority population care pathways from either an array/Set
 * of population keys (`['pregnancy', 'xylazine']`) or an object of boolean
 * flags / ASAM self-check answers (`{ pregnant: true, xylazine: true, population: 'CJ' }`).
 *
 * @param {Array<string>|Set<string>|Record<string, any>} [flags]
 * @returns {{
 *   pathways: Array<ReturnType<typeof recommendForPregnancy>>,
 *   combinedCodes: string[],
 *   priorityAlerts: string[]
 * }}
 */
export function evaluatePopulationPathways(flags = {}) {
  const activeKeys = [];
  const addKey = (k) => {
    if (k && ALL_POPULATION_RECOMMENDERS[k] && !activeKeys.includes(k)) {
      activeKeys.push(k);
    }
  };

  if (Array.isArray(flags) || flags instanceof Set) {
    for (const rawKey of flags) {
      const norm = String(rawKey ?? '').trim();
      const mapped = ALL_POPULATION_RECOMMENDERS[norm]
        ? norm
        : KEY_ALIASES[norm.toLowerCase()];
      if (mapped) addKey(mapped);
    }
  } else if (flags && typeof flags === 'object') {
    const substances = normalizeSubstancesInput(flags.substances);
    const pop = String(flags.population ?? '').toUpperCase().trim();

    if (flags.pregnancy || flags.pregnant || flags.biomedical === 'pregnant' || pop === 'PW') {
      addKey('pregnancy');
    }
    if (flags.xylazine || flags.medetomidine || substances.has('xylazine')) {
      addKey('xylazine');
    }
    if (flags.youth || flags.adolescent || pop === 'ADOL' || pop === 'YA') {
      addKey('youth');
    }
    if (flags.justice || flags.justiceInvolved || flags.reentry || pop === 'CJ') {
      addKey('justice');
    }
    if (flags.older || flags.olderAdults || pop === 'SEN') {
      addKey('older');
    }
    if (flags.stimulants || substances.has('stimulants')) {
      addKey('stimulants');
    }
    if (
      flags.coOccurring ||
      (typeof flags.mentalHealth === 'string' &&
        flags.mentalHealth !== '' &&
        flags.mentalHealth !== 'none')
    ) {
      addKey('coOccurring');
    }
  }

  const pathways = activeKeys.map((key) => ALL_POPULATION_RECOMMENDERS[key]());
  const combinedCodes = [];
  const priorityAlerts = [];

  for (const pathway of pathways) {
    if (pathway.guidance && !priorityAlerts.includes(pathway.guidance)) {
      priorityAlerts.push(pathway.guidance);
    }
    for (const code of pathway.codes ?? []) {
      if (code && !combinedCodes.includes(code) && combinedCodes.length < 8) {
        combinedCodes.push(code);
      }
    }
  }

  return {
    pathways,
    combinedCodes,
    priorityAlerts,
  };
}
