// public/js/views/ghbCare.js
// HarborPath - GHB, GBL, 1,4-BDO Harm Reduction, Coma Triage & Severe Withdrawal Navigator
// Clinical consensus: British Association for Psychopharmacology (BAP) Guidelines for GHB/GBL Detoxification (Lingford-Hughes et al.),
// Dutch National Guidelines for GHB Detoxification & Relapse Prevention (NISPA / De Jong et al.),
// American College of Medical Toxicology (ACMT) Guidance on Gamma-Hydroxybutyrate Overdose & Withdrawal,
// European Monitoring Centre for Drugs and Drug Addiction (EMCDDA) Chemsex & GHB Safety Advisories.
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: GHB, GBL & 1,4-BDO PHARMACOLOGY
// ============================================================================

export const GHB_COMPOUND_PROFILES = Object.freeze({
  ghb: Object.freeze({
    id: 'ghb',
    name: 'GHB (Gamma-Hydroxybutyrate / Sodium Oxybate / Xyrem)',
    streetNamesEn: 'G, Liquid G, Liquid X, Gina, Juice, Soap',
    streetNamesEs: 'G, G líquido, Éxtasis líquido, Biberón',
    pharmacologyEn: 'Endogenous nutrient and neurotransmitter acting as a full agonist at both inhibitory GABA-B receptors and specific excitatory GHB receptors. Dose-response curve is notoriously non-linear and steep: 1.0–1.5 g produces mild relaxation/euphoria; 2.0–2.5 g causes profound lethargy and motor ataxia; > 3.0 g produces sudden unrousable coma and central respiratory arrest.',
    pharmacologyEs: 'Agonista de receptores inhibidores GABA-B y receptores específicos de GHB. Curva dosis-respuesta extremadamente empinada y no lineal: 1.0-1.5 g produce relajación; 2.0-2.5 g induce letargo grave; > 3.0 g desencadena coma súbito y paro respiratorio central.',
    onsetDurationEn: 'Onset: 15 to 30 min. Peak: 30 to 60 min. Duration: 2 to 4 hours. Rapid elimination half-life of 30 to 50 minutes.',
    onsetDurationEs: 'Inicio: 15 a 30 min. Pico: 30 a 60 min. Duración: 2 a 4 horas. Vida media muy corta de 30 a 50 minutos.',
    tasteVisualEn: 'Colorless, transparent liquid or powder. Distinctive salty, soapy, or seawater chemical taste.',
    tasteVisualEs: 'Líquido o polvo incoloro y transparente. Sabor químico salado, jabonoso o a agua de mar.',
  }),

  gbl: Object.freeze({
    id: 'gbl',
    name: 'GBL (Gamma-Butyrolactone)',
    streetNamesEn: 'GBL, Blue Nitro, Fire Water, Wheel Cleaner',
    streetNamesEs: 'GBL, Limpiador de llantas, Disolvente industrial',
    pharmacologyEn: 'Industrial solvent and lipophilic chemical prodrug of GHB. Rapidly and completely converted into GHB within 60 seconds by serum lactonase enzymes. Because GBL is vastly more lipid-soluble than GHB, it crosses biological membranes and the blood-brain barrier far more rapidly, resulting in faster onset, higher peak blood concentrations, and roughly 2x higher potency by volume (1 mL GBL equates to approximately 1.6–2.0 g GHB).',
    pharmacologyEs: 'Disolvente industrial y profármaco lipofílico. La lactonasa sérica lo convierte en GHB en menos de 60 segundos. Al ser muy liposoluble, atraviesa la barrera hematoencefálica con gran rapidez; tiene el doble de potencia por volumen (1 mL de GBL equivale a 1.6-2.0 g de GHB).',
    onsetDurationEn: 'Onset: 10 to 20 min. Peak: 20 to 45 min. Duration: 1.5 to 3 hours.',
    onsetDurationEs: 'Inicio: 10 a 20 min. Pico: 20 a 45 min. Duración: 1.5 a 3 horas.',
    tasteVisualEn: 'Clear oily liquid with a sharp, noxious, bitter, synthetic chemical taste and acrid odor. Corrosive to plastics and soft tissue; must be diluted in water.',
    tasteVisualEs: 'Líquido oleoso transparente con sabor químico acre, amargo y corrosivo para mucosas y plásticos; siempre debe diluirse en abundante agua.',
  }),

  bdo: Object.freeze({
    id: 'bdo',
    name: '1,4-BDO (1,4-Butanediol)',
    streetNamesEn: 'BDO, 1,4-BD, Enliven, Dormir',
    streetNamesEs: '1,4-BDO, Butanodiol, Disolvente orgánico',
    pharmacologyEn: 'Industrial chemical and prodrug metabolized in vivo into GHB via alcohol dehydrogenase (ADH) and aldehyde dehydrogenase. THE ALCOHOL DEHYDROGENASE METABOLIC TRAP: Alcohol has a significantly higher binding affinity for ADH than 1,4-BDO. Co-ingestion of alcohol completely blocks the conversion of BDO, leaving it to circulate unmetabolized. Hours later, as the liver finishes clearing the alcohol, ADH suddenly begins metabolizing the accumulated reservoir of 1,4-BDO into GHB, causing sudden, delayed catastrophic coma and respiratory arrest hours after alcohol consumption!',
    pharmacologyEs: 'Profármaco metabolizado a GHB por la enzima alcohol deshidrogenasa (ADH). LA TRAMPA METABÓLICA DEL ALCOHOL: El alcohol tiene mayor afinidad por la ADH que el 1,4-BDO y bloquea su conversión. Horas después, cuando el hígado elimina el alcohol, la ADH procesa de golpe el BDO acumulado, provocando un coma catastrófico tardío.',
    onsetDurationEn: 'Onset: 30 to 60 min (delayed). Peak: 60 to 90 min. Duration: 3 to 5 hours.',
    onsetDurationEs: 'Inicio: 30 a 60 min (retrasado). Pico: 60 a 90 min. Duración: 3 a 5 horas.',
    tasteVisualEn: 'Clear, viscous liquid with a sweet, bitter, slightly metallic chemical taste. Freezes into solid crystals at 68°F (20°C).',
    tasteVisualEs: 'Líquido viscoso transparente con sabor dulce, amargo y metálico. Se congela o solidifica a 20 °C (68 °F).',
  }),
});

// ============================================================================
// CLINICAL STAGING: GHB WITHDRAWAL SYNDROME (GWS)
// ============================================================================

export const GWS_WITHDRAWAL_STAGES = Object.freeze([
  {
    stageId: 'mild',
    titleEn: 'Stage 1: Mild Early Withdrawal (1 to 4 Hours Since Last Dose)',
    titleEs: 'Fase 1: Abstinencia Leve Temprana (1 a 4 horas tras la última toma)',
    symptomsEn: [
      'Onset begins very rapidly (1 to 3 hours after last dose) due to short half-life',
      'Moderate anxiety, intense craving, restlessness, inner tension',
      'Fine postural hand tremor',
      'Diaphoresis (sweating), tachycardia (HR 90-110 bpm)',
      'Insomnia: complete inability to fall asleep without a dose',
    ],
    symptomsEs: [
      'Inicio muy rápido (1 a 3 horas tras la última toma) por su vida media corta',
      'Ansiedad moderada, intenso deseo de consumo (craving), inquietud e insomnio',
      'Temblor fino en las manos',
      'Sudoración y taquicardia (90-110 lpm)',
      'Incapacidad absoluta para dormir sin una nueva toma',
    ],
    managementEn: 'Clinical assessment required. Transition to round-the-clock dosing schedule under medical care. Do not attempt unmonitored cold-turkey cessation.',
    managementEs: 'Evaluación médica urgente. Se prohíbe la suspensión brusca ambulatoria.',
  },
  {
    stageId: 'moderate',
    titleEn: 'Stage 2: Moderate Autonomic Hyperactivity (4 to 12 Hours)',
    titleEs: 'Fase 2: Hiperactividad Autonómica Moderada (4 a 12 horas)',
    symptomsEn: [
      'Marked autonomic surge: persistent tachycardia (HR > 110-130 bpm), hypertension (BP > 140/90)',
      'Severe coarse tremors, muscle twitching, fasciculations',
      'Nausea, retching, anorexia',
      'Heightened sensory sensitivity (photophobia, hyperacusis)',
      'Severe panic, hypervigilance, early perceptual distortions (shadows in peripheral vision)',
    ],
    symptomsEs: [
      'Descarga autonómica: taquicardia (FC > 110-130 lpm), hipertensión (PA > 140/90)',
      'Temblores intensos, espasmos musculares y náuseas',
      'Fotofobia e hipersensibilidad a los ruidos',
      'Pánico severo y distorsiones perceptivas incipientes (sombras periféricas)',
    ],
    managementEn: 'Urgent hospital or specialized medical detox admission. First-line oral Diazepam plus Baclofen (10-20 mg TID) to target specific GABA-B receptor deficit.',
    managementEs: 'Ingreso urgente en desintoxicación hospitalaria. Diazepam oral más baclofeno (10-20 mg cada 8h) para suplir el déficit de GABA-B.',
  },
  {
    stageId: 'severe',
    titleEn: 'Stage 3: Severe Delirium, Psychosis & Status Epilepticus (12 to 72+ Hours)',
    titleEs: 'Fase 3: Delirio Agudo, Psicosis y Convulsiones (12 a 72+ horas)',
    symptomsEn: [
      'LIFE-THREATENING EMERGENCY: Severe acute paranoid delirium with disorientation to time and place',
      'Vivid auditory, visual, and tactile hallucinations (insects crawling, threatening voices)',
      'Extreme motor agitation, combativeness, severe confusion',
      'Hyperpyrexia / Malignant hyperthermia (> 102°F / 39°C), rhabdomyolysis, renal failure',
      'Status epilepticus, tonic-clonic seizures, cardiovascular collapse',
    ],
    symptomsEs: [
      'EMERGENCIA VITAL MORTAL: Delirio agitado con desorientación témporo-espacial',
      'Alucinaciones visuales, auditivas y táctiles vívidas (insectos en la piel)',
      'Agitación psicomotriz extrema, combatividad y confusión profunda',
      'Hipertermia maligna (> 39 °C), rabdomiólisis y fallo renal agudo',
      'Convulsiones tónico-clónicas, estatus epiléptico y colapso cardiovascular',
    ],
    managementEn: 'IMMEDIATE ICU ADMISSION. High-dose IV benzodiazepines (Diazepam 10-20 mg IV q15min), IV Baclofen or Phenobarbital / Propofol continuous infusion for refractory delirium. Avoid neuroleptics (haloperidol) alone as they worsen seizures.',
    managementEs: 'INGRESO INMEDIATO EN UCI. Benzodiacepinas IV a altas dosis (diazepam IV), infusión de fenobarbital o propofol para delirio refractario. Evitar neurolépticos aislados (bajan umbral convulsivo).',
  },
]);

// ============================================================================
// CLINICAL PHARMACOTHERAPY: BAP & DUTCH EVIDENCE-BASED GUIDELINES
// ============================================================================

export const GHB_CLINICAL_PROTOCOLS = Object.freeze({
  baclofenProtocolEn: {
    title: 'Baclofen (GABA-B Receptor Specific Agonist) Protocol',
    rationale: 'GHB is an agonist at GABA-B receptors. Benzodiazepines only stimulate GABA-A receptors and frequently fail or require toxic megadoses to control GHB withdrawal. Baclofen directly substitutes at the depleted GABA-B receptor site, dramatically reducing autonomic instability, preventing delirium, and reducing required benzodiazepine doses by over 75%.',
    dosing: 'Initiate Baclofen 10 mg PO three times daily (TID). Can be titrated to 15–20 mg TID if autonomic symptoms or cravings persist. Taper gradually over 2 to 4 weeks after stabilization.',
  },
  baclofenProtocolEs: {
    title: 'Protocolo con Baclofeno (Agonista Específico GABA-B)',
    rationale: 'El GHB actúa en receptores GABA-B. Las benzodiacepinas solo estimulan GABA-A y a menudo fallan ante la abstinencia de GHB. El baclofeno sustituye directamente al GHB en su receptor específico, previniendo el delirio y reduciendo un 75% la necesidad de benzodiacepinas.',
    dosing: 'Iniciar baclofeno 10 mg vía oral cada 8 horas. Titular hasta 15-20 mg cada 8h según respuesta. Desescalar paulatinamente a lo largo de 2 a 4 semanas tras la estabilización.',
  },
  diazepamProtocolEn: {
    title: 'Diazepam Symptom-Triggered Sedation Protocol',
    rationale: 'Long-acting benzodiazepine providing immediate GABA-A allosteric facilitation, preventing seizure activity and controlling severe muscle fasciculations and autonomic tachycardia.',
    dosing: 'Diazepam 10 to 20 mg orally or IV every 1 to 2 hours titrated to light sedation (RASS score -1 to 0). In refractory cases with rising pulse (> 120 bpm) despite > 100 mg diazepam, escalate immediately to Phenobarbital or ICU Propofol.',
  },
  diazepamProtocolEs: {
    title: 'Protocolo de Sedación Titulada con Diazepam',
    rationale: 'Benzodiacepina de acción prolongada que modula receptores GABA-A, controlando las taquicardias y previniendo las convulsiones.',
    dosing: 'Diazepam 10 a 20 mg vía oral o IV cada 1 o 2 horas según síntomas. Si la taquicardia persiste pese a > 100 mg de diazepam, escalar de inmediato a fenobarbital o propofol en UCI.',
  },
  coldTurkeyAlertEn: 'ABSOLUTE CONTRAINDICATION: NEVER stop GHB/GBL/BDO "cold turkey" if dosing around the clock (every 1 to 4 hours). Abrupt cessation causes life-threatening delirium tremens-like psychosis, status epilepticus, and cardiovascular collapse within hours. Medical detox is mandatory.',
  coldTurkeyAlertEs: 'CONTRAINDICACIÓN ABSOLUTA: NUNCA suspenda el GHB/GBL de golpe si consume de forma continuada (cada 1 a 4 horas). La supresión abrupta causa psicosis delirante, convulsiones y colapso cardiovascular en cuestión de horas. El ingreso médico es obligatorio.',
});

// ============================================================================
// HARM REDUCTION STANDARDS: COMMUNITY, NIGHTLIFE & CHEMSEX
// ============================================================================

export const GHB_HARM_REDUCTION_RULES = Object.freeze([
  {
    num: 1,
    ruleEn: 'EXACT 0.1 mL ORAL SYRINGE DOSING ONLY',
    ruleEs: 'DOSIFICACIÓN EXACTA EXCLUSIVAMENTE CON JERINGA DE 1 mL',
    detailEn: 'Never dose from the bottle, cap, or a drinking cup. A variation of just 0.5 mL can mean the difference between alert euphoria and unrousable coma. Always use a dedicated 1 mL oral measurement syringe with clear graduation marks.',
    detailEs: 'Nunca tome a morro, ni use tapones de botella ni vasos. Una variación de apenas 0.5 mL es la diferencia entre euforia y un coma profundo. Utilice siempre una jeringa dosificadora oral de 1 mL.',
  },
  {
    num: 2,
    ruleEn: 'MANDATORY DOSING TIMERS (MINIMUM 2 TO 3 HOURS)',
    ruleEs: 'TEMPORIZADOR OBLIGATORIO (MÍNIMO 2 A 3 HORAS ENTRE TOMAS)',
    detailEn: 'Set a countdown timer on your smartphone the exact second you take a dose. Never redose before 2 hours (for GBL) or 2.5–3 hours (for GHB/BDO). Because GHB causes anterograde amnesia, people frequently forget they already dosed and accidentally stack doses into a fatal coma.',
    detailEs: 'Ponga una alarma o cronómetro en su teléfono en el instante en que consuma. No vuelva a consumir antes de 2 horas (GBL) o 2.5 a 3 horas (GHB/BDO). La amnesia que produce el GHB lleva a olvidar tomas previas y apilar dosis mortales.',
  },
  {
    num: 3,
    ruleEn: 'FOOD COLORING DYE WARNING (NEVER LEAVE CLEAR)',
    ruleEs: 'COLORANTE ALIMENTARIO OBLIGATORIO (NUNCA DEJAR TRANSPARENTE)',
    detailEn: 'GHB and GBL are crystal-clear liquids easily mistaken for water. Inadvertent ingestion by friends, partners, or yourself causes catastrophic poisoning. Always add dark blue or food-grade dye to the entire supply bottle so nobody drinks it accidentally.',
    detailEs: 'El GHB y el GBL son líquidos transparentes que se confunden fácilmente con agua. Añada SIEMPRE colorante alimentario (azul o rojo) a todo el frasco para evitar ingestiones accidentales letales.',
  },
  {
    num: 4,
    ruleEn: 'ABSOLUTE PROHIBITION: NO ALCOHOL, BENZOS, KETAMINE OR OPIOIDS',
    ruleEs: 'PROHIBICIÓN ABSOLUTA: CERO ALCOHOL, BENZODIACEPINAS, KETAMINA U OPIOIDES',
    detailEn: 'Over 90% of GHB-related fatalities involve co-ingested alcohol or other sedatives. Combining GHB with even a single alcoholic drink exponentially suppresses brainstem respiratory centers, resulting in fatal apnea and vomitus aspiration.',
    detailEs: 'Más del 90% de las muertes por GHB involucran alcohol u otros sedantes. Mezclar GHB incluso con una sola copa de alcohol suprime de forma mortal la respiración y el reflejo nauseoso.',
  },
]);

// ============================================================================
// COMA & "G-OUT" AIRWAY TRIAGE ENGINE
// ============================================================================

export function evaluateGhbEvent(state) {
  const {
    hoursSinceLastDose,
    isDosingRoundTheClock,
    isUnresponsive,
    respiratoryRateUnder8,
    isSnoringOrGurgling,
    vomitedWhileUnconscious,
    combinedWithAlcoholOrSedatives,
    hasSevereTremorsOrHallucinations,
  } = state;

  // 1. Critical Coma / Overdose Emergency Tier
  if (
    isUnresponsive &&
    (respiratoryRateUnder8 || isSnoringOrGurgling || vomitedWhileUnconscious || combinedWithAlcoholOrSedatives)
  ) {
    return {
      tier: 'emergency_coma',
      titleEn: 'CRITICAL AIRWAY & OVERDOSE EMERGENCY: Coma with Impending Respiratory Failure',
      titleEs: 'EMERGENCIA RESPIRATORIA CRÍTICA: Coma por GHB con Riesgo de Paro Respiratorio',
      isEmergency: true,
      actionEn: 'CALL 911 IMMEDIATELY. The person is in a life-threatening GHB/sedative coma. Snoring or gurgling is NOT normal sleep—it indicates upper airway obstruction and impending asphyxiation. IMMEDIATELY place the person into the LATERAL RECOVERY POSITION to prevent choking on vomitus. If breathing stops or drops below 8/min, begin rescue breathing (1 breath every 5 seconds). Administer Naloxone if any possibility of opioid co-ingestion exists (harmless if not, life-saving if opioids present).',
      actionEs: 'LLAME AL 911 DE INMEDIATO. La persona está en un coma potencialmente mortal. Los ronquidos o gorgoteos indican obstrucción respiratoria. Coloque DE INMEDIATO a la persona en POSICIÓN LATERAL DE SEGURIDAD para evitar asfixia por vómito. Si respira a menos de 8 resp/min, inicie ventilación de rescate (1 insuflación cada 5 segundos). Administre naloxona si pudo haber opioides.',
      hospitalInterventionEn: 'Immediate endotracheal intubation if Glasgow Coma Scale (GCS) <= 8 or refractory apnea. Continuous pulse oximetry, capnography, and aspiration pneumonia prophylaxis.',
      hospitalInterventionEs: 'Intubación orotraqueal si GCS <= 8 o apnea refractaria. Monitorización continua y prevención de neumonía por aspiración.',
    };
  }

  // 2. Severe Withdrawal Emergency Tier (GWS)
  if (
    isDosingRoundTheClock &&
    (hasSevereTremorsOrHallucinations || hoursSinceLastDose >= 4)
  ) {
    return {
      tier: 'emergency_withdrawal',
      titleEn: 'SEVERE GHB WITHDRAWAL SYNDROME (GWS): Risk of Delirium & Status Epilepticus',
      titleEs: 'SÍNDROME DE ABSTINENCIA GRAVE DE GHB: Riesgo de Delirio y Convulsiones',
      isEmergency: true,
      actionEn: 'EMERGENCY MEDICAL ADMISSION REQUIRED. The patient has developed round-the-clock physical dependence on GHB/GBL and is entering severe withdrawal. DO NOT attempt to withdraw at home without medical supervision. Abrupt cessation carries a high mortality rate from agitated delirium, malignant hyperthermia, autonomic storm, and refractory seizures. Immediate hospital transport is required for Baclofen and high-dose Benzodiazepine stabilization.',
      actionEs: 'INGRESO HOSPITALARIO URGENTE. El paciente tiene dependencia continuada y presenta abstinencia grave. NO intente suspender el fármaco en casa. La retirada abrupta tiene alta mortalidad por delirio agitado, hipertermia, tormenta autonómica y convulsiones. Se requiere traslado hospitalario inmediato para pauta con baclofeno y benzodiacepinas.',
      hospitalInterventionEn: 'Initiate Baclofen 10–20 mg TID + IV Diazepam loading protocol. Prepare ICU Phenobarbital or Propofol if autonomic agitation is refractory.',
      hospitalInterventionEs: 'Iniciar baclofeno 10-20 mg cada 8h más diazepam IV titulado. Preparar fenobarbital o propofol en UCI si la agitación no cede.',
    };
  }

  // 3. Simple Non-Medical G-Out (Deep Sleep with Stable Airway)
  if (isUnresponsive) {
    return {
      tier: 'monitoring_g_out',
      titleEn: 'Acute GHB Somnolence ("G-Out") — Airway Monitoring Required',
      titleEs: 'Somnolencia Aguda por GHB («G-Out») — Monitorización Estricta de Vía Aérea',
      isEmergency: false,
      actionEn: 'The person is in a temporary GHB-induced deep sleep ("G-out") with regular breathing (> 10-12 breaths/min) and no co-ingested alcohol. NEVER LEAVE THEM ALONE. Immediately place them in the LATERAL RECOVERY POSITION on their side with their mouth facing downward so their tongue or vomitus cannot block their airway. Check their breathing every 2 minutes. If their breathing slows below 8/min or becomes noisy/gurgling, call 911 immediately. They typically wake abruptly within 2 to 4 hours as GHB is metabolized.',
      actionEs: 'La persona está en sueño profundo por GHB («G-out») con respiración regular (> 10-12 resp/min) y sin alcohol. NUNCA LA DEJE SOLA. Colóquela de inmediato en POSICIÓN LATERAL DE SEGURIDAD de lado con la boca hacia abajo. Compruebe la respiración cada 2 minutos. Si baja de 8 resp/min o hay gorgoteo, llame al 911. Suelen despertar de golpe a las 2-4 horas.',
      hospitalInterventionEn: 'Watchful airway maintenance, lateral positioning, continuous observation until alert.',
      hospitalInterventionEs: 'Mantenimiento de vía aérea en posición lateral y observación continua hasta despertar.',
    };
  }

  // 4. Stable Harm Reduction & Dosing Guidance
  return {
    tier: 'stable_guidance',
    titleEn: 'GHB/GBL Harm Reduction & Dependency Assessment',
    titleEs: 'Reducción de Daños de GHB/GBL y Evaluación de Dependencia',
    isEmergency: false,
    actionEn: 'Patient is currently stable. Practice exact oral syringe measurement (1 mL), set a 2.5–3 hour timer between doses, never mix with alcohol, and ensure bottles are dyed with food coloring. If taking doses around the clock (every 1 to 4 hours) to stave off shakes or anxiety, physical dependence is present; plan an elective medical detoxification with a specialized addiction clinic.',
    actionEs: 'Persona actualmente estable. Aplique medición exacta con jeringa (1 mL), temporizador de 2.5-3 horas entre tomas, cero alcohol y colorante azul en el frasco. Si consume día y noche cada 1-4 horas para frenar temblores, existe dependencia física; consulte con una unidad de conductas adictivas para pautar desintoxicación con baclofeno.',
    hospitalInterventionEn: 'Referral to specialized addiction medicine clinic for outpatient elective Baclofen-assisted detoxification.',
    hospitalInterventionEs: 'Derivación a centro especializado para planificar desintoxicación programada con baclofeno.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildGhbSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();
  const sub = GHB_COMPOUND_PROFILES[state.selectedSubstance] || GHB_COMPOUND_PROFILES.ghb;

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: GHB / GBL / 1,4-BDO, TRIAJE DE COMA Y ABSTINENCIA (GWS)',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      `Presentación por ingesta de: ${sub.name}.`,
      `Estado actual: ${evaluation.titleEs}.`,
      `Nivel de urgencia evaluado: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA' : 'MONITORIZACIÓN Y REDUCCIÓN DE DAÑOS'}.`,
      '',
      'B (ANTECEDENTES / FACTORES TOXICOLÓGICOS):',
      `- Sustancia implicada: ${sub.name}.`,
      `- Consumo continuado 24/7 (cada 1-4 horas): ${state.isDosingRoundTheClock ? 'SÍ (ALTO RIESGO DE ABSTINENCIA GRAVE)' : 'No'}.`,
      `- Tiempo desde la última toma: ${state.hoursSinceLastDose} horas.`,
      `- Co-ingestión de alcohol, ketamina o benzodiacepinas: ${state.combinedWithAlcoholOrSedatives ? 'SÍ (ALERTA DE PARO RESPIRATORIO)' : 'No'}.`,
      `- Presencia de ronquidos / gorgoteos o vómitos inconsciente: ${state.isSnoringOrGurgling || state.vomitedWhileUnconscious ? 'SÍ (OBSTRUCCIÓN DE VÍA AÉREA)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Manejo médico propuesto: ${evaluation.hospitalInterventionEs}`,
      '',
      'R (RECOMENDACIONES CLÍNICAS Y MANEJO EN URGENCIAS):',
      '1. En coma/G-out: Mantener siempre posición lateral de seguridad; NO inducir el vómito. Preparar intubación si la saturación o frecuencia respiratoria no se mantienen.',
      '2. En abstinencia grave (GWS): Iniciar baclofeno (10-20 mg VO cada 8h) para sustitución específica en receptor GABA-B, más diazepam titulado para control de temblores.',
      '3. Evitar neurolépticos como monoterapia; bajan el umbral convulsivo y empeoran la disforia.',
      '4. Nunca dar de alta a un paciente con dependencia 24/7 sin plan médico de desintoxicación.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'GHB, GBL & 1,4-BDO CLINICAL SBAR: COMA TRIAGE & SEVERE WITHDRAWAL NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    `Presentation related to exposure/dependence on: ${sub.name}.`,
    `Clinical Presentation: ${evaluation.titleEn}.`,
    `Triage Level: ${evaluation.isEmergency ? 'MEDICAL EMERGENCY' : 'MONITORING & HARM REDUCTION'}.`,
    '',
    'B (BACKGROUND / TOXICOLOGICAL FACTORS):',
    `- Involved Agent: ${sub.name}.`,
    `- Round-the-clock dosing (every 1-4 hours): ${state.isDosingRoundTheClock ? 'YES (SEVERE WITHDRAWAL / GWS RISK)' : 'No'}.`,
    `- Hours elapsed since last dose: ${state.hoursSinceLastDose} hours.`,
    `- Co-ingestion of alcohol, ketamine, or benzodiazepines: ${state.combinedWithAlcoholOrSedatives ? 'YES (CRITICAL RESPIRATORY ARREST HAZARD)' : 'No'}.`,
    `- Snoring, gurgling respirations, or vomited while unconscious: ${state.isSnoringOrGurgling || state.vomitedWhileUnconscious ? 'YES (AIRWAY OBSTRUCTION)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Hospital Intervention: ${evaluation.hospitalInterventionEn}`,
    '',
    'R (RECOMMENDATIONS & EMERGENCY MANAGEMENT):',
    '1. In coma / G-out: Maintain lateral recovery position immediately; DO NOT induce emesis. Prepare endotracheal intubation if respirations < 8/min or airway compromised.',
    '2. In severe withdrawal (GWS): Initiate Baclofen (10–20 mg TID) for specific GABA-B receptor replacement, plus titrated Diazepam for seizure prophylaxis.',
    '3. Avoid antipsychotic monotherapy (e.g. haloperidol); they lower seizure thresholds without addressing GABAergic exhaustion.',
    '4. Never discharge a round-the-clock GHB user cold turkey without dedicated medical detoxification.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialGhbState = () => ({
  activeTab: 'triage', // 'triage' | 'compounds' | 'withdrawal' | 'harm_reduction'
  selectedSubstance: 'ghb', // 'ghb' | 'gbl' | 'bdo'
  hoursSinceLastDose: 2,
  isDosingRoundTheClock: false,
  isUnresponsive: false,
  respiratoryRateUnder8: false,
  isSnoringOrGurgling: false,
  vomitedWhileUnconscious: false,
  combinedWithAlcoholOrSedatives: false,
  hasSevereTremorsOrHallucinations: false,
});

let currentGhbState = initialGhbState();
const stateSubscribers = new Set();

export function getGhbState() {
  return { ...currentGhbState };
}

export function setGhbState(patch) {
  currentGhbState = { ...currentGhbState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentGhbState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetGhbState() {
  currentGhbState = initialGhbState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentGhbState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribeGhbState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function ghbCareView() {
  const container = h('div', { class: 'ghb-care-view' });

  function render() {
    clear(container);
    const state = getGhbState();
    const evaluation = evaluateGhbEvent(state);

    // Header Banner
    const header = h('header', { class: 'ghb-header' }, [
      h('div', { class: 'ghb-header-badge' }, [
        icon('shield'),
        h('span', {}, t('ghb.header.badge', 'Sedative-Hypnotic & GABA-B Clinical Decision Support')),
      ]),
      h('h1', { class: 'ghb-header-title' }, t('ghb.header.title', 'GHB, GBL & 1,4-BDO Harm Reduction, Coma Triage & Withdrawal')),
      h('p', { class: 'ghb-header-desc' }, t('ghb.header.desc', 'Evidence-based clinical guidelines and peer harm reduction protocols aligned with BAP, ACMT, and European consensus standards: managing G-out respiratory coma, 1,4-BDO alcohol dehydrogenase traps, round-the-clock physical dependence, and life-threatening withdrawal delirium.')),
    ]);

    // Navigation Tabs
    const tabsList = h('div', { class: 'ghb-tabs-nav', role: 'tablist', 'aria-label': 'GHB Care Tabs' }, [
      h('button', {
        class: `ghb-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setGhbState({ activeTab: 'triage' }),
      }, t('ghb.tabs.triage', 'Coma & Overdose Triage')),
      h('button', {
        class: `ghb-tab-btn ${state.activeTab === 'compounds' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'compounds' ? 'true' : 'false',
        onclick: () => setGhbState({ activeTab: 'compounds' }),
      }, t('ghb.tabs.compounds', 'Substance Science: GHB vs GBL vs BDO')),
      h('button', {
        class: `ghb-tab-btn ${state.activeTab === 'withdrawal' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'withdrawal' ? 'true' : 'false',
        onclick: () => setGhbState({ activeTab: 'withdrawal' }),
      }, t('ghb.tabs.withdrawal', 'Withdrawal Staging & Baclofen Protocol')),
      h('button', {
        class: `ghb-tab-btn ${state.activeTab === 'harm_reduction' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'harm_reduction' ? 'true' : 'false',
        onclick: () => setGhbState({ activeTab: 'harm_reduction' }),
      }, t('ghb.tabs.harmReduction', 'Safer Dosing & Chemsex Guidelines')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'compounds':
        tabContent = renderCompoundsTab();
        break;
      case 'withdrawal':
        tabContent = renderWithdrawalTab();
        break;
      case 'harm_reduction':
        tabContent = renderHarmReductionTab();
        break;
      case 'triage':
      default:
        tabContent = renderTriageTab(state, evaluation);
        break;
    }

    container.appendChild(header);
    container.appendChild(tabsList);
    container.appendChild(tabContent);
  }

  // --- SUB-RENDERERS ---

  function renderTriageTab(state, evaluation) {
    const section = h('section', { class: 'ghb-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'ghb-inputs-grid' }, [
      // 1. Substance Selector
      h('div', { class: 'input-card' }, [
        h('label', { for: 'ghb-select-substance', class: 'input-label' }, t('ghb.label.substance', '1. Specific Substance Ingested')),
        h('select', {
          id: 'ghb-select-substance',
          class: 'ghb-select',
          onchange: (e) => setGhbState({ selectedSubstance: e.target.value }),
        }, [
          h('option', { value: 'ghb', selected: state.selectedSubstance === 'ghb' }, t('ghb.opt.ghb', 'GHB (Liquid G, Sodium Oxybate, Salty Taste)')),
          h('option', { value: 'gbl', selected: state.selectedSubstance === 'gbl' }, t('ghb.opt.gbl', 'GBL (Solvent, 2x Potency, Acrid Chemical Taste)')),
          h('option', { value: 'bdo', selected: state.selectedSubstance === 'bdo' }, t('ghb.opt.bdo', '1,4-BDO (Butanediol, ADH Alcohol Trap, Delayed Onset)')),
        ]),
      ]),

      // 2. Unresponsive / Coma Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isUnresponsive,
            onchange: (e) => setGhbState({ isUnresponsive: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ghb.check.unresponsiveStrong', 'Unresponsive / Cannot Be Roused? ')),
            t('ghb.check.unresponsiveDetail', '(Patient will not wake up to loud shouting or sternal rub)'),
          ]),
        ]),
      ]),

      // 3. Respiratory Depression Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.respiratoryRateUnder8,
            onchange: (e) => setGhbState({ respiratoryRateUnder8: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ghb.check.respStrong', 'Breathing Slower Than 8 Breaths/Minute? ')),
            t('ghb.check.respDetail', '(Critical central respiratory depression)'),
          ]),
        ]),
      ]),

      // 4. Snoring / Gurgling Breathing Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isSnoringOrGurgling,
            onchange: (e) => setGhbState({ isSnoringOrGurgling: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ghb.check.snoringStrong', 'Loud Snoring, Choking, or Gurgling Sounds? ')),
            t('ghb.check.snoringDetail', '(Warning: Indicates partial upper airway collapse/obstruction)'),
          ]),
        ]),
      ]),

      // 5. Vomited While Unconscious Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.vomitedWhileUnconscious,
            onchange: (e) => setGhbState({ vomitedWhileUnconscious: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ghb.check.vomitStrong', 'Vomited While Unconscious or in Deep Sleep? ')),
            t('ghb.check.vomitDetail', '(Immediate fatal pulmonary aspiration hazard)'),
          ]),
        ]),
      ]),

      // 6. Co-ingestion of Alcohol or Sedatives
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.combinedWithAlcoholOrSedatives,
            onchange: (e) => setGhbState({ combinedWithAlcoholOrSedatives: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ghb.check.sedativeStrong', 'Combined with Alcohol, Ketamine, Benzodiazepines, or Opioids? ')),
            t('ghb.check.sedativeDetail', '(Causes synergistic respiratory arrest)'),
          ]),
        ]),
      ]),

      // 7. Round the clock dosing (Dependence)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isDosingRoundTheClock,
            onchange: (e) => setGhbState({ isDosingRoundTheClock: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ghb.check.rtcStrong', 'Dosing Around the Clock (Every 1 to 4 Hours Day & Night)? ')),
            t('ghb.check.rtcDetail', '(Physical dependence: severe withdrawal/delirium hazard)'),
          ]),
        ]),
      ]),

      // 8. Severe Withdrawal Tremors / Hallucinations
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSevereTremorsOrHallucinations,
            onchange: (e) => setGhbState({ hasSevereTremorsOrHallucinations: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ghb.check.gwsStrong', 'Experiencing Shaking Tremors, Confusion, or Hallucinations? ')),
            t('ghb.check.gwsDetail', '(Severe GWS: risk of status epilepticus and delirium)'),
          ]),
        ]),
      ]),
    ]);

    // Results Card
    const resultBox = h('div', { class: `ghb-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'ghb-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'ghb-result-details' }, [
        h('div', { class: 'ghb-rec-item' }, [
          h('strong', {}, t('ghb.res.action', 'Clinical & Harm Reduction Directives: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'ghb-rec-item' }, [
          h('strong', {}, t('ghb.res.hospital', 'Recommended Hospital & Critical Care Management: ')),
          h('p', {}, evaluation.hospitalInterventionEn),
        ]),
      ]),
    ]);

    // Lateral Recovery Position Visual Card
    const recoveryCard = h('div', { class: 'recovery-position-card' }, [
      h('h3', {}, t('ghb.recov.title', 'The Lateral Recovery Position Protocol (Preventing Asphyxiation)')),
      h('p', {}, 'When anyone becomes unrousable from GHB, their protective airway gag reflexes are completely paralyzed. If they are left on their back, their tongue falls backward and blocks their trachea, or vomitus enters their lungs causing instant drowning or fatal aspiration pneumonia.'),
      h('ol', { class: 'recovery-steps-list' }, [
        h('li', {}, 'Kneel next to the person and ensure their legs are straight.'),
        h('li', {}, 'Take the arm nearest to you and place it at a right angle to their body with the palm facing up.'),
        h('li', {}, 'Bring the far arm across their chest and hold the back of their hand against their nearest cheek.'),
        h('li', {}, 'With your other hand, pull their far knee up so their foot is flat on the floor.'),
        h('li', {}, 'Pull the bent knee toward you so they roll smoothly onto their side toward you.'),
        h('li', {}, 'Tilt their head back gently to open the airway and ensure their mouth is facing downward toward the floor so vomit drains out safely.'),
        h('li', {}, 'STAY WITH THEM and monitor their breathing continuously until paramedics arrive.'),
      ]),
    ]);

    // SBAR Export Card
    const sbarCard = h('div', { class: 'ghb-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('ghb.sbar.title', 'Zero-PII Clinical Handoff & Dispatch Note Generator')),
        h('div', { class: 'sbar-actions' }, [
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildGhbSbarText(state, evaluation, 'en');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('ghb.sbar.copyEn', 'Copy Clinical SBAR (English)'))]),
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildGhbSbarText(state, evaluation, 'es');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('ghb.sbar.copyEs', 'Copiar SBAR (Español)'))]),
        ]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildGhbSbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(recoveryCard);
    section.appendChild(sbarCard);
    return section;
  }

  function renderCompoundsTab() {
    const section = h('section', { class: 'ghb-compounds-tab', role: 'tabpanel' });

    // Intro Banner
    const introCard = h('div', { class: 'ghb-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ghb.comp.heading', 'Substance Science: Comparative Pharmacology of GHB, GBL & 1,4-BDO')),
      h('p', { class: 'tab-subtitle' }, t('ghb.comp.subtitle', 'Understanding the critical metabolic, potency, and pharmacokinetic differences that lead to unexpected fatal stacking overdoses.')),
    ]);

    // Compounds Grid
    const compoundsGrid = h('div', { class: 'ghb-compounds-grid' }, Object.values(GHB_COMPOUND_PROFILES).map((item) => h('div', { class: 'ghb-compound-card' }, [
      h('h3', { class: 'ghb-comp-title' }, item.name),
      h('p', {}, [h('strong', {}, 'Street Names: '), item.streetNamesEn]),
      h('p', {}, [h('strong', {}, 'Kinetics & Duration: '), h('span', { class: 'badge-kinetics' }, item.onsetDurationEn)]),
      h('p', {}, [h('strong', {}, 'Pharmacology: '), item.pharmacologyEn]),
      h('p', {}, [h('strong', {}, 'Taste & Appearance: '), item.tasteVisualEn]),
    ])));

    // ADH Metabolic Trap Deep-Dive
    const adhCard = h('div', { class: 'adh-trap-card' }, [
      icon('alert'),
      h('div', {}, [
        h('h3', {}, 'THE 1,4-BUTANEDIOL (BDO) & ALCOHOL METABOLIC TRAP'),
        h('p', {}, '1,4-Butanediol relies entirely on the liver enzyme Alcohol Dehydrogenase (ADH) for conversion into active GHB. Because ethanol (alcohol) has a vastly higher binding affinity for ADH, consuming alcohol alongside BDO completely halts the breakdown of BDO. The user feels only the alcohol and mistakenly believes the BDO was weak or bunk, often redosing multiple times. Hours later, when the liver finishes clearing the alcohol, ADH unblocks and metabolizes the accumulated reservoir of BDO all at once, triggering sudden, delayed catastrophic coma and respiratory arrest 3 to 6 hours after consumption!'),
      ]),
    ]);

    section.appendChild(introCard);
    section.appendChild(compoundsGrid);
    section.appendChild(adhCard);
    return section;
  }

  function renderWithdrawalTab() {
    const section = h('section', { class: 'ghb-withdrawal-tab', role: 'tabpanel' });

    // Intro
    const introCard = h('div', { class: 'ghb-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ghb.with.heading', 'GHB Withdrawal Syndrome (GWS) Staging & Baclofen Pharmacotherapy')),
      h('p', { class: 'tab-subtitle' }, t('ghb.with.subtitle', 'Clinical protocols based on BAP and Dutch National Guidelines: why outpatient cold-turkey cessation is dangerous and how Baclofen targets the core GABA-B deficit.')),
    ]);

    // Cold Turkey Black Box Alert
    const coldTurkeyCard = h('div', { class: 'cold-turkey-alert-card' }, [
      icon('alert'),
      h('div', {}, [
        h('h3', {}, 'BLACK-BOX WARNING: NEVER STOP GHB/GBL COLD TURKEY'),
        h('p', {}, GHB_CLINICAL_PROTOCOLS.coldTurkeyAlertEn),
      ]),
    ]);

    // Stages Grid
    const stagesGrid = h('div', { class: 'ghb-stages-grid' }, GWS_WITHDRAWAL_STAGES.map((s) => h('div', { class: `gws-stage-card ${s.stageId}` }, [
      h('h3', {}, s.titleEn),
      h('ul', { class: 'gws-symptoms-list' }, s.symptomsEn.map((sym) => h('li', {}, sym))),
      h('div', { class: 'gws-mgmt-box' }, [
        h('strong', {}, 'Clinical Management Directive: '),
        h('span', {}, s.managementEn),
      ]),
    ])));

    // Protocols Breakdown Card
    const protocolsCard = h('div', { class: 'ghb-protocols-card' }, [
      h('h3', {}, 'Evidence-Based Pharmacotherapy Protocols (BAP Guidelines)'),
      h('div', { class: 'proto-box' }, [
        h('h4', {}, GHB_CLINICAL_PROTOCOLS.baclofenProtocolEn.title),
        h('p', {}, [h('strong', {}, 'Rationale: '), GHB_CLINICAL_PROTOCOLS.baclofenProtocolEn.rationale]),
        h('p', {}, [h('strong', {}, 'Dosing Schedule: '), GHB_CLINICAL_PROTOCOLS.baclofenProtocolEn.dosing]),
      ]),
      h('div', { class: 'proto-box' }, [
        h('h4', {}, GHB_CLINICAL_PROTOCOLS.diazepamProtocolEn.title),
        h('p', {}, [h('strong', {}, 'Rationale: '), GHB_CLINICAL_PROTOCOLS.diazepamProtocolEn.rationale]),
        h('p', {}, [h('strong', {}, 'Dosing Schedule: '), GHB_CLINICAL_PROTOCOLS.diazepamProtocolEn.dosing]),
      ]),
    ]);

    section.appendChild(introCard);
    section.appendChild(coldTurkeyCard);
    section.appendChild(stagesGrid);
    section.appendChild(protocolsCard);
    return section;
  }

  function renderHarmReductionTab() {
    const section = h('section', { class: 'ghb-harm-reduction-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'ghb-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ghb.hr.heading', 'Safer Dosing, Nightlife & Chemsex Harm Reduction Rules')),
      h('p', { class: 'tab-subtitle' }, t('ghb.hr.subtitle', 'Practical, non-judgmental rules designed by peer harm reduction specialists to prevent fatal stacking overdoses and protect community safety.')),
    ]);

    const rulesGrid = h('div', { class: 'ghb-rules-grid' }, GHB_HARM_REDUCTION_RULES.map((r) => h('div', { class: 'ghb-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${r.num}`),
      h('h3', {}, r.ruleEn),
      h('p', {}, r.detailEn),
    ])));

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    return section;
  }

  // Subscribe to state changes and render
  const unsubscribe = subscribeGhbState(() => render());
  render();

  return container;
}
