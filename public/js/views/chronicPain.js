// public/js/views/chronicPain.js
// HarborPath Chronic Pain, Buprenorphine Analgesia & Sedative Deprescribing Specialist
// Pure ES module, 0 dependencies. 100% ephemeral in-RAM clinical guidance.
// References:
// - CDC Clinical Practice Guideline for Prescribing Opioids for Pain (MMWR 2022;71(No. RR-3):1–95)
// - HHS Pain Management Best Practices Inter-Agency Task Force Report (2019)
// - Ashton CH. The Ashton Manual: Benzodiazepines — How They Work & How to Withdraw (2002, rev. 2011)
// - FDA Drug Safety Communication: FDA requiring Boxed Warning updated for Benzodiazepine class (2020)
// - ASAM National Practice Guideline for the Treatment of Opioid Use Disorder (2020 focused update)

import { h, append, icon } from '../dom.js';
import { t } from '../i18n.js';

/**
 * Clinical and statutory frameworks for chronic pain management and sedative deprescribing.
 */
export const CHRONIC_PAIN_STANDARDS = {
  CDC_2022_GUIDELINE: {
    titleEn: 'CDC 2022 Opioid Guideline: Patient Non-Abandonment & Anti-Forced-Taper Mandate',
    titleEs: 'Guía de Opioides de los CDC 2022: Mandato de No Abandono y Contra la Reducción Forzada',
    summaryEn: 'The CDC 2022 Clinical Practice Guideline explicitly warns clinicians against rapid, forced, or involuntary opioid tapers and abrupt discontinuation. Abrupt cessation significantly increases the risk of severe withdrawal, acute psychological distress, suicidal ideation, and transition to unregulated street opioids.',
    summaryEs: 'La Guía de Práctica Clínica de los CDC de 2022 advierte explícitamente a los médicos contra la reducción rápida, forzada o involuntaria de opioides y la interrupción abrupta. La interrupción brusca aumenta sustancialmente el riesgo de abstinencia grave, angustia psicológica aguda, ideación suicida y transición a opioides no regulados.',
    recommendationsEn: [
      'Clinicians should not abruptly taper or dismiss patients receiving long-term opioid therapy.',
      'Tapers should be collaborative, slow, and individualized (e.g. 5%–10% reduction per month), pausing whenever withdrawal or pain worsens.',
      'Multimodal analgesia (SNRIs, topical analgesics, physical rehabilitation) must be established before and during dose adjustments.'
    ],
    recommendationsEs: [
      'Los médicos no deben reducir drásticamente ni dar de alta injustificadamente a pacientes en terapia de opioides a largo plazo.',
      'Las reducciones deben ser consensuadas, lentas e individualizadas (p. ej., reducción del 5% al 10% mensual), haciendo pausas cuando el dolor o la abstinencia empeoren.',
      'Se deben establecer terapias multimodales (ISRSN, analgésicos tópicos, rehabilitación física) antes y durante los ajustes de dosis.'
    ]
  },
  BUPRENORPHINE_ANALGESIA: {
    titleEn: 'Buprenorphine for Chronic Pain & OUD: Split-Dosing Pharmacokinetics',
    titleEs: 'Buprenorfina para el Dolor Crónico y TUS: Farmacocinética de Dosis Dividida',
    summaryEn: 'Buprenorphine is a Schedule III partial mu-opioid agonist with a protective respiratory depression ceiling and low tolerance development. While buprenorphine suppresses opioid withdrawal and cravings for 24 to 36 hours, its analgesic duration of action lasts only 6 to 8 hours. Effective pain management requires split dosing (TID or QID: every 6 to 8 hours) rather than once-daily administration.',
    summaryEs: 'La buprenorfina es un agonista parcial mu-opioide (Lista III) con un techo protector de depresión respiratoria y menor desarrollo de tolerancia. Mientras que la buprenorfina suprime la abstinencia y los deseos de consumo durante 24 a 36 horas, su duración analgésica dura solo de 6 a 8 horas. El alivio eficaz del dolor requiere dosis divididas (tres o cuatro veces al día: cada 6 a 8 horas) en lugar de una dosis única diaria.',
    recommendationsEn: [
      'Split total daily dose into 2 to 4 equal doses taken every 6 to 8 hours for continuous analgesic coverage.',
      'Formulations include buccal films (Belbuca, mcg-dosed), transdermal patches (Butrans, mcg/hr), and sublingual tablets/films (Subutex, Suboxone, Zubsolv, mg-dosed).',
      'Bernese method (low-dose micro-induction) allows smooth initiation without requiring acute withdrawal, overlapping small buprenorphine doses while continuing baseline full agonists.'
    ],
    recommendationsEs: [
      'Dividir la dosis diaria total en 2 a 4 tomas iguales administradas cada 6 a 8 horas para una cobertura analgésica continua.',
      'Las formulaciones incluyen películas bucales (Belbuca en microgramos), parches transdérmicos (Butrans en mcg/h) y tabletas/películas sublinguales (Subutex, Suboxone en miligramos).',
      'El método Bernese (microinducción a dosis bajas) permite una transición suave sin necesidad de abstinencia aguda previa, solapando dosis mínimas de buprenorfina con el opioide agonista completo habitual.'
    ]
  },
  MULTIMODAL_NON_OPIOID: {
    titleEn: 'Evidence-Based Multimodal Non-Opioid Analgesic Pathways',
    titleEs: 'Vías Analgésicas Multimodales No Opioides Basadas en Evidencia',
    summaryEn: 'Effective chronic pain care combines non-pharmacologic interventions with non-opioid medications targeting distinct pain mechanisms (neuropathic, musculoskeletal, nociplastic) to maximize functional restoration and minimize central nervous system sedation.',
    summaryEs: 'El tratamiento integral del dolor crónico combina intervenciones no farmacológicas con medicamentos no opioides dirigidos a distintos mecanismos del dolor (neuropático, musculoesquelético, nociplástico) para restablecer la función y minimizar la sedación central.',
    recommendationsEn: [
      'Neuropathic & centralized pain: SNRIs (duloxetine, milnacipran), tricyclics (nortriptyline), and gabapentinoids (gabapentin/pregabalin — exercise vigilance with concurrent sedatives).',
      'Musculoskeletal & inflammatory pain: Topical NSAIDs (diclofenac gel), topical lidocaine 5% patches, targeted physical therapy, and aquatic therapy.',
      'Restorative behavioral therapies: Pain-informed CBT, Acceptance and Commitment Therapy (ACT), and graded motor imagery.'
    ],
    recommendationsEs: [
      'Dolor neuropático y centralizado: ISRSN (duloxetina), tricíclicos (nortriptilina) y gabapentinoides (gabapentina/pregabalina — vigilar el uso conjunto con sedantes).',
      'Dolor musculoesquelético e inflamatorio: AINEs tópicos (gel de diclofenaco), parches de lidocaína al 5%, fisioterapia personalizada y terapia acuática.',
      'Terapias conductuales de restauración: TCC adaptada al dolor crónico, Terapia de Aceptación y Compromiso (ACT) y técnicas de reactivación motora progresiva.'
    ]
  }
};

/**
 * Benzodiazepine deprescribing and sedative safety standards.
 */
export const BENZODIAZEPINE_STANDARDS = {
  ASHTON_TAPER_PROTOCOL: {
    titleEn: 'The Ashton Protocol: Slow Diazepam-Equivalent Tapering',
    titleEs: 'Protocolo Ashton: Reducción Lenta Basada en Equivalentes de Diazepam',
    summaryEn: 'Abrupt cessation of chronic benzodiazepines triggers severe rebound anxiety, autonomic instability, psychosis, and life-threatening grand mal seizures or status epilepticus. The Ashton protocol converts short- or intermediate-acting benzodiazepines to an equivalent dose of long-acting diazepam (which has a smooth elimination half-life of 20–100 hours plus active metabolites) followed by gradual 5% to 10% reductions every 2 to 4 weeks.',
    summaryEs: 'La interrupción repentina de benzodiazepinas crónicas desencadena ansiedad de rebote grave, inestabilidad autonómica, psicosis y convulsiones de gran mal o estado epiléptico potencialmente mortales. El protocolo Ashton convierte las benzodiazepinas de acción corta o intermedia a una dosis equivalente de diazepam de acción prolongada (vida media de 20 a 100 horas con metabolitos activos) seguida de reducciones graduales del 5% al 10% cada 2 a 4 semanas.',
    recommendationsEn: [
      'Never stop chronic benzodiazepines cold turkey; medical supervision is essential to prevent status epilepticus.',
      'Convert to diazepam equivalent in stepwise stages to establish a stable plasma baseline without interdose withdrawal.',
      'Reduce dose by 1 to 2 mg diazepam equivalent every 2 to 4 weeks, holding reductions if withdrawal symptoms escalate.',
      'Flumazenil is strictly contraindicated in chronic benzodiazepine users due to high risk of precipitating lethal refractory seizures.'
    ],
    recommendationsEs: [
      'Nunca suspenda benzodiazepinas de forma abrupta; la supervisión médica es indispensable para prevenir convulsiones fatales.',
      'Convertir a dosis equivalentes de diazepam de forma escalonada para mantener niveles plasmáticos estables sin abstinencia intermitente.',
      'Reducir de 1 a 2 mg de equivalente de diazepam cada 2 a 4 semanas, pausando la disminución si surgen síntomas de abstinencia intensos.',
      'El flumazenil está estrictamente contraindicado en usuarios crónicos debido al riesgo de desencadenar convulsiones refractarias mortales.'
    ]
  },
  CIWA_B_SYMPTOMS: {
    titleEn: 'CIWA-B Clinical Symptom Domains to Monitor',
    titleEs: 'Dominios Clínicos de Monitoreo CIWA-B',
    summaryEn: 'The Clinical Institute Withdrawal Assessment for Benzodiazepines (CIWA-B) tracks 10 cardinal withdrawal manifestations during taper adjustments.',
    summaryEs: 'La Escala de Evaluación del Síndrome de Abstinencia de Benzodiazepinas (CIWA-B) monitorea 10 manifestaciones cardinales de abstinencia durante el ajuste de dosis.',
    recommendationsEn: [
      'Neurological: Tremors, muscle twitches/fasciculations, hyperreflexia, and internal vibrations.',
      'Sensory: Hyperacusis (sensitivity to sounds), photophobia, metallic taste, and cutaneous paresthesias (tingling/burning).',
      'Psychological: Severe anxiety, panic attacks, insomnia, agoraphobia, depersonalization, and derealization.'
    ],
    recommendationsEs: [
      'Neurológicos: Temblores, fasciculaciones musculares, hiperreflexia y sensación de vibración interna.',
      'Sensoriales: Hiperacusia (sensibilidad extrema al ruido), fotofobia, sabor metálico y parestesias cutáneas.',
      'Psicológicos: Ansiedad intensa, ataques de pánico, insomnio, agorafobia, despersonalización y desrealización.'
    ]
  }
};

/**
 * Standard oral benzodiazepine diazepam equivalence ratios.
 * Values reflect standard clinical equivalence (10 mg oral diazepam reference).
 */
export const BENZODIAZEPINE_EQUIVALENTS = Object.freeze({
  alprazolam: { name: 'Alprazolam (Xanax)', ratioToDiazepam: 20.0, refDoseMg: 0.5 },
  clonazepam: { name: 'Clonazepam (Klonopin)', ratioToDiazepam: 20.0, refDoseMg: 0.5 },
  lorazepam: { name: 'Lorazepam (Ativan)', ratioToDiazepam: 10.0, refDoseMg: 1.0 },
  temazepam: { name: 'Temazepam (Restoril)', ratioToDiazepam: 0.5, refDoseMg: 20.0 },
  chlordiazepoxide: { name: 'Chlordiazepoxide (Librium)', ratioToDiazepam: 0.4, refDoseMg: 25.0 },
  oxazepam: { name: 'Oxazepam (Serax)', ratioToDiazepam: 0.5, refDoseMg: 20.0 },
  diazepam: { name: 'Diazepam (Valium)', ratioToDiazepam: 1.0, refDoseMg: 10.0 }
});

/**
 * Calculates approximate daily diazepam equivalent in milligrams.
 *
 * @param {string} drugId Key from BENZODIAZEPINE_EQUIVALENTS.
 * @param {number} dailyDoseMg Total daily dose in milligrams.
 * @returns {number} Diazepam equivalent in mg (rounded to 1 decimal place).
 */
export function calculateDiazepamEquivalent(drugId, dailyDoseMg) {
  const normId = String(drugId || '').toLowerCase().trim();
  const drug = BENZODIAZEPINE_EQUIVALENTS[normId];
  const dose = Number(dailyDoseMg);
  if (!drug || Number.isNaN(dose) || dose <= 0) {
    return 0;
  }
  return Math.round(dose * drug.ratioToDiazepam * 10) / 10;
}

/**
 * Evaluates sedative discontinuation seizure risk and medical urgency.
 *
 * @param {Object} params
 * @param {string} params.currentDrug Benzodiazepine drug ID.
 * @param {number} params.dailyDoseMg Current daily dose in mg.
 * @param {number} params.durationWeeks Duration of regular use in weeks.
 * @param {boolean} [params.isAbrupt=false] Whether use was abruptly stopped or cut off.
 * @returns {Object} Risk evaluation with severity, directives, and protocols.
 */
export function evaluateSedativeDiscontinuationRisk({ currentDrug, dailyDoseMg, durationWeeks, isAbrupt = false } = {}) {
  const diazepamEq = calculateDiazepamEquivalent(currentDrug, dailyDoseMg);
  const weeks = Math.max(0, Number(durationWeeks) || 0);
  const abrupt = Boolean(isAbrupt);

  if (abrupt && (diazepamEq >= 40 || weeks >= 8)) {
    return {
      severity: 'emergency_911',
      titleEn: 'Immediate Emergency: High Risk of Status Epilepticus & Fatal Seizures',
      titleEs: 'Emergencia Inmediata: Alto Riesgo de Estado Epiléptico y Convulsiones Fatales',
      textEn: 'Abruptly stopping high-dose or long-term benzodiazepines carries an acute risk of grand mal seizures, status epilepticus, severe autonomic instability, and death. Go to the nearest emergency department immediately or call 911 under federal EMTALA emergency medical stabilization protections.',
      textEs: 'La interrupción repentina de dosis altas o uso prolongado de benzodiazepinas conlleva un riesgo agudo de convulsiones de gran mal, estado epiléptico, inestabilidad autonómica y muerte. Acuda de inmediato al servicio de urgencias más cercano o llame al 911 bajo la protección federal de estabilización médica de emergencia EMTALA.',
      diazepamEq,
      requiresHospital: true,
      protocol: 'inpatient_medical_detox'
    };
  }

  if (diazepamEq >= 30 || weeks >= 12) {
    return {
      severity: 'high_clinical_monitoring',
      titleEn: 'Supervised Medical Taper Required: Inpatient / Intensive Medical Care',
      titleEs: 'Requiere Reducción Médica Supervisada: Atención Médica Hospitalaria o Intensiva',
      textEn: 'Significant physical neuroadaptation is present. Attempting an unmonitored home taper is hazardous due to the danger of delirium and seizures. Transition to a supervised clinical setting with slow cross-titration to diazepam equivalents.',
      textEs: 'Existe una importante neuroadaptación física. Intentar una reducción en el hogar sin supervisión es peligroso por el riesgo de delirio y convulsiones. Se recomienda la transición a un entorno clínico supervisado con sustitución gradual a equivalentes de diazepam.',
      diazepamEq,
      requiresHospital: false,
      protocol: 'supervised_ashton_taper'
    };
  }

  if (weeks >= 4 || diazepamEq >= 10) {
    return {
      severity: 'moderate_gradual_taper',
      titleEn: 'Outpatient Ashton Gradual Taper Protocol',
      titleEs: 'Protocolo de Reducción Gradual Ambulatoria Ashton',
      textEn: 'Candidate for collaborative outpatient deprescribing over 12 to 24+ weeks with a trusted physician. Plan stepwise 5% to 10% dosage reductions every 2 to 4 weeks using diazepam equivalents, supported by non-pharmacologic coping strategies.',
      textEs: 'Candidato para reducción ambulatoria consensuada durante 12 a 24+ semanas con un médico de confianza. Planificar reducciones escalonadas del 5% al 10% cada 2 a 4 semanas usando equivalentes de diazepam, respaldadas por estrategias no farmacológicas.',
      diazepamEq,
      requiresHospital: false,
      protocol: 'outpatient_gradual_taper'
    };
  }

  return {
    severity: 'low_risk_mild_taper',
    titleEn: 'Short-Duration Mild Taper Pathway',
    titleEs: 'Vía de Reducción Leve para Uso de Corta Duración',
    textEn: 'Short-term use (<4 weeks) generally requires a brief 1- to 2-week tapering schedule to avoid rebound insomnia or transient anxiety, with minimal seizure risk.',
    textEs: 'El uso de corta duración (<4 semanas) generalmente requiere un esquema breve de reducción de 1 a 2 semanas para evitar insomnio de rebote o ansiedad transitoria, con riesgo mínimo de convulsiones.',
    diazepamEq,
    requiresHospital: false,
    protocol: 'brief_taper'
  };
}

/**
 * Generates an individualized stepwise Ashton taper schedule.
 *
 * @param {Object} params
 * @param {number} params.diazepamEquivalentMg Starting diazepam equivalent mg/day.
 * @param {number} [params.targetWeeks=16] Estimated target duration in weeks.
 * @returns {Array<{ stage: number, weekRange: string, dailyDoseMg: number, percentOfOriginal: number, clinicalMilestone: string }>}
 */
export function generateAshtonTaperSchedule({ diazepamEquivalentMg, targetWeeks = 16 } = {}) {
  const startMg = Number(diazepamEquivalentMg);
  if (Number.isNaN(startMg) || startMg <= 0) {
    return [];
  }

  const steps = Math.min(12, Math.max(4, Math.round((targetWeeks || 16) / 2)));
  const schedule = [];
  const decrement = startMg / steps;

  for (let i = 0; i <= steps; i++) {
    const stage = i + 1;
    const startWeek = i * 2 + 1;
    const endWeek = (i + 1) * 2;
    const rawDose = Math.max(0, startMg - (i * decrement));
    const dailyDoseMg = Math.round(rawDose * 10) / 10;
    const percentOfOriginal = Math.round((dailyDoseMg / startMg) * 100);

    let milestone = 'Active reduction phase';
    if (i === 0) milestone = 'Stabilization on baseline diazepam equivalent';
    else if (dailyDoseMg === 0) milestone = 'Completion of taper — post-cessation support';
    else if (percentOfOriginal <= 25) milestone = 'Micro-taper phase (slowest reductions)';
    else if (percentOfOriginal <= 50) milestone = 'Halfway milestone — review CIWA-B symptoms';

    schedule.push({
      stage,
      weekRange: `Weeks ${startWeek}–${endWeek}`,
      dailyDoseMg,
      percentOfOriginal,
      clinicalMilestone: milestone
    });

    if (dailyDoseMg === 0) break;
  }

  return schedule;
}

/**
 * Evaluates chronic pain care pathways and opioid management options.
 *
 * @param {Object} params
 * @param {boolean} params.hasPain Whether visitor experiences chronic pain.
 * @param {string} [params.painType] 'neuropathic' | 'musculoskeletal' | 'centralized' | 'mixed'.
 * @param {string} [params.currentOpioid] Current prescribed or used opioid.
 * @param {number} [params.dailyMME=0] Daily Morphine Milligram Equivalents.
 * @param {boolean} [params.hasConcurrentSUD=false] Whether concurrent substance use disorder is present.
 * @param {boolean} [params.hasBenzodiazepine=false] Whether concurrent benzodiazepines are taken.
 * @returns {Object} Tailored clinical recommendations and patient advocacy directives.
 */
export function evaluatePainCarePathway({
  hasPain = true,
  painType = 'mixed',
  currentOpioid = '',
  dailyMME = 0,
  hasConcurrentSUD = false,
  hasBenzodiazepine = false
} = {}) {
  const mme = Math.max(0, Number(dailyMME) || 0);
  const concurrentSUD = Boolean(hasConcurrentSUD);
  const concurrentBenzo = Boolean(hasBenzodiazepine);

  const findings = [];
  const actionItems = [];

  // FDA Black Box Warning: Opioid + Benzodiazepine Concurrent Use
  if (concurrentBenzo) {
    findings.push({
      type: 'fda_black_box_warning',
      titleEn: 'FDA Boxed Warning: Concurrent Opioid + Benzodiazepine Sedation',
      titleEs: 'Advertencia de Recuadro Negro de la FDA: Uso Concomitante de Opioides y Benzodiazepinas',
      textEn: 'Taking opioids and benzodiazepines together causes profound additive respiratory depression, coma, and death. Prescribers should co-prescribe take-home naloxone and carefully coordinate gradual deprescribing rather than abruptly cutting off either medication.',
      textEs: 'Tomar opioides y benzodiazepinas conjuntamente provoca depresión respiratoria aditiva profunda, coma y muerte. Los profesionales deben recetar naloxona para el hogar y coordinar una reducción gradual y cuidadosa en lugar de suspender bruscamente cualquiera de los dos fármacos.'
    });
    actionItems.push('Ensure multiple naloxone nasal sprays are always on hand and known to household members.');
    actionItems.push('Ask prescribers to review the Ashton manual for coordinated sedative deprescribing.');
  }

  // High MME Caution (>90 MME)
  if (mme >= 90) {
    findings.push({
      type: 'high_mme_taper_protection',
      titleEn: 'High MME (>=90 MME/day): Anti-Abrupt Taper Protection',
      titleEs: 'MME Elevado (>=90 MME/día): Protección Contra la Reducción Forzada',
      textEn: 'CDC 2022 guidelines affirm that high doses should not be precipitously reduced. Forced tapers carry extreme risks of patient crisis. Any dose modification must proceed at 5%–10% per month with patient consent and active multimodal pain management.',
      textEs: 'Las guías de los CDC de 2022 ratifican que las dosis altas no deben reducirse precipitadamente. Las reducciones forzadas conllevan riesgos extremos para el paciente. Cualquier modificación debe progresar al 5%–10% mensual con consentimiento del paciente y tratamiento multimodal activo.'
    });
    actionItems.push('Invoke CDC 2022 Guideline recommendation against rapid forced tapers during clinical visits.');
  }

  // Concurrent Chronic Pain & Substance Use Disorder
  if (concurrentSUD) {
    findings.push({
      type: 'buprenorphine_dual_benefit',
      titleEn: 'Buprenorphine: The Gold Standard for Concurrent Pain & Opioid Disorder',
      titleEs: 'Buprenorfina: Estándar de Oro para Dolor Concurrente y Trastorno por Opioides',
      textEn: 'Buprenorphine treats both chronic pain and opioid use disorder with a high safety profile. Because analgesic duration is 6–8 hours, prescribers should split the daily dose (TID or QID). Bernese micro-dosing allows starting buprenorphine without going through severe opioid withdrawal.',
      textEs: 'La buprenorfina trata simultáneamente el dolor crónico y el trastorno por consumo de opioides con un elevado perfil de seguridad. Como su duración analgésica es de 6 a 8 horas, los médicos deben dividir la dosis diaria (3 o 4 tomas al día). La microinducción Bernese permite iniciar la buprenorfina sin experimentar abstinencia aguda severa.'
    });
    actionItems.push('Discuss split-dose (TID/QID) buprenorphine therapy with an addiction medicine specialist.');
    actionItems.push('Explore Bernese micro-induction to transition from full agonists smoothly.');
  } else {
    // Non-SUD chronic pain management
    findings.push({
      type: 'multimodal_analgesia_optimization',
      titleEn: 'Multimodal Analgesia & Non-Opioid Synergy',
      titleEs: 'Analgesia Multimodal y Sinergia No Opioide',
      textEn: 'Target non-opioid medications matching specific pain physiology: SNRIs (duloxetine) for neuropathic/centralized pain, topical lidocaine/NSAIDs for localized pain, and restorative physical therapy to support functional independence.',
      textEs: 'Dirigir fármacos no opioides según la fisiología del dolor: ISRSN (duloxetina) para dolor neuropático/centralizado, lidocaína tópica o AINEs para dolor localizado y rehabilitación física activa para restaurar la autonomía funcional.'
    });
  }

  return {
    painType,
    mme,
    hasConcurrentSUD: concurrentSUD,
    hasBenzodiazepine: concurrentBenzo,
    findings,
    actionItems
  };
}

/**
 * Format complete bilingual summary report of pain and sedative evaluation.
 *
 * @param {Object} state In-RAM state object.
 * @param {string} [lang='en'] 'en' | 'es'.
 * @returns {string} Plain-text summary for printing or clinical consultation.
 */
export function formatPainSummaryText(state = {}, lang = 'en') {
  const isEs = lang === 'es';
  const sedative = evaluateSedativeDiscontinuationRisk({
    currentDrug: state.currentSedative,
    dailyDoseMg: state.sedativeDoseMg,
    durationWeeks: state.sedativeDurationWeeks,
    isAbrupt: state.sedativeIsAbrupt
  });

  const pain = evaluatePainCarePathway({
    hasPain: state.hasPain !== false,
    painType: state.painType,
    currentOpioid: state.currentOpioid,
    dailyMME: state.dailyMME,
    hasConcurrentSUD: state.hasConcurrentSUD,
    hasBenzodiazepine: Boolean(state.currentSedative)
  });

  const lines = [
    '================================================================',
    isEs
      ? 'HARBORPATH: CONSULTA DE DOLOR CRÓNICO Y REDUCCIÓN DE SEDANTES'
      : 'HARBORPATH: CHRONIC PAIN & SEDATIVE DEPRESCRIBING CONSULTATION',
    '================================================================',
    isEs
      ? 'Privado, confidencial, 100% en memoria. Sin datos personales almacenados.'
      : 'Private, confidential, 100% in-RAM. No personal health information stored.',
    '',
    isEs ? '1. EVALUACIÓN DE RIESGO DE SEDANTES / BENZODIAZEPINAS:' : '1. SEDATIVE & BENZODIAZEPINE RISK ASSESSMENT:',
    `   ${isEs ? 'Fármaco actual' : 'Current drug'}: ${state.currentSedative || (isEs ? 'Ninguno reportado' : 'None reported')}`,
    `   ${isEs ? 'Dosis diaria' : 'Daily dose'}: ${state.sedativeDoseMg ? `${state.sedativeDoseMg} mg` : 'N/A'}`,
    `   ${isEs ? 'Equivalente diazepam' : 'Diazepam equivalent'}: ~${sedative.diazepamEq} mg/day`,
    `   ${isEs ? 'Duración de uso' : 'Duration of use'}: ${state.sedativeDurationWeeks || 0} ${isEs ? 'semanas' : 'weeks'}`,
    `   ${isEs ? 'Interrupción abrupta' : 'Abrupt discontinuation'}: ${state.sedativeIsAbrupt ? (isEs ? 'SÍ (URGENTE)' : 'YES (URGENT)') : (isEs ? 'No' : 'No')}`,
    `   ${isEs ? 'Nivel de riesgo' : 'Risk level'}: ${isEs ? sedative.titleEs : sedative.titleEn}`,
    `   ${isEs ? 'Recomendación' : 'Guidance'}: ${isEs ? sedative.textEs : sedative.textEn}`,
    '',
    isEs ? '2. EVALUACIÓN DE DOLOR CRÓNICO Y OPIOIDES:' : '2. CHRONIC PAIN & OPIOID EVALUATION:',
    `   ${isEs ? 'Tipo de dolor' : 'Pain type'}: ${state.painType || 'mixed'}`,
    `   ${isEs ? 'Opioide actual' : 'Current opioid'}: ${state.currentOpioid || (isEs ? 'Ninguno' : 'None')}`,
    `   ${isEs ? 'MME diario estimado' : 'Estimated daily MME'}: ${state.dailyMME || 0} MME/day`,
    `   ${isEs ? 'Trastorno por uso de sustancias concurrente' : 'Concurrent substance use disorder'}: ${state.hasConcurrentSUD ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`,
    '',
    isEs ? '3. DIRECTRICES CLÍNICAS Y ACCIONES RECOMENDADAS:' : '3. CLINICAL DIRECTIVES & ACTION STEPS:'
  ];

  for (const item of pain.findings) {
    lines.push(`   * [${isEs ? item.titleEs : item.titleEn}]`);
    lines.push(`     ${isEs ? item.textEs : item.textEn}`);
  }

  for (const act of pain.actionItems) {
    lines.push(`   - ${act}`);
  }

  lines.push('');
  lines.push('----------------------------------------------------------------');
  lines.push(
    isEs
      ? 'Aviso legal: Esta guía es educativa y no constituye asesoramiento médico ni prescripción.'
      : 'Disclaimer: This tool is educational and does not constitute medical advice or a prescription.'
  );
  lines.push('================================================================');

  return lines.join('\n');
}

// In-RAM Ephemeral State Management (Deterministic Reset for Quick Exit)
const defaultState = () => ({
  currentSedative: '',
  sedativeDoseMg: '',
  sedativeDurationWeeks: '',
  sedativeIsAbrupt: false,
  hasPain: true,
  painType: 'mixed',
  currentOpioid: '',
  dailyMME: '',
  hasConcurrentSUD: false,
  activeTab: 'pain'
});

let inMemoryState = defaultState();

export function getPainState() {
  return { ...inMemoryState };
}

export function setPainState(partial = {}) {
  inMemoryState = { ...inMemoryState, ...partial };
  return getPainState();
}

export function resetPainState() {
  inMemoryState = defaultState();
  return getPainState();
}

/**
 * Renders the accessible WCAG 2.2 AA compliant Chronic Pain & Sedative Taper View.
 *
 * @returns {HTMLElement}
 */
export function chronicPainView() {
  const container = h('div', { class: 'view chronic-pain-view' });

  // Header
  const header = h('header', { class: 'view-header' },
    h('h1', null, t('pain.title', 'Chronic Pain, Buprenorphine Analgesia & Sedative Deprescribing')),
    h('p', { class: 'lead' }, t('pain.lead', 'Evidence-based guidance on pain management, buprenorphine split-dosing, and safe Ashton benzodiazepine tapering. Zero tracking, zero storage.'))
  );
  container.append(header);

  // Tab Navigation
  const tabList = h('div', { class: 'tab-nav', role: 'tablist', 'aria-label': 'Pain and Sedative Sections' });
  const tabPainBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'pain' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-pain-btn',
    'aria-selected': String(inMemoryState.activeTab === 'pain'),
    'aria-controls': 'tab-pain-panel'
  }, t('pain.tab.pain', 'Pain & Buprenorphine'));

  const tabSedativeBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'sedative' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-sedative-btn',
    'aria-selected': String(inMemoryState.activeTab === 'sedative'),
    'aria-controls': 'tab-sedative-panel'
  }, t('pain.tab.sedative', 'Benzodiazepine Taper Calculator'));

  const tabMultimodalBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'multimodal' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-multimodal-btn',
    'aria-selected': String(inMemoryState.activeTab === 'multimodal'),
    'aria-controls': 'tab-multimodal-panel'
  }, t('pain.tab.multimodal', 'Non-Opioid Multimodal Care'));

  tabList.append(tabPainBtn, tabSedativeBtn, tabMultimodalBtn);
  container.append(tabList);

  // Panels Container
  const panelsContainer = h('div', { class: 'tab-panels' });

  // ---------------- Tab 1: Pain & Buprenorphine ----------------
  const panelPain = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'pain' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-pain-panel',
    'aria-labelledby': 'tab-pain-btn',
    hidden: inMemoryState.activeTab !== 'pain'
  });

  const painIntroCard = h('article', { class: 'card' },
    h('h2', null, CHRONIC_PAIN_STANDARDS.BUPRENORPHINE_ANALGESIA.titleEn),
    h('p', null, CHRONIC_PAIN_STANDARDS.BUPRENORPHINE_ANALGESIA.summaryEn),
    h('ul', { class: 'guideline-list' },
      ...CHRONIC_PAIN_STANDARDS.BUPRENORPHINE_ANALGESIA.recommendationsEn.map((r) => h('li', null, r))
    )
  );

  const painForm = h('div', { class: 'card interactive-calc' },
    h('h3', null, 'Pain & Opioid Assessment'),
    h('div', { class: 'form-group' },
      h('label', { for: 'pain-type-select' }, 'Type of chronic pain:'),
      h('select', { id: 'pain-type-select', class: 'select' },
        h('option', { value: 'mixed' }, 'Mixed / Unclear pain pattern'),
        h('option', { value: 'neuropathic' }, 'Neuropathic (burning, tingling, radiating)'),
        h('option', { value: 'musculoskeletal' }, 'Musculoskeletal / Joint (osteoarthritis, back pain)'),
        h('option', { value: 'centralized' }, 'Centralized / Nociplastic (fibromyalgia, widespread)')
      )
    ),
    h('div', { class: 'form-group' },
      h('label', { for: 'opioid-input' }, 'Current opioid medication (optional):'),
      h('input', {
        type: 'text',
        id: 'opioid-input',
        class: 'input',
        placeholder: 'e.g., Oxycodone, Buprenorphine, Methadone',
        value: inMemoryState.currentOpioid
      })
    ),
    h('div', { class: 'form-group' },
      h('label', { for: 'mme-input' }, 'Estimated daily MME (if known):'),
      h('input', {
        type: 'number',
        id: 'mme-input',
        class: 'input',
        min: '0',
        max: '1000',
        placeholder: 'e.g., 60',
        value: inMemoryState.dailyMME
      })
    ),
    h('div', { class: 'form-group checkbox-group' },
      h('label', null,
        h('input', {
          type: 'checkbox',
          id: 'sud-check',
          checked: inMemoryState.hasConcurrentSUD
        }),
        ' Concurrent opioid use disorder or concern about dependence/misuse'
      )
    )
  );

  const painResults = h('div', { class: 'pain-results-region', 'aria-live': 'polite' });

  function updatePainResults() {
    const pathway = evaluatePainCarePathway({
      hasPain: true,
      painType: inMemoryState.painType,
      currentOpioid: inMemoryState.currentOpioid,
      dailyMME: inMemoryState.dailyMME,
      hasConcurrentSUD: inMemoryState.hasConcurrentSUD,
      hasBenzodiazepine: Boolean(inMemoryState.currentSedative)
    });

    painResults.replaceChildren();
    for (const finding of pathway.findings) {
      painResults.append(
        h('div', { class: 'alert-callout info' },
          h('h4', null, finding.titleEn),
          h('p', null, finding.textEn)
        )
      );
    }
  }

  updatePainResults();
  panelPain.append(painIntroCard, painForm, painResults);

  // ---------------- Tab 2: Benzodiazepine Ashton Taper Calculator ----------------
  const panelSedative = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'sedative' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-sedative-panel',
    'aria-labelledby': 'tab-sedative-btn',
    hidden: inMemoryState.activeTab !== 'sedative'
  });

  const dedicatedLinkBanner = h('div', { class: 'card banner-tip' },
    h('p', null,
      h('strong', null, 'Looking for full multi-stage crossover schedules, BIND symptom validation, or Z-drug deprescribing? '),
      h('a', { href: '#/benzodiazepine-care' }, 'Open the dedicated Benzodiazepine & Ashton Taper Navigator →')
    )
  );

  const gabapentinoidLinkBanner = h('div', { class: 'card banner-tip mt-2' },
    h('p', null,
      h('strong', null, 'Taking Gabapentin or Lyrica for neuropathic pain or reducing concurrent opioids? '),
      h('a', { href: '#/gabapentinoid-care' }, 'Open the dedicated Gabapentinoid Safety & Hyperbolic Deprescribing Navigator →')
    )
  );

  const ketamineLinkBanner = h('div', { class: 'card banner-tip mt-2' },
    h('p', null,
      h('strong', null, 'Using therapeutic ketamine infusions or troches for chronic refractory pain? '),
      h('a', { href: '#/ketamine-care' }, 'Review the Ketamine Harm Reduction, Bladder Protection & Uropathy Navigator →')
    )
  );

  const orthopedicLinkBanner = h('div', { class: 'card banner-tip mt-2' },
    h('p', null,
      h('strong', null, 'Experiencing new midline back pain, swollen joints, groin pain, or managing long-term opioid bone density (OPIAD)? '),
      h('a', { href: '#/orthopedic-care' }, 'Open the Spine, Septic Arthritis, Osteonecrosis & OVIVA Bone/Joint Navigator →')
    )
  );


  const sedativeIntroCard = h('article', { class: 'card' },
    h('h2', null, BENZODIAZEPINE_STANDARDS.ASHTON_TAPER_PROTOCOL.titleEn),
    h('p', null, BENZODIAZEPINE_STANDARDS.ASHTON_TAPER_PROTOCOL.summaryEn),
    h('ul', { class: 'guideline-list' },
      ...BENZODIAZEPINE_STANDARDS.ASHTON_TAPER_PROTOCOL.recommendationsEn.map((r) => h('li', null, r))
    )
  );

  const sedativeCalcForm = h('div', { class: 'card interactive-calc' },
    h('h3', null, 'Diazepam Equivalence & Seizure Risk Calculator'),
    h('div', { class: 'form-group' },
      h('label', { for: 'sedative-select' }, 'Select Benzodiazepine:'),
      h('select', { id: 'sedative-select', class: 'select' },
        h('option', { value: '' }, '-- Select Medication --'),
        ...Object.entries(BENZODIAZEPINE_EQUIVALENTS).map(([key, val]) =>
          h('option', { value: key }, val.name)
        )
      )
    ),
    h('div', { class: 'form-group' },
      h('label', { for: 'sedative-dose-input' }, 'Total daily dose (mg):'),
      h('input', {
        type: 'number',
        id: 'sedative-dose-input',
        class: 'input',
        min: '0.1',
        step: '0.1',
        placeholder: 'e.g., 2',
        value: inMemoryState.sedativeDoseMg
      })
    ),
    h('div', { class: 'form-group' },
      h('label', { for: 'sedative-duration-input' }, 'Duration of regular use (weeks):'),
      h('input', {
        type: 'number',
        id: 'sedative-duration-input',
        class: 'input',
        min: '1',
        placeholder: 'e.g., 24',
        value: inMemoryState.sedativeDurationWeeks
      })
    ),
    h('div', { class: 'form-group checkbox-group' },
      h('label', null,
        h('input', {
          type: 'checkbox',
          id: 'sedative-abrupt-check',
          checked: inMemoryState.sedativeIsAbrupt
        }),
        ' Medication was abruptly stopped or cut off without tapering (Urgent Seizure Check)'
      )
    )
  );

  const sedativeResults = h('div', { class: 'sedative-results-region', 'aria-live': 'polite' });

  function updateSedativeResults() {
    const risk = evaluateSedativeDiscontinuationRisk({
      currentDrug: inMemoryState.currentSedative,
      dailyDoseMg: inMemoryState.sedativeDoseMg,
      durationWeeks: inMemoryState.sedativeDurationWeeks,
      isAbrupt: inMemoryState.sedativeIsAbrupt
    });

    sedativeResults.replaceChildren();

    const isEmergency = risk.severity === 'emergency_911';
    sedativeResults.append(
      h('div', { class: `alert-callout ${isEmergency ? 'danger' : 'info'}` },
        h('h4', null, risk.titleEn),
        h('p', null, risk.textEn),
        risk.diazepamEq > 0
          ? h('p', { class: 'badge' }, `Calculated Diazepam Equivalent: ~${risk.diazepamEq} mg/day`)
          : null
      )
    );

    if (risk.diazepamEq > 0 && !isEmergency) {
      const schedule = generateAshtonTaperSchedule({ diazepamEquivalentMg: risk.diazepamEq });
      const tableWrapper = h('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': 'Ashton Taper Schedule Table' },
        h('table', { class: 'data-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Stage'),
              h('th', null, 'Timeframe'),
              h('th', null, 'Daily Diazepam Eq (mg)'),
              h('th', null, '% Baseline'),
              h('th', null, 'Clinical Milestone')
            )
          ),
          h('tbody', null,
            ...schedule.map((row) =>
              h('tr', null,
                h('td', null, String(row.stage)),
                h('td', null, row.weekRange),
                h('td', null, `${row.dailyDoseMg} mg`),
                h('td', null, `${row.percentOfOriginal}%`),
                h('td', null, row.clinicalMilestone)
              )
            )
          )
        )
      );

      sedativeResults.append(
        h('h4', null, 'Illustrative 16-Week Ashton Taper Schedule'),
        tableWrapper
      );
    }
  }

  updateSedativeResults();
  panelSedative.append(dedicatedLinkBanner, gabapentinoidLinkBanner, ketamineLinkBanner, sedativeIntroCard, sedativeCalcForm, sedativeResults);

  // ---------------- Tab 3: Non-Opioid Multimodal Care ----------------
  const panelMultimodal = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'multimodal' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-multimodal-panel',
    'aria-labelledby': 'tab-multimodal-btn',
    hidden: inMemoryState.activeTab !== 'multimodal'
  });

  const multimodalCard = h('article', { class: 'card' },
    h('h2', null, CHRONIC_PAIN_STANDARDS.MULTIMODAL_NON_OPIOID.titleEn),
    h('p', null, CHRONIC_PAIN_STANDARDS.MULTIMODAL_NON_OPIOID.summaryEn),
    h('ul', { class: 'guideline-list' },
      ...CHRONIC_PAIN_STANDARDS.MULTIMODAL_NON_OPIOID.recommendationsEn.map((r) => h('li', null, r))
    )
  );

  const cdcGuidelineCard = h('article', { class: 'card' },
    h('h2', null, CHRONIC_PAIN_STANDARDS.CDC_2022_GUIDELINE.titleEn),
    h('p', null, CHRONIC_PAIN_STANDARDS.CDC_2022_GUIDELINE.summaryEn),
    h('ul', { class: 'guideline-list' },
      ...CHRONIC_PAIN_STANDARDS.CDC_2022_GUIDELINE.recommendationsEn.map((r) => h('li', null, r))
    )
  );

  panelMultimodal.append(multimodalCard, cdcGuidelineCard, orthopedicLinkBanner);

  panelsContainer.append(panelPain, panelSedative, panelMultimodal);
  container.append(panelsContainer);

  // Summary and Export Actions
  const actionsCard = h('div', { class: 'card action-bar' },
    h('h3', null, 'Consultation Summary & Clinical Discussion'),
    h('p', null, 'Generate an anonymous text summary of your inputs and recommendations to share with your physician or pharmacist.'),
    h('div', { class: 'btn-group' },
      h('button', {
        type: 'button',
        class: 'btn btn-primary',
        id: 'btn-copy-pain-summary'
      }, 'Copy Plain-Text Summary'),
      h('button', {
        type: 'button',
        class: 'btn btn-secondary',
        id: 'btn-reset-pain'
      }, 'Reset In-Memory Data')
    ),
    h('span', { id: 'pain-copy-status', class: 'sr-only', role: 'status', 'aria-live': 'polite' })
  );

  container.append(actionsCard);

  // Tab Switcher Handler
  function switchTab(newTab) {
    inMemoryState.activeTab = newTab;
    tabPainBtn.classList.toggle('active', newTab === 'pain');
    tabPainBtn.setAttribute('aria-selected', String(newTab === 'pain'));
    panelPain.hidden = newTab !== 'pain';
    panelPain.classList.toggle('active', newTab === 'pain');

    tabSedativeBtn.classList.toggle('active', newTab === 'sedative');
    tabSedativeBtn.setAttribute('aria-selected', String(newTab === 'sedative'));
    panelSedative.hidden = newTab !== 'sedative';
    panelSedative.classList.toggle('active', newTab === 'sedative');

    tabMultimodalBtn.classList.toggle('active', newTab === 'multimodal');
    tabMultimodalBtn.setAttribute('aria-selected', String(newTab === 'multimodal'));
    panelMultimodal.hidden = newTab !== 'multimodal';
    panelMultimodal.classList.toggle('active', newTab === 'multimodal');
  }

  tabPainBtn.addEventListener('click', () => switchTab('pain'));
  tabSedativeBtn.addEventListener('click', () => switchTab('sedative'));
  tabMultimodalBtn.addEventListener('click', () => switchTab('multimodal'));

  // Form Change Listeners
  panelPain.querySelector('#pain-type-select').addEventListener('change', (e) => {
    inMemoryState.painType = e.target.value;
    updatePainResults();
  });

  panelPain.querySelector('#opioid-input').addEventListener('input', (e) => {
    inMemoryState.currentOpioid = e.target.value;
    updatePainResults();
  });

  panelPain.querySelector('#mme-input').addEventListener('input', (e) => {
    inMemoryState.dailyMME = e.target.value;
    updatePainResults();
  });

  panelPain.querySelector('#sud-check').addEventListener('change', (e) => {
    inMemoryState.hasConcurrentSUD = e.target.checked;
    updatePainResults();
  });

  panelSedative.querySelector('#sedative-select').addEventListener('change', (e) => {
    inMemoryState.currentSedative = e.target.value;
    updateSedativeResults();
  });

  panelSedative.querySelector('#sedative-dose-input').addEventListener('input', (e) => {
    inMemoryState.sedativeDoseMg = e.target.value;
    updateSedativeResults();
  });

  panelSedative.querySelector('#sedative-duration-input').addEventListener('input', (e) => {
    inMemoryState.sedativeDurationWeeks = e.target.value;
    updateSedativeResults();
  });

  panelSedative.querySelector('#sedative-abrupt-check').addEventListener('change', (e) => {
    inMemoryState.sedativeIsAbrupt = e.target.checked;
    updateSedativeResults();
  });

  // Action Buttons
  const copyBtn = actionsCard.querySelector('#btn-copy-pain-summary');
  const copyStatus = actionsCard.querySelector('#pain-copy-status');
  copyBtn.addEventListener('click', async () => {
    const summaryText = formatPainSummaryText(inMemoryState, 'en');
    try {
      await navigator.clipboard.writeText(summaryText);
      copyStatus.textContent = 'Summary copied to clipboard.';
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy Plain-Text Summary'; }, 2000);
    } catch {
      copyStatus.textContent = 'Unable to access clipboard.';
    }
  });

  const resetBtn = actionsCard.querySelector('#btn-reset-pain');
  resetBtn.addEventListener('click', () => {
    resetPainState();
    panelPain.querySelector('#pain-type-select').value = 'mixed';
    panelPain.querySelector('#opioid-input').value = '';
    panelPain.querySelector('#mme-input').value = '';
    panelPain.querySelector('#sud-check').checked = false;
    panelSedative.querySelector('#sedative-select').value = '';
    panelSedative.querySelector('#sedative-dose-input').value = '';
    panelSedative.querySelector('#sedative-duration-input').value = '';
    panelSedative.querySelector('#sedative-abrupt-check').checked = false;
    updatePainResults();
    updateSedativeResults();
  });

  return container;
}
