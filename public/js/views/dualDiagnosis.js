// public/js/views/dualDiagnosis.js
// HarborPath — Dual Diagnosis & Integrated Mental Health Care Specialist
// Evidence-based IDDT Model, Psychotropic-MOUD Interactions, False-Positive Toxicology Registry & Crisis Planning
// Strictly Zero-PII, In-RAM ephemeral state, WCAG 2.2 AA accessible DOM

import { h, clear, icon, copyText } from '../dom.js';
import { t } from '../i18n.js';

/**
 * Integrated Dual Disorder Treatment (IDDT) core clinical principles.
 */
export const IDDT_PRINCIPLES = Object.freeze([
  {
    id: 'co_occurring_primary',
    titleEn: '1. Both Conditions Are Primary',
    titleEs: '1. Ambas afecciones son primarias',
    descEn: 'Substance use disorders and psychiatric conditions (depression, bipolar, PTSD, ADHD, psychosis) are distinct, chronic, biological conditions. Neither is simply a symptom of the other.',
    descEs: 'Los trastornos por uso de sustancias y las afecciones psiquiátricas son trastornos crónicos y biológicos distintos. Ninguno es simplemente un síntoma del otro.'
  },
  {
    id: 'integrated_not_sequential',
    titleEn: '2. Unified, Simultaneous Care (Not Sequential)',
    titleEs: '2. Atención unificada y simultánea (no secuencial)',
    descEn: 'Historical practices requiring patients to "get 90 days clean before treating depression" or "stabilize mental health before starting MOUD" violate modern standards of care. Both must be treated concurrently by the same team.',
    descEs: 'Las prácticas antiguas de exigir "90 días limpio antes de tratar la depresión" o "estabilizarse antes de iniciar MOUD" violan los estándares actuales. Ambas deben tratarse a la vez.'
  },
  {
    id: 'stage_wise_treatment',
    titleEn: '3. Stage-Wise Motivational Interventions',
    titleEs: '3. Intervenciones motivacionales por etapas',
    descEn: 'A person may be ready to take medication for depression (action stage) but not yet ready to stop drinking (contemplation stage). Treatment plans adapt to each condition independently.',
    descEs: 'Una persona puede estar lista para tomar antidepresivos (acción) pero aún no para dejar el alcohol (contemplación). El plan se adapta a cada afección por separado.'
  },
  {
    id: 'harm_reduction_philosophy',
    titleEn: '4. Harm Reduction & Relapse Support',
    titleEs: '4. Reducción de daños y apoyo ante recaídas',
    descEn: 'A recurrence of psychiatric symptoms or substance use is an opportunity for clinical re-evaluation, dose adjustment, and increased support—not punitive discharge from care.',
    descEs: 'Una recaída o crisis psiquiátrica es motivo de reevaluación médica y más apoyo, nunca de expulsión punitiva del tratamiento.'
  }
]);

/**
 * Psychotropic Medication & MOUD Compatibility Matrix.
 */
export const PSYCHOTROPIC_MOUD_PROFILES = Object.freeze([
  {
    id: 'ssri_snri',
    classEn: 'Antidepressants (SSRIs / SNRIs: Sertraline, Escitalopram, Duloxetine)',
    classEs: 'Antidepresivos (ISRS / IRSN: Sertralina, Escitalopram, Duloxetina)',
    indicationsEn: 'Major Depressive Disorder, Generalized Anxiety, Panic Disorder, PTSD, neuropathic pain (Duloxetine).',
    indicationsEs: 'Depresión mayor, ansiedad generalizada, pánico, TEPT, dolor neuropático (Duloxetina).',
    moudCompatibilityEn: 'Highly compatible with buprenorphine and naltrexone. Safe with methadone at standard doses; monitor for mild additive serotonergic effects with high-dose methadone or tramadol.',
    moudCompatibilityEs: 'Altamente compatibles con buprenorfina y naltrexona. Seguros con metadona a dosis habituales; vigilar efectos serotoninérgicos con dosis altas.',
    keyClinicalPearlsEn: [
      'First-line evidence-based pharmacotherapy for co-occurring depression and anxiety in recovery.',
      'Non-addictive, zero misuse liability, and does not cause respiratory depression.',
      'Full therapeutic benefits typically require 3 to 6 weeks of continuous daily adherence.'
    ],
    keyClinicalPearlsEs: [
      'Primera línea basada en evidencia para depresión y ansiedad en recuperación.',
      'No generan adicción, no tienen potencial de abuso y no deprimen la respiración.',
      'El efecto terapéutico completo suele requerir de 3 a 6 semanas de toma continua.'
    ]
  },
  {
    id: 'mood_stabilizers',
    classEn: 'Mood Stabilizers (Lamotrigine, Lithium, Valproate)',
    classEs: 'Estabilizadores del Ánimo (Lamotrigina, Litio, Valproato)',
    indicationsEn: 'Bipolar I and II Disorders, severe mood lability, impulse dysregulation.',
    indicationsEs: 'Trastorno bipolar I y II, labilidad afectiva severa, impulsividad.',
    moudCompatibilityEn: 'Compatible with buprenorphine, methadone, and naltrexone. Lamotrigine is widely preferred due to minimal metabolic and hepatic interactions.',
    moudCompatibilityEs: 'Compatibles con buprenorfina, metadona y naltrexona. Se prefiere lamotrigina por su bajo impacto hepático y metabólico.',
    keyClinicalPearlsEn: [
      'CRITICAL LITHIUM SAFETY: Alcohol dehydration or NSAIDs sharply increase lithium blood levels, triggering severe neurotoxicity and tremors. Strict serum level monitoring required.',
      'Valproate requires baseline hepatic liver function monitoring, especially in patients with hepatitis C or chronic alcohol use.',
      'Lamotrigine requires slow titration to prevent life-threatening rash (Stevens-Johnson syndrome).'
    ],
    keyClinicalPearlsEs: [
      'SEGURIDAD CRÍTICA CON LITIO: La deshidratación por alcohol o los AINEs disparan los niveles de litio, causando neurotoxicidad. Requiere control en sangre.',
      'El valproato requiere vigilar las enzimas hepáticas, especialmente con hepatitis C o alcohol.',
      'La lamotrigina debe aumentarse gradualmente para evitar el síndrome de Stevens-Johnson.'
    ]
  },
  {
    id: 'adhd_medications',
    classEn: 'ADHD Pharmacotherapy (Stimulant & Non-Stimulant Options)',
    classEs: 'Medicamentos para TDAH (Opciones Estimulantes y No Estimulantes)',
    indicationsEn: 'Adult Attention-Deficit/Hyperactivity Disorder, executive dysfunction, dopamine dysregulation.',
    indicationsEs: 'Trastorno por Déficit de Atención e Hiperactividad en adultos, disfunción ejecutiva.',
    moudCompatibilityEn: 'Safe and effective when co-managed with addiction medicine. Untreated ADHD triples the risk of substance recurrence due to impulsive self-medication.',
    moudCompatibilityEs: 'Seguros y eficaces bajo supervisión médica. El TDAH sin tratar triplica el riesgo de recaídas por automedicación impulsiva.',
    keyClinicalPearlsEn: [
      'Non-Stimulants First: Atomoxetine (Strattera), Viloxazine (Qelbree), Bupropion (Wellbutrin), and Clonidine/Guanfacine carry zero diversion or addiction risk.',
      'Long-Acting / Prodrug Stimulants: When stimulants are indicated, lisdexamfetamine (Vyvanse - prodrug requiring enzymatic GI cleavage) or OROS-methylphenidate (Concerta) minimize misuse potential.',
      'Prescription monitoring and pill counts support safe, transparent treatment.'
    ],
    keyClinicalPearlsEs: [
      'No estimulantes primero: Atomoxetina, viloxazina, bupropión y guanfacina no tienen riesgo de adicción.',
      'Estimulantes de acción prolongada: Lisdexanfetamina (Vyvanse) o metilfenidato OROS (Concerta) reducen el riesgo de mal uso.',
      'La supervisión médica cercana y recetas mensuales garantizan un tratamiento seguro.'
    ]
  },
  {
    id: 'bupropion_safety',
    classEn: 'Bupropion (Wellbutrin / Zyban) — Seizure Threshold Alert',
    classEs: 'Bupropión (Wellbutrin) — Alerta de Umbral Convulsivo',
    indicationsEn: 'Depression, nicotine cessation, off-label adjunct for stimulant cravings (methamphetamine).',
    indicationsEs: 'Depresión, cesación de nicotina, apoyo en antojos de metanfetamina.',
    moudCompatibilityEn: 'Compatible with buprenorphine, methadone, and naltrexone (Contrave combines naltrexone + bupropion).',
    moudCompatibilityEs: 'Compatible con buprenorfina, metadona y naltrexona.',
    keyClinicalPearlsEn: [
      'SEIZURE CONTRAINDICATION: Lowers seizure threshold. STRICTLY CONTRAINDICATED during acute alcohol or benzodiazepine withdrawal, or in patients with active eating disorders (bulimia/anorexia).',
      'Common cause of false-positive urine drug screens for amphetamines/methamphetamine on point-of-care immunoassay cups.'
    ],
    keyClinicalPearlsEs: [
      'CONTRAINDICACIÓN POR CONVULSIONES: Baja el umbral convulsivo. CONTRAINDICADO en abstinencia aguda de alcohol o benzodiacepinas y en bulimia/anorexia.',
      'Causa muy frecuente de falsos positivos para anfetaminas en pruebas rápidas de orina.'
    ]
  }
]);

/**
 * Immunoassay Toxicology False-Positive Cross-Reactivity Registry.
 */
export const TOXICOLOGY_FALSE_POSITIVES = Object.freeze([
  {
    prescribedMedicationEn: 'Bupropion (Wellbutrin, Zyban)',
    prescribedMedicationEs: 'Bupropión (Wellbutrin, Zyban)',
    falsePositiveForEn: 'Amphetamine / Methamphetamine',
    falsePositiveForEs: 'Anfetamina / Metanfetamina',
    mechanismEn: 'Chemical structural similarity cross-reacts with point-of-care immunoassay antibodies.',
    mechanismEs: 'Similitud estructural que reacciona con anticuerpos de pruebas de inmunoensayo.',
    confirmatoryMethodEn: 'Gas Chromatography-Mass Spectrometry (GC-MS) or LC-MS/MS easily confirms absence of illicit amphetamines.',
    confirmatoryMethodEs: 'Cromatografía de gases o líquidos con espectrometría de masas (GC-MS / LC-MS) descarta anfetaminas ilícitas.'
  },
  {
    prescribedMedicationEn: 'Sertraline (Zoloft)',
    prescribedMedicationEs: 'Sertralina (Zoloft)',
    falsePositiveForEn: 'Benzodiazepines',
    falsePositiveForEs: 'Benzodiacepinas',
    mechanismEn: 'Sertraline metabolite binds to benzodiazepine immunoassay receptor antibodies.',
    mechanismEs: 'Los metabolitos de sertralina se unen a los anticuerpos de prueba de benzodiacepinas.',
    confirmatoryMethodEn: 'Confirmatory LC-MS/MS differentiates sertraline metabolites from true benzodiazepines.',
    confirmatoryMethodEs: 'Prueba confirmatoria por LC-MS/MS diferencia los metabolitos de sertralina de benzodiacepinas reales.'
  },
  {
    prescribedMedicationEn: 'Quetiapine (Seroquel)',
    prescribedMedicationEs: 'Quetiapina (Seroquel)',
    falsePositiveForEn: 'Methadone',
    falsePositiveForEs: 'Metadona',
    mechanismEn: 'Quetiapine and its metabolites trigger false-positive signals on standard methadone immunoassay cups.',
    mechanismEs: 'La quetiapina y sus metabolitos activan falsos positivos en copas rápidas de metadona.',
    confirmatoryMethodEn: 'GC-MS / LC-MS confirmation is mandatory before any clinical consequence is imposed.',
    confirmatoryMethodEs: 'La confirmación por GC-MS / LC-MS es obligatoria antes de cualquier sanción clínica.'
  },
  {
    prescribedMedicationEn: 'Venlafaxine (Effexor)',
    prescribedMedicationEs: 'Venlafaxina (Effexor)',
    falsePositiveForEn: 'Phencyclidine (PCP)',
    falsePositiveForEs: 'Fenciclidina (PCP)',
    mechanismEn: 'Tramadol and venlafaxine structural fragments cross-react with PCP antibodies on rapid screens.',
    mechanismEs: 'Fragmentos estructurales de venlafaxina reaccionan con anticuerpos de PCP en pruebas rápidas.',
    confirmatoryMethodEn: 'Mandatory quantitative GC-MS confirmation clears the patient of illicit PCP use.',
    confirmatoryMethodEs: 'La confirmación cuantitativa por GC-MS descarta por completo el uso de PCP ilícito.'
  },
  {
    prescribedMedicationEn: 'Diphenhydramine (Benadryl) / Doxylamine',
    prescribedMedicationEs: 'Difenhidramina (Benadryl) / Doxilamina',
    falsePositiveForEn: 'Methadone, Opiates, or PCP',
    falsePositiveForEs: 'Metadona, Opiáceos o PCP',
    mechanismEn: 'Common OTC antihistamines and sleep aids cross-react with several rapid screen targets.',
    mechanismEs: 'Antihistamínicos comunes de venta libre reaccionan en varias tiras de pruebas rápidas.',
    confirmatoryMethodEn: 'Laboratory mass spectrometry distinguishes OTC antihistamines from controlled opioids.',
    confirmatoryMethodEs: 'La espectrometría de masas de laboratorio distingue antihistamínicos de opioides controlados.'
  }
]);

/**
 * Trauma & Seeking Safety Grounding Protocols (Lisa Najavits, PhD).
 */
export const GROUNDING_PROTOCOLS = Object.freeze([
  {
    category: 'sensory',
    titleEn: '5-4-3-2-1 Sensory Grounding Technique',
    titleEs: 'Técnica de Conexión Sensorial 5-4-3-2-1',
    stepsEn: [
      'Look around and name 5 things you can SEE (a pen, doorframe, cloud, floor tile, fingernail).',
      'Name 4 things you can physically TOUCH or FEEL (your feet on the ground, fabric of your shirt, cool desk).',
      'Name 3 distinct sounds you can HEAR (traffic outside, air conditioner, your breath).',
      'Name 2 things you can SMELL (coffee, soap, fresh air).',
      'Name 1 thing you can TASTE or take a slow sip of cold water.'
    ],
    stepsEs: [
      'Mire a su alrededor y nombre 5 cosas que pueda VER (un bolígrafo, la puerta, el suelo).',
      'Nombre 4 cosas que pueda TOCAR o SENTIR (sus pies en el piso, su ropa, la mesa fría).',
      'Nombre 3 sonidos distintos que pueda ESCUCHAR (tráfico, aire acondicionado, su respiración).',
      'Nombre 2 cosas que pueda OLER (café, jabón, aire fresco).',
      'Nombre 1 cosa que pueda SABOREAR o tome un sorbo de agua fría.'
    ]
  },
  {
    category: 'cognitive',
    titleEn: 'Cognitive Reality Orientation',
    titleEs: 'Orientación Cognitiva a la Realidad',
    stepsEn: [
      'State your full name and current age aloud.',
      'State today’s full date, year, and day of the week.',
      'State your exact location: "I am in [Room/City]."',
      'Repeat the anchor phrase: "The trauma happened in the past. I am safe in this room right now."'
    ],
    stepsEs: [
      'Diga su nombre completo y edad actual en voz alta.',
      'Diga la fecha completa de hoy, el año y el día de la semana.',
      'Diga su ubicación exacta: "Estoy en [habitación/ciudad]."',
      'Repita la frase de anclaje: "El trauma ocurrió en el pasado. Estoy a salvo en esta habitación ahora mismo."'
    ]
  },
  {
    category: 'physiological',
    titleEn: 'Physiological Calming & Vagal Stimulation',
    titleEs: 'Calma Fisiológica y Estimulación Vagal',
    stepsEn: [
      'Box Breathing: Inhale through nose for 4 seconds, hold for 4 seconds, exhale through mouth for 6 seconds.',
      'Cold Water Reset: Splash cold water on your face or hold an ice cube to activate the mammalian dive reflex and slow racing pulse.',
      'Muscle Release: Clench your fists tight for 5 seconds, then let them drop open completely, noticing the sensation of relaxation.'
    ],
    stepsEs: [
      'Respiración cuadrada: Inhale por la nariz 4 segundos, sostenga 4 segundos, exhale por la boca 6 segundos.',
      'Agua fría: Salpique agua fría en su rostro o sostenga un cubo de hielo para reducir las palpitaciones.',
      'Relajación muscular: Apriete los puños con fuerza 5 segundos y luego suéltelos por completo.'
    ]
  }
]);

/**
 * Columbia Protocol (C-SSRS) Suicide Risk Stratification Engine.
 *
 * @param {Object} answers
 * @param {boolean} [answers.wishToBeDead=false]
 * @param {boolean} [answers.suicidalThoughts=false]
 * @param {boolean} [answers.thoughtsWithMethod=false]
 * @param {boolean} [answers.suicidalIntent=false]
 * @param {boolean} [answers.intentWithPlan=false]
 * @param {boolean} [answers.recentAttempt=false]
 * @returns {Object} Stratification result with action directives and emergency hotlines.
 */
export function evaluateCrisisSafety(answers = {}) {
  const {
    wishToBeDead = false,
    suicidalThoughts = false,
    thoughtsWithMethod = false,
    suicidalIntent = false,
    intentWithPlan = false,
    recentAttempt = false
  } = answers;

  // Level 1: Imminent Emergency
  if (intentWithPlan || recentAttempt) {
    return {
      severity: 'imminent_crisis_emergency',
      titleEn: 'IMMEDIATE EMERGENCY: Active Suicidal Intent with Plan or Recent Attempt',
      titleEs: 'EMERGENCIA INMEDIATA: Intención Suicida Activa con Plan o Intento Reciente',
      summaryEn: 'You or your loved one are experiencing severe crisis with immediate safety risk. Immediate emergency connection is required.',
      summaryEs: 'Usted o su ser querido están en crisis severa con riesgo inmediato. Se requiere conexión de emergencia de inmediato.',
      directivesEn: [
        'Call or text 988 immediately (free, confidential, 24/7 Suicide & Crisis Lifeline).',
        'If in immediate physical danger, call 911 or go to the nearest emergency department under EMTALA protections.',
        'Veterans: Dial 988, then press 1. LGBTQ+ Youth: Call The Trevor Project at 866-488-7386.',
        'Lethal Means Safety: Do not leave the person alone. Lock up or remove all firearms, prescription medications, and sharp objects immediately.'
      ],
      directivesEs: [
        'Llame o envíe un mensaje de texto al 988 de inmediato (Línea 988 confidencial y gratuita las 24 horas).',
        'Si hay peligro físico inmediato, llame al 911 o acuda a urgencias bajo la protección de EMTALA.',
        'Veteranos: Marque 988 y presione 1. Jóvenes LGBTQ+: Llame a The Trevor Project al 866-488-7386.',
        'Seguridad de medios letales: No deje sola a la persona. Guarde bajo llave armas de fuego y medicamentos.'
      ]
    };
  }

  // Level 2: Moderate Risk
  if (suicidalIntent || thoughtsWithMethod) {
    return {
      severity: 'moderate_crisis_support',
      titleEn: 'URGENT: Suicidal Thoughts with Method or Emerging Intent',
      titleEs: 'URGENTE: Pensamientos Suicidas con Método o Intención',
      summaryEn: 'Presence of suicidal ideation with method requires urgent psychiatric care, counseling, and lethal means safety restrictions.',
      summaryEs: 'Tener pensamientos con método requiere atención psiquiátrica urgente, asesoría y retiro de medios letales.',
      directivesEn: [
        'Call or text 988 to connect with a crisis counselor right now.',
        'Schedule an urgent same-day evaluation with your psychiatrist, counselor, or addiction clinic.',
        'Put lethal means safeguards in place: have a trusted family member hold car keys and medications in a lockbox.',
        'Complete the personal Crisis Safety Plan below and identify 2 trusted supportive contacts.'
      ],
      directivesEs: [
        'Llame o envíe un mensaje de texto al 988 para hablar con un consejero de crisis ahora mismo.',
        'Programe una consulta prioritaria hoy mismo con su psiquiatra, consejero o clínica de adicciones.',
        'Asegure medios letales: pida a un ser querido que guarde medicamentos bajo llave.',
        'Complete el Plan de Seguridad contra Crisis que figura abajo y elija 2 contactos de confianza.'
      ]
    };
  }

  // Level 3: Passive Ideation / Mild Distress
  if (wishToBeDead || suicidalThoughts) {
    return {
      severity: 'passive_ideation_support',
      titleEn: 'SUPPORTIVE: Passive Suicidal Thoughts / Deep Emotional Pain',
      titleEs: 'APOYO: Pensamientos Pasivos de Muerte o Dolor Emocional Profundo',
      summaryEn: 'Expressing a wish to not wake up or feeling overwhelming emotional exhaustion is a sign of intense pain that deserves compassionate support.',
      summaryEs: 'Desear no despertar o sentir un agotamiento emocional extremo es señal de dolor profundo que merece apoyo comprensivo.',
      directivesEn: [
        'You do not have to carry this alone. Text "HOME" to 741741 (Crisis Text Line) or call 988 anytime.',
        'Share how you are feeling with your doctor or therapist so they can review your treatment plan.',
        'Focus on daily self-care, grounding exercises, and staying connected with supportive peers.'
      ],
      directivesEs: [
        'No tiene que llevar esta carga a solas. Envíe "HOME" al 741741 o llame al 988 en cualquier momento.',
        'Comparta cómo se siente con su médico o terapeuta para ajustar su tratamiento.',
        'Practique ejercicios de conexión a tierra y mantenga contacto con personas de apoyo.'
      ]
    };
  }

  // Level 4: Clear / Routine Dual Care
  return {
    severity: 'routine_mental_health_care',
    titleEn: 'Stable: Clear for Integrated Outpatient Care',
    titleEs: 'Estable: Adecuado para Atención Ambulatoria Integrada',
    summaryEn: 'No acute crisis reported. You are in an appropriate position to explore integrated dual disorder therapy, medication management, and trauma recovery.',
    summaryEs: 'No se reporta crisis aguda. Se encuentra en condiciones adecuadas para terapia integrada, medicamentos y recuperación del trauma.',
    directivesEn: [
      'Explore certified IDDT clinics and behavioral health centers using HarborPath tools.',
      'Check medication compatibility and false-positive toxicology references.',
      'Practice regular grounding and emotional regulation skills.'
    ],
    directivesEs: [
      'Busque clínicas certificadas en diagnóstico dual y centros de salud mental.',
      'Revise la compatibilidad de medicamentos y referencias de pruebas toxicológicas.',
      'Practique ejercicios de conexión a tierra y regulación emocional.'
    ]
  };
}

/**
 * Builds patient self-advocacy scripts for mental health & toxicology issues.
 *
 * @param {Object} params
 * @param {string} params.scriptType - 'iddt_request' | 'confirmatory_gcms' | 'adhd_advocacy' | 'trauma_boundary'
 * @param {string} [params.medicationName='']
 * @returns {string} Script text
 */
export function buildDualDiagnosisScript({ scriptType = 'iddt_request', medicationName = '' } = {}) {
  if (scriptType === 'iddt_request') {
    return '“Hello. I am seeking integrated dual disorder treatment for both my substance use and my mental health condition. Under SAMHSA and ASAM evidence-based standards, I am looking for a care team that treats both conditions simultaneously in the same setting, rather than requiring me to resolve one before addressing the other. Can you tell me how your program integrates psychiatric care with addiction medicine?”';
  }

  if (scriptType === 'confirmatory_gcms') {
    const med = medicationName.trim() ? medicationName.trim() : '[Prescribed Medication]';
    return `“My preliminary urine screen indicated a positive result, but I am currently taking prescribed ${med}, which is a well-documented cause of immunoassay cross-reactivity and false positives. Under clinical standards and federal laboratory regulations, point-of-care rapid screens are presumptive only. I am exercising my right to request an immediate confirmatory Gas Chromatography-Mass Spectrometry (GC-MS) or LC-MS/MS test to verify this result before any change is made to my treatment plan or privileges.”`;
  }

  if (scriptType === 'adhd_advocacy') {
    return '“I would like to request a formal evaluation for ADHD. Research shows that untreated ADHD significantly increases the risk of substance recurrence due to executive dysfunction and impulsivity. I want to work collaboratively with you on a safe treatment plan—whether that involves non-stimulant medications like atomoxetine or bupropion, or long-acting formulations under close medical supervision.”';
  }

  if (scriptType === 'trauma_boundary') {
    return '“I want to let you know that I have a history of trauma. I am committed to working with you, but I need us to move at a pace where I feel safe and grounded. If I ask to pause a discussion or take a breath, I need you to honor that boundary so I do not become emotionally flooded or dissociated.”';
  }

  return '';
}

/**
 * In-RAM Ephemeral State for Dual Diagnosis View.
 */
let dualDiagnosisState = {
  activeTab: 'iddt-model', // 'iddt-model' | 'med-compat' | 'toxicology' | 'grounding' | 'crisis-plan' | 'scripts'
  wishToBeDead: false,
  suicidalThoughts: false,
  thoughtsWithMethod: false,
  suicidalIntent: false,
  intentWithPlan: false,
  recentAttempt: false,
  selectedScriptType: 'confirmatory_gcms',
  testedMedication: 'Bupropion (Wellbutrin)'
};

export function getDualDiagnosisState() {
  return { ...dualDiagnosisState };
}

export function setDualDiagnosisState(patch) {
  dualDiagnosisState = { ...dualDiagnosisState, ...patch };
}

export function resetDualDiagnosisState() {
  dualDiagnosisState = {
    activeTab: 'iddt-model',
    wishToBeDead: false,
    suicidalThoughts: false,
    thoughtsWithMethod: false,
    suicidalIntent: false,
    intentWithPlan: false,
    recentAttempt: false,
    selectedScriptType: 'confirmatory_gcms',
    testedMedication: 'Bupropion (Wellbutrin)'
  };
}

/**
 * Formats a plain text clinical & patient rights summary report.
 *
 * @param {Object} state
 * @param {string} [lang='en']
 * @returns {string} Plain text summary
 */
export function formatDualDiagnosisSummaryText(state = dualDiagnosisState, lang = 'en') {
  const isEs = lang === 'es';
  const crisisResult = evaluateCrisisSafety(state);

  const lines = [
    isEs ? 'HARBORPATH — REPORTE DE DIAGNÓSTICO DUAL Y SALUD INTEGRADA' : 'HARBORPATH — DUAL DIAGNOSIS & INTEGRATED MENTAL HEALTH REPORT',
    isEs ? `Fecha y hora: ${new Date().toISOString()}` : `Generated: ${new Date().toISOString()}`,
    '------------------------------------------------------------',
    isEs ? `EVALUACIÓN DE CRISIS Y SEGURIDAD: ${crisisResult.titleEs}` : `CRISIS & SAFETY STATUS: ${crisisResult.titleEn}`,
    isEs ? `Resumen: ${crisisResult.summaryEs}` : `Summary: ${crisisResult.summaryEn}`,
    '',
    isEs ? 'DIRECTIVAS DE ACCIÓN Y RECURSOS:' : 'ACTION DIRECTIVES & RESOURCES:',
    ...(isEs ? crisisResult.directivesEs : crisisResult.directivesEn).map((d, idx) => `${idx + 1}. ${d}`),
    '',
    isEs ? 'PRINCIPIOS DEL MODELO INTEGRADO (IDDT):' : 'INTEGRATED MODEL (IDDT) PRINCIPLES:',
    isEs
      ? '- Ambos trastornos son primarios; deben tratarse simultáneamente por el mismo equipo.'
      : '- Both conditions are primary; treatment must be concurrent and integrated by the same team.',
    isEs
      ? '- Los pacientes NO deben ser obligados a "estar 90 días limpios" antes de recibir tratamiento psiquiátrico.'
      : '- Patients must never be forced to "get clean" before receiving psychiatric care.',
    '',
    isEs ? 'REGISTRO DE FALSOS POSITIVOS EN TOXICOLOGÍA:' : 'TOXICOLOGY FALSE-POSITIVE REGISTRY:',
    isEs
      ? '- Bupropión puede dar falso positivo para anfetaminas; Sertralina para benzodiacepinas.'
      : '- Bupropion cross-reacts as amphetamines; Sertraline cross-reacts as benzodiazepines.',
    isEs
      ? '- Toda prueba rápida positiva DEBE confirmarse por GC-MS o LC-MS/MS antes de imponer sanciones.'
      : '- Any presumptive positive MUST be confirmed by GC-MS / LC-MS/MS before punitive consequences.',
    '------------------------------------------------------------',
    isEs
      ? 'Aviso: Esta herramienta es una guía educativa clínica. No sustituye la evaluación médica o psiquiátrica profesional.'
      : 'Disclaimer: This tool provides educational and clinical guidance. It does not substitute professional psychiatric or medical care.'
  ];

  return lines.join('\n');
}

/**
 * Main View Renderer for Dual Diagnosis.
 *
 * @returns {HTMLElement}
 */
export function dualDiagnosisView() {
  const container = h('div', { class: 'dual-diagnosis-view container' });

  // Header Section
  const header = h('header', { class: 'view-header' },
    h('div', { class: 'badge-pill' }, icon('shield'), t('dual.badge', 'Integrated Dual Disorder Treatment (IDDT)')),
    h('h1', null, t('dual.title', 'Dual Diagnosis, Mental Health & MOUD Integration')),
    h('p', { class: 'lead' },
      t('dual.lead', 'Evidence-based integrated care for co-occurring mental health and substance use disorders, psychotropic medication safety, false-positive toxicology rights, trauma grounding, and suicide crisis planning.')
    )
  );

  // Accessible Tab Navigation
  const tabNav = h('div', { class: 'tab-nav', role: 'tablist', 'aria-label': t('dual.tablist', 'Dual Diagnosis Navigation') });

  const tabs = [
    { id: 'iddt-model', label: t('dual.tab.iddt', 'Integrated Care (IDDT)') },
    { id: 'med-compat', label: t('dual.tab.meds', 'Psychotropics & MOUD') },
    { id: 'toxicology', label: t('dual.tab.tox', 'False-Positive Registry') },
    { id: 'grounding', label: t('dual.tab.trauma', 'Trauma & Grounding') },
    { id: 'crisis-plan', label: t('dual.tab.crisis', 'Crisis & Safety Plan') },
    { id: 'scripts', label: t('dual.tab.scripts', 'Self-Advocacy Scripts') }
  ];

  const tabButtons = new Map();
  const contentArea = h('div', { class: 'tab-content-area', id: 'dual-content-slot', 'aria-live': 'polite' });

  function switchTab(newTabId) {
    dualDiagnosisState.activeTab = newTabId;
    for (const [id, btn] of tabButtons) {
      const isActive = id === newTabId;
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
    renderActiveTab();
  }

  for (const tab of tabs) {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      class: 'tab-btn' + (dualDiagnosisState.activeTab === tab.id ? ' active' : ''),
      id: `tab-dual-${tab.id}`,
      'aria-selected': dualDiagnosisState.activeTab === tab.id ? 'true' : 'false',
      'aria-controls': 'panel-dual-active',
      tabindex: dualDiagnosisState.activeTab === tab.id ? '0' : '-1'
    }, tab.label);

    btn.addEventListener('click', () => switchTab(tab.id));
    tabButtons.set(tab.id, btn);
    tabNav.appendChild(btn);
  }

  // Keyboard navigation for tablist (roving tabindex)
  tabNav.addEventListener('keydown', (e) => {
    const tabIds = tabs.map((t) => t.id);
    const currIndex = tabIds.indexOf(dualDiagnosisState.activeTab);
    let nextIndex = currIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currIndex + 1) % tabIds.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currIndex - 1 + tabIds.length) % tabIds.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = tabIds.length - 1;
      e.preventDefault();
    }

    if (nextIndex !== currIndex) {
      const nextId = tabIds[nextIndex];
      switchTab(nextId);
      const nextBtn = tabButtons.get(nextId);
      if (nextBtn) nextBtn.focus();
    }
  });

  // Render Tab Content
  function renderActiveTab() {
    clear(contentArea);
    const activeTab = dualDiagnosisState.activeTab;
    const panel = h('section', {
      role: 'tabpanel',
      id: 'panel-dual-active',
      'aria-labelledby': `tab-dual-${activeTab}`,
      class: 'tab-panel'
    });

    if (activeTab === 'iddt-model') {
      renderIddtModel(panel);
    } else if (activeTab === 'med-compat') {
      renderMedCompat(panel);
    } else if (activeTab === 'toxicology') {
      renderToxicology(panel);
    } else if (activeTab === 'grounding') {
      renderGrounding(panel);
    } else if (activeTab === 'crisis-plan') {
      renderCrisisPlan(panel);
    } else if (activeTab === 'scripts') {
      renderScripts(panel);
    }

    contentArea.appendChild(panel);
  }

  // TAB 1: IDDT Model
  function renderIddtModel(panel) {
    panel.appendChild(h('h2', null, t('dual.iddt.title', 'Integrated Dual Disorder Treatment (IDDT) Model')));
    panel.appendChild(h('p', null, t('dual.iddt.intro', 'Over 50% of individuals with substance use disorders have co-occurring mental health conditions. Modern SAMHSA and ASAM standards require integrated, simultaneous treatment:')));

    const grid = h('div', { class: 'pathway-cards-grid' });
    for (const principle of IDDT_PRINCIPLES) {
      const card = h('article', { class: 'action-card' },
        h('h3', null, principle.titleEn),
        h('p', null, principle.descEn)
      );
      grid.appendChild(card);
    }
    panel.appendChild(grid);
  }

  // TAB 2: Psychotropics & MOUD
  function renderMedCompat(panel) {
    panel.appendChild(h('h2', null, t('dual.meds.title', 'Psychotropic Medications & MOUD Clinical Compatibility')));
    panel.appendChild(h('p', null, t('dual.meds.intro', 'Taking medications for depression, bipolar disorder, ADHD, or anxiety alongside buprenorphine, methadone, or naltrexone is safe, evidence-based, and saves lives.')));

    const psychNotice = h('div', { class: 'callout callout-warning mt-2' },
      h('h3', null, 'Bipolar & Psychosis Clinical Alert: Lithium & Psychedelics'),
      h('p', null, 'Co-ingestion of Lithium with classical 5-HT2A psychedelics (LSD, psilocybin) carries a near-100% incidence of grand mal seizures and status epilepticus. Furthermore, HPPD (visual snow, trailing) must NOT be misdiagnosed as schizophrenia or psychosis. For full clinical protocols, see the '),
      h('a', { href: '#/psychedelic-care' }, 'Psychedelic Care, 5-HT2A Crisis & HPPD Navigator →')
    );
    panel.appendChild(psychNotice);

    const grid = h('div', { class: 'pathway-cards-grid' });
    for (const med of PSYCHOTROPIC_MOUD_PROFILES) {
      const card = h('article', { class: 'action-card' },
        h('h3', null, med.classEn),
        h('p', null, h('strong', null, 'Indications: '), med.indicationsEn),
        h('p', null, h('strong', null, 'MOUD Compatibility: '), med.moudCompatibilityEn),
        h('h4', null, 'Clinical Pearls & Safety:'),
        h('ul', null,
          med.keyClinicalPearlsEn.map((p) => h('li', null, p))
        )
      );
      grid.appendChild(card);
    }
    panel.appendChild(grid);
  }

  // TAB 3: Toxicology False-Positive Registry
  function renderToxicology(panel) {
    panel.appendChild(h('h2', null, t('dual.tox.title', 'Immunoassay False-Positive Cross-Reactivity Registry')));
    panel.appendChild(h('p', null, t('dual.tox.intro', 'Point-of-care rapid urine cups frequently produce false positives due to chemical cross-reactivity with legal psychiatric and OTC medications. Know your rights to confirmatory testing:')));

    const grid = h('div', { class: 'pathway-cards-grid' });
    for (const tox of TOXICOLOGY_FALSE_POSITIVES) {
      const card = h('article', { class: 'action-card' },
        h('h3', null, tox.prescribedMedicationEn),
        h('p', { class: 'danger-text' }, h('strong', null, 'Can Trigger False Positive For: '), tox.falsePositiveForEn),
        h('p', null, h('strong', null, 'Mechanism: '), tox.mechanismEn),
        h('p', null, h('strong', null, 'Mandatory Confirmatory Step: '), tox.confirmatoryMethodEn)
      );
      grid.appendChild(card);
    }
    panel.appendChild(grid);
  }

  // TAB 4: Trauma & Grounding (Seeking Safety)
  function renderGrounding(panel) {
    panel.appendChild(h('h2', null, t('dual.trauma.title', 'Trauma, PTSD & Seeking Safety Grounding Protocols')));
    panel.appendChild(h('p', null, t('dual.trauma.intro', 'Over 60% of people in addiction recovery carry significant trauma. Grounding exercises detach you from emotional pain by redirecting your nervous system to the physical present.')));

    const grid = h('div', { class: 'pathway-cards-grid' });
    for (const proto of GROUNDING_PROTOCOLS) {
      const card = h('article', { class: 'action-card' },
        h('h3', null, proto.titleEn),
        h('ol', null,
          proto.stepsEn.map((s) => h('li', null, s))
        )
      );
      grid.appendChild(card);
    }
    panel.appendChild(grid);
  }

  // TAB 5: Crisis & Safety Plan (Columbia Protocol)
  function renderCrisisPlan(panel) {
    panel.appendChild(h('h2', null, t('dual.crisis.title', 'Suicide Risk Assessment & Crisis Safety Planning')));
    panel.appendChild(h('p', null, t('dual.crisis.intro', 'Based on the Columbia-Suicide Severity Rating Scale (C-SSRS), check any statements that describe your current feelings to generate safety directives and crisis resources:')));

    const form = h('div', { class: 'form-card' });

    function createCheckbox(id, labelEn, isChecked, onChange) {
      const wrap = h('label', { class: 'checkbox-label' },
        h('input', {
          type: 'checkbox',
          id,
          name: id,
          ...(isChecked ? { checked: 'checked' } : {})
        }),
        h('span', null, labelEn)
      );
      wrap.querySelector('input').addEventListener('change', (e) => onChange(e.target.checked));
      return wrap;
    }

    form.appendChild(createCheckbox(
      'chk-wish-dead',
      'Have you wished you were dead or wished you could go to sleep and not wake up?',
      dualDiagnosisState.wishToBeDead,
      (val) => { dualDiagnosisState.wishToBeDead = val; updateCrisisResult(); }
    ));

    form.appendChild(createCheckbox(
      'chk-thoughts',
      'Have you had any actual thoughts of killing yourself?',
      dualDiagnosisState.suicidalThoughts,
      (val) => { dualDiagnosisState.suicidalThoughts = val; updateCrisisResult(); }
    ));

    form.appendChild(createCheckbox(
      'chk-method',
      'Have you thought about how you might do this (a specific method)?',
      dualDiagnosisState.thoughtsWithMethod,
      (val) => { dualDiagnosisState.thoughtsWithMethod = val; updateCrisisResult(); }
    ));

    form.appendChild(createCheckbox(
      'chk-intent',
      'Have you had these thoughts and had some intention of acting on them?',
      dualDiagnosisState.suicidalIntent,
      (val) => { dualDiagnosisState.suicidalIntent = val; updateCrisisResult(); }
    ));

    form.appendChild(createCheckbox(
      'chk-plan',
      'Have you started to work out or worked out the details of how to kill yourself?',
      dualDiagnosisState.intentWithPlan,
      (val) => { dualDiagnosisState.intentWithPlan = val; updateCrisisResult(); }
    ));

    panel.appendChild(form);

    const resultCard = h('div', { class: 'script-preview-card', id: 'crisis-output-card' });
    panel.appendChild(resultCard);

    function updateCrisisResult() {
      clear(resultCard);
      const evalRes = evaluateCrisisSafety(dualDiagnosisState);

      resultCard.appendChild(h('h3', null, evalRes.titleEn));
      resultCard.appendChild(h('p', { class: 'lead' }, evalRes.summaryEn));
      resultCard.appendChild(h('h4', null, 'Immediate Directives:'));
      resultCard.appendChild(h('ul', null,
        evalRes.directivesEn.map((d) => h('li', null, d))
      ));
    }

    updateCrisisResult();

    // Export Button
    const exportBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary'
    }, icon('share'), t('dual.copyReport', 'Copy Dual Diagnosis Care Report'));

    exportBtn.addEventListener('click', async () => {
      const summary = formatDualDiagnosisSummaryText(dualDiagnosisState);
      await copyText(summary, {
        trigger: exportBtn,
        copiedLabel: t('dual.copied', 'Report Copied to Clipboard!'),
        announceSuccess: t('dual.copied', 'Report Copied to Clipboard!'),
      });
    });

    panel.appendChild(exportBtn);
  }

  // TAB 6: Self-Advocacy Scripts
  function renderScripts(panel) {
    panel.appendChild(h('h2', null, t('dual.scripts.title', 'Patient Self-Advocacy Script Composer')));
    panel.appendChild(h('p', null, t('dual.scripts.intro', 'Use these evidence-based, legally grounded scripts to advocate with your psychiatrist, addiction clinic, or counselor:')));

    const form = h('div', { class: 'form-card' });

    const selectLabel = h('label', { for: 'select-dual-script', class: 'field-label' },
      h('strong', null, 'Select Advocacy Goal: ')
    );
    const select = h('select', { id: 'select-dual-script', class: 'input-field' },
      h('option', { value: 'confirmatory_gcms' }, 'Demanding GC-MS Confirmatory Testing for False-Positive Urine Screen'),
      h('option', { value: 'iddt_request' }, 'Requesting Integrated Dual Diagnosis Treatment (IDDT)'),
      h('option', { value: 'adhd_advocacy' }, 'Requesting ADHD Evaluation in Recovery'),
      h('option', { value: 'trauma_boundary' }, 'Establishing a Trauma-Informed Safety Boundary')
    );
    select.value = dualDiagnosisState.selectedScriptType;

    select.addEventListener('change', (e) => {
      dualDiagnosisState.selectedScriptType = e.target.value;
      updateScriptText();
    });

    form.appendChild(selectLabel);
    form.appendChild(select);
    panel.appendChild(form);

    const scriptPreview = h('div', { class: 'script-preview-card' });
    const scriptBox = h('blockquote', { class: 'script-text', id: 'dual-script-output' });
    scriptPreview.appendChild(h('h3', null, 'Script Preview:'));
    scriptPreview.appendChild(scriptBox);

    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary'
    }, icon('share'), 'Copy Script to Clipboard');

    copyBtn.addEventListener('click', async () => {
      const txt = scriptBox.textContent;
      await copyText(txt, {
        trigger: copyBtn,
        copiedLabel: t('dual.scriptCopied', 'Script Copied!'),
        announceSuccess: t('dual.scriptCopied', 'Script Copied!'),
      });
    });

    scriptPreview.appendChild(copyBtn);
    panel.appendChild(scriptPreview);

    function updateScriptText() {
      const script = buildDualDiagnosisScript({
        scriptType: dualDiagnosisState.selectedScriptType,
        medicationName: dualDiagnosisState.testedMedication
      });
      scriptBox.textContent = script;
    }

    updateScriptText();
  }

  // Initial tab render
  renderActiveTab();

  container.appendChild(header);
  container.appendChild(tabNav);
  container.appendChild(contentArea);

  return container;
}
