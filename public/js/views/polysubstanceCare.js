// HarborPath - Polysubstance Overdose Synergy & Drug Interaction Navigator
// Clinical standards: CDC OD2A, SAMHSA, FDA Drug Safety Communications, ACMT (American College of Medical Toxicology)
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY & DRUG INTERACTION STANDARDS
// ============================================================================

export const SUBSTANCE_CLASSES = [
  {
    id: 'opioids',
    nameEn: 'Opioids',
    nameEs: 'Opioides',
    examplesEn: 'Fentanyl, heroin, oxycodone, methadone, morphine, buprenorphine',
    examplesEs: 'Fentanilo, heroína, oxicodona, metadona, morfina, buprenorfina',
    mechanismEn: 'Mu-opioid receptor agonism causing central hypoventilation and sedation',
    mechanismEs: 'Agonismo del receptor mu-opioide que causa hipoventilación central y sedación',
    riskClass: 'depressant',
    halfLifeEn: 'Fentanyl (serum 2-4h, lipophilic retention up to 24h+), Methadone (24-36h), Heroin/Morphine (2-4h)',
    halfLifeEs: 'Fentanilo (suero 2-4h, retención lipofílica hasta 24h+), Metadona (24-36h), Heroína/Morfina (2-4h)'
  },
  {
    id: 'benzodiazepines',
    nameEn: 'Benzodiazepines & Z-Drugs',
    nameEs: 'Benzodiacepinas y Fármacos Z',
    examplesEn: 'Alprazolam (Xanax), clonazepam, diazepam, lorazepam, bromazolam, zolpidem',
    examplesEs: 'Alprazolam (Xanax), clonazepam, diazepam, lorazepam, bromazolam, zolpidem',
    mechanismEn: 'Positive allosteric modulation of GABA-A receptors; suppresses hypercapnic ventilatory reflex',
    mechanismEs: 'Modulación alostérica positiva de los receptores GABA-A; suprime el reflejo hipercapnico respiratorio',
    riskClass: 'depressant',
    halfLifeEn: 'Alprazolam (11h), Clonazepam (30-40h), Diazepam (20-100h), Bromazolam (10-18h)',
    halfLifeEs: 'Alprazolam (11h), Clonazepam (30-40h), Diazepam (20-100h), Bromazolam (10-18h)'
  },
  {
    id: 'alcohol',
    nameEn: 'Alcohol (Ethanol)',
    nameEs: 'Alcohol (Etanol)',
    examplesEn: 'Beer, wine, liquor, fortified beverages',
    examplesEs: 'Cerveza, vino, licores, bebidas destiladas',
    mechanismEn: 'GABA-A enhancement and NMDA receptor inhibition; upper airway muscle relaxation',
    mechanismEs: 'Potenciación de GABA-A e inhibición del receptor NMDA; relajación de los músculos de la vía aérea superior',
    riskClass: 'depressant',
    halfLifeEn: 'Zero-order elimination (approx. 1 standard drink / 15-20 mg/dL per hour)',
    halfLifeEs: 'Eliminación de orden cero (aprox. 1 bebida estándar / 15-20 mg/dL por hora)'
  },
  {
    id: 'gabapentinoids',
    nameEn: 'Gabapentinoids',
    nameEs: 'Gabapentinoides',
    examplesEn: 'Gabapentin (Neurontin), pregabalin (Lyrica)',
    examplesEs: 'Gabapentina (Neurontin), pregabalina (Lyrica)',
    mechanismEn: 'Voltage-gated calcium channel (alpha-2-delta) ligand; blunts respiratory drive synergistically with opioids',
    mechanismEs: 'Ligando del canal de calcio dependiente de voltaje (alfa-2-delta); embota el impulso respiratorio sinérgicamente con opioides',
    riskClass: 'depressant',
    halfLifeEn: 'Gabapentin (5-7h, saturable absorption), Pregabalin (6h, linear absorption)',
    halfLifeEs: 'Gabapentina (5-7h, absorción saturable), Pregabalina (6h, absorción lineal)'
  },
  {
    id: 'stimulants',
    nameEn: 'Stimulants',
    nameEs: 'Estimulantes',
    examplesEn: 'Cocaine, methamphetamine, amphetamine/dextroamphetamine (Adderall), MDMA',
    examplesEs: 'Cocaína, metanfetamina, anfetaminas (Adderall), MDMA',
    mechanismEn: 'Dopamine, norepinephrine, and serotonin reuptake inhibition and reverse transport',
    mechanismEs: 'Inhibición de la recaptación y transporte inverso de dopamina, norepinefrina y serotonina',
    riskClass: 'stimulant',
    halfLifeEn: 'Cocaine (0.5-1.5h), Methamphetamine (10-12h), Amphetamine (10-13h)',
    halfLifeEs: 'Cocaína (0.5-1.5h), Metanfetamina (10-12h), Anfetamina (10-13h)'
  },
  {
    id: 'dissociatives',
    nameEn: 'Dissociatives',
    nameEs: 'Disociativos',
    examplesEn: 'Ketamine, PCP, dextromethorphan (DXM), methoxetamine (MXE)',
    examplesEs: 'Ketamina, PCP, dextrometorfano (DXM), metoxetamina (MXE)',
    mechanismEn: 'NMDA receptor antagonism; suppresses protective laryngeal reflexes and causes profound detachment',
    mechanismEs: 'Antagonismo del receptor NMDA; suprime reflejos laríngeos protectores y causa desconexión profunda',
    riskClass: 'dissociative',
    halfLifeEn: 'Ketamine (2-3h), DXM (2-4h extensive metabolizers, up to 24h poor metabolizers)',
    halfLifeEs: 'Ketamina (2-3h), DXM (2-4h metabolizadores rápidos, hasta 24h metabolizadores lentos)'
  },
  {
    id: 'alpha2_agonists',
    nameEn: 'Alpha-2 Agonists & Adulterants',
    nameEs: 'Agonistas Alfa-2 y Adulterantes',
    examplesEn: 'Xylazine ("tranq"), medetomidine, clonidine',
    examplesEs: 'Xilacina ("tranq"), medetomidina, clonidina',
    mechanismEn: 'Central presynaptic alpha-2 adrenergic stimulation causing severe bradycardia, hypotension, and deep unresponsive sedation',
    mechanismEs: 'Estimulación adrenérgica presináptica alfa-2 central que causa bradicardia severa, hipotensión y sedación profunda insensible',
    riskClass: 'sedative',
    halfLifeEn: 'Xylazine (23-50 minutes serum, but prolonged clinical sedation 8-12h+)',
    halfLifeEs: 'Xilacina (23-50 minutos en suero, pero sedación clínica prolongada de 8-12h+)'
  },
  {
    id: 'serotonergics',
    nameEn: 'Serotonergic Agents',
    nameEs: 'Agentes Serotoninérgicos',
    examplesEn: 'SSRIs/SNRIs, MDMA, tramadol, DXM, MAOIs, triptans',
    examplesEs: 'ISRS/IRSN, MDMA, tramadol, DXM, IMAO, triptanos',
    mechanismEn: 'Excessive postsynaptic 5-HT1A and 5-HT2A stimulation risking neuromuscular hyperactivity and hyperthermia',
    mechanismEs: 'Estimulación postsináptica excesiva de 5-HT1A y 5-HT2A que arriesga hiperactividad neuromuscular e hipertermia',
    riskClass: 'serotonergic',
    halfLifeEn: 'Varies by agent (Fluoxetine days, MDMA 6-8h, Tramadol 6h)',
    halfLifeEs: 'Varía según el agente (Fluoxetina días, MDMA 6-8h, Tramadol 6h)'
  }
];

export const HUNTER_SEROTONIN_CRITERIA = {
  titleEn: 'Hunter Serotonin Toxicity Criteria (Gold Standard)',
  titleEs: 'Criterios de Toxicidad por Serotonina de Hunter (Estándar de Oro)',
  descriptionEn: 'Serotonin toxicity is diagnosed when a patient on a serotonergic agent exhibits at least ONE of the following clinical features:',
  descriptionEs: 'La toxicidad por serotonina se diagnostica cuando un paciente que consume un agente serotoninérgico presenta al menos UNO de los siguientes signos clínicos:',
  rules: [
    {
      ruleEn: 'Spontaneous clonus (rhythmic involuntary muscular contractions)',
      ruleEs: 'Clono espontáneo (contracciones musculares rítmicas involuntarias)',
      diagnosticWeightEn: 'Definitive diagnostic sign',
      diagnosticWeightEs: 'Signo diagnóstico definitivo'
    },
    {
      ruleEn: 'Inducible clonus PLUS agitation or diaphoresis (excessive sweating)',
      ruleEs: 'Clono inducible MÁS agitación o diaforesis (sudoración excesiva)',
      diagnosticWeightEn: 'Definitive diagnostic sign',
      diagnosticWeightEs: 'Signo diagnóstico definitivo'
    },
    {
      ruleEn: 'Ocular clonus (rapid conjugate eye movements) PLUS agitation or diaphoresis',
      ruleEs: 'Clono ocular (movimientos oculares rápidos coordinados) MÁS agitación o diaforesis',
      diagnosticWeightEn: 'Definitive diagnostic sign',
      diagnosticWeightEs: 'Signo diagnóstico definitivo'
    },
    {
      ruleEn: 'Tremor PLUS hyperreflexia (exaggerated deep tendon reflexes)',
      ruleEs: 'Temblor MÁS hiperreflexia (reflejos osteotendinosos profundos exagerados)',
      diagnosticWeightEn: 'Definitive diagnostic sign',
      diagnosticWeightEs: 'Signo diagnóstico definitivo'
    },
    {
      ruleEn: 'Hypertonia (muscle rigidity) PLUS temperature > 38°C (100.4°F) PLUS ocular or inducible clonus',
      ruleEs: 'Hipertonía (rigidez muscular) MÁS temperatura > 38°C (100.4°F) MÁS clono ocular o inducible',
      diagnosticWeightEn: 'Life-threatening emergency requiring ICU paralysis and active external cooling',
      diagnosticWeightEs: 'Emergencia con riesgo vital que requiere parálisis en UCI y enfriamiento externo activo'
    }
  ]
};

export const AIRWAY_RESUSCITATION_STANDARDS = {
  titleEn: 'Airway & Rescue Breathing Protocol in Polysubstance Sedation',
  titleEs: 'Protocolo de Vía Aérea y Respiración de Rescate en Sedación por Polisustancias',
  summaryEn: 'Naloxone ONLY reverses opioids. In multi-depressant overdoses (opioid + benzo, alcohol, or xylazine), the patient may remain comatose even after adequate naloxone. If breathing is restored (>10-12 breaths/min), DO NOT administer excessive repeat naloxone, which triggers flash pulmonary edema and vomiting. Maintain airway patency.',
  summaryEs: 'La naloxona SOLO revierte los opioides. En sobredosis de múltiples depresores (opioide + benzo, alcohol o xilacina), el paciente puede permanecer comatoso incluso tras una dosis adecuada de naloxona. Si la respiración se restablece (>10-12 resp/min), NO administre dosis repetidas excesivas de naloxona, lo que provoca edema pulmonar repentino y vómitos. Mantenga la vía aérea permeable.',
  steps: [
    {
      step: 1,
      titleEn: 'Assess Breathing & Responsiveness',
      titleEs: 'Evalúe la Respiración y Respuesta',
      actionEn: 'Check for chest rise and feel for breath against your cheek. If < 8-10 breaths/min, agonal snoring/gasping, or blue/gray lips: person is in acute respiratory arrest.',
      actionEs: 'Observe si el pecho se eleva y sienta el aire en su mejilla. Si hay < 8-10 resp/min, ronquidos agónicos o labios azulados/grises: la persona está en paro respiratorio agudo.'
    },
    {
      step: 2,
      titleEn: 'Administer First Dose of Naloxone',
      titleEs: 'Administre la Primera Dosis de Naloxona',
      actionEn: 'Administer 4 mg intranasal spray in one nostril (or 0.4-2 mg IM). Call 911 immediately.',
      actionEs: 'Administre 4 mg en aerosol nasal en una fosa nasal (o 0.4-2 mg IM). Llame al 911 de inmediato.'
    },
    {
      step: 3,
      titleEn: 'Start Immediate Rescue Breathing',
      titleEs: 'Inicie Respiración de Rescate Inmediata',
      actionEn: 'Tilt head back, lift chin, pinch nose shut, and give 1 breath every 5 seconds. Oxygenation is what prevents brain damage while naloxone binds to receptors.',
      actionEs: 'Incline la cabeza hacia atrás, levante la barbilla, tape la nariz y dé 1 respiración cada 5 segundos. La oxigenación es lo que previene el daño cerebral mientras la naloxona actúa.'
    },
    {
      step: 4,
      titleEn: 'Evaluate at 2-3 Minutes',
      titleEs: 'Evalúe a los 2-3 Minutos',
      actionEn: 'If still NOT breathing normally, give second dose of naloxone in the opposite nostril and continue rescue breathing.',
      actionEs: 'Si todavía NO respira con normalidad, administre una segunda dosis de naloxona en la fosa nasal opuesta y continúe la respiración de rescate.'
    },
    {
      step: 5,
      titleEn: 'The Sedation Plateau & Recovery Position',
      titleEs: 'Meseta de Sedación y Posición de Recuperación',
      actionEn: 'If breathing returns to normal (> 10-12 breaths/min) but the person remains asleep (due to benzos, alcohol, or xylazine), roll them onto their side into the Recovery Position to prevent vomit aspiration. DO NOT keep pumping naloxone if breathing is adequate.',
      actionEs: 'Si la respiración se normaliza (> 10-12 resp/min) pero la persona sigue dormida (por benzos, alcohol o xilacina), colóquela de lado en Posición de Recuperación para evitar la aspiración de vómito. NO siga inyectando naloxona si la respiración es adecuada.'
    }
  ]
};

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluatePolysubstanceRisk(selectedSubstanceIds = []) {
  const ids = Array.isArray(selectedSubstanceIds) ? selectedSubstanceIds : [];
  
  if (ids.length === 0) {
    return {
      severity: 'none',
      tierTitleEn: 'No Substances Selected',
      tierTitleEs: 'No se Seleccionaron Sustancias',
      badgeClass: 'badge-neutral',
      summaryEn: 'Select two or more substance classes to evaluate synergistic overdose risks, respiratory depression, and clinical interactions.',
      summaryEs: 'Seleccione dos o más clases de sustancias para evaluar riesgos sinérgicos de sobredosis, depresión respiratoria e interacciones clínicas.',
      primaryRisks: [],
      emergencyActions: [],
      harmReductionPoints: []
    };
  }

  if (ids.length === 1) {
    const single = SUBSTANCE_CLASSES.find(s => s.id === ids[0]);
    return {
      severity: 'single',
      tierTitleEn: `Single Substance Profile: ${single ? single.nameEn : ids[0]}`,
      tierTitleEs: `Perfil de Sustancia Única: ${single ? single.nameEs : ids[0]}`,
      badgeClass: 'badge-info',
      summaryEn: 'While single substances carry baseline risks, combining them with other central nervous system depressants or stimulants drastically amplifies unpredictable toxicities.',
      summaryEs: 'Aunque una sola sustancia conlleva riesgos basales, combinarla con otros depresores o estimulantes del sistema nervioso central amplifica drásticamente toxicidades impredecibles.',
      primaryRisks: [
        {
          titleEn: 'Baseline Pharmacological Effects',
          titleEs: 'Efectos Farmacológicos Basales',
          descEn: single ? single.mechanismEn : '',
          descEs: single ? single.mechanismEs : ''
        }
      ],
      emergencyActions: [
        {
          actionEn: 'Always carry naloxone and ensure someone knows how to use it.',
          actionEs: 'Lleve siempre naloxona y asegúrese de que alguien sepa usarla.'
        }
      ],
      harmReductionPoints: [
        {
          tipEn: 'Do not use alone; utilize the Never Use Alone hotline (877-696-1997) or local overdose prevention services.',
          tipEs: 'No consuma a solas; utilice la línea Never Use Alone (877-696-1997) o servicios locales de prevención de sobredosis.'
        }
      ]
    };
  }

  const hasOpioids = ids.includes('opioids');
  const hasBenzos = ids.includes('benzodiazepines');
  const hasAlcohol = ids.includes('alcohol');
  const hasGabapentinoids = ids.includes('gabapentinoids');
  const hasStimulants = ids.includes('stimulants');
  const hasDissociatives = ids.includes('dissociatives');
  const hasAlpha2 = ids.includes('alpha2_agonists');
  const hasSerotonergics = ids.includes('serotonergics');

  const depressantCount = [hasOpioids, hasBenzos, hasAlcohol, hasGabapentinoids, hasAlpha2].filter(Boolean).length;
  const primaryRisks = [];
  const emergencyActions = [];
  const harmReductionPoints = [];

  let severity = 'moderate';
  let badgeClass = 'badge-caution';
  let tierTitleEn = 'Caution: Augmented Interaction';
  let tierTitleEs = 'Precaución: Interacción Aumentada';

  // 1. Critical Synergistic Respiratory Arrest (Opioid + other depressants)
  if (hasOpioids && (hasBenzos || hasAlcohol || hasGabapentinoids || hasAlpha2)) {
    severity = 'critical';
    badgeClass = 'badge-danger';
    tierTitleEn = 'CRITICAL: Synergistic Depressant Respiratory Arrest';
    tierTitleEs = 'CRÍTICO: Paro Respiratorio Sinérgico por Depresores';

    primaryRisks.push({
      titleEn: 'Multiplied Respiratory Drive Collapse',
      titleEs: 'Colapso Multiplicado del Impulso Respiratorio',
      descEn: 'Opioids suppress the hypoxic respiratory drive, while benzodiazepines and alcohol blunt the hypercapnic arousal reflex. Gabapentinoids blunt ventilatory compensation. This combination causes fatal obstructive and central apnea at much lower doses than either agent alone.',
      descEs: 'Los opioides suprimen el impulso respiratorio hipóxico, mientras que las benzodiacepinas y el alcohol embotan el reflejo de alerta hipercapnico. Los gabapentinoides anulan la compensación ventilatoria. Esta combinación produce apnea obstructiva y central mortal con dosis mucho más bajas que cada agente por separado.'
    });

    if (hasAlpha2) {
      primaryRisks.push({
        titleEn: 'Alpha-2 Mediated Prolonged Coma & Bradycardia',
        titleEs: 'Coma Prolongado y Bradicardia por Alfa-2',
        descEn: 'Xylazine or medetomidine co-ingested with opioids causes deep unresponsive sedation and severe bradycardia that DOES NOT respond to naloxone. Naloxone restores breathing, but the patient remains deeply asleep.',
        descEs: 'La xilacina o medetomidina consumida con opioides causa sedación profunda insensible y bradicardia severa que NO responde a la naloxona. La naloxona restaura la respiración, pero el paciente permanece profundamente dormido.'
      });
    }

    emergencyActions.push({
      actionEn: 'Administer naloxone immediately if breathing is slow (< 8-10 bpm) or snoring/gasping. Call 911 right away.',
      actionEs: 'Administre naloxona de inmediato si la respiración es lenta (< 8-10 rpm) o si hay ronquidos/jadeos. Llame al 911 de inmediato.'
    });
    emergencyActions.push({
      actionEn: 'Initiate rescue breathing (1 breath every 5 seconds) without delay. Naloxone only restores the opioid component; oxygenation keeps the brain alive.',
      actionEs: 'Inicie respiración de rescate (1 respiración cada 5 segundos) sin demora. La naloxona solo revierte el componente opioide; la oxigenación mantiene el cerebro vivo.'
    });
  }

  // 2. Speedball / Goofball (Opioid + Stimulant)
  if (hasOpioids && hasStimulants) {
    if (severity !== 'critical') {
      severity = 'severe';
      badgeClass = 'badge-danger';
      tierTitleEn = 'SEVERE: Masking Effect & Sudden Respiratory Collapse (Speedball/Goofball)';
      tierTitleEs = 'SEVERO: Efecto de Enmascaramiento y Colapso Respiratorio Repentino (Speedball/Goofball)';
    }

    primaryRisks.push({
      titleEn: 'Pharmacokinetic Half-Life Mismatch & Sudden Crash',
      titleEs: 'Desfase Farmacocinético de Vida Media y Colapso Repentino',
      descEn: 'Stimulants (especially cocaine, half-life 1 hour) temporarily mask the severe respiratory depression of opioids (fentanyl/methadone). When the stimulant wears off rapidly, the user suddenly lapses into fatal respiratory arrest. In addition, simultaneous stimulation and depression trigger dangerous cardiac arrhythmias and myocardial ischemia.',
      descEs: 'Los estimulantes (especialmente la cocaína, vida media de 1 hora) enmascaran temporalmente la depresión respiratoria severa de los opioides (fentanilo/metadona). Cuando el estimulante se agota rápidamente, el usuario entra súbitamente en paro respiratorio fatal. Además, la estimulación y depresión simultáneas provocan arritmias cardíacas e isquemia miocárdica.'
    });

    harmReductionPoints.push({
      tipEn: 'Do not assume you are safe from overdose just because you feel awake from the stimulant. The opioid outlasts the stimulant.',
      tipEs: 'No asuma que está a salvo de una sobredosis solo porque se siente despierto por el estimulante. El opioide dura mucho más que el estimulante.'
    });
  }

  // 3. Serotonin Syndrome / Toxicity (Serotonergics + Stimulants / Tramadol / DXM)
  if (hasSerotonergics && (hasStimulants || hasDissociatives || (hasOpioids && ids.includes('tramadol')))) {
    if (severity !== 'critical') {
      severity = 'severe';
      badgeClass = 'badge-warning';
      tierTitleEn = 'SEVERE: Life-Threatening Serotonin Toxicity Risk';
      tierTitleEs: 'SEVERO: Riesgo de Toxicidad Serotoninérgica con Peligro Mortal';
    }

    primaryRisks.push({
      titleEn: 'Serotonin Syndrome (Hunter Criteria Risk)',
      titleEs: 'Síndrome Serotoninérgico (Riesgo Criterios de Hunter)',
      descEn: 'Combining serotonergic medications (SSRIs/SNRIs, MAOIs) with MDMA, cocaine, methamphetamine, DXM, or tramadol can trigger acute serotonin syndrome: spontaneous clonus, hyperreflexia, agitation, autonomic instability, and lethal hyperthermia (> 104°F / 40°C).',
      descEs: 'Combinar medicamentos serotoninérgicos (ISRS/IRSN, IMAO) con MDMA, cocaína, metanfetamina, DXM o tramadol puede desencadenar síndrome serotoninérgico agudo: clono espontáneo, hiperreflexia, agitación, inestabilidad autonómica e hipertermia mortal (> 40°C / 104°F).'
    });

    emergencyActions.push({
      actionEn: 'If rigid muscles, tremors, or severe fever occur: call 911 immediately. Apply physical cooling (ice packs to axilla/groin). Do NOT give acetaminophen/aspirin (ineffective for muscular hyperthermia).',
      actionEs: 'Si aparecen rigidez muscular, temblores o fiebre alta: llame al 911 de inmediato. Aplique enfriamiento físico (hielo en axilas e ingles). NO administre acetaminofén/aspirina (ineficaces para la hipertermia muscular).'
    });
  }

  // 4. Non-Opioid Multi-Depressant Stack (Benzos + Alcohol + Gabapentinoids)
  if (!hasOpioids && depressantCount >= 2) {
    severity = 'severe';
    badgeClass = 'badge-danger';
    tierTitleEn = 'SEVERE: Non-Opioid Multi-GABAergic Depressant Toxicity';
    tierTitleEs: 'SEVERO: Toxicidad por Múltiples Depresores GABAérgicos No Opioides';

    primaryRisks.push({
      titleEn: 'Profound Coma, Aspiration & Anoxic Brain Injury (Naloxone-Resistant)',
      titleEs: 'Coma Profundo, Aspiración y Daño Cerebral Anóxico (Resistente a Naloxona)',
      descEn: 'Combining benzodiazepines, alcohol, gabapentinoids, or alpha-2 agonists creates profound central nervous system depression that NALOXONE CANNOT REVERSE. Fatalities occur via vomit aspiration, airway obstruction, or hypoventilation leading to anoxic brain injury.',
      descEs: 'Combinar benzodiacepinas, alcohol, gabapentinoides o agonistas alfa-2 genera una depresión profunda del SNC que LA NALOXONA NO PUEDE REVERTIR. Las muertes ocurren por broncoaspiración de vómito, obstrucción de la vía aérea o hipoventilación que provoca daño cerebral anóxico.'
    });

    emergencyActions.push({
      actionEn: 'Place immediately in the Recovery Position on their side. Call 911 for emergency supportive airway management and mechanical ventilation if needed.',
      actionEs: 'Coloque inmediatamente de lado en Posición de Recuperación. Llame al 911 para soporte de vía aérea de emergencia y ventilación mecánica si es necesario.'
    });
  }

  // 5. Dissociatives + Depressants (Ketamine + Alcohol / Benzos)
  if (hasDissociatives && (hasAlcohol || hasBenzos || hasOpioids)) {
    primaryRisks.push({
      titleEn: 'Airway Reflex Abolition & Fatal Aspiration Risk',
      titleEs: 'Abolición de Reflejos de la Vía Aérea y Riesgo Fatal de Aspiración',
      descEn: 'Dissociatives like ketamine combined with alcohol or benzos abolish laryngeal protective reflexes while inducing intense nausea and motor paralysis. Aspiration of vomitus is a leading cause of preventable death in this combination.',
      descEs: 'Los disociativos como la ketamina combinados con alcohol o benzodiacepinas anulan los reflejos laríngeos protectores mientras provocan náuseas intensas y parálisis motora. La aspiración de vómito es la causa principal de muerte prevenible en esta combinación.'
    });

    harmReductionPoints.push({
      tipEn: 'Never combine ketamine with alcohol, GHB, or benzodiazepines. Always maintain sitting or recovery positions.',
      tipEs: 'Nunca combine ketamina con alcohol, GHB o benzodiacepinas. Manténgase siempre sentado o en posición de recuperación.'
    });
  }

  // General Harm Reduction Strategies
  harmReductionPoints.push({
    tipEn: 'Stagger consumption: wait for the full peak of one substance before taking another. Never take multiple new substances simultaneously.',
    tipEs: 'Escale el consumo: espere el efecto pico de una sustancia antes de tomar otra. Nunca consuma varias sustancias nuevas simultáneamente.'
  });
  harmReductionPoints.push({
    tipEn: 'Halve standard doses: Synergistic depressant or stimulant combinations mean 1 + 1 can equal 5 in toxic physiological impact.',
    tipEs: 'Reduzca las dosis habituales a la mitad: Las combinaciones sinérgicas de depresores o estimulantes implican que 1 + 1 puede equivaler a 5 en impacto tóxico.'
  });
  harmReductionPoints.push({
    tipEn: 'Use Fentanyl Test Strips (FTS) and Xylazine Test Strips (XTS) to detect unexpected adulterant combinations in unregulated supplies.',
    tipEs: 'Use tiras reactivas de fentanilo (FTS) y xilacina (XTS) para detectar combinaciones inesperadas de adulterantes en suministros no regulados.'
  });
  harmReductionPoints.push({
    tipEn: 'Never Use Alone: Connect with the Never Use Alone hotline at 877-696-1997 or use virtual spotter applications.',
    tipEs: 'Nunca consuma solo: Conéctese con la línea Never Use Alone al 877-696-1997 o utilice aplicaciones de acompañamiento virtual.'
  });

  return {
    severity,
    tierTitleEn,
    tierTitleEs,
    badgeClass,
    summaryEn: `Evaluating ${ids.length} selected substances: ${depressantCount >= 2 ? 'High depressant synergy detected.' : 'Synergistic interactions identified.'}`,
    summaryEs: `Evaluando ${ids.length} sustancias seleccionadas: ${depressantCount >= 2 ? 'Alta sinergia de depresores detectada.' : 'Interacciones sinérgicas identificadas.'}`,
    primaryRisks,
    emergencyActions,
    harmReductionPoints
  };
}

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE INVARIANT)
// ============================================================================

let polysubstanceState = {
  selectedSubstances: ['opioids', 'benzodiazepines'],
  activeTab: 'checker', // 'checker' | 'airway' | 'serotonin' | 'safety-plan'
  staggerPlanChecked: false,
  testStripsChecked: false,
  spotterChecked: false,
  naloxoneChecked: false
};

export function getPolysubstanceState() {
  return {
    ...polysubstanceState,
    selectedSubstances: [...polysubstanceState.selectedSubstances]
  };
}

export function setPolysubstanceState(patch = {}) {
  polysubstanceState = {
    ...polysubstanceState,
    ...patch,
    selectedSubstances: patch.selectedSubstances 
      ? [...patch.selectedSubstances] 
      : polysubstanceState.selectedSubstances
  };
}

export function resetPolysubstanceState() {
  polysubstanceState = {
    selectedSubstances: ['opioids', 'benzodiazepines'],
    activeTab: 'checker',
    staggerPlanChecked: false,
    testStripsChecked: false,
    spotterChecked: false,
    naloxoneChecked: false
  };
}

// ============================================================================
// BILINGUAL PLAIN-TEXT SUMMARY GENERATOR (ZERO-PII)
// ============================================================================

export function formatPolysubstanceSummaryText(state = polysubstanceState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluatePolysubstanceRisk(state.selectedSubstances);
  const selectedNames = state.selectedSubstances.map(id => {
    const s = SUBSTANCE_CLASSES.find(item => item.id === id);
    return s ? (isEs ? s.nameEs : s.nameEn) : id;
  }).join(', ');

  const lines = [];
  lines.push(isEs ? '=== EVALUACIÓN DE INTERACCIÓN DE POLISUSTANCIAS DE HARBORPATH ===' : '=== HARBORPATH POLYSUBSTANCE INTERACTION & SYNERGY REPORT ===');
  lines.push(isEs ? `Fecha de generación: ${new Date().toISOString().split('T')[0]}` : `Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push(isEs ? 'Privacidad: En memoria RAM efímera (Cero datos en disco/servidor)' : 'Privacy: In-RAM ephemeral state (Zero device storage / Zero PII)');
  lines.push('');
  lines.push(isEs ? `Sustancias seleccionadas: ${selectedNames || 'Ninguna'}` : `Selected Substances: ${selectedNames || 'None'}`);
  lines.push(isEs ? `Nivel de riesgo clínico: ${evalResult.tierTitleEs || evalResult.tierTitleEn}` : `Clinical Risk Level: ${evalResult.tierTitleEn}`);
  lines.push('');
  lines.push(isEs ? '--- RIESGOS FARMACOLÓGICOS PRINCIPALES ---' : '--- PRIMARY PHARMACOLOGICAL RISKS ---');
  if (evalResult.primaryRisks.length === 0) {
    lines.push(isEs ? 'No se identificaron interacciones graves de inmediato.' : 'No immediate severe interactions identified.');
  } else {
    evalResult.primaryRisks.forEach((risk, i) => {
      lines.push(`${i + 1}. ${isEs ? risk.titleEs : risk.titleEn}`);
      lines.push(`   ${isEs ? risk.descEs : risk.descEn}`);
    });
  }
  lines.push('');
  if (evalResult.emergencyActions.length > 0) {
    lines.push(isEs ? '--- ACCIONES DE EMERGENCIA INMEDIATA ---' : '--- IMMEDIATE EMERGENCY ACTIONS ---');
    evalResult.emergencyActions.forEach((act, i) => {
      lines.push(`[!] ${isEs ? act.actionEs : act.actionEn}`);
    });
    lines.push('');
  }
  lines.push(isEs ? '--- PROTOCOLO DE REDUCCIÓN DE DAÑOS Y SEGURIDAD ---' : '--- HARM REDUCTION & SAFETY PROTOCOL ---');
  evalResult.harmReductionPoints.forEach((pt, i) => {
    lines.push(`- ${isEs ? pt.tipEs : pt.tipEn}`);
  });
  lines.push('');
  lines.push(isEs ? 'Línea Never Use Alone (EE. UU.): 877-696-1997' : 'Never Use Alone Hotline (US): 877-696-1997');
  lines.push(isEs ? 'Línea de Crisis y Suicidio: 988 | Emergencias: 911' : 'Suicide & Crisis Lifeline: 988 | Emergencies: 911');

  return lines.join('\n');
}

// ============================================================================
// MAIN VIEW COMPONENT (DOM RENDERING & ACCESSIBILITY)
// ============================================================================

export function polysubstanceCareView() {
  const container = h('div', { class: 'polysubstance-view' });

  function render() {
    clear(container);
    const isEs = typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'es';
    const localState = getPolysubstanceState();
    const evalResult = evaluatePolysubstanceRisk(localState.selectedSubstances);

    // Header banner
    const header = h('header', { class: 'view-header' }, [
      h('div', { class: 'badge badge-warning' }, [
        icon('alert-triangle'),
        h('span', {}, isEs ? 'Toxicología y Reducción de Daños' : 'Toxicology & Harm Reduction')
      ]),
      h('h1', {}, isEs ? 'Navegador de Sinergia de Polisustancias e Interacciones' : 'Polysubstance Overdose Synergy & Drug Interaction Navigator'),
      h('p', { class: 'view-intro' }, isEs
        ? 'Más del 80% de las muertes por sobredosis involucran combinaciones de sustancias. Conozca las interacciones letales entre depresores, el enmascaramiento de estimulantes, el protocolo de vía aérea cuando la naloxona no basta y cómo protegerse sin juzgar.'
        : 'Over 80% of overdose fatalities involve multi-substance combinations. Understand fatal depressant synergies, stimulant masking, airway rescue protocols when naloxone does not reverse sedation, and non-judgmental harm reduction strategies.')
    ]);

    // Navigation Tabs
    const tabsNav = h('nav', { class: 'tab-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Polisustancias' : 'Polysubstance Tabs' }, [
      h('button', {
        class: `tab-btn ${localState.activeTab === 'checker' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'checker'),
        onclick: () => { setPolysubstanceState({ activeTab: 'checker' }); render(); }
      }, isEs ? 'Verificador de Interacción' : 'Synergy Checker'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'airway' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'airway'),
        onclick: () => { setPolysubstanceState({ activeTab: 'airway' }); render(); }
      }, isEs ? 'Vía Aérea y Naloxona' : 'Airway & Naloxone'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'serotonin' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'serotonin'),
        onclick: () => { setPolysubstanceState({ activeTab: 'serotonin' }); render(); }
      }, isEs ? 'Toxicidad Serotonina (Hunter)' : 'Serotonin Toxicity'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'safety-plan' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'safety-plan'),
        onclick: () => { setPolysubstanceState({ activeTab: 'safety-plan' }); render(); }
      }, isEs ? 'Plan de Seguridad y Exportación' : 'Safety Plan & Export')
    ]);

    let tabContent;
    switch (localState.activeTab) {
      case 'airway':
        tabContent = renderAirwayTab(isEs);
        break;
      case 'serotonin':
        tabContent = renderSerotoninTab(isEs);
        break;
      case 'safety-plan':
        tabContent = renderSafetyPlanTab(isEs, localState, evalResult, render);
        break;
      case 'checker':
      default:
        tabContent = renderCheckerTab(isEs, localState, evalResult, render);
        break;
    }

    container.appendChild(header);
    container.appendChild(tabsNav);
    container.appendChild(tabContent);
  }

  render();
  return container;
}

// ----------------------------------------------------------------------------
// TAB 1: INTERACTIVE SYNERGY CHECKER
// ----------------------------------------------------------------------------

function renderCheckerTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  // Substance selection checkboxes
  const selectSection = h('section', { class: 'card', 'aria-labelledby': 'substance-select-title' }, [
    h('h3', { id: 'substance-select-title' }, isEs ? '1. Seleccione las Clases de Sustancias a Evaluar' : '1. Select Substance Classes to Evaluate'),
    h('p', { class: 'text-muted' }, isEs 
      ? 'Elija dos o más sustancias para revelar interacciones farmacodinámicas, riesgos de colapso respiratorio y pautas clínicas.' 
      : 'Select two or more substance classes to reveal pharmacodynamic interactions, respiratory arrest risks, and clinical pearls.')
  ]);

  const grid = h('div', { class: 'grid-2-col' });
  SUBSTANCE_CLASSES.forEach(sub => {
    const isChecked = localState.selectedSubstances.includes(sub.id);
    const item = h('label', { class: `checkbox-card ${isChecked ? 'selected' : ''}` }, [
      h('input', {
        type: 'checkbox',
        checked: isChecked,
        onchange: (e) => {
          let updated = [...localState.selectedSubstances];
          if (e.target.checked) {
            if (!updated.includes(sub.id)) updated.push(sub.id);
          } else {
            updated = updated.filter(id => id !== sub.id);
          }
          setPolysubstanceState({ selectedSubstances: updated });
          reRender();
        }
      }),
      h('div', { class: 'checkbox-info' }, [
        h('strong', {}, isEs ? sub.nameEs : sub.nameEn),
        h('span', { class: 'sub-examples' }, isEs ? sub.examplesEs : sub.examplesEn)
      ])
    ]);
    grid.appendChild(item);
  });
  selectSection.appendChild(grid);

  // Dynamic Risk & Interaction Output
  const evalSection = h('section', { class: 'card', 'aria-live': 'polite', 'aria-labelledby': 'eval-output-title' }, [
    h('div', { class: 'flex-between' }, [
      h('h3', { id: 'eval-output-title' }, isEs ? '2. Evaluación Farmacológica de Riesgo' : '2. Pharmacological Risk Evaluation'),
      h('span', { class: `badge ${evalResult.badgeClass}` }, isEs ? evalResult.tierTitleEs : evalResult.tierTitleEn)
    ]),
    h('p', { class: 'eval-summary' }, isEs ? evalResult.summaryEs : evalResult.summaryEn)
  ]);

  if (evalResult.emergencyActions.length > 0) {
    const alertBox = h('div', { class: 'callout callout-emergency' }, [
      h('h4', {}, [icon('alert-octagon'), h('span', {}, isEs ? 'Acciones Críticas Inmediatas' : 'Critical Immediate Actions')]),
      h('ul', {}, evalResult.emergencyActions.map(act => h('li', {}, isEs ? act.actionEs : act.actionEn)))
    ]);
    evalSection.appendChild(alertBox);
  }

  if (evalResult.primaryRisks.length > 0) {
    const risksTitle = h('h4', {}, isEs ? 'Mecanismos y Peligros Fisiológicos' : 'Physiological Mechanisms & Hazards');
    const risksList = h('div', { class: 'risks-list' }, evalResult.primaryRisks.map(r => {
      return h('div', { class: 'risk-item' }, [
        h('strong', {}, isEs ? r.titleEs : r.titleEn),
        h('p', {}, isEs ? r.descEs : r.descEn)
      ]);
    }));
    evalSection.appendChild(risksTitle);
    evalSection.appendChild(risksList);
  }

  if (evalResult.harmReductionPoints.length > 0) {
    const hrTitle = h('h4', {}, isEs ? 'Pautas Esenciales de Reducción de Daños' : 'Essential Harm Reduction Pearls');
    const hrList = h('ul', { class: 'bullet-list' }, evalResult.harmReductionPoints.map(p => {
      return h('li', {}, isEs ? p.tipEs : p.tipEn);
    }));
    evalSection.appendChild(hrTitle);
    evalSection.appendChild(hrList);
  }

  wrapper.appendChild(selectSection);
  wrapper.appendChild(evalSection);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 2: AIRWAY & NALOXONE STANDARDS
// ----------------------------------------------------------------------------

function renderAirwayTab(isEs) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const introCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? AIRWAY_RESUSCITATION_STANDARDS.titleEs : AIRWAY_RESUSCITATION_STANDARDS.titleEn),
    h('p', { class: 'intro-lead' }, isEs ? AIRWAY_RESUSCITATION_STANDARDS.summaryEs : AIRWAY_RESUSCITATION_STANDARDS.summaryEn),
    h('div', { class: 'callout callout-warning' }, [
      h('strong', {}, isEs ? 'La Regla de Oro en Polisustancias:' : 'The Golden Rule in Polysubstance Overdose:'),
      h('p', {}, isEs
        ? 'Si la persona respira adecuadamente (> 10-12 respiraciones por minuto) pero permanece inconsciente debido a benzodiacepinas, alcohol o xilacina, NO continúe administrando dosis excesivas de naloxona. La sobre-naloxonización provoca síndrome de abstinencia precipitado violento, vómitos con riesgo de asfixia y edema pulmonar.'
        : 'If the person has spontaneous adequate breathing (> 10-12 breaths per minute) but remains unresponsive due to benzos, alcohol, or xylazine, DO NOT keep pumping excessive naloxone. Over-naloxonating triggers violent precipitated withdrawal, projectile vomiting with aspiration risk, and flash pulmonary edema.')
    ])
  ]);

  const stepsList = h('div', { class: 'protocol-steps' });
  AIRWAY_RESUSCITATION_STANDARDS.steps.forEach(st => {
    const stepCard = h('div', { class: 'step-card' }, [
      h('div', { class: 'step-badge' }, String(st.step)),
      h('div', { class: 'step-body' }, [
        h('h4', {}, isEs ? st.titleEs : st.titleEn),
        h('p', {}, isEs ? st.actionEs : st.actionEn)
      ])
    ]);
    stepsList.appendChild(stepCard);
  });
  introCard.appendChild(stepsList);

  wrapper.appendChild(introCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 3: SEROTONIN TOXICITY (HUNTER CRITERIA)
// ----------------------------------------------------------------------------

function renderSerotoninTab(isEs) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const card = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? HUNTER_SEROTONIN_CRITERIA.titleEs : HUNTER_SEROTONIN_CRITERIA.titleEn),
    h('p', {}, isEs ? HUNTER_SEROTONIN_CRITERIA.descriptionEs : HUNTER_SEROTONIN_CRITERIA.descriptionEn),
    h('div', { class: 'callout callout-emergency' }, [
      h('strong', {}, isEs ? '¡Alerta de Fiebre Hipertérmica!' : 'Hyperthermic Fever Red Alert!'),
      h('p', {}, isEs
        ? 'La fiebre inducida por serotonina proviene de rigidez muscular involuntaria continua (no del centro hipotalámico). Los antipiréticos estándar (acetaminofén, ibuprofeno) son ineficaces. Se requiere enfriamiento físico urgente (hielo, nebulización, ventilación) y atención médica inmediata en urgencias.'
        : 'Serotonin-induced fever is driven by involuntary muscle rigidity (not hypothalamic set-point). Standard antipyretics (acetaminophen, ibuprofen) are completely ineffective. Urgent physical cooling (ice packs, misting, fanning) and immediate emergency room medical care are required.')
    ])
  ]);

  const rulesList = h('div', { class: 'hunter-rules-list' });
  HUNTER_SEROTONIN_CRITERIA.rules.forEach((r, idx) => {
    const item = h('div', { class: 'hunter-rule-card' }, [
      h('div', { class: 'rule-index' }, `Regla ${idx + 1}`),
      h('div', { class: 'rule-body' }, [
        h('strong', {}, isEs ? r.ruleEn : r.ruleEs),
        h('p', { class: 'diagnostic-weight' }, isEs ? r.diagnosticWeightEs : r.diagnosticWeightEn)
      ])
    ]);
    rulesList.appendChild(item);
  });
  card.appendChild(rulesList);

  wrapper.appendChild(card);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 4: SAFETY PLAN & EXPORT
// ----------------------------------------------------------------------------

function renderSafetyPlanTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const planCard = h('section', { class: 'card', 'aria-labelledby': 'safety-plan-heading' }, [
    h('h3', { id: 'safety-plan-heading' }, isEs ? 'Plan Interactivo de Reducción de Daños en Polisustancias' : 'Interactive Polysubstance Harm Reduction Plan'),
    h('p', {}, isEs 
      ? 'Personalice su plan de seguridad antes de consumir. Todo se mantiene en la memoria RAM de su dispositivo y se borra al cerrar o presionar Salida Rápida.'
      : 'Customize your personal safety checklist before using. All data remains in ephemeral device RAM and clears on page close or Quick Exit.')
  ]);

  const checklist = h('div', { class: 'checklist-group' }, [
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.staggerPlanChecked,
        onchange: (e) => {
          setPolysubstanceState({ staggerPlanChecked: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Escalonar dosis: No consumiré múltiples sustancias nuevas al mismo tiempo' : 'Stagger doses: I will wait for peak onset before taking another substance')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.testStripsChecked,
        onchange: (e) => {
          setPolysubstanceState({ testStripsChecked: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Tiras reactivas: Probaré suministros con FTS y XTS antes de consumir' : 'Test strips: I will check unregulated supplies for fentanyl and xylazine')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.spotterChecked,
        onchange: (e) => {
          setPolysubstanceState({ spotterChecked: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Acompañante de seguridad: Alguien sabe que estoy consumiendo o usaré Never Use Alone (877-696-1997)' : 'Safety spotter: Someone knows I am using or I will connect with Never Use Alone (877-696-1997)')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.naloxoneChecked,
        onchange: (e) => {
          setPolysubstanceState({ naloxoneChecked: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Naloxona y respiración: Tengo naloxona visible y mi acompañante conoce el rescate respiratorio' : 'Naloxone & rescue breathing: Naloxone is accessible and companion knows rescue breathing')
    ])
  ]);
  planCard.appendChild(checklist);

  // Plain Text Export Box
  const exportSection = h('section', { class: 'card export-section' }, [
    h('h3', {}, isEs ? 'Copia y Exportación de Resumen Seguro (Sin PII)' : 'Secure Summary Export (Zero PII)'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Genere y copie un resumen en texto plano para compartir de forma segura con su médico, par o acompañante.'
      : 'Generate and copy a privacy-safe text summary to share with your clinician, peer specialist, or companion.')
  ]);

  const summaryText = formatPolysubstanceSummaryText(localState, isEs ? 'es' : 'en');
  const textArea = h('textarea', {
    class: 'summary-textarea',
    readonly: 'readonly',
    rows: 14,
    'aria-label': isEs ? 'Resumen de Polisustancias' : 'Polysubstance Summary'
  }, summaryText);

  const copyStatus = h('span', { class: 'copy-status', 'aria-live': 'polite' }, '');
  const copyBtn = h('button', {
    class: 'btn btn-primary',
    onclick: async () => {
      try {
        await navigator.clipboard.writeText(summaryText);
        copyStatus.textContent = isEs ? ' ¡Copiado con éxito!' : ' Copied successfully!';
        setTimeout(() => { copyStatus.textContent = ''; }, 3000);
      } catch (_e) {
        copyStatus.textContent = isEs ? ' Error al copiar' : ' Copy failed';
      }
    }
  }, [
    icon('copy'),
    h('span', {}, isEs ? 'Copiar Resumen Seguro' : 'Copy Safe Summary')
  ]);

  const resetBtn = h('button', {
    class: 'btn btn-secondary',
    onclick: () => {
      resetPolysubstanceState();
      reRender();
    }
  }, [
    icon('refresh-cw'),
    h('span', {}, isEs ? 'Restablecer Estado' : 'Reset State')
  ]);

  const btnRow = h('div', { class: 'btn-row' }, [copyBtn, resetBtn, copyStatus]);
  exportSection.appendChild(textArea);
  exportSection.appendChild(btnRow);

  wrapper.appendChild(planCard);
  const triageCard = h('div', { class: 'card mt-3' }, [
    h('h3', {}, isEs ? '¿Evaluación de Emergencia Diferencial y Criterios de Hunter?' : 'Acute Differential Triage & Hunter Clonus Criteria?'),
    h('p', {}, isEs
      ? 'Para triaje rápido entre sedación por xilacina/opioides, toxicidad serotoninérgica con clono, hipertermia por estimulantes o sepsis, utilice el Asistente de Triage Toxicológico con desescalada verbal BETA y notas SBAR. '
      : 'For bedside differential diagnosis across xylazine sedation, serotonin toxicity with clonus, stimulant hyperthermia, or sepsis, access the Acute Toxicology Triage Assistant with Project BETA de-escalation and SBAR handoffs. '),
    h('a', { href: '#/toxicology-triage' }, isEs
      ? 'Abrir Triage Toxicológico Agudo y Desescalada BETA →'
      : 'Open Acute Toxicology Triage & Project BETA De-Escalation →')
  ]);
  wrapper.appendChild(triageCard);

  const novelCard = h('div', { class: 'card mt-3' }, [
    h('h3', {}, isEs ? '¿Uso de ZaZa Silver, Tianeptina o Mezclas de Tienda de Conveniencia?' : 'ZaZa Silver, Tianeptine or Gas Station Co-Ingestions?'),
    h('p', {}, isEs
      ? 'Productos como ZaZa Silver combinan tianeptina (opioide mu) con fenibut (agonista GABA-B). Su cese brusco desencadena abstinencia dual simultánea con riesgo de delirio y convulsiones. '
      : 'Products like ZaZa Silver co-formulate tianeptine (opioid) with phenibut (GABA-B agonist). Sudden cessation causes simultaneous opioid withdrawal and life-threatening GABAergic delirium/seizures. '),
    h('a', { href: '#/novel-substances' }, isEs
      ? 'Abrir Navegador de Sustancias Novedosas y Protocolos de Desintoxicación →'
      : 'Open Novel Substances & Clinical Detox Navigator →')
  ]);
  wrapper.appendChild(novelCard);

  const gabapentinoidCard = h('div', { class: 'card mt-3' }, [
    h('h3', {}, isEs ? '¿Coprescripción de Gabapentina o Pregabalina (Lyrica) con Opioides?' : 'Gabapentin or Pregabalin (Lyrica) Opioid Co-Prescription?'),
    h('p', {}, isEs
      ? 'La FDA advierte de dificultades respiratorias graves cuando se combinan gabapentinoides con opioides o depresores del SNC. Los gabapentinoides anulan la compensación ventilatoria hipercapnica y están presentes en el 20% a 30% de las muertes por sobredosis. '
      : 'The FDA warns of serious breathing difficulties when gabapentinoids are combined with opioids or CNS depressants. Gabapentinoids blunt hypercapnic ventilatory compensation and are involved in 20% to 30% of fatal opioid overdoses. '),
    h('a', { href: '#/gabapentinoid-care' }, isEs
      ? 'Abrir Navegador de Seguridad de Gabapentinoides y Desescalada Hiperbólica →'
      : 'Open Gabapentinoid Safety & Hyperbolic Deprescribing Navigator →')
  ]);
  wrapper.appendChild(gabapentinoidCard);

  const ghbCard = h('div', { class: 'card mt-3' }, [
    h('h3', {}, isEs ? '¿Consumo de GHB, GBL o 1,4-BDO con Alcohol u Otros Depresores?' : 'GHB, GBL or 1,4-BDO Co-Ingestion with Alcohol or Sedatives?'),
    h('p', {}, isEs
      ? 'La combinación de GHB con alcohol provoca paro respiratorio sinérgico inmediato mediado por GABA-B y pérdida de reflejos protectores de la vía aérea. Con 1,4-BDO, el alcohol bloquea la enzima ADH provocando un coma retrasado masivo horas después. '
      : 'Combining GHB with alcohol produces immediate synergistic GABA-B respiratory arrest and abolishes airway protective reflexes. With 1,4-BDO, alcohol halts ADH metabolism, triggering delayed catastrophic comas hours later. '),
    h('a', { href: '#/ghb-care' }, isEs
      ? 'Abrir Navegador de GHB/GBL, Triaje de Coma y Abstinencia →'
      : 'Open GHB, GBL & 1,4-BDO Harm Reduction, Coma Triage & Withdrawal Navigator →')
  ]);
  wrapper.appendChild(ghbCard);
  wrapper.appendChild(exportSection);
  return wrapper;
}
