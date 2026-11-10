// public/js/views/massOverdoseMci.js
// HarborPath - Mass Overdose Cluster & Contaminated Drug Supply Triage Navigator (MCI / SALT)
// Clinical Consensus: CDC / SAMHSA Overdose Spike Response Framework, NAEMT Tactical Emergency
// Casualty Care (TECC) Guidelines, and SALT Mass Casualty Triage adapted for synthetic opioid super-agonists.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL TAXONOMY & CONTAMINATED DRUG SUPPLY CONSTANTS
// ============================================================================

export const CONTAMINANT_PROFILES = Object.freeze({
  carfentanil_nitazene: Object.freeze({
    id: 'carfentanil_nitazene',
    nameEn: 'Synthetic Opioid Super-Agonists (Carfentanil / Nitazenes)',
    nameEs: 'Superagonistas Opioides Sintéticos (Carfentanilo / Nitazenos)',
    potencyEn: 'Carfentanil (10,000x morphine; 100x fentanyl); Nitazenes (Isotonitazene, Metonitazene, Protonitazene: 20x to 100x morphine).',
    potencyEs: 'Carfentanilo (10.000x morfina; 100x fentanilo); Nitazenos (Isotonitazeno, Metonitazeno, Protonitazeno: 20x a 100x morfina).',
    clinicalPresentationEn: 'Instantaneous respiratory arrest (< 60 sec), profound miosis, rapid cyanosis, and high risk of "Wooden Chest Syndrome" (opioid-induced vocal cord closure and rigid chest wall compliance).',
    clinicalPresentationEs: 'Paro respiratorio fulminante (< 60 seg), miosis puntiforme, cianosis rápida y alto riesgo de «Síndrome de Tórax de Madera» (rigidez muscular de pared torácica y laringoespasmo).',
    resuscitationRuleEn: 'VENTILATION-FIRST: Deliver Bag-Valve-Mask (BVM) ventilations with high-flow O2 for 2–3 minutes BEFORE or during titrated naloxone to prevent catecholamine-induced flash non-cardiogenic pulmonary edema.',
    resuscitationRuleEs: 'VENTILACIÓN PRIMERO: Ventile con Bolsa-Válvula-Mascarilla (BVM) con O2 al 100% durante 2-3 minutos ANTES o junto con naloxona titulada para evitar edema pulmonar fulminante por catecolaminas.',
  }),

  xylazine_medetomidine: Object.freeze({
    id: 'xylazine_medetomidine',
    nameEn: 'Alpha-2 Adrenergic Veterinary Sedatives (Xylazine / Medetomidine)',
    nameEs: 'Sedantes Veterinarios Agonistas Alfa-2 (Xilacina / Medetomidina)',
    potencyEn: 'Central non-opioid alpha-2 agonists causing profound bradycardia, hypotension, and prolonged coma (4–12+ hours).',
    potencyEs: 'Agonistas alfa-2 centrales no opioides que causan bradicardia severa, hipotensión y coma prolongado (4 a 12+ horas).',
    clinicalPresentationEn: 'Severe sedation with intact or borderline ventilation, severe bradycardia (HR 30–45 bpm), hypothermia, dry mucous membranes, and extensive necrotic skin ulcers (at injection and distant sites).',
    clinicalPresentationEs: 'Coma profundo con respiración límite o espontánea, bradicardia grave (FC 30-45 lpm), hipotermia, sequedad de mucosas y úlceras cutáneas necróticas extensas.',
    resuscitationRuleEn: 'STRICT INVARIANT: Xylazine and Medetomidine are NOT opioids and are 100% UNRESPONSIVE to naloxone. DO NOT administer repeated high doses of naloxone trying to wake a breathing sedated patient. Place in high-recovery lateral position and monitor airway/vitals.',
    resuscitationRuleEs: 'REGLA ESTRICTA: La xilacina y medetomidina NO son opioides y son 100% RESISTENTES a la naloxona. NO administre dosis repetidas de naloxona para despertar a un paciente que ya ventila. Colóquelo en posición lateral de seguridad y vigile vía aérea.',
  }),

  designer_benzos: Object.freeze({
    id: 'designer_benzos',
    nameEn: 'Designer Benzodiazepines (Bromazolam / Clonazolam)',
    nameEs: 'Benzodiacepinas de Diseño (Bromazolam / Clonazolam)',
    potencyEn: 'Highly potent unregulated GABA-A positive allosteric modulators with elimination half-lives exceeding 40–80 hours.',
    potencyEs: 'Moduladores alostéricos positivos GABA-A no regulados de alta potencia con vidas medias superiores a 40-80 horas.',
    clinicalPresentationEn: 'Profound lingering sedation, persistent motor ataxia, anterograde amnesia, and prolonged secondary hypoventilation after opioid reversal.',
    clinicalPresentationEs: 'Sedación persistente de varios días, ataxia motora profunda, amnesia anterógrada e hipoventilación secundaria tras revertir el opioide.',
    resuscitationRuleEn: 'Avoid flumazenil in chronic illicit polysubstance users due to lethal intractable seizure precipitation. Provide continuous airway management, supplemental oxygen, and prolonged clinical observation.',
    resuscitationRuleEs: 'Evite flumazenil en consumidores de poli-sustancias ilícitas por riesgo de convulsiones letales intratables. Mantenga soporte de vía aérea, oxígeno y observación prolongada.',
  }),
});

export const SALT_CATEGORIES = Object.freeze({
  red: Object.freeze({
    id: 'red',
    code: 'IMMEDIATE',
    nameEn: 'RED: Immediate Lifesaving Priority (Category 1)',
    nameEs: 'ROJO: Prioridad Inmediata de Reanimación (Categoría 1)',
    color: '#dc2626',
    criteriaEn: 'Agonal respirations (< 6–8 bpm), central apnea, cyanosis, GCS < 8 WITH palpable carotid/femoral pulse.',
    criteriaEs: 'Respiración agónica (< 6-8 rpm), apnea central, cianosis, Glasgow < 8 CON pulso carotídeo palpable.',
    actionEn: 'Immediate 2-person Bag-Valve-Mask (BVM) ventilations with 100% O2 + two-handed jaw thrust + Nasopharyngeal Airway (NPA). Titrate Naloxone (0.4 mg IV/IM or 4 mg IN). Target: Spontaneous RR 10–12/min, NOT full alertness.',
    actionEs: 'Ventilación inmediata con BVM y O2 al 100% con tracción mandibular y cánula nasofaríngea. Naloxona titulada (0,4 mg IV/IM o 4 mg IN). Meta: Ventilación espontánea de 10-12 rpm, NO despertar combativo.',
  }),

  yellow: Object.freeze({
    id: 'yellow',
    code: 'DELAYED',
    nameEn: 'YELLOW: Delayed / Urgent Observation (Category 2)',
    nameEs: 'AMARILLO: Prioridad Diferida / Observación Urgente (Categoría 2)',
    color: '#d97706',
    criteriaEn: 'Stuporous or somnolent, but MAINTAINS effective spontaneous breathing (RR >= 10–12 bpm, SpO2 >= 92% on room air), protective airway reflexes intact, stable pulse.',
    criteriaEs: 'Estuporoso o somnoliento, pero MANTIENE ventilación espontánea eficaz (FR >= 10-12 rpm, SpO2 >= 92%), reflejos de vía aérea presentes y pulso estable.',
    actionEn: 'High-recovery lateral position (prevent aspiration). Continuous pulse oximetry. DO NOT administer repeated naloxone boluses if patient is ventilating adequately. Monitor for sedative relapse.',
    actionEs: 'Posición lateral de seguridad (evita broncoaspiración). Pulsioximetría continua. NO administre bolos masivos de naloxona si ventila bien. Monitorice recaída de sedación.',
  }),

  green: Object.freeze({
    id: 'green',
    code: 'MINIMAL',
    nameEn: 'GREEN: Minimal / Walking Wounded (Category 3)',
    nameEs: 'VERDE: Mínima / Pacientes Ambulatorios (Categoría 3)',
    color: '#16a34a',
    criteriaEn: 'Conscious, ambulatory, oriented or mildly sedated, normal respirations (RR 12–20 bpm), SpO2 >= 95%, hemodynamic stability.',
    criteriaEs: 'Consciente, camina, orientado o con sedación leve, respiración normal (FR 12-20 rpm), SpO2 >= 95%, estabilidad hemodinámica.',
    actionEn: 'Direct to triage holding area, provide thermal insulation (space blankets), oral hydration, psychological first aid, and harm reduction safety education.',
    actionEs: 'Dirigir al área de observación, mantas térmicas, hidratación oral, primeros auxilios psicológicos y educación en reducción de daños.',
  }),

  black: Object.freeze({
    id: 'black',
    code: 'EXPECTANT',
    nameEn: 'BLACK: Expectant / Deceased (Category 0)',
    nameEs: 'NEGRO: Expectante / Fallecido (Categoría 0)',
    color: '#0f172a',
    criteriaEn: 'Asystole or pulseless electrical activity (PEA) with no response to airway opening and 2–3 minutes of attempted rescue breathing, or overt signs of irreversible death (rigor mortis, dependent lividity).',
    criteriaEs: 'Asistolia o AESP sin respuesta tras apertura de vía aérea y 2-3 minutos de ventilaciones de rescate en escenario con recursos colapsados, o signos indudables de muerte.',
    actionEn: 'In a resource-exhausted mass casualty environment, withhold prolonged chest compressions; redirect personnel and oxygen to salvageable Red category patients.',
    actionEs: 'En un incidente masivo con recursos sobrepasados, suspenda la RCP prolongada y redirija el personal y oxígeno hacia los pacientes categoría Roja recuperables.',
  }),
});

// ============================================================================
// EVALUATION ENGINE (PURE FUNCTION)
// ============================================================================

/**
 * Pure evaluation function for mass overdose incidents, contaminated drug clusters, and SALT triage.
 * @param {Object} input
 * @param {string} [input.contaminantId='carfentanil_nitazene'] - Key from CONTAMINANT_PROFILES
 * @param {number} [input.redCount=1] - Count of immediate category patients
 * @param {number} [input.yellowCount=2] - Count of delayed category patients
 * @param {number} [input.greenCount=3] - Count of minimal category patients
 * @param {number} [input.blackCount=0] - Count of expectant/deceased category patients
 * @param {boolean} [input.hasWoodenChest=false] - Rigid chest wall compliance present
 * @param {boolean} [input.hasSevereBradycardia=false] - Heart rate < 45 bpm (medetomidine/xylazine)
 * @param {number} [input.availableNaloxoneDoses=10] - Doses of naloxone available on scene
 * @returns {Object} Comprehensive evaluation output
 */
export function evaluateMassOverdoseMci(input = {}) {
  const contaminantId = CONTAMINANT_PROFILES[input.contaminantId] ? input.contaminantId : 'carfentanil_nitazene';
  const contaminant = CONTAMINANT_PROFILES[contaminantId];

  const redCount = Math.max(0, Number(input.redCount) || 0);
  const yellowCount = Math.max(0, Number(input.yellowCount) || 0);
  const greenCount = Math.max(0, Number(input.greenCount) || 0);
  const blackCount = Math.max(0, Number(input.blackCount) || 0);

  const totalCasualties = redCount + yellowCount + greenCount + blackCount;
  const hasWoodenChest = Boolean(input.hasWoodenChest);
  const hasSevereBradycardia = Boolean(input.hasSevereBradycardia);
  const naloxoneDoses = Math.max(0, Number(input.availableNaloxoneDoses) || 0);

  const emergencyFlagsEn = [];
  const emergencyFlagsEs = [];

  // Cluster / Spike Threshold
  const isSpikeCluster = totalCasualties >= 3;
  if (isSpikeCluster) {
    emergencyFlagsEn.push(`MASS CASUALTY OVERDOSE SPIKE: ${totalCasualties} casualties documented. Exceeds municipal threshold; activate Incident Command System (ICS).`);
    emergencyFlagsEs.push(`BROTE MASIVO DE SOBREDOSIS: ${totalCasualties} víctimas documentadas. Supera el umbral municipal; active el Sistema de Comando de Incidentes (ICS).`);
  }

  // Wooden Chest Syndrome
  if (hasWoodenChest) {
    emergencyFlagsEn.push('WOODEN CHEST SYNDROME DETECTED: Synthetic opioid rigidity preventing BVM ventilation. Requires immediate 2-person tight mask seal, maximum jaw thrust, and rapid IV naloxone.');
    emergencyFlagsEs.push('SÍNDROME DE TÓRAX DE MADERA DETECTADO: Rigidez torácica extrema que impide ventilar. Requiere sello bimanual de mascarilla, tracción mandibular máxima y naloxona IV inmediata.');
  }

  // Medetomidine / Xylazine Bradycardia
  if (hasSevereBradycardia) {
    emergencyFlagsEn.push('ALPHA-2 AGONIST BRADYCARDIA ALERT: Heart rate < 45 bpm. DO NOT administer repeated naloxone if respirations are adequate. Naloxone will not reverse alpha-2 sedation.');
    emergencyFlagsEs.push('ALERTA DE BRADICARDIA POR AGONISTAS ALFA-2: Frecuencia cardíaca < 45 lpm. NO administre naloxona repetida si el paciente ya ventila. La naloxona no revierte la xilacina.');
  }

  // Naloxone Supply Assessment
  const estimatedNaloxoneNeeded = (redCount * 3) + (yellowCount * 1);
  const hasSupplyDeficit = naloxoneDoses < estimatedNaloxoneNeeded;
  if (hasSupplyDeficit) {
    emergencyFlagsEn.push(`CRITICAL NALOXONE DEFICIT: ${naloxoneDoses} doses on scene vs ~${estimatedNaloxoneNeeded} projected doses required. Request immediate mutual-aid supply surge.`);
    emergencyFlagsEs.push(`DÉFICIT CRÍTICO DE NALOXONA: ${naloxoneDoses} dosis en el lugar frente a ~${estimatedNaloxoneNeeded} dosis requeridas. Solicite envío urgente de suministros.`);
  }

  // SBAR Clinical Incident Handoff
  const sbarEn = [
    `[S] SITUATION: Mass casualty overdose spike incident involving ${totalCasualties} casualties. Primary suspected agent: ${contaminant.nameEn}.`,
    `[B] BACKGROUND: SALT Triage Counts: RED (Immediate) = ${redCount} | YELLOW (Delayed) = ${yellowCount} | GREEN (Minimal) = ${greenCount} | BLACK (Expectant) = ${blackCount}. Available Naloxone: ${naloxoneDoses} doses (Estimated demand: ${estimatedNaloxoneNeeded}).`,
    `[A] ASSESSMENT: ${emergencyFlagsEn.length > 0 ? `CRITICAL MCI ALERTS: ${emergencyFlagsEn.join('; ')}` : 'Scene triage stable under current staffing.'}`,
    `  • Ventilation Directive: ${contaminant.resuscitationRuleEn}`,
    `  • Contaminant Dynamics: ${contaminant.potencyEn} ${contaminant.clinicalPresentationEn}`,
    `[R] RECOMMENDATION: Activate municipal Spike Response Protocol. Notify EMS Dispatch, Regional Poison Center (1-800-222-1222), and receiving Emergency Departments. Deploy community naloxone surge without brand-naming contaminated packaging.`,
  ].join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Incidente con múltiples víctimas por sobredosis masiva (${totalCasualties} pacientes). Agente sospechoso: ${contaminant.nameEs}.`,
    `[B] ANTECEDENTES: Conteo de Triaje SALT: ROJO (Inmediato) = ${redCount} | AMARILLO (Diferido) = ${yellowCount} | VERDE (Leve) = ${greenCount} | NEGRO (Fallecido) = ${blackCount}. Naloxona en escena: ${naloxoneDoses} dosis (Demanda estimada: ${estimatedNaloxoneNeeded}).`,
    `[A] EVALUACIÓN: ${emergencyFlagsEs.length > 0 ? `ALERTAS CRÍTICAS DE INCIDENTE: ${emergencyFlagsEs.join('; ')}` : 'Triaje en escena estabilizado con los recursos actuales.'}`,
    `  • Directiva de Ventilación: ${contaminant.resuscitationRuleEs}`,
    `  • Toxicodinámica del Adulterante: ${contaminant.potencyEs} ${contaminant.clinicalPresentationEs}`,
    `[R] RECOMENDACIÓN: Activar el Protocolo Municipal de Respuesta a Brotes. Notificar a Despacho 911, Centro de Toxicología (1-800-222-1222) y Servicios de Urgencias. Desplegar choque comunitario de naloxona sin difundir nombres de marca callejera.`,
  ].join('\n');

  // Municipal ICS Spike Notification Alert Text
  const icsAlertTextEn = [
    '=== HARBORPATH MUNICIPAL OVERDOSE SPIKE INCIDENT DECLARATION ===',
    `Timestamp: ${new Date().toISOString()}`,
    `Incident Level: ${isSpikeCluster ? 'ACTIVE OVERDOSE CLUSTER / SPIKE DECLARED' : 'MONITORING LEVEL'}`,
    `Total Patients: ${totalCasualties} (Red: ${redCount}, Yellow: ${yellowCount}, Green: ${greenCount}, Black: ${blackCount})`,
    `Suspected Adulterant: ${contaminant.nameEn}`,
    `Specific Complications: ${hasWoodenChest ? 'WOODEN CHEST RIGIDITY DETECTED' : 'None reported'}; ${hasSevereBradycardia ? 'SEVERE ALPHA-2 BRADYCARDIA DETECTED' : 'None reported'}`,
    'MANDATORY ICS ACTIONS:',
    '1. Notify Health Officer & Poison Control (1-800-222-1222).',
    '2. Surge deploy nasal and injectable naloxone to street teams and shelters.',
    '3. Issue public health harm reduction advisory: Stagger drug use, never use alone, rescue breathing priority.',
    '4. DO NOT advertise specific street stamps or brand logos (prevents perverse demand surge).',
    '================================================================'
  ].join('\n');

  return {
    contaminantId,
    contaminant,
    totalCasualties,
    redCount,
    yellowCount,
    greenCount,
    blackCount,
    hasWoodenChest,
    hasSevereBradycardia,
    naloxoneDoses,
    estimatedNaloxoneNeeded,
    isSpikeCluster,
    emergencyFlagsEn,
    emergencyFlagsEs,
    sbarEn,
    sbarEs,
    icsAlertTextEn,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const mciState = {
  contaminantId: 'carfentanil_nitazene',
  redCount: 2,
  yellowCount: 3,
  greenCount: 4,
  blackCount: 0,
  hasWoodenChest: true,
  hasSevereBradycardia: false,
  availableNaloxoneDoses: 8,
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getMassOverdoseMciState() {
  return { ...mciState };
}

export function setMassOverdoseMciState(patch) {
  Object.assign(mciState, patch);
  notifyState();
}

export function resetMassOverdoseMciState() {
  Object.assign(mciState, {
    contaminantId: 'carfentanil_nitazene',
    redCount: 2,
    yellowCount: 3,
    greenCount: 4,
    blackCount: 0,
    hasWoodenChest: true,
    hasSevereBradycardia: false,
    availableNaloxoneDoses: 8,
    copied: false,
  });
  notifyState();
}

export function subscribeMassOverdoseMciState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// DOM VIEW IMPLEMENTATION (ZERO INNERHTML / ZERO INLINE STYLES)
// ============================================================================

export function massOverdoseMciView() {
  const container = h('div', { class: 'mass-mci-view', role: 'region', 'aria-label': 'Mass Overdose Cluster & SALT Triage Navigator' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const evalResult = evaluateMassOverdoseMci({
      contaminantId: mciState.contaminantId,
      redCount: mciState.redCount,
      yellowCount: mciState.yellowCount,
      greenCount: mciState.greenCount,
      blackCount: mciState.blackCount,
      hasWoodenChest: mciState.hasWoodenChest,
      hasSevereBradycardia: mciState.hasSevereBradycardia,
      availableNaloxoneDoses: mciState.availableNaloxoneDoses,
    });

    // Page Header
    container.appendChild(
      pageHeader(
        isEs ? 'Brote Masivo de Sobredosis, Adulterantes y Triaje SALT' : 'Mass Overdose Cluster, Contaminated Supply & SALT Triage',
        isEs
          ? 'Protocolos de respuesta rápida ante conglomerados de sobredosis por superagonistas (carfentanilo, nitazenos), xilacina/medetomidina, síndrome de tórax de madera y triaje masivo.'
          : 'Rapid incident command protocols for synthetic opioid super-agonists, non-opioid sedatives, wooden chest syndrome, and ventilation-first SALT mass casualty triage.',
        'emergency'
      )
    );

    // Critical Emergency Callout Banner if Spike
    if (evalResult.emergencyFlagsEn.length > 0) {
      container.appendChild(
        h('aside', { class: 'mci-alert-urgent', role: 'alert' },
          h('div', { class: 'mci-alert-title' },
            icon('alert-triangle'),
            h('strong', {}, isEs ? 'ALERTA DE INCIDENTE CON MÚLTIPLES VÍCTIMAS / BROTE CRÍTICO' : 'MASS CASUALTY OVERDOSE ALERT: MUNICIPAL INCIDENT COMMAND ACTIVE')
          ),
          h('ul', { class: 'mci-alert-list' },
            (isEs ? evalResult.emergencyFlagsEs : evalResult.emergencyFlagsEn).map((msg) =>
              h('li', {}, msg)
            )
          )
        )
      );
    }

    // Contaminant Selector Tabs
    const tabNav = h('div', { class: 'tabs', role: 'tablist', 'aria-label': isEs ? 'Adulterantes Sospechosos' : 'Suspected Adulterants' },
      Object.values(CONTAMINANT_PROFILES).map((c) => {
        const isSelected = c.id === mciState.contaminantId;
        const btn = h('button', {
          role: 'tab',
          class: `tab ${isSelected ? 'active' : ''}`,
          'aria-selected': isSelected ? 'true' : 'false',
        }, isEs ? c.nameEs : c.nameEn);
        btn.addEventListener('click', () => {
          mciState.contaminantId = c.id;
          render();
        });
        return btn;
      })
    );
    container.appendChild(tabNav);

    // Two Column Layout
    const grid = h('div', { class: 'mci-layout-grid' });

    // LEFT COLUMN: SALT Triage Counter & Scene Metrics
    const leftCol = h('div', { class: 'mci-col' });

    // Card 1: SALT Triage Patient Counters
    const triageCard = h('section', { class: 'mci-card' },
      h('h2', { class: 'mci-card-title' },
        icon('users'),
        h('span', {}, isEs ? '1. Conteo de Triaje SALT en Escena' : '1. On-Scene SALT Triage Counters')
      ),
      h('p', { class: 'mci-card-desc' },
        isEs
          ? 'Clasifique a los pacientes según la evaluación SALT adaptada a sobredosis. Total de víctimas: ' + evalResult.totalCasualties
          : 'Categorize patients using overdose-adapted SALT criteria. Total casualties: ' + evalResult.totalCasualties
      ),
      h('div', { class: 'mci-counter-grid' },
        // RED
        h('div', { class: 'mci-counter-item red' },
          h('div', { class: 'mci-counter-header' },
            h('span', { class: 'mci-badge red' }, 'RED / ROJO'),
            h('span', { class: 'mci-counter-label' }, isEs ? 'Inmediato (Apnea)' : 'Immediate (Apnea)')
          ),
          h('div', { class: 'mci-counter-controls' },
            (() => {
              const btn = h('button', { class: 'btn btn-ghost counter-btn', 'aria-label': 'Decrease Red' }, '-');
              btn.addEventListener('click', () => {
                if (mciState.redCount > 0) { mciState.redCount--; render(); }
              });
              return btn;
            })(),
            h('span', { class: 'mci-counter-val' }, String(mciState.redCount)),
            (() => {
              const btn = h('button', { class: 'btn btn-ghost counter-btn', 'aria-label': 'Increase Red' }, '+');
              btn.addEventListener('click', () => { mciState.redCount++; render(); });
              return btn;
            })()
          )
        ),
        // YELLOW
        h('div', { class: 'mci-counter-item yellow' },
          h('div', { class: 'mci-counter-header' },
            h('span', { class: 'mci-badge yellow' }, 'YELLOW / AMARILLO'),
            h('span', { class: 'mci-counter-label' }, isEs ? 'Diferido (Ventila)' : 'Delayed (Breathing)')
          ),
          h('div', { class: 'mci-counter-controls' },
            (() => {
              const btn = h('button', { class: 'btn btn-ghost counter-btn', 'aria-label': 'Decrease Yellow' }, '-');
              btn.addEventListener('click', () => {
                if (mciState.yellowCount > 0) { mciState.yellowCount--; render(); }
              });
              return btn;
            })(),
            h('span', { class: 'mci-counter-val' }, String(mciState.yellowCount)),
            (() => {
              const btn = h('button', { class: 'btn btn-ghost counter-btn', 'aria-label': 'Increase Yellow' }, '+');
              btn.addEventListener('click', () => { mciState.yellowCount++; render(); });
              return btn;
            })()
          )
        ),
        // GREEN
        h('div', { class: 'mci-counter-item green' },
          h('div', { class: 'mci-counter-header' },
            h('span', { class: 'mci-badge green' }, 'GREEN / VERDE'),
            h('span', { class: 'mci-counter-label' }, isEs ? 'Leve (Camina)' : 'Minimal (Walking)')
          ),
          h('div', { class: 'mci-counter-controls' },
            (() => {
              const btn = h('button', { class: 'btn btn-ghost counter-btn', 'aria-label': 'Decrease Green' }, '-');
              btn.addEventListener('click', () => {
                if (mciState.greenCount > 0) { mciState.greenCount--; render(); }
              });
              return btn;
            })(),
            h('span', { class: 'mci-counter-val' }, String(mciState.greenCount)),
            (() => {
              const btn = h('button', { class: 'btn btn-ghost counter-btn', 'aria-label': 'Increase Green' }, '+');
              btn.addEventListener('click', () => { mciState.greenCount++; render(); });
              return btn;
            })()
          )
        ),
        // BLACK
        h('div', { class: 'mci-counter-item black' },
          h('div', { class: 'mci-counter-header' },
            h('span', { class: 'mci-badge black' }, 'BLACK / NEGRO'),
            h('span', { class: 'mci-counter-label' }, isEs ? 'Expectante / Fallecido' : 'Expectant / Deceased')
          ),
          h('div', { class: 'mci-counter-controls' },
            (() => {
              const btn = h('button', { class: 'btn btn-ghost counter-btn', 'aria-label': 'Decrease Black' }, '-');
              btn.addEventListener('click', () => {
                if (mciState.blackCount > 0) { mciState.blackCount--; render(); }
              });
              return btn;
            })(),
            h('span', { class: 'mci-counter-val' }, String(mciState.blackCount)),
            (() => {
              const btn = h('button', { class: 'btn btn-ghost counter-btn', 'aria-label': 'Increase Black' }, '+');
              btn.addEventListener('click', () => { mciState.blackCount++; render(); });
              return btn;
            })()
          )
        )
      )
    );
    leftCol.appendChild(triageCard);

    // Card 2: Scene Complications & Naloxone Supply Tracking
    const sceneCard = h('section', { class: 'mci-card' },
      h('h2', { class: 'mci-card-title' },
        icon('shield'),
        h('span', {}, isEs ? '2. Complicaciones Clínicas y Logística de Naloxona' : '2. Scene Complications & Naloxone Supply')
      ),
      h('div', { class: 'mci-checkbox-list' },
        h('label', { class: 'mci-checkbox-label' },
          (() => {
            const chk = h('input', {
              id: 'chk-wooden-chest',
              type: 'checkbox',
              checked: mciState.hasWoodenChest,
            });
            chk.addEventListener('change', (e) => {
              mciState.hasWoodenChest = e.target.checked;
              render();
            });
            return chk;
          })(),
          h('span', {}, isEs ? 'Presencia de «Tórax de Madera» (Rigidez muscular por superagonistas sintéticos)' : 'Presence of "Wooden Chest Syndrome" (Chest wall rigidity from synthetic super-agonists)')
        ),
        h('label', { class: 'mci-checkbox-label' },
          (() => {
            const chk = h('input', {
              id: 'chk-bradycardia',
              type: 'checkbox',
              checked: mciState.hasSevereBradycardia,
            });
            chk.addEventListener('change', (e) => {
              mciState.hasSevereBradycardia = e.target.checked;
              render();
            });
            return chk;
          })(),
          h('span', {}, isEs ? 'Bradicardia extrema (< 45 lpm) o hipotensión por xilacina/medetomidina' : 'Extreme bradycardia (< 45 bpm) or hypotension from xylazine/medetomidine')
        )
      ),
      h('div', { class: 'mci-supply-group' },
        h('label', { for: 'inp-naloxone-doses', class: 'mci-form-label' },
          isEs ? 'Dosis de Naloxona Disponibles en Escena:' : 'Available Naloxone Doses On Scene:'
        ),
        (() => {
          const inp = h('input', {
            id: 'inp-naloxone-doses',
            type: 'number',
            class: 'mci-input',
            value: String(mciState.availableNaloxoneDoses),
          });
          inp.addEventListener('input', (e) => {
            mciState.availableNaloxoneDoses = Math.max(0, Number(e.target.value) || 0);
            render();
          });
          return inp;
        })(),
        h('p', { class: 'mci-help-text' },
          isEs
            ? `Demanda proyectada: ~${evalResult.estimatedNaloxoneNeeded} dosis (${evalResult.redCount} rojos x 3 + ${evalResult.yellowCount} amarillos x 1).`
            : `Projected demand: ~${evalResult.estimatedNaloxoneNeeded} doses (${evalResult.redCount} red x 3 + ${evalResult.yellowCount} yellow x 1).`
        )
      )
    );
    leftCol.appendChild(sceneCard);

    grid.appendChild(leftCol);

    // RIGHT COLUMN: Protocols, SBAR Handoff & Incident Declaration
    const rightCol = h('div', { class: 'mci-col' });

    // Card 3: Priority Resuscitation Protocol
    const resusCard = h('section', { class: 'mci-card' },
      h('h2', { class: 'mci-card-title' },
        icon('activity'),
        h('span', {}, isEs ? '3. Protocolo de Reanimación «Ventilación Primero»' : '3. "Ventilation-First" Resuscitation Protocol')
      ),
      h('div', { class: 'mci-rule-callout' },
        h('strong', {}, isEs ? 'REGLA CRÍTICA DE ORO: ' : 'CRITICAL GOLDEN RULE: '),
        h('span', {}, isEs ? evalResult.contaminant.resuscitationRuleEs : evalResult.contaminant.resuscitationRuleEn)
      ),
      h('div', { class: 'mci-action-steps' },
        h('p', { class: 'mci-step-item' },
          h('strong', {}, 'Paso 1: '),
          h('span', {}, isEs ? 'Apertura de vía aérea con tracción mandibular bimanual y cánula nasofaríngea (evita obstrucción por lengua).' : 'Airway opening with two-handed jaw thrust and Nasopharyngeal Airway (bypasses tongue clenching).')
        ),
        h('p', { class: 'mci-step-item' },
          h('strong', {}, 'Paso 2: '),
          h('span', {}, isEs ? 'Ventile con BVM y O2 al 100% durante 2-3 minutos ANTES de revertir para proteger el miocardio del edema pulmonar agudo.' : 'Ventilate with BVM & 100% O2 for 2–3 minutes BEFORE reversal to protect myocardium from flash pulmonary edema.')
        ),
        h('p', { class: 'mci-step-item' },
          h('strong', {}, 'Paso 3: '),
          h('span', {}, isEs ? 'Naloxona titulada (0,4 mg IV/IM o 4 mg IN). Meta: respiración espontánea de 10-12 rpm, NO despertar combativo.' : 'Titrated naloxone (0.4 mg IV/IM or 4 mg IN). Target: spontaneous ventilation RR 10–12/min, NOT violent emergence.')
        )
      )
    );
    rightCol.appendChild(resusCard);

    // Card 4: SBAR Clinical Incident Handoff Note
    const sbarCard = h('section', { class: 'mci-card' },
      h('h2', { class: 'mci-card-title' },
        icon('file-text'),
        h('span', {}, isEs ? '4. Resumen SBAR de Incidente para Despacho 911 / UCI' : '4. Zero-PII SBAR Incident Report for 911 / Hospitals')
      ),
      h('pre', { class: 'mci-sbar-block', tabindex: '0' },
        isEs ? evalResult.sbarEs : evalResult.sbarEn
      ),
      h('div', { class: 'mci-actions' },
        (() => {
          const btn = h('button', {
            type: 'button',
            class: 'btn btn-primary',
          },
            icon('copy'),
            h('span', {}, mciState.copied
              ? (isEs ? '¡Copiado!' : 'Copied!')
              : (isEs ? 'Copiar Resumen SBAR' : 'Copy SBAR Note'))
          );
          btn.addEventListener('click', async () => {
            const text = isEs ? evalResult.sbarEs : evalResult.sbarEn;
            try {
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
              }
              mciState.copied = true;
              announce(isEs ? 'Resumen copiado al portapapeles' : 'SBAR note copied to clipboard');
              render();
              setTimeout(() => {
                mciState.copied = false;
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
            class: 'btn btn-ghost',
          }, isEs ? 'Restablecer Contadores' : 'Reset Counters');
          btn.addEventListener('click', () => {
            resetMassOverdoseMciState();
          });
          return btn;
        })(),
        tel('1-800-222-1222', isEs ? 'Centro de Toxicología (24/7)' : 'Poison Control (24/7)', 'btn btn-secondary')
      )
    );
    rightCol.appendChild(sbarCard);

    grid.appendChild(rightCol);
    container.appendChild(grid);
  }

  render();
  const unsubscribe = subscribeMassOverdoseMciState(render);
  return container;
}
