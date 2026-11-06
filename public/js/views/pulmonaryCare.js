// public/js/views/pulmonaryCare.js
// HarborPath - Pulmonary Health, Post-Overdose Lung Injury, "Crack Lung" & Inhalation Harm Reduction Navigator
// Clinical Consensus: American Thoracic Society (ATS) & European Respiratory Society (ERS) Guidelines for Acute Lung Injury,
// CHEST Consensus on Drug-Induced Pulmonary Disease and Substance-Associated Respiratory Failure,
// Society of Critical Care Medicine (SCCM) Post-Overdose Respiratory Management,
// Harm Reduction Coalition Guidelines for Safer Smoking and Inhalation Equipment.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: SUBSTANCE-INDUCED PULMONARY PATHOLOGY
// ============================================================================

export const PULMONARY_SYNDROME_PROFILES = Object.freeze({
  ncpe: Object.freeze({
    id: 'ncpe',
    nameEn: 'Non-Cardiogenic Pulmonary Edema (NCPE) & Negative Pressure Pulmonary Edema (NPPE)',
    nameEs: 'Edema Pulmonar No Cardiogénico (EPNC) y Edema por Presión Negativa (EPPN)',
    pathophysiologyEn: 'Occurs in 2–10% of severe opioid overdoses, especially following rapid naloxone reversal. Caused by two synergistic mechanisms: 1) Massive central sympathoadrenal discharge causing systemic vasoconstriction and hydrostatic fluid shift into pulmonary capillaries; 2) Vigorous inspiratory efforts against a closed glottis (laryngospasm or upper airway obstruction during agonal respirations), generating extreme negative intrathoracic pressure (-50 to -100 cmH2O) that draws transudative fluid across alveolar-capillary membranes.',
    pathophysiologyEs: 'Ocurre en el 2–10% de sobredosis graves de opioides, a menudo tras revertir con naloxona. Producido por: 1) Descarga simpática masiva que traslada líquido a los capilares pulmonares; 2) Esfuerzos inspiratorios vigorosos contra la glotis cerrada (laringoespasmo), generando una presión negativa intratorácica extrema que succiona líquido hacia los alvéolos.',
    clinicalPresentationEn: 'CLASSICAL PRESENTATION: Patient awakens post-overdose or post-naloxone with tachypnea, severe hypoxemia (SpO2 < 85%), diffuse bilateral rales, and sudden expectoration of pink frothy sputum. CRITICAL CLINICAL RULE: Pink frothy sputum is PULMONARY EDEMA, NOT residual opioid sedation! Administering more naloxone is useless, worsens the catecholamine storm, and precipitates cardiac arrhythmias. Diuretics (furosemide) are generally ineffective or dangerous because patients are intravascularly depleted. TREATMENT: Non-Invasive Positive Pressure Ventilation (CPAP/BiPAP with PEEP) or High-Flow Nasal Cannula (HFNC) and supplemental oxygen.',
    clinicalPresentationEs: 'PRESENTACIÓN: El paciente despierta tras la sobredosis o naloxona con taquipnea, hipoxemia severa (SatO2 < 85%), crepitantes bilaterales y esputo rosado espumoso. REGLA CLÍNICA CRÍTICA: ¡El esputo rosado espumoso es edema pulmonar, NO sedación por opioides! Dar más naloxona agrava la tormenta catecolaminérgica. Los diuréticos pueden causar colapso hemodinámico. MANEJO: CPAP/BiPAP con PEEP o cánula nasal de alto flujo (CNAF) y oxígeno.',
  }),

  crackLung: Object.freeze({
    id: 'crack_lung',
    nameEn: '"Crack Lung" (Acute Cocaine-Induced Pulmonary Syndrome & Diffuse Alveolar Hemorrhage)',
    nameEs: '"Pulmón de Crack" (Síndrome Pulmonar Agudo por Cocaína y Hemorragia Alveolar)',
    pathophysiologyEn: 'Acute alveolar-capillary membrane injury occurring within 1–48 hours after smoking crack cocaine or freebase cocaine. Thermal pyrolysis products (specifically anhydroecgonine methyl ester - AEME) directly damage alveolar epithelial and capillary endothelial cells. Intense local vasoconstriction produces focal alveolar micro-infarcts, leading to acute eosinophilic alveolitis, diffuse alveolar damage (DAD), and diffuse alveolar hemorrhage (DAH).',
    pathophysiologyEs: 'Lesión aguda de la membrana alvéolo-capilar en las primeras 1–48 horas tras fumar crack o base libre. Los productos de pirólisis térmica (como el AEME) dañan el epitelio alveolar. La vasoconstricción intensa produce microinfartos y alveolitis eosinofílica con hemorragia alveolar difusa.',
    clinicalPresentationEn: 'PRESENTATION: Acute chest pain, shortness of breath, high-grade fever, dry or productive cough with dark black or carbonaceous sputum, and overt hemoptysis (coughing up blood). Imaging shows diffuse bilateral ground-glass opacities, airspace consolidations, and pneumomediastinum/pneumothorax from forceful Valsalva maneuvers. TREATMENT: High-dose systemic corticosteroids (prednisone / methylprednisolone), short-acting inhaled beta-2 agonists, supplemental oxygen, and exclusion of acute bacterial pneumonia or pulmonary embolism.',
    clinicalPresentationEs: 'PRESENTACIÓN: Dolor torácico opresivo, disnea, fiebre alta, esputo negruzco con hollín y hemoptisis (tos con sangre). La TC muestra opacidades en vidrio deslustrado bilaterales o neumotórax tras maniobras de Valsalva intensas. MANEJO: Corticoides sistémicos en altas dosis, broncodilatadores inhalados y oxígeno.',
  }),

  aspiration: Object.freeze({
    id: 'aspiration',
    nameEn: 'Aspiration Pneumonitis (Mendelson Syndrome) vs. Aspiration Pneumonia',
    nameEs: 'Neumonitis Química por Aspiración (Síndrome de Mendelson) vs. Neumonía Aspirativa',
    pathophysiologyEn: 'During opioid, sedative, or alcohol-induced stupor/coma, airway protective reflexes (cough, gag) are lost, permitting inhalation of acidic gastric contents (pH < 2.5). This causes an immediate, sterile chemical burn of tracheobronchial mucosa and alveolar membranes (chemical pneumonitis), inducing intense inflammation and capillary leakage within 2–12 hours.',
    pathophysiologyEs: 'La pérdida de reflejos protectores de la vía aérea en el coma por sobredosis permite la aspiración de contenido gástrico ácido (pH < 2.5), provocando una quemadura química estéril del árbol bronquial y alvéolos (neumonitis química) en 2–12 horas.',
    clinicalPresentationEn: 'CARDINAL ATS/IDSA GUIDELINE: Chemical pneumonitis manifests with abrupt fever, wheezing, tachypnea, and hypoxemia. Routine prophylactic antibiotics are STRICTLY CONTRAINDICATED during the first 48 hours because the initial insult is sterile chemical burn! Administering antibiotics immediately promotes multi-drug resistant superinfections. ANTIBIOTICS ARE INDICATED ONLY IF: Fever, purulent sputum, and pulmonary infiltrates persist or worsen beyond 48–72 hours, signaling secondary bacterial pneumonia.',
    clinicalPresentationEs: 'GUÍA CARDINAL ATS/IDSA: La neumonitis química causa fiebre brusca, sibilancias e hipoxemia. ¡Los antibióticos profilácticos están ESTRICTAMENTE DESACONSEJADOS en las primeras 48 horas porque es una quemadura química estéril! Solo se inician antibióticos si la fiebre y el esputo purulento persisten o empeoran tras 48–72 horas.',
  }),

  talcosis: Object.freeze({
    id: 'talcosis',
    nameEn: 'Pulmonary Talcosis & Foreign Body Granulomatosis ("Talc Lung")',
    nameEs: 'Talcosis Pulmonar y Granulomatosis por Cuerpo Extraño ("Pulmón de Talco")',
    pathophysiologyEn: 'Caused by intravenous injection of medications intended for oral ingestion (crushed prescription opioids, methylphenidate, benzodiazepines) containing insoluble particulate binders (talc, microcrystalline cellulose, cornstarch, magnesium stearate). Particles bypass the liver and lodge permanently in pulmonary arterioles and alveolar capillaries.',
    pathophysiologyEs: 'Provocada por la inyección intravenosa de pastillas machacadas destinadas a vía oral que contienen excipientes insolubles (talco, celulosa, almidón). Las partículas impactan en las arteriolas y capilares pulmonares.',
    clinicalPresentationEn: 'CHRONIC PATHOLOGY: Foreign body giant cell granulomas proliferate around trapped particles, leading to progressive interstitial fibrosis, panlobular emphysema (predominantly in lower lobes), and severe Pulmonary Arterial Hypertension (PAH) culminating in fatal cor pulmonale (right heart failure). HARM REDUCTION DIRECTIVE: Use of 0.22-micron wheel filters completely traps insoluble talc particles and bacteria, shielding pulmonary capillaries from foreign body embolization.',
    clinicalPresentationEs: 'PATOLOGÍA CRÓNICA: Los granulomas de cuerpo extraño provocan fibrosis intersticial progresiva, enfisema panlobulillar e hipertensión arterial pulmonar grave con fallo ventricular derecho (cor pulmonale). REDUCCIÓN DE DAÑOS: El uso de filtros de rueda de 0.22 micras retiene el talco y protege los capilares pulmonares.',
  }),

  bronchospasm: Object.freeze({
    id: 'bronchospasm',
    nameEn: 'Substance-Induced Bronchospasm & Acute Asthma/COPD Exacerbation',
    nameEs: 'Broncoespasmo Inducido por Sustancias y Crisis Asmática Aguda',
    pathophysiologyEn: 'Inhalation of high-temperature combustion products, adulterated vapors, or freebase cocaine directly stimulates airway irritant C-fibers, triggering massive vagal parasympathetic reflex bronchoconstriction and epithelial histamine release. Cocaine also inhibits local reuptake of norepinephrine, precipitating intense bronchial smooth muscle spasm.',
    pathophysiologyEs: 'La inhalación de humos a alta temperatura o vapores de crack irrita las fibras C bronquiales, desencadenando broncoconstricción refleja masiva e histamina, provocando crisis asmáticas de riesgo vital.',
    clinicalPresentationEn: 'EMERGENCY PROTOCOL: Inhaled short-acting beta-2 agonists (albuterol 2.5–5 mg) + ipratropium bromide 0.5 mg nebulized every 20 minutes, systemic corticosteroids, and supplemental oxygen. CAUTION: In acute cocaine-induced chest tightness or bronchospasm, strictly avoid non-selective beta-blockers; administer benzodiazepines (lorazepam or diazepam) to blunt sympathetic tone and relieve chest tightness.',
    clinicalPresentationEs: 'PROTOCOLO DE EMERGENCIA: Salbutamol nebulizado 2.5–5 mg + bromuro de ipratropio 0.5 mg cada 20 min, corticoides sistémicos y oxígeno. En dolor torácico o broncoespasmo por cocaína, evitar betabloqueantes puros y usar benzodiacepinas para calmar el tono adrenérgico.',
  }),
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & SAFER INHALATION EQUIPMENT
// ============================================================================

export const PULMONARY_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Pink Frothy Sputum Post-Naloxone: Pulmonary Edema, NOT More Opioids',
    titleEs: 'Esputo Rosado Espumoso Tras Naloxona: Edema Pulmonar, NO Falta de Opioide',
    detailEn: 'If a person awakens from an overdose and begins coughing up pink frothy fluid or gasping for air, they are suffering from Non-Cardiogenic Pulmonary Edema (fluid in lungs). Never give more naloxone—this is not an opioid deficiency! They need emergency 911 transport, supplemental oxygen, and CPAP pressure ventilation in the hospital.',
    detailEs: 'Si alguien despierta de una sobredosis tosiendo líquido rosado espumoso o ahogándose, sufre edema pulmonar no cardiogénico. Jamás administre más naloxona: no es falta de naloxona. Requiere llamar al 112/911 de inmediato para recibir oxígeno y ventilación CPAP.',
  },
  {
    ruleNum: 2,
    titleEn: 'Aspiration Pneumonitis is Chemical: Avoid Immediate Prophylactic Antibiotics',
    titleEs: 'La Neumonitis Química por Aspiración es Estéril: Evitar Antibióticos Iniciales',
    detailEn: 'Inhaling stomach acid during an overdose creates an immediate chemical burn in the lungs. International pulmonary guidelines state that prophylactic antibiotics should NOT be given in the first 48 hours because the initial damage is sterile. Antibiotics are only prescribed if bacterial fever and purulent sputum develop after 2–3 days.',
    detailEs: 'Aspirar jugo gástrico en una sobredosis produce una quemadura química ácida en el pulmón. Las guías internacionales desaconsejan antibióticos profilácticos en las primeras 48 horas porque la lesión es estéril; solo se usan si aparece infección bacteriana tardía.',
  },
  {
    ruleNum: 3,
    titleEn: '"Crack Lung" Hemoptysis Warning: Recognize Alveolar Bleeding & Seek Care',
    titleEs: 'Alarma de Hemoptisis en "Pulmón de Crack": Acudir al Médico Ante Tos con Sangre',
    detailEn: 'Coughing up blood, high fever, or severe chest tightness within 48 hours of smoking crack indicates acute alveolar hemorrhage and intense lung inflammation ("Crack Lung"). Do not ignore this! It can rapidly progress to respiratory failure and responds effectively to emergency oxygen and systemic corticosteroid medications.',
    detailEs: 'Toser sangre, tener fiebre alta o dolor torácico opresivo tras fumar crack indica hemorragia alveolar e inflamación aguda ("pulmón de crack"). Acuda a urgencias de inmediato para recibir oxígeno y tratamiento con corticoides.',
  },
  {
    ruleNum: 4,
    titleEn: 'Use Pyrex Glass Stems & Silicone Mouthpieces: Prevent Inhalation Trauma',
    titleEs: 'Usar Pipas de Vidrio Pyrex y Boquillas de Silicona: Evitar Lesiones Inhalatorias',
    detailEn: 'Thin glass cracks and burns lips, while broken antennas or copper scouring pads (Chore Boy) release toxic zinc, nickel, and copper fumes directly into the bronchial tree. Always use heavy-duty borosilicate (Pyrex) glass stems, brass screens, and heat-resistant silicone mouthpieces to prevent cuts and aerosolized metal poisoning.',
    detailEs: 'El vidrio fino se rompe y los estropajos de cobre desprenden humos metálicos tóxicos de zinc y níquel hacia los bronquios. Use pipas de vidrio Pyrex reforzado, rejillas de latón y boquillas de silicona para evitar cortes y quemaduras.',
  },
  {
    ruleNum: 5,
    titleEn: '0.22-Micron Wheel Filters Prevent Irreversible "Talc Lung" Emphysema',
    titleEs: 'Filtros de Rueda de 0.22 Micras: Prevenir la Talcosis y el Enfisema Pulmonar',
    detailEn: 'Crushed prescription pills contain talc and microcrystalline cellulose. When injected, these microscopic particles plug pulmonary capillaries forever, causing irreversible emphysema and right heart failure ("Talc Lung"). Cotton balls do not filter talc! Only 0.22-micron wheel filters eliminate particulate matter.',
    detailEs: 'Las pastillas machacadas contienen talco que tapona para siempre los capilares del pulmón, provocando enfisema irreversible y fallo cardíaco. El algodón no filtra el talco; solo los filtros de membrana de 0.22 micras eliminan estas micropartículas.',
  },
  {
    ruleNum: 6,
    titleEn: 'Keep Inhaled Bronchodilators Ready & Avoid Beta-Blockers in Stimulant Spasm',
    titleEs: 'Broncodilatadores Inhalados y Evitar Betabloqueantes Puros en Crisis por Estimulantes',
    detailEn: 'Stimulant smoke triggers acute airway constriction. Individuals with asthma or COPD should always carry their rescue albuterol inhaler. In emergency settings, pure beta-blockers should be avoided in acute cocaine toxicity due to unopposed alpha-1 stimulation; benzodiazepines are preferred to relax airways and sympathetic tone.',
    detailEs: 'El humo estimulante desencadena broncoespasmo agudo. Quienes tienen asma deben llevar siempre su inhalador de rescate. En urgencias, ante dolor torácico por cocaína se evitan betabloqueantes puros y se prefieren benzodiacepinas para calmar el broncoespasmo.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO PERSISTENT STORAGE)
// ============================================================================

const initialPulmonaryState = () => ({
  activeTab: 'triage', // 'triage' | 'syndromes' | 'overdose' | 'saferInhalation' | 'harmReduction'
  viewMode: 'community', // 'community' | 'clinical'
  hasPinkFrothySputumHypoxemia: false,
  hasCrackLungHemoptysisFever: false,
  hasWitnessedGastricAspiration: false,
  hasSevereWheezingBronchospasm: false,
  isInjectingCrushedPillsDyspnea: false,
  needsSaferSmokingGuidance: false,
});

let pulmonaryState = initialPulmonaryState();
const listeners = new Set();

export function getPulmonaryState() {
  return { ...pulmonaryState };
}

export function setPulmonaryState(patch) {
  pulmonaryState = { ...pulmonaryState, ...patch };
  listeners.forEach((l) => l(pulmonaryState));
}

export function resetPulmonaryState() {
  pulmonaryState = initialPulmonaryState();
  listeners.forEach((l) => l(pulmonaryState));
}

export function subscribePulmonaryState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// CLINICAL RISK EVALUATOR (EVALUATEPULMONARYRISK)
// ============================================================================

export function evaluatePulmonaryRisk(state) {
  const {
    hasPinkFrothySputumHypoxemia,
    hasCrackLungHemoptysisFever,
    hasWitnessedGastricAspiration,
    hasSevereWheezingBronchospasm,
    isInjectingCrushedPillsDyspnea,
    needsSaferSmokingGuidance,
  } = state;

  // 1. Non-Cardiogenic Pulmonary Edema / Negative Pressure Pulmonary Edema (NPPE)
  if (hasPinkFrothySputumHypoxemia) {
    return {
      tier: 'emergency_ncpe_pulmonary_edema',
      titleEn: 'CRITICAL RESPIRATORY EMERGENCY: Non-Cardiogenic Pulmonary Edema (Pink Frothy Sputum)',
      titleEs: 'EMERGENCIA RESPIRATORIA CRÍTICA: Edema Pulmonar No Cardiogénico (Esputo Rosado Espumoso)',
      isEmergency: true,
      actionEn: 'IMMEDIATE 911 ACTIVATION / CRITICAL CARE AIRWAY PROTOCOL. Pink frothy sputum and acute hypoxemia post-overdose or post-naloxone reversal represent Non-Cardiogenic Pulmonary Edema (NCPE) from massive negative intrathoracic pressure and sympathetic surge. CARDINAL RULES: 1) DO NOT administer additional naloxone—this is fluid overload in the alveoli, not opioid sedation; 2) DO NOT administer IV furosemide (patients are often intravascularly depleted and loop diuretics can precipitate shock); 3) Apply immediate CPAP/PEEP ventilation (5–10 cmH2O) or High-Flow Nasal Cannula (HFNC) and 100% supplemental oxygen.',
      actionEs: 'ACTIVACIÓN INMEDIATA DEL 112/911 Y PROTOCOLO DE UCI. El esputo rosado espumoso tras revertir una sobredosis indica Edema Pulmonar No Cardiogénico. REGLAS CARDINALES: 1) NO poner más naloxona (no es falta de opioide); 2) NO usar furosemida IV (riesgo de colapso hemodinámico); 3) Iniciar CPAP/PEEP o cánula nasal de alto flujo con oxígeno al 100%.',
      interventionEn: 'Emergent positive pressure airway support (CPAP / BiPAP with PEEP), high-flow oxygen, arterial blood gas analysis, chest radiograph, ICU admission.',
      interventionEs: 'Soporte con presión positiva (CPAP/BiPAP), oxigenoterapia de alto flujo, gasometría arterial, radiografía de tórax e ingreso en UCI.',
    };
  }

  // 2. "Crack Lung" / Diffuse Alveolar Hemorrhage (DAH)
  if (hasCrackLungHemoptysisFever) {
    return {
      tier: 'emergency_crack_lung_dah',
      titleEn: 'EMERGENT PULMONARY ALERT: Suspected "Crack Lung" / Diffuse Alveolar Hemorrhage',
      titleEs: 'ALERTA PULMONAR URGENTE: Sospecha de "Pulmón de Crack" / Hemorragia Alveolar Difusa',
      isEmergency: true,
      actionEn: 'EMERGENCY DEPARTMENT ADMISSION & PULMONOLOGY CONSULT. Coughing up blood, fever, and acute hypoxemia within 48 hours of smoking crack indicates acute alveolar-capillary necrosis, diffuse alveolar hemorrhage (DAH), and severe eosinophilic alveolitis. PROTOCOL: 1) Supplemental oxygen to keep SpO2 > 92%; 2) Stat High-Resolution Chest CT (HRCT) to evaluate ground-glass opacities and rule out pneumothorax; 3) Systemic corticosteroids (IV methylprednisolone 60–125 mg or oral prednisone 40–60 mg); 4) Bronchodilators for associated bronchospasm; 5) Rule out bacterial pneumonia and pulmonary embolism.',
      actionEs: 'INGRESO HOSPITALARIO EN URGENCIAS Y CONSULTA A NEUMOLOGÍA. Tos con sangre, fiebre y disnea tras fumar crack indican hemorragia alveolar difusa y alveolitis eosinofílica. PROTOCOLO: Oxígeno para SatO2 > 92%, TC torácica urgente, corticoides sistémicos (metilprednisolona IV o prednisona oral) y broncodilatadores inhalados.',
      interventionEn: 'Chest HRCT, systemic corticosteroids, inhaled beta-agonists, continuous pulse oximetry, bronchoscopy with bronchoalveolar lavage (BAL) if bleeding persists.',
      interventionEs: 'TC de tórax, corticoides sistémicos, broncodilatadores inhalados, pulsioximetría continua y valorar broncoscopia con lavado broncoalveolar.',
    };
  }

  // 3. Acute Severe Substance-Induced Bronchospasm
  if (hasSevereWheezingBronchospasm) {
    return {
      tier: 'emergency_acute_severe_bronchospasm',
      titleEn: 'ACUTE BRONCHIAL EMERGENCY: Severe Substance-Induced Bronchospasm / Asthma Exacerbation',
      titleEs: 'EMERGENCIA BRONQUIAL AGUDA: Broncoespasmo Severo Inducido por Sustancias / Crisis Asmática',
      isEmergency: true,
      actionEn: 'IMMEDIATE BRONCHODILATOR & OXYGEN THERAPY. Intense wheezing, chest tightness, or "silent chest" following inhalation of hot vapors or stimulants requires rapid escalation. PROTOCOL: 1) High-dose inhaled Albuterol (2.5–5 mg) + Ipratropium bromide (0.5 mg) via nebulizer every 20 minutes for 3 doses; 2) Systemic corticosteroids (oral prednisone 40–60 mg or IV methylprednisolone); 3) Supplemental oxygen; 4) If cocaine-induced, administer IV Lorazepam 1–2 mg to reduce sympathomimetic central tone; STRICTLY AVOID pure beta-blockers.',
      actionEs: 'BRONCODILATADORES INHALADOS URGENTES Y OXÍGENO. Sibilancias intensas o "tórax silente" tras inhalar vapores exigen salbutamol nebulizado (2.5–5 mg) + ipratropio (0.5 mg) cada 20 min, corticoides sistémicos y oxígeno. Si es por cocaína, añadir benzodiacepinas y evitar betabloqueantes puros.',
      interventionEn: 'Serial nebulized dual bronchodilators, systemic steroids, oxygen titration, judicious IV benzodiazepines for sympathomimetic agitation.',
      interventionEs: 'Nebulizaciones repetidas de broncodilatadores duales, corticoides sistémicos, oxígeno y benzodiacepinas para calmar el tono simpático.',
    };
  }

  // 4. Witnessed Gastric Aspiration (Mendelson Chemical Pneumonitis)
  if (hasWitnessedGastricAspiration) {
    return {
      tier: 'urgent_aspiration_chemical_pneumonitis',
      titleEn: 'CLINICAL ALERT: Witnessed Gastric Aspiration / Chemical Pneumonitis Protocol',
      titleEs: 'ALERTA CLÍNICA: Aspiración Gástrica Presenciada / Protocolo de Neumonitis Química',
      isEmergency: false,
      actionEn: 'PULMONARY MONITORING & 48-HOUR ANTIBIOTIC WITHHOLDING RULE. Inhaling acidic gastric juices during an overdose coma causes chemical pneumonitis (Mendelson syndrome). ATS/IDSA CONSENSUS: Routine prophylactic antibiotics are STRICTLY CONTRAINDICATED in the first 48 hours because this is an acute sterile acid burn, not a bacterial infection. Prophylactic antibiotics only select for resistant organisms. PROTOCOL: Position patient in recovery position, maintain airway clearance, administer supplemental oxygen, monitor vital signs and SpO2 closely. INITIATE ANTIBIOTICS ONLY IF: Fever, purulent sputum, and new infiltrates persist beyond 48–72 hours.',
      actionEs: 'MONITORIZACIÓN RESPIRATORIA Y REGLA DE NO ANTIBIÓTICOS EN 48 HORAS. La aspiración de jugo gástrico ácido es una quemadura estéril. Según guías ATS/IDSA, NO se deben dar antibióticos profilácticos en las primeras 48 horas. Solo se iniciarán antibióticos si la fiebre y el esputo purulento persisten tras 48–72 horas.',
      interventionEn: 'Pulse oximetry monitoring, airway clearance suctioning, chest radiograph at baseline and 48 hours, antibiotic withholding unless secondary infection develops.',
      interventionEs: 'Pulsioximetría continua, aspiración de secreciones, radiografía de tórax basal y a las 48 horas, evitando antibióticos innecesarios.',
    };
  }

  // 5. Progressive Dyspnea from Injecting Crushed Pills (Suspected Talcosis)
  if (isInjectingCrushedPillsDyspnea) {
    return {
      tier: 'urgent_talc_granulomatosis',
      titleEn: 'CHRONIC PULMONARY ALERT: Suspected Foreign Body Pulmonary Talcosis ("Talc Lung")',
      titleEs: 'ALERTA PULMONAR CRÓNICA: Sospecha de Talcosis Pulmonar / Granulomatosis por Inyección',
      isEmergency: false,
      actionEn: 'DIAGNOSTIC PULMONOLOGY EVALUATION & HARM REDUCTION. Progressive shortness of breath in an individual who injects crushed prescription pills indicates foreign body talc embolization in pulmonary arterioles. PROTOCOL: 1) High-Resolution Chest CT (HRCT) to evaluate lower-lobe panlobular emphysema and diffuse micronodules; 2) Transthoracic Echocardiogram (TTE) to screen for Pulmonary Arterial Hypertension (PAH) and right ventricular strain; 3) Pulmonary function tests (PFTs); 4) HARM REDUCTION: Provide 0.22-micron wheel filters to immediately eliminate particulate talc exposure.',
      actionEs: 'EVALUACIÓN NEUMOLÓGICA Y REDUCCIÓN DE DAÑOS. La disnea progresiva en personas que se inyectan pastillas machacadas sugiere microémbolos de talco en arteriolas pulmonares. Realizar TC de tórax de alta resolución, ecocardiograma para descartar hipertensión pulmonar y proporcionar filtros de rueda de 0.22 micras.',
      interventionEn: 'High-resolution chest CT, echocardiogram for pulmonary pressures, distribution of 0.22-micron wheel filters, referral to pulmonologist and addiction medicine.',
      interventionEs: 'TC de alta resolución, ecocardiograma, distribución de filtros de membrana de 0.22 micras y derivación a neumología y MOUD.',
    };
  }

  // 6. Safer Inhalation Equipment Guidance
  if (needsSaferSmokingGuidance) {
    return {
      tier: 'harm_reduction_safer_inhalation',
      titleEn: 'HARM REDUCTION DIRECTIVE: Safer Inhalation & Smoking Equipment Protocol',
      titleEs: 'DIRECTIVA DE REDUCCIÓN DE DAÑOS: Protocolo de Inhalación y Materiales Seguros',
      isEmergency: false,
      actionEn: 'DISTRIBUTE SAFER SMOKING SUPPLIES TO PREVENT AIRWAY & TISSUE INJURY. 1) Pyrex Borosilicate Glass Stems: Resists high temperatures and avoids thermal shattering; 2) Brass Screens: Replaces copper scouring pads (Chore Boy), eliminating the inhalation of aerosolized zinc, nickel, and copper metal fumes; 3) Heat-Resistant Silicone Mouthpieces: Prevents lip burns, sores, and cuts that transmit Hepatitis C and HIV; 4) Allow pipe to cool between hits to reduce thermal bronchial burns.',
      actionEs: 'ENTREGA DE MATERIALES DE FUMAR SEGURO. 1) Pipas de vidrio borosilicato Pyrex para evitar roturas térmicas; 2) Rejillas de latón que sustituyen estropajos de cobre, evitando inhalar humos de metales pesados; 3) Boquillas de silicona para evitar llagas y transmisión de VHC y VIH; 4) Dejar enfriar la pipa entre caladas.',
      interventionEn: 'Safer smoking kit distribution (Pyrex pipes, brass screens, silicone tips, lip balm), harm reduction education, respiratory health screening.',
      interventionEs: 'Entrega de kits de fumar seguro (pipas Pyrex, rejillas, boquillas, bálsamo labial) y educación en salud respiratoria.',
    };
  }

  // 7. Standard Pulmonary Prevention
  return {
    tier: 'standard_pulmonary_prevention',
    titleEn: 'Standard Pulmonary Health & Respiratory Harm Reduction Guidelines',
    titleEs: 'Pautas Estándar de Salud Pulmonar y Reducción de Daños Respiratorios',
    isEmergency: false,
    actionEn: 'No acute respiratory red flags detected. Pulmonary harm reduction standards: 1) Never inject crushed prescription pills without 0.22-micron wheel filters; 2) Always use silicone mouthpieces and Pyrex glass when smoking to protect lips and airways; 3) If someone has shallow breathing during sedation, reposition them onto their side (recovery position) to prevent gastric acid aspiration; 4) Carry rescue inhalers if diagnosed with asthma or COPD.',
    actionEs: 'No se detectan alertas respiratorias agudas. Pautas de prevención: jamás inyectar pastillas sin filtro de 0.22 micras; usar boquillas de silicona y pipas Pyrex; colocar a la persona sedada de lado (posición de recuperación) para evitar aspiración gástrica; y llevar siempre inhalador de rescate si tiene asma.',
    interventionEn: 'Distribution of 0.22-micron wheel filters, safer smoking supplies, recovery position demonstration, baseline respiratory symptom check.',
    interventionEs: 'Distribución de filtros de 0.22 micras, material de fumar seguro, educación en posición de seguridad y revisión respiratoria básica.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildPulmonarySbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: EVALUACIÓN PULMONAR Y RESPIRATORIA (CERO PII)',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      'Evaluación clínica por sospecha de lesión pulmonar inducida por sustancias, edema post-sobredosis o hemorragia alveolar.',
      `Diagnóstico de riesgo evaluado: ${evaluation.titleEs}.`,
      `Urgencia médica: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA CRÍTICA / VITAL' : 'GESTIÓN CLÍNICA Y PROTECCIÓN RESPIRATORIA'}.`,
      '',
      'B (ANTECEDENTES / FACTORES DE RIESGO RESPIRATORIOS Y DE CONSUMO):',
      `- Esputo rosado espumoso o hipoxemia severa post-reversión con naloxona: ${state.hasPinkFrothySputumHypoxemia ? 'SÍ (EDEMA PULMONAR NO CARDIOGÉNICO - EPPN)' : 'No'}.`,
      `- Tos con sangre (hemoptisis), fiebre y dolor torácico tras fumar crack: ${state.hasCrackLungHemoptysisFever ? 'SÍ (PULMÓN DE CRACK / HEMORRAGIA ALVEOLAR DIFUSA)' : 'No'}.`,
      `- Broncoaspiración de vómito presenciada durante coma por sobredosis: ${state.hasWitnessedGastricAspiration ? 'SÍ (NEUMONITIS QUÍMICA - REGLA DE NO ANTIBIÓTICOS EN 48H)' : 'No'}.`,
      `- Broncoespasmo severo, sibilancias intensas o tórax silente tras inhalación: ${state.hasSevereWheezingBronchospasm ? 'SÍ (BRONCOESPASMO SEVERO INDUCIDO POR SUSTANCIAS)' : 'No'}.`,
      `- Disnea progresiva e inyección de pastillas machacadas vía intravenosa: ${state.isInjectingCrushedPillsDyspnea ? 'SÍ (SOSPECHA DE TALCOSIS PULMONAR E HIPERTENSIÓN PULMONAR)' : 'No'}.`,
      `- Demanda de materiales seguros de inhalación y reducción de daños: ${state.needsSaferSmokingGuidance ? 'SÍ (PREVENCIÓN DE QUEMADURAS Y VAPORES METÁLICOS TÓXICOS)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y GESTIÓN NEUMOLÓGICA):',
      '1. Edema post-naloxona: Soporte con CPAP/PEEP y oxígeno. ¡NO dar más naloxona ni furosemida!',
      '2. Neumonitis por aspiración: Es una quemadura química estéril. Desaconsejado uso de antibióticos profilácticos en 48h.',
      '3. Pulmón de crack: Administrar corticoides sistémicos, broncodilatadores y TC de tórax urgente.',
      '4. Talcosis por pastillas: Recomendar uso estricto de filtros de rueda de 0.22 micras para salvar los capilares.',
      '5. Material de inhalación: Usar pipas Pyrex reforzadas, rejillas de latón y boquillas de silicona para evitar cortes y VHC.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'PULMONARY HEALTH & SUBSTANCE LUNG INJURY CLINICAL SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    'Clinical consultation for suspected substance-induced lung injury, post-overdose pulmonary edema, or inhalation toxicity.',
    `Assessed Presentation: ${evaluation.titleEn}.`,
    `Safety Urgency: ${evaluation.isEmergency ? 'LIFE-THREATENING MEDICAL EMERGENCY' : 'CLINICAL MANAGEMENT & RESPIRATORY PRESERVATION'}.`,
    '',
    'B (BACKGROUND / RESPIRATORY & SUBSTANCE RISK FACTORS):',
    `- Pink frothy sputum / acute hypoxemia post-overdose or post-naloxone: ${state.hasPinkFrothySputumHypoxemia ? 'YES (NON-CARDIOGENIC PULMONARY EDEMA / NPPE)' : 'No'}.`,
    `- Hemoptysis, high fever, or severe chest tightness post-crack smoking: ${state.hasCrackLungHemoptysisFever ? 'YES (CRACK LUNG / DIFFUSE ALVEOLAR HEMORRHAGE)' : 'No'}.`,
    `- Witnessed gastric aspiration during overdose-induced coma: ${state.hasWitnessedGastricAspiration ? 'YES (MENDELSON SYNDROME / 48H ANTIBIOTIC WITHHOLDING RULE)' : 'No'}.`,
    `- Severe wheezing / silent chest / bronchospasm post-inhalation: ${state.hasSevereWheezingBronchospasm ? 'YES (ACUTE SUBSTANCE-INDUCED BRONCHIAL SPASM)' : 'No'}.`,
    `- Progressive exertional dyspnea with intravenous crushed pill injection: ${state.isInjectingCrushedPillsDyspnea ? 'YES (SUSPECTED FOREIGN BODY PULMONARY TALCOSIS & PAH)' : 'No'}.`,
    `- Need for safer inhalation equipment and harm reduction supplies: ${state.needsSaferSmokingGuidance ? 'YES (PREVENTION OF AIRWAY TRAUMA & TOXIC METAL FUMES)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Clinical Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & PULMONOLOGY MANAGEMENT):',
    '1. Post-naloxone pulmonary edema: Apply CPAP/PEEP + O2 stat. DO NOT give more naloxone or loop diuretics!',
    '2. Chemical aspiration pneumonitis: Sterile acid burn. Withhold prophylactic antibiotics for the first 48 hours.',
    '3. Crack lung / DAH: Administer high-dose systemic corticosteroids, bronchodilators, and obtain chest HRCT.',
    '4. Pulmonary talcosis prevention: Mandate 0.22-micron wheel filters to prevent irreversible vascular embolization.',
    '5. Safer inhalation supplies: Provide Pyrex glass stems, brass screens, and silicone tips to eliminate cuts and toxic fumes.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function pulmonaryCareView() {
  const container = h('div', { class: 'pulmonary-care-view' });

  function render() {
    clear(container);
    const state = getPulmonaryState();
    const evaluation = evaluatePulmonaryRisk(state);

    // Header Banner
    const header = h('header', { class: 'pc-header' }, [
      h('div', { class: 'pc-header-badge' }, [
        icon('activity'),
        h('span', {}, t('pc.header.badge', 'Pulmonary Health & Inhalation Harm Reduction')),
      ]),
      h('h1', { class: 'pc-header-title' }, t('pc.header.title', 'Pulmonary Health, Post-Overdose Lung Injury & Inhalation Safety Navigator')),
      h('p', { class: 'pc-header-desc' }, t('pc.header.desc', 'Evidence-based clinical decision support and harm reduction standards from the ATS, ERS, and CHEST: Post-naloxone Non-Cardiogenic Pulmonary Edema (NCPE), "Crack Lung" alveolar hemorrhage, chemical aspiration pneumonitis vs. pneumonia, pulmonary talcosis ("Talc Lung"), and safer smoking equipment protocols.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'pc-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        class: `pc-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setPulmonaryState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('pc.mode.community', 'Community & Patient Mode (Shortness of Breath, Cough & Safer Pipes)')),
      ]),
      h('button', {
        class: `pc-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setPulmonaryState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('pc.mode.clinical', 'Clinician & Pulmonology Mode (NCPE CPAP, Crack Lung Steroids & SBAR)')),
      ]),
    ]);

    // Tabs Nav
    const tabsList = h('div', { class: 'pc-tabs-nav', role: 'tablist', 'aria-label': 'Pulmonary Care Tabs' }, [
      h('button', {
        class: `pc-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setPulmonaryState({ activeTab: 'triage' }),
      }, t('pc.tabs.triage', 'Pulmonary Emergency Triage')),
      h('button', {
        class: `pc-tab-btn ${state.activeTab === 'syndromes' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'syndromes' ? 'true' : 'false',
        onclick: () => setPulmonaryState({ activeTab: 'syndromes' }),
      }, t('pc.tabs.syndromes', 'Clinical Syndromes & Crack Lung')),
      h('button', {
        class: `pc-tab-btn ${state.activeTab === 'overdose' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'overdose' ? 'true' : 'false',
        onclick: () => setPulmonaryState({ activeTab: 'overdose' }),
      }, t('pc.tabs.overdose', 'Post-Overdose NCPE & Aspiration')),
      h('button', {
        class: `pc-tab-btn ${state.activeTab === 'saferInhalation' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'saferInhalation' ? 'true' : 'false',
        onclick: () => setPulmonaryState({ activeTab: 'saferInhalation' }),
      }, t('pc.tabs.saferInhalation', 'Safer Smoking & Inhalation Kits')),
      h('button', {
        class: `pc-tab-btn ${state.activeTab === 'harmReduction' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'harmReduction' ? 'true' : 'false',
        onclick: () => setPulmonaryState({ activeTab: 'harmReduction' }),
      }, t('pc.tabs.harmReduction', 'Lung Protection Directives')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'syndromes':
        tabContent = renderSyndromesTab();
        break;
      case 'overdose':
        tabContent = renderOverdoseTab();
        break;
      case 'saferInhalation':
        tabContent = renderSaferInhalationTab();
        break;
      case 'harmReduction':
        tabContent = renderHarmReductionTab();
        break;
      case 'triage':
      default:
        tabContent = renderTriageTab(state, evaluation);
        break;
    }

    container.appendChild(header);
    container.appendChild(modeSwitcher);
    container.appendChild(tabsList);
    container.appendChild(tabContent);
  }

  // --- SUB-RENDERERS ---

  function renderTriageTab(state, evaluation) {
    const section = h('section', { class: 'pc-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'pc-inputs-grid' }, [
      // 1. NCPE / Pink Frothy Sputum
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasPinkFrothySputumHypoxemia,
            onchange: (e) => setPulmonaryState({ hasPinkFrothySputumHypoxemia: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.ncpeStrong', 'Coughing Up Pink Frothy Sputum or Severe Hypoxemia Post-Overdose/Naloxone? ')),
            t('pc.check.ncpeDetail', '(Critical Emergency: Non-Cardiogenic Pulmonary Edema / NPPE requiring CPAP, NOT more naloxone)'),
          ]),
        ]),
      ]),

      // 2. Crack Lung / Hemoptysis
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasCrackLungHemoptysisFever,
            onchange: (e) => setPulmonaryState({ hasCrackLungHemoptysisFever: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.crackStrong', 'Coughing Up Blood (Hemoptysis), Fever, or Severe Chest Pain Post-Crack Smoking? ')),
            t('pc.check.crackDetail', '(Emergent Pulmonary Alert: Suspected "Crack Lung" / Diffuse Alveolar Hemorrhage)'),
          ]),
        ]),
      ]),

      // 3. Witnessed Gastric Aspiration
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasWitnessedGastricAspiration,
            onchange: (e) => setPulmonaryState({ hasWitnessedGastricAspiration: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.aspStrong', 'Witnessed Vomiting / Inhaled Stomach Contents During Overdose Coma? ')),
            t('pc.check.aspDetail', '(Clinical Alert: Chemical Aspiration Pneumonitis / 48-Hour Antibiotic Withholding Rule)'),
          ]),
        ]),
      ]),

      // 4. Severe Bronchospasm / Wheezing
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSevereWheezingBronchospasm,
            onchange: (e) => setPulmonaryState({ hasSevereWheezingBronchospasm: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.bronchStrong', 'Severe Wheezing, Stridor, or Inability to Breathe After Inhaling Vapors/Smoke? ')),
            t('pc.check.bronchDetail', '(Acute Bronchial Emergency: Substance-induced severe bronchospasm / asthma exacerbation)'),
          ]),
        ]),
      ]),

      // 5. Injecting Crushed Pills / Talcosis
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isInjectingCrushedPillsDyspnea,
            onchange: (e) => setPulmonaryState({ isInjectingCrushedPillsDyspnea: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.talcStrong', 'Progressive Shortness of Breath with History of Injecting Crushed Pills? ')),
            t('pc.check.talcDetail', '(Chronic Pulmonary Alert: Foreign Body Pulmonary Talcosis & Pulmonary Hypertension)'),
          ]),
        ]),
      ]),

      // 6. Safer Inhalation Guidance
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.needsSaferSmokingGuidance,
            onchange: (e) => setPulmonaryState({ needsSaferSmokingGuidance: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('pc.check.safeStrong', 'Smoking Crack, Meth, or Fentanyl and Needing Safer Inhalation Equipment? ')),
            t('pc.check.safeDetail', '(Harm Reduction Directive: Pyrex glass stems, brass screens, and silicone mouthpieces)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `pc-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'pc-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'pc-result-details' }, [
        h('div', { class: 'pc-rec-item' }, [
          h('strong', {}, t('pc.res.action', 'Clinical & Diagnostic Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'pc-rec-item' }, [
          h('strong', {}, t('pc.res.intervention', 'Recommended Medical Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // SBAR Export Card
    const sbarCard = h('div', { class: 'pc-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('pc.sbar.title', 'Zero-PII Pulmonary & Inhalation Clinical SBAR Note Generator')),
        h('div', { class: 'sbar-actions' }, [
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildPulmonarySbarText(state, evaluation, 'en');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('pc.sbar.copyEn', 'Copy Clinical SBAR (English)'))]),
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildPulmonarySbarText(state, evaluation, 'es');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('pc.sbar.copyEs', 'Copiar SBAR (Español)'))]),
        ]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildPulmonarySbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderSyndromesTab() {
    const section = h('section', { class: 'pc-syndromes-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'pc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('pc.syn.heading', 'Substance-Induced Pulmonary Syndromes & Crack Lung')),
      h('p', { class: 'tab-subtitle' }, t('pc.syn.subtitle', 'Pathophysiology of thermal and chemical alveolar damage, diffuse alveolar hemorrhage, and pulmonary talcosis.')),
    ]);

    const cardsGrid = h('div', { class: 'pc-cards-grid' }, [
      h('div', { class: 'pc-card alert-callout emergency full-width' }, [
        h('h3', {}, PULMONARY_SYNDROME_PROFILES.crackLung.nameEn),
        h('p', {}, [h('strong', {}, 'Pathophysiology: '), PULMONARY_SYNDROME_PROFILES.crackLung.pathophysiologyEn]),
        h('p', {}, [h('strong', {}, 'Clinical Presentation & Management: '), PULMONARY_SYNDROME_PROFILES.crackLung.clinicalPresentationEn]),
      ]),

      h('div', { class: 'pc-card' }, [
        h('h3', {}, PULMONARY_SYNDROME_PROFILES.talcosis.nameEn),
        h('p', {}, [h('strong', {}, 'Mechanism: '), PULMONARY_SYNDROME_PROFILES.talcosis.pathophysiologyEn]),
        h('p', {}, [h('strong', {}, 'Clinical Progression: '), PULMONARY_SYNDROME_PROFILES.talcosis.clinicalPresentationEn]),
      ]),

      h('div', { class: 'pc-card' }, [
        h('h3', {}, PULMONARY_SYNDROME_PROFILES.bronchospasm.nameEn),
        h('p', {}, [h('strong', {}, 'Mechanism: '), PULMONARY_SYNDROME_PROFILES.bronchospasm.pathophysiologyEn]),
        h('p', {}, [h('strong', {}, 'Emergency Treatment: '), PULMONARY_SYNDROME_PROFILES.bronchospasm.clinicalPresentationEn]),
      ]),
    ]);

    section.appendChild(introCard);
    section.appendChild(cardsGrid);
    return section;
  }

  function renderOverdoseTab() {
    const section = h('section', { class: 'pc-overdose-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'pc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('pc.od.heading', 'Post-Overdose Lung Injury: NCPE & Chemical Aspiration')),
      h('p', { class: 'tab-subtitle' }, t('pc.od.subtitle', 'Critical management rules for pink frothy sputum post-naloxone and the 48-hour antibiotic delay in chemical aspiration.')),
    ]);

    const ncpeCard = h('div', { class: 'pc-card alert-callout emergency' }, [
      h('h3', {}, PULMONARY_SYNDROME_PROFILES.ncpe.nameEn),
      h('p', {}, [h('strong', {}, 'Pathophysiology: '), PULMONARY_SYNDROME_PROFILES.ncpe.pathophysiologyEn]),
      h('p', {}, [h('strong', {}, 'Management & Strict Prohibitions: '), PULMONARY_SYNDROME_PROFILES.ncpe.clinicalPresentationEn]),
    ]);

    const aspCard = h('div', { class: 'pc-card alert-callout info' }, [
      h('h3', {}, PULMONARY_SYNDROME_PROFILES.aspiration.nameEn),
      h('p', {}, [h('strong', {}, 'Sterile Acid Burn Mechanism: '), PULMONARY_SYNDROME_PROFILES.aspiration.pathophysiologyEn]),
      h('p', {}, [h('strong', {}, 'ATS/IDSA 48-Hour Antibiotic Rule: '), PULMONARY_SYNDROME_PROFILES.aspiration.clinicalPresentationEn]),
    ]);

    section.appendChild(introCard);
    section.appendChild(ncpeCard);
    section.appendChild(aspCard);
    return section;
  }

  function renderSaferInhalationTab() {
    const section = h('section', { class: 'pc-inhalation-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'pc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('pc.inhal.heading', 'Safer Smoking & Inhalation Equipment Protocols')),
      h('p', { class: 'tab-subtitle' }, t('pc.inhal.subtitle', 'Harm reduction specifications for Pyrex glass, brass screens, and heat-resistant silicone mouthpieces.')),
    ]);

    const suppliesGrid = h('div', { class: 'pc-cards-grid' }, [
      h('div', { class: 'pc-card' }, [
        h('h3', {}, '1. Heavy-Duty Pyrex Borosilicate Glass Stems'),
        h('p', {}, 'Thin glass cracks under butane lighters, causing deep lip lacerations. Borosilicate Pyrex withstands extreme heat, prevents shatter injuries, and avoids burning chemicals from plastic makeshift pipes.'),
      ]),
      h('div', { class: 'pc-card' }, [
        h('h3', {}, '2. Brass Screens (Avoid Copper Scouring Pads / Chore Boy)'),
        h('p', {}, 'Commercial copper scouring pads are treated with toxic anti-rust lubricants, nickel, and zinc coatings. Heating them releases aerosolized metallic fumes that trigger metal fume fever and chemical bronchiolitis. Always use pure brass screens.'),
      ]),
      h('div', { class: 'pc-card' }, [
        h('h3', {}, '3. Heat-Resistant Silicone Mouthpieces'),
        h('p', {}, 'Hot glass stems cause severe lip burns, blisters, and open sores. Sharing pipes with blood or sores transmits Hepatitis C and HIV. Silicone mouthpieces act as personal heat shields and prevent viral transmission.'),
      ]),
      h('div', { class: 'pc-card' }, [
        h('h3', {}, '4. Cool-Down Intervals & Lip Balm'),
        h('p', {}, 'Taking rapid consecutive hits heats glass above 200°C, scorching tracheal epithelial cells. Allowing pipes to cool for 2–3 minutes between inhalations preserves airway mucosa and prevents acute bronchospasm.'),
      ]),
    ]);

    section.appendChild(introCard);
    section.appendChild(suppliesGrid);
    return section;
  }

  function renderHarmReductionTab() {
    const section = h('section', { class: 'pc-harm-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'pc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('pc.hr.heading', 'Pulmonary Harm Reduction & Lung Survival Directives')),
      h('p', { class: 'tab-subtitle' }, t('pc.hr.subtitle', 'Actionable field directives to prevent pulmonary edema fatalities, alveolar hemorrhage, and irreversible talcosis.')),
    ]);

    const rulesGrid = h('div', { class: 'pc-rules-grid' }, PULMONARY_HARM_REDUCTION_RULES.map((rule) => h('div', { class: 'pc-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${rule.ruleNum}`),
      h('h3', {}, rule.titleEn),
      h('p', {}, rule.detailEn),
    ])));

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    return section;
  }

  // Initial render & state subscription
  const unsubscribe = subscribePulmonaryState(() => render());
  render();

  return container;
}
