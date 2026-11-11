// public/js/views/salicylateTox.js
// Wave 67 Clinical Engine A: Salicylate & NSAID Overdose, Urine Alkalinization & Pre-Intubation Airway Protection Navigator
// Clinical Consensus: ACMT, AACT, EAPCCT, and EXTRIP Salicylate Workgroup Guidelines.
// Privacy Invariant: 100% ephemeral in-RAM state, zero persistent storage, zero PII, zero cookies.
// Security Invariant: Safe DOM construction via ../dom.js (zero raw HTML sinks, zero inline styles, CSP self compliant).

import { h, clear, icon, copyText, wireTablistKeyboard, syncTablists, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL PROFILES, RED FLAGS & CARDINAL TOXICOLOGY CONSTANTS
// ============================================================================

export const SALICYLATE_PROFILES = Object.freeze({
  acute_salicylate_od: Object.freeze({
    id: 'acute_salicylate_od',
    nameEn: 'Acute Massive Aspirin / ASA Overdose',
    nameEs: 'Sobredosis Aguda Masiva de Aspirina / AAS',
    category: 'acute_asa',
    summaryEn: 'Acute supra-therapeutic aspirin ingestion causing medullary respiratory center stimulation (respiratory alkalosis) followed by uncoupling of oxidative phosphorylation and high-anion-gap metabolic acidosis.',
    summaryEs: 'Ingestión aguda supraterapéutica de aspirina que causa estimulación bulbar respiratoria (alcalosis respiratoria) seguida de desacoplamiento de la fosforilación oxidativa y acidosis metabólica con brecha aniónica elevada.',
    doseToxicityEn: '> 150 mg/kg: Mild–moderate toxicity (tinnitus, vomiting, tachypnea) | > 300 mg/kg: Severe toxicity (hyperthermia, mixed acid-base disorder, CNS signs) | > 500 mg/kg: Potentially lethal ingestion.',
    doseToxicityEs: '> 150 mg/kg: Toxicidad leve–moderada (acúfenos, vómitos, taquipnea) | > 300 mg/kg: Toxicidad grave (hipertermia, trastorno ácido-base mixto, signos SNC) | > 500 mg/kg: Ingestión potencialmente letal.',
    nomogramPitfallEn: 'DONE NOMOGRAM UNUSABLE: Obsolete and clinically dangerous for enteric-coated (EC) aspirin, sustained-release (SR) tablets, unknown ingestion time, chronic use, or methyl salicylate. EC/SR tablets form gastric pharmacobezoars causing rising delayed peaks up to 12–24+ hours. Trend serum levels q2h until two consecutive declining levels.',
    nomogramPitfallEs: 'NOMOGRAMA DE DONE INVÁLIDO: Obsoleto e inseguro para aspirina con recubrimiento entérico (EC), liberación prolongada (SR), tiempo desconocido, intoxicación crónica o salicilato de metilo. Los comprimidos EC/SR forman farmacobezoares gástricos con picos tardíos ascendentes a las 12–24+ h. Medir niveles seriados cada 2 h hasta dos descensos consecutivos.',
    managementPearlEn: 'Initiate isotonic NaHCO3 in D5W targeting urine pH 7.5–8.0 with K+ >= 4.0 mEq/L, STAT empiric dextrose for any CNS change, and activated charcoal (1 g/kg, max 50 g) if airway is protected; monitor q2h salicylate levels.',
    managementPearlEs: 'Iniciar NaHCO3 isotónico en D5W buscando pH urinario 7.5–8.0 con K+ >= 4.0 mEq/L, dextrosa empírica STAT ante cualquier signo SNC y carbón activado (1 g/kg, máx. 50 g) si la vía aérea está protegida; controlar salicilato cada 2 h.',
    blackBoxEn: 'AVOID CASUAL INTUBATION & DELAYED-PEAK FALSE REASSURANCE',
    blackBoxEs: 'PROHIBIDO INTUBAR SIN PROTECCIÓN KUSSMAUL / TRAMPA DE PICO TARDÍO',
    apapScreeningEn: 'Mandatory STAT serum Acetaminophen (APAP) level to rule out silent ASA+APAP combination co-ingestion.',
    apapScreeningEs: 'Nivel STAT obligatorio de Acetaminofén/Paracetamol sérico para descartar co-ingestión silenciosa AAS+Paracetamol.',
  }),

  chronic_salicylate_toxicity: Object.freeze({
    id: 'chronic_salicylate_toxicity',
    nameEn: 'Chronic / Accidental Therapeutic Salicylate Toxicity',
    nameEs: 'Toxicidad Crónica / Terapéutica Accidental por Salicilatos',
    category: 'chronic_asa',
    summaryEn: 'Insidious accumulation in older adults, renal insufficiency, or dehydrated patients taking repeated therapeutic doses. Saturable hepatic conjugation shifts elimination to zero-order kinetics (t1/2 prolonged to 15–30+ hours) with deep CNS tissue loading.',
    summaryEs: 'Acumulación insidiosa en adultos mayores, enfermedad renal o deshidratación bajo dosis terapéuticas repetidas. La saturación hepática cambia la cinética a orden cero (vida media 15–30+ h) con alta carga tisular en el SNC.',
    doseToxicityEn: 'CRITICAL LEVEL DISCREPANCY: Severe CNS neurotoxicity (confusion, agitation, delirium, hallucinations, coma) and cerebral/pulmonary edema occur at MUCH LOWER serum levels (25–60 mg/dL) than acute overdose!',
    doseToxicityEs: 'DISCREPANCIA CRÍTICA DE NIVELES: Neurotoxicidad grave del SNC (confusión, agitación, delirio, alucinaciones, coma) y edema cerebral o pulmonar ocurren con niveles séricos MUCHO MÁS BAJOS (25–60 mg/dL) que en la sobredosis aguda.',
    nomogramPitfallEn: 'HIGH MISDIAGNOSIS MORTALITY: Done nomogram is completely invalid. Tachypnea, fever/hypermetabolism, and acute delirium at serum levels of 25–55 mg/dL are frequently misdiagnosed as sepsis, urosepsis, pneumonia, or dementia — leading to fatal delayed hemodialysis.',
    nomogramPitfallEs: 'ALTA MORTALIDAD POR ERROR DIAGNÓSTICO: El nomograma de Done no aplica. La taquipnea, fiebre e hipermetabolismo con delirio agudo y niveles de 25–55 mg/dL suelen confundirse con sepsis o demencia, retrasando fatalmente la hemodiálisis.',
    managementPearlEn: 'Lower threshold for EXTRIP hemodialysis (AMS, pulmonary edema, or chronic/AKI level >= 60 mg/dL). Give D50W IV empirically for any confusion regardless of normal fingerstick glucose; assess renal reserve before potassium/fluid loading.',
    managementPearlEs: 'Umbral reducido para hemodiálisis EXTRIP (alteración mental, edema pulmonar o nivel >= 60 mg/dL en cuadro crónico/IRA). Administrar D50W IV empírico ante confusión aunque la glucemia capilar sea normal; evaluar función renal antes de líquidos/KCl.',
    blackBoxEn: 'LOWER SERUM LEVELS (25–60 mg/dL) CAN BE FATAL — DO NOT DISMISS AS SEPSIS OR DEMENTIA',
    blackBoxEs: 'NIVELES BAJOS (25–60 mg/dL) PUEDEN SER LETALES — NO CONFUNDIR CON SEPSIS O DEMENCIA',
    apapScreeningEn: 'Reconcile all OTC analgesics, topical creams, and bismuth subsalicylate; check STAT Acetaminophen (APAP) level and renal function.',
    apapScreeningEs: 'Conciliar analgésicos de venta libre, ungüentos tópicos y subsalicilato de bismuto; solicitar Paracetamol (APAP) STAT y función renal.',
  }),

  methyl_salicylate_wintergreen: Object.freeze({
    id: 'methyl_salicylate_wintergreen',
    nameEn: 'Methyl Salicylate / Oil of Wintergreen & Topical Salves',
    nameEs: 'Salicilato de Metilo / Aceite de Gaulteria y Ungüentos Tópicos',
    category: 'methyl_salicylate',
    summaryEn: 'Concentrated liquid methyl salicylate (98% Oil of Wintergreen) or topical muscle liniments/heat wraps. Rapidly absorbed across the GI mucosa (or abraded/occluded skin) and hydrolyzed directly to salicylic acid.',
    summaryEs: 'Salicilato de metilo líquido concentrado (Aceite de Gaulteria al 98%) o bálsamos/parches musculares. Se absorbe velozmente por mucosa digestiva (o piel ocluida/lesionada) e hidroliza directamente a ácido salicílico.',
    doseToxicityEn: 'EXTREME POTENCY MATH: 1 mL of 98% Oil of Wintergreen ≈ 1.4 g (1,400 mg) salicylate (~4.3 adult 325 mg aspirin tablets/mL). Even 5 mL (1 teaspoon) = ~7 g aspirin — RAPIDLY LETHAL IN TODDLERS!',
    doseToxicityEs: 'POTENCIA EXTREMA: 1 mL de Aceite de Gaulteria al 98% ≈ 1.4 g (1,400 mg) de salicilato (~4.3 tabletas de aspirina de 325 mg por mL). ¡Apenas 5 mL (1 cucharadita) equivalen a ~7 g de aspirina — RÁPIDAMENTE LETAL EN NIÑOS PEQUEÑOS!',
    nomogramPitfallEn: 'ULTRA-RAPID GI ABSORPTION: Done nomogram is invalid. Peak toxicity, refractory status epilepticus, severe acidemia, and cardiopulmonary arrest can develop within 30–60 minutes of even a single swallow.',
    nomogramPitfallEs: 'ABSORCIÓN DIGESTIVA FULMINANTE: El nomograma de Done es inválido. El pico tóxico, estatus epiléptico, acidemia grave y paro cardiorrespiratorio pueden presentarse en 30–60 minutos tras un solo trago.',
    managementPearlEn: 'Treat ANY pediatric sip of Oil of Wintergreen as a life-threatening emergency. Initiate immediate IV D5W + NaHCO3 alkalinization, prepare early hemodialysis access, give empiric dextrose for seizures/lethargy, and contact Poison Control (1-800-222-1222) STAT.',
    managementPearlEs: 'Tratar CUALQUIER sorbo pediátrico de aceite de gaulteria como emergencia vital inmediata. Iniciar alcalinización con D5W + NaHCO3, preparar acceso de hemodiálisis precoz, dextrosa empírica ante convulsiones/letargo y llamar a Toxicología (1-800-222-1222) STAT.',
    blackBoxEn: '1 mL ≈ 1.4 g SALICYLATE — 5 mL (~7 g ASA) IS RAPIDLY LETHAL IN TODDLERS',
    blackBoxEs: '1 mL ≈ 1.4 g DE SALICILATO — 5 mL (~7 g AAS) ES FULMINANTE EN NIÑOS PEQUEÑOS',
    apapScreeningEn: 'Verify bottle concentration (98% vs topical 10–30% liniments), estimate mL ingested x 1.4 g, and screen STAT Acetaminophen (APAP) if polypharmacy suspected.',
    apapScreeningEs: 'Verificar concentración del envase (98% vs linimentos 10–30%), estimar mL x 1.4 g y solicitar Paracetamol (APAP) STAT ante sospecha de polifarmacia.',
  }),

  nsaid_pepto_bismuth_mixed: Object.freeze({
    id: 'nsaid_pepto_bismuth_mixed',
    nameEn: 'Massive NSAID, Pepto-Bismol & Mixed Co-Formulations',
    nameEs: 'Sobredosis Masiva de AINE, Pepto-Bismol y Co-Formulaciones',
    category: 'nsaid_mixed',
    summaryEn: 'Covers massive non-salicylate NSAID ingestions (ibuprofen > 400 mg/kg causing severe lactic acidosis, coma, and AKI), bismuth subsalicylate (Pepto-Bismol ~8.7 mg salicylate/mL) causing mixed salicylism + bismuth encephalopathy, and ASA+APAP combination products.',
    summaryEs: 'Incluye ingestiones masivas de AINE no salicilatos (ibuprofeno > 400 mg/kg con acidosis láctica grave, coma e IRA), subsalicilato de bismuto (Pepto-Bismol ~8.7 mg salicilato/mL) con salicilismo más encefalopatía por bismuto, y productos combinados AAS+Paracetamol.',
    doseToxicityEn: 'Ibuprofen > 400 mg/kg: High-anion-gap lactic acidosis, CNS coma, seizures, hypothermia, AKI | Pepto-Bismol: Regular ~262 mg/15 mL, Extra Strength ~525 mg/15 mL salicylate | Mixed ASA+APAP (Excedrin/Percodan): Silent hepatotoxicity risk.',
    doseToxicityEs: 'Ibuprofeno > 400 mg/kg: Acidosis láctica con brecha aniónica alta, coma, convulsiones, hipotermia e IRA | Pepto-Bismol: ~262 mg/15 mL (regular) o ~525 mg/15 mL (extra) | Combinados AAS+Paracetamol (Excedrin/Percodan): Riesgo de hepatotoxicidad oculta.',
    nomogramPitfallEn: 'THERAPEUTIC DIFFERENTIATION: Pure non-salicylate NSAIDs (ibuprofen/naproxen) are >99% protein-bound — urine alkalinization and hemodialysis do NOT clear ibuprofen (treat acidemia, hypotension, and AKI supportively). However, Pepto-Bismol and mixed ASA tablets DO release true salicylate and require salicylate + APAP levels!',
    nomogramPitfallEs: 'DIFERENCIACIÓN TERAPÉUTICA: Los AINE puros (ibuprofeno/naproxeno) tienen >99% de unión proteica — la alcalinización urinaria y la hemodiálisis NO depuran el ibuprofeno (soporte de acidosis, hipotensión e IRA). En cambio, Pepto-Bismol y tabletas mixtas SÍ liberan salicilato real y exigen niveles de salicilato + Paracetamol.',
    managementPearlEn: 'Draw STAT Acetaminophen (APAP) + Salicylate + Lactate + Creatinine. For Pepto-Bismol chronic toxicity, assess myoclonus/ataxia (bismuth encephalopathy) and radiopaque GI densities; if salicylate is elevated, alkalinize urine if renal function allows.',
    managementPearlEs: 'Solicitar STAT Paracetamol (APAP) + Salicilato + Lactato + Creatinina. En toxicidad crónica por Pepto-Bismol buscar mioclonías/ataxia (encefalopatía por bismuto) y opacidades radiopacas; si hay salicilato elevado, alcalinizar orina si la función renal lo permite.',
    blackBoxEn: 'MANDATORY APAP CO-INGESTION CHECK (EXCEDRIN / PERCODAN) & AKI RENAL GUARDRAIL',
    blackBoxEs: 'CRIBADO OBLIGATORIO DE PARACETAMOL (EXCEDRIN / PERCODAN) Y ALERTA DE FALLO RENAL',
    apapScreeningEn: 'CRITICAL: Always obtain a 4-hour/STAT serum Acetaminophen (APAP) level on all aspirin, NSAID, and OTC cold-remedy overdoses; start NAC immediately if hepatotoxic co-ingestion is present.',
    apapScreeningEs: 'CRÍTICO: Obtener siempre nivel sérico STAT/4 h de Paracetamol (APAP) en toda sobredosis de aspirina, AINE o antigripales; iniciar N-acetilcisteína (NAC) sin demora si existe co-ingestión.',
  }),
});

export const SALICYLATE_RED_FLAGS = Object.freeze([
  Object.freeze({
    id: 'ams_neurotoxicity',
    labelEn: 'Altered Mental Status / Confusion / Agitation / Seizures / Coma',
    labelEs: 'Alteración del Estado Mental / Confusión / Agitación / Convulsiones / Coma',
    detailEn: 'Direct EXTRIP hemodialysis trigger regardless of level. Signals cerebral edema & CSF neuroglycopenia — give empiric IV Dextrose even if fingerstick is normal!',
    detailEs: 'Criterio directo de hemodiálisis EXTRIP sin importar el nivel sérico. Indica edema cerebral y neuroglucopenia en LCR — ¡administrar Dextrosa IV empírica aunque la glucemia capilar sea normal!',
    severity: 'critical',
  }),
  Object.freeze({
    id: 'pulmonary_edema',
    labelEn: 'Non-Cardiogenic Pulmonary Edema / Hypoxemia / Rales',
    labelEs: 'Edema Pulmonar No Cardiogénico / Hipoxemia / Crepitantes',
    detailEn: 'Direct EXTRIP hemodialysis trigger. High-volume NaHCO3 infusion can worsen alveolar flooding — prioritize rapid dialytic clearance.',
    detailEs: 'Criterio directo de hemodiálisis EXTRIP. La infusión de alto volumen de NaHCO3 puede agravar el edema alveolar — priorizar depuración dialítica urgente.',
    severity: 'critical',
  }),
  Object.freeze({
    id: 'acidemia_compensation_loss',
    labelEn: 'Arterial pH < 7.30 or Vanishing Respiratory Compensation (Rising pCO2)',
    labelEs: 'pH Arterial < 7.30 o Pérdida de Compensación Respiratoria (pCO2 Ascendente)',
    detailEn: 'Acidemia converts charged salicylate into lipid-soluble salicylic acid that floods the brain. Immediate NaHCO3 bolus + dialysis readiness required.',
    detailEs: 'La acidemia transforma el salicilato ionizado en ácido salicílico liposoluble que inunda el cerebro. Requiere bolo inmediato de NaHCO3 y preparación de diálisis.',
    severity: 'critical',
  }),
  Object.freeze({
    id: 'toxic_level_threshold',
    labelEn: 'Acute Serum Salicylate >= 100 mg/dL OR Chronic/Renal >= 60 mg/dL',
    labelEs: 'Salicilato Sérico Agudo >= 100 mg/dL O Crónico/Renal >= 60 mg/dL',
    detailEn: 'Meets EXTRIP extracorporeal removal threshold (acute >= 100 mg/dL [7.2 mmol/L], or >= 90 mg/dL if standard therapy fails; chronic/AKI >= 60 mg/dL).',
    detailEs: 'Cumple umbral EXTRIP de remoción extracorpórea (agudo >= 100 mg/dL [7.2 mmol/L], o >= 90 mg/dL si falla el tratamiento; crónico/IRA >= 60 mg/dL).',
    severity: 'critical',
  }),
  Object.freeze({
    id: 'hypokalemia_block',
    labelEn: 'Hypokalemia (Serum K+ < 4.0 mEq/L) Blocking Urine Alkalinization',
    labelEs: 'Hipopotasemia (K+ Sérico < 4.0 mEq/L) Bloqueando Alcalinización Urinaria',
    detailEn: 'Renal distal tubule reabsorbs K+ in exchange for H+ excretion, causing paradoxical aciduria! Must add 20–40 mEq KCl/L unless anuric/K+ > 5.0.',
    detailEs: 'El túbulo distal reabsorbe K+ intercambiándolo por excreción de H+, provocando aciduria paradójica. Agregar 20–40 mEq KCl/L salvo anuria o K+ > 5.0.',
    severity: 'high',
  }),
  Object.freeze({
    id: 'aki_oliguria',
    labelEn: 'Acute Kidney Injury (AKI) / Oliguria / Anuria / Fluid Overload',
    labelEs: 'Lesión Renal Aguda (IRA) / Oliguria / Anuria / Sobrecarga Hídrica',
    detailEn: 'Impairs renal salicylate elimination and prohibits safe KCl or high-volume NaHCO3 loading — urgent hemodialysis indicated.',
    detailEs: 'Impide la eliminación renal del salicilato y contraindica cargas altas de KCl o volumen con NaHCO3 — hemodiálisis urgente indicada.',
    severity: 'critical',
  }),
  Object.freeze({
    id: 'pre_intubation_warning',
    labelEn: 'Pre-Intubation / RSI Planned or Respiratory Fatigue Imminent',
    labelEs: 'Intubación / ISR Planificada o Fatiga Respiratoria Inminente',
    detailEn: 'BLACK-BOX WARNING: Sedation/paralysis apnea causes lethal pCO2 rise & CNS salicylate trapping. Pre-bolus NaHCO3 + preserve 24–32 L/min minute ventilation!',
    detailEs: 'ADVERTENCIA NEGRA: La apnea por sedación/parálisis provoca alza letal de pCO2 y atrapamiento cerebral. Bolo previo de NaHCO3 + mantener ventilación minuto 24–32 L/min.',
    severity: 'critical',
  }),
]);

export const CARDINAL_SALICYLATE_RULES = Object.freeze([
  Object.freeze({
    id: 'rule_pre_intubation_kussmaul',
    titleEn: '1. Black-Box Airway Rule: Do NOT Casually Intubate (Preserve 24–32 L/min)',
    titleEs: '1. Regla Negra de Vía Aérea: NO Intubar Sin Necesidad Extrema (Mantener 24–32 L/min)',
    bodyEn: 'Patients with severe salicylism survive by hyperventilating at 24–32 L/min to maintain respiratory alkalosis. Standard RSI sedation/apnea causes immediate pCO2 retention, acidemia, and rapid entry of un-ionized salicylic acid across the blood-brain barrier -> fatal cerebral edema & cardiac arrest. If intubation is unavoidable: give 1–2 mEq/kg IV NaHCO3 bolus BEFORE induction, minimize apnea time, set initial ventilator minute ventilation to match Kussmaul drive (RR 24–30/min, TV 6–8 mL/kg), check ABG in 10–15 min, and start STAT hemodialysis.',
    bodyEs: 'Los pacientes con salicilismo grave sobreviven hiperventilando a 24–32 L/min para sostener alcalosis respiratoria. La apnea estándar de ISR causa retención inmediata de pCO2, acidemia y paso masivo de ácido salicílico no ionizado al cerebro -> edema cerebral y paro fatal. Si es inevitable intubar: bolo previo de NaHCO3 1–2 mEq/kg IV, apnea mínima, programar ventilador con alta ventilación minuto (FR 24–30/min, VC 6–8 mL/kg), gasometría en 10–15 min y hemodiálisis STAT.',
  }),
  Object.freeze({
    id: 'rule_hypokalemia_gate',
    titleEn: '2. Hypokalemia Alkalinization Block Gate (K+ < 4.0 mEq/L)',
    titleEs: '2. Bloqueo de Alcalinización Urinaria por Hipopotasemia (K+ < 4.0 mEq/L)',
    bodyEn: 'Urine alkalinization to pH 7.5–8.0 CANNOT succeed if serum K+ < 4.0 mEq/L: potassium-depleted distal renal tubules reabsorb K+ in exchange for secreting H+, producing paradoxical aciduria. Add 20–40 mEq KCl per liter of NaHCO3/D5W infusion unless the patient has oliguria/anuria/AKI or K+ > 5.0 mEq/L.',
    bodyEs: 'Es IMPOSIBLE alcalinizar la orina a pH 7.5–8.0 si el K+ sérico < 4.0 mEq/L: el túbulo distal reabsorbe K+ excretando H+ y causa aciduria paradójica. Añadir 20–40 mEq de KCl por litro de NaHCO3/D5W salvo oliguria/anuria/IRA o K+ > 5.0 mEq/L.',
  }),
  Object.freeze({
    id: 'rule_csf_neuroglycopenia',
    titleEn: '3. CSF Neuroglycopenia Despite Normal Fingerstick Glucose',
    titleEs: '3. Neuroglucopenia en LCR Pese a Glucemia Capilar Normal',
    bodyEn: 'Salicylates uncouple cerebral oxidative phosphorylation, exhausting CNS glucose reserves even when peripheral capillary blood glucose reads completely normal (90–140 mg/dL). Administer empiric IV dextrose (D50W 50 mL IV in adults; 2–4 mL/kg D10W/D25W in pediatrics) for ANY confusion, agitation, lethargy, or seizure.',
    bodyEs: 'Los salicilatos desacoplan la fosforilación oxidativa cerebral, agotando la glucosa del SNC incluso con glucemia capilar periférica normal (90–140 mg/dL). Administrar dextrosa IV empírica (50 mL D50W en adultos; 2–4 mL/kg D10W/D25W en pediatría) ante cualquier confusión, agitación, letargo o convulsión.',
  }),
  Object.freeze({
    id: 'rule_isotonic_d5w_bicarb',
    titleEn: '4. Isotonic D5W Carrier Only (NEVER Normal Saline) & Target Urine pH 7.5–8.0',
    titleEs: '4. Vehículo Exclusivo en D5W Isotónico (NUNCA SSN 0.9%) y Meta pH Urinario 7.5–8.0',
    bodyEn: 'Mix 3 ampules (150 mEq) of 8.4% NaHCO3 into 1 L D5W (~150 mEq/L isotonic sodium) after removing 150 mL D5W, running at 1.5–2.0 mL/kg/hr. NEVER mix 3 amps NaHCO3 into 0.9% Normal Saline (produces ~304 mEq/L hypernatremia). Cap arterial pH at <= 7.55.',
    bodyEs: 'Mezclar 3 ámpulas (150 mEq) de NaHCO3 8.4% en 1 L de D5W (~150 mEq/L isotónico) extrayendo 150 mL de D5W, infundiendo a 1.5–2.0 mL/kg/h. NUNCA diluir en SSN 0.9% (produce hipernatremia severa ~304 mEq/L). No exceder pH arterial 7.55.',
  }),
  Object.freeze({
    id: 'rule_done_nomogram_serial',
    titleEn: '5. Done Nomogram Unusable — Trend Serial Levels q2h for Delayed Peaks',
    titleEs: '5. Nomograma de Done Inservible — Niveles Seriados c/2 h por Picos Tardíos',
    bodyEn: 'Enteric-coated (EC), sustained-release (SR), chronic ingestions, and methyl salicylate invalidate the Done nomogram. Gastric pharmacobezoars release salicylate erratically for 12–24+ hours. Trend serum salicylate q2h until two consecutive declining levels below toxic threshold.',
    bodyEs: 'Comprimidos entéricos (EC), de liberación prolongada (SR), toxicidad crónica y salicilato de metilo invalidan el nomograma de Done. Los farmacobezoares gástricos liberan fármaco erráticamente durante 12–24+ horas. Medir niveles cada 2 h hasta dos descensos consecutivos.',
  }),
  Object.freeze({
    id: 'rule_apap_extrip',
    titleEn: '6. Mandatory STAT APAP Screening & EXTRIP Hemodialysis Triggers',
    titleEs: '6. Cribado STAT de Paracetamol (APAP) y Criterios de Hemodiálisis EXTRIP',
    bodyEn: 'Always draw a STAT Acetaminophen level (Excedrin, Percodan, cold combinations). Activate EXTRIP intermittent hemodialysis immediately for: AMS/CNS signs, pulmonary edema/hypoxemia, pH <= 7.20, AKI/oliguria blocking NaHCO3, acute level >= 100 mg/dL (>= 90 mg/dL if standard therapy fails), or chronic level >= 60 mg/dL.',
    bodyEs: 'Solicitar siempre nivel STAT de Paracetamol/APAP (Excedrin, Percodan, antigripales). Activar hemodiálisis intermitente EXTRIP de inmediato por: signos SNC, edema pulmonar/hipoxemia, pH <= 7.20, IRA/oliguria que impida NaHCO3, nivel agudo >= 100 mg/dL (>= 90 mg/dL refractario) o crónico >= 60 mg/dL.',
  }),
]);

// ============================================================================
// PURE CLINICAL CALCULATORS & RISK EVALUATOR
// ============================================================================

function toFiniteNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

function normalizeFlagSet(checkedFlags) {
  if (checkedFlags instanceof Set) return new Set(checkedFlags);
  if (Array.isArray(checkedFlags)) return new Set(checkedFlags.filter(Boolean));
  return new Set();
}

/**
 * Pure calculator for IV 8.4% NaHCO3 bolus, isotonic D5W alkalinization infusion,
 * and strict Hypokalemia Alkalinization Block Guardrail (K+ < 4.0 mEq/L).
 * @param {number|string} weightKg
 * @param {number|string} serumPotassiumMeq
 * @param {Object} [options]
 * @returns {Object}
 */
export function calculateAlkalinizationRegimen(weightKg = 70, serumPotassiumMeq = 4.0, options = {}) {
  const parsedWeight = toFiniteNumber(weightKg);
  const weight = Math.max(3, Math.min(250, parsedWeight !== null && parsedWeight > 0 ? parsedWeight : 70));

  const parsedK = toFiniteNumber(serumPotassiumMeq);
  const k = parsedK !== null && parsedK >= 0 ? Math.round(parsedK * 10) / 10 : null;
  const parsedUrinePh = toFiniteNumber(options.urinePh);
  const hasAkiOrOliguria = Boolean(options.hasAkiOrOliguria);
  const hypokalemiaFlagChecked = Boolean(options.hypokalemiaFlagChecked);
  const profileId = options.profile || 'acute_salicylate_od';

  // 8.4% Sodium Bicarbonate = 1 mEq/mL; standard ampule = 50 mEq (50 mL)
  const bolusMeqMin = Math.round(weight * 1);
  const bolusMeqMax = Math.round(weight * 2);
  const bolusMlMin = bolusMeqMin;
  const bolusMlMax = bolusMeqMax;
  const bolusAmpulesMin = Math.round((bolusMeqMin / 50) * 10) / 10;
  const bolusAmpulesMax = Math.round((bolusMeqMax / 50) * 10) / 10;

  // Isotonic infusion: 3 ampules (150 mEq) 8.4% NaHCO3 in 1 L D5W at 1.5-2.0 mL/kg/hr
  const infusionRateMlHrMin = Math.round(weight * 1.5);
  const infusionRateMlHrMax = Math.round(weight * 2.0);
  const targetUrineOutputMinMlHr = Math.round(weight * 1);
  const targetUrineOutputMaxMlHr = Math.round(weight * 2);

  const hypokalemiaBlocked = (k !== null && k < 4.0) || hypokalemiaFlagChecked;
  const hyperkalemic = k !== null && k > 5.0;

  let potassiumStatus = 'adequate_maintain';
  let kclAddMeqPerL = 20;
  let kclRangeMeqPerL = '20';
  let kGateWarningEn = 'Serum K+ is >= 4.0 mEq/L. Add 20 mEq KCl/L as needed to prevent NaHCO3-driven kaliuresis from dropping K+ below 4.0 mEq/L; monitor K+ q2h.';
  let kGateWarningEs = 'K+ sérico >= 4.0 mEq/L. Añadir 20 mEq KCl/L según necesidad para evitar que la kaliuresis inducida por bicarbonato baje el K+ de 4.0 mEq/L; medir K+ cada 2 h.';

  if (hasAkiOrOliguria) {
    potassiumStatus = 'aki_hold_kcl_dialysis';
    kclAddMeqPerL = 0;
    kclRangeMeqPerL = '0 (HOLD — AKI/Oliguria)';
    kGateWarningEn = 'AKI / OLIGURIA GUARDRAIL: HOLD routine KCl addition (0 mEq/L) and avoid large-volume NaHCO3 fluid overload. Potassium/bicarbonate infusion is unsafe in oliguric/anuric renal failure — initiate STAT hemodialysis.';
    kGateWarningEs = 'ALERTA DE IRA / OLIGURIA: SUSPENDER KCl de rutina (0 mEq/L) y evitar sobrecarga hídrica con NaHCO3. La infusión de potasio/volumen es insegura en oliguria/anuria — iniciar hemodiálisis STAT.';
  } else if (hyperkalemic) {
    potassiumStatus = 'hyperkalemia_hold_kcl';
    kclAddMeqPerL = 0;
    kclRangeMeqPerL = '0 (HOLD — K+ > 5.0)';
    kGateWarningEn = `HYPERKALEMIA (K+ ${k} mEq/L > 5.0): HOLD all KCl supplementation. Evaluate immediately for AKI, rhabdomyolysis, or severe acidemia; recheck K+ q1–2h as NaHCO3 shifts K+ intracellularly.`;
    kGateWarningEs = `HIPERPOTASEMIA (K+ ${k} mEq/L > 5.0): SUSPENDER todo KCl. Evaluar de inmediato IRA, rabdomiólisis o acidemia severa; repetir K+ c/1–2 h mientras el NaHCO3 desplaza K+ al interior celular.`;
  } else if (k !== null && k < 3.0) {
    potassiumStatus = 'severe_hypokalemia_block';
    kclAddMeqPerL = 40;
    kclRangeMeqPerL = '40';
    kGateWarningEn = `SEVERE HYPOKALEMIA ALKALINIZATION BLOCK (K+ ${k} mEq/L < 3.0): Urine alkalinization WILL FAIL via paradoxical aciduria (kidney exchanges K+ reabsorption for H+ secretion). Add 40 mEq KCl/L to NaHCO3/D5W infusion AND administer separate telemetry-monitored IV KCl repletion (10–20 mEq/hr) until K+ >= 4.0 mEq/L.`;
    kGateWarningEs = `BLOQUEO SEVERO DE ALCALINIZACIÓN POR HIPOPOTASEMIA (K+ ${k} mEq/L < 3.0): La alcalinización urinaria FRACASARÁ por aciduria paradójica (el riñón retiene K+ excretando H+). Añadir 40 mEq KCl/L a la bolsa de NaHCO3/D5W Y reponer KCl IV separado bajo telemetría (10–20 mEq/h) hasta K+ >= 4.0 mEq/L.`;
  } else if (hypokalemiaBlocked) {
    potassiumStatus = 'hypokalemia_alkalinization_block';
    kclAddMeqPerL = 30;
    kclRangeMeqPerL = '20 - 40';
    const kDisplay = k !== null ? `${k} mEq/L` : '< 4.0 mEq/L';
    kGateWarningEn = `HYPOKALEMIA ALKALINIZATION BLOCK (K+ ${kDisplay} < 4.0): Kidney trades K+ instead of H+, preventing urine alkalinization (paradoxical aciduria)! Must add 20–40 mEq KCl/L to the D5W + 150 mEq NaHCO3 bag (unless anuric or K+ > 5.0) to unlock urine pH 7.5–8.0.`;
    kGateWarningEs = `BLOQUEO DE ALCALINIZACIÓN POR HIPOPOTASEMIA (K+ ${kDisplay} < 4.0): El riñón retiene K+ excretando H+, bloqueando la alcalinización urinaria (aciduria paradójica). Debe añadir 20–40 mEq KCl/L a la bolsa de D5W + 150 mEq NaHCO3 (salvo anuria o K+ > 5.0) para lograr pH urinario 7.5–8.0.`;
  }

  const urinePhAchieved = parsedUrinePh !== null && parsedUrinePh >= 7.5 && parsedUrinePh <= 8.0;
  const alkalinizationEffective = !hypokalemiaBlocked && !hasAkiOrOliguria && profileId !== 'nsaid_pepto_bismuth_mixed';

  return {
    weightKg: weight,
    serumPotassiumMeq: k,
    hasAkiOrOliguria,
    urinePh: parsedUrinePh,
    bolusMeqMin,
    bolusMeqMax,
    bolusMlMin,
    bolusMlMax,
    bolusAmpulesMin,
    bolusAmpulesMax,
    infusionNaHco3Ampules: 3,
    infusionNaHco3MeqPerL: 150,
    infusionCarrier: 'D5W (1,000 mL — NEVER Normal Saline)',
    infusionRateMlHrMin,
    infusionRateMlHrMax,
    targetUrinePh: '7.5 - 8.0',
    maxArterialPhCeiling: 7.55,
    targetUrineOutputMinMlHr,
    targetUrineOutputMaxMlHr,
    hypokalemiaBlocked,
    hyperkalemic,
    potassiumStatus,
    kclAddMeqPerL,
    kclRangeMeqPerL,
    urinePhAchieved,
    alkalinizationEffective,
    kGateWarningEn,
    kGateWarningEs,
    recipeEn: `Bolus ${bolusMeqMin}–${bolusMeqMax} mEq (${bolusMlMin}–${bolusMlMax} mL; ~${bolusAmpulesMin}–${bolusAmpulesMax} amps) 8.4% NaHCO3 IV, then 3 amps (150 mEq) NaHCO3 in 1 L D5W${kclAddMeqPerL > 0 ? ` + ${kclRangeMeqPerL} mEq KCl/L` : ''} at ${infusionRateMlHrMin}–${infusionRateMlHrMax} mL/hr (1.5–2 mL/kg/hr) targeting urine pH 7.5–8.0.`,
    recipeEs: `Bolo ${bolusMeqMin}–${bolusMeqMax} mEq (${bolusMlMin}–${bolusMlMax} mL; ~${bolusAmpulesMin}–${bolusAmpulesMax} ámp.) NaHCO3 8.4% IV, luego 3 ámpulas (150 mEq) NaHCO3 en 1 L D5W${kclAddMeqPerL > 0 ? ` + ${kclRangeMeqPerL} mEq KCl/L` : ''} a ${infusionRateMlHrMin}–${infusionRateMlHrMax} mL/h (1.5–2 mL/kg/h) buscando pH urinario 7.5–8.0.`,
  };
}

/**
 * Pure toxicological decision engine evaluating salicylate/NSAID severity,
 * black-box pre-intubation Kussmaul protection, CSF neuroglycopenia, hypokalemia block,
 * and EXTRIP hemodialysis triggers.
 * @param {Object} state
 * @returns {Object}
 */
export function evaluateSalicylateRisk(state = {}) {
  const profileId = SALICYLATE_PROFILES[state.profile] ? state.profile : 'acute_salicylate_od';
  const profile = SALICYLATE_PROFILES[profileId];
  const flags = normalizeFlagSet(state.checkedFlags);

  const weightParsed = toFiniteNumber(state.weightKg);
  const weightKg = Math.max(3, Math.min(250, weightParsed !== null && weightParsed > 0 ? weightParsed : 70));

  const salicylateLevelMgDl = toFiniteNumber(state.salicylateLevelMgDl);
  const salicylateLevelMmolL = salicylateLevelMgDl !== null
    ? Math.round((salicylateLevelMgDl / 13.812) * 10) / 10
    : null;

  const arterialPh = toFiniteNumber(state.arterialPh);
  const pco2MmHg = toFiniteNumber(state.pco2MmHg);
  const serumPotassiumMeq = toFiniteNumber(state.serumPotassiumMeq);
  const urinePh = toFiniteNumber(state.urinePh);
  const hoursSinceIngestion = toFiniteNumber(state.hoursSinceIngestion);

  const hasAkiOrOliguria = flags.has('aki_oliguria');
  const hasAms = flags.has('ams_neurotoxicity');
  const hasPulmonaryEdema = flags.has('pulmonary_edema');
  const hasToxicLevelFlag = flags.has('toxic_level_threshold');
  const hasPreIntubationFlag = flags.has('pre_intubation_warning');
  const hasHypokalemiaFlag = flags.has('hypokalemia_block');
  const hasCompensationLossFlag = flags.has('acidemia_compensation_loss');

  const alkalinization = calculateAlkalinizationRegimen(weightKg, serumPotassiumMeq, {
    hasAkiOrOliguria,
    urinePh,
    hypokalemiaFlagChecked: hasHypokalemiaFlag,
    profile: profileId,
  });

  // Vanishing respiratory compensation: acidemia with inappropriately normal/rising pCO2 (>= 35 mmHg)
  const vanishingCompensation = hasCompensationLossFlag
    || (arterialPh !== null && arterialPh < 7.35 && pco2MmHg !== null && pco2MmHg >= 35);

  // EXTRIP Hemodialysis Triggers
  const extripDialysisReasonsEn = [];
  const extripDialysisReasonsEs = [];

  if (hasAms) {
    extripDialysisReasonsEn.push('Altered mental status / CNS neurotoxicity (EXTRIP mandatory trigger regardless of serum level)');
    extripDialysisReasonsEs.push('Alteración del estado mental / neurotoxicidad del SNC (criterio obligatorio EXTRIP sin importar el nivel)');
  }
  if (hasPulmonaryEdema) {
    extripDialysisReasonsEn.push('Non-cardiogenic pulmonary edema or new hypoxemia requiring supplemental oxygen');
    extripDialysisReasonsEs.push('Edema pulmonar no cardiogénico o hipoxemia aguda con requerimiento de O2');
  }
  if (salicylateLevelMgDl !== null && salicylateLevelMgDl >= 100) {
    extripDialysisReasonsEn.push(`Acute serum salicylate ${salicylateLevelMgDl} mg/dL >= 100 mg/dL (7.2 mmol/L) EXTRIP absolute threshold`);
    extripDialysisReasonsEs.push(`Salicilato sérico agudo ${salicylateLevelMgDl} mg/dL >= 100 mg/dL (7.2 mmol/L), umbral absoluto EXTRIP`);
  } else if (
    salicylateLevelMgDl !== null
    && salicylateLevelMgDl >= 60
    && (profileId === 'chronic_salicylate_toxicity' || hasAkiOrOliguria)
  ) {
    extripDialysisReasonsEn.push(`Chronic / AKI salicylate level ${salicylateLevelMgDl} mg/dL >= 60 mg/dL (impaired clearance / deep CNS loading)`);
    extripDialysisReasonsEs.push(`Salicilato en toxicidad crónica / IRA de ${salicylateLevelMgDl} mg/dL >= 60 mg/dL (aclaramiento reducido / carga cerebral)`);
  } else if (hasToxicLevelFlag) {
    extripDialysisReasonsEn.push('EXTRIP toxic serum salicylate threshold met (>= 100 mg/dL acute or >= 60 mg/dL chronic/renal)');
    extripDialysisReasonsEs.push('Umbral tóxico EXTRIP cumplido (>= 100 mg/dL agudo o >= 60 mg/dL crónico/renal)');
  }

  if (arterialPh !== null && arterialPh <= 7.20) {
    extripDialysisReasonsEn.push(`Severe acidemia (arterial pH ${arterialPh.toFixed(2)} <= 7.20) accelerating CNS salicylic acid entry`);
    extripDialysisReasonsEs.push(`Acidemia severa (pH arterial ${arterialPh.toFixed(2)} <= 7.20) que acelera el paso cerebral de ácido salicílico`);
  }
  if (hasAkiOrOliguria) {
    extripDialysisReasonsEn.push('Acute kidney injury (AKI) / oliguria / fluid overload preventing safe NaHCO3 alkalinization');
    extripDialysisReasonsEs.push('Lesión renal aguda (IRA) / oliguria / sobrecarga hídrica que impide la alcalinización segura con NaHCO3');
  }

  const requiresHemodialysis = extripDialysisReasonsEn.length > 0;

  // Severity Determination
  const needsUrgentAlkalinization = !requiresHemodialysis && (
    (salicylateLevelMgDl !== null && salicylateLevelMgDl >= (profileId === 'chronic_salicylate_toxicity' ? 30 : 40))
    || (arterialPh !== null && arterialPh < 7.35)
    || hasPreIntubationFlag
    || vanishingCompensation
    || (alkalinization.hypokalemiaBlocked && salicylateLevelMgDl !== null && salicylateLevelMgDl >= 30)
  );

  let severity = 'baseline';
  let severityLabelEn = 'BASELINE / SUB-TOXIC MONITORING';
  let severityLabelEs = 'BASAL / MONITOREO SUBTÓXICO';

  if (requiresHemodialysis) {
    severity = 'emergency_hemodialysis';
    severityLabelEn = 'EMERGENCY HEMODIALYSIS & CRITICAL RESUSCITATION';
    severityLabelEs = 'HEMODIÁLISIS DE EMERGENCIA Y REANIMACIÓN CRÍTICA';
  } else if (needsUrgentAlkalinization) {
    severity = 'emergency_alkalinization';
    severityLabelEn = 'EMERGENCY IV BICARBONATE ALKALINIZATION';
    severityLabelEs = 'ALCALINIZACIÓN IV DE EMERGENCIA CON BICARBONATO';
  } else if (
    (salicylateLevelMgDl !== null && salicylateLevelMgDl >= 20)
    || profileId === 'methyl_salicylate_wintergreen'
    || alkalinization.hypokalemiaBlocked
  ) {
    severity = 'urgent_serial_levels';
    severityLabelEn = 'URGENT SERIAL q2h LEVELS & DECONTAMINATION WATCH';
    severityLabelEs = 'VIGILANCIA URGENTE CON NIVELES SERIADOS c/2 h';
  }

  // Black-Box Intubation Guardrail
  const intubationWarningActive = hasPreIntubationFlag
    || vanishingCompensation
    || hasPulmonaryEdema
    || hasAms
    || (arterialPh !== null && arterialPh < 7.35);

  const tidalVolMinMl = Math.round(weightKg * 6);
  const tidalVolMaxMl = Math.round(weightKg * 8);

  const intubationGuardrail = {
    active: intubationWarningActive,
    targetMinuteVentilationLMin: '24 - 32 L/min',
    recommendedRrRange: '24 - 30 breaths/min',
    recommendedTidalVolumeMlRange: `${tidalVolMinMl} - ${tidalVolMaxMl} mL (6-8 mL/kg IBW)`,
    preRsiBicarbBolus: `${alkalinization.bolusMeqMin}-${alkalinization.bolusMeqMax} mEq (${alkalinization.bolusMlMin}-${alkalinization.bolusMlMax} mL) 8.4% NaHCO3 IV`,
    blackBoxHeadlineEn: 'BLACK-BOX INTUBATION PROHIBITION & PRE-INTUBATION KUSSMAUL RULE',
    blackBoxHeadlineEs: 'PROHIBICIÓN NEGRA DE INTUBACIÓN CASUAL Y REGLA PRE-ISR DE KUSSMAUL',
    blackBoxDetailEn: `DO NOT intubate unless refractory hypoxemia or true ventilatory failure exists. Loss of 24–32 L/min Kussmaul hyperventilation during RSI apnea causes rapid pCO2 surge -> precipitous pH drop -> un-ionized salicylic acid floods across the blood-brain barrier -> fatal cerebral edema & cardiac arrest. If unavoidable: bolus ${alkalinization.bolusMeqMin}–${alkalinization.bolusMeqMax} mEq 8.4% NaHCO3 IV BEFORE RSI, minimize apnea, immediately ventilate at high minute ventilation (target 24–32 L/min; RR 24–30/min, TV ${tidalVolMinMl}–${tidalVolMaxMl} mL), recheck ABG in 10–15 min, and activate STAT hemodialysis.`,
    blackBoxDetailEs: `NO intubar salvo hipoxemia refractaria o claudicación ventilatoria real. Perder la hiperventilación de Kussmaul (24–32 L/min) durante la apnea de ISR dispara la pCO2 -> caída abrupta del pH -> paso masivo de ácido salicílico no ionizado al cerebro -> edema cerebral y paro cardíaco fulminante. Si es inevitable: bolo de ${alkalinization.bolusMeqMin}–${alkalinization.bolusMeqMax} mEq NaHCO3 8.4% IV ANTES de inducir, apnea mínima, ventilar a alta ventilación minuto (meta 24–32 L/min; FR 24–30/min, VC ${tidalVolMinMl}–${tidalVolMaxMl} mL), gasometría a los 10–15 min y hemodiálisis STAT.`,
  };

  // CSF Neuroglycopenia Rule
  const neuroglycopeniaActive = hasAms || severity === 'emergency_hemodialysis' || severity === 'emergency_alkalinization';
  const pedDextroseMl = Math.round(weightKg * 2);
  const neuroglycopeniaAlert = {
    active: neuroglycopeniaActive,
    headlineEn: 'NORMAL FINGERSTICK VS. CSF NEUROGLYCOPENIA RULE',
    headlineEs: 'REGLA DE NEUROGLUCOPENIA EN LCR CON GLUCEMIA CAPILAR NORMAL',
    directiveEn: weightKg < 40
      ? `Salicylates uncouple CNS oxidative phosphorylation, depleting brain glucose even when capillary fingerstick glucose is normal! Give empiric IV Dextrose (${pedDextroseMl} mL D10W/D25W or 0.5 g/kg IV) for ANY confusion, agitation, lethargy, or seizure — NEVER withhold dextrose for a normal fingerstick.`
      : 'Salicylates uncouple CNS oxidative phosphorylation, depleting brain glucose even when capillary fingerstick glucose is completely normal! Administer D50W 50 mL (25 g) IV empirically for ANY confusion, agitation, lethargy, or seizure — NEVER withhold dextrose because of a normal fingerstick.',
    directiveEs: weightKg < 40
      ? `Los salicilatos desacoplan el metabolismo cerebral y agotan la glucosa del LCR aunque la glucemia capilar sea normal. Administrar dextrosa IV empírica (${pedDextroseMl} mL D10W/D25W o 0.5 g/kg IV) ante CUALQUIER confusión, agitación, letargo o convulsión — NUNCA omitirla por glucemia capilar normal.`
      : 'Los salicilatos desacoplan la fosforilación oxidativa cerebral, agotando la glucosa del SNC incluso con glucemia capilar completamente normal. Administrar D50W 50 mL (25 g) IV empírica ante CUALQUIER confusión, agitación, letargo o convulsión — NUNCA retener dextrosa por glucemia capilar normal.',
  };

  // Alerts Array
  const alerts = [];
  if (intubationWarningActive) {
    alerts.push({
      type: 'critical',
      code: 'intubation_prohibition',
      titleEn: intubationGuardrail.blackBoxHeadlineEn,
      titleEs: intubationGuardrail.blackBoxHeadlineEs,
      bodyEn: intubationGuardrail.blackBoxDetailEn,
      bodyEs: intubationGuardrail.blackBoxDetailEs,
    });
  }
  if (requiresHemodialysis) {
    alerts.push({
      type: 'critical',
      code: 'extrip_hemodialysis',
      titleEn: 'STAT EXTRIP HEMODIALYSIS INDICATED',
      titleEs: 'HEMODIÁLISIS DE EMERGENCIA (EXTRIP) INDICADA',
      bodyEn: `Criteria met: ${extripDialysisReasonsEn.join('; ')}. Initiate urgent nephrology & intermittent hemodialysis (IHD) immediately while continuing IV NaHCO3 until dialysis flow begins.`,
      bodyEs: `Criterios cumplidos: ${extripDialysisReasonsEs.join('; ')}. Activar nefrología y hemodiálisis intermitente (HDI) de inmediato manteniendo NaHCO3 IV hasta iniciar la diálisis.`,
    });
  }
  if (alkalinization.hypokalemiaBlocked) {
    alerts.push({
      type: 'warning',
      code: 'hypokalemia_alkalinization_block',
      titleEn: 'HYPOKALEMIA ALKALINIZATION BLOCK (K+ < 4.0 mEq/L)',
      titleEs: 'BLOQUEO DE ALCALINIZACIÓN POR HIPOPOTASEMIA (K+ < 4.0 mEq/L)',
      bodyEn: alkalinization.kGateWarningEn,
      bodyEs: alkalinization.kGateWarningEs,
    });
  }
  if (hasAms) {
    alerts.push({
      type: 'critical',
      code: 'csf_neuroglycopenia',
      titleEn: neuroglycopeniaAlert.headlineEn,
      titleEs: neuroglycopeniaAlert.headlineEs,
      bodyEn: neuroglycopeniaAlert.directiveEn,
      bodyEs: neuroglycopeniaAlert.directiveEs,
    });
  }
  if (profileId === 'chronic_salicylate_toxicity' && salicylateLevelMgDl !== null && salicylateLevelMgDl >= 25 && salicylateLevelMgDl < 100) {
    alerts.push({
      type: 'warning',
      code: 'chronic_low_level_hazard',
      titleEn: `CHRONIC SALICYLISM NEUROTOXICITY HAZARD (${salicylateLevelMgDl} mg/dL)`,
      titleEs: `PELIGRO DE NEUROTOXICIDAD EN SALICILISMO CRÓNICO (${salicylateLevelMgDl} mg/dL)`,
      bodyEn: 'Chronic therapeutic toxicity causes fatal cerebral and pulmonary edema at serum levels of 25–60 mg/dL. Do not misattribute confusion/tachypnea to sepsis or dementia.',
      bodyEs: 'La toxicidad crónica causa edema cerebral y pulmonar letal con niveles de 25–60 mg/dL. No atribuir confusión o taquipnea a sepsis o demencia.',
    });
  }
  if (profileId === 'methyl_salicylate_wintergreen') {
    alerts.push({
      type: 'critical',
      code: 'wintergreen_potency',
      titleEn: 'OIL OF WINTERGREEN EXTREME CONCENTRATION (1 mL ≈ 1.4 g SALICYLATE)',
      titleEs: 'CONCENTRACIÓN EXTREMA EN ACEITE DE GAULTERIA (1 mL ≈ 1.4 g SALICILATO)',
      bodyEn: '5 mL (1 teaspoon) = ~7 g aspirin — rapidly lethal in toddlers via ultra-rapid GI absorption. Do NOT wait for nomogram or delayed labs.',
      bodyEs: '5 mL (1 cucharadita) = ~7 g de aspirina — rápidamente letal en niños pequeños por absorción veloz. NO esperar nomograma ni laboratorios diferidos.',
    });
  }

  // Action Plan
  const actions = [];
  if (requiresHemodialysis) {
    actions.push({
      priority: 'stat',
      textEn: `STAT Nephrology / Hemodialysis Consult: Activate emergent intermittent hemodialysis (${extripDialysisReasonsEn.join('; ')}).`,
      textEs: `Interconsulta STAT Nefrología / Hemodiálisis: Activar hemodiálisis intermitente urgente (${extripDialysisReasonsEs.join('; ')}).`,
    });
  }
  if (profileId === 'nsaid_pepto_bismuth_mixed' && (salicylateLevelMgDl === null || salicylateLevelMgDl < 25)) {
    actions.push({
      priority: 'urgent',
      textEn: 'NSAID / Co-Formulation Management: Check STAT APAP, lactate, creatinine, and salicylate. Pure ibuprofen (>400 mg/kg) does NOT clear via urine alkalinization or HD; treat lactic acidosis/hypotension/AKI supportively, and alkalinize ONLY if salicylate (e.g. Pepto-Bismol/Excedrin) is elevated.',
      textEs: 'Manejo AINE / Co-Formulaciones: Medir STAT Paracetamol (APAP), lactato, creatinina y salicilato. El ibuprofeno puro (>400 mg/kg) NO se depura por alcalinización ni diálisis; soporte de acidosis/IRA y alcalinizar SÓLO si hay salicilato elevado.',
    });
  } else {
    actions.push({
      priority: severity === 'baseline' ? 'monitor' : 'stat',
      textEn: `Urine Alkalinization Protocol: ${alkalinization.recipeEn}`,
      textEs: `Protocolo de Alcalinización Urinaria: ${alkalinization.recipeEs}`,
    });
  }
  if (alkalinization.hypokalemiaBlocked) {
    actions.push({
      priority: 'stat',
      textEn: alkalinization.kGateWarningEn,
      textEs: alkalinization.kGateWarningEs,
    });
  }
  actions.push({
    priority: hasAms ? 'stat' : 'urgent',
    textEn: neuroglycopeniaAlert.directiveEn,
    textEs: neuroglycopeniaAlert.directiveEs,
  });
  actions.push({
    priority: 'urgent',
    textEn: `Serial Monitoring & Co-Ingestion Check: Draw STAT Acetaminophen (APAP) level, arterial/venous blood gas, BMP/K+ q2h, urine pH q1–2h (target 7.5–8.0), and serum salicylate q2h until two consecutive declining levels${hoursSinceIngestion !== null && hoursSinceIngestion < 6 ? ' (early presentation: watch for delayed EC/SR pharmacobezoar peak!)' : ''}.`,
    textEs: `Monitoreo Seriado y Co-Ingestión: Solicitar STAT nivel de Paracetamol (APAP), gasometría, electrolitos/K+ c/2 h, pH urinario c/1–2 h (meta 7.5–8.0) y salicilato sérico c/2 h hasta dos descensos consecutivos${hoursSinceIngestion !== null && hoursSinceIngestion < 6 ? ' (presentación precoz: vigilar pico tardío por comprimidos entéricos).' : '.'}`,
  });
  actions.push({
    priority: 'urgent',
    textEn: 'GI Decontamination (Airway Protected Only): Consider Activated Charcoal 1 g/kg PO/NG (max 50 g) for acute massive ASA/EC ingestion; consider multi-dose charcoal or whole-bowel irrigation for sustained-release/bezoar ingestions if bowel sounds intact.',
    textEs: 'Descontaminación Digestiva (Sólo con Vía Aérea Protegida): Valorar Carbón Activado 1 g/kg VO/SNG (máx. 50 g) en ingestión aguda masiva; considerar dosis múltiples o irrigación intestinal total en fármacos de liberación prolongada.',
  });

  return {
    profile,
    profileId,
    weightKg,
    salicylateLevelMgDl,
    salicylateLevelMmolL,
    arterialPh,
    pco2MmHg,
    serumPotassiumMeq,
    urinePh,
    hoursSinceIngestion,
    severity,
    severityLabelEn,
    severityLabelEs,
    alkalinization,
    requiresHemodialysis,
    extripDialysisReasonsEn,
    extripDialysisReasonsEs,
    vanishingCompensation,
    intubationGuardrail,
    neuroglycopeniaAlert,
    alerts,
    actions,
  };
}

/**
 * Zero-PII bilingual (EN / ES) SBAR clinical handoff text formatter.
 * @param {Object} state
 * @param {string} [lang='en']
 * @returns {string}
 */
export function formatSalicylateSbarText(state = {}, lang = 'en') {
  const isEs = lang === 'es';
  const ev = evaluateSalicylateRisk(state);
  const flagIds = Array.from(normalizeFlagSet(state.checkedFlags));
  const flagLabels = flagIds.map((id) => {
    const found = SALICYLATE_RED_FLAGS.find((f) => f.id === id);
    return found ? (isEs ? found.labelEs : found.labelEn) : id;
  });

  const levelStr = ev.salicylateLevelMgDl !== null
    ? `${ev.salicylateLevelMgDl} mg/dL (${ev.salicylateLevelMmolL} mmol/L)`
    : (isEs ? 'Pendiente / Seriado q2h' : 'Pending / Trend q2h');
  const phStr = ev.arterialPh !== null ? ev.arterialPh.toFixed(2) : (isEs ? 'Pendiente' : 'Pending');
  const pco2Str = ev.pco2MmHg !== null ? `${ev.pco2MmHg} mmHg` : (isEs ? 'Pendiente' : 'Pending');
  const kStr = ev.serumPotassiumMeq !== null ? `${ev.serumPotassiumMeq} mEq/L` : (isEs ? 'Pendiente' : 'Pending');
  const uPhStr = ev.urinePh !== null ? ev.urinePh.toFixed(1) : (isEs ? 'Pendiente' : 'Pending');
  const hrsStr = ev.hoursSinceIngestion !== null ? `${ev.hoursSinceIngestion} h` : (isEs ? 'Desconocida' : 'Unknown');

  if (isEs) {
    return [
      '=== NOTA CLÍNICA SBAR: TOXICOLOGÍA DE SALICILATOS / AINE Y PROTECCIÓN DE VÍA AÉREA ===',
      'Privacidad: Cero PII / Datos Epímeros en Memoria (Sin identificadores del paciente)',
      '',
      '[S] SITUACIÓN:',
      `• Cuadro Clínico: ${ev.profile.nameEs}`,
      `• Nivel de Severidad: ${ev.severityLabelEs}`,
      `• Peso Estimado: ${ev.weightKg} kg | Horas desde ingestión: ${hrsStr}`,
      `• Laboratorios: Salicilato ${levelStr} | pH arterial ${phStr} | pCO2 ${pco2Str} | K+ ${kStr} | pH urinario ${uPhStr}`,
      '',
      '[B] ANTECEDENTES Y TRAMPAS TOXICOLÓGICAS:',
      `• Perfil de Toxicidad: ${ev.profile.doseToxicityEs}`,
      `• Advertencia de Nomograma / Cinética: ${ev.profile.nomogramPitfallEs}`,
      `• Banderas Rojas Activas: ${flagLabels.length ? flagLabels.join('; ') : 'Ninguna marcada'}`,
      '',
      '[A] EVALUACIÓN (ALCALINIZACIÓN, BLOQUEO K+ Y CRITERIOS EXTRIP):',
      `• Pauta de Alcalinización: ${ev.alkalinization.recipeEs}`,
      `• Compuerta de Potasio (< 4.0 mEq/L): ${ev.alkalinization.kGateWarningEs}`,
      `• Hemodiálisis EXTRIP: ${ev.requiresHemodialysis ? `INDICADA DE EMERGENCIA (${ev.extripDialysisReasonsEs.join('; ')})` : 'No cumple criterios absolutos actuales; continuar niveles seriados c/2 h.'}`,
      '',
      '[R] RECOMENDACIONES Y DIRECTIVAS CRÍTICAS:',
      `1. PROTECCIÓN DE VÍA AÉREA (REGLA KUSSMAUL): ${ev.intubationGuardrail.blackBoxDetailEs}`,
      `2. NEUROGLUCOPENIA EN LCR: ${ev.neuroglycopeniaAlert.directiveEs}`,
      `3. CO-INGESTIÓN OBLIGATORIA: ${ev.profile.apapScreeningEs}`,
      '4. MONITOREO Y TOXICOLOGÍA: Salicilato sérico y K+ cada 2 h hasta 2 descensos consecutivos; pH urinario meta 7.5–8.0 (techo pH arterial <= 7.55). Consultar Centro de Toxicología (1-800-222-1222).',
      '======================================================================================',
    ].join('\n');
  }

  return [
    '=== SBAR CLINICAL HANDOFF: SALICYLATE / NSAID OVERDOSE & AIRWAY PROTECTION ===',
    'Privacy: Zero PII / Ephemeral In-RAM Evaluation (No patient identifiers)',
    '',
    '[S] SITUATION:',
    `• Exposure Profile: ${ev.profile.nameEn}`,
    `• Triage Tier: ${ev.severityLabelEn}`,
    `• Estimated Weight: ${ev.weightKg} kg | Hours Post-Ingestion: ${hrsStr}`,
    `• Key Labs: Salicylate ${levelStr} | Arterial pH ${phStr} | pCO2 ${pco2Str} | K+ ${kStr} | Urine pH ${uPhStr}`,
    '',
    '[B] BACKGROUND & TOXICOLOGIC PITFALLS:',
    `• Dose / Kinetic Profile: ${ev.profile.doseToxicityEn}`,
    `• Nomogram / Kinetic Warning: ${ev.profile.nomogramPitfallEn}`,
    `• Active Red Flags: ${flagLabels.length ? flagLabels.join('; ') : 'None checked'}`,
    '',
    '[A] ASSESSMENT (ALKALINIZATION, K+ GATE & EXTRIP DIALYSIS):',
    `• Alkalinization Regimen: ${ev.alkalinization.recipeEn}`,
    `• Hypokalemia Alkalinization Block (< 4.0 mEq/L): ${ev.alkalinization.kGateWarningEn}`,
    `• EXTRIP Hemodialysis: ${ev.requiresHemodialysis ? `EMERGENT HEMODIALYSIS INDICATED (${ev.extripDialysisReasonsEn.join('; ')})` : 'EXTRIP threshold not yet met; maintain q2h serial trending.'}`,
    '',
    '[R] RECOMMENDATION & LIFE-SAVING GUARDRAILS:',
    `1. PRE-INTUBATION KUSSMAUL PROTECTION: ${ev.intubationGuardrail.blackBoxDetailEn}`,
    `2. CSF NEUROGLYCOPENIA RULE: ${ev.neuroglycopeniaAlert.directiveEn}`,
    `3. CO-INGESTION SCREENING: ${ev.profile.apapScreeningEn}`,
    '4. SERIAL MONITORING & POISON CONTROL: Trend serum salicylate & K+ q2h until 2 consecutive declining levels; target urine pH 7.5–8.0 (cap arterial pH <= 7.55). Consult Poison Control (1-800-222-1222).',
    '======================================================================================',
  ].join('\n');
}

// ============================================================================
// EPHEMERAL IN-RAM STATE MANAGEMENT
// ============================================================================

function createInitialState() {
  return {
    profile: 'acute_salicylate_od',
    weightKg: '70',
    salicylateLevelMgDl: '55',
    arterialPh: '7.42',
    pco2MmHg: '24',
    serumPotassiumMeq: '3.6',
    urinePh: '6.0',
    hoursSinceIngestion: '4',
    checkedFlags: new Set(),
    activeTab: 'alkalinization',
  };
}

let salicylateState = createInitialState();
const listeners = new Set();

function notifyListeners() {
  const snapshot = getSalicylateToxState();
  for (const fn of [...listeners]) {
    fn(snapshot);
  }
}

export function getSalicylateToxState() {
  return {
    ...salicylateState,
    checkedFlags: new Set(salicylateState.checkedFlags),
  };
}

export function updateSalicylateToxState(partial = {}) {
  const next = { ...salicylateState, ...partial };
  if (Object.hasOwn(partial, 'checkedFlags')) {
    next.checkedFlags = normalizeFlagSet(partial.checkedFlags);
  }
  salicylateState = next;
  notifyListeners();
  return getSalicylateToxState();
}

export function resetSalicylateToxState() {
  salicylateState = createInitialState();
  notifyListeners();
  return getSalicylateToxState();
}

export function subscribeSalicylateToxState(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// ACCESSIBLE DOM VIEW (SAFE DOM BUILDER / ZERO INLINE STYLES / FOCUS-SAFE)
// ============================================================================

const TABS = Object.freeze([
  { id: 'alkalinization', labelEn: 'Alkalinization & K+ Gate', labelEs: 'Alcalinización y Compuerta K+' },
  { id: 'airway_dialysis', labelEn: 'Airway, CSF Glucose & EXTRIP', labelEs: 'Vía Aérea, LCR y EXTRIP' },
  { id: 'rules', labelEn: 'Cardinal Rules & APAP Screen', labelEs: 'Reglas Cardinales y APAP' },
]);

/**
 * Mounts the Wave 67 Salicylate & NSAID Overdose Navigator.
 * Supports both `salicylateToxView(containerElement)` (DOM tests) and
 * `salicylateToxView({ query, meta })` (`app.js` route rendering).
 * @param {Element|Object} [containerOrOptions]
 * @param {Object} [maybeOptions]
 * @returns {Element}
 */
export function salicylateToxView(containerOrOptions = {}, maybeOptions = {}) {
  const isContainerElement = Boolean(
    containerOrOptions
    && (typeof containerOrOptions.append === 'function'
      || typeof containerOrOptions.appendChild === 'function'
      || containerOrOptions.nodeType
      || containerOrOptions.tagName),
  );
  const hostContainer = isContainerElement ? containerOrOptions : null;
  const options = isContainerElement ? maybeOptions : (containerOrOptions || {});
  void options;

  const lang = getLang();
  const isEs = lang === 'es';
  const tr = (en, es) => (isEs ? es : en);

  const root = h('div', {
    class: 'view-section specialized-clinical-view salicylate-tox-view',
    role: 'region',
    'aria-label': tr(
      'Salicylate & NSAID Overdose, Urine Alkalinization & Pre-Intubation Airway Protection Navigator',
      'Navegador de Sobredosis por Salicilatos y AINE, Alcalinización Urinaria y Protección de Vía Aérea',
    ),
  });

  const header = pageHeader(
    tr(
      'Salicylate & NSAID Overdose, Urine Alkalinization & Airway Protection Navigator',
      'Navegador de Sobredosis por Salicilatos y AINE, Alcalinización Urinaria y Vía Aérea',
    ),
    tr(
      'ACMT / EXTRIP consensus protocols for aspirin, chronic toxicity (25–60 mg/dL neurotoxicity), oil of wintergreen (1.4 g/mL), Pepto-Bismol / NSAIDs, hypokalemia alkalinization blocks (K+ < 4.0 mEq/L), CSF neuroglycopenia, and pre-intubation Kussmaul protection.',
      'Consenso clínico ACMT / EXTRIP para aspirina, toxicidad crónica (neurotoxicidad a 25–60 mg/dL), aceite de gaulteria (1.4 g/mL), Pepto-Bismol / AINE, bloqueo por hipopotasemia (K+ < 4.0 mEq/L), neuroglucopenia en LCR y protección respiratoria pre-intubación.',
    ),
  );
  if (header?.classList) header.classList.add('view-header');
  root.append(header);

  const alertBannerSlot = h('div', { class: 'salicylate-banner-slot' });
  root.append(alertBannerSlot);

  const grid = h('div', { class: 'disaster-grid salicylate-grid' });
  const leftCol = h('div', { class: 'disaster-col salicylate-col' });
  const rightCol = h('div', { class: 'disaster-col salicylate-col' });
  grid.append(leftCol, rightCol);
  root.append(grid);

  const initialState = getSalicylateToxState();

  // --------------------------------------------------------------------------
  // LEFT COLUMN: PERSISTENT CONTROLS (MOUNTED ONCE TO PRESERVE FOCUS)
  // --------------------------------------------------------------------------

  const profileSelect = h(
    'select',
    {
      id: 'salicylate-profile-select',
      class: 'select nsti-select salicylate-select',
    },
    Object.values(SALICYLATE_PROFILES).map((p) =>
      h('option', { value: p.id, selected: p.id === initialState.profile }, isEs ? p.nameEs : p.nameEn),
    ),
  );
  profileSelect.addEventListener('change', (e) => {
    updateSalicylateToxState({ profile: e.target.value });
  });

  const profileDetailSlot = h('div', { class: 'nsti-stage-info salicylate-profile-details' });

  const profileCard = h('section', { class: 'card nsti-card salicylate-card' },
    h('h2', { class: 'nsti-card-title' }, tr('1. Exposure Profile & Kinetic Pitfalls', '1. Perfil de Exposición y Trampas Cinéticas')),
    h('div', { class: 'form-group decon-input-group salicylate-form-group' },
      h('label', { for: 'salicylate-profile-select' }, tr('Clinical Exposure Scenario:', 'Escenario Clínico de Exposición:')),
      profileSelect,
    ),
    profileDetailSlot,
  );
  leftCol.append(profileCard);

  const weightInput = h('input', {
    id: 'salicylate-weight-input',
    type: 'number',
    min: '3',
    max: '250',
    step: '1',
    class: 'input nsti-num-input salicylate-input',
    placeholder: '70',
    value: initialState.weightKg,
  });
  const levelInput = h('input', {
    id: 'salicylate-level-input',
    type: 'number',
    min: '0',
    max: '300',
    step: '1',
    class: 'input nsti-num-input salicylate-input',
    placeholder: '55',
    value: initialState.salicylateLevelMgDl,
  });
  const phInput = h('input', {
    id: 'salicylate-ph-input',
    type: 'number',
    min: '6.60',
    max: '7.80',
    step: '0.01',
    class: 'input nsti-num-input salicylate-input',
    placeholder: '7.42',
    value: initialState.arterialPh,
  });
  const pco2Input = h('input', {
    id: 'salicylate-pco2-input',
    type: 'number',
    min: '8',
    max: '120',
    step: '1',
    class: 'input nsti-num-input salicylate-input',
    placeholder: '24',
    value: initialState.pco2MmHg,
  });
  const potassiumInput = h('input', {
    id: 'salicylate-potassium-input',
    type: 'number',
    min: '1.0',
    max: '9.0',
    step: '0.1',
    class: 'input nsti-num-input salicylate-input',
    placeholder: '3.6',
    value: initialState.serumPotassiumMeq,
  });
  const urinePhInput = h('input', {
    id: 'salicylate-urine-ph-input',
    type: 'number',
    min: '4.5',
    max: '9.0',
    step: '0.1',
    class: 'input nsti-num-input salicylate-input',
    placeholder: '6.0',
    value: initialState.urinePh,
  });
  const hoursInput = h('input', {
    id: 'salicylate-hours-input',
    type: 'number',
    min: '0',
    max: '168',
    step: '0.5',
    class: 'input nsti-num-input salicylate-input',
    placeholder: '4',
    value: initialState.hoursSinceIngestion,
  });

  weightInput.addEventListener('input', (e) => updateSalicylateToxState({ weightKg: e.target.value }));
  levelInput.addEventListener('input', (e) => updateSalicylateToxState({ salicylateLevelMgDl: e.target.value }));
  phInput.addEventListener('input', (e) => updateSalicylateToxState({ arterialPh: e.target.value }));
  pco2Input.addEventListener('input', (e) => updateSalicylateToxState({ pco2MmHg: e.target.value }));
  potassiumInput.addEventListener('input', (e) => updateSalicylateToxState({ serumPotassiumMeq: e.target.value }));
  urinePhInput.addEventListener('input', (e) => updateSalicylateToxState({ urinePh: e.target.value }));
  hoursInput.addEventListener('input', (e) => updateSalicylateToxState({ hoursSinceIngestion: e.target.value }));

  const labsCard = h('section', { class: 'card nsti-card salicylate-card' },
    h('h2', { class: 'nsti-card-title' }, tr('2. Patient Weight & Serial Laboratory Inputs', '2. Peso y Parámetros de Laboratorio Seriados')),
    h('div', { class: 'salicylate-inputs-grid' },
      h('div', { class: 'form-group decon-input-group salicylate-form-group' },
        h('label', { for: 'salicylate-weight-input' }, tr('Patient Weight (kg — e.g. 12 kg toddler or 70 kg adult):', 'Peso del Paciente (kg — ej. 12 kg niño o 70 kg adulto):')),
        weightInput,
      ),
      h('div', { class: 'form-group decon-input-group salicylate-form-group' },
        h('label', { for: 'salicylate-level-input' }, tr('Serum Salicylate Level (mg/dL; Acute >=100 / Chronic >=60 HD):', 'Salicilato Sérico (mg/dL; Agudo >=100 / Crónico >=60 Diálisis):')),
        levelInput,
      ),
      h('div', { class: 'form-group decon-input-group salicylate-form-group' },
        h('label', { for: 'salicylate-ph-input' }, tr('Arterial Blood pH (Danger if < 7.30; Cap <= 7.55):', 'pH Arterial (Peligro si < 7.30; Techo <= 7.55):')),
        phInput,
      ),
      h('div', { class: 'form-group decon-input-group salicylate-form-group' },
        h('label', { for: 'salicylate-pco2-input' }, tr('Arterial pCO2 (mmHg — Watch for failing Kussmaul >= 35 in acidemia):', 'pCO2 Arterial (mmHg — Alerta si >= 35 con acidemia):')),
        pco2Input,
      ),
      h('div', { class: 'form-group decon-input-group salicylate-form-group' },
        h('label', { for: 'salicylate-potassium-input' }, tr('Serum Potassium K+ (mEq/L — Blocks urine alkalinization if < 4.0):', 'Potasio Sérico K+ (mEq/L — Bloquea alcalinización si < 4.0):')),
        potassiumInput,
      ),
      h('div', { class: 'form-group decon-input-group salicylate-form-group' },
        h('label', { for: 'salicylate-urine-ph-input' }, tr('Urine pH (Target 7.5–8.0 for renal ion trapping):', 'pH Urinario (Meta 7.5–8.0 para atrapamiento iónico):')),
        urinePhInput,
      ),
      h('div', { class: 'form-group decon-input-group salicylate-form-group' },
        h('label', { for: 'salicylate-hours-input' }, tr('Hours Since Ingestion (EC/SR peaks may rise 12–24+ h):', 'Horas desde Ingestión (Picos EC/SR pueden subir a 12–24+ h):')),
        hoursInput,
      ),
    ),
  );
  leftCol.append(labsCard);

  const flagCheckboxes = SALICYLATE_RED_FLAGS.map((flag) => {
    const inputId = `salicylate-flag-${flag.id}`;
    const cb = h('input', {
      id: inputId,
      type: 'checkbox',
      checked: initialState.checkedFlags.has(flag.id),
    });
    cb.addEventListener('change', (e) => {
      const nextFlags = new Set(getSalicylateToxState().checkedFlags);
      if (e.target.checked) nextFlags.add(flag.id);
      else nextFlags.delete(flag.id);
      updateSalicylateToxState({ checkedFlags: nextFlags });
    });
    return { flag, cb, inputId };
  });

  const redFlagsCard = h('section', { class: 'card nsti-card salicylate-card' },
    h('h2', { class: 'nsti-card-title' }, tr('3. Critical Red Flags & EXTRIP Triggers', '3. Banderas Rojas Críticas y Criterios EXTRIP')),
    h('div', { class: 'decon-checkbox-group salicylate-flag-list' },
      flagCheckboxes.map(({ flag, cb, inputId }) =>
        h('label', {
          for: inputId,
          class: `checkbox-row disaster-check-row salicylate-check-row ${flag.severity === 'critical' ? 'emergency-row' : ''}`,
        },
        cb,
        h('span', { class: 'disaster-check-label' },
          h('strong', null, isEs ? flag.labelEs : flag.labelEn),
          h('span', { class: 'disaster-subtext' }, isEs ? flag.detailEs : flag.detailEn),
        ),
        ),
      ),
    ),
  );
  leftCol.append(redFlagsCard);

  // --------------------------------------------------------------------------
  // RIGHT COLUMN: WAI-ARIA TABLIST & PANELS + ALWAYS-ACCESSIBLE SBAR HANDOFF
  // --------------------------------------------------------------------------

  const tabButtons = [];
  const tabNav = h('div', {
    class: 'tab-nav tabs salicylate-tab-nav',
    role: 'tablist',
    'aria-label': tr('Clinical Protocol Sections', 'Secciones del Protocolo Clínico'),
  });

  const alkalinizationPanelSlot = h('div', { class: 'salicylate-panel-body' });
  const airwayDialysisPanelSlot = h('div', { class: 'salicylate-panel-body' });
  const rulesPanelSlot = h('div', { class: 'salicylate-panel-body' });

  const panelSlotsById = {
    alkalinization: alkalinizationPanelSlot,
    airway_dialysis: airwayDialysisPanelSlot,
    rules: rulesPanelSlot,
  };

  const tabPanels = {};
  TABS.forEach((tabDef) => {
    const isSelected = tabDef.id === initialState.activeTab;
    const tabId = `salicylate-tab-${tabDef.id}`;
    const panelId = `salicylate-panel-${tabDef.id}`;

    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: tabId,
      class: `tab salicylate-tab ${isSelected ? 'active' : ''}`,
      'data-tab': tabDef.id,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': panelId,
    }, isEs ? tabDef.labelEs : tabDef.labelEn);

    btn.addEventListener('click', () => {
      updateSalicylateToxState({ activeTab: tabDef.id });
    });

    tabButtons.push({ id: tabDef.id, btn });
    tabNav.append(btn);

    const panel = h('section', {
      id: panelId,
      role: 'tabpanel',
      'aria-labelledby': tabId,
      class: 'card nsti-card salicylate-card salicylate-tabpanel',
      hidden: !isSelected,
    }, panelSlotsById[tabDef.id]);

    tabPanels[tabDef.id] = panel;
  });

  const clinicalWorkspace = h('div', { class: 'salicylate-workspace' },
    tabNav,
    tabPanels.alkalinization,
    tabPanels.airway_dialysis,
    tabPanels.rules,
  );
  rightCol.append(clinicalWorkspace);

  // Zero-PII SBAR Card (textarea mounted ONCE, NEVER using `value:` prop in h())
  const sbarTextarea = h('textarea', {
    id: 'salicylate-sbar-text',
    class: 'input nsti-sbar-textarea salicylate-sbar-textarea',
    rows: '14',
    readonly: true,
    'aria-label': tr('Zero-PII Salicylate SBAR Clinical Handoff Note', 'Nota Clínica SBAR de Salicilatos sin PII'),
  });

  const copyBtn = h('button', {
    type: 'button',
    id: 'salicylate-copy-sbar-btn',
    class: 'btn btn-primary',
  }, tr('Copy SBAR Handoff', 'Copiar Nota SBAR'));

  copyBtn.addEventListener('click', () => {
    const currentText = formatSalicylateSbarText(getSalicylateToxState(), getLang());
    copyText(currentText, {
      trigger: copyBtn,
      copiedLabel: t('common.copiedBtn', 'Copied'),
      failedLabel: t('common.copyFailedBtn', 'Copy failed — select text manually'),
      announceSuccess: t('common.copiedAnnounce', 'Copied to clipboard.'),
      announceFailure: t('common.copyFailedAnnounce', 'Could not access clipboard. Select the text to copy manually.'),
    });
  });

  const resetBtn = h('button', {
    type: 'button',
    id: 'salicylate-reset-btn',
    class: 'btn btn-ghost',
  }, tr('Reset Clinical Inputs', 'Reiniciar Formulario'));

  resetBtn.addEventListener('click', () => {
    resetSalicylateToxState();
  });

  const poisonLink = tel(
    '1-800-222-1222',
    tr('Call Poison Control (1-800-222-1222)', 'Llamar a Toxicología (1-800-222-1222)'),
    { class: 'btn btn-secondary' },
  );

  const call911Link = tel(
    '911',
    t('common.call911', 'Call 911'),
    { class: 'btn btn-emergency' },
  );

  const sbarCard = h('section', { class: 'card nsti-card salicylate-card salicylate-sbar-card' },
    h('h2', { class: 'nsti-card-title' },
      icon('file-text'),
      h('span', null, tr('Zero-PII SBAR Clinical Handoff Note', 'Nota SBAR de Transferencia Crítica (Cero PII)')),
    ),
    sbarTextarea,
    h('div', { class: 'actions nsti-btn-row salicylate-actions' },
      copyBtn,
      resetBtn,
      poisonLink,
      call911Link,
    ),
  );
  rightCol.append(sbarCard);

  // --------------------------------------------------------------------------
  // FOCUS-PRESERVING SYNC & DYNAMIC RENDERING
  // --------------------------------------------------------------------------

  function syncControls(state) {
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    if (active !== profileSelect) profileSelect.value = state.profile;
    if (active !== weightInput) weightInput.value = String(state.weightKg ?? '');
    if (active !== levelInput) levelInput.value = String(state.salicylateLevelMgDl ?? '');
    if (active !== phInput) phInput.value = String(state.arterialPh ?? '');
    if (active !== pco2Input) pco2Input.value = String(state.pco2MmHg ?? '');
    if (active !== potassiumInput) potassiumInput.value = String(state.serumPotassiumMeq ?? '');
    if (active !== urinePhInput) urinePhInput.value = String(state.urinePh ?? '');
    if (active !== hoursInput) hoursInput.value = String(state.hoursSinceIngestion ?? '');

    for (const { flag, cb } of flagCheckboxes) {
      if (active !== cb) cb.checked = state.checkedFlags.has(flag.id);
    }

    for (const { id, btn } of tabButtons) {
      const selected = id === state.activeTab;
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      if (selected) btn.classList.add('active');
      else btn.classList.remove('active');

      const panel = tabPanels[id];
      if (panel) {
        panel.hidden = !selected;
        if (selected) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      }
    }
    syncTablists(root);
  }

  function renderDynamic() {
    const state = getSalicylateToxState();
    syncControls(state);

    const ev = evaluateSalicylateRisk(state);
    const prof = ev.profile;

    // 1. Top Black-Box / Severity Banner
    clear(alertBannerSlot);
    const bannerClass = ev.intubationGuardrail.active || ev.requiresHemodialysis
      ? 'callout callout-emergency clinical-alert-banner movement-blackbox-banner salicylate-blackbox-banner'
      : 'callout callout-warn clinical-alert-banner salicylate-warn-banner';

    alertBannerSlot.append(
      h('aside', { class: bannerClass, role: 'alert' },
        h('div', { class: 'movement-banner-header' },
          icon('alert'),
          h('strong', null, ` ${isEs ? ev.severityLabelEs : ev.severityLabelEn}`),
        ),
        h('p', null, isEs ? prof.blackBoxEs : prof.blackBoxEn),
        ev.alerts.length > 0
          ? h('ul', { class: 'salicylate-alert-list' },
            ev.alerts.map((a) => h('li', null,
              h('strong', null, `${isEs ? a.titleEs : a.titleEn}: `),
              isEs ? a.bodyEs : a.bodyEn,
            )),
          )
          : null,
      ),
    );

    // 2. Left Profile Details
    clear(profileDetailSlot);
    profileDetailSlot.append(
      h('p', null, h('strong', null, tr('Pathophysiology: ', 'Fisiopatología: ')), isEs ? prof.summaryEs : prof.summaryEn),
      h('p', null, h('strong', null, tr('Dose / Level Thresholds: ', 'Umbrales de Dosis / Nivel: ')), isEs ? prof.doseToxicityEs : prof.doseToxicityEn),
      h('p', null, h('strong', null, tr('Nomogram & Peak Pitfall: ', 'Trampa de Nomograma / Pico: ')), isEs ? prof.nomogramPitfallEs : prof.nomogramPitfallEn),
      h('p', null, h('strong', null, tr('APAP Co-Formulation Check: ', 'Cribado de Paracetamol (APAP): ')), isEs ? prof.apapScreeningEs : prof.apapScreeningEn),
    );

    // 3. Tab Panel 1: Alkalinization & K+ Block Gate
    clear(alkalinizationPanelSlot);
    alkalinizationPanelSlot.append(
      h('h2', { class: 'nsti-card-title' }, tr('Urine Alkalinization Protocol & Hypokalemia Block Gate', 'Protocolo de Alcalinización Urinaria y Compuerta de Potasio')),
      h('div', { class: `rule-card decon-directive-box salicylate-rule-card ${ev.alkalinization.hypokalemiaBlocked ? 'salicylate-rule-warning' : ''}` },
        h('h3', null, tr('Weight-Based IV Sodium Bicarbonate Regimen', 'Régimen IV de Bicarbonato de Sodio por Peso')),
        h('p', null,
          h('strong', null, tr('• Initial IV Bolus (8.4% NaHCO3, 1–2 mEq/kg): ', '• Bolo IV Inicial (NaHCO3 8.4%, 1–2 mEq/kg): ')),
          `${ev.alkalinization.bolusMeqMin}–${ev.alkalinization.bolusMeqMax} mEq (${ev.alkalinization.bolusMlMin}–${ev.alkalinization.bolusMlMax} mL; ~${ev.alkalinization.bolusAmpulesMin}–${ev.alkalinization.bolusAmpulesMax} amps)`,
        ),
        h('p', null,
          h('strong', null, tr('• Isotonic Maintenance Bag: ', '• Infusión Isotónica de Mantenimiento: ')),
          tr(
            `3 ampules (150 mEq) 8.4% NaHCO3 in 1 L D5W at ${ev.alkalinization.infusionRateMlHrMin}–${ev.alkalinization.infusionRateMlHrMax} mL/hr (1.5–2.0 mL/kg/hr). NEVER use 0.9% Normal Saline carrier.`,
            `3 ámpulas (150 mEq) NaHCO3 8.4% en 1 L D5W a ${ev.alkalinization.infusionRateMlHrMin}–${ev.alkalinization.infusionRateMlHrMax} mL/h (1.5–2.0 mL/kg/h). NUNCA diluir en SSN 0.9%.`,
          ),
        ),
        h('p', null,
          h('strong', null, tr('• Targets: ', '• Metas Terapéuticas: ')),
          tr(
            `Urine pH ${ev.alkalinization.targetUrinePh} | Urine Output ${ev.alkalinization.targetUrineOutputMinMlHr}–${ev.alkalinization.targetUrineOutputMaxMlHr} mL/hr | Cap Arterial pH <= ${ev.alkalinization.maxArterialPhCeiling}`,
            `pH Urinario ${ev.alkalinization.targetUrinePh} | Diuresis ${ev.alkalinization.targetUrineOutputMinMlHr}–${ev.alkalinization.targetUrineOutputMaxMlHr} mL/h | Techo pH Arterial <= ${ev.alkalinization.maxArterialPhCeiling}`,
          ),
        ),
      ),
      h('div', { class: `callout ${ev.alkalinization.hypokalemiaBlocked || ev.alkalinization.hasAkiOrOliguria ? 'callout-emergency' : 'callout-warn'} salicylate-k-gate` },
        h('p', { class: 'callout-title' },
          icon('alert'),
          h('strong', null, tr(' Hypokalemia Alkalinization Block Guardrail (K+ < 4.0 mEq/L)', ' Guardarraíl de Bloqueo por Hipopotasemia (K+ < 4.0 mEq/L)')),
        ),
        h('p', null, isEs ? ev.alkalinization.kGateWarningEs : ev.alkalinization.kGateWarningEn),
        h('p', null,
          h('strong', null, tr('• Ordered KCl Additive: ', '• Aditivo KCl Ordenado: ')),
          `${ev.alkalinization.kclRangeMeqPerL} mEq/L`,
        ),
      ),
      h('div', { class: 'disaster-action-list' },
        ev.actions.map((act) =>
          h('div', { class: 'disaster-action-item' },
            h('span', { class: `disaster-badge badge-${act.priority === 'stat' ? 'danger' : act.priority === 'urgent' ? 'warning' : 'low'}` }, act.priority.toUpperCase()),
            h('span', null, ` ${isEs ? act.textEs : act.textEn}`),
          ),
        ),
      ),
    );

    // 4. Tab Panel 2: Pre-Intubation Airway Protection, CSF Neuroglycopenia & EXTRIP
    clear(airwayDialysisPanelSlot);
    airwayDialysisPanelSlot.append(
      h('h2', { class: 'nsti-card-title' }, tr('Pre-Intubation Kussmaul Rule, CSF Glucose & EXTRIP Dialysis', 'Regla Pre-Intubación Kussmaul, Glucosa en LCR y Diálisis EXTRIP')),
      h('div', { class: 'callout callout-emergency salicylate-airway-box' },
        h('p', { class: 'callout-title' },
          icon('alert'),
          h('strong', null, ` ${isEs ? ev.intubationGuardrail.blackBoxHeadlineEs : ev.intubationGuardrail.blackBoxHeadlineEn}`),
        ),
        h('p', null, isEs ? ev.intubationGuardrail.blackBoxDetailEs : ev.intubationGuardrail.blackBoxDetailEn),
        h('p', null,
          h('strong', null, tr('• Required Ventilator Minute Ventilation: ', '• Ventilación Minuto Obligatoria: ')),
          `${ev.intubationGuardrail.targetMinuteVentilationLMin} (${ev.intubationGuardrail.recommendedRrRange}; TV ${ev.intubationGuardrail.recommendedTidalVolumeMlRange})`,
        ),
        h('p', null,
          h('strong', null, tr('• Mandatory Pre-RSI Bolus: ', '• Bolo Pre-ISR Obligatorio: ')),
          ev.intubationGuardrail.preRsiBicarbBolus,
        ),
      ),
      h('div', { class: 'rule-card decon-directive-box salicylate-rule-card' },
        h('h3', null, isEs ? ev.neuroglycopeniaAlert.headlineEs : ev.neuroglycopeniaAlert.headlineEn),
        h('p', null, isEs ? ev.neuroglycopeniaAlert.directiveEs : ev.neuroglycopeniaAlert.directiveEn),
      ),
      h('div', { class: `rule-card decon-directive-box salicylate-rule-card ${ev.requiresHemodialysis ? 'salicylate-dialysis-active' : ''}` },
        h('h3', null, tr('EXTRIP Hemodialysis Evaluation', 'Evaluación de Hemodiálisis EXTRIP')),
        h('p', null,
          h('strong', null, tr('Status: ', 'Estado: ')),
          ev.requiresHemodialysis
            ? tr('EMERGENT HEMODIALYSIS INDICATED', 'HEMODIÁLISIS DE EMERGENCIA INDICADA')
            : tr('No absolute EXTRIP trigger met yet — continue q2h serial trending', 'Sin criterio EXTRIP absoluto aún — continuar niveles cada 2 h'),
        ),
        ev.requiresHemodialysis
          ? h('ul', { class: 'list' },
            (isEs ? ev.extripDialysisReasonsEs : ev.extripDialysisReasonsEn).map((r) => h('li', null, r)),
          )
          : null,
      ),
    );

    // 5. Tab Panel 3: Cardinal Salicylate Rules & APAP Screening
    clear(rulesPanelSlot);
    rulesPanelSlot.append(
      h('h2', { class: 'nsti-card-title' }, tr('Cardinal Salicylate Rules & Co-Ingestion Safeguards', 'Reglas Cardinales de Salicilatos y Co-Ingestión')),
      ...CARDINAL_SALICYLATE_RULES.map((rule) =>
        h('article', { class: 'rule-card decon-directive-box salicylate-rule-card' },
          h('h3', null, isEs ? rule.titleEs : rule.titleEn),
          h('p', null, isEs ? rule.bodyEs : rule.bodyEn),
        ),
      ),
    );

    // 6. Update SBAR Textarea safely (skipping only if user focused inside)
    const sbarText = formatSalicylateSbarText(state, getLang());
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    if (active !== sbarTextarea) {
      sbarTextarea.value = sbarText;
      sbarTextarea.textContent = sbarText;
    }
  }

  let wasConnected = false;
  const onStateChange = () => {
    wasConnected = wasConnected || Boolean(root.isConnected);
    if (wasConnected && root.isConnected === false) {
      unsubscribe();
      return;
    }
    renderDynamic();
  };

  renderDynamic();
  const unsubscribe = subscribeSalicylateToxState(onStateChange);

  if (hostContainer) {
    clear(hostContainer);
    hostContainer.append(root);
    wireTablistKeyboard(hostContainer);
    syncTablists(hostContainer);
    root._cleanup = unsubscribe;
    hostContainer._cleanup = unsubscribe;
    return hostContainer;
  }

  wireTablistKeyboard(root);
  syncTablists(root);
  root._cleanup = unsubscribe;
  return root;
}

export default salicylateToxView;
