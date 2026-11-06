// public/js/views/metabolicCare.js
// HarborPath - Endocrine & Metabolic Emergencies, Alcoholic Ketoacidosis, euDKA & Adrenal Crisis Navigator
// Clinical Consensus: American Diabetes Association (ADA) Standards of Care in Diabetes (DKA & HHS Protocols),
// Endocrine Society Clinical Practice Guidelines on Adrenal Insufficiency and Thyroid Emergencies,
// American College of Emergency Physicians (ACEP) Consensus on Alcoholic Ketoacidosis & Hypoglycemia,
// American Society of Addiction Medicine (ASAM) Principles of Addiction Medicine (Metabolic Comorbidities).
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: SUBSTANCE-INDUCED METABOLIC & ENDOCRINE PATHOLOGY
// ============================================================================

export const METABOLIC_SYNDROME_PROFILES = Object.freeze({
  aka: Object.freeze({
    id: 'aka',
    nameEn: 'Alcoholic Ketoacidosis (AKA) vs. Diabetic Ketoacidosis',
    nameEs: 'Cetoacidosis Alcohólica (CAA) vs. Cetoacidosis Diabética',
    pathophysiologyEn: 'Develops in individuals with chronic heavy alcohol use following an acute binge followed by abrupt cessation due to persistent vomiting, abdominal pain, and starvation. Protracted starvation combined with ethanol-mediated suppression of hepatic gluconeogenesis induces severe extracellular glycogen depletion. Massive lipolysis floods the liver with free fatty acids, producing extreme ketogenesis. Because the high NADH/NAD+ redox ratio driven by alcohol dehydrogenase favors beta-hydroxybutyrate (BOHB) over acetoacetate (often > 5:1 to 10:1), routine nitroprusside urine dipsticks (which only detect acetoacetate) are frequently falsely negative or only trace positive!',
    pathophysiologyEs: 'Ocurre en personas con consumo crónico de alcohol tras una borrachera interrumpida por vómitos persistentes y ayuno. El agotamiento de glucógeno y el bloqueo de la gluconeogénesis hepática provocan lipólisis masiva y cetogénesis. El exceso de NADH desvía la reacción hacia beta-hidroxibutirato (BOHB), por lo que las tiras reactivas de orina habituales (que solo detectan acetoacetato) dan un falso negativo o trazas.',
    clinicalPresentationEn: 'CLASSICAL PRESENTATION: Severe high anion gap metabolic acidosis (anion gap > 20 mEq/L, serum bicarbonate < 10–15 mEq/L) with normal, low, or only mildly elevated blood glucose (often 50–200 mg/dL), accompanied by severe tachypnea (Kussmaul breathing) and dehydration. CARDINAL LIFE-SAVING RULE: Treatment requires IV Dextrose (D5W or D5 1/2NS) + Normal Saline + High-Dose Parenteral Thiamine! Dextrose stimulates endogenous insulin release, restores the NADH/NAD+ ratio, and shuts down lipolysis. INSULIN IS STRICTLY CONTRAINDICATED in pure AKA: administering insulin causes profound, fatal hypoglycemia and hypokalemia!',
    clinicalPresentationEs: 'PRESENTACIÓN: Acidosis metabólica grave con anión gap elevado (> 20 mEq/L, bicarbonato < 10–15 mEq/L) con glucemia normal, baja o discretamente elevada (50–200 mg/dL), taquipnea de Kussmaul y deshidratación. REGLA VITAL: ¡El tratamiento requiere Suero Glucosado al 5% (SG 5%) + Suero Fisiológico + Tiamina parenteral previa! La glucosa estimula la insulina endógena y frena la cetogénesis. ¡LA INSULINA EXÓGENA ESTÁ ESTRICTAMENTE CONTRAINDICADA en CAA pura porque provoca hipoglucemia e hipopotasemia mortal!',
  }),

  dkaHhs: Object.freeze({
    id: 'dka_hhs',
    nameEn: 'Stimulant-Induced DKA & Hyperosmolar Hyperglycemic State (HHS)',
    nameEs: 'Cetoacidosis Diabética (CAD) y Estado Hiperosmolar Hiperglucémico (EHH) por Estimulantes',
    pathophysiologyEn: 'Acute cocaine, methamphetamine, or synthetic cathinone use triggers a massive sympathoadrenal catecholamine storm (epinephrine, norepinephrine, cortisol, and glucagon). These counter-regulatory hormones stimulate uninhibited hepatic glycogenolysis, gluconeogenesis, and peripheral lipolysis while blunting residual insulin secretion, precipitating acute fulminant DKA or Hyperosmolar Hyperglycemic State (HHS) even in previously controlled diabetes.',
    pathophysiologyEs: 'El consumo de cocaína o metanfetamina desata una descarga adrenérgica masiva (adrenalina, cortisol y glucagón) que estimula la gluconeogénesis y lipólisis descontroladas, inhibiendo la secreción de insulina y desencadenando CAD o EHH fulminante.',
    clinicalPresentationEn: 'PRESENTATION & FLUID DEFICITS: DKA manifests with severe hyperglycemia (glucose > 250–600 mg/dL), high anion gap acidosis (pH < 7.3, HCO3 < 18), Kussmaul respirations, acetone breath, and 3–6 liter fluid deficit. HHS manifests with extreme hyperglycemia (glucose > 600–1000+ mg/dL), profound serum hyperosmolarity (> 320 mOsm/kg), severe dehydration (8–12 liter fluid deficit), and altered mental status without significant ketoacidosis. CARDINAL POTASSIUM RULE: ALWAYS check serum potassium before starting IV insulin! If K+ is < 3.3 mEq/L, hold insulin and infuse potassium until K+ is > 3.3 mEq/L; administering insulin into hypokalemia drives potassium intracellularly and triggers lethal ventricular arrhythmias or asystole.',
    clinicalPresentationEs: 'PRESENTACIÓN: La CAD causa hiperglucemia (> 250–600 mg/dL), acidosis con anión gap elevado, respiración de Kussmaul y déficit hídrico de 3–6 litros. El EHH causa hiperglucemia extrema (> 600–1000 mg/dL), hiperosmolaridad (> 320 mOsm/kg), deshidratación de 8–12 litros y coma sin acidosis marcada. REGLA CARDINAL DEL POTASIO: ¡Comprobar siempre el potasio antes de la insulina IV! Si K+ < 3.3 mEq/L, posponer la insulina y reponer potasio; dar insulina con hipopotasemia provoca arritmias ventriculares mortales.',
  }),

  eudka: Object.freeze({
    id: 'eudka',
    nameEn: 'Euglycemic DKA (euDKA) with SGLT2 Inhibitors & Stimulants / Alcohol',
    nameEs: 'Cetoacidosis Diabética Euglucémica (CADeu) con Inhibidores SGLT2 y Estimulantes / Alcohol',
    pathophysiologyEn: 'Modern SGLT2 inhibitors (empagliflozin, dapagliflozin, canagliflozin) promote constant renal glucosuria, lowering plasma glucose and reducing endogenous insulin secretion while stimulating glucagon release. When combined with substance use—such as stimulant-induced appetite suppression, dehydration, vomiting, or alcohol-induced fasting—lipolysis accelerates dramatically, producing heavy ketonemia with blood glucose that remains paradoxically NORMAL or near-normal (< 200–250 mg/dL)!',
    pathophysiologyEs: 'Los inhibidores SGLT2 (empagliflozina, dapagliflozina) provocan glucosuria continua, bajando la glucosa y reduciendo la insulina endógena. Al combinarse con estimulantes (inapetencia, deshidratación) o alcohol (ayuno), se desencadena una cetonemia masiva con glucemias paradójicamente NORMALES (< 200–250 mg/dL).',
    clinicalPresentationEn: 'THE MISSED DIAGNOSIS TRAP: Because fingerstick blood glucose is normal (< 200 mg/dL), clinicians and patients dismiss ketoacidosis. The patient presents with nausea, vomiting, lethargy, deep Kussmaul hyperventilation, and unexplained high anion gap metabolic acidosis. Serum beta-hydroxybutyrate is heavily elevated (> 3.0 mmol/L). TREATMENT MANDATE: Stop the SGLT2 inhibitor immediately. Administer both IV Regular Insulin infusion (0.05–0.1 units/kg/h) AND IV Dextrose (D5W or D10W) concurrently to close the anion gap and halt ketosis without inducing hypoglycemia.',
    clinicalPresentationEs: 'LA TRAMPA DIAGNÓSTICA: Al ver una glucemia capilar normal (< 200 mg/dL), se descarta erróneamente la cetoacidosis. El paciente presenta náuseas, vómitos, letargo, respiración de Kussmaul y acidosis metabólica con anión gap elevado y beta-hidroxibutirato > 3.0 mmol/L. TRATAMIENTO: Suspender el fármaco SGLT2 e infundir simultáneamente Insulina IV + Suero Glucosado (SG 5% o 10%) para cerrar el anión gap sin provocar hipoglucemia.',
  }),

  severeHypoglycemia: Object.freeze({
    id: 'severe_hypoglycemia',
    nameEn: 'Severe Hypoglycemia Masked by Stimulants or Sedatives / Beta-Blockers',
    nameEs: 'Hipoglucemia Grave Enmascarada por Estimulantes o Sedantes / Betabloqueantes',
    pathophysiologyEn: 'In heavy alcohol use, hepatic glycogen depletion combined with the direct inhibition of gluconeogenesis by alcohol dehydrogenase causes precipitous, life-threatening drops in plasma glucose (often < 40–50 mg/dL). Concurrently, stimulant intoxication masks adrenergic warning signs (tremor, diaphoresis, tachycardia, and anxiety are dismissed as stimulant effects), while opioids, sedatives, or beta-blockers blunt the neuroglycopenic response, transforming hypoglycemia into an unrecognized coma.',
    pathophysiologyEs: 'En el alcoholismo, el agotamiento del glucógeno y el bloqueo de la gluconeogénesis hepática provocan caídas críticas de la glucemia (< 40–50 mg/dL). Los estimulantes enmascaran las señales de alarma adrenérgicas (temblor, sudoración y taquicardia se confunden con el "viaje"), mientras que los opioides y sedantes enmascaran el coma hipoglucémico.',
    clinicalPresentationEn: 'THE CARDINAL OVERDOSE & ALTERED MENTAL STATUS DIRECTIVE: Always measure capillary blood glucose immediately in EVERY patient with altered mental status, stupor, coma, or suspected overdose! Hypoglycemia mimics stroke (focal hemiparesis), opioid overdose (coma with hypoventilation), and psychiatric psychosis. TREATMENT: In conscious individuals, administer 15–20 g of rapid-acting oral glucose. In unconscious or uncooperative patients, administer IV Dextrose 50% (D50W 25–50 mL IV bolus) or Glucagon 1 mg IM/subQ (note: glucagon may fail in severe alcoholism due to depleted glycogen stores; IV dextrose is the gold standard).',
    clinicalPresentationEs: 'DIRECTIVA CARDINAL DE COMA Y SOBREDOSIS: ¡Medir siempre la glucemia capilar de inmediato en TODA persona con alteración del nivel de consciencia, estupor o sospecha de sobredosis! La hipoglucemia simula un ictus (hemiparesia focal), sobredosis de opioides o psicosis. TRATAMIENTO: Glucagón 1 mg IM o Suero Glucosado al 50% (D50W 25–50 mL en bolo IV). El glucagón puede fallar en alcoholismo por falta de reservas de glucógeno.',
  }),

  oiaiAdrenal: Object.freeze({
    id: 'oiai_adrenal',
    nameEn: 'Opioid-Induced Adrenal Insufficiency (OIAI) & Acute Adrenal Crisis',
    nameEs: 'Insuficiencia Suprarrenal Inducida por Opioides (ISIO) y Crisis Suprarrenal Aguda',
    pathophysiologyEn: 'Chronic administration of high-potency opioids (methadone maintenance, chronic fentanyl exposure, high-dose oxycodone/morphine) directly suppresses the Hypothalamic-Pituitary-Adrenal (HPA) axis by binding mu-opioid receptors on the hypothalamus and pituitary gland, blunting corticotropin-releasing hormone (CRH) and ACTH release. This produces secondary central adrenal insufficiency, affecting an estimated 9% to 29% of chronic opioid users.',
    pathophysiologyEs: 'El consumo crónico de opioides de alta potencia (metadona, fentanilo, morfina) inhibe el eje hipotálamo-hipofisario-suprarrenal al unirse a receptores mu cerebrales, bloqueando la liberación de CRH y ACTH y produciendo insuficiencia suprarrenal secundaria.',
    clinicalPresentationEn: 'CLINICAL SPECTRUM: Chronic signs include unexplained profound fatigue, orthostatic hypotension, unexplained weight loss, generalized joint/muscle pain, and hyponatremia, which are frequently misdiagnosed as "post-acute withdrawal" or depression. ACUTE ADRENAL CRISIS: Triggered by physiologic stressors (severe sepsis, soft tissue abscess, traumatic injury, abrupt opioid cessation). Manifests as refractory vasopressor-resistant circulatory shock, severe abdominal pain, hypoglycemia, and altered consciousness. TREATMENT MANDATE: Immediate administration of stress-dose IV Hydrocortisone (100 mg IV bolus followed by 50–100 mg IV every 6–8 hours) and aggressive IV fluid resuscitation.',
    clinicalPresentationEs: 'ESPECTRO CLÍNICO: Astenia intensa, hipotensión ortostática, pérdida de peso, mialgias e hiponatremia, a menudo mal diagnosticadas como "abstinencia prolongada". CRISIS SUPRARRENAL AGUDA: Desencadenada por estrés (sepsis, abscesos, traumatismos). Cursa con shock circulatorio refractario a catecolaminas, dolor abdominal intenso e hipoglucemia. MANEJO: Hidrocortisona en bolo de estrés (100 mg IV seguidos de 50–100 mg cada 6–8 horas) y reposición con suero salino.',
  }),

  thyroidStorm: Object.freeze({
    id: 'thyroid_storm',
    nameEn: 'Thyroid Storm vs. Sympathomimetic Stimulant Toxicity',
    nameEs: 'Tormenta Tiroidea vs. Toxicidad Simpaticomimética por Estimulantes',
    pathophysiologyEn: 'Acute stimulant exposure (cocaine, methamphetamine, synthetic cathinones) massively accelerates central and peripheral adrenergic output. In patients with subclinical or diagnosed hyperthyroidism (Graves disease, toxic multinodular goiter), excess thyroid hormones upregulate beta-adrenergic receptors throughout myocardium and vascular smooth muscle, rendering the patient extraordinarily hypersensitive to stimulant catecholamines, precipitating decompensated thyrotoxicosis (Thyroid Storm).',
    pathophysiologyEs: 'Los estimulantes desatan una tormenta adrenérgica masiva. En personas con hipertiroidismo previo, las hormonas tiroideas multiplican los receptores beta-adrenérgicos en el corazón, provocando una respuesta catastrófica a la cocaína o metanfetamina que desencadena una Tormenta Tiroidea descompensada.',
    clinicalPresentationEn: 'BURCH-WARTOFSKY CRITERIA & PRESENTATION: Extreme hyperthermia (temp > 39.5–41.0°C), profound tachycardia (> 140–160 bpm) or new-onset rapid atrial fibrillation, agitation, delirium, high-output heart failure, and jaundice. EMERGENCY THERAPEUTIC SEQUENCE: 1) Active aggressive external cooling and benzodiazepines; 2) Antithyroid thionamide (Propylthiouracil / PTU 200 mg q4h or Methimazole 20 mg q6h); 3) Saturated Solution of Potassium Iodide (SSKI) or Lugol solution given AT LEAST 1 HOUR AFTER thionamides (to block organification via Wolff-Chaikoff effect without providing iodine substrate for new hormone synthesis); 4) IV Dexamethasone 2 mg q6h (blocks peripheral T4 to T3 conversion); 5) Cautious short-acting beta-blockade (IV esmolol infusion).',
    clinicalPresentationEs: 'CRITERIOS DE BURCH-WARTOFSKY: Hipertermia extrema (> 39.5–41°C), taquicardia (> 140–160 lpm), fibrilación auricular rápida, delirio, insuficiencia cardíaca de alto gasto e ictericia. SECUENCIA TERAPÉUTICA DE EMERGENCIA: 1) Enfriamiento externo activo y benzodiacepinas; 2) Fármaco antitiroideo (PTU o Metimazol); 3) Yoduro (lugol o SSKI) ADMINISTRADO AL MENOS 1 HORA DESPUÉS del antitiroideo (efecto Wolff-Chaikoff); 4) Dexametasona IV (bloquea la conversión periférica de T4 a T3); 5) Esmolol IV con extrema precaución.',
  }),
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & FIELD METABOLIC PRESERVATION
// ============================================================================

export const METABOLIC_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Check Capillary Glucose in EVERY Altered Mental Status or Overdose',
    titleEs: 'Medir Glucemia Capilar en TODA Alteración Mental o Sobredosis',
    detailEn: 'Severe low blood sugar (< 50 mg/dL) produces coma, dilated pupils, and hypoventilation that perfectly mimics an opioid overdose or stroke. Check a fingerstick glucose immediately on scene before assuming unresponsiveness is purely drug-induced—a 2-minute glucose check saves lives and prevents permanent brain damage.',
    detailEs: 'Una hipoglucemia grave (< 50 mg/dL) causa coma y bradipnea que simula exactamente una sobredosis de opioides o un ictus. Mida la glucosa capilar de inmediato en el lugar antes de asumir que el estupor es solo por drogas: un pinchazo de 2 minutos previene daño cerebral permanente.',
  },
  {
    ruleNum: 2,
    titleEn: 'Alcoholic Ketoacidosis (AKA): IV Dextrose & Saline YES, Insulin NO',
    titleEs: 'Cetoacidosis Alcohólica (CAA): Glucosa y Suero SÍ, Insulina NO',
    detailEn: 'In heavy drinkers who stop eating and develop vomiting and high acid levels, the body needs intravenous sugar (D5W) and hydration, NOT insulin! Giving insulin to a person in alcoholic ketoacidosis precipitates lethal low blood sugar and potassium drops. Always give IV thiamine before glucose.',
    detailEs: 'En personas con consumo intensivo de alcohol que dejan de comer y sufren vómitos con acidosis, el cuerpo necesita suero glucosado (SG 5%) e hidratación, ¡NO insulina! Administrar insulina en cetoacidosis alcohólica provoca hipoglucemia mortal y parada cardíaca por hipopotasemia.',
  },
  {
    ruleNum: 3,
    titleEn: 'SGLT2 Inhibitor Alert: Normal Blood Sugar Does NOT Rule Out DKA (euDKA)',
    titleEs: 'Alerta con Fármacos SGLT2: Una Glucosa Normal NO Descarta Cetoacidosis (CADeu)',
    detailEn: 'If you take diabetes or heart pills ending in "-gliflozin" (Jardiance, Farxiga, Invokana) and use stimulants or fast, you can develop severe, life-threatening ketoacidosis with completely normal blood sugar. If you feel sick, nauseous, or breathless, seek hospital care immediately and test blood ketones.',
    detailEs: 'Si toma pastillas para la diabetes o el corazón terminadas en "-gliflozina" (Jardiance, Forxiga) y consume estimulantes o deja de comer, puede sufrir cetoacidosis grave con glucemias totalmente normales. Si tiene náuseas o falta de aire, acuda a urgencias de inmediato.',
  },
  {
    ruleNum: 4,
    titleEn: 'Potassium Before Insulin in DKA: Check Levels to Prevent Asystole',
    titleEs: 'Comprobar el Potasio Antes de la Insulina en CAD: Evitar Parada Cardíaca',
    detailEn: 'Insulin moves potassium from the bloodstream into cells. If a person in diabetic ketoacidosis has a low potassium level (< 3.3 mEq/L) and is given insulin, their blood potassium collapses instantly, causing fatal cardiac arrest. Emergency teams must replenish potassium before starting insulin infusions.',
    detailEs: 'La insulina introduce el potasio en las células. Si una persona en cetoacidosis tiene el potasio bajo (< 3.3 mEq/L) y recibe insulina, el potasio sanguíneo se desploma, provocando una parada cardíaca inmediata. Los médicos deben reponer potasio antes de infundir insulina.',
  },
  {
    ruleNum: 5,
    titleEn: 'Chronic Opioid Fatigue May Be Adrenal Failure (OIAI): Test Cortisol',
    titleEs: 'La Fatiga Crónica en Opioides Puede Ser Fallo Suprarrenal (ISIO): Medir Cortisol',
    detailEn: 'Long-term high-dose opioids (methadone, fentanyl, morphine) suppress hormone production in the adrenal glands in up to 29% of patients, causing severe exhaustion, dizziness, weight loss, and low blood pressure. If you suffer from unexplained exhaustion, ask your doctor for morning cortisol and ACTH testing.',
    detailEs: 'El consumo prolongado de opioides en altas dosis (metadona, fentanilo) suprime la producción hormonal suprarrenal en hasta el 29% de pacientes, causando agotamiento extremo, mareos y tensión baja. Si sufre fatiga inexplicable, solicite una analítica de cortisol y ACTH matutino.',
  },
  {
    ruleNum: 6,
    titleEn: 'Hydrate with Carbohydrates and Electrolytes During Stimulant Use',
    titleEs: 'Hidratarse con Carbohidratos y Electrólitos al Consumir Estimulantes',
    detailEn: 'Stimulants suppress appetite while dramatically increasing metabolic rate, burning through liver glycogen stores. Never go days without food: drink electrolyte beverages with glucose or eat small carbohydrate-rich meals to prevent alcoholic/starvation ketoacidosis and severe dehydration.',
    detailEs: 'Los estimulantes quitan el apetito mientras disparan el gasto calórico, agotando las reservas de glucógeno. No pase días enteros sin comer: tome bebidas isotónicas con glucosa o comidas ligeras ricas en hidratos de carbono para prevenir cetoacidosis por ayuno y deshidratación grave.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO PERSISTENT STORAGE)
// ============================================================================

let metabolicState = {
  activeTab: 'syndromes', // 'syndromes' | 'evaluator' | 'rules' | 'sbar'
  capillaryGlucoseSevereLow: false, // Blood glucose < 50 mg/dL or hypoglycemia signs
  alcoholBingeStarvationAcidosis: false, // Heavy alcohol + vomiting/starvation + high anion gap (AKA)
  sglt2InhibitorUse: false, // Takes Jardiance / Farxiga / Invokana
  stimulantAnorexiaKetonemia: false, // Stimulant use + nausea/vomiting/ketones
  diabeticSevereHyperglycemia: false, // Glucose > 300 mg/dL + deep Kussmaul breathing (DKA)
  extremeDehydrationAlteredMental: false, // Extreme thirst, dry mucosa, confusion (HHS)
  chronicOpioidHypotensionFatigue: false, // Long-term opioids + unexplained fatigue, orthostasis (OIAI)
  refractoryShockStress: false, // Vasopressor-resistant shock + severe infection/trauma (Adrenal Crisis)
  stimulantHyperthermiaThyroidStorm: false, // Severe hyperthermia > 39.5°C + HR > 140 + delirium (Thyroid Storm)
  sbarCopied: false,
};

const listeners = new Set();

export function getMetabolicState() {
  return { ...metabolicState };
}

export function setMetabolicState(patch) {
  metabolicState = { ...metabolicState, ...patch };
  listeners.forEach((fn) => {
    try {
      fn(metabolicState);
    } catch (e) {
      console.error('metabolicCare state listener error:', e);
    }
  });
}

export function resetMetabolicState() {
  metabolicState = {
    activeTab: 'syndromes',
    capillaryGlucoseSevereLow: false,
    alcoholBingeStarvationAcidosis: false,
    sglt2InhibitorUse: false,
    stimulantAnorexiaKetonemia: false,
    diabeticSevereHyperglycemia: false,
    extremeDehydrationAlteredMental: false,
    chronicOpioidHypotensionFatigue: false,
    refractoryShockStress: false,
    stimulantHyperthermiaThyroidStorm: false,
    sbarCopied: false,
  };
  listeners.forEach((fn) => {
    try {
      fn(metabolicState);
    } catch (e) {
      console.error('metabolicCare reset listener error:', e);
    }
  });
}

export function subscribeMetabolicState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ============================================================================
// CLINICAL DECISION SUPPORT ALGORITHM: METABOLIC RISK EVALUATION
// ============================================================================

export function evaluateMetabolicRisk(state) {
  const flags = [];
  let urgency = 'precautionary'; // 'emergency_911' | 'urgent_eval' | 'specialty_consult' | 'precautionary'

  // Tier 1: Immediate Life-Threatening Endocrine Emergencies (Call 911 / Resuscitation)
  if (state.capillaryGlucoseSevereLow) {
    urgency = 'emergency_911';
    flags.push({
      priority: 1,
      titleEn: 'Critical Hypoglycemia Alert (< 50 mg/dL): Rapid Neuroglycopenic Brain Damage Risk',
      titleEs: 'Alerta de Hipoglucemia Crítica (< 50 mg/dL): Riesgo de Daño Cerebral Neuroglucopénico',
      descEn: 'Severe hypoglycemia mimics opioid overdose coma and acute ischemic stroke. If conscious, administer 15–20 g fast-acting oral glucose. If unconscious or uncooperative, immediately administer IV Dextrose 50% (D50W 25–50 mL bolus) or Glucagon 1 mg IM. Note: Glucagon may fail in severe alcohol misuse due to depleted glycogen stores; IV dextrose is the definitive treatment.',
      descEs: 'La hipoglucemia severa simula coma por sobredosis de opioides e ictus. Si está consciente, dar 15–20 g de glucosa oral. Si está inconsciente, administrar Suero Glucosado al 50% (D50W 25–50 mL IV en bolo) o Glucagón 1 mg IM. El glucagón puede fallar en alcoholismo; la glucosa IV es el tratamiento definitivo.',
    });
  }

  if (state.refractoryShockStress) {
    urgency = 'emergency_911';
    flags.push({
      priority: 1,
      titleEn: 'Suspected Acute Adrenal Crisis: Vasopressor-Resistant Shock',
      titleEs: 'Sospecha de Crisis Suprarrenal Aguda: Shock Refractario a Vasopresores',
      descEn: 'Refractory circulatory collapse in a patient on chronic opioids or severe systemic stress. Emergent administration of stress-dose IV Hydrocortisone (100 mg IV stat followed by 50–100 mg q6–8h) and aggressive normal saline resuscitation required. Do not delay hydrocortisone while awaiting diagnostic cortisol confirmation.',
      descEs: 'Colapso circulatorio refractario en paciente con consumo crónico de opioides o estrés sistémico severo. Administrar de inmediato Hidrocortisona en bolo de estrés (100 mg IV seguidos de 50–100 mg cada 6–8h) y reposición con suero salino. No demorar el tratamiento esperando resultados analíticos.',
    });
  }

  if (state.stimulantHyperthermiaThyroidStorm) {
    urgency = 'emergency_911';
    flags.push({
      priority: 2,
      titleEn: 'Suspected Thyroid Storm / Decompensated Hyperthyroidism & Stimulant Overdrive',
      titleEs: 'Sospecha de Tormenta Tiroidea / Hipertiroidismo Descompensado y Sobrecarga por Estimulantes',
      descEn: 'Life-threatening triad of hyperpyrexia (> 39.5°C), tachyarrhythmias (HR > 140 bpm / Afib), and delirium following stimulant exposure. Mandates ICU transfer, aggressive external cooling, benzodiazepines, antithyroid thionamides (PTU/methimazole), followed AT LEAST 1 HOUR LATER by potassium iodide (SSKI), and IV dexamethasone.',
      descEs: 'Tríada potencialmente mortal de hipertermia extrema (> 39.5°C), taquiarritmias (FC > 140 lpm) y delirio tras consumo de estimulantes. Requiere UCI, enfriamiento activo, benzodiacepinas, antitiroideos (PTU/metimazol), seguidos al menos 1 hora después por yoduro (SSKI) y dexametasona IV.',
    });
  }

  if (state.diabeticSevereHyperglycemia || state.extremeDehydrationAlteredMental) {
    urgency = 'emergency_911';
    flags.push({
      priority: 2,
      titleEn: 'Fulminant DKA / Hyperosmolar Hyperglycemic State (HHS) Alert',
      titleEs: 'Alerta de Cetoacidosis Diabética Fulminante / Estado Hiperosmolar Hiperglucémico (EHH)',
      descEn: 'Severe hyperglycemia with massive osmotic fluid deficit (3–12 L) and high risk of cerebral edema or hyperkalemia/hypokalemia collapse. Mandates immediate emergency transport, aggressive isotonic saline resuscitation (1–2 L in first hour), and stat serum potassium check BEFORE starting insulin infusions.',
      descEs: 'Hiperglucemia grave con deshidratación masiva (3–12 L) y alto riesgo de edema cerebral o arritmias por potasio. Requiere traslado urgente, fluidoterapia intensiva con suero salino isotónico y COMPROBAR EL POTASIO ANTES de la insulina.',
    });
  }

  // Tier 2: Urgent Evaluation & Specific Antidote/Replacement Therapy
  if (state.alcoholBingeStarvationAcidosis) {
    if (urgency !== 'emergency_911') urgency = 'urgent_eval';
    flags.push({
      priority: 3,
      titleEn: 'Suspected Alcoholic Ketoacidosis (AKA): IV Dextrose & Saline Mandate',
      titleEs: 'Sospecha de Cetoacidosis Alcohólica (CAA): Mandato de Glucosa y Suero Fisiológico',
      descEn: 'High anion gap metabolic acidosis with normal or low glucose in a chronic alcohol user with vomiting. Nitroprusside urine tests are falsely negative because ketonemia is beta-hydroxybutyrate. TREAT WITH: IV D5W or D5 1/2NS + normal saline + parenteral thiamine (500 mg IV before glucose). STRICT WARNING: DO NOT ADMINISTER INSULIN—insulin causes fatal hypoglycemia and hypokalemia!',
      descEs: 'Acidosis metabólica con anión gap elevado y glucosa normal/baja en bebedor crónico con vómitos. La orina da falso negativo porque el cetónico es beta-hidroxibutirato. TRATAR CON: Suero Glucosado al 5% (SG 5%) + suero salino + tiamina IV previa. ¡ADVERTENCIA: NO DAR INSULINA para evitar hipoglucemia mortal!',
    });
  }

  if (state.sglt2InhibitorUse && (state.stimulantAnorexiaKetonemia || state.extremeDehydrationAlteredMental)) {
    if (urgency !== 'emergency_911') urgency = 'urgent_eval';
    flags.push({
      priority: 3,
      titleEn: 'Euglycemic DKA (euDKA) Warning: SGLT2 Inhibitor + Stimulant / Fasting Trigger',
      titleEs: 'Alerta de Cetoacidosis Diabética Euglucémica (CADeu): SGLT2 + Estimulante / Ayuno',
      descEn: 'Patient on an SGLT2 inhibitor (empagliflozin, dapagliflozin, canagliflozin) experiencing ketoacidosis with NORMAL blood glucose (< 200–250 mg/dL). Clinicians frequently miss this because glucose is not elevated. Mandates immediate cessation of SGLT2i, stat serum beta-hydroxybutyrate measurement, and concurrent IV Regular Insulin + IV Dextrose infusion.',
      descEs: 'Paciente con fármaco SGLT2 (empagliflozina, dapagliflozina) con cetoacidosis y GLUCOSA NORMAL (< 200–250 mg/dL). Muy a menudo infradiagnosticada. Requiere suspender el SGLT2, medir beta-hidroxibutirato en sangre e infundir simultáneamente Insulina IV + Suero Glucosado.',
    });
  }

  // Tier 3: Specialty Consult & Subacute Workup
  if (state.chronicOpioidHypotensionFatigue) {
    if (urgency === 'precautionary') urgency = 'specialty_consult';
    flags.push({
      priority: 4,
      titleEn: 'Suspected Opioid-Induced Adrenal Insufficiency (OIAI)',
      titleEs: 'Sospecha de Insuficiencia Suprarrenal Inducida por Opioides (ISIO)',
      descEn: 'Chronic unexplained exhaustion, orthostatic hypotension, weight loss, and hyponatremia in a patient on long-term high-dose opioids. Affects 9–29% of chronic opioid users due to HPA axis suppression. Order morning serum cortisol (8 AM) and plasma ACTH, or cosyntropin stimulation test.',
      descEs: 'Astenia crónica inexplicable, hipotensión ortostática, pérdida de peso e hiponatremia en paciente con consumo crónico de opioides. Afecta al 9–29% por supresión del eje suprarrenal. Solicitar analítica de cortisol matutino (8:00 AM) y ACTH o test de estimulación con cosintropina.',
    });
  }

  if (flags.length === 0) {
    flags.push({
      priority: 5,
      titleEn: 'Baseline Metabolic Health & Harm Reduction Directives',
      titleEs: 'Salud Metabólica Básica y Directivas de Reducción de Daños',
      descEn: 'No acute endocrine or metabolic emergencies identified. Prioritize regular carbohydrate and electrolyte hydration during stimulant sessions, avoid extended multi-day fasting, and ensure point-of-care capillary glucose is checked in any future sedation or altered mental status event.',
      descEs: 'Sin emergencias endocrinas o metabólicas agudas identificadas. Priorizar hidratación con electrolitos y carbohidratos en consumo de estimulantes, evitar ayunos prolongados y asegurar el control de glucemia capilar ante cualquier episodio futuro de sedación.',
    });
  }

  flags.sort((a, b) => a.priority - b.priority);

  return {
    urgency,
    flags,
  };
}

// ============================================================================
// ZERO-PII SBAR CLINICAL HANDOFF NOTE GENERATOR
// ============================================================================

export function formatMetabolicSbarText(state, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateMetabolicRisk(state);

  const lines = [];
  lines.push(isEs ? '=== INFORME DE TRASPASO CLÍNICO SBAR - EMERGENCIAS METABÓLICAS (HARBORPATH) ===' : '=== SBAR CLINICAL HANDOFF NOTE - METABOLIC & ENDOCRINE CARE (HARBORPATH) ===');
  lines.push(isEs ? `Fecha/Hora: ${new Date().toISOString()}` : `Timestamp: ${new Date().toISOString()}`);
  lines.push(isEs ? 'Privacidad: Sin datos de identificación (Zero-PII) - Evaluado en memoria RAM' : 'Privacy: Zero-PII In-RAM Ephemeral Assessment');
  lines.push('');

  // Situation
  lines.push(isEs ? '[S - SITUACIÓN]' : '[S - SITUATION]');
  const urgencyLabel = isEs
    ? (evalResult.urgency === 'emergency_911' ? 'EMERGENCIA MÉDICA CRÍTICA (911 / CÓDIGO METABÓLICO)' : evalResult.urgency === 'urgent_eval' ? 'EVALUACIÓN URGENTE / ANTÍDOTO REQUERIDO' : 'CONSULTA DE ESPECIALIDAD / PRECAUCIÓN')
    : (evalResult.urgency === 'emergency_911' ? 'CRITICAL MEDICAL EMERGENCY (911 / METABOLIC CODE)' : evalResult.urgency === 'urgent_eval' ? 'URGENT EVALUATION / PROTOCOL INDICATED' : 'SPECIALTY CONSULT / PRECAUTIONARY');
  lines.push(isEs ? `Nivel de Agudeza: ${urgencyLabel}` : `Acuity Level: ${urgencyLabel}`);
  lines.push('');

  // Background
  lines.push(isEs ? '[B - ANTECEDENTES Y FACTORES CLÍNICOS]' : '[B - CLINICAL BACKGROUND & IDENTIFIED FACTORS]');
  const activeFactors = [];
  if (state.capillaryGlucoseSevereLow) activeFactors.push(isEs ? 'Hipoglucemia severa (< 50 mg/dL) o clínica neuroglucopénica' : 'Severe hypoglycemia (< 50 mg/dL) or neuroglycopenic coma');
  if (state.alcoholBingeStarvationAcidosis) activeFactors.push(isEs ? 'Consumo intensivo de alcohol + vómitos persistentes y ayuno (sospecha de cetoacidosis alcohólica)' : 'Heavy alcohol use + vomiting/starvation + severe acidosis (suspected AKA)');
  if (state.sglt2InhibitorUse) activeFactors.push(isEs ? 'Tratamiento activo con inhibidores SGLT2 (empagliflozina, dapagliflozina, canagliflozina)' : 'Active SGLT2 inhibitor prescription (empagliflozin, dapagliflozin, canagliflozin)');
  if (state.stimulantAnorexiaKetonemia) activeFactors.push(isEs ? 'Consumo de estimulantes con anorexia, deshidratación y cetonemia' : 'Stimulant use with anorexia, dehydration, and ketonemia');
  if (state.diabeticSevereHyperglycemia) activeFactors.push(isEs ? 'Hiperglucemia severa (> 300 mg/dL) con respiración de Kussmaul (CAD)' : 'Severe hyperglycemia (> 300 mg/dL) with Kussmaul respirations (DKA)');
  if (state.extremeDehydrationAlteredMental) activeFactors.push(isEs ? 'Deshidratación profunda con hiperosmolaridad y confusión (EHH)' : 'Profound dehydration with hyperosmolarity and confusion (HHS)');
  if (state.chronicOpioidHypotensionFatigue) activeFactors.push(isEs ? 'Opioides crónicos a dosis altas con astenia extrema e hipotensión ortostática (ISIO)' : 'Long-term high-dose opioids with severe fatigue and orthostasis (OIAI)');
  if (state.refractoryShockStress) activeFactors.push(isEs ? 'Shock circulatorio refractario a vasopresores bajo estrés o infección (Crisis Suprarrenal)' : 'Vasopressor-resistant circulatory shock under stress or infection (Adrenal Crisis)');
  if (state.stimulantHyperthermiaThyroidStorm) activeFactors.push(isEs ? 'Hipertermia extrema (> 39.5°C), taquicardia (> 140 lpm) y delirio tras estimulantes (Tormenta Tiroidea)' : 'Extreme hyperpyrexia (> 39.5°C), tachyarrhythmias (> 140 bpm), and delirium (Thyroid Storm)');

  if (activeFactors.length === 0) {
    lines.push(isEs ? 'Ningún factor de riesgo metabólico agudo seleccionado.' : 'No acute metabolic risk factors selected.');
  } else {
    activeFactors.forEach((f) => lines.push(`• ${f}`));
  }
  lines.push('');

  // Assessment
  lines.push(isEs ? '[A - EVALUACIÓN Y DIRECTIVAS CLÍNICAS]' : '[A - CLINICAL ASSESSMENT & IDENTIFIED DIRECTIVES]');
  evalResult.flags.forEach((flag, idx) => {
    lines.push(`${idx + 1}. ${isEs ? flag.titleEs : flag.titleEn}`);
    lines.push(`   ${isEs ? flag.descEs : flag.descEn}`);
  });
  lines.push('');

  // Recommendation
  lines.push(isEs ? '[R - RECOMENDACIONES CLÍNICAS Y MANEJO]' : '[R - RECOMMENDATIONS & MANAGEMENT]');
  if (evalResult.urgency === 'emergency_911') {
    lines.push(isEs
      ? '1. Activar código de emergencia 911 / UCI de inmediato.\n2. Administrar glucosa oral o D50W 25-50 mL IV de inmediato si glucemia < 50 mg/dL.\n3. En sospecha de crisis suprarrenal, Hidrocortisona 100 mg IV stat sin demora.\n4. En CAD/EHH, fluidoterapia intensiva con suero salino y COMPROBAR POTASIO antes de iniciar insulina.\n5. En sospecha de tormenta tiroidea, enfriamiento activo, benzodiacepinas, antitiroideos y yoduro 1h después.'
      : '1. Activate 911 / ICU Resuscitation Code immediately.\n2. Administer oral glucose or D50W 25-50 mL IV bolus stat if glucose < 50 mg/dL.\n3. If adrenal crisis suspected, administer Hydrocortisone 100 mg IV stat without delay.\n4. In DKA/HHS, aggressive isotonic saline and CHECK POTASSIUM before starting IV insulin.\n5. If thyroid storm suspected, active cooling, benzodiazepines, thionamides, and potassium iodide 1h later.');
  } else if (evalResult.urgency === 'urgent_eval') {
    lines.push(isEs
      ? '1. Trasladar a urgencias para analítica urgente: gasometría, electrolitos con anión gap y beta-hidroxibutirato.\n2. En Cetoacidosis Alcohólica (CAA): Suero Glucosado al 5% + salino + tiamina previa; NUNCA DAR INSULINA.\n3. En CAD euglucémica por SGLT2: Suspender el fármaco SGLT2 e infundir simultáneamente Insulina IV + Suero Glucosado.'
      : '1. Transfer to ED for stat blood gas, electrolytes with anion gap, and serum beta-hydroxybutyrate.\n2. In Alcoholic Ketoacidosis (AKA): Infuse IV D5W + normal saline + thiamine; NEVER ADMINISTER INSULIN.\n3. In SGLT2 Euglycemic DKA: Discontinue SGLT2i, administer concurrent IV Regular Insulin + IV Dextrose.');
  } else {
    lines.push(isEs
      ? '1. Educación en reducción de daños: control rutinario de glucemia capilar en personas con consumo de sustancias.\n2. Evitar ayunos prolongados durante el uso de estimulantes y mantener bebidas con carbohidratos.\n3. Solicitar cribado de cortisol matutino y ACTH si persiste astenia en usuarios crónicos de opioides.'
      : '1. Harm reduction education: routine fingerstick glucose screening in all substance use care settings.\n2. Avoid multi-day fasting during stimulant runs; maintain carbohydrate and electrolyte fluid intake.\n3. Order morning cortisol and ACTH screening for chronic fatigue in long-term high-dose opioid therapy.');
  }

  lines.push('');
  lines.push(isEs
    ? 'Aviso legal: HarborPath es una herramienta informativa de apoyo a la decisión clínica. No sustituye el juicio médico directo.'
    : 'Notice: HarborPath is an educational clinical decision support platform. Does not substitute professional medical judgment.');

  return lines.join('\n');
}

// ============================================================================
// DOM VIEW RENDERING ENGINE (ZERO INNERHTML / 100% EPHEMERAL)
// ============================================================================

export function metabolicCareView() {
  const container = h('div', { class: 'metabolic-care-view' });

  function render() {
    clear(container);
    const state = getMetabolicState();
    const currentLang = (typeof t === 'function' && t('lang')) || 'en';
    const isEs = currentLang === 'es' || document.documentElement.lang === 'es';

    // Header Section
    const header = h('header', { class: 'metabolic-header' }, [
      h('div', { class: 'metabolic-title-badge' }, [
        icon('activity', { class: 'metabolic-badge-icon' }),
        h('span', {}, isEs ? 'Soporte de Decisión Endocrina & Metabólica' : 'Endocrine & Metabolic Decision Support'),
      ]),
      h('h1', { class: 'metabolic-title' }, isEs ? 'Emergencias Metabólicas, Cetoacidosis Alcohólica y Crisis Suprarrenal' : 'Metabolic Emergencies, Alcoholic Ketoacidosis & Adrenal Crisis'),
      h('p', { class: 'metabolic-subtitle' }, isEs
        ? 'Guía clínica de medicina de adicciones y endocrinología crítica para cetoacidosis alcohólica (CAA), CAD euglucémica con SGLT2, hipoglucemia enmascarada, crisis suprarrenal inducida por opioides y tormenta tiroidea.'
        : 'Evidence-based clinical decision support for alcoholic ketoacidosis (AKA), SGLT2 euglycemic DKA (euDKA), masked hypoglycemia, opioid-induced adrenal crisis (OIAI), and thyroid storm.'),
    ]);
    container.appendChild(header);

    // Primary Tab Navigation
    const tabs = [
      { id: 'syndromes', labelEn: 'Metabolic Syndromes', labelEs: 'Síndromes Metabólicos', iconName: 'activity' },
      { id: 'evaluator', labelEn: 'Clinical Triage & Risk Evaluator', labelEs: 'Triaje Clínico & Evaluador', iconName: 'clipboard' },
      { id: 'rules', labelEn: 'Field Metabolic Rules', labelEs: 'Reglas Metabólicas de Campo', iconName: 'shield' },
      { id: 'sbar', labelEn: 'Clinical SBAR Note', labelEs: 'Nota Clínica SBAR', iconName: 'file-text' },
    ];

    const tabNav = h('nav', { class: 'metabolic-tab-nav', role: 'tablist', 'aria-label': 'Metabolic Care Sections' },
      tabs.map((tab) => {
        const isActive = state.activeTab === tab.id;
        const btn = h('button', {
          type: 'button',
          role: 'tab',
          class: `metabolic-tab-btn ${isActive ? 'active' : ''}`,
          'aria-selected': isActive ? 'true' : 'false',
          'aria-controls': `tab-panel-${tab.id}`,
          id: `tab-btn-${tab.id}`,
        }, [
          icon(tab.iconName, { class: 'metabolic-tab-icon' }),
          h('span', {}, isEs ? tab.labelEs : tab.labelEn),
        ]);
        btn.addEventListener('click', () => setMetabolicState({ activeTab: tab.id }));
        return btn;
      })
    );
    container.appendChild(tabNav);

    // Tab Panel Container
    const panel = h('section', {
      class: 'metabolic-tab-panel',
      role: 'tabpanel',
      id: `tab-panel-${state.activeTab}`,
      'aria-labelledby': `tab-btn-${state.activeTab}`,
    });
    container.appendChild(panel);

    // Render Content Based on Active Tab
    if (state.activeTab === 'syndromes') {
      renderSyndromesPanel(panel, isEs);
    } else if (state.activeTab === 'evaluator') {
      renderEvaluatorPanel(panel, state, isEs);
    } else if (state.activeTab === 'rules') {
      renderRulesPanel(panel, isEs);
    } else if (state.activeTab === 'sbar') {
      renderSbarPanel(panel, state, isEs);
    }

    // Educational Disclaimer Footer
    const footer = h('footer', { class: 'metabolic-footer-notice' }, [
      icon('info', { class: 'metabolic-footer-icon' }),
      h('p', {}, isEs
        ? 'Aviso Clínico: HarborPath proporciona pautas basadas en consensos de ADA, ASAM y ACEP. No sustituye la gasometría arterial, ionograma con anión gap, cortisolemia o el juicio de intensivistas y endocrinólogos.'
        : 'Clinical Notice: HarborPath provides evidence-based guidelines from ADA, ASAM, and ACEP. It does not replace arterial blood gas analysis, anion gap electrolyte testing, cortisol testing, or specialist clinical judgment.'),
    ]);
    container.appendChild(footer);
  }

  // Panel 1: Syndromes
  function renderSyndromesPanel(panel, isEs) {
    const intro = h('div', { class: 'metabolic-panel-intro' }, [
      h('h2', {}, isEs ? 'Taxonomía de Emergencias Metabólicas y Endocrinas Inducidas por Sustancias' : 'Substance-Induced Metabolic & Endocrine Syndromes Taxonomy'),
      h('p', {}, isEs
        ? 'Fisiopatología y claves de manejo crítico para cetoacidosis alcohólica, CAD por estimulantes, CAD euglucémica, fallo suprarrenal y tormenta tiroidea.'
        : 'Pathophysiology and critical care directives for alcoholic ketoacidosis, stimulant DKA, euglycemic DKA, opioid adrenal failure, and thyroid storm.'),
    ]);
    panel.appendChild(intro);

    const list = h('div', { class: 'metabolic-syndromes-list' },
      Object.values(METABOLIC_SYNDROME_PROFILES).map((syndrome) => {
        return h('article', { class: 'metabolic-syndrome-card' }, [
          h('h3', { class: 'metabolic-syndrome-title' }, isEs ? syndrome.nameEs : syndrome.nameEn),
          h('div', { class: 'metabolic-section' }, [
            h('strong', {}, isEs ? 'Mecanismo Fisiopatológico:' : 'Pathophysiologic Mechanism:'),
            h('p', {}, isEs ? syndrome.pathophysiologyEs : syndrome.pathophysiologyEn),
          ]),
          h('div', { class: 'metabolic-section' }, [
            h('strong', {}, isEs ? 'Presentación Clínica y Manejo Crítico:' : 'Clinical Presentation & Critical Management:'),
            h('p', {}, isEs ? syndrome.clinicalPresentationEs : syndrome.clinicalPresentationEn),
          ]),
        ]);
      })
    );
    panel.appendChild(list);
  }

  // Panel 2: Evaluator
  function renderEvaluatorPanel(panel, state, isEs) {
    const intro = h('div', { class: 'metabolic-panel-intro' }, [
      h('h2', {}, isEs ? 'Evaluador de Riesgo Metabólico y Triaje Clínico' : 'Metabolic Risk Evaluator & Clinical Triage'),
      h('p', {}, isEs
        ? 'Marque los signos metabólicos y antecedentes observados para obtener una estratificación de agudeza clínica y directivas de acción inmediatas.'
        : 'Select observed metabolic signs and risk factors to receive real-time acuity stratification and emergency directives.'),
    ]);
    panel.appendChild(intro);

    const checklistItems = [
      { key: 'capillaryGlucoseSevereLow', labelEn: 'Severe low blood glucose (< 50 mg/dL) or neuroglycopenic stupor/coma', labelEs: 'Hipoglucemia severa (< 50 mg/dL) o estupor/coma neuroglucopénico' },
      { key: 'alcoholBingeStarvationAcidosis', labelEn: 'Chronic alcohol binge + persistent vomiting/starvation + deep acidotic breathing (AKA)', labelEs: 'Consumo intensivo de alcohol + vómitos persistentes/ayuno + respiración acidótica (CAA)' },
      { key: 'sglt2InhibitorUse', labelEn: 'Patient takes SGLT2 inhibitor diabetes/heart medication (Jardiance, Farxiga, Invokana)', labelEs: 'Toma medicación SGLT2 para diabetes/corazón (Jardiance, Forxiga, Invokana)' },
      { key: 'stimulantAnorexiaKetonemia', labelEn: 'Stimulant use (cocaine/meth) + multi-day anorexia/vomiting + nausea/ketones', labelEs: 'Consumo de estimulantes + ayuno prolongado/vómitos + náuseas/cetonas' },
      { key: 'diabeticSevereHyperglycemia', labelEn: 'Severe hyperglycemia (> 300 mg/dL) + deep Kussmaul respirations + acetone breath (DKA)', labelEs: 'Hiperglucemia grave (> 300 mg/dL) + respiración de Kussmaul + aliento a manzana (CAD)' },
      { key: 'extremeDehydrationAlteredMental', labelEn: 'Extreme dehydration + massive fluid deficit + confusion/hyperosmolarity (HHS)', labelEs: 'Deshidratación profunda + déficit hídrico masivo + confusión/hiperosmolaridad (EHH)' },
      { key: 'refractoryShockStress', labelEn: 'Vasopressor-resistant circulatory shock + severe infection/trauma (Adrenal Crisis)', labelEs: 'Shock circulatorio refractario a vasopresores + infección grave/trauma (Crisis Suprarrenal)' },
      { key: 'stimulantHyperthermiaThyroidStorm', labelEn: 'Extreme hyperthermia (> 39.5°C) + tachycardia (> 140 bpm) + delirium post-stimulant (Thyroid Storm)', labelEs: 'Hipertermia extrema (> 39.5°C) + taquicardia (> 140 lpm) + delirio tras estimulantes (Tormenta Tiroidea)' },
      { key: 'chronicOpioidHypotensionFatigue', labelEn: 'Long-term high-dose opioids + chronic unexplained fatigue, dizziness, and low BP (OIAI)', labelEs: 'Opioides crónicos a dosis altas + fatiga crónica inexplicable, mareos y PA baja (ISIO)' },
    ];

    const checklistForm = h('div', { class: 'metabolic-evaluator-checklist' },
      checklistItems.map((item) => {
        const isChecked = !!state[item.key];
        const label = h('label', { class: `metabolic-check-item ${isChecked ? 'selected' : ''}` }, [
          h('input', {
            type: 'checkbox',
            checked: isChecked,
            class: 'metabolic-checkbox',
          }),
          h('span', { class: 'metabolic-check-label' }, isEs ? item.labelEs : item.labelEn),
        ]);
        const input = label.querySelector('input');
        input.addEventListener('change', (e) => {
          setMetabolicState({ [item.key]: e.target.checked });
        });
        return label;
      })
    );
    panel.appendChild(checklistForm);

    // Reset Button
    const resetBar = h('div', { class: 'metabolic-evaluator-actions' }, [
      h('button', {
        type: 'button',
        class: 'metabolic-reset-btn',
      }, [
        icon('rotate-ccw', { class: 'metabolic-btn-icon' }),
        h('span', {}, isEs ? 'Restablecer Evaluación' : 'Reset Assessment'),
      ]),
    ]);
    resetBar.querySelector('button').addEventListener('click', () => resetMetabolicState());
    panel.appendChild(resetBar);

    // Results Box
    const evalResult = evaluateMetabolicRisk(state);
    const resultsContainer = h('div', { class: `metabolic-eval-results acuity-${evalResult.urgency}` }, [
      h('div', { class: 'metabolic-eval-urgency-badge' }, [
        icon(evalResult.urgency === 'emergency_911' ? 'alert-octagon' : evalResult.urgency === 'urgent_eval' ? 'alert-triangle' : 'info', { class: 'metabolic-urgency-icon' }),
        h('span', { class: 'metabolic-urgency-text' },
          evalResult.urgency === 'emergency_911'
            ? (isEs ? 'EMERGENCIA MÉDICA CRÍTICA (LLAMAR AL 911 / CÓDIGO METABÓLICO)' : 'CRITICAL MEDICAL EMERGENCY (CALL 911 / METABOLIC CODE)')
            : evalResult.urgency === 'urgent_eval'
            ? (isEs ? 'EVALUACIÓN URGENTE & PROTOCOLO INDICADO' : 'URGENT MEDICAL EVALUATION & PROTOCOL REQUIRED')
            : evalResult.urgency === 'specialty_consult'
            ? (isEs ? 'INTERCONSULTA CON ENDOCRINOLOGÍA & ESTUDIO HORMONAL' : 'SPECIALTY ENDOCRINE CONSULTATION & HORMONAL WORKUP')
            : (isEs ? 'DIRECTIVAS PREVENTIVAS DE SALUD METABÓLICA' : 'PRECAUTIONARY METABOLIC DIRECTIVES')
        ),
      ]),
      h('div', { class: 'metabolic-eval-flags-list' },
        evalResult.flags.map((flag) => {
          return h('div', { class: 'metabolic-flag-item' }, [
            h('h4', { class: 'metabolic-flag-title' }, isEs ? flag.titleEs : flag.titleEn),
            h('p', { class: 'metabolic-flag-desc' }, isEs ? flag.descEs : flag.descEn),
          ]);
        })
      ),
    ]);
    panel.appendChild(resultsContainer);
  }

  // Panel 3: Rules
  function renderRulesPanel(panel, isEs) {
    const intro = h('div', { class: 'metabolic-panel-intro' }, [
      h('h2', {}, isEs ? 'Directivas de Seguridad Metabólica y Reducción de Daños de Campo' : 'Field Metabolic Safety & Harm Reduction Directives'),
      h('p', {}, isEs
        ? 'Seis reglas clínicas fundamentales para prevenir la muerte por cetoacidosis alcohólica, hipoglucemia enmascarada, fallo suprarrenal y CAD euglucémica.'
        : 'Six essential clinical directives to prevent fatal outcomes from alcoholic ketoacidosis, masked hypoglycemia, adrenal crisis, and euglycemic DKA.'),
    ]);
    panel.appendChild(intro);

    const rulesList = h('div', { class: 'metabolic-directives-grid' },
      METABOLIC_HARM_REDUCTION_RULES.map((rule) => {
        return h('article', { class: 'metabolic-directive-card' }, [
          h('div', { class: 'metabolic-directive-num' }, `0${rule.ruleNum}`),
          h('h3', { class: 'metabolic-directive-title' }, isEs ? rule.titleEs : rule.titleEn),
          h('p', { class: 'metabolic-directive-text' }, isEs ? rule.detailEs : rule.detailEn),
        ]);
      })
    );
    panel.appendChild(rulesList);
  }

  // Panel 4: SBAR Note
  function renderSbarPanel(panel, state, isEs) {
    const intro = h('div', { class: 'metabolic-panel-intro' }, [
      h('h2', {}, isEs ? 'Generador de Traspaso Clínico SBAR (Zero-PII)' : 'Zero-PII SBAR Clinical Handoff Note Generator'),
      h('p', {}, isEs
        ? 'Genere una nota clínica estructurada en formato SBAR (Situación, Antecedentes, Evaluación, Recomendación) para Endocrinología, Urgencias y Medicina Intensiva. 100% en memoria RAM.'
        : 'Generate a structured SBAR clinical handoff note (Situation, Background, Assessment, Recommendation) for Endocrinology, Emergency Medicine, and Critical Care. Stored 100% in ephemeral RAM.'),
    ]);
    panel.appendChild(intro);

    const sbarText = formatMetabolicSbarText(state, isEs ? 'es' : 'en');

    const copyBtn = h('button', {
      type: 'button',
      class: 'metabolic-copy-btn',
    }, [
      icon(state.sbarCopied ? 'check' : 'copy', { class: 'metabolic-btn-icon' }),
      h('span', {}, state.sbarCopied
        ? (isEs ? '¡Copiado al Portapapeles!' : 'Copied to Clipboard!')
        : (isEs ? 'Copiar Informe SBAR' : 'Copy SBAR Note')
      ),
    ]);

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sbarText);
        setMetabolicState({ sbarCopied: true });
        setTimeout(() => setMetabolicState({ sbarCopied: false }), 2500);
      } catch (err) {
        console.error('Failed to copy SBAR text:', err);
      }
    });

    const actionContainer = h('div', { class: 'metabolic-sbar-actions' }, [copyBtn]);
    panel.appendChild(actionContainer);

    const sbarBox = h('pre', { class: 'metabolic-sbar-output', 'aria-label': 'SBAR Clinical Output' }, sbarText);
    panel.appendChild(sbarBox);
  }

  render();
  const unsubscribe = subscribeMetabolicState(render);

  return container;
}
