import { h, clear, copyText } from '../dom.js';
import { t, getLang } from '../i18n.js';

function el(tag, opts = {}, ...children) {
  const { className, attrs, ...rest } = opts || {};
  const props = { ...rest };
  if (className) props.class = className;
  if (attrs) Object.assign(props, attrs);
  return h(tag, props, ...children);
}

function makeButton(label, onClick, opts = {}) {
  const { className = 'button', ariaPressed, ...rest } = opts;
  const props = { type: 'button', class: className, onclick: onClick, ...rest };
  if (ariaPressed !== undefined) props['aria-pressed'] = ariaPressed;
  return h('button', props, label);
}

function makeLinkButton(label, href, opts = {}) {
  const { className = 'button secondary', ...rest } = opts;
  return h('a', { href, class: className, ...rest }, label);
}

export const GERIATRIC_SYNDROME_PROFILES = Object.freeze({
  beers_sedative_polypharmacy: Object.freeze({
    id: 'beers_sedative_polypharmacy',
    urgency: 'HIGH RISK',
    badgeEn: 'AGS BEERS 2023 CNS POLYPHARMACY: HIGH FALL, DELIRIUM & RESPIRATORY RISK',
    badgeEs: 'CRITERIOS BEERS AGS 2023 POLIFARMACIA SNC: ALTO RIESGO DE CAÍDAS, DELIRIO Y PARO RESPIRATORIO',
    titleEn: 'AGS Beers Criteria 2023 Sedative & CNS Polypharmacy Warnings',
    titleEs: 'Criterios Beers AGS 2023: Advertencias sobre Sedantes y Polifarmacia del SNC',
    summaryEn:
      'The American Geriatrics Society (AGS) Beers Criteria® strongly cautions against concurrent use of opioids with benzodiazepines, non-benzodiazepine hypnotics (Z-drugs like zolpidem), sedating antihistamines, or high-dose gabapentinoids in older adults due to severe risk of falls, hip fractures, delirium, and fatal synergistic respiratory depression.',
    summaryEs:
      'Los Criterios Beers® de la Sociedad Americana de Geriatría (AGS) desaconsejan enérgicamente el uso simultáneo de opioides con benzodiacepinas, hipnóticos no benzodiacepínicos (fármacos Z como zolpidem), antihistamínicos sedantes o dosis altas de gabapentinoides en adultos mayores por el grave riesgo de caídas, fracturas de cadera, delirio y depresión respiratoria fatal.',
    pathophysiologyEn:
      'Age-associated pharmacokinetics include reduced hepatic CYP450 metabolism (CYP3A4, CYP2C19), reduced renal filtration (eGFR), and an expanded volume of distribution for lipophilic drugs due to higher body fat-to-water ratio. Concurrently, older adults exhibit increased blood-brain barrier permeability and heightened central GABAergic sensitivity. Combining opioids with other CNS depressants multiplies respiratory depression risk and produces profound motor ataxia.',
    pathophysiologyEs:
      'La farmacocinética en la vejez presenta menor metabolismo hepático por CYP450 (CYP3A4, CYP2C19), menor filtración renal (TFGe) y mayor volumen de distribución para fármacos lipofílicos por mayor proporción grasa/agua. Asimismo, aumenta la permeabilidad de la barrera hematoencefálica y la sensibilidad a agonistas GABA. Combinar opioides con otros depresores del SNC multiplica la depresión respiratoria y genera ataxia motora grave.',
    diagnosticsEn: [
      'Screen for co-prescribed benzodiazepines (lorazepam, clonazepam, alprazolam, diazepam), Z-drugs (zolpidem, eszopiclone), muscle relaxants (cyclobenzaprine, carisoprodol), and gabapentinoids (>300 mg/day in reduced eGFR).',
      'Assess sedation depth using the Richmond Agitation-Sedation Scale (RASS) and baseline fall risk via the Timed Up and Go (TUG) test (>12 seconds indicates elevated risk).',
      'Perform medication reconciliation to identify duplicate sedatives across multiple prescribers.'
    ],
    diagnosticsEs: [
      'Identifique benzodiacepinas prescritas (lorazepam, clonazepam, alprazolam, diazepam), fármacos Z (zolpidem, eszopiclona), relajantes musculares (ciclobenzaprina, carisoprodol) y gabapentinoides (>300 mg/día con TFGe reducida).',
      'Evalúe el nivel de sedación con la Escala RASS y el riesgo de caída basal con la prueba Timed Up and Go (TUG >12 s indica riesgo elevado).',
      'Realice conciliación de medicamentos para detectar sedantes duplicados entre múltiples prescriptores.'
    ],
    managementEn: [
      'Deprescribing protocol: Initiate gradual, slow, patient-centered tapers for non-essential sedatives. Never stop long-term benzodiazepines abruptly due to risk of status epilepticus and autonomic rebound.',
      'Do NOT deny or discontinue MOUD (buprenorphine or methadone) solely because an older adult takes prescribed sedatives; untreated opioid use disorder carries a higher mortality risk than co-prescription. Instead, co-manage, slow-taper the sedative, and shorten dispensing intervals.',
      'Prioritize buprenorphine over full agonists (methadone/oxycodone) in older adults whenever clinically feasible due to lower sedation depth and ceiling on respiratory depression.'
    ],
    managementEs: [
      'Protocolo de desprescripción: Inicie reducción gradual, lenta y consensuada de sedantes prescindibles. Nunca suspenda benzodiacepinas de forma abrupta por riesgo de estado epiléptico y rebote autonómico.',
      'NO suspenda ni niegue el TUDO (buprenorfina o metadona) únicamente porque el paciente tome sedantes; el trastorno por consumo de opioides sin tratamiento tiene mayor mortalidad. En su lugar, coordine el cuidado, reduzca lentamente el sedante y acorte los intervalos de dispensación.',
      'Priorice buprenorfina sobre agonistas puros (metadona/oxicodona) en adultos mayores cuando sea viable por menor profundidad sedante y efecto techo respiratorio.'
    ],
    harmReductionEn: [
      'Co-prescribe and distribute multiple 4 mg naloxone nasal spray canisters to co-habitating family members, friends, or caregivers.',
      'Counsel older adults to store naloxone visibly on a nightstand or table—never hidden or locked away in high cabinets.',
      'Warn explicitly against combining sedatives or MOUD with alcohol.'
    ],
    harmReductionEs: [
      'Prescriba y distribuya múltiples dispositivos de naloxona nasal de 4 mg a familiares, convivientes o cuidadores.',
      'Aconseje guardar la naloxona a la vista en la mesita de noche o lugar accesible, nunca guardada bajo llave en estantes altos.',
      'Advierta explícitamente sobre el peligro de combinar sedantes o TUDO con alcohol.'
    ]
  }),

  anticholinergic_cognitive_burden_acb: Object.freeze({
    id: 'anticholinergic_cognitive_burden_acb',
    urgency: 'HIGH RISK',
    badgeEn: 'ACB SCORE >= 3: TRIPLED DELIRIUM INCIDENCE & ACCELERATED DEMENTIA RISK',
    badgeEs: 'PUNTAJE ACB >= 3: TRIPLICA INCIDENCIA DE DELIRIO Y ACELERA RIESGO DE DEMENCIA',
    titleEn: 'Anticholinergic Cognitive Burden (ACB) & Delirium/Dementia Mitigation',
    titleEs: 'Carga Cognitiva Anticolinérgica (ACB) y Mitigación de Delirio y Demencia',
    summaryEn:
      'Cumulative anticholinergic exposure from commonly prescribed pain, allergy, sleep, and psychiatric medications produces severe cognitive decline, urinary retention, bowel dysmotility, and triples the incidence of acute delirium in older adults on opioid therapy or MOUD.',
    summaryEs:
      'La exposición anticolinérgica acumulada por medicamentos comunes para dolor, alergias, sueño y psiquiatría produce deterioro cognitivo grave, retención urinaria, hipomotilidad intestinal y triplica la incidencia de delirio agudo en adultos mayores en terapia opioide o TUDO.',
    pathophysiologyEn:
      'Centrally active anticholinergic compounds cross the blood-brain barrier and antagonize muscarinic M1 and M2 receptors in the prefrontal cortex and hippocampus, impairing cholinergic memory transmission. In older brains with depleted neurochemical reserve, anticholinergic toxicity manifests as acute fluctuating delirium (confusion, visual hallucinations, picking at bedsheets) or accelerated chronic neurocognitive decline.',
    pathophysiologyEs:
      'Los compuestos anticolinérgicos centrales cruzan la barrera hematoencefálica y bloquean receptores muscarínicos M1 y M2 en corteza prefrontal e hipocampo, dañando la neurotransmisión colinérgica. En cerebros senescentes con reserva agotada, la toxicidad se manifiesta como delirio agudo fluctuante (confusión, alucinaciones, inquietud) o aceleración de deterioro neurocognitivo.',
    diagnosticsEn: [
      'Calculate Anticholinergic Cognitive Burden (ACB) score: High burden (3 pts each): diphenhydramine, hydroxyzine, promethazine, amitriptyline, paroxetine, oxybutynin, cyclobenzaprine, meperidine; Moderate burden (2 pts): carbamazepine, loxapine; Mild burden (1 pt): quetiapine, atenolol, prednisone, cetirizine.',
      'A total score >= 3 is clinically toxic and requires prompt deprescribing intervention.',
      'Assess for peripheral anticholinergic hallmarks: extreme dry mouth (xerostomia), blurred near vision, hot dry skin, tachycardia, urinary hesitancy/retention, and constipation.'
    ],
    diagnosticsEs: [
      'Calcule la puntuación ACB: Carga alta (3 pts c/u): difenhidramina, hidroxizina, prometazina, amitriptilina, paroxetina, oxibutinina, ciclobenzaprina, meperidina; Carga moderada (2 pts): carbamazepina, loxapina; Carga leve (1 pt): quetiapina, atenolol, prednisona, cetirizina.',
      'Una puntuación total >= 3 es clínicamente tóxica y exige intervención desprescriptiva inmediata.',
      'Verifique signos periféricos: boca seca intensa (xerostomía), visión borrosa cercana, piel seca y caliente, taquicardia, dificultad o retención urinaria y estreñimiento.'
    ],
    managementEn: [
      'Systematically replace high-anticholinergic medications with non-anticholinergic alternatives: switch diphenhydramine/hydroxyzine for sleep to non-pharmacologic sleep hygiene or low-dose melatonin; switch oxybutynin to mirabegron or pelvic floor therapy.',
      'If an older adult presents with acute agitation or delirium, avoid adding sedating antihistamines or anticholinergic antiemetics which compound neurotoxicity; use non-pharmacologic reorientation and check for urinary retention or fecal impaction.',
      'Target total ACB score: 0 to < 3.'
    ],
    managementEs: [
      'Sustituya sistemáticamente fármacos de alta carga anticolinérgica: reemplace difenhidramina/hidroxizina para insomnio con higiene del sueño o melatonina en dosis baja; cambie oxibutinina por mirabegrón o terapia del suelo pélvico.',
      'Si un adulto mayor presenta agitación o delirio agudo, evite añadir antihistamínicos sedantes o antieméticos anticolinérgicos que agravan la neurotoxicidad; use reorientación no farmacológica y descarte retención urinaria o impacto fecal.',
      'Meta de puntuación ACB total: 0 a < 3.'
    ],
    harmReductionEn: [
      'Warn families and patients that over-the-counter "PM" pain relievers and nighttime sleep aids contain diphenhydramine (Benadryl) and carry high anticholinergic risk.',
      'Provide large-print medication schedules and advocate for pharmacist-led comprehensive medication reviews.'
    ],
    harmReductionEs: [
      'Advierta a familias y pacientes que los analgésicos de venta libre con denominación "PM" o nocturnos contienen difenhidramina y conllevan alto riesgo anticolinérgico.',
      'Proporcione cronogramas de medicación con letra grande y promueva revisiones integrales del tratamiento con farmacéuticos.'
    ]
  }),

  geriatric_moud_pharmacokinetics: Object.freeze({
    id: 'geriatric_moud_pharmacokinetics',
    urgency: 'CLINICAL PROTOCOL',
    badgeEn: 'RENAL & HEPATIC CLEARANCE, QTc PROLONGATION & BUPRENORPHINE VS METHADONE',
    badgeEs: 'ACLARAMIENTO RENAL Y HEPÁTICO, PROLONGACIÓN QTc Y BUPRENORFINA VS METADONA',
    titleEn: 'Geriatric MOUD Pharmacokinetics, Organ Clearance & Cardiac Safety',
    titleEs: 'Farmacocinética del TUDO en Geriatría, Aclaramiento Orgánico y Seguridad Cardíaca',
    summaryEn:
      'Physiological aging decreases renal glomeruli and hepatic clearance while prolonging drug elimination half-lives. Buprenorphine is hepatically metabolized without relying on renal clearance, offering superior safety in renal impairment. Methadone exhibits prolonged, variable accumulation half-lives and dose-dependent QTc prolongation requiring cautious titration and cardiac monitoring.',
    summaryEs:
      'El envejecimiento fisiológico reduce la filtración glomerular y el aclaramiento hepático, prolongando la vida media de eliminación. La buprenorfina se metaboliza por vía hepática sin depender del riñón, ofreciendo mayor seguridad en insuficiencia renal. La metadona presenta una vida media prolongada y variable con riesgo de acumulación y prolongación del intervalo QTc, requiriendo titulación prudente y vigilancia cardíaca.',
    pathophysiologyEn:
      'Age-related decline in hepatic cytochrome P450 blood flow reduces first-pass clearance. Methadone clearance varies widely through CYP3A4 and CYP2B6; tissue accumulation occurs over 3-7 days after dosage changes, predisposing elders to delayed sedation and respiratory failure. Furthermore, methadone blocks cardiac hERG potassium channels, prolonging ventricular repolarization (QTc). In contrast, buprenorphine behaves as a partial mu-opioid agonist with high receptor affinity, lower peak sedation, and minimal cardiac electrophysiologic effect.',
    pathophysiologyEs:
      'La caída del flujo sanguíneo hepático dependiente de la edad reduce el aclaramiento de primer paso. El aclaramiento de metadona varía según CYP3A4 y CYP2B6; la acumulación en tejidos ocurre a lo largo de 3-7 días tras un ajuste, predisponiendo a sedación tardía y paro respiratorio. Además, la metadona bloquea los canales cardíacos de potasio hERG, prolongando el QTc. En contraste, la buprenorfina actúa como agonista parcial mu con alta afinidad, menor pico sedante y mínimo efecto electrofisiológico cardíaco.',
    diagnosticsEn: [
      'Screen renal function: baseline serum creatinine, estimated GFR (CKD-EPI or Cockcroft-Gault). In eGFR < 30 mL/min, buprenorphine requires no primary dosage reduction, whereas full agonists require interval elongation.',
      'Methadone cardiac screening: Baseline 12-lead ECG; calculate QTc (Fridericia formula preferred). QTc > 450 ms in men or > 470 ms in women signals caution; QTc > 500 ms warrants dosage reduction or rotation to buprenorphine.',
      'Check baseline serum potassium (maintain >= 4.0 mEq/L) and magnesium (maintain >= 2.0 mg/dL) before and during methadone therapy.'
    ],
    diagnosticsEs: [
      'Función renal: creatinina basal y TFGe estimada. Con TFGe < 30 mL/min, la buprenorfina no requiere ajuste primario de dosis, mientras que los agonistas puros exigen espaciar intervalos.',
      'Evaluación cardíaca para metadona: ECG basal de 12 derivaciones; calcular QTc (fórmula de Fridericia). QTc > 450 ms en varones o > 470 ms en mujeres aconseja cautela; QTc > 500 ms exige reducir dosis o rotar a buprenorfina.',
      'Monitoree potasio sérico (mantener >= 4.0 mEq/L) y magnesio (mantener >= 2.0 mg/dL) antes y durante el tratamiento con metadona.'
    ],
    managementEn: [
      'Buprenorphine: Preferred first-line MOUD in geriatric patients. Note that xerostomia (dry mouth) common in elders impairs sublingual tablet dissolution; instruct patients to moisten the mouth with water before placing the sublingual film/tablet.',
      'Consider long-acting monthly subcutaneous buprenorphine depot (e.g. Sublocade) for stable patients with cognitive impairment or caregiver administration burden.',
      'Methadone: "Start low, go slow." Starting dose: 10-20 mg daily; titrate upward in increments of no more than 5 mg every 7-14 days to allow full pharmacokinetic steady-state equilibration and avoid cumulative sedation on days 3-5.'
    ],
    managementEs: [
      'Buprenorfina: Fármaco de primera línea preferido en geriatría. Tenga en cuenta que la boca seca común en ancianos retrasa la disolución sublingual; indique humedecer la boca con agua antes de colocar la película/tableta.',
      'Considere formulación de depósito subcutáneo mensual de buprenorfina en pacientes estables con deterioro cognitivo o dificultad para la administración diaria.',
      'Metadona: "Comenzar bajo e ir despacio". Dosis inicial: 10-20 mg/día; aumentos no superiores a 5 mg cada 7-14 días para permitir equilibrio farmacocinético y prevenir sedación acumulativa entre los días 3 y 5.'
    ],
    harmReductionEn: [
      'Screen for drug-drug interactions: avoid concurrent prescription of strong CYP3A4 inhibitors (ketoconazole, fluconazole, macrolides) or other QTc-prolonging agents (ciprofloxacin, citalopram, ondansetron).',
      'Provide medication lockboxes and clearly marked dosage calendars.'
    ],
    harmReductionEs: [
      'Revise interacciones farmacológicas: evite inhibidores potentes de CYP3A4 (azoles, macrólidos) u otros fármacos que alargan el QTc (ciprofloxacino, citalopram, ondansetrón).',
      'Entregue cajas de seguridad para medicamentos y calendarios de dosificación claramente rotulados.'
    ]
  }),

  orthostatic_hypotension_fall_fracture: Object.freeze({
    id: 'orthostatic_hypotension_fall_fracture',
    urgency: 'HIGH RISK',
    badgeEn: 'CDC STEADI PROTOCOL: ORTHOSTASIS SCREENING & HIP FRACTURE PREVENTION',
    badgeEs: 'PROTOCOLO STEADI CDC: DETECCIÓN DE ORTOSTATISMO Y PREVENCIÓN DE FRACTURA DE CADERA',
    titleEn: 'Orthostatic Hypotension, Sedation & Fall/Hip Fracture Prevention',
    titleEs: 'Hipotensión Ortostática, Sedación y Prevención de Caídas y Fracturas de Cadera',
    summaryEn:
      'Blunted baroreceptor sensitivity combined with vasodilating or sedating medications (clonidine, methadone, trazodone, antipsychotics) creates profound postural blood pressure drops upon standing. Falls represent the leading cause of accidental death and traumatic brain injury in older adults; hip fractures carry a 20-30% 1-year mortality.',
    summaryEs:
      'La menor sensibilidad de los barorreceptores combinada con fármacos vasodilatadores o sedantes (clonidina, metadona, trazodona, antipsicóticos) provoca caídas tensionales bruscas al ponerse de pie. Las caídas son la principal causa de muerte accidental y traumatismo craneoencefálico en adultos mayores; las fracturas de cadera conllevan una mortalidad del 20-30% al año.',
    pathophysiologyEn:
      'Aging decreases vascular elasticity and blunts autonomic cardioacceleration in response to upright posture. Medications with alpha-1 adrenergic antagonism or central sympatholytic properties (clonidine used for withdrawal, trazodone, tricyclics, phenothiazines) impair compensatory vasoconstriction, resulting in cerebral hypoperfusion, syncope, and mechanical falls upon standing or during nocturnal bathroom visits.',
    pathophysiologyEs:
      'El envejecimiento reduce la elasticidad vascular y atenúa la cardioaceleración refleja al incorporarse. Fármacos con efecto antagonista alfa-1 o simpaticolíticos centrales (clonidina para abstinencia, trazodona, tricíclicos, fenotiazinas) impiden la vasoconstricción compensatoria, provocando hipoperfusión cerebral, síncope y caídas al ponerse de pie o al levantarse de noche al baño.',
    diagnosticsEn: [
      'Measure orthostatic vitals: Supine blood pressure and pulse after 5 minutes of rest, followed by standing measurements at 1 minute and 3 minutes. Diagnostic criteria: Systolic drop >= 20 mmHg or diastolic drop >= 10 mmHg within 3 minutes of standing.',
      'CDC STEADI fall risk screening: Ask 3 questions (Fallen in past year? Feel unsteady when standing or walking? Worry about falling?). If yes to any, perform TUG test and comprehensive environmental review.',
      'Check bone mineral density history (DEXA) and vitamin D / calcium status.'
    ],
    diagnosticsEs: [
      'Mida constantes ortostáticas: PA y pulso en decúbito tras 5 min de reposo, luego de pie al minuto 1 y 3. Criterio diagnóstico: caída sistólica >= 20 mmHg o diastólica >= 10 mmHg a los 3 min.',
      'Tamizaje de riesgo de caídas STEADI de los CDC: 3 preguntas (¿Ha caído en el último año? ¿Se siente inestable al caminar? ¿Teme caerse?). Si responde sí a alguna, realice prueba TUG y revisión de entorno.',
      'Revise antecedentes de densidad mineral ósea (DEXA) y niveles de vitamina D y calcio.'
    ],
    managementEn: [
      'Careful withdrawal medication titration: Avoid high-dose clonidine for opioid withdrawal; if necessary, limit to 0.1 mg BID with strict orthostatic blood pressure parameters (hold if SBP < 100 mmHg).',
      'Hydration: Encourage 1.5 to 2.0 L oral fluid daily unless contraindicated by heart failure or severe renal failure.',
      'Postural education: Instruct patients to pause on the edge of the bed for 1-2 minutes before rising to standing; elevate head of bed 10-15 degrees; consider compression stockings (20-30 mmHg) if tolerated.',
      'Physical therapy referral for strength training, gait evaluation, and assistive device prescription (walker, cane).'
    ],
    managementEs: [
      'Titulación prudente de fármacos para abstinencia: Evite clonidina en dosis altas; si es necesaria, limite a 0,1 mg cada 12 h con parámetros estrictos de presión ortostática (suspender si PAS < 100 mmHg).',
      'Hidratación: Estimule ingesta de 1,5 a 2,0 L de líquidos diarios salvo contraindicación por insuficiencia cardíaca o renal severa.',
      'Educación postural: Indique pausar al borde de la cama 1-2 minutos antes de ponerse de pie; elevar cabecera 10-15 grados; valorar medias de compresión (20-30 mmHg) si se toleran.',
      'Derivación a fisioterapia para entrenamiento de fuerza, marcha y prescripción de ayudas técnicas (andador, bastón).'
    ],
    harmReductionEn: [
      'Install motion-activated nightlights along the pathway between bedroom and bathroom to prevent dark nocturnal falls.',
      'Remove loose throw rugs, declutter floor spaces, and install bathroom grab bars.',
      'Provide wearable medical alert devices or mobile SOS buttons for elders living alone.'
    ],
    harmReductionEs: [
      'Instale luces nocturnas con sensor de movimiento entre el dormitorio y el baño para evitar caídas en la oscuridad.',
      'Retire alfombras sueltas, despeje cables del suelo e instale barras de apoyo en el baño.',
      'Facilite dispositivos de alerta médica o botones SOS portátiles para quienes viven solos.'
    ]
  }),

  severe_oic_fecal_impaction: Object.freeze({
    id: 'severe_oic_fecal_impaction',
    urgency: 'HIGH RISK',
    badgeEn: 'PREVENT OBSTRUCTION, STERCORAL PERFORATION & OIC-INDUCED DELIRIUM',
    badgeEs: 'PREVENGA OBSTRUCCIÓN, PERFORACIÓN ESTERCORAL Y DELIRIO POR OIC',
    titleEn: 'Severe Opioid-Induced Constipation (OIC) & Fecal Impaction Prevention',
    titleEs: 'Estreñimiento Severo Inducido por Opioides (OIC) e Impacto Fecal',
    summaryEn:
      'Mu-opioid receptor binding in the enteric plexus profoundly arrests colonic motility. In older adults, unmitigated OIC rapidly escalates into coprostasis, fecal impaction, stercoral ulceration, bowel perforation, peritonitis, and acute hyperactive delirium.',
    summaryEs:
      'La unión a receptores opioides mu en el plexo entérico paraliza la motilidad colónica. En adultos mayores, el estreñimiento no tratado progresa rápidamente a coprostasis, impacto fecal, úlceras estercorales, perforación intestinal, peritonitis y delirio agudo hiperactivo.',
    pathophysiologyEn:
      'Opioids stimulate enteric mu-opioid receptors in the myenteric and submucosal plexuses, inhibiting peristaltic propulsion, increasing non-propulsive segmental tone, and suppressing mucosal fluid secretions. Unlike opioid-induced sedation or nausea, tolerance NEVER develops to opioid-induced constipation. Slower transit leads to desiccation of stool into hard fecaliths that erode colonic mucosa, creating pressure necrosis, stercoral ulceration, and perforation.',
    pathophysiologyEs:
      'Los opioides estimulan receptores mu en plexos mientérico y submucoso, suprimiendo la propulsión peristáltica, aumentando el tono segmentario no propulsivo y reduciendo secreciones. A diferencia de la sedación o náuseas, NUNCA se desarrolla tolerancia al estreñimiento por opioides. El tránsito enlentecido seca las heces formando fecalomas que erosionan la mucosa, causando necrosis por presión, úlceras estercorales y perforación.',
    diagnosticsEn: [
      'Ask about bowel movement frequency, straining, hard lumpy stools (Bristol Stool Form Scale Types 1-2), and paradoxical liquid stool overflow leaking around a rock-hard fecal impaction.',
      'Abdominal examination: Auscultate bowel sounds, palpate for sigmoid fecal masses and peritoneal tenderness.',
      'Perform digital rectal exam (DRE) if impaction or overflow diarrhea is suspected; obtain abdominal plain radiographs if high impaction or obstruction suspected.'
    ],
    diagnosticsEs: [
      'Pregunte sobre frecuencia de evacuación, pujo, heces duras en bolas (Escala de Bristol Tipos 1-2) y diarrea paradójica por rebosamiento alrededor de un impacto fecal pétreo.',
      'Exploración abdominal: Ausculte ruidos intestinales, palpe masas fecales en sigmoides y signos peritoneales.',
      'Tacto rectal si sospecha impacto fecal o diarrea por rebosamiento; radiografía de abdomen si sospecha impacto alto u obstrucción.'
    ],
    managementEn: [
      'Mandatory prophylactic bowel regimen whenever full or partial opioid agonists are prescribed: Daily osmotic laxative (Polyethylene Glycol / PEG 3350, 17g/day in water) + stimulant laxative (Senna 1-2 tablets daily or at bedtime).',
      'AVOID bulk-forming laxatives (psyllium / Metamucil) in bedbound or dehydrated older adults, as they can consolidate into concrete-like obstructive masses in the hypomotile colon.',
      'For refractory OIC: Prescribe Peripherally Acting Mu-Opioid Receptor Antagonists (PAMORAs) such as Methylnaltrexone (subcutaneous or oral) or Naloxegol (oral). PAMORAs do NOT cross the blood-brain barrier, effectively restoring bowel peristalsis without precipitating central opioid withdrawal or reversing MOUD efficacy.',
      'For established fecal impaction: Digital disimpaction with lubricant and local anesthetic, followed by glycerine/bisacodyl suppositories or mineral oil retention enemas.'
    ],
    managementEs: [
      'Régimen profiláctico obligatorio al prescribir agonistas opioides: Laxante osmótico diario (Polietilenglicol / PEG 3350, 17 g/día en agua) + laxante estimulante (Senósidos 1-2 tabletas al acostarse).',
      'EVITE formadores de volumen (psyllium / Metamucil) en personas encamadas o deshidratadas; pueden consolidar masas obstructivas pétreas en un colon hipomóvil.',
      'Para OIC refractario: Prescriba Antagonistas de Receptores Mu Opioides de Acción Periférica (PAMORA) como Metilnaltrexona (sc u oral) o Naloxegol (oral). No cruzan la barrera hematoencefálica, restaurando el tránsito sin causar abstinencia central ni revertir el TUDO.',
      'Para impacto fecal establecido: Desimpactación digital con lubricante y anestésico local, seguida de supositorios de glicerina/bisacodilo o enemas de retención de aceite mineral.'
    ],
    harmReductionEn: [
      'Delirium trigger recognition: Always check for severe constipation or fecal impaction in any older adult presenting with sudden cognitive or behavioral decline.',
      'Maintain adequate fluid intake and regular physical ambulation whenever possible.'
    ],
    harmReductionEs: [
      'Detección de causas de delirio: Descarte siempre estreñimiento severo o impacto fecal ante cualquier deterioro cognitivo o conductual repentino en un anciano.',
      'Mantenga hidratación adecuada y deambulación regular siempre que sea posible.'
    ]
  }),

  cognitive_impairment_caregiver_moud: Object.freeze({
    id: 'cognitive_impairment_caregiver_moud',
    urgency: 'CLINICAL PROTOCOL',
    badgeEn: 'EXECUTIVE DYSFUNCTION, SAFE STORAGE & CAREGIVER-ADMINISTERED MOUD PROTOCOLS',
    badgeEs: 'DISFUNCIÓN EJECUTIVA, ALMACENAMIENTO SEGURO Y PROTOCOLOS DE TUDO ADMINISTRADO POR CUIDADORES',
    titleEn: 'Cognitive Impairment, Dementia & Caregiver-Supported MOUD Protocols',
    titleEs: 'Deterioro Cognitivo, Demencia y Protocolos de TUDO con Apoyo de Cuidadores',
    summaryEn:
      'Mild Cognitive Impairment (MCI) and dementias compromise prospective memory and medication adherence. Older adults risk accidental double-dosing (taking medication twice forgetting the first dose) or accidental omission triggering withdrawal and relapse. Structured caregiver protocols and locked automated dispensers preserve safety and treatment retention.',
    summaryEs:
      'El deterioro cognitivo leve (DCL) y las demencias afectan la memoria prospectiva y la adherencia. Los adultos mayores corren riesgo de duplicación accidental de dosis (tomar la dosis dos veces por olvido) u omisiones que desencadenan abstinencia y recaídas. Los protocolos estructurados con cuidadores y dispensadores automáticos con llave garantizan la seguridad y continuidad.',
    pathophysiologyEn:
      'Degeneration of frontal-subcortical circuits diminishes executive planning, inhibitory control, and time comprehension. Patients may take multiple doses of sedatives or MOUD within minutes, unaware that they have already ingested their morning dose. Conversely, missed doses induce painful withdrawal, prompting erratic self-medication with unprescribed opioids or sedatives.',
    pathophysiologyEs:
      'La degeneración de circuitos frontosubcorticales deteriora la planificación ejecutiva, el control inhibitorio y la orientación temporal. El paciente puede tomar múltiples dosis de sedantes o TUDO en minutos sin recordar haber tomado la matutina. Por el contrario, las dosis omitidas provocan abstinencia dolorosa e inducen a la automedicación errática con opioides o sedantes no recetados.',
    diagnosticsEn: [
      'Screen cognitive status with the Montreal Cognitive Assessment (MoCA) or Mini-Cog (3-word recall + clock drawing test; score < 3 indicates cognitive impairment).',
      'Assess activities of daily living (ADLs / IADLs), specifically independent medication management ability.',
      'Evaluate family/caregiver capacity, schedule, and reliability; screen for caregiver strain.'
    ],
    diagnosticsEs: [
      'Evalúe cognición con la Evaluación Cognitiva de Montreal (MoCA) o Mini-Cog (recuerdo de 3 palabras + dibujo del reloj; puntaje < 3 indica deterioro cognitivo).',
      'Valore actividades instrumentales de la vida diaria (AIVD), específicamente la capacidad de autogestión de medicamentos.',
      'Evalúe la capacidad, horario y fiabilidad del cuidador o familiar; detecte sobrecarga del cuidador.'
    ],
    managementEn: [
      'Caregiver-supervised administration: Designate a primary trusted caregiver or home health nurse to manage, store, and administer all daily MOUD and psychoactive medications.',
      'Tamper-resistant dispensing: Implement locked electronic pill carousels that dispense only one dose at programmed time windows and remain locked between doses.',
      'Opioid Treatment Program (OTP) accommodations: Under revised 42 CFR Part 8 regulations, utilize medical exceptions for stable take-home schedules or authorized designated proxy pick-up for homebound or cognitively impaired elders.',
      'Consider long-acting monthly subcutaneous buprenorphine depot (Sublocade) administered in the clinic to eliminate daily adherence and double-dosing hazards entirely.'
    ],
    managementEs: [
      'Administración supervisada por cuidador: Asigne a un familiar de confianza o enfermera domiciliaria la custodia, almacenamiento y administración del TUDO y psicofármacos diarios.',
      'Dispensación a prueba de manipulaciones: Utilice pastilleros electrónicos con llave que dispensan una sola dosis en ventanas programadas y permanecen bloqueados el resto del día.',
      'Adaptaciones en Programas de Tratamiento con Opioides (OTP): Bajo las normativas actualizadas de 42 CFR Parte 8, aplique excepciones médicas para dosis para llevar o autorice a un apoderado para recoger la medicación.',
      'Valore el implante de buprenorfina subcutánea de depósito mensual en clínica para suprimir por completo los riesgos de adherencia y sobredosis accidental por duplicación.'
    ],
    harmReductionEn: [
      'Provide locked medication lockboxes with digital codes known only to the designated caregiver.',
      'Train caregivers in recognizing overdose vs delirium vs oversedation, and ensure naloxone nasal spray is readily accessible and unexpired.'
    ],
    harmReductionEs: [
      'Entregue cajas de seguridad con clave digital conocida únicamente por el cuidador designado.',
      'Capacite a los cuidadores para diferenciar sobredosis, delirio y sobresedación, y asegúrese de que tengan naloxona nasal disponible y vigente.'
    ]
  })
});

export const GERIATRIC_HARM_REDUCTION_RULES = Object.freeze([
  {
    id: 'beers_cns_sedatives',
    ruleEn: 'Avoid concurrent benzodiazepines, Z-drugs, or high-dose gabapentinoids with opioids (AGS Beers Criteria 2023). Taper gradually.',
    ruleEs: 'Evite benzodiacepinas, fármacos Z o gabapentinoides en dosis altas junto con opioides (Criterios Beers 2023). Reduzca gradualmente.'
  },
  {
    id: 'anticholinergic_burden',
    ruleEn: 'Keep Anticholinergic Cognitive Burden (ACB) < 3. Deprescribe PM sleep aids, sedating antihistamines, and tricyclics to prevent delirium.',
    ruleEs: 'Mantenga la Carga Cognitiva Anticolinérgica (ACB) < 3. Desprescriba somníferos "PM", antihistamínicos sedantes y tricíclicos para evitar delirio.'
  },
  {
    id: 'moud_organ_clearance',
    ruleEn: 'Prefer buprenorphine in renal impairment (no renal dosage reduction). If prescribing methadone, monitor QTc on 12-lead ECG and maintain K+ >= 4.0 mEq/L.',
    ruleEs: 'Prefiera buprenorfina en falla renal (no requiere ajuste renal). Si usa metadona, vigile el QTc con ECG y mantenga K+ >= 4.0 mEq/L.'
  },
  {
    id: 'steadi_fall_prevention',
    ruleEn: 'Screen orthostatic vitals before titrating withdrawal medications; avoid high-dose clonidine; install nightlights for nocturnal bathroom trips.',
    ruleEs: 'Mida constantes ortostáticas antes de titular fármacos para abstinencia; evite clonidina alta; instale luces nocturnas para visitas al baño.'
  },
  {
    id: 'mandatory_oic_prophylaxis',
    ruleEn: 'Prescribe daily osmotic laxative (PEG 3350) + stimulant laxative (Senna) from day 1 of opioid therapy; avoid bulk-forming psyllium.',
    ruleEs: 'Prescriba laxante osmótico diario (PEG 3350) + estimulante (Senósidos) desde el día 1 con opioides; evite formadores de volumen (psyllium).'
  },
  {
    id: 'caregiver_supervised_dispensing',
    ruleEn: 'For elders with cognitive impairment or dementia, utilize locked automated dispensers or designate trusted caregivers to avoid accidental double-dosing.',
    ruleEs: 'En ancianos con deterioro cognitivo o demencia, use dispensadores con llave o asigne a un cuidador para evitar la duplicación accidental.'
  }
]);

const initialGeriatricState = Object.freeze({
  selectedSyndromeId: 'beers_sedative_polypharmacy',
  ageTier: '75plus', // '65-74' or '75plus'
  onBenzos: false,
  onZDrugs: false,
  onAnticholinergics: false,
  onOpioidsMOUD: true,
  highFallRisk: false,
  renalImpairment: false,
  historyDelirium: false,
  cognitiveImpairment: false,
  severeConstipation: false,
  clinicalNotes: ''
});

let geriatricState = { ...initialGeriatricState };
const listeners = new Set();

export function getGeriatricState() {
  return { ...geriatricState };
}

export function setGeriatricState(partial) {
  geriatricState = { ...geriatricState, ...partial };
  for (const fn of listeners) {
    try {
      fn(geriatricState);
    } catch (err) {
      console.error('Error in geriatricState listener:', err);
    }
  }
}

export function resetGeriatricState() {
  geriatricState = { ...initialGeriatricState };
  for (const fn of listeners) {
    try {
      fn(geriatricState);
    } catch (err) {
      console.error('Error in geriatricState listener reset:', err);
    }
  }
}

export function subscribeGeriatricState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function evaluateGeriatricRisk(state) {
  const flags = [];
  const beersAlerts = [];
  let acbScore = 0;
  let riskScore = 0;

  if (state.ageTier === '75plus') {
    riskScore += 1;
    flags.push({
      en: 'Age >= 75: Decreased physiological reserve and blunted renal/hepatic drug clearance.',
      es: 'Edad >= 75: Menor reserva fisiológica y aclaramiento hepatorrenal enlentecido.'
    });
  }

  if (state.onOpioidsMOUD && (state.onBenzos || state.onZDrugs)) {
    riskScore += 3;
    beersAlerts.push({
      en: 'AGS Beers 2023 Black Box: Concurrent Opioids + Benzodiazepines/Z-Drugs drastically elevates severe sedation, respiratory depression, and fatal overdose.',
      es: 'Criterios Beers AGS 2023: Opioides concurrentes + Benzodiacepinas/Fármacos Z elevan drásticamente la sobresedación, depresión respiratoria y sobredosis fatal.'
    });
  }

  if (state.onAnticholinergics) {
    acbScore += 3;
    riskScore += 2;
    flags.push({
      en: 'Anticholinergic Cognitive Burden elevated (ACB >= 3): Tripled risk of acute delirium, urinary retention, and accelerated dementia.',
      es: 'Carga Cognitiva Anticolinérgica elevada (ACB >= 3): Triplica el riesgo de delirio agudo, retención urinaria y deterioro cognitivo acelerado.'
    });
  }

  if (state.highFallRisk) {
    riskScore += 2;
    flags.push({
      en: 'Elevated fall and fracture risk (CDC STEADI): High vulnerability to subdural hematoma and hip fracture with any sedating medication.',
      es: 'Riesgo elevado de caídas y fracturas (CDC STEADI): Alta vulnerabilidad a hematoma subdural y fractura de cadera con sedantes.'
    });
  }

  if (state.renalImpairment) {
    riskScore += 2;
    flags.push({
      en: 'Renal impairment / low eGFR: Active metabolites of morphine/codeine/oxycodone accumulate; buprenorphine is the preferred safer MOUD choice.',
      es: 'Falla renal / TFGe disminuida: Los metabolitos activos de morfina/oxicodona se acumulan; la buprenorfina es el TUDO de elección por seguridad.'
    });
  }

  if (state.cognitiveImpairment) {
    riskScore += 2;
    flags.push({
      en: 'Cognitive impairment / dementia present: Severe hazard for accidental double-dosing or missed doses; locked automated dispensing or caregiver supervision required.',
      es: 'Deterioro cognitivo / demencia presente: Grave riesgo de duplicación accidental de dosis u omisiones; requiere dispensador con llave o supervisión.'
    });
  }

  if (state.severeConstipation) {
    riskScore += 2;
    flags.push({
      en: 'Severe constipation / suspected OIC: High risk of fecal impaction, stercoral ulceration, and constipation-induced acute delirium.',
      es: 'Estreñimiento severo / sospecha de OIC: Alto riesgo de impacto fecal, úlcera estercoral y delirio agudo inducido por constipación.'
    });
  }

  let tier = 'STANDARD';
  if (riskScore >= 4 || beersAlerts.length > 0) {
    tier = 'HIGH';
  } else if (riskScore >= 2) {
    tier = 'MODERATE';
  }

  return {
    tier,
    riskScore,
    acbScore,
    flags,
    beersAlerts
  };
}

export function formatGeriatricSbarText(state) {
  const evalResult = evaluateGeriatricRisk(state);
  const syndrome = GERIATRIC_SYNDROME_PROFILES[state.selectedSyndromeId] || GERIATRIC_SYNDROME_PROFILES.beers_sedative_polypharmacy;

  const lines = [
    '=== HARBORPATH GERIATRIC ADDICTION MEDICINE & BEERS CRITERIA SBAR ===',
    'CONFIDENTIALITY: ZERO-PII IN-RAM CLINICAL DECISION SUPPORT',
    '',
    `[S] SITUATION:`,
    `Patient Age Group: ${state.ageTier === '75plus' ? 'Age 75+' : 'Age 65-74'}`,
    `Primary Focus Area: ${syndrome.titleEn} (${syndrome.urgency})`,
    `Overall Geriatric Clinical Risk Tier: ${evalResult.tier} (Risk Score: ${evalResult.riskScore})`,
    `Estimated Anticholinergic Cognitive Burden: ACB ~${evalResult.acbScore}`,
    '',
    `[B] BACKGROUND / ACTIVE RISK FACTORS:`,
    `- Opioid / MOUD Therapy: ${state.onOpioidsMOUD ? 'YES' : 'NO'}`,
    `- Benzodiazepines Co-Prescribed: ${state.onBenzos ? 'YES (AGS Beers Warning)' : 'NO'}`,
    `- Z-Drugs (Zolpidem/Eszopiclone): ${state.onZDrugs ? 'YES (Fall/Delirium Trigger)' : 'NO'}`,
    `- High Anticholinergic Burden: ${state.onAnticholinergics ? 'YES (ACB >= 3 Risk)' : 'NO'}`,
    `- Documented Fall Risk / STEADI: ${state.highFallRisk ? 'HIGH RISK' : 'Standard'}`,
    `- Renal Impairment / Low eGFR: ${state.renalImpairment ? 'PRESENT' : 'None Reported'}`,
    `- Cognitive Impairment / Dementia: ${state.cognitiveImpairment ? 'PRESENT (Accidental Dosing Risk)' : 'None Reported'}`,
    `- Severe Constipation / OIC: ${state.severeConstipation ? 'PRESENT (Impaction Risk)' : 'Managed'}`,
    '',
    `[A] CLINICAL ASSESSMENT & BEERS ALERTS:`
  ];

  if (evalResult.beersAlerts.length > 0) {
    for (const b of evalResult.beersAlerts) {
      lines.push(`* BEERS ALERT: ${b.en}`);
    }
  }

  for (const f of evalResult.flags) {
    lines.push(`* ${f.en}`);
  }

  lines.push('');
  lines.push(`[R] RECOMMENDATIONS & HARM REDUCTION:`);
  for (const rule of GERIATRIC_HARM_REDUCTION_RULES) {
    lines.push(`- ${rule.ruleEn}`);
  }

  if (state.clinicalNotes && state.clinicalNotes.trim()) {
    lines.push('');
    lines.push(`CLINICAL RAM NOTES:`);
    lines.push(state.clinicalNotes.trim());
  }

  lines.push('');
  lines.push('Generated securely in-RAM on HarborPath. Ephemeral in-memory clinical decision support.');
  return lines.join('\n');
}

export function geriatricCareView() {
  const isEs = getLang() === 'es';
  const root = el('div', { className: 'view-container geriatric-care-view' });

  // 1. Top-Level Header (must contain literal h('h1' for navigation test)
  const header = el('header', { className: 'view-header' });
  const title = h('h1', { id: 'geriatric-care-heading', class: 'view-title' },
    isEs
      ? 'Medicina de Adicciones en Geriatría, Criterios Beers y Prevención de Caídas'
      : 'Geriatric Addiction Medicine, Beers Criteria & Fall Prevention Navigator'
  );
  const subtitle = el('p', { className: 'view-subtitle' },
    isEs
      ? 'Herramienta clínica confidencial (cero-PII en RAM) para adultos mayores (65+): criterios AGS Beers 2023, carga anticolinérgica (ACB), farmacocinética del TUDO, hipotensión ortostática, estreñimiento severo y apoyo a cuidadores.'
      : 'Confidential clinical decision support (zero-PII, in-RAM) for older adults (age 65+): AGS Beers Criteria® 2023, Anticholinergic Cognitive Burden (ACB), geriatric MOUD pharmacokinetics, orthostatic fall prevention, OIC, and caregiver-supported dosing.'
  );
  header.append(title, subtitle);
  root.appendChild(header);

  // 2. High-Priority Alert Banner
  const banner = el('section', { className: 'alert-banner emergency-alert card', attrs: { role: 'alert' } });
  const bannerHeading = el('h2', { className: 'alert-title' },
    isEs ? 'Advertencia Crítica: Criterios Beers AGS 2023 sobre Polifarmacia del SNC' : 'Critical Warning: AGS Beers Criteria® 2023 CNS Polypharmacy'
  );
  const bannerText = el('p', {},
    isEs
      ? 'La combinación de opioides con benzodiacepinas, fármacos Z o antihistamínicos sedantes incrementa exponencialmente el riesgo de parada respiratoria, caídas con fractura de cadera y delirio. NUNCA retire el TUDO de forma punitiva; desprescriba sedantes de forma gradual y distribuya naloxona nasal a familiares.'
      : 'Combining opioids with benzodiazepines, Z-drugs, or sedating antihistamines exponentially raises the risk of respiratory arrest, falls with hip fracture, and delirium. NEVER abruptly discontinue MOUD punitively; taper sedatives gradually and distribute nasal naloxone to family members.'
  );
  banner.append(bannerHeading, bannerText);
  root.appendChild(banner);

  // 3. Clinical Syndromes Selector
  const syndromeSection = el('section', { className: 'geriatric-syndromes-section card', attrs: { 'aria-labelledby': 'geriatric-syndrome-heading' } });
  syndromeSection.appendChild(el('h2', { id: 'geriatric-syndrome-heading', className: 'card-title' },
    isEs ? '1. Módulos Clínicos Geriátricos Especializados' : '1. Specialized Geriatric Clinical Modules'));

  const buttonsContainer = el('div', { className: 'syndrome-buttons-grid' });
  syndromeSection.appendChild(buttonsContainer);

  // Detail container
  const detailContainer = el('div', { className: 'geriatric-detail-container' });
  syndromeSection.appendChild(detailContainer);
  root.appendChild(syndromeSection);

  function renderSyndromeButtons() {
    clear(buttonsContainer);
    for (const [id, item] of Object.entries(GERIATRIC_SYNDROME_PROFILES)) {
      const isSelected = geriatricState.selectedSyndromeId === id;
      const btn = makeButton(
        `${isSelected ? '● ' : ''}${isEs ? item.titleEs : item.titleEn}`,
        () => {
          setGeriatricState({ selectedSyndromeId: id });
          renderSyndromeButtons();
          renderDetailAndSbar();
        },
        {
          className: `syndrome-select-btn button ${isSelected ? 'primary active' : 'secondary'}`,
          ariaPressed: isSelected ? 'true' : 'false'
        }
      );
      buttonsContainer.appendChild(btn);
    }
  }

  function renderDetailAndSbar() {
    clear(detailContainer);
    const item = GERIATRIC_SYNDROME_PROFILES[geriatricState.selectedSyndromeId] || GERIATRIC_SYNDROME_PROFILES.beers_sedative_polypharmacy;

    const detailCard = el('article', { className: 'syndrome-detail-card card' });
    const badge = el('span', { className: `urgency-badge ${item.urgency === 'HIGH RISK' ? 'badge-emergency' : 'badge-protocol'}` },
      isEs ? item.badgeEs : item.badgeEn
    );
    const cardTitle = el('h3', { className: 'detail-title' }, isEs ? item.titleEs : item.titleEn);
    const summary = el('p', { className: 'detail-summary lead-text' }, isEs ? item.summaryEs : item.summaryEn);

    const pathSection = el('div', { className: 'detail-block' });
    pathSection.appendChild(el('h4', {}, isEs ? 'Fisiopatología Geriátrica y Farmacocinética' : 'Geriatric Pathophysiology & Pharmacokinetics'));
    pathSection.appendChild(el('p', {}, isEs ? item.pathophysiologyEs : item.pathophysiologyEn));

    const diagSection = el('div', { className: 'detail-block' });
    diagSection.appendChild(el('h4', {}, isEs ? 'Evaluación y Diagnóstico Clínico' : 'Clinical Assessment & Diagnostics'));
    const diagUl = el('ul', { className: 'bullet-list' });
    const diags = isEs ? item.diagnosticsEs : item.diagnosticsEn;
    for (const d of diags) diagUl.appendChild(el('li', {}, d));
    diagSection.appendChild(diagUl);

    const mgmtSection = el('div', { className: 'detail-block' });
    mgmtSection.appendChild(el('h4', {}, isEs ? 'Manejo Clínico y Protocolo de Desprescripción' : 'Clinical Management & Deprescribing Protocol'));
    const mgmtUl = el('ul', { className: 'bullet-list' });
    const mgmts = isEs ? item.managementEs : item.managementEn;
    for (const m of mgmts) mgmtUl.appendChild(el('li', {}, m));
    mgmtSection.appendChild(mgmtUl);

    const hrSection = el('div', { className: 'detail-block' });
    hrSection.appendChild(el('h4', {}, isEs ? 'Reducción de Daños y Educación para el Cuidador' : 'Harm Reduction & Caregiver Education'));
    const hrUl = el('ul', { className: 'bullet-list' });
    const hrs = isEs ? item.harmReductionEs : item.harmReductionEn;
    for (const hItem of hrs) hrUl.appendChild(el('li', {}, hItem));
    hrSection.appendChild(hrUl);

    detailCard.append(badge, cardTitle, summary, pathSection, diagSection, mgmtSection, hrSection);
    detailContainer.appendChild(detailCard);

    updateRiskEvaluation();
    sbarPre.textContent = formatGeriatricSbarText(getGeriatricState());
  }

  // 4. Interactive Beers & Geriatric Risk Evaluator
  const screenerSection = el('section', { className: 'geriatric-screener-section card', attrs: { 'aria-labelledby': 'screener-heading' } });
  screenerSection.appendChild(el('h2', { id: 'screener-heading', className: 'card-title' },
    isEs ? '2. Evaluador Interactivo de Riesgo Geriátrico y Criterios Beers' : '2. Interactive Geriatric Risk & Beers Criteria Evaluator'));

  const screenerGrid = el('div', { className: 'screener-grid' });
  const checkboxRefs = new Map();

  const questions = [
    { key: 'onOpioidsMOUD', labelEn: 'Patient is taking prescribed opioids or MOUD (buprenorphine/methadone)', labelEs: 'El paciente toma opioides recetados o TUDO (buprenorfina/metadona)' },
    { key: 'onBenzos', labelEn: 'Co-prescribed Benzodiazepines (e.g. lorazepam, clonazepam, alprazolam)', labelEs: 'Co-prescripción de Benzodiacepinas (p. ej., lorazepam, clonazepam, alprazolam)' },
    { key: 'onZDrugs', labelEn: 'Co-prescribed Z-Drugs / Non-benzo hypnotics (e.g. zolpidem, eszopiclone)', labelEs: 'Co-prescripción de Fármacos Z / Hipnóticos (p. ej., zolpidem, eszopiclona)' },
    { key: 'onAnticholinergics', labelEn: 'Taking high-anticholinergic drugs (diphenhydramine PM, hydroxyzine, amitriptyline, oxybutynin)', labelEs: 'Toma fármacos muy anticolinérgicos (difenhidramina PM, hidroxizina, amitriptilina, oxibutinina)' },
    { key: 'highFallRisk', labelEn: 'History of falls in past year or positive CDC STEADI screen (TUG > 12 s)', labelEs: 'Historial de caídas en el último año o prueba STEADI de los CDC positiva (TUG > 12 s)' },
    { key: 'renalImpairment', labelEn: 'Renal impairment / CKD (eGFR < 60 mL/min)', labelEs: 'Insuficiencia renal / ERC (TFGe < 60 mL/min)' },
    { key: 'cognitiveImpairment', labelEn: 'Documented Mild Cognitive Impairment (MCI) or Dementia (MoCA / Mini-Cog impaired)', labelEs: 'Deterioro Cognitivo Leve (DCL) o Demencia documentada (MoCA o Mini-Cog alterado)' },
    { key: 'severeConstipation', labelEn: 'Severe constipation / suspected OIC (straining, Bristol 1-2, < 3 BMs/week)', labelEs: 'Estreñimiento severo / sospecha de OIC (pujo, Bristol 1-2, < 3 deposiciones/sem)' }
  ];

  for (const q of questions) {
    const label = el('label', { className: 'checkbox-label' });
    const cb = el('input', {
      attrs: { type: 'checkbox' },
      className: 'screener-checkbox'
    });
    cb.checked = Boolean(geriatricState[q.key]);
    cb.addEventListener('change', () => {
      setGeriatricState({ [q.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(q.key, cb);
    label.append(cb, el('span', { className: 'checkbox-text' }, isEs ? q.labelEs : q.labelEn));
    screenerGrid.appendChild(label);
  }
  screenerSection.appendChild(screenerGrid);

  // Dynamic Risk Alert Box
  const riskBox = el('div', { className: 'geriatric-risk-box card', attrs: { 'aria-live': 'polite' } });
  screenerSection.appendChild(riskBox);
  root.appendChild(screenerSection);

  function updateRiskEvaluation() {
    clear(riskBox);
    const evalResult = evaluateGeriatricRisk(geriatricState);

    const tierClass = evalResult.tier === 'HIGH' ? 'status-critical' : evalResult.tier === 'MODERATE' ? 'status-warning' : 'status-normal';
    const tierTitle = el('h3', { className: `risk-tier-title ${tierClass}` },
      `${isEs ? 'Nivel de Riesgo Geriátrico: ' : 'Geriatric Risk Level: '}${evalResult.tier}`
    );
    const scoreText = el('p', { className: 'risk-score-summary' },
      isEs
        ? `Puntaje de Riesgo Clínico: ${evalResult.riskScore} | Carga Cognitiva Anticolinérgica (ACB estimada): ~${evalResult.acbScore}`
        : `Clinical Risk Score: ${evalResult.riskScore} | Estimated Anticholinergic Cognitive Burden (ACB): ~${evalResult.acbScore}`
    );
    riskBox.append(tierTitle, scoreText);

    if (evalResult.beersAlerts.length > 0) {
      const bTitle = el('h4', { className: 'beers-alert-title' },
        isEs ? '⚠️ Alertas Críticas Criterios AGS Beers 2023:' : '⚠️ AGS Beers Criteria® 2023 Critical Alerts:'
      );
      const bUl = el('ul', { className: 'beers-alert-list bullet-list' });
      for (const b of evalResult.beersAlerts) {
        bUl.appendChild(el('li', { className: 'text-critical' }, isEs ? b.es : b.en));
      }
      riskBox.append(bTitle, bUl);
    }

    if (evalResult.flags.length > 0) {
      const fTitle = el('h4', {}, isEs ? 'Factores Clínicos Identificados:' : 'Identified Clinical Risk Factors:');
      const fUl = el('ul', { className: 'flags-list bullet-list' });
      for (const f of evalResult.flags) {
        fUl.appendChild(el('li', {}, isEs ? f.es : f.en));
      }
      riskBox.append(fTitle, fUl);
    }
  }

  // 5. Anticholinergic Cognitive Burden Quick Scale
  const acbSection = el('section', { className: 'acb-quick-reference card' });
  acbSection.appendChild(el('h2', { className: 'card-title' },
    isEs ? '3. Referencia Rápida: Escala de Carga Cognitiva Anticolinérgica (ACB)' : '3. Quick Reference: Anticholinergic Cognitive Burden (ACB) Scale'
  ));
  const acbIntro = el('p', {},
    isEs
      ? 'Fármacos comunes con propiedades anticolinérgicas. Una suma acumulada >= 3 puntos triplica el riesgo de delirio agudo y aumenta el riesgo de demencia a largo plazo.'
      : 'Commonly prescribed drugs with anticholinergic activity. A cumulative score >= 3 points triples acute delirium risk and increases long-term dementia risk.'
  );
  const acbTable = el('div', { className: 'acb-table-grid' });
  const colHigh = el('div', { className: 'acb-col' });
  colHigh.append(
    el('h3', { className: 'text-critical' }, isEs ? '3 Puntos (Carga Alta)' : '3 Points (High Burden)'),
    el('p', { className: 'fine-print' }, isEs ? 'Evitar estrictamente en adultos mayores' : 'Strictly avoid in older adults'),
    el('ul', { className: 'bullet-list' },
      el('li', {}, 'Diphenhydramine (Benadryl, Advil PM)'),
      el('li', {}, 'Hydroxyzine (Atarax, Vistaril)'),
      el('li', {}, 'Promethazine (Phenergan)'),
      el('li', {}, 'Amitriptyline / Nortriptyline'),
      el('li', {}, 'Paroxetine (Paxil)'),
      el('li', {}, 'Oxybutynin / Tolterodine'),
      el('li', {}, 'Cyclobenzaprine (Flexeril)'),
      el('li', {}, 'Meperidine (Demerol)')
    )
  );

  const colMod = el('div', { className: 'acb-col' });
  colMod.append(
    el('h3', { className: 'text-warning' }, isEs ? '2 Puntos (Carga Moderada)' : '2 Points (Moderate Burden)'),
    el('p', { className: 'fine-print' }, isEs ? 'Monitorear estrechamente' : 'Monitor closely'),
    el('ul', { className: 'bullet-list' },
      el('li', {}, 'Carbamazepine (Tegretol)'),
      el('li', {}, 'Baclofen (Lioresal)'),
      el('li', {}, 'Loxapine'),
      el('li', {}, 'Oxcarbazepine')
    )
  );

  const colLow = el('div', { className: 'acb-col' });
  colLow.append(
    el('h3', {}, isEs ? '1 Punto (Carga Leve)' : '1 Point (Low Burden)'),
    el('p', { className: 'fine-print' }, isEs ? 'Carga aditiva con otros fármacos' : 'Additive burden when combined'),
    el('ul', { className: 'bullet-list' },
      el('li', {}, 'Quetiapine (Seroquel)'),
      el('li', {}, 'Risperidone (Risperdal)'),
      el('li', {}, 'Atenolol / Metoprolol'),
      el('li', {}, 'Furosemide (Lasix)'),
      el('li', {}, 'Prednisone'),
      el('li', {}, 'Cetirizine (Zyrtec)')
    )
  );
  acbTable.append(colHigh, colMod, colLow);
  acbSection.append(acbIntro, acbTable);
  root.appendChild(acbSection);

  // 6. SBAR Summary Output Section
  const sbarSection = el('section', { className: 'geriatric-sbar-section card', attrs: { 'aria-labelledby': 'geriatric-sbar-heading' } });
  sbarSection.appendChild(el('h2', { id: 'geriatric-sbar-heading', className: 'card-title' },
    isEs ? '4. Resumen SBAR para Geriatría y Atención Primaria (Cero-PII en RAM)' : '4. SBAR Summary for Geriatrics & Primary Care (Zero-PII, In-RAM)'
  ));

  const notesLabel = el('label', { className: 'field-label', attrs: { for: 'geriatric-clinical-notes' } },
    isEs ? 'Notas clínicas (solo en RAM; no introduzca nombres ni identificadores):' : 'Clinical notes (in-RAM only; do not enter names or identifiers):'
  );
  const notesInput = el('textarea', {
    id: 'geriatric-clinical-notes',
    className: 'form-textarea geriatric-notes-input',
    attrs: { rows: '2', placeholder: isEs ? 'Ej. 78 años, TFGe 38 mL/min, caída nocturna hace 2 semanas...' : 'e.g., 78 yo, eGFR 38 mL/min, nocturnal fall 2 weeks ago...' }
  });
  notesInput.value = geriatricState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setGeriatricState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatGeriatricSbarText(getGeriatricState());
  });

  const sbarPre = el('pre', { className: 'sbar-pre-box', attrs: { role: 'region', 'aria-label': 'SBAR Report' } });
  sbarPre.textContent = formatGeriatricSbarText(getGeriatricState());

  const copyStatus = el('span', { className: 'copy-status-msg', attrs: { role: 'status', 'aria-live': 'polite' } });
  const copyBtn = makeButton(isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard', async () => {
    const txt = formatGeriatricSbarText(getGeriatricState());
    const ok = await copyText(txt, {
      trigger: copyBtn,
      copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
      failedLabel: isEs ? 'No se pudo copiar — seleccione el texto manualmente' : 'Copy failed — select text manually',
    });
    copyStatus.textContent = ok
      ? (isEs ? '¡Copiado al portapapeles!' : 'Copied to clipboard!')
      : (isEs ? 'No se pudo acceder al portapapeles. Copie el texto manualmente.' : 'Could not access clipboard. Select the text to copy manually.');
  }, { className: 'button primary copy-sbar-btn' });

  const resetBtn = makeButton(isEs ? 'Reiniciar (RAM)' : 'Reset (RAM)', () => {
    resetGeriatricState();
    notesInput.value = '';
    copyStatus.textContent = '';
    for (const [k, cb] of checkboxRefs.entries()) cb.checked = Boolean(geriatricState[k]);
    renderSyndromeButtons();
    renderDetailAndSbar();
  }, { className: 'button secondary reset-geriatric-btn' });

  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);
  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  // 7. Related Clinical Guides Navigation
  const linksSection = el('nav', { className: 'geriatric-links-section card', attrs: { 'aria-label': isEs ? 'Guías relacionadas' : 'Related guides' } });
  linksSection.appendChild(el('h2', { className: 'card-title' }, isEs ? 'Guías Clínicas Relacionadas' : 'Related Clinical Guides'));
  const linksRow = el('div', { className: 'related-links-row' });
  linksRow.append(
    makeLinkButton(isEs ? 'Adultos Mayores y Medicare (#/older-adults)' : 'Older Adults & Medicare (#/older-adults)', '#/older-adults'),
    makeLinkButton(isEs ? 'Cardiología y QTc (#/cardiology-care)' : 'Cardiology & QTc (#/cardiology-care)', '#/cardiology-care'),
    makeLinkButton(isEs ? 'Neurología y Delirio (#/neurology-care)' : 'Neurology & Delirium (#/neurology-care)', '#/neurology-care'),
    makeLinkButton(isEs ? 'Nefrología y TFGe (#/renal-care)' : 'Renal Care & eGFR (#/renal-care)', '#/renal-care'),
    makeLinkButton(isEs ? 'Respuesta ante Sobredosis (#/overdose)' : 'Overdose Response (#/overdose)', '#/overdose'),
    makeLinkButton(isEs ? 'Cuidados Paliativos (#/oncology-palliative)' : 'Palliative Care (#/oncology-palliative)', '#/oncology-palliative')
  );
  linksSection.appendChild(linksRow);
  root.appendChild(linksSection);

  renderSyndromeButtons();
  renderDetailAndSbar();
  return root;
}
