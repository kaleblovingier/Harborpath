// public/js/views/carceralMoudReentry.js
// HarborPath - Carceral Intake & Reentry MOUD Continuity & Overdose Prevention Directives
// Legal & Clinical Consensus: DOJ Title II ADA Enforcement Settlements (2022–2024),
// CMS SMD #23-003 Section 1115 Medicaid Reentry Demonstration Waivers, SAMHSA 2024 Revised 42 CFR Part 8,
// and Post-Release Overdose Mortality Science (40x–129x Fatal Overdose Spike in Days 1–14).
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// STATUTORY FRAMEWORK & REENTRY CONSTANTS
// ============================================================================

export const CARCERAL_MOUD_REGIMENS = Object.freeze({
  methadone: Object.freeze({
    id: 'methadone',
    nameEn: 'Methadone Maintenance Therapy (Oral Liquid)',
    nameEs: 'Terapia de Mantenimiento con Metadona (Líquido Oral)',
    defaultDose: '90 mg PO Daily',
    formulationEn: 'Oral Solution (10 mg/mL witnessed dosing)',
    formulationEs: 'Solución Oral (10 mg/mL toma presenciada)',
    verificationMethodEn: 'Call community OTP clinic to verify daily dose and last witnessed administration time. Authorized under DEA 21 CFR § 1306.07(c).',
    verificationMethodEs: 'Llamar a la clínica OTP comunitaria para verificar dosis diaria y última toma presenciada. Autorizado bajo DEA 21 CFR § 1306.07(c).',
    bridgeStrategyEn: 'Ensure uninterrupted continuation. For release: Secure intake appointment at community OTP within 24–48 hours and coordinate guest dosing or 14–30 day take-home bridge.',
    bridgeStrategyEs: 'Garantizar continuación ininterrumpida. Al egreso: Cita en clínica OTP comunitaria en 24-48h y coordinar dosificación transitoria o puente de 14-30 días.',
  }),

  buprenorphine_sl: Object.freeze({
    id: 'buprenorphine_sl',
    nameEn: 'Sublingual Buprenorphine / Naloxone (Suboxone / Subutex)',
    nameEs: 'Buprenorfina / Naloxona Sublingual (Suboxone / Subutex)',
    defaultDose: '16 mg / 4 mg SL Daily',
    formulationEn: 'Sublingual Tablets or Films (witnessed mouth inspection)',
    formulationEs: 'Comprimidos o Películas Sublinguales (inspección bucal)',
    verificationMethodEn: 'Verify via state Prescription Drug Monitoring Program (PDMP) and treating prescriber or pharmacy.',
    verificationMethodEs: 'Verificar mediante el sistema estatal de recetas (PDMP) y el médico prescriptor o farmacia comunitaria.',
    bridgeStrategyEn: 'Dispense a 30-day bridge prescription or medication-in-hand directly at the release gate, with warm handoff to community FQHC/OBOT clinic.',
    bridgeStrategyEs: 'Entregar receta electrónica puente de 30 días o medicación en mano en la puerta de salida, con derivación directa a centro de salud FQHC.',
  }),

  buprenorphine_depot: Object.freeze({
    id: 'buprenorphine_depot',
    nameEn: 'Extended-Release Subcutaneous Buprenorphine (Sublocade / Brixadi)',
    nameEs: 'Buprenorfina Subcutánea de Depósito Prolongado (Sublocade / Brixadi)',
    defaultDose: '300 mg / 100 mg SC Monthly',
    formulationEn: 'Subcutaneous Depot Injection (Abdominal)',
    formulationEs: 'Inyección Subcutánea de Depósito (Abdominal)',
    verificationMethodEn: 'Document date of last depot injection from medical records or treating clinic.',
    verificationMethodEs: 'Documentar la fecha de la última inyección de depósito en el historial clínico o clínica tratante.',
    bridgeStrategyEn: 'OPTIMAL REENTRY REGIMEN: Administer depot injection 7–14 days prior to release. Provides sustained therapeutic plasma levels for 28–42+ days, eliminating immediate post-release pharmacy barriers.',
    bridgeStrategyEs: 'RÉGIMEN ÓPTIMO DE REINGRESO: Inyectar el depósito 7-14 días antes de la excarcelación. Asegura niveles terapéuticos sostenidos durante 28-42+ días eliminando barreras de farmacia.',
  }),

  naltrexone_depot: Object.freeze({
    id: 'naltrexone_depot',
    nameEn: 'Extended-Release Injectable Naltrexone (Vivitrol)',
    nameEs: 'Naltrexona Inyectable de Depósito (Vivitrol)',
    defaultDose: '380 mg IM Monthly (Gluteal)',
    formulationEn: 'Intramuscular Suspension Depot',
    formulationEs: 'Suspensión Intramuscular de Depósito',
    verificationMethodEn: 'Confirm opioid-free period (7–14 days) with negative toxicology or naloxone challenge prior to administration.',
    verificationMethodEs: 'Confirmar periodo libre de opioides (7-14 días) con prueba de orina negativa o test de naloxona antes de inyectar.',
    bridgeStrategyEn: 'PATIENT-CHOICE ONLY: Must NEVER be mandated or coerced. Patient must be educated on loss of opioid tolerance and extreme overdose risk if opioid use resumes after depot clears.',
    bridgeStrategyEs: 'SOLO POR ELECCIÓN VOLUNTARIA DEL PACIENTE: Jamás imponer de forma coactiva. Explicar la pérdida de tolerancia y el riesgo extremo de sobredosis si recae tras el mes.',
  }),
});

export const CARCERAL_STAGES = Object.freeze({
  s0_booking: Object.freeze({
    id: 's0_booking',
    nameEn: 'S0: Booking & Intake Triage',
    nameEs: 'S0: Ingreso en Prisión y Triaje',
    tasksEn: [
      'Screen for Opioid Use Disorder (DSM-5 criteria) within 2 hours of arrest.',
      'Identify pre-arrest community MOUD regimen and OTP clinic / prescriber name.',
      'Check state Prescription Drug Monitoring Program (PDMP).',
      'Initiate Clinical Opiate Withdrawal Scale (COWS) baseline score.'
    ],
    tasksEs: [
      'Cribado de Trastorno por Uso de Opioides (DSM-5) en las primeras 2 horas.',
      'Identificar tratamiento MOUD previo al arresto y nombre de clínica OTP o médico.',
      'Consultar el sistema estatal de monitoreo de recetas (PDMP).',
      'Registrar puntuación basal de la Escala Clínica de Abstinencia Opiácea (COWS).'
    ],
  }),

  s1_verification: Object.freeze({
    id: 's1_verification',
    nameEn: 'S1: OTP / OBOT Verification (4-Hour Window)',
    nameEs: 'S1: Verificación con Clínica OTP / OBOT (Plazo 4 Horas)',
    tasksEn: [
      'Contact community OTP clinic or prescriber to confirm exact dose and last witnessed ingestion time.',
      'If verification is delayed >4 hours: Initiate emergency bridge dosing under DEA 21 CFR § 1306.07(b) (72-hour rule) and supportive comfort medications (Clonidine 0.1-0.2mg q6h, Ondansetron).',
      'MANDATORY INVARIANT: Forced withdrawal, rapid non-consensual tapers, and cold-turkey detoxification are UNLAWFUL under Title II of the ADA.'
    ],
    tasksEs: [
      'Contactar a la clínica OTP o prescriptor para confirmar dosis exacta y última toma presenciada.',
      'Si la verificación se retrasa >4 horas: Iniciar dosis puente de emergencia según DEA 21 CFR § 1306.07(b) (regla de 72h) y medicación de confort (Clonidina, Ondansetrón).',
      'REGLA ESTRICTA: La desintoxicación forzada y la supresión involuntaria de MOUD son ILEGALES bajo el Título II de la Ley ADA.'
    ],
  }),

  s2_maintenance: Object.freeze({
    id: 's2_maintenance',
    nameEn: 'S2: Active In-Custody Maintenance',
    nameEs: 'S2: Mantenimiento Activo Durante la Custodia',
    tasksEn: [
      'Provide daily witnessed administration of verified MOUD dose without arbitrary caps.',
      'Enforce zero disciplinary revocation: MOUD access cannot be revoked or withheld as punishment for rule infractions.',
      'For unmedicated individuals with OUD: Offer evaluation for in-custody initiation of Methadone, Buprenorphine, or Vivitrol.'
    ],
    tasksEs: [
      'Administración diaria presenciada de la dosis de MOUD verificada sin límites arbitrarios.',
      'Prohibición de revocación disciplinaria: El acceso a MOUD jamás puede suspenderse como castigo penitenciario.',
      'En personas no tratadas con TUDO: Ofrecer evaluación e inicio de Metadona, Buprenorfina o Vivitrol en prisión.'
    ],
  }),

  s3_reentry_countdown: Object.freeze({
    id: 's3_reentry_countdown',
    nameEn: 'S3: Reentry Countdown (30 to 90 Days Pre-Release)',
    nameEs: 'S3: Cuenta Regresiva de Reingreso (30 a 90 Días antes de la Salida)',
    tasksEn: [
      'Activate Section 1115 Medicaid Reentry Demonstration waiver enrollment to restore active coverage on release day.',
      'Assign a community-based Case Manager, Peer Recovery Specialist, or Navigator >=30 days prior to release.',
      'Consider transitioning to extended-release depot buprenorphine (Sublocade/Brixadi) 7-14 days prior to release for 28-day continuous protection.'
    ],
    tasksEs: [
      'Tramitar la reactivación de Medicaid (exención Sección 1115) para que esté activa el día del egreso.',
      'Asignar un gestor de casos o especialista par comunitario con al menos 30 días de antelación.',
      'Valorar la transición a buprenorfina de depósito (Sublocade/Brixadi) 7-14 días antes del egreso para protección continua de 28 días.'
    ],
  }),

  s4_discharge_prep: Object.freeze({
    id: 's4_discharge_prep',
    nameEn: 'S4: Discharge Logistics & Overdose Prevention Preparation',
    nameEs: 'S4: Logística de Egreso y Preparación Anti-Sobredosis',
    tasksEn: [
      'Confirm scheduled community OTP or FQHC/OBOT appointment within 24 to 48 hours post-release.',
      'Prepare 30-day bridge prescription or medication-in-hand.',
      'Assemble Overdose Prevention Naloxone Exit Kit (minimum 2 doses intranasal naloxone, fentanyl/xylazine test strips, CPR shield, harm reduction directory).'
    ],
    tasksEs: [
      'Confirmar cita programada en centro de salud comunitario o clínica OTP dentro de las 24-48 horas posteriores a la salida.',
      'Preparar receta electrónica puente de 30 días o medicación en mano.',
      'Montar el Kit de Prevención de Sobredosis (mínimo 2 dosis de naloxona nasal, tiras reactivas de fentanilo/xilacina, mascarilla RCP y directorio).'
    ],
  }),

  s5_gate_release: Object.freeze({
    id: 's5_gate_release',
    nameEn: 'S5: Gate Release & Warm Community Handoff',
    nameEs: 'S5: Salida por Puerta y Derivación Activa Comunitaria',
    tasksEn: [
      'Hand-to-hand delivery of Overdose Prevention Naloxone Kit directly to the individual upon exit.',
      'Deliver 30-day bridge medication or verified e-prescription confirmation.',
      'Peer Specialist or family meeting individual at the facility gate for transportation to initial clinic or pharmacy.',
      'Immediate zero-trace volatile RAM purge: Zero identifying data retained.'
    ],
    tasksEs: [
      'Entrega en mano del Kit de Naloxona contra Sobredosis directamente a la persona al cruzar la puerta.',
      'Entrega de la medicación puente de 30 días o confirmación de receta electrónica.',
      'Acompañamiento par o familiar en la puerta de salida para traslado directo a la clínica o farmacia comunitaria.',
      'Purga inmediata en memoria RAM: Cero retención de datos identificativos.'
    ],
  }),
});

// ============================================================================
// EVALUATION ENGINE (PURE FUNCTION)
// ============================================================================

/**
 * Pure evaluation function for carceral MOUD continuity, Title II ADA compliance,
 * Section 1115 Medicaid enrollment, and 30-day reentry overdose protection.
 * @param {Object} input
 * @param {string} [input.regimenId='buprenorphine_sl'] - Key from CARCERAL_MOUD_REGIMENS
 * @param {string} [input.currentStage='s3_reentry_countdown'] - Key from CARCERAL_STAGES
 * @param {number} [input.daysUntilRelease=21] - Days until projected release gate
 * @param {boolean} [input.medicaidReactivated=true] - Section 1115 Medicaid enrollment submitted
 * @param {boolean} [input.communityAppointmentConfirmed=true] - Appointment within 24-48h confirmed
 * @param {boolean} [input.bridgeMedicationSupplied=true] - 30-day bridge prescription/supply secured
 * @param {boolean} [input.naloxoneKitDispensed=true] - Overdose exit kit assembled
 * @param {string} [input.anonymousId='REENTRY-PASS-4412'] - Client anonymous token (zero PII)
 * @returns {Object} Comprehensive evaluation output
 */
export function evaluateCarceralReentryPlan(input = {}) {
  const regimenId = CARCERAL_MOUD_REGIMENS[input.regimenId] ? input.regimenId : 'buprenorphine_sl';
  const regimen = CARCERAL_MOUD_REGIMENS[regimenId];

  const currentStage = CARCERAL_STAGES[input.currentStage] ? input.currentStage : 's3_reentry_countdown';
  const stage = CARCERAL_STAGES[currentStage];

  const daysUntilRelease = Math.max(0, Number(input.daysUntilRelease) || 0);
  const medicaidReactivated = Boolean(input.medicaidReactivated);
  const communityAppointmentConfirmed = Boolean(input.communityAppointmentConfirmed);
  const bridgeMedicationSupplied = Boolean(input.bridgeMedicationSupplied);
  const naloxoneKitDispensed = Boolean(input.naloxoneKitDispensed);
  const anonymousId = String(input.anonymousId || 'REENTRY-PASS-4412').trim();

  // Reentry Readiness Scoring (0 to 4 Pillars)
  let readinessScore = 0;
  if (medicaidReactivated) readinessScore += 1;
  if (communityAppointmentConfirmed) readinessScore += 1;
  if (bridgeMedicationSupplied) readinessScore += 1;
  if (naloxoneKitDispensed) readinessScore += 1;

  const isFullyPrepared = readinessScore === 4;

  const alertsEn = [];
  const alertsEs = [];

  // Critical Reentry Gap Alerts
  if (daysUntilRelease <= 14 && !bridgeMedicationSupplied) {
    alertsEn.push('CRITICAL MOUD GAP: Release in <=14 days without confirmed 30-day bridge medication. Extreme risk of acute withdrawal and fatal overdose within 48h of release.');
    alertsEs.push('VACÍO CRÍTICO DE MOUD: Salida en <=14 días sin medicación puente de 30 días. Riesgo extremo de abstinencia y sobredosis fatal en las primeras 48h.');
  }

  if (daysUntilRelease <= 14 && !communityAppointmentConfirmed) {
    alertsEn.push('UNCONFIRMED CLINIC HANDOFF: Community OTP or OBOT appointment not scheduled within 24-48 hours. Secure immediate intake appointment.');
    alertsEs.push('DERIVACIÓN NO CONFIRMADA: Cita comunitaria en clínica OTP o FQHC no agendada dentro de 24-48 horas. Agendar cita inmediata.');
  }

  if (daysUntilRelease <= 7 && !naloxoneKitDispensed) {
    alertsEn.push('OVERDOSE PREVENTION KIT MISSING: Direct hand-to-hand naloxone dispensing at the facility gate is mandated prior to exit.');
    alertsEs.push('FALTA KIT DE NALOXONA: Es obligatorio entregar en mano el kit de naloxona en la puerta de salida.');
  }

  // Legal Title II ADA Clause
  const legalClauseEn = 'NOTICE OF TITLE II ADA PROTECTIONS: Opioid Use Disorder is a protected disability under Title II of the Americans with Disabilities Act (42 U.S.C. § 12131) and Section 504 of the Rehabilitation Act. Correctional policies that enforce forced withdrawal, arbitrary dose capping, or deny FDA-approved MOUD constitute unlawful federal discrimination under 2022–2024 DOJ Civil Rights Decrees.';
  const legalClauseEs = 'AVISO DE DERECHOS BAJO EL TÍTULO II DE LA LEY ADA: El Trastorno por Uso de Opioides es una discapacidad protegida bajo el Título II de la Ley para Estadounidenses con Discapacidades (42 U.S.C. § 12131). Las políticas penitenciarias que imponen abstinencia forzada, límites de dosis o niegan medicamentos MOUD aprobados por la FDA constituyen discriminación federal ilegal según decretos del Departamento de Justicia (DOJ).';

  // SBAR Clinical Handoff Note
  const sbarEn = [
    `[S] SITUATION: Carceral intake and reentry care transition for individual with Opioid Use Disorder. Regimen: ${regimen.nameEn}. Stage: ${stage.nameEn} (Days to release: ${daysUntilRelease}).`,
    `[B] BACKGROUND: Anonymous Ref: ${anonymousId}. Baseline MOUD: ${regimen.defaultDose} (${regimen.formulationEn}). Post-Release Overdose Risk: 40x to 129x higher mortality in Days 1-14 post-release due to tolerance reset.`,
    `[A] ASSESSMENT: Reentry Preparedness: ${readinessScore}/4 Pillars verified (${isFullyPrepared ? 'FULLY PREPARED FOR SAFE COMMUNITY TRANSITION' : 'GAPS IDENTIFIED'}).`,
    `  • Section 1115 Medicaid Reactivation: ${medicaidReactivated ? 'Active on Release Day' : 'PENDING ENROLLMENT'}`,
    `  • Community Appointment: ${communityAppointmentConfirmed ? 'Confirmed within 24-48h post-release' : 'NOT SCHEDULED - HIGH RISK'}`,
    `  • 30-Day Bridge Supply: ${bridgeMedicationSupplied ? 'Secured in-hand / e-Rx' : 'CRITICAL DEFICIT'}`,
    `  • Naloxone Gate Exit Kit: ${naloxoneKitDispensed ? 'Assembled with 2 doses & test strips' : 'REQUIRED AT DISCHARGE'}`,
    ...(alertsEn.length > 0 ? [`  • Critical Reentry Alerts: ${alertsEn.join('; ')}`] : []),
    `  • Statutory Protection: ${legalClauseEn}`,
    `[R] RECOMMENDATION: Complete all 4 reentry pillars prior to gate exit. Maintain uninterrupted daily ${regimen.nameEn}. Handoff Overdose Prevention Kit directly into patient's hands upon discharge. Under Title II of the ADA, MOUD cannot be terminated or disciplined.`,
  ].join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Transición de cuidados y reingreso comunitario para persona con Trastorno por Uso de Opioides. Régimen: ${regimen.nameEs}. Etapa: ${stage.nameEs} (Días para la salida: ${daysUntilRelease}).`,
    `[B] ANTECEDENTES: Ref. Anónima: ${anonymousId}. MOUD de Base: ${regimen.defaultDose} (${regimen.formulationEs}). Riesgo de Sobredosis al Egreso: Mortalidad 40x a 129x mayor en días 1-14 por pérdida de tolerancia.`,
    `[A] EVALUACIÓN: Preparación de Reingreso: ${readinessScore}/4 Pilares completados (${isFullyPrepared ? 'COMPLETAMENTE PREPARADO PARA TRANSICIÓN SEGURA' : 'BRECHAS IDENTIFICADAS'}).`,
    `  • Reactivación Medicaid Sección 1115: ${medicaidReactivated ? 'Activa el Día de Salida' : 'PENDIENTE DE TRÁMITE'}`,
    `  • Cita Médica Comunitaria: ${communityAppointmentConfirmed ? 'Confirmada dentro de 24-48h' : 'NO PROGRAMADA - RIESGO ALTO'}`,
    `  • Suministro Puente de 30 Días: ${bridgeMedicationSupplied ? 'Asegurado en mano / receta electrónica' : 'DÉFICIT CRÍTICO'}`,
    `  • Kit de Naloxona en Puerta: ${naloxoneKitDispensed ? 'Listo con 2 dosis y tiras reactivas' : 'OBLIGATORIO AL EGRESO'}`,
    ...(alertsEs.length > 0 ? [`  • Alertas Críticas de Salida: ${alertsEs.join('; ')}`] : []),
    `  • Marco Legal Obligatorio: ${legalClauseEs}`,
    `[R] RECOMENDACIÓN: Completar los 4 pilares antes de cruzar la puerta de salida. Mantener ininterrumpidamente ${regimen.nameEs}. Entregar el Kit de Naloxona en mano al egreso. Bajo el Título II de la Ley ADA, el tratamiento MOUD no puede suspenderse ni sancionarse.`,
  ].join('\n');

  return {
    regimenId,
    regimen,
    currentStage,
    stage,
    daysUntilRelease,
    medicaidReactivated,
    communityAppointmentConfirmed,
    bridgeMedicationSupplied,
    naloxoneKitDispensed,
    anonymousId,
    readinessScore,
    isFullyPrepared,
    alertsEn,
    alertsEs,
    legalClauseEn,
    legalClauseEs,
    sbarEn,
    sbarEs,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const carceralState = {
  regimenId: 'buprenorphine_sl',
  currentStage: 's3_reentry_countdown',
  daysUntilRelease: 21,
  medicaidReactivated: true,
  communityAppointmentConfirmed: true,
  bridgeMedicationSupplied: true,
  naloxoneKitDispensed: true,
  anonymousId: 'REENTRY-PASS-4412',
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getCarceralReentryState() {
  return { ...carceralState };
}

export function setCarceralReentryState(patch) {
  Object.assign(carceralState, patch);
  notifyState();
}

export function resetCarceralReentryState() {
  Object.assign(carceralState, {
    regimenId: 'buprenorphine_sl',
    currentStage: 's3_reentry_countdown',
    daysUntilRelease: 21,
    medicaidReactivated: true,
    communityAppointmentConfirmed: true,
    bridgeMedicationSupplied: true,
    naloxoneKitDispensed: true,
    anonymousId: 'REENTRY-PASS-4412',
    copied: false,
  });
  notifyState();
}

export function subscribeCarceralReentryState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// DOM VIEW IMPLEMENTATION (ZERO INNERHTML / ZERO INLINE STYLES)
// ============================================================================

export function carceralMoudReentryView() {
  const container = h('div', { class: 'carceral-reentry-view', role: 'region', 'aria-label': 'Carceral Intake & Reentry MOUD Continuity Navigator' });
  const isEs = getLang() === 'es';
  const initialEval = evaluateCarceralReentryPlan({
    regimenId: carceralState.regimenId,
    currentStage: carceralState.currentStage,
    daysUntilRelease: carceralState.daysUntilRelease,
    medicaidReactivated: carceralState.medicaidReactivated,
    communityAppointmentConfirmed: carceralState.communityAppointmentConfirmed,
    bridgeMedicationSupplied: carceralState.bridgeMedicationSupplied,
    naloxoneKitDispensed: carceralState.naloxoneKitDispensed,
    anonymousId: carceralState.anonymousId,
  });

  // Static Header & Banners
  container.append(
    pageHeader(
      isEs ? 'Continuidad de MOUD en Prisión y Navegador de Reingreso Comunitario Seguro' : 'Carceral Intake & Reentry MOUD Continuity & Overdose Prevention Directives',
      isEs ? 'Guía estatutaria y clínica para proteger la continuidad de MOUD desde el ingreso en prisión hasta la salida comunitaria: decretos del Título II de la Ley ADA, exención de Medicaid Sección 1115 y prevención del pico de sobredosis mortal (40x-129x en días 1-14).' : 'Statutory and clinical workflow protecting MOUD continuation from carceral booking to community reentry: DOJ Title II ADA settlements, Section 1115 Medicaid waivers, and prevention of the lethal 40x–129x post-release overdose spike.'
    ),
    h('div', { class: 'carceral-legal-banner', role: 'note' },
      h('div', { class: 'carceral-banner-header' },
        icon('shield'),
        h('strong', null, isEs ? 'Marco Legal Obligatorio: Título II de la Ley ADA y Decretos del DOJ (2022–2024)' : 'Statutory Mandate: Title II Americans with Disabilities Act & DOJ Enforcement (2022–2024)')
      ),
      h('p', null, isEs ? initialEval.legalClauseEs : initialEval.legalClauseEn)
    ),
    h('div', { class: 'carceral-spike-banner', role: 'alert' },
      h('div', { class: 'carceral-banner-header' },
        icon('alert-triangle'),
        h('strong', null, isEs ? '¡ALERTA EPIDEMIOLÓGICA CRÍTICA: PICO DE SOBREDOSIS TRAS LA EXCARCELACIÓN!' : 'CRITICAL EPIDEMIOLOGICAL ALERT: POST-RELEASE OVERDOSE SPIKE!')
      ),
      h('p', null, isEs
        ? 'En las primeras 2 semanas tras salir de prisión, el riesgo de sobredosis mortal es entre 40 y 129 veces mayor que en la población general debido a la pérdida de tolerancia. Mantener MOUD reduce la mortalidad en un 85%.'
        : 'In the first 2 weeks post-release, formerly incarcerated individuals experience a 40x to 129x higher fatal overdose rate than the general population due to rapid loss of tolerance. Maintaining MOUD in custody reduces post-release fatal overdose by 85%.')
    )
  );

  const grid = h('div', { class: 'carceral-grid' });
  const leftCol = h('div', { class: 'carceral-col' });
  const rightCol = h('div', { class: 'carceral-col' });
  grid.append(leftCol, rightCol);
  container.append(grid);

  // Persistent controls (never rebuilt on keystroke)
  const stageSelect = h('select', { id: 'stage-select', class: 'carceral-select' },
    Object.keys(CARCERAL_STAGES).map((k) => {
      const item = CARCERAL_STAGES[k];
      return h('option', { value: k, selected: carceralState.currentStage === k }, isEs ? item.nameEs : item.nameEn);
    })
  );
  stageSelect.addEventListener('change', (e) => setCarceralReentryState({ currentStage: e.target.value }));
  const stageTaskList = h('ul', { class: 'carceral-task-list' });
  leftCol.append(
    h('div', { class: 'card carceral-card' },
      h('h2', { class: 'carceral-card-title' },
        icon('git-commit'),
        isEs ? '1. Etapa en el Circuito Penitenciario' : '1. Correctional Facility State Machine Stage'
      ),
      h('label', { for: 'stage-select', class: 'carceral-label' },
        isEs ? 'Seleccione la fase actual de la persona:' : 'Select current stage of incarceration:'
      ),
      stageSelect,
      stageTaskList
    )
  );

  const regSelect = h('select', { id: 'regimen-select', class: 'carceral-select' },
    Object.keys(CARCERAL_MOUD_REGIMENS).map((k) => {
      const item = CARCERAL_MOUD_REGIMENS[k];
      return h('option', { value: k, selected: carceralState.regimenId === k }, isEs ? item.nameEs : item.nameEn);
    })
  );
  regSelect.addEventListener('change', (e) => setCarceralReentryState({ regimenId: e.target.value }));
  const regDetailsSlot = h('div', { class: 'carceral-reg-details' });
  leftCol.append(
    h('div', { class: 'card carceral-card' },
      h('h2', { class: 'carceral-card-title' },
        icon('activity'),
        isEs ? '2. Régimen MOUD Establecido' : '2. Established MOUD Regimen'
      ),
      h('label', { for: 'regimen-select', class: 'carceral-label' },
        isEs ? 'Seleccione el medicamento para el TUDO:' : 'Select FDA-approved MOUD formulation:'
      ),
      regSelect,
      regDetailsSlot
    )
  );

  // Right column: Pillar Card with persistent #days-input & checkboxes + dynamic SBAR card
  const readinessBadge = h('span', { class: 'carceral-badge' });
  const daysInput = h('input', {
    id: 'days-input',
    type: 'number',
    class: 'carceral-days-input',
    value: String(carceralState.daysUntilRelease),
    min: '0',
    max: '365',
    'aria-label': isEs ? 'Días para la salida' : 'Days until release',
  });
  daysInput.addEventListener('input', (e) => setCarceralReentryState({ daysUntilRelease: Number(e.target.value) || 0 }));

  const pillarConfigs = [
    { id: 'p1-medicaid', key: 'medicaidReactivated', label: isEs ? 'Pilar 1: Exención Medicaid Sección 1115 (Reactivación activa el día de salida)' : 'Pillar 1: Section 1115 Medicaid Waiver (Active coverage restored on release day)' },
    { id: 'p2-appt', key: 'communityAppointmentConfirmed', label: isEs ? 'Pilar 2: Cita comunitaria en clínica OTP o FQHC agendada en 24-48 horas' : 'Pillar 2: Community OTP or FQHC/OBOT appointment scheduled within 24–48 hours' },
    { id: 'p3-bridge', key: 'bridgeMedicationSupplied', label: isEs ? 'Pilar 3: Suministro puente de 30 días de MOUD en mano o receta electrónica asegurada' : 'Pillar 3: 30-day bridge medication-in-hand or confirmed e-prescription' },
    { id: 'p4-naloxone', key: 'naloxoneKitDispensed', label: isEs ? 'Pilar 4: Kit de Naloxona contra sobredosis (mínimo 2 dosis y tiras reactivas) entregado en mano' : 'Pillar 4: Overdose Prevention Naloxone Kit (minimum 2 doses & test strips) handed at gate' },
  ];
  const pillarRows = pillarConfigs.map((cfg) => {
    const chk = h('input', { type: 'checkbox', id: cfg.id, checked: carceralState[cfg.key], 'aria-label': cfg.label });
    const row = h('div', { class: `carceral-pillar-row ${carceralState[cfg.key] ? 'pillar-complete' : 'pillar-pending'}` },
      chk,
      h('label', { for: cfg.id }, cfg.label)
    );
    chk.addEventListener('change', (e) => setCarceralReentryState({ [cfg.key]: e.target.checked }));
    return { cfg, chk, row };
  });

  const pillarCard = h('div', { class: 'card carceral-card' },
    h('div', { class: 'carceral-card-header-flex' },
      h('h2', { class: 'carceral-card-title' },
        icon('clipboard-check'),
        isEs ? '3. Los 4 Pilares de Salida Segura' : '3. The 4 Safe Reentry Pillars'
      ),
      readinessBadge
    ),
    h('div', { class: 'carceral-countdown-row' },
      h('label', { for: 'days-input', class: 'carceral-label' }, isEs ? 'Días Restantes para la Salida por Puerta:' : 'Days Until Projected Release Gate:'),
      daysInput
    ),
    h('div', { class: 'carceral-pillars-list' }, ...pillarRows.map((p) => p.row))
  );
  const sbarCardSlot = h('div');
  rightCol.append(pillarCard, sbarCardSlot);

  function syncControls() {
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    if (active !== stageSelect) stageSelect.value = carceralState.currentStage;
    if (active !== regSelect) regSelect.value = carceralState.regimenId;
    if (active !== daysInput) daysInput.value = String(carceralState.daysUntilRelease);
    pillarRows.forEach(({ cfg, chk, row }) => {
      const checked = Boolean(carceralState[cfg.key]);
      if (active !== chk) chk.checked = checked;
      row.className = `carceral-pillar-row ${checked ? 'pillar-complete' : 'pillar-pending'}`;
    });
  }

  function renderDynamic() {
    syncControls();
    const evaluation = evaluateCarceralReentryPlan({
      regimenId: carceralState.regimenId,
      currentStage: carceralState.currentStage,
      daysUntilRelease: carceralState.daysUntilRelease,
      medicaidReactivated: carceralState.medicaidReactivated,
      communityAppointmentConfirmed: carceralState.communityAppointmentConfirmed,
      bridgeMedicationSupplied: carceralState.bridgeMedicationSupplied,
      naloxoneKitDispensed: carceralState.naloxoneKitDispensed,
      anonymousId: carceralState.anonymousId,
    });

    clear(stageTaskList);
    stageTaskList.append(...(isEs ? evaluation.stage.tasksEs : evaluation.stage.tasksEn).map((task) => h('li', null, icon('check'), task)));

    clear(regDetailsSlot);
    regDetailsSlot.append(
      h('p', null, h('strong', null, isEs ? 'Dosis Estándar: ' : 'Standard Dosing: '), evaluation.regimen.defaultDose),
      h('p', null, h('strong', null, isEs ? 'Verificación al Ingreso: ' : 'Booking Verification: '), isEs ? evaluation.regimen.verificationMethodEs : evaluation.regimen.verificationMethodEn),
      h('p', { class: 'carceral-bridge-tip' }, h('strong', null, isEs ? 'Estrategia de Salida: ' : 'Reentry Strategy: '), isEs ? evaluation.regimen.bridgeStrategyEs : evaluation.regimen.bridgeStrategyEn)
    );

    readinessBadge.className = `carceral-badge badge-${evaluation.readinessScore === 4 ? 'success' : 'warning'}`;
    readinessBadge.textContent = `${evaluation.readinessScore} / 4 ${isEs ? 'Pilares Verificados' : 'Pillars Verified'}`;

    clear(sbarCardSlot);
    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-primary',
      'aria-label': isEs ? 'Copiar Nota SBAR' : 'Copy SBAR Note',
    }, icon('copy'), isEs ? (carceralState.copied ? '¡Copiado!' : 'Copiar Nota SBAR') : (carceralState.copied ? 'Copied!' : 'Copy SBAR Note'));
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(isEs ? evaluation.sbarEs : evaluation.sbarEn);
        setCarceralReentryState({ copied: true });
        announce(isEs ? 'Nota SBAR copiada' : 'SBAR note copied');
        setTimeout(() => setCarceralReentryState({ copied: false }), 2500);
      } catch {
        announce(isEs ? 'Error al copiar' : 'Failed to copy');
      }
    });

    const resetBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      'aria-label': isEs ? 'Restablecer' : 'Reset Form',
    }, icon('rotate-ccw'), isEs ? 'Restablecer' : 'Reset');
    resetBtn.addEventListener('click', () => {
      resetCarceralReentryState();
      announce(isEs ? 'Valores restablecidos' : 'State reset');
    });

    sbarCardSlot.append(
      h('div', { class: 'card carceral-card' },
        h('h2', { class: 'carceral-card-title' },
          icon('file-text'),
          isEs ? '4. Nota de Continuidad SBAR para la Clínica Comunitaria' : '4. SBAR Continuity of Care & Reentry Handoff Note'
        ),
        h('textarea', {
          class: 'carceral-sbar-textarea',
          readonly: true,
          rows: 9,
          'aria-label': isEs ? 'Nota SBAR de Reingreso' : 'Reentry SBAR Note',
        }, isEs ? evaluation.sbarEs : evaluation.sbarEn),
        h('div', { class: 'carceral-btn-row' }, copyBtn, resetBtn)
      )
    );
  }

  let wasConnected = false;
  const onStateChange = () => {
    wasConnected = wasConnected || Boolean(container.isConnected);
    if (wasConnected && container.isConnected === false) {
      unsubscribe();
      return;
    }
    renderDynamic();
  };

  const unsubscribe = subscribeCarceralReentryState(onStateChange);
  renderDynamic();
  return container;
}
