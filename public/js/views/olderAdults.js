/**
 * Older Adults & Medicare SUD Specialist View (public/js/views/olderAdults.js)
 *
 * Comprehensive clinical and statutory guidance for older adults (age 60+),
 * caregivers, geriatricians, and health navigators addressing substance use disorders:
 *
 * 1. Medicare SUD Statutory Benefits:
 *    - Medicare Part B Opioid Treatment Program (OTP) Benefit (SUPPORT Act § 2005; 42 CFR § 410.67):
 *      Bundled payment for methadone, buprenorphine, naltrexone, psychotherapy, and toxicology.
 *      Zero coinsurance ($0 copay) under Medicare Part B for enrolled OTP providers.
 *    - Office-Based Opioid Treatment (OBOT) codes (HCPCS G2086-G2088).
 *    - Medicare Part D prescription formulary rules for buprenorphine/naloxone.
 *    - Medicare Advantage (Part C) network adequacy standards (42 CFR § 422.116).
 *    - Medicare-Medicaid Dual Eligible Special Needs Plans (D-SNPs).
 *
 * 2. Geriatric Pharmacokinetics & Pharmacodynamics:
 *    - Decreased glomerular filtration rate (eGFR) and reduced renal clearance.
 *    - Reduced hepatic cytochrome P450 clearance and prolonged drug elimination half-lives.
 *    - Increased body fat / decreased total body water: expanded volume of distribution for lipophilic drugs.
 *    - Enhanced central nervous system sensitivity and blunted physiological reserve.
 *
 * 3. AGS Beers Criteria® Potentially Inappropriate Medications & Polypharmacy:
 *    - Opioid + Benzodiazepine co-prescribing (FDA Black Box Warning).
 *    - Opioid + Gabapentinoid synergistic respiratory depression.
 *    - Sedative-hypnotics (Z-drugs: zolpidem) and fall / fracture / delirium risk.
 *    - Anticholinergic cognitive burden and urinary retention.
 *    - Methadone QTc interval prolongation in the presence of cardiac medications.
 *
 * 4. Interactive In-RAM Decision Support:
 *    - Medicare coverage pathway finder.
 *    - Polypharmacy & Beers Criteria interaction screener.
 *    - Age-adapted drinking limits & screening guidelines (AUDIT-C geriatric cutoffs).
 *    - Printable, zero-PII clinical discussion checklist.
 *
 * Strict Invariants:
 * - Zero npm dependencies (Node 20+ built-ins only, plain ES modules).
 * - Zero PII: 100% ephemeral in-RAM state. Never writes user answers to URLs, device storage, or cookies.
 * - Accessible DOM construction via h() (document.createElement, textContent, setAttribute).
 *   ZERO direct markup string injection or inline style attributes.
 * - Complete bilingual parity (English / Spanish).
 */

import { h, clear, ext, tel, sms, icon, copyText, syncTablists, wireTablistKeyboard } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong } from './common.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetOlderAdultsState);

// ============================================================================
// 1. Medicare SUD Statutory Rules & Benefit Taxonomy
// ============================================================================

export const MEDICARE_SUD_RULES = [
  {
    benefitId: 'part_b_otp',
    title: {
      en: 'Medicare Part B: Opioid Treatment Program (OTP) Bundled Benefit',
      es: 'Medicare Parte B: Beneficio Integrado para Programas de Tratamiento de Opioides (OTP)',
    },
    statute: 'SUPPORT Act § 2005; Social Security Act § 1861(jjj); 42 C.F.R. § 410.67',
    costSharing: {
      en: '$0 copayment / 0% coinsurance for Medicare beneficiaries receiving services from enrolled OTPs once Part B deductible is met (often waived for dual eligibles).',
      es: '$0 copago / 0% coseguro para beneficiarios de Medicare en OTPs inscritos una vez deducible de Parte B cubierto.',
    },
    coveredServices: {
      en: [
        'FDA-approved opioid medications: Methadone dispensing, Buprenorphine dosing, and Naltrexone injections',
        'Substance use disorder individual and group psychotherapy delivered by licensed clinicians',
        'Toxicology drug screening and clinical laboratory monitoring',
        'Intake assessments, medical evaluations, and periodic treatment planning',
      ],
      es: [
        'Medicamentos aprobados por FDA: Dispensación de metadona, buprenorfina e inyecciones de naltrexona',
        'Psicoterapia individual y grupal para consumo de sustancias por profesionales con licencia',
        'Pruebas toxicológicas y monitoreo clínico de laboratorio',
        'Evaluaciones iniciales, exámenes médicos y planes periódicos de tratamiento',
      ],
    },
    actionableAdvice: {
      en: 'Confirm that the Opioid Treatment Program is officially enrolled as a Medicare provider. If enrolled, Medicare pays 100% of the allowable bundled payment with zero out-of-pocket coinsurance for covered OTP services.',
      es: 'Confirme que el Programa de Tratamiento de Opioides esté oficialmente inscrito como proveedor de Medicare. Si está inscrito, Medicare cubre el 100% de la tarifa integrada sin coseguro.',
    },
  },
  {
    benefitId: 'part_b_obot',
    title: {
      en: 'Medicare Part B: Office-Based Opioid Treatment (OBOT Bundled Codes)',
      es: 'Medicare Parte B: Tratamiento de Opioides en Consulta Médica (Códigos Integrados OBOT)',
    },
    statute: 'CMS Physician Fee Schedule; HCPCS G2086, G2087, G2088; 42 C.F.R. § 414.114',
    costSharing: {
      en: 'Standard Part B 20% coinsurance after Part B deductible (covered by Medigap or Medicaid for dual eligibles).',
      es: 'Coseguro estándar del 20% de la Parte B tras el deducible (cubierto por Medigap o Medicaid para personas con doble elegibilidad).',
    },
    coveredServices: {
      en: [
        'HCPCS G2086: Initial month of office-based buprenorphine clinical care, care coordination, and psychotherapy (min 70 min)',
        'HCPCS G2087: Subsequent months of routine buprenorphine care coordination and therapy (min 60 min)',
        'HCPCS G2088: Add-on code for additional 30 minutes of clinical therapy when medically necessary',
      ],
      es: [
        'HCPCS G2086: Mes inicial de atención médica ambulatoria de buprenorfina, coordinación y terapia (mín 70 min)',
        'HCPCS G2087: Meses posteriores de coordinación y terapia rutinaria de buprenorfina (mín 60 min)',
        'HCPCS G2088: Código adicional por 30 minutos complementarios de terapia médica necesaria',
      ],
    },
    actionableAdvice: {
      en: 'Primary care doctors and geriatricians can bill these bundled monthly codes to provide comprehensive buprenorphine management directly in their private clinic or outpatient center.',
      es: 'Médicos de atención primaria y geriatras pueden facturar estos códigos mensuales integrados para brindar manejo de buprenorfina en su propia consulta médica.',
    },
  },
  {
    benefitId: 'part_d_pharmacy',
    title: {
      en: 'Medicare Part D: Prescription Drug Formulary Protections for MOUD',
      es: 'Medicare Parte D: Protecciones de Formulario Farmacéutico para Medicamentos MOUD',
    },
    statute: '42 C.F.R. § 423.120; CMS Part D Formulary Guidance',
    costSharing: {
      en: 'Tiered copayments depending on plan formulary; Low-Income Subsidy (Extra Help) reduces generic copayments to minimal amounts ($0 to $4.50).',
      es: 'Copagos según formulario del plan; el subsidio de bajos ingresos (Extra Help) reduce copagos de genéricos a montos mínimos ($0 a $4.50).',
    },
    coveredServices: {
      en: [
        'Sublingual buprenorphine/naloxone tablets and films (generic Suboxone, Zubsolv)',
        'Nasal naloxone rescue sprays (Narcan generic) with zero or low copayment tiers',
        'Oral naltrexone tablets for alcohol use disorder and opioid relapse prevention',
      ],
      es: [
        'Tabletas y láminas sublinguales de buprenorfina/naloxona (genérico de Suboxone, Zubsolv)',
        'Aerosoles nasales de naloxona (Narcan genérico) en niveles de copago nulo o bajo',
        'Tabletas de naltrexona oral para trastorno por uso de alcohol y prevención de recaídas',
      ],
    },
    actionableAdvice: {
      en: 'If a Part D plan requires prior authorization that delays urgent addiction treatment, clinicians can file an expedited redetermination under 42 C.F.R. § 423.570 with a decision required within 72 hours (or 24 hours for emergency).',
      es: 'Si un plan de la Parte D exige autorización previa que demora el tratamiento urgente, el médico puede solicitar una redeterminación expedita según 42 CFR § 423.570 con respuesta en 72 horas (o 24 horas en urgencias).',
    },
  },
  {
    benefitId: 'medicare_advantage_adequacy',
    title: {
      en: 'Medicare Advantage (Part C): Network Adequacy & Behavioral Health Parity',
      es: 'Medicare Advantage (Parte C): Adecuación de Red y Paridad de Salud Conductual',
    },
    statute: '42 C.F.R. § 422.116 (Network Adequacy Standards); Mental Health Parity Act',
    costSharing: {
      en: 'In-network cost-sharing cannot exceed Original Medicare Part B standards for OTP services ($0 copay for covered OTP bundled care).',
      es: 'El costo compartido dentro de la red no puede superar el estándar de la Parte B de Medicare Original para servicios OTP ($0 copago en OTP integrados).',
    },
    coveredServices: {
      en: [
        'Mandatory inclusion of behavioral health and substance use disorder facilities within geographic access standards',
        'If network lacks an available OTP within designated travel time/distance, plan must authorize out-of-network care at in-network cost rates',
        'Care coordination and transition support following hospital discharge',
      ],
      es: [
        'Inclusión obligatoria de centros de salud mental y adicciones según estándares geográficos de acceso',
        'Si la red carece de un OTP disponible dentro del tiempo de viaje designado, el plan debe autorizar atención fuera de red con tarifas de red',
        'Coordinación de atención y apoyo de transición tras el alta hospitalaria',
      ],
    },
    actionableAdvice: {
      en: 'If your Medicare Advantage HMO/PPO has no contracted OTP within 30-60 minutes travel time, request an immediate Out-of-Network Service Authorization citing 42 C.F.R. § 422.116.',
      es: 'Si su plan Medicare Advantage no tiene un OTP contratado a 30-60 minutos de viaje, solicite de inmediato una Autorización Fuera de Red citando 42 CFR § 422.116.',
    },
  },
];

// ============================================================================
// 2. AGS Beers Criteria® & Geriatric Polypharmacy Interactions
// ============================================================================

export const BEERS_CRITERIA_INTERACTIONS = [
  {
    id: 'opioid_benzodiazepine',
    title: {
      en: 'Opioid + Benzodiazepine Concurrent Therapy',
      es: 'Terapia Concurrente de Opioide + Benzodiacepina',
    },
    severity: 'critical',
    authority: 'AGS Beers Criteria® 2023; FDA Black Box Warning',
    mechanism: {
      en: 'Synergistic central nervous system and respiratory depression. Benzodiazepines blunt the hypercapnic respiratory drive while opioids suppress respiratory frequency, dramatically multiplying fatal overdose and hypoxemic respiratory arrest risk.',
      es: 'Depresión sinérgica del sistema nervioso central y respiratorio. Las benzodiacepinas atenúan la respuesta hipercápnica mientras los opioides reducen la frecuencia respiratoria, multiplicando drásticamente el riesgo de paro hipoxémico.',
    },
    geriatricRisk: {
      en: 'In older adults, reduced hepatic CYP450 metabolism leads to prolonged elimination half-lives (e.g. diazepam half-life can exceed 100 hours in seniors), causing cumulative drug accumulation, severe sedation, catastrophic falls, and delirium.',
      es: 'En adultos mayores, la disminución del metabolismo hepático CYP450 alarga las vidas medias (la vida media de diazepam puede superar las 100 horas), provocando acumulación, sedación severa, caídas catastróficas y delirio.',
    },
    clinicalAction: {
      en: 'Never abruptly discontinue either medication (abrupt benzodiazepine cessation triggers life-threatening status epilepticus and severe autonomic rebound). Formulate a gradual, medically supervised taper or transition opioid therapy to buprenorphine (which has a safer ceiling effect on respiratory depression). Prescribe take-home nasal naloxone.',
      es: 'Nunca suspenda abruptamente ninguno de los dos fármacos (la suspensión súbita de benzodiacepinas desencadena convulsiones mortales y rebote autonómico). Planifique un retiro gradual supervisado o transicione a buprenorfina (que posee un efecto techo protector sobre la depresión respiratoria). Prescriba naloxona nasal para llevar a casa.',
    },
  },
  {
    id: 'opioid_gabapentinoid',
    title: {
      en: 'Opioid + Gabapentinoid (Gabapentin / Pregabalin)',
      es: 'Opioide + Gabapentinoide (Gabapentina / Pregabalina)',
    },
    severity: 'high',
    authority: 'AGS Beers Criteria® 2023; FDA Drug Safety Communication',
    mechanism: {
      en: 'Additive central nervous system depression. Gabapentinoids amplify opioid-induced respiratory depression through independent presynaptic voltage-gated calcium channel inhibition and GABAergic potentiation.',
      es: 'Depresión aditiva del sistema nervioso central. Los gabapentinoides amplifican la depresión respiratoria inducida por opioides mediante inhibición de canales de calcio presinápticos y potenciación GABAérgica.',
    },
    geriatricRisk: {
      en: 'Gabapentin and pregabalin are eliminated 100% renally. Age-related decline in glomerular filtration rate (eGFR) results in massive serum accumulation if doses are not adjusted for creatinine clearance, causing profound ataxia, sedation, and falls.',
      es: 'La gabapentina y la pregabalina se eliminan al 100% por vía renal. La disminución de la tasa de filtración glomerular (eGFR) ligada a la edad produce acumulación sérica si no se ajusta la dosis a la función renal, causando ataxia profunda, sedación y caídas.',
    },
    clinicalAction: {
      en: 'Check estimated creatinine clearance (CrCl). Reduce gabapentinoid dose appropriately for renal function. Avoid escalating both agents simultaneously.',
      es: 'Verifique el aclaramiento de creatinina (CrCl). Reduzca la dosis del gabapentinoide según la función renal. Evite escalar ambos fármacos al mismo tiempo.',
    },
  },
  {
    id: 'sedative_hypnotics_z_drugs',
    title: {
      en: 'Sedative-Hypnotics (Z-Drugs: Zolpidem, Eszopiclone, Zaleplon)',
      es: 'Sedantes Hipnóticos (Fármacos Z: Zolpidem, Eszopiclona, Zaleplón)',
    },
    severity: 'high',
    authority: 'AGS Beers Criteria® 2023 (Strong Avoidance Recommendation)',
    mechanism: {
      en: 'Non-benzodiazepine benzodiazepine-receptor agonists share identical neuroreceptor risks with benzodiazepines: delirium, nighttime sleep-related behaviors, complex amnesia, and marked postural instability.',
      es: 'Los agonistas no benzodiacepínicos comparten los mismos riesgos neuroreceptores que las benzodiacepinas: delirio, conductas complejas durante el sueño, amnesia e inestabilidad postural.',
    },
    geriatricRisk: {
      en: 'Doubles the risk of hip fractures, traumatic brain injuries, emergency room visits, and motor vehicle accidents in adults aged 65 and older. Minimal clinical improvement in sleep latency (averaging < 10 minutes).',
      es: 'Duplica el riesgo de fracturas de cadera, traumatismo craneoencefálico, visitas a urgencias y accidentes automovilísticos en mayores de 65 años. Aporte clínico mínimo en latencia del sueño (< 10 minutos promedio).',
    },
    clinicalAction: {
      en: 'Discontinue Z-drugs using a structured taper. Substitute evidence-based Cognitive Behavioral Therapy for Insomnia (CBT-I) and sleep hygiene protocols.',
      es: 'Descontinúe los fármacos Z mediante un retiro estructurado. Sustitúyalos por Terapia Cognitivo-Conductual para el Insomnio (TCC-I) y normas de higiene del sueño.',
    },
  },
  {
    id: 'anticholinergic_burden',
    title: {
      en: 'High Anticholinergic Burden Medications (Diphenhydramine, Hydroxyzine, Oxybutynin)',
      es: 'Fármacos con Alta Carga Anticolinérgica (Difenhidramina, Hidroxizina, Oxibutinina)',
    },
    severity: 'moderate',
    authority: 'AGS Beers Criteria® 2023; Anticholinergic Cognitive Burden (ACB) Scale',
    mechanism: {
      en: 'Blockade of central and peripheral muscarinic acetylcholine receptors.',
      es: 'Bloqueo de receptores muscarínicos centrales y periféricos de acetilcolina.',
    },
    geriatricRisk: {
      en: 'Causes acute delirium, accelerated cognitive decline, worsening dementia, acute urinary retention, severe xerostomia, and severe constipation which aggravates opioid-induced bowel dysfunction into life-threatening fecal impaction or bowel perforation.',
      es: 'Provoca delirio agudo, deterioro cognitivo acelerado, retención urinaria aguda, boca seca y estreñimiento severo que agrava la disfunción intestinal por opioides hacia impactación fecal o perforación intestinal.',
    },
    clinicalAction: {
      en: 'Deprescribe high-anticholinergic antihistamines and bladder antispasmodics. Use non-anticholinergic alternatives for anxiety or pruritus.',
      es: 'Desprescriba antihistamínicos anticolinérgicos y antiespasmódicos vesicales. Utilice alternativas no anticolinérgicas para ansiedad o prurito.',
    },
  },
  {
    id: 'methadone_qtc_prolongation',
    title: {
      en: 'Methadone Cardiac Conduction & QTc Prolongation Risk',
      es: 'Riesgo de Conducción Cardíaca y Prolongación del QTc con Metadona',
    },
    severity: 'high',
    authority: 'CSAT TIP 63; AHA/ACC Scientific Statement on Drug-Induced Arrhythmias',
    mechanism: {
      en: 'Inhibition of cardiac hERG potassium channels (I_Kr current), delaying cardiac ventricular repolarization and prolonging the corrected QT (QTc) interval.',
      es: 'Inhibición de canales cardíacos de potasio hERG (corriente I_Kr), retrasando la repolarización ventricular y prolongando el intervalo QT corregido (QTc).',
    },
    geriatricRisk: {
      en: 'Older adults frequently take concomitant QTc-prolonging medications (antiarrhythmics like amiodarone, fluoroquinolones like ciprofloxacin, SSRIs like citalopram/escitalopram) and have higher prevalence of underlying structural heart disease, bradycardia, or electrolyte abnormalities (hypokalemia, hypomagnesemia). Markedly increases risk of Torsades de Pointes and sudden cardiac death.',
      es: 'Los adultos mayores toman con frecuencia fármacos concomitantes que prolongan el QTc (amiodarona, ciprofloxacino, citalopram) y presentan mayor prevalencia de cardiopatía estructural, bradicardia o hipopotasemia. Aumenta marcadamente el riesgo de Torsades de Pointes y muerte súbita cardíaca.',
    },
    clinicalAction: {
      en: 'Obtain baseline 12-lead ECG prior to methadone initiation if daily dose is anticipated > 30-40 mg or in patients with cardiac risk factors. If QTc > 500 ms, consider switching to buprenorphine (which has minimal effect on cardiac conduction) or reducing methadone dose.',
      es: 'Obtenga un electrocardiograma de 12 derivaciones basal antes de iniciar metadona si la dosis superará 30-40 mg/día o en pacientes con riesgo cardíaco. Si el QTc > 500 ms, considere cambiar a buprenorfina (que tiene mínimo efecto en conducción cardíaca).',
    },
  },
];

// ============================================================================
// 3. Geriatric Physiological & Pharmacokinetic Principles
// ============================================================================

export const GERIATRIC_PHARMACOKINETIC_RULES = {
  renalClearance: {
    en: 'Glomerular filtration rate (eGFR) declines by approximately 1 mL/min per year after age 40. Active drug metabolites that are renally cleared (e.g. morphine-6-glucuronide, gabapentin) accumulate rapidly, requiring renal dose calculations based on Cockcroft-Gault CrCl rather than serum creatinine alone (since low muscle mass falsely depresses serum creatinine).',
    es: 'La tasa de filtración glomerular (eGFR) disminuye ~1 mL/min por año después de los 40 años. Los metabolitos activos eliminados por vía renal se acumulan con rapidez, exigiendo cálculos basados en CrCl de Cockcroft-Gault en lugar de la creatinina sérica sola.',
  },
  hepaticMetabolism: {
    en: 'Hepatic blood flow and liver mass diminish by 20-40% in older age. Cytochrome P450 enzyme activity (CYP3A4, CYP2D6, CYP2C19) exhibits reduced clearance, resulting in impaired first-pass metabolism, higher bioavailability of oral opioids, and extended elimination half-lives.',
    es: 'El flujo sanguíneo hepático y la masa hepática disminuyen un 20-40% en la vejez. Las enzimas del citocromo P450 reducen su aclaramiento, produciendo menor efecto de primer paso, mayor biodisponibilidad y vidas medias prolongadas.',
  },
  bodyComposition: {
    en: 'Aging is characterized by increased body fat percentage and reduced total body water and plasma albumin. Highly lipophilic medications (methadone, diazepam) distribute into expanded adipose tissue, resulting in a prolonged terminal elimination phase. Conversely, hydrophilic drugs (alcohol, morphine) distribute into smaller water volumes, producing higher peak plasma levels.',
    es: 'El envejecimiento cursa con mayor porcentaje de grasa corporal y menor agua corporal total y albúmina. Medicamentos lipofílicos (metadona, diazepam) se acumulan en tejido adiposo, prolongando su eliminación. Fármacos hidrofílicos (alcohol, morfina) alcanzan concentraciones máximas más altas.',
  },
  buprenorphineAdvantage: {
    en: 'Sublingual buprenorphine is widely recognized as the preferred MOUD in older adults because of its partial mu-opioid receptor agonism: it features a plateau (ceiling effect) on respiratory depression, does not prolong the QTc interval, has no active renal metabolites, and carries lower cognitive and sedation side effects than full opioid agonists.',
    es: 'La buprenorfina sublingual se considera el MOUD de elección en adultos mayores debido a su agonismo parcial de receptores opioides mu: cuenta con efecto techo protector frente a depresión respiratoria, no prolonga el intervalo QTc, carece de metabolitos renales activos y ocasiona menor sedación que los agonistas completos.',
  },
};

// ============================================================================
// 4. Age-Adapted Screening Standards (Geriatric AUDIT-C & Substance Limits)
// ============================================================================

export const OLDER_ADULT_SCREENING_STANDARDS = {
  alcoholLimits: {
    en: 'National Institute on Alcohol Abuse and Alcoholism (NIAAA) and American Geriatrics Society (AGS) guidelines for adults aged 65+: No more than 1 standard drink per day (12 oz regular beer, 5 oz wine, or 1.5 oz spirits), and no more than 7 standard drinks per week. For older adults taking sedating medications or with liver/kidney disease, zero alcohol consumption is advised.',
    es: 'Pautas del NIAAA y la Sociedad Americana de Geriatría (AGS) para adultos de 65+ años: No más de 1 trago estándar por día y no más de 7 tragos por semana. En mayores que toman sedantes o con enfermedad hepática/renal, se recomienda consumo cero de alcohol.',
  },
  auditCCutoff: {
    en: 'For adults aged 65+, the validated AUDIT-C positive cutoff is >= 3 points for both men and women (compared to >= 4 points for younger men), reflecting increased central nervous system sensitivity and reduced body water volume in older age.',
    es: 'Para adultos de 65+ años, el punto de corte validado del AUDIT-C positivo es >= 3 puntos tanto para hombres como para mujeres (frente a >= 4 en hombres jóvenes), reflejando mayor sensibilidad y menor volumen de agua corporal.',
  },
  dementiaVsSud: {
    en: 'Substance use disorders in older adults are frequently misattributed to Alzheimer disease, normal cognitive aging, or depression. Clinical clues for SUD include fluctuating alertness, frequent unexplained falls or contusions, erratic medication adherence, nutritional neglect, and sleep-wake cycle reversal.',
    es: 'Los trastornos por uso de sustancias en personas mayores a menudo se confunden con enfermedad de Alzheimer o envejecimiento normal. Indicios clave incluyen fluctuación del estado de alerta, caídas frecuentes, adherencia errática a fármacos y desnutrición.',
  },
};

// ============================================================================
// 5. In-RAM Decision Aid Engine: evaluateOlderAdultCare(inputs)
// ============================================================================

export function evaluateOlderAdultCare(inputs = {}) {
  const {
    age = 65,
    medicarePlan = 'part_b_original', // 'part_b_original' | 'medicare_advantage' | 'dual_eligible' | 'none_uninsured' | 'unknown'
    substances = [],                  // ['opioids', 'alcohol', 'benzodiazepines', 'cannabis', 'stimulants']
    currentMedications = [],          // ['benzodiazepine', 'gabapentinoid', 'z_drugs', 'anticholinergic', 'cardiac_antiarrhythmic']
    hasRenalHepaticImpairment = false,
    fallHistory = false,
  } = inputs;

  const numericAge = Number(age) || 65;
  const isGeriatric = numericAge >= 65;

  // Determine Medicare Pathway & Coverage Rights
  let medicareSummary = {
    planType: medicarePlan,
    otpCoverage: '$0 copay under Medicare Part B OTP benefit (covered 100% by Medicare for enrolled OTPs)',
    obotCoverage: 'Part B 80% / 20% coinsurance (covered by Medigap or Medicaid)',
    partDCoverage: 'Formulary protection for sublingual buprenorphine; low-cost tier for nasal naloxone',
    networkNotice: 'Original Medicare permits seeing any enrolled Medicare provider nationwide without prior authorization',
  };

  if (medicarePlan === 'medicare_advantage') {
    medicareSummary = {
      planType: medicarePlan,
      otpCoverage: 'Medicare Advantage must cover OTP bundled services at $0 in-network copay parity with Original Medicare Part B',
      obotCoverage: 'In-network copay set by plan; cannot exceed Part B equivalent cost sharing',
      partDCoverage: 'Included in MA-PD plan formulary; right to expedited 72-hour coverage redetermination',
      networkNotice: 'Under 42 C.F.R. § 422.116 network adequacy rules, if plan lacks an in-network OTP within 30-60 min travel time, plan MUST authorize an out-of-network OTP at in-network rates',
    };
  } else if (medicarePlan === 'dual_eligible') {
    medicareSummary = {
      planType: medicarePlan,
      otpCoverage: '$0 out-of-pocket: Medicare Part B covers primary payment, Medicaid secondary covers any remaining deductible',
      obotCoverage: '$0 out-of-pocket: Full dual-eligible crossover coverage',
      partDCoverage: 'Low-Income Subsidy (Extra Help) Level 1: $0 to $4.50 max prescription copays',
      networkNotice: 'Dual-Eligible Special Needs Plans (D-SNPs) provide dedicated care managers to coordinate transportation and appointments',
    };
  } else if (medicarePlan === 'none_uninsured') {
    medicareSummary = {
      planType: medicarePlan,
      otpCoverage: 'FQHC sliding-fee scale programs or state-funded Block Grant clinics provide subsidized or $0 care',
      obotCoverage: 'Federally Qualified Health Centers offer sliding-scale fees based on household income',
      partDCoverage: 'Manufacturer patient assistance programs (PAP) or local public health harm reduction kits',
      networkNotice: 'Evaluate eligibility for retroactive Medicaid or Medicare General Enrollment Period',
    };
  }

  // Detect Polypharmacy & Beers Criteria Interactions
  const identifiedBeers = [];

  const hasOpioids = substances.includes('opioids');
  const hasBenzo = currentMedications.includes('benzodiazepine') || substances.includes('benzodiazepines');
  const hasGabapentin = currentMedications.includes('gabapentinoid');
  const hasZDrugs = currentMedications.includes('z_drugs');
  const hasAnticholinergic = currentMedications.includes('anticholinergic');
  const hasCardiacMeds = currentMedications.includes('cardiac_antiarrhythmic');

  if (hasOpioids && hasBenzo) {
    identifiedBeers.push(BEERS_CRITERIA_INTERACTIONS.find((b) => b.id === 'opioid_benzodiazepine'));
  }

  if (hasOpioids && hasGabapentin) {
    identifiedBeers.push(BEERS_CRITERIA_INTERACTIONS.find((b) => b.id === 'opioid_gabapentinoid'));
  }

  if (hasZDrugs) {
    identifiedBeers.push(BEERS_CRITERIA_INTERACTIONS.find((b) => b.id === 'sedative_hypnotics_z_drugs'));
  }

  if (hasAnticholinergic) {
    identifiedBeers.push(BEERS_CRITERIA_INTERACTIONS.find((b) => b.id === 'anticholinergic_burden'));
  }

  if (hasOpioids && hasCardiacMeds) {
    identifiedBeers.push(BEERS_CRITERIA_INTERACTIONS.find((b) => b.id === 'methadone_qtc_prolongation'));
  }

  // Clinical Cautions & Recommendations
  const clinicalRecommendations = [];

  if (hasOpioids) {
    clinicalRecommendations.push({
      priority: 'high',
      title: {
        en: 'Buprenorphine as Preferred Geriatric MOUD',
        es: 'Buprenorfina como MOUD de Elección en Geriatría',
      },
      text: {
        en: 'Buprenorphine is clinically preferred over methadone in older adults due to its respiratory depression ceiling, absence of QTc prolongation, lack of renal metabolite accumulation, and favorable cognitive safety profile.',
        es: 'La buprenorfina es clínicamente preferible a la metadona en adultos mayores debido a su techo de depresión respiratoria, ausencia de prolongación del QTc y mejor perfil cognitivo.',
      },
    });
    clinicalRecommendations.push({
      priority: 'immediate',
      title: {
        en: 'Prescribe Nasal Naloxone & Educate Caregivers',
        es: 'Prescribir Naloxona Nasal y Educar a Cuidadores',
      },
      text: {
        en: 'Ensure patient and co-residing family or caregivers have at least 2 doses of nasal naloxone (Narcan). Older adults have heightened sensitivity to accidental opioid toxicity from dosing errors or polypharmacy.',
        es: 'Asegúrese de que el paciente y su familia dispongan de al menos 2 dosis de naloxona nasal (Narcan). Los adultos mayores tienen mayor sensibilidad a toxicidad accidental por errores de dosificación.',
      },
    });
  }

  if (substances.includes('alcohol')) {
    clinicalRecommendations.push({
      priority: 'high',
      title: {
        en: 'Age-Adapted Alcohol Limit & Safer Pharmacotherapy',
        es: 'Límite de Alcohol Adaptado y Farmacoterapia Segura',
      },
      text: {
        en: 'Reiterate the geriatric limit (max 1 drink/day, 7 drinks/week). For alcohol use disorder pharmacotherapy, oral Naltrexone or Acamprosate (dose-adjusted for eGFR) are evidence-based options; avoid disulfiram in older adults due to cardiovascular stress risks.',
        es: 'Reitere el límite geriátrico (máx 1 trago/día, 7 tragos/semana). Para farmacoterapia del alcohol, naltrexona oral o acamprosato (ajustado a eGFR) son opciones recomendadas; evite el disulfiram por estrés cardiovascular.',
      },
    });
  }

  if (hasRenalHepaticImpairment) {
    clinicalRecommendations.push({
      priority: 'high',
      title: {
        en: 'Renal & Hepatic Dose Titration Protocol',
        es: 'Protocolo de Titulación Renal y Hepática',
      },
      text: {
        en: 'Calculate creatinine clearance using Cockcroft-Gault formula with actual body weight. Initiate pharmacotherapy at 50% standard starting dose ("start low, go slow") and extend dosing intervals to prevent drug accumulation.',
        es: 'Calcule el aclaramiento de creatinina con la fórmula de Cockcroft-Gault. Inicie la farmacoterapia al 50% de la dosis estándar ("comenzar bajo, avanzar lento") y espacie intervalos.',
      },
    });
  }

  if (fallHistory || hasBenzo || hasZDrugs) {
    clinicalRecommendations.push({
      priority: 'high',
      title: {
        en: 'Comprehensive Fall Risk & Sedation Reduction Plan',
        es: 'Plan de Reducción de Caídas y Sedación',
      },
      text: {
        en: 'Initiate physical therapy / balance assessment, review home safety (remove scatter rugs, add bathroom grab bars), and schedule a medication deprescribing consultation to systematically reduce sedative-hypnotic load.',
        es: 'Inicie valoración de fisioterapia y equilibrio, revise seguridad en el hogar y programe una consulta de desprescripción para reducir la carga de sedantes e hipnóticos.',
      },
    });
  }

  // Discussion Checklist for Medical Appointments
  const discussionItems = [
    {
      topic: { en: 'Medicare Coverage', es: 'Cobertura de Medicare' },
      question: {
        en: 'Does your facility bill Medicare Part B bundled OTP codes ($0 copay) or office-based buprenorphine G-codes?',
        es: '¿Su centro factura los códigos integrados de OTP de la Parte B de Medicare ($0 copago) o los códigos G de buprenorfina?',
      },
    },
    {
      topic: { en: 'Drug-Drug Interactions', es: 'Interacciones Farmacológicas' },
      question: {
        en: 'Can we conduct a comprehensive Beers Criteria medication review of all my prescription sedatives, pain medications, and over-the-counter sleep aids?',
        es: '¿Podemos realizar una revisión exhaustiva según los Criterios de Beers de todos mis sedantes, analgésicos y somníferos de venta libre?',
      },
    },
    {
      topic: { en: 'Kidney & Liver Function', es: 'Función Renal y Hepática' },
      question: {
        en: 'Have my latest kidney filtration rates (eGFR/CrCl) and liver enzymes been reviewed to ensure proper medication dosing?',
        es: '¿Se han revisado mis tasas de filtración renal (eGFR/CrCl) y enzimas hepáticas para garantizar dosis adecuadas de mis medicamentos?',
      },
    },
    {
      topic: { en: 'Naloxone & Safety Plan', es: 'Naloxona y Plan de Seguridad' },
      question: {
        en: 'Can you write a Medicare Part D prescription for nasal naloxone (Narcan) so my family has a rescue kit at home?',
        es: '¿Puede emitir una receta de naloxona nasal (Narcan) bajo la Parte D de Medicare para que mi familia tenga un kit de rescate en casa?',
      },
    },
  ];

  return {
    evaluatedAt: new Date().toISOString(),
    inputs: { ...inputs, numericAge, isGeriatric },
    medicareSummary,
    identifiedBeers,
    clinicalRecommendations,
    discussionItems,
    pharmacokinetics: GERIATRIC_PHARMACOKINETIC_RULES,
    screeningStandards: OLDER_ADULT_SCREENING_STANDARDS,
  };
}

// ============================================================================
// 6. Ephemeral In-RAM State Management
// ============================================================================

let olderAdultState = {
  age: 68,
  medicarePlan: 'part_b_original',
  substances: ['opioids'],
  currentMedications: ['benzodiazepine'],
  hasRenalHepaticImpairment: false,
  fallHistory: false,
  activeTab: 'decision_aid', // 'decision_aid' | 'medicare' | 'beers' | 'pharmacokinetics'
  lastEvaluation: null,
};

export function getOlderAdultState() {
  return { ...olderAdultState };
}

export function setOlderAdultState(partial) {
  olderAdultState = { ...olderAdultState, ...partial };
  return getOlderAdultState();
}

export function resetOlderAdultsState() {
  olderAdultState = {
    age: 68,
    medicarePlan: 'part_b_original',
    substances: ['opioids'],
    currentMedications: ['benzodiazepine'],
    hasRenalHepaticImpairment: false,
    fallHistory: false,
    activeTab: 'decision_aid',
    lastEvaluation: null,
  };
  return getOlderAdultState();
}

// ============================================================================
// 7. Clinical Summary Text Formatter (Copy/Print)
// ============================================================================

export function formatOlderAdultSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'PLAN CLÍNICO DE ADULTOS MAYORES Y BENEFICIOS MEDICARE SUD - HARBORPATH'
      : 'OLDER ADULTS & MEDICARE SUD CLINICAL CARE PLAN - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Edad del paciente' : 'Patient Age'}: ${plan.inputs.numericAge} ${isEs ? 'años' : 'years'}`,
    `${isEs ? 'Plan de Medicare' : 'Medicare Plan'}: ${plan.inputs.medicarePlan.toUpperCase()}`,
    `${isEs ? 'Sustancias reportadas' : 'Substances'}: ${plan.inputs.substances.join(', ') || (isEs ? 'Ninguna' : 'None')}`,
    `${isEs ? 'Medicamentos concurrentes' : 'Concurrent Meds'}: ${plan.inputs.currentMedications.join(', ') || (isEs ? 'Ninguno' : 'None')}`,
    '',
    subDivider,
    isEs ? 'RESUMEN DE DERECHOS Y COBERTURA DE MEDICARE:' : 'MEDICARE COVERAGE & STATUTORY RIGHTS:',
    subDivider,
    `* ${isEs ? 'Cobertura OTP' : 'OTP Coverage'}: ${plan.medicareSummary.otpCoverage}`,
    `* ${isEs ? 'Tratamiento en Consulta' : 'OBOT Office Codes'}: ${plan.medicareSummary.obotCoverage}`,
    `* ${isEs ? 'Farmacia Parte D' : 'Part D Pharmacy'}: ${plan.medicareSummary.partDCoverage}`,
    `* ${isEs ? 'Aviso de Red' : 'Network Adequacy'}: ${plan.medicareSummary.networkNotice}`,
    '',
  ];

  if (plan.identifiedBeers.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ALERTAS DE CRITERIOS DE BEERS / POLIFARMACIA:' : 'BEERS CRITERIA & POLYPHARMACY ALERTS:');
    lines.push(subDivider);
    plan.identifiedBeers.forEach((b) => {
      lines.push(`[${b.severity.toUpperCase()}] ${isEs ? b.title.es : b.title.en}`);
      lines.push(`  ${isEs ? b.mechanism.es : b.mechanism.en}`);
      lines.push(`  ${isEs ? 'Acción Clínica: ' + b.clinicalAction.es : 'Clinical Action: ' + b.clinicalAction.en}`);
      lines.push('');
    });
  }

  if (plan.clinicalRecommendations.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'RECOMENDACIONES CLÍNICAS GERIÁTRICAS:' : 'GERIATRIC CLINICAL RECOMMENDATIONS:');
    lines.push(subDivider);
    plan.clinicalRecommendations.forEach((rec) => {
      lines.push(`* ${isEs ? rec.title.es : rec.title.en}: ${isEs ? rec.text.es : rec.text.en}`);
    });
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'PREGUNTAS PARA SU EQUIPO MÉDICO:' : 'PROVIDER DISCUSSION CHECKLIST:');
  lines.push(subDivider);
  plan.discussionItems.forEach((item) => {
    lines.push(`- [ ] (${isEs ? item.topic.es : item.topic.en}) ${isEs ? item.question.es : item.question.en}`);
  });

  lines.push('');
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 8. DOM View Component: olderAdultsView(containerOrOptions, maybeOptions)
// ============================================================================

export function olderAdultsView(containerOrOptions = {}, maybeOptions = {}) {
  let container = null;
  let options = maybeOptions;
  if (containerOrOptions && (typeof containerOrOptions.append === 'function' || containerOrOptions.nodeType || containerOrOptions.tagName)) {
    container = containerOrOptions;
  } else {
    options = containerOrOptions || {};
  }
  if (container) clear(container);

  const lang = getLang();
  const isEs = lang === 'es';

  // Evaluate current state
  const plan = evaluateOlderAdultCare(getOlderAdultState());
  setOlderAdultState({ lastEvaluation: plan });

  const root = h('div', { class: 'older-adults-view' });

  // Page Header
  const header = pageHeader(
    isEs ? 'Adultos Mayores y Cobertura Medicare SUD' : 'Older Adults & Medicare SUD Clinical Specialist',
    isEs
      ? 'Orientación clínica geriátrica, beneficios integrados de Medicare Parte B para OTP, advertencias de Criterios de Beers y manejo seguro de polifarmacia.'
      : 'Geriatric clinical guidance, Medicare Part B bundled OTP benefits, AGS Beers Criteria® alerts, and safe polypharmacy management.'
  );
  root.append(header);

  // In-RAM Privacy Banner
  const privacyAlert = h(
    'div',
    { class: 'panel alert-panel', role: 'note', 'aria-label': isEs ? 'Privacidad' : 'Privacy' },
    h('div', { class: 'panel-header' },
      icon('shield', { class: 'panel-icon' }),
      h('h2', { class: 'panel-title' }, isEs ? 'Asistencia Epímera en Memoria' : 'In-RAM Ephemeral Decision Support')
    ),
    h('p', { class: 'panel-body' },
      isEs
        ? 'Todas las opciones se evalúan en la memoria temporal del navegador. Procesado exclusivamente en memoria temporal del navegador sin persistencia. Se borra de inmediato con la Salida Rápida.'
        : 'All selections are processed in temporary browser memory only. No data is stored on disk or transmitted to servers. Cleared immediately upon Quick Exit.'
    )
  );
  root.append(privacyAlert);

  // Tabs Navigation
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de adultos mayores' : 'Older adults sections' });
  const tabs = [
    { id: 'decision_aid', label: isEs ? 'Evaluador y Plan Clínico' : 'Decision Aid & Care Plan' },
    { id: 'medicare', label: isEs ? 'Beneficios Medicare' : 'Medicare Benefits' },
    { id: 'beers', label: isEs ? 'Criterios de Beers (Interacciones)' : 'Beers Criteria Alerts' },
    { id: 'pharmacokinetics', label: isEs ? 'Farmacocinética Geriátrica' : 'Geriatric Physiology' },
  ];

  const currentTab = olderAdultState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-oa-${tab.id}`,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': 'tab-panel-oa',
      tabindex: isSelected ? '0' : '-1',
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setOlderAdultState({ activeTab: tab.id });
      olderAdultsView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Panel Content Container
  const tabPanel = h('div', {
    id: 'tab-panel-oa',
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-oa-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Decision Aid & Interactive Care Plan
  // --------------------------------------------------------------------------
  if (currentTab === 'decision_aid') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Parámetros del Paciente Mayor' : 'Patient Clinical & Coverage Parameters'));

    const formGrid = h('div', { class: 'form-grid' });

    // Age Input
    const ageGroup = h('div', { class: 'form-group' });
    ageGroup.append(h('label', { for: 'oa-age-input' }, isEs ? 'Edad del Paciente:' : 'Patient Age:'));
    const ageInput = h('input', {
      type: 'number',
      id: 'oa-age-input',
      class: 'input-text',
      value: String(olderAdultState.age),
      min: '55',
      max: '105',
    });
    ageInput.addEventListener('change', (e) => {
      setOlderAdultState({ age: Number(e.target.value) || 65 });
      olderAdultsView(container, options);
    });
    ageGroup.append(ageInput);
    formGrid.append(ageGroup);

    // Medicare Plan Type
    const planGroup = h('div', { class: 'form-group' });
    planGroup.append(h('label', { for: 'oa-medicare-select' }, isEs ? 'Tipo de Plan Medicare:' : 'Medicare Coverage Type:'));
    const planSelect = h('select', { id: 'oa-medicare-select', class: 'input-select' });

    const plans = [
      { id: 'part_b_original', label: isEs ? 'Medicare Original (Parte A y Parte B)' : 'Original Medicare (Parts A & B)' },
      { id: 'medicare_advantage', label: isEs ? 'Medicare Advantage (Parte C / HMO / PPO)' : 'Medicare Advantage (Part C HMO/PPO)' },
      { id: 'dual_eligible', label: isEs ? 'Doble Elegibilidad (Medicare + Medicaid)' : 'Dual Eligible (Medicare + Medicaid / D-SNP)' },
      { id: 'none_uninsured', label: isEs ? 'Sin Medicare / No asegurado' : 'Uninsured / FQHC sliding-scale needed' },
      { id: 'unknown', label: isEs ? 'No está seguro' : 'Unsure of plan details' },
    ];

    plans.forEach((p) => {
      const opt = h('option', { value: p.id }, p.label);
      if (p.id === olderAdultState.medicarePlan) opt.selected = true;
      planSelect.append(opt);
    });

    planSelect.addEventListener('change', (e) => {
      setOlderAdultState({ medicarePlan: e.target.value });
      olderAdultsView(container, options);
    });
    planGroup.append(planSelect);
    formGrid.append(planGroup);

    // Primary Substance of Concern
    const subGroup = h('div', { class: 'form-group' });
    subGroup.append(h('label', { for: 'oa-substance-select' }, isEs ? 'Sustancia Principal de Preocupación:' : 'Primary Substance of Concern:'));
    const subSelect = h('select', { id: 'oa-substance-select', class: 'input-select' });

    const substanceOptions = [
      { id: 'opioids', label: isEs ? 'Opioides (Recetados o Ilícitos)' : 'Opioids (Prescription or Illicit)' },
      { id: 'alcohol', label: isEs ? 'Alcohol (Consumo de riesgo)' : 'Alcohol (Unhealthy drinking)' },
      { id: 'benzodiazepines', label: isEs ? 'Benzodiacepinas / Sedantes' : 'Benzodiazepines / Sedatives' },
      { id: 'cannabis', label: isEs ? 'Cannabis / Derivados' : 'Cannabis / Cannabinoids' },
      { id: 'stimulants', label: isEs ? 'Estimulantes (Metanfetamina / Cocaína)' : 'Stimulants' },
    ];

    substanceOptions.forEach((so) => {
      const opt = h('option', { value: so.id }, so.label);
      if (olderAdultState.substances.includes(so.id)) opt.selected = true;
      subSelect.append(opt);
    });

    subSelect.addEventListener('change', (e) => {
      setOlderAdultState({ substances: [e.target.value] });
      olderAdultsView(container, options);
    });
    subGroup.append(subSelect);
    formGrid.append(subGroup);

    // Concurrent Medications
    const medGroup = h('div', { class: 'form-group' });
    medGroup.append(h('label', { for: 'oa-concurrent-med-select' }, isEs ? 'Medicamento Concurrente Clave:' : 'Key Concurrent Medication:'));
    const medSelect = h('select', { id: 'oa-concurrent-med-select', class: 'input-select' });

    const medOptions = [
      { id: 'benzodiazepine', label: isEs ? 'Benzodiacepina (Lorazepam, Clonazepam, etc.)' : 'Benzodiazepine (Lorazepam, Clonazepam, Diazepam)' },
      { id: 'gabapentinoid', label: isEs ? 'Gabapentinoide (Gabapentina / Pregabalina)' : 'Gabapentinoid (Gabapentin / Lyrica)' },
      { id: 'z_drugs', label: isEs ? 'Fármaco Z para dormir (Zolpidem / Ambien)' : 'Z-Drug for sleep (Zolpidem / Ambien)' },
      { id: 'anticholinergic', label: isEs ? 'Anticolinérgico (Difenhidramina, Oxibutinina)' : 'Anticholinergic (Benadryl, Ditropan)' },
      { id: 'cardiac_antiarrhythmic', label: isEs ? 'Fármaco Cardíaco (Amiodarona, Sotalol)' : 'Cardiac Antiarrhythmic (Amiodarone)' },
      { id: 'none', label: isEs ? 'Ninguno de estos' : 'None of the above' },
    ];

    medOptions.forEach((mo) => {
      const opt = h('option', { value: mo.id }, mo.label);
      if (olderAdultState.currentMedications.includes(mo.id)) opt.selected = true;
      medSelect.append(opt);
    });

    medSelect.addEventListener('change', (e) => {
      setOlderAdultState({ currentMedications: e.target.value === 'none' ? [] : [e.target.value] });
      olderAdultsView(container, options);
    });
    medGroup.append(medSelect);
    formGrid.append(medGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box
    const resultsCard = h('div', { class: 'card results-card' });

    // Medicare Coverage Rights Highlight
    const covBox = h('div', { class: 'medicare-coverage-highlight' });
    covBox.append(h('h4', {}, isEs ? 'Derechos de Cobertura de Medicare Identificados:' : 'Identified Medicare Coverage Rights:'));

    const covList = h('ul', { class: 'bullet-list' });
    covList.append(h('li', {}, h('strong', {}, isEs ? 'Programa OTP: ' : 'OTP Benefit: '), plan.medicareSummary.otpCoverage));
    covList.append(h('li', {}, h('strong', {}, isEs ? 'Consulta Médica OBOT: ' : 'OBOT Office Codes: '), plan.medicareSummary.obotCoverage));
    covList.append(h('li', {}, h('strong', {}, isEs ? 'Medicamentos en Farmacia: ' : 'Pharmacy Part D: '), plan.medicareSummary.partDCoverage));
    covList.append(h('li', {}, h('strong', {}, isEs ? 'Garantía de Red: ' : 'Network Protection: '), plan.medicareSummary.networkNotice));
    covBox.append(covList);
    resultsCard.append(covBox);

    // Beers Alerts if any
    if (plan.identifiedBeers.length > 0) {
      const beersBox = h('div', { class: 'beers-alert-container' });
      beersBox.append(h('h4', { class: 'text-warning' }, isEs ? '⚠ Alertas de Interacción Beers / Polifarmacia:' : '⚠ Beers Criteria Polypharmacy Warnings:'));

      plan.identifiedBeers.forEach((b) => {
        const bCard = h('div', { class: `beers-mini-card severity-${b.severity}` });
        bCard.append(h('strong', {}, isEs ? b.title.es : b.title.en));
        bCard.append(h('p', { class: 'beers-text' }, isEs ? b.mechanism.es : b.mechanism.en));
        bCard.append(h('p', { class: 'beers-action' },
          h('em', {}, isEs ? 'Acción Clínica Recomendada: ' : 'Recommended Clinical Action: '),
          isEs ? b.clinicalAction.es : b.clinicalAction.en
        ));
        beersBox.append(bCard);
      });
      resultsCard.append(beersBox);
    }

    // Clinical Recommendations
    const recBox = h('div', { class: 'recommendations-box' });
    recBox.append(h('h4', {}, isEs ? 'Pautas Clínicas Adaptadas a la Edad:' : 'Age-Adapted Clinical Recommendations:'));

    plan.clinicalRecommendations.forEach((rec) => {
      const rItem = h('div', { class: 'rec-item' });
      rItem.append(h('strong', {}, isEs ? rec.title.es : rec.title.en));
      rItem.append(h('p', {}, isEs ? rec.text.es : rec.text.en));
      recBox.append(rItem);
    });
    resultsCard.append(recBox);

    // Action Buttons
    const btnRow = h('div', { class: 'btn-row' });

    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' },
      icon('copy'),
      isEs ? ' Copiar Resumen Clínico' : ' Copy Clinical Summary'
    );
    copyBtn.addEventListener('click', async () => {
      const text = formatOlderAdultSummaryText(plan, lang);
      await copyText(text, {
        trigger: copyBtn,
        copiedLabel: isEs ? '✓ ¡Copiado!' : '✓ Copied!',
        announceSuccess: isEs ? 'Resumen copiado al portapapeles' : 'Summary copied to clipboard',
        announceFailure: isEs ? 'Error al copiar' : 'Clipboard write failed',
      });
    });
    btnRow.append(copyBtn);

    const treatLink = h('a', {
      href: '#/treatment?codes=OTP',
      class: 'btn btn-primary',
    }, icon('map-pin'), isEs ? ' Buscar Centros OTP de Medicare' : ' Find Medicare OTP Centers');
    btnRow.append(treatLink);

    resultsCard.append(btnRow);
    tabPanel.append(resultsCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: Medicare SUD Benefits Directory
  // --------------------------------------------------------------------------
  else if (currentTab === 'medicare') {
    const medCard = h('div', { class: 'card medicare-card' });
    medCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Beneficios y Estatutos de Medicare para el Tratamiento de Adicciones' : 'Medicare Substance Use Disorder Statutory Benefits'
    ));

    MEDICARE_SUD_RULES.forEach((rule) => {
      const ruleSection = h('div', { class: 'medicare-rule-section' });
      ruleSection.append(h('h4', { class: 'rule-title' }, isEs ? rule.title.es : rule.title.en));
      ruleSection.append(h('span', { class: 'legal-citation' }, rule.statute));

      const costBox = h('p', { class: 'rule-cost' },
        h('strong', {}, isEs ? 'Costo Compartido: ' : 'Cost Sharing: '),
        isEs ? rule.costSharing.es : rule.costSharing.en
      );
      ruleSection.append(costBox);

      const sList = h('ul', { class: 'rule-services-list' });
      const services = isEs ? rule.coveredServices.es : rule.coveredServices.en;
      services.forEach((s) => sList.append(h('li', {}, s)));
      ruleSection.append(sList);

      const adviceBox = h('p', { class: 'rule-advice' },
        h('strong', {}, isEs ? 'Consejo Práctico: ' : 'Actionable Advice: '),
        isEs ? rule.actionableAdvice.es : rule.actionableAdvice.en
      );
      ruleSection.append(adviceBox);

      medCard.append(ruleSection);
    });

    tabPanel.append(medCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: AGS Beers Criteria Alerts & Interactions
  // --------------------------------------------------------------------------
  else if (currentTab === 'beers') {
    const beersCard = h('div', { class: 'card beers-criteria-card' });
    beersCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Criterios de Beers de la AGS: Medicamentos Inapropiados en Geriatría' : 'AGS Beers Criteria® for Potentially Inappropriate Medications'
    ));
    beersCard.append(h('p', { class: 'card-description' },
      isEs
        ? 'Publicados por la Sociedad Americana de Geriatría (AGS), los Criterios de Beers identifican medicamentos con riesgos desproporcionados de sedación, delirio, caídas, deterioro cognitivo y depresión respiratoria en personas de 65 años o más.'
        : 'Published by the American Geriatrics Society (AGS), the Beers Criteria® identify medications whose risks of sedation, delirium, falls, cognitive impairment, and respiratory depression outweigh benefits in adults aged 65 and older.'
    ));

    BEERS_CRITERIA_INTERACTIONS.forEach((b) => {
      const bSec = h('div', { class: `beers-detail-section severity-${b.severity}` });
      bSec.append(h('h4', {}, isEs ? b.title.es : b.title.en));
      bSec.append(h('span', { class: 'legal-citation' }, b.authority));

      bSec.append(h('p', {},
        h('strong', {}, isEs ? 'Mecanismo Farmacológico: ' : 'Pharmacological Mechanism: '),
        isEs ? b.mechanism.es : b.mechanism.en
      ));

      bSec.append(h('p', {},
        h('strong', {}, isEs ? 'Riesgo Geriátrico Específico: ' : 'Specific Geriatric Risk: '),
        isEs ? b.geriatricRisk.es : b.geriatricRisk.en
      ));

      bSec.append(h('p', { class: 'clinical-action-text' },
        h('strong', {}, isEs ? 'Manejo Clínico Recomendado: ' : 'Recommended Clinical Action: '),
        isEs ? b.clinicalAction.es : b.clinicalAction.en
      ));

      beersCard.append(bSec);
    });

    tabPanel.append(beersCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: Geriatric Pharmacokinetics & Physiology
  // --------------------------------------------------------------------------
  else if (currentTab === 'pharmacokinetics') {
    const pkCard = h('div', { class: 'card pk-card' });
    pkCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Cambios Fisiológicos y Farmacocinéticos en el Adulto Mayor' : 'Geriatric Physiological & Pharmacokinetic Alterations'
    ));

    const pkGrid = h('div', { class: 'pk-grid' });

    const principles = [
      {
        title: isEs ? 'Disminución del Aclaramiento Renal' : 'Declining Renal Clearance (eGFR)',
        text: isEs ? GERIATRIC_PHARMACOKINETIC_RULES.renalClearance.es : GERIATRIC_PHARMACOKINETIC_RULES.renalClearance.en,
      },
      {
        title: isEs ? 'Metabolismo Hepático y Flujo Sanguíneo' : 'Reduced Hepatic First-Pass Metabolism',
        text: isEs ? GERIATRIC_PHARMACOKINETIC_RULES.hepaticMetabolism.es : GERIATRIC_PHARMACOKINETIC_RULES.hepaticMetabolism.en,
      },
      {
        title: isEs ? 'Cambios en la Composición Corporal' : 'Altered Body Composition & Drug Distribution',
        text: isEs ? GERIATRIC_PHARMACOKINETIC_RULES.bodyComposition.es : GERIATRIC_PHARMACOKINETIC_RULES.bodyComposition.en,
      },
      {
        title: isEs ? 'Ventajas Farmacológicas de la Buprenorfina' : 'Pharmacological Advantages of Buprenorphine',
        text: isEs ? GERIATRIC_PHARMACOKINETIC_RULES.buprenorphineAdvantage.es : GERIATRIC_PHARMACOKINETIC_RULES.buprenorphineAdvantage.en,
      },
    ];

    principles.forEach((pr) => {
      const prCard = h('div', { class: 'pk-item-card' });
      prCard.append(h('h4', {}, pr.title));
      prCard.append(h('p', {}, pr.text));
      pkGrid.append(prCard);
    });

    pkCard.append(pkGrid);
    tabPanel.append(pkCard);
  }

  root.append(tabPanel);

  const gabapentinoidRenalNotice = h('div', { class: 'card banner-tip mt-3', role: 'note' },
    h('p', null,
      h('strong', null, isEs ? '¿Adulto mayor en tratamiento con Gabapentina o Pregabalina? ' : 'Older adult taking Gabapentin or Pregabalin (Lyrica)? '),
      h('span', null, isEs
        ? 'El declive renal fisiológico causa acumulación masiva y neurotoxicidad (mioclonías, ataxia, caídas). '
        : 'Physiological age-related decline in CrCl causes massive drug accumulation, ataxia, and falls. '),
      h('a', { href: '#/gabapentinoid-care' }, isEs
        ? 'Abrir Calculadora de Ajuste Renal CrCl y Desescalada Hiperbólica →'
        : 'Open Cockcroft-Gault CrCl Renal Dosing & Hyperbolic Deprescribing Calculator →')
    )
  );
  root.append(gabapentinoidRenalNotice);

  const geriatricCareNotice = h('div', { class: 'card banner-tip mt-3', role: 'note' },
    h('p', null,
      h('strong', null, isEs ? '¿Polifarmacia, Criterios Beers, Carga Anticolinérgica (ACB) o Prevención de Caídas? ' : 'Polypharmacy, Beers Criteria, Anticholinergic Burden (ACB) or Fall Prevention? '),
      h('span', null, isEs
        ? 'Criterios AGS Beers 2023 sobre sedantes y opioides, calculadora de puntaje ACB, farmacocinética del TUDO, prevención de caídas STEADI, OIC severo y apoyo al cuidador: '
        : 'AGS Beers Criteria 2023 sedative/opioid warnings, ACB score calculator, geriatric MOUD pharmacokinetics, STEADI fall prevention, severe OIC, and caregiver-supported dosing: '),
      h('a', { href: '#/geriatric-care' }, isEs
        ? 'Abrir Navegador de Medicina de Adicciones en Geriatría y Criterios Beers →'
        : 'Open Geriatric Addiction Medicine, Beers Criteria & Fall Navigator →')
    )
  );
  root.append(geriatricCareNotice);

  // Crisis line footer
  const hotlineBar = h('div', { class: 'emergency-hotline-bar' },
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Línea de Ayuda SAMHSA:' : 'SAMHSA National Helpline:'),
      h('span', {}, ' '),
      tel('800-662-4357', null, { class: 'hotline-link' })
    ),
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Línea de Crisis 988:' : '988 Suicide & Crisis Lifeline:'),
      h('span', {}, ' '),
      tel('988', null, { class: 'hotline-link' })
    )
  );
  root.append(hotlineBar);

  syncTablists(root);
  if (container) container.append(root);
  wireTablistKeyboard(container ?? root);
  return root;
}
