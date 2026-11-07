/**
 * Population-specific helpers for HarborPath Clinical Care Navigator.
 * Pure functions that return recommended SAMHSA service codes, clinical
 * action steps, safety-net health network links, and treatment search routes.
 * All client-side in ephemeral browser memory; no PHI transmitted.
 *
 * Privacy: every finder link built here is `#/treatment?codes=...` and carries
 * only SAMHSA service codes that the finder already accepts. Answers, ages,
 * and flags never go into the URL.
 *
 * Clinical safety: the answer-specific care-route additions at the end of this
 * file add no medication doses, dose ranges, or schedules. Each clinical
 * statement there carries a source comment.
 */

import { t } from '../i18n.js';

// Same limit as the finder (public/js/components/finder.js MAX_FILTERS) and
// the server (src/schema.js MAX_CODES).
export const MAX_ROUTE_CODES = 8;

/** Build a finder link from SAMHSA codes: deduplicated, at most 8, codes only. */
export function buildTreatmentHref(codes = []) {
  const clean = [];
  for (const raw of codes) {
    const code = String(raw ?? '').trim().toUpperCase();
    if (/^[A-Z0-9_]+$/.test(code) && !clean.includes(code)) clean.push(code);
  }
  const limited = clean.slice(0, MAX_ROUTE_CODES);
  return limited.length ? `#/treatment?codes=${limited.join(',')}` : '#/treatment';
}

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

// ---------------------------------------------------------------------------
// Answer-specific care-route additions (PR #2, Phase 1 population routes)
//
// The priority population pathways above are the navigator's single care-route
// UI. These additions only add what the static pathways cannot: narrower
// finder searches built from the person's own answers (one or two codes, so a
// rural search still returns results), an urgent hospital callout for tranq,
// and a few notes not already covered by the pathway's clinical actions or the
// navigator's red flags. Each addition names the pathway card it belongs to.
// ---------------------------------------------------------------------------

export const CARE_ROUTE_IDS = ['pregnancy', 'youth', 'reentry', 'xylazine'];

/** The population pathway card (ALL_POPULATION_RECOMMENDERS key) each route adds to. */
export const CARE_ROUTE_PATHWAY = Object.freeze({
  pregnancy: 'pregnancy',
  youth: 'youth',
  reentry: 'justice',
  xylazine: 'xylazine',
});

/**
 * Input the navigator passes to evaluateTransitionRisk() for the reentry route.
 * Conservative defaults: the navigator does not ask about timing, MOUD, or
 * naloxone, so the route assumes the highest-risk case.
 */
export const REENTRY_TRANSITION_INPUT = Object.freeze({
  event: 'post_release',
  daysSince: 'under_7',
  onMoud: false,
  hasNaloxone: false,
});

/**
 * Which care routes the navigator answers point to. Pure; reads only the
 * answers object already held in browser memory. Uses the same triggers as
 * evaluatePopulationPathways() so each route has a matching pathway card.
 * @returns {Array<'pregnancy'|'youth'|'reentry'|'xylazine'>}
 */
export function detectCareRoutes(answers = {}) {
  const substances = normalizeSubstancesInput(answers?.substances);
  const routes = [];
  if (answers?.biomedical === 'pregnant') routes.push('pregnancy');
  if (answers?.population === 'ADOL' || answers?.population === 'YA') routes.push('youth');
  if (answers?.population === 'CJ') routes.push('reentry');
  if (substances.has('xylazine')) routes.push('xylazine');
  return routes;
}

function routeLink(label, codes) {
  return { label, codes: [...codes], href: buildTreatmentHref(codes) };
}

function pregnancyRoute({ substances, withdrawalRisk }) {
  const hasOpioids = substances.has('opioids');
  const hasGaba = substances.has('alcohol') || substances.has('benzos');
  const notes = [];
  if (hasGaba) {
    // ASAM Clinical Practice Guideline on Alcohol Withdrawal Management (2020):
    // pregnancy is a reason for closer medical management of withdrawal.
    notes.push(t(
      'nav.route.pregnancy.why.gaba',
      'Do not stop alcohol or sedatives suddenly on your own. Withdrawal can be dangerous in pregnancy, so get medically supervised care (ASAM).',
    ));
  }
  // ACOG Committee Opinion 711 (2017): return to use is far more common
  // postpartum than during pregnancy; postpartum overdose training and
  // naloxone co-prescribing. SAMHSA Clinical Guidance for Treating Pregnant
  // and Parenting Women With OUD (2018): continue treatment after delivery.
  notes.push(t(
    'nav.route.pregnancy.why.postpartum',
    'The months after birth carry a higher risk of return to use and overdose. Keep your treatment going after delivery and keep naloxone at home (ACOG, SAMHSA).',
  ));

  const links = [routeLink(t('nav.route.pregnancy.link.pw', 'Programs for pregnant or postpartum people'), ['PW'])];
  if (hasOpioids) {
    // ACOG CO 711: buprenorphine or methadone is recommended in pregnancy.
    links.push(routeLink(t('nav.route.pregnancy.link.pw_bu', 'Pregnancy programs that offer buprenorphine'), ['PW', 'BU']));
    links.push(routeLink(t('nav.route.link.otp', 'Methadone clinics (opioid treatment programs)'), ['OTP']));
  }
  if (withdrawalRisk === 'severe' || (hasGaba && withdrawalRisk === 'moderate')) {
    links.push(routeLink(t('nav.route.pregnancy.link.pw_hi', 'Pregnancy programs with hospital inpatient care'), ['PW', 'HI']));
  }

  return {
    id: 'pregnancy',
    notes,
    links,
    extraLinks: [{ label: t('nav.route.link.meds', 'Medication guide'), href: '#/medications' }],
    sources: 'ACOG Committee Opinion 711 (2017); SAMHSA Clinical Guidance for Treating Pregnant and Parenting Women With OUD (2018); ASAM Alcohol Withdrawal Management Guideline (2020).',
  };
}

function youthRoute({ substances, population, mentalHealth, preferTelehealth }) {
  // The youth pathway card already covers age-specific care (NIDA), minor
  // consent and 42 CFR Part 2, and MOUD for adolescents (ASAM, AAP); this
  // route only adds narrower searches.
  const ageCode = population === 'YA' ? 'YA' : 'ADOL';
  const links = [routeLink(
    ageCode === 'YA'
      ? t('nav.route.youth.link.ya', 'Programs for young adults')
      : t('nav.route.youth.link.adol', 'Programs for teens'),
    [ageCode],
  )];
  if (substances.has('opioids')) {
    links.push(routeLink(t('nav.route.youth.link.bu', 'Youth programs that offer buprenorphine'), [ageCode, 'BU']));
  }
  if (mentalHealth && mentalHealth !== 'none') {
    links.push(routeLink(t('nav.route.youth.link.mhsu', 'Youth programs for mental health and substance use together'), [ageCode, 'MHSU']));
  }
  if (preferTelehealth) {
    links.push(routeLink(t('nav.route.youth.link.tele', 'Youth programs with telehealth'), [ageCode, 'TELE']));
  }
  return {
    id: 'youth',
    notes: [],
    links,
    extraLinks: [{ label: t('nav.route.link.family', 'Family and recovery support'), href: '#/support' }],
    sources: 'NIDA Principles of Adolescent SUD Treatment (2014); ASAM National Practice Guideline for OUD (2020); 42 CFR Part 2 § 2.14.',
  };
}

function reentryRoute({ transition }) {
  // Codes come from evaluateTransitionRisk({ event: 'post_release' }) in
  // navigator.js, so the route stays consistent with the transition engine.
  // The justice pathway card already covers the post-release tolerance drop,
  // naloxone, and MOUD continuity (NIDA Criminal Justice DrugFacts; SAMHSA
  // Use of MAT for OUD in Criminal Justice Settings, 2019).
  const recommended = transition?.recommendedCodes?.length ? transition.recommendedCodes : ['CJ', 'BU', 'NOE', 'PEER'];
  const has = (c) => recommended.includes(c);

  const notes = [
    // CDC "What You Should Know About Xylazine" (overdose prevention section):
    // "Never use alone"; carry naloxone and learn how to use it.
    t(
      'nav.route.reentry.why.naloxone',
      'Make sure someone near you has naloxone and knows how to use it, and do not use alone (CDC).',
    ),
  ];

  const links = [];
  if (has('CJ') && has('BU')) links.push(routeLink(t('nav.route.reentry.link.cj_bu', 'Re-entry programs that offer buprenorphine'), ['CJ', 'BU']));
  links.push(routeLink(t('nav.route.link.otp', 'Methadone clinics (opioid treatment programs)'), ['OTP']));
  if (has('NOE')) links.push(routeLink(t('nav.route.link.noe', 'Places that offer naloxone and overdose education'), ['NOE']));
  if (has('CJ') && has('PEER')) links.push(routeLink(t('nav.route.reentry.link.cj_peer', 'Re-entry programs with peer support'), ['CJ', 'PEER']));

  return {
    id: 'reentry',
    notes,
    neverUseAlone: true,
    links,
    extraLinks: [{ label: t('nav.route.link.overdose', 'Overdose response steps'), href: '#/overdose' }],
    sources: 'NIDA Criminal Justice DrugFacts; SAMHSA Use of MAT for OUD in Criminal Justice Settings (2019); CDC overdose prevention.',
  };
}

function xylazineRoute({ withdrawalRisk, biomedical }) {
  // Same trigger as the navigator's xylazine red flag (nav.redflag.xylazine_acuity).
  const urgent = withdrawalRisk === 'moderate' || withdrawalRisk === 'severe' || biomedical === 'acute_infection';
  const notes = [];
  if (urgent) {
    // CDC MMWR 2025;74(15) (Pittsburgh, Oct 2024 to Mar 2025): severe
    // medetomidine withdrawal with tachycardia, severe hypertension, and
    // agitation; 9 of 10 confirmed patients needed ICU care. CDC "What You
    // Should Know About Xylazine": wounds can become infected and worsen quickly.
    notes.push(t(
      'nav.route.xylazine.why.urgent',
      'Based on your answers, go to an emergency department or hospital now if you have a racing heart, chest pain, confusion, fever, or a wound that is spreading or turning dark (CDC).',
    ));
  }
  // CDC MMWR 2025;74(15): opioids and sedatives gave minimal response; tell
  // the care team about possible exposure so withdrawal is recognized.
  notes.push(t(
    'nav.route.xylazine.why.tell',
    'Tell clinicians you may have been exposed to tranq, so they can watch for its withdrawal as well as opioid withdrawal (CDC).',
  ));

  const links = [];
  if (urgent) links.push(routeLink(t('nav.route.xylazine.link.hi', 'Hospital inpatient care'), ['HI']));
  links.push(routeLink(t('nav.route.xylazine.link.bu', 'Places that offer buprenorphine'), ['BU']));
  links.push(routeLink(t('nav.route.link.otp', 'Methadone clinics (opioid treatment programs)'), ['OTP']));
  links.push(routeLink(t('nav.route.link.noe', 'Places that offer naloxone and overdose education'), ['NOE']));

  return {
    id: 'xylazine',
    urgent,
    notes,
    links,
    extraLinks: [
      { label: t('nav.route.link.harm', 'Wound care and harm reduction'), href: '#/harm-reduction' },
      { label: t('nav.route.link.overdose', 'Overdose response steps'), href: '#/overdose' },
    ],
    sources: 'CDC What You Should Know About Xylazine; CDC MMWR 2025;74(15) medetomidine withdrawal reports.',
  };
}

/**
 * Build the answer-specific care-route additions for the navigator's answers.
 *
 * @param {object} answers - the navigator's in-memory answers
 * @param {{ transition?: { recommendedCodes: string[] } }} [context]
 *   `transition` is evaluateTransitionRisk(REENTRY_TRANSITION_INPUT) from navigator.js.
 * @returns {Array<{ id: string, pathwayId: string, notes: string[],
 *   links: Array<{ label: string, codes: string[], href: string }>,
 *   extraLinks: Array<{ label: string, href: string }>, sources: string,
 *   urgent?: boolean, neverUseAlone?: boolean }>}
 */
export function buildCareRoutes(answers = {}, { transition } = {}) {
  const ctx = {
    substances: normalizeSubstancesInput(answers?.substances),
    withdrawalRisk: answers?.withdrawalRisk ?? 'none',
    biomedical: answers?.biomedical ?? 'none',
    mentalHealth: answers?.mentalHealth ?? 'none',
    population: answers?.population ?? '',
    preferTelehealth: Boolean(answers?.preferTelehealth),
    transition,
  };
  const builders = { pregnancy: pregnancyRoute, youth: youthRoute, reentry: reentryRoute, xylazine: xylazineRoute };
  return detectCareRoutes(answers).map((id) => ({ ...builders[id](ctx), pathwayId: CARE_ROUTE_PATHWAY[id] }));
}
