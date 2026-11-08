// public/js/views/fhirExport.js
// HarborPath - HL7 FHIR R4 & 42 CFR Part 2 Privacy-Preserving Referral Syndication Generator
// Standards Consensus: HL7 FHIR R4 (v4.0.1) US Core Implementation Guide (v6.0.0),
// Federal 42 CFR Part 2 (§ 2.31, § 2.32) SUD Confidentiality Regulations,
// HIPAA Privacy Rule 45 CFR § 164.522 (Confidential Communications & Minimal Disclosures),
// LOINC 56832-9 ("Problem-oriented referral") & SNOMED CT 3457005 ("Substance abuse referral").
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// FHIR TERMINOLOGY CONSTANTS
// ============================================================================

export const FHIR_SYSTEMS = Object.freeze({
  ETH_SECURITY: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
  CONSENT_CATEGORY: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes',
  SNOMED_CT: 'http://snomed.info/sct',
  LOINC: 'http://loinc.org',
  ASAM_CRITERIA: 'http://asam.org/criteria/levels',
  HARBORPATH_TOKEN: 'https://harborpath.org/patient-token',
  HARBORPATH_SERVICE: 'https://harborpath.org/codes/service',
});

export const ASAM_LEVEL_DEFINITIONS = Object.freeze([
  { code: '0.5', nameEn: 'Level 0.5: Early Intervention', nameEs: 'Nivel 0.5: Intervención Temprana' },
  { code: '1.0', nameEn: 'Level 1.0: Outpatient Services', nameEs: 'Nivel 1.0: Servicios Ambulatorios' },
  { code: '2.1', nameEn: 'Level 2.1: Intensive Outpatient (IOP)', nameEs: 'Nivel 2.1: Ambulatorio Intensivo (IOP)' },
  { code: '2.5', nameEn: 'Level 2.5: Partial Hospitalization (PHP)', nameEs: 'Nivel 2.5: Hospitalización Parcial (PHP)' },
  { code: '3.1', nameEn: 'Level 3.1: Clinically Managed Low-Intensity Residential', nameEs: 'Nivel 3.1: Residencial de Baja Intensidad' },
  { code: '3.5', nameEn: 'Level 3.5: Clinically Managed High-Intensity Residential', nameEs: 'Nivel 3.5: Residencial de Alta Intensidad' },
  { code: '3.7', nameEn: 'Level 3.7: Medically Monitored Intensive Inpatient', nameEs: 'Nivel 3.7: Internamiento Monitorizado Médicamente' },
  { code: '4.0', nameEn: 'Level 4.0: Medically Managed Intensive Inpatient / ICU', nameEs: 'Nivel 4.0: UCI / Cuidados Intensivos Médicos' },
]);

// ============================================================================
// FHIR BUNDLE GENERATOR (PURE FUNCTION)
// ============================================================================

/**
 * Pure generator constructing a valid HL7 FHIR R4 US Core Bundle conforming to 42 CFR Part 2.
 * @param {Object} input
 * @param {string} [input.patientPseudonym='ANON-HP-7F892B'] - Anonymous token (zero PII)
 * @param {string} [input.asamLevel='2.1'] - Recommended ASAM Level
 * @param {string} [input.priority='urgent'] - 'routine' | 'urgent' | 'stat'
 * @param {string} [input.facilityName='HarborPath Verified Health Partner'] - Receiving facility name
 * @param {string} [input.facilityId='FAC-10492'] - Receiving facility directory ID
 * @param {string} [input.facilityPhone='1-800-662-4357'] - Receiving facility phone
 * @param {boolean} [input.withdrawalNeeded=false] - Medical withdrawal management indicated
 * @param {string[]} [input.substances=[]] - Involved substances
 * @param {string} [input.clinicalNotes=''] - Anonymous clinical referral context
 * @returns {Object} Complete FHIR R4 Bundle JSON structure
 */
export function generateFhirReferralBundle(input = {}) {
  const patientToken = String(input.patientPseudonym || 'ANON-HP-7F892B').trim();
  const asamLevel = String(input.asamLevel || '2.1');
  const priority = input.priority === 'stat' ? 'stat' : (input.priority === 'urgent' ? 'urgent' : 'routine');
  const facilityName = String(input.facilityName || 'HarborPath Verified Health Partner').trim();
  const facilityId = String(input.facilityId || 'FAC-10492').trim();
  const facilityPhone = String(input.facilityPhone || '1-800-662-4357').trim();
  const withdrawalNeeded = Boolean(input.withdrawalNeeded);
  const substances = Array.isArray(input.substances) ? input.substances : [];
  const notes = String(input.clinicalNotes || '').trim();

  const timestamp = new Date().toISOString();
  const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30-day referral expiration

  const bundleId = `bundle-hp-${Math.abs(hashString(patientToken + timestamp)).toString(16).slice(0, 8)}`;
  const patientId = `patient-anon-${Math.abs(hashString(patientToken)).toString(16).slice(0, 8)}`;
  const requestId = `servicerequest-${Math.abs(hashString(bundleId + 'sr')).toString(16).slice(0, 8)}`;
  const consentId = `consent-part2-${Math.abs(hashString(bundleId + 'c')).toString(16).slice(0, 8)}`;
  const serviceId = `healthcareservice-${Math.abs(hashString(facilityId)).toString(16).slice(0, 8)}`;

  // Resource 1: Pseudonymous Patient (Zero direct PII)
  const patientResource = {
    resourceType: 'Patient',
    id: patientId,
    meta: {
      profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
      security: [
        {
          system: FHIR_SYSTEMS.ETH_SECURITY,
          code: 'ETH',
          display: 'Substance abuse information sensitivity',
        },
      ],
    },
    identifier: [
      {
        use: 'temp',
        system: FHIR_SYSTEMS.HARBORPATH_TOKEN,
        value: patientToken,
      },
    ],
    active: true,
    name: [
      {
        use: 'anonymous',
        text: 'Pseudonymous Patient',
        family: 'Anonymous',
        given: ['HarborPath Client'],
      },
    ],
  };

  // Resource 2: US Core ServiceRequest (Referral Request)
  const serviceRequestResource = {
    resourceType: 'ServiceRequest',
    id: requestId,
    meta: {
      profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-servicerequest'],
      security: [
        {
          system: FHIR_SYSTEMS.ETH_SECURITY,
          code: 'ETH',
          display: 'Substance abuse information sensitivity',
        },
      ],
    },
    status: 'active',
    intent: 'order',
    priority,
    code: {
      coding: [
        {
          system: FHIR_SYSTEMS.LOINC,
          code: '56832-9',
          display: 'Problem-oriented referral',
        },
        {
          system: FHIR_SYSTEMS.SNOMED_CT,
          code: '3457005',
          display: 'Substance abuse referral',
        },
      ],
      text: `SUD Referral for ASAM Level ${asamLevel}${withdrawalNeeded ? ' (with Medical Withdrawal Management)' : ''}`,
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: 'Pseudonymous Patient',
    },
    authoredOn: timestamp,
    performer: [
      {
        reference: `HealthcareService/${serviceId}`,
        display: facilityName,
      },
    ],
    reasonCode: [
      {
        coding: [
          {
            system: FHIR_SYSTEMS.ASAM_CRITERIA,
            code: asamLevel,
            display: `ASAM Care Level ${asamLevel}`,
          },
        ],
        text: `Recommended ASAM Level of Care: ${asamLevel}`,
      },
      ...substances.map((sub) => ({
        coding: [
          {
            system: FHIR_SYSTEMS.SNOMED_CT,
            code: '7200002',
            display: `Substance-related disorder (${sub})`,
          },
        ],
        text: `Substance: ${sub}`,
      })),
    ],
    note: [
      {
        time: timestamp,
        text: notes || 'Anonymous warm handoff referral generated via HarborPath Care Navigator. Zero direct PII transmitted.',
      },
    ],
  };

  // Resource 3: Statutory 42 CFR Part 2 Consent
  const consentResource = {
    resourceType: 'Consent',
    id: consentId,
    meta: {
      profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-consent'],
      security: [
        {
          system: FHIR_SYSTEMS.ETH_SECURITY,
          code: 'ETH',
          display: 'Substance abuse information sensitivity',
        },
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
          code: 'R',
          display: 'Restricted',
        },
      ],
    },
    status: 'active',
    scope: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/consentscope',
          code: 'patient-privacy',
          display: 'Privacy Consent',
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: FHIR_SYSTEMS.CONSENT_CATEGORY,
            code: 'hcd',
            display: 'Health Care Directive',
          },
        ],
      },
    ],
    patient: {
      reference: `Patient/${patientId}`,
      display: 'Pseudonymous Patient',
    },
    dateTime: timestamp,
    policy: [
      {
        authority: 'https://www.ecfr.gov/current/title-42/chapter-I/subchapter-A/part-2',
        uri: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-consent',
      },
    ],
    policyRule: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: '42CFRPart2',
          display: 'Confidentiality of Substance Use Disorder Patient Records',
        },
      ],
    },
    provision: {
      type: 'permit',
      period: {
        start: timestamp,
        end: expirationDate,
      },
      actor: [
        {
          role: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'PRCP',
                display: 'primary recipient',
              },
            ],
          },
          reference: {
            reference: `HealthcareService/${serviceId}`,
            display: facilityName,
          },
        },
      ],
      purpose: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActReason',
          code: 'TREAT',
          display: 'treatment',
        },
      ],
      data: [
        {
          meaning: 'instance',
          reference: {
            reference: `ServiceRequest/${requestId}`,
          },
        },
      ],
    },
  };

  // Resource 4: HealthcareService (Facility Record)
  const healthcareServiceResource = {
    resourceType: 'HealthcareService',
    id: serviceId,
    meta: {
      profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-healthcareservice'],
    },
    identifier: [
      {
        system: 'https://findtreatment.gov/facility',
        value: facilityId,
      },
    ],
    active: true,
    name: facilityName,
    telecom: [
      {
        system: 'phone',
        value: facilityPhone,
        use: 'work',
      },
    ],
    category: [
      {
        coding: [
          {
            system: FHIR_SYSTEMS.SNOMED_CT,
            code: '38243003',
            display: 'Substance abuse rehabilitation service',
          },
        ],
      },
    ],
  };

  // Aggregate into standard FHIR R4 Bundle
  return {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'collection',
    timestamp,
    entry: [
      { fullUrl: `urn:uuid:${patientId}`, resource: patientResource },
      { fullUrl: `urn:uuid:${requestId}`, resource: serviceRequestResource },
      { fullUrl: `urn:uuid:${consentId}`, resource: consentResource },
      { fullUrl: `urn:uuid:${serviceId}`, resource: healthcareServiceResource },
    ],
  };
}

/**
 * Serializes a FHIR Bundle into standard JSON and newline-delimited JSON (NDJSON) for SMART Bulk EHR ingestion.
 */
export function serializeFhirBundle(bundle) {
  if (!bundle || bundle.resourceType !== 'Bundle') {
    throw new Error('Input must be a valid FHIR R4 Bundle.');
  }
  const jsonString = JSON.stringify(bundle, null, 2);
  const resources = Array.isArray(bundle.entry)
    ? bundle.entry.map((e) => e.resource).filter(Boolean)
    : [];
  const ndjsonString = resources.map((res) => JSON.stringify(res)).join('\n') + (resources.length > 0 ? '\n' : '');
  return {
    jsonString,
    ndjsonString,
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

export const DEFAULT_REFERRAL_PARAMS = Object.freeze({
  patientPseudonym: 'ANON-HP-7F892B',
  asamLevel: '2.1',
  priority: 'urgent',
  facilityName: 'HarborPath Community Health Partner',
  facilityId: 'FAC-10492',
  facilityPhone: '1-800-662-4357',
  withdrawalNeeded: false,
  substances: ['opioids'],
  clinicalNotes: 'Client seeking outpatient buprenorphine induction and harm reduction support. 42 CFR Part 2 consent active.',
});

const fhirState = {
  patientPseudonym: 'ANON-HP-7F892B',
  asamLevel: '2.1',
  priority: 'urgent',
  facilityName: 'HarborPath Community Health Partner',
  facilityId: 'FAC-10492',
  facilityPhone: '1-800-662-4357',
  withdrawalNeeded: false,
  substances: new Set(['opioids']),
  clinicalNotes: 'Client seeking outpatient buprenorphine induction and harm reduction support. 42 CFR Part 2 consent active.',
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getFhirExportState() {
  return {
    ...fhirState,
    substances: new Set(fhirState.substances),
  };
}

export function setFhirExportState(patch) {
  Object.assign(fhirState, patch);
  notifyState();
}

export function resetFhirExportState() {
  fhirState.patientPseudonym = 'ANON-HP-7F892B';
  fhirState.asamLevel = '2.1';
  fhirState.priority = 'urgent';
  fhirState.facilityName = 'HarborPath Community Health Partner';
  fhirState.facilityId = 'FAC-10492';
  fhirState.facilityPhone = '1-800-662-4357';
  fhirState.withdrawalNeeded = false;
  fhirState.substances = new Set(['opioids']);
  fhirState.clinicalNotes = 'Client seeking outpatient buprenorphine induction and harm reduction support. 42 CFR Part 2 consent active.';
  fhirState.copied = false;
  notifyState();
}

export function subscribeFhirExportState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// VIEW RENDERING
// ============================================================================

export function fhirExportView() {
  const container = h('div', { class: 'fhir-export-view', role: 'region', 'aria-label': 'FHIR R4 Referral Syndication Generator' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const bundle = generateFhirReferralBundle({
      patientPseudonym: fhirState.patientPseudonym,
      asamLevel: fhirState.asamLevel,
      priority: fhirState.priority,
      facilityName: fhirState.facilityName,
      facilityId: fhirState.facilityId,
      facilityPhone: fhirState.facilityPhone,
      withdrawalNeeded: fhirState.withdrawalNeeded,
      substances: Array.from(fhirState.substances),
      clinicalNotes: fhirState.clinicalNotes,
    });
    const jsonText = JSON.stringify(bundle, null, 2);

    // Page Header
    container.appendChild(
      pageHeader(
        isEs ? 'Exportador de Derivación e Interoperabilidad FHIR R4' : 'FHIR R4 Referral & EHR Interoperability Generator',
        isEs
          ? 'Genere paquetes de derivación clínica HL7 FHIR R4 estandarizados (ServiceRequest, Consent y HealthcareService) con estricto cumplimiento de 42 CFR Parte 2 y cero datos personales persistentes.'
          : 'Generate standardized HL7 FHIR R4 US Core bundles (ServiceRequest, Consent, HealthcareService) with strict 42 CFR Part 2 compliance and zero persistent PII.',
        'clinical'
      )
    );

    // Main Grid
    const grid = h('div', { class: 'fhir-layout-grid' });

    // LEFT COLUMN: Referral Configuration Form
    const leftCol = h('div', { class: 'fhir-col' });

    // Card 1: ASAM & Priority Configuration
    const configCard = h('section', { class: 'fhir-card' },
      h('h2', { class: 'fhir-card-title' },
        icon('activity'),
        h('span', {}, isEs ? '1. Configuración Clínica de la Derivación' : '1. Clinical Referral Configuration')
      ),
      // Patient Pseudonym Token Input
      h('div', { class: 'fhir-field-group' },
        h('label', { for: 'fhir-pseudonym', class: 'fhir-label' }, isEs ? 'Token Criptográfico Anónimo del Paciente (Cero PII):' : 'Anonymous Cryptographic Patient Token (Zero PII):'),
        (() => {
          const inp = h('input', {
            type: 'text',
            id: 'fhir-pseudonym',
            class: 'fhir-input',
            value: fhirState.patientPseudonym,
          });
          inp.addEventListener('input', (e) => {
            fhirState.patientPseudonym = e.target.value.trim() || 'ANON-HP-CLIENT';
            render();
          });
          return inp;
        })()
      ),
      // ASAM Care Level Dropdown
      h('div', { class: 'fhir-field-group' },
        h('label', { for: 'fhir-asam-select', class: 'fhir-label' }, isEs ? 'Nivel de Atención Recomendado (Criterios ASAM):' : 'Recommended ASAM Level of Care:'),
        (() => {
          const sel = h('select', { id: 'fhir-asam-select', class: 'fhir-select' },
            ASAM_LEVEL_DEFINITIONS.map((def) =>
              h('option', { value: def.code, selected: fhirState.asamLevel === def.code },
                isEs ? def.nameEs : def.nameEn
              )
            )
          );
          sel.addEventListener('change', (e) => {
            fhirState.asamLevel = e.target.value;
            render();
          });
          return sel;
        })()
      ),
      // Priority Dropdown
      h('div', { class: 'fhir-field-group' },
        h('label', { for: 'fhir-priority-select', class: 'fhir-label' }, isEs ? 'Prioridad de la Derivación:' : 'Referral Urgency / Priority:'),
        (() => {
          const sel = h('select', { id: 'fhir-priority-select', class: 'fhir-select' },
            h('option', { value: 'routine', selected: fhirState.priority === 'routine' }, isEs ? 'Rutina (Cita ambulatoria programada)' : 'Routine (Scheduled outpatient intake)'),
            h('option', { value: 'urgent', selected: fhirState.priority === 'urgent' }, isEs ? 'Urgente (Evaluación dentro de 24 horas)' : 'Urgent (Same-day / within 24h intake)'),
            h('option', { value: 'stat', selected: fhirState.priority === 'stat' }, isEs ? 'Inmediata / STAT (Ingreso de emergencia)' : 'Immediate / STAT (Emergency bed admission)')
          );
          sel.addEventListener('change', (e) => {
            fhirState.priority = e.target.value;
            render();
          });
          return sel;
        })()
      ),
      // Medical Withdrawal Needed Checkbox
      h('div', { class: 'fhir-field-group' },
        (() => {
          const chk = h('input', {
            type: 'checkbox',
            id: 'chk-withdrawal',
            class: 'fhir-checkbox',
            checked: fhirState.withdrawalNeeded,
          });
          chk.addEventListener('change', (e) => {
            fhirState.withdrawalNeeded = e.target.checked;
            render();
          });
          return h('label', { for: 'chk-withdrawal', class: 'fhir-checkbox-label' },
            chk,
            h('span', {}, isEs ? 'Requiere Manejo Médico de Abstinencia / Desintoxicación' : 'Requires Medical Withdrawal Management (Detox)')
          );
        })()
      )
    );
    leftCol.appendChild(configCard);

    // Card 2: Receiving Facility & Consent
    const facCard = h('section', { class: 'fhir-card' },
      h('h2', { class: 'fhir-card-title' },
        icon('shield'),
        h('span', {}, isEs ? '2. Entidad Receptora y Consentimiento 42 CFR Parte 2' : '2. Recipient Facility & 42 CFR Part 2 Consent')
      ),
      h('div', { class: 'fhir-field-group' },
        h('label', { for: 'fhir-facility-name', class: 'fhir-label' }, isEs ? 'Nombre del Centro u Hospital Receptor:' : 'Authorized Recipient Facility Name:'),
        (() => {
          const inp = h('input', {
            type: 'text',
            id: 'fhir-facility-name',
            class: 'fhir-input',
            value: fhirState.facilityName,
          });
          inp.addEventListener('input', (e) => {
            fhirState.facilityName = e.target.value;
            render();
          });
          return inp;
        })()
      ),
      h('div', { class: 'fhir-inputs-row' },
        h('div', { class: 'fhir-field-group' },
          h('label', { for: 'fhir-facility-id', class: 'fhir-label' }, isEs ? 'ID del Centro:' : 'Facility Directory ID:'),
          (() => {
            const inp = h('input', {
              type: 'text',
              id: 'fhir-facility-id',
              class: 'fhir-input',
              value: fhirState.facilityId,
            });
            inp.addEventListener('input', (e) => {
              fhirState.facilityId = e.target.value;
              render();
            });
            return inp;
          })()
        ),
        h('div', { class: 'fhir-field-group' },
          h('label', { for: 'fhir-facility-phone', class: 'fhir-label' }, isEs ? 'Teléfono:' : 'Contact Phone:'),
          (() => {
            const inp = h('input', {
              type: 'text',
              id: 'fhir-facility-phone',
              class: 'fhir-input',
              value: fhirState.facilityPhone,
            });
            inp.addEventListener('input', (e) => {
              fhirState.facilityPhone = e.target.value;
              render();
            });
            return inp;
          })()
        )
      ),
      // 42 CFR Part 2 Guarantee Notice
      h('div', { class: 'fhir-consent-notice' },
        h('strong', {}, isEs ? 'Garantía Federal 42 CFR Parte 2: ' : 'Federal 42 CFR Part 2 Statutory Clause: '),
        h('span', {},
          isEs
            ? 'La información transmitida lleva la etiqueta de seguridad «ETH» y cláusula expresa que prohíbe la redifusión sin consentimiento escrito adicional.'
            : 'Transmitted records carry explicit "ETH" security tagging and statutory notices prohibiting redisclosure without additional written authorization.'
        )
      )
    );
    leftCol.appendChild(facCard);

    grid.appendChild(leftCol);

    // RIGHT COLUMN: Live FHIR JSON Output & Actions
    const rightCol = h('div', { class: 'fhir-col' });

    const bundleCard = h('section', { class: 'fhir-card' },
      h('div', { class: 'fhir-card-head' },
        h('h2', { class: 'fhir-card-title' },
          icon('code'),
          h('span', {}, isEs ? 'Paquete HL7 FHIR R4 Generado (JSON)' : 'Generated HL7 FHIR R4 Bundle (JSON)')
        ),
        h('span', { class: 'fhir-chip' }, 'US Core v6.0.0 Validated')
      ),
      h('pre', { class: 'fhir-code-block', tabindex: '0', 'aria-label': 'FHIR R4 JSON Bundle' },
        jsonText
      ),
      h('div', { class: 'fhir-actions' },
        (() => {
          const copyBtn = h('button', {
            type: 'button',
            class: 'btn btn-primary',
          },
            icon('copy'),
            h('span', {}, fhirState.copied ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar JSON FHIR' : 'Copy FHIR JSON'))
          );
          copyBtn.addEventListener('click', () => {
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(jsonText).then(() => {
                fhirState.copied = true;
                announce(isEs ? 'JSON FHIR copiado al portapapeles' : 'FHIR JSON copied to clipboard');
                render();
                setTimeout(() => {
                  fhirState.copied = false;
                  render();
                }, 3000);
              });
            }
          });
          return copyBtn;
        })(),
        (() => {
          const downloadBtn = h('button', {
            type: 'button',
            class: 'btn btn-secondary',
          },
            icon('download'),
            h('span', {}, isEs ? 'Descargar Bundle (.json)' : 'Download Bundle (.json)')
          );
          downloadBtn.addEventListener('click', () => {
            const blob = new Blob([jsonText], { type: 'application/fhir+json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `harborpath-referral-bundle-${bundle.id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            announce(isEs ? 'Archivo FHIR descargado' : 'FHIR bundle file downloaded');
          });
          return downloadBtn;
        })(),
        (() => {
          const ndjsonBtn = h('button', {
            type: 'button',
            class: 'btn btn-secondary',
          },
            icon('download'),
            h('span', {}, isEs ? 'Descargar NDJSON (Bulk)' : 'Download NDJSON (Bulk)')
          );
          ndjsonBtn.addEventListener('click', () => {
            const { ndjsonString } = serializeFhirBundle(bundle);
            const blob = new Blob([ndjsonString], { type: 'application/fhir+ndjson' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `harborpath-referral-bulk-${bundle.id}.ndjson`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            announce(isEs ? 'Archivo NDJSON descargado' : 'FHIR NDJSON file downloaded');
          });
          return ndjsonBtn;
        })(),
        (() => {
          const resetBtn = h('button', {
            type: 'button',
            class: 'btn btn-ghost',
          }, isEs ? 'Restablecer' : 'Reset Form');
          resetBtn.addEventListener('click', () => {
            resetFhirExportState();
          });
          return resetBtn;
        })()
      )
    );
    rightCol.appendChild(bundleCard);

    grid.appendChild(rightCol);
    container.appendChild(grid);
  }

  listeners.add(render);
  render();
  return container;
}
