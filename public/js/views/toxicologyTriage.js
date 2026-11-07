// public/js/views/toxicologyTriage.js
// HarborPath - Acute Toxicology Triage, Project BETA Crisis De-Escalation & SBAR Clinical Decision Support
// Clinical consensus: Hunter Serotonin Toxicity Criteria (Dunkley et al., 2003),
// American Association for Emergency Psychiatry (AAEP) Project BETA Agitation Guidelines (Richmond et al., 2012),
// Richmond Agitation-Sedation Scale (RASS; Sessler et al., 2002),
// CDC / SAMHSA 2024 Xylazine & Synthetic Opioid Adulteration Clinical Advisory,
// Emergency Medical Treatment and Labor Act (EMTALA, 42 U.S.C. § 1395dd).
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: 5 ACUTE TOXIDROME DIFFERENTIAL CONDITIONS
// ============================================================================

export const TOXICOLOGY_CONDITIONS = Object.freeze({
  opioid_xylazine: Object.freeze({
    id: 'opioid_xylazine',
    nameEn: 'Opioid & Alpha-2 Adrenergic (Xylazine / Medetomidine) Toxicity',
    nameEs: 'Toxicidad por opioides y agonistas alfa-2 (xilacina / medetomidina)',
    categoryEn: 'Opioid & Alpha-2 Adrenergic Sedative',
    categoryEs: 'Sedante opioide y agonista alfa-2 adrenérgico',
    severityTier: 'EMERGENCY_911',
    mechanismEn: 'Mu-opioid receptor agonism (fentanyl, carfentanil, nitazenes) coupled with central alpha-2 adrenergic receptor agonism (xylazine, medetomidine). Xylazine and medetomidine cause severe central nervous system depression, profound bradycardia, peripheral vasoconstriction, and prolonged refractory sedation that DOES NOT respond to naloxone.',
    mechanismEs: 'Agonismo del receptor opioide mu (fentanilo, nitazenos) acoplado con agonismo adrenérgico alfa-2 central (xilacina, medetomidina). Producen depresión profunda del SNC, bradicardia severa, vasoconstricción periférica y sedación refractaria que NO responde a la naloxona.',
    keySignsEn: Object.freeze([
      'Severe respiratory depression (< 8 breaths/min, agonal gasping, snoring/death rattle)',
      'Cyanosis (blue, purple, or gray lips, tongue, and fingernails)',
      'Profound unresponsiveness to loud shouting or firm sternal knuckle rub',
      'Pinpoint pupils (miosis, though may be dilated if mixed with stimulants)',
      'Severe bradycardia (< 50-60 bpm) and hypotension (faint peripheral pulse)',
      'Hypothermia (cold, clammy skin)',
      'Known or suspected xylazine ("tranq") or medetomidine exposure'
    ]),
    keySignsEs: Object.freeze([
      'Depresión respiratoria grave (< 8 respiraciones/min, boqueo agónico, estertor)',
      'Cianosis (labios, lengua o uñas azules, moradas o grisáceas)',
      'Inconsciencia profunda sin respuesta a la voz ni al frote esternal',
      'Pupilas puntiformes (miosis, o dilatadas si se mezcló con estimulantes)',
      'Bradicardia marcada (< 50-60 lpm) e hipotensión (pulso débil)',
      'Hipotermia (piel fría y húmeda)',
      'Exposición sospechada o confirmada a xilacina ("tranq") o medetomidina'
    ]),
    immediateActionEn: 'Call 911 immediately. Administer Naloxone (4 mg intranasal or 0.4-2 mg IM). Immediately begin rescue breathing (1 breath every 5 seconds). Naloxone reverses opioid respiratory arrest but will NOT reverse xylazine sedation; continue ventilatory support until spontaneous breathing (> 10-12/min) resumes.',
    immediateActionEs: 'Llame al 911 de inmediato. Administre naloxona (4 mg nasal o 0.4-2 mg IM). Inicie de inmediato respiración de rescate (1 insuflación cada 5 segundos). La naloxona revierte el paro respiratorio por opioides pero NO revierte la sedación por xilacina; continúe el soporte ventilatorio hasta que respire espontáneamente (> 10-12/min).'
  }),

  stimulant_overamp: Object.freeze({
    id: 'stimulant_overamp',
    nameEn: 'Stimulant Overamping (Physical Malignant vs Psychological)',
    nameEs: 'Sobreestimulación por estimulantes (física maligna vs psicológica)',
    categoryEn: 'Sympathomimetic Stimulant Toxicity',
    categoryEs: 'Toxicidad simpaticomimética por estimulantes',
    severityTier: 'EMERGENCY_911',
    mechanismEn: 'Massive catecholaminergic surge (dopamine, norepinephrine, serotonin reuptake blockade and vesicular release) from methamphetamine, cocaine, synthetic cathinones, or adulterated pressed pills. Induces extreme peripheral vasoconstriction, malignant hyperthermia, end-organ ischemia, and acute rhabdomyolysis.',
    mechanismEs: 'Liberación masiva de catecolaminas (bloqueo de recaptación de dopamina, noradrenalina y serotonina) por metanfetamina, cocaína o pastillas adulteradas. Induce vasoconstricción periférica extrema, hipertermia maligna, isquemia orgánica y rabdomiólisis aguda.',
    keySignsEn: Object.freeze([
      'PHYSICAL (LIFE-THREATENING): Core temperature > 104°F (40°C), crushing chest pain, extreme tachycardia (> 140 bpm), active seizures, muscle rigidity (suspected rhabdomyolysis)',
      'PSYCHOLOGICAL (DISTRESSING BUT NON-LETHAL): Extreme paranoia, acute panic, hypervigilance, racing thoughts, auditory hallucinations WITHOUT fever, chest pain, or seizures'
    ]),
    keySignsEs: Object.freeze([
      'FÍSICA (PELIGRO DE MUERTE): Temperatura > 104°F (40°C), dolor torácico opresivo, taquicardia (> 140 lpm), convulsiones, rigidez muscular (rabdomiólisis)',
      'PSICOLÓGICA (ANGUSTIANTE PERO NO LETAL): Paranoia severa, pánico agudo, hipervigilancia, pensamientos acelerados, alucinaciones auditivas SIN fiebre, dolor de pecho ni convulsiones'
    ]),
    immediateActionEn: 'If physical red flags (temp > 104°F, chest pain, seizures, rigidity) are present: Call 911 immediately. Initiate rapid external cooling (ice packs to axillae/groin/neck, misting + fan). AVOID physical restraints (struggling causes fatal rhabdomyolysis). If purely psychological: move to a cool, quiet, dim room; compassionate grounding and hydration.',
    immediateActionEs: 'Si hay signos físicos de alarma (temp > 104°F, dolor torácico, convulsiones, rigidez): Llame al 911 de inmediato. Inicie enfriamiento físico rápido (hielo en axilas, ingles y cuello). EVITE contenciones físicas (el forcejeo causa rabdomiólisis letal). Si es puramente psicológica: traslade a un espacio fresco, oscuro y silencioso; contención verbal y agua.'
  }),

  serotonin_syndrome: Object.freeze({
    id: 'serotonin_syndrome',
    nameEn: 'Serotonin Toxicity / Syndrome (Hunter Criteria with Clonus)',
    nameEs: 'Toxicidad serotoninérgica / Síndrome serotoninérgico (Criterios de Hunter con clono)',
    categoryEn: 'Serotonergic Hyperactivity & Neuromuscular Clonus',
    categoryEs: 'Hiperactividad serotoninérgica y clono neuromuscular',
    severityTier: 'EMERGENCY_911',
    mechanismEn: 'Excessive intrasynaptic 5-HT2A and 5-HT1A receptor overstimulation. Triggered by concomitant use of prescription serotonergic medications (SSRIs, SNRIs, MAOIs, TCAs, trazodone, dextromethorphan) with illicit substances or adulterants (MDMA, methamphetamine, cocaine, tramadol, fentanyl). Hallmark is neuromuscular clonus.',
    mechanismEs: 'Sobreestimulación excesiva de receptores 5-HT2A y 5-HT1A. Desencadenada por uso concomitante de antidepresivos (ISRS, IRSN, IMAO) con MDMA, estimulantes, tramadol o fentanilo adulterado. El signo cardinal patognomónico es el clono neuromuscular.',
    keySignsEn: Object.freeze([
      'Neuromuscular hallmark: Spontaneous clonus, inducible ankle clonus, or ocular roving clonus',
      'Inducible clonus WITH agitation OR diaphoresis (Hunter Criteria rule)',
      'Ocular clonus WITH agitation OR diaphoresis (Hunter Criteria rule)',
      'Tremor PLUS brisk hyperreflexia (brisk deep tendon reflexes)',
      'Hyperthermia (> 38°C / 100.4°F) WITH ocular clonus or inducible clonus',
      'Autonomic hyperactivity: drenching diaphoresis, dilated pupils (mydriasis), tachycardia, shivering, bowel hypermotility'
    ]),
    keySignsEs: Object.freeze([
      'Signo patognomónico: Clono espontáneo, clono inducible en tobillo o clono ocular',
      'Clono inducible CON agitación O diaforesis (Regla de Hunter)',
      'Clono ocular CON agitación O diaforesis (Regla de Hunter)',
      'Temblor MÁS hiperreflexia marcada (reflejos osteotendinosos aumentados)',
      'Hipertermia (> 38°C / 100.4°F) CON clono ocular o clono inducible',
      'Hiperactividad autonómica: sudoración profusa, pupilas dilatadas, taquicardia, escalofríos'
    ]),
    immediateActionEn: 'Discontinue all serotonergic agents immediately. Call 911 / transport to hospital under EMTALA. Check ankle clonus bedside. In hospital: administer benzodiazepines for neuromuscular hyperactivity, initiate active cooling for hyperthermia, and prepare cyproheptadine (5-HT2A antagonist) for severe cases. AVOID physical restraints.',
    immediateActionEs: 'Suspenda todos los agentes serotoninérgicos de inmediato. Llame al 911 o traslade a urgencias bajo EMTALA. Verifique clono en tobillo. En hospital: administre benzodiacepinas para calmar la hiperactividad neuromuscular, enfriamiento activo y ciproheptadina (antagonista 5-HT2A). EVITE contenciones físicas.'
  }),

  soft_tissue_sepsis: Object.freeze({
    id: 'soft_tissue_sepsis',
    nameEn: 'Soft Tissue Sepsis, Severe Necrotic Ulcers & Endocarditis',
    nameEs: 'Sepsis de tejidos blandos, úlceras necróticas graves y endocarditis',
    categoryEn: 'Infectious & Necrotic Vascular Emergency',
    categoryEs: 'Emergencia infecciosa y vascular necrótica',
    severityTier: 'URGENT_EVAL',
    mechanismEn: 'Invasive bacterial infection (MRSA, Group A Strep, polymicrobial anaerobes) secondary to non-sterile injection practices, or severe xylazine-induced alpha-2 microvascular vasoconstriction causing localized cutaneous tissue necrosis, deep fascial infection, septic shock, and hematogenous seeding to heart valves (infective endocarditis).',
    mechanismEs: 'Infección bacteriana invasiva (SARM, estreptococo, anaerobios) por inyecciones no estériles o vasoconstricción microvascular por xilacina que provoca necrosis cutánea profunda, fascitis necrosante, choque séptico y endocarditis infecciosa.',
    keySignsEn: Object.freeze([
      'Spreading skin erythema, warmth, and induration around wound or injection site',
      'Severe pain out of proportion to exam findings (cardinal sign of necrotizing fasciitis)',
      'Foul-smelling purulent drainage, subcutaneous gas or crackling feeling (crepitus)',
      'Black, necrotic eschar skin ulcers (characteristic of xylazine tissue hypoxia)',
      'High fevers accompanied by violent shaking chills (rigors)',
      'Systemic sepsis signs: low blood pressure, dizziness, confusion, cold mottled skin',
      'Splinter hemorrhages under fingernails, new heart murmur (endocarditis)'
    ]),
    keySignsEs: Object.freeze([
      'Enrojecimiento cutáneo expansivo, calor y endurecimiento en la herida o sitio de punción',
      'Dolor desproporcionado al examen físico (signo cardinal de fascitis necrosante)',
      'Drenaje purulento fétido, gas subcutáneo o crepitación al tacto',
      'Úlceras con escara negra necrótica (típicas de la hipoxia tisular por xilacina)',
      'Fiebre alta con escalofríos intensos y temblores violentos (bacteriemia)',
      'Signos de sepsis: hipotensión, mareo, confusión, piel moteada',
      'Hemorragias en astilla bajo las uñas, nuevo soplo cardíaco (endocarditis)'
    ]),
    immediateActionEn: 'If severe pain out of proportion, rigors, or low blood pressure are present: Call 911 immediately (surgical emergency for suspected necrotizing fasciitis / septic shock). For localized ulcers: urgent same-day medical evaluation. Under federal EMTALA (42 U.S.C. § 1395dd), emergency departments must evaluate and stabilize all patients regardless of insurance or substance use.',
    immediateActionEs: 'Si hay dolor desproporcionado, escalofríos violentos o hipotensión: Llame al 911 de inmediato (urgencia quirúrgica por fascitis necrosante o choque séptico). Para úlceras localizadas: evaluación médica urgente en el día. Bajo EMTALA (42 U.S.C. § 1395dd), urgencias debe evaluar y estabilizar sin importar seguro ni consumo.'
  }),

  substance_agitation: Object.freeze({
    id: 'substance_agitation',
    nameEn: 'Acute Substance-Induced Agitation, Delirium & Psychosis',
    nameEs: 'Agitación aguda, delirio y psicosis inducida por sustancias',
    categoryEn: 'Neuropsychiatric Agitation & Delirium',
    categoryEs: 'Agitación neuropsiquiátrica y delirio',
    severityTier: 'DE_ESCALATION',
    mechanismEn: 'Acute neurochemical disequilibrium resulting from high-dose sympathomimetics, synthetic cannabinoids, dissociatives (PCP/ketamine), central anticholinergic toxicity, or severe sedative-hypnotic/alcohol withdrawal delirium. The brain perceives benign stimuli as existential threats, activating extreme fight-or-flight motor output.',
    mechanismEs: 'Desequilibrio neuroquímico agudo por simpaticomiméticos a altas dosis, cannabinoides sintéticos, disociativos (PCP/ketamina), toxicidad anticolinérgica o delirio por abstinencia de alcohol/sedantes. El cerebro percibe el entorno como una amenaza existencial vital.',
    keySignsEn: Object.freeze([
      'Psychomotor agitation: pacing, inability to sit still, tense posture, clenched fists',
      'Paranoid delusions: believing staff, friends, or bystanders intend to harm or kill them',
      'Perceptual disturbances: auditory/visual hallucinations or tactile sensations (bugs on skin)',
      'Cognitive disorganization: racing speech, disorientation, fluctuating attention',
      'Autonomic signs varying by etiology (sympathomimetic diaphoresis vs anticholinergic dry skin vs dissociative nystagmus)',
      'Withdrawal delirium signs: coarse tremor, autonomic instability, clouding of consciousness'
    ]),
    keySignsEs: Object.freeze([
      'Agitación psicomotora: deambulación continua, incapacidad de sentarse, puños cerrados',
      'Delirios paranoides: creer que el personal o familiares intentan hacerle daño',
      'Alteraciones perceptivas: alucinaciones auditivas, visuales o táctiles ("insectos bajo la piel")',
      'Desorganización del pensamiento: habla apresurada, desorientación, atención fluctuante',
      'Signos autonómicos según causa (sudoración por estimulantes vs piel seca anticolinérgica vs nistagmo por PCP)',
      'Signos de abstinencia: temblor marcado, inestabilidad autonómica, obnubilación'
    ]),
    immediateActionEn: 'Implement Project BETA 10-domain verbal de-escalation immediately. Maintain 2 arm\'s lengths distance, designate ONE speaker, keep hands visible, and offer choices (water, seating, non-coercive oral calming medication). NEVER corner or trap the person. Physical restraints are strictly contraindicated unless immediate lethal violence threatens, as restraint-struggle causes fatal hyperthermia and rhabdomyolysis.',
    immediateActionEs: 'Aplique de inmediato los 10 dominios de desescalada verbal del Proyecto BETA. Mantenga 2 brazos de distancia, designe a UN solo interlocutor, manos visibles y ofrezca opciones (agua, asiento, medicación oral no coercitiva). NUNCA acorrale a la persona. Las contenciones físicas están estrictamente contraindicadas salvo agresión letal inminente, ya que provocan hipertermia fatal.'
  })
});

// ============================================================================
// RICHMOND AGITATION-SEDATION SCALE (RASS)
// ============================================================================

export const RASS_SCALE = Object.freeze([
  { score: 4, termEn: 'Combative', termEs: 'Combativo/a', descEn: 'Overtly combative, violent, immediate danger to staff and self', descEs: 'Francamente combativo/a, violento/a, peligro inmediato para el equipo o para sí', tier: 'critical' },
  { score: 3, termEn: 'Very Agitated', termEs: 'Muy agitado/a', descEn: 'Pulls at lines/monitors, physically aggressive gestures, shouting', descEs: 'Tira de vías o cables, gestos agresivos físicos, gritos continuos', tier: 'high' },
  { score: 2, termEn: 'Agitated', termEs: 'Agitado/a', descEn: 'Frequent non-purposeful movement, fights examiner, verbally uncooperative', descEs: 'Movimientos frecuentes sin propósito, confronta al examinador, no colabora', tier: 'moderate' },
  { score: 1, termEn: 'Restless', termEs: 'Inquieto/a', descEn: 'Anxious, apprehensive, movements not aggressive or vigorous', descEs: 'Ansioso/a, aprensivo/a, movimientos inquietos pero no agresivos', tier: 'mild' },
  { score: 0, termEn: 'Alert & Calm', termEs: 'Alerta y tranquilo/a', descEn: 'Spontaneously alert, attentive, calm baseline state', descEs: 'Alerta de forma espontánea, atento/a, estado basal tranquilo', tier: 'baseline' },
  { score: -1, termEn: 'Drowsy', termEs: 'Somnoliento/a', descEn: 'Not fully alert, awakens to voice with eye contact > 10 seconds', descEs: 'No totalmente alerta, despierta con la voz con contacto visual > 10 seg', tier: 'sedated' },
  { score: -2, termEn: 'Light Sedation', termEs: 'Sedación leve', descEn: 'Briefly awakens to voice with eye contact < 10 seconds', descEs: 'Despierta brevemente con la voz con contacto visual < 10 seg', tier: 'sedated' },
  { score: -3, termEn: 'Moderate Sedation', termEs: 'Sedación moderada', descEn: 'Any movement or eye opening to voice, but NO eye contact', descEs: 'Movimiento o apertura ocular con la voz, pero SIN contacto visual', tier: 'sedated' },
  { score: -4, termEn: 'Deep Sedation', termEs: 'Sedación profunda', descEn: 'No response to voice, opens eyes or moves only to physical stimulation', descEs: 'Sin respuesta a la voz, abre ojos o se mueve solo con estímulo físico', tier: 'critical_sedated' },
  { score: -5, termEn: 'Unarousable', termEs: 'Inconsciente / No reactivo/a', descEn: 'No response to voice or physical stimulation (evaluate for opioid/xylazine arrest)', descEs: 'Sin respuesta a la voz ni al estímulo físico (evaluar paro por opioide/xilacina)', tier: 'critical_sedated' }
]);

// ============================================================================
// PROJECT BETA 10-DOMAIN VERBAL DE-ESCALATION CONSENSUS (AAEP)
// ============================================================================

export const PROJECT_BETA_DOMAINS = Object.freeze([
  {
    domain: 1,
    titleEn: '1. Respect Personal Space',
    titleEs: '1. Respetar el espacio personal',
    rationaleEn: 'Agitated patients perceive closeness as an imminent attack. Maintaining distance preserves safety for both parties and reduces fight-or-flight panic.',
    rationaleEs: 'La persona agitada percibe la cercanía física como un ataque inminente. Mantener distancia previene la reacción de lucha o huida y protege a ambos.',
    doScriptEn: 'Maintain at least 2 arm\'s lengths (6 feet) distance. Keep an unobstructed path to the exit for BOTH yourself and the patient. Never corner them.',
    doScriptEs: 'Mantenga al menos 2 brazos de distancia (unos 2 metros). Deje siempre la salida despejada para USTED y para el PACIENTE. Jamás le acorrale.',
    dontScriptEn: 'Do not approach abruptly, touch without permission, crowd the room, or stand directly between the patient and the only door.',
    dontScriptEs: 'No se acerque de golpe, no le toque sin aviso, no llene la habitación de personas ni se interponga entre el paciente y la puerta.'
  },
  {
    domain: 2,
    titleEn: '2. Do Not Be Provocative',
    titleEs: '2. No provocar ni adoptar posturas defensivas',
    rationaleEn: 'Non-verbal cues account for most emotional communication during hyperarousal. Defensive posture signals hostility.',
    rationaleEs: 'El lenguaje corporal domina la comunicación en momentos de crisis. Posturas rígidas transmiten amenaza y desatan agresividad.',
    doScriptEn: 'Keep hands visible, relaxed, and open at waist level. Maintain a calm, neutral facial expression and keep body angled at 45 degrees rather than square.',
    doScriptEs: 'Mantenga las manos visibles, abiertas y relajadas a la altura de la cintura. Rostro sereno y cuerpo en ángulo de 45° en vez de confrontativo.',
    dontScriptEn: 'Do not cross arms, clench fists, place hands behind back, conceal hands in pockets, stare unblinkingly, or roll eyes.',
    dontScriptEs: 'No cruce los brazos, no cierre los puños, no esconda las manos en los bolsillos ni sostenga una mirada desafiante.'
  },
  {
    domain: 3,
    titleEn: '3. Establish Verbal Contact (Single Speaker)',
    titleEs: '3. Establecer contacto verbal (Un solo interlocutor)',
    rationaleEn: 'Multiple voices overwhelm cognitive processing and amplify paranoid distress. Only ONE designated responder should speak.',
    rationaleEs: 'Múltiples voces a la vez colapsan la mente y desatan pánico paranoide. Solo UNA persona designada debe hablar.',
    doScriptEn: '"Hello, my name is [Name]. I am part of the healthcare team here to keep you safe and comfortable. I will be the one talking with you today."',
    doScriptEs: '"Hola, me llamo [Nombre]. Soy del equipo de salud y mi única meta hoy es asegurarme de que esté a salvo y cómodo/a. Yo seré quien hable con usted."',
    dontScriptEn: 'Do not have multiple staff or family members talking, giving contradictory commands, or arguing in front of the patient.',
    dontScriptEs: 'Evite que varios familiares o trabajadores hablen a la vez, den órdenes contradictorias o discutan entre sí ante el paciente.'
  },
  {
    domain: 4,
    titleEn: '4. Be Concise & Use Simple Language',
    titleEs: '4. Ser conciso/a y hablar con sencillez',
    rationaleEn: 'During acute neurochemical agitation, working memory and linguistic processing are severely impaired. Complex explanations fail.',
    rationaleEs: 'Bajo agitación química o psicosis, la memoria y el procesamiento lingüístico están saturados. Frases complejas causan confusión.',
    doScriptEn: 'Use short, clear sentences. Repeat key reassurances slowly: "You are safe here. We are going to help you get through this."',
    doScriptEs: 'Use oraciones breves y claras. Repita frases tranquilizadoras con voz pausada: "Está seguro/a aquí. Le ayudaremos a pasar este momento."',
    dontScriptEn: 'Do not give lengthy clinical lectures, explain complex administrative rules, or use technical medical jargon.',
    dontScriptEs: 'No dé discursos clínicos largos, no cite normas burocráticas complejas ni use términos médicos incomprensibles.'
  },
  {
    domain: 5,
    titleEn: '5. Identify Wants and Feelings',
    titleEs: '5. Identificar deseos y validar emociones',
    rationaleEn: 'Validating the person\'s emotional distress establishes an immediate therapeutic alliance without confirming delusions.',
    rationaleEs: 'Validar la angustia emocional de la persona crea una alianza terapéutica inmediata sin validar falsas creencias.',
    doScriptEn: '"I can see how overwhelming and frightening this feels right now. What is the most important thing I can do to help you feel safer?"',
    doScriptEs: '"Veo lo angustiante y aterrador que se siente esto ahora mismo. ¿Qué es lo más importante que puedo hacer ya para que se sienta más seguro/a?"',
    dontScriptEn: 'Do not invalidate: "Calm down, there is no reason to be upset," or "You are acting completely unreasonable."',
    dontScriptEs: 'No minimice: "Cálmese, no es para tanto", o "Está exagerando y portándose de forma irracional".'
  },
  {
    domain: 6,
    titleEn: '6. Listen Closely (Active Listening)',
    titleEs: '6. Escuchar atentamente (Escucha activa)',
    rationaleEn: 'People who feel genuinely heard experience an immediate decrease in sympathetic nervous system fight-or-flight output.',
    rationaleEs: 'Sentirse escuchado reduce de inmediato la descarga simpática de adrenalina y el impulso de confrontación.',
    doScriptEn: 'Paraphrase their core message: "What I hear you saying is that you feel trapped and you want people to back away. Let\'s make that happen."',
    doScriptEs: 'Parafrasee el mensaje clave: "Lo que le entiendo es que se siente atrapado/a y necesita que demos un paso atrás. Vamos a hacerlo."',
    dontScriptEn: 'Do not interrupt, dismiss their words, look away distractedly at your phone or chart, or tell them they are wrong.',
    dontScriptEs: 'No interrumpa, no desestime sus palabras, no mire el teléfono ni el expediente con desinterés.'
  },
  {
    domain: 7,
    titleEn: '7. Agree or Agree to Disagree',
    titleEs: '7. Coincidir o acordar diferir sin discutir',
    rationaleEn: 'Directly arguing with paranoid delusions solidifies beliefs and casts the clinician as an enemy or persecutor.',
    rationaleEs: 'Discutir de frente contra un delirio afianza la creencia y sitúa al profesional o familiar en el rol de enemigo.',
    doScriptEn: '"I believe you that you are seeing shadows and feel terrified. I don\'t see them myself, but I promise you that my focus is keeping you safe here."',
    doScriptEs: '"Le creo plenamente que esto se siente aterrador. Yo no veo esas sombras, pero le prometo que mi único objetivo aquí es protegerle."',
    dontScriptEn: 'Never argue: "Nobody is trying to poison you, that is ridiculous," or debate factual reality in acute psychosis.',
    dontScriptEs: 'Jamás discuta: "Nadie le está envenenando, eso es un disparate", ni polemice sobre la realidad física durante la psicosis.'
  },
  {
    domain: 8,
    titleEn: '8. Set Clear, Safe Boundaries',
    titleEs: '8. Establecer límites claros y no punitivos',
    rationaleEn: 'Agitated individuals feel internal loss of control; calm, unambiguous external boundaries restore a sense of containment.',
    rationaleEs: 'La persona agitada siente una pérdida total de control interno; límites externos serenos y firmes transmiten contención.',
    doScriptEn: '"We want to help you feel better, but everyone here needs to stay safe. I cannot let you throw objects. Let\'s sit together and work through this."',
    doScriptEs: '"Queremos ayudarle a sentirse mejor, pero todos debemos estar seguros. No puedo permitir que arroje objetos. Tomemos asiento juntos y busquemos soluciones."',
    dontScriptEn: 'Do not issue ultimatums or threats: "If you don\'t sit down right now, security will come in and strap you to the bed."',
    dontScriptEs: 'No lance amenazas ni ultimátums: "Si no se sienta ya, llamo a seguridad para que lo ate a la camilla".'
  },
  {
    domain: 9,
    titleEn: '9. Offer Choices & Genuine Optimism',
    titleEs: '9. Ofrecer opciones y optimismo real',
    rationaleEn: 'Restoring autonomy counteracts feelings of coercion and panic. Genuine optimism reassures them that crisis is temporary.',
    rationaleEs: 'Recuperar la capacidad de elegir elimina la sensación de coerción. El optimismo sincero recuerda que el efecto pasará.',
    doScriptEn: '"Would you prefer to sit in the chair or couch? Would you like a cool glass of water or a blanket? We can also offer a mild calming medicine under your tongue."',
    doScriptEs: '"¿Prefiere sentarse en la silla o en el sillón? ¿Le gustaría un vaso de agua fresca o una manta? También tenemos una pastilla calmante suave para debajo de la lengua."',
    dontScriptEn: 'Do not force rigid demands or make hollow promises you cannot keep (e.g., promising immediate discharge when unsafe).',
    dontScriptEs: 'No imponga demandas rígidas ni haga promesas vacías que no pueda cumplir (como prometer el alta inmediata cuando no es seguro).'
  },
  {
    domain: 10,
    titleEn: '10. Debrief Patient and Care Team',
    titleEs: '10. Reflexionar y desahogar con el paciente y equipo',
    rationaleEn: 'Post-crisis debriefing repairs rapport, identifies early triggers for future care plans, and supports staff emotional recovery.',
    rationaleEs: 'La reflexión tras la crisis repara la confianza, detecta desencadenantes para futuros planes y cuida la salud emocional del equipo.',
    doScriptEn: '"Thank you for working through that difficult moment with me. What helped you most when you were feeling overwhelmed? What can we do better next time?"',
    doScriptEs: '"Gracias por colaborar conmigo en un momento tan difícil. ¿Qué fue lo que más le ayudó? ¿Qué podemos hacer mejor la próxima vez?"',
    dontScriptEn: 'Do not scold, lecture, shame, or re-penalize the patient once their mental clarity has returned.',
    dontScriptEs: 'No regañe, sermonee ni avergüence a la persona una vez que haya recuperado la calma.'
  }
]);

// ============================================================================
// CALMING PHARMACOTHERAPY MATRIX & RESTRAINT AVOIDANCE MANDATE
// ============================================================================

export const CALMING_PHARMACOTHERAPY_TIERS = Object.freeze({
  restraintMandate: Object.freeze({
    titleEn: 'CRITICAL MANDATE: Absolute Avoidance of Physical Restraints',
    titleEs: 'MANDATO CRÍTICO: Evitación absoluta de contenciones físicas',
    guidelineEn: 'Physical restraints are strictly contraindicated for acute substance-induced agitation unless immediate lethal physical violence is occurring and all verbal/pharmacologic options have failed. Isometric struggle against physical restraints in hyperadrenergic states dramatically elevates body temperature, accelerates acute rhabdomyolysis and severe lactic acidosis, triggers fatal cardiac dysrhythmias, and induces severe psychological trauma. Non-coercive oral calming medications and verbal de-escalation are the gold standard.',
    guidelineEs: 'Las contenciones físicas están estrictamente contraindicadas en agitación por sustancias salvo violencia letal inminente y fracaso de toda otra medida. El forcejeo isométrico contra ataduras en estados hiperadrenérgicos dispara la temperatura corporal, acelera la rabdomiólisis letal y acidosis láctica, provoca arritmias fatales y causa trauma grave. La medicación oral voluntaria y la desescalada verbal son el estándar de oro.'
  }),

  tier1OralSGA: Object.freeze({
    tier: 'Tier 1 (Preferred / First-Line)',
    nameEn: 'Oral Non-Coercive Second-Generation Antipsychotics (SGAs)',
    nameEs: 'Antipsicóticos de segunda generación orales no coercitivos',
    rationaleEn: 'Rapid onset, excellent calming efficacy with low incidence of extrapyramidal symptoms (EPS) or acute dystonia. Orally disintegrating tablets (ODT) melt under the tongue without requiring swallowing a large pill with water.',
    rationaleEs: 'Rápido inicio de acción, gran eficacia sedante con bajo riesgo de síntomas extrapiramidales. Las tabletas de desintegración oral (bucodispersables) se disuelven bajo la lengua sin forzar a tragar agua.',
    options: Object.freeze([
      {
        nameEn: 'Olanzapine Zydis (ODT)',
        nameEs: 'Olanzapina bucodispersable (Zydis)',
        dose: '5 mg to 10 mg PO/ODT',
        onset: '15-30 minutes',
        notesEn: 'First-line for severe agitation with paranoia or stimulant overamping. Rapid sublingual dissolution. Avoid simultaneous IV benzodiazepines due to synergy respiratory depression risk.',
        notesEs: 'Primera línea en agitación severa con paranoia o sobreestimulación. Disolución sublingual rápida. Evitar benzodiacepinas IV simultáneas por riesgo de depresión respiratoria sinérgica.'
      },
      {
        nameEn: 'Risperidone M-Tab (ODT)',
        nameEs: 'Risperidona bucodispersable (M-Tab)',
        dose: '1 mg to 2 mg PO/ODT',
        onset: '30-45 minutes',
        notesEn: 'Excellent calming for paranoid delusions with minimal heavy sedation. Very high patient acceptability in oral form.',
        notesEs: 'Excelente efecto ansiolítico en delirios paranoides sin sedación excesiva. Gran aceptación voluntaria por el paciente.'
      },
      {
        nameEn: 'Quetiapine (Immediate-Release)',
        nameEs: 'Quetiapina (liberación inmediata)',
        dose: '25 mg to 50 mg PO',
        onset: '30-45 minutes',
        notesEn: 'Gentle, non-coercive calming option for mild-to-moderate restlessness and panic when a lower-potency option is preferred.',
        notesEs: 'Opción calmante suave y respetuosa para inquietud leve a moderada o pánico cuando se prefiere una potencia moderada.'
      }
    ])
  }),

  tier2OralBenzo: Object.freeze({
    tier: 'Tier 2 (Sympathomimetic & Withdrawal Agitation)',
    nameEn: 'Oral / Sublingual Benzodiazepines',
    nameEs: 'Benzodiacepinas orales o sublinguales',
    rationaleEn: 'GABA-A allosteric modulators. Drug of choice for pure sympathomimetic toxicity (cocaine, methamphetamine), hyperthermia, seizures, or alcohol / benzodiazepine withdrawal agitation.',
    rationaleEs: 'Moduladores alostéricos GABA-A. Fármaco de primera elección en toxicidad simpaticomimética pura (cocaína, metanfetamina), hipertermia, convulsiones o agitación por abstinencia de alcohol o sedantes.',
    options: Object.freeze([
      {
        nameEn: 'Lorazepam (Ativan)',
        nameEs: 'Lorazepam (Ativan)',
        dose: '1 mg to 2 mg PO or Sublingual (SL)',
        onset: '15-30 minutes SL, 30-45 min PO',
        notesEn: 'Preferred benzodiazepine: reliable sublingual absorption, no active hepatic metabolites, safe in hepatic impairment. Controls neuromuscular hyperactivity.',
        notesEs: 'Benzodiacepina de preferencia: absorción sublingual fiable, sin metabolitos hepáticos activos, segura en disfunción hepática. Frena la hiperactividad motora.'
      },
      {
        nameEn: 'Diazepam (Valium)',
        nameEs: 'Diazepam (Valium)',
        dose: '5 mg to 10 mg PO',
        onset: '15-30 minutes',
        notesEn: 'Rapid oral onset with long-acting active metabolites. Useful for protracted sedative withdrawal agitation.',
        notesEs: 'Rápido inicio oral con metabolitos activos de acción prolongada. Útil en agitación prolongada por abstinencia de sedantes.'
      }
    ])
  }),

  tier3EmergencyParenteral: Object.freeze({
    tier: 'Tier 3 (Emergency Parenteral - Last Resort)',
    nameEn: 'Emergency Parenteral Regimens (Hospital Setting Only)',
    nameEs: 'Pautas parenterales de emergencia (Uso exclusivo hospitalario)',
    rationaleEn: 'Reserved strictly for life-threatening violence, acute excited delirium with hyperthermia (> 104°F), or complete refusal of oral medication with imminent physical peril.',
    rationaleEs: 'Reservado estrictamente para agresión física letal inminente, delirio agitado con hipertermia (> 104°F) o negativa total a medicación oral con riesgo físico grave.',
    options: Object.freeze([
      {
        nameEn: 'Haloperidol + Lorazepam ± Diphenhydramine ("B52" Protocol)',
        nameEs: 'Haloperidol + Lorazepam ± Difenhidramina (Protocolo "B52")',
        dose: 'Haloperidol 5 mg IM + Lorazepam 2 mg IM + Diphenhydramine 50 mg IM',
        onset: '15-30 minutes IM',
        notesEn: 'Gold standard emergency parenteral combination. Diphenhydramine blocks acute dystonic reactions and extrapyramidal symptoms.',
        notesEs: 'Combinación parenteral estándar de urgencias. La difenhidramina previene distonías agudas y síntomas extrapiramidales.'
      },
      {
        nameEn: 'Ketamine (IM / IV)',
        nameEs: 'Ketamina (IM / IV)',
        dose: '3 mg/kg to 4 mg/kg IM (or 1 mg/kg to 2 mg/kg IV slow)',
        onset: '3-5 minutes IM',
        notesEn: 'Reserved strictly for refractory excited delirium with extreme hyperthermia where immediate life rescue is required. Requires continuous pulse oximetry and advanced airway standby.',
        notesEs: 'Reservada estrictamente para delirio agitado refractario con hipertermia extrema y peligro de colapso cardiovascular. Requiere pulsioximetría continua y equipo de vía aérea listo.'
      }
    ])
  })
});

// ============================================================================
// CLINICAL TRIAGE SYMPTOMS LIST (30 CLINICALLY VETTED SYMPTOMS)
// ============================================================================

export const TRIAGE_SYMPTOMS = Object.freeze([
  // Respiratory / Opioid / Alpha-2
  { id: 'resp_slow', category: 'respiratory', labelEn: 'Breathing very slow or shallow (< 8 breaths/minute, gasping, death rattle)', labelEs: 'Respiración muy lenta o superficial (< 8 por minuto, boqueo agónico)', redFlag: true, weights: { opioid_xylazine: 4, stimulant_overamp: -2, serotonin_syndrome: -1, soft_tissue_sepsis: 0, substance_agitation: -2 } },
  { id: 'cyanosis', category: 'respiratory', labelEn: 'Blue, purple, pale, or ashen lips, gums, and fingernails (cyanosis)', labelEs: 'Labios, encías o uñas azules, moradas o pálidas (cianosis)', redFlag: true, weights: { opioid_xylazine: 4, stimulant_overamp: 0, serotonin_syndrome: 0, soft_tissue_sepsis: 1, substance_agitation: -1 } },
  { id: 'unresponsive', category: 'respiratory', labelEn: 'Unresponsive to loud shouting or firm knuckle rub on breastbone', labelEs: 'No responde al gritarle ni al frote firme con nudillos en el esternón', redFlag: true, weights: { opioid_xylazine: 4, stimulant_overamp: 0, serotonin_syndrome: 0, soft_tissue_sepsis: 1, substance_agitation: -2 } },
  { id: 'pinpoint_pupils', category: 'respiratory', labelEn: 'Pinpoint pupils (constricted miosis)', labelEs: 'Pupilas muy pequeñas (puntiformes / miosis)', redFlag: false, weights: { opioid_xylazine: 3, stimulant_overamp: -2, serotonin_syndrome: -1, soft_tissue_sepsis: 0, substance_agitation: -1 } },
  { id: 'bradycardia_faint_pulse', category: 'cardiovascular', labelEn: 'Very slow heart rate (< 50-60 bpm) or very faint/weak pulse', labelEs: 'Frecuencia cardíaca muy lenta (< 50-60 lpm) o pulso muy débil', redFlag: true, weights: { opioid_xylazine: 3, stimulant_overamp: -3, serotonin_syndrome: -2, soft_tissue_sepsis: 1, substance_agitation: -2 } },
  { id: 'hypothermia_cold', category: 'cardiovascular', labelEn: 'Cold, clammy skin or low body temperature (hypothermia)', labelEs: 'Piel fría y húmeda o temperatura corporal baja (hipotermia)', redFlag: false, weights: { opioid_xylazine: 2, stimulant_overamp: -2, serotonin_syndrome: -2, soft_tissue_sepsis: 0, substance_agitation: -1 } },
  { id: 'known_tranq_xylazine', category: 'context', labelEn: 'Suspected or confirmed xylazine ("tranq") or medetomidine in drug supply', labelEs: 'Sospecha o confirmación de xilacina ("tranq") o medetomidina', redFlag: false, weights: { opioid_xylazine: 4, stimulant_overamp: 0, serotonin_syndrome: 0, soft_tissue_sepsis: 2, substance_agitation: 0 } },

  // Stimulant / Sympathomimetic
  { id: 'hyperthermia_high', category: 'cardiovascular', labelEn: 'Extremely hot skin / fever (> 104°F / 40°C core temperature)', labelEs: 'Piel intensamente caliente / fiebre alta (> 104°F / 40°C)', redFlag: true, weights: { opioid_xylazine: -3, stimulant_overamp: 4, serotonin_syndrome: 4, soft_tissue_sepsis: 2, substance_agitation: 2 } },
  { id: 'chest_pain_crushing', category: 'cardiovascular', labelEn: 'Crushing chest pain, pressure, or tightness radiating to arm or jaw', labelEs: 'Dolor torácico opresivo, presión o pesadez irradiada a brazo o mandíbula', redFlag: true, weights: { opioid_xylazine: -1, stimulant_overamp: 4, serotonin_syndrome: 1, soft_tissue_sepsis: 0, substance_agitation: 0 } },
  { id: 'extreme_tachycardia', category: 'cardiovascular', labelEn: 'Pounding, racing heartbeat (> 140 bpm) or irregular palpitations', labelEs: 'Corazón acelerado o desbocado (> 140 lpm) o palpitaciones irregulares', redFlag: true, weights: { opioid_xylazine: -3, stimulant_overamp: 3, serotonin_syndrome: 2, soft_tissue_sepsis: 2, substance_agitation: 2 } },
  { id: 'seizures_active', category: 'neurological', labelEn: 'Active or recent convulsions / seizures', labelEs: 'Convulsiones activas o recientes', redFlag: true, weights: { opioid_xylazine: 1, stimulant_overamp: 4, serotonin_syndrome: 3, soft_tissue_sepsis: 0, substance_agitation: 1 } },
  { id: 'muscle_rigidity_lock', category: 'neurological', labelEn: 'Severe muscle rigidity, stiffness, or spasms (suspected rhabdomyolysis)', labelEs: 'Rigidez muscular intensa, dureza o espasmos (posible rabdomiólisis)', redFlag: true, weights: { opioid_xylazine: -2, stimulant_overamp: 3, serotonin_syndrome: 3, soft_tissue_sepsis: 0, substance_agitation: 1 } },

  // Serotonin Syndrome / Hunter Criteria
  { id: 'clonus_spontaneous', category: 'neurological', labelEn: 'Spontaneous rhythmic muscle clonus / jerking (Hunter hallmark)', labelEs: 'Clono muscular rítmico espontáneo (signo patognomónico de Hunter)', redFlag: true, weights: { opioid_xylazine: -2, stimulant_overamp: 0, serotonin_syndrome: 5, soft_tissue_sepsis: 0, substance_agitation: 0 } },
  { id: 'clonus_inducible', category: 'neurological', labelEn: 'Inducible ankle clonus (rhythmic beating when foot is pushed back)', labelEs: 'Clono inducible en tobillo (latidos rítmicos al empujar el pie hacia atrás)', redFlag: true, weights: { opioid_xylazine: -2, stimulant_overamp: 0, serotonin_syndrome: 4, soft_tissue_sepsis: 0, substance_agitation: 0 } },
  { id: 'clonus_ocular', category: 'neurological', labelEn: 'Ocular clonus (continuous involuntary slow/fast eye wandering or jerking)', labelEs: 'Clono ocular (movimientos errantes o rítmicos involuntarios en los ojos)', redFlag: true, weights: { opioid_xylazine: -2, stimulant_overamp: 0, serotonin_syndrome: 4, soft_tissue_sepsis: 0, substance_agitation: 0 } },
  { id: 'hyperreflexia_tremor', category: 'neurological', labelEn: 'Brisk hyperactive tendon reflexes PLUS visible tremors', labelEs: 'Reflejos tendinosos muy hiperactivos MÁS temblores evidentes', redFlag: false, weights: { opioid_xylazine: -2, stimulant_overamp: 1, serotonin_syndrome: 3, soft_tissue_sepsis: 0, substance_agitation: 1 } },
  { id: 'drenching_sweat', category: 'cardiovascular', labelEn: 'Drenching sweat (diaphoresis) with shivering or goosebumps', labelEs: 'Sudoración profusa (diaforesis) con escalofríos o piel de gallina', redFlag: false, weights: { opioid_xylazine: -2, stimulant_overamp: 2, serotonin_syndrome: 3, soft_tissue_sepsis: 1, substance_agitation: 1 } },
  { id: 'serotonergic_med_exposure', category: 'context', labelEn: 'Recent SSRI, SNRI, MAOI, TCA, or triptan combined with MDMA, meth, or opioid', labelEs: 'Uso reciente de antidepresivos (ISRS, IRSN) junto con MDMA, metanfetamina u opioide', redFlag: false, weights: { opioid_xylazine: 0, stimulant_overamp: 0, serotonin_syndrome: 4, soft_tissue_sepsis: 0, substance_agitation: 1 } },

  // Soft Tissue Sepsis & Endocarditis
  { id: 'pain_disproportion', category: 'soft_tissue', labelEn: 'Excruciating pain completely out of proportion to skin appearance (Necrotizing Fasciitis)', labelEs: 'Dolor atroz completamente desproporcionado al aspecto de la piel (Fascitis necrosante)', redFlag: true, weights: { opioid_xylazine: 0, stimulant_overamp: 0, serotonin_syndrome: 0, soft_tissue_sepsis: 5, substance_agitation: 0 } },
  { id: 'spreading_redness_heat', category: 'soft_tissue', labelEn: 'Rapidly spreading redness, swelling, and intense heat around skin/wound', labelEs: 'Enrojecimiento expansivo rápido, calor e inflamación en la herida', redFlag: false, weights: { opioid_xylazine: 0, stimulant_overamp: 0, serotonin_syndrome: 0, soft_tissue_sepsis: 3, substance_agitation: 0 } },
  { id: 'necrotic_black_ulcer', category: 'soft_tissue', labelEn: 'Black, dead tissue (necrotic eschar) or deep open ulcer (typical of xylazine)', labelEs: 'Tejido negro muerto (escara necrótica) o úlcera profunda (típico de xilacina)', redFlag: false, weights: { opioid_xylazine: 1, stimulant_overamp: 0, serotonin_syndrome: 0, soft_tissue_sepsis: 4, substance_agitation: 0 } },
  { id: 'shaking_rigors_chills', category: 'soft_tissue', labelEn: 'Violent shaking chills (rigors) and high fever (suspected bacteremia / sepsis)', labelEs: 'Escalofríos violentos y temblores con fiebre alta (sospecha de sepsis/bacteriemia)', redFlag: true, weights: { opioid_xylazine: -1, stimulant_overamp: 1, serotonin_syndrome: 1, soft_tissue_sepsis: 4, substance_agitation: 0 } },
  { id: 'septic_shock_hypotension', category: 'soft_tissue', labelEn: 'Low blood pressure, severe lightheadedness, pale mottled skin, and confusion', labelEs: 'Presión arterial muy baja, mareo intenso, piel moteada y confusión', redFlag: true, weights: { opioid_xylazine: 1, stimulant_overamp: 0, serotonin_syndrome: 0, soft_tissue_sepsis: 4, substance_agitation: 0 } },
  { id: 'splinter_hemorrhages_murmur', category: 'soft_tissue', labelEn: 'Dark streaks under fingernails (splinter hemorrhages) or new heart murmur (Endocarditis)', labelEs: 'Líneas oscuras bajo las uñas o nuevo soplo cardíaco (posible Endocarditis)', redFlag: false, weights: { opioid_xylazine: 0, stimulant_overamp: 0, serotonin_syndrome: 0, soft_tissue_sepsis: 3, substance_agitation: 0 } },

  // Acute Agitation, Psychosis & Delirium
  { id: 'severe_paranoia_delusions', category: 'behavioral', labelEn: 'Severe paranoia or persecutory delusions (believes people want to attack or poison them)', labelEs: 'Paranoia severa o delirios persecutorios (cree que van a atacarle o envenenarle)', redFlag: false, weights: { opioid_xylazine: -3, stimulant_overamp: 2, serotonin_syndrome: 1, soft_tissue_sepsis: 0, substance_agitation: 4 } },
  { id: 'psychomotor_agitation', category: 'behavioral', labelEn: 'Extreme motor restlessness, pacing, clenched fists, or threatening combative stance', labelEs: 'Inquietud motora extrema, deambulación, puños cerrados o postura amenazante', redFlag: false, weights: { opioid_xylazine: -3, stimulant_overamp: 2, serotonin_syndrome: 2, soft_tissue_sepsis: 0, substance_agitation: 4 } },
  { id: 'hallucinations_auditory_visual', category: 'behavioral', labelEn: 'Auditory or visual hallucinations (hearing menacing voices or seeing frightening things)', labelEs: 'Alucinaciones auditivas o visuales (escuchar voces amenazantes o ver sombras)', redFlag: false, weights: { opioid_xylazine: -2, stimulant_overamp: 2, serotonin_syndrome: 1, soft_tissue_sepsis: 0, substance_agitation: 3 } },
  { id: 'tactile_bugs_formication', category: 'behavioral', labelEn: 'Tactile hallucinations / feeling bugs crawling under skin (formication)', labelEs: 'Alucinaciones táctiles / sentir insectos caminando bajo la piel', redFlag: false, weights: { opioid_xylazine: -2, stimulant_overamp: 2, serotonin_syndrome: 0, soft_tissue_sepsis: 0, substance_agitation: 3 } },
  { id: 'anticholinergic_signs', category: 'behavioral', labelEn: 'Dry hot flushed skin with NO sweat in armpits, large non-reactive pupils (Anticholinergic)', labelEs: 'Piel roja, seca y muy caliente SIN sudor en axilas, pupilas dilatadas (Anticolinérgico)', redFlag: false, weights: { opioid_xylazine: -2, stimulant_overamp: 1, serotonin_syndrome: -1, soft_tissue_sepsis: 0, substance_agitation: 3 } },
  { id: 'withdrawal_tremor_delirium', category: 'behavioral', labelEn: 'Coarse whole-body shaking tremors with disorientation and sweating (Alcohol/Benzo withdrawal)', labelEs: 'Temblores intensos en todo el cuerpo con desorientación y sudor (Abstinencia alcohol/sedantes)', redFlag: false, weights: { opioid_xylazine: -2, stimulant_overamp: 1, serotonin_syndrome: 1, soft_tissue_sepsis: 0, substance_agitation: 4 } }
]);

// ============================================================================
// CLINICAL PRESETS FOR RAPID EMERGENCY EVALUATION
// ============================================================================

export const TOXICOLOGY_PRESETS = Object.freeze([
  {
    id: 'tranq_opioid',
    nameEn: 'Suspected Fentanyl & Tranq (Xylazine) Overdose',
    nameEs: 'Sospecha de sobredosis de fentanilo y tranq (xilacina)',
    descriptionEn: 'Deep unresponsiveness, slow gasping breath, blue lips, and slow weak pulse.',
    descriptionEs: 'Inconsciencia profunda, respiración lenta y agónica, labios morados y pulso débil.',
    symptoms: Object.freeze(['resp_slow', 'cyanosis', 'unresponsive', 'pinpoint_pupils', 'bradycardia_faint_pulse', 'known_tranq_xylazine']),
    rassScore: -5
  },
  {
    id: 'stimulant_hyperthermia',
    nameEn: 'Stimulant Malignant Hyperthermia & Chest Pain',
    nameEs: 'Hipertermia maligna por estimulantes y dolor torácico',
    descriptionEn: 'Extreme fever > 104°F, chest pain, pounding heart rate > 140 bpm, and rigid muscles.',
    descriptionEs: 'Fiebre extrema > 104°F, dolor de pecho, pulso acelerado > 140 lpm y músculos rígidos.',
    symptoms: Object.freeze(['hyperthermia_high', 'chest_pain_crushing', 'extreme_tachycardia', 'muscle_rigidity_lock', 'psychomotor_agitation']),
    rassScore: 3
  },
  {
    id: 'serotonin_storm',
    nameEn: 'Serotonin Syndrome (Hunter Criteria with Clonus)',
    nameEs: 'Síndrome serotoninérgico (Criterios de Hunter con clono)',
    descriptionEn: 'Spontaneous rhythmic clonus, hyperreflexia, drenching sweat, fever, and SSRI + MDMA exposure.',
    descriptionEs: 'Clono muscular rítmico espontáneo, hiperreflexia, sudor profuso, fiebre y antidepresivo + MDMA.',
    symptoms: Object.freeze(['clonus_spontaneous', 'clonus_inducible', 'hyperreflexia_tremor', 'drenching_sweat', 'hyperthermia_high', 'serotonergic_med_exposure']),
    rassScore: 2
  },
  {
    id: 'necrotizing_sepsis',
    nameEn: 'Necrotizing Fasciitis & Septic Shock',
    nameEs: 'Fascitis necrosante y choque séptico',
    descriptionEn: 'Excruciating pain out of proportion, spreading redness, black necrotic wound, and violent rigors.',
    descriptionEs: 'Dolor atroz desproporcionado, enrojecimiento expansivo, herida negra necrótica y escalofríos.',
    symptoms: Object.freeze(['pain_disproportion', 'spreading_redness_heat', 'necrotic_black_ulcer', 'shaking_rigors_chills', 'septic_shock_hypotension']),
    rassScore: 0
  },
  {
    id: 'agitated_psychosis',
    nameEn: 'Acute Agitated Psychosis & Persecutory Delirium',
    nameEs: 'Psicosis agitada aguda y delirio persecutorio',
    descriptionEn: 'Severe paranoia, pacing, clenched fists, hearing threatening voices, and tactile bugs.',
    descriptionEs: 'Paranoia severa, deambulación, puños cerrados, escuchar voces hostiles e insectos en piel.',
    symptoms: Object.freeze(['severe_paranoia_delusions', 'psychomotor_agitation', 'hallucinations_auditory_visual', 'tactile_bugs_formication']),
    rassScore: 3
  }
]);

// ============================================================================
// HUNTER SEROTONIN TOXICITY CRITERIA CHECKER
// ============================================================================

export function checkHunterSerotoninCriteria(selectedSymptoms = []) {
  const set = new Set(selectedSymptoms);
  const hasSpontaneousClonus = set.has('clonus_spontaneous');
  const hasInducibleClonus = set.has('clonus_inducible');
  const hasOcularClonus = set.has('clonus_ocular');
  const hasAgitation = set.has('psychomotor_agitation') || set.has('severe_paranoia_delusions');
  const hasDiaphoresis = set.has('drenching_sweat');
  const hasTremor = set.has('hyperreflexia_tremor') || set.has('withdrawal_tremor_delirium');
  const hasHyperreflexia = set.has('hyperreflexia_tremor');
  const hasHyperthermia = set.has('hyperthermia_high');

  // Decision rule 1: Spontaneous clonus alone
  if (hasSpontaneousClonus) {
    return { meetsCriteria: true, ruleEn: 'Spontaneous clonus (Hunter Criterion 1 - 100% pathognomonic)', ruleEs: 'Clono espontáneo (Criterio 1 de Hunter - patognomónico)' };
  }
  // Decision rule 2: Inducible clonus WITH agitation OR diaphoresis
  if (hasInducibleClonus && (hasAgitation || hasDiaphoresis)) {
    return { meetsCriteria: true, ruleEn: 'Inducible clonus WITH agitation or diaphoresis (Hunter Criterion 2)', ruleEs: 'Clono inducible CON agitación o diaforesis (Criterio 2 de Hunter)' };
  }
  // Decision rule 3: Ocular clonus WITH agitation OR diaphoresis
  if (hasOcularClonus && (hasAgitation || hasDiaphoresis)) {
    return { meetsCriteria: true, ruleEn: 'Ocular clonus WITH agitation or diaphoresis (Hunter Criterion 3)', ruleEs: 'Clono ocular CON agitación o diaforesis (Criterio 3 de Hunter)' };
  }
  // Decision rule 4: Tremor PLUS hyperreflexia
  if (hasTremor && hasHyperreflexia) {
    return { meetsCriteria: true, ruleEn: 'Tremor PLUS brisk hyperreflexia (Hunter Criterion 4)', ruleEs: 'Temblor MÁS hiperreflexia marcada (Criterio 4 de Hunter)' };
  }
  // Decision rule 5: Hyperthermia WITH ocular or inducible clonus
  if (hasHyperthermia && (hasOcularClonus || hasInducibleClonus)) {
    return { meetsCriteria: true, ruleEn: 'Hyperthermia WITH ocular or inducible clonus (Hunter Criterion 5)', ruleEs: 'Hipertermia CON clono ocular o inducible (Criterio 5 de Hunter)' };
  }

  return { meetsCriteria: false, ruleEn: 'Hunter criteria not met', ruleEs: 'No cumple criterios de Hunter' };
}

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateToxicologyTriage(state = {}) {
  const selectedSymptoms = Array.isArray(state.selectedSymptoms) ? state.selectedSymptoms : [];
  const rassScore = typeof state.rassScore === 'number' ? state.rassScore : 0;
  const set = new Set(selectedSymptoms);

  // 1. Calculate condition scores
  const conditionScores = {
    opioid_xylazine: 0,
    stimulant_overamp: 0,
    serotonin_syndrome: 0,
    soft_tissue_sepsis: 0,
    substance_agitation: 0
  };

  const activeRedFlags = [];

  TRIAGE_SYMPTOMS.forEach((sym) => {
    if (set.has(sym.id)) {
      if (sym.redFlag) activeRedFlags.push(sym);
      Object.entries(sym.weights).forEach(([condId, weight]) => {
        if (typeof conditionScores[condId] === 'number') {
          conditionScores[condId] += weight;
        }
      });
    }
  });

  // Hunter Criteria bonus for Serotonin Syndrome
  const hunterResult = checkHunterSerotoninCriteria(selectedSymptoms);
  if (hunterResult.meetsCriteria) {
    conditionScores.serotonin_syndrome += 6;
  }

  // Adjust for RASS score context
  if (rassScore <= -3) {
    conditionScores.opioid_xylazine += 3;
    conditionScores.substance_agitation -= 2;
  } else if (rassScore >= 2) {
    conditionScores.substance_agitation += 3;
    conditionScores.stimulant_overamp += 1;
  }

  // Rank conditions
  const ranked = Object.entries(conditionScores)
    .map(([id, rawScore]) => {
      const cond = TOXICOLOGY_CONDITIONS[id];
      const normalizedScore = Math.max(0, rawScore);
      return {
        id,
        condition: cond,
        rawScore,
        normalizedScore
      };
    })
    .sort((a, b) => b.normalizedScore - a.normalizedScore);

  const totalPositiveScore = ranked.reduce((acc, curr) => acc + curr.normalizedScore, 0);

  const rankedWithPct = ranked.map((item) => ({
    ...item,
    matchPercentage: totalPositiveScore > 0 ? Math.round((item.normalizedScore / totalPositiveScore) * 100) : 0
  }));

  const primaryCondition = rankedWithPct[0].normalizedScore > 0 ? rankedWithPct[0] : null;
  const secondaryCondition = (rankedWithPct[1] && rankedWithPct[1].normalizedScore > 0) ? rankedWithPct[1] : null;

  // Determine Overall Emergency Severity Level
  let severityLevel = 'LOW';
  if (activeRedFlags.length > 0 || (primaryCondition && primaryCondition.condition.severityTier === 'EMERGENCY_911')) {
    severityLevel = 'EMERGENCY_911';
  } else if (primaryCondition && primaryCondition.condition.severityTier === 'URGENT_EVAL') {
    severityLevel = 'URGENT_EVAL';
  } else if (primaryCondition && primaryCondition.condition.severityTier === 'DE_ESCALATION') {
    severityLevel = 'DE_ESCALATION';
  }

  // Determine Agitation De-escalation Urgency based on RASS
  let agitationUrgency = 'NONE';
  if (rassScore >= 3) agitationUrgency = 'CRITICAL_DEESCALATION';
  else if (rassScore >= 1) agitationUrgency = 'MODERATE_DEESCALATION';
  else if (rassScore <= -3) agitationUrgency = 'SEVERE_CNS_DEPRESSION';

  return {
    selectedSymptoms,
    activeRedFlags,
    hunterResult,
    conditionScores,
    rankedConditions: rankedWithPct,
    primaryCondition,
    secondaryCondition,
    severityLevel,
    rassScore,
    agitationUrgency
  };
}

// ============================================================================
// SBAR CLINICAL HANDOFF & NOTE GENERATOR (ZERO PII)
// ============================================================================

export function formatSbarClinicalHandoff(state = {}, isEs = false) {
  const pathway = evaluateToxicologyTriage(state);
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const selectedSymptoms = Array.isArray(state.selectedSymptoms) ? state.selectedSymptoms : [];
  const rassScore = typeof state.rassScore === 'number' ? state.rassScore : 0;
  const rassObj = RASS_SCALE.find((r) => r.score === rassScore) || RASS_SCALE[4];

  if (isEs) {
    let out = `================================================================================\n`;
    out += `RESUMEN CLÍNICO SBAR - TRIAGE TOXICOLÓGICO Y CRISIS DE AGITACIÓN (SIN DATOS PERSONALES)\n`;
    out += `Generado: ${now} UTC | HarborPath Clinical Decision Support\n`;
    out += `Marco Legal: EMTALA (42 U.S.C. § 1395dd) | Criterios de Hunter | Proyecto BETA\n`;
    out += `================================================================================\n\n`;

    out += `[S - SITUATION / SITUACIÓN CLÍNICA INMEDIATA]\n`;
    out += `Motivo de Triage: Sospecha de emergencia toxicológica o crisis neuropsiquiátrica aguda por sustancias.\n`;
    out += `Nivel de Severidad: ${pathway.severityLevel === 'EMERGENCY_911' ? 'EMERGENCIA MÉDICA INMEDIATA 911 / EMTALA' : (pathway.severityLevel === 'URGENT_EVAL' ? 'EVALUACIÓN MÉDICA URGENTE REQUERIDA' : 'DESESCALADA VERBAL Y SOPORTE CLÍNICO')}\n`;
    out += `Escala de Agitación-Sedación RASS: ${rassScore > 0 ? '+' : ''}${rassScore} (${rassObj.termEs} - ${rassObj.descEs})\n`;
    out += `Signos de Alarma Activos (${pathway.activeRedFlags.length}): ${pathway.activeRedFlags.length > 0 ? pathway.activeRedFlags.map((rf) => rf.labelEs).join('; ') : 'Ninguno marcado'}\n\n`;

    out += `[B - BACKGROUND / ANTECEDENTES Y EXPOSICIÓN]\n`;
    out += `Síntomas Seleccionados (${selectedSymptoms.length}):\n`;
    if (selectedSymptoms.length === 0) {
      out += `  - No se registraron síntomas específicos en la lista.\n`;
    } else {
      selectedSymptoms.forEach((sId) => {
        const item = TRIAGE_SYMPTOMS.find((s) => s.id === sId);
        if (item) out += `  - [${item.category.toUpperCase()}] ${item.labelEs}${item.redFlag ? ' (SIGNO DE ALARMA)' : ''}\n`;
      });
    }
    out += `Evaluación de Criterios de Hunter (Serotonina): ${pathway.hunterResult.meetsCriteria ? `POSITIVO (${pathway.hunterResult.ruleEs})` : 'Negativo / No cumple criterios'}\n\n`;

    out += `[A - ASSESSMENT / EVALUACIÓN DEL DIFERENCIAL TOXICOLÓGICO]\n`;
    out += `Diagnóstico Toxicológico Presuntivo Principal:\n`;
    if (pathway.primaryCondition) {
      out += `  1. ${pathway.primaryCondition.condition.nameEs} (${pathway.primaryCondition.matchPercentage}% correlación)\n`;
      out += `     Mecanismo Fisiopatológico: ${pathway.primaryCondition.condition.mechanismEs}\n`;
    } else {
      out += `  - Cuadro no concluyente. Requiere anamnesis exhaustiva y constantes vitales.\n`;
    }
    if (pathway.secondaryCondition) {
      out += `  2. Diagnóstico Diferencial Secundario: ${pathway.secondaryCondition.condition.nameEs} (${pathway.secondaryCondition.matchPercentage}% correlación)\n`;
    }
    out += `\n`;

    out += `[R - RECOMMENDATIONS / RECOMENDACIONES CLÍNICAS Y MANEJO]\n`;
    if (pathway.severityLevel === 'EMERGENCY_911') {
      out += `  * TRASLADO HOSPITALARIO INMEDIATO 911 bajo el mandato federal EMTALA.\n`;
    }
    if (pathway.primaryCondition && pathway.primaryCondition.id === 'opioid_xylazine') {
      out += `  * VÍA AÉREA Y VENTILACIÓN: Priorizar ventilación de rescate (1 cada 5 seg). La naloxona NO revierte la sedación por xilacina.\n`;
    }
    if (pathway.primaryCondition && pathway.primaryCondition.id === 'stimulant_overamp') {
      out += `  * ENFRIAMIENTO ACTIVO: Medir temperatura central. Si > 104°F (40°C), enfriamiento físico inmediato. Descartar rabdomiólisis.\n`;
    }
    out += `  * CONTENCIÓN FÍSICA: ESTRICTAMENTE CONTRAINDICADA. El forcejeo contra ataduras en hiperadrenergia causa rabdomiólisis fatal.\n`;
    out += `  * DESESCALADA VERBAL: Aplicar los 10 dominios del Proyecto BETA (2 brazos de distancia, interlocutor único, validar emociones).\n`;
    out += `  * FARMACOTERAPIA CALMANTE: Preferir antipsicótico oral voluntario (Olanzapina Zydis 5-10 mg bucodispersable o Risperidona M-Tab 1-2 mg) o Lorazepam 1-2 mg SL.\n`;
    out += `  * ESTUDIOS COMPLEMENTARIOS: ECG de 12 derivaciones, creatina quinasa (CK), electrolitos séricos, hemograma y cultivos si fiebre.\n`;
    out += `================================================================================\n`;
    out += `Aviso de Privacidad: Cero almacenamiento en dispositivo ni transmisión de datos. In-RAM exclusivamente.\n`;
    return out;
  }

  // English SBAR Note
  let out = `================================================================================\n`;
  out += `SBAR CLINICAL HANDOFF NOTE - ACUTE TOXICOLOGY & AGITATION TRIAGE (ZERO PII)\n`;
  out += `Generated: ${now} UTC | HarborPath Clinical Decision Support\n`;
  out += `Clinical Standards: EMTALA (42 U.S.C. § 1395dd) | Hunter Criteria | Project BETA\n`;
  out += `================================================================================\n\n`;

  out += `[S - SITUATION / IMMEDIATE CLINICAL STATUS]\n`;
  out += `Reason for Triage: Suspected acute toxicological emergency or substance-induced behavioral crisis.\n`;
  out += `Severity Level: ${pathway.severityLevel === 'EMERGENCY_911' ? 'IMMEDIATE 911 / EMTALA HOSPITAL EMERGENCY' : (pathway.severityLevel === 'URGENT_EVAL' ? 'URGENT SAME-DAY CLINICAL EVALUATION' : 'VERBAL DE-ESCALATION & SUPPORTIVE CARE')}\n`;
  out += `Richmond Agitation-Sedation Scale (RASS): ${rassScore > 0 ? '+' : ''}${rassScore} (${rassObj.termEn} - ${rassObj.descEn})\n`;
  out += `Active Red Flags (${pathway.activeRedFlags.length}): ${pathway.activeRedFlags.length > 0 ? pathway.activeRedFlags.map((rf) => rf.labelEn).join('; ') : 'None marked'}\n\n`;

  out += `[B - BACKGROUND / TOXICOLOGICAL EXPOSURE]\n`;
  out += `Reported Clinical Signs (${selectedSymptoms.length}):\n`;
  if (selectedSymptoms.length === 0) {
    out += `  - No specific checklist signs checked.\n`;
  } else {
    selectedSymptoms.forEach((sId) => {
      const item = TRIAGE_SYMPTOMS.find((s) => s.id === sId);
      if (item) out += `  - [${item.category.toUpperCase()}] ${item.labelEn}${item.redFlag ? ' (CRITICAL RED FLAG)' : ''}\n`;
    });
  }
  out += `Hunter Serotonin Toxicity Criteria: ${pathway.hunterResult.meetsCriteria ? `CRITERIA MET (${pathway.hunterResult.ruleEn})` : 'Negative / Criteria not met'}\n\n`;

  out += `[A - ASSESSMENT / DIFFERENTIAL TOXIDROME RANKING]\n`;
  out += `Primary Suspected Toxidrome:\n`;
  if (pathway.primaryCondition) {
    out += `  1. ${pathway.primaryCondition.condition.nameEn} (${pathway.primaryCondition.matchPercentage}% correlation)\n`;
    out += `     Pathophysiologic Mechanism: ${pathway.primaryCondition.condition.mechanismEn}\n`;
  } else {
    out += `  - Inconclusive presentation. Requires comprehensive bedside history and vitals.\n`;
  }
  if (pathway.secondaryCondition) {
    out += `  2. Secondary Differential: ${pathway.secondaryCondition.condition.nameEn} (${pathway.secondaryCondition.matchPercentage}% correlation)\n`;
  }
  out += `\n`;

  out += `[R - RECOMMENDATIONS / EVIDENCE-BASED ACTION PLAN]\n`;
  if (pathway.severityLevel === 'EMERGENCY_911') {
    out += `  * IMMEDIATE 911 EMS / EMTALA TRANSFER for medical stabilization.\n`;
  }
  if (pathway.primaryCondition && pathway.primaryCondition.id === 'opioid_xylazine') {
    out += `  * AIRWAY & RESCUE BREATHING: Prioritize bag-valve-mask or mouth-to-mouth (1 breath every 5s). Naloxone reverses opioid arrest but DOES NOT reverse alpha-2 xylazine sedation.\n`;
  }
  if (pathway.primaryCondition && pathway.primaryCondition.id === 'stimulant_overamp') {
    out += `  * RAPID COOLING & RHABDO PROTOCOL: Check core temperature immediately. If > 104°F, initiate active cooling. Draw stat CK and electrolytes.\n`;
  }
  out += `  * PHYSICAL RESTRAINTS: STRICTLY CONTRAINDICATED. Struggling against restraints in hyperadrenergic states causes fatal hyperthermia and rhabdomyolysis.\n`;
  out += `  * VERBAL DE-ESCALATION: Apply Project BETA 10 domains (2 arm lengths distance, single speaker, identify wants, offer choices).\n`;
  out += `  * CALMING PHARMACOTHERAPY: Offer Tier 1 oral non-coercive SGAs (Olanzapine Zydis 5-10 mg ODT or Risperidone M-Tab 1-2 mg ODT) or Lorazepam 1-2 mg SL/PO.\n`;
  out += `  * STAT DIAGNOSTICS: 12-lead ECG, blood glucose, core temp, serum CK, urinalysis for myoglobin, troponin, blood cultures if febrile.\n`;
  out += `================================================================================\n`;
  out += `Privacy Invariant: Zero device storage or network transmission. In-RAM ephemeral note only.\n`;
  return out;
}

// ============================================================================
// BYSTANDER / FAMILY 911 CRISIS DISPATCH SCRIPT (ZERO PII)
// ============================================================================

export function formatBystander911DispatchScript(state = {}, isEs = false) {
  const pathway = evaluateToxicologyTriage(state);
  const selectedSymptoms = Array.isArray(state.selectedSymptoms) ? state.selectedSymptoms : [];

  if (isEs) {
    let out = `GUION PARA LLAMADA AL 911 (FAMILIARES / ACOMPAÑANTES / COMUNIDAD)\n`;
    out += `================================================================================\n`;
    out += `QUÉ DECIR AL OPERADOR DEL 911 (LEA ESTO CON VOZ TRANQUILA Y FIRME):\n\n`;
    out += `1. UBICACIÓN EXACTA: "Necesito una ambulancia médica de urgencia en [DIRECCIÓN / ESQUINA / LUGAR EXACTO]."\n\n`;
    out += `2. EQUIPO ESPECIALIZADO: "Solicito paramédicos de urgencias médicas y, si está disponible, un equipo de respuesta a crisis de salud mental (CIT / Crisis Team)."\n\n`;
    out += `3. ESTADO DE SEGURIDAD (MUY IMPORTANTE): "La persona NO está armada y NO está atacando a nadie. Estamos manteniendo distancia y acompañando con calma."\n\n`;
    out += `4. SIGNOS FÍSICOS PRESENTES:\n`;
    if (selectedSymptoms.length > 0) {
      selectedSymptoms.slice(0, 4).forEach((sId) => {
        const item = TRIAGE_SYMPTOMS.find((s) => s.id === sId);
        if (item) out += `   - ${item.labelEs}\n`;
      });
    } else {
      out += `   - Dificultad para respirar o alteración severa del estado de consciencia.\n`;
    }
    out += `\n5. QUÉ ESTAMOS HACIENDO MIENTRAS LLEGAN:\n`;
    if (pathway.primaryCondition && pathway.primaryCondition.id === 'opioid_xylazine') {
      out += `   - "Sospechamos consumo de opioides o sedantes. Ya aplicamos naloxona y estamos dando respiraciones de rescate boca a boca."\n`;
    } else {
      out += `   - "Hemos trasladado a la persona a un sitio fresco y tranquilo, le estamos hablando con calma y asegurando la vía aérea."\n`;
    }
    out += `\nCONSEJO CLAVE DE SEGURIDAD: Mantenga las manos visibles ante los servicios de emergencia. No toque bruscamente a la persona.\n`;
    out += `================================================================================\n`;
    return out;
  }

  // English Bystander Script
  let out = `911 DISPATCH SCRIPT FOR BYSTANDERS, FAMILY & SUPPORTERS\n`;
  out += `================================================================================\n`;
  out += `WHAT TO SAY TO THE 911 DISPATCHER (READ CALMLY AND FIRMLY):\n\n`;
  out += `1. EXACT LOCATION: "I need an emergency medical ambulance at [EXACT ADDRESS / CROSS STREET / LANDMARK]."\n\n`;
  out += `2. SPECIALIZED REQUEST: "Please send medical paramedics and, if available, a Crisis Intervention Team (CIT) or mental health crisis responder."\n\n`;
  out += `3. SAFETY REASSURANCE (CRITICAL): "The person is NOT armed and is NOT hurting anyone. We are keeping distance and keeping things calm."\n\n`;
  out += `4. CURRENT PHYSICAL SIGNS:\n`;
  if (selectedSymptoms.length > 0) {
    selectedSymptoms.slice(0, 4).forEach((sId) => {
      const item = TRIAGE_SYMPTOMS.find((s) => s.id === sId);
      if (item) out += `   - ${item.labelEn}\n`;
    });
  } else {
    out += `   - Severe breathing distress or acute altered mental state.\n`;
  }
  out += `\n5. WHAT WE ARE DOING RIGHT NOW WHILE YOU ARE EN ROUTE:\n`;
  if (pathway.primaryCondition && pathway.primaryCondition.id === 'opioid_xylazine') {
    out += `   - "We suspect an opioid or tranq overdose. We administered naloxone and are actively giving rescue breaths."\n`;
  } else {
    out += `   - "We moved them to a cool, quiet space, we are speaking gently, and we are monitoring their airway."\n`;
  }
  out += `\nCRITICAL SAFETY TIP: Keep your hands empty and visible when responders arrive. Avoid cornering or physically restraining the person.\n`;
  out += `================================================================================\n`;
  return out;
}

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT
// ============================================================================

const createDefaultToxicologyState = () => ({
  mode: 'clinician', // 'clinician' | 'bystander'
  activeTab: 'differential', // 'differential' | 'deescalation' | 'pharmacotherapy' | 'handoff'
  selectedSymptoms: [],
  rassScore: 0,
  selectedPreset: null
});

let toxicologyState = createDefaultToxicologyState();
const toxicologyListeners = new Set();

export function getToxicologyTriageState() {
  return {
    ...toxicologyState,
    selectedSymptoms: [...toxicologyState.selectedSymptoms]
  };
}

export function setToxicologyTriageState(updates = {}) {
  toxicologyState = {
    ...toxicologyState,
    ...updates,
    selectedSymptoms: Array.isArray(updates.selectedSymptoms)
      ? [...updates.selectedSymptoms]
      : [...toxicologyState.selectedSymptoms]
  };
  toxicologyListeners.forEach((fn) => {
    try { fn(getToxicologyTriageState()); } catch (e) { /* ignore */ }
  });
  return getToxicologyTriageState();
}

export function resetToxicologyTriageState() {
  toxicologyState = createDefaultToxicologyState();
  toxicologyListeners.forEach((fn) => {
    try { fn(getToxicologyTriageState()); } catch (e) { /* ignore */ }
  });
  return getToxicologyTriageState();
}

export function subscribeToxicologyTriageState(fn) {
  if (typeof fn === 'function') {
    toxicologyListeners.add(fn);
    return () => toxicologyListeners.delete(fn);
  }
  return () => {};
}

// ============================================================================
// VIEW RENDERING: TOXICOLOGY TRIAGE & PROJECT BETA (DUAL MODE)
// ============================================================================

export function toxicologyTriageView() {
  const root = h('div', { class: 'view toxicology-triage-view' });

  function renderView() {
    clear(root);
    const localState = getToxicologyTriageState();
    const isEs = getLang() === 'es';
    const isClinician = localState.mode === 'clinician';

    // 1. Breadcrumbs
    const breadcrumb = h('nav', { class: 'breadcrumb mb-2', 'aria-label': isEs ? 'Ruta de navegación' : 'Breadcrumb' },
      h('a', { href: '#/' }, isEs ? 'Inicio' : 'Home'),
      h('span', { class: 'breadcrumb-sep' }, ' / '),
      h('a', { href: '#/tools' }, isEs ? 'Herramientas Clínicas' : 'Clinical Tools'),
      h('span', { class: 'breadcrumb-sep' }, ' / '),
      h('span', { 'aria-current': 'page' }, isEs ? 'Triage Toxicológico y Desescalada BETA' : 'Toxicology Triage & BETA De-Escalation')
    );
    root.appendChild(breadcrumb);

    // 2. Page Header & Dual Mode Switcher
    const headerCard = h('div', { class: 'card mb-3 triage-header-card' });
    const titleRow = h('div', { class: 'triage-title-row' });
    const h1 = h('h1', null, isEs
      ? 'Triage Toxicológico Agudo y Desescalada de Crisis (Proyecto BETA)'
      : 'Acute Toxicology Triage & Crisis De-Escalation (Project BETA)');
    titleRow.appendChild(h1);

    const modeToggleBar = h('div', { class: 'mode-toggle-group' });
    const btnClinician = h('button', {
      type: 'button',
      class: `btn btn-small ${isClinician ? 'btn-primary' : 'btn-secondary'}`,
      'aria-pressed': isClinician ? 'true' : 'false',
      click: () => {
        setToxicologyTriageState({ mode: 'clinician' });
      }
    }, icon('shield'), ' ', isEs ? 'Modo Personal de Salud / Clínico' : 'Clinician / Healthcare Worker Mode');

    const btnBystander = h('button', {
      type: 'button',
      class: `btn btn-small ${!isClinician ? 'btn-primary' : 'btn-secondary'}`,
      'aria-pressed': !isClinician ? 'true' : 'false',
      click: () => {
        setToxicologyTriageState({ mode: 'bystander' });
      }
    }, icon('users'), ' ', isEs ? 'Modo Acompañante / Familia / Comunidad' : 'Patient / Bystander Mode');

    modeToggleBar.appendChild(btnClinician);
    modeToggleBar.appendChild(btnBystander);
    titleRow.appendChild(modeToggleBar);
    headerCard.appendChild(titleRow);

    // Lead text based on active mode
    const leadText = h('p', { class: 'lead' }, isClinician
      ? (isEs
          ? 'Motor de soporte a la decisión clínica para emergencias por fentanilo, xilacina, sobreestimulación, síndrome serotoninérgico (Criterios de Hunter), infección necrótica y psicosis agitada. Integra pautas de desescalada verbal del Proyecto BETA, escala RASS y notas SBAR bajo el amparo de EMTALA.'
          : 'Evidence-based clinical decision support for multi-toxidrome triage (fentanyl, xylazine, stimulant overamping, Hunter criteria serotonin toxicity, soft tissue sepsis, and substance-induced agitation). Integrates Project BETA verbal de-escalation, RASS scoring, restraint-avoidance pharmacotherapy, and SBAR notes under EMTALA.')
      : (isEs
          ? 'Guía clara y sin términos complicados para familiares, amigos y acompañantes. Sepa cuándo llamar al 911 de inmediato, cómo calmar a una persona alterada sin peligro, cómo usar naloxona con respiraciones de rescate y qué decir en la llamada de auxilio.'
          : 'Clear, plain-language guidance for friends, family, and bystanders. Learn when to call 911 immediately, how to calm someone in distress safely, how to give rescue breaths during a tranq overdose, and what script to read to 911 dispatch.'));
    headerCard.appendChild(leadText);

    // Zero-storage privacy banner
    const privacyNotice = h('div', { class: 'callout callout-info fine' },
      h('strong', null, isEs ? 'Privacidad médica absoluta: ' : 'Absolute Medical Privacy: '),
      isEs
        ? 'Este triage funciona 100% en la memoria RAM del navegador. Ninguna respuesta ni síntoma seleccionado se guarda en cookies, almacenamiento local ni se envía a internet.'
        : 'This triage runs purely in local browser memory. Zero responses or symptoms are saved to cookies, local storage, or transmitted to any server.');
    headerCard.appendChild(privacyNotice);
    root.appendChild(headerCard);

    // 3. Tab Navigation (Differential, BETA De-Escalation, Pharmacotherapy, SBAR Handoff)
    const tabNav = h('div', { class: 'tab-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Triage' : 'Triage Tabs' });
    const tabs = [
      { id: 'differential', labelEn: '1. Multi-Toxidrome Differential', labelEs: '1. Diferencial Toxicológico' },
      { id: 'deescalation', labelEn: '2. Project BETA Verbal De-Escalation', labelEs: '2. Desescalada Verbal BETA' },
      { id: 'pharmacotherapy', labelEn: '3. Calming Pharmacotherapy Matrix', labelEs: '3. Farmacoterapia Calmante' },
      { id: 'handoff', labelEn: isClinician ? '4. SBAR Clinical Note & Export' : '4. 911 Dispatch & Crisis Script', labelEs: isClinician ? '4. Nota SBAR y Exportación' : '4. Guion 911 y Ayuda Inmediata' }
    ];

    tabs.forEach((tb) => {
      const active = localState.activeTab === tb.id;
      const tBtn = h('button', {
        type: 'button',
        role: 'tab',
        class: `tab-btn ${active ? 'active' : ''}`,
        'aria-selected': active ? 'true' : 'false',
        click: () => {
          setToxicologyTriageState({ activeTab: tb.id });
        }
      }, isEs ? tb.labelEs : tb.labelEn);
      tabNav.appendChild(tBtn);
    });
    root.appendChild(tabNav);

    // 4. Render Active Tab Content
    if (localState.activeTab === 'differential') {
      root.appendChild(renderDifferentialTab(localState, isEs, isClinician));
    } else if (localState.activeTab === 'deescalation') {
      root.appendChild(renderDeescalationTab(localState, isEs, isClinician));
    } else if (localState.activeTab === 'pharmacotherapy') {
      root.appendChild(renderPharmacotherapyTab(localState, isEs, isClinician));
    } else if (localState.activeTab === 'handoff') {
      root.appendChild(renderHandoffTab(localState, isEs, isClinician));
    }
  }

  // Subscribe to state updates
  const unsubscribe = subscribeToxicologyTriageState(() => {
    renderView();
  });

  // Initial render
  renderView();

  return root;
}

// ============================================================================
// TAB 1: MULTI-TOXIDROME DIFFERENTIAL & RASS
// ============================================================================

function renderDifferentialTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'triage-tab-content' });
  const pathway = evaluateToxicologyTriage(localState);

  // Quick Clinical Presets
  const presetCard = h('div', { class: 'card mb-3' });
  presetCard.appendChild(h('h2', null, isEs ? 'Casos Clínicos Predefinidos de Emergencia' : 'Rapid Emergency Presets'));
  presetCard.appendChild(h('p', null, isEs
    ? 'Seleccione un cuadro típico para cargar de inmediato los signos clínicos y evaluar el diferencial:'
    : 'Select a typical emergency scenario to load key clinical signs and evaluate the differential:'));

  const presetGrid = h('div', { class: 'triage-preset-grid' });
  TOXICOLOGY_PRESETS.forEach((pst) => {
    const isSelected = localState.selectedPreset === pst.id;
    const pBox = h('button', {
      type: 'button',
      class: `preset-card ${isSelected ? 'selected' : ''}`,
      click: () => {
        setToxicologyTriageState({
          selectedPreset: pst.id,
          selectedSymptoms: [...pst.symptoms],
          rassScore: pst.rassScore
        });
      }
    },
      h('strong', null, isEs ? pst.nameEs : pst.nameEn),
      h('p', { class: 'fine mt-1' }, isEs ? pst.descriptionEs : pst.descriptionEn)
    );
    presetGrid.appendChild(pBox);
  });
  presetCard.appendChild(presetGrid);

  const resetPresetBtn = h('button', {
    type: 'button',
    class: 'btn btn-ghost btn-small mt-2',
    click: () => {
      setToxicologyTriageState({
        selectedPreset: null,
        selectedSymptoms: [],
        rassScore: 0
      });
    }
  }, icon('refresh'), ' ', isEs ? 'Limpiar síntomas seleccionados' : 'Clear all selected symptoms');
  presetCard.appendChild(resetPresetBtn);
  container.appendChild(presetCard);

  // RASS Bedside Agitation Selector (Clinician Mode Prominent)
  const rassCard = h('div', { class: 'card mb-3' });
  rassCard.appendChild(h('h2', null, isEs ? 'Escala de Agitación-Sedación de Richmond (RASS)' : 'Richmond Agitation-Sedation Scale (RASS)'));
  rassCard.appendChild(h('p', null, isEs
    ? 'Evalúe el grado de agitación o sedación motora actual. RASS ≥ +2 requiere medidas inmediatas de desescalada verbal y prevención de contenciones físicas.'
    : 'Evaluate the patient\'s current motor agitation or sedation level. RASS ≥ +2 triggers Project BETA verbal de-escalation and restraint avoidance protocols.'));

  const rassGrid = h('div', { class: 'rass-selector-grid' });
  RASS_SCALE.forEach((r) => {
    const isSelected = localState.rassScore === r.score;
    let badgeClass = 'chip-ok';
    if (r.tier === 'critical' || r.tier === 'critical_sedated') badgeClass = 'chip-emergency';
    else if (r.tier === 'high') badgeClass = 'chip-warn';
    else if (r.tier === 'moderate') badgeClass = 'chip-primary';

    const rBtn = h('button', {
      type: 'button',
      class: `rass-btn ${isSelected ? 'selected' : ''}`,
      'aria-pressed': isSelected ? 'true' : 'false',
      click: () => {
        setToxicologyTriageState({ rassScore: r.score });
      }
    },
      h('div', { class: 'rass-score-head' },
        h('span', { class: `chip ${badgeClass}` }, `${r.score > 0 ? '+' : ''}${r.score}`),
        h('strong', null, isEs ? r.termEs : r.termEn)
      ),
      h('div', { class: 'rass-desc fine' }, isEs ? r.descEs : r.descEn)
    );
    rassGrid.appendChild(rBtn);
  });
  rassCard.appendChild(rassGrid);
  container.appendChild(rassCard);

  // Symptom Checklist by Category
  const symCard = h('div', { class: 'card mb-3' });
  symCard.appendChild(h('h2', null, isEs ? 'Lista de Verificación de Signos y Síntomas Agudos' : 'Acute Clinical Signs & Symptoms Checklist'));
  symCard.appendChild(h('p', null, isEs
    ? 'Marque los signos observados. Los marcados con [ALERTA ROJA] indican riesgo inminente de parada cardiorrespiratoria o hipertermia maligna.'
    : 'Check all observed physical signs. Items flagged with [RED FLAG] indicate imminent risk of cardiorespiratory arrest, rhabdomyolysis, or septic shock.'));

  const symGrid = h('div', { class: 'triage-symptoms-grid' });
  const selectedSet = new Set(localState.selectedSymptoms);

  TRIAGE_SYMPTOMS.forEach((s) => {
    const isChecked = selectedSet.has(s.id);
    const symBox = h('label', { class: `triage-symptom-item ${isChecked ? 'checked' : ''} ${s.redFlag ? 'has-red-flag' : ''}` });
    const chk = h('input', {
      type: 'checkbox',
      checked: isChecked,
      change: (e) => {
        const next = new Set(localState.selectedSymptoms);
        if (e.target.checked) next.add(s.id);
        else next.delete(s.id);
        setToxicologyTriageState({ selectedSymptoms: Array.from(next), selectedPreset: null });
      }
    });
    symBox.appendChild(chk);

    const textSpan = h('span', { class: 'triage-symptom-text' });
    if (s.redFlag) {
      textSpan.appendChild(h('span', { class: 'chip chip-emergency mr-1' }, isEs ? 'ALERTA ROJA' : 'RED FLAG'));
    }
    textSpan.appendChild(h('span', null, ` ${isEs ? s.labelEs : s.labelEn}`));
    symBox.appendChild(textSpan);
    symGrid.appendChild(symBox);
  });
  symCard.appendChild(symGrid);
  container.appendChild(symCard);

  // Results & Differential Analysis Card
  const resultCard = h('div', { class: 'card result-card mb-3' });
  const resHeader = h('div', { class: 'result-header-row' });
  resHeader.appendChild(h('h2', null, isEs ? 'Análisis del Diferencial Toxicológico' : 'Differential Toxidrome Analysis'));

  let sevBadgeClass = 'badge badge-info';
  let sevBadgeText = isEs ? 'EVALUACIÓN CLÍNICA' : 'CLINICAL EVALUATION';
  if (pathway.severityLevel === 'EMERGENCY_911') {
    sevBadgeClass = 'badge badge-emergency';
    sevBadgeText = isEs ? 'EMERGENCIA 911 / EMTALA INMEDIATA' : 'IMMEDIATE 911 / EMTALA EMERGENCY';
  } else if (pathway.severityLevel === 'URGENT_EVAL') {
    sevBadgeClass = 'badge badge-warning';
    sevBadgeText = isEs ? 'EVALUACIÓN MÉDICA URGENTE' : 'URGENT MEDICAL EVALUATION';
  } else if (pathway.severityLevel === 'DE_ESCALATION') {
    sevBadgeClass = 'badge badge-primary';
    sevBadgeText = isEs ? 'DESESCALADA DE AGITACIÓN' : 'DE-ESCALATION PRIORITY';
  }

  resHeader.appendChild(h('span', { class: sevBadgeClass }, sevBadgeText));
  resultCard.appendChild(resHeader);

  // Active Red Flags Warning
  if (pathway.activeRedFlags.length > 0) {
    const alertBox = h('div', { class: 'alert-box alert-danger mb-2' });
    alertBox.appendChild(h('strong', null, isEs
      ? `¡ALERTA ROJA ACTIVA (${pathway.activeRedFlags.length} signos de emergencia vital)!`
      : `CRITICAL RED FLAG DETECTED (${pathway.activeRedFlags.length} life-threatening signs)!`));
    const ul = h('ul', { class: 'mt-1' });
    pathway.activeRedFlags.forEach((rf) => {
      ul.appendChild(h('li', null, isEs ? rf.labelEs : rf.labelEn));
    });
    alertBox.appendChild(ul);
    resultCard.appendChild(alertBox);
  }

  // Hunter Serotonin Criteria Box
  if (pathway.hunterResult.meetsCriteria) {
    const hunterBox = h('div', { class: 'alert-box alert-warning mb-2' });
    hunterBox.appendChild(h('strong', null, isEs
      ? 'CRITERIOS DE HUNTER POSITIVOS PARA TOXICIDAD SEROTONINÉRGICA'
      : 'HUNTER CRITERIA MET FOR SEROTONIN TOXICITY'));
    hunterBox.appendChild(h('p', { class: 'mt-1' }, isEs
      ? `Se cumple la regla clínica diagnóstica: ${pathway.hunterResult.ruleEs}. El clono patognomónico distingue esta condición de la sobreestimulación simpaticomimética pura o síndrome neuroléptico maligno. Suspenda fármacos serotoninérgicos y administre benzodiacepinas.`
      : `Diagnostic rule confirmed: ${pathway.hunterResult.ruleEn}. Clonus is the hallmark distinguishing serotonin toxicity from pure sympathomimetic overamping or NMS. Discontinue serotonergics and administer benzodiazepines.`));
    resultCard.appendChild(hunterBox);
  }

  // Differential Ranking Cards
  resultCard.appendChild(h('h3', { class: 'mt-2' }, isEs ? 'Probabilidad de Toxidromes Evaluados:' : 'Evaluated Toxidrome Probabilities:'));
  const rankGrid = h('div', { class: 'differential-ranking-stack' });

  pathway.rankedConditions.forEach((item, idx) => {
    const isPrimary = idx === 0 && item.normalizedScore > 0;
    const box = h('div', { class: `differential-condition-item ${isPrimary ? 'primary-match' : ''}` });
    const topRow = h('div', { class: 'differential-item-header' });

    topRow.appendChild(h('strong', null, `${idx + 1}. ${isEs ? item.condition.nameEs : item.condition.nameEn}`));
    topRow.appendChild(h('span', { class: `chip ${isPrimary ? 'chip-emergency' : 'chip-primary'}` }, `${item.matchPercentage}% ${isEs ? 'correlación' : 'match'}`));
    box.appendChild(topRow);

    box.appendChild(h('p', { class: 'fine mt-1' }, isEs ? item.condition.mechanismEs : item.condition.mechanismEn));

    // Immediate action callout
    const actBox = h('div', { class: 'condition-action-box mt-1' },
      h('strong', null, isEs ? 'Acción Clínica Recomendada: ' : 'Recommended Action: '),
      isEs ? item.condition.immediateActionEs : item.condition.immediateActionEn
    );
    box.appendChild(actBox);
    rankGrid.appendChild(box);
  });

  resultCard.appendChild(rankGrid);
  container.appendChild(resultCard);

  return container;
}

// ============================================================================
// TAB 2: PROJECT BETA VERBAL DE-ESCALATION
// ============================================================================

function renderDeescalationTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'triage-tab-content' });

  // Intro Card
  const introCard = h('div', { class: 'card mb-3' });
  introCard.appendChild(h('h2', null, isEs
    ? 'Consenso del Proyecto BETA: Los 10 Dominios de Desescalada Verbal'
    : 'Project BETA Consensus: The 10 Domains of Verbal De-Escalation'));
  introCard.appendChild(h('p', { class: 'lead' }, isEs
    ? 'Desarrollado por la Asociación Americana de Psiquiatría de Urgencias (AAEP). La desescalada verbal es la intervención primaria obligatoria en agitación por sustancias. Restaura la alianza terapéutica y evita el uso traumático y peligroso de contenciones físicas.'
    : 'Developed by the American Association for Emergency Psychiatry (AAEP). Verbal de-escalation is the mandatory first-line intervention for acute substance-induced agitation. It de-escalates panic, restores safety, and eliminates the lethal risks of physical restraint.'));
  container.appendChild(introCard);

  // 10 Domains Grid
  const domainsGrid = h('div', { class: 'beta-domains-grid' });
  PROJECT_BETA_DOMAINS.forEach((d) => {
    const card = h('div', { class: 'beta-domain-card card' });
    card.appendChild(h('h3', null, isEs ? d.titleEs : d.titleEn));
    card.appendChild(h('p', { class: 'fine mb-2' }, isEs ? d.rationaleEs : d.rationaleEn));

    const scriptBox = h('div', { class: 'beta-scripts-box' });

    // DO Script
    const doRow = h('div', { class: 'script-row script-do' });
    doRow.appendChild(h('span', { class: 'chip chip-ok' }, isEs ? 'QUÉ HACER / QUÉ DECIR' : 'WHAT TO DO & SAY'));
    doRow.appendChild(h('p', { class: 'mt-1' }, isEs ? d.doScriptEs : d.doScriptEn));
    scriptBox.appendChild(doRow);

    // AVOID Script
    const avoidRow = h('div', { class: 'script-row script-avoid mt-2' });
    avoidRow.appendChild(h('span', { class: 'chip chip-emergency' }, isEs ? 'QUÉ EVITAR JAMÁS' : 'WHAT TO NEVER DO'));
    avoidRow.appendChild(h('p', { class: 'mt-1' }, isEs ? d.dontScriptEs : d.dontScriptEn));
    scriptBox.appendChild(avoidRow);

    card.appendChild(scriptBox);
    domainsGrid.appendChild(card);
  });

  container.appendChild(domainsGrid);
  return container;
}

// ============================================================================
// TAB 3: CALMING PHARMACOTHERAPY MATRIX & RESTRAINT AVOIDANCE
// ============================================================================

function renderPharmacotherapyTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'triage-tab-content' });

  // Mandatory Restraint Avoidance Banner
  const rMandate = CALMING_PHARMACOTHERAPY_TIERS.restraintMandate;
  const alertCard = h('div', { class: 'card alert-box alert-danger mb-3' });
  alertCard.appendChild(h('h2', null, isEs ? rMandate.titleEs : rMandate.titleEn));
  alertCard.appendChild(h('p', { class: 'lead mt-1' }, isEs ? rMandate.guidelineEs : rMandate.guidelineEn));
  container.appendChild(alertCard);

  // Tier 1: Oral SGAs (Preferred)
  const t1 = CALMING_PHARMACOTHERAPY_TIERS.tier1OralSGA;
  const t1Card = h('div', { class: 'card mb-3' });
  t1Card.appendChild(h('div', { class: 'facility-head' },
    h('h2', null, isEs ? t1.nameEs : t1.nameEn),
    h('span', { class: 'chip chip-ok' }, isEs ? 'PRIMERA LÍNEA (PREFERIDA)' : 'FIRST-LINE (PREFERRED)')
  ));
  t1Card.appendChild(h('p', null, isEs ? t1.rationaleEs : t1.rationaleEn));

  const t1List = h('div', { class: 'pharma-options-list' });
  t1.options.forEach((opt) => {
    const box = h('div', { class: 'pharma-option-item' },
      h('h3', null, isEs ? opt.nameEs : opt.nameEn),
      h('div', { class: 'pharma-meta' },
        h('span', { class: 'chip chip-primary' }, `${isEs ? 'Dosis: ' : 'Dose: '}${opt.dose}`),
        h('span', { class: 'chip chip-secondary' }, `${isEs ? 'Inicio: ' : 'Onset: '}${opt.onset}`)
      ),
      h('p', { class: 'mt-1 fine' }, isEs ? opt.notesEs : opt.notesEn)
    );
    t1List.appendChild(box);
  });
  t1Card.appendChild(t1List);
  container.appendChild(t1Card);

  // Tier 2: Oral Benzodiazepines
  const t2 = CALMING_PHARMACOTHERAPY_TIERS.tier2OralBenzo;
  const t2Card = h('div', { class: 'card mb-3' });
  t2Card.appendChild(h('div', { class: 'facility-head' },
    h('h2', null, isEs ? t2.nameEs : t2.nameEn),
    h('span', { class: 'chip chip-primary' }, isEs ? 'ESTIMULANTES Y ABSTINENCIA' : 'SYMPATHOMIMETIC / WITHDRAWAL')
  ));
  t2Card.appendChild(h('p', null, isEs ? t2.rationaleEs : t2.rationaleEn));

  const t2List = h('div', { class: 'pharma-options-list' });
  t2.options.forEach((opt) => {
    const box = h('div', { class: 'pharma-option-item' },
      h('h3', null, isEs ? opt.nameEs : opt.nameEn),
      h('div', { class: 'pharma-meta' },
        h('span', { class: 'chip chip-primary' }, `${isEs ? 'Dosis: ' : 'Dose: '}${opt.dose}`),
        h('span', { class: 'chip chip-secondary' }, `${isEs ? 'Inicio: ' : 'Onset: '}${opt.onset}`)
      ),
      h('p', { class: 'mt-1 fine' }, isEs ? opt.notesEs : opt.notesEn)
    );
    t2List.appendChild(box);
  });
  t2Card.appendChild(t2List);
  container.appendChild(t2Card);

  // Tier 3: Emergency Parenteral (Last Resort)
  const t3 = CALMING_PHARMACOTHERAPY_TIERS.tier3EmergencyParenteral;
  const t3Card = h('div', { class: 'card mb-3' });
  t3Card.appendChild(h('div', { class: 'facility-head' },
    h('h2', null, isEs ? t3.nameEs : t3.nameEn),
    h('span', { class: 'chip chip-warn' }, isEs ? 'ÚLTIMO RECURSO (HOSPITALARIO)' : 'LAST RESORT (HOSPITAL ONLY)')
  ));
  t3Card.appendChild(h('p', null, isEs ? t3.rationaleEs : t3.rationaleEn));

  const t3List = h('div', { class: 'pharma-options-list' });
  t3.options.forEach((opt) => {
    const box = h('div', { class: 'pharma-option-item' },
      h('h3', null, isEs ? opt.nameEs : opt.nameEn),
      h('div', { class: 'pharma-meta' },
        h('span', { class: 'chip chip-primary' }, `${isEs ? 'Dosis: ' : 'Dose: '}${opt.dose}`),
        h('span', { class: 'chip chip-secondary' }, `${isEs ? 'Inicio: ' : 'Onset: '}${opt.onset}`)
      ),
      h('p', { class: 'mt-1 fine' }, isEs ? opt.notesEs : opt.notesEn)
    );
    t3List.appendChild(box);
  });
  t3Card.appendChild(t3List);
  container.appendChild(t3Card);

  return container;
}

// ============================================================================
// TAB 4: SBAR CLINICAL NOTE & 911 BYSTANDER DISPATCH EXPORT
// ============================================================================

function renderHandoffTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'triage-tab-content' });

  if (isClinician) {
    // Clinician Mode SBAR Handoff
    const exportCard = h('div', { class: 'card mb-3' });
    exportCard.appendChild(h('h2', null, isEs
      ? 'Nota SBAR Estructurada para Traspaso de Guardia y Transferencia EMTALA'
      : 'Structured SBAR Clinical Handoff Note & EMTALA Transfer Brief'));
    exportCard.appendChild(h('p', null, isEs
      ? 'Genere una nota estandarizada (Situación, Antecedentes, Evaluación, Recomendaciones) sin datos personales (Zero PII) para agilizar la entrega al equipo de urgencias, UCI o medicina de calle.'
      : 'Generate an anonymous, structured SBAR clinical note (Situation, Background, Assessment, Recommendation) ready to paste into EHR or communicate during emergency handoff.'));

    const sbarText = formatSbarClinicalHandoff(localState, isEs);
    const pre = h('pre', { class: 'sbar-preview-box', 'aria-label': isEs ? 'Vista previa de nota SBAR' : 'SBAR note preview' });
    pre.textContent = sbarText;
    exportCard.appendChild(pre);

    const copyStatus = h('div', { class: 'copy-status-region mt-2', role: 'status', 'aria-live': 'polite' });
    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-primary',
      click: async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(sbarText);
            clear(copyStatus);
            copyStatus.appendChild(h('span', { class: 'text-success' }, isEs ? '✓ Nota SBAR copiada al portapapeles sin datos personales.' : '✓ SBAR note copied to clipboard (Zero PII).'));
          } else {
            clear(copyStatus);
            copyStatus.appendChild(h('span', null, isEs ? 'Seleccione y copie desde el cuadro superior.' : 'Please copy from the text box above.'));
          }
        } catch (e) {
          clear(copyStatus);
          copyStatus.appendChild(h('span', null, isEs ? 'Copie manualmente desde el cuadro superior.' : 'Unable to copy automatically; copy above.'));
        }
      }
    }, icon('copy'), ' ', isEs ? 'Copiar Nota SBAR (Sin Datos Personales)' : 'Copy SBAR Clinical Note (Zero PII)');

    exportCard.appendChild(copyBtn);
    exportCard.appendChild(copyStatus);
    container.appendChild(exportCard);

    // EMTALA Legal Notice Card
    const emtalaCard = h('div', { class: 'callout callout-info fine' });
    emtalaCard.appendChild(h('strong', null, isEs ? 'Protección Legal EMTALA (42 U.S.C. § 1395dd): ' : 'EMTALA Federal Protection (42 U.S.C. § 1395dd): '));
    emtalaCard.appendChild(h('span', null, isEs
      ? 'Todo servicio de urgencias hospitalario está obligado por ley federal a realizar un examen médico de triaje y estabilizar cualquier emergencia médica o abstinencia grave, sin importar seguro médico, nacionalidad, capacidad de pago ni antecedentes de consumo de sustancias.'
      : 'Under federal law, all Medicare-participating emergency departments must provide an appropriate medical screening examination and stabilizing treatment for any emergency medical condition, regardless of insurance status, ability to pay, citizenship, or history of substance use.'));
    container.appendChild(emtalaCard);

    const hospLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Continuación de Cuidados en Planta de Hospitalización' : 'Inpatient Care & Addiction Consultation'),
      h('p', { class: 'fine' }, isEs
        ? 'Para protocolos de inducción rápida CA Bridge a altas dosis, manejo del dolor quirúrgico en pacientes en MOUD y pautas de alta voluntaria (AMA) con antibióticos orales: '
        : 'For CA Bridge high-dose buprenorphine induction, acute surgical pain on MOUD, and patient-directed discharge (AMA) harm reduction: '),
      h('a', { href: '#/hospital-care' }, isEs
        ? 'Abrir Navegador de Atención Hospitalaria de Adicciones y Dolor en MOUD →'
        : 'Open Inpatient Addiction Medicine, Pain on MOUD & Hospital Care Navigator →')
    );
    container.appendChild(hospLink);

    const novelLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Alerta de Sustancias Novedosas y Puntos Ciegos en Toxicológicos (UDS)' : 'Novel Substances & Immunoassay Blindspots Alert'),
      h('p', { class: 'fine' }, isEs
        ? 'La tianeptina (ZaZa), el kratom (7-OH), el fenibut y la loperamida resultan 100% negativos en los paneles de orina habituales. Para cardiotoxicidad por QTc, inducción de buprenorfina y sustitución de fenibut con baclofeno: '
        : 'Tianeptine (ZaZa), kratom (7-OH), phenibut, and loperamide are 100% negative on standard hospital urine screens. For QTc cardiotoxicity, buprenorphine induction, and phenibut baclofen tapers: '),
      h('a', { href: '#/novel-substances' }, isEs
        ? 'Abrir Navegador de Sustancias Novedosas, Kratom y Tianeptina →'
        : 'Open Novel Substances, Kratom, Tianeptine & OTC Misuse Navigator →')
    );
    container.appendChild(novelLink);

    const psychedelicLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Crisis Psicodélica, Desescalada y Alerta de Litio' : 'Psychedelic Crisis, De-Escalation & Lithium Alert'),
      h('p', { class: 'fine' }, isEs
        ? 'Para crisis por 5-HT2A (LSD, psilocibina), riesgo mortal de convulsiones con litio, detección de secantes amargos (25I-NBOMe), los 4 pilares de soporte de pares de Fireside Project y manejo del HPPD: '
        : 'For 5-HT2A distress (LSD, psilocybin), fatal status epilepticus risk with Lithium, bitter blotter 25I-NBOMe alerts, Fireside Project 4 Pillars of peer de-escalation, and HPPD guidance: '),
      h('a', { href: '#/psychedelic-care' }, isEs
        ? 'Abrir Navegador de Cuidados Psicodélicos, Desescalada 5-HT2A y HPPD →'
        : 'Open Psychedelic Harm Reduction, 5-HT2A De-Escalation & HPPD Navigator →')
    );
    container.appendChild(psychedelicLink);

    const ghbLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Alerta de Coma por GHB/GBL y Abstinencia Severa (GWS)' : 'GHB/GBL Coma & Severe Withdrawal Alert (GWS)'),
      h('p', { class: 'fine' }, isEs
        ? 'Para triaje de coma por G-out, obstrucción de vía aérea, posición lateral de seguridad, dependencia física 24/7 y protocolos con baclofeno y diazepam: '
        : 'For G-out respiratory coma, lateral recovery position, the 1,4-BDO alcohol dehydrogenase trap, round-the-clock physical dependence, and BAP Baclofen protocols: '),
      h('a', { href: '#/ghb-care' }, isEs
        ? 'Abrir Navegador de GHB/GBL, Triaje de Coma y Abstinencia →'
        : 'Open GHB, GBL & 1,4-BDO Harm Reduction, Coma Triage & Withdrawal Navigator →')
    );
    container.appendChild(ghbLink);

    const veinLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Salud Vascular, Punción Arterial y Zonas de Inyección' : 'Vascular Health, Arterial Puncture & Injection Zones'),
      h('p', { class: 'fine' }, isEs
        ? 'Para triaje urgente de punción arterial accidental, compresión manual continua (>= 15 min), sospecha de TVP, pseudoaneurismas y zonas de riesgo anatómico: '
        : 'For accidental arterial puncture emergency compression (>= 15 min), DVT triage, pseudoaneurysm surgical alerts, and anatomical injection risk zones: '),
      h('a', { href: '#/vein-care' }, isEs
        ? 'Abrir Navegador de Cuidado de Venas y Salud Vascular →'
        : 'Open Vein Care, Vascular Health & Injection Anatomy Navigator →')
    );
    container.appendChild(veinLink);

    const inhalantLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Inhalantes, Óxido Nitroso y Toxicología de Solventes' : 'Inhalants, Nitrous Oxide & Solvent Toxicology'),
      h('p', { class: 'fine' }, isEs
        ? 'Para degeneración medular por N₂O (déficit funcional de B12), riesgo de muerte súbita por hidrocarburos (SSDS), metahemoglobinemia por poppers y quemaduras criogénicas: '
        : 'For nitrous oxide spinal cord neuropathy (functional B12 shutdown), Sudden Sniffing Death Syndrome (SSDS), alkyl nitrite methemoglobinemia, and cryo-burn prevention: '),
      h('a', { href: '#/inhalant-care' }, isEs
        ? 'Abrir Navegador de Inhalantes y Óxido Nitroso →'
        : 'Open Inhalants, Solvents & Nitrous Oxide Navigator →')
    );
    container.appendChild(inhalantLink);

    const ketamineLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Ketamina, Uropatía Vesical y Cólicos «K-Cramps»' : 'Ketamine Uropathy, Bladder Health & K-Cramps'),
      h('p', { class: 'fine' }, isEs
        ? 'Para triaje de cistitis ulcerativa («orinar cristales»), estadios 1-4 de uropatía, espasmo biliar del esfínter de Oddi («K-cramps») y protección con EGCG: '
        : 'For ketamine cystitis triage ("urinating razor blades"), Stages 1–4 uropathy, sphincter of Oddi biliary colic ("K-cramps"), and EGCG antioxidant protocols: '),
      h('a', { href: '#/ketamine-care' }, isEs
        ? 'Abrir Navegador de Uropatía por Ketamina →'
        : 'Open Ketamine Harm Reduction & Uropathy Navigator →')
    );
    container.appendChild(ketamineLink);

    const weatherLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Hipotermia, Congelación y Golpe de Calor (Extremos Climáticos)' : 'Hypothermia, Frostbite & Heat Stroke (Environmental Extremes)'),
      h('p', { class: 'fine' }, isEs
        ? 'Para estadificación suiza de hipotermia (estadios I-IV), regla de RCP «nadie está muerto hasta estar caliente», congelación tisular y enfriamiento agresivo de golpe de calor: '
        : 'For Swiss hypothermia staging (Stages I–IV), "warm and dead" CPR rule, frostbite tissue preservation, trench foot care, and emergency heat stroke cooling: '),
      h('a', { href: '#/weather-care' }, isEs
        ? 'Abrir Navegador de Seguridad Climática y Temperaturas Extremas →'
        : 'Open Weather Care, Hypothermia & Heat Stroke Navigator →')
    );
    container.appendChild(weatherLink);

    const liverLink = h('div', { class: 'card mt-2' },
      h('h3', null, isEs ? 'Toxicidad por Paracetamol, Nomograma Rumack-Matthew y Salud Hepática' : 'Acetaminophen Toxicity, Rumack-Matthew Nomogram & Liver Safety'),
      h('p', { class: 'fine' }, isEs
        ? 'Para nomograma Rumack-Matthew, protocolo de N-acetilcisteína (NAC) en 21 horas, criterios de King’s College, cirrosis Child-Pugh y dosificación de buprenorfina/metadona: '
        : 'For Rumack-Matthew APAP nomogram evaluation, 21-hour IV N-Acetylcysteine protocol, King’s College criteria, Child-Pugh cirrhosis staging, and MOUD liver safety: '),
      h('a', { href: '#/liver-care' }, isEs
        ? 'Abrir Navegador de Salud Hepática, Toxicidad por APAP y Cirrosis →'
        : 'Open Liver Health, APAP Toxicity & Cirrhosis Navigator →')
    );
    container.appendChild(liverLink);

  } else {
    // Bystander Mode 911 Dispatch Script
    const bystanderCard = h('div', { class: 'card mb-3' });
    bystanderCard.appendChild(h('h2', null, isEs
      ? 'Guion de Emergencia para la Llamada al 911 (Tranquilidad y Sin Riesgos)'
      : 'Emergency 911 Dispatch Script (Low-Conflict & De-Escalating)'));
    bystanderCard.appendChild(h('p', null, isEs
      ? 'Cuando una persona querida o conocida sufre una crisis por sustancias, llamar al 911 genera miedo. Use este guion exacto para solicitar auxilio médico y desescalada de salud mental sin provocar una respuesta policial agresiva.'
      : 'Calling 911 during a substance crisis is frightening. Use this exact, calm script to request emergency medical paramedics and crisis intervention teams while protecting your loved one from confrontation or aggressive police responses.'));

    const scriptText = formatBystander911DispatchScript(localState, isEs);
    const pre = h('pre', { class: 'sbar-preview-box', 'aria-label': isEs ? 'Guion para el 911' : '911 dispatch script' });
    pre.textContent = scriptText;
    bystanderCard.appendChild(pre);

    const copyStatus = h('div', { class: 'copy-status-region mt-2', role: 'status', 'aria-live': 'polite' });
    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-primary',
      click: async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(scriptText);
            clear(copyStatus);
            copyStatus.appendChild(h('span', { class: 'text-success' }, isEs ? '✓ Guion copiado al portapapeles.' : '✓ Script copied to clipboard.'));
          } else {
            clear(copyStatus);
            copyStatus.appendChild(h('span', null, isEs ? 'Copie desde el cuadro superior.' : 'Please copy from the text box above.'));
          }
        } catch (e) {
          clear(copyStatus);
          copyStatus.appendChild(h('span', null, isEs ? 'Copie manualmente desde el cuadro.' : 'Unable to copy automatically; copy above.'));
        }
      }
    }, icon('copy'), ' ', isEs ? 'Copiar Guion para el 911' : 'Copy 911 Dispatch Script');

    bystanderCard.appendChild(copyBtn);
    bystanderCard.appendChild(copyStatus);
    container.appendChild(bystanderCard);

    // Naloxone & Tranq Rescue Breathing Reminder Card
    const naloxoneCard = h('div', { class: 'card alert-box alert-warning' });
    naloxoneCard.appendChild(h('h3', null, isEs ? 'Recordatorio Vital: La Naloxona y el "Tranq" (Xilacina)' : 'Vital Lifesaving Reminder: Naloxone and "Tranq" (Xylazine)'));
    naloxoneCard.appendChild(h('p', { class: 'mt-1' }, isEs
      ? 'La naloxona revierte el fentanilo y los opioides para que los pulmones vuelvan a respirar. Sin embargo, si la sustancia contenía xilacina o medetomidina, la persona continuará profundamente dormida o sedada. ¡NO SIGA APLICANDO NALOXONA INFINITAMENTE! Si ya respira (más de 10-12 veces por minuto), colóquela de lado en posición de recuperación. Si no respira, continúe dándole respiración boca a boca (1 cada 5 segundos).'
      : 'Naloxone wakes up breathing by reversing fentanyl and opioids. However, if the drugs contained xylazine or medetomidine ("tranq"), the person will remain deeply asleep or sedated. DO NOT GIVE ENDLESS NALOXONE DOSES! As long as they are breathing (over 10-12 times per minute), roll them onto their side in the recovery position. If they are not breathing, keep giving rescue breaths (1 breath every 5 seconds).'));
    container.appendChild(naloxoneCard);
  }

  return container;
}
