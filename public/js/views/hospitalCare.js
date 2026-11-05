// public/js/views/hospitalCare.js
// HarborPath - Inpatient Addiction Medicine, Acute Hospital Care, Pain on MOUD & Patient-Directed Discharge ("AMA") Navigator
// Clinical consensus: CA Bridge High-Dose Emergency Department Buprenorphine Induction Guidelines (Herring et al., 2021),
// ASAM / ACOG Clinical Guidelines on Inpatient Pain Management for Patients on MOUD,
// American College of Physicians & Society of Hospital Medicine Guidelines on Patient-Directed ("AMA") Discharge Harm Reduction,
// Federal Emergency Medical Treatment and Labor Act (EMTALA, 42 U.S.C. § 1395dd),
// Landmark Insurance Billing Evidence (Schaefer et al., J Gen Intern Med, 2012).
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: CA BRIDGE HIGH-DOSE BUPRENORPHINE INDUCTION
// ============================================================================

export const CA_BRIDGE_HIGH_DOSE_PROTOCOL = Object.freeze({
  titleEn: 'CA Bridge High-Dose Emergency & Inpatient Buprenorphine Induction',
  titleEs: 'Protocolo CA Bridge de Inducción Rápida de Buprenorfina a Altas Dosis en Urgencias e Ingreso',
  rationaleEn: 'In patients using high-potency synthetic opioids (fentanyl, carfentanil, nitazenes), traditional low starting doses (2-4 mg) often fail to relieve severe withdrawal and increase the risk of patient-directed discharge. The CA Bridge model utilizes rapid high-dose initiation (8 mg to 16 mg to 24-32 mg) once mild-to-moderate objective withdrawal (COWS >= 8) is present. Rapidly saturating mu-opioid receptors (> 80% occupancy) terminates withdrawal, suppresses cravings, and dramatically reduces hospital departure against advice.',
  rationaleEs: 'En pacientes que consumen opioides sintéticos de alta potencia (fentanilo, nitazenos), las dosis bajas tradicionales (2-4 mg) a menudo no alivian la abstinencia severa y aumentan el riesgo de abandono del hospital. El modelo CA Bridge utiliza dosis altas rápidas (8 mg a 16 mg hasta 24-32 mg) una vez que hay abstinencia objetiva leve a moderada (COWS >= 8). La saturación rápida de receptores mu (> 80%) detiene la abstinencia, elimina el deseo de consumo y reduce drásticamente las altas voluntarias precipitadas.',
  steps: Object.freeze([
    {
      step: 1,
      nameEn: 'Assess Objective Withdrawal (COWS >= 8)',
      nameEs: 'Evaluar Abstinencia Objetiva (COWS >= 8)',
      detailEn: 'Confirm at least mild-to-moderate withdrawal with objective signs (pupillary dilation, tachycardia, rhinorrhea, restlessness, tremors, gooseflesh). If patient is deeply sedated or intoxicated, defer induction.',
      detailEs: 'Confirmar al menos abstinencia leve a moderada con signos objetivos (pupilas dilatadas, taquicardia, rinorrea, inquietud, temblores, piel de gallina). Si el paciente está sedado o intoxicado, posponer la inducción.'
    },
    {
      step: 2,
      nameEn: 'Administer Initial Test Dose (8 mg Sublingual)',
      nameEs: 'Administrar Dosis Inicial de Prueba (8 mg Sublingual)',
      detailEn: 'Administer buprenorphine 8 mg sublingual (SL). Instruct patient to hold tablet/film under tongue for 10 minutes without swallowing saliva or drinking water to ensure maximum transmucosal absorption.',
      detailEs: 'Administrar buprenorfina 8 mg sublingual (SL). Indicar al paciente que mantenga la tableta/película bajo la lengua 10 minutos sin tragar saliva ni beber agua para asegurar absorción transmucosa máxima.'
    },
    {
      step: 3,
      nameEn: 'Reassess at 45 to 60 Minutes',
      nameEs: 'Reevaluar a los 45 a 60 Minutos',
      detailEn: 'Evaluate patient response: (A) If withdrawal is significantly relieved and patient feels comfortable: schedule maintenance dose (16 mg/day). (B) If withdrawal symptoms persist without worsening: administer second 8 mg or 16 mg SL dose immediately (reaching 16-24 mg Day 1 total).',
      detailEs: 'Evaluar respuesta: (A) Si la abstinencia se alivió notablemente y el paciente está cómodo: pautar mantenimiento (16 mg/día). (B) Si los síntomas persisten sin empeorar: administrar de inmediato una segunda dosis de 8 mg o 16 mg SL (alcanzando 16-24 mg en el Día 1).'
    },
    {
      step: 4,
      nameEn: 'High-Dose Consolidation & Discharge Planning',
      nameEs: 'Consolidación de Dosis Alta y Plan de Alta',
      detailEn: 'Total Day 1 dosing can safely reach 24 mg to 32 mg in patients with heavy fentanyl tolerance. Provide prescription for buprenorphine 16-24 mg daily upon hospital discharge with take-home naloxone.',
      detailEs: 'La dosis total del Día 1 puede alcanzar con seguridad de 24 mg a 32 mg en personas con alta tolerancia a fentanilo. Entregar receta de 16-24 mg/día al alta hospitalaria junto con naloxona para llevar a casa.'
    }
  ])
});

// ============================================================================
// CLINICAL TAXONOMY: PRECIPITATED WITHDRAWAL RESCUE PROTOCOL
// ============================================================================

export const PRECIPITATED_WITHDRAWAL_RESCUE = Object.freeze({
  titleEn: 'Precipitated Opioid Withdrawal Recognition & Rescue Protocol',
  titleEs: 'Protocolo de Rescate y Reconocimiento de Abstinencia Opioide Precipitada',
  definitionEn: 'Precipitated withdrawal occurs when buprenorphine (a partial mu-agonist with extremely high receptor affinity) is administered in the presence of full-agonist opioids (fentanyl, methadone, oxycodone) before sufficient receptor vacancy exists. Buprenorphine displaces full agonists from mu receptors, triggering an acute precipitous drop in opioid signaling within 30 to 60 minutes.',
  definitionEs: 'La abstinencia precipitada ocurre cuando la buprenorfina (agonista parcial con afinidad altísima) se administra en presencia de opioides agonistas completos (fentanilo, metadona) antes de que se liberen los receptores. La buprenorfina desplaza a los agonistas completos, provocando una caída brusca de la señal opioide en 30 a 60 minutos.',
  warningEn: 'DO NOT ABANDON THE PATIENT. Precipitated withdrawal is terrifying and excruciating, but it is manageable. Leaving the patient without relief leads to flight from the hospital, illicit use, and lethal overdose.',
  warningEs: 'NO ABANDONE AL PACIENTE. La abstinencia precipitada es aterradora y sumamente dolorosa, pero tratable. Dejar al paciente sin alivio provoca huida hospitalaria, consumo desesperado en la calle y sobredosis fatal.',
  rescueStrategies: Object.freeze([
    {
      strategy: 'High-Dose Buprenorphine Override (Preferred First-Line)',
      strategyEs: 'Sobresaturación con Buprenorfina a Altas Dosis (Primera Línea Preferida)',
      protocolEn: 'Administer an additional 8 mg to 16 mg sublingual buprenorphine every 45-60 minutes until symptom relief is achieved (up to 32 mg total). Rationale: Higher buprenorphine concentrations overcome partial agonism limitations by maximizing total mu-receptor occupancy and activating downstream signaling.',
      protocolEs: 'Administrar 8 mg a 16 mg adicionales de buprenorfina sublingual cada 45-60 minutos hasta lograr alivio (hasta 32 mg en total). Justificación: Concentraciones elevadas maximizan la ocupación de receptores mu y activan la cascada intracelular calmante.'
    },
    {
      strategy: 'Full-Agonist Opioid Rescue (Inpatient / Monitored Setting)',
      strategyEs: 'Rescate con Agonistas Completos (Ámbito Hospitalario Monitorizado)',
      protocolEn: 'In inpatient settings where severe distress persists, intravenous full agonists (e.g., Hydromorphone 2-4 mg IV or Fentanyl 100-200 mcg IV) can be administered under continuous pulse oximetry to compete with buprenorphine binding.',
      protocolEs: 'En pacientes hospitalizados con sufrimiento extremo persistente, pueden administrarse agonistas completos intravenosos (p. ej., hidromorfona 2-4 mg IV o fentanilo 100-200 mcg IV) con pulsioximetría continua para competir por el receptor.'
    },
    {
      strategy: 'Comfort Medication Adjuvant Bundle',
      strategyEs: 'Paquete de Medicación Coadyuvante de Confort',
      protocolEn: 'Provide immediate multimodal symptom relief: Clonidine 0.1-0.2 mg PO (autonomic hyperactivity/sweats), Ondansetron 4-8 mg ODT/IV (nausea/vomiting), Loperamide 4 mg PO (diarrhea), Ketorolac 15-30 mg IV or Ibuprofen 600 mg PO (bone/muscle aches), and Lorazepam 1-2 mg PO/IV (severe panic and anxiety).',
      protocolEs: 'Proporcionar alivio sintomático inmediato: Clonidina 0.1-0.2 mg VO (hiperactividad autonómica y sudores), Ondansetrón 4-8 mg bucodispersable/IV (náuseas/vómitos), Loperamida 4 mg VO (diarrea), Ketorolaco 15-30 mg IV o Ibuprofeno 600 mg VO (dolores óseos), y Lorazepam 1-2 mg VO/IV (pánico y ansiedad severos).'
    }
  ])
});

// ============================================================================
// CLINICAL TAXONOMY: INPATIENT ACUTE PAIN MANAGEMENT ON MOUD
// ============================================================================

export const INPATIENT_PAIN_ON_MOUD = Object.freeze({
  titleEn: 'Inpatient Acute Pain & Surgical Analgesia for Patients on MOUD',
  titleEs: 'Manejo del Dolor Agudo y Analgesia Quirúrgica en Pacientes en MOUD',
  mandateEn: 'CRITICAL CLINICAL MANDATE (ASAM / ACOG / American Pain Society): DO NOT STOP BUPRENORPHINE OR METHADONE FOR ACUTE PAIN OR SURGERY. Discontinuing MOUD precipitates severe withdrawal, heightens pain sensitivity (hyperalgesia), destabilizes addiction remission, and exponentially increases post-discharge overdose mortality. Acute pain must be treated aggressively with multimodal non-opioids and full-agonist opioids titrated on top of baseline MOUD.',
  mandateEs: 'MANDATO CLÍNICO CRÍTICO (ASAM / ACOG / Sociedad Americana del Dolor): NO SUSPENDA LA BUPRENORFINA NI LA METADONA ANTE DOLOR AGUDO O CIRUGÍA. Suspender el MOUD provoca abstinencia aguda severa, hiperalgesia por abstinencia, desestabiliza la remisión y multiplica el riesgo de sobredosis letal tras el alta. El dolor agudo debe tratarse con multimodalidad y agonistas completos titulados por encima de la dosis basal de MOUD.',
  corePrinciples: Object.freeze([
    {
      principleEn: '1. Continue Baseline Buprenorphine (Split-Dosing Analgesia)',
      principleEs: '1. Continuar Buprenorfina Basal (Analgesia con Dosis Dividida)',
      detailEn: 'Buprenorphine provides opioid craving suppression for 24-36 hours, but its analgesic duration lasts only 6 to 8 hours. For acute pain (fractures, abscess incision, surgery), divide the total daily buprenorphine dose into every 6 to 8 hours (q6-8h, e.g., 8 mg bid becomes 4 mg q6h or 8 mg tid) to recruit continuous baseline analgesia.',
      detailEs: 'La buprenorfina controla el deseo de consumo durante 24-36 horas, pero su efecto analgésico dura solo 6 a 8 horas. Para dolor agudo (fracturas, drenaje de abscesos, cirugía), divida la dosis diaria total cada 6 a 8 horas (p. ej., 16 mg/día pasa a 4 mg cada 6h u 8 mg cada 8h) para mantener analgesia basal constante.'
    },
    {
      principleEn: '2. Titrate Full-Agonist Opioids on Top of Buprenorphine',
      principleEs: '2. Titular Agonistas Completos sobre la Buprenorfina',
      detailEn: 'Patients with opioid tolerance and high mu-receptor occupancy require higher doses of short-acting full-agonist opioids (hydromorphone, oxycodone, fentanyl) for breakthrough surgical pain. Buprenorphine does not completely block full agonists when they are dosed appropriately.',
      detailEs: 'Los pacientes con tolerancia a opioides requieren dosis más altas de agonistas completos de acción corta (hidromorfona, oxicodona, fentanilo) para dolor irruptivo. La buprenorfina no bloquea por completo a los agonistas completos cuando se dosifican adecuadamente.'
    },
    {
      principleEn: '3. Methadone Inpatient Verification & Pain Titration',
      principleEs: '3. Verificación de Metadona Hospitalaria y Titulación de Dolor',
      detailEn: 'Contact the outpatient Opioid Treatment Program (OTP) immediately to verify daily methadone dose. Continue verified dose once daily. For acute pain, DO NOT simply increase once-daily methadone; add scheduled non-opioids and short-acting full-agonist opioids for breakthrough pain.',
      detailEs: 'Contacte de inmediato con la clínica de metadona (OTP) para verificar la dosis diaria. Continúe la dosis verificada una vez al día. Para el dolor agudo, NO aumente la dosis única diaria de metadona; añada analgesia multimodal y agonistas completos de acción corta.'
    },
    {
      principleEn: '4. Strictly Contraindicated Analgesics',
      principleEs: '4. Analgésicos Estrictamente Contraindicados',
      detailEn: 'NEVER administer mixed agonist-antagonists (Nalbuphine [Nubain], Butorphanol [Stadol], Pentazocine) as they immediately precipitate severe, violent withdrawal. Avoid Tramadol due to unpredictable CYP2D6 metabolism, minimal efficacy in opioid-tolerant patients, and elevated seizure risk.',
      detailEs: 'NUNCA administre agonistas-antagonistas mixtos (Nalbufina [Nubain], Butorfanol [Stadol], Pentazocina) ya que precipitan de inmediato una abstinencia violenta. Evite el Tramadol por su metabolismo errático, nula eficacia en tolerantes y alto riesgo de convulsiones.'
    }
  ])
});

// ============================================================================
// CLINICAL TAXONOMY: PATIENT-DIRECTED DISCHARGE ("AMA") HARM REDUCTION
// ============================================================================

export const PATIENT_DIRECTED_DISCHARGE_BUNDLE = Object.freeze({
  titleEn: 'Patient-Directed Discharge ("AMA"): Harm Reduction & Rights Consensus',
  titleEs: 'Alta por Voluntad del Paciente ("AMA"): Consenso de Reducción de Daños y Derechos',
  insuranceMythEn: 'THE DESTRUCTIVE INSURANCE BILLING MYTH: Over 65% of clinicians and patients mistakenly believe that if a patient leaves "Against Medical Advice" (AMA), their health insurance (Medicaid, Medicare, Private) will refuse to pay the hospital bill. This belief is 100% FALSE. Landmark peer-reviewed research (Schaefer et al., J Gen Intern Med; Alfandre et al., Ann Intern Med) proved that 0% of insurance claims are denied solely due to leaving against medical advice. Insurers pay for all medically necessary care delivered prior to departure.',
  insuranceMythEs: 'EL MITO DESTRUCTIVO DE LA FACTURACIÓN DEL SEGURO: Más del 65% de los médicos y pacientes creen erróneamente que si un paciente firma el alta voluntaria ("Against Medical Advice" / AMA), su seguro médico (Medicaid, Medicare o privado) se negará a pagar la factura del hospital. Esta creencia es 100% FALSA. Investigaciones médicas exhaustivas (Schaefer et al., J Gen Intern Med) demostraron que el 0% de las reclamaciones son rechazadas por salir de alta voluntaria. Los seguros pagan toda la atención médicamente necesaria recibida hasta el momento de la salida.',
  harmReductionPrinciples: Object.freeze([
    {
      titleEn: 'Oral Step-Down Antibiotic Therapy (Discharge with Dignity)',
      titleEs: 'Antibioticoterapia Oral Escalonada (Alta con Dignidad)',
      detailEn: 'If a patient with a severe bacterial infection (endocarditis, osteomyelitis, bacteremia, complicated abscess) refuses to remain hospitalized for a 4-to-6-week IV antibiotic course, DO NOT send them away with nothing. Prescribe evidence-based oral step-down regimens (e.g., Linezolid 600 mg PO bid, Cefpodoxime, Ciprofloxacin + Clindamycin, or single-dose long-acting lipoglycopeptide Dalbavancin 1500 mg IV prior to departure). Partial antibiotic therapy is vastly superior to zero treatment.',
      detailEs: 'Si un paciente con infección bacteriana severa (endocarditis, osteomielitis, bacteriemia, absceso complejo) no puede permanecer hospitalizado para 4 a 6 semanas de antibiótico IV, NO lo deje ir sin nada. Recete pautas orales escalonadas basadas en evidencia (p. ej., Linezolid 600 mg VO cada 12h, Cefpodoxima, o una dosis única de dalbavancina 1500 mg IV antes de salir). El tratamiento antibiótico parcial es infinitamente superior a la falta total de tratamiento.'
    },
    {
      titleEn: '7 to 14-Day Bridge MOUD Prescription',
      titleEs: 'Receta Puente de MOUD de 7 a 14 Días',
      detailEn: 'Never withhold buprenorphine prescriptions as a punitive measure when a patient leaves early. Provide a 7-to-14-day bridge prescription for buprenorphine with naloxone to prevent acute withdrawal, fatal overdose, and desperate street drug seeking.',
      detailEs: 'Jamás retenga las recetas de buprenorfina como medida de castigo cuando un paciente se va antes de tiempo. Entregue una receta puente de 7 a 14 días de buprenorfina para prevenir abstinencia aguda, sobredosis letal y consumo desesperado en la calle.'
    },
    {
      titleEn: 'Naloxone & Sterile Wound Supplies',
      titleEs: 'Naloxona y Suministros Estériles para Curación',
      detailEn: 'Hand the patient two doses of intranasal naloxone (Narcan 4 mg), sterile gauze, antiseptic wash, and bandage tape before they walk out the door. Safe departure saves lives.',
      detailEs: 'Entregue al paciente dos dosis de naloxona nasal (Narcan 4 mg), gasas estériles, antiséptico y vendas antes de que cruce la puerta. Una salida segura salva vidas.'
    },
    {
      titleEn: 'Unconditional Welcome-Back Policy',
      titleEs: 'Política de Puertas Abiertas sin Condiciones',
      detailEn: 'Explicitly reassure the patient: "If your symptoms get worse, or if you change your mind, our doors are always open. Leaving today will never be held against you."',
      detailEs: 'Dígale expresamente al paciente: "Si empeora o cambia de opinión, nuestras puertas siempre están abiertas. Salir hoy no le perjudicará si necesita regresar mañana".'
    }
  ])
});

// ============================================================================
// CLINICAL TAXONOMY: FEDERAL EMTALA & PATIENT RIGHTS IN THE HOSPITAL
// ============================================================================

export const HOSPITAL_PATIENT_RIGHTS = Object.freeze({
  titleEn: 'Your Legal Rights in the Hospital (EMTALA & Privacy Protections)',
  titleEs: 'Sus Derechos Legales en el Hospital (EMTALA y Protección de Privacidad)',
  rights: Object.freeze([
    {
      titleEn: 'Federal EMTALA Mandate (42 U.S.C. § 1395dd)',
      titleEs: 'Mandato Federal EMTALA (42 U.S.C. § 1395dd)',
      textEn: 'Any individual who presents to a hospital emergency department is legally entitled to an appropriate Medical Screening Examination (MSE) and stabilizing medical treatment for any emergency medical condition, including severe withdrawal or acute infection, regardless of health insurance, ability to pay, citizenship, or history of substance use.',
      textEs: 'Cualquier persona que acuda a urgencias de un hospital tiene derecho legal a un Examen Médico de Detección (MSE) y estabilización de cualquier condición de emergencia, incluyendo abstinencia severa o infecciones agudas, sin importar seguro médico, capacidad de pago ni consumo de sustancias.'
    },
    {
      titleEn: 'Strict Medical Privacy (42 CFR Part 2 & HIPAA)',
      titleEs: 'Privacidad Médica Estricta (42 CFR Parte 2 y HIPAA)',
      textEn: 'Hospital clinicians and nurses are legally prohibited from reporting illicit drug use or toxicology results to police, law enforcement, or employers without explicit court orders. Medical care is confidential.',
      textEs: 'Los profesionales del hospital tienen prohibido por ley informar sobre consumo de drogas o análisis toxicológicos a la policía o empleadores sin orden judicial específica. La atención médica es confidencial.'
    },
    {
      titleEn: 'Right to Withdrawal & Pain Treatment',
      titleEs: 'Derecho a Recibir Tratamiento para el Dolor y la Abstinencia',
      textEn: 'Under federal medical standards, acute withdrawal is a recognized medical emergency. Patients have the right to receive evidence-based medications (buprenorphine, methadone, symptom comfort meds) to relieve withdrawal distress while receiving inpatient treatment.',
      textEs: 'Bajo los estándares médicos federales, la abstinencia aguda es una emergencia médica. Los pacientes tienen derecho a recibir medicación basada en evidencia (buprenorfina, metadona, fármacos de confort) para aliviar el malestar durante su ingreso.'
    },
    {
      titleEn: 'Right to Leave Without Financial Penalty',
      titleEs: 'Derecho a Salir sin Penalización Económica del Seguro',
      textEn: 'You cannot be held against your will unless you meet strict legal criteria for psychiatric civil commitment (imminent danger to self/others). Leaving the hospital early does NOT cancel your insurance coverage for the care already received.',
      textEs: 'No pueden retenerle contra su voluntad salvo criterios legales estrictos de internamiento psiquiátrico urgente. Salir antes de tiempo NO anula la cobertura de su seguro para la atención médica ya recibida.'
    }
  ])
});

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT
// ============================================================================

const createDefaultHospitalState = () => ({
  mode: 'clinician', // 'clinician' | 'patient'
  activeTab: 'bridge', // 'bridge' | 'pain' | 'discharge' | 'rights' | 'sbar'
  patientMoudStatus: 'fentanyl_active', // 'fentanyl_active' | 'buprenorphine_prescribed' | 'methadone_otp' | 'none'
  inpatientPainSeverity: 'moderate', // 'mild' | 'moderate' | 'severe'
  suspectedInfectionType: 'endocarditis_sepsis', // 'endocarditis_sepsis' | 'abscess_wound' | 'none'
  cowsScore: 10,
  wantsDischargeEarly: false
});

let hospitalState = createDefaultHospitalState();
const hospitalListeners = new Set();

export function getHospitalState() {
  return { ...hospitalState };
}

export function setHospitalState(updates = {}) {
  hospitalState = { ...hospitalState, ...updates };
  hospitalListeners.forEach((fn) => {
    try { fn(getHospitalState()); } catch (e) { /* ignore */ }
  });
  return getHospitalState();
}

export function resetHospitalState() {
  hospitalState = createDefaultHospitalState();
  hospitalListeners.forEach((fn) => {
    try { fn(getHospitalState()); } catch (e) { /* ignore */ }
  });
  return getHospitalState();
}

export function subscribeHospitalState(fn) {
  if (typeof fn === 'function') {
    hospitalListeners.add(fn);
    return () => hospitalListeners.delete(fn);
  }
  return () => {};
}

// ============================================================================
// SBAR CLINICAL INPATIENT CONSULT HANDOFF GENERATOR (ZERO PII)
// ============================================================================

export function formatInpatientSbarHandoff(state = {}, isEs = false) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const moud = state.patientMoudStatus || 'fentanyl_active';
  const pain = state.inpatientPainSeverity || 'moderate';
  const inf = state.suspectedInfectionType || 'endocarditis_sepsis';
  const cows = typeof state.cowsScore === 'number' ? state.cowsScore : 10;
  const earlyDischarge = Boolean(state.wantsDischargeEarly);

  if (isEs) {
    let out = `================================================================================\n`;
    out += `NOTA SBAR DE INTERCONSULTA DE ADICCIONES HOSPITALARIAS (SIN DATOS PERSONALES)\n`;
    out += `Generado: ${now} UTC | HarborPath Inpatient Decision Support\n`;
    out += `Marco Clínico: Protocolo CA Bridge | Consenso ASAM/ACOG Dolor en MOUD | EMTALA\n`;
    out += `================================================================================\n\n`;

    out += `[S - SITUATION / SITUACIÓN CLÍNICA HOSPITALARIA]\n`;
    out += `Motivo de Consulta: Manejo intrahospitalario de adicciones, inducción buprenorfina o dolor agudo en paciente con TUS.\n`;
    out += `Estado Actual de Abstinencia (COWS): ${cows} (${cows >= 13 ? 'Abstinencia Moderada-Severa' : (cows >= 8 ? 'Abstinencia Leve-Moderada (Ventana Óptima)' : 'Abstinencia Mínima / Precaución Fentanilo')})\n`;
    out += `Riesgo de Alta por Voluntad del Paciente (AMA): ${earlyDischarge ? 'ALTO RIESGO / DESEA MARCHARSE (Activar paquete de reducción de daños)' : 'Estable en sala'}\n\n`;

    out += `[B - BACKGROUND / ANTECEDENTES Y PERFIL FARMACOLÓGICO]\n`;
    out += `Estado MOUD / Exposición a Opioides: ${moud === 'fentanyl_active' ? 'Consumo activo de fentanilo callejero (Alta lipofilia y tolerancia)' : (moud === 'buprenorphine_prescribed' ? 'En tratamiento activo con Buprenorfina' : (moud === 'methadone_otp' ? 'En tratamiento activo con Metadona (OTP)' : 'Sin tratamiento previo de adicciones'))}\n`;
    out += `Cuadro Infeccioso / Quirúrgico Concomitante: ${inf === 'endocarditis_sepsis' ? 'Endocarditis infecciosa / Sepsis bacterémica' : (inf === 'abscess_wound' ? 'Absceso cutáneo / Infección de partes blandas' : 'Sin infección aguda activa')}\n`;
    out += `Intensidad del Dolor Agudo: ${pain.toUpperCase()}\n\n`;

    out += `[A - ASSESSMENT / EVALUACIÓN CLÍNICA]\n`;
    if (moud === 'fentanyl_active') {
      out += `  * Candidato a Inducción Rápida a Altas Dosis CA Bridge: COWS >= 8 confirmado. Iniciar 8 mg SL; titular a 16-24 mg el Día 1.\n`;
    } else if (moud === 'buprenorphine_prescribed') {
      out += `  * Mantener buprenorfina basal sin interrumpir. Dividir dosis cada 6-8 horas para optimizar analgesia.\n`;
    } else if (moud === 'methadone_otp') {
      out += `  * Verificar dosis con clínica OTP y continuar en toma única matutina. Tratar dolor con agonistas completos de acción corta.\n`;
    }
    out += `\n`;

    out += `[R - RECOMMENDATIONS / PLAN DE MANEJO HOSPITALARIO Y ALTA]\n`;
    out += `  1. MOUD & INDUCCIÓN: Administrar buprenorfina sublingual según protocolo CA Bridge. Si se produce abstinencia precipitada, sobresaturar con 8-16 mg adicionales.\n`;
    out += `  2. ANALGESIA AGUDA: Añadir paracetamol 1g c/6h, AINEs si no hay contraindicación, y agonistas completos titulados a dosis adecuada para dolor severo. NUNCA usar nalbufina ni butorfanol.\n`;
    if (earlyDischarge) {
      out += `  3. REDUCCIÓN DE DAÑOS ANTE ALTA VOLUNTARIA:\n`;
      out += `     - Desmentir al paciente y al equipo el mito de que el seguro no pagará la estancia.\n`;
      out += `     - Recetar antibioterapia oral de rescate (Linezolid 600 mg c/12h o Cefpodoxima) para no dejar la infección desprotegida.\n`;
      out += `     - Entregar receta puente de buprenorfina de 7 a 14 días y 2 dosis de naloxona nasal (Narcan 4 mg).\n`;
      out += `     - Dejar constancia de que el hospital mantiene las puertas abiertas si desea volver.\n`;
    }
    out += `================================================================================\n`;
    out += `Aviso de Privacidad: Cero almacenamiento en dispositivo ni transmisión de datos. In-RAM exclusivamente.\n`;
    return out;
  }

  // English SBAR Note
  let out = `================================================================================\n`;
  out += `INPATIENT ADDICTION CONSULT SBAR CLINICAL NOTE (ZERO PII)\n`;
  out += `Generated: ${now} UTC | HarborPath Inpatient Clinical Decision Support\n`;
  out += `Clinical Standards: CA Bridge Protocol | ASAM/ACOG Pain on MOUD | EMTALA Mandates\n`;
  out += `================================================================================\n\n`;

  out += `[S - SITUATION / INPATIENT CLINICAL STATUS]\n`;
  out += `Consult Reason: Inpatient addiction management, rapid buprenorphine induction, or acute pain control in patient with SUD.\n`;
  out += `Current Withdrawal Status (COWS): ${cows} (${cows >= 13 ? 'Moderate-Severe Withdrawal' : (cows >= 8 ? 'Mild-Moderate Withdrawal (Optimal Induction Window)' : 'Minimal Withdrawal / Fentanyl Caution')})\n`;
  out += `Risk of Patient-Directed ("AMA") Discharge: ${earlyDischarge ? 'HIGH RISK / WANTS TO LEAVE (Activate Harm Reduction Discharge Bundle)' : 'Currently stable on floor'}\n\n`;

  out += `[B - BACKGROUND / TOXICOLOGY & INFECTION CONTEXT]\n`;
  out += `MOUD Status / Opioid Exposure: ${moud === 'fentanyl_active' ? 'Active synthetic fentanyl use (High lipophilicity & profound tolerance)' : (moud === 'buprenorphine_prescribed' ? 'Currently prescribed Buprenorphine' : (moud === 'methadone_otp' ? 'Currently enrolled in Methadone OTP' : 'Opioid naive or no current MOUD'))}\n`;
  out += `Concurrent Infectious / Surgical Diagnosis: ${inf === 'endocarditis_sepsis' ? 'Infective Endocarditis / Systemic Sepsis' : (inf === 'abscess_wound' ? 'Deep Abscess / Skin & Soft Tissue Infection' : 'No active systemic infection')}\n`;
  out += `Inpatient Acute Pain Intensity: ${pain.toUpperCase()}\n\n`;

  out += `[A - ASSESSMENT / CLINICAL EVALUATION]\n`;
  if (moud === 'fentanyl_active') {
    out += `  * Candidate for CA Bridge Rapid High-Dose Induction: Objective COWS >= 8 present. Initiate 8 mg SL; titrate to 16-24 mg Day 1 total.\n`;
  } else if (moud === 'buprenorphine_prescribed') {
    out += `  * Continue baseline buprenorphine without interruption. Divide total daily dose into q6-8h intervals for continuous baseline analgesia.\n`;
  } else if (moud === 'methadone_otp') {
    out += `  * Verify dose with OTP clinic and continue daily morning dose. Treat breakthrough acute pain with short-acting full-agonist opioids.\n`;
  }
  out += `\n`;

  out += `[R - RECOMMENDATIONS / INPATIENT CARE & DISCHARGE PLAN]\n`;
  out += `  1. MOUD & WITHDRAWAL: Order sublingual buprenorphine per CA Bridge protocol. If precipitated withdrawal occurs, override with additional 8-16 mg SL.\n`;
  out += `  2. ACUTE PAIN PROTOCOL: Add scheduled Acetaminophen 1000 mg q6h, scheduled NSAIDs if renal/bleeding permitted, and titrated short-acting full agonists for severe pain. NEVER administer mixed agonist-antagonists (Nalbuphine, Butorphanol).\n`;
  if (earlyDischarge) {
    out += `  3. PATIENT-DIRECTED DISCHARGE ("AMA") HARM REDUCTION BUNDLE:\n`;
    out += `     - Educate care team and patient that insurance DOES NOT deny payment for leaving AMA.\n`;
    out += `     - Prescribe oral step-down antibiotic regimen (Linezolid 600 mg bid or Cefpodoxime) rather than discharging with zero anti-infective coverage.\n`;
    out += `     - Provide 7-to-14-day bridge prescription for buprenorphine and two doses of take-home naloxone nasal spray (4 mg).\n`;
    out += `     - Emphasize an unconditional open-door policy: reassure patient they are welcome back anytime without penalty.\n`;
  }
  out += `================================================================================\n`;
  out += `Privacy Invariant: Zero device storage or network transmission. In-RAM ephemeral note only.\n`;
  return out;
}

// ============================================================================
// VIEW RENDERING: HOSPITAL CARE & PATIENT ADVOCACY NAVIGATOR
// ============================================================================

export function hospitalCareView() {
  const root = h('div', { class: 'view hospital-care-view' });

  function renderView() {
    clear(root);
    const localState = getHospitalState();
    const isEs = document.documentElement.lang === 'es';
    const isClinician = localState.mode === 'clinician';

    // 1. Breadcrumbs
    const breadcrumb = h('nav', { class: 'breadcrumb mb-2', 'aria-label': isEs ? 'Ruta de navegación' : 'Breadcrumb' },
      h('a', { href: '#/' }, isEs ? 'Inicio' : 'Home'),
      h('span', { class: 'breadcrumb-sep' }, ' / '),
      h('a', { href: '#/tools' }, isEs ? 'Herramientas Clínicas' : 'Clinical Tools'),
      h('span', { class: 'breadcrumb-sep' }, ' / '),
      h('span', { 'aria-current': 'page' }, isEs ? 'Atención Hospitalaria y Derechos del Paciente' : 'Hospital Addiction Care & Patient Rights')
    );
    root.appendChild(breadcrumb);

    // 2. Header Card & Mode Switcher
    const headerCard = h('div', { class: 'card mb-3 hospital-header-card' });
    const titleRow = h('div', { class: 'hospital-title-row' });
    const h1 = h('h1', null, isEs
      ? 'Atención Hospitalaria de Adicciones, Dolor en MOUD y Derechos del Paciente'
      : 'Inpatient Addiction Medicine, Pain on MOUD & Hospital Patient Rights');
    titleRow.appendChild(h1);

    const modeToggleBar = h('div', { class: 'mode-toggle-group' });
    const btnClinician = h('button', {
      type: 'button',
      class: `btn btn-small ${isClinician ? 'btn-primary' : 'btn-secondary'}`,
      'aria-pressed': isClinician ? 'true' : 'false',
      click: () => {
        setHospitalState({ mode: 'clinician' });
      }
    }, icon('shield'), ' ', isEs ? 'Modo Personal Hospitalario / Clínico' : 'Clinician / Hospital Team Mode');

    const btnPatient = h('button', {
      type: 'button',
      class: `btn btn-small ${!isClinician ? 'btn-primary' : 'btn-secondary'}`,
      'aria-pressed': !isClinician ? 'true' : 'false',
      click: () => {
        setHospitalState({ mode: 'patient' });
      }
    }, icon('users'), ' ', isEs ? 'Modo Paciente / Familia / Acompañante' : 'Patient / Family / Advocate Mode');

    modeToggleBar.appendChild(btnClinician);
    modeToggleBar.appendChild(btnPatient);
    titleRow.appendChild(modeToggleBar);
    headerCard.appendChild(titleRow);

    const leadText = h('p', { class: 'lead' }, isClinician
      ? (isEs
          ? 'Guía clínica de hospitalización y urgencias: Inducción rápida de buprenorfina a altas dosis CA Bridge, manejo del dolor agudo quirúrgico en pacientes en MOUD, protocolo de rescate de abstinencia precipitada y paquete de reducción de daños en altas por voluntad del paciente (desmintiendo el mito del seguro bajo EMTALA).'
          : 'Evidence-based hospitalist and acute care guidance: CA Bridge high-dose ED buprenorphine induction, acute surgical pain management on MOUD, precipitated withdrawal rescue protocols, and patient-directed discharge ("AMA") harm reduction bundles under federal EMTALA mandates.')
      : (isEs
          ? 'Ir al hospital cuando consume sustancias genera miedo al maltrato o a la abstinencia. Esta guía le enseña sus derechos legales (EMTALA), cómo pedir alivio para el dolor sin que le retiren su medicación, y la verdad sobre el alta voluntaria: su seguro médico NO dejará de pagar la factura por salir antes.'
          : 'Going to the hospital while using drugs is terrifying. This guide explains your federal rights (EMTALA), how to advocate for pain and withdrawal relief without losing your medications, and the truth about leaving early: your health insurance will NOT deny payment if you leave on your own terms.'));
    headerCard.appendChild(leadText);

    // Zero-storage privacy banner
    const privacyNotice = h('div', { class: 'callout callout-info fine' },
      h('strong', null, isEs ? 'Privacidad médica absoluta: ' : 'Absolute Medical Privacy: '),
      isEs
        ? 'Este asistente funciona exclusivamente en la memoria RAM del navegador. Ningún dato clínico se guarda en el dispositivo ni se transmite a servidores.'
        : 'This clinical navigator operates 100% in local browser memory. Zero clinical data is saved to cookies, device storage, or transmitted over the network.');
    headerCard.appendChild(privacyNotice);
    root.appendChild(headerCard);

    // 3. Tab Navigation
    const tabNav = h('div', { class: 'tab-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas Hospitalarias' : 'Hospital Tabs' });
    const tabs = [
      { id: 'bridge', labelEn: '1. CA Bridge High-Dose Induction', labelEs: '1. Inducción Rápida CA Bridge' },
      { id: 'pain', labelEn: '2. Acute Pain Management on MOUD', labelEs: '2. Manejo del Dolor en MOUD' },
      { id: 'discharge', labelEn: '3. Patient-Directed Discharge ("AMA")', labelEs: '3. Alta Voluntaria ("AMA") y Seguro' },
      { id: 'rights', labelEn: '4. Legal Rights & EMTALA', labelEs: '4. Derechos y Ley EMTALA' },
      { id: 'sbar', labelEn: '5. Inpatient SBAR Clinical Note', labelEs: '5. Nota SBAR de Interconsulta' }
    ];

    tabs.forEach((tb) => {
      const active = localState.activeTab === tb.id;
      const tBtn = h('button', {
        type: 'button',
        role: 'tab',
        class: `tab-btn ${active ? 'active' : ''}`,
        'aria-selected': active ? 'true' : 'false',
        click: () => {
          setHospitalState({ activeTab: tb.id });
        }
      }, isEs ? tb.labelEs : tb.labelEn);
      tabNav.appendChild(tBtn);
    });
    root.appendChild(tabNav);

    // 4. Render Active Tab Content
    if (localState.activeTab === 'bridge') {
      root.appendChild(renderBridgeTab(localState, isEs, isClinician));
    } else if (localState.activeTab === 'pain') {
      root.appendChild(renderPainTab(localState, isEs, isClinician));
    } else if (localState.activeTab === 'discharge') {
      root.appendChild(renderDischargeTab(localState, isEs, isClinician));
    } else if (localState.activeTab === 'rights') {
      root.appendChild(renderRightsTab(localState, isEs, isClinician));
    } else if (localState.activeTab === 'sbar') {
      root.appendChild(renderSbarTab(localState, isEs, isClinician));
    }
  }

  // Subscribe to state updates
  const unsubscribe = subscribeHospitalState(() => {
    renderView();
  });

  // Initial render
  renderView();

  return root;
}

// ============================================================================
// TAB 1: CA BRIDGE HIGH-DOSE BUPRENORPHINE INDUCTION & RESCUE
// ============================================================================

function renderBridgeTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'hospital-tab-content' });

  // Protocol Card
  const proto = CA_BRIDGE_HIGH_DOSE_PROTOCOL;
  const pCard = h('div', { class: 'card mb-3' });
  pCard.appendChild(h('h2', null, isEs ? proto.titleEs : proto.titleEn));
  pCard.appendChild(h('p', { class: 'lead' }, isEs ? proto.rationaleEs : proto.rationaleEn));

  const stepsList = h('div', { class: 'hospital-steps-list' });
  proto.steps.forEach((st) => {
    const sBox = h('div', { class: 'hospital-step-item card' });
    sBox.appendChild(h('h3', null, isEs ? st.nameEs : st.nameEn));
    sBox.appendChild(h('p', { class: 'fine mt-1' }, isEs ? st.detailEs : st.detailEn));
    stepsList.appendChild(sBox);
  });
  pCard.appendChild(stepsList);
  container.appendChild(pCard);

  // Precipitated Withdrawal Rescue Card
  const rescue = PRECIPITATED_WITHDRAWAL_RESCUE;
  const rCard = h('div', { class: 'card alert-box alert-danger mb-3' });
  rCard.appendChild(h('h2', null, isEs ? rescue.titleEs : rescue.titleEn));
  rCard.appendChild(h('p', null, isEs ? rescue.definitionEs : rescue.definitionEn));
  rCard.appendChild(h('strong', { class: 'd-block mt-2' }, isEs ? rescue.warningEs : rescue.warningEn));

  const stratList = h('div', { class: 'rescue-strategies-grid mt-2' });
  rescue.rescueStrategies.forEach((strat) => {
    const sBox = h('div', { class: 'rescue-strat-card' });
    sBox.appendChild(h('h3', null, isEs ? strat.strategyEs : strat.strategy));
    sBox.appendChild(h('p', { class: 'fine mt-1' }, isEs ? strat.protocolEs : strat.protocolEn));
    stratList.appendChild(sBox);
  });
  rCard.appendChild(stratList);
  container.appendChild(rCard);

  return container;
}

// ============================================================================
// TAB 2: INPATIENT ACUTE PAIN MANAGEMENT ON MOUD
// ============================================================================

function renderPainTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'hospital-tab-content' });
  const painData = INPATIENT_PAIN_ON_MOUD;

  // Clinical Mandate Alert Card
  const mCard = h('div', { class: 'card alert-box alert-warning mb-3' });
  mCard.appendChild(h('h2', null, isEs ? painData.titleEs : painData.titleEn));
  mCard.appendChild(h('p', { class: 'lead mt-1' }, isEs ? painData.mandateEs : painData.mandateEn));
  container.appendChild(mCard);

  // Core Principles Grid
  const pGrid = h('div', { class: 'pain-principles-grid' });
  painData.corePrinciples.forEach((cp) => {
    const box = h('div', { class: 'card pain-principle-card' });
    box.appendChild(h('h3', null, isEs ? cp.principleEs : cp.principleEn));
    box.appendChild(h('p', { class: 'mt-1' }, isEs ? cp.detailEs : cp.detailEn));
    pGrid.appendChild(box);
  });
  container.appendChild(pGrid);

  return container;
}

// ============================================================================
// TAB 3: PATIENT-DIRECTED DISCHARGE ("AMA") & HARM REDUCTION BUNDLE
// ============================================================================

function renderDischargeTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'hospital-tab-content' });
  const bundle = PATIENT_DIRECTED_DISCHARGE_BUNDLE;

  // The Insurance Myth Buster Card (Top Priority Callout)
  const mythCard = h('div', { class: 'card alert-box alert-danger mb-3' });
  mythCard.appendChild(h('h2', null, isEs ? 'DESMINTIENDO EL MITO: El Seguro SÍ Paga si Sale de Alta Voluntaria ("AMA")' : 'MYTH DEBUNKED: Health Insurance STILL PAYS if You Leave "AMA"'));
  mythCard.appendChild(h('p', { class: 'lead mt-1' }, isEs ? bundle.insuranceMythEs : bundle.insuranceMythEn));
  container.appendChild(mythCard);

  // Harm Reduction Principles
  const hrCard = h('div', { class: 'card mb-3' });
  hrCard.appendChild(h('h2', null, isEs ? bundle.titleEs : bundle.titleEn));
  hrCard.appendChild(h('p', null, isEs
    ? 'Si un paciente decide marcharse del hospital antes de completar su tratamiento médico, el deber ético es no abandonarle. Aplique el paquete de salida con dignidad:'
    : 'When a patient chooses to leave the hospital before clinical completion, healthcare workers must never send them away empty-handed. Implement the Discharge with Dignity care bundle:'));

  const pList = h('div', { class: 'discharge-principles-grid' });
  bundle.harmReductionPrinciples.forEach((hr) => {
    const box = h('div', { class: 'discharge-principle-item card' });
    box.appendChild(h('h3', null, isEs ? hr.titleEs : hr.titleEn));
    box.appendChild(h('p', { class: 'fine mt-1' }, isEs ? hr.detailEs : hr.detailEn));
    pList.appendChild(box);
  });
  hrCard.appendChild(pList);
  container.appendChild(hrCard);

  return container;
}

// ============================================================================
// TAB 4: LEGAL RIGHTS IN THE HOSPITAL & FEDERAL EMTALA
// ============================================================================

function renderRightsTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'hospital-tab-content' });
  const rightsData = HOSPITAL_PATIENT_RIGHTS;

  const rCard = h('div', { class: 'card mb-3' });
  rCard.appendChild(h('h2', null, isEs ? rightsData.titleEs : rightsData.titleEn));
  rCard.appendChild(h('p', { class: 'lead' }, isEs
    ? 'Leyes federales que protegen a las personas que usan sustancias cuando acuden a un hospital o sala de urgencias en los Estados Unidos.'
    : 'Federal statutory protections governing healthcare access, confidentiality, and non-discrimination for people who use drugs in US hospitals.'));

  const rGrid = h('div', { class: 'rights-cards-grid' });
  rightsData.rights.forEach((r) => {
    const box = h('div', { class: 'rights-item card' });
    box.appendChild(h('h3', null, isEs ? r.titleEs : r.titleEn));
    box.appendChild(h('p', { class: 'mt-1' }, isEs ? r.textEs : r.textEn));
    rGrid.appendChild(box);
  });
  rCard.appendChild(rGrid);
  container.appendChild(rCard);

  return container;
}

// ============================================================================
// TAB 5: INPATIENT SBAR CLINICAL HANDOFF & NOTE GENERATOR
// ============================================================================

function renderSbarTab(localState, isEs, isClinician) {
  const container = h('div', { class: 'hospital-tab-content' });

  // Interactive Configuration Form
  const cfgCard = h('div', { class: 'card mb-3' });
  cfgCard.appendChild(h('h2', null, isEs ? 'Configuración Rápida de la Nota SBAR' : 'Clinical SBAR Scenario Configuration'));
  cfgCard.appendChild(h('p', null, isEs
    ? 'Ajuste los parámetros clínicos para generar automáticamente una nota estandarizada de interconsulta y plan de alta segura:'
    : 'Select inpatient clinical parameters to generate a structured addiction consult note and discharge safety brief:'));

  const formGrid = h('div', { class: 'sbar-config-grid' });

  // 1. MOUD Status
  const moudBox = h('div', { class: 'cfg-group' });
  moudBox.appendChild(h('label', { for: 'sel-moud-status' }, isEs ? 'Estado MOUD / Exposición a Opioides:' : 'MOUD Status / Opioid Exposure:'));
  const selMoud = h('select', {
    id: 'sel-moud-status',
    change: (e) => setHospitalState({ patientMoudStatus: e.target.value })
  },
    h('option', { value: 'fentanyl_active', selected: localState.patientMoudStatus === 'fentanyl_active' }, isEs ? 'Fentanilo activo (Requiere inducción CA Bridge)' : 'Active Fentanyl Use (Candidate for CA Bridge)'),
    h('option', { value: 'buprenorphine_prescribed', selected: localState.patientMoudStatus === 'buprenorphine_prescribed' }, isEs ? 'Buprenorfina recetada (Continuar y dividir q6-8h)' : 'Prescribed Buprenorphine (Continue & Split q6-8h)'),
    h('option', { value: 'methadone_otp', selected: localState.patientMoudStatus === 'methadone_otp' }, isEs ? 'Metadona en clínica OTP (Verificar y continuar)' : 'Enrolled in Methadone OTP (Verify & Continue)'),
    h('option', { value: 'none', selected: localState.patientMoudStatus === 'none' }, isEs ? 'Sin tratamiento MOUD previo' : 'No prior MOUD')
  );
  moudBox.appendChild(selMoud);
  formGrid.appendChild(moudBox);

  // 2. Pain Intensity
  const painBox = h('div', { class: 'cfg-group' });
  painBox.appendChild(h('label', { for: 'sel-pain-intensity' }, isEs ? 'Intensidad del Dolor Agudo:' : 'Acute Inpatient Pain Severity:'));
  const selPain = h('select', {
    id: 'sel-pain-intensity',
    change: (e) => setHospitalState({ inpatientPainSeverity: e.target.value })
  },
    h('option', { value: 'mild', selected: localState.inpatientPainSeverity === 'mild' }, isEs ? 'Dolor Leve' : 'Mild Pain'),
    h('option', { value: 'moderate', selected: localState.inpatientPainSeverity === 'moderate' }, isEs ? 'Dolor Moderado' : 'Moderate Pain'),
    h('option', { value: 'severe', selected: localState.inpatientPainSeverity === 'severe' }, isEs ? 'Dolor Severo / Postquirúrgico' : 'Severe / Post-Surgical Pain')
  );
  painBox.appendChild(selPain);
  formGrid.appendChild(painBox);

  // 3. Infection Type
  const infBox = h('div', { class: 'cfg-group' });
  infBox.appendChild(h('label', { for: 'sel-infection-type' }, isEs ? 'Infección Concomitante:' : 'Concurrent Inpatient Infection:'));
  const selInf = h('select', {
    id: 'sel-infection-type',
    change: (e) => setHospitalState({ suspectedInfectionType: e.target.value })
  },
    h('option', { value: 'endocarditis_sepsis', selected: localState.suspectedInfectionType === 'endocarditis_sepsis' }, isEs ? 'Endocarditis / Sepsis (Paso a antibiótico oral si AMA)' : 'Endocarditis / Sepsis (Step-Down Oral if AMA)'),
    h('option', { value: 'abscess_wound', selected: localState.suspectedInfectionType === 'abscess_wound' }, isEs ? 'Absceso / Infección de Partes Blandas' : 'Abscess / Skin & Soft Tissue Infection'),
    h('option', { value: 'none', selected: localState.suspectedInfectionType === 'none' }, isEs ? 'Sin infección activa' : 'No active infection')
  );
  infBox.appendChild(selInf);
  formGrid.appendChild(infBox);

  // 4. Early Discharge (AMA) Risk Checkbox
  const amaBox = h('div', { class: 'cfg-group checkbox-group' });
  const amaLbl = h('label', { class: 'checkbox-inline' });
  const amaChk = h('input', {
    type: 'checkbox',
    id: 'chk-early-discharge',
    checked: localState.wantsDischargeEarly,
    change: (e) => setHospitalState({ wantsDischargeEarly: e.target.checked })
  });
  amaLbl.appendChild(amaChk);
  amaLbl.appendChild(h('span', null, ` ${isEs ? 'Paciente desea marchar de alta voluntaria ("AMA") hoy' : 'Patient requesting early discharge ("AMA") today'}`));
  amaBox.appendChild(amaLbl);
  formGrid.appendChild(amaBox);

  cfgCard.appendChild(formGrid);
  container.appendChild(cfgCard);

  // SBAR Preview & Export Box
  const exportCard = h('div', { class: 'card mb-3' });
  exportCard.appendChild(h('h2', null, isEs ? 'Vista Previa de la Nota SBAR (Sin Datos Personales)' : 'Inpatient SBAR Clinical Note Preview (Zero PII)'));

  const sbarText = formatInpatientSbarHandoff(localState, isEs);
  const pre = h('pre', { class: 'sbar-preview-box', 'aria-label': isEs ? 'Vista previa SBAR' : 'SBAR note preview' });
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
  }, icon('copy'), ' ', isEs ? 'Copiar Nota SBAR al Portapapeles' : 'Copy SBAR Note to Clipboard');

  exportCard.appendChild(copyBtn);
  exportCard.appendChild(copyStatus);
  container.appendChild(exportCard);

  const staffExposureCard = h('div', { class: 'info-callout', role: 'note' }, [
    h('strong', {}, isEs ? '¿Pinchazo accidental de aguja o salpicadura en el personal del hospital? ' : 'Hospital staff needle stick or blood splash exposure? '),
    h('span', {}, isEs
      ? 'Active de inmediato el protocolo de Profilaxis Post-Exposición (PEP < 72h) y derechos OSHA 1910.1030 (100% financiado por el empleador): '
      : 'Activate the immediate 72-hour Post-Exposure Prophylaxis (PEP) protocol and OSHA 1910.1030 rights (100% employer-paid): '),
    h('a', { href: '#/needle-exposure' }, isEs
      ? 'Abrir Protocolo de Exposición Ocupacional y PEP →'
      : 'Open Occupational Exposure & PEP Protocol →')
  ]);
  container.appendChild(staffExposureCard);

  return container;
}

