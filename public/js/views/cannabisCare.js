// public/js/views/cannabisCare.js
// HarborPath - Cannabinoid Hyperemesis Syndrome (CHS), High-Potency THC & Cannabis Harm Reduction Specialist
// Clinical standards: Rome IV Diagnostic Criteria, ACMT/ACEP Consensus on CHS, DSM-5-TR Cannabis Use Disorder, SAMHSA Advisory
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY & DIAGNOSTIC FRAMEWORKS
// ============================================================================

export const CHS_DIAGNOSTIC_FRAMEWORK = {
  titleEn: 'Rome IV Diagnostic Criteria & Clinical Phases of Cannabinoid Hyperemesis Syndrome (CHS)',
  titleEs: 'Criterios Diagnósticos de Roma IV y Fases Clínicas del Síndrome de Hiperémesis Cannabinoide (SHC)',
  overviewEn: 'Cannabinoid Hyperemesis Syndrome (CHS) is a debilitating paradoxical condition caused by chronic, heavy stimulation of central and enteric cannabinoid-1 (CB1) receptors. While acute cannabis acts as an antiemetic, prolonged high-potency THC exposure causes receptor downregulation and uncoupling, triggering severe cyclic vomiting and abdominal pain.',
  overviewEs: 'El Síndrome de Hiperémesis Cannabinoide (SHC) es una afección paradójica y debilitante provocada por la estimulación crónica de receptores cannabinoides-1 (CB1) centrales y entéricos. Aunque el cannabis agudo actúa como antiemético, la exposición prolongada a THC de alta potencia provoca desensibilización e internalización de receptores, causando vómitos cíclicos graves y dolor abdominal.',
  romeIvCriteria: [
    {
      id: 'heavy_use',
      nameEn: 'Chronic, High-Frequency Cannabinoid Exposure',
      nameEs: 'Exposición Crónica y de Alta Frecuencia a Cannabinoides',
      detailEn: 'History of regular cannabinoid use (daily or multiple times per week) for more than 1 year prior to onset, predominantly with high-potency concentrates, dabs, or high-THC flower.',
      detailEs: 'Historial de consumo regular de cannabinoides (diario o varias veces por semana) durante más de 1 año antes del inicio, predominantemente con concentrados, dabs o flores de alto THC.'
    },
    {
      id: 'cyclic_vomiting',
      nameEn: 'Recurrent Episodes of Intractable Nausea & Vomiting',
      nameEs: 'Episodios Recurrentes de Náuseas y Vómitos Intratables',
      detailEn: 'Stereotypical cyclic episodes of intense nausea and explosive vomiting (often 5 to 15+ episodes per hour) accompanied by colicky periumbilical abdominal pain, with symptom-free intervening periods.',
      detailEs: 'Episodios cíclicos estereotipados de náuseas intensas y vómitos explosivos (con frecuencia de 5 a más de 15 episodios por hora) acompañados de dolor abdominal tipo cólico, con períodos asintomáticos intermedios.'
    },
    {
      id: 'scald_seeking',
      nameEn: 'Compulsive Hot Water Bathing / Showering ("Scald-Seeking")',
      nameEs: 'Baños o Duchas Calientes Compulsivas ("Búsqueda de Calor")',
      detailEn: 'Pathognomonic learned behavior where patients spend hours under scalding hot water for temporary symptom relief. Heat activates peripheral cutaneous TRPV1 vanilloid receptors, counteracting dysregulated hypothalamic and enteric CB1 signaling.',
      detailEs: 'Comportamiento aprendido patognomónico donde los pacientes pasan horas bajo agua muy caliente para alivio temporal. El calor activa receptores vaniloides TRPV1 cutáneos periféricos, contrarrestando la disfunción de señalización hipotalámica y entérica.'
    },
    {
      id: 'cessation_resolution',
      nameEn: 'Complete Resolution Following Sustained Cannabinoid Cessation',
      nameEs: 'Resolución Completa tras la Interrupción Sostenida de Cannabinoides',
      detailEn: 'The definitive diagnostic test: absolute cessation of all exogenous phytocannabinoids and synthetic cannabinoids leads to permanent cessation of cyclical hyperemesis once CB1 receptors upregulate (typically 30 to 90 days).',
      detailEs: 'La prueba diagnóstica definitiva: la suspensión absoluta de todo cannabinoide vegetal y sintético conduce a la resolución permanente de la hiperémesis una vez que los receptores CB1 se restablecen (habitualmente 30 a 90 días).'
    }
  ],
  phases: [
    {
      phaseId: 'prodromal',
      titleEn: '1. Prodromal Phase (Months to Years)',
      titleEs: '1. Fase Prodrómica (Meses a Años)',
      symptomsEn: 'Early morning nausea, fear of vomiting, vague epigastric discomfort, and loss of appetite. Patients frequently fall into the paradoxical trap: increasing cannabis consumption believing it will treat their nausea, which worsens receptor saturation.',
      symptomsEs: 'Náuseas matutinas tempranas, temor al vómito, molestia epigástrica difusa y pérdida de apetito. Los pacientes caen con frecuencia en la trampa paradójica: aumentan el consumo de cannabis creyendo tratar las náuseas, acelerando la saturación de receptores.'
    },
    {
      phaseId: 'hyperemetic',
      titleEn: '2. Hyperemetic Phase (Acute Crisis: 24–48+ Hours)',
      titleEs: '2. Fase Hiperemética (Crisis Aguda: 24–48+ Horas)',
      symptomsEn: 'Incessant, violent vomiting, severe diffuse abdominal pain, profuse sweating, dehydration, and compulsive hot showering. Patients often present to emergency departments and undergo repeated unrevealing scans and laboratory workups.',
      symptomsEs: 'Vómitos incesantes e intensos, dolor abdominal difuso severo, sudoración profusa, deshidratación y necesidad compulsiva de duchas calientes. Los pacientes suelen acudir a urgencias sometiéndose a múltiples pruebas diagnósticas sin hallazgos patológicos.'
    },
    {
      phaseId: 'recovery',
      titleEn: '3. Recovery Phase (Days to Months)',
      titleEs: '3. Fase de Recuperación (Días a Meses)',
      symptomsEn: 'Begins after complete cannabinoid cessation. Nausea subsides, normal appetite and weight return, and compulsive bathing habits cease. Resumption of cannabis at any point, even months later, almost universally triggers a relapse.',
      symptomsEs: 'Comienza tras la interrupción absoluta de cannabinoides. Las náuseas remiten, se normaliza el apetito y el peso, y cesan las duchas compulsivas. Retomar el cannabis en cualquier momento, incluso meses después, casi invariablemente reactiva las crisis.'
    }
  ]
};

export const CHS_ACUTE_TREATMENT_GUIDELINES = {
  titleEn: 'Acute Emergency & Urgent Care Protocol: The Antiemetic Failure Paradox',
  titleEs: 'Protocolo de Emergencia y Urgencias: La Paradoja de Ineficacia Antiemética',
  antiemeticFailureNoticeEn: 'CRITICAL CLINICAL PEARL: Standard first-line antiemetics (Ondansetron/Zofran, Metoclopramide/Reglan, Promethazine/Phenergan) are notoriously INEFFECTIVE for acute CHS hyperemetic crises. CHS is not mediated by standard 5-HT3 pathways. Repeated administration wastes critical time while patients dehydrate.',
  antiemeticFailureNoticeEs: 'PERLA CLÍNICA FUNDAMENTAL: Los antieméticos convencionales (Ondansetrón/Zofran, Metoclopramida/Reglan, Prometazina/Phenergan) son reconocidamente INEFICACES en las crisis hipereméticas de SHC. El SHC no depende de vías 5-HT3 ordinarias. Repetir dosis posterga la estabilización y agrava la deshidratación.',
  firstLineTherapies: [
    {
      nameEn: 'Topical Capsaicin 0.025% – 0.075% Cream',
      nameEs: 'Crema Tópica de Capsaicina 0.025% – 0.075%',
      mechanismEn: 'Potent TRPV1 receptor agonist. Capsaicin mimics the thermal sensation of scalding hot water by activating and subsequently desensitizing peripheral cutaneous TRPV1 vanilloid receptors on abdominal sensory nerves, interrupting central nociceptive emetic signaling.',
      mechanismEs: 'Potente agonista de receptores TRPV1. La capsaicina reproduce el estímulo térmico del agua muy caliente al activar y posteriormente desensibilizar los receptores vaniloides TRPV1 cutáneos del abdomen, interrumpiendo la señal emetogénica central.',
      applicationEn: 'Apply a thin layer (approximately 1–2 grams) over the periumbilical abdomen or back. Onset of relief is typically 20 to 45 minutes.',
      applicationEs: 'Aplique una capa delgada (aproximadamente 1–2 gramos) en la zona periumbilical del abdomen o espalda. El alivio suele iniciar en 20 a 45 minutos.',
      safetyEn: 'Mandatory: Wear protective gloves or wash hands thoroughly with soap immediately. Do NOT touch eyes, face, or mucous membranes. Do not apply immediately after hot bathing when cutaneous capillaries are dilated.',
      safetyEs: 'Obligatorio: Use guantes o lávese las manos minuciosamente con agua y jabón de inmediato. NO toque ojos, rostro ni mucosas. No aplique inmediatamente después de bañarse con agua caliente con capilares vasodilatados.'
    },
    {
      nameEn: 'Dopamine D2 & 5-HT2A Antagonists (Haloperidol / Droperidol)',
      nameEs: 'Antagonistas Dopaminérgicos D2 y 5-HT2A (Haloperidol / Droperidol)',
      mechanismEn: 'Central dopamine receptor blockade in the chemoreceptor trigger zone (CTZ) and area postrema. Multiple clinical trials demonstrate haloperidol (2.5 to 5 mg IV/IM) or droperidol (0.625 to 2.5 mg IV/IM) rapidly aborts cyclic vomiting, terminates acute hyperemetic distress, and significantly reduces hospital stays.',
      mechanismEs: 'Bloqueo dopaminérgico central en la zona gatillo quimiorreceptora y el área postrema. Ensayos clínicos demuestran que el haloperidol (2.5 a 5 mg IV/IM) o droperidol (0.625 a 2.5 mg IV/IM) aborta rápidamente los vómitos cíclicos y reduce estancias hospitalarias.',
      applicationEn: 'Administered under medical supervision in an urgent care or emergency department setting, with cardiac QTc monitoring if indicated.',
      applicationEs: 'Administrado bajo supervisión médica en urgencias, con monitorización del intervalo QTc si está clínicamente indicado.',
      safetyEn: 'Provides anxiolysis and breaks the cyclic vomiting loop where conventional antiemetics fail.',
      safetyEs: 'Proporciona ansiolisis y rompe el bucle de vómitos cíclicos donde los antieméticos convencionales fracasan.'
    },
    {
      nameEn: 'Aggressive IV Fluid & Electrolyte Resuscitation',
      nameEs: 'Rehidratación Intravenosa Intensiva y Reposición Electrolítica',
      mechanismEn: 'Volume expansion with isotonic crystalloids (Lactated Ringer’s or Normal Saline) to prevent pre-renal acute kidney injury and hypovolemic shock.',
      mechanismEs: 'Expansión de volumen con cristaloides isotónicos (Ringer Lactato o Solución Salina) para prevenir lesión renal aguda prerrenal y shock hipovolémico.',
      applicationEn: 'Rapid IV bolus followed by maintenance fluids with urgent potassium and magnesium replacement to correct hypokalemic metabolic alkalosis.',
      applicationEs: 'Bolo IV rápido seguido de sueroterapia de mantenimiento con reposición urgente de potasio y magnesio para corregir la alcalosis metabólica hipopotasémica.',
      safetyEn: 'Avoid large volumes of plain oral water during active vomiting, which worsens gastric distension and dilutes serum sodium.',
      safetyEs: 'Evite grandes volúmenes de agua simple por vía oral durante el vómito activo, ya que distiende el estómago y diluye el sodio sérico.'
    }
  ]
};

export const CHS_EMERGENCY_RED_FLAGS = [
  {
    flagId: 'aki',
    severity: 'emergency',
    titleEn: 'Severe Dehydration & Acute Kidney Injury (AKI)',
    titleEs: 'Deshidratación Grave y Lesión Renal Aguda (LRA)',
    symptomsEn: 'Dark amber or brown urine, no urination for more than 12 hours, severe dizziness when standing (orthostatic syncope), dry tongue, and sunken eyes.',
    symptomsEs: 'Orina oscura o marrón, ausencia de micción durante más de 12 horas, mareos intensos al ponerse de pie (síncope ortostático), lengua seca y ojos hundidos.',
    actionEn: 'Immediate Emergency Department (911) care required. High-grade vomiting causes acute tubular necrosis and elevated creatinine.',
    actionEs: 'Atención urgente en Emergencias (911). Los vómitos severos causan necrosis tubular aguda y elevación de creatinina.'
  },
  {
    flagId: 'hypokalemia_arrhythmia',
    severity: 'emergency',
    titleEn: 'Severe Hypokalemia & Cardiac Arrhythmias',
    titleEs: 'Hipopotasemia Severa y Arritmias Cardíacas',
    symptomsEn: 'Severe muscle cramping or spasms (tetany), flutter or palpitations in chest, profound generalized weakness, and numbness in fingers/toes.',
    symptomsEs: 'Calambres musculares o espasmos severos (tetania), palpitaciones o aleteo en el pecho, debilidad generalizada profunda y entumecimiento en dedos.',
    actionEn: 'Immediate medical evaluation. Gastric hydrochloric acid and potassium loss triggers fatal ventricular arrhythmias.',
    actionEs: 'Evaluación médica inmediata. La pérdida gástrica de ácido y potasio puede desencadenar arritmias ventriculares graves.'
  },
  {
    flagId: 'mallory_weiss',
    severity: 'emergency',
    titleEn: 'Mallory-Weiss Tear or Boerhaave Syndrome',
    titleEs: 'Desgarro de Mallory-Weiss o Síndrome de Boerhaave',
    symptomsEn: 'Vomiting bright red blood, dark "coffee-ground" emesis, or sudden severe tearing chest/back pain during forceful retching.',
    symptomsEs: 'Vómito con sangre roja brillante, material oscuro en "poso de café", o dolor desgarrante repentino en pecho/espalda durante arcadas violentas.',
    actionEn: 'Immediate 911 activation. Violent retching lacerates the gastroesophageal junction mucosa, requiring urgent endoscopic hemostasis.',
    actionEs: 'Activación inmediata del 911. Las arcadas violentas laceran la unión gastroesofágica y requieren hemostasia endoscópica urgente.'
  },
  {
    flagId: 'scald_burns',
    severity: 'urgent',
    titleEn: 'Severe Scald Burns from Compulsive Bathing',
    titleEs: 'Quemaduras Graves por Agua Hirviendo en Baños Compulsivos',
    symptomsEn: 'Blistering skin, peeling, intense redness, or numbness on back, shoulders, or legs from repeated extreme temperature water exposure.',
    symptomsEs: 'Ampollas en la piel, descamación, enrojecimiento intenso o insensibilidad en hombros, espalda o piernas por agua a temperaturas extremas.',
    actionEn: 'Lower water heater thermostat below 120°F (49°C). Switch to topical capsaicin cream under medical guidance to avoid catastrophic thermal injury.',
    actionEs: 'Baje el termostato del calentador de agua por debajo de 49°C. Cambie a capsaicina tópica bajo guía clínica para evitar lesiones térmicas.'
  },
  {
    flagId: 'synthetic_cannabinoids',
    severity: 'emergency',
    titleEn: 'Synthetic Cannabinoid ("K2" / "Spice") Toxidrome',
    titleEs: 'Toxidrome por Cannabinoides Sintéticos ("K2" / "Spice")',
    symptomsEn: 'Extreme agitation, acute paranoia, hallucinations, seizures, malignant chest pain, heart rate >140 bpm, or unresponsiveness.',
    symptomsEs: 'Agitación extrema, paranoia aguda, alucinaciones, convulsiones, dolor precordial severo, frecuencia cardíaca >140 lpm o falta de respuesta.',
    actionEn: 'Immediate 911 activation. Synthetic cannabinoids are full agonists with up to 100x potency of THC and lethal cardiovascular toxicity.',
    actionEs: 'Activación inmediata del 911. Los cannabinoides sintéticos son agonistas totales con hasta 100 veces la potencia de THC y letalidad cardiovascular.'
  }
];

export const CANNABINOID_WITHDRAWAL_AND_RECOVERY = {
  titleEn: 'The 90-Day CB1 Receptor Upregulation Timeline & Cannabis Withdrawal Care',
  titleEs: 'Cronograma de 90 Días de Recuperación de Receptores CB1 y Manejo de la Abstinencia',
  timeline: [
    {
      periodEn: 'Days 1 to 3: Acute Rebound & Onset',
      periodEs: 'Días 1 a 3: Rebote Agudo e Inicio',
      descriptionEn: 'Peak nausea and gut hypersensitivity as exogenous cannabinoids clear. Appetite is minimal. Focus on electrolyte hydration, ice chips, capsaicin cream, and small bland meals (BRAT diet: bananas, rice, applesauce, toast).',
      descriptionEs: 'Pico de náuseas e hipersensibilidad gástrica mientras se eliminan los cannabinoides. Apetito mínimo. Priorice hidratación con electrolitos, hielo picado, capsaicina y alimentos suaves (dieta BRAT: plátano, arroz, compota, tostadas).'
    },
    {
      periodEn: 'Days 4 to 14: Peak Cannabis Withdrawal Syndrome (CWS)',
      periodEs: 'Días 4 a 14: Pico del Síndrome de Abstinencia de Cannabis (SAC)',
      descriptionEn: 'Intense REM rebound with vivid disturbing dreams, insomnia, irritability, sweats, and somatic restlessness. Emesis typically ceases completely during this window as stomach motility begins stabilizing.',
      descriptionEs: 'Intenso rebote de sueño REM con sueños vívidos e inquietantes, insomnio, irritabilidad, sudores y agitación somática. Los vómitos suelen remitir por completo en este período al estabilizarse la motilidad gástrica.'
    },
    {
      periodEn: 'Weeks 3 to 6: Motility Normalization & Appetite Surge',
      periodEs: 'Semanas 3 a 6: Normalización de Motilidad y Aumento de Apetito',
      descriptionEn: 'Significant clinical improvement. Return of natural hunger cues and weight stabilization. Compulsive urges for hot showers vanish completely. Sleep latency improves.',
      descriptionEs: 'Mejoría clínica notable. Retorno de las señales naturales de apetito y estabilización de peso. Desaparece la necesidad compulsiva de duchas calientes. Mejora la conciliación del sueño.'
    },
    {
      periodEn: 'Weeks 6 to 12: Full CB1 Neuro-Receptor Upregulation',
      periodEs: 'Semanas 6 a 12: Normalización Total de Receptores Neuro-Entéricos CB1',
      descriptionEn: 'Central and enteric CB1 receptors return to baseline density and physiological sensitivity. Mood stabilizes and cognitive clarity recovers. Crucial warning: Even a single subsequent use of THC or CBD can instantly reset receptor dysregulation and trigger a full hyperemetic relapse.',
      descriptionEs: 'Los receptores CB1 centrales y entéricos recuperan su densidad basal y sensibilidad fisiológica. El estado de ánimo y la memoria mejoran. Advertencia vital: Incluso un único consumo posterior de THC o CBD puede reactivar la hiperémesis de forma fulminante.'
    }
  ],
  supportiveMedications: [
    {
      nameEn: 'Trazodone (25–50 mg) or Melatonin (3–5 mg)',
      nameEs: 'Trazodona (25–50 mg) o Melatonina (3–5 mg)',
      roleEn: 'Non-addictive sleep stabilization for severe rebound insomnia during weeks 1–3 without respiratory depression or abuse liability.',
      roleEs: 'Estabilización del sueño no adictiva para el insomnio de rebote durante las semanas 1 a 3, sin riesgo de dependencia ni depresión respiratoria.'
    },
    {
      nameEn: 'Hydroxyzine (25–50 mg PRN)',
      nameEs: 'Hidroxizina (25–50 mg según necesidad)',
      roleEn: 'Antihistaminergic agent that calms somatic autonomic restlessness, hyperhidrosis (sweats), and visceral stomach hyperalgesia.',
      roleEs: 'Agente antihistamínico que calma la inquietud autonómica, sudoración y la hiperalgesia visceral digestiva.'
    },
    {
      nameEn: 'N-Acetylcysteine (NAC 1,200 mg BID)',
      nameEs: 'N-Acetilcisteína (NAC 1,200 mg dos veces al día)',
      roleEn: 'Restores cortical glutamate homeostasis and cystine-glutamate antiporter function, proven in clinical trials to reduce cannabis cravings.',
      roleEs: 'Restaura la homeostasis del glutamato cortical y el transportador cistina-glutamato, demostrado en ensayos para atenuar los deseos de consumo.'
    }
  ]
};

// ============================================================================
// CLINICAL EVALUATION FUNCTIONS (100% IN-RAM EPHEMERAL STATE)
// ============================================================================

/**
 * Evaluates CHS risk and clinical stage based on user symptoms.
 */
export function evaluateChsRisk(answers = {}) {
  const {
    heavyUse = false,
    cyclicVomiting = false,
    hotShowers = false,
    morningNausea = false,
    ondansetronFailed = false,
    cannabisDuration = 'less_than_year'
  } = answers;

  let score = 0;
  if (heavyUse) score += 2;
  if (cannabisDuration === 'more_than_year') score += 2;
  if (cyclicVomiting) score += 3;
  if (hotShowers) score += 3;
  if (morningNausea) score += 1;
  if (ondansetronFailed) score += 2;

  let riskLevel = 'low';
  let categoryEn = 'Low Probability of CHS';
  let categoryEs = 'Baja Probabilidad de SHC';
  let recommendationEn = 'Symptoms are less characteristic of Cannabinoid Hyperemesis Syndrome. Continue to evaluate for other gastroenterological or infectious causes.';
  let recommendationEs = 'Los síntomas son menos característicos del Síndrome de Hiperémesis Cannabinoide. Considere otras causas gastroenterológicas o infecciosas.';

  if (score >= 8) {
    riskLevel = 'high_chs';
    categoryEn = 'High Clinical Probability of Cannabinoid Hyperemesis Syndrome (CHS)';
    categoryEs = 'Alta Probabilidad Clínica de Síndrome de Hiperémesis Cannabinoide (SHC)';
    recommendationEn = 'Classic Rome IV presentation. Pathognomonic triad present (heavy use, cyclic emesis, hot water relief). Standard antiemetics fail; complete cessation of all cannabinoids is the only curative intervention.';
    recommendationEs = 'Presentación clásica según Roma IV. Tríada patognomónica presente. Los antieméticos comunes fracasan; la abstinencia total de cannabinoides es la única cura definitiva.';
  } else if (score >= 5) {
    riskLevel = 'prodromal_or_probable';
    categoryEn = 'Probable CHS or Prodromal Phase';
    categoryEs = 'SHC Probable o Fase Prodrómica';
    recommendationEn = 'Patient demonstrates key features of cannabinoid-induced gut dysmotility. Immediate cessation of high-potency concentrates is strongly recommended before transition to violent cyclic hyperemesis.';
    recommendationEs = 'Muestra signos clave de alteración de motilidad por cannabinoides. Se aconseja suspender de inmediato los concentrados de alta potencia antes de derivar en crisis hipereméticas.';
  }

  return { score, riskLevel, categoryEn, categoryEs, recommendationEn, recommendationEs };
}

/**
 * Evaluates emergency red flags for life-threatening complications.
 */
export function evaluateChsEmergencyRedFlags(selectedFlags = []) {
  const flags = CHS_EMERGENCY_RED_FLAGS.filter(f => selectedFlags.includes(f.flagId));
  const hasEmergency = flags.some(f => f.severity === 'emergency');
  const hasUrgent = flags.some(f => f.severity === 'urgent');

  return {
    flags,
    hasEmergency,
    hasUrgent,
    requires911: hasEmergency
  };
}

// In-RAM Ephemeral State
let cannabisCareState = {
  currentTab: 'screener',
  heavyUse: false,
  cannabisDuration: 'more_than_year',
  cyclicVomiting: false,
  hotShowers: false,
  morningNausea: false,
  ondansetronFailed: false,
  selectedRedFlags: [],
  concentrateType: 'flower',
  usedCapsaicin: false,
  checklistStopCannabis: false,
  checklistAvoidZofran: false,
  checklistElectrolyteHydration: false,
  checklistCapsaicinPrecaution: false
};

export function getCannabisState() {
  return { ...cannabisCareState };
}

export function setCannabisState(updates) {
  cannabisCareState = { ...cannabisCareState, ...updates };
  return getCannabisState();
}

export function resetCannabisState() {
  cannabisCareState = {
    currentTab: 'screener',
    heavyUse: false,
    cannabisDuration: 'more_than_year',
    cyclicVomiting: false,
    hotShowers: false,
    morningNausea: false,
    ondansetronFailed: false,
    selectedRedFlags: [],
    concentrateType: 'flower',
    usedCapsaicin: false,
    checklistStopCannabis: false,
    checklistAvoidZofran: false,
    checklistElectrolyteHydration: false,
    checklistCapsaicinPrecaution: false
  };
  return getCannabisState();
}

/**
 * Formats a privacy-first, zero-PII summary for patient-doctor or emergency room discussion.
 */
export function formatCannabisSummaryText(state, lang = 'en') {
  const isEs = lang === 'es';
  const evaluation = evaluateChsRisk(state);
  const emergencyCheck = evaluateChsEmergencyRedFlags(state.selectedRedFlags || []);

  const lines = [];
  lines.push(isEs
    ? '=== HARBORPATH: RESUMEN CLÍNICO DE HIPERÉMESIS CANNABINOIDE Y CUIDADO DE SALUD ==='
    : '=== HARBORPATH: CANNABINOID HYPEREMESIS SYNDROME (CHS) & CLINICAL SUMMARY ===');
  lines.push(isEs
    ? 'Aviso de Privacidad: 100% en memoria RAM. Cero almacenamiento en dispositivo ni rastreo de PII.'
    : 'Privacy Notice: 100% ephemeral in-RAM. Zero device persistence, zero PII.');
  lines.push('');

  lines.push(isEs ? '--- 1. EVALUACIÓN DIAGNÓSTICA (ROMA IV) ---' : '--- 1. DIAGNOSTIC ASSESSMENT (ROME IV) ---');
  lines.push(`${isEs ? 'Categoría' : 'Category'}: ${isEs ? evaluation.categoryEs : evaluation.categoryEn}`);
  lines.push(`${isEs ? 'Puntuación' : 'Score'}: ${evaluation.score}/11 (${evaluation.riskLevel})`);
  lines.push(`${isEs ? 'Recomendación' : 'Clinical Guidance'}: ${isEs ? evaluation.recommendationEs : evaluation.recommendationEn}`);
  lines.push('');

  lines.push(isEs ? '--- 2. PARÁMETROS DEL PACIENTE ---' : '--- 2. REPORTED CLINICAL PARAMETERS ---');
  lines.push(`${isEs ? 'Consumo frecuente (>1 año)' : 'Heavy/Regular use (>1 year)'}: ${state.heavyUse ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`);
  lines.push(`${isEs ? 'Episodios de vómitos cíclicos' : 'Cyclic vomiting episodes'}: ${state.cyclicVomiting ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`);
  lines.push(`${isEs ? 'Alivio con baños/duchas calientes' : 'Relief with hot showers/baths'}: ${state.hotShowers ? (isEs ? 'Sí (Patognomónico)' : 'Yes (Pathognomonic)') : (isEs ? 'No' : 'No')}`);
  lines.push(`${isEs ? 'Ineficacia de antieméticos (Zofran)' : 'Antiemetic failure (Ondansetron)'}: ${state.ondansetronFailed ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`);
  lines.push(`${isEs ? 'Tipo de producto predominante' : 'Predominant product type'}: ${state.concentrateType}`);
  lines.push('');

  if (emergencyCheck.flags.length > 0) {
    lines.push(isEs ? '--- 3. ALERTAS DE EMERGENCIA Y BANDERAS ROJAS ---' : '--- 3. CRITICAL EMERGENCY RED FLAGS ---');
    for (const f of emergencyCheck.flags) {
      lines.push(`- [${f.severity.toUpperCase()}] ${isEs ? f.titleEs : f.titleEn}: ${isEs ? f.actionEs : f.actionEn}`);
    }
    lines.push('');
  }

  lines.push(isEs ? '--- 4. DIRECTRICES DE MANEJO AGUDO ---' : '--- 4. ACUTE CLINICAL PEARLS & INTERVENTIONS ---');
  lines.push(isEs
    ? '- Los antieméticos convencionales (ondansetrón, metoclopramida) fracasan habitualmente.'
    : '- Conventional 5-HT3 antiemetics (ondansetron, metoclopramide) routinely fail.');
  lines.push(isEs
    ? '- Primera línea recomendada: Capsaicina tópica 0.025%-0.075% en abdomen periumbilical + Haloperidol (2.5-5 mg IV/IM).'
    : '- Evidence-based first line: Topical capsaicin 0.025%-0.075% on abdomen + Haloperidol (2.5-5 mg IV/IM) or Droperidol.');
  lines.push(isEs
    ? '- La abstinencia completa y absoluta de todo cannabinoide durante 30 a 90 días es la única cura definitiva.'
    : '- Complete and permanent cessation of all cannabinoids for 30 to 90 days is the only definitive curative treatment.');
  lines.push('');

  lines.push('================================================================');
  lines.push(isEs
    ? 'Documento informativo para el equipo de salud. No sustituye el juicio médico de emergencia.'
    : 'Clinical educational summary for care team dialogue. Does not replace emergency clinical judgment.');

  return lines.join('\n');
}

// ============================================================================
// VIEW COMPONENT & DOM RENDERING
// ============================================================================

export function cannabisCareView() {
  const container = h('div', { class: 'view cannabis-care-view' });

  function reRender() {
    clear(container);
    container.appendChild(renderCannabisCareViewContent());
  }

  container.appendChild(renderCannabisCareViewContent());
  return container;
}

function renderCannabisCareViewContent() {
  const isEs = getLang() === 'es';
  const localState = getCannabisState();

  const wrapper = h('div', { class: 'cannabis-care-container' });

  // Header
  const header = h('header', { class: 'view-header' }, [
    h('div', { class: 'view-header-badge' }, [
      icon('alert-triangle'),
      h('span', {}, isEs ? 'Toxicología y Gastroenterología Clínica' : 'Clinical Toxicology & Gastroenterology')
    ]),
    h('h1', { class: 'view-title' }, isEs
      ? 'Síndrome de Hiperémesis Cannabinoide (SHC) y Cuidado de Concentrados'
      : 'Cannabinoid Hyperemesis Syndrome (CHS) & Concentrates Navigator'),
    h('p', { class: 'view-description text-muted' }, isEs
      ? 'Orientación clínica basada en evidencia (Criterios Roma IV, ACMT y ACEP) para náuseas y vómitos cíclicos, baños calientes compulsivos, capsaicina tópica, ineficacia de Zofran y recuperación del receptor CB1.'
      : 'Evidence-based clinical guidance (Rome IV, ACMT & ACEP standards) for cyclic vomiting, compulsive hot bathing, topical capsaicin protocols, antiemetic failure, and 90-day CB1 receptor recovery.')
  ]);
  wrapper.appendChild(header);

  // Tabs
  const tabList = [
    { id: 'screener', labelEn: 'CHS Screener & Triage', labelEs: 'Evaluador y Triaje SHC', iconName: 'activity' },
    { id: 'acute', labelEn: 'Acute Emergency Protocol', labelEs: 'Protocolo de Urgencias', iconName: 'shield' },
    { id: 'recovery', labelEn: '90-Day CB1 Timeline', labelEs: 'Recuperación CB1 (90 Días)', iconName: 'clock' },
    { id: 'concentrates', labelEn: 'Dabs & Synthetic Risks', labelEs: 'Dabs y Sintéticos', iconName: 'alert-circle' }
  ];

  const tabsNav = h('nav', { class: 'tabs-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Hiperémesis' : 'CHS Care Tabs' });
  for (const tInfo of tabList) {
    const isActive = localState.currentTab === tInfo.id;
    const tabBtn = h('button', {
      class: `tab-btn ${isActive ? 'active' : ''}`,
      role: 'tab',
      'aria-selected': isActive ? 'true' : 'false',
      onclick: () => {
        setCannabisState({ currentTab: tInfo.id });
        const parent = tabsNav.closest('.cannabis-care-view');
        if (parent) {
          clear(parent);
          parent.appendChild(renderCannabisCareViewContent());
        }
      }
    }, [
      icon(tInfo.iconName),
      h('span', {}, isEs ? tInfo.labelEs : tInfo.labelEn)
    ]);
    tabsNav.appendChild(tabBtn);
  }
  wrapper.appendChild(tabsNav);

  // Tab Content Container
  const contentArea = h('div', { class: 'tab-content-area', role: 'tabpanel' });

  if (localState.currentTab === 'screener') {
    contentArea.appendChild(renderScreenerTab(localState, isEs));
  } else if (localState.currentTab === 'acute') {
    contentArea.appendChild(renderAcuteTab(localState, isEs));
  } else if (localState.currentTab === 'recovery') {
    contentArea.appendChild(renderRecoveryTab(localState, isEs));
  } else {
    contentArea.appendChild(renderConcentratesTab(localState, isEs));
  }

  wrapper.appendChild(contentArea);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 1: SCREENER & TRIAGE
// ----------------------------------------------------------------------------

function renderScreenerTab(localState, isEs) {
  const wrapper = h('div', { class: 'screener-tab' });

  function reRender() {
    const parent = wrapper.closest('.cannabis-care-view');
    if (parent) {
      clear(parent);
      parent.appendChild(renderCannabisCareViewContent());
    }
  }

  // Emergency Red Flags Checklist
  const redFlagsCard = h('section', { class: 'card emergency-card' }, [
    h('h2', { class: 'card-title alert-title' }, [
      icon('alert-octagon'),
      h('span', {}, isEs ? 'Detección Inmediata de Complicaciones Graves' : 'Critical Complications & Emergency Red Flags')
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'Marque cualquier síntoma de emergencia que esté experimentando actualmente para evaluación inmediata:'
      : 'Check any emergency symptoms currently present for immediate clinical escalation:')
  ]);

  const flagsList = h('div', { class: 'red-flags-list' });
  for (const flag of CHS_EMERGENCY_RED_FLAGS) {
    const isChecked = localState.selectedRedFlags.includes(flag.flagId);
    const item = h('label', { class: `checkbox-label flag-item ${isChecked ? 'flag-active' : ''}` }, [
      h('input', {
        type: 'checkbox',
        checked: isChecked,
        onchange: (e) => {
          let updated = [...localState.selectedRedFlags];
          if (e.target.checked) {
            updated.push(flag.flagId);
          } else {
            updated = updated.filter(id => id !== flag.flagId);
          }
          setCannabisState({ selectedRedFlags: updated });
          reRender();
        }
      }),
      h('div', { class: 'flag-text' }, [
        h('strong', { class: flag.severity === 'emergency' ? 'text-danger' : 'text-warning' },
          `[${flag.severity.toUpperCase()}] ${isEs ? flag.titleEs : flag.titleEn}`),
        h('p', { class: 'fine-print' }, isEs ? flag.symptomsEs : flag.symptomsEn),
        h('p', { class: 'action-advice' }, isEs ? flag.actionEs : flag.actionEn)
      ])
    ]);
    flagsList.appendChild(item);
  }
  redFlagsCard.appendChild(flagsList);
  wrapper.appendChild(redFlagsCard);

  // Screener Questions Card
  const screenerCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('help-circle'),
      h('span', {}, isEs ? 'Cuestionario de Evaluación Clínica (Criterios Roma IV)' : 'Clinical Diagnostic Questionnaire (Rome IV Criteria)')
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'Evalúe sus síntomas para identificar si el patrón coincide con el Síndrome de Hiperémesis Cannabinoide:'
      : 'Assess your symptoms to determine clinical alignment with Cannabinoid Hyperemesis Syndrome:')
  ]);

  const formGrid = h('div', { class: 'cannabis-form-grid' });

  // Question 1: Duration
  const qDuration = h('div', { class: 'form-group' }, [
    h('label', { class: 'form-label' }, isEs ? '1. Duración y frecuencia de consumo de cannabis:' : '1. Cannabis use duration & frequency:'),
    h('select', {
      class: 'form-select',
      value: localState.cannabisDuration,
      onchange: (e) => {
        setCannabisState({
          cannabisDuration: e.target.value,
          heavyUse: e.target.value === 'more_than_year'
        });
        reRender();
      }
    }, [
      h('option', { value: 'more_than_year' }, isEs ? 'Frecuente / Diario durante más de 1 año (Mayor riesgo)' : 'Daily or multiple times/week for >1 year (High Risk)'),
      h('option', { value: 'less_than_year' }, isEs ? 'Consumo regular desde hace menos de 1 año' : 'Regular use for less than 1 year'),
      h('option', { value: 'sporadic' }, isEs ? 'Consumo esporádico u ocasional (pocas veces al mes)' : 'Sporadic or occasional use')
    ])
  ]);
  formGrid.appendChild(qDuration);

  // Question 2: Product Type
  const qType = h('div', { class: 'form-group' }, [
    h('label', { class: 'form-label' }, isEs ? '2. Tipo principal de producto consumido:' : '2. Primary cannabinoid product format:'),
    h('select', {
      class: 'form-select',
      value: localState.concentrateType,
      onchange: (e) => {
        setCannabisState({ concentrateType: e.target.value });
        reRender();
      }
    }, [
      h('option', { value: 'dabs_wax' }, isEs ? 'Dabs / Cera / Resina viva / Shatter (75%–99% THC)' : 'Dabs / Wax / Live Resin / Shatter (75%–99% THC)'),
      h('option', { value: 'vape_cartridges' }, isEs ? 'Cartuchos de Vapeo / Destilados (80%–95% THC)' : 'Vape Cartridges / Distillate (80%–95% THC)'),
      h('option', { value: 'edibles' }, isEs ? 'Comestibles de alta potencia / Tinturas' : 'High-dose Edibles / Tinctures'),
      h('option', { value: 'flower' }, isEs ? 'Flor tradicional fumada (15%–30% THC)' : 'Traditional smoked flower (15%–30% THC)'),
      h('option', { value: 'synthetic' }, isEs ? 'Cannabinoides Sintéticos ("K2", "Spice", etc.)' : 'Synthetic Cannabinoids ("K2", "Spice")')
    ])
  ]);
  formGrid.appendChild(qType);

  screenerCard.appendChild(formGrid);

  // Symptom Checkboxes
  const checkGrid = h('div', { class: 'checkboxes-grid' }, [
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.cyclicVomiting,
        onchange: (e) => {
          setCannabisState({ cyclicVomiting: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs
        ? 'Náuseas y vómitos cíclicos: He tenido episodios repetidos de vómitos intensos seguidos de semanas o meses sin síntomas'
        : 'Cyclic vomiting: I have recurrent episodes of intractable vomiting separated by symptom-free intervals')
    ]),
    h('label', { class: 'checkbox-label highlight-checkbox' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.hotShowers,
        onchange: (e) => {
          setCannabisState({ hotShowers: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs
        ? 'Alivio térmico compulsivo: Tomo duchas o baños con agua MUY caliente repetidamente porque es lo único que alivia las náuseas'
        : 'Compulsive hot showers: I take repeated, scalding hot showers/baths because heat is the only thing providing relief')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.morningNausea,
        onchange: (e) => {
          setCannabisState({ morningNausea: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs
        ? 'Náuseas matutinas: Siento náuseas o arcadas al despertar y solía consumir más cannabis creyendo calmar mi estómago'
        : 'Morning nausea: I experience early morning nausea and used to consume more cannabis thinking it helped my stomach')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.ondansetronFailed,
        onchange: (e) => {
          setCannabisState({ ondansetronFailed: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs
        ? 'Fracaso de antieméticos: Me han administrado medicamentos comunes como Zofran (ondansetrón) o Reglan con poco o ningún alivio'
        : 'Antiemetic failure: Standard medications like Zofran (ondansetron) or Reglan provided little to no relief')
    ])
  ]);
  screenerCard.appendChild(checkGrid);

  // Result Evaluation Card
  const result = evaluateChsRisk(localState);
  const resultCard = h('div', { class: `evaluation-result-card ${result.riskLevel}` }, [
    h('div', { class: 'result-header' }, [
      icon(result.riskLevel === 'high_chs' ? 'alert-triangle' : 'info'),
      h('h3', {}, isEs ? result.categoryEs : result.categoryEn)
    ]),
    h('p', { class: 'result-description' }, isEs ? result.recommendationEs : result.recommendationEn)
  ]);
  screenerCard.appendChild(resultCard);

  wrapper.appendChild(screenerCard);
  wrapper.appendChild(renderExportSection(localState, isEs, reRender));
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 2: ACUTE EMERGENCY PROTOCOL
// ----------------------------------------------------------------------------

function renderAcuteTab(localState, isEs) {
  const wrapper = h('div', { class: 'acute-tab' });

  // Warning Banner on Zofran Failure
  const warningCard = h('section', { class: 'card alert-banner-card' }, [
    h('div', { class: 'alert-banner-header' }, [
      icon('alert-octagon'),
      h('h2', {}, isEs ? 'La Paradoja Antiemética: ¿Por Qué Falla el Zofran?' : 'The Antiemetic Failure Paradox: Why Zofran Fails')
    ]),
    h('p', {}, isEs
      ? CHS_ACUTE_TREATMENT_GUIDELINES.antiemeticFailureNoticeEs
      : CHS_ACUTE_TREATMENT_GUIDELINES.antiemeticFailureNoticeEn)
  ]);
  wrapper.appendChild(warningCard);

  // First Line Therapies Grid
  const therapiesCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('check-circle'),
      h('span', {}, isEs ? 'Intervenciones Clínicas de Primera Línea Basadas en Evidencia' : 'Evidence-Based First-Line Clinical Interventions')
    ])
  ]);

  const therapiesGrid = h('div', { class: 'therapies-grid' });
  for (const th of CHS_ACUTE_TREATMENT_GUIDELINES.firstLineTherapies) {
    const card = h('div', { class: 'therapy-card' }, [
      h('h3', { class: 'therapy-name' }, isEs ? th.nameEs : th.nameEn),
      h('p', { class: 'therapy-mech' }, [
        h('strong', {}, isEs ? 'Mecanismo: ' : 'Mechanism: '),
        h('span', {}, isEs ? th.mechanismEs : th.mechanismEn)
      ]),
      h('p', { class: 'therapy-app' }, [
        h('strong', {}, isEs ? 'Aplicación: ' : 'Protocol: '),
        h('span', {}, isEs ? th.applicationEs : th.applicationEn)
      ]),
      h('div', { class: 'therapy-safety' }, [
        icon('shield'),
        h('span', {}, isEs ? th.safetyEs : th.safetyEn)
      ])
    ]);
    therapiesGrid.appendChild(card);
  }
  therapiesCard.appendChild(therapiesGrid);
  wrapper.appendChild(therapiesCard);

  // Capsaicin Protocol Detailed Guide
  const capsaicinCard = h('section', { class: 'card capsaicin-protocol-card' }, [
    h('h2', { class: 'card-title' }, [
      icon('zap'),
      h('span', {}, isEs ? 'Protocolo de Seguridad para Crema de Capsaicina (TRPV1)' : 'Topical Capsaicin (TRPV1) Application Safety Protocol')
    ]),
    h('ul', { class: 'capsaicin-steps' }, [
      h('li', {}, isEs
        ? 'Dosis habitual: 1 a 2 gramos de crema al 0.025% o 0.075% de venta libre o prescrita.'
        : 'Standard dose: 1 to 2 grams of OTC or Rx 0.025% or 0.075% capsaicin cream.'),
      h('li', {}, isEs
        ? 'Zona de aplicación: Frote suavemente una capa muy delgada en el abdomen periumbilical (alrededor del ombligo) o en la espalda.'
        : 'Application site: Gently massage a thin layer across the periumbilical abdomen (around navel) or upper back.'),
      h('li', {}, isEs
        ? 'Protección obligatoria: Póngase guantes o use una bolsa plástica. Si usa los dedos, lávese inmediatamente con abundante agua y jabón.'
        : 'Mandatory protection: Wear medical gloves. If using bare fingers, immediately scrub hands with warm soapy water.'),
      h('li', {}, isEs
        ? '¡PELIGRO DE CONTACTO CON OJOS!: La capsaicina es el extracto de ají picante. Si se tocan los ojos o mucosas, causa ardor químico intenso.'
        : 'CRITICAL WARNING: Capsaicin is concentrated chili extract. Touching eyes or mucous membranes causes severe chemical irritation.'),
      h('li', {}, isEs
        ? 'No aplicar con calor húmedo: Espere al menos 30 a 60 minutos después de una ducha caliente antes de aplicar capsaicina para evitar sensación excesiva de quemazón.'
        : 'Avoid immediate post-shower use: Wait 30 to 60 minutes after hot bathing before applying capsaicin to prevent intolerable burning.')
    ])
  ]);
  wrapper.appendChild(capsaicinCard);

  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 3: 90-DAY CB1 TIMELINE & RECOVERY
// ----------------------------------------------------------------------------

function renderRecoveryTab(localState, isEs) {
  const wrapper = h('div', { class: 'recovery-tab' });

  // 90-Day Timeline
  const timelineCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('clock'),
      h('span', {}, isEs ? CANNABINOID_WITHDRAWAL_AND_RECOVERY.titleEs : CANNABINOID_WITHDRAWAL_AND_RECOVERY.titleEn)
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'La restitución fisiológica de los receptores CB1 centrales y entéricos requiere de 4 a 12 semanas de abstinencia total:'
      : 'Physiological restoration of central and enteric CB1 receptor density requires 4 to 12 weeks of absolute cannabinoid abstinence:')
  ]);

  const timelineGrid = h('div', { class: 'recovery-timeline-grid' });
  for (const step of CANNABINOID_WITHDRAWAL_AND_RECOVERY.timeline) {
    const stepCard = h('div', { class: 'recovery-timeline-card' }, [
      h('h3', { class: 'timeline-period' }, isEs ? step.periodEs : step.periodEn),
      h('p', { class: 'timeline-desc' }, isEs ? step.descriptionEs : step.descriptionEn)
    ]);
    timelineGrid.appendChild(stepCard);
  }
  timelineCard.appendChild(timelineGrid);
  wrapper.appendChild(timelineCard);

  // Supportive Non-Controlled Pharmacotherapy
  const medsCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('heart'),
      h('span', {}, isEs ? 'Manejo Farmacológico de Soporte para la Abstinencia' : 'Supportive Non-Controlled Pharmacotherapy for Withdrawal')
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'Opciones no controladas para mitigar el insomnio de rebote, sudoración y deseos de consumo sin riesgo de dependencia:'
      : 'Evidence-based non-controlled supportive medications for rebound insomnia, diaphoresis, and cravings:')
  ]);

  const medsList = h('div', { class: 'meds-list' });
  for (const med of CANNABINOID_WITHDRAWAL_AND_RECOVERY.supportiveMedications) {
    const item = h('div', { class: 'med-item' }, [
      h('strong', { class: 'med-title' }, isEs ? med.nameEs : med.nameEn),
      h('p', { class: 'med-role' }, isEs ? med.roleEs : med.roleEn)
    ]);
    medsList.appendChild(item);
  }
  medsCard.appendChild(medsList);
  wrapper.appendChild(medsCard);

  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 4: CONCENTRATES & SYNTHETIC RISKS
// ----------------------------------------------------------------------------

function renderConcentratesTab(localState, isEs) {
  const wrapper = h('div', { class: 'concentrates-tab' });

  // Concentrates Card
  const concCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('trending-up'),
      h('span', {}, isEs ? 'La Era de Concentrados de Ultra-Alta Potencia (90%+ THC)' : 'The Era of Ultra-High Potency Concentrates (90%+ THC)')
    ]),
    h('p', {}, isEs
      ? 'Históricamente, el cannabis herbal contenía 3% a 5% de THC. Los productos modernos de vapeo, dabbing, resina viva y ceras alcanzan rutinariamente entre 75% y 99% de THC. Esta concentración extrema inunda masivamente los receptores CB1 del cerebro y del tracto digestivo, provocando una rápida desensibilización e internalización que precipita la hiperémesis.'
      : 'Historically, traditional cannabis flower contained 3% to 5% THC. Modern wax, dabs, live resin, and vape cartridges regularly reach 75% to 99% delta-9 THC. This massive supraphysiological surge overwhelms central and enteric CB1 receptors, accelerating uncoupling and triggering hyperemesis.'),
    h('div', { class: 'concentrate-highlights' }, [
      h('div', { class: 'highlight-box' }, [
        h('strong', {}, isEs ? 'Dabbing y Vapes' : 'Dabbing & Vaping'),
        h('p', { class: 'fine-print' }, isEs
          ? 'Las temperaturas elevadas de vaporización y la potencia pura aumentan drásticamente el riesgo de desarrollar SHC en comparación con la flor fumada.'
          : 'High vaporization temperatures and sheer potency exponentially increase CHS risk compared to traditional herbal flower.')
      ]),
      h('div', { class: 'highlight-box' }, [
        h('strong', {}, isEs ? 'Delta-8, Delta-10 y HHC' : 'Delta-8, Delta-10 & HHC'),
        h('p', { class: 'fine-print' }, isEs
          ? 'Los cannabinoides semi-sintéticos comercializados en tiendas no reguladas también se unen a los receptores CB1 e impiden la recuperación.'
          : 'Semi-synthetic hemp-derived isomers also bind CB1 receptors and will perpetuate hyperemetic episodes.')
      ])
    ])
  ]);
  wrapper.appendChild(concCard);

  // Synthetic Cannabinoids Warning
  const synthCard = h('section', { class: 'card synthetic-alert-card' }, [
    h('h2', { class: 'card-title alert-title' }, [
      icon('alert-octagon'),
      h('span', {}, isEs ? 'Cannabinoides Sintéticos ("K2", "Spice", Pinaca): Alerta Toxicológica' : 'Synthetic Cannabinoids ("K2", "Spice"): Toxicological Emergency')
    ]),
    h('p', {}, isEs
      ? 'Los cannabinoides sintéticos NO son marihuana ni derivados naturales. Son compuestos químicos diseñados en laboratorio (como AB-PINACA, MDMB-4en-PINACA) que actúan como AGONISTAS TOTALES con una afinidad hasta 100 veces superior a la del THC natural.'
      : 'Synthetic cannabinoids are NOT marijuana. They are full chemical agonists (e.g. AB-PINACA, MDMB-4en-PINACA) with up to 100 times the binding affinity of natural delta-9 THC.'),
    h('ul', { class: 'synthetic-risks-list' }, [
      h('li', {}, isEs
        ? 'Toxicidad cardiovascular: Isquemia miocárdica, infarto agudo de miocardio, taquicardia maligna y paro cardíaco.'
        : 'Cardiovascular toxicity: Myocardial infarction, malignant tachycardia, severe hypertension, and cardiac arrest.'),
      h('li', {}, isEs
        ? 'Neurotoxicidad grave: Convulsiones refractarias, catatonia, psicosis aguda, agitación extrema y delirio.'
        : 'Severe neurotoxicity: Status epilepticus, catatonia, acute refractory psychosis, extreme agitation, and delirium.'),
      h('li', {}, isEs
        ? 'Insuficiencia renal: Necrosis tubular aguda y daño renal por rabdomiólisis.'
        : 'Renal failure: Acute tubular necrosis and rhabdomyolysis.')
    ]),
    h('div', { class: 'callout-911' }, [
      icon('phone-call'),
      h('strong', {}, isEs ? 'Ante cualquier sospecha de intoxicación por K2/Spice, llame al 911 de inmediato.' : 'If synthetic cannabinoid toxicity is suspected, call 911 immediately.')
    ])
  ]);
  wrapper.appendChild(synthCard);

  return wrapper;
}

// ----------------------------------------------------------------------------
// EXPORT & ADVOCACY SECTION (ZERO PII)
// ----------------------------------------------------------------------------

function renderExportSection(localState, isEs, reRender) {
  const exportSection = h('section', { class: 'card export-section' }, [
    h('h3', {}, isEs ? 'Copia y Exportación de Resumen Seguro para Urgencias (Sin PII)' : 'Secure Emergency Department & Clinical Summary (Zero PII)'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Genere y copie un resumen en texto plano para mostrar al equipo médico en urgencias o gastroenterología y solicitar las terapias adecuadas:'
      : 'Generate and copy a privacy-safe text summary to present to emergency staff or your gastroenterologist to request evidence-based care:')
  ]);

  const summaryText = formatCannabisSummaryText(localState, isEs ? 'es' : 'en');
  const textArea = h('textarea', {
    class: 'summary-textarea',
    readonly: 'readonly',
    rows: 14,
    'aria-label': isEs ? 'Resumen de Hiperémesis Cannabinoide' : 'Cannabis Hyperemesis Summary'
  }, summaryText);

  const copyStatus = h('span', { class: 'copy-status', 'aria-live': 'polite' }, '');
  const copyBtn = h('button', {
    class: 'btn btn-primary',
    onclick: async () => {
      try {
        await navigator.clipboard.writeText(summaryText);
        copyStatus.textContent = isEs ? ' ¡Copiado con éxito!' : ' Copied successfully!';
        setTimeout(() => { copyStatus.textContent = ''; }, 3000);
      } catch (_e) {
        copyStatus.textContent = isEs ? ' Error al copiar' : ' Copy failed';
      }
    }
  }, [
    icon('copy'),
    h('span', {}, isEs ? 'Copiar Resumen Clínico' : 'Copy Clinical Summary')
  ]);

  const resetBtn = h('button', {
    class: 'btn btn-secondary',
    onclick: () => {
      resetCannabisState();
      reRender();
    }
  }, [
    icon('refresh-cw'),
    h('span', {}, isEs ? 'Restablecer Estado' : 'Reset State')
  ]);

  const btnRow = h('div', { class: 'btn-row' }, [copyBtn, resetBtn, copyStatus]);
  exportSection.appendChild(textArea);
  exportSection.appendChild(btnRow);

  return exportSection;
}
