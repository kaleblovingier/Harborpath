// public/js/views/neurologyCare.js
// HarborPath - Neurological Health, Post-Overdose Brain Injury, PRES, Toxic Leukoencephalopathy & Osmotic Demyelination Navigator
// Clinical Consensus: American Academy of Neurology (AAN) Guidelines for Coma, Anoxic Brain Injury & Encephalopathy,
// Neurocritical Care Society (NCS) Guidelines for Status Epilepticus & Posterior Reversible Encephalopathy Syndrome (PRES),
// European Federation of Neurological Societies (EFNS) Wernicke Encephalopathy Diagnosis and Treatment Guidelines,
// American Association of Neurological Surgeons (AANS) Hypoxic-Ischemic Brain Injury Protocols.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: SUBSTANCE-INDUCED NEUROLOGICAL PATHOLOGY
// ============================================================================

export const NEUROLOGY_SYNDROME_PROFILES = Object.freeze({
  hieDphl: Object.freeze({
    id: 'hie_dphl',
    nameEn: 'Hypoxic-Ischemic Encephalopathy (HIE) & Delayed Post-Hypoxic Leukoencephalopathy (DPHL)',
    nameEs: 'Encefalopatía Hipóxico-Isquémica (EHI) y Leucoencefalopatía Pothipóxica Tardía (LPHT)',
    pathophysiologyEn: 'Prolonged respiratory depression (SpO2 < 70%, agonal breathing, or apnea > 3–5 min) during overdose deprives high-metabolic cerebral regions of oxygen. Primary injury targets the cerebral cortex (laminar necrosis), hippocampus (CA1 Sommer sector - acute anterograde amnesia), Purkinje cells of the cerebellum (ataxia), and basal ganglia (bilateral globus pallidus and putamen infarction - acute parkinsonism). Biphasic Delayed Post-Hypoxic Leukoencephalopathy (DPHL) occurs after apparent initial recovery: following a lucid interval of 2 to 40 days, patients develop insidious, catastrophic demyelination of cerebral hemispheric white matter due to delayed oligodendrocyte apoptosis.',
    pathophysiologyEs: 'La depresión respiratoria prolongada priva de oxígeno a zonas metabólicamente vulnerables: corteza cerebral, hipocampo (amnesia retrógrada/anterógrada), células de Purkinje (ataxia) y ganglios basales (infarto de globo pálido y parkinsonismo). La forma bifásica tardía (LPHT) surge tras un intervalo lúcido de 2 a 40 días, con desmielinización cerebral catastrófica por apoptosis oligodendrocítica tardía.',
    clinicalPresentationEn: 'ACUTE HIE: Coma, decorticate/decerebrate posturing, diffuse myoclonus, seizures, and acute delirium. DPHL BIPHASIC WARNING: Patient wakes up from overdose, appears to recover, and is discharged. Then, 1–6 weeks later, they experience progressive apathy, mutism, catastrophic cognitive decline, extrapyramidal rigidity (lead-pipe rigidity, tremors), gait apraxia, and urinary incontinence. CLINICAL MANDATE: Recognize DPHL as an organic post-anoxic myelinopathy, NOT psychiatric malingering or new substance intoxication. Supportive care, amantadine, and high-dose antioxidants (CoQ10, vitamins C/E).',
    clinicalPresentationEs: 'EHI AGUDA: Coma, posturas patológicas, mioclonías difusas y delirio. ALERTA DE LPHT BIFÁSICA: El paciente sobrevive a la sobredosis, parece recuperarse y recibe el alta. Entre 1 y 6 semanas después, cae en apatía progresiva, mutismo, deterioro cognitivo grave, rigidez extrapiramidal y apraxia de la marcha. MANEJO: Reconocer como mielinopatía orgánica postanóxica y no atribuir a causas psiquiátricas.',
  }),

  toxicLeuko: Object.freeze({
    id: 'toxic_leuko',
    nameEn: 'Toxic Leukoencephalopathy ("Chasing the Dragon" / Inhalation Leukoencephalopathy)',
    nameEs: 'Leucoencefalopatía Tóxica ("Persiguiendo al Dragón" / Leucoencefalopatía Inhalatoria)',
    pathophysiologyEn: 'Caused by inhaling heated vapors of heroin or synthetic opioids volatilized from aluminum foil ("chasing the dragon"), or lipophilic neurotoxic adulterants. Thermal volatilization creates lipophilic toxins that cross the blood-brain barrier and selectively attack oligodendrocytes and myelin sheaths, producing extensive, symmetric spongiform vacuolization (vacuolar degeneration) of cerebral and cerebellar white matter with strict preservation of the overlying cerebral cortex and axons.',
    pathophysiologyEs: 'Causada por la inhalación de vapores calentados de heroína o fentanilo sobre papel de aluminio ("chasing the dragon") o adulterantes lipofílicos neurotóxicos. Provoca degeneración vacuolar espongiforme simétrica de la sustancia blanca cerebral y cerebelosa, respetando la corteza gris.',
    clinicalPresentationEn: 'PROGRESSIVE TRIAD: 1) Initial Cerebellar Stage: Motor ataxia, wide-based staggering gait, scanning dysarthria (slurred speech), and pseudobulbar affect (uncontrollable crying or laughing); 2) Intermediate Extrapyramidal Stage: Spastic quadriparesis, brisk hyperreflexia, bilateral Babinski signs, and choreoathetosis; 3) Terminal Akinetic Stage: Akinetic mutism, central pyrexia (hyperthermia without infection), hypotonic stupor, and respiratory arrest. TREATMENT: Immediate cessation of vapor inhalation, high-dose Coenzyme Q10 (300–600 mg/day), Vitamin C (1–2 g/day), Vitamin E (800–1200 IU/day), and aggressive neuro-rehabilitation.',
    clinicalPresentationEs: 'TRÍADA PROGRESIVA: 1) Fase cerebelosa: Ataxia motora, marcha inestable, disartria y labilidad emocional pseudobulbar (risa/llanto involuntario); 2) Fase extrapiramidal: Cuadriparesia espástica, hiperreflexia, signo de Babinski y coreoatetosis; 3) Fase terminal: Mutismo acinético, hipertermia central y fallo respiratorio. MANEJO: Cese inmediato de inhalación, dosis altas de Coenzima Q10, vitaminas C/E y rehabilitación.',
  }),

  presSyndrome: Object.freeze({
    id: 'pres_syndrome',
    nameEn: 'Posterior Reversible Encephalopathy Syndrome (PRES)',
    nameEs: 'Síndrome de Encefalopatía Posterior Reversible (SEPR)',
    pathophysiologyEn: 'Acute sympathomimetic surge from cocaine, amphetamines, methamphetamine, or synthetic cathinones produces severe paroxysmal hypertension that rapidly exceeds the myogenic autoregulatory capacity of cerebral arterioles (Mean Arterial Pressure > 140–150 mmHg). Because posterior cerebral circulation (parieto-occipital regions) has significantly sparser sympathetic adrenergic perivascular innervation compared to the anterior circulation, posterior capillary beds undergo autoregulatory breakthrough, endothelial dysfunction, and transudation of fluid into white matter (vasogenic cerebral edema).',
    pathophysiologyEs: 'El pico adrenérgico por cocaína, metanfetamina o sales de baño genera hipertensión aguda que supera la autorregulación cerebral (PAM > 140–150 mmHg). Como la circulación posterior parieto-occipital tiene menor inervación simpática, se produce fuga capilar y edema vasogénico en la sustancia blanca posterior.',
    clinicalPresentationEn: 'CLASSICAL TETRAD: Acute pounding headache, fluctuating encephalopathy/altered mental status, visual disturbances (blurring, homonymous hemianopsia, visual hallucinations, progressing to cortical blindness [Anton syndrome]), and generalized tonic-clonic seizures. CARDINAL HEMODYNAMIC RULE: Lower blood pressure smoothly and cautiously! Target a 15% to 25% reduction in Mean Arterial Pressure (MAP) over the first 1–2 hours using IV titratable agents (nicardipine infusion 5–15 mg/h or labetalol 10–20 mg IV boluses). Precipitous drops in BP precipitate catastrophic watershed cerebral infarction.',
    clinicalPresentationEs: 'TÉTRADA CLÁSICA: Cefalea opresiva intensa, confusión fluctuante, alteraciones visuales (visión borrosa, ceguera cortical de Anton) y convulsiones tónico-clónicas. REGLA HEMODINÁMICA CARDINAL: ¡Reducir la presión arterial de forma suave y controlada! Bajar la PAM un 15% a 25% en las primeras 1–2 horas con nicardipino o labetalol IV. Una bajada brusca de tensión provoca infarto cerebral isquémico.',
  }),

  odsHyponatremia: Object.freeze({
    id: 'ods_hyponatremia',
    nameEn: 'Osmotic Demyelination Syndrome (ODS / Central Pontine Myelinolysis) & Severe Hyponatremia',
    nameEs: 'Síndrome de Desmielinización Osmótica (SDO / Mielinolisis Pontina Central) e Hiponatremia Grave',
    pathophysiologyEn: 'Severe chronic hyponatremia (serum Na+ < 120 mEq/L) occurs commonly in chronic heavy alcohol consumption ("beer potomania" due to severe solute malnutrition and free water excess) and in MDMA/Ecstasy use (MDMA-induced non-osmotic SIADH secretion + vigorous tap water drinking due to hyperthermic polydipsia). In response to chronic low serum osmolarity, astrocytes expel organic osmolytes (myoinositol, taurine, glutamate) to prevent cerebral edema.',
    pathophysiologyEs: 'La hiponatremia crónica grave (Na+ < 120 mEq/L) es frecuente en el alcoholismo ("potomanía de cerveza" por nulo aporte de solutos y exceso de agua) y en el consumo de MDMA/éxtasis (SIADH inducido por MDMA + ingesta masiva de agua corriente). Los astrocitos expulsan solutos orgánicos para no hincharse.',
    clinicalPresentationEn: 'THE CARDINAL 8 mEq/L/24hr CORRECTION RULE: If chronic hyponatremia is corrected too rapidly (> 8–10 mEq/L in 24 hours or > 18 mEq/L in 48 hours; in malnourished alcohol users: > 6–8 mEq/L in 24 hours), brain cells cannot re-synthesize intracellular osmolytes quickly enough. The resulting hypertonic stress causes rapid astrocyte dehydration, blood-brain barrier disruption, and oligodendrocyte apoptosis, producing central pontine demyelination. CLINICAL DISASTER: The patient initially improves from hyponatremic encephalopathy, but 2 to 6 days later develops catastrophic "Locked-In Syndrome" (spastic quadriplegia, pseudobulbar palsy, inability to speak or swallow, with preserved vertical eye movements and consciousness). EMERGENCY RESCUE: If overcorrection occurs, immediately infuse D5W and administer desmopressin (DDAVP 1–2 mcg) to re-lower serum sodium back into safe limits.',
    clinicalPresentationEs: 'REGLA CARDINAL DE LOS 8 mEq/L/24h: Si se corrige el sodio demasiado rápido (> 8–10 mEq/L en 24h, o > 6–8 mEq/L en personas desnutridas), las células cerebrales se deshidratan bruscamente, provocando muerte celular en la protuberancia. DESASTRE CLÍNICO: El paciente mejora 2 días, pero entre el día 2 y 6 sufre "Síndrome de Cautiverio" (tetraplejía espástica, anartria, con plena consciencia y solo movimiento ocular vertical). RESCATE: Si se sobrecorrige el sodio, infundir SG 5% y desmopresina (DDAVP) para rebajar el sodio de inmediato.',
  }),

  wernickeKorsakoff: Object.freeze({
    id: 'wernicke_korsakoff',
    nameEn: 'Wernicke Encephalopathy & Korsakoff Syndrome (Caine Criteria & Thiamine Emergency)',
    nameEs: 'Encefalopatía de Wernicke y Síndrome de Korsakoff (Criterios de Caine y Urgencia de Tiamina)',
    pathophysiologyEn: 'Severe thiamine (Vitamin B1) deficiency resulting from chronic alcohol misuse, malnutrition, and impaired intestinal thiamine transport. Thiamine pyrophosphate (TPP) is an essential cofactor for pyruvate dehydrogenase, alpha-ketoglutarate dehydrogenase, and transketolase in cerebral glucose metabolism. Thiamine depletion leads to rapid mitochondrial failure, astrocyte glutamate transporter down-regulation, localized lactic acidosis, and petechial hemorrhagic necrosis of mammillary bodies, dorsomedial thalamus, and periaqueductal gray.',
    pathophysiologyEs: 'Deficiencia crítica de tiamina (Vitamina B1) por alcoholismo crónico y desnutrición. El pirofosfato de tiamina es cofactor indispensable para metabolizar la glucosa cerebral. Su déficit desencadena acidosis láctica focal y necrosis hemorrágica irreversible en los cuerpos mamilares y el tálamo.',
    clinicalPresentationEn: 'VALIDATED CAINE CRITERIA: The classic triad (confusion + ataxia + ophthalmoplegia) occurs in < 16% of cases! The EFNS/Caine Criteria require at least 2 of 4 signs: 1) Dietary deficiency / severe malnutrition; 2) Oculomotor abnormalities (nystagmus, bilateral lateral rectus / abducens palsy, conjugate gaze palsy); 3) Cerebellar dysfunction (ataxia, wide-based gait); 4) Altered mental state or mild memory deficit. CARDINAL LIFE-SAVING RULE: ALWAYS administer high-dose parenteral thiamine (500 mg IV TID for 3–5 days) BEFORE or concurrently with any intravenous dextrose/glucose solution! Infusing glucose without thiamine burns through residual thiamine cofactors in glycolysis, precipitating acute fatal brainstem necrosis.',
    clinicalPresentationEs: 'CRITERIOS DE CAINE: ¡La tríada clásica solo aparece en el 16% de los pacientes! Los criterios exigen 2 de 4 signos: 1) Desnutrición/déficit dietético; 2) Anomalías oculomotoras (nistagmo, parálisis del VI par); 3) Ataxia cerebelosa; 4) Estado mental alterado o amnesia. REGLA VITAL: ¡ADMINISTRAR SIEMPRE TIAMINA EN ALTAS DOSIS (500 mg IV cada 8h) ANTES DE CUALQUIER SUERO GLUCOSADO! Dar glucosa sin tiamina agota las reservas enzimáticas y precipita la muerte cerebral.',
  }),
});

// ============================================================================
// VALIDATED CAINE CRITERIA FOR WERNICKE ENCEPHALOPATHY
// ============================================================================

export const CAINE_WERNICKE_CRITERIA = Object.freeze([
  {
    id: 'dietary_deficiency',
    labelEn: 'Dietary Deficiency / Severe Malnutrition / Chronic Alcohol Use Disorder',
    labelEs: 'Déficit Dietético / Desnutrición Grave / Trastorno por Consumo de Alcohol Crónico',
    descriptionEn: 'BMI < 18.5, recent involuntary weight loss > 10%, prolonged anorexia, or severe alcohol dependence.',
    descriptionEs: 'IMC < 18.5, pérdida involuntaria de peso > 10%, anorexia prolongada o alcoholismo crónico severo.',
  },
  {
    id: 'oculomotor_abnormality',
    labelEn: 'Oculomotor Abnormalities (Nystagmus, Lateral Rectus / VI Nerve Palsy, Conjugate Gaze Deficit)',
    labelEs: 'Anomalías Oculomotoras (Nistagmo, Parálisis del VI Par / Recto Externo, Parálisis de Mirada)',
    descriptionEn: 'Horizontal or vertical nystagmus, inability to abduct eye laterally, or bilateral ophthalmoplegia.',
    descriptionEs: 'Nistagmo horizontal/vertical, incapacidad para abducir el ojo (parálisis del VI par craneal) u oftalmoplejía.',
  },
  {
    id: 'cerebellar_dysfunction',
    labelEn: 'Cerebellar Dysfunction (Truncal Ataxia, Wide-Based Unsteady Gait, Dysmetria)',
    labelEs: 'Disfunción Cerebelosa (Ataxia de Tronco, Marcha Inestable de Base Ancha, Dismetría)',
    descriptionEn: 'Inability to perform tandem gait, wide stance walking, titubation, or prominent limb dysmetria.',
    descriptionEs: 'Imposibilidad de caminar en tándem, marcha oscilante de base ancha o dismetría evidente.',
  },
  {
    id: 'altered_mental_state',
    labelEn: 'Altered Mental State, Confusion, Mild Memory Impairment, or Apathy',
    labelEs: 'Estado Mental Alterado, Confusión, Pérdida de Memoria Leve o Apatía',
    descriptionEn: 'Global confusion, slow cognitive processing, temporal disorientation, or prominent apathy.',
    descriptionEs: 'Confusión global, bradipsiquia, desorientación temporoespacial o apatía marcada.',
  },
]);

// ============================================================================
// HARM REDUCTION DIRECTIVES & FIELD NEUROPROTECTION
// ============================================================================

export const NEUROLOGY_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Rescue Breathing Over Repeated Naloxone (Brain Needs Oxygen to Prevent Necrosis)',
    titleEs: 'Respiración de Rescate Antes que Más Naloxona (El Cerebro Necesita Oxígeno Inmediato)',
    detailEn: 'Irreversible cortical and basal ganglia necrosis begins within 3–4 minutes of cerebral hypoxia. While naloxone displaces opioids from receptors, rescue breathing (1 breath every 5 seconds / 12 bpm) immediately re-oxygenates brain tissue. Do not waste precious minutes giving excessive naloxone doses while the brain is suffocating—breathe for them!',
    detailEs: 'La necrosis neuronal irreversible comienza tras 3–4 minutos sin oxígeno. La naloxona libera receptores, pero la respiración asistida (1 insuflación cada 5 segundos) oxigena de inmediato el tejido cerebral. No gaste minutos críticos administrando dosis excesivas de naloxona sin ventilar.',
  },
  {
    ruleNum: 2,
    titleEn: 'Watch for Delayed Post-Hypoxic Relapse (DPHL - 2 to 40 Days Post-Overdose)',
    titleEs: 'Vigilar la Recaída Hipóxica Tardía (LPHT: 2 a 40 Días Tras la Sobredosis)',
    detailEn: 'Overdose survivors who awake normally can experience sudden, catastrophic apathy, memory loss, and severe muscle stiffness weeks later (DPHL). Inform patients and families: if unusual confusion, slowing, or walking trouble develops 1 to 6 weeks after an overdose, seek urgent neurology evaluation immediately—it is a recognized post-anoxic injury, not psychiatric.',
    detailEs: 'Quienes sobreviven a una sobredosis y despiertan bien pueden sufrir semanas después apatía grave, pérdida de memoria y rigidez muscular (LPHT). Avise a familiares: si aparecen problemas para caminar o confusión entre 1 y 6 semanas tras la sobredosis, acuda a neurología de inmediato.',
  },
  {
    ruleNum: 3,
    titleEn: 'High-Dose IV Thiamine BEFORE Glucose (Prevent Fatal Brainstem Necrosis)',
    titleEs: 'Tiamina IV en Altas Dosis ANTES de Glucosa (Evitar Necrosis del Tronco Encefálico)',
    detailEn: 'In individuals with chronic alcohol use or malnutrition, never administer intravenous dextrose (or "banana bags") without immediate high-dose IV thiamine (500 mg IV). Glucose infusion without thiamine triggers rapid lactic acidosis and acute hemorrhagic necrosis of mammillary bodies and brainstem nuclei.',
    detailEs: 'En personas con alcoholismo crónico o desnutrición, jamás infunda suero glucosado sin administrar antes tiamina en altas dosis (500 mg IV). La glucosa sin tiamina quema los cofactores residuales y desencadena necrosis hemorrágica irreversible en el encéfalo.',
  },
  {
    ruleNum: 4,
    titleEn: 'The 8 mEq/L/24hr Hyponatremia Rule: Slow Sodium Correction to Prevent Locked-In ODS',
    titleEs: 'Regla de los 8 mEq/L/24h en Hiponatremia: Corrección Lenta para Evitar Síndrome de Cautiverio',
    detailEn: 'When managing severe low sodium (common in heavy beer drinking or MDMA water toxicity), raising sodium too quickly causes pontine glial cells to shrivel and die, producing permanent quadriplegia where only vertical eye movements remain (Locked-In Syndrome). Maximum safe rate is 8 mEq/L in 24 hours (6–8 mEq/L in malnutrition).',
    detailEs: 'En hiponatremias graves por consumo de cerveza o éxtasis, subir el sodio con demasiada rapidez deshidrata los astrocitos pontinos, causando parálisis permanente donde solo se pueden mover los ojos hacia arriba (Síndrome de Cautiverio). La subida máxima segura es 8 mEq/L en 24 horas.',
  },
  {
    ruleNum: 5,
    titleEn: 'Controlled Blood Pressure Lowering in Stimulant PRES (Avoid Watershed Stroke)',
    titleEs: 'Descenso Tensional Suave en SEPR por Estimulantes (Evitar Infarto Cerebral Isquémico)',
    detailEn: 'When severe headache, visual loss, or seizures develop after stimulant use (PRES), blood pressure must be reduced carefully and smoothly (15–25% reduction in Mean Arterial Pressure over the first 1–2 hours using IV nicardipine or labetalol). Dropping blood pressure precipitously induces catastrophic ischemic cerebral infarction.',
    detailEs: 'Ante cefaleas agudas, ceguera transitoria o convulsiones tras consumir estimulantes (SEPR), la tensión arterial debe reducirse de forma gradual (bajar la PAM un 15–25% en 1–2 horas con nicardipino o labetalol). Una bajada brusca provoca infartos cerebrales en zonas frontera.',
  },
  {
    ruleNum: 6,
    titleEn: 'Safer Inhalation & Early CoQ10 in "Chasing the Dragon" Leukoencephalopathy',
    titleEs: 'Inhalación Segura y Coenzima Q10 Precoz en Leucoencefalopatía por Vapores',
    detailEn: 'Inhaling heated heroin or fentanyl vapors off foil can destroy brain white matter, leading to slurred speech, clumsy walking, and crying/laughing spells. Immediately stop vapor inhalation, seek emergency neurology care, and ask your medical team about high-dose antioxidant therapy (Coenzyme Q10 and vitamins C/E).',
    detailEs: 'Inhalar vapores de heroína o fentanilo calentados sobre aluminio destruye la sustancia blanca cerebral, provocando habla arrastrada, marcha torpe y llanto/risa involuntarios. Suspenda de inmediato la inhalación, acuda a neurología y consulte por dosis altas de Coenzima Q10 y antioxidantes.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO PERSISTENT STORAGE)
// ============================================================================

let neurologyState = {
  activeTab: 'syndromes', // 'syndromes' | 'evaluator' | 'wernicke' | 'directives' | 'sbar'
  anoxicDownTime: false,
  persistentApneaHypoxemia: false,
  delayedRelapseCognitive: false,
  focalDeficitOrStroke: false,
  seizuresOrStatus: false,
  corticalBlindnessPres: false,
  lockedInSigns: false,
  caineCriteriaMet: false,
  chasingDragonAtaxia: false,
  mdmaHyponatremiaWater: false,
  severeHeadacheHypertension: false,
  sbarCopied: false,
};

const listeners = new Set();

export function getNeurologyState() {
  return { ...neurologyState };
}

export function setNeurologyState(patch) {
  neurologyState = { ...neurologyState, ...patch };
  listeners.forEach((fn) => {
    try {
      fn(neurologyState);
    } catch (e) {
      console.error('neurologyCare state listener error:', e);
    }
  });
}

export function resetNeurologyState() {
  neurologyState = {
    activeTab: 'syndromes',
    anoxicDownTime: false,
    persistentApneaHypoxemia: false,
    delayedRelapseCognitive: false,
    focalDeficitOrStroke: false,
    seizuresOrStatus: false,
    corticalBlindnessPres: false,
    lockedInSigns: false,
    caineCriteriaMet: false,
    chasingDragonAtaxia: false,
    mdmaHyponatremiaWater: false,
    severeHeadacheHypertension: false,
    sbarCopied: false,
  };
  listeners.forEach((fn) => {
    try {
      fn(neurologyState);
    } catch (e) {
      console.error('neurologyCare reset listener error:', e);
    }
  });
}

export function subscribeNeurologyState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ============================================================================
// CLINICAL DECISION SUPPORT ALGORITHM: NEUROLOGY RISK EVALUATION
// ============================================================================

export function evaluateNeurologyRisk(state) {
  const flags = [];
  let urgency = 'precautionary'; // 'emergency_911' | 'urgent_eval' | 'specialty_consult' | 'precautionary'

  // Tier 1: Immediate Life-Threatening Neurological Emergencies (Call 911 / Neurocritical Care)
  if (state.seizuresOrStatus) {
    urgency = 'emergency_911';
    flags.push({
      priority: 1,
      titleEn: 'Status Epilepticus / Recurrent Seizures: Emergent Airway & Neuroprotection',
      titleEs: 'Estado Epiléptico / Convulsiones Recurrentes: Vía Aérea y Neuroprotección Inmediata',
      descEn: 'Active or continuous seizure activity exceeding 5 minutes, or recurrent seizures without regaining consciousness between episodes. High risk of hyperthermia, rhabdomyolysis, and excitotoxic cerebral necrosis. Administer IV benzodiazepines (lorazepam 4 mg IV or midazolam 10 mg IM) immediately, secure airway, and call 911.',
      descEs: 'Crisis convulsivas activas de más de 5 minutos o recurrentes sin recuperar la consciencia. Riesgo elevado de hipertermia, rabdomiólisis y muerte neuronal excitotóxica. Administrar benzodiacepinas IV/IM de inmediato, asegurar vía aérea y activar 911.',
    });
  }

  if (state.lockedInSigns) {
    urgency = 'emergency_911';
    flags.push({
      priority: 1,
      titleEn: 'Suspected Osmotic Demyelination Syndrome (ODS) / "Locked-In" State',
      titleEs: 'Sospecha de Síndrome de Desmielinización Osmótica (SDO) / Estado de Cautiverio',
      descEn: 'Severe spastic quadriplegia and mutism with intact vertical eye movements following rapid correction of hyponatremia. Emergent neurocritical consultation required. If overcorrection occurred within the past 24–48 hours, emergent re-lowering with D5W and desmopressin (DDAVP) may reverse pontine myelin destruction.',
      descEs: 'Cuadriplejía espástica y mutismo con conservación de movimientos oculares verticales tras corrección rápida de sodio. Requiere interconsulta urgente con neurocríticos. Si hubo sobrecorrección en 24–48h, re-descender el sodio con SG 5% y desmopresina (DDAVP).',
    });
  }

  if (state.corticalBlindnessPres) {
    urgency = 'emergency_911';
    flags.push({
      priority: 2,
      titleEn: 'Suspected Posterior Reversible Encephalopathy Syndrome (PRES) with Visual Loss',
      titleEs: 'Sospecha de Síndrome de Encefalopatía Posterior Reversible (SEPR) con Pérdida Visual',
      descEn: 'Acute severe headache, cortical blindness, and severe hypertension following stimulant use. Vasogenic parietal-occipital edema verified on brain MRI. Mandates immediate transfer to ICU, continuous arterial line monitoring, and gradual BP reduction (15–25% MAP reduction in first 1–2 hours with nicardipine or labetalol). Avoid sudden precipitous hypotension.',
      descEs: 'Cefalea intensa, ceguera cortical e hipertensión grave tras consumo de estimulantes. Edema vasogénico parieto-occipital en RM cerebral. Traslado a UCI, monitorización invasiva y reducción tensional controlada (15–25% de la PAM en 1–2 horas con nicardipino o labetalol).',
    });
  }

  if (state.focalDeficitOrStroke) {
    urgency = 'emergency_911';
    flags.push({
      priority: 2,
      titleEn: 'Acute Focal Neurological Deficit: Suspected Stroke / Septic Embolus',
      titleEs: 'Déficit Neurológico Focal Agudo: Sospecha de Ictus Isquémico / Émbolo Séptico',
      descEn: 'Unilateral weakness, facial droop, sudden aphasia, or hemisensory loss. In injection drug use, suspect septic emboli from infective endocarditis; in stimulant use, suspect vasospastic ischemic stroke or intracranial hemorrhage. Time-sensitive emergency: immediate non-contrast head CT and stroke code activation.',
      descEs: 'Pérdida de fuerza unilateral, asimetría facial o afasia brusca. En consumo inyectado, sospechar émbolo séptico por endocarditis; en estimulantes, ictus vasoespástico o hemorragia. Activar código ictus y TC craneal urgente.',
    });
  }

  if (state.persistentApneaHypoxemia || state.anoxicDownTime) {
    if (urgency !== 'emergency_911') urgency = 'emergency_911';
    flags.push({
      priority: 3,
      titleEn: 'Acute Post-Overdose Anoxic Brain Injury Risk (Hypoxic-Ischemic Encephalopathy)',
      titleEs: 'Riesgo de Lesión Cerebral Anóxica Post-Sobredosis (Encefalopatía Hipóxico-Isquémica)',
      descEn: 'Prolonged downtime without ventilation induces acute cerebral edema and basal ganglia ischemia. Prioritize continuous supplemental oxygen, maintain normocapnia (avoid severe hyperventilation), prevent hyperthermia (keep core temp < 37.5°C to limit excitotoxicity), and transfer to hospital for formal neurological assessment.',
      descEs: 'La apnea prolongada produce edema cerebral e isquemia de ganglios basales. Priorizar oxigenación continua, normocapnia, control estricto de temperatura (< 37.5°C para evitar excitotoxicidad) y evaluación neurológica hospitalaria formal.',
    });
  }

  // Tier 2: Urgent Evaluation & Antidote/Replacement Therapy
  if (state.caineCriteriaMet) {
    if (urgency !== 'emergency_911') urgency = 'urgent_eval';
    flags.push({
      priority: 4,
      titleEn: 'Positive Caine Criteria for Wernicke Encephalopathy: Thiamine Emergency',
      titleEs: 'Criterios de Caine Positivos para Encefalopatía de Wernicke: Urgencia de Tiamina',
      descEn: 'Patient presents with at least 2 of 4 Caine criteria (malnutrition/alcohol use + ataxia + oculomotor abnormalities + altered mental state). Immediate mandate: Parenteral Thiamine 500 mg IV infused over 30 minutes TID for 3–5 days BEFORE administering any intravenous glucose/dextrose solutions. Oral thiamine is completely inadequate due to malabsorption.',
      descEs: 'Cumple al menos 2 de 4 criterios de Caine (desnutrición/alcohol + ataxia + anomalías oculares + confusión). Mandato vital: Tiamina parenteral 500 mg IV cada 8 horas durante 3–5 días ANTES de cualquier suero glucosado. La tiamina oral es insuficiente por malabsorción intestinal.',
    });
  }

  if (state.mdmaHyponatremiaWater) {
    if (urgency !== 'emergency_911') urgency = 'urgent_eval';
    flags.push({
      priority: 4,
      titleEn: 'MDMA-Induced Acute Hyponatremia & Cerebral Edema Alert',
      titleEs: 'Alerta de Hiponatremia Aguda y Edema Cerebral Inducido por MDMA',
      descEn: 'MDMA use combined with excessive free-water intake and non-osmotic vasopressin release causes acute hyponatremic encephalopathy with cerebral herniation risk. Mandates urgent stat serum electrolytes. If symptomatic with seizures or altered mental status, treat acutely with 3% Hypertonic Saline (100–150 mL bolus over 10 min), but respect the strict 8 mEq/L/24hr maximum correction limit.',
      descEs: 'MDMA con consumo masivo de agua y secreción de vasopresina provoca hiponatremia aguda con riesgo de herniación cerebral. Requiere analítica urgente. Si hay convulsiones o estupor, usar suero salino hipertónico al 3% (bolo de 100–150 mL en 10 min), respetando el límite estricto de 8 mEq/L/24h.',
    });
  }

  if (state.delayedRelapseCognitive) {
    if (urgency !== 'emergency_911') urgency = 'urgent_eval';
    flags.push({
      priority: 5,
      titleEn: 'Delayed Post-Hypoxic Leukoencephalopathy (DPHL) Suspected',
      titleEs: 'Sospecha de Leucoencefalopatía Pothipóxica Tardía (LPHT)',
      descEn: 'New-onset insidious cognitive decline, progressive apathy, mutism, or parkinsonian rigidity occurring 1 to 6 weeks after an overdose resuscitation. Brain MRI demonstrates diffuse, symmetric confluent T2/FLAIR hyperintensities in cerebral white matter. Mandates urgent neurology consultation, exclusion of carbon monoxide toxicity or encephalitis, and supportive neuro-rehabilitation.',
      descEs: 'Deterioro cognitivo insidioso, apatía progresiva, mutismo o rigidez parkinsoniana surgidos entre 1 y 6 semanas tras una sobredosis. La RM craneal muestra hiperintensidades bilaterales en sustancia blanca. Requiere interconsulta urgente con neurología y rehabilitación.',
    });
  }

  if (state.severeHeadacheHypertension) {
    if (urgency !== 'emergency_911') urgency = 'urgent_eval';
    flags.push({
      priority: 5,
      titleEn: 'Hypertensive Encephalopathy / Early PRES Warning',
      titleEs: 'Alerta de Encefalopatía Hipertensiva / SEPR Incipiente',
      descEn: 'Severe thunderclap headache with extreme blood pressure elevations post-stimulant use. High risk of progression to PRES, intracranial hemorrhage, or hypertensive retinopathy. Initiate quiet environment, calm sedation with benzodiazepines, and gradual BP lowering.',
      descEs: 'Cefalea intensa con cifras tensionales muy elevadas tras consumir estimulantes. Alto riesgo de evolucionar a SEPR o hemorragia intracraneal. Ambiente tranquilo, sedación con benzodiacepinas y descenso gradual de la presión arterial.',
    });
  }

  // Tier 3: Subacute / Specialty Consult
  if (state.chasingDragonAtaxia) {
    if (urgency === 'precautionary') urgency = 'specialty_consult';
    flags.push({
      priority: 6,
      titleEn: 'Inhalation Toxic Leukoencephalopathy ("Chasing the Dragon")',
      titleEs: 'Leucoencefalopatía Tóxica Inhalatoria ("Chasing the Dragon")',
      descEn: 'Progressive motor ataxia, scanning speech, and pseudobulbar affect in a patient who inhales heated drug vapors. Prompt MRI and outpatient or inpatient neurology workup. Immediately cease all heated foil inhalation and initiate high-dose antioxidant regimen with Coenzyme Q10 and vitamins.',
      descEs: 'Ataxia progresiva, habla disártrica y labilidad pseudobulbar en usuario de vapores inhalados. Requiere RM y valoración neurológica. Suspender la inhalación sobre aluminio e iniciar tratamiento antioxidante con Coenzima Q10 y vitaminas.',
    });
  }

  if (flags.length === 0) {
    flags.push({
      priority: 7,
      titleEn: 'Baseline Neuroprotection & Field Safety Guidelines',
      titleEs: 'Neuroprotección Básica y Pautas de Seguridad de Campo',
      descEn: 'No acute life-threatening neurological flags identified. Maintain rescue breathing preparedness (1 breath every 5s), educate on the 2–40 day DPHL relapse window post-overdose, encourage electrolyte-containing fluids over plain water during MDMA use, and provide oral thiamine supplementation for chronic alcohol use.',
      descEs: 'Sin signos neurológicos agudos de riesgo vital. Mantener preparación para respiración asistida (1 insuflación cada 5s), informar sobre la ventana de recaída de 2 a 40 días de la LPHT, promover bebidas con electrolitos con MDMA y pautar tiamina en alcoholismo crónico.',
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

export function formatNeurologySbarText(state, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateNeurologyRisk(state);

  const lines = [];
  lines.push(isEs ? '=== INFORME DE TRASPASO CLÍNICO SBAR - SALUD NEUROLÓGICA (HARBORPATH) ===' : '=== SBAR CLINICAL HANDOFF NOTE - NEUROLOGICAL CARE (HARBORPATH) ===');
  lines.push(isEs ? `Fecha/Hora: ${new Date().toISOString()}` : `Timestamp: ${new Date().toISOString()}`);
  lines.push(isEs ? 'Privacidad: Sin datos de identificación (Zero-PII) - Evaluado en memoria RAM' : 'Privacy: Zero-PII In-RAM Ephemeral Assessment');
  lines.push('');

  // Situation
  lines.push(isEs ? '[S - SITUACIÓN]' : '[S - SITUATION]');
  const urgencyLabel = isEs
    ? (evalResult.urgency === 'emergency_911' ? 'EMERGENCIA MÉDICA CRÍTICA (911 / CÓDIGO NEURO)' : evalResult.urgency === 'urgent_eval' ? 'EVALUACIÓN URGENTE / ANTÍDOTO REQUERIDO' : 'CONSULTA DE ESPECIALIDAD / PRECAUCIÓN')
    : (evalResult.urgency === 'emergency_911' ? 'CRITICAL MEDICAL EMERGENCY (911 / NEURO CODE)' : evalResult.urgency === 'urgent_eval' ? 'URGENT EVALUATION / ANTIDOTE INDICATED' : 'SPECIALTY CONSULT / PRECAUTIONARY');
  lines.push(isEs ? `Nivel de Agudeza: ${urgencyLabel}` : `Acuity Level: ${urgencyLabel}`);
  lines.push('');

  // Background
  lines.push(isEs ? '[B - ANTECEDENTES Y FACTORES CLÍNICOS]' : '[B - CLINICAL BACKGROUND & IDENTIFIED FACTORS]');
  const activeFactors = [];
  if (state.anoxicDownTime) activeFactors.push(isEs ? 'Apnea o paro cardiorrespiratorio prolongado post-sobredosis (> 3-5 min)' : 'Prolonged down time / anoxic arrest post-overdose (> 3-5 min)');
  if (state.persistentApneaHypoxemia) activeFactors.push(isEs ? 'Hipoxemia persistente o bradipnea post-reversión' : 'Persistent hypoxemia or respiratory depression post-reversal');
  if (state.delayedRelapseCognitive) activeFactors.push(isEs ? 'Recaída cognitiva, apatía o rigidez motora tardía (1 a 6 semanas post-sobredosis)' : 'Delayed apathy, cognitive relapse, or motor stiffness 1-6 weeks post-overdose (DPHL flag)');
  if (state.focalDeficitOrStroke) activeFactors.push(isEs ? 'Déficit focal agudo: debilidad unilateral, asimetría facial o afasia (código ictus)' : 'Acute focal neurological deficit: hemiparesis, facial droop, or aphasia');
  if (state.seizuresOrStatus) activeFactors.push(isEs ? 'Crisis convulsivas activas o estado epiléptico prolongado' : 'Active seizures or status epilepticus (> 5 min / recurrent)');
  if (state.corticalBlindnessPres) activeFactors.push(isEs ? 'Ceguera cortical, cefalea intensa y pico hipertensivo post-estimulantes (SEPR)' : 'Cortical blindness, severe headache, and extreme hypertension post-stimulant (PRES flag)');
  if (state.lockedInSigns) activeFactors.push(isEs ? 'Cuadriplejía espástica con preservación ocular post-corrección de hiponatremia (SDO/Cautiverio)' : 'Spastic quadriplegia with preserved vertical eye movements post-hyponatremia correction (ODS/Locked-in flag)');
  if (state.caineCriteriaMet) activeFactors.push(isEs ? 'Criterios de Caine positivos (alcoholismo/desnutrición + ataxia + alteración ocular/mental)' : 'Positive Caine criteria (malnutrition/alcohol + ataxia + oculomotor/mental deficit)');
  if (state.chasingDragonAtaxia) activeFactors.push(isEs ? 'Consumo de vapores calentados sobre aluminio + ataxia motora progresiva y disartria' : 'History of inhaling heated vapors off foil + progressive ataxia and dysarthria');
  if (state.mdmaHyponatremiaWater) activeFactors.push(isEs ? 'Consumo de MDMA con ingesta masiva de agua y sospecha de hiponatremia aguda' : 'MDMA consumption with excessive water intake and acute hyponatremia suspicion');
  if (state.severeHeadacheHypertension) activeFactors.push(isEs ? 'Cefalea opresiva intensa con hipertensión grave post-estimulantes' : 'Severe thunderclap headache with severe hypertension post-stimulant');

  if (activeFactors.length === 0) {
    lines.push(isEs ? 'Ningún factor de riesgo neurológico agudo seleccionado.' : 'No acute neurological risk factors selected.');
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
      ? '1. Activar código de emergencia 911 / Neurointensivismo de inmediato.\n2. Asegurar vía aérea y administrar oxígeno al 100%; ventilar cada 5s si hay bradipnea.\n3. En sospecha de Wernicke, TIAMINA 500 mg IV ANTES de cualquier suero glucosado.\n4. En sospecha de SEPR, descenso tensional controlado (bajar PAM 15-25% en 1-2h con nicardipino/labetalol).\n5. En hiponatremia, NUNCA sobrepasar la tasa de corrección de 8 mEq/L en 24 horas.'
      : '1. Activate 911 / Neurocritical Care Code immediately.\n2. Secure airway, provide 100% O2; ventilate 1 breath every 5s if depressed.\n3. If Wernicke suspected, infuse THIAMINE 500 mg IV BEFORE any dextrose infusion.\n4. If PRES suspected, controlled BP lowering (reduce MAP by 15-25% in 1-2h using nicardipine/labetalol).\n5. In hyponatremia, STRICTLY respect the 8 mEq/L per 24 hour correction ceiling.');
  } else if (evalResult.urgency === 'urgent_eval') {
    lines.push(isEs
      ? '1. Trasladar a servicio de urgencias para electrolitos urgentes y evaluación neurológica.\n2. Administrar tiamina parenteral 500 mg IV TID en casos de alcoholismo o sospecha de Wernicke.\n3. Realizar RM cerebral para descartar LPHT, SEPR o degeneración esponjosa.'
      : '1. Transfer to Emergency Department for stat serum electrolytes and neurology evaluation.\n2. Administer parenteral thiamine 500 mg IV TID for alcohol misuse / Wernicke suspicion.\n3. Schedule urgent brain MRI to evaluate for DPHL, PRES, or spongiform leukoencephalopathy.');
  } else {
    lines.push(isEs
      ? '1. Educación en reducción de daños: respiración asistida inmediata y no demorarse dando más naloxona.\n2. Advertir sobre el riesgo de recaída cognitiva tardía (LPHT) de 2 a 40 días tras una sobredosis.\n3. Fomentar bebidas isotónicas en fiestas con MDMA y suplementación oral con tiamina en personas con consumo crónico de alcohol.'
      : '1. Harm reduction education: prioritize rescue breathing over repeated naloxone doses.\n2. Provide DPHL warning regarding potential delayed cognitive relapse 2 to 40 days post-overdose.\n3. Advocate electrolyte fluids over tap water during MDMA use and thiamine supplementation for alcohol consumers.');
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

export function neurologyCareView() {
  const container = h('div', { class: 'neurology-care-view' });

  function render() {
    clear(container);
    const state = getNeurologyState();
    const isEs = getLang() === 'es';

    // Header Section
    const header = h('header', { class: 'neurology-header' }, [
      h('div', { class: 'neurology-title-badge' }, [
        icon('brain', { class: 'neurology-badge-icon' }),
        h('span', {}, isEs ? 'Soporte de Decisión Neurocrítica & Reducción de Daños' : 'Neurocritical Decision Support & Harm Reduction'),
      ]),
      h('h1', { class: 'neurology-title' }, isEs ? 'Salud Neurológica, Lesión Cerebral Post-Sobredosis y Neuroprotección' : 'Neurological Health, Post-Overdose Brain Injury & Neuroprotection'),
      h('p', { class: 'neurology-subtitle' }, isEs
        ? 'Guía clínica de medicina de adicciones y neurointensivismo para encefalopatía hipóxico-isquémica (EHI), leucoencefalopatía tardía (LPHT), SEPR, síndrome de desmielinización osmótica (SDO) y urgencias de tiamina en Wernicke.'
        : 'Evidence-based clinical decision support for hypoxic-ischemic brain injury (HIE), delayed post-hypoxic leukoencephalopathy (DPHL), PRES, osmotic demyelination syndrome (ODS), and Wernicke thiamine emergencies.'),
    ]);
    container.appendChild(header);

    // Primary Tab Navigation
    const tabs = [
      { id: 'syndromes', labelEn: 'Neurology Syndromes', labelEs: 'Síndromes Neurológicos', iconName: 'activity' },
      { id: 'evaluator', labelEn: 'Clinical Triage & Risk Evaluator', labelEs: 'Triaje Clínico & Evaluador', iconName: 'clipboard' },
      { id: 'wernicke', labelEn: 'Caine Wernicke Criteria', labelEs: 'Criterios de Caine (Wernicke)', iconName: 'alert-triangle' },
      { id: 'directives', labelEn: 'Harm Reduction Rules', labelEs: 'Reglas de Reducción de Daños', iconName: 'shield' },
      { id: 'sbar', labelEn: 'Clinical SBAR Note', labelEs: 'Nota Clínica SBAR', iconName: 'file-text' },
    ];

    const tabNav = h('nav', { class: 'neurology-tab-nav', role: 'tablist', 'aria-label': 'Neurology Care Sections' },
      tabs.map((tab) => {
        const isActive = state.activeTab === tab.id;
        const btn = h('button', {
          type: 'button',
          role: 'tab',
          class: `neurology-tab-btn ${isActive ? 'active' : ''}`,
          'aria-selected': isActive ? 'true' : 'false',
          'aria-controls': `tab-panel-${tab.id}`,
          id: `tab-btn-${tab.id}`,
        }, [
          icon(tab.iconName, { class: 'neurology-tab-icon' }),
          h('span', {}, isEs ? tab.labelEs : tab.labelEn),
        ]);
        btn.addEventListener('click', () => setNeurologyState({ activeTab: tab.id }));
        return btn;
      })
    );
    container.appendChild(tabNav);

    // Tab Panel Container
    const panel = h('section', {
      class: 'neurology-tab-panel',
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
    } else if (state.activeTab === 'wernicke') {
      renderWernickePanel(panel, state, isEs);
    } else if (state.activeTab === 'directives') {
      renderDirectivesPanel(panel, isEs);
    } else if (state.activeTab === 'sbar') {
      renderSbarPanel(panel, state, isEs);
    }

    // Educational Disclaimer Footer
    const footer = h('footer', { class: 'neurology-footer-notice' }, [
      icon('info', { class: 'neurology-footer-icon' }),
      h('p', {}, isEs
        ? 'Aviso Clínico: HarborPath proporciona directrices de neuroprotección basadas en evidencia médica. No sustituye la monitorización continua en UCI, RM cerebral, EEG o el juicio de neurointensivistas.'
        : 'Clinical Notice: HarborPath provides evidence-based neuroprotection guidelines. It does not replace intensive care monitoring, brain MRI, continuous EEG, or clinical judgment of neurocritical specialists.'),
    ]);
    container.appendChild(footer);
  }

  // Panel 1: Neurology Syndromes
  function renderSyndromesPanel(panel, isEs) {
    const intro = h('div', { class: 'neurology-panel-intro' }, [
      h('h2', {}, isEs ? 'Taxonomía de Síndromes Neurológicos Inducidos por Sustancias' : 'Substance-Induced Neurological Syndromes Taxonomy'),
      h('p', {}, isEs
        ? 'Reconocimiento fisiopatológico de las complicaciones cerebrales más graves asociadas a sobredosis, estimulantes, inhalación de vapores e hiponatremia.'
        : 'Pathophysiological recognition of severe central nervous system complications associated with overdose anoxia, stimulants, heated vapor inhalation, and hyponatremia.'),
    ]);
    panel.appendChild(intro);

    const list = h('div', { class: 'neurology-syndromes-list' },
      Object.values(NEUROLOGY_SYNDROME_PROFILES).map((syndrome) => {
        return h('article', { class: 'neurology-syndrome-card' }, [
          h('h3', { class: 'neurology-syndrome-title' }, isEs ? syndrome.nameEs : syndrome.nameEn),
          h('div', { class: 'neurology-section' }, [
            h('strong', {}, isEs ? 'Mecanismo Fisiopatológico:' : 'Pathophysiologic Mechanism:'),
            h('p', {}, isEs ? syndrome.pathophysiologyEs : syndrome.pathophysiologyEn),
          ]),
          h('div', { class: 'neurology-section' }, [
            h('strong', {}, isEs ? 'Presentación Clínica y Manejo Crítico:' : 'Clinical Presentation & Critical Management:'),
            h('p', {}, isEs ? syndrome.clinicalPresentationEs : syndrome.clinicalPresentationEn),
          ]),
        ]);
      })
    );
    panel.appendChild(list);
  }

  // Panel 2: Interactive Evaluator
  function renderEvaluatorPanel(panel, state, isEs) {
    const intro = h('div', { class: 'neurology-panel-intro' }, [
      h('h2', {}, isEs ? 'Evaluador de Riesgo Neurológico y Soporte de Decisión' : 'Neurological Risk Evaluator & Clinical Decision Support'),
      h('p', {}, isEs
        ? 'Marque los signos neurológicos presentes para recibir una estratificación inmediata de agudeza clínica y pautas de acción.'
        : 'Select observed neurological symptoms to receive real-time clinical risk stratification and action directives.'),
    ]);
    panel.appendChild(intro);

    const checklistItems = [
      { key: 'seizuresOrStatus', labelEn: 'Active or recurrent seizures / status epilepticus (> 5 min)', labelEs: 'Convulsiones activas o estado epiléptico (> 5 min)' },
      { key: 'lockedInSigns', labelEn: 'Quadriplegia with preserved vertical eye movements post-hyponatremia correction', labelEs: 'Cuadriplejía con conservación de mirada vertical post-corrección de hiponatremia' },
      { key: 'corticalBlindnessPres', labelEn: 'Sudden visual loss / cortical blindness + headache + hypertension (PRES flag)', labelEs: 'Pérdida visual súbita / ceguera cortical + cefalea + hipertensión (SEPR)' },
      { key: 'focalDeficitOrStroke', labelEn: 'Acute focal neurological deficit: facial droop, hemiparesis, sudden aphasia', labelEs: 'Déficit focal agudo: asimetría facial, debilidad unilateral o afasia súbita' },
      { key: 'persistentApneaHypoxemia', labelEn: 'Persistent hypoxemia (SpO2 < 85%) or respiratory arrest post-overdose', labelEs: 'Hipoxemia persistente (SatO2 < 85%) o apnea post-sobredosis' },
      { key: 'anoxicDownTime', labelEn: 'Prolonged down time / unresponsive without breathing (> 3-5 min)', labelEs: 'Paro o tiempo sin respirar prolongado post-sobredosis (> 3-5 min)' },
      { key: 'caineCriteriaMet', labelEn: 'Wernicke criteria met: malnutrition/alcohol + ataxia, eye palsy, or confusion', labelEs: 'Criterios de Wernicke: desnutrición/alcohol + ataxia, alteración ocular o confusión' },
      { key: 'mdmaHyponatremiaWater', labelEn: 'MDMA / Ecstasy use + excessive tap water drinking + confusion / vomiting', labelEs: 'Consumo de MDMA + ingesta masiva de agua + confusión / vómitos' },
      { key: 'delayedRelapseCognitive', labelEn: 'Delayed cognitive relapse, apathy, mutism, or stiffness 1-6 weeks post-overdose (DPHL)', labelEs: 'Recaída cognitiva tardía, apatía, mutismo o rigidez 1 a 6 semanas post-sobredosis (LPHT)' },
      { key: 'severeHeadacheHypertension', labelEn: 'Severe thunderclap headache + acute severe hypertension (BP > 180/110)', labelEs: 'Cefalea opresiva intensa súbita + hipertensión grave (PA > 180/110)' },
      { key: 'chasingDragonAtaxia', labelEn: 'Inhaling heated vapors off foil + progressive ataxia, slurred speech, tremor', labelEs: 'Inhalación de vapores sobre aluminio + ataxia progresiva, habla arrastrada y temblor' },
    ];

    const checklistForm = h('div', { class: 'neurology-evaluator-checklist' },
      checklistItems.map((item) => {
        const isChecked = !!state[item.key];
        const label = h('label', { class: `neurology-check-item ${isChecked ? 'selected' : ''}` }, [
          h('input', {
            type: 'checkbox',
            checked: isChecked,
            class: 'neurology-checkbox',
          }),
          h('span', { class: 'neurology-check-label' }, isEs ? item.labelEs : item.labelEn),
        ]);
        const input = label.querySelector('input');
        input.addEventListener('change', (e) => {
          setNeurologyState({ [item.key]: e.target.checked });
        });
        return label;
      })
    );
    panel.appendChild(checklistForm);

    // Reset Button
    const resetBar = h('div', { class: 'neurology-evaluator-actions' }, [
      h('button', {
        type: 'button',
        class: 'neurology-reset-btn',
      }, [
        icon('rotate-ccw', { class: 'neurology-btn-icon' }),
        h('span', {}, isEs ? 'Restablecer Evaluación' : 'Reset Assessment'),
      ]),
    ]);
    resetBar.querySelector('button').addEventListener('click', () => resetNeurologyState());
    panel.appendChild(resetBar);

    // Results Box
    const evalResult = evaluateNeurologyRisk(state);
    const resultsContainer = h('div', { class: `neurology-eval-results acuity-${evalResult.urgency}` }, [
      h('div', { class: 'neurology-eval-urgency-badge' }, [
        icon(evalResult.urgency === 'emergency_911' ? 'alert-octagon' : evalResult.urgency === 'urgent_eval' ? 'alert-triangle' : 'info', { class: 'neurology-urgency-icon' }),
        h('span', { class: 'neurology-urgency-text' },
          evalResult.urgency === 'emergency_911'
            ? (isEs ? 'EMERGENCIA MÉDICA CRÍTICA (LLAMAR AL 911 / CÓDIGO NEURO)' : 'CRITICAL MEDICAL EMERGENCY (CALL 911 / NEURO CODE)')
            : evalResult.urgency === 'urgent_eval'
            ? (isEs ? 'EVALUACIÓN URGENTE & ANTÍDOTO REQUERIDO' : 'URGENT MEDICAL EVALUATION & ANTIDOTE REQUIRED')
            : evalResult.urgency === 'specialty_consult'
            ? (isEs ? 'INTERCONSULTA CON NEUROLOGÍA & DIAGNÓSTICO POR IMAGEN' : 'SPECIALTY NEUROLOGY CONSULTATION & NEUROIMAGING')
            : (isEs ? 'DIRECTIVAS PREVENTIVAS DE NEUROPROTECCIÓN' : 'PRECAUTIONARY NEUROPROTECTIVE DIRECTIVES')
        ),
      ]),
      h('div', { class: 'neurology-eval-flags-list' },
        evalResult.flags.map((flag) => {
          return h('div', { class: 'neurology-flag-item' }, [
            h('h4', { class: 'neurology-flag-title' }, isEs ? flag.titleEs : flag.titleEn),
            h('p', { class: 'neurology-flag-desc' }, isEs ? flag.descEs : flag.descEn),
          ]);
        })
      ),
    ]);
    panel.appendChild(resultsContainer);
  }

  // Panel 3: Caine Wernicke Criteria
  function renderWernickePanel(panel, state, isEs) {
    const intro = h('div', { class: 'neurology-panel-intro' }, [
      h('h2', {}, isEs ? 'Criterios de Caine para Encefalopatía de Wernicke' : 'Caine Criteria for Wernicke Encephalopathy'),
      h('p', {}, isEs
        ? 'La tríada clásica solo ocurre en el 16% de los casos. Las guías de la EFNS exigen al menos 2 de los 4 criterios de Caine para iniciar tratamiento inmediato con tiamina parenteral.'
        : 'The classic triad occurs in < 16% of patients. International EFNS guidelines require at least 2 of 4 Caine criteria to mandate immediate high-dose parenteral thiamine.'),
    ]);
    panel.appendChild(intro);

    const alertBox = h('div', { class: 'neurology-critical-alert' }, [
      icon('alert-octagon', { class: 'neurology-alert-icon' }),
      h('div', {}, [
        h('strong', {}, isEs ? 'REGLA VITAL: TIAMINA ANTES DE CUALQUIER SUERO GLUCOSADO' : 'CRITICAL RULE: THIAMINE BEFORE ANY DEXTROSE/GLUCOSE'),
        h('p', {}, isEs
          ? 'La administración de glucosa sin tiamina agota las enzimas residuales en la vía glucolítica y desencadena necrosis hemorrágica irreversible en los cuerpos mamilares y tronco cerebral. Administrar siempre Tiamina 500 mg IV TID durante 3–5 días antes de glucosa.'
          : 'Administering intravenous glucose without thiamine burns through residual glycolysis cofactors and precipitates acute, irreversible hemorrhagic brainstem necrosis. Always administer Thiamine 500 mg IV TID for 3–5 days prior to dextrose.'),
      ]),
    ]);
    panel.appendChild(alertBox);

    const criteriaCards = h('div', { class: 'neurology-caine-grid' },
      CAINE_WERNICKE_CRITERIA.map((criterion, idx) => {
        return h('article', { class: 'neurology-caine-card' }, [
          h('div', { class: 'neurology-caine-badge' }, isEs ? `Criterio ${idx + 1}` : `Criterion ${idx + 1}`),
          h('h3', { class: 'neurology-caine-title' }, isEs ? criterion.labelEs : criterion.labelEn),
          h('p', { class: 'neurology-caine-desc' }, isEs ? criterion.descriptionEs : criterion.descriptionEn),
        ]);
      })
    );
    panel.appendChild(criteriaCards);
  }

  // Panel 4: Harm Reduction Directives
  function renderDirectivesPanel(panel, isEs) {
    const intro = h('div', { class: 'neurology-panel-intro' }, [
      h('h2', {}, isEs ? 'Directivas de Neuroprotección y Reducción de Daños de Campo' : 'Field Neuroprotection & Harm Reduction Directives'),
      h('p', {}, isEs
        ? 'Seis reglas clínicas fundamentales para proteger el tejido cerebral de hipoxia, desmielinización osmótica y toxicidad por sustancias.'
        : 'Six essential clinical directives to shield brain tissue against anoxia, osmotic demyelination, and substance neurotoxicity.'),
    ]);
    panel.appendChild(intro);

    const rulesList = h('div', { class: 'neurology-directives-grid' },
      NEUROLOGY_HARM_REDUCTION_RULES.map((rule) => {
        return h('article', { class: 'neurology-directive-card' }, [
          h('div', { class: 'neurology-directive-num' }, `0${rule.ruleNum}`),
          h('h3', { class: 'neurology-directive-title' }, isEs ? rule.titleEs : rule.titleEn),
          h('p', { class: 'neurology-directive-text' }, isEs ? rule.detailEs : rule.detailEn),
        ]);
      })
    );
    panel.appendChild(rulesList);
  }

  // Panel 5: SBAR Clinical Note Generator
  function renderSbarPanel(panel, state, isEs) {
    const intro = h('div', { class: 'neurology-panel-intro' }, [
      h('h2', {}, isEs ? 'Generador de Traspaso Clínico SBAR (Zero-PII)' : 'Zero-PII SBAR Clinical Handoff Note Generator'),
      h('p', {}, isEs
        ? 'Genere una nota clínica estructurada en formato SBAR (Situación, Antecedentes, Evaluación, Recomendación) para equipos de Neurología, Neurointensivismo y Urgencias. Sin almacenamiento en disco.'
        : 'Generate a structured SBAR clinical handoff note (Situation, Background, Assessment, Recommendation) for Neurology, Neurocritical Care, and Emergency Medicine. Stored 100% in RAM with zero disk persistence.'),
    ]);
    panel.appendChild(intro);

    const sbarText = formatNeurologySbarText(state, isEs ? 'es' : 'en');

    const copyBtn = h('button', {
      type: 'button',
      class: 'neurology-copy-btn',
    }, [
      icon(state.sbarCopied ? 'check' : 'copy', { class: 'neurology-btn-icon' }),
      h('span', {}, state.sbarCopied
        ? (isEs ? '¡Copiado al Portapapeles!' : 'Copied to Clipboard!')
        : (isEs ? 'Copiar Informe SBAR' : 'Copy SBAR Note')
      ),
    ]);

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sbarText);
        setNeurologyState({ sbarCopied: true });
        setTimeout(() => setNeurologyState({ sbarCopied: false }), 2500);
      } catch (err) {
        console.error('Failed to copy SBAR text:', err);
      }
    });

    const actionContainer = h('div', { class: 'neurology-sbar-actions' }, [copyBtn]);
    panel.appendChild(actionContainer);

    const sbarBox = h('pre', { class: 'neurology-sbar-output', 'aria-label': 'SBAR Clinical Output' }, sbarText);
    panel.appendChild(sbarBox);
  }

  render();
  const unsubscribe = subscribeNeurologyState(render);

  return container;
}

