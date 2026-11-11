// public/js/views/ketamineCare.js
// HarborPath - Ketamine Harm Reduction, Dissociative Care & Uropathy ("K-Bladder" & "K-Cramps") Navigator
// Clinical Consensus: American Urological Association (AUA) Guidance on Ketamine-Induced Uropathy (KIU),
// British Association of Urological Surgeons (BAUS) Ketamine Cystitis Management Guidelines,
// European Association of Urology (EAU) Chronic Pelvic Pain & Bladder Pain Syndrome Standards,
// Harm Reduction Coalition & DanceSafe Dissociative Safety Protocols.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon, copyText } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: KETAMINE PHARMACOLOGY & ORGAN TOXICITY
// ============================================================================

export const KETAMINE_PHARMACOLOGY_PROFILES = Object.freeze({
  dissociativeAction: Object.freeze({
    titleEn: 'NMDA Antagonism & Norketamine Metabolism',
    titleEs: 'Antagonismo NMDA y Metabolismo de Norcetamima',
    pharmacologyEn: 'Ketamine is a non-competitive antagonist of the N-methyl-D-aspartate (NMDA) receptor, blocking the phencyclidine (PCP) site within the ionotropic channel. Hepatic CYP3A4 and CYP2B6 enzymes rapidly demethylate ketamine into Norketamine, an active metabolite that is excreted almost entirely by the kidneys into urine.',
    pharmacologyEs: 'La ketamina es un antagonista no competitivo del receptor NMDA. El citocromo hepático CYP3A4 y CYP2B6 la desmetila rápidamente en Norcetamina, metabolito activo que se excreta de forma casi exclusiva a través de los riñones en la orina.',
    clinicalSignificanceEn: 'Both unmetabolized ketamine and norketamine concentrate in the urinary bladder at levels vastly higher than plasma concentrations, directly contacting the bladder urothelium.',
    clinicalSignificanceEs: 'Tanto la ketamina inalterada como la norcetamina se concentran en la vejiga a niveles enormemente superiores a los plasmáticos, contactando directamente con el urotelio vesical.',
  }),

  urologicalCytotoxicity: Object.freeze({
    titleEn: 'Direct Urothelial Cytotoxicity & Microvascular Ischemia',
    titleEs: 'Citotoxicidad Urotelial Directa e Isquemia Microvascular',
    pharmacologyEn: 'Ketamine and norketamine act as direct toxic chemical agents on bladder urothelial umbrella cells. They induce intrinsic mitochondrial apoptosis, break down tight junction proteins (zonula occludens-1), and cause severe microvascular endothelial swelling and ischemia.',
    pharmacologyEs: 'La ketamina y norcetamina actúan como tóxicos directos sobre las células uroteliales vesicales. Inducen apoptosis mitocondrial intrínseca, rompen las uniones celulares estrechas y provocan inflamación endotelial e isquemia microvascular.',
    clinicalSignificanceEn: 'The protective glycosaminoglycan (GAG) layer is destroyed, allowing hyperosmolar acidic urine and potassium to penetrate the suburothelium, inducing intense neurogenic C-fiber inflammation, detrusor contracture, and progressive transmural fibrosis.',
    clinicalSignificanceEs: 'Se destruye la capa protectora de glucosaminoglucanos (GAG), permitiendo que la orina ácida penetre en la submucosa, provocando inflamación neurógena de fibras C, espasmo del detrusor y fibrosis transmural progresiva.',
  }),

  biliarySphincterSpasm: Object.freeze({
    titleEn: 'Biliary Dyskinesia & Sphincter of Oddi Spasm ("K-Cramps")',
    titleEs: 'Disquinesia Biliar y Espasmo del Esfínter de Oddi («K-Cramps»)',
    pharmacologyEn: 'Ketamine causes profound smooth muscle dyskinesia in the biliary tract. It triggers hypertonicity and violent intermittent spasm of the Sphincter of Oddi, resulting in acute functional biliary obstruction, common bile duct dilation, and retrograde biliary pressure spikes.',
    pharmacologyEs: 'La ketamina produce disquinesia del músculo liso biliar. Provoca hipertonía y espasmo violento del esfínter de Oddi, generando obstrucción biliar funcional aguda, dilatación del colédoco y dolor cólico intenso.',
    clinicalSignificanceEn: 'Presents as excruciating epigastric or right upper quadrant colic radiating to the mid-back ("K-cramps"). CRITICAL HAZARD: Clinicians frequently misdiagnose this as opioid withdrawal or gastric ulcers and administer opioids, which PARADOXICALLY WORSEN sphincter of Oddi spasm.',
    clinicalSignificanceEs: 'Se presenta como dolor cólico epigástrico desgarrador que irradia a la espalda («K-cramps»). ¡PELIGRO: A menudo se confunde con úlcera y se dan opioides, que paradójicamente EMPEORAN el espasmo del esfínter de Oddi!',
  }),
});

// ============================================================================
// CLINICAL STAGING: KETAMINE-INDUCED UROPATHY (KIU / "K-BLADDER")
// ============================================================================

export const KETAMINE_UROPATHY_STAGES = Object.freeze([
  {
    stageNum: 1,
    stageId: 'stage_1_irritative',
    titleEn: 'Stage 1: Irritative & Overactive Bladder (Early Reversible Stage)',
    titleEs: 'Estadio 1: Vejiga Irritable e Hiperactiva (Estadio Precoz Reversible)',
    severity: 'mild_caution',
    symptomsEn: [
      'Increased urinary frequency: voiding every 30 to 60 minutes during the day (15–20 times/day).',
      'Nocturia: waking up 3 to 6 times per night to urinate.',
      'Mild suprapubic pressure or dull aching above the pubic bone.',
      'Urine dipstick may show sterile microscopic pyuria (leukocytes present, but bacterial cultures remain NEGATIVE).',
    ],
    symptomsEs: [
      'Aumento de frecuencia urinaria: orinar cada 30-60 minutos de día (15-20 veces al día).',
      'Nicturia: despertarse de 3 a 6 veces por noche para orinar.',
      'Molestia o pesadez sorda en el pubis.',
      'Piuria estéril en orina (leucocitos presentes, pero cultivos bacterianos NEGATIVOS).',
    ],
    pathologyEn: 'Superficial urothelial inflammation and minor mucosal edema. Bladder capacity remains relatively preserved (350–500 mL). Fully reversible with immediate and complete ketamine cessation.',
    pathologyEs: 'Inflamación urotelial superficial y edema mucoso. Capacidad vesical aún conservada (350-500 mL). Completamente reversible con el cese inmediato de ketamina.',
  },
  {
    stageNum: 2,
    stageId: 'stage_2_ulcerative',
    titleEn: 'Stage 2: Ulcerative Chemical Cystitis & Epithelial Sloughing',
    titleEs: 'Estadio 2: Cistitis Química Ulcerativa y Descamación Epitelial',
    severity: 'moderate_warning',
    symptomsEn: [
      'Intense, agonizing dysuria: sensation described as "urinating razor blades", "shards of glass", or "boiling battery acid".',
      'Macroscopic (gross) hematuria: visible blood, dark red clots, or tissue fragments sloughing in urine.',
      'Severe pelvic and urethral burning during and after urination.',
      'Functional bladder capacity drops to 150–250 mL; urgent voiding every 15 to 30 minutes.',
    ],
    symptomsEs: [
      'Disuria atroz: dolor descrito como «orinar cristales rotos», «hojas de afeitar» o «ácido hirviendo».',
      'Hematuria franca: sangre visible, coágulos oscuros o restos de mucosa descamada en orina.',
      'Ardor pélvico y uretral intenso durante y después de la micción.',
      'La capacidad vesical cae a 150-250 mL; necesidad urgente de orinar cada 15 a 30 minutos.',
    ],
    pathologyEn: 'Extensive ulceration of the urothelium (similar to severe Hunner lesions in interstitial cystitis), mucosal denudation, and subepithelial hemorrhages. Requires immediate cessation and urology referral for GAG-layer replenishment.',
    pathologyEs: 'Ulceraciones extensas de la mucosa, denudación del urotelio y hemorragias submucosas. Exige cese inmediato y urología para reconstituir la capa de glucosaminoglucanos.',
  },
  {
    stageNum: 3,
    stageId: 'stage_3_fibrotic',
    titleEn: 'Stage 3: Irreversible Bladder Contracture & Micro-Capacity Fibrosis',
    titleEs: 'Estadio 3: Contractura Vesical Irreversible y Micro-Vejiga Fibrosa',
    severity: 'severe_danger',
    symptomsEn: [
      'Extreme, crippling frequency: urinating every 5 to 15 minutes (50–80+ times per 24 hours).',
      'Severe urge incontinence: complete inability to hold urine; involuntary leakage before reaching a toilet.',
      'Continuous, agonizing pelvic and perineal pain refractory to standard analgesics.',
      'Functional bladder capacity shrinks below 50–100 mL (the size of a golf ball or egg).',
    ],
    symptomsEs: [
      'Frecuencia miccional incapacitante: orinar cada 5 a 15 minutos (50-80+ veces al día).',
      'Incontinencia de urgencia severa: incapacidad total de retener la orina con pérdidas constantes.',
      'Dolor pélvico y perineal continuo refractario a analgésicos habituales.',
      'La capacidad vesical se encoge por debajo de 50-100 mL (del tamaño de un huevo o pelota de golf).',
    ],
    pathologyEn: 'Transmural muscular fibrosis: the detrusor muscle is replaced by dense, non-compliant scar tissue. The bladder permanently loses its elasticity and can no longer distend. Even with cessation, bladder volume cannot naturally recover; surgical bladder reconstruction or cystectomy is often needed.',
    pathologyEs: 'Fibrosis transmural muscular: el músculo detrusor es sustituido por tejido cicatricial rígido. La vejiga pierde elasticidad y no se distiende. Puede requerir reconstrucción quirúrgica o cistectomía.',
  },
  {
    stageNum: 4,
    stageId: 'stage_4_hydronephrosis',
    titleEn: 'Stage 4: Ureteral Stenosis, Bilateral Hydronephrosis & End-Stage Renal Failure',
    titleEs: 'Estadio 4: Estenosis Ureteral, Hidronefrosis Bilateral y Fallo Renal Terminal',
    severity: 'critical_emergency',
    symptomsEn: [
      'Severe unilateral or bilateral flank/back pain (costovertebral angle tenderness).',
      'Oliguria or anuria: sudden drop in total daily urine output.',
      'Systemic uremic symptoms: nausea, vomiting, metallic taste, pruritus, confusion, and peripheral edema.',
      'Serum Creatinine rises sharply; marked reduction in estimated GFR (acute kidney injury / post-renal azotemia).',
    ],
    symptomsEs: [
      'Dolor lumbar o en flancos intenso uni o bilateral (dolor en fosas renales).',
      'Oliguria o anuria: caída brusca de la cantidad total de orina diaria.',
      'Síntomas urémicos: náuseas, vómitos, sabor metálico, picor cutáneo y confusión.',
      'Elevación brusca de creatinina sérica y caída del filtrado glomerular (fallo renal agudo obstructivo).',
    ],
    pathologyEn: 'Fibrotic scar tissue constricts the distal ureters (ureteral stenosis) and destroys the ureterovesical junction valves, causing severe bilateral hydronephrosis, hydroureter, and pressure-induced renal cortical atrophy. LIFE-THREATENING EMERGENCY: requires urgent bilateral percutaneous nephrostomy tubes or ureteral stents to save kidney function.',
    pathologyEs: 'La fibrosis estrangula los uréteres distales y destruye las válvulas, provocando hidronefrosis bilateral masiva y atrofia de la corteza renal. EMERGENCIA CRÍTICA: requiere nefrostomía percutánea o catéteres ureterales urgentes.',
  },
]);

// ============================================================================
// CLINICAL DIFFERENTIAL ENGINES: KIU, K-CRAMPS & EMERGENCIES
// ============================================================================

export const KETAMINE_CLINICAL_DIFFERENTIALS = Object.freeze({
  kiuVsBacterialUti: Object.freeze({
    id: 'kiu_vs_uti',
    titleEn: 'Ketamine Cystitis vs. Recurrent Bacterial UTI (The Diagnostic Misdirection Trap)',
    titleEs: 'Cistitis por Ketamina vs. ITU Bacteriana (La Trampa de Diagnóstico Erróneo)',
    severity: 'high_priority',
    mechanismEn: 'Ketamine uropathy produces sterile chemical inflammation. Standard urine dipsticks test positive for leukocytes and blood, mimicking a bacterial urinary tract infection (UTI). Patients are routinely prescribed 4 to 8 successive courses of antibiotics (ciprofloxacin, nitrofurantoin, amoxicillin) with zero improvement, while their bladder progressively fibroses.',
    mechanismEs: 'La uropatía por ketamina produce inflamación química estéril. Las tiras de orina dan positivo a leucocitos y sangre, simulando una infección bacteriana. Se suelen recetar múltiples ciclos inútiles de antibióticos mientras la vejiga se destruye por fibrosis.',
    actionEn: 'Mandatory clinical rule: Any patient under age 40 presenting with severe recurrent dysuria or hematuria must be asked directly about ketamine use. Perform quantitative urine culture (will be sterile) and order urgent renal/bladder ultrasound to screen for bladder wall thickening and hydronephrosis.',
    actionEs: 'Regla clínica obligatoria: Ante cualquier persona joven con disuria o hematuria rebelde, preguntar siempre por ketamina. Realizar urocultivo (será estéril) y ecografía renal/vesical urgente para descartar hidronefrosis.',
  }),

  kCrampsBiliary: Object.freeze({
    id: 'k_cramps_biliary',
    titleEn: 'Severe Ketamine-Induced Biliary Colic ("K-Cramps")',
    titleEs: 'Cólico Biliar Severo por Ketamina («K-Cramps»)',
    severity: 'high_priority',
    mechanismEn: 'Violent intermittent spasm of the Sphincter of Oddi causing acute biliary dilation and high intra-biliary ductal pressure. Triggers incapacitating, sharp, stabbing epigastric and RUQ pain that forces patients to double over in agony.',
    mechanismEs: 'Espasmo violento del esfínter de Oddi que provoca dilatación biliar y picos de presión intraductal. Desencadena un dolor desgarrador en epigastrio y cuadrante superior derecho.',
    actionEn: 'Treatment protocol: 1) Absolute ketamine cessation; 2) Antispasmodics (Hyoscine butylbromide 20 mg PO/IV or Dicyclomine); 3) Warm baths or heating pads to relax abdominal muscles; 4) Proton pump inhibitors for gastric acid buffering; 5) STRICT WARNING: Avoid prescribing opioids, as opioids directly contract the Sphincter of Oddi and worsen biliary spasm.',
    actionEs: 'Protocolo de tratamiento: 1) Cese de ketamina; 2) Antiespasmódicos (Butilbromuro de escopolamina 20 mg o Diciclomina); 3) Calor local o baños calientes; 4) Protectores gástricos; 5) AVISO: Evitar opioides porque contraen el esfínter de Oddi y agravan el cólico.',
  }),

  postRenalAki: Object.freeze({
    id: 'post_renal_aki',
    titleEn: 'Obstructive Post-Renal Acute Kidney Injury (AKI)',
    titleEs: 'Fallo Renal Agudo Obstructivo Post-Renal',
    severity: 'critical_emergency',
    mechanismEn: 'Bilateral ureteral strictures and high intravesical resting pressures prevent urine from draining from kidneys into the bladder. Rising pressure compresses renal parenchyma, resulting in acute tubular necrosis, hyperkalemia, metabolic acidosis, and uremia.',
    mechanismEs: 'Las estenosis ureterales y la alta presión vesical impiden el drenaje renal. La contrapresión comprime el parénquima causando necrosis tubular, hiperpotasemia, acidosis y uremia.',
    actionEn: 'EMERGENCY ROOM TRANSPORT REQUIRED. Stat serum electrolytes, creatinine, and emergency bedside renal ultrasound. Emergent urinary diversion via bilateral percutaneous nephrostomy tubes or double-J ureteral stents is required to preserve renal parenchyma.',
    actionEs: 'TRASLADO URGENTE A URGENCIAS. Analítica urgente de iones y creatinina, y ecografía renal inmediata. Requiere descompresión con nefrostomías percutáneas o catéteres doble J para salvar los riñones.',
  }),

  kHoleTrauma: Object.freeze({
    id: 'k_hole_trauma',
    titleEn: 'Dissociative Immobility ("K-Hole"), Aspiration & Water Drowning Risk',
    titleEs: 'Inmovilidad Disociativa («K-Hole»), Broncoaspiración y Riesgo de Ahogamiento',
    severity: 'critical_emergency',
    mechanismEn: 'High doses induce profound dissociative catatonia and sensory detachment from the physical body. Motor coordination is completely abolished while airway protective reflexes may become depressed or uncoordinated.',
    mechanismEs: 'Dosis elevadas provocan catatonía disociativa y desconexión sensitiva del cuerpo físico. La coordinación motora desaparece por completo y los reflejos de la vía aérea pueden debilitarse.',
    actionEn: 'CRITICAL ENVIRONMENTAL SAFETY MANDATE: Never use ketamine while in a bathtub, hot tub, swimming pool, or near water (multiple fatal drownings occur annually when users slip underwater in a dissociative state). Place unconscious individuals in the lateral recovery position to prevent vomit aspiration.',
    actionEs: 'REGLA AMBIENTAL CRÍTICA: Nunca consumir ketamina en bañeras, jacuzzis, piscinas o cerca del agua (riesgo mortal de ahogamiento al quedar disociado). Colocar en posición lateral de seguridad para evitar asfixia por vómito.',
  }),
});

// ============================================================================
// HARM REDUCTION STANDARDS & BLADDER PRESERVATION PROTOCOLS
// ============================================================================

export const KETAMINE_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Complete & Permanent Cessation is the ONLY Curative Intervention',
    titleEs: 'El Cese Completo y Permanente es la ÚNICA Intervención Curativa',
    detailEn: 'No medication, supplement, or surgery can heal the bladder if ketamine use continues. In Stages 1 and 2, cessation allows the urothelium to regenerate and symptoms to resolve. Continued use inexorably progresses to permanent muscular fibrosis and bladder loss.',
    detailEs: 'Ningún fármaco ni cirugía curará la vejiga si se sigue consumiendo ketamina. En estadios 1 y 2, el cese permite la regeneración urotelial. Continuar consumiendo lleva de forma inevitable a fibrosis irreversible.',
  },
  {
    ruleNum: 2,
    titleEn: 'EGCG (Green Tea Extract) Urothelial Antioxidant Shielding',
    titleEs: 'Protección Antioxidante Urotelial con EGCG (Extracto de Té Verde)',
    detailEn: 'Epigallocatechin gallate (EGCG), the active polyphenol in green tea, has demonstrated protective effects against ketamine-induced urothelial cell apoptosis in urology research. Taking EGCG capsules (400–800 mg) or drinking concentrated green tea prior to use helps scavenge reactive oxygen species and mitigate chemical damage.',
    detailEs: 'El EGCG (polifenol del té verde) ha demostrado en estudios urológicos proteger las células de la vejiga frente a la muerte celular por ketamina. Tomar EGCG (400-800 mg) antes del uso ayuda a reducir el daño oxidativo urotelial.',
  },
  {
    ruleNum: 3,
    titleEn: 'Intensive Hydration & Spitting the Post-Nasal Drip',
    titleEs: 'Hidratación Abundante y Escupir el Goteo Postnasal',
    detailEn: 'Drink 2 to 3 liters of water throughout the session to dilute urinary concentrations of ketamine and norketamine. Additionally, spit out the bitter post-nasal drip rather than swallowing it: swallowing delivers ketamine straight to the stomach and liver, maximizing conversion to norketamine and triggering biliary "K-cramps".',
    detailEs: 'Beba de 2 a 3 litros de agua para diluir la concentración de tóxicos en la orina. Escupa el goteo amargo postnasal en vez de tragarlo: tragarlo envía la ketamina al estómago e hígado, multiplicando la norcetamina y provocando cólicos biliares.',
  },
  {
    ruleNum: 4,
    titleEn: 'NEVER Use Ketamine in Bathtubs, Spas, or Near Water',
    titleEs: 'NUNCA Consuma Ketamina en Bañeras, Jacuzzis o Cerca del Agua',
    detailEn: 'Motor dissociation ("K-hole") paralyzes voluntary movement while leaving the eyes open or brain disconnected. Slumping under water while dissociated results in silent, painless drowning within minutes. Always use in a warm, dry, grounded bed or couch.',
    detailEs: 'La disociación («K-hole») paraliza el movimiento voluntario. Deslizarse bajo el agua disociado provoca un ahogamiento silencioso e inevitable en minutos. Consuma siempre en cama o sofá secos y seguros.',
  },
  {
    ruleNum: 5,
    titleEn: 'Urological Red Flags: When to Seek Immediate Medical Evaluation',
    titleEs: 'Signos de Alarma Urológicos: Cuándo Acudir de Urgencia al Médico',
    detailEn: 'If you experience blood in your urine (hematuria), waking up more than twice a night to pee, or severe flank/back pain, stop ketamine immediately and see a urologist or GP. Request a renal ultrasound to verify your kidneys are not swelling from hydronephrosis.',
    detailEs: 'Si nota sangre en la orina, se despierta más de dos veces por noche a orinar o siente dolor en la espalda/flancos, suspenda la ketamina y acuda al médico. Pida una ecografía renal para comprobar que los riñones no sufren hidronefrosis.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialKetamineState = () => ({
  activeTab: 'triage', // 'triage' | 'uropathy' | 'kcramps' | 'harmReduction'
  viewMode: 'community', // 'community' | 'clinical'
  hasSevereUrinaryFrequency: false,
  hasGrossHematuriaMucosalSloughing: false,
  hasFlankPainDecreasedUrine: false,
  hasSevereEpigastricKCramps: false,
  repeatedAntibioticsNegativeCultures: false,
  usingInBathtubOrNearWater: false,
});

let currentKetamineState = initialKetamineState();
const stateSubscribers = new Set();

export function getKetamineState() {
  return { ...currentKetamineState };
}

export function setKetamineState(patch) {
  currentKetamineState = { ...currentKetamineState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentKetamineState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetKetamineState() {
  currentKetamineState = initialKetamineState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentKetamineState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribeKetamineState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateKetamineRisk(state) {
  const {
    hasSevereUrinaryFrequency,
    hasGrossHematuriaMucosalSloughing,
    hasFlankPainDecreasedUrine,
    hasSevereEpigastricKCramps,
    repeatedAntibioticsNegativeCultures,
    usingInBathtubOrNearWater,
  } = state;

  // 1. Critical Water Drowning Emergency
  if (usingInBathtubOrNearWater) {
    return {
      tier: 'emergency_drowning_hazard',
      titleEn: 'EXTREME WATER DROWNING HAZARD: Ketamine Use in Bathtub / Near Water',
      titleEs: 'PELIGRO EXTREMO DE AHOGAMIENTO: Consumo de Ketamina en Bañera o Agua',
      isEmergency: true,
      actionEn: 'GET OUT OF THE WATER IMMEDIATELY. High-dose dissociative states ("K-hole") paralyze skeletal muscle coordination. Slumping beneath the waterline results in silent, irreversible drowning within 2 to 3 minutes without the person being able to lift their head. Move to a warm, dry bed or floor immediately.',
      actionEs: '¡SALGA DEL AGUA DE INMEDIATO! El estado disociativo («K-hole») paraliza la musculatura. Deslizarse bajo el agua provoca ahogamiento silencioso en 2 minutos sin poder levantar la cabeza. Trasládese a una cama o sofá seco de inmediato.',
      interventionEn: 'Immediate environmental extrication to a dry setting, lateral recovery position if stuporous, emergency evaluation for hypothermia or water aspiration.',
      interventionEs: 'Retirada inmediata del agua a un entorno seco, posición lateral de seguridad y evaluación de aspiración.',
    };
  }

  // 2. Critical Obstructive Hydronephrosis & Acute Kidney Injury
  if (hasFlankPainDecreasedUrine) {
    return {
      tier: 'emergency_hydronephrosis_renal',
      titleEn: 'CRITICAL UROLOGICAL EMERGENCY: Suspected Hydronephrosis & Post-Renal AKI (Stage 4 KIU)',
      titleEs: 'EMERGENCIA UROLÓGICA CRÍTICA: Sospecha de Hidronefrosis y Fallo Renal Agudo (Estadio 4)',
      isEmergency: true,
      actionEn: 'EMERGENCY ROOM TRANSPORT REQUIRED. Flank pain, back tenderness, and reduced urine volume in a ketamine user indicate bilateral ureteral strictures and back-pressure hydronephrosis. Left untreated, permanent cortical renal destruction occurs within days. Call 911 or go to the nearest emergency department for stat renal ultrasound and percutaneous nephrostomy decompression.',
      actionEs: 'TRASLADO URGENTE A URGENCIAS. El dolor en flancos y la disminución de orina indican estenosis de uréteres e hidronefrosis. Sin tratamiento, provoca destrucción renal irreversible en días. Requiere ecografía urgente y descompresión urológica.',
      interventionEn: 'Stat serum BUN/Creatinine, emergency renal duplex ultrasound, urgent urology consult for percutaneous nephrostomy tubes or double-J ureteral stenting.',
      interventionEs: 'Analítica de creatinina urgente, ecografía renal y colocación de nefrostomías o catéteres ureterales doble J.',
    };
  }

  // 3. Severe Ulcerative Cystitis & Gross Hematuria
  if (hasGrossHematuriaMucosalSloughing) {
    return {
      tier: 'emergency_ulcerative_hematuria',
      titleEn: 'SEVERE UROLOGICAL ALERT: Ulcerative Chemical Cystitis & Hematuria (Stage 2–3 KIU)',
      titleEs: 'ALERTA UROLÓGICA GRAVE: Cistitis Química Ulcerativa y Hematuria (Estadios 2-3)',
      isEmergency: true,
      actionEn: 'STOP KETAMINE IMMEDIATELY. Passing blood clots, tissue slough, and agonizing "razor blade" urination indicate severe chemical ulceration of the bladder lining. Continued use causes permanent micro-bladder contracture requiring surgical removal (cystectomy). Urgent urological evaluation with flexible cystoscopy and GAG-layer replenishment is mandatory.',
      actionEs: 'DETENGA LA KETAMINA DE INMEDIATO. Expulsar sangre, coágulos y sentir «cuchillas de afeitar» al orinar indica ulceración química severa de la vejiga. Continuar consumiendo destruye la vejiga de por vida obligando a extirparla (cistectomía). Requiere urología urgente.',
      interventionEn: 'Urgent urology consultation, flexible cystoscopy, intravesical glycosaminoglycan instillation (hyaluronic acid / chondroitin sulfate), pelvic floor therapy.',
      interventionEs: 'Consulta urológica urgente, cistoscopia, instilaciones vesicales de ácido hialurónico y fisioterapia de suelo pélvico.',
    };
  }

  // 4. Severe Biliary "K-Cramps"
  if (hasSevereEpigastricKCramps) {
    return {
      tier: 'urgent_k_cramps',
      titleEn: 'ACUTE GASTROINTESTINAL ALERT: Severe Ketamine Biliary Colic ("K-Cramps")',
      titleEs: 'ALERTA GASTROINTESTINAL AGUDA: Cólico Biliar Intenso por Ketamina («K-Cramps»)',
      isEmergency: false,
      actionEn: 'STOP KETAMINE. Severe mid-back and upper abdominal pain is caused by violent spasm of the Sphincter of Oddi and common bile duct dilation. Protocol: 1) Administer antispasmodics (Hyoscine butylbromide 20 mg PO or Dicyclomine); 2) Take warm baths and apply abdominal heat pads; 3) DO NOT TAKE OPIOIDS (opioids directly constrict the sphincter of Oddi and intensify biliary colic).',
      actionEs: 'SUSPENDA LA KETAMINA. El dolor desgarrador en abdomen y espalda se debe a espasmo del esfínter de Oddi. Protocolo: 1) Antiespasmódicos (Butilbromuro de escopolamina 20 mg); 2) Baños de agua caliente; 3) NO TOME OPIOIDES (los opioides contraen más el esfínter agravando el dolor).',
      interventionEn: 'Oral or IV antispasmodics (hyoscine/dicyclomine), liver function tests (LFTs) and lipase, right upper quadrant biliary ultrasound to exclude choledocholithiasis.',
      interventionEs: 'Antiespasmódicos, analítica hepática y lipasa, y ecografía de vía biliar para descartar coledocolitiasis.',
    };
  }

  // 5. Misdiagnosed Bacterial UTI Trap
  if (repeatedAntibioticsNegativeCultures) {
    return {
      tier: 'urgent_kiu_misdiagnosis',
      titleEn: 'DIAGNOSTIC ALERT: Suspected Ketamine Cystitis Misdiagnosed as Recurrent Bacterial UTI',
      titleEs: 'ALERTA DIAGNÓSTICA: Sospecha de Cistitis por Ketamina Confundida con ITU Bacteriana',
      isEmergency: false,
      actionEn: 'STOP REPEATED ANTIBIOTICS. Ketamine-induced uropathy causes sterile chemical inflammation with leukocytes on dipstick, but urine bacterial cultures are negative. Taking repeated courses of antibiotics will NOT heal the bladder. Inform your physician of your ketamine use and request a referral to a urologist specializing in bladder pain and toxic uropathy.',
      actionEs: 'DETENGA LOS ANTIBIÓTICOS REPETIDOS. La uropatía por ketamina produce inflamación química estéril; los cultivos de orina son negativos. Tomar antibióticos no curará la vejiga. Informe a su médico sobre el uso de ketamina y solicite derivación a urología.',
      interventionEn: 'Antibiotic stewardship review, quantitative urine culture, post-void residual measurement, renal and bladder ultrasound, cessation counseling.',
      interventionEs: 'Revisión y cese de antibióticos inútiles, urocultivo cuantitativo, ecografía vesical y renal, y plan de cese de ketamina.',
    };
  }

  // 6. Early Irritative Uropathy
  if (hasSevereUrinaryFrequency) {
    return {
      tier: 'early_uropathy_irritative',
      titleEn: 'EARLY UROPATHY WARNING: Irritable Bladder & Increased Frequency (Stage 1 KIU)',
      titleEs: 'AVISO PRECOZ DE UROPATÍA: Vejiga Irritable y Alta Frecuencia (Estadio 1)',
      isEmergency: false,
      actionEn: 'TAKE IMMEDIATE ACTION TO PROTECT YOUR BLADDER. Frequent urination and nocturia are the earliest warning signs of chemical urothelial damage. Bladder volume is still preserved and completely reversible IF you stop ketamine now. Protocol: 1) Cease ketamine; 2) Take EGCG green tea extract (400–800 mg); 3) Drink 2–3 liters of water daily; 4) Avoid caffeine and alcohol.',
      actionEs: 'PROTEJA SU VEJIGA DE INMEDIATO. Orinar con frecuencia y levantarse de noche son los primeros signos de daño urotelial. La capacidad de su vejiga aún se puede salvar por completo SI suspende la ketamina ahora. Tome EGCG (té verde), beba agua y evite cafeína.',
      interventionEn: 'Behavioral cessation support, baseline renal panel and urinalysis, daily voiding diary tracking, harm reduction education with EGCG.',
      interventionEs: 'Apoyo para el cese, analítica renal basal, diario miccional y educación en reducción de daños con EGCG.',
    };
  }

  // 7. Standard Ketamine Harm Reduction Guidance
  return {
    tier: 'standard_ketamine_harm_reduction',
    titleEn: 'Standard Ketamine Harm Reduction & Bladder Preservation Guidance',
    titleEs: 'Pautas Estándar de Reducción de Daños y Protección Vesical para Ketamina',
    isEmergency: false,
    actionEn: 'No acute emergency flags detected. Harm reduction standards: Always take EGCG (green tea extract) prior to sessions, hydrate with 2 to 3 liters of water to dilute urinary metabolites, spit out the bitter post-nasal drip, never use ketamine in bathtubs or near water, and space out sessions by weeks to allow bladder tissues to heal.',
    actionEs: 'No se detectan banderas rojas críticas. Pautas de reducción de daños: tome EGCG (extracto de té verde) antes de consumir, beba 2 a 3 litros de agua para diluir la orina, escupa el goteo amargo postnasal, jamás consuma en bañeras y distancie las tomas varias semanas.',
    interventionEn: 'Harm reduction education, provision of testing strips (reagents/fentanyl), hydration tracking, and non-judgmental healthcare engagement.',
    interventionEs: 'Educación en reducción de daños, tiras reactivas de fentanilo/reactivos y control de hidratación.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildKetamineSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: EVALUACIÓN DE KETAMINA, UROPATÍA («K-BLADDER») Y CÓLICOS',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      'Presentación clínica para evaluación de toxicidad por ketamina o complicaciones vesicales.',
      `Estado clínico evaluado: ${evaluation.titleEs}.`,
      `Nivel de urgencia médica: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA / UROLÓGICA' : 'PROTECCIÓN VESICAL Y REDUCCIÓN DE DAÑOS'}.`,
      '',
      'B (ANTECEDENTES / FACTORES UROLÓGICOS Y CLÍNICOS):',
      `- Frecuencia miccional extrema (> 15-20 veces/día / nicturia): ${state.hasSevereUrinaryFrequency ? 'SÍ (ESTADIO 1-3 KIU)' : 'No'}.`,
      `- Hematuria macroscópica / descamación urotelial («orinar cristales»): ${state.hasGrossHematuriaMucosalSloughing ? 'SÍ (CISTITIS QUÍMICA ULCERATIVA)' : 'No'}.`,
      `- Dolor lumbar / oliguria (Sospecha hidronefrosis o fallo renal): ${state.hasFlankPainDecreasedUrine ? 'SÍ (ALERTA DE HIDRONEFROSIS / UROPATÍA ESTADIO 4)' : 'No'}.`,
      `- Cólico epigástrico desgarrador («K-cramps» / espasmo de Oddi): ${state.hasSevereEpigastricKCramps ? 'SÍ (ESPASMO BILIAR - EVITAR OPIOIDES)' : 'No'}.`,
      `- Múltiples ciclos de antibióticos con urocultivos negativos: ${state.repeatedAntibioticsNegativeCultures ? 'SÍ (ERROR DIAGNÓSTICO DE ITU BACTERIANA)' : 'No'}.`,
      `- Consumo en bañera, jacuzzi o cerca de agua (Riesgo de ahogamiento): ${state.usingInBathtubOrNearWater ? 'SÍ (PELIGRO CRÍTICO DE AHOGAMIENTO)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y MANEJO UROLÓGICO):',
      '1. El cese completo de ketamina es la ÚNICA medida curativa demostrada; en estadios tempranos revierte la inflamación.',
      '2. Si hay dolor en flancos o caída de orina: ecografía renal urgente para descartar hidronefrosis obstructiva bilateral.',
      '3. En cólicos «K-cramps»: pautar antiespasmódicos (butilbromuro de escopolamina); prohibir opioides (empeoran espasmo de Oddi).',
      '4. Educar en protección urotelial con EGCG (400-800 mg), hidratación masiva (2-3 L) y escupir el goteo postnasal.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'KETAMINE CARE, UROPATHY ("K-BLADDER") & BILIARY COLIC SBAR NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    'Clinical evaluation for ketamine-associated complications, uropathy, or biliary spasm.',
    `Assessed Presentation: ${evaluation.titleEn}.`,
    `Safety Urgency: ${evaluation.isEmergency ? 'MEDICAL / UROLOGICAL EMERGENCY' : 'BLADDER PRESERVATION & HARM REDUCTION'}.`,
    '',
    'B (BACKGROUND / UROLOGICAL & CLINICAL FACTORS):',
    `- Severe urinary frequency (> 15–20 voids/day / nocturia): ${state.hasSevereUrinaryFrequency ? 'YES (STAGE 1–3 KIU)' : 'No'}.`,
    `- Gross hematuria / tissue sloughing / agonizing dysuria: ${state.hasGrossHematuriaMucosalSloughing ? 'YES (ULCERATIVE CHEMICAL CYSTITIS)' : 'No'}.`,
    `- Flank pain / oliguria (Suspected hydronephrosis / renal failure): ${state.hasFlankPainDecreasedUrine ? 'YES (STAGE 4 KIU / HYDRONEPHROSIS ALERT)' : 'No'}.`,
    `- Severe epigastric colic ("K-cramps" / biliary Oddi spasm): ${state.hasSevereEpigastricKCramps ? 'YES (BILIARY SPASM - AVOID OPIOIDS)' : 'No'}.`,
    `- Repeated antibiotic courses with negative bacterial cultures: ${state.repeatedAntibioticsNegativeCultures ? 'YES (MISDIAGNOSED STERILE CYSTITIS)' : 'No'}.`,
    `- Ketamine use in bathtub, jacuzzi, or near water: ${state.usingInBathtubOrNearWater ? 'YES (CRITICAL DROWNING HAZARD)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Clinical Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & UROLOGY MANAGEMENT):',
    '1. Complete and permanent ketamine cessation is the ONLY curative intervention; allows mucosal healing in early stages.',
    '2. If flank pain or decreased urine: stat renal ultrasound to rule out bilateral obstructive hydronephrosis.',
    '3. For "K-cramps": treat with antispasmodics (hyoscine/dicyclomine); strictly avoid opioids which worsen sphincter of Oddi spasm.',
    '4. Advocate bladder harm reduction: EGCG (green tea extract 400–800 mg), heavy hydration (2–3 L), and spitting post-nasal drip.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function ketamineCareView() {
  const container = h('div', { class: 'ketamine-care-view' });

  function render() {
    clear(container);
    const state = getKetamineState();
    const evaluation = evaluateKetamineRisk(state);

    // Header Banner
    const header = h('header', { class: 'kc-header' }, [
      h('div', { class: 'kc-header-badge' }, [
        icon('activity'),
        h('span', {}, t('kc.header.badge', 'Dissociative Care & Bladder Health')),
      ]),
      h('h1', { class: 'kc-header-title' }, t('kc.header.title', 'Ketamine Harm Reduction & Uropathy Navigator')),
      h('p', { class: 'kc-header-desc' }, t('kc.header.desc', 'Evidence-based clinical decision support and harm reduction standards from the American Urological Association (AUA) and British Association of Urological Surgeons (BAUS): Ketamine-Induced Uropathy (KIU / "K-Bladder") staging, biliary "K-cramps" management, EGCG antioxidant protection, and water drowning safety.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'kc-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        type: 'button',
        class: `kc-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setKetamineState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('kc.mode.community', 'Community & Peer Mode (Bladder Safety & K-Cramps)')),
      ]),
      h('button', {
        type: 'button',
        class: `kc-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setKetamineState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('kc.mode.clinical', 'Clinician & Urology Mode (KIU Staging & SBAR)')),
      ]),
    ]);

    // Tabs Nav
    const tabsList = h('div', { class: 'kc-tabs-nav', role: 'tablist', 'aria-label': 'Ketamine Care Tabs' }, [
      h('button', {
        type: 'button',
        class: `kc-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setKetamineState({ activeTab: 'triage' }),
      }, t('kc.tabs.triage', 'Uropathy & Symptom Triage')),
      h('button', {
        type: 'button',
        class: `kc-tab-btn ${state.activeTab === 'uropathy' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'uropathy' ? 'true' : 'false',
        onclick: () => setKetamineState({ activeTab: 'uropathy' }),
      }, t('kc.tabs.uropathy', 'K-Bladder Staging (1–4)')),
      h('button', {
        type: 'button',
        class: `kc-tab-btn ${state.activeTab === 'kcramps' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'kcramps' ? 'true' : 'false',
        onclick: () => setKetamineState({ activeTab: 'kcramps' }),
      }, t('kc.tabs.kcramps', 'K-Cramps & Biliary Triage')),
      h('button', {
        type: 'button',
        class: `kc-tab-btn ${state.activeTab === 'harmReduction' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'harmReduction' ? 'true' : 'false',
        onclick: () => setKetamineState({ activeTab: 'harmReduction' }),
      }, t('kc.tabs.harmReduction', 'Harm Reduction & EGCG Shielding')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'uropathy':
        tabContent = renderUropathyTab();
        break;
      case 'kcramps':
        tabContent = renderKCrampsTab();
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
    const section = h('section', { class: 'kc-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'kc-inputs-grid' }, [
      // 1. Water / Bathtub Checkbox
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.usingInBathtubOrNearWater,
            onchange: (e) => setKetamineState({ usingInBathtubOrNearWater: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('kc.check.bathStrong', 'Currently in a Bathtub, Spa, or Near Water? ')),
            t('kc.check.bathDetail', '(Critical: Fatal drowning & motor dissociation hazard)'),
          ]),
        ]),
      ]),

      // 2. Flank Pain / Decreased Urine (Hydronephrosis)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasFlankPainDecreasedUrine,
            onchange: (e) => setKetamineState({ hasFlankPainDecreasedUrine: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('kc.check.flankStrong', 'Flank / Mid-Back Pain or Reduced Urine Output? ')),
            t('kc.check.flankDetail', '(Critical: Ureteral stenosis, hydronephrosis & kidney failure)'),
          ]),
        ]),
      ]),

      // 3. Gross Hematuria & Agonizing Pain
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasGrossHematuriaMucosalSloughing,
            onchange: (e) => setKetamineState({ hasGrossHematuriaMucosalSloughing: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('kc.check.bloodStrong', 'Visible Blood, Clots, or "Razor Blade" Agony When Urinating? ')),
            t('kc.check.bloodDetail', '(Severe ulcerative chemical cystitis: Stage 2–3 KIU)'),
          ]),
        ]),
      ]),

      // 4. Severe Epigastric K-Cramps
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSevereEpigastricKCramps,
            onchange: (e) => setKetamineState({ hasSevereEpigastricKCramps: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('kc.check.crampStrong', 'Severe Stabbing Stomach / RUQ Pain Radiating to Back? ')),
            t('kc.check.crampDetail', '(Ketamine biliary colic / Sphincter of Oddi spasm: "K-cramps")'),
          ]),
        ]),
      ]),

      // 5. Misdiagnosed Bacterial UTI
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.repeatedAntibioticsNegativeCultures,
            onchange: (e) => setKetamineState({ repeatedAntibioticsNegativeCultures: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('kc.check.utiStrong', 'Given Repeated Antibiotics for "UTIs" with Negative Cultures? ')),
            t('kc.check.utiDetail', '(Diagnostic trap: Sterile chemical cystitis, not bacterial infection)'),
          ]),
        ]),
      ]),

      // 6. Urinary Frequency
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSevereUrinaryFrequency,
            onchange: (e) => setKetamineState({ hasSevereUrinaryFrequency: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('kc.check.freqStrong', 'Urinating Every 30–60 Minutes or Waking Multiple Times Nightly? ')),
            t('kc.check.freqDetail', '(Early warning: Stage 1 irritable bladder & GAG breakdown)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `kc-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'kc-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'kc-result-details' }, [
        h('div', { class: 'kc-rec-item' }, [
          h('strong', {}, t('kc.res.action', 'Clinical & Harm Reduction Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'kc-rec-item' }, [
          h('strong', {}, t('kc.res.intervention', 'Recommended Medical Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // SBAR Export Card
    const copyEnBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      onclick: () => {
        const text = buildKetamineSbarText(state, evaluation, 'en');
        copyText(text, { trigger: copyEnBtn });
      },
    }, [icon('copy'), h('span', {}, t('kc.sbar.copyEn', 'Copy Clinical SBAR (English)'))]);
    const copyEsBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      onclick: () => {
        const text = buildKetamineSbarText(state, evaluation, 'es');
        copyText(text, { trigger: copyEsBtn });
      },
    }, [icon('copy'), h('span', {}, t('kc.sbar.copyEs', 'Copiar SBAR (Español)'))]);
    const sbarCard = h('div', { class: 'kc-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('kc.sbar.title', 'Zero-PII Ketamine & Urology Clinical Handoff Note Generator')),
        h('div', { class: 'sbar-actions' }, [copyEnBtn, copyEsBtn]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildKetamineSbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderUropathyTab() {
    const section = h('section', { class: 'kc-uropathy-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'kc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('kc.uro.heading', 'Ketamine-Induced Uropathy (KIU / "K-Bladder") Staging (Stages 1–4)')),
      h('p', { class: 'tab-subtitle' }, t('kc.uro.subtitle', 'Clinical progression from reversible mucosal irritation to irreversible transmural fibrosis, small-capacity micro-bladder, ureteral stenosis, and renal failure.')),
    ]);

    const stagesGrid = h('div', { class: 'kc-stages-grid' }, KETAMINE_UROPATHY_STAGES.map((stg) => h('div', { class: `kc-stage-card ${stg.severity}` }, [
      h('div', { class: `stage-badge ${stg.severity}` }, `Stage ${stg.stageNum}`),
      h('h3', { class: 'stage-title' }, stg.titleEn),
      h('div', { class: 'stage-section' }, [
        h('strong', {}, 'Clinical Symptoms:'),
        h('ul', {}, stg.symptomsEn.map((sym) => h('li', {}, sym))),
      ]),
      h('div', { class: 'stage-section' }, [
        h('strong', {}, 'Underlying Pathology & Prognosis:'),
        h('p', {}, stg.pathologyEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(stagesGrid);
    return section;
  }

  function renderKCrampsTab() {
    const section = h('section', { class: 'kc-kcramps-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'kc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('kc.cramp.heading', 'Ketamine Biliary Colic ("K-Cramps") & Sphincter of Oddi Spasm')),
      h('p', { class: 'tab-subtitle' }, t('kc.cramp.subtitle', 'Pathophysiology of smooth muscle hypertonicity in the biliary tract, differential diagnosis, and why opioids are strictly contraindicated.')),
    ]);

    const diffsGrid = h('div', { class: 'kc-diffs-grid' }, Object.values(KETAMINE_CLINICAL_DIFFERENTIALS).map((diff) => h('div', { class: `kc-diff-card ${diff.severity}` }, [
      h('div', { class: `diff-badge ${diff.severity}` }, diff.severity.toUpperCase().replace('_', ' ')),
      h('h3', { class: 'diff-title' }, diff.titleEn),
      h('div', { class: 'diff-field' }, [
        h('strong', {}, 'Pathological Mechanism: '),
        h('p', {}, diff.mechanismEn),
      ]),
      h('div', { class: 'diff-field action-field' }, [
        h('strong', {}, 'Clinical Management Directive: '),
        h('p', {}, diff.actionEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(diffsGrid);
    return section;
  }

  function renderHarmReductionTab() {
    const section = h('section', { class: 'kc-harm-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'kc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('kc.hr.heading', 'Bladder Preservation, EGCG Antioxidant Shielding & Safer Use')),
      h('p', { class: 'tab-subtitle' }, t('kc.hr.subtitle', 'Practical, evidence-based directives to prevent permanent bladder contracture, water drowning accidents, and kidney failure.')),
    ]);

    const rulesGrid = h('div', { class: 'kc-rules-grid' }, KETAMINE_HARM_REDUCTION_RULES.map((rule) => h('div', { class: 'kc-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${rule.ruleNum}`),
      h('h3', {}, rule.titleEn),
      h('p', {}, rule.detailEn),
    ])));

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    const urologyCrossLink = h('div', { class: 'kc-card mt-3' }, [
      h('h3', {}, 'Obstructive Uropathy, Hydronephrosis & Acute Urinary Retention'),
      h('p', {}, 'Severe ketamine ulcerative cystitis can progress to bilateral ureteral stricture, hydronephrosis, and acute urinary retention. Access acute urologic decompression, post-obstructive diuresis, and genitourinary emergency protocols: '),
      h('a', { href: '#/urology-care' }, 'Open Urologic & Genitourinary Emergencies Navigator →'),
    ]);
    section.appendChild(urologyCrossLink);
    return section;
  }

  // Initial render
  const unsubscribe = subscribeKetamineState(() => render());
  render();

  return container;
}
