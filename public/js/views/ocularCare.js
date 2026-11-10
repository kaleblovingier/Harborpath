// public/js/views/ocularCare.js
// HarborPath - Ophthalmology, Vision Loss & Ocular Toxicology Navigator
// Clinical Consensus: American Academy of Ophthalmology (AAO) & IDSA Guidelines on Endogenous Bacterial/Fungal Endophthalmitis,
// ACMT / AACT Guidelines on Methanol Formic Acid Toxic Optic Neuropathy (Fomepizole, Leucovorin & Hemodialysis),
// AAO / AHA Scientific Statement on Central Retinal Artery Occlusion (CRAO) as an Acute Stroke Equivalent & Talc Retinopathy,
// Ophthalmic Toxicology Consensus on "Crack Cornea" (Topical Anesthetic Melt Prohibition), Poppers SD-OCT Maculopathy,
// Topiramate Ciliochoroidal Angle-Closure Glaucoma (Pilocarpine Contraindication), and Orbital Cellulitis / Cavernous Sinus Thrombosis.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: OPHTHALMIC, RETINAL & OCULAR TOXICOLOGY SYNDROMES
// ============================================================================

export const OCULAR_SYNDROME_PROFILES = Object.freeze({
  methanolOpticNeuropathy: Object.freeze({
    id: 'methanol_optic_neuropathy',
    nameEn: 'Methanol ("Moonshine") Toxic Optic Neuropathy & Formic Acid Retrolaminar Blindness',
    nameEs: 'Neuropatía Óptica Tóxica por Metanol y Ceguera Retrolaminar por Ácido Fórmico',
    pathophysiologyEn: 'Ingested methanol (found in adulterated/bootleg "moonshine" spirits, windshield washer fluid, and Sterno canned fuel) is oxidized by hepatic Alcohol Dehydrogenase (ADH) to formaldehyde and then rapidly converted by Aldehyde Dehydrogenase (ALDH) into Formic Acid (Formate). Formate directly binds and inhibits mitochondrial Cytochrome c Oxidase (Complex IV) inside the unmyelinated retrolaminar optic nerve head and the basal ganglia (putamen). This halts oxidative phosphorylation (ATP depletion), arrests axoplasmic transport, and triggers oligodendrocyte myelinoclastic swelling and bilateral putaminal hemorrhagic necrosis.',
    pathophysiologyEs: 'El metanol ingerido (alcohol adulterado, líquido limpiaparabrisas) es oxidado por la Alcohol Deshidrogenasa (ADH) a formaldehído y por la Aldehído Deshidrogenasa (ALDH) a Ácido Fórmico (Formiato). El formiato inhibe el Complejo IV mitocondrial (Citocromo c Oxidasa) en la porción retrolaminar del nervio óptico y en el putamen, bloqueando el flujo axoplásmico y causando desmielinización aguda del nervio óptico y necrosis hemorrágica putaminal bilateral.',
    clinicalPresentationEn: 'CLASSIC 12–24 HOUR LATENT PERIOD & "SNOWSTORM VISION": After a 12–24h delay (up to 48–72h if co-ingested with ethanol), patients develop blurred vision classically described as "standing in a snowstorm" ("walking through a blizzard"), central scotoma, dilated sluggish/fixed pupils (afferent pupillary defect), optic disc hyperemia/edema progressing to chalk-white optic atrophy, and High Anion-Gap Metabolic Acidosis (HAGMA) with an elevated Osmolal Gap (> 10 mOsm/kg early; note that late presenters may have a normal osmolal gap once methanol has already been metabolized to formate!). SIGHT-SAVING ANTIDOTE PROTOCOL: Do NOT wait for confirmatory methanol levels! 1) Block ADH immediately with Fomepizole (15 mg/kg IV loading dose, then 10 mg/kg IV q12h; increase to q4h during hemodialysis) or IV/PO Ethanol (target 100–150 mg/dL); 2) Administer High-Dose Cofactor Therapy: Leucovorin (Folinic Acid 1 mg/kg up to 50 mg IV q4–6h) or Folic Acid (50 mg IV q4–6h) to convert toxic formate into CO2 and H2O via 10-formyl-THF dehydrogenase; 3) Administer IV Sodium Bicarbonate (target arterial pH 7.45–7.50 to "ion-trap" formate in its unprotonated state so it cannot cross into the optic nerve); and 4) Initiate emergent Intermittent Hemodialysis!',
    clinicalPresentationEs: 'PERÍODO LATENTE DE 12–24 HORAS Y "VISIÓN EN TORMENTA DE NIEVE": Tras una latencia de 12–24 h (mayor si se coingirió etanol), aparece visión borrosa descrita como "ver a través de una tormenta de nieve", escotoma central, midriasis arreactiva, edema de papila y Acidosis Metabólica con Anión Gap Elevado y Brecha Osmolal aumentada. PROTOCOLO ANTÍDOTO SALVAVISTA: ¡No esperar niveles de metanol! 1) Bloquear la ADH de inmediato con Fomepizol (15 mg/kg IV de carga, luego 10 mg/kg cada 12 h; cada 4 h en hemodiálisis) o Etanol; 2) Administrar Leucovorina (Ácido Folínico 1 mg/kg hasta 50 mg IV cada 4–6 h) o Ácido Fólico (50 mg IV cada 4–6 h) para degradar el ácido fórmico a CO2 y agua; 3) Bicarbonato Sódico IV (mantener pH arterial 7,45–7,50 para atrapar el formiato fuera del nervio óptico); y 4) Hemodiálisis intermitente urgente.',
  }),

  endogenousEndophthalmitis: Object.freeze({
    id: 'endogenous_endophthalmitis',
    nameEn: 'Endogenous Fungal (Candida/Aspergillus) & Bacterial Endophthalmitis in PWID',
    nameEs: 'Endoftalmitis Endógena Fúngica (Candida/Aspergillus) y Bacteriana en Usuarios de Vía Parenteral',
    pathophysiologyEn: 'Hematogenous seeding of the highly vascular choroid and inner retina during injection-related fungemia (Candida albicans, Aspergillus flavus—classically associated with dissolving brown heroin in contaminated lemon juice or citrus packets!) or bacteremia (Staphylococcus aureus, Bacillus cereus [fulminant 12–24h panophthalmitis], Streptococcus spp., Pseudomonas aeruginosa). Pathogens breach the tight junctions of the blood-retinal barrier and proliferate inside the avascular vitreous humor.',
    pathophysiologyEs: 'Siembra hematógena de la coroides y la retina durante fungemias (Candida albicans, Aspergillus flavus—clásicamente asociada a disolver heroína marrón en jugo de limón contaminado) o bacteriemias (Staphylococcus aureus, Bacillus cereus, Pseudomonas). Los patógenos cruzan la barrera hematorretiniana y proliferan en el humor vítreo avascular.',
    clinicalPresentationEn: 'HYPOPYON, STRING-OF-PEARLS VITRITIS & THE BLOOD-RETINAL BARRIER RULE: Presents with unilateral or bilateral floaters ("dark cobwebs"), worsening vision, ocular ache, photophobia, anterior chamber Hypopyon (layered white purulent sediment), loss of red reflex, and fluffy white chorioretinal lesions extending into the vitreous ("cotton-ball" or "string-of-pearls" fungal vitritis). CARDINAL OPHTHALMIC PHARMACOLOGY RULE — WHY IV ANTIBIOTICS ALONE FAIL: The Blood-Retinal Barrier prevents systemic IV Vancomycin, aminoglycosides, and conventional Amphotericin B from reaching bactericidal concentrations in the vitreous cavity! Furthermore, Echinocandins (Micafungin, Caspofungin, Anidulafungin) have POOR vitreous penetration and must NEVER be used as monotherapy for Candida endophthalmitis! Sight survival requires EMERGENT OPHTHALMOLOGY CONSULTATION FOR INTRAVITREAL TAP & INJECT (Intravitreal Vancomycin 1 mg/0.1 mL + Ceftazidime 2.25 mg/0.1 mL for bacterial; Intravitreal Voriconazole 100 mcg/0.1 mL or Amphotericin B 5–10 mcg/0.1 mL for fungal) +/- Pars Plana Vitrectomy (PPV), paired with systemic high-penetration Oral/IV Fluconazole (400–800 mg/day) or Voriconazole!',
    clinicalPresentationEs: 'HIPOPIÓN, VITRITIS EN "COLLAR DE PERLAS" Y REGLA DE LA BARRERA HEMATORRETINIANA: Cursa con miodesopsias ("telarañas"), pérdida visual, dolor ocular, fotofobia, Hipopión en cámara anterior y lesiones coriorretinianas algodonosas. REGLA FARMACOLÓGICA CARDINAL — POR QUÉ LOS ANTIBIÓTICOS IV SOLOS FRACASAN: ¡La barrera hematorretiniana impide que la Vancomicina IV y las Equinocandinas (Micafungina, Caspofungina) alcancen niveles terapéuticos en el humor vítreo! ¡Nunca usar equinocandinas en monoterapia para endoftalmitis por Candida! Exige INTERCONSULTA OFTALMOLÓGICA INMEDIATA PARA PUNCIÓN E INYECCIÓN INTRAVÍTREA (Vancomicina + Ceftazidima intravítrea en bacteriana; Voriconazol o Anfotericina B intravítrea en fúngica) +/- Vitrectomía Pars Plana, combinada con Fluconazol (400–800 mg/día) o Voriconazol sistémico.',
  }),

  crackCorneaKeratopathy: Object.freeze({
    id: 'crack_cornea_keratopathy',
    nameEn: '"Crack Cornea" (Stimulant Neurotrophic Keratitis) & The Topical Anesthetic Melt Prohibition',
    nameEs: '"Córnea de Crack" (Queratitis Neurotrófica por Estimulantes) y Prohibición de Anestésicos Tópicos',
    pathophysiologyEn: 'Volatilized alkaline freebase cocaine ("crack") and methamphetamine vapors directly anesthetize the unmyelinated trigeminal corneal nerve endings (CN V1), abolishing the protective blink reflex and tear film stability while causing direct alkaline chemical epitheliopathy. Prolonged lagophthalmos (staring without blinking) and vigorous eye rubbing during stimulant binges inoculate aggressive Pseudomonas aeruginosa, Streptococcus pneumoniae, or Staphylococcus aureus into the denuded corneal stroma.',
    pathophysiologyEs: 'Los vapores alcalinos de cocaína base ("crack") y metanfetamina anestesian las terminaciones nerviosas corneales del trigémino (V1), aboliendo el reflejo de parpadeo y dañando el epitelio por quemadura alcalina. El parpadeo reducido y el frotamiento ocular vigoroso inoculan Pseudomonas aeruginosa, Streptococcus pneumoniae o Staphylococcus aureus en el estroma corneal.',
    clinicalPresentationEn: 'INFECTIOUS CORNEAL ULCER & THE TOPICAL ANESTHETIC RING-MELT TRAP: Patients present with intense photophobia, foreign-body sensation, perilimbal ciliary flush, central epithelial defect staining bright green with fluorescein under cobalt-blue light, dense white stromal infiltrate, and anterior chamber hypopyon. CARDINAL OPHTHALMIC PROHIBITION: NEVER prescribe, dispense, or allow a patient to take home topical ophthalmic local anesthetics (Proparacaine, Tetracaine, Oxybuprocaine) for pain relief! Repeated topical anesthetic instillation destroys corneal epithelial microvilli, arrests keratocyte mitosis, triggers an immune stromal ring infiltrate, and causes catastrophic corneal stromal melting and perforation within days! Treat with hourly fortified broad-spectrum antibiotic drops (Fortified Vancomycin + Fortified Tobramycin, or 4th-generation fluoroquinolones [Moxifloxacin 0.5% q1h]), preservative-free artificial tears, cycloplegic drops (Cyclopentolate 1% for ciliary spasm pain), and systemic oral analgesia (NEVER patch an eye or apply topical steroids in suspected Pseudomonas or fungal keratitis!).',
    clinicalPresentationEs: 'ÚLCERA CORNEAL INFECCIOSA Y LA TRAMPA DE PERFORACIÓN POR ANESTÉSICOS TÓPICOS: Cursa con fotofobia intensa, defecto epitelial positivo a fluoresceína, infiltrado estromal blanco e hipopión. PROHIBICIÓN OFTALMOLÓGICA CARDINAL: ¡NUNCA recetar ni entregar colirios anestésicos locales (Proparacaína, Tetracaína) para uso domiciliario! El uso repetido de anestésicos tópicos destruye las microvellosidades epiteliales, frena la cicatrización y provoca lisis estromal ("corneal melt") y perforación ocular en pocos días. Tratar con colirios antibióticos fortificados horarios (Vancomicina + Tobramicina fortificadas o Moxifloxacino 0,5 % cada hora), lágrimas sin conservantes, ciclopléjicos (Ciclopentolato) y analgesia oral (nunca ocluir el ojo ni usar corticoides en úlcera activa por Pseudomonas o hongos).',
  }),

  craoTalcGlaucoma: Object.freeze({
    id: 'crao_talc_glaucoma',
    nameEn: 'Central Retinal Artery Occlusion (CRAO), Talc Retinopathy & Topiramate Angle-Closure Glaucoma',
    nameEs: 'Oclusión de la Arteria Central de la Retina (OACR), Retinopatía por Talco y Glaucoma por Topiramato',
    pathophysiologyEn: '1) Cocaine/Methamphetamine CRAO: Severe alpha-1 adrenergic retinal vasospasm, platelet thrombosis, or septic/calcific emboli from left-sided endocarditis occlude the central retinal artery (the first intracranial branch of the ophthalmic artery). 2) Talc Retinopathy: IV injection of crushed oral tablets (methadone, oxycodone, methylphenidate) sends 5–25 micron magnesium silicate (talc) crystals through collateral pulmonary shunts into the macular perifoveal arterioles. 3) Drug-Induced Acute Angle-Closure Glaucoma (AACG): Adrenergic/anticholinergic pupillary block vs. Topiramate idiosyncratic ciliochoroidal effusion with anterior rotation of the ciliary body and lens-iris diaphragm.',
    pathophysiologyEs: '1) OACR por Cocaína/Metanfetamina: Vasoespasmo retiniano alfa-1 severo o émbolos de endocarditis izquierda ocluyen la arteria central de la retina. 2) Retinopatía por Talco: La inyección IV de comprimidos orales triturados envía cristales de silicato de magnesio (talco) a los capilares perifoveales maculares. 3) Glaucoma Agudo de Ángulo Cerrado (GAAC): Bloqueo pupilar adrenérgico/anticolinérgico vs. efusión ciliocoroidea idiosincrásica por Topiramato con desplazamiento anterior del cuerpo ciliar.',
    clinicalPresentationEn: 'CRAO ("STROKE OF THE EYE") vs. TOPIRAMATE BILATERAL ANGLE-CLOSURE TRAP: 1) CRAO presents with sudden, PAINLESS, monocular catastrophic vision loss (counting fingers or light perception), Relative Afferent Pupillary Defect (RAPD / Marcus Gunn pupil), and a pale milky-white ischemic retina with a pathognomonic foveal "Cherry-Red Spot". Retinal ganglion cells infarct irreversibly within 90–240 minutes—activate Hospital Stroke Code immediately, perform carotid/cardiac echocardiography (rule out endocarditis), and avoid nitroglycerin if PDE5 inhibitors were used. 2) Acute Angle-Closure Glaucoma presents with a PAINFUL red eye, halos around lights, vomiting, steamy cornea, mid-dilated fixed pupil, and rock-hard IOP (> 40–60 mmHg). CARDINAL TOPIRAMATE GLAUCOMA RULE: Topiramate (prescribed for AUD or migraine) causes BILATERAL acute myopia and angle-closure via ciliochoroidal swelling—NOT pupillary block! Therefore, Pilocarpine (miotics) and Laser Iridotomy are CONTRAINDICATED/INEFFECTIVE in Topiramate glaucoma (Pilocarpine worsens ciliary spasm and anterior lens shift)! Instead, immediately stop Topiramate and administer Cycloplegics (Atropine 1% / Cyclopentolate) to retract the ciliary body posteriorly, plus topical Timolol/Dorzolamide, IV Acetazolamide, and IV Mannitol!',
    clinicalPresentationEs: 'OACR ("ICTUS OCULAR") vs. TRAMPA DEL GLAUCOMA BILATERAL POR TOPIRAMATO: 1) La OACR cursa con pérdida visual monocular SÚBITA E INDOLORA, Defecto Pupilar Aferente Relativo (DPAR) y retina pálida con "Mancha Rojo Cereza" foveal. La retina se infarta en 90–240 minutos: activar Código Ictus y descartar endocarditis. 2) El Glaucoma de Ángulo Cerrado cursa con ojo rojo DOLOROSO, halos, vómitos, córnea edematosa y PIO > 40–60 mmHg. REGLA CARDINAL DEL GLAUCOMA POR TOPIRAMATO: El Topiramato causa cierre angular BILATERAL por efusión ciliocoroidea (no por bloqueo pupilar). ¡Por tanto, la Pilocarpina está CONTRAINDICADA en el glaucoma por Topiramato porque agrava el desplazamiento anterior del cristalino! Suspender Topiramato de inmediato y administrar Ciclopléjicos (Atropina/Ciclopentolato) más hipotensores oculares (Timolol, Acetazolamida, Manitol).',
  }),

  poppersMaculopathy: Object.freeze({
    id: 'poppers_maculopathy',
    nameEn: 'Poppers Maculopathy (Alkyl Nitrite Foveal Cone Ellipsoid Zone Phototoxicity)',
    nameEs: 'Maculopatía por Poppers (Fototoxicidad de la Zona Elipsoide Foveal por Nitritos de Alquilo)',
    pathophysiologyEn: 'Inhalation of volatile alkyl nitrites ("Poppers"—especially isopropyl nitrite, which replaced isobutyl nitrite after regulatory bans) releases high concentrations of nitric oxide (NO) and peroxynitrite free radicals directly into the choriocapillaris and outer retina. Nitric oxide upregulates photoreceptor guanylate cyclase (cGMP), dramatically lowering the threshold for photic oxidative injury and selectively disrupting the mitochondrial-rich inner segment/outer segment (IS/OS) ellipsoid zone of foveal cone photoreceptors.',
    pathophysiologyEs: 'La inhalación de nitritos de alquilo volátiles ("Poppers", especialmente el nitrito de isopropilo) libera altas concentraciones de óxido nítrico (NO) y radicales peroxinitrito en la coriocapilar y retina externa. Esto altera el GMPc de los fotorreceptores y destruye selectivamente la zona elipsoide (unión segmento interno/externo) rica en mitocondrias de los conos de la fóvea central.',
    clinicalPresentationEn: 'CENTRAL PHOSPHENES & SD-OCT SUBFOVEAL ELLIPSOID DISRUPTION: Patients report bilateral central visual blur, central flickering yellow/white light spots (phosphenes), micropsia, or central scotoma within hours to days of single or chronic Poppers inhalation. Slit-lamp biomicroscopy reveals a subtle yellow-white foveolar spot without vitritis or retinal hemorrhage. Spectral-Domain Optical Coherence Tomography (SD-OCT) is the gold-standard diagnostic test, demonstrating focal disruption, fragmentation, or dome-shaped elevation of the subfoveal ellipsoid zone (IS/OS junction). MANAGEMENT: Complete cessation of alkyl nitrite inhalation (foveal ellipsoid architecture and visual acuity improve over 3–6 months in most patients who stop exposure), macular carotenoid antioxidants (Lutein 10 mg + Zeaxanthin 2 mg daily), and UV/blue-light blocking lenses.',
    clinicalPresentationEs: 'FOSFENOS CENTRALES Y DISRUPCIÓN DE LA ZONA ELIPSOIDE EN OCT: Cursa con visión borrosa central bilateral, destellos luminosos amarillentos centrales (fosfenos) o escotoma central tras inhalar Poppers. En el fondo de ojo se observa un sutil punto amarillento foveolar. La Tomografía de Coherencia Óptica de Dominio Espectral (SD-OCT) confirma el diagnóstico al mostrar interrupción focal de la zona elipsoide subfoveal (unión IS/OS de los conos). MANEJO: Suspensión total de los nitritos inhalados (la anatomía foveal suele recuperarse en 3–6 meses de abstinencia) y antioxidantes maculares (Luteína + Zeaxantina).',
  }),

  orbitalCavernousSinus: Object.freeze({
    id: 'orbital_cavernous_sinus',
    nameEn: 'Orbital Cellulitis, Subperiosteal Abscess & Septic Cavernous Sinus Thrombosis (CST)',
    nameEs: 'Celulitis Orbitaria, Absceso Subperióstico y Trombosis Séptica del Seno Cavernoso (TSC)',
    pathophysiologyEn: 'Intranasal insufflation ("snorting") of cocaine, methamphetamine, or crushed opioid pills causes ischemic nasal mucosal necrosis, septal perforation, and acute ethmoid/sphenoid sinusitis that erodes through the paper-thin lamina papyracea into the orbit (Post-Septal / Orbital Cellulitis). Similarly, facial or periorbital "skin-popping" abscesses in the facial "danger triangle" drain retrograde through valveless superior and inferior ophthalmic veins directly into the dural Cavernous Sinus.',
    pathophysiologyEs: 'La inhalación intranasal ("esnifado") de cocaína o comprimidos triturados causa necrosis nasal y sinusitis etmoidal/esfenoidal aguda que atraviesa la lámina papirácea hacia la órbita (Celulitis Orbitaria Postseptal). Asimismo, las infecciones faciales o periorbitarias por "skin popping" drenan de forma retrógrada por las venas oftálmicas avalvulares directamente hacia el Seno Cavernoso.',
    clinicalPresentationEn: 'PRE-SEPTAL vs. ORBITAL CELLULITIS & THE CN VI CAVERNOUS SINUS RULE: Pre-septal cellulitis is confined anterior to the orbital septum (swollen eyelid with normal vision and painless, full eye movements). Post-Septal (Orbital) Cellulitis presents with Proptosis (bulging eye), painful/restricted extraocular movements (ophthalmoplegia), chemosis, decreased visual acuity, RAPD, and loss of RED COLOR SATURATION (dyschromatopsia—the earliest clinical sign of compressive optic neuropathy!). Septic Cavernous Sinus Thrombosis (CST) presents with rapid progression from unilateral to BILATERAL proptosis/chemosis, high "picket-fence" fevers, periorbital sensory loss (CN V1/V2), and Cranial Nerve III, IV, and VI palsies—where CN VI (Lateral Rectus abduction palsy) is the EARLIEST cranial nerve deficit because CN VI courses freely inside the cavernous sinus lumen! MANAGEMENT: Emergent CT/MR Venography (CTV/MRV) of Brain & Orbits, immediate IV Vancomycin + Cefepime/Ceftriaxone + Metronidazole, surgical sinus/orbital drainage, and IV Heparin anticoagulation for CST.',
    clinicalPresentationEs: 'CELULITIS PRESEPTAL vs. ORBITARIA Y LA REGLA DEL VI PAR EN SENO CAVERNOSO: La celulitis preseptal solo inflama el párpado con visión y motilidad ocular normales. La Celulitis Orbitaria (Postseptal) cursa con Proptosis (exoftalmos), dolor y limitación al mover el ojo (oftalmoplejía), disminución de agudeza visual, DPAR y desaturación del COLOR ROJO (discromatopsia: signo más precoz de compresión del nervio óptico). La Trombosis Séptica del Seno Cavernoso (TSC) progresa rápidamente a proptosis BILATERAL, hipoestesia V1/V2 y parálisis de los pares III, IV y VI—siendo la parálisis del VI par (recto lateral) el signo más precoz porque el VI par discurre libre dentro del seno cavernoso. MANEJO: Angio-TC/Venografía-RM cerebral y orbitaria urgente, Vancomicina + Cefepima/Ceftriaxona + Metronidazol IV, drenaje quirúrgico y anticoagulación con Heparina en TSC.',
  }),
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & FIELD OPHTHALMIC SAFETY RULES
// ============================================================================

export const OCULAR_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Never Dissolve Heroin in Lemon Juice or Citrus Packets (Candida Endophthalmitis Blindness Risk)',
    titleEs: 'Nunca Disolver Heroína en Jugo de Limón (Riesgo de Ceguera por Endoftalmitis por Candida)',
    detailEn: 'Candida albicans fungus thrives in bottled lemon juice, lime juice, and vinegar. Injecting solutions heated with lemon juice seeds the retina and vitreous jelly, causing blinding fungal endophthalmitis. Always use sterile single-use pharmaceutical citric acid or ascorbic acid (Vitamin C) packets instead.',
    detailEs: 'El hongo Candida albicans prolifera en el jugo de limón y vinagre. Inyectar heroína disuelta con jugo de limón siembra la retina y el humor vítreo, causando endoftalmitis fúngica y ceguera. Utilice siempre sobres estériles monodosis de ácido cítrico o ácido ascórbico.',
  },
  {
    ruleNum: 2,
    titleEn: '"Snowstorm Vision" After Moonshine or Unknown Alcohol = Immediate Fomepizole, Folate & Dialysis',
    titleEs: '"Visión en Tormenta de Nieve" tras Alcohol Adulterado = Fomepizol, Folato y Diálisis Inmediatos',
    detailEn: 'Blurred vision or "walking through a snowstorm" 12–24 hours after drinking moonshine or counterfeit spirits signals methanol formic acid optic nerve poisoning. Do not wait for lab results—administer Fomepizole (or ethanol), high-dose IV Leucovorin/Folic Acid, Sodium Bicarbonate, and hemodialysis immediately.',
    detailEs: 'La visión borrosa o "en tormenta de nieve" 12–24 h después de beber alcohol artesanal o adulterado indica intoxicación del nervio óptico por metanol (ácido fórmico). No espere análisis: administre Fomepizol, Leucovorina/Ácido Fólico IV en altas dosis, Bicarbonato y hemodiálisis urgente.',
  },
  {
    ruleNum: 3,
    titleEn: 'Never Use Numbed ER Eye Drops (Proparacaine/Tetracaine) at Home for "Crack Cornea" Pain',
    titleEs: 'Prohibido Usar Colirios Anestésicos (Proparacaína/Tetracaína) en Casa para el Dolor Corneal',
    detailEn: 'Topical local anesthetic drops used by doctors to examine a scratched eye are toxic to corneal cells if used repeatedly. Taking numbing drops home causes the cornea to melt and perforate within days. Use antibiotic drops, preservative-free artificial tears, and oral pain relievers instead.',
    detailEs: 'Los colirios anestésicos usados en urgencias para explorar el ojo destruyen el epitelio corneal si se usan repetidamente en casa, provocando perforación corneal en pocos días. Use colirios antibióticos, lágrimas artificiales sin conservantes y analgésicos orales.',
  },
  {
    ruleNum: 4,
    titleEn: 'Why IV Antibiotics Alone Fail in Endophthalmitis: Demand Urgent Intravitreal Tap & Inject',
    titleEs: 'Por Qué los Antibióticos IV Solos Fracasan en Endoftalmitis: Exigir Inyección Intravítrea Urgente',
    detailEn: 'The blood-retinal barrier blocks IV vancomycin and echinocandins (micafungin) from entering the vitreous cavity. Any person who injects drugs with new floaters, blurred vision, deep eye pain, or a white layer in the iris (hypopyon) requires an Ophthalmologist within hours for intravitreal injection.',
    detailEs: 'La barrera hematorretiniana impide el paso de vancomicina IV y micafungina al humor vítreo. Todo usuario de vía parenteral con miodesopsias ("telarañas"), visión borrosa, dolor ocular o hipopión requiere valoración oftalmológica en horas para inyección intravítrea directa.',
  },
  {
    ruleNum: 5,
    titleEn: 'Topiramate Bilateral Blurry Vision & Eye Pain: Stop Topiramate & Avoid Pilocarpine Drops',
    titleEs: 'Visión Borrosa y Dolor Ocular Bilateral por Topiramato: Suspender Fármaco y Evitar Pilocarpina',
    detailEn: 'Topiramate (prescribed for alcohol cravings or migraine) can cause sudden bilateral angle-closure glaucoma by swelling the ciliary body. Unlike classic angle-closure, Pilocarpine drops make Topiramate glaucoma WORSE! Stop Topiramate immediately and use cycloplegic drops (Atropine) + pressure-lowering therapy.',
    detailEs: 'El Topiramato puede causar glaucoma agudo bilateral por efusión del cuerpo ciliar. ¡A diferencia del glaucoma clásico, las gotas de Pilocarpina EMPEORAN el glaucoma por Topiramato! Suspenda el Topiramato y use ciclopléjicos (Atropina) e hipotensores oculares.',
  },
  {
    ruleNum: 6,
    titleEn: 'Swollen Eyelid Red Flags: Pain Moving the Eye, Bulging, or Faded Red Color = Emergency CT/MRV',
    titleEs: 'Signos de Alarma en Párpado Inflamado: Dolor al Mover el Ojo, Proptosis o Pérdida del Color Rojo',
    detailEn: 'If a sinus infection or facial wound causes pain when moving the eyes, bulging (proptosis), inability to look outward (CN VI palsy), or faded red color vision, infection has crossed into the orbit or cavernous sinus—seek emergency hospital care immediately.',
    detailEs: 'Si una sinusitis o herida facial provoca dolor al mover el ojo, exoftalmos (proptosis), incapacidad para mirar hacia afuera (parálisis del VI par) o pérdida del brillo del color rojo, la infección ha invadido la órbita o el seno cavernoso.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE INVARIANT)
// ============================================================================

const DEFAULT_OCULAR_STATE = Object.freeze({
  activeTab: 'syndromes', // 'syndromes' | 'evaluator' | 'rules' | 'sbar'
  // Clinical Risk Evaluator Flags
  snowstormVisionMoonshineAcidosis: false,
  floatersHypopyonVisionLossPwid: false,
  painlessSuddenMonocularBlindnessCrao: false,
  bilateralEyePainBlurTopiramate: false,
  proptosisPainfulEyeMovementDiplopia: false,
  severeCornealPainPhotophobiaStimulantSmoke: false,
  centralLightSpotsBlurAfterPoppers: false,
  sbarCopied: false,
});

let ocularRamState = { ...DEFAULT_OCULAR_STATE };
const stateListeners = new Set();

export function getOcularState() {
  return { ...ocularRamState };
}

export function setOcularState(patch) {
  ocularRamState = { ...ocularRamState, ...patch };
  stateListeners.forEach((fn) => fn(getOcularState()));
  return getOcularState();
}

export function resetOcularState() {
  ocularRamState = { ...DEFAULT_OCULAR_STATE };
  stateListeners.forEach((fn) => fn(getOcularState()));
  return getOcularState();
}

export function subscribeOcularState(fn) {
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}

// ============================================================================
// CLINICAL DECISION SUPPORT: OPHTHALMIC & OCULAR TOXICOLOGY EVALUATOR
// ============================================================================

export function evaluateOcularRisk(state = ocularRamState) {
  const flags = [];
  let urgency = 'precautionary'; // 'emergency_911' | 'urgent_eval' | 'specialty_consult' | 'precautionary'

  const escalate = (level) => {
    const order = ['precautionary', 'specialty_consult', 'urgent_eval', 'emergency_911'];
    if (order.indexOf(level) > order.indexOf(urgency)) {
      urgency = level;
    }
  };

  // 1. Methanol Toxic Optic Neuropathy & Formic Acid Blindness (Emergency 911)
  if (state.snowstormVisionMoonshineAcidosis) {
    escalate('emergency_911');
    flags.push({
      id: 'methanol_formic_acid_optic_neuropathy_emergency',
      severity: 'critical',
      titleEn: 'Suspected Methanol ("Moonshine") Formic Acid Optic Neuropathy & Metabolic Acidosis',
      titleEs: 'Sospecha de Neuropatía Óptica por Metanol (Ácido Fórmico) y Acidosis Metabólica',
      descEn: 'CRITICAL TOXICOLOGIC & SIGHT-SAVING EMERGENCY: "Snowstorm vision" or blurred vision after moonshine/adulterated alcohol signals formic acid inhibition of optic nerve cytochrome c oxidase. Do NOT wait for methanol levels! Immediately administer Fomepizole (15 mg/kg IV load) or Ethanol, PLUS High-Dose IV Leucovorin (Folinic Acid 50 mg IV q4–6h) or Folic Acid (to clear formate), PLUS IV Sodium Bicarbonate (target pH 7.45–7.50 to ion-trap formate out of the optic nerve), and initiate emergent Hemodialysis!',
      descEs: 'EMERGENCIA TOXICOLÓGICA Y OFTALMOLÓGICA CRÍTICA: La "visión en tormenta de nieve" tras alcohol adulterado indica toxicidad del nervio óptico por ácido fórmico. ¡No esperar niveles de metanol! Administrar de inmediato Fomepizol (15 mg/kg IV) o Etanol, MÁS Leucovorina/Ácido Fólico IV en altas dosis (50 mg cada 4–6 h), MÁS Bicarbonato Sódico IV (pH 7,45–7,50) e iniciar Hemodiálisis urgente.',
    });
  }

  // 2. Endogenous Fungal/Bacterial Endophthalmitis in PWID (Emergency 911)
  if (state.floatersHypopyonVisionLossPwid) {
    escalate('emergency_911');
    flags.push({
      id: 'endogenous_endophthalmitis_intravitreal_emergency',
      severity: 'critical',
      titleEn: 'Suspected Endogenous Fungal or Bacterial Endophthalmitis (Blood-Retinal Barrier Alert)',
      titleEs: 'Sospecha de Endoftalmitis Endógena Fúngica o Bacteriana (Alerta de Barrera Hematorretiniana)',
      descEn: 'CRITICAL SIGHT-THREATENING EMERGENCY: Floaters, blurred vision, deep eye pain, or hypopyon in a person who injects drugs indicates endogenous endophthalmitis (often Candida from lemon juice heroin preparation or MRSA/Bacillus). Because the Blood-Retinal Barrier blocks IV vancomycin and echinocandins (never use micafungin monotherapy!), call Ophthalmology STAT for emergent Intravitreal Tap & Inject (intravitreal vancomycin/ceftazidime or voriconazole/amphotericin B) +/- vitrectomy, plus systemic Fluconazole/Voriconazole and blood cultures!',
      descEs: 'EMERGENCIA OFTALMOLÓGICA CRÍTICA: Miodesopsias, visión borrosa, dolor ocular o hipopión en usuarios de vía parenteral indican endoftalmitis endógena. Como la barrera hematorretiniana bloquea la vancomicina IV y las equinocandinas (nunca usar micafungina sola), solicitar Oftalmología URGENTE para punción e Inyección Intravítrea directa +/- vitrectomía, más Fluconazol/Voriconazol sistémico y hemocultivos.',
    });
  }

  // 3. Central Retinal Artery Occlusion (CRAO — "Stroke of the Eye") (Emergency 911)
  if (state.painlessSuddenMonocularBlindnessCrao) {
    escalate('emergency_911');
    flags.push({
      id: 'crao_retinal_stroke_emergency',
      severity: 'critical',
      titleEn: 'Suspected Central Retinal Artery Occlusion (CRAO — "Stroke of the Eye")',
      titleEs: 'Sospecha de Oclusión de la Arteria Central de la Retina (OACR — "Ictus Ocular")',
      descEn: 'CRITICAL NEURO-OPHTHALMIC STROKE EMERGENCY: Sudden, painless monocular vision loss with an afferent pupillary defect (RAPD) and macular "cherry-red spot" after cocaine/methamphetamine use or from endocarditis emboli indicates CRAO. Retinal tissue infarcts irreversibly within 90–240 minutes! Activate Hospital Stroke Code immediately, obtain emergent brain/carotid CTA and echocardiography (to rule out left-sided infective endocarditis), and consult Ophthalmology.',
      descEs: 'EMERGENCIA NEUROOFTALMOLÓGICA CRÍTICA: La pérdida visual monocular súbita e indolora con defecto pupilar aferente (DPAR) tras estimulantes o por émbolos de endocarditis indica OACR. ¡La retina se infarta en 90–240 minutos! Activar Código Ictus de inmediato, realizar Angio-TC y ecocardiograma (descartar endocarditis izquierda) y avisar a Oftalmología.',
    });
  }

  // 4. Orbital Cellulitis & Septic Cavernous Sinus Thrombosis (CST) (Emergency 911)
  if (state.proptosisPainfulEyeMovementDiplopia) {
    escalate('emergency_911');
    flags.push({
      id: 'orbital_cellulitis_cavernous_sinus_thrombosis',
      severity: 'critical',
      titleEn: 'Suspected Post-Septal Orbital Cellulitis or Septic Cavernous Sinus Thrombosis (CST)',
      titleEs: 'Sospecha de Celulitis Orbitaria Postseptal o Trombosis Séptica del Seno Cavernoso (TSC)',
      descEn: 'CRITICAL INTRACRANIAL & ORBITAL EMERGENCY: Proptosis (bulging eye), painful/restricted eye movement, diplopia (especially CN VI lateral gaze palsy), or loss of red color saturation (dyschromatopsia) indicates infection behind the orbital septum or extending into the Cavernous Sinus. Obtain stat CT/MR Venography (CTV/MRV) of Brain & Orbits, initiate immediate IV Vancomycin + Cefepime/Ceftriaxone + Metronidazole, consult Ophthalmology/ENT for surgical drainage, and start IV Heparin if CST is confirmed.',
      descEs: 'EMERGENCIA ORBITARIA E INTRACRANEAL CRÍTICA: Proptosis, dolor al mover el ojo, diplopía (especialmente parálisis del VI par) o pérdida de saturación del color rojo indican invasión postseptal o Trombosis del Seno Cavernoso. Solicitar Angio-TC/Venografía-RM cerebral y orbitaria urgente, iniciar Vancomicina + Cefepima/Ceftriaxona + Metronidazol IV, drenaje quirúrgico y anticoagulación con Heparina si se confirma TSC.',
    });
  }

  // 5. Topiramate Bilateral Acute Angle-Closure Glaucoma (Pilocarpine Contraindication) (Urgent Eval)
  if (state.bilateralEyePainBlurTopiramate) {
    escalate('urgent_eval');
    flags.push({
      id: 'topiramate_ciliochoroidal_glaucoma_alert',
      severity: 'high',
      titleEn: 'Topiramate-Induced Bilateral Acute Angle-Closure Glaucoma (PILOCARPINE IS CONTRAINDICATED!)',
      titleEs: 'Glaucoma Agudo de Ángulo Cerrado Bilateral por Topiramato (¡PILOCARPINA CONTRAINDICADA!)',
      descEn: 'URGENT OPHTHALMIC ANTIDOTE TRAP: Bilateral eye pain, halos, acute nearsightedness (myopic shift), and high intraocular pressure on Topiramate are caused by idiosyncratic ciliochoroidal effusion rotating the ciliary body forward—NOT pupillary block! DO NOT ADMINISTER PILOCARPINE (miotics worsen ciliary spasm and anterior lens displacement) and do not perform laser iridotomy! Immediately discontinue Topiramate and administer Cycloplegic drops (Atropine 1% / Cyclopentolate) to retract the ciliary body posteriorly, plus topical Timolol/Dorzolamide and IV Acetazolamide/Mannitol.',
      descEs: 'TRAMPA OFTALMOLÓGICA URGENTE: El dolor ocular bilateral, miopía aguda y PIO elevada por Topiramato se deben a efusión ciliocoroidea (no a bloqueo pupilar). ¡NO ADMINISTRAR PILOCARPINA (empeora el desplazamiento anterior del cristalino) ni realizar iridotomía láser! Suspender Topiramato de inmediato y administrar Ciclopléjicos (Atropina/Ciclopentolato) para retraer el cuerpo ciliar, junto con Timolol/Dorzolamida y Acetazolamida/Manitol.',
    });
  }

  // 6. "Crack Cornea" Microbial Keratitis & Topical Anesthetic Prohibition (Urgent Eval)
  if (state.severeCornealPainPhotophobiaStimulantSmoke) {
    escalate('urgent_eval');
    flags.push({
      id: 'crack_cornea_microbial_keratitis_eval',
      severity: 'high',
      titleEn: 'Suspected "Crack Cornea" Epithelial Defect / Microbial Ulcer (Strict Topical Anesthetic Prohibition)',
      titleEs: 'Sospecha de Úlcera Corneal / "Córnea de Crack" (Prohibición Estricta de Anestésicos Tópicos)',
      descEn: 'URGENT CORNEAL PROTOCOL: Perform slit-lamp fluorescein staining to evaluate for epithelial defects, stromal infiltrate (Pseudomonas/Staphylococcus), or hypopyon. NEVER prescribe or allow take-home topical anesthetic drops (Proparacaine/Tetracaine), which cause rapid corneal stromal melt and perforation! Treat with hourly fourth-generation fluoroquinolone drops (Moxifloxacin 0.5%) or fortified Vancomycin + Tobramycin drops, preservative-free lubrication, cycloplegics, and oral analgesia (never patch the eye!).',
      descEs: 'PROTOCOLO CORNEAL URGENTE: Realizar tinción con fluoresceína para detectar úlcera estromal (Pseudomonas/Staphylococcus) o hipopión. ¡NUNCA recetar ni entregar colirios anestésicos (Proparacaína/Tetracaína) para casa, ya que provocan lisis y perforación corneal! Tratar con Moxifloxacino 0,5 % horario o colirios fortificados de Vancomicina + Tobramicina, lágrimas sin conservantes, ciclopléjicos y analgesia oral.',
    });
  }

  // 7. Poppers Maculopathy (Alkyl Nitrite Foveal Phototoxicity) (Specialty Consult)
  if (state.centralLightSpotsBlurAfterPoppers) {
    escalate('specialty_consult');
    flags.push({
      id: 'poppers_maculopathy_oct_consult',
      severity: 'moderate',
      titleEn: 'Suspected Poppers Maculopathy (Subfoveal Cone Ellipsoid Zone Disruption on SD-OCT)',
      titleEs: 'Sospecha de Maculopatía por Poppers (Disrupción de la Zona Elipsoide Subfoveal en SD-OCT)',
      descEn: 'RETINAL SPECIALTY DIRECTIVE: Central phosphenes (flickering yellow light spots), wavy lines (metamorphopsia), or reduced central acuity after inhaling alkyl nitrites ("Poppers") indicate nitric-oxide phototoxicity to foveal cone photoreceptors. Refer for Spectral-Domain Optical Coherence Tomography (SD-OCT) of the macula, advise complete cessation of nitrite inhalants (most cases recover over 3–6 months of abstinence), and consider Lutein + Zeaxanthin supplementation.',
      descEs: 'DIRECTIVA DE RETINA: Los fosfenos centrales (destellos amarillos), metamorfopsia o caída de agudeza central tras inhalar nitritos ("Poppers") indican fototoxicidad foveal por óxido nítrico. Solicitar Tomografía de Coherencia Óptica (SD-OCT) macular, suspender totalmente los nitritos inhalados (la mayoría mejora en 3–6 meses) y valorar suplementación con Luteína + Zeaxantina.',
    });
  }

  // Default Precautionary Guidance
  if (flags.length === 0) {
    flags.push({
      id: 'standard_ocular_precautions',
      severity: 'low',
      titleEn: 'Standard Ophthalmic & Vision Preservation Harm Reduction Directives',
      titleEs: 'Directivas Estándar de Preservación Visual y Reducción de Daños Oftalmológicos',
      descEn: 'No acute vision-threatening red flags selected. Remind patients never to use lemon juice to dissolve drugs (use sterile citric/ascorbic acid packets to prevent Candida blindness), never take numbing eye drops home, avoid moonshine/bootleg alcohol, and seek immediate care for new floaters, eye pain, or sudden vision changes.',
      descEs: 'Sin signos de alarma visuales agudos seleccionados. Recordar nunca usar jugo de limón para disolver sustancias (usar sobres estériles de ácido cítrico/ascórbico para prevenir ceguera por Candida), nunca usar colirios anestésicos en casa y acudir de inmediato ante miodesopsias o pérdida visual.',
    });
  }

  return { urgency, flags };
}

// ============================================================================
// ZERO-PII SBAR CLINICAL HANDOFF GENERATOR
// ============================================================================

export function formatOcularSbarText(state = ocularRamState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateOcularRisk(state);

  const urgencyLabel = {
    emergency_911: isEs ? 'EMERGENCIA OFTALMOLÓGICA / TOXICOLÓGICA CRÍTICA (OFTALMOLOGÍA / URGENCIAS INMEDIATA)' : 'CRITICAL OPHTHALMIC / TOXICOLOGIC EMERGENCY (STAT OPHTHALMOLOGY / ED)',
    urgent_eval: isEs ? 'EVALUACIÓN OFTALMOLÓGICA URGENTE' : 'URGENT OPHTHALMIC EVALUATION',
    specialty_consult: isEs ? 'INTERCONSULTA DE RETINA / OFTALMOLOGÍA & OCT' : 'SPECIALTY RETINA / OPHTHALMOLOGY CONSULTATION & OCT',
    precautionary: isEs ? 'DIRECTIVAS PREVENTIVAS DE SALUD VISUAL' : 'PRECAUTIONARY VISION PRESERVATION DIRECTIVES',
  }[evalResult.urgency];

  const lines = [];
  lines.push('====================================================================');
  lines.push(isEs
    ? 'RESUMEN CLÍNICO SBAR HARBORPATH — OFTALMOLOGÍA, PÉRDIDA VISUAL Y TOXICOLOGÍA OCULAR (ZERO-PII)'
    : 'HARBORPATH CLINICAL SBAR SUMMARY — OPHTHALMOLOGY, VISION LOSS & OCULAR TOXICOLOGY (ZERO-PII)');
  lines.push('====================================================================');
  lines.push(`${isEs ? 'Nivel de Agudeza' : 'Acuity Level'}: ${urgencyLabel}`);
  lines.push(`${isEs ? 'Aviso de Privacidad' : 'Privacy Notice'}: ${isEs ? '100% En Memoria RAM Efímera (Sin PII)' : '100% Ephemeral In-RAM (Zero PII)'}`);
  lines.push('');

  // SITUATION
  lines.push(isEs ? '[S] SITUACIÓN (SITUATION):' : '[S] SITUATION:');
  if (state.snowstormVisionMoonshineAcidosis) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: "Visión en tormenta de nieve" tras alcohol adulterado — Sospecha de intoxicación por Metanol / Ácido Fórmico (Fomepizol + Leucovorina + Bicarbonato + Diálisis).'
      : '  - CRITICAL ALERT: "Snowstorm vision" post-adulterated alcohol — Suspected Methanol / Formic Acid optic neuropathy (Fomepizole + Leucovorin + Bicarbonate + Hemodialysis).');
  }
  if (state.floatersHypopyonVisionLossPwid) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Miodesopsias, pérdida visual o hipopión en usuario de vía parenteral — Sospecha de Endoftalmitis Endógena (Requiere Inyección Intravítrea urgente).'
      : '  - CRITICAL ALERT: Floaters, vision loss, or hypopyon in PWID — Suspected Endogenous Endophthalmitis (Requires emergent Intravitreal Tap & Inject).');
  }
  if (state.painlessSuddenMonocularBlindnessCrao) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Ceguera monocular súbita e indolora — Sospecha de Oclusión de Arteria Central de la Retina (OACR / Código Ictus).'
      : '  - CRITICAL ALERT: Sudden painless monocular blindness — Suspected Central Retinal Artery Occlusion (CRAO / Stroke Code).');
  }
  if (state.proptosisPainfulEyeMovementDiplopia) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Proptosis, oftalmoplejía dolorosa o parálisis del VI par — Sospecha de Celulitis Orbitaria / Trombosis del Seno Cavernoso.'
      : '  - CRITICAL ALERT: Proptosis, painful ophthalmoplegia, or CN VI palsy — Suspected Orbital Cellulitis / Cavernous Sinus Thrombosis.');
  }
  if (!state.snowstormVisionMoonshineAcidosis && !state.floatersHypopyonVisionLossPwid && !state.painlessSuddenMonocularBlindnessCrao && !state.proptosisPainfulEyeMovementDiplopia) {
    lines.push(isEs
      ? '  - Evaluación de queratopatía por estimulantes, glaucoma por topiramato o maculopatía por poppers.'
      : '  - Evaluation for stimulant keratopathy, topiramate angle-closure glaucoma, or poppers maculopathy.');
  }
  lines.push('');

  // BACKGROUND
  lines.push(isEs ? '[B] ANTECEDENTES Y FACTORES OFTALMOLÓGICOS (BACKGROUND):' : '[B] BACKGROUND & OPHTHALMIC FACTORS:');
  lines.push(`  - ${isEs ? 'Dolor Ocular Bilateral + Miopía Aguda en Topiramato (¡Prohibido Pilocarpina!)' : 'Bilateral Eye Pain + Acute Myopia on Topiramate (Pilocarpine Contraindicated!)'}: ${state.bilateralEyePainBlurTopiramate ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push(`  - ${isEs ? 'Dolor Corneal / Fotofobia tras Humo de Crack/Metanfetamina ("Crack Cornea")' : 'Corneal Pain / Photophobia Post-Crack/Meth Smoke ("Crack Cornea")'}: ${state.severeCornealPainPhotophobiaStimulantSmoke ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push(`  - ${isEs ? 'Fosfenos Centrales / Visión Borrosa tras Nitritos ("Poppers" Maculopatía)' : 'Central Phosphenes / Blur Post-Nitrites ("Poppers" Maculopathy)'}: ${state.centralLightSpotsBlurAfterPoppers ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
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

export function ocularCareView() {
  const container = h('div', { class: 'ocular-care-view view-container' });

  function render() {
    clear(container);
    const state = getOcularState();
    const isEs = getLang() === 'es';

    // Header Banner
    const header = h('header', { class: 'ocular-header' }, [
      h('div', { class: 'ocular-badge-row' }, [
        h('span', { class: 'ocular-clinical-badge' }, isEs ? 'Oftalmología, Neurooftalmología y Toxicología Ocular' : 'Ophthalmology, Neuro-Ophthalmology & Ocular Toxicology'),
        h('span', { class: 'ocular-privacy-pill' }, isEs ? '100% En Memoria RAM · Sin PII' : '100% Ephemeral RAM · Zero PII'),
      ]),
      h('h1', { class: 'ocular-title' }, isEs
        ? 'Navegador de Oftalmología, Endoftalmitis, Ceguera por Metanol y Toxicología Ocular'
        : 'Ophthalmology, Endogenous Endophthalmitis, Methanol Blindness & Ocular Toxicology Navigator'),
      h('p', { class: 'ocular-subtitle' }, isEs
        ? 'Soporte de decisiones clínicas (AAO, IDSA y ACMT) para neuropatía óptica por metanol (ácido fórmico), endoftalmitis fúngica/bacteriana intravítrea, "córnea de crack", oclusión de arteria central de la retina (OACR), glaucoma por topiramato y maculopatía por poppers.'
        : 'Evidence-based clinical decision support (AAO, IDSA & ACMT) for methanol formic acid optic neuropathy, intravitreal fungal/bacterial endophthalmitis, "crack cornea", central retinal artery occlusion (CRAO), topiramate glaucoma, and poppers maculopathy.'),
    ]);
    container.appendChild(header);

    // Primary Tab Navigation
    const tabs = [
      { id: 'syndromes', labelEn: 'Ophthalmic & Retinal Syndromes', labelEs: 'Síndromes Oftalmológicos y Retinianos', iconName: 'activity' },
      { id: 'evaluator', labelEn: 'Clinical Triage & Risk Evaluator', labelEs: 'Triaje Clínico & Evaluador', iconName: 'clipboard' },
      { id: 'rules', labelEn: 'Field Vision Safety Rules', labelEs: 'Reglas Visuales de Campo', iconName: 'shield' },
      { id: 'sbar', labelEn: 'Clinical SBAR Note', labelEs: 'Nota Clínica SBAR', iconName: 'file-text' },
    ];

    const tabNav = h('nav', { class: 'ocular-tab-nav', role: 'tablist', 'aria-label': 'Ocular Care Sections' },
      tabs.map((tab) => {
        const isActive = state.activeTab === tab.id;
        const btn = h('button', {
          type: 'button',
          role: 'tab',
          class: `ocular-tab-btn ${isActive ? 'active' : ''}`,
          'aria-selected': isActive ? 'true' : 'false',
          'aria-controls': `tab-panel-${tab.id}`,
          id: `tab-btn-${tab.id}`,
        }, [
          icon(tab.iconName, { class: 'ocular-tab-icon' }),
          h('span', {}, isEs ? tab.labelEs : tab.labelEn),
        ]);
        btn.addEventListener('click', () => setOcularState({ activeTab: tab.id }));
        return btn;
      })
    );
    container.appendChild(tabNav);

    // Tab Panel Container
    const panel = h('section', {
      class: 'ocular-tab-panel',
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
    const footer = h('footer', { class: 'ocular-footer-notice' }, [
      icon('info', { class: 'ocular-footer-icon' }),
      h('p', {}, isEs
        ? 'Aviso Clínico: HarborPath proporciona pautas basadas en consensos de AAO, IDSA y ACMT. No sustituye la biomicroscopía con lámpara de hendidura, tonometría, fondo de ojo dilatado o inyección intravítrea oftalmológica de urgencia.'
        : 'Clinical Notice: HarborPath provides evidence-based guidelines from AAO, IDSA, and ACMT. It does not replace slit-lamp biomicroscopy, tonometry, dilated fundoscopy, or emergent ophthalmic intravitreal intervention.'),
    ]);
    container.appendChild(footer);
  }

  // Panel 1: Syndromes
  function renderSyndromesPanel(panel, isEs) {
    const intro = h('div', { class: 'ocular-panel-intro' }, [
      h('h2', {}, isEs ? 'Taxonomía de Emergencias Oftalmológicas, Retinianas y Neurooftalmológicas' : 'Substance-Associated Ophthalmic, Retinal & Neuro-Ophthalmic Syndromes Taxonomy'),
      h('p', {}, isEs
        ? 'Fisiopatología y directivas para neuropatía óptica por metanol, endoftalmitis endógena, "córnea de crack", OACR, glaucoma por topiramato, maculopatía por poppers y trombosis del seno cavernoso.'
        : 'Pathophysiology and directives for methanol optic neuropathy, endogenous endophthalmitis, "crack cornea", CRAO, topiramate glaucoma, poppers maculopathy, and cavernous sinus thrombosis.'),
    ]);
    panel.appendChild(intro);

    const list = h('div', { class: 'ocular-syndromes-list' },
      Object.values(OCULAR_SYNDROME_PROFILES).map((syndrome) => {
        return h('article', { class: 'ocular-syndrome-card' }, [
          h('h3', { class: 'ocular-syndrome-title' }, isEs ? syndrome.nameEs : syndrome.nameEn),
          h('div', { class: 'ocular-section' }, [
            h('strong', {}, isEs ? 'Mecanismo Fisiopatológico:' : 'Pathophysiologic Mechanism:'),
            h('p', {}, isEs ? syndrome.pathophysiologyEs : syndrome.pathophysiologyEn),
          ]),
          h('div', { class: 'ocular-section' }, [
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
    const intro = h('div', { class: 'ocular-panel-intro' }, [
      h('h2', {}, isEs ? 'Evaluador de Riesgo Oftalmológico y Triaje de Pérdida Visual' : 'Ophthalmic Risk Evaluator & Vision Loss Triage'),
      h('p', {}, isEs
        ? 'Marque los síntomas visuales y hallazgos oculares para obtener la estratificación de agudeza y las contraindicaciones críticas de colirios y antídotos.'
        : 'Select observed visual symptoms and ocular signs to receive real-time acuity stratification and critical eye-drop/antidote contraindications.'),
    ]);
    panel.appendChild(intro);

    const checklistItems = [
      { key: 'snowstormVisionMoonshineAcidosis', labelEn: '"Snowstorm vision" / blurred vision + rapid breathing or acidosis after moonshine / unknown alcohol (Methanol Formic Acid Toxicity)', labelEs: '"Visión en tormenta de nieve" / borrosa + acidosis tras alcohol adulterado o artesanal (Toxicidad por Metanol / Ácido Fórmico)' },
      { key: 'floatersHypopyonVisionLossPwid', labelEn: 'New dark floaters ("cobwebs"), blurred vision, eye pain, or white layer in iris (hypopyon) in PWID (Endogenous Endophthalmitis)', labelEs: 'Nuevas miodesopsias ("telarañas"), visión borrosa, dolor ocular o nivel blanco (hipopión) en vía parenteral (Endoftalmitis Endógena)' },
      { key: 'painlessSuddenMonocularBlindnessCrao', labelEn: 'Sudden PAINLESS monocular vision loss after cocaine/meth or with endocarditis risk (Central Retinal Artery Occlusion / Stroke Code)', labelEs: 'Pérdida visual monocular SÚBITA E INDOLORA tras cocaína/metanfetamina o con endocarditis (OACR / Código Ictus)' },
      { key: 'proptosisPainfulEyeMovementDiplopia', labelEn: 'Bulging eye (proptosis), painful/restricted eye movement, double vision (CN VI palsy), or faded red color vision (Orbital / Cavernous Sinus)', labelEs: 'Ojo prominente (proptosis), dolor al mover el ojo, visión doble (parálisis VI par) o pérdida del color rojo (Celulitis Orbitaria / Seno Cavernoso)' },
      { key: 'bilateralEyePainBlurTopiramate', labelEn: 'Bilateral eye pain, halos around lights, and sudden nearsightedness while taking Topiramate (Skip Pilocarpine — Use Cycloplegics)', labelEs: 'Dolor ocular bilateral, halos y miopía súbita tomando Topiramato (Prohibido Pilocarpina — Usar Ciclopléjicos)' },
      { key: 'severeCornealPainPhotophobiaStimulantSmoke', labelEn: 'Severe corneal pain, photophobia, and redness after smoking crack/meth ("Crack Cornea" — Never Dispense Topical Anesthetics)', labelEs: 'Dolor corneal intenso, fotofobia y ojo rojo tras fumar crack/metanfetamina ("Córnea de Crack" — Prohibido Anestésicos Tópicos en Casa)' },
      { key: 'centralLightSpotsBlurAfterPoppers', labelEn: 'Central flickering yellow light spots (phosphenes) or central blur after inhaling alkyl nitrites ("Poppers" Maculopathy)', labelEs: 'Destellos amarillos centrales (fosfenos) o borrosidad central tras inhalar nitritos de alquilo (Maculopatía por "Poppers")' },
    ];

    const checklistForm = h('div', { class: 'ocular-evaluator-checklist' },
      checklistItems.map((item) => {
        const isChecked = !!state[item.key];
        const label = h('label', { class: `ocular-check-item ${isChecked ? 'selected' : ''}` }, [
          h('input', {
            type: 'checkbox',
            checked: isChecked,
            class: 'ocular-checkbox',
          }),
          h('span', { class: 'ocular-check-label' }, isEs ? item.labelEs : item.labelEn),
        ]);
        const input = label.querySelector('input');
        input.addEventListener('change', (e) => {
          setOcularState({ [item.key]: e.target.checked });
        });
        return label;
      })
    );
    panel.appendChild(checklistForm);

    // Reset Button
    const resetBar = h('div', { class: 'ocular-evaluator-actions' }, [
      h('button', {
        type: 'button',
        class: 'ocular-reset-btn',
      }, [
        icon('rotate-ccw', { class: 'ocular-btn-icon' }),
        h('span', {}, isEs ? 'Restablecer Evaluación' : 'Reset Assessment'),
      ]),
    ]);
    resetBar.querySelector('button').addEventListener('click', () => resetOcularState());
    panel.appendChild(resetBar);

    // Results Box
    const evalResult = evaluateOcularRisk(state);
    const resultsContainer = h('div', { class: `ocular-eval-results acuity-${evalResult.urgency}` }, [
      h('div', { class: 'ocular-eval-urgency-badge' }, [
        icon(evalResult.urgency === 'emergency_911' ? 'alert-octagon' : evalResult.urgency === 'urgent_eval' ? 'alert-triangle' : 'info', { class: 'ocular-urgency-icon' }),
        h('span', { class: 'ocular-urgency-text' },
          evalResult.urgency === 'emergency_911'
            ? (isEs ? 'EMERGENCIA OFTALMOLÓGICA / TOXICOLÓGICA CRÍTICA (LLAMAR AL 911 / OFTALMOLOGÍA INMEDIATA)' : 'CRITICAL OPHTHALMIC / TOXICOLOGIC EMERGENCY (CALL 911 / STAT OPHTHALMOLOGY)')
            : evalResult.urgency === 'urgent_eval'
            ? (isEs ? 'EVALUACIÓN OFTALMOLÓGICA URGENTE & PROTOCOLO INDICADO' : 'URGENT OPHTHALMIC EVALUATION & PROTOCOL REQUIRED')
            : evalResult.urgency === 'specialty_consult'
            ? (isEs ? 'INTERCONSULTA DE RETINA & OCT MACULAR' : 'SPECIALTY RETINA CONSULTATION & MACULAR OCT')
            : (isEs ? 'DIRECTIVAS PREVENTIVAS DE SALUD VISUAL' : 'PRECAUTIONARY VISION PRESERVATION DIRECTIVES')
        ),
      ]),
      h('div', { class: 'ocular-eval-flags-list' },
        evalResult.flags.map((flag) => {
          return h('div', { class: 'ocular-flag-item' }, [
            h('h4', { class: 'ocular-flag-title' }, isEs ? flag.titleEs : flag.titleEn),
            h('p', { class: 'ocular-flag-desc' }, isEs ? flag.descEs : flag.descEn),
          ]);
        })
      ),
    ]);
    panel.appendChild(resultsContainer);
  }

  // Panel 3: Rules
  function renderRulesPanel(panel, isEs) {
    const intro = h('div', { class: 'ocular-panel-intro' }, [
      h('h2', {}, isEs ? 'Directivas de Preservación Visual y Reducción de Daños Oftalmológicos de Campo' : 'Field Vision Preservation & Ophthalmic Harm Reduction Directives'),
      h('p', {}, isEs
        ? 'Seis reglas clínicas fundamentales para prevenir ceguera por Candida asociada a jugo de limón, perforación corneal por anestésicos tópicos, atrofia óptica por metanol y glaucoma por topiramato.'
        : 'Six essential clinical directives to prevent lemon-juice Candida blindness, topical anesthetic corneal perforation, methanol optic atrophy, and topiramate glaucoma.'),
    ]);
    panel.appendChild(intro);

    const rulesList = h('div', { class: 'ocular-directives-grid' },
      OCULAR_HARM_REDUCTION_RULES.map((rule) => {
        return h('article', { class: 'ocular-directive-card' }, [
          h('div', { class: 'ocular-directive-num' }, `0${rule.ruleNum}`),
          h('h3', { class: 'ocular-directive-title' }, isEs ? rule.titleEs : rule.titleEn),
          h('p', { class: 'ocular-directive-text' }, isEs ? rule.detailEs : rule.detailEn),
        ]);
      })
    );
    panel.appendChild(rulesList);
  }

  // Panel 4: SBAR Note
  function renderSbarPanel(panel, state, isEs) {
    const intro = h('div', { class: 'ocular-panel-intro' }, [
      h('h2', {}, isEs ? 'Generador de Traspaso Clínico SBAR (Zero-PII)' : 'Zero-PII SBAR Clinical Handoff Note Generator'),
      h('p', {}, isEs
        ? 'Genere una nota clínica estructurada en formato SBAR (Situación, Antecedentes, Evaluación, Recomendación) para Oftalmología, Retina, Toxicología, Neurología y Urgencias. 100% en memoria RAM.'
        : 'Generate a structured SBAR clinical handoff note (Situation, Background, Assessment, Recommendation) for Ophthalmology, Retina, Toxicology, Neurology, and Emergency Medicine. Stored 100% in ephemeral RAM.'),
    ]);
    panel.appendChild(intro);

    const sbarText = formatOcularSbarText(state, isEs ? 'es' : 'en');

    const copyBtn = h('button', {
      type: 'button',
      class: 'ocular-copy-btn',
    }, [
      icon(state.sbarCopied ? 'check' : 'copy', { class: 'ocular-btn-icon' }),
      h('span', {}, state.sbarCopied
        ? (isEs ? '¡Copiado al Portapapeles!' : 'Copied to Clipboard!')
        : (isEs ? 'Copiar Informe SBAR' : 'Copy SBAR Note')
      ),
    ]);

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sbarText);
        setOcularState({ sbarCopied: true });
        setTimeout(() => setOcularState({ sbarCopied: false }), 2500);
      } catch (err) {
        console.error('Failed to copy SBAR text:', err);
      }
    });

    const actionContainer = h('div', { class: 'ocular-sbar-actions' }, [copyBtn]);
    panel.appendChild(actionContainer);

    const sbarBox = h('pre', { class: 'ocular-sbar-output', 'aria-label': 'SBAR Clinical Output' }, sbarText);
    panel.appendChild(sbarBox);
  }

  render();
  const unsubscribe = subscribeOcularState(render);

  return container;
}
