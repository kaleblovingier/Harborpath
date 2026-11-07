/**
 * Syringe Services Program (SSP) & Safer Equipment Tracker (public/js/components/sspEquipmentTracker.js)
 *
 * Evidence-based harm reduction equipment calculator and safety standards based on
 * CDC Syringe Services Programs (SSP) guidelines, Harm Reduction Coalition standards,
 * and clinical safer injection & inhalation sciences:
 *
 * 1. Needle Gauge & Low Dead-Space Technology:
 *    - Recommends low dead-space fixed-needle syringes (27G to 31G; 5/16" or 1/2") which reduce
 *      residual blood volume tenfold, cutting HIV/HCV transmission risk by up to 99%.
 *    - Discourages large-bore needles (18G–25G) that cause vein blowout, hematoma, and rapid sclerosis.
 *
 * 2. Essential Sterile Supplies & Chemical Safety:
 *    - Sterile Water Ampoules: Prevents tap/puddle water contamination (Pseudomonas, fungal endophthalmitis).
 *    - Pure Ascorbic Acid (Vitamin C): Acidifier for black tar and crack; explicit directive to NEVER use
 *      lemon juice or vinegar which harbor fungal spores causing permanent blindness.
 *    - Alcohol Prep Pads: Clean skin BEFORE injection; NEVER press alcohol on a puncture site AFTER injection
 *      (delays clotting and causes chemical tissue necrosis; use sterile dry cotton with pressure).
 *
 * 3. Safer Inhalation Equipment:
 *    - Pyrex borosilicate pipes, brass screens (replacing toxic copper scouring pads), silicone mouthpieces,
 *      and lip balm to prevent oral cuts and HCV transmission via shared pipes.
 *
 * 4. Safe Biohazard Sharps Disposal:
 *    - FDA-cleared sharps containers or heavy-duty puncture-resistant plastic containers (detergent bottles).
 *
 * Strict Invariants:
 * - Zero npm dependencies (plain ES modules).
 * - Zero PII: 100% ephemeral in-RAM state. Never writes user answers to URLs, device storage, or cookies.
 * - Accessible DOM construction via h() (document.createElement, textContent, setAttribute).
 *   ZERO direct markup string injection or inline style attributes.
 * - Complete bilingual parity (English / Spanish).
 */

import { h, clear, ext, tel, sms, icon, announce } from '../dom.js';
import { p, fine, ul, strong } from '../views/common.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetSspTrackerState);

// ============================================================================
// 1. Evidence-Based Equipment Standards
// ============================================================================

export const SSP_EQUIPMENT_SPECIFICATIONS = [
  {
    category: 'syringes',
    title: { en: 'Low Dead-Space Fixed-Needle Syringes (27G–31G)', es: 'Jeringas de Bajo Espacio Muerto con Aguja Fija (27G–31G)' },
    rationale: {
      en: 'Low dead-space syringes retain 10x less residual fluid in the needle hub, reducing viral transmission risk (HIV/HCV) by over 90%. Fine 28G–31G needles minimize vein tearing, scarring, and abscesses.',
      es: 'Las jeringas de bajo espacio muerto retienen 10 veces menos líquido residual, reduciendo el riesgo de VIH/VHC en más del 90%. Las agujas finas 28G–31G minimizan desgarros venosos y abscesos.',
    },
  },
  {
    category: 'sterile_water',
    title: { en: 'Single-Use Sterile Water Vials (Never Tap or Bottled Water)', es: 'Ampollas de Agua Estéril Descartables (Nunca Agua del Grifo)' },
    rationale: {
      en: 'Tap water, mineral water, and saliva contain Pseudomonas, Acanthamoeba, and Candida albicans. Injecting non-sterile water causes fungal endophthalmitis (irreversible eye blindness), septic arthritis, and heart valve infections.',
      es: 'El agua del grifo, embotellada o saliva contienen bacterias y hongos como Candida albicans. Inyectar agua no estéril causa endoftalmitis micótica (ceguera irreversible), artritis séptica y endocarditis.',
    },
  },
  {
    category: 'ascorbic_acid',
    title: { en: 'Pure Ascorbic Acid (Vitamin C) - NEVER Lemon Juice or Vinegar', es: 'Ácido Ascórbico Puro (Vitamina C) - NUNCA Jugo de Limón ni Vinagre' },
    rationale: {
      en: 'Required only to dissolve crack cocaine or black tar heroin. Lemon juice and vinegar harbor fungal spores that grow inside the eyes and brain. Use only medical-grade ascorbic acid, adding tiny pinches until dissolved.',
      es: 'Requerido solo para disolver crack o heroína negra. El jugo de limón y vinagre albergan hongos que destruyen la vista. Use solo ácido ascórbico médico en cantidades mínimas.',
    },
  },
  {
    category: 'alcohol_pads',
    title: { en: 'Alcohol Prep Pads (BEFORE Puncture ONLY, Never After)', es: 'Toallitas de Alcohol (SOLO ANTES de la Punción, Nunca Después)' },
    rationale: {
      en: 'Clean the skin vigorously in a circular outward motion and wait 30 seconds to air dry BEFORE injecting. NEVER press an alcohol swab on the puncture site after injecting; alcohol burns open capillaries, inhibits clotting, and delays healing. Use dry sterile gauze.',
      es: 'Limpie la piel en círculos hacia afuera y deje secar 30 segundos ANTES de inyectar. NUNCA frote alcohol después de inyectar; el alcohol irrita los capilares, inhibe la coagulación y retrasa la cicatrización. Use gasa seca.',
    },
  },
  {
    category: 'inhalation_supplies',
    title: { en: 'Safer Inhalation Supplies (Pyrex Glass, Brass Screens & Lip Balm)', es: 'Insumos de Inhalación Segura (Vidrio Pyrex, Mallas de Latón y Bálsamo)' },
    rationale: {
      en: 'Pyrex pipes resist cracking under high heat. Brass screens eliminate toxic fumes from copper scouring pads (Chore Boy) that cause metal fume fever. Personal silicone mouthpieces and lip balm prevent blister cuts that transmit Hepatitis C.',
      es: 'Las pipas de Pyrex resisten el calor sin fracturarse. Las mallas de latón eliminan humos tóxicos de estropajos de cobre. Las boquillas de silicona y el bálsamo labial evitan cortes que transmiten Hepatitis C.',
    },
  },
];

// ============================================================================
// 2. In-RAM Calculator Engine: calculateSspEquipmentNeeds(inputs)
// ============================================================================

export function calculateSspEquipmentNeeds(inputs = {}) {
  const {
    routeOfUse = 'injection',         // 'injection' | 'inhalation_smoking' | 'snorting_intranasal' | 'multiple'
    dailyUseFrequency = 3,            // number of times per day
    suppliesDurationDays = 7,         // number of days (e.g. 7, 14, 30)
    substanceType = 'powder_opioids', // 'powder_opioids' | 'tar_or_crack' | 'methamphetamine' | 'multiple'
  } = inputs;

  const validFrequency = Math.max(1, parseInt(dailyUseFrequency, 10) || 1);
  const validDays = Math.max(1, parseInt(suppliesDurationDays, 10) || 7);

  const totalEvents = validFrequency * validDays;
  const isInjection = routeOfUse === 'injection' || routeOfUse === 'multiple';
  const isInhalation = routeOfUse === 'inhalation_smoking' || routeOfUse === 'multiple';
  const needsAcid = substanceType === 'tar_or_crack';

  // 1. Calculate Syringe Counts (with 1.35x buffer for misses/clogs)
  const recommendedSyringes = isInjection ? Math.ceil(totalEvents * 1.35) : 0;
  const sterileWaterVials = isInjection ? Math.ceil(totalEvents * 1.2) : 0;
  const alcoholPads = isInjection ? Math.ceil(totalEvents * 1.5) : 0;
  const sterileCookers = isInjection ? Math.ceil(totalEvents * 1.0) : 0;
  const vitaminCPackets = isInjection && needsAcid ? Math.ceil(totalEvents * 0.75) : 0;

  // 2. Specific Recommendations
  const supplyList = [];

  if (isInjection) {
    supplyList.push({
      item: { en: `Sterile Low Dead-Space Syringes (~${recommendedSyringes} units)`, es: `Jeringas Estériles de Bajo Espacio Muerto (~${recommendedSyringes} unidades)` },
      detail: {
        en: 'Recommended: 28G to 31G (1/2" or 5/16" needle). Single-use only. Never re-sharpen or reuse.',
        es: 'Recomendado: 28G a 31G (aguja de 1/2" o 5/16"). De un solo uso. Nunca afile ni reutilice.',
      },
    });

    supplyList.push({
      item: { en: `Sterile Water Ampoules (~${sterileWaterVials} vials)`, es: `Ampollas de Agua Estéril (~${sterileWaterVials} viales)` },
      detail: {
        en: 'Single-use plastic twist-off vials. Discard remaining water after each injection event.',
        es: 'Viales de plástico descartables. Deseche el sobrante tras cada inyección.',
      },
    });

    supplyList.push({
      item: { en: `Alcohol Prep Pads (~${alcoholPads} pads)`, es: `Toallitas de Alcohol (~${alcoholPads} toallitas)` },
      detail: {
        en: 'For skin cleaning BEFORE needle insertion only. Do not apply to bleeding puncture sites.',
        es: 'Para limpiar la piel ANTES de insertar la aguja. No aplique sobre heridas sangrantes.',
      },
    });

    supplyList.push({
      item: { en: `Sterile Cookers & Cotton Pellets (~${sterileCookers} cookers)`, es: `Cazoletas Estériles y Filtros (~${sterileCookers} cazoletas)` },
      detail: {
        en: 'Single-use cookers prevent shared viral contamination. Never save or reuse old filters (prevents cotton fever).',
        es: 'Cazoletas descartables para evitar contaminación viral. Nunca reutilice filtros viejos (evita fiebre de algodón).',
      },
    });

    if (needsAcid) {
      supplyList.push({
        item: { en: `Ascorbic Acid (Vitamin C) (~${vitaminCPackets} packets)`, es: `Ácido Ascórbico (Vitamina C) (~${vitaminCPackets} sobres)` },
        detail: {
          en: 'Use tiny pinches to dissolve tar or crack. Never use vinegar or lemon juice.',
          es: 'Use cantidades mínimas para disolver heroína negra o crack. Nunca use vinagre ni limón.',
        },
      });
    }

    supplyList.push({
      item: { en: 'FDA-Cleared Sharps Container (or Heavy Detergent Bottle)', es: 'Recipiente Rígido de Objetos Punzocortantes' },
      detail: {
        en: 'Puncture-resistant container with screw-on lid. Keep out of reach of children and pets.',
        es: 'Contenedor resistente a perforaciones con tapa de rosca. Manténgalo fuera del alcance de niños.',
      },
    });
  }

  if (isInhalation) {
    supplyList.push({
      item: { en: 'Pyrex Glass Stems & Silicone Mouthpieces (2–4 kits)', es: 'Tubos de Vidrio Pyrex y Boquillas de Silicona (2–4 kits)' },
      detail: {
        en: 'Borosilicate glass prevents thermal cracking. Individual mouthpieces prevent HCV transmission through lip sores.',
        es: 'Vidrio de borosilicato resistente a fracturas por calor. Boquillas personales para evitar VHC por llagas labiales.',
      },
    });

    supplyList.push({
      item: { en: 'Brass Screens (Package of 10–20)', es: 'Mallas de Latón (Paquete de 10–20)' },
      detail: {
        en: 'Safe metal screens. Avoid steel wool or copper scouring pads which release toxic pulmonary fumes.',
        es: 'Mallas metálicas seguras. Evite estropajos de cobre que liberan humos pulmonares tóxicos.',
      },
    });

    supplyList.push({
      item: { en: 'Lip Balm / Emollient', es: 'Bálsamo Labial / Emoliente' },
      detail: {
        en: 'Prevents chapped, cracked, or bleeding lips, eliminating the primary vector for viral hepatitis transmission.',
        es: 'Previene labios partidos o sangrantes, eliminando el vector principal de transmisión de hepatitis.',
      },
    });
  }

  // Always include Naloxone and Fentanyl Test Strips
  supplyList.push({
    item: { en: 'Naloxone Rescue Kits (At least 2 kits / 4 doses)', es: 'Kits de Rescate con Naloxona (Al menos 2 kits / 4 dosis)' },
    detail: {
      en: 'Keep 1 on your person and 1 at your living area. High-potency synthetics often require multiple doses.',
      es: 'Lleve 1 consigo y tenga 1 en su lugar de descanso. Los opioides sintéticos suelen requerir varias dosis.',
    },
  });

  return {
    evaluatedAt: new Date().toISOString(),
    inputs: {
      routeOfUse,
      dailyUseFrequency: validFrequency,
      suppliesDurationDays: validDays,
      substanceType,
    },
    totalEvents,
    recommendedSyringes,
    sterileWaterVials,
    alcoholPads,
    sterileCookers,
    vitaminCPackets,
    supplyList,
    standards: SSP_EQUIPMENT_SPECIFICATIONS,
  };
}

// ============================================================================
// 3. In-RAM Ephemeral State Management
// ============================================================================

let sspTrackerState = {
  routeOfUse: 'injection',
  dailyUseFrequency: 3,
  suppliesDurationDays: 7,
  substanceType: 'tar_or_crack',
  activeTab: 'calculator', // 'calculator' | 'equipment_guide' | 'vein_safety' | 'sharps_disposal'
  lastEvaluation: null,
};

export function getSspTrackerState() {
  return { ...sspTrackerState };
}

export function setSspTrackerState(partial) {
  sspTrackerState = { ...sspTrackerState, ...partial };
  return getSspTrackerState();
}

export function resetSspTrackerState() {
  sspTrackerState = {
    routeOfUse: 'injection',
    dailyUseFrequency: 3,
    suppliesDurationDays: 7,
    substanceType: 'tar_or_crack',
    activeTab: 'calculator',
    lastEvaluation: null,
  };
  return getSspTrackerState();
}

// ============================================================================
// 4. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatSspEquipmentSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'CALCULADORA DE INSUMOS DE REDUCCIÓN DE DAÑOS Y PROGRAMAS SSP - HARBORPATH'
      : 'HARM REDUCTION EQUIPMENT & SYRINGE PROGRAM PLAN - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Vía de consumo' : 'Route of Use'}: ${plan.inputs.routeOfUse.toUpperCase()}`,
    `${isEs ? 'Frecuencia diaria' : 'Daily Frequency'}: ${plan.inputs.dailyUseFrequency}x / day`,
    `${isEs ? 'Días calculados' : 'Days Planned'}: ${plan.inputs.suppliesDurationDays} days`,
    `${isEs ? 'Sustancia reportada' : 'Substance Type'}: ${plan.inputs.substanceType}`,
    '',
    subDivider,
    isEs ? 'LISTA DE INSUMOS RECOMENDADOS PARA RETIRAR EN EL SSP:' : 'RECOMMENDED SUPPLIES TO REQUEST AT SYRINGE PROGRAM:',
    subDivider,
  ];

  plan.supplyList.forEach((sup) => {
    lines.push(`- [ ] ${isEs ? sup.item.es : sup.item.en}`);
    lines.push(`      ${isEs ? sup.detail.es : sup.detail.en}`);
  });

  lines.push('');
  lines.push(subDivider);
  lines.push(isEs ? 'REGLA CLÍNICA DE ORO PARA TOALLITAS DE ALCOHOL:' : 'CRITICAL CLINICAL DIRECTIVE ON ALCOHOL SWABS:');
  lines.push(
    isEs
      ? '* Use alcohol ÚNICAMENTE ANTES de inyectar. NUNCA aplique alcohol en la herida tras retirar la aguja (quema los tejidos y demora la coagulación). Use gasa seca estéril con presión firme.'
      : '* Use alcohol ONLY BEFORE needle insertion. NEVER press alcohol on the puncture wound after injecting (causes tissue damage and delays clotting). Apply firm pressure with dry sterile gauze.'
  );
  lines.push(subDivider);
  lines.push('');
  lines.push(
    isEs
      ? 'Never Use Alone: 1-800-484-3731 (Acompañamiento telefónico seguro 24/7)'
      : 'Never Use Alone: 1-800-484-3731 (Free, 24/7 peer safety line)'
  );
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 5. Accessible DOM Component: sspEquipmentTrackerComponent(containerOrOptions, maybeOptions)
// ============================================================================

export function sspEquipmentTrackerComponent(containerOrOptions = {}, maybeOptions = {}) {
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
  const plan = calculateSspEquipmentNeeds(getSspTrackerState());
  setSspTrackerState({ lastEvaluation: plan });

  const root = h('div', { class: 'ssp-equipment-tracker-component' });

  // In-RAM Privacy Banner
  const privacyAlert = h(
    'div',
    { class: 'panel alert-panel', role: 'note', 'aria-label': isEs ? 'Privacidad' : 'Privacy' },
    h('div', { class: 'panel-header' },
      icon('shield', { class: 'panel-icon' }),
      h('h3', { class: 'panel-title' }, isEs ? 'Calculadora Epímera en Memoria' : 'In-RAM Ephemeral Calculator')
    ),
    h('p', { class: 'panel-body' },
      isEs
        ? 'Todas las opciones de insumos se calculan en la memoria temporal del navegador sin persistencia. No se guarda información en el disco ni se transmite a servidores.'
        : 'All supply quantities are calculated in temporary browser memory only without persistence. No answers are stored on disk or transmitted to servers.'
    )
  );
  root.append(privacyAlert);

  // Tab Navigation Bar
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de insumos SSP' : 'SSP supply sections' });
  const tabs = [
    { id: 'calculator', label: isEs ? 'Calculadora de Insumos' : 'Supply Calculator' },
    { id: 'equipment_guide', label: isEs ? 'Guía de Materiales' : 'Materials Guide' },
    { id: 'vein_safety', label: isEs ? 'Cuidado de Venas' : 'Vein Safety' },
    { id: 'sharps_disposal', label: isEs ? 'Desecho Seguro' : 'Sharps Disposal' },
  ];

  const currentTab = sspTrackerState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-ssp-${tab.id}`,
      'data-tab': tab.id,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': `tab-panel-ssp-${tab.id}`,
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setSspTrackerState({ activeTab: tab.id });
      sspEquipmentTrackerComponent(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Active Tab Panel
  const tabPanel = h('div', {
    id: `tab-panel-ssp-${currentTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-ssp-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Calculator
  // --------------------------------------------------------------------------
  if (currentTab === 'calculator') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h4', { class: 'card-title' }, isEs ? 'Calculadora de Insumos para Programas de Jeringas (SSP)' : 'SSP Safer Equipment Calculator'));

    const formGrid = h('div', { class: 'form-grid' });

    // Route of Use
    const routeGroup = h('div', { class: 'form-group' });
    routeGroup.append(h('label', { for: 'ssp-route-select' }, isEs ? 'Vía principal de consumo:' : 'Primary route of consumption:'));
    const routeSelect = h('select', { id: 'ssp-route-select', class: 'input-select' });
    [
      { id: 'injection', label: isEs ? 'Inyección intravenosa / intramuscular' : 'Intravenous / intramuscular injection' },
      { id: 'inhalation_smoking', label: isEs ? 'Inhalación / fumar' : 'Inhalation / smoking' },
      { id: 'multiple', label: isEs ? 'Múltiples vías (inyección e inhalación)' : 'Multiple routes (injection + smoking)' },
    ].forEach((opt) => {
      const optEl = h('option', { value: opt.id }, opt.label);
      if (sspTrackerState.routeOfUse === opt.id) optEl.setAttribute('selected', 'selected');
      routeSelect.append(optEl);
    });
    routeSelect.addEventListener('change', (e) => {
      setSspTrackerState({ routeOfUse: e.target.value });
      sspEquipmentTrackerComponent(container, options);
    });
    routeGroup.append(routeSelect);
    formGrid.append(routeGroup);

    // Daily Frequency
    const freqGroup = h('div', { class: 'form-group' });
    freqGroup.append(h('label', { for: 'ssp-freq-select' }, isEs ? 'Frecuencia diaria promedio de uso:' : 'Average daily consumption events:'));
    const freqSelect = h('select', { id: 'ssp-freq-select', class: 'input-select' });
    [1, 2, 3, 5, 8, 12].forEach((num) => {
      const optEl = h('option', { value: String(num) }, `${num} ${isEs ? (num === 1 ? 'vez al día' : 'veces al día') : (num === 1 ? 'time/day' : 'times/day')}`);
      if (sspTrackerState.dailyUseFrequency === num) optEl.setAttribute('selected', 'selected');
      freqSelect.append(optEl);
    });
    freqSelect.addEventListener('change', (e) => {
      setSspTrackerState({ dailyUseFrequency: parseInt(e.target.value, 10) || 1 });
      sspEquipmentTrackerComponent(container, options);
    });
    freqGroup.append(freqSelect);
    formGrid.append(freqGroup);

    // Days Duration
    const daysGroup = h('div', { class: 'form-group' });
    daysGroup.append(h('label', { for: 'ssp-days-select' }, isEs ? 'Días entre visitas al programa SSP:' : 'Days between visits to syringe program:'));
    const daysSelect = h('select', { id: 'ssp-days-select', class: 'input-select' });
    [
      { val: 3, label: '3 days (short weekend)' },
      { val: 7, label: '7 days (1 week supply)' },
      { val: 14, label: '14 days (2 weeks supply)' },
      { val: 30, label: '30 days (1 month rural buffer)' },
    ].forEach((opt) => {
      const optEl = h('option', { value: String(opt.val) }, opt.label);
      if (sspTrackerState.suppliesDurationDays === opt.val) optEl.setAttribute('selected', 'selected');
      daysSelect.append(optEl);
    });
    daysSelect.addEventListener('change', (e) => {
      setSspTrackerState({ suppliesDurationDays: parseInt(e.target.value, 10) || 7 });
      sspEquipmentTrackerComponent(container, options);
    });
    daysGroup.append(daysSelect);
    formGrid.append(daysGroup);

    // Substance Type
    const subGroup = h('div', { class: 'form-group' });
    subGroup.append(h('label', { for: 'ssp-sub-select' }, isEs ? 'Tipo de sustancia consumida:' : 'Substance type (determines acidifier):'));
    const subSelect = h('select', { id: 'ssp-sub-select', class: 'input-select' });
    [
      { id: 'tar_or_crack', label: isEs ? 'Heroína negra o crack (Requiere vitamina C)' : 'Black tar heroin or crack (Requires Vitamin C)' },
      { id: 'powder_opioids', label: isEs ? 'Opioides en polvo / fentanilo (No requiere ácido)' : 'Powder opioids / fentanyl (No acid required)' },
      { id: 'methamphetamine', label: isEs ? 'Metanfetamina / estimulantes' : 'Methamphetamine / stimulants' },
    ].forEach((opt) => {
      const optEl = h('option', { value: opt.id }, opt.label);
      if (sspTrackerState.substanceType === opt.id) optEl.setAttribute('selected', 'selected');
      subSelect.append(optEl);
    });
    subSelect.addEventListener('change', (e) => {
      setSspTrackerState({ substanceType: e.target.value });
      sspEquipmentTrackerComponent(container, options);
    });
    subGroup.append(subSelect);
    formGrid.append(subGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Supply Checklist Card
    const listCard = h('div', { class: 'card checklist-card' });
    listCard.append(h('h4', { class: 'card-title' }, isEs ? 'Lista de Insumos Sugerida para Retirar:' : 'Recommended Request Checklist:'));

    const stack = h('div', { class: 'checklist-stack' });
    plan.supplyList.forEach((sup) => {
      const itemEl = h('div', { class: 'checklist-item' });
      itemEl.append(h('h5', { class: 'item-title' }, icon('check', { class: 'check-icon' }), isEs ? sup.item.es : sup.item.en));
      itemEl.append(p(isEs ? sup.detail.es : sup.detail.en));
      stack.append(itemEl);
    });
    listCard.append(stack);
    tabPanel.append(listCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: Materials Guide
  // --------------------------------------------------------------------------
  if (currentTab === 'equipment_guide') {
    const guideCard = h('div', { class: 'card info-card' });
    guideCard.append(h('h4', { class: 'card-title' }, isEs ? 'Ciencia de Materiales en Reducción de Daños' : 'Harm Reduction Materials & Infection Science'));

    plan.standards.forEach((st) => {
      const sBox = h('div', { class: 'standard-box' });
      sBox.append(h('h5', { class: 'std-title' }, isEs ? st.title.es : st.title.en));
      sBox.append(p(isEs ? st.rationale.es : st.rationale.en));
      guideCard.append(sBox);
    });
    tabPanel.append(guideCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Vein Safety
  // --------------------------------------------------------------------------
  if (currentTab === 'vein_safety') {
    const veinCard = h('div', { class: 'card info-card' });
    veinCard.append(h('h4', { class: 'card-title' }, isEs ? 'Protocolos de Preservación de Venas' : 'Vein Care & Preservation Protocols'));

    const list = h('ul', { class: 'bullet-list' });
    list.append(h('li', {},
      strong(isEs ? 'Bisel hacia arriba: ' : 'Bevel-up orientation: '),
      isEs
        ? 'Inserte la aguja con la abertura en bisel hacia arriba en un ángulo de 15 a 45 grados en dirección al corazón.'
        : 'Insert the needle with the angled opening facing upwards at a 15–45 degree angle in the direction of blood flow toward the heart.'
    ));
    list.append(h('li', {},
      strong(isEs ? 'Suelte el torniquete ANTES de presionar el émbolo: ' : 'Release tourniquet BEFORE injecting: '),
      isEs
        ? 'Si inyecta con el torniquete apretado, la contrapresión revienta la vena y causa extravasación ("tiro perdido") que forma abscesos.'
        : 'Injecting against a tightened tourniquet creates high backpressure, blowing out vein walls and causing painful subcutaneous abscesses.'
    ));
    list.append(h('li', {},
      strong(isEs ? 'Toallitas de alcohol: ' : 'Alcohol prep pads: '),
      isEs
        ? 'SOLO antes de la punción. Nunca limpie la herida sangrante con alcohol; use gasa seca estéril con presión firme.'
        : 'ONLY before puncture. Never press alcohol onto bleeding wounds; use sterile dry gauze with firm pressure.'
    ));
    veinCard.append(list);
    tabPanel.append(veinCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: Sharps Disposal
  // --------------------------------------------------------------------------
  if (currentTab === 'sharps_disposal') {
    const dispCard = h('div', { class: 'card info-card' });
    dispCard.append(h('h4', { class: 'card-title' }, isEs ? 'Desecho Seguro de Objetos Punzocortantes' : 'Safe Community Sharps Disposal'));

    dispCard.append(p(
      isEs
        ? 'Nunca tire jeringas sueltas a la basura regular ni al inodoro. Utilice recipientes aprobados por la FDA o botellas de plástico pesado (como detergente para ropa) con tapa bien enroscada y sellada con cinta adhesiva.'
        : 'Never dispose of loose needles in household trash or recycling. Use FDA-cleared sharps containers or heavy-duty plastic containers (such as laundry detergent bottles) with a tightly sealed screw-on cap.'
    ));

    const steps = h('ul', { class: 'bullet-list' });
    steps.append(h('li', {}, isEs ? 'Deposite las agujas inmediatamente tras su uso sin volver a taparlas (evita pinchazos accidentales).' : 'Drop syringes immediately after use without recapping to prevent accidental needle-stick injuries.'));
    steps.append(h('li', {}, isEs ? 'Llene el recipiente hasta 3/4 de su capacidad; nunca lo sobrellene.' : 'Fill containers only to 3/4 capacity; never overfill or force syringes in.'));
    steps.append(h('li', {}, isEs ? 'Lleve los recipientes llenos a su programa SSP local o puntos de recolección comunitaria.' : 'Return sealed containers to your local syringe services program (SSP) or community drop box.'));
    dispCard.append(steps);

    tabPanel.append(dispCard);
  }

  root.append(tabPanel);

  // Actions Row (Copy / Reset)
  const actions = h('div', { class: 'actions-row' });
  const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' }, isEs ? 'Copiar Lista de Insumos' : 'Copy Supplies List');
  copyBtn.addEventListener('click', async () => {
    const text = formatSspEquipmentSummaryText(plan, lang);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
        announce(isEs ? 'Lista copiada' : 'List copied to clipboard');
        setTimeout(() => {
          copyBtn.textContent = isEs ? 'Copiar Lista de Insumos' : 'Copy Supplies List';
        }, 2500);
      } catch {
        // Fallback or ignore
      }
    }
  });
  actions.append(copyBtn);

  const resetBtn = h('button', { type: 'button', class: 'btn btn-ghost' }, isEs ? 'Restablecer' : 'Reset');
  resetBtn.addEventListener('click', () => {
    resetSspTrackerState();
    sspEquipmentTrackerComponent(container, options);
  });
  actions.append(resetBtn);

  root.append(actions);

  if (container) {
    container.append(root);
  }
  return root;
}

