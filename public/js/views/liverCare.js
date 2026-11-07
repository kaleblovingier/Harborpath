// public/js/views/liverCare.js
// HarborPath - Hepatic Health, Cirrhosis, Acetaminophen Toxicity & MOUD Liver Safety Navigator
// Clinical Consensus: American Association for the Study of Liver Diseases (AASLD) Practice Guidelines,
// American College of Medical Toxicology (ACMT) & FDA Acetaminophen Overdose & Rumack-Matthew Nomogram Consensus,
// American Society of Addiction Medicine (ASAM) MOUD Pharmacokinetics in Hepatic Impairment,
// King's College Criteria for Acute Liver Failure Liver Transplantation.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: MOUD PHARMACOKINETICS IN LIVER IMPAIRMENT
// ============================================================================

export const HEPATIC_MOUD_PROFILES = Object.freeze({
  buprenorphine: Object.freeze({
    id: 'buprenorphine_liver',
    nameEn: 'Buprenorphine & Buprenorphine/Naloxone (Suboxone vs. Subutex)',
    nameEs: 'Buprenorfina y Buprenorfina/Naloxona (Suboxone vs. Subutex)',
    pharmacokineticsEn: 'Buprenorphine undergoes extensive hepatic CYP3A4 metabolism and glucuronidation (UGT1A1/1A3). In mild to moderate hepatic impairment (Child-Pugh A & B), no dosage adjustment is typically required, and buprenorphine remains safe and life-saving. In severe hepatic impairment (Child-Pugh Class C), clearance of buprenorphine decreases moderately (~35%), but clearance of naloxone decreases by over 14-fold due to loss of first-pass hepatic metabolism. Consequently, sublingual naloxone can reach active systemic levels in Child-Pugh C patients and precipitate acute withdrawal or opioid blockade.',
    pharmacokineticsEs: 'La buprenorfina sufre extenso metabolismo hepático por CYP3A4 y glucuronidación. En insuficiencia leve-moderada (Child-Pugh A y B) no requiere ajuste. En insuficiencia grave (Child-Pugh C), el aclaramiento de naloxona cae más de 14 veces por pérdida del primer paso hepático, pudiendo absorberse sistémicamente y provocar abstinencia precipitada.',
    clinicalDirectivesEn: 'In Child-Pugh Class C, use buprenorphine mono-product (Subutex) rather than the combination product with naloxone. Monitor closely with lower initial dosing. Buprenorphine should NOT be withheld from individuals with liver disease because uncontrolled opioid use carries a much higher risk of sepsis, overdose, and death.',
    clinicalDirectivesEs: 'En Child-Pugh C, se recomienda usar buprenorfina sola (Subutex) en vez de la combinación con naloxona. No suspenda la buprenorfina por enfermedad hepática; el riesgo de sobredosis en la calle es muy superior.',
  }),

  methadone: Object.freeze({
    id: 'methadone_liver',
    nameEn: 'Methadone Hepatic Metabolism & Cirrhotic Bioaccumulation',
    nameEs: 'Metabolismo Hepático de Metadona y Bioacumulación en Cirrosis',
    pharmacokineticsEn: 'Methadone is highly protein-bound (85%–90% to alpha-1-acid glycoprotein and albumin) and extensively metabolized by hepatic CYP3A4, CYP2B6, and CYP2C19. In decompensated cirrhosis (Child-Pugh B and C), impaired protein synthesis increases the free (unbound) pharmacologically active fraction of methadone, while impaired clearance significantly prolongs the elimination half-life beyond its standard 24–36 hours.',
    pharmacokineticsEs: 'La metadona se une fuertemente a proteínas plasmáticas (85-90%) y se metaboliza en el hígado. En cirrosis descompensada, la menor síntesis de albúmina aumenta la fracción libre activa de metadona y se prolonga notablemente su vida media de eliminación.',
    clinicalDirectivesEn: 'Cirrhotic patients face a high risk of drug accumulation, delayed severe respiratory depression, and QTc interval prolongation (torsades de pointes). Start with lower doses, titrate slowly with longer intervals between increases, and perform regular serial 12-lead ECG monitoring. Avoid sudden increases.',
    clinicalDirectivesEs: 'Existe alto riesgo de acumulación, sedación tardía y prolongación del intervalo QTc. Inicie con dosis bajas, incremente con intervalos más largos y realice electrocardiogramas seriados de control.',
  }),
});

// ============================================================================
// ACUTE ACETAMINOPHEN (APAP) TOXICITY & RUMACK-MATTHEW NOMOGRAM
// ============================================================================

export const APAP_TOXICITY_STANDARDS = Object.freeze({
  mechanismEn: 'Acetaminophen (paracetamol / APAP) is normally eliminated via glucuronidation (~50%) and sulfation (~30%). A small fraction (~5%–10%) is metabolized by hepatic CYP2E1 into the highly reactive, electrophilic, hepatotoxic metabolite N-acetyl-p-benzoquinone imine (NAPQI). Glutathione binds and detoxifies NAPQI into non-toxic mercapturic acid. In acute overdose (> 150 mg/kg or > 7.5–10 g in adults) or chronic toxicity in malnutrition/alcoholism (> 4 g/day), glutathione stores are depleted below 30% of normal, allowing free NAPQI to covalently bind to hepatocyte mitochondrial proteins, causing massive centrilobular (Zone 3) hepatic necrosis and acute liver failure.',
  mechanismEs: 'El paracetamol (APAP) se elimina normalmente por glucuronidación y sulfatación. Un 5-10% es metabolizado por CYP2E1 en el tóxico reactivo NAPQI. El glutatión neutraliza el NAPQI. En sobredosis (> 150 mg/kg o > 7.5-10 g) o en alcoholismo crónico (> 4 g/día), el glutatión se agota (< 30%), y el NAPQI libre destruye las mitocondrias causando necrosis hepática centrolobulillar masiva (Zona 3).',

  nomogramLine4HourUgmL: 150, // Rumack-Matthew treatment line at 4 hours
  nomogramLine12HourUgmL: 37.5, // Treatment line at 12 hours (half-life slope = 4 hours)

  nacProtocolIvEn: 'IV N-Acetylcysteine (Acetadote 21-Hour 3-Bag Infusion Protocol): 1) Loading dose: 150 mg/kg in 200 mL D5W over 60 minutes; 2) Second bag: 50 mg/kg in 500 mL D5W over 4 hours; 3) Third bag: 100 mg/kg in 1000 mL D5W over 16 hours. (If anaphylactoid rash/flushing occurs, pause infusion, give IV diphenhydramine, and restart at slower rate; do not abandon therapy). Continue infusion beyond 21 hours if ALT remains elevated or APAP is still detectable.',
  nacProtocolIvEs: 'Protocolo IV de N-Acetilcisteína (NAC en 3 bolsas / 21 horas): 1) Dosis de carga: 150 mg/kg en 200 mL SG 5% en 60 min; 2) Segunda infusión: 50 mg/kg en 500 mL SG 5% en 4 horas; 3) Tercera infusión: 100 mg/kg en 1000 mL SG 5% en 16 horas. Si hay reacción anafilactoide leve, pausar, dar antihistamínico y reanudar más lento. Continuar si las transaminasas siguen altas.',

  kingsCollegeCriteriaEn: 'King’s College Hospital Criteria for Emergency Liver Transplantation in APAP-Induced Acute Liver Failure: 1) Arterial pH < 7.30 after fluid resuscitation (regardless of grade of encephalopathy), OR 2) All three of the following concurrent criteria: a) Prothrombin Time > 100 seconds (INR > 6.5); b) Serum Creatinine > 3.4 mg/dL (> 300 umol/L); c) Grade III or IV Hepatic Encephalopathy. Mortality exceeds 80–90% without emergency liver transplant if criteria are met.',
  kingsCollegeCriteriaEs: 'Criterios de King’s College para Trasplante Hepático Urgente por toxicidad de Paracetamol: 1) pH arterial < 7.30 tras reanimación con líquidos (independiente del grado de encefalopatía), O BIEN 2) Cumplir los tres siguientes a la vez: a) INR > 6.5 (tiempo de protrombina > 100 s); b) Creatinina sérica > 3.4 mg/dL (> 300 umol/L); c) Encefalopatía hepática Grado III o IV. La mortalidad supera el 85% sin trasplante inmediato.',
});

// ============================================================================
// CIRRHOSIS & HEPATIC DECOMPENSATION STAGING (CHILD-PUGH & MELD)
// ============================================================================

export const CIRRHOSIS_STAGING_TIERS = Object.freeze([
  {
    tierId: 'child_pugh_a',
    titleEn: 'Child-Pugh Class A: Well-Compensated Cirrhosis (Score 5–6)',
    titleEs: 'Child-Pugh Clase A: Cirrosis Bien Compensada (Puntuación 5–6)',
    severity: 'mild_caution',
    prognosisEn: '1-year survival: 100%; 2-year survival: 85%. Good operative tolerance.',
    prognosisEs: 'Supervivencia a 1 año: 100%; a 2 años: 85%. Buena tolerancia a intervenciones.',
    clinicalHandlingEn: 'Standard MOUD dosing. Continue routine hepatology follow-up, biannual liver ultrasound for hepatocellular carcinoma (HCC) screening, and lab monitoring (CMP, INR).',
    clinicalHandlingEs: 'Dosis estándar de MOUD. Ecografía hepática semestral para cribado de hepatocarcinoma y controles analíticos rutinarios.',
  },
  {
    tierId: 'child_pugh_b',
    titleEn: 'Child-Pugh Class B: Significant Functional Compromise (Score 7–9)',
    titleEs: 'Child-Pugh Clase B: Compromiso Funcional Significativo (Puntuación 7–9)',
    severity: 'moderate_warning',
    prognosisEn: '1-year survival: 80%; 2-year survival: 60%. Moderate surgical risk.',
    prognosisEs: 'Supervivencia a 1 año: 80%; a 2 años: 60%. Riesgo quirúrgico moderado.',
    clinicalHandlingEn: 'Reduce sedative and opioid dosages by 25%–50%. Monitor for early hepatic encephalopathy and ascites. Avoid all NSAIDs (triggers hepatorenal syndrome and variceal bleeding).',
    clinicalHandlingEs: 'Reducir sedantes y opioides entre un 25% y 50%. Vigilar ascitis y encefalopatía. Evitar totalmente los AINEs (riesgo de síndrome hepatorrenal y sangrado de varices).',
  },
  {
    tierId: 'child_pugh_c',
    titleEn: 'Child-Pugh Class C: Decompensated End-Stage Cirrhosis (Score 10–15)',
    titleEs: 'Child-Pugh Clase C: Cirrosis Descompensada Terminal (Puntuación 10–15)',
    severity: 'critical_emergency',
    prognosisEn: '1-year survival: 45%; 2-year survival: 35%. Severe surgical mortality.',
    prognosisEs: 'Supervivencia a 1 año: 45%; a 2 años: 35%. Elevadísima mortalidad quirúrgica.',
    clinicalHandlingEn: 'High-risk medical emergency. Switch from Suboxone to Subutex (buprenorphine mono) to prevent naloxone absorption. Strict avoidance of sedatives, benzodiazepines, and hepatically-cleared hypnotics. Refer for liver transplant evaluation.',
    clinicalHandlingEs: 'Emergencia de alto riesgo. Cambiar Suboxone por Subutex (sin naloxona) para evitar absorción sistémica de naloxona. Evitar benzodiacepinas. Derivar para trasplante.',
  },
]);

// ============================================================================
// CLINICAL DIFFERENTIALS: LIVER CRISES IN SUBSTANCE USE
// ============================================================================

export const HEPATIC_CLINICAL_DIFFERENTIALS = Object.freeze({
  acuteApapOverdose: Object.freeze({
    id: 'apap_overdose',
    titleEn: 'Acute Acetaminophen Toxicity & Hepatocellular Necrosis',
    titleEs: 'Toxicidad Aguda por Paracetamol y Necrosis Hepatocelular',
    severity: 'emergency_911',
    hallmarksEn: 'Ingestion of > 150 mg/kg or single acute dose > 7.5–10 g (or > 4 g in chronic alcohol/cirrhosis). Early phase (0–24h) is deceptively asymptomatic or mild nausea. Phase 2 (24–72h) shows marked RUQ pain, skyrocketing AST/ALT (often > 3,000–10,000 IU/L), and rising bilirubin/INR. Phase 3 (72–96h) brings fulminant hepatic failure, jaundice, coagulopathy, encephalopathy, and renal failure.',
    hallmarksEs: 'Ingesta > 150 mg/kg o dosis aguda > 7.5-10 g (o > 4 g en bebedores crónicos). Fase inicial (0-24h) engañosamente asintomática con náuseas leves. Fase 2 (24-72h) con dolor en hipocondrio derecho y transaminasas disparadas (> 3000-10000 UI/L). Fase 3 (72-96h) con fallo hepático fulminante, ictericia y coma.',
    actionEn: 'EMERGENCY ROOM TRANSPORT: Stat 4-hour serum APAP level, AST/ALT, INR, creatinine, and arterial blood gas. If ingestion occurred < 4 hours ago, give oral activated charcoal (1 g/kg). Administer IV N-Acetylcysteine (NAC) immediately if APAP level is above Rumack-Matthew nomogram line or if time of ingestion is unknown with elevated transaminases.',
    actionEs: 'TRASLADO URGENTE A URGENCIAS: Medir nivel de paracetamol a las 4 horas, transaminasas, INR y gasometría. Carbón activado si han pasado < 4 horas. Administrar N-Acetilcisteína (NAC) IV de inmediato si el nivel supera la línea del nomograma o si la hora es incierta.',
  }),

  hepaticEncephalopathy: Object.freeze({
    id: 'hepatic_encephalopathy',
    titleEn: 'Hepatic Encephalopathy & Asterixis ("Liver Flap")',
    titleEs: 'Encefalopatía Hepática y Asterixis («Flapping» o Temblor Hepático)',
    severity: 'emergency_hospital',
    hallmarksEn: 'Neuropsychiatric abnormalities caused by portosystemic shunting and hyperammonemia crossing the blood-brain barrier. Symptoms range from mild inversion of sleep-wake cycle and personality changes (Grade 1), lethargy and asterixis (Grade 2), somnolence and marked confusion (Grade 3), to deep hepatic coma (Grade 4). Precipitated by GI bleeding, constipation, infection/SIRS, electrolyte derangements, or sedative medications.',
    hallmarksEs: 'Alteración neuropsiquiátrica por amonio que cruza la barrera hematoencefálica. Va desde inversión del ritmo de sueño (Grado 1), letargo y asterixis/temblor (Grado 2), confusión marcada (Grado 3), hasta coma profundo (Grado 4). Desencadenada por estreñimiento, sangrado, infecciones o sedantes.',
    actionEn: 'EMERGENCY MEDICAL EVALUATION: Assess for asterixis (bilateral jerky tremor when arms are outstretched and wrists dorsiflexed). Administer lactulose (20–30 g PO/NG TID) titrated to achieve 2–3 soft bowel movements per day to purge colonic ammonia. Add Rifaximin 550 mg PO BID. Identify and treat triggers (spontaneous bacterial peritonitis, occult GI bleed, infection). Avoid sedatives.',
    actionEs: 'EVALUACIÓN MÉDICA URGENTE: Comprobar asterixis (temblor en aleteo al extender brazos y flexionar muñecas). Dar lactulosa (20-30 g 3 veces al día) para conseguir 2-3 deposiciones blandas diarias. Añadir rifaximina 550 mg cada 12h. Tratar desencadenantes (infección, sangrado) y evitar sedantes.',
  }),

  varicealBleeding: Object.freeze({
    id: 'variceal_bleeding',
    titleEn: 'Esophageal Variceal Hemorrhage & Portal Hypertension',
    titleEs: 'Hemorragia por Varices Esofágicas e Hipertensión Portal',
    severity: 'emergency_911',
    hallmarksEn: 'Sudden, massive upper gastrointestinal bleeding due to rupture of dilated submucosal esophageal/gastric veins from severe portal venous hypertension. Hallmarks include painless vomiting of bright red blood (hematemesis), "coffee-ground" emesis, dark tarry stools (melena), orthostatic hypotension, tachycardia, and sudden hypovolemic shock.',
    hallmarksEs: 'Hemorragia digestiva alta masiva e indolora por rotura de varices submucosas dilatadas debido a hipertensión portal. Se manifiesta como vómitos de sangre roja brillante (hematemesis), heces negras alquitranadas (melena) y choque hipovolémico rápido.',
    actionEn: 'CALL 911 IMMEDIATELY (CODE RED EMERGENCY): Large-bore IV access (two 16-gauge or 18-gauge lines), crystalloid resuscitation, restrictive transfusion targeting hemoglobin 7–8 g/dL. Emergency IV octreotide bolus (50 mcg IV then 50 mcg/hr infusion) to reduce portal venous pressure, IV ceftriaxone 1 g daily for SBP prophylaxis, and urgent emergent endoscopy for variceal ligation (banding).',
    actionEs: 'LLAME AL 911 DE INMEDIATO: Dos vías venosas gruesas, transfusión restrictiva (objetivo hemoglobina 7-8 g/dL), infusión de octreótido IV para bajar la presión portal, ceftriaxona profiláctica y endoscopia urgente para ligadura de varices con bandas.',
  }),

  hcvDirectActingAntivirals: Object.freeze({
    id: 'hcv_cure_standards',
    titleEn: 'Hepatitis C (HCV) Direct-Acting Antiviral (DAA) Harm Reduction Standards',
    titleEs: 'Estándares de Tratamiento con Antivirales de Acción Directa (AAD) para VHC',
    severity: 'standard_care',
    hallmarksEn: 'Chronic Hepatitis C infection leads to progressive fibrosis, cirrhosis, and hepatocellular carcinoma. Modern pan-genotypic Direct-Acting Antivirals (e.g., glecaprevir/pibrentasvir 8 weeks or sofosbuvir/velpatasvir 12 weeks) provide > 95%–98% cure rates with once-daily oral pills and minimal side effects.',
    hallmarksEs: 'La hepatitis C crónica causa cirrosis y cáncer de hígado. Los antivirales de acción directa actuales (glecaprevir/pibrentasvir 8 semanas o sofosbuvir/velpatasvir 12 semanas) curan más del 95-98% de los casos con pastillas orales diarias y mínimos efectos secundarios.',
    actionEn: 'AASLD/IDSA UNIVERSAL DIRECTIVE: Active substance use or alcohol use is NOT a valid contraindication to HCV treatment. PWUD achieve identical cure rates to non-users. Immediate referral for HCV RNA viral load testing and pan-genotypic DAA therapy. Provide reinfection prevention education, sterile syringe access, and harm reduction support.',
    actionEs: 'DIRECTIVA UNIVERSAL AASLD/IDSA: El consumo activo de drogas o alcohol NUNCA es contraindicación para curar el VHC. Las personas usuarias consiguen la misma tasa de curación (> 95%). Solicitar carga viral de ARN de VHC y pautar tratamiento antiviral.',
  }),
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & HEPATIC SURVIVAL RULES
// ============================================================================

export const HEPATIC_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Acetaminophen (Tylenol/APAP) Daily Limits: 2 g vs 4 g Ceiling',
    titleEs: 'Límites Diarios de Paracetamol (APAP): Techo de 2 g vs 4 g',
    detailEn: 'For healthy adults, the absolute maximum daily dose of acetaminophen from all sources is 4,000 mg (4 g/day). For individuals with chronic alcohol use, malnutrition, cirrhosis, or chronic hepatitis, the maximum daily limit is strictly 2,000 mg (2 g/day). Always read combination cold medicine, pain pills (Percocet contains 325 mg APAP), and PM sedatives to avoid accidental toxicity.',
    detailEs: 'Para adultos sanos, el límite máximo diario de paracetamol de todas las fuentes es 4,000 mg (4 g/día). Para bebedores crónicos, desnutrición o cirrosis, el límite estricto es de 2,000 mg (2 g/día). Revise medicamentos compuestos para el dolor o resfriado.',
  },
  {
    ruleNum: 2,
    titleEn: 'Strict Prohibition on NSAIDs in Cirrhosis & Portal Hypertension',
    titleEs: 'Prohibición Estricta de AINEs en Cirrosis e Hipertensión Portal',
    detailEn: 'Never take NSAIDs (ibuprofen, Motrin, Advil, naproxen, Aleve) if you have cirrhosis, ascites, or portal hypertension. Cirrhotic kidneys depend critically on prostaglandins to maintain renal perfusion. NSAIDs block prostaglandin synthesis, triggering acute Hepatorenal Syndrome (fatal renal shutdown) and massive gastrointestinal bleeding.',
    detailEs: 'Nunca tome AINEs (ibuprofeno, naproxeno) si tiene cirrosis o ascitis. El riñón cirrótico depende de las prostaglandinas para no colapsar. Los AINEs desencadenan el temido Síndrome Hepatorrenal (fallo renal mortal) y hemorragia digestiva.',
  },
  {
    ruleNum: 3,
    titleEn: 'Buprenorphine is Safe in Liver Disease: Suboxone vs. Subutex in Child-Pugh C',
    titleEs: 'La Buprenorfina es Segura en Daño Hepático: Suboxone vs. Subutex en Clase C',
    detailEn: 'Never withhold life-saving MOUD from patients with liver disease. In Child-Pugh Class A and B, Suboxone (buprenorphine/naloxone) is safe. In decompensated Child-Pugh Class C, switch to Subutex (buprenorphine mono) because hepatic naloxone clearance drops 14-fold, which can allow naloxone absorption into the bloodstream and trigger precipitated withdrawal.',
    detailEs: 'Nunca deniegue la buprenorfina por enfermedad hepática. En Child-Pugh A y B, Suboxone es seguro. En cirrosis descompensada (Clase C), use Subutex (sin naloxona) para evitar que la naloxona no filtrada por el hígado pase a la sangre y cause abstinencia.',
  },
  {
    ruleNum: 4,
    titleEn: 'Lactulose Titration for Hepatic Encephalopathy: Target 2–3 Soft Stools',
    titleEs: 'Titulación de Lactulosa para Encefalopatía: Objetivo 2–3 Deposiciones Blandas',
    detailEn: 'Lactulose acidifies colonic contents, converting absorbable ammonia (NH3) into non-absorbable ammonium (NH4+) that is excreted in feces. Titrate lactulose dosage (usually 15–30 mL PO 2–4 times daily) to produce exactly 2 to 3 soft bowel movements per day. Severe diarrhea causes dangerous dehydration and electrolyte collapse; constipation precipitates coma.',
    detailEs: 'La lactulosa acidifica el colon transformando el amoniaco en amonio no absorbible que se expulsa en las heces. Gradúe la dosis para lograr exactamente 2 a 3 deposiciones blandas al día. No provoque diarrea líquida ni permita el estreñimiento.',
  },
  {
    ruleNum: 5,
    titleEn: 'Active Substance Use is NOT a Contraindication to Hepatitis C Cure',
    titleEs: 'El Consumo Activo de Sustancias NO es Motivo para Negar la Cura del VHC',
    detailEn: 'National AASLD/IDSA guidelines mandate that current drug or alcohol use should NEVER exclude a person from receiving curative Direct-Acting Antiviral (DAA) therapy. Treatment is an 8–12 week once-daily oral regimen with > 95% cure rates. Treating PWUD is critical treatment-as-prevention to halt viral transmission in the community.',
    detailEs: 'Las guías oficiales de la AASLD/IDSA establecen que el consumo de drogas o alcohol NUNCA debe ser motivo para denegar los antivirales de acción directa. El tratamiento dura solo 8-12 semanas y cura al 95% de los pacientes, evitando además nuevos contagios.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialLiverState = () => ({
  activeTab: 'triage', // 'triage' | 'apap' | 'cirrhosis' | 'moud' | 'harmReduction'
  viewMode: 'community', // 'community' | 'clinical'
  hasIngestedToxicApapDose: false,
  hasApapAboveRumackNomogram: false,
  hasAsterixisOrSevereConfusion: false,
  hasHematemesisOrMelena: false,
  hasAscitesOrAbdominalDistension: false,
  hasJaundiceOrDarkBileUrine: false,
  hasChildPughCDecompensatedCirrhosis: false,
  isTakingMethadoneWithCirrhosis: false,
});

let liverState = initialLiverState();
const listeners = new Set();

export function getLiverState() {
  return { ...liverState };
}

export function setLiverState(patch) {
  liverState = { ...liverState, ...patch };
  listeners.forEach((l) => l(liverState));
}

export function resetLiverState() {
  liverState = initialLiverState();
  listeners.forEach((l) => l(liverState));
}

export function subscribeLiverState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// CLINICAL RISK EVALUATOR (EVALUATELIVERRISK)
// ============================================================================

export function evaluateLiverRisk(state) {
  const {
    hasIngestedToxicApapDose,
    hasApapAboveRumackNomogram,
    hasAsterixisOrSevereConfusion,
    hasHematemesisOrMelena,
    hasAscitesOrAbdominalDistension,
    hasJaundiceOrDarkBileUrine,
    hasChildPughCDecompensatedCirrhosis,
    isTakingMethadoneWithCirrhosis,
  } = state;

  // 1. Acute Variceal Bleeding (Immediate 911 Shock Hazard)
  if (hasHematemesisOrMelena) {
    return {
      tier: 'emergency_variceal_bleeding',
      titleEn: 'CODE RED EMERGENCY: Suspected Acute Esophageal Variceal Hemorrhage',
      titleEs: 'EMERGENCIA CÓDIGO ROJO: Sospecha de Hemorragia por Varices Esofágicas',
      isEmergency: true,
      actionEn: 'CALL 911 IMMEDIATELY. Vomiting blood (hematemesis) or passing black tarry stools (melena) indicates life-threatening rupture of portal hypertensive esophageal/gastric varices. Keep patient sitting upright or in lateral recovery position if obtunded to prevent aspiration. Two large-bore IVs, IV octreotide, restrictive transfusion (target Hb 7–8 g/dL), prophylactic ceftriaxone, and emergent endoscopic band ligation.',
      actionEs: 'LLAME AL 911 DE INMEDIATO. Vomitar sangre o heces alquitranadas indica rotura mortal de varices por hipertensión portal. Mantener incorporado o de lado para no aspirar sangre. Requiere octreótido IV, transfusión cautelosa y endoscopia urgente con bandas.',
      interventionEn: 'Emergent ICU admission, airway protection, IV octreotide infusion (50 mcg bolus + 50 mcg/hr), restrictive red cell transfusion, emergent gastroenterology endoscopy for band ligation.',
      interventionEs: 'Ingreso en UCI, vía aérea, octreótido IV continuo, transfusión cautelosa y endoscopia urgente para ligadura.',
    };
  }

  // 2. Acute Toxic APAP Overdose / Above Rumack Nomogram Line
  if (hasApapAboveRumackNomogram || hasIngestedToxicApapDose) {
    return {
      tier: 'emergency_apap_toxicity',
      titleEn: 'CRITICAL TOXICOLOGY EMERGENCY: Acute Acetaminophen Overdose & Hepatic Necrosis Threat',
      titleEs: 'EMERGENCIA TOXICOLÓGICA CRÍTICA: Sobredosis Aguda de Paracetamol y Riesgo de Necrosis',
      isEmergency: true,
      actionEn: 'EMERGENCY ROOM TRANSPORT REQUIRED. Acetaminophen (Tylenol/APAP) overdose causes fatal hepatic centrilobular necrosis from toxic NAPQI accumulation once glutathione stores deplete. PROTOCOL: 1) Stat serum APAP level plotted on Rumack-Matthew nomogram; 2) If ingestion < 4h, give activated charcoal 1 g/kg; 3) Start IV N-Acetylcysteine (NAC 21-hour 3-bag protocol) immediately; 4) Monitor AST/ALT, INR, and King’s College criteria for liver transplant.',
      actionEs: 'TRASLADO URGENTE A URGENCIAS. La sobredosis de paracetamol destruye el hígado por acumulación de NAPQI al agotarse el glutatión. Medir nivel de paracetamol en nomograma Rumack-Matthew, dar carbón activado si < 4h y administrar N-Acetilcisteína (NAC) IV de inmediato.',
      interventionEn: 'Immediate IV N-Acetylcysteine (NAC) infusion protocol, baseline liver function tests, coagulopathy monitoring, activated charcoal if within 4 hours of acute ingestion.',
      interventionEs: 'Infusión urgente de N-Acetilcisteína (NAC), pruebas de función hepática, INR y carbón activado si pasaron < 4 horas.',
    };
  }

  // 3. Hepatic Encephalopathy / Asterixis Flapping Tremor
  if (hasAsterixisOrSevereConfusion) {
    return {
      tier: 'urgent_hepatic_encephalopathy',
      titleEn: 'URGENT HEPATOLOGY ALERT: Hepatic Encephalopathy & Asterixis ("Liver Flap")',
      titleEs: 'ALERTA URGENTE DE HEPATOLOGÍA: Encefalopatía Hepática y Asterixis («Aleteo Hepático»)',
      isEmergency: true,
      actionEn: 'URGENT MEDICAL TRANSPORT REQUIRED. Flapping tremors of the hands (asterixis), lethargy, and profound confusion indicate that toxic blood ammonia is crossing the blood-brain barrier due to failing liver filtration. Protocol: 1) Initiate lactulose (20–30 g PO/NG TID) targeting 2–3 soft bowel movements daily; 2) Add Rifaximin 550 mg BID; 3) Search for underlying triggers (occult GI bleed, constipation, infection, SBP); 4) Avoid sedatives.',
      actionEs: 'TRASLADO MÉDICO URGENTE. El temblor en aleteo (asterixis) y la confusión indican que el amonio está intoxicando el cerebro. Pautar lactulosa (20-30 g 3 veces al día) para forzar 2-3 deposiciones blandas, añadir rifaximina 550 mg cada 12h y buscar infecciones o sangrado oculto.',
      interventionEn: 'Oral or NG lactulose titration, oral rifaximin, blood ammonia monitoring, diagnostic paracentesis if ascites present to rule out spontaneous bacterial peritonitis (SBP).',
      interventionEs: 'Lactulosa oral o por sonda, rifaximina, control de amonio y paracentesis diagnóstica para descartar peritonitis bacteriana espontánea.',
    };
  }

  // 4. Decompensated Child-Pugh C Cirrhosis & Suboxone Naloxone Warning
  if (hasChildPughCDecompensatedCirrhosis) {
    return {
      tier: 'severe_decompensated_cirrhosis',
      titleEn: 'HIGH CLINICAL RISK: Decompensated Cirrhosis (Child-Pugh Class C) & MOUD Safeguards',
      titleEs: 'ALTO RIESGO CLÍNICO: Cirrosis Descompensada (Child-Pugh Clase C) y Ajustes de MOUD',
      isEmergency: false,
      actionEn: 'SPECIALIZED HEPATOLOGY / ADDICTION CONSULT REQUIRED. In Child-Pugh Class C, hepatic clearance of naloxone drops 14-fold due to loss of first-pass metabolism, allowing sublingual naloxone to reach active blood concentrations and cause precipitated withdrawal. DIRECTIVE: Switch patient from Suboxone (buprenorphine/naloxone) to Subutex (buprenorphine mono-product). Strictly avoid all NSAIDs. Refer for liver transplant evaluation.',
      actionEs: 'CONSULTA ESPECIALIZADA EN HEPATOLOGÍA Y ADICCIONES. En Child-Pugh C, el aclaramiento de naloxona cae 14 veces, pudiendo absorberse y provocar abstinencia precipitada. Cambie Suboxone por Subutex (buprenorfina sola). Prohíba los AINEs y valore trasplante.',
      interventionEn: 'Transition to buprenorphine mono-product (Subutex), strict NSAID avoidance, sodium-restricted diet (< 2 g/day), hepatology referral for transplant listing and variceal screening.',
      interventionEs: 'Paso a buprenorfina sola (Subutex), retirada total de AINEs, dieta baja en sal (< 2 g/día) y valoración de trasplante hepático.',
    };
  }

  // 5. Methadone Bioaccumulation Risk with Advanced Liver Disease
  if (isTakingMethadoneWithCirrhosis) {
    return {
      tier: 'warning_methadone_cirrhosis',
      titleEn: 'CLINICAL PHARMACOKINETIC WARNING: Methadone Bioaccumulation in Advanced Cirrhosis',
      titleEs: 'ADVERTENCIA FARMACOCINÉTICA: Bioacumulación de Metadona en Cirrosis Avanzada',
      isEmergency: false,
      actionEn: 'CLOSE CLINICAL MONITORING REQUIRED. Advanced liver disease impairs hepatic CYP3A4/2B6 clearance and lowers serum albumin, dramatically increasing the free active fraction of methadone and extending its half-life far past 36 hours. Accumulation can cause delayed severe respiratory depression and QTc prolongation. PROTOCOL: Lower starting doses, slower titration intervals (at least 7–10 days between dose changes), and serial 12-lead ECG monitoring.',
      actionEs: 'MONITORIZACIÓN ESTRECHA. La cirrosis avanzada reduce el aclaramiento de metadona y aumenta su fracción libre, prolongando su vida media y causando sedación tardía y arritmias por QTc largo. Inicie con dosis menores, espere 7-10 días entre ajustes y realice electrocardiogramas seriados.',
      interventionEn: 'Baseline and serial 12-lead ECG (monitoring QTc interval), conservative dose titration, split dosing consideration, close coordination between methadone OTP clinic and hepatologist.',
      interventionEs: 'Electrocardiogramas seriados (QTc), ajustes de dosis espaciados y coordinación entre la clínica de metadona y el hepatólogo.',
    };
  }

  // 6. Symptomatic Liver Disease (Jaundice or Ascites)
  if (hasAscitesOrAbdominalDistension || hasJaundiceOrDarkBileUrine) {
    return {
      tier: 'urgent_liver_symptomatic',
      titleEn: 'URGENT LIVER SYMPTOM ALERT: Jaundice, Dark Urine or Abdominal Ascites',
      titleEs: 'ALERTA DE SÍNTOMAS HEPÁTICOS: Ictericia, Orina Oscura o Ascitis Abdominal',
      isEmergency: false,
      actionEn: 'SCHEDULE COMPREHENSIVE HEPATIC EVALUATION. Yellowing of the eyes/skin (jaundice), dark tea-colored urine, or abdominal swelling (ascites) indicate decompensated liver function and portal hypertension. Protocol: 1) Comprehensive metabolic panel (total/direct bilirubin, albumin, AST/ALT, alkaline phosphatase) and INR; 2) Diagnostic abdominal ultrasound with Doppler; 3) Limit dietary sodium to < 2,000 mg/day; 4) Never take ibuprofen or naproxen.',
      actionEs: 'PROGRAME VALORACIÓN HEPÁTICA COMPLETA. Piel/ojos amarillos (ictericia), orina color té oscuro o hinchazón abdominal (ascitis) alertan de descompensación hepática. Analítica completa (bilirrubina, albúmina, transaminasas, INR), ecografía con Doppler, dieta baja en sal y evitar AINEs.',
      interventionEn: 'Diagnostic liver ultrasound with portal Doppler, liver function panel, coagulation profile, viral hepatitis panel, diagnostic paracentesis if new-onset ascites.',
      interventionEs: 'Ecografía con Doppler portal, perfil hepático y de coagulación, serologías de hepatitis y paracentesis diagnóstica si la ascitis es nueva.',
    };
  }

  // 7. Standard Hepatic Health & Harm Reduction Guidance
  return {
    tier: 'standard_hepatic_guidance',
    titleEn: 'Standard Hepatic Health, Liver Protection & Harm Reduction Guidance',
    titleEs: 'Pautas Estándar de Salud Hepática, Protección del Hígado y Reducción de Daños',
    isEmergency: false,
    actionEn: 'No acute hepatic red flags detected. Universal liver protection standards: 1) Keep acetaminophen (Tylenol/APAP) strictly under 2,000 mg/day if using alcohol or with known liver disease (4,000 mg/day in healthy adults); 2) Screen for Hepatitis C and access curative Direct-Acting Antiviral (DAA) therapy; 3) Vaccinate against Hepatitis A and B; 4) Buprenorphine is safe and recommended in mild-to-moderate liver disease.',
    actionEs: 'No se detectan alertas hepáticas agudas. Pautas generales de protección: límite de paracetamol de 2 g/día si hay consumo de alcohol o cirrosis (4 g/día en adultos sanos); cribado y cura del VHC con antivirales; vacunación de hepatitis A y B; y uso seguro de buprenorfina.',
    interventionEn: 'Harm reduction education, Hepatitis A and B vaccination, Hepatitis C antibody and RNA screening, routine liver chemistry surveillance.',
    interventionEs: 'Vacunación de hepatitis A y B, cribado de hepatitis C y controles analíticos rutinarios.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildLiverSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: EVALUACIÓN HEPÁTICA, TOXICOLOGÍA Y MOUD',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      'Evaluación clínica por patología hepática, sospecha de toxicidad por fármacos o ajuste de MOUD.',
      `Diagnóstico de riesgo evaluado: ${evaluation.titleEs}.`,
      `Urgencia médica: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA CRÍTICA / VITAL' : 'GESTIÓN CLÍNICA Y REDUCCIÓN DE DAÑOS'}.`,
      '',
      'B (ANTECEDENTES / FACTORES DE RIESGO HEPÁTICOS Y FARMACOLÓGICOS):',
      `- Hemorragia digestiva / hematemesis o melena (Sospecha varices): ${state.hasHematemesisOrMelena ? 'SÍ (EMERGENCIA CÓDIGO ROJO - SHOCK HIPOVOLÉMICO)' : 'No'}.`,
      `- Dosis tóxica de paracetamol / nomograma positivo (Riesgo necrosis): ${state.hasApapAboveRumackNomogram || state.hasIngestedToxicApapDose ? 'SÍ (ADMINISTRAR N-ACETILCISTEÍNA IV URGENTE)' : 'No'}.`,
      `- Asterixis / confusión severa (Encefalopatía hepática): ${state.hasAsterixisOrSevereConfusion ? 'SÍ (INICIAR LACTULOSA Y RIFAXIMINA)' : 'No'}.`,
      `- Cirrosis descompensada Child-Pugh Clase C: ${state.hasChildPughCDecompensatedCirrhosis ? 'SÍ (CAMBIAR SUBOXONE A SUBUTEX POR NALOXONA)' : 'No'}.`,
      `- Uso de metadona en paciente cirrótico: ${state.isTakingMethadoneWithCirrhosis ? 'SÍ (RIESGO DE BIOACUMULACIÓN Y PROLONGACIÓN QTC)' : 'No'}.`,
      `- Ascitis o distensión abdominal evidente: ${state.hasAscitesOrAbdominalDistension ? 'SÍ (DIETA HIPO SÓDICA Y PARACENTESIS)' : 'No'}.`,
      `- Ictericia cutánea/escleral u orina colúrica: ${state.hasJaundiceOrDarkBileUrine ? 'SÍ (EVALUAR DESCOMPENSACIÓN HEPATOBILIAR)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y GESTIÓN TERAPÉUTICA):',
      '1. En sobredosis de paracetamol: Administrar NAC IV en protocolo de 21 horas; valorar criterios de King’s College para trasplante.',
      '2. En encefalopatía hepática: Titular lactulosa para 2–3 deposiciones blandas al día; evitar sedantes y benzodiacepinas.',
      '3. En cirrosis Child-Pugh C: Emplear buprenorfina mono (Subutex) para evitar la absorción de naloxona sistémica.',
      '4. En hipertensión portal: Prohibición absoluta de AINEs (ibuprofeno/naproxeno) para evitar síndrome hepatorrenal.',
      '5. Cura del VHC: El consumo activo no contraindica el tratamiento con antivirales de acción directa (AAD).',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'HEPATIC HEALTH, APAP TOXICOLOGY & MOUD CLINICAL SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    'Clinical consultation for hepatic pathology, suspected drug hepatotoxicity, or MOUD dosing adjustment.',
    `Assessed Presentation: ${evaluation.titleEn}.`,
    `Safety Urgency: ${evaluation.isEmergency ? 'LIFE-THREATENING MEDICAL EMERGENCY' : 'CLINICAL MANAGEMENT & LIVER PRESERVATION'}.`,
    '',
    'B (BACKGROUND / HEPATIC & PHARMACOLOGIC RISK FACTORS):',
    `- Active upper GI bleeding / hematemesis or melena (Variceal rupture): ${state.hasHematemesisOrMelena ? 'YES (CODE RED EMERGENCY - HYPOVOLEMIC SHOCK)' : 'No'}.`,
    `- Toxic APAP ingestion / above Rumack Nomogram line: ${state.hasApapAboveRumackNomogram || state.hasIngestedToxicApapDose ? 'YES (INITIATE IV N-ACETYLCYSTEINE PROTOCOL)' : 'No'}.`,
    `- Asterixis ("liver flap") or profound confusion (Hepatic Encephalopathy): ${state.hasAsterixisOrSevereConfusion ? 'YES (TITRATE LACTULOSE & RIFAXIMIN)' : 'No'}.`,
    `- Decompensated cirrhosis Child-Pugh Class C: ${state.hasChildPughCDecompensatedCirrhosis ? 'YES (SWITCH SUBOXONE TO SUBUTEX TO PREVENT NALOXONE TOXICITY)' : 'No'}.`,
    `- Methadone therapy in cirrhotic liver disease: ${state.isTakingMethadoneWithCirrhosis ? 'YES (BIOACCUMULATION HAZARD & QTC MONITORING)' : 'No'}.`,
    `- Ascites or gross abdominal distension: ${state.hasAscitesOrAbdominalDistension ? 'YES (SODIUM RESTRICTION & DIAGNOSTIC PARACENTESIS)' : 'No'}.`,
    `- Jaundice or dark tea-colored bile urine: ${state.hasJaundiceOrDarkBileUrine ? 'YES (EVALUATE HEPATOBILIARY FUNCTION)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Clinical Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & THERAPEUTIC MANAGEMENT):',
    '1. In APAP toxicity: Administer IV NAC 21-hour infusion protocol; monitor King’s College criteria for liver transplant listing.',
    '2. In hepatic encephalopathy: Titrate lactulose to 2–3 soft bowel movements daily; strictly avoid sedatives and benzodiazepines.',
    '3. In Child-Pugh C cirrhosis: Use buprenorphine mono-product (Subutex) to prevent un-cleared naloxone entering systemic circulation.',
    '4. In portal hypertension/cirrhosis: Strict prohibition on NSAIDs (ibuprofen/naproxen) to prevent fatal Hepatorenal Syndrome.',
    '5. In Hepatitis C: Active substance use is NOT a contraindication to pan-genotypic Direct-Acting Antiviral (DAA) cure.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function liverCareView() {
  const container = h('div', { class: 'liver-care-view' });

  function render() {
    clear(container);
    const state = getLiverState();
    const evaluation = evaluateLiverRisk(state);

    // Header Banner
    const header = h('header', { class: 'lc-header' }, [
      h('div', { class: 'lc-header-badge' }, [
        icon('activity'),
        h('span', {}, t('lc.header.badge', 'Hepatic Health, APAP Toxicology & MOUD Safety')),
      ]),
      h('h1', { class: 'lc-header-title' }, t('lc.header.title', 'Liver Health, APAP Toxicity & Cirrhosis Safety Navigator')),
      h('p', { class: 'lc-header-desc' }, t('lc.header.desc', 'Evidence-based clinical decision support and harm reduction standards from the AASLD, ACMT, and ASAM: Rumack-Matthew APAP toxicity nomogram and NAC protocols, Child-Pugh cirrhosis staging, MOUD pharmacokinetics in liver failure, hepatic encephalopathy asterixis triage, and the strict NSAID prohibition.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'lc-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        class: `lc-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setLiverState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('lc.mode.community', 'Community & Patient Mode (Tylenol Limits, Jaundice & HCV Cure)')),
      ]),
      h('button', {
        class: `lc-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setLiverState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('lc.mode.clinical', 'Clinician & Toxicologist Mode (Nomogram, Child-Pugh C & SBAR)')),
      ]),
    ]);

    // Tabs Nav
    const tabsList = h('div', { class: 'lc-tabs-nav', role: 'tablist', 'aria-label': 'Liver Care Tabs' }, [
      h('button', {
        class: `lc-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setLiverState({ activeTab: 'triage' }),
      }, t('lc.tabs.triage', 'Liver Emergency Triage')),
      h('button', {
        class: `lc-tab-btn ${state.activeTab === 'apap' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'apap' ? 'true' : 'false',
        onclick: () => setLiverState({ activeTab: 'apap' }),
      }, t('lc.tabs.apap', 'APAP Toxicity & Rumack Nomogram')),
      h('button', {
        class: `lc-tab-btn ${state.activeTab === 'cirrhosis' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'cirrhosis' ? 'true' : 'false',
        onclick: () => setLiverState({ activeTab: 'cirrhosis' }),
      }, t('lc.tabs.cirrhosis', 'Cirrhosis Staging (Child-Pugh A–C)')),
      h('button', {
        class: `lc-tab-btn ${state.activeTab === 'moud' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'moud' ? 'true' : 'false',
        onclick: () => setLiverState({ activeTab: 'moud' }),
      }, t('lc.tabs.moud', 'MOUD Liver Pharmacokinetics')),
      h('button', {
        class: `lc-tab-btn ${state.activeTab === 'harmReduction' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'harmReduction' ? 'true' : 'false',
        onclick: () => setLiverState({ activeTab: 'harmReduction' }),
      }, t('lc.tabs.harmReduction', 'Hepatic Harm Reduction Rules')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'apap':
        tabContent = renderApapTab();
        break;
      case 'cirrhosis':
        tabContent = renderCirrhosisTab();
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
    const section = h('section', { class: 'lc-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'lc-inputs-grid' }, [
      // 1. Variceal Bleeding
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasHematemesisOrMelena,
            onchange: (e) => setLiverState({ hasHematemesisOrMelena: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('lc.check.bleedStrong', 'Vomiting Blood (Hematemesis) or Black Tarry Stools (Melena)? ')),
            t('lc.check.bleedDetail', '(Critical Code Red: Ruptured esophageal varices & hypovolemic shock)'),
          ]),
        ]),
      ]),

      // 2. APAP Overdose / Nomogram Line
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasApapAboveRumackNomogram || state.hasIngestedToxicApapDose,
            onchange: (e) => setLiverState({
              hasApapAboveRumackNomogram: e.target.checked,
              hasIngestedToxicApapDose: e.target.checked,
            }),
          }),
          h('span', {}, [
            h('strong', {}, t('lc.check.apapStrong', 'Acetaminophen (Tylenol/APAP) Ingestion > 7.5 g or Level Above Nomogram? ')),
            t('lc.check.apapDetail', '(Critical Emergency: Centrilobular necrosis & NAPQI accumulation - IV NAC protocol)'),
          ]),
        ]),
      ]),

      // 3. Hepatic Encephalopathy / Asterixis
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasAsterixisOrSevereConfusion,
            onchange: (e) => setLiverState({ hasAsterixisOrSevereConfusion: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('lc.check.heStrong', 'Flapping Hand Tremor (Asterixis), Lethargy or Profound Confusion? ')),
            t('lc.check.heDetail', '(Urgent Emergency: Hepatic Encephalopathy & ammonia neurotoxicity - Lactulose protocol)'),
          ]),
        ]),
      ]),

      // 4. Decompensated Child-Pugh C Cirrhosis
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasChildPughCDecompensatedCirrhosis,
            onchange: (e) => setLiverState({ hasChildPughCDecompensatedCirrhosis: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('lc.check.pughStrong', 'Known Decompensated Cirrhosis (Child-Pugh Class C, Score 10–15)? ')),
            t('lc.check.pughDetail', '(Specialized MOUD: Switch Suboxone to Subutex to prevent naloxone accumulation)'),
          ]),
        ]),
      ]),

      // 5. Methadone in Cirrhosis
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isTakingMethadoneWithCirrhosis,
            onchange: (e) => setLiverState({ isTakingMethadoneWithCirrhosis: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('lc.check.methadoneStrong', 'Taking Methadone with Moderate or Severe Cirrhosis? ')),
            t('lc.check.methadoneDetail', '(Pharmacokinetic Warning: Reduced clearance & prolonged half-life - Serial ECG/QTc)'),
          ]),
        ]),
      ]),

      // 6. Ascites / Abdominal Distension
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasAscitesOrAbdominalDistension,
            onchange: (e) => setLiverState({ hasAscitesOrAbdominalDistension: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('lc.check.ascitesStrong', 'Abdominal Fluid Swelling (Ascites) or Sudden Weight Gain? ')),
            t('lc.check.ascitesDetail', '(Portal hypertension warning - Rule out Spontaneous Bacterial Peritonitis)'),
          ]),
        ]),
      ]),

      // 7. Jaundice / Dark Bile Urine
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasJaundiceOrDarkBileUrine,
            onchange: (e) => setLiverState({ hasJaundiceOrDarkBileUrine: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('lc.check.jaundiceStrong', 'Yellow Skin/Eyes (Jaundice) or Dark Tea-Colored Urine? ')),
            t('lc.check.jaundiceDetail', '(Hyperbilirubinemia & hepatobiliary functional failure warning)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `lc-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'lc-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'lc-result-details' }, [
        h('div', { class: 'lc-rec-item' }, [
          h('strong', {}, t('lc.res.action', 'Clinical & Diagnostic Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'lc-rec-item' }, [
          h('strong', {}, t('lc.res.intervention', 'Recommended Medical Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // SBAR Export Card
    const sbarCard = h('div', { class: 'lc-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('lc.sbar.title', 'Zero-PII Hepatic Clinical SBAR Note Generator')),
        h('div', { class: 'sbar-actions' }, [
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildLiverSbarText(state, evaluation, 'en');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('lc.sbar.copyEn', 'Copy Clinical SBAR (English)'))]),
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildLiverSbarText(state, evaluation, 'es');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('lc.sbar.copyEs', 'Copiar SBAR (Español)'))]),
        ]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildLiverSbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderApapTab() {
    const section = h('section', { class: 'lc-apap-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'lc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('lc.apap.heading', 'Acetaminophen Toxicity, Rumack-Matthew Nomogram & NAC Protocol')),
      h('p', { class: 'tab-subtitle' }, t('lc.apap.subtitle', 'Mechanism of toxic NAPQI centrilobular necrosis, 4-hour serum nomogram line (150 ug/mL), and the 21-hour IV N-Acetylcysteine protocol.')),
    ]);

    const nomogramCard = h('div', { class: 'lc-card' }, [
      h('h3', {}, 'Rumack-Matthew Nomogram Clinical Reference Lines'),
      h('p', {}, 'Used for single acute ingestions of acetaminophen presenting between 4 and 24 hours post-ingestion. If serum APAP is on or above the line connecting 150 ug/mL at 4 hours to 37.5 ug/mL at 12 hours, hepatotoxicity risk is significant and IV N-Acetylcysteine (NAC) must be initiated immediately.'),
      h('ul', {}, [
        h('li', {}, '4-Hour Serum APAP Treatment Threshold: 150 ug/mL (990 umol/L)'),
        h('li', {}, '8-Hour Serum APAP Treatment Threshold: 75 ug/mL (495 umol/L)'),
        h('li', {}, '12-Hour Serum APAP Treatment Threshold: 37.5 ug/mL (248 umol/L)'),
        h('li', {}, '16-Hour Serum APAP Treatment Threshold: 18.8 ug/mL (124 umol/L)'),
      ]),
    ]);

    const nacCard = h('div', { class: 'lc-card' }, [
      h('h3', {}, 'N-Acetylcysteine (NAC) Therapy & King’s College Criteria'),
      h('p', {}, [h('strong', {}, 'IV NAC 21-Hour Protocol: '), APAP_TOXICITY_STANDARDS.nacProtocolIvEn]),
      h('p', {}, [h('strong', {}, 'King’s College Transplant Criteria: '), APAP_TOXICITY_STANDARDS.kingsCollegeCriteriaEn]),
    ]);

    section.appendChild(introCard);
    section.appendChild(nomogramCard);
    section.appendChild(nacCard);
    return section;
  }

  function renderCirrhosisTab() {
    const section = h('section', { class: 'lc-cirrhosis-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'lc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('lc.cirrhosis.heading', 'Child-Pugh Staging of Cirrhosis & Surgical Risk')),
      h('p', { class: 'tab-subtitle' }, t('lc.cirrhosis.subtitle', 'Assessment of functional hepatic reserve based on total bilirubin, serum albumin, INR, ascites, and hepatic encephalopathy.')),
    ]);

    const stagesGrid = h('div', { class: 'lc-stages-grid' }, CIRRHOSIS_STAGING_TIERS.map((stg) => h('div', { class: `lc-stage-card ${stg.severity}` }, [
      h('div', { class: `stage-badge ${stg.severity}` }, stg.tierId.toUpperCase().replace(/_/g, ' ')),
      h('h3', { class: 'stage-title' }, stg.titleEn),
      h('p', { class: 'stage-prognosis' }, [h('strong', {}, 'Prognosis: '), stg.prognosisEn]),
      h('div', { class: 'stage-section management-box' }, [
        h('strong', {}, 'Clinical Management & MOUD Adjustments:'),
        h('p', {}, stg.clinicalHandlingEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(stagesGrid);
    return section;
  }

  function renderMoudTab() {
    const section = h('section', { class: 'lc-moud-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'lc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('lc.moud.heading', 'MOUD Pharmacokinetics in Hepatic Impairment')),
      h('p', { class: 'tab-subtitle' }, t('lc.moud.subtitle', 'Suboxone vs. Subutex in severe cirrhosis, naloxone bioavailability hazards, and methadone protein-binding dynamics.')),
    ]);

    const diffsGrid = h('div', { class: 'lc-diffs-grid' }, [
      HEPATIC_MOUD_PROFILES.buprenorphine,
      HEPATIC_MOUD_PROFILES.methadone,
    ].map((moud) => h('div', { class: 'lc-diff-card' }, [
      h('div', { class: 'diff-badge' }, moud.id.toUpperCase().replace('_', ' ')),
      h('h3', { class: 'diff-title' }, moud.nameEn),
      h('div', { class: 'diff-field' }, [
        h('strong', {}, 'Hepatic Pharmacokinetics: '),
        h('p', {}, moud.pharmacokineticsEn),
      ]),
      h('div', { class: 'diff-field action-field' }, [
        h('strong', {}, 'Clinical Directives: '),
        h('p', {}, moud.clinicalDirectivesEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(diffsGrid);
    return section;
  }

  function renderHarmReductionTab() {
    const section = h('section', { class: 'lc-harm-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'lc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('lc.hr.heading', 'Hepatic Harm Reduction & Liver Survival Directives')),
      h('p', { class: 'tab-subtitle' }, t('lc.hr.subtitle', 'Essential field directives to prevent acute liver failure, fatal variceal hemorrhage, and hepatorenal syndrome.')),
    ]);

    const rulesGrid = h('div', { class: 'lc-rules-grid' }, HEPATIC_HARM_REDUCTION_RULES.map((rule) => h('div', { class: 'lc-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${rule.ruleNum}`),
      h('h3', {}, rule.titleEn),
      h('p', {}, rule.detailEn),
    ])));

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    const renalCard = h('div', { class: 'lc-card mt-3' }, [
      h('h3', {}, 'Hepatorenal Syndrome & Nephroprotection Alert'),
      h('p', {}, 'Advanced liver cirrhosis heavily predisposes to acute kidney injury (Hepatorenal Syndrome). Strict prohibition on NSAIDs and nephrotoxins is essential: '),
      h('p', {}, [
        h('a', { href: '#/renal-care', class: 'btn btn-secondary' }, 'Open Renal Health & Nephroprotection Navigator →'),
      ]),
    ]);
    section.appendChild(renalCard);
    return section;
  }

  // Initial render
  const unsubscribe = subscribeLiverState(() => render());
  render();

  return container;
}
