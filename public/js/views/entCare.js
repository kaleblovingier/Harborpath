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
 * Wave 52 (Track A): Otolaryngology, Deep Neck Space Infections, Upper Airway
 * Thermal/Cryogenic Injury & Intranasal Harm Reduction Navigator (#/ent-care)
 *
 * Zero-PII, 100% ephemeral in-RAM clinical decision support covering:
 *  1. Ludwig Angina & Deep Neck Space Infections (Submandibular/Retropharyngeal/Danger Space)
 *  2. Lemierre Syndrome (Septic Internal Jugular Vein Thrombophlebitis & Septic Pulmonary Emboli)
 *  3. Cocaine-Induced Midline Destructive Lesions (CIMDL), Septal Perforation & Hard Palate Fistula
 *  4. "Crack Pipe" Thermal Supraglottitis, Epiglottitis & Hot Metal Mesh ("Chore Boy") Aspiration
 *  5. Nitrous Oxide (N2O) & Volatile Refrigerant Cryogenic Oropharyngeal/Laryngeal Frostbite
 *  6. Intranasal Harm Reduction, HCV Straw Transmission Prevention & Rhinitis Medicamentosa
 */

export const ENT_SYNDROME_PROFILES = Object.freeze({
  ludwig_angina_deep_neck: Object.freeze({
    id: 'ludwig_angina_deep_neck',
    urgency: 'EMERGENCY',
    badgeEn: 'STAT AWAKE FIBEROPTIC AIRWAY — NEVER LAY SUPINE',
    badgeEs: 'VÍA AÉREA FIBROÓPTICA DESPIERTO STAT — NUNCA ACOSTADO',
    titleEn: 'Ludwig Angina & Deep Neck Space Infections (Submandibular, Retropharyngeal & Danger Space)',
    titleEs: 'Angina de Ludwig e Infecciones Profundas del Cuello (Submandibular, Retrofaríngeo y Espacio Peligroso)',
    summaryEn:
      'Rapidly progressive, bilateral gangrenous cellulitis of the submandibular, sublingual, and submental spaces (Ludwig angina) or retropharyngeal/carotid space abscess. Precipitated by mandibular 2nd/3rd molar odontogenic infections ("meth mouth" caries extending below the mylohyoid ridge) or internal jugular ("pocket shot") neck injection.',
    summaryEs:
      'Celulitis bilateral rápidamente progresiva de los espacios submandibular, sublingual y submentoniano (angina de Ludwig) o absceso retrofaríngeo/carotídeo. Precipitada por infecciones odontogénicas del 2.º/3.º molar mandibular o inyección cervical en vena yugular interna.',
    pathophysiologyEn:
      'Polymicrobial oral flora (Streptococcus anginosus/viridans, Fusobacterium, Prevotella, Bacteroides) and S. aureus/MRSA spread across fascial planes without lymphadenopathy. Floor-of-mouth edema displaces the tongue superiorly and posteriorly against the hypopharynx, while caudal spread via the retropharyngeal "alar" or Danger Space (Space 4) causes acute descending necrotizing mediastinitis (40% mortality).',
    pathophysiologyEs:
      'Flora oral polimicrobiana (Streptococcus anginosus, Fusobacterium, Prevotella, Bacteroides) y S. aureus/MRSA invaden planos fasciales. El edema del piso de la boca desplaza la lengua hacia arriba y atrás obstruyendo la hipofaringe, y el descenso por el "Espacio Peligroso" causa mediastinitis necrosante descendente.',
    diagnosticsEn: [
      'Cardinal Airway Red Flags: "Woody" brawny bilateral floor-of-mouth induration, tongue elevation/protrusion, drooling (inability to swallow secretions), trismus (< 2 cm inter-incisor opening), muffled "hot potato" voice, tripod posture, and inspiratory stridor.',
      'CRITICAL POSITIONING RULE: NEVER force a patient with Ludwig angina or stridor to lie flat (supine) for a CT scan before securing the airway—supine positioning causes immediate complete pharyngeal collapse and asphyxial arrest!',
      'Contrast-Enhanced CT Neck & Chest (ONLY after airway is verified stable or intubated): Identifies rim-enhancing drainable abscess vs phlegmon, gas, internal jugular thrombosis, and descending mediastinitis.',
      'Blood Cultures x2, CBC, Lactate, and Dental/Panorex evaluation once stabilized.'
    ],
    diagnosticsEs: [
      'Signos cardinales de alarma de vía aérea: Induración bilateral "leñosa" del piso de la boca, elevación/protrusión lingual, sialorrea, trismo (< 2 cm), voz en "papa caliente", posición en trípode y estridor inspiratorio.',
      'REGLA CRÍTICA DE POSICIÓN: NUNCA acostar en decúbito supino para una TC a un paciente con angina de Ludwig o estridor antes de asegurar la vía aérea; el decúbito provoca colapso faríngeo total y paro asfíctico.',
      'TC de Cuello y Tórax con Contraste IV (SOLO con vía aérea asegurada): Identifica abscesos drenables, gas, trombosis yugular y mediastinitis descendente.',
      'Hemocultivos x2, hemograma, lactato y evaluación odontológica.'
    ],
    managementEn: [
      'Airway First (Double-Setup in OR or Resuscitation Bay): Keep patient upright (sitting). Perform Awake Fiberoptic Nasotracheal Intubation with ENT/Trauma Surgery scrubbed at bedside ready for immediate Awake Tracheostomy or Cricothyrotomy. Avoid blind rapid-sequence paralytics (succinylcholine/rocuronium) that abolish pharyngeal tone and create a "Cannot Intubate, Cannot Oxygenate" (CICO) catastrophe.',
      'Empiric Broad-Spectrum IV Antibiotics: IV Ampicillin-Sulbactam (3 g IV q6h) OR Piperacillin-Tazobactam (4.5 g IV q6h) OR Ceftriaxone + Metronidazole — PLUS IV Vancomycin (or Linezolid) for MRSA coverage in PWID.',
      'Adjunctive Airway Edema Reduction: IV Dexamethasone (10 mg IV stat, then 4–8 mg IV q6h) + nebulized racemic epinephrine as a bridge to definitive airway control (never as a substitute).',
      'Surgical Decompression & Source Control: Early transcervical/intraoral incision and drainage of submandibular/retropharyngeal collections + extraction of offending necrotic mandibular molars.'
    ],
    managementEs: [
      'Vía Aérea Primero (Doble Preparación en Quirófano/Choque): Mantener al paciente sentado. Realizar Intubación Nasotraqueal Fibroóptica Despierto con ORL/Cirugía lista para Traqueostomía Despierto o Cricotiroidotomía. Evitar paralíticos a ciegas que colapsan el tono faríngeo.',
      'Antibióticos IV de Amplio Espectro: Ampicilina-Sulbactam IV (3 g c/6h) O Piperacilina-Tazobactam (4.5 g c/6h) O Ceftriaxona + Metronidazol — MÁS Vancomicina IV (o Linezolid) para cubrir MRSA en PID.',
      'Reducción Coadyuvante del Edema: Dexametasona IV (10 mg IV stat, luego 4–8 mg c/6h) como puente hacia el control definitivo de la vía aérea.',
      'Descompresión Quirúrgica: Drenaje quirúrgico transcervical/intraoral y extracción de molares mandibulares necróticos.'
    ],
    harmReductionEn:
      'Provide low-barrier access to trauma-informed dental care, high-fluoride 5,000 ppm toothpaste, and silver diamine fluoride (SDF) to arrest mandibular molar caries before deep submandibular space invasion occurs.',
    harmReductionEs:
      'Brindar acceso odontológico sin barreras, pasta dental con 5,000 ppm de flúor y fluoruro diamino de plata (SDF) para detener caries molares antes de que invadan el espacio submandibular.'
  }),

  lemierre_ijv_thrombophlebitis: Object.freeze({
    id: 'lemierre_ijv_thrombophlebitis',
    urgency: 'EMERGENCY',
    badgeEn: 'SEPTIC INTERNAL JUGULAR THROMBOPHLEBITIS + SEPTIC EMBOLI',
    badgeEs: 'TROMBOFLEBITIS SÉPTICA YUGULAR INTERNA + ÉMBOLOS SÉPTICOS',
    titleEn: 'Lemierre Syndrome (Septic Internal Jugular Vein Thrombophlebitis & Septic Emboli)',
    titleEs: 'Síndrome de Lemierre (Tromboflebitis Séptica de la Vena Yugular Interna y Émbolos Sépticos)',
    summaryEn:
      'Suppurative thrombophlebitis of the Internal Jugular Vein (IJV) with bacteremia and metastatic septic pulmonary/joint emboli. Caused either by direct cervical/jugular vein injection ("pocket shot" — predominantly S. aureus/MRSA and Streptococci) or oropharyngeal infection extending into the carotid sheath (Fusobacterium necrophorum).',
    summaryEs:
      'Tromboflebitis supurativa de la Vena Yugular Interna (VYI) con bacteriemia y émbolos sépticos pulmonares/articulares. Causada por inyección directa en vena yugular ("pocket shot" — S. aureus/MRSA y estreptococos) o extensión orofaríngea (Fusobacterium necrophorum).',
    pathophysiologyEn:
      'Direct venipuncture of the internal jugular vein or contiguous tonsillar/odontogenic inflammation infects the carotid sheath, producing an infected thrombus inside the IJV. Infected clot fragments embolize directly through the right heart into the pulmonary arteries (causing cavitary pneumonia and empyema) and seed sternoclavicular/peripheral joints.',
    pathophysiologyEs:
      'La punción directa de la vena yugular interna o la extensión amigdalina infecta la vaina carotídea, formando un trombo séptico en la VYI que emboliza hacia los pulmones (nódulos cavitados, empiema) y articulaciones esternoclaviculares.',
    diagnosticsEn: [
      'Clinical Triad: (1) Unilateral neck pain, swelling, or palpable tender "cord sign" along the anterior border of the sternocleidomastoid muscle; (2) High spiking fevers/rigors; (3) Pleuritic chest pain, dyspnea, or hemoptysis from septic pulmonary emboli.',
      'Contrast-Enhanced CT of the Neck & Chest (or Neck Duplex Ultrasound): Demonstrates intraluminal filling defect / thrombus in the Internal Jugular Vein with perivenous rim enhancement plus bilateral peripheral wedge-shaped or cavitary pulmonary nodules.',
      'Blood Cultures x2–3 (Anaerobic + Aerobic bottles): Essential to isolate Fusobacterium necrophorum (gram-negative obligate anaerobe) and MRSA/Streptococci.'
    ],
    diagnosticsEs: [
      'Tríada Clínica: (1) Dolor y tumefacción cervical unilateral ("signo del cordón" en el borde anterior del esternocleidomastoideo); (2) Fiebre alta en picos y escalofríos; (3) Dolor torácico pleurítico o hemoptisis por émbolos sépticos pulmonares.',
      'TC de Cuello y Tórax con Contraste IV (o Ecografía Doppler Cervical): Defecto de llenado intraluminal (trombo) en la Vena Yugular Interna más nódulos pulmonares periféricos cavitados.',
      'Hemocultivos x2–3 (frascos aerobios y anaerobios): Esencial para aislar Fusobacterium necrophorum y MRSA/estreptococos.'
    ],
    managementEn: [
      'Empiric IV Antimicrobial Regimen (4–6 Weeks Total): IV Vancomycin (for MRSA in jugular injection) PLUS Piperacillin-Tazobactam (4.5 g IV q6h) OR Ceftriaxone + Metronidazole (500 mg IV q8h) OR Carbapenem. CRITICAL PHARMACOLOGY RULE: Fusobacterium necrophorum produces beta-lactamases and is intrinsically resistant to macrolides, fluoroquinolones, tetracyclines, and aminoglycosides—never use penicillin monotherapy or macrolides!',
      'Targeted Anticoagulation Decision: Initiate therapeutic anticoagulation (LMWH / Heparin) if the septic thrombus extends retrogradely into the cerebral sigmoid/cavernous sinuses, if there is propagating clot despite 48–72 hours of antibiotics, or extensive pulmonary embolism.',
      'Screen for Concurrent Right-Sided Tricuspid Endocarditis (TTE/TEE) and Sternoclavicular Septic Arthritis.'
    ],
    managementEs: [
      'Régimen Antimicrobiano IV Empírico (4–6 Semanas): Vancomicina IV (para MRSA en inyección yugular) MÁS Piperacilina-Tazobactam (4.5 g c/6h) O Ceftriaxona + Metronidazol (500 mg c/8h). REGLA FARMACOLÓGICA: Fusobacterium necrophorum produce betalactamasas y es resistente a macrolidos, quinolonas y aminoglucósidos.',
      'Decisión de Anticoagulación: Iniciar anticoagulación terapéutica (HBPM / Heparina) si el trombo se extiende hacia los senos venosos cerebrales (sigmoideo/cavernoso) o progresa pese a 48–72 h de antibióticos.',
      'Descartar Endocarditis Tricuspídea Derecha (ETT/ETE) y Artritis Séptica Esternoclavicular.'
    ],
    harmReductionEn:
      'Neck/jugular ("pocket shot") injection carries the highest immediate risk of carotid artery stroke, pneumothorax (cupula of lung), vocal cord paralysis, and Lemierre syndrome. Prioritize rapid MOUD stabilization and non-injection transition.',
    harmReductionEs:
      'La inyección cervical/yugular conlleva riesgo extremo de EVC carotídeo, neumotórax apical, parálisis de cuerdas vocales y síndrome de Lemierre. Priorizar estabilización rápida con TMO.'
  }),

  cimdl_septal_perforation: Object.freeze({
    id: 'cimdl_septal_perforation',
    urgency: 'URGENT',
    badgeEn: 'SEPTAL BUTTON / PALATAL OBTURATOR — DEFER SURGICAL GRAFT WHILE ACTIVE',
    badgeEs: 'BOTÓN SEPTAL / OBTURADOR PALATINO — DIFERIR CIRUGÍA EN CONSUMO ACTIVO',
    titleEn: 'Cocaine-Induced Midline Destructive Lesions (CIMDL), Septal Perforation & Hard Palate Fistula',
    titleEs: 'Lesiones Destructivas de Línea Media por Cocaína (CIMDL), Perforación Septal y Fístula Palatina',
    summaryEn:
      'Progressive ischemic necrosis of the cartilaginous nasal septum, turbinates, ethmoid sinuses, and hard/soft palate caused by chronic intranasal cocaine, crushed prescription tablets, or levamisole-adulterated cocaine.',
    summaryEs:
      'Necrosis isquémica progresiva del tabique nasal cartilaginoso, cornetes, etmoides y paladar duro/blando causada por consumo intranasal crónico de cocaína, pastillas trituradas o cocaína adulterada con levamisol.',
    pathophysiologyEn:
      'The nasal septal cartilage is avascular and relies entirely on diffusion from the overlying mucoperichondrium (Kiesselbach plexus). Intranasal cocaine triggers intense alpha-1 vasoconstriction, chemical trauma from adulterants (levamisole, phenacetin, talc), and anti-human neutrophil elastase (anti-HNE) / dual p-ANCA + c-ANCA apoptosis, destroying cartilage, bone, and palate (mimicking Granulomatosis with Polyangiitis [GPA]).',
    pathophysiologyEs:
      'El cartílago septal es avascular y depende del mucopericondrio. La cocaína intranasal causa vasoconstricción alfa-1 extrema, trauma químico por adulterantes (levamisol, talco) y apoptosis mediada por ANCA anti-elastasa de neutrófilos (anti-HNE), destruyendo cartílago y paladar (simulando Granulomatosis con Poliangeítis [GPA]).',
    diagnosticsEn: [
      'Anterior Rhinoscopy / Nasal Endoscopy: Thick hemorrhagic crusting, whistling during inspiration, through-and-through cartilaginous/bony septal defect, saddle-nose collapse, or midline hard-palate oronasal fistula (presenting with nasal regurgitation of liquids and hypernasal speech / rhinolalia aperta).',
      'CIMDL vs. Granulomatosis with Polyangiitis (GPA) Differential: Both can be PR3-ANCA or MPO-ANCA positive! Human Neutrophil Elastase (HNE) ANCA is specific for CIMDL/levamisole, whereas renal glomerulonephritis or pulmonary nodules point to systemic GPA or levamisole vasculitis.',
      'Nasal Swab Culture (S. aureus/MRSA, Pseudomonas, fungal) and biopsy of necrotic edge if NK/T-cell nasal lymphoma or invasive fungal sinusitis is suspected.'
    ],
    diagnosticsEs: [
      'Rinoscopia Anterior / Endoscopia Nasal: Costras hemorrágicas gruesas, silbido nasal al inspirar, perforación septal, nariz en silla de montar o fístula oronasal en el paladar duro (regurgitación nasal de líquidos y voz hipernasal).',
      'Diferencial CIMDL vs. Granulomatosis con Poliangeítis (GPA): Ambos pueden ser ANCA positivos; los anticuerpos anti-elastasa de neutrófilos humanos (anti-HNE) son específicos de CIMDL/levamisol.',
      'Cultivo nasal (MRSA, Pseudomonas, hongos) y biopsia del borde si se sospecha linfoma nasal NK/T o sinusitis fúngica invasiva.'
    ],
    managementEn: [
      'CARDINAL SURGICAL RECONSTRUCTION RULE: Elective surgical septal repair (mucosal advancement flaps) or palatal flap reconstruction is STRICTLY CONTRAINDICATED during active intranasal cocaine use—ongoing vasoconstriction causes 100% flap ischemia and graft failure. Documented abstinence (typically >= 6–12 months) is required before surgical flap repair.',
      'Immediate Non-Surgical Prosthetic Rehabilitation: (1) Place a custom or prefabricated Silastic Nasal Septal Button Prosthesis to eliminate whistling, reduce crusting, and restore laminar nasal airflow; (2) Fit a Removable Maxillary Palatal Obturator Prosthesis (via Prosthodontics/Dentistry) for hard-palate fistulas—immediately restores normal swallowing and intelligible speech without surgery!',
      'Daily Mucosal Debridement & Hydration Regimen: High-volume isotonic sterile saline nasal irrigations 2–4x/day + topical bland emollients (petrolatum, sesame oil, or Vitamin E gel) + topical Mupirocin 2% ointment for S. aureus crusting.',
      'Avoid immunosuppressive cyclophosphamide/rituximab unless true systemic vasculitis (renal/pulmonary GPA) is proven.'
    ],
    managementEs: [
      'REGLA QUIRÚRGICA CARDINAL: La reconstrucción quirúrgica con colgajos septales o palatinos está ESTRICTAMENTE CONTRAINDICADA durante el consumo intranasal activo de cocaína (la vasoconstricción causa 100% de necrosis del colgajo). Se requiere abstinencia sostenida (>= 6–12 meses) antes de cirugía reconstructiva.',
      'Rehabilitación Protésica Inmediata No Quirúrgica: (1) Colocar un Botón Septal de Silastic para eliminar el silbido y reducir costras; (2) Adaptar una Prótesis Obturadora Palatina Maxilar removible en fístulas del paladar duro: restaura de inmediato la deglución sin regurgitación nasal y el habla normal.',
      'Cuidado Mucoso Diario: Irrigaciones nasales con solución salina estéril isotónica 2–4 veces/día + emolientes tópicos (vaselina, gel de vitamina E) + Mupirocina tópica al 2% para colonización por S. aureus.',
      'Evitar inmunosupresión agresiva salvo vasculitis sistémica renal/pulmonar comprobada.'
    ],
    harmReductionEn:
      'Counsel patients who insufflate substances to rinse nasal passages with sterile saline 10–15 minutes after use, apply petrolatum/Vitamin E barrier ointment, and never pick adherent nasal crusts (which strips the remaining mucoperichondrium).',
    harmReductionEs:
      'Aconsejar realizar lavados con solución salina estéril 10–15 minutos después de inhalar polvos, aplicar vaselina/vitamina E y nunca arrancar las costras nasales adheridas.'
  }),

  thermal_supraglottitis_epiglottitis: Object.freeze({
    id: 'thermal_supraglottitis_epiglottitis',
    urgency: 'EMERGENCY',
    badgeEn: 'THERMAL EPIGLOTTITIS / CHORE BOY MESH BURN — AIRWAY WATCH',
    badgeEs: 'EPIGLOTITIS TÉRMICA / QUEMADURA POR MALLA METÁLICA — VIGILAR VÍA AÉREA',
    titleEn: '"Crack Pipe" Thermal Supraglottitis, Epiglottitis & Hot Metal Mesh ("Chore Boy") Aspiration',
    titleEs: 'Supraglotitis y Epiglotitis Térmica por Pipa de Crack y Aspiración de Malla Metálica ("Chore Boy")',
    summaryEn:
      'Acute thermal burn and rapidly progressive supraglottic/uvular edema caused by inhaling superheated vapors or incandescent copper/steel scouring pad fragments ("Chore Boy" filter) from short glass crack or methamphetamine pipes.',
    summaryEs:
      'Quemadura térmica aguda y edema supraglótico/uvular rápidamente progresivo por inhalar vapores sobrecalentados o fragmentos incandescentes de malla de cobre/acero ("Chore Boy") de pipas cortas de crack o metanfetamina.',
    pathophysiologyEn:
      'When a metal mesh filter is loosely packed or overheated with a torch lighter, glowing metal fragments or > 200°C alkaline vapors impact the posterior pharyngeal wall, uvula (Quincke edema), aryepiglottic folds, and lingual surface of the epiglottis. Submucosal capillary leak and secondary Streptococcus/Staphylococcus superinfection cause life-threatening upper airway obstruction within 2–12 hours.',
    pathophysiologyEs:
      'Cuando el filtro metálico se sobrecalienta con soplete o se suelta, fragmentos incandescentes o vapores > 200 °C impactan la úvula (edema de Quincke), repliegues aritenoepiglóticos y epiglotis, provocando obstrucción supraglótica aguda en 2–12 horas.',
    diagnosticsEn: [
      'Clinical Presentation: Sudden burning throat pain after smoking, severe odynophagia, drooling, muffled "hot potato" voice, swollen cherry-red or white-sloughing uvula, and stridor.',
      'Soft-Tissue Lateral Neck Radiograph (only if stable): Classic "Thumbprint Sign" (swollen, rounded epiglottis) and "Vallecula Sign", plus possible radiopaque foreign body (copper mesh fragment) in the piriform sinus or glottis.',
      'Flexible Fiberoptic Nasolaryngoscopy (performed gently in upright position by ENT/ED with airway setup): Direct visualization of mucosal charring, cherry-red edematous epiglottis/arytenoids, and foreign mesh removal.'
    ],
    diagnosticsEs: [
      'Presentación Clínica: Dolor faríngeo urente súbito tras fumar, odinofagia severa, sialorrea, voz apagada, úvula edematosa o con esfacelo blanco y estridor.',
      'Radiografía Lateral de Cuello para Partes Blandas (si está estable): Clásico "Signo del Pulgar" (epiglotis engrosada) y posible cuerpo extraño metálico radiopaco en seno piriforme.',
      'Nasolaringoscopia Fibroóptica Flexible (en posición sentada con equipo de vía aérea listo): Visualización directa de quemadura mucosa, edema epiglótico y extracción de malla metálica.'
    ],
    managementEn: [
      'Immediate Airway Protection & ICU Monitoring: Maintain upright posture. Administer humidified oxygen, nebulized racemic epinephrine, and IV Dexamethasone (10 mg IV stat, then 4 mg IV q6h). Intubate early via awake fiberoptic/videolaryngoscopy before stridor progresses to complete glottic closure.',
      'Empiric IV Antibiotics for Secondary Infectious Epiglottitis: Thermal mucosal sloughing is rapidly colonized by Streptococcus pyogenes, S. pneumoniae, S. aureus, and H. influenzae—administer IV Ceftriaxone (2 g IV daily) + IV Vancomycin (or Ampicillin-Sulbactam + Vancomycin).',
      'Endoscopic Foreign Body Retrieval: Remove any embedded copper/steel wire mesh from the hypopharynx or larynx under direct visualization.'
    ],
    managementEs: [
      'Protección Inmediata de Vía Aérea y Monitoreo en UCI: Mantener sentado. Administrar oxígeno humidificado, epinefrina racémica nebulizada y Dexametasona IV (10 mg stat). Intubar precozmente con fibroscopio/videolaringoscopio si hay estridor.',
      'Antibióticos IV por Epiglotitis Secundaria: La mucosa quemada se coloniza por Streptococcus, S. aureus y H. influenzae; administrar Ceftriaxona IV (2 g c/24h) + Vancomicina IV.',
      'Extracción Endoscópica de Cuerpo Extraño: Retirar fragmentos de alambre de cobre/acero bajo visión directa.'
    ],
    harmReductionEn:
      'Distribute safer smoking kits containing long heat-resistant borosilicate (Pyrex) stems, silicone mouthpieces (to prevent lip burns), and heavy-gauge brass screens instead of toxic, fragmenting copper scouring pads ("Chore Boy"), and advise using standard lighters rather than butane torch lighters.',
    harmReductionEs:
      'Distribuir kits de fumar seguro con pipas largas de vidrio borosilicato (Pyrex), boquillas de silicona y rejillas de latón grueso en lugar de estropajos de cobre ("Chore Boy"), evitando encendedores tipo soplete.'
  }),

  cryogenic_airway_frostbite: Object.freeze({
    id: 'cryogenic_airway_frostbite',
    urgency: 'EMERGENCY',
    badgeEn: 'CRYOGENIC LARYNGEAL FROSTBITE — DELAYED 4–12h EDEMA WATCH',
    badgeEs: 'CONGELACIÓN LARÍNGEA CRIOGÉNICA — VIGILAR EDEMA TARDÍO 4–12h',
    titleEn: 'Nitrous Oxide (N2O) & Volatile Refrigerant Cryogenic Airway Frostbite',
    titleEs: 'Congelación Criogénica Orofaríngea y Laríngea por Óxido Nitroso (N2O) y Gases Refrigerantes',
    summaryEn:
      'Severe third-degree cryogenic frostbite of the lips, tongue, hard/soft palate, uvula, and larynx caused by inhaling compressed Nitrous Oxide ("Galaxy Gas" cylinders / whippet chargers) or difluoroethane ("computer duster") directly from the nozzle without a balloon.',
    summaryEs:
      'Congelación criogénica severa de labios, lengua, paladar, úvula y laringe causada por inhalar Óxido Nitroso comprimido (cilindros / cápsulas) o difluoroetano ("aire comprimido") directamente de la válvula sin usar un globo.',
    pathophysiologyEn:
      'Rapid decompression of pressurized liquid N2O or halogenated propellants absorbs massive latent heat of vaporization (Joule-Thomson / adiabatic expansion effect), dropping the nozzle and gas stream temperature to -40°C to -55°C (-40°F to -67°F). Direct tissue freezing causes immediate ice-crystal cellular lysis followed by explosive reperfusion angioedema of the uvula and supraglottis over 4–12 hours, plus barotrauma (pneumomediastinum / pneumothorax).',
    pathophysiologyEs:
      'La descompresión rápida de N2O líquido presurizado cae a -40 °C a -55 °C (efecto Joule-Thomson). El congelamiento directo causa lisis celular por cristales de hielo seguida de angioedema explosivo por reperfusión en úvula y supraglotis a las 4–12 horas, además de barotrauma (neumomediastino).',
    diagnosticsEn: [
      'Oral & Airway Exam: White, waxy, insensate frostbite plaques on the lips/palate that rapidly evolve into hemorrhagic bullae, massive uvular swelling, drooling, dysphagia, and hoarseness/stridor.',
      'Mandatory Delayed-Edema Observation (Minimum 6–12 Hours): Early mild throat soreness frequently progresses to life-threatening laryngeal obstruction 4–12 hours later as frozen tissue thaws and swells!',
      'Chest & Neck X-Ray: Screen for subcutaneous emphysema, pneumomediastinum (Hamman crunch), or pneumothorax from high-pressure tank barotrauma.'
    ],
    diagnosticsEs: [
      'Examen Oral y de Vía Aérea: Placas blancas cerosas e insensibles en labios/paladar que evolucionan a flictenas hemorrágicas, edema uvular masivo, sialorrea y disfonía/estridor.',
      'Observación Obligatoria por Edema Tardío (Mínimo 6–12 Horas): El dolor faríngeo leve inicial suele progresar a obstrucción laríngea crítica 4–12 horas después al descongelarse el tejido.',
      'Radiografía de Cuello y Tórax: Descartar enfisema subcutáneo, neumomediastino o neumotórax por barotrauma de alta presión.'
    ],
    managementEn: [
      'Early Airway Securement: Have ENT and anesthesia evaluate early via flexible nasolaryngoscopy; intubate with a smaller-diameter endotracheal tube (6.0–6.5 mm) if supraglottic or vocal cord edema is progressing.',
      'Anti-Inflammatory & Mucosal Protocol: IV Dexamethasone (8–10 mg IV q6–8h), cool/room-temperature sterile saline oral rinses, IV opioid/multimodal analgesia, and prophylactic Ampicillin-Sulbactam or Amoxicillin-Clavulanate for deep necrotic mucosal sloughing.',
      'Screen for Concurrent Vitamin B12 Inactivation: If the patient uses nitrous oxide regularly, administer intramuscular Hydroxocobalamin/Cyanocobalamin (1,000 mcg IM daily) to prevent subacute combined degeneration of the spinal cord.'
    ],
    managementEs: [
      'Aseguramiento Precoz de Vía Aérea: Evaluación temprana con nasolaringoscopia flexible; intubar con tubo endotraqueal de menor calibre (6.0–6.5 mm) si progresa el edema supraglótico.',
      'Protocolo Antiinflamatorio y Mucoso: Dexametasona IV (8–10 mg c/6–8h), enjuagues con solución salina estéril, analgesia IV y Ampicilina-Sulbactam en caso de necrosis mucosa profunda.',
      'Protección Neurológica con Vitamina B12: En uso frecuente de óxido nitroso, administrar Hidroxicobalamina/Cianocobalamina IM (1,000 mcg IM diarios) para prevenir degeneración combinada subaguda.'
    ],
    harmReductionEn:
      'THE CARDINAL BALLOON RULE: Never inhale nitrous oxide directly from a tank valve, regulator, whipped-cream dispenser, or cracker! Always dispense N2O into a balloon first—the balloon warms the gas to room temperature and normalizes pressure, completely preventing cryogenic airway frostbite and lung barotrauma.',
    harmReductionEs:
      'LA REGLA CARDINAL DEL GLOBO: ¡Nunca inhalar óxido nitroso directamente de la válvula de un cilindro o sifón! Siempre descargar el gas primero en un globo para calentar el gas a temperatura ambiente y normalizar la presión.'
  }),

  intranasal_harm_reduction: Object.freeze({
    id: 'intranasal_harm_reduction',
    urgency: 'ROUTINE',
    badgeEn: '6 PILLARS OF SAFER INSUFFLATION & HCV STRAW SAFETY',
    badgeEs: '6 PILARES DE INSUFLACIÓN SEGURA Y PREVENCIÓN DE VHC',
    titleEn: 'Intranasal Harm Reduction, HCV Straw Prevention & Rhinitis Medicamentosa',
    titleEs: 'Reducción de Daños Intranasal, Prevención de VHC por Popotes y Rinitis Medicamentosa',
    summaryEn:
      'Evidence-based nasal mucosal preservation, prevention of Hepatitis C (HCV) and MRSA transmission from shared snorting equipment, and management of rebound rhinitis medicamentosa from topical decongestant overuse.',
    summaryEs:
      'Preservación de la mucosa nasal basada en evidencia, prevención de transmisión de Hepatitis C (VHC) y MRSA por compartir popotes/billetes, y manejo de la rinitis medicamentosa por descongestionantes tópicos.',
    pathophysiologyEn:
      'Course crystalline powders and crushed pill binders lacerate the vascular Kiesselbach plexus, leaving microscopic blood on straws and rolled banknotes. Hepatitis C virus remains infectious on inanimate surfaces for weeks, making shared straws a documented non-injection HCV transmission route. Meanwhile, chronic use of topical alpha-agonists (oxymetazoline/Afrin) > 3–5 days causes severe rebound mucosal congestion and ischemic turbinate hypertrophy (rhinitis medicamentosa).',
    pathophysiologyEs:
      'Los cristales gruesos y excipientes de pastillas laceran el plexo de Kiesselbach, dejando sangre microscópica en popotes y billetes. El virus de la Hepatitis C sobrevive semanas en superficies, haciendo que compartir popotes transmita VHC. Además, el uso > 3–5 días de oximetazolina tópica causa congestión severa de rebote (rinitis medicamentosa).',
    diagnosticsEn: [
      'Screen all individuals with a history of shared intranasal straws/banknotes for Hepatitis C Antibody with reflex HCV RNA PCR and HIV.',
      'Anterior Rhinoscopy: Distinguish ischemic cocaine/ketamine mucosal ulceration from beefy-red boggy turbinate hypertrophy of rhinitis medicamentosa or purulent acute bacterial rhinosinusitis.',
      'Assess for sinus barotrauma, orbital/frontal headache ("Pott puffy tumor" forehead swelling), or chronic epistaxis.'
    ],
    diagnosticsEs: [
      'Tamizar con Anticuerpos contra Hepatitis C (con ARN de VHC reflejo) y VIH a toda persona con antecedente de compartir popotes o billetes para inhalar.',
      'Rinoscopia Anterior: Distinguir ulceración isquémica por cocaína/ketamina de la hipertrofia turbinal congestiva por rinitis medicamentosa o rinosinusitis bacteriana.',
      'Evaluar cefalea frontal/orbitaria ("tumor hinchado de Pott") o epistaxis recurrente.'
    ],
    managementEn: [
      'Epistaxis First-Aid Protocol: Lean slightly FORWARD (never tilt head backward, which causes blood aspiration/vomiting) and pinch the soft cartilaginous alae firmly against the septum continuously for 10–15 full minutes. If Anterior Packing (Merocel / Rhino Rocket) is placed in an immunocompromised or PWID patient, cover with oral Amoxicillin-Clavulanate or Cephalexin to prevent Staphylococcal Toxic Shock Syndrome (TSS).',
      'Breaking Rhinitis Medicamentosa (Oxymetazoline Rebound): Immediately start an Intranasal Corticosteroid Spray (Fluticasone propionate 2 sprays/nostril daily) + hypertonic/isotonic saline rinses, and wean Oxymetazoline one nostril at a time ("One-Nostril Wean Method": stop oxymetazoline in the left nostril while using fluticasone in both; once the left nostril opens in 5–7 days, stop oxymetazoline in the right nostril).',
      'The 6 Pillars of Safer Insufflation: (1) Use single-use color-coded paper or personal medical-grade silicone straws—NEVER use rolled currency bills (heavily contaminated with fecal bacteria, MRSA, and blood) and never share straws; (2) Pulverize crystals into an ultra-fine powder on a clean surface to prevent mucosal cuts; (3) Alternate nostrils; (4) Rinse with STERILE, DISTILLED, or BOILED saline 10–15 min before and after use (NEVER use unboiled tap water due to fatal Naegleria fowleri amebic meningoencephalitis risk!); (5) Apply Vitamin E oil, panthenol, or petrolatum inside nostrils at bedtime; (6) Avoid crushed extended-release polymer/talc tablets.'
    ],
    managementEs: [
      'Primeros Auxilios en Epistaxis: Inclinarse ligeramente hacia ADELANTE (nunca hacia atrás) y presionar firmemente la porción blanda de las alas nasales durante 10–15 minutos continuos. Si se coloca taponamiento nasal anterior, cubrir con Amoxicilina-Clavulanato o Cefalexina para prevenir Síndrome de Choque Tóxico estafilocócico.',
      'Tratamiento de Rinitis Medicamentosa (Rebote por Oximetazolina): Iniciar corticoide intranasal (Fluticasona 2 disparos/fosa al día) + lavados salinos y suspender la oximetazolina "una fosa nasal a la vez" (suspender primero en el lado izquierdo; cuando se destape en 5–7 días, suspender en el derecho).',
      'Los 6 Pilares de Insuflación Segura: (1) Usar popotes personales de papel o silicona de distinto color (NUNCA usar billetes enrollados ni compartir popotes); (2) Pulverizar finamente los cristales; (3) Alternar fosas nasales; (4) Lavar con solución salina ESTÉRIL, DESTILADA o HERVIDA 10–15 min después (¡NUNCA usar agua del grifo sin hervir por riesgo mortal de ameba Naegleria fowleri!); (5) Aplicar aceite de vitamina E o vaselina antes de dormir; (6) Evitar inhalar comprimidos con polímeros/talco.'
    ],
    harmReductionEn:
      'Remind patients using nasal sinus rinses (Neti pots or squeeze bottles) that tap water must ALWAYS be boiled for >= 1 minute and cooled, or replaced with sterile/distilled water, to prevent fatal primary amebic meningoencephalitis (Naegleria fowleri).',
    harmReductionEs:
      'Recordar siempre que para lavados nasales (Neti pot) NUNCA debe usarse agua del grifo directa; usar únicamente agua estéril, destilada o hervida por >= 1 minuto y enfriada para prevenir meningoencefalitis amebiana por Naegleria fowleri.'
  })
});

export const ENT_HARM_REDUCTION_RULES = Object.freeze([
  Object.freeze({
    id: 'ludwig_never_supine_rule',
    titleEn: 'The Ludwig Angina Upright Airway Rule (Never Lay Supine for CT)',
    titleEs: 'Regla de Vía Aérea Sentada en Angina de Ludwig (Nunca Acostar en Supino para TC)',
    bodyEn:
      'In bilateral floor-of-mouth induration, tongue elevation, drooling, or stridor, never place the patient supine for imaging or attempt blind paralytic intubation. Keep the patient sitting upright and perform awake fiberoptic intubation with surgical tracheostomy ready at bedside.',
    bodyEs:
      'Ante induración bilateral del piso de la boca, elevación lingual, sialorrea o estridor, nunca acostar al paciente en decúbito supino para TC ni usar paralíticos a ciegas. Mantener sentado y realizar intubación fibroóptica despierto con equipo de traqueostomía listo.'
  }),
  Object.freeze({
    id: 'cimdl_no_surgical_flap_while_active_rule',
    titleEn: 'The CIMDL Septal Button & Palatal Obturator Prosthesis Rule',
    titleEs: 'Regla de Botón Septal y Obturador Palatino en Perforación por Cocaína (CIMDL)',
    bodyEn:
      'Surgical mucosal flap repair of nasal septal perforations or hard-palate fistulas fails 100% of the time during active intranasal cocaine use. Rehabilitate immediately with a Silastic septal button or removable maxillary palatal obturator (to stop nasal liquid regurgitation and restore speech) until sustained abstinence is achieved.',
    bodyEs:
      'La reconstrucción quirúrgica con colgajos de perforaciones septales o fístulas palatinas fracasa en el 100% durante el consumo activo de cocaína. Rehabilitar de inmediato con botón septal de Silastic u obturador palatino removible hasta lograr abstinencia sostenida.'
  }),
  Object.freeze({
    id: 'n2o_balloon_cryogenic_rule',
    titleEn: 'The Nitrous Oxide Balloon Rule (Preventing -55°C Airway Frostbite)',
    titleEs: 'Regla del Globo con Óxido Nitroso (Prevenir Congelación Laríngea a -55 °C)',
    bodyEn:
      'Inhaling compressed nitrous oxide or difluoroethane directly from a cylinder or dispenser causes -40°C to -55°C cryogenic frostbite and delayed (4–12h) life-threatening laryngeal edema. Always discharge N2O into a balloon first.',
    bodyEs:
      'Inhalar óxido nitroso o difluoroetano directamente del cilindro produce congelación criogénica a -40 °C a -55 °C y edema laríngeo tardío (4–12 h) potencialmente mortal. Siempre descargar el gas primero en un globo.'
  }),
  Object.freeze({
    id: 'sterile_water_naegleria_straw_hcv_rule',
    titleEn: 'The Sterile Saline Rinse (No Tap Water) & Single-Person Straw HCV Rule',
    titleEs: 'Regla de Solución Salina Estéril (Sin Agua de Grifo) y Popotes Individuales contra VHC',
    bodyEn:
      'Shared straws and rolled bills transmit Hepatitis C (HCV) via microscopic nasal blood. Use personal color-coded straws and rinse nostrils after insufflation using ONLY sterile, distilled, or boiled water—never unboiled tap water (Naegleria fowleri risk).',
    bodyEs:
      'Compartir popotes o billetes transmite Hepatitis C (VHC) por microgotas de sangre. Usar popotes personales y realizar lavados nasales SOLO con agua estéril, destilada o hervida (nunca agua de grifo sin hervir por riesgo de Naegleria fowleri).'
  }),
  Object.freeze({
    id: 'lemierre_fusobacterium_antibiotic_rule',
    titleEn: 'The Lemierre Syndrome Jugular Cord & Anaerobic Coverage Rule',
    titleEs: 'Regla del Cordón Yugular y Cobertura Anaerobia en Síndrome de Lemierre',
    bodyEn:
      'A tender cord along the sternocleidomastoid with fever and pleuritic chest pain signals Internal Jugular Vein septic thrombophlebitis (Lemierre syndrome). Pair MRSA coverage (Vancomycin) with beta-lactamase-stable anaerobic therapy (Piperacillin-Tazobactam or Ceftriaxone + Metronidazole).',
    bodyEs:
      'Un cordón doloroso en el esternocleidomastoideo con fiebre y dolor pleurítico indica tromboflebitis séptica de la Vena Yugular Interna (Lemierre). Asociar cobertura para MRSA (Vancomicina) con terapia anaerobia resistente a betalactamasas (Piperacilina-Tazobactam o Ceftriaxona + Metronidazol).'
  })
]);

const DEFAULT_ENT_STATE = Object.freeze({
  selectedSyndrome: 'ludwig_angina_deep_neck',
  woodyFloorOfMouthTongueElevationStridor: false,
  unilateralJugularCordFeverPleuriticChestPain: false,
  thermalPipeBurnMuffledVoiceDrooling: false,
  directN2oTankCryogenicOralWhitePlaques: false,
  nasalRegurgitationLiquidsOrSeptalWhistling: false,
  sharedStrawsOrUnboiledTapWaterRinse: false,
  clinicalNotes: ''
});

let entState = { ...DEFAULT_ENT_STATE };
const listeners = new Set();

export function getEntState() {
  return { ...entState };
}

export function setEntState(patch = {}) {
  entState = { ...entState, ...patch };
  for (const fn of listeners) {
    fn(getEntState());
  }
  return getEntState();
}

export function resetEntState() {
  entState = { ...DEFAULT_ENT_STATE };
  for (const fn of listeners) {
    fn(getEntState());
  }
  return getEntState();
}

export function subscribeEntState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function evaluateEntRisk(state = entState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const profile =
    ENT_SYNDROME_PROFILES[state.selectedSyndrome] ||
    ENT_SYNDROME_PROFILES.ludwig_angina_deep_neck;

  const redFlags = [];
  let urgency = profile.urgency;

  if (state.woodyFloorOfMouthTongueElevationStridor) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'EMERGENCIA DE VÍA AÉREA (Angina de Ludwig / Espacio Profundo del Cuello): NUNCA acostar al paciente en decúbito supino para TC. Mantener sentado y activar Intubación Nasotraqueal Fibroóptica Despierto + Cirugía/ORL para traqueostomía + Ampicilina-Sulbactam/Piperacilina-Tazobactam + Vancomicina + Dexametasona IV.'
        : 'AIRWAY EMERGENCY (Ludwig Angina / Deep Neck Space Infection): NEVER lay the patient supine for CT. Keep sitting upright and activate Awake Fiberoptic Nasotracheal Intubation + ENT/Surgery for tracheostomy backup + IV Ampicillin-Sulbactam/Piperacillin-Tazobactam + Vancomycin + IV Dexamethasone.'
    );
  }

  if (state.unilateralJugularCordFeverPleuriticChestPain) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE SÍNDROME DE LEMIERRE (Tromboflebitis Séptica de Vena Yugular Interna): Solicitar TC de cuello y tórax con contraste IV, hemocultivos x2 (aerobios/anaerobios) e iniciar Vancomicina + Piperacilina-Tazobactam (o Ceftriaxona + Metronidazol).'
        : 'LEMIERRE SYNDROME ALERT (Septic Internal Jugular Vein Thrombophlebitis): Obtain contrast-enhanced CT Neck & Chest, blood cultures x2 (aerobic/anaerobic), and start IV Vancomycin + Piperacillin-Tazobactam (or Ceftriaxone + Metronidazole).'
    );
  }

  if (state.thermalPipeBurnMuffledVoiceDrooling) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE EPIGLOTITIS / SUPRAGLOTITIS TÉRMICA (Pipa de Crack / Malla "Chore Boy"): Alto riesgo de obstrucción glótica aguda. Administrar Dexametasona IV + epinefrina racémica nebulizada + Ceftriaxona + Vancomicina IV y realizar nasolaringoscopia flexible en posición sentada.'
        : 'THERMAL EPIGLOTTITIS / SUPRAGLOTTITIS ALERT (Crack Pipe / "Chore Boy" Mesh): High risk of acute glottic closure. Administer IV Dexamethasone + nebulized racemic epinephrine + IV Ceftriaxone + Vancomycin and perform upright flexible nasolaryngoscopy.'
    );
  }

  if (state.directN2oTankCryogenicOralWhitePlaques) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'CONGELACIÓN CRIOGÉNICA DE VÍA AÉREA (Óxido Nitroso / Gases Refrigerantes): Vigilar en hospital mínimo 6–12 horas por angioedema laríngeo tardío al descongelarse el tejido. Administrar Dexametasona IV, descartar neumomediastino y suplementar Vitamina B12 IM.'
        : 'CRYOGENIC AIRWAY FROSTBITE ALERT (Nitrous Oxide / Refrigerant Gas): Observe minimum 6–12 hours for delayed reperfusion laryngeal edema as frozen tissue thaws. Administer IV Dexamethasone, rule out pneumomediastinum, and give IM Vitamin B12.'
    );
  }

  if (state.nasalRegurgitationLiquidsOrSeptalWhistling) {
    if (urgency === 'ROUTINE') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'PERFORACIÓN SEPTAL / FÍSTULA ORO-NASAL PALATINA (CIMDL por Cocaína/Levamisol): Diferir cirugía con colgajos durante el consumo activo (100% de fracaso). Rehabilitar con Botón Septal de Silastic u Obturador Palatino Maxilar removible y lavados salinos estériles.'
        : 'SEPTAL PERFORATION / HARD-PALATE ORONASAL FISTULA (Cocaine/Levamisole CIMDL): Defer surgical flap repair during active insufflation (100% graft failure). Rehabilitate immediately with a Silastic Septal Button or Removable Maxillary Palatal Obturator and sterile saline irrigations.'
    );
  }

  if (state.sharedStrawsOrUnboiledTapWaterRinse) {
    if (urgency === 'ROUTINE') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'ALERTA DE INSUFLACIÓN Y LAVADO NASAL: Tamizar anticuerpos/ARN de Hepatitis C (VHC) por compartir popotes/billetes. Educar en usar SOLO agua estéril, destilada o hervida para lavados nasales (prohibido agua de grifo sin hervir por riesgo de Naegleria fowleri).'
        : 'INSUFFLATION & NASAL RINSE SAFETY ALERT: Screen for Hepatitis C (HCV antibody + reflex RNA) due to shared straws/bills. Counsel to use ONLY sterile, distilled, or boiled water for nasal rinses (never unboiled tap water due to Naegleria fowleri risk).'
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

export function formatEntSbarText(state = entState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const evalResult = evaluateEntRisk(state, lang);

  const lines = [];
  lines.push(
    isEs
      ? '=== ENTREGA CLÍNICA SBAR: OTORRINOLARINGOLOGÍA, VÍA AÉREA SUPERIOR E INFECCIONES DE CUELLO (CERO-PII) ==='
      : '=== SBAR CLINICAL HANDOFF: OTOLARYNGOLOGY, UPPER AIRWAY & DEEP NECK INFECTIONS (ZERO-PII) ==='
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
        ? 'ALERTAS ROJAS DE VÍA AÉREA Y CUELLO ACTIVAS:'
        : 'ACTIVE AIRWAY & DEEP NECK RED-FLAG ALERTS:'
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
      ? 'RECOMENDACIÓN Y PROTOCOLO DE VÍA AÉREA / MANEJO AGUDO:'
      : 'RECOMMENDATION & AIRWAY / ACUTE MANAGEMENT PROTOCOL:'
  );
  for (const m of evalResult.management) {
    lines.push(`  * ${m}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'REDUCCIÓN DE DAÑOS INTRANASAL Y ORAL:'
      : 'INTRANASAL & UPPER AIRWAY HARM REDUCTION:'
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

export function entCareView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const root = el('section', {
    className: 'view-section ent-care-view',
    attrs: {
      'aria-labelledby': 'ent-care-heading',
      'data-view': 'ent-care'
    }
  });

  const header = el('header', { className: 'view-header ent-header' });
  const kicker = el(
    'span',
    { className: 'section-kicker' },
    t(
      'ent.kicker',
      isEs
        ? 'Otorrinolaringología, Vía Aérea Superior, Cuello Profundo y Reducción de Daños Intranasal'
        : 'Otolaryngology, Upper Airway, Deep Neck Infections & Intranasal Harm Reduction'
    )
  );
  const title = h('h1', { id: 'ent-care-heading', class: 'view-title' },
    t(
      'ent.title',
      isEs
        ? 'Navegador de Otorrinolaringología, Angina de Ludwig, Síndrome de Lemierre, Perforación Septal y Vía Aérea'
        : 'Otolaryngology, Ludwig Angina, Lemierre Syndrome, Septal Perforation & Upper Airway Navigator'
    )
  );
  const subtitle = el(
    'p',
    { className: 'view-subtitle' },
    t(
      'ent.subtitle',
      isEs
        ? 'Soporte clínico cero-PII en memoria RAM para angina de Ludwig e infecciones profundas del cuello, síndrome de Lemierre yugular, lesiones destructivas por cocaína (CIMDL), epiglotitis térmica por pipa de crack, congelación laríngea por óxido nitroso y reducción de daños intranasal.'
        : 'Zero-PII, in-RAM clinical decision support for Ludwig angina and deep neck space infections, Lemierre internal jugular thrombophlebitis, cocaine midline destructive lesions (CIMDL), crack-pipe thermal supraglottitis, nitrous oxide cryogenic airway frostbite, and intranasal harm reduction.'
    )
  );
  header.append(kicker, title, subtitle);
  root.appendChild(header);

  const safetyBanner = el('div', {
    className: 'clinical-alert-banner ent-safety-banner',
    attrs: { role: 'region', 'aria-label': isEs ? 'Seguridad de Vía Aérea Superior' : 'Upper Airway Safety Rules' }
  });
  safetyBanner.append(
    el(
      'strong',
      {},
      isEs
        ? 'Reglas Cardinales de Supervivencia en ORL y Vía Aérea: '
        : 'Cardinal ENT & Airway Survival Rules: '
    ),
    el(
      'span',
      {},
      isEs
        ? '(1) En angina de Ludwig o estridor, NUNCA acostar al paciente en supino para TC antes de intubación fibroóptica despierto; (2) En perforación septal/palatina por cocaína (CIMDL), usar botón septal de Silastic u obturador palatino (diferir colgajos quirúrgicos en consumo activo); (3) Descargar siempre el óxido nitroso en un globo y usar solo agua estéril/hervida en lavados nasales.'
        : '(1) In Ludwig angina or stridor, NEVER lay the patient supine for CT before awake fiberoptic intubation; (2) In cocaine septal/palatal defects (CIMDL), fit a Silastic septal button or palatal obturator (defer surgical flaps during active use); (3) Always dispense nitrous oxide into a balloon and use only sterile/boiled water for nasal rinses.'
    )
  );
  root.appendChild(safetyBanner);

  const selectorSection = el('section', {
    className: 'ent-selector-section card',
    attrs: { 'aria-labelledby': 'ent-selector-heading' }
  });
  selectorSection.appendChild(
    el(
      'h2',
      { id: 'ent-selector-heading', className: 'card-title' },
      t(
        'ent.selectorTitle',
        isEs
          ? '1. Seleccione el Síndrome de ORL, Cuello Profundo o Vía Aérea'
          : '1. Select Primary ENT, Deep Neck or Upper Airway Syndrome'
      )
    )
  );

  const syndromeGrid = el('div', {
    className: 'ent-syndrome-grid',
    attrs: { role: 'group', 'aria-label': isEs ? 'Selector de síndrome de ORL' : 'ENT syndrome selector' }
  });

  const detailContainer = el('div', {
    className: 'ent-detail-container',
    attrs: { 'aria-live': 'polite' }
  });

  const sbarPre = el('pre', {
    className: 'sbar-output-pre ent-sbar-pre',
    attrs: { tabindex: '0', 'aria-label': isEs ? 'Entrega clínica SBAR de ORL' : 'ENT SBAR clinical handoff' }
  });

  function renderSyndromeButtons() {
    clear(syndromeGrid);
    const current = getEntState();
    for (const profile of Object.values(ENT_SYNDROME_PROFILES)) {
      const isSelected = current.selectedSyndrome === profile.id;
      const btn = makeButton(
        isEs ? profile.titleEs : profile.titleEn,
        () => {
          setEntState({ selectedSyndrome: profile.id });
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
    className: 'ent-flags-section card',
    attrs: { 'aria-labelledby': 'ent-flags-heading' }
  });
  flagsSection.appendChild(
    el(
      'h2',
      { id: 'ent-flags-heading', className: 'card-title' },
      t(
        'ent.flagsTitle',
        isEs
          ? '2. Verificador de Signos de Alarma de Vía Aérea, Cuello y Mucosa Nasal'
          : '2. Airway, Deep Neck & Nasal Mucosal Red-Flag Triage Checker'
      )
    )
  );

  const flagDefinitions = [
    {
      key: 'woodyFloorOfMouthTongueElevationStridor',
      labelEn:
        'Bilateral "woody" floor-of-mouth induration, tongue elevation, trismus, drooling, or "hot potato" voice (Ludwig Angina / Deep Neck Infection)',
      labelEs:
        'Induración bilateral "leñosa" del piso de la boca, elevación lingual, trismo, sialorrea o voz en "papa caliente" (Angina de Ludwig)'
    },
    {
      key: 'unilateralJugularCordFeverPleuriticChestPain',
      labelEn:
        'Unilateral neck swelling/tenderness along sternocleidomastoid ("cord sign") with fever and pleuritic chest pain (Lemierre IJV Thrombophlebitis)',
      labelEs:
        'Dolor/tumefacción cervical unilateral en esternocleidomastoideo ("signo del cordón") con fiebre y dolor torácico pleurítico (Síndrome de Lemierre)'
    },
    {
      key: 'thermalPipeBurnMuffledVoiceDrooling',
      labelEn:
        'Sudden throat burn, odynophagia, muffled voice, or stridor after smoking from a short glass pipe / "Chore Boy" mesh (Thermal Supraglottitis)',
      labelEs:
        'Quemadura faríngea súbita, odinofagia, voz apagada o estridor tras fumar en pipa corta / malla "Chore Boy" (Supraglotitis Térmica)'
    },
    {
      key: 'directN2oTankCryogenicOralWhitePlaques',
      labelEn:
        'White frostbite plaques or blistering of lips/palate/uvula after inhaling Nitrous Oxide or duster directly from a tank/nozzle (Cryogenic Frostbite)',
      labelEs:
        'Placas blancas de congelación o ampollas en labios/paladar/úvula tras inhalar Óxido Nitroso directamente del cilindro (Congelación Criogénica)'
    },
    {
      key: 'nasalRegurgitationLiquidsOrSeptalWhistling',
      labelEn:
        'Nasal regurgitation of liquids, hypernasal speech, whistling, or saddle-nose collapse from intranasal cocaine (CIMDL Septal/Palatal Perforation)',
      labelEs:
        'Regurgitación nasal de líquidos, voz hipernasal, silbido nasal o colapso en silla de montar por cocaína intranasal (Perforación Septal/Palatina CIMDL)'
    },
    {
      key: 'sharedStrawsOrUnboiledTapWaterRinse',
      labelEn:
        'History of sharing snorting straws/rolled bills (HCV risk) OR using unboiled tap water for nasal rinses (Naegleria fowleri risk)',
      labelEs:
        'Antecedente de compartir popotes/billetes para inhalar (riesgo de VHC) O usar agua de grifo sin hervir en lavados nasales (riesgo de Naegleria fowleri)'
    }
  ];

  const flagsList = el('div', { className: 'ent-flags-list' });
  const checkboxRefs = new Map();

  for (const def of flagDefinitions) {
    const row = el('label', { className: 'checkbox-row ent-flag-row' });
    const cb = el('input', {
      attrs: {
        type: 'checkbox',
        'data-flag-key': def.key
      }
    });
    cb.checked = Boolean(entState[def.key]);
    cb.addEventListener('change', () => {
      setEntState({ [def.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(def.key, cb);
    row.append(cb, el('span', {}, isEs ? def.labelEs : def.labelEn));
    flagsList.appendChild(row);
  }
  flagsSection.appendChild(flagsList);

  function renderDetailAndSbar() {
    clear(detailContainer);
    const evalResult = evaluateEntRisk(getEntState());

    const card = el('article', {
      className: `card ent-profile-card urgency-${evalResult.urgency.toLowerCase()}`
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
        className: 'ent-redflag-box',
        attrs: { role: 'alert' }
      });
      alertBox.appendChild(
        el(
          'h4',
          {},
          isEs
            ? 'Alertas Clínicas Inmediatas de Vía Aérea y ORL Activadas'
            : 'Immediate Airway & ENT Clinical Red-Flag Alerts Activated'
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
      el('h4', {}, isEs ? 'Fisiopatología y Anatomía de Espacios Profundos' : 'Pathophysiology & Deep Space Anatomy'),
      el('p', {}, evalResult.pathophysiology)
    );
    card.appendChild(pathoSection);

    const diagSection = el('div', { className: 'profile-subsection' });
    diagSection.appendChild(
      el('h4', {}, isEs ? 'Evaluación Diagnóstica e Imagen' : 'Diagnostic Workup & Airway-Safe Imaging')
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
          ? 'Protocolo de Manejo de Vía Aérea, Antimicrobianos y Rehabilitación'
          : 'Airway Securement, Antimicrobial & Prosthetic Rehabilitation Protocol'
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
          ? 'Reducción de Daños Intranasal, Oral e Inhalatoria'
          : 'Intranasal, Oral & Inhalation Harm Reduction'
      ),
      el('p', {}, evalResult.harmReduction)
    );
    card.appendChild(hrSection);

    detailContainer.appendChild(card);
    sbarPre.textContent = formatEntSbarText(getEntState());
  }

  selectorSection.appendChild(syndromeGrid);
  root.appendChild(selectorSection);
  root.appendChild(flagsSection);
  root.appendChild(detailContainer);

  const rulesSection = el('section', {
    className: 'ent-rules-section card',
    attrs: { 'aria-labelledby': 'ent-rules-heading' }
  });
  rulesSection.appendChild(
    el(
      'h2',
      { id: 'ent-rules-heading', className: 'card-title' },
      t(
        'ent.rulesTitle',
        isEs
          ? '3. Reglas Cardinales de Otorrinolaringología y Reducción de Daños'
          : '3. Cardinal Rules of Otolaryngology, Airway Safety & Intranasal Harm Reduction'
      )
    )
  );
  const rulesGrid = el('div', { className: 'ent-rules-grid' });
  for (const rule of ENT_HARM_REDUCTION_RULES) {
    const rCard = el('article', { className: 'ent-rule-card' });
    rCard.append(
      el('h3', { className: 'rule-title' }, isEs ? rule.titleEs : rule.titleEn),
      el('p', { className: 'rule-body' }, isEs ? rule.bodyEs : rule.bodyEn)
    );
    rulesGrid.appendChild(rCard);
  }
  rulesSection.appendChild(rulesGrid);
  root.appendChild(rulesSection);

  const sbarSection = el('section', {
    className: 'ent-sbar-section card',
    attrs: { 'aria-labelledby': 'ent-sbar-heading' }
  });
  sbarSection.appendChild(
    el(
      'h2',
      { id: 'ent-sbar-heading', className: 'card-title' },
      t(
        'ent.sbarTitle',
        isEs
          ? '4. Generador de Entrega Clínica SBAR (Cero-PII en RAM)'
          : '4. Zero-PII SBAR Clinical Handoff Generator (In-RAM)'
      )
    )
  );

  const notesLabel = el(
    'label',
    { className: 'field-label', attrs: { for: 'ent-clinical-notes' } },
    isEs
      ? 'Notas clínicas contextuales (solo en RAM, sin datos identificables):'
      : 'Contextual clinical notes (in-RAM only, zero identifiable data):'
  );
  const notesInput = el('textarea', {
    id: 'ent-clinical-notes',
    className: 'form-textarea ent-notes-input',
    attrs: {
      rows: '2',
      placeholder: isEs
        ? 'Ej. Induración submandibular bilateral, trismo 1.5 cm, saturación 96% sentado...'
        : 'e.g., Bilateral submandibular induration, trismus 1.5 cm, SpO2 96% sitting upright...'
    }
  });
  notesInput.value = entState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setEntState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatEntSbarText(getEntState());
  });

  const copyStatus = el('span', {
    className: 'copy-status-msg',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });

  const copyBtn = makeButton(
    isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard',
    async () => {
      const txt = formatEntSbarText(getEntState());
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
      resetEntState();
      notesInput.value = '';
      copyStatus.textContent = '';
      for (const [k, cb] of checkboxRefs.entries()) {
        cb.checked = Boolean(entState[k]);
      }
      renderSyndromeButtons();
      renderDetailAndSbar();
    },
    { className: 'button secondary reset-ent-btn' }
  );

  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);

  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  const linksSection = el('nav', {
    className: 'ent-links-section card',
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
      isEs ? 'Salud Dental y Boca de Metanfetamina (#/dental-care)' : 'Dental Care & Meth Mouth (#/dental-care)',
      '#/dental-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Salud Pulmonar e Inhalación Segura (#/pulmonary-care)' : 'Pulmonary Care & Safer Inhalation (#/pulmonary-care)',
      '#/pulmonary-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Inhalantes y Óxido Nitroso (#/inhalant-care)' : 'Inhalants & Nitrous Oxide (#/inhalant-care)',
      '#/inhalant-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Dermatología, Xilacina y SJS/TEN (#/dermatology-care)' : 'Dermatology, Xylazine & SJS/TEN (#/dermatology-care)',
      '#/dermatology-care',
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
