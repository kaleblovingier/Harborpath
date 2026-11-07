// public/js/views/adhdCare.js
// HarborPath - ADHD, Neurodiversity & Co-Occurring Substance Use Navigator
// Clinical standards: WHO ASRS v1.1 Screener, ASAM/AAP ADHD & Addiction Guidelines,
// DEA Counterfeit Prescription Pill Warning, CADDRA Canadian ADHD Guidelines.
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY & PHARMACOTHERAPY DATA
// ============================================================================

export const ADHD_SUD_CONSENSUS = Object.freeze({
  titleEn: 'ADHD & Substance Use Recovery: Evidence vs. Myths',
  titleEs: 'TDAH y Recuperación de Adicciones: Evidencia vs. Mitos',
  mandateEn: 'CRITICAL CLINICAL CONSENSUS: Up to 25% to 30% of adults seeking treatment for substance use disorders meet diagnostic criteria for ADHD. Without diagnosis, individuals frequently turn to unregulated stimulants (methamphetamine, cocaine) or excessive caffeine as intuitive self-medication for chronic executive dysfunction, emotional dysregulation, and dopamine deficiency. Landmark longitudinal research shows that treating ADHD concurrently with addiction care REDUCES substance relapse by 30% to 50% and significantly enhances treatment retention.',
  mandateEs: 'CONSENSO CLÍNICO FUNDAMENTAL: Hasta un 25% a 30% de los adultos en tratamiento por adicciones cumplen criterios diagnósticos de TDAH. Sin diagnóstico, las personas con frecuencia recurren a estimulantes no regulados (metanfetamina, cocaína) o cafeína excesiva como automedicación intuitiva frente a la disfunción ejecutiva, desregulación emocional y deficiencia de dopamina. Estudios longitudinales demuestran que tratar el TDAH de forma concurrente con el tratamiento de adicciones REDUCE las recaídas en un 30% a 50% y mejora notablemente la retención terapéutica.',
  coreFacts: Object.freeze([
    {
      topicEn: 'The Dopamine Dilemma',
      topicEs: 'El Dilema de la Dopamina',
      detailEn: 'ADHD is rooted in prefrontal cortex dopamine and norepinephrine hypofunction. Restoring prefrontal neurotransmission enhances impulse control and decision-making, directly strengthening recovery.',
      detailEs: 'El TDAH tiene su origen en la hipofunción de dopamina y noradrenalina en la corteza prefrontal. Restablecer esta neurotransmisión fortalece el control de impulsos y la toma de decisiones, afianzando la recuperación.'
    },
    {
      topicEn: 'Prescriber Stigma & Self-Advocacy',
      topicEs: 'Estigma Médico y Autodefensa',
      detailEn: 'Patients with SUD history are frequently denied ADHD evaluations due to fear of diversion. Non-controlled non-stimulants and tamper-resistant prodrugs offer safe, highly effective first-line alternatives without abuse liability.',
      detailEs: 'A las personas con historial de adicciones a menudo se les niega la evaluación del TDAH por temor al abuso de fármacos. Los no estimulantes y los profármacos ofrecen alternativas seguras y muy eficaces sin riesgo de adicción.'
    },
    {
      topicEn: 'MOUD Compatibility',
      topicEs: 'Compatibilidad con MOUD',
      detailEn: 'All first-line non-stimulant and long-acting ADHD medications are fully compatible with buprenorphine, methadone, and naltrexone under clinical supervision.',
      detailEs: 'Todos los fármacos no estimulantes de primera línea y estimulantes de acción prolongada son plenamente compatibles con buprenorfina, metadona y naltrexona bajo supervisión médica.'
    }
  ])
});

export const ASRS_QUESTIONS = Object.freeze([
  {
    id: 'q1',
    promptEn: '1. How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    promptEs: '1. ¿Con qué frecuencia tiene dificultades para ultimar los detalles finales de un proyecto, una vez hechas las partes más difíciles?',
    sigThreshold: 2, // Sometimes (2), Often (3), Very Often (4)
    options: [
      { textEn: 'Never (0)', textEs: 'Nunca (0)', value: 0 },
      { textEn: 'Rarely (1)', textEs: 'Raramente (1)', value: 1 },
      { textEn: 'Sometimes (2) *', textEs: 'A veces (2) *', value: 2 },
      { textEn: 'Often (3) *', textEs: 'A menudo (3) *', value: 3 },
      { textEn: 'Very Often (4) *', textEs: 'Muy a menudo (4) *', value: 4 }
    ]
  },
  {
    id: 'q2',
    promptEn: '2. How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    promptEs: '2. ¿Con qué frecuencia tiene dificultades para ordenar las cosas cuando tiene que realizar una tarea que requiere organización?',
    sigThreshold: 2, // Sometimes (2), Often (3), Very Often (4)
    options: [
      { textEn: 'Never (0)', textEs: 'Nunca (0)', value: 0 },
      { textEn: 'Rarely (1)', textEs: 'Raramente (1)', value: 1 },
      { textEn: 'Sometimes (2) *', textEs: 'A veces (2) *', value: 2 },
      { textEn: 'Often (3) *', textEs: 'A menudo (3) *', value: 3 },
      { textEn: 'Very Often (4) *', textEs: 'Muy a menudo (4) *', value: 4 }
    ]
  },
  {
    id: 'q3',
    promptEn: '3. How often do you have problems remembering appointments or obligations?',
    promptEs: '3. ¿Con qué frecuencia tiene problemas para recordar citas o compromisos?',
    sigThreshold: 2, // Sometimes (2), Often (3), Very Often (4)
    options: [
      { textEn: 'Never (0)', textEs: 'Nunca (0)', value: 0 },
      { textEn: 'Rarely (1)', textEs: 'Raramente (1)', value: 1 },
      { textEn: 'Sometimes (2) *', textEs: 'A veces (2) *', value: 2 },
      { textEn: 'Often (3) *', textEs: 'A menudo (3) *', value: 3 },
      { textEn: 'Very Often (4) *', textEs: 'Muy a menudo (4) *', value: 4 }
    ]
  },
  {
    id: 'q4',
    promptEn: '4. When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    promptEs: '4. Cuando tiene una tarea que requiere pensar mucho, ¿con qué frecuencia evita o retrasa empezarla?',
    sigThreshold: 3, // Often (3), Very Often (4)
    options: [
      { textEn: 'Never (0)', textEs: 'Nunca (0)', value: 0 },
      { textEn: 'Rarely (1)', textEs: 'Raramente (1)', value: 1 },
      { textEn: 'Sometimes (2)', textEs: 'A veces (2)', value: 2 },
      { textEn: 'Often (3) *', textEs: 'A menudo (3) *', value: 3 },
      { textEn: 'Very Often (4) *', textEs: 'Muy a menudo (4) *', value: 4 }
    ]
  },
  {
    id: 'q5',
    promptEn: '5. How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    promptEs: '5. ¿Con qué frecuencia mueve o retuerce las manos o los pies cuando tiene que permanecer sentado/a mucho tiempo?',
    sigThreshold: 3, // Often (3), Very Often (4)
    options: [
      { textEn: 'Never (0)', textEs: 'Nunca (0)', value: 0 },
      { textEn: 'Rarely (1)', textEs: 'Raramente (1)', value: 1 },
      { textEn: 'Sometimes (2)', textEs: 'A veces (2)', value: 2 },
      { textEn: 'Often (3) *', textEs: 'A menudo (3) *', value: 3 },
      { textEn: 'Very Often (4) *', textEs: 'Muy a menudo (4) *', value: 4 }
    ]
  },
  {
    id: 'q6',
    promptEn: '6. How often do you feel overly active and compelled to do things, like you were driven by a motor?',
    promptEs: '6. ¿Con qué frecuencia se siente demasiado activo/a e impulsado/a a hacer cosas, como si tuviera un motor adentro?',
    sigThreshold: 3, // Often (3), Very Often (4)
    options: [
      { textEn: 'Never (0)', textEs: 'Nunca (0)', value: 0 },
      { textEn: 'Rarely (1)', textEs: 'Raramente (1)', value: 1 },
      { textEn: 'Sometimes (2)', textEs: 'A veces (2)', value: 2 },
      { textEn: 'Often (3) *', textEs: 'A menudo (3) *', value: 3 },
      { textEn: 'Very Often (4) *', textEs: 'Muy a menudo (4) *', value: 4 }
    ]
  }
]);

export const ADHD_MEDICATION_TIERS = Object.freeze({
  tier1: Object.freeze({
    id: 'tier1',
    tierNameEn: 'Tier 1: Non-Controlled Non-Stimulants (Zero Abuse Liability)',
    tierNameEs: 'Nivel 1: Fármacos No Estimulantes No Controlados (Cero Potencial de Abuso)',
    summaryEn: 'Gold-standard initial choices for patients in active substance recovery or with history of stimulant use disorder. Non-scheduled, non-habit forming, and do not trigger dopamine surges in the reward center.',
    summaryEs: 'Elección de oro inicial para personas en recuperación activa o con antecedentes de adicción a estimulantes. No controlados, no generan dependencia y no provocan picos de dopamina en el centro de recompensa.',
    medications: Object.freeze([
      {
        nameEn: 'Atomoxetine (Strattera)',
        nameEs: 'Atomoxetina (Strattera)',
        classEn: 'Selective Norepinephrine Reuptake Inhibitor (SNRI)',
        classEs: 'Inhibidor Selectivo de la Recaptación de Noradrenalina (ISRN)',
        dosingEn: '40–100 mg once daily with food. Takes 4–8 weeks for full therapeutic effect.',
        dosingEs: '40–100 mg una vez al día con alimentos. Tarda 4 a 8 semanas en alcanzar eficacia plena.',
        advantagesEn: 'Zero euphoria; smooth 24-hour symptom coverage; reduces comorbid anxiety; fully compatible with buprenorphine, methadone, and naltrexone.',
        advantagesEs: 'Cero euforia; cobertura suave las 24 horas; reduce ansiedad comórbida; totalmente compatible con buprenorfina, metadona y naltrexona.',
        cautionsEn: 'Mild nausea/fatigue during first 2 weeks. Monitor resting heart rate and liver enzymes if preexisting hepatic disease.',
        cautionsEs: 'Náuseas leves o fatiga las primeras 2 semanas. Monitorear pulso y enzimas hepáticas si hay hepatopatía previa.'
      },
      {
        nameEn: 'Viloxazine ER (Qelbree)',
        nameEs: 'Viloxazina de Liberación Prolongada (Qelbree)',
        classEn: 'Selective Serotonin-Norepinephrine Modulating Agent',
        classEs: 'Modulador Selectivo de Serotonina y Noradrenalina',
        dosingEn: '200–600 mg daily. Faster onset than atomoxetine (often noticeable by weeks 2–4).',
        dosingEs: '200–600 mg al día. Inicio de acción más rápido que atomoxetina (apreciable en 2 a 4 semanas).',
        advantagesEn: 'Non-controlled; can be opened and sprinkled onto applesauce; proven efficacy in adult executive dysfunction.',
        advantagesEs: 'No controlado; la cápsula puede abrirse y rociarse sobre puré de manzana; eficacia demostrada en disfunción ejecutiva adulta.',
        cautionsEn: 'Strong CYP1A2 inhibitor: markedly increases caffeine and theophylline blood levels (reduce coffee intake).',
        cautionsEs: 'Inhibidor potente de CYP1A2: eleva significativamente los niveles de cafeína en sangre (reducir consumo de café).'
      },
      {
        nameEn: 'Guanfacine ER (Intuniv)',
        nameEs: 'Guanfacina de Liberación Prolongada (Intuniv)',
        classEn: 'Selective Alpha-2A Adrenergic Receptor Agonist',
        classEs: 'Agonista Selectivo de Receptores Adrenérgicos Alfa-2A',
        dosingEn: '1–4 mg once daily at bedtime.',
        dosingEs: '1–4 mg una vez al día antes de acostarse.',
        advantagesEn: 'Strengthens prefrontal cortical networks; dampens autonomic hyperarousal, rejection sensitivity dysphoria (RSD), and emotional impulsivity; helps post-withdrawal insomnia.',
        advantagesEs: 'Fortalece las redes de la corteza prefrontal; atenúa la hiperexcitabilidad autonómica, la disforia sensible al rechazo y la impulsividad; alivia el insomnio post-abstinencia.',
        cautionsEn: 'Drowsiness; lowers blood pressure and heart rate. Do not stop abruptly (risk of rebound hypertension).',
        cautionsEs: 'Somnolencia; disminuye presión arterial y frecuencia cardíaca. No suspender de golpe (riesgo de rebote hipertensivo).'
      },
      {
        nameEn: 'Bupropion XL (Wellbutrin XL)',
        nameEs: 'Bupropión de Liberación Prolongada (Wellbutrin XL)',
        classEn: 'Norepinephrine-Dopamine Reuptake Inhibitor (NDRI)',
        classEs: 'Inhibidor de la Recaptación de Dopamina y Noradrenalina (IRDN)',
        dosingEn: '150–300 mg once daily in the morning.',
        dosingEs: '150–300 mg una vez al día por la mañana.',
        advantagesEn: 'Non-controlled; dual benefit for co-occurring depressive symptoms and tobacco/nicotine cessation in recovery.',
        advantagesEs: 'No controlado; doble beneficio para depresión comórbida y cesación de tabaco/nicotina en recuperación.',
        cautionsEn: 'Lowers seizure threshold: CONTRAINDICATED in active alcohol/benzodiazepine withdrawal, bulimia, or seizure history.',
        cautionsEs: 'Reduce el umbral convulsivo: CONTRAINDICADO en abstinencia aguda de alcohol/benzodiazepinas, bulimia o epilepsia.'
      }
    ])
  }),
  tier2: Object.freeze({
    id: 'tier2',
    tierNameEn: 'Tier 2: Tamper-Resistant Long-Acting & Prodrug Stimulants (Low Misuse Potential)',
    tierNameEs: 'Nivel 2: Estimulantes de Liberación Prolongada y Profármacos Inalterables',
    summaryEn: 'Appropriate when non-stimulants provide incomplete response in stable, monitored recovery. Formulated to resist crushing, snorting, and injection, preventing rapid euphoria spikes.',
    summaryEs: 'Adecuados cuando los no estimulantes ofrecen respuesta incompleta en recuperación estable y monitoreada. Formulados para impedir trituración, aspiración o inyección, evitando picos rápidos de euforia.',
    medications: Object.freeze([
      {
        nameEn: 'Lisdexamfetamine (Vyvanse)',
        nameEs: 'Lisdexanfetamina (Vyvanse)',
        classEn: 'Enzymatically Activated Dextroamphetamine Prodrug',
        classEs: 'Profármaco de Dextroanfetamina Activado Enzimáticamente',
        dosingEn: '30–70 mg once daily in the morning.',
        dosingEs: '30–70 mg una vez al día por la mañana.',
        advantagesEn: 'Pharmacologically inactive until cleaved by red blood cell enzymes in the gastrointestinal tract and blood. Snorting or injecting does not hasten onset or produce immediate euphoria; smooth 12–14 hour duration.',
        advantagesEs: 'Farmacológicamente inactivo hasta ser hidrolizado por enzimas de glóbulos rojos en sangre. Inhalarlo o inyectarlo no acelera su efecto ni produce euforia inmediata; duración suave de 12 a 14 horas.',
        cautionsEn: 'Schedule II controlled substance; appetite suppression, insomnia if taken late; requires cardiovascular baseline check.',
        cautionsEs: 'Sustancia controlada Lista II; supresión del apetito, insomnio si se toma tarde; requiere control cardiovascular previo.'
      },
      {
        nameEn: 'OROS Methylphenidate (Concerta)',
        nameEs: 'Metilfenidato OROS (Concerta)',
        classEn: 'Osmotic-Controlled Release Oral Delivery System',
        classEs: 'Sistema de Liberación Osmótica Oral Controlada',
        dosingEn: '18–72 mg once daily in the morning.',
        dosingEs: '18–72 mg una vez al día por la mañana.',
        advantagesEn: 'Rigid laser-drilled polymer shell cannot be crushed into powder; delivers continuous osmotic precision over 12 hours with minimal peak-and-trough volatility.',
        advantagesEs: 'Cápsula de polímero indurada perforada por láser que no se puede triturar en polvo; libera dosis osmótica continua durante 12 horas con mínimos picos.',
        cautionsEn: 'Ghost shell passes intact in stool (normal); monitor blood pressure and pulse.',
        cautionsEs: 'La cápsula vacía se expulsa intacta en heces (normal); monitorear presión arterial y pulso.'
      }
    ])
  }),
  tier3: Object.freeze({
    id: 'tier3',
    tierNameEn: 'Tier 3: Immediate-Release Stimulants (High Misuse & Relapse Risk - AVOID in Early Recovery)',
    tierNameEs: 'Nivel 3: Estimulantes de Acción Inmediata (Alto Riesgo de Abuso y Recaída - EVITAR)',
    summaryEn: 'Immediate-release formulations (Adderall IR, Ritalin IR, Dexedrine IR) cause steep, rapid dopamine surges in the ventral striatum, precipitating psychological craving, bingeing, and severe crash dysphoria. Strongly discouraged in active SUD.',
    summaryEs: 'Las presentaciones de acción inmediata (Adderall IR, Ritalin IR) causan aumentos bruscos de dopamina en el estriado ventral, provocando deseos intensos, atracones y depresión de rebote. Fuertemente desaconsejados en adicciones activas.',
    medications: Object.freeze([])
  })
});

export const COUNTERFEIT_PILL_STANDARDS = Object.freeze({
  titleEn: 'DEA Public Safety Alert: Fake "Adderall" Pills Containing Lethal Fentanyl or Meth',
  titleEs: 'Alerta de Seguridad Pública de la DEA: Pastillas Falsas de «Adderall» con Fentanilo Mortal o Metanfetamina',
  alertEn: 'CRITICAL LIFE SAFETY WARNING: Over 7 out of 10 fake prescription pills seized nationwide by the DEA contain a lethal dose of illicit fentanyl or nitazenes. Counterfeit orange/peach pills stamped "d 30", "dp 30", or "b 974" sold on social media or street markets almost NEVER contain prescription amphetamine. Ingesting a single counterfeit Adderall tablet can cause fatal opioid respiratory arrest in a stimulant user with zero opioid tolerance.',
  alertEs: 'ADVERTENCIA CRÍTICA DE SEGURIDAD: Más de 7 de cada 10 pastillas recetadas falsificadas incautadas por la DEA contienen una dosis letal de fentanilo o nitazenos. Las pastillas de color naranja o melocotón marcadas como «d 30», «dp 30» o «b 974» vendidas en redes sociales o la calle casi NUNCA contienen anfetamina farmacéutica. Ingerir una sola pastilla falsa puede causar un paro respiratorio mortal por opioides en una persona sin tolerancia a opioides.',
  testingRules: Object.freeze([
    {
      stepEn: '1. Crush Entire Tablet Thoroughly',
      stepEs: '1. Triture la pastilla completa finamente',
      descEn: 'Fentanyl in counterfeit pressed pills is mixed unevenly ("chocolate chip cookie effect"). Testing a tiny scraping can yield a false negative while a lethal hot-spot sits in the rest of the pill.',
      descEs: 'El fentanilo en pastillas prensadas se distribuye de manera desigual («efecto galleta con chispas»). Probar solo un raspado puede dar un falso negativo mientras una dosis mortal permanece en el resto.'
    },
    {
      stepEn: '2. Exact Dilution Ratio to Prevent False Positives',
      stepEs: '2. Proporción exacta de dilución para evitar falsos positivos',
      descEn: 'For crushed pills, dissolve each 10 mg of pill mass in at least 1 teaspoon (5 mL) of clean water. Concentrated methamphetamine or binders can trigger false positives if over-concentrated.',
      descEs: 'Por cada 10 mg de pastilla triturada, disuelva en al menos 1 cucharadita (5 mL) de agua limpia. La metanfetamina muy concentrada o los excipientes pueden dar falsos positivos si no se diluye adecuadamente.'
    },
    {
      stepEn: '3. Test Strip Immersion & Interpretation',
      stepEs: '3. Inmersión de la tira reactiva e interpretación',
      descEn: 'Dip the test strip into the water for 15 seconds. Wait 2 to 5 minutes: ONE LINE = POSITIVE for fentanyl (DO NOT CONSUME); TWO LINES = NEGATIVE (test strip detected no fentanyl).',
      descEs: 'Sumerja la tira en el agua durante 15 segundos. Espere 2 a 5 minutos: UNA LÍNEA = POSITIVO para fentanilo (NO CONSUMIR); DOS LÍNEAS = NEGATIVO (no se detectó fentanilo).'
    },
    {
      stepEn: '4. Always Have Naloxone (Narcan) Present',
      stepEs: '4. Tenga siempre naloxona (Narcan) a mano',
      descEn: 'Even if testing negative, test strips cannot detect every novel synthetic opioid or tranquilizer. Keep Naloxone accessible and never use alone.',
      descEs: 'Incluso con resultado negativo, las tiras no detectan todos los opioides sintéticos nuevos. Mantenga naloxona accesible y nunca consuma a solas.'
    }
  ])
});

export const EXECUTIVE_FUNCTION_TOOLKIT = Object.freeze([
  {
    strategyId: 'time_blindness',
    titleEn: '1. Visual Time-Blindness Mitigators',
    titleEs: '1. Mitigadores Visuales de la Ceguera Temporal',
    descEn: 'ADHD brains process time as "now" vs. "not now." Replace digital numbers with visual analog countdown timers (Time Timer). Set progressive reminders 30, 15, and 5 minutes before scheduled appointments.',
    descEs: 'El cerebro con TDAH percibe el tiempo como «ahora» o «no ahora». Sustituya números digitales por temporizadores visuales analógicos (Time Timer). Programe alertas progresivas 30, 15 y 5 minutos antes.'
  },
  {
    strategyId: 'body_doubling',
    titleEn: '2. "Body Doubling" & Co-Working',
    titleEs: '2. Acompañamiento ("Body Doubling") y Co-Trabajo',
    descEn: 'Having a calm, supportive peer or clinician present in the same room (or on a video call) anchors attention and reduces the sensory friction of initiating overwhelming tasks.',
    descEs: 'Tener a un compañero de apoyo o profesional presente en la misma habitación (o por videollamada) fija la atención y reduce la resistencia al iniciar tareas que abruman.'
  },
  {
    strategyId: 'task_chunking',
    titleEn: '3. The "5-Minute Dopamine Micro-Step"',
    titleEs: '3. El «Micro-Paso de 5 Minutos» para Dopamina',
    descEn: 'Executive paralysis worsens when facing a complex task. Reframe the goal: commit ONLY to working for 300 seconds (e.g. open the intake form, write one sentence). Crossing the initiation threshold sparks endogenous dopamine.',
    descEs: 'La parálisis ejecutiva se intensifica ante tareas complejas. Redefina el objetivo: comprométase ÚNICAMENTE a trabajar durante 300 segundos (abrir el formulario, escribir una frase). Cruzar el inicio activa dopamina.'
  },
  {
    strategyId: 'sensory_decompression',
    titleEn: '4. Sensory Overload Decompression',
    titleEs: '4. Descompresión ante Sobrecarga Sensorial',
    descEn: 'ADHD sensory gating deficits can mimic manic agitation or acute craving. Use noise-canceling headphones, dim lighting, weighted blankets, and tactile fidget tools to calm sympathetic arousal.',
    descEs: 'Las dificultades de filtro sensorial en el TDAH pueden confundirse con agitación o deseos intensos. Use auriculares con cancelación de ruido, luz tenue y mantas pesadas para calmar el sistema nervioso.'
  }
]);

// ============================================================================
// EVALUATION ALGORITHMS & SCORING
// ============================================================================

/**
 * Calculates WHO ASRS-v1.1 Part A score
 * @param {Object} answers - Map of { q1: 0..4, q2: 0..4, ... }
 * @returns {Object}
 */
export function calculateAsrsScore(answers = {}) {
  let significantCount = 0;
  let totalScore = 0;

  ASRS_QUESTIONS.forEach((q) => {
    const val = Number(answers[q.id]) || 0;
    totalScore += val;
    if (val >= q.sigThreshold) {
      significantCount++;
    }
  });

  const isConsistent = significantCount >= 4;

  let tier = 'low_probability';
  let titleEn = 'Low Probability of Adult ADHD (0–1 Significant Symptoms)';
  let titleEs = 'Baja Probabilidad de TDAH Adulto (0–1 Síntomas Significativos)';
  let recommendationEn = 'Symptoms are infrequent. If executive or cognitive difficulties persist, evaluate sleep disorders, thyroid function, or chronic stress.';
  let recommendationEs = 'Los síntomas son infrecuentes. Si persisten dificultades ejecutivas o cognitivas, evalúe trastornos del sueño, tiroides o estrés crónico.';

  if (significantCount >= 4) {
    tier = 'high_probability';
    titleEn = `High Probability of Adult ADHD (${significantCount}/6 Significant Symptoms)`;
    titleEs = `Alta Probabilidad de TDAH Adulto (${significantCount}/6 Síntomas Significativos)`;
    recommendationEn = 'Clinical consensus indicates your symptom profile is highly consistent with adult ADHD. Comprehensive diagnostic evaluation by a psychiatrist or specialized prescriber is strongly recommended.';
    recommendationEs = 'El consenso clínico indica que su perfil es altamente compatible con TDAH adulto. Se recomienda encarecidamente una evaluación diagnóstica completa por psiquiatría o médico especialista.';
  } else if (significantCount >= 2) {
    tier = 'moderate_symptoms';
    titleEn = `Moderate Executive Symptoms (${significantCount}/6 Significant Symptoms)`;
    titleEs = `Síntomas Ejecutivos Moderados (${significantCount}/6 Síntomas Significativos)`;
    recommendationEn = 'Notable executive function and attention challenges. Consider formal clinical screening, especially if symptoms began in childhood or adolescence.';
    recommendationEs = 'Dificultades notables de atención y función ejecutiva. Considere evaluación clínica formal, en especial si los síntomas comenzaron en la infancia o adolescencia.';
  }

  return {
    significantCount,
    totalScore,
    isConsistent,
    tier,
    titleEn,
    titleEs,
    recommendationEn,
    recommendationEs
  };
}

/**
 * Evaluates holistic ADHD care pathway considering SUD history and MOUD
 * @param {Object} params
 * @returns {Object}
 */
export function evaluateAdhdCarePathway({
  asrsAnswers = {},
  sudHistory = 'remission', // 'active', 'remission', 'none'
  prescribedMoud = false,
  cardiacHistory = false,
  counterfeitPillRisk = false
} = {}) {
  const asrs = calculateAsrsScore(asrsAnswers);
  const alerts = [];

  let recommendedTier = 'tier1';
  let medicationGuidanceEn = 'Initiate Tier 1 Non-Controlled Non-Stimulants (Atomoxetine or Guanfacine ER) to safely treat executive dysfunction without abuse liability.';
  let medicationGuidanceEs = 'Iniciar Fármacos No Estimulantes de Nivel 1 (Atomoxetina o Guanfacina ER) para tratar la función ejecutiva de forma segura y sin potencial de abuso.';

  if (counterfeitPillRisk) {
    alerts.push({
      severity: 'critical',
      titleEn: 'CRITICAL WARNING: Counterfeit "Adderall" Fentanyl Danger',
      titleEs: 'ADVERTENCIA CRÍTICA: Peligro de Fentanilo en "Adderall" Falso',
      descEn: 'Unregulated prescription pills bought from street dealers or social media are overwhelmingly pressed with illicit fentanyl or methamphetamine. Testing with FTS and carrying Naloxone is mandatory.',
      descEs: 'Las pastillas recetadas no reguladas compradas en la calle o redes sociales están masivamente prensadas con fentanilo o metanfetamina. El uso de tiras FTS y portar naloxona es indispensable.'
    });
  }

  if (cardiacHistory) {
    alerts.push({
      severity: 'high',
      titleEn: 'Cardiovascular Precaution',
      titleEs: 'Precaución Cardiovascular',
      descEn: 'Preexisting cardiac arrhythmias, hypertension, or structural heart disease warrant baseline ECG and preference for non-stimulants with minimal sympathomimetic load (e.g. Guanfacine ER or low-dose Atomoxetine).',
      descEs: 'Antecedentes de arritmias, hipertensión o cardiopatía estructural requieren electrocardiograma basal y preferencia por no estimulantes con baja carga simpaticomimética (ej. Guanfacina ER).'
    });
  }

  if (prescribedMoud) {
    alerts.push({
      severity: 'info',
      titleEn: 'MOUD Co-Prescribing Compatibility',
      titleEs: 'Compatibilidad de Co-Prescripción con MOUD',
      descEn: 'Being on Buprenorphine, Methadone, or Naltrexone is NEVER a valid medical contraindication for treating ADHD. Treating ADHD improves MOUD treatment retention.',
      descEs: 'Estar en tratamiento con buprenorfina, metadona o naltrexona NUNCA es contraindicación para tratar el TDAH. Tratar el TDAH mejora la retención con MOUD.'
    });
  }

  if (sudHistory === 'remission' && asrs.isConsistent && !cardiacHistory) {
    medicationGuidanceEn = 'Tier 1 Non-Stimulants are primary. In well-established recovery with close prescriber oversight, Tier 2 Prodrugs (Lisdexamfetamine/Vyvanse) may be evaluated if non-stimulants yield insufficient response.';
    medicationGuidanceEs = 'Los no estimulantes de Nivel 1 son prioritarios. En recuperación consolidada y con supervisión estrecha, pueden evaluarse profármacos de Nivel 2 (Lisdexanfetamina/Vyvanse) si la respuesta es insuficiente.';
  }

  return {
    asrs,
    recommendedTier,
    medicationGuidanceEn,
    medicationGuidanceEs,
    alerts
  };
}

/**
 * Formats a plain-text clinical discussion proposal for prescriber appointments (Zero PII)
 * @param {Object} state - Ephemeral in-RAM state
 * @param {boolean} isEs - Spanish locale flag
 * @returns {string}
 */
export function formatAdhdClinicianProposalText(state = {}, isEs = false) {
  const asrs = calculateAsrsScore(state.asrsAnswers || {});
  const pathway = evaluateAdhdCarePathway({
    asrsAnswers: state.asrsAnswers || {},
    sudHistory: state.sudHistory,
    prescribedMoud: state.prescribedMoud,
    cardiacHistory: state.cardiacHistory,
    counterfeitPillRisk: state.counterfeitPillRisk
  });

  if (isEs) {
    return [
      '================================================================',
      'HARBORPATH - PROPUESTA DE EVALUACIÓN CLÍNICA DE TDAH Y RECUPERACIÓN',
      'Guía para Conversación con Médico Prescriptor o Psiquiatra',
      '================================================================',
      'AVISO DE PRIVACIDAD: Generado 100% en memoria RAM. Cero datos personales (PII).',
      '',
      '1. RESULTADOS DE LA ESCALA DE AUTOEVALUACIÓN ASRS v1.1 (PARTE A):',
      ` - Puntuación de síntomas significativos: ${asrs.significantCount}/6`,
      ` - Clasificación clínica: ${asrs.titleEs}`,
      ` - Conclusión del cribado: ${asrs.isConsistent ? 'Perfil altamente compatible con TDAH adulto' : 'Perfil no concluyente de TDAH adulto'}`,
      ` - Recomendación: ${asrs.recommendationEs}`,
      '',
      '2. HISTORIAL DE RECUPERACIÓN Y ESTRATIFICACIÓN FARMACOLÓGICA:',
      ` - Estado de recuperación de sustancias: ${state.sudHistory === 'active' ? 'Uso activo / en transición' : state.sudHistory === 'remission' ? 'En recuperación / remisión' : 'Sin antecedentes'}`,
      ` - Tratamiento con MOUD (Buprenorfina/Metadona/Naltrexona): ${state.prescribedMoud ? 'Sí (concurrente)' : 'No'}`,
      ` - Orientación de medicación propuesta: ${pathway.medicationGuidanceEs}`,
      '',
      '3. PREFERENCIAS DE TRATAMIENTO SEGURO:',
      ' - Preferencia por fármacos de Nivel 1 No Estimulantes (Atomoxetina, Viloxazina, Guanfacina ER).',
      ' - Si se consideran estimulantes en el futuro: Formulación exclusiva de profármaco inalterable (Lisdexanfetamina) o sistema osmótico (Concerta).',
      ' - Evitar totalmente formulaciones de liberación inmediata (Adderall IR, Ritalin IR).',
      '',
      '4. ACUERDO DE COLABORACIÓN Y ADHERENCIA:',
      ' - La persona usuaria solicita una evaluación formal diagnóstica para descartar o confirmar TDAH.',
      ' - Compromiso de seguimiento periódico, monitoreo de constantes vitales y apoyo conductual.',
      '================================================================'
    ].join('\n');
  }

  return [
    '================================================================',
    'HARBORPATH - CLINICAL ADHD & RECOVERY ASSESSMENT PROPOSAL',
    'Patient-Prescriber Discussion Brief (ASRS v1.1 & ASAM Standards)',
    '================================================================',
    'PRIVACY NOTICE: Generated in ephemeral memory. Zero PII stored or transmitted.',
    '',
    '1. WHO ASRS v1.1 PART A SCREENING RESULTS:',
    ` - Significant symptom count: ${asrs.significantCount}/6`,
    ` - Clinical classification: ${asrs.titleEn}`,
    ` - Screening conclusion: ${asrs.isConsistent ? 'Highly consistent with adult ADHD' : 'Non-conclusive for adult ADHD'}`,
    ` - Guidance: ${asrs.recommendationEn}`,
    '',
    '2. SUBSTANCE RECOVERY HISTORY & MEDICATION STRATIFICATION:',
    ` - Recovery status: ${state.sudHistory === 'active' ? 'Active use / early transition' : state.sudHistory === 'remission' ? 'In sustained recovery / remission' : 'None reported'}`,
    ` - Prescribed MOUD (Buprenorphine/Methadone/Naltrexone): ${state.prescribedMoud ? 'Yes (concurrent)' : 'No'}`,
    ` - Recommended pharmacotherapy tier: ${pathway.medicationGuidanceEn}`,
    '',
    '3. SAFE PHARMACOTHERAPY PREFERENCES:',
    ' - Patient specifically requests Tier 1 Non-Controlled Non-Stimulants (Atomoxetine, Viloxazine, Guanfacine ER).',
    ' - If stimulants are evaluated: Strict preference for tamper-resistant prodrugs (Lisdexamfetamine/Vyvanse) or osmotic OROS (Concerta).',
    ' - Absolute avoidance of immediate-release stimulants (Adderall IR, Ritalin IR).',
    '',
    '4. COLLABORATIVE PRESCRIBING AGREEMENT:',
    ' - Request for comprehensive clinical diagnostic evaluation for adult ADHD.',
    ' - Commitment to regular monitoring, objective symptom tracking, and executive coaching.',
    '================================================================'
  ].join('\n');
}

// ============================================================================
// IN-RAM EPHEMERAL STATE (ZERO PII, ZERO DEVICE STORAGE)
// ============================================================================

const defaultState = () => ({
  currentTab: 'screener', // 'screener' | 'medications' | 'counterfeits' | 'toolkit'
  asrsAnswers: {
    q1: 3,
    q2: 3,
    q3: 3,
    q4: 3,
    q5: 2,
    q6: 2
  },
  sudHistory: 'remission',
  prescribedMoud: true,
  cardiacHistory: false,
  counterfeitPillRisk: false
});

let adhdState = defaultState();

export function getAdhdState() {
  return { ...adhdState, asrsAnswers: { ...adhdState.asrsAnswers } };
}

export function setAdhdState(updates = {}) {
  if (updates.asrsAnswers) {
    adhdState.asrsAnswers = { ...adhdState.asrsAnswers, ...updates.asrsAnswers };
    delete updates.asrsAnswers;
  }
  adhdState = { ...adhdState, ...updates };
  return getAdhdState();
}

export function resetAdhdState() {
  adhdState = defaultState();
  return getAdhdState();
}

// ============================================================================
// DOM VIEW IMPLEMENTATION
// ============================================================================

export function adhdCareView() {
  const container = h('div', { class: 'container adhd-care-view' });
  let localState = getAdhdState();

  function render() {
    clear(container);
    const isEs = getLang() === 'es';

    // Breadcrumb
    const nav = h('nav', { class: 'breadcrumb', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/' }, isEs ? 'Inicio' : 'Home'),
      h('span', { 'aria-hidden': 'true' }, ' / '),
      h('a', { href: '#/tools' }, isEs ? 'Herramientas' : 'Care Tools'),
      h('span', { 'aria-hidden': 'true' }, ' / '),
      h('span', { 'aria-current': 'page' }, isEs ? 'TDAH y Neurodiversidad en Recuperación' : 'ADHD & Neurodiversity in Recovery')
    );
    container.appendChild(nav);

    // Header
    const header = h('header', { class: 'page-header' },
      h('h1', null, isEs ? 'Navegador de TDAH, Neurodiversidad y Medicación Segura' : 'ADHD, Neurodiversity & Safe Pharmacotherapy Navigator'),
      h('p', { class: 'lead' }, isEs
        ? 'Cribado validado ASRS v1.1, farmacoterapia no estimulante en recuperación, prevención de pastillas falsas de Adderall con fentanilo y caja de herramientas ejecutivas.'
        : 'Validated WHO ASRS v1.1 screener, evidence-based non-stimulant pharmacotherapy in SUD recovery, counterfeit pill fentanyl alerts, and executive function aids.')
    );
    container.appendChild(header);

    // Tab Bar
    const tabsContainer = h('div', { class: 'sub-nav-tabs', role: 'tablist', 'aria-label': isEs ? 'Pestañas de TDAH' : 'ADHD Care Tabs' });
    const tabDefs = [
      { id: 'screener', iconName: 'activity', labelEn: 'ASRS v1.1 Screener', labelEs: 'Cribado ASRS v1.1' },
      { id: 'medications', iconName: 'pill', labelEn: 'Medication Tiers in SUD', labelEs: 'Fármacos en Adicciones' },
      { id: 'counterfeits', iconName: 'shield', labelEn: 'Fake Adderall & FTS', labelEs: 'Pastillas Falsas y FTS' },
      { id: 'toolkit', iconName: 'check-circle', labelEn: 'Executive Toolkit', labelEs: 'Herramientas Ejecutivas' }
    ];

    tabDefs.forEach((tab) => {
      const isActive = localState.currentTab === tab.id;
      const tabBtn = h('button', {
        class: `sub-nav-tab-btn ${isActive ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(isActive),
        'aria-controls': `adhd-tab-${tab.id}`,
        id: `tab-btn-${tab.id}`,
        click: () => {
          localState = setAdhdState({ currentTab: tab.id });
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
      id: `adhd-tab-${localState.currentTab}`,
      role: 'tabpanel',
      'aria-labelledby': `tab-btn-${localState.currentTab}`,
      tabindex: '0'
    });

    if (localState.currentTab === 'screener') {
      tabContent.appendChild(renderScreenerTab(localState, isEs, () => render()));
    } else if (localState.currentTab === 'medications') {
      tabContent.appendChild(renderMedicationsTab(localState, isEs));
    } else if (localState.currentTab === 'counterfeits') {
      tabContent.appendChild(renderCounterfeitsTab(localState, isEs));
    } else if (localState.currentTab === 'toolkit') {
      tabContent.appendChild(renderToolkitTab(localState, isEs));
    }

    container.appendChild(tabContent);
  }

  render();
  return container;
}

// ============================================================================
// TAB RENDERERS
// ============================================================================

function renderScreenerTab(localState, isEs, reRender) {
  const wrapper = h('div', { class: 'adhd-tab-screener' });

  // Intro Card
  const introCard = h('div', { class: 'card' });
  introCard.appendChild(h('h2', null, isEs ? '1. Escala de Autoevaluación de TDAH en Adultos (OMS ASRS v1.1 Parte A)' : '1. Adult ADHD Self-Report Scale (WHO ASRS v1.1 Part A)'));
  introCard.appendChild(h('p', { class: 'lead' }, isEs
    ? 'Esta herramienta de 6 preguntas evalúa la frecuencia de dificultades de atención y función ejecutiva en los últimos 6 meses. Las respuestas permanecen exclusivamente en la memoria RAM.'
    : 'This 6-question screener evaluates frequency of executive function and inattention challenges over the past 6 months. All responses remain strictly in ephemeral RAM.'));
  wrapper.appendChild(introCard);

  // Questions Form Card
  const formCard = h('div', { class: 'card' });
  const questionsList = h('div', { class: 'asrs-questions-list' });

  ASRS_QUESTIONS.forEach((q) => {
    const qBox = h('div', { class: 'asrs-question-box' });
    qBox.appendChild(h('div', { class: 'asrs-prompt' }, isEs ? q.promptEs : q.promptEn));

    const optionsGrid = h('div', { class: 'asrs-options-grid' });
    const currentVal = Number(localState.asrsAnswers[q.id]) || 0;

    q.options.forEach((opt) => {
      const isSelected = currentVal === opt.value;
      const isSigOption = opt.value >= q.sigThreshold;
      const btn = h('button', {
        type: 'button',
        class: `asrs-opt-btn ${isSelected ? 'selected' : ''} ${isSigOption ? 'opt-significant' : ''}`,
        click: () => {
          localState = setAdhdState({
            asrsAnswers: { ...localState.asrsAnswers, [q.id]: opt.value }
          });
          reRender();
        }
      }, isEs ? opt.textEs : opt.textEn);
      optionsGrid.appendChild(btn);
    });

    qBox.appendChild(optionsGrid);
    questionsList.appendChild(qBox);
  });
  formCard.appendChild(questionsList);

  // Recovery Context Checkboxes
  const checkFieldset = h('fieldset', { class: 'form-fieldset mt-3' });
  checkFieldset.appendChild(h('legend', null, isEs ? 'Contexto Clínico de Recuperación:' : 'Recovery & Clinical Context:'));

  const makeCheck = (id, labelEn, labelEs, currentVal, key) => {
    const lbl = h('label', { class: 'checkbox-inline' });
    const chk = h('input', {
      type: 'checkbox',
      id,
      checked: Boolean(currentVal),
      change: (e) => {
        localState = setAdhdState({ [key]: e.target.checked });
        reRender();
      }
    });
    lbl.appendChild(chk);
    lbl.appendChild(h('span', null, ` ${isEs ? labelEs : labelEn}`));
    return lbl;
  };

  checkFieldset.appendChild(makeCheck('chk-moud', 'Currently prescribed MOUD (Buprenorphine, Methadone, or Naltrexone)', 'En tratamiento activo con MOUD (Buprenorfina, Metadona o Naltrexona)', localState.prescribedMoud, 'prescribedMoud'));
  checkFieldset.appendChild(makeCheck('chk-cardiac', 'History of cardiovascular disease, severe hypertension, or arrhythmia', 'Antecedentes de cardiopatía, hipertensión grave o arritmia', localState.cardiacHistory, 'cardiacHistory'));
  checkFieldset.appendChild(makeCheck('chk-counterfeit', 'Has used or obtained non-prescribed "Adderall" or pills from social media/street', 'Ha consumido o conseguido "Adderall" no recetado en la calle o redes', localState.counterfeitPillRisk, 'counterfeitPillRisk'));

  formCard.appendChild(checkFieldset);
  wrapper.appendChild(formCard);

  // Results Card
  const pathway = evaluateAdhdCarePathway(localState);
  const resultCard = h('div', { class: 'card result-card' });

  const resultHeader = h('div', { class: 'result-header-row' });
  resultHeader.appendChild(h('h2', null, isEs ? '2. Análisis Clínico de Síntomas' : '2. Clinical Symptom Analysis'));

  const badgeClass = pathway.asrs.isConsistent ? 'badge badge-warning' : 'badge badge-info';
  const badgeText = pathway.asrs.isConsistent
    ? (isEs ? 'PERFIL COMPATIBLE CON TDAH' : 'HIGH PROBABILITY PROFILE')
    : (isEs ? 'PERFIL NO CONCLUYENTE' : 'LOW/MODERATE SYMPTOMS');

  resultHeader.appendChild(h('span', { class: badgeClass }, badgeText));
  resultCard.appendChild(resultHeader);

  // Stat callout
  const statBox = h('div', { class: 'stat-box-row' });
  statBox.appendChild(h('div', { class: 'stat-item' },
    h('div', { class: 'stat-num' }, `${pathway.asrs.significantCount} / 6`),
    h('div', { class: 'stat-label' }, isEs ? 'Síntomas Significativos (Umbral ≥ 4)' : 'Significant Symptoms (Cutoff ≥ 4)')
  ));
  statBox.appendChild(h('div', { class: 'stat-item' },
    h('div', { class: 'stat-num' }, `${pathway.asrs.totalScore} / 24`),
    h('div', { class: 'stat-label' }, isEs ? 'Puntuación Bruta Total' : 'Raw Score Sum')
  ));
  resultCard.appendChild(statBox);

  // Recommendation Paragraph
  resultCard.appendChild(h('p', { class: 'lead mt-2' }, isEs ? pathway.asrs.recommendationEs : pathway.asrs.recommendationEn));

  // Alerts List
  if (pathway.alerts.length > 0) {
    const alertList = h('div', { class: 'alerts-stack' });
    pathway.alerts.forEach((alert) => {
      const aBox = h('div', { class: `alert-box alert-${alert.severity}` });
      aBox.appendChild(h('h3', null, isEs ? alert.titleEs : alert.titleEn));
      aBox.appendChild(h('p', null, isEs ? alert.descEs : alert.descEn));
      alertList.appendChild(aBox);
    });
    resultCard.appendChild(alertList);
  }

  wrapper.appendChild(resultCard);

  // Clinician Proposal Export Box
  const exportCard = h('div', { class: 'card export-card' });
  exportCard.appendChild(h('h2', null, isEs ? '3. Propuesta Estructurada para su Médico o Psiquiatra' : '3. Clinician Discussion Brief & Export'));
  exportCard.appendChild(h('p', null, isEs
    ? 'Comparta esta propuesta clara y respetuosa con su médico para solicitar una evaluación de TDAH sin temor a estigmatizaciones.'
    : 'Present this structured, respectful clinical brief to your healthcare provider to request an ADHD evaluation without fear of being labeled drug-seeking.'));

  const copyStatus = h('div', { class: 'copy-status-region', role: 'status', 'aria-live': 'polite' });
  const copyBtn = h('button', {
    class: 'btn btn-primary',
    click: async () => {
      const text = formatAdhdClinicianProposalText(localState, isEs);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          clear(copyStatus);
          copyStatus.appendChild(h('span', { class: 'text-success' }, isEs ? '✓ Propuesta copiada al portapapeles sin datos personales.' : '✓ Brief copied to clipboard (Zero PII).'));
        } else {
          clear(copyStatus);
          copyStatus.appendChild(h('span', null, isEs ? 'Seleccione y copie desde el cuadro inferior.' : 'Please copy from the text box below.'));
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
    formatAdhdClinicianProposalText(localState, isEs)
  );
  exportCard.appendChild(previewBox);
  wrapper.appendChild(exportCard);

  return wrapper;
}

function renderMedicationsTab(localState, isEs) {
  const wrapper = h('div', { class: 'adhd-tab-medications' });

  // Core Consensus Card
  const consensusCard = h('div', { class: 'card' });
  consensusCard.appendChild(h('h2', null, isEs ? ADHD_SUD_CONSENSUS.titleEs : ADHD_SUD_CONSENSUS.titleEn));
  consensusCard.appendChild(h('p', { class: 'lead' }, isEs ? ADHD_SUD_CONSENSUS.mandateEs : ADHD_SUD_CONSENSUS.mandateEn));

  const factGrid = h('div', { class: 'reassurance-grid' });
  ADHD_SUD_CONSENSUS.coreFacts.forEach((f) => {
    const box = h('div', { class: 'reassurance-box' });
    box.appendChild(h('h3', null, isEs ? f.topicEs : f.topicEn));
    box.appendChild(h('p', null, isEs ? f.detailEs : f.detailEn));
    factGrid.appendChild(box);
  });
  consensusCard.appendChild(factGrid);
  wrapper.appendChild(consensusCard);

  // Tier 1 Card
  const t1 = ADHD_MEDICATION_TIERS.tier1;
  const t1Card = h('div', { class: 'card' });
  t1Card.appendChild(h('div', { class: 'badge badge-success mb-2' }, isEs ? 'PRIMERA LÍNEA EN RECUPERACIÓN' : 'FIRST-LINE IN RECOVERY'));
  t1Card.appendChild(h('h2', null, isEs ? t1.tierNameEs : t1.tierNameEn));
  t1Card.appendChild(h('p', null, isEs ? t1.summaryEs : t1.summaryEn));

  const t1Grid = h('div', { class: 'comfort-meds-grid' });
  t1.medications.forEach((m) => {
    const box = h('div', { class: 'comfort-med-card' });
    box.appendChild(h('h3', null, isEs ? m.nameEs : m.nameEn));
    box.appendChild(h('div', { class: 'med-class-badge' }, isEs ? m.classEs : m.classEn));
    box.appendChild(h('p', null, h('strong', null, isEs ? 'Dosis habitual: ' : 'Typical Dosing: '), isEs ? m.dosingEs : m.dosingEn));
    box.appendChild(h('p', null, h('strong', null, isEs ? 'Ventajas en recuperación: ' : 'Recovery Advantages: '), isEs ? m.advantagesEs : m.advantagesEn));
    box.appendChild(h('p', { class: 'text-muted' }, h('strong', null, isEs ? 'Precauciones: ' : 'Cautions: '), isEs ? m.cautionsEs : m.cautionsEn));
    t1Grid.appendChild(box);
  });
  t1Card.appendChild(t1Grid);
  wrapper.appendChild(t1Card);

  // Tier 2 Card
  const t2 = ADHD_MEDICATION_TIERS.tier2;
  const t2Card = h('div', { class: 'card' });
  t2Card.appendChild(h('div', { class: 'badge badge-info mb-2' }, isEs ? 'SEGUNDA LÍNEA BAJO MONITOREO' : 'SECOND-LINE UNDER CLOSE MONITORING'));
  t2Card.appendChild(h('h2', null, isEs ? t2.tierNameEs : t2.tierNameEn));
  t2Card.appendChild(h('p', null, isEs ? t2.summaryEs : t2.summaryEn));

  const t2Grid = h('div', { class: 'comfort-meds-grid' });
  t2.medications.forEach((m) => {
    const box = h('div', { class: 'comfort-med-card' });
    box.appendChild(h('h3', null, isEs ? m.nameEs : m.nameEn));
    box.appendChild(h('div', { class: 'med-class-badge' }, isEs ? m.classEs : m.classEn));
    box.appendChild(h('p', null, h('strong', null, isEs ? 'Dosis habitual: ' : 'Typical Dosing: '), isEs ? m.dosingEs : m.dosingEn));
    box.appendChild(h('p', null, h('strong', null, isEs ? 'Ventajas contra manipulación: ' : 'Tamper-Resistant Features: '), isEs ? m.advantagesEs : m.advantagesEn));
    box.appendChild(h('p', { class: 'text-muted' }, h('strong', null, isEs ? 'Precauciones: ' : 'Cautions: '), isEs ? m.cautionsEs : m.cautionsEn));
    t2Grid.appendChild(box);
  });
  t2Card.appendChild(t2Grid);
  wrapper.appendChild(t2Card);

  // Tier 3 Warning Card
  const t3 = ADHD_MEDICATION_TIERS.tier3;
  const t3Card = h('div', { class: 'card card-danger-border' });
  t3Card.appendChild(h('h2', null, isEs ? t3.tierNameEs : t3.tierNameEn));
  t3Card.appendChild(h('p', { class: 'lead' }, isEs ? t3.summaryEs : t3.summaryEn));
  wrapper.appendChild(t3Card);

  return wrapper;
}

function renderCounterfeitsTab(localState, isEs) {
  const wrapper = h('div', { class: 'adhd-tab-counterfeits' });

  // DEA Warning Card
  const alertCard = h('div', { class: 'card card-danger-border' });
  alertCard.appendChild(h('div', { class: 'danger-badge-row' },
    icon('alert'),
    h('h2', null, isEs ? COUNTERFEIT_PILL_STANDARDS.titleEs : COUNTERFEIT_PILL_STANDARDS.titleEn)
  ));
  alertCard.appendChild(h('p', { class: 'lead' }, isEs ? COUNTERFEIT_PILL_STANDARDS.alertEs : COUNTERFEIT_PILL_STANDARDS.alertEn));
  wrapper.appendChild(alertCard);

  // FTS Pill Dilution Protocol Card
  const ftsCard = h('div', { class: 'card' });
  ftsCard.appendChild(h('h2', null, isEs ? 'Protocolo Exacto de Tiras Reactivas (FTS) para Pastillas Prensadas' : 'Exact Fentanyl Test Strip (FTS) Protocol for Pressed Pills'));
  ftsCard.appendChild(h('p', null, isEs
    ? 'Las pastillas falsas requieren trituración completa y una proporción de dilución precisa para evitar falsos negativos por grumos o falsos positivos por aglutinantes:'
    : 'Counterfeit pressed tablets require complete pulverization and exact water dilution to avoid false negatives from uneven mixing or false positives from binders:'));

  const stepsGrid = h('div', { class: 'crossover-stages-grid' });
  COUNTERFEIT_PILL_STANDARDS.testingRules.forEach((rule) => {
    const box = h('div', { class: 'stage-box' });
    box.appendChild(h('h3', null, isEs ? rule.stepEs : rule.stepEn));
    box.appendChild(h('p', null, isEs ? rule.descEs : rule.descEn));
    stepsGrid.appendChild(box);
  });
  ftsCard.appendChild(stepsGrid);
  wrapper.appendChild(ftsCard);

  // Cardiovascular Red Flags Card
  const emgCard = h('div', { class: 'card' });
  emgCard.appendChild(h('h2', null, isEs ? 'Signos de Emergencia Cardiovascular: Cuándo Llamar al 911' : 'Cardiovascular & Overamping Red Flags: When to Call 911'));

  const redFlags = [
    {
      titleEn: 'Severe Chest Pressure & Angina',
      titleEs: 'Opresión Torácica Severa y Angina',
      descEn: 'Crushing or radiating chest pain, shortness of breath, numbness in arm, or cyanosis. Call 911 immediately.',
      descEs: 'Dolor opresivo en el pecho que se irradia al brazo o mandíbula, asfixia o labios morados. Llame al 911 de inmediato.'
    },
    {
      titleEn: 'Hypertensive Encephalopathy',
      titleEs: 'Encefalopatía Hipertensiva',
      descEn: 'Extreme pounding headache, blurred or double vision, dizziness, nosebleed, or acute disorientation.',
      descEs: 'Dolor de cabeza pulsátil muy severo, visión borrosa o doble, mareos, sangrado nasal o desorientación aguda.'
    },
    {
      titleEn: 'Malignant Hyperthermia (> 103°F / 39.4°C)',
      titleEs: 'Hipertermia Maligna (> 103°F / 39.4°C)',
      descEn: 'Hot, dry skin without sweating, rigid muscles, extreme agitation, and delirium. Cool immediately with ice and call 911.',
      descEs: 'Piel caliente y seca sin sudor, rigidez muscular, delirio y confusión extrema. Enfríe de inmediato y llame al 911.'
    }
  ];

  const flagGrid = h('div', { class: 'red-flags-grid' });
  redFlags.forEach((rf) => {
    const box = h('div', { class: 'red-flag-item' });
    box.appendChild(h('h3', null, isEs ? rf.titleEs : rf.titleEn));
    box.appendChild(h('p', null, isEs ? rf.descEs : rf.descEn));
    flagGrid.appendChild(box);
  });
  emgCard.appendChild(flagGrid);
  wrapper.appendChild(emgCard);

  return wrapper;
}

function renderToolkitTab(localState, isEs) {
  const wrapper = h('div', { class: 'adhd-tab-toolkit' });

  // Intro Card
  const introCard = h('div', { class: 'card' });
  introCard.appendChild(h('h2', null, isEs ? 'Caja de Herramientas de Función Ejecutiva y Neurodiversidad' : 'Executive Function & Neurodiversity Recovery Toolkit'));
  introCard.appendChild(h('p', { class: 'lead' }, isEs
    ? 'Estrategias prácticas sin fármacos para mitigar la ceguera temporal, la parálisis de inicio y la sobrecarga sensorial en la vida cotidiana y la recuperación.'
    : 'Non-pharmacological, practical strategies designed for ADHD neurobiology to mitigate time blindness, initiation paralysis, and sensory overload in recovery.'));

  const tGrid = h('div', { class: 'toolkit-grid' });
  EXECUTIVE_FUNCTION_TOOLKIT.forEach((item) => {
    const box = h('div', { class: 'toolkit-box' });
    box.appendChild(h('h3', null, isEs ? item.titleEs : item.titleEn));
    box.appendChild(h('p', null, isEs ? item.descEs : item.descEn));
    tGrid.appendChild(box);
  });
  introCard.appendChild(tGrid);
  wrapper.appendChild(introCard);

  // Recovery Meeting Accommodations Card
  const meetingCard = h('div', { class: 'card' });
  meetingCard.appendChild(h('h2', null, isEs ? 'Adaptaciones para Reuniones de Recuperación (12 Pasos, SMART, Refugio)' : 'ADHD Accommodations in Recovery Meetings (12-Step, SMART, Refuge)'));
  meetingCard.appendChild(h('p', null, isEs
    ? 'Las salas de reuniones tradicionales pueden resultar agotadoras para mentes con TDAH. Pruebe estas adaptaciones sencillas:'
    : 'Traditional recovery meeting formats can challenge ADHD working memory and sensory regulation. Consider these accommodations:'));

  const meetingTips = [
    {
      titleEn: 'Tactile Fidget Tools',
      titleEs: 'Herramientas Fidget Táctiles',
      descEn: 'Quiet textured rings, putty, or smooth worry stones provide the mild kinetic stimulation necessary to sustain listening attention.',
      descEs: 'Anillos con textura, masilla suave o piedras de tacto aportan el estímulo cinético sutil necesario para mantener la atención.'
    },
    {
      titleEn: 'Permission to Doodle or Stand',
      titleEs: 'Permiso para Dibujar o Estar de Pie',
      descEn: 'Doodling or standing at the back of the room does not mean you are disengaged; it prevents postural restlessness from draining cognitive bandwidth.',
      descEs: 'Dibujar o permanecer de pie al fondo no significa desinterés; evita que el malestar postural consuma su capacidad mental.'
    },
    {
      titleEn: 'Virtual / Chat-Based Meetings',
      titleEs: 'Reuniones Virtuales con Chat',
      descEn: 'Online meetings allow turning off incoming video when sensory overload hits, or reading text shares to assist auditory processing delays.',
      descEs: 'Las reuniones virtuales permiten apagar la cámara ante sobrecarga sensorial o leer participaciones escritas para compensar lentitud auditiva.'
    }
  ];

  const mGrid = h('div', { class: 'reassurance-grid' });
  meetingTips.forEach((tip) => {
    const box = h('div', { class: 'reassurance-box' });
    box.appendChild(h('h3', null, isEs ? tip.titleEs : tip.titleEn));
    box.appendChild(h('p', null, isEs ? tip.descEs : tip.descEn));
    mGrid.appendChild(box);
  });
  meetingCard.appendChild(mGrid);
  wrapper.appendChild(meetingCard);

  return wrapper;
}
