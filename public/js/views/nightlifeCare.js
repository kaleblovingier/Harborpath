// public/js/views/nightlifeCare.js
// HarborPath - Nightlife, Club Drugs, Dissociatives & Festival Harm Reduction Specialist
// Clinical standards: DanceSafe, American College of Medical Toxicology (ACMT), Crew 2000, UK Club Health
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon, copyText } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { NEVER_USE_ALONE } from '../content/hotlines.js';

// ============================================================================
// CLINICAL TAXONOMY & NIGHTLIFE SUBSTANCE PROFILES
// ============================================================================

export const NIGHTLIFE_SUBSTANCES = [
  {
    id: 'ketamine',
    nameEn: 'Ketamine & Dissociatives',
    nameEs: 'Ketamina y Disociativos',
    streetNamesEn: 'Special K, K, horse tranquilizer, ket, vitamin K',
    streetNamesEs: 'Keta, especial K, caballo, vitamina K',
    mechanismEn: 'NMDA receptor antagonist; dissociative anesthetic inducing sensory detachment and analgesic sedation',
    mechanismEs: 'Antagonista del receptor NMDA; anestésico disociativo que induce desconexión sensorial y sedación analgésica',
    durationEn: 'Onset: 1-5 min (snorted) / 10-20 min (oral); Duration: 45-90 min; Residual: 2-3 hours',
    durationEs: 'Inicio: 1-5 min (esnifada) / 10-20 min (oral); Duración: 45-90 min; Residual: 2-3 horas',
    bladderRiskEn: 'Chronic or high-dose use causes Ketamine-Induced Ulcerative Cystitis ("K-Bladder"): urothelial mucosal sloughing, severe bladder contraction, frequency (>60 times/day), and hematuria (blood in urine). Can require cystectomy (bladder removal).',
    bladderRiskEs: 'El uso crónico o a dosis altas causa Cistitis Ulcerativa por Ketamina ("Vejiga K"): desprendimiento de mucosa urotelial, contracción vesical severa, polaquiuria (>60 veces/día) y hematuria (sangre en orina). Puede requerir cistectomía.',
    crampsRiskEn: '"K-Cramps": severe, debilitating epigastric and gall bladder spasms often mistaken for abdominal emergencies.',
    crampsRiskEs: '"Cólicos K": espasmos epigástricos y biliares severos y debilitantes, frecuentemente confundidos con abdomen agudo.',
    harmReductionEn: [
      'Take regular extended breaks between sessions to allow bladder urothelium to regenerate.',
      'Hydrate with isotonic electrolyte fluids before, during, and after sessions; avoid diuretic alcohol and sodas.',
      'Take green tea extract (EGCG 400-800 mg) prior to consumption: studies demonstrate polyphenolic antioxidant protection against ketamine urothelial cytotoxicity.',
      'Spit the drip: swallowing ketamine drip causes stomach and biliary lining irritation without psychoactive benefit.',
      'Never combine with alcohol, GHB, or benzodiazepines: suppresses protective laryngeal gag reflexes, creating fatal vomit aspiration risk.'
    ],
    harmReductionEs: [
      'Tome descansos prolongados regulares entre sesiones para que el urotelio vesical se regenere.',
      'Hidrátese con líquidos isotónicos con electrolitos antes, durante y después; evite alcohol y refrescos diuréticos.',
      'Tome extracto de té verde (EGCG 400-800 mg) antes de consumir: los estudios demuestran protección antioxidante polifenólica contra la citotoxicidad urotelial de la ketamina.',
      'Escupa el goteo nasal: tragar el goteo irrita el estómago y la vesícula biliar sin aportar beneficios psicoactivos.',
      'Nunca combine con alcohol, GHB o benzodiacepinas: suprime los reflejos nauseosos protectores, generando riesgo fatal de aspiración de vómito.'
    ]
  },
  {
    id: 'mdma',
    nameEn: 'MDMA (Ecstasy, Molly)',
    nameEs: 'MDMA (Éxtasis, Molly, Cristal)',
    streetNamesEn: 'Molly, ecstasy, E, XTC, rolls, mandy',
    streetNamesEs: 'Molly, éxtasis, pastis, ruedas, cristal',
    mechanismEn: 'Potent presynaptic release and reuptake inhibition of serotonin (5-HT), dopamine, and norepinephrine; oxytocin release producing entactogenic empathy and hyper-arousal',
    mechanismEs: 'Potente liberación presináptica e inhibición de la recaptación de serotonina (5-HT), dopamina y norepinefrina; liberación de oxitocina que produce empatía entactógena e hiperactivación',
    durationEn: 'Onset: 30-60 min; Peak: 1.5-2.5 hours; Duration: 4-6 hours; Comedown: 24-48 hours ("Suicide Tuesday")',
    durationEs: 'Inicio: 30-60 min; Pico: 1.5-2.5 horas; Duración: 4-6 horas; Bajada: 24-48 horas ("Martes de depresión")',
    bladderRiskEn: 'Urinary retention common during peak due to sympathetic sphincter constriction; temporary and resolves as drug clears.',
    bladderRiskEs: 'Retención urinaria común durante el pico por constricción del esfínter simpático; temporal y se resuelve al eliminarse el fármaco.',
    crampsRiskEn: 'Bruxism and jaw clenching (trismus) common; use magnesium glycinate (200-400 mg) pre-load to reduce jaw tension.',
    crampsRiskEs: 'Bruxismo y apretamiento mandibular (trismo) comunes; use glicinato de magnesio (200-400 mg) previo para reducir la tensión mandibular.',
    harmReductionEn: [
      'Fluid Balance Protocol: Drink no more than 250 mL (1 cup) per hour if resting, or 500 mL per hour if dancing intensely in hot venues. ALWAYS choose electrolyte drinks over plain water to prevent fatal hyponatremia (water intoxication).',
      'Hyperthermia Prevention: Take mandatory 15-minute cool-down breaks in chill-out rooms every hour. Elevated core temperature (>102°F) multiplies neurotoxicity and causes heatstroke.',
      'The 3-Month Rule: Allow 8 to 12 weeks between uses to allow presynaptic serotonin axon terminals and SERT transporters to replenish, preventing chronic depression and tolerance.',
      'Weight-Based Dosing: Harm reduction formula: (Body weight in kg + 50) = max dose in mg (e.g., 70 kg person = 120 mg max). If redosing, take no more than half the initial dose at 90-120 minutes; subsequent redoses only multiply neurotoxicity without prolonging euphoria.',
      '5-HTP Timing: NEVER take 5-HTP on the same day or within 24 hours of MDMA (causes Serotonin Syndrome). 5-HTP can be used 24-48 hours later to support serotonin synthesis during comedown.'
    ],
    harmReductionEs: [
      'Protocolo de Balance de Líquidos: Beba no más de 250 mL (1 vaso) por hora en reposo, o 500 mL por hora si baila intensamente en lugares calurosos. Elija SIEMPRE bebidas con electrolitos en lugar de agua pura para evitar hiponatremia mortal (intoxicación por agua).',
      'Prevención de Hipertermia: Tome descansos obligatorios de 15 minutos en zonas frescas cada hora. La temperatura corporal elevada (>39°C) multiplica la neurotoxicidad y causa golpe de calor.',
      'La Regla de los 3 Meses: Espere de 8 a 12 semanas entre usos para permitir que las terminales axonales de serotonina y transportadores SERT se recarguen, evitando depresión crónica y tolerancia.',
      'Dosificación por Peso: Fórmula de reducción de daños: (Peso en kg + 50) = dosis máxima en mg (ej. persona de 70 kg = 120 mg máx). Si redosifica, tome máximo la mitad de la dosis inicial a los 90-120 min; redosis posteriores solo multiplican la neurotoxicidad sin prolongar la euforia.',
      'Momento del 5-HTP: NUNCA tome 5-HTP el mismo día o dentro de las 24 horas de haber tomado MDMA (causa Síndrome Serotoninérgico). El 5-HTP puede usarse 24-48 horas después para apoyar la síntesis de serotonina durante la bajada.'
    ]
  },
  {
    id: 'ghb',
    nameEn: 'GHB, GBL & 1,4-BD',
    nameEs: 'GHB, GBL y 1,4-BD',
    streetNamesEn: 'G, liquid ecstasy, fantasy, Gina, Georgia home boy',
    streetNamesEs: 'G, éxtasis líquido, Gina, chorro',
    mechanismEn: 'GABA-B and GHB-receptor agonist causing dose-dependent disinhibition, profound central sedation, and respiratory depression',
    mechanismEs: 'Agonista de receptores GABA-B y GHB que causa desinhibición según dosis, sedación central profunda y depresión respiratoria',
    durationEn: 'Onset: 10-20 min; Peak: 30-45 min; Duration: 1.5-3 hours (GBL has faster onset and greater potency)',
    durationEs: 'Inicio: 10-20 min; Pico: 30-45 min; Duración: 1.5-3 horas (GBL tiene inicio más rápido y mayor potencia)',
    bladderRiskEn: 'Bladder effects minimal; primary risk is severe urinary and fecal incontinence during deep "G-out" coma.',
    bladderRiskEs: 'Efectos vesicales mínimos; el riesgo principal es incontinencia urinaria y fecal severa durante el coma profundo por sobredosis ("G-out").',
    crampsRiskEn: 'Severe myoclonus, muscular twitches, and violent thrashing common during overdose or withdrawal.',
    crampsRiskEs: 'Mioclonías severas, sacudidas musculares y agitación violenta comunes durante sobredosis o abstinencia.',
    harmReductionEn: [
      'Precision Volumetric Dosing: Steep dose-response curve where a mere 0.5 mL difference can transition from euphoria to comatose respiratory failure. ALWAYS use a marked oral syringe (1 mL graduations); NEVER drink directly from caps or bottles.',
      'Absolute Alcohol Prohibition: Combining GHB with even one standard alcoholic drink multiplies GABA-B mediated respiratory arrest by an order of magnitude. Fatalities are overwhelmingly linked to co-ingested alcohol.',
      'Color Coding & Food Dye: GHB/GBL is clear and salty or chemical tasting. ALWAYS add food coloring to dosing bottles to prevent accidental ingestion by yourself or others.',
      'Avoid Re-dosing Early: Wait at least 2 full hours before considering any redose. Redosing while a previous dose is still absorbing causes sudden delayed "G-out".',
      'Round-The-Clock Dependence Warning: Using GHB/GBL every 2-4 hours to manage tremors or sleep creates severe physical dependence within days. ABRUPT WITHDRAWAL IS A MEDICAL EMERGENCY with severe delirium, seizures, and cardiovascular collapse. NEVER cold turkey; requires inpatient medical detoxification with high-dose baclofen and benzodiazepines.'
    ],
    harmReductionEs: [
      'Dosificación Volumétrica de Precisión: Curva de respuesta a dosis muy empinada donde una diferencia de solo 0.5 mL puede pasar de la euforia al coma respiratorio. Use SIEMPRE una jeringa oral graduada (de 1 mL); NUNCA beba de tapones ni botellas.',
      'Prohibición Absoluta de Alcohol: Combinar GHB incluso con una sola bebida alcohólica multiplica exponencialmente el paro respiratorio mediado por GABA-B. Las muertes están abrumadoramente ligadas al alcohol coingerido.',
      'Código de Colorantes Alimentarios: El GHB/GBL es transparente y de sabor salado o químico. Añada SIEMPRE colorante alimentario al frasco para evitar ingestiones accidentales.',
      'Evite Redosificar Antes de Tiempo: Espere al menos 2 horas completas antes de considerar cualquier redosis. Redosificar mientras la dosis previa aún se absorbe causa un "G-out" tardío y repentino.',
      'Alerta de Dependencia Continuada: Consumir GHB/GBL cada 2-4 horas para controlar temblores o dormir genera dependencia física severa en pocos días. LA ABSTINENCIA ABRUPTA ES UNA EMERGENCIA MÉDICA con delirio severo, convulsiones y colapso cardiovascular. NUNCA lo suspenda de golpe; requiere desintoxicación médica hospitalaria con baclofeno y benzodiacepinas.'
    ]
  },
  {
    id: 'nitrous',
    nameEn: 'Nitrous Oxide (N2O)',
    nameEs: 'Óxido Nitroso (N2O, Gas de la Risa)',
    streetNamesEn: 'Whippets, laughing gas, chargers, tanks, Galaxy Gas, nos',
    streetNamesEs: 'Whippets, gas de la risa, cápsulas, tanques, Galaxy Gas',
    mechanismEn: 'NMDA antagonist and GABAA enhancer producing rapid dissociative euphoria, derealization, and analgesia',
    mechanismEs: 'Antagonista NMDA y potenciador de GABAA que produce euforia disociativa rápida, desrealización y analgesia',
    durationEn: 'Onset: 5-10 seconds; Peak: 30-60 seconds; Total duration: 2-5 minutes',
    durationEs: 'Inicio: 5-10 segundos; Pico: 30-60 segundos; Duración total: 2-5 minutos',
    bladderRiskEn: 'Urinary urgency and neurogenic bladder dysfunction occur as a complication of spinal cord demyelination (SCD).',
    bladderRiskEs: 'La urgencia urinaria y la vejiga neurógena ocurren como complicación de la desmielinización de la médula espinal (SCD).',
    crampsRiskEn: 'Peripheral neuropathy: "pins and needles" (paresthesias) in hands and feet, numbness, Lhermitte sign (electric shock down spine upon neck flexion).',
    crampsRiskEs: 'Neuropatía periférica: "alfileres y agujas" (parestesias) en manos y pies, entumecimiento, signo de Lhermitte (descarga eléctrica en la espalda al flexionar el cuello).',
    harmReductionEn: [
      'Vitamin B12 Inactivation Mechanism: Nitrous oxide chemically oxidizes the cobalt atom in cobalamin (active B12) from Co+ to Co3+, rendering it permanently inactive. This shuts down methionine synthase, blocking myelin sheath maintenance.',
      'Subacute Combined Degeneration of Spinal Cord (SCD): Frequent, chronic, or high-volume tank use causes irreversible demyelination of spinal cord dorsal and lateral columns. Warning signs: numbness in fingers/toes, loss of balance/ataxia, foot drop, inability to walk. REQUIRES IMMEDIATE MEDICAL CESSATION AND HIGH-DOSE IM VITAMIN B12 INJECTIONS.',
      'Always Use a Balloon: Inhaling directly from whipped cream dispensers, crackers, or compressed tanks releases gas at -40°C (-40°F), causing catastrophic cryo-burns to lips, tongue, vocal cords, and lungs, with risk of fatal laryngeal edema.',
      'Oxygenation Safety: Never use a face mask or bag over the head (causes rapid asphyxiation and brain death). Always breathe normal room air between inhalations.',
      'Frequency Over Volume: Using nitrous 4 days in a row is vastly more neurotoxic than using a large amount in a single evening, because the body takes days to regenerate active B12 enzymes. Maintain weeks of total abstinence between sessions.'
    ],
    harmReductionEs: [
      'Mecanismo de Inactivación de Vitamina B12: El óxido nitroso oxida químicamente el átomo de cobalto de la cobalamina (B12 activa) de Co+ a Co3+, dejándola permanentemente inactiva. Esto bloquea la metionina sintasa, impidiendo el mantenimiento de la mielina.',
      'Degeneración Combinada Subaguda de la Médula (SCD): El uso frecuente, crónico o en tanques de gran volumen causa desmielinización irreversible de los cordones dorsales y laterales. Signos de alarma: entumecimiento en dedos, pérdida de equilibrio/ataxia, pie caído, incapacidad para caminar. REQUIERE CESE MÉDICO INMEDIATO E INYECCIONES INTRAMUSCULARES DE B12 EN DOSIS ALTAS.',
      'Use Siempre un Globo: Inhalar directamente de sifones o tanques libera gas a -40°C, causando quemaduras por congelación catastróficas en labios, lengua, cuerdas vocales y pulmones, con riesgo de edema laríngeo mortal.',
      'Seguridad de Oxigenación: Nunca use máscaras faciales ni bolsas en la cabeza (causa asfixia rápida y muerte cerebral). Respire siempre aire ambiental entre inhalaciones.',
      'Frecuencia Frente a Volumen: Usar óxido nitroso 4 días seguidos es mucho más neurotóxico que usarlo en una sola noche, ya que el cuerpo tarda días en regenerar las enzimas activas de B12. Mantenga semanas de abstinencia total entre sesiones.'
    ]
  },
  {
    id: '2cb',
    nameEn: '2C-B & Psychedelic Phenethylamines',
    nameEs: '2C-B y Fenetilaminas Psicodélicas',
    streetNamesEn: 'Nexus, bees, pink cocaine (note: counterfeit "tusi" is often ketamine/caffeine/MDMA mix, not real 2C-B)',
    streetNamesEs: 'Nexus, abejas, tusi / cocaína rosa (nota: el "tusi" callejero suele ser mezcla de ketamina, cafeína y MDMA, no 2C-B real)',
    mechanismEn: 'Partial agonist at serotonin 5-HT2A and 5-HT2C receptors; produces visual distortions, heightened sensory tactile enhancement, and mild stimulant euphoria',
    mechanismEs: 'Agonista parcial en receptores de serotonina 5-HT2A y 5-HT2C; produce distorsiones visuales, potenciación táctil y leve euforia estimulante',
    durationEn: 'Onset: 45-75 min (oral) / 5-10 min (snorted, highly painful); Peak: 2-3 hours; Duration: 4-8 hours',
    durationEs: 'Inicio: 45-75 min (oral) / 5-10 min (esnifada, muy dolorosa); Pico: 2-3 horas; Duración: 4-8 horas',
    bladderRiskEn: 'No direct urothelial toxicity reported; mild temporary urinary retention possible.',
    bladderRiskEs: 'Sin toxicidad urotelial directa descrita; retención urinaria leve y temporal posible.',
    crampsRiskEn: 'Gastrointestinal upset, nausea, and body load common during come-up; ginger tea or chews mitigate nausea.',
    crampsRiskEs: 'Molestias gastrointestinales, náuseas y carga corporal comunes durante la subida; el jengibre ayuda a mitigar las náuseas.',
    harmReductionEn: [
      'Steep Dose Curve: Very steep dose-response curve: 15 mg is a mild sensory enhancer, while 25 mg is a profound psychedelic trip. Use an accurate milligram scale (0.001 g); never eyeball doses.',
      'The "Pink Cocaine" (Tusi) Warning: Street powder sold as "tusi" or "pink cocaine" is almost NEVER 2C-B. Chemical analysis shows it is an unpredictable concoction of ketamine, MDMA, caffeine, and sometimes fentanyl or synthetic cathinones. Reagent test and fentanyl strip test every sample.',
      'Set and Setting: Ensure a safe environment with trustworthy friends, hydration, and a calm space to retreat if sensory stimulation becomes overwhelming.',
      'Avoid Snorting: Insufflating 2C-B causes intense, excruciating nasal burning and rapid overwhelming onset. Oral consumption in a capsule or dissolved in water is vastly safer and more comfortable.'
    ],
    harmReductionEs: [
      'Curva de Dosis Muy Empinada: 15 mg es un potenciador sensorial suave, mientras que 25 mg es un viaje psicodélico profundo. Use una báscula precisa de miligramos (0.001 g); nunca calcule dosis a ojo.',
      'Alerta sobre "Cocaína Rosa" (Tusi): El polvo callejero vendido como "tusi" casi NUNCA es 2C-B. Los análisis químicos muestran que es una mezcla impredecible de ketamina, MDMA, cafeína y a veces fentanilo o catinonas. Pruebe cada muestra con reactivos y tiras de fentanilo.',
      'Contexto y Estado Mental (Set & Setting): Asegure un entorno seguro con personas de confianza, hidratación y un espacio tranquilo para descansar si la estimulación sensorial se vuelve abrumadora.',
      'Evite Esnifar: Esnifar 2C-B provoca un ardor nasal insoportable y una subida repentina y abrumadora. El consumo oral en cápsula o disuelto en agua es mucho más seguro y cómodo.'
    ]
  }
];

// ============================================================================
// DANCESAFE-GRADE REAGENT TESTING STANDARDS
// ============================================================================

export const REAGENT_STANDARDS = [
  {
    reagent: 'Marquis',
    primaryUseEn: 'Screening for MDMA, amphetamines, 2C-B, and cathinones',
    primaryUseEs: 'Detección de MDMA, anfetaminas, 2C-B y catinonas',
    reactions: [
      { substance: 'MDMA / MDA', colorEn: 'Dark Purple to Black (instant)', colorEs: 'Púrpura oscuro a Negro (instantáneo)' },
      { substance: 'Meth / Amphetamine', colorEn: 'Orange to Red-Brown', colorEs: 'Naranja a Rojo-Marrón' },
      { substance: '2C-B', colorEn: 'Yellow to Green', colorEs: 'Amarillo a Verde' },
      { substance: 'Cathinones (Bath Salts)', colorEn: 'Yellow to Orange', colorEs: 'Amarillo a Naranja' },
      { substance: 'Ketamine', colorEn: 'No reaction / Clear', colorEs: 'Sin reacción / Transparente' }
    ]
  },
  {
    reagent: "Simon's (A + B)",
    primaryUseEn: 'Differentiating secondary amines (MDMA, Meth) from primary amines (MDA, Amphetamine)',
    primaryUseEs: 'Diferenciación de aminas secundarias (MDMA, Metanfetamina) de primarias (MDA, Anfetamina)',
    reactions: [
      { substance: 'MDMA', colorEn: 'Bright Blue (instant)', colorEs: 'Azul brillante (instantáneo)' },
      { substance: 'MDA', colorEn: 'No reaction / Clear', colorEs: 'Sin reacción / Transparente' },
      { substance: 'Methamphetamine', colorEn: 'Bright Blue', colorEs: 'Azul brillante' },
      { substance: 'Amphetamine', colorEn: 'No reaction / Clear', colorEs: 'Sin reacción / Transparente' }
    ]
  },
  {
    reagent: 'Froehde',
    primaryUseEn: 'Distinguishing 2C series, cathinones, and validating MDMA',
    primaryUseEs: 'Distinción de la serie 2C, catinonas y validación de MDMA',
    reactions: [
      { substance: 'MDMA', colorEn: 'Black / Dark Blue', colorEs: 'Negro / Azul oscuro' },
      { substance: '2C-B', colorEn: 'Yellow to Greenish-Blue', colorEs: 'Amarillo a Azul verdoso' },
      { substance: 'Ketamine', colorEn: 'No reaction / Clear', colorEs: 'Sin reacción / Transparente' }
    ]
  },
  {
    reagent: 'Morris (A + B)',
    primaryUseEn: 'Specific qualitative identification of Ketamine and Cocaine',
    primaryUseEs: 'Identificación cualitativa específica de Ketamina y Cocaína',
    reactions: [
      { substance: 'Ketamine', colorEn: 'Violet / Purple', colorEs: 'Violeta / Púrpura' },
      { substance: 'Cocaine', colorEn: 'Bright Blue', colorEs: 'Azul brillante' },
      { substance: 'Cathinones', colorEn: 'Greenish-Brown / Gray', colorEs: 'Marrón verdoso / Gris' }
    ]
  }
];

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateNightlifeScenario({
  selectedSubstances = [],
  fluidIntakeLitresPerHour = 0.3,
  hasSevereHeadacheOrConfusion = false,
  hasUrinaryBloodOrPain = false,
  hasNumbnessOrTingling = false,
  combiningWithAlcohol = false
} = {}) {
  const issues = [];
  const urgentEscalations = [];
  const actionPearls = [];

  const hasKetamine = selectedSubstances.includes('ketamine');
  const hasMdma = selectedSubstances.includes('mdma');
  const hasGhb = selectedSubstances.includes('ghb');
  const hasNitrous = selectedSubstances.includes('nitrous');

  // 1. Dilutional Hyponatremia (Water Intoxication) from MDMA + Excessive Water
  if (hasMdma && fluidIntakeLitresPerHour > 0.6) {
    issues.push({
      id: 'hyponatremia_risk',
      titleEn: 'Severe Dilutional Hyponatremia (Water Intoxication) Warning',
      titleEs: 'Alerta de Hiponatremia Dilucional Severa (Intoxicación por Agua)',
      descEn: 'MDMA stimulates SIADH (anti-diuretic hormone), preventing the kidneys from excreting water. Drinking more than 500 mL/hr of plain water dilutes blood sodium, causing cerebral edema (brain swelling), seizures, and death. Switch immediately to electrolyte drinks and restrict fluids.',
      descEs: 'La MDMA estimula la SIADH (hormona antidiurética), impidiendo que los riñones excreten agua. Beber más de 500 mL/hora de agua pura diluye el sodio en sangre, provocando edema cerebral, convulsiones y muerte. Cambie de inmediato a bebidas con electrolitos y restrinja los líquidos.'
    });
  }

  if (hasMdma && hasSevereHeadacheOrConfusion) {
    urgentEscalations.push({
      actionEn: 'EMERGENCY: Acute Hyponatremia / Heatstroke. Stop fluid intake. Seek immediate medical attention. Request urgent serum sodium level test.',
      actionEs: 'EMERGENCIA: Hiponatremia aguda / Golpe de calor. Detenga la ingesta de agua. Busque atención médica inmediata. Solicite prueba urgente de sodio sérico.'
    });
  }

  // 2. Fatal GHB + Alcohol Co-ingestion
  if (hasGhb && combiningWithAlcohol) {
    urgentEscalations.push({
      actionEn: 'CRITICAL WARNING: GHB and alcohol synergize GABA-B central respiratory arrest. NEVER combine them. Place in Recovery Position if drowsy; call 911 if breathing slows below 8 breaths/min.',
      actionEs: 'ALERTA CRÍTICA: El GHB y el alcohol provocan paro respiratorio central por sinergia GABA-B. NUNCA los combine. Coloque en Posición de Recuperación si hay somnolencia; llame al 911 si la respiración baja de 8 resp/min.'
    });
  }

  // 3. Ketamine Ulcerative Cystitis
  if (hasKetamine && hasUrinaryBloodOrPain) {
    issues.push({
      id: 'k_cystitis',
      titleEn: 'Ketamine-Induced Ulcerative Cystitis (K-Bladder) Detected',
      titleEs: 'Cistitis Ulcerativa por Ketamina (Vejiga K) Detectada',
      descEn: 'Blood in urine (hematuria), intense dysuria, or frequent urination (>10 times/day) indicates direct urothelial damage. Complete cessation of ketamine is critical to avoid irreversible bladder shrinkage and surgical cystectomy.',
      descEs: 'Sangre en orina (hematuria), disuria intensa o micción frecuente (>10 veces/día) indican daño urotelial directo. La suspensión total de la ketamina es fundamental para evitar la contracción vesical irreversible y la cistectomía quirúrgica.'
    });
    actionPearls.push({
      tipEn: 'Stop ketamine immediately. Consult a urologist. Start green tea extract (EGCG) and drink isotonic fluids. Avoid caffeine and acidic drinks.',
      tipEs: 'Suspenda la ketamina de inmediato. Consulte a un urólogo. Inicie extracto de té verde (EGCG) y beba líquidos isotónicos. Evite cafeína y bebidas ácidas.'
    });
  }

  // 4. Nitrous Oxide Myelopathy & B12 Inactivation
  if (hasNitrous && hasNumbnessOrTingling) {
    urgentEscalations.push({
      actionEn: 'NEUROLOGICAL RED FLAG: Subacute Combined Degeneration of Spinal Cord. Stop nitrous oxide permanently. Seek urgent medical evaluation for high-dose intramuscular (IM) Vitamin B12 replacement therapy to prevent permanent paralysis.',
      actionEs: 'BANDERA ROJA NEUROLÓGICA: Degeneración combinada subaguda de la médula. Suspenda el óxido nitroso de forma permanente. Busque evaluación médica urgente para terapia de reemplazo con vitamina B12 intramuscular (IM) en dosis altas para evitar parálisis permanente.'
    });
  }

  // 5. General Harm Reduction Points
  if (selectedSubstances.length > 0) {
    actionPearls.push({
      tipEn: 'Always test your substances with chemical reagents and Fentanyl Test Strips (FTS). Counterfeit pills and "pink cocaine" (tusi) frequently contain unexpected adulterants.',
      tipEs: 'Pruebe siempre sus sustancias con reactivos químicos y tiras de fentanilo (FTS). Las pastillas falsificadas y la "cocaína rosa" (tusi) suelen contener adulterantes inesperados.'
    });
    actionPearls.push({
      tipEn: 'Keep naloxone on hand and know rescue breathing. While naloxone does not reverse ketamine, GHB, or MDMA, it reverses unexpected opioid adulteration.',
      tipEs: 'Tenga naloxona a mano y conozca la respiración de rescate. Aunque la naloxona no revierte ketamina, GHB o MDMA, revierte la adulteración inesperada con opioides.'
    });
  }

  return {
    substanceCount: selectedSubstances.length,
    issues,
    urgentEscalations,
    actionPearls
  };
}

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE INVARIANT)
// ============================================================================

let nightlifeState = {
  selectedSubstances: ['mdma'],
  activeTab: 'profiles', // 'profiles' | 'reagents' | 'bladder-neuro' | 'safety-plan'
  fluidIntake: 0.3,
  hasSevereHeadacheOrConfusion: false,
  hasUrinaryBloodOrPain: false,
  hasNumbnessOrTingling: false,
  combiningWithAlcohol: false,
  checklistElectrolytes: false,
  checklistTestStrips: false,
  checklistCoolDowns: false,
  checklistBuddy: false
};

export function getNightlifeState() {
  return {
    ...nightlifeState,
    selectedSubstances: [...nightlifeState.selectedSubstances]
  };
}

export function setNightlifeState(patch = {}) {
  nightlifeState = {
    ...nightlifeState,
    ...patch,
    selectedSubstances: patch.selectedSubstances 
      ? [...patch.selectedSubstances] 
      : nightlifeState.selectedSubstances
  };
}

export function resetNightlifeState() {
  nightlifeState = {
    selectedSubstances: ['mdma'],
    activeTab: 'profiles',
    fluidIntake: 0.3,
    hasSevereHeadacheOrConfusion: false,
    hasUrinaryBloodOrPain: false,
    hasNumbnessOrTingling: false,
    combiningWithAlcohol: false,
    checklistElectrolytes: false,
    checklistTestStrips: false,
    checklistCoolDowns: false,
    checklistBuddy: false
  };
}

// ============================================================================
// BILINGUAL PLAIN-TEXT SUMMARY GENERATOR (ZERO-PII)
// ============================================================================

export function formatNightlifeSummaryText(state = nightlifeState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateNightlifeScenario(state);
  const selectedNames = state.selectedSubstances.map(id => {
    const s = NIGHTLIFE_SUBSTANCES.find(item => item.id === id);
    return s ? (isEs ? s.nameEs : s.nameEn) : id;
  }).join(', ');

  const lines = [];
  lines.push(isEs ? '=== EVALUACIÓN DE REDUCCIÓN DE DAÑOS EN FIESTAS Y CLUBES DE HARBORPATH ===' : '=== HARBORPATH NIGHTLIFE & FESTIVAL HARM REDUCTION REPORT ===');
  lines.push(isEs ? `Fecha de generación: ${new Date().toISOString().split('T')[0]}` : `Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push(isEs ? 'Privacidad: En memoria RAM efímera (Cero almacenamiento en disco/servidor)' : 'Privacy: In-RAM ephemeral state (Zero device storage / Zero PII)');
  lines.push('');
  lines.push(isEs ? `Sustancias evaluadas: ${selectedNames || 'Ninguna'}` : `Evaluated Substances: ${selectedNames || 'None'}`);
  lines.push(isEs ? `Consumo estimado de líquidos: ${state.fluidIntake} L/hora` : `Estimated Fluid Intake: ${state.fluidIntake} L/hour`);
  lines.push('');

  if (evalResult.urgentEscalations.length > 0) {
    lines.push(isEs ? '--- ALERTAS MÉDICAS URGENTES ---' : '--- URGENT MEDICAL ESCALATIONS ---');
    evalResult.urgentEscalations.forEach(e => {
      lines.push(`[!] ${isEs ? e.actionEs : e.actionEn}`);
    });
    lines.push('');
  }

  if (evalResult.issues.length > 0) {
    lines.push(isEs ? '--- RIESGOS FARMACOLÓGICOS Y CLÍNICOS IDENTIFICADOS ---' : '--- IDENTIFIED PHARMACOLOGICAL & CLINICAL RISKS ---');
    evalResult.issues.forEach(iss => {
      lines.push(`* ${isEs ? iss.titleEs : iss.titleEn}`);
      lines.push(`  ${isEs ? iss.descEs : iss.descEn}`);
    });
    lines.push('');
  }

  lines.push(isEs ? '--- RECOMENDACIONES DE REDUCCIÓN DE DAÑOS ---' : '--- HARM REDUCTION ACTION PEARLS ---');
  evalResult.actionPearls.forEach(pt => {
    lines.push(`- ${isEs ? pt.tipEs : pt.tipEn}`);
  });
  lines.push('');
  lines.push(isEs ? 'Línea de Acompañamiento Never Use Alone: ' + NEVER_USE_ALONE.label : 'Never Use Alone Hotline: ' + NEVER_USE_ALONE.label);
  lines.push(isEs ? 'Emergencias Médicas: 911 | Centro de Toxicología: 800-222-1222' : 'Medical Emergencies: 911 | Poison Control: 800-222-1222');

  return lines.join('\n');
}

// ============================================================================
// MAIN VIEW COMPONENT (DOM RENDERING & ACCESSIBILITY)
// ============================================================================

export function nightlifeCareView() {
  const container = h('div', { class: 'nightlife-view' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const localState = getNightlifeState();
    const evalResult = evaluateNightlifeScenario(localState);

    // Header banner
    const header = h('header', { class: 'view-header' }, [
      h('div', { class: 'badge badge-info' }, [
        icon('shield'),
        h('span', {}, isEs ? 'Reducción de Daños en Ocio Nocturno' : 'Nightlife & Festival Harm Reduction')
      ]),
      h('h1', {}, isEs ? 'Guía Clínica de Reducción de Daños en Ocio Nocturno y Clubes' : 'Nightlife, Club Drugs, Dissociatives & Festival Harm Reduction'),
      h('p', { class: 'view-intro' }, isEs
        ? 'Pautas basadas en evidencia para MDMA, ketamina, GHB/GBL, óxido nitroso y 2C-B. Conozca el protocolo de balance de líquidos contra hiponatremia, salud vesical ("vejiga K"), pruebas de reactivos químicos y prevención de intoxicaciones.'
        : 'Evidence-based protocols for MDMA, ketamine, GHB/GBL, nitrous oxide, and 2C-B. Learn the fluid balance protocol to prevent fatal hyponatremia, ketamine bladder health, chemical reagent testing, and non-judgmental nightlife safety.')
    ]);

    // Navigation Tabs
    const tabsNav = h('nav', { class: 'tab-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Ocio Nocturno' : 'Nightlife Tabs' }, [
      h('button', {
        type: 'button',
        class: `tab-btn ${localState.activeTab === 'profiles' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'profiles'),
        onclick: () => { setNightlifeState({ activeTab: 'profiles' }); render(); }
      }, isEs ? 'Perfiles de Sustancias' : 'Substance Profiles'),
      h('button', {
        type: 'button',
        class: `tab-btn ${localState.activeTab === 'reagents' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'reagents'),
        onclick: () => { setNightlifeState({ activeTab: 'reagents' }); render(); }
      }, isEs ? 'Reactivos Químicos' : 'Reagent Testing'),
      h('button', {
        type: 'button',
        class: `tab-btn ${localState.activeTab === 'bladder-neuro' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'bladder-neuro'),
        onclick: () => { setNightlifeState({ activeTab: 'bladder-neuro' }); render(); }
      }, isEs ? 'Salud Vesical y B12' : 'Bladder Health & B12'),
      h('button', {
        type: 'button',
        class: `tab-btn ${localState.activeTab === 'safety-plan' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'safety-plan'),
        onclick: () => { setNightlifeState({ activeTab: 'safety-plan' }); render(); }
      }, isEs ? 'Plan de Fiesta y Exportación' : 'Party Plan & Export')
    ]);

    let tabContent;
    switch (localState.activeTab) {
      case 'reagents':
        tabContent = renderReagentsTab(isEs);
        break;
      case 'bladder-neuro':
        tabContent = renderBladderNeuroTab(isEs, localState, evalResult, render);
        break;
      case 'safety-plan':
        tabContent = renderSafetyPlanTab(isEs, localState, evalResult, render);
        break;
      case 'profiles':
      default:
        tabContent = renderProfilesTab(isEs, localState, evalResult, render);
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
// TAB 1: SUBSTANCE PROFILES
// ----------------------------------------------------------------------------

function renderProfilesTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const selectSection = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Seleccione Sustancias para Explorar Pautas Farmacológicas' : 'Select Substances to Review Clinical Pearls'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Marque las sustancias para ver pautas de reducción de daños, dosificación segura y advertencias de combinación.'
      : 'Select substances to view evidence-based harm reduction guidelines, safe hydration targets, and combination alerts.')
  ]);

  const grid = h('div', { class: 'grid-2-col' });
  NIGHTLIFE_SUBSTANCES.forEach(sub => {
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
          setNightlifeState({ selectedSubstances: updated });
          reRender();
        }
      }),
      h('div', { class: 'checkbox-info' }, [
        h('strong', {}, isEs ? sub.nameEs : sub.nameEn),
        h('span', { class: 'sub-examples' }, isEs ? sub.streetNamesEs : sub.streetNamesEn)
      ])
    ]);
    grid.appendChild(item);
  });
  selectSection.appendChild(grid);

  // Detail Cards for Selected Substances
  const detailsContainer = h('section', { class: 'details-list' });
  localState.selectedSubstances.forEach(subId => {
    const sub = NIGHTLIFE_SUBSTANCES.find(s => s.id === subId);
    if (!sub) return;

    const card = h('article', { class: 'card substance-profile-card' }, [
      h('div', { class: 'flex-between' }, [
        h('h3', {}, isEs ? sub.nameEs : sub.nameEn),
        h('span', { class: 'badge badge-info' }, isEs ? sub.durationEs.split(';')[0] : sub.durationEn.split(';')[0])
      ]),
      h('p', { class: 'mechanism-text' }, [
        h('strong', {}, isEs ? 'Mecanismo de acción: ' : 'Mechanism: '),
        h('span', {}, isEs ? sub.mechanismEs : sub.mechanismEn)
      ]),
      h('p', { class: 'duration-text' }, [
        h('strong', {}, isEs ? 'Tiempos y duración: ' : 'Duration: '),
        h('span', {}, isEs ? sub.durationEs : sub.durationEn)
      ]),
      h('h4', { class: 'margin-top-sm' }, isEs ? 'Pautas Esenciales de Reducción de Daños' : 'Core Harm Reduction Guidelines'),
      h('ul', { class: 'bullet-list' }, (isEs ? sub.harmReductionEs : sub.harmReductionEn).map(tip => h('li', {}, tip)))
    ]);
    detailsContainer.appendChild(card);
  });

  wrapper.appendChild(selectSection);
  wrapper.appendChild(detailsContainer);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 2: REAGENT TESTING MATRIX
// ----------------------------------------------------------------------------

function renderReagentsTab(isEs) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const introCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Estándares de Pruebas Químicas con Reactivos (DanceSafe / Bunk Police)' : 'Chemical Reagent Testing Standards (DanceSafe / Bunk Police)'),
    h('p', {}, isEs
      ? 'Las pruebas con reactivos químicos proporcionan una identificación cualitativa presuntiva. Una gota sobre una mota microscópica de muestra revela el color de reacción en 30-60 segundos.'
      : 'Reagent testing provides presumptive qualitative identification. Placing one drop onto a scraping of sample reveals a distinctive reaction color within 30-60 seconds.'),
    h('div', { class: 'callout callout-warning' }, [
      h('strong', {}, isEs ? '¡Límites Críticos de los Reactivos!' : 'Critical Limits of Chemical Reagents:'),
      h('p', {}, isEs
        ? 'Los reactivos identifican la presencia de la sustancia dominante, pero NO pueden demostrar la ausencia de adulterantes mortales potentes en trazas como el fentanilo o la xilacina. SIEMPRE combine las pruebas de reactivos con Tiras Reactivas de Fentanilo (FTS).'
        : 'Reagents identify the dominant substance present, but CANNOT rule out trace quantities of lethal adulterants like fentanyl or xylazine. ALWAYS combine reagent testing with Fentanyl Test Strips (FTS).')
    ])
  ]);

  const reagentsList = h('div', { class: 'reagents-grid' });
  REAGENT_STANDARDS.forEach(r => {
    const card = h('article', { class: 'card reagent-card' }, [
      h('h4', {}, [icon('flask'), h('span', {}, r.reagent)]),
      h('p', { class: 'text-muted' }, isEs ? r.primaryUseEs : r.primaryUseEn),
      h('div', { class: 'reactions-table' }, r.reactions.map(rx => {
        return h('div', { class: 'reaction-row' }, [
          h('span', { class: 'reaction-substance' }, rx.substance),
          h('span', { class: 'reaction-color' }, isEs ? rx.colorEs : rx.colorEn)
        ]);
      }))
    ]);
    reagentsList.appendChild(card);
  });
  introCard.appendChild(reagentsList);

  wrapper.appendChild(introCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 3: BLADDER HEALTH & B12 NEUROPATHY
// ----------------------------------------------------------------------------

function renderBladderNeuroTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  // Bladder Health Section
  const bladderCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Salud Vesical y Protocolo contra "Vejiga K" (Ketamina)' : 'Ketamine Bladder Health & K-Cystitis Protocol'),
    h('p', {}, isEs
      ? 'La ketamina se metaboliza en norketamina, que se acumula en la orina y ejerce citotoxicidad directa sobre el epitelio vesical, provocando microúlceras, sangrado y fibrosis irreversible.'
      : 'Ketamine is metabolized into norketamine, which concentrates in urine and exerts direct cytotoxicity on the urothelium, causing ulceration, bleeding, and irreversible bladder contracture.'),
    h('div', { class: 'callout callout-info' }, [
      h('strong', {}, isEs ? 'Protocolo Protector con Extracto de Té Verde (EGCG):' : 'Green Tea Extract (EGCG) Bladder Shield:'),
      h('p', {}, isEs
        ? 'Estudios urológicos demuestran que el galato de epigalocatequina (EGCG, 400-800 mg tomado antes de la ketamina) protege las células uroteliales frente al estrés oxidativo de la norketamina. Mantenga además una hidratación abundante con electrolitos y escupa el goteo nasal.'
        : 'Urological studies demonstrate that epigallocatechin gallate (EGCG, 400-800 mg taken prior to ketamine) shields urothelial cells from norketamine-induced oxidative death. Maintain abundant isotonic hydration and spit the nasal drip.')
    ])
  ]);

  bladderCard.appendChild(h('p', { class: 'cross-nav-p' }, [
    h('a', { class: 'btn btn-secondary', href: '#/ketamine-care' }, isEs
      ? 'Ver Navegador Completo de Uropatía por Ketamina y Cólicos'
      : 'View Full Ketamine Uropathy & Bladder Health Navigator'),
  ]));

  // Nitrous & B12 Neuropathy Section
  const b12Card = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Óxido Nitroso y Neuropatía por Inactivación de Vitamina B12' : 'Nitrous Oxide & Vitamin B12 Spinal Demyelination'),
    h('p', {}, isEs
      ? 'El óxido nitroso oxida el átomo de cobalto de la vitamina B12, desactivando permanentemente la metionina sintasa. Sin esta enzima, el cuerpo no puede mantener la mielina que recubre la médula espinal y los nervios periféricos.'
      : 'Nitrous chemically oxidates the cobalt atom in Vitamin B12, permanently deactivating methionine synthase. Without this enzyme, the central nervous system cannot maintain the myelin sheath protecting the spinal cord and peripheral nerves.'),
    h('div', { class: 'callout callout-emergency' }, [
      h('strong', {}, isEs ? 'Señales de Alarma de Degeneración Medular (SCD):' : 'Spinal Cord Demyelination Warning Signs:'),
      h('p', {}, isEs
        ? 'Si siente hormigueo ("alfileres y agujas") en dedos de manos o pies, dificultad para caminar o sensación de descarga eléctrica en la columna: DETENGA EL ÓXIDO NITROSO DE INMEDIATO. Requiere atención médica urgente e inyecciones de vitamina B12 intramuscular en dosis altas para evitar parálisis permanente.'
        : 'If you experience "pins and needles" (paresthesias) in fingers/toes, loss of balance, or an electric shock down your spine: STOP NITROUS OXIDE PERMANENTLY. Urgent medical care and high-dose intramuscular Vitamin B12 injections are required to prevent permanent paralysis.')
    ])
  ]);

  b12Card.appendChild(h('p', { class: 'cross-nav-p' }, [
    h('a', { class: 'btn btn-secondary', href: '#/inhalant-care' }, isEs
      ? 'Ver Navegador Completo de Inhalantes, N₂O y Toxicología'
      : 'View Full Inhalants, Nitrous Oxide & Toxicology Navigator'),
  ]));
  wrapper.appendChild(bladderCard);
  wrapper.appendChild(b12Card);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 4: SAFETY PLAN & EXPORT
// ----------------------------------------------------------------------------

function renderSafetyPlanTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const planCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Lista Interactiva de Seguridad en Ocio Nocturno' : 'Interactive Nightlife Safety Checklist'),
    h('p', {}, isEs
      ? 'Configure su plan de fiesta antes de salir. Todo se almacena únicamente en la memoria RAM y se borra al cerrar la sesión o activar Salida Rápida.'
      : 'Configure your festival and club safety plan before heading out. All data remains strictly in ephemeral RAM and wipes on close or Quick Exit.')
  ]);

  const checklist = h('div', { class: 'checklist-group' }, [
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistElectrolytes,
        onchange: (e) => {
          setNightlifeState({ checklistElectrolytes: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Líquidos y electrolitos: Beberé bebidas con electrolitos (máximo 250-500 mL/h) y evitaré exceso de agua sola' : 'Electrolytes & hydration: I will drink electrolyte fluids (max 250-500 mL/hr) and avoid overdrinking plain water')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistTestStrips,
        onchange: (e) => {
          setNightlifeState({ checklistTestStrips: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Pruebas de sustancias: He probado mis sustancias con reactivos y tiras de fentanilo' : 'Testing kit: I have tested supplies with chemical reagents and fentanyl strips')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistCoolDowns,
        onchange: (e) => {
          setNightlifeState({ checklistCoolDowns: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Zonas de descanso: Tomaré descansos regulares de 15 minutos en áreas frescas para evitar hipertermia' : 'Chill-out breaks: I will take regular 15-minute cool-down breaks to prevent hyperthermia')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistBuddy,
        onchange: (e) => {
          setNightlifeState({ checklistBuddy: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Acompañante y naloxona: Alguien de confianza sabe lo que consumo y tenemos naloxona accesible' : 'Buddy & naloxone: A trusted friend knows what I have taken and naloxone is accessible')
    ])
  ]);
  planCard.appendChild(checklist);

  // Plain Text Export Box
  const exportSection = h('section', { class: 'card export-section' }, [
    h('h3', {}, isEs ? 'Copia y Exportación de Resumen Seguro (Sin PII)' : 'Secure Summary Export (Zero PII)'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Genere y copie un resumen en texto plano para compartir de forma segura con sus acompañantes o equipo de salud.'
      : 'Generate and copy a privacy-safe text summary to share with your friends or medical team.')
  ]);

  const summaryText = formatNightlifeSummaryText(localState, isEs ? 'es' : 'en');
  const textArea = h('textarea', {
    class: 'summary-textarea',
    readonly: 'readonly',
    rows: 14,
    'aria-label': isEs ? 'Resumen de Ocio Nocturno' : 'Nightlife Summary'
  }, summaryText);

  const copyStatus = h('span', { class: 'copy-status', 'aria-live': 'polite' }, '');
  const copyBtn = h('button', {
    type: 'button',
    class: 'btn btn-primary',
    onclick: async () => {
      const ok = await copyText(summaryText, {
        trigger: copyBtn,
        copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
        failedLabel: isEs ? 'Error al copiar' : 'Copy failed',
      });
      copyStatus.textContent = ok
        ? (isEs ? ' ¡Copiado con éxito!' : ' Copied successfully!')
        : (isEs ? ' Error al copiar' : ' Copy failed');
      if (ok) setTimeout(() => { copyStatus.textContent = ''; }, 3000);
    }
  }, [
    icon('copy'),
    h('span', {}, isEs ? 'Copiar Resumen Seguro' : 'Copy Safe Summary')
  ]);

  const resetBtn = h('button', {
    type: 'button',
    class: 'btn btn-secondary',
    onclick: () => {
      resetNightlifeState();
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

  const psychCard = h('section', { class: 'card mt-2' }, [
    h('h3', {}, isEs ? 'Atención en Crisis Psicodélicas, 2C-B y Fenetilaminas' : 'Psychedelic Crisis Care, 2C-B & Phenethylamines'),
    h('p', {}, isEs
      ? 'Para desescalada de viajes difíciles (Zendo / Fireside), dosificación no lineal de 2C-B, alerta de secantes amargos (25I-NBOMe) y contraindicaciones mortales con litio: '
      : 'For psychedelic "bad trip" de-escalation (Zendo / Fireside protocols), steep 2C-B dose curves, bitter NBOMe blotter warnings, and fatal lithium seizure contraindications: '),
    h('a', { href: '#/psychedelic-care' }, isEs
      ? 'Abrir Navegador de Cuidados Psicodélicos y Desescalada 5-HT2A →'
      : 'Open Psychedelic Harm Reduction, 5-HT2A De-Escalation & HPPD Navigator →')
  ]);
  wrapper.appendChild(psychCard);

  const ghbCard = h('section', { class: 'card mt-2' }, [
    h('h3', {}, isEs ? 'Guía Clínica de GHB, GBL, 1,4-BDO y Triaje de Coma (G-Out)' : 'GHB, GBL, 1,4-BDO Harm Reduction, Coma Triage & Withdrawal'),
    h('p', {}, isEs
      ? 'Para triaje de coma por G-out, posición lateral de seguridad, la trampa metabólica del alcohol con 1,4-BDO, dependencia continuada 24/7 y protocolos con baclofeno: '
      : 'For G-out coma airway triage, lateral recovery position, the 1,4-BDO alcohol dehydrogenase trap, 24/7 round-the-clock dependence, and BAP Baclofen protocols: '),
    h('a', { href: '#/ghb-care' }, isEs
      ? 'Abrir Navegador de GHB/GBL, Triaje de Coma y Abstinencia →'
      : 'Open GHB, GBL & 1,4-BDO Harm Reduction, Coma Triage & Withdrawal Navigator →')
  ]);
  wrapper.appendChild(ghbCard);
  return wrapper;
}
