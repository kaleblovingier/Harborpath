// public/js/components/medicalRespiteFinder.js
// HarborPath Medical Respite & Recuperative Care Specialist Component
// Pure ES module, 0 dependencies. 100% ephemeral in-RAM clinical guidance.
// References:
// - National Health Care for the Homeless Council (NHCHC) Medical Respite Standards
// - CMS Section 1115 Waivers: Health-Related Social Needs (HRSN) Recuperative Care
// - Federal EMTALA & State Hospital Safe Discharge Protections

import { h, append, icon } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetRespiteFinderState);

/**
 * NHCHC Medical Respite & Recuperative Care Standards.
 */
export const MEDICAL_RESPITE_STANDARDS = {
  CORE_DEFINITION: {
    titleEn: 'What is Medical Respite (Recuperative) Care?',
    titleEs: '¿Qué es la Atención de Respiro Médico (Recuperativa)?',
    summaryEn: 'Medical respite care provides post-acute recuperative care for individuals experiencing homelessness who are too ill or injured to recover from a physical illness or injury on the streets or in a shelter, but do not require acute hospital-level care.',
    summaryEs: 'El respiro médico brinda atención recuperativa post-aguda a personas sin hogar que están demasiado enfermas o lesionadas para recuperarse en la calle o en un refugio común, pero no requieren atención hospitalaria de nivel agudo.',
    coreServicesEn: [
      'Safe bed, 3 meals daily, and 24-hour facility access during recovery.',
      'Locked, secure medication storage (dedicated lockboxes for buprenorphine, methadone, and refrigerated storage for insulin).',
      'Daily wound care, dressing changes, and infection monitoring.',
      'Transportation to follow-up clinical visits and outpatient specialty care.',
      'Comprehensive case management for SSI/SSDI (SOAR) and permanent supportive housing.'
    ],
    coreServicesEs: [
      'Cama segura, 3 comidas al día y acceso al centro las 24 horas durante la recuperación.',
      'Almacenamiento seguro y bajo llave para medicamentos (cajas de seguridad para buprenorfina, metadona y refrigeración para insulina).',
      'Cuidado diario de heridas, cambio de apósitos y control de infecciones.',
      'Transporte a citas clínicas de seguimiento y atención con especialistas.',
      'Gestión integral de casos para SSI/SSDI (SOAR) y vivienda de apoyo permanente.'
    ]
  },
  SAFE_DISCHARGE_RIGHTS: {
    titleEn: 'Hospital Safe Discharge Protections (Anti-Dumping)',
    titleEs: 'Protecciones de Alta Hospitalaria Segura (Anti-Abandono)',
    citation: 'EMTALA (42 U.S.C. § 1395dd) & State Safe Discharge Statutes',
    summaryEn: 'Hospitals are legally prohibited from discharging medically vulnerable patients to the streets when post-acute care is clinically required. Discharge coordinators must explore medical respite, skilled nursing, or recuperative care placements.',
    summaryEs: 'Los hospitales tienen legalmente prohibido dar de alta a pacientes médicamente vulnerables a la calle cuando se requiere atención posterior clínicamente. Los coordinadores de alta deben explorar opciones de respiro médico o centros de recuperación.',
    rightsEn: [
      'Patients have the right to a written discharge plan detailing post-acute care instructions.',
      'Hospitals cannot discharge individuals with unhealed surgical incisions, active IV lines, or immobility directly to outdoor encampments.',
      'Patients on prescribed MOUD cannot be forced to detox or be denied recuperative admission based on their medications.'
    ],
    rightsEs: [
      'Los pacientes tienen derecho a un plan de alta por escrito con instrucciones de atención posterior.',
      'Los hospitales no pueden dar de alta a personas con heridas quirúrgicas abiertas, vías intravenosas activas o inmovilidad directamente a campamentos al aire libre.',
      'A los pacientes con MOUD recetado no se les puede obligar a desintoxicarse ni negar el ingreso a centros de respiro debido a sus medicamentos.'
    ]
  }
};

/**
 * Ephemeral browser-RAM state for medical respite care.
 */
let respiteFinderState = {
  homelessStatus: 'unhoused_street',
  medicalAcuity: 'post_hospital',
  adlIndependence: 'independent',
  moudPrescribed: true,
  postAcuteNeed: 'wound_care'
};

export function getRespiteFinderState() {
  return { ...respiteFinderState };
}

export function setRespiteFinderState(patch) {
  respiteFinderState = { ...respiteFinderState, ...patch };
}

export function resetRespiteFinderState() {
  respiteFinderState = {
    homelessStatus: 'unhoused_street',
    medicalAcuity: 'post_hospital',
    adlIndependence: 'independent',
    moudPrescribed: true,
    postAcuteNeed: 'wound_care'
  };
}

/**
 * Pure function evaluating medical respite suitability and referral readiness.
 */
export function evaluateMedicalRespiteReferral({
  homelessStatus = 'unhoused_street',
  medicalAcuity = 'post_hospital',
  adlIndependence = 'independent',
  moudPrescribed = true,
  postAcuteNeed = 'wound_care'
} = {}) {
  let eligible = true;
  const qualifiers = [];
  const flags = [];
  const actionRecommendations = [];

  // Homeless status check
  if (homelessStatus === 'housed') {
    eligible = false;
    flags.push({
      typeEn: 'Housing Status Ineligible',
      typeEs: 'Estado de Vivienda Inelegible',
      textEn: 'Medical respite care is specifically restricted to individuals experiencing homelessness or unstably housed.',
      textEs: 'El respiro médico está restringido específicamente a personas que experimentan falta de hogar o vivienda inestable.'
    });
  } else {
    qualifiers.push({
      itemEn: 'Qualifies under NHCHC and HUD Category 1/2 homelessness definitions.',
      itemEs: 'Califica bajo las definiciones de falta de hogar Categoría 1/2 de HUD y NHCHC.'
    });
  }

  // ADL Independence check (Respite requires basic ADL independence; total care requires SNF)
  if (adlIndependence === 'total_dependence') {
    eligible = false;
    flags.push({
      typeEn: 'Higher Level of Care Required (Skilled Nursing Facility)',
      typeEs: 'Se Requiere Mayor Nivel de Atención (Centro de Enfermería Especializada - SNF)',
      textEn: 'Medical respite programs require patients to manage basic Activities of Daily Living (eating, transferring, toileting) independently or with minimal assistance. Individuals requiring total assistance qualify for a Skilled Nursing Facility (SNF) or acute rehabilitation.',
      textEs: 'Los programas de respiro médico exigen que los pacientes manejen las actividades básicas de la vida diaria de forma independiente o con ayuda mínima. Quienes requieren asistencia total califican para un centro SNF o rehabilitación aguda.'
    });
  } else {
    qualifiers.push({
      itemEn: 'Meets ADL functional criteria for standard medical respite bed.',
      itemEs: 'Cumple con los criterios funcionales de actividades de la vida diaria para una cama de respiro médico.'
    });
  }

  // MOUD inclusion
  if (moudPrescribed) {
    qualifiers.push({
      itemEn: 'Eligible under ADA Title II & Fair Housing protections: Respite facilities cannot exclude individuals taking prescribed buprenorphine or methadone.',
      itemEs: 'Elegible bajo las protecciones del Título II de la ADA y la Ley de Vivienda Justa: Las instalaciones de respiro no pueden excluir a personas que toman buprenorfina o metadona recetada.'
    });
  }

  // Post-acute need actions
  if (postAcuteNeed === 'wound_care') {
    actionRecommendations.push({
      recEn: 'Request facility verification of daily nurse dressing changes and clean dressing kit distribution.',
      recEs: 'Solicitar verificación del centro para cambios diarios de apósitos por enfermería y entrega de kits de curación limpios.'
    });
  } else if (postAcuteNeed === 'iv_antibiotics') {
    actionRecommendations.push({
      recEn: 'Coordinate with hospital outpatient infusion or PICC line home-health provider to administer antibiotics at the respite facility.',
      recEs: 'Coordinar con infusión ambulatoria hospitalaria o atención domiciliaria para administrar antibióticos por vía PICC en el centro de respiro.'
    });
  } else if (postAcuteNeed === 'fracture_mobility') {
    actionRecommendations.push({
      recEn: 'Ensure first-floor bed or ADA-accessible elevator placement with medical transport for orthopedic follow-ups.',
      recEs: 'Asegurar cama en planta baja o con ascensor accesible según ADA con transporte médico para citas ortopédicas.'
    });
  }

  actionRecommendations.push({
    recEn: 'Instruct the hospital social worker or case manager to submit an immediate referral to the local Continuum of Care (CoC) or municipal Medical Respite program prior to discharge.',
    recEs: 'Instruir al trabajador social o gestor de casos del hospital para enviar una remisión inmediata al programa municipal de Respiro Médico o Continuo de Atención (CoC) antes del alta.'
  });

  return {
    eligible,
    qualifiers,
    flags,
    actionRecommendations
  };
}

/**
 * Mounts the Medical Respite Finder and Referral Component.
 */
export function medicalRespiteFinderComponent(container) {
  const currentLang = getLang() === 'es' ? 'es' : 'en';
  const isEs = currentLang === 'es';

  container.textContent = '';

  const wrapper = h('div', { class: 'medical-respite-component card' });

  // Component Header
  const header = h('header', { class: 'component-header' }, [
    h('div', { class: 'clinical-badge' }, [
      icon('home', { class: 'badge-icon', 'aria-hidden': 'true' }),
      h('span', { class: 'badge-text' }, isEs ? 'Respiro Médico y Cuidados Recuperativos' : 'Medical Respite & Recuperative Care')
    ]),
    h('h2', {}, isEs ? 'Evaluador de Remisión a Respiro Médico (NHCHC)' : 'Medical Respite Referral & Eligibility Screener'),
    h('p', { class: 'component-description' }, isEs
      ? 'Evaluación clínica para personas sin hogar que requieren atención post-hospitalaria (curación de heridas, fracturas, MOUD seguro) en lugar de ser dadas de alta a la calle.'
      : 'Clinical screening for unhoused patients requiring post-acute recuperative care (wound management, fracture healing, MOUD lockboxes) to avoid unsafe street discharges.'
    )
  ]);
  wrapper.appendChild(header);

  // Form
  const form = h('div', { class: 'respite-form' });

  // Homeless status
  const homelessGroup = h('div', { class: 'form-group' });
  const homelessLabel = h('label', { for: 'respite-homeless-select' }, isEs ? 'Situación de Vivienda:' : 'Housing Situation:');
  const homelessSelect = h('select', { id: 'respite-homeless-select', class: 'select-input' });
  const homelessOptions = [
    { value: 'unhoused_street', labelEn: 'Unhoused (Street, Encampment, Vehicle)', labelEs: 'Sin Hogar (Calle, Campamento, Vehículo)' },
    { value: 'unhoused_shelter', labelEn: 'Emergency Shelter (Mass Congregate)', labelEs: 'Refugio de Emergencia (Albergue Masivo)' },
    { value: 'housed', labelEn: 'Stably Housed (Not Eligible for Respite)', labelEs: 'Con Vivienda Estable (No Elegible para Respiro)' }
  ];
  homelessOptions.forEach(opt => {
    const el = h('option', { value: opt.value }, isEs ? opt.labelEs : opt.labelEn);
    if (respiteFinderState.homelessStatus === opt.value) el.selected = true;
    homelessSelect.appendChild(el);
  });
  homelessSelect.addEventListener('change', (e) => {
    respiteFinderState.homelessStatus = e.target.value;
    medicalRespiteFinderComponent(container);
  });
  homelessGroup.appendChild(homelessLabel);
  homelessGroup.appendChild(homelessSelect);
  form.appendChild(homelessGroup);

  // ADL Independence
  const adlGroup = h('div', { class: 'form-group' });
  const adlLabel = h('label', { for: 'respite-adl-select' }, isEs ? 'Independencia en Actividades Diarias (ADL):' : 'Activities of Daily Living (ADL) Independence:');
  const adlSelect = h('select', { id: 'respite-adl-select', class: 'select-input' });
  const adlOptions = [
    { value: 'independent', labelEn: 'Independent (Able to eat, toilet, move with/without cane)', labelEs: 'Independiente (Come, usa baño y se mueve con o sin bastón)' },
    { value: 'total_dependence', labelEn: 'Total Dependence (Requires Skilled Nursing / SNF)', labelEs: 'Dependencia Total (Requiere Enfermería Especializada / SNF)' }
  ];
  adlOptions.forEach(opt => {
    const el = h('option', { value: opt.value }, isEs ? opt.labelEs : opt.labelEn);
    if (respiteFinderState.adlIndependence === opt.value) el.selected = true;
    adlSelect.appendChild(el);
  });
  adlSelect.addEventListener('change', (e) => {
    respiteFinderState.adlIndependence = e.target.value;
    medicalRespiteFinderComponent(container);
  });
  adlGroup.appendChild(adlLabel);
  adlGroup.appendChild(adlSelect);
  form.appendChild(adlGroup);

  // Post-acute need
  const needGroup = h('div', { class: 'form-group' });
  const needLabel = h('label', { for: 'respite-need-select' }, isEs ? 'Necesidad Médica Principal:' : 'Primary Post-Acute Need:');
  const needSelect = h('select', { id: 'respite-need-select', class: 'select-input' });
  const needOptions = [
    { value: 'wound_care', labelEn: 'Wound Care / Abscess / Xylazine Ulcers', labelEs: 'Cuidado de Heridas / Abscesos / Úlceras por Xilazina' },
    { value: 'iv_antibiotics', labelEn: 'PICC Line / Daily IV Antibiotics', labelEs: 'Vía PICC / Antibióticos Intravenosos Diarios' },
    { value: 'fracture_mobility', labelEn: 'Fracture / Cast / Severe Mobility Limitation', labelEs: 'Fracturas / Yeso / Limitación Severa de Movilidad' }
  ];
  needOptions.forEach(opt => {
    const el = h('option', { value: opt.value }, isEs ? opt.labelEs : opt.labelEn);
    if (respiteFinderState.postAcuteNeed === opt.value) el.selected = true;
    needSelect.appendChild(el);
  });
  needSelect.addEventListener('change', (e) => {
    respiteFinderState.postAcuteNeed = e.target.value;
    medicalRespiteFinderComponent(container);
  });
  needGroup.appendChild(needLabel);
  needGroup.appendChild(needSelect);
  form.appendChild(needGroup);

  // MOUD toggle
  const moudGroup = h('div', { class: 'form-group' });
  const moudLabel = h('label', { class: 'checkbox-label' });
  const moudCheckbox = h('input', {
    type: 'checkbox',
    checked: respiteFinderState.moudPrescribed
  });
  moudCheckbox.addEventListener('change', (e) => {
    respiteFinderState.moudPrescribed = e.target.checked;
    medicalRespiteFinderComponent(container);
  });
  moudLabel.appendChild(moudCheckbox);
  moudLabel.appendChild(h('span', { class: 'checkbox-text' }, isEs
    ? '¿El paciente recibe tratamiento con MOUD (buprenorfina o metadona)?'
    : 'Patient is prescribed MOUD (buprenorphine or methadone)?'
  ));
  moudGroup.appendChild(moudLabel);
  form.appendChild(moudGroup);

  wrapper.appendChild(form);

  // Evaluation Results
  const evaluation = evaluateMedicalRespiteReferral(respiteFinderState);
  const resultsDiv = h('div', { class: `respite-results ${evaluation.eligible ? 'status-eligible' : 'status-ineligible'}` });

  resultsDiv.appendChild(h('h3', {}, evaluation.eligible
    ? (isEs ? 'Elegible para Respiro Médico Post-Agudo' : 'Eligible for Medical Respite Placement')
    : (isEs ? 'No Elegible para Respiro Estándar' : 'Ineligible for Standard Medical Respite')
  ));

  if (evaluation.flags.length > 0) {
    evaluation.flags.forEach(flag => {
      const flagEl = h('div', { class: 'alert alert-danger' }, [
        h('strong', {}, isEs ? flag.typeEs : flag.typeEn),
        h('p', {}, isEs ? flag.textEs : flag.textEn)
      ]);
      resultsDiv.appendChild(flagEl);
    });
  }

  if (evaluation.qualifiers.length > 0) {
    const qualList = h('ul', { class: 'qualifiers-list' });
    evaluation.qualifiers.forEach(q => {
      qualList.appendChild(h('li', {}, isEs ? q.itemEs : q.itemEn));
    });
    resultsDiv.appendChild(qualList);
  }

  const recHeading = h('h4', {}, isEs ? 'Pasos de Remisión Recomendados:' : 'Recommended Referral Steps:');
  resultsDiv.appendChild(recHeading);

  const recList = h('ol', { class: 'respite-rec-list' });
  evaluation.actionRecommendations.forEach(rec => {
    recList.appendChild(h('li', {}, isEs ? rec.recEs : rec.recEn));
  });
  resultsDiv.appendChild(recList);

  wrapper.appendChild(resultsDiv);
  container.appendChild(wrapper);
}

