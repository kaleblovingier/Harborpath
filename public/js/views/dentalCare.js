// public/js/views/dentalCare.js
// HarborPath - Dental, Oral Health & Endocarditis Prevention Specialist
// Clinical standards: FDA Drug Safety Communication (2022), ADA, SAMHSA, AHA Endocarditis Prevention
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY & ORAL PROTOCOLS
// ============================================================================

export const FDA_BUPRENORPHINE_DENTAL_GUIDELINES = {
  titleEn: 'FDA 2022 Safety Communication: Buprenorphine Enamel Protection Protocol',
  titleEs: 'Comunicado de Seguridad FDA 2022: Protocolo de Protección del Esmalte con Buprenorfina',
  fdaNoticeEn: 'In January 2022, the FDA warned that transmucosal buprenorphine (films/tablets dissolved in the mouth) is acidic (pH ~3.5-4.0) and can cause dental caries and tooth loss if taken improperly. However, the FDA EXPLICITLY WARNED: DO NOT STOP TAKING YOUR MEDICATION. The benefits far outweigh risks, and enamel damage is completely preventable with proper oral harm reduction.',
  fdaNoticeEs: 'En enero de 2022, la FDA advirtió que la buprenorfina transmucosa (películas/tabletas disueltas en la boca) es ácida (pH ~3.5-4.0) y puede causar caries dental y pérdida de piezas si se toma de forma inadecuada. No obstante, la FDA ADVIRTIÓ EXPLÍCITAMENTE: NO SUSPENDA SU MEDICAMENTO. Los beneficios superan ampliamente los riesgos y el daño del esmalte es totalmente prevenible.',
  steps: [
    {
      step: 1,
      titleEn: 'Pre-Moisten Mouth with Water',
      titleEs: 'Humedezca la Boca con Agua',
      descEn: 'Take a sip of water and swallow to moisten oral mucosa BEFORE placing the tablet or film. A dry mouth hinders absorption and concentrates acid on teeth.',
      descEs: 'Tome un sorbo de agua y tráguelo para humedecer la mucosa ANTES de colocar la tableta o película. La boca seca dificulta la absorción y concentra el ácido en los dientes.'
    },
    {
      step: 2,
      titleEn: 'Allow Complete Dissolution',
      titleEs: 'Permita la Disolución Completa',
      descEn: 'Place the medication under your tongue (sublingual) or inside your cheek (buccal). Let it dissolve completely without chewing, sucking, or swallowing pieces.',
      descEs: 'Coloque el medicamento debajo de la lengua (sublingual) o dentro de la mejilla (bucal). Deje que se disuelva por completo sin masticar ni tragar trozos.'
    },
    {
      step: 3,
      titleEn: 'Post-Dissolution Swish & Swallow',
      titleEs: 'Enjuague y Trague Posterior',
      descEn: 'Once the medication is completely dissolved, take a sip of water, gently swish it around your entire mouth and between your teeth, and swallow. This washes residual acidic saliva away from tooth enamel.',
      descEs: 'Una vez completamente disuelto, tome un sorbo de agua, enjuáguese suavemente por toda la boca y entre los dientes, y tráguelo. Esto retira la saliva ácida residual del esmalte dental.'
    },
    {
      step: 4,
      titleEn: 'THE GOLDEN RULE: Wait at least 1 HOUR Before Brushing',
      titleEs: 'LA REGLA DE ORO: Espere al menos 1 HORA Antes de Cepillarse',
      descEn: 'CRITICAL: DO NOT brush your teeth immediately after taking buprenorphine! The acidic pH temporarily softens tooth enamel. Brushing immediately acts like sandpaper, abrading softened enamel away permanently. Wait at least 60 minutes for saliva to remineralize the enamel.',
      descEs: 'FUNDAMENTAL: ¡NO se cepille los dientes inmediatamente después de tomar buprenorfina! El pH ácido ablanda temporalmente el esmalte dental. Cepillarse de inmediato actúa como papel de lija, desgastando el esmalte de forma permanente. Espere al menos 60 minutos para que la saliva remineralice el esmalte.'
    },
    {
      step: 5,
      titleEn: 'High-Concentration Prescription Fluoride',
      titleEs: 'Fluoruro de Alta Concentración con Receta',
      descEn: 'Ask your dentist or addiction physician for 1.1% Neutral Sodium Fluoride toothpaste (Prevident 5000). Use at bedtime (spit, do not rinse) to harden enamel against acid attacks.',
      descEs: 'Pida a su dentista o médico especialista en adicciones pasta dental con fluoruro de sodio neutro al 1.1% (Prevident 5000). Úsela al acostarse (escupa, no enjuague) para endurecer el esmalte.'
    },
    {
      step: 6,
      titleEn: 'Subcutaneous Depot Alternative (Sublocade / Brixadi)',
      titleEs: 'Alternativa Subcutánea de Depósito (Sublocade / Brixadi)',
      descEn: 'If severe dental decay or gum disease persists, discuss monthly subcutaneous injectable buprenorphine with your doctor. It completely bypasses the oral cavity while delivering steady therapeutic opioid blockade.',
      descEs: 'Si las caries severas persisten, consulte con su médico sobre la buprenorfina inyectable subcutánea mensual. Evita por completo la cavidad oral y proporciona un bloqueo opioide terapéutico estable.'
    }
  ]
};

export const STIMULANT_ORAL_PROTOCOLS = [
  {
    id: 'xerostomia',
    nameEn: 'Stimulant-Induced Xerostomia (Severe Dry Mouth)',
    nameEs: 'Xerostomía por Estimulantes (Boca Seca Severa)',
    mechanismEn: 'Central alpha-2 and beta-adrenergic stimulation causes profound vasoconstriction of salivary glands, slashing salivary flow by up to 90%. Without natural salivary buffers and enzymes, bacteria produce rapid acid demineralization ("meth mouth").',
    mechanismEs: 'La estimulación adrenérgica central provoca una profunda vasoconstricción de las glándulas salivales, reduciendo el flujo salival hasta en un 90%. Sin los amortiguadores y enzimas naturales de la saliva, las bacterias producen una rápida desmineralización ácida ("boca de metanfetamina").',
    interventionsEn: [
      'Chew 100% xylitol gum or lozenges: Xylitol actively inhibits Streptococcus mutans bacteria and stimulates residual salivary flow.',
      'Use over-the-counter artificial saliva rinses or moisturizing oral gels (e.g., Biotene) throughout the day and before sleep.',
      'Sip fluoridated tap water frequently. Avoid caffeinated energy drinks, sodas, and juices: high acidity and sugar accelerate explosive cervical decay.',
      'Avoid alcohol-based commercial mouthwashes, which further dehydrate oral tissues.'
    ],
    interventionsEs: [
      'Matique chicle o pastillas con 100% xilitol: El xilitol inhibe activamente las bacterias Streptococcus mutans y estimula el flujo salival residual.',
      'Use enjuagues de saliva artificial o geles orales hidratantes de venta libre (ej. Biotene) durante el día y antes de dormir.',
      'Beba agua corriente fluorada con frecuencia. Evite bebidas energéticas, refrescos y jugos: su alta acidez y azúcar aceleran caries severas.',
      'Evite enjuagues bucales comerciales con alcohol, que deshidratan aún más los tejidos orales.'
    ]
  },
  {
    id: 'bruxism',
    nameEn: 'Stimulant Bruxism, Clenching & Trismus',
    nameEs: 'Bruxismo, Apretamiento Mandibular y Trismo por Estimulantes',
    mechanismEn: 'Excessive synaptic dopamine and norepinephrine cause continuous involuntary jaw clenching, grinding, and masseter muscle hypertrophy, fracturing tooth cusps and shearing restorations.',
    mechanismEs: 'El exceso de dopamina y norepinefrina sináptica causa apretamiento mandibular involuntario continuo y rechinamiento, fracturando cúspides dentales y restauraciones.',
    interventionsEn: [
      'Take Magnesium Glycinate (200-400 mg) prior to consumption to relax neuromuscular jaw tension.',
      'Wear an athletic mouthguard or custom acrylic nightguard during sleep or binge cycles to buffer occlusal force.',
      'Practice jaw resting position: "lips together, teeth apart, tongue resting on the roof of the mouth".'
    ],
    interventionsEs: [
      'Tome glicinato de magnesio (200-400 mg) antes del consumo para relajar la tensión neuromuscular mandibular.',
      'Use un protector bucal deportivo o una férula dental durante el sueño o periodos de consumo para amortiguar la fuerza oclusal.',
      'Practique la posición de reposo mandibular: "labios juntos, dientes separados, lengua apoyada en el paladar".'
    ]
  }
];

export const ENDOCARDITIS_ORAL_RED_FLAGS = [
  {
    id: 'ludwigs_angina',
    nameEn: "Ludwig's Angina (Life-Threatening Airway Emergency)",
    nameEs: 'Angina de Ludwig (Emergencia de Vía Aérea con Riesgo Vital)',
    symptomsEn: 'Rapidly spreading swelling under the chin, elevation/protrusion of the tongue, inability to swallow saliva (drooling), muffled "hot potato" voice, or difficulty breathing.',
    symptomsEs: 'Inflamación rápida debajo de la barbilla, elevación o salida de la lengua, incapacidad para tragar saliva (babeo), voz apagada ("voz de patata caliente") o dificultad para respirar.',
    actionEn: 'CALL 911 IMMEDIATELY. Spreads along fascial planes to compress the trachea. Requires urgent surgical airway protection.',
    actionEs: 'LLAME AL 911 DE INMEDIATO. Se propaga por los planos fasciales comprimiendo la tráquea. Requiere protección quirúrgica urgente de la vía aérea.'
  },
  {
    id: 'infective_endocarditis',
    nameEn: 'Infective Endocarditis (Heart Valve Infection from Oral Portals)',
    nameEs: 'Endocarditis Infecciosa (Infección de Válvulas Cardíacas por Vía Oral)',
    symptomsEn: 'Persistent unexplained fever, drenching night sweats, new heart murmur, extreme fatigue, shortness of breath, or painful red spots on fingers/toes (Osler nodes) after a tooth abscess or dental extraction.',
    symptomsEs: 'Fiebre persistente inexplicable, sudores nocturnos intensos, soplo cardíaco nuevo, fatiga extrema, falta de aire o nódulos rojos dolorosos en dedos (nódulos de Osler) tras un absceso dental o extracción.',
    actionEn: 'SEEK EMERGENCY HOSPITAL CARE. Oral bacteria (Streptococcus viridans) enter bloodstream through infected gums and colonize heart valves. Untreated endocarditis is fatal.',
    actionEs: 'ACUDA A URGENCIAS HOSPITALARIAS. Las bacterias orales (Streptococcus viridans) ingresan a la sangre a través de encías infectadas y colonizan las válvulas cardíacas. Sin tratamiento es mortal.'
  },
  {
    id: 'facial_cellulitis',
    nameEn: 'Spreading Facial Cellulitis / Eye Involvement',
    nameEs: 'Celulitis Facial en Expansión / Compromiso Ocular',
    symptomsEn: 'Swelling spreading upward toward the eye, eyelid swollen shut, facial asymmetry, fever, or throbbing severe pain unresponsive to OTC analgesics.',
    symptomsEs: 'Inflamación que se propaga hacia el ojo, párpado cerrado por hinchazón, asimetría facial, fiebre o dolor intenso pulsátil que no cede.',
    actionEn: 'URGENT MEDICAL/DENTAL ATTENTION within 12 hours. Risk of cavernous sinus thrombosis. Requires IV antibiotics and surgical drainage.',
    actionEs: 'ATENCIÓN MÉDICA/DENTAL URGENTE en menos de 12 horas. Riesgo de trombosis del seno cavernoso. Requiere antibióticos IV y drenaje quirúrgico.'
  }
];

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateOralHealthRisk({
  takingBuprenorphine = false,
  buprenorphineForm = 'sublingual_film', // 'sublingual_film' | 'sublingual_tablet' | 'depot_injection' | 'none'
  brushesImmediatelyAfterBup = false,
  usesStimulants = false,
  hasSevereDryMouth = false,
  hasToothAbscessOrSwelling = false,
  hasFeverOrNightSweats = false,
  hasDifficultySwallowingOrBreathing = false
} = {}) {
  const urgentAlerts = [];
  const enamelAlerts = [];
  const actionPearls = [];

  // 1. Airway Emergency (Ludwig's Angina)
  if (hasDifficultySwallowingOrBreathing && hasToothAbscessOrSwelling) {
    urgentAlerts.push({
      id: 'ludwigs_angina',
      titleEn: "CRITICAL RED FLAG: Ludwig's Angina Airway Compromise",
      titleEs: 'BANDERA ROJA CRÍTICA: Compromiso de Vía Aérea por Angina de Ludwig',
      actionEn: 'CALL 911 IMMEDIATELY. Spreading infection under the tongue can completely occlude your airway within hours. Go directly to an emergency department.',
      actionEs: 'LLAME AL 911 DE INMEDIATO. La propagación de una infección debajo de la lengua puede ocluir completamente la vía aérea en horas. Vaya a urgencias.'
    });
  }

  // 2. Infective Endocarditis
  if (hasFeverOrNightSweats && hasToothAbscessOrSwelling) {
    urgentAlerts.push({
      id: 'endocarditis_suspicion',
      titleEn: 'URGENT RED FLAG: Possible Infective Endocarditis (Heart Valve Seeding)',
      titleEs: 'BANDERA ROJA URGENTE: Posible Endocarditis Infecciosa (Siembra en Válvula Cardíaca)',
      actionEn: 'SEEK EMERGENCY CARE. Fever combined with dental abscess indicates bacterial hematogenous spread. Blood cultures and echocardiogram required under EMTALA.',
      actionEs: 'BUSQUE ATENCIÓN DE EMERGENCIA. La fiebre con absceso dental indica diseminación bacteriana hematógena. Se requieren hemocultivos y ecocardiograma.'
    });
  }

  // 3. Buprenorphine Brushing Error
  if (takingBuprenorphine && buprenorphineForm !== 'depot_injection' && brushesImmediatelyAfterBup) {
    enamelAlerts.push({
      id: 'brushing_too_soon',
      titleEn: 'CRITICAL ENAMEL ERROR: Brushing Immediately After Medication',
      titleEs: 'ERROR CRÍTICO DEL ESMALTE: Cepillarse Inmediatamente Tras el Medicamento',
      descEn: 'Transmucosal buprenorphine is acidic. Brushing right after dissolving abrades softened enamel away permanently! Switch immediately to: Swish and swallow water after dissolving, then WAIT AT LEAST 1 HOUR before brushing with a soft toothbrush.',
      descEs: 'La buprenorfina transmucosa es ácida. ¡Cepillarse justo después de disolverla desgasta el esmalte ablandado de forma permanente! Cambie de inmediato a: Enjuáguese y trague agua tras disolver, y ESPERE AL MENOS 1 HORA antes de cepillarse.'
    });
  }

  // 4. Stimulant Xerostomia
  if (usesStimulants || hasSevereDryMouth) {
    enamelAlerts.push({
      id: 'stimulant_xerostomia',
      titleEn: 'Severe Xerostomia (Salivary Gland Shutdown) Risk',
      titleEs: 'Riesgo de Xerostomía Severa (Cese de Función Salival)',
      descEn: 'Saliva is your primary biological defense against caries. Stimulants shut down salivary flow, causing rapid cervical tooth decay. Use 100% xylitol gum and over-the-counter artificial saliva rinses (Biotene). Sip water frequently and avoid acidic sodas.',
      descEs: 'La saliva es su principal defensa biológica contra las caries. Los estimulantes apagan el flujo salival, provocando caries cervicales rápidas. Use chicles con 100% xilitol y enjuagues de saliva artificial (Biotene). Beba agua y evite refrescos ácidos.'
    });
  }

  // Action Pearls
  if (takingBuprenorphine) {
    actionPearls.push({
      tipEn: 'Do NOT stop taking buprenorphine. The risk of fatal overdose recurrence is vastly higher than dental risks, and enamel is protected by the 1-hour brushing delay and fluoride.',
      tipEs: 'NO suspenda la buprenorfina. El riesgo de una recaída fatal por sobredosis es inmensamente mayor que los riesgos dentales, y el esmalte se protege esperando 1 hora para cepillarse y usando fluoruro.'
    });
    actionPearls.push({
      tipEn: 'Ask your prescriber for a prescription for 1.1% neutral sodium fluoride toothpaste (Prevident 5000) and consider depot buprenorphine (Sublocade / Brixadi) if dental issues persist.',
      tipEs: 'Pida a su médico una receta de pasta dental con fluoruro de sodio neutro al 1.1% (Prevident 5000) y considere buprenorfina de depósito (Sublocade / Brixadi) si los problemas dentales persisten.'
    });
  }

  actionPearls.push({
    tipEn: 'Federally Qualified Health Centers (FQHCs) provide low-cost and sliding-scale dental care regardless of insurance status. Call 800-ASK-HRSA or visit findahealthcenter.hrsa.gov.',
    tipEs: 'Los Centros de Salud Calificados a Nivel Federal (FQHC) brindan atención dental de bajo costo y escala móvil según ingresos. Llame al 800-ASK-HRSA o visite findahealthcenter.hrsa.gov.'
  });

  return {
    urgentAlerts,
    enamelAlerts,
    actionPearls
  };
}

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE INVARIANT)
// ============================================================================

let dentalState = {
  activeTab: 'assessment', // 'assessment' | 'bup-protocol' | 'stimulants-heart' | 'clinic-nav'
  takingBuprenorphine: true,
  buprenorphineForm: 'sublingual_film',
  brushesImmediatelyAfterBup: true,
  usesStimulants: false,
  hasSevereDryMouth: true,
  hasToothAbscessOrSwelling: false,
  hasFeverOrNightSweats: false,
  hasDifficultySwallowingOrBreathing: false,
  checklistMoistenPre: false,
  checklistSwishPost: false,
  checklistOneHourDelay: false,
  checklistFluoride: false
};

export function getDentalState() {
  return { ...dentalState };
}

export function setDentalState(patch = {}) {
  dentalState = { ...dentalState, ...patch };
}

export function resetDentalState() {
  dentalState = {
    activeTab: 'assessment',
    takingBuprenorphine: true,
    buprenorphineForm: 'sublingual_film',
    brushesImmediatelyAfterBup: true,
    usesStimulants: false,
    hasSevereDryMouth: true,
    hasToothAbscessOrSwelling: false,
    hasFeverOrNightSweats: false,
    hasDifficultySwallowingOrBreathing: false,
    checklistMoistenPre: false,
    checklistSwishPost: false,
    checklistOneHourDelay: false,
    checklistFluoride: false
  };
}

// ============================================================================
// BILINGUAL PLAIN-TEXT SUMMARY GENERATOR (ZERO-PII)
// ============================================================================

export function formatDentalSummaryText(state = dentalState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateOralHealthRisk(state);

  const lines = [];
  lines.push(isEs ? '=== EVALUACIÓN DE SALUD DENTAL, BUPRENORFINA Y ENDOCARDITIS DE HARBORPATH ===' : '=== HARBORPATH DENTAL, BUPRENORPHINE & ENDOCARDITIS SAFETY REPORT ===');
  lines.push(isEs ? `Fecha de generación: ${new Date().toISOString().split('T')[0]}` : `Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push(isEs ? 'Privacidad: En memoria RAM efímera (Cero almacenamiento en disco/servidor)' : 'Privacy: In-RAM ephemeral state (Zero device storage / Zero PII)');
  lines.push('');
  lines.push(isEs ? `Tratamiento con Buprenorfina: ${state.takingBuprenorphine ? `Sí (${state.buprenorphineForm})` : 'No'}` : `Buprenorphine Therapy: ${state.takingBuprenorphine ? `Yes (${state.buprenorphineForm})` : 'No'}`);
  lines.push(isEs ? `¿Se cepilla de inmediato?: ${state.brushesImmediatelyAfterBup ? 'SÍ (Riesgo de desgaste)' : 'No'}` : `Brushes immediately after dose: ${state.brushesImmediatelyAfterBup ? 'YES (High abrasion risk)' : 'No'}`);
  lines.push(isEs ? `Consumo de estimulantes / Boca seca: ${state.usesStimulants || state.hasSevereDryMouth ? 'Presente' : 'Ausente'}` : `Stimulant Use / Xerostomia: ${state.usesStimulants || state.hasSevereDryMouth ? 'Present' : 'Absent'}`);
  lines.push('');

  if (evalResult.urgentAlerts.length > 0) {
    lines.push(isEs ? '--- ALERTAS ROJAS DE EMERGENCIA INMEDIATA ---' : '--- IMMEDIATE EMERGENCY RED FLAGS ---');
    evalResult.urgentAlerts.forEach(a => {
      lines.push(`[!] ${isEs ? a.titleEs : a.titleEn}`);
      lines.push(`    ${isEs ? a.actionEs : a.actionEn}`);
    });
    lines.push('');
  }

  if (evalResult.enamelAlerts.length > 0) {
    lines.push(isEs ? '--- RIESGOS DE DESGASTE DEL ESMALTE Y BOCA SECA ---' : '--- ENAMEL ABRASION & XEROSTOMIA HAZARDS ---');
    evalResult.enamelAlerts.forEach(e => {
      lines.push(`* ${isEs ? e.titleEs : e.titleEn}`);
      lines.push(`  ${isEs ? e.descEs : e.descEn}`);
    });
    lines.push('');
  }

  lines.push(isEs ? '--- RECOMENDACIONES DE REDUCCIÓN DE DAÑOS DENTALES ---' : '--- DENTAL HARM REDUCTION ACTION PEARLS ---');
  evalResult.actionPearls.forEach(pt => {
    lines.push(`- ${isEs ? pt.tipEs : pt.tipEn}`);
  });
  lines.push('');
  lines.push(isEs ? 'Centros de Salud FQHC (Bajo Costo): findahealthcenter.hrsa.gov | 800-ASK-HRSA' : 'FQHC Community Dental Clinics: findahealthcenter.hrsa.gov | 800-ASK-HRSA');
  lines.push(isEs ? 'Emergencias Médicas: 911 | Línea de Crisis: 988' : 'Medical Emergencies: 911 | Suicide & Crisis Lifeline: 988');

  return lines.join('\n');
}

// ============================================================================
// MAIN VIEW COMPONENT (DOM RENDERING & ACCESSIBILITY)
// ============================================================================

export function dentalCareView() {
  const container = h('div', { class: 'dental-care-view' });

  function render() {
    clear(container);
    const isEs = typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'es';
    const localState = getDentalState();
    const evalResult = evaluateOralHealthRisk(localState);

    // Header banner
    const header = h('header', { class: 'view-header' }, [
      h('div', { class: 'badge badge-info' }, [
        icon('heart'),
        h('span', {}, isEs ? 'Salud Oral y Prevención de Infecciones' : 'Oral Health & Infection Prevention')
      ]),
      h('h1', {}, isEs ? 'Guía de Salud Dental, Buprenorfina y Prevención de Endocarditis' : 'Dental, Oral Health, Buprenorphine Safety & Endocarditis Prevention'),
      h('p', { class: 'view-intro' }, isEs
        ? 'Pautas basadas en la advertencia de la FDA de 2022 para proteger el esmalte dental al tomar buprenorfina, reducción de daños en boca seca por estimulantes, prevención de infecciones en válvulas cardíacas (endocarditis) y acceso a clínicas dentales de bajo costo.'
        : 'FDA 2022 safety communication protocols for protecting tooth enamel on transmucosal buprenorphine, stimulant dry mouth mitigation, heart valve infection (endocarditis) prevention, and low-cost community dental access.')
    ]);

    // Navigation Tabs
    const tabsNav = h('nav', { class: 'tab-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Salud Dental' : 'Dental Tabs' }, [
      h('button', {
        class: `tab-btn ${localState.activeTab === 'assessment' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'assessment'),
        onclick: () => { setDentalState({ activeTab: 'assessment' }); render(); }
      }, isEs ? 'Evaluación de Riesgo' : 'Risk Assessment'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'bup-protocol' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'bup-protocol'),
        onclick: () => { setDentalState({ activeTab: 'bup-protocol' }); render(); }
      }, isEs ? 'Protocolo FDA Buprenorfina' : 'FDA Buprenorphine Protocol'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'stimulants-heart' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'stimulants-heart'),
        onclick: () => { setDentalState({ activeTab: 'stimulants-heart' }); render(); }
      }, isEs ? 'Estimulantes y Endocarditis' : 'Stimulants & Endocarditis'),
      h('button', {
        class: `tab-btn ${localState.activeTab === 'clinic-nav' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': String(localState.activeTab === 'clinic-nav'),
        onclick: () => { setDentalState({ activeTab: 'clinic-nav' }); render(); }
      }, isEs ? 'Clínicas y Plan Seguro' : 'Clinics & Safe Plan')
    ]);

    let tabContent;
    switch (localState.activeTab) {
      case 'bup-protocol':
        tabContent = renderBupProtocolTab(isEs);
        break;
      case 'stimulants-heart':
        tabContent = renderStimulantsHeartTab(isEs);
        break;
      case 'clinic-nav':
        tabContent = renderClinicNavTab(isEs, localState, evalResult, render);
        break;
      case 'assessment':
      default:
        tabContent = renderAssessmentTab(isEs, localState, evalResult, render);
        break;
    }

    container.appendChild(header);
    container.appendChild(tabsNav);
    container.appendChild(tabContent);
  }

  render();
  return container;
}

// ----------------------------------------------------------------------------
// TAB 1: RISK ASSESSMENT & SCREENER
// ----------------------------------------------------------------------------

function renderAssessmentTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const inputCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? '1. Identifique sus Factores de Riesgo Oral y Medicación' : '1. Identify Your Oral Risk Factors & Medications'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Responda a las siguientes preguntas para generar un plan personalizado de protección dental y detección de banderas rojas de infección sistémica.'
      : 'Answer the following questions to generate a tailored dental protection plan and screen for systemic infection red flags.')
  ]);

  const formGrid = h('div', { class: 'dental-form-grid' });

  // Buprenorphine use checkbox
  const bupLabel = h('label', { class: 'checkbox-label' }, [
    h('input', {
      type: 'checkbox',
      checked: localState.takingBuprenorphine,
      onchange: (e) => {
        setDentalState({ takingBuprenorphine: e.target.checked });
        reRender();
      }
    }),
    h('span', {}, isEs ? 'Tomo buprenorfina (Suboxone, Subutex, Zubsolv) disuelta en la boca' : 'I take transmucosal buprenorphine (Suboxone, Subutex, Zubsolv) dissolved in my mouth')
  ]);
  formGrid.appendChild(bupLabel);

  if (localState.takingBuprenorphine) {
    const brushLabel = h('label', { class: 'checkbox-label indent-checkbox' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.brushesImmediatelyAfterBup,
        onchange: (e) => {
          setDentalState({ brushesImmediatelyAfterBup: e.target.checked });
          reRender();
        }
      }),
      h('span', { class: 'text-warning' }, isEs ? '¿Se cepilla los dientes inmediatamente o poco después de que se disuelva el medicamento?' : 'Do you brush your teeth immediately or shortly after the medicine dissolves?')
    ]);
    formGrid.appendChild(brushLabel);
  }

  // Stimulants checkbox
  const stimLabel = h('label', { class: 'checkbox-label' }, [
    h('input', {
      type: 'checkbox',
      checked: localState.usesStimulants,
      onchange: (e) => {
        setDentalState({ usesStimulants: e.target.checked });
        reRender();
      }
    }),
    h('span', {}, isEs ? 'Consumo estimulantes (metanfetamina, cocaína o medicamentos para TDAH)' : 'I use stimulants (methamphetamine, cocaine, or prescription ADHD medications)')
  ]);
  formGrid.appendChild(stimLabel);

  // Severe dry mouth
  const dryLabel = h('label', { class: 'checkbox-label' }, [
    h('input', {
      type: 'checkbox',
      checked: localState.hasSevereDryMouth,
      onchange: (e) => {
        setDentalState({ hasSevereDryMouth: e.target.checked });
        reRender();
      }
    }),
    h('span', {}, isEs ? 'Tengo sequedad bucal persistente (falta de saliva al hablar o comer)' : 'I experience persistent dry mouth (lack of saliva when speaking or eating)')
  ]);
  formGrid.appendChild(dryLabel);

  // Red flag symptoms
  const abscessLabel = h('label', { class: 'checkbox-label' }, [
    h('input', {
      type: 'checkbox',
      checked: localState.hasToothAbscessOrSwelling,
      onchange: (e) => {
        setDentalState({ hasToothAbscessOrSwelling: e.target.checked });
        reRender();
      }
    }),
    h('span', {}, isEs ? 'Tengo dolor dental severo, encía inflamada o flemón (absceso)' : 'I have severe tooth pain, gum swelling, or a visible tooth abscess')
  ]);
  formGrid.appendChild(abscessLabel);

  const feverLabel = h('label', { class: 'checkbox-label' }, [
    h('input', {
      type: 'checkbox',
      checked: localState.hasFeverOrNightSweats,
      onchange: (e) => {
        setDentalState({ hasFeverOrNightSweats: e.target.checked });
        reRender();
      }
    }),
    h('span', {}, isEs ? 'Tengo fiebre inexplicable, escalofríos o sudores nocturnos intensos' : 'I have unexplained fever, chills, or drenching night sweats')
  ]);
  formGrid.appendChild(feverLabel);

  const swallowLabel = h('label', { class: 'checkbox-label' }, [
    h('input', {
      type: 'checkbox',
      checked: localState.hasDifficultySwallowingOrBreathing,
      onchange: (e) => {
        setDentalState({ hasDifficultySwallowingOrBreathing: e.target.checked });
        reRender();
      }
    }),
    h('span', {}, isEs ? 'Dificultad para tragar saliva, hablar o respirar, o hinchazón bajo la barbilla' : 'Difficulty swallowing saliva, talking, or breathing, or swelling under chin')
  ]);
  formGrid.appendChild(swallowLabel);

  inputCard.appendChild(formGrid);

  // Results Section
  const resultCard = h('section', { class: 'card', 'aria-live': 'polite' }, [
    h('h3', {}, isEs ? '2. Evaluación de Riesgo y Recomendaciones Clínicas' : '2. Risk Assessment & Clinical Actions')
  ]);

  if (evalResult.urgentAlerts.length > 0) {
    const alertBox = h('div', { class: 'callout callout-emergency' }, [
      h('h4', {}, [icon('alert-octagon'), h('span', {}, isEs ? '¡Atención de Emergencia Requerida!' : 'Emergency Medical Attention Required!')]),
      h('ul', {}, evalResult.urgentAlerts.map(a => h('li', {}, [
        h('strong', {}, isEs ? a.titleEs : a.titleEn),
        h('p', {}, isEs ? a.actionEs : a.actionEn)
      ])))
    ]);
    resultCard.appendChild(alertBox);
  }

  if (evalResult.enamelAlerts.length > 0) {
    const enamelBox = h('div', { class: 'enamel-alerts-list' }, evalResult.enamelAlerts.map(e => {
      return h('div', { class: 'enamel-alert-card' }, [
        h('strong', {}, isEs ? e.titleEs : e.titleEn),
        h('p', {}, isEs ? e.descEs : e.descEn)
      ]);
    }));
    resultCard.appendChild(enamelBox);
  }

  if (evalResult.actionPearls.length > 0) {
    const pearlsList = h('div', { class: 'pearls-list' }, [
      h('h4', {}, isEs ? 'Pautas Esenciales de Reducción de Daños' : 'Core Harm Reduction Action Pearls'),
      h('ul', { class: 'bullet-list' }, evalResult.actionPearls.map(p => h('li', {}, isEs ? p.tipEs : p.tipEn)))
    ]);
    resultCard.appendChild(pearlsList);
  }

  wrapper.appendChild(inputCard);
  wrapper.appendChild(resultCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 2: FDA BUPRENORPHINE ORAL PROTOCOL
// ----------------------------------------------------------------------------

function renderBupProtocolTab(isEs) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  const introCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? FDA_BUPRENORPHINE_DENTAL_GUIDELINES.titleEs : FDA_BUPRENORPHINE_DENTAL_GUIDELINES.titleEn),
    h('div', { class: 'callout callout-info' }, [
      h('strong', {}, isEs ? 'Aviso Oficial de la FDA:' : 'Official FDA Notice:'),
      h('p', {}, isEs ? FDA_BUPRENORPHINE_DENTAL_GUIDELINES.fdaNoticeEs : FDA_BUPRENORPHINE_DENTAL_GUIDELINES.fdaNoticeEn)
    ])
  ]);

  const stepsList = h('div', { class: 'protocol-steps' });
  FDA_BUPRENORPHINE_DENTAL_GUIDELINES.steps.forEach(st => {
    const stepCard = h('div', { class: 'step-card' }, [
      h('div', { class: 'step-badge' }, String(st.step)),
      h('div', { class: 'step-body' }, [
        h('h4', {}, isEs ? st.titleEs : st.titleEn),
        h('p', {}, isEs ? st.descEs : st.descEn)
      ])
    ]);
    stepsList.appendChild(stepCard);
  });
  introCard.appendChild(stepsList);

  wrapper.appendChild(introCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 3: STIMULANTS & ENDOCARDITIS
// ----------------------------------------------------------------------------

function renderStimulantsHeartTab(isEs) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  // Stimulants section
  const stimCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Reducción de Daños en Boca Seca (Xerostomía) y Bruxismo por Estimulantes' : 'Stimulant Xerostomia (Dry Mouth) & Bruxism Harm Reduction'),
    h('p', {}, isEs
      ? 'La pérdida de saliva y el rechinamiento continuo son las principales causas del daño dental acelerado en personas que consumen estimulantes. Intervenciones sencillas marcan la diferencia.'
      : 'Salivary shutdown and relentless clenching drive accelerated tooth damage in stimulant use. Targeted harm reduction preserves dentition.')
  ]);

  const stimGrid = h('div', { class: 'stim-grid' });
  STIMULANT_ORAL_PROTOCOLS.forEach(prot => {
    const card = h('article', { class: 'card stim-card' }, [
      h('h4', {}, isEs ? prot.nameEs : prot.nameEn),
      h('p', { class: 'mechanism-text' }, isEs ? prot.mechanismEs : prot.mechanismEn),
      h('h5', {}, isEs ? 'Estrategias de Protección:' : 'Protection Strategies:'),
      h('ul', { class: 'bullet-list' }, (isEs ? prot.interventionsEs : prot.interventionsEn).map(tip => h('li', {}, tip)))
    ]);
    stimGrid.appendChild(card);
  });
  stimCard.appendChild(stimGrid);

  // Endocarditis section
  const endoCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Banderas Rojas de Endocarditis y Emergencias de Vía Aérea' : 'Endocarditis Red Flags & Oral Airway Emergencies'),
    h('p', {}, isEs
      ? 'Las bacterias orales (Streptococcus viridans) penetran en el torrente sanguíneo a través de encías inflamadas y caries profundas, colonizando las válvulas cardíacas. Reconozca estas señales a tiempo.'
      : 'Oral flora (Streptococcus viridans) enter bloodstream through periodontal pockets and tooth infections, colonizing heart valves. Recognize these signs early.')
  ]);

  const endoList = h('div', { class: 'endo-grid' });
  ENDOCARDITIS_ORAL_RED_FLAGS.forEach(flag => {
    const card = h('article', { class: 'card endo-card' }, [
      h('h4', {}, isEs ? flag.nameEs : flag.nameEn),
      h('p', {}, [h('strong', {}, isEs ? 'Síntomas: ' : 'Symptoms: '), h('span', {}, isEs ? flag.symptomsEs : flag.symptomsEn)]),
      h('div', { class: 'callout callout-warning' }, [
        h('strong', {}, isEs ? 'Acción Requerida: ' : 'Required Action: '),
        h('span', {}, isEs ? flag.actionEs : flag.actionEn)
      ])
    ]);
    endoList.appendChild(card);
  });
  endoCard.appendChild(endoList);

  wrapper.appendChild(stimCard);
  wrapper.appendChild(endoCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 4: CLINIC NAVIGATION & SAFE PLAN
// ----------------------------------------------------------------------------

function renderClinicNavTab(isEs, localState, evalResult, reRender) {
  const wrapper = h('div', { class: 'tab-content-panel', role: 'tabpanel' });

  // Clinic Nav Info
  const clinicCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Cómo Acceder a Atención Dental Asequible y Sin Estigma' : 'Accessing Affordable, Stigma-Free Dental Care'),
    h('p', {}, isEs
      ? 'Muchas personas temen al dentista por miedo a ser juzgadas o por falta de seguro dental. Existen recursos públicos diseñados específicamente para brindar atención digna a precios accesibles.'
      : 'Many individuals delay dental care due to fear of stigma or lack of dental insurance. Public and sliding-scale resources exist to provide respectful, affordable treatment.'),
    h('ul', { class: 'bullet-list' }, [
      h('li', {}, [
        h('strong', {}, isEs ? 'Centros de Salud FQHC (Escala Móvil): ' : 'FQHC Community Health Centers: '),
        h('span', {}, isEs
          ? 'Los centros FQHC ofrecen servicios dentales con descuentos según el tamaño familiar y los ingresos, incluso sin seguro médico. Visite findahealthcenter.hrsa.gov o llame al 800-ASK-HRSA.'
          : 'FQHCs provide comprehensive dental care with fees scaled to your income, regardless of insurance status. Visit findahealthcenter.hrsa.gov or call 800-ASK-HRSA.')
      ]),
      h('li', {}, [
        h('strong', {}, isEs ? 'Facultades y Clínicas Universitarias de Odontología: ' : 'Dental School Clinics: '),
        h('span', {}, isEs
          ? 'Las facultades de odontología ofrecen tratamientos de alta calidad supervisados por profesores con tarifas entre un 50% y un 70% más bajas.'
          : 'Dental and dental hygiene schools provide comprehensive care supervised by board-certified faculty at 50-70% lower rates.')
      ]),
      h('li', {}, [
        h('strong', {}, isEs ? 'Programa Ryan White Parte A/B: ' : 'Ryan White Part A/B Dental Services: '),
        h('span', {}, isEs
          ? 'Para personas que viven con VIH, el programa Ryan White cubre atención dental integral.'
          : 'For people living with HIV, Ryan White programs cover routine and emergency dental services.')
      ])
    ])
  ]);

  // Dental Agreement Checklist
  const planCard = h('section', { class: 'card' }, [
    h('h3', {}, isEs ? 'Lista de Compromiso Diario para la Salud Dental en Recuperación' : 'Daily Dental Harm Reduction Agreement'),
    h('p', {}, isEs
      ? 'Marque sus compromisos de higiene oral. Los datos se mantienen únicamente en la memoria RAM y se borran al cerrar o pulsar Salida Rápida.'
      : 'Track your daily oral protection habits. Stored strictly in ephemeral RAM and wiped upon close or Quick Exit.')
  ]);

  const checklist = h('div', { class: 'checklist-group' }, [
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistMoistenPre,
        onchange: (e) => {
          setDentalState({ checklistMoistenPre: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Humedecer la boca: Bebo un sorbo de agua ANTES de colocar la tableta/película' : 'Pre-moisten: I drink water before placing my sublingual/buccal medication')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistSwishPost,
        onchange: (e) => {
          setDentalState({ checklistSwishPost: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Enjuague y trague: Enjuago con agua y trago DESPUÉS de que se disuelve la buprenorfina' : 'Swish & swallow: I swish with water and swallow after the medication dissolves')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistOneHourDelay,
        onchange: (e) => {
          setDentalState({ checklistOneHourDelay: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Regla de 1 hora: Espero al menos 60 minutos antes de cepillarme para no dañar el esmalte' : '1-hour delay: I wait at least 60 minutes before brushing my teeth after medication')
    ]),
    h('label', { class: 'checkbox-label' }, [
      h('input', {
        type: 'checkbox',
        checked: localState.checklistFluoride,
        onchange: (e) => {
          setDentalState({ checklistFluoride: e.target.checked });
          reRender();
        }
      }),
      h('span', {}, isEs ? 'Fluoruro y xilitol: Uso pasta con alto fluoruro (Prevident) y chicles con xilitol' : 'Fluoride & xylitol: I use high-fluoride toothpaste and chew xylitol gum for dry mouth')
    ])
  ]);
  planCard.appendChild(checklist);

  // Plain Text Export Box
  const exportSection = h('section', { class: 'card export-section' }, [
    h('h3', {}, isEs ? 'Copia y Exportación de Resumen Seguro (Sin PII)' : 'Secure Summary Export (Zero PII)'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Genere y copie un resumen en texto plano para dialogar sobre protección del esmalte con su médico o dentista.'
      : 'Generate and copy a privacy-safe text summary to discuss oral protection with your doctor or dentist.')
  ]);

  const summaryText = formatDentalSummaryText(localState, isEs ? 'es' : 'en');
  const textArea = h('textarea', {
    class: 'summary-textarea',
    readonly: 'readonly',
    rows: 14,
    'aria-label': isEs ? 'Resumen de Salud Dental' : 'Dental Health Summary'
  }, summaryText);

  const copyStatus = h('span', { class: 'copy-status', 'aria-live': 'polite' }, '');
  const copyBtn = h('button', {
    class: 'btn btn-primary',
    onclick: async () => {
      try {
        await navigator.clipboard.writeText(summaryText);
        copyStatus.textContent = isEs ? ' ¡Copiado con éxito!' : ' Copied successfully!';
        setTimeout(() => { copyStatus.textContent = ''; }, 3000);
      } catch (_e) {
        copyStatus.textContent = isEs ? ' Error al copiar' : ' Copy failed';
      }
    }
  }, [
    icon('copy'),
    h('span', {}, isEs ? 'Copiar Resumen Seguro' : 'Copy Safe Summary')
  ]);

  const resetBtn = h('button', {
    class: 'btn btn-secondary',
    onclick: () => {
      resetDentalState();
      reRender();
    }
  }, [
    icon('refresh-cw'),
    h('span', {}, isEs ? 'Restablecer Estado' : 'Reset State')
  ]);

  const btnRow = h('div', { class: 'btn-row' }, [copyBtn, resetBtn, copyStatus]);
  exportSection.appendChild(textArea);
  exportSection.appendChild(btnRow);

  wrapper.appendChild(clinicCard);
  wrapper.appendChild(planCard);
  wrapper.appendChild(exportSection);
  return wrapper;
}

