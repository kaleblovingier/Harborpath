// public/js/views/psychedelicCare.js
// HarborPath - Psychedelic Harm Reduction, 5-HT2A Pharmacology, Crisis De-Escalation & HPPD Navigator
// Clinical consensus: Fireside Project Peer Support Standards & Zendo Project Harm Reduction Protocols,
// American College of Medical Toxicology (ACMT) Guidance on Psychedelic Overdose & NBOMe Adulterants,
// DSM-5 Diagnostic Criteria & Neuro-Ophthalmology Guidelines for Hallucinogen Persisting Perception Disorder (HPPD),
// Critical Pharmacology Contraindications: Lithium Status Epilepticus Hazard & MAOI Serotonin Syndrome.
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon, copyText } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: PSYCHEDELIC PHARMACOLOGY & SUBSTANCE PROFILES
// ============================================================================

export const PSYCHEDELIC_COMPOUND_PROFILES = Object.freeze({
  psilocybin: Object.freeze({
    id: 'psilocybin',
    name: 'Psilocybin & Psilocin (Magic Mushrooms)',
    classEn: 'Classical Tryptamine (Indolealkylamine)',
    classEs: 'Triptamina Clásica (Indolalquilamina)',
    durationEn: '4 to 6 hours (Onset: 20-40 min, Peak: 2-3 hours)',
    durationEs: '4 a 6 horas (Inicio: 20-40 min, Pico: 2-3 horas)',
    pharmacologyEn: 'Psilocybin is a prodrug rapidly dephosphorylated in vivo to psilocin, a potent partial agonist at serotonin 5-HT2A, 5-HT2C, and 5-HT1A receptors. Temporarily disintegrates the default mode network (DMN), producing ego dissolution, synesthesia, and emotional breakthroughs.',
    pharmacologyEs: 'La psilocibina se desfosforila rápidamente a psilocina, agonista parcial potente de receptores 5-HT2A, 5-HT2C y 5-HT1A. Desintegra temporalmente la red neuronal por defecto (DMN), produciendo disolución del ego y sinestesia.',
    physiologicalEffectsEn: 'Mild mydriasis, transient blood pressure elevation, mild tachycardia, initial nausea or stomach discomfort (chitin cellular walls). Non-toxic to organ systems at standard doses; zero physical dependence.',
    physiologicalEffectsEs: 'Midriasis leve, aumento transitorio de presión arterial, taquicardia leve y náuseas iniciales. Nula toxicidad orgánica a dosis estándar; sin dependencia física.',
    crisisVulnerabilityEn: 'Acute panic, sensory overwhelm, paranoia, fear of permanent insanity, unmanageable resurfacing of repressed trauma.',
    crisisVulnerabilityEs: 'Pánico agudo, sobrecarga sensorial, paranoia, miedo a perder la razón o reaparición abrumadora de traumas reprimidos.',
  }),
  lsd: Object.freeze({
    id: 'lsd',
    name: 'LSD (Lysergic Acid Diethylamide, Acid)',
    classEn: 'Ergoline / Lysergamide',
    classEs: 'Ergolina / Lisergamida',
    durationEn: '8 to 14 hours (Onset: 30-60 min, Peak: 3-5 hours, Long comedown: 6-12 hours)',
    durationEs: '8 a 14 horas (Inicio: 30-60 min, Pico: 3-5 horas, Bajada prolongada: 6-12 horas)',
    pharmacologyEn: 'High-affinity agonist at 5-HT2A, 5-HT2C, and 5-HT1A receptors with cross-affinity for dopamine (D2) and alpha-adrenergic receptors. Extremely potent by weight: active at 25 to 100+ micrograms (mcg). The receptor-ligand complex features a molecular "lid" that traps LSD inside the 5-HT2A binding pocket, explaining its protracted 12-hour duration.',
    pharmacologyEs: 'Agonista de alta afinidad en 5-HT2A, 5-HT2C y 5-HT1A con afinidad cruzada dopaminérgica (D2) y adrenérgica. Activo a dosis microscópicas (25 a 100+ mcg). El receptor atrapa la molécula con una «tapa» estructural, explicando sus 12 horas de duración.',
    physiologicalEffectsEn: 'Pupillary dilation (mydriasis), moderate sympathomimetic activation (mild hyperthermia, sweating, piloerection), insomnia, jaw clenching, appetite suppression.',
    physiologicalEffectsEs: 'Dilatación pupilar, activación simpaticomimética moderada (ligera hipertermia, sudoración), insomnio, bruxismo y falta de apetito.',
    crisisVulnerabilityEn: 'Thought loops (repetitive obsessive ruminations), temporal disorientation ("time has stopped"), feeling trapped due to the long 12-hour duration, terrifying auditory/visual distortions.',
    crisisVulnerabilityEs: 'Bucles de pensamiento obsesivos, desorientación temporal («el tiempo se ha detenido»), claustrofobia existencial por la larga duración y distorsiones aterradoras.',
  }),
  dmt: Object.freeze({
    id: 'dmt',
    name: 'DMT (N,N-Dimethyltryptamine) & 5-MeO-DMT',
    classEn: 'Short-Acting Endogenous Tryptamines',
    classEs: 'Triptaminas Endógenas de Acción Ultracorta',
    durationEn: 'Vaporized DMT: 15 to 30 minutes; Oral Ayahuasca (with MAOI): 4 to 8 hours; 5-MeO-DMT: 20 to 45 minutes.',
    durationEs: 'DMT vaporizado: 15 a 30 minutos; Ayahuasca oral (con IMAO): 4 a 8 horas; 5-MeO-DMT: 20 a 45 minutos.',
    pharmacologyEn: 'N,N-DMT is a full 5-HT2A agonist producing rapid immersion into complex visual alternate realities. 5-MeO-DMT is predominantly a 5-HT1A and 5-HT2A agonist with profound non-visual ego death, somatic paralysis, and potential respiratory depression risk at high doses.',
    pharmacologyEs: 'N,N-DMT es un agonista 5-HT2A completo que produce inmersión visual instantánea. 5-MeO-DMT actúa sobre 5-HT1A y 5-HT2A con disolución radical del ego, parálisis somática y riesgo de depresión respiratoria a dosis altas.',
    physiologicalEffectsEn: 'Substantial surge in heart rate and systolic BP, ataxia, loss of motor control, vomiting/purging (Ayahuasca). In 5-MeO-DMT: motor agitation, throat tightness, or transient apnea requiring physical sitter supervision.',
    physiologicalEffectsEs: 'Aumento marcado de frecuencia cardíaca y presión arterial, ataxia, vómito o purga (Ayahuasca). En 5-MeO-DMT: espasmos motores o apnea transitoria que exige un cuidador físico.',
    crisisVulnerabilityEn: 'Overwhelming speed of onset ("blasted out of reality"), intense fear of dying or cardiac arrest during rush, disorientation upon return.',
    crisisVulnerabilityEs: 'Velocidad de inicio abrumadora, terror a estar sufriendo un paro cardíaco durante la subida y desorientación profunda al regresar.',
  }),
  mescaline2cb: Object.freeze({
    id: 'mescaline_2cb',
    name: 'Mescaline (Peyote, San Pedro) & 2C-B',
    classEn: 'Psychedelic Phenethylamines',
    classEs: 'Fenetilaminas Psicodélicas',
    durationEn: 'Mescaline: 10 to 14 hours; 2C-B: 4 to 8 hours.',
    durationEs: 'Mescalina: 10 a 14 horas; 2C-B: 4 a 8 horas.',
    pharmacologyEn: 'Phenethylamine structure closely related to dopamine and norepinephrine. Agonist at 5-HT2A and 5-HT2C receptors with enhanced entactogenic, tactile, and visual enhancement properties.',
    pharmacologyEs: 'Estructura fenetilamínica emparentada con dopamina y noradrenalina. Agonista 5-HT2A y 5-HT2C con marcadas propiedades táctiles, entactógenas y visuales.',
    physiologicalEffectsEn: 'Initial gastrointestinal distress / nausea ("the purge" with cactus), sympathetic stimulation (tachycardia, diaphoresis, muscle tension, tremors).',
    physiologicalEffectsEs: 'Molestias digestivas o vómito inicial («la purga» con cactus), estimulación simpática (taquicardia, sudoración, tensión muscular).',
    crisisVulnerabilityEn: 'Somatic anxiety triggered by rapid heart rate or nausea, overstimulation at high doses (2C-B has a notoriously steep dose-response curve where 25 mg is vastly stronger than 18 mg).',
    crisisVulnerabilityEs: 'Ansiedad somática por taquicardia o náuseas; sobreestimulación por curva de dosis muy empinada (en 2C-B, 25 mg es mucho más potente que 18 mg).',
  }),
  nbomeAdulterant: Object.freeze({
    id: 'nbome',
    name: '25I-NBOMe & Toxic Research Chemical Mimics ("Bitter Acid")',
    classEn: 'Synthetic Highly Potent 5-HT2A Full Agonist (Substituted Phenethylamine)',
    classEs: 'Agonista Completo Sintético 5-HT2A de Alta Potencia',
    durationEn: '6 to 10 hours with prolonged toxic residual state.',
    durationEs: '6 a 10 horas con toxicidad residual prolongada.',
    pharmacologyEn: 'Extremely potent synthetic derivatives designed as receptor radioligands. Unlike LSD, NBOMes are powerful FULL agonists with lethal microgram-range toxicity. Frequently sold illicitly on blotter paper disguised as LSD.',
    pharmacologyEs: 'Derivados sintéticos extremadamente potentes. A diferencia del LSD, los NBOMes son agonistas COMPLETOS con toxicidad mortal en rango de microgramos. Vendidos falsamente como LSD en papel secante.',
    physiologicalEffectsEn: 'SEVERE PERIPHERAL VASOCONSTRICTION (cyanosis, limb numbness, necrosis), hyperthermia, malignant hypertension, metabolic acidosis, rhabdomyolysis, renal failure, and FATAL SEIZURES.',
    physiologicalEffectsEs: 'VASOCONSTRICCIÓN PERIFÉRICA GRAVE (cianosis, entumecimiento de extremidades), hipertermia, hipertensión maligna, rabdomiólisis, fallo renal y CONVULSIONES MORTALES.',
    crisisVulnerabilityEn: 'MEDICAL TOXICOLOGY EMERGENCY: Severe agitated delirium, seizures, hyperpyrexia, and cardiac arrest. Blotter has an intense, numbing, bitter chemical metallic taste ("IF IT’S BITTER, IT’S A SPITTER"). Tests negative on Ehrlich reagent.',
    crisisVulnerabilityEs: 'EMERGENCIA TOXICOLÓGICA: Delirio agitado, convulsiones, hipertermia y paro cardíaco. Sabor amargo metálico muy intenso que adormece la lengua («SI ES AMARGO, ESCÚPELO»). Negativo en reactivo de Ehrlich.',
  }),
});

// ============================================================================
// DANGEROUS PHARMACOLOGICAL INTERACTIONS & CONTRAINDICATIONS
// ============================================================================

export const PSYCHEDELIC_INTERACTIONS = Object.freeze([
  {
    drugClass: 'Lithium (Eskalith, Lithobid)',
    severity: 'fatal_contraindication',
    titleEn: 'LITHIUM + CLASSICAL PSYCHEDELICS: FATAL SEIZURE & STATUS EPILEPTICUS RISK',
    titleEs: 'LITIO + PSICODÉLICOS CLÁSICOS: RIESGO MORTAL DE CONVULSIONES Y ESTATUS EPILÉPTICO',
    mechanismEn: 'CRITICAL CONTRAINDICATION: Co-ingestion of lithium with LSD, psilocybin, or other 5-HT2A agonists produces catastrophic neurotoxicity. Case literature documents near-100% incidence of profound grand mal seizures, non-convulsive status epilepticus, severe fugue states, coma, and sudden cardiac arrest.',
    mechanismEs: 'CONTRAINDICACIÓN CRÍTICA: La combinación de litio con LSD o psilocibina causa neurotoxicidad catastrófica con riesgo extremo de convulsiones tónico-clónicas, estatus epiléptico, fuga disociativa, coma y muerte.',
    actionEn: 'Strictly contra-indicated. Never consume classical psychedelics while taking prescribed lithium. Lithium must not be discontinued abruptly without psychiatric consultation.',
    actionEs: 'Estrictamente contraindicado. Nunca consuma psicodélicos si toma litio. No suspenda el litio de golpe sin supervisión psiquiátrica.',
  },
  {
    drugClass: 'MAOIs (Banisteriopsis Caapi in Ayahuasca, Phenelzine, Tranylcypromine, Selegiline)',
    severity: 'fatal_contraindication',
    titleEn: 'MAOI + SSRIs / SNRIs / MDMA / STIMULANTS / TRAMADOL / DXM: FATAL SEROTONIN TOXICITY',
    titleEs: 'IMAO + ISRS / ESTIMULANTES / TRAMADOL / DXM: TOXICIDAD SEROTONINÉRGICA MORTAL',
    mechanismEn: 'Monoamine oxidase inhibitors prevent the catabolism of serotonin, dopamine, and norepinephrine. Combining an MAOI (including herbal harmala alkaloids in Ayahuasca) with serotonin reuptake inhibitors, MDMA, amphetamines, tramadol, or dextromethorphan causes catastrophic hyperpyrexic Serotonin Syndrome and fatal hypertensive crisis.',
    mechanismEs: 'Los IMAO impiden la degradación de serotonina y catecolaminas. Mezclar un IMAO (incluida la Ayahuasca) con ISRS, MDMA, estimulantes, tramadol o dextrometorfano causa Síndrome Serotoninérgico mortal y crisis hipertensiva.',
    actionEn: 'Requires 2 to 5 week washout period (especially 5 weeks for fluoxetine) before any MAOI ingestion. Immediate emergency hospital transfer if co-ingested.',
    actionEs: 'Requiere ventana de lavado de 2 a 5 semanas (5 semanas para fluoxetina). Traslado urgente al hospital en caso de ingestión conjunta.',
  },
  {
    drugClass: 'SSRIs & SNRIs (Sertraline, Fluoxetine, Escitalopram, Duloxetine, Venlafaxine)',
    severity: 'efficacy_blunting',
    titleEn: 'SSRIs/SNRIs + Psilocybin/LSD: 5-HT2A Downregulation & Blunted Response',
    titleEs: 'ISRS/ISRSN + Psilocibina/LSD: Desensibilización 5-HT2A y Respuesta Atenuada',
    mechanismEn: 'Chronic SSRI/SNRI therapy causes compensatory downregulation and desensitization of cortical 5-HT2A receptors. Patients typically experience significantly blunted or absent subjective visual/mystical effects. DANGER: Patients frequently ingest massive dangerous megadoses attempting to overcome this blockage, causing acute autonomic instability or serotonin toxicity.',
    mechanismEs: 'El tratamiento crónico con antidepresivos desensibiliza los receptores 5-HT2A, atenuando los efectos visuales. PELIGRO: Los usuarios a menudo toman megadosis masivas intentando sentir los efectos, arriesgando toxicidad autonómica.',
    actionEn: 'Do NOT double or escalate doses. Do NOT stop antidepressants cold turkey (precipitates severe antidepressant discontinuation syndrome).',
    actionEs: 'NO aumente la dosis ni suspenda el antidepresivo de golpe (causa síndrome de discontinuación severo).',
  },
  {
    drugClass: 'Tramadol & Bupropion (Wellbutrin)',
    severity: 'high_risk',
    titleEn: 'Tramadol / Bupropion + Psychedelics: Massive Seizure Threshold Reduction',
    titleEs: 'Tramadol / Bupropión + Psicodélicos: Descenso Marcado del Umbral Convulsivo',
    mechanismEn: 'Both tramadol and bupropion significantly lower seizure thresholds and inhibit monoamine reuptake. Combining with pro-convulsant or sympathomimetic psychedelics (LSD, 2C-B, synthetic tryptamines) triggers provoked unprovoked grand mal seizures.',
    mechanismEs: 'Tanto el tramadol como el bupropión disminuyen el umbral de convulsiones. Su combinación con psicodélicos simpaticomiméticos desencadena crisis convulsivas.',
    actionEn: 'Avoid co-administration. Monitor for twitching, hyperreflexia, or sudden confusion.',
    actionEs: 'Evite la administración conjunta. Vigilar sacudidas, hiperreflexia o confusión.',
  },
]);

// ============================================================================
// FIRESIDE & ZENDO PEER CRISIS DE-ESCALATION PROTOCOLS
// ============================================================================

export const CRISIS_DE_ESCALATION_PILLARS = Object.freeze([
  {
    pillarNum: 1,
    titleEn: 'Create a Safe, Quiet Space',
    titleEs: 'Crear un Espacio Seguro y Tranquilo',
    instructionEn: 'Move the person away from loud music, flashing lights, crowds, cameras, and aggressive authority figures. Provide a quiet, warm room with dim lighting, comfortable seating, and a blanket. Temperature control is essential.',
    instructionEs: 'Aleje a la persona del ruido, luces estroboscópicas, multitudes y personal de seguridad. Llévela a un lugar tranquilo con luz tenue, agua y una manta caliente.',
  },
  {
    pillarNum: 2,
    titleEn: 'Sitting, Not Guiding (Be an Anchor)',
    titleEs: 'Acompañar sin Dirigir (Ser un Ancla)',
    instructionEn: 'Be a calm, grounded, compassionate presence. Do not analyze, psychoanalyze, or direct their journey. You do not need to "fix" their state; your physical presence, slow rhythmic breathing, and eye-level posture remind them they are safe.',
    instructionEs: 'Sea una presencia calmada y compasiva. No intente psicoanalizar ni dirigir su viaje. No tiene que «arreglar» su estado; su presencia física tranquila le recuerda que está a salvo.',
  },
  {
    pillarNum: 3,
    titleEn: 'Talk Through, Not Down (Validate Reality)',
    titleEs: 'Dialogar sin Desautorizar (Validar su Experiencia)',
    instructionEn: 'Do not invalidate or argue with their perceptions (e.g. do not say "you are just crazy"). Reassure them that whatever terrifying thoughts or visions they are experiencing are drug-induced, temporary, and WILL completely wear off as their liver and brain clear the compound.',
    instructionEs: 'No discuta ni descarte lo que siente (no diga «son tonterías»). Recuérdele con ternura que lo que experimenta es temporal, producido por la sustancia, y pasará por completo.',
  },
  {
    pillarNum: 4,
    titleEn: 'Difficult is Not Necessarily Bad (Cathartic Reframe)',
    titleEs: 'Lo Difícil no es Necesariamente Malo (Reencuadre Catártico)',
    instructionEn: 'Challenging emotions, grief, or shadow material often carry profound therapeutic value once surrendered to. Guide them to breathe into the fear rather than resisting it: "Turn towards it, ask it what it wants to teach you, and let your breath carry you through."',
    instructionEs: 'Las emociones difíciles o el miedo a menudo liberan cargas reprimidas. Guíelo a respirar hondo sin luchar contra la experiencia: «No huyas del miedo, respira y déjate llevar».',
  },
]);

export const GROUNDING_EXERCISES = Object.freeze({
  sensory54321En: [
    '5 things you can see (the blanket, the floor texture, my hands, a lamp, the wall).',
    '4 things you can physically touch (the soft blanket, the ground under your feet, your jacket, cool water).',
    '3 things you can hear (my voice, the quiet room, your breath).',
    '2 things you can smell (fresh air, a sip of tea).',
    '1 deep breath tasting the cool water on your tongue.',
  ],
  sensory54321Es: [
    '5 cosas que puedes ver (la manta, la textura del suelo, mis manos, la lámpara, la pared).',
    '4 cosas que puedes tocar (la tela suave, el suelo bajo tus pies, tu ropa, agua fresca).',
    '3 cosas que puedes escuchar (mi voz tranquila, el silencio de la habitación, tu respiración).',
    '2 cosas que puedes oler (aire fresco, una infusión).',
    '1 respiración profunda sintiendo el agua fresca en tu boca.',
  ],
});

// ============================================================================
// HPPD DIAGNOSTIC & CLINICAL REASSURANCE FRAMEWORK
// ============================================================================

export const HPPD_CLINICAL_STANDARDS = Object.freeze({
  definitionEn: 'Hallucinogen Persisting Perception Disorder (HPPD) is a diagnostic condition (DSM-5 292.89) characterized by the persistent or episodic recurrence of sensory perceptual alterations following cessation of hallucinogen use that causes clinically significant distress.',
  definitionEs: 'El Trastorno Perceptivo Persistente por Alucinógenos (HPPD) es una condición diagnóstica (DSM-5 292.89) caracterizada por alteraciones visuales continuas o episódicas tras el cese del consumo.',
  subtypesEn: Object.freeze({
    type1: 'HPPD Type 1 (Flashbacks): Brief, transient, benign visual episodes or emotional echoes that mimic past trips. Usually self-limiting, non-distressing, and resolves without pharmacotherapy.',
    type2: 'HPPD Type 2 (Persistent Visual Snow): Continuous, pervasive, distressing visual distortions lasting months to years: static visual snow, palinopsia (afterimages/trailing), halos around objects, aeropsia, and macropsia/micropsia. Highly comorbid with chronic anxiety, panic, and depersonalization/derealization (DPDR).',
  }),
  subtypesEs: Object.freeze({
    type1: 'HPPD Tipo 1 (Flashbacks): Episodios breves y benignos que imitan viajes pasados. No causan angustia y remiten espontáneamente sin medicación.',
    type2: 'HPPD Tipo 2 (Nieve Visual Persistente): Alteraciones visuales continuas y angustiantes: nieve visual (estática tipo TV), palinopsia (estelas), halos lumínicos y micro/macropsia. Fuertemente ligado a ansiedad y despersonalización.',
  }),
  cardinalReassurancesEn: Object.freeze([
    'HPPD IS NOT PROGRESSIVE PSYCHOSIS OR SCHIZOPHRENIA: Patients retain complete reality testing and understand the visual phenomena are optical illusions.',
    'HPPD IS NOT BRAIN DAMAGE: Structural MRI and CT scans are completely normal. It is an ocular-cortical sensory gating disinhibition (thalamocortical dysrhythmia).',
    'STRICT CESSATION OF TRIGGERS: Cannabis, stimulants (ADHD meds, cocaine, caffeine), and alcohol are the primary drivers of visual snow flare-ups. Absolute cessation of cannabis is the #1 intervention.',
    'FIRST-LINE CLINICAL PHARMACOTHERAPY: Lamotrigine (mood stabilizer, VGSC blocker) and low-dose clonazepam under psychiatric care; CBT for anxiety and hyper-focus.',
  ]),
  cardinalReassurancesEs: Object.freeze([
    'EL HPPD NO ES PSICOSIS NI ESQUIZOFRENIA: La persona mantiene el juicio de realidad intacto y sabe que las alteraciones son ópticas.',
    'EL HPPD NO ES DAÑO CEREBRAL: Las resonancias magnéticas son normales. Se debe a una desinhibición en el filtrado talámico de estímulos visuales.',
    'CESE ESTRICTO DE DESENCADENANTES: El cannabis es el principal desencadenante que empeora la nieve visual. Dejar el cannabis es la medida más eficaz.',
    'TRATAMIENTO FARMACOLÓGICO: Lamotrigina y clonazepam a dosis bajas bajo control psiquiátrico; terapia cognitivo-conductual para la ansiedad.',
  ]),
});

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialPsychedelicState = () => ({
  activeTab: 'crisis', // 'crisis' | 'pharmacology' | 'interactions' | 'hppd' | 'substances'
  viewMode: 'community', // 'community' | 'clinical'
  selectedSubstance: 'psilocybin',
  hoursSinceIngestion: 'peak_2_to_4h', // 'rush_under_1h' | 'peak_2_to_4h' | 'plateau_4_to_8h' | 'extended_over_8h'
  isBitterNumbingTaste: false, // NBOMe suspicion
  hasExtremeHyperthermia: false, // T > 102 F / 39 C (Serotonin Syndrome / NBOMe alert)
  hasSpontaneousClonus: false, // Hunter criteria Serotonin Syndrome
  hasSeizuresOrUnresponsiveness: false, // Critical emergency
  takingLithium: false,
  takingSsriSnri: false,
  takingMaoi: false,
});

let currentPsychedelicState = initialPsychedelicState();
const stateSubscribers = new Set();

export function getPsychedelicState() {
  return { ...currentPsychedelicState };
}

export function setPsychedelicState(patch) {
  currentPsychedelicState = { ...currentPsychedelicState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentPsychedelicState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetPsychedelicState() {
  currentPsychedelicState = initialPsychedelicState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentPsychedelicState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribePsychedelicState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL & PEER EVALUATION ENGINE
// ============================================================================

export function evaluatePsychedelicCrisis(state) {
  const {
    isBitterNumbingTaste,
    hasExtremeHyperthermia,
    hasSpontaneousClonus,
    hasSeizuresOrUnresponsiveness,
    takingLithium,
    takingMaoi,
    takingSsriSnri,
    selectedSubstance,
  } = state;

  // 1. Extreme Medical Toxicology Emergency Tier
  if (hasSeizuresOrUnresponsiveness || (takingLithium && selectedSubstance !== 'none')) {
    return {
      urgencyTier: 'emergency_medical',
      tierTitleEn: 'CRITICAL MEDICAL EMERGENCY: Seizures, Lithium Neurotoxicity, or Coma',
      tierTitleEs: 'EMERGENCIA MÉDICA CRÍTICA: Convulsiones, Neurotoxicidad por Litio o Coma',
      isEmergency: true,
      actionEn: 'CALL 911 IMMEDIATELY. Combining lithium with psychedelics or developing grand mal seizures represents a life-threatening neurological emergency. Maintain airway, place in lateral recovery position, protect from physical trauma, and report suspected lithium/psychedelic status epilepticus to paramedics. Do NOT physically restrain.',
      actionEs: 'LLAME AL 911 DE INMEDIATO. La combinación de litio con psicodélicos o la presencia de convulsiones es una emergencia neurológica mortal. Coloque de lado (posición de recuperación), proteja la vía aérea y alerte a los paramédicos.',
      interventionEn: 'Emergency IV benzodiazepines (lorazepam 2-4 mg IV), airway protection, active cooling, continuous ECG/EEG monitoring.',
      interventionEs: 'Benzodiacepinas IV urgentes, protección de vía aérea, enfriamiento y monitorización continua.',
    };
  }

  // 2. Serotonin Syndrome or Toxic NBOMe Alert
  if (hasExtremeHyperthermia || hasSpontaneousClonus || (takingMaoi && takingSsriSnri) || isBitterNumbingTaste) {
    return {
      urgencyTier: 'emergency_toxicology',
      tierTitleEn: isBitterNumbingTaste
        ? 'TOXIC ADULTERANT ALERT: Suspected 25I-NBOMe / Bitter Blotter Ingestion'
        : 'CRITICAL TOXIDROME: Suspected Severe Serotonin Syndrome (Hunter Criteria Met)',
      tierTitleEs: isBitterNumbingTaste
        ? 'ALERTA DE ADULTERANTE TÓXICO: Sospecha de 25I-NBOMe / Secante Amargo'
        : 'TOXIDROME CRÍTICO: Sospecha de Síndrome Serotoninérgico Grave (Criterios de Hunter)',
      isEmergency: true,
      actionEn: isBitterNumbingTaste
        ? 'Blotter with an intense bitter, metallic, numbing chemical taste is NOT LSD—it is a toxic synthetic NBOMe or research chemical. High risk of severe vasoconstriction, hyperthermia, rhabdomyolysis, and fatal seizures. Immediate Emergency Department evaluation is required.'
        : 'Spontaneous clonus, rigid tremor, and fever (> 38.5 C / 101.3 F) indicate severe Serotonin Syndrome. Physical cooling, IV fluids, and hospital admission are immediately mandatory. Cyproheptadine (serotonin antagonist) may be indicated.',
      actionEs: isBitterNumbingTaste
        ? 'Un papel secante con sabor amargo metálico y adormecimiento NO es LSD; es 25I-NBOMe o un químico sintético tóxico con riesgo de vasoconstricción severa y convulsiones. Acuda de urgencia al hospital.'
        : 'El clono espontáneo, temblor rígido y fiebre alertan de Síndrome Serotoninérgico grave. Se requiere enfriamiento, hidratación IV y traslado urgente a urgencias.',
      interventionEn: 'Aggressive IV hydration, active cooling, sedation with benzodiazepines. Avoid physical restraints.',
      interventionEs: 'Hidratación IV intensiva, enfriamiento activo y benzodiacepinas. Evitar contención física.',
    };
  }

  // 3. Classical Psychological Distress / "Bad Trip" Tier (Peer Support Appropriate)
  return {
    urgencyTier: 'peer_deescalation',
    tierTitleEn: 'Acute Psychedelic Distress ("Challenging Trip" - Non-Medical Crisis)',
    tierTitleEs: 'Distrés Psicodélico Agudo («Viaje Difícil» - Crisis No Médica)',
    isEmergency: false,
    actionEn: 'Patient is experiencing acute psychological distress, sensory overload, ego dissolution anxiety, or thought loops from classical 5-HT2A activation. Vital signs are stable without hyperthermia or clonus. DO NOT CALL POLICE. Apply the 4 Pillars of Compassionate Peer Support: Move to a safe, quiet space; be a calm anchor; talk through, not down; and guide 5-4-3-2-1 grounding exercises. Contact 62-FIRESIDE (Call/Text 623-473-7433) for free peer support.',
    actionEs: 'La persona experimenta distrés psicológico, sobrecarga sensorial o bucles de pensamiento por activación 5-HT2A. Sus signos vitales son estables sin fiebre ni clono. NO LLAME A LA POLICÍA. Aplique los 4 Pilares de Soporte de Pares: Espacio tranquilo, presencia calmada, dialogar con ternura y respiración guiada.',
    interventionEn: 'Dim quiet space, warm blanket, water, verbal reassurance that the trip will wear off, 5-4-3-2-1 grounding. Oral lorazepam (0.5 to 1 mg) only if extreme panic persists despite 60 minutes of verbal de-escalation.',
    interventionEs: 'Espacio tenue, manta, agua, recordatorio de que los efectos pasarán y anclaje 5-4-3-2-1. Benzodiacepina oral a dosis baja solo si el pánico extremo persiste tras desescalada verbal.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF & CRISIS NOTE GENERATOR
// ============================================================================

export function buildPsychedelicSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();
  const sub = PSYCHEDELIC_COMPOUND_PROFILES[state.selectedSubstance] || PSYCHEDELIC_COMPOUND_PROFILES.psilocybin;

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: CRISIS PSICODÉLICA, FARMACOLOGÍA 5-HT2A Y DESESCALADA',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      `Presentación por crisis o distrés agudo secundario a: ${sub.name}.`,
      `Tiempo transcurrido desde la ingesta: ${state.hoursSinceIngestion}.`,
      `Nivel de urgencia evaluado: ${evaluation.tierTitleEs}.`,
      '',
      'B (ANTECEDENTES / FACTORES TOXICOLÓGICOS):',
      `- Sustancia referida: ${sub.name} (${sub.classEs}).`,
      `- Sabor amargo metálico o adormecimiento (Alerta 25I-NBOMe): ${state.isBitterNumbingTaste ? 'SÍ (ALTO RIESGO TOXICOLÓGICO)' : 'No'}.`,
      `- Tratamiento con Litio: ${state.takingLithium ? 'SÍ (RIESGO MORTAL DE CONVULSIONES)' : 'No'}.`,
      `- Tratamiento con Antidepresivos (ISRS/ISRSN): ${state.takingSsriSnri ? 'SÍ (Atenuación de respuesta 5-HT2A)' : 'No'}.`,
      `- Consumo de IMAO (Ayahuasca / Fármacos): ${state.takingMaoi ? 'SÍ (Riesgo de Síndrome Serotoninérgico)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Evaluación de riesgo: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA / TOXICOLÓGICA' : 'DISTRÉS PSICOLÓGICO AGUDO (DESESCALADA DE PARES)'}.`,
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y MANEJO EN CRISIS):',
      '1. Si es distrés psicológico puro: NO usar contenciones físicas ni neurolépticos (haloperidol); exacerban el trauma y bajan el umbral convulsivo.',
      '2. Trasladar a un espacio silencioso y con luz tenue; aplicar los 4 pilares de acompañamiento de pares (Fireside Project).',
      '3. Si hay sabor amargo o sospecha de 25I-NBOMe: Monitorizar ECG, temperatura y descartar rabdomiólisis.',
      '4. Recordar al paciente que los efectos son temporales y finalizarán por completo a medida que el cuerpo metabolice el compuesto.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'PSYCHEDELIC HARM REDUCTION, 5-HT2A CRISIS & PEER DE-ESCALATION SBAR NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    `Presentation for acute psychedelic distress or adverse reaction to: ${sub.name}.`,
    `Time elapsed since ingestion: ${state.hoursSinceIngestion}.`,
    `Clinical Urgency Tier: ${evaluation.tierTitleEn}.`,
    '',
    'B (BACKGROUND / TOXICOLOGICAL FACTORS):',
    `- Reported compound: ${sub.name} (${sub.classEn}).`,
    `- Bitter metallic numbing taste (NBOMe alert): ${state.isBitterNumbingTaste ? 'YES (HIGH CHEMICAL TOXICITY HAZARD)' : 'No'}.`,
    `- Prescribed Lithium therapy: ${state.takingLithium ? 'YES (FATAL SEIZURE / STATUS EPILEPTICUS RISK)' : 'No'}.`,
    `- Prescribed SSRI/SNRI therapy: ${state.takingSsriSnri ? 'YES (5-HT2A downregulation / blunting)' : 'No'}.`,
    `- MAOI therapy (Ayahuasca / Pharmaceuticals): ${state.takingMaoi ? 'YES (Serotonin Syndrome risk)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Safety Urgency: ${evaluation.isEmergency ? 'MEDICAL / TOXICOLOGY EMERGENCY' : 'ACUTE PSYCHOLOGICAL DISTRESS (PEER DE-ESCALATION APPROPRIATE)'}.`,
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & CRISIS MANAGEMENT PLAN):',
    '1. If purely psychological distress: AVOID physical restraints and neuroleptics (haloperidol); they exacerbate trauma and lower seizure thresholds.',
    '2. Move patient to a quiet, dim environment; apply the 4 Pillars of Compassionate Peer Support (Fireside Project model).',
    '3. If bitter blotter or suspected 25I-NBOMe: Obtain 12-lead ECG, monitor core temperature, and assess for peripheral vasoconstriction/rhabdomyolysis.',
    '4. Reassure the individual repeatedly that what they are experiencing is chemical, temporary, and WILL wear off completely.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function psychedelicCareView() {
  const container = h('div', { class: 'psychedelic-care-view' });

  function render() {
    clear(container);
    const state = getPsychedelicState();
    const evaluation = evaluatePsychedelicCrisis(state);

    // Header Banner
    const header = h('header', { class: 'pc-header' }, [
      h('div', { class: 'pc-header-badge' }, [
        icon('alert'),
        h('span', {}, t('pc.header.badge', 'Psychedelic Harm Reduction & Crisis Navigator')),
      ]),
      h('h1', { class: 'pc-header-title' }, t('pc.header.title', 'Psychedelic Care, 5-HT2A Crisis De-Escalation & HPPD')),
      h('p', { class: 'pc-header-desc' }, t('pc.header.desc', 'Evidence-based clinical decision support and peer harm reduction protocols aligned with the Fireside Project, Zendo Project, and ACMT: navigating classical psychedelic crises, dangerous medication interactions (Lithium seizure hazard), toxic NBOMe identification, and visual snow / HPPD.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'pc-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        type: 'button',
        class: `pc-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setPsychedelicState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('pc.mode.community', 'Peer & Community Mode (Calming Grounding, Bad Trip Help & 62-FIRESIDE)')),
      ]),
      h('button', {
        type: 'button',
        class: `pc-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setPsychedelicState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('pc.mode.clinical', 'Clinician & Emergency Provider Mode (Toxidromes, Lithium Seizures & SBAR)')),
      ]),
    ]);

    // Navigation Tabs
    const tabsList = h('div', { class: 'pc-tabs-nav', role: 'tablist', 'aria-label': 'Psychedelic Navigation Tabs' }, [
      h('button', {
        type: 'button',
        class: `pc-tab-btn ${state.activeTab === 'crisis' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'crisis' ? 'true' : 'false',
        onclick: () => setPsychedelicState({ activeTab: 'crisis' }),
      }, t('pc.tabs.crisis', 'Crisis Triage & Grounding')),
      h('button', {
        type: 'button',
        class: `pc-tab-btn ${state.activeTab === 'pharmacology' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'pharmacology' ? 'true' : 'false',
        onclick: () => setPsychedelicState({ activeTab: 'pharmacology' }),
      }, t('pc.tabs.pharmacology', 'Substance Science & Profiles')),
      h('button', {
        type: 'button',
        class: `pc-tab-btn ${state.activeTab === 'interactions' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'interactions' ? 'true' : 'false',
        onclick: () => setPsychedelicState({ activeTab: 'interactions' }),
      }, t('pc.tabs.interactions', 'Dangerous Drug Interactions')),
      h('button', {
        type: 'button',
        class: `pc-tab-btn ${state.activeTab === 'hppd' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'hppd' ? 'true' : 'false',
        onclick: () => setPsychedelicState({ activeTab: 'hppd' }),
      }, t('pc.tabs.hppd', 'HPPD & Visual Snow Guide')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'pharmacology':
        tabContent = renderPharmacologyTab();
        break;
      case 'interactions':
        tabContent = renderInteractionsTab();
        break;
      case 'hppd':
        tabContent = renderHppdTab();
        break;
      case 'crisis':
      default:
        tabContent = renderCrisisTab(state, evaluation);
        break;
    }

    container.appendChild(header);
    container.appendChild(modeSwitcher);
    container.appendChild(tabsList);
    container.appendChild(tabContent);
  }

  // --- SUB-RENDERERS ---

  function renderCrisisTab(state, evaluation) {
    const section = h('section', { class: 'pc-crisis-section', role: 'tabpanel' });

    // Hotline Quick Banner
    const hotlineBanner = h('div', { class: 'fireside-hotline-card' }, [
      icon('phone'),
      h('div', {}, [
        h('h3', {}, 'Free, Confidential Psychedelic Peer Support (Fireside Project)'),
        h('p', {}, 'Call or Text 62-FIRESIDE (623-473-7433) to speak with a trained, compassionate peer support specialist right now. Completely free, confidential, and available during and after psychedelic experiences.'),
      ]),
    ]);

    // Inputs Grid
    const inputsGrid = h('div', { class: 'pc-inputs-grid' }, [
      // 1. Substance Selector
      h('div', { class: 'input-card' }, [
        h('label', { for: 'pc-select-substance', class: 'input-label' }, t('pc.label.substance', '1. Primary Psychedelic Ingested')),
        h('select', {
          id: 'pc-select-substance',
          class: 'pc-select',
          onchange: (e) => setPsychedelicState({ selectedSubstance: e.target.value }),
        }, [
          h('option', { value: 'psilocybin', selected: state.selectedSubstance === 'psilocybin' }, t('pc.opt.psilocybin', 'Psilocybin (Mushrooms, Truffles)')),
          h('option', { value: 'lsd', selected: state.selectedSubstance === 'lsd' }, t('pc.opt.lsd', 'LSD (Acid, Blotter, Liquid)')),
          h('option', { value: 'dmt', selected: state.selectedSubstance === 'dmt' }, t('pc.opt.dmt', 'DMT / 5-MeO-DMT / Ayahuasca')),
          h('option', { value: 'mescaline_2cb', selected: state.selectedSubstance === 'mescaline_2cb' }, t('pc.opt.mescaline', 'Mescaline (San Pedro, Peyote) / 2C-B')),
          h('option', { value: 'nbome', selected: state.selectedSubstance === 'nbome' }, t('pc.opt.nbome', 'Suspected 25I-NBOMe / Bitter Chemical Tab')),
        ]),
      ]),

      // 2. Time Since Ingestion
      h('div', { class: 'input-card' }, [
        h('label', { for: 'pc-select-time', class: 'input-label' }, t('pc.label.time', '2. Time Since Ingestion')),
        h('select', {
          id: 'pc-select-time',
          class: 'pc-select',
          onchange: (e) => setPsychedelicState({ hoursSinceIngestion: e.target.value }),
        }, [
          h('option', { value: 'rush_under_1h', selected: state.hoursSinceIngestion === 'rush_under_1h' }, t('pc.opt.timeUnder1', '< 1 hour (Onset / intense rush)')),
          h('option', { value: 'peak_2_to_4h', selected: state.hoursSinceIngestion === 'peak_2_to_4h' }, t('pc.opt.time2to4', '2 to 4 hours (Peak experience / plateau)')),
          h('option', { value: 'plateau_4_to_8h', selected: state.hoursSinceIngestion === 'plateau_4_to_8h' }, t('pc.opt.time4to8', '4 to 8 hours (Gradual comedown)')),
          h('option', { value: 'extended_over_8h', selected: state.hoursSinceIngestion === 'extended_over_8h' }, t('pc.opt.timeOver8', '> 8 hours (Protracted / delayed integration)')),
        ]),
      ]),

      // 3. Bitter Metallic Taste (NBOMe)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isBitterNumbingTaste,
            onchange: (e) => setPsychedelicState({ isBitterNumbingTaste: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.bitterStrong', 'Intense Bitter Metallic Taste on Blotter? ')),
            t('pc.check.bitterDetail', '(Alert: "If it’s bitter, it’s a spitter" — 25I-NBOMe warning)'),
          ]),
        ]),
      ]),

      // 4. Lithium Medication Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.takingLithium,
            onchange: (e) => setPsychedelicState({ takingLithium: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.lithiumStrong', 'Currently Taking Lithium? ')),
            t('pc.check.lithiumDetail', '(Fatal Seizure / Status Epilepticus Hazard)'),
          ]),
        ]),
      ]),

      // 5. Clonus / Rigidity Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSpontaneousClonus,
            onchange: (e) => setPsychedelicState({ hasSpontaneousClonus: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.clonusStrong', 'Rhythmic Involuntary Muscle Jerking (Clonus)? ')),
            t('pc.check.clonusDetail', '(Hunter Criteria: Serotonin Syndrome warning)'),
          ]),
        ]),
      ]),

      // 6. High Fever Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasExtremeHyperthermia,
            onchange: (e) => setPsychedelicState({ hasExtremeHyperthermia: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.feverStrong', 'Severe Fever or Burning Hot Skin (> 102°F / 39°C)? ')),
            t('pc.check.feverDetail', '(Medical Emergency: Hyperthermia alert)'),
          ]),
        ]),
      ]),

      // 7. Seizures or Unresponsiveness
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSeizuresOrUnresponsiveness,
            onchange: (e) => setPsychedelicState({ hasSeizuresOrUnresponsiveness: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.seizureStrong', 'Convulsions, Collapse, or Total Unresponsiveness? ')),
            t('pc.check.seizureDetail', '(Immediate 911 dispatch required)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `pc-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'pc-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.tierTitleEn),
      ]),
      h('div', { class: 'pc-result-details' }, [
        h('div', { class: 'pc-rec-item' }, [
          h('strong', {}, t('pc.res.action', 'Clinical & Harm Reduction Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'pc-rec-item' }, [
          h('strong', {}, t('pc.res.intervention', 'Recommended Supportive Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // 4 Pillars of De-Escalation
    const pillarsCard = h('div', { class: 'pillars-card' }, [
      h('h3', {}, t('pc.pillars.title', 'The 4 Pillars of Compassionate Psychedelic Crisis Support (Zendo & Fireside Model)')),
      h('div', { class: 'pillars-grid' }, CRISIS_DE_ESCALATION_PILLARS.map((p) => h('div', { class: 'pillar-item' }, [
        h('div', { class: 'pillar-num' }, `Pillar ${p.pillarNum}`),
        h('h4', {}, p.titleEn),
        h('p', {}, p.instructionEn),
      ]))),
    ]);

    // 5-4-3-2-1 Sensory Grounding Tool
    const groundingCard = h('div', { class: 'grounding-card' }, [
      h('h3', {}, t('pc.grounding.title', '5-4-3-2-1 Sensory Grounding Tool for Panic & Ego Dissolution')),
      h('p', {}, 'Read these steps out loud in a slow, soothing, calm tone to anchor the person back to physical reality:'),
      h('ol', { class: 'grounding-list' }, GROUNDING_EXERCISES.sensory54321En.map((step) => h('li', {}, step))),
    ]);

    // Restraint Warning Box
    const restraintCard = h('div', { class: 'restraint-warning-card' }, [
      icon('alert'),
      h('div', {}, [
        h('h4', {}, 'CRITICAL WARNING: NEVER PHYSICALLY RESTRAIN A PSYCHEDELIC PATIENT'),
        h('p', {}, 'Physical restraints intensify terror, trigger violent fighting against straps, and cause severe rhabdomyolysis, metabolic acidosis, hyperthermia, and cardiac arrest. Antipsychotics (e.g. haloperidol) are contraindicated because they lower seizure thresholds and worsen dysphoria. Verbal de-escalation in a quiet room is the first-line gold standard.'),
      ]),
    ]);

    // SBAR Export Card
    const copyEnBtn = h('button', {
      type: 'button',
      class: 'btn-copy-sbar',
      onclick: () => {
        const text = buildPsychedelicSbarText(state, evaluation, 'en');
        copyText(text, { trigger: copyEnBtn, copiedLabel: 'Copied to Clipboard!', resetMs: 2500 });
      },
    }, [icon('copy'), h('span', {}, t('pc.sbar.copyEn', 'Copy Clinical SBAR (English)'))]);
    const copyEsBtn = h('button', {
      type: 'button',
      class: 'btn-copy-sbar secondary',
      onclick: () => {
        const text = buildPsychedelicSbarText(state, evaluation, 'es');
        copyText(text, { trigger: copyEsBtn, copiedLabel: '¡Copiado al Portapapeles!', resetMs: 2500 });
      },
    }, [icon('copy'), h('span', {}, t('pc.sbar.copyEs', 'Copiar SBAR (Español)'))]);
    const sbarCard = h('div', { class: 'sbar-export-container' }, [
      h('div', { class: 'sbar-header' }, [
        h('h4', {}, t('pc.sbar.title', 'Zero-PII Clinical Handoff & Dispatch Note Generator')),
        h('p', {}, t('pc.sbar.desc', 'Generate an anonymous, structured clinical SBAR summary for Emergency Department triage, festival medical teams, or psychiatric crisis responders. Operates 100% in local browser memory.')),
      ]),
      h('div', { class: 'sbar-actions' }, [copyEnBtn, copyEsBtn]),
    ]);

    section.appendChild(hotlineBanner);
    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(pillarsCard);
    section.appendChild(groundingCard);
    section.appendChild(restraintCard);
    section.appendChild(sbarCard);
    return section;
  }

  function renderPharmacologyTab() {
    const section = h('section', { class: 'pc-pharmacology-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('pc.pharm.heading', 'Substance Science: Pharmacology & Clinical Duration Profiles')),
      h('p', { class: 'tab-subtitle' }, t('pc.pharm.subtitle', 'Comprehensive breakdowns of classical tryptamines, lysergamides, and dangerous synthetic mimics.')),

      h('div', { class: 'pc-substances-grid' }, Object.values(PSYCHEDELIC_COMPOUND_PROFILES).map((sub) => h('div', { class: `pc-sub-card ${sub.id === 'nbome' ? 'warning' : ''}` }, [
        h('h3', { class: 'pc-sub-title' }, sub.name),
        h('p', {}, [h('strong', {}, 'Chemical Class: '), sub.classEn]),
        h('p', {}, [h('strong', {}, 'Duration of Action: '), h('span', { class: 'badge-duration' }, sub.durationEn)]),
        h('p', {}, [h('strong', {}, 'Pharmacological Mechanism: '), sub.pharmacologyEn]),
        h('p', {}, [h('strong', {}, 'Physiological Effects: '), sub.physiologicalEffectsEn]),
        h('div', { class: `pc-alert-box ${sub.id === 'nbome' ? 'emergency' : 'vulnerability'}` }, [
          icon('alert'),
          h('p', {}, [h('strong', {}, 'Crisis Vulnerability & Risks: '), sub.crisisVulnerabilityEn]),
        ]),
      ]))),
    ]);
    return section;
  }

  function renderInteractionsTab() {
    const section = h('section', { class: 'pc-interactions-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('pc.inter.heading', 'Dangerous Drug Interactions & Medical Contraindications')),
      h('p', { class: 'tab-subtitle' }, t('pc.inter.subtitle', 'Critical toxicological contraindications that convert non-toxic psychedelic experiences into fatal status epilepticus or Serotonin Syndrome.')),

      h('div', { class: 'interactions-grid' }, PSYCHEDELIC_INTERACTIONS.map((item) => h('div', { class: `interaction-card ${item.severity}` }, [
        h('div', { class: 'inter-badge' }, item.severity === 'fatal_contraindication' ? 'FATAL CONTRAINDICATION' : 'HIGH RISK ALERT'),
        h('h3', {}, item.titleEn),
        h('p', {}, item.mechanismEn),
        h('div', { class: 'inter-action' }, [
          h('strong', {}, 'Required Harm Reduction Action: '),
          h('span', {}, item.actionEn),
        ]),
      ]))),
    ]);
    return section;
  }

  function renderHppdTab() {
    const section = h('section', { class: 'pc-hppd-tab', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('pc.hppd.heading', 'Hallucinogen Persisting Perception Disorder (HPPD) & Visual Snow')),
      h('p', { class: 'tab-subtitle' }, t('pc.hppd.subtitle', 'Evidence-based neuro-ophthalmology guidance to demystify visual snow, relieve anxiety, and prevent misdiagnosis.')),

      // Overview Card
      h('div', { class: 'hppd-overview-card' }, [
        h('h3', {}, 'What is HPPD?'),
        h('p', {}, HPPD_CLINICAL_STANDARDS.definitionEn),
        h('div', { class: 'hppd-types-grid' }, [
          h('div', { class: 'hppd-type-box' }, [
            h('h4', {}, 'HPPD Type 1 (Benign Flashbacks)'),
            h('p', {}, HPPD_CLINICAL_STANDARDS.subtypesEn.type1),
          ]),
          h('div', { class: 'hppd-type-box' }, [
            h('h4', {}, 'HPPD Type 2 (Persistent Visual Snow)'),
            h('p', {}, HPPD_CLINICAL_STANDARDS.subtypesEn.type2),
          ]),
        ]),
      ]),

      // Cardinal Reassurances
      h('div', { class: 'hppd-reassurance-card' }, [
        h('h3', {}, 'Cardinal Clinical Truths & Reassurances for Patients'),
        h('ul', { class: 'reassurance-list' }, HPPD_CLINICAL_STANDARDS.cardinalReassurancesEn.map((r) => h('li', {}, r))),
      ]),
    ]);
    return section;
  }

  // Subscribe to state changes and initial render
  const unsubscribe = subscribePsychedelicState(() => render());
  render();

  return container;
}
