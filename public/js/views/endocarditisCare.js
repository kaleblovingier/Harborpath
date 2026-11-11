// public/js/views/endocarditisCare.js
// HarborPath - Infective Endocarditis (IE), Valve Destruction, Septic Emboli & POET Protocol Navigator
// Clinical Consensus: American Heart Association (AHA) & Infectious Diseases Society of America (IDSA) Endocarditis Guidelines,
// 2023 Duke-ISCVID Criteria for Infective Endocarditis,
// European Society of Cardiology (ESC) Guidelines for the Management of Endocarditis,
// Partial Oral Endocarditis Treatment (POET Trial - NEJM),
// ACC/AHA Cardiothoracic Surgery Guidelines for Valvular Heart Disease in Persons Who Inject Drugs (PWID).
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon, copyText } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: RIGHT-SIDED VS LEFT-SIDED ENDOCARDITIS
// ============================================================================

export const ENDOCARDITIS_VALVE_PROFILES = Object.freeze({
  rightSidedTricuspid: Object.freeze({
    id: 'right_sided_tricuspid',
    nameEn: 'Right-Sided Endocarditis (Tricuspid Valve - ~60–75% of IDU Cases)',
    nameEs: 'Endocarditis Derecha (Válvula Tricúspide - ~60–75% de Casos en Inyección)',
    pathophysiologyEn: 'Venous injection introduces non-sterile particulate matter (talc, adulterants) and skin bacteria directly into the right atrium. Particulate matter causes micro-abrasions and turbulent shearing across the tricuspid leaflets, forming a sterile platelet-fibrin nidus that is colonized by bacteremic pathogens (predominantly Staphylococcus aureus in > 70% of cases, including MRSA).',
    pathophysiologyEs: 'La inyección venosa introduce partículas no estériles (talco, adulterantes) y bacterias de la piel en la aurícula derecha. Las partículas provocan microlesiones en la válvula tricúspide, formando un trombo de fibrina que es colonizado por bacterias (principalmente Staphylococcus aureus en > 70% de casos).',
    clinicalPresentationEn: 'CLASSICALLY PRESENTS WITH PULMONARY SYMPTOMS: Right-sided vegetations fragment and embolize into the low-pressure pulmonary circulation, producing Septic Pulmonary Emboli. Patients present with pleuritic chest pain, cough, hemoptysis (coughing up blood), dyspnea, and multiple peripheral cavitary nodules or wedge-shaped infiltrates on chest imaging mimicking pneumonia. Murmur (holosystolic murmur at left lower sternal border, accentuated during inspiration — Carvallo sign) may be faint or absent early on.',
    clinicalPresentationEs: 'SE MANIFIESTA TÍPICAMENTE CON SÍNTOMAS PULMONARES: Los fragmentos de la vegetación viajan al pulmón produciendo émbolos sépticos pulmonares. Provoca dolor torácico pleurítico, tos con sangre (hemoptisis), falta de aire y nódulos cavitados en radiografía/TC que simulan neumonía. El soplo tricuspídeo puede ser tenue inicialmente.',
    prognosisEn: 'In-hospital mortality is lower than left-sided disease (~5–10% for isolated tricuspid), but recurrent pulmonary infarction can cause pulmonary hypertension, right ventricular failure, and lung abscesses.',
    prognosisEs: 'La mortalidad intrahospitalaria es menor que en válvulas izquierdas (~5-10%), pero los infartos pulmonares repetidos causan hipertensión pulmonar, fallo cardíaco derecho y abscesos pulmonares.',
  }),

  leftSidedAorticMitral: Object.freeze({
    id: 'left_sided_aortic_mitral',
    nameEn: 'Left-Sided Endocarditis (Aortic & Mitral Valves - ~25–35% of Cases)',
    nameEs: 'Endocarditis Izquierda (Válvulas Aórtica y Mitral - ~25–35% de Casos)',
    pathophysiologyEn: 'Infection of the high-pressure aortic or mitral valves carries grave morbidity. Vegetations cause leaflet perforation, chordae tendineae rupture, and acute severe valvular regurgitation. Infection can burrow through the valve annulus into surrounding myocardium, forming a Perivalvular Ring Abscess or aorto-cavitary fistula.',
    pathophysiologyEs: 'La infección de las válvulas de alta presión (aórtica o mitral) conlleva una grave morbimortalidad. Causa perforación valvular, rotura de cuerdas tendinosas e insuficiencia valvular aguda severa. Puede erosionar el anillo valvular formando un absceso perivalvular o fístula.',
    clinicalPresentationEn: 'PRESENTATION: Acute pulmonary edema, orthopnea, cardiogenic shock, and prominent peripheral vasculitic stigmata from systemic arterial embolization: 1) Janeway lesions (painless erythematous macules on palms/soles from septic micro-emboli); 2) Osler nodes (tender, painful, violaceous nodules on finger/toe pads from immune complex vasculitis); 3) Roth spots (retinal hemorrhages with pale centers); 4) Subungual splinter hemorrhages. Perivalvular aortic root extension directly penetrates the Atrioventricular (AV) Node, producing PR interval prolongation (first-degree heart block) progressing to complete heart block.',
    clinicalPresentationEs: 'MANIFESTACIÓN: Edema agudo de pulmón, shock cardiogénico y estigmas embólicos periféricos: 1) Manchas de Janeway (máculas rojas indoloras en palmas y plantas por microémbolos); 2) Nódulos de Osler (nódulos dolorosos violáceos en pulpejos de dedos); 3) Manchas de Roth en retina; 4) Hemorragias en astilla subungueales. La extensión al anillo aórtico daña el nodo AV, causando bloqueo cardíaco (alargamiento del PR).',
    prognosisEn: 'High mortality (~20–30% in-hospital). Frequent indication for urgent or emergent cardiothoracic valve replacement surgery to prevent catastrophic hemodynamic collapse or embolic stroke.',
    prognosisEs: 'Mortalidad elevada (~20-30%). Frecuente indicación de cirugía cardíaca urgente de sustitución valvular para evitar colapso hemodinámico o infarto cerebral embólico.',
  }),
});

// ============================================================================
// DIAGNOSTIC STANDARDS: 2023 DUKE-ISCVID CRITERIA & BLOOD CULTURES
// ============================================================================

export const DUKE_CRITERIA_STANDARDS = Object.freeze({
  bloodCultureRuleEn: 'THE CARDINAL BLOOD CULTURE RULE: Obtain at least 3 sets of blood cultures from separate peripheral venipuncture sites (with at least 30–60 minutes between the first and last draw) BEFORE starting antimicrobial therapy, whenever the patient is clinically stable. Administering empiric antibiotics prior to blood cultures causes culture-negative endocarditis in > 50% of cases, crippling pathogen identification and sensitivity-guided antibiotic curation.',
  bloodCultureRuleEs: 'LA REGLA DE ORO DE LOS HEMOCULTIVOS: Obtenga al menos 3 juegos de hemocultivos de sitios periféricos distintos (con 30-60 minutos de separación entre el primero y el último) ANTES de iniciar antibióticos, si el paciente está clínicamente estable. Dar antibióticos antes esteriliza los cultivos en > 50% de casos, impidiendo identificar la bacteria y dirigir el tratamiento.',

  echoGuidanceEn: 'ECHOCARDIOGRAPHY: 1) Transthoracic Echocardiogram (TTE) is the initial screening test (sensitivity 60–75%); 2) Transesophageal Echocardiogram (TEE) is the gold standard (sensitivity > 90–95%) and is MANDATORY if TTE is negative/equivocal with high clinical suspicion, in left-sided valve disease, or to detect perivalvular ring abscesses, leaflet perforation, or prosthetic valve dehiscence.',
  echoGuidanceEs: 'ECOCARDIOGRAMA: 1) El ecocardiograma transtorácico (ETT) es el cribado inicial (sensibilidad 60-75%); 2) El ecocardiograma transesofágico (ETE) es el estándar de oro (sensibilidad > 90-95%) y es OBLIGATORIO si el ETT es dudoso, en sospecha de afectación izquierda o para descartar abscesos del anillo perivalvular.',

  majorCriteriaEn: [
    'Persistent Typical Bacteremia: Two separate blood cultures positive for typical IE organisms (S. aureus, Viridans streptococci, Enterococci) or persistent bacteremia drawn > 12 hours apart.',
    'Imaging Evidence of Endocardial Involvement: Vegetations on valve or supporting structures, perivalvular abscess, pseudoaneurysm, intracardiac fistula, new valvular dehiscence, or new pathological valvular regurgitation.',
  ],

  minorCriteriaEn: [
    'Predisposition: Injection drug use (IDU) or pre-existing predisposing heart condition (prosthetic valve, prior endocarditis, congenital valve anomaly).',
    'Fever: Documented core body temperature >= 38.0°C (100.4°F).',
    'Vascular Phenomena: Major arterial emboli, septic pulmonary infarcts, mycotic aneurysm, intracranial hemorrhage, conjunctival hemorrhages, Janeway lesions.',
    'Immunologic Phenomena: Glomerulonephritis, Osler nodes, Roth spots, positive rheumatoid factor (RF).',
    'Microbiologic Evidence: Positive blood culture not meeting major criteria, or serological evidence of active infection with typical organism.',
  ],

  classificationAlgorithmEn: 'DIAGNOSTIC CLASSIFICATION: 1) Definite IE: 2 Major criteria, OR 1 Major + 3 Minor, OR 5 Minor criteria; 2) Possible IE: 1 Major + 1 Minor, OR 3 Minor criteria; 3) Rejected: Firm alternative diagnosis established, symptoms resolve within <= 4 days of antibiotics, or no pathological evidence at surgery.',
  classificationAlgorithmEs: 'CLASIFICACIÓN DIAGNÓSTICA: 1) EI Definitiva: 2 Criterios mayores, O 1 Mayor + 3 Menores, O 5 Criterios menores; 2) EI Posible: 1 Mayor + 1 Menor, O 3 Criterios menores; 3) Descartada: Diagnóstico alternativo claro o resolución rápida.',
});

// ============================================================================
// CARDIOTHORACIC SURGERY INDICATIONS & ETHICAL HARM REDUCTION CONSENSUS
// ============================================================================

export const SURGICAL_INDICATIONS_CONSENSUS = Object.freeze({
  indicationsEn: [
    'Heart Failure & Hemodynamic Collapse: Acute aortic or mitral regurgitation causing cardiogenic shock or refractory severe pulmonary edema (emergent surgery within 24 hours).',
    'Uncontrolled Infection & Perivalvular Extension: Aortic ring abscess, pseudoaneurysm, intracardiac fistula, new-onset AV block (prolonged PR interval), or persistent bacteremia > 5–7 days despite targeted IV bactericidal therapy.',
    'High Embolic Risk & Large Vegetations: Persistent vegetations > 10 mm on left-sided valves after systemic embolic episode, or very large vegetations > 20–30 mm on tricuspid valve with recurrent pulmonary emboli.',
    'Fungal or Highly Resistant Pathogens: Endocarditis caused by Candida, Aspergillus, or multi-drug resistant organisms.',
  ],
  indicationsEs: [
    'Insuficiencia Cardíaca y Shock: Insuficiencia aórtica o mitral aguda con shock cardiogénico o edema pulmonar refractario (cirugía emergente en < 24 h).',
    'Infección No Controlada y Extensión Perivalvular: Absceso del anillo aórtico, fístula, nuevo bloqueo AV (PR alargado) o bacteriemia persistente > 5-7 días con antibiótico adecuado.',
    'Alto Riesgo Embólico y Grandes Vegetaciones: Vegetaciones > 10 mm en cavidades izquierdas tras embolia, o > 20-30 mm en tricúspide con embolias pulmonares repetidas.',
    'Microorganismos Fúngicos o Multirresistentes: Endocarditis por Candida, Aspergillus o bacterias multirresistentes.',
  ],

  ethicalDirectiveEn: 'AHA/ACC ETHICAL DIRECTIVE ON VALVE SURGERY IN PWID: Denying life-saving cardiac valve replacement surgery solely on the basis of a patient’s current or past injection drug use is medically and ethically unjustifiable. Patients with substance use disorders who undergo valve replacement paired with comprehensive in-hospital addiction medicine consultation, initiation of MOUD (buprenorphine or methadone), and post-discharge harm reduction achieve long-term survival comparable to non-users. Withholding surgery is a death sentence in acute refractory heart failure.',
  ethicalDirectiveEs: 'DIRECTIVA ÉTICA AHA/ACC EN PERSONAS QUE SE INYECTAN: Denegar la cirugía de recambio valvular basándose únicamente en el consumo de drogas es médica y éticamente inaceptable. Los pacientes que reciben recambio valvular junto con tratamiento de adicciones (buprenorfina o metadona) y reducción de daños obtienen una supervivencia similar a la de los no consumidores.',
});

// ============================================================================
// ANTIMICROBIAL REGIMENS & THE POET ORAL STEP-DOWN REVOLUTION
// ============================================================================

export const ANTIMICROBIAL_STRATEGIES = Object.freeze({
  ivTraditionalEn: 'TRADITIONAL FULL-COURSE IV THERAPY (4–6 Weeks): High-dose bactericidal regimens (e.g., Cefazolin or Nafcillin for MSSA; Vancomycin or Daptomycin 8–10 mg/kg for MRSA; Ceftriaxone or Ampicillin for Streptococci). Requires long-term indwelling Central Venous Catheter (PICC line).',
  ivTraditionalEs: 'TRATAMIENTO INTRAVENOSO TRADICIONAL (4–6 Semanas): Antibióticos bactericidas intravenosos en dosis altas (Cefazolina para MSSA; Vancomicina o Daptomicina para MRSA; Ceftriaxona para estreptococos). Requiere un catéter venoso central (PICC).',

  poetOralStepDownEn: 'THE POET TRIAL ORAL STEP-DOWN PROTOCOL: In patients with left- or right-sided endocarditis who are clinically stable, afebrile for >= 7 days, have clearance of bacteremia, and non-progressive vegetations on TEE, switching from IV antibiotics to high-dose oral combination antimicrobial therapy (e.g., oral amoxicillin, rifampin, linezolid, ciprofloxacin) achieves non-inferior clinical cure rates. This is a game-changer for patients who cannot tolerate or maintain indwelling PICC lines due to vein loss, housing instability, or risk of patient-directed discharge (AMA).',
  poetOralStepDownEs: 'PROTOCOLO ORAL DE PASO (ENSAYO POET): En pacientes clínicamente estables, sin fiebre durante >= 7 días, con hemocultivos negativos y ecocardiograma sin progresión, pasar de antibióticos IV a combinaciones orales en dosis altas consigue una curación equivalente. Es crucial para pacientes que no toleran catéteres PICC o corren riesgo de marcharse de alta voluntaria (AMA).',

  dalbavancinStrategyEn: 'LONG-ACTING LIPOGLYCOPEPTIDE ALTERNATIVE (DALBAVANCIN): For Gram-positive endocarditis (MRSA, MSSA, Enterococcus), Dalbavancin administered as a single 1,500 mg IV infusion or two weekly 1,000 mg/500 mg doses provides weeks of sustained bactericidal tissue levels without requiring an indwelling central venous catheter, drastically reducing line infections and hospital stay.',
  dalbavancinStrategyEs: 'LIPOGLUCOPÉPTIDO DE LARGA DURACIÓN (DALBAVANCINA): Para bacterias Gram-positivas (MRSA, estafilococos), la dalbavancina administrada en infusión única de 1,500 mg IV proporciona semanas de niveles bactericidas sin necesidad de catéter PICC, reduciendo infecciones y estancias hospitalarias.',
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & FIELD BACTERIAL PREVENTION
// ============================================================================

export const ENDOCARDITIS_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Three Blood Culture Sets BEFORE Antibiotics Rule',
    titleEs: 'Tres Juegos de Hemocultivos ANTES de los Antibióticos',
    detailEn: 'Never allow antibiotics to be started before obtaining at least 3 separate blood culture sets (unless in septic shock). Antibiotics sterilize blood samples within hours, making it impossible to identify the exact pathogen or know which targeted antibiotics will save your heart valve.',
    detailEs: 'Nunca permita que inicien antibióticos antes de extraer 3 juegos de hemocultivos separados (salvo shock séptico grave). Los antibióticos esterilizan la sangre en horas e impiden saber qué bacteria está destruyendo la válvula cardíaca.',
  },
  {
    ruleNum: 2,
    titleEn: 'Recognize the Septic Pulmonary Emboli Cough Triad in Tricuspid IE',
    titleEs: 'Reconozca la Tríada de Tos y Émbolos Pulmonares en Endocarditis Tricuspídea',
    detailEn: 'Endocarditis from injection does not always present with heart murmurs! Tricuspid vegetations break off into the lungs, causing pleuritic chest pain (hurts to breathe in), persistent dry or productive cough, and hemoptysis (blood in spit). Many patients are misdiagnosed with simple pneumonia.',
    detailEs: 'La endocarditis por inyección no siempre causa soplos evidentes. Los coágulos viajan al pulmón y causan dolor al respirar hondo, tos persistente y esputos con sangre. A menudo se confunde erróneamente con una simple neumonía.',
  },
  {
    ruleNum: 3,
    titleEn: 'Never Lick Needles: The Oral Flora Endocarditis Hazard',
    titleEs: 'Jamás Chupe ni Lama las Agujas: Peligro de Flora Oral',
    detailEn: 'Licking needles coats them with aggressive oral viridans streptococci and HACEK bacteria. These oral microbes adhere with extreme virulence to cardiac valve leaflets. Always use sterile water and fresh needles; never let saliva touch injection equipment.',
    detailEs: 'Lamer las agujas las contamina con estreptococos orales y bacterias HACEK que se adhieren fuertemente a las válvulas cardíacas. Use siempre agua estéril y agujas nuevas; nunca deje que la saliva toque los materiales.',
  },
  {
    ruleNum: 4,
    titleEn: 'Use 0.22-Micron Wheel Filters to Protect Heart Valves from Particle Damage',
    titleEs: 'Filtros de Membrana de 0.22 Micras para Evitar Microlesiones Valvulares',
    detailEn: 'Particles of crushed pills, chalk, talc, and insoluble adulterants scrape and scar the delicate endothelial surface of the tricuspid valve, creating a raw landing strip for bacteria. 0.22-micron wheel filters eliminate all particulate matter and filter out bacteria and fungi.',
    detailEs: 'El talco y las partículas de pastillas machacadas raspan y lesionan la superficie de la válvula tricúspide, creando una superficie rugosa donde las bacterias anidan. Los filtros de rueda de 0.22 micras eliminan el 100% de partículas y bacterias.',
  },
  {
    ruleNum: 5,
    titleEn: 'Watch for PR Interval Lengthening & New Heart Block (Aortic Abscess Alert)',
    titleEs: 'Vigilar el Alargamiento del PR y Bloqueo Cardíaco (Alerta de Absceso Aórtico)',
    detailEn: 'In left-sided aortic valve endocarditis, infection eroding into the aortic root penetrates the heart’s electrical wiring (AV node). A lengthening PR interval or new bradycardia on an ECG is a surgical red flag indicating a perivalvular root abscess requiring immediate cardiothoracic surgery.',
    detailEs: 'En la endocarditis aórtica, el absceso perivalvular invade el sistema eléctrico del corazón (nodo AV). Un intervalo PR que se alarga en el ECG o bradicardia nueva es una alarma quirúrgica que exige cirugía cardíaca inmediata.',
  },
  {
    ruleNum: 6,
    titleEn: 'Right to Valve Surgery & POET Oral Step-Down Antibiotics',
    titleEs: 'Derecho a la Cirugía Valvular y Antibióticos Orales (Protocolo POET)',
    detailEn: 'Under civil rights and medical ethics standards, past or current substance use is NEVER a valid reason to deny life-saving heart valve surgery. Furthermore, if indwelling IV PICC lines are dangerous or impossible, clinical trials prove that high-dose oral step-down antibiotics are safe and effective.',
    detailEs: 'Por ética médica, el consumo de drogas NUNCA justifica denegar una cirugía cardíaca vital. Además, si un catéter intravenoso PICC es inviable, los estudios demuestran que combinaciones orales en dosis altas (protocolo POET) son igual de eficaces.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialEndocarditisState = () => ({
  activeTab: 'triage', // 'triage' | 'valves' | 'duke' | 'surgery' | 'harmReduction'
  viewMode: 'community', // 'community' | 'clinical'
  hasPleuriticChestPainHemoptysis: false,
  hasNewMurmurOrHeartFailure: false,
  hasPrProlongationHeartBlock: false,
  hasJanewayOslerRothSpots: false,
  hasPersistentFeverBacteremia: false,
  hasLargeVegetationOver10mm: false,
  isAtRiskOfLeavingAmaNoPicc: false,
});

let endocarditisState = initialEndocarditisState();
const listeners = new Set();

export function getEndocarditisState() {
  return { ...endocarditisState };
}

export function setEndocarditisState(patch) {
  endocarditisState = { ...endocarditisState, ...patch };
  listeners.forEach((l) => l(endocarditisState));
}

export function resetEndocarditisState() {
  endocarditisState = initialEndocarditisState();
  listeners.forEach((l) => l(endocarditisState));
}

export function subscribeEndocarditisState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// CLINICAL RISK EVALUATOR (EVALUATEENDOCARDITISRISK)
// ============================================================================

export function evaluateEndocarditisRisk(state) {
  const {
    hasPleuriticChestPainHemoptysis,
    hasNewMurmurOrHeartFailure,
    hasPrProlongationHeartBlock,
    hasJanewayOslerRothSpots,
    hasPersistentFeverBacteremia,
    hasLargeVegetationOver10mm,
    isAtRiskOfLeavingAmaNoPicc,
  } = state;

  // 1. Acute Cardiogenic Shock / Heart Block / Perivalvular Aortic Root Abscess
  if (hasPrProlongationHeartBlock || (hasNewMurmurOrHeartFailure && hasLargeVegetationOver10mm)) {
    return {
      tier: 'emergency_cardiothoracic_surgical',
      titleEn: 'CRITICAL CARDIOTHORACIC EMERGENCY: Acute Heart Failure, Perivalvular Root Abscess or Heart Block',
      titleEs: 'EMERGENCIA CARDIOTORÁCICA CRÍTICA: Fallo Cardíaco Agudo, Absceso Perivalvular o Bloqueo AV',
      isEmergency: true,
      actionEn: 'EMERGENT CARDIOTHORACIC SURGICAL CONSULT REQUIRED. PR interval prolongation on ECG indicates that aortic root abscess is burrowing into the AV node (perivalvular extension). Acute valve regurgitation with pulmonary edema is fatal without emergent surgical valve repair/replacement. Obtain emergent Transesophageal Echocardiogram (TEE) and prepare for emergent cardiac operating room.',
      actionEs: 'CONSULTA CARDIOTORÁCICA URGENTE. El alargamiento del PR en el ECG indica que un absceso aórtico está invadiendo el sistema de conducción eléctrica (nodo AV). La insuficiencia valvular aguda con edema pulmonar es mortal sin cirugía urgente de recambio valvular. Realizar ETE urgente y preparar quirófano.',
      interventionEn: 'Emergent TEE, continuous telemetry monitoring, emergent cardiothoracic surgery evaluation for valve replacement and aortic root debridement, broad-spectrum IV bactericidal therapy.',
      interventionEs: 'ETE urgente, monitorización continua, valoración quirúrgica para recambio valvular y limpieza del anillo aórtico, antibióticos bactericidas IV.',
    };
  }

  // 2. Septic Pulmonary Emboli & Tricuspid Endocarditis
  if (hasPleuriticChestPainHemoptysis) {
    return {
      tier: 'emergency_septic_pulmonary_emboli',
      titleEn: 'HIGH CLINICAL RISK: Suspected Tricuspid Endocarditis with Septic Pulmonary Emboli',
      titleEs: 'ALTO RIESGO CLÍNICO: Sospecha de Endocarditis Tricuspídea con Émbolos Sépticos Pulmonares',
      isEmergency: true,
      actionEn: 'EMERGENCY ROOM TRANSPORT & BLOOD CULTURES. Pleuritic chest pain, cough, and hemoptysis in the setting of injection drug use are the hallmark of Tricuspid Valve vegetations breaking off into the lungs (Septic Pulmonary Emboli). PROTOCOL: 1) Draw 3 sets of blood cultures from separate sites BEFORE antibiotics; 2) Chest CT with contrast or CXR for cavitary nodules; 3) Transthoracic Echocardiogram (TTE); 4) Empiric IV Vancomycin + Cefepime.',
      actionEs: 'TRASLADO A URGENCIAS Y HEMOCULTIVOS. El dolor pleurítico y la tos con sangre en personas que se inyectan son el signo cardinal de vegetaciones tricuspídeas que embolizan al pulmón. Extraer 3 juegos de hemocultivos ANTES de dar antibióticos, TC de tórax, ecocardiograma e iniciar vancomicina IV.',
      interventionEn: 'Three blood culture sets prior to antibiotics, chest CT with IV contrast, transthoracic and transesophageal echocardiography, empiric MRSA-active IV bactericidal therapy.',
      interventionEs: 'Tres juegos de hemocultivos previos a antibióticos, TC de tórax con contraste, ecocardiograma y antibioterapia IV activa frente a MRSA.',
    };
  }

  // 3. Left-Sided Systemic Emboli / Janeway & Osler Lesions
  if (hasJanewayOslerRothSpots) {
    return {
      tier: 'urgent_left_sided_embolic',
      titleEn: 'URGENT CARDIOVASCULAR ALERT: Left-Sided Endocarditis with Systemic Embolic Phenomena',
      titleEs: 'ALERTA CARDIOVASCULAR URGENTE: Endocarditis Izquierda con Fenómenos Embólicos Sistémicos',
      isEmergency: true,
      actionEn: 'URGENT INPATIENT ADMISSION & CARDIOLOGY EVALUATION. Janeway lesions (painless palms/soles macules), Osler nodes (painful finger nodules), or Roth spots indicate left-sided (aortic/mitral) endocarditis showering septic micro-emboli into systemic arterial circulation. High risk of embolic ischemic stroke or intracranial hemorrhage. Protocol: Stat blood cultures (3 sets), urgent TTE/TEE, brain MRI, and early surgical consultation.',
      actionEs: 'INGRESO HOSPITALARIO URGENTE Y EVALUACIÓN POR CARDIOLOGÍA. Las manchas de Janeway y nódulos de Osler indican endocarditis en cavidades izquierdas con riesgo de infarto cerebral embólico. Extraer 3 hemocultivos, realizar ETT/ETE, resonancia cerebral y valoración quirúrgica.',
      interventionEn: 'Immediate cardiology and infectious disease consult, urgent TEE, brain MRI/CT to rule out stroke or mycotic aneurysm, anticoagulation review (avoid anticoagulation in active native valve IE).',
      interventionEs: 'Consulta inmediata a cardiología e infecciosas, ETE urgente, RM cerebral para descartar ictus o aneurisma micótico, y evitar anticoagulación.',
    };
  }

  // 4. Persistent Bacteremia / Large Vegetations (> 10 mm)
  if (hasPersistentFeverBacteremia || hasLargeVegetationOver10mm) {
    return {
      tier: 'urgent_persistent_bacteremia',
      titleEn: 'URGENT INFECTION ALERT: Persistent Bacteremia or Large Cardiac Vegetation (> 10 mm)',
      titleEs: 'ALERTA DE INFECCIÓN URGENTE: Bacteriemia Persistente o Gran Vegetación Cardíaca (> 10 mm)',
      isEmergency: true,
      actionEn: 'HOSPITALIZATION & INFECTION SOURCE CONTROL. Vegetations > 10 mm carry high embolic risk. Persistent bacteremia > 48–72 hours despite appropriate IV therapy indicates metastatic deep seeding, perivalvular abscess, or non-susceptible organism. Repeat blood cultures, repeat TEE, and obtain infectious disease and cardiothoracic surgery consultations for planned debridement.',
      actionEs: 'HOSPITALIZACIÓN Y CONTROL DEL FOCO. Vegetaciones > 10 mm tienen alto riesgo de desprendimiento embólico. Bacteriemia que persiste > 48-72 h con antibiótico alerta de absceso o foco profundo. Repetir ETE y consultar con cirugía cardíaca.',
      interventionEn: 'Repeat serial blood cultures daily until negative, repeat TEE at 7–10 days, antibiotic optimization with synergy if indicated, cardiothoracic surgery evaluation for vegetation resection.',
      interventionEs: 'Hemocultivos seriados diarios hasta negativización, repetir ETE a los 7-10 días y valorar extirpación quirúrgica de la masa.',
    };
  }

  // 5. Patient at Risk of AMA Discharge / Cannot Maintain PICC Line (POET Protocol / Dalbavancin)
  if (isAtRiskOfLeavingAmaNoPicc) {
    return {
      tier: 'harm_reduction_poet_dalbavancin',
      titleEn: 'HARM REDUCTION STRATEGY: POET Trial Oral Step-Down or Long-Acting Dalbavancin Protocol',
      titleEs: 'ESTRATEGIA DE REDUCCIÓN DE DAÑOS: Paso a Vía Oral (Ensayo POET) o Dalbavancina',
      isEmergency: false,
      actionEn: 'PREVENT PREMATURE UNTREATED DISCHARGE (AMA). In patients who cannot tolerate long-term hospital stays or indwelling PICC lines due to vein loss or craving: 1) Once clinically stable, afebrile >= 7 days, and blood cultures are cleared, switch to high-dose oral combination antimicrobial therapy according to the POET trial; OR 2) Administer single-dose or two-dose long-acting IV Dalbavancin (1,500 mg IV) prior to discharge; 3) Initiate or maintain MOUD (buprenorphine/methadone).',
      actionEs: 'EVITAR EL ALTA VOLUNTARIA SIN TRATAMIENTO. Si el paciente no tolera el ingreso prolongado o catéteres PICC: una vez estable y sin fiebre >= 7 días, pasar a antibióticos orales combinados en altas dosis (ensayo POET) o administrar Dalbavancina IV de larga duración antes del alta, garantizando el tratamiento de adicciones (MOUD).',
      interventionEn: 'Infectious disease consultation for POET oral step-down regimen, dalbavancin administration, low-barrier addiction medicine consultation with MOUD initiation, harm reduction supplies upon discharge.',
      interventionEs: 'Consulta de infecciosas para pauta oral tipo POET, dalbavancina, inicio de buprenorfina/metadona y entrega de material de reducción de daños.',
    };
  }

  // 6. Standard Bacterial Endocarditis Prevention & Injection Hygiene
  return {
    tier: 'standard_endocarditis_prevention',
    titleEn: 'Standard Bacterial Endocarditis Prevention & Cardiovascular Harm Reduction',
    titleEs: 'Pautas Estándar de Prevención de Endocarditis y Reducción de Daños Cardiovasculares',
    isEmergency: false,
    actionEn: 'No acute endocarditis red flags detected. Cardiovascular harm reduction standards: 1) Always clean injection sites with 70% alcohol and let air-dry for 30 seconds to kill Staphylococcus aureus skin bacteria; 2) Never lick needles or use saliva on equipment; 3) Always use 0.22-micron wheel filters to remove particulate matter that scratches heart valves; 4) Seek immediate care for unexplained persistent fevers, drenching sweats, or pleuritic chest pain.',
    actionEs: 'No se detectan banderas rojas cardíacas agudas. Normas de prevención: limpiar la piel con alcohol al 70% y dejar secar 30 s para eliminar estafilococos; jamás lamer agujas ni usar saliva; usar filtros de membrana de 0.22 micras para evitar que el talco raspe las válvulas; y consultar ante fiebres inexplicables o sudores nocturnos.',
    interventionEn: 'Distribution of 0.22-micron wheel filters, sterile injection equipment, alcohol swabs, cardiovascular risk education, low-barrier primary care and MOUD navigation.',
    interventionEs: 'Distribución de filtros de rueda de 0.22 micras, material estéril, educación en salud cardiovascular y acceso a MOUD.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildEndocarditisSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: EVALUACIÓN DE ENDOCARDITIS INFECCIOSA (CERO PII)',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      'Evaluación clínica por sospecha de endocarditis infecciosa (EI), bacteriemia o complicaciones valvulares.',
      `Diagnóstico de riesgo evaluado: ${evaluation.titleEs}.`,
      `Urgencia médica: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA CRÍTICA / VITAL' : 'GESTIÓN CLÍNICA Y REDUCCIÓN DE DAÑOS'}.`,
      '',
      'B (ANTECEDENTES / FACTORES DE RIESGO CARDIOVASCULARES Y DE INYECCIÓN):',
      `- Alargamiento del PR / bloqueo AV / absceso aórtico: ${state.hasPrProlongationHeartBlock ? 'SÍ (URGENCIA QUIRÚRGICA - EXTENSIÓN PERIVALVULAR)' : 'No'}.`,
      `- Dolor pleurítico / tos / hemoptisis (Émbolos pulmonares sépticos): ${state.hasPleuriticChestPainHemoptysis ? 'SÍ (SOSPECHA ENDOCARDITIS TRICUSPÍDEA DERECHA)' : 'No'}.`,
      `- Manchas de Janeway / nódulos de Osler / manchas de Roth: ${state.hasJanewayOslerRothSpots ? 'SÍ (ÉMBOLOS ARTERIALES SISTÉMICOS - AFECTACIÓN IZQUIERDA)' : 'No'}.`,
      `- Nuevo soplo regurgitante o signos de insuficiencia cardíaca: ${state.hasNewMurmurOrHeartFailure ? 'SÍ (EVALUAR DESCOMPENSACIÓN HEMODINÁMICA)' : 'No'}.`,
      `- Fiebre persistente o bacteriemia no aclarada > 48–72h: ${state.hasPersistentFeverBacteremia ? 'SÍ (RIESGO DE FOCO PROFUNDO Y RESISTENCIA)' : 'No'}.`,
      `- Gran vegetación documentada > 10 mm en ecocardiograma: ${state.hasLargeVegetationOver10mm ? 'SÍ (ALTO RIESGO EMBÓLICO Y VALORACIÓN QUIRÚRGICA)' : 'No'}.`,
      `- Riesgo de alta voluntaria (AMA) o imposibilidad de vía central PICC: ${state.isAtRiskOfLeavingAmaNoPicc ? 'SÍ (VALORAR PROTOCOLO ORAL POET O DALBAVANCINA)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y GESTIÓN CARDIOTORÁCICA):',
      '1. Regla de oro de hemocultivos: Extraer al menos 3 juegos de hemocultivos antes de iniciar antibióticos empíricos.',
      '2. Ecocardiograma: ETE obligatorio si el ETT es dudoso o para descartar abscesos del anillo aórtico.',
      '3. Ética quirúrgica: El consumo activo NO es motivo para denegar cirugía de sustitución valvular según AHA/ACC.',
      '4. Protocolo POET: Paso a vía oral en dosis altas tras estabilización clínica si la vía central es inviable.',
      '5. Reducción de daños: Entrega de filtros de rueda de 0.22 micras y alcohol al 70% para proteger las válvulas.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'INFECTIVE ENDOCARDITIS & CARDIAC VALVE CLINICAL SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    'Clinical consultation for suspected Infective Endocarditis (IE), bacteremia, or valvular destruction.',
    `Assessed Presentation: ${evaluation.titleEn}.`,
    `Safety Urgency: ${evaluation.isEmergency ? 'LIFE-THREATENING MEDICAL EMERGENCY' : 'CLINICAL MANAGEMENT & VALVE PRESERVATION'}.`,
    '',
    'B (BACKGROUND / CARDIOVASCULAR & INJECTION RISK FACTORS):',
    `- PR prolongation / new heart block / perivalvular root abscess: ${state.hasPrProlongationHeartBlock ? 'YES (EMERGENT SURGICAL RED FLAG - AORTIC ROOT EXTENSION)' : 'No'}.`,
    `- Pleuritic chest pain / cough / hemoptysis (Septic pulmonary emboli): ${state.hasPleuriticChestPainHemoptysis ? 'YES (SUSPECTED RIGHT-SIDED TRICUSPID IE)' : 'No'}.`,
    `- Janeway lesions / Osler nodes / Roth spots: ${state.hasJanewayOslerRothSpots ? 'YES (LEFT-SIDED SYSTEMIC EMBOLIZATION)' : 'No'}.`,
    `- New regurgitant murmur or signs of acute heart failure: ${state.hasNewMurmurOrHeartFailure ? 'YES (HEMODYNAMIC COMPROMISE)' : 'No'}.`,
    `- Persistent fever or bacteremia > 48–72h on therapy: ${state.hasPersistentFeverBacteremia ? 'YES (PERSISTENT INTRACARDIAC SOURCE / RESISTANCE)' : 'No'}.`,
    `- Large mobile vegetation > 10 mm on echocardiogram: ${state.hasLargeVegetationOver10mm ? 'YES (HIGH EMBOLIC RISK / SURGICAL INDICATION)' : 'No'}.`,
    `- Risk of AMA discharge or cannot maintain PICC line: ${state.isAtRiskOfLeavingAmaNoPicc ? 'YES (CONSIDER POET ORAL STEP-DOWN OR DALBAVANCIN)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Clinical Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & CARDIOTHORACIC MANAGEMENT):',
    '1. Blood culture rule: Obtain at least 3 sets of blood cultures prior to starting empiric antimicrobial therapy.',
    '2. Echocardiography: Transesophageal Echocardiogram (TEE) is mandatory to rule out perivalvular root abscesses.',
    '3. Surgical ethics: Under AHA/ACC guidelines, active or past substance use is NEVER an ethical reason to deny valve surgery.',
    '4. POET protocol: Consider high-dose oral step-down therapy once stable if indwelling PICC line poses reinfection risk.',
    '5. Harm reduction: Distribute 0.22-micron wheel filters to prevent particulate micro-abrasions on valve leaflets.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function endocarditisCareView() {
  const container = h('div', { class: 'endocarditis-care-view' });

  function render() {
    clear(container);
    const state = getEndocarditisState();
    const evaluation = evaluateEndocarditisRisk(state);

    // Header Banner
    const header = h('header', { class: 'ec-header' }, [
      h('div', { class: 'ec-header-badge' }, [
        icon('activity'),
        h('span', {}, t('ec.header.badge', 'Cardiovascular Harm Reduction & Infective Endocarditis')),
      ]),
      h('h1', { class: 'ec-header-title' }, t('ec.header.title', 'Infective Endocarditis, Valve Destruction & POET Protocol Navigator')),
      h('p', { class: 'ec-header-desc' }, t('ec.header.desc', 'Evidence-based clinical decision support and harm reduction standards from the AHA, IDSA, and Duke-ISCVID: Tricuspid septic pulmonary emboli vs. aortic root abscess, 3-blood-culture timing, POET trial oral step-down regimens, dalbavancin strategies, and the ethical right to valve surgery.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'ec-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        type: 'button',
        class: `ec-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setEndocarditisState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('ec.mode.community', 'Community & Patient Mode (Chest Pain, Cough & Prevention)')),
      ]),
      h('button', {
        type: 'button',
        class: `ec-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setEndocarditisState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('ec.mode.clinical', 'Clinician & Cardiology Mode (Duke Criteria, TEE & POET SBAR)')),
      ]),
    ]);

    // Tabs Nav
    const tabsList = h('div', { class: 'ec-tabs-nav', role: 'tablist', 'aria-label': 'Endocarditis Care Tabs' }, [
      h('button', {
        type: 'button',
        class: `ec-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setEndocarditisState({ activeTab: 'triage' }),
      }, t('ec.tabs.triage', 'Endocarditis Emergency Triage')),
      h('button', {
        type: 'button',
        class: `ec-tab-btn ${state.activeTab === 'valves' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'valves' ? 'true' : 'false',
        onclick: () => setEndocarditisState({ activeTab: 'valves' }),
      }, t('ec.tabs.valves', 'Tricuspid vs. Aortic/Mitral Pathology')),
      h('button', {
        type: 'button',
        class: `ec-tab-btn ${state.activeTab === 'duke' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'duke' ? 'true' : 'false',
        onclick: () => setEndocarditisState({ activeTab: 'duke' }),
      }, t('ec.tabs.duke', 'Duke-ISCVID Criteria & Cultures')),
      h('button', {
        type: 'button',
        class: `ec-tab-btn ${state.activeTab === 'surgery' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'surgery' ? 'true' : 'false',
        onclick: () => setEndocarditisState({ activeTab: 'surgery' }),
      }, t('ec.tabs.surgery', 'Cardiothoracic Surgery & POET Protocol')),
      h('button', {
        type: 'button',
        class: `ec-tab-btn ${state.activeTab === 'harmReduction' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'harmReduction' ? 'true' : 'false',
        onclick: () => setEndocarditisState({ activeTab: 'harmReduction' }),
      }, t('ec.tabs.harmReduction', 'Valve Protection & Harm Reduction')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'valves':
        tabContent = renderValvesTab();
        break;
      case 'duke':
        tabContent = renderDukeTab();
        break;
      case 'surgery':
        tabContent = renderSurgeryTab();
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
    const section = h('section', { class: 'ec-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'ec-inputs-grid' }, [
      // 1. Heart Block / PR Prolongation
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasPrProlongationHeartBlock,
            onchange: (e) => setEndocarditisState({ hasPrProlongationHeartBlock: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ec.check.prStrong', 'PR Prolongation on ECG or New Heart Block / Bradycardia? ')),
            t('ec.check.prDetail', '(Critical Surgical Red Flag: Aortic root perivalvular abscess invading AV node)'),
          ]),
        ]),
      ]),

      // 2. Septic Pulmonary Emboli / Pleuritic Chest Pain
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasPleuriticChestPainHemoptysis,
            onchange: (e) => setEndocarditisState({ hasPleuriticChestPainHemoptysis: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ec.check.emboliStrong', 'Pleuritic Chest Pain (Hurts to Breathe), Cough or Coughing Up Blood? ')),
            t('ec.check.emboliDetail', '(High Clinical Risk: Right-sided Tricuspid endocarditis with Septic Pulmonary Emboli)'),
          ]),
        ]),
      ]),

      // 3. Janeway Lesions, Osler Nodes, or Roth Spots
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasJanewayOslerRothSpots,
            onchange: (e) => setEndocarditisState({ hasJanewayOslerRothSpots: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ec.check.stigmataStrong', 'Janeway Lesions (Palms/Soles Spots), Osler Nodes (Tender Fingers), or Roth Spots? ')),
            t('ec.check.stigmataDetail', '(Systemic arterial embolization & left-sided aortic/mitral valve destruction)'),
          ]),
        ]),
      ]),

      // 4. New Murmur or Acute Heart Failure
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasNewMurmurOrHeartFailure,
            onchange: (e) => setEndocarditisState({ hasNewMurmurOrHeartFailure: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ec.check.murmurStrong', 'New Regurgitant Murmur, Severe Breathlessness, or Swollen Ankles? ')),
            t('ec.check.murmurDetail', '(Acute valvular regurgitation & cardiogenic pulmonary edema warning)'),
          ]),
        ]),
      ]),

      // 5. Persistent Fever or Bacteremia > 48–72h
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasPersistentFeverBacteremia,
            onchange: (e) => setEndocarditisState({ hasPersistentFeverBacteremia: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ec.check.bacteremiaStrong', 'Persistent Fever >= 38.0°C or Positive Blood Cultures > 48 Hours? ')),
            t('ec.check.bacteremiaDetail', '(Uncontrolled infection source, metastatic seeding, or antimicrobial resistance)'),
          ]),
        ]),
      ]),

      // 6. Large Vegetation > 10 mm
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasLargeVegetationOver10mm,
            onchange: (e) => setEndocarditisState({ hasLargeVegetationOver10mm: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ec.check.vegStrong', 'Echocardiogram Shows Large Vegetation (> 10 mm on Left or > 20 mm on Right)? ')),
            t('ec.check.vegDetail', '(High embolic risk & potential cardiothoracic surgery indication)'),
          ]),
        ]),
      ]),

      // 7. At Risk of Leaving AMA / Cannot Maintain PICC Line
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.isAtRiskOfLeavingAmaNoPicc,
            onchange: (e) => setEndocarditisState({ isAtRiskOfLeavingAmaNoPicc: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ec.check.amaStrong', 'Risk of Patient-Directed Discharge (AMA) or Indwelling PICC Line Infeasible? ')),
            t('ec.check.amaDetail', '(Harm Reduction Alternative: POET trial oral step-down or single-dose IV Dalbavancin)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `ec-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'ec-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'ec-result-details' }, [
        h('div', { class: 'ec-rec-item' }, [
          h('strong', {}, t('ec.res.action', 'Clinical & Diagnostic Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'ec-rec-item' }, [
          h('strong', {}, t('ec.res.intervention', 'Recommended Medical Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // SBAR Export Card
    const copyEnBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      onclick: () => {
        const text = buildEndocarditisSbarText(state, evaluation, 'en');
        copyText(text, { trigger: copyEnBtn });
      },
    }, [icon('copy'), h('span', {}, t('ec.sbar.copyEn', 'Copy Clinical SBAR (English)'))]);
    const copyEsBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      onclick: () => {
        const text = buildEndocarditisSbarText(state, evaluation, 'es');
        copyText(text, { trigger: copyEsBtn });
      },
    }, [icon('copy'), h('span', {}, t('ec.sbar.copyEs', 'Copiar SBAR (Español)'))]);
    const sbarCard = h('div', { class: 'ec-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('ec.sbar.title', 'Zero-PII Infective Endocarditis Clinical SBAR Note Generator')),
        h('div', { class: 'sbar-actions' }, [copyEnBtn, copyEsBtn]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildEndocarditisSbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderValvesTab() {
    const section = h('section', { class: 'ec-valves-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'ec-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ec.valves.heading', 'Right-Sided vs. Left-Sided Endocarditis Clinical Divergence')),
      h('p', { class: 'tab-subtitle' }, t('ec.valves.subtitle', 'Understanding the crucial anatomical differences between tricuspid valve septic pulmonary emboli and aortic/mitral acute heart failure.')),
    ]);

    const diffsGrid = h('div', { class: 'ec-diffs-grid' }, [
      ENDOCARDITIS_VALVE_PROFILES.rightSidedTricuspid,
      ENDOCARDITIS_VALVE_PROFILES.leftSidedAorticMitral,
    ].map((v) => h('div', { class: 'ec-diff-card' }, [
      h('div', { class: 'diff-badge' }, v.id.toUpperCase().replace(/_/g, ' ')),
      h('h3', { class: 'diff-title' }, v.nameEn),
      h('div', { class: 'diff-field' }, [
        h('strong', {}, 'Pathophysiology & Mechanism: '),
        h('p', {}, v.pathophysiologyEn),
      ]),
      h('div', { class: 'diff-field action-field' }, [
        h('strong', {}, 'Clinical Presentation & Hallmarks: '),
        h('p', {}, v.clinicalPresentationEn),
      ]),
      h('div', { class: 'diff-field' }, [
        h('strong', {}, 'Prognosis & Hemodynamic Risk: '),
        h('p', {}, v.prognosisEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(diffsGrid);
    return section;
  }

  function renderDukeTab() {
    const section = h('section', { class: 'ec-duke-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'ec-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ec.duke.heading', 'The 2023 Duke-ISCVID Criteria & Blood Culture Mandate')),
      h('p', { class: 'tab-subtitle' }, t('ec.duke.subtitle', 'Rigorous diagnostic standards for definite vs. possible infective endocarditis, blood culture timing, and echocardiographic resolution.')),
    ]);

    const bloodCard = h('div', { class: 'ec-card' }, [
      h('h3', {}, 'The Cardinal Blood Culture Rule'),
      h('p', {}, DUKE_CRITERIA_STANDARDS.bloodCultureRuleEn),
    ]);

    const echoCard = h('div', { class: 'ec-card' }, [
      h('h3', {}, 'Transthoracic (TTE) vs. Transesophageal (TEE) Echocardiography'),
      h('p', {}, DUKE_CRITERIA_STANDARDS.echoGuidanceEn),
    ]);

    const criteriaCard = h('div', { class: 'ec-card' }, [
      h('h3', {}, 'Major & Minor Duke Diagnostic Criteria'),
      h('strong', {}, 'Major Criteria:'),
      h('ul', {}, DUKE_CRITERIA_STANDARDS.majorCriteriaEn.map((m) => h('li', {}, m))),
      h('strong', {}, 'Minor Criteria:'),
      h('ul', {}, DUKE_CRITERIA_STANDARDS.minorCriteriaEn.map((m) => h('li', {}, m))),
      h('p', { class: 'mt-2' }, [h('strong', {}, 'Diagnostic Algorithm: '), DUKE_CRITERIA_STANDARDS.classificationAlgorithmEn]),
    ]);

    section.appendChild(introCard);
    section.appendChild(bloodCard);
    section.appendChild(echoCard);
    section.appendChild(criteriaCard);
    return section;
  }

  function renderSurgeryTab() {
    const section = h('section', { class: 'ec-surgery-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'ec-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ec.surg.heading', 'Cardiothoracic Surgery Triggers & The POET Oral Step-Down Revolution')),
      h('p', { class: 'tab-subtitle' }, t('ec.surg.subtitle', 'Clear indications for emergency valve surgery, the ethical right to valve replacement in PWID, and evidence-based oral step-down regimens.')),
    ]);

    const surgCard = h('div', { class: 'ec-card' }, [
      h('h3', {}, 'Cardiothoracic Surgery Indications (AHA/ACC Consensus)'),
      h('ul', {}, SURGICAL_INDICATIONS_CONSENSUS.indicationsEn.map((s) => h('li', {}, s))),
      h('div', { class: 'alert-callout info mt-3' }, [
        h('strong', {}, 'AHA/ACC Ethical Mandate: '),
        h('p', {}, SURGICAL_INDICATIONS_CONSENSUS.ethicalDirectiveEn),
      ]),
    ]);

    const poetCard = h('div', { class: 'ec-card' }, [
      h('h3', {}, 'Antimicrobial Paradigms: Full IV vs. POET Oral Step-Down vs. Dalbavancin'),
      h('p', {}, [h('strong', {}, 'Traditional Full-Course IV: '), ANTIMICROBIAL_STRATEGIES.ivTraditionalEn]),
      h('p', {}, [h('strong', {}, 'The POET Trial Oral Step-Down Protocol: '), ANTIMICROBIAL_STRATEGIES.poetOralStepDownEn]),
      h('p', {}, [h('strong', {}, 'Long-Acting Dalbavancin Alternative: '), ANTIMICROBIAL_STRATEGIES.dalbavancinStrategyEn]),
    ]);

    section.appendChild(introCard);
    section.appendChild(surgCard);
    section.appendChild(poetCard);
    return section;
  }

  function renderHarmReductionTab() {
    const section = h('section', { class: 'ec-harm-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'ec-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ec.hr.heading', 'Endocarditis Harm Reduction & Valve Survival Directives')),
      h('p', { class: 'tab-subtitle' }, t('ec.hr.subtitle', 'Essential field directives to prevent bacterial colonization of heart valves, particulate endothelial scarring, and recurrent endocarditis.')),
    ]);

    const rulesGrid = h('div', { class: 'ec-rules-grid' }, ENDOCARDITIS_HARM_REDUCTION_RULES.map((rule) => h('div', { class: 'ec-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${rule.ruleNum}`),
      h('h3', {}, rule.titleEn),
      h('p', {}, rule.detailEn),
    ])));

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    const pulmonaryCard = h('div', { class: 'ec-card mt-3' }, [
      h('h3', {}, 'Septic Pulmonary Emboli & Respiratory CDS Alert'),
      h('p', {}, 'Right-sided tricuspid endocarditis frequently embolizes into pulmonary circulation, presenting with pleuritic chest pain, hemoptysis, and cavitary infiltrates: '),
      h('p', {}, [
        h('a', { href: '#/pulmonary-care', class: 'btn btn-secondary' }, 'Open Pulmonary Health & Respiratory Care Navigator →'),
      ]),
    ]);
    section.appendChild(pulmonaryCard);
    const orthopedicCard = h('div', { class: 'ec-card mt-3' }, [
      h('h3', {}, 'Metastatic Vertebral Osteomyelitis, Epidural Abscess & OVIVA Oral Step-Down'),
      h('p', {}, 'Bacteremic endocarditis frequently seeds the spine (epidural abscess/discitis), sternoclavicular joint, or psoas muscle. Review OVIVA oral and Dalbavancin bone protocols: '),
      h('p', {}, [
        h('a', { href: '#/orthopedic-care', class: 'btn btn-secondary' }, 'Open Spine, Septic Arthritis & OVIVA Bone/Joint Navigator →'),
      ]),
    ]);
    section.appendChild(orthopedicCard);
    const ocularCard = h('div', { class: 'ec-card mt-3' }, [
      h('h3', {}, 'Endogenous Endophthalmitis, Roth Spots & Central Retinal Artery Occlusion'),
      h('p', {}, 'Fungemia/bacteremia and endocarditis emboli seed the retina and vitreous cavity (where IV vancomycin and micafungin fail without intravitreal injection): '),
      h('p', {}, [
        h('a', { href: '#/ocular-care', class: 'btn btn-secondary' }, 'Open Ophthalmology, Endophthalmitis & Ocular Toxicology Navigator →'),
      ]),
    ]);
    section.appendChild(ocularCard);
    const cardiologyCard = h('div', { class: 'ec-card mt-3' }, [
      h('h3', {}, 'Stimulant ACS, Wide-QRS Sodium-Channel Blockade, Torsades (QTc) & Meth-PAH'),
      h('p', {}, 'Chest pain, syncope, or heart failure in people who use stimulants or MOUD may also reflect coronary vasospasm, sodium-channel QRS widening, QTc prolongation, aortic dissection, or methamphetamine cardiomyopathy/PAH: '),
      h('p', {}, [
        h('a', { href: '#/cardiology-care', class: 'btn btn-secondary' }, 'Open Cardiology, Arrhythmia & Stimulant ACS Navigator →'),
      ]),
    ]);
    section.appendChild(cardiologyCard);
    return section;
  }

  // Initial render
  const unsubscribe = subscribeEndocarditisState(() => render());
  render();

  return container;
}
