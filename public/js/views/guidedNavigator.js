import { h, clear, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, hotlineGrid } from './common.js';
import { getLang } from '../i18n.js';
import { hotlinesById, NEVER_USE_ALONE } from '../content/hotlines.js';
import {
  scoreOpioidWithdrawal,
  scoreAlcoholSedativeRisk,
  evaluateTransitionRisk,
  evaluateAsamCare,
} from './navigator.js';
import {
  recommendForPregnancy,
  recommendForYouth,
  recommendForJusticeInvolved,
  recommendForOlderAdults,
  recommendForStimulants,
  recommendForXylazine,
  recommendForCoOccurring,
} from './populationHelpers.js';
import { MEDICATIONS } from './medications.js';

/**
 * Bilingual English/Spanish helper that reads the active language from i18n.js
 * without requiring shared locale dictionary mutations.
 */
function gt(enText, esText) {
  return getLang() === 'es' && esText ? esText : enText;
}

const CODE_LABELS = {
  BU: { en: 'Buprenorphine (Suboxone/Sublocade)', es: 'Buprenorfina (Suboxone/Sublocade)', tone: 'med' },
  MU: { en: 'Methadone', es: 'Metadona', tone: 'med' },
  OTP: { en: 'Opioid Treatment Program (OTP)', es: 'Programa de tratamiento de opioides (OTP)', tone: 'med' },
  NU: { en: 'Naltrexone (Vivitrol)', es: 'Naltrexona (Vivitrol)', tone: 'med' },
  PMAT: { en: 'Alcohol Use Disorder Medications', es: 'Medicamentos para el trastorno por consumo de alcohol', tone: 'med' },
  DT: { en: 'Detox / Withdrawal Management', es: 'Desintoxicación / Manejo de abstinencia', tone: 'care' },
  HI: { en: 'Hospital Inpatient', es: 'Hospitalización', tone: 'care' },
  RES: { en: 'Residential Care', es: 'Atención residencial', tone: 'care' },
  HH: { en: 'Recovery Housing', es: 'Vivienda de recuperación', tone: 'care' },
  IOP: { en: 'Intensive Outpatient (IOP)', es: 'Ambulatorio intensivo (IOP)', tone: 'care' },
  PHP: { en: 'Partial Hospitalization / Day Program', es: 'Hospitalización parcial / Programa diurno', tone: 'care' },
  OP: { en: 'Outpatient Care', es: 'Atención ambulatoria', tone: 'care' },
  TELE: { en: 'Telehealth', es: 'Telesalud', tone: 'care' },
  PW: { en: 'Pregnant / Postpartum Specialty', es: 'Especialidad en embarazo y posparto', tone: 'extra' },
  MHSU: { en: 'Co-occurring Mental Health & SUD', es: 'Salud mental y consumo de sustancias concurrentes', tone: 'extra' },
  TRMA: { en: 'Trauma-Informed Care', es: 'Atención informada en el trauma', tone: 'extra' },
  CMI: { en: 'Contingency Management', es: 'Manejo de contingencias', tone: 'extra' },
  NOE: { en: 'Naloxone & Overdose Education', es: 'Naloxona y educación sobre sobredosis', tone: 'extra' },
  PEER: { en: 'Peer Recovery Support', es: 'Apoyo de pares en recuperación', tone: 'extra' },
  WI: { en: 'Walk-in Crisis Care', es: 'Atención de crisis sin cita previa', tone: 'care' },
  PEOFF: { en: 'Mobile Crisis Team', es: 'Equipo móvil de crisis', tone: 'care' },
  MD: { en: 'Medicaid', es: 'Medicaid', tone: 'pay' },
  MC: { en: 'Medicare', es: 'Medicare', tone: 'pay' },
  PI: { en: 'Private Insurance', es: 'Seguro privado', tone: 'pay' },
  SS: { en: 'Sliding Fee Scale', es: 'Escala móvil de tarifas', tone: 'pay' },
  PA: { en: 'Payment Assistance', es: 'Asistencia de pago', tone: 'pay' },
  NP: { en: 'Free of Charge', es: 'Gratuito', tone: 'pay' },
  VET: { en: 'Veterans', es: 'Veteranos', tone: 'extra' },
  ADOL: { en: 'Teens / Adolescents', es: 'Adolescentes / Jóvenes', tone: 'extra' },
  YA: { en: 'Young Adults', es: 'Adultos jóvenes', tone: 'extra' },
  SEN: { en: 'Older Adults', es: 'Adultos mayores', tone: 'extra' },
  CJ: { en: 'Justice-Involved Support', es: 'Apoyo para personas involucradas con la justicia', tone: 'extra' },
};

const OVERDOSE_PATTERNS = [
  /\boverdos(?:e|ing|ed)\b/i,
  /\bnot\s+breathing\b/i,
  /\bstopped\s+breathing\b/i,
  /\bslow\s+breathing\b/i,
  /\bshallow\s+breathing\b/i,
  /\bblue\s+(?:lips|fingernails|skin|face)\b/i,
  /\bunresponsive\b/i,
  /\bwon['’]?t\s+wake\s+up\b/i,
  /\bcan['’]?t\s+wake\s+up\b/i,
  /\bfentanyl\s+poisoning\b/i,
  /\bnarcan\s+now\b/i,
  /\bnaloxone\s+now\b/i,
  /\bgurgling\b/i,
  /\bdeath\s+rattle\b/i,
  /\bsobredosis\b/i,
  /\bno\s+respira\b/i,
  /\blabios\s+azules\b/i,
  /\bno\s+despierta\b/i,
  /\binconsciente\b/i,
];

const CRISIS_PATTERNS = [
  /\bsuicid(?:e|al)\b/i,
  /\bkill\s+myself\b/i,
  /\bend\s+my\s+life\b/i,
  /\btake\s+my\s+life\b/i,
  /\bself[- ]?harm\b/i,
  /\bhurt(?:ing)?\s+myself\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bwanna\s+die\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\bunsafe\s+with\s+myself\b/i,
  /\bsuicidio\b/i,
  /\bsuicida\b/i,
  /\bquitarme\s+la\s+vida\b/i,
  /\bhacerme\s+daño\b/i,
  /\bquiero\s+morir\b/i,
];

const SOLO_USE_PATTERNS = [
  /\busing\s+alone\b/i,
  /\babout\s+to\s+use\s+alone\b/i,
  /\buse\s+alone\b/i,
  /\busing\s+by\s+myself\b/i,
  /\buse\s+by\s+myself\b/i,
  /\bspot\s+me\b/i,
  /\bvirtual\s+spotter\b/i,
  /\bsolo\s+use\b/i,
  /\busing\s+solo\b/i,
  /\bsolo\b/i,
  /\busar\s+a\s+solas\b/i,
  /\bconsumir\s+solo\b/i,
];

/**
 * Deterministic red-flag interceptor that analyzes free-text or structured
 * step selections in browser RAM and immediately surfaces emergency or
 * overdose-prevention actions.
 *
 * @param {string|object} [input]
 * @returns {{
 *   intercepted: boolean,
 *   category: 'overdose' | 'crisis' | 'solo_use' | 'none',
 *   severity: 'critical' | 'high' | 'none',
 *   headline: string,
 *   guidance: string,
 *   actions: Array<{ label: string, href: string, kind: string }>,
 *   codes: string[],
 *   hotlines: Array<object>
 * }}
 */
export function detectCrisisOrOverdose(input = '') {
  let text = '';
  const flagSet = new Set();

  if (typeof input === 'string') {
    text = input;
  } else if (input && typeof input === 'object') {
    text = [
      input.text,
      input.freeText,
      input.situation,
      input.query,
    ]
      .filter((v) => typeof v === 'string' && v.trim())
      .join(' ');

    const rawFlags = input.flags;
    if (Array.isArray(rawFlags)) {
      for (const f of rawFlags) {
        if (f) flagSet.add(String(f).toLowerCase().trim());
      }
    } else if (rawFlags instanceof Set) {
      for (const f of rawFlags) {
        if (f) flagSet.add(String(f).toLowerCase().trim());
      }
    } else if (rawFlags && typeof rawFlags === 'object') {
      for (const [k, v] of Object.entries(rawFlags)) {
        if (v) flagSet.add(k.toLowerCase().trim());
      }
    }

    if (input.overdose === true || input.emergency === 'overdose') flagSet.add('overdose');
    if (input.crisis === true || input.emergency === 'crisis') flagSet.add('crisis');
    if (input.mentalHealth === 'severe_crisis' || input?.asamAnswers?.mentalHealth === 'severe_crisis') {
      flagSet.add('crisis');
    }
    if (input.usingAlone === true || input.soloUse === true || input.emergency === 'solo_use') {
      flagSet.add('solo_use');
    }
  }

  const normalized = String(text || '').trim();

  const isOverdose =
    flagSet.has('overdose') ||
    flagSet.has('unresponsive') ||
    OVERDOSE_PATTERNS.some((re) => re.test(normalized));

  if (isOverdose) {
    return {
      intercepted: true,
      category: 'overdose',
      severity: 'critical',
      headline: gt(
        'Possible Overdose Emergency — Call 911 & Give Naloxone Now',
        'Posible emergencia por sobredosis — Llame al 911 y administre naloxona ahora',
      ),
      guidance: gt(
        'If someone is unresponsive, not breathing normally, making gurgling sounds, or has blue/gray lips or fingernails: call 911 immediately, give naloxone (Narcan) nasal spray right away, support breathing, and repeat naloxone every 2 to 3 minutes if they do not wake up.',
        'Si alguien no responde, no respira normalmente, hace sonidos de gorgoteo o tiene labios o uñas azules o grises: llame al 911 de inmediato, administre naloxona (Narcan) en aerosol nasal, apoye la respiración y repita la naloxona cada 2 a 3 minutos si no despierta.',
      ),
      actions: [
        { label: 'Call 911 Immediately', href: 'tel:911', kind: 'emergency' },
        { label: 'Open Step-by-Step Overdose & 2-Minute Naloxone Timer', href: '#/overdose', kind: 'primary' },
        { label: `Never Use Alone (${NEVER_USE_ALONE.label})`, href: `tel:${NEVER_USE_ALONE.number}`, kind: 'hotline' },
        { label: 'SafeSpot Overdose Prevention Line (800-972-0590)', href: 'tel:8009720590', kind: 'hotline' },
      ],
      codes: ['NOE'],
      hotlines: hotlinesById('never-use-alone', 'safespot', 'poison'),
    };
  }

  const isCrisis =
    flagSet.has('crisis') ||
    flagSet.has('suicide') ||
    flagSet.has('self_harm') ||
    CRISIS_PATTERNS.some((re) => re.test(normalized));

  if (isCrisis) {
    return {
      intercepted: true,
      category: 'crisis',
      severity: 'critical',
      headline: gt(
        'Immediate 24/7 Crisis Support — You Do Not Have to Carry This Alone',
        'Apoyo inmediato de crisis 24/7 — No tiene que enfrentar esto a solas',
      ),
      guidance: gt(
        'Free, confidential support is available right now. Call or text 988 to reach the Suicide & Crisis Lifeline (24/7 in English and Spanish), or call 911 if you are in immediate physical danger.',
        'Hay apoyo gratuito y confidencial disponible ahora mismo. Llame o envíe un mensaje de texto al 988 para comunicarse con la Línea de Prevención del Suicidio y Crisis (24/7 en inglés y español), o llame al 911 si corre peligro físico inmediato.',
      ),
      actions: [
        { label: 'Call or Text 988 Suicide & Crisis Lifeline', href: 'tel:988', kind: 'emergency' },
        { label: 'Call 911', href: 'tel:911', kind: 'emergency' },
        { label: 'SAMHSA National Helpline (1-800-662-4357)', href: 'tel:18006624357', kind: 'hotline' },
        { label: 'View All 24/7 Crisis & Community Lines', href: '#/crisis', kind: 'secondary' },
      ],
      codes: ['WI', 'PEOFF', 'MHSU'],
      hotlines: hotlinesById('988', 'crisis-text-line', 'samhsa'),
    };
  }

  const isSoloUse =
    flagSet.has('solo_use') ||
    flagSet.has('using_alone') ||
    flagSet.has('solo') ||
    SOLO_USE_PATTERNS.some((re) => re.test(normalized));

  if (isSoloUse) {
    return {
      intercepted: true,
      category: 'solo_use',
      severity: 'high',
      headline: gt(
        'Using Alone? Call an Overdose Prevention Spotter Line Before You Use',
        '¿Va a consumir a solas? Llame antes a una línea de acompañamiento para prevención de sobredosis',
      ),
      guidance: gt(
        'Using alone carries a high risk of fatal overdose because no one is present to administer naloxone. Call Never Use Alone (' + NEVER_USE_ALONE.label + ') or SafeSpot (800-972-0590) before you use—an operator stays on the line and only dispatches help if you become unresponsive.',
        'Consumir a solas conlleva un alto riesgo de sobredosis mortal porque no hay nadie presente para administrar naloxona. Llame a Never Use Alone (' + NEVER_USE_ALONE.label + ') o SafeSpot (800-972-0590) antes de consumir; un operador permanece en la línea y solo envía ayuda si usted deja de responder.',
      ),
      actions: [
        { label: `Never Use Alone (${NEVER_USE_ALONE.label})`, href: `tel:${NEVER_USE_ALONE.number}`, kind: 'emergency' },
        { label: 'SafeSpot Overdose Prevention Line (800-972-0590)', href: 'tel:8009720590', kind: 'hotline' },
        { label: 'Open Harm Reduction & Safer Use Guide', href: '#/harm-reduction', kind: 'primary' },
        { label: 'Open Step-by-Step Overdose & Naloxone Guide', href: '#/overdose', kind: 'secondary' },
      ],
      codes: ['NOE', 'BU'],
      hotlines: hotlinesById('never-use-alone', 'safespot'),
    };
  }

  return {
    intercepted: false,
    category: 'none',
    severity: 'none',
    headline: '',
    guidance: '',
    actions: [],
    codes: [],
    hotlines: [],
  };
}

/**
 * Extracts deterministic substance, withdrawal, transition, biomedical, and
 * population signals from local free-text input in browser RAM.
 */
function extractDeterministicTextSignals(rawText = '') {
  const text = String(rawText || '').trim();
  const signals = {
    substances: new Set(),
    populations: new Set(),
    withdrawalRisk: null,
    biomedical: null,
    mentalHealth: null,
    environment: null,
    structureNeeded: null,
    payment: null,
    populationCode: null,
    preferTelehealth: false,
    transitionEvent: null,
    alcoholFactors: {},
    opioidSymptoms: {},
  };

  if (!text) return signals;

  if (/\b(?:opioid|opiate|fentanyl|heroin|oxy|oxycodone|percocet|hydrocodone|morphine|dilaudid|methadone|suboxone|buprenorphine|dope|pressed\s+pill|opioide|fentanilo|hero[ií]na)\b/i.test(text)) {
    signals.substances.add('opioids');
  }
  if (/\b(?:xylazine|tranq|medetomidine|xilacina)\b/i.test(text)) {
    signals.substances.add('xylazine');
    signals.substances.add('opioids');
    signals.populations.add('xylazine');
  }
  if (/\b(?:alcohol|drinking|liquor|vodka|beer|wine|delirium\s+tremens|alcoholismo)\b/i.test(text)) {
    signals.substances.add('alcohol');
  }
  if (/\b(?:benzo|benzodiazepine|xanax|alprazolam|klonopin|clonazepam|valium|diazepam|ativan|lorazepam|sedative)\b/i.test(text)) {
    signals.substances.add('benzos');
  }
  if (/\b(?:stimulant|meth|methamphetamine|crystal|cocaine|crack|amphetamine|metanfetamina|coca[ií]na)\b/i.test(text)) {
    signals.substances.add('stimulants');
    signals.populations.add('stimulants');
  }

  if (/\b(?:seizure|delirium\s+tremens|dts\b|hallucinat|can['’]?t\s+keep\s+fluids|severe\s+withdrawal|vomiting\s+blood)\b/i.test(text)) {
    signals.withdrawalRisk = 'severe';
    if (signals.substances.has('alcohol') || signals.substances.has('benzos')) {
      signals.alcoholFactors.priorSeizuresOrDTs = true;
      signals.alcoholFactors.autonomicInstability = true;
    }
    if (signals.substances.has('opioids')) {
      signals.opioidSymptoms.restlessness = 4;
      signals.opioidSymptoms.sweating_chills = 4;
      signals.opioidSymptoms.muscle_bone_aches = 4;
      signals.opioidSymptoms.gi_upset = 4;
      signals.opioidSymptoms.tremor_gooseflesh = 4;
      signals.opioidSymptoms.anxiety_irritability = 4;
    }
  } else if (/\b(?:withdrawal|dope\s*sick|sweating|chills|shakes|tremor|nausea|vomiting|diarrhea|body\s+aches|abstinencia|malilla)\b/i.test(text)) {
    signals.withdrawalRisk = 'moderate';
    if (signals.substances.has('alcohol') || signals.substances.has('benzos')) {
      signals.alcoholFactors.dailyHeavyUse = true;
      signals.alcoholFactors.tremorSweatingAgitation = true;
    }
    if (signals.substances.has('opioids')) {
      signals.opioidSymptoms.restlessness = 2;
      signals.opioidSymptoms.sweating_chills = 2;
      signals.opioidSymptoms.muscle_bone_aches = 2;
      signals.opioidSymptoms.gi_upset = 2;
      signals.opioidSymptoms.anxiety_irritability = 2;
    }
  } else if (/\b(?:craving|restless|insomnia|can['’]?t\s+sleep|early\s+withdrawal)\b/i.test(text)) {
    signals.withdrawalRisk = 'mild';
  }

  if (/\b(?:pregnant|pregnancy|postpartum|prenatal|breastfeeding|embarazada|embarazo|posparto)\b/i.test(text)) {
    signals.biomedical = 'pregnant';
    signals.populations.add('pregnancy');
  } else if (/\b(?:wound|ulcer|abscess|infection|fever|sepsis|endocarditis|necrotic|herida|infecci[oó]n)\b/i.test(text)) {
    signals.biomedical = 'acute_infection';
  } else if (/\b(?:hiv|hepatitis|hep\s*c|cirrhosis|liver|kidney|diabetes|chronic\s+pain)\b/i.test(text)) {
    signals.biomedical = 'chronic';
  }

  if (/\b(?:ptsd|trauma|abuse|domestic\s+violence|assault)\b/i.test(text)) {
    signals.mentalHealth = 'trauma';
    signals.populations.add('coOccurring');
  } else if (/\b(?:depression|depressed|anxiety|anxious|bipolar|panic|mental\s+health|dual\s+diagnosis|co-occurring|depresi[oó]n|ansiedad|salud\s+mental)\b/i.test(text)) {
    signals.mentalHealth = 'mild_moderate';
    signals.populations.add('coOccurring');
  }

  if (/\b(?:unhoused|homeless|shelter|living\s+in\s+(?:my\s+)?car|on\s+the\s+street|couch\s*surfing|sin\s+hogar)\b/i.test(text)) {
    signals.environment = 'unhoused';
  } else if (/\b(?:unsafe\s+home|unstable\s+housing|using\s+around\s+me)\b/i.test(text)) {
    signals.environment = 'unstable';
  }

  if (/\b(?:inpatient|residential|rehab|live-in|24-hour|detox\s+bed)\b/i.test(text)) {
    signals.structureNeeded = '24_hour';
  } else if (/\b(?:iop|intensive\s+outpatient|day\s+program|partial\s+hospitalization)\b/i.test(text)) {
    signals.structureNeeded = 'structured_day';
  }

  if (/\b(?:telehealth|virtual|online|from\s+home|no\s+car|no\s+transportation|telesalud)\b/i.test(text)) {
    signals.preferTelehealth = true;
  }

  if (/\b(?:medicaid|apple\s+health|medi-cal)\b/i.test(text)) {
    signals.payment = 'MD';
  } else if (/\b(?:medicare)\b/i.test(text)) {
    signals.payment = 'MC';
  } else if (/\b(?:uninsured|no\s+insurance|sliding\s+scale|free|can['’]?t\s+afford|charity\s+care|sin\s+seguro|gratis)\b/i.test(text)) {
    signals.payment = 'SS';
  } else if (/\b(?:tricare)\b/i.test(text)) {
    signals.payment = 'TRICARE';
  } else if (/\b(?:private\s+insurance)\b/i.test(text)) {
    signals.payment = 'PI';
  }

  if (/\b(?:teen|adolescent|youth|young\s+adult|under\s+18|high\s+school|adolescente|joven)\b/i.test(text)) {
    signals.populations.add('youth');
    signals.populationCode = 'ADOL';
  }
  if (/\b(?:jail|prison|incarcerat|parole|probation|re-?entry|just\s+released|justice|c[aá]rcel|prisi[oó]n)\b/i.test(text)) {
    signals.populations.add('justice');
    signals.populationCode = 'CJ';
    signals.transitionEvent = 'post_release';
  }
  if (/\b(?:older\s+adult|senior|elderly|65\+|adulto\s+mayor)\b/i.test(text)) {
    signals.populations.add('older');
    signals.populationCode = 'SEN';
  }
  if (/\b(?:veteran|military|va\s+care)\b/i.test(text)) {
    signals.populationCode = 'VET';
  }

  if (!signals.transitionEvent) {
    if (/\b(?:recent\s+overdose|overdosed\s+last|post-?overdose|left\s+the\s+er)\b/i.test(text)) {
      signals.transitionEvent = 'post_overdose';
    } else if (/\b(?:left\s+detox|out\s+of\s+detox|discharged\s+from\s+hospital|left\s+rehab)\b/i.test(text)) {
      signals.transitionEvent = 'post_detox_hospital';
    } else if (/\b(?:stopped\s+vivitrol|missed\s+vivitrol|stopped\s+naltrexone)\b/i.test(text)) {
      signals.transitionEvent = 'post_naltrexone';
    }
  }

  return signals;
}

const WITHDRAWAL_RANK = { none: 0, mild: 1, moderate: 2, severe: 3 };

function maxWithdrawalRisk(...levels) {
  let best = 'none';
  for (const lvl of levels) {
    if (lvl && (WITHDRAWAL_RANK[lvl] ?? 0) > (WITHDRAWAL_RANK[best] ?? 0)) {
      best = lvl;
    }
  }
  return best;
}

/**
 * Deterministic multi-step and natural-input triage engine.
 * Composes pure functions from navigator.js, populationHelpers.js,
 * medications.js, and hotlines.js with zero external network calls.
 *
 * @param {object|string} [session]
 */
export function runGuidedTriage(session = {}) {
  const normSession = typeof session === 'string' ? { freeText: session } : (session ?? {});
  const freeText = String(normSession.freeText ?? normSession.text ?? '').trim();

  const crisisIntercept = detectCrisisOrOverdose({
    text: freeText,
    flags: normSession.flags,
    overdose: normSession.overdose,
    crisis: normSession.crisis,
    usingAlone: normSession.usingAlone,
    emergency: normSession.emergency,
    mentalHealth: normSession.mentalHealth ?? normSession.asamAnswers?.mentalHealth,
  });

  const textSignals = extractDeterministicTextSignals(freeText);

  const mergedOpioidSymptoms = {
    ...textSignals.opioidSymptoms,
    ...(normSession.opioidSymptoms ?? {}),
  };
  const opioidScore = scoreOpioidWithdrawal(mergedOpioidSymptoms);

  const mergedAlcoholFactors = {
    ...textSignals.alcoholFactors,
    ...(normSession.alcoholRisk ?? {}),
  };
  const alcoholScore = scoreAlcoholSedativeRisk(mergedAlcoholFactors);

  const rawAsam = normSession.asamAnswers ?? {};
  const combinedSubstances = new Set([
    ...textSignals.substances,
    ...(Array.isArray(normSession.substances) ? normSession.substances : []),
    ...(normSession.substances instanceof Set ? [...normSession.substances] : []),
    ...(Array.isArray(rawAsam.substances) ? rawAsam.substances : []),
    ...(rawAsam.substances instanceof Set ? [...rawAsam.substances] : []),
    ...(typeof rawAsam.substances === 'string'
      ? rawAsam.substances.split(',').map((s) => s.trim()).filter(Boolean)
      : []),
  ]);

  if (Object.keys(mergedOpioidSymptoms).some((k) => mergedOpioidSymptoms[k])) {
    combinedSubstances.add('opioids');
  }
  if (Object.keys(mergedAlcoholFactors).some((k) => mergedAlcoholFactors[k])) {
    if (!combinedSubstances.has('alcohol') && !combinedSubstances.has('benzos')) {
      combinedSubstances.add('alcohol');
    }
  }

  const effectiveWithdrawalRisk = maxWithdrawalRisk(
    rawAsam.withdrawalRisk,
    normSession.withdrawalRisk,
    textSignals.withdrawalRisk,
    opioidScore.navWithdrawalRisk,
    alcoholScore.navWithdrawalRisk,
  );

  const effectiveBiomedical =
    rawAsam.biomedical && rawAsam.biomedical !== 'none'
      ? rawAsam.biomedical
      : normSession.biomedical ?? textSignals.biomedical ?? 'none';

  const effectiveMentalHealth =
    crisisIntercept.category === 'crisis'
      ? 'severe_crisis'
      : rawAsam.mentalHealth && rawAsam.mentalHealth !== 'none'
        ? rawAsam.mentalHealth
        : normSession.mentalHealth ?? textSignals.mentalHealth ?? 'none';

  const effectiveEnvironment =
    rawAsam.environment && rawAsam.environment !== 'supportive'
      ? rawAsam.environment
      : normSession.environment ?? textSignals.environment ?? 'supportive';

  const effectiveStructure =
    rawAsam.structureNeeded && rawAsam.structureNeeded !== 'flexible'
      ? rawAsam.structureNeeded
      : normSession.structureNeeded ?? textSignals.structureNeeded ?? 'flexible';

  const effectivePayment =
    rawAsam.payment || normSession.payment || textSignals.payment || '';

  const effectivePopulationCode =
    rawAsam.population || normSession.population || textSignals.populationCode || '';

  const effectiveTelehealth = Boolean(
    rawAsam.preferTelehealth || normSession.preferTelehealth || textSignals.preferTelehealth,
  );

  const effectiveAsamAnswers = {
    substances: [...combinedSubstances],
    withdrawalRisk: effectiveWithdrawalRisk,
    biomedical: effectiveBiomedical,
    mentalHealth: effectiveMentalHealth,
    environment: effectiveEnvironment,
    structureNeeded: effectiveStructure,
    payment: effectivePayment,
    population: effectivePopulationCode,
    preferTelehealth: effectiveTelehealth,
    seizureOrDtHistory: Boolean(mergedAlcoholFactors.priorSeizuresOrDTs || rawAsam.seizureOrDtHistory),
  };

  const asamResult = evaluateAsamCare(effectiveAsamAnswers);

  const rawTransition = normSession.transition ?? {};
  const effectiveTransitionParams = {
    event:
      rawTransition.event && rawTransition.event !== 'none'
        ? rawTransition.event
        : textSignals.transitionEvent ?? 'none',
    daysSince: rawTransition.daysSince ?? 'under_7',
    onMoud: Boolean(rawTransition.onMoud),
    hasNaloxone: Boolean(rawTransition.hasNaloxone),
  };
  const transitionRisk = evaluateTransitionRisk(effectiveTransitionParams);

  const popSet = new Set([
    ...textSignals.populations,
    ...(Array.isArray(normSession.populations) ? normSession.populations : []),
    ...(normSession.populations instanceof Set ? [...normSession.populations] : []),
  ]);

  if (effectiveBiomedical === 'pregnant') popSet.add('pregnancy');
  if (effectivePopulationCode === 'ADOL' || effectivePopulationCode === 'YA') popSet.add('youth');
  if (effectivePopulationCode === 'CJ' || effectiveTransitionParams.event === 'post_release') popSet.add('justice');
  if (effectivePopulationCode === 'SEN') popSet.add('older');
  if (combinedSubstances.has('stimulants')) popSet.add('stimulants');
  if (combinedSubstances.has('xylazine')) popSet.add('xylazine');
  if (effectiveMentalHealth !== 'none') popSet.add('coOccurring');

  const populationRecommendations = [];
  if (popSet.has('pregnancy')) {
    populationRecommendations.push({ id: 'pregnancy', ...recommendForPregnancy() });
  }
  if (popSet.has('xylazine')) {
    populationRecommendations.push({ id: 'xylazine', ...recommendForXylazine() });
  }
  if (popSet.has('justice')) {
    populationRecommendations.push({ id: 'justice', ...recommendForJusticeInvolved() });
  }
  if (popSet.has('youth')) {
    populationRecommendations.push({ id: 'youth', ...recommendForYouth() });
  }
  if (popSet.has('older')) {
    populationRecommendations.push({ id: 'older', ...recommendForOlderAdults() });
  }
  if (popSet.has('stimulants')) {
    populationRecommendations.push({ id: 'stimulants', ...recommendForStimulants() });
  }
  if (popSet.has('coOccurring')) {
    populationRecommendations.push({ id: 'coOccurring', ...recommendForCoOccurring() });
  }

  const medCategories = new Set();
  if (
    combinedSubstances.has('opioids') ||
    combinedSubstances.has('xylazine') ||
    opioidScore.score > 0 ||
    effectiveTransitionParams.event !== 'none' ||
    crisisIntercept.category === 'overdose' ||
    crisisIntercept.category === 'solo_use'
  ) {
    medCategories.add('oud');
    medCategories.add('reversal');
  }
  if (combinedSubstances.has('alcohol') || alcoholScore.score > 0) {
    medCategories.add('aud');
  }
  if (combinedSubstances.has('stimulants')) {
    medCategories.add('stimulant_nicotine');
  }
  if (medCategories.size === 0) {
    medCategories.add('oud');
    medCategories.add('aud');
    medCategories.add('reversal');
  }

  const suggestedMedications = MEDICATIONS.filter((m) => medCategories.has(m.category)).map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    summary: m.summary,
    howToStart: m.howToStart,
    samhsaCodes: m.samhsaCodes,
    finderHref: m.finderHref,
  }));

  const codeOrder = [];
  const pushCode = (c) => {
    if (c && !codeOrder.includes(c)) codeOrder.push(c);
  };

  for (const c of crisisIntercept.codes) pushCode(c);
  if (alcoholScore.riskLevel === 'high_seizure_dt_risk') {
    pushCode('DT');
    pushCode('HI');
  } else if (alcoholScore.riskLevel === 'moderate') {
    pushCode('DT');
  }
  if (opioidScore.score >= 8) {
    pushCode('BU');
    pushCode('OTP');
  }
  for (const c of asamResult.codes) pushCode(c);
  if (effectiveTransitionParams.event !== 'none' || combinedSubstances.has('opioids')) {
    for (const c of transitionRisk.recommendedCodes) pushCode(c);
  }
  for (const rec of populationRecommendations) {
    for (const c of rec.codes) pushCode(c);
  }

  const recommendedCodes = codeOrder.slice(0, 8);
  const searchHref = recommendedCodes.length
    ? `#/treatment?codes=${recommendedCodes.join(',')}`
    : '#/treatment';

  const summaryPoints = [];
  if (crisisIntercept.intercepted) {
    summaryPoints.push(`${crisisIntercept.headline}: ${crisisIntercept.guidance}`);
  }
  summaryPoints.push(`${asamResult.asamLevel} — ${asamResult.asamTitle}: ${asamResult.summary}`);

  if (combinedSubstances.has('opioids') || opioidScore.score > 0) {
    summaryPoints.push(opioidScore.bupGuidance);
  }
  if (combinedSubstances.has('alcohol') || combinedSubstances.has('benzos') || alcoholScore.score > 0) {
    summaryPoints.push(alcoholScore.guidance);
  }
  if (effectiveTransitionParams.event !== 'none') {
    summaryPoints.push(`${transitionRisk.headline}: ${transitionRisk.physiologicalWhy}`);
  }
  for (const rec of populationRecommendations) {
    summaryPoints.push(rec.guidance);
  }

  const disclaimer = gt(
    'This is not medical advice, a diagnosis, or an emergency service. Everything you select or type stays in your browser’s memory and is never sent to any server.',
    'Esto no constituye consejo médico, diagnóstico ni un servicio de emergencia. Todo lo que seleccione o escriba permanece en la memoria de su navegador y nunca se envía a ningún servidor.',
  );

  return {
    crisisIntercept,
    asamResult,
    opioidScore,
    alcoholScore,
    transitionRisk,
    populationRecommendations,
    suggestedMedications,
    recommendedCodes,
    searchHref,
    summaryPoints,
    disclaimer,
  };
}

// ---------------------------------------------------------------------------
// Ephemeral In-RAM Session State & Quick Exit Integration
// ---------------------------------------------------------------------------

function createInitialState() {
  return {
    stepIndex: 0,
    freeText: '',
    emergencyFlag: 'none',
    messages: [],
    substances: [],
    opioidSymptoms: {},
    alcoholRisk: {},
    transition: {
      event: 'none',
      daysSince: 'under_7',
      onMoud: false,
      hasNaloxone: false,
    },
    asamAnswers: {
      substances: [],
      withdrawalRisk: 'none',
      biomedical: 'none',
      mentalHealth: 'none',
      environment: 'supportive',
      structureNeeded: 'flexible',
      payment: '',
      population: '',
      preferTelehealth: false,
    },
    populations: [],
    lastTriage: null,
  };
}

let guidedState = createInitialState();
const resetListeners = new Set();

/**
 * Returns a snapshot of the current in-RAM Guided Navigator session state.
 */
export function getGuidedNavigatorState() {
  return {
    ...guidedState,
    messages: [...guidedState.messages],
    substances: [...guidedState.substances],
    opioidSymptoms: { ...guidedState.opioidSymptoms },
    alcoholRisk: { ...guidedState.alcoholRisk },
    transition: { ...guidedState.transition },
    asamAnswers: {
      ...guidedState.asamAnswers,
      substances: [...(guidedState.asamAnswers.substances ?? [])],
    },
    populations: [...guidedState.populations],
  };
}

/**
 * Updates the in-RAM Guided Navigator state without touching persistent storage.
 *
 * @param {object} [patch]
 */
export function setGuidedNavigatorState(patch = {}) {
  if (!patch || typeof patch !== 'object') return getGuidedNavigatorState();

  if (typeof patch.stepIndex === 'number') {
    guidedState.stepIndex = Math.max(0, Math.min(4, Math.trunc(patch.stepIndex)));
  }
  if (typeof patch.freeText === 'string') {
    guidedState.freeText = patch.freeText;
  }
  if (typeof patch.emergencyFlag === 'string') {
    guidedState.emergencyFlag = patch.emergencyFlag;
  }
  if (Array.isArray(patch.messages)) {
    guidedState.messages = [...patch.messages];
  }
  if (Array.isArray(patch.substances)) {
    guidedState.substances = [...patch.substances];
    guidedState.asamAnswers.substances = [...patch.substances];
  }
  if (patch.opioidSymptoms && typeof patch.opioidSymptoms === 'object') {
    guidedState.opioidSymptoms = { ...guidedState.opioidSymptoms, ...patch.opioidSymptoms };
  }
  if (patch.alcoholRisk && typeof patch.alcoholRisk === 'object') {
    guidedState.alcoholRisk = { ...guidedState.alcoholRisk, ...patch.alcoholRisk };
  }
  if (patch.transition && typeof patch.transition === 'object') {
    guidedState.transition = { ...guidedState.transition, ...patch.transition };
  }
  if (patch.asamAnswers && typeof patch.asamAnswers === 'object') {
    guidedState.asamAnswers = {
      ...guidedState.asamAnswers,
      ...patch.asamAnswers,
      substances: Array.isArray(patch.asamAnswers.substances)
        ? [...patch.asamAnswers.substances]
        : guidedState.substances,
    };
  }
  if (Array.isArray(patch.populations)) {
    guidedState.populations = [...patch.populations];
  }

  guidedState.lastTriage = runGuidedTriage({
    freeText: guidedState.freeText,
    flags: guidedState.emergencyFlag !== 'none' ? [guidedState.emergencyFlag] : [],
    substances: guidedState.substances,
    opioidSymptoms: guidedState.opioidSymptoms,
    alcoholRisk: guidedState.alcoholRisk,
    transition: guidedState.transition,
    asamAnswers: guidedState.asamAnswers,
    populations: guidedState.populations,
  });

  return getGuidedNavigatorState();
}

/**
 * Immediately wipes all conversational history, triage selections, and results
 * in browser RAM and resets any mounted Guided Navigator view.
 */
export function resetGuidedNavigatorState() {
  guidedState = createInitialState();
  for (const fn of resetListeners) {
    try {
      fn();
    } catch {
      /* ignore view listener errors during quick exit */
    }
  }
  return getGuidedNavigatorState();
}

// Wire Quick Exit (#quick-exit click and double-Escape) to wipe RAM state automatically.
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  let lastEscTime = 0;
  document.addEventListener('keydown', (e) => {
    if (e?.key !== 'Escape') return;
    const now = Date.now();
    if (now - lastEscTime < 1000) {
      resetGuidedNavigatorState();
    }
    lastEscTime = now;
  });
  document.addEventListener('click', (e) => {
    const target = e?.target;
    if (target && (target.id === 'quick-exit' || target.closest?.('#quick-exit'))) {
      resetGuidedNavigatorState();
    }
  });
}

// ---------------------------------------------------------------------------
// Guided Conversational Navigator View
// ---------------------------------------------------------------------------

export const GUIDED_STEPS = [
  {
    id: 'safety',
    titleEn: 'Step 1: Immediate Safety & Emergency Check',
    titleEs: 'Paso 1: Verificación inmediata de seguridad y emergencia',
  },
  {
    id: 'substances',
    titleEn: 'Step 2: Substances Involved',
    titleEs: 'Paso 2: Sustancias involucradas',
  },
  {
    id: 'withdrawal',
    titleEn: 'Step 3: Withdrawal & Physical Safety Check',
    titleEs: 'Paso 3: Evaluación de abstinencia y seguridad física',
  },
  {
    id: 'transitions',
    titleEn: 'Step 4: Recent Transitions & Overdose Protection',
    titleEs: 'Paso 4: Transiciones recientes y protección contra sobredosis',
  },
  {
    id: 'context',
    titleEn: 'Step 5: Health Needs, Housing & Practical Fit',
    titleEs: 'Paso 5: Salud, vivienda y opciones prácticas',
  },
];

const QUICK_SCENARIOS = [
  {
    id: 'fentanyl-bup',
    labelEn: 'Starting buprenorphine or methadone after fentanyl',
    labelEs: 'Iniciar buprenorfina o metadona después del fentanilo',
    text: 'Using fentanyl and worried about precipitated withdrawal when starting buprenorphine or methadone',
    patch: {
      substances: ['opioids'],
      asamAnswers: { withdrawalRisk: 'moderate' },
    },
  },
  {
    id: 'alcohol-benzo',
    labelEn: 'Stopping daily alcohol or benzodiazepines safely',
    labelEs: 'Dejar el alcohol o las benzodiacepinas diarias de forma segura',
    text: 'Stopping daily heavy alcohol or benzodiazepine use and worried about withdrawal shakes or seizures',
    patch: {
      substances: ['alcohol', 'benzos'],
      alcoholRisk: { dailyHeavyUse: true, tremorSweatingAgitation: true },
      asamAnswers: { withdrawalRisk: 'moderate' },
    },
  },
  {
    id: 'pregnant-care',
    labelEn: 'Pregnant or postpartum & seeking supportive care',
    labelEs: 'Embarazada o en posparto buscando atención de apoyo',
    text: 'Pregnant and looking for specialized prenatal and substance use care with Medicaid',
    patch: {
      substances: ['opioids'],
      populations: ['pregnancy'],
      asamAnswers: { biomedical: 'pregnant', payment: 'MD' },
    },
  },
  {
    id: 'reentry-detox',
    labelEn: 'Just released from jail/prison or discharged from detox',
    labelEs: 'Recién salido de cárcel/prisión o dado de alta de desintoxicación',
    text: 'Just released and need same-day medication and naloxone to stay safe',
    patch: {
      substances: ['opioids'],
      populations: ['justice'],
      transition: { event: 'post_release', daysSince: 'under_7', onMoud: false, hasNaloxone: false },
      asamAnswers: { population: 'CJ' },
    },
  },
  {
    id: 'xylazine-wounds',
    labelEn: 'Xylazine (“tranq”) withdrawal or skin wounds',
    labelEs: 'Abstinencia de xilacina (“tranq”) o heridas en la piel',
    text: 'Xylazine in the supply with withdrawal and skin wounds needing care',
    patch: {
      substances: ['opioids', 'xylazine'],
      populations: ['xylazine'],
      asamAnswers: { withdrawalRisk: 'moderate', biomedical: 'acute_infection' },
    },
  },
  {
    id: 'using-alone',
    labelEn: 'About to use alone right now',
    labelEs: 'A punto de consumir a solas ahora mismo',
    text: 'I am about to use alone and want an overdose prevention spotter line',
    patch: {
      emergencyFlag: 'solo_use',
      substances: ['opioids'],
    },
  },
];

export function guidedNavigatorView() {
  const stepContainer = h('div', {
    class: 'guided-step-container',
    role: 'region',
    'aria-label': gt('Guided triage steps', 'Pasos de evaluación guiada'),
  });

  const chatHistoryContainer = h('div', {
    class: 'guided-chat-log',
    role: 'log',
    'aria-live': 'polite',
    'aria-label': gt('In-memory conversation summary', 'Resumen de conversación en memoria'),
  });

  const synthesisContainer = h('div', {
    id: 'guided-triage-synthesis',
    class: 'guided-synthesis-container',
    'aria-live': 'polite',
  });

  const textInput = h('input', {
    type: 'text',
    id: 'guided-free-text-input',
    class: 'input',
    value: guidedState.freeText,
     autocomplete: 'off',
    placeholder: gt(
      'Example: fentanyl withdrawal, pregnant, need Medicaid or telehealth...',
      'Ejemplo: abstinencia de fentanilo, embarazada, necesito Medicaid o telesalud...',
    ),
    'aria-label': gt(
      'Describe what is happening in your own words (kept only in browser memory)',
      'Describa lo que está ocurriendo en sus propias palabras (se mantiene solo en la memoria del navegador)',
    ),
    oninput: (e) => {
      const val = e?.target?.value ?? '';
      setGuidedNavigatorState({ freeText: val });
      renderSynthesis(false);
    },
  });

  function appendConversationTurn(role, text) {
    if (!text) return;
    const nextMessages = [
      ...guidedState.messages,
      { role, text: String(text) },
    ].slice(-12);
    setGuidedNavigatorState({ messages: nextMessages });
    renderChatLog();
  }

  function renderChatLog() {
    clear(chatHistoryContainer);
    if (!guidedState.messages.length) {
      chatHistoryContainer.append(
        fine(
          gt(
            'Your selections and notes appear here while this tab is open. Press Clear Answers or Quick Exit (Esc twice) at any time to clear browser memory.',
            'Sus selecciones y notas aparecen aquí mientras esta pestaña esté abierta. Presione Borrar respuestas o Salida rápida (Esc dos veces) en cualquier momento para limpiar la memoria del navegador.',
          ),
        ),
      );
      return;
    }

    const list = h(
      'ul',
      { class: 'list guided-message-list' },
      guidedState.messages.map((msg) =>
        h(
          'li',
          { class: `guided-msg guided-msg-${msg.role}` },
          strong(msg.role === 'user' ? gt('You: ', 'Usted: ') : gt('Navigator: ', 'Navegador: ')),
          msg.text,
        ),
      ),
    );
    chatHistoryContainer.append(list);
  }

  function toggleArrayItem(arr, item) {
    const set = new Set(arr);
    if (set.has(item)) set.delete(item);
    else set.add(item);
    return [...set];
  }

  function renderStepContent() {
    clear(stepContainer);
    const idx = guidedState.stepIndex;
    const stepMeta = GUIDED_STEPS[idx] ?? GUIDED_STEPS[0];

    const stepNavBar = h(
      'div',
      { class: 'actions', role: 'navigation', 'aria-label': gt('Triage step navigation', 'Navegación de pasos') },
      GUIDED_STEPS.map((st, i) =>
        h(
          'button',
          {
            type: 'button',
            class: i === idx ? 'btn btn-primary btn-small' : 'btn btn-ghost btn-small',
            'aria-current': i === idx ? 'step' : null,
            'aria-label': gt(st.titleEn, st.titleEs),
            onclick: () => {
              setGuidedNavigatorState({ stepIndex: i });
              renderStepContent();
            },
          },
          `${i + 1}`,
        ),
      ),
    );

    let bodyNode = null;

    if (idx === 0) {
      const currentFlag = guidedState.emergencyFlag;
      const safetyOptions = [
        {
          value: 'none',
          label: gt(
            'No immediate emergency — I want to explore care, withdrawal support, or harm reduction',
            'Sin emergencia inmediata — Quiero explorar atención, alivio de abstinencia o reducción de daños',
          ),
        },
        {
          value: 'overdose',
          label: gt(
            'Possible overdose right now (someone is unresponsive, not breathing normally, or needs naloxone)',
            'Posible sobredosis ahora mismo (alguien no responde, no respira normalmente o necesita naloxona)',
          ),
        },
        {
          value: 'crisis',
          label: gt(
            'Emotional crisis, thoughts of self-harm, or feeling unsafe with myself right now',
            'Crisis emocional, pensamientos de autolesión o sentirse inseguro consigo mismo ahora',
          ),
        },
        {
          value: 'solo_use',
          label: gt(
            'I am about to use alone and want a confidential overdose-prevention spotter line',
            'Voy a consumir a solas y quiero una línea confidencial de acompañamiento contra sobredosis',
          ),
        },
      ];

      bodyNode = h(
        'div',
        { class: 'stack' },
        p(
          gt(
            'First, let us check if anyone needs immediate life-saving support right now:',
            'Primero, verifiquemos si alguien necesita apoyo vital inmediato en este momento:',
          ),
        ),
        h(
          'div',
          { class: 'stack' },
          safetyOptions.map((opt) => {
            const active = currentFlag === opt.value;
            return h(
              'button',
              {
                type: 'button',
                class: active ? 'btn btn-primary' : 'btn btn-secondary',
                'aria-pressed': String(active),
                'aria-label': opt.label,
                onclick: () => {
                  setGuidedNavigatorState({
                    emergencyFlag: opt.value,
                    asamAnswers: {
                      ...guidedState.asamAnswers,
                      mentalHealth: opt.value === 'crisis' ? 'severe_crisis' : guidedState.asamAnswers.mentalHealth,
                    },
                  });
                  appendConversationTurn('user', opt.label);
                  renderStepContent();
                  renderSynthesis(true);
                },
              },
              opt.label,
            );
          }),
        ),
      );
    } else if (idx === 1) {
      const substanceChoices = [
        {
          id: 'opioids',
          label: gt('Opioids (fentanyl, heroin, oxycodone, pressed pills)', 'Opioides (fentanilo, heroína, oxicodona, pastillas prensadas)'),
        },
        {
          id: 'alcohol',
          label: gt('Alcohol (heavy or daily drinking)', 'Alcohol (consumo intenso o diario)'),
        },
        {
          id: 'benzos',
          label: gt('Benzodiazepines / sedatives (Xanax, Klonopin, Valium, Ativan)', 'Benzodiacepinas / sedantes (Xanax, Klonopin, Valium, Ativan)'),
        },
        {
          id: 'xylazine',
          label: gt('Xylazine or medetomidine (“tranq” in dope or pills)', 'Xilacina o medetomidina (“tranq” en opioides o pastillas)'),
        },
        {
          id: 'stimulants',
          label: gt('Stimulants (methamphetamine, cocaine, crack)', 'Estimulantes (metanfetamina, cocaína, crack)'),
        },
        {
          id: 'other',
          label: gt('Other substances or unsure', 'Otras sustancias o no estoy seguro'),
        },
      ];

      bodyNode = h(
        'div',
        { class: 'stack' },
        p(
          gt(
            'Select any substances involved (choose as many as apply):',
            'Seleccione las sustancias involucradas (puede elegir varias):',
          ),
        ),
        h(
          'div',
          { class: 'stack' },
          substanceChoices.map((item) => {
            const selected = guidedState.substances.includes(item.id);
            return h(
              'button',
              {
                type: 'button',
                class: selected ? 'btn btn-primary' : 'btn btn-secondary',
                'aria-pressed': String(selected),
                'aria-label': item.label,
                onclick: () => {
                  const nextSubs = toggleArrayItem(guidedState.substances, item.id);
                  setGuidedNavigatorState({ substances: nextSubs });
                  renderStepContent();
                  renderSynthesis(true);
                },
              },
              item.label,
            );
          }),
        ),
      );
    } else if (idx === 2) {
      const withdrawalLevels = [
        {
          value: 'none',
          label: gt('No withdrawal expected right now', 'No se espera abstinencia en este momento'),
        },
        {
          value: 'mild',
          label: gt('Mild (early cravings, restlessness, trouble sleeping)', 'Leve (antojos tempranos, inquietud, dificultad para dormir)'),
        },
        {
          value: 'moderate',
          label: gt('Moderate (sweating, chills, muscle aches, nausea, hand tremors)', 'Moderada (sudoración, escalofríos, dolores musculares, náuseas, temblores)'),
        },
        {
          value: 'severe',
          label: gt('Severe (past seizures/DTs, repeated vomiting, confusion, severe shakes)', 'Grave (convulsiones o delirium tremens previos, vómitos repetidos, confusión)'),
        },
      ];

      const opioidSignChecks = [
        { key: 'restlessness', label: gt('Opioid sign: Restlessness or pacing', 'Signo opioide: Inquietud o incapacidad para quedarse quieto') },
        { key: 'sweating_chills', label: gt('Opioid sign: Sweating or cold chills', 'Signo opioide: Sudoración o escalofríos') },
        { key: 'muscle_bone_aches', label: gt('Opioid sign: Deep muscle, back, or joint aches', 'Signo opioide: Dolores profundos en músculos o articulaciones') },
        { key: 'gi_upset', label: gt('Opioid sign: Stomach cramps, nausea, vomiting, or diarrhea', 'Signo opioide: Cólicos estomacales, náuseas, vómitos o diarrea') },
        { key: 'tremor_gooseflesh', label: gt('Opioid sign: Dilated pupils, goosebumps, or shaky hands', 'Signo opioide: Pupilas dilatadas, piel de gallina o temblor de manos') },
      ];

      const alcoholRiskChecks = [
        { key: 'dailyHeavyUse', label: gt('Alcohol/Benzo risk: Daily heavy alcohol or daily benzo use (2+ weeks)', 'Riesgo alcohol/benzo: Uso diario intenso por 2+ semanas') },
        { key: 'priorSeizuresOrDTs', label: gt('Alcohol/Benzo risk: Past withdrawal seizure or delirium tremens (DTs)', 'Riesgo alcohol/benzo: Convulsión previa o delirium tremens (DTs)') },
        { key: 'tremorSweatingAgitation', label: gt('Alcohol/Benzo risk: Active hand shakes or drenching sweats when cutting back', 'Riesgo alcohol/benzo: Temblores activos o sudoración intensa al reducir el consumo') },
        { key: 'unableToKeepFluids', label: gt('Alcohol/Benzo risk: Repeated vomiting or unable to keep fluids down', 'Riesgo alcohol/benzo: Vómitos repetidos o incapacidad para retener líquidos') },
      ];

      bodyNode = h(
        'div',
        { class: 'stack' },
        p(gt('How strong are withdrawal symptoms or risks right now?', '¿Qué tan intensos son los síntomas o riesgos de abstinencia ahora?')),
        h(
          'div',
          { class: 'stack' },
          withdrawalLevels.map((lvl) => {
            const active = guidedState.asamAnswers.withdrawalRisk === lvl.value;
            return h(
              'button',
              {
                type: 'button',
                class: active ? 'btn btn-primary' : 'btn btn-secondary',
                'aria-pressed': String(active),
                'aria-label': lvl.label,
                onclick: () => {
                  setGuidedNavigatorState({
                    asamAnswers: { ...guidedState.asamAnswers, withdrawalRisk: lvl.value },
                  });
                  renderStepContent();
                  renderSynthesis(true);
                },
              },
              lvl.label,
            );
          }),
        ),
        p(strong(gt('Optional: Check specific opioid withdrawal signs (for Buprenorphine / Bernese timing):', 'Opcional: Marque signos de abstinencia de opioides (para el momento de inicio de buprenorfina):'))),
        h(
          'div',
          { class: 'stack' },
          opioidSignChecks.map((item) => {
            const checked = Boolean(guidedState.opioidSymptoms[item.key]);
            return h(
              'button',
              {
                type: 'button',
                class: checked ? 'btn btn-primary btn-small' : 'btn btn-ghost btn-small',
                'aria-pressed': String(checked),
                'aria-label': item.label,
                onclick: () => {
                  setGuidedNavigatorState({
                    opioidSymptoms: {
                      ...guidedState.opioidSymptoms,
                      [item.key]: checked ? 0 : 3,
                    },
                  });
                  renderStepContent();
                  renderSynthesis(true);
                },
              },
              item.label,
            );
          }),
        ),
        p(strong(gt('Optional: Check alcohol or benzodiazepine seizure/DT risk factors:', 'Opcional: Marque factores de riesgo de convulsiones por alcohol o benzodiacepinas:'))),
        h(
          'div',
          { class: 'stack' },
          alcoholRiskChecks.map((item) => {
            const checked = Boolean(guidedState.alcoholRisk[item.key]);
            return h(
              'button',
              {
                type: 'button',
                class: checked ? 'btn btn-primary btn-small' : 'btn btn-ghost btn-small',
                'aria-pressed': String(checked),
                'aria-label': item.label,
                onclick: () => {
                  setGuidedNavigatorState({
                    alcoholRisk: {
                      ...guidedState.alcoholRisk,
                      [item.key]: !checked,
                    },
                  });
                  renderStepContent();
                  renderSynthesis(true);
                },
              },
              item.label,
            );
          }),
        ),
      );
    } else if (idx === 3) {
      const transitionEvents = [
        { value: 'none', label: gt('No recent hospital, detox, or incarceration transition', 'Sin transición reciente de hospital, desintoxicación o encarcelamiento') },
        { value: 'post_release', label: gt('Recently released from jail or prison (re-entry window)', 'Recién salido de la cárcel o prisión (etapa de reingreso)') },
        { value: 'post_overdose', label: gt('Recent non-fatal overdose or ER reversal', 'Sobredosis reciente no mortal o atención en urgencias') },
        { value: 'post_detox_hospital', label: gt('Recently left detox, rehab, or hospital inpatient care', 'Salida reciente de desintoxicación, rehabilitación u hospitalización') },
        { value: 'post_naltrexone', label: gt('Recently stopped or missed Vivitrol / naltrexone', 'Suspensión o dosis omitida reciente de Vivitrol / naltrexona') },
      ];

      bodyNode = h(
        'div',
        { class: 'stack' },
        p(
          gt(
            'Opioid tolerance drops rapidly within days of any pause in use. Have you experienced any of these transitions recently?',
            'La tolerancia a los opioides disminuye rápidamente tras pocos días sin consumo. ¿Ha pasado por alguna de estas transiciones recientemente?',
          ),
        ),
        h(
          'div',
          { class: 'stack' },
          transitionEvents.map((ev) => {
            const active = guidedState.transition.event === ev.value;
            return h(
              'button',
              {
                type: 'button',
                class: active ? 'btn btn-primary' : 'btn btn-secondary',
                'aria-pressed': String(active),
                'aria-label': ev.label,
                onclick: () => {
                  setGuidedNavigatorState({
                    transition: { ...guidedState.transition, event: ev.value },
                  });
                  renderStepContent();
                  renderSynthesis(true);
                },
              },
              ev.label,
            );
          }),
        ),
        h(
          'div',
          { class: 'actions' },
          h(
            'button',
            {
              type: 'button',
              class: guidedState.transition.onMoud ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small',
              'aria-pressed': String(Boolean(guidedState.transition.onMoud)),
              'aria-label': gt('Currently taking daily buprenorphine or methadone', 'Tomando actualmente buprenorfina o metadona diaria'),
              onclick: () => {
                setGuidedNavigatorState({
                  transition: { ...guidedState.transition, onMoud: !guidedState.transition.onMoud },
                });
                renderStepContent();
                renderSynthesis(true);
              },
            },
            gt('Currently on daily buprenorphine or methadone', 'En tratamiento diario con buprenorfina o metadona'),
          ),
          h(
            'button',
            {
              type: 'button',
              class: guidedState.transition.hasNaloxone ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small',
              'aria-pressed': String(Boolean(guidedState.transition.hasNaloxone)),
              'aria-label': gt('Currently have naloxone (Narcan) on hand', 'Cuenta actualmente con naloxona (Narcan) a la mano'),
              onclick: () => {
                setGuidedNavigatorState({
                  transition: { ...guidedState.transition, hasNaloxone: !guidedState.transition.hasNaloxone },
                });
                renderStepContent();
                renderSynthesis(true);
              },
            },
            gt('I have naloxone (Narcan) on hand', 'Tengo naloxona (Narcan) a la mano'),
          ),
        ),
      );
    } else {
      const popToggles = [
        {
          id: 'pregnancy',
          label: gt('Pregnant or postpartum (ACOG perinatal care & PW filter)', 'Embarazada o posparto (atención perinatal y filtro PW)'),
          onToggle: () => {
            const nextPops = toggleArrayItem(guidedState.populations, 'pregnancy');
            const isPreg = nextPops.includes('pregnancy');
            setGuidedNavigatorState({
              populations: nextPops,
              asamAnswers: {
                ...guidedState.asamAnswers,
                biomedical: isPreg ? 'pregnant' : 'none',
              },
            });
          },
          isActive: () => guidedState.populations.includes('pregnancy') || guidedState.asamAnswers.biomedical === 'pregnant',
        },
        {
          id: 'acute_infection',
          label: gt('Fever, xylazine skin wound, or possible infection needing medical care', 'Fiebre, herida cutánea por xilacina o posible infección que requiere atención médica'),
          onToggle: () => {
            const nextBio = guidedState.asamAnswers.biomedical === 'acute_infection' ? 'none' : 'acute_infection';
            setGuidedNavigatorState({
              asamAnswers: { ...guidedState.asamAnswers, biomedical: nextBio },
            });
          },
          isActive: () => guidedState.asamAnswers.biomedical === 'acute_infection',
        },
        {
          id: 'coOccurring',
          label: gt('Co-occurring depression, anxiety, PTSD, or trauma (MHSU / TRMA)', 'Depresión, ansiedad, TEPT o trauma concurrente (MHSU / TRMA)'),
          onToggle: () => {
            const nextPops = toggleArrayItem(guidedState.populations, 'coOccurring');
            const hasMh = nextPops.includes('coOccurring');
            setGuidedNavigatorState({
              populations: nextPops,
              asamAnswers: {
                ...guidedState.asamAnswers,
                mentalHealth: hasMh ? 'mild_moderate' : 'none',
              },
            });
          },
          isActive: () => guidedState.populations.includes('coOccurring') || guidedState.asamAnswers.mentalHealth === 'mild_moderate',
        },
        {
          id: 'unhoused',
          label: gt('Unhoused, in a shelter, or needing recovery housing (RES / HH)', 'Sin hogar, en un refugio o necesitando vivienda de recuperación (RES / HH)'),
          onToggle: () => {
            const nextEnv = guidedState.asamAnswers.environment === 'unhoused' ? 'supportive' : 'unhoused';
            setGuidedNavigatorState({
              asamAnswers: { ...guidedState.asamAnswers, environment: nextEnv },
            });
          },
          isActive: () => guidedState.asamAnswers.environment === 'unhoused',
        },
        {
          id: 'youth',
          label: gt('Adolescent or young adult (ADOL / YA)', 'Adolescente o adulto joven (ADOL / YA)'),
          onToggle: () => {
            const nextPops = toggleArrayItem(guidedState.populations, 'youth');
            setGuidedNavigatorState({
              populations: nextPops,
              asamAnswers: {
                ...guidedState.asamAnswers,
                population: nextPops.includes('youth') ? 'ADOL' : '',
              },
            });
          },
          isActive: () => guidedState.populations.includes('youth') || guidedState.asamAnswers.population === 'ADOL',
        },
        {
          id: 'older',
          label: gt('Older adult / senior (SEN)', 'Adulto mayor (SEN)'),
          onToggle: () => {
            const nextPops = toggleArrayItem(guidedState.populations, 'older');
            setGuidedNavigatorState({
              populations: nextPops,
              asamAnswers: {
                ...guidedState.asamAnswers,
                population: nextPops.includes('older') ? 'SEN' : '',
              },
            });
          },
          isActive: () => guidedState.populations.includes('older') || guidedState.asamAnswers.population === 'SEN',
        },
        {
          id: 'telehealth',
          label: gt('Prefer telehealth / virtual care (TELE)', 'Prefiero telesalud / atención virtual (TELE)'),
          onToggle: () => {
            setGuidedNavigatorState({
              asamAnswers: {
                ...guidedState.asamAnswers,
                preferTelehealth: !guidedState.asamAnswers.preferTelehealth,
              },
            });
          },
          isActive: () => Boolean(guidedState.asamAnswers.preferTelehealth),
        },
        {
          id: 'medicaid',
          label: gt('Using Medicaid (MD)', 'Uso Medicaid (MD)'),
          onToggle: () => {
            setGuidedNavigatorState({
              asamAnswers: {
                ...guidedState.asamAnswers,
                payment: guidedState.asamAnswers.payment === 'MD' ? '' : 'MD',
              },
            });
          },
          isActive: () => guidedState.asamAnswers.payment === 'MD',
        },
        {
          id: 'sliding_scale',
          label: gt('Need sliding fee scale or payment assistance (SS)', 'Necesito escala móvil de tarifas o asistencia de pago (SS)'),
          onToggle: () => {
            setGuidedNavigatorState({
              asamAnswers: {
                ...guidedState.asamAnswers,
                payment: guidedState.asamAnswers.payment === 'SS' ? '' : 'SS',
              },
            });
          },
          isActive: () => guidedState.asamAnswers.payment === 'SS',
        },
      ];

      bodyNode = h(
        'div',
        { class: 'stack' },
        p(
          gt(
            'Select any health, housing, or practical preferences to tailor your SAMHSA treatment filters:',
            'Seleccione cualquier preferencia de salud, vivienda o acceso para adaptar sus filtros de búsqueda de SAMHSA:',
          ),
        ),
        h(
          'div',
          { class: 'stack' },
          popToggles.map((item) => {
            const active = item.isActive();
            return h(
              'button',
              {
                type: 'button',
                class: active ? 'btn btn-primary' : 'btn btn-secondary',
                'aria-pressed': String(active),
                'aria-label': item.label,
                onclick: () => {
                  item.onToggle();
                  renderStepContent();
                  renderSynthesis(true);
                },
              },
              item.label,
            );
          }),
        ),
      );
    }

    const prevNextBar = h(
      'div',
      { class: 'actions' },
      idx > 0 &&
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-secondary btn-small',
            'aria-label': gt('Previous step', 'Paso anterior'),
            onclick: () => {
              setGuidedNavigatorState({ stepIndex: idx - 1 });
              renderStepContent();
            },
          },
          gt('Previous step', 'Paso anterior'),
        ),
      idx < GUIDED_STEPS.length - 1 &&
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-primary btn-small',
            'aria-label': gt('Next step', 'Siguiente paso'),
            onclick: () => {
              setGuidedNavigatorState({ stepIndex: idx + 1 });
              renderStepContent();
            },
          },
          gt('Next step', 'Siguiente paso'),
        ),
    );

    stepContainer.append(
      h(
        'div',
        { class: 'card stack' },
        stepNavBar,
        h('h3', null, gt(stepMeta.titleEn, stepMeta.titleEs)),
        bodyNode,
        prevNextBar,
      ),
    );
  }

  function renderSynthesis(shouldAnnounce = false) {
    clear(synthesisContainer);
    const triage =
      guidedState.lastTriage ??
      runGuidedTriage({
        freeText: guidedState.freeText,
        flags: guidedState.emergencyFlag !== 'none' ? [guidedState.emergencyFlag] : [],
        substances: guidedState.substances,
        opioidSymptoms: guidedState.opioidSymptoms,
        alcoholRisk: guidedState.alcoholRisk,
        transition: guidedState.transition,
        asamAnswers: guidedState.asamAnswers,
        populations: guidedState.populations,
      });

    if (triage.crisisIntercept.intercepted) {
      const intercept = triage.crisisIntercept;
      const actionNodes = intercept.actions.map((act) => {
        if (act.href.startsWith('tel:')) {
          const num = act.href.replace(/^tel:/, '');
          return tel(num, [icon('phone'), act.label], {
            class: act.kind === 'emergency' ? 'btn btn-emergency' : 'btn btn-secondary',
            'aria-label': act.label,
          });
        }
        return h(
          'a',
          {
            class: act.kind === 'primary' ? 'btn btn-primary' : 'btn btn-secondary',
            href: act.href,
            'aria-label': act.label,
          },
          act.label,
        );
      });

      synthesisContainer.append(
        h(
          'div',
          {
            class: 'callout callout-emergency',
            role: 'alert',
            'aria-label': intercept.headline,
          },
          h('p', { class: 'callout-title' }, icon('alert'), intercept.headline),
          p(intercept.guidance),
          h('div', { class: 'actions' }, ...actionNodes),
          intercept.hotlines?.length ? hotlineGrid(intercept.hotlines) : null,
        ),
      );
    }

    const codeChips = h(
      'ul',
      {
        class: 'chips',
        'aria-label': gt('Recommended SAMHSA filter codes', 'Códigos de filtro SAMHSA recomendados'),
      },
      triage.recommendedCodes.map((code) => {
        const meta = CODE_LABELS[code] ?? { en: code, es: code, tone: 'care' };
        const label = gt(meta.en, meta.es);
        return h('li', { class: `chip chip-${meta.tone}` }, `${label} (${code})`);
      }),
    );

    const medCards = triage.suggestedMedications.slice(0, 4).map((med) =>
      h(
        'li',
        { class: 'card stack' },
        h('h4', null, med.name),
        p(med.summary),
        fine(med.howToStart),
        h(
          'div',
          { class: 'actions' },
          h(
            'a',
            {
              class: 'btn btn-secondary btn-small',
              href: med.finderHref,
              'aria-label': `${gt('Find providers for', 'Buscar proveedores para')} ${med.name}`,
            },
            icon('search'),
            `${gt('Find', 'Buscar')} ${med.name}`,
          ),
          h(
            'a',
            {
              class: 'btn btn-ghost btn-small',
              href: '#/medications',
              'aria-label': `${gt('Read clinical guide for', 'Leer guía clínica sobre')} ${med.name}`,
            },
            gt('Medication details', 'Detalles del medicamento'),
          ),
        ),
      ),
    );

    const synthesisCard = h(
      'div',
      {
        class: 'card stack',
        role: 'region',
        'aria-label': gt('Live guided triage synthesis', 'Síntesis guiada en tiempo real'),
      },
      h(
        'p',
        { class: 'chips' },
        h('span', { class: 'chip chip-care' }, triage.asamResult.asamLevel),
        triage.opioidScore.score > 0 &&
          h('span', { class: 'chip chip-med' }, `${gt('Opioid Withdrawal Score', 'Puntaje abstinencia opioide')}: ${triage.opioidScore.score}`),
        triage.alcoholScore.score > 0 &&
          h('span', { class: 'chip chip-med' }, `${gt('Alcohol/Benzo Risk Score', 'Riesgo alcohol/benzo')}: ${triage.alcoholScore.score}`),
      ),
      h('h3', null, triage.asamResult.asamTitle),
      p(triage.asamResult.summary),
      h('h4', null, gt('Plain-Language Clinical & Safety Synthesis', 'Síntesis clínica y de seguridad en lenguaje sencillo')),
      ul(triage.summaryPoints),
      triage.asamResult.redFlags.length > 0 &&
        h(
          'div',
          { class: 'callout callout-emergency' },
          h('p', { class: 'callout-title' }, icon('alert'), gt('Safety Warnings to Discuss', 'Advertencias de seguridad importantes')),
          ul(triage.asamResult.redFlags),
        ),
      h('h4', null, gt('Recommended SAMHSA Directory Filter Codes', 'Códigos de filtro recomendados del directorio SAMHSA')),
      codeChips,
      h(
        'div',
        { class: 'actions' },
        h(
          'a',
          {
            class: 'btn btn-primary',
            href: triage.searchHref,
            'aria-label': gt('Open treatment finder with recommended filters', 'Abrir buscador de tratamiento con los filtros recomendados'),
          },
          icon('search'),
          gt('Find Matching Treatment Providers', 'Buscar proveedores de tratamiento compatibles'),
        ),
        h(
          'a',
          {
            class: 'btn btn-secondary',
            href: triage.asamResult.broadSearchHref,
            'aria-label': gt('Broaden treatment search to core filters', 'Ampliar búsqueda de tratamiento a filtros principales'),
          },
          gt('Broaden Search (Core Filters)', 'Ampliar búsqueda (filtros principales)'),
        ),
        h(
          'a',
          {
            class: 'btn btn-secondary',
            href: '#/overdose',
            'aria-label': gt('Open overdose response and 2-minute naloxone timer', 'Abrir respuesta a sobredosis y temporizador de naloxona de 2 minutos'),
          },
          icon('heart'),
          gt('Overdose & Naloxone Timer', 'Guía de sobredosis y naloxona'),
        ),
        h(
          'a',
          {
            class: 'btn btn-ghost',
            href: '#/navigator',
            'aria-label': gt('Open full 6-dimension ASAM clinical calculator', 'Abrir calculadora clínica ASAM completa de 6 dimensiones'),
          },
          gt('Full ASAM Calculator', 'Calculadora ASAM completa'),
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-ghost btn-small',
            'aria-label': gt('Print this triage summary handout', 'Imprimir este resumen de orientación'),
            onclick: () => {
              if (typeof window !== 'undefined' && typeof window.print === 'function') {
                window.print();
              }
            },
          },
          gt('Print Handout', 'Imprimir resumen'),
        ),
      ),
      medCards.length > 0 &&
        h(
          'div',
          { class: 'stack' },
          h('h4', null, gt('Evidence-Based Medications to Discuss', 'Medicamentos basados en evidencia para conversar')),
          h('ul', { class: 'grid' }, ...medCards),
        ),
      fine(triage.disclaimer),
    );

    synthesisContainer.append(synthesisCard);

    if (shouldAnnounce) {
      announce(`${triage.asamResult.asamLevel}: ${triage.asamResult.asamTitle}`);
    }
  }

  const handleResetView = () => {
    textInput.value = '';
    textInput.setAttribute('value', '');
    renderChatLog();
    renderStepContent();
    renderSynthesis(false);
  };
  resetListeners.add(handleResetView);

  renderChatLog();
  renderStepContent();
  renderSynthesis(false);

  return h(
    'div',
    { class: 'view-guided-navigator stack' },
    pageHeader(
      gt('Guided Care & Safety Navigator', 'Navegador guiado de atención y seguridad'),
      gt(
        'Step through plain-language questions or describe your situation in your own words to get tailored treatment filters, withdrawal safety checks, medication options, and crisis resources.',
        'Avance por preguntas sencillas o describa su situación en sus propias palabras para obtener filtros de tratamiento personalizados, evaluaciones de abstinencia, opciones de medicamentos y recursos de crisis.',
      ),
      h(
        'div',
        {
          class: 'callout callout-info',
          role: 'region',
          'aria-label': gt('Privacy and clinical disclaimer', 'Aviso de privacidad y descargo clínico'),
        },
        p(
          strong(gt('Private by design & kept in your browser’s memory: ', 'Privado por diseño y mantenido en la memoria de su navegador: ')),
          gt(
            'This is not medical advice, a diagnosis, or an emergency service. Everything you select or type stays in your browser’s memory and is never sent to any server.',
            'Esto no constituye consejo médico, diagnóstico ni un servicio de emergencia. Todo lo que seleccione o escriba permanece en la memoria de su navegador y nunca se envía a ningún servidor.',
          ),
        ),
        h(
          'div',
          { class: 'actions' },
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-secondary btn-small',
              'aria-label': gt('Clear all guided navigator answers from browser memory', 'Borrar todas las respuestas del navegador en memoria'),
              onclick: () => {
                resetGuidedNavigatorState();
                announce(gt('Guided navigator answers cleared from browser memory.', 'Respuestas borradas de la memoria del navegador.'));
              },
            },
            gt('Clear Answers in Memory', 'Borrar respuestas en memoria'),
          ),
        ),
      ),
    ),

    section(
      'guided-instant-crisis',
      gt('Instant Crisis & Overdose Help', 'Ayuda instantánea para crisis y sobredosis'),
      p(
        gt(
          'If someone is unresponsive, in emotional crisis, or about to use alone, use these one-click resources immediately:',
          'Si alguien no responde, está en crisis emocional o está a punto de consumir a solas, utilice estos recursos de inmediato:',
        ),
      ),
      h(
        'div',
        { class: 'actions' },
        tel('911', [icon('phone'), gt('Call 911 Immediately', 'Llamar al 911 de inmediato')], {
          class: 'btn btn-emergency btn-small',
          'aria-label': gt('Call 911 Immediately', 'Llamar al 911 de inmediato'),
        }),
        tel('988', [icon('phone'), gt('Call or Text 988 Lifeline', 'Llamar o enviar texto al 988')], {
          class: 'btn btn-secondary btn-small',
          'aria-label': gt('Call or Text 988 Suicide and Crisis Lifeline', 'Llamar o enviar texto al 988 Línea de Crisis'),
        }),
        tel(NEVER_USE_ALONE.number, [icon('phone'), `Never Use Alone (${NEVER_USE_ALONE.label})`], {
          class: 'btn btn-secondary btn-small',
          'aria-label': `Call Never Use Alone at ${NEVER_USE_ALONE.label}`,
        }),
        tel('8009720590', [icon('phone'), 'SafeSpot (800-972-0590)'], {
          class: 'btn btn-secondary btn-small',
          'aria-label': 'Call SafeSpot Overdose Prevention Line at 800-972-0590',
        }),
        h(
          'a',
          {
            class: 'btn btn-primary btn-small',
            href: '#/overdose',
            'aria-label': gt('Open Step-by-Step Overdose & 2-Minute Naloxone Timer', 'Abrir guía paso a paso de sobredosis y temporizador de naloxona'),
          },
          icon('heart'),
          gt('Overdose & 2-Minute Naloxone Timer', 'Guía de sobredosis y temporizador de naloxona'),
        ),
      ),
    ),

    section(
      'guided-conversational-input',
      gt('Describe What Is Happening (Optional, Local to This Tab)', 'Describa lo que está ocurriendo (opcional, local en esta pestaña)'),
      p(
        gt(
          'Type a few words or pick a common situation below. Deterministic rules match your words to clinical calculators right inside this browser tab:',
          'Escriba algunas palabras o elija una situación común a continuación. Reglas deterministas conectan sus palabras con las calculadoras clínicas directamente en esta pestaña:',
        ),
      ),
      h(
        'form',
        {
          class: 'stack',
          onsubmit: (e) => {
            e?.preventDefault?.();
            if (textInput.value.trim()) {
              appendConversationTurn('user', textInput.value.trim());
            }
            setGuidedNavigatorState({ freeText: textInput.value });
            renderSynthesis(true);
          },
        },
        h(
          'div',
          { class: 'actions' },
          textInput,
          h(
            'button',
            {
              type: 'submit',
              class: 'btn btn-primary',
              'aria-label': gt('Update guidance from text input', 'Actualizar orientación según el texto'),
            },
            gt('Update Guidance', 'Actualizar orientación'),
          ),
        ),
      ),
      p(strong(gt('Or tap a common situation:', 'O seleccione una situación común:'))),
      h(
        'div',
        { class: 'actions' },
        QUICK_SCENARIOS.map((sc) =>
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-ghost btn-small',
              'aria-label': gt(sc.labelEn, sc.labelEs),
              onclick: () => {
                textInput.value = sc.text;
                textInput.setAttribute('value', sc.text);
                setGuidedNavigatorState({
                  freeText: sc.text,
                  ...sc.patch,
                });
                appendConversationTurn('user', gt(sc.labelEn, sc.labelEs));
                renderStepContent();
                renderSynthesis(true);
              },
            },
            gt(sc.labelEn, sc.labelEs),
          ),
        ),
      ),
      chatHistoryContainer,
    ),

    section(
      'guided-step-by-step',
      gt('Step-by-Step Guided Questions', 'Preguntas guiadas paso a paso'),
      stepContainer,
    ),

    section(
      'guided-live-results',
      gt('Your Tailored Care & Safety Synthesis', 'Su síntesis personalizada de atención y seguridad'),
      synthesisContainer,
    ),
  );
}
