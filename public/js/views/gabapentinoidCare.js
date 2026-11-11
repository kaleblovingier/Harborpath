// public/js/views/gabapentinoidCare.js
// HarborPath - Gabapentinoid Misuse, Respiratory Depression Synergy, Neuropathic Pain & Structured Deprescribing Navigator
// Clinical consensus: FDA Drug Safety Communication (Dec 2019) on Gabapentinoid Serious Breathing Difficulties with Opioids/CNS Depressants,
// Horowitz & Taylor Hyperbolic Deprescribing Framework (Lancet Psychiatry / BMJ),
// CDC Clinical Practice Guideline for Prescribing Opioids & Co-Prescribed Gabapentinoids,
// Cockcroft-Gault Renal Creatinine Clearance (CrCl) Dosing & Neurotoxicity Thresholds,
// ASAM & ACMT Management of Gabapentinoid Withdrawal Syndrome (GWS).
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon, copyText } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: COMPARATIVE PHARMACOLOGY & PHARMACOKINETICS
// ============================================================================

export const GABAPENTINOID_COMPARATIVE_DATA = Object.freeze({
  gabapentin: Object.freeze({
    id: 'gabapentin',
    genericName: 'Gabapentin (Neurontin, Gralise, Horizant)',
    mechanismEn: 'Binds with high affinity to alpha-2-delta-1 and alpha-2-delta-2 auxiliary subunits of voltage-gated calcium channels (VGCC), inhibiting calcium influx and decreasing release of excitatory neurotransmitters (glutamate, substance P, calcitonin gene-related peptide).',
    mechanismEs: 'Se une con alta afinidad a las subunidades auxiliares alfa-2-delta-1 y alfa-2-delta-2 de los canales de calcio dependientes de voltaje, disminuyendo la liberación de neurotransmisores excitadores (glutamato, sustancia P).',
    absorptionEn: 'NON-LINEAR & SATURABLE: Absorbed exclusively via the L-amino acid transporter-1 (LAT1) in the proximal small intestine. Bioavailability decreases sharply as dose increases: ~60% at 300 mg, ~47% at 600 mg, ~34% at 1,200 mg, and < 27% at 4,800 mg/day.',
    absorptionEs: 'NO LINEAL Y SATURABLE: Se absorbe exclusivamente por el transportador de L-aminoácidos tipo 1 (LAT1) en intestino delgado. La biodisponibilidad cae al subir la dosis: ~60% a 300 mg, ~47% a 600 mg, ~34% a 1,200 mg y < 27% a 4,800 mg/día.',
    potencyRatio: 'Reference (1x)',
    halfLifeEn: '5 to 7 hours in patients with normal renal function (CrCl > 60 mL/min). Eliminates 100% unchanged via kidneys.',
    halfLifeEs: '5 a 7 horas con función renal normal. Se elimina al 100% inalterado por excreción renal.',
    standardDoseRangeEn: '900 to 3,600 mg/day divided TID (three times daily) due to short half-life.',
    standardDoseRangeEs: '900 a 3,600 mg/día repartidos en 3 tomas al día debido a su semivida corta.',
    liquidFormulationEn: 'Oral solution available: 250 mg / 5 mL (50 mg/mL) — vital for micro-tapering below 300 mg.',
    liquidFormulationEs: 'Solución oral disponible: 250 mg / 5 mL (50 mg/mL) — clave para micro-reducciones bajo 300 mg.',
  }),
  pregabalin: Object.freeze({
    id: 'pregabalin',
    genericName: 'Pregabalin (Lyrica, Lyrica CR)',
    mechanismEn: 'Similar binding to alpha-2-delta subunits with approximately 6-fold higher binding affinity than gabapentin. Potently inhibits presynaptic calcium influx in hyper-excited neurons.',
    mechanismEs: 'Unión similar a subunidades alfa-2-delta con una afinidad aproximadamente 6 veces superior a la gabapentina. Inhibe potentemente la entrada presináptica de calcio.',
    absorptionEn: 'LINEAR & RAPID: Absorbed throughout the small intestine and colon without transporter saturation. Bioavailability is >= 90% and strictly dose-proportional across entire therapeutic range.',
    absorptionEs: 'LINEAL Y RÁPIDA: Se absorbe en todo el intestino sin saturación de transportadores. Biodisponibilidad >= 90% proporcional a la dosis en todo el rango terapéutico.',
    potencyRatio: 'Approximately 6x more potent by weight (50 mg Pregabalin ~ 300 mg Gabapentin)',
    halfLifeEn: '6 to 8 hours. 100% renal elimination unchanged. Higher peak concentrations and rapid onset increase subjective euphoric reinforcement.',
    halfLifeEs: '6 a 8 horas. Eliminación 100% renal inalterada. Su rápida absorción y mayor pico plasmático aumentan el refuerzo euforizante.',
    standardDoseRangeEn: '150 to 600 mg/day divided BID or TID (two to three times daily).',
    standardDoseRangeEs: '150 a 600 mg/día repartidos en 2 o 3 tomas al día.',
    liquidFormulationEn: 'Oral solution available: 20 mg / mL — essential for hyperbolic tapering under 50 mg.',
    liquidFormulationEs: 'Solución oral disponible: 20 mg / mL — esencial para descensos hiperbólicos bajo 50 mg.',
  }),
});

// ============================================================================
// FDA 2019 BLACK-BOX & OVERDOSE SYNERGY RISKS
// ============================================================================

export const GABAPENTINOID_OVERDOSE_SYNERGY = Object.freeze({
  fdaAlertTitleEn: 'FDA Drug Safety Communication: Serious Breathing Difficulties with Gabapentinoids',
  fdaAlertTitleEs: 'Alerta de Seguridad FDA: Dificultades Respiratorias Graves con Gabapentinoides',
  clinicalMechanismEn: 'Opioids blunt hypoxic ventilatory drive via brainstem mu-receptors. Gabapentinoids independently suppress hypercapnic ventilatory compensation and upper airway muscle tone. When co-ingested, the combination causes catastrophic synergistic respiratory arrest at opioid doses that would otherwise be tolerated.',
  clinicalMechanismEs: 'Los opioides deprimen el estímulo ventilatorio hipóxico. Los gabapentinoides suprimen de forma independiente la compensación ventilatoria hipercapnica y el tono faríngeo. Juntos causan paro respiratorio sinérgico catastrófico con dosis de opioides habitualmente toleradas.',
  fatalityStatsEn: 'CDC and observational cohort data show gabapentinoids are co-detected in 20% to 30% of all fatal opioid overdoses. Co-prescription increases overdose mortality risk by 49% to 60% compared to opioids alone (Gomes et al., PLoS Med 2017).',
  fatalityStatsEs: 'Datos de los CDC demuestran que los gabapentinoides están presentes en el 20% a 30% de las muertes por sobredosis de opioides. La prescripción conjunta incrementa el riesgo de muerte en un 49% a 60% frente a opioides solos.',
  highRiskCohortsEn: Object.freeze([
    'Patients taking ANY opioid (methadone, buprenorphine, oxycodone, fentanyl, morphine).',
    'Patients with Chronic Obstructive Pulmonary Disease (COPD), asthma, or pulmonary fibrosis.',
    'Patients with Obstructive Sleep Apnea (OSA) or nocturnal hypoventilation.',
    'Older adults (age >= 65) with reduced renal clearance and increased central nervous system sensitivity.',
    'Patients co-ingesting sedatives: Benzodiazepines, alcohol, Z-drugs, sedating antihistamines, or muscle relaxants.',
  ]),
  highRiskCohortsEs: Object.freeze([
    'Pacientes en tratamiento con CUALQUIER opioide (metadona, buprenorfina, oxicodona, fentanilo).',
    'Pacientes con Enfermedad Pulmonar Obstructiva Crónica (EPOC), asma o fibrosis pulmonar.',
    'Pacientes con Apnea Obstructiva del Sueño (AOS) o hipoventilación nocturna.',
    'Adultos mayores (>= 65 años) con menor aclaramiento renal y mayor sensibilidad central.',
    'Pacientes que consumen sedantes: Benzodiacepinas, alcohol, hipnóticos Z o relajantes musculares.',
  ]),
});

// ============================================================================
// GABAPENTINOID WITHDRAWAL SYNDROME (GWS) CLUSTERS
// ============================================================================

export const GWS_SYMPTOM_CLUSTERS = Object.freeze([
  {
    clusterId: 'autonomic',
    nameEn: 'Autonomic Dysregulation Storm',
    nameEs: 'Tormenta de Desregulación Autonómica',
    symptomsEn: 'Profuse diaphoresis, flushing, tachycardia (> 100 bpm), elevated systolic/diastolic BP, fever or chills, severe nausea, vomiting, loose stools.',
    symptomsEs: 'Diaforesis profusa, rubor, taquicardia (> 100 lpm), hipertensión arterial, fiebre o escalofríos, náuseas severas, vómitos, diarrea.',
  },
  {
    clusterId: 'neurological',
    nameEn: 'Neurological & Sensory Hyper-Excitability',
    nameEs: 'Hiperexcitabilidad Neurológica y Sensitiva',
    symptomsEn: 'Intense tactile paresthesias ("crawling skin", burning sensations), severe akathisia (motor restlessness, inability to sit still), intention tremors, myoclonic jerks, photophobia, hyperacusis, and SEIZURE RISK / STATUS EPILEPTICUS after abrupt cessation.',
    symptomsEs: 'Parestesias táctiles intensas (hormigueo, quemazón), acatisia severa (inquietud motora), temblor de intención, sacudidas mioclónicas, fotofobia, hiperacusia y RIESGO DE CONVULSIONES / ESTATUS EPILEPTICUS tras cese brusco.',
  },
  {
    clusterId: 'psychiatric',
    nameEn: 'Psychological & Rebound Affective Crisis',
    nameEs: 'Crisis Psicológica y Afectiva de Rebote',
    symptomsEn: 'Severe panic attacks, terror, intense rebound generalized anxiety, total insomnia lasting multiple nights, severe dysphoria, depersonalization, derealization, paranoia, and agitation.',
    symptomsEs: 'Ataques de pánico severos, terror, ansiedad generalizada de rebote, insomnio refractario de varias noches, disforia profunda, despersonalización, desrealización y agitación.',
  },
]);

// ============================================================================
// HOROWITZ & TAYLOR HYPERBOLIC DEPRESCRIBING PROTOCOLS
// ============================================================================

export const HYPERBOLIC_TAPERING_PRINCIPLES = Object.freeze({
  coreRationaleEn: 'Voltage-gated calcium channel (alpha-2-delta) receptor occupancy follows a non-linear Michaelis-Menten hyperbolic curve. A fixed linear drop (e.g. dropping 300 mg every step) causes tiny drops in receptor occupancy at high doses (e.g. 3,600 to 3,300 mg drops receptor occupancy by ~2%), but causes a catastrophic cliff drop at low doses (e.g. 300 mg to 0 mg plunges receptor occupancy by > 40%). Deprescribing must reduce by a consistent percentage of the PREVIOUS dose (hyperbolic step-down), NOT linear absolute milligrams.',
  coreRationaleEs: 'La ocupación de receptores alfa-2-delta sigue una curva hiperbólica no lineal. Una reducción lineal fija (ej. bajar 300 mg cada vez) causa una caída diminuta de ocupación a dosis altas (~2%), pero un precipicio catastrófico a dosis bajas (de 300 mg a 0 mg cae > 40%). El descenso debe reducir un porcentaje constante de la DOSIS ANTERIOR (reducción hiperbólica), no miligramos lineales fijos.',
  speedTiers: Object.freeze([
    {
      tierId: 'conservative',
      nameEn: 'Conservative Hyperbolic Taper (Recommended for High Anxiety / Prior Severe Withdrawal)',
      nameEs: 'Descenso Hiperbólico Conservador (Recomendado con Ansiedad Alta o Abstinencia Previa)',
      reductionPercent: 10,
      intervalWeeks: 3,
      descriptionEn: 'Reduce daily dose by 10% of the PREVIOUS dose every 3 to 4 weeks. Minimizes withdrawal symptoms and prevents panic/seizure crises.',
      descriptionEs: 'Reducir la dosis diaria un 10% de la DOSIS ANTERIOR cada 3 a 4 semanas. Minimiza los síntomas y previene pánico y convulsiones.',
    },
    {
      tierId: 'standard',
      nameEn: 'Standard Moderate Hyperbolic Taper (Stable Outpatients)',
      nameEs: 'Descenso Hiperbólico Moderado Estándar (Pacientes Ambulatorios Estables)',
      reductionPercent: 15,
      intervalWeeks: 2,
      descriptionEn: 'Reduce daily dose by 15% of the PREVIOUS dose every 2 to 3 weeks. Balanced pace for stable individuals.',
      descriptionEs: 'Reducir la dosis diaria un 15% de la DOSIS ANTERIOR cada 2 a 3 semanas. Ritmo equilibrado para personas estables.',
    },
    {
      tierId: 'accelerated',
      nameEn: 'Accelerated Clinical Taper (Hospital / Inpatient Monitored Setting Only)',
      nameEs: 'Descenso Acelerado (Únicamente en Entorno Hospitalario / Monitorizado)',
      reductionPercent: 25,
      intervalWeeks: 1,
      descriptionEn: 'Reduce dose by 20% to 25% weekly under medical supervision with adjunctive non-sedating symptom support.',
      descriptionEs: 'Reducir la dosis un 20% a 25% semanal bajo supervisión médica y soporte farmacológico coadyuvante.',
    },
  ]),
});

// ============================================================================
// RENAL CLEARANCE (COCKCROFT-GAULT CrCl) DOSING MATRICES
// ============================================================================

export function calculateCockcroftGaultCrCl(serumCrMgDl, ageYears, weightKg, isFemale) {
  if (!serumCrMgDl || serumCrMgDl <= 0 || !ageYears || !weightKg) return 90;
  const rawCrCl = ((140 - ageYears) * weightKg) / (72 * serumCrMgDl);
  return Math.round(isFemale ? rawCrCl * 0.85 : rawCrCl);
}

export function getRenalDoseLimits(substanceId, crCl) {
  if (substanceId === 'pregabalin') {
    if (crCl >= 60) return { maxDailyMg: 600, dosingInterval: 'BID or TID', notesEn: 'Standard dosing', notesEs: 'Dosis estándar' };
    if (crCl >= 30) return { maxDailyMg: 300, dosingInterval: 'BID or QD', notesEn: '50% dose reduction required to avoid myoclonus', notesEs: 'Reducción del 50% requerida para evitar mioclonías' };
    if (crCl >= 15) return { maxDailyMg: 150, dosingInterval: 'QD (Once daily)', notesEn: '75% dose reduction required. High neurotoxicity risk.', notesEs: 'Reducción del 75%. Alto riesgo de neurotoxicidad.' };
    return { maxDailyMg: 75, dosingInterval: 'QD with post-dialysis supplemental dose', notesEn: 'Severe renal impairment / End-stage renal disease', notesEs: 'Insuficiencia renal grave / Diálisis' };
  }

  // Gabapentin
  if (crCl >= 60) return { maxDailyMg: 3600, dosingInterval: 'TID (Three times daily)', notesEn: 'Standard maximum labeled dose', notesEs: 'Dosis máxima habitual autorizada' };
  if (crCl >= 30) return { maxDailyMg: 1400, dosingInterval: 'BID (Twice daily)', notesEn: 'Reduce to 700-1400 mg/day max. High risk of ataxia and sedation.', notesEs: 'Reducir a 700-1400 mg/día máx. Riesgo de ataxia y sedación.' };
  if (crCl >= 15) return { maxDailyMg: 700, dosingInterval: 'QD (Once daily)', notesEn: 'Reduce to 300-700 mg/day max. Monitor for toxic encephalopathy.', notesEs: 'Reducir a 300-700 mg/día máx. Vigilar encefalopatía tóxica.' };
  return { maxDailyMg: 300, dosingInterval: 'QD every other day + post-HD booster', notesEn: 'Severe impairment / Dialysis: massive drug accumulation occurs.', notesEs: 'Insuficiencia severa / Diálisis: acumulación masiva del fármaco.' };
}

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialGabapentinoidState = () => ({
  activeTab: 'calculator', // 'calculator' | 'deprescribing' | 'pharmacology' | 'synergy' | 'renal'
  viewMode: 'community', // 'community' | 'clinical'
  selectedSubstance: 'gabapentin', // 'gabapentin' | 'pregabalin'
  currentDailyDoseMg: 1800,
  hasOpioidCoPrescription: false,
  hasPulmonaryDisease: false,
  hasSedativeCoIngestion: false,
  patientAgeYears: 45,
  patientWeightKg: 70,
  serumCreatinineMgDl: 1.0,
  patientIsFemale: false,
  selectedTaperSpeed: 'conservative', // 'conservative' | 'standard' | 'accelerated'
});

let currentGabapentinoidState = initialGabapentinoidState();
const stateSubscribers = new Set();

export function getGabapentinoidState() {
  return { ...currentGabapentinoidState };
}

export function setGabapentinoidState(patch) {
  currentGabapentinoidState = { ...currentGabapentinoidState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentGabapentinoidState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetGabapentinoidState() {
  currentGabapentinoidState = initialGabapentinoidState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentGabapentinoidState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribeGabapentinoidState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL EVALUATION & DEPRESCRIBING SCHEDULE GENERATOR
// ============================================================================

export function evaluateGabapentinoidSafety(state) {
  const {
    selectedSubstance,
    currentDailyDoseMg,
    hasOpioidCoPrescription,
    hasPulmonaryDisease,
    hasSedativeCoIngestion,
    patientAgeYears,
    patientWeightKg,
    serumCreatinineMgDl,
    patientIsFemale,
  } = state;

  const crCl = calculateCockcroftGaultCrCl(serumCreatinineMgDl, patientAgeYears, patientWeightKg, patientIsFemale);
  const renalLimits = getRenalDoseLimits(selectedSubstance, crCl);
  const isDoseOverRenalLimit = currentDailyDoseMg > renalLimits.maxDailyMg;

  // 1. Critical Overdose Synergy Tier
  if (hasOpioidCoPrescription && (hasPulmonaryDisease || hasSedativeCoIngestion || patientAgeYears >= 65)) {
    return {
      urgencyTier: 'emergency_synergy',
      tierTitleEn: 'CRITICAL WARNING: High-Risk Synergistic Respiratory Depression',
      tierTitleEs: 'ADVERTENCIA CRÍTICA: Alto Riesgo de Depresión Respiratoria Sinérgica',
      isHighRisk: true,
      crCl,
      actionEn: 'EMERGENCY CO-PRESCRIBING ALERT: The combination of a gabapentinoid + opioid in the presence of respiratory disease, age >= 65, or concurrent sedatives carries a catastrophic risk of fatal sleep apnea and respiratory arrest. Coprescribe Take-Home Naloxone (Narcan) immediately. Do NOT discontinue cold turkey (seizure hazard); immediately initiate a gradual hyperbolic deprescribing plan under close physician supervision.',
      actionEs: 'ALERTA DE COPRESCRIPCIÓN CRÍTICA: La combinación de gabapentinoide + opioide con patología respiratoria, edad >= 65 o sedantes conlleva un riesgo catastrófico de apnea fatal y paro respiratorio. Co-prescriba Naloxona de inmediato. NO suspenda de golpe por riesgo de convulsiones; inicie reducción hiperbólica supervisada.',
      clinicalPrescriptionGuidanceEn: 'Immediate naloxone co-prescription; titrate opioid and gabapentinoid down sequentially; avoid benzodiazepines/alcohol.',
      clinicalPrescriptionGuidanceEs: 'Co-prescripción inmediata de naloxona; descender opioide y gabapentinoide de forma secuencial; evitar benzodiacepinas y alcohol.',
    };
  }

  // 2. Renal Neurotoxicity Warning
  if (isDoseOverRenalLimit) {
    return {
      urgencyTier: 'renal_overdose',
      tierTitleEn: 'WARNING: Dose Exceeds Renal Clearance Capacity (Neurotoxicity Risk)',
      tierTitleEs: 'ADVERTENCIA: La Dosis Excede la Capacidad Renal (Riesgo de Neurotoxicidad)',
      isHighRisk: true,
      crCl,
      actionEn: `Renal clearance is estimated at ${crCl} mL/min. The patient’s current dose of ${currentDailyDoseMg} mg exceeds the recommended safe maximum of ${renalLimits.maxDailyMg} mg/day. Because gabapentinoids are eliminated 100% renally, this dose leads to massive drug accumulation, predisposing to myoclonus, ataxia, falls, confusion, and toxic encephalopathy. Adjust dose to renal ceiling.`,
      actionEs: `El aclaramiento renal estimado es de ${crCl} mL/min. La dosis actual de ${currentDailyDoseMg} mg supera el límite seguro de ${renalLimits.maxDailyMg} mg/día. Dado que se eliminan 100% por vía renal, se produce acumulación masiva con riesgo de mioclonías, ataxia, caídas y encefalopatía tóxica. Ajuste a la dosis límite renal.`,
      clinicalPrescriptionGuidanceEn: `Reduce target dose to <= ${renalLimits.maxDailyMg} mg/day divided ${renalLimits.dosingInterval}.`,
      clinicalPrescriptionGuidanceEs: `Reduzca la dosis objetivo a <= ${renalLimits.maxDailyMg} mg/día repartidos ${renalLimits.dosingInterval}.`,
    };
  }

  // 3. Moderate / Standard Care Pathway
  return {
    urgencyTier: 'standard_management',
    tierTitleEn: 'Elective Hyperbolic Deprescribing & Neuropathic Management',
    tierTitleEs: 'Descenso Hiperbólico Electivo y Manejo Neuropático',
    isHighRisk: false,
    crCl,
    actionEn: 'Patient is a candidate for structured outpatient hyperbolic deprescribing. Follow a 10% to 15% reduction of the previous dose every 2 to 4 weeks. Transition to liquid formulation for the final sensitive tail under 300 mg gabapentin or 50 mg pregabalin to avoid withdrawal akathisia and rebound insomnia.',
    actionEs: 'El paciente es candidato a reducción gradual hiperbólica ambulatoria. Reduzca del 10% al 15% de la dosis anterior cada 2 a 4 semanas. Transicione a formulación líquida en la fase final bajo 300 mg de gabapentina o 50 mg de pregabalina.',
    clinicalPrescriptionGuidanceEn: 'Step-down titration every 2-4 weeks; utilize oral liquid formulation for micro-adjustments.',
    clinicalPrescriptionGuidanceEs: 'Reducción escalonada cada 2-4 semanas; emplear solución oral para micro-ajustes.',
  };
}

export function generateHyperbolicSchedule(startDoseMg, percentDrop, intervalWeeks, minDoseFloor = 25) {
  const steps = [];
  let current = Math.round(startDoseMg);
  let weekCounter = 0;

  steps.push({
    stepIndex: 1,
    weekStart: 0,
    weekEnd: intervalWeeks,
    doseMg: current,
    reductionFromPrev: 0,
  });

  let stepNumber = 2;
  while (current > minDoseFloor && stepNumber <= 12) {
    weekCounter += intervalWeeks;
    const dropAmount = Math.max(10, Math.round(current * (percentDrop / 100)));
    current = Math.max(0, current - dropAmount);

    steps.push({
      stepIndex: stepNumber,
      weekStart: weekCounter,
      weekEnd: weekCounter + intervalWeeks,
      doseMg: current,
      reductionFromPrev: dropAmount,
    });

    if (current <= minDoseFloor) {
      break;
    }
    stepNumber++;
  }

  // Final cessation step
  if (current > 0) {
    weekCounter += intervalWeeks;
    steps.push({
      stepIndex: stepNumber,
      weekStart: weekCounter,
      weekEnd: weekCounter + intervalWeeks,
      doseMg: 0,
      reductionFromPrev: current,
    });
  }

  return steps;
}

// ============================================================================
// ZERO-PII CLINICAL SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildGabapentinoidSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();
  const subData = GABAPENTINOID_COMPARATIVE_DATA[state.selectedSubstance] || GABAPENTINOID_COMPARATIVE_DATA.gabapentin;

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: GABAPENTINOIDES, SINERGIA RESPIRATORIA Y DESESCALADA',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      `Evaluación de seguridad farmacológica y plan de descenso para: ${subData.genericName}.`,
      `Dosis diaria actual: ${state.currentDailyDoseMg} mg/día.`,
      `Nivel de urgencia evaluado: ${evaluation.tierTitleEs}.`,
      `Aclaramiento renal estimado (Cockcroft-Gault CrCl): ${evaluation.crCl} mL/min.`,
      '',
      'B (ANTECEDENTES / FACTORES DE RIESGO DE SOBREDOSIS):',
      `- Coprescripción con opioides: ${state.hasOpioidCoPrescription ? 'SÍ (ALTO RIESGO DE APNEA SINÉRGICA)' : 'No'}.`,
      `- Enfermedad pulmonar subyacente (EPOC / Asma / Apnea): ${state.hasPulmonaryDisease ? 'SÍ' : 'No'}.`,
      `- Consumo concurrente de sedantes (benzodiacepinas / alcohol): ${state.hasSedativeCoIngestion ? 'SÍ' : 'No'}.`,
      `- Edad: ${state.patientAgeYears} años | Peso: ${state.patientWeightKg} kg | Creatinina: ${state.serumCreatinineMgDl} mg/dL.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Alerta de seguridad: ${evaluation.isHighRisk ? 'RIESGO CRÍTICO DE PARO RESPIRATORIO O NEUROTOXICIDAD' : 'MANEJO AMBULATORIO ESTÁNDAR'}.`,
      `- Análisis clínico: ${evaluation.actionEs}`,
      `- Guía de prescripción: ${evaluation.clinicalPrescriptionGuidanceEs}`,
      '',
      'R (RECOMENDACIONES Y PLAN TERAPÉUTICO DE DESESCALADA):',
      '1. Si co-prescribe con opioides: Prescribir Naloxona nasal (4 mg) de inmediato y advertir sobre el riesgo de apnea obstructiva/central.',
      '2. NO suspender de forma brusca: El cese repentino precipita tormenta autonómica, pánico severo, acatisia y estatus epiléptico.',
      '3. Iniciar pauta hiperbólica: Reducciones del 10% al 15% de la dosis previa cada 2 a 4 semanas.',
      '4. Utilizar formulación líquida oral para la fase final bajo 300 mg de gabapentina o 50 mg de pregabalina.',
      '5. Ajustar obligatoriamente la dosis al aclaramiento renal para evitar mioclonías y encefalopatía.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'GABAPENTINOID SAFETY, OVERDOSE SYNERGY & HYPERBOLIC DEPRESCRIBING SBAR NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    `Clinical safety evaluation and deprescribing proposal for: ${subData.genericName}.`,
    `Current reported dose: ${state.currentDailyDoseMg} mg/day.`,
    `Clinical Urgency Tier: ${evaluation.tierTitleEn}.`,
    `Estimated Creatinine Clearance (Cockcroft-Gault CrCl): ${evaluation.crCl} mL/min.`,
    '',
    'B (BACKGROUND / OVERDOSE RISK FACTORS):',
    `- Concurrent opioid co-prescription: ${state.hasOpioidCoPrescription ? 'YES (HIGH SYNERGISTIC RESPIRATORY DEPRESSION HAZARD)' : 'No'}.`,
    `- Underlying pulmonary disease (COPD / Asthma / Sleep Apnea): ${state.hasPulmonaryDisease ? 'YES' : 'No'}.`,
    `- Concurrent sedative co-ingestion (benzodiazepines / alcohol): ${state.hasSedativeCoIngestion ? 'YES' : 'No'}.`,
    `- Age: ${state.patientAgeYears} yrs | Weight: ${state.patientWeightKg} kg | Serum Cr: ${state.serumCreatinineMgDl} mg/dL.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Safety Urgency: ${evaluation.isHighRisk ? 'CRITICAL APNEA / NEUROTOXICITY HAZARD' : 'STANDARD OUTPATIENT MANAGEMENT'}.`,
    `- Assessment: ${evaluation.actionEn}`,
    `- Prescribing Guidance: ${evaluation.clinicalPrescriptionGuidanceEn}`,
    '',
    'R (RECOMMENDATIONS & HYPERBOLIC DEPRESCRIBING PLAN):',
    '1. If co-prescribed with opioids: Co-prescribe Take-Home Naloxone (4 mg nasal spray) immediately; counsel on synergistic airway collapse.',
    '2. DO NOT discontinue cold turkey: Abrupt cessation precipitates severe autonomic storm, panic, akathisia, and seizure risk.',
    '3. Initiate hyperbolic step-down: 10% to 15% reductions of the PREVIOUS dose every 2 to 4 weeks.',
    '4. Switch to oral liquid solution for the sensitive micro-titration tail below 300 mg gabapentin or 50 mg pregabalin.',
    '5. Mandate renal dose adjustments based on CrCl to prevent toxic myoclonus and encephalopathy.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function gabapentinoidCareView() {
  const container = h('div', { class: 'gabapentinoid-care-view' });

  // Static Header
  const header = h('header', { class: 'gc-header' }, [
    h('div', { class: 'gc-header-badge' }, [
      icon('alert'),
      h('span', {}, t('gc.header.badge', 'Clinical Pharmacology & Deprescribing Navigator')),
    ]),
    h('h1', { id: 'page-title', tabindex: '-1', class: 'gc-header-title' }, t('gc.header.title', 'Gabapentinoid Safety, Respiratory Synergy & Deprescribing')),
    h('p', { class: 'gc-header-desc' }, t('gc.header.desc', 'Evidence-based clinical decision support under FDA Drug Safety Communications and the Horowitz-Taylor hyperbolic deprescribing framework: managing Gabapentin (Neurontin) and Pregabalin (Lyrica) opioid respiratory synergy, renal dose limits, and withdrawal prevention.')),
  ]);

  const modeSlot = h('div');
  const tabsSlot = h('div');
  const contentSlot = h('div');
  container.append(header, modeSlot, tabsSlot, contentSlot);

  // Persistent calculator inputs (built once so typing never loses focus)
  const initial = getGabapentinoidState();
  const substanceSel = h('select', {
    id: 'gc-select-substance',
    class: 'gc-select',
    onchange: (e) => setGabapentinoidState({
      selectedSubstance: e.target.value,
      currentDailyDoseMg: e.target.value === 'pregabalin' ? 300 : 1800,
    }),
  }, [
    h('option', { value: 'gabapentin', selected: initial.selectedSubstance === 'gabapentin' }, t('gc.opt.gabapentin', 'Gabapentin (Neurontin, Gralise)')),
    h('option', { value: 'pregabalin', selected: initial.selectedSubstance === 'pregabalin' }, t('gc.opt.pregabalin', 'Pregabalin (Lyrica)')),
  ]);
  const doseInp = h('input', {
    id: 'gc-input-dose',
    type: 'number',
    min: '25',
    max: '7200',
    step: '25',
    class: 'gc-input-number',
    value: initial.currentDailyDoseMg,
    oninput: (e) => setGabapentinoidState({ currentDailyDoseMg: Math.max(0, Number(e.target.value) || 0) }),
  });
  const ageInp = h('input', {
    id: 'gc-input-age',
    type: 'number',
    min: '18',
    max: '105',
    class: 'gc-input-number',
    value: initial.patientAgeYears,
    oninput: (e) => setGabapentinoidState({ patientAgeYears: Math.max(18, Number(e.target.value) || 45) }),
  });
  const scrInp = h('input', {
    id: 'gc-input-scr',
    type: 'number',
    min: '0.2',
    max: '15.0',
    step: '0.1',
    class: 'gc-input-number',
    value: initial.serumCreatinineMgDl,
    oninput: (e) => setGabapentinoidState({ serumCreatinineMgDl: Math.max(0.1, Number(e.target.value) || 1.0) }),
  });
  const opioidChk = h('input', {
    type: 'checkbox',
    checked: initial.hasOpioidCoPrescription,
    onchange: (e) => setGabapentinoidState({ hasOpioidCoPrescription: e.target.checked }),
  });
  const pulmChk = h('input', {
    type: 'checkbox',
    checked: initial.hasPulmonaryDisease,
    onchange: (e) => setGabapentinoidState({ hasPulmonaryDisease: e.target.checked }),
  });
  const sedativeChk = h('input', {
    type: 'checkbox',
    checked: initial.hasSedativeCoIngestion,
    onchange: (e) => setGabapentinoidState({ hasSedativeCoIngestion: e.target.checked }),
  });

  const calcInputsGrid = h('div', { class: 'gc-inputs-grid' }, [
    h('div', { class: 'input-card' }, [
      h('label', { for: 'gc-select-substance', class: 'input-label' }, t('gc.label.substance', '1. Gabapentinoid Agent')),
      substanceSel,
    ]),
    h('div', { class: 'input-card' }, [
      h('label', { for: 'gc-input-dose', class: 'input-label' }, t('gc.label.dose', '2. Current Total Daily Dose (mg/day)')),
      doseInp,
    ]),
    h('div', { class: 'input-card' }, [
      h('label', { for: 'gc-input-age', class: 'input-label' }, t('gc.label.age', '3. Patient Age (Years)')),
      ageInp,
    ]),
    h('div', { class: 'input-card' }, [
      h('label', { for: 'gc-input-scr', class: 'input-label' }, t('gc.label.scr', '4. Serum Creatinine (mg/dL)')),
      scrInp,
    ]),
    h('div', { class: 'input-card checkbox-card' }, [
      h('label', { class: 'checkbox-label' }, [
        opioidChk,
        h('span', {}, [
          h('strong', {}, t('gc.check.opioidStrong', 'Taking with ANY Opioid? ')),
          t('gc.check.opioidDetail', '(Methadone, Buprenorphine, Oxycodone, Fentanyl, Tramadol)'),
        ]),
      ]),
    ]),
    h('div', { class: 'input-card checkbox-card' }, [
      h('label', { class: 'checkbox-label' }, [
        pulmChk,
        h('span', {}, [
          h('strong', {}, t('gc.check.pulmStrong', 'Respiratory Disease? ')),
          t('gc.check.pulmDetail', '(COPD, Sleep Apnea / OSA, Asthma, Hypoventilation)'),
        ]),
      ]),
    ]),
    h('div', { class: 'input-card checkbox-card' }, [
      h('label', { class: 'checkbox-label' }, [
        sedativeChk,
        h('span', {}, [
          h('strong', {}, t('gc.check.sedativeStrong', 'Other Sedatives or Alcohol? ')),
          t('gc.check.sedativeDetail', '(Benzodiazepines, Z-drugs, Alcohol, Hydroxyzine)'),
        ]),
      ]),
    ]),
  ]);
  const calcResultsSlot = h('div');
  const calcSection = h('section', { class: 'gc-calculator-section', role: 'tabpanel' }, calcInputsGrid, calcResultsSlot);
  let lastRenderedTab = null;

  function syncCalcInputs(state) {
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    if (active !== substanceSel) substanceSel.value = state.selectedSubstance;
    if (active !== doseInp) doseInp.value = String(state.currentDailyDoseMg);
    if (active !== ageInp) ageInp.value = String(state.patientAgeYears);
    if (active !== scrInp) scrInp.value = String(state.serumCreatinineMgDl);
    if (active !== opioidChk) opioidChk.checked = state.hasOpioidCoPrescription;
    if (active !== pulmChk) pulmChk.checked = state.hasPulmonaryDisease;
    if (active !== sedativeChk) sedativeChk.checked = state.hasSedativeCoIngestion;
  }

  function render() {
    const state = getGabapentinoidState();
    const evaluation = evaluateGabapentinoidSafety(state);

    clear(modeSlot);
    modeSlot.appendChild(h('div', { class: 'gc-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        type: 'button',
        class: `gc-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setGabapentinoidState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('gc.mode.community', 'Patient & Family Safety Mode (Plain-Language Safe Tapering & Naloxone)')),
      ]),
      h('button', {
        type: 'button',
        class: `gc-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setGabapentinoidState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('gc.mode.clinical', 'Clinician & Prescriber Mode (Cockcroft-Gault CrCl, Pharmacokinetics & SBAR)')),
      ]),
    ]));

    clear(tabsSlot);
    tabsSlot.appendChild(h('div', { class: 'gc-tabs-nav', role: 'tablist', 'aria-label': 'Gabapentinoid Navigation Tabs' }, [
      h('button', {
        type: 'button',
        class: `gc-tab-btn ${state.activeTab === 'calculator' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'calculator' ? 'true' : 'false',
        onclick: () => setGabapentinoidState({ activeTab: 'calculator' }),
      }, t('gc.tabs.calculator', 'Overdose Risk & Renal Calculator')),
      h('button', {
        type: 'button',
        class: `gc-tab-btn ${state.activeTab === 'deprescribing' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'deprescribing' ? 'true' : 'false',
        onclick: () => setGabapentinoidState({ activeTab: 'deprescribing' }),
      }, t('gc.tabs.deprescribing', 'Hyperbolic Deprescribing Protocol')),
      h('button', {
        type: 'button',
        class: `gc-tab-btn ${state.activeTab === 'pharmacology' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'pharmacology' ? 'true' : 'false',
        onclick: () => setGabapentinoidState({ activeTab: 'pharmacology' }),
      }, t('gc.tabs.pharmacology', 'Gabapentin vs. Pregabalin Science')),
      h('button', {
        type: 'button',
        class: `gc-tab-btn ${state.activeTab === 'synergy' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'synergy' ? 'true' : 'false',
        onclick: () => setGabapentinoidState({ activeTab: 'synergy' }),
      }, t('gc.tabs.synergy', 'FDA 2019 Respiratory Synergy')),
      h('button', {
        type: 'button',
        class: `gc-tab-btn ${state.activeTab === 'renal' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'renal' ? 'true' : 'false',
        onclick: () => setGabapentinoidState({ activeTab: 'renal' }),
      }, t('gc.tabs.renal', 'Renal Impairment & Dialysis')),
    ]));

    if (state.activeTab === 'calculator') {
      syncCalcInputs(state);
      if (lastRenderedTab !== 'calculator') {
        clear(contentSlot);
        contentSlot.appendChild(calcSection);
        lastRenderedTab = 'calculator';
      }
      renderCalculatorOutputs(state, evaluation);
      return;
    }

    lastRenderedTab = state.activeTab;
    clear(contentSlot);
    switch (state.activeTab) {
      case 'deprescribing':
        contentSlot.appendChild(renderDeprescribingTab(state));
        break;
      case 'pharmacology':
        contentSlot.appendChild(renderPharmacologyTab());
        break;
      case 'synergy':
        contentSlot.appendChild(renderSynergyTab());
        break;
      case 'renal':
        contentSlot.appendChild(renderRenalTab(state, evaluation));
        break;
    }
  }

  // --- SUB-RENDERERS ---

  function renderCalculatorOutputs(state, evaluation) {
    clear(calcResultsSlot);

    const resultBox = h('div', { class: `gc-result-card ${evaluation.isHighRisk ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'gc-result-header' }, [
        icon(evaluation.isHighRisk ? 'alert' : 'check'),
        h('h3', {}, evaluation.tierTitleEn),
      ]),
      h('div', { class: 'gc-result-details' }, [
        h('div', { class: 'gc-rec-item' }, [
          h('strong', {}, t('gc.res.renalCl', 'Estimated Renal Clearance (CrCl): ')),
          h('span', { class: 'gc-badge-crcl' }, `${evaluation.crCl} mL/min`),
        ]),
        h('div', { class: 'gc-rec-item' }, [
          h('strong', {}, t('gc.res.action', 'Clinical Safety Assessment: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'gc-rec-item' }, [
          h('strong', {}, t('gc.res.guidance', 'Prescription Strategy & Risk Mitigation: ')),
          h('p', {}, evaluation.clinicalPrescriptionGuidanceEn),
        ]),
      ]),
    ]);

    const copyEnBtn = h('button', {
      type: 'button',
      class: 'btn-copy-sbar',
      onclick: () => {
        const text = buildGabapentinoidSbarText(state, evaluation, 'en');
        copyText(text, { trigger: copyEnBtn, copiedLabel: 'Copied to Clipboard!', resetMs: 2500 });
      },
    }, [icon('copy'), h('span', {}, t('gc.sbar.copyEn', 'Copy Clinical SBAR (English)'))]);
    const copyEsBtn = h('button', {
      type: 'button',
      class: 'btn-copy-sbar secondary',
      onclick: () => {
        const text = buildGabapentinoidSbarText(state, evaluation, 'es');
        copyText(text, { trigger: copyEsBtn, copiedLabel: '¡Copiado al Portapapeles!', resetMs: 2500 });
      },
    }, [icon('copy'), h('span', {}, t('gc.sbar.copyEs', 'Copiar SBAR (Español)'))]);
    const sbarCard = h('div', { class: 'sbar-export-container' }, [
      h('div', { class: 'sbar-header' }, [
        h('h4', {}, t('gc.sbar.title', 'Zero-PII Clinical Handoff & Physician Note Generator')),
        h('p', {}, t('gc.sbar.desc', 'Generate an anonymous, structured clinical SBAR summary for Primary Care, Pain Management, or Emergency Department consults. Operates 100% in local browser memory.')),
      ]),
      h('div', { class: 'sbar-actions' }, [copyEnBtn, copyEsBtn]),
    ]);

    calcResultsSlot.appendChild(resultBox);
    calcResultsSlot.appendChild(sbarCard);
  }

  function renderDeprescribingTab(state) {
    const section = h('section', { class: 'gc-deprescribing-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('gc.dep.heading', 'Hyperbolic Deprescribing Protocol (Horowitz & Taylor Model)')),
      h('p', { class: 'tab-subtitle' }, t('gc.dep.subtitle', 'Scientific step-down protocols based on non-linear receptor occupancy curves to prevent severe withdrawal, akathisia, and seizures.')),

      // Speed Selector Controls
      h('div', { class: 'taper-controls-card' }, [
        h('label', { class: 'input-label' }, t('gc.dep.chooseSpeed', 'Select Deprescribing Speed Tier:')),
        h('div', { class: 'taper-btn-group' }, HYPERBOLIC_TAPERING_PRINCIPLES.speedTiers.map((tier) => h('button', {
          type: 'button',
          class: `taper-tier-btn ${state.selectedTaperSpeed === tier.tierId ? 'active' : ''}`,
          onclick: () => setGabapentinoidState({ selectedTaperSpeed: tier.tierId }),
        }, [
          h('strong', {}, tier.nameEn),
          h('span', {}, tier.descriptionEn),
        ]))),
      ]),

      // Schedule Table
      (() => {
        const selectedTier = HYPERBOLIC_TAPERING_PRINCIPLES.speedTiers.find((t) => t.tierId === state.selectedTaperSpeed) || HYPERBOLIC_TAPERING_PRINCIPLES.speedTiers[0];
        const schedule = generateHyperbolicSchedule(state.currentDailyDoseMg, selectedTier.reductionPercent, selectedTier.intervalWeeks, state.selectedSubstance === 'pregabalin' ? 25 : 50);

        return h('div', { class: 'schedule-container' }, [
          h('h3', {}, `Customized Deprescribing Schedule: Starting from ${state.currentDailyDoseMg} mg/day`),
          h('div', { class: 'schedule-table-wrap' }, [
            h('table', { class: 'schedule-table' }, [
              h('thead', {}, [
                h('tr', {}, [
                  h('th', {}, 'Step'),
                  h('th', {}, 'Time Window'),
                  h('th', {}, 'Target Daily Dose'),
                  h('th', {}, 'Dose Reduction'),
                  h('th', {}, 'Clinical Action / Formulation'),
                ]),
              ]),
              h('tbody', {}, schedule.map((step) => h('tr', {}, [
                h('td', {}, h('strong', {}, `Step ${step.stepIndex}`)),
                h('td', {}, `Weeks ${step.weekStart} – ${step.weekEnd}`),
                h('td', { class: 'col-dose' }, `${step.doseMg} mg/day`),
                h('td', {}, step.reductionFromPrev > 0 ? `-${step.reductionFromPrev} mg` : 'Baseline'),
                h('td', {}, step.doseMg === 0
                  ? 'Complete cessation; maintain non-pharmacological support.'
                  : (step.doseMg <= (state.selectedSubstance === 'pregabalin' ? 50 : 300)
                    ? 'SWITCH TO LIQUID FORMULATION (Oral solution) for precise micro-dosing.'
                    : 'Standard capsule / tablet dividing doses BID or TID.')),
              ]))),
            ]),
          ]),
        ]);
      })(),

      // Key Safety Principles Box
      h('div', { class: 'gc-principles-card' }, [
        h('h3', {}, 'Golden Rules for Safe Gabapentinoid Deprescribing'),
        h('ul', { class: 'gc-rule-list' }, [
          h('li', {}, 'NEVER STOP COLD TURKEY: Abrupt cessation triggers severe autonomic hyperactivity, panic, motor akathisia, and potential status epilepticus.'),
          h('li', {}, 'HOLD DOSE IF WITHDRAWAL OCCURS: If intolerable withdrawal symptoms appear, halt reductions for 1-2 weeks at the current dose until stabilized; do NOT escalate back to baseline.'),
          h('li', {}, 'LIQUID FORMULATION AT LOW DOSES: The lowest manufactured capsules (100 mg gabapentin, 25 mg pregabalin) are too large for the final step-off. Prescribe commercial oral solution (gabapentin 250 mg/5 mL; pregabalin 20 mg/mL).'),
          h('li', {}, 'COGNITIVE & SENSORY REASSURANCE: Remind patients that "skin crawling", tremors, and insomnia are objective physical receptor adaptations, not permanent psychiatric illness.'),
        ]),
      ]),
    ]);
    return section;
  }

  function renderPharmacologyTab() {
    const section = h('section', { class: 'gc-pharmacology-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('gc.pharm.heading', 'Comparative Pharmacology: Gabapentin vs. Pregabalin')),
      h('p', { class: 'tab-subtitle' }, t('gc.pharm.subtitle', 'Critical pharmacokinetic differences that explain why pregabalin has higher misuse liability and why gabapentin megadosing saturates absorption.')),

      h('div', { class: 'gc-substances-grid' }, Object.values(GABAPENTINOID_COMPARATIVE_DATA).map((sub) => h('div', { class: 'gc-sub-card' }, [
        h('h3', { class: 'gc-sub-title' }, sub.genericName),
        h('p', {}, [h('strong', {}, 'Potency Ratio: '), h('span', { class: 'badge-potency' }, sub.potencyRatio)]),
        h('p', {}, [h('strong', {}, 'Mechanism of Action: '), sub.mechanismEn]),
        h('div', { class: 'gc-alert-box absorption' }, [
          icon('alert'),
          h('p', {}, [h('strong', {}, 'Absorption Pharmacokinetics: '), sub.absorptionEn]),
        ]),
        h('p', {}, [h('strong', {}, 'Elimination Half-Life & Clearance: '), sub.halfLifeEn]),
        h('p', {}, [h('strong', {}, 'Standard Dosing Range: '), sub.standardDoseRangeEn]),
        h('p', {}, [h('strong', {}, 'Available Liquid Formulation: '), sub.liquidFormulationEn]),
      ]))),

      // Withdrawal Clusters
      h('div', { class: 'gws-clusters-container' }, [
        h('h3', {}, 'Gabapentinoid Withdrawal Syndrome (GWS) Symptom Clusters'),
        h('div', { class: 'gws-clusters-grid' }, GWS_SYMPTOM_CLUSTERS.map((cl) => h('div', { class: 'gws-cluster-card' }, [
          h('h4', {}, cl.nameEn),
          h('p', {}, cl.symptomsEn),
        ]))),
      ]),
    ]);
    return section;
  }

  function renderSynergyTab() {
    const section = h('section', { class: 'gc-synergy-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('gc.syn.heading', GABAPENTINOID_OVERDOSE_SYNERGY.fdaAlertTitleEn)),
      h('p', { class: 'tab-subtitle' }, t('gc.syn.subtitle', 'Understanding the deadly synergy between opioids and gabapentinoids that drives 20% to 30% of fatal overdose events.')),

      h('div', { class: 'synergy-warning-card' }, [
        icon('alert'),
        h('div', {}, [
          h('h3', {}, 'Why Gabapentinoids Amplified Opioid Fatalities'),
          h('p', {}, GABAPENTINOID_OVERDOSE_SYNERGY.clinicalMechanismEn),
          h('p', { class: 'stat-highlight' }, GABAPENTINOID_OVERDOSE_SYNERGY.fatalityStatsEn),
        ]),
      ]),

      h('div', { class: 'high-risk-cohorts-card' }, [
        h('h3', {}, 'High-Risk Patient Populations Requiring Immediate Naloxone Co-Prescribing'),
        h('ul', { class: 'gc-rule-list' }, GABAPENTINOID_OVERDOSE_SYNERGY.highRiskCohortsEn.map((cohort) => h('li', {}, cohort))),
      ]),
    ]);
    return section;
  }

  function renderRenalTab(state, evaluation) {
    const section = h('section', { class: 'gc-renal-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('gc.renal.heading', 'Renal Impairment, Cockcroft-Gault CrCl & Dialysis Dosing')),
      h('p', { class: 'tab-subtitle' }, t('gc.renal.subtitle', 'Both gabapentin and pregabalin are eliminated 100% unchanged via the kidneys. Dosing must be adjusted for estimated creatinine clearance to prevent acute neurotoxicity.')),

      h('div', { class: 'renal-calculator-banner' }, [
        icon('check'),
        h('div', {}, [
          h('h4', {}, `Patient Estimated CrCl: ${evaluation.crCl} mL/min`),
          h('p', {}, `Based on Age ${state.patientAgeYears} yrs, Weight ${state.patientWeightKg} kg, Serum Creatinine ${state.serumCreatinineMgDl} mg/dL.`),
        ]),
      ]),

      h('div', { class: 'renal-table-card' }, [
        h('h3', {}, 'Official Renal Dosing Ceilings (Cockcroft-Gault Guidance)'),
        h('div', { class: 'schedule-table-wrap' }, [
          h('table', { class: 'schedule-table' }, [
            h('thead', {}, [
              h('tr', {}, [
                h('th', {}, 'Creatinine Clearance (CrCl)'),
                h('th', {}, 'Max Gabapentin Daily Dose'),
                h('th', {}, 'Max Pregabalin Daily Dose'),
                h('th', {}, 'Dosing Interval & Safety Instructions'),
              ]),
            ]),
            h('tbody', {}, [
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'CrCl >= 60 mL/min (Normal)')),
                h('td', {}, '3,600 mg/day'),
                h('td', {}, '600 mg/day'),
                h('td', {}, 'Standard divided doses (BID or TID).'),
              ]),
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'CrCl 30 to 59 mL/min (Moderate)')),
                h('td', {}, '1,400 mg/day max'),
                h('td', {}, '300 mg/day max'),
                h('td', {}, 'Reduce daily dose by 50%. High risk of ataxia and daytime somnolence.'),
              ]),
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'CrCl 15 to 29 mL/min (Severe)')),
                h('td', {}, '700 mg/day max'),
                h('td', {}, '150 mg/day max'),
                h('td', {}, 'Reduce daily dose by 75%. Dose once daily (QD). Monitor for myoclonus.'),
              ]),
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'CrCl < 15 mL/min / Hemodialysis')),
                h('td', {}, '300 mg every other day'),
                h('td', {}, '75 mg once daily'),
                h('td', {}, 'Post-dialysis supplemental booster dose (200-300 mg gabapentin / 25-50 mg pregabalin).'),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]);
    return section;
  }

  let wasConnected = false;
  const unsubscribe = subscribeGabapentinoidState(() => {
    wasConnected = wasConnected || Boolean(container.isConnected);
    if (wasConnected && container.isConnected === false) {
      unsubscribe();
      return;
    }
    render();
  });
  render();

  return container;
}
