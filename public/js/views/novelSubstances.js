// public/js/views/novelSubstances.js
// HarborPath - Novel Psychoactive Substances, Kratom, Tianeptine & Emerging OTC Misuse Navigator
// Clinical consensus: American College of Medical Toxicology (ACMT) Position Statement on Tianeptine & Emerging Synthetic Opioid Mimics,
// ASAM Clinical Guidelines on Buprenorphine Induction for Kratom & Tianeptine Use Disorder,
// FDA Public Health Alerts on Tianeptine ("Gas Station Heroin") Cardiotoxicity & QTc Prolongation,
// Toxicology Guidelines on Phenibut / GABA-B Withdrawal & Baclofen Substitution Protocols,
// Emergency Management of Loperamide Cardiotoxicity & hERG Potassium Channel Blockade (Torsades de Pointes).
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: NOVEL SUBSTANCES & OTC PHARMACOLOGICAL PROFILES
// ============================================================================

export const NOVEL_SUBSTANCE_PROFILES = Object.freeze({
  tianeptine: Object.freeze({
    id: 'tianeptine',
    name: 'Tianeptine ("Gas Station Heroin", ZaZa, Tianaa, Pegasus, TD Red)',
    streetNamesEn: 'ZaZa Red, ZaZa Silver, Tianaa, Pegasus, TD Red, Platinum, Red Dawn',
    streetNamesEs: 'ZaZa Rojo, ZaZa Plata, Tianaa, Pegaso, TD Rojo, Platino',
    pharmacologyEn: 'Atypical tricyclic antidepressant that functions as a full mu-opioid receptor agonist, delta-opioid agonist, and glutamatergic modulator at supra-therapeutic doses (1,000 to 5,000+ mg/day vs therapeutic 37.5 mg/day).',
    pharmacologyEs: 'Antidepresivo tricíclico atípico que actúa como agonista completo de receptores opioides mu y modulador glutamatérgico a dosis supraterapéuticas (1,000 a 5,000+ mg/día frente a dosis terapéutica de 37.5 mg/día).',
    cardiotoxicityEn: 'SEVERE QTc PROLONGATION: Blocks cardiac potassium channels and induces sodium channel blockade, predisposing to torsades de pointes, ventricular tachycardia, and sudden cardiovascular collapse.',
    cardiotoxicityEs: 'PROLONGACIÓN GRAVE DEL QTc: Bloquea canales cardíacos de potasio y sodio, predisponiendo a torsades de pointes, taquicardia ventricular y colapso cardiovascular súbito.',
    udsStatusEn: '100% NEGATIVE on standard hospital 5-to-12 panel urine drug screens (UDS). Requires specialized liquid chromatography-tandem mass spectrometry (LC-MS/MS).',
    udsStatusEs: '100% NEGATIVO en paneles estándar de orina de 5 a 12 fármacos. Requiere cromatografía líquida acoplada a espectrometría de masas (LC-MS/MS).',
    withdrawalEn: 'Severe, rapid-onset dual opioid and antidepressant withdrawal beginning 2 to 4 hours after last dose: diaphoresis, intractable vomiting, severe diarrhea, panic, myalgias, and autonomic instability.',
    withdrawalEs: 'Abstinencia dual severa (opioide y antidepresiva) a las 2 a 4 horas de la última dosis: diaforesis, vómitos incoercibles, diarrea, pánico, mialgias e inestabilidad autonómica.',
    clinicalTreatmentEn: 'Buprenorphine induction (CA Bridge rapid high-dose protocol once COWS >= 8), 12-lead ECG monitoring for QTc > 500 ms, and supportive hydration. Naloxone reverses acute respiratory depression.',
    clinicalTreatmentEs: 'Inducción con buprenorfina (protocolo CA Bridge si COWS >= 8), monitorización de ECG para QTc > 500 ms e hidratación. La naloxona revierte la depresión respiratoria.',
  }),
  kratom: Object.freeze({
    id: 'kratom',
    name: 'Kratom & Concentrated 7-Hydroxymitragynine (7-OH)',
    streetNamesEn: '7-OHMZ, Hydroxy, MIT45, OPMS, Ultra Enhanced Indo, Maeng Da, Trainwreck',
    streetNamesEs: '7-OHMZ, Hidroxi, MIT45, OPMS, Maeng Da, Trainwreck',
    pharmacologyEn: 'Mitragyna speciosa leaves contain mitragynine (partial mu-agonist, alpha-2 adrenergic agonist) and 7-hydroxymitragynine (7-OH), an alkaloid with up to 13-fold higher potency than morphine at mu-receptors.',
    pharmacologyEs: 'Las hojas de Mitragyna speciosa contienen mitraginina (agonista mu parcial, alfa-2 adrenérgico) y 7-hidroximitraginina (7-OH), con una potencia hasta 13 veces mayor que la morfina en receptores mu.',
    cardiotoxicityEn: 'Moderate tachycardia, hypertension, and potential QTc prolongation in concentrated extracts, especially when co-ingested with caffeine, energy drinks, or stimulants.',
    cardiotoxicityEs: 'Taquicardia moderada, hipertensión y potencial prolongación del QTc con extractos concentrados, especialmente al mezclarse con cafeína o estimulantes.',
    udsStatusEn: 'NEGATIVE on routine immunoassay drug screens. Does not cross-react with opiates, oxycodone, or methadone. Requires dedicated mitragynine panel.',
    udsStatusEs: 'NEGATIVO en inmunoensayos rutinarios. No reacciona de forma cruzada con opiáceos ni metadona. Requiere panel específico de mitraginina.',
    withdrawalEn: 'Classical opioid withdrawal syndrome: chills, rhinorrhea, severe restless leg syndrome (RLS), insomnia, anxiety, and muscle aches lasting 3 to 7 days.',
    withdrawalEs: 'Síndrome de abstinencia opioide clásico: escalofríos, rinorrea, síndrome de piernas inquietas severo, insomnio, ansiedad y mialgias durante 3 a 7 días.',
    clinicalTreatmentEn: 'Buprenorphine induction is highly effective for moderate-to-severe kratom use disorder per ASAM guidelines. Clonidine, gabapentin, and loperamide (standard therapeutic dose <= 8 mg) for comfort.',
    clinicalTreatmentEs: 'La inducción con buprenorfina es sumamente eficaz para el trastorno por uso moderado a grave de kratom según guías de ASAM. Clonidina y gabapentina para soporte.',
  }),
  phenibut: Object.freeze({
    id: 'phenibut',
    name: 'Phenibut & Fluorophenibut (GABA-B Receptor Agonists)',
    streetNamesEn: 'Fenibut, Noofen, Anvifen, ZaZa Silver (adulterant component), Sleep Nootropic',
    streetNamesEs: 'Fenibut, Noofen, Anvifen, ZaZa Plata (componente adulterante)',
    pharmacologyEn: 'Synthetic derivative of GABA that crosses the blood-brain barrier. High-affinity agonist at GABAB receptors and inhibitor of alpha-2-delta subunit voltage-gated calcium channels (similar to gabapentin/pregabalin).',
    pharmacologyEs: 'Derivado sintético del GABA que cruza la barrera hematoencefálica. Agonista de alta afinidad en receptores GABAB e inhibidor de canales de calcio dependientes de voltaje (similar a pregabalina).',
    cardiotoxicityEn: 'Hypotension, hypothermia, respiratory depression in overdose; severe rebound hyperadrenergic storm, malignant hypertension, and cardiac arrhythmias during withdrawal.',
    cardiotoxicityEs: 'Hipotensión, hipotermia y depresión respiratoria en sobredosis; tormenta hiperadrenérgica, hipertensión maligna y arritmias cardíacas en la abstinencia.',
    udsStatusEn: '100% NEGATIVE on standard hospital urine tox screens. Not detected on benzodiazepine, barbiturate, or opioid assays.',
    udsStatusEs: '100% NEGATIVO en toxicológicos estándar. No se detecta en pruebas de benzodiacepinas, barbitúricos ni opioides.',
    withdrawalEn: 'LIFE-THREATENING WITHDRAWAL (mimics severe delirium tremens or GHB withdrawal): Severe visual/auditory hallucinations, acute delirium, psychosis, tremors, muscle rigidity, agitation, and seizures.',
    withdrawalEs: 'ABSTINENCIA POTENCIALMENTE MORTAL (imita delirium tremens grave o abstinencia de GHB): Alucinaciones visuales y auditivas, delirio agudo, psicosis, temblores, rigidez y convulsiones.',
    clinicalTreatmentEn: 'Baclofen substitution taper (10 mg oral baclofen replaces approximately 1,000 mg phenibut, tapered over 2 to 4 weeks). High-dose benzodiazepines (lorazepam, diazepam) or dexmedetomidine in ICU for delirium.',
    clinicalTreatmentEs: 'Pauta de sustitución y descenso con baclofeno (10 mg de baclofeno oral sustituyen aprox. 1,000 mg de fenibut, pauta de 2 a 4 semanas). Benzodiacepinas en UCI para el delirio.',
  }),
  loperamide: Object.freeze({
    id: 'loperamide',
    name: 'High-Dose Loperamide ("Poor Man’s Methadone")',
    streetNamesEn: 'Imodium megadosing, OTC gut opioid, poor man’s methadone',
    streetNamesEs: 'Megadosis de Imodium, opioide intestinal OTC, metadona de los pobres',
    pharmacologyEn: 'Peripheral mu-opioid receptor agonist normally excluded from the CNS by P-glycoprotein efflux pumps. At massive doses (50 to 300+ mg/day vs 16 mg max therapeutic), P-glycoprotein is saturated, causing CNS opioid euphoria and profound cardiac toxicity.',
    pharmacologyEs: 'Agonista opioide periférico excluido del SNC por la glicoproteína P. A dosis masivas (50 a 300+ mg/día vs 16 mg terapéuticos), satura la glicoproteína P provocando euforia en SNC y toxicidad cardíaca profunda.',
    cardiotoxicityEn: 'CRITICAL CARDIOTOXICITY: Direct, potent blockade of cardiac hERG potassium channels (IKr) and sodium channels. Produces extreme QTc prolongation (> 600 ms), QRS widening, Torsades de Pointes, Brugada-like ECG patterns, and sudden cardiac arrest.',
    cardiotoxicityEs: 'CARDIOTOXICIDAD CRÍTICA: Bloqueo potente de canales de potasio hERG (IKr) y canales de sodio. Provoca prolongación extrema del QTc (> 600 ms), ensanchamiento QRS, Torsades de Pointes y paro cardíaco.',
    udsStatusEn: 'NEGATIVE on routine immunoassay drug screens. Does not trigger opiate or synthetic opioid immunoassay panels.',
    udsStatusEs: 'NEGATIVO en inmunoensayos de orina. No activa los paneles de opiáceos ni opioides sintéticos.',
    withdrawalEn: 'Protracted opioid withdrawal syndrome due to long elimination half-life and tissue accumulation at megadoses.',
    withdrawalEs: 'Síndrome de abstinencia opioide prolongado debido a la larga vida media y acumulación tisular en megadosis.',
    clinicalTreatmentEn: 'Continuous cardiac telemetry, IV Magnesium Sulfate (2 g IV over 15 min for Torsades), Isoproterenol infusion or temporary cardiac pacing to shorten QTc. Avoid antiarrhythmics that prolong QTc (amiodarone, procainamide). Transition to buprenorphine under inpatient monitoring.',
    clinicalTreatmentEs: 'Telemetría cardíaca continua, Sulfato de Magnesio IV (2 g en 15 min para Torsades), infusión de Isoproterenol o marcapasos temporal. Evitar antiarrítmicos que prolonguen el QTc. Inducir buprenorfina con monitorización.',
  }),
  dxmDph: Object.freeze({
    id: 'dxm_dph',
    name: 'Dextromethorphan (DXM) & Diphenhydramine (DPH)',
    streetNamesEn: 'Robotripping, Triple C, Coricidin, Delsym, Benadryl tripping, Pink Diphen',
    streetNamesEs: 'Robotripping, Triple C, Delsym, Viaje de Benadryl, Difenhidramina',
    pharmacologyEn: 'DXM is an NMDA receptor antagonist and serotonin reuptake inhibitor. DPH is a potent first-generation H1 antagonist with powerful antimuscarinic / anticholinergic properties.',
    pharmacologyEs: 'El DXM es un antagonista de receptores NMDA e inhibidor de recaptación de serotonina. La DPH es un antihistamínico H1 con potentes propiedades antimuscarínicas/anticolinérgicas.',
    cardiotoxicityEn: 'Tachycardia, hypertension, QTc prolongation, anticholinergic delirium, hyperthermia, and risk of Serotonin Syndrome when DXM is combined with SSRIs, SNRIs, or stimulants.',
    cardiotoxicityEs: 'Taquicardia, hipertensión, prolongación del QTc, delirio anticolinérgico, hipertermia y riesgo de Síndrome Serotoninérgico si se combina DXM con antidepresivos.',
    udsStatusEn: 'FALSE POSITIVE RISK: High-dose DXM frequently produces FALSE POSITIVES for PCP (phencyclidine) and opioids on immunoassay urine screens. DPH can produce false positives for tricyclic antidepressants (TCAs) or methadone.',
    udsStatusEs: 'RIESGO DE FALSOS POSITIVOS: Altas dosis de DXM generan con frecuencia FALSOS POSITIVOS para PCP y opioides. La DPH puede dar falsos positivos para antidepresivos tricíclicos o metadona.',
    withdrawalEn: 'Psychological craving, rebound insomnia, dysphoria, cholinergic rebound (nausea, diaphoresis, rhinorrhea).',
    withdrawalEs: 'Deseo compulsivo de consumo, insomnio de rebote, disforia y rebote colinérgico (náuseas, sudoración, rinorrea).',
    clinicalTreatmentEn: 'Supportive care, IV hydration, cooling, benzodiazepines for agitation/seizures. Physostigmine (0.5 to 2 mg slow IV) for severe peripheral/central anticholinergic delirium under ECG monitoring.',
    clinicalTreatmentEs: 'Cuidados de soporte, hidratación IV, enfriamiento y benzodiacepinas para agitación. Fisostigmina (0.5 a 2 mg IV lenta) para delirio anticolinérgico severo bajo ECG.',
  }),
});

// ============================================================================
// GAS STATION & VAPE SHOP PRODUCT SAFETY WARNINGS
// ============================================================================

export const PRODUCT_SAFETY_ALERTS = Object.freeze([
  {
    productName: 'ZaZa Silver',
    activeIngredientsEn: 'Tianeptine PLUS Phenibut (Dual Dependence Hazard)',
    activeIngredientsEs: 'Tianeptina MÁS Fenibut (Peligro de Dependencia Dual)',
    hazardLevel: 'extreme',
    clinicalWarningEn: 'DEADLY COMBINATION: ZaZa Silver contains both an opioid-acting agent (tianeptine) and a potent GABA-B agonist (phenibut). Sudden cessation causes SIMULTANEOUS severe opioid withdrawal and life-threatening GABAergic delirium/seizures. Requires simultaneous buprenorphine induction AND baclofen substitution.',
    clinicalWarningEs: 'COMBINACIÓN MORTAL: ZaZa Plata contiene un agonista opioide (tianeptina) y un agonista GABAB potente (fenibut). Su cese brusco provoca abstinencia opioide severa y delirio/convulsiones gabaérgicas potencialmente mortales de forma simultánea. Requiere buprenorfina Y baclofeno.',
  },
  {
    productName: 'ZaZa Red & Tianaa Red',
    activeIngredientsEn: 'High-Concentration Tianeptine Sodium',
    activeIngredientsEs: 'Tianeptina Sódica en Alta Concentración',
    hazardLevel: 'high',
    clinicalWarningEn: 'Causes intense opioid tolerance and rapid dependence within 1 to 2 weeks of daily use. Abrupt cessation produces severe withdrawal and potential QTc prolongation/arrhythmias.',
    clinicalWarningEs: 'Causa tolerancia y dependencia opioide rápida en 1 a 2 semanas de uso diario. El cese brusco produce abstinencia severa y riesgo de arritmias por prolongación del QTc.',
  },
  {
    productName: '7-OH Tablets (7-OHMZ, Hydroxy, Press’d 7-OH)',
    activeIngredientsEn: 'Concentrated 7-Hydroxymitragynine (Synthetic / Semi-Synthetic Alkaloid)',
    activeIngredientsEs: '7-Hidroximitraginina Concentrada (Alcaloide Semisintético)',
    hazardLevel: 'high',
    clinicalWarningEn: 'Unlike raw leaf kratom, 7-OH tablets contain isolated, highly potent alkaloid doses that behave pharmacologically like classical potent opioids. Poses severe overdose risk when mixed with alcohol or sedatives.',
    clinicalWarningEs: 'A diferencia de la hoja cruda de kratom, las tabletas de 7-OH contienen alcaloides aislados de alta potencia que se comportan como opioides clásicos potentes. Riesgo grave de sobredosis con alcohol.',
  },
  {
    productName: 'Pegasus & TD Red',
    activeIngredientsEn: 'Tianeptine + Synthetic Adulterants / Nootropics',
    activeIngredientsEs: 'Tianeptina + Adulterantes Sintéticos / Nootrópicos',
    hazardLevel: 'high',
    clinicalWarningEn: 'Unregulated capsules with wildly variable tianeptine concentrations. Frequently contaminated with unlisted synthetic stimulants, RC sedatives, or caffeine.',
    clinicalWarningEs: 'Cápsulas no reguladas con concentraciones impredecibles. Con frecuencia contaminadas con estimulantes sintéticos no declarados o sedantes de diseño.',
  },
]);

// ============================================================================
// BACLOFEN SUBSTITUTION PROTOCOL (FOR PHENIBUT WITHDRAWAL)
// ============================================================================

export const BACLOFEN_SUBSTITUTION_RULES = Object.freeze({
  conversionRatioEn: '10 mg of oral Baclofen is roughly bio-equivalent to 1,000 mg (1 gram) of oral Phenibut.',
  conversionRatioEs: '10 mg de Baclofeno oral equivalen aproximadamente a 1,000 mg (1 gramo) de Fenibut oral.',
  principlesEn: Object.freeze([
    'Cross-titrate baclofen in divided doses (three times daily) while tapering phenibut down over 3 to 5 days.',
    'Once fully converted to baclofen, maintain stable dose for 3 to 7 days until autonomic stability and sleep normalize.',
    'Taper baclofen gradually by 5 to 10 mg every 3 to 5 days to prevent baclofen withdrawal.',
    'Adjuncts: Gabapentin (300 to 600 mg TID) or Clonidine (0.1 mg BID) for autonomic tremors and anxiety.',
  ]),
  principlesEs: Object.freeze([
    'Realizar titulación cruzada de baclofeno en dosis divididas (3 veces al día) mientras se reduce el fenibut en 3 a 5 días.',
    'Una vez convertido completamente a baclofeno, mantener dosis estable 3 a 7 días hasta estabilizar el sueño y sistema autonómico.',
    'Reducir el baclofeno gradualmente a razón de 5 a 10 mg cada 3 a 5 días para evitar abstinencia de baclofeno.',
    'Coadyuvantes: Gabapentina (300 a 600 mg TID) o Clonidina (0.1 mg BID) para temblores autonómicos y ansiedad.',
  ]),
});

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialNovelState = () => ({
  activeTab: 'calculator', // 'calculator' | 'substances' | 'products' | 'baclofen-taper' | 'uds-blindspots'
  viewMode: 'community', // 'community' | 'clinical'
  selectedSubstance: 'tianeptine', // 'tianeptine' | 'kratom' | 'phenibut' | 'loperamide' | 'dxm_dph'
  dailyDoseLevel: 'very_high', // 'low' | 'moderate' | 'high' | 'very_high'
  hasZaZaSilver: false, // true if taking ZaZa Silver (tianeptine + phenibut)
  hasCardiacSymptoms: false, // palpitations, syncope, chest pain
  hasHallucinations: false, // visual/auditory delirium
  timeSinceLastDoseHours: 'under_6', // 'under_6' | '6_to_12' | '12_to_24' | 'over_24'
});

let currentNovelState = initialNovelState();
const stateSubscribers = new Set();

export function getNovelState() {
  return { ...currentNovelState };
}

export function setNovelState(patch) {
  currentNovelState = { ...currentNovelState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentNovelState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetNovelState() {
  currentNovelState = initialNovelState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentNovelState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribeNovelState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateNovelSubstanceRisk(state) {
  const {
    selectedSubstance,
    dailyDoseLevel,
    hasZaZaSilver,
    hasCardiacSymptoms,
    hasHallucinations,
    timeSinceLastDoseHours,
  } = state;

  // 1. Check Extreme Emergencies
  if (hasCardiacSymptoms && (selectedSubstance === 'tianeptine' || selectedSubstance === 'loperamide')) {
    return {
      urgencyTier: 'emergency_cardiac',
      tierTitleEn: 'CRITICAL EMERGENCY: High Risk for QTc Prolongation & Torsades de Pointes',
      tierTitleEs: 'EMERGENCIA CRÍTICA: Alto Riesgo de Prolongación de QTc y Torsades de Pointes',
      isEmergency: true,
      actionEn: 'Call 911 immediately or report to the Emergency Department. Both tianeptine and high-dose loperamide cause severe cardiac potassium (hERG) and sodium channel blockade. Palpitations or syncope signal life-threatening ventricular arrhythmias. Immediate 12-lead ECG, continuous telemetry, and IV magnesium sulfate are mandatory.',
      actionEs: 'Llame al 911 de inmediato o acuda a Urgencias. Tanto la tianeptina como la loperamida causan bloqueo cardíaco de canales hERG y sodio. Las palpitaciones o síncope alertan de arritmias ventriculares mortales. Se requiere ECG de 12 derivaciones, telemetría y sulfato de magnesio IV.',
      treatmentStrategyEn: 'Continuous cardiac monitoring, avoid QTc-prolonging antiarrhythmics, IV magnesium 2g, and prepare for temporary pacing.',
      treatmentStrategyEs: 'Monitorización cardíaca continua, evitar fármacos que prolonguen el QTc, magnesio IV y preparar marcapasos si es necesario.',
    };
  }

  if (hasHallucinations || (hasZaZaSilver && selectedSubstance === 'tianeptine')) {
    return {
      urgencyTier: 'emergency_delirium',
      tierTitleEn: hasZaZaSilver
        ? 'COMPLEX DUAL WITHDRAWAL: Tianeptine (Opioid) + Phenibut (GABA-B Delirium Risk)'
        : 'EMERGENCY: GABA-B / Anticholinergic Delirium & Seizure Risk',
      tierTitleEs: hasZaZaSilver
        ? 'ABSTINENCIA DUAL COMPLEJA: Tianeptina (Opioide) + Fenibut (Riesgo de Delirio GABAb)'
        : 'EMERGENCIA: Riesgo de Delirio y Convulsiones por GABA-B / Anticolinérgicos',
      isEmergency: true,
      actionEn: hasZaZaSilver
        ? 'WARNING: ZaZa Silver contains BOTH tianeptine and phenibut. Stopping abruptly triggers simultaneous severe opioid withdrawal and life-threatening GABAergic psychosis/seizures. Requires medical detox with concurrent buprenorphine induction AND baclofen cross-titration.'
        : 'Hallucinations, agitation, or severe tremors indicate profound GABA-B or anticholinergic withdrawal/toxicity. High risk for delirium tremens-like psychosis and status epilepticus. Inpatient medical stabilization is urgently required.',
      actionEs: hasZaZaSilver
        ? 'ADVERTENCIA: ZaZa Plata contiene tianeptina Y fenibut. Su cese brusco provoca abstinencia opioide y psicosis/convulsiones gabaérgicas mortales. Requiere desintoxicación hospitalaria con buprenorfina Y baclofeno concurrentes.'
        : 'Las alucinaciones o temblores severos indican abstinencia/toxicidad grave. Alto riesgo de psicosis tipo delirium tremens y crisis convulsivas. Se requiere estabilización médica hospitalaria urgente.',
      treatmentStrategyEn: hasZaZaSilver
        ? 'Dual Protocol: Buprenorphine 8-16 mg SL once COWS >= 8 PLUS Baclofen 10 mg TID substitution, plus IV hydration.'
        : 'Benzodiazepines (lorazepam 2-4 mg IV) for agitation/seizures; Baclofen substitution for phenibut; Physostigmine for DPH delirium under ECG.',
      treatmentStrategyEs: hasZaZaSilver
        ? 'Protocolo Dual: Buprenorfina 8-16 mg SL si COWS >= 8 MÁS sustitución con Baclofeno 10 mg TID e hidratación.'
        : 'Benzodiacepinas para agitación/convulsiones; sustitución con baclofeno para fenibut; fisostigmina para DPH bajo ECG.',
    };
  }

  // 2. Standard Substance Stratifications
  let urgency = 'urgent_detox';
  let titleEn = '';
  let titleEs = '';
  let planEn = '';
  let planEs = '';

  switch (selectedSubstance) {
    case 'tianeptine':
      titleEn = 'Urgent Tianeptine Opioid Withdrawal & Buprenorphine Transition';
      titleEs = 'Abstinencia Opioide de Tianeptina y Transición a Buprenorfina';
      planEn = 'Tianeptine withdrawal produces intense opioid-like distress within 2 to 4 hours. Induce Buprenorphine (8 mg test dose once COWS >= 8, up to 16-24 mg Day 1). Obtain baseline 12-lead ECG to rule out QTc prolongation. Dispense comfort medications (clonidine 0.1 mg, ondansetron 4-8 mg, loperamide 2-4 mg). Standard urine drug screen will be negative.';
      planEs = 'La abstinencia de tianeptina produce malestar opioide intenso a las 2 a 4 horas. Inducir Buprenorfina (dosis de 8 mg si COWS >= 8, hasta 16-24 mg en Día 1). Realizar ECG basal para descartar QTc largo. Medicación de confort (clonidina, ondansetrón). El toxicológico de orina habitual será negativo.';
      break;

    case 'kratom':
      titleEn = 'Kratom / 7-OH Alkaloid Dependence & MOUD Care Pathway';
      titleEs = 'Dependencia de Alcaloides de Kratom / 7-OH y Vía de Atención con MOUD';
      planEn = 'Concentrated 7-OH and high-dose kratom cause substantial opioid physical dependence. Per ASAM guidance, Buprenorphine induction is highly effective. Initiate buprenorphine 4 to 8 mg once objective withdrawal signs appear (COWS >= 8). For mild dependence, a slow taper of raw powder leaf with clonidine and gabapentin can be trialed.';
      planEs = 'El 7-OH concentrado y dosis altas de kratom causan dependencia física opioide sustancial. Según guías ASAM, la buprenorfina es altamente eficaz (4 a 8 mg si COWS >= 8). En dependencia leve, descenso gradual de polvo con clonidina y gabapentina.';
      break;

    case 'phenibut':
      titleEn = 'Phenibut GABA-B Dependence: Structured Baclofen Substitution';
      titleEs = 'Dependencia de Fenibut GABAB: Sustitución Estructurada con Baclofeno';
      planEn = 'Do not discontinue phenibut cold turkey due to seizure and psychotic delirium risk. Initiate Baclofen substitution at approximately 10 mg baclofen per 1,000 mg phenibut, divided TID. Cross-taper over 3 to 5 days, hold stable for 1 week, then gradually taper baclofen by 5-10 mg every 3-5 days.';
      planEs = 'No suspenda el fenibut de forma brusca por riesgo de convulsiones y psicosis. Inicie sustitución con Baclofeno a razón de 10 mg por cada 1,000 mg de fenibut repartido en 3 tomas. Transición en 3 a 5 días y descenso gradual posterior.';
      break;

    case 'loperamide':
      titleEn = 'Loperamide Megadose Detox & Critical Cardiotoxicity Protocol';
      titleEs = 'Desintoxicación de Megadosis de Loperamida y Protocolo de Cardiotoxicidad';
      planEn = 'Extreme risk of fatal ventricular arrhythmias (Torsades de Pointes). Mandatory 12-lead ECG and continuous telemetry. If QTc > 500 ms, administer IV Magnesium Sulfate 2g and admit to telemetry. Discontinue loperamide immediately; manage opioid withdrawal with buprenorphine or methadone under continuous cardiac monitoring.';
      planEs = 'Riesgo extremo de arritmias ventriculares mortales (Torsades). ECG y telemetría obligatorios. Si QTc > 500 ms, administrar Sulfato de Magnesio 2g IV e ingresar. Suspender loperamida de inmediato e inducir buprenorfina bajo monitorización.';
      break;

    case 'dxm_dph':
    default:
      titleEn = 'DXM / Diphenhydramine Overuse & Anticholinergic Stabilization';
      titleEs = 'Uso Excesivo de DXM / Difenhidramina y Estabilización Anticolinérgica';
      planEn = 'Evaluate for Serotonin Syndrome (if taking SSRIs/antidepressants) and anticholinergic toxicity (mydriasis, dry mucosa, urinary retention, tachycardia). Administer IV fluids and benzodiazepines for agitation. Reassure patient regarding potential false positives for PCP or TCAs on routine urine screens.';
      planEs = 'Evaluar Síndrome Serotoninérgico y toxicidad anticolinérgica (midriasis, mucosas secas, retención urinaria, taquicardia). Administrar fluidos IV y benzodiacepinas. Advertir sobre posibles falsos positivos para PCP o tricíclicos en orina.';
      break;
  }

  return {
    urgencyTier: urgency,
    tierTitleEn: titleEn,
    tierTitleEs: titleEs,
    isEmergency: false,
    actionEn: planEn,
    actionEs: planEs,
    treatmentStrategyEn: 'Clinical stabilization, harm reduction counseling, and zero-PII physician consultation.',
    treatmentStrategyEs: 'Estabilización clínica, asesoramiento de reducción de daños y consulta médica con Cero PII.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF & CLINICIAN CONSULTATION GENERATOR
// ============================================================================

export function buildNovelSubstancesSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();
  const subProfile = NOVEL_SUBSTANCE_PROFILES[state.selectedSubstance] || NOVEL_SUBSTANCE_PROFILES.tianeptine;

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: SUSTANCIAS NOVEDOSAS, KRATOM, TIANEPTINA Y OTC',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      `Consulta por uso/abstinencia de sustancia no tradicional: ${subProfile.name}.`,
      `Nivel de urgencia evaluado: ${evaluation.tierTitleEs}.`,
      `Tiempo transcurrido desde la última dosis: ${state.timeSinceLastDoseHours}.`,
      '',
      'B (ANTECEDENTES / DETALLES DE CONSUMO):',
      `- Sustancia primaria: ${subProfile.name}.`,
      `- Nivel de dosis diaria: ${state.dailyDoseLevel}.`,
      `- Consumo de ZaZa Silver (Tianeptina + Fenibut): ${state.hasZaZaSilver ? 'SÍ (Riesgo de abstinencia dual severa)' : 'No'}.`,
      `- Síntomas cardíacos (palpitaciones, síncope): ${state.hasCardiacSymptoms ? 'SÍ (Alerta de QTc prolongado)' : 'No'}.`,
      `- Alucinaciones / delirio: ${state.hasHallucinations ? 'SÍ (Alerta de delirio GABAb / anticolinérgico)' : 'No'}.`,
      `- Estado en toxicológico habitual de orina: ${subProfile.udsStatusEs}`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Evaluación de riesgo: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA ACTIVA' : 'ABSTINENCIA / MANEJO CLÍNICO'}.`,
      `- Plan de acción: ${evaluation.actionEs}`,
      `- Consideraciones de cardiotoxicidad: ${subProfile.cardiotoxicityEs}`,
      '',
      'R (RECOMENDACIONES Y PLAN TERAPÉUTICO):',
      '1. Si hay síntomas cardíacos o consumo de tianeptina/loperamida: Realizar ECG de 12 derivaciones inmediato (vigilar QTc > 500 ms).',
      '2. Si es tianeptina o kratom: Iniciar buprenorfina (protocolo CA Bridge) cuando COWS >= 8.',
      '3. Si es fenibut o ZaZa Silver: Iniciar sustitución con Baclofeno (10 mg por cada 1g de fenibut) para prevenir convulsiones.',
      '4. Recordar al equipo que el toxicológico estándar será NEGATIVO; no demorar el tratamiento por falta de confirmación en orina.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'NOVEL SUBSTANCES, KRATOM, TIANEPTINE & OTC MISUSE SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    `Presentation for novel psychoactive or OTC substance misuse: ${subProfile.name}.`,
    `Clinical Urgency Tier: ${evaluation.tierTitleEn}.`,
    `Time elapsed since last dose: ${state.timeSinceLastDoseHours}.`,
    '',
    'B (BACKGROUND / CONSUMPTION DETAILS):',
    `- Primary substance: ${subProfile.name}.`,
    `- Daily dose range: ${state.dailyDoseLevel}.`,
    `- ZaZa Silver consumption (Tianeptine + Phenibut): ${state.hasZaZaSilver ? 'YES (High dual-withdrawal hazard)' : 'No'}.`,
    `- Cardiac symptoms (palpitations, syncope): ${state.hasCardiacSymptoms ? 'YES (High QTc prolongation alert)' : 'No'}.`,
    `- Delirium / hallucinations: ${state.hasHallucinations ? 'YES (GABA-B / Anticholinergic alert)' : 'No'}.`,
    `- Routine urine drug screen status: ${subProfile.udsStatusEn}`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Urgency: ${evaluation.isEmergency ? 'ACTIVE MEDICAL EMERGENCY' : 'URGENT DETOXIFICATION / CLINICAL PATHWAY'}.`,
    `- Clinical Pathway: ${evaluation.actionEn}`,
    `- Cardiotoxicity Risk: ${subProfile.cardiotoxicityEn}`,
    '',
    'R (RECOMMENDATIONS & THERAPEUTIC PLAN):',
    '1. If cardiac symptoms or tianeptine/loperamide: Obtain immediate 12-lead ECG (monitor for QTc > 500 ms, Torsades risk).',
    '2. If tianeptine or kratom: Initiate Buprenorphine (CA Bridge protocol) once COWS >= 8.',
    '3. If phenibut or ZaZa Silver: Initiate Baclofen substitution (10 mg per 1g phenibut) to prevent life-threatening seizures.',
    '4. Note for clinical team: Routine UDS will be FALSELY NEGATIVE. Do not withhold withdrawal care due to negative immunoassay.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function novelSubstancesView() {
  const container = h('div', { class: 'novel-substances-view' });

  function render() {
    clear(container);
    const state = getNovelState();
    const evaluation = evaluateNovelSubstanceRisk(state);

    // Header Banner
    const header = h('header', { class: 'ns-header' }, [
      h('div', { class: 'ns-header-badge' }, [
        icon('alert'),
        h('span', {}, t('ns.header.badge', 'Emerging Substance & Toxicology Navigator')),
      ]),
      h('h1', { class: 'ns-header-title' }, t('ns.header.title', 'Novel Substances, Kratom, Tianeptine & OTC Misuse Protocol')),
      h('p', { class: 'ns-header-desc' }, t('ns.header.desc', 'Clinical decision support for non-traditional substance misuse under ACMT, ASAM, and FDA guidelines: managing tianeptine cardiotoxicity, concentrated 7-OH kratom, phenibut GABA-B delirium, and urine immunoassay blindspots.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'ns-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        class: `ns-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setNovelState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('ns.mode.community', 'Consumer & Family Safety Mode (Product Alerts & Safe Tapering)')),
      ]),
      h('button', {
        class: `ns-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setNovelState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('ns.mode.clinical', 'Clinician & Emergency Provider Mode (ECG, Buprenorphine & Baclofen Tapers)')),
      ]),
    ]);

    // Tab Navigation
    const tabsList = h('div', { class: 'ns-tabs-nav', role: 'tablist', 'aria-label': 'Novel Substances Navigation Tabs' }, [
      h('button', {
        class: `ns-tab-btn ${state.activeTab === 'calculator' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'calculator' ? 'true' : 'false',
        onclick: () => setNovelState({ activeTab: 'calculator' }),
      }, t('ns.tabs.calculator', 'Triage & Cardiotoxicity Calculator')),
      h('button', {
        class: `ns-tab-btn ${state.activeTab === 'substances' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'substances' ? 'true' : 'false',
        onclick: () => setNovelState({ activeTab: 'substances' }),
      }, t('ns.tabs.substances', 'Substance Pharmacology Profiles')),
      h('button', {
        class: `ns-tab-btn ${state.activeTab === 'products' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'products' ? 'true' : 'false',
        onclick: () => setNovelState({ activeTab: 'products' }),
      }, t('ns.tabs.products', 'Gas Station Brand Alerts')),
      h('button', {
        class: `ns-tab-btn ${state.activeTab === 'baclofen-taper' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'baclofen-taper' ? 'true' : 'false',
        onclick: () => setNovelState({ activeTab: 'baclofen-taper' }),
      }, t('ns.tabs.baclofen', 'Baclofen & MOUD Tapers')),
      h('button', {
        class: `ns-tab-btn ${state.activeTab === 'uds-blindspots' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'uds-blindspots' ? 'true' : 'false',
        onclick: () => setNovelState({ activeTab: 'uds-blindspots' }),
      }, t('ns.tabs.uds', 'Urine Drug Screen Blindspots')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'substances':
        tabContent = renderSubstancesTab();
        break;
      case 'products':
        tabContent = renderProductsTab();
        break;
      case 'baclofen-taper':
        tabContent = renderBaclofenTab();
        break;
      case 'uds-blindspots':
        tabContent = renderUdsTab();
        break;
      case 'calculator':
      default:
        tabContent = renderCalculatorTab(state, evaluation);
        break;
    }

    container.appendChild(header);
    container.appendChild(modeSwitcher);
    container.appendChild(tabsList);
    container.appendChild(tabContent);
  }

  // --- SUB-RENDERERS ---

  function renderCalculatorTab(state, evaluation) {
    const section = h('section', { class: 'ns-calculator-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'ns-inputs-grid' }, [
      // 1. Substance Selector
      h('div', { class: 'input-card' }, [
        h('label', { for: 'ns-select-substance', class: 'input-label' }, t('ns.label.substance', '1. Primary Substance Misused')),
        h('select', {
          id: 'ns-select-substance',
          class: 'ns-select',
          onchange: (e) => setNovelState({ selectedSubstance: e.target.value }),
        }, [
          h('option', { value: 'tianeptine', selected: state.selectedSubstance === 'tianeptine' }, t('ns.opt.tianeptine', 'Tianeptine (ZaZa Red, Tianaa, Pegasus, TD Red)')),
          h('option', { value: 'kratom', selected: state.selectedSubstance === 'kratom' }, t('ns.opt.kratom', 'Kratom / Concentrated 7-OH (7-OHMZ, MIT45)')),
          h('option', { value: 'phenibut', selected: state.selectedSubstance === 'phenibut' }, t('ns.opt.phenibut', 'Phenibut / Fluorophenibut (Nootropic GABA-B)')),
          h('option', { value: 'loperamide', selected: state.selectedSubstance === 'loperamide' }, t('ns.opt.loperamide', 'Loperamide Megadose (Poor Man’s Methadone)')),
          h('option', { value: 'dxm_dph', selected: state.selectedSubstance === 'dxm_dph' }, t('ns.opt.dxmDph', 'DXM / Diphenhydramine (Triple C, DPH)')),
        ]),
      ]),

      // 2. Daily Dose Level
      h('div', { class: 'input-card' }, [
        h('label', { for: 'ns-select-dose', class: 'input-label' }, t('ns.label.dose', '2. Estimated Daily Dose Level')),
        h('select', {
          id: 'ns-select-dose',
          class: 'ns-select',
          onchange: (e) => setNovelState({ dailyDoseLevel: e.target.value }),
        }, [
          h('option', { value: 'low', selected: state.dailyDoseLevel === 'low' }, t('ns.opt.doseLow', 'Low / Intermittent use')),
          h('option', { value: 'moderate', selected: state.dailyDoseLevel === 'moderate' }, t('ns.opt.doseMod', 'Moderate daily use (1-2 bottles/packs)')),
          h('option', { value: 'high', selected: state.dailyDoseLevel === 'high' }, t('ns.opt.doseHigh', 'High daily use (3-5 bottles/packs daily)')),
          h('option', { value: 'very_high', selected: state.dailyDoseLevel === 'very_high' }, t('ns.opt.doseVeryHigh', 'Extreme megadose (6+ bottles / massive quantities)')),
        ]),
      ]),

      // 3. Time Since Last Dose
      h('div', { class: 'input-card' }, [
        h('label', { for: 'ns-select-time', class: 'input-label' }, t('ns.label.time', '3. Time Since Last Dose')),
        h('select', {
          id: 'ns-select-time',
          class: 'ns-select',
          onchange: (e) => setNovelState({ timeSinceLastDoseHours: e.target.value }),
        }, [
          h('option', { value: 'under_6', selected: state.timeSinceLastDoseHours === 'under_6' }, t('ns.opt.timeUnder6', '< 6 hours (Early/imminent withdrawal)')),
          h('option', { value: '6_to_12', selected: state.timeSinceLastDoseHours === '6_to_12' }, t('ns.opt.time6to12', '6 to 12 hours (Active withdrawal surge)')),
          h('option', { value: '12_to_24', selected: state.timeSinceLastDoseHours === '12_to_24' }, t('ns.opt.time12to24', '12 to 24 hours (Peak withdrawal intensity)')),
          h('option', { value: 'over_24', selected: state.timeSinceLastDoseHours === 'over_24' }, t('ns.opt.timeOver24', '> 24 hours (Established withdrawal)')),
        ]),
      ]),

      // 4. ZaZa Silver Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasZaZaSilver,
            onchange: (e) => setNovelState({ hasZaZaSilver: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ns.check.zazaStrong', 'Taking ZaZa Silver? ')),
            t('ns.check.zazaDetail', '(Contains BOTH Tianeptine and Phenibut)'),
          ]),
        ]),
      ]),

      // 5. Cardiac Symptoms
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasCardiacSymptoms,
            onchange: (e) => setNovelState({ hasCardiacSymptoms: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ns.check.cardiacStrong', 'Palpitations, Syncope, or Chest Pain? ')),
            t('ns.check.cardiacDetail', '(Alert: QTc prolongation / Torsades hazard)'),
          ]),
        ]),
      ]),

      // 6. Delirium / Hallucinations
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasHallucinations,
            onchange: (e) => setNovelState({ hasHallucinations: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ns.check.deliriumStrong', 'Hallucinations, Confusion, or Severe Shaking? ')),
            t('ns.check.deliriumDetail', '(Alert: GABA-B / Anticholinergic psychosis)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `ns-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'ns-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.tierTitleEn),
      ]),
      h('div', { class: 'ns-result-details' }, [
        h('div', { class: 'ns-rec-item' }, [
          h('strong', {}, t('ns.res.action', 'Immediate Clinical Action Plan: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'ns-rec-item' }, [
          h('strong', {}, t('ns.res.strategy', 'Therapeutic Strategy: ')),
          h('p', {}, evaluation.treatmentStrategyEn),
        ]),
      ]),
    ]);

    // SBAR Action Card
    const sbarCard = h('div', { class: 'sbar-export-container' }, [
      h('div', { class: 'sbar-header' }, [
        h('h4', {}, t('ns.sbar.title', 'Zero-PII Clinical Handoff & Physician Note Generator')),
        h('p', {}, t('ns.sbar.desc', 'Generate an anonymous, structured clinical SBAR summary for Emergency Department triage, inpatient addiction consult, or primary care. Operates 100% in local memory.')),
      ]),
      h('div', { class: 'sbar-actions' }, [
        h('button', {
          class: 'btn-copy-sbar',
          onclick: (e) => {
            const text = buildNovelSubstancesSbarText(state, evaluation, 'en');
            navigator.clipboard.writeText(text).then(() => {
              const orig = e.currentTarget.textContent;
              e.currentTarget.textContent = 'Copied to Clipboard!';
              setTimeout(() => { e.currentTarget.textContent = orig; }, 2500);
            }).catch(() => {});
          },
        }, [icon('copy'), h('span', {}, t('ns.sbar.copyEn', 'Copy Clinical SBAR (English)'))]),
        h('button', {
          class: 'btn-copy-sbar secondary',
          onclick: (e) => {
            const text = buildNovelSubstancesSbarText(state, evaluation, 'es');
            navigator.clipboard.writeText(text).then(() => {
              const orig = e.currentTarget.textContent;
              e.currentTarget.textContent = '¡Copiado al Portapapeles!';
              setTimeout(() => { e.currentTarget.textContent = orig; }, 2500);
            }).catch(() => {});
          },
        }, [icon('copy'), h('span', {}, t('ns.sbar.copyEs', 'Copiar SBAR (Español)'))]),
      ]),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderSubstancesTab() {
    const section = h('section', { class: 'ns-substances-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('ns.sub.heading', 'Pharmacological & Clinical Profiles of Non-Traditional Substances')),
      h('p', { class: 'tab-subtitle' }, t('ns.sub.subtitle', 'Comprehensive toxicology breakdowns of unregulated and OTC compounds frequently missed on routine toxicology.')),

      h('div', { class: 'ns-substances-grid' }, Object.values(NOVEL_SUBSTANCE_PROFILES).map((sub) => h('div', { class: 'ns-sub-card' }, [
        h('h3', { class: 'ns-sub-title' }, sub.name),
        h('p', { class: 'ns-sub-street' }, [h('strong', {}, 'Common Brands / Street Names: '), h('span', {}, sub.streetNamesEn)]),
        h('p', { class: 'ns-sub-pharm' }, [h('strong', {}, 'Mechanism of Action: '), h('span', {}, sub.pharmacologyEn)]),
        h('div', { class: 'ns-alert-box cardiotox' }, [
          icon('alert'),
          h('p', {}, [h('strong', {}, 'Cardiotoxicity Hazard: '), sub.cardiotoxicityEn]),
        ]),
        h('div', { class: 'ns-alert-box uds' }, [
          icon('shield'),
          h('p', {}, [h('strong', {}, 'Urine Drug Screen Reality: '), sub.udsStatusEn]),
        ]),
        h('p', { class: 'ns-sub-wd' }, [h('strong', {}, 'Withdrawal Profile: '), h('span', {}, sub.withdrawalEn)]),
        h('p', { class: 'ns-sub-tx' }, [h('strong', {}, 'Evidence-Based Clinical Management: '), h('span', {}, sub.clinicalTreatmentEn)]),
      ]))),
    ]);
    return section;
  }

  function renderProductsTab() {
    const section = h('section', { class: 'ns-products-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('ns.prod.heading', 'Gas Station & Vape Shop Brand Safety Alerts')),
      h('p', { class: 'tab-subtitle' }, t('ns.prod.subtitle', 'Identification guide for unregulated convenience store products causing severe physical dependence and toxicity.')),

      h('div', { class: 'ns-products-grid' }, PRODUCT_SAFETY_ALERTS.map((prod) => h('div', { class: `ns-prod-card ${prod.hazardLevel}` }, [
        h('div', { class: 'ns-prod-badge' }, prod.hazardLevel.toUpperCase() + ' HAZARD'),
        h('h3', {}, prod.productName),
        h('p', { class: 'prod-ing' }, [h('strong', {}, 'Active Ingredients: '), prod.activeIngredientsEn]),
        h('p', { class: 'prod-warn' }, prod.clinicalWarningEn),
      ]))),
    ]);
    return section;
  }

  function renderBaclofenTab() {
    const section = h('section', { class: 'ns-baclofen-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('ns.bac.heading', 'Baclofen Substitution & MOUD Protocols')),
      h('p', { class: 'tab-subtitle' }, t('ns.bac.subtitle', 'Evidence-based outpatient and inpatient cross-titration regimens for Phenibut GABA-B dependence and Tianeptine/Kratom opioid transition.')),

      // Baclofen Box
      h('div', { class: 'ns-protocol-card' }, [
        h('h3', {}, 'Phenibut Withdrawal: Baclofen Cross-Titration Protocol'),
        h('div', { class: 'ns-ratio-banner' }, [
          icon('check'),
          h('strong', {}, BACLOFEN_SUBSTITUTION_RULES.conversionRatioEn),
        ]),
        h('ol', { class: 'ns-protocol-list' }, BACLOFEN_SUBSTITUTION_RULES.principlesEn.map((rule) => h('li', {}, rule))),
      ]),

      // Buprenorphine for Tianeptine & Kratom Box
      h('div', { class: 'ns-protocol-card' }, [
        h('h3', {}, 'Tianeptine & Kratom: Buprenorphine MOUD Induction Protocol'),
        h('p', {}, 'Per ASAM clinical guidance, buprenorphine is the primary evidence-based pharmacotherapy to terminate tianeptine and high-potency 7-OH kratom withdrawal and stabilize mu-opioid receptor signaling.'),
        h('ul', { class: 'ns-protocol-list' }, [
          h('li', {}, 'Confirm objective opioid withdrawal (COWS score >= 8). Tianeptine withdrawal typically peaks rapidly within 4 to 8 hours due to short elimination half-life.'),
          h('li', {}, 'Administer initial Buprenorphine 8 mg sublingual test dose; reassess at 45-60 minutes.'),
          h('li', {}, 'Escalate with additional 8 to 16 mg SL as needed on Day 1 (target 16 to 24 mg/day).'),
          h('li', {}, 'Obtain baseline 12-lead ECG to verify QTc is under 500 ms prior to discharge.'),
        ]),
      ]),
    ]);
    return section;
  }

  function renderUdsTab() {
    const section = h('section', { class: 'ns-uds-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('ns.uds.heading', 'Urine Drug Screen (UDS) Blindspots & False Negatives')),
      h('p', { class: 'tab-subtitle' }, t('ns.uds.subtitle', 'Understanding immunoassay limitations is vital to prevent withholding care or misdiagnosing patients in severe withdrawal.')),

      h('div', { class: 'uds-blindspots-card' }, [
        h('h3', {}, 'Why Routine Hospital Drug Screens are Negative'),
        h('p', {}, 'Standard 5-panel, 10-panel, and 12-panel immunoassay drug cups rely on antibody binding calibrated specifically to traditional morphine, codeine, benzoylecgonine (cocaine), and standard amphetamines. They have ZERO antibody cross-reactivity with tianeptine, mitragynine, phenibut, or loperamide.'),
        h('div', { class: 'uds-table-wrap' }, [
          h('table', { class: 'uds-comparison-table' }, [
            h('thead', {}, [
              h('tr', {}, [
                h('th', {}, 'Substance'),
                h('th', {}, 'Standard UDS Result'),
                h('th', {}, 'Clinical Reality'),
                h('th', {}, 'Confirmatory Testing Required'),
              ]),
            ]),
            h('tbody', {}, [
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'Tianeptine')),
                h('td', { class: 'col-neg' }, '100% Negative'),
                h('td', {}, 'Severe full mu-opioid agonist withdrawal'),
                h('td', {}, 'Send-out LC-MS/MS tianeptine panel'),
              ]),
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'Kratom / 7-OH')),
                h('td', { class: 'col-neg' }, '100% Negative'),
                h('td', {}, 'Potent mu-opioid physical dependence'),
                h('td', {}, 'Dedicated mitragynine immunoassay / LC-MS'),
              ]),
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'Phenibut')),
                h('td', { class: 'col-neg' }, '100% Negative'),
                h('td', {}, 'Life-threatening GABA-B delirium/seizure risk'),
                h('td', {}, 'Comprehensive qualitative GC/MS toxicology'),
              ]),
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'Loperamide')),
                h('td', { class: 'col-neg' }, '100% Negative'),
                h('td', {}, 'Massive QTc prolongation & opioid tolerance'),
                h('td', {}, 'Targeted loperamide serum/urine LC-MS/MS'),
              ]),
              h('tr', {}, [
                h('td', {}, h('strong', {}, 'DXM')),
                h('td', { class: 'col-fp' }, 'FALSE POSITIVE for PCP / Opioids'),
                h('td', {}, 'NMDA antagonism & serotonergic toxicity'),
                h('td', {}, 'Gas chromatography to rule out actual PCP'),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]);
    return section;
  }

  // Subscribe to in-RAM updates and render initial state
  const unsubscribe = subscribeNovelState(() => render());
  render();

  return container;
}
