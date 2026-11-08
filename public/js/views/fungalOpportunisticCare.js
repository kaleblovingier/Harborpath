// public/js/views/fungalOpportunisticCare.js
// HarborPath - Opportunistic Deep Fungal & Atypical Mycobacterial Infections Navigator
// Clinical Guidelines: IDSA Guidelines for the Management of Blastomycosis, Histoplasmosis & Aspergillosis,
// CDC Endemic Mycoses & Valley Fever Clinical Guidance, and FDA Black-Box Warnings on Azole-Methadone CYP3A4/QTc Synergy.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// ENDEMIC MYCOSES & OPPORTUNISTIC TAXONOMY CONSTANTS
// ============================================================================

export const FUNGAL_PATHOGENS = Object.freeze({
  blastomycosis: Object.freeze({
    id: 'blastomycosis',
    nameEn: 'Blastomycosis (Blastomyces dermatitidis / gilchristii)',
    nameEs: 'Blastomicosis (Blastomyces dermatitidis / gilchristii)',
    geographyEn: 'Ohio and Mississippi River Valleys, Great Lakes basin, Saint Lawrence Seaway.',
    geographyEs: 'Valles de los ríos Ohio y Misisipi, cuenca de los Grandes Lagos, río San Lorenzo.',
    morphologyEn: 'Thermal dimorphic yeast: Broad-based budding yeast (8–15 µm) with thick refractile double wall.',
    morphologyEs: 'Hongo dimórfico: Levaduras con gemación de base ancha (8-15 µm) y pared doble refringente.',
    clinicalHallmarksEn: 'Heaped-up verrucous (wart-like) skin plaques with advancing microabscesses. Frequently mimics Pyoderma Gangrenosum or Xylazine ulcers. DANGER: Steroids cause fatal dissemination. Disc-sparing osteoarticular spondylitis.',
    clinicalHallmarksEs: 'Placas verrugosas elevadas con microabscesos en el borde activo. Simula Pioderma Gangrenoso o úlceras por Xilacina. PELIGRO: Los corticoides causan diseminación mortal. Espondilitis que respeta el disco.',
    primaryTreatmentEn: 'Severe: Liposomal Amphotericin B 3–5 mg/kg/day IV. Mild/Maintenance: Itraconazole 200 mg TID x 3 days, then 200 mg BID x 6–12 months.',
    primaryTreatmentEs: 'Grave: Anfotericina B Liposomal 3-5 mg/kg/día IV. Leve/Mantenimiento: Itraconazol 200 mg c/8h x 3d, luego 200 mg c/12h por 6-12 meses.',
  }),

  coccidioidomycosis: Object.freeze({
    id: 'coccidioidomycosis',
    nameEn: 'Coccidioidomycosis ("Valley Fever" / Coccidioides immitis/posadasii)',
    nameEs: 'Coccidioidomicosis («Fiebre del Valle» / Coccidioides immitis/posadasii)',
    geographyEn: 'Arid Southwest US (San Joaquin Valley, Arizona desert, West Texas, New Mexico, Utah).',
    geographyEs: 'Suroeste árido de EE. UU. (Valle de San Joaquín, desierto de Arizona, oeste de Texas, Nuevo México).',
    morphologyEn: 'Thick-walled spherules (20–100 µm) filled with hundreds of endospores (2–5 µm).',
    morphologyEs: 'Esférulas de pared gruesa (20-100 µm) repletas de endosporas (2-5 µm).',
    clinicalHallmarksEn: 'Pneumonia following dust storms ("haboobs"). Erythema Nodosum ("desert bumps") on anterior shins indicates robust T-cell immunity. Disseminated: Verrucous skin granulomas, meningitis.',
    clinicalHallmarksEs: 'Neumonía tras tormentas de polvo. El Eritema Nudoso en espinillas refleja inmunidad celular activa y mejor pronóstico. Diseminada: Granulomas cutáneos y meningitis.',
    primaryTreatmentEn: 'Mild pulmonary: Fluconazole 400–800 mg PO daily x 3–6 months. Severe/Meningeal: Liposomal Amphotericin B 5 mg/kg/day IV or high-dose Fluconazole.',
    primaryTreatmentEs: 'Pulmonar leve: Fluconazol 400-800 mg VO al día por 3-6 meses. Grave/Meníngea: Anfotericina B Liposomal 5 mg/kg/día IV o Fluconazol a dosis altas.',
  }),

  histoplasmosis: Object.freeze({
    id: 'histoplasmosis',
    nameEn: 'Histoplasmosis (Histoplasma capsulatum)',
    nameEs: 'Histoplasmosis (Histoplasma capsulatum)',
    geographyEn: 'Ohio and Mississippi River Valleys; enriched in soil with bird/bat guano (caves, bridges, attics).',
    geographyEs: 'Valles de los ríos Ohio y Misisipi; suelo con guano de aves o murciélagos (cuevas, puentes, áticos).',
    morphologyEn: 'Small intracellular oval yeast (2–4 µm) with narrow-based budding inside macrophages.',
    morphologyEs: 'Pequeñas levaduras ovales intracelulares (2-4 µm) con gemación de base estrecha dentro de macrófagos.',
    clinicalHallmarksEn: 'Disseminated in HIV (CD4 < 150) or severe malnutrition: Miliary lung infiltrate, hepatosplenomegaly, umbilicated skin papules, painful oral hard-palate ulcers, and pancytopenia.',
    clinicalHallmarksEs: 'Diseminada en VIH (CD4 < 150) o desnutrición: Infiltrado miliar, hepatoesplenomegalia, pápulas umbilicadas, úlceras dolorosas en paladar duro y pancitopenia.',
    primaryTreatmentEn: 'Severe: Liposomal Amphotericin B 3 mg/kg/day IV x 1–2 weeks, then Itraconazole 200 mg BID x 12 months. Monitor urine Histoplasma antigen.',
    primaryTreatmentEs: 'Grave: Anfotericina B Liposomal 3 mg/kg/día IV x 1-2 semanas, luego Itraconazol 200 mg c/12h por 12 meses. Monitorizar antígeno en orina.',
  }),

  aspergillus: Object.freeze({
    id: 'aspergillus',
    nameEn: 'Invasive Aspergillosis (Aspergillus fumigatus / flavus)',
    nameEs: 'Aspergilosis Invasiva (Aspergillus fumigatus / flavus)',
    geographyEn: 'Ubiquitous mold in soil, construction dust, decaying vegetation, and contaminated street cannabis.',
    geographyEs: 'Moho ubicuo en tierra, polvo de construcción, materia vegetal y cannabis contaminado.',
    morphologyEn: 'Septate hyphae branching dichotomously at acute 45° angles. Angioinvasive.',
    morphologyEs: 'Hifas tabicadas con ramificación dicotómica en ángulo agudo de 45°. Angioinvasivo.',
    clinicalHallmarksEn: 'Angioinvasive pulmonary necrosis. Chest CT shows "Halo Sign" (solid nodule surrounded by ground-glass hemorrhage). Cough, hemoptysis, pleuritic chest pain in neutropenia/PWUD.',
    clinicalHallmarksEs: 'Necrosis pulmonar angioinvasiva. La TAC muestra el «Signo del Halo» (nódulo rodeado de vidrio deslustrado hemorrágico). Tos, hemoptisis y dolor pleurítico.',
    primaryTreatmentEn: 'Voriconazole 6 mg/kg IV q12h x 2 doses, then 4 mg/kg IV q12h (or 200 mg PO BID). Target trough: 1.5–5.5 µg/mL. Alternative: Isavuconazole.',
    primaryTreatmentEs: 'Voriconazol 6 mg/kg IV c/12h x 2 dosis, luego 4 mg/kg IV c/12h (o 200 mg VO c/12h). Nivel valle: 1,5-5,5 µg/mL. Alternativa: Isavuconazol.',
  }),

  mucorales: Object.freeze({
    id: 'mucorales',
    nameEn: 'Mucormycosis (Rhizopus / Mucor / Lichtheimia)',
    nameEs: 'Mucormicosis (Rhizopus / Mucor / Lichtheimia)',
    geographyEn: 'Ubiquitous environmental molds; thrives in diabetic ketoacidosis, deferoxamine therapy, and severe neutropenia.',
    geographyEs: 'Mohos ambientales ubicuos; proliferan en cetoacidosis diabética, desferoxamina y neutropenia grave.',
    morphologyEn: 'Broad, ribbon-like non-septate (pauciseptate) hyphae branching at wide 90° right angles.',
    morphologyEs: 'Hifas anchas en cinta, no tabicadas (pauciseptadas), con ramificación en ángulo recto de 90°.',
    clinicalHallmarksEn: 'Rapidly progressive black necrotic eschars on nasal turbinates, hard palate, or skin. Severe vascular thrombosis. NOTE: (1->3)-beta-D-Glucan (Fungitell) test is CONSISTENTLY NEGATIVE.',
    clinicalHallmarksEs: 'Escaras negras necróticas de rápida evolución en cornetes nasales, paladar o piel. Trombosis vascular fulminante. NOTA: La prueba de (1->3)-beta-D-Glucano es SIEMPRE NEGATIVA.',
    primaryTreatmentEn: 'EMERGENT SURGICAL DEBRIDEMENT + Liposomal Amphotericin B 5–10 mg/kg/day IV. Step-down: Posaconazole or Isavuconazole.',
    primaryTreatmentEs: 'DESBRIDAMIENTO QUIRÚRGICO DE URGENCIA + Anfotericina B Liposomal 5-10 mg/kg/día IV. Transición: Posaconazol o Isavuconazol.',
  }),
});

export const AZOLE_MOUD_INTERACTIONS = Object.freeze({
  methadone_cyp3a4: Object.freeze({
    titleEn: 'POTENT CYP3A4 INHIBITION & METHADONE OVERDOSE RISK',
    titleEs: 'INHIBICIÓN POTENTE DE CYP3A4 Y RIESGO DE SOBREDOSIS POR METADONA',
    mechanismEn: 'Azoles (Itraconazole, Voriconazole, Posaconazole, Fluconazole) potently inhibit hepatic and intestinal CYP3A4, reducing methadone clearance by 40%–60% and causing a 1.5x–2.5x surge in active methadone serum levels.',
    mechanismEs: 'Los azoles inhiben intensamente el CYP3A4 hepático e intestinal, reduciendo la eliminación de metadona entre 40% y 60% y duplicando sus niveles plasmáticos.',
    clinicalMandateEn: 'PROACTIVELY REDUCE METHADONE DOSE BY 25% TO 50% upon initiating azole therapy. Coordinate directly with treating OTP clinic.',
    clinicalMandateEs: 'REDUCIR DE FORMA PROACTIVA LA DOSIS DE METADONA EN UN 25% A 50% al iniciar el azol. Coordinar de inmediato con la clínica OTP tratante.',
  }),

  qtc_prolongation: Object.freeze({
    titleEn: 'ADDITIVE QTC PROLONGATION & TORSADES DE POINTES HAZARD',
    titleEs: 'PROLONGACIÓN ADITIVA DEL INTERVALO QTC Y RIESGO DE TORSADES DE POINTES',
    mechanismEn: 'Both Methadone AND Azoles block cardiac hERG/IKr potassium channels. Baseline QTc > 500 ms or delta QTc > 60 ms creates lethal ventricular dysrhythmia risk.',
    mechanismEs: 'Tanto la metadona como los azoles bloquean los canales cardíacos de potasio hERG/IKr. Un QTc > 500 ms o aumento > 60 ms induce arritmias ventriculares letales.',
    clinicalMandateEn: 'Obtain baseline 12-lead ECG, repeat at 48–72h. Maintain K+ ≥ 4.0 mEq/L and Mg2+ ≥ 2.0 mg/dL. If QTc > 500 ms, consider switching to Liposomal Amphotericin B or Isavuconazole (which shortens QTc).',
    clinicalMandateEs: 'Electrocardiograma basal y repetir a las 48-72h. Mantener potasio ≥ 4,0 mEq/L y magnesio ≥ 2,0 mg/dL. Si QTc > 500 ms, cambiar a Anfotericina B Liposomal o Isavuconazol (que acorta el QTc).',
  }),

  buprenorphine_cyp3a4: Object.freeze({
    titleEn: 'BUPRENORPHINE CYP3A4 INTERACTION (PARTIAL AGONIST CEILING)',
    titleEs: 'INTERACCIÓN DE BUPRENORFINA CON CYP3A4 (TECHO DE AGONISTA PARCIAL)',
    mechanismEn: 'Azole CYP3A4 inhibition increases buprenorphine AUC by 50%–70%. Because buprenorphine is a partial mu-opioid agonist, fatal respiratory arrest is rare, but oversedation and nausea occur.',
    mechanismEs: 'La inhibición de CYP3A4 eleva el AUC de buprenorfina en 50-70%. Al ser agonista parcial, el riesgo de paro respiratorio es menor, pero causa somnolencia y náuseas.',
    clinicalMandateEn: 'Monitor for cognitive blunting and somnolence. Empirically reduce buprenorphine dose by 20%–25% if oversedation develops.',
    clinicalMandateEs: 'Vigilar somnolencia excesiva. Reducir empíricamente la dosis un 20%-25% si se observa sedación marcada.',
  }),
});

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateFungalInfection({
  pathogen = 'blastomycosis',
  moudType = 'methadone',
  baselineQtc = 440,
  hasVerrucousPlaques = true,
  hasBlackEschar = false,
  hasSpondylodiscitis = false,
  isImmunocompromised = false,
  steroidsPrescribed = false,
} = {}) {
  const alerts = [];
  const diagnosticDirectives = [];
  const therapeuticActions = [];

  const pathInfo = FUNGAL_PATHOGENS[pathogen] || FUNGAL_PATHOGENS.blastomycosis;

  // Steroid Contraindication in Fungal Lesions (Pyoderma Gangrenosum mimic danger)
  if (steroidsPrescribed && (pathogen === 'blastomycosis' || pathogen === 'histoplasmosis' || hasVerrucousPlaques)) {
    alerts.push({
      type: 'critical',
      textEn: 'CRITICAL LETHAL HAZARD: Corticosteroids prescribed for suspected Pyoderma Gangrenosum in a patient with deep fungal infection. Steroid monotherapy abolishes cell-mediated immunity and triggers fatal fungal dissemination and septic shock. HALT STEROIDS STAT.',
      textEs: 'PELIGRO MORTAL CRÍTICO: Corticoides prescritos por sospecha de Pioderma Gangrenoso en infección fúngica profunda. Los corticoides anulan la inmunidad celular y provocan diseminación fúngica fulminante y shock séptico. SUSPENDER CORTICOIDES STAT.',
    });
    diagnosticDirectives.push({
      priority: 'stat',
      titleEn: 'Perform Punch Biopsy with Fungal Stains (GMS/PAS)',
      titleEs: 'Realizar Biopsia en Sacabocados con Tinciones Fúngicas (GMS/PAS)',
      descEn: 'Differentiate verrucous fungal plaques from true Pyoderma Gangrenosum before initiating any immunosuppressive therapy.',
      descEs: 'Diferenciar placas fúngicas verrugosas de verdadero Pioderma Gangrenoso antes de iniciar cualquier inmunosupresor.',
    });
  }

  // Mucormycosis Surgical Emergency
  if (hasBlackEschar || pathogen === 'mucorales') {
    alerts.push({
      type: 'critical',
      textEn: 'SURGICAL EMERGENCY: Rapidly expanding black necrotic eschar indicates angioinvasive Mucormycosis. Immediate surgical ENT/debridement consultation required within hours.',
      textEs: 'EMERGENCIA QUIRÚRGICA: Escara negra necrótica de rápida progresión compatible con Mucormicosis angioinvasiva. Consulta quirúrgica urgente para desbridamiento en pocas horas.',
    });
    diagnosticDirectives.push({
      priority: 'stat',
      titleEn: 'Emergency Surgical Debridement + Frozen Section',
      titleEs: 'Desbridamiento Quirúrgico de Urgencia + Biopsia por Congelación',
      descEn: 'Inspect for broad non-septate 90° branching hyphae. NOTE: (1->3)-beta-D-Glucan is consistently negative in Mucorales.',
      descEs: 'Buscar hifas anchas no tabicadas con ramificación a 90°. NOTA: El (1->3)-beta-D-Glucano es siempre negativo en Mucorales.',
    });
    therapeuticActions.push('Liposomal Amphotericin B 5–10 mg/kg/day IV');
  }

  // MOUD Drug Interactions
  if (moudType === 'methadone') {
    alerts.push({
      type: 'danger',
      textEn: 'METHADONE + AZOLE CYP3A4 INHIBITION ALERT: Starting Itraconazole, Voriconazole, or Posaconazole doubles serum methadone concentrations. Proactively decrease methadone dose by 25% to 50% to prevent fatal respiratory depression.',
      textEs: 'ALERTA DE INHIBICIÓN CYP3A4 (METADONA + AZOLES): El uso de Itraconazol, Voriconazol o Posaconazol duplica los niveles de metadona. Reducir la dosis de metadona un 25% a 50% para evitar paro respiratorio.',
    });
    therapeuticActions.push('Proactively reduce Methadone dose by 25%–50% upon azole initiation');

    // QTc evaluation
    if (baselineQtc >= 480) {
      alerts.push({
        type: 'danger',
        textEn: `High Baseline QTc Interval (${baselineQtc} ms): Co-administering Methadone and an Azole creates an extreme risk of Torsades de Pointes. Daily ECG telemetry and aggressive K+/Mg2+ repletion required.`,
        textEs: `Intervalo QTc Basal Prolongado (${baselineQtc} ms): La combinación de Metadona y Azoles genera riesgo extremo de Torsades de Pointes. Telemetría diaria y reposición intensiva de K+/Mg2+.`,
      });
      therapeuticActions.push('Switch to Liposomal Amphotericin B or Isavuconazole (does not prolong QTc)');
    }
  } else if (moudType === 'buprenorphine') {
    alerts.push({
      type: 'warning',
      textEn: 'BUPRENORPHINE + AZOLE CYP3A4 INTERACTION: Buprenorphine clearance decreased by 50%. Monitor for somnolence; empirically reduce dose by 20% if oversedation occurs.',
      textEs: 'INTERACCIÓN BUPRENORFINA + AZOLES (CYP3A4): Eliminación de buprenorfina reducida un 50%. Vigilar somnolencia; reducir dosis un 20% si se presenta sedación.',
    });
    therapeuticActions.push('Monitor clinical sedation; reduce Buprenorphine dose by 20% if indicated');
  }

  // Spondylodiscitis Disc-Sparing Rule
  if (hasSpondylodiscitis) {
    diagnosticDirectives.push({
      priority: 'high',
      titleEn: 'Evaluate for Disc-Sparing Fungal Spondylitis',
      titleEs: 'Evaluar Espondilitis Fúngica con Respeto del Espacio Discal',
      descEn: 'Bacterial discitis destroys the cartilaginous disc early. Blastomycosis and fungal spondylitis characteristically PRESERVE the disc space with large cold paraspinous abscesses.',
      descEs: 'La discitis bacteriana destruye el disco precozmente. La blastomicosis y micosis vertebrales suelen PRESERVAR el disco con grandes abscesos fríos paravertebrales.',
    });
  }

  // Standard Pathogen Action
  if (pathInfo && !therapeuticActions.some((a) => a.includes(pathInfo.primaryTreatmentEn))) {
    therapeuticActions.push(pathInfo.primaryTreatmentEn);
  }

  return {
    pathInfo,
    alerts,
    diagnosticDirectives,
    therapeuticActions,
  };
}

// ============================================================================
// ZERO-PII EPHEMERAL STATE CONTROLLER
// ============================================================================

let state = {
  pathogen: 'blastomycosis',
  moudType: 'methadone',
  baselineQtc: 450,
  hasVerrucousPlaques: true,
  hasBlackEschar: false,
  hasSpondylodiscitis: false,
  isImmunocompromised: false,
  steroidsPrescribed: false,
};

const subscribers = new Set();

export function getFungalState() {
  return { ...state };
}

export function updateFungalState(patch) {
  state = { ...state, ...patch };
  subscribers.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('State subscriber error', e);
    }
  });
}

export function resetFungalState() {
  state = {
    pathogen: 'blastomycosis',
    moudType: 'methadone',
    baselineQtc: 450,
    hasVerrucousPlaques: true,
    hasBlackEschar: false,
    hasSpondylodiscitis: false,
    isImmunocompromised: false,
    steroidsPrescribed: false,
  };
  subscribers.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('State subscriber error', e);
    }
  });
}

export function subscribeFungalState(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// ============================================================================
// SBAR CLINICAL HANDOFF GENERATOR
// ============================================================================

export function generateFungalSbar(st, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateFungalInfection(st);

  if (isEs) {
    return [
      'TRANSFERENCIA CLÍNICA SBAR - MICOSIS OPORTUNISTAS Y MOUD (CERO PII)',
      '-------------------------------------------------------------------------',
      `S (Situación): Paciente con sospecha/confirmación de ${evalResult.pathInfo.nameEs.toUpperCase()} bajo tratamiento MOUD con ${st.moudType.toUpperCase()}.`,
      `B (Antecedentes): Inmunocompromiso/VIH: ${st.isImmunocompromised ? 'SÍ' : 'NO'}. Corticoides previos para pioderma: ${st.steroidsPrescribed ? 'SÍ (ALERTA CRÍTICA)' : 'NO'}. QTc basal: ${st.baselineQtc} ms.`,
      `A (Evaluación): Placas verrugosas: ${st.hasVerrucousPlaques ? 'Presentes' : 'Ausentes'}. Escara negra necrótica: ${st.hasBlackEschar ? 'PRESENTE (EMERGENCIA QUIRÚRGICA MUCOR)' : 'Ausente'}. Espondilodiscitis: ${st.hasSpondylodiscitis ? 'Presente (Evaluar respeto discal)' : 'Ausente'}.`,
      `R (Recomendación): ${evalResult.therapeuticActions.join('; ')}. ${st.moudType === 'methadone' ? 'Reducir dosis de Metadona 25%-50% si se inicia azol y vigilar QTc. ' : ''}${st.steroidsPrescribed ? 'SUSPENDER CORTICOIDES STAT. ' : ''}Biopsia con tinción GMS/PAS y antígenos en orina.`,
    ].join('\n');
  }

  return [
    'SBAR CLINICAL HANDOFF - OPPORTUNISTIC FUNGAL & MOUD CONTINUITY (ZERO-PII)',
    '-------------------------------------------------------------------------',
    `S (Situation): Patient presenting with suspected/confirmed ${evalResult.pathInfo.nameEn.toUpperCase()} on active ${st.moudType.toUpperCase()} MOUD regimen.`,
    `B (Background): Immunocompromised/HIV: ${st.isImmunocompromised ? 'YES' : 'NO'}. Prior steroid therapy for presumed PG: ${st.steroidsPrescribed ? 'YES (CRITICAL HAZARD)' : 'NO'}. Baseline QTc: ${st.baselineQtc} ms.`,
    `A (Assessment): Verrucous plaques: ${st.hasVerrucousPlaques ? 'Present' : 'Absent'}. Black necrotic eschar: ${st.hasBlackEschar ? 'PRESENT (EMERGENT MUCOR CONSULT)' : 'Absent'}. Spondylodiscitis: ${st.hasSpondylodiscitis ? 'Present (Assess disc-sparing)' : 'Absent'}.`,
    `R (Recommendation): ${evalResult.therapeuticActions.join('; ')}. ${st.moudType === 'methadone' ? 'Proactively reduce Methadone dose by 25%–50% upon azole initiation and monitor QTc. ' : ''}${st.steroidsPrescribed ? 'HALT CORTICOSTEROIDS STAT. ' : ''}Punch biopsy with GMS/PAS stains and urine Histoplasma/Blastomyces antigen EIA.`,
  ].join('\n');
}

// ============================================================================
// MAIN DOM VIEW
// ============================================================================

export function fungalOpportunisticCareView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const container = h('div', { class: 'fungal-care-view' });

  // Header
  const header = pageHeader({
    title: isEs
      ? 'Micosis Fúngicas Profundas, Infecciones Oportunistas y MOUD'
      : 'Opportunistic Deep Fungal Infections & MOUD Interoperability',
    subtitle: isEs
      ? 'Diagnóstico diferencial de blastomicosis, coccidioidomicosis, mucorales, inhibición de CYP3A4 y ajuste de dosis de metadona'
      : 'Differential diagnosis of blastomycosis, valley fever, mucormycosis, azole CYP3A4 inhibition & proactive methadone dosing',
  });
  container.appendChild(header);

  // Layout Grid
  const grid = h('div', { class: 'fungal-grid' });
  container.appendChild(grid);

  // Left Column: Fungal Selection & Clinical Findings
  const leftCol = h('div', { class: 'fungal-col' });
  grid.appendChild(leftCol);

  // Card 1: Pathogen Selector
  const pathCard = h('div', { class: 'fungal-card' });
  leftCol.appendChild(pathCard);

  const pathTitle = h('h2', { class: 'fungal-card-title' });
  pathTitle.appendChild(icon('activity'));
  pathTitle.appendChild(h('span', null, isEs ? '1. Micosis u Hongo Oportunista Sospechado' : '1. Suspected Fungal or Opportunistic Pathogen'));
  pathCard.appendChild(pathTitle);

  const pathSelect = h('select', { id: 'pathogen-select', class: 'fungal-select' });
  Object.keys(FUNGAL_PATHOGENS).forEach((k) => {
    const p = FUNGAL_PATHOGENS[k];
    const opt = h('option', { value: k }, isEs ? p.nameEs : p.nameEn);
    pathSelect.appendChild(opt);
  });
  pathSelect.value = state.pathogen;
  pathSelect.addEventListener('change', (e) => {
    updateFungalState({ pathogen: e.target.value });
  });
  pathCard.appendChild(pathSelect);

  // Dynamic Pathogen Details Box
  const pathDetailsBox = h('div', { class: 'fungal-path-details' });
  pathCard.appendChild(pathDetailsBox);

  function updatePathDetails() {
    clear(pathDetailsBox);
    const p = FUNGAL_PATHOGENS[state.pathogen];
    if (!p) return;
    pathDetailsBox.appendChild(h('p', { class: 'font-semibold' }, isEs ? `Geografía: ${p.geographyEs}` : `Geography: ${p.geographyEn}`));
    pathDetailsBox.appendChild(h('p', null, isEs ? `Morfología: ${p.morphologyEs}` : `Morphology: ${p.morphologyEn}`));
    pathDetailsBox.appendChild(h('p', { class: 'text-sm text-muted' }, isEs ? `Clínica: ${p.clinicalHallmarksEs}` : `Hallmarks: ${p.clinicalHallmarksEn}`));
  }
  updatePathDetails();

  // Card 2: MOUD Regimen & QTc
  const moudCard = h('div', { class: 'fungal-card' });
  leftCol.appendChild(moudCard);

  const moudTitle = h('h2', { class: 'fungal-card-title' });
  moudTitle.appendChild(icon('shield'));
  moudTitle.appendChild(h('span', null, isEs ? '2. Régimen MOUD y Parámetros Cardíacos' : '2. MOUD Regimen & Cardiac Parameters'));
  moudCard.appendChild(moudTitle);

  // MOUD Select
  const moudGroup = h('div', { class: 'fungal-field-group' });
  moudCard.appendChild(moudGroup);

  moudGroup.appendChild(h('label', { class: 'fungal-label', for: 'moud-type-select' }, isEs ? 'Medicamento para OUD en Uso:' : 'Active MOUD Medication:'));
  const moudSelect = h('select', { id: 'moud-type-select', class: 'fungal-select' });
  moudSelect.appendChild(h('option', { value: 'methadone' }, isEs ? 'Metadona (Alto Riesgo CYP3A4 y QTc)' : 'Methadone (High CYP3A4 & QTc Risk)'));
  moudSelect.appendChild(h('option', { value: 'buprenorphine' }, isEs ? 'Buprenorfina (Efecto Techo en Apnea)' : 'Buprenorphine (Ceiling Effect on Apnea)'));
  moudSelect.appendChild(h('option', { value: 'naltrexone' }, isEs ? 'Naltrexona (Sin Interacción CYP3A4/QTc)' : 'Naltrexone (No CYP3A4/QTc Interaction)'));
  moudSelect.appendChild(h('option', { value: 'none' }, isEs ? 'Sin MOUD Activo' : 'No Active MOUD'));
  moudSelect.value = state.moudType;
  moudSelect.addEventListener('change', (e) => {
    updateFungalState({ moudType: e.target.value });
  });
  moudGroup.appendChild(moudSelect);

  // QTc Input
  const qtcGroup = h('div', { class: 'fungal-field-group' });
  moudCard.appendChild(qtcGroup);

  qtcGroup.appendChild(h('label', { class: 'fungal-label', for: 'qtc-input' }, isEs ? 'Intervalo QTc Basal (ms en ECG):' : 'Baseline QTc Interval (ms on ECG):'));
  const qtcInput = h('input', {
    id: 'qtc-input',
    type: 'number',
    step: '5',
    min: '300',
    max: '650',
    class: 'fungal-num-input',
    value: state.baselineQtc.toString(),
  });
  qtcInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) updateFungalState({ baselineQtc: val });
  });
  qtcGroup.appendChild(qtcInput);

  // Bedside Checkboxes
  const fungalCheckList = [
    {
      key: 'hasVerrucousPlaques',
      labelEn: 'Hypertrophic Verrucous Plaques with Microabscesses',
      labelEs: 'Placas Verrugosas Hipertróficas con Microabscesos',
      descEn: 'Hallmark of Blastomycosis. Frequently misdiagnosed as Pyoderma Gangrenosum.',
      descEs: 'Signo clave de Blastomicosis. Se confunde con Pioderma Gangrenoso.',
    },
    {
      key: 'hasBlackEschar',
      labelEn: 'Rapidly Spreading Black Necrotic Eschar (Nasal / Palatal / Skin)',
      labelEs: 'Escara Negra Necrótica Rápida (Nasal, Paladar o Piel)',
      descEn: 'CRITICAL: Angioinvasive Mucormycosis hallmark. Requires emergent debridement.',
      descEs: 'CRÍTICO: Signo de Mucormicosis angioinvasiva. Requiere cirugía de urgencia.',
      isEmergency: true,
    },
    {
      key: 'steroidsPrescribed',
      labelEn: 'Corticosteroids Prescribed or Considered for Suspected "PG"',
      labelEs: 'Corticoides Prescritos o Considerados por Sospecha de «Pioderma»',
      descEn: 'LETHAL HAZARD: Steroid monotherapy in mycoses causes fatal dissemination.',
      descEs: 'PELIGRO MORTAL: Corticoides en micosis provocan diseminación fulminante.',
      isEmergency: true,
    },
    {
      key: 'hasSpondylodiscitis',
      labelEn: 'Spondylitis / Vertebral Osteomyelitis on Imaging',
      labelEs: 'Espondilitis u Osteomielitis Vertebral en Imágenes',
      descEn: 'Fungal spondylitis characteristically PRESERVES the intervertebral disc.',
      descEs: 'La espondilitis fúngica típicamente RESPETA el espacio del disco.',
    },
    {
      key: 'isImmunocompromised',
      labelEn: 'Immunocompromised (HIV CD4 < 200, Cirrhosis, Dialysis)',
      labelEs: 'Inmunocomprometido (VIH CD4 < 200, Cirrosis, Diálisis)',
      descEn: 'Dramatically increases risk for disseminated histoplasmosis and molds.',
      descEs: 'Aumenta notablemente el riesgo de diseminación y fungemia.',
    },
  ];

  fungalCheckList.forEach((item) => {
    const row = h('div', { class: `fungal-check-row ${item.isEmergency ? 'emergency-row' : ''}` });
    const chk = h('input', { type: 'checkbox', id: `chk-${item.key}` });
    chk.checked = Boolean(state[item.key]);
    chk.addEventListener('change', (e) => {
      updateFungalState({ [item.key]: e.target.checked });
    });
    row.appendChild(chk);

    const lbl = h('label', { for: `chk-${item.key}`, class: 'fungal-check-label' });
    lbl.appendChild(h('span', { class: 'font-semibold' }, isEs ? item.labelEs : item.labelEn));
    lbl.appendChild(h('span', { class: 'fungal-subtext' }, isEs ? item.descEs : item.descEn));
    row.appendChild(lbl);

    moudCard.appendChild(row);
  });

  // Right Column: Directives & SBAR
  const rightCol = h('div', { class: 'fungal-col' });
  grid.appendChild(rightCol);

  const resultsContainer = h('div', { class: 'fungal-results' });
  rightCol.appendChild(resultsContainer);

  function renderResults() {
    clear(resultsContainer);

    const evalResult = evaluateFungalInfection(state);

    // Alerts
    evalResult.alerts.forEach((alert) => {
      const alertBox = h('div', { class: `fungal-alert-box alert-${alert.type}` });
      alertBox.appendChild(icon('alert'));
      alertBox.appendChild(h('span', null, isEs ? alert.textEs : alert.textEn));
      resultsContainer.appendChild(alertBox);
    });

    // Diagnostic Directives Card
    if (evalResult.diagnosticDirectives.length > 0) {
      const diagCard = h('div', { class: 'fungal-card' });
      resultsContainer.appendChild(diagCard);

      const diagTitle = h('h3', { class: 'fungal-card-title' }, isEs ? 'Directivas Diagnósticas y Biomarcadores' : 'Diagnostic & Biomarker Directives');
      diagCard.appendChild(diagTitle);

      const diagList = h('div', { class: 'fungal-action-list' });
      diagCard.appendChild(diagList);

      evalResult.diagnosticDirectives.forEach((dir) => {
        const item = h('div', { class: `fungal-action-item priority-${dir.priority}` });
        const head = h('div', { class: 'fungal-action-head' });
        head.appendChild(h('span', { class: 'fungal-badge' }, dir.priority.toUpperCase()));
        head.appendChild(h('strong', null, isEs ? dir.titleEs : dir.titleEn));
        item.appendChild(head);
        item.appendChild(h('p', { class: 'fungal-action-desc' }, isEs ? dir.descEs : dir.descEn));
        diagList.appendChild(item);
      });
    }

    // Therapeutic Actions Card
    const thCard = h('div', { class: 'fungal-card' });
    resultsContainer.appendChild(thCard);

    const thTitle = h('h3', { class: 'fungal-card-title' }, isEs ? 'Farmacoterapia y Ajustes de MOUD' : 'Pharmacotherapy & MOUD Dose Adjustments');
    thCard.appendChild(thTitle);

    const thList = h('ul', { class: 'fungal-supply-list' });
    evalResult.therapeuticActions.forEach((act) => {
      const li = h('li', null);
      li.appendChild(icon('check'));
      li.appendChild(h('span', null, act));
      thList.appendChild(li);
    });
    thCard.appendChild(thList);

    // SBAR Section
    const sbarCard = h('div', { class: 'fungal-card' });
    resultsContainer.appendChild(sbarCard);

    const sbarTitle = h('h3', { class: 'fungal-card-title' }, isEs ? 'Transferencia Clínica SBAR (Cero PII)' : 'Zero-PII SBAR Handoff Report');
    sbarCard.appendChild(sbarTitle);

    const sbarArea = h('textarea', { class: 'fungal-sbar-textarea', rows: 7, readonly: true });
    sbarArea.value = generateFungalSbar(state, lang);
    sbarCard.appendChild(sbarArea);

    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' });
    copyBtn.appendChild(icon('copy'));
    copyBtn.appendChild(h('span', null, isEs ? 'Copiar Reporte SBAR' : 'Copy SBAR Report'));
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sbarArea.value);
        copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
        setTimeout(() => {
          clear(copyBtn);
          copyBtn.appendChild(icon('copy'));
          copyBtn.appendChild(h('span', null, isEs ? 'Copiar Reporte SBAR' : 'Copy SBAR Report'));
        }, 2000);
      } catch (err) {
        sbarArea.select();
      }
    });
    sbarCard.appendChild(copyBtn);
  }

  // Initial render & subscription
  renderResults();
  const unsub = subscribeFungalState(() => {
    updatePathDetails();
    renderResults();
  });

  return container;
}
