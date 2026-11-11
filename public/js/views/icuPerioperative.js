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

export const ICU_SYNDROME_PROFILES = Object.freeze({
  rsi_induction_neuromuscular_blockade: Object.freeze({
    id: 'rsi_induction_neuromuscular_blockade',
    urgency: 'EMERGENCY',
    badgeEn: 'NO SUCCINYLCHOLINE IN DOWN-TIME RHABDO + ACIDOSIS MINUTE VENTILATION',
    badgeEs: 'PROHIBIDO SUCCINILCOLINA EN RABDOMIÓLISIS + VENTILACIÓN MINUTO EN ACIDOSIS',
    titleEn: 'Rapid Sequence Intubation (RSI), Rhabdomyolysis Succinylcholine Prohibition & Acidosis Ventilation',
    titleEs: 'Intubación de Secuencia Rápida (ISR), Prohibición de Succinilcolina en Rabdomiólisis y Ventilación en Acidosis',
    summaryEn:
      'Preventing peri-intubation cardiac arrest in critical toxicology and addiction emergencies: avoiding fatal Succinylcholine hyperkalemia after overdose immobilization and preserving respiratory compensation during severe metabolic acidosis.',
    summaryEs:
      'Prevención del paro cardíaco peri-intubación en emergencias toxicológicas: evitar la hiperpotasemia letal por Succinilcolina tras inmovilización por sobredosis y preservar la compensación respiratoria en acidosis metabólica severa.',
    pathophysiologyEn:
      'Two mechanisms cause sudden peri-intubation cardiac arrest in toxicology/SUD patients: (1) Prolonged overdose "down time" immobilization causes skeletal muscle rhabdomyolysis and sarcolemmal disruption; administering depolarizing Succinylcholine opens damaged muscle membranes and upregulated extrajunctional nicotinic acetylcholine receptors, surging serum K+ by several mEq/L (rises of 5–10 mEq/L are reported) within minutes and triggering hyperkalemic sine-wave arrest! (2) In severe metabolic acidosis (salicylates, methanol, AKA/DKA, stimulant lactic acidosis), the patient survives via Kussmaul hyperventilation (PaCO2 12–18 mmHg); 60 seconds of RSI apnea or setting a standard ventilator rate (12–14/min) causes acute CO2 rise, dropping blood pH < 6.90 and causing cardiovascular collapse!',
    pathophysiologyEs:
      'Dos mecanismos causan paro cardíaco súbito peri-intubación: (1) La inmovilización prolongada por sobredosis provoca rabdomiólisis; administrar Succinilcolina despolarizante libera de golpe varios mEq/L de potasio (se han descrito aumentos de 5–10 mEq/L) desde el músculo dañado en minutos, causando paro hiperpotasémico en onda sinusoidal. (2) En acidosis metabólica grave (salicilatos, metanol, cetoacidosis, acidosis láctica por estimulantes), el paciente sobrevive gracias a la hiperventilación de Kussmaul (PaCO2 12–18 mmHg); la apnea de la ISR o programar una frecuencia ventilatoria "normal" (12–14 rpm) eleva la PaCO2 y desploma el pH < 6.90.',
    diagnosticsEn: [
      'Pre-RSI Risk Check: Assess duration of overdose immobilization / compartment swelling, Point-of-Care Potassium & Blood Gas (pH, PaCO2, HCO3, Lactate), and pre-intubation Respiratory Rate / Minute Ventilation (VE = RR x VT).',
      'Continuous 12-Lead/Telemetry ECG (peaked T waves or QRS widening) and Waveform Capnography (ETCO2).'
    ],
    diagnosticsEs: [
      'Evaluación Pre-ISR: Verificar tiempo de inmovilización por sobredosis / edema compartimental, Potasio y Gasometría en punto de atención (pH, PaCO2, HCO3, Lactato) y Frecuencia Respiratoria / Ventilación Minuto previa.',
      'ECG continuo (ondas T picudas o QRS ancho) y Capnografía continua (ETCO2).'
    ],
    managementEn: [
      'CARDINAL NEUROMUSCULAR BLOCKADE RULE (Never Use Succinylcholine in Overdose Down-Time / Rhabdomyolysis): Strictly avoid Succinylcholine in any patient with unknown/prolonged overdose immobilization, suspected rhabdomyolysis, crush injury, hyperkalemia (K+ > 5.0 mEq/L), or subacute burns/denervation (> 24–48h). Always use high-dose Rocuronium (1.2 mg/kg IV) for RSI!',
      'THE METABOLIC ACIDOSIS VENTILATION RULE: In severe metabolic acidosis (salicylate toxicity, methanol/ethylene glycol, AKA/DKA, severe lactic acidosis), avoid intubation if possible; if intubation is mandatory, (1) Administer 1–2 mEq/kg IV 8.4% Sodium Bicarbonate pre-RSI (mandatory in salicylate toxicity or QRS widening), (2) Perform bag-valve-mask ventilation gently during paralysis onset if safe to prevent apnea acidosis, and (3) Set the initial ventilator Respiratory Rate high (24–32 breaths/min) to match the patient’s pre-intubation Kussmaul minute ventilation and target PaCO2!',
      'Hemodynamic-Safe Induction Agents: Prefer Ketamine (1–2 mg/kg IV) or Etomidate (0.3 mg/kg IV) over bolus Propofol in hypotensive or volume-depleted patients, with push-dose Norepinephrine or Epinephrine primed at bedside.'
    ],
    managementEs: [
      'REGLA CARDINAL DE BLOQUEO NEUROMUSCULAR (Nunca Usar Succinilcolina en Rabdomiólisis / Sobredosis con Inmovilización): Prohibir estrictamente la Succinilcolina en todo paciente con tiempo de inmovilización prolongado/desconocido, sospecha de rabdomiólisis, hiperpotasemia (K+ > 5.0 mEq/L) o quemaduras/denervación (> 24–48 h). ¡Usar siempre Rocuronio (1.2 mg/kg IV) para la ISR!',
      'REGLA DE VENTILACIÓN EN ACIDOSIS METABÓLICA: En acidosis metabólica severa (salicilatos, metanol, cetoacidosis, lactato alto), (1) Administrar 1–2 mEq/kg de Bicarbonato de Sodio al 8.4% IV antes de la ISR, (2) Evitar apnea prolongada y (3) Programar el ventilador con Frecuencia Respiratoria alta (24–32 rpm) para igualar la ventilación minuto de Kussmaul previa.',
      'Inducción Hemodinámicamente Estable: Preferir Ketamina (1–2 mg/kg IV) o Etomidato (0.3 mg/kg IV) sobre bolos de Propofol en hipotensión, con Norepinefrina lista en cabecera.'
    ],
    harmReductionEn:
      'When patients wake after emergency overdose intubation, explain gently why the breathing tube was placed and immediately ensure adequate analgesia and withdrawal prevention so fear and pain do not trigger unplanned self-extubation.',
    harmReductionEs:
      'Cuando el paciente despierte tras una intubación de urgencia, explicar con calma por qué se colocó el tubo y asegurar analgesia y control de abstinencia inmediatos para prevenir autoextubación.'
  }),

  icu_analgosedation_fentanyl_xylazine: Object.freeze({
    id: 'icu_analgosedation_fentanyl_xylazine',
    urgency: 'URGENT',
    badgeEn: 'DEXMEDETOMIDINE/CLONIDINE ALPHA-2 RESCUE + ENTERAL MOUD + KETAMINE',
    badgeEs: 'RESCATE ALFA-2 CON DEXMEDETOMIDINA/CLONIDINA + TMO ENTERAL + KETAMINA',
    titleEn: 'High-Tolerance Fentanyl & Xylazine ("Tranq") ICU Analgosedation & Ventilator Dyssynchrony',
    titleEs: 'Analgosedación en UCI para Alta Tolerancia a Fentanilo y Xilacina ("Tranq") y Asincronía Ventilatoria',
    summaryEn:
      'Multi-receptor ICU sedation and analgesia protocol for mechanically ventilated patients with high-potency illicit fentanyl/nitazene tolerance and concurrent xylazine or medetomidine alpha-2 adrenergic withdrawal.',
    summaryEs:
      'Protocolo multirreceptor de sedación y analgesia en UCI para pacientes ventilados con alta tolerancia a fentanilo/nitacenos e intoxicación/abstinencia concomitante de alfa-2 agonistas (xilacina o medetomidina).',
    pathophysiologyEn:
      'Patients using illicit fentanyl adulterated with Xylazine or Medetomidine have both profound mu-opioid receptor desensitization AND central alpha-2 adrenergic dependence. Standard ICU fentanyl drips (50–100 mcg/hr) are sub-baseline for their opioid tolerance, while neither opioids nor benzodiazepines bind alpha-2 receptors—resulting in unmitigated locus coeruleus norepinephrine storm, extreme hypertension (BP > 200/120), tachycardia, diaphoresis, and violent ventilator double-triggering/bucking.',
    pathophysiologyEs:
      'Los pacientes expuestos a fentanilo adulterado con Xilacina o Medetomidina presentan desensibilización extrema de receptores mu-opioides Y dependencia adrenérgica alfa-2 central. Las infusiones estándar de fentanilo en UCI son insuficientes para su tolerancia opioide, y ni los opioides ni las benzodiazepinas cubren los receptores alfa-2, desencadenando tormenta noradrenérgica, crisis hipertensiva y asincronía ventilatoria severa.',
    diagnosticsEn: [
      'Bedside Recognition of Unmasked Xylazine / Medetomidine ICU Withdrawal: Severe agitation (RASS +2 to +4), hypertension, tachycardia, and diaphoresis emerging 6–24 hours after admission that fail to respond to escalating IV fentanyl or propofol.',
      'Daily RASS & Critical-Care Pain Observation Tool (CPOT) scoring + ECG QTc and Serum Triglycerides / CK monitoring.'
    ],
    diagnosticsEs: [
      'Reconocimiento de Abstinencia de Xilacina / Medetomidina en UCI: Agitación severa (RASS +2 a +4), hipertensión, taquicardia y diaforesis a las 6–24 h del ingreso que no responden al aumento de fentanilo o propofol.',
      'Evaluación diaria con escalas RASS y CPOT + monitoreo de QTc, Triglicéridos y CK.'
    ],
    managementEn: [
      'TARGETED ALPHA-2 ADRENERGIC REPLACEMENT (First-Line for Xylazine/Medetomidine ICU Withdrawal): Immediately initiate an IV Dexmedetomidine infusion (0.2–1.5 mcg/kg/hr) AND start scheduled enteral Clonidine (0.1–0.3 mg via NGT/OGT q6–8h, holding only for bradycardia < 50 bpm or hypotension) or Guanfacine / Tizanidine so oral alpha-2 coverage is established before Dexmedetomidine is weaned.',
      'EARLY BASAL ENTERAL MOUD ON THE VENTILATOR: Rather than escalating IV fentanyl infusions to massive doses (> 300–500 mcg/hr, which cause chest wall rigidity and prolonged context-sensitive half-time), establish basal opioid receptor coverage early via NGT Methadone (e.g., 20–40 mg/day divided q8–12h) OR sublingual/buccal Buprenorphine micro-induction.',
      'NMDA-ANTAGONIST OPIOID RESENSITIZATION: Add a low-dose sub-anesthetic IV Ketamine infusion (0.1–0.3 mg/kg/hr) to reverse NMDA-mediated opioid hyperalgesia/tolerance and restore ventilator synchrony without respiratory drive suppression.'
    ],
    managementEs: [
      'REEMPLAZO ADRENERGICO ALFA-2 DIRIGIDO (Primera Línea en Abstinencia por Xilacina/Medetomidina): Iniciar de inmediato infusión de Dexmedetomidina IV (0.2–1.5 mcg/kg/h) Y Clonidina enteral pautada por SNG (0.1–0.3 mg c/6–8 h) o Guanfacina/Tizanidina para establecer cobertura basal.',
      'INICIO TEMPRANO DE TMO ENTERAL EN EL VENTILADOR: En lugar de escalar la infusión de fentanilo IV a dosis masivas (> 300–500 mcg/h), establecer cobertura basal temprana con Metadona por SNG (dividida c/8–12 h) o microinducción sublingual de Buprenorfina.',
      'RESENSIBILIZACIÓN OPIOIDE CON ANTAGONISTA NMDA: Añadir infusión de Ketamina IV en dosis bajas (0.1–0.3 mg/kg/h) para revertir la tolerancia/hiperalgesia mediada por NMDA y mejorar la sincronía ventilatoria.'
    ],
    harmReductionEn:
      'Never apply 4-point physical restraints as a substitute for adequate receptor-specific analgosedation; untreated opioid and alpha-2 withdrawal while restrained and intubated causes severe medical PTSD.',
    harmReductionEs:
      'Nunca utilizar sujeciones físicas de 4 puntos como sustituto de una analgosedación específica por receptores; sufrir abstinencia estando intubado y sujetado causa estrés postraumático médico severo.'
  }),

  propofol_infusion_syndrome_propylene_glycol: Object.freeze({
    id: 'propofol_infusion_syndrome_propylene_glycol',
    urgency: 'EMERGENCY',
    badgeEn: 'PRIS (> 4 MG/KG/HR) & IV LORAZEPAM PROPYLENE GLYCOL TOXICITY',
    badgeEs: 'SÍNDROME POR INFUSIÓN DE PROPOFOL Y TOXICIDAD POR PROPILENGLICOL',
    titleEn: 'Propofol Infusion Syndrome (PRIS) & IV Lorazepam Propylene Glycol Toxicity in the ICU',
    titleEs: 'Síndrome por Infusión de Propofol (SIP) y Toxicidad por Propilenglicol de Lorazepam IV en UCI',
    summaryEn:
      'Early detection and rescue from two life-threatening iatrogenic ICU sedative toxidromes: mitochondrial Propofol Infusion Syndrome (PRIS) and hyperosmolar lactic acidosis from IV Lorazepam/Diazepam propylene glycol solvent.',
    summaryEs:
      'Detección temprana y rescate de dos toxídromes iatrogénicos graves por sedantes en UCI: el Síndrome por Infusión de Propofol (SIP) y la acidosis láctica hiperosmolar por el vehículo de propilenglicol del Lorazepam/Diazepam IV.',
    pathophysiologyEn:
      '(1) Propofol Infusion Syndrome (PRIS): High-dose Propofol (> 4–5 mg/kg/hr [> 67–83 mcg/kg/min] or duration > 48 hours, especially with catecholamine vasopressors or corticosteroids) uncouples oxidative phosphorylation and inhibits mitochondrial free fatty acid transport (CPT-I), causing fulminant rhabdomyolysis, hyperkalemia, high anion-gap lactic acidosis, hypertriglyceridemia, Brugada-like coved ST elevations in V1–V3, and refractory bradycardic/asystolic arrest. (2) Propylene Glycol Toxicity: Injectable IV Lorazepam contains 80% v/v Propylene Glycol (and IV Diazepam / Phenytoin / Pentobarbital contain 40%); infusions > 6–10 mg/hr of IV Lorazepam saturate hepatic alcohol dehydrogenase, accumulating propylene glycol and D/L-lactic acid.',
    pathophysiologyEs:
      '(1) Síndrome por Infusión de Propofol (SIP): El Propofol en dosis altas (> 4–5 mg/kg/h [> 67–83 mcg/kg/min] o > 48 h, especialmente junto a vasopresores o esteroides) inhibe la beta-oxidación mitocondrial (CPT-I), causando rabdomiólisis fulminante, hiperpotasemia, acidosis láctica, hipertrigliceridemia, patrón de Brugada en V1–V3 y paro bradicárdico. (2) Toxicidad por Propilenglicol: El Lorazepam IV contiene 80% v/v de Propilenglicol; infusiones > 6–10 mg/h saturan la alcohol deshidrogenasa, causando acidosis láctica hiperosmolar y necrosis tubular aguda.',
    diagnosticsEn: [
      'PRIS Surveillance Protocol (Check Daily on Propofol > 24–48h): Serum Triglycerides (warning > 400–500 mg/dL, lipemic "strawberry milk" blood), Creatine Kinase (CK > 5,000–10,000 U/L), Arterial Lactate, Potassium, pH, and 12-Lead ECG (new RBBB or coved ST-elevation in V1–V3).',
      'Propylene Glycol Surveillance (on High-Dose IV Lorazepam/Diazepam): Measure Measured Serum Osmolality vs Calculated Osmolarity -> an Osmolar Gap > 10–12 mOsm/kg paired with rising Lactate and Creatinine confirms Propylene Glycol accumulation!'
    ],
    diagnosticsEs: [
      'Protocolo de Vigilancia de SIP (Diario en Propofol > 24–48 h): Triglicéridos séricos (alerta > 400–500 mg/dL, suero lipémico), Creatina Cinasa (CK > 5,000–10,000 U/L), Lactato arterial, Potasio, pH y ECG de 12 derivaciones (patrón de Brugada en V1–V3).',
      'Vigilancia de Propilenglicol (en Lorazepam/Diazepam IV en altas dosis): Medir Brecha Osmolar (Osmolar Gap > 10–12 mOsm/kg) junto con elevación de Lactato y Creatinina.'
    ],
    managementEn: [
      'IMMEDIATE PRIS RESCUE PROTOCOL: Discontinue Propofol IMMEDIATELY at the first sign of unexplained lactic acidosis, rising CK, Triglycerides > 500 mg/dL, or Brugada ECG changes! Switch sedation to Dexmedetomidine, Ketamine, Midazolam, or Phenobarbital; administer IV Dextrose/carbohydrate support (4–6 mg/kg/min glucose to suppress endogenous lipolysis), treat hyperkalemia with Calcium + Sodium Bicarbonate, and initiate early Continuous Renal Replacement Therapy (CRRT) / ECMO for refractory shock.',
      'PROPYLENE GLYCOL TOXICITY RESCUE: Immediately stop the IV Lorazepam (or IV Diazepam) infusion! Transition GABA-A coverage to IV Phenobarbital (long-acting, no continuous infusion needed) or IV Midazolam (water-soluble at acidic pH, contains ZERO propylene glycol!); severe cases with AKI and acidemia respond rapidly to Intermittent Hemodialysis.'
    ],
    managementEs: [
      'PROTOCOLO DE RESCATE INMEDIATO EN SIP: ¡Suspender el Propofol DE INMEDIATO ante acidosis láctica inexplicable, aumento de CK, Triglicéridos > 500 mg/dL o cambios de Brugada en el ECG! Cambiar sedación a Dexmedetomidina, Ketamina, Midazolam o Fenobarbital; aportar glucosa IV (4–6 mg/kg/min para frenar la lipólisis), tratar hiperpotasemia y considerar TRRC / ECMO temprano.',
      'RESCATE EN TOXICIDAD POR PROPILENGLICOL: ¡Suspender de inmediato la infusión de Lorazepam IV! Cambiar cobertura GABA-A a Fenobarbital IV o Midazolam IV (hidrosoluble, contiene CERO propilenglicol); los casos graves responden a Hemodiálisis.'
    ],
    harmReductionEn:
      'In severe Alcohol Withdrawal Delirium or GHB withdrawal requiring high-dose sedatives, front-load with IV Phenobarbital (10–15 mg/kg IBW) rather than running prolonged high-dose Propofol or continuous IV Lorazepam drips.',
    harmReductionEs:
      'En Delirium Tremens grave o abstinencia de GHB, utilizar carga frontal de Fenobarbital IV (10–15 mg/kg) en lugar de infusiones prolongadas de Propofol en dosis altas o Lorazepam IV continuo.'
  }),

  perioperative_buprenorphine_methadone_xr_naltrexone: Object.freeze({
    id: 'perioperative_buprenorphine_methadone_xr_naltrexone',
    urgency: 'URGENT',
    badgeEn: 'ASRA/ASA CONTINUE BUPRENORPHINE + REGIONAL BLOCKS + VIVITROL PLAN',
    badgeEs: 'ASRA/ASA MANTENER BUPRENORFINA + BLOQUEOS REGIONALES + PLAN VIVITROL',
    titleEn: 'Perioperative Anesthesia on Buprenorphine, Sublocade/Brixadi, Methadone & XR-Naltrexone (Vivitrol)',
    titleEs: 'Anestesia Perioperatoria en Buprenorfina, Sublocade/Brixadi, Metadona y Naltrexona XR (Vivitrol)',
    summaryEn:
      'Multi-society (ASRA, ASA, ASAM) perioperative anesthesia and acute pain management for elective and emergent surgery in patients receiving sublingual/depot Buprenorphine, Methadone, or Extended-Release Naltrexone.',
    summaryEs:
      'Manejo anestésico y de dolor agudo perioperatorio según consenso ASRA, ASA y ASAM para cirugía electiva y de urgencia en pacientes con Buprenorfina sublingual/depósito, Metadona o Naltrexona de liberación prolongada.',
    pathophysiologyEn:
      'Historical recommendations to stop Buprenorphine 3–5 days before surgery have been overturned by ASRA/ASA/ASAM clinical consensus: stopping Buprenorphine destabilizes patients, causes preoperative opioid withdrawal, and creates a high-risk post-discharge relapse gap—whereas receptor imaging confirms that even at 16–24 mg/day of Buprenorphine (or depot Sublocade/Brixadi), 15–30% of mu-opioid receptors remain available for high-affinity full agonists (fentanyl, hydromorphone). Conversely, Intramuscular Extended-Release Naltrexone (Vivitrol 380 mg IM) produces insurmountable competitive mu-opioid blockade for 28–30 days!',
    pathophysiologyEs:
      'Las recomendaciones antiguas de suspender la Buprenorfina antes de operar han sido reemplazadas por el consenso ASRA/ASA/ASAM: suspenderla provoca abstinencia preoperatoria y alto riesgo de recaída, mientras que a dosis de 16–24 mg/día (o Sublocade/Brixadi) queda un 15–30% de receptores mu libres para agonistas de alta afinidad (fentanilo, hidromorfona). En cambio, la Naltrexona IM de liberación prolongada (Vivitrol 380 mg) bloquea los receptores mu durante 28–30 días.',
    diagnosticsEn: [
      'Preoperative MOUD Timeline Verification: Document exact formulation, dose, and date of last depot injection (Sublocade, Brixadi, or Vivitrol XR-Naltrexone) or last oral Naltrexone dose.',
      'Stratify Surgical Pain Intensity (Minor/Moderate vs Major Thoracic/Abdominal/Orthopedic) to plan continuous regional/neuraxial catheter placement prior to incision.'
    ],
    diagnosticsEs: [
      'Verificación Preoperatoria del TMO: Documentar formulación exacta, dosis y fecha de la última inyección de depósito (Sublocade, Brixadi o Vivitrol) o última dosis de Naltrexona oral.',
      'Estratificar la intensidad del dolor quirúrgico para planificar catéteres regionales o neuroaxiales continuos antes de la incisión.'
    ],
    managementEn: [
      'PERIOPERATIVE BUPRENORPHINE & METHADONE PROTOCOL (ASRA / ASA Consensus): DO NOT discontinue Buprenorphine or Methadone before surgery! Continue home Methadone (or convert to IV at 50% of oral dose if NPO) and continue Buprenorphine (splitting into q6–8h dosing; if taking > 16 mg/day before major high-pain surgery, optionally adjust to 16 mg/day on the day of surgery without stopping, then return to home dose). Layer high-affinity full mu-agonists (IV/PO Hydromorphone or Fentanyl) + Sub-Anesthetic IV Ketamine (0.15–0.3 mg/kg/hr) + Regional Nerve/Epidural Blocks + scheduled NSAIDs/Acetaminophen.',
      'PERIOPERATIVE XR-NALTREXONE (VIVITROL) & ORAL NALTREXONE PROTOCOL: (1) For Elective Surgery: hold Oral Naltrexone for 72 hours prior to surgery; schedule surgery 4 weeks (28–30 days) after the last IM Vivitrol injection; (2) For Emergent Trauma / Surgery within < 4 Weeks of Vivitrol: opioids will be blocked or require massive doses that risk sudden respiratory arrest as blockade wanes—anchor analgesia on Continuous Epidural/Peripheral Nerve Block Catheters, IV Ketamine infusion, IV Lidocaine infusion (1–1.5 mg/kg/hr), IV Dexmedetomidine, Ketorolac, and Acetaminophen in a monitored PACU/ICU.',
      'Post-Op Naltrexone Re-Initiation Warning: After opioid analgesics are used perioperatively, the patient MUST be completely opioid-free for 7–10 days (and pass a negative urine opioid screen / Naloxone challenge) before restarting Oral Naltrexone or Vivitrol to avoid severe Precipitated Withdrawal!'
    ],
    managementEs: [
      'PROTOCOLO PERIOPERATORIO EN BUPRENORFINA Y METADONA (Consenso ASRA / ASA): ¡NO suspender la Buprenorfina ni la Metadona antes de la cirugía! Mantener la Metadona habitual (o pasar a vía IV al 50% si está en ayuno) y mantener la Buprenorfina (fraccionada c/6–8 h). Sumar agonistas mu de alta afinidad (Hidromorfona o Fentanilo) + Ketamina IV (0.15–0.3 mg/kg/h) + Bloqueos Regionales/Epidurales + AINEs/Paracetamol.',
      'PROTOCOLO PERIOPERATORIO EN NALTREXONA XR (VIVITROL) Y ORAL: (1) Cirugía Electiva: suspender Naltrexona oral 72 h antes; programar cirugía a las 4 semanas (28–30 días) de la última inyección de Vivitrol; (2) Cirugía de Emergencia en < 4 Semanas de Vivitrol: basar la analgesia en Catéteres Epidurales/Regionales Continuos, infusión de Ketamina IV, Lidocaína IV, Dexmedetomidina, Ketorolaco y Paracetamol en unidad monitorizada.',
      'Advertencia al Reiniciar Naltrexona Posoperatoria: Tras recibir opioides perioperatorios, el paciente debe estar libre de opioides durante 7–10 días antes de reiniciar Naltrexona o Vivitrol para evitar abstinencia precipitada grave.'
    ],
    harmReductionEn:
      'Never discharge a surgical patient on new full-agonist opioids after stopping their baseline Buprenorphine—always keep Buprenorphine on board throughout the hospitalization and taper only the short-acting postoperative full agonist.',
    harmReductionEs:
      'Nunca dar de alta a un paciente quirúrgico con opioides puros habiendo suspendido su Buprenorfina basal: mantener siempre la Buprenorfina durante toda la hospitalización y retirar gradualmente solo el opioide posoperatorio adicional.'
  }),

  extubation_bridge_phenobarbital_dexmedetomidine: Object.freeze({
    id: 'extubation_bridge_phenobarbital_dexmedetomidine',
    urgency: 'URGENT',
    badgeEn: 'DEXMEDETOMIDINE / PHENOBARBITAL EXTUBATION BRIDGE + ENTERAL MOUD',
    badgeEs: 'PUENTE DE EXTUBACIÓN CON DEXMEDETOMIDINA / FENOBARBITAL + TMO ENTERAL',
    titleEn: 'Mechanical Ventilation Weaning, Extubation Bridges & Prevention of Unplanned Self-Extubation',
    titleEs: 'Destete de Ventilación Mecánica, Puentes de Extubación y Prevención de Autoextubación',
    summaryEn:
      'Structured ICU sedation weaning and extubation bridge protocols using Dexmedetomidine, long-acting Phenobarbital, and enteral Methadone/Buprenorphine to prevent withdrawal-induced extubation failure.',
    summaryEs:
      'Protocolos estructurados de destete de sedación y puente hacia la extubación con Dexmedetomidina, Fenobarbital de acción prolongada y Metadona/Buprenorfina enteral para evitar el fracaso de la extubación por abstinencia.',
    pathophysiologyEn:
      'Abruptly pausing high-dose ICU fentanyl and propofol/midazolam infusions for a morning Spontaneous Awakening and Breathing Trial (SAT/SBT) triggers acute iatrogenic opioid, GABA, and alpha-2 withdrawal within 30–90 minutes. The resulting sympathetic surge (tachycardia, hypertension, severe anxiety, air hunger, thrashing) is frequently misdiagnosed as "failed respiratory mechanics" or "ICU delirium," leading to re-sedation, prolonged ventilation, ventilator-associated pneumonia, or traumatic self-extubation with an inflated cuff.',
    pathophysiologyEs:
      'Suspender bruscamente las infusiones de fentanilo y propofol/midazolam para una prueba de ventilación espontánea desencadena abstinencia aguda de opioides, GABA y alfa-2 en 30–90 minutos. La tormenta simpática resultante (taquicardia, hipertensión, angustia, agitación) suele confundirse con "fracaso ventilatorio" o "delirio", llevando a resedación o autoextubación traumática con el globo inflado.',
    diagnosticsEn: [
      'Differentiate Withdrawal Agitation from Hypoxemic/Mechanical Respiratory Failure during SBT: Rapid shallow breathing index (RSBI < 105), normal lung compliance, and gas exchange coupled with dilated pupils, diaphoresis, piloerection, and RASS +2/+3 point to acute sedative/opioid withdrawal.',
      'Cuff-Leak Test prior to extubation if traumatic intubation, prolonged ventilation (> 7 days), or prior self-extubation occurred.'
    ],
    diagnosticsEs: [
      'Diferenciar Agitación por Abstinencia de Insuficiencia Respiratoria Mecánica durante la PVE: Mecánica pulmonar e intercambio gaseoso conservados junto con midriasis, diaforesis, piloerección y RASS +2/+3 indican abstinencia aguda.',
      'Prueba de Fuga del Manguito (Cuff-Leak Test) antes de extubar si hubo intubación traumática o ventilación prolongada.'
    ],
    managementEn: [
      'STEP 1 — ESTABLISH BASAL ENTERAL RECEPTOR COVERAGE BEFORE WEANING DRIPS: Start enteral Methadone (or Buprenorphine micro-induction) + enteral Clonidine 24–48 hours BEFORE attempting to turn off the IV fentanyl drip, then reduce the IV fentanyl infusion by 25–50% every 12–24 hours.',
      'STEP 2 — EXTUBATE ON AN IV DEXMEDETOMIDINE BRIDGE: Unlike Propofol or Midazolam, IV Dexmedetomidine (0.2–1.0 mcg/kg/hr) produces "cooperative sedation" and central sympatholysis with ZERO respiratory depression! Continue the Dexmedetomidine infusion right through the Spontaneous Breathing Trial and extubation, then wean over 24–48 hours post-extubation.',
      'STEP 3 — THE PHENOBARBITAL SELF-TAPERING BRIDGE (For Alcohol / GHB / Sedative Withdrawal): Administer IV Phenobarbital (total load 10–15 mg/kg IBW in divided doses)—its 80-to-120-hour elimination half-life provides a smooth, automatic 5–7 day self-tapering GABA-A cushion across extubation without requiring a continuous sedative drip!'
    ],
    managementEs: [
      'PASO 1 — ESTABLECER COBERTURA BASAL ENTERAL ANTES DE APAGAR INFUSIONES: Iniciar Metadona enteral (o microinducción de Buprenorfina) + Clonidina enteral 24–48 h ANTES de suspender la infusión de fentanilo IV.',
      'PASO 2 — EXTUBAR BAJO PUENTE DE DEXMEDETOMIDINA IV: A diferencia del Propofol o Midazolam, la Dexmedetomidina IV (0.2–1.0 mcg/kg/h) brinda "sedación cooperativa" sin depresión respiratoria. Mantener la infusión durante la prueba de ventilación espontánea y la extubación.',
      'PASO 3 — PUENTE AUTODESCENDENTE CON FENOBARBITAL (En Abstinencia de Alcohol / GHB / Sedantes): La vida media de 80–120 h del Fenobarbital IV (carga total 10–15 mg/kg) proporciona un descenso automático suave durante 5–7 días tras la extubación.'
    ],
    harmReductionEn:
      'Involve family members or peer recovery specialists at the bedside during weaning and immediately post-extubation—familiar voices and reorientation dramatically reduce post-extubation agitation.',
    harmReductionEs:
      'Involucrar a familiares o especialistas pares a pie de cama durante el destete y tras la extubación: la reorientación compasiva reduce drásticamente la agitación post-extubación.'
  }),

  hyperthermic_icu_crises_mhs_nms_serotonin: Object.freeze({
    id: 'hyperthermic_icu_crises_mhs_nms_serotonin',
    urgency: 'EMERGENCY',
    badgeEn: 'RAPID HYPERTHERMIA DIFFERENTIAL: CLONUS (SS) VS LEAD-PIPE (NMS) VS SYMPATHOMIMETIC',
    badgeEs: 'DIFERENCIAL RÁPIDO DE HIPERTERMIA: CLONUS (SS) VS TUBO DE PLOMO (SNM) VS SIMPATICOMIMÉTICO',
    titleEn: 'ICU Hyperthermic Emergencies: Sympathomimetic Crisis vs. Serotonin Syndrome vs. NMS vs. Malignant Hyperthermia',
    titleEs: 'Emergencias Hipertérmicas en UCI: Crisis Simpaticomimética vs. Síndrome Serotoninérgico vs. SNM vs. Hipertermia Maligna',
    summaryEn:
      'Bedside neurological differential and targeted antidote/cooling protocols for critical hyperthermia (core T > 40°C / 104°F) in the ICU and operating room.',
    summaryEs:
      'Diagnóstico diferencial neurológico a pie de cama y protocolos de enfriamiento y antídotos específicos para hipertermia crítica (T central > 40°C / 104°F) en UCI y quirófano.',
    pathophysiologyEn:
      'Core temperature > 40–41°C (104–105.8°F) causes rapid cerebellar Purkinje cell death, hepatic necrosis, rhabdomyolysis, and DIC within 30–60 minutes. Because hypothalamic set-point is NOT elevated in toxic hyperthermia, Acetaminophen and Ibuprofen are 100% INEFFECTIVE! Survival depends on rapid physical cooling + neuromuscular paralysis (halting muscular heat generation) + syndrome-specific receptor antidotes.',
    pathophysiologyEs:
      'Una temperatura central > 40–41°C destruye las células de Purkinje cerebelosas y causa necrosis hepática, rabdomiólisis y CID en 30–60 minutos. Como el punto de ajuste hipotalámico NO está alterado en la hipertermia tóxica, ¡el Paracetamol y el Ibuprofeno son 100% INEFICACES! La supervivencia depende de enfriamiento físico rápido + parálisis neuromuscular + antídoto específico.',
    diagnosticsEn: [
      'THE NEUROMUSCULAR EXAM DIFFERENTIATOR: (1) SEROTONIN SYNDROME (MDMA, Methamphetamine, Fentanyl/Tramadol/Meperidine, DXM, Linezolid, MAOIs/SSRIs): Hyperreflexia and Inducible/Spontaneous Ankle & Ocular CLONUS (more pronounced in lower extremities), rapid onset (< 24h); (2) NEUROLEPTIC MALIGNANT SYNDROME (Haloperidol, Droperidol, Antipsychotics): Generalized "LEAD-PIPE" Muscular Rigidity, hyporeflexia, bradykinesia, slower onset (1–7 days); (3) SYMPATHOMIMETIC TOXICITY (Methamphetamine, Cocaine, Bath Salts): Psychomotor agitation, mydriasis, diaphoresis, normal reflexes without clonus or lead-pipe rigidity; (4) MALIGNANT HYPERTHERMIA (Volatile Anesthetics / Succinylcholine): Sudden surge in ETCO2 > 60 mmHg + masseter/generalized rigidity in OR/ICU.',
      'Continuous Core Temperature (esophageal, bladder, or rectal probe) + CK, K+, Lactate, Cr, and Coagulation panel.'
    ],
    diagnosticsEs: [
      'EL DIFERENCIADOR DEL EXAMEN NEUROMUSCULAR: (1) SÍNDROME SEROTONINÉRGICO (MDMA, Metanfetamina, Fentanilo/Tramadol, DXM, Linezolid, IMAO/ISRS): Hiperreflexia y CLONUS Ocular y Aquíleo inducible/espontáneo (predominio en miembros inferiores), inicio rápido (< 24 h); (2) SÍNDROME NEUROLÉPTICO MALIGNO (Haloperidol, Antipsicóticos): Rigidez en "TUBO DE PLOMO", hiporreflexia y bradicinesia, inicio gradual (1–7 días); (3) TOXICIDAD SIMPATICOMIMÉTICA: Agitación psicomotora, midriasis y diaforesis sin clonus ni rigidez en tubo de plomo; (4) HIPERTERMIA MALIGNA (Anestésicos Volátiles / Succinilcolina): Aumento brusco de ETCO2 > 60 mmHg + rigidez maseterina/generalizada.',
      'Temperatura central continua (sonda esofágica, vesical o rectal) + CK, K+, Lactato, Creatinina y Coagulación.'
    ],
    managementEn: [
      'UNIVERSAL FIRST STEP FOR CORE TEMP > 40°C (104°F): Immediate Rapid Active External/Internal Cooling (ice-water immersion, chilled IV crystalloids, or evaporative mist + high-flow fans targeting < 38.9°C within 30 minutes) + High-Dose IV Benzodiazepines (Lorazepam/Midazolam). If T > 40.5°C persists despite Benzos, immediately perform RSI with Rocuronium (NEVER Succinylcholine!) to abolish muscular heat generation!',
      'SYNDROME-SPECIFIC ANTIDOTES: (1) Serotonin Syndrome: Stop all serotonergic drugs (including Fentanyl—switch to Morphine or Hydromorphone, which lack 5-HT reuptake inhibition!) and administer Cyproheptadine (12 mg PO/NGT initial dose, then 2 mg q2h until clinical response); (2) Neuroleptic Malignant Syndrome: Stop all dopamine antagonists and give Dantrolene (1–2.5 mg/kg IV) + Bromocriptine (2.5–5 mg PO/NGT q8h); (3) Malignant Hyperthermia: Stop volatile anesthetic/succinylcholine, hyperventilate with 100% O2 at high flow, and give Dantrolene 2.5 mg/kg IV bolus immediately (Ryanodex/Dantrium).'
    ],
    managementEs: [
      'PASO UNIVERSAL INMEDIATO EN TEMPERATURA CENTRAL > 40°C: Enfriamiento activo rápido (inmersión en agua helada o niebla evaporativa buscando < 38.9°C en <= 30 min) + Benzodiazepinas IV en altas dosis. Si persiste T > 40.5°C, intubar y paralizar con Rocuronio (¡NUNCA Succinilcolina!) para frenar la producción muscular de calor.',
      'ANTÍDOTOS ESPECÍFICOS POR SÍNDROME: (1) Síndrome Serotoninérgico: Suspender fármacos serotoninérgicos (incluyendo Fentanilo: cambiar a Morfina o Hidromorfona, que no inhiben la recaptación de 5-HT) y dar Ciproheptadina (12 mg por SNG inicial, luego 2 mg c/2h); (2) Síndrome Neuroléptico Maligno: Suspender antipsicóticos y dar Dantroleno (1–2.5 mg/kg IV) + Bromocriptina (2.5–5 mg por SNG c/8h); (3) Hipertermia Maligna: Suspender anestésico volátil, hiperventilar con O2 al 100% y dar Dantroleno 2.5 mg/kg IV STAT.'
    ],
    harmReductionEn:
      'Note the critical opioid pharmacology pearl in Serotonin Syndrome: phenylpiperidine opioids (Fentanyl, Meperidine, Tramadol, Methadone, Tapentadol) inhibit serotonin reuptake or activate 5-HT receptors, whereas phenanthrene opioids (Morphine, Hydromorphone, Oxycodone, Oxymorphone) and Buprenorphine do NOT cause serotonin toxicity!',
    harmReductionEs:
      'Perla farmacológica crítica en Síndrome Serotoninérgico: las fenilpiperidinas (Fentanilo, Meperidina, Tramadol) tienen actividad serotoninérgica, mientras que la Morfina, Hidromorfona, Oxicodona y Buprenorfina NO causan toxicidad por serotonina.'
  })
});

export const ICU_HARM_REDUCTION_RULES = Object.freeze([
  Object.freeze({
    id: 'no_succinylcholine_down_time_rhabdo_rule',
    titleEn: 'The Overdose Down-Time Rhabdomyolysis Succinylcholine Prohibition Rule',
    titleEs: 'Regla de Prohibición de Succinilcolina en Rabdomiólisis por Inmovilización en Sobredosis',
    bodyEn:
      'Never use Succinylcholine for RSI in patients with prolonged overdose immobilization, rhabdomyolysis, crush syndrome, or hyperkalemia (K+ > 5.0 mEq/L)—it can cause a sudden multi-mEq/L potassium surge and fatal sine-wave cardiac arrest. Always use Rocuronium (1.2 mg/kg IV).',
    bodyEs:
      'Nunca usar Succinilcolina para intubar pacientes con inmovilización prolongada por sobredosis, rabdomiólisis o hiperpotasemia (K+ > 5.0 mEq/L): puede provocar un aumento súbito de varios mEq/L de potasio y paro cardíaco hiperpotasémico. Usar siempre Rocuronio (1.2 mg/kg IV).'
  }),
  Object.freeze({
    id: 'xylazine_fentanyl_icu_alpha2_rule',
    titleEn: 'The Xylazine / Medetomidine ICU Alpha-2 Replacement Rule',
    titleEs: 'Regla de Reemplazo Alfa-2 en UCI para Abstinencia de Xilacina / Medetomidina',
    bodyEn:
      'Escalating IV fentanyl or propofol alone will not control ventilator dyssynchrony and severe hypertension from Xylazine or Medetomidine ("tranq") withdrawal. Immediately start IV Dexmedetomidine + scheduled enteral Clonidine alongside basal enteral Methadone or Buprenorphine.',
    bodyEs:
      'Subir solo el fentanilo o el propofol IV no controla la asincronía ventilatoria ni la hipertensión por abstinencia de Xilacina o Medetomidina ("tranq"). Iniciar de inmediato Dexmedetomidina IV + Clonidina enteral pautada junto con Metadona o Buprenorfina basal.'
  }),
  Object.freeze({
    id: 'pris_and_propylene_glycol_surveillance_rule',
    titleEn: 'The Propofol Infusion Syndrome (PRIS) & Lorazepam Propylene Glycol Rule',
    titleEs: 'Regla de Vigilancia de Síndrome por Infusión de Propofol (SIP) y Propilenglicol',
    bodyEn:
      'Avoid Propofol > 4–5 mg/kg/hr for > 48h (monitor daily Triglycerides, CK, Lactate, and ECG for PRIS), and avoid high-dose continuous IV Lorazepam drips (> 6–10 mg/hr causes Propylene Glycol hyperosmolar lactic acidosis and AKI—use IV Phenobarbital or Midazolam instead).',
    bodyEs:
      'Evitar Propofol > 4–5 mg/kg/h por > 48 h (vigilar Triglicéridos, CK, Lactato y ECG por SIP), y evitar infusiones continuas altas de Lorazepam IV (> 6–10 mg/h causa acidosis láctica hiperosmolar y FRA por Propilenglicol; usar Fenobarbital o Midazolam IV).'
  }),
  Object.freeze({
    id: 'asra_asa_continue_buprenorphine_surgery_rule',
    titleEn: 'The ASRA/ASA Continue Perioperative Buprenorphine & Vivitrol Regional Rule',
    titleEs: 'Regla ASRA/ASA de Mantener Buprenorfina Perioperatoria y Bloqueos Regionales en Vivitrol',
    bodyEn:
      'Do not stop Buprenorphine or Methadone before surgery: continue baseline MOUD (split q6–8h) and layer regional nerve/epidural blocks + IV Ketamine + full mu-agonists. For emergent surgery within < 4 weeks of IM Vivitrol, anchor analgesia on continuous regional catheters and Ketamine.',
    bodyEs:
      'No suspender Buprenorfina ni Metadona antes de operar: mantener el TMO basal (fraccionado c/6–8 h) y sumar bloqueos regionales/epidurales + Ketamina IV + agonistas mu puros. En cirugía urgente dentro de < 4 semanas de Vivitrol IM, basar la analgesia en catéteres regionales y Ketamina.'
  }),
  Object.freeze({
    id: 'serotonin_syndrome_phenylpiperidine_opioid_rule',
    titleEn: 'The Serotonin Syndrome Opioid Rule (Stop Fentanyl/Tramadol; Morphine/Hydromorphone Are Safe)',
    titleEs: 'Regla de Opioides en Síndrome Serotoninérgico (Suspender Fentanilo/Tramadol; Morfina/Hidromorfona Son Seguras)',
    bodyEn:
      'In Serotonin Syndrome (clonus + hyperreflexia + hyperthermia), remember that phenylpiperidine opioids (Fentanyl, Meperidine, Tramadol) have serotonergic activity and must be stopped; rotate analgesia to Morphine, Hydromorphone, or Oxycodone and give Cyproheptadine + active cooling.',
    bodyEs:
      'En Síndrome Serotoninérgico (clonus + hiperreflexia + hipertermia), recordar que el Fentanilo, Meperidina y Tramadol tienen actividad serotoninérgica y deben suspenderse; rotar analgesia a Morfina, Hidromorfona u Oxicodona y administrar Ciproheptadina + enfriamiento activo.'
  })
]);

const DEFAULT_ICU_STATE = Object.freeze({
  selectedSyndrome: 'rsi_induction_neuromuscular_blockade',
  rsiWithOverdoseDownTimeRhabdoOrAcidosis: false,
  ventilatedFentanylXylazineAgitationDyssynchrony: false,
  highDosePropofolOrLorazepamDripAcidosis: false,
  surgeryOnBuprenorphineMethadoneOrVivitrol: false,
  extubationWeaningWithdrawalRisk: false,
  coreTempOver40ClonusOrLeadPipeRigidity: false,
  clinicalNotes: ''
});

let icuState = { ...DEFAULT_ICU_STATE };
const listeners = new Set();

export function getIcuState() {
  return { ...icuState };
}

export function setIcuState(patch = {}) {
  icuState = { ...icuState, ...patch };
  for (const fn of listeners) {
    fn(getIcuState());
  }
  return getIcuState();
}

export function resetIcuState() {
  icuState = { ...DEFAULT_ICU_STATE };
  for (const fn of listeners) {
    fn(getIcuState());
  }
  return getIcuState();
}

export function subscribeIcuState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function evaluateIcuRisk(state = icuState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const profile =
    ICU_SYNDROME_PROFILES[state.selectedSyndrome] ||
    ICU_SYNDROME_PROFILES.rsi_induction_neuromuscular_blockade;

  const redFlags = [];
  let urgency = profile.urgency;

  if (state.rsiWithOverdoseDownTimeRhabdoOrAcidosis) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA CRÍTICA DE INTUBACIÓN (ISR): PROHIBIDO usar Succinilcolina si hubo inmovilización prolongada por sobredosis, rabdomiólisis o K+ > 5.0 mEq/L (usar Rocuronio 1.2 mg/kg IV). Si hay acidosis metabólica severa, igualar la frecuencia respiratoria de Kussmaul (24–32 rpm) tras intubar.'
        : 'CRITICAL INTUBATION (RSI) ALERT: STRICTLY PROHIBIT Succinylcholine if prolonged overdose immobilization, rhabdomyolysis, or K+ > 5.0 mEq/L is present (use Rocuronium 1.2 mg/kg IV). In severe metabolic acidosis, set post-intubation ventilator rate (24–32/min) to match Kussmaul compensation.'
    );
  }

  if (state.coreTempOver40ClonusOrLeadPipeRigidity) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'EMERGENCIA HIPERTÉRMICA EN UCI (T > 40°C): Enfriamiento físico inmediato + Benzodiazepinas IV + parálisis con Rocuronio (nunca Succinilcolina). Si hay clonus (Síndrome Serotoninérgico): suspender Fentanilo y dar Ciproheptadina 12 mg. Si hay rigidez en tubo de plomo (SNM) o ETCO2 alto (HM): Dantroleno IV.'
        : 'ICU HYPERTHERMIC EMERGENCY (T > 40°C): Immediate active physical cooling + IV Benzodiazepines + Rocuronium paralysis (never Succinylcholine). If clonus is present (Serotonin Syndrome): stop Fentanyl and give Cyproheptadine 12 mg. If lead-pipe rigidity (NMS) or spiking ETCO2 (MH): give IV Dantrolene.'
    );
  }

  if (state.highDosePropofolOrLorazepamDripAcidosis) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE TOXICIDAD POR SEDANTES EN UCI (SIP / Propilenglicol): Suspender Propofol de inmediato si hay acidosis láctica, aumento de CK, Triglicéridos > 500 mg/dL o patrón de Brugada. Suspender Lorazepam IV continuo si Brecha Osmolar > 10–12 mOsm/kg (cambiar a Fenobarbital o Midazolam IV).'
        : 'ICU SEDATIVE TOXICITY ALERT (PRIS / Propylene Glycol): Stop Propofol immediately if lactic acidosis, rising CK, Triglycerides > 500 mg/dL, or Brugada ECG changes appear. Stop continuous IV Lorazepam if Osmolar Gap > 10–12 mOsm/kg (switch to IV Phenobarbital or Midazolam).'
    );
  }

  if (state.ventilatedFentanylXylazineAgitationDyssynchrony) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'ASINCRONÍA VENTILATORIA POR FENTANILO + XILACINA ("TRANQ"): Iniciar infusión de Dexmedetomidina IV (0.2–1.5 mcg/kg/h) + Clonidina enteral por SNG (0.1–0.3 mg c/6–8h) para cubrir la abstinencia alfa-2, junto con Metadona/Buprenorfina basal y Ketamina IV (0.1–0.3 mg/kg/h).'
        : 'Fentanyl + Xylazine ("Tranq") Ventilator Dyssynchrony: Initiate IV Dexmedetomidine (0.2–1.5 mcg/kg/hr) + enteral Clonidine via NGT (0.1–0.3 mg q6–8h) to treat alpha-2 withdrawal, paired with basal enteral Methadone/Buprenorphine and low-dose IV Ketamine (0.1–0.3 mg/kg/hr).'
    );
  }

  if (state.surgeryOnBuprenorphineMethadoneOrVivitrol) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'MANEJO ANESTÉSICO PERIOPERATORIO (ASRA/ASA): NO suspender Buprenorfina ni Metadona antes de operar; mantener dosis basal (fraccionada c/6–8 h) y sumar bloqueos regionales/epidurales + Ketamina IV + agonistas mu puros. Si recibió Vivitrol IM hace < 4 semanas, priorizar catéteres regionales continuos y Ketamina.'
        : 'PERIOPERATIVE ANESTHESIA PROTOCOL (ASRA/ASA): DO NOT stop Buprenorphine or Methadone before surgery; continue baseline MOUD (split q6–8h) and layer regional/epidural blocks + IV Ketamine + full mu-agonists. If IM Vivitrol was given < 4 weeks ago, anchor analgesia on continuous regional catheters and Ketamine.'
    );
  }

  if (state.extubationWeaningWithdrawalRisk) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'PUENTE SEGURO DE EXTUBACIÓN: Establecer cobertura basal con Metadona/Buprenorfina y Clonidina enteral antes de apagar el fentanilo IV, y extubar bajo infusión puente de Dexmedetomidina IV o carga de Fenobarbital IV para prevenir autoextubación.'
        : 'SAFE EXTUBATION BRIDGE: Establish basal enteral Methadone/Buprenorphine and Clonidine before turning off IV fentanyl, and extubate on an IV Dexmedetomidine bridge or IV Phenobarbital load to prevent withdrawal-driven extubation failure.'
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

export function formatIcuSbarText(state = icuState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const evalResult = evaluateIcuRisk(state, lang);

  const lines = [];
  lines.push(
    isEs
      ? '=== ENTREGA CLÍNICA SBAR: CUIDADOS INTENSIVOS (UCI), INTUBACIÓN, SEDACIÓN Y ANESTESIA PERIOPERATORIA (CERO-PII) ==='
      : '=== SBAR CLINICAL HANDOFF: ICU CRITICAL CARE, INTUBATION, ANALGOSEDATION & PERIOPERATIVE ANESTHESIA (ZERO-PII) ==='
  );
  lines.push(
    `${isEs ? 'SITUACIÓN (Síndrome Primario)' : 'SITUATION (Primary Syndrome)'}: ${evalResult.title} [${evalResult.urgency}]`
  );
  lines.push(`${isEs ? 'Prioridad Clínica' : 'Clinical Priority'}: ${evalResult.badge}`);
  lines.push('');
  lines.push(isEs ? 'ANTECEDENTES Y FISIOPATOLOGÍA EN UCI / QUIRÓFANO:' : 'ICU / PERIOPERATIVE BACKGROUND & PATHOPHYSIOLOGY:');
  lines.push(`- ${evalResult.summary}`);
  lines.push(`- ${evalResult.pathophysiology}`);

  if (evalResult.redFlags.length > 0) {
    lines.push('');
    lines.push(
      isEs
        ? 'ALERTAS ROJAS DE VÍA AÉREA, SEDACIÓN Y ANESTESIA ACTIVAS:'
        : 'ACTIVE AIRWAY, SEDATION & ANESTHESIA RED-FLAG ALERTS:'
    );
    for (const rf of evalResult.redFlags) {
      lines.push(`  [!] ${rf}`);
    }
  }

  lines.push('');
  lines.push(
    isEs
      ? 'EVALUACIÓN Y MONITOREO DE CUIDADOS INTENSIVOS:'
      : 'CRITICAL CARE ASSESSMENT & MONITORING WORKUP:'
  );
  for (const d of evalResult.diagnostics) {
    lines.push(`  * ${d}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'RECOMENDACIÓN Y PROTOCOLO DE UCI / ANESTESIA:'
      : 'RECOMMENDATION & ICU / ANESTHESIA PROTOCOL:'
  );
  for (const m of evalResult.management) {
    lines.push(`  * ${m}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'REDUCCIÓN DE DAÑOS EN UCI Y CONTINUIDAD DEL TMO:'
      : 'ICU HARM REDUCTION & MOUD CONTINUITY:'
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

export function icuPerioperativeView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const root = el('section', {
    className: 'view-section icu-perioperative-view',
    attrs: {
      'aria-labelledby': 'icu-perioperative-heading',
      'data-view': 'icu-perioperative'
    }
  });

  const header = el('header', { className: 'view-header icu-header' });
  const kicker = el(
    'span',
    { className: 'section-kicker' },
    t(
      'icu.kicker',
      isEs
        ? 'Medicina Crítica (UCI), Ventilación Mecánica, Analgosedación y Anestesia en TMO'
        : 'Critical Care (ICU), Mechanical Ventilation, Analgosedation & Perioperative Anesthesia on MOUD'
    )
  );
  const title = h('h1', { id: 'icu-perioperative-heading', class: 'view-title' },
    t(
      'icu.title',
      isEs
        ? 'Navegador de Cuidados Intensivos (UCI), Intubación Segura, Sedación en Fentanilo/Xilacina, Síndrome por Propofol y Anestesia Perioperatoria en TMO'
        : 'Critical Care (ICU), Safe Intubation (RSI), Fentanyl/Xylazine Analgosedation, Propofol Infusion Syndrome & Perioperative Anesthesia Navigator'
    )
  );
  const subtitle = el(
    'p',
    { className: 'view-subtitle' },
    t(
      'icu.subtitle',
      isEs
        ? 'Soporte clínico cero-PII en memoria RAM según consensos SCCM (PADIS), ASA, ASRA y ACMT: prohibición de Succinilcolina en rabdomiólisis por sobredosis, reemplazo alfa-2 (Dexmedetomidina/Clonidina) para asincronía ventilatoria por xilacina, síndrome por infusión de propofol (SIP), cirugía en Buprenorfina/Metadona/Vivitrol y puentes de extubación.'
        : 'Zero-PII, in-RAM clinical decision support aligned with SCCM (PADIS), ASA, ASRA, and ACMT consensus: Succinylcholine prohibition in overdose rhabdomyolysis, alpha-2 replacement (Dexmedetomidine/Clonidine) for xylazine ventilator dyssynchrony, Propofol Infusion Syndrome (PRIS), perioperative Buprenorphine/Methadone/Vivitrol anesthesia, and extubation bridges.'
    )
  );
  header.append(kicker, title, subtitle);
  root.appendChild(header);

  const safetyBanner = el('div', {
    className: 'clinical-alert-banner icu-safety-banner',
    attrs: { role: 'region', 'aria-label': isEs ? 'Seguridad en Cuidados Intensivos y Quirófano' : 'Critical Care & Perioperative Safety Rules' }
  });
  safetyBanner.append(
    el(
      'strong',
      {},
      isEs
        ? 'Reglas Cardinales de Supervivencia en UCI y Anestesia: '
        : 'Cardinal ICU & Perioperative Anesthesia Survival Rules: '
    ),
    el(
      'span',
      {},
      isEs
        ? '(1) En intubación tras sobredosis con inmovilización/rabdomiólisis, PROHIBIDO usar Succinilcolina (usar Rocuronio 1.2 mg/kg IV); (2) En asincronía ventilatoria por fentanilo + xilacina, iniciar Dexmedetomidina IV + Clonidina enteral + TMO basal; (3) NO suspender la Buprenorfina ni la Metadona antes de una cirugía.'
        : '(1) In RSI after overdose immobilization/rhabdomyolysis, STRICTLY AVOID Succinylcholine (use Rocuronium 1.2 mg/kg IV); (2) In fentanyl + xylazine ventilator dyssynchrony, start IV Dexmedetomidine + enteral Clonidine + basal MOUD; (3) DO NOT stop Buprenorphine or Methadone before surgery.'
    )
  );
  root.appendChild(safetyBanner);

  const selectorSection = el('section', {
    className: 'icu-selector-section card',
    attrs: { 'aria-labelledby': 'icu-selector-heading' }
  });
  selectorSection.appendChild(
    el(
      'h2',
      { id: 'icu-selector-heading', className: 'card-title' },
      t(
        'icu.selectorTitle',
        isEs
          ? '1. Seleccione el Síndrome de Cuidados Intensivos, Vía Aérea o Anestesia Perioperatoria'
          : '1. Select Primary Critical Care, Airway or Perioperative Anesthesia Syndrome'
      )
    )
  );

  const syndromeGrid = el('div', {
    className: 'icu-syndrome-grid',
    attrs: { role: 'group', 'aria-label': isEs ? 'Selector de síndrome de UCI y anestesia' : 'ICU and anesthesia syndrome selector' }
  });

  const detailContainer = el('div', {
    className: 'icu-detail-container',
    attrs: { 'aria-live': 'polite' }
  });

  const sbarPre = el('pre', {
    className: 'sbar-output-pre icu-sbar-pre',
    attrs: { tabindex: '0', 'aria-label': isEs ? 'Entrega clínica SBAR de UCI y anestesia' : 'ICU and anesthesia SBAR clinical handoff' }
  });

  function renderSyndromeButtons() {
    clear(syndromeGrid);
    const current = getIcuState();
    for (const profile of Object.values(ICU_SYNDROME_PROFILES)) {
      const isSelected = current.selectedSyndrome === profile.id;
      const btn = makeButton(
        isEs ? profile.titleEs : profile.titleEn,
        () => {
          setIcuState({ selectedSyndrome: profile.id });
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
    className: 'icu-flags-section card',
    attrs: { 'aria-labelledby': 'icu-flags-heading' }
  });
  flagsSection.appendChild(
    el(
      'h2',
      { id: 'icu-flags-heading', className: 'card-title' },
      t(
        'icu.flagsTitle',
        isEs
          ? '2. Verificador de Signos de Alarma en Intubación, Sedación, Quirófano e Hipertermia'
          : '2. Intubation, ICU Sedation, Perioperative & Hyperthermia Red-Flag Checker'
      )
    )
  );

  const flagDefinitions = [
    {
      key: 'rsiWithOverdoseDownTimeRhabdoOrAcidosis',
      labelEn:
        'Emergency Intubation (RSI) in a patient with prolonged overdose "down time" immobilization / rhabdomyolysis OR severe metabolic acidosis (Kussmaul breathing)',
      labelEs:
        'Intubación de emergencia (ISR) en paciente con inmovilización prolongada por sobredosis / rabdomiólisis O acidosis metabólica severa (respiración de Kussmaul)'
    },
    {
      key: 'ventilatedFentanylXylazineAgitationDyssynchrony',
      labelEn:
        'Mechanically ventilated patient with high-potency Fentanyl + Xylazine/Medetomidine exposure having severe agitation, hypertension, and ventilator dyssynchrony',
      labelEs:
        'Paciente ventilado con exposición a Fentanilo + Xilacina/Medetomidina que presenta agitación severa, hipertensión y asincronía con el ventilador'
    },
    {
      key: 'highDosePropofolOrLorazepamDripAcidosis',
      labelEn:
        'High-dose Propofol infusion (> 4 mg/kg/hr or > 48h) with rising lactate/CK/triglycerides (PRIS) OR continuous high-dose IV Lorazepam drip (Propylene Glycol)',
      labelEs:
        'Infusión de Propofol en dosis altas (> 4 mg/kg/h o > 48 h) con lactato/CK/triglicéridos altos (SIP) O infusión continua alta de Lorazepam IV (Propilenglicol)'
    },
    {
      key: 'surgeryOnBuprenorphineMethadoneOrVivitrol',
      labelEn:
        'Elective or emergent surgery in a patient maintained on Buprenorphine, Sublocade/Brixadi, Methadone, or Extended-Release Naltrexone (Vivitrol)',
      labelEs:
        'Cirugía electiva o de urgencia en paciente en tratamiento con Buprenorfina, Sublocade/Brixadi, Metadona o Naltrexona XR (Vivitrol)'
    },
    {
      key: 'extubationWeaningWithdrawalRisk',
      labelEn:
        'Preparing for Spontaneous Breathing Trial (SBT) and extubation in a patient at high risk for opioid, alcohol/GABA, or alpha-2 withdrawal agitation',
      labelEs:
        'Preparación para prueba de ventilación espontánea y extubación en paciente con alto riesgo de agitación por abstinencia de opioides, alcohol/GABA o alfa-2'
    },
    {
      key: 'coreTempOver40ClonusOrLeadPipeRigidity',
      labelEn:
        'Core hyperthermia (> 40°C / 104°F) with ankle/ocular clonus (Serotonin Syndrome), lead-pipe rigidity (NMS), sympathomimetic crisis, or spiking ETCO2 (MH)',
      labelEs:
        'Hipertermia central (> 40°C / 104°F) con clonus aquíleo/ocular (Síndrome Serotoninérgico), rigidez en tubo de plomo (SNM), crisis simpaticomimética o ETCO2 alto (HM)'
    }
  ];

  const flagsList = el('div', { className: 'icu-flags-list' });
  const checkboxRefs = new Map();

  for (const def of flagDefinitions) {
    const row = el('label', { className: 'checkbox-row icu-flag-row' });
    const cb = el('input', {
      attrs: {
        type: 'checkbox',
        'data-flag-key': def.key
      }
    });
    cb.checked = Boolean(icuState[def.key]);
    cb.addEventListener('change', () => {
      setIcuState({ [def.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(def.key, cb);
    row.append(cb, el('span', {}, isEs ? def.labelEs : def.labelEn));
    flagsList.appendChild(row);
  }
  flagsSection.appendChild(flagsList);

  function renderDetailAndSbar() {
    clear(detailContainer);
    const evalResult = evaluateIcuRisk(getIcuState());

    const card = el('article', {
      className: `card icu-profile-card urgency-${evalResult.urgency.toLowerCase()}`
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
        className: 'icu-redflag-box',
        attrs: { role: 'alert' }
      });
      alertBox.appendChild(
        el(
          'h4',
          {},
          isEs
            ? 'Alertas Críticas de Vía Aérea, UCI y Anestesia Activadas'
            : 'Immediate Airway, ICU & Perioperative Red-Flag Alerts Activated'
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
      el('h4', {}, isEs ? 'Fisiopatología y Farmacología de Cuidados Críticos' : 'Critical Care Pathophysiology & Pharmacology'),
      el('p', {}, evalResult.pathophysiology)
    );
    card.appendChild(pathoSection);

    const diagSection = el('div', { className: 'profile-subsection' });
    diagSection.appendChild(
      el('h4', {}, isEs ? 'Evaluación y Monitoreo en UCI / Quirófano' : 'ICU & Perioperative Diagnostic Monitoring')
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
          ? 'Protocolo de Manejo de Vía Aérea, Sedación y Anestesia'
          : 'Airway, Analgosedation & Perioperative Management Protocol'
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
          ? 'Reducción de Daños en UCI y Continuidad del TMO'
          : 'Critical Care Harm Reduction & MOUD Continuity'
      ),
      el('p', {}, evalResult.harmReduction)
    );
    card.appendChild(hrSection);

    detailContainer.appendChild(card);
    sbarPre.textContent = formatIcuSbarText(getIcuState());
  }

  selectorSection.appendChild(syndromeGrid);
  root.appendChild(selectorSection);
  root.appendChild(flagsSection);
  root.appendChild(detailContainer);

  const rulesSection = el('section', {
    className: 'icu-rules-section card',
    attrs: { 'aria-labelledby': 'icu-rules-heading' }
  });
  rulesSection.appendChild(
    el(
      'h2',
      { id: 'icu-rules-heading', className: 'card-title' },
      t(
        'icu.rulesTitle',
        isEs
          ? '3. Reglas Cardinales de Cuidados Intensivos, Intubación y Anestesia en TMO'
          : '3. Cardinal Rules of Critical Care, Intubation & Perioperative MOUD'
      )
    )
  );
  const rulesGrid = el('div', { className: 'icu-rules-grid' });
  for (const rule of ICU_HARM_REDUCTION_RULES) {
    const rCard = el('article', { className: 'icu-rule-card' });
    rCard.append(
      el('h3', { className: 'rule-title' }, isEs ? rule.titleEs : rule.titleEn),
      el('p', { className: 'rule-body' }, isEs ? rule.bodyEs : rule.bodyEn)
    );
    rulesGrid.appendChild(rCard);
  }
  rulesSection.appendChild(rulesGrid);
  root.appendChild(rulesSection);

  const sbarSection = el('section', {
    className: 'icu-sbar-section card',
    attrs: { 'aria-labelledby': 'icu-sbar-heading' }
  });
  sbarSection.appendChild(
    el(
      'h2',
      { id: 'icu-sbar-heading', className: 'card-title' },
      t(
        'icu.sbarTitle',
        isEs
          ? '4. Generador de Entrega Clínica SBAR (Cero-PII en RAM)'
          : '4. Zero-PII SBAR Clinical Handoff Generator (In-RAM)'
      )
    )
  );

  const notesLabel = el(
    'label',
    { className: 'field-label', attrs: { for: 'icu-clinical-notes' } },
    isEs
      ? 'Notas clínicas contextuales (solo en RAM, sin datos identificables):'
      : 'Contextual clinical notes (in-RAM only, zero identifiable data):'
  );
  const notesInput = el('textarea', {
    id: 'icu-clinical-notes',
    className: 'form-textarea icu-notes-input',
    attrs: {
      rows: '2',
      placeholder: isEs
        ? 'Ej. K+ 5.6 mEq/L, CK 18,400 U/L, Dexmedetomidina 0.8 mcg/kg/h + Clonidina 0.2 mg SNG c/8h...'
        : 'e.g., K+ 5.6 mEq/L, CK 18,400 U/L, Dexmedetomidine 0.8 mcg/kg/hr + Clonidine 0.2 mg NGT q8h...'
    }
  });
  notesInput.value = icuState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setIcuState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatIcuSbarText(getIcuState());
  });

  const copyStatus = el('span', {
    className: 'copy-status-msg',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });

  const copyBtn = makeButton(
    isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard',
    async () => {
      const txt = formatIcuSbarText(getIcuState());
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
      resetIcuState();
      notesInput.value = '';
      copyStatus.textContent = '';
      for (const [k, cb] of checkboxRefs.entries()) {
        cb.checked = Boolean(icuState[k]);
      }
      renderSyndromeButtons();
      renderDetailAndSbar();
    },
    { className: 'button secondary reset-icu-btn' }
  );

  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);

  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  const linksSection = el('nav', {
    className: 'icu-links-section card',
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
      isEs ? 'Atención Hospitalaria y Dolor Agudo en TMO (#/hospital-care)' : 'Hospital Care & Acute Pain on MOUD (#/hospital-care)',
      '#/hospital-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Salud Pulmonar y Daño Post-Sobredosis (#/pulmonary-care)' : 'Pulmonary Health & Post-Overdose Lung Injury (#/pulmonary-care)',
      '#/pulmonary-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Salud Renal y Rabdomiólisis (#/renal-care)' : 'Renal Health & Rhabdomyolysis (#/renal-care)',
      '#/renal-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Emergencias Obstétricas y Cesárea en TMO (#/obstetric-emergencies)' : 'Obstetric Emergencies & Cesarean on MOUD (#/obstetric-emergencies)',
      '#/obstetric-emergencies',
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
