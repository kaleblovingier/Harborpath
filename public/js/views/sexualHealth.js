// public/js/views/sexualHealth.js
// HarborPath - Sexual Health, STI Post-Exposure Prophylaxis (Doxy-PEP), PrEP Navigation & Emergency Contraception Navigator
// Clinical consensus: CDC Clinical Guidelines for Doxycycline Post-Exposure Prophylaxis (Doxy-PEP) for Bacterial STI Prevention (MMWR 2024),
// CDC US Public Health Service Pre-Exposure Prophylaxis (PrEP) Clinical Practice Guidelines (2021 / Updated),
// CDC Post-Exposure Prophylaxis (PEP) to Pre-Exposure Prophylaxis (PrEP) Transition Guidance,
// ACOG Practice Bulletin No. 152: Emergency Contraception (Levonorgestrel, Ulipristal Acetate, Copper IUD & Weight Thresholds),
// SAMHSA / ASAM Harm Reduction Integration Standards for Reproductive & Sexual Health in Substance Use.
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon, copyText } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: DOXY-PEP (CDC 2024 CLINICAL GUIDELINES)
// ============================================================================

export const DOXY_PEP_GUIDELINES = Object.freeze({
  titleEn: 'CDC 2024 Doxycycline Post-Exposure Prophylaxis (Doxy-PEP) Guidelines',
  titleEs: 'Guías de los CDC 2024 para Profilaxis Post-Exposición con Doxiciclina (Doxy-PEP)',
  regimen: Object.freeze({
    drug: 'Doxycycline hyclate or monohydrate',
    doseEn: '200 mg orally as a single dose, taken as soon as possible after condomless sex.',
    doseEs: '200 mg vía oral en dosis única, tomada lo antes posible tras relaciones sexuales sin condón.',
    windowEn: 'Take within 72 hours of sex (ideally < 24 hours). Maximum dose of 200 mg per 24-hour period, even if multiple sexual encounters occur.',
    windowEs: 'Tomar dentro de las 72 horas posteriores (idealmente < 24 horas). Dosis máxima de 200 mg por período de 24 horas, aun si hay múltiples encuentros sexuales.',
    administrationEn: 'Take with a full glass of water (8 oz / 240 mL) and remain upright for at least 30 minutes to prevent pill-induced chemical esophagitis or esophageal ulceration.',
    administrationEs: 'Tomar con un vaso lleno de agua (240 mL) y permanecer erguido al menos 30 minutos para prevenir esofagitis química o ulceración esofágica.',
  }),
  efficacyEn: Object.freeze({
    syphilis: '~70% to 87% risk reduction across randomized controlled trials.',
    chlamydia: '~70% to 88% risk reduction across anatomical sites (urethral, rectal, pharyngeal).',
    gonorrhea: '~50% to 55% risk reduction (moderate efficacy due to variable baseline tetracycline resistance in N. gonorrhoeae strains).',
    viralStis: 'DOES NOT PREVENT VIRAL STIs: Doxy-PEP has ZERO activity against HIV, Herpes (HSV), HPV, Hepatitis B/C, or Mpox.',
  }),
  efficacyEs: Object.freeze({
    syphilis: '~70% a 87% de reducción de riesgo en ensayos clínicos aleatorizados.',
    chlamydia: '~70% a 88% de reducción de riesgo en todos los sitios anatómicos (uretral, rectal, faríngeo).',
    gonorrhea: '~50% a 55% de reducción de riesgo (eficacia moderada debido a resistencia basal a tetraciclinas en cepas de N. gonorrhoeae).',
    viralStis: 'NO PREVIENE ITS VIRALES: Doxy-PEP tiene CERO actividad contra el VIH, Herpes (VHS), VPH, Hepatitis B/C o Viruela Símica (Mpox).',
  }),
  monitoringEn: 'Screening for bacterial STIs (syphilis serology, NAAT testing for chlamydia and gonorrhea at all exposed anatomical sites: urine/urethral, pharyngeal, and rectal) and HIV testing every 3 to 6 months.',
  monitoringEs: 'Cribado de ITS bacterianas (serología de sífilis, pruebas NAAT para clamidia y gonorrea en todos los sitios anatómicos expuestos: orina/uretra, faringe y recto) y prueba de VIH cada 3 a 6 meses.',
});

// ============================================================================
// CLINICAL TAXONOMY: HIV PRE-EXPOSURE PROPHYLAXIS (PrEP) MODALITIES
// ============================================================================

export const PREP_MODALITIES = Object.freeze([
  {
    id: 'truvada_daily',
    name: 'Daily Oral Truvada (TDF 300 mg / FTC 200 mg)',
    populationEn: 'Approved for ALL individuals at risk: receptive/insertive anal sex, vaginal/frontal sex, and injection drug use.',
    populationEs: 'Aprobado para TODAS las personas en riesgo: sexo anal receptivo/insertivo, sexo vaginal/frontal y uso de drogas inyectables.',
    dosingEn: '1 tablet PO once daily with or without food. Takes 7 days of daily dosing to achieve protective tissue concentrations in rectal tissue, and 21 days in cervicovaginal tissue and blood for injection risks.',
    dosingEs: '1 tableta PO al día con o sin comida. Requiere 7 días para alcanzar niveles protectores en tejido rectal y 21 días en tejido cervicovaginal y sangre.',
    monitoringEn: 'Baseline HIV Ag/Ab test, baseline creatinine clearance (requires CrCl >= 60 mL/min), HBV serologies. Repeat HIV and CrCl every 3 months.',
    monitoringEs: 'Prueba basal VIH Ag/Ac, aclaramiento de creatinina (requiere ClCr >= 60 mL/min), serologías de VHB. Repetir VIH y ClCr cada 3 meses.',
  },
  {
    id: 'descovy_daily',
    name: 'Daily Oral Descovy (TAF 25 mg / FTC 200 mg)',
    populationEn: 'Approved for individuals at risk from sexual exposure, EXCEPT individuals at risk from receptive vaginal sex (due to lack of clinical efficacy data in cisgender women).',
    populationEs: 'Aprobado para personas con riesgo sexual, EXCEPTO personas en riesgo por sexo vaginal receptivo (por falta de datos en mujeres cisgénero).',
    dosingEn: '1 tablet PO once daily with or without food. Tenofovir alafenamide (TAF) provides superior renal and bone mineral density safety profiles compared to TDF.',
    dosingEs: '1 tableta PO al día con o sin comida. El TAF ofrece mayor seguridad renal y ósea en comparación con el TDF.',
    monitoringEn: 'Baseline HIV Ag/Ab test, baseline CrCl (requires CrCl >= 30 mL/min), HBV serologies. Repeat HIV test every 3 months.',
    monitoringEs: 'Prueba basal VIH, ClCr basal (requiere ClCr >= 30 mL/min), serologías VHB. Repetir prueba de VIH cada 3 meses.',
  },
  {
    id: 'apretude_injectable',
    name: 'Long-Acting Injectable Apretude (Cabotegravir 600 mg IM)',
    populationEn: 'Approved for all adults and adolescents >= 35 kg at risk from sexual exposure. Ideal for individuals who struggle with daily pill adherence.',
    populationEs: 'Aprobado para todos los adultos y adolescentes >= 35 kg con riesgo sexual. Ideal para quienes tienen dificultades con pastillas diarias.',
    dosingEn: '600 mg (3 mL) intramuscular gluteal injection given at Month 0 and Month 1, then every 2 months thereafter. Oral cabotegravir lead-in (30 mg daily x 1 month) is optional.',
    dosingEs: 'Inyección intramuscular glútea de 600 mg (3 mL) en mes 0 y mes 1, luego cada 2 meses. Fase previa oral opcional (30 mg al día x 1 mes).',
    monitoringEn: 'Baseline HIV Ag/Ab AND HIV RNA test within 1 week prior to each injection. Repeat HIV RNA every 2 months before next injection.',
    monitoringEs: 'Prueba basal VIH Ag/Ac Y ARN de VIH dentro de la semana previa a cada inyección. Repetir ARN de VIH cada 2 meses.',
  },
  {
    id: 'event_driven_211',
    name: 'On-Demand / Event-Driven "2-1-1" PrEP (Truvada Only)',
    populationEn: 'Clinically supported for cisgender men who have sex with men (MSM) with planned, infrequent sexual encounters. NOT RECOMMENDED for cisgender women, transgender men having vaginal sex, or injection drug use.',
    populationEs: 'Respaldado para hombres cisgénero que tienen sexo con hombres (HSH) con relaciones planificadas e infrecuentes. NO RECOMENDADO para mujeres cisgénero ni uso inyectable.',
    dosingEn: 'Take 2 tablets of Truvada 2 to 24 hours BEFORE sex; take 1 tablet 24 hours after the first dose; take 1 tablet 48 hours after the first dose. Total of 4 pills.',
    dosingEs: 'Tomar 2 tabletas de Truvada entre 2 y 24 horas ANTES del sexo; tomar 1 tableta 24 horas después; tomar 1 tableta 48 horas después. Total: 4 pastillas.',
    monitoringEn: 'Baseline HIV Ag/Ab, CrCl >= 60 mL/min, and regular 3-month STI/HIV screening.',
    monitoringEs: 'Prueba basal VIH, ClCr >= 60 mL/min y cribado trimestral de ITS/VIH.',
  },
]);

// ============================================================================
// PEP-TO-PrEP TRANSITION PROTOCOL (CDC RECOMMENDATIONS)
// ============================================================================

export const PEP_TO_PREP_TRANSITION = Object.freeze({
  principleEn: 'Individuals completing a 28-day course of post-exposure prophylaxis (PEP) who remain at ongoing risk for HIV through sexual exposure or injection drug use should transition directly to PrEP without any gap in antiretroviral coverage.',
  principleEs: 'Las personas que completan los 28 días de profilaxis post-exposición (PEP) y continúan con riesgo de VIH por vía sexual o uso inyectable deben realizar una transición directa a PrEP sin días de interrupción en la cobertura.',
  steps: Object.freeze([
    {
      dayEn: 'Day 28 of PEP',
      dayEs: 'Día 28 de la PEP',
      actionEn: 'Perform rapid 4th-generation HIV antigen/antibody lab testing and serum creatinine. Do not wait for send-out lab delays if patient is asymptomatic.',
      actionEs: 'Realizar prueba de laboratorio rápida de VIH Ag/Ac de 4.ª generación y creatinina. No demorar el inicio esperando resultados diferidos si la persona está asintomática.',
    },
    {
      dayEn: 'Day 28 to Day 29 Transition',
      dayEs: 'Transición del Día 28 al Día 29',
      actionEn: 'Initiate daily oral PrEP (Truvada or Descovy) immediately on the day after the last PEP dose. Zero days of unmedicated lapse ensures continuous protective tissue saturation.',
      actionEs: 'Iniciar PrEP oral diaria (Truvada o Descovy) inmediatamente al día siguiente de la última dosis de PEP. Cero días sin medicación garantiza saturación tisular continua.',
    },
    {
      dayEn: 'Month 1 and Month 3 Follow-up',
      dayEs: 'Seguimiento al Mes 1 y Mes 3',
      actionEn: 'Repeat HIV Ag/Ab test at 4 weeks post-PEP completion to rule out delayed seroconversion from the initial exposure, and repeat at 3 months.',
      actionEs: 'Repetir prueba de VIH a las 4 semanas de terminar la PEP para descartar seroconversión tardía de la exposición inicial, y nuevamente a los 3 meses.',
    },
  ]),
});

// ============================================================================
// EMERGENCY CONTRACEPTION (EC): WEIGHT THRESHOLDS & TIMELINE MATRIX
// ============================================================================

export const EMERGENCY_CONTRACEPTION_MATRIX = Object.freeze({
  levonorgestrel: Object.freeze({
    name: 'Levonorgestrel 1.5 mg (Plan B One-Step, Take Action, My Way)',
    accessEn: 'Over-the-Counter (OTC): No prescription needed, available to all individuals regardless of age or gender.',
    accessEs: 'Venta Libre (OTC): No requiere receta, disponible para todas las personas sin límite de edad ni género.',
    windowEn: 'Take within 72 hours (3 days) of unprotected sex. Efficacy declines steadily after 24 hours.',
    windowEs: 'Tomar dentro de las 72 horas (3 días) de la relación desprotegida. La eficacia disminuye progresivamente tras 24 horas.',
    weightLimitationEn: 'SIGNIFICANT WEIGHT LIMITATION: Clinical trials show reduced efficacy in individuals weighing >= 165 lbs (75 kg) or BMI >= 25, and completely ineffective in individuals weighing >= 175 lbs (80 kg) or BMI >= 30.',
    weightLimitationEs: 'LIMITACIÓN DE PESO SIGNIFICATIVA: Ensayos clínicos demuestran eficacia reducida con peso >= 165 lb (75 kg) o IMC >= 25, e ineficacia total con peso >= 175 lb (80 kg) o IMC >= 30.',
    mechanismEn: 'Delays or inhibits ovulation prior to the luteinizing hormone (LH) surge. DOES NOT terminate an established pregnancy; does not interfere with an implanted embryo.',
    mechanismEs: 'Retrasa o inhibe la ovulación antes del pico de LH. NO interrumpe un embarazo establecido ni interfiere con un embrión implantado.',
  }),
  ulipristal: Object.freeze({
    name: 'Ulipristal Acetate 30 mg (Ella)',
    accessEn: 'Prescription Required: Available through clinicians, urgent care, telehealth, or Title X family planning clinics.',
    accessEs: 'Requiere Receta Médica: Disponible a través de médicos, urgencias, telemedicina o clínicas de planificación familiar Title X.',
    windowEn: 'Effective up to 120 hours (5 full days) of unprotected sex with consistent efficacy across all 5 days.',
    windowEs: 'Eficaz hasta 120 horas (5 días completos) tras la relación desprotegida con eficacia constante a lo largo de los 5 días.',
    weightLimitationEn: 'SUPERIOR WEIGHT PROFILE: Significantly more effective than levonorgestrel. Maintains contraceptive efficacy up to 195 lbs (88 kg) or BMI up to 35.',
    weightLimitationEs: 'MEJOR PERFIL DE PESO: Notablemente más eficaz que el levonorgestrel. Mantiene eficacia anticonceptiva hasta 195 lb (88 kg) o IMC hasta 35.',
    mechanismEn: 'Progesterone receptor modulator that inhibits ovulation even AFTER the LH surge has begun (superior ovulation postponement). Resume regular hormonal contraception 5 days after taking Ella.',
    mechanismEs: 'Modulador del receptor de progesterona que inhibe la ovulación aun TRAS haber comenzado el pico de LH. Reanudar anticoncepción hormonal 5 días después.',
  }),
  copperIud: Object.freeze({
    name: 'Copper Intrauterine Device (Paragard) or 52 mg LNG IUD (Mirena, Liletta)',
    accessEn: 'Clinical Placement Required: Inserted by a healthcare provider, OB/GYN, or community health center.',
    accessEs: 'Requiere Colocación Clínica: Insertado por un profesional de la salud o centro de salud comunitario.',
    windowEn: 'Insert within 120 hours (5 days) of unprotected sex (or up to 5 days after estimated ovulation date).',
    windowEs: 'Insertar dentro de las 120 horas (5 días) tras la relación desprotegida (o hasta 5 días de la fecha estimada de ovulación).',
    weightLimitationEn: 'GOLD STANDARD - NO WEIGHT RESTRICTIONS: Most effective emergency contraception method (> 99.9% effective) regardless of patient weight, body mass index, or timing within the 5-day window.',
    weightLimitationEs: 'MÁXIMA EFICACIA - SIN RESTRICCIÓN DE PESO: El método más eficaz (> 99.9% de efectividad) sin importar el peso corporal, IMC ni el día dentro de la ventana de 5 días.',
    mechanismEn: 'Prevents fertilization and provides 8 to 12 years (Copper) or 8 years (LNG 52 mg) of ongoing reversible contraception.',
    mechanismEs: 'Previene la fecundación y proporciona entre 8 y 12 años de anticoncepción reversible continua.',
  }),
});

// ============================================================================
// BARRIER & LUBRICANT HARM REDUCTION STANDARDS
// ============================================================================

export const BARRIER_HARM_REDUCTION = Object.freeze({
  oilLatexWarningEn: 'CRITICAL WARNING: Oil-based lubricants, lotions, baby oil, vaseline, petroleum jelly, and cooking oils (coconut oil, olive oil) DISSOLVE AND RUPTURE LATEX CONDOMS WITHIN 60 SECONDS. Always use water-based or pure silicone-based lubricants with latex condoms.',
  oilLatexWarningEs: 'ADVERTENCIA CRÍTICA: Los lubricantes a base de aceite, lociones, aceite de bebé, vaselina y aceites de cocina (coco, oliva) DISUELVEN Y ROMPEN CONDONES DE LÁTEX EN MENOS DE 60 SEGUNDOS. Use siempre lubricantes a base de agua o silicona pura con condones de látex.',
  materials: Object.freeze([
    {
      material: 'Latex',
      lubeEn: 'Water-based or silicone-based lubricants ONLY. Never use oil.',
      lubeEs: 'Lubricantes a base de agua o silicona ÚNICAMENTE. Nunca usar aceite.',
      notesEn: 'Most widely accessible; highly elastic and effective against STIs and pregnancy.',
      notesEs: 'El más común y accesible; elástico y muy eficaz contra ITS y embarazo.',
    },
    {
      material: 'Polyurethane / Polyisoprene (Non-Latex)',
      lubeEn: 'Compatible with water, silicone, and many oil-based products (polyurethane is oil-resistant).',
      lubeEs: 'Compatible con agua, silicona y lubricantes a base de aceite (el poliuretano resiste el aceite).',
      notesEn: 'Hypoallergenic choice for individuals with latex allergies. Slightly less stretchable than latex.',
      notesEs: 'Elección hipoalergénica para personas con alergia al látex.',
    },
    {
      material: 'Internal Condoms (FC2 Nitrile)',
      lubeEn: 'Compatible with water, silicone, and oil lubricants.',
      lubeEs: 'Compatible con agua, silicona y lubricantes de aceite.',
      notesEn: 'Can be inserted up to 8 hours before sexual activity; provides receptive partner control.',
      notesEs: 'Puede colocarse hasta 8 horas antes del acto sexual; otorga control a la persona receptiva.',
    },
    {
      material: 'Dental Dams & Nitrile Barriers',
      lubeEn: 'Water-based lubricant applied between barrier and mucosal tissue.',
      lubeEs: 'Lubricante a base de agua aplicado entre la barrera y el tejido mucoso.',
      notesEn: 'Used for oral-vaginal or oral-anal contact (cunnilingus / anilingus) to block bacterial STIs, HPV, and HSV.',
      notesEs: 'Usado para contacto oral-vaginal u oral-anal para bloquear ITS bacterianas, VPH y VHS.',
    },
  ]),
});

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialSexualHealthState = () => ({
  activeTab: 'calculator', // 'calculator' | 'doxy-pep' | 'prep-options' | 'emergency-contraception' | 'barriers'
  viewMode: 'community', // 'community' | 'clinical'
  hoursElapsed: 'under_24', // 'under_24' | '24_to_72' | '72_to_120' | 'over_120'
  exposureCategory: 'condomless_sex', // 'condomless_sex' | 'condom_break' | 'injection_exposure' | 'assault_coercion'
  patientWeightLbs: '150_to_165', // 'under_150' | '150_to_165' | '165_to_195' | 'over_195'
  partnerStiStatus: 'unknown_partner', // 'known_bacterial_sti' | 'known_hiv_positive' | 'unknown_partner' | 'known_negative'
  eligibleDoxyPep: 'yes_msm_trans', // 'yes_msm_trans' | 'cis_woman' | 'general_public'
});

let currentSexualHealthState = initialSexualHealthState();
const stateSubscribers = new Set();

export function getSexualHealthState() {
  return { ...currentSexualHealthState };
}

export function setSexualHealthState(patch) {
  currentSexualHealthState = { ...currentSexualHealthState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentSexualHealthState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetSexualHealthState() {
  currentSexualHealthState = initialSexualHealthState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentSexualHealthState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribeSexualHealthState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateSexualHealthNeeds(state) {
  const { hoursElapsed, exposureCategory, patientWeightLbs, partnerStiStatus, eligibleDoxyPep } = state;

  const isUnder72 = hoursElapsed === 'under_24' || hoursElapsed === '24_to_72';
  const isUnder120 = isUnder72 || hoursElapsed === '72_to_120';
  const isOver120 = hoursElapsed === 'over_120';

  // 1. Doxy-PEP Evaluation
  let doxyPepRecommended = false;
  let doxyPepReasonEn = '';
  let doxyPepReasonEs = '';

  if (isUnder72) {
    if (eligibleDoxyPep === 'yes_msm_trans' || partnerStiStatus === 'known_bacterial_sti') {
      doxyPepRecommended = true;
      doxyPepReasonEn = 'RECOMMENDED: Doxycycline 200 mg single dose PO within 72 hours of sex. Reduces syphilis by ~80%, chlamydia by ~80%, and gonorrhea by ~50%. Take with full 8 oz water and remain upright for 30 minutes.';
      doxyPepReasonEs = 'RECOMENDADO: Doxiciclina 200 mg en dosis única PO dentro de las 72 horas del sexo. Reduce sífilis ~80%, clamidia ~80% y gonorrea ~50%. Tomar con 240 mL de agua y mantenerse erguido 30 minutos.';
    } else {
      doxyPepReasonEn = 'CONSIDER ON CASE-BY-CASE BASIS: CDC 2024 guidelines primarily recommend Doxy-PEP for MSM and transgender women with prior STIs. Emerging data show moderate efficacy in other populations; discuss with clinician.';
      doxyPepReasonEs = 'CONSIDERAR CASO A CASO: Las guías de los CDC 2024 recomiendan Doxy-PEP prioritariamente a HSH y mujeres trans con ITS previas. Consulte con su médico.';
    }
  } else {
    doxyPepReasonEn = 'NOT INDICATED (> 72 hours elapsed): The biological preventive window for Doxy-PEP is 72 hours. Schedule clinical screening for syphilis, chlamydia, and gonorrhea at 2 to 4 weeks.';
    doxyPepReasonEs = 'NO INDICADO (más de 72 horas transcurridas): La ventana biológica de Doxy-PEP es de 72 horas. Programe cribado de sífilis, clamidia y gonorrea a las 2 a 4 semanas.';
  }

  // 2. HIV PEP vs PrEP Evaluation
  let hivActionEn = '';
  let hivActionEs = '';
  let hivEmergency = false;

  if (partnerStiStatus === 'known_hiv_positive' || exposureCategory === 'assault_coercion') {
    if (isUnder72) {
      hivEmergency = true;
      hivActionEn = 'CRITICAL EMERGENCY - INITIATE HIV PEP IMMEDIATELY (< 72 hours): Seek Emergency Department or Urgent Care for 28-day antiretroviral PEP (Biktarvy or Tivicay + Truvada) to prevent HIV integration. Transition directly to daily PrEP on Day 28.';
      hivActionEs = 'EMERGENCIA CRÍTICA - INICIAR PEP DE VIH INMEDIATAMENTE (< 72 horas): Acuda a Urgencias para iniciar la PEP antirretroviral de 28 días (Biktarvy o Tivicay + Truvada). Transición directa a PrEP en el día 28.';
    } else {
      hivActionEn = 'PEP WINDOW EXPIRED (> 72 hours): Obtain baseline 4th generation HIV Ag/Ab test now and repeat at 4-6 weeks and 3 months. If ongoing risk, discuss starting PrEP once baseline negative status is confirmed.';
      hivActionEs = 'VENTANA DE PEP EXPIRADA (> 72 horas): Realizar prueba basal de VIH de 4.ª gen ahora y repetir a las 4-6 semanas y 3 meses. Si persiste el riesgo, valorar iniciar PrEP al confirmar seronegatividad.';
    }
  } else {
    hivActionEn = 'EVALUATE PREP FOR ONGOING PROTECTION: If you have ongoing sexual or injection drug partners, initiate daily oral PrEP (Truvada or Descovy) or bi-monthly injectable Apretude to ensure near-100% protection against future exposures.';
    hivActionEs = 'VALORAR PrEP PARA PROTECCIÓN CONTINUA: Si tiene parejas sexuales o de consumo inyectable continuas, inicie PrEP oral diaria (Truvada o Descovy) o inyectable bimestral Apretude para protección casi del 100%.';
  }

  // 3. Emergency Contraception (EC) Evaluation
  let ecRecommendationEn = '';
  let ecRecommendationEs = '';
  let preferredEcMethod = 'levonorgestrel';

  if (isOver120) {
    ecRecommendationEn = 'WINDOW EXPIRED (> 120 hours / 5 days): Oral emergency contraceptive pills and IUD emergency insertion are no longer proven effective. Schedule clinical consultation and urine pregnancy test at 2 to 3 weeks.';
    ecRecommendationEs = 'VENTANA EXPIRADA (> 120 horas / 5 días): Las pastillas anticonceptivas de emergencia y el DIU ya no tienen eficacia comprobada. Programe consulta y prueba de embarazo en 2 a 3 semanas.';
    preferredEcMethod = 'none';
  } else if (patientWeightLbs === 'over_195') {
    preferredEcMethod = 'copper_iud';
    ecRecommendationEn = 'PREFERRED: Copper IUD or LNG 52 mg IUD placed within 120 hours (> 99.9% effective, unaffected by weight). Oral levonorgestrel (Plan B) is completely ineffective at this weight; Ulipristal (Ella) has significantly reduced efficacy over 195 lbs.';
    ecRecommendationEs = 'PREFERIDO: DIU de Cobre o DIU LNG 52 mg colocado dentro de las 120 horas (> 99.9% de efectividad, no afectado por el peso). El levonorgestrel oral (Plan B) es ineficaz con este peso; Ulipristal (Ella) tiene eficacia muy reducida sobre 195 lb.';
  } else if (patientWeightLbs === '165_to_195' || (!isUnder72 && isUnder120)) {
    preferredEcMethod = 'ulipristal';
    ecRecommendationEn = 'PREFERRED: Ulipristal Acetate 30 mg (Ella) by prescription, effective up to 120 hours and up to 195 lbs (88 kg). Alternatively, Copper IUD placement. Levonorgestrel (Plan B) has significantly diminished efficacy over 165 lbs or beyond 72 hours.';
    ecRecommendationEs = 'PREFERIDO: Acetato de Ulipristal 30 mg (Ella) con receta, eficaz hasta 120 horas y hasta 195 lb (88 kg). Como alternativa, colocación de DIU de Cobre. El levonorgestrel (Plan B) tiene eficacia disminuida sobre 165 lb o tras 72 horas.';
  } else {
    // Under 165 lbs and under 72 hours
    preferredEcMethod = 'levonorgestrel';
    ecRecommendationEn = 'PREFERRED: Levonorgestrel 1.5 mg (Plan B) available over-the-counter immediately, or Ulipristal Acetate 30 mg (Ella) by prescription. Take as soon as possible for maximum efficacy.';
    ecRecommendationEs = 'PREFERIDO: Levonorgestrel 1.5 mg (Plan B) de venta libre inmediata, o Acetato de Ulipristal 30 mg (Ella) con receta. Tomar cuanto antes para máxima eficacia.';
  }

  return {
    doxyPepRecommended,
    doxyPepReasonEn,
    doxyPepReasonEs,
    hivActionEn,
    hivActionEs,
    hivEmergency,
    ecRecommendationEn,
    ecRecommendationEs,
    preferredEcMethod,
    isUnder72,
    isUnder120,
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF & PRESCRIPTION GENERATOR
// ============================================================================

export function buildSexualHealthSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '====================================================================',
      'INFORME SBAR DE SALUD SEXUAL, DOXY-PEP Y ANTICONCEPCIÓN DE EMERGENCIA',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      `Exposición sexual reciente o necesidad preventiva: ${state.exposureCategory}.`,
      `Tiempo transcurrido desde el contacto sexual: ${state.hoursElapsed}.`,
      `Estado serológico de la pareja: ${state.partnerStiStatus}.`,
      '',
      'B (ANTECEDENTES / FACTORES DE RIESGO):',
      `- Rango de peso corporal: ${state.patientWeightLbs}.`,
      `- Población de elegibilidad para Doxy-PEP: ${state.eligibleDoxyPep}.`,
      `- Modo de atención: ${state.viewMode === 'clinical' ? 'Modo Clínico y Prescriptor' : 'Modo Paciente y Comunidad'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Doxy-PEP (Doxiciclina 200 mg): ${evaluation.doxyPepRecommended ? 'INDICADA (< 72h)' : 'NO INDICADA O EVALUACIÓN INDIVIDUAL'}.`,
      `  Detalle: ${evaluation.doxyPepReasonEs}`,
      `- Profilaxis de VIH (PEP / PrEP): ${evaluation.hivEmergency ? 'URGENTE: INICIAR PEP < 72H' : 'EVALUAR PrEP RUTINARIA'}.`,
      `  Detalle: ${evaluation.hivActionEs}`,
      `- Anticoncepción de Emergencia: Método preferido -> ${evaluation.preferredEcMethod.toUpperCase()}.`,
      `  Detalle: ${evaluation.ecRecommendationEs}`,
      '',
      'R (RECOMENDACIONES Y PLAN TERAPÉUTICO):',
      '1. Si Doxy-PEP está indicada: Prescribir Doxiciclina 200 mg VO dosis única con abundante agua.',
      '2. Si PEP de VIH está indicada: Iniciar Biktarvy o Tivicay+Truvada de inmediato por 28 días.',
      '3. Si requiere anticoncepción de emergencia: Administrar Ella (30 mg) o Plan B (1.5 mg) según peso.',
      '4. Programar cribado serológico completo (VIH, sífilis, clamidia, gonorrea) a las 2-4 semanas.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'SEXUAL HEALTH, DOXY-PEP & EMERGENCY CONTRACEPTION SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    `Recent sexual exposure or preventive consultation: ${state.exposureCategory}.`,
    `Time elapsed since encounter: ${state.hoursElapsed}.`,
    `Partner STI/HIV status: ${state.partnerStiStatus}.`,
    '',
    'B (BACKGROUND / CLINICAL FACTORS):',
    `- Patient weight range: ${state.patientWeightLbs}.`,
    `- Doxy-PEP population category: ${state.eligibleDoxyPep}.`,
    `- Navigation mode: ${state.viewMode === 'clinical' ? 'Clinical & Prescriber Mode' : 'Patient & Community Mode'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Doxy-PEP (Doxycycline 200 mg): ${evaluation.doxyPepRecommended ? 'RECOMMENDED (< 72h)' : 'NOT INDICATED OR CASE-BY-CASE'}.`,
    `  Detail: ${evaluation.doxyPepReasonEn}`,
    `- HIV Prophylaxis (PEP vs PrEP): ${evaluation.hivEmergency ? 'URGENT: INITIATE PEP < 72H' : 'ROUTINE PrEP EVALUATION'}.`,
    `  Detail: ${evaluation.hivActionEn}`,
    `- Emergency Contraception: Preferred modality -> ${evaluation.preferredEcMethod.toUpperCase()}.`,
    `  Detail: ${evaluation.ecRecommendationEn}`,
    '',
    'R (RECOMMENDATIONS & THERAPEUTIC PLAN):',
    '1. If Doxy-PEP indicated: Prescribe Doxycycline 200 mg PO single dose with 8 oz water.',
    '2. If HIV PEP indicated: Initiate Biktarvy or Tivicay+Truvada immediately x 28 days.',
    '3. If emergency contraception needed: Dispense Ella (30 mg) or Plan B (1.5 mg) based on weight.',
    '4. Schedule comprehensive STI/HIV screening (NAAT 3-site + serology) at 2 to 4 weeks.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function sexualHealthView() {
  const container = h('div', { class: 'sexual-health-view' });

  function render() {
    clear(container);
    const state = getSexualHealthState();
    const evaluation = evaluateSexualHealthNeeds(state);

    // Header Banner
    const header = h('header', { class: 'sh-header' }, [
      h('div', { class: 'sh-header-badge' }, [
        icon('shield'),
        h('span', {}, t('sh.header.badge', 'Sexual Health & Harm Reduction Protocol')),
      ]),
      h('h1', { class: 'sh-header-title' }, t('sh.header.title', 'Doxy-PEP, HIV PrEP & Emergency Contraception Navigator')),
      h('p', { class: 'sh-header-desc' }, t('sh.header.desc', 'Evidence-based clinical decision support under CDC 2024 Doxy-PEP guidelines, USPHS PrEP guidelines, and ACOG emergency contraception standards. Pure in-RAM zero-PII privacy.')),
    ]);

    // Dual-Mode Selector
    const modeSwitcher = h('div', { class: 'sh-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Selector' }, [
      h('button', {
        type: 'button',
        class: `sh-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setSexualHealthState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('sh.mode.community', 'Individual & Community Mode (Plain Language & Safe Sex Guide)')),
      ]),
      h('button', {
        type: 'button',
        class: `sh-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setSexualHealthState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('sh.mode.clinical', 'Clinician & Prescriber Mode (CDC Dosages, SBAR & Lab Schedules)')),
      ]),
    ]);

    // Tab Navigation
    const tabsList = h('div', { class: 'sh-tabs-nav', role: 'tablist', 'aria-label': 'Sexual Health Navigation Tabs' }, [
      h('button', {
        type: 'button',
        class: `sh-tab-btn ${state.activeTab === 'calculator' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'calculator' ? 'true' : 'false',
        onclick: () => setSexualHealthState({ activeTab: 'calculator' }),
      }, t('sh.tabs.calculator', 'Triage & Prevention Calculator')),
      h('button', {
        type: 'button',
        class: `sh-tab-btn ${state.activeTab === 'doxy-pep' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'doxy-pep' ? 'true' : 'false',
        onclick: () => setSexualHealthState({ activeTab: 'doxy-pep' }),
      }, t('sh.tabs.doxyPep', 'CDC 2024 Doxy-PEP Protocol')),
      h('button', {
        type: 'button',
        class: `sh-tab-btn ${state.activeTab === 'prep-options' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'prep-options' ? 'true' : 'false',
        onclick: () => setSexualHealthState({ activeTab: 'prep-options' }),
      }, t('sh.tabs.prepOptions', 'HIV PrEP Modalities & PEP Transition')),
      h('button', {
        type: 'button',
        class: `sh-tab-btn ${state.activeTab === 'emergency-contraception' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'emergency-contraception' ? 'true' : 'false',
        onclick: () => setSexualHealthState({ activeTab: 'emergency-contraception' }),
      }, t('sh.tabs.contraception', 'Emergency Contraception & Weight')),
      h('button', {
        type: 'button',
        class: `sh-tab-btn ${state.activeTab === 'barriers' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'barriers' ? 'true' : 'false',
        onclick: () => setSexualHealthState({ activeTab: 'barriers' }),
      }, t('sh.tabs.barriers', 'Barriers & Lube Harm Reduction')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'doxy-pep':
        tabContent = renderDoxyPepTab();
        break;
      case 'prep-options':
        tabContent = renderPrepOptionsTab();
        break;
      case 'emergency-contraception':
        tabContent = renderContraceptionTab();
        break;
      case 'barriers':
        tabContent = renderBarriersTab();
        break;
      case 'calculator':
      default:
        tabContent = renderCalculatorTab(state, evaluation);
        break;
    }

    container.appendChild(header);
    container.appendChild(modeSwitcher);
    container.appendChild(tabsList);
    container.appendChild(tabContent);
  }

  // --- SUB-PANEL RENDERERS ---

  function renderCalculatorTab(state, evaluation) {
    const section = h('section', { class: 'sh-calculator-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'sh-inputs-grid' }, [
      // 1. Hours Elapsed
      h('div', { class: 'input-card' }, [
        h('label', { for: 'sh-select-hours', class: 'input-label' }, t('sh.label.hours', '1. Time Elapsed Since Sex')),
        h('select', {
          id: 'sh-select-hours',
          class: 'sh-select',
          onchange: (e) => setSexualHealthState({ hoursElapsed: e.target.value }),
        }, [
          h('option', { value: 'under_24', selected: state.hoursElapsed === 'under_24' }, t('sh.opt.under24', '< 24 hours (Highest preventive efficacy)')),
          h('option', { value: '24_to_72', selected: state.hoursElapsed === '24_to_72' }, t('sh.opt.24to72', '24 to 72 hours (Eligible for Doxy-PEP & HIV PEP)')),
          h('option', { value: '72_to_120', selected: state.hoursElapsed === '72_to_120' }, t('sh.opt.72to120', '72 to 120 hours (Ella & IUD only; PEP window expired)')),
          h('option', { value: 'over_120', selected: state.hoursElapsed === 'over_120' }, t('sh.opt.over120', '> 120 hours / 5 days (Seek clinical screening)')),
        ]),
      ]),

      // 2. Exposure Category
      h('div', { class: 'input-card' }, [
        h('label', { for: 'sh-select-category', class: 'input-label' }, t('sh.label.category', '2. Exposure Type / Encounter')),
        h('select', {
          id: 'sh-select-category',
          class: 'sh-select',
          onchange: (e) => setSexualHealthState({ exposureCategory: e.target.value }),
        }, [
          h('option', { value: 'condomless_sex', selected: state.exposureCategory === 'condomless_sex' }, t('sh.opt.condomless', 'Consensual condomless anal or vaginal sex')),
          h('option', { value: 'condom_break', selected: state.exposureCategory === 'condom_break' }, t('sh.opt.condomBreak', 'Condom break, slippage, or leak during sex')),
          h('option', { value: 'injection_exposure', selected: state.exposureCategory === 'injection_exposure' }, t('sh.opt.injectionExp', 'Shared injection equipment or needle encounter')),
          h('option', { value: 'assault_coercion', selected: state.exposureCategory === 'assault_coercion' }, t('sh.opt.assault', 'Sexual assault, non-consensual contact, or coercion')),
        ]),
      ]),

      // 3. Patient Weight (for EC)
      h('div', { class: 'input-card' }, [
        h('label', { for: 'sh-select-weight', class: 'input-label' }, t('sh.label.weight', '3. Patient Body Weight (for Contraception)')),
        h('select', {
          id: 'sh-select-weight',
          class: 'sh-select',
          onchange: (e) => setSexualHealthState({ patientWeightLbs: e.target.value }),
        }, [
          h('option', { value: 'under_150', selected: state.patientWeightLbs === 'under_150' }, t('sh.opt.under150', '< 150 lbs / 68 kg (Plan B & Ella fully effective)')),
          h('option', { value: '150_to_165', selected: state.patientWeightLbs === '150_to_165' }, t('sh.opt.150to165', '150 to 165 lbs / 68-75 kg (Plan B boundary threshold)')),
          h('option', { value: '165_to_195', selected: state.patientWeightLbs === '165_to_195' }, t('sh.opt.165to195', '165 to 195 lbs / 75-88 kg (Ella or IUD preferred)')),
          h('option', { value: 'over_195', selected: state.patientWeightLbs === 'over_195' }, t('sh.opt.over195', '> 195 lbs / 88 kg (Copper / LNG IUD strongly preferred)')),
        ]),
      ]),

      // 4. Partner Status
      h('div', { class: 'input-card' }, [
        h('label', { for: 'sh-select-partner', class: 'input-label' }, t('sh.label.partner', '4. Partner Known STI / HIV Status')),
        h('select', {
          id: 'sh-select-partner',
          class: 'sh-select',
          onchange: (e) => setSexualHealthState({ partnerStiStatus: e.target.value }),
        }, [
          h('option', { value: 'unknown_partner', selected: state.partnerStiStatus === 'unknown_partner' }, t('sh.opt.unkPartner', 'Unknown status / casual partner')),
          h('option', { value: 'known_bacterial_sti', selected: state.partnerStiStatus === 'known_bacterial_sti' }, t('sh.opt.knownSti', 'Known active bacterial STI (syphilis, chlamydia, gonorrhea)')),
          h('option', { value: 'known_hiv_positive', selected: state.partnerStiStatus === 'known_hiv_positive' }, t('sh.opt.knownHiv', 'Known HIV-positive with unsuppressed or unknown viral load')),
          h('option', { value: 'known_negative', selected: state.partnerStiStatus === 'known_negative' }, t('sh.opt.knownNeg', 'Confirmed HIV & STI negative')),
        ]),
      ]),

      // 5. Doxy-PEP Eligibility Category
      h('div', { class: 'input-card' }, [
        h('label', { for: 'sh-select-doxypop', class: 'input-label' }, t('sh.label.doxypop', '5. Doxy-PEP Population Guidance Group')),
        h('select', {
          id: 'sh-select-doxypop',
          class: 'sh-select',
          onchange: (e) => setSexualHealthState({ eligibleDoxyPep: e.target.value }),
        }, [
          h('option', { value: 'yes_msm_trans', selected: state.eligibleDoxyPep === 'yes_msm_trans' }, t('sh.opt.msmTrans', 'Gay/bisexual men, MSM, or transgender women')),
          h('option', { value: 'cis_woman', selected: state.eligibleDoxyPep === 'cis_woman' }, t('sh.opt.cisWoman', 'Cisgender woman or transgender man having frontal sex')),
          h('option', { value: 'general_public', selected: state.eligibleDoxyPep === 'general_public' }, t('sh.opt.genPublic', 'General population / other circumstances')),
        ]),
      ]),
    ]);

    // Evaluation Result Card
    const resultCard = h('div', { class: `sh-result-card ${evaluation.hivEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'sh-result-header' }, [
        icon(evaluation.hivEmergency ? 'alert' : 'check'),
        h('h3', {}, t('sh.res.heading', 'Personalized Clinical Recommendations')),
      ]),
      h('div', { class: 'sh-recommendations-list' }, [
        h('div', { class: 'rec-item' }, [
          h('strong', {}, t('sh.rec.doxyTitle', 'Bacterial STI Prophylaxis (Doxy-PEP): ')),
          h('span', { class: evaluation.doxyPepRecommended ? 'badge-doxy' : 'badge-neutral' }, evaluation.doxyPepRecommended ? 'INDICATED' : 'CONSULT CLINICIAN'),
          h('p', {}, evaluation.doxyPepReasonEn),
        ]),
        h('div', { class: 'rec-item' }, [
          h('strong', {}, t('sh.rec.hivTitle', 'HIV Prevention (PEP vs PrEP): ')),
          h('p', {}, evaluation.hivActionEn),
        ]),
        h('div', { class: 'rec-item' }, [
          h('strong', {}, t('sh.rec.ecTitle', 'Emergency Contraception (Pregnancy Prevention): ')),
          h('p', {}, evaluation.ecRecommendationEn),
        ]),
      ]),
    ]);

    // SBAR Handoff Action Box
    const copyEnBtn = h('button', {
      type: 'button',
      class: 'btn-copy-sbar',
      onclick: () => {
        const text = buildSexualHealthSbarText(state, evaluation, 'en');
        copyText(text, { trigger: copyEnBtn, copiedLabel: 'Copied to Clipboard!', resetMs: 2500 });
      },
    }, [icon('copy'), h('span', {}, t('sh.sbar.copyEn', 'Copy Clinical SBAR (English)'))]);
    const copyEsBtn = h('button', {
      type: 'button',
      class: 'btn-copy-sbar secondary',
      onclick: () => {
        const text = buildSexualHealthSbarText(state, evaluation, 'es');
        copyText(text, { trigger: copyEsBtn, copiedLabel: '¡Copiado al Portapapeles!', resetMs: 2500 });
      },
    }, [icon('copy'), h('span', {}, t('sh.sbar.copyEs', 'Copiar SBAR (Español)'))]);
    const sbarCard = h('div', { class: 'sbar-export-container' }, [
      h('div', { class: 'sbar-header' }, [
        h('h4', {}, t('sh.sbar.title', 'Zero-PII Clinical Request & SBAR Note Generator')),
        h('p', {}, t('sh.sbar.desc', 'Generate an anonymous, structured clinical summary for urgent care, telehealth, or primary care to request Doxy-PEP, PrEP, or Emergency Contraception. Operates 100% in local memory.')),
      ]),
      h('div', { class: 'sbar-actions' }, [copyEnBtn, copyEsBtn]),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultCard);
    section.appendChild(sbarCard);
    return section;
  }

  function renderDoxyPepTab() {
    const section = h('section', { class: 'doxy-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, DOXY_PEP_GUIDELINES.titleEn),
      h('p', { class: 'tab-subtitle' }, t('sh.doxy.subtitle', 'Doxycycline post-exposure prophylaxis is a groundbreaking biomedical harm reduction strategy to prevent bacterial STIs after condomless sex.')),

      // Dosing & Administration Card
      h('div', { class: 'doxy-regimen-card' }, [
        h('h3', {}, [icon('check'), h('span', {}, 'Recommended Dosing & Administration')]),
        h('ul', { class: 'doxy-regimen-list' }, [
          h('li', {}, [h('strong', {}, 'Dosage: '), h('span', {}, DOXY_PEP_GUIDELINES.regimen.doseEn)]),
          h('li', {}, [h('strong', {}, 'Window & Max Limits: '), h('span', {}, DOXY_PEP_GUIDELINES.regimen.windowEn)]),
          h('li', {}, [h('strong', {}, 'Esophagitis Prevention: '), h('span', {}, DOXY_PEP_GUIDELINES.regimen.administrationEn)]),
        ]),
      ]),

      // Efficacy Matrix
      h('div', { class: 'doxy-efficacy-card' }, [
        h('h3', {}, t('sh.doxy.effHeading', 'Proven Clinical Efficacy by Pathogen')),
        h('div', { class: 'efficacy-grid' }, [
          h('div', { class: 'eff-box high' }, [
            h('h4', {}, 'Syphilis (Treponema pallidum)'),
            h('p', {}, DOXY_PEP_GUIDELINES.efficacyEn.syphilis),
          ]),
          h('div', { class: 'eff-box high' }, [
            h('h4', {}, 'Chlamydia (Chlamydia trachomatis)'),
            h('p', {}, DOXY_PEP_GUIDELINES.efficacyEn.chlamydia),
          ]),
          h('div', { class: 'eff-box moderate' }, [
            h('h4', {}, 'Gonorrhea (Neisseria gonorrhoeae)'),
            h('p', {}, DOXY_PEP_GUIDELINES.efficacyEn.gonorrhea),
          ]),
          h('div', { class: 'eff-box warning' }, [
            h('h4', {}, 'Viral STIs (HIV, HSV, HPV, Mpox)'),
            h('p', {}, DOXY_PEP_GUIDELINES.efficacyEn.viralStis),
          ]),
        ]),
      ]),

      // Monitoring & Lab Schedule
      h('div', { class: 'doxy-monitoring-card' }, [
        h('h3', {}, [icon('shield'), h('span', {}, 'Routine Follow-Up & Laboratory Schedule')]),
        h('p', {}, DOXY_PEP_GUIDELINES.monitoringEn),
      ]),
    ]);
    return section;
  }

  function renderPrepOptionsTab() {
    const section = h('section', { class: 'prep-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('sh.prep.title', 'HIV Pre-Exposure Prophylaxis (PrEP) & Seamless PEP Transition')),
      h('p', { class: 'tab-subtitle' }, t('sh.prep.subtitle', 'PrEP provides near-100% protection against sexual HIV acquisition and over 74% protection for injection drug use. Transitioning from PEP to PrEP must happen without coverage gaps.')),

      // PEP-to-PrEP Banner
      h('div', { class: 'pep-prep-banner' }, [
        icon('alert'),
        h('div', {}, [
          h('strong', {}, 'PEP-to-PrEP Continuity Mandate: '),
          h('p', {}, PEP_TO_PREP_TRANSITION.principleEn),
          h('ol', { class: 'pep-prep-steps' }, PEP_TO_PREP_TRANSITION.steps.map((s) => h('li', {}, [
            h('strong', {}, `${s.dayEn}: `),
            h('span', {}, s.actionEn),
          ]))),
        ]),
      ]),

      // PrEP Modalities Grid
      h('div', { class: 'prep-grid' }, PREP_MODALITIES.map((m) => h('div', { class: 'prep-card' }, [
        h('h3', { class: 'prep-name' }, m.name),
        h('p', { class: 'prep-pop' }, [h('strong', {}, 'Target Population: '), h('span', {}, m.populationEn)]),
        h('p', { class: 'prep-dose' }, [h('strong', {}, 'Dosing Schedule: '), h('span', {}, m.dosingEn)]),
        h('p', { class: 'prep-mon' }, [h('strong', {}, 'Laboratory Monitoring: '), h('span', {}, m.monitoringEn)]),
      ]))),
    ]);
    return section;
  }

  function renderContraceptionTab() {
    const section = h('section', { class: 'contraception-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('sh.ec.title', 'Emergency Contraception: Time Windows & Weight Thresholds')),
      h('p', { class: 'tab-subtitle' }, t('sh.ec.subtitle', 'Emergency contraception is highly effective when initiated promptly. Choosing the right method depends heavily on patient body weight and hours elapsed.')),

      // Methods Grid
      h('div', { class: 'ec-methods-grid' }, [
        // Levonorgestrel
        h('div', { class: 'ec-card otc' }, [
          h('div', { class: 'ec-badge otc' }, 'OTC - NO PRESCRIPTION'),
          h('h3', {}, EMERGENCY_CONTRACEPTION_MATRIX.levonorgestrel.name),
          h('p', {}, [h('strong', {}, 'Access: '), EMERGENCY_CONTRACEPTION_MATRIX.levonorgestrel.accessEn]),
          h('p', {}, [h('strong', {}, 'Window: '), EMERGENCY_CONTRACEPTION_MATRIX.levonorgestrel.windowEn]),
          h('div', { class: 'ec-weight-alert warning' }, [
            icon('alert'),
            h('p', {}, EMERGENCY_CONTRACEPTION_MATRIX.levonorgestrel.weightLimitationEn),
          ]),
          h('p', { class: 'ec-mech' }, [h('strong', {}, 'Mechanism: '), EMERGENCY_CONTRACEPTION_MATRIX.levonorgestrel.mechanismEn]),
        ]),

        // Ulipristal
        h('div', { class: 'ec-card rx' }, [
          h('div', { class: 'ec-badge rx' }, 'PRESCRIPTION REQUIRED'),
          h('h3', {}, EMERGENCY_CONTRACEPTION_MATRIX.ulipristal.name),
          h('p', {}, [h('strong', {}, 'Access: '), EMERGENCY_CONTRACEPTION_MATRIX.ulipristal.accessEn]),
          h('p', {}, [h('strong', {}, 'Window: '), EMERGENCY_CONTRACEPTION_MATRIX.ulipristal.windowEn]),
          h('div', { class: 'ec-weight-alert success' }, [
            icon('check'),
            h('p', {}, EMERGENCY_CONTRACEPTION_MATRIX.ulipristal.weightLimitationEn),
          ]),
          h('p', { class: 'ec-mech' }, [h('strong', {}, 'Mechanism: '), EMERGENCY_CONTRACEPTION_MATRIX.ulipristal.mechanismEn]),
        ]),

        // Copper IUD
        h('div', { class: 'ec-card clinical' }, [
          h('div', { class: 'ec-badge clinical' }, 'GOLD STANDARD (> 99.9%)'),
          h('h3', {}, EMERGENCY_CONTRACEPTION_MATRIX.copperIud.name),
          h('p', {}, [h('strong', {}, 'Access: '), EMERGENCY_CONTRACEPTION_MATRIX.copperIud.accessEn]),
          h('p', {}, [h('strong', {}, 'Window: '), EMERGENCY_CONTRACEPTION_MATRIX.copperIud.windowEn]),
          h('div', { class: 'ec-weight-alert success' }, [
            icon('shield'),
            h('p', {}, EMERGENCY_CONTRACEPTION_MATRIX.copperIud.weightLimitationEn),
          ]),
          h('p', { class: 'ec-mech' }, [h('strong', {}, 'Mechanism: '), EMERGENCY_CONTRACEPTION_MATRIX.copperIud.mechanismEn]),
        ]),
      ]),
    ]);
    return section;
  }

  function renderBarriersTab() {
    const section = h('section', { class: 'barriers-tab-section', role: 'tabpanel' }, [
      h('h2', { class: 'tab-heading' }, t('sh.barriers.title', 'Safer Sex Barriers & Lubricant Harm Reduction')),
      h('p', { class: 'tab-subtitle' }, t('sh.barriers.subtitle', 'Harm reduction practices for barrier use and avoiding chemical degradation.')),

      // Oil Danger Card
      h('div', { class: 'oil-warning-card' }, [
        h('div', { class: 'oil-warning-icon' }, [icon('alert')]),
        h('div', { class: 'oil-warning-content' }, [
          h('h3', {}, 'Oil-Based Lubricants Destroy Latex Condoms'),
          h('p', {}, BARRIER_HARM_REDUCTION.oilLatexWarningEn),
        ]),
      ]),

      // Materials Table
      h('div', { class: 'barrier-materials-card' }, [
        h('h3', {}, 'Barrier Materials & Lubricant Compatibility'),
        h('p', { class: 'cross-nav-p' }, [
          h('a', { class: 'btn btn-secondary', href: '#/inhalant-care' }, 'Poppers (Alkyl Nitrites) & PDE-5 Interaction Safety'),
          h('a', { class: 'btn btn-secondary', href: '#/urology-care' }, 'Ischemic Priapism, Constriction Rings & Urologic Emergencies →'),
        ]),
        h('div', { class: 'materials-grid' }, BARRIER_HARM_REDUCTION.materials.map((m) => h('div', { class: 'material-item' }, [
          h('h4', {}, m.material),
          h('p', {}, [h('strong', {}, 'Compatible Lubricant: '), m.lubeEn]),
          h('p', {}, [h('strong', {}, 'Clinical Notes: '), m.notesEn]),
        ]))),
      ]),
    ]);
    return section;
  }

  // Subscribe to in-RAM updates and render initial state
  const unsubscribe = subscribeSexualHealthState(() => render());
  render();

  return container;
}
