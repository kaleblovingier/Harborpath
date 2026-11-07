// public/js/views/veinCare.js
// HarborPath - Vascular Health, Vein Preservation, Arterial Puncture Triage & Safer Injection Anatomy Navigator
// Clinical consensus: Harm Reduction Coalition (HRC) Getting Off Right / Safer Injection Standards,
// World Health Organization (WHO) Guidelines for Prevention of Viral Hepatitis & Bloodborne Pathogens among PWID,
// Society for Vascular Surgery (SVS) & Society of Interventional Radiology (SIR) Peripheral Vascular Disease Guidelines,
// CDC Clinical Guidance on Infective Endocarditis & Soft Tissue Infections in People Who Inject Drugs (PWID).
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: ANATOMICAL INJECTION ZONES & RISK STRATIFICATION
// ============================================================================

export const INJECTION_ANATOMICAL_ZONES = Object.freeze({
  greenForearm: Object.freeze({
    id: 'green_forearm',
    tier: 'safer',
    nameEn: 'Forearm & Upper Inner Arm (Cephalic, Basilic, Median Cubital Veins)',
    nameEs: 'Antebrazo y flexura del brazo (Venas cefálica, basílica y mediana cubital)',
    riskLevelEn: 'Low to Moderate Risk (Safest Available Anatomy)',
    riskLevelEs: 'Riesgo bajo a moderado (La anatomía más segura disponible)',
    clinicalRationaleEn: 'Veins in the forearm and inside elbow are superficial, prominent, possess robust competent venous valves, and have high blood flow velocity. Crucially, they are physically separated from major deep arteries by muscular fascial planes, significantly reducing accidental arterial puncture or nerve impingement.',
    clinicalRationaleEs: 'Las venas del antebrazo y flexura son superficiales, con válvulas competentes y buen flujo sanguíneo. Están separadas de las arterias profundas por planos musculares, reduciendo el riesgo de punción arterial.',
    keyDirectivesEn: [
      'Always inject in the direction of blood flow: upward towards the heart.',
      'Rotate sites along the vein: never hit the exact same puncture mark twice consecutively.',
      'Release the tourniquet completely BEFORE depressing the syringe plunger.',
    ],
    keyDirectivesEs: [
      'Inyecte siempre en la dirección del flujo venoso: hacia arriba, en dirección al corazón.',
      'Rote los puntos de punción: nunca inyecte dos veces consecutivas en la misma marca.',
      'Suelte el torniquete por completo ANTES de empujar el émbolo de la jeringa.',
    ],
  }),

  yellowHands: Object.freeze({
    id: 'yellow_hands',
    tier: 'caution',
    nameEn: 'Dorsum of Hands & Wrists (Superficial Dorsal Venous Network)',
    nameEs: 'Dorso de manos y muñecas (Red venosa dorsal superficial)',
    riskLevelEn: 'Moderate Risk (High Fragility & Sclerosis Zone)',
    riskLevelEs: 'Riesgo moderado (Zona de alta fragilidad y esclerosis)',
    clinicalRationaleEn: 'Veins on the back of the hand are much smaller, thinner-walled, highly fragile, and tend to roll away from the needle. Blood flow is slower and extremities are prone to poor circulation. Injecting acidic or cut drugs frequently causes instant chemical phlebitis, rapid venous collapse, and subcutaneous extravasation ("missed shots") that form deep hand abscesses.',
    clinicalRationaleEs: 'Las venas de las manos son finas, frágiles y se mueven fácilmente. El flujo es lento y la extravasación de sustancias ácidas produce flebitis inmediata, colapso venoso y abscesos profundos.',
    keyDirectivesEn: [
      'Use a higher gauge, thinner needle (29G or 31G) with a short barrel (5/16 inch / 8 mm).',
      'Never inject into the underside of the wrist where radial/ulnar arteries and median nerves lie exposed millimeters beneath the skin.',
      'Warm hands thoroughly in warm water for 5 minutes prior to injection to dilate fragile veins.',
    ],
    keyDirectivesEs: [
      'Utilice una aguja más fina (29G o 31G) y corta (8 mm / 5/16 pulgadas).',
      'Nunca inyecte en la cara interna de la muñeca (riesgo de punción de arteria radial o nervio mediano).',
      'Caliente las manos con agua templada 5 minutos antes para dilatar las venas.',
    ],
  }),

  redNeck: Object.freeze({
    id: 'red_neck',
    tier: 'extreme_danger',
    nameEn: 'Neck & Throat (Internal & External Jugular Veins)',
    nameEs: 'Cuello y garganta (Venas yugulares interna y externa)',
    riskLevelEn: 'EXTREME HIGH HAZARD (Life-Threatening Red Zone)',
    riskLevelEs: 'PELIGRO EXTREMO (Zona roja potencialmente mortal)',
    clinicalRationaleEn: 'Injecting into the neck carries catastrophic risks: the Carotid Artery and Vagus Nerve lie directly adjacent to the jugular vein. Accidental carotid injection causes instant cerebral infarction (stroke) or seizure. Missed shots produce rapidly expanding deep neck space infections and hematomas that compress the trachea, causing suffocating airway obstruction and death within minutes. Air embolism risk is extreme due to negative intrathoracic inspiratory pressure.',
    clinicalRationaleEs: 'Peligro catastrófico: la arteria carótida y el nervio vago están pegados a la yugular. La punción carotídea causa ictus masivo o convulsiones. Los hematomas o abscesos en el cuello comprimen la tráquea causando asfixia en minutos.',
    keyDirectivesEn: [
      'STRICT HARM REDUCTION MANDATE: Avoid neck injection under all circumstances.',
      'If veins in arms are lost, switch to non-injection routes (smoking, boofing/rectal, snorting) rather than risking carotid puncture.',
      'Never inject alone in the neck. If swelling or breathing changes occur, call 911 immediately.',
    ],
    keyDirectivesEs: [
      'REGLA ESTRICTA: Evite la inyección en el cuello bajo cualquier circunstancia.',
      'Si ha perdido las venas de los brazos, cambie de vía (fumar, vía rectal/boofing o inhalar) antes que arriesgar la carótida.',
      'Nunca se inyecte en el cuello a solas. Llame al 911 de inmediato ante cualquier dificultad respiratoria.',
    ],
  }),

  redGroin: Object.freeze({
    id: 'red_groin',
    tier: 'extreme_danger',
    nameEn: 'Groin & Inguinal Canal (Femoral Vein / "Femoral Hit")',
    nameEs: 'Ingle y canal inguinal (Vena femoral / Inyección femoral)',
    riskLevelEn: 'EXTREME HIGH HAZARD (Limb Loss & Exsanguination Zone)',
    riskLevelEs: 'PELIGRO EXTREMO (Zona de alto riesgo de amputación y hemorragia)',
    clinicalRationaleEn: 'The femoral vein lies alongside the Femoral Artery and Femoral Nerve (the NAVEL anatomical bundle). Puncturing the femoral artery causes massive arterial hemorrhage, exsanguinating blood loss, and false aneurysm (pseudoaneurysm) formation that can rupture spontaneously. Chronic femoral injection destroys venous return, leading to severe deep vein thrombosis (DVT), chronic venous leg ulceration, septic emboli to lungs, and limb amputation.',
    clinicalRationaleEs: 'La vena femoral discurre junto a la arteria y el nervio femorales. La punción arterial produce hemorragia masiva y pseudoaneurismas. La inyección femoral crónica destruye el retorno venoso, causando trombosis venosa profunda (TVP) y riesgo de amputación.',
    keyDirectivesEn: [
      'HIGH RISK OF ARTERIAL HEMORRHAGE: Femoral artery blood is bright red, high pressure, and pulsatile.',
      'Pulsatile swelling or a whooshing sound (bruit) in the groin indicates a pseudoaneurysm: immediate emergency vascular evaluation required.',
      'Switching to non-injection alternatives preserves leg mobility and prevents permanent disability.',
    ],
    keyDirectivesEs: [
      'ALTO RIESGO DE HEMORRAGIA ARTERIAL: La sangre arterial es rojo brillante y pulsátil.',
      'Un bulto que late o sopla en la ingle alerta de pseudoaneurisma: requiere cirugía vascular urgente.',
      'Considere cambiar a vías alternativas para evitar la pérdida permanente de la pierna.',
    ],
  }),

  redLegsFeet: Object.freeze({
    id: 'red_legs_feet',
    tier: 'extreme_danger',
    nameEn: 'Legs, Ankles & Feet (Saphenous Veins & Dorsal Pedis)',
    nameEs: 'Piernas, tobillos y pies (Venas safenas y arco dorsal del pie)',
    riskLevelEn: 'EXTREME HIGH HAZARD (Venous Stasis & Non-Healing Ulcer Zone)',
    riskLevelEs: 'PELIGRO EXTREMO (Zona de estasis venosa y úlceras crónicas)',
    clinicalRationaleEn: 'Venous circulation in the lower extremities is sluggish and depends on calf muscle pump contraction to return blood uphill against gravity. Injected drugs easily cause thrombophlebitis and valve destruction. The skin around the ankles is poorly vascularized; missed injections and chemical extravasations almost universally degenerate into chronic, necrotic, non-healing venous stasis ulcers that can persist for years and lead to osteomyelitis (bone infection) and sepsis.',
    clinicalRationaleEs: 'La circulación en las piernas es lenta. Las inyecciones destruyen las válvulas venosas. Las extravasaciones en pies y tobillos degeneran casi siempre en úlceras necróticas crónicas que no cicatrizan e infectan el hueso (osteomielitis).',
    keyDirectivesEn: [
      'Avoid injecting below the waist: high risk of permanent venous insufficiency and leg swelling.',
      'Never tie a tourniquet around the leg and walk around: creates extreme venous pressure that blows out valves.',
      'Elevate legs whenever sitting or resting to promote venous drainage.',
    ],
    keyDirectivesEs: [
      'Evite inyectarse por debajo de la cintura: alto riesgo de hinchazón crónica y destrucción venosa.',
      'Nunca camine con el torniquete puesto en la pierna: revienta las válvulas por presión venosa.',
      'Mantenga las piernas elevadas al descansar para favorecer el retorno de la sangre.',
    ],
  }),
});

// ============================================================================
// CLINICAL EMERGENCY: ARTERIAL PUNCTURE VS VENOUS ACCESS
// ============================================================================

export const VASCULAR_ACCESS_DIFFERENTIAL = Object.freeze({
  venous: Object.freeze({
    type: 'Venous Blood (Correct Target)',
    typeEs: 'Sangre Venosa (Objetivo Correcto)',
    colorEn: 'Dark crimson red, steady non-pulsatile draw.',
    colorEs: 'Rojo oscuro vino tinto, flujo suave y sin pulsaciones.',
    sensationEn: 'Painless or mild pressure as plunger is drawn.',
    sensationEs: 'Sin dolor o ligera molestia al aspirar.',
    actionEn: 'Safe to proceed IF tourniquet has been completely released and needle has not slipped out of lumen.',
    actionEs: 'Seguro proceder SI el torniquete se ha soltado por completo y la aguja sigue en vena.',
  }),

  arterial: Object.freeze({
    type: 'ARTERIAL PUNCTURE (CRITICAL EMERGENCY)',
    typeEs: 'PUNCIÓN ARTERIAL (EMERGENCIA CRÍTICA)',
    colorEn: 'BRIGHT SCARLET RED, FROTHY, HIGH PRESSURE. Blood automatically pushes the syringe plunger back out without drawing!',
    colorEs: 'ROJO ESCARLATA BRILLANTE, ESPUMOSA Y A GRAN PRESIÓN. ¡La sangre empuja el émbolo hacia fuera sola!',
    sensationEn: 'EXCRUCIATING, BURNING, ELECTRIC-SHOCK PAIN radiating down the limb into fingers or toes. Immediate pale blanching or purple discoloration of extremity.',
    sensationEs: 'DOLOR URGENTE TIPO QUEMADURA ELÉCTRICA que baja hacia los dedos. Palidez inmediata o piel fría y amoratada en la extremidad.',
    actionEn: 'DO NOT INJECT! STOP IMMEDIATELY! Pull the needle straight out. Firmly apply clean gauze or a towel with continuous direct manual pressure for AT LEAST 15 MINUTES uninterrupted (do not peek). Elevate the arm or leg above heart level. NEVER APPLY A TOURNIQUET AFTER AN ARTERIAL HIT. If bleeding does not stop after 15 minutes, or if limb becomes cold, numb, or pulseless, CALL 911 / GO TO EMERGENCY ROOM IMMEDIATELY.',
    actionEs: '¡NO INYECTE! ¡DETÉNGASE DE INMEDIATO! Retire la aguja. Presione con fuerza continua e ininterrumpida con una gasa limpia DURANTE AL MENOS 15 MINUTOS (sin mirar). Eleve el miembro por encima del corazón. NUNCA PONGA UN TORNIQUETE TRAS PUNCIÓN ARTERIAL. Si no deja de sangrar tras 15 minutos o el brazo queda frío, sin pulso o entumecido, LLAME AL 911 O ACUDA A URGENCIAS.',
  }),
});

// ============================================================================
// VASCULAR COMPLICATIONS & INFECTION DIFFERENTIAL ENGINE
// ============================================================================

export const VASCULAR_COMPLICATIONS = Object.freeze({
  dvt: Object.freeze({
    id: 'dvt',
    nameEn: 'Deep Vein Thrombosis (DVT) in Limb',
    nameEs: 'Trombosis Venosa Profunda (TVP) en Extremidad',
    severity: 'emergency_hospital',
    signsEn: 'Unilateral arm or leg swelling, persistent dull aching calf/thigh pain, warmth, erythema (redness), dilation of superficial collateral veins. Positive Homan’s sign (pain on dorsiflexion of foot).',
    signsEs: 'Hinchazón asimétrica de una sola pierna o brazo, dolor sordo y continuo, calor, enrojecimiento y venas superficiales dilatadas.',
    hazardEn: 'Clot can detach and travel to the pulmonary arterial bed, causing a FATAL PULMONARY EMBOLISM (sudden shortness of breath, pleuritic chest pain, coughing blood).',
    hazardEs: 'El trombo puede desprenderse y viajar a los pulmones causando un EMBOLISMO PULMONAR MORTAL (dificultad respiratoria súbita, dolor en pecho, tos con sangre).',
    interventionEn: 'Immediate Emergency Department duplex ultrasound. Anticoagulation therapy (DOACs / LMWH). Strict warning: NEVER massage or rub a swollen leg/arm (dislodges clot).',
    interventionEs: 'Ecografía Doppler urgente en urgencias. Anticoagulación médica. NUNCA masajear la extremidad inflamada (desprende el trombo).',
  }),

  pseudoaneurysm: Object.freeze({
    id: 'pseudoaneurysm',
    nameEn: 'Infected Arterial Pseudoaneurysm (False Aneurysm)',
    nameEs: 'Pseudoaneurisma Arterial Infectado (Falso Aneurisma)',
    severity: 'emergency_hospital',
    signsEn: 'Tender, expanding mass at or near an injection site (especially in groin, femoral, neck, or elbow crease). PALPABLE PULSATION matching the heartbeat, audible vascular whoosh (bruit) with stethoscope.',
    signsEs: 'Bulto doloroso que crece en el punto de punción (ingle, flexura o cuello). PULSACIÓN PALPABLE al ritmo del corazón y soplo vascular audible.',
    hazardEn: 'Spontaneous catastrophic arterial rupture causing fatal exsanguination within minutes. Can be tragically misdiagnosed as an abscess and incised with a scalpel, resulting in fatal hemorrhage.',
    hazardEs: 'Rotura espontánea con hemorragia arterial mortal en minutos. ¡PELIGRO: A menudo se confunde con un absceso y si se corta para drenar provoca desangrado mortal!',
    interventionEn: 'EMERGENCY VASCULAR SURGERY CONSULTATION. Mandatory CT angiography or Doppler ultrasound before any incision. Bedside needle aspiration or lancing is strictly prohibited.',
    interventionEs: 'CONSULTA URGENTE DE CIRUGÍA VASCULAR. Ecografía o angiografía obligatoria antes de tocar. Está terminantemente prohibido pinchar o cortar para drenar.',
  }),

  compartmentSyndrome: Object.freeze({
    id: 'compartment_syndrome',
    nameEn: 'Acute Compartment Syndrome',
    nameEs: 'Síndrome Compartimental Agudo',
    severity: 'emergency_hospital',
    signsEn: 'The 6 Ps: Pain out of proportion to exam, Pain on passive stretch, Pallor (pale skin), Paresthesia (numbness/pins and needles), Paralysis (inability to move digits), Pulselessness (late sign). Extremely tense, rock-hard "wooden" limb compartment.',
    signsEs: 'Las 6 P: Dolor desproporcionado, Dolor al estirar pasivamente los dedos, Palidez, Parestesias (hormigueo), Parálisis y Pérdida de pulso. Músculo a tensión extrema, duro como madera.',
    hazardEn: 'Irreversible muscle necrosis, rhabdomyolysis, renal failure, and permanent limb paralysis if tissue pressure is not relieved within 6 hours.',
    hazardEs: 'Muerte y necrosis muscular irreversible, rabdomiólisis y parálisis permanente si no se descomprime antes de 6 horas.',
    interventionEn: 'SURGICAL EMERGENCY: Emergency fasciotomy to decompress fascial compartments. Call 911 immediately.',
    interventionEs: 'EMERGENCIA QUIRÚRGICA: Fasciotomía de urgencia en quirófano. Llame al 911 de inmediato.',
  }),

  cottonFever: Object.freeze({
    id: 'cotton_fever',
    nameEn: 'Cotton Fever (Pantoea Agglomerans Endotoxin Reaction)',
    nameEs: 'Fiebre del Algodón (Reacción a Endotoxinas de Pantoea Agglomerans)',
    severity: 'supportive_monitoring',
    signsEn: 'Sudden violent shaking chills ("rigors"), spike in temperature (101–103°F / 38.5–39.5°C), pounding headache, nausea, muscle aches developing abruptly 15 to 30 minutes after injection using a non-sterile cigarette filter or cotton ball.',
    signsEs: 'Escalofríos violentos con temblor incontrolable, fiebre alta, cefalea punzante y náuseas que aparecen súbitamente 15 a 30 minutos tras inyectar usando filtros de cigarrillo o algodón.',
    hazardEn: 'Benign and self-limiting (usually resolves in 12 to 24 hours), but EASILY CONFUSED WITH LIFE-THREATENING SEPSIS OR ENDOCARDITIS. Bacterial endotoxin from cotton colonizers triggers an intense immune reaction.',
    hazardEs: 'Benigno y autolimitado (suele ceder en 12 a 24 horas), pero FÁCILMENTE CONFUNDIBLE CON SEPSIS MORTAL O ENDOCARDITIS. Causado por endotoxinas en el algodón.',
    interventionEn: 'Hydration, rest, NSAIDs/acetaminophen for fever, warm blankets. CRUCIAL CLINICAL RULE: If fever, chills, or tachycardia persist beyond 24 hours, it is NOT cotton fever—it is systemic bacteremia/sepsis or infective endocarditis requiring emergency hospital blood cultures and IV antibiotics.',
    interventionEs: 'Hidratación, mantas y paracetamol. REGLA CLÍNICA: Si la fiebre y los temblores duran más de 24 horas, NO es fiebre del algodón: es sepsis o endocarditis y exige ingreso hospitalario y antibióticos IV.',
  }),
});

// ============================================================================
// VEIN PRESERVATION & SAFE INJECTION PROTOCOLS
// ============================================================================

export const VEIN_PRESERVATION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Always Release the Tourniquet BEFORE Depressing the Plunger',
    titleEs: 'Suelte SIEMPRE el Torniquete ANTES de Inyectar',
    detailEn: 'Injecting while the tourniquet remains tied creates massive venous back-pressure. The vein wall blows out like an over-inflated balloon, causing vascular rupture, severe bruising, and forcing the drug into surrounding subcutaneous tissues ("missed shot") where it forms painful, necrotic abscesses.',
    detailEs: 'Inyectar con el torniquete apretado genera una presión venosa brutal que revienta la pared vascular y extravasa el fármaco a los tejidos circundantes, provocando abscesos necróticos.',
  },
  {
    ruleNum: 2,
    titleEn: 'Bevel Up at a 15° to 45° Angle Towards the Heart',
    titleEs: 'Bisel hacia Arriba en Ángulo de 15° a 45° hacia el Corazón',
    detailEn: 'Insert the needle with the bevel (the slanted opening) facing upward at a shallow 15° to 45° angle, pointing in the direction of blood flow (towards the torso/heart). Inserting bevel-down scrapes the delicate vascular endothelium and slices through the back wall of the vein.',
    detailEs: 'Inserte la aguja con el corte biselado mirando hacia arriba en ángulo suave (15° a 45°), apuntando hacia el corazón. Con el bisel hacia abajo se rasga la pared vascular.',
  },
  {
    ruleNum: 3,
    titleEn: 'Never "Boot" or Pump Blood Back and Forth',
    titleEs: 'Nunca Bombee («Booting») la Sangre hacia Adelante y Atrás',
    detailEn: 'Booting (drawing blood in and out of the syringe barrel repeatedly to mix it with the drug) triggers instant platelet activation and blood clot formation. Injecting these microscopic clots straight into the venous system causes acute thrombophlebitis, permanent venous sclerosis, and pulmonary micro-emboli.',
    detailEs: 'Bombear sangre hacia dentro y fuera de la jeringa activa las plaquetas y genera microcoágulos que destruyen las venas y provocan tromboflebitis y microembolias pulmonares.',
  },
  {
    ruleNum: 4,
    titleEn: 'Single-Use Sterile Syringes: Never Reuse Needles',
    titleEs: 'Uso Único Estéril: Nunca Reutilice Agujas',
    detailEn: 'Under an electron microscope, a single puncture blunts the needle tip and creates jagged microscopic fishhook barbs. Pushing a blunted, barbed needle through skin and vein tissue literally tears the vessel wall, causing track marks, scar tissue, hematomas, and rapid permanent vein loss.',
    detailEs: 'Al microscopio, una aguja usada una sola vez pierde la punta y forma ganchos y rebabas que desgarran la piel y la vena al entrar y salir, acelerando la pérdida venosa y las cicatrices.',
  },
  {
    ruleNum: 5,
    titleEn: 'Use 0.22-Micron Wheel Filters to Eliminate Bacteria and Pill Binders',
    titleEs: 'Use Filtros de Membrana de 0.22 Micras para Bacterias y Excipientes',
    detailEn: 'Standard cotton balls and cigarette filters only catch large macro-particles while shedding loose fibers into the syringe and harboring endotoxins. A sterile 0.22-micron wheel filter strains out 100% of bacteria, fungal spores, and insoluble pill binders (talc, microcrystalline cellulose, cornstarch), preventing talc granulomatosis and endocarditis.',
    detailEs: 'Los filtros de algodón no detienen bacterias ni talco y sueltan fibras. Los filtros de rueda estériles de 0.22 micras eliminan el 100% de bacterias, hongos y excipientes de pastillas.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialVeinState = () => ({
  activeTab: 'triage', // 'triage' | 'anatomy' | 'technique' | 'rehab'
  viewMode: 'community', // 'community' | 'clinical'
  selectedZone: 'green_forearm',
  hasBrightRedFrothyBlood: false,
  hasSevereBurningPain: false,
  hasUnilateralLegSwelling: false,
  hasPulsatileMassGroinOrElbow: false,
  hasPainOutOfProportionWoodenMuscle: false,
  hasFeverOver24Hours: false,
  injectingInNeckOrGroin: false,
});

let currentVeinState = initialVeinState();
const stateSubscribers = new Set();

export function getVeinState() {
  return { ...currentVeinState };
}

export function setVeinState(patch) {
  currentVeinState = { ...currentVeinState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentVeinState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetVeinState() {
  currentVeinState = initialVeinState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentVeinState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribeVeinState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateVascularRisk(state) {
  const {
    hasBrightRedFrothyBlood,
    hasSevereBurningPain,
    hasUnilateralLegSwelling,
    hasPulsatileMassGroinOrElbow,
    hasPainOutOfProportionWoodenMuscle,
    hasFeverOver24Hours,
    injectingInNeckOrGroin,
  } = state;

  // 1. Critical Arterial Puncture
  if (hasBrightRedFrothyBlood || hasSevereBurningPain) {
    return {
      tier: 'emergency_arterial',
      titleEn: 'CRITICAL VASCULAR EMERGENCY: Inadvertent Arterial Puncture / Injection',
      titleEs: 'EMERGENCIA VASCULAR CRÍTICA: Punción o Inyección Arterial Inadvertida',
      isEmergency: true,
      actionEn: 'DO NOT INJECT! WITHDRAW THE NEEDLE IMMEDIATELY. Bright red blood pushing the plunger and excruciating burning pain indicate you have hit an artery. Apply firm continuous manual pressure with a clean cloth for AT LEAST 15 MINUTES without peeking. Elevate the limb. NEVER apply a tourniquet. If bleeding does not stop after 15 minutes or if hand/foot becomes cold, pale, numb, or pulseless, CALL 911 / GO TO EMERGENCY ROOM IMMEDIATELY.',
      actionEs: '¡NO INYECTE! RETIRE LA AGUJA DE INMEDIATO. La sangre roja brillante a presión y el dolor ardiente indican punción arterial. Presione con un paño limpio de forma continua DURANTE AL MENOS 15 MINUTOS ininterrumpidos. Eleve la extremidad. NUNCA ponga un torniquete. Si no cesa el sangrado o la mano/pie se enfría, acuda a urgencias o llame al 911.',
      interventionEn: 'Immediate manual compression, vascular Doppler evaluation, assessment of distal arterial perfusion, monitoring for compartment syndrome or acute limb ischemia.',
      interventionEs: 'Compresión manual continua, ecografía Doppler vascular y control de perfusión periférica.',
    };
  }

  // 2. Pseudoaneurysm or Compartment Syndrome
  if (hasPulsatileMassGroinOrElbow || hasPainOutOfProportionWoodenMuscle) {
    return {
      tier: 'emergency_surgical',
      titleEn: hasPulsatileMassGroinOrElbow
        ? 'SURGICAL VASCULAR EMERGENCY: Suspected Infected Arterial Pseudoaneurysm'
        : 'SURGICAL ORTHOPEDIC EMERGENCY: Suspected Acute Compartment Syndrome',
      titleEs: hasPulsatileMassGroinOrElbow
        ? 'EMERGENCIA QUIRÚRGICA VASCULAR: Sospecha de Pseudoaneurisma Arterial'
        : 'EMERGENCIA QUIRÚRGICA: Sospecha de Síndrome Compartimental Agudo',
      isEmergency: true,
      actionEn: hasPulsatileMassGroinOrElbow
        ? 'DO NOT DRAIN, CUT, OR LANCE THIS LUMP. A pulsating or whooshing mass is an arterial pseudoaneurysm, NOT an ordinary abscess. Cutting into it causes rapid fatal exsanguination. Proceed immediately to the nearest Emergency Department for vascular surgery consultation.'
        : 'Pain out of proportion with a rock-hard "wooden" muscle compartment and numbness indicates Compartment Syndrome. Irreversible nerve and muscle death occurs within 6 hours without emergency surgical fasciotomy. Call 911 or go to an Emergency Department immediately.',
      actionEs: hasPulsatileMassGroinOrElbow
        ? '¡NO DRENE NI CORTE ESTE BULTO! Un bulto que late es un pseudoaneurisma arterial, NO un absceso normal. Cortarlo provoca una hemorragia arterial mortal en minutos. Acuda de inmediato a urgencias.'
        : 'El dolor desproporcionado con músculo duro y entumecimiento indica síndrome compartimental. La muerte muscular es irreversible a las 6 horas sin cirugía de fasciotomía urgente.',
      interventionEn: 'Emergency Doppler ultrasound / CT angiography; emergent vascular repair or surgical fasciotomy decompression.',
      interventionEs: 'Angio-TC o ecografía Doppler urgente; reparación quirúrgica o fasciotomía descompresiva.',
    };
  }

  // 3. Deep Vein Thrombosis (DVT) or Persistent Sepsis
  if (hasUnilateralLegSwelling || hasFeverOver24Hours) {
    return {
      tier: 'emergency_medical',
      titleEn: hasUnilateralLegSwelling
        ? 'URGENT VASCULAR ALERT: Suspected Deep Vein Thrombosis (DVT)'
        : 'CRITICAL INFECTION ALERT: Suspected Systemic Sepsis or Infective Endocarditis',
      titleEs: hasUnilateralLegSwelling
        ? 'ALERTA VASCULAR URGENTE: Sospecha de Trombosis Venosa Profunda (TVP)'
        : 'ALERTA DE INFECCIÓN CRÍTICA: Sospecha de Sepsis o Endocarditis Infecciosa',
      isEmergency: true,
      actionEn: hasUnilateralLegSwelling
        ? 'A swollen, tender, hot leg or arm indicates a deep venous clot (DVT). DO NOT MASSAGE OR RUB THE LIMB (massaging dislodges the clot into the lungs causing a fatal Pulmonary Embolism). Immediate Emergency Department venous ultrasound and anticoagulation are required.'
        : 'Fever, shaking rigors, or chills lasting longer than 24 hours is NOT benign cotton fever—it is a life-threatening bloodstream infection (sepsis) or heart valve infection (endocarditis). Immediate hospital blood cultures and IV antibiotics are mandatory.',
      actionEs: hasUnilateralLegSwelling
        ? 'Una extremidad hinchada, caliente y dolorosa alerta de trombosis venosa profunda. NO MASAJEE EL MIEMBRO (puede soltar el coágulo a los pulmones causando embolismo mortal). Acuda a urgencias para ecografía y anticoagulantes.'
        : 'La fiebre y escalofríos de más de 24 horas NO son fiebre del algodón; es una infección en sangre (sepsis) o en el corazón (endocarditis). Requiere hemocultivos y antibióticos IV urgentes.',
      interventionEn: 'Venous duplex ultrasound, therapeutic anticoagulation (DOAC / enoxaparin), blood cultures x 2, transthoracic echocardiogram (TTE).',
      interventionEs: 'Ecografía Doppler venosa, anticoagulación terapéutica, hemocultivos y ecocardiograma.',
    };
  }

  // 4. High-Risk Anatomical Injection (Neck/Groin)
  if (injectingInNeckOrGroin) {
    return {
      tier: 'high_hazard_anatomy',
      titleEn: 'HIGH HAZARD ANATOMICAL SITE: Neck or Groin Injection Warning',
      titleEs: 'ZONA ANATÓMICA DE ALTO PELIGRO: Advertencia de Inyección en Cuello o Ingle',
      isEmergency: false,
      actionEn: 'Injecting into the neck or groin carries catastrophic risks of carotid or femoral artery laceration, stroke, airway collapse, and leg amputation. Harm reduction recommendation: transition to safer alternative routes (smoking, boofing/rectal, or snorting) to allow damaged arm veins to heal and rehabilitate.',
      actionEs: 'Inyectar en cuello o ingle conlleva peligro de desangrado arterial carotídeo o femoral, ictus y pérdida de la pierna. Se recomienda rotar a vías no invasivas (fumar, vía rectal o inhalar) para dar descanso y rehabilitar el lecho venoso.',
      interventionEn: 'Safer injection education, supply provision with 0.22-micron wheel filters, referral to syringe service programs (SSP) and wound clinics.',
      interventionEs: 'Educación en reducción de daños, filtros de membrana de 0.22 micras y derivación a centros de reducción de daños.',
    };
  }

  // 5. Standard Vein Preservation & Harm Reduction Guidance
  return {
    tier: 'safe_practice',
    titleEn: 'Standard Vein Preservation & Injection Harm Reduction Guidance',
    titleEs: 'Pautas Estándar de Preservación Venosa y Reducción de Daños',
    isEmergency: false,
    actionEn: 'Veins in the forearm and upper arm are currently stable. Always release the tourniquet BEFORE depressing the plunger, insert bevel-up at 15–45°, never reuse needles or pump blood ("booting"), and utilize 0.22-micron wheel filters to prevent abscesses and cotton fever.',
    actionEs: 'Las venas del antebrazo se encuentran estables. Suelte siempre el torniquete ANTES de inyectar, inserte con el bisel hacia arriba en ángulo suave, no reutilice agujas ni bombee sangre, y use filtros de rueda para evitar abscesos.',
    interventionEn: 'Ongoing vein rotation, hydration, warm compresses, and non-judgmental healthcare engagement.',
    interventionEs: 'Rotación sistemática de puntos, hidratación, compresas templadas y atención médica no punitiva.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildVeinSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();
  const zone = INJECTION_ANATOMICAL_ZONES[state.selectedZone] || INJECTION_ANATOMICAL_ZONES.greenForearm;

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: EVALUACIÓN VASCULAR, CUIDADO DE VENAS Y TRIAJE',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      `Presentación para evaluación vascular por inyección en: ${zone.nameEs}.`,
      `Nivel de riesgo clínico: ${evaluation.titleEs}.`,
      `Urgencia médica evaluada: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA / QUIRÚRGICA' : 'PRESERVACIÓN VENOSA Y REDUCCIÓN DE DAÑOS'}.`,
      '',
      'B (ANTECEDENTES / FACTORES VASCULARES):',
      `- Zona anatómica elegida: ${zone.nameEs} (${zone.riskLevelEs}).`,
      `- Sangre roja brillante o dolor urente (Punción arterial): ${state.hasBrightRedFrothyBlood || state.hasSevereBurningPain ? 'SÍ (ALERTA DE PUNCIÓN ARTERIAL)' : 'No'}.`,
      `- Hinchazón unilateral en pierna/brazo (Sospecha de TVP): ${state.hasUnilateralLegSwelling ? 'SÍ (EVALUAR TVP CON ECO-DOPPLER)' : 'No'}.`,
      `- Bulto pulsátil en ingle/flexura (Sospecha de pseudoaneurisma): ${state.hasPulsatileMassGroinOrElbow ? 'SÍ (NO DRENAR - ALERTA QUIRÚRGICA)' : 'No'}.`,
      `- Músculo leñoso a tensión y dolor extremo (Síndrome compartimental): ${state.hasPainOutOfProportionWoodenMuscle ? 'SÍ (URGENCIA DE FASCIOTOMÍA)' : 'No'}.`,
      `- Fiebre o escalofríos > 24 horas (Sepsis vs Fiebre del algodón): ${state.hasFeverOver24Hours ? 'SÍ (DESCARTAR ENDOCARDITIS)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y MANEJO CLÍNICO):',
      '1. Si hay bulto pulsátil: NUNCA punzar ni incidir a ciegas; ecografía Doppler o angio-TC obligatoria.',
      '2. Si hay sospecha de TVP: Iniciar anticoagulación según protocolo y prohibir masaje de la extremidad.',
      '3. En punción arterial: Compresión manual directa ininterrumpida >= 15 min; NUNCA aplicar torniquete.',
      '4. Promover el uso de filtros de rueda de 0.22 micras y soltar el torniquete ANTES de inyectar para evitar rotura venosa.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'VASCULAR HEALTH, VEIN CARE & COMPLICATION TRIAGE SBAR NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    `Presentation for vascular evaluation related to injection in: ${zone.nameEn}.`,
    `Clinical Presentation: ${evaluation.titleEn}.`,
    `Safety Urgency: ${evaluation.isEmergency ? 'MEDICAL / SURGICAL EMERGENCY' : 'VEIN PRESERVATION & HARM REDUCTION'}.`,
    '',
    'B (BACKGROUND / VASCULAR RISK FACTORS):',
    `- Reported Anatomical Site: ${zone.nameEn} (${zone.riskLevelEn}).`,
    `- Bright scarlet blood or burning pain (Arterial hit): ${state.hasBrightRedFrothyBlood || state.hasSevereBurningPain ? 'YES (CRITICAL ARTERIAL PUNCTURE HAZARD)' : 'No'}.`,
    `- Unilateral limb swelling / pain (Suspected DVT): ${state.hasUnilateralLegSwelling ? 'YES (EVALUATE DVT VIA DUPLEX ULTRASOUND)' : 'No'}.`,
    `- Pulsatile mass in groin/elbow (Suspected pseudoaneurysm): ${state.hasPulsatileMassGroinOrElbow ? 'YES (DO NOT INCISE - VASCULAR SURGERY ALERT)' : 'No'}.`,
    `- Tense wooden compartment & extreme pain (Compartment syndrome): ${state.hasPainOutOfProportionWoodenMuscle ? 'YES (EMERGENT FASCIOTOMY EVALUATION)' : 'No'}.`,
    `- Fever or rigors lasting > 24 hours (Sepsis vs Cotton fever): ${state.hasFeverOver24Hours ? 'YES (EVALUATE BACTEREMIA / ENDOCARDITIS)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Clinical Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & VASCULAR MANAGEMENT):',
    '1. If pulsatile groin/crease mass: NEVER aspirate or incise blindly; order urgent Doppler ultrasound / CT angiography.',
    '2. If unilateral limb swelling: Initiate therapeutic anticoagulation per protocol; DO NOT massage swollen extremity.',
    '3. If arterial hit: Direct continuous manual compression >= 15 min; NEVER apply a tourniquet after arterial hit.',
    '4. Advocate 0.22-micron wheel filtration and releasing tourniquet BEFORE plunging to prevent venous extravasation.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function veinCareView() {
  const container = h('div', { class: 'vein-care-view' });

  function render() {
    clear(container);
    const state = getVeinState();
    const evaluation = evaluateVascularRisk(state);

    // Header Banner
    const header = h('header', { class: 'vc-header' }, [
      h('div', { class: 'vc-header-badge' }, [
        icon('activity'),
        h('span', {}, t('vc.header.badge', 'Vascular Health & Injection Harm Reduction')),
      ]),
      h('h1', { class: 'vc-header-title' }, t('vc.header.title', 'Vein Care, Vascular Health & Injection Anatomy')),
      h('p', { class: 'vc-header-desc' }, t('vc.header.desc', 'Evidence-based clinical decision support and harm reduction standards from HRC, WHO, and Vascular Surgery: anatomical injection risk zones, arterial puncture emergency de-escalation, DVT and pseudoaneurysm triage, and venous preservation techniques.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'vc-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        class: `vc-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setVeinState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('vc.mode.community', 'Community & Peer Mode (Vein Preservation & Arterial Hit Safety)')),
      ]),
      h('button', {
        class: `vc-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setVeinState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('vc.mode.clinical', 'Clinician & Street Medicine Mode (DVT, Pseudoaneurysms & SBAR)')),
      ]),
    ]);

    // Navigation Tabs
    const tabsList = h('div', { class: 'vc-tabs-nav', role: 'tablist', 'aria-label': 'Vein Care Tabs' }, [
      h('button', {
        class: `vc-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setVeinState({ activeTab: 'triage' }),
      }, t('vc.tabs.triage', 'Vascular Complication Triage')),
      h('button', {
        class: `vc-tab-btn ${state.activeTab === 'anatomy' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'anatomy' ? 'true' : 'false',
        onclick: () => setVeinState({ activeTab: 'anatomy' }),
      }, t('vc.tabs.anatomy', 'Anatomical Injection Risk Zones')),
      h('button', {
        class: `vc-tab-btn ${state.activeTab === 'technique' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'technique' ? 'true' : 'false',
        onclick: () => setVeinState({ activeTab: 'technique' }),
      }, t('vc.tabs.technique', 'Safer Technique & Filtration')),
      h('button', {
        class: `vc-tab-btn ${state.activeTab === 'rehab' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'rehab' ? 'true' : 'false',
        onclick: () => setVeinState({ activeTab: 'rehab' }),
      }, t('vc.tabs.rehab', 'Vein Healing & Non-Injection Routes')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'anatomy':
        tabContent = renderAnatomyTab();
        break;
      case 'technique':
        tabContent = renderTechniqueTab();
        break;
      case 'rehab':
        tabContent = renderRehabTab();
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
    const section = h('section', { class: 'vc-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'vc-inputs-grid' }, [
      // 1. Zone Selector
      h('div', { class: 'input-card' }, [
        h('label', { for: 'vc-select-zone', class: 'input-label' }, t('vc.label.zone', '1. Primary Injection Body Area')),
        h('select', {
          id: 'vc-select-zone',
          class: 'vc-select',
          onchange: (e) => setVeinState({ selectedZone: e.target.value }),
        }, [
          h('option', { value: 'green_forearm', selected: state.selectedZone === 'green_forearm' }, t('vc.opt.forearm', 'Forearm / Inside Elbow (Safer Green Zone)')),
          h('option', { value: 'yellow_hands', selected: state.selectedZone === 'yellow_hands' }, t('vc.opt.hands', 'Dorsum of Hands / Wrists (Fragile Yellow Zone)')),
          h('option', { value: 'red_neck', selected: state.selectedZone === 'red_neck' }, t('vc.opt.neck', 'Neck / Jugular Vein (EXTREME DANGER Red Zone)')),
          h('option', { value: 'red_groin', selected: state.selectedZone === 'red_groin' }, t('vc.opt.groin', 'Groin / Femoral Vein (EXTREME DANGER Red Zone)')),
          h('option', { value: 'red_legs_feet', selected: state.selectedZone === 'red_legs_feet' }, t('vc.opt.legs', 'Legs / Ankles / Feet (Venous Stasis Red Zone)')),
        ]),
      ]),

      // 2. Bright Red Frothy Blood Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasBrightRedFrothyBlood,
            onchange: (e) => setVeinState({ hasBrightRedFrothyBlood: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('vc.check.brightRedStrong', 'Bright Scarlet Red Blood Pushing Plunger Out? ')),
            t('vc.check.brightRedDetail', '(Critical: Arterial puncture warning)'),
          ]),
        ]),
      ]),

      // 3. Severe Burning Pain Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSevereBurningPain,
            onchange: (e) => setVeinState({ hasSevereBurningPain: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('vc.check.burnStrong', 'Intense Burning or Electric Pain Shooting Down Limb? ')),
            t('vc.check.burnDetail', '(Arterial or nerve hit warning)'),
          ]),
        ]),
      ]),

      // 4. Unilateral Leg Swelling (DVT)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasUnilateralLegSwelling,
            onchange: (e) => setVeinState({ hasUnilateralLegSwelling: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('vc.check.dvtStrong', 'One Leg or Arm Swollen, Hot, Red, or Aching? ')),
            t('vc.check.dvtDetail', '(Suspected Deep Vein Thrombosis / DVT)'),
          ]),
        ]),
      ]),

      // 5. Pulsatile Mass in Groin/Elbow
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasPulsatileMassGroinOrElbow,
            onchange: (e) => setVeinState({ hasPulsatileMassGroinOrElbow: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('vc.check.pseudoStrong', 'Tender Lump That Pulses or Beats with Your Heart? ')),
            t('vc.check.pseudoDetail', '(Arterial pseudoaneurysm: DO NOT DRAIN OR CUT)'),
          ]),
        ]),
      ]),

      // 6. Wooden Muscle / Severe Pain (Compartment Syndrome)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasPainOutOfProportionWoodenMuscle,
            onchange: (e) => setVeinState({ hasPainOutOfProportionWoodenMuscle: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('vc.check.compStrong', 'Extremely Tight, Rock-Hard "Wooden" Muscle with Numbness? ')),
            t('vc.check.compDetail', '(Surgical emergency: Compartment Syndrome)'),
          ]),
        ]),
      ]),

      // 7. Fever & Shaking Rigors > 24 Hours
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasFeverOver24Hours,
            onchange: (e) => setVeinState({ hasFeverOver24Hours: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('vc.check.feverStrong', 'Fever, Chills, or Shaking Rigors Lasting Over 24 Hours? ')),
            t('vc.check.feverDetail', '(Not cotton fever: Sepsis or Endocarditis warning)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `vc-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'vc-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'vc-result-details' }, [
        h('div', { class: 'vc-rec-item' }, [
          h('strong', {}, t('vc.res.action', 'Clinical & Harm Reduction Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'vc-rec-item' }, [
          h('strong', {}, t('vc.res.intervention', 'Recommended Medical Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // Arterial vs Venous Comparison Card
    const diffCard = h('div', { class: 'arterial-diff-card' }, [
      h('h3', {}, t('vc.diff.title', 'Bedside Quick Reference: Arterial Puncture vs Venous Access')),
      h('div', { class: 'diff-table-wrap' }, [
        h('table', { class: 'diff-table' }, [
          h('thead', {}, [
            h('tr', {}, [
              h('th', {}, 'Feature'),
              h('th', {}, 'Venous Blood (Safe Target)'),
              h('th', { class: 'col-danger' }, 'Arterial Blood (CRITICAL HAZARD)'),
            ]),
          ]),
          h('tbody', {}, [
            h('tr', {}, [
              h('td', {}, h('strong', {}, 'Blood Color & Pressure')),
              h('td', {}, VASCULAR_ACCESS_DIFFERENTIAL.venous.colorEn),
              h('td', { class: 'col-danger' }, VASCULAR_ACCESS_DIFFERENTIAL.arterial.colorEn),
            ]),
            h('tr', {}, [
              h('td', {}, h('strong', {}, 'Physical Sensation')),
              h('td', {}, VASCULAR_ACCESS_DIFFERENTIAL.venous.sensationEn),
              h('td', { class: 'col-danger' }, VASCULAR_ACCESS_DIFFERENTIAL.arterial.sensationEn),
            ]),
            h('tr', {}, [
              h('td', {}, h('strong', {}, 'Immediate Action Required')),
              h('td', {}, VASCULAR_ACCESS_DIFFERENTIAL.venous.actionEn),
              h('td', { class: 'col-danger' }, VASCULAR_ACCESS_DIFFERENTIAL.arterial.actionEn),
            ]),
          ]),
        ]),
      ]),
    ]);

    // SBAR Export Card
    const sbarCard = h('div', { class: 'vc-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('vc.sbar.title', 'Zero-PII Vascular Clinical Handoff & Triage Note Generator')),
        h('div', { class: 'sbar-actions' }, [
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildVeinSbarText(state, evaluation, 'en');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('vc.sbar.copyEn', 'Copy Clinical SBAR (English)'))]),
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildVeinSbarText(state, evaluation, 'es');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('vc.sbar.copyEs', 'Copiar SBAR (Español)'))]),
        ]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildVeinSbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(diffCard);
    section.appendChild(sbarCard);
    return section;
  }

  function renderAnatomyTab() {
    const section = h('section', { class: 'vc-anatomy-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'vc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('vc.anat.heading', 'Anatomical Injection Risk Stratification: Green, Yellow & Red Zones')),
      h('p', { class: 'tab-subtitle' }, t('vc.anat.subtitle', 'A comprehensive anatomical roadmap designed to protect nerves, prevent catastrophic arterial bleeding, and prevent chronic venous ulcers.')),
    ]);

    const zonesGrid = h('div', { class: 'vc-zones-grid' }, Object.values(INJECTION_ANATOMICAL_ZONES).map((zone) => h('div', { class: `vc-zone-card ${zone.tier}` }, [
      h('div', { class: `zone-badge ${zone.tier}` }, zone.riskLevelEn),
      h('h3', { class: 'zone-title' }, zone.nameEn),
      h('p', { class: 'zone-rationale' }, zone.clinicalRationaleEn),
      h('h4', {}, 'Key Harm Reduction Directives:'),
      h('ul', { class: 'zone-directives-list' }, zone.keyDirectivesEn.map((d) => h('li', {}, d))),
    ])));

    section.appendChild(introCard);
    section.appendChild(zonesGrid);
    return section;
  }

  function renderTechniqueTab() {
    const section = h('section', { class: 'vc-technique-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'vc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('vc.tech.heading', 'Safer Injection Technique, Tourniquet Physics & 0.22-Micron Filtration')),
      h('p', { class: 'tab-subtitle' }, t('vc.tech.subtitle', 'Evidence-based biomechanical rules to prevent venous rupture, avoid missed shots, and eliminate cotton fever endotoxins.')),
    ]);

    const rulesGrid = h('div', { class: 'vc-rules-grid' }, VEIN_PRESERVATION_RULES.map((rule) => h('div', { class: 'vc-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${rule.ruleNum}`),
      h('h3', {}, rule.titleEn),
      h('p', {}, rule.detailEn),
    ])));

    // Cotton Fever vs Sepsis Card
    const cottonCard = h('div', { class: 'cotton-fever-card' }, [
      icon('alert'),
      h('div', {}, [
        h('h3', {}, 'COTTON FEVER VS SYSTEMIC SEPSIS / ENDOCARDITIS'),
        h('p', {}, 'Cotton fever is a sudden endotoxin reaction to Pantoea agglomerans bacteria in cotton filters, causing violent shaking chills within 15–30 minutes of injection that spontaneously resolves within 12–24 hours. CRITICAL WARNING: If fever, chills, or shortness of breath last longer than 24 hours, it is NOT cotton fever—it is bacteremia, sepsis, or infective endocarditis requiring immediate blood cultures, IV antibiotics, and hospitalization.'),
      ]),
    ]);

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    section.appendChild(cottonCard);
    return section;
  }

  function renderRehabTab() {
    const section = h('section', { class: 'vc-rehab-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'vc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('vc.rehab.heading', 'Vein Healing, Vascular Rehabilitation & Alternative Routes')),
      h('p', { class: 'tab-subtitle' }, t('vc.rehab.subtitle', 'When veins become sclerosed or collapsed, resting and transitioning to non-injection routes saves limbs and restores vascular health.')),
    ]);

    const rehabGrid = h('div', { class: 'vc-rehab-grid' }, [
      h('div', { class: 'rehab-card' }, [
        h('h3', {}, '1. Warm Compresses & Hydration'),
        h('p', {}, 'Apply a clean, warm, moist towel over the injection site for 10–15 minutes twice daily. Warmth stimulates peripheral vasodilation, increases localized circulation, and accelerates tissue healing after minor bruising or missed shots. Drink at least 2 liters of water daily to maintain full vascular volume.'),
      ]),
      h('div', { class: 'rehab-card' }, [
        h('h3', {}, '2. The 48-Hour Rotation Rule'),
        h('p', {}, 'Never inject into the same puncture mark consecutively. After accessing a vein, move at least 1 inch (2.5 cm) further up the arm towards the heart for the next injection. Allow puncture sites at least 48 to 72 hours of uninterrupted rest to allow the vascular endothelial plug to heal without scarring.'),
      ]),
      h('div', { class: 'rehab-card' }, [
        h('h3', {}, '3. Switching to Non-Injection Routes'),
        h('p', {}, 'When arm veins become exhausted, attempting neck or groin injections carries life-threatening risks. Transitioning to non-injection modalities saves limbs:'),
        h('ul', {}, [
          h('li', {}, h('strong', {}, 'Inhalation / Smoking: '), 'Rapid onset via pulmonary alveolar capillaries with zero vascular damage.'),
          h('li', {}, h('strong', {}, 'Boofing / Rectal Administration: '), 'Dissolve in 1 mL sterile water; administer 2–3 cm into rectum using a needleless syringe. High bioavailability (~80%) and rapid onset without needle trauma.'),
          h('li', {}, h('strong', {}, 'Intranasal / Snorting: '), 'Bypasses veins completely; ensure saline spray is used to protect nasal mucosa.'),
        ]),
      ]),
    ]);

    section.appendChild(introCard);
    section.appendChild(rehabGrid);
    const endocarditisCard = h('div', { class: 'rehab-card mt-3' }, [
      h('h3', {}, '4. Protecting Heart Valves & Preventing Endocarditis'),
      h('p', {}, 'Particulate matter (crushed pill binders, talc) and non-sterile injection shear tricuspid valve leaflets, predisposing to bacterial seeding: '),
      h('p', {}, [
        h('a', { href: '#/endocarditis-care', class: 'btn btn-secondary' }, 'Open Infective Endocarditis & Valve Protection Navigator →'),
      ]),
    ]);
    section.appendChild(endocarditisCard);
    return section;
  }

  // Subscribe to state changes and initial render
  const unsubscribe = subscribeVeinState(() => render());
  render();

  return container;
}
