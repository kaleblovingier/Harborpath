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
 * Wave 51: Urologic & Genitourinary Emergencies, Ischemic Priapism,
 * Fournier Gangrene & Acute Urinary Retention Navigator (#/urology-care)
 *
 * Zero-PII, 100% ephemeral in-RAM clinical decision support module covering:
 *  1. Drug-Induced Low-Flow (Ischemic) Priapism (Trazodone, Cocaine, Antipsychotics, PDE5i/Chemsex)
 *  2. Fournier Gangrene (Fulminant Polymicrobial Necrotizing Fasciitis of the Perineum & Scrotum)
 *  3. Opioid-, Anticholinergic- & Sympathomimetic-Induced Acute Urinary Retention (AUR)
 *  4. Septic Cavernous Thrombosis, Penile Dorsal Vein Mondor Disease & Genital Injection Necrosis
 *  5. Ketamine & Novel Arylcyclohexylamine Ulcerative Cystitis & Obstructive Uropathy
 *  6. Paraphimosis, Entrapped Penile Constriction Rings & Traumatic Catheterization Injury
 */

export const UROLOGY_SYNDROME_PROFILES = Object.freeze({
  ischemic_priapism: Object.freeze({
    id: 'ischemic_priapism',
    urgency: 'EMERGENCY',
    badgeEn: 'STAT UROLOGIC COMPARTMENT SYNDROME (< 4h Window)',
    badgeEs: 'SÍNDROME COMPARTIMENTAL UROLÓGICO STAT (Ventana < 4h)',
    titleEn: 'Drug-Induced Low-Flow (Ischemic) Priapism (Trazodone, Cocaine, Antipsychotics & PDE5i)',
    titleEs: 'Priapismo Isquémico de Bajo Flujo Inducido por Fármacos (Trazodona, Cocaína, Antipsicóticos y PDE5i)',
    summaryEn:
      'Persistent, painful erection lasting > 4 hours unrelated to ongoing sexual stimulation, characterized by rigid, tender corpora cavernosa while the glans penis and corpus spongiosum remain soft. Frequently triggered by Trazodone (prescribed for sleep in early recovery), cocaine (intranasal, crack, or intracavernosal), antipsychotics (risperidone, quetiapine, chlorpromazine), or PDE5 inhibitors combined with stimulants/intracavernosal alprostadil.',
    summaryEs:
      'Erección dolorosa y persistente > 4 horas sin estimulación sexual continua, caracterizada por cuerpos cavernosos rígidos y dolorosos mientras el glande y el cuerpo esponjoso permanecen blandos. Desencadenado por Trazodona (recetada para el insomnio en recuperación), cocaína, antipsicóticos (risperidona, quetiapina, clorpromazina) o inhibidores de PDE5 combinados con estimulantes/alprostadil.',
    pathophysiologyEn:
      'Alpha-1 adrenergic receptor blockade (trazodone, antipsychotics) or norepinephrine reuptake exhaustion and nitric oxide dysregulation (cocaine, PDE5i) traps blood inside the corpora cavernosa. Closed-compartment ischemia ensues (pO2 < 30 mmHg, pCO2 > 60 mmHg, pH < 7.25), leading to trabecular smooth muscle necrosis and permanent fibrotic erectile dysfunction starting at 4–6 hours.',
    pathophysiologyEs:
      'El bloqueo alfa-1 adrenérgico (trazodona, antipsicóticos) o la desregulación simpática/óxido nítrico (cocaína, PDE5i) atrapa sangre en los cuerpos cavernosos. Se produce isquemia compartimental cerrada (pO2 < 30 mmHg, pCO2 > 60 mmHg, pH < 7.25), causando necrosis del músculo liso trabecular y disfunción eréctil fibrótica permanente a partir de las 4–6 horas.',
    diagnosticsEn: [
      'Physical Exam: Rigid, exquisitely tender corpora cavernosa with a SOFT glans penis and soft corpus spongiosum (distinguishes low-flow ischemic priapism from painless high-flow arterial priapism after perineal trauma).',
      'Cavernosal Blood Gas (via 19G lateral aspiration): Dark, crank-case viscous blood with pO2 < 30 mmHg, pCO2 > 60 mmHg, and pH < 7.25 confirms low-flow ischemia.',
      'Color Duplex Doppler Ultrasound (if diagnosis uncertain, must not delay aspiration): Absent or minimal cavernosal arterial inflow.',
      'Screen for Sickle Cell Disease (CBC, reticulocyte count, hemoglobin electrophoresis) and review medication/substance exposures (trazodone, cocaine, antipsychotics,Trimix/alprostadil).'
    ],
    diagnosticsEs: [
      'Examen físico: Cuerpos cavernosos rígidos y muy dolorosos con glande y cuerpo esponjoso BLANDOS (distingue el priapismo isquémico de bajo flujo del priapismo arterial de alto flujo indoloro post-trauma).',
      'Gasometría cavernosa (por aspiración lateral con aguja 19G): Sangre oscura y viscosa con pO2 < 30 mmHg, pCO2 > 60 mmHg y pH < 7.25 confirma isquemia de bajo flujo.',
      'Ecografía Doppler Duplex Color (si hay duda diagnóstica, sin retrasar la aspiración): Flujo arterial cavernoso ausente o mínimo.',
      'Descartar drepanocitosis (hemograma, reticulocitos) y revisar exposición a trazodona, cocaína, antipsicóticos o alprostadil.'
    ],
    managementEn: [
      'Dorsal Penile Nerve Block or Circumferential Penile Ring Block using 1% Lidocaine WITHOUT Epinephrine (NEVER use epinephrine in penile blocks—causes catastrophic end-artery necrosis).',
      'Corpora Cavernosa Aspiration & Saline Irrigation: Insert a 19G butterfly needle at the 2 o’clock or 10 o’clock position (strictly avoiding the 12 o’clock dorsal neurovascular bundle and 6 o’clock ventral urethra). Aspirate 20–50 mL of dark deoxygenated blood until bright red oxygenated blood returns.',
      'Intracavernosal Phenylephrine (First-Line Sympathomimetic): Dilute Phenylephrine (pure alpha-1 agonist) in normal saline to 100–500 mcg/mL; inject 100–200 mcg intracavernosally every 3–5 minutes (maximum 1,000 mcg over 1 hour) while monitoring blood pressure and ECG for reflex bradycardia or severe hypertension.',
      'Oral agents (pseudoephedrine, terbutaline) are INEFFECTIVE for ischemic priapism > 4 hours and must NEVER delay intracavernosal aspiration and phenylephrine.',
      'Emergent Urology Consultation for Distal Corporoglanular Shunt (Winter or Al-Ghorab / T-Shunt) if detumescence is not achieved after aspiration and 1,000 mcg intracavernosal phenylephrine.'
    ],
    managementEs: [
      'Bloqueo del nervio dorsal del pene o bloqueo en anillo con Lidocaína al 1% SIN Epinefrina (NUNCA usar epinefrina en el pene por riesgo de necrosis isquémica).',
      'Aspiración e Irrigación de Cuerpos Cavernosos: Insertar aguja mariposa 19G en posición de las 2 o las 10 horas (evitando el paquete neurovascular dorsal a las 12 h y la uretra ventral a las 6 h). Aspirar 20–50 mL de sangre oscura hasta obtener sangre roja oxigenada.',
      'Fenilefrina Intracavernosa (Primera Línea): Diluir Fenilefrina (agonista alfa-1 puro) en solución salina a 100–500 mcg/mL; inyectar 100–200 mcg cada 3–5 minutos (máximo 1,000 mcg en 1 hora) monitorizando PA y ECG por bradicardia refleja o crisis hipertensiva.',
      'Los agentes orales (pseudoefedrina, terbutalina) son INEFICACES en el priapismo isquémico > 4 horas y NUNCA deben retrasar la aspiración y fenilefrina intracavernosa.',
      'Consulta urgente a Urología para derivación corporoglandular distal (shunt de Winter o T-Shunt) si no cede tras aspiración y fenilefrina.'
    ],
    harmReductionEn:
      'Counsel patients prescribed Trazodone for sleep in recovery about the 1-in-1,000 to 1-in-5,000 risk of priapism (higher when combined with cocaine, antipsychotics, or PDE5 inhibitors) and the strict rule to seek emergency care at 2–4 hours—not the next morning.',
    harmReductionEs:
      'Advertir a los pacientes que reciben Trazodona para el insomnio sobre el riesgo de priapismo (mayor al combinar con cocaína, antipsicóticos o PDE5i) y acudir a urgencias a las 2–4 horas sin esperar al día siguiente.'
  }),

  fournier_gangrene: Object.freeze({
    id: 'fournier_gangrene',
    urgency: 'EMERGENCY',
    badgeEn: 'STAT SURGICAL DEBRIDEMENT + TRIPLE IV ANTIBIOTICS',
    badgeEs: 'DESBRIDAMIENTO QUIRÚRGICO STAT + TRIPLE ANTIBIÓTICO IV',
    titleEn: 'Fournier Gangrene (Fulminant Polymicrobial Necrotizing Fasciitis of the Perineum & Scrotum)',
    titleEs: 'Gangrena de Fournier (Fascitis Necrosante Polimicrobiana Fulminante del Periné y Escroto)',
    summaryEn:
      'Rapidly progressive, life-threatening polymicrobial necrotizing fasciitis of the perineal, genital, and perianal regions (20–40% mortality). Precipitated by inguinal/femoral ("groin hit") or scrotal/perineal injection, perirectal abscess, SGLT2 inhibitors, alcohol cirrhosis, or diabetes.',
    summaryEs:
      'Fascitis necrosante polimicrobiana rápidamente progresiva del periné, genitales y región perianal (mortalidad 20–40%). Precipitada por inyección inguinal/femoral o perineal/escrotal, absceso perirrectal, inhibidores SGLT2, cirrosis alcohólica o diabetes.',
    pathophysiologyEn:
      'Synergistic Type I polymicrobial aerobes (E. coli, Klebsiella, Streptococci, MRSA) and anaerobes (Bacteroides, Clostridium, Peptostreptococcus) produce collagenases, hyaluronidase, and exotoxins, obliterating endarteries and spreading at 2–3 cm/hour along Colles fascia, Buck fascia, and Scarpa fascia onto the anterior abdominal wall. Note: The testes are classically spared initially because their blood supply arises directly from the abdominal aorta (testicular arteries), separate from the internal pudendal supply of the scrotum.',
    pathophysiologyEs:
      'Infección polimicrobiana tipo I sinérgica (aerobios como E. coli, Klebsiella, Streptococcus, MRSA y anaerobios como Bacteroides, Clostridium) que avanza a 2–3 cm/hora por las fascias de Colles, Buck y Scarpa. Nota: Los testículos suelen respetarse inicialmente porque su irrigación proviene directamente de la aorta abdominal (arterias testiculares).',
    diagnosticsEn: [
      'Cardinal Clinical Red Flags: Severe perineal, scrotal, or labial pain out of proportion to early erythema, tense scrotal edema, subcutaneous crepitus ("Rice Krispies" gas sensation), dusky/bronze skin patches, bullae, and foul "dishwater" purulence.',
      'Point-of-Care Ultrasound (POCUS) / CT Pelvis with IV Contrast: Subcutaneous emphysema tracking along fascial planes and scrotal wall thickening. CRITICAL RULE: Imaging must NEVER delay operative exploration if crepitus, necrotic eschar, or septic shock is present.',
      'Labs: LRINEC score variables (CRP >= 150 mg/L, WBC > 15k–25k, Na < 135 mEq/L, Creatinine > 1.6 mg/dL, Glucose > 180 mg/dL), serum lactate, blood cultures x2, and fingerstick glucose (screen for euglycemic DKA if on SGLT2 inhibitor).'
    ],
    diagnosticsEs: [
      'Signos cardinales de alarma: Dolor perineal/escrotal/labial severo desproporcionado al eritema inicial, edema escrotal tenso, crepitación subcutánea (gas), piel violácea/bronceada, flictenas y exudado fétido en "agua de lavar platos".',
      'Ecografía POCUS / TC de pelvis con contraste IV: Gas subcutáneo en planos fasciales. REGLA CRÍTICA: La imagen NUNCA debe retrasar el quirófano si hay crepitación, necrosis o choque séptico.',
      'Laboratorios: Variables LRINEC (PCR >= 150 mg/L, leucocitosis, Na < 135 mEq/L, creatinina, glucosa), lactato sérico, hemocultivos x2 y cetonas (descartar CAD euglucémica por iSGLT2).'
    ],
    managementEn: [
      'IMMEDIATE Surgical Exploration & Radical Debridement in the Operating Room (Joint Urology + General/Acute Care Surgery): Time to first debridement (< 6 hours) is the single strongest modifiable determinant of survival.',
      'Empiric Broad-Spectrum IV Antibiotics (within 1 hour): IV Vancomycin (or Linezolid) + IV Piperacillin-Tazobactam (or Meropenem/Imipenem) + IV Clindamycin (900 mg IV q8h) to halt streptococcal/clostridial ribosomal toxin synthesis.',
      'Aggressive Crystalloid Resuscitation & Norepinephrine Vasopressor Support for septic shock; discontinue any SGLT2 inhibitor immediately.',
      'Post-Operative Intensive Pain & Withdrawal Management: Continue baseline Methadone or Buprenorphine (split TID–QID dosing) plus multimodal IV full-agonist opioid analgesia and ketamine infusions for repeated dressing changes and planned second-look debridements at 24–48 hours.'
    ],
    managementEs: [
      'Exploración Quirúrgica INMEDIATA y Desbridamiento Radical en Quirófano (Urología + Cirugía General): El tiempo hasta el primer desbridamiento (< 6 horas) es el principal determinante de supervivencia.',
      'Antibióticos IV de Amplio Espectro (en la 1ª hora): Vancomicina IV (o Linezolid) + Piperacilina-Tazobactam IV (o Meropenem) + Clindamicina IV (900 mg c/8h) para inhibir síntesis de toxinas ribosomales.',
      'Reanimación hídrica intensiva y Norepinefrina para choque séptico; suspender inhibidores SGLT2 de inmediato.',
      'Manejo de dolor postoperatorio y abstinencia: Mantener Metadona o Buprenorfina basal más analgesia multimodal e infusión de ketamina para curaciones y reexploraciones a las 24–48 horas.'
    ],
    harmReductionEn:
      'In patients injecting into femoral ("groin") or perineal veins due to peripheral venous exhaustion, provide non-judgmental education on the extreme risk of Fournier gangrene, septic DVT, and femoral pseudoaneurysm, alongside rapid transition to MOUD or safer peripheral/non-injection routes.',
    harmReductionEs:
      'En personas que inyectan en venas femorales ("ingle") o perineales por agotamiento venoso periférico, brindar educación sin estigma sobre el riesgo extremo de gangrena de Fournier y transición rápida a TMO o vías no inyectables.'
  }),

  acute_urinary_retention: Object.freeze({
    id: 'acute_urinary_retention',
    urgency: 'URGENT',
    badgeEn: 'BLADDER DECOMPRESSION + POST-OBSTRUCTIVE DIURESIS WATCH',
    badgeEs: 'DESCOMPRESIÓN VESICAL + VIGILANCIA DE DIURESIS POST-OBSTRUCTIVA',
    titleEn: 'Opioid-, Anticholinergic- & Sympathomimetic-Induced Acute Urinary Retention (AUR)',
    titleEs: 'Retención Urinaria Aguda (RUA) Inducida por Opioides, Anticolinérgicos y Simpaticomiméticos',
    summaryEn:
      'Inability to voluntarily void despite a distended bladder (> 300–1,000+ mL), frequently presenting as suprapubic pain or—in sedated/intoxicated patients—as unexplained severe agitation, delirium, tachycardia, and hypertension ("silent bladder distension").',
    summaryEs:
      'Incapacidad para orinar voluntariamente con vejiga distendida (> 300–1,000+ mL), que se presenta con dolor suprapúbico o—en pacientes sedados/intoxicados—como agitación severa inexplicable, delirio, taquicardia e hipertensión ("distensión vesical silenciosa").',
    pathophysiologyEn:
      'Three pharmacologic mechanisms converge: (1) Mu-opioid agonists (fentanyl, methadone, morphine) inhibit sacral parasympathetic outflow (S2–S4 pelvic splanchnic nerves), decreasing detrusor contractility and blunting the urge sensation while increasing external urethral sphincter tone; (2) Anticholinergics/antihistamines (diphenhydramine, hydroxyzine, benztropine, TCAs, antipsychotics) block M3 muscarinic detrusor receptors; (3) Sympathomimetics (methamphetamine, cocaine, MDMA, ephedrine) stimulate alpha-1A adrenergic receptors in the bladder neck and prostatic smooth muscle, causing functional outlet obstruction.',
    pathophysiologyEs:
      'Convergen tres mecanismos: (1) Los agonistas mu-opioides (fentanilo, metadona, morfina) inhiben el flujo parasimpático sacro (S2–S4), reduciendo la contractilidad del detrusor y aumentando el tono del esfínter uretral; (2) Los anticolinérgicos/antihistamínicos (difenhidramina, hidroxizina, antipsicóticos) bloquean receptores muscarínicos M3; (3) Los simpaticomiméticos (metanfetamina, cocaína, MDMA) estimulan receptores alfa-1A en el cuello vesical y próstata.',
    diagnosticsEn: [
      'Bedside Bladder Ultrasound / POCUS: Post-void residual (PVR) or bladder volume > 300–400 mL (often > 800–1,500 mL in opioid/anticholinergic toxicity). Always scan the bladder in any sedated or agitated emergency patient!',
      'Neurologic Screen for Cauda Equina / Spinal Epidural Abscess: Check saddle anesthesia, rectal tone, and bilateral lower-extremity motor/reflexes (new overflow retention + back pain in PWID requires STAT MRI spine!).',
      'Renal Panel & Urinalysis: Serum creatinine/BUN (rule out post-renal obstructive AKI / bilateral hydronephrosis), potassium, and UA/culture.'
    ],
    diagnosticsEs: [
      'Ecografía Vesical POCUS a pie de cama: Volumen vesical > 300–400 mL (a menudo > 800–1,500 mL en toxicidad por opioides/anticolinérgicos). ¡Escanear siempre la vejiga en todo paciente sedado o agitado!',
      'Tamizaje neurológico de Cola de Caballo / Absceso Epidural Espinal: Evaluar anestesia en silla de montar, tono rectal y fuerza en miembros inferiores (retención + dolor dorsal en PID exige RM espinal STAT).',
      'Panel renal y uroanálisis: Creatinina/BUN (descartar LRA obstructiva post-renal / hidronefrosis bilateral), potasio y urocultivo.'
    ],
    managementEn: [
      'Immediate Urethral Foley Catheterization (16–18 Fr; use a Coudé-tip catheter if prostatic hypertrophy or severe alpha-1 sphincter spasm is encountered). Never force a catheter against hard resistance (rule out urethral stricture).',
      'Alpha-1A Blocker Initiation: Start Tamsulosin 0.4 mg PO daily (or Alfuzosin 10 mg daily) immediately upon catheter placement to relax bladder neck/prostatic smooth muscle and double the success rate of a Trial Without Catheter (TWOC) at 48–72 hours.',
      'Monitor for Post-Obstructive Diuresis (POD) & Hematuria Ex Vacuo: If drained volume > 1,000 mL, monitor urine output hourly. Urine output > 200 mL/hr for 2 consecutive hours indicates pathologic POD requiring IV 0.45% NaCl fluid replacement (50–75% of hourly output) and q6–12h checks of K+, Mg2+, and PO4 to prevent hypovolemic shock and arrhythmias. Note: Rapid complete decompression does NOT need to be clamped intermittently.',
      'Medication De-escalation: Discontinue offending anticholinergics (diphenhydramine, hydroxyzine, benztropine). For opioid-induced retention without respiratory depression, avoid high-dose naloxone that precipitates withdrawal; consider peripheral opioid antagonists or micro-dose titration if clinically indicated while maintaining MOUD.'
    ],
    managementEs: [
      'Cateterismo Uretral con Sonda Foley Inmediato (16–18 Fr; usar sonda tipo Coudé si hay hiperplasia prostática o espasmo alfa-1). Nunca forzar una sonda contra resistencia firme (descartar estenosis uretral).',
      'Iniciar Bloqueador Alfa-1A: Tamsulosina 0.4 mg VO c/24h (o Alfuzosina 10 mg) para relajar el cuello vesical y duplicar el éxito del retiro de sonda a las 48–72 horas.',
      'Vigilar Diuresis Post-Obstructiva (DPO): Si se drenan > 1,000 mL, medir diuresis horaria. Gasto > 200 mL/h por 2 horas consecutivas requiere reposición con solución salina 0.45% IV y control de K+, Mg2+ y PO4.',
      'Desescalada farmacológica: Suspender anticolinérgicos (difenhidramina, hidroxizina). Mantener TMO sin precipitar abstinencia con dosis altas de naloxona.'
    ],
    harmReductionEn:
      'Warn individuals combining opioids with OTC sleep aids (diphenhydramine/doxylamine) or stimulants (methamphetamine/MDMA) that inability to urinate for > 6–8 hours requires urgent catheter decompression to prevent kidney damage or bladder rupture.',
    harmReductionEs:
      'Advertir a quienes combinan opioides con antihistamínicos de venta libre (difenhidramina) o estimulantes (metanfetamina/MDMA) que no poder orinar por > 6–8 horas requiere descompresión urgente con sonda.'
  }),

  genital_injection_necrosis: Object.freeze({
    id: 'genital_injection_necrosis',
    urgency: 'EMERGENCY',
    badgeEn: 'END-ARTERY ISCHEMIA + CAVERNOSAL ABSCESS RISK',
    badgeEs: 'ISQUEMIA DE ARTERIA TERMINAL + RIESGO DE ABSCESO CAVERNOSO',
    titleEn: 'Septic Cavernous Thrombosis, Penile Mondor Disease & Genital Injection Necrosis',
    titleEs: 'Trombosis Séptica Cavernosa, Enfermedad de Mondor Peneana y Necrosis por Inyección Genital',
    summaryEn:
      'High-acuity vascular and infectious complications following injection into the superficial/deep dorsal vein of the penis, corpora cavernosa, scrotum, or labia when peripheral limb and neck veins are sclerosed.',
    summaryEs:
      'Complicaciones vasculares e infecciosas graves tras la inyección en la vena dorsal superficial/profunda del pene, cuerpos cavernosos, escroto o labios mayores cuando las venas periféricas están esclerosadas.',
    pathophysiologyEn:
      'Direct venipuncture of the dorsal penile vein or inadvertent intra-cavernosal/intra-arterial injection of cocaine, methamphetamine, crushed tablets, or xylazine-adulterated fentanyl causes (1) Suppurative thrombophlebitis of the dorsal vein (septic Mondor disease), (2) Corpora cavernosa abscess (S. aureus/MRSA, Streptococcus anginosus, anaerobes), or (3) Intense alpha-adrenergic end-artery vasospasm and dry gangrene of the glans and penile shaft.',
    pathophysiologyEs:
      'La punción directa de la vena dorsal del pene o la inyección intracavernosa/intraarterial de cocaína, metanfetamina, comprimidos triturados o fentanilo con xilacina provoca: (1) Tromboflebitis supurativa de la vena dorsal (Mondor séptico), (2) Absceso de cuerpos cavernosos (S. aureus/MRSA, S. anginosus, anaerobios), o (3) Vasoespasmo severo de arterias terminales y gangrena seca del glande.',
    diagnosticsEn: [
      'Focused Vascular & Genital Exam: Palpable tender dorsal cord (Mondor thrombophlebitis), unilateral/bilateral cavernosal fluctuance or induration, glans pallor/cyanosis, or black dry eschar from xylazine/cocaine.',
      'High-Resolution Penile Duplex Doppler Ultrasound & MRI Pelvis: Differentiates superficial dorsal vein thrombosis from deep intracavernosal abscess, Buck fascia breach, or dorsal artery occlusion.',
      'Blood Cultures x2, STI/HIV/HCV Screen, and Wound/Aspirate Cultures (aerobic, anaerobic, and fungal).'
    ],
    diagnosticsEs: [
      'Examen vascular y genital focalizado: Cordón dorsal palpable y doloroso (tromboflebitis de Mondor), fluctuación o induración cavernosa, palidez/cianosis del glande o escara necrótica por xilacina/cocaína.',
      'Ecografía Doppler Duplex de Pene y RM de Pelvis: Diferencia trombosis de vena dorsal superficial de absceso intracavernoso profundo, ruptura de fascia de Buck u oclusión arterial.',
      'Hemocultivos x2, tamizaje de ITS/VIH/VHC y cultivos de aspirado (aerobios, anaerobios y hongos).'
    ],
    managementEn: [
      'ABSOLUTE ANESTHETIC RULE: Never inject Lidocaine with Epinephrine anywhere on the penis, glans, or scrotal raphe—penile arteries are functional end-arteries and epinephrine causes irreversible gangrene and auto-amputation.',
      'Empiric IV Antimicrobials: IV Vancomycin + Piperacillin-Tazobactam (or Ceftriaxone + Metronidazole) covering MRSA, Streptococci, Gram-negative rods, and anaerobes.',
      'Urology Consultation for Corpora Cavernosa Abscess: Requires image-guided aspiration or surgical incision and drainage (note: open cavernosal drainage carries high risk of subsequent erectile dysfunction and fibrosis; conservative aspiration is preferred when feasible).',
      'Xylazine / Stimulant Penile Eschar Care: Maintain moist enzymatic/autolytic wound care (avoid aggressive sharp debridement of dry non-infected penile eschar if vascular perfusion is borderline; debride urgently if wet gangrene/sepsis develops).',
      'Immediate Addiction Medicine Integration: Dorsal penile vein injection is a clinical marker of extreme venous exhaustion and severe withdrawal avoidance—initiate rapid methadone or buprenorphine stabilization immediately.'
    ],
    managementEs: [
      'REGLA ANESTÉSica ABSOLUTA: Nunca inyectar Lidocaína con Epinefrina en el pene o glande; las arterias peneanas son arterias terminales y la epinefrina causa gangrena irreversible.',
      'Antimicrobianos IV Empíricos: Vancomicina IV + Piperacilina-Tazobactam (o Ceftriaxona + Metronidazol) cubriendo MRSA, estreptococos, bacilos Gram-negativos y anaerobios.',
      'Consulta a Urología por Absceso Cavernoso: Aspiración guiada por ecografía o drenaje quirúrgico.',
      'Cuidado de Escaras por Xilacina/Estimulantes: Desbridamiento autolítico/enzimático húmedo en escaras secas no infectadas; desbridamiento quirúrgico urgente si hay gangrena húmeda o sepsis.',
      'Integración inmediata de Medicina de Adicciones: La inyección en vena dorsal del pene indica agotamiento venoso extremo; iniciar estabilización rápida con metadona o buprenorfina.'
    ],
    harmReductionEn:
      'Recognize genital and dorsal penile vein injection as an emergency indicator of total peripheral vein loss. Offer immediate transition to oral/sublingual MOUD, rectal ("boofing") or intranasal harm-reduction alternatives, and trauma-informed wound care.',
    harmReductionEs:
      'Reconocer la inyección en vena dorsal del pene como indicador de pérdida total de acceso venoso periférico. Ofrecer transición inmediata a TMO oral/sublingual o vías alternas sin agujas (rectal/intranasal).'
  }),

  ketamine_obstructive_uropathy: Object.freeze({
    id: 'ketamine_obstructive_uropathy',
    urgency: 'URGENT',
    badgeEn: 'HYDRONEPHROSIS SCREEN + KETAMINE CESSATION',
    badgeEs: 'TAMIZAJE DE HIDRONEFROSIS + CESE DE KETAMINA',
    titleEn: 'Ketamine & Arylcyclohexylamine Ulcerative Cystitis & Obstructive Uropathy',
    titleEs: 'Cistitis Ulcerativa y Uropatía Obstructiva por Ketamina y Arilciclohexilaminas',
    summaryEn:
      'Severe ulcerative pan-cystitis ("ketamine bladder"), contracted fibrotic bladder (< 50–100 mL capacity), sterile pyuria, gross hematuria, and upper-tract ureteral stricture/hydronephrosis caused by chronic or high-dose Ketamine, 2-FDCK, or Methoxetamine (MXE).',
    summaryEs:
      'Pancistitis ulcerativa severa ("vejiga por ketamina"), vejiga fibrótica contraída (< 50–100 mL de capacidad), piuria estéril, hematuria macroscópica y estenosis ureteral/hidronefrosis por uso crónico o en altas dosis de Ketamina, 2-FDCK o Metoxetamina (MXE).',
    pathophysiologyEn:
      'Urinary excretion of ketamine, norketamine, and hydroxynorketamine directly disrupts urothelial umbrella-cell tight junctions (ZO-1/E-cadherin), allowing hypertonic urine to infiltrate the lamina propria and detrusor muscle. This triggers mast-cell degranulation, neurogenic inflammation, detrusor fibrosis, vesicoureteral reflux (VUR), papillary necrosis, and bilateral ureteral stricture with post-renal acute kidney injury.',
    pathophysiologyEs:
      'La excreción urinaria de ketamina y norketamina destruye las uniones estrechas del urotelio, permitiendo la infiltración de orina hipertónica en la lámina propia y el detrusor. Esto desencadena degranulación de mastocitos, inflamación neurogénica, fibrosis del detrusor, reflujo vesicoureteral (RVU), necrosis papilar y estenosis ureteral con hidronefrosis.',
    diagnosticsEn: [
      'Urinalysis & Urine Culture: Classic triad of severe dysuria/frequency (voiding every 15–30 minutes), gross or microscopic hematuria, and STERILE PYURIA (negative bacterial culture). Do not repeatedly prescribe empiric fluoroquinolones/TMP-SMX for sterile ketamine cystitis!',
      'Renal & Bladder Ultrasound (Mandatory): Evaluate post-void residual, bladder wall thickening (> 3–5 mm) with reduced capacity, and screen for unilateral or bilateral HYDRONEPHROSIS and ureteral dilation.',
      'Serum Creatinine, eGFR, Electrolytes, and Liver Enzymes (screen for concurrent ketamine-induced biliary ductal dilation / cholangiopathy).'
    ],
    diagnosticsEs: [
      'Uroanálisis y Urocultivo: Tríada clásica de disuria/polaquiuria severa (micción cada 15–30 min), hematuria y PIURIA ESTÉRIL (cultivo bacteriano negativo). ¡No recetar antibióticos repetidos ante piuria estéril por ketamina!',
      'Ecografía Renal y Vesical (Obligatoria): Evaluar engrosamiento parietal vesical, baja capacidad y descartar HIDRONEFROSIS uni o bilateral.',
      'Creatinina sérica, TFGe, electrolitos y perfil hepático (descartar colangiopatía biliar coexistente por ketamina).'
    ],
    managementEn: [
      'ABSOLUTE KETAMINE CESSATION: Complete cessation of ketamine/arylcyclohexylamines is the only intervention proven to arrest mucosal ulceration and reverse early hydronephrosis. Break the "Ketamine Bladder Spiral" (where patients escalate ketamine doses to self-medicate excruciating bladder spasms).',
      'Multimodal Bladder-Sparing Analgesia & Antispasmodics: Short-course Phenazopyridine (200 mg PO TID x 2 days; warn of orange urine and avoid in G6PD deficiency or CrCl < 50 mL/min) + Beta-3 Adrenergic Agonist (Mirabegron 25–50 mg daily) or Antimuscarinic (Solifenacin/Oxybutynin) + neuropathic pain support (Gabapentin/Pregabalin).',
      'Urothelial Barrier & Mast-Cell Therapy: Oral Pentosan Polysulfate, Hydroxyzine (antihistamine/mast-cell stabilizer), and Urology referral for intravesical instillations of Hyaluronic Acid / Chondroitin Sulfate or intradetrusor OnabotulinumtoxinA (Botox).',
      'Urgent Urologic Decompression (Ureteral Stenting or Percutaneous Nephrostomy) if hydronephrosis or obstructive AKI is identified on ultrasound.'
    ],
    managementEs: [
      'CESE ABSOLUTO DE KETAMINA: Suspender la ketamina por completo es la única medida que detiene la ulceración mucosa y revierte la hidronefrosis temprana. Romper la "espiral de vejiga por ketamina" (donde el paciente usa más ketamina para aliviar el dolor vesical).',
      'Analgesia Multimodal y Antiespasmódicos: Fenazopiridina por corto plazo (200 mg VO c/8h x 2 días; evitar si TFG < 50 mL/min o déficit de G6PD) + Agonista Beta-3 (Mirabegrón) o Antimuscarínico (Solifenacina/Oxibutinina) + Gabapentina/Pregabalina.',
      'Restauración Urotelial: Pentosano polisulfato oral, Hidroxizina y derivación a Urología para instilación intravesical de Ácido Hialurónico / Condroitín Sulfato o toxina botulínica.',
      'Descompresión Urológica Urgente (Catéter doble J o Nefrostomía Percutánea) si hay hidronefrosis o LRA obstructiva.'
    ],
    harmReductionEn:
      'For people who use ketamine and are not ready for complete abstinence, counsel on aggressive oral hydration (2–3 L water/day to dilute urinary norketamine concentration), spitting out nasal drip ("ketamine drip"), reducing frequency of use, and seeking immediate ultrasound screening at the first sign of pink urine or pelvic pain.',
    harmReductionEs:
      'Si la persona aún no puede suspender la ketamina, recomendar hidratación oral abundante (2–3 L de agua/día para diluir la norketamina urinaria), escupir el goteo retronasal y acudir a ecografía ante el primer signo de sangre en orina o dolor pélvico.'
  }),

  paraphimosis_constriction_trauma: Object.freeze({
    id: 'paraphimosis_constriction_trauma',
    urgency: 'EMERGENCY',
    badgeEn: 'DISTAL GLANS ISCHEMIA — IMMEDIATE REDUCTION / RING REMOVAL',
    badgeEs: 'ISQUEMIA DISTAL DEL GLANDE — REDUCCIÓN / CORTE DE ANILLO INMEDIATO',
    titleEn: 'Paraphimosis, Entrapped Penile Constriction Rings & Traumatic Catheter Injury',
    titleEs: 'Parafimosis, Anillos de Constricción Peneana Atrapados y Trauma Uretral por Sonda',
    summaryEn:
      'Distal penile venous/lymphatic congestion progressing to arterial strangulation and glans necrosis caused by (1) Paraphimosis (retracted foreskin trapped behind the coronal sulcus), (2) Entrapped metal/silicone penile constriction rings after prolonged stimulant/chemsex use, or (3) Traumatic Foley balloon inflation inside the urethra.',
    summaryEs:
      'Congestión venosa y linfática distal que progresa a estrangulación arterial y necrosis del glande por (1) Parafimosis (prepucio retraído atrapado detrás del surco coronal), (2) Anillos metálicos/silicona atrapados tras sesiones prolongadas de chemsex/estimulantes, o (3) Inflado traumático del balón de sonda Foley en la uretra.',
    pathophysiologyEn:
      'A tight phimotic band or rigid constriction ring around the penile shaft or base obstructs low-pressure venous and lymphatic return first, causing massive distal preputial and glans edema. As tissue pressure exceeds arterial perfusion pressure, ischemic necrosis of the glans and urethra ensues within hours.',
    pathophysiologyEs:
      'Una banda fimótica estrecha o un anillo rígido en la base del pene obstruye primero el retorno venoso y linfático de baja presión, causando edema distal masivo. Cuando la presión tisular supera la perfusión arterial, sobreviene necrosis isquémica del glande y la uretra en pocas horas.',
    diagnosticsEn: [
      'Physical Exam: Circumferential constricting band at the coronal sulcus (paraphimosis) or base of penis/scrotum (metal/plastic ring) with engorged, edematous, violaceous, or insensate distal glans.',
      'Assess Urethral Integrity & Voiding Status: Look for blood at the urethral meatus (suspect urethral tear or intra-urethral Foley balloon inflation) and perform bedside bladder ultrasound for concurrent acute urinary retention.',
      'Check Distal Capillary Refill & Doppler Arterial Signal of the glans penis.'
    ],
    diagnosticsEs: [
      'Examen físico: Banda constrictiva circunferencial en el surco coronal (parafimosis) o en la base del pene/escroto (anillo metálico/plástico) con glande distal edematoso, violáceo o insensible.',
      'Evaluar integridad uretral y micción: Buscar uretrorragia (sangre en el meato uretral por inflado intrauretral del balón de Foley) y realizar ecografía vesical.',
      'Verificar llenado capilar distal y señal Doppler arterial en el glande.'
    ],
    managementEn: [
      'Paraphimosis Reduction Protocol: (1) Dorsal penile nerve block using 1% Lidocaine WITHOUT epinephrine; (2) Osmotic Edema Reduction: Wrap the edematous foreskin/glans in gauze soaked with 50% Dextrose (D50W) or apply granulated sugar / iced glove compression for 15–20 minutes; (3) Manual Reduction: Place both thumbs on the glans pushing proximally while pulling the foreskin distally over the corona; (4) Emergent Dorsal Slit of the constricting band (or Dundee multiple 25G needle puncture technique) if manual reduction fails.',
      'Entrapped Penile Constriction Ring Protocol: Remove silicone/rubber rings immediately with surgical shears. For thick steel/titanium rings: Attempt the Modified String Compression Technique (lubricate + wrap umbilical tape/0-silk tightly from distal to proximal + pass proximal end under the ring to unwind, aided by 19G aspiration of edematous blood). If unsuccessful, cut the ring using a Ring Cutter, Diamond-Tipped Dental Drill, or Pneumatic/Orthopedic Cutter with a protective malleable retractor blade placed under the ring and CONTINUOUS COLD SALINE IRRIGATION to prevent severe thermal burns to the penis!',
      'Traumatic Intra-Urethral Foley Balloon Inflation: Immediately deflate the balloon and remove the catheter. If blood is present at the meatus or subsequent catheter passage meets resistance, perform Retrograde Urethrography (RUG) or obtain Urology consultation for flexible cystoscopic catheter placement or suprapubic cystostomy.'
    ],
    managementEs: [
      'Protocolo de Reducción de Parafimosis: (1) Bloqueo dorsal del pene con Lidocaína al 1% SIN epinefrina; (2) Reducción Osmótica del Edema: Envolver el prepucio edematoso con gasa empapada en Dextrosa al 50% (D50W) o azúcar granulada durante 15–20 min; (3) Reducción Manual: Presionar el glande proximalmente con ambos pulgares mientras se tracciona el prepucio distalmente; (4) Incisión Dorsal de emergencia de la banda constrictiva si falla la reducción manual.',
      'Protocolo para Anillo de Constricción Atrapado: Cortar anillos de silicona/plástico de inmediato. Para anillos de acero/titanio: Intentar la técnica de compresión con hilo/cinta umbilical o cortar el anillo con cortador de anillos / fresa dental de diamante colocando un protector maleable debajo del anillo e IRRIGACIÓN CONTINUA CON SOLUCIÓN SALINA FRÍA para evitar quemaduras térmicas graves.',
      'Inflado Traumático del Balón de Foley en la Uretra: Desinflar el balón de inmediato. Si hay sangre en el meato o resistencia, realizar Uretrografía Retrógrada o interconsulta a Urología para cateterismo bajo visión cistoscópica o talla suprapúbica.'
    ],
    harmReductionEn:
      'Counsel individuals participating in chemsex or using constriction rings with stimulants/PDE5 inhibitors to use quick-release silicone/velcro rings rather than rigid stainless-steel/titanium rings, and never to sleep with a constriction ring in place.',
    harmReductionEs:
      'Aconsejar a quienes practican chemsex o usan anillos de constricción con estimulantes/PDE5i utilizar anillos de silicona o apertura rápida en lugar de anillos rígidos de acero/titanio, y nunca dormir con un anillo colocado.'
  })
});

export const UROLOGY_HARM_REDUCTION_RULES = Object.freeze([
  Object.freeze({
    id: 'priapism_4h_phenylephrine_rule',
    titleEn: 'The 4-Hour Ischemic Priapism Golden Window & Intracavernosal Phenylephrine Rule',
    titleEs: 'La Ventana de Oro de 4 Horas en Priapismo Isquémico y Regla de Fenilefrina Intracavernosa',
    bodyEn:
      'Low-flow (ischemic) priapism > 4 hours is a true compartment syndrome of the corpora cavernosa. Oral pseudoephedrine or terbutaline are ineffective and must never delay dorsal nerve block, lateral 19G cavernosal aspiration (2 or 10 o’clock), and intracavernosal Phenylephrine (100–200 mcg q3–5min).',
    bodyEs:
      'El priapismo isquémico de bajo flujo > 4 horas es un verdadero síndrome compartimental de los cuerpos cavernosos. La pseudoefedrina o terbutalina oral son ineficaces y nunca deben retrasar la aspiración lateral con aguja 19G (2 o 10 horas) y la Fenilefrina intracavernosa (100–200 mcg c/3–5 min).'
  }),
  Object.freeze({
    id: 'penile_block_no_epinephrine_rule',
    titleEn: 'The Absolute Lidocaine-Without-Epinephrine Rule for Penile & Genital Blocks',
    titleEs: 'Regla Absoluta de Lidocaína SIN Epinefrina en Bloqueos Peneanos y Genitales',
    bodyEn:
      'Dorsal penile nerve blocks and ring blocks must ONLY use plain 1% Lidocaine or Bupivacaine WITHOUT Epinephrine. The dorsal and deep arteries of the penis are functional end-arteries; injecting epinephrine (especially alongside cocaine, methamphetamine, or xylazine exposure) precipitates catastrophic penile gangrene.',
    bodyEs:
      'Los bloqueos del nervio dorsal del pene y bloqueos en anillo SOLO deben usar Lidocaína o Bupivacaína al 1% simple SIN Epinefrina. Las arterias peneanas son arterias terminales funcionales; inyectar epinefrina precipita gangrena peneana catastrófica.'
  }),
  Object.freeze({
    id: 'fournier_immediate_or_rule',
    titleEn: 'The Fournier Gangrene Immediate OR & Triple-Antibiotic Rule',
    titleEs: 'Regla de Quirófano Inmediato y Triple Antibiótico en Gangrena de Fournier',
    bodyEn:
      'In perineal/scrotal pain out of proportion, crepitus, or bronze/dusky skin necrosis, CT imaging must never delay surgical debridement in the OR. Start IV Vancomycin + Piperacillin-Tazobactam/Meropenem + Clindamycin (900 mg IV q8h for toxin suppression) immediately.',
    bodyEs:
      'Ante dolor perineal/escrotal desproporcionado, crepitación o necrosis cutánea, la TC nunca debe retrasar el desbridamiento quirúrgico en quirófano. Iniciar Vancomicina IV + Piperacilina-Tazobactam/Meropenem + Clindamicina (900 mg IV c/8h) de inmediato.'
  }),
  Object.freeze({
    id: 'silent_bladder_delirium_rule',
    titleEn: 'The Silent Bladder Distension & Post-Obstructive Diuresis Rule',
    titleEs: 'Regla de Distensión Vesical Silenciosa y Diuresis Post-Obstructiva',
    bodyEn:
      'In sedated or agitated patients exposed to opioids, diphenhydramine/anticholinergics, or stimulants, always perform a bedside bladder ultrasound—acute retention > 800–1,000 mL frequently masquerades as agitated delirium. After decompressing > 1,000 mL, monitor for post-obstructive diuresis (> 200 mL/hr for 2 consecutive hours).',
    bodyEs:
      'En pacientes sedados o agitados expuestos a opioides, difenhidramina/anticolinérgicos o estimulantes, realizar siempre ecografía vesical POCUS: la retención aguda > 800–1,000 mL suele simular un delirio agitado. Tras descomprimir > 1,000 mL, vigilar diuresis post-obstructiva (> 200 mL/h por 2 horas).'
  }),
  Object.freeze({
    id: 'ketamine_bladder_spiral_rule',
    titleEn: 'Breaking the "Ketamine Bladder Spiral" & Avoiding Unnecessary Antibiotics',
    titleEs: 'Romper la "Espiral de Vejiga por Ketamina" y Evitar Antibióticos Innecesarios',
    bodyEn:
      'Ketamine ulcerative cystitis causes severe dysuria, hematuria, and sterile pyuria. Do not prescribe repeated empiric antibiotics for sterile cultures, and never use ketamine to treat ketamine-induced bladder pain; obtain a renal/bladder ultrasound to rule out hydronephrosis and support immediate ketamine cessation.',
    bodyEs:
      'La cistitis ulcerativa por ketamina causa disuria severa, hematuria y piuria estéril. No recetar antibióticos repetidos ante cultivos negativos ni usar ketamina para tratar el dolor vesical; solicitar ecografía renal/vesical para descartar hidronefrosis y apoyar el cese de ketamina.'
  })
]);

const DEFAULT_UROLOGY_STATE = Object.freeze({
  selectedSyndrome: 'ischemic_priapism',
  erectionOver4HoursRigidShaftSoftGlans: false,
  perinealPainCrepitusDishwaterSepsis: false,
  suprapubicDistensionOpioidAnticholinergic: false,
  dorsalPenileVeinInjectionEschar: false,
  ketamineDysuriaHematuriaFlankPain: false,
  retractedForeskinOrConstrictionRingEdema: false,
  bloodAtMeatusOrSpinalBackPain: false,
  clinicalNotes: ''
});

let urologyState = { ...DEFAULT_UROLOGY_STATE };
const listeners = new Set();

export function getUrologyState() {
  return { ...urologyState };
}

export function setUrologyState(patch = {}) {
  urologyState = { ...urologyState, ...patch };
  for (const fn of listeners) {
    fn(getUrologyState());
  }
  return getUrologyState();
}

export function resetUrologyState() {
  urologyState = { ...DEFAULT_UROLOGY_STATE };
  for (const fn of listeners) {
    fn(getUrologyState());
  }
  return getUrologyState();
}

export function subscribeUrologyState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Evaluates urologic & genitourinary emergency risk flags and returns structured clinical guidance.
 */
export function evaluateUrologyRisk(state = urologyState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const profile =
    UROLOGY_SYNDROME_PROFILES[state.selectedSyndrome] ||
    UROLOGY_SYNDROME_PROFILES.ischemic_priapism;

  const redFlags = [];
  let urgency = profile.urgency;

  if (state.erectionOver4HoursRigidShaftSoftGlans) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE PRIAPISMO ISQUÉMICO (> 4h): Cuerpos cavernosos rígidos con glande blando. Realizar bloqueo dorsal del pene (Lidocaína 1% SIN epinefrina), aspiración lateral con aguja 19G (2 o 10 horas) e inyección intracavernosa de Fenilefrina (100–200 mcg c/3–5 min).'
        : 'ISCHEMIC PRIAPISM ALERT (> 4h): Rigid corpora cavernosa with soft glans. Perform dorsal penile nerve block (1% Lidocaine WITHOUT epinephrine), lateral 19G aspiration (2 or 10 o’clock), and intracavernosal Phenylephrine (100–200 mcg q3–5min).'
    );
  }

  if (state.perinealPainCrepitusDishwaterSepsis) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE GANGRENA DE FOURNIER: Dolor perineal/escrotal severo, crepitación subcutánea o necrosis. Activar Urología/Cirugía General para desbridamiento en quirófano STAT + Vancomicina + Piperacilina-Tazobactam/Meropenem + Clindamicina IV.'
        : 'FOURNIER GANGRENE ALERT: Severe perineal/scrotal pain, subcutaneous crepitus, or skin necrosis. Activate Urology/General Surgery for STAT OR debridement + IV Vancomycin + Piperacillin-Tazobactam/Meropenem + IV Clindamycin.'
    );
  }

  if (state.suprapubicDistensionOpioidAnticholinergic) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'RETENCIÓN URINARIA AGUDA (Opioides/Anticolinérgicos/Estimulantes): Realizar ecografía vesical POCUS y descomprimir con sonda Foley (16–18 Fr; considerar punta Coudé + Tamsulosina 0.4 mg). Vigilar diuresis post-obstructiva (> 200 mL/h por 2 h) si se drenan > 1,000 mL.'
        : 'ACUTE URINARY RETENTION (Opioids/Anticholinergics/Stimulants): Perform bedside bladder ultrasound and decompress via Foley catheter (16–18 Fr; consider Coudé tip + Tamsulosin 0.4 mg). Monitor for post-obstructive diuresis (> 200 mL/hr x 2h) if > 1,000 mL drained.'
    );
  }

  if (state.dorsalPenileVeinInjectionEschar) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'COMPLICACIÓN POR INYECCIÓN EN VENA DORSAL DEL PENE / GENITAL: Descartar tromboflebitis supurativa de Mondor, absceso cavernoso o necrosis por xilacina/cocaína. PROHIBIDO usar epinefrina local. Iniciar Vancomicina + Piperacilina-Tazobactam IV y ecografía Doppler.'
        : 'DORSAL PENILE VEIN / GENITAL INJECTION COMPLICATION: Rule out septic Mondor thrombophlebitis, cavernosal abscess, or xylazine/cocaine necrosis. Local epinephrine is STRICTLY CONTRAINDICATED. Start IV Vancomycin + Piperacillin-Tazobactam and Duplex ultrasound.'
    );
  }

  if (state.ketamineDysuriaHematuriaFlankPain) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'CISTITIS ULCERATIVA / UROPATÍA OBSTRUCTIVA POR KETAMINA: Piuria estéril, hematuria y dolor en flanco exigen ecografía renal/vesical obligatoria para descartar hidronefrosis bilateral. Apoyar el cese inmediato de ketamina y analgesia multimodal.'
        : 'KETAMINE ULCERATIVE CYSTITIS / OBSTRUCTIVE UROPATHY: Sterile pyuria, hematuria, and flank pain require mandatory renal/bladder ultrasound to rule out bilateral hydronephrosis. Support immediate ketamine cessation and multimodal bladder analgesia.'
    );
  }

  if (state.retractedForeskinOrConstrictionRingEdema) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ESTRANGULACIÓN DISTAL DEL GLANDE (Parafimosis / Anillo de Constricción): Riesgo de necrosis del glande. En parafimosis: reducción osmótica (Dextrosa 50%) + bloqueo dorsal sin epinefrina + tracción manual o incisión dorsal. En anillo metálico: técnica del hilo o corte con irrigación salina fría continua.'
        : 'DISTAL GLANS STRANGULATION (Paraphimosis / Constriction Ring): High risk of glans necrosis. For paraphimosis: osmotic reduction (D50W gauze) + dorsal block without epinephrine + manual reduction or dorsal slit. For metal ring: string technique or ring cutter with continuous cold saline irrigation.'
    );
  }

  if (state.bloodAtMeatusOrSpinalBackPain) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA NEURO-UROLÓGICA / TRAUMA URETRAL: Sangre en el meato uretral contraindica forzar sonda Foley (realizar Uretrografía Retrógrada). Retención urinaria + dolor dorsal o anestesia en silla de montar en PID exige RM espinal STAT para descartar Absceso Epidural Espinal / Cola de Caballo.'
        : 'NEURO-UROLOGIC / URETHRAL TRAUMA ALERT: Blood at the urethral meatus contraindicates blind Foley passage (obtain Retrograde Urethrogram). New urinary retention + back pain or saddle anesthesia in PWID requires STAT Spine MRI to rule out Spinal Epidural Abscess / Cauda Equina.'
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

/**
 * Generates a zero-PII structured SBAR clinical handoff string for Urologic & Genitourinary Emergencies.
 */
export function formatUrologySbarText(state = urologyState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const evalResult = evaluateUrologyRisk(state, lang);

  const lines = [];
  lines.push(
    isEs
      ? '=== ENTREGA CLÍNICA SBAR: URGENCIAS UROLÓGICAS Y GENITOURINARIAS (CERO-PII) ==='
      : '=== SBAR CLINICAL HANDOFF: UROLOGIC & GENITOURINARY EMERGENCIES (ZERO-PII) ==='
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
        ? 'ALERTAS ROJAS ACTIVAS EN EL PACIENTE:'
        : 'ACTIVE PATIENT RED-FLAG ALERTS:'
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
      ? 'RECOMENDACIÓN Y PROTOCOLO DE MANEJO AGUDO:'
      : 'RECOMMENDATION & ACUTE MANAGEMENT PROTOCOL:'
  );
  for (const m of evalResult.management) {
    lines.push(`  * ${m}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'REDUCCIÓN DE DAÑOS Y SEGURIDAD ANESTÉSICA:'
      : 'HARM REDUCTION & ANESTHETIC SAFETY:'
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

/**
 * Renders the interactive Urologic & Genitourinary Emergencies Navigator view (#/urology-care).
 */
export function urologyCareView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const root = el('section', {
    className: 'view-section urology-care-view',
    attrs: {
      'aria-labelledby': 'urology-care-heading',
      'data-view': 'urology-care'
    }
  });

  // Header Banner
  const header = el('header', { className: 'view-header urology-header' });
  const kicker = el(
    'span',
    { className: 'section-kicker' },
    t(
      'urology.kicker',
      isEs
        ? 'Urología Aguda, Toxicología Genitourinaria y Reducción de Daños'
        : 'Acute Urology, Genitourinary Toxicology & Harm Reduction'
    )
  );
  const title = el(
    'h1',
    { id: 'urology-care-heading', className: 'view-title' },
    t(
      'urology.title',
      isEs
        ? 'Navegador de Urgencias Urológicas, Priapismo Isquémico, Gangrena de Fournier y Uropatía por Ketamina'
        : 'Urologic & Genitourinary Emergencies, Ischemic Priapism, Fournier Gangrene & Ketamine Uropathy Navigator'
    )
  );
  const subtitle = el(
    'p',
    { className: 'view-subtitle' },
    t(
      'urology.subtitle',
      isEs
        ? 'Soporte clínico cero-PII en memoria RAM para priapismo de bajo flujo por trazodona/cocaína/antipsicóticos, gangrena de Fournier perineal, retención urinaria aguda por opioides/anticolinérgicos, trombosis de vena dorsal del pene, cistitis ulcerativa por ketamina y parafimosis/anillos de constricción.'
        : 'Zero-PII, in-RAM clinical decision support for drug-induced low-flow ischemic priapism (trazodone, cocaine, antipsychotics), Fournier gangrene, opioid/anticholinergic acute urinary retention, dorsal penile vein thrombosis, ketamine ulcerative cystitis, and paraphimosis/constriction rings.'
    )
  );
  header.append(kicker, title, subtitle);
  root.appendChild(header);

  // Privacy & Clinical Safety Alert
  const safetyBanner = el('div', {
    className: 'clinical-alert-banner urology-safety-banner',
    attrs: { role: 'region', 'aria-label': isEs ? 'Seguridad Urológica Crítica' : 'Critical Urologic Safety' }
  });
  safetyBanner.append(
    el(
      'strong',
      {},
      isEs
        ? 'Reglas Cardinales de Seguridad Urológica: '
        : 'Cardinal Urologic Safety Rules: '
    ),
    el(
      'span',
      {},
      isEs
        ? '(1) En bloqueos del nervio dorsal del pene o en anillo, usar SIEMPRE Lidocaína al 1% SIN epinefrina (la epinefrina causa gangrena peneana); (2) El priapismo isquémico > 4h exige aspiración con aguja 19G (2 o 10 horas) y Fenilefrina intracavernosa; (3) Ante crepitación perineal/escrotal (Fournier), la TC nunca debe retrasar el quirófano.'
        : '(1) For dorsal penile nerve or ring blocks, ALWAYS use plain 1% Lidocaine WITHOUT epinephrine (epinephrine causes catastrophic penile gangrene); (2) Ischemic priapism > 4h requires 19G lateral aspiration (2 or 10 o’clock) and intracavernosal Phenylephrine; (3) In perineal/scrotal crepitus (Fournier gangrene), CT imaging must never delay OR debridement.'
    )
  );
  root.appendChild(safetyBanner);

  // Interactive Syndrome Selector
  const selectorSection = el('section', {
    className: 'urology-selector-section card',
    attrs: { 'aria-labelledby': 'urology-selector-heading' }
  });
  selectorSection.appendChild(
    el(
      'h2',
      { id: 'urology-selector-heading', className: 'card-title' },
      t(
        'urology.selectorTitle',
        isEs
          ? '1. Seleccione el Síndrome Urológico o Genitourinario Primario'
          : '1. Select Primary Urologic or Genitourinary Syndrome'
      )
    )
  );

  const syndromeGrid = el('div', {
    className: 'urology-syndrome-grid',
    attrs: { role: 'group', 'aria-label': isEs ? 'Selector de síndrome urológico' : 'Urologic syndrome selector' }
  });

  const detailContainer = el('div', {
    className: 'urology-detail-container',
    attrs: { 'aria-live': 'polite' }
  });

  const sbarPre = el('pre', {
    className: 'sbar-output-pre urology-sbar-pre',
    attrs: { tabindex: '0', 'aria-label': isEs ? 'Entrega clínica SBAR' : 'SBAR clinical handoff' }
  });

  function renderSyndromeButtons() {
    clear(syndromeGrid);
    const current = getUrologyState();
    for (const profile of Object.values(UROLOGY_SYNDROME_PROFILES)) {
      const isSelected = current.selectedSyndrome === profile.id;
      const btn = makeButton(
        isEs ? profile.titleEs : profile.titleEn,
        () => {
          setUrologyState({ selectedSyndrome: profile.id });
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

  // Red-Flag Triage Checkboxes
  const flagsSection = el('section', {
    className: 'urology-flags-section card',
    attrs: { 'aria-labelledby': 'urology-flags-heading' }
  });
  flagsSection.appendChild(
    el(
      'h2',
      { id: 'urology-flags-heading', className: 'card-title' },
      t(
        'urology.flagsTitle',
        isEs
          ? '2. Verificador de Signos de Alarma Urológica y Neuro-Urológica'
          : '2. Urologic & Neuro-Urologic Red-Flag Triage Checker'
      )
    )
  );

  const flagDefinitions = [
    {
      key: 'erectionOver4HoursRigidShaftSoftGlans',
      labelEn:
        'Erection > 4 hours with rigid, painful corpora cavernosa and a SOFT glans penis (Trazodone, Cocaine, Antipsychotic, or PDE5i exposure)',
      labelEs:
        'Erección > 4 horas con cuerpos cavernosos rígidos y dolorosos y glande BLANDO (exposición a Trazodona, Cocaína, Antipsicóticos o PDE5i)'
    },
    {
      key: 'perinealPainCrepitusDishwaterSepsis',
      labelEn:
        'Severe perineal/scrotal/labial pain out of proportion, subcutaneous crepitus ("Rice Krispies" gas), bronze/necrotic skin, or foul purulence (Fournier Gangrene)',
      labelEs:
        'Dolor perineal/escrotal/labial desproporcionado, crepitación subcutánea (gas), piel bronceada/necrótica o exudado fétido (Gangrena de Fournier)'
    },
    {
      key: 'suprapubicDistensionOpioidAnticholinergic',
      labelEn:
        'Inability to void, suprapubic fullness, or unexplained agitated delirium in a patient exposed to Opioids, Diphenhydramine/Anticholinergics, or Stimulants',
      labelEs:
        'Incapacidad para orinar, globo vesical o delirio agitado inexplicable en paciente expuesto a Opioides, Difenhidramina/Anticolinérgicos o Estimulantes'
    },
    {
      key: 'dorsalPenileVeinInjectionEschar',
      labelEn:
        'Recent injection into the dorsal vein of the penis, scrotum, or groin with painful dorsal cord, cavernosal swelling, or Xylazine/Cocaine eschar',
      labelEs:
        'Inyección reciente en vena dorsal del pene, escroto o ingle con cordón dorsal doloroso, edema cavernoso o escara por Xilacina/Cocaína'
    },
    {
      key: 'ketamineDysuriaHematuriaFlankPain',
      labelEn:
        'Severe dysuria, urinary frequency (q15–30min), gross hematuria, sterile pyuria, or flank pain with Ketamine / Arylcyclohexylamine use',
      labelEs:
        'Disuria severa, polaquiuria (c/15–30 min), hematuria macroscópica, piuria estéril o dolor lumbar con uso de Ketamina / Arilciclohexilaminas'
    },
    {
      key: 'retractedForeskinOrConstrictionRingEdema',
      labelEn:
        'Unreduced retracted foreskin (Paraphimosis) or entrapped metal/silicone penile constriction ring with engorged, violaceous distal glans',
      labelEs:
        'Prepucio retraído no reducido (Parafimosis) o anillo de constricción peneana atrapado con edema y cianosis distal del glande'
    },
    {
      key: 'bloodAtMeatusOrSpinalBackPain',
      labelEn:
        'Blood at the urethral meatus after catheter attempt OR urinary retention paired with midline back pain / saddle anesthesia (Cauda Equina / Spinal Epidural Abscess)',
      labelEs:
        'Sangre en el meato uretral tras intento de sonda O retención urinaria con dolor dorsal / anestesia en silla de montar (Cola de Caballo / Absceso Epidural)'
    }
  ];

  const flagsList = el('div', { className: 'urology-flags-list' });
  const checkboxRefs = new Map();

  for (const def of flagDefinitions) {
    const row = el('label', { className: 'checkbox-row urology-flag-row' });
    const cb = el('input', {
      attrs: {
        type: 'checkbox',
        'data-flag-key': def.key
      }
    });
    cb.checked = Boolean(urologyState[def.key]);
    cb.addEventListener('change', () => {
      setUrologyState({ [def.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(def.key, cb);
    row.append(cb, el('span', {}, isEs ? def.labelEs : def.labelEn));
    flagsList.appendChild(row);
  }
  flagsSection.appendChild(flagsList);

  function renderDetailAndSbar() {
    clear(detailContainer);
    const evalResult = evaluateUrologyRisk(getUrologyState());

    const card = el('article', {
      className: `card urology-profile-card urgency-${evalResult.urgency.toLowerCase()}`
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
        className: 'urology-redflag-box',
        attrs: { role: 'alert' }
      });
      alertBox.appendChild(
        el(
          'h4',
          {},
          isEs
            ? 'Alertas Clínicas Inmediatas Activadas'
            : 'Immediate Clinical Red-Flag Alerts Activated'
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
      el('h4', {}, isEs ? 'Fisiopatología y Mecanismo' : 'Pathophysiology & Mechanism'),
      el('p', {}, evalResult.pathophysiology)
    );
    card.appendChild(pathoSection);

    const diagSection = el('div', { className: 'profile-subsection' });
    diagSection.appendChild(
      el('h4', {}, isEs ? 'Evaluación Diagnóstica y POCUS' : 'Diagnostic Workup & POCUS')
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
          ? 'Protocolo de Manejo Agudo en Urgencias / Quirófano'
          : 'Acute Bedside & Operating Room Management Protocol'
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
          ? 'Reducción de Daños y Prevención de Recurrencias'
          : 'Harm Reduction & Recurrence Prevention'
      ),
      el('p', {}, evalResult.harmReduction)
    );
    card.appendChild(hrSection);

    detailContainer.appendChild(card);
    sbarPre.textContent = formatUrologySbarText(getUrologyState());
  }

  selectorSection.appendChild(syndromeGrid);
  root.appendChild(selectorSection);
  root.appendChild(flagsSection);
  root.appendChild(detailContainer);

  // Cardinal Urologic Harm Reduction Rules Section
  const rulesSection = el('section', {
    className: 'urology-rules-section card',
    attrs: { 'aria-labelledby': 'urology-rules-heading' }
  });
  rulesSection.appendChild(
    el(
      'h2',
      { id: 'urology-rules-heading', className: 'card-title' },
      t(
        'urology.rulesTitle',
        isEs
          ? '3. Reglas Cardinales de Urología Aguda y Reducción de Daños'
          : '3. Cardinal Rules of Acute Urology & Genitourinary Harm Reduction'
      )
    )
  );
  const rulesGrid = el('div', { className: 'urology-rules-grid' });
  for (const rule of UROLOGY_HARM_REDUCTION_RULES) {
    const rCard = el('article', { className: 'urology-rule-card' });
    rCard.append(
      el('h3', { className: 'rule-title' }, isEs ? rule.titleEs : rule.titleEn),
      el('p', { className: 'rule-body' }, isEs ? rule.bodyEs : rule.bodyEn)
    );
    rulesGrid.appendChild(rCard);
  }
  rulesSection.appendChild(rulesGrid);
  root.appendChild(rulesSection);

  // SBAR Handoff Generator Section
  const sbarSection = el('section', {
    className: 'urology-sbar-section card',
    attrs: { 'aria-labelledby': 'urology-sbar-heading' }
  });
  sbarSection.appendChild(
    el(
      'h2',
      { id: 'urology-sbar-heading', className: 'card-title' },
      t(
        'urology.sbarTitle',
        isEs
          ? '4. Generador de Entrega Clínica SBAR (Cero-PII en RAM)'
          : '4. Zero-PII SBAR Clinical Handoff Generator (In-RAM)'
      )
    )
  );

  const notesLabel = el(
    'label',
    { className: 'field-label', attrs: { for: 'urology-clinical-notes' } },
    isEs
      ? 'Notas clínicas contextuales (solo en RAM, sin datos identificables):'
      : 'Contextual clinical notes (in-RAM only, zero identifiable data):'
  );
  const notesInput = el('textarea', {
    id: 'urology-clinical-notes',
    className: 'form-textarea urology-notes-input',
    attrs: {
      rows: '2',
      placeholder: isEs
        ? 'Ej. Duración 5 horas post-trazodona 100 mg, gasometría cavernosa pH 7.18, volumen vesical POCUS 950 mL...'
        : 'e.g., 5h duration post-trazodone 100 mg, cavernosal blood gas pH 7.18, POCUS bladder volume 950 mL...'
    }
  });
  notesInput.value = urologyState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setUrologyState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatUrologySbarText(getUrologyState());
  });

  const copyStatus = el('span', {
    className: 'copy-status-msg',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });

  const copyBtn = makeButton(
    isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard',
    async () => {
      const txt = formatUrologySbarText(getUrologyState());
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
      resetUrologyState();
      notesInput.value = '';
      copyStatus.textContent = '';
      for (const [k, cb] of checkboxRefs.entries()) {
        cb.checked = Boolean(urologyState[k]);
      }
      renderSyndromeButtons();
      renderDetailAndSbar();
    },
    { className: 'button secondary reset-urology-btn' }
  );

  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);

  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  // Cross-links to Related Clinical Navigators
  const linksSection = el('nav', {
    className: 'urology-links-section card',
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
      isEs ? 'Ketamina y Uropatía (#/ketamine-care)' : 'Ketamine & Uropathy (#/ketamine-care)',
      '#/ketamine-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Salud Sexual, Doxy-PEP y PrEP (#/sexual-health)' : 'Sexual Health, Doxy-PEP & PrEP (#/sexual-health)',
      '#/sexual-health',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Salud Renal y Rabdomiólisis (#/renal-care)' : 'Renal Care & Rhabdomyolysis (#/renal-care)',
      '#/renal-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Ortopedia y Fascitis Necrosante (#/orthopedic-care)' : 'Orthopedics & Necrotizing Fasciitis (#/orthopedic-care)',
      '#/orthopedic-care',
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
