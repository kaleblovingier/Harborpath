/**
 * Homelessness & Street Medicine Harm Reduction View (public/js/views/streetMedicine.js)
 *
 * Trauma-informed, low-barrier clinical and legal navigation guidance for
 * unsheltered individuals, encampment residents, and outreach workers:
 *
 * 1. Street Medicine & Low-Barrier MOUD Pathways:
 *    - Field-based "bridge" buprenorphine induction without requiring fixed address, phone, or appointment.
 *    - Medication security strategies: clinic lockboxes, daily outreach dispensing, and replacement protocols.
 *
 * 2. Weather & Environmental Exposure Risks:
 *    - Severe Hypothermia / Frostbite: Opioids, alcohol, and sedatives blunt shivering responses, dilate peripheral
 *      vessels, and diminish thermal awareness, leading to rapid fatal hypothermia even in moderate cold (30-50°F).
 *    - Hyperthermia / Heat Stroke: Stimulants and psychotropics suppress hypothalamic thermoregulation and thirst.
 *
 * 3. Civil Rights & Shelter Access Protections:
 *    - HUD Equal Access Rule & Fair Housing Act (42 U.S.C. § 3604): Federally funded shelters CANNOT exclude or
 *      evict residents for taking prescribed MOUD (buprenorphine or methadone).
 *    - Encampment clearings: Fourth Amendment and ADA Title II protections prohibiting confiscation or destruction
 *      of vital prescription medications, naloxone kits, and mobility aids.
 *
 * Strict Invariants:
 * - Zero npm dependencies (plain ES modules).
 * - Zero PII: 100% ephemeral in-RAM state. Never writes user answers to URLs, device storage, or cookies.
 * - Accessible DOM construction via h() (document.createElement, textContent, setAttribute).
 *   ZERO direct markup string injection or inline style attributes.
 * - Complete bilingual parity (English / Spanish).
 */

import { h, clear, ext, tel, sms, icon, copyText, syncTablists, wireTablistKeyboard } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong } from './common.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetStreetMedicineState);

// ============================================================================
// 1. Statutory Frameworks & Shelter Rights
// ============================================================================

export const STREET_MEDICINE_STATUTES = [
  {
    id: 'hud_equal_access',
    title: { en: 'HUD Equal Access & Fair Housing MOUD Protections', es: 'Norma de Igualdad de Acceso de HUD y Protección de MOUD en Refugios' },
    citation: 'Fair Housing Act (42 U.S.C. § 3604) / 24 C.F.R. § 5.105',
    summary: {
      en: 'Emergency shelters, transitional housing, and HUD-funded programs CANNOT deny admission, evict, or discriminate against individuals because they take prescribed MOUD (buprenorphine, methadone, or naltrexone). Denying shelter for taking addiction medicine violates federal civil rights law.',
      es: 'Los albergues de emergencia y programas financiados por HUD NO pueden negar admisión ni desalojar a personas por tomar medicamentos recetados para MOUD (buprenorfina o metadona). Negar refugio por tomar tratamiento viola las leyes federales de derechos civiles.',
    },
  },
  {
    id: 'medication_property_rights',
    title: { en: 'Medication & Medical Property Protections During Sweeps', es: 'Protección de Medicamentos durante Desalojos de Campamentos' },
    citation: 'U.S. Constitution Amend. IV & ADA Title II (42 U.S.C. § 12132)',
    summary: {
      en: 'Municipal authorities during encampment clearings are prohibited from confiscating or destroying vital prescription medications, medical devices (inhalers, walkers), or emergency naloxone kits. Outreach teams can advocate for immediate recovery or replacement of confiscated medications.',
      es: 'Las autoridades municipales tienen prohibido confiscar o destruir medicamentos recetados vitales, dispositivos médicos (inhaladores, andadores) o kits de naloxona durante desalojos. Los equipos de alcance pueden exigir la recuperación o reposición inmediata.',
    },
  },
  {
    id: 'low_barrier_buprenorphine',
    title: { en: 'Low-Barrier Street Medicine MOUD Standards', es: 'Estándares de Medicina Callejera para MOUD de Bajo Umbral' },
    citation: 'SAMHSA TIP 63 / Street Medicine Institute Consensus',
    summary: {
      en: 'Clinical consensus supports prescribing buprenorphine directly on the street without requiring identification cards, proof of address, toxicology ultimatums, or mandatory group attendance. Prescriptions can be routed to pharmacies with delivery to outreach drop-in centers.',
      es: 'El consenso clínico respalda recetar buprenorfina en la calle sin exigir identificación, comprobante de domicilio ni asistencia obligatoria a grupos. Las recetas pueden enviarse a farmacias que entregan en centros comunitarios.',
    },
  },
];

// ============================================================================
// 2. Environmental Exposure & Safety Protocols
// ============================================================================

export const ENVIRONMENTAL_EXPOSURE_RISKS = {
  freezing_winter: {
    title: { en: 'Extreme Cold & Hypothermia Red Flags', es: 'Peligro de Frío Extremo e Hipotermia' },
    clinicalMechanisms: {
      en: 'Opioids, alcohol, and sedatives induce peripheral vasodilation (causing rapid heat loss) and suppress shivering. In cold weather, individuals can develop fatal hypothermia in a matter of hours, even at temperatures well above freezing (35-50°F / 2-10°C) if clothing is damp or wet.',
      es: 'Los opioides, alcohol y sedantes causan vasodilatación periférica (pérdida rápida de calor) y anulan los escalofríos. En clima frío, se puede sufrir hipotermia mortal en pocas horas, incluso a temperaturas superiores al punto de congelación si la ropa está húmeda.',
    },
    actionAdvice: {
      en: 'Keep sleeping bags elevated off frozen ground with cardboard or wooden pallets. Never sleep in damp clothes. Carry a mylar emergency space blanket. Warming centers cannot condition entry on drug sobriety.',
      es: 'Aísle el saco de dormir del suelo congelado con cartón o tarimas. Nunca duerma con ropa húmeda. Lleve una manta térmica de emergencia. Los centros de calentamiento no pueden exigir sobriedad.',
    },
  },
  extreme_heat: {
    title: { en: 'Extreme Heat, Dehydration & Rhabdomyolysis', es: 'Peligro de Calor Extremo, Deshidratación y Rabdomiólisis' },
    clinicalMechanisms: {
      en: 'Stimulants (methamphetamine, cocaine) cause massive hyperthermia and suppress thirst signals. Antipsychotics and anticholinergic sedatives block sweating. Sleeping on hot asphalt or remaining immobilized causes acute muscle breakdown (rhabdomyolysis) leading to kidney failure.',
      es: 'Los estimulantes (metanfetamina, cocaína) elevan la temperatura corporal y suprimen la sed. Los antipsicóticos y sedantes bloquean el sudor. Permanecer inmóvil sobre asfalto caliente causa degradación muscular (rabdomiólisis) e insuficiencia renal.',
    },
    actionAdvice: {
      en: 'Hydrate constantly with electrolyte solutions or water. Seek shaded cooling stations and misting sites. If someone displays hot, dry skin, severe confusion, or dark brown urine, call 911 immediately for heat stroke.',
      es: 'Hidrátese continuamente con electrolitos o agua. Acuda a estaciones de enfriamiento con sombra. Si alguien presenta piel caliente y seca, confusión severa u orina color té oscuro, llame al 911 por golpe de calor.',
    },
  },
};

// ============================================================================
// 3. In-RAM Decision Aid Engine: evaluateStreetMedicinePlan(inputs)
// ============================================================================

export function evaluateStreetMedicinePlan(inputs = {}) {
  const {
    livingSituation = 'unsheltered_encampment', // 'unsheltered_encampment' | 'emergency_shelter' | 'vehicle_car' | 'couch_surfing'
    hasSecureMedStorage = false,                // boolean
    experiencingExtremeWeather = 'freezing_winter', // 'freezing_winter' | 'extreme_heat' | 'mild'
    moudInterest = 'buprenorphine_street',      // 'buprenorphine_street' | 'methadone_clinic' | 'none'
    facingSweepOrDisplacement = false,          // boolean
    needsVitalDocs = true,                      // boolean
  } = inputs;

  const alerts = [];
  const storageSolutions = [];
  const rightsGuidance = [];

  // 1. Weather & Environmental Exposure Alerts
  if (experiencingExtremeWeather === 'freezing_winter') {
    alerts.push({
      priority: 'high',
      title: ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.title,
      detail: ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.clinicalMechanisms,
      action: ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.actionAdvice,
    });
  } else if (experiencingExtremeWeather === 'extreme_heat') {
    alerts.push({
      priority: 'high',
      title: ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.title,
      detail: ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.clinicalMechanisms,
      action: ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.actionAdvice,
    });
  }

  // 2. Medication Storage & Security Solutions
  if (!hasSecureMedStorage) {
    storageSolutions.push({
      title: { en: 'Clinic Lockbox & Daily Dispensing Bridges', es: 'Casilleros Clínicos y Puente de Dosificación Diaria' },
      detail: {
        en: 'If keeping prescription bottles in a tent risks theft or water damage, request that your outreach clinic hold your medication in a clinic lockbox or provide daily pick-up doses at a local drop-in center.',
        es: 'Si guardar los frascos en la tienda implica riesgo de robo o lluvia, solicite que su clínica de alcance guarde el medicamento en un casillero o le entregue dosis diarias en un centro de acogida.',
      },
    });
  }

  // 3. Sweep & Displacement Emergency Preparedness
  if (facingSweepOrDisplacement) {
    rightsGuidance.push({
      priority: 'high',
      title: { en: 'Encampment Sweep Medication Protection Protocol', es: 'Protocolo de Protección de Medicamentos en Desalojos' },
      detail: {
        en: 'Keep all prescription pill bottles, clinic cards, and naloxone in a dedicated small waterproof grab-bag on your person at all times. If police or municipal sanitation confiscate your medications, state clearly: "These are vital prescription medications protected under ADA Title II and the Fourth Amendment."',
        es: 'Mantenga siempre consigo los frascos de recetas y naloxona en una bolsa impermeable pequeña. Si las autoridades intentan confiscar sus medicamentos, declare: "Son medicamentos recetados vitales protegidos por el Título II de la ADA y la Cuarta Enmienda".',
      },
    });
  }

  // 4. Shelter Rights & MOUD Non-Discrimination
  if (livingSituation === 'emergency_shelter' || livingSituation === 'unsheltered_encampment') {
    rightsGuidance.push({
      priority: 'medium',
      title: { en: 'Legal Protection Against Shelter MOUD Exclusion', es: 'Protección Legal contra la Exclusión por MOUD en Refugios' },
      detail: {
        en: 'Under the Fair Housing Act and HUD Equal Access Rules, no shelter receiving government funds may turn you away, evict you, or force you into non-medicated detox because you are taking prescribed buprenorphine or methadone.',
        es: 'Bajo la Ley de Equidad de Vivienda y las normas de HUD, ningún albergue con fondos públicos puede rechazarle, desalojarle ni obligarle a suspender su buprenorfina o metadona recetada.',
      },
    });
  }

  // 5. Vital Documents Assistance
  if (needsVitalDocs) {
    storageSolutions.push({
      title: { en: 'No-Cost Vital Document Replacement (Birth Cert & State ID)', es: 'Reemplazo Gratuito de Documentos de Identidad (Acta y Licencia)' },
      detail: {
        en: 'Most counties have fee waivers for unhoused individuals seeking certified birth certificates and non-driver state IDs. Street medicine outreach workers can provide homeless verification letters that waive state DMV fees.',
        es: 'La mayoría de condados cuentan con exenciones de pago para actas de nacimiento y cédulas de identidad para personas sin hogar. Los trabajadores sociales de calle pueden emitir cartas de verificación.',
      },
    });
  }

  // 6. Discussion Checklist for Outreach Medical Teams
  const discussionItems = [
    {
      topic: { en: 'Field-Based Buprenorphine Start', es: 'Inicio de Buprenorfina en Campo' },
      question: {
        en: 'Can we initiate buprenorphine today through outreach without requiring me to visit a clinic building or show permanent address proof?',
        es: '¿Podemos iniciar buprenorfina hoy en la calle sin que tenga que ir a un edificio o presentar comprobante de domicilio?',
      },
    },
    {
      topic: { en: 'Safe Storage Options', es: 'Opciones de Guardado Seguro' },
      question: {
        en: 'Does your clinic or partner drop-in center have safe medication storage lockers or daily dosing so my medication is not lost in a camp sweep?',
        es: '¿Cuenta su centro con casilleros seguros o dosificación diaria para que mi medicina no se pierda en un desalojo?',
      },
    },
    {
      topic: { en: 'Weather Exposure & Warming/Cooling Center Referrals', es: 'Refugios de Frío/Calor sin Barreras de Sobriedad' },
      question: {
        en: 'Where is the nearest low-barrier warming or cooling center that allows entry without demanding zero drug use or sobriety testing?',
        es: '¿Dónde está el centro de calentamiento o enfriamiento más cercano que permita entrar sin exigir pruebas de sobriedad?',
      },
    },
  ];

  return {
    evaluatedAt: new Date().toISOString(),
    inputs: {
      livingSituation,
      hasSecureMedStorage,
      experiencingExtremeWeather,
      moudInterest,
      facingSweepOrDisplacement,
      needsVitalDocs,
    },
    alerts,
    storageSolutions,
    rightsGuidance,
    discussionItems,
    statutes: STREET_MEDICINE_STATUTES,
  };
}

// ============================================================================
// 4. In-RAM Ephemeral State Management
// ============================================================================

let streetMedicineState = {
  livingSituation: 'unsheltered_encampment',
  hasSecureMedStorage: false,
  experiencingExtremeWeather: 'freezing_winter',
  moudInterest: 'buprenorphine_street',
  facingSweepOrDisplacement: true,
  needsVitalDocs: true,
  activeTab: 'decision_aid', // 'decision_aid' | 'street_moud' | 'shelter_rights' | 'weather_safety'
  lastEvaluation: null,
};

export function getStreetMedicineState() {
  return { ...streetMedicineState };
}

export function setStreetMedicineState(partial) {
  streetMedicineState = { ...streetMedicineState, ...partial };
  return getStreetMedicineState();
}

export function resetStreetMedicineState() {
  streetMedicineState = {
    livingSituation: 'unsheltered_encampment',
    hasSecureMedStorage: false,
    experiencingExtremeWeather: 'freezing_winter',
    moudInterest: 'buprenorphine_street',
    facingSweepOrDisplacement: true,
    needsVitalDocs: true,
    activeTab: 'decision_aid',
    lastEvaluation: null,
  };
  return getStreetMedicineState();
}

// ============================================================================
// 5. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatStreetMedicineSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'PLAN DE MEDICINA CALLEJERA Y DERECHOS PARA PERSONAS SIN HOGAR - HARBORPATH'
      : 'STREET MEDICINE & UNHOUSED CARE ACCESS PLAN - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Situación de vivienda' : 'Living Situation'}: ${plan.inputs.livingSituation}`,
    `${isEs ? 'Almacenamiento seguro' : 'Secure Storage'}: ${plan.inputs.hasSecureMedStorage ? (isEs ? 'Sí' : 'No') : (isEs ? 'No disponible' : 'Not available')}`,
    `${isEs ? 'Clima extremo actual' : 'Extreme Weather'}: ${plan.inputs.experiencingExtremeWeather}`,
    '',
  ];

  if (plan.alerts.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ALERTAS DE CLIMA Y RIESGO DE EXPOSICIÓN:' : 'WEATHER & EXPOSURE RISK ALERTS:');
    lines.push(subDivider);
    plan.alerts.forEach((alt) => {
      lines.push(`* ${isEs ? alt.title.es : alt.title.en}`);
      lines.push(`  ${isEs ? alt.detail.es : alt.detail.en}`);
      lines.push(`  -> ${isEs ? alt.action.es : alt.action.en}`);
    });
    lines.push('');
  }

  if (plan.rightsGuidance.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ORIENTACIÓN LEGAL Y DERECHOS EN REFUGIOS Y DESALOJOS:' : 'LEGAL RIGHTS IN SHELTERS & ENCAMPMENT SWEEPS:');
    lines.push(subDivider);
    plan.rightsGuidance.forEach((rg) => {
      lines.push(`[${rg.priority.toUpperCase()}] ${isEs ? rg.title.es : rg.title.en}`);
      lines.push(`  ${isEs ? rg.detail.es : rg.detail.en}`);
    });
    lines.push('');
  }

  if (plan.storageSolutions.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'SOLUCIONES DE GUARDADO SEGURO Y DOCUMENTOS:' : 'MEDICATION STORAGE & VITAL DOCUMENT SOLUTIONS:');
    lines.push(subDivider);
    plan.storageSolutions.forEach((sol) => {
      lines.push(`* ${isEs ? sol.title.es : sol.title.en}`);
      lines.push(`  ${isEs ? sol.detail.es : sol.detail.en}`);
    });
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'PREGUNTAS SUGERIDAS PARA EL EQUIPO DE ALCANCE:' : 'QUESTIONS FOR STREET MEDICINE WORKERS:');
  lines.push(subDivider);
  plan.discussionItems.forEach((d) => {
    lines.push(`- [ ] (${isEs ? d.topic.es : d.topic.en}) ${isEs ? d.question.es : d.question.en}`);
  });

  lines.push('');
  lines.push(divider);
  lines.push(
    isEs
      ? 'Never Use Alone: 1-800-484-3731 (Acompañamiento telefónico seguro 24/7)'
      : 'Never Use Alone: 1-800-484-3731 (Free, 24/7 confidential phone spotter line)'
  );
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 6. Accessible DOM View: streetMedicineView(containerOrOptions, maybeOptions)
// ============================================================================

export function streetMedicineView(containerOrOptions = {}, maybeOptions = {}) {
  let container = null;
  let options = maybeOptions;
  if (containerOrOptions && (typeof containerOrOptions.append === 'function' || containerOrOptions.nodeType || containerOrOptions.tagName)) {
    container = containerOrOptions;
  } else {
    options = containerOrOptions || {};
  }
  if (container) clear(container);

  const lang = getLang();
  const isEs = lang === 'es';

  // Evaluate current state
  const plan = evaluateStreetMedicinePlan(getStreetMedicineState());
  setStreetMedicineState({ lastEvaluation: plan });

  const root = h('div', { class: 'street-medicine-view' });

  // Page Header
  const header = pageHeader(
    isEs ? 'Medicina Callejera, Reducción de Daños y Derechos sin Hogar' : 'Street Medicine, Harm Reduction & Unhoused Rights',
    isEs
      ? 'Inicios de buprenorfina de bajo umbral en la calle, protección contra hipotermia y golpes de calor, custodia segura de medicamentos y derechos legales en refugios y campamentos.'
      : 'Low-barrier street MOUD bridge protocols, hypothermia and heat stroke prevention, medication protection during sweeps, and HUD shelter rights.'
  );
  root.append(header);

  // In-RAM Privacy Banner
  const privacyAlert = h(
    'div',
    { class: 'panel alert-panel', role: 'note', 'aria-label': isEs ? 'Privacidad' : 'Privacy' },
    h('div', { class: 'panel-header' },
      icon('shield', { class: 'panel-icon' }),
      h('h2', { class: 'panel-title' }, isEs ? 'Asistencia Epímera en Memoria' : 'In-RAM Ephemeral Decision Support')
    ),
    h('p', { class: 'panel-body' },
      isEs
        ? 'Todas las selecciones de vivienda y salud se evalúan únicamente en la memoria temporal del navegador sin persistencia. No se guardan datos en el disco ni se transmiten. Se restablecen con Salida Rápida.'
        : 'All housing and clinical selections are processed in temporary browser memory only without persistence. Cleared immediately upon Quick Exit.'
    )
  );
  root.append(privacyAlert);

  // Tab Navigation Bar
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de medicina callejera' : 'Street medicine sections' });
  const tabs = [
    { id: 'decision_aid', label: isEs ? 'Evaluador de Necesidades' : 'Needs Screener' },
    { id: 'street_moud', label: isEs ? 'MOUD de Bajo Umbral' : 'Street MOUD' },
    { id: 'shelter_rights', label: isEs ? 'Derechos en Refugios' : 'Shelter Rights' },
    { id: 'weather_safety', label: isEs ? 'Clima y Protección' : 'Weather Exposure' },
  ];

  const currentTab = streetMedicineState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-sm-${tab.id}`,
      'data-tab': tab.id,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': 'tab-panel-sm',
      tabindex: isSelected ? '0' : '-1',
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setStreetMedicineState({ activeTab: tab.id });
      streetMedicineView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Active Tab Panel
  const tabPanel = h('div', {
    id: 'tab-panel-sm',
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-sm-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Decision Aid
  // --------------------------------------------------------------------------
  if (currentTab === 'decision_aid') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Evaluación de Entorno y Seguridad en Calle' : 'Street Environment & Health Screener'));

    const formGrid = h('div', { class: 'form-grid' });

    // Living situation
    const liveGroup = h('div', { class: 'form-group' });
    liveGroup.append(h('label', { for: 'sm-live-select' }, isEs ? 'Situación actual de vivienda:' : 'Current living situation:'));
    const liveSelect = h('select', { id: 'sm-live-select', class: 'input-select' });
    [
      { val: 'unsheltered_encampment', label: isEs ? 'A la intemperie / campamento / tienda' : 'Unsheltered / encampment / tent' },
      { val: 'emergency_shelter', label: isEs ? 'Albergue de emergencia o de noche' : 'Emergency overnight shelter' },
      { val: 'vehicle_car', label: isEs ? 'Viviendo en vehículo o furgoneta' : 'Living in vehicle / van' },
      { val: 'couch_surfing', label: isEs ? 'Alojamiento temporal inestable' : 'Temporary couch surfing' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.val }, opt.label);
      if (streetMedicineState.livingSituation === opt.val) optionEl.setAttribute('selected', 'selected');
      liveSelect.append(optionEl);
    });
    liveSelect.addEventListener('change', (e) => {
      setStreetMedicineState({ livingSituation: e.target.value });
      streetMedicineView(container, options);
    });
    liveGroup.append(liveSelect);
    formGrid.append(liveGroup);

    // Weather Exposure
    const weatherGroup = h('div', { class: 'form-group' });
    weatherGroup.append(h('label', { for: 'sm-weather-select' }, isEs ? 'Condiciones de clima actuales:' : 'Current weather / temperature exposure:'));
    const weatherSelect = h('select', { id: 'sm-weather-select', class: 'input-select' });
    [
      { val: 'freezing_winter', label: isEs ? 'Frío extremo / invierno / lluvia helada' : 'Freezing cold / winter / wet cold' },
      { val: 'extreme_heat', label: isEs ? 'Calor extremo / olas de calor (>90°F)' : 'Extreme heatwave (>90°F / 32°C)' },
      { val: 'mild', label: isEs ? 'Clima templado' : 'Mild weather' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.val }, opt.label);
      if (streetMedicineState.experiencingExtremeWeather === opt.val) optionEl.setAttribute('selected', 'selected');
      weatherSelect.append(optionEl);
    });
    weatherSelect.addEventListener('change', (e) => {
      setStreetMedicineState({ experiencingExtremeWeather: e.target.value });
      streetMedicineView(container, options);
    });
    weatherGroup.append(weatherSelect);
    formGrid.append(weatherGroup);

    // Facing sweep
    const sweepGroup = h('div', { class: 'form-group' });
    sweepGroup.append(h('label', { for: 'sm-sweep-select' }, isEs ? '¿Enfrenta desalojo de campamento inminente?' : 'Facing imminent camp clearing / sweep?'));
    const sweepSelect = h('select', { id: 'sm-sweep-select', class: 'input-select' });
    [
      { val: 'true', label: isEs ? 'Sí, riesgo de desalojo o limpieza' : 'Yes, facing camp sweep / clearing' },
      { val: 'false', label: isEs ? 'No por ahora' : 'No current sweep scheduled' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.val }, opt.label);
      if (String(streetMedicineState.facingSweepOrDisplacement) === opt.val) optionEl.setAttribute('selected', 'selected');
      sweepSelect.append(optionEl);
    });
    sweepSelect.addEventListener('change', (e) => {
      setStreetMedicineState({ facingSweepOrDisplacement: e.target.value === 'true' });
      streetMedicineView(container, options);
    });
    sweepGroup.append(sweepSelect);
    formGrid.append(sweepGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box
    const resBox = h('div', { class: 'card results-box' });
    resBox.append(h('h4', { class: 'card-title' }, isEs ? 'Plan de Protección en Calle y Salud' : 'Street Safety & Clinical Navigation Strategy'));

    if (plan.alerts.length > 0) {
      plan.alerts.forEach((alt) => {
        const altCard = h('div', { class: 'panel alert-panel alert-warning' });
        altCard.append(h('h5', { class: 'alert-title' }, icon('alert', { class: 'alert-icon' }), isEs ? alt.title.es : alt.title.en));
        altCard.append(p(isEs ? alt.detail.es : alt.detail.en));
        altCard.append(p(strong(isEs ? 'Acción recomendada: ' : 'Recommended Action: '), isEs ? alt.action.es : alt.action.en));
        resBox.append(altCard);
      });
    }

    if (plan.rightsGuidance.length > 0) {
      plan.rightsGuidance.forEach((rg) => {
        const rgCard = h('div', { class: 'card rights-card' });
        rgCard.append(h('h5', { class: 'rights-title' }, icon('shield', { class: 'shield-icon' }), isEs ? rg.title.es : rg.title.en));
        rgCard.append(p(isEs ? rg.detail.es : rg.detail.en));
        resBox.append(rgCard);
      });
    }

    if (plan.storageSolutions.length > 0) {
      const solStack = h('div', { class: 'storage-stack' });
      plan.storageSolutions.forEach((sol) => {
        const sBox = h('div', { class: 'card sol-card' });
        sBox.append(h('h5', { class: 'sol-title' }, icon('check', { class: 'check-icon' }), isEs ? sol.title.es : sol.title.en));
        sBox.append(p(isEs ? sol.detail.es : sol.detail.en));
        solStack.append(sBox);
      });
      resBox.append(solStack);
    }

    // Provider Discussion Checklist
    const discBox = h('div', { class: 'checklist-stack' });
    discBox.append(h('h5', { class: 'stack-title' }, isEs ? 'Preguntas para el Equipo Médico de Calle:' : 'Questions for Street Outreach Clinicians:'));
    plan.discussionItems.forEach((d) => {
      const itemEl = h('div', { class: 'checklist-item' });
      itemEl.append(h('span', { class: 'topic-badge' }, isEs ? d.topic.es : d.topic.en));
      itemEl.append(p(isEs ? d.question.es : d.question.en));
      discBox.append(itemEl);
    });
    resBox.append(discBox);

    tabPanel.append(resBox);
  }

  // --------------------------------------------------------------------------
  // TAB 2: Street MOUD
  // --------------------------------------------------------------------------
  if (currentTab === 'street_moud') {
    const moudCard = h('div', { class: 'card info-card' });
    moudCard.append(h('h3', { class: 'card-title' }, isEs ? 'Inicios de Buprenorfina de Bajo Umbral en la Calle' : 'Low-Barrier Street Medicine MOUD'));
    moudCard.append(p(
      isEs
        ? 'Los equipos de medicina callejera inician buprenorfina directamente en aceras, campamentos y centros de día. No exigen comprobante de domicilio, teléfono, identificación con foto ni pruebas de orina punitivas.'
        : 'Street medicine clinicians initiate buprenorphine directly on sidewalks and encampments without requiring proof of residence, phones, photo IDs, or punitive drug testing.'
    ));

    const rulesGrid = h('div', { class: 'rules-grid' });
    rulesGrid.append(h('div', { class: 'rule-card' },
      h('h4', {}, isEs ? 'Entrega de Medicamentos en el Punto de Encuentro' : 'Drop-In & Outreach Pharmacy Delivery'),
      p(isEs
        ? 'Las recetas se coordinan con farmacias comunitarias que entregan los paquetes al equipo de calle o a centros comunitarios donde usted pueda recogerlos a diario.'
        : 'Prescriptions are coordinated with community pharmacies that route medication bags directly to outreach vans or drop-in centers for reliable pick-up.'
      )
    ));
    rulesGrid.append(h('div', { class: 'rule-card' },
      h('h4', {}, isEs ? 'Reemplazo Rápido ante Robo o Pérdida' : 'Protocol for Stolen or Lost Doses'),
      p(isEs
        ? 'Los programas de medicina callejera tienen protocolos compasivos para reponer dosis perdidas en desalojos o robos, evitando que la persona caiga en abstinencia forzada.'
        : 'Trauma-informed street medicine teams have compassionate override protocols to replace doses lost during camp sweeps, preventing acute withdrawal.'
      )
    ));
    moudCard.append(rulesGrid);
    tabPanel.append(moudCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Shelter Rights
  // --------------------------------------------------------------------------
  if (currentTab === 'shelter_rights') {
    const rightsCard = h('div', { class: 'card info-card' });
    rightsCard.append(h('h3', { class: 'card-title' }, isEs ? 'Derechos en Refugios y Estatutos Federales de Vivienda' : 'HUD Equal Access & Shelter Non-Discrimination Protections'));

    STREET_MEDICINE_STATUTES.forEach((st) => {
      const sBox = h('div', { class: 'statute-box' });
      sBox.append(h('h4', { class: 'statute-title' }, isEs ? st.title.es : st.title.en));
      sBox.append(h('span', { class: 'statute-cite' }, st.citation));
      sBox.append(p(isEs ? st.summary.es : st.summary.en));
      rightsCard.append(sBox);
    });

    tabPanel.append(rightsCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: Weather Safety
  // --------------------------------------------------------------------------
  if (currentTab === 'weather_safety') {
    const weatherCard = h('div', { class: 'card info-card' });
    weatherCard.append(h('h3', { class: 'card-title' }, isEs ? 'Seguridad ante Clima Extremo (Hipotermia y Golpe de Calor)' : 'Extreme Weather Survival & Drug Interactions'));

    const coldBox = h('div', { class: 'exposure-box' });
    coldBox.append(h('h4', {}, ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.title[lang] || ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.title.en));
    coldBox.append(p(ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.clinicalMechanisms[lang] || ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.clinicalMechanisms.en));
    coldBox.append(p(strong(isEs ? 'Consejo de supervivencia: ' : 'Survival Guidance: '), ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.actionAdvice[lang] || ENVIRONMENTAL_EXPOSURE_RISKS.freezing_winter.actionAdvice.en));
    weatherCard.append(coldBox);

    const heatBox = h('div', { class: 'exposure-box' });
    heatBox.append(h('h4', {}, ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.title[lang] || ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.title.en));
    heatBox.append(p(ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.clinicalMechanisms[lang] || ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.clinicalMechanisms.en));
    heatBox.append(p(strong(isEs ? 'Consejo de supervivencia: ' : 'Survival Guidance: '), ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.actionAdvice[lang] || ENVIRONMENTAL_EXPOSURE_RISKS.extreme_heat.actionAdvice.en));
    weatherCard.append(heatBox);

    const weatherLinkBox = h('div', { class: 'mt-3' }, [
      h('a', { href: '#/weather-care', class: 'btn btn-secondary' }, isEs ? 'Ver Navegador Clínico de Hipotermia, Congelación y Golpe de Calor →' : 'Open Hypothermia, Frostbite & Heat Stroke Clinical Navigator →'),
    ]);
    weatherCard.append(weatherLinkBox);
    const endocarditisCard = h('div', { class: 'card p-3 mt-3' }, [
      h('strong', {}, isEs ? 'Sospecha de Endocarditis y Émbolos Sépticos: ' : 'Suspected Endocarditis & Septic Pulmonary Emboli: '),
      h('p', {}, isEs
        ? 'En pacientes que se inyectan con fiebre, dolor pleurítico o tos persistente, sospeche endocarditis tricuspídea con émbolos sépticos pulmonares: '
        : 'In individuals who inject drugs presenting with fever, pleuritic chest pain, or persistent cough, suspect tricuspid endocarditis with septic pulmonary emboli: '),
      h('a', { href: '#/endocarditis-care', class: 'btn btn-secondary' }, isEs ? 'Ver Navegador de Endocarditis Infecciosa →' : 'Open Infective Endocarditis Navigator →'),
    ]);
    weatherCard.append(endocarditisCard);
    const renalCard = h('div', { class: 'card p-3 mt-3' }, [
      h('strong', {}, isEs ? 'Tiempo en el Suelo, Rabdomiólisis y Orina Oscura: ' : 'Overdose Down Time, Rhabdomyolysis & Cola-Colored Urine: '),
      h('p', {}, isEs
        ? 'Si una persona despierta tras horas de sedación en el suelo con dolor muscular u orina color té/cola, sospeche rabdomiólisis aguda: '
        : 'If someone wakes up after prolonged sedation on hard ground with limb swelling or tea-colored urine, suspect acute rhabdomyolysis: '),
      h('a', { href: '#/renal-care', class: 'btn btn-secondary' }, isEs ? 'Ver Navegador de Salud Renal y Rabdomiólisis →' : 'Open Renal Health & Rhabdomyolysis Navigator →'),
    ]);
    weatherCard.append(renalCard);
    const pulmonaryCard = h('div', { class: 'card p-3 mt-3' }, [
      h('strong', {}, isEs ? 'Salud Pulmonar, "Pulmón de Crack" y Materiales de Fumar Seguro: ' : 'Pulmonary Health, "Crack Lung" & Safer Inhalation Kits: '),
      h('p', {}, isEs
        ? 'Dificultad para respirar, tos con sangre tras fumar o broncoespasmo severo. Directivas de pipas Pyrex y boquillas de silicona: '
        : 'Shortness of breath, hemoptysis post-smoking, or severe bronchospasm. Guidance for Pyrex glass stems and silicone tips: '),
      h('a', { href: '#/pulmonary-care', class: 'btn btn-secondary' }, isEs ? 'Ver Navegador de Salud Pulmonar e Inhalación →' : 'Open Pulmonary Health & Inhalation Navigator →'),
    ]);
    weatherCard.append(pulmonaryCard);

    tabPanel.append(weatherCard);
  }

  root.append(tabPanel);

  // Summary Actions (Print/Copy/Reset)
  const actions = h('div', { class: 'actions-row' });
  const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' }, isEs ? 'Copiar Plan Callejero' : 'Copy Street Care Plan');
  copyBtn.addEventListener('click', async () => {
    const text = formatStreetMedicineSummaryText(plan, lang);
    await copyText(text, {
      trigger: copyBtn,
      copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
      announceSuccess: isEs ? 'Plan copiado' : 'Plan copied to clipboard',
    });
  });
  actions.append(copyBtn);

  const resetBtn = h('button', { type: 'button', class: 'btn btn-ghost' }, isEs ? 'Restablecer' : 'Reset');
  resetBtn.addEventListener('click', () => {
    resetStreetMedicineState();
    streetMedicineView(container, options);
  });
  actions.append(resetBtn);

  root.append(actions);

  syncTablists(root);
  if (container) {
    container.append(root);
  }
  wireTablistKeyboard(container ?? root);
  return root;
}

