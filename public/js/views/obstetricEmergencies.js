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

export const OBSTETRIC_SYNDROME_PROFILES = Object.freeze({
  stimulant_preeclampsia_abruption: Object.freeze({
    id: 'stimulant_preeclampsia_abruption',
    urgency: 'EMERGENCY',
    badgeEn: 'ACOG 30-MIN ANTIHYPERTENSIVE + ABRUPTION / MgSO4 PROTOCOL',
    badgeEs: 'ANTIHIPERTENSIVO EN <= 30 MIN ACOG + PROTOCOLO DE DESPRENDIMIENTO / MgSO4',
    titleEn: 'Stimulant Hypertensive Crisis vs. Severe Preeclampsia, Eclampsia & Placental Abruption',
    titleEs: 'Crisis Hipertensiva por Estimulantes vs. Preeclampsia Severa, Eclampsia y Desprendimiento de Placenta',
    summaryEn:
      'Acute maternal hypertension (SBP >= 160 or DBP >= 110 mmHg), uteroplacental vasoconstriction, eclamptic seizures, and concealed or overt placental abruption in pregnancy complicated by cocaine, methamphetamine, or hypertensive disorders.',
    summaryEs:
      'Hipertensión materna aguda (PAS >= 160 o PAD >= 110 mmHg), vasoconstricción uteroplacentaria, convulsiones eclámpticas y desprendimiento prematuro de placenta normoinserta (oculto o evidente) asociado a cocaína, metanfetamina o preeclampsia.',
    pathophysiologyEn:
      'Cocaine and methamphetamine block norepinephrine/dopamine reuptake and trigger intense alpha-1 spiral artery vasoconstriction, acute maternal blood pressure spikes, endothelial injury, and retroplacental spiral artery rupture (Placental Abruption). Importantly, up to 20–30% of placental abruptions are CONCEALED behind the placenta—presenting with a rigid "woody" uterus, maternal shock, DIC, and fetal bradycardia without visible vaginal bleeding!',
    pathophysiologyEs:
      'La cocaína y la metanfetamina bloquean la recaptación de catecolaminas y provocan vasoconstricción alfa-1 intensa de las arterias espirales, crisis hipertensiva y ruptura retroplacentaria (Desprendimiento de Placenta). ¡Hasta el 20–30% de los desprendimientos son OCULTOS detrás de la placenta, con hipertonía uterina ("útero leñoso"), choque, CID y bradicardia fetal sin sangrado vaginal visible!',
    diagnosticsEn: [
      'Continuous Electronic Fetal Monitoring (minimum 4–24 hours after trauma, stimulant exposure, or vaginal pain/bleeding) + Maternal Vital Signs every 15 minutes + Complete Blood Count, Platelets, AST/ALT, Creatinine, LDH, Urine Protein/Creatinine Ratio, and Fibrinogen / PT / PTT.',
      'CRITICAL FIBRINOGEN RULE IN PREGNANCY: Normal third-trimester fibrinogen is 400–600 mg/dL; a "normal non-pregnant" fibrinogen of < 200 mg/dL in a pregnant patient signals SEVERE Disseminated Intravascular Coagulation (DIC) from placental abruption! Note: Ultrasound has only ~25–50% sensitivity for placental abruption—a negative ultrasound NEVER rules out abruption!'
    ],
    diagnosticsEs: [
      'Monitoreo Fetal Electrónico Continuo (mínimo 4–24 h) + Signos Vitales Maternos cada 15 min + Biometría Hemática, Plaquetas, AST/ALT, Creatinina, LDH, Relación Proteína/Creatinina Urinaria y Fibrinógeno / TP / TTP.',
      'REGLA CRÍTICA DEL FIBRINÓGENO EN EL EMBARAZO: El fibrinógeno normal en el 3er trimestre es 400–600 mg/dL; un nivel < 200 mg/dL en una gestante indica Coagulación Intravascular Diseminada (CID) GRAVE por desprendimiento placentario. Una ecografía negativa NUNCA descarta desprendimiento.'
    ],
    managementEn: [
      'ACOG 30-to-60 MINUTE SEVERE HYPERTENSION MANDATE (SBP >= 160 or DBP >= 110 mmHg): Initiate antihypertensive therapy within <= 30–60 minutes to prevent maternal hemorrhagic stroke! When acute cocaine or methamphetamine toxicity is active or suspected, prefer Oral Immediate-Release Nifedipine (10–20 mg PO q20min) or IV Hydralazine (5–10 mg IV q20min) + IV Benzodiazepines (if agitated) over pure beta-blockers; IV Labetalol (20 mg -> 40 mg -> 80 mg) is standard for non-stimulant preeclampsia.',
      'ECLAMPSIA PROPHYLAXIS & TREATMENT (IV Magnesium Sulfate): Administer Magnesium Sulfate 4–6 g IV loading dose over 20–30 minutes, followed by 1–2 g/hr IV maintenance infusion for all patients with severe preeclampsia, eclampsia, or imminent preterm birth < 32 weeks (fetal neuroprotection). Monitor patellar reflexes, respiratory rate (>= 12/min), and urine output (>= 30 mL/hr); keep 10% Calcium Gluconate (10 mL IV) at bedside as the Magnesium antidote.',
      'PLACENTAL ABRUPTION & MATERNAL RESUSCITATION: Place patient in Left Lateral Tilt (15–30° to relieve aortocaval compression), establish 2 large-bore IVs, activate Massive Transfusion Protocol / Cryoprecipitate to maintain Fibrinogen > 200–300 mg/dL, and proceed to emergent Cesarean delivery if Category III fetal heart tracing or maternal hemodynamic instability persists.'
    ],
    managementEs: [
      'MANDATO ACOG DE 30 A 60 MINUTOS EN HIPERTENSIÓN SEVERA (PAS >= 160 o PAD >= 110 mmHg): Iniciar antihipertensivo en <= 30–60 min para prevenir EVC hemorrágico materno. Si hay intoxicación aguda por cocaína o metanfetamina, preferir Nifedipino de liberación inmediata (10–20 mg VO c/20 min) o Hidralazina IV (5–10 mg IV c/20 min); el Labetalol IV es estándar en preeclampsia sin estimulantes.',
      'PROFILAXIS Y TRATAMIENTO DE ECLAMPSIA (Sulfato de Magnesio IV): Dosis de carga de 4–6 g IV en 20–30 min, seguida de 1–2 g/h IV en toda preeclampsia con criterios de severidad, eclampsia o parto pretérmino < 32 semanas (neuroprotección fetal). Tener Gluconato de Calcio al 10% (10 mL IV) en cabecera como antídoto.',
      'DESPRENDIMIENTO DE PLACENTA Y REANIMACIÓN: Decúbito lateral izquierdo (15–30°), 2 vías IV gruesas, crioprecipitados para mantener Fibrinógeno > 200–300 mg/dL y cesárea de emergencia si hay trazo fetal Categoría III o inestabilidad materna.'
    ],
    harmReductionEn:
      'Never delay prenatal or emergency obstetric care out of fear—counsel pregnant patients that severe headache, visual scotomata, right upper quadrant pain, or abdominal rigidity require immediate hospital evaluation regardless of recent substance use.',
    harmReductionEs:
      'Nunca retrasar la atención obstétrica de urgencia: educar que cefalea intensa, fosfenos, dolor en hipocondrio derecho o abdomen rígido requieren evaluación hospitalaria inmediata sin importar el consumo reciente.'
  }),

  trimester_moud_pk_split_dosing: Object.freeze({
    id: 'trimester_moud_pk_split_dosing',
    urgency: 'URGENT',
    badgeEn: 'ASAM/ACOG 3RD-TRIMESTER SPLIT-DOSING (BID–QID) + PART 8 RIGHTS',
    badgeEs: 'FRACCIONAMIENTO DE TMO EN 3ER TRIMESTRE (c/6–12h) + DERECHOS PARTE 8',
    titleEn: 'Third-Trimester CYP3A4 / UGT Induction & Split-Dose Buprenorphine / Methadone Protocol',
    titleEs: 'Inducción Enzimática CYP3A4 / UGT en el Tercer Trimestre y Fraccionamiento de Buprenorfina / Metadona',
    summaryEn:
      'Pharmacokinetic management of accelerated maternal Methadone and Buprenorphine metabolism during the 2nd and 3rd trimesters—preventing maternal withdrawal, cravings, and fetal distress through dose increases and BID/TID/QID split dosing.',
    summaryEs:
      'Manejo farmacocinético del metabolismo acelerado de Metadona y Buprenorfina en el 2.º y 3.er trimestre: prevención de abstinencia materna, deseo de consumo y sufrimiento fetal mediante ajuste de dosis y fraccionamiento cada 6 a 12 horas.',
    pathophysiologyEn:
      'During the 2nd and 3rd trimesters, maternal plasma volume expands by 40–50%, glomerular filtration rate rises by 50%, and placental estrogen/progesterone strongly induce hepatic CYP3A4, CYP2B6, CYP2D6, and UGT1A1/2B7 enzymes. As a result, Methadone and Buprenorphine half-lives shorten dramatically: once-daily dosing produces high post-dose peaks (transient fetal heart rate variability suppression) followed by deep afternoon/overnight troughs (maternal COWS withdrawal, uterine contractions, fetal hyperkinesis, and relapse risk).',
    pathophysiologyEs:
      'En el 2.º y 3.er trimestre, el volumen plasmático aumenta 40–50%, el filtrado glomerular sube 50% y los estrógenos/progesterona placentarios inducen las enzimas hepáticas CYP3A4, CYP2B6 y UGT. La vida media de la Metadona y la Buprenorfina se acorta drásticamente: una sola dosis diaria genera picos altos seguidos de valles profundos vespertinos/nocturnos con abstinencia materna, contracciones uterinas y sufrimiento fetal.',
    diagnosticsEn: [
      'Clinical Trough Assessment (Do Not Rely on Serum Methadone Trough Levels Alone): Evaluate for afternoon/evening or early-morning rhinorrhea, diaphoresis, restlessness, myalgias, insomnia, uterine cramping, or return of opioid cravings.',
      'Fetal Non-Stress Test (NST) Timing Nuance: An NST performed 1–2 hours after a large single daily Methadone dose may transiently show decreased fetal heart rate variability or non-reactivity due to peak transplacental concentration—splitting the dose eliminates this artifact!'
    ],
    diagnosticsEs: [
      'Evaluación Clínica en el Valle (No Depender Solo de Niveles Séricos): Identificar rinorrea, diaforesis, inquietud, mialgias, insomnio, cólicos uterinos o deseo de consumo vespertino/nocturno.',
      'Matiz de la Prueba Sin Estrés Fetal (NST): Un NST realizado 1–2 h tras una dosis única alta de Metadona puede mostrar disminución transitoria de la variabilidad fetal; fraccionar la dosis corrige este fenómeno.'
    ],
    managementEn: [
      'CARDINAL ASAM / ACOG PREGNANCY MOUD RULE (Never Taper MOUD in Pregnancy): NEVER taper or discontinue Methadone or Buprenorphine during pregnancy in an attempt to prevent Neonatal Opioid Withdrawal Syndrome (NOWS)—maternal MOUD dose does NOT correlate with NOWS severity, whereas tapering triggers maternal relapse, placental insufficiency, preterm birth, and fatal overdose!',
      'SPLIT-DOSING PROTOCOL (BID / TID / QID): (1) For Methadone: increase total daily dose as needed for 24-hour stability AND split the daily dose into 2 to 4 divided doses (typically every 12 hours [50%/50%] or every 8 hours); (2) For Buprenorphine (Suboxone or Subutex—both are equally safe and endorsed by ACOG/ASAM in pregnancy!): divide the total daily dose into 3 or 4 doses (every 6–8 hours).',
      '2024 SAMHSA 42 CFR Part 8 Federal Rights: Under modernized federal OTP rules, OTP medical directors have direct clinical authority to dispense split-dosed take-home Methadone to pregnant patients without waiting for a federal CSAT exception!'
    ],
    managementEs: [
      'REGLA CARDINAL ASAM / ACOG EN EL EMBARAZO (Nunca Reducir el TMO): NUNCA reducir ni suspender la Metadona o Buprenorfina durante el embarazo intentando evitar el síndrome de abstinencia neonatal (SAN): la dosis materna NO se correlaciona con la gravedad del SAN, mientras que reducirla provoca recaída, parto pretérmino y sobredosis mortal.',
      'PROTOCOLO DE DOSIS FRACCIONADA (c/6–12 h): (1) Metadona: aumentar la dosis diaria necesaria y dividirla en 2 a 4 tomas (cada 8 o 12 horas); (2) Buprenorfina (buprenorfina/naloxona o monoproducto; ambos son seguros según ACOG/ASAM): dividir la dosis diaria en 3 o 4 tomas (cada 6–8 horas).',
      'Derechos Federales 42 CFR Parte 8 (SAMHSA 2024): Los directores médicos de clínicas OTP tienen autoridad directa para entregar dosis fraccionadas para llevar a pacientes embarazadas sin trámite de excepción federal.'
    ],
    harmReductionEn:
      'Reassure pregnant patients that needing a higher or split dose of Methadone or Buprenorphine in the 2nd and 3rd trimesters is normal pregnancy physiology—not "worsening addiction"—and does not increase harm to the baby.',
    harmReductionEs:
      'Explicar a la paciente embarazada que necesitar una dosis mayor o fraccionada de Metadona o Buprenorfina en el 2.º y 3.er trimestre es fisiología normal del embarazo y no aumenta el riesgo para el bebé.'
  }),

  intrapartum_cesarean_pain_on_moud: Object.freeze({
    id: 'intrapartum_cesarean_pain_on_moud',
    urgency: 'URGENT',
    badgeEn: 'NO NALBUPHINE/BUTORPHANOL + CONTINUE MOUD + NEURAXIAL/TAP BLOCK',
    badgeEs: 'PROHIBIDO NALBUFINA/BUTORFANOL + MANTENER TMO + EPIDURAL/BLOQUEO TAP',
    titleEn: 'Intrapartum Labor, Cesarean Delivery & Postpartum Multimodal Analgesia on MOUD',
    titleEs: 'Analgesia Intraparto, Cesárea y Manejo Multimodal del Dolor Posparto en TMO',
    summaryEn:
      'Evidence-based peripartum anesthesia and analgesia protocol for labor and Cesarean birth in patients maintained on Buprenorphine, Sublocade/Brixadi, or Methadone—preventing iatrogenic precipitated withdrawal and untreated surgical pain.',
    summaryEs:
      'Protocolo de anestesia y analgesia periparto para trabajo de parto y cesárea en pacientes en tratamiento con Buprenorfina, Sublocade/Brixadi o Metadona, previniendo abstinencia precipitada y dolor quirúrgico no tratado.',
    pathophysiologyEn:
      'Baseline Methadone or Buprenorphine satisfies baseline mu-opioid receptor dependency and prevents withdrawal, but provides ZERO reserve analgesia for labor contractions or Pfannenstiel laparotomy pain (and chronic opioid exposure induces NMDA-mediated opioid tolerance/hyperalgesia, increasing postpartum opioid requirements by 40–70%). Critically, obstetric mixed agonist-antagonist opioids (Nalbuphine [Nubain], Butorphanol [Stadol], Pentazocine) competitively displace full agonists and trigger violent maternal and fetal Precipitated Withdrawal!',
    pathophysiologyEs:
      'La Metadona o Buprenorfina basal cubre la dependencia de receptores mu pero NO aporta analgesia para las contracciones ni la laparotomía de cesárea (y la tolerancia opioide aumenta los requerimientos analgésicos posparto en 40–70%). ¡Los agonistas-antagonistas mixtos obstétricos (Nalbufina [Nubain], Butorfanol [Stadol], Pentazocina) desplazan a los agonistas mu y precipitan abstinencia materna y sufrimiento fetal agudo!',
    diagnosticsEn: [
      'Pre-Delivery Anesthesia Consultation & Medication Reconciliation: Verify exact daily Buprenorphine or Methadone dose (with OTP confirmation for Methadone) and place an explicit Electronic Health Record Allergy/Contraindication Banner against Nalbuphine, Butorphanol, and Pentazocine.',
      'Assess Coagulopathy / Thrombocytopenia (< 70,000–80,000/mcL) or recent anticoagulation prior to neuraxial catheter placement.'
    ],
    diagnosticsEs: [
      'Valoración Preparto por Anestesia Obstétrica y Conciliación de Medicamentos: Verificar dosis exacta de Buprenorfina o Metadona y registrar alerta de CONTRAINDICACIÓN ABSOLUTA para Nalbufina, Butorfanol y Pentazocina.',
      'Evaluar plaquetas (> 70,000–80,000/mcL) y coagulación antes de analgesia neuroaxial.'
    ],
    managementEn: [
      'ABSOLUTE OBSTETRIC CONTRAINDICATION (Never Give Nalbuphine or Butorphanol): Strictly prohibit Nalbuphine (Nubain), Butorphanol (Stadol), and Pentazocine in any pregnant patient taking Buprenorphine, Methadone, or fentanyl/opioids.',
      'CONTINUE BASELINE MOUD UNINTERRUPTED THROUGH LABOR & CESAREAN: Continue full daily Buprenorphine (split q6–8h) or Methadone (split q8–12h; convert to IV Methadone at 50% of oral dose only if strictly NPO). Do NOT stop Buprenorphine before Cesarean delivery!',
      'MULTIMODAL NEURAXIAL & REGIONAL POST-CESAREAN PROTOCOL: (1) Early Labor Epidural or Spinal/Combined Spinal-Epidural with preservative-free Neuraxial Morphine (Duramorph 100–150 mcg intrathecal or 2–3 mg epidural) + local anesthetic; (2) Bilateral Ultrasound-Guided Transversus Abdominis Plane (TAP) or Quadratus Lumborum (QL) Block with liposomal/plain bupivacaine; (3) Scheduled round-the-clock Acetaminophen (1,000 mg q6–8h) + IV Ketorolac (15–30 mg q6h x 48h) -> Ibuprofen (600 mg q6h, if no preeclampsia/bleeding contraindication); (4) Layer short-acting full mu-agonists (Oxycodone 5–15 mg PO q4h or Hydromorphone PO/IV PCA) for 3–7 days post-Cesarean with a clear taper plan.'
    ],
    managementEs: [
      'CONTRAINDICACIÓN OBSTÉTRICA ABSOLUTA (Nunca Dar Nalbufina ni Butorfanol): Prohibir estrictamente Nalbufina (Nubain), Butorfanol (Stadol) y Pentazocina en toda gestante en Buprenorfina, Metadona u opioides.',
      'MANTENER EL TMO BASAL SIN INTERRUPCIÓN DURANTE EL PARTO Y LA CESÁREA: Continuar la dosis completa de Buprenorfina (fraccionada c/6–8 h) o Metadona (c/8–12 h). ¡NO suspender la Buprenorfina antes de la cesárea!',
      'PROTOCOLO MULTIMODAL NEUROAXIAL Y REGIONAL POSCESÁREA: (1) Analgesia Epidural temprana o Espinal con Morfina neuroaxial sin conservadores; (2) Bloqueo bilateral del Plano Transverso del Abdomen (TAP) o Cuadrado Lumbar (QL) guiado por ecografía; (3) Paracetamol (1,000 mg c/6–8 h) + Ketorolaco IV / Ibuprofeno pautado (si no hay preeclampsia/sangrado); (4) Sumar agonistas mu puros de acción corta (Oxicodona o Hidromorfona) por 3–7 días poscesárea.'
    ],
    harmReductionEn:
      'Write a collaborative Birth Analgesia Plan during the 3rd trimester so Labor & Delivery nurses, obstetricians, and anesthesiologists are aligned on continuing MOUD and providing full multimodal analgesia without stigma.',
    harmReductionEs:
      'Elaborar un Plan Colaborativo de Analgesia de Parto en el 3.er trimestre para alinear a obstetricia, enfermería y anestesiología en mantener el TMO y brindar analgesia multimodal completa sin estigma.'
  }),

  postpartum_hemorrhage_uterotonics: Object.freeze({
    id: 'postpartum_hemorrhage_uterotonics',
    urgency: 'EMERGENCY',
    badgeEn: 'NO METHERGINE IN STIMULANTS/HTN + TXA < 3H + FIBRINOGEN > 200',
    badgeEs: 'PROHIBIDO METILERGONOVINA EN ESTIMULANTES/HTA + ATX < 3H + FIBRINÓGENO > 200',
    titleEn: 'Postpartum Hemorrhage (PPH) & Safe Uterotonic Selection in Substance Use & Hypertension',
    titleEs: 'Hemorragia Posparto (HPP) y Selección Segura de Uterotónicos en Uso de Sustancias e Hipertensión',
    summaryEn:
      'Emergency management of Postpartum Hemorrhage (cumulative blood loss >= 1,000 mL or hypovolemic signs) with critical pharmacological guardrails against Methylergonovine coronary/cerebral vasospasm and Carboprost bronchospasm.',
    summaryEs:
      'Manejo de emergencia de la Hemorragia Posparto (pérdida sanguínea >= 1,000 mL o choque hipovolémico) con barreras farmacológicas críticas contra el vasoespasmo por Metilergonovina y el broncoespasmo por Carboprost.',
    pathophysiologyEn:
      'Postpartum hemorrhage is driven by the "4 Ts": Tone (uterine atony, 70–80%), Trauma (lacerations/rupture), Tissue (retained placenta), and Thrombin (DIC from placental abruption, preeclampsia, or cirrhosis). Standard second-line uterotonics carry lethal interactions in substance use: Methylergonovine (Methergine, an ergot alkaloid) activates alpha-adrenergic and 5-HT2A receptors, causing catastrophic hypertensive crisis, coronary artery spasm, myocardial infarction, and stroke in patients with hypertension, preeclampsia, or cocaine/methamphetamine use!',
    pathophysiologyEs:
      'La hemorragia posparto se debe a las "4 T": Tono (atonía uterina, 70–80%), Trauma, Tejido y Trombina (CID por desprendimiento placentario, preeclampsia o cirrosis). La Metilergonovina (Methergine, alcaloide del cornezuelo) activa receptores alfa-adrenérgicos y 5-HT2A, causando crisis hipertensiva letal, espasmo coronario, infarto y EVC en pacientes con hipertensión, preeclampsia o uso de cocaína/metanfetamina.',
    diagnosticsEn: [
      'Quantitative Blood Loss (QBL) Measurement: Weigh all blood-soaked drapes and sponges immediately (1 gram = 1 mL blood loss; QBL >= 1,000 mL or any blood loss with tachycardia/hypotension defines PPH).',
      'STAT Coagulation & Viscoelastic Testing (TEG / ROTEM): Check Fibrinogen (critical threshold < 200 mg/dL!), Platelets, PT/INR, PTT, and ionized Calcium.'
    ],
    diagnosticsEs: [
      'Cuantificación Objetiva del Sangrado (QBL): Pesar compresas y campos quirúrgicos de inmediato (1 gramo = 1 mL; sangrado >= 1,000 mL o con signos de hipovolemia define HPP).',
      'Coagulación STAT y Tromboelastografía (TEG / ROTEM): Medir Fibrinógeno (umbral crítico < 200 mg/dL), Plaquetas, TP/INR, TTP y Calcio iónico.'
    ],
    managementEn: [
      'CARDINAL UTEROTONIC CONTRAINDICATION RULES: (1) NEVER administer Methylergonovine (Methergine) to patients with hypertension, preeclampsia, cardiovascular disease, or recent cocaine/methamphetamine/vasoconstrictor use; (2) NEVER administer Carboprost (Hemabate / 15-methyl PGF2-alpha) to patients with asthma or "crack lung" reactive airway disease (causes severe refractory bronchospasm!).',
      'SAFE FIRST- & SECOND-LINE PPH PHARMACOTHERAPY: (1) Bimanual Uterine Massage + High-Rate IV Oxytocin (10–40 units in 500–1,000 mL crystalloid); (2) Misoprostol (600–800 mcg sublingual/rectal/buccal—safe in both hypertension/stimulants and asthma!); (3) Tranexamic Acid (TXA 1 g IV over 10 minutes within <= 3 hours of birth; may repeat 1 g IV once after 30 min if bleeding continues—WOMAN Trial!).',
      'MECHANICAL TAMPONADE & HEMOSTASIS: Early placement of an Intrauterine Vacuum-Induced Hemorrhage Control Device (Jada) or Bakri Tamponade Balloon, Uterine Artery Embolization or B-Lynch compression sutures, and early Cryoprecipitate / Fibrinogen Concentrate to keep Fibrinogen > 200–300 mg/dL.'
    ],
    managementEs: [
      'REGLAS CARDINALES DE CONTRAINDICACIÓN DE UTEROTÓNICOS: (1) NUNCA administrar Metilergonovina (Methergine) en pacientes con hipertensión, preeclampsia, cardiopatía o consumo reciente de cocaína/metanfetamina; (2) NUNCA administrar Carboprost (Hemabate / PGF2-alfa) en pacientes con asma o broncoespasmo por "pulmón de crack".',
      'FARMACOTERAPIA SEGURA EN HPP: (1) Masaje uterino bimanual + Oxitocina IV (10–40 UI en 500–1,000 mL); (2) Misoprostol (600–800 mcg sublingual/rectal; seguro tanto en hipertensión/estimulantes como en asma); (3) Ácido Tranexámico (ATX 1 g IV en 10 min dentro de las primeras 3 horas posparto; repetir 1 g a los 30 min si persiste el sangrado — estudio WOMAN).',
      'TAPONAMIENTO MECÁNICO Y HEMOSTASIA: Dispositivo intrauterino de control por vacío (Jada) o Balón de Bakri, suturas compresivas de B-Lynch y Crioprecipitados tempranos para mantener Fibrinógeno > 200–300 mg/dL.'
    ],
    harmReductionEn:
      'In patients with difficult peripheral venous access due to injection-related vein sclerosis, secure two ultrasound-guided deep brachial/basilic or central/intraosseous lines early upon Labor & Delivery admission.',
    harmReductionEs:
      'En pacientes con acceso venoso periférico difícil por esclerosis venosa, asegurar temprano dos vías guiadas por ecografía al ingreso a sala de partos.'
  }),

  nows_eat_sleep_console: Object.freeze({
    id: 'nows_eat_sleep_console',
    urgency: 'ROUTINE',
    badgeEn: 'AAP / NEJM EAT-SLEEP-CONSOLE (ESC) + BREASTFEEDING ENCOURAGED',
    badgeEs: 'MODELO COMER-DORMIR-CONSOLAR (ESC) AAP/NEJM + LACTANCIA RECOMENDADA',
    titleEn: 'Neonatal Opioid Withdrawal Syndrome (NOWS) & The Eat, Sleep, Console (ESC) Care Model',
    titleEs: 'Síndrome de Abstinencia Neonatal de Opioides (SAN) y Modelo Comer, Dormir, Consolar (ESC)',
    summaryEn:
      'Family-centered, function-based neonatal care for opioid-exposed newborns using the NEJM ACT NOW Eat, Sleep, Console (ESC) protocol—maximizing rooming-in, breastfeeding on MOUD, and non-pharmacologic regulation.',
    summaryEs:
      'Atención neonatal centrada en la familia para recién nacidos expuestos a opioides mediante el protocolo Comer, Dormir, Consolar (ESC) del estudio NEJM ACT NOW: alojamiento conjunto, lactancia materna en TMO y regulación no farmacológica.',
    pathophysiologyEn:
      'After birth and umbilical cord clamping, transplacental opioid supply ceases while neonatal central nervous system noradrenergic (locus coeruleus) hyperactivity emerges over 24–120 hours (typically peaking at 24–72h for short-acting opioids/buprenorphine and 48–120h for methadone). The landmark 2023 NEJM ACT NOW ESC Trial (N = 1,305 infants across 26 US hospitals) proved that replacing subjective 21-item Finnegan scoring with functional Eat-Sleep-Console assessment cut time to medical readiness for discharge from 14.9 days to 8.2 days and reduced pharmacologic opioid treatment from 52% to 19.5%!',
    pathophysiologyEs:
      'Tras el pinzamiento del cordón umbilical, cesa el aporte transplacentario de opioides y surge hiperactividad noradrenérgica neonatal entre las 24 y 120 horas. El ensayo NEJM ACT NOW ESC (2023, N = 1,305 recién nacidos) demostró que evaluar la función con Comer-Dormir-Consolar en lugar de la escala de Finnegan redujo la estancia hospitalaria de 14.9 a 8.2 días y el uso de morfina neonatal del 52% al 19.5%.',
    diagnosticsEn: [
      'THE 3 FUNCTIONAL EAT, SLEEP, CONSOLE (ESC) QUESTIONS (Assessed Every 3–4 Hours After Feeds): (1) EAT: Can the infant breastfeed effectively for >= 10 minutes or take >= 1 oz (or age-appropriate volume) within 10 minutes without withdrawal-induced uncoordinated sucking? (2) SLEEP: Can the infant sleep undisturbed for >= 1 hour? (3) CONSOLE: If crying/fussy, can the infant be consoled within <= 10 minutes using parent/caregiver soothing measures?',
      'Observation Window: Monitor in a rooming-in unit for at least 72–96 hours (for short-acting opioids or buprenorphine) and 96–120 hours (for methadone).'
    ],
    diagnosticsEs: [
      'LAS 3 PREGUNTAS FUNCIONALES DE COMER, DORMIR, CONSOLAR (ESC) (Evaluadas Cada 3–4 Horas): (1) COMER: ¿El bebé logra amamantar bien >= 10 min o tomar su volumen esperado en 10 min? (2) DORMIR: ¿Duerme sin interrupción >= 1 hora? (3) CONSOLAR: ¿Se logra consolar en <= 10 minutos con medidas de contención?',
      'Ventana de Observación: Vigilar en alojamiento conjunto por al menos 72–96 h (buprenorfina/opioides cortos) y 96–120 h (metadona).'
    ],
    managementEn: [
      'FIRST-LINE TREATMENT IS THE PARENT (Non-Pharmacologic ESC Bundle): Rooming-in with the mother/parent in a dark, quiet, low-stimulation room ( NEVER automatically separate healthy dyads to the NICU!), continuous skin-to-skin contact, gentle C-curve swaddling, non-nutritive sucking (pacifier), and frequent on-demand feeding.',
      'BREASTFEEDING ON BUPRENORPHINE OR METHADONE IS STRONGLY ENCOURAGED (AAP / ABM / ACOG Consensus): Breastmilk transfer of Buprenorphine (< 1% of maternal weight-adjusted dose, plus poor oral bioavailability) and Methadone (< 2–3% of maternal dose) is minimal, safe, and clinically proven to reduce NOWS severity and shorten hospital stay! Only contraindicate breastfeeding if maternal HIV is untreated/unsuppressed or active illicit substance use is ongoing.',
      'PHARMACOLOGIC PRN RESCUE (When ESC Criteria Are Not Met Despite Optimized Non-Pharmacologic Care): Hold a team huddle with the parent, optimize soothing, and if the infant still cannot Eat, Sleep >= 1h, or Console within 10 min, administer symptom-based PRN oral Buprenorphine or oral Morphine/Methadone.'
    ],
    managementEs: [
      'EL TRATAMIENTO DE PRIMERA LÍNEA SON LOS PADRES (Paquete No Farmacológico ESC): Alojamiento conjunto en habitación tranquila con poca luz (¡NUNCA separar automáticamente al binomio sano en UCIN!), contacto piel con piel continuo, envoltura suave en flexión, succión no nutritiva y alimentación a libre demanda.',
      'LA LACTANCIA MATERNA EN BUPRENORFINA O METADONA ESTÁ FUERTEMENTE RECOMENDADA (Consenso AAP / ABM / ACOG): El paso a la leche materna de Buprenorfina (< 1%) y Metadona (< 2–3%) es mínimo, seguro y reduce la gravedad del SAN y la estancia hospitalaria.',
      'RESCATE FARMACOLÓGICO (Solo Si No Cumple Criterios ESC Tras Optimizar Cuidados No Farmacológicos): Realizar reunión de equipo con la madre y administrar dosis de rescate de Buprenorfina o Morfina/Metadona oral según protocolo.'
    ],
    harmReductionEn:
      'Prepare a CAPTA Plan of Safe Care (POSC) before delivery that documents maternal engagement in MOUD, pediatric follow-up, and safe sleep practices—distinguishing prescribed MOUD treatment from child abuse or neglect.',
    harmReductionEs:
      'Preparar un Plan de Cuidado Seguro (POSC) antes del parto que documente la adherencia materna al TMO y el seguimiento pediátrico, diferenciando el tratamiento médico prescrito del maltrato infantil.'
  }),

  fourth_trimester_overdose_cyp_deinduction: Object.freeze({
    id: 'fourth_trimester_overdose_cyp_deinduction',
    urgency: 'URGENT',
    badgeEn: '4TH-TRIMESTER OVERDOSE PROTECTION + POSTPARTUM CYP DE-INDUCTION',
    badgeEs: 'PROTECCIÓN CONTRA SOBREDOSIS EN 4.º TRIMESTRE + DESINDUCCIÓN CYP POSPARTO',
    titleEn: 'Fourth-Trimester (0–12 Months Postpartum) Overdose Prevention & CYP3A4 De-Induction Protocol',
    titleEs: 'Prevención de Sobredosis en el Cuarto Trimestre (0–12 Meses Posparto) y Desinducción CYP3A4',
    summaryEn:
      'Safeguarding maternal survival across the high-risk 12-month postpartum period—managing week 1–2 Methadone CYP3A4 de-induction, postpartum depression/psychosis, sleep preservation, and uninterrupted MOUD continuity.',
    summaryEs:
      'Protección de la supervivencia materna durante los 12 meses posparto de alto riesgo: manejo de la desinducción enzimática de Metadona en las semanas 1–2, depresión posparto y continuidad ininterrumpida del TMO.',
    pathophysiologyEn:
      'Epidemiologic data across US state Maternal Mortality Review Committees (MMRCs) demonstrate that drug overdose is a leading cause of pregnancy-associated death, with > 65–75% of fatal overdoses occurring between 43 days and 365 days postpartum ("the Fourth Trimester"). Concurrently, in the first 7–14 days after placental delivery, hepatic CYP3A4/CYP2B6 activity rapidly returns toward pre-pregnancy baseline and plasma volume contracts—which can transiently elevate serum Methadone levels if third-trimester doses were substantially increased.',
    pathophysiologyEs:
      'Los Comités de Mortalidad Materna demuestran que la sobredosis es una de las principales causas de muerte asociada al embarazo, ocurriendo el 65–75% de las muertes entre los 43 y 365 días posparto ("el Cuarto Trimestre"). Además, en los primeros 7–14 días tras el alumbramiento placentario, la actividad CYP3A4 regresa al nivel basal y el volumen plasmático se contrae, pudiendo elevar transitoriamente los niveles de Metadona.',
    diagnosticsEn: [
      'Week 1–2 Postpartum Sedation & Trough Check: Assess the mother daily during the first 2 weeks postpartum for daytime somnolence or nodded speech 2–4 hours after Methadone dosing (do NOT automatically slash the Methadone dose at delivery—adjust ONLY if clinical sedation occurs!).',
      'Edinburgh Postnatal Depression Scale (EPDS) & Bipolar/Psychosis Screening at 2 weeks, 6 weeks, 3 months, and 6 months postpartum.'
    ],
    diagnosticsEs: [
      'Vigilancia de Sedación en las Semanas 1–2 Posparto: Evaluar diariamente somnolencia diurna 2–4 h después de la dosis de Metadona (¡NO reducir automáticamente la dosis de Metadona al nacer el bebé; ajustar SOLO si aparece sedación clínica!).',
      'Tamizaje con Escala de Depresión Posnatal de Edimburgo (EPDS) a las 2 semanas, 6 semanas, 3 meses y 6 meses posparto.'
    ],
    managementEn: [
      'CARDINAL POSTPARTUM MOUD CONTINUITY RULE: Never abruptly reduce Methadone or Buprenorphine immediately after birth! Maintain the pregnancy dose (or gently titrate by 5–10 mg only if objective daytime sedation develops in weeks 1–2). For patients struggling with daily postpartum clinic travel with a newborn, utilize 2024 Part 8 flexible take-home Methadone or offer transition to Monthly Extended-Release Buprenorphine (Sublocade / Brixadi).',
      'POSTPARTUM DEPRESSION & SLEEP PROTECTION: Treat severe postpartum depression aggressively (SSRIs/SNRIs, Zuranolone, or Brexanolone are compatible with MOUD; monitor sedation with Zuranolone/Brexanolone), and build a nighttime newborn feeding shift plan with a partner/support person so sleep deprivation does not trigger relapse.',
      '12-MONTH MEDICAID EXTENSION & NALOXONE SATURATION: Ensure enrollment in the 365-day Postpartum Medicaid Extension, dispense multiple Intranasal Naloxone kits, and connect with peer doulas / home-visiting nurses.'
    ],
    managementEs: [
      'REGLA CARDINAL DE CONTINUIDAD DEL TMO POSPARTO: ¡Nunca reducir bruscamente la Metadona ni la Buprenorfina tras el parto! Mantener la dosis gestacional (ajustando 5–10 mg solo si hay sedación objetiva en las semanas 1–2). Aprovechar las dosis para llevar de la Parte 8 o considerar Buprenorfina de depósito mensual (Sublocade / Brixadi).',
      'DEPRESIÓN POSPARTO Y PROTECCIÓN DEL SUEÑO: Tratar activamente la depresión posparto (ISRS o Zuranolona compatibles con TMO) y organizar turnos nocturnos de apoyo para evitar la privación severa de sueño.',
      'EXTENSIÓN DE MEDICAID A 12 MESES Y DOTACIÓN DE NALOXONA: Asegurar la cobertura de Medicaid durante los 365 días posparto y entregar kits de Naloxona intranasal.'
    ],
    harmReductionEn:
      'Remind families and care teams that the highest risk of maternal overdose is at 3 to 9 months postpartum—warm handoffs from OB/GYN to primary care, addiction medicine, and peer support must extend through the entire first year.',
    harmReductionEs:
      'Recordar que el mayor riesgo de sobredosis materna ocurre entre los 3 y 9 meses posparto: el acompañamiento cálido entre obstetricia, adicciones y apoyo de pares debe cubrir todo el primer año.'
  })
});

export const OBSTETRIC_HARM_REDUCTION_RULES = Object.freeze([
  Object.freeze({
    id: 'never_taper_moud_split_trimester_rule',
    titleEn: 'The Never-Taper-MOUD in Pregnancy & 3rd-Trimester Split-Dosing Rule',
    titleEs: 'Regla de Nunca Reducir el TMO en el Embarazo y Fraccionar Dosis en el 3.er Trimestre',
    bodyEn:
      'Never taper Methadone or Buprenorphine during pregnancy to "prevent NOWS"—dose size does not correlate with NOWS severity, and tapering causes relapse and fetal distress. Split daily Methadone or Buprenorphine into BID/TID/QID dosing in the 2nd/3rd trimesters to counter accelerated CYP3A4/UGT clearance.',
    bodyEs:
      'Nunca reducir Metadona o Buprenorfina en el embarazo para "prevenir abstinencia neonatal": la dosis materna no determina la gravedad del SAN. Fraccionar la dosis diaria en 2 a 4 tomas durante el 2.º y 3.er trimestre para compensar la aceleración metabólica CYP3A4/UGT.'
  }),
  Object.freeze({
    id: 'no_nalbuphine_butorphanol_labor_rule',
    titleEn: 'The Absolute Prohibition of Nalbuphine (Nubain) & Butorphanol (Stadol) in Labor',
    titleEs: 'Prohibición Absoluta de Nalbufina (Nubain) y Butorfanol (Stadol) en Trabajo de Parto',
    bodyEn:
      'Mixed agonist-antagonist opioids (Nalbuphine, Butorphanol, Pentazocine) are strictly contraindicated in patients on Buprenorphine, Methadone, or chronic opioids—they precipitate violent maternal withdrawal and acute fetal bradycardia. Continue MOUD and use neuraxial analgesia + TAP blocks + full agonists.',
    bodyEs:
      'Los opioides agonistas-antagonistas mixtos (Nalbufina, Butorfanol, Pentazocina) están estrictamente contraindicados en pacientes con Buprenorfina, Metadona u opioides crónicos: precipitan abstinencia materna violenta y bradicardia fetal. Mantener TMO y usar analgesia neuroaxial + bloqueo TAP + agonistas puros.'
  }),
  Object.freeze({
    id: 'acog_30min_htn_abruption_fibrinogen_rule',
    titleEn: 'The ACOG 30-Minute Hypertension Mandate & Concealed Abruption Fibrinogen Rule',
    titleEs: 'Mandato Antihipertensivo en <= 30 Minutos y Regla del Fibrinógeno (< 200 mg/dL) en Desprendimiento',
    bodyEn:
      'Treat severe pregnancy hypertension (>= 160/110 mmHg) within <= 30–60 minutes (using Nifedipine or Hydralazine if stimulant toxicity is active) + IV Magnesium Sulfate. In suspected placental abruption, remember ultrasound misses 50–75% of cases and Fibrinogen < 200 mg/dL indicates severe DIC.',
    bodyEs:
      'Tratar la hipertensión severa (>= 160/110 mmHg) en <= 30–60 min (prefiriendo Nifedipino o Hidralazina si hay estimulantes activos) + Sulfato de Magnesio IV. En desprendimiento placentario, la ecografía omite el 50–75% de los casos y un Fibrinógeno < 200 mg/dL indica CID severa.'
  }),
  Object.freeze({
    id: 'pph_no_methergine_in_htn_stimulants_rule',
    titleEn: 'The Postpartum Hemorrhage No-Methergine in Hypertension/Stimulants Rule',
    titleEs: 'Regla de Prohibición de Metilergonovina en Hipertensión o Estimulantes durante Hemorragia Posparto',
    bodyEn:
      'Never give Methylergonovine (Methergine) in preeclampsia, hypertension, or cocaine/methamphetamine use (causes coronary/cerebral vasospasm), and avoid Carboprost (Hemabate) in asthma/crack lung. Use Oxytocin, Misoprostol, Tranexamic Acid (1 g IV < 3h), and intrauterine tamponade.',
    bodyEs:
      'Nunca administrar Metilergonovina (Methergine) en preeclampsia, hipertensión o uso de cocaína/metanfetamina (riesgo de vasoespasmo coronario/cerebral), ni Carboprost en asma. Usar Oxitocina, Misoprostol, Ácido Tranexámico (1 g IV < 3 h) y balón de taponamiento.'
  }),
  Object.freeze({
    id: 'eat_sleep_console_breastfeeding_moud_rule',
    titleEn: 'The NEJM Eat, Sleep, Console (ESC) & Breastfeeding-on-MOUD Rule',
    titleEs: 'Regla Comer, Dormir, Consolar (ESC) y Lactancia Materna en Buprenorfina/Metadona',
    bodyEn:
      'Use functional Eat-Sleep-Console (ESC) care with rooming-in, skin-to-skin, and breastfeeding on Buprenorphine or Methadone—cutting hospital stays by > 50% and reducing newborn opioid exposure by > 60% compared to Finnegan scoring.',
    bodyEs:
      'Aplicar el modelo funcional Comer-Dormir-Consolar (ESC) con alojamiento conjunto, piel con piel y lactancia materna en Buprenorfina o Metadona, reduciendo la estancia hospitalaria en > 50% y la exposición neonatal a morfina en > 60%.'
  })
]);

const DEFAULT_OBSTETRIC_STATE = Object.freeze({
  selectedSyndrome: 'stimulant_preeclampsia_abruption',
  severePregnancyHtnOrAbruptionPain: false,
  thirdTrimesterEveningWithdrawalCravings: false,
  laborOrCesareanOnBuprenorphineMethadone: false,
  postpartumHemorrhageWithHtnOrStimulants: false,
  newbornOpioidExposureNowsEscCare: false,
  fourthTrimesterPostpartumSedationOrMoodRisk: false,
  clinicalNotes: ''
});

let obstetricState = { ...DEFAULT_OBSTETRIC_STATE };
const listeners = new Set();

export function getObstetricState() {
  return { ...obstetricState };
}

export function setObstetricState(patch = {}) {
  obstetricState = { ...obstetricState, ...patch };
  for (const fn of listeners) {
    fn(getObstetricState());
  }
  return getObstetricState();
}

export function resetObstetricState() {
  obstetricState = { ...DEFAULT_OBSTETRIC_STATE };
  for (const fn of listeners) {
    fn(getObstetricState());
  }
  return getObstetricState();
}

export function subscribeObstetricState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function evaluateObstetricRisk(state = obstetricState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const profile =
    OBSTETRIC_SYNDROME_PROFILES[state.selectedSyndrome] ||
    OBSTETRIC_SYNDROME_PROFILES.stimulant_preeclampsia_abruption;

  const redFlags = [];
  let urgency = profile.urgency;

  if (state.severePregnancyHtnOrAbruptionPain) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'EMERGENCIA OBSTÉTRICA (PA >= 160/110 mmHg / Desprendimiento de Placenta): Administrar Nifedipino VO de liberación inmediata o Hidralazina IV en <= 30–60 min (preferidos sobre betabloqueadores puros si hay cocaína/metanfetamina) + Sulfato de Magnesio 4–6 g IV. Vigilar Fibrinógeno (< 200 mg/dL indica CID grave).'
        : 'OBSTETRIC EMERGENCY (BP >= 160/110 mmHg / Placental Abruption): Administer Immediate-Release Oral Nifedipine or IV Hydralazine within <= 30–60 min (preferred over pure beta-blockers if acute cocaine/methamphetamine is active) + IV Magnesium Sulfate 4–6 g load. Check Fibrinogen (< 200 mg/dL indicates severe DIC).'
    );
  }

  if (state.postpartumHemorrhageWithHtnOrStimulants) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'HEMORRAGIA POSPARTO (HPP) CON HIPERTENSIÓN O ESTIMULANTES: PROHIBIDO administrar Metilergonovina (Methergine) en hipertensión/preeclampsia/cocaína y PROHIBIDO Carboprost en asma. Usar Oxitocina IV + Misoprostol + Ácido Tranexámico 1 g IV (< 3 h) + balón intrauterino y mantener Fibrinógeno > 200–300 mg/dL.'
        : 'POSTPARTUM HEMORRHAGE (PPH) WITH HYPERTENSION OR STIMULANTS: STRICTLY AVOID Methylergonovine (Methergine) in hypertension/preeclampsia/cocaine and AVOID Carboprost in asthma. Use IV Oxytocin + Misoprostol + Tranexamic Acid 1 g IV (< 3h) + intrauterine balloon and maintain Fibrinogen > 200–300 mg/dL.'
    );
  }

  if (state.laborOrCesareanOnBuprenorphineMethadone) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'ANALGESIA DE PARTO Y CESÁREA EN TMO: PROHIBIDO usar Nalbufina (Nubain), Butorfanol (Stadol) o Pentazocina (precipitan abstinencia materna y bradicardia fetal). Continuar Buprenorfina o Metadona basal sin interrupción + Epidural/Espinal + Bloqueo TAP + AINEs/Paracetamol + agonistas mu puros.'
        : 'LABOR & CESAREAN ANALGESIA ON MOUD: STRICTLY PROHIBIT Nalbuphine (Nubain), Butorphanol (Stadol), and Pentazocine (precipitate maternal withdrawal and fetal bradycardia). Continue baseline Buprenorphine or Methadone uninterrupted + Neuraxial analgesia + TAP block + NSAIDs/Acetaminophen + full mu-agonists.'
    );
  }

  if (state.thirdTrimesterEveningWithdrawalCravings) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'INDUCCIÓN ENZIMÁTICA CYP3A4/UGT EN 2.º–3.er TRIMESTRE: Nunca reducir el TMO en el embarazo. Aumentar la dosis diaria total y FRACCIONAR la Metadona o Buprenorfina en 2 a 4 tomas diarias (c/6–12 h) para eliminar valles de abstinencia y sufrimiento fetal.'
        : '2ND/3RD-TRIMESTER CYP3A4/UGT INDUCTION: Never taper MOUD in pregnancy. Increase total daily dose and SPLIT Methadone or Buprenorphine into BID/TID/QID dosing (every 6–12 hours) to eliminate trough withdrawal and fetal distress.'
    );
  }

  if (state.newbornOpioidExposureNowsEscCare) {
    redFlags.push(
      isEs
        ? 'ATENCIÓN NEONATAL COMER-DORMIR-CONSOLAR (ESC): Priorizar alojamiento conjunto, piel con piel y lactancia materna en Buprenorfina/Metadona. Evaluar si el recién nacido Come >= 1 oz / amamanta bien, Duerme >= 1 h y se Consuela en <= 10 min antes de usar morfina/buprenorfina neonatal.'
        : 'EAT, SLEEP, CONSOLE (ESC) NEONATAL CARE: Prioritize rooming-in, skin-to-skin, and breastfeeding on Buprenorphine/Methadone. Assess whether the infant Eats >= 1 oz/breastfeeds well, Sleeps >= 1h, and Consoles within <= 10 min before administering pharmacologic rescue.'
    );
  }

  if (state.fourthTrimesterPostpartumSedationOrMoodRisk) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'SEGURIDAD EN EL 4.º TRIMESTRE POSPARTO: No reducir automáticamente el TMO tras el parto; vigilar sedación en las semanas 1–2 por desinducción CYP3A4, realizar tamizaje EPDS de depresión posparto, asegurar Medicaid por 12 meses y entregar kits de Naloxona.'
        : 'FOURTH-TRIMESTER POSTPARTUM SAFETY: Do not automatically cut MOUD at delivery; monitor for week 1–2 sedation from CYP3A4 de-induction, screen for postpartum depression (EPDS), secure 12-month Medicaid continuity, and dispense Naloxone kits.'
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

export function formatObstetricSbarText(state = obstetricState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const evalResult = evaluateObstetricRisk(state, lang);

  const lines = [];
  lines.push(
    isEs
      ? '=== ENTREGA CLÍNICA SBAR: EMERGENCIAS OBSTÉTRICAS, TMO PERIPARTO Y MODELO ESC NEONATAL (CERO-PII) ==='
      : '=== SBAR CLINICAL HANDOFF: OBSTETRIC EMERGENCIES, PERIPARTUM MOUD & NEONATAL ESC (ZERO-PII) ==='
  );
  lines.push(
    `${isEs ? 'SITUACIÓN (Síndrome Primario)' : 'SITUATION (Primary Syndrome)'}: ${evalResult.title} [${evalResult.urgency}]`
  );
  lines.push(`${isEs ? 'Prioridad Clínica' : 'Clinical Priority'}: ${evalResult.badge}`);
  lines.push('');
  lines.push(isEs ? 'ANTECEDENTES Y FISIOPATOLOGÍA MATERNO-FETAL:' : 'MATERNAL-FETAL BACKGROUND & PATHOPHYSIOLOGY:');
  lines.push(`- ${evalResult.summary}`);
  lines.push(`- ${evalResult.pathophysiology}`);

  if (evalResult.redFlags.length > 0) {
    lines.push('');
    lines.push(
      isEs
        ? 'ALERTAS ROJAS OBSTÉTRICAS Y PERIPARTO ACTIVAS:'
        : 'ACTIVE OBSTETRIC & PERIPARTUM RED-FLAG ALERTS:'
    );
    for (const rf of evalResult.redFlags) {
      lines.push(`  [!] ${rf}`);
    }
  }

  lines.push('');
  lines.push(
    isEs
      ? 'EVALUACIÓN MATERNO-FETAL Y LABORATORIO:'
      : 'MATERNAL-FETAL ASSESSMENT & DIAGNOSTIC WORKUP:'
  );
  for (const d of evalResult.diagnostics) {
    lines.push(`  * ${d}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'RECOMENDACIÓN Y PROTOCOLO OBSTÉTRICO / PERIPARTO:'
      : 'RECOMMENDATION & OBSTETRIC / PERIPARTUM PROTOCOL:'
  );
  for (const m of evalResult.management) {
    lines.push(`  * ${m}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'REDUCCIÓN DE DAÑOS MATERNO-INFANTIL Y DERECHOS:'
      : 'MATERNAL-INFANT HARM REDUCTION & PATIENT RIGHTS:'
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

export function obstetricEmergenciesView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const root = el('section', {
    className: 'view-section obstetric-emergencies-view',
    attrs: {
      'aria-labelledby': 'obstetric-emergencies-heading',
      'data-view': 'obstetric-emergencies'
    }
  });

  const header = el('header', { className: 'view-header obstetric-header' });
  const kicker = el(
    'span',
    { className: 'section-kicker' },
    t(
      'obstetric.kicker',
      isEs
        ? 'Urgencias Obstétricas, Farmacocinética Periparto del TMO y Modelo Neonatal ESC'
        : 'Obstetric Emergencies, Peripartum MOUD Pharmacokinetics & Neonatal ESC Care'
    )
  );
  const title = h('h1', { id: 'obstetric-emergencies-heading', class: 'view-title' },
    t(
      'obstetric.title',
      isEs
        ? 'Navegador de Emergencias Obstétricas, Desprendimiento Placentario, Dosis Fraccionada en 3.er Trimestre, Cesárea en TMO y Modelo Comer-Dormir-Consolar'
        : 'Maternal-Fetal & Obstetric Emergencies, Third-Trimester Split-Dosing, Cesarean Analgesia on MOUD & Eat-Sleep-Console Navigator'
    )
  );
  const subtitle = el(
    'p',
    { className: 'view-subtitle' },
    t(
      'obstetric.subtitle',
      isEs
        ? 'Soporte clínico cero-PII en memoria RAM según consensos ACOG, SMFM, ASAM y AAP: hipertensión severa y desprendimiento de placenta por estimulantes, fraccionamiento de Metadona/Buprenorfina en el 3.er trimestre, prohibición de Nalbufina/Butorfanol en parto, hemorragia posparto (sin Metilergonovina en HTA), modelo neonatal Comer-Dormir-Consolar (ESC) y prevención de sobredosis en el 4.º trimestre.'
        : 'Zero-PII, in-RAM clinical decision support aligned with ACOG, SMFM, ASAM, and AAP consensus: stimulant severe hypertension and placental abruption, 3rd-trimester split-dose Methadone/Buprenorphine, intrapartum Nalbuphine/Butorphanol prohibition, postpartum hemorrhage (no Methergine in HTN/stimulants), NEJM Eat-Sleep-Console (ESC) neonatal care, and 4th-trimester overdose prevention.'
    )
  );
  header.append(kicker, title, subtitle);
  root.appendChild(header);

  const safetyBanner = el('div', {
    className: 'clinical-alert-banner obstetric-safety-banner',
    attrs: { role: 'region', 'aria-label': isEs ? 'Seguridad Obstétrica Crítica' : 'Critical Obstetric Safety Rules' }
  });
  safetyBanner.append(
    el(
      'strong',
      {},
      isEs
        ? 'Reglas Cardinales en Urgencias Obstétricas y TMO Periparto: '
        : 'Cardinal Obstetric & Peripartum MOUD Survival Rules: '
    ),
    el(
      'span',
      {},
      isEs
        ? '(1) NUNCA administrar Nalbufina (Nubain) ni Butorfanol (Stadol) a gestantes en Buprenorfina o Metadona; (2) NUNCA reducir el TMO en el embarazo (fraccionar c/6–12 h en el 3.er trimestre); (3) En hemorragia posparto con hipertensión o cocaína/metanfetamina, PROHIBIDO usar Metilergonovina (Methergine).'
        : '(1) NEVER give Nalbuphine (Nubain) or Butorphanol (Stadol) to pregnant patients on Buprenorphine or Methadone; (2) NEVER taper MOUD during pregnancy (split BID–QID in the 3rd trimester); (3) In postpartum hemorrhage with hypertension or cocaine/methamphetamine, STRICTLY AVOID Methylergonovine (Methergine).'
    )
  );
  root.appendChild(safetyBanner);

  const selectorSection = el('section', {
    className: 'obstetric-selector-section card',
    attrs: { 'aria-labelledby': 'obstetric-selector-heading' }
  });
  selectorSection.appendChild(
    el(
      'h2',
      { id: 'obstetric-selector-heading', className: 'card-title' },
      t(
        'obstetric.selectorTitle',
        isEs
          ? '1. Seleccione el Escenario Obstétrico, Periparto o Neonatal'
          : '1. Select Primary Obstetric, Peripartum or Neonatal Scenario'
      )
    )
  );

  const syndromeGrid = el('div', {
    className: 'obstetric-syndrome-grid',
    attrs: { role: 'group', 'aria-label': isEs ? 'Selector de síndrome obstétrico' : 'Obstetric syndrome selector' }
  });

  const detailContainer = el('div', {
    className: 'obstetric-detail-container',
    attrs: { 'aria-live': 'polite' }
  });

  const sbarPre = el('pre', {
    className: 'sbar-output-pre obstetric-sbar-pre',
    attrs: { tabindex: '0', 'aria-label': isEs ? 'Entrega clínica SBAR obstétrica' : 'Obstetric SBAR clinical handoff' }
  });

  function renderSyndromeButtons() {
    clear(syndromeGrid);
    const current = getObstetricState();
    for (const profile of Object.values(OBSTETRIC_SYNDROME_PROFILES)) {
      const isSelected = current.selectedSyndrome === profile.id;
      const btn = makeButton(
        isEs ? profile.titleEs : profile.titleEn,
        () => {
          setObstetricState({ selectedSyndrome: profile.id });
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
    className: 'obstetric-flags-section card',
    attrs: { 'aria-labelledby': 'obstetric-flags-heading' }
  });
  flagsSection.appendChild(
    el(
      'h2',
      { id: 'obstetric-flags-heading', className: 'card-title' },
      t(
        'obstetric.flagsTitle',
        isEs
          ? '2. Verificador de Signos de Alarma Materno-Fetales, Uterotónicos y Neonatales'
          : '2. Maternal-Fetal, Uterotonic & Neonatal Red-Flag Triage Checker'
      )
    )
  );

  const flagDefinitions = [
    {
      key: 'severePregnancyHtnOrAbruptionPain',
      labelEn:
        'Severe pregnancy hypertension (BP >= 160/110 mmHg), headache/visual changes, OR rigid "woody" uterus / vaginal bleeding (Preeclampsia / Placental Abruption)',
      labelEs:
        'Hipertensión severa en el embarazo (PA >= 160/110 mmHg), cefalea/fosfenos O útero rígido "leñoso" / sangrado vaginal (Preeclampsia / Desprendimiento)'
    },
    {
      key: 'thirdTrimesterEveningWithdrawalCravings',
      labelEn:
        '2nd or 3rd trimester pregnant patient on once-daily Methadone or Buprenorphine experiencing afternoon/evening withdrawal, cravings, or uterine cramping',
      labelEs:
        'Gestante en 2.º o 3.er trimestre con Metadona o Buprenorfina en dosis única diaria que presenta abstinencia vespertina/nocturna, deseo de consumo o cólicos'
    },
    {
      key: 'laborOrCesareanOnBuprenorphineMethadone',
      labelEn:
        'Active labor or scheduled/emergent Cesarean delivery in a patient maintained on Buprenorphine, Sublocade/Brixadi, or Methadone',
      labelEs:
        'Trabajo de parto activo o cesárea programada/urgente en paciente en tratamiento con Buprenorfina, Sublocade/Brixadi o Metadona'
    },
    {
      key: 'postpartumHemorrhageWithHtnOrStimulants',
      labelEn:
        'Postpartum Hemorrhage (QBL >= 1,000 mL or uterine atony) in a patient with preeclampsia, hypertension, stimulant use, or asthma',
      labelEs:
        'Hemorragia Posparto (sangrado >= 1,000 mL o atonía uterina) en paciente con preeclampsia, hipertensión, uso de estimulantes o asma'
    },
    {
      key: 'newbornOpioidExposureNowsEscCare',
      labelEn:
        'Newborn exposed to maternal opioids/MOUD in utero requiring Eat, Sleep, Console (ESC) assessment and breastfeeding guidance',
      labelEs:
        'Recién nacido expuesto a opioides/TMO in utero que requiere evaluación Comer, Dormir, Consolar (ESC) y orientación sobre lactancia'
    },
    {
      key: 'fourthTrimesterPostpartumSedationOrMoodRisk',
      labelEn:
        'Postpartum mother (Week 1 to Month 12) needing Methadone CYP3A4 de-induction check, postpartum depression support, or overdose protection',
      labelEs:
        'Madre en posparto (Semana 1 a Mes 12) que requiere revisión de desinducción CYP3A4 de Metadona, apoyo en depresión posparto o prevención de sobredosis'
    }
  ];

  const flagsList = el('div', { className: 'obstetric-flags-list' });
  const checkboxRefs = new Map();

  for (const def of flagDefinitions) {
    const row = el('label', { className: 'checkbox-row obstetric-flag-row' });
    const cb = el('input', {
      attrs: {
        type: 'checkbox',
        'data-flag-key': def.key
      }
    });
    cb.checked = Boolean(obstetricState[def.key]);
    cb.addEventListener('change', () => {
      setObstetricState({ [def.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(def.key, cb);
    row.append(cb, el('span', {}, isEs ? def.labelEs : def.labelEn));
    flagsList.appendChild(row);
  }
  flagsSection.appendChild(flagsList);

  function renderDetailAndSbar() {
    clear(detailContainer);
    const evalResult = evaluateObstetricRisk(getObstetricState());

    const card = el('article', {
      className: `card obstetric-profile-card urgency-${evalResult.urgency.toLowerCase()}`
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
        className: 'obstetric-redflag-box',
        attrs: { role: 'alert' }
      });
      alertBox.appendChild(
        el(
          'h4',
          {},
          isEs
            ? 'Alertas Clínicas Obstétricas, Periparto y Neonatales Activadas'
            : 'Immediate Obstetric, Peripartum & Neonatal Red-Flag Alerts Activated'
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
      el('h4', {}, isEs ? 'Fisiopatología Materno-Fetal y Farmacocinética' : 'Maternal-Fetal Pathophysiology & Pharmacokinetics'),
      el('p', {}, evalResult.pathophysiology)
    );
    card.appendChild(pathoSection);

    const diagSection = el('div', { className: 'profile-subsection' });
    diagSection.appendChild(
      el('h4', {}, isEs ? 'Evaluación Materno-Fetal y Diagnóstica' : 'Maternal-Fetal & Diagnostic Workup')
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
          ? 'Protocolo de Manejo Obstétrico, Analgésico y Neonatal'
          : 'Obstetric, Analgesic & Neonatal Management Protocol'
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
          ? 'Reducción de Daños Perinatal y Protección Familiar'
          : 'Perinatal Harm Reduction & Family Preservation'
      ),
      el('p', {}, evalResult.harmReduction)
    );
    card.appendChild(hrSection);

    detailContainer.appendChild(card);
    sbarPre.textContent = formatObstetricSbarText(getObstetricState());
  }

  selectorSection.appendChild(syndromeGrid);
  root.appendChild(selectorSection);
  root.appendChild(flagsSection);
  root.appendChild(detailContainer);

  const rulesSection = el('section', {
    className: 'obstetric-rules-section card',
    attrs: { 'aria-labelledby': 'obstetric-rules-heading' }
  });
  rulesSection.appendChild(
    el(
      'h2',
      { id: 'obstetric-rules-heading', className: 'card-title' },
      t(
        'obstetric.rulesTitle',
        isEs
          ? '3. Reglas Cardinales en Urgencias Obstétricas, TMO Periparto y Modelo ESC'
          : '3. Cardinal Rules of Obstetric Emergencies, Peripartum MOUD & ESC Care'
      )
    )
  );
  const rulesGrid = el('div', { className: 'obstetric-rules-grid' });
  for (const rule of OBSTETRIC_HARM_REDUCTION_RULES) {
    const rCard = el('article', { className: 'obstetric-rule-card' });
    rCard.append(
      el('h3', { className: 'rule-title' }, isEs ? rule.titleEs : rule.titleEn),
      el('p', { className: 'rule-body' }, isEs ? rule.bodyEs : rule.bodyEn)
    );
    rulesGrid.appendChild(rCard);
  }
  rulesSection.appendChild(rulesGrid);
  root.appendChild(rulesSection);

  const sbarSection = el('section', {
    className: 'obstetric-sbar-section card',
    attrs: { 'aria-labelledby': 'obstetric-sbar-heading' }
  });
  sbarSection.appendChild(
    el(
      'h2',
      { id: 'obstetric-sbar-heading', className: 'card-title' },
      t(
        'obstetric.sbarTitle',
        isEs
          ? '4. Generador de Entrega Clínica SBAR (Cero-PII en RAM)'
          : '4. Zero-PII SBAR Clinical Handoff Generator (In-RAM)'
      )
    )
  );

  const notesLabel = el(
    'label',
    { className: 'field-label', attrs: { for: 'obstetric-clinical-notes' } },
    isEs
      ? 'Notas clínicas contextuales (solo en RAM, sin datos identificables):'
      : 'Contextual clinical notes (in-RAM only, zero identifiable data):'
  );
  const notesInput = el('textarea', {
    id: 'obstetric-clinical-notes',
    className: 'form-textarea obstetric-notes-input',
    attrs: {
      rows: '2',
      placeholder: isEs
        ? 'Ej. 34 SDG, Metadona 60 mg VO c/12h (120 mg/día), PA 168/112, fibrinógeno 240 mg/dL...'
        : 'e.g., 34 wks EGA, Methadone 60 mg PO BID (120 mg/day), BP 168/112, fibrinogen 240 mg/dL...'
    }
  });
  notesInput.value = obstetricState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setObstetricState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatObstetricSbarText(getObstetricState());
  });

  const copyStatus = el('span', {
    className: 'copy-status-msg',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });

  const copyBtn = makeButton(
    isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard',
    async () => {
      const txt = formatObstetricSbarText(getObstetricState());
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
      resetObstetricState();
      notesInput.value = '';
      copyStatus.textContent = '';
      for (const [k, cb] of checkboxRefs.entries()) {
        cb.checked = Boolean(obstetricState[k]);
      }
      renderSyndromeButtons();
      renderDetailAndSbar();
    },
    { className: 'button secondary reset-obstetric-btn' }
  );

  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);

  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  const linksSection = el('nav', {
    className: 'obstetric-links-section card',
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
      isEs ? 'Apoyo Perinatal y Derechos Familiares (#/perinatal)' : 'Perinatal Support & Family Rights (#/perinatal)',
      '#/perinatal',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'UCI, Intubación y Anestesia Perioperatoria (#/icu-perioperative)' : 'ICU, Intubation & Perioperative Anesthesia (#/icu-perioperative)',
      '#/icu-perioperative',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Acceso a Metadona y Reglas Parte 8 (#/methadone-access)' : 'Methadone Access & Part 8 Rules (#/methadone-access)',
      '#/methadone-access',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Hematología y Coagulopatía CID (#/hematology-care)' : 'Hematology & DIC Coagulopathy (#/hematology-care)',
      '#/hematology-care',
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
