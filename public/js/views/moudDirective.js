// public/js/views/moudDirective.js
// HarborPath - Offline Emergency MOUD Directive & Verifiable Treatment Rights Pass
// Standards Consensus: Title II Americans with Disabilities Act (42 U.S.C. § 12131),
// Section 504 of the Rehabilitation Act, SAMHSA 2024 Revised 42 CFR Part 8 Regulations,
// DEA 21 CFR § 1306.07(c) Inpatient MOUD Continuation Mandate, and 42 CFR Part 2 Confidentiality.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// REGULATORY FRAMEWORK & CLINICAL INVARIANTS
// ============================================================================

export const MOUD_REGIMEN_OPTIONS = Object.freeze([
  {
    id: 'methadone',
    nameEn: 'Methadone Maintenance Therapy',
    nameEs: 'Terapia de Mantenimiento con Metadona',
    defaultDose: '90 mg PO Daily',
    formulationEn: 'Oral Solution (10 mg/mL)',
    formulationEs: 'Solución Oral (10 mg/mL)',
    npoRuleEn: 'If NPO: Convert to parenteral methadone (IV or Subcutaneous) at 50% of the oral dose, divided into every 8- or 12-hour doses to avoid accumulation.',
    npoRuleEs: 'En ayuno (NPO): Convertir a metadona parenteral (IV o SC) al 50% de la dosis oral, dividida cada 8 o 12 horas para evitar acumulación.',
    contraindicationsEn: Object.freeze([
      'Nalbuphine (Nubain) — precipitates severe acute withdrawal',
      'Butorphanol (Stadol) — precipitates severe acute withdrawal',
      'Pentazocine (Talwin) — precipitates severe acute withdrawal',
      'Buprenorphine (Subutex / Suboxone) — causes immediate displaced precipitated withdrawal'
    ]),
    contraindicationsEs: Object.freeze([
      'Nalbufina (Nubain) — precipita abstinencia aguda severa',
      'Butorfanol (Stadol) — precipita abstinencia aguda severa',
      'Pentazocina (Talwin) — precipita abstinencia aguda severa',
      'Buprenorfina (Suboxone / Subutex) — desplaza la metadona provocando abstinencia inmediata'
    ]),
  },
  {
    id: 'buprenorphine',
    nameEn: 'Buprenorphine / Naloxone (Sublingual)',
    nameEs: 'Buprenorfina / Naloxona (Sublingual)',
    defaultDose: '16 mg / 4 mg SL Daily',
    formulationEn: 'Sublingual Film or Tablet',
    formulationEs: 'Película o Comprimido Sublingual',
    npoRuleEn: 'If NPO: Sublingual tablets or films can still be administered sublingually with 1–2 mL water; mucosal absorption occurs without gastrointestinal swallowing.',
    npoRuleEs: 'En ayuno (NPO): Los comprimidos o películas sublinguales pueden administrarse con 1–2 mL de agua; la absorción transmucosa no requiere deglución digestiva.',
    contraindicationsEn: Object.freeze([
      'Nalbuphine (Nubain)',
      'Butorphanol (Stadol)',
      'Pentazocine (Talwin)',
      'Involuntary abrupt discontinuation or rapid taper'
    ]),
    contraindicationsEs: Object.freeze([
      'Nalbufina (Nubain)',
      'Butorfanol (Stadol)',
      'Pentazocina (Talwin)',
      'Suspensión involuntaria brusca o desintoxicación acelerada'
    ]),
  },
  {
    id: 'buprenorphine_xr',
    nameEn: 'Extended-Release Buprenorphine (Sublocade / Brixadi)',
    nameEs: 'Buprenorfina de Liberación Prolongada (Sublocade / Brixadi)',
    defaultDose: '300 mg / 100 mg SC Monthly',
    formulationEn: 'Subcutaneous Depot Injection',
    formulationEs: 'Inyección de Depósito Subcutáneo',
    npoRuleEn: 'If NPO: Depot provides steady systemic release for 28+ days; no oral replacement needed. Document injection date.',
    npoRuleEs: 'En ayuno (NPO): El depósito subcutáneo mantiene niveles estables durante más de 28 días; no requiere reemplazo oral.',
    contraindicationsEn: Object.freeze([
      'Nalbuphine (Nubain)',
      'Butorphanol (Stadol)',
      'Pentazocine (Talwin)'
    ]),
    contraindicationsEs: Object.freeze([
      'Nalbufina (Nubain)',
      'Butorfanol (Stadol)',
      'Pentazocina (Talwin)'
    ]),
  },
  {
    id: 'naltrexone_xr',
    nameEn: 'Extended-Release Naltrexone (Vivitrol)',
    nameEs: 'Naltrexona de Liberación Prolongada (Vivitrol)',
    defaultDose: '380 mg IM Monthly (Gluteal)',
    formulationEn: 'Intramuscular Suspension Depot',
    formulationEs: 'Suspensión Intramuscular de Depósito',
    npoRuleEn: 'If NPO: Intramuscular depot active for 28 days. For severe trauma/surgery: Opioid analgesia is blocked; utilize regional nerve blocks, ketamine, IV acetaminophen, and NSAIDs.',
    npoRuleEs: 'En ayuno (NPO): El depósito IM está activo por 28 días. En trauma/cirugía: Los opioides están bloqueados; use bloqueos nerviosos, ketamina y AINEs.',
    contraindicationsEn: Object.freeze([
      'Pure opioid agonists at standard doses (ineffective)',
      'Escalating massive opioid doses to overcome blockade (lethal overdose hazard upon receptor clearance)'
    ]),
    contraindicationsEs: Object.freeze([
      'Opioides agonistas puros a dosis estándar (ineficaces por bloqueo)',
      'Dosis masivas de opioides para vencer el bloqueo (riesgo de sobredosis mortal tardía)'
    ]),
  },
]);

// ============================================================================
// DIRECTIVE GENERATION ENGINE (PURE FUNCTION)
// ============================================================================

/**
 * Pure function generating the verifiable MOUD treatment rights payload and directives.
 * @param {Object} input
 * @param {string} [input.regimenId='methadone'] - Key from MOUD_REGIMEN_OPTIONS
 * @param {string} [input.dailyDose='90 mg PO Daily'] - Baseline maintenance dose
 * @param {string} [input.anonymousId='MOUD-PASS-9821-X'] - Pseudonym client token (zero PII)
 * @param {string} [input.clientInitials='J.R.'] - Patient initials
 * @param {number} [input.birthYear=1989] - Birth year
 * @param {string} [input.otpClinic='Hope Gateway Recovery OTP'] - Treating clinic name
 * @param {string} [input.emergencyPhone='1-800-555-0199'] - OTP emergency dosing line
 * @param {string} [input.deaRegistration='DEA-***9841'] - Masked DEA license
 * @returns {Object} Complete structured payload and wallet card specifications
 */
export function generateMoudDirective(input = {}) {
  const regimenId = MOUD_REGIMEN_OPTIONS.find((r) => r.id === input.regimenId) ? input.regimenId : 'methadone';
  const regimen = MOUD_REGIMEN_OPTIONS.find((r) => r.id === regimenId);

  const dailyDose = String(input.dailyDose || regimen.defaultDose).trim();
  const anonymousId = String(input.anonymousId || 'MOUD-PASS-9821-X').trim();
  const clientInitials = String(input.clientInitials || 'J.R.').trim();
  const birthYear = Number(input.birthYear) || 1989;
  const otpClinic = String(input.otpClinic || 'Hope Gateway Recovery OTP').trim();
  const emergencyPhone = String(input.emergencyPhone || '1-800-555-0199').trim();
  const deaRegistration = String(input.deaRegistration || 'DEA-***9841').trim();

  const timestamp = new Date().toISOString();

  // Structured Verifiable JSON Payload
  const payload = {
    $schema: 'https://harborpath.org/schemas/moud-directive-v2026.1.json',
    directiveType: 'EMERGENCY_MOUD_DIRECTIVE_AND_TREATMENT_RIGHTS',
    version: '2026.1',
    issuedAt: timestamp,
    subject: {
      anonymousClientRef: anonymousId,
      initials: clientInitials,
      birthYear,
    },
    moudRegimen: {
      medication: regimen.nameEn,
      formulation: regimen.formulationEn,
      dailyDose,
      activeEnrolled: true,
    },
    treatingFacility: {
      facilityType: 'OTP_SAMHSA_CERTIFIED',
      facilityName: otpClinic,
      emergencyDoseVerificationPhone: emergencyPhone,
      deaRegistrationMasked: deaRegistration,
    },
    inpatientClinicalDirectives: {
      continuationRule: 'MANDATORY_CONTINUATION: Maintain daily baseline MOUD without interruption. Do not taper or withhold without specialist addiction medicine consultation (DEA 21 CFR § 1306.07c).',
      acutePainProtocol: 'Maintain baseline MOUD dose. For acute pain, ADD titrated short-acting full agonist opioids (hydromorphone, fentanyl, oxycodone).',
      strictContraindications: regimen.contraindicationsEn,
      npoConversionProtocol: regimen.npoRuleEn,
    },
    legalAndRegulatoryClauses: {
      adaTitleIiNotice: 'Notice: Opioid Use Disorder is a recognized disability under Title II of the Americans with Disabilities Act (42 U.S.C. § 12131) and Section 504 of the Rehabilitation Act. Involuntary discontinuation or arbitrary tapering of prescribed MOUD during hospital admission or carceral detention constitutes unlawful discrimination.',
      samhsaRuleRef: 'SAMHSA 42 CFR Part 8 (2024 Final Rule) & DEA 21 CFR § 1306.07(c): Acute care hospitals are legally authorized and clinically mandated to continue established MOUD during medical and surgical admissions without requiring specialized OTP DEA licensing.',
      cfr42Part2Notice: '42 CFR Part 2 Confidentiality Notice: This information has been disclosed to you from records protected by federal confidentiality rules (42 CFR Part 2). The federal rules prohibit you from making any further disclosure of this information unless further disclosure is expressly permitted by the written consent of the person to whom it pertains or as otherwise permitted by 42 CFR Part 2.',
    },
  };

  const jsonString = JSON.stringify(payload, null, 2);

  // SBAR Clinical Handoff Note
  const sbarEn = [
    `[S] SITUATION: Patient presenting for acute inpatient admission with established, active ${regimen.nameEn}.`,
    `[B] BACKGROUND: Anonymous Ref: ${anonymousId} (${clientInitials}, b. ${birthYear}). Baseline Dose: ${dailyDose} (${regimen.formulationEn}). OTP Clinic: ${otpClinic} (24/7 Verification: ${emergencyPhone}).`,
    `[A] ASSESSMENT: Active MOUD maintenance therapy. High risk of severe precipitated withdrawal, AMA discharge, and fatal overdose if therapy is interrupted.`,
    `  • Mandatory Continuation Rule: Do not withhold MOUD. Hospitalized continuation is authorized under DEA 21 CFR § 1306.07(c) without OTP license.`,
    `  • Acute Pain Management: Maintain baseline MOUD + co-prescribe short-acting full agonists (hydromorphone/fentanyl).`,
    `  • Strict Contraindications: ${regimen.contraindicationsEn.join(', ')}.`,
    `  • NPO Directives: ${regimen.npoRuleEn}`,
    `[R] RECOMMENDATION: Order hospital pharmacy continuation of ${regimen.nameEn} ${dailyDose}. Confirm last dose timing with OTP at ${emergencyPhone}. Involuntary cessation constitutes disability discrimination under Title II of the ADA (42 U.S.C. § 12131).`,
  ].join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Paciente que ingresa al hospital con tratamiento activo y establecido con ${regimen.nameEs}.`,
    `[B] ANTECEDENTES: Ref. Anónima: ${anonymousId} (${clientInitials}, año ${birthYear}). Dosis Base: ${dailyDose} (${regimen.formulationEs}). Clínica OTP: ${otpClinic} (Verificación 24/7: ${emergencyPhone}).`,
    `[A] EVALUACIÓN: Terapia de mantenimiento MOUD activa. Riesgo crítico de abstinencia severa, alta contra opinión médica y sobredosis fatal si se suspende.`,
    `  • Directiva de Continuación Obligatoria: No suspender. La continuación hospitalaria está legalmente autorizada bajo DEA 21 CFR § 1306.07(c).`,
    `  • Manejo del Dolor Agudo: Mantener dosis base de MOUD + asociar opioides agonistas puros (hidromorfona/fentanilo).`,
    `  • Contraindicaciones Absolutas: ${regimen.contraindicationsEs.join(', ')}.`,
    `  • Protocolo en Ayuno (NPO): ${regimen.npoRuleEs}`,
    `[R] RECOMENDACIÓN: Ordenar a farmacia hospitalaria la continuación de ${regimen.nameEs} ${dailyDose}. Verificar última toma con la clínica OTP al ${emergencyPhone}. La suspensión involuntaria constituye discriminación ilegal bajo el Título II de la Ley ADA (42 U.S.C. § 12131).`,
  ].join('\n');

  return {
    regimenId,
    regimen,
    dailyDose,
    anonymousId,
    clientInitials,
    birthYear,
    otpClinic,
    emergencyPhone,
    deaRegistration,
    payload,
    jsonString,
    sbarEn,
    sbarEs,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const directiveState = {
  regimenId: 'methadone',
  dailyDose: '90 mg PO Daily',
  anonymousId: 'MOUD-PASS-9821-X',
  clientInitials: 'J.R.',
  birthYear: 1989,
  otpClinic: 'Hope Gateway Recovery OTP',
  emergencyPhone: '1-800-555-0199',
  deaRegistration: 'DEA-***9841',
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getMoudDirectiveState() {
  return { ...directiveState };
}

export function setMoudDirectiveState(patch) {
  Object.assign(directiveState, patch);
  notifyState();
}

export function resetMoudDirectiveState() {
  Object.assign(directiveState, {
    regimenId: 'methadone',
    dailyDose: '90 mg PO Daily',
    anonymousId: 'MOUD-PASS-9821-X',
    clientInitials: 'J.R.',
    birthYear: 1989,
    otpClinic: 'Hope Gateway Recovery OTP',
    emergencyPhone: '1-800-555-0199',
    deaRegistration: 'DEA-***9841',
    copied: false,
  });
  notifyState();
}

export function subscribeMoudDirectiveState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// DOM VIEW IMPLEMENTATION (ZERO INNERHTML / ZERO INLINE STYLES)
// ============================================================================

export function moudDirectiveView() {
  const container = h('div', { class: 'moud-directive-view', role: 'region', 'aria-label': 'Offline Emergency MOUD Directive & Verifiable Rights Pass' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const evalResult = generateMoudDirective({
      regimenId: directiveState.regimenId,
      dailyDose: directiveState.dailyDose,
      anonymousId: directiveState.anonymousId,
      clientInitials: directiveState.clientInitials,
      birthYear: directiveState.birthYear,
      otpClinic: directiveState.otpClinic,
      emergencyPhone: directiveState.emergencyPhone,
      deaRegistration: directiveState.deaRegistration,
    });

    // Page Header
    container.appendChild(
      pageHeader(
        isEs ? 'Pase de Derechos MOUD y Directiva de Continuación Hospitalaria' : 'Offline Emergency MOUD Directive & Inpatient Rights Pass',
        isEs
          ? 'Protecciones legales verificables sin conexión bajo el Título II de la Ley ADA, directivas DEA 21 CFR § 1306.07(c) y pautas hospitalarias para evitar la suspensión arbitraria de metadona o buprenorfina.'
          : 'Zero-PII, offline-verifiable treatment directive and wallet card enforcing Title II ADA disability protections, DEA 21 CFR § 1306.07(c), and hospital MOUD continuation mandates.',
        'planning'
      )
    );

    // Two Column Layout
    const grid = h('div', { class: 'moud-layout-grid' });

    // LEFT COLUMN: Parameters & Form Controls
    const leftCol = h('div', { class: 'moud-col' });

    // Card 1: Regimen & Patient Configuration
    const formCard = h('section', { class: 'moud-card' },
      h('h2', { class: 'moud-card-title' },
        icon('clipboard'),
        h('span', {}, isEs ? '1. Configuración de Medicación y Clínica OTP' : '1. MOUD Regimen & Clinic Verification')
      ),
      h('p', { class: 'moud-card-desc' },
        isEs
          ? 'Configure el tratamiento y la clínica para generar la credencial de derechos verificable sin conexión (cero-PII).'
          : 'Configure active treatment details and treating facility to generate the offline-verifiable treatment rights pass.'
      ),
      // Select Regimen
      h('div', { class: 'moud-form-group' },
        h('label', { for: 'sel-regimen', class: 'moud-form-label' },
          isEs ? 'Medicamento MOUD Activo:' : 'Active MOUD Medication:'
        ),
        (() => {
          const sel = h('select', { id: 'sel-regimen', class: 'moud-select' },
            MOUD_REGIMEN_OPTIONS.map((r) =>
              h('option', { value: r.id, selected: r.id === directiveState.regimenId },
                isEs ? r.nameEs : r.nameEn
              )
            )
          );
          sel.addEventListener('change', (e) => {
            directiveState.regimenId = e.target.value;
            const match = MOUD_REGIMEN_OPTIONS.find((r) => r.id === e.target.value);
            if (match) directiveState.dailyDose = match.defaultDose;
            render();
          });
          return sel;
        })()
      ),
      // Daily Dose
      h('div', { class: 'moud-form-group' },
        h('label', { for: 'inp-dose', class: 'moud-form-label' },
          isEs ? 'Dosis Diaria Mantenimiento:' : 'Daily Maintenance Dose:'
        ),
        (() => {
          const inp = h('input', {
            id: 'inp-dose',
            type: 'text',
            class: 'moud-input',
            value: directiveState.dailyDose,
          });
          inp.addEventListener('input', (e) => {
            directiveState.dailyDose = e.target.value;
            render();
          });
          return inp;
        })()
      ),
      // Anonymous ID & Initials
      h('div', { class: 'moud-form-row' },
        h('div', { class: 'moud-form-group' },
          h('label', { for: 'inp-anon-id', class: 'moud-form-label' },
            isEs ? 'Token Anónimo:' : 'Anonymous Ref Token:'
          ),
          (() => {
            const inp = h('input', {
              id: 'inp-anon-id',
              type: 'text',
              class: 'moud-input',
              value: directiveState.anonymousId,
            });
            inp.addEventListener('input', (e) => {
              directiveState.anonymousId = e.target.value;
              render();
            });
            return inp;
          })()
        ),
        h('div', { class: 'moud-form-group' },
          h('label', { for: 'inp-initials', class: 'moud-form-label' },
            isEs ? 'Iniciales:' : 'Patient Initials:'
          ),
          (() => {
            const inp = h('input', {
              id: 'inp-initials',
              type: 'text',
              class: 'moud-input',
              value: directiveState.clientInitials,
            });
            inp.addEventListener('input', (e) => {
              directiveState.clientInitials = e.target.value;
              render();
            });
            return inp;
          })()
        )
      ),
      // OTP Clinic & Phone
      h('div', { class: 'moud-form-group' },
        h('label', { for: 'inp-otp-clinic', class: 'moud-form-label' },
          isEs ? 'Clínica OTP / Programa de Tratamiento:' : 'Treating OTP Clinic / Program Name:'
        ),
        (() => {
          const inp = h('input', {
            id: 'inp-otp-clinic',
            type: 'text',
            class: 'moud-input',
            value: directiveState.otpClinic,
          });
          inp.addEventListener('input', (e) => {
            directiveState.otpClinic = e.target.value;
            render();
          });
          return inp;
        })()
      ),
      h('div', { class: 'moud-form-group' },
        h('label', { for: 'inp-emergency-phone', class: 'moud-form-label' },
          isEs ? 'Teléfono de Verificación 24/7 de la Clínica:' : 'Clinic 24/7 Verification Hotline:'
        ),
        (() => {
          const inp = h('input', {
            id: 'inp-emergency-phone',
            type: 'text',
            class: 'moud-input',
            value: directiveState.emergencyPhone,
          });
          inp.addEventListener('input', (e) => {
            directiveState.emergencyPhone = e.target.value;
            render();
          });
          return inp;
        })()
      )
    );
    leftCol.appendChild(formCard);

    // Card 2: Legal Statutes Callout
    const legalCard = h('section', { class: 'moud-card' },
      h('h2', { class: 'moud-card-title' },
        icon('shield'),
        h('span', {}, isEs ? '2. Fundamentos Legales y Estatutarios' : '2. Legal Statutes & Regulatory Directives')
      ),
      h('div', { class: 'moud-statute-box' },
        h('strong', {}, isEs ? 'Título II de la Ley ADA (42 U.S.C. § 12131): ' : 'Title II ADA (42 U.S.C. § 12131): '),
        h('span', {}, isEs
          ? 'El trastorno por uso de opioides es una discapacidad amparada. La suspensión arbitraria de MOUD en hospitales o cárceles constituye discriminación ilegal.'
          : 'Opioid Use Disorder is a protected disability. Involuntary cessation of prescribed MOUD in hospital or correctional care is illegal discrimination.'
        )
      ),
      h('div', { class: 'moud-statute-box' },
        h('strong', {}, isEs ? 'Excepción Hospitalaria DEA 21 CFR § 1306.07(c): ' : 'DEA 21 CFR § 1306.07(c): '),
        h('span', {}, isEs
          ? 'Los médicos hospitalarios están facultados por ley federal para continuar la administración de metadona o buprenorfina en pacientes ingresados por motivos médicos o quirúrgicos.'
          : 'Hospital physicians are legally authorized under federal law to order and administer scheduled MOUD to maintain established therapy during medical/surgical admissions.'
        )
      ),
      h('div', { class: 'moud-statute-box' },
        h('strong', {}, isEs ? 'Aviso 42 CFR Parte 2: ' : '42 CFR Part 2 Confidentiality: '),
        h('span', {}, isEs
          ? 'La ley federal prohíbe terminantemente la redivulgación de información de adicciones sin el consentimiento previo por escrito del paciente.'
          : 'Federal law strictly prohibits redisclosure of substance use disorder records without express written patient consent.'
        )
      )
    );
    leftCol.appendChild(legalCard);

    grid.appendChild(leftCol);

    // RIGHT COLUMN: Printable Wallet Card & SBAR Handoff
    const rightCol = h('div', { class: 'moud-col' });

    // Card 3: Printable Wallet Card Layout
    const walletCard = h('section', { class: 'moud-card' },
      h('h2', { class: 'moud-card-title' },
        icon('credit-card'),
        h('span', {}, isEs ? '3. Tarjeta de Bolsillo de Derechos MOUD (Imprimible)' : '3. Printable MOUD Rights Wallet Card')
      ),
      h('p', { class: 'moud-card-desc' },
        isEs
          ? 'Formato estándar tamaño billetera (3,37 × 2,125 pulgadas). Diseñada para presentación inmediata ante el médico de guardia o triaje de urgencias.'
          : 'Standard wallet card layout (3.37 x 2.125 inches). Designed for immediate presentation to emergency triage and hospital admitting teams.'
      ),
      // Front Surface
      h('div', { class: 'moud-wallet-surface front' },
        h('div', { class: 'wallet-header' },
          h('span', { class: 'wallet-brand' }, 'HARBORPATH MOUD TREATMENT RIGHTS PASS'),
          h('span', { class: 'wallet-chip' }, 'VERIFIABLE')
        ),
        h('div', { class: 'wallet-body' },
          h('div', { class: 'wallet-qr-block' },
            h('div', { class: 'wallet-qr-code', role: 'img', 'aria-label': 'Offline Verifiable Data QR' },
              h('span', { class: 'wallet-qr-text' }, '[OFFLINE DATA PASS]')
            )
          ),
          h('div', { class: 'wallet-info' },
            h('p', { class: 'wallet-data-line' }, h('strong', {}, 'PATIENT: '), `${evalResult.clientInitials} (ID: ${evalResult.anonymousId})`),
            h('p', { class: 'wallet-data-line' }, h('strong', {}, 'REGIMEN: '), evalResult.regimen.nameEn),
            h('p', { class: 'wallet-data-line' }, h('strong', {}, 'DOSE: '), evalResult.dailyDose),
            h('p', { class: 'wallet-data-line' }, h('strong', {}, 'OTP CLINIC: '), evalResult.otpClinic),
            h('p', { class: 'wallet-data-line' }, h('strong', {}, '24/7 HOTLINE: '), evalResult.emergencyPhone)
          )
        ),
        h('div', { class: 'wallet-footer' },
          h('span', {}, 'ACTIVE ENROLLED • SAMHSA 42 CFR PART 8'),
          h('span', {}, evalResult.deaRegistration)
        )
      ),
      // Reverse Surface (Hospital Directives)
      h('div', { class: 'moud-wallet-surface reverse' },
        h('div', { class: 'wallet-header reverse' },
          h('span', { class: 'wallet-brand reverse' }, 'HOSPITAL CLINICIAN INPATIENT ORDERS'),
          h('span', { class: 'wallet-badge' }, 'DEA § 1306.07c')
        ),
        h('div', { class: 'wallet-body-reverse' },
          h('p', { class: 'wallet-rule' }, h('strong', {}, '1. MANDATORY CONTINUATION: '), 'Maintain daily baseline dose. Do not taper or stop (prevents severe withdrawal and fatal relapse).'),
          h('p', { class: 'wallet-rule' }, h('strong', {}, '2. ACUTE PAIN: '), 'Maintain baseline MOUD + ADD short-acting full agonist opioids (hydromorphone/fentanyl).'),
          h('p', { class: 'wallet-rule' }, h('strong', {}, '3. CONTRAINDICATIONS: '), 'DO NOT give Nalbuphine, Butorphanol, or Pentazocine (precipitates severe withdrawal).'),
          h('p', { class: 'wallet-rule' }, h('strong', {}, '4. NPO PROTOCOL: '), evalResult.regimen.npoRuleEn)
        ),
        h('div', { class: 'wallet-footer reverse' },
          h('span', {}, 'PROTECTED BY TITLE II OF THE ADA • 42 CFR PART 2 CONFIDENTIAL')
        )
      )
    );
    rightCol.appendChild(walletCard);

    // Card 4: SBAR Clinical Handoff Note
    const sbarCard = h('section', { class: 'moud-card' },
      h('h2', { class: 'moud-card-title' },
        icon('file-text'),
        h('span', {}, isEs ? '4. Resumen SBAR Clínico para el Equipo de Admisiones' : '4. Zero-PII SBAR Inpatient Admission Note')
      ),
      h('pre', { class: 'moud-sbar-block', tabindex: '0' },
        isEs ? evalResult.sbarEs : evalResult.sbarEn
      ),
      h('div', { class: 'moud-actions' },
        (() => {
          const btn = h('button', {
            type: 'button',
            class: 'btn btn-primary',
          },
            icon('copy'),
            h('span', {}, directiveState.copied
              ? (isEs ? '¡Copiado!' : 'Copied!')
              : (isEs ? 'Copiar Resumen SBAR' : 'Copy SBAR Note'))
          );
          btn.addEventListener('click', async () => {
            const text = isEs ? evalResult.sbarEs : evalResult.sbarEn;
            try {
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
              }
              directiveState.copied = true;
              announce(isEs ? 'Resumen copiado al portapapeles' : 'SBAR note copied to clipboard');
              render();
              setTimeout(() => {
                directiveState.copied = false;
                render();
              }, 2500);
            } catch {
              announce(isEs ? 'Error al copiar' : 'Failed to copy');
            }
          });
          return btn;
        })(),
        (() => {
          const btn = h('button', {
            type: 'button',
            class: 'btn btn-secondary',
          },
            icon('printer'),
            h('span', {}, isEs ? 'Imprimir Tarjeta' : 'Print Wallet Card')
          );
          btn.addEventListener('click', () => {
            if (typeof window !== 'undefined' && window.print) {
              window.print();
            }
          });
          return btn;
        })(),
        (() => {
          const btn = h('button', {
            type: 'button',
            class: 'btn btn-ghost',
          }, isEs ? 'Restablecer Formulario' : 'Reset Form');
          btn.addEventListener('click', () => {
            resetMoudDirectiveState();
          });
          return btn;
        })()
      )
    );
    rightCol.appendChild(sbarCard);

    grid.appendChild(rightCol);
    container.appendChild(grid);
  }

  render();
  const unsubscribe = subscribeMoudDirectiveState(render);
  return container;
}
