// public/js/views/renalCare.js
// HarborPath - Renal Health, Rhabdomyolysis, AKI & MOUD in Renal Impairment / Dialysis Navigator
// Clinical Consensus: Kidney Disease: Improving Global Outcomes (KDIGO) Clinical Practice Guidelines for AKI,
// American Society of Nephrology (ASN),
// American College of Emergency Physicians (ACEP) Hyperkalemia & Rhabdomyolysis Guidelines,
// SAMHSA / ASAM National Practice Guideline for MOUD in Chronic Kidney Disease & ESRD.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon, copyText } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: RHABDOMYOLYSIS & ACUTE RENAL TOXICITY
// ============================================================================

export const RHABDOMYOLYSIS_STANDARDS = Object.freeze({
  pathophysiologyEn: 'Prolonged immobilization ("down time") on hard surfaces following opioid overdose or sedative coma, or extreme muscle hyperactivity and hyperthermia from psychostimulants (methamphetamine, cocaine, MDMA), causes skeletal muscle compression, ischemia, and sarcolemmal breakdown. Intracellular constituents—myoglobin, creatine kinase (CK), potassium, and phosphate—flood the systemic circulation.',
  pathophysiologyEs: 'La inmovilización prolongada tras una sobredosis de opioides o coma sedante, o la hipertermia e hiperactividad muscular por estimulantes (metanfetamina, cocaína), causa compresión muscular, isquemia y necrosis. Los componentes intracelulares (mioglobina, creatina quinasa, potasio y fosfato) se liberan masivamente a la sangre.',

  nephrotoxicityEn: 'NEPHROTOXIC MECHANISM: Free filtered myoglobin precipitates with Tamm-Horsfall protein in renal distal tubules, especially in acidic urine (pH < 5.6), forming obstructing tubular casts. In addition, ferrihemate released from myoglobin generates toxic hydroxyl free radicals, inducing lipid peroxidation, direct cytotoxic Acute Tubular Necrosis (ATN), and renal vasoconstriction.',
  nephrotoxicityEs: 'MECANISMO NEFROTÓXICO: La mioglobina se precipita con la proteína de Tamm-Horsfall en los túbulos renales, sobre todo en orina ácida (pH < 5.6), formando cilindros obstructivos. Además, el ferrihemato genera radicales libres que causan necrosis tubular aguda (NTA) citotóxica y vasoconstricción renal.',

  triadEn: 'CLASSICAL CLINICAL TRIAD: 1) Severe muscle pain, tenderness, and stiffness; 2) Profound muscle weakness; 3) Dark reddish-brown "tea-colored" or "cola-colored" urine. NOTE: Urine dipstick tests strongly positive for "blood" due to the pseudoperoxidase activity of myoglobin, whereas microscopic examination of urine sediment reveals 0–5 intact red blood cells (discordance hallmark).',
  triadEs: 'TRÍADA CLÍNICA CLÁSICA: 1) Dolor y rigidez muscular intensa; 2) Debilidad muscular; 3) Orina de color oscuro "té" o "cola". La tira reactiva de orina da positivo para "sangre" por la actividad pseudoperoxidasa de la mioglobina, pero el sedimento microscópico muestra ausencia de hematíes.',

  ckCutoffsEn: 'SERUM CREATINE KINASE (CK) THRESHOLDS: Total serum CK typically exceeds 5,000 U/L and frequently reaches 20,000 to > 100,000 U/L. The risk of acute kidney injury rises dramatically when CK exceeds 5,000 U/L. Serial CK levels should be tracked every 12–24 hours until peaking and resolving.',
  ckCutoffsEs: 'UMBRALES DE CREATINA QUINASA (CK): La CK sérica total suele superar los 5,000 U/L y con frecuencia alcanza los 20,000 a > 100,000 U/L. El riesgo de insuficiencia renal aguda se dispara por encima de 5,000 U/L. Debe monitorizarse cada 12-24 horas.',

  hyperkalemiaEmergencyEn: 'HYPERKALEMIA EMERGENCY: Massive muscle cell breakdown releases lethal quantities of potassium into extracellular fluid (K+ > 6.0 mEq/L). Hallmarks on 12-lead ECG: 1) Tall peaked, symmetrical T waves; 2) PR interval prolongation and flattening of P waves; 3) Widening of QRS complex; 4) Sine wave pattern progressing rapidly to Ventricular Fibrillation or Asystole. PROTOCOL: 1) IV Calcium Gluconate 1–2 g over 2–5 min to stabilize cardiac membrane; 2) Regular Insulin 10 units IV + D50W 50 mL to shift potassium into cells; 3) Nebulized Albuterol 10–20 mg; 4) IV Sodium Bicarbonate for severe acidemia; 5) Emergent hemodialysis.',
  hyperkalemiaEmergencyEs: 'EMERGENCIA POR HIPERPOTASEMIA: La lisis muscular masiva libera potasio letal (K+ > 6.0 mEq/L). Signos en ECG: ondas T picadas, alargamiento del PR, ensanchamiento del QRS y patrón en onda senoidal que evoluciona a fibrilación ventricular o parada. Manejo: 1) Gluconato cálcico IV 1-2 g; 2) Insulina rápida 10 UI IV + 50 ml dextrosa 50%; 3) Salbutamol nebulizado 10-20 mg; 4) Bicarbonato sódico IV; 5) Hemodiálisis urgente.',

  fluidProtocolEn: 'AGGRESSIVE FLUID RESUSCITATION PROTOCOL: Initiate early IV crystalloid resuscitation (Isotonic Saline or Lactated Ringer’s) at 400–1,000 mL/hour, titrating to maintain target urine output of 200–300 mL/hour to flush out myoglobin casts and prevent tubular obstruction. Monitor volume status continuously to avoid pulmonary edema. Urinary alkalinization with sodium bicarbonate (target urine pH > 6.5) can be considered only if hypocalcemia is excluded.',
  fluidProtocolEs: 'PROTOCOLO DE REHIDRATACIÓN INTENSIVA: Iniciar sueroterapia IV precoz con cristaloides (Suero Salino o Ringer Lactato) a 400–1,000 mL/h, titulando para mantener diuresis objetivo de 200–300 mL/h y arrastrar los cilindros de mioglobina. Vigilar la sobrecarga de volumen para evitar edema pulmonar.',
});

// ============================================================================
// COMPARTMENT SYNDROME STANDARDS & FASCIOTOMY TIMING
// ============================================================================

export const COMPARTMENT_SYNDROME_STANDARDS = Object.freeze({
  sixPsEn: [
    '1. Pain Out of Proportion: Extreme, unremitting pain that is disproportionate to clinical physical examination findings.',
    '2. Pain on Passive Stretch: THE EARLIEST & MOST SENSITIVE CLINICAL SIGN. Excruciating pain elicited by passively extending the muscle groups within the compartment.',
    '3. Pressure: The muscular compartment feels tense, hard, rigid, and "woody" to palpation.',
    '4. Paresthesias: Tingling, burning, or loss of sensation in the sensory cutaneous distribution of the nerves traveling through the compartment.',
    '5. Pallor: Pale, cool, or mottled skin over the extremity (late finding).',
    '6. Pulselessness: Loss of distal arterial pulses. A LATE, OMINOUS sign signifying impending irreversible tissue gangrene and limb loss.',
  ],
  sixPsEs: [
    '1. Dolor desproporcionado: Dolor intenso e incontrolable desproporcionado a la exploración física.',
    '2. Dolor con el estiramiento pasivo: EL SIGNO MÁS PRECOZ Y SENSIBLE. Dolor exquisito al estirar pasivamente los músculos del compartimento.',
    '3. Presión: El compartimento muscular se palpa tenso, endurecido y leñoso.',
    '4. Parestesias: Hormigueo, quemazón o pérdida de sensibilidad en el territorio nervioso correspondiente.',
    '5. Palidez: Piel fría, pálida o moteada (signo tardío).',
    '6. Ausencia de pulso: Pérdida de pulsos arteriales distales. SIGNO OMINOSO TARDÍO de necrosis irreversible.',
  ],

  fasciotomyThresholdEn: 'SURGICAL FASCIOTOMY THRESHOLD: Emergent surgical fasciotomy is indicated when intracompartmental pressure is within 30 mmHg of the patient’s diastolic blood pressure (Delta Pressure = Diastolic BP - Compartment Pressure <= 30 mmHg), or when absolute compartment pressure exceeds 30 mmHg in symptomatic patients. Irreversible muscle necrosis and permanent nerve paralysis occur after 6–8 hours of ischemia.',
  fasciotomyThresholdEs: 'UMBRAL DE FASCIOTOMÍA QUIRÚRGICA: La fasciotomía urgente está indicada cuando la presión intracompartimental dista <= 30 mmHg de la presión arterial diastólica (Presión Delta <= 30 mmHg) o la presión absoluta supera 30 mmHg. La isquemia superior a 6-8 horas provoca necrosis muscular irreversible y pérdida de la extremidad.',
});

// ============================================================================
// KDIGO ACUTE KIDNEY INJURY (AKI) STAGING
// ============================================================================

export const KDIGO_AKI_STAGES = Object.freeze([
  {
    stage: 1,
    nameEn: 'KDIGO Stage 1 AKI',
    nameEs: 'Estadío 1 de FRA (KDIGO)',
    creatinineEn: 'Serum creatinine 1.5–1.9 times baseline, OR acute increase >= 0.3 mg/dL (>= 26.5 umol/L) within 48 hours.',
    creatinineEs: 'Creatinina sérica 1.5–1.9 veces el valor basal, O aumento >= 0.3 mg/dL en 48 horas.',
    urineOutputEn: 'Urine output < 0.5 mL/kg/hour for 6–12 hours.',
    urineOutputEs: 'Diuresis < 0.5 mL/kg/h durante 6–12 horas.',
    managementEn: 'Discontinue all nephrotoxic agents (NSAIDs, aminoglycosides). Optimize volume status with crystalloids. Establish baseline renal labs and urinalysis.',
    managementEs: 'Suspender fármacos nefrotóxicos (AINEs). Optimizar hidratación con cristaloides y monitorizar diuresis.',
  },
  {
    stage: 2,
    nameEn: 'KDIGO Stage 2 AKI',
    nameEs: 'Estadío 2 de FRA (KDIGO)',
    creatinineEn: 'Serum creatinine 2.0–2.9 times baseline.',
    creatinineEs: 'Creatinina sérica 2.0–2.9 veces el valor basal.',
    urineOutputEn: 'Urine output < 0.5 mL/kg/hour for >= 12 hours.',
    urineOutputEs: 'Diuresis < 0.5 mL/kg/h durante >= 12 horas.',
    managementEn: 'Urgent nephrology evaluation. Continuous telemetry monitoring for hyperkalemia. Strict fluid balance recording with urinary catheter. Dose adjustment of all medications.',
    managementEs: 'Evaluación nefrológica urgente. Monitorización continua por riesgo de hiperpotasemia. Ajuste de fármacos.',
  },
  {
    stage: 3,
    nameEn: 'KDIGO Stage 3 AKI',
    nameEs: 'Estadío 3 de FRA (KDIGO)',
    creatinineEn: 'Serum creatinine >= 3.0 times baseline, OR serum creatinine >= 4.0 mg/dL (>= 353.6 umol/L), OR initiation of Renal Replacement Therapy (dialysis).',
    creatinineEs: 'Creatinina sérica >= 3.0 veces el basal, O creatinina >= 4.0 mg/dL, O inicio de terapia sustitutiva renal (diálisis).',
    urineOutputEn: 'Urine output < 0.3 mL/kg/hour for >= 24 hours, OR complete anuria for >= 12 hours.',
    urineOutputEs: 'Diuresis < 0.3 mL/kg/h durante >= 24 horas, O anuria total durante >= 12 horas.',
    managementEn: 'EMERGENT NEPHROLOGY CONSULT & DIALYSIS EVALUATION. Indications for emergent renal replacement therapy (AEIOU): Acidosis (pH < 7.1), Electrolytes (refractory hyperkalemia K+ > 6.5), Ingestion (toxic alcohols), Overload (refractory pulmonary edema), Uremia (pericarditis, encephalopathy).',
    managementEs: 'CONSULTA NEFROLÓGICA URGENTE Y VALORACIÓN DE DIÁLISIS. Criterios de diálisis urgente (AEIOU): Acidosis grave, Electrolitos (hiperpotasemia refractaria), Intoxicación, Overload (edema pulmonar refractario), Uremia (pericarditis, encefalopatía).',
  },
]);

// ============================================================================
// MOUD & ANALGESIC PHARMACOKINETICS IN RENAL IMPAIRMENT & DIALYSIS
// ============================================================================

export const RENAL_MOUD_PHARMACOKINETICS = Object.freeze({
  buprenorphine: Object.freeze({
    nameEn: 'Buprenorphine (First-Line Gold Standard in Renal Disease & Dialysis)',
    nameEs: 'Buprenorfina (Fármaco de Elección en Insuficiencia Renal y Diálisis)',
    pharmacokineticsEn: 'Buprenorphine undergoes extensive hepatic CYP3A4 metabolism to norbuprenorphine followed by glucuronidation. Elimination is predominantly FECAL AND BILIARY (70–80%), with only 10–20% excreted renally. Because buprenorphine is highly lipophilic, strongly protein-bound (> 96%), and possesses a large volume of distribution, it is NOT dialyzable.',
    pharmacokineticsEs: 'La buprenorfina se metaboliza en el hígado por CYP3A4 a norbuprenorfina y glucurónidos. Su eliminación es predominantemente FECAL Y BILIAR (70–80%), con solo un 10–20% por vía renal. Al estar unida a proteínas (> 96%), NO se elimina por hemodiálisis.',
    clinicalDirectivesEn: 'SAFE IN ALL STAGES OF CKD (STAGES 1–5) AND END-STAGE RENAL DISEASE (ESRD) ON HEMODIALYSIS. No dosage adjustment is required. Because dialysis does not clear buprenorphine, patients can take their regular sublingual dose without risk of subtherapeutic trough levels or need for post-dialysis booster doses.',
    clinicalDirectivesEs: 'SEGURA EN TODOS LOS ESTADÍOS DE ERC Y EN HEMODIÁLISIS. No requiere ajuste de dosis. Como la diálisis no elimina el fármaco, no requiere dosis de refuerzo post-diálisis.',
  }),

  methadone: Object.freeze({
    nameEn: 'Methadone (Safe in ESRD with Sedation & QTc Monitoring)',
    nameEs: 'Metadona (Segura en Diálisis con Monitorización de Sedación y QTc)',
    pharmacokineticsEn: 'Methadone is extensively metabolized in the liver via CYP3A4, CYP2B6, and CYP2C19 to the inactive metabolite EDDP. Fecal excretion accounts for approximately 50%, with variable renal excretion (20–30%). Due to high plasma protein binding (> 85%) and a vast volume of distribution, methadone is NOT dialyzable.',
    pharmacokineticsEs: 'La metadona se metaboliza en el hígado a metabolitos inactivos. La excreción fecal supone el 50% y la renal el 20-30%. Debido a su alta unión a proteínas plasmáticas (> 85%), NO es dializable.',
    clinicalDirectivesEn: 'MAINTAIN REGULAR DAILY DOSING IN HEMODIALYSIS PATIENTS. Supplemental doses post-dialysis are unnecessary. However, because metabolic acidosis and electrolyte fluctuations (hypokalemia, hypomagnesemia) during dialysis alter myocardial repolarization, maintain vigilant serial 12-lead ECG monitoring for QTc prolongation and torsades de pointes.',
    clinicalDirectivesEs: 'MANTENER DOSIS HABITUAL DIARIA EN DIÁLISIS. No requiere suplementos post-diálisis. Sin embargo, las variaciones electrolíticas en diálisis exigen vigilar el intervalo QTc con ECG seriados.',
  }),

  opioidToxicityWarnings: Object.freeze({
    morphineEn: 'MORPHINE NEUROTOXICITY & LETHAL ACCUMULATION: Morphine is metabolized into active metabolites Morphine-6-Glucuronide (M6G) and Morphine-3-Glucuronide (M3G), which are cleared exclusively by the kidneys. In renal impairment (GFR < 30 mL/min), M6G accumulates dramatically, crossing the blood-brain barrier and causing profound, unpredictable, life-threatening respiratory depression. M3G accumulation causes severe neurotoxicity: allodynia, hyperalgesia, myoclonus, and seizures. STRICTLY AVOID MORPHINE IN MODERATE-TO-SEVERE RENAL FAILURE.',
    morphineEs: 'TOXICIDAD POR MORFINA: La morfina genera metabolitos activos (M6G y M3G) que se eliminan por el riñón. En fallo renal (FG < 30 mL/min), el M6G se acumula provocando depresión respiratoria letal prolongada. El M3G causa neurotoxicidad grave (mioclonías, hiperalgesia y convulsiones). EVITAR MORFINA EN INSUFICIENCIA RENAL.',

    meperidineEn: 'MEPERIDINE (DEMEROL) ABSOLUTE CONTRAINDICATION: Meperidine is metabolized to normeperidine, which has an elimination half-life that triples in renal failure. Normeperidine is a potent cerebral stimulant; accumulation reliably precipitates tremors, multifocal myoclonus, hallucinations, and intractable grand mal seizures. Meperidine is STRICTLY CONTRAINDICATED in all patients with renal impairment.',
    meperidineEs: 'MEPERIDINA (DEMEROL) CONTRAINDICACIÓN ABSOLUTA: Su metabolito normeperidina se acumula en fallo renal provocando temblores, mioclonías y convulsiones epilépticas intratables. CONTRAINDICADA DE FORMA ABSOLUTA en enfermedad renal.',

    codeineEn: 'CODEINE TOXICITY HAZARD: Codeine undergoes renal excretion of active opioid metabolites. Impaired renal clearance leads to prolonged somnolence, profound respiratory depression, and apnea even at standard therapeutic doses. Avoid in renal failure.',
    codeineEs: 'PELIGRO DE CODEÍNA: La acumulación de metabolitos en fallo renal provoca somnolencia severa y depresión respiratoria. Evitar en insuficiencia renal.',

    nsaidsNephrotoxicityEn: 'NSAID STRICT PROHIBITION IN RENAL IMPAIRMENT: Non-Steroidal Anti-Inflammatory Drugs (Ibuprofen, Naproxen, Ketorolac, Meloxicam) block renal prostaglandin synthesis (PGE2, PGI2), constricting afferent glomerular arterioles. In compromised kidneys, this abruptly drops glomerular filtration pressure, precipitating acute ischemic ATN, severe hyperkalemia, and accelerates progression to irreversible ESRD. AVOID ALL NSAIDs.',
    nsaidsNephrotoxicityEs: 'PROHIBICIÓN ESTRICTA DE AINES: El ibuprofeno, naproxeno o ketorolaco bloquean las prostaglandinas renales, cerrando la arteriola aferente. Esto desencadena fallo renal agudo isquémico, hiperpotasemia severa y acelera la progresión a diálisis irreversible. EVITAR TODOS LOS AINES.',
  }),
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & FIELD KIDNEY PRESERVATION
// ============================================================================

export const RENAL_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'The "Cola-Colored Urine" & Overdose Down Time Alert',
    titleEs: 'Alerta de Orina Color Cola y Tiempo Inmóvil en Sobredosis',
    detailEn: 'If someone is found unresponsive on a hard floor, or wakes up after hours of heavy sedation with stiff, swollen limbs and reddish-brown "cola-colored" or "tea-colored" urine, suspect acute Rhabdomyolysis immediately. This is a life-threatening medical emergency requiring immediate 911 activation and IV hospital fluids to save their kidneys.',
    detailEs: 'Si una persona despierta tras horas de sedación profunda en el suelo con extremidades hinchadas y orina oscura color "té" o "cola", sospeche rabdomiólisis aguda de inmediato. Es una emergencia que requiere llamar al 112/911 para recibir suero intravenoso.',
  },
  {
    ruleNum: 2,
    titleEn: 'Aggressive Hydration Timing: Flush Out Myoglobin Casts',
    titleEs: 'Hidratación Precoz: Limpiar los Cilindros de Mioglobina',
    detailEn: 'In muscle breakdown, massive amounts of myoglobin plug up renal filter tubes. Early intravenous fluid resuscitation (400–1,000 mL/hour of isotonic crystalloids) washes out the tubes before permanent tubular death occurs. In the field, drink liberal fluids while awaiting emergency transport.',
    detailEs: 'La mioglobina liberada tapona los filtros del riñón. La hidratación intravenosa temprana arrastra estas proteínas antes de que se produzca una lesión renal permanente. Beba abundante agua mientras llega la ambulancia.',
  },
  {
    ruleNum: 3,
    titleEn: 'Watch for Fatal Hyperkalemia ECG Changes (Cardiac Arrest Warning)',
    titleEs: 'Vigilar la Hiperpotasemia en el ECG (Riesgo de Parada Cardíaca)',
    detailEn: 'Crushed muscle cells burst and release dangerous levels of potassium into the blood. High potassium stops the heart. If someone has palpitations, extreme weakness, or tall peaked T waves on an ECG, give IV Calcium Gluconate immediately to protect the heart muscle before giving insulin/glucose.',
    detailEs: 'Las células musculares rotas liberan potasio a la sangre, lo que puede paralizar el corazón. Ante palpitaciones, debilidad extrema u ondas T picadas en el ECG, administre gluconato cálcico IV inmediato para blindar el corazón.',
  },
  {
    ruleNum: 4,
    titleEn: 'Compartment Syndrome: Pain on Passive Stretch is the Earliest Flag',
    titleEs: 'Síndrome Compartimental: Dolor al Estirar es la Primera Alarma',
    detailEn: 'When swollen muscles swell inside tight fibrous sheaths, blood supply gets cut off. Do NOT wait for lost pulses! Pain on passive stretch of fingers/toes and a hard, woody feeling limb mean compartment syndrome. Immediate surgical fasciotomy cuts open the sheath to relieve pressure and save the arm or leg.',
    detailEs: 'El dolor insoportable al estirar los dedos de forma pasiva y una extremidad dura y leñosa indican síndrome compartimental. No espere a perder los pulsos. Requiere cirugía urgente de fasciotomía para evitar amputación.',
  },
  {
    ruleNum: 5,
    titleEn: 'Buprenorphine is Safe in Kidney Failure; NEVER Use Morphine or Meperidine',
    titleEs: 'La Buprenorfina es Segura en Fallo Renal; JAMÁS Use Morfina ni Meperidina',
    detailEn: 'Buprenorphine is cleared by the liver and gut, making it completely safe in advanced kidney failure and dialysis without dose cuts. In stark contrast, morphine metabolites accumulate and trigger lethal comas, while meperidine builds up and causes intractable grand mal seizures.',
    detailEs: 'La buprenorfina se elimina por el hígado y es totalmente segura en fallo renal y diálisis. En cambio, la morfina se acumula provocando sobredosis mortales y la meperidina produce convulsiones graves.',
  },
  {
    ruleNum: 6,
    titleEn: 'Strict NSAID Prohibition: Protect Every Remaining Nephron',
    titleEs: 'Prohibición Estricta de AINEs: Proteger Cada Nefrona Restante',
    detailEn: 'Never take ibuprofen (Advil, Motrin), naproxen (Aleve), or ketorolac (Toradol) when kidneys are injured or failing. NSAIDs strangle the blood vessels feeding the kidneys, shutting down urine production and turning reversible kidney damage into permanent life-long dialysis.',
    detailEs: 'Nunca tome ibuprofeno, naproxeno ni ketorolaco si el riñón está dañado. Los AINEs cortan el riego sanguíneo renal y pueden transformar un daño recuperable en necesidad de diálisis permanente de por vida.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO PERSISTENT STORAGE)
// ============================================================================

const initialRenalState = () => ({
  activeTab: 'triage', // 'triage' | 'rhabdo' | 'compartment' | 'kdigo' | 'moud' | 'harmReduction'
  viewMode: 'community', // 'community' | 'clinical'
  hasColaColoredUrineDownTime: false,
  hasTenseCompartmentPassivePain: false,
  hasHyperkalemiaEcgChanges: false,
  hasSevereOliguriaAnuria: false,
  isTakingNsaidsOrMorphine: false,
  isHemodialysisPatient: false,
});

let renalState = initialRenalState();
const listeners = new Set();

export function getRenalState() {
  return { ...renalState };
}

export function setRenalState(patch) {
  renalState = { ...renalState, ...patch };
  listeners.forEach((l) => l(renalState));
}

export function resetRenalState() {
  renalState = initialRenalState();
  listeners.forEach((l) => l(renalState));
}

export function subscribeRenalState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// CLINICAL RISK EVALUATOR (EVALUATERENALRISK)
// ============================================================================

export function evaluateRenalRisk(state) {
  const {
    hasColaColoredUrineDownTime,
    hasTenseCompartmentPassivePain,
    hasHyperkalemiaEcgChanges,
    hasSevereOliguriaAnuria,
    isTakingNsaidsOrMorphine,
    isHemodialysisPatient,
  } = state;

  // 1. Hyperkalemic Cardiac Emergency
  if (hasHyperkalemiaEcgChanges) {
    return {
      tier: 'emergency_hyperkalemic_cardiac',
      titleEn: 'CRITICAL CARDIAC EMERGENCY: Severe Hyperkalemia with ECG Changes',
      titleEs: 'EMERGENCIA CARDÍACA CRÍTICA: Hiperpotasemia Severa con Alteraciones en ECG',
      isEmergency: true,
      actionEn: 'ACTIVATE 911 / CARDIAC RESUSCITATION IMMEDIATELY. Peaked T waves, QRS widening, or sine wave patterns indicate imminent ventricular arrest. STAT PROTOCOL: 1) IV Calcium Gluconate 1–2 g over 2–5 min to stabilize cardiac membranes; 2) Regular Insulin 10 units IV + D50W 50 mL to shift potassium into cells; 3) Nebulized Albuterol 10–20 mg; 4) IV Sodium Bicarbonate; 5) Emergent nephrology consultation for urgent hemodialysis.',
      actionEs: 'ACTIVAR 112/911 INMEDIATAMENTE. Ondas T picadas, ensanchamiento del QRS o patrón senoidal alertan de parada inminente. Protocolo: 1) Gluconato cálcico IV 1-2 g; 2) Insulina rápida 10 UI + 50 ml dextrosa 50%; 3) Salbutamol nebulizado 10-20 mg; 4) Bicarbonato sódico IV; 5) Hemodiálisis de urgencia.',
      interventionEn: 'Immediate IV calcium gluconate, insulin + dextrose, continuous 12-lead ECG telemetry, nephrology stat consult for emergent hemodialysis.',
      interventionEs: 'Gluconato cálcico IV inmediato, insulina + glucosa, monitorización electrocardiográfica continua y nefrología urgente para hemodiálisis.',
    };
  }

  // 2. Acute Compartment Syndrome
  if (hasTenseCompartmentPassivePain) {
    return {
      tier: 'emergency_compartment_syndrome',
      titleEn: 'SURGICAL EMERGENCY: Suspected Acute Compartment Syndrome',
      titleEs: 'EMERGENCIA QUIRÚRGICA: Sospecha de Síndrome Compartimental Agudo',
      isEmergency: true,
      actionEn: 'EMERGENT ORTHOPEDIC / TRAUMA SURGERY CONSULT. Pain out of proportion and excruciating pain on passive stretch in a tense, woody extremity are diagnostic for compartment syndrome. Delay beyond 6 hours causes permanent necrosis and amputation. PROTOCOL: Measure compartment pressure immediately; emergent decompressive fasciotomy indicated if Delta Pressure (Diastolic BP - Compartment Pressure) <= 30 mmHg. Remove all constrictive wraps.',
      actionEs: 'CONSULTA QUIRÚRGICA URGENTE CON TRAUMATOLOGÍA. Dolor desproporcionado y dolor al estiramiento pasivo en extremidad tensa son diagnósticos de síndrome compartimental. Retirar vendajes compresivos. La fasciotomía urgente está indicada si la Presión Delta es <= 30 mmHg para salvar el miembro.',
      interventionEn: 'Immediate surgical fasciotomy evaluation, compartment pressure measurement, removal of all dressings/casts, avoid extremity elevation above heart level.',
      interventionEs: 'Valoración quirúrgica urgente para fasciotomía, medición de presiones intracompartimentales y retirada de todo vendaje.',
    };
  }

  // 3. Acute Rhabdomyolysis & Pigment Nephropathy
  if (hasColaColoredUrineDownTime) {
    return {
      tier: 'urgent_rhabdomyolysis_aki',
      titleEn: 'HIGH CLINICAL RISK: Acute Rhabdomyolysis & Pigment-Induced AKI',
      titleEs: 'ALTO RIESGO CLÍNICO: Rabdomiólisis Aguda y FRA por Pigmentos',
      isEmergency: true,
      actionEn: 'EMERGENCY DEPARTMENT ADMISSION & AGGRESSIVE HYDRATION. Dark reddish-brown "cola-colored" urine following prolonged down time indicates massive skeletal muscle breakdown. PROTOCOL: 1) Stat serum Creatine Kinase (CK), basic metabolic panel (K+, BUN, Cr), and urinalysis; 2) Immediate IV crystalloid resuscitation at 400–1,000 mL/h, titrating to urine output > 200–300 mL/h; 3) 12-lead ECG to rule out hyperkalemic dysrhythmias.',
      actionEs: 'INGRESO EN URGENCIAS E HIDRATACIÓN INTENSIVA. Orina color cola tras inmovilización indica rotura muscular masiva. Medir CK, potasio y creatinina. Iniciar cristaloides IV a 400-1,000 mL/h buscando diuresis de 200-300 mL/h y realizar ECG para descartar arritmias por potasio alto.',
      interventionEn: 'Aggressive IV crystalloids titrated to urine output 200–300 mL/h, serial CK and electrolyte monitoring, continuous telemetry.',
      interventionEs: 'Cristaloides IV intensivos para diuresis de 200-300 mL/h, analítica seriada de CK y electrolitos, y monitorización continua.',
    };
  }

  // 4. Severe Oliguria / Anuria (KDIGO Stage 3 AKI)
  if (hasSevereOliguriaAnuria) {
    return {
      tier: 'urgent_oliguria_kdigo3',
      titleEn: 'URGENT NEPHROLOGY ALERT: Severe Oliguria or Anuria (KDIGO Stage 3 AKI)',
      titleEs: 'ALERTA NEFROLÓGICA URGENTE: Oliguria Grave o Anuria (Estadío 3 KDIGO)',
      isEmergency: true,
      actionEn: 'URGENT INPATIENT ADMISSION & RENAL REPLACEMENT EVALUATION. Complete anuria for > 12 hours or severe oliguria signifies profound acute renal failure. Fluid overload and refractory hyperkalemia can become fatal rapidly. PROTOCOL: Place urinary catheter to assess true output, obtain stat labs (Cr, BUN, K+, blood gases), evaluate for AEIOU dialysis triggers, and strictly restrict non-essential IV fluids to prevent pulmonary edema.',
      actionEs: 'INGRESO HOSPITALARIO URGENTE Y VALORACIÓN DE DIÁLISIS. La anuria durante > 12 horas es signo de fallo renal agudo grave. Colocar sonda vesical, analítica urgente y valorar criterios AEIOU para inicio de diálisis de urgencia.',
      interventionEn: 'Nephrology stat consult for emergency dialysis access, strict fluid balance charting, blood gas analysis for refractory metabolic acidosis.',
      interventionEs: 'Consulta urgente de nefrología para diálisis, balance hídrico estricto y gasometría para descartar acidosis metabólica severa.',
    };
  }

  // 5. Active Use of Contraindicated Nephrotoxic / Neurotoxic Agents
  if (isTakingNsaidsOrMorphine) {
    return {
      tier: 'caution_nephrotoxic_contraindication',
      titleEn: 'CLINICAL PHARMACOTHERAPY ALERT: Potentially Lethal Medication in Renal Impairment',
      titleEs: 'ALERTA FARMACOLÓGICA: Medicación Potencialmente Letal en Insuficiencia Renal',
      isEmergency: false,
      actionEn: 'DISCONTINUE HARMFUL MEDICATIONS IMMEDIATELY. 1) NSAIDs (Ibuprofen, Naproxen, Ketorolac) constrict afferent renal arterioles, precipitating ischemic ATN and severe hyperkalemia. 2) Morphine produces neurotoxic metabolites (M6G, M3G) that accumulate in renal failure, causing lethal prolonged respiratory arrest and myoclonic seizures. Switch to Buprenorphine (preferred gold standard) or consult pain specialist.',
      actionEs: 'SUSPENDER FÁRMACOS CONTRAINDICADOS DE INMEDIATO. Los AINEs (ibuprofeno, naproxeno) cierran la irrigación renal causando fallo renal isquémico. La morfina acumula metabolitos (M6G/M3G) que provocan coma respiratorio letal y mioclonías. Cambiar a buprenorfina (fármaco de elección).',
      interventionEn: 'Deprescribing of NSAIDs and morphine/meperidine, transition to buprenorphine for pain or MOUD, renal function recheck within 48 hours.',
      interventionEs: 'Desprescripción inmediata de AINEs y morfina/meperidina, transición a buprenorfina y reevaluación analítica renal.',
    };
  }

  // 6. Hemodialysis Patient Needing MOUD Guidance
  if (isHemodialysisPatient) {
    return {
      tier: 'dialysis_moud_guidance',
      titleEn: 'DIALYSIS CLINICAL PATHWAY: MOUD Pharmacokinetics & Dosing on Hemodialysis',
      titleEs: 'PROTOCOLO EN DIÁLISIS: Farmacocinética de MOUD y Dosificación en Hemodiálisis',
      isEmergency: false,
      actionEn: 'MAINTAIN STANDARD MOUD DOSING WITHOUT EXTRA POST-DIALYSIS DOSES. 1) Buprenorphine: Highly protein-bound (> 96%) with 80% fecal/biliary elimination; NOT removed by dialysis. Continue standard sublingual dose. 2) Methadone: Highly protein-bound; NOT removed by dialysis. Maintain daily morning dose; supplemental doses post-dialysis are unnecessary. Monitor QTc on ECG regularly due to dialysis electrolyte shifts.',
      actionEs: 'MANTENER DOSIS ESTÁNDAR DE MOUD SIN DOSIS DE REFUERZO. La buprenorfina y la metadona NO se eliminan por diálisis debido a su alta unión a proteínas. No dar dosis adicionales tras la diálisis. Vigilar el intervalo QTc por las variaciones electrolíticas.',
      interventionEn: 'Coordination between nephrologist and addiction treatment provider, verification of dialyzability, routine QTc tracking on ECG.',
      interventionEs: 'Coordinación entre nefrología y adicciones, mantenimiento de pauta habitual de MOUD y monitorización del QTc.',
    };
  }

  // 7. Standard Renal Protection & Prevention
  return {
    tier: 'standard_renal_prevention',
    titleEn: 'Standard Renal Health & Nephrotoxicity Prevention Guidelines',
    titleEs: 'Pautas Estándar de Salud Renal y Prevención de Nefrotoxicidad',
    isEmergency: false,
    actionEn: 'No acute renal red flags detected. Harm reduction standards for kidney preservation: 1) Maintain adequate oral hydration, especially when using stimulants or in hot environments; 2) Avoid taking NSAIDs (Ibuprofen, Naproxen) alongside substances; 3) If feeling drowsy or sedated, change body positions and avoid resting on hard unpadded surfaces; 4) Seek immediate care for dark tea-colored urine, profound muscle weakness, or severe leg swelling.',
    actionEs: 'No se detectan alertas renales agudas. Consejos preventivos: hidratarse abundantemente con agua; evitar tomar ibuprofeno o naproxeno junto con sustancias; cambiar de postura al dormir para evitar aplastamientos musculares; y acudir a urgencias si la orina se oscurece o las piernas se hinchan.',
    interventionEn: 'Distribution of sterile hydration packs, education on rhabdomyolysis and urine color warning signs, baseline kidney function screening (BUN, Cr, eGFR).',
    interventionEs: 'Educación sobre prevención de rabdomiólisis y color de la orina, hidratación adecuada y cribado analítico básico renal.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildRenalSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: EVALUACIÓN RENAL Y RABDOMIÓLISIS (CERO PII)',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      'Evaluación clínica por sospecha de rabdomiólisis, fracaso renal agudo (FRA) o ajuste de MOUD en enfermedad renal.',
      `Diagnóstico de riesgo evaluado: ${evaluation.titleEs}.`,
      `Urgencia médica: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA CRÍTICA / VITAL' : 'GESTIÓN CLÍNICA Y PROTECCIÓN NEFROLÓGICA'}.`,
      '',
      'B (ANTECEDENTES / FACTORES DE RIESGO RENALES Y FARMACOLÓGICOS):',
      `- Orina color cola / tiempo prolongado en el suelo tras sobredosis: ${state.hasColaColoredUrineDownTime ? 'SÍ (SOSPECHA DE RABDOMIÓLISIS AGUDA)' : 'No'}.`,
      `- Extremidad leñosa y dolor intenso al estiramiento pasivo: ${state.hasTenseCompartmentPassivePain ? 'SÍ (ALARMA QUIRÚRGICA: SÍNDROME COMPARTIMENTAL)' : 'No'}.`,
      `- Ondas T picadas en ECG o sospecha de hiperpotasemia severa: ${state.hasHyperkalemiaEcgChanges ? 'SÍ (EMERGENCIA CARDÍACA: RIESGO DE PARADA)' : 'No'}.`,
      `- Oliguria grave o anuria durante más de 12 horas: ${state.hasSevereOliguriaAnuria ? 'SÍ (ESTADÍO 3 KDIGO: EVALUAR DIÁLISIS URGENTE)' : 'No'}.`,
      `- Consumo de AINEs (ibuprofeno) o morfina con daño renal: ${state.isTakingNsaidsOrMorphine ? 'SÍ (CONTRAINDICACIÓN POR NEFRO/NEUROTOXICIDAD)' : 'No'}.`,
      `- Paciente en programa de hemodiálisis periódica: ${state.isHemodialysisPatient ? 'SÍ (MOUD NO DIALIZABLE: MANTENER DOSIS ESTÁNDAR)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y GESTIÓN NEFROLÓGICA):',
      '1. Protocolo de hidratación: Cristaloides IV 400-1,000 mL/h con objetivo de diuresis 200-300 mL/h en rabdomiólisis.',
      '2. Hiperpotasemia: Gluconato cálcico IV inmediato para estabilizar miocardio antes de insulina y dextrosa.',
      '3. Síndrome compartimental: Fasciotomía urgente si Presión Delta <= 30 mmHg (no esperar a pérdida de pulso).',
      '4. MOUD en fallo renal: Buprenorfina es el fármaco de elección (excreción fecal 80%, sin ajuste ni dializable).',
      '5. Prohibición estricta: Evitar completamente morfina, meperidina y todos los AINEs para proteger las nefronas.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'RENAL HEALTH, RHABDOMYOLYSIS & MOUD CLINICAL SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    'Clinical consultation for suspected Rhabdomyolysis, Acute Kidney Injury (AKI), or MOUD nephrotoxicity triage.',
    `Assessed Presentation: ${evaluation.titleEn}.`,
    `Safety Urgency: ${evaluation.isEmergency ? 'LIFE-THREATENING MEDICAL EMERGENCY' : 'CLINICAL MANAGEMENT & NEPHROPROTECTION'}.`,
    '',
    'B (BACKGROUND / RENAL & PHARMACOLOGIC RISK FACTORS):',
    `- Cola-colored urine / prolonged down time after overdose: ${state.hasColaColoredUrineDownTime ? 'YES (ACUTE RHABDOMYOLYSIS SUSPECTED)' : 'No'}.`,
    `- Tense woody compartment & pain on passive stretch: ${state.hasTenseCompartmentPassivePain ? 'YES (EMERGENT SURGICAL COMPARTMENT SYNDROME)' : 'No'}.`,
    `- Peaked T waves on ECG or severe hyperkalemia alert: ${state.hasHyperkalemiaEcgChanges ? 'YES (CRITICAL CARDIAC ARREST RISK)' : 'No'}.`,
    `- Severe oliguria or complete anuria > 12 hours: ${state.hasSevereOliguriaAnuria ? 'YES (KDIGO STAGE 3 AKI / EVALUATE DIALYSIS)' : 'No'}.`,
    `- Active use of NSAIDs or morphine in renal compromise: ${state.isTakingNsaidsOrMorphine ? 'YES (STRICT CONTRAINDICATION / NEUROTOXICITY RISK)' : 'No'}.`,
    `- End-Stage Renal Disease (ESRD) on maintenance hemodialysis: ${state.isHemodialysisPatient ? 'YES (NON-DIALYZABLE MOUD / NO SUPPLEMENTAL DOSING)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Clinical Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & NEPHROLOGY MANAGEMENT):',
    '1. Fluid resuscitation: IV crystalloids 400–1,000 mL/h targeting urine output 200–300 mL/h in rhabdomyolysis.',
    '2. Hyperkalemia protocol: Administer IV Calcium Gluconate stat to stabilize cardiac membrane prior to insulin/glucose.',
    '3. Compartment syndrome: Emergent fasciotomy indicated if Delta Pressure <= 30 mmHg (do not wait for pulselessness).',
    '4. MOUD in renal failure: Buprenorphine is gold-standard first-line (80% fecal elimination, non-dialyzable, no dose reduction).',
    '5. Strict prohibitions: Completely avoid morphine (M6G coma), meperidine (normeperidine seizures), and all NSAIDs.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function renalCareView() {
  const container = h('div', { class: 'renal-care-view' });

  function render() {
    clear(container);
    const state = getRenalState();
    const evaluation = evaluateRenalRisk(state);

    // Header Banner
    const header = h('header', { class: 'rc-header' }, [
      h('div', { class: 'rc-header-badge' }, [
        icon('activity'),
        h('span', {}, t('rc.header.badge', 'Renal Health, Rhabdomyolysis & MOUD Safety')),
      ]),
      h('h1', { class: 'rc-header-title' }, t('rc.header.title', 'Renal Health, Rhabdomyolysis, AKI & MOUD in Dialysis Navigator')),
      h('p', { class: 'rc-header-desc' }, t('rc.header.desc', 'Evidence-based clinical decision support and harm reduction standards from KDIGO, ASN, and ASAM: Overdose down time rhabdomyolysis, hyperkalemia ECG triage, compartment syndrome 6 P’s, KDIGO AKI staging, buprenorphine vs. methadone in ESRD/dialysis, and morphine/NSAID toxicity prohibitions.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'rc-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        type: 'button',
        class: `rc-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setRenalState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('rc.mode.community', 'Community & Patient Mode (Dark Urine, Swelling & Hydration)')),
      ]),
      h('button', {
        type: 'button',
        class: `rc-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setRenalState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('rc.mode.clinical', 'Clinician & Nephrology Mode (KDIGO AKI, Hyperkalemia & Dialysis MOUD)')),
      ]),
    ]);

    // Tabs Nav
    const tabsList = h('div', { class: 'rc-tabs-nav', role: 'tablist', 'aria-label': 'Renal Care Tabs' }, [
      h('button', {
        type: 'button',
        class: `rc-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setRenalState({ activeTab: 'triage' }),
      }, t('rc.tabs.triage', 'Renal & Rhabdomyolysis Triage')),
      h('button', {
        type: 'button',
        class: `rc-tab-btn ${state.activeTab === 'rhabdo' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'rhabdo' ? 'true' : 'false',
        onclick: () => setRenalState({ activeTab: 'rhabdo' }),
      }, t('rc.tabs.rhabdo', 'Rhabdomyolysis & Hyperkalemia')),
      h('button', {
        type: 'button',
        class: `rc-tab-btn ${state.activeTab === 'compartment' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'compartment' ? 'true' : 'false',
        onclick: () => setRenalState({ activeTab: 'compartment' }),
      }, t('rc.tabs.compartment', 'Compartment Syndrome & Fasciotomy')),
      h('button', {
        type: 'button',
        class: `rc-tab-btn ${state.activeTab === 'kdigo' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'kdigo' ? 'true' : 'false',
        onclick: () => setRenalState({ activeTab: 'kdigo' }),
      }, t('rc.tabs.kdigo', 'KDIGO AKI Staging')),
      h('button', {
        type: 'button',
        class: `rc-tab-btn ${state.activeTab === 'moud' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'moud' ? 'true' : 'false',
        onclick: () => setRenalState({ activeTab: 'moud' }),
      }, t('rc.tabs.moud', 'MOUD in Renal Disease & Dialysis')),
      h('button', {
        type: 'button',
        class: `rc-tab-btn ${state.activeTab === 'harmReduction' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'harmReduction' ? 'true' : 'false',
        onclick: () => setRenalState({ activeTab: 'harmReduction' }),
      }, t('rc.tabs.harmReduction', 'Kidney Protection Directives')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'rhabdo':
        tabContent = renderRhabdoTab();
        break;
      case 'compartment':
        tabContent = renderCompartmentTab();
        break;
      case 'kdigo':
        tabContent = renderKdigoTab();
        break;
      case 'moud':
        tabContent = renderMoudTab();
        break;
      case 'harmReduction':
        tabContent = renderHarmReductionTab();
        break;
      case 'triage':
      default:
        tabContent = renderTriageTab(state, evaluation);
        break;
    }

    container.appendChild(header);
    container.appendChild(modeSwitcher);
    container.appendChild(tabsList);
    container.appendChild(tabContent);
  }

  // --- SUB-RENDERERS ---

  function renderTriageTab(state, evaluation) {
    const section = h('section', { class: 'rc-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'rc-inputs-grid' }, [
      // 1. Hyperkalemia ECG Changes
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasHyperkalemiaEcgChanges,
            onchange: (e) => setRenalState({ hasHyperkalemiaEcgChanges: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('rc.check.kStrong', 'Tall Peaked T Waves on ECG, Palpitations, or Extreme Weakness? ')),
            t('rc.check.kDetail', '(Critical Cardiac Emergency: Severe hyperkalemia with imminent ventricular arrest)'),
          ]),
        ]),
      ]),

      // 2. Compartment Syndrome / Passive Stretch Pain
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasTenseCompartmentPassivePain,
            onchange: (e) => setRenalState({ hasTenseCompartmentPassivePain: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('rc.check.csStrong', 'Severe Pain on Passive Stretch, or Tense, Hard, Woody Swollen Limb? ')),
            t('rc.check.csDetail', '(Surgical Emergency: Acute Compartment Syndrome requiring emergent fasciotomy)'),
          ]),
        ]),
      ]),

      // 3. Cola-Colored Urine / Down Time
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasColaColoredUrineDownTime,
            onchange: (e) => setRenalState({ hasColaColoredUrineDownTime: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('rc.check.rhabdoStrong', 'Dark Tea- or Cola-Colored Urine Following Overdose Down Time or Extreme Exertion? ')),
            t('rc.check.rhabdoDetail', '(High Clinical Risk: Acute Rhabdomyolysis & pigment nephropathy / ATN)'),
          ]),
        ]),
      ]),

      // 4. Severe Oliguria or Anuria
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSevereOliguriaAnuria,
            onchange: (e) => setRenalState({ hasSevereOliguriaAnuria: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('rc.check.anuriaStrong', 'No Urine (Anuria) or Minimal Urine for Over 12 Hours? ')),
            t('rc.check.anuriaDetail', '(KDIGO Stage 3 AKI Warning: Fluid overload & emergent dialysis risk)'),
          ]),
        ]),
      ]),

      // 5. Active Use of NSAIDs or Morphine
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isTakingNsaidsOrMorphine,
            onchange: (e) => setRenalState({ isTakingNsaidsOrMorphine: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('rc.check.contraStrong', 'Taking NSAIDs (Ibuprofen, Naproxen) or Morphine/Meperidine with Kidney Impairment? ')),
            t('rc.check.contraDetail', '(Pharmacologic Warning: Afferent arteriolar shutdown or lethal M6G/normeperidine toxicity)'),
          ]),
        ]),
      ]),

      // 6. Maintenance Hemodialysis Patient
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isHemodialysisPatient,
            onchange: (e) => setRenalState({ isHemodialysisPatient: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('rc.check.hdStrong', 'Patient with End-Stage Renal Disease (ESRD) on Maintenance Hemodialysis? ')),
            t('rc.check.hdDetail', '(Dialysis Protocol: Non-dialyzable buprenorphine/methadone dosing guidelines)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `rc-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'rc-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'rc-result-details' }, [
        h('div', { class: 'rc-rec-item' }, [
          h('strong', {}, t('rc.res.action', 'Clinical & Diagnostic Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'rc-rec-item' }, [
          h('strong', {}, t('rc.res.intervention', 'Recommended Medical Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // SBAR Export Card
    const copyEnBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      onclick: () => {
        const text = buildRenalSbarText(state, evaluation, 'en');
        copyText(text, { trigger: copyEnBtn });
      },
    }, [icon('copy'), h('span', {}, t('rc.sbar.copyEn', 'Copy Clinical SBAR (English)'))]);
    const copyEsBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      onclick: () => {
        const text = buildRenalSbarText(state, evaluation, 'es');
        copyText(text, { trigger: copyEsBtn });
      },
    }, [icon('copy'), h('span', {}, t('rc.sbar.copyEs', 'Copiar SBAR (Español)'))]);
    const sbarCard = h('div', { class: 'rc-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('rc.sbar.title', 'Zero-PII Renal & Rhabdomyolysis Clinical SBAR Note Generator')),
        h('div', { class: 'sbar-actions' }, [copyEnBtn, copyEsBtn]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildRenalSbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderRhabdoTab() {
    const section = h('section', { class: 'rc-rhabdo-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'rc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('rc.rhabdo.heading', 'Rhabdomyolysis Pathophysiology & Hyperkalemia Triage')),
      h('p', { class: 'tab-subtitle' }, t('rc.rhabdo.subtitle', 'Understanding pigment-induced acute tubular necrosis, urine dipstick discordance, and life-saving hyperkalemia stabilization.')),
    ]);

    const cardsGrid = h('div', { class: 'rc-cards-grid' }, [
      h('div', { class: 'rc-card' }, [
        h('h3', {}, 'Pathophysiology of Muscle Compression & Down Time'),
        h('p', {}, RHABDOMYOLYSIS_STANDARDS.pathophysiologyEn),
      ]),
      h('div', { class: 'rc-card' }, [
        h('h3', {}, 'Pigment Nephropathy & Tubule Obstruction'),
        h('p', {}, RHABDOMYOLYSIS_STANDARDS.nephrotoxicityEn),
      ]),
      h('div', { class: 'rc-card' }, [
        h('h3', {}, 'The Classical Triad & Urine Dipstick Discordance'),
        h('p', {}, RHABDOMYOLYSIS_STANDARDS.triadEn),
      ]),
      h('div', { class: 'rc-card' }, [
        h('h3', {}, 'Serum Creatine Kinase (CK) Risk Thresholds'),
        h('p', {}, RHABDOMYOLYSIS_STANDARDS.ckCutoffsEn),
      ]),
      h('div', { class: 'rc-card alert-callout emergency full-width' }, [
        h('h3', {}, 'Emergency Hyperkalemia Protocol (Calcium Gluconate Before Insulin)'),
        h('p', {}, RHABDOMYOLYSIS_STANDARDS.hyperkalemiaEmergencyEn),
      ]),
      h('div', { class: 'rc-card alert-callout info full-width' }, [
        h('h3', {}, 'Aggressive Fluid Resuscitation Protocol (Targeting 200–300 mL/h Diuresis)'),
        h('p', {}, RHABDOMYOLYSIS_STANDARDS.fluidProtocolEn),
      ]),
    ]);

    section.appendChild(introCard);
    section.appendChild(cardsGrid);
    return section;
  }

  function renderCompartmentTab() {
    const section = h('section', { class: 'rc-compartment-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'rc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('rc.cs.heading', 'Acute Compartment Syndrome & Fasciotomy Timing')),
      h('p', { class: 'tab-subtitle' }, t('rc.cs.subtitle', 'Recognizing the 6 P’s of closed fascial compartment hypertension and emergency surgical decompression thresholds.')),
    ]);

    const sixPsCard = h('div', { class: 'rc-card' }, [
      h('h3', {}, 'The 6 P’s of Compartment Syndrome (Passive Stretch is Earliest!)'),
      h('ul', { class: 'rc-list' }, COMPARTMENT_SYNDROME_STANDARDS.sixPsEn.map((p) => h('li', {}, p))),
    ]);

    const thresholdCard = h('div', { class: 'rc-card alert-callout emergency' }, [
      h('h3', {}, 'Surgical Fasciotomy Threshold & Time-to-Irreversible Injury'),
      h('p', {}, COMPARTMENT_SYNDROME_STANDARDS.fasciotomyThresholdEn),
    ]);

    section.appendChild(introCard);
    section.appendChild(sixPsCard);
    section.appendChild(thresholdCard);
    return section;
  }

  function renderKdigoTab() {
    const section = h('section', { class: 'rc-kdigo-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'rc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('rc.kdigo.heading', 'KDIGO Acute Kidney Injury (AKI) Staging & Renal Replacement')),
      h('p', { class: 'tab-subtitle' }, t('rc.kdigo.subtitle', 'Standardized international classification of acute renal injury by serum creatinine, urine output, and AEIOU dialysis triggers.')),
    ]);

    const stagesGrid = h('div', { class: 'rc-stages-grid' }, KDIGO_AKI_STAGES.map((stg) => h('div', { class: `rc-stage-card stage-${stg.stage}` }, [
      h('div', { class: 'stage-badge' }, `STAGE ${stg.stage}`),
      h('h3', {}, stg.nameEn),
      h('p', {}, [h('strong', {}, 'Creatinine Criteria: '), stg.creatinineEn]),
      h('p', {}, [h('strong', {}, 'Urine Output Criteria: '), stg.urineOutputEn]),
      h('p', { class: 'management-field' }, [h('strong', {}, 'Clinical Management: '), stg.managementEn]),
    ])));

    section.appendChild(introCard);
    section.appendChild(stagesGrid);
    return section;
  }

  function renderMoudTab() {
    const section = h('section', { class: 'rc-moud-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'rc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('rc.moud.heading', 'MOUD Pharmacokinetics in Kidney Disease & Hemodialysis')),
      h('p', { class: 'tab-subtitle' }, t('rc.moud.subtitle', 'Clear evidence on buprenorphine and methadone dialyzability, alongside strict toxicity warnings for morphine, meperidine, and NSAIDs.')),
    ]);

    const moudGrid = h('div', { class: 'rc-moud-grid' }, [
      h('div', { class: 'rc-moud-card safe' }, [
        h('div', { class: 'moud-status-badge safe' }, 'PREFERRED FIRST-LINE'),
        h('h3', {}, RENAL_MOUD_PHARMACOKINETICS.buprenorphine.nameEn),
        h('p', {}, [h('strong', {}, 'Pharmacokinetics & Elimination: '), RENAL_MOUD_PHARMACOKINETICS.buprenorphine.pharmacokineticsEn]),
        h('p', {}, [h('strong', {}, 'Clinical Directives: '), RENAL_MOUD_PHARMACOKINETICS.buprenorphine.clinicalDirectivesEn]),
      ]),

      h('div', { class: 'rc-moud-card caution' }, [
        h('div', { class: 'moud-status-badge caution' }, 'SAFE WITH MONITORING'),
        h('h3', {}, RENAL_MOUD_PHARMACOKINETICS.methadone.nameEn),
        h('p', {}, [h('strong', {}, 'Pharmacokinetics & Elimination: '), RENAL_MOUD_PHARMACOKINETICS.methadone.pharmacokineticsEn]),
        h('p', {}, [h('strong', {}, 'Clinical Directives: '), RENAL_MOUD_PHARMACOKINETICS.methadone.clinicalDirectivesEn]),
      ]),

      h('div', { class: 'rc-moud-card danger full-width' }, [
        h('div', { class: 'moud-status-badge danger' }, 'STRICT PROHIBITIONS & HAZARDS'),
        h('h3', {}, 'Contraindicated Opioids & Nephrotoxic Agents in Renal Failure'),
        h('p', {}, [h('strong', {}, 'Morphine M6G/M3G Lethal Coma Warning: '), RENAL_MOUD_PHARMACOKINETICS.opioidToxicityWarnings.morphineEn]),
        h('p', {}, [h('strong', {}, 'Meperidine (Demerol) Seizure Hazard: '), RENAL_MOUD_PHARMACOKINETICS.opioidToxicityWarnings.meperidineEn]),
        h('p', {}, [h('strong', {}, 'Codeine Toxicity Hazard: '), RENAL_MOUD_PHARMACOKINETICS.opioidToxicityWarnings.codeineEn]),
        h('p', {}, [h('strong', {}, 'NSAID Strict Prohibition in Renal Impairment: '), RENAL_MOUD_PHARMACOKINETICS.opioidToxicityWarnings.nsaidsNephrotoxicityEn]),
      ]),
    ]);

    section.appendChild(introCard);
    section.appendChild(moudGrid);
    return section;
  }

  function renderHarmReductionTab() {
    const section = h('section', { class: 'rc-harm-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'rc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('rc.hr.heading', 'Kidney Protection & Harm Reduction Directives')),
      h('p', { class: 'tab-subtitle' }, t('rc.hr.subtitle', 'Field harm reduction guidelines to prevent rhabdomyolysis, preserve nephrons, and avoid fatal medication toxicities.')),
    ]);

    const rulesGrid = h('div', { class: 'rc-rules-grid' }, RENAL_HARM_REDUCTION_RULES.map((rule) => h('div', { class: 'rc-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${rule.ruleNum}`),
      h('h3', {}, rule.titleEn),
      h('p', {}, rule.detailEn),
    ])));

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    const urologyCrossLink = h('div', { class: 'rc-card mt-3' }, [
      h('h3', {}, 'Post-Renal Obstructive AKI, Acute Urinary Retention & Ketamine Hydronephrosis'),
      h('p', {}, 'Always rule out silent bladder distension (opioids, anticholinergics, stimulants) and ketamine ureteral stricture in acute kidney injury, and monitor for post-obstructive diuresis (> 200 mL/hr) after catheter decompression: '),
      h('a', { href: '#/urology-care' }, 'Open Urologic & Genitourinary Emergencies Navigator →'),
    ]);
    section.appendChild(urologyCrossLink);
    return section;
  }

  // Initial render & state subscription
  const unsubscribe = subscribeRenalState(() => render());
  render();

  return container;
}

