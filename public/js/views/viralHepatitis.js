// public/js/views/viralHepatitis.js
// HarborPath - Viral Hepatitis (HCV/HBV), DAA Regimens, FIB-4 Score & HIV PrEP/PEP Specialist
// Clinical standards: AASLD/IDSA HCV Guidelines (2023/2024), CDC Viral Hepatitis & HIV PrEP/PEP Guidelines, WHO Hepatitis Elimination
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon, copyText } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY & PROTOCOLS
// ============================================================================

export const AASLD_HCV_GUIDELINES = {
  titleEn: 'AASLD / IDSA HCV Simplified Treatment Guidance & Patient Rights',
  titleEs: 'Guía Simplificada de Tratamiento del VHC de la AASLD / IDSA y Derechos del Paciente',
  mandateEn: 'CRITICAL CLINICAL MANDATE: The American Association for the Study of Liver Diseases (AASLD) and Infectious Diseases Society of America (IDSA) explicitly state: ACTIVE SUBSTANCE USE OR MOUD IS NEVER A REASON TO WITHHOLD OR DELAY HEPATITIS C TREATMENT. Direct-Acting Antivirals (DAAs) achieve >95–98% cure rates (SVR12) with minimal side effects and demonstrated high adherence among active people who inject drugs (PWID).',
  mandateEs: 'MANDATO CLÍNICO FUNDAMENTAL: La Asociación Americana para el Estudio de Enfermedades Hepáticas (AASLD) y la Sociedad de Enfermedades Infecciosas de América (IDSA) declaran explícitamente: EL CONSUMO ACTIVO DE SUSTANCIAS O EL TRATAMIENTO CON MOUD NUNCA SON MOTIVOS PARA DENEGAR O POSPONER EL TRATAMIENTO DE LA HEPATITIS C. Los Antivirales de Acción Directa (AAD) logran tasas de curación superiores al 95-98% (RVS12) con efectos secundarios mínimos y alta adherencia demostrada en personas activas que se inyectan drogas.',
  diagnosticCascade: [
    {
      step: 1,
      titleEn: 'Step 1: HCV Antibody Screen (Anti-HCV)',
      titleEs: 'Paso 1: Cribado de Anticuerpos VHC (Anti-VHC)',
      detailEn: 'Detects lifetime exposure to the hepatitis C virus. A reactive (positive) antibody test DOES NOT mean active infection (20–25% of individuals clear the virus spontaneously).',
      detailEs: 'Detecta la exposición a lo largo de la vida al virus de la hepatitis C. Un resultado reactivo (positivo) NO significa infección activa (el 20-25% de las personas eliminan el virus espontáneamente).'
    },
    {
      step: 2,
      titleEn: 'Step 2: Reflex HCV RNA Quantitative PCR (Viral Load)',
      titleEs: 'Paso 2: PCR Cuantitativa de ARN del VHC (Carga Viral)',
      detailEn: 'Mandatory confirmatory test. Detects actively replicating virus in the blood. If HCV RNA is detected, chronic hepatitis C is confirmed and curative DAA therapy is indicated immediately.',
      detailEs: 'Prueba confirmatoria obligatoria. Detecta el virus en replicación activa en sangre. Si se detecta ARN del VHC, se confirma hepatitis C crónica y la terapia curativa con AAD está indicada de inmediato.'
    },
    {
      step: 3,
      titleEn: 'Step 3: Hepatitis B Reactivation Screen (FDA Boxed Warning)',
      titleEs: 'Paso 3: Detección de Reactivación de Hepatitis B (Alerta FDA)',
      detailEn: 'MANDATORY SAFETY CHECK: Screen for HBsAg and anti-HBc prior to DAA initiation. Rapid clearance of HCV can cause fulminant hepatitis B reactivation in co-infected individuals.',
      detailEs: 'CONTROL DE SEGURIDAD OBLIGATORIO: Pruebas de HBsAg y anti-HBc antes de iniciar AAD. La eliminación rápida del VHC puede reactivar fulminantemente el virus de la hepatitis B en coinfectados.'
    },
    {
      step: 4,
      titleEn: 'Step 4: Non-Invasive Fibrosis Assessment (FIB-4 Index)',
      titleEs: 'Paso 4: Evaluación de Fibrosis No Invasiva (Índice FIB-4)',
      detailEn: 'Calculates liver scarring risk using Age, AST, ALT, and Platelet count without biopsy. Distinguishes non-cirrhotic patients eligible for simplified 8-to-12-week care from those with advanced cirrhosis requiring hepatocellular carcinoma (HCC) ultrasound screening.',
      detailEs: 'Calcula el riesgo de cicatrización hepática usando edad, AST, ALT y plaquetas sin biopsia. Distingue pacientes no cirróticos aptos para manejo simplificado de 8 a 12 semanas de aquellos con cirrosis avanzada que requieren ecografía para hepatocarcinoma.'
    }
  ]
};

export const HCV_DAA_REGIMENS = [
  {
    regimenId: 'mavyret',
    brandName: 'Mavyret (Glecaprevir / Pibrentasvir)',
    durationEn: '8 Weeks (Treatment-Naive, Non-Cirrhotic)',
    durationEs: '8 Semanas (Sin tratamiento previo, Sin cirrosis)',
    dosingEn: '3 tablets once daily taken WITH FOOD (Total daily dose: 300 mg glecaprevir / 120 mg pibrentasvir).',
    dosingEs: '3 tabletas una vez al día TOMADAS CON COMIDA (Dosis diaria total: 300 mg glecaprevir / 120 mg pibrentasvir).',
    panGenotypic: true,
    moudSafe: true,
    highlightsEn: 'Shortest duration (8 weeks); pan-genotypic (active against genotypes 1–6); safe with buprenorphine and methadone. Contraindicated in Child-Pugh B or C decompensated cirrhosis.',
    highlightsEs: 'Duración más corta (8 semanas); pangenotípico (genotipos 1 al 6); seguro con buprenorfina y metadona. Contraindicado en cirrosis descompensada Child-Pugh B o C.'
  },
  {
    regimenId: 'epclusa',
    brandName: 'Epclusa (Sofosbuvir / Velpatasvir)',
    durationEn: '12 Weeks (All Genotypes, With or Without Compensated Cirrhosis)',
    durationEs: '12 Semanas (Todos los genotipos, con o sin cirrosis compensada)',
    dosingEn: '1 tablet once daily with or without food (400 mg sofosbuvir / 100 mg velpatasvir).',
    dosingEs: '1 tableta una vez al día con o sin comida (400 mg sofosbuvir / 100 mg velpatasvir).',
    panGenotypic: true,
    moudSafe: true,
    highlightsEn: 'Single pill once daily; highly effective across all genotypes; safe with buprenorphine and methadone. Critical drug interaction: Proton-pump inhibitors (omeprazole) drastically reduce velpatasvir absorption—must take Epclusa 4 hours before omeprazole (max 20 mg).',
    highlightsEs: 'Una sola pastilla al día; alta eficacia en todos los genotipos; seguro con buprenorfina y metadona. Interacción crítica: Los inhibidores de bomba de protones (omeprazol) reducen la absorción de velpatasvir—debe tomar Epclusa 4 horas antes de omeprazol (máx 20 mg).'
  }
];

export const FIB4_INTERPRETATION_STANDARDS = {
  titleEn: 'FIB-4 Index Interpretation (Non-Invasive Liver Fibrosis Scoring)',
  titleEs: 'Interpretación del Índice FIB-4 (Puntuación de Fibrosis Hepática No Invasiva)',
  formulaEn: 'FIB-4 = (Age [years] × AST [U/L]) / (Platelet Count [10^9/L] × √ALT [U/L])',
  formulaEs: 'FIB-4 = (Edad [años] × AST [U/L]) / (Plaquetas [10^9/L] × √ALT [U/L])',
  thresholds: [
    {
      level: 'low',
      thresholdEn: 'FIB-4 < 1.45 (or < 2.0 if age > 65)',
      thresholdEs: 'FIB-4 < 1.45 (o < 2.0 si edad > 65)',
      meaningEn: 'Low Probability of Advanced Fibrosis (F0–F2). Negative predictive value > 90%. Eligible for primary care simplified DAA treatment without routine specialist referral.',
      meaningEs: 'Baja probabilidad de fibrosis avanzada (F0-F2). Valor predictivo negativo > 90%. Apto para tratamiento simplificado con AAD en atención primaria sin necesidad de derivación rutinaria.'
    },
    {
      level: 'indeterminate',
      thresholdEn: 'FIB-4 1.45 – 3.25',
      thresholdEs: 'FIB-4 1.45 – 3.25',
      meaningEn: 'Indeterminate Score. Secondary non-invasive assessment recommended (e.g. transient elastography / FibroScan or APRI) to clarify fibrosis stage.',
      meaningEs: 'Puntuación indeterminada. Se recomienda una evaluación secundaria no invasiva (p. ej., elastografía transitoria / FibroScan o APRI) para definir el estadio de fibrosis.'
    },
    {
      level: 'high',
      thresholdEn: 'FIB-4 > 3.25',
      thresholdEs: 'FIB-4 > 3.25',
      meaningEn: 'High Probability of Advanced Fibrosis or Cirrhosis (F3–F4). Positive predictive value ~65–80%. Hepatology consultation recommended. Requires lifelong bi-annual abdominal ultrasound for Hepatocellular Carcinoma (HCC) surveillance even after HCV cure.',
      meaningEs: 'Alta probabilidad de fibrosis avanzada o cirrosis (F3-F4). Valor predictivo positivo ~65-80%. Se recomienda interconsulta con hepatología. Requiere ecografía abdominal semestral de por vida para detección de hepatocarcinoma (HCC), incluso tras curar el VHC.'
    }
  ]
};

export const HIV_PREP_PEP_STANDARDS = {
  titleEn: 'HIV Pre-Exposure (PrEP) & Emergency Post-Exposure Prophylaxis (PEP)',
  titleEs: 'Profilaxis Preexposición (PrEP) y Posexposición de Emergencia (PEP) para VIH',
  prepSummaryEn: 'PrEP is highly effective (>99% for sexual transmission, >74% for injection exposures) for individuals at potential exposure risk. Options include daily oral pills (Emtricitabine/Tenofovir disoproxil fumarate [Truvada]) or bi-monthly intramuscular injections (Cabotegravir [Apretude]).',
  prepSummaryEs: 'La PrEP es altamente eficaz (>99% para transmisión sexual, >74% para inyección) en personas con potencial riesgo de exposición. Las opciones incluyen pastillas diarias (Truvada) o inyecciones bimestrales (Apretude).',
  pepSummaryEn: 'EMERGENCY 72-HOUR WINDOW: Post-Exposure Prophylaxis (PEP) must be started within 72 hours (ideally within 24 hours) after potential exposure to HIV (shared syringe, needle-stick, or condomless sex). Consists of a full 28-day course of antiretrovirals (e.g. Biktarvy or Truvada + Tivicay) to prevent viral replication.',
  pepSummaryEs: 'VENTANA DE EMERGENCIA DE 72 HORAS: La Profilaxis Posexposición (PEP) debe iniciarse dentro de las 72 horas (idealmente en las primeras 24 horas) tras una potencial exposición (compartir jeringas, pinchazo o relaciones sin protección). Consiste en un ciclo de 28 días de antirretrovirales para impedir la replicación del virus.',
  reinfectionPoints: [
    {
      topicEn: 'HCV Survives Weeks on Equipment',
      topicEs: 'El VHC Sobrevive Semanas en los Equipos',
      descEn: 'Unlike HIV (which dies in minutes to hours), Hepatitis C is extremely resilient and can survive in dried blood on cookers, cotton filters, and water for up to 3 to 6 weeks at room temperature.',
      descEs: 'A diferencia del VIH (que muere en minutos u horas), el virus de la hepatitis C es muy resistente y sobrevive en sangre seca en cazoletas, algodones y agua hasta 3 a 6 semanas a temperatura ambiente.'
    },
    {
      topicEn: 'Cure Does NOT Confer Immunity',
      topicEs: 'La Curación NO Confiere Inmunidad',
      descEn: 'Successful treatment cures the active infection and produces SVR12, but antibodies remain positive for life and DO NOT protect against reinfection. Shared injection supplies can re-infect the liver immediately.',
      descEs: 'El tratamiento cura la infección activa logrando la RVS12, pero los anticuerpos persisten de por vida y NO protegen contra una nueva infección. Compartir material de inyección puede reinfectar el hígado de inmediato.'
    },
    {
      topicEn: 'Point-of-Use Safety Equipment',
      topicEs: 'Material de Seguridad en el Punto de Consumo',
      descEn: 'Always use fresh single-use sterile syringes, individual sterile cookers, 0.22-micron wheel filters, and separate sterile water vials. Never "split" drugs by backloading with a used syringe.',
      descEs: 'Utilice siempre jeringas estériles desechables de un solo uso, cazoletas individuales, filtros de membrana de 0.22 micras y viales de agua estéril separados. Nunca divida drogas mediante recarga con jeringas usadas.'
    }
  ]
};

export const VIRAL_HEPATITIS_RED_FLAGS = [
  {
    flagId: 'decompensated_cirrhosis',
    severity: 'emergency',
    titleEn: 'Decompensated Cirrhosis / Liver Failure',
    titleEs: 'Cirrosis Descompensada / Insuficiencia Hepática',
    symptomsEn: 'Rapidly swelling abdomen (ascites), yellow eyes or skin (jaundice), confusion or memory lapses (hepatic encephalopathy), flapping hand tremors (asterixis), or vomiting blood (esophageal varices).',
    symptomsEs: 'Hinchazón abdominal rápida (ascitis), ojos o piel amarillos (ictericia), confusión o desorientación (encefalopatía hepática), temblor aleteante en manos (asterixis) o vómito con sangre (várices esofágicas).',
    actionEn: 'Immediate Emergency Department (911) transfer. Decompensated cirrhosis requires urgent hepatology inpatient stabilization. Protease-inhibitor DAAs are contraindicated.',
    actionEs: 'Traslado inmediato a Emergencias (911). La cirrosis descompensada requiere estabilización hospitalaria urgente. Los AAD inhibidores de proteasa están contraindicados.'
  },
  {
    flagId: 'hbv_reactivation',
    severity: 'emergency',
    titleEn: 'Fulminant Hepatitis B Reactivation Alert',
    titleEs: 'Alerta de Reactivación Fulminante de Hepatitis B',
    symptomsEn: 'Extreme fatigue, severe right upper-quadrant abdominal pain, dark tea-colored urine, pale clay-colored stools, and sudden nausea in patients taking DAAs without prior HBV screening.',
    symptomsEs: 'Fatiga extrema, dolor intenso en hipocondrio derecho, orina oscura como té, heces pálidas de color arcilla y náuseas repentinas en pacientes bajo AAD sin cribado previo de VHB.',
    actionEn: 'Immediate medical escalation. FDA Black Box warning: unchecked HBV can cause acute liver failure and death during DAA therapy.',
    actionEs: 'Atención médica urgente. Alerta de la FDA: el VHB no controlado puede provocar fallo hepático fulminante y muerte durante el tratamiento con AAD.'
  },
  {
    flagId: 'hiv_pep_window',
    severity: 'urgent',
    titleEn: 'HIV Post-Exposure Emergency (72-Hour Window)',
    titleEs: 'Emergencia Posexposición a VIH (Ventana de 72 Horas)',
    symptomsEn: 'Shared syringe, needle-stick puncture, or sexual exposure with a person of unknown or detectable HIV status within the last 72 hours.',
    symptomsEs: 'Uso compartido de jeringas, pinchazo accidental o relaciones sin preservativo con alguien de estado serológico desconocido o detectable en las últimas 72 horas.',
    actionEn: 'Go to an Emergency Department or urgent care clinic IMMEDIATELY to start PEP. Every hour counts; PEP efficacy drops drastically after 72 hours.',
    actionEs: 'Acuda a Urgencias INMEDIATAMENTE para iniciar PEP. Cada hora cuenta; la eficacia de la PEP disminuye drásticamente pasadas las 72 horas.'
  }
];

// ============================================================================
// CLINICAL EVALUATION & IN-RAM STATE MANAGEMENT
// ============================================================================

/**
 * Calculates FIB-4 score deterministically.
 * Formula: (Age * AST) / (Platelets * sqrt(ALT))
 * Age in years, AST in U/L, ALT in U/L, Platelets in 10^9/L (thousands per mcL).
 */
export function calculateFib4Score(age, ast, alt, platelets) {
  const nAge = Number(age);
  const nAst = Number(ast);
  const nAlt = Number(alt);
  const nPlat = Number(platelets);

  if (!nAge || !nAst || !nAlt || !nPlat || nAlt <= 0 || nPlat <= 0) {
    return null;
  }

  const score = (nAge * nAst) / (nPlat * Math.sqrt(nAlt));
  const rounded = Math.round(score * 100) / 100;

  let level = 'low';
  let descEn = 'Low Probability of Advanced Fibrosis (F0–F2)';
  let descEs = 'Baja probabilidad de fibrosis avanzada (F0–F2)';

  const lowCutoff = nAge > 65 ? 2.0 : 1.45;

  if (rounded > 3.25) {
    level = 'high';
    descEn = 'High Probability of Advanced Fibrosis or Cirrhosis (F3–F4)';
    descEs = 'Alta probabilidad de fibrosis avanzada o cirrosis (F3–F4)';
  } else if (rounded >= lowCutoff) {
    level = 'indeterminate';
    descEn = 'Indeterminate Fibrosis Stage (Further Non-Invasive Testing Advised)';
    descEs = 'Estadio de fibrosis indeterminado (Se aconseja prueba confirmatoria)';
  }

  return {
    score: rounded,
    level,
    descEn,
    descEs,
    lowCutoff
  };
}

/**
 * Evaluates viral hepatitis risks and testing needs.
 */
export function evaluateViralHepRisks(answers = {}) {
  const {
    everInjected = false,
    testedHcvAb = false,
    hcvAbPositive = false,
    testedHcvRna = false,
    hcvRnaPositive = false,
    testedHbv = false,
    hasCirrhosis = false,
    takingMoud = false
  } = answers;

  let recommendationEn = '';
  let recommendationEs = '';
  let nextStepId = 'screen_ab';

  if (hasCirrhosis) {
    nextStepId = 'specialist_referral';
    recommendationEn = 'Cirrhosis detected. Simplified 8-week primary care regimens are not recommended. Hepatology evaluation is required to evaluate decompensation risks and establish bi-annual liver cancer ultrasound surveillance.';
    recommendationEs = 'Cirrosis detectada. No se recomiendan pautas simplificadas de 8 semanas. Se requiere valoración por hepatología para evaluar descompensación e iniciar cribado ecográfico semestral de hepatocarcinoma.';
  } else if (hcvRnaPositive) {
    nextStepId = 'initiate_daa';
    recommendationEn = 'Active Hepatitis C confirmed. Curative pan-genotypic Direct-Acting Antivirals (Mavyret 8 weeks or Epclusa 12 weeks) are indicated immediately. Check Hepatitis B status (HBsAg/anti-HBc) and proceed with treatment. MOUD (methadone/buprenorphine) is 100% compatible.';
    recommendationEs = 'Hepatitis C activa confirmada. Los Antivirales de Acción Directa pangenotípicos (Mavyret 8 semanas o Epclusa 12 semanas) están indicados de inmediato. Compruebe estado de Hepatitis B (HBsAg/anti-HBc) e inicie terapia. El tratamiento con MOUD es 100% compatible.';
  } else if (hcvAbPositive && !testedHcvRna) {
    nextStepId = 'reflex_rna';
    recommendationEn = 'Antibody is reactive, but active infection is NOT yet confirmed. Order a quantitative HCV RNA PCR test immediately. Up to 25% of individuals clear the virus on their own.';
    recommendationEs = 'Anticuerpo reactivo, pero la infección activa AÚN NO está confirmada. Solicite de inmediato una PCR cuantitativa de ARN del VHC. Hasta el 25% de personas eliminan el virus espontáneamente.';
  } else if (everInjected && !testedHcvAb) {
    nextStepId = 'screen_ab';
    recommendationEn = 'Screening recommended. CDC recommends at least annual HCV antibody screening with reflex RNA for anyone with past or ongoing injection drug exposure.';
    recommendationEs = 'Cribado recomendado. Los CDC recomiendan cribado anual de anticuerpos VHC con ARN reflejo para cualquier persona con exposición previa o activa a drogas inyectadas.';
  } else {
    nextStepId = 'prevention';
    recommendationEn = 'Maintain harm reduction precautions. Utilize sterile equipment, access HIV PrEP if indicated, and obtain Hepatitis A and B vaccinations.';
    recommendationEs = 'Mantenga medidas de reducción de daños. Use material estéril, valore PrEP para VIH si procede y vacúnese contra Hepatitis A y B.';
  }

  return { nextStepId, recommendationEn, recommendationEs };
}

/**
 * Evaluates emergency red flags for liver decompensation or HIV exposure.
 */
export function evaluateViralEmergencyFlags(selectedFlags = []) {
  const flags = VIRAL_HEPATITIS_RED_FLAGS.filter(f => selectedFlags.includes(f.flagId));
  const hasEmergency = flags.some(f => f.severity === 'emergency');
  const hasUrgent = flags.some(f => f.severity === 'urgent');

  return {
    flags,
    hasEmergency,
    hasUrgent,
    requiresImmediateCare: flags.length > 0
  };
}

// In-RAM Ephemeral State (Zero PII, Zero Device Storage)
let viralHepState = {
  currentTab: 'guidelines',
  everInjected: false,
  testedHcvAb: false,
  hcvAbPositive: false,
  testedHcvRna: false,
  hcvRnaPositive: false,
  testedHbv: false,
  hasCirrhosis: false,
  takingMoud: false,
  age: '42',
  ast: '48',
  alt: '52',
  platelets: '210',
  selectedRedFlags: [],
  checklistHbvCheck: false,
  checklistPpiInteraction: false,
  checklistMoudPreserve: false,
  checklistSterileSupplies: false
};

export function getViralState() {
  return { ...viralHepState };
}

export function setViralState(updates) {
  viralHepState = { ...viralHepState, ...updates };
  return getViralState();
}

export function resetViralState() {
  viralHepState = {
    currentTab: 'guidelines',
    everInjected: false,
    testedHcvAb: false,
    hcvAbPositive: false,
    testedHcvRna: false,
    hcvRnaPositive: false,
    testedHbv: false,
    hasCirrhosis: false,
    takingMoud: false,
    age: '42',
    ast: '48',
    alt: '52',
    platelets: '210',
    selectedRedFlags: [],
    checklistHbvCheck: false,
    checklistPpiInteraction: false,
    checklistMoudPreserve: false,
    checklistSterileSupplies: false
  };
  return getViralState();
}

/**
 * Formats a plain-text clinical advocacy summary for patient visits without PII.
 */
export function formatViralSummaryText(state, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateViralHepRisks(state);
  const fib4Result = calculateFib4Score(state.age, state.ast, state.alt, state.platelets);
  const emCheck = evaluateViralEmergencyFlags(state.selectedRedFlags || []);

  const lines = [];
  lines.push(isEs
    ? '=== HARBORPATH: RESUMEN CLÍNICO DE HEPATITIS VIRAL (VHC/VHB) Y SALUD HEPÁTICA ==='
    : '=== HARBORPATH: VIRAL HEPATITIS (HCV/HBV), DAA & LIVER HEALTH SUMMARY ===');
  lines.push(isEs
    ? 'Aviso de Privacidad: 100% en memoria RAM. Cero persistencia en disco ni rastreo de PII.'
    : 'Privacy Notice: 100% ephemeral in-RAM. Zero device storage, zero PII.');
  lines.push('');

  lines.push(isEs ? '--- 1. EVALUACIÓN Y RECOMENDACIÓN CLÍNICA ---' : '--- 1. CLINICAL EVALUATION & RECOMMENDATION ---');
  lines.push(`${isEs ? 'Próximo Paso' : 'Recommended Step'}: ${evalResult.nextStepId}`);
  lines.push(`${isEs ? 'Orientación' : 'Guidance'}: ${isEs ? evalResult.recommendationEs : evalResult.recommendationEn}`);
  lines.push('');

  lines.push(isEs ? '--- 2. PUNTUACIÓN DE FIBROSIS FIB-4 ---' : '--- 2. NON-INVASIVE FIB-4 FIBROSIS SCORE ---');
  if (fib4Result) {
    lines.push(`${isEs ? 'Puntuación FIB-4' : 'FIB-4 Score'}: ${fib4Result.score}`);
    lines.push(`${isEs ? 'Estrato de Riesgo' : 'Risk Stratification'}: ${isEs ? fib4Result.descEs : fib4Result.descEn}`);
    lines.push(`${isEs ? 'Valores ingresados' : 'Input Values'}: Edad=${state.age}, AST=${state.ast} U/L, ALT=${state.alt} U/L, Plaquetas=${state.platelets} k/mcL`);
  } else {
    lines.push(isEs ? 'No calculado (faltan parámetros de laboratorio).' : 'Not calculated (missing lab parameters).');
  }
  lines.push('');

  if (emCheck.flags.length > 0) {
    lines.push(isEs ? '--- 3. ALERTAS DE EMERGENCIA ACTIVAS ---' : '--- 3. ACTIVE EMERGENCY RED FLAGS ---');
    for (const f of emCheck.flags) {
      lines.push(`- [${f.severity.toUpperCase()}] ${isEs ? f.titleEs : f.titleEn}: ${isEs ? f.actionEs : f.actionEn}`);
    }
    lines.push('');
  }

  lines.push(isEs ? '--- 4. DERECHOS DEL PACIENTE Y GUÍAS AASLD/IDSA ---' : '--- 4. PATIENT RIGHTS & AASLD/IDSA GUIDELINES ---');
  lines.push(isEs
    ? '- El consumo activo de sustancias o el tratamiento con buprenorfina/metadona NUNCA son motivos para negar antivirales.'
    : '- Active substance use or MOUD is NEVER a valid reason to deny DAA curative therapy.');
  lines.push(isEs
    ? '- Los antivirales de acción directa (Mavyret, Epclusa) curan >95-98% de casos en 8 a 12 semanas.'
    : '- Direct-Acting Antivirals (Mavyret, Epclusa) achieve >95-98% SVR12 cure in 8 to 12 weeks.');
  lines.push(isEs
    ? '- La curación del VHC no confiere inmunidad permanente; se requiere material de inyección estéril para evitar reinfecciones.'
    : '- HCV cure does not confer immunity; sterile supplies are essential to prevent reinfection.');
  lines.push('');

  lines.push('================================================================');
  lines.push(isEs
    ? 'Documento educativo para facilitar el diálogo clínico. No reemplaza el juicio de un profesional de la salud.'
    : 'Clinical dialogue summary for healthcare visits. Does not replace individualized medical advice.');

  return lines.join('\n');
}

// ============================================================================
// VIEW COMPONENT & DOM RENDERING
// ============================================================================

export function viralHepatitisView() {
  const container = h('div', { class: 'view viral-hepatitis-view' });

  function reRender() {
    clear(container);
    container.appendChild(renderViralHepatitisContent());
  }

  container.appendChild(renderViralHepatitisContent());
  return container;
}

function renderViralHepatitisContent() {
  const isEs = getLang() === 'es';
  const localState = getViralState();

  const wrapper = h('div', { class: 'viral-hepatitis-container' });

  // Header
  const header = h('header', { class: 'view-header' }, [
    h('div', { class: 'view-header-badge' }, [
      icon('activity'),
      h('span', {}, isEs ? 'Hepatología e Infecciosas Clínicas' : 'Clinical Hepatology & Infectious Disease')
    ]),
    h('h1', { class: 'view-title' }, isEs
      ? 'Hepatitis C (VHC), Antivirales AAD, Índice FIB-4 y PrEP/PEP'
      : 'Hepatitis C Cure, DAA Regimens, FIB-4 Score & HIV PrEP/PEP'),
    h('p', { class: 'view-description text-muted' }, isEs
      ? 'Orientación clínica basada en pautas AASLD/IDSA y CDC: curación con AAD en 8–12 semanas, calculadora no invasiva FIB-4, alerta de reactivación de VHB, profilaxis para VIH y derechos del paciente sin barreras de sobriedad.'
      : 'Evidence-based AASLD/IDSA & CDC guidance: 8-to-12-week DAA cure protocols, non-invasive FIB-4 scoring, HBV reactivation screening, HIV PrEP/PEP emergency windows, and anti-discrimination patient advocacy.')
  ]);
  wrapper.appendChild(header);

  // Tabs Navigation
  const tabList = [
    { id: 'guidelines', labelEn: 'AASLD Cure & Regimens', labelEs: 'Curación y Pautas AAD', iconName: 'shield' },
    { id: 'fib4', labelEn: 'FIB-4 Fibrosis Calculator', labelEs: 'Calculadora FIB-4', iconName: 'activity' },
    { id: 'prep_pep', labelEn: 'HIV PrEP & 72h PEP', labelEs: 'PrEP y PEP 72h VIH', iconName: 'clock' },
    { id: 'advocacy', labelEn: 'Patient Rights & Export', labelEs: 'Derechos y Resumen', iconName: 'file-text' }
  ];

  const tabsNav = h('nav', { class: 'tabs-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Hepatitis Viral' : 'Viral Hepatitis Tabs' });
  for (const tInfo of tabList) {
    const isActive = localState.currentTab === tInfo.id;
    const tabBtn = h('button', {
      type: 'button',
      class: `tab-btn ${isActive ? 'active' : ''}`,
      role: 'tab',
      'aria-selected': isActive ? 'true' : 'false',
      onclick: () => {
        setViralState({ currentTab: tInfo.id });
        const parent = tabsNav.closest('.viral-hepatitis-view');
        if (parent) {
          clear(parent);
          parent.appendChild(renderViralHepatitisContent());
        }
      }
    }, [
      icon(tInfo.iconName),
      h('span', {}, isEs ? tInfo.labelEs : tInfo.labelEn)
    ]);
    tabsNav.appendChild(tabBtn);
  }
  wrapper.appendChild(tabsNav);

  // Tab Content Area
  const contentArea = h('div', { class: 'tab-content-area', role: 'tabpanel' });

  if (localState.currentTab === 'guidelines') {
    contentArea.appendChild(renderGuidelinesTab(localState, isEs));
  } else if (localState.currentTab === 'fib4') {
    contentArea.appendChild(renderFib4Tab(localState, isEs));
  } else if (localState.currentTab === 'prep_pep') {
    contentArea.appendChild(renderPrepPepTab(localState, isEs));
  } else {
    contentArea.appendChild(renderAdvocacyTab(localState, isEs));
  }

  wrapper.appendChild(contentArea);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 1: AASLD CURE GUIDELINES & DAA REGIMENS
// ----------------------------------------------------------------------------

function renderGuidelinesTab(localState, isEs) {
  const wrapper = h('div', { class: 'guidelines-tab' });

  function reRender() {
    const parent = wrapper.closest('.viral-hepatitis-view');
    if (parent) {
      clear(parent);
      parent.appendChild(renderViralHepatitisContent());
    }
  }

  // Emergency Red Flags
  const redFlagsCard = h('section', { class: 'card emergency-card' }, [
    h('h2', { class: 'card-title alert-title' }, [
      icon('alert-octagon'),
      h('span', {}, isEs ? 'Complicaciones Hepáticas Graves y Ventana de Emergencia' : 'Critical Liver Complications & Emergency Alerts')
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'Revise si presenta síntomas de descompensación hepática o exposición reciente que requiera atención inmediata:'
      : 'Check for signs of hepatic decompensation or recent exposure requiring immediate clinical action:')
  ]);

  const flagsList = h('div', { class: 'red-flags-list' });
  for (const flag of VIRAL_HEPATITIS_RED_FLAGS) {
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
          setViralState({ selectedRedFlags: updated });
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

  // AASLD Mandate Banner
  const mandateCard = h('section', { class: 'card mandate-card' }, [
    h('div', { class: 'mandate-header' }, [
      icon('check-circle'),
      h('h2', {}, isEs ? AASLD_HCV_GUIDELINES.titleEs : AASLD_HCV_GUIDELINES.titleEn)
    ]),
    h('p', { class: 'mandate-text' }, isEs ? AASLD_HCV_GUIDELINES.mandateEs : AASLD_HCV_GUIDELINES.mandateEn)
  ]);
  wrapper.appendChild(mandateCard);

  // Diagnostic Cascade Card
  const cascadeCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('git-commit'),
      h('span', {}, isEs ? 'La Cascada Diagnóstica del VHC (4 Pasos)' : 'The 4-Step HCV Diagnostic Cascade')
    ])
  ]);

  const cascadeGrid = h('div', { class: 'cascade-grid' });
  for (const step of AASLD_HCV_GUIDELINES.diagnosticCascade) {
    const card = h('div', { class: 'cascade-step-card' }, [
      h('h3', { class: 'step-title' }, isEs ? step.titleEs : step.titleEn),
      h('p', { class: 'step-detail' }, isEs ? step.detailEs : step.detailEn)
    ]);
    cascadeGrid.appendChild(card);
  }
  cascadeCard.appendChild(cascadeGrid);
  wrapper.appendChild(cascadeCard);

  // DAA Regimens Card
  const daaCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('pill'),
      h('span', {}, isEs ? 'Pautas de Antivirales de Acción Directa (AAD) Pangenotípicos' : 'First-Line Pan-Genotypic DAA Regimens')
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'Píldoras orales una vez al día con tasas de curación superiores al 95–98% y tolerabilidad excelente:'
      : 'Once-daily oral tablets curing >95–98% of patients across all genotypes with high tolerability:')
  ]);

  const daaGrid = h('div', { class: 'daa-grid' });
  for (const reg of HCV_DAA_REGIMENS) {
    const item = h('div', { class: 'daa-card' }, [
      h('div', { class: 'daa-header' }, [
        h('h3', { class: 'daa-title' }, reg.brandName),
        h('span', { class: 'daa-badge' }, isEs ? reg.durationEs : reg.durationEn)
      ]),
      h('p', { class: 'daa-dosing' }, [
        h('strong', {}, isEs ? 'Dosificación: ' : 'Dosing: '),
        h('span', {}, isEs ? reg.dosingEs : reg.dosingEn)
      ]),
      h('p', { class: 'daa-highlights' }, isEs ? reg.highlightsEs : reg.highlightsEn),
      h('div', { class: 'daa-compatibility' }, [
        icon('check'),
        h('span', {}, isEs ? 'Compatible con Metadona y Buprenorfina (MOUD)' : '100% Compatible with Methadone & Buprenorphine (MOUD)')
      ])
    ]);
    daaGrid.appendChild(item);
  }
  daaCard.appendChild(daaGrid);
  wrapper.appendChild(daaCard);

  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 2: FIB-4 FIBROSIS CALCULATOR
// ----------------------------------------------------------------------------

function renderFib4Tab(localState, isEs) {
  const wrapper = h('div', { class: 'fib4-tab' });

  function reRender() {
    const parent = wrapper.closest('.viral-hepatitis-view');
    if (parent) {
      clear(parent);
      parent.appendChild(renderViralHepatitisContent());
    }
  }

  const calcCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('activity'),
      h('span', {}, isEs ? 'Calculadora No Invasiva del Índice FIB-4' : 'FIB-4 Non-Invasive Liver Fibrosis Calculator')
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'Calcule el grado de fibrosis hepática utilizando parámetros sanguíneos habituales sin necesidad de biopsia:'
      : 'Estimate liver fibrosis severity using routine laboratory blood values without a biopsy:')
  ]);

  const inputGrid = h('div', { class: 'fib4-input-grid' });

  // Age input
  const ageGroup = h('div', { class: 'form-group' }, [
    h('label', { class: 'form-label' }, isEs ? 'Edad (años):' : 'Age (years):'),
    h('input', {
      type: 'number',
      class: 'form-input',
      value: localState.age,
      min: 18,
      max: 100,
      oninput: (e) => {
        setViralState({ age: e.target.value });
        reRender();
      }
    })
  ]);
  inputGrid.appendChild(ageGroup);

  // AST input
  const astGroup = h('div', { class: 'form-group' }, [
    h('label', { class: 'form-label' }, isEs ? 'AST / GOT (U/L):' : 'AST (U/L):'),
    h('input', {
      type: 'number',
      class: 'form-input',
      value: localState.ast,
      min: 5,
      max: 1000,
      oninput: (e) => {
        setViralState({ ast: e.target.value });
        reRender();
      }
    })
  ]);
  inputGrid.appendChild(astGroup);

  // ALT input
  const altGroup = h('div', { class: 'form-group' }, [
    h('label', { class: 'form-label' }, isEs ? 'ALT / GPT (U/L):' : 'ALT (U/L):'),
    h('input', {
      type: 'number',
      class: 'form-input',
      value: localState.alt,
      min: 5,
      max: 1000,
      oninput: (e) => {
        setViralState({ alt: e.target.value });
        reRender();
      }
    })
  ]);
  inputGrid.appendChild(altGroup);

  // Platelets input
  const platGroup = h('div', { class: 'form-group' }, [
    h('label', { class: 'form-label' }, isEs ? 'Plaquetas (10^9/L o miles/mcL):' : 'Platelets (10^9/L or k/mcL):'),
    h('input', {
      type: 'number',
      class: 'form-input',
      value: localState.platelets,
      min: 10,
      max: 1000,
      oninput: (e) => {
        setViralState({ platelets: e.target.value });
        reRender();
      }
    })
  ]);
  inputGrid.appendChild(platGroup);

  calcCard.appendChild(inputGrid);

  // Calculate & Display Result
  const fibResult = calculateFib4Score(localState.age, localState.ast, localState.alt, localState.platelets);
  if (fibResult) {
    const resultCard = h('div', { class: `fib4-result-card fib4-${fibResult.level}` }, [
      h('div', { class: 'result-header' }, [
        icon(fibResult.level === 'high' ? 'alert-triangle' : 'info'),
        h('h3', {}, `${isEs ? 'Índice FIB-4 Calculado' : 'Calculated FIB-4 Index'}: ${fibResult.score}`)
      ]),
      h('p', { class: 'result-desc' }, isEs ? fibResult.descEs : fibResult.descEn)
    ]);
    calcCard.appendChild(resultCard);
  }

  wrapper.appendChild(calcCard);

  // Standards Interpretation Table
  const interpCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('help-circle'),
      h('span', {}, isEs ? FIB4_INTERPRETATION_STANDARDS.titleEs : FIB4_INTERPRETATION_STANDARDS.titleEn)
    ]),
    h('p', { class: 'fine-print text-muted' }, isEs ? FIB4_INTERPRETATION_STANDARDS.formulaEs : FIB4_INTERPRETATION_STANDARDS.formulaEn)
  ]);

  const threshGrid = h('div', { class: 'thresholds-grid' });
  for (const t of FIB4_INTERPRETATION_STANDARDS.thresholds) {
    const card = h('div', { class: `threshold-card thresh-${t.level}` }, [
      h('h3', { class: 'thresh-title' }, isEs ? t.thresholdEs : t.thresholdEn),
      h('p', { class: 'thresh-meaning' }, isEs ? t.meaningEs : t.meaningEn)
    ]);
    threshGrid.appendChild(card);
  }
  interpCard.appendChild(threshGrid);
  wrapper.appendChild(interpCard);

  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 3: HIV PrEP & 72-HOUR PEP EMERGENCY PROTOCOL
// ----------------------------------------------------------------------------

function renderPrepPepTab(localState, isEs) {
  const wrapper = h('div', { class: 'prep-pep-tab' });

  // 72-Hour PEP Emergency Callout
  const pepCard = h('section', { class: 'card pep-emergency-card' }, [
    h('div', { class: 'pep-header' }, [
      icon('clock'),
      h('h2', {}, isEs ? 'Profilaxis Posexposición de Emergencia (PEP): Ventana de 72 Horas' : 'HIV Post-Exposure Prophylaxis (PEP): Critical 72-Hour Window')
    ]),
    h('p', {}, isEs ? HIV_PREP_PEP_STANDARDS.pepSummaryEs : HIV_PREP_PEP_STANDARDS.prepSummaryEn),
    h('div', { class: 'pep-steps' }, [
      h('strong', {}, isEs ? 'Pasos Inmediatos para Acceder a PEP:' : 'Immediate Steps to Access PEP:'),
      h('ul', {}, [
        h('li', {}, isEs
          ? 'Acuda al servicio de urgencias o clínica comunitaria más cercana de inmediato (no espere al lunes).'
          : 'Visit the nearest hospital Emergency Department or urgent care clinic immediately (do not wait).'),
        h('li', {}, isEs
          ? 'La medicación (p. ej., Biktarvy o Truvada + Isentress) debe tomarse diariamente durante 28 días continuos.'
          : 'Medication (e.g. Biktarvy or Truvada + Tivicay) must be taken once daily for 28 consecutive days.'),
        h('li', {}, isEs
          ? 'La mayoría de programas estatales cuentan con fondos de emergencia para costear la PEP sin importar el seguro.'
          : 'Most state health departments provide emergency funds to cover PEP regardless of insurance coverage.')
      ])
    ])
  ]);
  wrapper.appendChild(pepCard);

  // PrEP Summary Card
  const prepCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('shield'),
      h('span', {}, isEs ? 'Profilaxis Preexposición (PrEP) para el VIH' : 'HIV Pre-Exposure Prophylaxis (PrEP)')
    ]),
    h('p', {}, isEs ? HIV_PREP_PEP_STANDARDS.prepSummaryEs : HIV_PREP_PEP_STANDARDS.prepSummaryEn)
  ]);
  wrapper.appendChild(prepCard);

  // Reinfection Prevention & Equipment Resilience
  const reinfCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('repeat'),
      h('span', {}, isEs ? 'Prevención de Reinfección del VHC y Resiliencia en Equipos' : 'HCV Reinfection Prevention & Point-of-Use Safety')
    ])
  ]);

  const reinfGrid = h('div', { class: 'reinf-grid' });
  for (const pt of HIV_PREP_PEP_STANDARDS.reinfectionPoints) {
    const item = h('div', { class: 'reinf-card' }, [
      h('h3', { class: 'reinf-title' }, isEs ? pt.topicEs : pt.topicEn),
      h('p', { class: 'reinf-desc' }, isEs ? pt.descEs : pt.descEn)
    ]);
    reinfGrid.appendChild(item);
  }
  reinfCard.appendChild(reinfGrid);
  wrapper.appendChild(reinfCard);

  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 4: PATIENT ADVOCACY & ZERO-PII EXPORT
// ----------------------------------------------------------------------------

function renderAdvocacyTab(localState, isEs) {
  const wrapper = h('div', { class: 'advocacy-tab' });

  function reRender() {
    const parent = wrapper.closest('.viral-hepatitis-view');
    if (parent) {
      clear(parent);
      parent.appendChild(renderViralHepatitisContent());
    }
  }

  // Patient Rights Card
  const rightsCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('award'),
      h('span', {}, isEs ? 'Derechos del Paciente y Eliminación de Barreras de Sobriedad' : 'Patient Rights & Eliminating Sobriety Restrictions')
    ]),
    h('p', {}, isEs
      ? 'Históricamente, muchos programas de Medicaid y aseguradoras privadas negaban los antivirales curativos a personas con consumo activo de sustancias o en etapas iniciales de tratamiento con metadona/buprenorfina. Las guías federales y de la AASLD/IDSA establecen formalmente que ESTAS PRÁCTICAS SON DISCRIMINATORIAS Y CARENTES DE FUNDAMENTO CIENTÍFICO.'
      : 'Historically, many state Medicaid programs and private insurers denied curative DAAs to patients with active substance use or those in early MOUD. AASLD/IDSA clinical guidelines explicitly declare THESE RESTRICTIONS DISCRIMINATORY AND CLINICALLY UNJUSTIFIED.'),
    h('div', { class: 'rights-checklist' }, [
      h('label', { class: 'checkbox-label' }, [
        h('input', {
          type: 'checkbox',
          checked: localState.checklistHbvCheck,
          onchange: (e) => {
            setViralState({ checklistHbvCheck: e.target.checked });
            reRender();
          }
        }),
        h('span', {}, isEs
          ? 'Cribado de Hepatitis B: Comprobé que me realizaran pruebas de HBsAg y anti-HBc antes de iniciar AAD.'
          : 'Hepatitis B screening: Confirmed HBsAg and anti-HBc are checked prior to starting DAA treatment.')
      ]),
      h('label', { class: 'checkbox-label' }, [
        h('input', {
          type: 'checkbox',
          checked: localState.checklistPpiInteraction,
          onchange: (e) => {
            setViralState({ checklistPpiInteraction: e.target.checked });
            reRender();
          }
        }),
        h('span', {}, isEs
          ? 'Interacción con antiácidos: Sé que si tomo Epclusa debo separar los antiácidos (omeprazol) al menos 4 horas.'
          : 'Antacid interaction: I know to separate proton pump inhibitors (omeprazole) by 4 hours if taking Epclusa.')
      ]),
      h('label', { class: 'checkbox-label' }, [
        h('input', {
          type: 'checkbox',
          checked: localState.checklistMoudPreserve,
          onchange: (e) => {
            setViralState({ checklistMoudPreserve: e.target.checked });
            reRender();
          }
        }),
        h('span', {}, isEs
          ? 'Continuidad de MOUD: Sé que puedo y debo continuar con mi buprenorfina o metadona sin cambios de dosis.'
          : 'MOUD continuity: I know to continue my buprenorphine or methadone uninterrupted without dose changes.')
      ]),
      h('label', { class: 'checkbox-label' }, [
        h('input', {
          type: 'checkbox',
          checked: localState.checklistSterileSupplies,
          onchange: (e) => {
            setViralState({ checklistSterileSupplies: e.target.checked });
            reRender();
          }
        }),
        h('span', {}, isEs
          ? 'Prevención de reinfección: Entiendo que curarme no me hace inmune y requiero material estéril nuevo siempre.'
          : 'Reinfection prevention: I understand cure does not grant immunity and I need sterile supplies every time.')
      ])
    ])
  ]);
  wrapper.appendChild(rightsCard);

  // Secure Plain-Text Summary Export Section
  const exportSection = h('section', { class: 'card export-section' }, [
    h('h3', {}, isEs ? 'Copia y Exportación de Resumen Clínico Seguro (Sin PII)' : 'Secure Clinical Summary Export (Zero PII)'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Genere y copie un resumen en texto plano para dialogar sobre tratamiento con antivirales, puntuación FIB-4 o PrEP con su médico:'
      : 'Generate and copy a privacy-safe text summary to discuss DAA cure options, your FIB-4 score, or PrEP with your care team:')
  ]);

  const summaryText = formatViralSummaryText(localState, isEs ? 'es' : 'en');
  const textArea = h('textarea', {
    class: 'summary-textarea',
    readonly: 'readonly',
    rows: 14,
    'aria-label': isEs ? 'Resumen Clínico de Hepatitis Viral' : 'Viral Hepatitis Summary'
  }, summaryText);

  const copyStatus = h('span', { class: 'copy-status', 'aria-live': 'polite' }, '');
  const copyBtn = h('button', {
    type: 'button',
    class: 'btn btn-primary',
    onclick: async () => {
      const ok = await copyText(summaryText, {
        trigger: copyBtn,
        copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
        failedLabel: isEs ? 'Error al copiar' : 'Copy failed',
      });
      copyStatus.textContent = ok
        ? (isEs ? ' ¡Copiado con éxito!' : ' Copied successfully!')
        : (isEs ? ' Error al copiar' : ' Copy failed');
      if (ok) setTimeout(() => { copyStatus.textContent = ''; }, 3000);
    }
  }, [
    icon('copy'),
    h('span', {}, isEs ? 'Copiar Resumen Clínico' : 'Copy Clinical Summary')
  ]);

  const resetBtn = h('button', {
    type: 'button',
    class: 'btn btn-secondary',
    onclick: () => {
      resetViralState();
      reRender();
    }
  }, [
    icon('refresh-cw'),
    h('span', {}, isEs ? 'Restablecer Estado' : 'Reset State')
  ]);

  const needleBanner = h('div', { class: 'info-callout', role: 'note' }, [
    h('strong', {}, isEs ? '¿Exposición reciente o pinchazo de aguja (< 72 horas)? ' : 'Recent sharps exposure or needle stick (< 72 hours)? '),
    h('span', {}, isEs
      ? 'Revise el protocolo de profilaxis post-exposición (PEP), IGHB y seguimiento serológico: '
      : 'Review the post-exposure prophylaxis (PEP) protocol, HBIG, and follow-up serology: '),
    h('a', { href: '#/needle-exposure' }, isEs
      ? 'Abrir Protocolo de Exposición a Agujas y PEP →'
      : 'Open Needle Stick & PEP Protocol Navigator →')
  ]);
  wrapper.appendChild(needleBanner);

  const liverBanner = h('div', { class: 'info-callout mt-2', role: 'note' }, [
    h('strong', {}, isEs ? '¿Cirrosis avanzada, ictericia, ascitis o dudas sobre medicamentos? ' : 'Advanced cirrhosis, jaundice, ascites, or medication questions? '),
    h('span', {}, isEs
      ? 'Consulte la estadificación Child-Pugh, límites de paracetamol y dosificación segura de buprenorfina y metadona: '
      : 'Consult Child-Pugh cirrhosis staging, acetaminophen thresholds, and safe MOUD dosing protocols: '),
    h('a', { href: '#/liver-care' }, isEs
      ? 'Abrir Navegador de Salud Hepática, Cirrosis y Seguridad de MOUD →'
      : 'Open Liver Health, Cirrhosis & MOUD Safety Navigator →')
  ]);
  wrapper.appendChild(liverBanner);

  const btnRow = h('div', { class: 'btn-row' }, [copyBtn, resetBtn, copyStatus]);
  exportSection.appendChild(textArea);
  exportSection.appendChild(btnRow);
  wrapper.appendChild(exportSection);

  return wrapper;
}

