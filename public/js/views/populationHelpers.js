/**
 * Population-specific helpers for HarborPath Clinical Care Navigator.
 * Pure functions that return recommended SAMHSA service codes and
 * pre-built treatment search links. All client-side; no PHI transmitted.
 * Supports expanding usefulness to more individuals (pregnancy, youth,
 * justice-involved, older adults, stimulants, xylazine, co-occurring MH).
 *
 * Privacy: every link built here is `#/treatment?codes=...` and carries only
 * SAMHSA service codes that the finder already accepts (the same shape as the
 * finder's own presets and the navigator's existing search link). Answers,
 * ages, and flags never go into the URL.
 *
 * Clinical safety: no medication doses, dose ranges, or schedules appear in
 * this file. Every clinical statement carries a source comment.
 */
import { t } from '../i18n.js';

// Same limit as the finder (public/js/components/finder.js MAX_FILTERS) and
// the server (src/findtreatment.js MAX_CODES).
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

export function recommendForPregnancy() {
  return {
    // DT dropped from the pregnancy preset: ACOG CO 711 recommends agonist
    // therapy over medically supervised withdrawal for opioid use disorder.
    codes: ['PW', 'HI', 'MD', 'SS'],
    searchHref: '#/treatment?codes=PW,HI,MD,SS',
    // ACOG Committee Opinion 711 (2017): opioid agonist pharmacotherapy
    // (buprenorphine or methadone) is recommended over medically supervised withdrawal.
    guidance: 'Pregnancy/postpartum: Prioritize specialty programs (PW), hospital inpatient if needed (HI), and Medicaid/sliding scale. Continue or start buprenorphine or methadone rather than detox (ACOG Committee Opinion 711).',
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
    // CDC, "What You Should Know About Xylazine": naloxone does not reverse
    // xylazine but should still be given; wounds can worsen quickly.
    guidance: 'Xylazine/medetomidine: Pair MOUD with medical care that can manage alpha-2 sedative withdrawal and wounds. Naloxone does not reverse xylazine but should still be given for suspected overdose (CDC).',
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

// ---------------------------------------------------------------------------
// Phase 1 care routes shown after the navigator's assessment
// ---------------------------------------------------------------------------

export const CARE_ROUTE_IDS = ['pregnancy', 'youth', 'reentry', 'xylazine'];

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

function substanceSet(raw) {
  if (!raw) return new Set();
  const list = raw instanceof Set || Array.isArray(raw) ? [...raw] : String(raw).split(',');
  return new Set(list.map((s) => String(s).toLowerCase().trim()).filter(Boolean));
}

/**
 * Which care routes the navigator answers point to. Pure; reads only the
 * answers object already held in browser memory.
 * @returns {Array<'pregnancy'|'youth'|'reentry'|'xylazine'>}
 */
export function detectCareRoutes(answers = {}) {
  const substances = substanceSet(answers?.substances);
  const routes = [];
  if (answers?.biomedical === 'pregnant') routes.push('pregnancy');
  if (answers?.population === 'ADOL' || answers?.population === 'YA') routes.push('youth');
  if (answers?.population === 'CJ') routes.push('reentry');
  if (substances.has('xylazine')) routes.push('xylazine');
  return routes;
}

function link(label, codes) {
  return { label, codes: [...codes], href: buildTreatmentHref(codes) };
}

function pregnancyRoute({ substances, withdrawalRisk }) {
  const hasOpioids = substances.has('opioids');
  const hasGaba = substances.has('alcohol') || substances.has('benzos');
  const why = [];
  if (hasOpioids) {
    // ACOG Committee Opinion 711 (2017, Opioid Use and Opioid Use Disorder in
    // Pregnancy) and SAMHSA Clinical Guidance for Treating Pregnant and
    // Parenting Women With Opioid Use Disorder and Their Infants (2018):
    // buprenorphine or methadone is recommended over medically supervised withdrawal.
    why.push(t(
      'nav.route.pregnancy.why.moud',
      'If you take buprenorphine or methadone, keep taking it. National guidelines (ACOG, SAMHSA) recommend continuing or starting these medicines during pregnancy instead of detox. Do not stop or cut back on your own; your clinician can adjust your care if needed.',
    ));
  }
  if (hasGaba) {
    // ASAM Clinical Practice Guideline on Alcohol Withdrawal Management (2020):
    // pregnancy is a reason for closer medical management of withdrawal.
    why.push(t(
      'nav.route.pregnancy.why.gaba',
      'Do not stop alcohol or sedatives suddenly on your own. Withdrawal can be dangerous in pregnancy, so get medically supervised care (ASAM).',
    ));
  }
  // SAMHSA Clinical Guidance (2018): coordinate prenatal care with SUD treatment.
  why.push(t(
    'nav.route.pregnancy.why.prenatal',
    'Programs for pregnant and postpartum people can coordinate prenatal care, addiction treatment, and a Plan of Safe Care for you and your baby (SAMHSA).',
  ));
  // SAMHSA Clinical Guidance (2018): the postpartum period carries elevated
  // risk of return to use and overdose; continue treatment after delivery.
  why.push(t(
    'nav.route.pregnancy.why.postpartum',
    'The months after birth carry a higher risk of return to use and overdose. Keep your treatment going after delivery and keep naloxone at home (SAMHSA).',
  ));

  const links = [link(t('nav.route.pregnancy.link.pw', 'Programs for pregnant or postpartum people'), ['PW'])];
  if (hasOpioids) {
    links.push(link(t('nav.route.pregnancy.link.pw_bu', 'Pregnancy programs that offer buprenorphine'), ['PW', 'BU']));
    links.push(link(t('nav.route.link.otp', 'Methadone clinics (opioid treatment programs)'), ['OTP']));
  }
  if (withdrawalRisk === 'severe' || (hasGaba && withdrawalRisk === 'moderate')) {
    links.push(link(t('nav.route.pregnancy.link.pw_hi', 'Pregnancy programs with hospital inpatient care'), ['PW', 'HI']));
  }

  return {
    id: 'pregnancy',
    title: t('nav.route.pregnancy.title', 'Care route: pregnancy and postpartum'),
    fits: t(
      'nav.route.pregnancy.fits',
      'What fits: a program for pregnant and postpartum people (PW) that works with your prenatal care, with buprenorphine or methadone if opioids are involved.',
    ),
    why,
    links,
    extraLinks: [{ label: t('nav.route.link.meds', 'Medication guide'), href: '#/medications' }],
    sources: 'ACOG Committee Opinion 711; SAMHSA Clinical Guidance for Treating Pregnant and Parenting Women With OUD (2018); ASAM Alcohol Withdrawal Management Guideline (2020).',
  };
}

function youthRoute({ substances, population, mentalHealth, preferTelehealth }) {
  const ageCode = population === 'YA' ? 'YA' : 'ADOL';
  const why = [
    // NIDA, Principles of Adolescent Substance Use Disorder Treatment (2014):
    // treatment should be tailored to the adolescent's needs, and family
    // involvement is an important part of care.
    t(
      'nav.route.youth.why.age',
      'Programs built for teens or young adults fit treatment to school, family, and stage of life, and often involve family when that is safe and helpful (NIDA).',
    ),
    // 42 CFR Part 2 § 2.14: a minor's consent for SUD treatment follows state law.
    t(
      'nav.route.youth.why.consent',
      'Whether a teen can start treatment without a parent depends on state law. Ask the program how it handles consent and privacy (42 CFR Part 2).',
    ),
  ];
  if (substances.has('opioids')) {
    // ASAM National Practice Guideline for the Treatment of OUD (2020 focused
    // update), adolescents section: offer medication for OUD to adolescents.
    why.push(t(
      'nav.route.youth.why.moud',
      'Medication for opioid use disorder can be part of care for teens and young adults. Ask whether the program offers it (ASAM).',
    ));
  }

  const links = [link(
    ageCode === 'YA'
      ? t('nav.route.youth.link.ya', 'Programs for young adults')
      : t('nav.route.youth.link.adol', 'Programs for teens'),
    [ageCode],
  )];
  if (substances.has('opioids')) {
    links.push(link(t('nav.route.youth.link.bu', 'Youth programs that offer buprenorphine'), [ageCode, 'BU']));
  }
  if (mentalHealth && mentalHealth !== 'none') {
    links.push(link(t('nav.route.youth.link.mhsu', 'Youth programs for mental health and substance use together'), [ageCode, 'MHSU']));
  }
  if (preferTelehealth) {
    links.push(link(t('nav.route.youth.link.tele', 'Youth programs with telehealth'), [ageCode, 'TELE']));
  }

  return {
    id: 'youth',
    title: t('nav.route.youth.title', 'Care route: teens and young adults'),
    fits: t(
      'nav.route.youth.fits',
      'What fits: an age-specific program (teens or young adults) at the level of care above, with family involvement when it helps.',
    ),
    why,
    links,
    extraLinks: [{ label: t('nav.route.link.family', 'Family and recovery support'), href: '#/support' }],
    sources: 'NIDA Principles of Adolescent SUD Treatment (2014); ASAM National Practice Guideline for OUD (2020); 42 CFR Part 2 § 2.14.',
  };
}

function reentryRoute({ transition }) {
  // Codes come from evaluateTransitionRisk({ event: 'post_release' }) in
  // navigator.js, so the route stays consistent with the existing transition engine.
  const recommended = transition?.recommendedCodes?.length ? transition.recommendedCodes : ['CJ', 'BU', 'NOE', 'PEER'];
  const has = (c) => recommended.includes(c);

  const why = [
    // NIDA Criminal Justice DrugFacts; SAMHSA, Use of Medication-Assisted
    // Treatment for Opioid Use Disorder in Criminal Justice Settings (2019):
    // tolerance falls during incarceration, and overdose risk is highest in
    // the first weeks after release.
    t(
      'nav.route.reentry.why.risk',
      'Overdose risk is very high in the first weeks after release, because tolerance drops while you are inside. Using the amount you used before can stop your breathing (NIDA, SAMHSA).',
    ),
    // SAMHSA (2019) criminal justice MAT guide: continue MOUD through release
    // with a community handoff so there is no gap.
    t(
      'nav.route.reentry.why.continuity',
      'If you were on buprenorphine or methadone inside, keep taking it. Before release, ask for a prescription or a direct handoff to a community clinic so there is no gap (SAMHSA).',
    ),
    // CDC overdose prevention: carry naloxone and do not use alone.
    t(
      'nav.route.reentry.why.naloxone',
      'Carry naloxone, make sure someone near you knows how to use it, and do not use alone (CDC).',
    ),
  ];

  const links = [];
  if (has('CJ') && has('BU')) links.push(link(t('nav.route.reentry.link.cj_bu', 'Re-entry programs that offer buprenorphine'), ['CJ', 'BU']));
  links.push(link(t('nav.route.link.otp', 'Methadone clinics (opioid treatment programs)'), ['OTP']));
  if (has('NOE')) links.push(link(t('nav.route.link.noe', 'Places that offer naloxone and overdose education'), ['NOE']));
  if (has('CJ') && has('PEER')) links.push(link(t('nav.route.reentry.link.cj_peer', 'Re-entry programs with peer support'), ['CJ', 'PEER']));

  return {
    id: 'reentry',
    title: t('nav.route.reentry.title', 'Care route: re-entry after jail or prison'),
    fits: t(
      'nav.route.reentry.fits',
      'What fits: no gap in buprenorphine or methadone, naloxone in hand, and a program experienced with justice involvement (CJ).',
    ),
    why,
    links,
    extraLinks: [{ label: t('nav.route.link.overdose', 'Overdose response steps'), href: '#/overdose' }],
    sources: 'NIDA Criminal Justice DrugFacts; SAMHSA Use of MAT for OUD in Criminal Justice Settings (2019); CDC overdose prevention.',
  };
}

function xylazineRoute({ withdrawalRisk, biomedical }) {
  const urgent = withdrawalRisk === 'moderate' || withdrawalRisk === 'severe' || biomedical === 'acute_infection';
  const why = [
    // CDC, What You Should Know About Xylazine: naloxone does not reverse
    // xylazine, but give it anyway because opioids are usually present; rescue
    // breaths help because xylazine slows breathing.
    t(
      'nav.route.xylazine.why.naloxone',
      'Naloxone does not reverse xylazine, but always give it for a suspected overdose because fentanyl is usually in the mix. Give rescue breaths and call 911 (CDC).',
    ),
    // CDC, What You Should Know About Xylazine: wounds can become infected and
    // worsen quickly; untreated wounds can become life-threatening.
    t(
      'nav.route.xylazine.why.wounds',
      'Xylazine wounds can get infected and worsen quickly. Get medical wound care early (CDC).',
    ),
    // CDC MMWR 2025;74(15) Notes from the Field: severe medetomidine withdrawal
    // syndrome (tachycardia, hypertension, agitation), most patients needed ICU care.
    t(
      'nav.route.xylazine.why.withdrawal',
      'Withdrawal from medetomidine, and possibly xylazine, can cause a racing heart, very high blood pressure, and agitation that opioid medicine alone may not control. Tell clinicians you may have been exposed to tranq (CDC).',
    ),
  ];
  if (urgent) {
    // CDC MMWR 2025;74(15): severe medetomidine withdrawal frequently required
    // hospital (ICU) care.
    why.unshift(t(
      'nav.route.xylazine.why.urgent',
      'Based on your answers, go to an emergency department or hospital now if you have a racing heart, chest pain, confusion, fever, or a wound that is spreading or turning dark (CDC).',
    ));
  }

  const links = [];
  if (urgent) links.push(link(t('nav.route.xylazine.link.hi', 'Hospital inpatient care'), ['HI']));
  links.push(link(t('nav.route.xylazine.link.bu', 'Places that offer buprenorphine'), ['BU']));
  links.push(link(t('nav.route.link.otp', 'Methadone clinics (opioid treatment programs)'), ['OTP']));
  links.push(link(t('nav.route.link.noe', 'Places that offer naloxone and overdose education'), ['NOE']));

  return {
    id: 'xylazine',
    title: t('nav.route.xylazine.title', 'Care route: xylazine or medetomidine (tranq)'),
    fits: t(
      'nav.route.xylazine.fits',
      'What fits: buprenorphine or methadone treatment plus medical care that can recognize tranq withdrawal and treat wounds.',
    ),
    urgent,
    why,
    links,
    extraLinks: [
      { label: t('nav.route.link.harm', 'Wound care and harm reduction'), href: '#/harm-reduction' },
      { label: t('nav.route.link.overdose', 'Overdose response steps'), href: '#/overdose' },
    ],
    sources: 'CDC What You Should Know About Xylazine; CDC MMWR 2025;74(15) medetomidine withdrawal reports.',
  };
}

/**
 * Build the care routes for the navigator's current answers.
 *
 * @param {object} answers - the navigator's in-memory answers
 * @param {{ transition?: { recommendedCodes: string[] } }} [context]
 *   `transition` is evaluateTransitionRisk(REENTRY_TRANSITION_INPUT) from navigator.js.
 * @returns {Array<{ id: string, title: string, fits: string, why: string[],
 *   links: Array<{ label: string, codes: string[], href: string }>,
 *   extraLinks: Array<{ label: string, href: string }>, sources: string, urgent?: boolean }>}
 */
export function buildCareRoutes(answers = {}, { transition } = {}) {
  const ctx = {
    substances: substanceSet(answers?.substances),
    withdrawalRisk: answers?.withdrawalRisk ?? 'none',
    biomedical: answers?.biomedical ?? 'none',
    mentalHealth: answers?.mentalHealth ?? 'none',
    population: answers?.population ?? '',
    preferTelehealth: Boolean(answers?.preferTelehealth),
    transition,
  };
  const builders = { pregnancy: pregnancyRoute, youth: youthRoute, reentry: reentryRoute, xylazine: xylazineRoute };
  return detectCareRoutes(answers).map((id) => builders[id](ctx));
}
