// public/js/views/sleepCare.js
// HarborPath - Sleep Restoration, Insomnia & Post-Acute Withdrawal Specialist
// Clinical standards: American College of Physicians (ACP) CBT-I Guidelines, AASM, SAMHSA TIP 63 / TIP 45, ASAM
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY & WITHDRAWAL SLEEP ARCHITECTURES
// ============================================================================

export const WITHDRAWAL_SLEEP_ARCHITECTURES = [
  {
    id: 'opioids',
    nameEn: 'Opioids (Heroin, Fentanyl, Oxycodone, Methadone, Buprenorphine)',
    nameEs: 'Opioides (Heroína, Fentanilo, Oxicodona, Metadona, Buprenorfina)',
    acutePhaseEn: 'Days 1-14: Severe total insomnia, restless legs syndrome (RLS), nocturnal muscle spasms, and autonomic hot/cold flashes.',
    acutePhaseEs: 'Días 1-14: Insomnio total severo, síndrome de piernas inquietas (SPI), espasmos musculares nocturnos y sofocos autonómicos.',
    pawsPhaseEn: 'Months 1-12: Loss of restorative slow-wave (delta) sleep, sleep fragmentation, daytime fatigue, and frequent micro-arousals. Endogenous endorphinergic sleep signaling takes 6-12 months to normalize.',
    pawsPhaseEs: 'Meses 1-12: Pérdida del sueño reparador de ondas lentas (delta), fragmentación del sueño, fatiga diurna y microdespertares frecuentes. La señalización endorfinérgica del sueño tarda 6-12 meses en normalizarse.',
    clinicalPearlEn: 'Buprenorphine and methadone stabilize sleep architecture over time. Splitting buprenorphine doses (morning and late afternoon) can reduce nighttime withdrawal emergence without sedatives.',
    clinicalPearlEs: 'La buprenorfina y la metadona estabilizan la arquitectura del sueño con el tiempo. Fraccionar las dosis de buprenorfina (mañana y tarde) puede reducir la abstinencia nocturna sin recurrir a sedantes.'
  },
  {
    id: 'alcohol',
    nameEn: 'Alcohol (Ethanol)',
    nameEs: 'Alcohol (Etanol)',
    acutePhaseEn: 'Days 1-10: Severe sleep latency (>2-3 hours), autonomic storm, severe REM rebound with terrifying nightmares, and diaphoresis.',
    acutePhaseEs: 'Días 1-10: Latencia de sueño prolongada (>2-3 horas), tormenta autonómica, rebote severo de fase REM con pesadillas aterradoras y diaforesis.',
    pawsPhaseEn: 'Months 1-24: Alcohol-induced sleep architecture disruption is among the longest lasting in addiction medicine. Protracted loss of slow-wave sleep and high sleep fragmentation persist for up to 2 years.',
    pawsPhaseEs: 'Meses 1-24: La alteración del sueño por alcohol es una de las más duraderas en medicina de adicciones. La pérdida de ondas lentas y la fragmentación del sueño persisten hasta por 2 años.',
    clinicalPearlEn: 'Insomnia is the #1 predictor of alcohol relapse. Prescribing Acamprosate restores GABA/glutamate balance, which helps normalize sleep architecture naturally.',
    clinicalPearlEs: 'El insomnio es el predictor número 1 de recaída en el alcohol. Prescribir acamprosato restaura el equilibrio GABA/glutamato, lo que ayuda a normalizar la arquitectura del sueño de forma natural.'
  },
  {
    id: 'stimulants',
    nameEn: 'Stimulants (Methamphetamine, Cocaine, Prescription Amphetamines)',
    nameEs: 'Estimulantes (Metanfetamina, Cocaína, Anfetaminas)',
    acutePhaseEn: 'Days 1-7: The "Crash Phase": profound hypersomnia (sleeping 14-20 hours/day) with unrefreshing sleep, followed by severe rebound insomnia by day 5-7.',
    acutePhaseEs: 'Días 1-7: La "Fase de Colapso": hipersomnia profunda (durmiendo 14-20 horas/día) con sueño no reparador, seguida de insomnio de rebote hacia los días 5-7.',
    pawsPhaseEn: 'Months 1-6: Circadian rhythm inversion (delayed sleep phase), severe daytime somnolence, nocturnal anhedonia, and fragmented sleep architecture.',
    pawsPhaseEs: 'Meses 1-6: Inversión del ritmo circadiano (fase de sueño retrasada), somnolencia diurna severa, anhedonia nocturna y arquitectura del sueño fragmentada.',
    clinicalPearlEn: 'Morning bright light phototherapy (10,000 lux for 30 minutes upon waking) resets depleted dopamine/serotonin circadian rhythms faster than medications.',
    clinicalPearlEs: 'La fototerapia matutina con luz brillante (10,000 lux durante 30 minutos al despertar) reinicia los ritmos circadianos de dopamina/serotonina más rápido que los fármacos.'
  },
  {
    id: 'benzos',
    nameEn: 'Benzodiazepines & Sedative-Hypnotics (Xanax, Klonopin, Valium)',
    nameEs: 'Benzodiacepinas y Sedantes Hipnóticos (Xanax, Klonopin, Valium)',
    acutePhaseEn: 'Weeks 1-4: Catastrophic rebound insomnia, sensory hypersensitivity, muscle twitching, severe nocturnal anxiety, and seizure vulnerability.',
    acutePhaseEs: 'Semanas 1-4: Insomnio de rebote severo, hipersensibilidad sensorial, espasmos musculares, ansiedad nocturna extrema y riesgo de convulsiones.',
    pawsPhaseEn: 'Months 1-12+: Protracted withdrawal syndrome with profound sleep fragmentation, nocturnal panic attacks, and severe sleep-onset dread.',
    pawsPhaseEs: 'Meses 1-12+: Síndrome de abstinencia prolongado con fragmentación severa del sueño, ataques de pánico nocturnos y pavor al conciliar el sueño.',
    clinicalPearlEn: 'Never stop cold turkey. A gradual Ashton Protocol diazepam taper combined with CBT-I provides the only safe pathway to long-term sleep restoration.',
    clinicalPearlEs: 'Nunca suspenda de golpe. Una reducción gradual con diazepam según el Protocolo Ashton combinada con TCC-I ofrece la única vía segura para restaurar el sueño a largo plazo.'
  },
  {
    id: 'cannabis',
    nameEn: 'Cannabis / Cannabinoids (THC, Concentrates, Edibles)',
    nameEs: 'Cannabis / Cannabinoides (THC, Concentrados, Comestibles)',
    acutePhaseEn: 'Days 1-14: Prolonged sleep latency, severe night sweats, loss of appetite, and intense, vivid, bizarre dreams (REM rebound).',
    acutePhaseEs: 'Días 1-14: Latencia de sueño prolongada, sudores nocturnos intensos, pérdida de apetito y sueños vívidos y extraños (rebote REM).',
    pawsPhaseEn: 'Weeks 2-6: Sleep efficiency gradually normalizes; mild difficulty initiating sleep can persist for up to 4-6 weeks in heavy chronic users.',
    pawsPhaseEs: 'Semanas 2-6: La eficiencia del sueño se normaliza progresivamente; dificultades leves para conciliar el sueño pueden durar 4-6 semanas en consumidores intensivos.',
    clinicalPearlEn: 'THC suppresses REM sleep. Upon cessation, sudden REM rebound causes vivid dreams that patients mistake for nightmares; reassurance that this is healing brain tissue prevents relapse.',
    clinicalPearlEs: 'El THC suprime el sueño REM. Al suspenderlo, el rebote súbito de REM genera sueños intensos que se confunden con pesadillas; explicar que es un signo de recuperación cerebral evita recaídas.'
  }
];

// ============================================================================
// NON-CONTROLLED SLEEP PHARMACOTHERAPY MATRIX
// ============================================================================

export const NON_CONTROLLED_SLEEP_MEDICATIONS = [
  {
    id: 'trazodone',
    nameEn: 'Trazodone (Desyrel)',
    nameEs: 'Trazodona (Desyrel)',
    doseEn: '25 - 100 mg at bedtime (30-60 min before sleep)',
    doseEs: '25 - 100 mg al acostarse (30-60 min antes de dormir)',
    mechanismEn: '5-HT2A receptor antagonist, H1 histamine inverse agonist, and alpha-1 adrenergic antagonist',
    mechanismEs: 'Antagonista del receptor 5-HT2A, agonista inverso del receptor H1 de histamina y antagonista alfa-1 adrenérgico',
    advantagesEn: 'Gold standard non-controlled sleep aid in addiction recovery; increases restorative slow-wave (delta) sleep; zero addiction potential; does not suppress respiratory drive with MOUD.',
    advantagesEs: 'Estándar de oro entre los hipnóticos no controlados en recuperación; incrementa el sueño reparador de ondas lentas (delta); cero potencial adictivo; no deprime la respiración con MOUD.',
    sideEffectsEn: 'Morning grogginess (mitigated by starting at 25-50 mg), dry mouth, orthostatic hypotension. Extremely rare: priapism (seek emergency care if erection lasts >4 hours).',
    sideEffectsEs: 'Somnolencia matutina (se mitiga iniciando con 25-50 mg), boca seca, hipotensión ortostática. Muy raro: priapismo (acudir a urgencias si la erección dura >4 horas).'
  },
  {
    id: 'mirtazapine',
    nameEn: 'Mirtazapine (Remeron)',
    nameEs: 'Mirtazapina (Remeron)',
    doseEn: '7.5 - 15 mg at bedtime',
    doseEs: '7.5 - 15 mg al acostarse',
    mechanismEn: 'Potent central H1 histamine receptor blockade and alpha-2 presynaptic adrenergic antagonism',
    mechanismEs: 'Potente bloqueo de receptores H1 centrales de histamina y antagonismo adrenérgico presináptico alfa-2',
    advantagesEn: 'Paradoxical dosing effect: LOWER doses (7.5-15 mg) are vastly MORE sedating than higher antidepressant doses (30-45 mg) where noradrenergic drive activates. Excellent if recovery is complicated by severe appetite loss or comorbid depression.',
    advantagesEs: 'Efecto de dosificación paradójico: Dosis BAJAS (7.5-15 mg) son mucho MÁS sedantes que dosis altas (30-45 mg) donde predomina la noradrenalina. Excelente si la recuperación cursa con pérdida de apetito o depresión.',
    sideEffectsEn: 'Increased appetite, carbohydrate cravings, weight gain, vivid dreams.',
    sideEffectsEs: 'Aumento del apetito, antojos de carbohidratos, aumento de peso, sueños vívidos.'
  },
  {
    id: 'hydroxyzine',
    nameEn: 'Hydroxyzine (Vistaril / Atarax)',
    nameEs: 'Hidroxizina (Vistaril / Atarax)',
    doseEn: '25 - 50 mg at bedtime (or PRN for acute nighttime panic)',
    doseEs: '25 - 50 mg al acostarse (o PRN para pánico nocturno agudo)',
    mechanismEn: 'First-generation H1 histamine antagonist with mild serotonin 5-HT2A antagonism',
    mechanismEs: 'Antagonista H1 de histamina de primera generación con leve antagonismo serotoninérgico 5-HT2A',
    advantagesEn: 'Rapid onset (20-30 min); dual action reduces somatic nighttime anxiety, autonomic restlessness, and pruritus (itching) from opioid withdrawal without dependency risk.',
    advantagesEs: 'Rápido inicio (20-30 min); doble acción que reduce la ansiedad somática nocturna, la inquietud autonómica y el prurito (picazón) de la abstinencia sin riesgo adictivo.',
    sideEffectsEn: 'Anticholinergic dry mouth, urinary retention, morning drowsiness. Use caution in older adults (Beers Criteria).',
    sideEffectsEs: 'Boca seca anticolinérgica, retención urinaria, somnolencia matutina. Precaución en adultos mayores (Criterios de Beers).'
  },
  {
    id: 'doxepin_low_dose',
    nameEn: 'Low-Dose Doxepin (Silenor)',
    nameEs: 'Doxepina en Dosis Bajas (Silenor)',
    doseEn: '3 - 6 mg at bedtime (specifically low-dose; NOT 25-150 mg antidepressant dosing)',
    doseEs: '3 - 6 mg al acostarse (específicamente dosis baja; NO dosis antidepresiva de 25-150 mg)',
    mechanismEn: 'Ultra-selective nanomolar H1 histamine receptor antagonism without significant anticholinergic blockade',
    mechanismEs: 'Antagonismo nanomolar ultra-selectivo del receptor H1 de histamina sin bloqueo anticolinérgico significativo',
    advantagesEn: 'FDA-approved specifically for sleep maintenance insomnia (waking up at 2-4 AM unable to return to sleep). Zero next-day psychomotor impairment, zero addiction, completely safe with buprenorphine and methadone.',
    advantagesEs: 'Aprobado por la FDA específicamente para insomnio de mantenimiento (despertarse a las 2-4 AM sin poder volver a dormir). Cero alteración psicomotora al día siguiente, sin adicción, seguro con buprenorfina y metadona.',
    sideEffectsEn: 'Minimal at 3-6 mg; mild sedation, headache.',
    sideEffectsEs: 'Mínimos a 3-6 mg; leve sedación, dolor de cabeza.'
  },
  {
    id: 'prazosin',
    nameEn: 'Prazosin (Minipress)',
    nameEs: 'Prazosina (Minipress)',
    doseEn: '1 - 5 mg at bedtime (titrate slowly from 1 mg)',
    doseEs: '1 - 5 mg al acostarse (titular lentamente desde 1 mg)',
    mechanismEn: 'Central alpha-1 adrenergic receptor antagonist crossing the blood-brain barrier',
    mechanismEs: 'Antagonista del receptor adrenérgico alfa-1 central que cruza la barrera hematoencefálica',
    advantagesEn: 'First-line evidence-based pharmacotherapy for trauma-related nightmares, nocturnal hyperarousal, and PTSD-associated sleep disruption common in recovery.',
    advantagesEs: 'Tratamiento de primera línea basado en evidencia para pesadillas traumáticas, hiperactivación nocturna y trastornos del sueño vinculados a TEPT comunes en recuperación.',
    sideEffectsEn: 'First-dose orthostatic hypotension (dizziness when standing); take while sitting directly in bed before lying down.',
    sideEffectsEs: 'Hipotensión ortostática de primera dosis (mareo al ponerse de pie); tomar sentado directamente en la cama antes de acostarse.'
  },
  {
    id: 'ramelteon',
    nameEn: 'Ramelteon (Rozerem)',
    nameEs: 'Ramelteón (Rozerem)',
    doseEn: '8 mg at bedtime (30 min before desired sleep onset)',
    doseEs: '8 mg al acostarse (30 min antes de la hora deseada)',
    mechanismEn: 'Selective melatonin MT1 and MT2 receptor agonist with 8-fold higher affinity than endogenous melatonin',
    mechanismEs: 'Agonista selectivo de receptores de melatonina MT1 y MT2 con afinidad 8 veces mayor que la melatonina endógena',
    advantagesEn: 'Non-controlled substance with zero abuse liability and zero respiratory depression. Resets dysregulated circadian phase without causing motor incoordination or memory impairment.',
    advantagesEs: 'Sustancia no controlada con cero potencial de abuso y cero depresión respiratoria. Reinicia la fase circadiana desregulada sin causar incoordinación motora ni fallas de memoria.',
    sideEffectsEn: 'Mild dizziness, fatigue, nausea.',
    sideEffectsEs: 'Mareo leve, fatiga, náuseas.'
  }
];

export const CONTRAINDICATED_SEDATIVES_WARNING = {
  titleEn: 'Why Controlled Sleeping Pills Are Dangerous in Recovery',
  titleEs: 'Por Qué los Somníferos Controlados son Peligrosos en Recuperación',
  summaryEn: 'Benzodiazepines (Xanax, Ativan, Klonopin) and Z-drugs (Ambien, Lunesta, Sonata) activate GABA-A receptors in a manner that triggers addiction pathways, produces rapid tolerance, and causes severe rebound insomnia upon stopping. When combined with MOUD (buprenorphine, methadone), they cause fatal synergistic central respiratory arrest.',
  summaryEs: 'Las benzodiacepinas (Xanax, Ativan, Klonopin) y los fármacos Z (Ambien, Lunesta, Sonata) activan los receptores GABA-A de forma que reactivan circuitos de adicción, generan tolerancia rápida y causan insomnio de rebote severo al suspenderlos. Combinados con MOUD (buprenorfina, metadona), provocan paro respiratorio central sinérgico fatal.'
};

// ============================================================================
// CBT-I CORE BEHAVIORAL PROTOCOLS
// ============================================================================

export const CBTI_PROTOCOLS = [
  {
    id: 'stimulus_control',
    titleEn: '1. Stimulus Control Therapy (Bootzin Technique)',
    titleEs: '1. Terapia de Control de Estímulos (Técnica de Bootzin)',
    summaryEn: 'Reconditions the brain to associate the bed exclusively with sleep, extinguishing conditioned bedtime arousal.',
    summaryEs: 'Reacondiciona el cerebro para asociar la cama exclusivamente con el sueño, extinguiendo la activación condicionada.',
    rulesEn: [
      'The Bed is for Sleep Only: No watching TV, scrolling phones, eating, or working in bed.',
      'The 20-Minute Rule: If you are awake after ~20 minutes in bed, GET OUT OF BED. Move to a comfortable chair in dim light and engage in a relaxing activity (reading a physical book, gentle audio). Return to bed ONLY when sleepy.',
      'Consistent Wake Time: Wake up at the EXACT same time 7 days a week, regardless of how few hours you slept. This anchors your circadian sleep drive.',
      'No Daytime Napping: Avoid daytime naps during early recovery to build nocturnal sleep pressure (homeostatic sleep drive).'
    ],
    rulesEs: [
      'La Cama es Solo para Dormir: No mire televisión, no use el celular, no coma ni trabaje en la cama.',
      'La Regla de los 20 Minutos: Si sigue despierto tras ~20 minutos en cama, LEVÁNTESE. Vaya a un sillón con luz tenue y haga una actividad relajante (leer un libro físico, audio suave). Vuelva a la cama SOLO cuando tenga sueño.',
      'Hora de Despertar Consistente: Despiértese a la MISMA hora exacta los 7 días de la semana, sin importar qué tan poco haya dormido. Esto sincroniza su ritmo circadiano.',
      'Sin Siestas Diurnas: Evite las siestas diurnas durante el inicio de la recuperación para acumular presión homeostática de sueño nocturno.'
    ]
  },
  {
    id: 'sleep_restriction',
    titleEn: '2. Sleep Restriction & Efficiency Consolidation',
    titleEs: '2. Restricción del Sueño y Consolidación de la Eficiencia',
    summaryEn: 'Consolidates fragmented, fitful sleep by matching Time in Bed (TIB) to actual Total Sleep Time (TST).',
    summaryEs: 'Consolida el sueño fragmentado e inquieto haciendo coincidir el Tiempo en Cama con el Tiempo Total de Sueño real.',
    rulesEn: [
      'Calculate Sleep Efficiency (SE): SE = (Total Hours Asleep / Total Hours in Bed) x 100.',
      'Normal Target: Healthy sleep efficiency is 85% or higher (90%+ ideal).',
      'If Sleep Efficiency is < 85%: Restrict Time in Bed to your actual sleep duration (minimum floor: 5 hours). For example, if you sleep 5.5 hours but spend 8.5 hours in bed tossing, set your bedtime window to 5.5 hours (e.g., 12:30 AM to 6:00 AM).',
      'Expanding the Window: Once your sleep efficiency exceeds 85% for 5 consecutive days, move bedtime 15 minutes earlier to expand total sleep time.'
    ],
    rulesEs: [
      'Calcule la Eficiencia del Sueño (ES): ES = (Horas Totales Dormido / Horas Totales en Cama) x 100.',
      'Objetivo Normal: Una eficiencia de sueño saludable es del 85% o más (ideal > 90%).',
      'Si la Eficiencia es < 85%: Restrinja el Tiempo en Cama a su duración real de sueño (límite mínimo: 5 horas). Por ejemplo, si duerme 5.5 horas pero pasa 8.5 horas dando vueltas, fije su ventana de cama en 5.5 horas (ej. 12:30 AM a 6:00 AM).',
      'Ampliación de la Ventana: Cuando su eficiencia supere el 85% durante 5 días seguidos, adelante la hora de acostarse 15 minutos para ampliar el sueño total.'
    ]
  },
  {
    id: 'circadian_phototherapy',
    titleEn: '3. Circadian Phototherapy & Light Entrainment',
    titleEs: '3. Fototerapia Circadiana y Sincronización Lumínica',
    summaryEn: 'Uses natural light to suppress daytime melatonin and stimulate nocturnal pineal secretion.',
    summaryEs: 'Usa luz natural para suprimir la melatonina diurna y estimular la secreción pineal nocturna.',
    rulesEn: [
      'Morning Sunlight Anchor: Step outside into natural morning daylight for 15-30 minutes within 45 minutes of waking. Natural sunlight (10,000 - 100,000 lux) sets the master suprachiasmatic clock.',
      'Evening Blue Light Curfew: Dim household lights and eliminate blue-spectrum screens 2 hours before bed. Blue light directly halts melatonin production.',
      'Temperature Drop: Lower bedroom ambient temperature to 65-68°F (18-20°C). A core body temperature drop of 1-2°F is physiologically required to initiate deep slow-wave sleep.'
    ],
    rulesEs: [
      'Ancla de Luz Matutina: Salga a la luz natural durante 15-30 minutos dentro de los primeros 45 minutos tras despertar. La luz solar natural (10,000 - 100,000 lux) calibra el reloj maestro supraquiasmático.',
      'Toque de Queda de Luz Azul: Atenúe las luces del hogar y elimine pantallas de luz azul 2 horas antes de dormir. La luz azul detiene directamente la producción de melatonina.',
      'Descenso de Temperatura: Ajuste la temperatura del dormitorio a 18-20°C (65-68°F). Una caída en la temperatura corporal central de 1°C es fisiológicamente indispensable para entrar en sueño profundo.'
    ]
  },
  {
    id: 'using_dreams',
    titleEn: '4. Substance-Using Dreams & Nighttime Urge Management',
    titleEs: '4. Sueños de Consumo y Manejo del Deseo Nocturno',
    summaryEn: 'Normalizing vivid dreams of substance use as a neurobiological sign of healing REM sleep.',
    summaryEs: 'Normalización de los sueños vívidos de consumo como un signo neurobiológico de recuperación del sueño REM.',
    rulesEn: [
      'Using Dreams Are REM Rebound, Not Failure: In recovery, the brain experiences massive REM rebound. Dreams where you use substances, feel guilt, or wake up terrified are completely normal biological artifacts of neuro-regeneration.',
      'Grounding Upon Waking: Keep a glass of cold water by your bed. If you wake from a using dream, drink cold water, touch your feet to the floor, and remind yourself: "I am safe. I am in recovery. My brain is healing."',
      'Urge Surfing in Bed: If nighttime cravings occur, visualize the craving as an ocean wave: it rises, peaks for 10-15 minutes, and naturally subsides. Do not fight it; observe it with diaphragmatic breathing.'
    ],
    rulesEs: [
      'Los Sueños de Consumo son Rebote REM, No Fracaso: En recuperación, el cerebro experimenta un intenso rebote REM. Soñar que consume, sentir culpa o despertar con pavor son fenómenos biológicos normales de neuro-regeneración.',
      'Conexión a Tierra al Despertar: Deje un vaso de agua fría junto a la cama. Si despierta de un sueño de consumo, beba agua, apoye los pies en el suelo y recuérdese: "Estoy a salvo. Estoy en recuperación. Mi cerebro está sanando".',
      'Surfear el Deseo en Cama: Si siente deseos nocturnos de consumir, visualice la ansiedad como una ola en el mar: sube, alcanza su punto máximo durante 10-15 minutos y baja sola. No luche contra ella; obsérvela respirando diafragmáticamente.'
    ]
  }
];

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateSleepProfile({
  substanceId = 'opioids',
  timeInBedHours = 8.0,
  totalSleepHours = 5.0,
  sleepLatencyMinutes = 45,
  hasRestlessLegs = false,
  hasTraumaNightmares = false,
  hasAwakeningsAt2AM = false
} = {}) {
  const safeTimeInBed = Math.max(1, Number(timeInBedHours) || 8);
  const safeTotalSleep = Math.min(safeTimeInBed, Math.max(0, Number(totalSleepHours) || 5));
  const efficiency = Math.round((safeTotalSleep / safeTimeInBed) * 100);

  let efficiencyTierEn = 'Poor Sleep Efficiency (< 70%)';
  let efficiencyTierEs = 'Eficiencia de Sueño Deficiente (< 70%)';
  let efficiencyBadgeClass = 'badge-danger';

  if (efficiency >= 85) {
    efficiencyTierEn = 'Healthy Consolidated Sleep (≥ 85%)';
    efficiencyTierEs = 'Sueño Consolidado Saludable (≥ 85%)';
    efficiencyBadgeClass = 'badge-success';
  } else if (efficiency >= 70) {
    efficiencyTierEn = 'Moderate Sleep Fragmentation (70 - 84%)';
    efficiencyTierEs = 'Fragmentación de Sueño Moderada (70 - 84%)';
    efficiencyBadgeClass = 'badge-warning';
  }

  const primaryRecommendations = [];
  const suggestedMedications = [];

  // Behavioral recommendations
  if (efficiency < 85) {
    primaryRecommendations.push({
      titleEn: `Implement Sleep Restriction Window (${safeTotalSleep} hours)`,
      titleEs: `Implementar Ventana de Restricción de Sueño (${safeTotalSleep} horas)`,
      descEn: `You spend ${safeTimeInBed} hours in bed but only sleep ${safeTotalSleep} hours (${efficiency}% efficiency). Restrict your time in bed to ${Math.max(5, safeTotalSleep)} hours to rebuild homeostatic sleep pressure and eliminate nighttime tossing.`,
      descEs: `Pasa ${safeTimeInBed} horas en cama pero solo duerme ${safeTotalSleep} horas (${efficiency}% de eficiencia). Restrinja su tiempo en cama a ${Math.max(5, safeTotalSleep)} horas para recuperar la presión homeostática de sueño y evitar dar vueltas.`
    });
  }

  if (sleepLatencyMinutes > 30) {
    primaryRecommendations.push({
      titleEn: 'Enforce the 20-Minute Stimulus Control Rule',
      titleEs: 'Aplicar la Regla de Control de Estímulos de 20 Minutos',
      descEn: `Falling asleep takes ${sleepLatencyMinutes} minutes. If you are awake after 20 minutes, leave the bed immediately and sit in dim light until drowsy. Never stay in bed tossing and turning.`,
      descEs: `Tarda ${sleepLatencyMinutes} minutos en dormirse. Si sigue despierto tras 20 minutos, salga de la cama de inmediato y siéntese con luz tenue hasta sentir sueño. Nunca permanezca dando vueltas en la cama.`
    });
  }

  // Medication matching
  if (hasTraumaNightmares) {
    suggestedMedications.push({
      medId: 'prazosin',
      reasonEn: 'Prazosin is the evidence-based treatment of choice for trauma-related nightmares, nocturnal PTSD symptoms, and autonomic hyperarousal.',
      reasonEs: 'La prazosina es el tratamiento de elección basado en evidencia para pesadillas traumáticas, síntomas nocturnos de TEPT e hiperactivación autonómica.'
    });
  }

  if (hasAwakeningsAt2AM) {
    suggestedMedications.push({
      medId: 'doxepin_low_dose',
      reasonEn: 'Low-dose Doxepin (3-6 mg) specifically treats sleep maintenance insomnia (middle-of-the-night waking) without daytime sedation or dependence.',
      reasonEs: 'La doxepina en dosis bajas (3-6 mg) trata específicamente el insomnio de mantenimiento (despertares a mitad de la noche) sin sedación diurna ni dependencia.'
    });
  }

  if (suggestedMedications.length === 0) {
    suggestedMedications.push({
      medId: 'trazodone',
      reasonEn: 'Trazodone (25-50 mg) is the first-line non-controlled sleep restoration agent in recovery, increasing deep slow-wave delta sleep without addiction potential.',
      reasonEs: 'La trazodona (25-50 mg) es el fármaco no controlado de primera línea en recuperación, aumentando el sueño profundo delta sin potencial adictivo.'
    });
  }

  const selectedArch = WITHDRAWAL_SLEEP_ARCHITECTURES.find(a => a.id === substanceId) || WITHDRAWAL_SLEEP_ARCHITECTURES[0];

  return {
    efficiency,
    efficiencyTierEn,
    efficiencyTierEs,
    efficiencyBadgeClass,
    selectedArch,
    primaryRecommendations,
    suggestedMedications
  };
}

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE INVARIANT)
// ============================================================================

let sleepState = {
  activeTab: 'calculator', // 'calculator' | 'medications' | 'cbti' | 'plan'
  substanceId: 'opioids',
  timeInBedHours: 8.0,
  totalSleepHours: 5.5,
  sleepLatencyMinutes: 45,
  hasRestlessLegs: false,
  hasTraumaNightmares: false,
  hasAwakeningsAt2AM: true,
  checklistWakeTime: false,
  checklistTwentyMin: false,
  checklistSunlight: false,
  checklistNoScreens: false
};

export function getSleepState() {
  return { ...sleepState };
}

export function setSleepState(patch = {}) {
  sleepState = { ...sleepState, ...patch };
}

export function resetSleepState() {
  sleepState = {
    activeTab: 'calculator',
    substanceId: 'opioids',
    timeInBedHours: 8.0,
    totalSleepHours: 5.5,
    sleepLatencyMinutes: 45,
    hasRestlessLegs: false,
    hasTraumaNightmares: false,
    hasAwakeningsAt2AM: true,
    checklistWakeTime: false,
    checklistTwentyMin: false,
    checklistSunlight: false,
    checklistNoScreens: false
  };
}

// ============================================================================
// BILINGUAL PLAIN-TEXT SUMMARY GENERATOR (ZERO-PII)
// ============================================================================

export function formatSleepSummaryText(state = sleepState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateSleepProfile(state);

  const lines = [];
  lines.push(isEs ? '=== EVALUACIÓN Y PLAN DE RESTAURACIÓN DEL SUEÑO EN RECUPERACIÓN DE HARBORPATH ===' : '=== HARBORPATH SLEEP RESTORATION & RECOVERY PLAN ===');
  lines.push(isEs ? `Fecha de generación: ${new Date().toISOString().split('T')[0]}` : `Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push(isEs ? 'Privacidad: En memoria RAM efímera (Cero almacenamiento en disco/servidor)' : 'Privacy: In-RAM ephemeral state (Zero device storage / Zero PII)');
  lines.push('');
  lines.push(isEs ? `Sustancia principal: ${evalResult.selectedArch.nameEs}` : `Primary Substance: ${evalResult.selectedArch.nameEn}`);
  lines.push(isEs ? `Tiempo en cama: ${state.timeInBedHours} horas | Tiempo dormido: ${state.totalSleepHours} horas` : `Time in Bed: ${state.timeInBedHours} hrs | Time Asleep: ${state.totalSleepHours} hrs`);
  lines.push(isEs ? `Eficiencia de sueño calculada: ${evalResult.efficiency}% (${evalResult.efficiencyTierEs})` : `Calculated Sleep Efficiency: ${evalResult.efficiency}% (${evalResult.efficiencyTierEn})`);
  lines.push(isEs ? `Latencia para conciliar el sueño: ${state.sleepLatencyMinutes} minutos` : `Sleep-Onset Latency: ${state.sleepLatencyMinutes} minutes`);
  lines.push('');
  lines.push(isEs ? '--- RECOMENDACIONES CONDUCTUALES TCC-I ---' : '--- CORE CBT-I BEHAVIORAL PROTOCOLS ---');
  evalResult.primaryRecommendations.forEach((rec, i) => {
    lines.push(`${i + 1}. ${isEs ? rec.titleEs : rec.titleEn}`);
    lines.push(`   ${isEs ? rec.descEs : rec.descEn}`);
  });
  lines.push('');
  lines.push(isEs ? '--- OPCIONES FARMACOLÓGICAS NO CONTROLADAS PARA DIALOGAR CON SU MÉDICO ---' : '--- NON-CONTROLLED PHARMACOTHERAPY OPTIONS FOR CLINICIAN DISCUSSION ---');
  evalResult.suggestedMedications.forEach(med => {
    const medInfo = NON_CONTROLLED_SLEEP_MEDICATIONS.find(m => m.id === med.medId);
    if (medInfo) {
      lines.push(`* ${isEs ? medInfo.nameEs : medInfo.nameEn} (${isEs ? medInfo.doseEs : medInfo.doseEn})`);
      lines.push(`  ${isEs ? med.reasonEs : med.reasonEn}`);
    }
  });
  lines.push('');
  lines.push(isEs ? '--- ADVERTENCIA SOBRE SOMNÍFEROS CONTROLADOS ---' : '--- CONTROLLED SEDATIVE WARNING ---');
  lines.push(isEs ? CONTRAINDICATED_SEDATIVES_WARNING.summaryEs : CONTRAINDICATED_SEDATIVES_WARNING.summaryEn);
  lines.push('');
  lines.push(isEs ? 'Línea de Crisis y Suicidio: 988 | Emergencias: 911' : 'Suicide & Crisis Lifeline: 988 | Emergencies: 911');

  return lines.join('\n');
}

// ============================================================================
// MAIN VIEW COMPONENT (DOM RENDERING & ACCESSIBILITY)
// ============================================================================

export function sleepCareView() {
  const container = h('div', { class: 'sleep-care-view' });

  function render() {
    clear(container);
    const isEs = typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'es';
    const localState = getSleepState();
    const evalResult = evaluateSleepProfile(localState);

    // Header banner
    const header = h('header', { class: 'view-header' }, [
      h('div', { class: 'badge badge-info' }, [
        icon('heart'),
        h('span', {}, isEs ? 'Salud y Restauración del Sueño' : 'Sleep Health & Recovery Architecture')
      ]),
      h('h2', {}, isEs ? 'Navegador de Restauración del Sueño e Insomnio en Recuperación' : 'Sleep Restoration & Insomnia in Recovery Navigator'),
      h('p', { class: 'view-intro' }, isEs
        ? 'El insomnio es el predictor número 1 de recaída en la recuperación temprana. Conozca las fases de abstinencia aguda y prolongada (PAWS), protocolos de TCC-I basados en evidencia y alternativas farmacológicas no controladas y seguras con MOUD.'
        : 'Insomnia is the #1 predictor of relapse in early recovery. Understand acute and post-acute withdrawal (PAWS) sleep disruption, evidence-based CBT-I behavioral protocols, and non-controlled sleep pharmacotherapies safe with MOUD.')
    ]);

    // Navigation Tabs
    const tabsNav = h('nav', { class: 'tab-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Restauración del Sueño' : 'Sleep Tabs' }, [
      h('button', {
        class: `tab-btn ${localState.activeTab === 'calculator' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'calculator'),
        onclick: () => { setSleepState({ activeTab: 'calculator' }); render(); }
      }, isEs ? 'Calculadora de Eficiencia' : 'Efficiency Calculator'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'medications' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'medications'),
        onclick: () => { setSleepState({ activeTab: 'medications' }); render(); }
      }, isEs ? 'Fármacos No Controlados' : 'Non-Controlled Meds'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'cbti' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'cbti'),
        onclick: () => { setSleepState({ activeTab: 'cbti' }); render(); }
      }, isEs ? 'Protocolos TCC-I' : 'CBT-I Protocols'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'plan' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'plan'),
        onclick: () => { setSleepState({ activeTab: 'plan' }); render(); }
      }, isEs ? 'Plan de Sueño y Exportación' : 'Sleep Plan & Export')
    ]);

    let tabContent;
    switch (localState.activeTab) {
      case 'medications':
        tabContent = renderMedicationsTab(isEs);
        break;
      case 'cbti':
        tabContent = renderCbtiTab(isEs);
        break;
      case 'plan':
        tabContent = renderPlanTab(isEs, localState, evalResult, render);
        break;
      case 'calculator':
      default:
        tabContent = renderCalculatorTab(isEs, localState, evalResult, render);
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
// TAB 1: SLEEP EFFICIENCY CALCULATOR & PAWS TIMELINE
// ----------------------------------------------------------------------------

function renderCalculatorTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  // Inputs Section
  const inputCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? '1. Calcule su Eficiencia de Sueño y Fase de Abstinencia' : '1. Assess Sleep Efficiency & Withdrawal Phase'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Ajuste los valores para evaluar su eficiencia de sueño (tiempo dormido vs tiempo en cama) y recibir recomendaciones personalizadas de TCC-I.'
      : 'Adjust the values to evaluate your sleep efficiency (time asleep vs time in bed) and receive personalized CBT-I guidance.')
  ]);

  const formGrid = h('div', { class: 'sleep-form-grid' });

  // Substance dropdown
  const subLabel = h('label', { class: 'form-label' }, [
    h('span', {}, isEs ? 'Sustancia Principal en Recuperación:' : 'Primary Recovery Substance:'),
    h('select', {
      class: 'form-select',
      onchange: (e) => {
        setSleepState({ substanceId: e.target.value });
        reRender();
      }
    }, WITHDRAWAL_SLEEP_ARCHITECTURES.map(sub => {
      const opt = h('option', { value: sub.id }, isEs ? sub.nameEs.split('(')[0] : sub.nameEn.split('(')[0]);
      if (sub.id === localState.substanceId) opt.setAttribute('selected', 'selected');
      return opt;
    }))
  ]);
  formGrid.appendChild(subLabel);

  // Time in Bed
  const tibLabel = h('label', { class: 'form-label' }, [
    h('span', {}, isEs ? `Tiempo en Cama: ${localState.timeInBedHours} horas` : `Time in Bed: ${localState.timeInBedHours} hours`),
    h('input', {
      type: 'range',
      min: '4',
      max: '12',
      step: '0.5',
      value: String(localState.timeInBedHours),
      class: 'form-range',
      oninput: (e) => {
        setSleepState({ timeInBedHours: parseFloat(e.target.value) });
        reRender();
      }
    })
  ]);
  formGrid.appendChild(tibLabel);

  // Total Sleep Time
  const tstLabel = h('label', { class: 'form-label' }, [
    h('span', {}, isEs ? `Tiempo Realmente Dormido: ${localState.totalSleepHours} horas` : `Actual Time Asleep: ${localState.totalSleepHours} hours`),
    h('input', {
      type: 'range',
      min: '2',
      max: '12',
      step: '0.5',
      value: String(localState.totalSleepHours),
      class: 'form-range',
      oninput: (e) => {
        setSleepState({ totalSleepHours: parseFloat(e.target.value) });
        reRender();
      }
    })
  ]);
  formGrid.appendChild(tstLabel);

  // Checkbox symptoms
  const symptomsGroup = h('div', { class: 'symptoms-checkbox-group' }, [
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.hasTraumaNightmares,
        onchange: (e) => {
          setSleepState({ hasTraumaNightmares: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Pesadillas intensas, recuerdos traumáticos o TEPT' : 'Trauma nightmares, PTSD symptoms, or nocturnal panic')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.hasAwakeningsAt2AM,
        onchange: (e) => {
          setSleepState({ hasAwakeningsAt2AM: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Despertares nocturnos frecuentes (despertarse a las 2-4 AM sin poder dormir)' : 'Middle-of-night waking (awake at 2-4 AM unable to return to sleep)')
    ])
  ]);
  formGrid.appendChild(symptomsGroup);
  inputCard.appendChild(formGrid);

  // Results Output Card
  const resultCard = h('section', { class: 'card', 'aria-live': 'polite' }, [
    h('div', { class: 'flex-between' }, [
      h('h3', {}, isEs ? '2. Evaluación de Eficiencia y Cronograma PAWS' : '2. Sleep Efficiency Evaluation & PAWS Timeline'),
      h('span', { class: `badge ${evalResult.efficiencyBadgeClass}` }, `${evalResult.efficiency}% ${isEs ? 'Eficiencia' : 'Efficiency'}`)
    ]),
    h('p', { class: 'efficiency-summary' }, [
      h('strong', {}, isEs ? evalResult.efficiencyTierEs : evalResult.efficiencyTierEn),
      h('span', {}, isEs 
        ? ` — Pasa ${localState.timeInBedHours}h en cama para lograr ${localState.totalSleepHours}h de sueño real.`
        : ` — You spend ${localState.timeInBedHours}h in bed to achieve ${localState.totalSleepHours}h of actual sleep.`)
    ]),
    h('div', { class: 'paws-timeline-card' }, [
      h('h4', {}, [icon('activity'), h('span', {}, isEs ? 'Fase de Abstinencia Aguda:' : 'Acute Withdrawal Phase:')]),
      h('p', {}, isEs ? evalResult.selectedArch.acutePhaseEs : evalResult.selectedArch.acutePhaseEn),
      h('h4', { class: 'margin-top-sm' }, [icon('clock'), h('span', {}, isEs ? 'Fase Prolongada (PAWS):' : 'Protracted Withdrawal (PAWS):')]),
      h('p', {}, isEs ? evalResult.selectedArch.pawsPhaseEs : evalResult.selectedArch.pawsPhaseEn),
      h('div', { class: 'callout callout-info' }, [
        h('strong', {}, isEs ? 'Perla Clínica:' : 'Clinical Pearl:'),
        h('p', {}, isEs ? evalResult.selectedArch.clinicalPearlEs : evalResult.selectedArch.clinicalPearlEn)
      ])
    ])
  ]);

  if (evalResult.primaryRecommendations.length > 0) {
    const recsList = h('div', { class: 'recommendations-list' }, [
      h('h4', {}, isEs ? 'Protocolos Conductuales Inmediatos' : 'Immediate Behavioral Protocols'),
      h('ul', { class: 'bullet-list' }, evalResult.primaryRecommendations.map(r => {
        return h('li', {}, [
          h('strong', {}, isEs ? r.titleEs : r.titleEn),
          h('p', {}, isEs ? r.descEs : r.descEn)
        ]);
      }))
    ]);
    resultCard.appendChild(recsList);
  }

  wrapper.appendChild(inputCard);
  wrapper.appendChild(resultCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 2: NON-CONTROLLED MEDICATIONS
// ----------------------------------------------------------------------------

function renderMedicationsTab(isEs) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const warningCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? CONTRAINDICATED_SEDATIVES_WARNING.titleEs : CONTRAINDICATED_SEDATIVES_WARNING.titleEn),
    h('div', { class: 'callout callout-emergency' }, [
      h('strong', {}, isEs ? 'Peligro Crítico: Benzodiacepinas y Fármacos Z en Recuperación' : 'Critical Hazard: Benzodiazepines & Z-Drugs in Recovery'),
      h('p', {}, isEs ? CONTRAINDICATED_SEDATIVES_WARNING.summaryEs : CONTRAINDICATED_SEDATIVES_WARNING.summaryEn)
    ])
  ]);

  const medsList = h('div', { class: 'meds-grid' });
  NON_CONTROLLED_SLEEP_MEDICATIONS.forEach(med => {
    const card = h('article', { class: 'card med-card' }, [
      h('div', { class: 'flex-between' }, [
        h('h4', {}, isEs ? med.nameEs : med.nameEn),
        h('span', { class: 'badge badge-info' }, isEs ? med.doseEs.split('(')[0] : med.doseEn.split('(')[0])
      ]),
      h('p', { class: 'med-mechanism' }, [
        h('strong', {}, isEs ? 'Mecanismo: ' : 'Mechanism: '),
        h('span', {}, isEs ? med.mechanismEs : med.mechanismEn)
      ]),
      h('p', { class: 'med-advantages' }, [
        h('strong', {}, isEs ? 'Ventajas en Recuperación: ' : 'Recovery Advantages: '),
        h('span', {}, isEs ? med.advantagesEs : med.advantagesEn)
      ]),
      h('p', { class: 'med-side-effects text-muted' }, [
        h('strong', {}, isEs ? 'Efectos Secundarios: ' : 'Side Effects: '),
        h('span', {}, isEs ? med.sideEffectsEs : med.sideEffectsEn)
      ])
    ]);
    medsList.appendChild(card);
  });
  warningCard.appendChild(medsList);

  wrapper.appendChild(warningCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 3: CBT-I PROTOCOLS
// ----------------------------------------------------------------------------

function renderCbtiTab(isEs) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const introCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Terapia Cognitivo-Conductual para el Insomnio (TCC-I)' : 'Cognitive Behavioral Therapy for Insomnia (CBT-I)'),
    h('p', {}, isEs
      ? 'La TCC-I es el tratamiento de primera línea recomendado por el Colegio Americano de Médicos (ACP) para el insomnio crónico, superando a los fármacos sedantes a largo plazo sin riesgos de tolerancia ni sobredosis.'
      : 'CBT-I is the gold-standard first-line treatment for chronic insomnia recommended by the American College of Physicians (ACP), outperforming sedative medications long-term with zero tolerance or overdose risk.')
  ]);

  const protocolsList = h('div', { class: 'cbti-grid' });
  CBTI_PROTOCOLS.forEach(p => {
    const card = h('article', { class: 'card cbti-card' }, [
      h('h4', {}, isEs ? p.titleEs : p.titleEn),
      h('p', { class: 'cbti-summary' }, isEs ? p.summaryEs : p.summaryEn),
      h('ul', { class: 'bullet-list' }, (isEs ? p.rulesEs : p.rulesEn).map(rule => h('li', {}, rule)))
    ]);
    protocolsList.appendChild(card);
  });
  introCard.appendChild(protocolsList);

  wrapper.appendChild(introCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 4: SLEEP PLAN & EXPORT
// ----------------------------------------------------------------------------

function renderPlanTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const planCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Compromiso Conductual de Sueño Seguro en Recuperación' : 'Bedtime Recovery Sleep Agreement'),
    h('p', {}, isEs
      ? 'Marque sus compromisos nocturnos. Los datos se mantienen únicamente en la memoria RAM y se borran al cerrar o pulsar Salida Rápida.'
      : 'Select your nightly commitments. Data remains strictly in ephemeral RAM and clears on page close or Quick Exit.')
  ]);

  const checklist = h('div', { class: 'checklist-group' }, [
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistWakeTime,
        onchange: (e) => {
          setSleepState({ checklistWakeTime: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Hora fija de despertar: Me levantaré a la misma hora 7 días a la semana, sin importar cuánto dormí' : 'Fixed wake time: I will get out of bed at the exact same time 7 days a week regardless of sleep')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistTwentyMin,
        onchange: (e) => {
          setSleepState({ checklistTwentyMin: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Regla de 20 minutos: Saldré de la cama si sigo despierto tras 20 minutos y no daré vueltas' : '20-minute rule: I will leave bed if awake after 20 minutes and not toss and turn')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistSunlight,
        onchange: (e) => {
          setSleepState({ checklistSunlight: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Luz matutina: Recibiré 15-30 minutos de luz natural en los primeros 45 minutos tras despertar' : 'Morning sunlight: I will get 15-30 minutes of natural daylight within 45 minutes of waking')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistNoScreens,
        onchange: (e) => {
          setSleepState({ checklistNoScreens: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Apagado de pantallas: Desconectaré teléfonos y pantallas 2 horas antes de dormir' : 'Screen curfew: I will turn off phone and screens 2 hours before bed')
    ])
  ]);
  planCard.appendChild(checklist);

  // Plain Text Export Box
  const exportSection = h('section', { class: 'card export-section' }, [
    h('h3', {}, isEs ? 'Copia y Exportación de Resumen Seguro (Sin PII)' : 'Secure Summary Export (Zero PII)'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Genere y copie un resumen en texto plano para dialogar sobre alternativas de sueño no controladas con su médico tratante.'
      : 'Generate and copy a privacy-safe text summary to discuss non-controlled sleep options with your healthcare provider.')
  ]);

  const summaryText = formatSleepSummaryText(localState, isEs ? 'es' : 'en');
  const textArea = h('textarea', {
    class: 'summary-textarea',
    readonly: 'readonly',
    rows: 14,
    'aria-label': isEs ? 'Resumen de Restauración del Sueño' : 'Sleep Restoration Summary'
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
      resetSleepState();
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
  wrapper.appendChild(exportSection);
  return wrapper;
}
