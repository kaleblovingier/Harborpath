import { h, clear, copyText } from '../dom.js';
import { t, getLang } from '../i18n.js';

function el(tag, props = {}, ...children) {
  const { className, attrs, ...rest } = props || {};
  const hProps = { ...rest };
  if (className) hProps.class = className;
  if (attrs) Object.assign(hProps, attrs);
  return h(tag, hProps, ...children);
}

function makeButton(label, onClick, opts = {}) {
  const { className = 'button', ariaPressed, ...rest } = opts;
  return h(
    'button',
    {
      type: 'button',
      class: className,
      'aria-pressed': ariaPressed,
      onclick: onClick,
      ...rest
    },
    label
  );
}

function makeLinkButton(label, href, opts = {}) {
  const { className = 'button secondary', ...rest } = opts;
  return h('a', { href, class: className, ...rest }, label);
}

/**
 * Wave 53 (Track B): Oncology, Palliative Care, Sickle Cell Vaso-Occlusive
 * Crisis & Complex Cancer Pain on MOUD Navigator (#/oncology-palliative)
 *
 * Zero-PII, 100% ephemeral in-RAM clinical decision support covering:
 *  1. Cancer Pain & Palliative Care in Patients on Buprenorphine or Methadone (ASCO / NCCN Consensus)
 *  2. Sickle Cell Disease (SCD) Acute Vaso-Occlusive Crisis (VOC) & Acute Chest Syndrome (NHLBI / ASH 30–60 Min Mandate)
 *  3. Opioid-Induced Neurotoxicity (OIN — M3G/H3G Myoclonus, Allodynia & Delirium) & Equianalgesic Opioid Rotation
 *  4. Chemotherapy-Induced Peripheral Neuropathy (CIPN), Radiation Mucositis & Co-Analgesics
 *  5. Oncologic Emergencies Mimicking Intoxication or Withdrawal (Hypercalcemia of Malignancy & Spinal Cord Compression)
 *  6. End-of-Life & Hospice Harm Reduction, Transdermal Fentanyl Heat Safety & Anti-Stigma Stewardship
 */

export const ONCOLOGY_SYNDROME_PROFILES = Object.freeze({
  cancer_pain_on_moud: Object.freeze({
    id: 'cancer_pain_on_moud',
    urgency: 'URGENT',
    badgeEn: 'ASCO / NCCN: CONTINUE & SPLIT MOUD TID/QID + LAYER FULL AGONISTS',
    badgeEs: 'ASCO / NCCN: MANTENER Y FRACCIONAR TMO C/6–8h + SUMAR AGONISTAS PUROS',
    titleEn: 'Cancer-Related Pain & Palliative Care in Patients on Buprenorphine or Methadone (ASCO / NCCN)',
    titleEs: 'Dolor Oncológico y Cuidados Paliativos en Pacientes con Buprenorfina o Metadona (Consenso ASCO / NCCN)',
    summaryEn:
      'Evidence-based management of moderate-to-severe cancer pain in patients with co-occurring Opioid Use Disorder (OUD) or maintained on Buprenorphine or Methadone, preventing both undertreated malignant pain and destabilizing relapse.',
    summaryEs:
      'Manejo basado en evidencia del dolor oncológico moderado a severo en pacientes con Trastorno por Uso de Opioides (TUO) o en mantenimiento con Buprenorfina o Metadona, previniendo tanto el dolor no tratado como la recaída.',
    pathophysiologyEn:
      'While once-daily Buprenorphine or Methadone suppresses opioid withdrawal for 24–36 hours, their intrinsic analgesic duration is only 6–8 hours. Furthermore, opioid tolerance in MOUD patients causes cross-tolerance to standard low-dose opioids, while abruptly stopping Buprenorphine/Methadone precipitates severe hyperalgesia and withdrawal.',
    pathophysiologyEs:
      'Aunque una dosis diaria de Buprenorfina o Metadona suprime la abstinencia por 24–36 horas, su duración analgésica intrínseca es de solo 6–8 horas. Además, la tolerancia opioide exige dosis mayores y nunca debe suspenderse el TMO basal.',
    diagnosticsEn: [
      'Comprehensive Pain Mechanism Characterization: Differentiate somatic bone pain (metastases), visceral pain (capsular stretch/obstruction), and neuropathic pain (plexopathy, tumor nerve invasion, CIPN).',
      'Verify Baseline MOUD Regimen & Last Dose: Confirm total daily Buprenorphine or Methadone dose (never reduce or hold baseline MOUD to "make room" for pain medications!).',
      'Check Renal & Hepatic Function + Baseline ECG (QTc): Essential when titrating Methadone or rotating full-agonist opioids.'
    ],
    diagnosticsEs: [
      'Caracterización del Mecanismo del Dolor: Diferenciar dolor somático óseo (metástasis), visceral y neuropático (plexopatía tumoral o neuropatía por quimioterapia).',
      'Verificar Régimen Basal de TMO: Confirmar dosis diaria total de Buprenorfina o Metadona (¡nunca suspender el TMO basal!).',
      'Evaluar Función Renal, Hepática y ECG (QTc): Esencial al titular Metadona o rotar opioides.'
    ],
    managementEn: [
      'ASCO / NCCN STRATEGY 1 — SPLIT BASELINE MOUD TO EVERY 6–8 HOURS: Divide the patient’s total daily Buprenorphine dose (e.g., 24 mg/day -> 8 mg SL q8h) or Methadone dose (e.g., 90 mg/day -> 30 mg PO q8h) to leverage continuous 24-hour receptor analgesia.',
      'ASCO / NCCN STRATEGY 2 — LAYER HIGH-AFFINITY FULL MU-AGONISTS ON TOP OF BUPRENORPHINE: Keep baseline split-dose Buprenorphine in place and add scheduled or PCA Hydromorphone, Fentanyl, or Morphine titrated to analgesia. High-potency full agonists bind available mu-opioid receptors alongside buprenorphine without precipitating withdrawal!',
      'ASCO / NCCN STRATEGY 3 — METHADONE AS A DUAL MU-AGONIST + NMDA ANTAGONIST: Methadone blocks NMDA glutamate receptors in addition to mu-opioid agonism, making it uniquely effective for refractory neuropathic cancer pain and opioid-induced hyperalgesia.',
      'Targeted Adjuvant Co-Analgesics: Single-fraction or multifraction Palliative Radiotherapy + IV Bisphosphonates (Zoledronic Acid) / Denosumab + Dexamethasone for bone metastases; Celiac Plexus Neurolysis for pancreatic cancer pain.'
    ],
    managementEs: [
      'ESTRATEGIA ASCO / NCCN 1 — FRACCIONAR EL TMO BASAL CADA 6–8 HORAS: Dividir la dosis diaria total de Buprenorfina (ej. 24 mg/día -> 8 mg SL c/8h) o Metadona (ej. 90 mg/día -> 30 mg VO c/8h) para aprovechar su ventana analgésica de 6–8 horas.',
      'ESTRATEGIA ASCO / NCCN 2 — SUMAR AGONISTAS MU PUROS DE ALTA AFINIDAD SOBRE LA BUPRENORFINA: Mantener la Buprenorfina fraccionada y añadir Hidromorfona, Fentanilo o Morfina pautada o en PCA titulada al dolor.',
      'ESTRATEGIA ASCO / NCCN 3 — METADONA COMO AGONISTA MU + ANTAGONISTA NMDA: La Metadona bloquea receptores NMDA, siendo de elección en dolor oncológico neuropático refractario.',
      'Coadyuvantes Específicos: Radioterapia paliativa + Ácido Zoledrónico/Denosumab + Dexametasona en metástasis óseas; neurólisis del plexo celíaco en cáncer de páncreas.'
    ],
    harmReductionEn:
      'Active substance use or a history of OUD is NEVER a justification to withhold palliative opioid analgesia in cancer. Partner with Palliative Care and Addiction Medicine to use short-interval prescriptions, pill lockboxes, and take-home naloxone.',
    harmReductionEs:
      'El consumo activo o antecedente de TUO NUNCA justifica negar analgesia opioide paliativa en cáncer. Coordinar Cuidados Paliativos y Medicina de Adicciones con cajas de seguridad y naloxona.'
  }),

  sickle_cell_voc_analgesia: Object.freeze({
    id: 'sickle_cell_voc_analgesia',
    urgency: 'EMERGENCY',
    badgeEn: 'NHLBI / ASH MANDATE: PARENTERAL ANALGESIA <= 30–60 MIN + ACS SCREEN',
    badgeEs: 'MANDATO NHLBI / ASH: ANALGESIA PARENTERAL <= 30–60 MIN + DESCARTAR STA',
    titleEn: 'Sickle Cell Disease (SCD) Acute Vaso-Occlusive Crisis (VOC) & Acute Chest Syndrome',
    titleEs: 'Crisis Vasooclusiva Aguda (CVO) en Drepanocitosis y Síndrome Torácico Agudo (STA)',
    summaryEn:
      'Excruciating microvascular bone and visceral infarction in patients with Sickle Cell Disease (HbSS, HbSC, HbS-beta thalassemia), requiring rapid parenteral analgesia within 30–60 minutes, anti-racist/anti-stigma care, and vigilant screening for life-threatening Acute Chest Syndrome (ACS).',
    summaryEs:
      'Infarto microvascular óseo y visceral extremadamente doloroso en pacientes con Drepanocitosis (HbSS, HbSC), que exige analgesia parenteral rápida en <= 30–60 minutos, atención libre de estigma/racismo y vigilancia de Síndrome Torácico Agudo (STA).',
    pathophysiologyEn:
      'Deoxygenated Hemoglobin S polymerizes into rigid tactoids, distorting erythrocytes into sickle shapes that occlude bone marrow sinusoids and pulmonary microvasculature. Ischemia-reperfusion injury, hemolysis-driven nitric oxide depletion, and mast-cell neurogenic inflammation generate severe nociceptive and neuropathic pain.',
    pathophysiologyEs:
      'La hemoglobina S desoxigenada se polimeriza distorsionando los eritrocitos y ocluyendo los sinusoides de la médula ósea y la microvasculatura pulmonar. La isquemia-reperfusión y el agotamiento de óxido nítrico generan dolor nociceptivo y neuropático severo.',
    diagnosticsEn: [
      'CARDINAL CLINICAL RULE — VITAL SIGNS DO NOT VALIDATE OR EXCLUDE PAIN: Patients with Sickle Cell Disease and chronic physiological adaptation frequently have NORMAL blood pressure and heart rate during a 10/10 vaso-occlusive crisis. Never cite "normal vitals" or "using their phone" as a reason to doubt or delay analgesia!',
      'Screen Every VOC Patient for Acute Chest Syndrome (ACS — #1 Cause of Death in SCD): Check SpO2, respiratory rate, Chest X-Ray (new segmental/lobar pulmonary infiltrate), CBC with reticulocyte count (screen for aplastic crisis if retic < 1% or splenic sequestration), LDH, and Bilirubin.',
      'Consult the Patient’s Individualized SCD Pain Action Plan (in the EHR) immediately upon triage.'
    ],
    diagnosticsEs: [
      'REGLA CLÍNICA CARDINAL — LOS SIGNOS VITALES NO DESCARTAN EL DOLOR: Los pacientes con drepanocitosis frecuentemente presentan presión arterial y frecuencia cardíaca NORMALES durante una crisis vasooclusiva 10/10. ¡Nunca usar signos vitales normales para retrasar o negar la analgesia!',
      'Tamizar Síndrome Torácico Agudo (STA — Causa #1 de Muerte en Drepanocitosis): Medir SpO2, radiografía de tórax (nuevo infiltrado pulmonar), hemograma con reticulocitos (descartar crisis aplásica si reticulocitos < 1%), LDH y bilirrubina.',
      'Consultar de inmediato el Plan Individualizado de Dolor del paciente.'
    ],
    managementEn: [
      'NHLBI / ASH 30-TO-60 MINUTE ANALGESIA MANDATE: Administer the first dose of parenteral opioid (IV Hydromorphone or IV Morphine per individualized protocol) within <= 30 minutes of triage (<= 60 minutes from registration). If IV access cannot be obtained within 15 minutes (due to venous sclerosis), administer Subcutaneous (SC) Hydromorphone/Morphine or Intranasal Fentanyl immediately—NEVER use intramuscular (IM) injections (erratic absorption and muscle necrosis)!',
      'Rapid Reassessment & PCA Transition: Reassess pain every 15–30 minutes and redose until pain is controlled, then transition to Patient-Controlled Analgesia (PCA) + scheduled NSAID (IV Ketorolac 15–30 mg q6–8h for 48–72h if renal function is normal) + Subdissociative IV Ketamine infusion (0.1–0.3 mg/kg/hr) for opioid-tolerant VOC.',
      'THE FLUID BOLUS TRAP IN SCD: Avoid aggressive 0.9% Normal Saline boluses in euvolemic VOC patients—hyperchloremic metabolic acidosis promotes HbS sickling and fluid overload precipitates Acute Chest Syndrome! Use maintenance hypotonic fluids (D5-1/2NS at 1–1.5x maintenance) and encourage oral hydration.',
      'ACUTE CHEST SYNDROME (ACS) EMERGENCY PROTOCOL: For new pulmonary infiltrate + fever, chest pain, dyspnea, or SpO2 < 92%: (1) Supplemental O2 to keep SpO2 >= 95%; (2) IV Ceftriaxone + Azithromycin; (3) Simple Transfusion (if Hb < 9 g/dL) or Emergent Automated Red Cell Exchange Transfusion (target HbS < 30% if multilobar disease, rapid progression, or Hb >= 9–10 g/dL); (4) Incentive Spirometry (10 breaths q2h while awake).'
    ],
    managementEs: [
      'MANDATO NHLBI / ASH DE ANALGESIA EN 30–60 MINUTOS: Administrar la primera dosis de opioide parenteral (Hidromorfona o Morfina IV) en <= 30 minutos desde el triaje. Si no se logra vía IV en 15 minutos, administrar vía Subcutánea (SC) o Fentanilo Intranasal de inmediato; ¡NUNCA usar inyecciones intramusculares (IM)!',
      'Reevaluación Rápida y PCA: Reevaluar cada 15–30 minutos y pasar a bomba de Analgesia Controlada por el Paciente (PCA) + Ketorolaco IV (si función renal normal) + infusión de Ketamina en dosis subdisociativas (0.1–0.3 mg/kg/h).',
      'TRAMPA DE BOLOS DE SOLUCIÓN SALINA 0.9%: Evitar bolos agresivos de solución salina 0.9% en pacientes euvolémicos; la acidosis hiperclorémica promueve la falciformación de HbS y desencadena Síndrome Torácico Agudo. Usar líquidos hipotónicos de mantenimiento (D5-0.45% NaCl).',
      'PROTOCOLO DE EMERGENCIA EN SÍNDROME TORÁCICO AGUDO (STA): Ante nuevo infiltrado pulmonar + fiebre, dolor torácico o hipoxemia: (1) Oxígeno para SpO2 >= 95%; (2) Ceftriaxona + Azitromicina IV; (3) Transfusión simple o Exanguinotransfusión Automatizada de Eritrocitos (meta HbS < 30%); (4) Espirometría incentiva.'
    ],
    harmReductionEn:
      'Recognize that high opioid tolerance and requests for specific effective doses (e.g., IV hydromorphone + diphenhydramine for opioid-induced histamine pruritus) in Sickle Cell Disease reflect lifelong lived experience with severe ischemic pain—not addiction.',
    harmReductionEs:
      'Reconocer que la tolerancia opioide y el conocimiento exacto de las dosis efectivas en pacientes con drepanocitosis reflejan años de experiencia con dolor isquémico severo, no adicción.'
  }),

  opioid_induced_neurotoxicity: Object.freeze({
    id: 'opioid_induced_neurotoxicity',
    urgency: 'URGENT',
    badgeEn: 'M3G / H3G NEUROTOXICITY — OPIOID ROTATION + 25–50% DOSE REDUCTION',
    badgeEs: 'NEUROTOXICIDAD POR M3G / H3G — ROTACIÓN OPIOIDE + REDUCCIÓN 25–50%',
    titleEn: 'Opioid-Induced Neurotoxicity (OIN), Hyperalgesia (OIH) & Equianalgesic Opioid Rotation',
    titleEs: 'Neurotoxicidad Inducida por Opioides (NIO), Hiperalgesia (HIO) y Rotación Equianalgésica',
    summaryEn:
      'Paradoxical worsening of pain (Opioid-Induced Hyperalgesia / allodynia), multifocal myoclonus, agitated delirium, and seizures caused by accumulation of neuroexcitatory 3-glucuronide metabolites during high-dose Morphine, Hydromorphone, or Oxycodone therapy.',
    summaryEs:
      'Empeoramiento paradójico del dolor (Hiperalgesia Inducida por Opioides / alodinia), mioclonías multifocales, delirio agitado y convulsiones por acumulación de metabolitos 3-glucurónidos neuroexcitatorios durante el uso de Morfina, Hidromorfona u Oxicodona en dosis altas.',
    pathophysiologyEn:
      'Hepatic glucuronidation converts Morphine and Hydromorphone into active 6-glucuronides (analgesic/sedative) and 3-glucuronides (Morphine-3-Glucuronide [M3G] and Hydromorphone-3-Glucuronide [H3G]). M3G and H3G have ZERO opioid receptor affinity, accumulate rapidly in dehydration or acute kidney injury, and cause potent central NMDA/glycine neuroexcitation.',
    pathophysiologyEs:
      'La glucuronidación hepática convierte la Morfina e Hidromorfona en metabolitos 3-glucurónidos (M3G y H3G) que carecen de efecto analgésico, se acumulan en deshidratación o insuficiencia renal y provocan neuroexcitación central NMDA.',
    diagnosticsEn: [
      'The Classic OIN Tetrad: (1) Hyperalgesia & Allodynia (escalating the opioid dose paradoxically makes pain worse and diffuse; even bedsheet contact causes severe pain); (2) Multifocal Myoclonus (jerking of extremities/face); (3) Agitated Delirium & Vivid Tactile/Visual Hallucinations; (4) Generalized Seizures.',
      'Crucial Distinction from Undertreated Pain: In undertreated pain, opioid boluses improve pain; in OIH/OIN, opioid boluses worsen pain, agitation, and myoclonic jerks!',
      'Check Serum Creatinine, eGFR, BUN, and Calcium.'
    ],
    diagnosticsEs: [
      'Tétrada Clásica de Neurotoxicidad Opioide (NIO): (1) Hiperalgesia y Alodinia (subir la dosis del opioide empeora paradójicamente el dolor); (2) Mioclonías Multifocales; (3) Delirio Agitado y Alucinaciones; (4) Convulsiones.',
      'Diferenciación Clave frente a Dolor Mal Controlado: En la NIO/HIO, los bolos adicionales de morfina/hidromorfona empeoran el dolor y las mioclonías.',
      'Medir Creatinina sérica, TFGe, BUN y Calcio.'
    ],
    managementEn: [
      'STOP ESCALATING THE OFFENDING OPIOID: Never increase Morphine or Hydromorphone when myoclonus and allodynia are present.',
      'PERFORM EQUIANALGESIC OPIOID ROTATION: Rotate from Morphine/Hydromorphone to a structurally distinct opioid that lacks active neuroexcitatory glucuronide metabolites—specifically Fentanyl, Methadone, or Buprenorphine! When rotating to a new full-agonist opioid (other than methadone), reduce the calculated equianalgesic dose by 25%–50% to account for incomplete cross-tolerance.',
      'IV Isotonic Hydration & NMDA Modulation: Administer IV 0.9% NaCl hydration to accelerate renal clearance of accumulated M3G/H3G metabolites, and consider low-dose IV Ketamine (NMDA antagonist) or Lorazepam for acute severe myoclonus.'
    ],
    managementEs: [
      'DETENER EL AUMENTO DEL OPIOIDE CAUSAL: Nunca subir la dosis de Morfina o Hidromorfona en presencia de mioclonías y alodinia.',
      'REALIZAR ROTACIÓN OPIOIDE EQUIANALGÉSICA: Rotar de Morfina/Hidromorfona a un opioide sin metabolitos 3-glucurónidos activos, como Fentanilo, Metadona o Buprenorfina, reduciendo entre 25% y 50% la dosis equianalgésica calculada por tolerancia cruzada incompleta.',
      'Hidratación IV y Modulación NMDA: Administrar solución salina IV para acelerar la excreción renal de M3G/H3G y considerar Ketamina en dosis bajas o Lorazepam para las mioclonías.'
    ],
    harmReductionEn:
      'In patients with chronic kidney disease (eGFR < 30 mL/min) or dialysis requiring severe pain management, choose Buprenorphine, Fentanyl, or Methadone first-line rather than Morphine, Codeine, or Meperidine.',
    harmReductionEs:
      'En pacientes con enfermedad renal crónica (TFGe < 30 mL/min) o diálisis, elegir Buprenorfina, Fentanilo o Metadona como primera línea, evitando Morfina, Codeína y Meperidina.'
  }),

  cipn_mucositis_coanalgesics: Object.freeze({
    id: 'cipn_mucositis_coanalgesics',
    urgency: 'ROUTINE',
    badgeEn: 'ASCO LEVEL I: DULOXETINE FOR CIPN + MULTIMODAL MUCOSITIS CARE',
    badgeEs: 'ASCO NIVEL I: DULOXETINA EN NPQ + MANEJO MULTIMODAL DE MUCOSITIS',
    titleEn: 'Chemotherapy-Induced Peripheral Neuropathy (CIPN) & Severe Radiation/Chemo Mucositis',
    titleEs: 'Neuropatía Periférica Inducida por Quimioterapia (NPQ) y Mucositis Oral por Radiación/Quimioterapia',
    summaryEn:
      'Evidence-based opioid-sparing and multimodal management of painful stocking-glove Chemotherapy-Induced Peripheral Neuropathy (platinum agents, taxanes, vincristine, bortezomib) and severe ulcerative oral/esophageal mucositis.',
    summaryEs:
      'Manejo multimodal basado en evidencia de la Neuropatía Periférica Inducida por Quimioterapia en guante y calcetín (platinos, taxanos, vincristina, bortezomib) y mucositis ulcerativa oral/esofágica severa.',
    pathophysiologyEn:
      'Chemotherapeutic agents damage dorsal root ganglia mitochondria, microtubules, and intraepidermal nerve fibers (CIPN), while head-and-neck radiation and high-dose chemotherapy destroy basal epithelial stem cells of the oral/pharyngeal mucosa (Grade 3–4 mucositis).',
    pathophysiologyEs:
      'Los quimioterápicos dañan las mitocondrias y microtúbulos del ganglio de la raíz dorsal (NPQ), mientras la radioterapia de cabeza y cuello destruye el epitelio basal de la mucosa oral (mucositis Grado 3–4).',
    diagnosticsEn: [
      'CIPN Neurologic Assessment: Symmetric distal burning paresthesias, shooting electric pain, cold allodynia (classic for acute oxaliplatin!), loss of vibration/proprioception, and sensory ataxia.',
      'WHO Oral Mucositis Grading (Grades 1–4): Grade 3 = confluent ulcers, patient can only swallow liquids; Grade 4 = oral alimentation impossible, requiring parenteral analgesia and enteral/parenteral nutrition.'
    ],
    diagnosticsEs: [
      'Evaluación Neurológica de NPQ: Parestesias urentes simétricas en guante y calcetín, alodinia al frío (clásica del oxaliplatino agudo) y pérdida de propiocepción.',
      'Clasificación OMS de Mucositis Oral (Grados 1–4): Grado 3 = úlceras confluentes, solo tolera líquidos; Grado 4 = alimentación oral imposible.'
    ],
    managementEn: [
      'ASCO GUIDELINE FIRST-LINE FOR PAINFUL CIPN (Duloxetine): Initiate Duloxetine 30 mg PO daily for 1 week, then increase to 60 mg PO daily (the only pharmacologic agent with ASCO Level I randomized trial evidence for established painful CIPN!).',
      'Adjunctive Neuropathic Regimens: Gabapentin / Pregabalin, Tricyclic Antidepressants, High-Concentration 8% Capsaicin Patch, or Split-Dose Methadone / Buprenorphine for refractory neuropathic pain.',
      'Severe Oral Mucositis Protocol (MASCC/ISOO Guidelines): (1) Bland Baking Soda + Salt oral rinses 4–6x/day; (2) Topical 0.2% Morphine oral swish-and-spit OR 0.5% Doxepin oral rinse OR viscous Lidocaine 2% ("Magic Mouthwash" — warn patient not to swallow blindly while pharyngeal gag reflex is numb!); (3) Patient-Controlled Analgesia (IV Hydromorphone/Morphine PCA) when swallowing oral pills is impossible.'
    ],
    managementEs: [
      'PRIMERA LÍNEA ASCO EN NPQ DOLOROSA (Duloxetina): Iniciar Duloxetina 30 mg VO c/24h por 1 semana y subir a 60 mg VO c/24h (único fármaco con evidencia Nivel I de ASCO en NPQ establecida).',
      'Coadyuvantes Neuropáticos: Gabapentina / Pregabalina, parches de Capsaicina al 8% o Metadona / Buprenorfina fraccionada.',
      'Protocolo de Mucositis Oral Severa (Guías MASCC/ISOO): (1) Enjuagues suaves con bicarbonato de sodio y sal; (2) Enjuague bucal tópico de Morfina al 0.2% o Doxepina al 0.5% o Lidocaína viscosa al 2%; (3) Analgesia IV por bomba PCA cuando la vía oral no es posible.'
    ],
    harmReductionEn:
      'When severe radiation mucositis or dysphagia prevents a patient from swallowing oral Methadone, transition temporarily to liquid Methadone via feeding tube, IV Methadone (at 50% of the oral dose!), or sublingual Buprenorphine.',
    harmReductionEs:
      'Cuando la mucositis severa impide tragar tabletas de Metadona, usar Metadona líquida por sonda, Metadona IV (¡al 50% de la dosis oral!) o Buprenorfina sublingual.'
  }),

  oncologic_emergencies_mimics: Object.freeze({
    id: 'oncologic_emergencies_mimics',
    urgency: 'EMERGENCY',
    badgeEn: 'HYPERCALCEMIA & SPINAL CORD COMPRESSION — DO NOT MISATTRIBUTE TO SUD',
    badgeEs: 'HIPERCALCEMIA Y COMPRESIÓN MEDULAR — NO ATRIBUIR A INTOXICACIÓN/TUO',
    titleEn: 'Oncologic Emergencies Mimicking Intoxication or Withdrawal (Hypercalcemia & Cord Compression)',
    titleEs: 'Emergencias Oncológicas que Simulan Intoxicación o Abstinencia (Hipercalcemia y Compresión Medular)',
    summaryEn:
      'Life-threatening oncologic emergencies—Hypercalcemia of Malignancy and Malignant Epidural Spinal Cord Compression (MESCC)—that are frequently misdiagnosed as "opioid sedation", "opioid constipation", or "drug-seeking back pain" in patients with a history of SUD.',
    summaryEs:
      'Emergencias oncológicas potencialmente mortales—Hipercalcemia Maligna y Compresión Medular Epidural Maligna (CMEM)—que suelen confundirse por sesgo de anclaje con "sedación por opioides", "estreñimiento por opioides" o "búsqueda de fármacos" en pacientes con TUO.',
    pathophysiologyEn:
      '(1) Hypercalcemia of Malignancy (PTHrP secretion in squamous cell/renal/breast cancer or osteolytic metastases in multiple myeloma) causes nephrogenic diabetes insipidus, profound volume depletion, obtundation/delirium, and bradyarrhythmias; (2) Vertebral metastases compress the epidural venous plexus and spinal cord, causing irreversible paraplegia if decompression is delayed.',
    pathophysiologyEs:
      '(1) La Hipercalcemia Maligna (por PTHrP o metástasis osteolíticas) causa diabetes insípida nefrogénica, deshidratación severa, estupor/delirio y bradiarritmias; (2) Las metástasis vertebrales comprimen el saco dural y la médula espinal.',
    diagnosticsEn: [
      'Hypercalcemia Screen in Any Lethargic/Confused/Constipated Oncology Patient: Check Ionized Calcium or Albumin-Corrected Calcium (Ca >= 12–14 mg/dL is severe!), ECG (shortened QTc interval and Osborn waves), Creatinine, PTH, and PTHrP.',
      'Malignant Epidural Spinal Cord Compression (MESCC) Red Flags: New or worsening midline nocturnal/supine back pain (pain that worsens when lying flat is a hallmark of epidural tumor venous engorgement!), radicular band-like chest/abdominal pain, lower-extremity weakness, sensory level, or urinary retention -> STAT Whole-Spine MRI with Contrast!'
    ],
    diagnosticsEs: [
      'Tamizaje de Hipercalcemia en Todo Paciente Oncológico Letárgico/Confuso/Estreñido: Medir Calcio Iónico o Calcio Corregido por Albúmina (Ca >= 12–14 mg/dL es severo), ECG (intervalo QTc corto) y Creatinina.',
      'Banderas Rojas de Compresión Medular Epidural Maligna (CMEM): Dolor dorsal nuevo que empeora al acostarse (decúbito supino), dolor radicular en faja, debilidad en piernas o retención urinaria -> ¡RM de Columna Completa con Contraste STAT!'
    ],
    managementEn: [
      'SEVERE HYPERCALCEMIA OF MALIGNANCY PROTOCOL (3-Tiered Simultaneous Therapy): (1) Immediate Aggressive IV 0.9% Normal Saline Rehydration (200–300 mL/hr targeting urine output 100–150 mL/hr; avoid routine loop diuretics unless fluid overload occurs); (2) Subcutaneous Calcitonin (4 IU/kg SC/IM q12h for 48h — works rapidly within 4 to 6 hours!); (3) IV Bisphosphonate: Zoledronic Acid 4 mg IV over 15–30 min (or Pamidronate, or SC Denosumab 120 mg if severe renal failure CrCl < 30 mL/min) for sustained calcium control starting at 48–72 hours.',
      'MALIGNANT SPINAL CORD COMPRESSION (MESCC) PROTOCOL: Administer High-Dose IV Dexamethasone (10–16 mg IV bolus IMMEDIATELY upon clinical suspicion—even before MRI is completed if neurologic deficits are present!, followed by 4 mg IV q6h) + Emergent Neurosurgery and Radiation Oncology consultation within < 24 hours.'
    ],
    managementEs: [
      'PROTOCOLO DE HIPERCALCEMIA MALIGNA SEVERA (Terapia Triple Simultánea): (1) Hidratación intensiva con Solución Salina 0.9% IV (200–300 mL/h buscando diuresis 100–150 mL/h); (2) Calcitonina Subcutánea (4 UI/kg SC c/12h por 48h — actúa rápido en 4 a 6 horas); (3) Bifosfonato IV: Ácido Zoledrónico 4 mg IV en 15–30 min (o Denosumab 120 mg SC si TFG < 30 mL/min).',
      'PROTOCOLO DE COMPRESIÓN MEDULAR EPIDURAL MALIGNA (CMEM): Administrar Dexametasona IV en altas dosis (bolo de 10–16 mg IV DE INMEDIATO ante sospecha clínica, incluso antes de la RM si hay déficit motor, seguido de 4 mg IV c/6h) + interconsulta urgente a Neurocirugía y Radiooncología en < 24 horas.'
    ],
    harmReductionEn:
      'Eliminate diagnostic overshadowing: when a patient with cancer and SUD presents with somnolence, confusion, or severe back pain, always rule out hypercalcemia, brain metastases, sepsis, and spinal cord compression rather than assuming substance intoxication or drug-seeking.',
    harmReductionEs:
      'Eliminar el sesgo de anclaje: cuando un paciente con cáncer y TUO presenta somnolencia, confusión o dolor dorsal severo, descartar siempre hipercalcemia, metástasis cerebrales y compresión medular en lugar de asumir intoxicación.'
  }),

  palliative_harm_reduction_eol: Object.freeze({
    id: 'palliative_harm_reduction_eol',
    urgency: 'ROUTINE',
    badgeEn: 'TRANSDERMAL FENTANYL HEAT SAFETY + LOCKBOX STEWARDSHIP',
    badgeEs: 'SEGURIDAD TÉRMICA EN PARCHES DE FENTANILO + CAJAS CON LLAVE',
    titleEn: 'Hospice & End-of-Life Harm Reduction, Fentanyl Patch Safety & Safe Storage',
    titleEs: 'Reducción de Daños en Cuidados Paliativos, Seguridad de Parches de Fentanilo y Resguardo Seguro',
    summaryEn:
      'Compassionate, practical safety protocols for managing high-potency opioids (transdermal fentanyl patches, concentrated oral liquid morphine/oxycodone, methadone) in home hospice and outpatient palliative care for patients or households affected by SUD.',
    summaryEs:
      'Protocolos compasivos y prácticos para el manejo seguro de opioides de alta potencia (parches transdérmicos de fentanilo, morfina líquida concentrada, metadona) en cuidados paliativos domiciliarios.',
    pathophysiologyEn:
      'Transdermal fentanyl forms a subcutaneous depot in the stratum corneum with a 12–24 hour onset lag and 17–24 hour elimination half-life after patch removal. External heat (heating pads, electric blankets, hot baths, or high fever > 39°C) causes cutaneous vasodilation that increases transdermal fentanyl absorption 300% to 400%, precipitating fatal overdose.',
    pathophysiologyEs:
      'El fentanilo transdérmico forma un depósito subcutáneo con inicio a las 12–24 h y vida media de 17–24 h tras retirarlo. El calor externo (almohadillas térmicas, mantas eléctricas, baños calientes o fiebre alta) aumenta la absorción transdérmica de fentanilo entre 300% y 400%, causando sobredosis mortal.',
    diagnosticsEn: [
      'Confirm Opioid Tolerance Before Prescribing Transdermal Fentanyl: FDA Black-Box Mandate—transdermal fentanyl patches are ONLY indicated in opioid-tolerant patients (taking >= 60 mg oral morphine equivalents/day for >= 7 days).',
      'Assess Household Safety & Caregiver Support: Screen non-judgmentally for children, pets, or household members at risk of accidental exposure or diversion.'
    ],
    diagnosticsEs: [
      'Confirmar Tolerancia Opioide Antes de Indicar Fentanilo Transdérmico: Los parches de fentanilo SOLO están indicados en pacientes tolerantes a opioides (>= 60 mg de morfina oral equivalente/día por >= 7 días).',
      'Evaluar Seguridad en el Hogar: Identificar sin prejuicios la presencia de niños, mascotas o convivientes en riesgo de exposición accidental.'
    ],
    managementEn: [
      'CARDINAL TRANSDERMAL FENTANYL PATCH SAFETY RULES: (1) NEVER cut, fold, or damage a fentanyl patch; (2) NEVER apply a heating pad, hot water bottle, electric blanket, or hot tub exposure over a patch; (3) If a patient with a fentanyl patch develops respiratory depression, REMOVE the patch immediately, wipe the skin with water (not alcohol, which increases absorption!), and monitor/infuse Naloxone for at least 24 hours because the subcutaneous skin depot continues releasing fentanyl!',
      'Safe Patch Disposal ("Fold-and-Flush" / Drug Take-Back): Used fentanyl patches still contain > 50% of their original lethal fentanyl load after 72 hours—fold the sticky sides together and flush immediately down the toilet (FDA Flush List) or seal in a Deterra activated-carbon disposal pouch so children/pets or distressed individuals cannot access used patches in the trash.',
      'Supportive Palliative Stewardship (Never Abandon Dying Patients): If aberrant medication use or relapse occurs in palliative care, DO NOT discharge the patient from pain care; instead, transition to shorter prescription intervals (3–7 days), utilize a combination lockbox, switch to Methadone or split-dose Buprenorphine + long-acting formulations, and provide multiple kits of Intranasal Naloxone.'
    ],
    managementEs: [
      'REGLAS CARDINALES DE SEGURIDAD EN PARCHES DE FENTANILO: (1) NUNCA cortar ni dañar un parche de fentanilo; (2) NUNCA colocar almohadillas térmicas ni mantas eléctricas sobre el parche; (3) Si ocurre depresión respiratoria, RETIRAR el parche de inmediato, limpiar la piel solo con agua (¡nunca con alcohol!) y vigilar con Naloxona por >= 24 horas debido al depósito subcutáneo.',
      'Desecho Seguro de Parches Usados: Un parche usado tras 72 horas aún contiene > 50% de su carga letal de fentanilo; doblar el lado adhesivo sobre sí mismo y desechar según la lista segura de la FDA o en bolsas de carbón activado (Deterra), nunca abierto en la basura.',
      'Custodia Paliativa Compasiva (Nunca Abandonar al Paciente): Ante uso aberrante o recaída en cuidados paliativos, NO dar de alta punitiva; usar recetas de intervalos cortos (3–7 días), cajas con llave, Metadona o Buprenorfina fraccionada y kits de Naloxona intranasal.'
    ],
    harmReductionEn:
      'Ensure every palliative care and oncology household receiving opioids has at least two 2-packs of 4 mg Intranasal Naloxone and clear education on recognizing slowed breathing vs normal end-of-life sleep.',
    harmReductionEs:
      'Garantizar que todo hogar en cuidados paliativos u oncología que recibe opioides cuente con al menos dos paquetes de Naloxona intranasal de 4 mg y educación clara para la familia.'
  })
});

export const ONCOLOGY_HARM_REDUCTION_RULES = Object.freeze([
  Object.freeze({
    id: 'asco_split_moud_layer_agonists_rule',
    titleEn: 'The ASCO/NCCN Cancer Pain on MOUD Rule (Never Stop MOUD; Split TID/QID + Layer Agonists)',
    titleEs: 'Regla ASCO/NCCN de Dolor Oncológico en TMO (Nunca Suspender TMO; Fraccionar c/6–8h + Sumar Agonistas)',
    bodyEn:
      'Never discontinue baseline Buprenorphine or Methadone during acute or malignant cancer pain. Split the daily Buprenorphine or Methadone dose into every-6-to-8-hour (TID/QID) intervals and layer scheduled or PCA full-agonist opioids (Hydromorphone, Fentanyl, Morphine) on top.',
    bodyEs:
      'Nunca suspender la Buprenorfina o Metadona basal ante dolor oncológico. Fraccionar la dosis diaria total cada 6 a 8 horas (c/6–8h) y sumar opioides agonistas puros (Hidromorfona, Fentanilo, Morfina) pautados o en bomba PCA.'
  }),
  Object.freeze({
    id: 'sickle_cell_30min_analgesia_no_saline_bolus_rule',
    titleEn: 'The Sickle Cell 30-Minute Parenteral Analgesia & No-Routine-Saline-Bolus Rule',
    titleEs: 'Regla de Analgesia Parenteral en <= 30 Minutos y Evitar Bolos de Salina 0.9% en Drepanocitosis',
    bodyEn:
      'Deliver first parenteral opioid dose within <= 30 minutes of triage (use Subcutaneous route if IV access takes > 15 min; never IM). Normal vital signs do not exclude 10/10 vaso-occlusive pain. Avoid routine 0.9% saline boluses in euvolemic patients (hyperchloremic acidosis promotes sickling and Acute Chest Syndrome).',
    bodyEs:
      'Administrar la primera dosis de opioide parenteral en <= 30 minutos desde el triaje (usar vía Subcutánea si la vía IV tarda > 15 min; nunca IM). Los signos vitales normales no descartan dolor 10/10. Evitar bolos rutinarios de salina 0.9% en pacientes euvolémicos para prevenir Síndrome Torácico Agudo.'
  }),
  Object.freeze({
    id: 'oin_m3g_h3g_opioid_rotation_rule',
    titleEn: 'The M3G/H3G Opioid-Induced Neurotoxicity Rotation Rule',
    titleEs: 'Regla de Rotación Opioide en Neurotoxicidad por Metabolitos M3G/H3G',
    bodyEn:
      'Worsening diffuse allodynia, multifocal myoclonus, and delirium during Morphine or Hydromorphone escalation signals 3-glucuronide neurotoxicity (OIN/OIH). Stop escalating the offending drug, hydrate with IV saline, and rotate to Fentanyl, Methadone, or Buprenorphine (reducing equianalgesic dose by 25–50%).',
    bodyEs:
      'El empeoramiento de la alodinia, mioclonías multifocales y delirio al subir Morfina o Hidromorfona indica neurotoxicidad por metabolitos 3-glucurónidos (NIO/HIO). No subir la dosis: hidratar con solución salina y rotar a Fentanilo, Metadona o Buprenorfina (reduciendo 25–50% la dosis equianalgésica).'
  }),
  Object.freeze({
    id: 'hypercalcemia_mescc_no_overshadowing_rule',
    titleEn: 'The Anti-Overshadowing Rule for Hypercalcemia & Malignant Cord Compression',
    titleEs: 'Regla Contra el Sesgo de Anclaje en Hipercalcemia y Compresión Medular Maligna',
    bodyEn:
      'Never dismiss lethargy/constipation as "opioid sedation" without checking Ionized/Corrected Calcium (treat severe hypercalcemia with IV 0.9% NaCl + Calcitonin + Zoledronic Acid), and never dismiss supine back pain in cancer as "drug-seeking"—give STAT IV Dexamethasone (10–16 mg) and obtain Whole-Spine MRI.',
    bodyEs:
      'Nunca atribuir letargo/estreñimiento a "sedación opioide" sin medir Calcio Corregido/Iónico (tratar hipercalcemia con Salina 0.9% IV + Calcitonina + Ácido Zoledrónico), ni atribuir dolor dorsal en cáncer a "búsqueda de fármacos": dar Dexametasona 10–16 mg IV STAT y RM de columna.'
  }),
  Object.freeze({
    id: 'fentanyl_patch_heat_depot_rule',
    titleEn: 'The Transdermal Fentanyl Heat Prohibition & 24-Hour Subcutaneous Depot Rule',
    titleEs: 'Regla de Prohibición de Calor en Parches de Fentanilo y Depósito Subcutáneo de 24 Horas',
    bodyEn:
      'Heating pads, electric blankets, or high fevers over a transdermal fentanyl patch increase fentanyl absorption 3-to-4-fold, causing fatal overdose. After removing a fentanyl patch for overdose, monitor and administer Naloxone for at least 24 hours due to the residual dermal depot.',
    bodyEs:
      'Las almohadillas térmicas, mantas eléctricas o fiebre alta sobre un parche de fentanilo triplican o cuadruplican su absorción, causando sobredosis mortal. Tras retirar un parche por sobredosis, vigilar y mantener Naloxona por >= 24 horas debido al depósito dérmico residual.'
  })
]);

const DEFAULT_ONCOLOGY_STATE = Object.freeze({
  selectedSyndrome: 'cancer_pain_on_moud',
  activeCancerPainOnBuprenorphineOrMethadone: false,
  sickleCellVocPainOrChestInfiltrateHypoxia: false,
  escalatingMorphineHydromorphoneMyoclonusAllodynia: false,
  cancerLethargyConstipationOrSupineBackWeakness: false,
  stockingGloveNeuropathyOrGrade3Mucositis: false,
  transdermalFentanylPatchHeatOrStorageRisk: false,
  clinicalNotes: ''
});

let oncologyState = { ...DEFAULT_ONCOLOGY_STATE };
const listeners = new Set();

export function getOncologyState() {
  return { ...oncologyState };
}

export function setOncologyState(patch = {}) {
  oncologyState = { ...oncologyState, ...patch };
  for (const fn of listeners) {
    fn(getOncologyState());
  }
  return getOncologyState();
}

export function resetOncologyState() {
  oncologyState = { ...DEFAULT_ONCOLOGY_STATE };
  for (const fn of listeners) {
    fn(getOncologyState());
  }
  return getOncologyState();
}

export function subscribeOncologyState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function evaluateOncologyRisk(state = oncologyState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const profile =
    ONCOLOGY_SYNDROME_PROFILES[state.selectedSyndrome] ||
    ONCOLOGY_SYNDROME_PROFILES.cancer_pain_on_moud;

  const redFlags = [];
  let urgency = profile.urgency;

  if (state.sickleCellVocPainOrChestInfiltrateHypoxia) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'EMERGENCIA EN DREPANOCITOSIS (Crisis Vasooclusiva / Síndrome Torácico Agudo): Administrar opioide parenteral (IV o Subcutáneo; nunca IM) en <= 30 min del triaje. Evitar bolos rutinarios de salina 0.9% si está euvolémico. Si hay infiltrado pulmonar o SpO2 < 92% (STA): Ceftriaxona + Azitromicina IV y Exanguinotransfusión (meta HbS < 30%).'
        : 'SICKLE CELL EMERGENCY (Vaso-Occlusive Crisis / Acute Chest Syndrome): Administer parenteral opioid (IV or Subcutaneous; never IM) within <= 30 min of triage. Avoid routine 0.9% saline boluses if euvolemic. If pulmonary infiltrate or SpO2 < 92% (ACS): IV Ceftriaxone + Azithromycin and Urgent RBC Exchange Transfusion (target HbS < 30%).'
    );
  }

  if (state.cancerLethargyConstipationOrSupineBackWeakness) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'EMERGENCIA ONCOLÓGICA (Hipercalcemia Maligna / Compresión Medular Epidural): No atribuir a sedación opioide. Si hay dolor dorsal nocturno/supino o debilidad: Dexametasona 10–16 mg IV STAT + RM de columna completa. Si Ca corregido >= 12–14 mg/dL: Solución Salina 0.9% 200–300 mL/h + Calcitonina SC + Ácido Zoledrónico 4 mg IV.'
        : 'ONCOLOGIC EMERGENCY (Hypercalcemia of Malignancy / Spinal Cord Compression): Do not misattribute to opioid sedation. For supine back pain or weakness: STAT IV Dexamethasone 10–16 mg + Whole-Spine MRI. For corrected Ca >= 12–14 mg/dL: IV 0.9% NaCl 200–300 mL/hr + SC Calcitonin + IV Zoledronic Acid 4 mg.'
    );
  }

  if (state.activeCancerPainOnBuprenorphineOrMethadone) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'DOLOR ONCOLÓGICO EN PACIENTE CON BUPRENORFINA O METADONA (Consenso ASCO/NCCN): NUNCA suspender el TMO basal. Fraccionar la dosis diaria de Buprenorfina o Metadona cada 6–8 horas (TID/QID) y añadir agonistas mu puros de alta afinidad (Hidromorfona, Fentanilo o Morfina) pautados o en PCA.'
        : 'CANCER PAIN ON BUPRENORPHINE OR METHADONE (ASCO/NCCN Consensus): NEVER stop baseline MOUD. Split the daily Buprenorphine or Methadone dose into every-6-to-8-hour (TID/QID) intervals and layer scheduled or PCA full mu-agonists (Hydromorphone, Fentanyl, or Morphine) on top.'
    );
  }

  if (state.escalatingMorphineHydromorphoneMyoclonusAllodynia) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'NEUROTOXICIDAD E HIPERALGESIA INDUCIDA POR OPIOIDES (Metabolitos M3G/H3G): Detener el aumento de Morfina/Hidromorfona. Hidratar con solución salina IV y realizar Rotación Opioide a Fentanilo, Metadona o Buprenorfina (reduciendo 25–50% la dosis equianalgésica calculada).'
        : 'OPIOID-INDUCED NEUROTOXICITY & HYPERALGESIA (M3G/H3G Metabolites): Stop escalating Morphine/Hydromorphone. Hydrate with IV normal saline and perform Equianalgesic Opioid Rotation to Fentanyl, Methadone, or Buprenorphine (reducing calculated equianalgesic dose by 25–50%).'
    );
  }

  if (state.stockingGloveNeuropathyOrGrade3Mucositis) {
    if (urgency === 'ROUTINE') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'NEUROPATÍA POR QUIMIOTERAPIA (NPQ) O MUCOSITIS GRADO 3–4: Iniciar Duloxetina (30 mg -> 60 mg VO c/24h, Nivel I ASCO) para NPQ dolorosa. En mucositis severa que impide deglutir: enjuagues de Morfina tópica 0.2% / Doxepina 0.5%, PCA IV y convertir Metadona oral a vía IV al 50% de la dosis.'
        : 'CHEMOTHERAPY NEUROPATHY (CIPN) OR GRADE 3–4 MUCOSITIS: Start Duloxetine (30 mg -> 60 mg PO daily, ASCO Level I) for painful CIPN. For severe mucositis preventing swallowing: topical 0.2% Morphine / 0.5% Doxepin oral rinses, IV PCA, and convert oral Methadone to IV at 50% of the oral dose.'
    );
  }

  if (state.transdermalFentanylPatchHeatOrStorageRisk) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE PARCHE TRANSDÉRMICO DE FENTANILO (Calor / Depósito Dérmico): Retirar cualquier fuente de calor (almohadilla térmica/manta eléctrica) de inmediato. Si hay sedación/sobredosis: retirar el parche, lavar con agua (nunca alcohol) y mantener vigilancia/Naloxona por >= 24 horas.'
        : 'TRANSDERMAL FENTANYL PATCH SAFETY ALERT (Heat / Dermal Depot): Remove any external heat source (heating pad/electric blanket) immediately. If sedation/overdose is present: remove patch, wash skin with water (never alcohol), and maintain Naloxone monitoring for >= 24 hours.'
    );
  }

  return {
    syndromeId: profile.id,
    urgency,
    title: isEs ? profile.titleEs : profile.titleEn,
    badge: isEs ? profile.badgeEs : profile.badgeEn,
    summary: isEs ? profile.summaryEs : profile.summaryEn,
    pathophysiology: isEs ? profile.pathophysiologyEs : profile.pathophysiologyEn,
    diagnostics: isEs ? profile.diagnosticsEs : profile.diagnosticsEn,
    management: isEs ? profile.managementEs : profile.managementEn,
    harmReduction: isEs ? profile.harmReductionEs : profile.harmReductionEn,
    redFlags
  };
}

export function formatOncologySbarText(state = oncologyState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const evalResult = evaluateOncologyRisk(state, lang);

  const lines = [];
  lines.push(
    isEs
      ? '=== ENTREGA CLÍNICA SBAR: ONCOLOGÍA, CUIDADOS PALIATIVOS, DREPANOCITOSIS Y DOLOR EN TMO (CERO-PII) ==='
      : '=== SBAR CLINICAL HANDOFF: ONCOLOGY, PALLIATIVE CARE, SICKLE CELL & PAIN ON MOUD (ZERO-PII) ==='
  );
  lines.push(
    `${isEs ? 'SITUACIÓN (Síndrome Primario)' : 'SITUATION (Primary Syndrome)'}: ${evalResult.title} [${evalResult.urgency}]`
  );
  lines.push(`${isEs ? 'Prioridad Clínica' : 'Clinical Priority'}: ${evalResult.badge}`);
  lines.push('');
  lines.push(isEs ? 'ANTECEDENTES Y FISIOPATOLOGÍA:' : 'BACKGROUND & PATHOPHYSIOLOGY:');
  lines.push(`- ${evalResult.summary}`);
  lines.push(`- ${evalResult.pathophysiology}`);

  if (evalResult.redFlags.length > 0) {
    lines.push('');
    lines.push(
      isEs
        ? 'ALERTAS ROJAS ONCOLÓGICAS, PALIATIVAS Y DE DREPANOCITOSIS ACTIVAS:'
        : 'ACTIVE ONCOLOGIC, PALLIATIVE & SICKLE CELL RED-FLAG ALERTS:'
    );
    for (const rf of evalResult.redFlags) {
      lines.push(`  [!] ${rf}`);
    }
  }

  lines.push('');
  lines.push(
    isEs
      ? 'EVALUACIÓN Y DIAGNÓSTICO REQUERIDO:'
      : 'ASSESSMENT & DIAGNOSTIC WORKUP:'
  );
  for (const d of evalResult.diagnostics) {
    lines.push(`  * ${d}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'RECOMENDACIÓN Y PROTOCOLO ANALGÉSICO / ONCOLÓGICO:'
      : 'RECOMMENDATION & ANALGESIC / ONCOLOGIC PROTOCOL:'
  );
  for (const m of evalResult.management) {
    lines.push(`  * ${m}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'REDUCCIÓN DE DAÑOS Y ÉTICA EN CUIDADOS PALIATIVOS:'
      : 'PALLIATIVE HARM REDUCTION & ANTI-STIGMA ETHICS:'
  );
  lines.push(`  * ${evalResult.harmReduction}`);

  if (state.clinicalNotes && state.clinicalNotes.trim()) {
    lines.push('');
    lines.push(
      `${isEs ? 'NOTAS CLÍNICAS EFÍMERAS (EN RAM)' : 'EPHEMERAL CLINICAL NOTES (IN-RAM)'}: ${state.clinicalNotes.trim()}`
    );
  }

  return lines.join('\n');
}

export function oncologyPalliativeView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const root = el('section', {
    className: 'view-section oncology-palliative-view',
    attrs: {
      'aria-labelledby': 'oncology-palliative-heading',
      'data-view': 'oncology-palliative'
    }
  });

  const header = el('header', { className: 'view-header oncology-header' });
  const kicker = el(
    'span',
    { className: 'section-kicker' },
    t(
      'oncology.kicker',
      isEs
        ? 'Oncología, Cuidados Paliativos, Drepanocitosis y Analgesia en TMO'
        : 'Oncology, Palliative Medicine, Sickle Cell Crisis & Analgesia on MOUD'
    )
  );
  const title = h('h1', { id: 'oncology-palliative-heading', class: 'view-title' },
    t(
      'oncology.title',
      isEs
        ? 'Navegador de Dolor Oncológico en Buprenorfina/Metadona, Crisis de Drepanocitosis, Neurotoxicidad Opioide y Cuidados Paliativos'
        : 'Oncology, Palliative Care, Sickle Cell Vaso-Occlusive Crisis & Complex Cancer Pain on MOUD Navigator'
    )
  );
  const subtitle = el(
    'p',
    { className: 'view-subtitle' },
    t(
      'oncology.subtitle',
      isEs
        ? 'Soporte clínico cero-PII en memoria RAM según consensos ASCO, NCCN, NHLBI y ASH: manejo del dolor maligno fraccionando Buprenorfina/Metadona, analgesia en <= 30 min para crisis vasooclusiva y síndrome torácico agudo en drepanocitosis, rotación por neurotoxicidad M3G/H3G, hipercalcemia/compresión medular y seguridad de parches de fentanilo.'
        : 'Zero-PII, in-RAM clinical decision support aligned with ASCO, NCCN, NHLBI, and ASH consensus: managing malignant pain via split-dose Buprenorphine/Methadone + full agonists, <= 30-minute analgesia for Sickle Cell Vaso-Occlusive Crisis and Acute Chest Syndrome, M3G/H3G opioid-induced neurotoxicity rotation, hypercalcemia/cord compression mimics, and transdermal fentanyl heat safety.'
    )
  );
  header.append(kicker, title, subtitle);
  root.appendChild(header);

  const safetyBanner = el('div', {
    className: 'clinical-alert-banner oncology-safety-banner',
    attrs: { role: 'region', 'aria-label': isEs ? 'Seguridad Oncológica y Paliativa' : 'Oncology & Palliative Safety Rules' }
  });
  safetyBanner.append(
    el(
      'strong',
      {},
      isEs
        ? 'Reglas Cardinales en Dolor Oncológico y Drepanocitosis: '
        : 'Cardinal Oncology, Palliative & Sickle Cell Rules: '
    ),
    el(
      'span',
      {},
      isEs
        ? '(1) En dolor oncológico con Buprenorfina o Metadona, NUNCA suspender el TMO basal: fraccionar cada 6–8 h y sumar agonistas mu puros; (2) En crisis vasooclusiva de drepanocitosis, administrar analgesia parenteral en <= 30 min (evitar bolos rutinarios de salina 0.9%); (3) Ante mioclonías y alodinia por morfina/hidromorfona (M3G/H3G), rotar a fentanilo o metadona.'
        : '(1) In cancer pain on Buprenorphine or Methadone, NEVER stop baseline MOUD: split q6–8h and layer full mu-agonists; (2) In Sickle Cell Vaso-Occlusive Crisis, administer parenteral analgesia within <= 30 min (avoid routine 0.9% saline boluses); (3) In morphine/hydromorphone myoclonus and allodynia (M3G/H3G), rotate to fentanyl or methadone.'
    )
  );
  root.appendChild(safetyBanner);

  const selectorSection = el('section', {
    className: 'oncology-selector-section card',
    attrs: { 'aria-labelledby': 'oncology-selector-heading' }
  });
  selectorSection.appendChild(
    el(
      'h2',
      { id: 'oncology-selector-heading', className: 'card-title' },
      t(
        'oncology.selectorTitle',
        isEs
          ? '1. Seleccione el Síndrome Oncológico, Paliativo o de Drepanocitosis'
          : '1. Select Primary Oncology, Palliative Care or Sickle Cell Syndrome'
      )
    )
  );

  const syndromeGrid = el('div', {
    className: 'oncology-syndrome-grid',
    attrs: { role: 'group', 'aria-label': isEs ? 'Selector de síndrome oncológico y paliativo' : 'Oncology and palliative syndrome selector' }
  });

  const detailContainer = el('div', {
    className: 'oncology-detail-container',
    attrs: { 'aria-live': 'polite' }
  });

  const sbarPre = el('pre', {
    className: 'sbar-output-pre oncology-sbar-pre',
    attrs: { tabindex: '0', 'aria-label': isEs ? 'Entrega clínica SBAR de oncología y paliativos' : 'Oncology and palliative SBAR clinical handoff' }
  });

  function renderSyndromeButtons() {
    clear(syndromeGrid);
    const current = getOncologyState();
    for (const profile of Object.values(ONCOLOGY_SYNDROME_PROFILES)) {
      const isSelected = current.selectedSyndrome === profile.id;
      const btn = makeButton(
        isEs ? profile.titleEs : profile.titleEn,
        () => {
          setOncologyState({ selectedSyndrome: profile.id });
          renderSyndromeButtons();
          renderDetailAndSbar();
        },
        {
          className: `button syndrome-select-btn ${isSelected ? 'active primary' : 'secondary'}`,
          ariaPressed: isSelected ? 'true' : 'false'
        }
      );
      btn.setAttribute('data-syndrome-id', profile.id);
      syndromeGrid.appendChild(btn);
    }
  }

  const flagsSection = el('section', {
    className: 'oncology-flags-section card',
    attrs: { 'aria-labelledby': 'oncology-flags-heading' }
  });
  flagsSection.appendChild(
    el(
      'h2',
      { id: 'oncology-flags-heading', className: 'card-title' },
      t(
        'oncology.flagsTitle',
        isEs
          ? '2. Verificador de Signos de Alarma en Dolor Oncológico, Drepanocitosis y Neurotoxicidad'
          : '2. Cancer Pain, Sickle Cell Crisis & Opioid Neurotoxicity Red-Flag Checker'
      )
    )
  );

  const flagDefinitions = [
    {
      key: 'activeCancerPainOnBuprenorphineOrMethadone',
      labelEn:
        'Moderate-to-severe cancer or end-of-life pain in a patient maintained on Buprenorphine or Methadone (ASCO / NCCN Split-MOUD Protocol)',
      labelEs:
        'Dolor oncológico o de final de vida moderado a severo en paciente en tratamiento con Buprenorfina o Metadona (Protocolo ASCO / NCCN)'
    },
    {
      key: 'sickleCellVocPainOrChestInfiltrateHypoxia',
      labelEn:
        'Acute Sickle Cell Disease vaso-occlusive pain crisis (VOC) OR chest pain, fever, new pulmonary infiltrate, or SpO2 < 92% (Acute Chest Syndrome)',
      labelEs:
        'Crisis vasooclusiva dolorosa aguda (CVO) en Drepanocitosis O dolor torácico, fiebre, infiltrado pulmonar o SpO2 < 92% (Síndrome Torácico Agudo)'
    },
    {
      key: 'escalatingMorphineHydromorphoneMyoclonusAllodynia',
      labelEn:
        'Worsening diffuse pain/allodynia, multifocal myoclonus, or delirium during high-dose Morphine, Hydromorphone, or Oxycodone escalation (M3G/H3G OIN)',
      labelEs:
        'Empeoramiento paradójico del dolor/alodinia, mioclonías multifocales o delirio al escalar Morfina, Hidromorfona u Oxicodona (Neurotoxicidad M3G/H3G)'
    },
    {
      key: 'cancerLethargyConstipationOrSupineBackWeakness',
      labelEn:
        'Lethargy, confusion, and constipation in cancer (Hypercalcemia of Malignancy) OR new supine back pain with leg weakness/retention (Cord Compression)',
      labelEs:
        'Letargo, confusión y estreñimiento en cáncer (Hipercalcemia Maligna) O dolor dorsal en decúbito con debilidad/retención (Compresión Medular)'
    },
    {
      key: 'stockingGloveNeuropathyOrGrade3Mucositis',
      labelEn:
        'Painful stocking-glove Chemotherapy-Induced Peripheral Neuropathy (CIPN) OR Grade 3–4 radiation/chemo oral mucositis preventing pill swallowing',
      labelEs:
        'Neuropatía Periférica Inducida por Quimioterapia (NPQ) en guante y calcetín O mucositis oral Grado 3–4 que impide tragar comprimidos'
    },
    {
      key: 'transdermalFentanylPatchHeatOrStorageRisk',
      labelEn:
        'Transdermal Fentanyl patch exposed to heating pad/fever OR household needing safe lockbox/disposal and overdose prevention',
      labelEs:
        'Parche transdérmico de Fentanilo expuesto a almohadilla térmica/fiebre O necesidad de resguardo con llave y desecho seguro en el hogar'
    }
  ];

  const flagsList = el('div', { className: 'oncology-flags-list' });
  const checkboxRefs = new Map();

  for (const def of flagDefinitions) {
    const row = el('label', { className: 'checkbox-row oncology-flag-row' });
    const cb = el('input', {
      attrs: {
        type: 'checkbox',
        'data-flag-key': def.key
      }
    });
    cb.checked = Boolean(oncologyState[def.key]);
    cb.addEventListener('change', () => {
      setOncologyState({ [def.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(def.key, cb);
    row.append(cb, el('span', {}, isEs ? def.labelEs : def.labelEn));
    flagsList.appendChild(row);
  }
  flagsSection.appendChild(flagsList);

  function renderDetailAndSbar() {
    clear(detailContainer);
    const evalResult = evaluateOncologyRisk(getOncologyState());

    const card = el('article', {
      className: `card oncology-profile-card urgency-${evalResult.urgency.toLowerCase()}`
    });

    const headerRow = el('div', { className: 'profile-header-row' });
    const badge = el(
      'span',
      { className: `urgency-badge urgency-${evalResult.urgency.toLowerCase()}` },
      `${evalResult.urgency}: ${evalResult.badge}`
    );
    const h3 = el('h3', { className: 'profile-title' }, evalResult.title);
    headerRow.append(badge, h3);
    card.appendChild(headerRow);

    if (evalResult.redFlags.length > 0) {
      const alertBox = el('div', {
        className: 'oncology-redflag-box',
        attrs: { role: 'alert' }
      });
      alertBox.appendChild(
        el(
          'h4',
          {},
          isEs
            ? 'Alertas Clínicas Oncológicas, Paliativas y de Drepanocitosis Activadas'
            : 'Immediate Oncology, Palliative & Sickle Cell Red-Flag Alerts Activated'
        )
      );
      const ul = el('ul', {});
      for (const rf of evalResult.redFlags) {
        ul.appendChild(el('li', {}, rf));
      }
      alertBox.appendChild(ul);
      card.appendChild(alertBox);
    }

    card.appendChild(el('p', { className: 'profile-summary' }, evalResult.summary));

    const pathoSection = el('div', { className: 'profile-subsection' });
    pathoSection.append(
      el('h4', {}, isEs ? 'Fisiopatología y Farmacología de Receptores' : 'Pathophysiology & Receptor Pharmacology'),
      el('p', {}, evalResult.pathophysiology)
    );
    card.appendChild(pathoSection);

    const diagSection = el('div', { className: 'profile-subsection' });
    diagSection.appendChild(
      el('h4', {}, isEs ? 'Evaluación Clínica y Diagnóstica' : 'Clinical & Diagnostic Workup')
    );
    const diagList = el('ul', {});
    for (const item of evalResult.diagnostics) {
      diagList.appendChild(el('li', {}, item));
    }
    diagSection.appendChild(diagList);
    card.appendChild(diagSection);

    const mgmtSection = el('div', { className: 'profile-subsection' });
    mgmtSection.appendChild(
      el(
        'h4',
        {},
        isEs
          ? 'Protocolo de Manejo Analgésico, Oncológico y Transfusional'
          : 'Analgesic, Oncologic & Transfusion Management Protocol'
      )
    );
    const mgmtList = el('ul', {});
    for (const item of evalResult.management) {
      mgmtList.appendChild(el('li', {}, item));
    }
    mgmtSection.appendChild(mgmtList);
    card.appendChild(mgmtSection);

    const hrSection = el('div', { className: 'profile-subsection harm-reduction-highlight' });
    hrSection.append(
      el(
        'h4',
        {},
        isEs
          ? 'Reducción de Daños y Atención Libre de Estigma'
          : 'Anti-Stigma Stewardship & Harm Reduction'
      ),
      el('p', {}, evalResult.harmReduction)
    );
    card.appendChild(hrSection);

    detailContainer.appendChild(card);
    sbarPre.textContent = formatOncologySbarText(getOncologyState());
  }

  selectorSection.appendChild(syndromeGrid);
  root.appendChild(selectorSection);
  root.appendChild(flagsSection);
  root.appendChild(detailContainer);

  const rulesSection = el('section', {
    className: 'oncology-rules-section card',
    attrs: { 'aria-labelledby': 'oncology-rules-heading' }
  });
  rulesSection.appendChild(
    el(
      'h2',
      { id: 'oncology-rules-heading', className: 'card-title' },
      t(
        'oncology.rulesTitle',
        isEs
          ? '3. Reglas Cardinales en Dolor Oncológico, Drepanocitosis y Cuidados Paliativos'
          : '3. Cardinal Rules of Oncology Pain, Sickle Cell Crisis & Palliative Care'
      )
    )
  );
  const rulesGrid = el('div', { className: 'oncology-rules-grid' });
  for (const rule of ONCOLOGY_HARM_REDUCTION_RULES) {
    const rCard = el('article', { className: 'oncology-rule-card' });
    rCard.append(
      el('h3', { className: 'rule-title' }, isEs ? rule.titleEs : rule.titleEn),
      el('p', { className: 'rule-body' }, isEs ? rule.bodyEs : rule.bodyEn)
    );
    rulesGrid.appendChild(rCard);
  }
  rulesSection.appendChild(rulesGrid);
  root.appendChild(rulesSection);

  const sbarSection = el('section', {
    className: 'oncology-sbar-section card',
    attrs: { 'aria-labelledby': 'oncology-sbar-heading' }
  });
  sbarSection.appendChild(
    el(
      'h2',
      { id: 'oncology-sbar-heading', className: 'card-title' },
      t(
        'oncology.sbarTitle',
        isEs
          ? '4. Generador de Entrega Clínica SBAR (Cero-PII en RAM)'
          : '4. Zero-PII SBAR Clinical Handoff Generator (In-RAM)'
      )
    )
  );

  const notesLabel = el(
    'label',
    { className: 'field-label', attrs: { for: 'oncology-clinical-notes' } },
    isEs
      ? 'Notas clínicas contextuales (solo en RAM, sin datos identificables):'
      : 'Contextual clinical notes (in-RAM only, zero identifiable data):'
  );
  const notesInput = el('textarea', {
    id: 'oncology-clinical-notes',
    className: 'form-textarea oncology-notes-input',
    attrs: {
      rows: '2',
      placeholder: isEs
        ? 'Ej. Buprenorfina basal 8 mg SL c/8h + PCA de hidromorfona, o HbSS con dolor vasooclusivo 9/10...'
        : 'e.g., Baseline buprenorphine 8 mg SL q8h + hydromorphone PCA, or HbSS with 9/10 vaso-occlusive pain...'
    }
  });
  notesInput.value = oncologyState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setOncologyState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatOncologySbarText(getOncologyState());
  });

  const copyStatus = el('span', {
    className: 'copy-status-msg',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });

  const copyBtn = makeButton(
    isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard',
    async () => {
      const txt = formatOncologySbarText(getOncologyState());
      const ok = await copyText(txt, {
        trigger: copyBtn,
        copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
        failedLabel: isEs ? 'No se pudo copiar — seleccione el texto manualmente' : 'Copy failed — select text manually',
      });
      copyStatus.textContent = ok
        ? (isEs ? '¡Copiado al portapapeles!' : 'Copied to clipboard!')
        : (isEs ? 'No se pudo acceder al portapapeles. Copie el texto manualmente.' : 'Could not access clipboard. Select the text to copy manually.');
    },
    { className: 'button primary copy-sbar-btn' }
  );

  const resetBtn = makeButton(
    isEs ? 'Reiniciar Formulario (RAM)' : 'Reset Triage State (RAM)',
    () => {
      resetOncologyState();
      notesInput.value = '';
      copyStatus.textContent = '';
      for (const [k, cb] of checkboxRefs.entries()) {
        cb.checked = Boolean(oncologyState[k]);
      }
      renderSyndromeButtons();
      renderDetailAndSbar();
    },
    { className: 'button secondary reset-oncology-btn' }
  );

  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);

  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  const linksSection = el('nav', {
    className: 'oncology-links-section card',
    attrs: { 'aria-label': isEs ? 'Navegadores clínicos relacionados' : 'Related clinical navigators' }
  });
  linksSection.appendChild(
    el(
      'h2',
      { className: 'card-title' },
      isEs ? 'Vías Clínicas Integradas Relacionadas' : 'Related Integrated Clinical Pathways'
    )
  );
  const linksRow = el('div', { className: 'related-links-row' });
  linksRow.append(
    makeLinkButton(
      isEs ? 'Dolor Crónico y Buprenorfina (#/chronic-pain)' : 'Chronic Pain & Buprenorphine (#/chronic-pain)',
      '#/chronic-pain',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Atención Hospitalaria y Dolor Agudo en TMO (#/hospital-care)' : 'Hospital Care & Acute Pain on MOUD (#/hospital-care)',
      '#/hospital-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Hematología y Coagulopatías (#/hematology-care)' : 'Hematology & Coagulopathy (#/hematology-care)',
      '#/hematology-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Cardiología y Seguridad QTc (#/cardiology-care)' : 'Cardiology & QTc Safety (#/cardiology-care)',
      '#/cardiology-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Directorio de Herramientas (#/tools)' : 'Clinical Tools Directory (#/tools)',
      '#/tools',
      { className: 'button secondary' }
    )
  );
  linksSection.appendChild(linksRow);
  root.appendChild(linksSection);

  renderSyndromeButtons();
  renderDetailAndSbar();

  return root;
}
