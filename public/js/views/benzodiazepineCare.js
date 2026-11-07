// public/js/views/benzodiazepineCare.js
// HarborPath - Benzodiazepine & Z-Drug Dependence, Ashton Manual Tapering,
// Flumazenil Toxicity Alerts & Protracted Withdrawal (BIND) Navigator
// Clinical standards: Ashton Manual (Heather Ashton DM, FRCP), FDA 2020 Boxed Warning,
// ASAM Deprescribing Consensus, Maudsley Deprescribing Guidelines.
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY & PHARMACOKINETIC DATA
// ============================================================================

export const BENZODIAZEPINE_CATALOG = Object.freeze({
  alprazolam: Object.freeze({
    id: 'alprazolam',
    nameEn: 'Alprazolam (Xanax)',
    nameEs: 'Alprazolam (Xanax)',
    dmeRatio: 20, // 0.5 mg = 10 mg diazepam (1 mg = 20 mg diazepam)
    refEquivMg: 0.5,
    halfLifeHours: '6–12 h',
    halfLifeHoursEs: '6–12 horas',
    onset: 'Fast (15–30 min)',
    onsetEs: 'Rápido (15–30 min)',
    classEn: 'High-potency, short/intermediate-acting',
    classEs: 'Alta potencia, acción corta/intermedia',
    interdoseRiskEn: 'Very high. Steep plasma peaks and valleys trigger interdose rebound anxiety, panic attacks, and intense psychological craving.',
    interdoseRiskEs: 'Muy alto. Los picos y valles plasmáticos abruptos causan ansiedad de rebote interdosis, ataques de pánico y deseos intensos.',
    crossoverRecEn: 'Gradual stage-wise crossover to Diazepam is strongly recommended to smooth out plasma levels and halt interdose withdrawal.',
    crossoverRecEs: 'Se recomienda fuertemente una sustitución gradual por etapas a Diazepam para estabilizar niveles y eliminar el rebote interdosis.'
  }),
  clonazepam: Object.freeze({
    id: 'clonazepam',
    nameEn: 'Clonazepam (Klonopin)',
    nameEs: 'Clonazepam (Klonopin)',
    dmeRatio: 20, // 0.5 mg = 10 mg diazepam (1 mg = 20 mg diazepam)
    refEquivMg: 0.5,
    halfLifeHours: '18–50 h',
    halfLifeHoursEs: '18–50 horas',
    onset: 'Intermediate (30–60 min)',
    onsetEs: 'Intermedio (30–60 min)',
    classEn: 'High-potency, long-acting',
    classEs: 'Alta potencia, acción prolongada',
    interdoseRiskEn: 'Moderate. High GABA-A binding affinity makes direct milligram reductions challenging without micro-dosing or liquid titration.',
    interdoseRiskEs: 'Moderado. Su alta afinidad a receptores GABA-A dificulta cortes directos en miligramos sin micro-dosificación o titulación líquida.',
    crossoverRecEn: 'Can be tapered directly with small percentage cuts, or partially crossed over to Diazepam for the final low-dose stages.',
    crossoverRecEs: 'Puede reducirse directamente con pequeños porcentajes, o cruzarse parcialmente a Diazepam en las etapas bajas finales.'
  }),
  lorazepam: Object.freeze({
    id: 'lorazepam',
    nameEn: 'Lorazepam (Ativan)',
    nameEs: 'Lorazepam (Ativan)',
    dmeRatio: 10, // 1 mg = 10 mg diazepam
    refEquivMg: 1.0,
    halfLifeHours: '10–20 h',
    halfLifeHoursEs: '10–20 horas',
    onset: 'Intermediate (15–45 min)',
    onsetEs: 'Intermedio (15–45 min)',
    classEn: 'Intermediate-potency & duration',
    classEs: 'Potencia y duración intermedias',
    interdoseRiskEn: 'High. Direct glucuronidation without active metabolites produces noticeable fluctuations between scheduled doses.',
    interdoseRiskEs: 'Alto. La glucuronidación directa sin metabolitos activos produce notorias fluctuaciones entre dosis programadas.',
    crossoverRecEn: 'Stepwise crossover to Diazepam (substituting evening dose first) substantially mitigates interdose morning distress.',
    crossoverRecEs: 'La sustitución escalonada a Diazepam (cambiando primero la dosis nocturna) alivia sustancialmente el malestar matutino.'
  }),
  diazepam: Object.freeze({
    id: 'diazepam',
    nameEn: 'Diazepam (Valium) — Ashton Reference Agent',
    nameEs: 'Diazepam (Valium) — Agente de Referencia Ashton',
    dmeRatio: 1, // 10 mg = 10 mg diazepam (reference)
    refEquivMg: 10.0,
    halfLifeHours: '20–100 h (active nordiazepam metabolite: 36–200 h)',
    halfLifeHoursEs: '20–100 horas (metabolito activo nordiazepam: 36–200 horas)',
    onset: 'Rapid (15 min)',
    onsetEs: 'Rápido (15 min)',
    classEn: 'Long-acting reference standard',
    classEs: 'Estándar de referencia de acción prolongada',
    interdoseRiskEn: 'Minimal. Ultra-long half-life maintains steady blood concentrations and avoids abrupt drops.',
    interdoseRiskEs: 'Mínimo. Su vida media ultra prolongada mantiene concentraciones estables y evita caídas bruscas.',
    crossoverRecEn: 'Reference gold-standard tapering agent. Available in scored 2 mg tablets and oral liquid solutions for micro-titration.',
    crossoverRecEs: 'Vehículo de referencia de oro para desescalada. Disponible en comprimidos de 2 mg ranurados y solución oral para micro-titulación.'
  }),
  temazepam: Object.freeze({
    id: 'temazepam',
    nameEn: 'Temazepam (Restoril)',
    nameEs: 'Temazepam (Restoril)',
    dmeRatio: 0.5, // 20 mg = 10 mg diazepam
    refEquivMg: 20.0,
    halfLifeHours: '8–22 h',
    halfLifeHoursEs: '8–22 horas',
    onset: 'Intermediate (30–60 min)',
    onsetEs: 'Intermedio (30–60 min)',
    classEn: 'Intermediate-acting hypnotic',
    classEs: 'Hipnótico de acción intermedia',
    interdoseRiskEn: 'High nocturnal rebound insomnia when stopping or cutting doses without a structured taper.',
    interdoseRiskEs: 'Alto insomnio de rebote nocturno al suspender o reducir dosis sin un plan estructurado.',
    crossoverRecEn: 'Gradual direct reduction or crossover to evening Diazepam equivalent.',
    crossoverRecEs: 'Reducción directa paulatina o sustitución por el equivalente nocturno de Diazepam.'
  }),
  chlordiazepoxide: Object.freeze({
    id: 'chlordiazepoxide',
    nameEn: 'Chlordiazepoxide (Librium)',
    nameEs: 'Clordiazepóxido (Librium)',
    dmeRatio: 0.4, // 25 mg = 10 mg diazepam
    refEquivMg: 25.0,
    halfLifeHours: '5–30 h (active metabolites up to 100 h)',
    halfLifeHoursEs: '5–30 horas (metabolitos activos hasta 100 horas)',
    onset: 'Slow / intermediate',
    onsetEs: 'Lento / intermedio',
    classEn: 'Long-acting anxiolytic',
    classEs: 'Ansiolítico de acción prolongada',
    interdoseRiskEn: 'Low to moderate. Multiple active metabolites buffer interdose drops.',
    interdoseRiskEs: 'Bajo a moderado. Múltiples metabolitos activos amortiguan caídas interdosis.',
    crossoverRecEn: 'Can be tapered directly or converted to Diazepam equivalent.',
    crossoverRecEs: 'Puede reducirse directamente o convertirse al equivalente de Diazepam.'
  }),
  oxazepam: Object.freeze({
    id: 'oxazepam',
    nameEn: 'Oxazepam (Serax)',
    nameEs: 'Oxazepam (Serax)',
    dmeRatio: 0.5, // 20 mg = 10 mg diazepam
    refEquivMg: 20.0,
    halfLifeHours: '4–15 h',
    halfLifeHoursEs: '4–15 horas',
    onset: 'Slow (1–2 h)',
    onsetEs: 'Lento (1–2 horas)',
    classEn: 'Short/intermediate-acting anxiolytic',
    classEs: 'Ansiolítico de acción corta/intermedia',
    interdoseRiskEn: 'Moderate. Slow absorption cushions onset, but short duration can provoke daytime anxiety.',
    interdoseRiskEs: 'Moderado. Absorción lenta que amortigua el inicio, pero su corta duración puede provocar ansiedad diurna.',
    crossoverRecEn: 'Direct reduction or crossover to Diazepam for a smoother taper curve.',
    crossoverRecEs: 'Reducción directa o cruce a Diazepam para una curva de desescalada más suave.'
  }),
  clorazepate: Object.freeze({
    id: 'clorazepate',
    nameEn: 'Clorazepate (Tranxene)',
    nameEs: 'Clorazepato (Tranxene)',
    dmeRatio: 0.67, // 15 mg = 10 mg diazepam
    refEquivMg: 15.0,
    halfLifeHours: '30–100 h (nordiazepam prodrug)',
    halfLifeHoursEs: '30–100 horas (profármaco de nordiazepam)',
    onset: 'Rapid (converted in stomach)',
    onsetEs: 'Rápido (convertido en estómago)',
    classEn: 'Long-acting prodrug',
    classEs: 'Profármaco de acción prolongada',
    interdoseRiskEn: 'Low. Decarboxylation yields nordiazepam with long pharmacokinetic plateau.',
    interdoseRiskEs: 'Bajo. Su descarboxilación genera nordiazepam con meseta prolongada.',
    crossoverRecEn: 'Direct stepwise reduction or convert to Diazepam.',
    crossoverRecEs: 'Reducción directa por pasos o conversión a Diazepam.'
  }),
  triazolam: Object.freeze({
    id: 'triazolam',
    nameEn: 'Triazolam (Halcion)',
    nameEs: 'Triazolam (Halcion)',
    dmeRatio: 40, // 0.25 mg = 10 mg diazepam
    refEquivMg: 0.25,
    halfLifeHours: '1.5–5.5 h (ultra-short)',
    halfLifeHoursEs: '1.5–5.5 horas (ultra corta)',
    onset: 'Very rapid (15–30 min)',
    onsetEs: 'Muy rápido (15–30 min)',
    classEn: 'Ultra-short hypnotic',
    classEs: 'Hipnótico de acción ultra corta',
    interdoseRiskEn: 'Extreme. Daytime rebound panic, severe amnesia, and dependency.',
    interdoseRiskEs: 'Extremo. Pánico de rebote diurno, amnesia intensa y dependencia rápida.',
    crossoverRecEn: 'Immediate structured crossover to Diazepam is clinically essential.',
    crossoverRecEs: 'La sustitución inmediata y estructurada a Diazepam es indispensable.'
  }),
  zolpidem: Object.freeze({
    id: 'zolpidem',
    nameEn: 'Zolpidem (Ambien) — Non-Benzodiazepine Z-Drug',
    nameEs: 'Zolpidem (Ambien) — Fármaco Z no benzodiacepínico',
    dmeRatio: 0.5, // 20 mg = 10 mg diazepam
    refEquivMg: 20.0,
    halfLifeHours: '2–3 h (ultra-short)',
    halfLifeHoursEs: '2–3 horas (ultra corta)',
    onset: 'Rapid (15–30 min)',
    onsetEs: 'Rápido (15–30 min)',
    classEn: 'Z-drug (selective GABA-A alpha-1 subunit)',
    classEs: 'Fármaco Z (selectivo subunidad alfa-1 GABA-A)',
    interdoseRiskEn: 'High. Midnight awakening, complex sleep behaviors, and fierce rebound insomnia.',
    interdoseRiskEs: 'Alto. Despertares a mitad de noche, conductas complejas del sueño e insomnio de rebote intenso.',
    crossoverRecEn: 'Direct reduction combined with CBT-I sleep restoration, or bedtime Diazepam substitute.',
    crossoverRecEs: 'Reducción directa combinada con TCC-I de sueño, o sustituto nocturno de Diazepam.'
  }),
  eszopiclone: Object.freeze({
    id: 'eszopiclone',
    nameEn: 'Eszopiclone (Lunesta) — Non-Benzodiazepine Z-Drug',
    nameEs: 'Eszopiclone (Lunesta) — Fármaco Z no benzodiacepínico',
    dmeRatio: 3.33, // 3 mg = 10 mg diazepam
    refEquivMg: 3.0,
    halfLifeHours: '6 h',
    halfLifeHoursEs: '6 horas',
    onset: 'Rapid (15–30 min)',
    onsetEs: 'Rápido (15–30 min)',
    classEn: 'Z-drug (cyclopyrrolone family)',
    classEs: 'Fármaco Z (familia ciclopirrolonas)',
    interdoseRiskEn: 'Moderate. Rebound insomnia, persistent bitter dysgeusia, and daytime grogginess.',
    interdoseRiskEs: 'Moderado. Insomnio de rebote, disgeusia amarga persistente y aturdimiento.',
    crossoverRecEn: 'Direct step-down (3 mg -> 2 mg -> 1 mg -> 0.5 mg) or crossover.',
    crossoverRecEs: 'Desescalada directa (3 mg -> 2 mg -> 1 mg -> 0.5 mg) o sustitución.'
  }),
  zaleplon: Object.freeze({
    id: 'zaleplon',
    nameEn: 'Zaleplon (Sonata) — Non-Benzodiazepine Z-Drug',
    nameEs: 'Zaleplon (Sonata) — Fármaco Z no benzodiacepínico',
    dmeRatio: 0.5, // 20 mg = 10 mg diazepam
    refEquivMg: 20.0,
    halfLifeHours: '1 h (ultra-short)',
    halfLifeHoursEs: '1 hora (ultra corta)',
    onset: 'Ultra-rapid (10–15 min)',
    onsetEs: 'Ultra rápido (10–15 min)',
    classEn: 'Z-drug (pyrazolopyrimidine family)',
    classEs: 'Fármaco Z (familia pirazolopirimidinas)',
    interdoseRiskEn: 'High immediate nocturnal rebound upon waking.',
    interdoseRiskEs: 'Alto rebote nocturno inmediato al despertar.',
    crossoverRecEn: 'Direct reduction or transition to non-controlled sleep therapies.',
    crossoverRecEs: 'Reducción directa o transición a terapias del sueño no controladas.'
  })
});

export const ASHTON_TAPER_RULES = Object.freeze([
  {
    ruleId: 'patient_control',
    titleEn: '1. Patient-Led Flexible Pacing',
    titleEs: '1. Ritmo Flexible Guiado por el Paciente',
    descEn: 'The patient, not a calendar or arbitrary detox deadline, controls the speed of reduction. Taper steps should reduce current dose by 5% to 10% every 2 to 4 weeks. If severe withdrawal symptoms emerge, HOLD at the current dose until stabilized. NEVER force a dose drop during acute distress.',
    descEs: 'La persona, no un calendario ni un plazo rígido de desintoxicación, marca el ritmo. Cada paso debe reducir entre 5% y 10% de la dosis actual cada 2 a 4 semanas. Si aparecen síntomas intensos, MANTENGA la dosis actual hasta estabilizarse. NUNCA fuerce una reducción en plena crisis.'
  },
  {
    ruleId: 'crossover_principle',
    titleEn: '2. Diazepam Long Half-Life Crossover',
    titleEs: '2. Sustitución por Diazepam de Vida Media Larga',
    descEn: 'Short-acting agents (alprazolam, lorazepam) cause frequent interdose withdrawal. Ashton protocols substitute doses stage-by-stage with Diazepam (half-life up to 100+ hours with nordiazepam). Nighttime dose is converted first, then morning, then midday.',
    descEs: 'Los fármacos de acción corta (alprazolam, lorazepam) provocan síndrome de abstinencia interdosis constante. El método Ashton los sustituye etapa por etapa con Diazepam (vida media de hasta 100+ horas). Se sustituye primero la dosis nocturna, luego la matutina y por último la del mediodía.'
  },
  {
    ruleId: 'micro_tapering',
    titleEn: '3. Micro-Tapering Near Zero (< 5 mg)',
    titleEs: '3. Micro-Reducciones Cerca de Cero (< 5 mg)',
    descEn: 'As the dose approaches zero, receptor occupancy drops steeply per milligram. Reductions must become smaller (0.5 mg to 1 mg cuts using scored 2 mg tablets or pharmaceutical oral solution) to avoid severe rebound panic.',
    descEs: 'A medida que la dosis se acerca a cero, la ocupación de receptores cae drásticamente por cada miligramo. Los recortes deben ser más pequeños (0.5 mg a 1 mg con pastillas de 2 mg ranuradas o solución oral) para evitar pánico de rebote.'
  },
  {
    ruleId: 'no_rapid_detox',
    titleEn: '4. Absolute Rejection of Rapid "Cold Turkey" Detox',
    titleEs: '4. Rechazo Absoluto de Desintoxicación Rápida "En Seco"',
    descEn: 'Abrupt cessation or 5–14 day detox protocols trigger life-threatening grand mal seizures, delirium tremens, psychosis, and debilitating protracted syndromes (BIND). Safe tapers routinely take 6 to 18 months.',
    descEs: 'Suspender de golpe o realizar desintoxicaciones rápidas de 5 a 14 días provoca convulsiones potencialmente mortales, delirium tremens, psicosis y daño neurológico prolongado (BIND). Una retirada segura suele requerir de 6 a 18 meses.'
  }
]);

export const FLUMAZENIL_CONTRAINDICATION_ALERT = Object.freeze({
  titleEn: 'FDA BLACK BOX WARNING: Flumazenil Contraindicated in Benzodiazepine Dependence',
  titleEs: 'ADVERTENCIA DE RECUADRO NEGRO DE LA FDA: Flumazenil Contraindicado en Dependencia a Benzodiazepinas',
  warningEn: 'CRITICAL CLINICAL MANDATE: Flumazenil (Romazicon) is a competitive GABA-A antagonist that displaces benzodiazepines instantly. In patients with chronic benzodiazepine tolerance or physical dependence, Flumazenil PRECIPITATES REFRACTORY STATUS EPILEPTICUS (unstoppable grand mal seizures) AND DEATH. Flumazenil is also contraindicated in mixed overdoses involving tricyclic antidepressants or unknown polysubstance ingestion. In suspected mixed opioid + benzodiazepine overdose, ALWAYS GIVE NALOXONE TO RESTORE BREATHING; NEVER GIVE FLUMAZENIL.',
  warningEs: 'MANDATO CLÍNICO CRÍTICO: El flumazenil (Romazicon) es un antagonista competitivo del receptor GABA-A que desplaza las benzodiazepinas al instante. En personas con tolerancia o dependencia física a benzodiazepinas, el flumazenil DESENCADENA ESTADO EPILÉPTICO REFRACTARIO (convulsiones continuas que no ceden) Y LA MUERTE. También está contraindicado en sobredosis mixtas con antidepresivos tricíclicos o sustancias desconocidas. En sobredosis mixtas con opioides, ADMINISTRE SIEMPRE NALOXONA PARA RESTABLECER LA RESPIRACIÓN; NUNCA ADMINISTRE FLUMAZENIL.'
});

export const BIND_SYMPTOMS_CATALOG = Object.freeze([
  {
    clusterId: 'sensory',
    titleEn: 'Sensory & Neuromuscular Symptoms',
    titleEs: 'Síntomas Sensoriales y Neuromusculares',
    items: [
      { id: 'tinnitus', nameEn: 'Tinnitus (ringing, buzzing or hissing in ears)', nameEs: 'Tinnitus (pitidos, zumbidos o ruidos en los oídos)' },
      { id: 'hyperacusis', nameEn: 'Hyperacusis & photophobia (extreme sound & light sensitivity)', nameEs: 'Hiperacusia y fotofobia (sensibilidad extrema al sonido y la luz)' },
      { id: 'paresthesias', nameEn: 'Paresthesias ("burning skin", electric shock sensations, numbness)', nameEs: 'Parestesias («piel ardiente», calambres eléctricos, entumecimiento)' },
      { id: 'fasciculations', nameEn: 'Fasciculations & myoclonus (involuntary muscle twitches & jerks)', nameEs: 'Fasciculaciones y mioclonías (temblores y espasmos musculares)' },
      { id: 'akathisia', nameEn: 'Akathisia (intense, distressing inner restlessness & urge to move)', nameEs: 'Acatisia (inquietud interna angustiante y necesidad imperiosa de moverse)' }
    ]
  },
  {
    clusterId: 'autonomic',
    titleEn: 'Autonomic & Gastrointestinal Symptoms',
    titleEs: 'Síntomas Autonómicos y Gastrointestinales',
    items: [
      { id: 'tachycardia', nameEn: 'Tachycardia surges & palpitations without exertion', nameEs: 'Taquicardias y palpitaciones sin esfuerzo físico' },
      { id: 'tremor', nameEn: 'Fine postural tremor & temperature dysregulation (chills/sweats)', nameEs: 'Temblor postural fino y desregulación térmica (escalofríos/sudores)' },
      { id: 'benzo_belly', nameEn: '"Benzo Belly" (severe abdominal distension, cramping, dysmotility)', nameEs: '«Vientre benzo» (distensión abdominal severa, cólicos, alteraciones intestinales)' }
    ]
  },
  {
    clusterId: 'cognitive',
    titleEn: 'Cognitive & Perceptual Symptoms',
    titleEs: 'Síntomas Cognitivos y Perceptivos',
    items: [
      { id: 'dpdr', nameEn: 'Depersonalization & derealization (feeling detached from self/reality)', nameEs: 'Despersonalización y desrealización (sentirse ajeno a uno mismo o al entorno)' },
      { id: 'brain_fog', nameEn: 'Severe cognitive fog & short-term memory impairment', nameEs: 'Neblina mental intensa y pérdida de memoria a corto plazo' },
      { id: 'visual_snow', nameEn: 'Visual snow or perception disturbances', nameEs: 'Nieve visual o alteraciones perceptivas' }
    ]
  },
  {
    clusterId: 'psychological',
    titleEn: 'Affective & Sleep Symptoms',
    titleEs: 'Síntomas Afectivos y del Sueño',
    items: [
      { id: 'rebound_panic', nameEn: 'Rebound panic surges & unprovoked chemical terror', nameEs: 'Oleadas de pánico de rebote y terror químico no provocado' },
      { id: 'cortisol_spike', nameEn: 'Early morning cortisol spike (waking with intense dread)', nameEs: 'Pico matutino de cortisol (despertar con intensa angustia)' },
      { id: 'rebound_insomnia', nameEn: 'Severe rebound insomnia & vivid nightmares', nameEs: 'Insomnio de rebote severo y pesadillas vívidas' }
    ]
  }
]);

export const COMFORT_MEDICATIONS_MATRIX = Object.freeze([
  {
    id: 'propranolol',
    nameEn: 'Propranolol (Inderal)',
    nameEs: 'Propranolol (Inderal)',
    classEn: 'Non-selective beta-adrenergic blocker (10–20 mg 2–3x/day PRN)',
    classEs: 'Betabloqueante adrenérgico no selectivo (10–20 mg 2–3 veces/día según necesidad)',
    indicationEn: 'Calms peripheral adrenergic autonomic storm (tachycardia, tremors, sweating). Non-habit forming; does not act on GABA receptors.',
    indicationEs: 'Calma la tormenta adrenérgica periférica (taquicardia, temblores, sudoración). No genera dependencia ni actúa sobre GABA.',
    cautionsEn: 'Contraindicated in asthma, bradycardia (< 55 bpm), hypotension, or severe heart block.',
    cautionsEs: 'Contraindicado en asma, bradicardia (< 55 lpm), hipotensión o bloqueo cardíaco grave.'
  },
  {
    id: 'hydroxyzine',
    nameEn: 'Hydroxyzine (Vistaril / Atarax)',
    nameEs: 'Hidroxizina (Atarax / Vistaril)',
    classEn: 'H1 histamine antagonist (25–50 mg PRN)',
    classEs: 'Antagonista histamínico H1 (25–50 mg según necesidad)',
    indicationEn: 'Provides non-controlled somatic sedation and acute anxiety relief without GABA-A receptor cross-tolerance.',
    indicationEs: 'Ofrece sedación somática y alivio de ansiedad aguda sin tolerancia cruzada en receptores GABA-A.',
    cautionsEn: 'Additive sedation; causes dry mouth. Avoid driving when initiating.',
    cautionsEs: 'Sedación aditiva; sequedad bucal. Evite conducir al iniciar el tratamiento.'
  },
  {
    id: 'melatonin',
    nameEn: 'Melatonin (0.5–3 mg at bedtime)',
    nameEs: 'Melatonina (0.5–3 mg al acostarse)',
    classEn: 'Endogenous neuro-hormone circadian modulator',
    classEs: 'Neurohormona moduladora del ritmo circadiano',
    indicationEn: 'Facilitates circadian clock phase alignment disrupted by chronic sedative use. Lower physiologic doses (0.5–1 mg) are often more effective than high doses.',
    indicationEs: 'Favorece el reajuste del reloj circadiano alterado por sedantes. Dosis fisiológicas bajas (0.5–1 mg) suelen ser más efectivas que dosis altas.',
    cautionsEn: 'Take 60–90 minutes before desired bedtime in a dark room.',
    cautionsEs: 'Tomar de 60 a 90 minutos antes de acostarse en una habitación a oscuras.'
  },
  {
    id: 'trazodone',
    nameEn: 'Trazodone (Desyrel)',
    nameEs: 'Trazodona (Desyrel)',
    classEn: 'Serotonin antagonist & reuptake inhibitor (25–50 mg at bedtime)',
    classEs: 'Inhibidor y antagonista de serotonina (25–50 mg al acostarse)',
    indicationEn: 'Non-scheduled sleep aid; increases restorative delta slow-wave sleep without suppressing REM sleep.',
    indicationEs: 'Inductor del sueño no controlado; aumenta el sueño restaurador de ondas lentas delta sin suprimir la fase REM.',
    cautionsEn: 'Morning grogginess; rare priapism risk; avoid with other serotonergic agents.',
    cautionsEs: 'Somnolencia matutina; riesgo infrecuente de priapismo; precaución con otros serotoninérgicos.'
  },
  {
    id: 'fluoroquinolones_warning',
    nameEn: 'CRITICAL DRUG INTERACTION: Fluoroquinolone Antibiotics (AVOID)',
    nameEs: 'INTERACCIÓN CRÍTICA: Antibióticos Fluoroquinolonas (EVITAR)',
    classEn: 'Ciprofloxacin (Cipro), Levofloxacin (Levaquin), Moxifloxacin (Avelox)',
    classEs: 'Ciprofloxacino (Cipro), Levofloxacino (Levaquin), Moxifloxacino (Avelox)',
    indicationEn: 'CONTRAINDICATED during benzodiazepine tapering or recovery. Fluoroquinolones displace benzodiazepines from GABA-A receptors and act as competitive GABA-A antagonists, triggering violent, acute withdrawal flares, psychotic episodes, and seizures.',
    indicationEs: 'CONTRAINDICADAS durante la desescalada o recuperación de benzodiazepinas. Las fluoroquinolonas desplazan a las benzodiazepinas y actúan como antagonistas GABA-A, provocando crisis severas de abstinencia, brotes psicóticos y convulsiones.',
    cautionsEn: 'Inform all medical and dental prescribers to choose alternative antibiotic classes (e.g. beta-lactams, macrolides, nitrofurantoin).',
    cautionsEs: 'Informe a médicos y dentistas para que elijan familias alternativas de antibióticos (betalactámicos, macrólidos, nitrofurantoína).'
  }
]);

// ============================================================================
// EVALUATION ALGORITHMS & SCHEDULE GENERATOR
// ============================================================================

/**
 * Calculates Diazepam Milligram Equivalent (DME)
 * @param {string} drugId - Drug identifier
 * @param {number} dailyDoseMg - Total daily dose in mg
 * @returns {number} DME in mg
 */
export function calculateDiazepamEquivalent(drugId, dailyDoseMg) {
  const normId = String(drugId || '').toLowerCase().trim();
  const entry = BENZODIAZEPINE_CATALOG[normId] || BENZODIAZEPINE_CATALOG.diazepam;
  const dose = Math.max(0, Number(dailyDoseMg) || 0);
  return Math.round(dose * entry.dmeRatio * 10) / 10;
}

/**
 * Generates an Ashton stage-by-stage crossover plan to Diazepam
 * @param {Object} options
 * @param {string} options.drugId
 * @param {number} options.dailyDoseMg
 * @param {number} [options.dosingFrequency=3]
 * @returns {Object}
 */
export function generateAshtonCrossoverPlan({ drugId, dailyDoseMg, dosingFrequency = 3 } = {}) {
  const normId = String(drugId || '').toLowerCase().trim();
  const entry = BENZODIAZEPINE_CATALOG[normId] || BENZODIAZEPINE_CATALOG.alprazolam;
  const dose = Math.max(0, Number(dailyDoseMg) || 0);
  const dme = calculateDiazepamEquivalent(normId, dose);

  if (normId === 'diazepam') {
    return {
      needed: false,
      dme,
      messageEn: 'You are already taking Diazepam, the Ashton gold-standard long half-life tapering vehicle. No crossover substitution is required; proceed directly to the Step-Down Reduction Schedule.',
      messageEs: 'Ya está tomando Diazepam, el vehículo de desescalada de referencia Ashton con vida media larga. No se requiere sustitución; proceda directamente al programa de reducción por pasos.',
      stages: []
    };
  }

  const stages = [
    {
      stage: 1,
      weeksEn: 'Weeks 1–2',
      weeksEs: 'Semanas 1–2',
      titleEn: 'Evening / Bedtime Dose Substitution',
      titleEs: 'Sustitución de la Dosis Nocturna',
      detailEn: `Substitute the nighttime dose of ${entry.nameEn} with approximately half of the calculated Diazepam equivalent (~${Math.round(dme * 0.5 * 10) / 10} mg Diazepam). Continue daytime doses of ${entry.nameEn} as usual. This cushions nighttime sleep while desmethyldiazepam begins building steady plasma levels.`,
      detailEs: `Sustituya la dosis nocturna de ${entry.nameEs} por aproximadamente la mitad del equivalente calculado en Diazepam (~${Math.round(dme * 0.5 * 10) / 10} mg de Diazepam). Mantenga las dosis diurnas habituales de ${entry.nameEs}. Esto favorece el descanso nocturno mientras el metabolito activo acumula niveles estables.`
    },
    {
      stage: 2,
      weeksEn: 'Weeks 3–4',
      weeksEs: 'Semanas 3–4',
      titleEn: 'Morning Dose Substitution',
      titleEs: 'Sustitución de la Dosis Matutina',
      detailEn: `Substitute the morning dose of ${entry.nameEn} with its Diazepam equivalent (~${Math.round(dme * 0.25 * 10) / 10} mg). Continue any midday dose of ${entry.nameEn} plus the bedtime Diazepam dose.`,
      detailEs: `Sustituya la dosis matutina de ${entry.nameEs} por su equivalente en Diazepam (~${Math.round(dme * 0.25 * 10) / 10} mg). Mantenga la dosis del mediodía de ${entry.nameEs} más la dosis nocturna de Diazepam.`
    },
    {
      stage: 3,
      weeksEn: 'Weeks 5–6',
      weeksEs: 'Semanas 5–6',
      titleEn: 'Midday Dose Substitution (Full Conversion)',
      titleEs: 'Sustitución de la Dosis del Mediodía (Conversión Total)',
      detailEn: `Replace the final midday dose of ${entry.nameEn} with Diazepam (~${Math.round(dme * 0.25 * 10) / 10} mg). You are now 100% converted to Diazepam (${dme} mg daily total), divided into morning, midday, and bedtime doses.`,
      detailEs: `Reemplace la última dosis diurna de ${entry.nameEs} por Diazepam (~${Math.round(dme * 0.25 * 10) / 10} mg). Ahora se encuentra 100% en Diazepam (${dme} mg diarios en total), divididos entre mañana, mediodía y noche.`
    },
    {
      stage: 4,
      weeksEn: 'Weeks 7–8',
      weeksEs: 'Semanas 7–8',
      titleEn: 'Steady-State Receptor Stabilization Phase',
      titleEs: 'Fase de Estabilización de Receptores en Estado Estacionario',
      detailEn: `Hold steady at ${dme} mg/day Diazepam for 1 to 2 weeks without any reductions. This ensures receptor adaptation and steady-state kinetics before beginning active dose cuts.`,
      detailEs: `Mantenga la dosis estable de ${dme} mg/día de Diazepam durante 1 a 2 semanas sin realizar reducciones. Esto consolida la adaptación de receptores antes de iniciar los recortes de dosis.`
    }
  ];

  return { needed: true, dme, stages };
}

/**
 * Generates an individualized stepwise Ashton reduction schedule
 * @param {Object} options
 * @param {number} options.diazepamEquivalentMg
 * @param {number} [options.stepIntervalWeeks=2]
 * @returns {Array<Object>}
 */
export function generateDetailedAshtonReductionSchedule({ diazepamEquivalentMg, stepIntervalWeeks = 2 } = {}) {
  let currentDose = Math.max(0.5, Number(diazepamEquivalentMg) || 10);
  const steps = [];
  let week = 1;
  const interval = Math.max(1, Number(stepIntervalWeeks) || 2);

  while (currentDose > 0.5 && steps.length < 50) {
    let cut;
    if (currentDose > 30) {
      cut = 2.5;
    } else if (currentDose > 20) {
      cut = 2.0;
    } else if (currentDose > 10) {
      cut = 1.0;
    } else if (currentDose > 5) {
      cut = 1.0;
    } else {
      cut = 0.5;
    }

    if (cut >= currentDose) cut = currentDose;
    const nextDose = Math.round((currentDose - cut) * 10) / 10;
    steps.push({
      stepNumber: steps.length + 1,
      startWeek: week,
      endWeek: week + interval - 1,
      startingDoseMg: currentDose,
      reductionMg: cut,
      targetDoseMg: nextDose,
      percentReduction: Math.round((cut / currentDose) * 100),
      practicalDosingEn: formatPracticalDosing(nextDose, false),
      practicalDosingEs: formatPracticalDosing(nextDose, true)
    });
    currentDose = nextDose;
    week += interval;
    if (currentDose <= 0.25) break;
  }

  if (currentDose > 0) {
    steps.push({
      stepNumber: steps.length + 1,
      startWeek: week,
      endWeek: week + interval - 1,
      startingDoseMg: currentDose,
      reductionMg: currentDose,
      targetDoseMg: 0,
      percentReduction: 100,
      practicalDosingEn: 'Zero medication. Taper successfully completed. Celebrate this neurological milestone.',
      practicalDosingEs: 'Cero medicación. Desescalada completada con éxito. Celebre este logro de recuperación neurológica.'
    });
  }

  return steps;
}

function formatPracticalDosing(doseMg, isEs) {
  if (doseMg <= 0) {
    return isEs ? 'Cero medicación (descontinuado)' : 'Zero medication (discontinued)';
  }
  if (doseMg >= 10) {
    const tens = Math.floor(doseMg / 10);
    const remainder = doseMg % 10;
    if (remainder === 0) {
      return isEs ? `${tens} comp. de 10 mg al día (divididos)` : `${tens}x 10 mg tab(s) daily (divided)`;
    }
    return isEs
      ? `${tens} comp. de 10 mg + ${remainder} mg en comp. de 2 o 5 mg`
      : `${tens}x 10 mg tab + ${remainder} mg in 2 mg/5 mg tabs`;
  }
  if (doseMg >= 2) {
    return isEs
      ? `${doseMg} mg/día usando comprimidos ranurados de 2 mg y/o 5 mg`
      : `${doseMg} mg/day using scored 2 mg and/or 5 mg tablets`;
  }
  return isEs
    ? `${doseMg} mg/día usando solución oral de Diazepam (1 mg/mL) o medio comp. de 2 mg`
    : `${doseMg} mg/day using Diazepam oral liquid (1 mg/mL) or half 2 mg scored tablet`;
}

/**
 * Evaluates clinical taper risks, seizure triggers, and escalation pathways
 * @param {Object} params
 * @returns {Object}
 */
export function evaluateBenzoTaperRisk({
  drugId = 'alprazolam',
  dailyDoseMg = 2,
  durationWeeks = 24,
  abruptStop = false,
  polysubstanceOpioid = false,
  polysubstanceAlcohol = false,
  priorSeizureHistory = false
} = {}) {
  const normId = String(drugId || '').toLowerCase().trim();
  const entry = BENZODIAZEPINE_CATALOG[normId] || BENZODIAZEPINE_CATALOG.alprazolam;
  const dose = Math.max(0, Number(dailyDoseMg) || 0);
  const duration = Math.max(0, Number(durationWeeks) || 0);
  const dme = calculateDiazepamEquivalent(normId, dose);

  const alerts = [];
  let riskLevel = 'standard_outpatient_taper';
  let recommendedSettingEn = 'Outpatient medical taper coordinated by a primary care prescriber or psychiatrist.';
  let recommendedSettingEs = 'Desescalada médica ambulatoria coordinada por médico de cabecera o psiquiatra.';

  // Critical Seizure Risk: Abrupt stop with tolerance or high dose
  if (abruptStop && (duration >= 4 || dme >= 20 || priorSeizureHistory)) {
    riskLevel = 'emergency_seizure_risk';
    recommendedSettingEn = 'EMERGENCY TRIAGE / INPATIENT HOSPITALIZATION: Immediate medical evaluation is required to prevent fatal status epilepticus.';
    recommendedSettingEs = 'TRIAGE DE EMERGENCIA / HOSPITALIZACIÓN: Se requiere evaluación médica urgente para prevenir estado epiléptico mortal.';
    alerts.push({
      severity: 'critical',
      titleEn: 'EMERGENCY: Acute Grand Mal Seizure Danger',
      titleEs: 'EMERGENCIA: Peligro Inminente de Convulsión Gran Mal',
      descEn: 'Stopping benzodiazepines abruptly ("cold turkey") after continuous daily use triggers severe GABA receptor uncoupling, leading to life-threatening grand mal seizures, delirium tremens, and autonomic collapse. Seek emergency department evaluation immediately.',
      descEs: 'Suspender benzodiazepinas de golpe tras uso diario continuo provoca un desacoplamiento grave de receptores GABA, desencadenando convulsiones gran mal potencialmente mortales, delirium tremens y colapso autonómico. Acuda a urgencias de inmediato.'
    });
  } else if (dme >= 50 || (priorSeizureHistory && dme >= 20)) {
    riskLevel = 'high_risk_inpatient';
    recommendedSettingEn = 'Specialized Inpatient Medical Detox / Close Medical Monitoring recommended for initial crossover.';
    recommendedSettingEs = 'Desintoxicación médica hospitalaria especializada o monitoreo estrecho para el cruce inicial.';
    alerts.push({
      severity: 'high',
      titleEn: 'High-Dose Dependency: Inpatient Stabilization Advisable',
      titleEs: 'Dependencia a Dosis Altas: Estabilización Hospitalaria Aconsejable',
      descEn: `A daily equivalent of ${dme} mg Diazepam with a history of seizures or high tolerance requires close clinical supervision during the initial crossover phase to maintain hemodynamic and seizure stability.`,
      descEs: `Un equivalente diario de ${dme} mg de Diazepam con antecedentes convulsivos o alta tolerancia requiere supervisión clínica estrecha durante la fase inicial de cruce.`
    });
  } else if (normId !== 'diazepam') {
    riskLevel = 'moderate_crossover_candidate';
    recommendedSettingEn = 'Outpatient Ashton Taper with Diazepam Crossover.';
    recommendedSettingEs = 'Desescalada ambulatoria Ashton con sustitución a Diazepam.';
  }

  // Polysubstance Opioid Alert
  if (polysubstanceOpioid) {
    alerts.push({
      severity: 'high',
      titleEn: 'FDA Boxed Warning: Concurrent Opioid + Benzodiazepine Use',
      titleEs: 'Advertencia de Recuadro Negro: Uso Concomitante de Opioides y Benzodiazepinas',
      descEn: 'Combining benzodiazepines with opioids multiplies the risk of fatal respiratory depression by 300%. Co-prescribe or carry Naloxone (Narcan) at all times. Naloxone reverses opioid-induced respiratory arrest even when benzodiazepines are present.',
      descEs: 'Combinar benzodiazepinas con opioides multiplica el riesgo de paro respiratorio mortal por un 300%. Lleve siempre naloxona (Narcan). La naloxona revierte la depresión respiratoria por opioides aun en presencia de benzodiazepinas.'
    });
  }

  // Polysubstance Alcohol Alert
  if (polysubstanceAlcohol) {
    alerts.push({
      severity: 'high',
      titleEn: 'Synergistic CNS Depressant Risk: Alcohol + Benzodiazepines',
      titleEs: 'Riesgo Sinergístico de Depresores del SNC: Alcohol + Benzodiazepinas',
      descEn: 'Both alcohol and benzodiazepines act on the GABA-A receptor complex. Concurrent use sharply increases blackouts, accidental overdose, and seizure vulnerability when either agent wears off.',
      descEs: 'Tanto el alcohol como las benzodiazepinas actúan sobre el complejo receptor GABA-A. El consumo conjunto eleva drásticamente el riesgo de pérdida de conciencia, sobredosis accidental y convulsiones de rebote.'
    });
  }

  // Flumazenil Contraindication Alert (Always attached)
  alerts.push({
    severity: 'critical_black_box',
    titleEn: FLUMAZENIL_CONTRAINDICATION_ALERT.titleEn,
    titleEs: FLUMAZENIL_CONTRAINDICATION_ALERT.titleEs,
    descEn: FLUMAZENIL_CONTRAINDICATION_ALERT.warningEn,
    descEs: FLUMAZENIL_CONTRAINDICATION_ALERT.warningEs
  });

  return {
    dmeMg: dme,
    drugEntry: entry,
    riskLevel,
    recommendedSettingEn,
    recommendedSettingEs,
    alerts
  };
}

/**
 * Formats a plain-text clinician discussion proposal (Zero PII)
 * @param {Object} state - Ephemeral RAM state
 * @param {boolean} isEs - Spanish locale flag
 * @returns {string}
 */
export function formatBenzoClinicianProposalText(state = {}, isEs = false) {
  const normId = state.selectedDrug || 'alprazolam';
  const entry = BENZODIAZEPINE_CATALOG[normId] || BENZODIAZEPINE_CATALOG.alprazolam;
  const dose = Number(state.dailyDoseMg) || 1;
  const duration = Number(state.durationWeeks) || 12;
  const dme = calculateDiazepamEquivalent(normId, dose);
  const crossover = generateAshtonCrossoverPlan({ drugId: normId, dailyDoseMg: dose });
  const schedule = generateDetailedAshtonReductionSchedule({ diazepamEquivalentMg: dme, stepIntervalWeeks: 2 });
  const totalWeeks = schedule.length > 0 ? schedule[schedule.length - 1].endWeek : 16;

  if (isEs) {
    return [
      '================================================================',
      'HARBORPATH - PROPUESTA DE DESESCALADA GRADUAL DE BENZODIAZEPINAS',
      'Guía para Discusión con Médico Prescriptor (Basada en el Manual Ashton)',
      '================================================================',
      'AVISO DE PRIVACIDAD: Documento en memoria RAM. Cero datos personales (PII).',
      '',
      '1. PERFIL FARMACOLÓGICO ACTUAL:',
      ` - Fármaco actual: ${entry.nameEs}`,
      ` - Dosis diaria declarada: ${dose} mg/día`,
      ` - Duración del tratamiento: ~${duration} semanas`,
      ` - Equivalencia en Diazepam (DME): ~${dme} mg de Diazepam al día`,
      ` - Semivida estimada: ${entry.halfLifeHoursEs}`,
      ` - Riesgo de rebote interdosis: ${entry.interdoseRiskEs}`,
      '',
      '2. PROTOCOLO DE SUSTITUCIÓN ASHTON PROPUESTO:',
      crossover.needed
        ? [
            ' - Fase de cruce gradual a Diazepam:',
            ...crossover.stages.map((s) => `   * ${s.weeksEs} [${s.titleEs}]: ${s.detailEs}`)
          ].join('\n')
        : ' - Ya en Diazepam: No se requiere cruce. Proceder a la reducción por pasos.',
      '',
      `3. PROGRAMA DE DESESCALADA EN DIAZEPAM (Duración estimada: ${totalWeeks} semanas):`,
      ' - Regla de oro: Reducciones del 5% al 10% cada 2 a 4 semanas.',
      ' - Si surgen síntomas intensos, MANTENER la dosis actual sin reducir ni subir.',
      ...schedule.slice(0, 8).map((st) => `   * Paso ${st.stepNumber} (${st.startWeek}-${st.endWeek} sem): ${st.startingDoseMg} mg -> ${st.targetDoseMg} mg (-${st.reductionMg} mg, ${st.percentReduction}%) | ${st.practicalDosingEs}`),
      schedule.length > 8 ? `   * [... ${schedule.length - 8} pasos adicionales hasta alcanzar 0 mg con micro-reducciones de 0.5 mg]` : '',
      '',
      '4. ADVERTENCIAS CRÍTICAS DE SEGURIDAD:',
      ` - ${FLUMAZENIL_CONTRAINDICATION_ALERT.titleEs}:`,
      `   ${FLUMAZENIL_CONTRAINDICATION_ALERT.warningEs}`,
      ' - Antibióticos fluoroquinolonas (Cipro, Levaquin): CONTRAINDICADOS por antagonismo GABA.',
      state.polysubstanceOpioid ? ' - Opioides concomitantes: Recetar y portar Naloxona para prevención de sobredosis.' : '',
      '',
      '5. ACUERDO DE COLABORACIÓN PROPUESTO:',
      ' - Petición al prescriptor: Recetas periódicas para evitar interrupciones bruscas.',
      ' - Control de la velocidad en manos de la persona que se desescala.',
      '================================================================'
    ].filter(Boolean).join('\n');
  }

  return [
    '================================================================',
    'HARBORPATH - CLINICAL BENZODIAZEPINE DEPRESCRIBING PROPOSAL',
    'Patient-Prescriber Discussion Brief (Ashton Manual Protocol)',
    '================================================================',
    'PRIVACY NOTICE: Generated in ephemeral memory. Zero PII stored or transmitted.',
    '',
    '1. CURRENT PHARMACOLOGICAL PROFILE:',
    ` - Current agent: ${entry.nameEn}`,
    ` - Reported daily dose: ${dose} mg/day`,
    ` - Approximate duration of use: ~${duration} weeks`,
    ` - Diazepam Milligram Equivalent (DME): ~${dme} mg Diazepam daily`,
    ` - Estimated elimination half-life: ${entry.halfLifeHours}`,
    ` - Interdose withdrawal vulnerability: ${entry.interdoseRiskEn}`,
    '',
    '2. ASHTON CROSSOVER STRATEGY:',
    crossover.needed
      ? [
          ' - Stepwise substitution into long-acting Diazepam:',
          ...crossover.stages.map((s) => `   * ${s.weeksEn} [${s.titleEn}]: ${s.detailEn}`)
        ].join('\n')
      : ' - Already on Diazepam: Crossover not required. Proceed directly to reduction steps.',
    '',
    `3. DIAZEPAM STEP-DOWN REDUCTION SCHEDULE (~${totalWeeks} weeks estimated):`,
    ' - Core rule: 5% to 10% dose reductions every 2 to 4 weeks.',
    ' - Patient-led pacing: If acute symptoms flare, HOLD at current dose. Never force cuts.',
    ...schedule.slice(0, 8).map((st) => `   * Step ${st.stepNumber} (Weeks ${st.startWeek}-${st.endWeek}): ${st.startingDoseMg} mg -> ${st.targetDoseMg} mg (-${st.reductionMg} mg, ${st.percentReduction}%) | ${st.practicalDosingEn}`),
    schedule.length > 8 ? `   * [... ${schedule.length - 8} additional micro-taper steps down to 0 mg in 0.5 mg increments]` : '',
    '',
    '4. CRITICAL LIFE SAFETY & CONTRAINDICATION WARNINGS:',
    ` - ${FLUMAZENIL_CONTRAINDICATION_ALERT.titleEn}:`,
    `   ${FLUMAZENIL_CONTRAINDICATION_ALERT.warningEn}`,
    ' - Fluoroquinolone antibiotics (Cipro, Levaquin): CONTRAINDICATED due to GABA antagonism.',
    state.polysubstanceOpioid ? ' - Concurrent opioids: Co-prescribe and carry Naloxone for respiratory arrest rescue.' : '',
    '',
    '5. COLLABORATIVE PRESCRIBING AGREEMENT:',
    ' - Request to clinician: Reliable prescription schedule to prevent abrupt involuntary cessation.',
    ' - Patient maintains autonomy over taper speed and pauses during acute life stressors.',
    '================================================================'
  ].filter(Boolean).join('\n');
}

// ============================================================================
// IN-RAM EPHEMERAL STATE (ZERO PII, ZERO DEVICE STORAGE)
// ============================================================================

const defaultState = () => ({
  currentTab: 'calculator', // 'calculator' | 'safety' | 'bind' | 'comfort'
  selectedDrug: 'alprazolam',
  dailyDoseMg: 2.0,
  durationWeeks: 24,
  dosingFrequency: 3,
  abruptStop: false,
  polysubstanceOpioid: false,
  polysubstanceAlcohol: false,
  priorSeizureHistory: false,
  bindChecklist: []
});

let benzoState = defaultState();

export function getBenzodiazepineState() {
  return { ...benzoState, bindChecklist: [...benzoState.bindChecklist] };
}

export function setBenzodiazepineState(updates = {}) {
  if (updates.bindChecklist) {
    benzoState.bindChecklist = [...updates.bindChecklist];
    delete updates.bindChecklist;
  }
  benzoState = { ...benzoState, ...updates };
  return getBenzodiazepineState();
}

export function resetBenzodiazepineState() {
  benzoState = defaultState();
  return getBenzodiazepineState();
}

// ============================================================================
// DOM VIEW IMPLEMENTATION
// ============================================================================

export function benzodiazepineCareView() {
  const container = h('div', { class: 'container benzo-care-view' });
  let localState = getBenzodiazepineState();

  function render() {
    clear(container);
    const isEs = getLang() === 'es';

    // Breadcrumb
    const nav = h('nav', { class: 'breadcrumb', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/' }, isEs ? 'Inicio' : 'Home'),
      h('span', { 'aria-hidden': 'true' }, ' / '),
      h('a', { href: '#/tools' }, isEs ? 'Herramientas' : 'Care Tools'),
      h('span', { 'aria-hidden': 'true' }, ' / '),
      h('span', { 'aria-current': 'page' }, isEs ? 'Desescalada de Benzodiazepinas (Ashton)' : 'Benzodiazepine & Ashton Tapering')
    );
    container.appendChild(nav);

    // Header
    const header = h('header', { class: 'page-header' },
      h('h1', null, isEs ? 'Navegador de Desescalada de Benzodiazepinas y Síndrome BIND' : 'Benzodiazepine Deprescribing, Ashton Taper & BIND Navigator'),
      h('p', { class: 'lead' }, isEs
        ? 'Calculadora de equivalencia en Diazepam, protocolo gradual Ashton, advertencias de contraindicación de Flumazenil y validación del síndrome neurológico BIND.'
        : 'Diazepam milligram equivalence calculator, Ashton Manual crossover schedules, flumazenil toxicity alerts, and BIND neuro-recovery validation.')
    );
    container.appendChild(header);

    // Tab Bar
    const tabsContainer = h('div', { class: 'sub-nav-tabs', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Benzodiazepinas' : 'Benzodiazepine Care Tabs' });
    const tabDefs = [
      { id: 'calculator', iconName: 'calculator', labelEn: 'Equivalence & Taper Calculator', labelEs: 'Calculadora y Desescalada' },
      { id: 'safety', iconName: 'shield', labelEn: 'Safety & Flumazenil Alerts', labelEs: 'Seguridad y Flumazenil' },
      { id: 'bind', iconName: 'heart', labelEn: 'BIND & Protracted Withdrawal', labelEs: 'Síndrome BIND y Síntomas' },
      { id: 'comfort', iconName: 'pill', labelEn: 'Comfort Meds & Recovery', labelEs: 'Fármacos de Alivio y Apoyo' }
    ];

    tabDefs.forEach((tab) => {
      const isActive = localState.currentTab === tab.id;
      const tabBtn = h('button', {
        class: `sub-nav-tab-btn ${isActive ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(isActive),
        'aria-controls': `benzo-tab-${tab.id}`,
        id: `tab-btn-${tab.id}`,
        click: () => {
          localState = setBenzodiazepineState({ currentTab: tab.id });
          render();
        }
      },
        icon(tab.iconName),
        h('span', null, isEs ? tab.labelEs : tab.labelEn)
      );
      tabsContainer.appendChild(tabBtn);
    });
    container.appendChild(tabsContainer);

    // Active Tab Content
    const tabContent = h('div', {
      id: `benzo-tab-${localState.currentTab}`,
      role: 'tabpanel',
      'aria-labelledby': `tab-btn-${localState.currentTab}`,
      tabindex: '0'
    });

    if (localState.currentTab === 'calculator') {
      tabContent.appendChild(renderCalculatorTab(localState, isEs, () => render()));
    } else if (localState.currentTab === 'safety') {
      tabContent.appendChild(renderSafetyTab(localState, isEs));
    } else if (localState.currentTab === 'bind') {
      tabContent.appendChild(renderBindTab(localState, isEs, () => render()));
    } else if (localState.currentTab === 'comfort') {
      tabContent.appendChild(renderComfortTab(localState, isEs));
    }

    container.appendChild(tabContent);
  }

  render();
  return container;
}

// ============================================================================
// TAB RENDERERS
// ============================================================================

function renderCalculatorTab(localState, isEs, reRender) {
  const wrapper = h('div', { class: 'benzo-tab-calculator' });

  // Inputs Section
  const formCard = h('div', { class: 'card input-card' });
  formCard.appendChild(h('h2', null, isEs ? '1. Ingrese su Pauta Actual de Benzodiazepina / Fármaco Z' : '1. Enter Current Benzodiazepine or Z-Drug Regimen'));
  formCard.appendChild(h('p', null, isEs
    ? 'Toda la información permanece exclusivamente en la memoria RAM de su dispositivo. Nada se almacena ni se transmite por internet.'
    : 'All calculations occur in ephemeral memory on your device. Zero data is stored, tracked, or transmitted.'));

  const grid = h('div', { class: 'form-grid-responsive' });

  // Drug Select
  const drugGroup = h('div', { class: 'form-group' });
  drugGroup.appendChild(h('label', { for: 'benzo-drug-select' }, isEs ? 'Medicamento actual:' : 'Current Medication:'));
  const drugSelect = h('select', {
    id: 'benzo-drug-select',
    class: 'input-field',
    change: (e) => {
      localState = setBenzodiazepineState({ selectedDrug: e.target.value });
      reRender();
    }
  });

  Object.values(BENZODIAZEPINE_CATALOG).forEach((item) => {
    const opt = h('option', { value: item.id }, isEs ? item.nameEs : item.nameEn);
    if (item.id === localState.selectedDrug) opt.selected = true;
    drugSelect.appendChild(opt);
  });
  drugGroup.appendChild(drugSelect);
  grid.appendChild(drugGroup);

  // Daily Dose Input
  const doseGroup = h('div', { class: 'form-group' });
  doseGroup.appendChild(h('label', { for: 'benzo-dose-input' }, isEs ? 'Dosis total diaria (mg):' : 'Total Daily Dose (mg):'));
  const doseInput = h('input', {
    id: 'benzo-dose-input',
    type: 'number',
    class: 'input-field',
    min: '0.1',
    max: '500',
    step: '0.25',
    value: String(localState.dailyDoseMg),
    input: (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0) {
        localState = setBenzodiazepineState({ dailyDoseMg: val });
        reRender();
      }
    }
  });
  doseGroup.appendChild(doseInput);
  grid.appendChild(doseGroup);

  // Duration Input
  const durGroup = h('div', { class: 'form-group' });
  durGroup.appendChild(h('label', { for: 'benzo-duration-input' }, isEs ? 'Duración de uso continuo (semanas):' : 'Continuous Use Duration (weeks):'));
  const durInput = h('input', {
    id: 'benzo-duration-input',
    type: 'number',
    class: 'input-field',
    min: '1',
    max: '2000',
    step: '1',
    value: String(localState.durationWeeks),
    input: (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 0) {
        localState = setBenzodiazepineState({ durationWeeks: val });
        reRender();
      }
    }
  });
  durGroup.appendChild(durInput);
  grid.appendChild(durGroup);

  formCard.appendChild(grid);

  // Clinical Complications Checkboxes
  const checkFieldset = h('fieldset', { class: 'form-fieldset' });
  checkFieldset.appendChild(h('legend', null, isEs ? 'Factores Clínicos de Riesgo:' : 'Clinical Risk Factors:'));

  const makeCheck = (id, labelEn, labelEs, currentVal, key) => {
    const lbl = h('label', { class: 'checkbox-inline' });
    const chk = h('input', {
      type: 'checkbox',
      id,
      checked: Boolean(currentVal),
      change: (e) => {
        localState = setBenzodiazepineState({ [key]: e.target.checked });
        reRender();
      }
    });
    lbl.appendChild(chk);
    lbl.appendChild(h('span', null, ` ${isEs ? labelEs : labelEn}`));
    return lbl;
  };

  checkFieldset.appendChild(makeCheck('chk-abrupt', 'Abrupt cessation ("cold turkey") within last 72 hours', 'Interrupción repentina ("en seco") en las últimas 72 horas', localState.abruptStop, 'abruptStop'));
  checkFieldset.appendChild(makeCheck('chk-opioid', 'Taking concurrent prescribed or unprescribed opioids', 'Consumo concurrente de opioides (recetados o no)', localState.polysubstanceOpioid, 'polysubstanceOpioid'));
  checkFieldset.appendChild(makeCheck('chk-alcohol', 'Regular concurrent alcohol consumption', 'Consumo regular y simultáneo de alcohol', localState.polysubstanceAlcohol, 'polysubstanceAlcohol'));
  checkFieldset.appendChild(makeCheck('chk-seizure', 'Personal history of seizures or withdrawal convulsions', 'Antecedentes personales de convulsiones o crisis por abstinencia', localState.priorSeizureHistory, 'priorSeizureHistory'));

  formCard.appendChild(checkFieldset);
  wrapper.appendChild(formCard);

  // Risk Assessment & DME Results
  const risk = evaluateBenzoTaperRisk(localState);
  const resultCard = h('div', { class: 'card result-card' });

  const resultHeader = h('div', { class: 'result-header-row' });
  resultHeader.appendChild(h('h2', null, isEs ? '2. Análisis de Equivalencia y Recomendación Clínica' : '2. Equivalence Analysis & Clinical Stratification'));

  const badgeClass = risk.riskLevel === 'emergency_seizure_risk'
    ? 'badge badge-danger'
    : risk.riskLevel === 'high_risk_inpatient'
      ? 'badge badge-warning'
      : 'badge badge-info';

  const badgeText = risk.riskLevel === 'emergency_seizure_risk'
    ? (isEs ? 'RIESGO CRÍTICO DE CONVULSIÓN' : 'CRITICAL SEIZURE EMERGENCY')
    : risk.riskLevel === 'high_risk_inpatient'
      ? (isEs ? 'SUPERVISIÓN HOSPITALARIA' : 'INPATIENT SUPERVISION ADVISED')
      : (isEs ? 'DESESCALADA AMBULATORIA' : 'OUTPATIENT ASHTON TAPER');

  resultHeader.appendChild(h('span', { class: badgeClass }, badgeText));
  resultCard.appendChild(resultHeader);

  // Stat callout
  const statBox = h('div', { class: 'stat-box-row' });
  statBox.appendChild(h('div', { class: 'stat-item' },
    h('div', { class: 'stat-num' }, `${risk.dmeMg} mg`),
    h('div', { class: 'stat-label' }, isEs ? 'Dosis Diaria Equivalente en Diazepam (DME)' : 'Diazepam Milligram Equivalent (DME)')
  ));
  statBox.appendChild(h('div', { class: 'stat-item' },
    h('div', { class: 'stat-num' }, risk.drugEntry.halfLifeHours),
    h('div', { class: 'stat-label' }, isEs ? 'Semivida del Fármaco Actual' : 'Current Drug Half-Life')
  ));
  resultCard.appendChild(statBox);

  // Alerts List
  if (risk.alerts.length > 0) {
    const alertList = h('div', { class: 'alerts-stack' });
    risk.alerts.forEach((alert) => {
      const aBox = h('div', { class: `alert-box alert-${alert.severity}` });
      aBox.appendChild(h('h3', null, isEs ? alert.titleEs : alert.titleEn));
      aBox.appendChild(h('p', null, isEs ? alert.descEs : alert.descEn));
      alertList.appendChild(aBox);
    });
    resultCard.appendChild(alertList);
  }

  wrapper.appendChild(resultCard);

  // Crossover Section
  const crossover = generateAshtonCrossoverPlan({
    drugId: localState.selectedDrug,
    dailyDoseMg: localState.dailyDoseMg
  });

  const crossoverCard = h('div', { class: 'card crossover-card' });
  crossoverCard.appendChild(h('h2', null, isEs ? '3. Protocolo de Sustitución por Etapas a Diazepam' : '3. Stepwise Diazepam Crossover Protocol'));

  if (!crossover.needed) {
    crossoverCard.appendChild(h('p', { class: 'highlight-info' }, isEs ? crossover.messageEs : crossover.messageEn));
  } else {
    crossoverCard.appendChild(h('p', null, isEs
      ? 'Para evitar el pánico de rebote matutino e inter-dosis provocado por fármacos de vida media corta, el método Ashton sustituye progresivamente las tomas por Diazepam:'
      : 'To eliminate steep peaks and valleys causing interdose panic, the Ashton protocol substitutes scheduled doses stage-by-stage into long-acting Diazepam:'));

    const stageGrid = h('div', { class: 'crossover-stages-grid' });
    crossover.stages.forEach((st) => {
      const stBox = h('div', { class: 'stage-box' });
      stBox.appendChild(h('div', { class: 'stage-badge' }, isEs ? st.weeksEs : st.weeksEn));
      stBox.appendChild(h('h3', null, isEs ? st.titleEs : st.titleEn));
      stBox.appendChild(h('p', null, isEs ? st.detailEs : st.detailEn));
      stageGrid.appendChild(stBox);
    });
    crossoverCard.appendChild(stageGrid);
  }
  wrapper.appendChild(crossoverCard);

  // Detailed Step-Down Schedule
  const schedule = generateDetailedAshtonReductionSchedule({
    diazepamEquivalentMg: risk.dmeMg,
    stepIntervalWeeks: 2
  });

  const schedCard = h('div', { class: 'card schedule-card' });
  schedCard.appendChild(h('h2', null, isEs ? '4. Calendario Ashton de Reducción Paso a Paso' : '4. Detailed Ashton Step-Down Reduction Schedule'));
  schedCard.appendChild(h('p', null, isEs
    ? 'Una vez estabilizado en Diazepam, reduzca un 5% a 10% cada 2 a 4 semanas. Si los síntomas de abstinencia son intensos, HAGA UNA PAUSA en el escalón actual. Nunca acelere.'
    : 'Once fully stabilized on Diazepam, reduce current dose by 5% to 10% every 2 to 4 weeks. If withdrawal flares, HOLD at current step until stable. Never force reductions.'));

  const tableWrapper = h('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': isEs ? 'Tabla de Reducción' : 'Reduction Table' });
  const table = h('table', { class: 'data-table' });
  const thead = h('thead', null,
    h('tr', null,
      h('th', { scope: 'col' }, isEs ? 'Paso' : 'Step'),
      h('th', { scope: 'col' }, isEs ? 'Semanas' : 'Weeks'),
      h('th', { scope: 'col' }, isEs ? 'Dosis Inicio' : 'Starting Dose'),
      h('th', { scope: 'col' }, isEs ? 'Reducción' : 'Reduction'),
      h('th', { scope: 'col' }, isEs ? 'Dosis Objetivo' : 'Target Dose'),
      h('th', { scope: 'col' }, isEs ? 'Pauta Práctica Recomendada' : 'Practical Formulation Guidance')
    )
  );
  table.appendChild(thead);

  const tbody = h('tbody');
  schedule.forEach((step) => {
    const tr = h('tr', null,
      h('td', null, String(step.stepNumber)),
      h('td', null, `${step.startWeek}–${step.endWeek}`),
      h('td', null, `${step.startingDoseMg} mg`),
      h('td', null, `-${step.reductionMg} mg (${step.percentReduction}%)`),
      h('td', null, h('strong', null, `${step.targetDoseMg} mg`)),
      h('td', null, isEs ? step.practicalDosingEs : step.practicalDosingEn)
    );
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  schedCard.appendChild(tableWrapper);

  wrapper.appendChild(schedCard);

  // Clinician Proposal Export Box
  const exportCard = h('div', { class: 'card export-card' });
  exportCard.appendChild(h('h2', null, isEs ? '5. Propuesta para Discusión con su Médico Prescriptor' : '5. Clinician Discussion Brief & Export'));
  exportCard.appendChild(h('p', null, isEs
    ? 'Presente esta propuesta estructurada y respetuosa a su médico o psiquiatra para colaborar en una desescalada segura.'
    : 'Present this structured, evidence-based brief to your doctor or psychiatrist to collaborate on a safe, patient-paced deprescribing agreement.'));

  const copyStatus = h('div', { class: 'copy-status-region', role: 'status', 'aria-live': 'polite' });
  const copyBtn = h('button', {
    class: 'btn btn-primary',
    click: async () => {
      const text = formatBenzoClinicianProposalText(localState, isEs);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          clear(copyStatus);
          copyStatus.appendChild(h('span', { class: 'text-success' }, isEs ? '✓ Propuesta copiada al portapapeles sin datos personales.' : '✓ Brief copied to clipboard (Zero PII).'));
        } else {
          clear(copyStatus);
          copyStatus.appendChild(h('span', null, isEs ? 'Seleccione y copie el texto a continuación.' : 'Please copy from the text box below.'));
        }
      } catch (e) {
        clear(copyStatus);
        copyStatus.appendChild(h('span', null, isEs ? 'Error al copiar; use el cuadro inferior.' : 'Unable to copy automatically; copy below.'));
      }
    }
  }, icon('share'), h('span', null, isEs ? ' Copiar Propuesta para Médico' : ' Copy Clinician Proposal Brief'));

  exportCard.appendChild(copyBtn);
  exportCard.appendChild(copyStatus);

  const previewBox = h('pre', { class: 'proposal-preview-box', tabindex: '0' },
    formatBenzoClinicianProposalText(localState, isEs)
  );
  exportCard.appendChild(previewBox);

  wrapper.appendChild(exportCard);
  return wrapper;
}

function renderSafetyTab(localState, isEs) {
  const wrapper = h('div', { class: 'benzo-tab-safety' });

  // Flumazenil Contraindication Callout (Primary Focus)
  const flumCard = h('div', { class: 'card card-danger-border' });
  flumCard.appendChild(h('div', { class: 'danger-badge-row' },
    icon('alert'),
    h('h2', null, isEs ? FLUMAZENIL_CONTRAINDICATION_ALERT.titleEs : FLUMAZENIL_CONTRAINDICATION_ALERT.titleEn)
  ));
  flumCard.appendChild(h('p', { class: 'lead' }, isEs
    ? FLUMAZENIL_CONTRAINDICATION_ALERT.warningEs
    : FLUMAZENIL_CONTRAINDICATION_ALERT.warningEn));

  const flumFacts = [
    {
      titleEn: 'Why Flumazenil is Deadly in Tolerant Patients',
      titleEs: 'Por qué el Flumazenil es Mortal en Personas con Tolerancia',
      descEn: 'Chronic use leads to down-regulation of inhibitory GABA-A receptors. Flumazenil instantaneously strips remaining benzodiazepine molecules from receptors, precipitating unbuffered massive glutamatergic storm, status epilepticus, and ventricular arrhythmias.',
      descEs: 'El uso crónico provoca la pérdida de receptores inhibidores GABA-A. El flumazenil expulsa instantáneamente las moléculas de benzodiazepina, provocando una tormenta glutamatérgica masiva, estado epiléptico incontrolable y arritmias cardíacas.'
    },
    {
      titleEn: 'Mixed Overdose Rule: Opioid + Benzodiazepine',
      titleEs: 'Regla de Oro en Sobredosis Mixta: Opioide + Benzodiazepina',
      descEn: 'If an individual has overdosed on both opioids and benzodiazepines: ALWAYS GIVE NALOXONE (NARCAN) and call 911. Naloxone reverses opioid-driven respiratory failure safely. NEVER give Flumazenil. Supportive airway management and oxygen are the only safe interventions for benzodiazepine toxicity.',
      descEs: 'Si una persona sufre sobredosis mixta de opioides y benzodiazepinas: ADMINISTRE SIEMPRE NALOXONA (NARCAN) y llame al 911. La naloxona revierte la insuficiencia respiratoria por opioides de forma segura. NUNCA administre flumazenil. El soporte de vías aéreas y oxígeno son la única medida segura ante la toxicidad por benzodiazepinas.'
    }
  ];

  flumFacts.forEach((f) => {
    const box = h('div', { class: 'sub-fact-box' });
    box.appendChild(h('h3', null, isEs ? f.titleEs : f.titleEn));
    box.appendChild(h('p', null, isEs ? f.descEs : f.descEn));
    flumCard.appendChild(box);
  });
  wrapper.appendChild(flumCard);

  // Grand Mal Seizures & 911 Triggers
  const seizureCard = h('div', { class: 'card' });
  seizureCard.appendChild(h('h2', null, isEs ? 'Signos de Alarma que Requieren Llamar al 911' : 'Life-Threatening Red Flags Requiring Immediate 911'));
  const redFlags = [
    {
      titleEn: 'Tonic-Clonic (Grand Mal) Convulsions',
      titleEs: 'Convulsiones Tónico-Clónicas (Gran Mal)',
      descEn: 'Involuntary loss of consciousness, body stiffening, rhythmic jerking of limbs, foaming at the mouth, or tongue biting. Call 911 immediately; protect head from injury.',
      descEs: 'Pérdida de conciencia, rigidez corporal, sacudidas rítmicas de extremidades, espuma bucal o mordedura de lengua. Llame al 911 de inmediato; proteja la cabeza.'
    },
    {
      titleEn: 'Delirium Tremens & Visual / Tactile Hallucinations',
      titleEs: 'Delirium Tremens y Alucinaciones Visuales / Táctiles',
      descEn: 'Profound confusion, disorientation to time/place, seeing insects or shapes, feeling crawling sensations on skin, combined with extreme tachycardia and fever.',
      descEs: 'Confusión profunda, desorientación témporo-espacial, ver insectos o sombras, sensación de insectos reptando bajo la piel, taquicardia severa y fiebre.'
    },
    {
      titleEn: 'Severe Psychosis & Acute Depersonalization Crisis',
      titleEs: 'Psicosis Aguda y Crisis de Despersonalización',
      descEn: 'Extreme paranoid panic, loss of contact with reality, or intense thoughts of self-harm driven by chemical neuro-receptor collapse.',
      descEs: 'Pánico paranoide extremo, desconexión con la realidad o ideación de autolesión provocada por el colapso químico de neuro-receptores.'
    }
  ];

  const flagList = h('div', { class: 'red-flags-grid' });
  redFlags.forEach((rf) => {
    const box = h('div', { class: 'red-flag-item' });
    box.appendChild(h('h3', null, isEs ? rf.titleEs : rf.titleEn));
    box.appendChild(h('p', null, isEs ? rf.descEs : rf.descEn));
    flagList.appendChild(box);
  });
  seizureCard.appendChild(flagList);
  wrapper.appendChild(seizureCard);

  // Fluoroquinolone Interaction Card
  const fqCard = h('div', { class: 'card' });
  fqCard.appendChild(h('h2', null, isEs ? 'Peligro Crítico: Antibióticos Fluoroquinolonas' : 'Critical Hazard: Fluoroquinolone Antibiotics'));
  fqCard.appendChild(h('p', null, isEs
    ? 'Antibióticos de uso común como Ciprofloxacino (Cipro) y Levofloxacino (Levaquin) poseen propiedades antagonistas competitivas sobre los receptores GABA-A. En personas en desescalada o con antecedentes de uso de benzodiazepinas, tomar fluoroquinolonas puede desencadenar crisis agudas y violentas de abstinencia, psicosis o convulsiones. Exija a sus médicos y dentistas el uso de alternativas seguras (amoxicilina, cefalosporinas, azitromicina).'
    : 'Common antibiotics such as Ciprofloxacin (Cipro) and Levofloxacin (Levaquin) possess intrinsic competitive GABA-A receptor antagonist properties. In patients tapering or recovering from benzodiazepines, taking fluoroquinolones can trigger severe, violent withdrawal recurrence, psychosis, or seizures. Always instruct medical and dental providers to select safe non-quinolone alternatives (e.g. amoxicillin, cephalosporins, azithromycin).'));
  wrapper.appendChild(fqCard);

  return wrapper;
}

function renderBindTab(localState, isEs, reRender) {
  const wrapper = h('div', { class: 'benzo-tab-bind' });

  // Header Validation Card
  const introCard = h('div', { class: 'card' });
  introCard.appendChild(h('h2', null, isEs ? 'Síndrome BIND: Disfunción Neurológica Inducida por Benzodiazepinas' : 'BIND: Benzodiazepine-Induced Neurological Dysfunction'));
  introCard.appendChild(h('p', { class: 'lead' }, isEs
    ? 'En 2020, la FDA actualizó formalmente las advertencias de recuadro negro para reconocer que los síntomas de abstinencia de benzodiazepinas pueden persistir durante meses o años. NO es daño cerebral permanente; es una neuroadaptación física genuina que se cura con el tiempo.'
    : 'In 2020, the FDA updated its Boxed Warning to formally recognize that benzodiazepine withdrawal symptoms can persist for months or years. This is NOT permanent brain damage; it is genuine physical neuro-receptor recalibration that heals over time.'));

  const reassurancePoints = [
    {
      titleEn: 'Receptor Downregulation & Glutamate Excess',
      titleEs: 'Pérdida de Receptores e Hiperactivación Glutamatérgica',
      descEn: 'Chronic sedative exposure causes GABA receptors to retract inside neurons while excitatory glutamate receptors multiply. Withdrawing the sedative leaves the nervous system in a temporary state of hyperexcitability until new GABA receptors are synthesized.',
      descEs: 'El uso crónico de sedantes hace que los receptores GABA se internalicen y los receptores de glutamato aumenten. Al retirar el fármaco, el sistema nervioso queda en hiperexcitabilidad temporal hasta que se sintetizan nuevos receptores GABA.'
    },
    {
      titleEn: 'Physical Neurological Reality vs. "Psychological Relapse"',
      titleEs: 'Realidad Neurológica Física vs. "Recaída Psicológica"',
      descEn: 'Symptoms like ear ringing, vibrating limbs, burning skin, and profound sensory hyperacusis are direct physical neurological markers, NOT a return of original anxiety.',
      descEs: 'Síntomas como zumbido de oídos, vibraciones internas, ardor cutáneo e hiperacusia son marcadores físicos directos, NO un retorno de la ansiedad original.'
    },
    {
      titleEn: 'The "Windows and Waves" Recovery Pattern',
      titleEs: 'El Patrón de "Ventanas y Olas" en la Recuperación',
      descEn: 'Healing does not occur in a straight line. Patients experience "windows" of clarity and comfort, followed by sudden "waves" of symptom flares. Waves do NOT mean you are back to square one; each wave represents active nervous system remodeling.',
      descEs: 'La curación no es lineal. Se experimentan "ventanas" de alivio y bienestar seguidas de "olas" súbitas de síntomas. Las olas NO significan volver a empezar; representan remodelación activa del sistema nervioso.'
    }
  ];

  const grid = h('div', { class: 'reassurance-grid' });
  reassurancePoints.forEach((pt) => {
    const box = h('div', { class: 'reassurance-box' });
    box.appendChild(h('h3', null, isEs ? pt.titleEs : pt.titleEn));
    box.appendChild(h('p', null, isEs ? pt.detailEs || pt.descEs : pt.descEn));
    grid.appendChild(box);
  });
  introCard.appendChild(grid);
  wrapper.appendChild(introCard);

  // Interactive BIND Checklist
  const checkCard = h('div', { class: 'card' });
  checkCard.appendChild(h('h2', null, isEs ? 'Verificador Interactivo de Síntomas BIND' : 'Interactive BIND Symptom Validator'));
  checkCard.appendChild(h('p', null, isEs
    ? 'Seleccione los síntomas que experimenta actualmente para validar su origen neurobiológico:'
    : 'Select symptoms you are currently experiencing to validate their neurobiological basis:'));

  const activeSet = new Set(localState.bindChecklist);

  BIND_SYMPTOMS_CATALOG.forEach((cluster) => {
    const clDiv = h('div', { class: 'bind-cluster-block' });
    clDiv.appendChild(h('h3', null, isEs ? cluster.titleEs : cluster.titleEn));

    const itemRow = h('div', { class: 'bind-checklist-grid' });
    cluster.items.forEach((item) => {
      const isChecked = activeSet.has(item.id);
      const lbl = h('label', { class: `bind-check-label ${isChecked ? 'selected' : ''}` });
      const chk = h('input', {
        type: 'checkbox',
        checked: isChecked,
        change: (e) => {
          if (e.target.checked) activeSet.add(item.id);
          else activeSet.delete(item.id);
          localState = setBenzodiazepineState({ bindChecklist: Array.from(activeSet) });
          reRender();
        }
      });
      lbl.appendChild(chk);
      lbl.appendChild(h('span', null, ` ${isEs ? item.nameEs : item.nameEn}`));
      itemRow.appendChild(lbl);
    });
    clDiv.appendChild(itemRow);
    checkCard.appendChild(clDiv);
  });

  if (activeSet.size > 0) {
    const summaryBox = h('div', { class: 'bind-summary-box' });
    summaryBox.appendChild(h('h3', null, isEs
      ? `Ha seleccionado ${activeSet.size} síntoma(s) documentado(s) de BIND`
      : `You have selected ${activeSet.size} documented BIND symptom(s)`));
    summaryBox.appendChild(h('p', null, isEs
      ? 'Estos síntomas son manifestaciones biológicas reconocidas de la recuperación de receptores GABA-A. Ninguno indica daño permanente. Se recomienda mantener una desescalada lenta, hidratación constante y reducción de estímulos sensoriales.'
      : 'These symptoms are recognized biological manifestations of GABA-A neuro-receptor recovery. None indicate permanent injury. Continued slow tapering, gentle hydration, and sensory reduction are recommended.'));
    checkCard.appendChild(summaryBox);
  }

  wrapper.appendChild(checkCard);
  return wrapper;
}

function renderComfortTab(localState, isEs) {
  const wrapper = h('div', { class: 'benzo-tab-comfort' });

  // Non-Controlled Comfort Medications
  const medCard = h('div', { class: 'card' });
  medCard.appendChild(h('h2', null, isEs ? 'Fármacos de Alivio No Controlados con Evidencia' : 'Evidence-Based Non-Controlled Comfort Medications'));
  medCard.appendChild(h('p', null, isEs
    ? 'Consulte siempre con su médico antes de iniciar cualquier fármaco de apoyo. Estos medicamentos no actúan sobre los receptores GABA-A y no generan dependencia física.'
    : 'Always consult with your prescribing clinician. These adjunctive medications do not act as positive allosteric GABA-A modulators and do not produce benzodiazepine cross-dependence.'));

  const medGrid = h('div', { class: 'comfort-meds-grid' });
  COMFORT_MEDICATIONS_MATRIX.forEach((m) => {
    const box = h('div', { class: 'comfort-med-card' });
    box.appendChild(h('h3', null, isEs ? m.nameEs : m.nameEn));
    box.appendChild(h('div', { class: 'med-class-badge' }, isEs ? m.classEs : m.classEn));
    box.appendChild(h('p', null, h('strong', null, isEs ? 'Indicación: ' : 'Indication: '), isEs ? m.indicationEs : m.indicationEn));
    box.appendChild(h('p', { class: 'text-muted' }, h('strong', null, isEs ? 'Precauciones: ' : 'Cautions: '), isEs ? m.cautionsEs : m.cautionsEn));
    medGrid.appendChild(box);
  });
  medCard.appendChild(medGrid);
  wrapper.appendChild(medCard);

  // Recovery Lifestyle Toolkit
  const lifeCard = h('div', { class: 'card' });
  lifeCard.appendChild(h('h2', null, isEs ? 'Caja de Herramientas para la Recuperación del Sistema Nervioso' : 'Nervous System Recovery Lifestyle Toolkit'));

  const tools = [
    {
      titleEn: 'Autonomic Vagal Grounding: Extended Exhalation',
      titleEs: 'Calma Vagal Autonómica: Exhalación Prolongada',
      descEn: 'Inhale for 4 seconds, exhale slowly for 6 to 8 seconds. Prolonged exhalation stimulates the vagus nerve, firing acetylcholine to naturally decelerate heart rate and downregulate sympathetic fight-or-flight panic surges.',
      descEs: 'Inhale en 4 segundos y exhale lentamente en 6 a 8 segundos. La exhalación prolongada estimula el nervio vago, liberando acetilcolina para desacelerar la frecuencia cardíaca y calmar la respuesta de pánico.'
    },
    {
      titleEn: 'Strict Caffeine & Stimulant Restriction',
      titleEs: 'Restricción Estricta de Cafeína y Estimulantes',
      descEn: 'Coffee, energy drinks, and high-sugar items block adenosine receptors and flood glutamate-sensitized neurons, provoking intense palpitations, muscle tremors, and anxiety spikes during a taper.',
      descEs: 'El café, las bebidas energéticas y el exceso de azúcar bloquean receptores de adenosina y saturan neuronas ya sensibles al glutamato, provocando taquicardias y pánico.'
    },
    {
      titleEn: 'Sensory Protection & Sound Masking',
      titleEs: 'Protección Sensorial y Atenuación de Ruidos',
      descEn: 'Hyperacusis and photophobia can overwhelm the auditory cortex. Wear polarized sunglasses outdoors, use low-noise white noise sound machines, and take scheduled sensory decompression breaks.',
      descEs: 'La hiperacusia y fotofobia saturan la corteza sensorial. Use gafas de sol polarizadas, máquinas de ruido blanco y pausas programadas de descompresión sensorial.'
    }
  ];

  const tGrid = h('div', { class: 'toolkit-grid' });
  tools.forEach((t) => {
    const box = h('div', { class: 'toolkit-box' });
    box.appendChild(h('h3', null, isEs ? t.titleEs : t.titleEn));
    box.appendChild(h('p', null, isEs ? t.descEs : t.descEn));
    tGrid.appendChild(box);
  });
  lifeCard.appendChild(tGrid);
  wrapper.appendChild(lifeCard);

  return wrapper;
}
