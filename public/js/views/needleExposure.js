// public/js/views/needleExposure.js
// HarborPath - Needle Stick, Sharps Injury & Bloodborne Pathogen Post-Exposure Prophylaxis (PEP) Navigator
// Clinical consensus: CDC / USPHS Guidelines for the Management of Occupational Exposures to HIV and Recommendations for Postexposure Prophylaxis (Kuhar et al., 2013 / Updated),
// CDC Updated Guidelines for Antiretroviral Postexposure Prophylaxis After Sexual, Injection Drug Use, or Other Nonoccupational Exposure to HIV (nPEP, 2016 / 2021 Update),
// CDC Guidance for Evaluating Health-Care Personnel for Hepatitis B Virus Protection and Postexposure Management (MMWR 2013 / 2018),
// CDC Hepatitis C Post-Exposure Management in Healthcare Personnel (MMWR 2020),
// OSHA Bloodborne Pathogens Standard (29 CFR § 1910.1030).
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: TRANSMISSION RISK STRATIFICATION & VIRAL KINETICS
// ============================================================================

export const TRANSMISSION_PROBABILITIES = Object.freeze({
  hiv: Object.freeze({
    percutaneous: '~0.23% (approx 1 in 435)',
    percutaneousDetailEn: 'Percutaneous blood exposure from an untreated HIV-positive source. Higher with hollow-bore needles, deep punctures, visible blood on device, or device used in patient vein/artery.',
    percutaneousDetailEs: 'Exposición sanguínea percutánea de fuente con VIH no tratada. Mayor riesgo con agujas huecas, punciones profundas, sangre visible o dispositivo colocado en vaso sanguíneo.',
    mucousSplash: '~0.09% (approx 1 in 1,100)',
    mucousSplashDetailEn: 'Splash to eyes, nose, or mouth. Intact skin contact carries virtually 0.00% risk.',
    mucousSplashDetailEs: 'Salpicadura en ojos, nariz o boca. El contacto con piel íntegra tiene un riesgo de prácticamente 0.00%.',
    environmentalSurvivalEn: 'HIV is an extremely fragile enveloped virus. In ambient indoor or outdoor air, it loses infectivity rapidly (within 1 to 2 hours as fluid dries). Zero confirmed cases of HIV seroconversion from discarded community sharps have ever been verified worldwide.',
    environmentalSurvivalEs: 'El VIH es un virus envuelto muy frágil. En aire ambiente pierde infectividad rápidamente (en 1 a 2 horas al secarse el fluido). No existe ningún caso confirmado a nivel mundial de seroconversión de VIH por agujas abandonadas en la comunidad.',
  }),
  hcv: Object.freeze({
    percutaneous: '~1.8% (approx 1 in 55)',
    percutaneousDetailEn: 'Percutaneous hollow-bore needle exposure from an active viremic (HCV RNA positive) source. Solid needle exposures carry substantially lower risk.',
    percutaneousDetailEs: 'Exposición percutánea con aguja hueca de fuente con viremia activa (ARN VHC positivo). Agujas macizas conllevan un riesgo sustancialmente menor.',
    mucousSplash: '< 0.1% (extremely rare)',
    mucousSplashDetailEn: 'Transmission via mucous membrane splash is exceptionally rare; intact skin carries 0% risk.',
    mucousSplashDetailEs: 'La transmisión por salpicadura en mucosas es excepcionalmente rara; piel intacta tiene 0% de riesgo.',
    environmentalSurvivalEn: 'HCV can remain infectious in syringe barrels containing liquid blood for up to 48-72 hours, but desiccation on exposed surfaces rapidly degrades viral viability. If transmitted, modern direct-acting antivirals (DAAs) provide > 98% cure rates in 8-12 weeks.',
    environmentalSurvivalEs: 'El VHC puede permanecer infeccioso en el cilindro de jeringas con sangre líquida de 48 a 72 horas, pero la desecación degrada rápidamente su viabilidad. Si ocurre transmisión, los antivirales de acción directa curan > 98% en 8 a 12 semanas.',
  }),
  hbv: Object.freeze({
    percutaneousUnvaccinatedHBeAgPositive: '~22% to 31% (clinical hepatitis), ~37% to 62% (seroconversion)',
    percutaneousUnvaccinatedHBeAgNegative: '~1% to 6% (clinical hepatitis), ~23% to 37% (seroconversion)',
    percutaneousVaccinatedResponder: 'Virtually 0% (anti-HBs >= 10 mIU/mL provides near 100% protection)',
    environmentalSurvivalEn: 'HBV is a remarkably resilient, hardy virus that can survive in dried blood on ambient surfaces for 7 days or more. Because of this environmental stability, Hepatitis B immunization and post-exposure titer assessment are the primary true clinical priorities for community needle encounters.',
    environmentalSurvivalEs: 'El VHB es un virus muy resistente que puede sobrevivir en sangre seca sobre superficies durante 7 días o más. Por esta estabilidad ambiental, la inmunización y el título de anticuerpos contra hepatitis B son la principal prioridad clínica en pinchazos comunitarios.',
  }),
});

// ============================================================================
// IMMEDIATE DECONTAMINATION: PROTOCOL & BANNED ACTIONS
// ============================================================================

export const DECONTAMINATION_PROTOCOL = Object.freeze({
  skinPuncture: Object.freeze([
    {
      actionEn: 'Immediately wash puncture or cut thoroughly with mild soap and running water for at least 30 to 60 seconds.',
      actionEs: 'Lave de inmediato la punción o herida a fondo con agua corriente y jabón suave durante al menos 30 a 60 segundos.',
      rationaleEn: 'Mechanical cleansing dilutes and removes the majority of inoculated fluid without causing microtrauma.',
      rationaleEs: 'La limpieza mecánica diluye y remueve la mayor parte del fluido inoculado sin causar microtraumatismos.',
    },
    {
      actionEn: 'Allow blood to flow naturally if bleeding. Gently pat dry with clean gauze and apply sterile dressing.',
      actionEs: 'Deje que la sangre fluya con naturalidad si sangra. Seque suavemente con gasa limpia y cubra con apósito estéril.',
      rationaleEn: 'Natural outward blood flow cleanses the tract without tissue disruption.',
      rationaleEs: 'El flujo sanguíneo natural limpia el trayecto de la punción sin dañar los tejidos.',
    },
  ]),
  mucousMembrane: Object.freeze([
    {
      actionEn: 'Eye splash: Flush eyes immediately and continuously with clean water or sterile saline for 15 full minutes. Remove contact lenses.',
      actionEs: 'Salpicadura en ojos: Irrigue de inmediato y continuamente con agua limpia o solución salina durante 15 minutos completos. Retire lentes de contacto.',
      rationaleEn: 'Prolonged irrigation is required to flush conjunctival sacs and dilute chemical or biological inocula.',
      rationaleEs: 'Se requiere irrigación prolongada para limpiar los sacos conjuntivales y diluir inóculos químicos o biológicos.',
    },
    {
      actionEn: 'Mouth / Oral splash: Spit out immediately and rinse mouth repeatedly with clean water. Do not swallow.',
      actionEs: 'Salpicadura en boca: Escupa de inmediato y enjuáguese la boca repetidamente con agua limpia. No trague el agua.',
      rationaleEn: 'Cleanses the oral mucosa and prevents gastrointestinal transit.',
      rationaleEs: 'Limpia la mucosa oral y previene el tránsito gastrointestinal.',
    },
  ]),
  contraindicatedActions: Object.freeze([
    {
      practiceEn: 'DO NOT SQUEEZE, PRESS, OR "MILK" THE PUNCTURE SITE',
      practiceEs: 'NO APRIETE, EXPRIMA NI "ORDEÑE" EL SITIO DE PUNCIÓN',
      dangerEn: 'Milking the wound creates negative tissue pressure, collapses surrounding capillaries, causes local tissue microtrauma, and pulls inoculated pathogens deeper into the dermal vasculature, increasing systemic transmission risk.',
      dangerEs: 'Exprimir la herida genera presión tisular negativa, colapsa capilares circundantes, causa microtraumatismos y succiona los patógenos hacia la vasculatura dérmica profunda, aumentando el riesgo de transmisión sistémica.',
    },
    {
      practiceEn: 'DO NOT APPLY CAUSTIC CHEMICALS (BLEACH, IODINE, ALCOHOL BATHS)',
      practiceEs: 'NO APLIQUE QUÍMICOS CÁUSTICOS (CLORO, YODO, BAÑOS DE ALCOHOL)',
      dangerEn: 'Pouring caustic antiseptics, household bleach, hydrogen peroxide, or concentrated povidone-iodine into a puncture wound produces chemical tissue necrosis, denatures the skin defense barrier, triggers intense inflammation, and has zero proven benefit in inactivating bloodborne viruses in vivo.',
      dangerEs: 'Verter antisépticos cáusticos, cloro casero, agua oxigenada o povidona yodada concentrada en la punción produce necrosis química tisular, destruye la barrera protectora de la piel y no ofrece beneficio alguno para inactivar virus in vivo.',
    },
    {
      practiceEn: 'DO NOT SUCK THE WOUND BY MOUTH',
      practiceEs: 'NO SUCCIONE LA HERIDA CON LA BOCA',
      dangerEn: 'Introduces oral polymicrobial flora (Streptococci, anaerobes) into the puncture site, provoking severe pyogenic infection, while providing zero cleansing benefit.',
      dangerEs: 'Introduce flora polimicrobiana oral en el sitio de punción, provocando infecciones bacterianas graves y celulitis sin aportar beneficio de limpieza.',
    },
  ]),
});

// ============================================================================
// CLINICAL PEP PROTOCOLS: 72-HOUR WINDOW & ANTIRETROVIRAL REGIMENS
// ============================================================================

export const PEP_CLINICAL_REGIMENS = Object.freeze({
  timingWindow: Object.freeze({
    idealEn: '< 2 hours post-exposure (maximum preventive efficacy before systemic viral dissemination)',
    idealEs: '< 2 horas tras la exposición (máxima eficacia preventiva antes de la diseminación viral)',
    limitEn: 'Within 72 hours post-exposure (strict statutory eligibility limit; beyond 72 hours, animal and human data show no protective efficacy)',
    limitEs: 'Dentro de las 72 horas tras la exposición (límite estricto; tras 72 horas los estudios no demuestran eficacia protectora)',
    durationEn: '28 full days (4 weeks) of continuous once-daily therapy. Unbroken compliance is essential to abort viral replication.',
    durationEs: '28 días completos (4 semanas) de terapia continua diaria. El cumplimiento ininterrumpido es esencial para abortar la replicación.',
  }),
  preferredRegimen: Object.freeze({
    name: 'Biktarvy (Bictegravir 50 mg / Emtricitabine 200 mg / Tenofovir Alafenamide 25 mg)',
    doseEn: '1 tablet orally once daily with or without food for 28 consecutive days.',
    doseEs: '1 tableta vía oral una vez al día con o sin alimentos durante 28 días consecutivos.',
    advantagesEn: 'Preferred single-tablet once-daily regimen with high barrier to resistance, minimal GI toxicity, and favorable renal/bone profile due to tenofovir alafenamide (TAF).',
    advantagesEs: 'Régimen preferido de tableta única una vez al día, con alta barrera a resistencia, mínima toxicidad digestiva y excelente perfil renal y óseo (TAF).',
    monitoringEn: 'Baseline rapid HIV Ag/Ab test, baseline creatinine/eGFR (requires eGFR >= 30 mL/min). Repeat HIV test at 4-6 weeks and 3 months.',
    monitoringEs: 'Prueba rápida basal VIH Ag/Ac, creatinina/TFGe basal (requiere TFGe >= 30 mL/min). Repetir prueba de VIH a las 4-6 semanas y a los 3 meses.',
  }),
  alternativeRegimen: Object.freeze({
    name: 'Dolutegravir (Tivicay 50 mg) + Truvada (Tenofovir Disoproxil Fumarate 300 mg / Emtricitabine 200 mg)',
    doseEn: 'Tivicay 50 mg (1 tab) once daily PLUS Truvada (1 tab) once daily for 28 consecutive days.',
    doseEs: 'Tivicay 50 mg (1 tableta) una vez al día MÁS Truvada (1 tableta) una vez al día por 28 días consecutivos.',
    advantagesEn: 'Standard alternative combination; widely stocked in emergency department 3-to-7-day PEP starter packs.',
    advantagesEs: 'Combinación alternativa estándar; ampliamente disponible en paquetes de inicio de PEP de 3 a 7 días en urgencias.',
    monitoringEn: 'Baseline rapid HIV Ag/Ab, serum creatinine, urine protein. If CrCl < 50 mL/min, Truvada requires dose interval modification.',
    monitoringEs: 'Prueba rápida basal VIH, creatinina sérica. Si ClCr < 50 mL/min, Truvada requiere ajuste del intervalo de dosis.',
  }),
  starterPackPrincipleEn: 'Emergency departments and urgent care clinics should dispense a 3-to-7-day PEP starter pack immediately at the initial visit to ensure prompt initiation without pharmacy delays, with follow-up arranged within 72 hours for full 28-day script continuation.',
  starterPackPrincipleEs: 'Los servicios de urgencias deben entregar un paquete de inicio de PEP de 3 a 7 días inmediatamente en la consulta inicial para evitar retrasos de farmacia, programando el seguimiento en 72 horas para dispensar los 28 días completos.',
});

// ============================================================================
// HEPATITIS B & TETANUS POST-EXPOSURE PROTOCOLS
// ============================================================================

export const HEPATITIS_B_PEP_ALGORITHM = Object.freeze([
  {
    workerStatusEn: 'Vaccinated Responder (Documented anti-HBs >= 10 mIU/mL)',
    workerStatusEs: 'Vacunado respondedor (anti-HBs documentado >= 10 mIU/mL)',
    hBsAgPositiveSourceEn: 'No treatment needed. Long-term immunological memory confers protection even if current antibody titer has waned.',
    hBsAgPositiveSourceEs: 'No requiere tratamiento. La memoria inmunológica a largo plazo confiere protección aun si el título disminuyó.',
    unknownOrCommunitySourceEn: 'No treatment needed. Patient is completely protected.',
    unknownOrCommunitySourceEs: 'No requiere tratamiento. El paciente está completamente protegido.',
  },
  {
    workerStatusEn: 'Vaccinated Non-Responder (Completed 2 full vaccine series, anti-HBs < 10 mIU/mL)',
    workerStatusEs: 'Vacunado no respondedor (Completó 2 series de vacunación, anti-HBs < 10 mIU/mL)',
    hBsAgPositiveSourceEn: 'Administer Hepatitis B Immune Globulin (HBIG, 0.06 mL/kg IM) immediately (< 24 hours) AND repeat second dose of HBIG 1 month later.',
    hBsAgPositiveSourceEs: 'Administrar Inmunoglobulina contra Hepatitis B (IGHB, 0.06 mL/kg IM) de inmediato (< 24 h) Y repetir segunda dosis de IGHB 1 mes después.',
    unknownOrCommunitySourceEn: 'Administer 1 dose of HBIG (0.06 mL/kg IM) immediately. No further vaccine series required.',
    unknownOrCommunitySourceEs: 'Administrar 1 dosis de IGHB (0.06 mL/kg IM) de inmediato. No requiere más vacunas.',
  },
  {
    workerStatusEn: 'Vaccinated, Response Unknown (Completed series, but never had titer checked)',
    workerStatusEs: 'Vacunado con respuesta desconocida (Completó serie, pero nunca midió anticuerpos)',
    hBsAgPositiveSourceEn: 'Draw anti-HBs titer immediately. Administer 1 dose of HBIG (0.06 mL/kg IM) PLUS 1 booster dose of Hepatitis B vaccine. If titer comes back >= 10 mIU/mL, no further doses needed.',
    hBsAgPositiveSourceEs: 'Extraer título de anti-HBs de inmediato. Administrar 1 dosis de IGHB (0.06 mL/kg IM) MÁS 1 dosis de refuerzo de vacuna contra Hepatitis B. Si el título resulta >= 10 mIU/mL, no requiere más dosis.',
    unknownOrCommunitySourceEn: 'Draw anti-HBs titer immediately. Administer 1 booster dose of Hepatitis B vaccine. If titer < 10 mIU/mL, complete standard revaccination series.',
    unknownOrCommunitySourceEs: 'Extraer título de anti-HBs de inmediato. Administrar 1 dosis de refuerzo de vacuna contra Hepatitis B. Si resulta < 10 mIU/mL, completar serie de revacunación.',
  },
  {
    workerStatusEn: 'Unvaccinated or Incompletely Vaccinated',
    workerStatusEs: 'No vacunado o vacunación incompleta',
    hBsAgPositiveSourceEn: 'Administer HBIG (0.06 mL/kg IM) immediately (< 24 hours) PLUS initiate standard 3-dose Hepatitis B vaccine series (Month 0, 1, and 6) or 2-dose series (Heplisav-B at Month 0 and 1).',
    hBsAgPositiveSourceEs: 'Administrar IGHB (0.06 mL/kg IM) de inmediato (< 24 h) MÁS iniciar serie de 3 dosis de vacuna contra Hepatitis B (mes 0, 1 y 6) o serie de 2 dosis (Heplisav-B en mes 0 y 1).',
    unknownOrCommunitySourceEn: 'Initiate standard Hepatitis B vaccine series immediately (dose 1 within 24 hours). HBIG is generally not indicated for unknown community sharps unless high suspicion.',
    unknownOrCommunitySourceEs: 'Iniciar serie de vacuna contra Hepatitis B de inmediato (dosis 1 en 24 h). La IGHB generalmente no está indicada en pinchazos comunitarios de fuente desconocida salvo sospecha fundada.',
  },
]);

export const TETANUS_POST_EXPOSURE = Object.freeze({
  cleanMinorWound: 'Administer Td or Tdap booster if > 10 years since last tetanus toxoid dose.',
  contaminatedDeepSharps: 'Administer Tdap booster if > 5 years since last tetanus dose. If patient has received < 3 lifetime tetanus doses, administer Tdap PLUS Tetanus Immune Globulin (TIG 250 units IM) at separate anatomical sites.',
});

// ============================================================================
// OSHA BLOODBORNE PATHOGENS STANDARD (29 CFR § 1910.1030) & WORKER RIGHTS
// ============================================================================

export const OSHA_WORKER_RIGHTS = Object.freeze({
  titleEn: 'OSHA Bloodborne Pathogens Standard (29 CFR § 1910.1030) Worker Rights',
  titleEs: 'Derechos del Trabajador según la Norma de Patógenos Transmitidos por la Sangre de OSHA (29 CFR § 1910.1030)',
  rights: Object.freeze([
    {
      rightEn: '100% Employer-Paid Medical Evaluation & PEP',
      rightEs: 'Evaluación Médica y PEP 100% Pagados por el Empleador',
      detailEn: 'By federal law, the employer must make immediately available a confidential medical evaluation, post-exposure prophylaxis medications (full 28-day supply), and all follow-up laboratory testing at NO COST to the employee. No co-pays, no deductibles, no billing to employee personal insurance.',
      detailEs: 'Por ley federal, el empleador debe proporcionar de inmediato una evaluación médica confidencial, los medicamentos de profilaxis post-exposición (suministro completo de 28 días) y pruebas de seguimiento SIN COSTO para el trabajador.',
    },
    {
      rightEn: 'Immediate, Confidential Healthcare Access',
      rightEs: 'Acceso Médico Inmediato y Confidencial',
      detailEn: 'The exposed employee must be permitted to seek immediate evaluation during working hours without delay or financial penalty. Medical records generated during post-exposure care are strictly confidential employee health records and cannot be disclosed to supervisors or human resources without written consent.',
      detailEs: 'El trabajador debe poder acudir de inmediato a recibir atención médica durante el turno de trabajo sin demoras ni sanciones. Los registros médicos son confidenciales y no se comparten con supervisores.',
    },
    {
      rightEn: 'Non-Retaliation & Whistleblower Protection',
      rightEs: 'Protección contra Represalias y Denuncias',
      detailEn: 'Under Section 11(c) of the Occupational Safety and Health Act, it is illegal for an employer to discharge, discipline, demote, or discriminate in any manner against an employee for reporting a sharps injury or blood exposure incident.',
      detailEs: 'Bajo la Sección 11(c) de la Ley OSHA, es ilegal despedir, disciplinar, degradar o discriminar a un trabajador por reportar un pinchazo de aguja o incidente de exposición biológica.',
    },
    {
      rightEn: 'Voluntary Source Testing & Engineering Controls',
      rightEs: 'Pruebas a la Persona Fuente y Controles de Ingeniería',
      detailEn: 'Employers must attempt to obtain consent and test the source individual’s blood for HIV, HBV, and HCV as soon as feasible. Employers must also document the device brand and mechanism on an OSHA Sharps Injury Log to identify defective safety devices.',
      detailEs: 'El empleador debe intentar obtener consentimiento para analizar la sangre de la persona fuente (VIH, VHB, VHC) y registrar el dispositivo en el Libro de Registro de Lesiones por Objetos Cortopunzantes de OSHA.',
    },
  ]),
});

// ============================================================================
// COMMUNITY NEEDLE SAFETY & SAFE SHARPS DISPOSAL GUIDE
// ============================================================================

export const COMMUNITY_SHARPS_SAFETY = Object.freeze({
  mythDebunkingEn: 'Finding a discarded needle in a park, street, or public restroom causes acute terror. However, multiple international public health studies tracking thousands of community accidental needle sticks (including children) have documented ZERO cases of HIV transmission. Sunlight, temperature extremes, and rapid fluid evaporation render HIV non-viable within hours. Hepatitis B is the only hardy bloodborne virus in dried blood; if vaccinated against HBV, true medical risk is negligible.',
  mythDebunkingEs: 'Encontrar una aguja tirada en un parque o calle genera pánico. Sin embargo, estudios internacionales que siguieron a miles de personas (incluidos niños) con pinchazos accidentales comunitarios registraron CERO transmisiones de VIH. El sol y la evaporación desactivan el VIH en pocas horas. El virus de Hepatitis B es el único que persiste en sangre seca; estando vacunado contra VHB, el riesgo real es prácticamente nulo.',
  safePickupSteps: Object.freeze([
    {
      step: 1,
      ruleEn: 'Never touch a discarded needle with bare hands.',
      ruleEs: 'Nunca toque una jeringa o aguja con las manos desnudas.',
      detailEn: 'Always use puncture-resistant work gloves, heavy gardening gloves, or mechanical tools (pliers, barbecue tongs, grabbers).',
      detailEs: 'Use siempre guantes resistentes a punciones, guantes de jardinería gruesos o pinzas metálicas.',
    },
    {
      step: 2,
      ruleEn: 'Do not recap, bend, or break the needle.',
      ruleEs: 'No vuelva a tapar, doblar ni romper la aguja.',
      detailEn: 'Recapping is the single leading cause of accidental needle punctures. Leave the needle attached to the barrel exactly as found.',
      detailEs: 'Reencapuchar es la causa principal de pinchazos accidentales. Deje la aguja unida a la jeringa tal como la encontró.',
    },
    {
      step: 3,
      ruleEn: 'Place the needle point-down into a rigid, heavy-duty container.',
      ruleEs: 'Coloque la aguja con la punta hacia abajo en un contenedor rígido resistente.',
      detailEn: 'Use an empty liquid laundry detergent bottle, bleach bottle, or FDA-cleared biohazard sharps container with a secure screw-on cap. Never use thin water bottles, milk jugs, or glass jars that can shatter.',
      detailEs: 'Use una botella vacía de detergente líquido, botella de cloro o contenedor para objetos punzocortantes con tapa de rosca. Nunca use botellas finas de agua ni frascos de vidrio.',
    },
    {
      step: 4,
      ruleEn: 'Seal with heavy tape and label prominently.',
      ruleEs: 'Selle con cinta adhesiva resistente y etiquete con claridad.',
      detailEn: 'Screw cap on tightly and reinforce with duct tape. Write clearly in permanent marker: "SHARPS / BIOHAZARD - DO NOT RECYCLE".',
      detailEs: 'Apriete la tapa y refuerce con cinta adhesiva plateada. Escriba con marcador permanente: "OBJETOS PUNZOCORTANTES - PELIGRO BIOLÓGICO - NO RECICLAR".',
    },
    {
      step: 5,
      ruleEn: 'Drop off at authorized sharps disposal locations.',
      ruleEs: 'Lleve el recipiente a un punto autorizado de desecho de punzocortantes.',
      detailEn: 'Take to a community safe disposal kiosk, fire station, participating pharmacy, syringe service program (SSP), or municipal hazardous waste drop-off. Never place in residential recycling bins.',
      detailEs: 'Entregue en un buzón comunitario de agujas, estación de bomberos, farmacia participante, programa de jeringas (SSP) o centro de residuos peligrosos. Nunca lo tire al reciclaje.',
    },
  ]),
});

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialExposureState = () => ({
  activeTab: 'calculator', // 'calculator' | 'decontamination' | 'pep-regimens' | 'hbv-tetanus' | 'osha-rights' | 'community-sharps'
  viewMode: 'occupational', // 'occupational' | 'community'
  exposureType: 'percutaneous_deep', // 'percutaneous_deep' | 'percutaneous_superficial' | 'mucous_splash' | 'intact_skin'
  deviceType: 'hollow_bore_blood', // 'hollow_bore_blood' | 'solid_needle' | 'community_discarded' | 'splash_fluid'
  timeElapsed: 'under_2h', // 'under_2h' | '2h_to_24h' | '24h_to_72h' | 'over_72h'
  sourceStatus: 'unknown_high_risk', // 'known_hiv_positive' | 'unknown_high_risk' | 'unknown_low_risk' | 'known_negative'
  workerHbvStatus: 'vaccinated_responder', // 'vaccinated_responder' | 'vaccinated_unknown' | 'vaccinated_nonresponder' | 'unvaccinated'
  tetanusYears: 'under_5', // 'under_5' | '5_to_10' | 'over_10' | 'never_unknown'
});

let currentExposureState = initialExposureState();
const stateSubscribers = new Set();

export function getExposureState() {
  return { ...currentExposureState };
}

export function setExposureState(patch) {
  currentExposureState = { ...currentExposureState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentExposureState);
    } catch {
      // ignore observer exceptions
    }
  }
}

export function resetExposureState() {
  currentExposureState = initialExposureState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentExposureState);
    } catch {
      // ignore observer exceptions
    }
  }
}

export function subscribeExposureState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL RISK EVALUATION ENGINE
// ============================================================================

export function evaluateExposureRisk(state) {
  const {
    exposureType,
    deviceType,
    timeElapsed,
    sourceStatus,
    workerHbvStatus,
    tetanusYears,
    viewMode,
  } = state;

  // Intact skin has no transmission risk
  if (exposureType === 'intact_skin') {
    return {
      urgencyTier: 'no_risk',
      tierTitleEn: 'No Identifiable Transmission Risk (Intact Skin)',
      tierTitleEs: 'Sin Riesgo Identificable de Transmisión (Piel Íntegra)',
      pepRecommended: false,
      pepReasonEn: 'Intact skin serves as a complete physical barrier to HIV, HBV, and HCV. Post-exposure prophylaxis is not indicated. Wash area thoroughly with soap and water.',
      pepReasonEs: 'La piel íntegra actúa como una barrera física completa contra VIH, VHB y VHC. No está indicada la profilaxis post-exposición. Lave bien el área con agua y jabón.',
      hbvActionEn: 'No intervention required.',
      hbvActionEs: 'No requiere intervención.',
      tetanusActionEn: 'No tetanus prophylaxis indicated for intact skin.',
      tetanusActionEs: 'No requiere profilaxis de tétanos en piel intacta.',
      followUpEn: 'No follow-up blood tests needed.',
      followUpEs: 'No se requieren pruebas sanguíneas de seguimiento.',
      isEmergency: false,
    };
  }

  // Time elapsed > 72 hours
  if (timeElapsed === 'over_72h') {
    return {
      urgencyTier: 'window_expired',
      tierTitleEn: 'PEP 72-Hour Window Expired (Seek Baseline & Follow-Up Testing)',
      tierTitleEs: 'Ventana de 72 Horas de PEP Expirada (Realizar Pruebas Basales y Seguimiento)',
      pepRecommended: false,
      pepReasonEn: 'More than 72 hours have elapsed since exposure. Antiretroviral PEP is not recommended because systemic viral dissemination has already occurred and clinical trials show no protective efficacy after 72 hours. Immediate baseline HIV/HBV/HCV testing is still critical.',
      pepReasonEs: 'Han transcurrido más de 72 horas. La PEP antirretroviral no está recomendada porque la diseminación viral sistémica ya se ha producido y no existe eficacia demostrada. Aún se deben realizar pruebas basales de VIH/VHB/VHC.',
      hbvActionEn: workerHbvStatus === 'vaccinated_responder' ? 'Fully protected against HBV.' : 'Consult clinician immediately for HBV vaccination / titer.',
      hbvActionEs: workerHbvStatus === 'vaccinated_responder' ? 'Completamente protegido contra VHB.' : 'Consulte médico para valorar vacuna/título de VHB.',
      tetanusActionEn: (tetanusYears === 'over_10' || tetanusYears === 'never_unknown') ? 'Administer Tdap booster for wound.' : 'Tetanus up to date.',
      tetanusActionEs: (tetanusYears === 'over_10' || tetanusYears === 'never_unknown') ? 'Administrar refuerzo de Tdpa para la herida.' : 'Tétanos al día.',
      followUpEn: 'Obtain baseline HIV Ag/Ab, HCV Ab/RNA, and anti-HBs titer now. Repeat HIV testing at 4-6 weeks and 3 months.',
      followUpEs: 'Realizar prueba basal de VIH Ag/Ac, VHC Ac/ARN y anti-HBs ahora. Repetir prueba de VIH a las 4-6 semanas y 3 meses.',
      isEmergency: false,
    };
  }

  // Source is known confirmed negative
  if (sourceStatus === 'known_negative') {
    return {
      urgencyTier: 'source_negative',
      tierTitleEn: 'Source Confirmed Negative (PEP Not Indicated)',
      tierTitleEs: 'Fuente Confirmada Negativa (PEP No Indicada)',
      pepRecommended: false,
      pepReasonEn: 'When the source individual is confirmed HIV-negative (with rapid 4th-generation antigen/antibody testing), antiretroviral PEP is not indicated. Continue baseline monitoring if source had recent acute exposure within window period.',
      pepReasonEs: 'Si la persona fuente es confirmada VIH negativa (prueba de 4.ª generación), la PEP antirretroviral no está indicada. Mantener seguimiento si la fuente tuvo exposición de riesgo en período ventana.',
      hbvActionEn: workerHbvStatus === 'vaccinated_responder' ? 'Protected.' : 'Consider updating HBV vaccination.',
      hbvActionEs: workerHbvStatus === 'vaccinated_responder' ? 'Protegido.' : 'Considere actualizar la vacuna de VHB.',
      tetanusActionEn: (tetanusYears === 'over_10' || tetanusYears === 'never_unknown') ? 'Administer Tdap booster.' : 'Tetanus up to date.',
      tetanusActionEs: (tetanusYears === 'over_10' || tetanusYears === 'never_unknown') ? 'Administrar refuerzo de Tdpa.' : 'Tétanos al día.',
      followUpEn: 'Routine wound care.',
      followUpEs: 'Cuidado habitual de la herida.',
      isEmergency: false,
    };
  }

  // High risk exposure: Percutaneous or Mucous Splash within 72 hours
  const isImmediate = timeElapsed === 'under_2h';
  const isHollowBore = deviceType === 'hollow_bore_blood';
  const isCommunityDiscarded = deviceType === 'community_discarded';

  // Determine PEP recommendation
  let pepRec = true;
  let pepDetailEn = '';
  let pepDetailEs = '';

  if (isCommunityDiscarded && viewMode === 'community') {
    // In outdoor community discarded needle, risk of HIV is negligible
    pepDetailEn = 'In outdoor community needle encounters, HIV transmission risk is near 0% due to rapid viral desiccation. PEP is generally not routinely recommended unless the needle was visibly filled with fresh wet blood or known to come from an untreated HIV source immediately prior. Clinical evaluation within 72 hours is recommended to decide on case-by-case basis.';
    pepDetailEs = 'En pinchazos comunitarios al aire libre, el riesgo de VIH es cercano al 0% por la rápida desecación viral. La PEP no suele indicarse de forma rutinaria salvo que la jeringa tuviera sangre fresca visible o fuente de alto riesgo reciente. Se aconseja valoración clínica.';
    pepRec = (sourceStatus === 'known_hiv_positive' || isImmediate);
  } else {
    pepDetailEn = isImmediate
      ? 'CRITICAL EMERGENCY: Initiate 28-day antiretroviral PEP immediately (ideal window < 2 hours). First dose should be taken on-site before discharge.'
      : 'URGENT: Initiate 28-day antiretroviral PEP as soon as possible within the 72-hour window. Obtain baseline rapid HIV test prior to or concurrent with first dose.';
    pepDetailEs = isImmediate
      ? 'EMERGENCIA CRÍTICA: Inicie la PEP antirretroviral de 28 días de inmediato (ventana ideal < 2 horas). La primera dosis debe tomarse en el centro de atención.'
      : 'URGENTE: Inicie la PEP antirretroviral de 28 días lo antes posible dentro del límite de 72 horas. Realice prueba rápida de VIH antes o junto a la primera dosis.';
  }

  // HBV recommendation
  let hbvDetailEn = '';
  let hbvDetailEs = '';
  if (workerHbvStatus === 'vaccinated_responder') {
    hbvDetailEn = 'Fully protected against HBV. No HBIG or vaccine booster required.';
    hbvDetailEs = 'Completamente protegido contra VHB. No requiere IGHB ni dosis de refuerzo.';
  } else if (workerHbvStatus === 'vaccinated_unknown') {
    hbvDetailEn = 'Draw anti-HBs titer immediately. Administer 1 Hepatitis B vaccine booster dose now. If source is confirmed HBsAg-positive, give HBIG 0.06 mL/kg IM.';
    hbvDetailEs = 'Extraer título de anti-HBs de inmediato. Administrar 1 dosis de refuerzo de vacuna contra VHB ahora. Si la fuente es HBsAg positivo, aplicar IGHB 0.06 mL/kg IM.';
  } else if (workerHbvStatus === 'vaccinated_nonresponder') {
    hbvDetailEn = 'Administer HBIG 0.06 mL/kg IM immediately (< 24h) and repeat second dose in 1 month.';
    hbvDetailEs = 'Administrar IGHB 0.06 mL/kg IM de inmediato (< 24 h) y repetir segunda dosis en 1 mes.';
  } else {
    // Unvaccinated
    hbvDetailEn = 'Administer HBIG 0.06 mL/kg IM immediately (< 24h) AND start standard Hepatitis B vaccine series (dose 1 within 24h).';
    hbvDetailEs = 'Administrar IGHB 0.06 mL/kg IM de inmediato (< 24 h) E iniciar serie de vacunación contra Hepatitis B (dosis 1 en 24 h).';
  }

  // Tetanus recommendation
  let tetDetailEn = '';
  let tetDetailEs = '';
  if (tetanusYears === 'under_5') {
    tetDetailEn = 'Tetanus immunization is current (< 5 years). No booster needed.';
    tetDetailEs = 'Inmunización de tétanos al día (< 5 años). No requiere refuerzo.';
  } else if (tetanusYears === '5_to_10') {
    tetDetailEn = 'Administer Tdap booster if wound is deep or contaminated with outdoor soil/debris.';
    tetDetailEs = 'Administrar refuerzo de Tdpa si la herida es profunda o contaminada con tierra/escombros.';
  } else {
    tetDetailEn = 'Administer Tdap booster immediately. If < 3 lifetime tetanus doses, give Tdap + Tetanus Immune Globulin (TIG 250 units IM).';
    tetDetailEs = 'Administrar refuerzo de Tdpa de inmediato. Si ha recibido < 3 dosis en su vida, aplicar Tdpa + Inmunoglobulina Antitetánica (TIG 250 unidades IM).';
  }

  return {
    urgencyTier: isImmediate ? 'emergency_immediate' : 'urgent_pep',
    tierTitleEn: isImmediate ? 'CRITICAL EMERGENCY: < 2-Hour Golden Window (Immediate PEP)' : 'URGENT: Initiate PEP Within 72-Hour Window',
    tierTitleEs: isImmediate ? 'EMERGENCIA CRÍTICA: Ventana de Oro < 2 Horas (PEP Inmediata)' : 'URGENTE: Iniciar PEP Dentro del Límite de 72 Horas',
    pepRecommended: pepRec,
    pepReasonEn: pepDetailEn,
    pepReasonEs: pepDetailEs,
    hbvActionEn: hbvDetailEn,
    hbvActionEs: hbvDetailEs,
    tetanusActionEn: tetDetailEn,
    tetanusActionEs: tetDetailEs,
    followUpEn: 'Baseline: Rapid HIV Ag/Ab, HCV Ab/RNA, anti-HBs titer, eGFR/creatinine. Repeat HIV test at 4-6 weeks and 3 months. HCV RNA at 4-6 weeks and HCV Ab at 4-6 months.',
    followUpEs: 'Basal: VIH Ag/Ac rápido, VHC Ac/ARN, título anti-HBs, creatinina/TFGe. Repetir prueba de VIH a las 4-6 semanas y 3 meses. ARN VHC a las 4-6 semanas y Ac VHC a los 4-6 meses.',
    isEmergency: isImmediate || pepRec,
  };
}

// ============================================================================
// ZERO-PII SBAR NOTE GENERATOR FOR EMERGENCY / EMPLOYEE HEALTH HANDOFF
// ============================================================================

export function buildExposureSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '====================================================================',
      'INFORME SBAR DE EXPOSICIÓN A OBJETOS PUNZOCORTANTES / MATERIAL BIOLÓGICO',
      'Plataforma Clínica HarborPath - Privacidad Estricta Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      `Incidente de exposición a objeto punzocortante/fluido biológico: ${state.exposureType}.`,
      `Entorno: ${state.viewMode === 'occupational' ? 'Ocupacional (Trabajador de salud / primer respondedor)' : 'Comunitario / Vía pública'}.`,
      `Tiempo transcurrido desde la exposición: ${state.timeElapsed}.`,
      `Nivel de urgencia evaluado: ${evaluation.tierTitleEs}.`,
      '',
      'B (ANTECEDENTES / DETALLES DEL DISPOSITIVO):',
      `- Tipo de dispositivo: ${state.deviceType}.`,
      `- Estado serológico de la fuente: ${state.sourceStatus}.`,
      `- Estado vacunal del paciente frente a VHB: ${state.workerHbvStatus}.`,
      `- Último refuerzo de tétanos: ${state.tetanusYears}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Indicación de Profilaxis Post-Exposición (PEP) VIH: ${evaluation.pepRecommended ? 'INDICADA (Régimen de 28 días)' : 'NO INDICADA O EVALUACIÓN INDIVIDUAL'}.`,
      `- Detalle clínico de PEP: ${evaluation.pepReasonEs}`,
      `- Profilaxis contra Hepatitis B: ${evaluation.hbvActionEs}`,
      `- Profilaxis antitetánica: ${evaluation.tetanusActionEs}`,
      '',
      'R (RECOMENDACIONES Y PLAN DE ACCIÓN):',
      '1. Si está indicada la PEP, suministrar paquete de inicio (3 a 7 días) de inmediato.',
      '   Régimen preferido: Biktarvy (1 comprimido PO diario) o Tivicay + Truvada x 28 días.',
      '2. Realizar serologías basales inmediatas: VIH Ag/Ac 4.ª gen, Ac VHC y ARN VHC, anti-HBs, TFGe/creatinina.',
      '3. Si es exposición ocupacional, aplicar la Norma OSHA 1910.1030 (100% financiado por empleador sin copagos).',
      '4. Programar citas de seguimiento serológico: 4-6 semanas y 3 meses.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'SHARPS INJURY & BLOODBORNE PATHOGEN EXPOSURE SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Privacy Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    `Sharps injury or body fluid exposure incident: ${state.exposureType}.`,
    `Setting: ${state.viewMode === 'occupational' ? 'Occupational (Healthcare personnel / First responder)' : 'Community / Public space'}.`,
    `Time elapsed since exposure: ${state.timeElapsed}.`,
    `Clinical Urgency Tier: ${evaluation.tierTitleEn}.`,
    '',
    'B (BACKGROUND / INCIDENT DETAILS):',
    `- Device / sharps type: ${state.deviceType}.`,
    `- Source individual status: ${state.sourceStatus}.`,
    `- Exposed person HBV vaccination status: ${state.workerHbvStatus}.`,
    `- Last tetanus toxoid booster: ${state.tetanusYears}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- HIV Post-Exposure Prophylaxis (PEP): ${evaluation.pepRecommended ? 'RECOMMENDED (Full 28-day course)' : 'NOT INDICATED OR CASE-BY-CASE'}.`,
    `- PEP Clinical Detail: ${evaluation.pepReasonEn}`,
    `- Hepatitis B Management: ${evaluation.hbvActionEn}`,
    `- Tetanus Prophylaxis: ${evaluation.tetanusActionEn}`,
    '',
    'R (RECOMMENDATIONS & ACTION PLAN):',
    '1. If PEP indicated, dispense 3-to-7 day starter pack immediately on site.',
    '   Preferred regimen: Biktarvy (1 tablet PO daily) or Tivicay + Truvada x 28 days.',
    '2. Obtain immediate baseline bloodwork: Rapid HIV 4th gen Ag/Ab, HCV Ab & HCV RNA, anti-HBs titer, serum creatinine/eGFR.',
    '3. If occupational, apply OSHA 1910.1030 protections (100% employer paid, zero out-of-pocket costs).',
    '4. Schedule follow-up serology at 4-6 weeks and 3 months.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function needleExposureView() {
  const container = h('div', { class: 'needle-exposure-view' });

  function render() {
    clear(container);
    const state = getExposureState();
    const evaluation = evaluateExposureRisk(state);

    // 1. Header Banner with Golden Window Alert
    const header = h('header', { class: 'exposure-header' }, [
      h('div', { class: 'exposure-header-badge' }, [
        icon('alert'),
        h('span', {}, t('needle.header.badge', 'Emergency Exposure Protocol')),
      ]),
      h('h1', { class: 'exposure-header-title' }, t('needle.header.title', 'Needle Stick, Sharps Injury & Bloodborne Pathogen PEP Protocol')),
      h('p', { class: 'exposure-header-desc' }, t('needle.header.desc', 'Evidence-based post-exposure prophylaxis (PEP) decision support for healthcare workers, clinicians, first responders, and community members under CDC, USPHS, and OSHA 29 CFR § 1910.1030 standards.')),
    ]);

    // Golden Window Notice Card
    const windowCard = h('div', { class: 'exposure-timer-card' }, [
      h('div', { class: 'timer-card-icon' }, [icon('clock')]),
      h('div', { class: 'timer-card-content' }, [
        h('h2', { class: 'timer-card-title' }, t('needle.timer.title', 'The 72-Hour Golden Window for HIV PEP')),
        h('p', { class: 'timer-card-text' }, [
          h('strong', {}, t('needle.timer.strong', 'Initiate within 2 hours if possible, up to 72 hours maximum. ')),
          t('needle.timer.detail', 'Antiretroviral PEP must be started as soon as possible after exposure to prevent viral integration into host cellular reservoirs. After 72 hours, animal and human trials show no preventive benefit.'),
        ]),
      ]),
    ]);

    // 2. Dual-Mode Switcher (Occupational vs Community)
    const modeSwitcher = h('div', { class: 'exposure-mode-switcher', role: 'group', 'aria-label': 'Exposure Setting Selector' }, [
      h('button', {
        class: `mode-toggle-btn ${state.viewMode === 'occupational' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'occupational' ? 'true' : 'false',
        onclick: () => setExposureState({ viewMode: 'occupational' }),
      }, [
        icon('check'),
        h('span', {}, t('needle.mode.occupational', 'Healthcare & Occupational Exposure (OSHA / Clinician Mode)')),
      ]),
      h('button', {
        class: `mode-toggle-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setExposureState({ viewMode: 'community' }),
      }, [
        icon('shield'),
        h('span', {}, t('needle.mode.community', 'Community & General Public Exposure (Parent / Citizen Mode)')),
      ]),
    ]);

    // 3. Tab Navigation
    const tabsList = h('div', { class: 'exposure-tabs-nav', role: 'tablist', 'aria-label': 'Exposure Navigation Tabs' }, [
      h('button', {
        class: `exposure-tab-btn ${state.activeTab === 'calculator' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'calculator' ? 'true' : 'false',
        onclick: () => setExposureState({ activeTab: 'calculator' }),
      }, t('needle.tabs.calculator', 'Triage & PEP Calculator')),
      h('button', {
        class: `exposure-tab-btn ${state.activeTab === 'decontamination' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'decontamination' ? 'true' : 'false',
        onclick: () => setExposureState({ activeTab: 'decontamination' }),
      }, t('needle.tabs.decontamination', 'First Aid & Banned Actions')),
      h('button', {
        class: `exposure-tab-btn ${state.activeTab === 'pep-regimens' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'pep-regimens' ? 'true' : 'false',
        onclick: () => setExposureState({ activeTab: 'pep-regimens' }),
      }, t('needle.tabs.pepRegimens', 'Antiretroviral Regimens')),
      h('button', {
        class: `exposure-tab-btn ${state.activeTab === 'hbv-tetanus' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'hbv-tetanus' ? 'true' : 'false',
        onclick: () => setExposureState({ activeTab: 'hbv-tetanus' }),
      }, t('needle.tabs.hbvTetanus', 'HBV, HCV & Tetanus Protocol')),
      h('button', {
        class: `exposure-tab-btn ${state.activeTab === 'osha-rights' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'osha-rights' ? 'true' : 'false',
        onclick: () => setExposureState({ activeTab: 'osha-rights' }),
      }, t('needle.tabs.oshaRights', 'OSHA Worker Rights (No Cost)')),
      h('button', {
        class: `exposure-tab-btn ${state.activeTab === 'community-sharps' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'community-sharps' ? 'true' : 'false',
        onclick: () => setExposureState({ activeTab: 'community-sharps' }),
      }, t('needle.tabs.communitySharps', 'Community Sharps & Safe Disposal')),
    ]);

    // Tab Content Panel
    let tabContent;
    switch (state.activeTab) {
      case 'decontamination':
        tabContent = renderDecontaminationTab();
        break;
      case 'pep-regimens':
        tabContent = renderPepRegimensTab();
        break;
      case 'hbv-tetanus':
        tabContent = renderHbvTetanusTab();
        break;
      case 'osha-rights':
        tabContent = renderOshaRightsTab();
        break;
      case 'community-sharps':
        tabContent = renderCommunitySharpsTab();
        break;
      case 'calculator':
      default:
        tabContent = renderCalculatorTab(state, evaluation);
        break;
    }

    container.appendChild(header);
    container.appendChild(windowCard);
    container.appendChild(modeSwitcher);
    container.appendChild(tabsList);
    container.appendChild(tabContent);
  }

  // --- SUB-RENDERERS ---

  function renderCalculatorTab(state, evaluation) {
    const section = h('section', { class: 'calculator-tab-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'exposure-inputs-grid' }, [
      // 1. Exposure Type
      h('div', { class: 'input-card' }, [
        h('label', { for: 'select-exposure-type', class: 'input-label' }, t('needle.label.exposureType', '1. Exposure Type')),
        h('select', {
          id: 'select-exposure-type',
          class: 'exposure-select',
          onchange: (e) => setExposureState({ exposureType: e.target.value }),
        }, [
          h('option', { value: 'percutaneous_deep', selected: state.exposureType === 'percutaneous_deep' }, t('needle.opt.deep', 'Deep percutaneous puncture (visible bleeding)')),
          h('option', { value: 'percutaneous_superficial', selected: state.exposureType === 'percutaneous_superficial' }, t('needle.opt.superficial', 'Superficial scratch / prick (no active bleeding)')),
          h('option', { value: 'mucous_splash', selected: state.exposureType === 'mucous_splash' }, t('needle.opt.splash', 'Mucous membrane splash (eyes, mouth, nose)')),
          h('option', { value: 'intact_skin', selected: state.exposureType === 'intact_skin' }, t('needle.opt.intact', 'Intact skin contact with blood / body fluid')),
        ]),
      ]),

      // 2. Device Type
      h('div', { class: 'input-card' }, [
        h('label', { for: 'select-device-type', class: 'input-label' }, t('needle.label.deviceType', '2. Device / Needle Type')),
        h('select', {
          id: 'select-device-type',
          class: 'exposure-select',
          onchange: (e) => setExposureState({ deviceType: e.target.value }),
        }, [
          h('option', { value: 'hollow_bore_blood', selected: state.deviceType === 'hollow_bore_blood' }, t('needle.opt.hollow', 'Hollow-bore needle with visible blood (IV, blood draw)')),
          h('option', { value: 'solid_needle', selected: state.deviceType === 'solid_needle' }, t('needle.opt.solid', 'Solid surgical needle or suture needle')),
          h('option', { value: 'community_discarded', selected: state.deviceType === 'community_discarded' }, t('needle.opt.discarded', 'Discarded needle in community / park (unknown age)')),
          h('option', { value: 'splash_fluid', selected: state.deviceType === 'splash_fluid' }, t('needle.opt.fluid', 'Blood or bloody body fluid splash')),
        ]),
      ]),

      // 3. Time Elapsed
      h('div', { class: 'input-card' }, [
        h('label', { for: 'select-time-elapsed', class: 'input-label' }, t('needle.label.timeElapsed', '3. Time Elapsed Since Exposure')),
        h('select', {
          id: 'select-time-elapsed',
          class: 'exposure-select',
          onchange: (e) => setExposureState({ timeElapsed: e.target.value }),
        }, [
          h('option', { value: 'under_2h', selected: state.timeElapsed === 'under_2h' }, t('needle.opt.under2h', '< 2 hours (Golden Window)')),
          h('option', { value: '2h_to_24h', selected: state.timeElapsed === '2h_to_24h' }, t('needle.opt.2to24h', '2 to 24 hours (Urgent PEP window)')),
          h('option', { value: '24h_to_72h', selected: state.timeElapsed === '24h_to_72h' }, t('needle.opt.24to72h', '24 to 72 hours (Eligible PEP window)')),
          h('option', { value: 'over_72h', selected: state.timeElapsed === 'over_72h' }, t('needle.opt.over72h', '> 72 hours (PEP window expired)')),
        ]),
      ]),

      // 4. Source Status
      h('div', { class: 'input-card' }, [
        h('label', { for: 'select-source-status', class: 'input-label' }, t('needle.label.sourceStatus', '4. Source Individual Status')),
        h('select', {
          id: 'select-source-status',
          class: 'exposure-select',
          onchange: (e) => setExposureState({ sourceStatus: e.target.value }),
        }, [
          h('option', { value: 'known_hiv_positive', selected: state.sourceStatus === 'known_hiv_positive' }, t('needle.opt.knownHiv', 'Known HIV-positive source (untreated or unknown viral load)')),
          h('option', { value: 'unknown_high_risk', selected: state.sourceStatus === 'unknown_high_risk' }, t('needle.opt.unknownHigh', 'Unknown source from high-prevalence population')),
          h('option', { value: 'unknown_low_risk', selected: state.sourceStatus === 'unknown_low_risk' }, t('needle.opt.unknownLow', 'Unknown source from general community')),
          h('option', { value: 'known_negative', selected: state.sourceStatus === 'known_negative' }, t('needle.opt.knownNeg', 'Confirmed HIV-negative source (rapid 4th gen test)')),
        ]),
      ]),

      // 5. Worker HBV Vaccination Status
      h('div', { class: 'input-card' }, [
        h('label', { for: 'select-hbv-status', class: 'input-label' }, t('needle.label.hbvStatus', '5. Exposed Person HBV Vaccination Status')),
        h('select', {
          id: 'select-hbv-status',
          class: 'exposure-select',
          onchange: (e) => setExposureState({ workerHbvStatus: e.target.value }),
        }, [
          h('option', { value: 'vaccinated_responder', selected: state.workerHbvStatus === 'vaccinated_responder' }, t('needle.opt.hbvResp', 'Vaccinated responder (known anti-HBs >= 10 mIU/mL)')),
          h('option', { value: 'vaccinated_unknown', selected: state.workerHbvStatus === 'vaccinated_unknown' }, t('needle.opt.hbvUnk', 'Vaccinated, but titer never tested / unknown')),
          h('option', { value: 'vaccinated_nonresponder', selected: state.workerHbvStatus === 'vaccinated_nonresponder' }, t('needle.opt.hbvNonResp', 'Vaccinated non-responder (2 full series, titer < 10)')),
          h('option', { value: 'unvaccinated', selected: state.workerHbvStatus === 'unvaccinated' }, t('needle.opt.hbvUnvac', 'Unvaccinated or incomplete series')),
        ]),
      ]),

      // 6. Tetanus Booster History
      h('div', { class: 'input-card' }, [
        h('label', { for: 'select-tetanus-status', class: 'input-label' }, t('needle.label.tetanusStatus', '6. Tetanus Toxoid Booster History')),
        h('select', {
          id: 'select-tetanus-status',
          class: 'exposure-select',
          onchange: (e) => setExposureState({ tetanusYears: e.target.value }),
        }, [
          h('option', { value: 'under_5', selected: state.tetanusYears === 'under_5' }, t('needle.opt.tetUnder5', 'Last dose < 5 years ago (Up to date)')),
          h('option', { value: '5_to_10', selected: state.tetanusYears === '5_to_10' }, t('needle.opt.tet5to10', 'Last dose 5 to 10 years ago')),
          h('option', { value: 'over_10', selected: state.tetanusYears === 'over_10' }, t('needle.opt.tetOver10', 'Last dose > 10 years ago')),
          h('option', { value: 'never_unknown', selected: state.tetanusYears === 'never_unknown' }, t('needle.opt.tetNever', 'Never vaccinated or unknown history')),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `evaluation-result-card ${evaluation.urgencyTier}` }, [
      h('div', { class: 'result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', { class: 'result-title' }, evaluation.tierTitleEn),
      ]),
      h('div', { class: 'result-details-grid' }, [
        h('div', { class: 'result-item' }, [
          h('strong', {}, t('needle.res.pep', 'HIV PEP Recommendation: ')),
          h('span', { class: evaluation.pepRecommended ? 'badge-danger' : 'badge-neutral' }, evaluation.pepRecommended ? 'INDICATED' : 'NOT ROUTINELY INDICATED'),
          h('p', {}, evaluation.pepReasonEn),
        ]),
        h('div', { class: 'result-item' }, [
          h('strong', {}, t('needle.res.hbv', 'Hepatitis B Protocol: ')),
          h('p', {}, evaluation.hbvActionEn),
        ]),
        h('div', { class: 'result-item' }, [
          h('strong', {}, t('needle.res.tetanus', 'Tetanus Prophylaxis: ')),
          h('p', {}, evaluation.tetanusActionEn),
        ]),
        h('div', { class: 'result-item' }, [
          h('strong', {}, t('needle.res.followup', 'Laboratory Baseline & Follow-up: ')),
          h('p', {}, evaluation.followUpEn),
        ]),
      ]),
    ]);

    // 1-Click SBAR Export Card
    const sbarCard = h('div', { class: 'sbar-export-container' }, [
      h('div', { class: 'sbar-header' }, [
        h('h4', {}, t('needle.sbar.title', 'Clinical Handoff & Documentation SBAR Generator (Zero PII)')),
        h('p', {}, t('needle.sbar.desc', 'Generate a standardized clinical SBAR note for Emergency Department triage, Urgent Care handoff, or Employee Health reporting. Operates 100% in local memory.')),
      ]),
      h('div', { class: 'sbar-actions' }, [
        h('button', {
          class: 'btn-copy-sbar',
          onclick: (e) => {
            const text = buildExposureSbarText(state, evaluation, 'en');
            navigator.clipboard.writeText(text).then(() => {
              const original = e.currentTarget.textContent;
              e.currentTarget.textContent = 'Copied to Clipboard!';
              setTimeout(() => { e.currentTarget.textContent = original; }, 2500);
            }).catch(() => {
              // fallback
            });
          },
        }, [icon('copy'), h('span', {}, t('needle.sbar.copyEn', 'Copy Clinical SBAR (English)'))]),
        h('button', {
          class: 'btn-copy-sbar secondary',
          onclick: (e) => {
            const text = buildExposureSbarText(state, evaluation, 'es');
            navigator.clipboard.writeText(text).then(() => {
              const original = e.currentTarget.textContent;
              e.currentTarget.textContent = '¡Copiado al Portapapeles!';
              setTimeout(() => { e.currentTarget.textContent = original; }, 2500);
            }).catch(() => {
              // fallback
            });
          },
        }, [icon('copy'), h('span', {}, t('needle.sbar.copyEs', 'Copiar SBAR (Español)'))]),
      ]),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderDecontaminationTab() {
    const section = h('section', { class: 'decontamination-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('needle.decon.title', 'Immediate First Aid & Decontamination Protocol')),
      h('p', { class: 'tab-subtitle' }, t('needle.decon.subtitle', 'First actions taken in the first 60 seconds determine mechanical viral inocula dilution. Follow evidence-based washing while avoiding tissue trauma.')),

      // Skin & Mucous Puncture Grid
      h('div', { class: 'decontamination-steps-grid' }, [
        h('div', { class: 'decon-card primary' }, [
          h('h3', {}, [icon('check'), h('span', {}, t('needle.decon.skinTitle', 'Skin Punctures or Lacerations'))]),
          h('ul', { class: 'decon-list' }, DECONTAMINATION_PROTOCOL.skinPuncture.map((step) => h('li', {}, [
            h('strong', {}, step.actionEn),
            h('p', { class: 'step-rationale' }, step.rationaleEn),
          ]))),
        ]),
        h('div', { class: 'decon-card primary' }, [
          h('h3', {}, [icon('check'), h('span', {}, t('needle.decon.mucousTitle', 'Eye & Mucous Membrane Splashes'))]),
          h('ul', { class: 'decon-list' }, DECONTAMINATION_PROTOCOL.mucousMembrane.map((step) => h('li', {}, [
            h('strong', {}, step.actionEn),
            h('p', { class: 'step-rationale' }, step.rationaleEn),
          ]))),
        ]),
      ]),

      // Banned / Contraindicated Actions
      h('div', { class: 'contraindications-card' }, [
        h('h3', { class: 'contra-title' }, [icon('alert'), h('span', {}, t('needle.contra.title', 'STRICTLY CONTRAINDICATED ACTIONS (Do Not Perform)'))]),
        h('div', { class: 'contra-grid' }, DECONTAMINATION_PROTOCOL.contraindicatedActions.map((c) => h('div', { class: 'contra-item' }, [
          h('h4', { class: 'contra-header' }, c.practiceEn),
          h('p', { class: 'contra-danger' }, c.dangerEn),
        ]))),
      ]),
    ]);
    return section;
  }

  function renderPepRegimensTab() {
    const section = h('section', { class: 'pep-regimens-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('needle.pep.title', 'CDC & USPHS Antiretroviral PEP Regimens')),
      h('p', { class: 'tab-subtitle' }, t('needle.pep.subtitle', 'A full 28-day antiretroviral course must be completed. Below are the preferred single-tablet and alternative regimens.')),

      // PEP-to-PrEP Continuity Card
      h('div', { class: 'pep-prep-banner', role: 'note' }, [
        icon('shield'),
        h('div', {}, [
          h('strong', {}, 'Ongoing Exposure Risk? Seamless Transition to PrEP: '),
          h('span', {}, 'If ongoing sexual or injection drug exposure persists upon completing the 28-day PEP course, transition directly to daily PrEP on Day 28 without any coverage lapse: '),
          h('a', { href: '#/sexual-health' }, 'Explore PrEP Modalities & Transition Protocol →'),
        ]),
      ]),

      // Starter Pack Banner
      h('div', { class: 'starter-pack-banner' }, [
        icon('alert'),
        h('div', {}, [
          h('strong', {}, t('needle.pep.starterStrong', 'Immediate Starter Pack Strategy: ')),
          h('span', {}, PEP_CLINICAL_REGIMENS.starterPackPrincipleEn),
        ]),
      ]),

      // Regimens Grid
      h('div', { class: 'pep-regimens-grid' }, [
        // Preferred: Biktarvy
        h('div', { class: 'regimen-card preferred' }, [
          h('div', { class: 'regimen-badge' }, t('needle.pep.badgePreferred', 'PREFERRED (1-Pill Once Daily)')),
          h('h3', { class: 'regimen-name' }, PEP_CLINICAL_REGIMENS.preferredRegimen.name),
          h('p', { class: 'regimen-dose' }, [h('strong', {}, 'Dosing: '), h('span', {}, PEP_CLINICAL_REGIMENS.preferredRegimen.doseEn)]),
          h('p', { class: 'regimen-adv' }, [h('strong', {}, 'Advantages: '), h('span', {}, PEP_CLINICAL_REGIMENS.preferredRegimen.advantagesEn)]),
          h('p', { class: 'regimen-mon' }, [h('strong', {}, 'Monitoring: '), h('span', {}, PEP_CLINICAL_REGIMENS.preferredRegimen.monitoringEn)]),
        ]),

        // Alternative: Tivicay + Truvada
        h('div', { class: 'regimen-card alternative' }, [
          h('div', { class: 'regimen-badge' }, t('needle.pep.badgeAlternative', 'STANDARD ALTERNATIVE')),
          h('h3', { class: 'regimen-name' }, PEP_CLINICAL_REGIMENS.alternativeRegimen.name),
          h('p', { class: 'regimen-dose' }, [h('strong', {}, 'Dosing: '), h('span', {}, PEP_CLINICAL_REGIMENS.alternativeRegimen.doseEn)]),
          h('p', { class: 'regimen-adv' }, [h('strong', {}, 'Advantages: '), h('span', {}, PEP_CLINICAL_REGIMENS.alternativeRegimen.advantagesEn)]),
          h('p', { class: 'regimen-mon' }, [h('strong', {}, 'Monitoring: '), h('span', {}, PEP_CLINICAL_REGIMENS.alternativeRegimen.monitoringEn)]),
        ]),
      ]),

      // Transmission Probability Benchmark Table
      h('div', { class: 'transmission-table-card' }, [
        h('h3', {}, t('needle.table.title', 'Transmission Probability Benchmarks (Untreated Source)')),
        h('table', { class: 'transmission-matrix-table' }, [
          h('thead', {}, [
            h('tr', {}, [
              h('th', {}, 'Pathogen'),
              h('th', {}, 'Percutaneous Risk'),
              h('th', {}, 'Mucous Membrane Splash'),
              h('th', {}, 'Environmental Viability outside Body'),
            ]),
          ]),
          h('tbody', {}, [
            h('tr', {}, [
              h('td', {}, h('strong', {}, 'HIV')),
              h('td', {}, TRANSMISSION_PROBABILITIES.hiv.percutaneous),
              h('td', {}, TRANSMISSION_PROBABILITIES.hiv.mucousSplash),
              h('td', {}, TRANSMISSION_PROBABILITIES.hiv.environmentalSurvivalEn),
            ]),
            h('tr', {}, [
              h('td', {}, h('strong', {}, 'HCV')),
              h('td', {}, TRANSMISSION_PROBABILITIES.hcv.percutaneous),
              h('td', {}, TRANSMISSION_PROBABILITIES.hcv.mucousSplash),
              h('td', {}, TRANSMISSION_PROBABILITIES.hcv.environmentalSurvivalEn),
            ]),
            h('tr', {}, [
              h('td', {}, h('strong', {}, 'HBV (Unvaccinated)')),
              h('td', {}, TRANSMISSION_PROBABILITIES.hbv.percutaneousUnvaccinatedHBeAgPositive),
              h('td', {}, 'Variable (~1% to 10%)'),
              h('td', {}, TRANSMISSION_PROBABILITIES.hbv.environmentalSurvivalEn),
            ]),
          ]),
        ]),
      ]),
    ]);
    return section;
  }

  function renderHbvTetanusTab() {
    const section = h('section', { class: 'hbv-tetanus-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('needle.hbv.title', 'Hepatitis B & Tetanus Post-Exposure Management')),
      h('p', { class: 'tab-subtitle' }, t('needle.hbv.subtitle', 'Hepatitis B is the most resilient bloodborne pathogen. Post-exposure prophylaxis depends on the exposed person’s documented immune status.')),

      // HBV Algorithm Grid
      h('div', { class: 'hbv-algorithm-grid' }, HEPATITIS_B_PEP_ALGORITHM.map((row) => h('div', { class: 'hbv-row-card' }, [
        h('h3', { class: 'worker-status-title' }, row.workerStatusEn),
        h('div', { class: 'hbv-action-details' }, [
          h('div', { class: 'action-col' }, [
            h('strong', {}, 'If Source is HBsAg-Positive: '),
            h('p', {}, row.hBsAgPositiveSourceEn),
          ]),
          h('div', { class: 'action-col' }, [
            h('strong', {}, 'If Source is Unknown / Community: '),
            h('p', {}, row.unknownOrCommunitySourceEn),
          ]),
        ]),
      ]))),

      // Hepatitis C Guidance Box
      h('div', { class: 'hcv-guidance-card' }, [
        h('h3', {}, [icon('shield'), h('span', {}, t('needle.hcv.title', 'Hepatitis C (HCV) Post-Exposure Protocol'))]),
        h('p', {}, [
          h('strong', {}, 'Crucial Clinical Rule: '),
          'Direct-acting antivirals, immunoglobulins, and corticosteroids are NOT recommended for post-exposure prophylaxis against HCV.',
        ]),
        h('p', {}, 'Protocol: Obtain baseline HCV Ab and HCV RNA. Draw follow-up HCV RNA at 4 to 6 weeks. If HCV RNA is positive (acute HCV infection), refer immediately for direct-acting antiviral therapy (e.g. Epclusa or Mavyret), which cures > 98% of cases.'),
      ]),

      // Tetanus Guidance Box
      h('div', { class: 'tetanus-guidance-card' }, [
        h('h3', {}, [icon('check'), h('span', {}, t('needle.tet.title', 'Tetanus Toxoid Prophylaxis'))]),
        h('p', {}, [h('strong', {}, 'Clean Minor Wounds: '), TETANUS_POST_EXPOSURE.cleanMinorWound]),
        h('p', {}, [h('strong', {}, 'Contaminated / Deep Sharps: '), TETANUS_POST_EXPOSURE.contaminatedDeepSharps]),
      ]),
    ]);
    return section;
  }

  function renderOshaRightsTab() {
    const section = h('section', { class: 'osha-rights-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, OSHA_WORKER_RIGHTS.titleEn),
      h('p', { class: 'tab-subtitle' }, t('needle.osha.subtitle', 'Federal law strictly mandates immediate employer-paid medical evaluation and prophylaxis for any employee suffering a workplace sharps injury or blood exposure.')),

      h('div', { class: 'osha-rights-grid' }, OSHA_WORKER_RIGHTS.rights.map((r) => h('div', { class: 'osha-card' }, [
        h('div', { class: 'osha-badge' }, [icon('check'), h('span', {}, 'Federal OSHA Mandate')]),
        h('h3', { class: 'osha-card-title' }, r.rightEn),
        h('p', { class: 'osha-card-detail' }, r.detailEn),
      ]))),

      // Actionable Checklist for Healthcare Workers
      h('div', { class: 'worker-action-checklist' }, [
        h('h3', {}, t('needle.osha.checklistTitle', 'Healthcare Worker Immediate Action Checklist')),
        h('ol', { class: 'checklist-ol' }, [
          h('li', {}, 'Wash the puncture site immediately with soap and running water (do not squeeze).'),
          h('li', {}, 'Notify your charge nurse, clinical supervisor, or employee health coordinator immediately.'),
          h('li', {}, 'Report to the Emergency Department or Employee Health Clinic during working hours.'),
          h('li', {}, 'Ensure the 28-day antiretroviral prescription and initial starter pack are billed 100% to workers’ comp/employer, with $0 out-of-pocket cost.'),
          h('li', {}, 'Complete the internal Sharps Injury Log with the specific safety device brand and failure mode.'),
        ]),
      ]),
    ]);
    return section;
  }

  function renderCommunitySharpsTab() {
    const section = h('section', { class: 'community-sharps-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('needle.community.title', 'Community Sharps Safety & Safe Disposal Navigator')),
      h('p', { class: 'tab-subtitle' }, t('needle.community.subtitle', 'Guidance for parents, citizens, park workers, and community members encountering discarded syringes in public spaces.')),

      // Myth Debunking Card
      h('div', { class: 'community-myth-card' }, [
        h('div', { class: 'myth-icon' }, [icon('shield')]),
        h('div', { class: 'myth-content' }, [
          h('h3', { class: 'myth-title' }, t('needle.myth.title', 'De-escalating Panic: Epidemiological Reality of Discarded Needles')),
          h('p', { class: 'myth-text' }, COMMUNITY_SHARPS_SAFETY.mythDebunkingEn),
        ]),
      ]),

      // Safe Pickup Steps Grid
      h('div', { class: 'sharps-pickup-steps' }, [
        h('h3', { class: 'pickup-heading' }, t('needle.pickup.title', 'How to Safely Pick Up and Dispose of a Found Syringe')),
        h('div', { class: 'pickup-steps-grid' }, COMMUNITY_SHARPS_SAFETY.safePickupSteps.map((s) => h('div', { class: 'step-card' }, [
          h('div', { class: 'step-number-badge' }, `Step ${s.step}`),
          h('h4', { class: 'step-rule' }, s.ruleEn),
          h('p', { class: 'step-desc' }, s.detailEn),
        ]))),
      ]),

      // Reassurance Script for Parents
      h('div', { class: 'parent-reassurance-card' }, [
        h('h3', {}, [icon('check'), h('span', {}, t('needle.parent.title', 'Script for Reassuring a Panicked Child or Parent'))]),
        h('blockquote', { class: 'reassurance-quote' }, [
          '"Finding or accidentally touching an old needle outdoors is scary, but viruses like HIV dry up and die very quickly in the air and sunlight. Worldwide, there has never been a documented case of a child or adult contracting HIV from stepping on an old outdoor syringe. We washed the spot with soap and water, and the doctor will check your Hepatitis B vaccine to make sure you are 100% protected."',
        ]),
      ]),
    ]);
    return section;
  }

  // Subscribe to in-RAM updates and render initial state
  const unsubscribe = subscribeExposureState(() => render());
  render();

  return container;
}

