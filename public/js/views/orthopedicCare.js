// public/js/views/orthopedicCare.js
// HarborPath - Spine, Musculoskeletal & Orthopedic Infections Navigator
// Clinical Consensus: IDSA Clinical Practice Guidelines for Native Vertebral Osteomyelitis (NVO) & Spinal Epidural Abscess (SEA),
// NEJM OVIVA Trial (2019) Oral vs. Intravenous Antibiotics for Bone and Joint Infections & Long-Acting Lipoglycopeptides (Dalbavancin),
// AAOS / IDSA Guidelines on Native Septic Arthritis, Sternoclavicular/Sacroiliac Joint Sepsis & Iliopsoas Abscess in PWID,
// Surgical Infectious Disease Consensus on Pyomyositis, Clostridial Myonecrosis (Eagle Effect) & Opioid/Alcohol Bone Health (OPIAD & Femoral Head AVN).
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: SPINE, MUSCULOSKELETAL & ORTHOPEDIC SYNDROMES
// ============================================================================

export const ORTHOPEDIC_SYNDROME_PROFILES = Object.freeze({
  spinalEpiduralAbscess: Object.freeze({
    id: 'spinal_epidural_abscess',
    nameEn: 'Spinal Epidural Abscess (SEA) & Native Vertebral Osteomyelitis (NVO / Discitis)',
    nameEs: 'Absceso Epidural Espinal (AEE) y Osteomielitis Vertebral Nativa (OVN / Espondilodiscitis)',
    pathophysiologyEn: 'Hematogenous bacteremic seeding (principally Staphylococcus aureus [MRSA/MSSA], Streptococcus spp., and Pseudomonas aeruginosa or Candida spp. in people who inject drugs) enters the richly vascularized subchondral vertebral endplates and Batson’s valveless epidural venous plexus. Infection destroys the intervertebral disc and adjacent vertebral bodies (spondylodiscitis) and forms a suppurative collection within the confined spinal epidural space. Spinal cord injury results from both direct mechanical compression of the thecal sac and septic thrombophlebitis/venous infarction of the intrinsic spinal cord vasculature.',
    pathophysiologyEs: 'La siembra hematógena bacteriana (principalmente Staphylococcus aureus [SARM/SASM], Streptococcus spp., Pseudomonas aeruginosa o Candida spp. en personas que se inyectan drogas) alcanza los platillos vertebrales subcondrales y el plexo venoso epidural avalvular de Batson. La infección destruye el disco intervertebral y los cuerpos vertebrales adyacentes (espondilodiscitis) y forma una colección purulenta en el espacio epidural espinal, dañando la médula por compresión mecánica directa y tromboflebitis séptica.',
    clinicalPresentationEn: 'THE 15% CLASSIC TRIAD TRAP & FOUR CLINICAL STAGES: The "Classic Triad" of 1) Focal midline back/neck pain, 2) Fever, and 3) Neurologic deficit is present in FEWER THAN 15% of patients at initial presentation! Waiting for fever or paralysis leads to irreversible paraplegia or quadriplegia. Clinical progression follows 4 stages: Stage 1 (focal midline spinal ache and percussion tenderness); Stage 2 (radicular nerve root pain/shooting paresthesias); Stage 3 (motor weakness, sensory level, bowel/bladder sphincter dysfunction—urinary retention, overflow incontinence, or saddle anesthesia); Stage 4 (complete paralysis). DIAGNOSTIC & NEUROSURGICAL PROTOCOL: Any new focal midline back/neck pain in a person who injects drugs mandates stat ESR/CRP (> 95% sensitivity) and emergent Contrast-Enhanced MRI of the ENTIRE Spine (skip lesions occur in 15–20% of cases; plain X-rays are normal for the first 2–4 weeks!). If ANY neurologic deficit is present, draw 2 sets of blood cultures, administer immediate IV Vancomycin (20–25 mg/kg load) + Cefepime (2 g IV q8h) or Ceftriaxone (2 g IV), and perform emergent neurosurgical decompressive laminectomy within < 12–24 hours (paralysis > 24–36 hours rarely recovers).',
    clinicalPresentationEs: 'LA TRAMPA DEL 15 % EN LA TRÍADA CLÁSICA Y LOS 4 ESTADIOS: ¡La "Tríada Clásica" de 1) Dolor focal en línea media de espalda/cuello, 2) Fiebre y 3) Déficit neurológico aparece en MENOS DEL 15 % de los pacientes al inicio! Esperar a la fiebre o parálisis causa paraplejía irreversible. Evoluciona en 4 estadios: Estadio 1 (dolor vertebral focal a la percusión); Estadio 2 (dolor radicular); Estadio 3 (debilidad motora, anestesia en silla de montar, retención urinaria); Estadio 4 (parálisis completa). PROTOCOLO DIAGNÓSTICO Y NEUROQUIRÚRGICO: Todo dolor nuevo en línea media vertebral en usuarios de vía parenteral exige VSG/PCR urgentes (> 95 % sensibilidad) y RM con Contraste de TODA la Columna (existen lesiones salteadas en el 15–20 %; la radiografía simple es normal las primeras 2–4 semanas). Si existe CUALQUIER déficit neurológico, extraer 2 pares de hemocultivos, iniciar Vancomicina IV + Cefepima o Ceftriaxona de inmediato y realizar laminectomía descompresiva neuroquirúrgica en < 12–24 horas.',
  }),

  septicArthritisPwid: Object.freeze({
    id: 'septic_arthritis_pwid',
    nameEn: 'Septic Arthritis & Fibrocartilaginous Joint Sepsis (Sternoclavicular & Sacroiliac Joints)',
    nameEs: 'Artritis Séptica y Sepsis de Articulaciones Fibrocartilaginosas (Esternoclavicular y Sacroilíaca)',
    pathophysiologyEn: 'Because synovial membranes lack a protective basement membrane, bacteremia rapidly seeds synovial fluid. Bacterial toxins and host neutrophil lysosomal matrix metalloproteinases (MMPs) irreversibly chondrolyze articular hyaline cartilage within 24 to 48 hours. In people who inject drugs, internal jugular/subclavian ("pocket shot") and femoral vein injections uniquely seed axial fibrocartilaginous joints—specifically the Sternoclavicular Joint (SCJ), Sacroiliac Joint (SIJ), Acromioclavicular Joint, and Pubic Symphysis.',
    pathophysiologyEs: 'Dado que la membrana sinovial carece de membrana basal limitante, la bacteriemia coloniza rápidamente el líquido sinovial. Las proteasas lisosomales de los neutrófilos destruyen irreversiblemente el cartílago hialino articular en 24 a 48 horas. En personas que se inyectan drogas en venas yugular/subclavia o femoral, existe una predilección característica por articulaciones fibrocartilaginosas axiales: Articulación Esternoclavicular (AEC), Sacroilíaca (ASI) y Sínfisis del Pubis.',
    clinicalPresentationEn: 'STERNOCLAVICULAR MEDIASTINITIS ALERT & SYNOVIAL THRESHOLDS: Sternoclavicular septic arthritis presents with painful anterior chest/collarbone swelling and carries a 20% incidence of retrosternal abscess, descending necrotizing mediastinitis, and superior vena cava (SVC) thrombosis—mandating urgent Contrast CT/MRI of the Chest! Sacroiliac septic arthritis presents with severe buttock/posterior pelvic pain and a positive FABER (Patrick) test. ARTHROCENTESIS & SURGICAL WASHOUT RULE: Perform joint aspiration BEFORE antibiotics (never insert a needle through overlying skin cellulitis!). Native joint synovial WBC > 50,000/mcL (> 90% PMNs) is diagnostic of septic arthritis (Note: Prosthetic Joint Infection [PJI] threshold is much lower at synovial WBC > 1,100–3,000/mcL!). CRITICAL CRYSTAL TRAP: The presence of gout (monosodium urate) or pseudogout (CPPD) crystals on polarized microscopy DOES NOT exclude concurrent septic arthritis (~5% dual incidence)! Requires emergent surgical arthroscopic or open arthrotomy irrigation/debridement plus empiric IV Vancomycin + Ceftriaxone/Cefepime.',
    clinicalPresentationEs: 'ALERTA DE MEDIASTINITIS ESTERNOCLAVICULAR Y UMBRALES SINOVIALES: La artritis séptica esternoclavicular cursa con tumefacción dolorosa en la clavícula/tórax anterior y conlleva un 20 % de riesgo de absceso retroesternal, mediastinitis necrosante y trombosis de vena cava superior—exigiendo TC/RM torácica urgente. La sacroileítis séptica cursa con dolor glúteo severo y maniobra FABER positiva. REGLA DE ARTROCENTESIS Y LAVADO QUIRÚRGICO: Aspirar la articulación ANTES de iniciar antibióticos (nunca puncionar a través de celulitis cutánea). Un recuento leucocitario sinovial > 50.000/mcL (> 90 % PMN) confirma artritis séptica nativa (en prótesis articular el umbral es > 1.100–3.000/mcL). TRAMPA DE CRISTALES: ¡Hallar cristales de gota o pseudogota NO descarta artritis séptica concomitante! Exige lavado quirúrgico urgente (artroscopia o artrotomía) más Vancomicina + Ceftriaxona/Cefepima IV.',
  }),

  iliopsoasAbscess: Object.freeze({
    id: 'iliopsoas_abscess',
    nameEn: 'Iliopsoas (Psoas) Retroperitoneal Abscess & Femoral Triangle Extension',
    nameEs: 'Absceso Retroperitoneal del Iliopsoas (Psoas) y Extensión del Triángulo Femoral',
    pathophysiologyEn: 'The iliopsoas compartment is an extraperitoneal muscular space extending from the T12–L5 vertebrae across the pelvic brim to insert on the lesser trochanter of the femur. Primary psoas abscess arises from hematogenous MRSA/MSSA bacteremia seeding the rich intramuscular venous plexus; secondary psoas abscess results from contiguous retroperitoneal extension of lumbar vertebral osteomyelitis/discitis or upward tracking of deep femoral triangle ("groin hit") injection abscesses beneath the inguinal ligament.',
    pathophysiologyEs: 'El compartimento iliopsoas se extiende desde las vértebras T12–L5 hasta el trocánter menor del fémur. El absceso primario del psoas surge por siembra hematógena de S. aureus (SARM/SASM); el secundario se produce por extensión contigua de una espondilodiscitis lumbar o por ascenso retroperitoneal de abscesos profundos del triángulo femoral (inyección inguinal) por debajo del ligamento inguinal.',
    clinicalPresentationEn: 'ANTALGIC HIP FLEXION & THE CLASSIC PSOAS SIGN: Patients present with fever, flank/back or groin pain, and a characteristic antalgic posture in which the ipsilateral hip is held flexed and externally rotated to relax the psoas muscle. PHYSICAL EXAM DIFFERENTIATION FROM SEPTIC HIP: Passive extension of the hip (or active hip flexion against resistance) triggers excruciating pain (Positive Psoas Sign), whereas gentle passive internal and external rotation of the femur with the hip kept flexed at 90 degrees is relatively painless (unlike intra-articular hip septic arthritis, where any rotation at 90° flexion is agonizing). MANAGEMENT: Contrast-enhanced CT Abdomen/Pelvis is the diagnostic gold standard. Treat with CT-guided percutaneous catheter drainage (or surgical drainage if multiloculated) plus IV Vancomycin + Piperacillin-Tazobactam or Cefepime + Metronidazole.',
    clinicalPresentationEs: 'FLEXIÓN ANTÁLGICA DE CADERA Y SIGNO DEL PSOAS CLÁSICO: Cursa con fiebre, dolor lumbar/inguinal y postura antálgica característica con la cadera flexionada y en rotación externa. DIFERENCIACIÓN CON ARTRITIS SÉPTICA DE CADERA: La extensión pasiva de la cadera desencadena dolor intenso (Signo del Psoas positivo), mientras que la rotación interna/externa pasiva manteniendo la cadera flexionada a 90° es relativamente indolora (a diferencia de la artritis séptica coxofemoral). MANEJO: La TC de Abdomen/Pelvis con contraste es el estándar diagnóstico. Tratar mediante drenaje percutáneo guiado por TC más cobertura IV frente a SARM, gramnegativos y anaerobios.',
  }),

  pyomyositisMyonecrosis: Object.freeze({
    id: 'pyomyositis_myonecrosis',
    nameEn: 'Pyomyositis, Deep Intramuscular Abscess & Clostridial Myonecrosis (Gas Gangrene & Eagle Effect)',
    nameEs: 'Piomiositis, Absceso Intramuscular Profundo y Mionecrosis Clostridial (Gangrena Gaseosa y Efecto Eagle)',
    pathophysiologyEn: 'Subcutaneous ("skin popping") or intramuscular ("muscling") injection of hypertonic, acid-dissolved (citric/ascorbic acid, lemon juice), or xylazine/black-tar heroin solutions produces focal skeletal muscle ischemia, necrosis, and low tissue redox potential. Hematogenous or direct inoculation of S. aureus causes deep subfascial Pyomyositis, while germination of anaerobic spores (Clostridium perfringens, Clostridium novyi, Clostridium sordellii) releases lethal lecithinase (alpha-toxin) and edema/lethal toxins, causing fulminant Gas Gangrene or C. sordellii Toxic Shock Syndrome.',
    pathophysiologyEs: 'La inyección subcutánea ("skin popping") o intramuscular de soluciones hipertónicas, acidificadas (ácido cítrico, jugo de limón) o adulteradas con xilazina/heroína negra provoca isquemia muscular focal y bajo potencial redox. La inoculación de S. aureus causa Piomiositis subfascial profunda, mientras que la germinación de esporas anaerobias (Clostridium perfringens, C. novyi, C. sordellii) libera alfa-toxina (lecitinasa) y toxinas letales, causando Gangrena Gaseosa fulminante.',
    clinicalPresentationEn: 'THREE STAGES OF PYOMYOSITIS vs. CLOSTRIDIAL MYONECROSIS: Pyomyositis progresses from Stage 1 (Invasive: deep cramping muscle ache, "woody" induration, no fluctuance, normal overlying skin), to Stage 2 (Suppurative: high fever, deep intramuscular abscess on POCUS/MRI), to Stage 3 (Septic shock). Clostridial Myonecrosis / C. sordellii Toxic Shock presents with agonizing pain out of proportion, bronze/violaceous skin, hemorrhagic bullae, subcutaneous/intramuscular gas crepitus, and a pathognomonic MASSIVE LEUKEMOID REACTION (WBC > 50,000–100,000/mcL) with marked hemoconcentration (Hct > 50%) often WITHOUT fever! CARDINAL EAGLE EFFECT ANTIBIOTIC RULE: In necrotizing myositis or gas gangrene, emergent surgical debridement/fasciotomy must be paired with IV Vancomycin + Piperacillin-Tazobactam (or Penicillin G) PLUS CLINDAMYCIN (600–900 mg IV q8h) or Linezolid! Cell-wall beta-lactams fail in high-inoculum stationary-phase infection (the Eagle effect); Clindamycin binds the 50S ribosome to immediately shut down bacterial exotoxin and alpha-toxin synthesis!',
    clinicalPresentationEs: 'TRES ESTADIOS DE PIOMIOSITIS vs. MIONECROSIS CLOSTRIDIAL: La piomiositis avanza del Estadio 1 (induración muscular leñosa sin fluctuación ni cambios cutáneos), al Estadio 2 (absceso intramuscular profundo en ecografía POCUS/RM) y Estadio 3 (choque séptico). La Mionecrosis Clostridial / Choque Tóxico por C. sordellii cursa con dolor desproporcionado, ampollas hemorrágicas, gas tisular y una REACCIÓN LEUCEMOIDE MASIVA patognomónica (leucocitos > 50.000–100.000/mcL) con hemoconcentración sin fiebre. REGLA CARDINAL DEL EFECTO EAGLE: ¡Asociar siempre desbridamiento quirúrgico urgente con betalactámicos/vancomicina MÁS CLINDAMICINA (600–900 mg IV cada 8 h) o Linezolid! Los betalactámicos fracasan en inóculos bacterianos densos (efecto Eagle); la Clindamicina inhibe el ribosoma 50S deteniendo de inmediato la síntesis de alfa-toxina.',
  }),

  ovivaDalbavancinStepdown: Object.freeze({
    id: 'oviva_dalbavancin_stepdown',
    nameEn: 'OVIVA Trial Oral Step-Down & Long-Acting Dalbavancin for Bone and Joint Infections',
    nameEs: 'Terapia Oral Secuencial (Ensayo OVIVA) y Dalbavancina de Acción Prolongada en Infecciones Óseas',
    pathophysiologyEn: 'Traditional management of osteomyelitis and septic arthritis required 6 weeks of inpatient parenteral antibiotics via a Peripherally Inserted Central Catheter (PICC). In patients with substance use disorders, mandatory prolonged inpatient PICC confinement or denial of outpatient parenteral antibiotic therapy (OPAT) drives high rates of patient-directed discharge (AMA), central line-associated bloodstream infections (CLABSI), and incomplete treatment.',
    pathophysiologyEs: 'El manejo clásico de la osteomielitis y artritis séptica exigía 6 semanas de antibióticos IV mediante catéter central (PICC). En personas con trastornos por uso de sustancias, la hospitalización prolongada obligatoria provoca altas tasas de alta voluntaria (AMA), bacteriemias asociadas al catéter y tratamientos incompletos.',
    clinicalPresentationEn: 'NEJM OVIVA TRIAL (2019) PARADIGM SHIFT: The landmark OVIVA randomized controlled trial (N = 1,054) proved that switching within 7 days of surgical debridement/drainage to HIGH-BIOAVAILABILITY ORAL ANTIBIOTICS is non-inferior to 6 weeks of IV therapy for bone and joint infections (1-year treatment failure: 13.2% oral vs. 14.6% IV), while eliminating PICC line complications! Validated oral bone-penetrating regimens include: Rifampin (300–450 mg PO BID, never as monotherapy) paired with a fluoroquinolone (Levofloxacin/Moxifloxacin), TMP-SMX, Doxycycline, or Clindamycin; or Linezolid (600 mg PO BID, monitoring CBC and serotonin interactions). LONG-ACTING LIPOGLYCOPEPTIDE BRIDGE (DALBAVANCIN): When complex oral adherence or housing stability is uncertain or before AMA discharge, administer Dalbavancin 1,500 mg IV on Day 1 + 1,500 mg IV on Day 8 (two 30-minute infusions provide >= 6 full weeks of bactericidal cortical bone and synovial fluid concentrations above the MRSA MIC without a PICC line!).',
    clinicalPresentationEs: 'CAMBIO DE PARADIGMA DEL ENSAYO OVIVA (NEJM 2019): El ensayo clínico OVIVA (N = 1.054) demostró que pasar en los primeros 7 días tras el desbridamiento quirúrgico a ANTIBIÓTICOS ORALES DE ALTA BIODISPONIBILIDAD es no inferior a 6 semanas de terapia IV en infecciones óseas y articulares (fracaso al año: 13,2 % oral vs. 14,6 % IV), reduciendo drásticamente las complicaciones de catéter. Esquemas orales con excelente penetración ósea incluyen Rifampicina combinada con Levofloxacino/Moxifloxacino, Cotrimoxazol (TMP-SMX), Doxiciclina o Clindamicina, o bien Linezolid oral. PUENTE CON DALBAVANCINA DE ACCIÓN PROLONGADA: Si existe barrera de adherencia oral, falta de vivienda o riesgo de alta voluntaria (AMA), administrar Dalbavancina 1.500 mg IV el Día 1 + 1.500 mg IV el Día 8 (dos infusiones garantizan 6 semanas completas de niveles bactericidas en hueso y líquido sinovial sin necesidad de catéter PICC).',
  }),

  opioidAlcoholBoneHealth: Object.freeze({
    id: 'opioid_alcohol_bone_health',
    nameEn: 'Opioid-Induced Hypogonadal Osteoporosis (OPIAD) & Alcohol Femoral Head Osteonecrosis (AVN)',
    nameEs: 'Osteoporosis Hipogonadal por Opioides (OPIAD) y Osteonecrosis Avascular de Cabeza Femoral por Alcohol',
    pathophysiologyEn: 'Chronic exposure to exogenous mu-opioid agonists (especially methadone and high-dose full agonists) inhibits hypothalamic pulsatile GnRH secretion, causing Opioid-Induced Androgen Deficiency (OPIAD / hypogonadotropic hypogonadism) with suppressed testosterone, estradiol, and DHEA-S, while directly inhibiting osteoblast osteocalcin synthesis. This doubles hip and vertebral fragility fracture risk. Concurrently, heavy ethanol use induces marrow adipocyte hypertrophy, intraosseous venous hypertension, and subchondral lipid microembolism in the retinacular vessels of the femoral head, causing Avascular Necrosis (AVN / Osteonecrosis).',
    pathophysiologyEs: 'El uso crónico de opioides (especialmente metadona y agonistas puros) inhibe la secreción hipotalámica de GnRH, causando Hipogonadismo Inducido por Opioides (OPIAD) e inhibición directa de los osteoblastos, duplicando el riesgo de fracturas vertebrales y de cadera. Simultáneamente, el consumo elevado de alcohol provoca hipertrofia de adipocitos medulares, hipertensión intraósea y microembolia grasa en las arterias retinaculares de la cabeza femoral, causando Necrosis Avascular (NAV / Osteonecrosis).',
    clinicalPresentationEn: 'FEMORAL HEAD AVN & THE NORMAL X-RAY TRAP: Avascular necrosis of the femoral head presents with deep aching groin pain radiating to the anteromedial thigh or knee, worsened by weight-bearing and internal hip rotation. CRITICAL IMAGING RULE: Plain hip radiographs are completely NORMAL in early Stage I–II AVN when the femoral head is still spherical and salvageable! Always order an MRI of both hips (sensitivity > 99%; demonstrates the pathognomonic T2 "double-line sign" of reactive bone interface; > 50% of alcohol-induced AVN is bilateral!). Once the X-ray shows the subchondral "crescent sign" (Stage III collapse), joint-preserving core decompression is no longer effective and total hip arthroplasty is required. BONE PROTECTION PROTOCOL: Screen long-term MOUD/alcohol patients with DEXA bone mineral density, serum 25-OH Vitamin D, calcium, and morning total/free testosterone or estradiol; supplement Vitamin D3 (2,000–4,000 IU/day) + Calcium (1,000–1,200 mg/day) and consider bisphosphonates or endocrine replacement.',
    clinicalPresentationEs: 'NECROSIS AVASCULAR DE CABEZA FEMORAL Y LA TRAMPA DE LA RADIOGRAFÍA NORMAL: La osteonecrosis de la cabeza femoral cursa con dolor inguinal profundo irradiado al muslo o rodilla que empeora al cargar peso y con la rotación interna. REGLA DE IMAGEN CRÍTICA: ¡Las radiografías simples de cadera son totalmente NORMALES en los Estadios I–II precoces cuando la cabeza femoral aún puede salvarse! Solicite siempre RM de ambas caderas (> 99 % de sensibilidad; muestra el signo de la "doble línea" en T2, siendo bilateral en > 50 % de los casos por alcohol). Cuando aparece el "signo del creciente" subcondral en radiografía (colapso Estadio III), ya requiere prótesis total de cadera. PROTOCOLO DE PROTECCIÓN ÓSEA: Solicitar densitometría DEXA, 25-OH Vitamina D, calcio y testosterona/estradiol matutinos en pacientes en tratamiento crónico con opioides o alcohol.',
  }),
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & FIELD ORTHOPEDIC / SPINE SAFETY RULES
// ============================================================================

export const ORTHOPEDIC_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Never Wait for Fever or Paralysis to Image New Midline Back Pain (The 15% SEA Triad Trap)',
    titleEs: 'Nunca Esperar a Tener Fiebre o Parálisis ante Dolor Espinal Nuevo (Trampa del 15 % en AEE)',
    detailEn: 'Fewer than 15% of patients with a Spinal Epidural Abscess have the classic triad of back pain, fever, and nerve deficits at first visit. Any new focal midline spine pain in a person who injects drugs requires urgent ESR/CRP blood tests and a contrast MRI of the entire spine before irreversible paralysis develops.',
    detailEs: 'Menos del 15 % de los pacientes con Absceso Epidural Espinal presentan la tríada clásica de dolor de espalda, fiebre y déficit neurológico al inicio. Todo dolor nuevo en la línea media de la columna requiere VSG/PCR urgentes y una RM con contraste de toda la columna antes de que ocurra una parálisis irreversible.',
  },
  {
    ruleNum: 2,
    titleEn: 'Collarbone (Sternoclavicular) or Hip/Groin Swelling After Injection = Urgent Septic Joint Evaluation',
    titleEs: 'Dolor o Hinchazón en Clavícula (Esternoclavicular) o Ingle = Descartar Artritis Séptica Urgente',
    detailEn: 'Neck ("pocket shot") or groin ("femoral") injection frequently seeds the sternoclavicular or sacroiliac joints. Sternoclavicular septic arthritis carries a 20% risk of life-threatening chest mediastinitis and vena cava clots—never dismiss collarbone pain as a simple muscle strain.',
    detailEs: 'La inyección en cuello o ingle suele infectar la articulación esternoclavicular o sacroilíaca. La artritis séptica esternoclavicular conlleva un 20 % de riesgo de mediastinitis torácica mortal; nunca descarte el dolor clavicular como un simple tirón muscular.',
  },
  {
    ruleNum: 3,
    titleEn: 'The Eagle Effect Rule: Always Add Clindamycin to Vancomycin/Beta-Lactams in Deep Necrotizing Muscle Infections',
    titleEs: 'Regla del Efecto Eagle: Añadir Siempre Clindamicina en Infecciones Musculares Necrosantes',
    detailEn: 'In deep "skin-popping" abscesses, pyomyositis, or clostridial gas gangrene (marked by extreme pain or WBC > 50,000/mcL), cell-wall antibiotics alone fail once bacteria reach high density (Eagle effect). Adding Clindamycin immediately shuts down bacterial ribosome toxin production.',
    detailEs: 'En abscesos profundos por "skin popping", piomiositis o gangrena gaseosa clostridial (dolor extremo o leucocitos > 50.000/mcL), los betalactámicos solos fracasan ante inóculos densos (efecto Eagle). Añadir Clindamicina frena de inmediato la síntesis ribosómica de toxinas.',
  },
  {
    ruleNum: 4,
    titleEn: 'Patient-Centered Bone Cure: Use OVIVA Oral Antibiotics or 2-Dose Dalbavancin When a PICC Line is Unsafe',
    titleEs: 'Curación Ósea Centrada en el Paciente: Usar Terapia Oral OVIVA o Dalbavancina en Lugar de PICC Forzoso',
    detailEn: 'Per the NEJM OVIVA Trial, high-bioavailability oral antibiotics after surgical drainage are just as effective as 6 weeks of IV therapy for bone and joint infections. For patients who cannot stay hospitalized or manage daily pills, two infusions of Dalbavancin (Day 1 & Day 8) provide 6 full weeks of bone protection without a PICC line.',
    detailEs: 'Según el ensayo OVIVA (NEJM), los antibióticos orales de alta biodisponibilidad tras el drenaje quirúrgico igualan a 6 semanas de terapia IV. Si la hospitalización prolongada no es viable, dos dosis de Dalbavancina IV (Día 1 y Día 8) cubren 6 semanas completas sin catéter PICC.',
  },
  {
    ruleNum: 5,
    titleEn: 'Tap the Joint Before Antibiotics — And Remember That Gout Crystals Do Not Rule Out Septic Arthritis',
    titleEs: 'Aspirar la Articulación Antes de Antibióticos — Los Cristales de Gota No Descartan Infección',
    detailEn: 'Aspirate synovial fluid before giving antibiotics whenever possible to identify the organism, and never pass a needle through infected overlying skin (cellulitis). Seeing uric acid (gout) or calcium pyrophosphate (pseudogout) crystals under the microscope does NOT rule out concurrent septic arthritis!',
    detailEs: 'Realice artrocentesis antes de iniciar antibióticos siempre que sea posible, sin atravesar piel con celulitis. ¡Hallar cristales de ácido úrico (gota) o pirofosfato cálcico (pseudogota) en el líquido sinovial NO descarta una artritis séptica simultánea!',
  },
  {
    ruleNum: 6,
    titleEn: 'Persistent Groin Pain with a Normal Hip X-Ray: Request a Bilateral Hip MRI for Early Osteonecrosis (AVN)',
    titleEs: 'Dolor Inguinal Persistente con Radiografía Normal: Solicitar RM de Caderas por Osteonecrosis Precoz',
    detailEn: 'Plain hip X-rays miss early femoral head osteonecrosis (Stage I–II AVN) caused by heavy alcohol use or steroids. An early hip MRI detects the "double-line sign" while the femoral head is still round and can be saved before joint collapse.',
    detailEs: 'Las radiografías simples no detectan la osteonecrosis precoz de cabeza femoral (Estadios I–II) por alcohol o corticoides. La RM de caderas detecta el signo de la "doble línea" a tiempo para salvar la articulación antes del colapso.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE INVARIANT)
// ============================================================================

const DEFAULT_ORTHOPEDIC_STATE = Object.freeze({
  activeTab: 'syndromes', // 'syndromes' | 'evaluator' | 'rules' | 'sbar'
  // Clinical Risk Evaluator Flags
  spinePainWithNeuroDeficitOrRetention: false,
  newMidlineSpinePainPwidNoNeuro: false,
  sternoclavicularOrJointSwellingFever: false,
  deepMusclePainCrepitusLeukemoid: false,
  hipFlexionPainPositivePsoasSign: false,
  osteomyelitisPiccBarrierOrAmaRisk: false,
  chronicGroinPainAlcoholOrLongTermOpioids: false,
  sbarCopied: false,
});

let orthopedicRamState = { ...DEFAULT_ORTHOPEDIC_STATE };
const stateListeners = new Set();

export function getOrthopedicState() {
  return { ...orthopedicRamState };
}

export function setOrthopedicState(patch) {
  orthopedicRamState = { ...orthopedicRamState, ...patch };
  stateListeners.forEach((fn) => fn(getOrthopedicState()));
  return getOrthopedicState();
}

export function resetOrthopedicState() {
  orthopedicRamState = { ...DEFAULT_ORTHOPEDIC_STATE };
  stateListeners.forEach((fn) => fn(getOrthopedicState()));
  return getOrthopedicState();
}

export function subscribeOrthopedicState(fn) {
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}

// ============================================================================
// CLINICAL DECISION SUPPORT: SPINE, JOINT & ORTHOPEDIC EVALUATOR
// ============================================================================

export function evaluateOrthopedicRisk(state = orthopedicRamState) {
  const flags = [];
  let urgency = 'precautionary'; // 'emergency_911' | 'urgent_eval' | 'specialty_consult' | 'precautionary'

  const escalate = (level) => {
    const order = ['precautionary', 'specialty_consult', 'urgent_eval', 'emergency_911'];
    if (order.indexOf(level) > order.indexOf(urgency)) {
      urgency = level;
    }
  };

  // 1. Spinal Epidural Abscess (SEA) Stage 3–4 with Neurologic Deficits (Emergency 911)
  if (state.spinePainWithNeuroDeficitOrRetention) {
    escalate('emergency_911');
    flags.push({
      id: 'spinal_epidural_abscess_neuro_emergency',
      severity: 'critical',
      titleEn: 'Suspected Spinal Epidural Abscess (SEA) with Spinal Cord / Cauda Equina Compression',
      titleEs: 'Sospecha de Absceso Epidural Espinal (AEE) con Compresión Medular o de Cola de Caballo',
      descEn: 'CRITICAL NEUROSURGICAL EMERGENCY: Back/neck pain with leg/arm weakness, numbness, saddle anesthesia, or urinary retention/incontinence indicates Stage 3–4 Spinal Epidural Abscess! Draw 2 sets of blood cultures immediately, start empiric IV Vancomycin (20–25 mg/kg load) + Cefepime (2 g IV q8h) or Ceftriaxone (2 g IV), obtain emergent Contrast MRI of the ENTIRE Spine (to catch skip lesions), and proceed to emergent neurosurgical decompressive laminectomy within < 12–24 hours!',
      descEs: 'EMERGENCIA NEUROQUIRÚRGICA CRÍTICA: Dolor vertebral con debilidad en extremidades, anestesia en silla de montar o retención/incontinencia urinaria indica Absceso Epidural Espinal en Estadio 3–4. Extraer 2 pares de hemocultivos de inmediato, iniciar Vancomicina IV + Cefepima o Ceftriaxona, realizar RM con contraste de TODA la columna y proceder a laminectomía descompresiva neuroquirúrgica en < 12–24 horas.',
    });
  }

  // 2. Clostridial Myonecrosis / Gas Gangrene / C. sordellii Toxic Shock / Stage 3 Pyomyositis (Emergency 911)
  if (state.deepMusclePainCrepitusLeukemoid) {
    escalate('emergency_911');
    flags.push({
      id: 'clostridial_myonecrosis_pyomyositis_emergency',
      severity: 'critical',
      titleEn: 'Suspected Clostridial Myonecrosis (Gas Gangrene), C. sordellii Shock, or Suppurative Pyomyositis',
      titleEs: 'Sospecha de Mionecrosis Clostridial (Gangrena Gaseosa), Choque por C. sordellii o Piomiositis',
      descEn: 'CRITICAL SURGICAL EMERGENCY: Severe deep muscle pain after skin-popping/IM injection with tissue crepitus, bullae, woody induration, or leukemoid reaction (WBC > 50,000/mcL) mandates immediate surgical exploration/fasciotomy! CARDINAL EAGLE EFFECT RULE: Administer IV Vancomycin + Piperacillin-Tazobactam (or Penicillin G) PLUS CLINDAMYCIN (600–900 mg IV q8h) to immediately arrest ribosomal alpha-toxin and lethal toxin synthesis!',
      descEs: 'EMERGENCIA QUIRÚRGICA CRÍTICA: Dolor muscular profundo severo tras inyección subcutánea/IM con crepitación, ampollas, induración leñosa o reacción leucemoide (leucocitos > 50.000/mcL) exige exploración quirúrgica/fasciotomía inmediata. REGLA DEL EFECTO EAGLE: Administrar Vancomicina + Piperacilina-Tazobactam (o Penicilina G) MÁS CLINDAMICINA (600–900 mg IV cada 8 h) para frenar la síntesis ribosómica de alfa-toxina.',
    });
  }

  // 3. Acute Septic Arthritis / Sternoclavicular or Sacroiliac Joint Sepsis (Emergency 911)
  if (state.sternoclavicularOrJointSwellingFever) {
    escalate('emergency_911');
    flags.push({
      id: 'septic_arthritis_sternoclavicular_emergency',
      severity: 'critical',
      titleEn: 'Suspected Acute Septic Arthritis / Sternoclavicular or Sacroiliac Joint Sepsis',
      titleEs: 'Sospecha de Artritis Séptica Aguda / Sepsis Esternoclavicular o Sacroilíaca',
      descEn: 'CRITICAL ORTHOPEDIC EMERGENCY: Hyaline cartilage is irreversibly destroyed within 24–48 hours! Perform synovial fluid arthrocentesis BEFORE antibiotics (do not aspirate through overlying cellulitis; native WBC > 50,000/mcL or prosthetic WBC > 1,100–3,000/mcL is diagnostic; crystals do NOT exclude infection). If the Sternoclavicular Joint (collarbone) is involved, obtain urgent Contrast CT/MRI of the Chest to rule out retrosternal mediastinitis (20% incidence). Requires urgent surgical washout + IV Vancomycin + Ceftriaxone/Cefepime.',
      descEs: 'EMERGENCIA ORTOPÉDICA CRÍTICA: ¡El cartílago articular se destruye en 24–48 horas! Realizar artrocentesis ANTES de antibióticos (leucocitos sinoviales > 50.000/mcL en articulación nativa o > 1.100–3.000/mcL en prótesis; la presencia de cristales NO descarta infección). Si afecta a la Articulación Esternoclavicular (clavícula), solicitar TC/RM torácica urgente para descartar mediastinitis retroesternal (20 %). Requiere lavado quirúrgico urgente + Vancomicina + Ceftriaxona/Cefepima IV.',
    });
  }

  // 4. New Focal Midline Spine Pain in PWID Without Neurologic Deficits (Stage 1–2 SEA / NVO) (Urgent Eval)
  if (state.newMidlineSpinePainPwidNoNeuro) {
    escalate('urgent_eval');
    flags.push({
      id: 'vertebral_osteomyelitis_early_sea_eval',
      severity: 'high',
      titleEn: 'New Midline Spine Pain in PWID (The 15% Triad Trap): Urgent ESR/CRP & Contrast Whole-Spine MRI',
      titleEs: 'Dolor Espinal Nuevo en Línea Media (Trampa del 15 %): VSG/PCR y RM de Columna Completa Urgentes',
      descEn: 'URGENT SPINE PROTOCOL: Because < 15% of Spinal Epidural Abscess patients present with the full triad, never wait for fever or paralysis! Obtain stat ESR, CRP, 2 sets of blood cultures, and Contrast-Enhanced MRI of the Entire Spine (plain X-rays miss early osteomyelitis/discitis for 2–4 weeks). Per IDSA guidelines, if neurologically intact and hemodynamically stable, hold empiric antibiotics briefly only if CT-guided bone/disc biopsy or blood culture results are immediately forthcoming; start IV antibiotics immediately if septic or if S. aureus bacteremia is confirmed.',
      descEs: 'PROTOCOLO ESPINAL URGENTE: Como < 15 % de los Abscesos Epidurales Espinales presentan la tríada completa, nunca espere a la fiebre o parálisis. Solicitar VSG, PCR, 2 pares de hemocultivos y RM con contraste de TODA la columna (la radiografía simple es normal las primeras 2–4 semanas).',
    });
  }

  // 5. Iliopsoas (Psoas) Retroperitoneal Abscess (Flexed Hip + Positive Psoas Sign) (Urgent Eval)
  if (state.hipFlexionPainPositivePsoasSign) {
    escalate('urgent_eval');
    flags.push({
      id: 'iliopsoas_retroperitoneal_abscess_eval',
      severity: 'high',
      titleEn: 'Suspected Iliopsoas (Psoas) Retroperitoneal Abscess (Antalgic Hip Flexion & Positive Psoas Sign)',
      titleEs: 'Sospecha de Absceso Retroperitoneal del Iliopsoas (Flexión Antálgica y Signo del Psoas Positivo)',
      descEn: 'URGENT IMAGING & DRAINAGE DIRECTIVE: Flank/groin pain with an antalgic flexed hip and severe pain on passive hip extension (Positive Psoas Sign, while passive rotation at 90° flexion is spared) indicates an iliopsoas abscess—often tracking from lumbar discitis or a deep femoral triangle ("groin hit") injection abscess. Obtain Contrast-Enhanced CT Abdomen/Pelvis and arrange CT-guided percutaneous catheter drainage plus IV MRSA, Gram-negative, and anaerobic coverage.',
      descEs: 'DIRECTIVA DE IMAGEN Y DRENAJE URGENTE: Dolor lumbar/inguinal con cadera flexionada antálgica y dolor intenso a la extensión pasiva (Signo del Psoas positivo, conservando la rotación pasiva a 90°) indica absceso del iliopsoas. Solicitar TC de Abdomen/Pelvis con contraste y drenaje percutáneo guiado por TC más cobertura IV frente a SARM, gramnegativos y anaerobios.',
    });
  }

  // 6. Osteomyelitis / Septic Arthritis with PICC Barrier or AMA Risk: OVIVA Oral Step-Down & Dalbavancin (Urgent Eval)
  if (state.osteomyelitisPiccBarrierOrAmaRisk) {
    escalate('urgent_eval');
    flags.push({
      id: 'oviva_oral_stepdown_dalbavancin_protocol',
      severity: 'high',
      titleEn: 'Patient-Centered Bone/Joint Antimicrobial Strategy: NEJM OVIVA Oral Step-Down or 2-Dose Dalbavancin',
      titleEs: 'Estrategia Antimicrobiana Centrada en el Paciente: Terapia Oral OVIVA o Dalbavancina en 2 Dosis',
      descEn: 'HARM REDUCTION ANTIMICROBIAL DIRECTIVE: Do not coerce prolonged inpatient PICC confinement or discharge untreated! 1) Per the NEJM OVIVA Trial, transition after surgical source control to high-bioavailability oral regimens (e.g., Rifampin 300–450 mg PO BID + Levofloxacin, TMP-SMX, Doxycycline, or Clindamycin; or Linezolid 600 mg PO BID). 2) If oral adherence or housing is unstable, administer Dalbavancin 1,500 mg IV on Day 1 + 1,500 mg IV on Day 8 (provides 6 full weeks of bactericidal bone/joint coverage without a PICC line!).',
      descEs: 'DIRECTIVA ANTIMICROBIANA DE REDUCCIÓN DE DAÑOS: Evitar el alta sin tratamiento cuando el catéter PICC no es viable. 1) Según el ensayo OVIVA (NEJM), pasar tras el control del foco a antibióticos orales de alta biodisponibilidad (Rifampicina + Levofloxacino, TMP-SMX, Doxiciclina o Clindamicina; o Linezolid oral). 2) Si existen barreras de adherencia o vivienda, administrar Dalbavancina 1.500 mg IV el Día 1 + 1.500 mg IV el Día 8 (6 semanas de cobertura ósea sin PICC).',
    });
  }

  // 7. Chronic Groin Pain / Fragility Risk in Alcohol or Long-Term Opioid Use: Femoral Head AVN & OPIAD (Specialty Consult)
  if (state.chronicGroinPainAlcoholOrLongTermOpioids) {
    escalate('specialty_consult');
    flags.push({
      id: 'femoral_head_avn_opiad_osteoporosis_eval',
      severity: 'moderate',
      titleEn: 'Femoral Head Osteonecrosis (AVN) MRI Screening & Opioid Hypogonadal Osteoporosis (OPIAD) Protocol',
      titleEs: 'Cribado con RM por Osteonecrosis de Cabeza Femoral (NAV) y Osteoporosis Hipogonadal por Opioides (OPIAD)',
      descEn: 'ORTHOPEDIC & ENDOCRINE DIRECTIVE: Persistent groin/anterior thigh pain in alcohol or corticosteroid exposure requires a Bilateral Hip MRI even if plain hip X-rays are normal (catches Stage I–II Avascular Necrosis via the T2 "double-line sign" before femoral head collapse!). In chronic opioid/methadone therapy, screen for Opioid-Induced Androgen Deficiency (OPIAD) and osteoporosis with DEXA scan, 25-OH Vitamin D, calcium, and morning testosterone/estradiol.',
      descEs: 'DIRECTIVA ORTOPÉDICA Y ENDOCRINA: El dolor inguinal persistente en consumo de alcohol o corticoides exige una RM Bilateral de Caderas aunque la radiografía simple sea normal (detecta la Necrosis Avascular en Estadio I–II mediante el signo de la "doble línea" antes del colapso femoral). En terapia crónica con opioides/metadona, solicitar densitometría DEXA, 25-OH Vitamina D, calcio y testosterona/estradiol matutinos.',
    });
  }

  // Default Precautionary Guidance
  if (flags.length === 0) {
    flags.push({
      id: 'standard_orthopedic_precautions',
      severity: 'low',
      titleEn: 'Standard Musculoskeletal, Spine & Joint Harm Reduction Directives',
      titleEs: 'Directivas Estándar de Reducción de Daños Musculoesqueléticos, Espinales y Articulares',
      descEn: 'No acute spinal cord compression, septic joint, or necrotizing myositis red flags selected. Educate patients to seek immediate evaluation for any new midline back pain, swollen/hot joints (especially collarbone or hip), or deep woody muscle pain after skin-popping, and ensure Vitamin D + calcium supplementation on long-term MOUD.',
      descEs: 'Sin signos de alarma de compresión medular, artritis séptica o miositis necrosante seleccionados. Recomendar evaluación inmediata ante cualquier dolor nuevo en la línea media de la espalda, articulaciones inflamadas (especialmente clavícula o cadera) o dolor muscular profundo tras inyección subcutánea.',
    });
  }

  return { urgency, flags };
}

// ============================================================================
// ZERO-PII SBAR CLINICAL HANDOFF GENERATOR
// ============================================================================

export function formatOrthopedicSbarText(state = orthopedicRamState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateOrthopedicRisk(state);

  const urgencyLabel = {
    emergency_911: isEs ? 'EMERGENCIA NEUROQUIRÚRGICA / ORTOPÉDICA CRÍTICA (QUIRÓFANO / URGENCIAS INMEDIATA)' : 'CRITICAL NEUROSURGICAL / ORTHOPEDIC EMERGENCY (STAT OR / ED)',
    urgent_eval: isEs ? 'EVALUACIÓN HOSPITALARIA URGENTE' : 'URGENT HOSPITAL EVALUATION',
    specialty_consult: isEs ? 'INTERCONSULTA ORTOPÉDICA / INFECTOLÓGICA & AJUSTE TERAPÉUTICO' : 'SPECIALTY ORTHOPEDIC / ID CONSULTATION & REGIMEN ADJUSTMENT',
    precautionary: isEs ? 'DIRECTIVAS PREVENTIVAS DE SALUD MUSCULOESQUELÉTICA Y ESPINAL' : 'PRECAUTIONARY MUSCULOSKELETAL & SPINE DIRECTIVES',
  }[evalResult.urgency];

  const lines = [];
  lines.push('====================================================================');
  lines.push(isEs
    ? 'RESUMEN CLÍNICO SBAR HARBORPATH — COLUMNA, ORTOPEDIA E INFECCIONES ÓSEAS (ZERO-PII)'
    : 'HARBORPATH CLINICAL SBAR SUMMARY — SPINE, ORTHOPEDICS & BONE/JOINT INFECTIONS (ZERO-PII)');
  lines.push('====================================================================');
  lines.push(`${isEs ? 'Nivel de Agudeza' : 'Acuity Level'}: ${urgencyLabel}`);
  lines.push(`${isEs ? 'Aviso de Privacidad' : 'Privacy Notice'}: ${isEs ? '100% En Memoria RAM Efímera (Sin PII)' : '100% Ephemeral In-RAM (Zero PII)'}`);
  lines.push('');

  // SITUATION
  lines.push(isEs ? '[S] SITUACIÓN (SITUATION):' : '[S] SITUATION:');
  if (state.spinePainWithNeuroDeficitOrRetention) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Dolor espinal con déficit motor/sensitivo o retención urinaria — Sospecha de Absceso Epidural Espinal (AEE) Estadio 3–4.'
      : '  - CRITICAL ALERT: Spine pain with motor/sensory deficit or urinary retention — Suspected Stage 3–4 Spinal Epidural Abscess (SEA).');
  }
  if (state.deepMusclePainCrepitusLeukemoid) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Dolor muscular profundo, crepitación o reacción leucemoide — Sospecha de Mionecrosis Clostridial / Piomiositis (Regla Efecto Eagle: asociar Clindamicina).'
      : '  - CRITICAL ALERT: Deep muscle pain, crepitus, or leukemoid reaction — Suspected Clostridial Myonecrosis / Pyomyositis (Eagle Effect Rule: pair Clindamycin).');
  }
  if (state.sternoclavicularOrJointSwellingFever) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Tumefacción articular aguda o dolor esternoclavicular/sacroilíaco — Sospecha de Artritis Séptica Aguda (riesgo de mediastinitis en AEC).'
      : '  - CRITICAL ALERT: Acute joint swelling or sternoclavicular/sacroiliac pain — Suspected Acute Septic Arthritis (20% mediastinitis risk in SCJ).');
  }
  if (!state.spinePainWithNeuroDeficitOrRetention && !state.deepMusclePainCrepitusLeukemoid && !state.sternoclavicularOrJointSwellingFever) {
    lines.push(isEs
      ? '  - Evaluación de osteomielitis vertebral precoz, absceso del psoas, terapia oral OVIVA/Dalbavancina o salud ósea sin compresión medular aguda.'
      : '  - Evaluation for early vertebral osteomyelitis, iliopsoas abscess, OVIVA oral/Dalbavancin step-down, or bone health without acute cord compression.');
  }
  lines.push('');

  // BACKGROUND
  lines.push(isEs ? '[B] ANTECEDENTES Y FACTORES MUSCULOESQUELÉTICOS (BACKGROUND):' : '[B] BACKGROUND & MUSCULOSKELETAL FACTORS:');
  lines.push(`  - ${isEs ? 'Dolor Espinal en Línea Media sin Déficit (Trampa 15% AEE / OVN)' : 'New Midline Spine Pain Without Deficit (15% SEA / NVO Trap)'}: ${state.newMidlineSpinePainPwidNoNeuro ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push(`  - ${isEs ? 'Flexión Antálgica de Cadera + Signo del Psoas Positivo (Absceso Iliopsoas)' : 'Antalgic Hip Flexion + Positive Psoas Sign (Iliopsoas Abscess)'}: ${state.hipFlexionPainPositivePsoasSign ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push(`  - ${isEs ? 'Barrera para Catéter PICC / Riesgo AMA (Candidato a OVIVA Oral o Dalbavancina)' : 'PICC Line Barrier / AMA Risk (OVIVA Oral or Dalbavancin Candidate)'}: ${state.osteomyelitisPiccBarrierOrAmaRisk ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push(`  - ${isEs ? 'Dolor Inguinal Crónico en Alcohol/Opioides (NAV Cabeza Femoral / OPIAD)' : 'Chronic Groin Pain in Alcohol/Opioids (Femoral Head AVN / OPIAD)'}: ${state.chronicGroinPainAlcoholOrLongTermOpioids ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push('');

  // ASSESSMENT & RECOMMENDATIONS
  lines.push(isEs ? '[A/R] EVALUACIÓN Y DIRECTIVAS TERAPÉUTICAS (ASSESSMENT & RECOMMENDATIONS):' : '[A/R] ASSESSMENT & THERAPEUTIC DIRECTIVES:');
  evalResult.flags.forEach((f, idx) => {
    lines.push(`  ${idx + 1}. ${isEs ? f.titleEs : f.titleEn}`);
    lines.push(`     -> ${isEs ? f.descEs : f.descEn}`);
  });

  lines.push('====================================================================');
  return lines.join('\n');
}

// ============================================================================
// DOM VIEW RENDERER (WCAG 2.2 AA, ZERO INNERHTML, ZERO INLINE STYLE)
// ============================================================================

export function orthopedicCareView() {
  const container = h('div', { class: 'orthopedic-care-view view-container' });

  function render() {
    clear(container);
    const state = getOrthopedicState();
    const isEs = getLang() === 'es';

    // Header Banner
    const header = h('header', { class: 'orthopedic-header' }, [
      h('div', { class: 'orthopedic-badge-row' }, [
        h('span', { class: 'orthopedic-clinical-badge' }, isEs ? 'Columna, Ortopedia e Infecciones Osteoarticulares' : 'Spine, Orthopedics & Bone/Joint Infections'),
        h('span', { class: 'orthopedic-privacy-pill' }, isEs ? '100% En Memoria RAM · Sin PII' : '100% Ephemeral RAM · Zero PII'),
      ]),
      h('h1', { class: 'orthopedic-title' }, isEs
        ? 'Navegador de Absceso Epidural Espinal, Artritis Séptica, Piomiositis y Protocolo OVIVA'
        : 'Spinal Epidural Abscess, Septic Arthritis, Pyomyositis & OVIVA Bone/Joint Navigator'),
      h('p', { class: 'orthopedic-subtitle' }, isEs
        ? 'Soporte de decisiones clínicas (IDSA, AAOS y Ensayo NEJM OVIVA) para absceso epidural espinal (AEE), osteomielitis vertebral, artritis séptica esternoclavicular/sacroilíaca, absceso del psoas, mionecrosis clostridial, paso a vía oral OVIVA/dalbavancina y necrosis avascular de cadera.'
        : 'Evidence-based clinical decision support (IDSA, AAOS & NEJM OVIVA Trial) for spinal epidural abscess (SEA), vertebral osteomyelitis, sternoclavicular/sacroiliac septic arthritis, iliopsoas abscess, clostridial myonecrosis, OVIVA oral/dalbavancin step-down, and femoral head osteonecrosis.'),
    ]);
    container.appendChild(header);

    // Primary Tab Navigation
    const tabs = [
      { id: 'syndromes', labelEn: 'Spine, Joint & Muscle Syndromes', labelEs: 'Síndromes de Columna, Articulación y Músculo', iconName: 'activity' },
      { id: 'evaluator', labelEn: 'Clinical Triage & Risk Evaluator', labelEs: 'Triaje Clínico & Evaluador', iconName: 'clipboard' },
      { id: 'rules', labelEn: 'Field Orthopedic Safety Rules', labelEs: 'Reglas Ortopédicas de Campo', iconName: 'shield' },
      { id: 'sbar', labelEn: 'Clinical SBAR Note', labelEs: 'Nota Clínica SBAR', iconName: 'file-text' },
    ];

    const tabNav = h('nav', { class: 'orthopedic-tab-nav', role: 'tablist', 'aria-label': 'Orthopedic Care Sections' },
      tabs.map((tab) => {
        const isActive = state.activeTab === tab.id;
        const btn = h('button', {
          type: 'button',
          role: 'tab',
          class: `orthopedic-tab-btn ${isActive ? 'active' : ''}`,
          'aria-selected': isActive ? 'true' : 'false',
          'aria-controls': `tab-panel-${tab.id}`,
          id: `tab-btn-${tab.id}`,
        }, [
          icon(tab.iconName, { class: 'orthopedic-tab-icon' }),
          h('span', {}, isEs ? tab.labelEs : tab.labelEn),
        ]);
        btn.addEventListener('click', () => setOrthopedicState({ activeTab: tab.id }));
        return btn;
      })
    );
    container.appendChild(tabNav);

    // Tab Panel Container
    const panel = h('section', {
      class: 'orthopedic-tab-panel',
      role: 'tabpanel',
      id: `tab-panel-${state.activeTab}`,
      'aria-labelledby': `tab-btn-${state.activeTab}`,
    });
    container.appendChild(panel);

    // Render Content Based on Active Tab
    if (state.activeTab === 'syndromes') {
      renderSyndromesPanel(panel, isEs);
    } else if (state.activeTab === 'evaluator') {
      renderEvaluatorPanel(panel, state, isEs);
    } else if (state.activeTab === 'rules') {
      renderRulesPanel(panel, isEs);
    } else if (state.activeTab === 'sbar') {
      renderSbarPanel(panel, state, isEs);
    }

    // Educational Disclaimer Footer
    const footer = h('footer', { class: 'orthopedic-footer-notice' }, [
      icon('info', { class: 'orthopedic-footer-icon' }),
      h('p', {}, isEs
        ? 'Aviso Clínico: HarborPath proporciona pautas basadas en consensos de IDSA, AAOS y el ensayo NEJM OVIVA. No sustituye la RM de columna con contraste, artrocentesis, desbridamiento quirúrgico o valoración neuroquirúrgica de urgencia.'
        : 'Clinical Notice: HarborPath provides evidence-based guidelines from IDSA, AAOS, and the NEJM OVIVA Trial. It does not replace contrast spine MRI, synovial arthrocentesis, surgical debridement, or emergent neurosurgical evaluation.'),
    ]);
    container.appendChild(footer);
  }

  // Panel 1: Syndromes
  function renderSyndromesPanel(panel, isEs) {
    const intro = h('div', { class: 'orthopedic-panel-intro' }, [
      h('h2', {}, isEs ? 'Taxonomía de Infecciones Espinales, Osteoarticulares y Musculares Inducidas por Sustancias' : 'Substance-Associated Spine, Bone, Joint & Deep Muscle Syndromes Taxonomy'),
      h('p', {}, isEs
        ? 'Fisiopatología y directivas quirúrgicas y médicas para absceso epidural espinal, artritis séptica esternoclavicular/sacroilíaca, absceso del psoas, piomiositis, protocolo oral OVIVA/dalbavancina y necrosis avascular.'
        : 'Pathophysiology and surgical/medical directives for spinal epidural abscess, sternoclavicular/sacroiliac septic arthritis, iliopsoas abscess, pyomyositis, OVIVA oral/dalbavancin protocols, and avascular necrosis.'),
    ]);
    panel.appendChild(intro);

    const list = h('div', { class: 'orthopedic-syndromes-list' },
      Object.values(ORTHOPEDIC_SYNDROME_PROFILES).map((syndrome) => {
        return h('article', { class: 'orthopedic-syndrome-card' }, [
          h('h3', { class: 'orthopedic-syndrome-title' }, isEs ? syndrome.nameEs : syndrome.nameEn),
          h('div', { class: 'orthopedic-section' }, [
            h('strong', {}, isEs ? 'Mecanismo Fisiopatológico:' : 'Pathophysiologic Mechanism:'),
            h('p', {}, isEs ? syndrome.pathophysiologyEs : syndrome.pathophysiologyEn),
          ]),
          h('div', { class: 'orthopedic-section' }, [
            h('strong', {}, isEs ? 'Presentación Clínica y Manejo Crítico:' : 'Clinical Presentation & Critical Management:'),
            h('p', {}, isEs ? syndrome.clinicalPresentationEs : syndrome.clinicalPresentationEn),
          ]),
        ]);
      })
    );
    panel.appendChild(list);
  }

  // Panel 2: Evaluator
  function renderEvaluatorPanel(panel, state, isEs) {
    const intro = h('div', { class: 'orthopedic-panel-intro' }, [
      h('h2', {}, isEs ? 'Evaluador de Riesgo Espinal/Ortopédico y Triaje Neuroquirúrgico' : 'Spine & Orthopedic Risk Evaluator & Neurosurgical Triage'),
      h('p', {}, isEs
        ? 'Marque los hallazgos clínicos espinales, articulares o musculares para obtener la estratificación de agudeza y las directivas quirúrgicas y antimicrobianas.'
        : 'Select observed spinal, articular, or muscular signs to receive real-time acuity stratification and surgical/antimicrobial directives.'),
    ]);
    panel.appendChild(intro);

    const checklistItems = [
      { key: 'spinePainWithNeuroDeficitOrRetention', labelEn: 'Back/neck pain + leg/arm weakness, numbness, saddle anesthesia, or urinary retention (Stage 3–4 Spinal Epidural Abscess)', labelEs: 'Dolor de espalda/cuello + debilidad en extremidades, anestesia en silla de montar o retención urinaria (Absceso Epidural Espinal Estadio 3–4)' },
      { key: 'deepMusclePainCrepitusLeukemoid', labelEn: 'Agonizing deep muscle pain after skin-popping + crepitus, bullae, woody induration, or WBC > 50,000/mcL (Myonecrosis / Pyomyositis)', labelEs: 'Dolor muscular profundo tras "skin popping" + crepitación, ampollas, induración leñosa o leucocitos > 50.000/mcL (Mionecrosis / Piomiositis)' },
      { key: 'sternoclavicularOrJointSwellingFever', labelEn: 'Acute hot swollen joint or painful collarbone (sternoclavicular) / buttock (sacroiliac) swelling (Acute Septic Arthritis)', labelEs: 'Articulación caliente/inflamada o tumefacción dolorosa en clavícula (esternoclavicular) o glúteo (sacroilíaca) (Artritis Séptica)' },
      { key: 'newMidlineSpinePainPwidNoNeuro', labelEn: 'New focal midline back/neck percussion tenderness in a person who injects drugs without nerve deficits yet (15% SEA Triad Trap)', labelEs: 'Dolor nuevo a la percusión en línea media vertebral en usuario de vía parenteral aún sin déficit neurológico (Trampa del 15 % en AEE)' },
      { key: 'hipFlexionPainPositivePsoasSign', labelEn: 'Flank/groin pain + flexed hip posture + severe pain on passive hip extension (Iliopsoas Retroperitoneal Abscess)', labelEs: 'Dolor lumbar/inguinal + cadera en flexión antálgica + dolor intenso a la extensión pasiva (Absceso del Iliopsoas)' },
      { key: 'osteomyelitisPiccBarrierOrAmaRisk', labelEn: 'Confirmed osteomyelitis or septic arthritis with barrier to 6-week inpatient PICC line or AMA discharge risk (OVIVA Oral / Dalbavancin)', labelEs: 'Osteomielitis o artritis séptica con barrera para PICC hospitalario de 6 semanas o riesgo de alta voluntaria (OVIVA Oral / Dalbavancina)' },
      { key: 'chronicGroinPainAlcoholOrLongTermOpioids', labelEn: 'Persistent groin pain on weight-bearing (normal hip X-ray) in heavy alcohol use or chronic opioid therapy (Femoral Head AVN / OPIAD)', labelEs: 'Dolor inguinal persistente al apoyar peso (radiografía normal) en consumo de alcohol u opioides crónicos (NAV de Cabeza Femoral / OPIAD)' },
    ];

    const checklistForm = h('div', { class: 'orthopedic-evaluator-checklist' },
      checklistItems.map((item) => {
        const isChecked = !!state[item.key];
        const label = h('label', { class: `orthopedic-check-item ${isChecked ? 'selected' : ''}` }, [
          h('input', {
            type: 'checkbox',
            checked: isChecked,
            class: 'orthopedic-checkbox',
          }),
          h('span', { class: 'orthopedic-check-label' }, isEs ? item.labelEs : item.labelEn),
        ]);
        const input = label.querySelector('input');
        input.addEventListener('change', (e) => {
          setOrthopedicState({ [item.key]: e.target.checked });
        });
        return label;
      })
    );
    panel.appendChild(checklistForm);

    // Reset Button
    const resetBar = h('div', { class: 'orthopedic-evaluator-actions' }, [
      h('button', {
        type: 'button',
        class: 'orthopedic-reset-btn',
      }, [
        icon('rotate-ccw', { class: 'orthopedic-btn-icon' }),
        h('span', {}, isEs ? 'Restablecer Evaluación' : 'Reset Assessment'),
      ]),
    ]);
    resetBar.querySelector('button').addEventListener('click', () => resetOrthopedicState());
    panel.appendChild(resetBar);

    // Results Box
    const evalResult = evaluateOrthopedicRisk(state);
    const resultsContainer = h('div', { class: `orthopedic-eval-results acuity-${evalResult.urgency}` }, [
      h('div', { class: 'orthopedic-eval-urgency-badge' }, [
        icon(evalResult.urgency === 'emergency_911' ? 'alert-octagon' : evalResult.urgency === 'urgent_eval' ? 'alert-triangle' : 'info', { class: 'orthopedic-urgency-icon' }),
        h('span', { class: 'orthopedic-urgency-text' },
          evalResult.urgency === 'emergency_911'
            ? (isEs ? 'EMERGENCIA NEUROQUIRÚRGICA / ORTOPÉDICA CRÍTICA (LLAMAR AL 911 / CIRUGÍA INMEDIATA)' : 'CRITICAL NEUROSURGICAL / ORTHOPEDIC EMERGENCY (CALL 911 / STAT SURGERY)')
            : evalResult.urgency === 'urgent_eval'
            ? (isEs ? 'EVALUACIÓN HOSPITALARIA URGENTE & PROTOCOLO INDICADO' : 'URGENT HOSPITAL EVALUATION & PROTOCOL REQUIRED')
            : evalResult.urgency === 'specialty_consult'
            ? (isEs ? 'INTERCONSULTA ORTOPÉDICA & AJUSTE TERAPÉUTICO' : 'SPECIALTY ORTHOPEDIC CONSULTATION & REGIMEN ADJUSTMENT')
            : (isEs ? 'DIRECTIVAS PREVENTIVAS DE SALUD ESPINAL Y ORTOPÉDICA' : 'PRECAUTIONARY SPINE & ORTHOPEDIC DIRECTIVES')
        ),
      ]),
      h('div', { class: 'orthopedic-eval-flags-list' },
        evalResult.flags.map((flag) => {
          return h('div', { class: 'orthopedic-flag-item' }, [
            h('h4', { class: 'orthopedic-flag-title' }, isEs ? flag.titleEs : flag.titleEn),
            h('p', { class: 'orthopedic-flag-desc' }, isEs ? flag.descEs : flag.descEn),
          ]);
        })
      ),
    ]);
    panel.appendChild(resultsContainer);
  }

  // Panel 3: Rules
  function renderRulesPanel(panel, isEs) {
    const intro = h('div', { class: 'orthopedic-panel-intro' }, [
      h('h2', {}, isEs ? 'Directivas de Seguridad Espinal/Ortopédica y Reducción de Daños de Campo' : 'Field Spine & Orthopedic Safety & Harm Reduction Directives'),
      h('p', {}, isEs
        ? 'Seis reglas clínicas fundamentales para prevenir paraplejía por absceso epidural espinal, mediastinitis esternoclavicular, choque por mionecrosis clostridial y colapso de cabeza femoral.'
        : 'Six essential clinical directives to prevent paraplegia from spinal epidural abscess, sternoclavicular mediastinitis, clostridial myonecrosis shock, and femoral head collapse.'),
    ]);
    panel.appendChild(intro);

    const rulesList = h('div', { class: 'orthopedic-directives-grid' },
      ORTHOPEDIC_HARM_REDUCTION_RULES.map((rule) => {
        return h('article', { class: 'orthopedic-directive-card' }, [
          h('div', { class: 'orthopedic-directive-num' }, `0${rule.ruleNum}`),
          h('h3', { class: 'orthopedic-directive-title' }, isEs ? rule.titleEs : rule.titleEn),
          h('p', { class: 'orthopedic-directive-text' }, isEs ? rule.detailEs : rule.detailEn),
        ]);
      })
    );
    panel.appendChild(rulesList);
  }

  // Panel 4: SBAR Note
  function renderSbarPanel(panel, state, isEs) {
    const intro = h('div', { class: 'orthopedic-panel-intro' }, [
      h('h2', {}, isEs ? 'Generador de Traspaso Clínico SBAR (Zero-PII)' : 'Zero-PII SBAR Clinical Handoff Note Generator'),
      h('p', {}, isEs
        ? 'Genere una nota clínica estructurada en formato SBAR (Situación, Antecedentes, Evaluación, Recomendación) para Neurocirugía, Cirugía Ortopédica, Enfermedades Infecciosas y Urgencias. 100% en memoria RAM.'
        : 'Generate a structured SBAR clinical handoff note (Situation, Background, Assessment, Recommendation) for Neurosurgery, Orthopedic Surgery, Infectious Disease, and Emergency Medicine. Stored 100% in ephemeral RAM.'),
    ]);
    panel.appendChild(intro);

    const sbarText = formatOrthopedicSbarText(state, isEs ? 'es' : 'en');

    const copyBtn = h('button', {
      type: 'button',
      class: 'orthopedic-copy-btn',
    }, [
      icon(state.sbarCopied ? 'check' : 'copy', { class: 'orthopedic-btn-icon' }),
      h('span', {}, state.sbarCopied
        ? (isEs ? '¡Copiado al Portapapeles!' : 'Copied to Clipboard!')
        : (isEs ? 'Copiar Informe SBAR' : 'Copy SBAR Note')
      ),
    ]);

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sbarText);
        setOrthopedicState({ sbarCopied: true });
        setTimeout(() => setOrthopedicState({ sbarCopied: false }), 2500);
      } catch (err) {
        console.error('Failed to copy SBAR text:', err);
      }
    });

    const actionContainer = h('div', { class: 'orthopedic-sbar-actions' }, [copyBtn]);
    panel.appendChild(actionContainer);

    const sbarBox = h('pre', { class: 'orthopedic-sbar-output', 'aria-label': 'SBAR Clinical Output' }, sbarText);
    panel.appendChild(sbarBox);
  }

  render();
  const unsubscribe = subscribeOrthopedicState(render);

  return container;
}
