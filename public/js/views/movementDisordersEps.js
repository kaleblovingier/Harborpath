// public/js/views/movementDisordersEps.js
// HarborPath - Stimulant Movement Disorders, Choreoathetosis & Acute Dystonia / EPS Decision Engine
// Clinical & Toxicological Framework: ACMT / ACEP Project BETA Agitation Consensus,
// Hunter Serotonin Toxicity Criteria, DSM-5 / ICD-11 Extrapyramidal Symptom Guidelines,
// and the Black-Box Prohibition of Haloperidol in Acute Psychostimulant Toxicity.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL PHENOTYPES & TOXICOLOGY CONSTANTS
// ============================================================================

export const MOVEMENT_PHENOTYPES = Object.freeze({
  choreoathetosis: Object.freeze({
    id: 'choreoathetosis',
    nameEn: 'Stimulant-Induced Choreoathetosis ("Meth Dance" / "Crack Dancing")',
    nameEs: 'Coreoatetosis Inducida por Estimulantes («Baile del Cristal / Crack»)',
    etiologyEn: 'Acute or binge methamphetamine, synthetic cathinones ("bath salts"), or crack cocaine.',
    etiologyEs: 'Uso agudo o en atracón de metanfetamina, catinonas sintéticas o crack de cocaína.',
    featuresEn: 'Involuntary, continuous, rapid jerky choreic movements mixed with slow sinuous writhing (athetoid) contortions of tongue, face, fingers, and pelvis. Awake, afebrile, tone normal without lead-pipe rigidity.',
    featuresEs: 'Movimientos involuntarios continuos, rápidos y espasmódicos combinados con torsiones lentas y serpenteantes de lengua, cara, dedos y pelvis. Alerta, afebril y tono muscular normal.',
    firstLineEn: 'IV Benzodiazepines (Lorazepam 2–4 mg IV or Diazepam 5–10 mg IV q10min) + quiet low-stimulation environment + isotonic IV hydration.',
    firstLineEs: 'Benzodiacepinas IV (Lorazepam 2-4 mg IV o Diazepam 5-10 mg IV c/10min) + ambiente de bajo estímulo + hidratación isotónica IV.',
    contraindicationEn: 'DO NOT administer Haloperidol or first-generation neuroleptics. Worsens motor chaos and risks seizures.',
    contraindicationEs: 'NO administrar Haloperidol ni neurolépticos típicos. Empeora el cuadro motor y precipita convulsiones.',
    severity: 'moderate',
  }),

  acute_dystonia: Object.freeze({
    id: 'acute_dystonia',
    nameEn: 'Acute Dystonic Reaction (Extrapyramidal Symptom - EPS)',
    nameEs: 'Reacción Distónica Aguda (Síntoma Extrapiramidal - SEP)',
    etiologyEn: 'Acute dopamine D2 receptor blockade by neuroleptics (haloperidol, risperidone) or antiemetics (metoclopramide, prochlorperazine).',
    etiologyEs: 'Bloqueo agudo de receptores D2 por neurolépticos (haloperidol, risperidona) o antieméticos (metoclopramida, proclorperazina).',
    featuresEn: 'Sustained, agonizing involuntary muscle spasms: oculogyric crisis (upward eye deviation), torticollis (neck twist), trismus (jaw lock), or opisthotonos. CRITICAL: Laryngeal dystonia produces inspiratory stridor and acute asphyxia.',
    featuresEs: 'Espasmos musculares sostenidos y dolorosos: crisis oculógira (ojos desviados hacia arriba), tortícolis, trismus (mandíbula bloqueada) u opistótonos. CRÍTICO: La distonía laríngea causa estridor y asfixia aguda.',
    firstLineEn: 'Diphenhydramine 50 mg IV slow push over 2 min (or deep IM), OR Benztropine 1–2 mg IV/IM. Maintenance: oral therapy for 48–72 hours.',
    firstLineEs: 'Difenhidramina 50 mg IV lento en 2 min (o IM profunda), O Benztropina 1-2 mg IV/IM. Mantenimiento: terapia oral por 48-72 horas.',
    contraindicationEn: 'Never ignore inspiratory stridor; prepare difficult airway cart and non-depolarizing paralytic (rocuronium).',
    contraindicationEs: 'Nunca ignorar el estridor laríngeo; preparar intubación de vía aérea difícil con relajante no despolarizante (rocuronio).',
    severity: 'high',
  }),

  akathisia: Object.freeze({
    id: 'akathisia',
    nameEn: 'Akathisia (Severe Motor Restlessness)',
    nameEs: 'Acatisia (Inquietud Motora Grave)',
    etiologyEn: 'Dopamine D2 antagonist exposure. Strongly linked to acute dysphoria, impulsivity, and sudden suicidal ideation.',
    etiologyEs: 'Exposición a antagonistas D2. Fuertemente asociada a disforia aguda, impulsividad e ideación suicida repentina.',
    featuresEn: 'Agonizing subjective inner unrest ("jumping out of one\'s skin") with continuous objective purposeless movements: pacing, foot shifting, crossing legs. Distinguished from stimulant purposive stereotypic actions.',
    featuresEs: 'Inquietud interna subjetiva desesperante («sentir que la piel quema») con movimientos continuos sin objetivo: deambulación constante y balanceo de piernas. Se distingue de la estereotipia por estimulantes.',
    firstLineEn: 'Propranolol 10–20 mg PO BID/TID (titrated up to 40–80 mg/day) + Clonidine 0.1 mg PO BID. Discontinue offending D2 antagonist.',
    firstLineEs: 'Propranolol 10-20 mg VO c/8-12h (hasta 40-80 mg/día) + Clonidina 0,1 mg VO c/12h. Suspender de inmediato el fármaco causante.',
    contraindicationEn: 'Do not dismiss as "psychiatric agitation" or administer additional neuroleptics (lethal exacerbation).',
    contraindicationEs: 'No confundir con agitación psicótica ni administrar más neurolépticos (empeoramiento catastrófico).',
    severity: 'moderate',
  }),

  parkinsonism: Object.freeze({
    id: 'parkinsonism',
    nameEn: 'Drug-Induced Parkinsonism (Pseudoparkinsonism)',
    nameEs: 'Parkinsonismo Farmacológico (Pseudoparkinsonismo)',
    etiologyEn: 'Subacute or chronic dopamine D2 receptor blockade reducing nigrostriatal dopaminergic transmission.',
    etiologyEs: 'Bloqueo subagudo o crónico de receptores D2 reduciendo la transmisión dopaminérgica nigroestriatal.',
    featuresEn: 'Bilateral 4–6 Hz resting tremor ("pill-rolling"), cogwheel rigidity, bradykinesia, masked facial expression (hypomimia), and shuffling festinating gait. Afebrile.',
    featuresEs: 'Temblor de reposo bilateral de 4-6 Hz, rigidez en rueda dentada, bradicinesia, facies inexpresiva y marcha festinante a pequeños pasos. Afebril.',
    firstLineEn: 'Benztropine 1–2 mg PO BID, or Amantadine 100 mg PO BID. Taper offending antipsychotic to lowest effective dose or switch to atypical.',
    firstLineEs: 'Benztropina 1-2 mg VO c/12h, o Amantadina 100 mg VO c/12h. Reducir la dosis del antipsicótico o cambiar a atípico.',
    contraindicationEn: 'Avoid abrupt withdrawal without bridge medication.',
    contraindicationEs: 'Evitar la suspensión brusca sin medicación puente.',
    severity: 'low',
  }),

  nms: Object.freeze({
    id: 'nms',
    nameEn: 'Neuroleptic Malignant Syndrome (NMS)',
    nameEs: 'Síndrome Neuroléptico Maligno (SNM)',
    etiologyEn: 'Dopamine D2 receptor antagonism or sudden withdrawal of dopamine agonists (e.g., levodopa, bromocriptine).',
    etiologyEs: 'Antagonismo de receptores D2 o retiro brusco de agonistas dopaminérgicos (levodopa, bromocriptina).',
    featuresEn: 'Tetrad: Generalized "lead-pipe" muscle rigidity + severe hyperpyrexia (> 38–40°C) + autonomic instability + altered mental status. Extreme CK elevation (1,000 to > 50,000 U/L). Normal or decreased reflexes.',
    featuresEs: 'Tétrada: Rigidez muscular generalizada en «tubo de plomo» + hiperpirexia grave (> 38-40°C) + inestabilidad autonómica + alteración mental. Elevación masiva de CPK (1.000 a > 50.000 U/L). Reflejos normales o disminuidos.',
    firstLineEn: 'EMERGENCY ICU ADMISSION. Discontinue all neuroleptics. Aggressive cooling + Bromocriptine 2.5–5 mg PO TID + Dantrolene 1–2.5 mg/kg IV push q10min (max 10 mg/kg/day).',
    firstLineEs: 'INGRESO URGENTE A UCI. Suspender todos los neurolépticos. Enfriamiento activo + Bromocriptina 2,5-5 mg VO c/8h + Dantroleno 1-2,5 mg/kg IV en bolo c/10min (máx 10 mg/kg/día).',
    contraindicationEn: 'ABSOLUTE CONTRAINDICATION: Antipsychotics, restraints without sedation (rhabdomyolysis death).',
    contraindicationEs: 'CONTRAINDICACIÓN ABSOLUTA: Antipsicóticos, sujeción física sin sedación (muerte por rabdomiólisis).',
    severity: 'critical',
  }),

  hyperpyrexia_hunter: Object.freeze({
    id: 'hyperpyrexia_hunter',
    nameEn: 'Serotonin Toxicity (Hunter Criteria) vs Sympathomimetic Hyperpyrexia',
    nameEs: 'Toxicidad Serotoninérgica (Criterios de Hunter) vs Hiperpirexia Simpaticomimética',
    etiologyEn: 'Serotonergic synergy (SSRIs/SNRIs, MDMA, tramadol, fentanyl) vs pure catecholaminergic stimulant surge (methamphetamine, cocaine).',
    etiologyEs: 'Sinergia serotoninérgica (ISRS, MDMA, tramadol, fentanilo) vs tormenta catecolaminérgica por estimulantes (metanfetamina, cocaína).',
    featuresEn: 'Hunter Criteria: Spontaneous clonus, inducible/ocular clonus + agitation/diaphoresis, hyperreflexia (legs > arms), and hyperactive bowel. Sympathomimetic: Severe hypertension, mydriasis, hyperthermia WITHOUT clonus.',
    featuresEs: 'Criterios de Hunter: Clonus espontáneo o inducible, hiperreflexia (piernas > brazos) y ruidos intestinales aumentados. Simpaticomimética: Hipertensión severa, midriasis e hipertermia SIN clonus.',
    firstLineEn: 'Aggressive external cooling (< 39°C in 30 min) + IV Benzodiazepines. For serotonin syndrome: Cyproheptadine 12 mg PO load, then 2 mg q2h. IV hydration 20–30 mL/kg.',
    firstLineEs: 'Enfriamiento externo intensivo (< 39°C en 30 min) + Benzodiacepinas IV. Para síndrome serotoninérgico: Ciproheptadina 12 mg VO de carga, luego 2 mg c/2h. Hidratación 20-30 mL/kg.',
    contraindicationEn: 'Antipyretics (acetaminophen/ibuprofen) are INEFFECTIVE and worsen liver damage. Haloperidol lowers seizure threshold and worsens hyperthermia.',
    contraindicationEs: 'Los antipiréticos (paracetamol) son INEFICACES y empeoran el daño hepático. Haloperidol baja el umbral convulsivo y agrava la hipertermia.',
    severity: 'critical',
  }),
});

export const HALOPERIDOL_PROHIBITION = Object.freeze({
  ruleTitleEn: 'BLACK-BOX WARNING: HALOPERIDOL PROHIBITED IN ACUTE STIMULANT TOXICITY',
  ruleTitleEs: 'ADVERTENCIA DE CAJA NEGRA: HALOPERIDOL PROHIBIDO EN INTOXICACIÓN POR ESTIMULANTES',
  mechanisms: Object.freeze([
    {
      titleEn: '1. Lowers Seizure Threshold',
      titleEs: '1. Reduce el Umbral Convulsivo',
      descEn: 'Cerebral cortex is primed by excessive dopamine and glutamate. Haloperidol triggers intractable status epilepticus.',
      descEs: 'La corteza cerebral está sobrexcitada por dopamina y glutamato. Haloperidol desencadena estado epiléptico refractario.',
    },
    {
      titleEn: '2. Exacerbates Lethal Hyperthermia',
      titleEs: '2. Agrava la Hipertermia Letal',
      descEn: 'Inhibits diaphoresis and central thermoregulation while causing extrapyramidal muscle rigidity, converting 39°C to fatal > 42°C heat stroke.',
      descEs: 'Inhibe la sudoración y la termorregulación central mientras induce rigidez muscular, transformando 39°C en golpe de calor mortal > 42°C.',
    },
    {
      titleEn: '3. Synergistic QTc Prolongation & Torsades de Pointes',
      titleEs: '3. Prolongación Sinérgica de QTc y Torsades de Pointes',
      descEn: 'Blocks cardiac hERG/IKr potassium channels in the presence of catecholamine excess, precipitating fatal polymorphic ventricular dysrhythmias.',
      descEs: 'Bloquea los canales cardíacos de potasio hERG/IKr en presencia de catecolaminas, precipitando arritmias ventriculares letales.',
    },
    {
      titleEn: '4. Precipitates Fulminant NMS & Laryngeal Dystonia',
      titleEs: '4. Precipita SNM Fulminante y Distonía Laríngea',
      descEn: 'Sudden D2 blockade in a depleted state triggers acute muscular collapse, airway spasm, and massive rhabdomyolysis.',
      descEs: 'El bloqueo repentino de D2 en un sistema exhausto desencadena colapso muscular, espasmo de vía aérea y rabdomiólisis masiva.',
    },
  ]),
});

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateMovementDisorder({
  phenotype = 'choreoathetosis',
  coreTemp = 37.0,
  hasStridor = false,
  hasClonus = false,
  hasLeadPipeRigidity = false,
  recentAntipsychotic = false,
  recentMethamphetamine = true,
  ckLevel = 150,
} = {}) {
  const alerts = [];
  const urgentDirectives = [];
  const medicationsToAdminister = [];

  const phenoInfo = MOVEMENT_PHENOTYPES[phenotype] || MOVEMENT_PHENOTYPES.choreoathetosis;

  // Laryngeal Dystonia Airway Emergency
  if (hasStridor || (phenotype === 'acute_dystonia' && hasStridor)) {
    alerts.push({
      type: 'critical',
      textEn: 'AIRWAY EMERGENCY: Laryngeal Dystonia / Stridor. Imminent asphyxiation hazard. Immediate IV Diphenhydramine 50 mg + 100% O2. Prepare difficult airway intubation cart.',
      textEs: 'EMERGENCIA DE VÍA AÉREA: Distonía Laríngea / Estridor. Peligro de asfixia inminente. Difenhidramina 50 mg IV inmediata + O2 al 100%. Preparar carro de intubación difícil.',
    });
    urgentDirectives.push({
      priority: 'stat',
      titleEn: 'Administer Diphenhydramine 50 mg IV Slow Push',
      titleEs: 'Administrar Difenhidramina 50 mg IV Lento',
      descEn: 'Reverse acute vocal cord spasm within 3–5 minutes. If refractory after 20 min, repeat dose or give Benztropine 1–2 mg IV.',
      descEs: 'Revierte el espasmo de cuerdas vocales en 3-5 min. Si no responde en 20 min, repetir dosis o dar Benztropina 1-2 mg IV.',
    });
    medicationsToAdminister.push('Diphenhydramine 50 mg IV (or Benztropine 1–2 mg IV)');
  }

  // Hyperthermia Evaluation
  if (coreTemp >= 39.0) {
    alerts.push({
      type: 'danger',
      textEn: `CRITICAL HYPERTHERMIA (${coreTemp.toFixed(1)}°C / ${(coreTemp * 1.8 + 32).toFixed(1)}°F): Severe risk of thermal encephalopathy, rhabdomyolysis, and DIC. Target < 39°C within 30 minutes.`,
      textEs: `HIPERTERMIA CRÍTICA (${coreTemp.toFixed(1)}°C / ${(coreTemp * 1.8 + 32).toFixed(1)}°F): Riesgo extremo de encefalopatía térmica, rabdomiólisis y CID. Objetivo < 39°C en 30 minutos.`,
    });
    urgentDirectives.push({
      priority: 'stat',
      titleEn: 'Rapid External Evaporative / Ice Immersion Cooling',
      titleEs: 'Enfriamiento Rápido Externo por Evaporación o Inmersión en Hielo',
      descEn: 'Continuous misting + fans + ice packs to axillae/groin/neck. ANTIPYRETICS ARE STRICTLY CONTRAINDICATED (ineffective and hepatotoxic).',
      descEs: 'Rociado continuo + ventiladores + hielo en axilas/ingles/cuello. LOS ANTIPIRÉTICOS ESTÁN ESTRICTAMENTE CONTRAINDICADOS.',
    });
  }

  // Lead-Pipe Rigidity & NMS
  if (hasLeadPipeRigidity || phenotype === 'nms') {
    alerts.push({
      type: 'critical',
      textEn: 'NEUROLEPTIC MALIGNANT SYNDROME SUSPECTED: Generalized lead-pipe rigidity with fever. Immediate ICU admission and dopamine agonist / dantrolene therapy required.',
      textEs: 'SOSPECHA DE SÍNDROME NEUROLÉPTICO MALIGNO: Rigidez en tubo de plomo con fiebre. Requiere ingreso inmediato a UCI y agonistas dopaminérgicos / dantroleno.',
    });
    urgentDirectives.push({
      priority: 'high',
      titleEn: 'Initiate NMS ICU Protocol',
      titleEs: 'Iniciar Protocolo de UCI para SNM',
      descEn: 'Discontinue all D2 blockers. Administer Bromocriptine 2.5–5 mg PO TID and consider Dantrolene 1–2.5 mg/kg IV push. Monitor CK and renal function.',
      descEs: 'Suspender todo bloqueador D2. Dar Bromocriptina 2,5-5 mg VO c/8h y valorar Dantroleno 1-2,5 mg/kg IV en bolo. Monitorizar CPK y función renal.',
    });
    medicationsToAdminister.push('Bromocriptine 2.5 mg PO TID');
    medicationsToAdminister.push('Dantrolene 1–2.5 mg/kg IV (if severe hyperthermic rigidity)');
  }

  // Clonus & Serotonin Syndrome
  if (hasClonus) {
    alerts.push({
      type: 'danger',
      textEn: 'SEROTONIN TOXICITY (HUNTER CRITERIA POSITIVE): Spontaneous or inducible clonus present. Differentiates from pure stimulant intoxication.',
      textEs: 'TOXICIDAD SEROTONINÉRGICA (CRITERIOS DE HUNTER POSITIVOS): Clonus espontáneo o inducible presente. Diferencia de intoxicación pura por estimulantes.',
    });
    urgentDirectives.push({
      priority: 'high',
      titleEn: 'Administer Cyproheptadine + IV Benzodiazepines',
      titleEs: 'Administrar Ciproheptadina + Benzodiacepinas IV',
      descEn: 'Cyproheptadine 12 mg PO loading dose, then 2 mg q2h until clinical stabilization. IV Diazepam or Lorazepam for neuromuscular calming.',
      descEs: 'Ciproheptadina 12 mg VO de carga, luego 2 mg c/2h hasta estabilización. Diazepam o Lorazepam IV para control neuromuscular.',
    });
    medicationsToAdminister.push('Cyproheptadine 12 mg PO');
    medicationsToAdminister.push('Lorazepam 2–4 mg IV');
  }

  // Rhabdomyolysis alert
  if (ckLevel >= 1000) {
    alerts.push({
      type: 'warning',
      textEn: `Severe Rhabdomyolysis Alert (CK = ${ckLevel} U/L): High risk of myoglobinuric acute kidney injury. Target urine output > 2–3 mL/kg/hr with aggressive IV crystalloids.`,
      textEs: `Alerta de Rabdomiólisis Grave (CPK = ${ckLevel} U/L): Alto riesgo de insuficiencia renal aguda por mioglobina. Mantener diuresis > 2-3 mL/kg/h con cristaloides IV.`,
    });
    urgentDirectives.push({
      priority: 'high',
      titleEn: 'Aggressive Isotonic Crystalloid Resuscitation',
      titleEs: 'Reanimación Intensiva con Cristaloides Isotónicos',
      descEn: 'Administer Normal Saline or Lactated Ringer\'s 20–30 mL/kg bolus, then 200–300 mL/hr to prevent tubular necrosis.',
      descEs: 'Administrar Solución Salina o Ringer Lactato 20-30 mL/kg en bolo, luego 200-300 mL/h para evitar necrosis tubular.',
    });
  }

  // Standard Phenotype Actions if no overriding emergency
  if (phenotype === 'acute_dystonia' && !hasStridor) {
    urgentDirectives.push({
      priority: 'high',
      titleEn: 'Administer Anticholinergic Antidote',
      titleEs: 'Administrar Antídoto Anticolinérgico',
      descEn: 'Diphenhydramine 50 mg IV/IM or Benztropine 1–2 mg IV/IM. Muscle relaxation begins within 3–15 minutes. Follow with oral maintenance x 48–72h.',
      descEs: 'Difenhidramina 50 mg IV/IM o Benztropina 1-2 mg IV/IM. Relajación en 3-15 min. Continuar por vía oral 48-72h.',
    });
    medicationsToAdminister.push('Diphenhydramine 50 mg IV/IM (or Benztropine 1–2 mg IV/IM)');
    medicationsToAdminister.push('Diphenhydramine 25–50 mg PO TID x 48–72h (Maintenance)');
  } else if (phenotype === 'choreoathetosis') {
    urgentDirectives.push({
      priority: 'medium',
      titleEn: 'Sedate with GABA-A Agonist (Benzodiazepine)',
      titleEs: 'Sedación con Agonista GABA-A (Benzodiacepina)',
      descEn: 'Lorazepam 2–4 mg IV or Diazepam 5–10 mg IV q10min until motor calming and pulse < 100 bpm. Provide quiet sensory-reduced room.',
      descEs: 'Lorazepam 2-4 mg IV o Diazepam 5-10 mg IV c/10min hasta control motor y pulso < 100 lpm. Disponer habitación silenciosa.',
    });
    medicationsToAdminister.push('Lorazepam 2–4 mg IV (or Diazepam 5–10 mg IV)');
  } else if (phenotype === 'akathisia') {
    urgentDirectives.push({
      priority: 'medium',
      titleEn: 'Initiate Central Sympathetic / Beta Blocker Therapy',
      titleEs: 'Iniciar Terapia con Betabloqueante / Simpaticolítico',
      descEn: 'Propranolol 10–20 mg PO BID to TID (monitor HR/BP) or Clonidine 0.1 mg PO BID. Discontinue offending D2 antagonist.',
      descEs: 'Propranolol 10-20 mg VO c/8-12h (monitorizar FC/PA) o Clonidina 0,1 mg VO c/12h. Suspender el bloqueador D2 causal.',
    });
    medicationsToAdminister.push('Propranolol 10–20 mg PO BID/TID');
  }

  return {
    phenoInfo,
    alerts,
    urgentDirectives,
    medicationsToAdminister,
  };
}

// ============================================================================
// ZERO-PII EPHEMERAL STATE CONTROLLER
// ============================================================================

let state = {
  phenotype: 'choreoathetosis',
  coreTemp: 37.2,
  hasStridor: false,
  hasClonus: false,
  hasLeadPipeRigidity: false,
  recentAntipsychotic: false,
  recentMethamphetamine: true,
  ckLevel: 250,
};

const subscribers = new Set();

export function getMovementState() {
  return { ...state };
}

export function updateMovementState(patch) {
  state = { ...state, ...patch };
  subscribers.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('State subscriber error', e);
    }
  });
}

export function resetMovementState() {
  state = {
    phenotype: 'choreoathetosis',
    coreTemp: 37.2,
    hasStridor: false,
    hasClonus: false,
    hasLeadPipeRigidity: false,
    recentAntipsychotic: false,
    recentMethamphetamine: true,
    ckLevel: 250,
  };
  subscribers.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('State subscriber error', e);
    }
  });
}

export function subscribeMovementState(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// ============================================================================
// SBAR CLINICAL HANDOFF GENERATOR
// ============================================================================

export function generateMovementSbar(st, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateMovementDisorder(st);

  if (isEs) {
    return [
      'TRANSFERENCIA CLÍNICA SBAR - TRASTORNOS DEL MOVIMIENTO Y SEP (CERO PII)',
      '-------------------------------------------------------------------------',
      `S (Situación): Paciente con presentación motora anormal compatible con ${evalResult.phenoInfo.nameEs.toUpperCase()}.`,
      `B (Antecedentes): Uso reciente de estimulantes: ${st.recentMethamphetamine ? 'SÍ' : 'NO'}. Exposición a antipsicóticos/bloqueadores D2: ${st.recentAntipsychotic ? 'SÍ' : 'NO'}.`,
      `A (Evaluación): Temp Central: ${st.coreTemp.toFixed(1)}°C. Estridor / Vía Aérea: ${st.hasStridor ? 'COMPROMETIDA (CRÍTICO)' : 'Permeable'}. Clonus (Hunter): ${st.hasClonus ? 'PRESENTE' : 'Ausente'}. Rigidez en tubo de plomo: ${st.hasLeadPipeRigidity ? 'PRESENTE' : 'Ausente'}. CPK sérica: ${st.ckLevel} U/L.`,
      `R (Recomendación): ${evalResult.medicationsToAdminister.join('; ')}. ${st.coreTemp >= 39.0 ? 'Enfriamiento activo STAT. ' : ''}CONTRAINDICACIÓN ESTRICTA: NO ADMINISTRAR HALOPERIDOL NI NEUROLÉPTICOS TÍPICOS.`,
    ].join('\n');
  }

  return [
    'SBAR CLINICAL HANDOFF - MOVEMENT DISORDERS & EPS TRIAGE (ZERO-PII)',
    '-------------------------------------------------------------------------',
    `S (Situation): Patient presenting with acute motor abnormalities consistent with ${evalResult.phenoInfo.nameEn.toUpperCase()}.`,
    `B (Background): Recent stimulant use: ${st.recentMethamphetamine ? 'YES' : 'NO'}. Antipsychotic / D2 antagonist exposure: ${st.recentAntipsychotic ? 'YES' : 'NO'}.`,
    `A (Assessment): Core Temp: ${st.coreTemp.toFixed(1)}°C. Airway / Stridor: ${st.hasStridor ? 'COMPROMISED (CRITICAL)' : 'Patent'}. Clonus (Hunter criteria): ${st.hasClonus ? 'PRESENT' : 'Absent'}. Lead-pipe rigidity: ${st.hasLeadPipeRigidity ? 'PRESENT' : 'Absent'}. Serum CK: ${st.ckLevel} U/L.`,
    `R (Recommendation): ${evalResult.medicationsToAdminister.join('; ')}. ${st.coreTemp >= 39.0 ? 'Initiate aggressive external cooling STAT. ' : ''}STRICT TOXICOLOGY PROHIBITION: DO NOT ADMINISTER HALOPERIDOL OR FIRST-GENERATION NEUROLEPTICS.`,
  ].join('\n');
}

// ============================================================================
// MAIN DOM VIEW
// ============================================================================

export function movementDisordersEpsView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const container = h('div', { class: 'movement-disorders-view' });

  // Header
  const header = pageHeader({
    title: isEs
      ? 'Trastornos del Movimiento por Estimulantes y Triaje de SEP / Distonía Aguda'
      : 'Stimulant Movement Disorders & Acute Dystonia / EPS Decision Engine',
    subtitle: isEs
      ? 'Coreoatetosis («meth dance»), distonía laríngea, acatisia, SNM, criterios de Hunter y prohibición estricta de haloperidol'
      : 'Choreoathetosis ("meth dance"), acute dystonia, akathisia, NMS, Hunter serotonin criteria & strict haloperidol prohibition',
  });
  container.appendChild(header);

  // Black-Box Prohibition Banner
  const bbBanner = h('div', { class: 'movement-blackbox-banner' });
  container.appendChild(bbBanner);

  const bbHead = h('div', { class: 'movement-banner-header' });
  bbHead.appendChild(icon('alert'));
  bbHead.appendChild(h('strong', null, isEs ? HALOPERIDOL_PROHIBITION.ruleTitleEs : HALOPERIDOL_PROHIBITION.ruleTitleEn));
  bbBanner.appendChild(bbHead);

  const bbGrid = h('div', { class: 'movement-bb-grid' });
  bbBanner.appendChild(bbGrid);

  HALOPERIDOL_PROHIBITION.mechanisms.forEach((m) => {
    const item = h('div', { class: 'movement-bb-item' });
    item.appendChild(h('strong', null, isEs ? m.titleEs : m.titleEn));
    item.appendChild(h('p', null, isEs ? m.descEs : m.descEn));
    bbGrid.appendChild(item);
  });

  // Layout Grid
  const grid = h('div', { class: 'movement-grid' });
  container.appendChild(grid);

  // Left Column: Patient Evaluation & Clinical Signs
  const leftCol = h('div', { class: 'movement-col' });
  grid.appendChild(leftCol);

  // Card 1: Phenotype Selector
  const phenoCard = h('div', { class: 'movement-card' });
  leftCol.appendChild(phenoCard);

  const phenoTitle = h('h2', { class: 'movement-card-title' });
  phenoTitle.appendChild(icon('activity'));
  phenoTitle.appendChild(h('span', null, isEs ? '1. Fenotipo Clínico del Trastorno Motor' : '1. Motor Disorder Clinical Phenotype'));
  phenoCard.appendChild(phenoTitle);

  const phenoSelect = h('select', { id: 'pheno-select', class: 'movement-select' });
  Object.keys(MOVEMENT_PHENOTYPES).forEach((k) => {
    const p = MOVEMENT_PHENOTYPES[k];
    const opt = h('option', { value: k }, isEs ? p.nameEs : p.nameEn);
    phenoSelect.appendChild(opt);
  });
  phenoSelect.value = state.phenotype;
  phenoSelect.addEventListener('change', (e) => {
    updateMovementState({ phenotype: e.target.value });
  });
  phenoCard.appendChild(phenoSelect);

  // Dynamic Phenotype Description
  const phenoDescBox = h('div', { class: 'movement-pheno-details' });
  phenoCard.appendChild(phenoDescBox);

  function updatePhenoDetails() {
    clear(phenoDescBox);
    const p = MOVEMENT_PHENOTYPES[state.phenotype];
    if (!p) return;
    phenoDescBox.appendChild(h('p', { class: 'font-semibold' }, isEs ? `Etiología: ${p.etiologyEs}` : `Etiology: ${p.etiologyEn}`));
    phenoDescBox.appendChild(h('p', null, isEs ? `Características: ${p.featuresEs}` : `Features: ${p.featuresEn}`));
  }
  updatePhenoDetails();

  // Card 2: Bedside Signs & Acuity Parameters
  const signsCard = h('div', { class: 'movement-card' });
  leftCol.appendChild(signsCard);

  const signsTitle = h('h2', { class: 'movement-card-title' });
  signsTitle.appendChild(icon('shield'));
  signsTitle.appendChild(h('span', null, isEs ? '2. Signos Clínicos y Parámetros Críticos' : '2. Bedside Signs & Critical Parameters'));
  signsCard.appendChild(signsTitle);

  // Temperature input
  const tempGroup = h('div', { class: 'movement-field-group' });
  signsCard.appendChild(tempGroup);

  tempGroup.appendChild(h('label', { class: 'movement-label', for: 'temp-input' }, isEs ? 'Temperatura Central (°C):' : 'Core Temperature (°C):'));
  const tempInput = h('input', {
    id: 'temp-input',
    type: 'number',
    step: '0.1',
    min: '34.0',
    max: '44.0',
    class: 'movement-num-input',
    value: state.coreTemp.toString(),
  });
  tempInput.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) updateMovementState({ coreTemp: val });
  });
  tempGroup.appendChild(tempInput);

  // CK Level input
  const ckGroup = h('div', { class: 'movement-field-group' });
  signsCard.appendChild(ckGroup);

  ckGroup.appendChild(h('label', { class: 'movement-label', for: 'ck-input' }, isEs ? 'Creatina Quinasa (CPK en U/L):' : 'Creatine Kinase (CK in U/L):'));
  const ckInput = h('input', {
    id: 'ck-input',
    type: 'number',
    step: '50',
    min: '50',
    max: '100000',
    class: 'movement-num-input',
    value: state.ckLevel.toString(),
  });
  ckInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) updateMovementState({ ckLevel: val });
  });
  ckGroup.appendChild(ckInput);

  // Bedside Checkboxes
  const signsCheckList = [
    {
      key: 'hasStridor',
      labelEn: 'Inspiratory Stridor / Choking (Laryngeal Dystonia Hazard)',
      labelEs: 'Estridor Inspiratorio / Asfixia (Peligro de Distonía Laríngea)',
      descEn: 'IMMEDIATE AIRWAY EMERGENCY. Spasm of vocal cords.',
      descEs: 'EMERGENCIA INMEDIATA DE VÍA AÉREA. Espasmo de cuerdas vocales.',
      isEmergency: true,
    },
    {
      key: 'hasClonus',
      labelEn: 'Spontaneous or Inducible Clonus (Hunter Criteria)',
      labelEs: 'Clonus Espontáneo o Inducible (Criterios de Hunter)',
      descEn: 'Diagnostic hallmark of Serotonin Syndrome (absent in pure stimulant toxicity).',
      descEs: 'Signo patognomónico de Síndrome Serotoninérgico (ausente en estimulantes puros).',
    },
    {
      key: 'hasLeadPipeRigidity',
      labelEn: 'Generalized "Lead-Pipe" Rigidity (NMS Suspicion)',
      labelEs: 'Rigidez Generalizada en «Tubo de Plomo» (Sospecha de SNM)',
      descEn: 'Severe sustained resistance throughout entire range of passive motion.',
      descEs: 'Resistencia continua y uniforme en todo el rango de movimiento pasivo.',
    },
    {
      key: 'recentAntipsychotic',
      labelEn: 'Recent Antipsychotic or D2 Antiemetic Exposure',
      labelEs: 'Exposición Reciente a Antipsicótico o Antiemético D2',
      descEn: 'Haloperidol, risperidone, metoclopramide, prochlorperazine within 48h.',
      descEs: 'Haloperidol, risperidona, metoclopramida, proclorperazina en las últimas 48h.',
    },
    {
      key: 'recentMethamphetamine',
      labelEn: 'Recent Psychostimulant Ingestion / Binge (Meth / Cocaine)',
      labelEs: 'Consumo Reciente de Psicoestimulantes (Metanfetamina / Crack)',
      descEn: 'Dopaminergic and noradrenergic hyperstimulation.',
      descEs: 'Hiperestimulación dopaminérgica y noradrenérgica.',
    },
  ];

  signsCheckList.forEach((item) => {
    const row = h('div', { class: `movement-check-row ${item.isEmergency ? 'emergency-row' : ''}` });
    const chk = h('input', { type: 'checkbox', id: `sign-${item.key}` });
    chk.checked = Boolean(state[item.key]);
    chk.addEventListener('change', (e) => {
      updateMovementState({ [item.key]: e.target.checked });
    });
    row.appendChild(chk);

    const lbl = h('label', { for: `sign-${item.key}`, class: 'movement-check-label' });
    lbl.appendChild(h('span', { class: 'font-semibold' }, isEs ? item.labelEs : item.labelEn));
    lbl.appendChild(h('span', { class: 'movement-subtext' }, isEs ? item.descEs : item.descEn));
    row.appendChild(lbl);

    signsCard.appendChild(row);
  });

  // Right Column: Treatment Directives & SBAR
  const rightCol = h('div', { class: 'movement-col' });
  grid.appendChild(rightCol);

  const resultsContainer = h('div', { class: 'movement-results' });
  rightCol.appendChild(resultsContainer);

  function renderResults() {
    clear(resultsContainer);

    const evalResult = evaluateMovementDisorder(state);

    // Alerts
    evalResult.alerts.forEach((alert) => {
      const alertBox = h('div', { class: `movement-alert-box alert-${alert.type}` });
      alertBox.appendChild(icon('alert'));
      alertBox.appendChild(h('span', null, isEs ? alert.textEs : alert.textEn));
      resultsContainer.appendChild(alertBox);
    });

    // Urgent Directives Card
    const dirCard = h('div', { class: 'movement-card' });
    resultsContainer.appendChild(dirCard);

    const dirTitle = h('h3', { class: 'movement-card-title' }, isEs ? 'Directivas de Manejo Inmediato' : 'Immediate Management Directives');
    dirCard.appendChild(dirTitle);

    const dirList = h('div', { class: 'movement-action-list' });
    dirCard.appendChild(dirList);

    evalResult.urgentDirectives.forEach((dir) => {
      const dirItem = h('div', { class: `movement-action-item priority-${dir.priority}` });
      const dirHead = h('div', { class: 'movement-action-head' });
      dirHead.appendChild(h('span', { class: 'movement-badge' }, dir.priority.toUpperCase()));
      dirHead.appendChild(h('strong', null, isEs ? dir.titleEs : dir.titleEn));
      dirItem.appendChild(dirHead);
      dirItem.appendChild(h('p', { class: 'movement-action-desc' }, isEs ? dir.descEs : dir.descEn));
      dirList.appendChild(dirItem);
    });

    // Medications to Administer
    if (evalResult.medicationsToAdminister.length > 0) {
      const medCard = h('div', { class: 'movement-card' });
      resultsContainer.appendChild(medCard);

      const medTitle = h('h3', { class: 'movement-card-title' }, isEs ? 'Farmacoterapia de Reversión Indicada' : 'Indicated Reversal Pharmacotherapy');
      medCard.appendChild(medTitle);

      const medList = h('ul', { class: 'movement-supply-list' });
      evalResult.medicationsToAdminister.forEach((med) => {
        const li = h('li', null);
        li.appendChild(icon('check'));
        li.appendChild(h('span', null, med));
        medList.appendChild(li);
      });
      medCard.appendChild(medList);
    }

    // SBAR Section
    const sbarCard = h('div', { class: 'movement-card' });
    resultsContainer.appendChild(sbarCard);

    const sbarTitle = h('h3', { class: 'movement-card-title' }, isEs ? 'Transferencia Clínica SBAR (Cero PII)' : 'Zero-PII SBAR Handoff Report');
    sbarCard.appendChild(sbarTitle);

    const sbarArea = h('textarea', { class: 'movement-sbar-textarea', rows: 7, readonly: true });
    sbarArea.value = generateMovementSbar(state, lang);
    sbarCard.appendChild(sbarArea);

    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' });
    copyBtn.appendChild(icon('copy'));
    copyBtn.appendChild(h('span', null, isEs ? 'Copiar Reporte SBAR' : 'Copy SBAR Report'));
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sbarArea.value);
        copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
        setTimeout(() => {
          clear(copyBtn);
          copyBtn.appendChild(icon('copy'));
          copyBtn.appendChild(h('span', null, isEs ? 'Copiar Reporte SBAR' : 'Copy SBAR Report'));
        }, 2000);
      } catch (err) {
        sbarArea.select();
      }
    });
    sbarCard.appendChild(copyBtn);
  }

  // Initial render & subscription
  renderResults();
  const unsub = subscribeMovementState(() => {
    updatePhenoDetails();
    renderResults();
  });

  return container;
}
