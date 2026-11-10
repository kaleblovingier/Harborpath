// public/js/views/disasterMoudClimate.js
// HarborPath - Extreme Weather & Wildfire Disaster MOUD Continuity Navigator
// Regulatory & Clinical Framework: SAMHSA 42 CFR Part 8.11(h) & 8.12(i) Emergency Flexibilities,
// FEMA/HHS Section 319 Public Health Emergency Flexibilities, EPA/CDC Wildfire Smoke Health Guidance,
// Corsi-Rosenthal Low-Cost Filtration Engineering, and CDC Post-Disaster Infectious Triage (Leptospirosis/Tetanus/Trench Foot).
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// REGULATORY & CLINICAL CONSTANTS
// ============================================================================

export const DISASTER_MOUD_FLEXIBILITIES = Object.freeze({
  stable_takehome: Object.freeze({
    id: 'stable_takehome',
    titleEn: 'Stable Patient Emergency Take-Home Authorization (Up to 28 Days)',
    titleEs: 'Autorización de Dosis de Emergencia para Pacientes Estables (Hasta 28 Días)',
    statuteEn: 'SAMHSA 42 CFR § 8.12(i)(1) / § 8.11(h)',
    statuteEs: 'SAMHSA 42 CFR § 8.12(i)(1) / § 8.11(h)',
    summaryEn: 'Provides up to 28 days (full monthly supply) of unsupervised take-home medication regardless of tenure in treatment. Eliminates traditional multi-year step requirements during environmental disasters.',
    summaryEs: 'Proporciona hasta 28 días (mes completo) de medicación para llevar sin supervisión, sin importar el tiempo en tratamiento, eliminando requisitos tradicionales de permanencia.',
    criteriaEn: 'Patient assessed as clinically stable with secure storage capacity (waterproof, lockable container).',
    criteriaEs: 'Paciente evaluado como clínicamente estable con capacidad de almacenamiento seguro (caja impermeable con llave).',
  }),

  acute_takehome: Object.freeze({
    id: 'acute_takehome',
    titleEn: 'Acute Phase / Less Stable Emergency Supply (Up to 14 Days)',
    titleEs: 'Suministro de Emergencia para Fase Aguda / Menor Estabilidad (Hasta 14 Días)',
    statuteEn: 'SAMHSA 42 CFR § 8.12(i)(2) / 2024 Final Rule',
    statuteEs: 'SAMHSA 42 CFR § 8.12(i)(2) / Regla Final 2024',
    summaryEn: 'Authorizes up to 14 days of take-home doses if the medical director determines the life threat of acute withdrawal and illicit relapse during a catastrophe far exceeds diversion risks.',
    summaryEs: 'Autoriza hasta 14 días de dosis para llevar si el director médico determina que el riesgo vital del síndrome de abstinencia supera ampliamente el riesgo de desvío.',
    criteriaEn: 'Basic lockable pouch or container available; daily phone check-in or peer contact established if mobile network operates.',
    criteriaEs: 'Disponibilidad de estuche con candado; contacto telefónico diario o enlace con pares si hay señal celular.',
  }),

  guest_dosing: Object.freeze({
    id: 'guest_dosing',
    titleEn: 'Interstate Guest Dosing & Central Registry Reciprocity',
    titleEs: 'Dosificación Interestatal de Paciente Invitado y Reciprocidad de Registros',
    statuteEn: 'SAMHSA CSAT Inter-OTP Emergency Memorandum',
    statuteEs: 'Memorando de Emergencia Inter-OTP de SAMHSA CSAT',
    summaryEn: 'Receiving clinics in evacuation zones can initiate emergency guest dosing immediately without the standard 7–14 day advance processing window via phone/electronic handoff or Central Registry check.',
    summaryEs: 'Las clínicas receptoras en zonas de evacuación inician dosificación de invitado de inmediato sin esperar el trámite habitual de 7 a 14 días mediante enlace telefónico o registro central.',
    criteriaEn: 'Confirmation of active OTP enrollment, last witnessed dose, and daily dose (mg). If communications offline, initiate safety bridge dosing (methadone 20–30 mg or buprenorphine 4–8 mg).',
    criteriaEs: 'Confirmación de matrícula activa en OTP y última dosis tomada. Si las comunicaciones fallan, iniciar dosis puente de seguridad (metadona 20-30 mg o buprenorfina 4-8 mg).',
  }),

  mobile_units: Object.freeze({
    id: 'mobile_units',
    titleEn: 'Mobile Medication Unit (MMU) Emergency Muster Redeployment',
    titleEs: 'Despliegue de Emergencia de Unidades Móviles de Medicación (MMU)',
    statuteEn: 'DEA 21 CFR § 1301.13 / SAMHSA MMU Flexibilities',
    statuteEs: 'DEA 21 CFR § 1301.13 / Flexibilidades MMU de SAMHSA',
    summaryEn: 'MMUs operate under the parent OTP DEA license without requiring separate brick-and-mortar registrations, redeploying directly to FEMA shelters, Red Cross hubs, or municipal warming/cooling stations.',
    summaryEs: 'Las unidades móviles operan bajo la licencia DEA de la clínica matriz y se despliegan directamente a refugios de FEMA, centros de la Cruz Roja o albergues climáticos municipales.',
    criteriaEn: 'Equipped with Schedule II onboard safes, cellular dispensing logs, and emergency backup generator power.',
    criteriaEs: 'Equipadas con caja fuerte para sustancias controladas, registros de dispensación celular y generador eléctrico.',
  }),
});

export const AQI_LEVELS = Object.freeze({
  good: Object.freeze({
    range: '0–50',
    nameEn: 'Good',
    nameEs: 'Buena',
    badgeClass: 'badge-success',
    actionEn: 'Air quality satisfactory. Ideal conditions for normal outdoor outreach and activities.',
    actionEs: 'Calidad del aire satisfactoria. Condiciones ideales para actividades al aire libre.',
  }),
  moderate: Object.freeze({
    range: '51–100',
    nameEn: 'Moderate',
    nameEs: 'Moderada',
    badgeClass: 'badge-low',
    actionEn: 'Unusually sensitive individuals with COPD/asthma should stage rescue inhalers and spacers.',
    actionEs: 'Personas con EPOC/asma deben tener a mano sus inhaladores de rescate y aerocámaras.',
  }),
  sensitive: Object.freeze({
    range: '101–150',
    nameEn: 'Unhealthy for Sensitive Groups',
    nameEs: 'Insalubre para Grupos Sensibles',
    badgeClass: 'badge-moderate',
    actionEn: 'Street outreach distributes NIOSH-approved N95 respirators to unsheltered individuals with respiratory conditions.',
    actionEs: 'Equipos de calle distribuyen mascarillas N95 aprobadas por NIOSH a personas con patologías respiratorias.',
  }),
  unhealthy: Object.freeze({
    range: '151–200',
    nameEn: 'Unhealthy',
    nameEs: 'Insalubre',
    badgeClass: 'badge-warning',
    actionEn: 'Open cleaner air shelters. Advise PWUD to transition from smoking/combusting to oral/sublingual routes.',
    actionEs: 'Abrir refugios con aire filtrado. Recomendar a usuarios pasar del consumo fumado a vías orales o sublinguales.',
  }),
  very_unhealthy: Object.freeze({
    range: '201–300',
    nameEn: 'Very Unhealthy',
    nameEs: 'Muy Insalubre',
    badgeClass: 'badge-danger',
    actionEn: 'Health alert. Mobilize unsheltered individuals to 24/7 HEPA/MERV-13 cleaner air respite centers.',
    actionEs: 'Alerta sanitaria. Movilizar a personas sin techo a centros con aire purificado HEPA/MERV-13 las 24 horas.',
  }),
  hazardous: Object.freeze({
    range: '301–500',
    nameEn: 'Hazardous',
    nameEs: 'Peligrosa',
    badgeClass: 'badge-danger',
    actionEn: 'Emergency disaster state. Severe risk of acute respiratory distress, severe bronchospasm, and sudden cardiac events. Mandate indoor cleaner-air shelter.',
    actionEs: 'Estado de desastre. Riesgo crítico de insuficiencia respiratoria, broncoespasmo grave y eventos cardíacos. Refugio interior obligatorio.',
  }),
});

export const RESPIRATORY_PROTECTION = Object.freeze({
  n95: Object.freeze({
    type: 'n95',
    nameEn: 'NIOSH-Approved N95 / KN95 / KF94 Respirator',
    nameEs: 'Respirador N95 / KN95 / KF94 Aprobado por NIOSH',
    efficacyEn: 'Filters ≥ 95% of airborne particulate matter down to 0.3 microns (including PM2.5 wildfire smoke).',
    efficacyEs: 'Filtra el ≥ 95% de partículas en el aire de hasta 0,3 micras (incluyendo humo de incendios PM2,5).',
    guidanceEn: 'Form tight facial seal from nose bridge to chin. Perform user seal check on inhale/exhale.',
    guidanceEs: 'Ajustar firmemente desde el puente nasal hasta la barbilla. Comprobar sellado hermético al inhalar y exhalar.',
    isRecommended: true,
  }),
  surgical: Object.freeze({
    type: 'surgical',
    nameEn: 'Surgical / Procedure Mask',
    nameEs: 'Mascarilla Quirúrgica o de Procedimiento',
    efficacyEn: 'Filters large droplets only; DOES NOT filter PM2.5 smoke. 70–85% ambient air leaks around loose edges.',
    efficacyEs: 'Filtra solo gotas grandes; NO filtra humo PM2,5. El 70-85% del aire se filtra por los bordes holgados.',
    guidanceEn: 'Only use if no N95 is available to block visible ash particles.',
    guidanceEs: 'Usar únicamente si no hay N95 para frenar ceniza gruesa visible.',
    isRecommended: false,
  }),
  wet_cloth: Object.freeze({
    type: 'wet_cloth',
    nameEn: 'Wet Bandana / Cloth Scarf (DANGEROUS MYTH)',
    nameEs: 'Pañuelo o Bufanda Mojada (MITO PELIGROSO)',
    efficacyEn: '0% effective against PM2.5. Moisture increases breathing resistance and traps toxic volatile gases.',
    efficacyEs: '0% eficaz contra PM2,5. El agua aumenta el esfuerzo respiratorio y atrapa gases tóxicos.',
    guidanceEn: 'STRICT CONTRAINDICATION: Never wet fabric. Forces air around edges and gives false security.',
    guidanceEs: 'CONTRAINDICACIÓN ESTRICTA: No mojar telas. Desvía el aire por los bordes y crea falsa seguridad.',
    isHazardous: true,
  }),
});

export const POST_DISASTER_PATHOGENS = Object.freeze({
  leptospirosis: Object.freeze({
    id: 'leptospirosis',
    nameEn: 'Leptospirosis (Urban Floodwater & Mud)',
    nameEs: 'Leptospirosis (Aguas de Inundación y Lodo Urbano)',
    vectorEn: 'Penetrates abraded skin or mucosa via floodwater contaminated with rodent urine.',
    vectorEs: 'Penetra piel lacerada o mucosas a través de aguas contaminadas con orina de roedores.',
    symptomsEn: 'Biphasic: High fever, severe calf/lumbar myalgias, and pathognomonic bilateral conjunctival suffusion without exudate.',
    symptomsEs: 'Bifásica: Fiebre alta, intensos dolores en pantorrillas y espalda, y sufusión conjuntival bilateral sin pus.',
    treatmentEn: 'Prophylaxis: Doxycycline 200 mg PO weekly. Active mild: Doxycycline 100 mg PO BID x 7d. Severe: Ceftriaxone 1–2 g IV daily.',
    treatmentEs: 'Profilaxis: Doxiciclina 200 mg VO semanal. Leve: Doxiciclina 100 mg VO c/12h por 7d. Grave: Ceftriaxona 1-2 g IV al día.',
  }),
  tetanus: Object.freeze({
    id: 'tetanus',
    nameEn: 'Tetanus (Submerged Puncture Debris)',
    nameEs: 'Tétanos (Heridas Punzantes por Escombros Anegados)',
    vectorEn: 'Clostridium tetani spores inoculated via submerged metal, debris, or dirty needles.',
    vectorEs: 'Esporas de Clostridium tetani inoculadas por metales oxidados, escombros o agujas sucias.',
    symptomsEn: 'Trismus (lockjaw), painful muscle spasms, autonomic instability, opisthotonos.',
    symptomsEs: 'Trismus (mandíbula trabada), espasmos dolorosos, inestabilidad autonómica, opistótonos.',
    treatmentEn: 'Td/Tdap booster if ≥ 5 years for dirty wounds. Administer TIG 250 units IM contralateral if vaccination incomplete or unknown.',
    treatmentEs: 'Refuerzo de Td/Tdap si pasaron ≥ 5 años para heridas sucias. Administrar TIG 250 UI IM en sitio contralateral si el esquema es desconocido.',
  }),
  trench_foot: Object.freeze({
    id: 'trench_foot',
    nameEn: 'Immersion Foot / Trench Foot (Non-Freezing Cold Wet Injury)',
    nameEs: 'Pie de Trinchera o de Inmersión (Frío Húmedo no Congelante)',
    vectorEn: 'Prolonged exposure (>12–24h) to wet conditions at 0°C to 15°C (32°F–59°F).',
    vectorEs: 'Exposición prolongada (>12-24h) a humedad y agua entre 0°C y 15°C (32°F a 59°F).',
    symptomsEn: 'Cold, swollen, numb foot with pale/macerated skin followed by severe throbbing hyperemic pain.',
    symptomsEs: 'Pie frío, edematoso y entumecido con piel macerada, seguido de dolor urente pulsátil intenso.',
    treatmentEn: 'Air dry at room temperature. NEVER apply direct heat, hot water, or radiant fire. Elevate to reduce edema. Dry clean socks.',
    treatmentEs: 'Secar al aire a temperatura ambiente. NUNCA aplicar calor directo, agua caliente o fuego. Elevar y usar calcetines secos.',
  }),
});

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateDisasterPlan({
  patientStatus = 'stable',
  currentMedication = 'methadone',
  aqiLevel = 'moderate',
  floodExposure = false,
  dirtyPunctureWound = false,
  prolongedWetFeet = false,
  hasN95Mask = false,
  hasLockbox = true,
} = {}) {
  const alerts = [];
  const actions = [];
  const requiredSupplies = [];

  // MOUD Take-Home Authorization
  let takeHomeDays = 0;
  let flexKey = 'stable_takehome';

  if (patientStatus === 'stable') {
    takeHomeDays = 28;
    flexKey = 'stable_takehome';
    actions.push({
      priority: 'high',
      titleEn: 'Issue 28-Day Emergency Disaster Take-Home Supply',
      titleEs: 'Emitir Suministro de Emergencia de 28 Días para Llevar',
      descEn: `Authorized under 42 CFR § 8.12(i)(1). Patient meets stability criteria for full monthly supply of ${currentMedication}.`,
      descEs: `Autorizado bajo 42 CFR § 8.12(i)(1). El paciente cumple criterios de estabilidad para suministro mensual de ${currentMedication}.`,
    });
  } else {
    takeHomeDays = 14;
    flexKey = 'acute_takehome';
    actions.push({
      priority: 'high',
      titleEn: 'Issue 14-Day Emergency Disaster Take-Home Bridge',
      titleEs: 'Emitir Puente de Emergencia de 14 Días para Llevar',
      descEn: `Authorized under 2024 revised Part 8 rules. Prevents acute withdrawal crisis during transit disruptions for ${currentMedication}.`,
      descEs: `Autorizado bajo las normas revisadas de la Parte 8 de 2024. Previene la crisis de abstinencia durante desastres para ${currentMedication}.`,
    });
  }

  if (!hasLockbox) {
    alerts.push({
      type: 'warning',
      textEn: 'Safe Storage Alert: Patient lacks a lockbox. Distribute a buoyant waterproof lockable pouch immediately to safeguard take-home doses.',
      textEs: 'Alerta de Almacenamiento Seguro: El paciente no tiene caja con llave. Entregar estuche hermético con candado inmediatamente.',
    });
    requiredSupplies.push('Waterproof Lockbox or HDPE Lockable Pouch');
  }

  // Air Quality & Respiratory Protection
  const aqiInfo = AQI_LEVELS[aqiLevel] || AQI_LEVELS.moderate;
  if (['unhealthy', 'very_unhealthy', 'hazardous'].includes(aqiLevel)) {
    alerts.push({
      type: 'danger',
      textEn: `High Wildfire Smoke Hazard (AQI ${aqiInfo.range}): Elevated PM2.5 levels. Mandatory N95 respiratory protection and indoor clean air sheltering.`,
      textEs: `Peligro por Humo de Incendios (AQI ${aqiInfo.range}): Niveles elevados de PM2,5. Uso obligatorio de respirador N95 y refugio con aire purificado.`,
    });

    if (!hasN95Mask) {
      actions.push({
        priority: 'urgent',
        titleEn: 'Provide NIOSH N95 Respirator Immediately',
        titleEs: 'Suministrar Respirador NIOSH N95 Inmediatamente',
        descEn: 'Surgical masks and wet bandanas fail to filter fine PM2.5 particles. Ensure a tight seal over nose and chin.',
        descEs: 'Las mascarillas simples y telas mojadas no filtran PM2,5. Garantizar sellado facial hermético.',
      });
      requiredSupplies.push('NIOSH N95 / KN95 Respirator');
    }

    actions.push({
      priority: 'medium',
      titleEn: 'Harm Reduction Route Transition',
      titleEs: 'Transición de Vía en Reducción de Daños',
      descEn: 'Advise PWUD against inhaling/smoking illicit drugs off foil or pipes in heavy smoke; substitute with sublingual or oral routes.',
      descEs: 'Aconsejar no fumar en papel aluminio o pipa durante el humo denso; sustituir por vía sublingual u oral.',
    });
  }

  // Floodwater & Environmental Hazards
  if (floodExposure) {
    alerts.push({
      type: 'warning',
      textEn: 'Floodwater Exposure: Risk of Leptospirosis (*Leptospira interrogans*). Assess for conjunctival suffusion, high fever, and calf tenderness.',
      textEs: 'Exposición a Inundaciones: Riesgo de Leptospirosis. Evaluar sufusión conjuntival, fiebre alta y mialgias en pantorrillas.',
    });
    actions.push({
      priority: 'high',
      titleEn: 'Initiate Floodwater Leptospirosis Protocol',
      titleEs: 'Iniciar Protocolo de Leptospirosis por Inundación',
      descEn: 'For high-risk ongoing exposure, administer Doxycycline 200 mg PO once weekly. If symptomatic, initiate Doxycycline 100 mg PO BID x 7 days.',
      descEs: 'Para exposición continua de alto riesgo, dar Doxiciclina 200 mg VO semanal. Si hay síntomas, iniciar Doxiciclina 100 mg VO c/12h por 7 días.',
    });
    requiredSupplies.push('Doxycycline 100 mg / 200 mg');
  }

  if (dirtyPunctureWound) {
    alerts.push({
      type: 'danger',
      textEn: 'Contaminated Puncture Wound: Acute tetanus hazard. Immediate assessment of booster status and TIG indication required.',
      textEs: 'Herida Punzante Contaminada: Riesgo agudo de tétanos. Evaluación inmediata de vacuna antitetánica e indicación de gammaglobulina (TIG).',
    });
    actions.push({
      priority: 'urgent',
      titleEn: 'Administer Tetanus Booster + TIG if Indicated',
      titleEs: 'Administrar Refuerzo Antitetánico + TIG si está Indicado',
      descEn: 'Give Td/Tdap 0.5 mL IM if ≥ 5 years. If unimmunized or unknown, add Tetanus Immune Globulin (TIG) 250 units IM at a separate anatomical site.',
      descEs: 'Aplicar Td/Tdap 0,5 mL IM si pasaron ≥ 5 años. Si no está vacunado o se desconoce, añadir Inmunoglobulina Tetánica (TIG) 250 UI IM en sitio separado.',
    });
    requiredSupplies.push('Tdap Vaccine & Tetanus Immune Globulin (TIG 250 UI)');
  }

  if (prolongedWetFeet) {
    actions.push({
      priority: 'medium',
      titleEn: 'Trench Foot / Immersion Injury Prevention',
      titleEs: 'Prevención de Pie de Trinchera / Inmersión',
      descEn: 'Air dry feet at room temperature. NEVER expose to open flame, hot water, or radiators. Elevate feet and provide dry wool socks.',
      descEs: 'Secar los pies al aire a temperatura ambiente. NUNCA aplicar calor directo ni agua caliente. Elevar y colocar calcetines secos.',
    });
    requiredSupplies.push('Dry Wool / Synthetic Moisture-Wicking Socks');
  }

  return {
    takeHomeDays,
    flexKey,
    alerts,
    actions,
    requiredSupplies,
  };
}

// ============================================================================
// ZERO-PII EPHEMERAL STATE CONTROLLER
// ============================================================================

let state = {
  patientStatus: 'stable',
  currentMedication: 'methadone',
  aqiLevel: 'moderate',
  floodExposure: false,
  dirtyPunctureWound: false,
  prolongedWetFeet: false,
  hasN95Mask: false,
  hasLockbox: true,
  sbarNotes: '',
};

const subscribers = new Set();

export function getDisasterState() {
  return { ...state };
}

export function updateDisasterState(patch) {
  state = { ...state, ...patch };
  subscribers.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('State subscriber error', e);
    }
  });
}

export function resetDisasterState() {
  state = {
    patientStatus: 'stable',
    currentMedication: 'methadone',
    aqiLevel: 'moderate',
    floodExposure: false,
    dirtyPunctureWound: false,
    prolongedWetFeet: false,
    hasN95Mask: false,
    hasLockbox: true,
    sbarNotes: '',
  };
  subscribers.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('State subscriber error', e);
    }
  });
}

export function subscribeDisasterState(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// ============================================================================
// SBAR CLINICAL HANDOFF GENERATOR
// ============================================================================

export function generateDisasterSbar(st, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateDisasterPlan(st);
  const medName = isEs
    ? (st.currentMedication === 'methadone' ? 'METADONA' : (st.currentMedication === 'buprenorphine_sl' ? 'BUPRENORFINA SUBLINGUAL' : 'BUPRENORFINA DEPÓSITO'))
    : st.currentMedication.toUpperCase();

  if (isEs) {
    return [
      'TRANSFERENCIA CLÍNICA SBAR - CONTINUIDAD DE MOUD EN DESASTRES (CERO PII)',
      '-------------------------------------------------------------------------',
      `S (Situación): Paciente en régimen de ${medName} durante desastre ambiental / evento climático extremo.`,
      `B (Antecedentes): Estado clínico: ${st.patientStatus === 'stable' ? 'Estable (Apto para 28 días)' : 'Fase Aguda (Apto para 14 días)'}. Almacenamiento seguro: ${st.hasLockbox ? 'Sí' : 'No (Requiere caja)'}.`,
      `A (Evaluación): Nivel AQI humo: ${st.aqiLevel.toUpperCase()}. Exposición a inundaciones: ${st.floodExposure ? 'Sí (Alerta Leptospirosis)' : 'No'}. Herida punzante sucia: ${st.dirtyPunctureWound ? 'Sí (Alerta Tétanos)' : 'No'}. Pie húmedo prolongado: ${st.prolongedWetFeet ? 'Sí (Alerta Pie de Trinchera)' : 'No'}.`,
      `R (Recomendación): Autorizar ${evalResult.takeHomeDays} días de dosis para llevar bajo SAMHSA 42 CFR Parte 8. ${st.dirtyPunctureWound ? 'Aplicar vacuna Tdap + TIG 250 UI. ' : ''}${st.floodExposure ? 'Iniciar Doxiciclina profilaxis. ' : ''}Coordinar reciprocidad interestatal o MMU si la clínica está evacuada.`,
    ].join('\n');
  }

  return [
    'SBAR CLINICAL HANDOFF - DISASTER MOUD & CLIMATE CONTINUITY (ZERO-PII)',
    '-------------------------------------------------------------------------',
    `S (Situation): Patient on ${medName} maintenance facing extreme weather / environmental catastrophe.`,
    `B (Background): Clinical stability tier: ${st.patientStatus === 'stable' ? 'Stable (Eligible for 28-day supply)' : 'Acute / Less Stable (Eligible for 14-day bridge)'}. Secure storage box: ${st.hasLockbox ? 'Present' : 'Missing (Distribute HDPE lockbox)'}.`,
    `A (Assessment): Air Quality Index: ${st.aqiLevel.toUpperCase()}. Floodwater contact: ${st.floodExposure ? 'YES (Leptospirosis risk)' : 'NO'}. Submerged puncture: ${st.dirtyPunctureWound ? 'YES (Tetanus risk)' : 'NO'}. Trench foot risk: ${st.prolongedWetFeet ? 'YES' : 'NO'}.`,
    `R (Recommendation): Authorize ${evalResult.takeHomeDays} days of emergency take-home doses under SAMHSA 42 CFR Part 8 flexibilities. ${st.dirtyPunctureWound ? 'Administer Tdap + TIG 250 units IM. ' : ''}${st.floodExposure ? 'Initiate Doxycycline floodwater protocol. ' : ''}Register guest dosing or MMU muster transfer if local OTP clinic is compromised.`,
  ].join('\n');
}

// ============================================================================
// MAIN DOM VIEW
// ============================================================================

export function disasterMoudClimateView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const container = h('div', { class: 'disaster-moud-view' });

  // Header
  const header = pageHeader({
    title: isEs
      ? 'Continuidad de MOUD en Desastres y Resiliencia Climática'
      : 'Disaster MOUD Continuity & Climate Resilience Navigator',
    subtitle: isEs
      ? 'Flexibilidades SAMHSA 42 CFR Parte 8, dosificación de invitado, protección contra humo PM2,5 y triaje ambiental de infecciones'
      : 'SAMHSA 42 CFR Part 8 emergency take-homes, guest dosing, PM2.5 wildfire harm reduction & floodwater exposure triage',
  });
  container.appendChild(header);

  // Layout Grid
  const grid = h('div', { class: 'disaster-grid' });
  container.appendChild(grid);

  // Left Column: Assessment & Controls
  const leftCol = h('div', { class: 'disaster-col' });
  grid.appendChild(leftCol);

  // Card 1: Patient & MOUD Regimen
  const moudCard = h('div', { class: 'disaster-card' });
  leftCol.appendChild(moudCard);

  const moudTitle = h('h2', { class: 'disaster-card-title' });
  moudTitle.appendChild(icon('shield'));
  moudTitle.appendChild(h('span', null, isEs ? '1. Régimen de MOUD y Dosis de Emergencia' : '1. MOUD Regimen & Emergency Dosing'));
  moudCard.appendChild(moudTitle);

  // Medication selector
  const medGroup = h('div', { class: 'disaster-field-group' });
  moudCard.appendChild(medGroup);

  medGroup.appendChild(h('label', { class: 'disaster-label', for: 'moud-select' }, isEs ? 'Medicamento para OUD:' : 'MOUD Medication:'));
  const medSelect = h('select', { id: 'moud-select', class: 'disaster-select' });
  medSelect.appendChild(h('option', { value: 'methadone' }, isEs ? 'Metadona (Líquido Oral)' : 'Methadone (Oral Liquid)'));
  medSelect.appendChild(h('option', { value: 'buprenorphine_sl' }, isEs ? 'Buprenorfina / Naloxona Sublingual' : 'Sublingual Buprenorphine / Naloxone'));
  medSelect.appendChild(h('option', { value: 'buprenorphine_depot' }, isEs ? 'Buprenorfina Subcutánea de Depósito' : 'Subcutaneous Depot Buprenorphine'));
  medSelect.value = state.currentMedication;
  medSelect.addEventListener('change', (e) => {
    updateDisasterState({ currentMedication: e.target.value });
  });
  medGroup.appendChild(medSelect);

  // Stability selector
  const stabGroup = h('div', { class: 'disaster-field-group' });
  moudCard.appendChild(stabGroup);

  stabGroup.appendChild(h('label', { class: 'disaster-label', for: 'stability-select' }, isEs ? 'Nivel de Estabilidad Clínica:' : 'Clinical Stability Tier:'));
  const stabSelect = h('select', { id: 'stability-select', class: 'disaster-select' });
  stabSelect.appendChild(h('option', { value: 'stable' }, isEs ? 'Paciente Estable (Apto para 28 días)' : 'Stable Patient (Up to 28-Day Take-Home)'));
  stabSelect.appendChild(h('option', { value: 'acute' }, isEs ? 'Fase Aguda / Transitoria (Puente de 14 días)' : 'Acute / Less Stable (Up to 14-Day Bridge)'));
  stabSelect.value = state.patientStatus;
  stabSelect.addEventListener('change', (e) => {
    updateDisasterState({ patientStatus: e.target.value });
  });
  stabGroup.appendChild(stabSelect);

  // Lockbox Checkbox
  const lockboxRow = h('div', { class: 'disaster-check-row' });
  moudCard.appendChild(lockboxRow);

  const lockboxInput = h('input', { type: 'checkbox', id: 'check-lockbox' });
  lockboxInput.checked = state.hasLockbox;
  lockboxInput.addEventListener('change', (e) => {
    updateDisasterState({ hasLockbox: e.target.checked });
  });
  lockboxRow.appendChild(lockboxInput);

  const lockboxLabel = h('label', { for: 'check-lockbox', class: 'disaster-check-label' });
  lockboxLabel.appendChild(h('span', { class: 'font-semibold' }, isEs ? 'Posee Caja de Seguridad / Estuche con Candado' : 'Patient Has Lockbox / Lockable Pouch'));
  lockboxLabel.appendChild(h('span', { class: 'disaster-subtext' }, isEs ? 'Requerido para almacenamiento seguro de dosis para llevar en catástrofes.' : 'Required for safe storage of unsupervised emergency take-home doses.'));
  lockboxRow.appendChild(lockboxLabel);

  // Card 2: Environmental Exposures
  const envCard = h('div', { class: 'disaster-card' });
  leftCol.appendChild(envCard);

  const envTitle = h('h2', { class: 'disaster-card-title' });
  envTitle.appendChild(icon('alert'));
  envTitle.appendChild(h('span', null, isEs ? '2. Amenazas Ambientales y Calidad del Aire' : '2. Environmental Hazards & Air Quality'));
  envCard.appendChild(envTitle);

  // AQI Level selector
  const aqiGroup = h('div', { class: 'disaster-field-group' });
  envCard.appendChild(aqiGroup);

  aqiGroup.appendChild(h('label', { class: 'disaster-label', for: 'aqi-select' }, isEs ? 'Índice de Calidad del Aire (AQI por Humo de Incendios):' : 'Air Quality Index (Wildfire Smoke AQI):'));
  const aqiSelect = h('select', { id: 'aqi-select', class: 'disaster-select' });
  Object.keys(AQI_LEVELS).forEach((k) => {
    const lvl = AQI_LEVELS[k];
    const opt = h('option', { value: k }, `${lvl.range} - ${isEs ? lvl.nameEs : lvl.nameEn}`);
    aqiSelect.appendChild(opt);
  });
  aqiSelect.value = state.aqiLevel;
  aqiSelect.addEventListener('change', (e) => {
    updateDisasterState({ aqiLevel: e.target.value });
  });
  aqiGroup.appendChild(aqiSelect);

  // Checkboxes for environmental risks
  const envCheckList = [
    {
      key: 'floodExposure',
      labelEn: 'Waded in Urban Floodwaters or Saturated Runoff',
      labelEs: 'Contacto o Caminata en Aguas de Inundación / Lodo',
      descEn: 'Risk of Leptospira interrogans entering via micro-abrasions.',
      descEs: 'Riesgo de ingreso de Leptospira por laceraciones dérmicas.',
    },
    {
      key: 'dirtyPunctureWound',
      labelEn: 'Contaminated Puncture Wound (Submerged Metal/Debris)',
      labelEs: 'Herida Punzante con Metal Sumergido o Escombros Sucios',
      descEn: 'High-risk tetanus portal. Evaluates indication for Tdap and TIG.',
      descEs: 'Puerta de entrada de tétanos. Evalúa vacuna y gammaglobulina.',
    },
    {
      key: 'prolongedWetFeet',
      labelEn: 'Prolonged Wet Boots / Socks (> 12–24 Hours in Damp Cold)',
      labelEs: 'Calzado Mojado Prolongado (> 12-24 Horas en Frío Húmedo)',
      descEn: 'Immersion foot / trench foot hazard. Avoid direct fire or hot water.',
      descEs: 'Riesgo de pie de trinchera. Prohibir fuego o calor directo.',
    },
    {
      key: 'hasN95Mask',
      labelEn: 'Patient Already Has Fitted NIOSH N95 Respirator',
      labelEs: 'El Paciente Ya Cuenta con Respirador NIOSH N95 Ajustado',
      descEn: 'Filters PM2.5 particulates. Surgical masks and wet bandanas are inadequate.',
      descEs: 'Filtra PM2,5. Mascarillas simples y pañuelos mojados son ineficaces.',
    },
  ];

  envCheckList.forEach((item) => {
    const row = h('div', { class: 'disaster-check-row' });
    const chk = h('input', { type: 'checkbox', id: `env-${item.key}` });
    chk.checked = Boolean(state[item.key]);
    chk.addEventListener('change', (e) => {
      updateDisasterState({ [item.key]: e.target.checked });
    });
    row.appendChild(chk);

    const lbl = h('label', { for: `env-${item.key}`, class: 'disaster-check-label' });
    lbl.appendChild(h('span', { class: 'font-semibold' }, isEs ? item.labelEs : item.labelEn));
    lbl.appendChild(h('span', { class: 'disaster-subtext' }, isEs ? item.descEs : item.descEn));
    row.appendChild(lbl);

    envCard.appendChild(row);
  });

  // Right Column: Directives, Emergency Supply & SBAR
  const rightCol = h('div', { class: 'disaster-col' });
  grid.appendChild(rightCol);

  // Dynamic Directives Container
  const resultsContainer = h('div', { class: 'disaster-results' });
  rightCol.appendChild(resultsContainer);

  function renderResults() {
    clear(resultsContainer);

    const evalResult = evaluateDisasterPlan(state);

    // Take-Home Authorization Banner
    const authBanner = h('div', { class: 'disaster-auth-banner' });
    resultsContainer.appendChild(authBanner);

    const authHeader = h('div', { class: 'disaster-banner-header' });
    authHeader.appendChild(icon('check'));
    authHeader.appendChild(h('span', { class: 'font-bold' }, isEs ? 'AUTORIZACIÓN DE DISPENSACIÓN DE EMERGENCIA' : 'EMERGENCY DISPENSING AUTHORIZATION'));
    authBanner.appendChild(authHeader);

    const authDetails = h('p', { class: 'disaster-auth-text' }, isEs
      ? `Bajo SAMHSA 42 CFR § 8.12(i), el paciente califica para ${evalResult.takeHomeDays} DÍAS de suministro para llevar de ${state.currentMedication.toUpperCase()}.`
      : `Under SAMHSA 42 CFR § 8.12(i), patient qualifies for a ${evalResult.takeHomeDays}-DAY take-home supply of ${state.currentMedication.toUpperCase()}.`);
    authBanner.appendChild(authDetails);

    // Alerts
    evalResult.alerts.forEach((alert) => {
      const alertBox = h('div', { class: `disaster-alert-box alert-${alert.type}` });
      alertBox.appendChild(icon('alert'));
      alertBox.appendChild(h('span', null, isEs ? alert.textEs : alert.textEn));
      resultsContainer.appendChild(alertBox);
    });

    // Required Clinical Actions Card
    const actCard = h('div', { class: 'disaster-card' });
    resultsContainer.appendChild(actCard);

    const actTitle = h('h3', { class: 'disaster-card-title' }, isEs ? 'Directivas Clínicas y Logísticas' : 'Clinical & Logistic Directives');
    actCard.appendChild(actTitle);

    const actList = h('div', { class: 'disaster-action-list' });
    actCard.appendChild(actList);

    evalResult.actions.forEach((act) => {
      const actItem = h('div', { class: `disaster-action-item priority-${act.priority}` });
      const actHead = h('div', { class: 'disaster-action-head' });
      actHead.appendChild(h('span', { class: 'disaster-badge' }, act.priority.toUpperCase()));
      actHead.appendChild(h('strong', null, isEs ? act.titleEs : act.titleEn));
      actItem.appendChild(actHead);
      actItem.appendChild(h('p', { class: 'disaster-action-desc' }, isEs ? act.descEs : act.descEn));
      actList.appendChild(actItem);
    });

    // Supply Kit Card
    if (evalResult.requiredSupplies.length > 0) {
      const supCard = h('div', { class: 'disaster-card' });
      resultsContainer.appendChild(supCard);

      const supTitle = h('h3', { class: 'disaster-card-title' }, isEs ? 'Insumos Necesarios para el Paciente' : 'Required Patient Supplies');
      supCard.appendChild(supTitle);

      const supList = h('ul', { class: 'disaster-supply-list' });
      evalResult.requiredSupplies.forEach((sup) => {
        const li = h('li', null);
        li.appendChild(icon('check'));
        li.appendChild(h('span', null, sup));
        supList.appendChild(li);
      });
      supCard.appendChild(supList);
    }

    // Corsi-Rosenthal Box Protocol Callout
    const crCard = h('div', { class: 'disaster-card cr-box-card' });
    resultsContainer.appendChild(crCard);

    const crTitle = h('h3', { class: 'disaster-card-title' }, isEs ? 'Purificador Corsi-Rosenthal de Bajo Costo' : 'Low-Cost Corsi-Rosenthal Filtration');
    crCard.appendChild(crTitle);

    const crText = h('p', { class: 'disaster-subtext' }, isEs
      ? 'Construcción con 4 o 5 filtros MERV-13 (20x20 pulg.) y un ventilador de caja de 20 pulgadas con deflector circular de cartón. Entrega 400–600 CFM de aire limpio por menos de $70 para centros de acogida y albergues.'
      : 'Assemble 4 or 5 MERV-13 filters (20x20 in.) into a cube with a 20-inch box fan and circular shroud. Delivers 400–600 CFM of clean air for under $70 in harm reduction shelters and encampment respite zones.');
    crCard.appendChild(crText);

    // SBAR Section
    const sbarCard = h('div', { class: 'disaster-card' });
    resultsContainer.appendChild(sbarCard);

    const sbarTitle = h('h3', { class: 'disaster-card-title' }, isEs ? 'Transferencia Clínica SBAR (Cero PII)' : 'Zero-PII SBAR Handoff Report');
    sbarCard.appendChild(sbarTitle);

    const sbarArea = h('textarea', { class: 'disaster-sbar-textarea', rows: 7, readonly: true });
    sbarArea.value = generateDisasterSbar(state, lang);
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
  const unsub = subscribeDisasterState(() => {
    renderResults();
  });

  return container;
}
