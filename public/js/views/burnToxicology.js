// public/js/views/burnToxicology.js
// HarborPath - Burn Resuscitation, Toxic Chemical Exposure & Inhalation Injury Navigator
// Clinical Consensus: American Burn Association (ABA) 2023/2024 Practice Guidelines on Fluid Resuscitation,
// American College of Medical Toxicology (ACMT) Chemical & Hydrofluoric Acid Consensus,
// American Thoracic Society (ATS) Smoke Inhalation & Toxic Gas Consensus,
// Rome IV / AAN Cannabinoid Hyperemesis Syndrome (CHS) TRPV1 Scald Protocols.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL TAXONOMY & CONSENSUS CONSTANTS
// ============================================================================

export const ABA_BURN_CRITERIA = Object.freeze({
  ADULT_THERMAL_FACTOR: 2, // 2 mL / kg / % TBSA Lactated Ringer's
  PEDIATRIC_FACTOR: 3,     // 3 mL / kg / % TBSA Lactated Ringer's + maintenance dextrose
  ELECTRICAL_FACTOR: 4,    // 4 mL / kg / % TBSA Lactated Ringer's (electrical / rhabdomyolysis)
  ADULT_URINE_TARGET_ML_PER_KG_HR: 0.5, // 0.5 mL/kg/hr (30-50 mL/hr)
  PEDIATRIC_URINE_TARGET_ML_PER_KG_HR: 1.0, // 1.0 mL/kg/hr
  ELECTRICAL_URINE_TARGET_ML_PER_KG_HR: 1.5, // 1.0 - 1.5 mL/kg/hr (75-100 mL/hr)
  HIGH_RISK_TBSA_THRESHOLD: 20, // >= 20% TBSA requires formal Parkland/ABA resuscitation
  SEVERE_TBSA_THRESHOLD: 40,    // >= 40% TBSA triggers urgent intubation & critical transfer
});

export const BURN_EXPOSURE_PROTOCOLS = Object.freeze({
  thermal: Object.freeze({
    id: 'thermal',
    nameEn: 'Thermal Flame / Scald / Contact Burn',
    nameEs: 'Quemadura Térmica por Llama / Escaldadura / Contacto',
    categoryEn: 'Thermal Injury',
    categoryEs: 'Lesión Térmica',
    firstAidEn: 'Stop the burning process immediately. Cool with clean, room-temperature or cool running tap water for 10-20 minutes (never apply ice or freezing water, which induces dermal vasoconstriction and extends tissue necrosis). Remove constricting jewelry, belts, and rings before swelling develops. Cover loosely with clean dry sheet or sterile non-adherent dressing. Keep patient warm to prevent hypothermia.',
    firstAidEs: 'Detenga el proceso de quemadura de inmediato. Enfríe con agua corriente a temperatura ambiente durante 10-20 minutos (nunca aplique hielo, ya que causa vasoconstricción y agrava la necrosis tisular). Retire joyas, cinturones y anillos antes de que aparezca inflamación. Cubra holgadamente con una sábana limpia y seca. Mantenga caliente al paciente para prevenir hipotermia.',
    antidoteEn: 'No chemical antidote. Crystalloid fluid resuscitation (Lactated Ringer’s preferred over 0.9% Normal Saline to avoid hyperchloremic non-anion gap metabolic acidosis). Analgesia with IV opioids or multimodal analgesia.',
    antidoteEs: 'Sin antídoto químico. Reanimación hídrica con cristaloides (se prefiere Ringer Lactato sobre solución salina al 0.9% para evitar acidosis metabólica hiperclorémica). Analgesia multimodal.',
    pearlEn: 'Rule of Nines applies only to 2nd-degree (partial thickness, blistering) and 3rd-degree (full thickness, leathery/eschar) burns. Strictly EXCLUDE 1st-degree burns (superficial erythema without blisters) from % TBSA calculations.',
    pearlEs: 'La Regla de los Nueves aplica únicamente a quemaduras de 2.º grado (espesor parcial con ampollas) y 3.er grado (espesor total/escara). EXCLUYA estrictamente las quemaduras de 1.er grado (eritema superficial sin ampollas) del cálculo de % SCTQ.',
  }),

  hydrofluoric: Object.freeze({
    id: 'hydrofluoric',
    nameEn: 'Hydrofluoric Acid (HF) Chemical Exposure',
    nameEs: 'Exposición Química a Ácido Fluorhídrico (HF)',
    categoryEn: 'Corrosive & Chelating Acid',
    categoryEs: 'Ácido Corrosivo y Quelante',
    firstAidEn: 'Continuous copious water irrigation for 15 minutes minimum. Immediately remove all contaminated clothing wearing double nitrile gloves. DO NOT delay calcium therapy for prolonged washing.',
    firstAidEs: 'Irrigación continua y copiosa con agua durante al menos 15 minutos. Retire de inmediato toda la ropa contaminada usando doble guante de nitrilo. NO retrase la terapia con calcio por un lavado prolongado.',
    antidoteEn: 'Topical 2.5% Calcium Gluconate gel massaged vigorously into burned tissue until pain completely resolves. If gel unavailable, mix 1 ampule 10% Calcium Gluconate (10 mL) into 100g water-soluble surgical lubricant. If pain persists beyond 30-45 minutes: regional IV Bier block or intra-arterial calcium infusion. Prohibit subcutaneous calcium chloride (causes massive dermal necrosis). Immediate 12-lead ECG; check serum ionized Calcium, Magnesium, and Potassium.',
    antidoteEs: 'Gel tópico de gluconato de calcio al 2.5% masajeado vigorosamente hasta que el dolor cese por completo. Si no dispone de gel comercial, mezcle 1 ampolleta de gluconato de calcio al 10% (10 mL) en 100 g de lubricante estéril hidrosoluble. Si el dolor persiste > 30-45 min: bloqueo regional IV de Bier o infusión intraarterial. Prohíba el cloruro de calcio subcutáneo (necrosis dérmica severa). ECG de 12 derivaciones urgente; vigile calcio iónico, magnesio y potasio séricos.',
    pearlEn: 'Fluoride ions rapidly penetrate cell membranes and chelate intracellular calcium and magnesium, disabling ATP synthesis. Hallmark is severe, excruciating, intractable pain out of proportion to physical appearance. Systemic toxicity can trigger refractory Ventricular Fibrillation and sudden cardiac arrest.',
    pearlEs: 'Los iones fluoruro penetran rápidamente y quelan el calcio y magnesio intracelulares. El signo cardinal es dolor insoportable desproporcionado con respecto al aspecto de la lesión. La toxicidad sistémica desencadena fibrilación ventricular refractaria y paro cardíaco súbito.',
  }),

  ammonia: Object.freeze({
    id: 'ammonia',
    nameEn: 'Anhydrous Ammonia & Strong Alkalis',
    nameEs: 'Amoníaco Anhidro y Álcalis Fuertes',
    categoryEn: 'Corrosive Caustic Base',
    categoryEs: 'Base Cáustica Corrosiva',
    firstAidEn: 'Continuous copious, low-pressure water or normal saline irrigation for a MINIMUM of 30 to 60 minutes. For ocular exposure: continuous eye irrigation using Morgan lens until tear film pH returns to neutral (pH 7.0 - 7.4). Check pH with litmus/pH paper 5 minutes post-irrigation to ensure stable neutrality.',
    firstAidEs: 'Irrigación continua, copiosa y a baja presión con agua o solución salina durante un MÍNIMO de 30 a 60 minutos. En exposición ocular: irrigación continua con lente de Morgan hasta neutralizar el pH lagrimal (7.0 - 7.4). Mida el pH con tiras reactivas 5 minutos después de suspender para verificar neutralidad estable.',
    antidoteEn: 'Copious crystalloid irrigation is the definitive antidote. ABSOLUTE CONTRAINDICATION: NEVER attempt chemical neutralization with vinegar, acetic acid, or citrus (produces a massive exothermic reaction releasing destructive thermal energy that causes severe secondary burns).',
    antidoteEs: 'La irrigación copiosa con cristaloides es el tratamiento definitivo. CONTRAINDICACIÓN ABSOLUTA: NUNCA intente neutralización química con vinagre, ácido acético o jugos cítricos (provoca una reacción exotérmica que genera calor destructivo y quemaduras térmicas secundarias graves).',
    pearlEn: 'Alkalis cause liquefaction necrosis, saponifying lipids and destroying cellular membranes, which allows alkaline chemicals to penetrate deeply into tissues over hours. In clandestine methamphetamine manufacturing, compressed anhydrous ammonia can also cause catastrophic cryogenic freeze burns and toxic respiratory edema.',
    pearlEs: 'Los álcalis provocan necrosis por licuefacción, saponificando lípidos y destruyendo membranas, lo que permite una penetración profunda continuada durante horas. En síntesis clandestina de metanfetamina, el amoníaco comprimido también causa quemaduras criogénicas por congelación y edema laríngeo agudo.',
  }),

  phosphorus: Object.freeze({
    id: 'phosphorus',
    nameEn: 'Red & Yellow Phosphorus Exposures',
    nameEs: 'Exposiciones a Fósforo Rojo y Amarillo',
    categoryEn: 'Pyrophoric Chemical Hazard',
    categoryEs: 'Peligro Químico Pirofórico',
    firstAidEn: 'IMMEDIATELY submerge affected area in water or cover completely with continuous wet, saline-soaked gauze dressings. Phosphorus spontaneously ignites upon contact with atmospheric oxygen. Prohibit dry dressings and oil-based ointments.',
    firstAidEs: 'Sumerja DE INMEDIATO el área afectada en agua o cúbrala continuamente con gasas empapadas en solución salina. El fósforo arde espontáneamente al contacto con el oxígeno ambiental. Prohíba los vendajes secos y los ungüentos oleosos.',
    antidoteEn: 'Examine wounds in a darkened room using a Wood’s lamp / ultraviolet light (phosphorus particles fluoresce luminescent green/yellow). Mechanically debride all fluorescent particles with forceps while irrigating with cold water. Avoid copper sulfate solutions (historical antidote abandoned due to lethal intravascular hemolysis and renal failure).',
    antidoteEs: 'Examine las heridas en un cuarto oscuro con lámpara de Wood / luz ultravioleta (las partículas de fósforo emiten fluorescencia amarillenta/verdosa). Desbride mecánicamente todas las partículas fluorescentes con pinzas mientras irriga con agua fría. Evite el sulfato de cobre (antídoto histórico abandonado por riesgo de hemólisis intravascular mortal y fallo renal).',
    pearlEn: 'Commonly encountered in clandestine "red, phosphorus & iodine" (HI/Red P) methamphetamine reduction cooks. Systemic absorption of elemental phosphorus can cause acute fulminant hepatic necrosis, hyperkalemia, hypocalcemia, and acute tubular necrosis.',
    pearlEs: 'Frecuente en laboratorios clandestinos de metanfetamina mediante reducción con fósforo rojo y yodo. La absorción sistémica de fósforo elemental puede provocar necrosis hepática fulminante, hiperpotasemia, hipocalcemia y necrosis tubular aguda.',
  }),

  bho: Object.freeze({
    id: 'bho',
    nameEn: 'Butane Hash Oil (BHO) Blast & Flash Burns',
    nameEs: 'Explosiones y Quemaduras Flash por Aceite de Butano (BHO)',
    categoryEn: 'Explosive Hydrocarbon Thermal Burn',
    categoryEs: 'Quemadura Térmica por Hidrocarburo Explosivo',
    firstAidEn: 'Rapid extinguish and thermal cooling with clean water. DO NOT forcefully peel melted synthetic clothing (nylon, spandex, fleece) adhered to burned dermis; gently trim loose non-adherent clothing around the burned area. Screen immediately for blast trauma (tympanic membrane rupture, primary blast lung, closed head injury).',
    firstAidEs: 'Extinción rápida y enfriamiento con agua limpia. NO despegue a la fuerza prendas sintéticas fundidas (nailon, licra, poliéster) adheridas a la piel quemada; recorte cuidadosamente la ropa suelta alrededor de la lesión. Descarte inmediatamente traumatismo por onda expansiva (rotura de tímpano, contusión pulmonar por blast, traumatismo craneal).',
    antidoteEn: 'Parkland / ABA crystalloid resuscitation for extensive TBSA. Early chest radiograph to rule out blast-induced pneumothorax or alveolar hemorrhage. Provide non-judgmental, trauma-informed clinical care.',
    antidoteEs: 'Reanimación con cristaloides según fórmula ABA si la SCTQ es extensa. Radiografía de tórax temprana para descartar neumotórax o hemorragia alveolar por blast. Brinde atención clínica compasiva, informada en trauma y libre de estigma.',
    pearlEn: 'BHO extraction uses highly volatile liquid butane to strip THC from cannabis plant material. Heavy butane vapor sinks and pools along floors until ignited by refrigerator compressors, pilot lights, or static discharge, producing high-pressure deflagration flash fires.',
    pearlEs: 'La extracción de BHO emplea gas butano licuado altamente volátil. El vapor denso de butano se acumula a nivel del suelo hasta encenderse con chispas o motores de refrigeradores, generando deflagraciones violentas con quemaduras de llamarada.',
  }),

  crack_pipe: Object.freeze({
    id: 'crack_pipe',
    nameEn: 'Crack Pipe Stem Thermal Scald & Lip Burns',
    nameEs: 'Quemaduras Labiales y Térmicas por Pipa de Crack / Tallos',
    categoryEn: 'Contact Thermal & Mucosal Injury',
    categoryEs: 'Lesión Térmica por Contacto y Mucosa',
    firstAidEn: 'Apply cool, clean water compresses to lips and perioral tissues. Inspect oral cavity, hard/soft palate, uvula, and posterior pharynx for thermal blistering, erythema, and mucosal sloughing. Check for inhaled hot glass or wire screen fragments (Chore Boy / Brillo).',
    firstAidEs: 'Aplique compresas de agua fresca y limpia en labios y tejidos periorales. Inspeccione la cavidad bucal, paladar, úvula y orofaringe en busca de ampollas térmicas, eritema y desprendimiento mucoso. Verifique si hubo inhalación de fragmentos incandescentes de vidrio o viruta metálica.',
    antidoteEn: 'Topical petrolatum or sterile barrier ointment to chapped and burned lips to prevent secondary bacterial infection. Harm reduction distribution of silicone heat-resistant rubber pipe mouthpieces, pyrex stems, and brass screens to prevent reinjury. Prohibit sharing pipes to reduce transmission of Hepatitis C and Herpes simplex.',
    antidoteEs: 'Vaselina pura o ungüento estéril en labios para prevenir infecciones bacterianas secundarias. Entrega preventiva de boquillas protectoras de silicona resistentes al calor, tubos de pyrex y rejillas de latón. Recomiende no compartir pipas para prevenir la transmisión del virus de hepatitis C y herpes.',
    pearlEn: 'Cracked or short glass stems and makeshift metallic car antennas heat up rapidly to temperatures exceeding 150°F (65°C), burning lips and mucous membranes. Inhalation of superheated air or metallic combustion products can induce acute upper airway edema.',
    pearlEs: 'Los tubos cortos de vidrio o antenas metálicas improvisadas se calientan rápidamente a más de 65 °C, quemando labios y mucosas. La inhalación de aire sobrecalentado o partículas incandescentes puede provocar edema de vías respiratorias superiores.',
  }),

  chs_scald: Object.freeze({
    id: 'chs_scald',
    nameEn: 'Cannabinoid Hyperemesis (CHS) Compulsive Scald Burns',
    nameEs: 'Quemaduras por Escaldadura Compulsiva en Síndrome de Hiperémesis Cannabinoide (SHC)',
    categoryEn: 'Compulsive Heat-Seeking Scald Injury',
    categoryEs: 'Quemadura por Búsqueda Compulsiva de Calor',
    firstAidEn: 'Assess partial-thickness scald burns and mottled reticular hyperpigmentation (erythema ab igne). Cleanse gently with mild soap and water; cover with non-adherent silver sulfadiazine or sterile dressings. Hydrate with IV balanced crystalloids to correct severe dehydration and hypokalemic metabolic alkalosis from protracted vomiting.',
    firstAidEs: 'Evalúe las quemaduras por escaldadura de espesor parcial y la hiperpigmentación reticular moteada (eritema ab igne). Lave suavemente con agua y jabón neutro; cubra con apósitos estériles o sulfadiazina de plata. Hidrate con cristaloides IV para corregir la deshidratación severa y la alcalosis metabólica hipopotasémica por vómitos cíclicos.',
    antidoteEn: 'Interrupt compulsive hot-water seeking using topical Capsaicin cream 0.025%–0.075% applied to abdomen (acts as a potent TRPV1 agonist, depleting Substance P and mimicking the cutaneous sensation of hot bathing without scalding). Antiemetic therapy: IV Haloperidol (0.5–2 mg) or Droperidol (0.625–1.25 mg). AVOID opioids (worsens gastroparesis). Standard 5-HT3 antagonists (ondansetron) are typically ineffective.',
    antidoteEs: 'Interrumpa la conducta compulsiva aplicando crema tópica de capsaicina al 0.025%–0.075% en abdomen (agonista potente de TRPV1 que agota la sustancia P y reproduce el alivio térmico del baño caliente sin dañar la piel). Antieméticos: Haloperidol IV (0.5-2 mg) o Droperidol (0.625-1.25 mg). EVITE los opioides (empeoran la gastroparesia). El ondansetrón suele ser ineficaz en SHC.',
    pearlEn: 'Chronic daily cannabis use down-regulates hypothalamic CB1 receptors. Patients discover that compulsive, scalding-hot showers (> 106°F / 41°C) temporarily relieve intractable nausea and cyclical emesis by transiently resetting cutaneous TRPV1 receptors, resulting in recurrent severe scald burns.',
    pearlEs: 'El consumo diario prolongado de cannabis desensibiliza los receptores CB1 hipotalámicos. Los pacientes descubren que los baños con agua hirviendo (> 41 °C) alivian transitoriamente las náuseas cíclicas mediante activación de receptores TRPV1 cutáneos, provocando graves quemaduras térmicas.',
  }),
});

// ============================================================================
// EVALUATION ENGINE (PURE FUNCTION)
// ============================================================================

/**
 * Pure evaluation function for burn resuscitation, inhalation toxicology, and chemical countermeasures.
 * @param {Object} input
 * @param {number} input.weightKg - Patient body weight in kilograms (e.g. 70)
 * @param {number} input.tbsaPct - Total Burn Surface Area percentage (0 - 100, excluding 1st-degree)
 * @param {number} [input.hoursPostInjury=0] - Hours elapsed since injury (0 - 24)
 * @param {string} [input.patientType='adult'] - 'adult' | 'pediatric' | 'electrical'
 * @param {string} [input.exposureType='thermal'] - Key in BURN_EXPOSURE_PROTOCOLS
 * @param {string[]} [input.inhalationSigns=[]] - Signs: 'stridor', 'hoarseness', 'soot', 'facial_burns', 'neck_burns', 'enclosed_smoke', 'lactic_acidosis'
 * @param {boolean} [input.coSuspected=false] - Carbon monoxide exposure suspected
 * @param {number|null} [input.coHbLevel=null] - Measured Carboxyhemoglobin percentage (0 - 100)
 * @param {boolean} [input.pregnancy=false] - Pregnant patient
 * @param {boolean} [input.syncope=false] - Loss of consciousness or neurological deficits present
 * @returns {Object} Comprehensive calculation and clinical decision support output
 */
export function evaluateBurnToxicology(input = {}) {
  const weightKg = Math.max(1, Math.min(300, Number(input.weightKg) || 70));
  const tbsaPct = Math.max(0, Math.min(100, Number(input.tbsaPct) || 0));
  const hoursPostInjury = Math.max(0, Math.min(24, Number(input.hoursPostInjury) || 0));
  const patientType = input.patientType === 'pediatric' ? 'pediatric' : (input.patientType === 'electrical' ? 'electrical' : 'adult');
  const exposureKey = BURN_EXPOSURE_PROTOCOLS[input.exposureType] ? input.exposureType : 'thermal';
  const exposure = BURN_EXPOSURE_PROTOCOLS[exposureKey];
  const inhalationSigns = Array.isArray(input.inhalationSigns) ? input.inhalationSigns : [];
  const coSuspected = Boolean(input.coSuspected);
  const coHbLevel = input.coHbLevel !== null && input.coHbLevel !== undefined && !Number.isNaN(Number(input.coHbLevel))
    ? Number(input.coHbLevel)
    : null;
  const pregnancy = Boolean(input.pregnancy);
  const syncope = Boolean(input.syncope);

  // 1. Resuscitation Fluid Multiplier Selection
  let multiplier = ABA_BURN_CRITERIA.ADULT_THERMAL_FACTOR;
  let formulaNameEn = 'ABA Adult Consensus (2 mL / kg / % TBSA)';
  let formulaNameEs = 'Consenso ABA Adultos (2 mL / kg / % SCTQ)';
  let targetUrineMlPerHr = Math.round(weightKg * ABA_BURN_CRITERIA.ADULT_URINE_TARGET_ML_PER_KG_HR);
  let targetUrineTextEn = `${targetUrineMlPerHr} mL/hr (0.5 mL/kg/hr; range 30-50 mL/hr)`;
  let targetUrineTextEs = `${targetUrineMlPerHr} mL/h (0.5 mL/kg/h; rango 30-50 mL/h)`;

  if (patientType === 'pediatric') {
    multiplier = ABA_BURN_CRITERIA.PEDIATRIC_FACTOR;
    formulaNameEn = 'ABA Pediatric Consensus (3 mL / kg / % TBSA + Maintenance D5 1/2 NS)';
    formulaNameEs = 'Consenso ABA Pediátrico (3 mL / kg / % SCTQ + Mantenimiento D5 1/2 SS)';
    targetUrineMlPerHr = Math.round(weightKg * ABA_BURN_CRITERIA.PEDIATRIC_URINE_TARGET_ML_PER_KG_HR);
    targetUrineTextEn = `${targetUrineMlPerHr} mL/hr (1.0 mL/kg/hr)`;
    targetUrineTextEs = `${targetUrineMlPerHr} mL/h (1.0 mL/kg/h)`;
  } else if (patientType === 'electrical') {
    multiplier = ABA_BURN_CRITERIA.ELECTRICAL_FACTOR;
    formulaNameEn = 'ABA Electrical / Pigmenturia Consensus (4 mL / kg / % TBSA)';
    formulaNameEs = 'Consenso ABA Eléctrico / Pigmenturia (4 mL / kg / % SCTQ)';
    targetUrineMlPerHr = Math.round(weightKg * ABA_BURN_CRITERIA.ELECTRICAL_URINE_TARGET_ML_PER_KG_HR);
    targetUrineTextEn = `${targetUrineMlPerHr} mL/hr (1.0 - 1.5 mL/kg/hr; target 75-100 mL/hr until urine clears)`;
    targetUrineTextEs = `${targetUrineMlPerHr} mL/h (1.0 - 1.5 mL/kg/h; meta 75-100 mL/h hasta aclarar mioglobina)`;
  }

  // 2. Fluid Volume Calculation
  // Total 24h = Multiplier * weightKg * tbsaPct
  const total24HrFluidMl = Math.round(multiplier * weightKg * tbsaPct);
  const first8HrFluidMl = Math.round(total24HrFluidMl / 2);
  const next16HrFluidMl = total24HrFluidMl - first8HrFluidMl;

  // Rate in first 8 hours: scheduled over the REMAINING time of the first 8 hours post-injury
  const remainingFirst8Hr = Math.max(1, 8 - hoursPostInjury);
  const first8HrHourlyRateMl = hoursPostInjury >= 8
    ? 0
    : Math.round(first8HrFluidMl / remainingFirst8Hr);
  const next16HrHourlyRateMl = Math.round(next16HrFluidMl / 16);

  // Fluid creep warnings
  const fluidCreepRisk = total24HrFluidMl > 0 && (total24HrFluidMl / weightKg > 250 || tbsaPct >= ABA_BURN_CRITERIA.SEVERE_TBSA_THRESHOLD);

  // 3. Airway & Inhalation Evaluation
  const airwayRedFlagsEn = [];
  const airwayRedFlagsEs = [];

  if (inhalationSigns.includes('stridor')) {
    airwayRedFlagsEn.push('Audible stridor (critical high-grade upper airway narrowing)');
    airwayRedFlagsEs.push('Estridor audible (estrechamiento crítico de la vía aérea superior)');
  }
  if (inhalationSigns.includes('hoarseness')) {
    airwayRedFlagsEn.push('Hoarseness or progressive voice change (laryngeal edema)');
    airwayRedFlagsEs.push('Disfonía o cambio progresivo de la voz (edema laríngeo)');
  }
  if (inhalationSigns.includes('soot')) {
    airwayRedFlagsEn.push('Carbonaceous sputum and posterior oropharyngeal soot');
    airwayRedFlagsEs.push('Esputo carbonáceo y hollín en la orofaringe posterior');
  }
  if (inhalationSigns.includes('facial_burns')) {
    airwayRedFlagsEn.push('Deep 2nd/3rd-degree facial, perioral, or nasal burns');
    airwayRedFlagsEs.push('Quemaduras faciales, peribucales o nasales de 2.º/3.er grado');
  }
  if (inhalationSigns.includes('neck_burns')) {
    airwayRedFlagsEn.push('Circumferential or anterior neck burn (external mechanical airway compression)');
    airwayRedFlagsEs.push('Quemadura circunferencial o anterior de cuello (compresión mecánica)');
  }
  if (tbsaPct >= ABA_BURN_CRITERIA.SEVERE_TBSA_THRESHOLD) {
    airwayRedFlagsEn.push(`Large burn surface area (TBSA ${tbsaPct}% >= 40%; systemic fluid shift induces supraglottic edema)`);
    airwayRedFlagsEs.push(`Extensa superficie quemada (SCTQ ${tbsaPct}% >= 40%; fuga capilar provoca edema supraglótico masivo)`);
  }

  const intubationUrgent = airwayRedFlagsEn.length > 0;

  // 4. Toxic Gas Evaluation (Carbon Monoxide & Cyanide)
  const toxicGasAlertsEn = [];
  const toxicGasAlertsEs = [];
  let hboIndicated = false;
  let cyanideIndicated = false;

  // Carbon Monoxide
  if (coSuspected || (coHbLevel !== null && coHbLevel > 5)) {
    toxicGasAlertsEn.push('PULSE OXIMETRY TRAP: Standard SpO2 is falsely normal or high in CO poisoning. Obtain co-oximetry blood gas immediately. Administer 100% high-flow non-rebreather oxygen immediately.');
    toxicGasAlertsEs.push('TRAMPA DE PULSIOXIMETRÍA: La SpO2 estándar es falsamente normal o alta en intoxicación por CO. Solicite gasometría con co-oximetría de inmediato. Administre oxígeno al 100% con mascarilla de no reinhalación.');

    const threshold = pregnancy ? 15 : 25;
    if ((coHbLevel !== null && coHbLevel >= threshold) || (coSuspected && (syncope || pregnancy))) {
      hboIndicated = true;
      toxicGasAlertsEn.push(`HYPERBARIC OXYGEN (HBO) INDICATED: COHb >= ${threshold}% or pregnancy / syncope / neurological deficits / myocardial ischemia present.`);
      toxicGasAlertsEs.push(`OXÍGENO HIPERBÁRICO (OHB) INDICADO: COHb >= ${threshold}% o presencia de embarazo / síncope / déficit neurológico / isquemia miocárdica.`);
    }
  }

  // Cyanide
  if (inhalationSigns.includes('enclosed_smoke') && inhalationSigns.includes('lactic_acidosis')) {
    cyanideIndicated = true;
    toxicGasAlertsEn.push('SUSPECTED CYANIDE POISONING: Enclosed space smoke inhalation with soot + severe lactic acidosis (>= 8-10 mmol/L). Administer Hydroxocobalamin (Cyanokit) 5g IV infusion over 15 minutes.');
    toxicGasAlertsEs.push('SOSPECHA DE INTOXICACIÓN POR CIANURO: Inhalación de humo en espacio cerrado con hollín + acidosis láctica grave (>= 8-10 mmol/L). Administre Hidroxocobalamina (Cyanokit) 5 g IV en infusión de 15 minutos.');
  }

  // 5. Transfer to Burn Center Criteria (ABA)
  const transferCriteriaMetEn = [];
  const transferCriteriaMetEs = [];

  if (tbsaPct >= 10 && patientType === 'pediatric') {
    transferCriteriaMetEn.push('Pediatric partial-thickness burn >= 10% TBSA');
    transferCriteriaMetEs.push('Quemadura de espesor parcial pediátrica >= 10% SCTQ');
  } else if (tbsaPct >= 20) {
    transferCriteriaMetEn.push(`Adult partial-thickness burn >= 20% TBSA (${tbsaPct}%)`);
    transferCriteriaMetEs.push(`Quemadura de espesor parcial en adultos >= 20% SCTQ (${tbsaPct}%)`);
  }
  if (exposureKey === 'hydrofluoric' || exposureKey === 'ammonia' || exposureKey === 'phosphorus') {
    transferCriteriaMetEn.push(`Severe chemical burn (${exposure.nameEn})`);
    transferCriteriaMetEs.push(`Quemadura química compleja (${exposure.nameEs})`);
  }
  if (patientType === 'electrical') {
    transferCriteriaMetEn.push('High-voltage electrical injury / deep rhabdomyolysis');
    transferCriteriaMetEs.push('Lesión eléctrica por alto voltaje / rabdomiólisis profunda');
  }
  if (intubationUrgent || inhalationSigns.includes('soot') || inhalationSigns.includes('enclosed_smoke')) {
    transferCriteriaMetEn.push('Inhalation injury or high-risk upper airway compromise');
    transferCriteriaMetEs.push('Lesión por inhalación o riesgo elevado de compromiso de vía aérea');
  }
  if (inhalationSigns.includes('facial_burns') || inhalationSigns.includes('neck_burns')) {
    transferCriteriaMetEn.push('Burns involving specialized anatomical areas (face, hands, feet, genitalia, perineum, major joints)');
    transferCriteriaMetEs.push('Quemaduras que afectan áreas anatómicas críticas (cara, manos, pies, genitales, periné, articulaciones mayores)');
  }

  const burnCenterTransferRecommended = transferCriteriaMetEn.length > 0;

  // 6. Generate Plain-Text SBAR Summary
  const sbarEn = [
    `[S] SITUATION: ${patientType.toUpperCase()} patient presenting with ${exposure.nameEn}, estimated ${tbsaPct}% TBSA burn (excluding 1st-degree erythema), ${hoursPostInjury} hours post-injury.`,
    `[B] BACKGROUND: Exposure context: ${exposureKey}. Patient weight: ${weightKg} kg.${coSuspected ? ' Smoke/CO exposure suspected.' : ''}${pregnancy ? ' Patient is pregnant.' : ''}${syncope ? ' History of syncope or neurologic deficit.' : ''}`,
    `[A] ASSESSMENT:`,
    `  • Resuscitation Fluid: ${formulaNameEn}.`,
    `  • Total 24h Lactated Ringer's: ${total24HrFluidMl} mL.`,
    `  • First 8h target: ${first8HrFluidMl} mL (${remainingFirst8Hr}h remaining at ${first8HrHourlyRateMl} mL/hr).`,
    `  • Next 16h rate: ${next16HrHourlyRateMl} mL/hr. Titrate strictly to urine output: ${targetUrineTextEn}.`,
    intubationUrgent ? `  • AIRWAY ALERT: Immediate intubation indicated due to: ${airwayRedFlagsEn.join('; ')}.` : '  • Airway: Currently stable; continue continuous monitoring for progressive supraglottic edema.',
    exposureKey === 'hydrofluoric' ? '  • TOXICOLOGY: Topical 2.5% Calcium Gluconate massage indicated immediately. Obtain baseline ECG and serum Ca/Mg/K.' : '',
    exposureKey === 'ammonia' ? '  • TOXICOLOGY: Copious low-pressure water irrigation for >= 30-60 min. Never attempt chemical neutralization.' : '',
    exposureKey === 'phosphorus' ? '  • TOXICOLOGY: Keep wound submerged or under saline-soaked dressings. Wood’s lamp exam for particle debridement.' : '',
    exposureKey === 'chs_scald' ? '  • TOXICOLOGY: Apply topical Capsaicin cream 0.025%-0.075% to abdomen. Administer IV Haloperidol/Droperidol. Avoid opioids.' : '',
    cyanideIndicated ? '  • TOXICOLOGY: Cyanokit (Hydroxocobalamin 5g IV over 15 min) indicated for suspected smoke cyanide poisoning.' : '',
    hboIndicated ? '  • TOXICOLOGY: Hyperbaric Oxygen (HBO) consultation indicated for severe carboxyhemoglobin toxicity.' : '',
    `[R] RECOMMENDATION: ${burnCenterTransferRecommended ? `URGENT ABA BURN CENTER TRANSFER RECOMMENDED (${transferCriteriaMetEn.join(', ')}).` : 'Manage with close hemodynamics and serial airway assessments.'} Contact Regional Burn Center and Poison Control (1-800-222-1222).`,
  ].filter(Boolean).join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Paciente (${patientType}) con ${exposure.nameEs}, quemadura estimada del ${tbsaPct}% SCTQ (excluyendo eritema de 1.er grado), ${hoursPostInjury} horas de evolución desde la lesión.`,
    `[B] ANTECEDENTES: Contexto: ${exposureKey}. Peso del paciente: ${weightKg} kg.${coSuspected ? ' Sospecha de exposición a humo/CO.' : ''}${pregnancy ? ' Paciente embarazada.' : ''}${syncope ? ' Síncope o alteración neurológica presente.' : ''}`,
    `[A] EVALUACIÓN:`,
    `  • Líquido de Reanimación: ${formulaNameEs}.`,
    `  • Volumen Total 24h Ringer Lactato: ${total24HrFluidMl} mL.`,
    `  • Primeras 8h: ${first8HrFluidMl} mL (${remainingFirst8Hr}h restantes a ${first8HrHourlyRateMl} mL/h).`,
    `  • Siguientes 16h: ${next16HrHourlyRateMl} mL/h. Titular según diuresis horaria: ${targetUrineTextEs}.`,
    intubationUrgent ? `  • ALERTA DE VÍA AÉREA: Intubación precoz indicada por: ${airwayRedFlagsEs.join('; ')}.` : '  • Vía aérea: Estable actualmente; mantener vigilancia continua por riesgo de edema supraglótico progresivo.',
    exposureKey === 'hydrofluoric' ? '  • TOXICOLOGÍA: Masaje con gel tópico de gluconato de calcio al 2.5% inmediato. ECG y electrolitos Ca/Mg/K basales.' : '',
    exposureKey === 'ammonia' ? '  • TOXICOLOGÍA: Irrigación continua con agua >= 30-60 min. Prohibida la neutralización química con ácidos.' : '',
    exposureKey === 'phosphorus' ? '  • TOXICOLOGÍA: Mantener sumergido o con gasas empapadas en solución salina. Examen con lámpara de Wood para desbridar.' : '',
    exposureKey === 'chs_scald' ? '  • TOXICOLOGÍA: Aplicar crema de capsaicina tópica al 0.025%-0.075% en abdomen. Haloperidol/Droperidol IV. Evitar opioides.' : '',
    cyanideIndicated ? '  • TOXICOLOGÍA: Hidroxocobalamina (Cyanokit 5 g IV en 15 min) indicada por intoxicación inhalatoria por cianuro.' : '',
    hboIndicated ? '  • TOXICOLOGÍA: Valoración urgente para cámara hiperbárica (OHB) por intoxicación grave por monóxido de carbono.' : '',
    `[R] RECOMENDACIÓN: ${burnCenterTransferRecommended ? `SE RECOMIENDA TRASLADO URGENTE A CENTRO DE QUEMADOS ABA (${transferCriteriaMetEs.join(', ')}).` : 'Manejo con monitorización hemodinámica estrecha.'} Notificar al Centro de Quemados Regional y Control de Envenenamientos (1-800-222-1222).`,
  ].filter(Boolean).join('\n');

  return {
    weightKg,
    tbsaPct,
    hoursPostInjury,
    patientType,
    exposureKey,
    exposure,
    multiplier,
    formulaNameEn,
    formulaNameEs,
    total24HrFluidMl,
    first8HrFluidMl,
    next16HrFluidMl,
    remainingFirst8Hr,
    first8HrHourlyRateMl,
    next16HrHourlyRateMl,
    targetUrineMlPerHr,
    targetUrineTextEn,
    targetUrineTextEs,
    fluidCreepRisk,
    intubationUrgent,
    airwayRedFlagsEn,
    airwayRedFlagsEs,
    coSuspected,
    coHbLevel,
    hboIndicated,
    cyanideIndicated,
    toxicGasAlertsEn,
    toxicGasAlertsEs,
    burnCenterTransferRecommended,
    transferCriteriaMetEn,
    transferCriteriaMetEs,
    sbarEn,
    sbarEs,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const burnState = {
  weightKg: 70,
  tbsaPct: 15,
  hoursPostInjury: 1,
  patientType: 'adult',
  exposureType: 'thermal',
  inhalationSigns: new Set(),
  coSuspected: false,
  coHbLevel: '',
  pregnancy: false,
  syncope: false,
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function resetBurnToxicologyState() {
  burnState.weightKg = 70;
  burnState.tbsaPct = 15;
  burnState.hoursPostInjury = 1;
  burnState.patientType = 'adult';
  burnState.exposureType = 'thermal';
  burnState.inhalationSigns.clear();
  burnState.coSuspected = false;
  burnState.coHbLevel = '';
  burnState.pregnancy = false;
  burnState.syncope = false;
  burnState.copied = false;
  notifyState();
}

// ============================================================================
// VIEW RENDERING
// ============================================================================

export function burnToxicologyView() {
  const container = h('div', { class: 'burn-toxicology-view', role: 'region', 'aria-label': 'Burn and Toxicology Clinical Decision Support' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const evalResult = evaluateBurnToxicology({
      weightKg: burnState.weightKg,
      tbsaPct: burnState.tbsaPct,
      hoursPostInjury: burnState.hoursPostInjury,
      patientType: burnState.patientType,
      exposureType: burnState.exposureType,
      inhalationSigns: Array.from(burnState.inhalationSigns),
      coSuspected: burnState.coSuspected,
      coHbLevel: burnState.coHbLevel !== '' ? Number(burnState.coHbLevel) : null,
      pregnancy: burnState.pregnancy,
      syncope: burnState.syncope,
    });

    // Page Header
    container.appendChild(
      pageHeader(
        isEs ? 'Reanimación de Quemaduras, Químicos Tóxicos y Lesión Inhalatoria' : 'Burn Resuscitation, Toxic Chemical Exposure & Inhalation Navigator',
        isEs
          ? 'Consenso ABA 2024 para cálculo de líquidos de reanimación (2 mL/kg/% SCTQ), antídotos específicos (gluconato de calcio, Cyanokit) y triaje de vía aérea.'
          : 'American Burn Association (ABA) fluid formula (2 mL/kg/% TBSA), chemical countermeasures (Calcium Gluconate, Cyanokit), and early intubation triggers.',
        'clinical'
      )
    );

    // Main Layout: Two Column Responsive Grid
    const grid = h('div', { class: 'burn-layout-grid' });

    // LEFT COLUMN: Interactive Clinical Inputs
    const leftCol = h('div', { class: 'burn-input-column' });

    // Card 1: Patient & Resuscitation Parameters
    const paramCard = h('section', { class: 'burn-card' },
      h('h2', { class: 'burn-card-title' },
        icon('alert-triangle'),
        h('span', {}, isEs ? '1. Parámetros de Reanimación y Paciente' : '1. Patient & Resuscitation Parameters')
      ),
      h('p', { class: 'burn-card-desc' },
        isEs
          ? 'La reanimación inicia desde la HORA DE LA LESIÓN, no desde la llegada a urgencias. Excluya estrictamente el eritema de 1.er grado.'
          : 'Resuscitation starts from the TIME OF INJURY, not hospital arrival. Strictly EXCLUDE 1st-degree erythema from % TBSA.'
      ),
      // Patient Type Selector
      h('div', { class: 'burn-field-group' },
        h('label', { for: 'burn-patient-type', class: 'burn-label' }, isEs ? 'Tipo de Paciente / Mecanismo:' : 'Patient Category / Mechanism:'),
        (() => {
          const sel = h('select', { id: 'burn-patient-type', class: 'burn-select' },
            h('option', { value: 'adult', selected: burnState.patientType === 'adult' }, isEs ? 'Adulto (Térmico / Químico - 2 mL/kg/%)' : 'Adult (Thermal / Chemical - 2 mL/kg/%)'),
            h('option', { value: 'pediatric', selected: burnState.patientType === 'pediatric' }, isEs ? 'Pediátrico (< 14 años - 3 mL/kg/% + D5 1/2 SS)' : 'Pediatric (< 14 yrs - 3 mL/kg/% + D5 1/2 NS)'),
            h('option', { value: 'electrical', selected: burnState.patientType === 'electrical' }, isEs ? 'Eléctrico Alto Voltaje / Rabdomiólisis (4 mL/kg/%)' : 'High-Voltage Electrical / Rhabdomyolysis (4 mL/kg/%)')
          );
          sel.addEventListener('change', (e) => {
            burnState.patientType = e.target.value;
            render();
          });
          return sel;
        })()
      ),
      // Weight & TBSA Inputs
      h('div', { class: 'burn-inputs-row' },
        h('div', { class: 'burn-field-group' },
          h('label', { for: 'burn-weight', class: 'burn-label' }, isEs ? 'Peso del Paciente (kg):' : 'Patient Weight (kg):'),
          (() => {
            const inp = h('input', {
              id: 'burn-weight',
              type: 'number',
              min: '1',
              max: '300',
              value: String(burnState.weightKg),
              class: 'burn-input-number',
            });
            inp.addEventListener('input', (e) => {
              const val = Number(e.target.value);
              if (val > 0) {
                burnState.weightKg = val;
                render();
              }
            });
            return inp;
          })()
        ),
        h('div', { class: 'burn-field-group' },
          h('label', { for: 'burn-tbsa', class: 'burn-label' }, isEs ? '% SCTQ Quemada (2.º y 3.er grado):' : '% TBSA (2nd & 3rd Degree):'),
          (() => {
            const inp = h('input', {
              id: 'burn-tbsa',
              type: 'number',
              min: '0',
              max: '100',
              value: String(burnState.tbsaPct),
              class: 'burn-input-number',
            });
            inp.addEventListener('input', (e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 100) {
                burnState.tbsaPct = val;
                render();
              }
            });
            return inp;
          })()
        )
      ),
      // Hours Post-Injury
      h('div', { class: 'burn-field-group' },
        h('label', { for: 'burn-hours', class: 'burn-label' }, isEs ? 'Horas Transcurridas desde la Quemadura:' : 'Hours Elapsed Since Injury:'),
        (() => {
          const inp = h('input', {
            id: 'burn-hours',
            type: 'number',
            min: '0',
            max: '24',
            value: String(burnState.hoursPostInjury),
            class: 'burn-input-number',
          });
          inp.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            if (val >= 0 && val <= 24) {
              burnState.hoursPostInjury = val;
              render();
            }
          });
          return inp;
        })()
      )
    );
    leftCol.appendChild(paramCard);

    // Card 2: Exposure Mechanism & Specialized Toxicology
    const toxCard = h('section', { class: 'burn-card' },
      h('h2', { class: 'burn-card-title' },
        icon('shield'),
        h('span', {}, isEs ? '2. Sustancia o Mecanismo Toxicológico' : '2. Chemical or Toxic Mechanism')
      ),
      h('div', { class: 'burn-field-group' },
        h('label', { for: 'burn-exposure-type', class: 'burn-label' }, isEs ? 'Seleccionar Agente Causal:' : 'Select Etiological Hazard:'),
        (() => {
          const sel = h('select', { id: 'burn-exposure-type', class: 'burn-select' },
            Object.values(BURN_EXPOSURE_PROTOCOLS).map((proto) =>
              h('option', { value: proto.id, selected: burnState.exposureType === proto.id },
                isEs ? proto.nameEs : proto.nameEn
              )
            )
          );
          sel.addEventListener('change', (e) => {
            burnState.exposureType = e.target.value;
            render();
          });
          return sel;
        })()
      ),
      // Detailed Clinical Protocol Box
      h('div', { class: 'burn-protocol-box' },
        h('h3', { class: 'burn-protocol-heading' }, isEs ? 'Primeros Auxilios e Intervención Inmediata:' : 'First Aid & Immediate Countermeasures:'),
        h('p', { class: 'burn-protocol-text' }, isEs ? evalResult.exposure.firstAidEs : evalResult.exposure.firstAidEn),
        h('h3', { class: 'burn-protocol-heading' }, isEs ? 'Antídoto y Tratamiento Específico:' : 'Antidote & Targeted Therapy:'),
        h('p', { class: 'burn-protocol-text' }, isEs ? evalResult.exposure.antidoteEs : evalResult.exposure.antidoteEn),
        h('div', { class: 'burn-pearl-badge' },
          h('strong', {}, isEs ? 'Perla Clínica: ' : 'Clinical Pearl: '),
          h('span', {}, isEs ? evalResult.exposure.pearlEs : evalResult.exposure.pearlEn)
        )
      )
    );
    leftCol.appendChild(toxCard);

    // Card 3: Airway & Inhalation Assessment
    const airwayCard = h('section', { class: 'burn-card' },
      h('h2', { class: 'burn-card-title' },
        icon('activity'),
        h('span', {}, isEs ? '3. Evaluación de Vía Aérea y Gases Tóxicos' : '3. Airway & Toxic Gas Triage')
      ),
      h('div', { class: 'burn-checkbox-grid' },
        [
          { id: 'stridor', en: 'Audible stridor (critical airway compromise)', es: 'Estridor audible (compromiso crítico de vía aérea)' },
          { id: 'hoarseness', en: 'Hoarseness or progressive voice change', es: 'Disfonía o cambio de voz progresivo' },
          { id: 'soot', en: 'Carbonaceous sputum / pharyngeal soot', es: 'Esputo carbonáceo u hollín en orofaringe' },
          { id: 'facial_burns', en: 'Facial / perioral / nasal 2nd or 3rd degree burns', es: 'Quemaduras faciales o peribucales profundas' },
          { id: 'neck_burns', en: 'Circumferential / deep anterior neck burns', es: 'Quemadura de cuello circunferencial o anterior' },
          { id: 'enclosed_smoke', en: 'Enclosed space fire smoke exposure', es: 'Exposición a humo en espacio cerrado' },
          { id: 'lactic_acidosis', en: 'Severe lactic acidosis (>= 8-10 mmol/L)', es: 'Acidosis láctica grave (>= 8-10 mmol/L)' },
        ].map((item) => {
          const checked = burnState.inhalationSigns.has(item.id);
          const chk = h('input', {
            type: 'checkbox',
            id: `chk-${item.id}`,
            class: 'burn-checkbox',
            checked,
          });
          chk.addEventListener('change', (e) => {
            if (e.target.checked) burnState.inhalationSigns.add(item.id);
            else burnState.inhalationSigns.delete(item.id);
            render();
          });
          return h('label', { for: `chk-${item.id}`, class: 'burn-checkbox-label' },
            chk,
            h('span', {}, isEs ? item.es : item.en)
          );
        })
      ),
      // Additional triggers row: CO, Syncope, Pregnancy
      h('div', { class: 'burn-checkbox-grid burn-mt-sm' },
        (() => {
          const chk = h('input', {
            type: 'checkbox',
            id: 'chk-co',
            class: 'burn-checkbox',
            checked: burnState.coSuspected,
          });
          chk.addEventListener('change', (e) => {
            burnState.coSuspected = e.target.checked;
            render();
          });
          return h('label', { for: 'chk-co', class: 'burn-checkbox-label' },
            chk,
            h('span', {}, isEs ? 'Sospecha de Monóxido de Carbono (CO)' : 'Suspected Carbon Monoxide (CO)')
          );
        })(),
        (() => {
          const chk = h('input', {
            type: 'checkbox',
            id: 'chk-syncope',
            class: 'burn-checkbox',
            checked: burnState.syncope,
          });
          chk.addEventListener('change', (e) => {
            burnState.syncope = e.target.checked;
            render();
          });
          return h('label', { for: 'chk-syncope', class: 'burn-checkbox-label' },
            chk,
            h('span', {}, isEs ? 'Síncope o Alteración Neurológica' : 'Syncope or Neurologic Deficit')
          );
        })(),
        (() => {
          const chk = h('input', {
            type: 'checkbox',
            id: 'chk-pregnancy',
            class: 'burn-checkbox',
            checked: burnState.pregnancy,
          });
          chk.addEventListener('change', (e) => {
            burnState.pregnancy = e.target.checked;
            render();
          });
          return h('label', { for: 'chk-pregnancy', class: 'burn-checkbox-label' },
            chk,
            h('span', {}, isEs ? 'Paciente Embarazada (Umbral OHB > 15%)' : 'Patient Pregnant (HBO Threshold > 15%)')
          );
        })()
      ),
      // Co-oximetry COHb level input
      h('div', { class: 'burn-field-group burn-mt-sm' },
        h('label', { for: 'burn-cohb', class: 'burn-label' }, isEs ? 'Nivel de Carboxihemoglobina (% COHb por Co-Oximetría):' : 'Measured Carboxyhemoglobin (% COHb via Co-Oximetry):'),
        (() => {
          const inp = h('input', {
            id: 'burn-cohb',
            type: 'number',
            min: '0',
            max: '100',
            placeholder: 'e.g. 28',
            value: burnState.coHbLevel,
            class: 'burn-input-number',
          });
          inp.addEventListener('input', (e) => {
            burnState.coHbLevel = e.target.value;
            render();
          });
          return inp;
        })()
      )
    );
    leftCol.appendChild(airwayCard);

    grid.appendChild(leftCol);

    // RIGHT COLUMN: Clinical Decision Support, Resuscitation Plan & SBAR
    const rightCol = h('div', { class: 'burn-output-column' });

    // Urgent Airway Callout (if intubation triggers met)
    if (evalResult.intubationUrgent) {
      rightCol.appendChild(
        h('aside', { class: 'burn-alert-urgent', role: 'alert' },
          h('div', { class: 'burn-alert-title' },
            icon('alert-triangle'),
            h('strong', {}, isEs ? 'CRITERIOS DE INTUBACIÓN PRECOZ CUMPLIDOS' : 'URGENT EARLY INTUBATION CRITERIA MET')
          ),
          h('p', { class: 'burn-alert-desc' },
            isEs
              ? 'El edema supraglótico alcanza su punto máximo entre las 12 y 24 horas a medida que se infunden líquidos. Intube precozmente antes de la oclusión completa de la vía aérea.'
              : 'Supraglottic airway edema peaks at 12-24 hours as resuscitation fluids are infused. Secure the airway before total supraglottic closure occurs.'
          ),
          h('ul', { class: 'burn-alert-list' },
            (isEs ? evalResult.airwayRedFlagsEs : evalResult.airwayRedFlagsEn).map((flag) =>
              h('li', {}, flag)
            )
          )
        )
      );
    }

    // Toxic Gas Callout (if HBO or Cyanokit indicated)
    if (evalResult.cyanideIndicated || evalResult.hboIndicated) {
      rightCol.appendChild(
        h('aside', { class: 'burn-alert-toxicology', role: 'alert' },
          h('div', { class: 'burn-alert-title' },
            icon('shield'),
            h('strong', {}, isEs ? 'ALERTA DE TOXICOLOGÍA DE GASES INHALADOS' : 'INHALATION TOXICOLOGY PROTOCOL ACTIVATED')
          ),
          h('ul', { class: 'burn-alert-list' },
            (isEs ? evalResult.toxicGasAlertsEs : evalResult.toxicGasAlertsEn).map((msg) =>
              h('li', {}, msg)
            )
          )
        )
      );
    }

    // Fluid Creep Warning
    if (evalResult.fluidCreepRisk) {
      rightCol.appendChild(
        h('aside', { class: 'burn-alert-warning', role: 'alert' },
          h('div', { class: 'burn-alert-title' },
            icon('alert-triangle'),
            h('strong', {}, isEs ? 'ADVERTENCIA DE FLUID CREEP (SÍNDROME COMPARTIMENTAL)' : 'FLUID CREEP & COMPARTMENT SYNDROME WARNING')
          ),
          h('p', { class: 'burn-alert-desc' },
            isEs
              ? 'El volumen calculado supera 250 mL/kg o la SCTQ es >= 40%. Titule la infusión estrictamente según la diuresis horaria (0.5 mL/kg/h) para prevenir síndrome compartimental abdominal y edema pulmonar.'
              : 'Calculated fluid volume exceeds 250 mL/kg or TBSA >= 40%. Titrate IV infusion rate strictly according to hourly urine output (0.5 mL/kg/hr) to avoid abdominal compartment syndrome and fatal pulmonary edema.'
          )
        )
      );
    }

    // ABA Fluid Resuscitation Plan Card
    const fluidCard = h('section', { class: 'burn-card burn-plan-card' },
      h('h2', { class: 'burn-card-title' },
        icon('activity'),
        h('span', {}, isEs ? 'Cálculo de Reanimación Hídrica ABA' : 'ABA Fluid Resuscitation Schedule')
      ),
      h('div', { class: 'burn-metric-grid' },
        h('div', { class: 'burn-metric-item' },
          h('span', { class: 'burn-metric-label' }, isEs ? 'Volumen Total (Primeras 24 Horas):' : 'Total 24-Hour Volume:'),
          h('span', { class: 'burn-metric-value' }, `${evalResult.total24HrFluidMl.toLocaleString()} mL`),
          h('span', { class: 'burn-metric-sub' }, isEs ? 'Ringer Lactato' : 'Lactated Ringer’s')
        ),
        h('div', { class: 'burn-metric-item' },
          h('span', { class: 'burn-metric-label' }, isEs ? 'Primeras 8 Horas (50%):' : 'First 8 Hours (50%):'),
          h('span', { class: 'burn-metric-value' }, `${evalResult.first8HrFluidMl.toLocaleString()} mL`),
          h('span', { class: 'burn-metric-sub' },
            evalResult.first8HrHourlyRateMl > 0
              ? `${evalResult.first8HrHourlyRateMl} mL/hr (${evalResult.remainingFirst8Hr}h ${isEs ? 'restantes' : 'remaining'})`
              : (isEs ? 'Período de 8h superado' : '8h post-injury elapsed')
          )
        ),
        h('div', { class: 'burn-metric-item' },
          h('span', { class: 'burn-metric-label' }, isEs ? 'Siguientes 16 Horas (50%):' : 'Next 16 Hours (50%):'),
          h('span', { class: 'burn-metric-value' }, `${evalResult.next16HrFluidMl.toLocaleString()} mL`),
          h('span', { class: 'burn-metric-sub' }, `${evalResult.next16HrHourlyRateMl} mL/hr`)
        ),
        h('div', { class: 'burn-metric-item' },
          h('span', { class: 'burn-metric-label' }, isEs ? 'Meta de Diuresis Horaria:' : 'Target Urine Output:'),
          h('span', { class: 'burn-metric-value burn-value-accent' }, `${evalResult.targetUrineMlPerHr} mL/hr`),
          h('span', { class: 'burn-metric-sub' }, isEs ? evalResult.targetUrineTextEs : evalResult.targetUrineTextEn)
        )
      ),
      h('div', { class: 'burn-formula-badge' },
        h('strong', {}, isEs ? 'Fórmula Utilizada: ' : 'Consensus Formula: '),
        h('span', {}, isEs ? evalResult.formulaNameEs : evalResult.formulaNameEn)
      )
    );
    rightCol.appendChild(fluidCard);

    // Burn Center Referral Card
    const transferCard = h('section', { class: 'burn-card' },
      h('h2', { class: 'burn-card-title' },
        icon('external-link'),
        h('span', {}, isEs ? 'Criterios de Traslado a Centro de Quemados ABA' : 'ABA Burn Center Transfer Referral')
      ),
      evalResult.burnCenterTransferRecommended
        ? h('div', { class: 'burn-transfer-box-urgent' },
            h('p', { class: 'burn-transfer-title' },
              isEs ? 'PACIENTE CUMPLE CRITERIOS DE TRASLADO A CENTRO ESPECIALIZADO DE QUEMADOS:' : 'PATIENT MEETS ABA CRITERIA FOR BURN CENTER REFERRAL:'
            ),
            h('ul', { class: 'burn-transfer-list' },
              (isEs ? evalResult.transferCriteriaMetEs : evalResult.transferCriteriaMetEn).map((item) =>
                h('li', {}, item)
              )
            )
          )
        : h('div', { class: 'burn-transfer-box-ok' },
            h('p', {}, isEs ? 'No cumple criterios formales obligatorios de traslado; continúe monitorización local.' : 'Does not meet mandatory burn center transfer criteria; monitor locally.')
          ),
      h('p', { class: 'burn-contact-note' },
        isEs
          ? 'En caso de dudas de toxicología o quemaduras químicas complejas, consulte al Centro de Envenenamientos al 1-800-222-1222 (24/7, gratuito).'
          : 'For complex chemical exposures or resuscitation guidance, contact Poison Control at 1-800-222-1222 (24/7 free clinical consult).'
      )
    );
    rightCol.appendChild(transferCard);

    // SBAR Plain-Text Handoff Generator
    const sbarCard = h('section', { class: 'burn-card' },
      h('h2', { class: 'burn-card-title' },
        icon('file-text'),
        h('span', {}, isEs ? 'Nota Clínica SBAR para Transferencia (Cero PII)' : 'SBAR Clinical Transfer Handoff (Zero PII)')
      ),
      h('p', { class: 'burn-card-desc' },
        isEs
          ? 'Resumen clínico estructurado (Situación, Antecedentes, Evaluación, Recomendación) para derivación a quemados, urgencias o toxicología. Opera 100% en memoria RAM local.'
          : 'Structured transfer note for emergency departments, burn units, and toxicologists. Generated 100% in local memory.'
      ),
      h('pre', { class: 'burn-sbar-block', tabindex: '0', 'aria-label': 'SBAR Report' },
        isEs ? evalResult.sbarEs : evalResult.sbarEn
      ),
      h('div', { class: 'burn-sbar-actions' },
        (() => {
          const btn = h('button', {
            type: 'button',
            class: 'burn-btn-copy',
          },
            icon('copy'),
            h('span', {}, burnState.copied ? (isEs ? '¡Copiado al Portapapeles!' : 'Copied to Clipboard!') : (isEs ? 'Copiar Nota SBAR' : 'Copy SBAR Report'))
          );
          btn.addEventListener('click', () => {
            const textToCopy = isEs ? evalResult.sbarEs : evalResult.sbarEn;
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(textToCopy).then(() => {
                burnState.copied = true;
                announce(isEs ? 'Nota SBAR copiada al portapapeles' : 'SBAR report copied to clipboard');
                render();
                setTimeout(() => {
                  burnState.copied = false;
                  render();
                }, 3000);
              });
            }
          });
          return btn;
        })(),
        (() => {
          const resetBtn = h('button', {
            type: 'button',
            class: 'burn-btn-reset',
          }, isEs ? 'Restablecer Calculadora' : 'Reset Calculator');
          resetBtn.addEventListener('click', () => {
            resetBurnToxicologyState();
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
