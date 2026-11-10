// public/js/views/encampmentMedicine.js
// HarborPath - Encampment Medicine, Street Zoonoses & Vector-Borne Infectious Disease Navigator
// Clinical Consensus: National Health Care for the Homeless Council (NHCHC) Street Medicine Guidelines,
// Centers for Disease Control and Prevention (CDC) Vector-Borne Rickettsial & Zoonotic Guidance,
// Infectious Diseases Society of America (IDSA) Bartonella Endocarditis & Leptospirosis Consensus,
// World Health Organization (WHO) Rabies Post-Exposure Prophylaxis (PEP) Categorization.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL TAXONOMY: 5 CRITICAL STREET ZOONOSES & VECTOR-BORNE CONDITIONS
// ============================================================================

export const ENCAMPMENT_INFECTION_PROFILES = Object.freeze({
  trench_fever: Object.freeze({
    id: 'trench_fever',
    nameEn: 'Trench Fever & Culture-Negative Endocarditis (Bartonella quintana)',
    nameEs: 'Fiebre de las Trincheras y Endocarditis con Cultivo Negativo (Bartonella quintana)',
    vectorEn: 'Human body louse (Pediculus humanus humanus) feces rubbed into abraded skin / scratching.',
    vectorEs: 'Heces de piojos del cuerpo humano (Pediculus humanus humanus) frotadas en piel erosionada por rascado.',
    hallmarkSignsEn: Object.freeze([
      'Recurrent 5-day paroxysms of high fever ("quintan fever") with intervening asymptomatic periods',
      'Severe, excruciating pretibial shin bone pain and lumbar backache',
      'Chronic bacteremia persisting for months without clear localized focus',
      'Culture-negative infective endocarditis (aortic or mitral valve destruction with routine sterile blood cultures)',
      'Visible body lice or nits in seams of clothing and bedding (not on scalp or pubic hair)'
    ]),
    hallmarkSignsEs: Object.freeze([
      'Paroxismos recurrentes de fiebre alta cada 5 días («fiebre quintana») con períodos asintomáticos intermedios',
      'Dolor óseo pretibial espinillar y lumbar intenso y punzante',
      'Bacteriemia crónica que persiste durante meses sin un foco evidente',
      'Endocarditis infecciosa con hemocultivo negativo (daño valvular aórtico o mitral)',
      'Presencia de piojos o liendres en costuras de la ropa o mantas (no en cabello ni vello púbico)'
    ]),
    antimicrobialRegimenEn: 'Doxycycline 100 mg PO BID for 4–6 weeks PLUS Gentamicin 3 mg/kg IV once daily for the first 14 days. If gentamicin is contraindicated (renal impairment), consider Ceftriaxone 2g IV daily. Delousing: wash clothing/bedding in hot water (>130°F / 54°C) for 30 minutes or hot dryer; 1% permethrin dusting powder for outer garments.',
    antimicrobialRegimenEs: 'Doxiciclina 100 mg VO cada 12 h durante 4 a 6 semanas MÁS Gentamicina 3 mg/kg IV cada 24 h durante los primeros 14 días (o Ceftriaxona 2 g IV si hay daño renal). Desparasitación: lavado de ropa a > 54 °C durante 30 min o secadora caliente; polvo de permetrina al 1% en prendas exteriores.',
    clinicalPearlEn: 'Bartonella is the leading cause of culture-negative infective endocarditis among unsheltered individuals. Diagnosis requires Bartonella serology (IFA IgG >= 1:800) or EDTA whole-blood PCR; routine automated blood culture bottles are typically negative because the organism is fastidious and intracellular.',
    clinicalPearlEs: 'Bartonella es la principal causa de endocarditis con cultivo negativo en personas sin hogar. El diagnóstico exige serología por IFI (IgG >= 1:800) o PCR en sangre; los hemocultivos estándar suelen ser estériles por ser una bacteria intracelular exigente.',
    urgencyTier: 'URGENT_EVALUATION',
  }),

  murine_typhus: Object.freeze({
    id: 'murine_typhus',
    nameEn: 'Murine Typhus / Endemic Flea-Borne Typhus (Rickettsia typhi)',
    nameEs: 'Tifo Murino / Tifo Endémico Transmitido por Pulgas (Rickettsia typhi)',
    vectorEn: 'Cat and rat fleas (Xenopsylla cheopis) from urban rats (Rattus norvegicus) and opossums.',
    vectorEs: 'Pulgas de ratas y gatos (Xenopsylla cheopis) asociadas a roedores urbanos y zarigüeyas.',
    hallmarkSignsEn: Object.freeze([
      'Abrupt high unremitting fever (>102°F / 39°C) with shaking chills',
      'Severe, intractable frontal and retro-orbital headache with extreme myalgias',
      'Macular or maculopapular rash starting on trunk/axillae on days 4–7, spreading centrifugally (sparing palms and soles)',
      'Laboratory triad: Thrombocytopenia (<150k), elevated transaminases (AST/ALT 2-4x), and hyponatremia (<135 mEq/L)',
      'Late complications: Septic shock, non-cardiogenic pulmonary edema, meningoencephalitis, acute kidney injury'
    ]),
    hallmarkSignsEs: Object.freeze([
      'Fiebre alta persistente (> 39 °C) de inicio súbito con escalofríos intensos',
      'Cefalea frontal y retroocular profunda e intratable con mialgias graves',
      'Exantema maculopapular en tronco y axilas entre el 4.º y 7.º día, centrífugo (respeta palmas y plantas)',
      'Tríada analítica: Trombocitopenia (< 150k), transaminasas elevadas (AST/ALT 2-4x) e hiponatremia (< 135 mEq/L)',
      'Complicaciones graves: Choque séptico, edema pulmonar no cardiogénico, meningoencefalitis y fallo renal'
    ]),
    antimicrobialRegimenEn: 'MANDATORY DIRECTIVE: NEVER delay antibiotic therapy awaiting acute serology. Initiate immediate empiric Doxycycline 100 mg PO/IV BID for 7 days (or at least 48 hours after fever resolves). Rapid defervescence within 48–72 hours of doxycycline initiation is characteristic and serves as diagnostic confirmation.',
    antimicrobialRegimenEs: 'DIRECTIVA OBLIGATORIA: NUNCA retrase el inicio de antibióticos esperando serologías. Inicie tratamiento empírico inmediato con Doxiciclina 100 mg VO/IV cada 12 h durante 7 días (o hasta 48 h tras cesar la fiebre). La desaparición de la fiebre en 48-72 h confirma la sospecha clínica.',
    clinicalPearlEn: 'In encampments and urban alleys, rat and cat flea populations peak during warm months. Presumptive diagnosis is clinical; acute-phase serology is negative in the first 7–10 days. Doxycycline is the absolute treatment of choice regardless of patient age.',
    clinicalPearlEs: 'En campamentos y callejones urbanos, las pulgas proliferan en meses cálidos. El diagnóstico inicial es puramente clínico; los anticuerpos son negativos en los primeros 7-10 días. La doxiciclina es el fármaco de elección sin importar la edad.',
    urgencyTier: 'CRITICAL_ANTIBIOTIC_IMMEDIATE',
  }),

  leptospirosis: Object.freeze({
    id: 'leptospirosis',
    nameEn: 'Leptospirosis & Weil’s Disease (Leptospira interrogans)',
    nameEs: 'Leptospirosis y Síndrome de Weil (Leptospira interrogans)',
    vectorEn: 'Water, mud, or food contaminated with urine from urban rats (Rattus norvegicus) entering broken skin/mucosa.',
    vectorEs: 'Agua estancada, lodo o comida contaminada con orina de ratas que penetra por piel erosionada o mucosas.',
    hallmarkSignsEn: Object.freeze([
      'PATHOGNOMONIC SIGN: Bilateral conjunctival suffusion without purulence (deep red sclerae with clear discharge)',
      'Biphasic illness: Abrupt fever, intense calf muscle tenderness, retro-orbital headache',
      'Severe Weil’s Disease: Deep jaundice (hyperbilirubinemia), acute oliguric renal failure (elevated BUN/creatinine)',
      'Pulmonary hemorrhage syndrome: Hemoptysis, tachypnea, diffuse alveolar infiltrates on chest radiograph',
      'Exposure history: Wading through standing street water, urban flood puddles, canal encampments, heavy rodent presence'
    ]),
    hallmarkSignsEs: Object.freeze([
      'SIGNO PATOGNOMÓNICO: Sufusión conjuntival bilateral sin secreción purulenta (ojos rojos intensos y limpios)',
      'Enfermedad bifásica: Fiebre brusca, dolor exquisito a la palpación en pantorrillas y cefalea retroocular',
      'Síndrome de Weil grave: Ictericia intensa, fallo renal agudo con oliguria (urea y creatinina elevadas)',
      'Síndrome hemorrágico pulmonar: Hemoptisis, taquipnea e infiltrados alveolares difusos en radiografía',
      'Exposición: Caminar por aguas estancadas, charcos tras lluvias urbanas o campamentos junto a desagües con roedores'
    ]),
    antimicrobialRegimenEn: 'Mild / Outpatient: Doxycycline 100 mg PO BID for 7 days (or Azithromycin 500 mg PO daily). Severe / Hospitalized (Weil’s Disease): IV Ceftriaxone 1–2g daily OR IV Penicillin G 1.5 million units q6h for 7 days. Supportive: immediate hemodialysis for severe renal failure; mechanical ventilation with lung-protective low tidal volume for pulmonary hemorrhage. MONITOR FOR JARISCH-HERXHEIMER REACTION within 2–4 hours of first antibiotic dose.',
    antimicrobialRegimenEs: 'Leve / Ambulatorio: Doxiciclina 100 mg VO cada 12 h durante 7 días (o Azitromicina 500 mg VO/día). Grave / Hospitalizado (Weil): Ceftriaxona 1-2 g IV al día O Penicilina G 1.5 millones UI IV cada 6 h por 7 días. Soporte: hemodiálisis precoz y ventilación protectora en hemorragia pulmonar. VIGILE REACCIÓN DE JARISCH-HERXHEIMER en las primeras 2-4 horas tras la primera dosis.',
    clinicalPearlEn: 'Conjunctival suffusion without exudate is rare in other bacterial infections and should instantly prompt suspicion of leptospirosis. In encampments, standing rainwater contaminated by Norway rat urine serves as a persistent reservoir.',
    clinicalPearlEs: 'La sufusión conjuntival sin exudado es rara en otras infecciones bacterianas y debe despertar sospecha inmediata de leptospirosis. El agua de lluvia estancada con orina de rata noruega es el reservorio urbano principal.',
    urgencyTier: 'EMERGENCY_HOSPITALIZATION',
  }),

  crusted_scabies: Object.freeze({
    id: 'crusted_scabies',
    nameEn: 'Crusted (Norwegian) Scabies (Sarcoptes scabiei var. hominis)',
    nameEs: 'Sarna Costrosa / Noruega (Sarcoptes scabiei var. hominis)',
    vectorEn: 'Massive mite hyper-infestation (millions of mites) transmitted by casual skin contact, blankets, and clothing.',
    vectorEs: 'Hiperinfestación masiva por ácaros (millones de parásitos) transmitida por contacto casual, sábanas o ropa.',
    hallmarkSignsEn: Object.freeze([
      'Thick, grey-yellow, hyperkeratotic "cement-like" crusts and fissures over hands, feet, extensor joints, scalp, and groin',
      'Dystrophic, thickened, crumbly nails harboring dense mite colonies beneath nail beds',
      'PARADOXICAL BLUNTED PRURITUS: May have minimal or NO itching due to compromised cell-mediated immunity',
      'High vulnerability in malnourished, elderly, HIV/immunosuppressed individuals, or those with severe sensory neuropathy',
      'Extreme contagiousness: Single case can cause massive explosive outbreaks in shelters and encampments',
      'Secondary bacterial superinfection risk: Staphylococcus aureus / Streptococcus pyogenes sepsis and glomerulonephritis'
    ]),
    hallmarkSignsEs: Object.freeze([
      'Costras hiperqueratósicas gruesas («cemento descamativo») y fisuras en manos, pies, articulaciones y cuero cabelludo',
      'Uñas distróficas y engrosadas que albergan densas colonias de ácaros bajo el lecho ungueal',
      'PRURITO PARADÓJICAMENTE ESCASO: Puede no picar debido a inmunidad celular deprimida, retrasando el diagnóstico',
      'Alta vulnerabilidad en personas desnutridas, con VIH/inmunodepresión o neuropatía sensorial grave',
      'Contagiosidad extrema: Un solo caso provoca brotes epidémicos masivos en albergues y campamentos',
      'Sobreinfección bacteriana secundaria: Sepsis por S. aureus / S. pyogenes y glomerulonefritis postestreptocócica'
    ]),
    antimicrobialRegimenEn: 'MANDATORY COMBINATION DUAL-THERAPY (CDC): Oral Ivermectin 200 mcg/kg with a fatty meal on Days 1, 2, 8, 9, and 15 (severe cases add Days 22, 29) PLUS Topical Permethrin 5% applied head-to-toe daily for 7 days, then twice weekly until scrapings are negative. Keratolytic therapy: 5% salicylic acid ointment to soften crusts and allow permethrin penetration. Strict contact isolation; clip and treat under nails.',
    antimicrobialRegimenEs: 'TERAPIA COMBINADA OBLIGATORIA (CDC): Ivermectina oral 200 mcg/kg con alimentos en los días 1, 2, 8, 9 y 15 (en casos graves añadir días 22 y 29) MÁS Permetrina tópica al 5% aplicada de cabeza a pies diariamente durante 7 días, y luego dos veces por semana hasta curación. Queratolíticos: pomada de ácido salicílico al 5% para ablandar costras. Aislamiento de contacto estricto.',
    clinicalPearlEn: 'Typical scabies involves 10–15 mites total; crusted scabies involves over one million mites. Topical monotherapy universally fails because mites reside deep beneath hyperkeratotic plaques. Systemic oral ivermectin is mandatory.',
    clinicalPearlEs: 'La sarna clásica tiene 10-15 ácaros en total; la sarna costrosa alberga más de un millón. La permetrina tópica sola siempre fracasa porque no penetra las costras gruesas. La ivermectina oral es obligatoria.',
    urgencyTier: 'ISOLATION_AND_COMBINATION_TX',
  }),

  animal_bites_rabies: Object.freeze({
    id: 'animal_bites_rabies',
    nameEn: 'Animal Bites, Rabies PEP & Tetanus Prophylaxis',
    nameEs: 'Mordeduras de Animales, PEP de Rabia y Profilaxis de Tétanos',
    vectorEn: 'Saliva and neural tissue from dogs, raccoons, bats, skunks, foxes, or feral cats.',
    vectorEs: 'Saliva y tejido nervioso de perros, mapaches, murciélagos, zorros o gatos ferales.',
    hallmarkSignsEn: Object.freeze([
      'Category III Exposure: Single or multiple transdermal bites or scratches with visible bleeding',
      'Licking of broken skin, abrasions, or mucous membrane contamination with animal saliva',
      'Bat exposure: Direct contact, awakening with bat in tent/sleeping bag (bites may be invisible without visible marks)',
      'Animal characteristics: Unprovoked attack, erratic wild behavior, excessive salivation, unable to quarantine for 10 days',
      'Local wound complications: Deep tissue puncture, crushed tendons, Pasteurella multocida rapidly spreading cellulitis within 24h'
    ]),
    hallmarkSignsEs: Object.freeze([
      'Exposición Categoría III: Mordeduras o rasguños transdérmicos únicos o múltiples con sangrado evidente',
      'Contacto de saliva animal con piel abierta, erosiones o mucosas',
      'Exposición a murciélagos: Contacto directo o despertar con un murciélago en la carpa o saco (mordeduras invisibles)',
      'Comportamiento animal: Ataque no provocado, conducta errática o animal no localizable para cuarentena de 10 días',
      'Infección local rápida: Celulitis fulminante por Pasteurella multocida en menos de 24 horas tras la mordedura'
    ]),
    antimicrobialRegimenEn: 'STEP 1: Immediate vigorous wound washing with soap and clean running water for AT LEAST 15 MINUTES (clearing inactivates >90% of rabies virus). STEP 2 (Rabies Immune Globulin - RIG): 20 IU/kg infiltrated thoroughly into and around all wound margins; any remaining volume injected IM at site distant from vaccine. STEP 3 (Rabies Vaccine): 4 doses (1.0 mL IM in deltoid; NEVER gluteal) on Days 0, 3, 7, and 14 (immunocompromised patients require 5th dose on Day 28). STEP 4 (Tetanus): Td/Tdap booster if >5 years since last dose (plus TIG 250 IU if unimmunized). STEP 5 (Bite Antibiotic): Amoxicillin-clavulanate 875/125 mg PO BID for 7–10 days.',
    antimicrobialRegimenEs: 'PASO 1: Lavado enérgico inmediato con agua limpia y jabón durante AL MENOS 15 MINUTOS (inactiva > 90% del virus). PASO 2 (Inmunoglobulina Antirrábica - HRIG): 20 UI/kg infiltrada en y alrededor de los bordes de la herida; el sobrante se aplica IM en sitio distante. PASO 3 (Vacuna Antirrábica): 4 dosis (1.0 mL IM en deltoides; NUNCA en glúteo) en días 0, 3, 7 y 14. PASO 4 (Tétanos): Refuerzo Td/Tdap si pasaron > 5 años (más TIG 250 UI si no está vacunado). PASO 5 (Antibiótico): Amoxicilina-clavulánico 875/125 mg VO cada 12 h por 7-10 días.',
    clinicalPearlEn: 'Once clinical rabies symptoms appear, the case fatality rate is virtually 100%. Rabies PEP is a true medical urgency: initiate promptly. If the animal was a healthy domestic dog or cat that can be quarantined by animal control for 10 days, PEP may be held while observing the animal.',
    clinicalPearlEs: 'Una vez que inician los síntomas clínicos de rabia, la letalidad es prácticamente del 100%. La profilaxis post-exposición es una urgencia médica absoluta. Si el animal es un perro doméstico ubicable para cuarentena de 10 días, puede observarse.',
    urgencyTier: 'CRITICAL_PEP_URGENCY',
  }),
});

export const ENCAMPMENT_PROFILES = ENCAMPMENT_INFECTION_PROFILES;

// ============================================================================
// EVALUATION ENGINE (PURE FUNCTION)
// ============================================================================

/**
 * Pure clinical evaluation function for encampment infections and street zoonoses.
 * @param {Object} input
 * @param {string} [input.conditionId='trench_fever'] - Key from ENCAMPMENT_INFECTION_PROFILES
 * @param {string[]} [input.checkedSigns=[]] - List of checked hallmark sign indexes
 * @param {boolean} [input.hasSepsis=false] - Fever, tachycardia, hypotension, confusion
 * @param {boolean} [input.hasRenalFailure=false] - Oliguria, tea-colored urine, elevated creatinine
 * @param {boolean} [input.hasJaundice=false] - Yellow sclerae/skin (Weil's disease)
 * @param {boolean} [input.hasHemoptysis=false] - Coughing up blood (pulmonary hemorrhage)
 * @param {boolean} [input.batContact=false] - Direct bat encounter or found in sleeping area
 * @param {boolean} [input.animalUnlocatable=false] - Biting animal escaped, rabid, or cannot quarantine
 * @returns {Object} Comprehensive evaluation output
 */
export function evaluateEncampmentRisk(input = {}) {
  const conditionId = ENCAMPMENT_INFECTION_PROFILES[input.conditionId] ? input.conditionId : 'trench_fever';
  const profile = ENCAMPMENT_INFECTION_PROFILES[conditionId];
  const checkedSigns = Array.isArray(input.checkedSigns) ? input.checkedSigns : [];
  const hasSepsis = Boolean(input.hasSepsis);
  const hasRenalFailure = Boolean(input.hasRenalFailure);
  const hasJaundice = Boolean(input.hasJaundice);
  const hasHemoptysis = Boolean(input.hasHemoptysis);
  const batContact = Boolean(input.batContact);
  const animalUnlocatable = Boolean(input.animalUnlocatable);

  const emergencyFlagsEn = [];
  const emergencyFlagsEs = [];

  if (hasSepsis) {
    emergencyFlagsEn.push('SYSTEMIC SEPSIS ALERT: Tachycardia, hypotension, altered mental status, or organ dysfunction.');
    emergencyFlagsEs.push('ALERTA DE SEPSIS SISTÉMICA: Taquicardia, hipotensión, alteración mental o disfunción orgánica.');
  }

  if (hasJaundice || hasRenalFailure) {
    emergencyFlagsEn.push('WEIL’S DISEASE HEPATORENAL THREAT: Jaundice coupled with acute kidney injury indicates severe decompensation.');
    emergencyFlagsEs.push('AMENAZA HEPATORRENAL DE SÍNDROME DE WEIL: Ictericia combinada con fallo renal agudo.');
  }

  if (hasHemoptysis) {
    emergencyFlagsEn.push('PULMONARY ALVEOLAR HEMORRHAGE: Hemoptysis requires immediate airway protection and ICU transfer.');
    emergencyFlagsEs.push('HEMORRAGIA ALVEOLAR PULMONAR: Hemoptisis exige protección inmediata de vía aérea y traslado a UCI.');
  }

  if (conditionId === 'animal_bites_rabies' && (batContact || animalUnlocatable)) {
    emergencyFlagsEn.push('HIGH-RISK RABIES TRANSMISSION: Bat exposure or biting animal cannot be quarantined for 10 days mandates immediate RIG + Vaccine PEP.');
    emergencyFlagsEs.push('ALTO RIESGO DE TRANSMISIÓN DE RABIA: Exposición a murciélago o animal no localizable para cuarentena exige RIG + Vacuna de inmediato.');
  }

  const isEmergency911 = emergencyFlagsEn.length > 0;

  // SBAR Clinical Summary Generation
  const sbarEn = [
    `[S] SITUATION: Patient in urban encampment / street medicine setting presenting with suspected ${profile.nameEn}.`,
    `[B] BACKGROUND: Vector / Exposure risk: ${profile.vectorEn}. Checked clinical signs: ${checkedSigns.length} documented.`,
    `[A] ASSESSMENT: ${isEmergency911 ? `CRITICAL ESCALATION: ${emergencyFlagsEn.join('; ')}` : `Clinical syndrome consistent with ${profile.id}.`}`,
    `  • Primary Antimicrobial Directive: ${profile.antimicrobialRegimenEn}`,
    `  • Key Clinical Pearl: ${profile.clinicalPearlEn}`,
    `[R] RECOMMENDATION: ${isEmergency911 ? 'URGENT 911 EMS TRANSPORT TO EMERGENCY DEPARTMENT.' : 'Initiate recommended antimicrobial regimen promptly. Arrange field follow-up with Street Medicine / Infectious Disease clinic.'} Provide harm reduction supplies and safe shelter referral.`,
  ].join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Paciente en entorno de medicina callejera / campamento con sospecha de ${profile.nameEs}.`,
    `[B] ANTECEDENTES: Vector / Riesgo de exposición: ${profile.vectorEs}. Signos cardinales presentes: ${checkedSigns.length} marcados.`,
    `[A] EVALUACIÓN: ${isEmergency911 ? `ESCALACIÓN CRÍTICA: ${emergencyFlagsEs.join('; ')}` : `Cuadro clínico compatible con ${profile.id}.`}`,
    `  • Directiva Antimicrobiana Principal: ${profile.antimicrobialRegimenEs}`,
    `  • Perla Clínica Clave: ${profile.clinicalPearlEs}`,
    `[R] RECOMENDACIÓN: ${isEmergency911 ? 'TRASLADO URGENTE POR SME AL 911 A URGENCIAS HOSPITALARIAS.' : 'Iniciar pauta antimicrobiana sin demora. Coordinar seguimiento con equipo de medicina de calle o infectología.'} Proporcionar material de reducción de daños y albergue.`,
  ].join('\n');

  return {
    conditionId,
    profile,
    checkedSignsCount: checkedSigns.length,
    isEmergency911,
    emergencyFlagsEn,
    emergencyFlagsEs,
    sbarEn,
    sbarEs,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const encampmentState = {
  conditionId: 'trench_fever',
  checkedSigns: new Set(),
  hasSepsis: false,
  hasRenalFailure: false,
  hasJaundice: false,
  hasHemoptysis: false,
  batContact: false,
  animalUnlocatable: false,
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getEncampmentMedicineState() {
  return {
    ...encampmentState,
    checkedSigns: new Set(encampmentState.checkedSigns),
  };
}

export function setEncampmentMedicineState(patch) {
  Object.assign(encampmentState, patch);
  notifyState();
}

export function resetEncampmentMedicineState() {
  encampmentState.conditionId = 'trench_fever';
  encampmentState.checkedSigns.clear();
  encampmentState.hasSepsis = false;
  encampmentState.hasRenalFailure = false;
  encampmentState.hasJaundice = false;
  encampmentState.hasHemoptysis = false;
  encampmentState.batContact = false;
  encampmentState.animalUnlocatable = false;
  encampmentState.copied = false;
  notifyState();
}

export function subscribeEncampmentMedicineState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// VIEW RENDERING
// ============================================================================

export function encampmentMedicineView() {
  const container = h('div', { class: 'encampment-medicine-view', role: 'region', 'aria-label': 'Encampment Medicine & Street Zoonoses Clinical Decision Support' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const evalResult = evaluateEncampmentRisk({
      conditionId: encampmentState.conditionId,
      checkedSigns: Array.from(encampmentState.checkedSigns),
      hasSepsis: encampmentState.hasSepsis,
      hasRenalFailure: encampmentState.hasRenalFailure,
      hasJaundice: encampmentState.hasJaundice,
      hasHemoptysis: encampmentState.hasHemoptysis,
      batContact: encampmentState.batContact,
      animalUnlocatable: encampmentState.animalUnlocatable,
    });

    // Page Header
    container.appendChild(
      pageHeader(
        isEs ? 'Medicina de Campamentos, Zoonosis y Vectores Callejeros' : 'Encampment Medicine, Street Zoonoses & Vector-Borne Diseases',
        isEs
          ? 'Guía clínica de medicina de calle para fiebre de trincheras (Bartonella), tifo murino, leptospirosis, sarna costrosa y mordeduras con PEP de rabia y tétanos.'
          : 'Street medicine protocols for Bartonella trench fever, murine typhus, leptospirosis, crusted scabies, and animal bites with rabies & tetanus PEP.',
        'clinical'
      )
    );

    // Emergency 911 Alert Banner if triggered
    if (evalResult.isEmergency911) {
      container.appendChild(
        h('aside', { class: 'encampment-alert-urgent', role: 'alert' },
          h('div', { class: 'encampment-alert-title' },
            icon('alert-triangle'),
            h('strong', {}, isEs ? 'CRITERIOS DE TRASLADO URGENTE A URGENCIAS / 911' : 'CRITICAL EMERGENCY DEPARTMENT / 911 ESCALATION')
          ),
          h('ul', { class: 'encampment-alert-list' },
            (isEs ? evalResult.emergencyFlagsEs : evalResult.emergencyFlagsEn).map((msg) =>
              h('li', {}, msg)
            )
          )
        )
      );
    }

    // Condition Selector Tabs
    const tabNav = h('div', { class: 'tabs', role: 'tablist', 'aria-label': isEs ? 'Enfermedades Infecciosas' : 'Infectious Diseases' },
      Object.values(ENCAMPMENT_INFECTION_PROFILES).map((prof) => {
        const isSelected = prof.id === encampmentState.conditionId;
        const btn = h('button', {
          type: 'button',
          role: 'tab',
          class: `tab ${isSelected ? 'active' : ''}`,
          'aria-selected': isSelected ? 'true' : 'false',
        }, isEs ? prof.nameEs : prof.nameEn);
        btn.addEventListener('click', () => {
          encampmentState.conditionId = prof.id;
          encampmentState.checkedSigns.clear();
          render();
        });
        return btn;
      })
    );
    container.appendChild(tabNav);

    // Two Column Layout
    const grid = h('div', { class: 'encampment-layout-grid' });

    // LEFT COLUMN: Clinical Features, Signs & Decompensation Toggles
    const leftCol = h('div', { class: 'encampment-col' });

    // Card 1: Vector & Mode of Transmission
    const vectorCard = h('section', { class: 'encampment-card' },
      h('h2', { class: 'encampment-card-title' },
        icon('shield'),
        h('span', {}, isEs ? 'Vector y Modo de Transmisión en Calle' : 'Vector & Environmental Street Transmission')
      ),
      h('p', { class: 'encampment-card-desc' },
        isEs ? evalResult.profile.vectorEs : evalResult.profile.vectorEn
      )
    );
    leftCol.appendChild(vectorCard);

    // Card 2: Hallmark Clinical Signs Checklist
    const signsCard = h('section', { class: 'encampment-card' },
      h('h2', { class: 'encampment-card-title' },
        icon('activity'),
        h('span', {}, isEs ? 'Signos Cardinales y Hallazgos Clínicos' : 'Hallmark Clinical Signs & Findings')
      ),
      h('div', { class: 'encampment-checkbox-list' },
        (isEs ? evalResult.profile.hallmarkSignsEs : evalResult.profile.hallmarkSignsEn).map((signText, idx) => {
          const signId = `sign-${idx}`;
          const isChecked = encampmentState.checkedSigns.has(signId);
          const chk = h('input', {
            type: 'checkbox',
            id: signId,
            class: 'encampment-checkbox',
            checked: isChecked,
          });
          chk.addEventListener('change', (e) => {
            if (e.target.checked) encampmentState.checkedSigns.add(signId);
            else encampmentState.checkedSigns.delete(signId);
            render();
          });
          return h('label', { for: signId, class: 'encampment-checkbox-label' },
            chk,
            h('span', {}, signText)
          );
        })
      )
    );
    leftCol.appendChild(signsCard);

    // Card 3: Decompensation & Critical Triage Flags
    const triageCard = h('section', { class: 'encampment-card' },
      h('h2', { class: 'encampment-card-title' },
        icon('alert-triangle'),
        h('span', {}, isEs ? 'Banderas Rojas y Signos de Descompensación' : 'Red Flags & Decompensation Triage')
      ),
      h('div', { class: 'encampment-checkbox-list' },
        [
          { prop: 'hasSepsis', en: 'Systemic sepsis (HR > 90, RR > 20, BP < 90, confusion)', es: 'Sepsis sistémica (FC > 90, FR > 20, PA < 90, confusión)' },
          { prop: 'hasRenalFailure', en: 'Acute renal failure (oliguria, tea-colored urine)', es: 'Fallo renal agudo (oliguria, orina oscura)' },
          { prop: 'hasJaundice', en: 'Jaundice / icteric sclerae (Weil’s disease / liver injury)', es: 'Ictericia en piel o escleras (Síndrome de Weil)' },
          { prop: 'hasHemoptysis', en: 'Hemoptysis (coughing up blood / pulmonary hemorrhage)', es: 'Hemoptisis (tos con sangre / hemorragia pulmonar)' },
          ...(encampmentState.conditionId === 'animal_bites_rabies' ? [
            { prop: 'batContact', en: 'Direct bat contact or awakened with bat in tent/sleeping bag', es: 'Contacto con murciélago o despertar con murciélago en la carpa' },
            { prop: 'animalUnlocatable', en: 'Biting animal escaped, wild, or unable to quarantine 10 days', es: 'Animal mordedor escapó o no se puede someter a cuarentena' }
          ] : [])
        ].map((item) => {
          const chk = h('input', {
            type: 'checkbox',
            id: `flag-${item.prop}`,
            class: 'encampment-checkbox',
            checked: encampmentState[item.prop],
          });
          chk.addEventListener('change', (e) => {
            encampmentState[item.prop] = e.target.checked;
            render();
          });
          return h('label', { for: `flag-${item.prop}`, class: 'encampment-checkbox-label' },
            chk,
            h('span', {}, isEs ? item.es : item.en)
          );
        })
      )
    );
    leftCol.appendChild(triageCard);

    grid.appendChild(leftCol);

    // RIGHT COLUMN: Treatment Directives, Pearls & SBAR Handoff
    const rightCol = h('div', { class: 'encampment-col' });

    // Treatment Card
    const txCard = h('section', { class: 'encampment-card encampment-tx-card' },
      h('h2', { class: 'encampment-card-title' },
        icon('check-circle'),
        h('span', {}, isEs ? 'Régimen Antimicrobiano y Protocolo de Calle' : 'Antimicrobial Protocol & Field Regimen')
      ),
      h('p', { class: 'encampment-tx-text' },
        isEs ? evalResult.profile.antimicrobialRegimenEs : evalResult.profile.antimicrobialRegimenEn
      ),
      h('div', { class: 'encampment-pearl-box' },
        h('strong', {}, isEs ? 'Perla Clínica de Medicina de Calle: ' : 'Street Medicine Clinical Pearl: '),
        h('span', {}, isEs ? evalResult.profile.clinicalPearlEs : evalResult.profile.clinicalPearlEn)
      )
    );
    rightCol.appendChild(txCard);

    // SBAR Handoff Card
    const sbarCard = h('section', { class: 'encampment-card' },
      h('h2', { class: 'encampment-card-title' },
        icon('file-text'),
        h('span', {}, isEs ? 'Nota Clínica SBAR de Calle (Cero PII)' : 'Field SBAR Handoff Note (Zero PII)')
      ),
      h('pre', { class: 'encampment-sbar-block', tabindex: '0' },
        isEs ? evalResult.sbarEs : evalResult.sbarEn
      ),
      h('div', { class: 'encampment-actions' },
        (() => {
          const copyBtn = h('button', {
            type: 'button',
            class: 'btn btn-primary',
          },
            icon('copy'),
            h('span', {}, encampmentState.copied ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar SBAR' : 'Copy SBAR Note'))
          );
          copyBtn.addEventListener('click', () => {
            const text = isEs ? evalResult.sbarEs : evalResult.sbarEn;
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(text).then(() => {
                encampmentState.copied = true;
                announce(isEs ? 'Nota SBAR copiada al portapapeles' : 'SBAR note copied to clipboard');
                render();
                setTimeout(() => {
                  encampmentState.copied = false;
                  render();
                }, 3000);
              });
            }
          });
          return copyBtn;
        })(),
        (() => {
          const resetBtn = h('button', {
            type: 'button',
            class: 'btn btn-ghost',
          }, isEs ? 'Restablecer' : 'Reset Form');
          resetBtn.addEventListener('click', () => {
            resetEncampmentMedicineState();
          });
          return resetBtn;
        })()
      )
    );
    rightCol.appendChild(sbarCard);

    grid.appendChild(rightCol);
    container.appendChild(grid);
  }

  listeners.add(render);
  render();
  return container;
}
