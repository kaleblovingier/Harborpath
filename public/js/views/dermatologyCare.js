import { h, clear } from '../dom.js';
import { t, getLang } from '../i18n.js';

function el(tag, props = {}, ...children) {
  const { className, attrs, ...rest } = props || {};
  const hProps = { ...rest };
  if (className) hProps.class = className;
  if (attrs) Object.assign(hProps, attrs);
  return h(tag, hProps, ...children);
}

function makeButton(label, onClick, opts = {}) {
  const { className = 'button', ariaPressed, ...rest } = opts;
  return h(
    'button',
    {
      type: 'button',
      class: className,
      'aria-pressed': ariaPressed,
      onclick: onClick,
      ...rest
    },
    label
  );
}

function makeLinkButton(label, href, opts = {}) {
  const { className = 'button secondary', ...rest } = opts;
  return h('a', { href, class: className, ...rest }, label);
}

/**
 * Wave 52 (Track B): Dermatology, Cutaneous Necrosis, Xylazine Eschar,
 * SJS/TEN, DRESS Syndrome & Injectional Cutaneous Emergencies Navigator (#/dermatology-care)
 *
 * Zero-PII, 100% ephemeral in-RAM clinical decision support covering:
 *  1. Xylazine ("Tranq") Non-Injection & Injection Cytotoxic Necrotic Ulcers (Autolytic/Enzymatic vs Sharp Debridement)
 *  2. Stevens-Johnson Syndrome (SJS) & Toxic Epidermal Necrolysis (TEN) (Lamotrigine/Valproate, Carbamazepine, TMP-SMX)
 *  3. DRESS Syndrome (Drug Reaction with Eosinophilia and Systemic Symptoms — Vancomycin HLA-A*32:01 & Anticonvulsants)
 *  4. Cutaneous/Injectional Anthrax, Wound Botulism & "Puffy Hand" Lymphedema in Skin-Popping
 *  5. Nicolau Syndrome (Embolia Cutis Medicamentosa — Depot Buprenorphine/Naltrexone/IM Injection Arterial Necrosis)
 *  6. Stimulant Formication ("Meth Mites"), Neurotic Excoriations & Ecthyma (Hydrocolloid Occlusive Healing)
 */

export const DERMATOLOGY_SYNDROME_PROFILES = Object.freeze({
  xylazine_necrotic_ulcers: Object.freeze({
    id: 'xylazine_necrotic_ulcers',
    urgency: 'URGENT',
    badgeEn: 'AUTOLYTIC / ENZYMATIC DEBRIDEMENT — PRESERVE EXPOSED TENDON/BONE',
    badgeEs: 'DESBRIDAMIENTO AUTOLÍTICO / ENZIMÁTICO — PRESERVAR TENDÓN Y HUESO',
    titleEn: 'Xylazine ("Tranq") Cytotoxic Necrotic Ulcers & Eschar Preservation Protocol',
    titleEs: 'Úlceras Necróticas Citotóxicas por Xilacina ("Tranq") y Protocolo de Preservación de Escaras',
    summaryEn:
      'Punched-out violaceous blisters and coalescing black/brown necrotic eschars affecting extensor forearms, shins, and hands—occurring both at injection sites and at distant non-injected skin sites due to systemic alpha-2 microvascular vasoconstriction.',
    summaryEs:
      'Flictenas violáceas en sacabocados y escaras necróticas negras/pardas confluentes en antebrazos extensores, piernas y manos, que aparecen tanto en sitios de inyección como en zonas distantes no inyectadas por vasoconstricción microvascular alfa-2 sistémica.',
    pathophysiologyEn:
      'Xylazine (veterinary alpha-2 adrenergic agonist) activates peripheral vascular alpha-2 receptors, causing intense dermal arteriolar vasoconstriction, prolonged tissue hypoxia, neutrophil extracellular trap (NET) formation, and direct fibroblast cytotoxicity. Ulcers rapidly erode through subcutaneous fat down to bare extensor tendons and periosteum.',
    pathophysiologyEs:
      'La xilacina (agonista alfa-2 veterinario) activa receptores alfa-2 vasculares periféricos, causando vasoconstricción arteriolar dérmica intensa, hipoxia tisular prolongada y citotoxicidad directa sobre fibroblastos, exponiendo tendones extensores y periostio.',
    diagnosticsEn: [
      'Wound Bed Assessment: Differentiate stable, dry, non-fluctuant black eschar (serving as a biologic biological dressing over avascular tendon) from wet gangrene, purulent undermined liquefaction, crepitus, or advancing systemic sepsis.',
      'Probe-to-Bone (PTB) Test, Plain Radiographs, ESR/CRP & MRI: Evaluate for contiguous osteomyelitis or tenosynovitis when bone or tendon is visible at the ulcer base.',
      'Screen for Concurrent Opioid + Alpha-2 Adrenergic Withdrawal (severe anxiety, hypertension, tachycardia, diaphoresis not fully relieved by methadone/buprenorphine alone).'
    ],
    diagnosticsEs: [
      'Evaluación del Lecho Ulceroso: Diferenciar la escara seca y estable (que actúa como apósito biológico sobre tendones avasculares) de la gangrena húmeda, fluctuación purulenta, crepitación o sepsis sistémica.',
      'Prueba de Sonda al Hueso (PTB), Radiografías, VSG/PCR y RM: Descartar osteomielitis contigua o tenosinovitis cuando hay tendón o hueso expuesto.',
      'Tamizar abstinencia mixta de Opioides + Alfa-2 (hipertensión, taquicardia y ansiedad que requieren clonidina/tizanidina/dexmedetomidina además de TMO).'
    ],
    managementEn: [
      'CARDINAL XYLAZINE DEBRIDEMENT RULE: Avoid aggressive sharp surgical debridement of stable, non-infected xylazine eschar when doing so would strip periosteum or expose bare avascular tendon/bone without immediate flap coverage—exposed dry tendon desiccates and ruptures, leading to preventable limb amputation! Reserve urgent surgical debridement for wet gangrene, necrotizing fasciitis, abscess, or systemic sepsis.',
      'Autolytic & Enzymatic Wound Bed Preparation: Cleanse gently with sterile normal saline or hypochlorous acid (0.01%–0.025%). NEVER use cytotoxic hydrogen peroxide, rubbing alcohol, povidone-iodine, or full-strength Dakin bleach solution! Apply Enzymatic Collagenase (Santyl) or Medical-Grade Honey (Medihoney) / amorphous hydrogel to soften eschar.',
      'Tendon-Protecting Non-Adherent Dressings: Cover exposed tendon/granulation tissue with petrolatum-bismuth gauze (Xeroform), silicone contact layer (Mepitel), or moist hydrofera blue + absorbent foam wrap changed every 24–72 hours.',
      'Concurrent Alpha-2 Withdrawal & MOUD Stabilization: Pair Methadone or Buprenorphine with Clonidine (0.1–0.3 mg PO TID), Tizanidine, or Guanfacine plus Gabapentin/Ketamine so severe pain and withdrawal do not force premature hospital discharge.'
    ],
    managementEs: [
      'REGLA CARDINAL DE DESBRIDAMIENTO EN XILACINA: Evitar el desbridamiento quirúrgico cortante agresivo de escaras estables y secas por xilacina cuando esto deje tendón o hueso desnudo sin cobertura vascularizada (el tendón seco se deseca y rompe, llevando a amputación prevenible). Reservar el desbridamiento quirúrgico urgente para gangrena húmeda, absceso o sepsis.',
      'Desbridamiento Autolítico y Enzimático: Limpiar suavemente con solución salina estéril o ácido hipocloroso. ¡NUNCA usar agua oxigenada, alcohol, yodopovidona ni hipoclorito concentrado! Aplicar Colagenasa enzimática (Santyl) o Miel de Grado Médico (Medihoney) / hidrogel.',
      'Apósitos No Adherentes Protectores de Tendón: Cubrir tendón expuesto con gasa vaselinada con bismuto (Xeroform) o malla de silicona (Mepitel) + espuma absorbente cada 24–72 horas.',
      'Estabilización de Abstinencia Alfa-2 y TMO: Asociar Metadona o Buprenorfina con Clonidina (0.1–0.3 mg c/8h), Tizanidina o Guanfacina más analgesia multimodal.'
    ],
    harmReductionEn:
      'Distribute portable wound-care kits containing sterile saline pods, Xeroform/non-adherent petrolatum pads, rolled gauze, and xylazine test strips, and reassure patients that xylazine ulcers can heal even if they are not yet able to stop all substance use.',
    harmReductionEs:
      'Distribuir kits de curación con ampolletas de solución salina, gasas vaselinadas no adherentes (Xeroform), vendas y tiras reactivas de xilacina, asegurando una atención libre de estigma.'
  }),

  sjs_ten_epidermal_necrolysis: Object.freeze({
    id: 'sjs_ten_epidermal_necrolysis',
    urgency: 'EMERGENCY',
    badgeEn: 'POSITIVE NIKOLSKY + MUCOSITIS — STAT DRUG CESSATION & BURN ICU',
    badgeEs: 'SIGNO DE NIKOLSKY POSITIVO + MUCOSITIS — SUSPENDER FÁRMACO Y UCI DE QUEMADOS',
    titleEn: 'Stevens-Johnson Syndrome (SJS) & Toxic Epidermal Necrolysis (TEN) (Lamotrigine, Carbamazepine & TMP-SMX)',
    titleEs: 'Síndrome de Stevens-Johnson (SSJ) y Necrólisis Epidérmica Tóxica (NET) (Lamotrigina, Carbamazepina y TMP-SMX)',
    summaryEn:
      'Life-threatening mucocutaneous blistering emergency (< 10% BSA detachment = SJS; 10–30% BSA = SJS/TEN overlap; > 30% BSA = TEN, carrying 30–50% mortality). Frequently triggered in dual-diagnosis and addiction care by rapid Lamotrigine titration (especially when combined with Valproate!), Carbamazepine/Oxcarbazepine, Phenytoin, TMP-SMX (Bactrim), or Modafinil.',
    summaryEs:
      'Emergencia mucocutánea ampollosa potencialmente mortal (< 10% SCT = SSJ; 10–30% = superposición; > 30% SCT = NET, con mortalidad 30–50%). Desencadenada en patología dual y adicciones por titulación rápida de Lamotrigina (especialmente combinada con Valproato), Carbamazepina/Oxcarbazepina, Fenitoína, TMP-SMX (Bactrim) o Modafinilo.',
    pathophysiologyEn:
      'Drug-specific CD8+ cytotoxic T-lymphocytes and NK cells release granulysin, perforin/granzyme B, and Fas ligand, triggering massive full-thickness keratinocyte apoptosis at the dermal-epidermal junction. Note: Valproic acid inhibits hepatic glucuronidation (UGT1A4) of Lamotrigine, more than DOUBLING Lamotrigine serum levels and precipitating SJS/TEN if standard starter doses are used!',
    pathophysiologyEs:
      'Linfocitos T CD8+ citotóxicos y células NK liberan granulisina y perforina, causando apoptosis masiva de queratinocitos en la unión dermoepidérmica. Nota: El ácido valproico inhibe la glucuronidación hepática (UGT1A4) de la Lamotrigina, DUPLICANDO sus niveles séricos y precipitando SSJ/NET si no se reduce la dosis a la mitad.',
    diagnosticsEn: [
      'Prodrome & Cutaneous Hallmarks: 1–3 day febrile flu-like prodrome followed by intensely painful dusky erythematous/purpuric macules with atypical targetoid lesions, flaccid blisters, and a POSITIVE NIKOLSKY SIGN (gentle lateral thumb pressure shears off the epidermis).',
      'Mandatory Mucosal Triad (>= 2 Mucosal Surfaces in > 90% of Cases): Hemorrhagic crusting of the lips/oral cavity, purulent/pseudomembranous conjunctivitis (high risk of permanent corneal blindness!), and erosive urogenital/urethral mucositis.',
      'Calculate SCORTEN Severity Score within 24 Hours (7 independent predictors, 1 point each): (1) Age >= 40y; (2) Heart rate >= 120 bpm; (3) Cancer/hematologic malignancy; (4) Detached BSA >= 10% on Day 1; (5) Serum BUN > 28 mg/dL; (6) Serum Glucose > 252 mg/dL; (7) Serum Bicarbonate < 20 mEq/L.'
    ],
    diagnosticsEs: [
      'Pródromo y Signos Cutáneos: Pródromo febril de 1–3 días seguido de máculas eritemato-violáceas dolorosas, lesiones dianoides atípicas, ampollas flácidas y SIGNO DE NIKOLSKY POSITIVO (el roce lateral desprende la epidermis).',
      'Compromiso Mucoso (>= 2 Mucosas en > 90%): Costras hemorrágicas labiales/orales, conjuntivitis pseudomembranosa (riesgo de ceguera corneal permanente) y mucositis urogenital.',
      'Calcular Escala Pronóstica SCORTEN en las primeras 24 horas (7 variables): Edad >= 40 años, FC >= 120 lpm, neoplasia, superficie desprendida >= 10%, BUN > 28 mg/dL, Glucosa > 252 mg/dL y Bicarbonato < 20 mEq/L.'
    ],
    managementEn: [
      'IMMEDIATE & PERMANENT WITHDRAWAL OF CULPRIT DRUG: Stop Lamotrigine, Carbamazepine, TMP-SMX, or NSAIDs immediately—early withdrawal within 24 hours of blister onset significantly reduces mortality.',
      'Transfer to a Burn ICU / Specialized Intensive Care Unit: Manage fluid/electrolyte losses (Parkland/modified burn resuscitation), warm ambient room temperature (30–32°C) to prevent hypothermic hypermetabolism, and use non-adherent petrolatum/silicone dressings (leave intact blister roofs in place as a biological dressing). Avoid prophylactic systemic antibiotics unless clinical sepsis develops.',
      'STAT Ophthalmology Consultation within 24 Hours: Daily preservative-free lubricating drops, topical steroid/antibiotic drops, ocular symblepharon lysis, and early Amniotic Membrane Transplantation (AMT) to prevent permanent cicatricial blindness.',
      'Immunomodulatory Therapy (per Dermatology/Burn ICU protocol): Cyclosporine (3–5 mg/kg/day), TNF-alpha inhibitor (Etanercept 50 mg SC single dose), or systemic corticosteroids.'
    ],
    managementEs: [
      'SUSPENSIÓN INMEDIATA Y PERMANENTE DEL FÁRMACO CAUSAL: Suspender de inmediato Lamotrigina, Carbamazepina, TMP-SMX o AINEs.',
      'Traslado a Unidad de Quemados / UCI: Reposición hidroelectrolítica, ambiente térmico cálido (30–32 °C) y apósitos no adherentes (conservar el techo de las ampollas intactas como apósito biológico). No dar antibióticos sistémicos profilácticos.',
      'Interconsulta STAT a Oftalmología en < 24 Horas: Lubricación sin conservadores, corticoides tópicos y trasplante temprano de membrana amniótica para prevenir simbléfaron y ceguera.',
      'Inmunomodulación Especializada: Ciclosporina (3–5 mg/kg/día) o Etanercept (inhibidor TNF-alfa) según protocolo de Unidad de Quemados.'
    ],
    harmReductionEn:
      'When restarting Lamotrigine after a treatment interruption of > 5 half-lives (> 5 days), NEVER resume at the prior maintenance dose—always restart from Week 1 starter doses (25 mg every other day if on Valproate; 25 mg daily if not on Valproate) to prevent SJS/TEN!',
    harmReductionEs:
      'Si un paciente suspende la Lamotrigina por > 5 días, NUNCA reiniciar a la dosis de mantenimiento previa: siempre reiniciar desde la dosis de la Semana 1 (25 mg cada tercer día si toma Valproato) para prevenir SSJ/NET.'
  }),

  dress_syndrome: Object.freeze({
    id: 'dress_syndrome',
    urgency: 'EMERGENCY',
    badgeEn: 'FACIAL EDEMA + EOSINOPHILIA + VISCERAL HEPATITIS/MYOCARDITIS',
    badgeEs: 'EDEMA FACIAL + EOSINOFILIA + HEPATITIS/MIOCARDITIS VISCERAL',
    titleEn: 'DRESS Syndrome (Drug Reaction with Eosinophilia & Systemic Symptoms — Vancomycin & Anticonvulsants)',
    titleEs: 'Síndrome DRESS (Reacción a Fármacos con Eosinofilia y Síntomas Sistémicos — Vancomicina y Anticonvulsivos)',
    summaryEn:
      'Severe, delayed T-cell hypersensitivity reaction occurring 2 to 8 weeks after starting a culprit medication—most commonly IV Vancomycin (during prolonged treatment for endocarditis or osteomyelitis in PWID; strongly linked to HLA-A*32:01), Carbamazepine, Lamotrigine, Phenytoin, Allopurinol, or TMP-SMX.',
    summaryEs:
      'Reacción de hipersensibilidad tardía grave que aparece 2 a 8 semanas después de iniciar el fármaco causal, principalmente Vancomicina IV (durante el tratamiento prolongado de endocarditis u osteomielitis en PID; asociada a HLA-A*32:01), Carbamazepina, Lamotrigina, Fenitoína o TMP-SMX.',
    pathophysiologyEn:
      'Drug-specific CD4+/CD8+ T-cell activation drives massive IL-5 release (causing marked peripheral eosinophilia and organ infiltration) paired with sequential reactivation of latent human herpesviruses (HHV-6, HHV-7, EBV, CMV), leading to fulminant hepatitis, interstitial nephritis, hypersensitivity myocarditis, and pneumonitis (10% mortality).',
    pathophysiologyEs:
      'La activación de linfocitos T libera IL-5 (causando eosinofilia marcada e infiltración visceral) junto con reactivación secuencial de herpesvirus latentes (VHH-6, VHH-7, VEB, CMV), provocando hepatitis fulminante, nefritis intersticial y miocarditis (mortalidad 10%).',
    diagnosticsEn: [
      'Clinical RegiSCAR Triad (2–8 Weeks into Therapy): (1) High fever (38.5–40°C) and diffuse lymphadenopathy; (2) Confluent morbilliform eruption (> 50% BSA) with hallmark SYMMETRIC FACIAL & PERIORBITAL EDEMA; (3) Multi-organ visceral involvement.',
      'Hematologic & Visceral Lab Panel: Marked peripheral eosinophilia (> 700–1,500/mcL or > 10%), atypical lymphocytes on blood smear, AST/ALT/AlkPhos/Bilirubin (liver is the #1 target organ in > 70% of cases!), serum creatinine/UA (sterile pyuria/eosinophiluria — especially with Vancomycin!), and Troponin + ECG/Echo (to rule out fatal eosinophilic myocarditis).',
      'Viral Reactivation & Pharmacogenomics: HHV-6 PCR and HLA-A*32:01 typing (for Vancomycin DRESS).'
    ],
    diagnosticsEs: [
      'Tríada Clínica RegiSCAR (2–8 Semanas de Tratamiento): (1) Fiebre alta (38.5–40 °C) y linfadenopatía; (2) Exantema morbiliforme (> 50% SCT) con EDEMA FACIAL Y PERIORBITARIO SIMÉTRICO característico; (3) Daño visceral multiorgánico.',
      'Panel Hematológico y Visceral: Eosinofilia periférica marcada (> 700–1,500/mcL), linfocitos atípicos, AST/ALT/bilirrubina (el hígado es el órgano #1 afectado en > 70%), creatinina/uroanálisis (nefritis intersticial por Vancomicina) y Troponina + ECG (descartar miocarditis eosinofílica mortal).',
      'Reactivación Viral: PCR para VHH-6 y tipificación HLA-A*32:01 (en DRESS por Vancomicina).'
    ],
    managementEn: [
      'IMMEDIATE CESSATION OF CULPRIT MEDICATION: If Vancomycin is the culprit during endocarditis/osteomyelitis treatment, switch immediately to a structurally unrelated agent such as Linezolid or Daptomycin (avoid teicoplanin/dalbavancin cross-reactivity if severe glycopeptide DRESS is present). If an aromatic anticonvulsant (carbamazepine/phenytoin/lamotrigine) is the culprit, switch to Levetiracetam or Valproate—never switch to another aromatic anticonvulsant (> 70% cross-reactivity!).',
      'Prolonged Systemic Corticosteroid Taper (6–12 Weeks): Initiate IV Methylprednisolone (1–2 mg/kg/day) or oral Prednisone (1 mg/kg/day). CRITICAL TAPER RULE: Taper corticosteroids slowly over 6 to 12 weeks—rapid 5-to-7 day steroid tapers trigger catastrophic rebound hepatitis and myocarditis flares driven by HHV-6 reactivation!',
      'Monitor for Late Autoimmune Sequelae: Screen thyroid function (TSH, free T4) for 3–12 months post-recovery (autoimmune thyroiditis/Graves disease and type 1 diabetes are well-documented late sequelae of DRESS).'
    ],
    managementEs: [
      'SUSPENSIÓN INMEDIATA DEL FÁRMACO CAUSAL: Si la Vancomicina es la causa durante el tratamiento de endocarditis/osteomielitis, cambiar a Linezolid o Daptomicina. Si el causante es un anticonvulsivo aromático (carbamazepina/fenitoína/lamotrigina), cambiar a Levetiracetam (nunca a otro anticonvulsivo aromático por > 70% de reactividad cruzada).',
      'Esquema Prolongado de Corticoides Sistémicos (6–12 Semanas): Iniciar Metilprednisolona IV (1–2 mg/kg/día) o Prednisona oral (1 mg/kg/día). REGLA CRÍTICA DE DESCENSO: Reducir los corticoides lentamente durante 6 a 12 semanas; los esquemas cortos de 5–7 días provocan recaídas fulminantes de hepatitis y miocarditis.',
      'Vigilancia de Secuelas Autoinmunes Tardías: Controlar TSH y T4 libre durante 3–12 meses tras el alta (tiroiditis autoinmune post-DRESS).'
    ],
    harmReductionEn:
      'Counsel patients receiving multi-week outpatient IV antibiotics (OPAT with vancomycin or beta-lactams) or starting lamotrigine/carbamazepine that any new rash accompanied by facial swelling or fever 2–8 weeks into therapy requires immediate emergency evaluation.',
    harmReductionEs:
      'Advertir a todo paciente con antibióticos IV prolongados (vancomicina) o que inicia lamotrigina/carbamazepina que cualquier exantema acompañado de hinchazón facial o fiebre entre las semanas 2 y 8 exige acudir a urgencias de inmediato.'
  }),

  cutaneous_anthrax_botulism_skinpop: Object.freeze({
    id: 'cutaneous_anthrax_botulism_skinpop',
    urgency: 'EMERGENCY',
    badgeEn: 'SPORE-FORMING TOXIN ALERT — ANTHRAX ESCHAR (NO I&D) & BOTULISM HBAT',
    badgeEs: 'ALERTA DE TOXINAS ESPORULADAS — ESCARA DE ÁNTRAX (NO INCIDIR) Y ANTITOXINA BOTULÍNICA',
    titleEn: 'Cutaneous/Injectional Anthrax, Wound Botulism & "Puffy Hand" Lymphedema in Skin-Popping',
    titleEs: 'Ántrax Cutáneo/Inyeccional, Botulismo por Herida y Linfedema ("Mano Hinchada") por Skin-Popping',
    summaryEn:
      'Distinct, high-consequence syndromes associated with subcutaneous ("skin-popping") or intramuscular injection of black tar heroin or soil-spore-contaminated heroin: (1) Cutaneous/Injectional Bacillus anthracis, (2) Clostridium botulinum wound botulism, and (3) Chronic lymphatic destruction ("Puffy Hand Syndrome").',
    summaryEs:
      'Síndromes de alta gravedad asociados a la inyección subcutánea ("skin-popping") o intramuscular de heroína "black tar" o contaminada con esporas: (1) Ántrax cutáneo/inyeccional (Bacillus anthracis), (2) Botulismo por herida (Clostridium botulinum) y (3) Linfedema crónico ("Síndrome de la Mano Hinchada").',
    pathophysiologyEn:
      'Soil-derived bacterial spores survive heating in heroin cookers: (1) Bacillus anthracis secretes Edema Toxin and Lethal Toxin, producing a PAINLESS black necrotic eschar surrounded by massive non-pitting gelatinous edema; (2) Clostridium botulinum germinates in anaerobic subcutaneous skin-popping craters and secretes botulinum neurotoxin (cleaving SNARE proteins at presynaptic neuromuscular junctions), causing descending symmetric flaccid paralysis; (3) Chronic particulate/quinine injection obliterates superficial lymphatics, causing irreversible dorsal hand lymphedema ("Puffy Hand Syndrome").',
    pathophysiologyEs:
      'Las esporas bacterianas resisten el calentamiento en la cuchara: (1) Bacillus anthracis secreta Toxina de Edema y Toxina Letal, produciendo una escara negra INDOLORA con edema gelatinoso masivo sin fóvea; (2) Clostridium botulinum germina en abscesos anaerobios subcutáneos y bloquea la liberación presináptica de acetilcolina, causando parálisis flácida simétrica descendente; (3) La destrucción linfática crónica produce el "Síndrome de la Mano Hinchada".',
    diagnosticsEn: [
      'Cutaneous / Injectional Anthrax Clues: Pruritic papule/vesicle rapidly evolving into a PAINLESS depressed black eschar with disproportionate, massive brawny non-pitting edema, hemoconcentration, and gram-positive "boxcar" bacilli in chains.',
      'Wound Botulism Clues ("The 4 Ds" with Clear Sensorium & No Fever): Diplopia/blurred vision, Dysarthria, Dysphagia, and Descending symmetric flaccid paralysis (ptosis, dilated/sluggish pupils, neck weakness, and diaphragmatic respiratory failure) with NORMAL sensation and an alert mental status.',
      'Serial Bedside Spirometry for Suspect Botulism: Measure Negative Inspiratory Force (NIF / MIP) and Forced Vital Capacity (FVC)—intubate electively if NIF drops weaker than -20 to -30 cmH2O or FVC falls < 15–20 mL/kg!'
    ],
    diagnosticsEs: [
      'Claves de Ántrax Cutáneo / Inyeccional: Pápula/vesícula que evoluciona a escara negra deprimida INDOLORA rodeada de edema gelatinoso masivo sin fóvea y bacilos Gram-positivos en "vagón de tren".',
      'Claves de Botulismo por Herida ("Las 4 D" con Sensorio Lúcido y Sin Fiebre): Diplopía, Disartria, Disfagia y Debilidad/parálisis flácida simétrica Descendente (ptosis, midriasis, debilidad cervical e insuficiencia respiratoria) con sensibilidad NORMAL.',
      'Espirometría Seriada en Botulismo: Medir Fuerza Inspiratoria Negativa (NIF) y Capacidad Vital Forzada (CVF); intubar si NIF < -20 a -30 cmH2O o CVF < 15–20 mL/kg.'
    ],
    managementEn: [
      'CUTANEOUS ANTHRAX NO-INCISION RULE: Do NOT perform bedside incision and drainage (I&D) on a painless classic cutaneous anthrax eschar—incising a cutaneous anthrax lesion does not yield pus and precipitates dissemination/bacteremia! (Surgical exploration is reserved only for deep injectional compartment syndrome/necrotizing fasciitis). Treat systemic/injectional anthrax with IV Ciprofloxacin + IV Meropenem + a protein-synthesis inhibitor (Linezolid or Clindamycin) + Anthrax Antitoxin (Raxibacumab/Obiltoxaximab).',
      'WOUND BOTULISM IMMEDIATE ANTITOXIN RULE: Do NOT wait for mouse bioassay/toxin confirmation (which takes days)—contact Public Health / CDC immediately to administer Equine Heptavalent Botulinum Antitoxin (HBAT) as soon as clinical descending cranial nerve palsies are recognized, followed by surgical debridement of the anaerobic wound and IV Penicillin G or Metronidazole (NEVER give aminoglycosides, which potentiate neuromuscular blockade!).',
      'Puffy Hand Syndrome Management: Recognize chronic bilateral painless dorsal hand edema with loss of extensor tendon landmarks as lymphatic destruction (once DVT/cellulitis are excluded); treat with low-stretch compression gloves and elevation.'
    ],
    managementEs: [
      'REGLA DE NO INCIDIR ESCARA DE ÁNTRAX CUTÁNEO: NO realizar incisión y drenaje en una escara clásica indolora de ántrax cutáneo (no drena pus y precipita bacteriemia/toxemia). Tratar con Ciprofloxacino IV + Meropenem IV + Linezolid/Clindamicina + Antitoxina.',
      'REGLA DE ANTITOXINA BOTULÍNICA INMEDIATA: NO esperar confirmación de laboratorio; administrar Antitoxina Botulínica Heptavalente Equina (HBAT) ante parálisis craneal descendente clínica, desbridar la herida anaerobia y dar Penicilina G o Metronidazol IV (¡NUNCA dar aminoglucósidos porque empeoran el bloqueo neuromuscular!).',
      'Manejo del Síndrome de la Mano Hinchada: Una vez descartada TVP o celulitis aguda, manejar el linfedema crónico dorsal con prendas de compresión y elevación.'
    ],
    harmReductionEn:
      'Warn individuals who "skin-pop" black tar heroin that heating heroin in a cooker does NOT kill bacterial spores (Clostridium botulinum, C. tetani, Bacillus anthracis); ensure Tdap vaccination is up to date and counsel on early warning signs of double vision or slurred speech.',
    harmReductionEs:
      'Advertir a quienes realizan "skin-popping" con heroína que hervir la solución en la cuchara NO destruye las esporas bacterianas (botulismo, tétanos, ántrax); actualizar vacuna Tdap y vigilar visión doble o dificultad para tragar.'
  }),

  nicolau_syndrome: Object.freeze({
    id: 'nicolau_syndrome',
    urgency: 'EMERGENCY',
    badgeEn: 'EMBOLIA CUTIS MEDICAMENTOSA — VASODILATION + ANTICOAGULATION',
    badgeEs: 'EMBOLIA CUTIS MEDICAMENTOSA — VASODILATACIÓN + ANTICOAGULACIÓN',
    titleEn: 'Nicolau Syndrome (Embolia Cutis Medicamentosa) & Depot/IM Injection Arterial Necrosis',
    titleEs: 'Síndrome de Nicolau (Embolia Cutis Medicamentosa) y Necrosis Arterial por Inyección IM/Subcutánea',
    summaryEn:
      'Acute, intensely painful iatrogenic or self-injection vascular necrosis following intramuscular or subcutaneous administration of viscous/particulate medications (Extended-Release Depot Buprenorphine, XR-Naltrexone [Vivitrol], Haloperidol/Paliperidone decanoate, Benzathine Penicillin, Ketorolac/Diclofenac, or crushed tablets).',
    summaryEs:
      'Necrosis vascular aguda e intensamente dolorosa tras la inyección intramuscular o subcutánea de medicamentos viscosos o particulados (Buprenorfina de depósito XR, Naltrexona XR [Vivitrol], decanoato de Haloperidol, Penicilina benzatínica, Diclofenaco/Ketorolaco o comprimidos triturados).',
    pathophysiologyEn:
      'Inadvertent intra-arterial, peri-arterial, or perineural injection triggers acute sympathetic vasospasm, endothelial inflammation, and microcrystalline embolization of terminal cutaneous and muscular branches of the superior/inferior gluteal, lateral circumflex femoral, or deltoid arteries. This produces immediate blanching, livedoid reticular purpura, and deep full-thickness tissue necrosis.',
    pathophysiologyEs:
      'La inyección intraarterial o periarterial accidental desencadena vasoespasmo simpático agudo, inflamación endotelial y embolización microcristalina de ramas cutáneas y musculares terminales, produciendo palidez inmediata, placa livedoide reticular violácea y necrosis tisular profunda.',
    diagnosticsEn: [
      'Classic 3-Phase Clinical Evolution: (1) Immediate Phase: Excruciating burning/stabbing pain right at the moment of injection with localized skin blanching (pallor); (2) Acute Phase (Hours to Days): Well-demarcated livedoid, reticular violaceous/hemorrhagic plaque; (3) Necrotic Phase (Days 5–14): Deep black eschar and ulceration extending into subcutaneous fat and muscle.',
      'Differentiate from Acute Bacterial Cellulitis / Necrotizing Fasciitis: Nicolau syndrome begins instantaneously at the moment of injection (whereas bacterial abscess/cellulitis develops 24–72+ hours later), though secondary infection and rhabdomyolysis (check CK!) can supervene.',
      'Duplex Doppler Ultrasound & MRI: Assess depth of muscle necrosis and exclude drainable hematoma/abscess.'
    ],
    diagnosticsEs: [
      'Evolución Clínica en 3 Fases: (1) Fase Inmediata: Dolor urente/punzante insoportable en el instante mismo de la inyección con palidez circunscrita; (2) Fase Aguda (Horas a Días): Placa violácea reticular livedoide bien delimitada; (3) Fase Necrótica (Días 5–14): Escara negra profunda que compromete tejido subcutáneo y músculo.',
      'Diferenciar de Celulitis Bacteriana: El síndrome de Nicolau inicia en el segundo exacto de la inyección (mientras que el absceso bacteriano tarda 24–72+ horas), aunque puede complicarse con rabdomiólisis (medir CK).',
      'Ecografía Doppler y RM: Evaluar extensión muscular y descartar colección drenable.'
    ],
    managementEn: [
      'IMMEDIATE INJECTION CESSATION: Stop depressing the plunger the instant severe burning pain or skin blanching occurs.',
      'Acute Microvascular Salvage Protocol (First 24–72 Hours): Apply gentle local warmth to promote vasodilation (NEVER apply ice or cold packs, which worsen arterial vasospasm!), topical Nitroglycerin 2% ointment, oral Pentoxifylline (400 mg PO TID for hemorrheologic flow), Nifedipine/Iloprost, and systemic Anticoagulation (Enoxaparin / Heparin) + Systemic Corticosteroids to halt arterial thrombosis and endothelial inflammation.',
      'Hyperbaric Oxygen Therapy (HBOT) & Delayed Conservative Debridement: Early HBOT improves borderline tissue oxygenation; defer surgical debridement until necrotic margins clearly demarcate unless secondary sepsis or compartment syndrome develops.'
    ],
    managementEs: [
      'SUSPENSIÓN INMEDIATA DE LA INYECCIÓN: Detener la inyección en el instante en que aparezca dolor urente intenso o palidez cutánea.',
      'Protocolo de Rescate Microvascular Agudo (Primeras 24–72 Horas): Calor local suave (¡NUNCA aplicar hielo, ya que agrava el vasoespasmo arterial!), ungüento de Nitroglicerina tópica al 2%, Pentoxifilina oral (400 mg VO c/8h), Anticoagulación con Heparina/Enoxaparina y Corticoides sistémicos.',
      'Oxigenoterapia Hiperbárica y Desbridamiento Diferido: Esperar demarcación clara de bordes antes de desbridar, salvo infección secundaria o síndrome compartimental.'
    ],
    harmReductionEn:
      'When administering depot injections (XR-Naltrexone requires deep gluteal IM with the provided 1.5–2 inch needle; XR-Buprenorphine [Sublocade] MUST ONLY be injected subcutaneously in the abdomen—never IV or IM!), always aspirate prior to injection and verify exact anatomical plane.',
    harmReductionEs:
      'Al administrar inyecciones de depósito (Naltrexona XR requiere vía IM glútea profunda; Buprenorfina XR [Sublocade] SOLO debe inyectarse vía subcutánea abdominal, ¡nunca IV ni IM!), aspirar siempre antes de inyectar.'
  }),

  stimulant_formication_excoriation: Object.freeze({
    id: 'stimulant_formication_excoriation',
    urgency: 'ROUTINE',
    badgeEn: 'HYDROCOLLOID OCCLUSIVE HEALING + TRAUMA-INFORMED CARE',
    badgeEs: 'APÓSITOS HIDROCOLOIDES OCLUSIVOS + ATENCIÓN INFORMADA EN TRAUMA',
    titleEn: 'Stimulant Formication ("Meth Mites"), Neurotic Excoriations & Ecthyma',
    titleEs: 'Formicación por Estimulantes, Excoriaciones Neuróticas y Ectima Secundario',
    summaryEn:
      'Tactile hallucinations of subcutaneous insects or fibers crawling under the skin (formication / secondary Ekbom syndrome) triggered by methamphetamine, cocaine, or high-dose bupropion/amphetamines, leading to deep linear or geometric excoriations and secondary Staphylococcus/Streptococcus ecthyma.',
    summaryEs:
      'Alucinaciones táctiles de insectos o fibras bajo la piel (formicación / síndrome de Ekbom secundario) inducidas por metanfetamina, cocaína o anfetaminas, que provocan excoriaciones profundas y ectima bacteriano secundario por Staphylococcus/Streptococcus.',
    pathophysiologyEn:
      'Excess striatal dopamine, cutaneous vasoconstriction, peripheral small-fiber neuropathy, sweat-salt crystal deposition, and multi-day sleep deprivation hyper-sensitize cutaneous mechanoreceptors and C-fibers, generating an overwhelming physical sensation of crawling/biting ("meth mites") paired with compulsive skin picking using fingernails or tweezers.',
    pathophysiologyEs:
      'El exceso de dopamina estriatal, la vasoconstricción cutánea, la neuropatía de fibras pequeñas y la privación de sueño hipersensibilizan los mecanorreceptores cutáneos, generando una sensación física real e intensa de insectos bajo la piel acompañada de rascado compulsivo.',
    diagnosticsEn: [
      'Cutaneous Exam: Angulated, geometric, or linear crusted ulcerations concentrated on reachable areas (face, forearms, anterior shins, upper chest) with sparing of the mid-upper back ("butterfly sign" of unreachable skin), often complicated by honey-crusted impetigo or punched-out purulent ecthyma.',
      'Rule Out True Primary Pruritic & Infectious Causes First: Always examine finger webs/wrists for Scabies (Sarcoptes scabiei), inspect clothing seams for Pediculosis corporis (body lice), and check CBC, liver enzymes (cholestasis), and renal/thyroid function—never dismiss a patient as "just delusional" without a real skin exam!'
    ],
    diagnosticsEs: [
      'Examen Cutáneo: Úlceras costrosas geométricas o lineales en zonas alcanzables (rostro, antebrazos, piernas) respetando la zona media de la espalda alta ("signo de la mariposa"), frecuentemente complicadas con impétigo melicérico o ectima.',
      'Descartar Causas Infecciosas Reales Primero: Examinar espacios interdigitales para Escabiosis (sarna), costuras de ropa para Pediculosis corporis (piojos del cuerpo) y perfil hepático/renal; nunca descartar al paciente sin un examen físico completo.'
    ],
    managementEn: [
      'TRAUMA-INFORMED COMMUNICATION RULE: Validate that the itching, stinging, and crawling sensations are physically real neurosensory signals caused by nerve irritation and dry skin, rather than arguing aggressively over whether bugs exist.',
      'Hydrocolloid Occlusive Barrier Therapy: Apply thin Hydrocolloid Dressings (DuoDERM / acne hydrocolloid patches) over active facial and limb excoriations—hydrocolloid patches provide a smooth physical barrier that blocks fingernails/tweezers from picking while maintaining a moist healing environment that minimizes scarring!',
      'Treat Secondary Bacterial Ecthyma / Impetigo: Topical Mupirocin 2% ointment TID for localized lesions, or oral Cephalexin / TMP-SMX / Doxycycline for widespread crusted ecthyma and MRSA.',
      'Neurosensory & Sleep Restoration: Cool emollient creams (Pramoxine 1% or Menthol/Camphor lotion), non-sedating or nighttime antihistamines (Hydroxyzine 25–50 mg or Cetirizine), sleep restoration, and low-dose atypical antipsychotic support (Olanzapine 2.5–5 mg or Risperidone 0.5–1 mg) if severe distressing formication persists.'
    ],
    managementEs: [
      'REGLA DE COMUNICACIÓN INFORMADA EN TRAUMA: Validar que las sensaciones de picazón y hormigueo son señales neurosensoriales físicas reales por irritación nerviosa y sequedad cutánea, evitando confrontaciones humillantes.',
      'Terapia Oclusiva con Parches Hidrocoloides: Colocar apósitos o parches Hidrocoloides (DuoDERM) sobre las excoriaciones activas; crean una barrera física suave que impide el rascado con uñas/pinzas y acelera la epitelización sin cicatriz.',
      'Tratar Ectima / Impétigo Secundario: Mupirocina tópica al 2% c/8h en lesiones localizadas, o Cefalexina / Doxiciclina / TMP-SMX oral si hay ectima extenso o celulitis.',
      'Restauración Neurosensorial y del Sueño: Emolientes con Pramoxina al 1% o mentol, Hidroxizina nocturna, restauración del sueño y Olanzapina en dosis bajas (2.5–5 mg) si persiste formicación angustiante.'
    ],
    harmReductionEn:
      'Offer practical skin-protection strategies during stimulant use: keeping fingernails trimmed short, applying fragrance-free ceramide moisturizer and hydrocolloid patches before picking starts, hydrating, and resting eyes/brain in a dark room.',
    harmReductionEs:
      'Ofrecer estrategias prácticas de protección cutánea: mantener las uñas cortas, aplicar crema hidratante con ceramidas y parches hidrocoloides sobre lesiones, hidratarse y descansar.'
  })
});

export const DERMATOLOGY_HARM_REDUCTION_RULES = Object.freeze([
  Object.freeze({
    id: 'xylazine_tendon_eschar_preservation_rule',
    titleEn: 'The Xylazine Eschar & Exposed Tendon Preservation Rule',
    titleEs: 'Regla de Preservación de Escaras y Tendones en Úlceras por Xilacina',
    bodyEn:
      'Never perform aggressive sharp debridement of stable dry xylazine eschar that would strip periosteum or leave bare avascular tendon exposed to air. Use sterile saline/hypochlorous acid, enzymatic collagenase or medical-grade honey, and Xeroform/silicone dressings; reserve urgent surgical debridement for wet gangrene or sepsis.',
    bodyEs:
      'Nunca realizar desbridamiento cortante agresivo de escaras secas estables por xilacina si esto deja tendón o hueso desnudo expuesto al aire. Usar solución salina/ácido hipocloroso, colagenasa o miel médica y apósitos Xeroform/silicona; reservar cirugía urgente para gangrena húmeda o sepsis.'
  }),
  Object.freeze({
    id: 'lamotrigine_valproate_sjs_ten_rule',
    titleEn: 'The Lamotrigine-Valproate SJS/TEN Rule & 5-Day Restart Rule',
    titleEs: 'Regla de Lamotrigina-Valproato en SSJ/NET y Reinicio tras > 5 Días',
    bodyEn:
      'Valproate doubles Lamotrigine levels and dramatically increases Stevens-Johnson Syndrome / TEN risk. If Lamotrigine is interrupted for > 5 days, always restart at Week 1 starter doses—and stop immediately if any painful rash, blister, or oral/ocular mucositis appears.',
    bodyEs:
      'El valproato duplica los niveles de lamotrigina y eleva el riesgo de SSJ/NET. Si la lamotrigina se suspende por > 5 días, reiniciar siempre con dosis de la Semana 1, y suspender de inmediato ante cualquier exantema doloroso o mucositis oral/ocular.'
  }),
  Object.freeze({
    id: 'vancomycin_dress_slow_steroid_taper_rule',
    titleEn: 'The Vancomycin DRESS Syndrome Facial Edema & 6–12 Week Steroid Taper Rule',
    titleEs: 'Regla de Edema Facial en DRESS por Vancomicina y Descenso Lento de Corticoides (6–12 Semanas)',
    bodyEn:
      'Morbilliform rash + facial edema + fever + eosinophilia occurring 2–8 weeks into IV Vancomycin or anticonvulsant therapy signals DRESS syndrome. Stop the culprit drug, check liver enzymes and troponin, and taper systemic corticosteroids slowly over 6–12 weeks to prevent rebound organ failure.',
    bodyEs:
      'Exantema morbiliforme + edema facial + fiebre + eosinofilia entre las semanas 2 y 8 de Vancomicina IV o anticonvulsivos indica síndrome DRESS. Suspender el fármaco, medir enzimas hepáticas y troponina, y reducir corticoides lentamente durante 6–12 semanas.'
  }),
  Object.freeze({
    id: 'anthrax_no_id_botulism_hbat_rule',
    titleEn: 'The Cutaneous Anthrax No-I&D Rule & Wound Botulism Immediate HBAT Rule',
    titleEs: 'Regla de No Incidir Escara de Ántrax Cutáneo y Antitoxina HBAT en Botulismo',
    bodyEn:
      'Never incise a painless black cutaneous anthrax eschar with massive gelatinous edema (causes bacteremia). In skin-popping patients with descending symmetric ptosis, diplopia, dysphagia, and dysarthria ("4 Ds"), administer Heptavalent Botulinum Antitoxin (HBAT) immediately without waiting for toxin assays.',
    bodyEs:
      'Nunca incidir una escara negra indolora de ántrax cutáneo con edema gelatinoso. En pacientes con "skin-popping" y ptosis, diplopía, disfagia y disartria ("4 D"), administrar Antitoxina Botulínica Heptavalente (HBAT) de inmediato sin esperar confirmación de laboratorio.'
  }),
  Object.freeze({
    id: 'no_peroxide_alcohol_hydrocolloid_rule',
    titleEn: 'The Zero-Peroxide/Alcohol Wound Rule & Hydrocolloid Barrier Rule',
    titleEs: 'Regla de Cero Agua Oxigenada/Alcohol y Parches Hidrocoloides Protectores',
    bodyEn:
      'Hydrogen peroxide, rubbing alcohol, and full-strength bleach destroy migrating keratinocytes and fibroblasts. Cleanse wounds only with sterile saline, potable water, or hypochlorous acid, and use hydrocolloid patches to protect stimulant excoriations from picking.',
    bodyEs:
      'El agua oxigenada, el alcohol y el cloro concentrado destruyen los fibroblastos y queratinocitos. Limpiar heridas solo con solución salina estéril o ácido hipocloroso, y usar parches hidrocoloides para proteger excoriaciones.'
  })
]);

const DEFAULT_DERMATOLOGY_STATE = Object.freeze({
  selectedSyndrome: 'xylazine_necrotic_ulcers',
  blisteringNikolskyMucositisLamotrigineBactrim: false,
  facialEdemaEosinophiliaFeverVancomycin2to8Weeks: false,
  painlessBlackEscharGelatinousEdemaOrDescendingPtosis: false,
  instantBurningBlanchingLivedoidPlaqueAtInjection: false,
  xylazineNecroticEscharWithExposedTendonOrBone: false,
  stimulantFormicationPickingWithHoneyCrusting: false,
  clinicalNotes: ''
});

let dermatologyState = { ...DEFAULT_DERMATOLOGY_STATE };
const listeners = new Set();

export function getDermatologyState() {
  return { ...dermatologyState };
}

export function setDermatologyState(patch = {}) {
  dermatologyState = { ...dermatologyState, ...patch };
  for (const fn of listeners) {
    fn(getDermatologyState());
  }
  return getDermatologyState();
}

export function resetDermatologyState() {
  dermatologyState = { ...DEFAULT_DERMATOLOGY_STATE };
  for (const fn of listeners) {
    fn(getDermatologyState());
  }
  return getDermatologyState();
}

export function subscribeDermatologyState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function evaluateDermatologyRisk(state = dermatologyState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const profile =
    DERMATOLOGY_SYNDROME_PROFILES[state.selectedSyndrome] ||
    DERMATOLOGY_SYNDROME_PROFILES.xylazine_necrotic_ulcers;

  const redFlags = [];
  let urgency = profile.urgency;

  if (state.blisteringNikolskyMucositisLamotrigineBactrim) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE SÍNDROME DE STEVENS-JOHNSON / NET (Signo de Nikolsky + Mucositis): Suspender de inmediato Lamotrigina, Carbamazepina o TMP-SMX. Calcular SCORTEN, trasladar a Unidad de Quemados/UCI y solicitar Oftalmología STAT (< 24h) para prevenir ceguera corneal.'
        : 'STEVENS-JOHNSON SYNDROME / TEN ALERT (Nikolsky Sign + Mucositis): Stop Lamotrigine, Carbamazepine, or TMP-SMX immediately. Calculate SCORTEN, transfer to Burn ICU, and obtain STAT Ophthalmology consultation (< 24h) to prevent corneal blindness.'
    );
  }

  if (state.facialEdemaEosinophiliaFeverVancomycin2to8Weeks) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE SÍNDROME DRESS (Edema Facial + Eosinofilia + Fiebre a las 2–8 Semanas): Suspender Vancomicina (cambiar a Linezolid/Daptomicina) o anticonvulsivo aromático. Solicitar perfil hepático, creatinina y troponina, e iniciar Prednisona 1 mg/kg/día con descenso lento de 6–12 semanas.'
        : 'DRESS SYNDROME ALERT (Facial Edema + Eosinophilia + Fever at 2–8 Weeks): Stop Vancomycin (switch to Linezolid/Daptomycin) or aromatic anticonvulsant. Check liver panel, creatinine, and troponin, and start Prednisone 1 mg/kg/day with a slow 6–12 week taper.'
    );
  }

  if (state.painlessBlackEscharGelatinousEdemaOrDescendingPtosis) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE ÁNTRAX CUTÁNEO O BOTULISMO POR HERIDA ("Skin-Popping"): En escara negra indolora con edema gelatinoso masivo: NO incidir (riesgo de bacteriemia); iniciar Ciprofloxacino + Meropenem + Linezolid IV. En ptosis/diplopía/disfagia descendente ("4 D"): administrar Antitoxina Botulínica Heptavalente (HBAT) STAT y medir NIF/CVF.'
        : 'CUTANEOUS ANTHRAX OR WOUND BOTULISM ALERT ("Skin-Popping"): For painless black eschar with massive gelatinous edema: DO NOT incise (causes bacteremia); start IV Ciprofloxacin + Meropenem + Linezolid. For descending ptosis/diplopia/dysphagia ("4 Ds"): administer Heptavalent Botulinum Antitoxin (HBAT) STAT and monitor NIF/FVC.'
    );
  }

  if (state.instantBurningBlanchingLivedoidPlaqueAtInjection) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'SÍNDROME DE NICOLAU (Embolia Cutis Medicamentosa tras Inyección IM/SC): Detener inyección de inmediato. Aplicar calor suave (NUNCA hielo), Nitroglicerina tópica 2%, Pentoxifilina, Enoxaparina/Heparina y Corticoides sistémicos; medir CK.'
        : 'NICOLAU SYNDROME ALERT (Embolia Cutis Medicamentosa after IM/SC Injection): Stop injection immediately. Apply gentle warmth (NEVER ice), topical Nitroglycerin 2%, Pentoxifylline, Enoxaparin/Heparin, and systemic Corticosteroids; check serum CK.'
    );
  }

  if (state.xylazineNecroticEscharWithExposedTendonOrBone) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'ÚLCERA NECRÓTICA POR XILACINA CON TENDÓN/HUESO EXPUESTO: Evitar desbridamiento cortante agresivo de escara seca estable que deseque el tendón. Usar solución salina/ácido hipocloroso, colagenasa/miel médica y gasa Xeroform/Mepitel; descartar osteomielitis con RM y tratar abstinencia alfa-2 con Clonidina + TMO.'
        : 'XYLAZINE NECROTIC ULCER WITH EXPOSED TENDON/BONE: Avoid aggressive sharp debridement of stable dry eschar that would desiccate bare tendon. Use sterile saline/hypochlorous acid, collagenase/medical honey, and Xeroform/Mepitel dressings; rule out osteomyelitis via MRI and treat alpha-2 withdrawal with Clonidine + MOUD.'
    );
  }

  if (state.stimulantFormicationPickingWithHoneyCrusting) {
    if (urgency === 'ROUTINE') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'FORMICACIÓN Y ECTIMA SECUNDARIO POR ESTIMULANTES: Descartar escabiosis/pediculosis, aplicar parches Hidrocoloides oclusivos para proteger la piel del rascado y tratar el impétigo/ectima con Mupirocina tópica 2% o Cefalexina/Doxiciclina oral.'
        : 'STIMULANT FORMICATION & SECONDARY BACTERIAL ECTHYMA: Rule out scabies/lice, apply occlusive Hydrocolloid patches to protect skin from picking, and treat secondary impetigo/ecthyma with topical Mupirocin 2% or oral Cephalexin/Doxycycline.'
    );
  }

  return {
    syndromeId: profile.id,
    urgency,
    title: isEs ? profile.titleEs : profile.titleEn,
    badge: isEs ? profile.badgeEs : profile.badgeEn,
    summary: isEs ? profile.summaryEs : profile.summaryEn,
    pathophysiology: isEs ? profile.pathophysiologyEs : profile.pathophysiologyEn,
    diagnostics: isEs ? profile.diagnosticsEs : profile.diagnosticsEn,
    management: isEs ? profile.managementEs : profile.managementEn,
    harmReduction: isEs ? profile.harmReductionEs : profile.harmReductionEn,
    redFlags
  };
}

export function formatDermatologySbarText(state = dermatologyState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const evalResult = evaluateDermatologyRisk(state, lang);

  const lines = [];
  lines.push(
    isEs
      ? '=== ENTREGA CLÍNICA SBAR: DERMATOLOGÍA, ESCARAS POR XILACINA, SSJ/NET Y DRESS (CERO-PII) ==='
      : '=== SBAR CLINICAL HANDOFF: DERMATOLOGY, XYLAZINE ESCHAR, SJS/TEN & DRESS (ZERO-PII) ==='
  );
  lines.push(
    `${isEs ? 'SITUACIÓN (Síndrome Primario)' : 'SITUATION (Primary Syndrome)'}: ${evalResult.title} [${evalResult.urgency}]`
  );
  lines.push(`${isEs ? 'Prioridad Clínica' : 'Clinical Priority'}: ${evalResult.badge}`);
  lines.push('');
  lines.push(isEs ? 'ANTECEDENTES Y FISIOPATOLOGÍA:' : 'BACKGROUND & PATHOPHYSIOLOGY:');
  lines.push(`- ${evalResult.summary}`);
  lines.push(`- ${evalResult.pathophysiology}`);

  if (evalResult.redFlags.length > 0) {
    lines.push('');
    lines.push(
      isEs
        ? 'ALERTAS ROJAS DERMATOLÓGICAS Y CUTÁNEAS ACTIVAS:'
        : 'ACTIVE DERMATOLOGIC & CUTANEOUS RED-FLAG ALERTS:'
    );
    for (const rf of evalResult.redFlags) {
      lines.push(`  [!] ${rf}`);
    }
  }

  lines.push('');
  lines.push(
    isEs
      ? 'EVALUACIÓN Y DIAGNÓSTICO REQUERIDO:'
      : 'ASSESSMENT & DIAGNOSTIC WORKUP:'
  );
  for (const d of evalResult.diagnostics) {
    lines.push(`  * ${d}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'RECOMENDACIÓN Y PROTOCOLO DE MANEJO CUTÁNEO:'
      : 'RECOMMENDATION & CUTANEOUS MANAGEMENT PROTOCOL:'
  );
  for (const m of evalResult.management) {
    lines.push(`  * ${m}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'REDUCCIÓN DE DAÑOS Y CUIDADO DE HERIDAS:'
      : 'HARM REDUCTION & WOUND PRESERVATION:'
  );
  lines.push(`  * ${evalResult.harmReduction}`);

  if (state.clinicalNotes && state.clinicalNotes.trim()) {
    lines.push('');
    lines.push(
      `${isEs ? 'NOTAS CLÍNICAS EFÍMERAS (EN RAM)' : 'EPHEMERAL CLINICAL NOTES (IN-RAM)'}: ${state.clinicalNotes.trim()}`
    );
  }

  return lines.join('\n');
}

export function dermatologyCareView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const root = el('section', {
    className: 'view-section dermatology-care-view',
    attrs: {
      'aria-labelledby': 'dermatology-care-heading',
      'data-view': 'dermatology-care'
    }
  });

  const header = el('header', { className: 'view-header dermatology-header' });
  const kicker = el(
    'span',
    { className: 'section-kicker' },
    t(
      'dermatology.kicker',
      isEs
        ? 'Dermatología de Urgencia, Úlceras por Xilacina, SSJ/NET y Síndrome DRESS'
        : 'Emergency Dermatology, Xylazine Necrotic Ulcers, SJS/TEN & DRESS Syndrome'
    )
  );
  const title = el(
    'h1',
    { id: 'dermatology-care-heading', className: 'view-title' },
    t(
      'dermatology.title',
      isEs
        ? 'Navegador de Dermatología, Escaras por Xilacina, Stevens-Johnson (SSJ/NET), DRESS y Necrosis Cutánea'
        : 'Dermatology, Xylazine Necrotic Eschar, Stevens-Johnson (SJS/TEN), DRESS & Cutaneous Necrosis Navigator'
    )
  );
  const subtitle = el(
    'p',
    { className: 'view-subtitle' },
    t(
      'dermatology.subtitle',
      isEs
        ? 'Soporte clínico cero-PII en memoria RAM para preservación de tendones en úlceras por xilacina ("tranq"), síndrome de Stevens-Johnson/NET por lamotrigina/anticonvulsivos, síndrome DRESS por vancomicina, ántrax cutáneo y botulismo por "skin-popping", síndrome de Nicolau y formicación por estimulantes.'
        : 'Zero-PII, in-RAM clinical decision support for tendon-sparing xylazine ("tranq") ulcer management, lamotrigine/anticonvulsant Stevens-Johnson syndrome (SJS/TEN), vancomycin DRESS syndrome, skin-popping cutaneous anthrax and wound botulism, Nicolau syndrome, and stimulant formication.'
    )
  );
  header.append(kicker, title, subtitle);
  root.appendChild(header);

  const safetyBanner = el('div', {
    className: 'clinical-alert-banner dermatology-safety-banner',
    attrs: { role: 'region', 'aria-label': isEs ? 'Seguridad Dermatológica Crítica' : 'Critical Dermatologic Safety' }
  });
  safetyBanner.append(
    el(
      'strong',
      {},
      isEs
        ? 'Reglas Cardinales en Dermatología y Heridas: '
        : 'Cardinal Dermatology & Wound Survival Rules: '
    ),
    el(
      'span',
      {},
      isEs
        ? '(1) En escaras secas estables por xilacina sobre tendón/hueso, evitar el desbridamiento quirúrgico cortante agresivo (usar colagenasa/miel médica y Xeroform); (2) En signo de Nikolsky positivo o mucositis (SSJ/NET), suspender lamotrigina/anticonvulsivo/TMP-SMX y trasladar a Unidad de Quemados; (3) En síndrome DRESS por vancomicina, reducir corticoides lentamente durante 6–12 semanas.'
        : '(1) In stable dry xylazine eschar over tendon/bone, avoid aggressive sharp surgical debridement (use collagenase/medical honey and Xeroform); (2) In positive Nikolsky sign or mucositis (SJS/TEN), stop lamotrigine/anticonvulsant/TMP-SMX immediately and transfer to Burn ICU; (3) In vancomycin DRESS syndrome, taper systemic steroids slowly over 6–12 weeks.'
    )
  );
  root.appendChild(safetyBanner);

  const selectorSection = el('section', {
    className: 'dermatology-selector-section card',
    attrs: { 'aria-labelledby': 'dermatology-selector-heading' }
  });
  selectorSection.appendChild(
    el(
      'h2',
      { id: 'dermatology-selector-heading', className: 'card-title' },
      t(
        'dermatology.selectorTitle',
        isEs
          ? '1. Seleccione el Síndrome Dermatológico o de Necrosis Cutánea'
          : '1. Select Primary Dermatologic or Cutaneous Necrosis Syndrome'
      )
    )
  );

  const syndromeGrid = el('div', {
    className: 'dermatology-syndrome-grid',
    attrs: { role: 'group', 'aria-label': isEs ? 'Selector de síndrome dermatológico' : 'Dermatology syndrome selector' }
  });

  const detailContainer = el('div', {
    className: 'dermatology-detail-container',
    attrs: { 'aria-live': 'polite' }
  });

  const sbarPre = el('pre', {
    className: 'sbar-output-pre dermatology-sbar-pre',
    attrs: { tabindex: '0', 'aria-label': isEs ? 'Entrega clínica SBAR de dermatología' : 'Dermatology SBAR clinical handoff' }
  });

  function renderSyndromeButtons() {
    clear(syndromeGrid);
    const current = getDermatologyState();
    for (const profile of Object.values(DERMATOLOGY_SYNDROME_PROFILES)) {
      const isSelected = current.selectedSyndrome === profile.id;
      const btn = makeButton(
        isEs ? profile.titleEs : profile.titleEn,
        () => {
          setDermatologyState({ selectedSyndrome: profile.id });
          renderSyndromeButtons();
          renderDetailAndSbar();
        },
        {
          className: `button syndrome-select-btn ${isSelected ? 'active primary' : 'secondary'}`,
          ariaPressed: isSelected ? 'true' : 'false'
        }
      );
      btn.setAttribute('data-syndrome-id', profile.id);
      syndromeGrid.appendChild(btn);
    }
  }

  const flagsSection = el('section', {
    className: 'dermatology-flags-section card',
    attrs: { 'aria-labelledby': 'dermatology-flags-heading' }
  });
  flagsSection.appendChild(
    el(
      'h2',
      { id: 'dermatology-flags-heading', className: 'card-title' },
      t(
        'dermatology.flagsTitle',
        isEs
          ? '2. Verificador de Signos de Alarma Cutánea, Toxidermias Graves y Heridas'
          : '2. Severe Cutaneous Adverse Reactions (SCAR) & Necrotic Wound Red-Flag Checker'
      )
    )
  );

  const flagDefinitions = [
    {
      key: 'blisteringNikolskyMucositisLamotrigineBactrim',
      labelEn:
        'Painful dusky rash, epidermal detachment (positive Nikolsky sign), and oral/ocular/genital mucositis after Lamotrigine, Carbamazepine, or TMP-SMX (SJS/TEN)',
      labelEs:
        'Exantema violáceo doloroso, desprendimiento epidérmico (Nikolsky positivo) y mucositis oral/ocular/genital tras Lamotrigina, Carbamazepina o TMP-SMX (SSJ/NET)'
    },
    {
      key: 'facialEdemaEosinophiliaFeverVancomycin2to8Weeks',
      labelEn:
        'Morbilliform rash, symmetric facial/periorbital edema, high fever, and eosinophilia 2–8 weeks after starting IV Vancomycin or anticonvulsants (DRESS Syndrome)',
      labelEs:
        'Exantema morbiliforme, edema facial/periorbitario simétrico, fiebre alta y eosinofilia 2–8 semanas tras iniciar Vancomicina IV o anticonvulsivos (Síndrome DRESS)'
    },
    {
      key: 'painlessBlackEscharGelatinousEdemaOrDescendingPtosis',
      labelEn:
        'Painless black eschar with massive gelatinous edema (Cutaneous Anthrax) OR descending ptosis/diplopia/dysphagia ("4 Ds") after skin-popping (Wound Botulism)',
      labelEs:
        'Escara negra indolora con edema gelatinoso masivo (Ántrax Cutáneo) O ptosis/diplopía/disfagia descendente ("4 D") tras skin-popping (Botulismo por Herida)'
    },
    {
      key: 'instantBurningBlanchingLivedoidPlaqueAtInjection',
      labelEn:
        'Instantaneous excruciating burning pain, blanching pallor, and livedoid reticular violaceous plaque at an IM or subcutaneous injection site (Nicolau Syndrome)',
      labelEs:
        'Dolor urente instantáneo en el momento de la inyección IM/SC seguido de palidez y placa violácea reticular livedoide (Síndrome de Nicolau)'
    },
    {
      key: 'xylazineNecroticEscharWithExposedTendonOrBone',
      labelEn:
        'Punched-out or coalescing black/purple Xylazine ("Tranq") necrotic eschar on forearms/legs with exposed tendon or bone',
      labelEs:
        'Escara necrótica negra/violácea en sacabocados por Xilacina ("Tranq") en antebrazos/piernas con tendón o hueso expuesto'
    },
    {
      key: 'stimulantFormicationPickingWithHoneyCrusting',
      labelEn:
        'Distressing tactile crawling sensation ("formication") with geometric excoriations and secondary honey-crusted bacterial impetigo/ecthyma',
      labelEs:
        'Sensación táctil de insectos bajo la piel ("formicación") con excoriaciones geométricas e impétigo/ectima bacteriano secundario'
    }
  ];

  const flagsList = el('div', { className: 'dermatology-flags-list' });
  const checkboxRefs = new Map();

  for (const def of flagDefinitions) {
    const row = el('label', { className: 'checkbox-row dermatology-flag-row' });
    const cb = el('input', {
      attrs: {
        type: 'checkbox',
        'data-flag-key': def.key
      }
    });
    cb.checked = Boolean(dermatologyState[def.key]);
    cb.addEventListener('change', () => {
      setDermatologyState({ [def.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(def.key, cb);
    row.append(cb, el('span', {}, isEs ? def.labelEs : def.labelEn));
    flagsList.appendChild(row);
  }
  flagsSection.appendChild(flagsList);

  function renderDetailAndSbar() {
    clear(detailContainer);
    const evalResult = evaluateDermatologyRisk(getDermatologyState());

    const card = el('article', {
      className: `card dermatology-profile-card urgency-${evalResult.urgency.toLowerCase()}`
    });

    const headerRow = el('div', { className: 'profile-header-row' });
    const badge = el(
      'span',
      { className: `urgency-badge urgency-${evalResult.urgency.toLowerCase()}` },
      `${evalResult.urgency}: ${evalResult.badge}`
    );
    const h3 = el('h3', { className: 'profile-title' }, evalResult.title);
    headerRow.append(badge, h3);
    card.appendChild(headerRow);

    if (evalResult.redFlags.length > 0) {
      const alertBox = el('div', {
        className: 'dermatology-redflag-box',
        attrs: { role: 'alert' }
      });
      alertBox.appendChild(
        el(
          'h4',
          {},
          isEs
            ? 'Alertas Clínicas Dermatológicas y de Heridas Activadas'
            : 'Immediate Dermatologic & Wound Red-Flag Alerts Activated'
        )
      );
      const ul = el('ul', {});
      for (const rf of evalResult.redFlags) {
        ul.appendChild(el('li', {}, rf));
      }
      alertBox.appendChild(ul);
      card.appendChild(alertBox);
    }

    card.appendChild(el('p', { className: 'profile-summary' }, evalResult.summary));

    const pathoSection = el('div', { className: 'profile-subsection' });
    pathoSection.append(
      el('h4', {}, isEs ? 'Fisiopatología y Mecanismo Cutáneo' : 'Pathophysiology & Cutaneous Mechanism'),
      el('p', {}, evalResult.pathophysiology)
    );
    card.appendChild(pathoSection);

    const diagSection = el('div', { className: 'profile-subsection' });
    diagSection.appendChild(
      el('h4', {}, isEs ? 'Evaluación Diagnóstica y Escalas (SCORTEN / RegiSCAR)' : 'Diagnostic Workup & Scoring (SCORTEN / RegiSCAR)')
    );
    const diagList = el('ul', {});
    for (const item of evalResult.diagnostics) {
      diagList.appendChild(el('li', {}, item));
    }
    diagSection.appendChild(diagList);
    card.appendChild(diagSection);

    const mgmtSection = el('div', { className: 'profile-subsection' });
    mgmtSection.appendChild(
      el(
        'h4',
        {},
        isEs
          ? 'Protocolo de Manejo Cutáneo, Unidad de Quemados y Preservación Tisular'
          : 'Cutaneous Management, Burn ICU & Tissue Preservation Protocol'
      )
    );
    const mgmtList = el('ul', {});
    for (const item of evalResult.management) {
      mgmtList.appendChild(el('li', {}, item));
    }
    mgmtSection.appendChild(mgmtList);
    card.appendChild(mgmtSection);

    const hrSection = el('div', { className: 'profile-subsection harm-reduction-highlight' });
    hrSection.append(
      el(
        'h4',
        {},
        isEs
          ? 'Reducción de Daños y Cuidado de Heridas Informado en Trauma'
          : 'Trauma-Informed Wound Care & Harm Reduction'
      ),
      el('p', {}, evalResult.harmReduction)
    );
    card.appendChild(hrSection);

    detailContainer.appendChild(card);
    sbarPre.textContent = formatDermatologySbarText(getDermatologyState());
  }

  selectorSection.appendChild(syndromeGrid);
  root.appendChild(selectorSection);
  root.appendChild(flagsSection);
  root.appendChild(detailContainer);

  const rulesSection = el('section', {
    className: 'dermatology-rules-section card',
    attrs: { 'aria-labelledby': 'dermatology-rules-heading' }
  });
  rulesSection.appendChild(
    el(
      'h2',
      { id: 'dermatology-rules-heading', className: 'card-title' },
      t(
        'dermatology.rulesTitle',
        isEs
          ? '3. Reglas Cardinales de Dermatología Aguda y Preservación de Heridas'
          : '3. Cardinal Rules of Acute Dermatology & Wound Preservation'
      )
    )
  );
  const rulesGrid = el('div', { className: 'dermatology-rules-grid' });
  for (const rule of DERMATOLOGY_HARM_REDUCTION_RULES) {
    const rCard = el('article', { className: 'dermatology-rule-card' });
    rCard.append(
      el('h3', { className: 'rule-title' }, isEs ? rule.titleEs : rule.titleEn),
      el('p', { className: 'rule-body' }, isEs ? rule.bodyEs : rule.bodyEn)
    );
    rulesGrid.appendChild(rCard);
  }
  rulesSection.appendChild(rulesGrid);
  root.appendChild(rulesSection);

  const sbarSection = el('section', {
    className: 'dermatology-sbar-section card',
    attrs: { 'aria-labelledby': 'dermatology-sbar-heading' }
  });
  sbarSection.appendChild(
    el(
      'h2',
      { id: 'dermatology-sbar-heading', className: 'card-title' },
      t(
        'dermatology.sbarTitle',
        isEs
          ? '4. Generador de Entrega Clínica SBAR (Cero-PII en RAM)'
          : '4. Zero-PII SBAR Clinical Handoff Generator (In-RAM)'
      )
    )
  );

  const notesLabel = el(
    'label',
    { className: 'field-label', attrs: { for: 'dermatology-clinical-notes' } },
    isEs
      ? 'Notas clínicas contextuales (solo en RAM, sin datos identificables):'
      : 'Contextual clinical notes (in-RAM only, zero identifiable data):'
  );
  const notesInput = el('textarea', {
    id: 'dermatology-clinical-notes',
    className: 'form-textarea dermatology-notes-input',
    attrs: {
      rows: '2',
      placeholder: isEs
        ? 'Ej. Escara seca de 4x3 cm en antebrazo dorsal, sin crepitación, en tratamiento con buprenorfina + clonidina...'
        : 'e.g., 4x3 cm dry eschar on dorsal forearm, no crepitus, stabilized on buprenorphine + clonidine...'
    }
  });
  notesInput.value = dermatologyState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setDermatologyState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatDermatologySbarText(getDermatologyState());
  });

  const copyStatus = el('span', {
    className: 'copy-status-msg',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });

  const copyBtn = makeButton(
    isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard',
    async () => {
      const txt = formatDermatologySbarText(getDermatologyState());
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(txt);
      }
      copyStatus.textContent = isEs ? '¡Copiado al portapapeles!' : 'Copied to clipboard!';
    },
    { className: 'button primary copy-sbar-btn' }
  );

  const resetBtn = makeButton(
    isEs ? 'Reiniciar Formulario (RAM)' : 'Reset Triage State (RAM)',
    () => {
      resetDermatologyState();
      notesInput.value = '';
      copyStatus.textContent = '';
      for (const [k, cb] of checkboxRefs.entries()) {
        cb.checked = Boolean(dermatologyState[k]);
      }
      renderSyndromeButtons();
      renderDetailAndSbar();
    },
    { className: 'button secondary reset-dermatology-btn' }
  );

  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);

  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  const linksSection = el('nav', {
    className: 'dermatology-links-section card',
    attrs: { 'aria-label': isEs ? 'Navegadores clínicos relacionados' : 'Related clinical navigators' }
  });
  linksSection.appendChild(
    el(
      'h2',
      { className: 'card-title' },
      isEs ? 'Vías Clínicas Integradas Relacionadas' : 'Related Integrated Clinical Pathways'
    )
  );
  const linksRow = el('div', { className: 'related-links-row' });
  linksRow.append(
    makeLinkButton(
      isEs ? 'Adulterantes y Xilacina (#/adulterant-care)' : 'Adulterants & Xylazine (#/adulterant-care)',
      '#/adulterant-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Cuidado de Heridas e Infecciones (#/wound-care)' : 'Wound & Infectious Care (#/wound-care)',
      '#/wound-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Hematología y Vasculitis por Levamisol (#/hematology-care)' : 'Hematology & Levamisole Vasculitis (#/hematology-care)',
      '#/hematology-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Otorrinolaringología y Vía Aérea (#/ent-care)' : 'Otolaryngology & Upper Airway (#/ent-care)',
      '#/ent-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Directorio de Herramientas (#/tools)' : 'Clinical Tools Directory (#/tools)',
      '#/tools',
      { className: 'button secondary' }
    )
  );
  linksSection.appendChild(linksRow);
  root.appendChild(linksSection);

  renderSyndromeButtons();
  renderDetailAndSbar();

  return root;
}
